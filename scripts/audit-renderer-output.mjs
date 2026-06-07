import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  NoToneMapping,
  REVISION,
  SRGBColorSpace,
  Texture,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-renderer-output-audit");
const bundlePath = process.env.SOURCE_BUNDLE || "legacy-mirror/public/assets/bundle.250f01b7.js";
const rebuildWebglPath = process.env.REBUILD_WEBGL || "src/client/webgl.ts";

function extractTemplate(bundle, name, terminator) {
  const start = bundle.indexOf(`${name}=\``);
  if (start < 0) throw new Error(`Unable to find source template ${name}`);
  const bodyStart = start + name.length + 2;
  const end = bundle.indexOf(terminator, bodyStart);
  if (end < 0) throw new Error(`Unable to find end of source template ${name}`);
  return bundle.slice(bodyStart, end);
}

function extractConstTemplate(source, name) {
  const start = source.indexOf(`const ${name} = \``);
  if (start < 0) throw new Error(`Unable to find rebuild template ${name}`);
  const bodyStart = start + `const ${name} = \``.length;
  const end = source.indexOf("\n`;", bodyStart);
  if (end < 0) throw new Error(`Unable to find end of rebuild template ${name}`);
  return source.slice(bodyStart, end);
}

function extractAround(bundle, needle, before = 400, after = 1400) {
  const index = bundle.indexOf(needle);
  if (index < 0) return null;
  return {
    needle,
    index,
    text: bundle.slice(Math.max(0, index - before), index + after),
  };
}

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

function checks(text, needles) {
  return Object.fromEntries(needles.map((needle) => [needle, text.includes(needle)]));
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function lineNumber(text, index) {
  if (index < 0) return null;
  return text.slice(0, index).split("\n").length;
}

function regexAnchorOrder(text, anchors) {
  return anchors.map(({ label, pattern }) => {
    const match = pattern.exec(text);
    pattern.lastIndex = 0;
    return {
      anchor: label,
      line: lineNumber(text, match ? match.index : -1),
    };
  });
}

function orderSignature(order) {
  return order
    .filter((entry) => entry.line !== null)
    .toSorted((a, b) => a.line - b.line)
    .map((entry) => entry.anchor);
}

function compareSignatures(source, rebuild) {
  const maxLength = Math.max(source.length, rebuild.length);
  const mismatches = [];
  for (let index = 0; index < maxLength; index += 1) {
    if (source[index] !== rebuild[index]) {
      mismatches.push({
        index,
        source: source[index] || null,
        rebuild: rebuild[index] || null,
      });
    }
  }
  return mismatches;
}

function targetSnapshot(target) {
  return {
    texture: {
      colorSpace: target.texture.colorSpace,
      type: target.texture.type,
      format: target.texture.format,
      minFilter: target.texture.minFilter,
      magFilter: target.texture.magFilter,
      generateMipmaps: target.texture.generateMipmaps,
    },
    depthBuffer: target.depthBuffer,
    stencilBuffer: target.stencilBuffer,
  };
}

mkdirSync(outDir, { recursive: true });

const bundle = readFileSync(bundlePath, "utf8");
const rebuildWebgl = readFileSync(rebuildWebglPath, "utf8");
const sourceCA = extractTemplate(bundle, "CA", "`,RA=");
const sourceA1 = extractTemplate(bundle, "A1", "`;class C1");
const rebuildA1 = extractConstTemplate(rebuildWebgl, "homePreCompositeFragment");
const sourcePo = extractTemplate(bundle, "Po", "`,CA=");
const sourceBlendLighten = extractTemplate(bundle, "fg", "`,yA=");
const sourceBlendMultiply = extractTemplate(bundle, "hg", "`,dg=");
const sourceLu = extractAround(bundle, "class Lu", 200, 5200);
const sourceLo = extractAround(bundle, "class Lo", 200, 2600);
const sourceOA = extractAround(bundle, "class OA extends", 320, 1300);
const rendererOutputRefs = [
  extractAround(bundle, "outputColorSpace", 180, 700),
  extractAround(bundle, "setOutputColorSpace", 180, 700),
  extractAround(bundle, ".outputColorSpace=", 180, 700),
].filter(Boolean);

writeFileSync(path.join(outDir, "source-CA.glsl"), sourceCA);
writeFileSync(path.join(outDir, "source-A1.glsl"), sourceA1);
writeFileSync(path.join(outDir, "rebuild-homePreComposite.glsl"), rebuildA1);
writeFileSync(path.join(outDir, "source-Po-blend.glsl"), sourcePo);
writeFileSync(path.join(outDir, "source-fg-blend-lighten.glsl"), sourceBlendLighten);
writeFileSync(path.join(outDir, "source-hg-blend-multiply.glsl"), sourceBlendMultiply);

const blendModeMatches = [...sourcePo.matchAll(/mode == (\d+)\)\s*\{\s*return\s+([A-Za-z0-9_]+)/g)].map((match) => ({
  mode: Number(match[1]),
  functionName: match[2],
}));

const a1SemanticAnchors = [
  { label: "perlin uv", pattern: /vec2\s+perlinUv\s*=/ },
  { label: "perlin sample", pattern: /texture(?:2D)?\(\s*tPerlin/ },
  { label: "perlin contrast", pattern: /perlin\.rgb\s*=\s*contrast/ },
  { label: "fluid sample", pattern: /texture(?:2D)?\(\s*tFluid/ },
  { label: "fluid uv", pattern: /fluidUv\s*=/ },
  { label: "perlin offset", pattern: /uPerlin\s*>\s*0\.0/ },
  { label: "mouse sample", pattern: /texture(?:2D)?\(\s*tMouseSim/ },
  { label: "perlin vignette", pattern: /perlinVignette\s*=/ },
  { label: "displacement vignette", pattern: /displacementVignette\s*=/ },
  { label: "work displaced sample", pattern: /sceneDisplaced\s*=\s*rgbshift\(\s*tWork/ },
  { label: "work scene sample", pattern: /scene\s*=\s*rgbshift\(\s*tWork/ },
  { label: "scene mix", pattern: /mix\(\s*scene\.rgb\s*,\s*sceneDisplaced\.rgb/ },
  { label: "background mix", pattern: /mix\(\s*uBgColor\s*,\s*(?:sceneMixed\.rgb|color)\s*,\s*1\./ },
  { label: "mouse add", pattern: /\+=\s*mouseSim\.rgb\s*\*\s*(?:\.065|0\.065|65e-3)/ },
  { label: "perlin brighten", pattern: /mix\([^;]*\*\s*5\./ },
  { label: "perlin blend add", pattern: /(?:blend|sourceBlend)\(\s*1\s*,/ },
  { label: "bloom branch", pattern: /if\s*\(\s*boolBloom\s*\)/ },
  { label: "contrast", pattern: /=\s*contrast\([^;]*uContrast/ },
  { label: "contrast multiply", pattern: /\*=\s*uContrast/ },
  { label: "saturation", pattern: /=\s*saturation\([^;]*1\.15/ },
  { label: "background lighten", pattern: /(?:blend|sourceBlend)\(\s*11\s*,/ },
  { label: "media sample", pattern: /media\s*=\s*rgbshift\(\s*tMedia/ },
  { label: "media mix", pattern: /mix\([^;]*media\.rgb[^;]*media\.a\s*\*\s*uMediaReveal/ },
  { label: "noise sample", pattern: /texture(?:2D)?\(\s*tNoise/ },
  { label: "noise mix 075", pattern: /mix\([^;]*noise[^;]*\.75/ },
  { label: "noise mix 15", pattern: /mix\([^;]*noise[^;]*1\.5/ },
];
const sourceA1Order = regexAnchorOrder(sourceA1, a1SemanticAnchors);
const rebuildA1Order = regexAnchorOrder(rebuildA1, a1SemanticAnchors);
const sourceA1Signature = orderSignature(sourceA1Order);
const rebuildA1Signature = orderSignature(rebuildA1Order);
const sourceA1FlowSignature = sourceA1Signature.filter((anchor) => anchor !== "noise sample");
const rebuildA1FlowSignature = rebuildA1Signature.filter((anchor) => anchor !== "noise sample");

const localDefaultTarget = new WebGLRenderTarget(1, 1);
const localSourceTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
const localTexture = new Texture();

const summary = {
  bundle: {
    path: bundlePath,
    threeRevision: bundle.match(/\/\*\!?\s?\*? three\.module\.js.*?r(\d+)/i)?.[1] || bundle.match(/const pu="([^"]+)"/)?.[1] || null,
    counts: {
      outputColorSpace: countMatches(bundle, /outputColorSpace/g),
      setOutputColorSpace: countMatches(bundle, /setOutputColorSpace/g),
      explicitRendererOutputAssignment: countMatches(bundle, /\.outputColorSpace\s*=/g),
      webGLRenderTargetCtor: countMatches(bundle, /new Dn\(/g),
      renderTargetClone: countMatches(bundle, /\.clone\(\)/g),
    },
  },
  sourceShaders: {
    blendTable: {
      length: sourcePo.length,
      modeMap: Object.fromEntries(blendModeMatches.map((entry) => [entry.mode, entry.functionName])),
      checks: checks(sourcePo, [
        "vec3 blend(int mode, vec3 base, vec3 blend, float opacity)",
        "return blendLighten(base, blend, opacity)",
        "return blendMultiply(base, blend, opacity)",
      ]),
    },
    blendFunctions: {
      lighten: {
        length: sourceBlendLighten.length,
        checks: checks(sourceBlendLighten, [
          "return max(blend,base)",
          "return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b))",
          "return (blendLighten(base, blend) * opacity + base * (1.0 - opacity))",
        ]),
      },
      multiply: {
        length: sourceBlendMultiply.length,
        checks: checks(sourceBlendMultiply, [
          "return base*blend",
          "return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity))",
        ]),
      },
    },
    CA: {
      length: sourceCA.length,
      checks: checks(sourceCA, [
        "#include <tonemapping_pars_fragment>",
        "#include <tonemapping_fragment>",
        "rgbshift(tScene, uv, -1., .0015)",
        "mixed.rgb += bloom.rgb",
        "mixed.rgb = blend(15, mixed.rgb, black, uDarken * 2. + mouseSim.r * .25 * uDarken)",
        "mixed.rgb = blend(11, mixed.rgb, black, 1.)",
        "vec3 black = vec3(0.095,0.095,0.095)",
        "FragColor = vec4(mixed.rgb, 1.)",
      ]),
    },
    A1: {
      length: sourceA1.length,
      checks: checks(sourceA1, [
        "uniform sampler2D tWork",
        "uniform sampler2D tMedia",
        "uniform float uMediaReveal",
        "uniform float uContrast",
        "FragColor",
        "#include <tonemapping_fragment>",
      ]),
      order: sourceA1Order,
    },
    rebuildA1: {
      length: rebuildA1.length,
      checks: checks(rebuildA1, [
        "uniform sampler2D tWork",
        "uniform sampler2D tMedia",
        "uniform float uMediaReveal",
        "uniform float uContrast",
        "gl_FragColor",
        "sourceBlend(1",
        "sourceBlend(11",
        "color *= uContrast",
        "mix(color * noise.rgb, color, 0.75)",
        "mix(color * noise.rgb, color, 1.5)",
      ]),
      order: rebuildA1Order,
      orderMatchesSource: JSON.stringify(sourceA1Signature) === JSON.stringify(rebuildA1Signature),
      flowOrderMatchesSource: JSON.stringify(sourceA1FlowSignature) === JSON.stringify(rebuildA1FlowSignature),
      orderMismatches: compareSignatures(sourceA1Signature, rebuildA1Signature),
      flowOrderMismatches: compareSignatures(sourceA1FlowSignature, rebuildA1FlowSignature),
      onlySourceOrderAnchors: sourceA1Signature.filter((anchor) => !rebuildA1Signature.includes(anchor)),
      onlyRebuildOrderAnchors: rebuildA1Signature.filter((anchor) => !sourceA1Signature.includes(anchor)),
      inertSourceComputations: {
        displacementUv: /vec2\s+displacementUv\s*=/.test(sourceA1) && !/displacementUv/.test(rebuildA1),
        vignetteF: /float\s+vignetteF\s*=/.test(sourceA1) && !/vignetteF/.test(rebuildA1),
        noiseSampleRelocated: JSON.stringify(sourceA1Signature) !== JSON.stringify(rebuildA1Signature)
          && sourceA1Signature.includes("noise sample")
          && rebuildA1Signature.includes("noise sample"),
      },
    },
  },
  sourceManagers: {
    Lu: sourceLu && {
      index: sourceLu.index,
      checks: checks(sourceLu.text, [
        "this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1})",
        "this.renderTargetB=this.renderTargetA.clone()",
        "this.renderTargetBright=this.renderTargetA.clone()",
        "this.renderTargetComposite=this.renderTargetA.clone()",
        "this.renderTargetA.depthBuffer=!0",
        "this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t))",
        "e=Fa(e)/4,t=Fa(t)/4",
        "this.settings.fluid.enabled&&this.fluidSimulation&&this.fluidSimulation.onResize(e/3,t/3)",
      ]),
      excerpt: compact(sourceLu.text),
    },
    Lo: sourceLo && {
      index: sourceLo.index,
      checks: checks(sourceLo.text, [
        "this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1})",
        "this.renderTargetComposite=this.renderTargetA.clone()",
        "this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t))",
      ]),
      excerpt: compact(sourceLo.text),
    },
    OA: sourceOA && {
      index: sourceOA.index,
      checks: checks(sourceOA.text, [
        "toneMapped:!1",
        "fragmentShader:CA",
        "blending:ot",
        "transparent:!0",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      excerpt: compact(sourceOA.text),
    },
  },
  rendererOutputRefs: rendererOutputRefs.map((entry) => ({
    needle: entry.needle,
    index: entry.index,
    excerpt: compact(entry.text),
  })),
  localThree: {
    revision: REVISION,
    constants: {
      SRGBColorSpace,
      NoToneMapping,
    },
    defaultTexture: {
      colorSpace: localTexture.colorSpace,
      minFilter: localTexture.minFilter,
      magFilter: localTexture.magFilter,
      generateMipmaps: localTexture.generateMipmaps,
    },
    defaultRenderTarget: targetSnapshot(localDefaultTarget),
    sourceLikeRenderTarget: targetSnapshot(localSourceTarget),
    rendererDefaultProbe: (() => {
      try {
        const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(1, 1) : undefined;
        const renderer = canvas ? new WebGLRenderer({ canvas }) : null;
        return renderer
          ? {
              outputColorSpace: renderer.outputColorSpace,
              toneMapping: renderer.toneMapping,
              autoClear: renderer.autoClear,
            }
          : null;
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    })(),
  },
  files: {
    sourceCA: path.join(outDir, "source-CA.glsl"),
    sourceA1: path.join(outDir, "source-A1.glsl"),
    rebuildA1: path.join(outDir, "rebuild-homePreComposite.glsl"),
    sourceBlendTable: path.join(outDir, "source-Po-blend.glsl"),
    sourceBlendLighten: path.join(outDir, "source-fg-blend-lighten.glsl"),
    sourceBlendMultiply: path.join(outDir, "source-hg-blend-multiply.glsl"),
  },
};

writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

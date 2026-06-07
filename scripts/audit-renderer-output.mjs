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
const sourceC1 = extractAround(bundle, "class C1 extends", 320, 1600);
const rebuildA1 = extractConstTemplate(rebuildWebgl, "homePreCompositeFragment");
const sourcePo = extractTemplate(bundle, "Po", "`,CA=");
const sourceBlendLighten = extractTemplate(bundle, "fg", "`,yA=");
const sourceBlendMultiply = extractTemplate(bundle, "hg", "`,dg=");
const sourceLu = extractAround(bundle, "class Lu", 200, 7200);
const sourceLo = extractAround(bundle, "class Lo", 200, 2600);
const sourceOA = extractAround(bundle, "class OA extends", 320, 1300);
const sourceLA = extractAround(bundle, "class lA extends", 320, 1100);
const sourceW1 = extractAround(bundle, "class W1 extends", 320, 1100);
const sourceSg = extractAround(bundle, "class sg extends", 320, 900);
const sourceRg = extractAround(bundle, "class rg extends", 320, 1100);
const sourceNa = extractAround(bundle, "class Na extends", 420, 900);
const sourceCg = extractAround(bundle, "class cg extends", 320, 1000);
const sourceIg = extractAround(bundle, "class ig extends", 320, 900);
const sourceL1 = extractAround(bundle, "class L1 extends", 320, 1000);
const sourceAg = extractAround(bundle, "class ag", 260, 3200);
const sourceGT = extractAround(bundle, "class GT extends", 320, 1500);
const sourceQT = extractAround(bundle, "class qT extends", 320, 1500);
const sourceJT = extractAround(bundle, "class jT extends", 320, 1100);
const sourceKT = extractAround(bundle, "class KT extends", 320, 1200);
const sourcePressureJT = extractAround(bundle, "class JT extends", 320, 1100);
const sourceMainI1 = extractAround(bundle, "class I1", 200, 7600);
const sourcePe = extractAround(bundle, "class Pe", 200, 1400);
const sourceP1Resize = extractAround(bundle, "resize(e,t,n){super.resize(e,t,Math.min(n,1.5))", 1200, 900);
const sourceP1InitEnv = extractAround(bundle, "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)", 500, 900);
const sourceIuUpdate = extractAround(bundle, "update(e,t,n,i){this.renderManager.update(e,t,n,i),this.cameraController", 240, 700);
const sourceP1Update = extractAround(bundle, "update(e,t,n,i){super.update(e,t,n,i),this.spotLight", 240, 1300);
const sourceThumbW1 = extractAround(bundle, "class w1 extends", 320, 1700);
const sourceH1 = extractAround(bundle, "class h1 extends", 200, 800);
const sourceU1 = extractAround(bundle, "class u1 extends", 400, 1700);
const sourceDu = extractAround(bundle, "class Du extends", 240, 700);
const sourceA1Floor = extractAround(bundle, "class a1 extends", 300, 1400);
const sourceO1FloorMaterial = extractAround(bundle, "class o1 extends", 700, 1600);
const sourceT1FloorBlur = extractAround(bundle, "class t1 extends", 800, 900);
const sourceSkyV1 = extractAround(bundle, "class V1 extends", 1400, 1600);
const sourceSkyZ1 = extractAround(bundle, "class z1 extends", 500, 1000);
const sourceGA = extractAround(bundle, "class GA extends", 200, 5200);
const sourceI1 = extractAround(bundle, "class i1 extends", 200, 4200);
const sourceRenderer = extractAround(bundle, "class qw extends", 200, 1200);
const sourceCanvasManager = extractAround(bundle, "class nD{constructor", 200, 2200);
const sourceTextureManager = extractAround(bundle, "static preloadTextures(){", 120, 900);
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
        "o.setRenderTarget(u),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(c),o.render(a,r)",
        "o.setRenderTarget(f),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(g),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(d[p]),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(l[p]),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(d[0]),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(h),o.render(this.screen,this.screenCamera)",
      ]),
      excerpt: compact(sourceLu.text),
    },
    Lo: sourceLo && {
      index: sourceLo.index,
      checks: checks(sourceLo.text, [
        "this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1})",
        "this.renderTargetComposite=this.renderTargetA.clone()",
        "this.renderTargetComposite=this.renderTargetA.clone(),this.compositeMaterial=new g1",
        "this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t))",
      ]),
      renderTargetDefaults: targetSnapshot(new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false }).clone()),
      excerpt: compact(sourceLo.text),
    },
    OA: sourceOA && {
      index: sourceOA.index,
      checks: checks(sourceOA.text, [
        "class OA extends mt",
        "glslVersion:lt",
        "toneMapped:!1",
        "fragmentShader:CA",
        "blending:ot",
        "transparent:!0",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      excerpt: compact(sourceOA.text),
    },
    C1: sourceC1 && {
      index: sourceC1.index,
      checks: checks(sourceC1.text, [
        "class C1 extends mt",
        "glslVersion:lt",
        "toneMapped:!1",
        "fragmentShader:A1",
        "blending:ot",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      excerpt: compact(sourceC1.text),
    },
    helperMaterialSurfaces: {
      lA: sourceLA && {
        index: sourceLA.index,
        checks: checks(sourceLA.text, [
          "class lA extends mt",
          "glslVersion:lt",
          "fragmentShader:aA",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceLA.text),
      },
      W1: sourceW1 && {
        index: sourceW1.index,
        checks: checks(sourceW1.text, [
          "class W1 extends mt",
          "glslVersion:lt",
          "fragmentShader:G1",
          "transparent:!0",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceW1.text),
      },
      sg: sourceSg && {
        index: sourceSg.index,
        checks: checks(sourceSg.text, [
          "class sg extends mt",
          "glslVersion:lt",
          "fragmentShader:NT",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceSg.text),
      },
      rg: sourceRg && {
        index: sourceRg.index,
        checks: checks(sourceRg.text, [
          "class rg extends mt",
          "glslVersion:lt",
          "fragmentShader:kT",
          "defines:{KERNEL_RADIUS:e,SIGMA:e}",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        kernelConstruction: [...bundle.matchAll(/new rg\(e\[t\]\)/g)].length,
        excerpt: compact(sourceRg.text),
      },
      Na: sourceNa && {
        index: sourceNa.index,
        checks: checks(sourceNa.text, [
          "class Na extends mt",
          "glslVersion:lt",
          "uniforms:{tMap:new I(null),uBluriness:new I(0),uDirection:new I(e),uResolution:new I(new Q)}",
          "vertexShader:HT",
          "fragmentShader:zT",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceNa.text),
      },
      cg: sourceCg && {
        index: sourceCg.index,
        checks: checks(sourceCg.text, [
          "class cg extends mt",
          "glslVersion:lt",
          "fragmentShader:nA",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceCg.text),
      },
      ig: sourceIg && {
        index: sourceIg.index,
        checks: checks(sourceIg.text, [
          "class ig extends mt",
          "glslVersion:lt",
          "vertexShader:FT",
          "fragmentShader:UT",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceIg.text),
      },
      L1: sourceL1 && {
        index: sourceL1.index,
        checks: checks(sourceL1.text, [
          "class L1 extends mt",
          "glslVersion:lt",
          "tMap:{value:null}",
          "uLightPosition:{value:new Q(.5,.5)}",
          "uScale:{value:new Q(1.5,1.5)}",
          "uExposure:{value:1}",
          "uClamp:{value:1}",
          "uResolution:{value:new Q}",
          "vertexShader:R1",
          "fragmentShader:P1",
          "depthTest:!1",
          "depthWrite:!1",
        ]),
        excerpt: compact(sourceL1.text),
      },
      agFluid: {
        ag: sourceAg && {
          index: sourceAg.index,
          checks: checks(sourceAg.text, [
            "class ag",
            "this.fbos={main:null,velocity_1:null,viscosity_0:null,viscosity_1:null,divergence:null,pressure_0:null,pressure_1:null}",
            "this.options={mouseForce:20,resolution:.05,cursorSize:50,poissonIterations:5,bounce:!1,delta:.01,viscosityIntensity:30,viscosityIterations:5,viscosity:!1}",
            "new Dn(this.fboSize.x,this.fboSize.y,{depthBuffer:!1,stencilBuffer:!1,type:kn})",
            "this.advection=new GT",
            "this.force=new qT",
            "this.divergence=new jT",
            "this.poisson=new KT",
            "this.pressure=new JT",
          ]),
          excerpt: compact(sourceAg.text),
        },
        GT: sourceGT && {
          index: sourceGT.index,
          checks: checks(sourceGT.text, [
            "class GT extends Ir",
            "glslVersion:lt",
            "blending:ot",
            "vertexShader:Co",
            "fragmentShader:Sf",
            "this.createBounds()",
            "vertexShader:VT",
            "new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0])",
            "this.line=new Wm(e,n),this.scene.add(this.line)",
          ]),
          excerpt: compact(sourceGT.text),
        },
        qT: sourceQT && {
          index: sourceQT.index,
          checks: checks(sourceQT.text, [
            "class qT extends Ir",
            "glslVersion:lt",
            "vertexShader:XT",
            "fragmentShader:$T",
            "blending:Uc",
            "this.mouse={coords:new Q,coordsOld:new Q,diff:new Q}",
          ]),
          excerpt: compact(sourceQT.text),
        },
        jT: sourceJT && {
          index: sourceJT.index,
          checks: checks(sourceJT.text, [
            "class jT extends Ir",
            "glslVersion:lt",
            "blending:ot",
            "vertexShader:Co",
            "fragmentShader:WT",
            "velocity:{value:e.src.texture}",
          ]),
          excerpt: compact(sourceJT.text),
        },
        KT: sourceKT && {
          index: sourceKT.index,
          checks: checks(sourceKT.text, [
            "class KT extends Ir",
            "glslVersion:lt",
            "blending:ot",
            "vertexShader:Co",
            "fragmentShader:YT",
            "poissonIterations:e",
          ]),
          excerpt: compact(sourceKT.text),
        },
        JT: sourcePressureJT && {
          index: sourcePressureJT.index,
          checks: checks(sourcePressureJT.text, [
            "class JT extends Ir",
            "glslVersion:lt",
            "blending:ot",
            "vertexShader:Co",
            "fragmentShader:ZT",
            "pressure:{value:e.pressure.texture}",
          ]),
          excerpt: compact(sourcePressureJT.text),
        },
      },
    },
    mainI1: sourceMainI1 && {
      index: sourceMainI1.index,
      checks: checks(sourceMainI1.text, [
        "this.settings={renderToScreen:!0",
        "this.renderTargetLensflare=this.renderTargetA.clone()",
        "this.settings.lensflare.enabled&&this.lensflareMaterial.uniforms.uResolution.value.set(e/8,t/8)",
        "e=Fa(e)/2,t=Fa(t)/2",
        "this.settings.fluid.enabled&&this.fluidSimulation&&this.fluidSimulation.onResize(e/3,t/3)",
        "this.compositeMaterial.uniforms.tLensflare.value=v.texture",
        "r.setRenderTarget(a),r.render(o,i)",
        "r.setRenderTarget(h),r.render(this.screen,this.screenCamera)",
        "r.setRenderTarget(f),r.render(this.screen,this.screenCamera)",
        "r.setRenderTarget(g),r.render(this.screen,this.screenCamera)",
        "r.setRenderTarget(l),r.render(this.screen,this.screenCamera)",
      ]),
      excerpt: compact(sourceMainI1.text),
    },
    renderer: sourceRenderer && {
      index: sourceRenderer.index,
      checks: checks(sourceRenderer.text, [
        "super({alpha:!0,antialias:!1,preserveDrawingBuffer:!1,powerPreference:\"high-performance\",stencil:!1,depth:!1})",
        "this.autoClear=!1",
        "this.outputColorSpace=Gt",
      ]),
      excerpt: compact(sourceRenderer.text),
    },
    canvasManager: sourceCanvasManager && {
      index: sourceCanvasManager.index,
      checks: checks(sourceCanvasManager.text, [
        "for(let r=0;r<this.scenes.length;r++)this.scenes[r].instance.update(e,t,n,i)",
        "this.addScene(this.workScene,\"work\")",
        "this.addScene(this.mainScene,\"main\")",
      ]),
      excerpt: compact(sourceCanvasManager.text),
    },
    textures: sourceTextureManager && {
      index: sourceTextureManager.index,
      checks: checks(sourceTextureManager.text, [
        "static preloadTextures(){const e=Le.WEBP?\"webp\":\"jpg\"",
        "this.blueNoise=this.loadTexture(\"/images/textures/blue-noise.png\"),this.blueNoise.wrapS=this.blueNoise.wrapT=ci",
        "this.floorNormal=this.loadTexture(`/images/textures/floor-normal.${e}`),this.floorNormal.wrapS=this.floorNormal.wrapT=ci",
        "this.perlin1=this.loadTexture(`/images/textures/perlin-1.${e}`),this.perlin1.wrapS=this.perlin1.wrapT=vo",
        "this.perlin2=this.loadTexture(`/images/textures/perlin-2.${e}`),this.perlin2.wrapS=this.perlin2.wrapT=ci",
      ]),
      constants: {
        ci: bundle.includes("ci=1e3") ? "RepeatWrapping=1000" : null,
        vo: bundle.includes("vo=1002") ? "MirroredRepeatWrapping=1002" : null,
      },
      excerpt: compact(sourceTextureManager.text),
    },
    Pe: sourcePe && {
      index: sourcePe.index,
      checks: checks(sourcePe.text, [
        "this.maxDpr=Le.LOW_RES?1.5:2",
        "this.dpr=Math.min(this.maxDpr,window.devicePixelRatio)",
        "static updateDpr(e){this.maxDpr=e,this.dpr=um&&!this.isMobile?1:this.maxDpr,this.onResize()}",
      ]),
      excerpt: compact(sourcePe.text),
    },
    p1Resize: sourceP1Resize && {
      index: sourceP1Resize.index,
      checks: checks(sourceP1Resize.text, [
        "super.resize(e,t,Math.min(n,1.5))",
        "instance.resize&&",
        "instance.resize(e,t,Math.min(n,1.5))",
        "this.aboutBlocks.resize(e,t,Math.min(n,1.5))",
        "this.cameraController.origin.z=5",
        "this.sceneWrap.position.y=.3",
      ]),
      excerpt: compact(sourceP1Resize.text),
    },
    p1EnvironmentHierarchy: sourceP1InitEnv && {
      index: sourceP1InitEnv.index,
      checks: checks(sourceP1InitEnv.text, [
        "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)",
        "this.env.position.y=-12.65",
        "this.env.rotation.y=-Xc(this.rotationAdjustment)",
        "this.sceneWrap.add(this.env)",
      ]),
      excerpt: compact(sourceP1InitEnv.text),
    },
    environmentH1: sourceH1 && {
      index: sourceH1.index,
      checks: checks(sourceH1.text, [
        "class h1 extends rt",
        "this.speed=5e-5",
        "const e=new Du(300,10)",
        "this.material=new u1({side:hn,envMapIntensity:Qn.ENVMAP_INTENSITY,fog:!1})",
        "const t=new at(e,this.material);this.add(t),this.mesh=t",
      ]),
      excerpt: compact(sourceH1.text),
    },
    environmentDuGeometry: sourceDu && {
      index: sourceDu.index,
      checks: checks(sourceDu.text, [
        "class Du extends Au",
        "this.type=\"IcosahedronGeometry\"",
        "this.parameters={radius:e,detail:t}",
      ]),
      excerpt: compact(sourceDu.text),
    },
    environmentU1: sourceU1 && {
      index: sourceU1.index,
      checks: checks(sourceU1.text, [
        "class u1 extends Ao",
        "this.dithering=!0",
        "this.customUniforms={uTime:new I(0)",
        "uMultiplier:new I(2)",
        "uDarken:new I(1)",
        "tSky:new I(null)",
        "uShader1Alpha:new I(Qn.SHADER_1_ALPHA)",
        "uShader1Mix3:new I(Qn.SHADER_1_MIX_3)",
        "t.vertexShader=c1,t.fragmentShader=l1",
      ]),
      excerpt: compact(sourceU1.text),
    },
    floorA1: sourceA1Floor && {
      index: sourceA1Floor.index,
      checks: checks(sourceA1Floor.text, [
        "class a1 extends rt",
        "this.reflector=new i1",
        "i.onBeforeRender=(r,o,a)=>{this.visible=!1,this.reflector.update(this.renderer,this.scene,this.camera),this.visible=!0}",
        "this.add(i),this.material=n",
      ]),
      excerpt: compact(sourceA1Floor.text),
    },
    floorO1Material: sourceO1FloorMaterial && {
      index: sourceO1FloorMaterial.index,
      checks: checks(sourceO1FloorMaterial.text, [
        "class o1 extends mt",
        "glslVersion:lt",
        "fragmentShader:s1",
        "blending:ot",
        "USE_NORMALMAP",
        "uFloorMixStrength:new I(a)",
      ]),
      excerpt: compact(sourceO1FloorMaterial.text),
    },
    floorT1Blur: sourceT1FloorBlur && {
      index: sourceT1FloorBlur.index,
      checks: checks(sourceT1FloorBlur.text, [
        "class t1 extends mt",
        "glslVersion:lt",
        "fragmentShader:QA",
        "blending:ot",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      excerpt: compact(sourceT1FloorBlur.text),
    },
    IuUpdate: sourceIuUpdate && {
      index: sourceIuUpdate.index,
      checks: checks(sourceIuUpdate.text, [
        "update(e,t,n,i){this.renderManager.update(e,t,n,i),this.cameraController&&this.cameraController.update(e,t,n,i);for",
        "this.components[r].update&&this.components[r].update(e,t,n,i)",
      ]),
      excerpt: compact(sourceIuUpdate.text),
    },
    p1Update: sourceP1Update && {
      index: sourceP1Update.index,
      checks: checks(sourceP1Update.text, [
        "update(e,t,n,i){super.update(e,t,n,i),this.spotLight&&this.spotLightParallax",
        "o.instance.update(e,t,n,Math.min(Pe.dpr,1.5))",
        "this.aboutBlocks.visible&&(this.aboutBlocks.update(e,t,n,Math.min(Pe.dpr,1.5))",
      ]),
      excerpt: compact(sourceP1Update.text),
    },
    thumbW1: sourceThumbW1 && {
      index: sourceThumbW1.index,
      checks: checks(sourceThumbW1.text, [
        "class w1 extends rt",
        "this.progress=e*n",
        "r.xHook=o",
        "let c=(o+this.progress+n*67890)%n",
        "c>n/2&&(c-=n)",
        "r.mesh.position.set(c,0,0)",
        "c<-1.5||c>1.5?r.mesh.visible=!1:r.mesh.visible=!0",
      ]),
      excerpt: compact(sourceThumbW1.text),
    },
    skyV1: sourceSkyV1 && {
      index: sourceSkyV1.index,
      checks: checks(sourceSkyV1.text, [
        "class V1 extends Uu",
        "this.renderManager.resize(t*.75,t*.75,1)",
        "this.renderManager.compositeMaterial.uniforms.uTime.value=Le.LOW_RES?0:e",
      ]),
      excerpt: compact(sourceSkyV1.text),
    },
    skyZ1: sourceSkyZ1 && {
      index: sourceSkyZ1.index,
      checks: checks(sourceSkyZ1.text, [
        "class z1 extends mt",
        "glslVersion:lt",
        "uniforms:{tScene:new I(null),uTime:new I(0),uShader1Alpha:new I(Zs.SHADER_1_ALPHA),uShader1Speed:new I(Zs.SHADER_1_SPEED),uShader2Speed:new I(Zs.SHADER_2_SPEED),uShader1Scale:new I(Zs.SHADER_1_SCALE),uShader2Scale:new I(Zs.SHADER_2_SCALE),uShaderMix:new I(Zs.SHADER_1_MIX_3)}",
        "fragmentShader:B1",
        "blending:ot",
        "transparent:!0",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      excerpt: compact(sourceSkyZ1.text),
    },
    GA: sourceGA && {
      index: sourceGA.index,
      checks: checks(sourceGA.text, [
        "this.settings={xNum:35,yNum:23,zNum:Le.LOW_RES?4:7,size:1.25,spacing:.1,scale:.09}",
        "this.mouseSim=new Ka({renderer:e.renderer,camera:e.camera,mesh:this.plane,persistance:.85,thickness:.1,rayCastMesh:this.rayPlane})",
        "this.plane.scale.set(35*e,23*e,1)",
        "this.rayPlane.scale.set(35*e,23*e,1)",
        "this.rayPlane.position.set(0,0,23*e/2+.01)",
        "this.planeMaterial.uniforms.uRatio.value=35/23",
        "this.rayPlane.scale.multiplyScalar(t)",
        "this.material.customUniforms.uUvOffsetScale.value=t",
        "this.rotationWrap.add(this.mesh)",
        "this.rotationWrap.scale.set(i,i,i)",
        "this.rotationWrap.add(this.rayPlane)",
        "resize(e,t,n){this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)}",
        "this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture",
        "this.mouseSpeed=Yi(this.mouseSpeed,this.mouseSim.simulationMaterial.uniforms.uSpeed.value,10,t)",
      ]),
      excerpt: compact(sourceGA.text),
    },
    i1: sourceI1 && {
      index: sourceI1.index,
      checks: checks(sourceI1.text, [
        "this.virtualCamera.lookAt(this.target)",
        "this.virtualCamera.far=n.far",
        "this.virtualCamera.updateMatrixWorld()",
        "this.virtualCamera.projectionMatrix.copy(n.projectionMatrix)",
        "e.autoClear===!1&&e.clear()",
        "e.setRenderTarget(this.renderTarget)",
        "e.state.buffers.depth.setMask(!0)",
      ]),
      order: regexAnchorOrder(sourceI1.text, [
        { label: "lookAt", pattern: /this\.virtualCamera\.lookAt\(this\.target\)/ },
        { label: "far", pattern: /this\.virtualCamera\.far=n\.far/ },
        { label: "updateMatrixWorld", pattern: /this\.virtualCamera\.updateMatrixWorld\(\)/ },
        { label: "projectionCopy", pattern: /this\.virtualCamera\.projectionMatrix\.copy\(n\.projectionMatrix\)/ },
        { label: "setRenderTargetRaw", pattern: /e\.setRenderTarget\(this\.renderTarget\)/ },
        { label: "depthMask", pattern: /e\.state\.buffers\.depth\.setMask\(!0\)/ },
        { label: "conditionalClear", pattern: /e\.autoClear===!1&&e\.clear\(\)/ },
      ]),
      excerpt: compact(sourceI1.text),
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

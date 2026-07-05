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
const rebuildMainPath = process.env.REBUILD_MAIN || "src/client/main.ts";
const threeLightsFragmentBegin = readFileSync("node_modules/three/src/renderers/shaders/ShaderChunk/lights_fragment_begin.glsl.js", "utf8");
const threeShadowmapVertex = readFileSync("node_modules/three/src/renderers/shaders/ShaderChunk/shadowmap_vertex.glsl.js", "utf8");
const threeWebglLights = readFileSync("node_modules/three/src/renderers/webgl/WebGLLights.js", "utf8");
const threeTextureSource = readFileSync("node_modules/three/src/textures/Texture.js", "utf8");
const threeVideoTextureSource = readFileSync("node_modules/three/src/textures/VideoTexture.js", "utf8");

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

function extractBlock(source, needle) {
  const start = source.indexOf(needle);
  if (start < 0) return null;
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) return null;
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }
  return null;
}

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

function checks(text, needles) {
  return Object.fromEntries(needles.map((needle) => [needle, text.includes(needle)]));
}

function orderedIncludes(text, needles) {
  let cursor = -1;
  return needles.every((needle) => {
    const index = text.indexOf(needle, cursor + 1);
    if (index < 0) return false;
    cursor = index;
    return true;
  });
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
const rebuildMain = readFileSync(rebuildMainPath, "utf8");
const rebuildEnvironmentMaterialFactory = extractBlock(rebuildWebgl, "private createEnvironmentMaterial()");
const rebuildCreateLensflareMaterial = extractBlock(rebuildWebgl, "private createLensflareMaterial()");
const rebuildCreateLuminosityMaterial = extractBlock(rebuildWebgl, "private createLuminosityMaterial(");
const rebuildCreateBloomBlurMaterial = extractBlock(rebuildWebgl, "private createBloomBlurMaterial(");
const rebuildCreateBlurMaterial = extractBlock(rebuildWebgl, "private createBlurMaterial(");
const rebuildCreateBloomCompositeMaterial = extractBlock(rebuildWebgl, "private createBloomCompositeMaterial(");
const rebuildCreateFloorReflectionBlurMaterial = extractBlock(rebuildWebgl, "private createFloorReflectionBlurMaterial()");
const rebuildCreateFxaaMaterial = extractBlock(rebuildWebgl, "private createFxaaMaterial()");
const rebuildCreateCompositeMaterial = extractBlock(rebuildWebgl, "private createCompositeMaterial()");
const rebuildCreateMainCompositeMaterial = extractBlock(rebuildWebgl, "private createMainCompositeMaterial()");
const rebuildCreateWorkScene = extractBlock(rebuildWebgl, "private createWorkScene()");
const sourceLoadedTextureHelper = rebuildWebgl.match(/function applySourceLoadedTextureState[^{]*\{([\s\S]*?)\n\}/);
const sourceLoadedTextureHelperBody = sourceLoadedTextureHelper?.[1] ?? "";
const rebuildSetGalleryProgress = extractBlock(rebuildWebgl, "setGalleryProgress(progress");
const rebuildSetProjectBlockReveal = extractBlock(rebuildWebgl, "private setProjectBlockReveal(");
const rebuildSetDarken = extractBlock(rebuildWebgl, "private setDarken(");
const rebuildSetSaturation = extractBlock(rebuildWebgl, "private setSaturation(");
const rebuildSetContrast = extractBlock(rebuildWebgl, "private setContrast(");
const rebuildSetRevealSpread = extractBlock(rebuildWebgl, "private setRevealSpread(");
const rebuildSetEnvRotation = extractBlock(rebuildWebgl, "private setEnvRotation(");
const rebuildSetFluidStrength = extractBlock(rebuildWebgl, "private setFluidStrength(");
const rebuildSetMediaOpacity = extractBlock(rebuildWebgl, "private setMediaOpacity(");
const rebuildSetMainColor = extractBlock(rebuildWebgl, "private setMainColor(");
const rebuildSetMediaBackground = extractBlock(rebuildWebgl, "private setMediaBackground(");
const rebuildShowScene = extractBlock(rebuildWebgl, "showScene()");
const rebuildCreateThumbPlane = extractBlock(rebuildWebgl, "private createThumbPlane(");
const rebuildSetThumbDarknessIntensity = extractBlock(rebuildWebgl, "private setThumbDarknessIntensity(");
const rebuildSetThumbDarknessColor = extractBlock(rebuildWebgl, "private setThumbDarknessColor(");
const rebuildSetThumbSaturation = extractBlock(rebuildWebgl, "private setThumbSaturation(");
const rebuildSetThumbMouseLightness = extractBlock(rebuildWebgl, "private setThumbMouseLightness(");
const rebuildSetSpotLightIntensity = extractBlock(rebuildWebgl, "private setSpotLightIntensity(");
const rebuildSetDirectionalLightIntensity = extractBlock(rebuildWebgl, "private setDirectionalLightIntensity(");
const rebuildSetDirectionalLight2Intensity = extractBlock(rebuildWebgl, "private setDirectionalLight2Intensity(");
const rebuildTick = extractBlock(rebuildWebgl, "private tick =");
const rebuildResizeBloomMipChain = extractBlock(rebuildWebgl, "private resizeBloomMipChain(");
const rebuildRenderBloomChain = extractBlock(rebuildWebgl, "private renderBloomChain(");
const rebuildRenderWorkBlurPass = extractBlock(rebuildWebgl, "private renderWorkBlurPass()");
const rebuildRenderHomeBlurPass = extractBlock(rebuildWebgl, "private renderHomeBlurPass()");
const rebuildRenderHomeBloomPass = extractBlock(rebuildWebgl, "private renderHomeBloomPass(");
const sourceCA = extractTemplate(bundle, "CA", "`,RA=");
const sourceA1 = extractTemplate(bundle, "A1", "`;class C1");
const sourceTl = extractTemplate(bundle, "tl", "`;class g1");
const sourceD1 = extractTemplate(bundle, "D1", "`;class C1");
const sourceEl = extractTemplate(bundle, "el", "`;class lA");
const sourceFloorS1 = extractTemplate(bundle, "s1", "`,r1=");
const sourceDitherRandomTA = extractTemplate(bundle, "tA", "`,lg=");
const sourceDitherLG = extractTemplate(bundle, "lg", "`,nA=");
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
const sourceMainI1 = extractAround(bundle, "class I1", 200, 9600);
const sourcePe = extractAround(bundle, "class Pe", 200, 1400);
const sourceP1Resize = extractAround(bundle, "resize(e,t,n){super.resize(e,t,Math.min(n,1.5))", 1200, 900);
const sourceP1InitEnv = extractAround(bundle, "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)", 700, 900);
const sourceP1SetLights = extractAround(bundle, "setLights(){this.ambientLight=new", 240, 1000);
const sourceP1CameraSettings = extractAround(bundle, "setCameraControllerSettings(e=new L(0,0,0),t=new Q(.25,.25),n=10)", 240, 520);
const sourceIuUpdate = extractAround(bundle, "update(e,t,n,i){this.renderManager.update(e,t,n,i),this.cameraController", 240, 700);
const sourceIT = extractAround(bundle, "class IT{constructor", 120, 3200);
const sourceP1Update = extractAround(bundle, "update(e,t,n,i){super.update(e,t,n,i),this.spotLight", 240, 1300);
const sourceTDSpotlight = extractAround(bundle, "updateSpotLight(){J.workScene.spotLight.position.set", 520, 900);
const sourceWebpDetection = extractAround(bundle, "await k0(\"lossy\").then(()=>{Le.WEBP=!0}).catch(()=>{Le.WEBP=!1})", 240, 420);
const sourceSe = extractAround(bundle, "class Se", 200, 10600);
const sourceYDAnimateIn = extractAround(bundle, "Se.setCameraControllerSettings(new L(0,0,0),new Q(1,.5),20)", 360, 620);
const sourceYDUpdateScene = extractAround(bundle, "J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)", 360, 760);
const sourceYDOnProjectActive = extractAround(bundle, "async onProjectActive(e){", 240, 1600);
const sourceSDInitSpotlight = extractAround(bundle, "J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture", 260, 520);
const sourceThumbW1 = extractAround(bundle, "class w1 extends", 320, 1700);
const sourceThumbX1 = extractAround(bundle, "class x1 extends Lo", 700, 500);
const sourceThumbT1 = extractAround(bundle, "class T1 extends Uu", 500, 1000);
const sourceThumbE1 = extractAround(bundle, "class E1", 360, 900);
const sourceMainYg = extractAround(bundle, "class yg extends Iu", 300, 1200);
const sourceMainU1Scene = extractAround(bundle, "class U1 extends yg", 300, 1100);
const sourceDisplacementO1 = extractAround(bundle, "class O1 extends Lo", 700, 900);
const sourceH1 = extractAround(bundle, "class h1 extends", 200, 800);
const sourceU1 = extractAround(bundle, "class u1 extends", 900, 1700);
const sourceEnvironmentL1 = extractTemplate(bundle, "l1", "`,c1=");
const sourceDu = extractAround(bundle, "class Du extends", 240, 700);
const sourceA1Floor = extractAround(bundle, "class a1 extends", 300, 1400);
const sourceO1FloorMaterial = extractAround(bundle, "class o1 extends", 700, 1600);
const sourceT1FloorBlur = extractAround(bundle, "class t1 extends", 800, 900);
const sourceSkyV1 = extractAround(bundle, "class V1 extends", 1400, 1600);
const sourceSkyZ1 = extractAround(bundle, "class z1 extends", 500, 1000);
const sourceSkyB1 = extractTemplate(bundle, "B1", "`,Zs=");
const sourceVA = extractAround(bundle, "class VA extends", 320, 2200);
const sourceXA = extractAround(bundle, "class XA extends", 320, 2200);
const sourceGA = extractAround(bundle, "class GA extends", 200, 5200);
const sourceSA = bundle.match(/class sA\{[\s\S]*?class Ka\{/)?.[0] ?? null;
const sourceMouseSimulationFragment = extractTemplate(bundle, "rA", "`,oA=");
const sourceMouseSimulationVertex = extractTemplate(bundle, "oA", "`;class Ka");
const sourceI1 = extractAround(bundle, "class i1 extends", 200, 4200);
const sourceRenderer = extractAround(bundle, "class qw extends", 200, 1200);
const sourceCanvasManager = extractAround(bundle, "class nD{constructor", 200, 2200);
const sourceTextureManager = extractAround(bundle, "static preloadTextures(){", 120, 1300);
const sourceP1AddEnvironment = extractAround(bundle, "async addEnvironment(){const e=Le.WEBP?\"webp\":\"jpg\"", 220, 420);
const rendererOutputRefs = [
  extractAround(bundle, "outputColorSpace", 180, 700),
  extractAround(bundle, "setOutputColorSpace", 180, 700),
  extractAround(bundle, ".outputColorSpace=", 180, 700),
].filter(Boolean);

writeFileSync(path.join(outDir, "source-CA.glsl"), sourceCA);
writeFileSync(path.join(outDir, "source-A1.glsl"), sourceA1);
writeFileSync(path.join(outDir, "source-s1-floor.glsl"), sourceFloorS1);
writeFileSync(path.join(outDir, "source-tA-dither-random.glsl"), sourceDitherRandomTA);
writeFileSync(path.join(outDir, "source-lg-dither.glsl"), sourceDitherLG);
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
    floorS1: {
      length: sourceFloorS1.length,
      checks: checks(sourceFloorS1, [
        "${lg}",
        "#ifdef DITHERING",
      ]),
    },
    ditherHelper: {
      randomLength: sourceDitherRandomTA.length,
      helperLength: sourceDitherLG.length,
      checks: {
        ...checks(sourceDitherRandomTA, [
          "float random(vec2 co)",
          "float sn = mod(dt, 3.14)",
          "return fract(sin(sn) * c)",
        ]),
        ...checks(sourceDitherLG, [
          "${tA}",
          "vec3 dither(vec3 color)",
          "dither_shift_RGB",
        ]),
      },
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
        "this.screen=new at(this.screenGeometry)",
        "this.screen.frustumCulled=!1",
        "this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t))",
        "this.hBlurMaterial.uniforms.uResolution.value.set(e,t)",
        "this.vBlurMaterial.uniforms.uResolution.value.set(e,t)",
        "e=Fa(e)/4,t=Fa(t)/4",
        "this.settings.fluid.enabled&&this.fluidSimulation&&this.fluidSimulation.onResize(e/3,t/3)",
        "this.screen.material=this.luminosityMaterial",
        "this.screen.material=this.BloomMaterial",
        "this.screen.material=this.compositeMaterial",
        "this.compositeMaterial.uniforms.tBloom.value=d[0].texture",
        "o.setRenderTarget(u),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(c),o.render(a,r)",
        "o.setRenderTarget(f),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(g),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(d[p]),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(l[p]),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(d[0]),o.render(this.screen,this.screenCamera)",
        "o.setRenderTarget(h),o.render(this.screen,this.screenCamera)",
      ]),
      screenOwnership: {
        sourceSingleScreenMesh: sourceLu.text.includes("this.screen=new at(this.screenGeometry)") && sourceLu.text.includes("this.screen.frustumCulled=!1"),
        sourceMaterialSwap: [
          "this.screen.material=this.hBlurMaterial",
          "this.screen.material=this.vBlurMaterial",
          "this.screen.material=this.luminosityMaterial",
          "this.screen.material=this.BloomMaterial",
          "this.screen.material=this.compositeMaterial",
        ].every((needle) => sourceLu.text.includes(needle)),
        sourceCompositeRender: sourceLu.text.includes("o.setRenderTarget(h),o.render(this.screen,this.screenCamera)"),
        sourceFinalTargetReset: sourceLu.text.includes(
          "this.settings.renderToScreen?(o.setRenderTarget(null),o.render(this.screen,this.screenCamera)):(o.setRenderTarget(h),o.render(this.screen,this.screenCamera),o.setRenderTarget(null))",
        ),
        rebuildSourceScreenSwap: [
          "private workPostScreen = makeSourcePassScreen()",
          "this.workPostScreen.material = this.workBlurHorizontalMaterial",
          "this.workPostScreen.material = this.workBlurVerticalMaterial",
          "this.workPostScreen.material = this.workLuminosityMaterial",
          "this.workPostScreen.material = this.compositeMaterial",
          "this.renderer.render(this.workPostScreen, this.backgroundCamera)",
        ].every((needle) => rebuildWebgl.includes(needle)),
        sourceOwnedPassMaterialCreation: [
          "this.hBlurMaterial=new Na(bf)",
          "this.vBlurMaterial=new Na(Mf)",
          "this.FxaaMaterial=new ig",
          "this.luminosityMaterial=new sg",
          "this.blurMaterials.push(new rg(e[t]))",
          "this.BloomMaterial=new cg",
        ].every((needle) => sourceLu.text.includes(needle)),
        rebuildOwnedPassMaterialCreation: [
          "private workLuminosityMaterial: ShaderMaterial;",
          "private workBlurHorizontalMaterial: ShaderMaterial;",
          "private workBlurVerticalMaterial: ShaderMaterial;",
          "private workFxaaMaterial: ShaderMaterial;",
          "this.workBlurHorizontalMaterial = this.createBlurMaterial(1, 0);",
          "this.workBlurVerticalMaterial = this.createBlurMaterial(0, 1);",
          "this.workFxaaMaterial = this.createFxaaMaterial();",
          "this.workLuminosityMaterial = this.createLuminosityMaterial(this.renderSettings);",
          "this.bloomBlurMaterials = this.createBloomBlurMaterials();",
          "this.bloomCompositeMaterial = this.createBloomCompositeMaterial(this.workBloomVerticalTargets);",
          "workMaterialOwnership: \"source-Lu-pass-materials-owned-by-work-render-manager\"",
        ].every((needle) => rebuildWebgl.includes(needle)),
        sourceTargetCloneGraph: [
          "this.renderTargetB=this.renderTargetA.clone()",
          "this.renderTargetBright=this.renderTargetA.clone()",
          "this.renderTargetComposite=this.renderTargetA.clone()",
          "this.renderTargetBlurA=this.renderTargetA.clone()",
          "this.renderTargetBlurB=this.renderTargetA.clone()",
          "this.renderTargetFXAA=this.renderTargetA.clone()",
          "this.renderTargetA.depthBuffer=!0",
        ].every((needle) => sourceLu.text.includes(needle)),
        rebuildTargetCloneGraph: [
          "private workRawTarget = makeSourceRenderTarget(false);",
          "private workTargetB = this.workRawTarget.clone();",
          "private workCompositeTarget = this.workRawTarget.clone();",
          "private workBloomBrightTarget = this.workRawTarget.clone();",
          "private workBlurTargetA = this.workRawTarget.clone();",
          "private workBlurTargetB = this.workRawTarget.clone();",
          "private workFxaaTarget = this.workRawTarget.clone();",
          "this.workBloomHorizontalTargets = Array.from({ length: 5 }, () => this.workRawTarget.clone());",
          "this.workBloomVerticalTargets = Array.from({ length: 5 }, () => this.workRawTarget.clone());",
          "this.workRawTarget.depthBuffer = true;",
          "source-Lu-target-state-renderTargetA-depthBuffer-true-derived-clones",
          "source-Lu-renderTargetA-clone-graph-depth-toggle-after-clones",
        ].every((needle) => rebuildWebgl.includes(needle)),
        rebuildNoIndependentWorkTargets: [
          "private workRawTarget = makeSourceRenderTarget(true);",
          "private workCompositeTarget = makeSourceRenderTarget(false);",
          "private bloomBrightTarget = makeSourceRenderTarget(false);",
          "private bloomHorizontalTargets: WebGLRenderTarget[] = [];",
          "private bloomVerticalTargets: WebGLRenderTarget[] = [];",
          "private blurTargetA = makeSourceRenderTarget(false);",
          "private blurTargetB = makeSourceRenderTarget(false);",
          "private fxaaTarget = makeSourceRenderTarget(false);",
          "this.bloomHorizontalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));",
          "this.bloomVerticalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));",
        ].every((needle) => !rebuildWebgl.includes(needle)),
        sourceBlurResizeResolution:
          sourceLu.text.includes("this.hBlurMaterial.uniforms.uResolution.value.set(e,t)")
          && sourceLu.text.includes("this.vBlurMaterial.uniforms.uResolution.value.set(e,t)"),
        rebuildBlurResizeResolution: [
          "this.workBlurHorizontalMaterial.uniforms.uResolution.value.set(width, height);",
          "this.workBlurVerticalMaterial.uniforms.uResolution.value.set(width, height);",
          "source-Lu-Na-resize-css-width-height-when-blur-enabled",
        ].every((needle) => rebuildWebgl.includes(needle)),
        sourceMouseSimResizeNoPostRound:
          sourceLu.text.includes("this.settings.mousesim.enabled&&this.mouseSimulation.onResize(e/10,t/10)")
          && !sourceLu.text.includes("Math.round(e/10)")
          && !sourceLu.text.includes("Math.round(t/10)"),
        rebuildScreenMouseSimResizeNoPostRound: [
          "const screenSimWidth = Math.max(1, workRenderWidth / SCREEN_MOUSE_SIM_SCALE);",
          "const screenSimHeight = Math.max(1, workRenderHeight / SCREEN_MOUSE_SIM_SCALE);",
          "targetSizingMode: \"source-Lu-mousesim-render-size-div-10-no-post-rounding\"",
        ].every((needle) => rebuildWebgl.includes(needle))
          && !rebuildWebgl.includes("Math.round(workRenderWidth / SCREEN_MOUSE_SIM_SCALE)")
          && !rebuildWebgl.includes("Math.round(workRenderHeight / SCREEN_MOUSE_SIM_SCALE)"),
        sourceBlurBranchRender:
          sourceLu.text.includes("this.settings.blur.enabled&&(this.hBlurMaterial.uniforms.tMap.value=c.texture")
          && sourceLu.text.includes("this.screen.material=this.hBlurMaterial,o.setRenderTarget(f),o.render(this.screen,this.screenCamera)")
          && sourceLu.text.includes("this.vBlurMaterial.uniforms.tMap.value=f.texture")
          && sourceLu.text.includes("this.screen.material=this.vBlurMaterial,o.setRenderTarget(g),o.render(this.screen,this.screenCamera)")
          && sourceLu.text.includes("this.luminosityMaterial.uniforms.tMap.value=this.settings.blur.enabled?g.texture:c.texture")
          && sourceLu.text.includes("this.compositeMaterial.uniforms.tScene.value=this.settings.blur.enabled?g.texture:c.texture"),
        rebuildBlurBranchRender:
          rebuildRenderWorkBlurPass?.includes("this.workBlurHorizontalMaterial.uniforms.tMap.value = this.workRawTarget.texture;")
          && rebuildRenderWorkBlurPass?.includes("this.workPostScreen.material = this.workBlurHorizontalMaterial;")
          && rebuildRenderWorkBlurPass?.includes("this.renderer.setRenderTarget(this.workBlurTargetA);")
          && rebuildRenderWorkBlurPass?.includes("this.workBlurVerticalMaterial.uniforms.tMap.value = this.workBlurTargetA.texture;")
          && rebuildRenderWorkBlurPass?.includes("this.workPostScreen.material = this.workBlurVerticalMaterial;")
          && rebuildRenderWorkBlurPass?.includes("this.renderer.setRenderTarget(this.workBlurTargetB);")
          && rebuildTick?.includes("if (this.renderSettings.blur.enabled) {\n            this.renderWorkBlurPass();\n          }\n          const workSceneTarget = this.renderSettings.blur.enabled ? this.workBlurTargetB : this.workRawTarget;")
          && rebuildTick?.includes("this.renderHomeBloomPass(this.workRawTarget, workSceneTarget);")
          && rebuildTick?.includes("this.compositeMaterial.uniforms.tScene.value = workSceneTarget.texture;")
          && rebuildWebgl.includes("luminositySource: \"source-Lu-renderTargetBlurB-if-blur-else-renderTargetA\""),
        sourceBlurinessInitOnly:
          sourceLu.text.includes("this.hBlurMaterial.uniforms.uBluriness.value=0")
          && sourceLu.text.includes("this.vBlurMaterial.uniforms.uBluriness.value=0")
          && !sourceLu.text.includes("settings.blur.strength"),
        rebuildBlurinessInitOnly:
          rebuildCreateBlurMaterial?.includes("uBluriness: { value: 0 }")
          && !rebuildRenderWorkBlurPass?.includes("uBluriness.value")
          && !rebuildRenderHomeBlurPass?.includes("uBluriness.value")
          && rebuildWebgl.includes("blurinessUpdateMode: \"source-Na-uBluriness-init-zero-no-update-write\""),
        sourceFxaaResizeResolution:
          sourceLu.text.includes("this.settings.fxaa.enabled&&(this.renderTargetFXAA.setSize(e*n,t*n),this.FxaaMaterial.uniforms.uResolution.value.set(e*n,t*n))"),
        rebuildFxaaResizeResolution: [
          "this.workFxaaTarget.setSize(workRenderWidth, workRenderHeight);",
          "this.workFxaaMaterial.uniforms.uResolution.value.set(workRenderWidth, workRenderHeight);",
          "source-Lu-ig-resize-work-render-size-when-fxaa-enabled",
        ].every((needle) => rebuildWebgl.includes(needle)),
        sourceFxaaBranchRender:
          sourceLu.text.includes("this.settings.fxaa.enabled&&(o.setRenderTarget(v),o.render(this.screen,this.screenCamera),this.FxaaMaterial.uniforms.tMap.value=v.texture,this.screen.material=this.FxaaMaterial)")
          && sourceLu.text.includes("o.setRenderTarget(h),o.render(this.screen,this.screenCamera)"),
        rebuildFxaaBranchRender:
          rebuildWebgl.includes("if (this.renderSettings.fxaa.enabled) {\n            this.renderer.setRenderTarget(this.workFxaaTarget);\n            this.renderer.render(this.workPostScreen, this.backgroundCamera);\n            this.workFxaaMaterial.uniforms.tMap.value = this.workFxaaTarget.texture;\n            this.workPostScreen.material = this.workFxaaMaterial;\n          }\n          this.renderer.setRenderTarget(this.workCompositeTarget);\n          this.renderer.render(this.workPostScreen, this.backgroundCamera);"),
        rebuildFinalTargetReset:
          rebuildTick?.includes("this.renderer.setRenderTarget(this.workCompositeTarget);\n          this.renderer.render(this.workPostScreen, this.backgroundCamera);\n          this.renderer.setRenderTarget(null);")
          && rebuildWebgl.includes("sourceFinalTargetReset: \"source-Lu-renderToScreen-false-renderTargetComposite-then-null\""),
        sourceBloomBranchBinding: sourceLu.text.includes("this.compositeMaterial.uniforms.tBloom.value=d[0].texture"),
        rebuildBloomBranchBinding:
          rebuildTick?.includes("if (this.renderSettings.bloom.enabled) {\n            this.renderHomeBloomPass(this.workRawTarget, workSceneTarget);\n            this.compositeMaterial.uniforms.tBloom.value = this.workBloomHorizontalTargets[0].texture;\n          }")
          && rebuildRenderHomeBloomPass?.includes("private renderHomeBloomPass(sourceTarget: WebGLRenderTarget, luminositySourceTarget = sourceTarget)")
          && rebuildRenderHomeBloomPass?.includes("this.workLuminosityMaterial.uniforms.tMap.value = luminositySourceTarget.texture;"),
        sourceBloomBlurResizeResolution:
          sourceLu.text.includes("this.blurMaterials[i].uniforms.uResolution.value.set(e,t),e/=2,t/=2")
          && !sourceLu.text.includes("this.blurMaterials[p].uniforms.uResolution"),
        rebuildBloomBlurResizeResolution:
          rebuildResizeBloomMipChain?.includes("blurMaterials[index]?.uniforms.uResolution.value.set(mipWidth, mipHeight);")
          && rebuildWebgl.includes("this.resizeBloomMipChain(\n        this.workBloomHorizontalTargets,\n        this.workBloomVerticalTargets,\n        this.bloomBlurMaterials,")
          && !rebuildRenderBloomChain?.includes("blurMaterial.uniforms.uResolution.value.set"),
      },
      excerpt: compact(sourceLu.text),
    },
    Lo: sourceLo && {
      index: sourceLo.index,
      checks: checks(sourceLo.text, [
        "this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1})",
        "this.renderTargetComposite=this.renderTargetA.clone()",
        "this.renderTargetComposite=this.renderTargetA.clone(),this.compositeMaterial=new g1",
        "uniforms:{tScene:new I(null)}",
        "this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t))",
        "o.setRenderTarget(c),o.render(a,r)",
        "this.compositeMaterial.uniforms.tScene.value=c.texture",
        "this.screen.material=this.compositeMaterial",
        "o.setRenderTarget(u),o.render(this.screen,this.screenCamera)",
      ]),
      subclassChecks: {
        skyH1: checks(sourceSkyV1.text, [
          "class H1 extends Lo",
          "this.compositeMaterial=new z1",
          "initSettings(){this.settings={renderToScreen:!1}}",
        ]),
        displacementO1: checks(sourceDisplacementO1.text, [
          "class N1 extends mt",
          "uniforms:{tScene:new I(null),uRatio:new I(1),uTime:new I(0)}",
          "class O1 extends Lo",
          "this.compositeMaterial=new N1",
          "initSettings(){this.settings={renderToScreen:!1}}",
          "this.renderManager.resize(t/10,t/10,n)",
          "this.renderManager.compositeMaterial.uniforms.uRatio.value=e/t",
        ]),
        thumbX1: checks(sourceThumbX1.text, [
          "class x1 extends Lo",
          "this.compositeMaterial=new _1",
          "initSettings(){this.settings={renderToScreen:!1}}",
        ]),
      },
      rebuildSubclassScreenSwap: checks(rebuildWebgl, [
        "private skyPostScreen = makeSourcePassScreen()",
        "private displacementPostScreen = makeSourcePassScreen()",
        "private thumbPostScreen = makeSourcePassScreen()",
        "this.skyPostScreen.material = this.skyCompositeMaterial",
        "this.displacementPostScreen.material = this.displacementMaterial",
        "this.thumbPostScreen.material = this.thumbCompositeMaterial",
        "this.skyCompositeMaterial.uniforms.tScene.value = this.skyRawTarget.texture",
        "this.displacementMaterial.uniforms.tScene.value = this.displacementRawTarget.texture",
        "this.renderer.render(this.skyPostScreen, this.backgroundCamera)",
        "this.renderer.render(this.displacementPostScreen, this.backgroundCamera)",
        "this.renderer.render(this.thumbPostScreen, this.backgroundCamera)",
        "renderManagerOwnership: \"source-H1-Lo-single-screen-material-swap\"",
        "renderManagerOwnership: \"source-O1-Lo-single-screen-material-swap\"",
        "renderManagerOwnership: \"source-x1-Lo-single-screen-material-swap\"",
      ]),
      rebuildDerivedTargetOwnership: {
        skyCompositeClone:
          rebuildWebgl.includes("private skyRawTarget = makeSourceRenderTarget(false);")
          && rebuildWebgl.includes("private skyCompositeTarget = this.skyRawTarget.clone();")
          && rebuildWebgl.includes("compositeTargetMode: \"source-Lo-renderTargetComposite-renderTargetA-clone\""),
        displacementCompositeClone:
          rebuildWebgl.includes("private displacementRawTarget = makeSourceRenderTarget(false);")
          && rebuildWebgl.includes("private displacementTarget = this.displacementRawTarget.clone();")
          && rebuildWebgl.includes("compositeTargetMode: \"source-Lo-renderTargetComposite-renderTargetA-clone\""),
        skyDisplacementSourceNullTSceneConstructors:
          rebuildWebgl.includes("tSceneConstructorMode: \"source-z1-tScene-construct-null-Lo-update-binds-raw\"")
          && rebuildWebgl.includes("tSceneConstructorMode: \"source-N1-tScene-construct-null-Lo-update-binds-raw\""),
        thumbCompositeClone:
          rebuildWebgl.includes("private thumbTarget = makeSourceRenderTarget(false);")
          && rebuildWebgl.includes("private thumbCompositeTarget = this.thumbTarget.clone();")
          && rebuildWebgl.includes("compositeConstructionMode: \"source-Lo-renderTargetComposite-renderTargetA-clone\""),
        noIndependentThumb1024Targets:
          !rebuildWebgl.includes("new WebGLRenderTarget(1024, 1024")
          && !rebuildWebgl.includes("new WebGLRenderTarget(1024,1024"),
        noManualThumbTargetTextureDefaults:
          ![
            "this.thumbTarget.texture.generateMipmaps = false",
            "this.thumbTarget.texture.minFilter = LinearFilter",
            "this.thumbTarget.texture.magFilter = LinearFilter",
            "this.thumbCompositeTarget.texture.generateMipmaps = false",
            "this.thumbCompositeTarget.texture.minFilter = LinearFilter",
            "this.thumbCompositeTarget.texture.magFilter = LinearFilter",
          ].some((needle) => rebuildWebgl.includes(needle)),
      },
      renderTargetDefaults: targetSnapshot(new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false }).clone()),
      excerpt: compact(sourceLo.text),
    },
    OA: sourceOA && {
      index: sourceOA.index,
      checks: checks(sourceOA.text, [
        "class OA extends mt",
        "glslVersion:lt",
        "toneMapped:!1",
        "vertexShader:el",
        "fragmentShader:CA",
        "blending:ot",
        "transparent:!0",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      ownership: {
        sourceBoolConstructorDefaults:
          sourceOA.text.includes("boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)"),
        sourceRuntimeBoolWrites:
          sourceLu.text.includes("this.compositeMaterial.uniforms.boolBloom.value=this.settings.bloom.enabled")
          && sourceLu.text.includes("this.compositeMaterial.uniforms.boolFluid.value=this.settings.fluid.enabled")
          && sourceLu.text.includes("this.compositeMaterial.uniforms.boolLuminosity.value=this.settings.luminosity.enabled")
          && sourceLu.text.includes("this.compositeMaterial.uniforms.boolFxaa.value=this.settings.fxaa.enabled"),
        rebuildBoolConstructorDefaults:
          Boolean(rebuildCreateCompositeMaterial)
          && rebuildCreateCompositeMaterial.includes("boolBloom: { value: false }")
          && rebuildCreateCompositeMaterial.includes("boolFluid: { value: false }")
          && rebuildCreateCompositeMaterial.includes("boolLuminosity: { value: false }")
          && rebuildCreateCompositeMaterial.includes("boolFxaa: { value: false }")
          && rebuildCreateCompositeMaterial.includes("sourceConstructorBoolDefaults")
          && rebuildCreateCompositeMaterial.includes("sourceRuntimeBoolOwnership = \"source-Lu-update-writes-OA-bools-from-settings-before-composite-render\"")
          && !rebuildCreateCompositeMaterial.includes("boolBloom: { value: settings.bloom.enabled }")
          && !rebuildCreateCompositeMaterial.includes("boolFluid: { value: settings.fluid.enabled }")
          && !rebuildCreateCompositeMaterial.includes("boolLuminosity: { value: settings.luminosity.enabled }")
          && !rebuildCreateCompositeMaterial.includes("boolFxaa: { value: settings.fxaa.enabled }"),
        rebuildRuntimeBoolWrites:
          Boolean(rebuildTick)
          && rebuildTick.includes("this.compositeMaterial.uniforms.boolBloom.value = this.renderSettings.bloom.enabled")
          && rebuildTick.includes("this.compositeMaterial.uniforms.boolFluid.value = this.renderSettings.fluid.enabled")
          && rebuildTick.includes("this.compositeMaterial.uniforms.boolLuminosity.value = this.renderSettings.luminosity.enabled")
          && rebuildTick.includes("this.compositeMaterial.uniforms.boolFxaa.value = this.renderSettings.fxaa.enabled")
          && rebuildWebgl.includes("runtimeBoolOwnership: this.compositeMaterial.userData.sourceRuntimeBoolOwnership")
          && rebuildWebgl.includes("runtimeBoolsMatchSettings"),
      },
      excerpt: compact(sourceOA.text),
    },
    C1: sourceC1 && {
      index: sourceC1.index,
      checks: checks(sourceC1.text, [
        "class C1 extends mt",
        "glslVersion:lt",
        "toneMapped:!1",
        "vertexShader:D1",
        "fragmentShader:A1",
        "blending:ot",
        "depthWrite:!1",
        "depthTest:!1",
        "tScene:new I(null),tWork:new I(null),tMedia:new I(null),tBloom:new I(null),tBlur:new I(null),tFluid:new I(null),tPortal:new I(null),tMouseSim:new I(null)",
        "boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)",
        "uDisplacementSize:new I(new Q),uContainerSize:new I(new Q),uDisplacement:new I(.1),uPerlin:new I(.1)",
        "uBgColor:new I(new ye(\"#1F1F1F\").convertLinearToSRGB())",
        "uReveal:new I(0),uMediaReveal:new I(0),uContrast:new I(xt.contrast),uTransformX:new I(0),uFluidStrength:new I(.5)",
        "resize(e,t){this.uniforms.uContainerSize.value.set(e,t)}",
      ]),
      rebuildChecks: {
        ...checks(rebuildWebgl, [
          "const SOURCE_C1_UNIFORM_KEYS = [",
          "\"tScene\",\n  \"tWork\",\n  \"tMedia\",\n  \"tBloom\",\n  \"tBlur\",\n  \"tFluid\",\n  \"tPortal\",\n  \"tMouseSim\"",
          "boolBloom: { value: false }",
          "boolFluid: { value: false }",
          "boolLuminosity: { value: false }",
          "boolFxaa: { value: false }",
          "tPortal: { value: null }",
          "samplerConstructorMode: \"source-C1-sampler-uniforms-construct-null-branch-owned-bindings\"",
          "uDisplacementSize: { value: new Vector2(0, 0) }",
          "uContainerSize: { value: new Vector2(0, 0) }",
          "this.preCompositeMaterial.uniforms.uContainerSize.value.set(width, height)",
          "uDisplacement: { value: 0.1 }",
          "uPerlin: { value: 0.1 }",
          "mode: \"source-C1-constructor-uniform-order-with-unused-tPortal\"",
          "resizeMode: \"source-U1-C1-resize-css-width-height\"",
          "tPortalBindingMode: \"source-C1-material-uniform-A1-unused-constructor-null\"",
          "tBloomBindingMode: \"source-I1-bloom-branch-only\"",
          "tWorkBindingMode: \"source-nD-init-one-time-C1-tWork-work-renderTargetComposite\"",
          "tMediaBindingMode: \"source-nD-init-one-time-C1-tMedia-media-renderTargetComposite\"",
          "tMouseSimBindingMode: \"source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output\"",
          "uDisplacementSizeMode: \"source-C1-constructor-default-new-Vector2-no-runtime-write\"",
          "bindSourceMainCompositeInputs()",
        ]),
        noRuntimeUDisplacementSizeWrite: !rebuildWebgl.includes("this.preCompositeMaterial.uniforms.uDisplacementSize.value.set("),
        noPerFrameTWorkCompositeRebind: Boolean(rebuildTick)
          && !rebuildTick.includes("this.preCompositeMaterial.uniforms.tWork.value = this.workCompositeTarget.texture")
          && !rebuildTick.includes("this.preCompositeMaterial.uniforms.tWork.value = preCompositeWorkTarget.texture"),
        noPerFrameTMediaRebind: Boolean(rebuildTick)
          && !rebuildTick.includes("this.preCompositeMaterial.uniforms.tMedia.value = this.mediaTarget.texture"),
        noPerFrameTMouseSimRebind: Boolean(rebuildTick)
          && !rebuildTick.includes("this.preCompositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture"),
      },
      excerpt: compact(sourceC1.text),
    },
    Se: sourceSe && {
      index: sourceSe.index,
      checks: checks(sourceSe.text, [
        "class Se",
        "static setAmbientColor(e,t=1.6){const n=this.formatColor(e)",
        "J.workScene.ambientLight.color",
        "J.workScene.env.material.customUniforms.uDarkenColor.value.set",
        "static setAmbientLight=(e,t=.5,n=1.6)=>{this.setAmbientColor(e,n),this.setAmbientIntensity(t,n)}",
        "static formatColor=e=>(typeof e==\"string\"",
        "e=sr(e)",
      ]),
      thumbStateOwnership: {
        source:
          sourceSe.text.includes("static setThumbDarknessIntensity=(e,t=1.6)=>{t===0?J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenIntensity.value=this.settings.thumb.darknessIntensity=e:oe.to(this.settings.thumb,{darknessIntensity:e")
          && sourceSe.text.includes("static setThumbDarknessColor=(e,t=1.6)=>{if(typeof e==\"string\"&&(e=sr(e)),t===0)")
          && sourceSe.text.includes("J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenColor.value.set(n,i,r),this.settings.thumb.darknessColor=e")
          && sourceSe.text.includes("static setThumbSaturation=(e,t=1.6)=>{t===0?J.workThumbScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.thumb.saturation=e:oe.to(this.settings.thumb,{saturation:e")
          && sourceSe.text.includes("static setThumbMouseLightness=(e,t=1.6)=>{t===0?J.workScene.blocks.forEach(n=>{n.instance.material.customUniforms.uMouseLightness.value=this.settings.thumb.mouseLightness=e}):oe.to(this.settings.thumb,{mouseLightness:e"),
        rebuild:
          rebuildWebgl.includes("private thumbState = {")
          && Boolean(rebuildSetThumbDarknessIntensity)
          && Boolean(rebuildSetThumbDarknessColor)
          && Boolean(rebuildSetThumbSaturation)
          && Boolean(rebuildSetThumbMouseLightness)
          && rebuildSetThumbDarknessIntensity.includes("gsap.to(this.thumbState, {")
          && rebuildSetThumbDarknessIntensity.includes("darknessIntensity: value")
          && rebuildSetThumbDarknessColor.includes("gsap.to(this.thumbState.darknessColor")
          && rebuildSetThumbSaturation.includes("gsap.to(this.thumbState, {")
          && rebuildSetThumbSaturation.includes("saturation: value")
          && rebuildSetThumbMouseLightness.includes("gsap.to(this.thumbState, {")
          && rebuildSetThumbMouseLightness.includes("mouseLightness: value")
          && rebuildWebgl.includes("stateOwnership: \"source-Se-settings-thumb-state-onUpdate-uniforms\"")
          && !rebuildSetThumbDarknessIntensity.includes("gsap.to(this.thumbCompositeMaterial.uniforms.uDarkenIntensity")
          && !rebuildSetThumbSaturation.includes("gsap.to(this.thumbCompositeMaterial.uniforms.uSaturation")
          && !rebuildSetThumbDarknessColor.includes("tweenColorOwned(this.thumbCompositeMaterial.uniforms.uDarkenColor")
          && !rebuildSetThumbMouseLightness.includes("gsap.to(item.material.uniforms.uMouseLightness"),
      },
      lightStateOwnership: {
        source:
          sourceSe.text.includes("directionalLight:{intensity:0},directionalLight2:{intensity:0},spotLight:{intensity:0}")
          && sourceSe.text.includes("static setDirectionalLightIntensity=(e,t=1.6,n=\"expo.out\")=>{this.directionalLightAnim&&this.directionalLightAnim.kill(),this.directionalLightAnim=oe.to(this.settings.directionalLight,{intensity:e")
          && sourceSe.text.includes("J.workScene.directionalLight.intensity=this.settings.directionalLight.intensity")
          && sourceSe.text.includes("static setDirectionalLight2Intensity=(e,t=1.6,n=\"expo.out\")=>{this.directionalLight2Anim&&this.directionalLight2Anim.kill(),this.directionalLight2Anim=oe.to(this.settings.directionalLight2,{intensity:e")
          && sourceSe.text.includes("J.workScene.directionalLight2.intensity=this.settings.directionalLight2.intensity")
          && sourceSe.text.includes("static setSpotLightIntensity=(e,t=1.6,n=\"expo.out\")=>{this.spotlightAnim&&this.spotlightAnim.kill(),this.spotlightAnim=oe.to(this.settings.spotLight,{intensity:e")
          && sourceSe.text.includes("J.workScene.spotLight.intensity=this.settings.spotLight.intensity"),
        rebuild:
          rebuildWebgl.includes("private lightState = {")
          && Boolean(rebuildSetSpotLightIntensity)
          && Boolean(rebuildSetDirectionalLightIntensity)
          && Boolean(rebuildSetDirectionalLight2Intensity)
          && rebuildSetSpotLightIntensity.includes("gsap.to(this.lightState.spotLight")
          && rebuildSetSpotLightIntensity.includes("this.spotLight.intensity = this.lightState.spotLight.intensity")
          && rebuildSetDirectionalLightIntensity.includes("gsap.to(this.lightState.directionalLight")
          && rebuildSetDirectionalLightIntensity.includes("this.directionalLight.intensity = this.lightState.directionalLight.intensity")
          && rebuildSetDirectionalLight2Intensity.includes("gsap.to(this.lightState.directionalLight2")
          && rebuildSetDirectionalLight2Intensity.includes("this.directionalLight2.intensity = this.lightState.directionalLight2.intensity")
          && rebuildWebgl.includes("mode: \"source-Se-settings-light-state-onUpdate-intensities\"")
          && !rebuildWebgl.includes("private spotLightIntensity =")
          && !rebuildWebgl.includes("private directionalLightIntensity =")
          && !rebuildWebgl.includes("private directionalLight2Intensity =")
          && !rebuildSetSpotLightIntensity.includes("gsap.to(this, {")
          && !rebuildSetDirectionalLightIntensity.includes("gsap.to(this, {")
          && !rebuildSetDirectionalLight2Intensity.includes("gsap.to(this, {"),
      },
      settingsStateOwnership: {
        source:
          sourceSe.text.includes("contrast:xt.contrast,darken:xt.darken,saturation:xt.saturation")
          && sourceSe.text.includes("mainColor:{r:0,g:0,b:0}")
          && sourceSe.text.includes("sceneReveal:0,envRotation:0,revealSpread:0,fluidStrength:0")
          && sourceSe.text.includes("media:{background:{r:0,g:0,b:0},opacity:0}")
          && sourceSe.text.includes("static setFluidStrength=(e,t=.5)=>{t===0?J.mainScene.renderManager.compositeMaterial.uniforms.uFluidStrength.value=this.settings.fluidStrength=e:oe.to(this.settings,{fluidStrength:e")
          && sourceSe.text.includes("static setRevealSpread=(e,t=1.6,n=\"power4.out\")=>{this.revealSpreadAnim&&this.revealSpreadAnim.kill(),this.revealSpreadAnim=oe.to(this.settings,{revealSpread:e")
          && sourceSe.text.includes("J.workScene.blocks.forEach((i,r)=>{i.instance.material.customUniforms.uRevealSpread.value=this.settings.revealSpread})")
          && sourceSe.text.includes("static setEnvRotation=(e,t=5.6)=>{this.envRotationAnim&&this.envRotationAnim.kill(),t===0?J.workScene.sceneWrap.rotation.x=this.settings.envRotation=e:this.envRotationAnim=oe.to(this.settings,{envRotation:e")
          && sourceSe.text.includes("static setSaturation=(e,t=1.6)=>{t===0?J.workScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.saturation=e:oe.to(this.settings,{saturation:e")
          && sourceSe.text.includes("static setDarken=(e=.25,t=.5)=>{t===0?J.workScene.renderManager.compositeMaterial.uniforms.uDarken.value=this.settings.darken=e:oe.to(this.settings,{darken:e")
          && sourceSe.text.includes("static showScene=(e,t=1.6)=>{oe.to(this.settings,{sceneReveal:1")
          && sourceSe.text.includes("J.mainScene.renderManager.compositeMaterial.uniforms.uReveal.value=this.settings.sceneReveal")
          && sourceSe.text.includes("static setContrast=(e,t=1.6)=>{t===0?J.mainScene.renderManager.compositeMaterial.uniforms.uContrast.value=this.settings.contrast=e:oe.to(this.settings,{contrast:e")
          && sourceSe.text.includes("static setMediaOpacity=(e,t=1.6,n=\"expo.out\",i=.25)=>{oe.to(this.settings.media,{opacity:e")
          && sourceSe.text.includes("J.mainScene.renderManager.compositeMaterial.uniforms.uMediaReveal.value=this.settings.media.opacity"),
        rebuild:
          rebuildWebgl.includes("private settingsState = {")
          && Boolean(rebuildSetDarken)
          && Boolean(rebuildSetSaturation)
          && Boolean(rebuildSetContrast)
          && Boolean(rebuildSetRevealSpread)
          && Boolean(rebuildSetEnvRotation)
          && Boolean(rebuildSetFluidStrength)
          && Boolean(rebuildSetMediaOpacity)
          && Boolean(rebuildShowScene)
          && rebuildSetDarken.includes("gsap.to(this.settingsState, {")
          && rebuildSetDarken.includes("this.compositeMaterial.uniforms.uDarken.value = this.settingsState.darken")
          && rebuildSetSaturation.includes("gsap.to(this.settingsState, {")
          && rebuildSetSaturation.includes("this.compositeMaterial.uniforms.uSaturation.value = this.settingsState.saturation")
          && rebuildSetContrast.includes("gsap.to(this.settingsState, {")
          && rebuildSetContrast.includes("this.preCompositeMaterial.uniforms.uContrast.value = this.settingsState.contrast")
          && rebuildSetRevealSpread.includes("gsap.to(this.settingsState, {")
          && rebuildSetRevealSpread.includes("item.material.uniforms.uRevealSpread.value = this.settingsState.revealSpread")
          && rebuildSetEnvRotation.includes("gsap.to(this.settingsState, {")
          && rebuildSetEnvRotation.includes("this.sceneWrap.rotation.x = this.settingsState.envRotation")
          && rebuildSetFluidStrength.includes("gsap.to(this.settingsState, {")
          && rebuildSetFluidStrength.includes("this.preCompositeMaterial.uniforms.uFluidStrength.value = this.settingsState.fluidStrength")
          && rebuildSetMediaOpacity.includes("gsap.to(this.settingsState.media, {")
          && rebuildSetMediaOpacity.includes("this.preCompositeMaterial.uniforms.uMediaReveal.value = this.settingsState.media.opacity")
          && rebuildShowScene.includes("gsap.to(this.settingsState, {")
          && rebuildShowScene.includes("this.preCompositeMaterial.uniforms.uReveal.value = this.settingsState.sceneReveal")
          && rebuildWebgl.includes("mode: \"source-Se-settings-scalar-media-state-onUpdate\"")
          && !rebuildWebgl.includes("private fluidStrength =")
          && !rebuildWebgl.includes("private darken =")
          && !rebuildWebgl.includes("private saturation =")
          && !rebuildWebgl.includes("private contrast =")
          && !rebuildWebgl.includes("private envRotation =")
          && !rebuildWebgl.includes("private sceneReveal =")
          && !rebuildWebgl.includes("private revealSpread =")
          && !rebuildWebgl.includes("private mediaSceneOpacity =")
          && !rebuildSetDarken.includes("gsap.to(this, {")
          && !rebuildSetSaturation.includes("gsap.to(this, {")
          && !rebuildSetContrast.includes("gsap.to(this, {")
          && !rebuildSetRevealSpread.includes("gsap.to(this, {")
          && !rebuildSetEnvRotation.includes("gsap.to(this, {")
          && !rebuildSetFluidStrength.includes("gsap.to(this, {")
          && !rebuildSetMediaOpacity.includes("gsap.to(this, {")
          && !rebuildShowScene.includes("gsap.to(this, {"),
      },
      colorStateOwnership: {
        source:
          sourceSe.text.includes("static setMainColor=(e,t=1.6)=>{const n=this.formatColor(e),i=document.querySelectorAll(\".c-color\")")
          && sourceSe.text.includes("this.settings.mainColor={r,g:o,b:a}")
          && sourceSe.text.includes("oe.to(this.settings.mainColor,{r:n.r,g:n.g,b:n.b")
          && sourceSe.text.includes("u.style.color=`rgb(${Fn(r*255,0)}, ${Fn(o*255,0)}, ${Fn(a*255,0)})`")
          && sourceSe.text.includes("static setMediaBackground=(e,t=1.6)=>{const n=this.formatColor(e)")
          && sourceSe.text.includes("this.settings.media.background=n,J.mediaScene.mediaItems.backgroundColor.set(n.r,n.g,n.b)")
          && sourceSe.text.includes("oe.to(this.settings.media.background,{r:n.r,g:n.g,b:n.b")
          && sourceSe.text.includes("J.mediaScene.mediaItems.backgroundColor.set(i,r,o)"),
        rebuild:
          rebuildWebgl.includes("mainColor: sourceRgbColor(SOURCE_INITIAL_PRIMARY, SOURCE_INITIAL_PRIMARY)")
          && rebuildWebgl.includes("background: sourceRgbColor(DEFAULT_BG, DEFAULT_BG)")
          && Boolean(rebuildSetMainColor)
          && Boolean(rebuildSetMediaBackground)
          && rebuildSetMainColor.includes("const css = sourceMainColorCss(this.settingsState.mainColor, decimals)")
          && rebuildSetMainColor.includes("this.settingsState.mainColor = next")
          && rebuildSetMainColor.includes("gsap.to(this.settingsState.mainColor")
          && rebuildSetMainColor.includes("onUpdate: () => writeColor(0)")
          && rebuildSetMediaBackground.includes("this.mediaBackground.copy(this.settingsState.media.background)")
          && rebuildSetMediaBackground.includes("plane.material.uniforms.uBackgroundColor.value.copy(this.settingsState.media.background)")
          && rebuildSetMediaBackground.includes("this.settingsState.media.background = next")
          && rebuildSetMediaBackground.includes("gsap.to(this.settingsState.media.background")
          && rebuildWebgl.includes("mainColorElementsMatchState")
          && rebuildWebgl.includes("mediaBackgroundMatchesState")
          && rebuildWebgl.includes("mediaPlaneBackgroundsMatchState")
          && !rebuildWebgl.includes("private mainColorTweens")
          && !rebuildWebgl.includes("private mediaBackgroundTweens")
          && !rebuildWebgl.includes("private mediaBackgroundState")
          && !rebuildSetMainColor.includes("gsap.to(element")
          && !rebuildSetMediaBackground.includes("gsap.to(this.mediaBackgroundState"),
      },
      excerpt: compact(sourceSe.text),
    },
    helperMaterialSurfaces: {
      lA: sourceLA && {
        index: sourceLA.index,
        checks: checks(sourceLA.text, [
          "class lA extends mt",
          "glslVersion:lt",
          "tMouseSim:new I(null)",
          "boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)",
          "vertexShader:el",
          "fragmentShader:aA",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        rebuildChecks: checks(rebuildWebgl, [
          "const mainCompositeFragment = `",
          "${sourceCompositeColorHelper}",
          "float luminance(vec3 rgb)",
          "uniform sampler2D tFluid;\nuniform sampler2D tBlur;",
          "float vignout = .55; // vignetting outer border",
          "float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .25);",
          "tMouseSim: { value: null }",
          "hasSourceUnusedMouseSimUniform: \"tMouseSim\" in this.mainCompositeMaterial.uniforms",
        ]),
        ownership: {
          sourceBoolConstructorDefaults:
            sourceLA.text.includes("boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)"),
          sourceLuRuntimeBoolWrites:
            sourceLu.text.includes("this.compositeMaterial.uniforms.boolBloom.value=this.settings.bloom.enabled")
            && sourceLu.text.includes("this.compositeMaterial.uniforms.boolFluid.value=this.settings.fluid.enabled")
            && sourceLu.text.includes("this.compositeMaterial.uniforms.boolLuminosity.value=this.settings.luminosity.enabled")
            && sourceLu.text.includes("this.compositeMaterial.uniforms.boolFxaa.value=this.settings.fxaa.enabled"),
          rebuildBoolConstructorDefaults:
            Boolean(rebuildCreateMainCompositeMaterial)
            && rebuildCreateMainCompositeMaterial.includes("boolBloom: { value: false }")
            && rebuildCreateMainCompositeMaterial.includes("boolFluid: { value: false }")
            && rebuildCreateMainCompositeMaterial.includes("boolLuminosity: { value: false }")
            && rebuildCreateMainCompositeMaterial.includes("boolFxaa: { value: false }")
            && rebuildCreateMainCompositeMaterial.includes("sourceConstructorBoolDefaults")
            && rebuildCreateMainCompositeMaterial.includes("sourceRuntimeBoolOwnership = \"source-Lu-update-writes-lA-bools-from-settings-before-composite-render\"")
            && !rebuildCreateMainCompositeMaterial.includes("boolBloom: { value: settings.bloom.enabled }")
            && !rebuildCreateMainCompositeMaterial.includes("boolFluid: { value: settings.fluid.enabled }")
            && !rebuildCreateMainCompositeMaterial.includes("boolLuminosity: { value: settings.luminosity.enabled }")
            && !rebuildCreateMainCompositeMaterial.includes("boolFxaa: { value: settings.fxaa.enabled }"),
          rebuildProbeCoverage:
            rebuildWebgl.includes("constructorBoolDefaults: this.mainCompositeMaterial.userData.sourceConstructorBoolDefaults")
            && rebuildWebgl.includes("runtimeBoolOwnership: this.mainCompositeMaterial.userData.sourceRuntimeBoolOwnership")
            && rebuildWebgl.includes("boolBloom: this.mainCompositeMaterial.uniforms.boolBloom.value")
            && rebuildWebgl.includes("boolFluid: this.mainCompositeMaterial.uniforms.boolFluid.value")
            && rebuildWebgl.includes("boolLuminosity: this.mainCompositeMaterial.uniforms.boolLuminosity.value")
            && rebuildWebgl.includes("boolFxaa: this.mainCompositeMaterial.uniforms.boolFxaa.value"),
        },
        excerpt: compact(sourceLA.text),
      },
      W1: sourceW1 && {
        index: sourceW1.index,
        checks: checks(sourceW1.text, [
          "class W1 extends mt",
          "glslVersion:lt",
          "vertexShader:el",
          "fragmentShader:G1",
          "transparent:!0",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        excerpt: compact(sourceW1.text),
      },
      sourceMatrixFullscreenVertex: {
        D1EqualsEl: sourceD1.trim() === sourceEl.trim(),
        TlEqualsD1: sourceTl.trim() === sourceD1.trim(),
        TlEqualsEl: sourceTl.trim() === sourceEl.trim(),
        rebuildAlias: rebuildWebgl.includes("const sourceMatrixFullscreenVertex = sourceTlFullscreenVertex;"),
        rebuildC1UsesMatrixVertex:
          rebuildWebgl.includes("dumpShader(\"A1-pre-composite\", sourceMatrixFullscreenVertex, homePreCompositeFragment)")
          && rebuildWebgl.includes("vertexShader: sourceMatrixFullscreenVertex,\n      fragmentShader: homePreCompositeFragment"),
        rebuildOAUsesMatrixVertex:
          rebuildWebgl.includes("dumpShader(\"OA-work-composite\", sourceMatrixFullscreenVertex, homeCompositeFragment)")
          && rebuildWebgl.includes("vertexShader: sourceMatrixFullscreenVertex,\n      fragmentShader"),
        rebuildLAUsesMatrixVertex:
          rebuildWebgl.includes("dumpShader(\"Lu-main-composite\", sourceMatrixFullscreenVertex, mainCompositeFragment)")
          && rebuildWebgl.includes("vertexShader: sourceMatrixFullscreenVertex,\n      fragmentShader: mainCompositeFragment"),
        rebuildW1UsesMatrixVertex:
          rebuildWebgl.includes("dumpShader(\"j1-media-composite\", sourceMatrixFullscreenVertex, mediaCompositeFragment)")
          && rebuildWebgl.includes("vertexShader: sourceMatrixFullscreenVertex,\n      fragmentShader: mediaCompositeFragment"),
      },
      sg: sourceSg && {
        index: sourceSg.index,
        checks: checks(sourceSg.text, [
          "class sg extends mt",
          "glslVersion:lt",
          "uniforms:{tMap:new I(null),uThreshold:new I(1),uSmoothing:new I(1)}",
          "fragmentShader:NT",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        ownership: {
          sourceConstructorDefaults:
            sourceSg.text.includes("uniforms:{tMap:new I(null),uThreshold:new I(1),uSmoothing:new I(1)}"),
          sourceLuInitSettingsWrites:
            sourceLu.text.includes("this.luminosityMaterial=new sg,this.luminosityMaterial.uniforms.uThreshold.value=this.settings.luminosity.threshold")
            && sourceLu.text.includes("this.luminosityMaterial.uniforms.uSmoothing.value=this.settings.luminosity.smoothing"),
          sourceI1InitSettingsWrites:
            sourceMainI1.text.includes("this.luminosityMaterial=new sg,this.luminosityMaterial.uniforms.uThreshold.value=this.settings.luminosity.threshold")
            && sourceMainI1.text.includes("this.luminosityMaterial.uniforms.uSmoothing.value=this.settings.luminosity.smoothing"),
          rebuildConstructorDefaultsThenSettings:
            Boolean(rebuildCreateLuminosityMaterial)
            && rebuildCreateLuminosityMaterial.includes("uThreshold: { value: 1 }")
            && rebuildCreateLuminosityMaterial.includes("uSmoothing: { value: 1 }")
            && rebuildCreateLuminosityMaterial.includes("sourceConstructorThreshold")
            && rebuildCreateLuminosityMaterial.includes("sourceConstructorSmoothing")
            && rebuildCreateLuminosityMaterial.includes("sourceInitSettingsOwnership = \"source-Lu-I1-initRenderer-writes-sg-threshold-smoothing-after-construction\"")
            && rebuildCreateLuminosityMaterial.includes("material.uniforms.uThreshold.value = luminosity.threshold")
            && rebuildCreateLuminosityMaterial.includes("material.uniforms.uSmoothing.value = luminosity.smoothing")
            && !rebuildCreateLuminosityMaterial.includes("uThreshold: { value: luminosity.threshold }")
            && !rebuildCreateLuminosityMaterial.includes("uSmoothing: { value: luminosity.smoothing }"),
          rebuildProbeCoverage:
            rebuildWebgl.includes("constructorThreshold: material.userData.sourceConstructorThreshold")
            && rebuildWebgl.includes("constructorSmoothing: material.userData.sourceConstructorSmoothing")
            && rebuildWebgl.includes("initSettingsOwnership: material.userData.sourceInitSettingsOwnership"),
        },
        excerpt: compact(sourceSg.text),
      },
      rg: sourceRg && {
        index: sourceRg.index,
        checks: checks(sourceRg.text, [
          "class rg extends mt",
          "glslVersion:lt",
          "fragmentShader:kT",
          "defines:{KERNEL_RADIUS:e,SIGMA:e}",
          "uniforms:{tMap:new I(null),tDetail:new I(null),tOverview:new I(null),tOverviewMask:new I(null),uDirection:new I(new Q(.5,.5)),uResolution:new I(new Q)}",
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
          "defines:{NUM_MIPS:5,DITHERING:e}",
          "uniforms:{tBlur1:new I(null),tBlur2:new I(null),tBlur3:new I(null),tBlur4:new I(null),tBlur5:new I(null),uBloomFactors:new I(null)}",
          "fragmentShader:nA",
          "blending:ot",
          "depthWrite:!1",
          "depthTest:!1",
        ]),
        rebuildChecks: checks(rebuildWebgl, [
          "DITHERING: undefined",
          "ditheringDefineMode: \"source-cg-defines-DITHERING-undefined\"",
          "ditheringDefinePresent",
          "ditheringDefineString",
        ]),
        excerpt: compact(sourceCg.text),
      },
      ig: sourceIg && {
        index: sourceIg.index,
        checks: checks(sourceIg.text, [
          "class ig extends mt",
          "glslVersion:lt",
          "uniforms:{tMap:new I(null),uResolution:new I(new Q)}",
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
      rebuildConstructorNullInputSamplers: {
        lensflareTMapNull: Boolean(rebuildCreateLensflareMaterial?.includes("tMap: { value: null }")),
        luminosityTMapNull: Boolean(rebuildCreateLuminosityMaterial?.includes("tMap: { value: null }")),
        bloomBlurTMapNull: Boolean(rebuildCreateBloomBlurMaterial?.includes("tMap: { value: null }")),
        standardBlurTMapNull: Boolean(rebuildCreateBlurMaterial?.includes("tMap: { value: null }")),
        fxaaTMapNull: Boolean(rebuildCreateFxaaMaterial?.includes("tMap: { value: null }")),
        bloomCompositeSamplersNull: Boolean(rebuildCreateBloomCompositeMaterial)
          && [
            "tBlur1: { value: null }",
            "tBlur2: { value: null }",
            "tBlur3: { value: null }",
            "tBlur4: { value: null }",
            "tBlur5: { value: null }",
            "uBloomFactors: { value: null }",
          ].every((needle) => rebuildCreateBloomCompositeMaterial.includes(needle)),
        bloomCompositePostConstructorBinding: Boolean(rebuildCreateBloomCompositeMaterial)
          && [
            "const material = new RawShaderMaterial({",
            "material.uniforms.tBlur1.value = verticalTargets[0].texture;",
            "material.uniforms.tBlur2.value = verticalTargets[1].texture;",
            "material.uniforms.tBlur3.value = verticalTargets[2].texture;",
            "material.uniforms.tBlur4.value = verticalTargets[3].texture;",
            "material.uniforms.tBlur5.value = verticalTargets[4].texture;",
            "material.uniforms.uBloomFactors.value = factors;",
            "return material;",
          ].every((needle) => rebuildCreateBloomCompositeMaterial.includes(needle)),
        noOldConstructorPreboundInputs: ![
          "tMap: { value: this.compositeTarget.texture }",
          "tMap: { value: this.workBloomBrightTarget.texture }",
          "tMap: { value: this.floorReflectionTarget.texture }",
          "tBlur1: { value: verticalTargets[0].texture }",
          "tBlur2: { value: verticalTargets[1].texture }",
          "tBlur3: { value: verticalTargets[2].texture }",
          "tBlur4: { value: verticalTargets[3].texture }",
          "tBlur5: { value: verticalTargets[4].texture }",
          "uBloomFactors: { value: factors }",
        ].some((needle) => rebuildWebgl.includes(needle)),
        runtimeProbeMarkers: [
          "tMapConstructorMode: \"source-sg-tMap-construct-null-branch-owned-binding\"",
          "tMapConstructorMode: \"source-Na-tMap-construct-null-branch-owned-binding\"",
          "tMapConstructorMode: \"source-rg-tMap-construct-null-branch-owned-binding\"",
          "tMapConstructorMode: \"source-ig-tMap-construct-null-branch-owned-binding\"",
          "samplerConstructorMode: \"source-cg-samplers-construct-null-initRenderer-binds-targets\"",
        ].every((needle) => rebuildWebgl.includes(needle)),
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
        "this.screen=new at(this.screenGeometry)",
        "this.screen.frustumCulled=!1",
        "this.renderTargetLensflare=this.renderTargetA.clone()",
        "this.settings.lensflare.enabled&&this.lensflareMaterial.uniforms.uResolution.value.set(e/8,t/8)",
        "e=Fa(e)/2,t=Fa(t)/2",
        "this.settings.fluid.enabled&&this.fluidSimulation&&this.fluidSimulation.onResize(e/3,t/3)",
        "this.compositeMaterial.uniforms.tLensflare.value=v.texture",
        "this.compositeMaterial.uniforms.tBloom.value=u[0].texture",
        "this.screen.material=this.lensflareMaterial",
        "this.screen.material=this.compositeMaterial",
        "r.setRenderTarget(a),r.render(o,i)",
        "r.setRenderTarget(h),r.render(this.screen,this.screenCamera)",
        "r.setRenderTarget(f),r.render(this.screen,this.screenCamera)",
        "r.setRenderTarget(g),r.render(this.screen,this.screenCamera)",
        "r.setRenderTarget(l),r.render(this.screen,this.screenCamera)",
      ]),
      screenOwnership: {
        sourceSingleScreenMesh: sourceMainI1.text.includes("this.screen=new at(this.screenGeometry)") && sourceMainI1.text.includes("this.screen.frustumCulled=!1"),
        sourceMaterialSwap: [
          "this.screen.material=this.lensflareMaterial",
          "this.screen.material=this.hBlurMaterial",
          "this.screen.material=this.vBlurMaterial",
          "this.screen.material=this.compositeMaterial",
        ].every((needle) => sourceMainI1.text.includes(needle)),
        sourceRenderToScreen: sourceMainI1.text.includes("r.setRenderTarget(null),r.render(this.screen,this.screenCamera)"),
        rebuildSourceScreenSwap: [
          "private mainPostScreen = makeSourcePassScreen()",
          "this.mainPostScreen.material = this.preCompositeMaterial",
          "this.mainPostScreen.material = this.mainBlurHorizontalMaterial",
          "this.mainPostScreen.material = this.mainBlurVerticalMaterial",
          "this.mainPostScreen.material = this.mainLensflareMaterial",
          "this.renderMainLuminosityPass(this.mainRawTarget)",
          "this.renderMainBloomPass(this.mainRawTarget)",
          "this.renderer.render(this.mainPostScreen, this.backgroundCamera)",
        ].every((needle) => rebuildWebgl.includes(needle)),
        sourceOwnedPassMaterialCreation: [
          "this.hBlurMaterial=new Na(wf)",
          "this.vBlurMaterial=new Na(Tf)",
          "this.FxaaMaterial=new ig",
          "this.luminosityMaterial=new sg",
          "this.settings.lensflare.enabled&&(this.lensflareMaterial=new L1",
          "this.blurMaterials.push(new rg(e[t]))",
          "this.BloomMaterial=new cg",
        ].every((needle) => sourceMainI1.text.includes(needle)),
        rebuildOwnedPassMaterialCreation: [
          "private mainLuminosityMaterial: ShaderMaterial;",
          "private mainBlurHorizontalMaterial: ShaderMaterial;",
          "private mainBlurVerticalMaterial: ShaderMaterial;",
          "private mainFxaaMaterial: ShaderMaterial;",
          "private mainLensflareMaterial?: ShaderMaterial;",
          "if (SOURCE_MAIN_LENSFLARE_SETTINGS.enabled) {\n      this.mainLensflareMaterial = this.createLensflareMaterial();\n    }",
          "if (SOURCE_MAIN_LENSFLARE_SETTINGS.enabled && this.mainLensflareMaterial)",
          "if (!SOURCE_MAIN_LENSFLARE_SETTINGS.enabled || !this.mainLensflareMaterial) return;",
          "ownership: \"source-I1-lensflareMaterial-created-only-when-enabled\"",
          "this.mainBlurHorizontalMaterial = this.createBlurMaterial(1, 0);",
          "this.mainBlurVerticalMaterial = this.createBlurMaterial(0, 1);",
          "this.mainFxaaMaterial = this.createFxaaMaterial();",
          "this.mainLuminosityMaterial = this.createLuminosityMaterial(this.sourceMainRenderSettings);",
          "this.mainBloomBlurMaterials = this.createBloomBlurMaterials();",
          "this.mainBloomCompositeMaterial = this.createBloomCompositeMaterial(this.mainBloomVerticalTargets, this.sourceMainRenderSettings);",
          "mainMaterialOwnership: \"source-I1-pass-materials-owned-by-main-render-manager\"",
        ].every((needle) => rebuildWebgl.includes(needle)),
        rebuildNoSharedPassMaterialFields: [
          "private luminosityMaterial: ShaderMaterial;",
          "private blurHorizontalMaterial: ShaderMaterial;",
          "private blurVerticalMaterial: ShaderMaterial;",
          "private fxaaMaterial: ShaderMaterial;",
          "private lensflareMaterial: ShaderMaterial;",
        ].every((needle) => !rebuildWebgl.includes(needle)),
        rebuildNoDedicatedPassScenes: [
          "private compositeScene",
          "private preCompositeScene",
          "private mainCompositeScene",
          "private lensflareScene",
          "private mainBloomCompositeScene",
          "private mainBloomBlurScenes",
          "private luminosityScene",
          "private bloomBlurScenes",
          "private bloomCompositeScene",
          "private blurHorizontalScene",
          "private blurVerticalScene",
          "private fxaaScene",
          "this.renderer.render(this.compositeScene",
          "this.renderer.render(this.blurHorizontalScene",
          "this.renderer.render(this.blurVerticalScene",
          "this.renderer.render(this.lensflareScene",
        ].every((needle) => !rebuildWebgl.includes(needle)),
        rebuildNoDefaultCompositeTargetMirror:
          !rebuildWebgl.includes("this.renderer.setRenderTarget(this.compositeTarget);\n    this.renderer.render(this.mainPostScreen, this.backgroundCamera);\n    this.renderHomeCompositePass();")
          && rebuildWebgl.includes("preCompositeTargetRole: \"source-I1-renderTargetComposite-unused-in-default-renderToScreen\""),
        rebuildSourcePassInputs: [
          "this.mainBlurHorizontalMaterial.uniforms.tMap.value = this.mainRawTarget.texture",
          "this.renderer.setRenderTarget(this.mainBlurTargetA)",
          "this.mainBlurVerticalMaterial.uniforms.tMap.value = this.mainBlurTargetA.texture",
          "this.renderer.setRenderTarget(this.mainBlurTargetB)",
          "this.renderMainLensflarePass(this.mainRawTarget)",
          "if (this.sourceMainRenderSettings.bloom.enabled) {\n      this.renderMainBloomPass(this.mainRawTarget);\n      this.preCompositeMaterial.uniforms.tBloom.value = this.mainBloomHorizontalTargets[0].texture;\n    }",
          "this.preCompositeMaterial.uniforms.tScene.value = this.sourceMainRenderSettings.blur.enabled ? this.mainBlurTargetB.texture : this.mainRawTarget.texture",
          "this.sourceMainRenderSettings.luminosity.enabled ? this.mainBloomBrightTarget : undefined",
        ].every((needle) => rebuildWebgl.includes(needle)),
        sourceTargetCloneGraph: [
          "this.renderTargetB=this.renderTargetA.clone()",
          "this.renderTargetLensflare=this.renderTargetA.clone()",
          "this.renderTargetBright=this.renderTargetA.clone()",
          "this.renderTargetComposite=this.renderTargetA.clone()",
          "this.renderTargetBlurA=this.renderTargetA.clone()",
          "this.renderTargetBlurB=this.renderTargetA.clone()",
          "this.renderTargetFXAA=this.renderTargetA.clone()",
        ].every((needle) => sourceMainI1.text.includes(needle)),
        sourceBlurTargetAReuse:
          sourceMainI1.text.includes("l=this.renderTargetComposite,h=this.renderTargetBlurA,f=this.renderTargetBlurB")
          && sourceMainI1.text.includes("this.hBlurMaterial.uniforms.tMap.value=a.texture")
          && sourceMainI1.text.includes("r.setRenderTarget(h),r.render(this.screen,this.screenCamera)")
          && sourceMainI1.text.includes("this.vBlurMaterial.uniforms.tMap.value=h.texture")
          && sourceMainI1.text.includes("r.setRenderTarget(f),r.render(this.screen,this.screenCamera)"),
        sourceBlurinessInitOnly:
          sourceMainI1.text.includes("this.hBlurMaterial.uniforms.uBluriness.value=0")
          && sourceMainI1.text.includes("this.vBlurMaterial.uniforms.uBluriness.value=0")
          && !sourceMainI1.text.includes("settings.blur.strength"),
        sourceBlurCompositeNotUsed:
          sourceMainI1.text.includes("l=this.renderTargetComposite,h=this.renderTargetBlurA,f=this.renderTargetBlurB")
          && !sourceMainI1.text.includes("this.vBlurMaterial.uniforms.tMap.value=l.texture")
          && !rebuildWebgl.includes("this.mainBlurVerticalMaterial.uniforms.tMap.value = this.compositeTarget.texture")
          && rebuildWebgl.includes("blurSource: \"source-I1-renderTargetA-to-renderTargetBlurA-then-renderTargetBlurB\"")
          && !rebuildWebgl.includes("blurSource: \"source-I1-renderTargetA-to-renderTargetComposite-then-renderTargetBlurB\""),
        rebuildTargetCloneGraph: [
          "private backgroundTarget = this.mainRawTarget.clone();",
          "private compositeTarget = this.mainRawTarget.clone();",
          "private mainLensflareTarget = this.mainRawTarget.clone();",
          "private mainBloomBrightTarget = this.mainRawTarget.clone();",
          "private mainBlurTargetA = this.mainRawTarget.clone();",
          "private mainBlurTargetB = this.mainRawTarget.clone();",
          "private mainFxaaTarget = this.mainRawTarget.clone();",
          "this.mainBloomHorizontalTargets = Array.from({ length: 5 }, () => this.mainRawTarget.clone());",
          "this.mainBloomVerticalTargets = Array.from({ length: 5 }, () => this.mainRawTarget.clone());",
          "source-I1-target-state-renderTargetA-depthBuffer-false-derived-clones",
          "source-I1-renderTargetA-clone-graph-depthless-raw",
        ].every((needle) => rebuildWebgl.includes(needle)),
        rebuildNoIndependentMainTargets: [
          "private backgroundTarget = makeSourceRenderTarget(false);",
          "private compositeTarget = makeSourceRenderTarget(false);",
          "private mainLensflareTarget = makeSourceRenderTarget(false);",
          "private mainBloomBrightTarget = makeSourceRenderTarget(false);",
          "this.mainBloomHorizontalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));",
          "this.mainBloomVerticalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));",
        ].every((needle) => !rebuildWebgl.includes(needle)),
        rebuildSourceMainCamera:
          rebuildWebgl.includes("private mainCamera = new PerspectiveCamera(55, 1, 1, 2000)")
          && rebuildWebgl.includes("private mainCameraDistance = 1000")
          && rebuildWebgl.includes("this.mainCamera.fov = sourceYgFov(width, width / height, this.mainCameraDistance)")
          && rebuildWebgl.includes("this.renderer.render(this.mainScene, this.mainCamera)")
          && !rebuildWebgl.includes("this.renderer.render(this.mainScene, this.homeCamera)"),
        rebuildC1UpdateAfterRender:
          rebuildWebgl.indexOf("this.renderHomeCompositePass();") >= 0
          && rebuildWebgl.indexOf("this.preCompositeMaterial.uniforms.uTime.value = time;", rebuildWebgl.indexOf("this.renderHomeCompositePass();")) > rebuildWebgl.indexOf("this.renderHomeCompositePass();")
          && rebuildWebgl.includes("mainCompositeUpdateOrder: \"source-U1-super-update-renders-I1-before-C1-update\""),
        sourceBloomBlurResizeResolution:
          sourceMainI1.text.includes("this.blurMaterials[i].uniforms.uResolution.value.set(e,t),e/=2,t/=2")
          && !sourceMainI1.text.includes("this.blurMaterials[p].uniforms.uResolution"),
        rebuildBloomBlurResizeResolution:
          rebuildResizeBloomMipChain?.includes("blurMaterials[index]?.uniforms.uResolution.value.set(mipWidth, mipHeight);")
          && rebuildWebgl.includes("this.resizeBloomMipChain(\n        this.mainBloomHorizontalTargets,\n        this.mainBloomVerticalTargets,\n        this.mainBloomBlurMaterials,")
          && !rebuildRenderBloomChain?.includes("blurMaterial.uniforms.uResolution.value.set"),
      },
      excerpt: compact(sourceMainI1.text),
    },
    mainYg: sourceMainYg && {
      index: sourceMainYg.index,
      checks: checks(sourceMainYg.text, [
        "class yg extends Iu",
        "this.distance=1e3",
        "this.fov=Ef(innerWidth,innerWidth/innerHeight,this.distance)",
        "this.camera=new Ya(this.fov,Pe.aspect,1,this.distance*2)",
        "this.camera.position.set(0,0,this.distance)",
        "setCameraController(){}",
        "this.camera.fov=Ef(e,e/t,this.distance)",
        "this.camera.aspect=e/t",
        "this.camera.updateProjectionMatrix()",
      ]),
      excerpt: compact(sourceMainYg.text),
    },
    mainU1Scene: sourceMainU1Scene && {
      index: sourceMainU1Scene.index,
      checks: checks(sourceMainU1Scene.text, [
        "class U1 extends yg",
        "this.scene.background=new ye(\"#D9D9D9\").convertLinearToSRGB()",
        "setRenderManager(){this.renderManager=new I1(this.renderer,this.scene,this.camera)}",
        "update(e,t,n){super.update(e,t,n),this.renderManager.compositeMaterial.update(e,t,n)}",
        "resize(e,t,n){super.resize(e,t,n),this.renderManager.compositeMaterial.resize(e,t)}",
      ]),
      rebuildChecks: {
        mainRawCameraMode: rebuildWebgl.includes("mainRawCameraMode: \"source-yg-perspective-distance-1000-no-camera-controller\""),
        mainRawRenderCamera: rebuildWebgl.includes("mainRawRenderCamera: \"source-U1-I1-renderTargetA-uses-yg-camera\""),
        c1UpdateOrder: rebuildWebgl.includes("uTimeUpdateOrder: \"source-U1-C1-update-after-I1-render\""),
      },
      excerpt: compact(sourceMainU1Scene.text),
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
        "this.addScene(this.skyScene,\"sky\")",
        "this.addScene(this.mediaScene,\"media\")",
        "this.addScene(this.workScene,\"work\")",
        "this.addScene(this.mainScene,\"main\")",
        "this.addScene(this.workThumbScene,\"workthumb\")",
        "this.addScene(this.wavvesScene,\"wavves\")",
        "this.addScene(this.characterScene,\"character\")",
        "await Xt.blueNoise,await Xt.floorNormal,await Xt.perlin1,await Xt.perlin2",
        "pe.emit(xe.RESIZE),await fn(100)",
        "this.mainScene.renderManager.compositeMaterial.uniforms.tWork.value=this.workScene.renderManager.renderTargetComposite.texture",
        "this.mainScene.renderManager.compositeMaterial.uniforms.tMedia.value=this.mediaScene.renderManager.renderTargetComposite.texture",
        "this.mainScene.renderManager.compositeMaterial.uniforms.tMouseSim.value=this.workScene.renderManager.mouseSimulation.bufferSim.output.texture",
        "const e=this.skyScene.renderManager.renderTargetComposite.texture;e.wrapS=e.wrapT=ci",
        "this.workScene.env.material.customUniforms.tSky.value=e",
      ]),
      sceneOrder: ["sky", "media", "work", "main", "workthumb", "wavves", "character"].map((id) => ({
        id,
        index: sourceCanvasManager.text.indexOf(`this.addScene(this.${id === "workthumb" ? "workThumb" : id}Scene,"${id}")`),
      })),
      rebuildOrderChecks: checks(rebuildWebgl, [
        "rebuildSceneOrder: [\"sky\", \"media\", \"work\", \"main\", \"workthumb\", \"wavves\", \"character\"]",
        "rebuildFrameOrder: [\"media-position\", \"sky\", \"media\", \"work-raw\", \"work-bloom\", \"work-mousesim\", \"work-composite\", \"p1-post-render\", \"main-raw\", \"main-blur\", \"main-lensflare\", \"main-luminosity\", \"main-bloom\", \"main-fluid\", \"main-C1\", \"main-final-screen\", \"workthumb\", \"wavves\", \"character-when-about\"]",
        "workUpdateOrder: [\"Lu.renderManager.raw\", \"Lu.renderManager.bloom\", \"Ka.mouseSimulation\", \"Lu.renderManager.composite\", \"IT.cameraController\", \"p1.components\"]",
        "mainUpdateOrder: [\"I1.raw\", \"I1.optional-blur\", \"I1.optional-lensflare\", \"I1.optional-luminosity\", \"I1.optional-bloom\", \"I1.fluid\", \"I1.C1-screen\"]",
        "mouseSimulationOrder: \"source-Lu-mousesim-after-raw-bloom-before-composite\"",
        "tWorkBindingMode: \"source-nD-init-one-time-C1-tWork-work-renderTargetComposite\"",
        "tMediaBindingMode: \"source-nD-init-one-time-C1-tMedia-media-renderTargetComposite\"",
        "tMouseSimBindingMode: \"source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output\"",
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
      threeTextureDefaults: checks(threeTextureSource, [
        "magFilter = LinearFilter",
        "minFilter = LinearMipmapLinearFilter",
        "anisotropy = Texture.DEFAULT_ANISOTROPY",
        "this.generateMipmaps = true",
      ]),
      threeVideoTextureDefaults: checks(threeVideoTextureSource, [
        "this.minFilter = minFilter !== undefined ? minFilter : LinearFilter",
        "this.magFilter = magFilter !== undefined ? magFilter : LinearFilter",
        "this.generateMipmaps = false",
      ]),
      rebuildLoadedTextureDefaults: {
        sourceLoadedTextureHelper: rebuildWebgl.includes("function applySourceLoadedTextureState(texture: Texture"),
        noLoadedTextureFilterOverride: !rebuildWebgl.includes("function setTextureQuality")
          && !sourceLoadedTextureHelperBody.includes("texture.minFilter")
          && !sourceLoadedTextureHelperBody.includes("texture.magFilter")
          && !sourceLoadedTextureHelperBody.includes("texture.anisotropy"),
        runtimeGuard: rebuildWebgl.includes("sourceLoadedTextureMode: \"source-Xt-TextureLoader-default-sampling-wrap-only-overrides\""),
      },
      webpDetection: sourceWebpDetection && {
        index: sourceWebpDetection.index,
        checks: checks(sourceWebpDetection.text, [
          "await k0(\"lossy\").then(()=>{Le.WEBP=!0}).catch(()=>{Le.WEBP=!1})",
        ]),
        rebuildChecks: {
          detector: rebuildWebgl.includes("function detectSourceWebpSupport()"),
          sharedTextureExt: rebuildWebgl.includes("const sourceExt: \"webp\" | \"jpg\" = this.sourceWebpSupport ? \"webp\" : \"jpg\""),
          floorNormalUsesSourceExt: rebuildWebgl.includes("`/images/textures/floor-normal.${sourceExt}`"),
          perlin1UsesSourceExt: rebuildWebgl.includes("`/images/textures/perlin-1.${sourceExt}`"),
          perlin2UsesSourceExt: rebuildWebgl.includes("`/images/textures/perlin-2.${sourceExt}`"),
          runtimeGuard: rebuildWebgl.includes("sourceWebpDetectionMode: \"source-Qe-k0-lossy-before-Xt-preloadTextures\""),
        },
        excerpt: compact(sourceWebpDetection.text),
      },
      excerpt: compact(sourceTextureManager.text),
    },
    p1AddEnvironment: sourceP1AddEnvironment && {
      index: sourceP1AddEnvironment.index,
      checks: checks(sourceP1AddEnvironment.text, [
        "async addEnvironment(){const e=Le.WEBP?\"webp\":\"jpg\"",
        "const e=Le.WEBP?\"webp\":\"jpg\",t=await f1(\"/images/cubemaps/01\",e);this.scene.environment=t",
      ]),
      rebuildChecks: {
        cubemapUsesSourceExt: rebuildWebgl.includes("`${cubeBase}/${side}.${sourceExt}`"),
        sourceLoadModeGuard: rebuildWebgl.includes("sceneEnvironmentLoadMode: this.sourceCubemapLoadState.mode"),
        noHardcodedCubeExt: !rebuildWebgl.includes("const cubeExt = \"webp\""),
        noRuntimeJpgFallback: !rebuildWebgl.includes("`${cubeBase}/${side}.jpg`"),
        runtimeGuard: rebuildWebgl.includes("source-p1-addEnvironment-Le-WEBP-selected-extension-no-runtime-fallback"),
      },
      excerpt: compact(sourceP1AddEnvironment.text),
    },
    Pe: sourcePe && {
      index: sourcePe.index,
      checks: checks(sourcePe.text, [
        "this.maxDpr=Le.LOW_RES?1.5:2",
        "this.dpr=Math.min(this.maxDpr,window.devicePixelRatio)",
        "static updateDpr(e){this.maxDpr=e,this.dpr=um&&!this.isMobile?1:this.maxDpr,this.onResize()}",
        "addEventListener(\"mousemove\",this.onMouseMove)",
        "this.mouse.normalized={x:this.mouse.x/this.w,y:1-this.mouse.y/this.h}",
        "pe.emit(xe.MOUSE_MOVE,this.mouse,{w:this.w,h:this.h})",
      ]),
      rebuildMouseChecks: checks(rebuildWebgl, [
        "window.addEventListener(\"mousemove\", this.onMouseMove, { passive: true })",
        "const sourceWidth = Math.max(1, this.root.offsetWidth || window.innerWidth)",
        "const sourceHeight = Math.max(1, this.root.offsetHeight || window.innerHeight)",
        "this.targetPointer.x = (event.clientX / sourceWidth - 0.5) * 2",
        "this.targetPointer.y = -(event.clientY / sourceHeight - 0.5) * 2",
        "this.screenMouseSimTargetPos.set(event.clientX / sourceWidth, 1 - event.clientY / sourceHeight)",
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
        "this.cameraController.origin.z=5.5",
        "this.sceneWrap.position.y=0",
        "this.cameraController.origin.z=5",
        "this.sceneWrap.position.y=.3",
      ]),
      excerpt: compact(sourceP1Resize.text),
    },
    p1CameraControllerSettings: sourceP1CameraSettings && {
      index: sourceP1CameraSettings.index,
      checks: checks(sourceP1CameraSettings.text, [
        "setCameraControllerSettings(e=new L(0,0,0),t=new Q(.25,.25),n=10)",
        "this.cameraController.lookAt=e",
        "this.cameraController.targetXY.set(t.x,t.y)",
        "this.cameraController.rotateAngle=Xc(n)",
      ]),
      excerpt: compact(sourceP1CameraSettings.text),
    },
    ITCameraController: sourceIT && {
      index: sourceIT.index,
      checks: checks(sourceIT.text, [
        "class IT{constructor",
        "this.mouse.set(document.documentElement.clientWidth/2,document.documentElement.clientHeight/2)",
        "this.group=new rt,this.rotateGroup=new rt,this.innerGroup=new rt",
        "this.rotateGroup.add(this.innerGroup),this.group.add(this.rotateGroup)",
        "this.group.matrixAutoUpdate=!1,this.rotateGroup.matrixAutoUpdate=!1,this.innerGroup.matrixAutoUpdate=!1",
        "this.rotateGroup.rotation.y=Math.PI",
        "this.targetXY=new Q(1,.5)",
        "this.rotateAngle=Xc(20)",
        "this.origin.z=this.group.position.z",
        "const{w:r,h:o}=Pe,a=i!==void 0?Math.min(Fn(2/(i/60),0),2)*.01:.01",
        "this.target.z=this.origin.z+this.targetXY.y*(u*1.25)",
        "this.group.position.lerp(this.target,a)",
        "this.rotateGroup.rotation.z+=(this.rotation-this.rotateGroup.rotation.z)*a",
        "this.innerGroup.matrixWorld.decompose(this.camera.position,this.camera.quaternion,this.camera.scale)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private cameraControllerGroup = new Object3D()",
        "private cameraRotateGroup = new Object3D()",
        "private cameraInnerGroup = new Object3D()",
        "controllerObjectMode: \"source-IT-rt-object3d-containers\"",
        "controllerObjectTypes:",
      ]),
      excerpt: compact(sourceIT.text),
    },
    homeGalleryAnimateIn: sourceYDAnimateIn && {
      index: sourceYDAnimateIn.index,
      checks: checks(sourceYDAnimateIn.text, [
        "J.workScene.setMouseFactor(0)",
        "Se.setCameraControllerSettings(new L(0,0,0),new Q(1,.5),20)",
        "ln.playPlucks()",
        "J.workScene.setMouseFactor(this.mouseF)",
      ]),
      excerpt: compact(sourceYDAnimateIn.text),
    },
    homeGalleryUpdateScene: sourceYDUpdateScene && {
      index: sourceYDUpdateScene.index,
      checks: checks(sourceYDUpdateScene.text, [
        "J.workScene.sceneWrap.rotation.y=_a.degToRad(this.scroll.progress*360+180)",
        "J.mainScene.renderManager.compositeMaterial.uniforms.uTransformX.value=this.scroll.progress*1",
        "J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)",
        "J.workScene.scene.rotation.z=_a.degToRad(this.sceneRotation)",
        "J.workScene.scene.position.z=J.workScene.scene.rotation.z-this.zoom",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "this.preCompositeMaterial.uniforms.uTransformX.value = progress",
        "const targetRotation = MathUtils.degToRad(progress * 360 + 180)",
        "this.sceneWrap.rotation.y = targetRotation",
        "this.homeScene.rotation.z = MathUtils.degToRad(this.sceneRotation)",
        "this.homeScene.position.z = this.homeScene.rotation.z - this.zoom",
        "this.updateThumbGallery(-progress)",
        "sourceProgressSignMode: \"source-yD-updateScene-workThumbScene-thumbs-updateGalleryProgress-negative-scroll-progress\"",
        "sourceProgressUpdateOrder: \"source-yD-sceneWrap-uTransformX-thumbProgress-before-roll-zoom\"",
      ]),
      sourceOrder: {
        sceneWrapBeforeThumb:
          sourceYDUpdateScene.text.indexOf("J.workScene.sceneWrap.rotation.y=_a.degToRad(this.scroll.progress*360+180)")
          < sourceYDUpdateScene.text.indexOf("J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)"),
        transformBeforeThumb:
          sourceYDUpdateScene.text.indexOf("J.mainScene.renderManager.compositeMaterial.uniforms.uTransformX.value=this.scroll.progress*1")
          < sourceYDUpdateScene.text.indexOf("J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)"),
        thumbBeforeRoll:
          sourceYDUpdateScene.text.indexOf("J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)")
          < sourceYDUpdateScene.text.indexOf("J.workScene.scene.rotation.z=_a.degToRad(this.sceneRotation)"),
        thumbBeforeZoom:
          sourceYDUpdateScene.text.indexOf("J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)")
          < sourceYDUpdateScene.text.indexOf("J.workScene.scene.position.z=J.workScene.scene.rotation.z-this.zoom"),
      },
      rebuildOrder: rebuildSetGalleryProgress && {
        sceneWrapBeforeThumb:
          rebuildSetGalleryProgress.indexOf("this.sceneWrap.rotation.y = targetRotation")
          < rebuildSetGalleryProgress.indexOf("this.updateThumbGallery(-progress)"),
        transformBeforeThumb:
          rebuildSetGalleryProgress.indexOf("this.preCompositeMaterial.uniforms.uTransformX.value = progress")
          < rebuildSetGalleryProgress.indexOf("this.updateThumbGallery(-progress)"),
        thumbBeforeRoll:
          rebuildSetGalleryProgress.indexOf("this.updateThumbGallery(-progress)")
          < rebuildSetGalleryProgress.indexOf("this.homeScene.rotation.z = MathUtils.degToRad(this.sceneRotation)"),
        thumbBeforeZoom:
          rebuildSetGalleryProgress.indexOf("this.updateThumbGallery(-progress)")
          < rebuildSetGalleryProgress.indexOf("this.homeScene.position.z = this.homeScene.rotation.z - this.zoom"),
      },
      excerpt: compact(sourceYDUpdateScene.text),
    },
    homeGalleryActiveReveal: sourceYDOnProjectActive && {
      index: sourceYDOnProjectActive.index,
      checks: checks(sourceYDOnProjectActive.text, [
        "J.workScene.blocks.forEach((a,c)=>{c!==n&&this.inAnimation.to(a.instance.material.customUniforms.uReveal",
        "this.inAnimation.to(J.workScene.blocks[n].instance.material.customUniforms.uReveal,{value:1,delay:.2,ease:\"power4.out\",duration:4},0)",
        "Se.setRevealSpread(0)",
      ]),
      ownership: {
        sourceActiveRevealOnly:
          sourceYDOnProjectActive.text.includes("customUniforms.uReveal,{value:0,ease:\"power4.out\",duration:1.6}")
          && sourceYDOnProjectActive.text.includes("customUniforms.uReveal,{value:1,delay:.2,ease:\"power4.out\",duration:4}")
          && !sourceYDOnProjectActive.text.includes("uRevealProject"),
        rebuildActiveRevealOnly:
          Boolean(rebuildSetProjectBlockReveal)
          && rebuildSetProjectBlockReveal.includes("const revealTween = gsap.to(item.material.uniforms.uReveal")
          && rebuildSetProjectBlockReveal.includes("duration: isActive ? 4 : 1.6")
          && rebuildWebgl.includes("activeProjectRevealOwnership: \"source-yD-onProjectActive-uReveal-only-uRevealProject-owned-by-gallery-enter-out\"")
          && !rebuildSetProjectBlockReveal.includes("projectRevealProjectTweens")
          && !rebuildSetProjectBlockReveal.includes("uRevealProject"),
      },
      excerpt: compact(sourceYDOnProjectActive.text),
    },
    homeSpotlightMap: sourceSDInitSpotlight && {
      index: sourceSDInitSpotlight.index,
      checks: checks(sourceSDInitSpotlight.text, [
        "J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture",
      ]),
      p1SetLights: sourceP1SetLights && {
        index: sourceP1SetLights.index,
        checks: checks(sourceP1SetLights.text, [
          "this.maxSpotLightIntensity=220",
          "this.spotLight.position.set(0,0,3.7)",
          "this.spotLight.angle=Math.PI/4",
          "this.spotLight.penumbra=.95",
          "this.directionalLight.position.set(10.5,10,1)",
          "this.directionalLight2=new So(new ye(\"white\"),1)",
          "this.directionalLight2.position.set(-10.5,5,-1)",
          "this.scene.add(this.directionalLight)}",
        ]),
        excerpt: compact(sourceP1SetLights.text),
      },
      sdInitChecks: checks(sourceSDInitSpotlight.text, [
        "J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture",
        "J.workScene.spotLight.position.set(0,0,3.7)",
        "J.workScene.spotLight.target.position.set(0,0,-8)",
        "J.workScene.spotLight.intensity=220",
      ]),
      threeR164MapPath: {
        webglLights: checks(threeWebglLights, [
          "if ( light.map )",
          "state.spotLightMap[ numSpotMaps ] = light.map",
          "shadow.updateMatrices( light )",
          "if ( light.castShadow ) numSpotShadowsWithMaps ++",
          "state.spotLightMatrix[ spotLength ] = shadow.matrix",
        ]),
        lightsFragmentBegin: checks(threeLightsFragmentBegin, [
          "spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w",
          "spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy )",
          "directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color",
        ]),
        shadowmapVertex: checks(threeShadowmapVertex, [
          "NUM_SPOT_LIGHT_COORDS > 0",
          "shadowWorldPosition = worldPosition",
          "vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition",
        ]),
      },
      excerpt: compact(sourceSDInitSpotlight.text),
      sourceNoExplicitCastShadow: !sourceSDInitSpotlight.text.includes(".castShadow")
        && !sourceP1SetLights?.text.includes(".castShadow"),
      sourceDirectSpotlightState:
        sourceP1Update?.text.includes("this.spotLight.position.x=this.camera.position.x*.175")
        && sourceP1Update?.text.includes("this.spotLight.position.y=this.camera.position.y*.175")
        && sourceP1Update?.text.includes("Pe.w>=Le.BREAKPOINTS.MD?this.spotLight.position.y=this.camera.position.y*.175:this.spotLight.position.y=.3+this.camera.position.y*.175")
        && sourceSDInitSpotlight.text.includes("J.workScene.spotLight.target.position.set(0,0,-8)")
        && sourceTDSpotlight?.text.includes("J.workScene.spotLight.position.set(J.workScene.aboutBlocks.position.x-.5")
        && sourceTDSpotlight?.text.includes("J.workScene.spotLight.target.position.set(J.workScene.aboutBlocks.position.x+1.5"),
      rebuildDirectSpotlightState:
        rebuildWebgl.includes("positionOwnershipMode: \"source-direct-SpotLight-position-target-no-local-mirror\"")
        && rebuildWebgl.includes("parallaxMode: \"source-p1-spotLight-x-camera-y-desktop-or-0_3-mobile\"")
        && rebuildWebgl.includes("this.spotLight.position.x = this.homeCamera.position.x * 0.175")
        && rebuildWebgl.includes("this.spotLight.position.y = (window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3) + this.homeCamera.position.y * 0.175")
        && rebuildWebgl.includes("this.spotLight.target.position.set(0, 0, -8)")
        && rebuildWebgl.includes("this.spotLight.position.set(item.group.position.x - 0.5")
        && rebuildWebgl.includes("this.spotLight.target.position.set(item.group.position.x + 1.5")
        && !rebuildWebgl.includes("spotLightPosition")
        && !rebuildWebgl.includes("spotLightTarget")
        && !rebuildWebgl.includes("updateSpotLightBasis")
        && !rebuildWebgl.includes("spotLightRight")
        && !rebuildWebgl.includes("spotLightUp"),
      rebuildMapProjectionGuards:
        rebuildWebgl.includes("this.thumbWrap.frustumCulled = false")
        && rebuildWebgl.includes("projectionPath: \"source-SpotLight.map-without-castShadow\"")
        && rebuildWebgl.includes("shadowPathMode: \"source-map-projection-not-shadow-cast\""),
    },
    p1EnvironmentHierarchy: sourceP1InitEnv && {
      index: sourceP1InitEnv.index,
      checks: checks(sourceP1InitEnv.text, [
        "this.blocksWrap=new rt,this.sceneWrap=new rt",
        "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)",
        "this.env.position.y=-12.65",
        "this.env.rotation.y=-Xc(this.rotationAdjustment)",
        "this.sceneWrap.add(this.env)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private sceneWrap = new Object3D()",
        "private blocksWrap = new Object3D()",
        "private floorGroup = new Object3D()",
        "private environmentGroup = new Object3D()",
        "mode: \"source-a1-i1-rt-object3d-floorPlane-reflector\"",
        "hierarchyMode: \"source-h1-rt-object3d-owns-transform\"",
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
        "update(e,t,n){this.material.update(e,t,n)}",
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
        "ROUGHNESS_INTENSITY:.94",
        "METALNESS_INTENSITY:1",
        "EMISSIVE_INTENSITY:.5",
        "constructor(e){super(e)",
        "this.dithering=!0",
        "this.customUniforms={uTime:new I(0)",
        "uMultiplier:new I(2)",
        "uDarken:new I(1)",
        "tSky:new I(null)",
        "uShader1Alpha:new I(Qn.SHADER_1_ALPHA)",
        "uShader1Mix3:new I(Qn.SHADER_1_MIX_3)",
        "t.uniforms.uMultiplier=this.customUniforms.uMultiplier",
        "t.uniforms.tSky=this.customUniforms.tSky",
        "t.vertexShader=c1,t.fragmentShader=l1",
      ]),
      fragmentChecks: checks(sourceEnvironmentL1, [
        "${xg}",
        "${gg}",
        "${vg}",
        "${Po}",
        "#define STANDARD",
        "uniform sampler2D tSky",
      ]),
      rebuildCustomUniformOwnership: {
        factoryFound: Boolean(rebuildEnvironmentMaterialFactory),
        customUniformsOnly: Boolean(rebuildEnvironmentMaterialFactory)
          && rebuildEnvironmentMaterialFactory.includes("material.customUniforms = uniforms;")
          && !rebuildEnvironmentMaterialFactory.includes("material.uniforms = uniforms;"),
        runtimeProbe: rebuildWebgl.includes("customUniformsMode: \"source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias\"")
          && rebuildWebgl.includes("hasMaterialUniformsAlias: \"uniforms\" in this.environmentMaterial"),
        updatePathsUseCustomUniforms: [
          "this.environmentMaterial.customUniforms.uDarkenColor.value",
          "this.environmentMaterial.customUniforms.uTime.value",
          "this.environmentMaterial.customUniforms.tSky.value",
        ].every((needle) => rebuildWebgl.includes(needle)),
        noRuntimeEnvironmentUniformAliasAccess: !rebuildWebgl.includes("this.environmentMaterial.uniforms."),
      },
      excerpt: compact(sourceU1.text),
    },
    floorA1: sourceA1Floor && {
      index: sourceA1Floor.index,
      checks: checks(sourceA1Floor.text, [
        "class a1 extends rt",
        "this.reflector=new i1",
        "const e=await Xt.floorNormal;e.repeat.set(45,45)",
        "n.uniforms.tReflect=this.reflector.renderTargetUniform",
        "n.uniforms.uMatrix=this.reflector.textureMatrixUniform",
        "i.onBeforeRender=(r,o,a)=>{this.visible=!1,this.reflector.update(this.renderer,this.scene,this.camera),this.visible=!0}",
        "this.add(i),this.material=n",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private floorReflectionTextureMatrixUniform = { value: this.floorReflectionMatrix }",
        "private floorReflectionRenderTargetUniform = { value: this.floorReflectionReadTarget.texture }",
        "private floorGroup = new Object3D()",
        "private floorReflector = new Object3D()",
        "tReflect: this.floorReflectionRenderTargetUniform",
        "uMatrix: this.floorReflectionTextureMatrixUniform",
        "groupType: this.floorGroup.type",
        "reflectionUniformOwnership: \"source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform\"",
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
      sourceShaderChecks: checks(sourceFloorS1, [
        "${lg}",
        "#ifdef DITHERING",
      ]),
      sourceDitherChecks: {
        ...checks(sourceDitherRandomTA, [
          "float random(vec2 co)",
          "float sn = mod(dt, 3.14)",
          "return fract(sin(sn) * c)",
        ]),
        ...checks(sourceDitherLG, [
          "${tA}",
          "vec3 dither(vec3 color)",
        ]),
      },
      rebuildChecks: checks(rebuildWebgl, [
        "float sn = mod(dt, 3.14)",
        "return fract(sin(sn) * c)",
      ]),
      excerpt: compact(sourceO1FloorMaterial.text),
    },
    floorT1Blur: sourceT1FloorBlur && {
      index: sourceT1FloorBlur.index,
      checks: checks(sourceT1FloorBlur.text, [
        "class t1 extends mt",
        "glslVersion:lt",
        "uniforms:{tMap:new I(null),uDirection:new I(new Q(1,0)),uResolution:new I(new Q)}",
        "fragmentShader:QA",
        "blending:ot",
        "depthWrite:!1",
        "depthTest:!1",
      ]),
      rebuildChecks: {
        floorReflectionBlurTMapNull: Boolean(rebuildCreateFloorReflectionBlurMaterial?.includes("tMap: { value: null }")),
        runtimeProbeMarker:
          rebuildWebgl.includes("reflectionBlurTMapConstructorMode: \"source-t1-tMap-construct-null-update-loop-binds\"")
          && rebuildWebgl.includes("blurTMapConstructorMode: \"source-t1-tMap-construct-null-update-loop-binds\""),
      },
      excerpt: compact(sourceT1FloorBlur.text),
    },
    floorI1Reflector: sourceI1 && {
      index: sourceI1.index,
      checks: checks(sourceI1.text, [
        "class i1 extends rt",
        "this.renderTarget=new Dn(e,t,{depthBuffer:!1})",
        "this.renderTarget.depthBuffer=!0",
        "this.renderTargetRead=this.renderTarget.clone()",
        "this.renderTargetWrite=this.renderTarget.clone()",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private floorReflectionTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false })",
        "private floorReflectionReadTarget = this.floorReflectionTarget.clone()",
        "private floorReflectionWriteTarget = this.floorReflectionTarget.clone()",
        "private floorReflector = new Object3D()",
        "reflectorType: this.floorReflector.type",
        "this.floorReflectionTarget.depthBuffer = true",
        "readConstructionMode: \"source-i1-renderTargetRead-renderTarget-clone\"",
        "writeConstructionMode: \"source-i1-renderTargetWrite-renderTarget-clone\"",
      ]),
      rebuildNoManualTextureDefaults: ![
        "this.floorReflectionTarget.texture.generateMipmaps = false",
        "this.floorReflectionTarget.texture.minFilter = LinearFilter",
        "this.floorReflectionTarget.texture.magFilter = LinearFilter",
        "this.floorReflectionReadTarget.texture.generateMipmaps = false",
        "this.floorReflectionReadTarget.texture.minFilter = LinearFilter",
        "this.floorReflectionReadTarget.texture.magFilter = LinearFilter",
        "this.floorReflectionWriteTarget.texture.generateMipmaps = false",
        "this.floorReflectionWriteTarget.texture.minFilter = LinearFilter",
        "this.floorReflectionWriteTarget.texture.magFilter = LinearFilter",
      ].some((needle) => rebuildWebgl.includes(needle)),
      excerpt: compact(sourceI1.text),
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
        "a.x>5.5||a.x<-5.5||a.z>5?o.instance.visible=!1",
        "o.instance.visible=!0",
        "o.instance.material.customUniforms.uRevealSides.value=Cs(Math.abs(a.x),0,5,1,0,!0)",
        "o.instance.material.customUniforms.uRevealSpreadSides.value=Cs(Math.abs(a.x),2,6,1,0,!0)",
        "o.instance.material.customUniforms.tMouseSim2.value=this.renderManager.mouseSimulation.bufferSim.output.texture",
        "o.instance.update(e,t,n,Math.min(Pe.dpr,1.5))",
        "this.aboutBlocks.visible&&(this.aboutBlocks.update(e,t,n,Math.min(Pe.dpr,1.5))",
      ]),
      excerpt: compact(sourceP1Update.text),
    },
    thumbW1: sourceThumbW1 && {
      index: sourceThumbW1.index,
      checks: checks(sourceThumbW1.text, [
        "class w1 extends rt",
        "this.scrollWrap=new rt",
        "this.progress=e*n",
        "r.xHook=o",
        "let c=(o+this.progress+n*67890)%n",
        "c>n/2&&(c-=n)",
        "r.mesh.position.set(c,0,0)",
        "c<-1.5||c>1.5?r.mesh.visible=!1:r.mesh.visible=!0",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private thumbWrap = new Object3D()",
        "private thumbScrollWrap = new Object3D()",
        "thumbObjectMode: \"source-w1-rt-object3d-scrollWrap\"",
        "thumbWrapType: this.thumbWrap.type",
        "thumbScrollWrapType: this.thumbScrollWrap.type",
      ]),
      excerpt: compact(sourceThumbW1.text),
    },
    thumbE1: sourceThumbE1 && {
      index: sourceThumbE1.index,
      checks: checks(sourceThumbE1.text, [
        "class E1",
        "this.setImage(e)",
        "await Xt.thumbsReady",
        "await(await Xt.getProjectThumbById(e)).src",
        "this.material.uniforms.tMap.value=n",
        "this.material=new M1",
        "this.mesh=new at(this.geometry,this.material)",
        "this.mesh.scale.set(2,2,2)",
      ]),
      ownership: {
        sourceM1ConstructorDefaults:
          sourceThumbE1.text.includes("uniforms:{tMap:new I(null),uResolution:new I(new Q),uMapSize:new I(new Q),uProgress:new I(1)")
          && sourceThumbE1.text.includes("this.material.uniforms.tMap.value=n")
          && sourceThumbE1.text.includes("this.material.uniforms.uMapSize.value.set(1,1),this.material.uniforms.uResolution.value.set(1,1)"),
        sourceM1UniformOrder: orderedIncludes(sourceThumbE1.text, [
          "tMap:new I(null)",
          "uResolution:new I(new Q)",
          "uMapSize:new I(new Q)",
          "uProgress:new I(1)",
          "uTransitionCount:new I(150)",
          "uTransitionSmoothness:new I(.2)",
        ]),
        rebuildM1ConstructorDefaults:
          Boolean(rebuildCreateThumbPlane)
          && rebuildCreateThumbPlane.includes("tMap: { value: null }")
          && rebuildCreateThumbPlane.includes("uMapSize: { value: new Vector2() }")
          && rebuildCreateThumbPlane.includes("uResolution: { value: new Vector2() }")
          && rebuildCreateThumbPlane.includes("sourceConstructorMode = \"source-M1-constructor-null-tMap-zero-size-vectors\"")
          && rebuildCreateThumbPlane.includes("sourceSetImageBindingMode = \"source-E1-setImage-binds-texture-and-1x1-size-after-Xt-thumbsReady\"")
          && !rebuildCreateThumbPlane.includes("tMap: { value: this.placeholder }")
          && !rebuildCreateThumbPlane.includes("uMapSize: { value: new Vector2(1, 1) }")
          && !rebuildCreateThumbPlane.includes("uResolution: { value: new Vector2(1, 1) }"),
        rebuildM1UniformOrder:
          Boolean(rebuildCreateThumbPlane)
          && orderedIncludes(rebuildCreateThumbPlane, [
            "tMap: { value: null }",
            "uResolution: { value: new Vector2() }",
            "uMapSize: { value: new Vector2() }",
            "uProgress: { value: 1 }",
            "uTransitionCount: { value: 150 }",
            "uTransitionSmoothness: { value: 0.2 }",
          ])
          && rebuildCreateThumbPlane.includes("sourceUniformOrder = Object.keys(material.uniforms)"),
        sourceHasNoInitialHiddenState:
          sourceThumbE1.text.includes("this.mesh=new at(this.geometry,this.material),this.mesh.scale.set(2,2,2)")
          && !sourceThumbE1.text.includes("this.mesh.visible=!1")
          && !sourceThumbE1.text.includes("visible=!1"),
        rebuildHasNoInitialHiddenState:
          !rebuildWebgl.includes("mesh.visible = false;")
          && rebuildWebgl.includes("sourceInitialVisibleMode: \"source-E1-no-initial-hidden-state-w1-updateGalleryProgress-owns-visible\""),
        sourceThumbPreloadLifecycle:
          sourceTextureManager?.text.includes("static preloadThumbs(){this.characterModel=this.loadGLTF")
          && sourceTextureManager?.text.includes("this.projectThumbs=[]")
          && sourceTextureManager?.text.includes("this.projectThumbs.push({id:t.id,src:this[t.data.thumbnail.type===")
          && sourceTextureManager?.text.includes("this.thumbsReadyResolve()")
          && sourceTextureManager?.text.includes("static getProjectThumbById(e){return this.projectThumbs.find(t=>t.id===e)}"),
        rebuildThumbPreloadLifecycle:
          rebuildWebgl.includes("private sourceProjectThumbs: SourceProjectThumb[] = [];")
          && rebuildWebgl.includes("private sourceThumbsReady = new Promise<void>")
          && rebuildWebgl.includes("preloadSourceThumbsFromCards(cards: HTMLElement[])")
          && rebuildWebgl.includes("bindingMode: \"source-Xt-projectThumbs-src-promise\"")
          && rebuildWebgl.includes("private getSourceProjectThumbById(id: string)")
          && rebuildWebgl.includes("private setSourceThumbImage(id: string, mesh: Mesh<PlaneGeometry, RawShaderMaterial>)")
          && rebuildWebgl.includes("void this.sourceThumbsReady.then(async () =>")
          && rebuildWebgl.includes("const projectThumb = this.getSourceProjectThumbById(id)")
          && rebuildWebgl.includes("material.uniforms.tMap.value = texture;"),
        rebuildNoDirectPayloadThumbLoadInCreateWorkScene:
          Boolean(rebuildCreateWorkScene)
          && !rebuildCreateWorkScene.includes("payload.thumb) this.loadTexture")
          && !rebuildCreateWorkScene.includes("this.loadTexture(payload.thumb"),
      },
      excerpt: compact(sourceThumbE1.text),
    },
    thumbX1: sourceThumbX1 && {
      index: sourceThumbX1.index,
      checks: checks(sourceThumbX1.text, [
        "class _1 extends mt",
        "glslVersion:lt",
        "toneMapped:!1",
        "uniforms:{tScene:new I(null),uDarkenIntensity:new I(0),uDarkenColor:new I(new ye(0)),uSaturation:new I(1)}",
        "vertexShader:tl",
        "fragmentShader:v1",
        "blending:ot",
        "transparent:!0",
        "depthWrite:!1",
        "depthTest:!1",
        "class x1 extends Lo",
        "this.compositeMaterial=new _1",
        "initSettings(){this.settings={renderToScreen:!1}}",
      ]),
      excerpt: compact(sourceThumbX1.text),
    },
    thumbT1: sourceThumbT1 && {
      index: sourceThumbT1.index,
      checks: checks(sourceThumbT1.text, [
        "class T1 extends Uu",
        "this.backgroundColor=new ye(\"#222222\").convertLinearToSRGB()",
        "this.scene.background=this.backgroundColor",
        "this.thumbs=this.add(w1)",
        "this.scene.add(this.thumbs)",
        "this.camera=new Kn(-1,1,1,-1,0,1)",
        "this.renderManager=new x1(this.renderer,this.scene,this.camera)",
        "this.renderManager.resize(t,t,1)",
      ]),
      excerpt: compact(sourceThumbT1.text),
    },
    skyV1: sourceSkyV1 && {
      index: sourceSkyV1.index,
      checks: checks(sourceSkyV1.text, [
        "class V1 extends Uu",
        "this.backgroundColor=new ye(\"#666666\").convertLinearToSRGB()",
        "this.scene.background=this.backgroundColor",
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
      fragmentChecks: checks(sourceSkyB1, [
        "${Fr}",
        "${xg}",
        "${gg}",
        "${vg}",
        "${dg}",
        "${ug}",
        "${pg}",
        "${_g}",
        "uniform sampler2D tScene",
        "FragColor = vec4(.9 - diffuseColor.rgb, 1.)",
      ]),
      excerpt: compact(sourceSkyZ1.text),
    },
    GA: sourceGA && {
      index: sourceGA.index,
      checks: checks(sourceGA.text, [
        "class GA extends rt",
        "this.settings={xNum:35,yNum:23,zNum:Le.LOW_RES?4:7,size:1.25,spacing:.1,scale:.09}",
        "this.rotationWrap=new rt",
        "this.mouseSim=new Ka({renderer:e.renderer,camera:e.camera,mesh:this.plane,persistance:.85,thickness:.1,rayCastMesh:this.rayPlane})",
        "this.plane.scale.set(35*e,23*e,1)",
        "this.rayPlane.scale.set(35*e,23*e,1)",
        "this.rayPlane.position.set(0,0,23*e/2+.01)",
        "this.planeMaterial.uniforms.uRatio.value=35/23",
        "this.planeMaterial.transparent=!0",
        "this.planeMaterial.depthTest=!1",
        "this.planeMaterial.depthWrite=!1",
        "this.rayPlaneMaterial.transparent=!0",
        "this.rayPlaneMaterial.opacity=0",
        "this.rayPlaneMaterial.depthTest=!1",
        "this.rayPlaneMaterial.depthWrite=!1",
        "this.rayPlane.scale.multiplyScalar(t)",
        "this.material.customUniforms.uUvOffsetScale.value=t",
        "this.rotationWrap.add(this.mesh)",
        "this.rotationWrap.scale.set(i,i,i)",
        "this.rotationWrap.add(this.rayPlane)",
        "resize(e,t,n){this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)}",
        "update(e,t,n,i){this.material.update(e,t,n,i),this.mouseSim.update(e,t,n,i),this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture",
        "this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture",
        "this.mouseSpeed=Yi(this.mouseSpeed,this.mouseSim.simulationMaterial.uniforms.uSpeed.value,10,t)",
        "this.material.customUniforms.uMouseSpeed.value=this.mouseSpeed",
        "this.planeMaterial.uniforms.uTime.value=e",
        "this.material.customUniforms.tDisplacement.value=J.wavvesScene.renderManager.renderTargetComposite.texture",
      ]),
      rebuildUpdateChecks: checks(rebuildWebgl, [
        "group: Object3D;",
        "rotationWrap: Object3D;",
        "const group = new Object3D()",
        "const rotationWrap = new Object3D()",
        "function sourceWorkViewportCoords()",
        "private setSourceWorkMaterialUCoords(material: WorkBlockMaterial)",
        "private updateVisibleWorkItems(time: number, delta: number)",
        "item.material.uniforms.uTime.value = time",
        "this.setSourceWorkMaterialUCoords(item.material)",
        "const meshResult = this.updateMouseBrush(",
        "item.material.uniforms.tMouseSim.value = item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder",
        "item.mouseSpeed = sourceDamp(item.mouseSpeed, meshResult.speed, 10, delta)",
        "item.material.uniforms.uMouseSpeed.value = item.mouseSpeed",
        "item.mousePlane.material.uniforms.uTime.value = time",
        "item.material.uniforms.tDisplacement.value = this.displacementTarget.texture",
        "sourceGAUpdateMode: \"source-GA-update-material-then-local-Ka-then-bindings-before-p1-side-reveal\"",
        "sourceUCoordsMode: \"source-VA-update-Pe-width-height-times-capped-dpr-no-render-target-rounding\"",
      ]),
      uCoordsOwnership: {
        source:
          sourceVA?.text.includes("this.customUniforms.uCoords.value.set(Pe.w*i,Pe.h*i)") === true
          && sourceXA?.text.includes("this.customUniforms.uCoords.value.set(Pe.w*i,Pe.h*i)") === true,
        rebuild:
          rebuildWebgl.includes("function sourceWorkViewportCoords()")
          && rebuildWebgl.includes("material.uniforms.uCoords.value.set(coords.width, coords.height)")
          && rebuildWebgl.includes("sourceUCoordsMode: \"source-VA-update-Pe-width-height-times-capped-dpr-no-render-target-rounding\""),
      },
      rebuildNoSplitLocalMouseUpdate:
        !rebuildWebgl.includes("private updateWorkMouseSimulation(")
        && !rebuildWebgl.includes("private syncWorkMouseSimulationUniforms("),
      rebuildNoRoundedTargetCoords:
        !rebuildWebgl.includes("item.material.uniforms.uCoords.value.set(this.workRawTarget.width, this.workRawTarget.height)")
        && !rebuildWebgl.includes("item.material.uniforms.uCoords.value.set(workRenderWidth, workRenderHeight)"),
      excerpt: compact(sourceGA.text),
    },
    Ka: (() => {
      const start = bundle.indexOf("class Ka{constructor");
      const end = start >= 0 ? bundle.indexOf("const Ur=", start) : -1;
      const sourceKa = start >= 0 && end > start ? bundle.slice(start, end) : null;
      return sourceKa
        ? {
            index: start,
            checks: checks(sourceKa, [
              "onResize(e,t){this.bufferSim.onResize(e,t),this.simulationMaterial.uniforms.uCoords.value.set(e,t)}",
              "onMouseMove({x:e,y:t}){this.onMesh?this.raycast({x:e,y:t}):this.targetPos.set(e/Pe.w,1-t/Pe.h)}",
              "this.mouse.x=e/Pe.w*2-1",
              "this.mouse.y=-(t/Pe.h)*2+1",
              "this.raycaster.setFromCamera(this.mouse,this.camera)",
              "this.intersects=this.raycaster.intersectObjects([this.rayCastMesh])",
              "this.intersects.length>0&&(this.targetPos.x=this.intersects[0].uv.x,this.targetPos.y=this.intersects[0].uv.y)",
            ]),
            rebuildRaycastChecks: checks(rebuildWebgl, [
              "private pointerRay = new Vector2()",
              "this.pointerRay.set(this.targetPointer.x, this.targetPointer.y)",
              "private onMouseMove = (event: MouseEvent) => {",
              "this.updatePointerProjection()",
              "this.raycaster.setFromCamera(this.pointerRay, this.homeCamera)",
              "const hit = this.raycaster.intersectObject(item.rayPlane, false)[0]",
              "raycastMode: \"source-Ka-onMouseMove-per-item-raycast-immediate-pointer\"",
              "raycastEventMode: \"source-Ka-raycast-during-mousemove-not-raf-tail\"",
            ]),
            sourceShaderChecks: {
              vertex: checks(sourceMouseSimulationVertex, [
                "uniform float uTime",
                "vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0)",
                "gl_Position = projectionMatrix * modelViewPosition",
              ]),
              fragment: checks(sourceMouseSimulationFragment, [
                "float br = 1. - + (oldTexture.r + oldTexture.g + oldTexture.b)/3.0",
                "float p2 = (uDiffusion)/4.0",
                "// float lineSegment(vec2 p, vec2 a, vec2 b, float thickness, float aspectRatio)",
                "// vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction)",
                "// lineValue = lineSegment(newUv, uPosOld, uPosNew, th, ratio)",
                "lineValue = circle(newUv, posOld, th)",
              ]),
            },
            rebuildShaderChecks: checks(rebuildWebgl, [
              "const mouseSimulationVertex = `",
              "dumpShader(\"Ka-mouse-simulation\", mouseSimulationVertex, mouseSimulationFragment)",
              "vertexShader: mouseSimulationVertex",
              "float br = 1.0 - + (oldTexture.r + oldTexture.g + oldTexture.b) / 3.0",
              "float p2 = uDiffusion / 4.0",
              "// float lineSegment(vec2 p, vec2 a, vec2 b, float thickness, float aspectRatio)",
              "// vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction)",
              "// lineValue = lineSegment(newUv, uPosOld, uPosNew, th, ratio)",
              "lineValue = circle(newUv, posOld, th)",
              "mode: \"source-Ka-rA-oA-shader-surface\"",
            ]),
            rebuildNoRafRaycast: !rebuildWebgl.includes("this.updateAuxiliaryBlocks(time, delta);\n    this.updatePointerProjection();"),
            excerpt: compact(sourceKa),
          }
        : null;
    })(),
    sA: sourceSA
      ? {
          checks: checks(sourceSA, [
            "this.renderer.setRenderTarget(this.output)",
            "this.renderer.render(this.orthoScene,this.orthoCamera)",
            "this.renderer.setRenderTarget(null)",
          ]),
          noExplicitClear: !sourceSA.includes(".clear()"),
          excerpt: compact(sourceSA),
        }
      : null,
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
        "const c=this.blurIterations",
        "u===0?this.blurMaterial.uniforms.tMap.value=this.renderTarget.texture:this.blurMaterial.uniforms.tMap.value=this.renderTargetRead.texture",
        "e.setRenderTarget(this.renderTargetWrite)",
        "const l=this.renderTargetRead;this.renderTargetRead=this.renderTargetWrite,this.renderTargetWrite=l,this.renderTargetUniform.value=this.renderTargetRead.texture",
      ]),
      order: regexAnchorOrder(sourceI1.text, [
        { label: "lookAt", pattern: /this\.virtualCamera\.lookAt\(this\.target\)/ },
        { label: "far", pattern: /this\.virtualCamera\.far=n\.far/ },
        { label: "updateMatrixWorld", pattern: /this\.virtualCamera\.updateMatrixWorld\(\)/ },
        { label: "projectionCopy", pattern: /this\.virtualCamera\.projectionMatrix\.copy\(n\.projectionMatrix\)/ },
        { label: "setRenderTargetRaw", pattern: /e\.setRenderTarget\(this\.renderTarget\)/ },
        { label: "depthMask", pattern: /e\.state\.buffers\.depth\.setMask\(!0\)/ },
        { label: "conditionalClear", pattern: /e\.autoClear===!1&&e\.clear\(\)/ },
        { label: "blurLoop", pattern: /for\(let u=0;u<c;u\+\+\)/ },
        { label: "setRenderTargetWrite", pattern: /e\.setRenderTarget\(this\.renderTargetWrite\)/ },
        { label: "swapReadWrite", pattern: /this\.renderTargetRead=this\.renderTargetWrite,this\.renderTargetWrite=l/ },
        { label: "updateRenderTargetUniform", pattern: /this\.renderTargetUniform\.value=this\.renderTargetRead\.texture/ },
      ]),
      excerpt: compact(sourceI1.text),
    },
  },
  rendererOutputRefs: rendererOutputRefs.map((entry) => ({
    needle: entry.needle,
    index: entry.index,
    excerpt: compact(entry.text),
  })),
  rebuildRuntime: {
    texturePreloadAnimateIn: checks(rebuildWebgl, [
      "async animateIn()",
      "this.sourceTexturePreloadPromise.then(() => {",
      "Promise.all([blueNoise, floorNormal, perlin1, perlin2])",
      "this.sourceTexturePreloadState.blueNoise = true",
      "this.sourceTexturePreloadState.floorNormal = true",
      "this.sourceTexturePreloadState.perlin1 = true",
      "this.sourceTexturePreloadState.perlin2 = true",
      "animateInMode: \"source-nD-animateIn-awaits-init-and-four-preloaded-textures\"",
      "animateInResolvedMode: \"source-nD-animateIn-resolves-after-fade-scheduled\"",
    ]),
    mainHomeEnter: checks(rebuildMain, [
      "animateIn?(): Promise<void>",
      "void webgl?.animateIn?.()",
      "window.dispatchEvent(new CustomEvent(\"rd:home-gallery-in\"))",
    ]),
  },
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

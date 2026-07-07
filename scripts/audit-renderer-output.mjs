import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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
const rebuildAudioPath = process.env.REBUILD_AUDIO || "src/client/audio.ts";
const rebuildMotionPath = process.env.REBUILD_MOTION || "src/client/motion.ts";
const rebuildSitePath = process.env.REBUILD_SITE || "src/data/site.ts";
const rebuildThumbProbePath = process.env.REBUILD_THUMB_PROBE || "scripts/probe-thumb-spotlight.mjs";
const rebuildOutputProbePath = process.env.REBUILD_OUTPUT_PROBE || "scripts/probe-output-color.mjs";
const rebuildInteractiveMouseProbePath = process.env.REBUILD_INTERACTIVE_MOUSE_PROBE || "scripts/probe-interactive-mouse.mjs";
const rebuildMirrorSitePath = process.env.REBUILD_MIRROR_SITE || "scripts/mirror-site.mjs";
const rebuildCompositeStagesPath = process.env.REBUILD_COMPOSITE_STAGES || "scripts/compare-composite-stages.mjs";
const rebuildBrightnessAttributionPath = process.env.REBUILD_BRIGHTNESS_ATTRIBUTION || "scripts/compare-home-brightness-attribution.mjs";
const rebuildSpotlightMapComparePath = process.env.REBUILD_SPOTLIGHT_MAP_COMPARE || "scripts/compare-spotlight-map.mjs";
const rebuildThumbColorspaceComparePath = process.env.REBUILD_THUMB_COLORSPACE_COMPARE || "scripts/compare-thumb-colorspace.mjs";
const rebuildCapturePath = process.env.REBUILD_CAPTURE || "scripts/capture.mjs";
const sourceGpuBenchmarksDir = process.env.SOURCE_GPU_BENCHMARKS_DIR || "public/vendor/detect-gpu/benchmarks";
const threeLightsFragmentBegin = readFileSync("node_modules/three/src/renderers/shaders/ShaderChunk/lights_fragment_begin.glsl.js", "utf8");
const threeShadowmapVertex = readFileSync("node_modules/three/src/renderers/shaders/ShaderChunk/shadowmap_vertex.glsl.js", "utf8");
const threeWebglLights = readFileSync("node_modules/three/src/renderers/webgl/WebGLLights.js", "utf8");
const threeSpotLight = readFileSync("node_modules/three/src/lights/SpotLight.js", "utf8");
const threeSpotLightShadow = readFileSync("node_modules/three/src/lights/SpotLightShadow.js", "utf8");
const threeLightShadow = readFileSync("node_modules/three/src/lights/LightShadow.js", "utf8");
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

function booleanDiagnostic(actual, expected = actual) {
  return {
    actual: actual ? "true" : "false",
    expected: expected ? "true" : "false",
    matchesExpected: actual === expected,
  };
}

function targetSnapshot(target, expected = {}) {
  const expectedTexture = expected.texture ?? {};
  return {
    texture: {
      colorSpace: target.texture.colorSpace,
      type: target.texture.type,
      format: target.texture.format,
      minFilter: target.texture.minFilter,
      magFilter: target.texture.magFilter,
      generateMipmaps: booleanDiagnostic(target.texture.generateMipmaps, expectedTexture.generateMipmaps),
    },
    depthBuffer: booleanDiagnostic(target.depthBuffer, expected.depthBuffer),
    stencilBuffer: booleanDiagnostic(target.stencilBuffer, expected.stencilBuffer),
  };
}

mkdirSync(outDir, { recursive: true });

const bundle = readFileSync(bundlePath, "utf8");
const rebuildWebgl = readFileSync(rebuildWebglPath, "utf8");
const rebuildMain = readFileSync(rebuildMainPath, "utf8");
const rebuildAudio = readFileSync(rebuildAudioPath, "utf8");
const rebuildMotion = readFileSync(rebuildMotionPath, "utf8");
const rebuildSite = readFileSync(rebuildSitePath, "utf8");
const rebuildThumbProbe = readFileSync(rebuildThumbProbePath, "utf8");
const rebuildOutputProbe = readFileSync(rebuildOutputProbePath, "utf8");
const rebuildInteractiveMouseProbe = readFileSync(rebuildInteractiveMouseProbePath, "utf8");
const rebuildMirrorSite = readFileSync(rebuildMirrorSitePath, "utf8");
const rebuildCompositeStages = readFileSync(rebuildCompositeStagesPath, "utf8");
const rebuildBrightnessAttribution = readFileSync(rebuildBrightnessAttributionPath, "utf8");
const rebuildSpotlightMapCompare = readFileSync(rebuildSpotlightMapComparePath, "utf8");
const rebuildThumbColorspaceCompare = readFileSync(rebuildThumbColorspaceComparePath, "utf8");
const rebuildCapture = readFileSync(rebuildCapturePath, "utf8");
const sourceGpuBenchmarkFiles = readdirSync(sourceGpuBenchmarksDir).filter((file) => file.endsWith(".json")).sort();
const rebuildConstructor = extractBlock(rebuildWebgl, "constructor(root: HTMLElement)");
const rebuildEnvironmentMaterialFactory = extractBlock(rebuildWebgl, "private createEnvironmentMaterial()");
const rebuildSourceInitLifecycle = extractBlock(rebuildWebgl, "private runSourceInitLifecycle()");
const rebuildDelayedCompositeSkyBinding = extractBlock(rebuildWebgl, "private bindSourceDelayedCompositeInputsAndSky()");
const rebuildCreateLensflareMaterial = extractBlock(rebuildWebgl, "private createLensflareMaterial()");
const rebuildCreateLuminosityMaterial = extractBlock(rebuildWebgl, "private createLuminosityMaterial(");
const rebuildCreateBloomBlurMaterial = extractBlock(rebuildWebgl, "private createBloomBlurMaterial(");
const rebuildCreateBlurMaterial = extractBlock(rebuildWebgl, "private createBlurMaterial(");
const rebuildCreateBloomCompositeMaterial = extractBlock(rebuildWebgl, "private createBloomCompositeMaterial(");
const rebuildCreateFloorReflectionBlurMaterial = extractBlock(rebuildWebgl, "private createFloorReflectionBlurMaterial()");
const rebuildCreateFloorMaterial = extractBlock(rebuildWebgl, "private createFloorMaterial()");
const rebuildCreateFxaaMaterial = extractBlock(rebuildWebgl, "private createFxaaMaterial()");
const rebuildCreateCompositeMaterial = extractBlock(rebuildWebgl, "private createCompositeMaterial()");
const rebuildCreateMainCompositeMaterial = extractBlock(rebuildWebgl, "private createMainCompositeMaterial()");
const rebuildCreateWorkScene = extractBlock(rebuildWebgl, "private createWorkScene()");
const rebuildCreateWorkBlockMaterial = extractBlock(rebuildWebgl, "private createWorkBlockMaterial()");
const rebuildWorkBlockSourceHaVertexShader = extractConstTemplate(rebuildWebgl, "workBlockSourceHaVertexShader");
const rebuildWorkBlockVertexPars = extractConstTemplate(rebuildWebgl, "workBlockVertexPars");
const sourceLoadedTextureHelper = rebuildWebgl.match(/function applySourceLoadedTextureState[^{]*\{([\s\S]*?)\n\}/);
const sourceLoadedTextureHelperBody = sourceLoadedTextureHelper?.[1] ?? "";
const rebuildSetGalleryProgress = extractBlock(rebuildWebgl, "setGalleryProgress(progress");
const rebuildSetProject = extractBlock(rebuildWebgl, "setProject(payload: ProjectPayload)");
const rebuildApplyActiveProjectSourceOrder = extractBlock(rebuildWebgl, "private applyActiveProjectSourceOrder(");
const rebuildApplyProjectLook = extractBlock(rebuildWebgl, "private applyProjectLook(");
const rebuildSetProjectBlockReveal = extractBlock(rebuildWebgl, "private setProjectBlockReveal(");
const rebuildPrepareHomeLighting = extractBlock(rebuildWebgl, "private prepareHomeLighting(");
const rebuildEnterWorkGallery = extractBlock(rebuildWebgl, "enterWorkGallery(");
const rebuildInitHomeSpotlight = extractBlock(rebuildWebgl, "  initHomeSpotlight()");
const rebuildSetDarken = extractBlock(rebuildWebgl, "private setDarken(");
const rebuildSetSaturation = extractBlock(rebuildWebgl, "private setSaturation(");
const rebuildSetContrast = extractBlock(rebuildWebgl, "private setContrast(");
const rebuildSetRevealSpread = extractBlock(rebuildWebgl, "private setRevealSpread(");
const rebuildSetEnvRotation = extractBlock(rebuildWebgl, "private setEnvRotation(");
const rebuildSetFluidStrength = extractBlock(rebuildWebgl, "private setFluidStrength(");
const rebuildSetMediaOpacity = extractBlock(rebuildWebgl, "private setMediaOpacity(");
const rebuildSetMainColor = extractBlock(rebuildWebgl, "private setMainColor(");
const rebuildSetMediaBackground = extractBlock(rebuildWebgl, "private setMediaBackground(");
const rebuildUpdateAmbientDarkenColor = extractBlock(rebuildWebgl, "private updateAmbientDarkenColor()");
const rebuildSetAmbientColor = extractBlock(rebuildWebgl, "private setAmbientColor(");
const rebuildSetAmbientIntensity = extractBlock(rebuildWebgl, "private setAmbientIntensity(");
const rebuildSetAmbientLight = extractBlock(rebuildWebgl, "private setAmbientLight(");
const rebuildSetBlocksColor = extractBlock(rebuildWebgl, "private setBlocksColor(");
const rebuildShowScene = extractBlock(rebuildWebgl, "showScene()");
const rebuildCreateThumbPlane = extractBlock(rebuildWebgl, "private createThumbPlane(");
const rebuildRenderThumbTargets = extractBlock(rebuildWebgl, "private renderThumbTargets()");
const rebuildRenderSkyTarget = extractBlock(rebuildWebgl, "private renderSkyTarget(");
const rebuildRenderDisplacementTarget = extractBlock(rebuildWebgl, "private renderDisplacementTarget(");
const rebuildRenderMediaCompositeTarget = extractBlock(rebuildWebgl, "private renderMediaCompositeTarget(");
const rebuildRenderFloorReflection = extractBlock(rebuildWebgl, "private renderFloorReflection()");
const rebuildSetThumbDarknessIntensity = extractBlock(rebuildWebgl, "private setThumbDarknessIntensity(");
const rebuildSetThumbDarknessColor = extractBlock(rebuildWebgl, "private setThumbDarknessColor(");
const rebuildSetThumbSaturation = extractBlock(rebuildWebgl, "private setThumbSaturation(");
const rebuildSetThumbMouseLightness = extractBlock(rebuildWebgl, "private setThumbMouseLightness(");
const rebuildSetSpotLightIntensity = extractBlock(rebuildWebgl, "private setSpotLightIntensity(");
const rebuildSetDirectionalLightIntensity = extractBlock(rebuildWebgl, "private setDirectionalLightIntensity(");
const rebuildSetDirectionalLight2Intensity = extractBlock(rebuildWebgl, "private setDirectionalLight2Intensity(");
const rebuildUpdateWorkSceneForNextFrame = extractBlock(rebuildWebgl, "private updateWorkSceneForNextFrame(");
const rebuildUpdateVisibleWorkItems = extractBlock(rebuildWebgl, "private updateVisibleWorkItems(");
const rebuildTick = extractBlock(rebuildWebgl, "private tick =");
const rebuildHomeGalleryTick = extractBlock(rebuildMain, "const tick = (now: number)");
const rebuildTickBeforeMainRaw = rebuildTick && rebuildTick.includes("this.renderer.setRenderTarget(this.mainRawTarget);")
  ? rebuildTick.slice(0, rebuildTick.indexOf("this.renderer.setRenderTarget(this.mainRawTarget);"))
  : "";
const rebuildResizeBloomMipChain = extractBlock(rebuildWebgl, "private resizeBloomMipChain(");
const rebuildRenderBloomChain = extractBlock(rebuildWebgl, "private renderBloomChain(");
const rebuildRenderWorkBlurPass = extractBlock(rebuildWebgl, "private renderWorkBlurPass()");
const rebuildRenderHomeBlurPass = extractBlock(rebuildWebgl, "private renderHomeBlurPass()");
const rebuildRenderHomeBloomPass = extractBlock(rebuildWebgl, "private renderHomeBloomPass(");
const rebuildCreateMainFluidPass = extractBlock(rebuildWebgl, "private createMainFluidPass()");
const rebuildResizeMainFluidPass = extractBlock(rebuildWebgl, "private resizeMainFluidPass(");
const rebuildUpdateMainFluidPass = extractBlock(rebuildWebgl, "private updateMainFluidPass()");
const rebuildMainFluidProbe = extractBlock(rebuildWebgl, "private mainFluidProbe()");
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
const sourceWorkRenderManagerKA = extractAround(bundle, "class kA extends Lu", 320, 900);
const sourceLA = extractAround(bundle, "class lA extends", 320, 1100);
const sourceW1 = extractAround(bundle, "class W1 extends", 320, 1100);
const sourceSg = extractAround(bundle, "class sg extends", 320, 900);
const sourceRg = extractAround(bundle, "class rg extends", 320, 1100);
const sourceNa = extractAround(bundle, "class Na extends", 420, 900);
const sourceCg = extractAround(bundle, "class cg extends", 320, 1000);
const sourceIg = extractAround(bundle, "class ig extends", 320, 900);
const sourceL1 = extractAround(bundle, "class L1 extends", 320, 1000);
const sourceEA = extractAround(bundle, "class eA extends", 320, 1200);
const sourceAg = extractAround(bundle, "class ag", 260, 3200);
const sourceGT = extractAround(bundle, "class GT extends", 320, 1500);
const sourceQT = extractAround(bundle, "class qT extends", 320, 1500);
const sourceJT = extractAround(bundle, "class jT extends", 320, 1100);
const sourceKT = extractAround(bundle, "class KT extends", 320, 1200);
const sourcePressureJT = extractAround(bundle, "class JT extends", 320, 1100);
const sourceProjectDataManager = extractAround(bundle, "class is{static getProjects()", 120, 700);
const sourceMediaScene = extractAround(bundle, "class $1 extends", 320, 900);
const sourceMainI1 = extractAround(bundle, "class I1", 200, 9600);
const sourcePe = extractAround(bundle, "class Pe", 200, 1400);
const sourceP1Resize = extractAround(bundle, "resize(e,t,n){super.resize(e,t,Math.min(n,1.5))", 1200, 900);
const sourceP1SetCamera = extractAround(bundle, "setCamera(){this.camera=new Ya(55,innerWidth/innerHeight,1,2e3),this.camera.position.set(0,0,5.5)", 200, 360);
const sourceYa = extractAround(bundle, "class Ya extends Wt{constructor(e){super(e)}resize(){this.updateProjectionMatrix()}}", 80, 180);
const sourceIuResize = extractAround(bundle, "resize(e,t,n){this.renderManager.resize(e,t,n),this.camera.resize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()", 320, 480);
const sourceP1InitEnv = extractAround(bundle, "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)", 700, 900);
const sourceP1SetBlocks = extractAround(bundle, "setBlocks(){this.blocks=[]", 120, 1300);
const sourceP1SetLights = extractAround(bundle, "setLights(){this.ambientLight=new", 240, 1000);
const sourceSpotLightClass = extractAround(bundle, "class Qm extends", 280, 700);
const sourceSpotLightShadowClass = extractAround(bundle, "class Iw extends", 280, 620);
const sourceP1CameraSettings = extractAround(bundle, "setCameraControllerSettings(e=new L(0,0,0),t=new Q(.25,.25),n=10)", 240, 520);
const sourceIuUpdate = extractAround(bundle, "update(e,t,n,i){this.renderManager.update(e,t,n,i),this.cameraController", 240, 700);
const sourceIT = extractAround(bundle, "class IT{constructor", 120, 3200);
const sourceP1Update = extractAround(bundle, "update(e,t,n,i){super.update(e,t,n,i),this.spotLight", 240, 1300);
const sourceTDSpotlight = extractAround(bundle, "updateSpotLight(){J.workScene.spotLight.position.set", 520, 900);
const sourceCharacterRotatable = extractAround(bundle, "class Q1 extends rt", 0, 2500);
const sourceCharacterScene = extractAround(bundle, "class eD extends rt", 0, 1600);
const sourceFg = extractAround(bundle, "class Fg extends", 200, 1200);
const sourceWebpDetection = extractAround(bundle, "await k0(\"lossy\").then(()=>{Le.WEBP=!0}).catch(()=>{Le.WEBP=!1})", 240, 420);
const sourceLeSettings = extractAround(bundle, "class Le{static DEBUG", 0, 560);
const sourceDetectGpu = extractAround(bundle, "const XD=({mobileTiers", 220, 5200);
const sourceQeGpuCheck = extractAround(bundle, "await this.gpuCheck().catch(()=>{Le.GPU_TIER=3})", 160, 1700);
const sourceSe = extractAround(bundle, "class Se", 200, 10600);
const sourceYDAnimateIn = extractAround(bundle, "Se.setCameraControllerSettings(new L(0,0,0),new Q(1,.5),20)", 360, 620);
const sourceYDClass = extractAround(bundle, "class yD extends Ht", 0, 7600);
const sourceYDUpdateScene = extractAround(bundle, "J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress)", 360, 760);
const sourceYDOnProjectActive = extractAround(bundle, "async onProjectActive(e){", 240, 1600);
const sourceAudioWoosh = extractAround(bundle, "this.woosh=new zi.Howl({src:[\"/audio/woosh.webm\"", 220, 420);
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
const sourceQnEnvironmentConstants = extractAround(bundle, "Qn={ROUGHNESS_INTENSITY:.94", 20, 520);
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
const sourceKA = extractAround(bundle, "class KA extends", 320, 2200);
const sourceAuxiliaryWA = extractTemplate(bundle, "WA", "`,jA=");
const sourceAuxiliaryJA = extractTemplate(bundle, "jA", "`;class XA extends");
const sourceAuxiliaryQA = extractTemplate(bundle, "qA", "`,YA=");
const sourceAuxiliaryYA = extractTemplate(bundle, "YA", "`;class KA extends");
const sourceMG = extractAround(bundle, "class mg extends", 0, 5900);
const sourceGA = extractAround(bundle, "class GA extends", 200, 5200);
const sourceDollarA = extractAround(bundle, "class $A extends", 200, 5600);
const sourceZA = extractAround(bundle, "class ZA extends", 200, 3000);
const sourceSA = bundle.match(/class sA\{[\s\S]*?class Ka\{/)?.[0] ?? null;
const sourceMouseSimulationFragment = extractTemplate(bundle, "rA", "`,oA=");
const sourceMouseSimulationVertex = extractTemplate(bundle, "oA", "`;class Ka");
const sourceI1 = extractAround(bundle, "class i1 extends", 200, 5000);
const sourceRenderer = extractAround(bundle, "class qw extends", 200, 1200);
const sourceCanvasManager = extractAround(bundle, "class nD{constructor", 200, 2200);
const sourceRafManager = extractAround(bundle, "class w0", 0, 2300);
const sourceTextureManager = extractAround(bundle, "static preloadTextures(){", 500, 1300);
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
const sourceXABody = sourceXA?.text.slice(sourceXA.text.indexOf("class XA extends"), sourceXA.text.indexOf("class $A extends")) ?? "";
const sourceKABody = sourceKA?.text.slice(sourceKA.text.indexOf("class KA extends"), sourceKA.text.indexOf("class ZA extends")) ?? "";
const sourceZABody = sourceZA?.text.slice(sourceZA.text.indexOf("class ZA extends")) ?? "";

const localDefaultTarget = new WebGLRenderTarget(1, 1);
const localSourceTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
const localTexture = new Texture();
const expectedDefaultRenderTarget = {
  texture: { generateMipmaps: false },
  depthBuffer: true,
  stencilBuffer: false,
};
const expectedSourceDepthlessRenderTarget = {
  texture: { generateMipmaps: false },
  depthBuffer: false,
  stencilBuffer: false,
};

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
      ]),
      tonemappingFragmentAbsent: !sourceA1.includes("#include <tonemapping_fragment>"),
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
        "FragColor",
        "blend(1",
        "blend(11",
        "mixed.rgb *= uContrast",
        "mix(mixed.rgb * noise.rgb, mixed.rgb, .75)",
        "mix(mixed.rgb * noise.rgb, mixed.rgb, 1.5)",
      ]),
      tonemappingFragmentAbsent: !rebuildA1.includes("#include <tonemapping_fragment>"),
      order: rebuildA1Order,
      orderMatchesSource: JSON.stringify(sourceA1Signature) === JSON.stringify(rebuildA1Signature),
      flowOrderMatchesSource: JSON.stringify(sourceA1FlowSignature) === JSON.stringify(rebuildA1FlowSignature),
      orderMismatches: compareSignatures(sourceA1Signature, rebuildA1Signature),
      flowOrderMismatches: compareSignatures(sourceA1FlowSignature, rebuildA1FlowSignature),
      onlySourceOrderAnchors: sourceA1Signature.filter((anchor) => !rebuildA1Signature.includes(anchor)),
      onlyRebuildOrderAnchors: rebuildA1Signature.filter((anchor) => !sourceA1Signature.includes(anchor)),
      sourceSurfaceChecks: {
        displacementUvMatchesSource: /vec2\s+displacementUv\s*=/.test(sourceA1) && /vec2\s+displacementUv\s*=/.test(rebuildA1),
        vignetteFMatchesSource: /float\s+vignetteF\s*=/.test(sourceA1) && /float\s+vignetteF\s*=/.test(rebuildA1),
        noiseSampleOrderMatchesSource: JSON.stringify(sourceA1Signature) === JSON.stringify(rebuildA1Signature)
          && sourceA1Signature.includes("noise sample")
          && rebuildA1Signature.includes("noise sample"),
      },
    },
  },
  debugShortcuts: {
    noRejectedCompositeTransferDebug:
      !rebuildWebgl.includes("debug-composite-transfer")
      && !rebuildWebgl.includes("uDebugTransferMode")
      && !rebuildOutputProbe.includes("debug-composite-transfer")
      && !rebuildCompositeStages.includes("debug-composite-transfer")
      && !rebuildBrightnessAttribution.includes("debug-composite-transfer"),
    noRejectedSpotlightMapOffDebug:
      !rebuildWebgl.includes("debug-spotlight-map")
      && !rebuildBrightnessAttribution.includes("debug-spotlight-map=off")
      && !rebuildSpotlightMapCompare.includes("debug-spotlight-map=off"),
    noRejectedThumbColorspaceDebug:
      !rebuildWebgl.includes("debug-thumb-colorspace")
      && !rebuildThumbColorspaceCompare.includes("debug-thumb-colorspace"),
    homeSpotlightMapAlwaysSourceThumbComposite:
      rebuildWebgl.includes("private homeSpotlightMap() {\n    return this.thumbCompositeTarget.texture;\n  }"),
  },
  sourceManagers: {
    renderManagerSettings: {
      sourceLuBaseSettings: checks(sourceLu.text, [
        "initSettings(){this.settings={renderToScreen:!1,fxaa:{enabled:!1},mousesim:{enabled:!1}",
        "luminosity:{threshold:.1,smoothing:1,enabled:!1}",
        "bloom:{strength:.05,radius:.01,enabled:!1}",
        "blur:{scale:1,strength:8,enabled:!1}",
        "fluid:{enabled:!1,mouseForce:25,cursorSize:15,delta:.019,poissonIterations:1,bounce:!1}",
      ]),
      sourceKAWorkSettings: checks(sourceOA.text, [
        "class kA extends Lu",
        "initSettings(){this.settings={renderToScreen:!1,fxaa:{enabled:!1},mousesim:{enabled:!0}",
        "luminosity:{threshold:.1,smoothing:.95,enabled:!0}",
        "bloom:{strength:.15,radius:1.5,enabled:!0}",
        "blur:{scale:1,strength:8,enabled:!1}",
        "fluid:{enabled:!1,mouseForce:25,cursorSize:20,delta:.019,poissonIterations:1,bounce:!1}",
      ]),
      sourceI1MainSettings: checks(sourceMainI1.text, [
        "initSettings(){this.settings={renderToScreen:!0,fxaa:{enabled:!1},mousesim:{enabled:!1}",
        "luminosity:{threshold:.1,smoothing:1,enabled:!1}",
        "bloom:{strength:.05,radius:.01,enabled:!1}",
        "blur:{scale:1,strength:8,enabled:!1}",
        "fluid:{enabled:Le.GPU_TIER>=3,mouseForce:5,cursorSize:6,delta:.125,poissonIterations:1,bounce:!1}",
        "lensflare:{scale:new Q(1.5,1.5),exposure:1,clamp:1,enabled:!1}",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_HOME_RENDER_SETTINGS: SourceRenderSettings = {",
        "const SOURCE_MAIN_RENDER_SETTINGS: SourceRenderSettings = {",
        "function cloneSourceRenderSettings(settings: SourceRenderSettings): SourceRenderSettings",
        "function sourceRuntimeMainRenderSettings(): SourceRenderSettings",
        "settings.fluid.enabled = sourceGpuTier() >= 3",
        "private renderSettings = cloneSourceRenderSettings(SOURCE_HOME_RENDER_SETTINGS);",
        "private sourceMainRenderSettings: SourceRenderSettings = sourceRuntimeMainRenderSettings();",
        "mode: \"source-kA-initSettings-overrides-Lu-work-render-manager-settings\"",
        "mode: \"source-I1-initSettings-main-render-manager-settings-gpu-tier-fluid-branch\"",
        "mode: \"source-I1-initSettings-lensflare-disabled-scale-1_5-exposure-1-clamp-1\"",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "workRenderManagerSettings.mode !== \"source-kA-initSettings-overrides-Lu-work-render-manager-settings\"",
        "mainRenderManagerSettings.mode !== \"source-I1-initSettings-main-render-manager-settings-gpu-tier-fluid-branch\"",
        "expectedWorkRenderSettings",
        "expectedMainRenderSettings",
        "expectedMainFluidEnabled",
        "workRenderManagerSettings.instanceOwned !== true",
        "mainRenderManagerSettings.instanceOwned !== true",
        "lensflareSettings.mode !== \"source-I1-initSettings-lensflare-disabled-scale-1_5-exposure-1-clamp-1\"",
      ]),
    },
    gpuTierBridge: {
      sourceLeDefaults: sourceLeSettings && {
        index: sourceLeSettings.index,
        checks: checks(sourceLeSettings.text, [
          "static GPU_TIER=3",
          "static LOW_RES=!1",
        ]),
        excerpt: compact(sourceLeSettings.text),
      },
      sourceDetectGpu: sourceDetectGpu && {
        index: sourceDetectGpu.index,
        checks: checks(sourceDetectGpu.text, [
          "const XD=({mobileTiers:s=[0,15,30,60],desktopTiers:e=[0,15,30,60]",
          "benchmarksURL:r=\"/vendor/detect-gpu/benchmarks\"",
          "fetch(`${r}/${M}`).then(w=>w.json())",
          "return h(S,\"BENCHMARK\",p,m,x)",
        ]),
        excerpt: compact(sourceDetectGpu.text),
      },
      sourceQeGpuCheck: sourceQeGpuCheck && {
        index: sourceQeGpuCheck.index,
        checks: checks(sourceQeGpuCheck.text, [
          "await this.gpuCheck().catch(()=>{Le.GPU_TIER=3})",
          "static async gpuCheck(){try{const e=await XD();Le.GPU_TIER=e.tier}catch(e){console.error(\"Error fetching GPU tier:\",e)}Le.LOW_RES=Le.GPU_TIER<3}",
        ]),
        excerpt: compact(sourceQeGpuCheck.text),
      },
      mirrorRewriteChecks: checks(rebuildMirrorSite, [
        "https://unpkg.com/detect-gpu@5.0.38/dist/benchmarks",
        "/vendor/detect-gpu/benchmarks",
      ]),
      rebuildChecks: {
        ...checks(rebuildWebgl + rebuildMain, [
          "import { getGPUTier, type TierResult } from \"detect-gpu\";",
          "const SOURCE_GPU_BENCHMARKS_URL = \"/vendor/detect-gpu/benchmarks\";",
          "mode: \"source-Qe-gpuCheck-XD-detect-gpu-5_0_38\"",
          "defaultMode: \"source-Le-GPU_TIER-default-3-LOW_RES-false\"",
          "getGPUTier({ benchmarksURL: SOURCE_GPU_BENCHMARKS_URL })",
          "sourceGpuBridgeState.tier = SOURCE_GPU_DEFAULT_TIER;",
          "sourceGpuBridgeState.lowRes = false;",
          "function sourceGpuTier() {\n  return sourceGpuBridgeState.tier;\n}",
          "function sourceLowRes() {\n  return sourceGpuBridgeState.lowRes;\n}",
          "gpuBridge: sourceGpuBridgeSnapshot()",
          "const { WebGLBackdrop, initializeSourceGpuTier } = await import(\"./webgl\");",
          "await initializeSourceGpuTier();",
        ]),
        rejectsDeviceMemoryHeuristic: !rebuildWebgl.includes("deviceMemory"),
        rejectsSaveDataHeuristic: !rebuildWebgl.includes("saveData"),
        rejectsNavigatorTierBridge: !rebuildWebgl.includes("Navigator &"),
      },
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "gpuBridge.mode !== \"source-Qe-gpuCheck-XD-detect-gpu-5_0_38\"",
        "gpuBridge.defaultMode !== \"source-Le-GPU_TIER-default-3-LOW_RES-false\"",
        "gpuBridge.benchmarksURL !== \"/vendor/detect-gpu/benchmarks\"",
        "gpuBridge.initialized !== true",
        "gpuBridge.lowRes !== (gpuBridge.tier < 3)",
        "parsed.probe.renderer?.dprPolicy?.lowRes !== gpuBridge.lowRes",
        "(mainSettings.gpuTier ?? null) !== gpuBridge.tier",
      ]),
      benchmarkFiles: {
        dir: sourceGpuBenchmarksDir,
        count: sourceGpuBenchmarkFiles.length,
        files: sourceGpuBenchmarkFiles,
        hasDesktopIntel: sourceGpuBenchmarkFiles.includes("d-intel.json"),
        hasMobileApple: sourceGpuBenchmarkFiles.includes("m-apple.json"),
        hasMobileAppleIpad: sourceGpuBenchmarkFiles.includes("m-apple-ipad.json"),
      },
    },
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
          "const screenSimWidth = workRenderWidth / SCREEN_MOUSE_SIM_SCALE;",
          "const screenSimHeight = workRenderHeight / SCREEN_MOUSE_SIM_SCALE;",
          "targetSizingMode: \"source-Lu-mousesim-render-size-div-10-no-post-rounding-no-clamp\"",
        ].every((needle) => rebuildWebgl.includes(needle))
          && !rebuildWebgl.includes("Math.max(1, workRenderWidth / SCREEN_MOUSE_SIM_SCALE)")
          && !rebuildWebgl.includes("Math.max(1, workRenderHeight / SCREEN_MOUSE_SIM_SCALE)")
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
        "e=Math.round(e*n),t=Math.round(t*n)",
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
          "this.backgroundColor=new ye(\"red\").convertLinearToSRGB()",
          "initSettings(){this.settings={renderToScreen:!1}}",
          "this.renderManager.resize(t/10,t/10,n)",
          "this.renderManager.compositeMaterial.uniforms.uRatio.value=e/t",
          "super.update(e,t,n,i),this.renderManager.compositeMaterial.uniforms.uTime.value=e",
        ]),
        thumbX1: checks(sourceThumbX1.text, [
          "class x1 extends Lo",
          "this.compositeMaterial=new _1",
          "initSettings(){this.settings={renderToScreen:!1}}",
        ]),
      },
      sourcePostRenderUTimeOrder: {
        sky: orderedIncludes(sourceSkyV1.text, [
          "update(e,t,n,i){this.ticking&&(super.update(Le.LOW_RES?0:e,t,n,i)",
          "this.renderManager.compositeMaterial.uniforms.uTime.value=Le.LOW_RES?0:e",
        ]),
        skyLowResTickingLifecycle: orderedIncludes(sourceSkyV1.text, [
          "Le.LOW_RES&&(this.ticking=!0)",
          "this.renderManager.resize(t*.75,t*.75,1)",
          "Le.LOW_RES&&(await fn(100),this.ticking=!1)",
          "update(e,t,n,i){this.ticking&&(super.update(Le.LOW_RES?0:e,t,n,i)",
        ]),
        displacement: orderedIncludes(sourceDisplacementO1.text, [
          "update(e,t,n,i){super.update(e,t,n,i)",
          "this.renderManager.compositeMaterial.uniforms.uTime.value=e",
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
        "const SOURCE_SKY_BACKGROUND = \"#666666\"",
        "const SOURCE_DISPLACEMENT_BACKGROUND = \"red\"",
        "this.skyScene.background = sourceLinearToSrgbColor(SOURCE_SKY_BACKGROUND, SOURCE_SKY_BACKGROUND)",
        "this.displacementRawScene.background = sourceLinearToSrgbColor(SOURCE_DISPLACEMENT_BACKGROUND, SOURCE_DISPLACEMENT_BACKGROUND)",
        "renderManagerOwnership: \"source-H1-Lo-single-screen-material-swap\"",
        "renderManagerOwnership: \"source-O1-Lo-single-screen-material-swap\"",
        "renderManagerOwnership: \"source-x1-Lo-single-screen-material-swap\"",
        "sizingMode: \"source-k1-resize-height-div-10-then-Lo-round-times-dpr\"",
        "expectedTargetSize: Math.max(1, Math.round((window.innerHeight / 10) * sourceDpr()))",
        "uTimeUpdateOrder: \"source-V1-super-update-before-z1-uTime-write\"",
        "private skyTicking = true",
        "private skyLowResStopTimers: ReturnType<typeof window.setTimeout>[] = []",
        "mode: \"source-V1-ticking-gates-render-low-res-resize-starts-then-100ms-stops\"",
        "renderGateMode: \"source-V1-update-this.ticking-guards-super-update\"",
        "this.markSourceSkyResizeTicking()",
        "if (!sourceLowRes()) return",
        "this.skyTicking = true",
        "this.skyTicking = false",
        "if (sourceLowRes() && !this.skyTicking)",
        "skyUpdateMode: \"source-V1-ticking-gated-low-res-resize-starts-then-100ms-stops\"",
        "renderGateMode: \"source-V1-update-this.ticking-guards-super-update\"",
        "uTimeUpdateOrder: \"source-k1-super-update-before-N1-uTime-write\"",
        "backgroundMatchesSource: this.displacementRawScene.background instanceof Color",
      ]),
      rebuildDisplacementSizing: {
        sourceK1HeightDivTenDpr:
          sourceLo.text.includes("e=Math.round(e*n),t=Math.round(t*n)")
          && sourceDisplacementO1.text.includes("this.renderManager.resize(t/10,t/10,n)"),
        rebuildUsesDpr:
          rebuildWebgl.includes("const displacementSize = Math.max(1, Math.round((height / 10) * dpr));")
          && rebuildWebgl.includes("sizingMode: \"source-k1-resize-height-div-10-then-Lo-round-times-dpr\""),
        rejectsOldCssOnlySize: !rebuildWebgl.includes("const displacementSize = Math.max(1, Math.round(height / 10));"),
        runtimeProbe:
          rebuildOutputProbe.includes("displacementSizingMode")
          && rebuildOutputProbe.includes("displacementExpectedTargetSize")
          && rebuildOutputProbe.includes("parsed.probe.renderer?.dprPolicy?.globalDpr"),
      },
      rebuildPostRenderUTimeOrder: {
        sky: Boolean(rebuildRenderSkyTarget) && orderedIncludes(rebuildRenderSkyTarget, [
          "this.renderer.render(this.skyPostScreen, this.backgroundCamera)",
          "this.renderer.setRenderTarget(null)",
          "this.skyCompositeMaterial.uniforms.uTime.value = sourceLowRes() ? 0 : time",
        ]),
        displacement: Boolean(rebuildRenderDisplacementTarget) && orderedIncludes(rebuildRenderDisplacementTarget, [
          "this.renderer.render(this.displacementPostScreen, this.backgroundCamera)",
          "this.renderer.setRenderTarget(null)",
          "this.displacementMaterial.uniforms.uTime.value = time",
        ]),
      },
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
      renderTargetDefaults: targetSnapshot(
        new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false }).clone(),
        expectedSourceDepthlessRenderTarget,
      ),
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
          "const SOURCE_C1_FLUID_STRENGTH_DEFAULT = 0.5",
          "uFluidStrength: { value: SOURCE_C1_FLUID_STRENGTH_DEFAULT }",
          "sourceFluidStrengthConstructorDefault = SOURCE_C1_FLUID_STRENGTH_DEFAULT",
          "sourceFluidStrengthRuntimeOwnership = \"source-Se-setFluidStrength-writes-C1-uFluidStrength\"",
          "sourceFluidStrengthStateDivergenceMode = \"source-C1-constructor-0_5-Se-settings-initial-0\"",
          "uFluidStrengthConstructorMode: \"source-C1-uFluidStrength-new-I-0_5\"",
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
          "mode: \"source-nD-samples-sA-output-texture-once-before-render-loop\"",
          "sourceSAInitialOutputIndex: 0",
          "sourceSAOutputFlipMode: \"source-sA-render-uses-current-as-input-then-flips-output\"",
          "matchesCurrentOnlyWhenOutputIndexZero",
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
        noPerFrameFluidStrengthStateRewrite: Boolean(rebuildTick)
          && !rebuildTick.includes("this.preCompositeMaterial.uniforms.uFluidStrength.value = this.settingsState.fluidStrength"),
        mainFluidUpdateGateUsesC1Uniform: Boolean(rebuildTick)
          && rebuildTick.includes("if ((this.preCompositeMaterial.uniforms.uFluidStrength.value as number) > 0) {\n        this.updateMainFluidPass();\n      }")
          && rebuildTick.includes("this.preCompositeMaterial.uniforms.tFluid.value = this.mainFluidPass.targets.main.texture;"),
        mainFluidStrengthGateDoesNotGateBinding: Boolean(rebuildTick)
          && !rebuildTick.includes("const mainFluidTexture =")
          && !rebuildTick.includes("this.preCompositeMaterial.uniforms.tFluid.value = mainFluidTexture")
          && !rebuildTick.includes(": null;\n      this.preCompositeMaterial.uniforms.tFluid.value"),
        mainFluidBindingProbe: rebuildWebgl.includes("tFluidBindingMode: \"source-I1-fluid-branch-binds-main-fbo-even-when-uFluidStrength-skips-update\"")
          && rebuildWebgl.includes("tFluidUpdateGateMode: \"source-I1-uFluidStrength-gates-fluidSimulation-update-not-tFluid-binding\"")
          && rebuildWebgl.includes("tFluidStrengthGateBindsMainTarget")
          && rebuildOutputProbe.includes("preCompositeC1TFluidUpdateGateMode")
          && rebuildOutputProbe.includes("preCompositeC1TFluidStrengthGateBinding"),
        noHomeFluidStrengthCompensationSetter: Boolean(rebuildPrepareHomeLighting)
          && !rebuildPrepareHomeLighting.includes("this.setFluidStrength("),
        noGalleryFluidStrengthCompensationSetter: Boolean(rebuildEnterWorkGallery)
          && !rebuildEnterWorkGallery.includes("this.setFluidStrength(0.5"),
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
      ambientOwnership: {
        source:
          sourceSe.text.includes("ambientColor:{r:0,g:0,b:0},ambientIntensity:xt.ambient")
          && sourceSe.text.includes("static setAmbientColor(e,t=1.6){const n=this.formatColor(e);oe.to(J.workScene.ambientLight.color,{r:n.r,g:n.g,b:n.b,ease:\"expo.out\",duration:t,onUpdate:()=>{")
          && sourceSe.text.includes("J.workScene.env.material.customUniforms.uDarkenColor.value.set(J.workScene.ambientLight.color.r,J.workScene.ambientLight.color.g,J.workScene.ambientLight.color.b)")
          && sourceSe.text.includes("static setAmbientIntensity(e,t=1.6){oe.to(J.workScene.ambientLight,{intensity:e,ease:\"expo.out\",duration:t})}")
          && sourceSe.text.includes("static setAmbientLight=(e,t=.5,n=1.6)=>{this.setAmbientColor(e,n),this.setAmbientIntensity(t,n)}"),
        rebuild:
          Boolean(rebuildUpdateAmbientDarkenColor)
          && Boolean(rebuildSetAmbientColor)
          && Boolean(rebuildSetAmbientIntensity)
          && Boolean(rebuildSetAmbientLight)
          && rebuildUpdateAmbientDarkenColor.includes("this.environmentMaterial.customUniforms.uDarkenColor.value as Color")
          && rebuildUpdateAmbientDarkenColor.includes("this.ambientLight.color.r")
          && rebuildUpdateAmbientDarkenColor.includes("this.ambientLight.color.g")
          && rebuildUpdateAmbientDarkenColor.includes("this.ambientLight.color.b")
          && rebuildSetAmbientColor.includes("const next = sourceRgbColor(color, SOURCE_INITIAL_SECONDARY)")
          && rebuildSetAmbientColor.includes("this.ambientLight.color.copy(next)")
          && rebuildSetAmbientColor.includes("gsap.to(this.ambientLight.color, {")
          && rebuildSetAmbientColor.includes("onUpdate: () => this.updateAmbientDarkenColor()")
          && rebuildSetAmbientIntensity.includes("gsap.to(this.ambientLight, {")
          && rebuildSetAmbientIntensity.includes("intensity,")
          && rebuildSetAmbientLight.includes("this.setAmbientColor(color, duration);")
          && rebuildSetAmbientLight.includes("this.setAmbientIntensity(intensity, duration);")
          && rebuildWebgl.includes("ambientOwnership: {")
          && rebuildWebgl.includes("mode: \"source-Se-setAmbientLight-delegates-color-intensity\"")
          && rebuildWebgl.includes("colorMode: \"source-Se-setAmbientColor-tweens-ambientLight-color-fanout-env-uDarkenColor\"")
          && rebuildWebgl.includes("intensityMode: \"source-Se-setAmbientIntensity-tweens-ambientLight-intensity\"")
          && rebuildWebgl.includes("killMode: \"source-no-kill-for-setAmbientColor-setAmbientIntensity\"")
          && rebuildWebgl.includes("backgroundUniformMode: \"rebuild-background-material-not-source-Se-ambient-target\"")
          && rebuildWebgl.includes("environmentDarkenMatchesAmbientColor: environmentDarkenColor.equals(this.ambientLight.color)")
          && !rebuildWebgl.includes("private ambientTweens")
          && !rebuildWebgl.includes("private currentAmbientIntensity")
          && !rebuildSetAmbientColor.includes(".kill()")
          && !rebuildSetAmbientIntensity.includes(".kill()")
          && !rebuildSetAmbientLight.includes(".kill()")
          && !rebuildSetAmbientColor.includes("backgroundMaterial")
          && !rebuildSetAmbientIntensity.includes("backgroundMaterial")
          && !rebuildSetAmbientLight.includes("backgroundMaterial"),
        rebuildProbeChecks: checks(rebuildOutputProbe, [
          "ambient.mode === \"source-Se-setAmbientLight-delegates-color-intensity\"",
          "ambient.colorMode === \"source-Se-setAmbientColor-tweens-ambientLight-color-fanout-env-uDarkenColor\"",
          "ambient.intensityMode === \"source-Se-setAmbientIntensity-tweens-ambientLight-intensity\"",
          "ambient.killMode === \"source-no-kill-for-setAmbientColor-setAmbientIntensity\"",
          "ambient.environmentDarkenMatchesAmbientColor === true",
          "ambientOwnership.mode !== \"source-Se-setAmbientLight-delegates-color-intensity\"",
          "ambientOwnership.colorMode !== \"source-Se-setAmbientColor-tweens-ambientLight-color-fanout-env-uDarkenColor\"",
          "ambientOwnership.intensityMode !== \"source-Se-setAmbientIntensity-tweens-ambientLight-intensity\"",
          "ambientOwnership.backgroundUniformMode !== \"rebuild-background-material-not-source-Se-ambient-target\"",
          "ambientOwnership.environmentDarkenMatchesAmbientColor !== true",
        ]),
      },
      blocksColorOwnership: {
        source:
          sourceSe.text.includes("static setBlocksColor(e,t=1.6){const n=this.formatColor(e);J.workScene.blocks.forEach(i=>{oe.to(i.instance.material.emissive,{r:n.r,g:n.g,b:n.b,ease:\"expo.out\",duration:t})})}"),
        rebuild:
          Boolean(rebuildSetBlocksColor)
          && rebuildSetBlocksColor.includes("const next = sourceRgbColor(value, DEFAULT_BG)")
          && rebuildSetBlocksColor.includes("this.workItems.forEach((item) => {")
          && rebuildSetBlocksColor.includes("gsap.to(item.material.emissive, { r: next.r, g: next.g, b: next.b, duration, ease: \"expo.out\" })")
          && rebuildWebgl.includes("blocksColorOwnership: {")
          && rebuildWebgl.includes("mode: \"source-Se-setBlocksColor-tweens-all-work-material-emissive\"")
          && rebuildWebgl.includes("targetMode: \"source-VA-MeshStandardMaterial-emissive\"")
          && rebuildWebgl.includes("killMode: \"source-no-kill-for-setBlocksColor\"")
          && rebuildWebgl.includes("allWorkEmissiveMatchesActive")
          && !rebuildWebgl.includes("private blockColorTweens")
          && !rebuildSetBlocksColor.includes(".kill()")
          && !rebuildSetBlocksColor.includes("blockColorTweens")
          && !rebuildSetBlocksColor.includes("item.material.uniforms")
          && !rebuildSetBlocksColor.includes("activeWorkItem"),
        rebuildProbeChecks: checks(rebuildOutputProbe, [
          "blocksColor.mode === \"source-Se-setBlocksColor-tweens-all-work-material-emissive\"",
          "blocksColor.killMode === \"source-no-kill-for-setBlocksColor\"",
          "blocksColor.allWorkEmissiveMatchesActive === true",
          "blocksColor.mode !== \"source-Se-setBlocksColor-tweens-all-work-material-emissive\"",
          "blocksColor.targetMode !== \"source-VA-MeshStandardMaterial-emissive\"",
          "blocksColor.killMode !== \"source-no-kill-for-setBlocksColor\"",
          "blocksColor.allWorkEmissiveMatchesActive !== true",
        ]),
      },
      thumbStateOwnership: {
        source:
          sourceSe.text.includes("static setThumbDarknessIntensity=(e,t=1.6)=>{t===0?J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenIntensity.value=this.settings.thumb.darknessIntensity=e:oe.to(this.settings.thumb,{darknessIntensity:e")
          && sourceSe.text.includes("static setThumbDarknessColor=(e,t=1.6)=>{if(typeof e==\"string\"&&(e=sr(e)),t===0)")
          && sourceSe.text.includes("J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenColor.value.set(n,i,r),this.settings.thumb.darknessColor=e")
          && sourceSe.text.includes("static setThumbSaturation=(e,t=1.6)=>{t===0?J.workThumbScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.thumb.saturation=e:oe.to(this.settings.thumb,{saturation:e")
          && sourceSe.text.includes("static setThumbMouseLightness=(e,t=1.6)=>{t===0?J.workScene.blocks.forEach(n=>{n.instance.material.customUniforms.uMouseLightness.value=this.settings.thumb.mouseLightness=e}):oe.to(this.settings.thumb,{mouseLightness:e")
          && !sourceSe.text.includes("thumbDarknessAnim")
          && !sourceSe.text.includes("thumbSaturationAnim")
          && !sourceSe.text.includes("thumbMouseLightnessAnim"),
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
          && rebuildWebgl.includes("killMode: \"source-no-kill-for-thumb-state-setters\"")
          && rebuildThumbProbe.includes("composite.killMode !== \"source-no-kill-for-thumb-state-setters\"")
          && !rebuildWebgl.includes("private thumbDarknessTweens")
          && !rebuildWebgl.includes("private thumbDarknessColorTweens")
          && !rebuildWebgl.includes("private thumbSaturationTweens")
          && !rebuildWebgl.includes("private thumbMouseLightnessTweens")
          && !rebuildSetThumbDarknessIntensity.includes(".kill()")
          && !rebuildSetThumbDarknessColor.includes(".kill()")
          && !rebuildSetThumbSaturation.includes(".kill()")
          && !rebuildSetThumbMouseLightness.includes(".kill()")
          && !rebuildSetThumbDarknessIntensity.includes(".push(")
          && !rebuildSetThumbDarknessColor.includes(".push(")
          && !rebuildSetThumbSaturation.includes(".push(")
          && !rebuildSetThumbMouseLightness.includes(".push(")
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
          && sourceSe.text.includes("J.mainScene.renderManager.compositeMaterial.uniforms.uMediaReveal.value=this.settings.media.opacity")
          && !sourceSe.text.includes("darkenAnim")
          && !sourceSe.text.includes("saturationAnim")
          && !sourceSe.text.includes("contrastAnim")
          && !sourceSe.text.includes("sceneRevealAnim")
          && !sourceSe.text.includes("fluidStrengthAnim")
          && !sourceSe.text.includes("mediaOpacityAnim"),
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
          && rebuildWebgl.includes("scalarNoKillMode: \"source-no-kill-for-darken-saturation-contrast-showScene-fluidStrength-mediaOpacity\"")
          && rebuildWebgl.includes("killOwnedMode: \"source-kill-owned-revealSpread-envRotation\"")
          && rebuildOutputProbe.includes("settingsState.scalarNoKillMode === \"source-no-kill-for-darken-saturation-contrast-showScene-fluidStrength-mediaOpacity\"")
          && rebuildOutputProbe.includes("settingsState.killOwnedMode === \"source-kill-owned-revealSpread-envRotation\"")
          && rebuildSetRevealSpread.includes(".kill()")
          && rebuildSetEnvRotation.includes(".kill()")
          && !rebuildWebgl.includes("private darkenTween")
          && !rebuildWebgl.includes("private saturationTween")
          && !rebuildWebgl.includes("private contrastTween")
          && !rebuildWebgl.includes("private sceneRevealTween")
          && !rebuildWebgl.includes("private fluidStrengthTween")
          && !rebuildWebgl.includes("private mediaOpacityTween")
          && !rebuildSetDarken.includes(".kill()")
          && !rebuildSetSaturation.includes(".kill()")
          && !rebuildSetContrast.includes(".kill()")
          && !rebuildShowScene.includes(".kill()")
          && !rebuildSetFluidStrength.includes(".kill()")
          && !rebuildSetMediaOpacity.includes(".kill()")
          && !rebuildSetDarken.includes("darkenTween")
          && !rebuildSetSaturation.includes("saturationTween")
          && !rebuildSetContrast.includes("contrastTween")
          && !rebuildShowScene.includes("sceneRevealTween")
          && !rebuildSetFluidStrength.includes("fluidStrengthTween")
          && !rebuildSetMediaOpacity.includes("mediaOpacityTween")
          && rebuildWebgl.includes("fluidStrengthUniformMatchesState")
          && rebuildWebgl.includes("fluidStrengthConstructorDefault: this.preCompositeMaterial.userData.sourceFluidStrengthConstructorDefault")
          && rebuildWebgl.includes("fluidStrengthRuntimeOwnership: this.preCompositeMaterial.userData.sourceFluidStrengthRuntimeOwnership")
          && rebuildWebgl.includes("fluidStrengthStateDivergenceMode: this.preCompositeMaterial.userData.sourceFluidStrengthStateDivergenceMode")
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
          sourceLuInitCreatesLA:
            sourceLu.text.includes("this.compositeMaterial=new lA"),
          sourceKAReplacesLAWithOA:
            Boolean(sourceWorkRenderManagerKA?.text)
            && sourceWorkRenderManagerKA.text.includes("class kA extends Lu")
            && sourceWorkRenderManagerKA.text.includes("super(e,t,n),this.compositeMaterial=new OA"),
          sourceI1CreatesC1Directly:
            sourceMainI1.text.includes("this.compositeMaterial=new C1"),
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
          rebuildRetainedSourceSurfaceRole:
            Boolean(rebuildCreateMainCompositeMaterial)
            && rebuildCreateMainCompositeMaterial.includes("sourceSurfaceRole = \"retained-source-Lu-lA-surface-not-active-I1-screen-material\"")
            && rebuildCreateMainCompositeMaterial.includes("sourceConstructionChain = \"source-Lu-initRenderer-creates-lA-kA-replaces-with-OA-I1-initRenderer-creates-C1\"")
            && rebuildCreateMainCompositeMaterial.includes("sourceActiveMainScreenMaterial = \"source-I1-C1\"")
            && rebuildWebgl.includes("retainedMainCompositeSurfaceRole: this.mainCompositeMaterial.userData.sourceSurfaceRole")
            && rebuildWebgl.includes("retainedMainCompositeConstructionChain: this.mainCompositeMaterial.userData.sourceConstructionChain")
            && rebuildWebgl.includes("activeMainScreenMaterial: this.mainCompositeMaterial.userData.sourceActiveMainScreenMaterial"),
          rebuildNoActiveLAInI1ScreenPath:
            rebuildWebgl.includes("defaultScreenMaterialMode: \"source-I1-default-direct-C1-screen-render-fxaa-tail-only\"")
            && rebuildWebgl.includes("this.mainPostScreen.material = this.preCompositeMaterial;")
            && !rebuildTick.includes("this.mainPostScreen.material = this.mainCompositeMaterial")
            && !rebuildWebgl.includes("this.renderer.render(this.mainCompositeScene"),
          rebuildProbeCoverage:
            rebuildWebgl.includes("constructorBoolDefaults: this.mainCompositeMaterial.userData.sourceConstructorBoolDefaults")
            && rebuildWebgl.includes("runtimeBoolOwnership: this.mainCompositeMaterial.userData.sourceRuntimeBoolOwnership")
            && rebuildWebgl.includes("surfaceRole: this.mainCompositeMaterial.userData.sourceSurfaceRole")
            && rebuildWebgl.includes("constructionChain: this.mainCompositeMaterial.userData.sourceConstructionChain")
            && rebuildWebgl.includes("activeMainScreenMaterial: this.mainCompositeMaterial.userData.sourceActiveMainScreenMaterial")
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
      mediaClearOwnership: {
        sourceLoSettingsClearUnused:
          sourceLo.text.includes("initSettings(){this.settings={renderToScreen:!0,clear:!1}}")
          && !sourceLo.text.includes("this.settings.clear"),
        sourceJ1SettingsClearTrueUnused:
          sourceW1.text.includes("class j1 extends Lo")
          && sourceW1.text.includes("initSettings(){this.settings={renderToScreen:!1,clear:!0}}"),
        sourceDollar1OwnsAutoClear:
          sourceMediaScene?.text.includes("update(e,t,n,i){this.renderer.autoClear=!0,super.update(e,t,n,i),this.renderer.autoClear=!1}") ?? false,
        rebuildAutoClearScoped: Boolean(rebuildRenderMediaCompositeTarget) && orderedIncludes(rebuildRenderMediaCompositeTarget, [
          "const previousAutoClear = this.renderer.autoClear",
          "this.renderer.autoClear = true",
          "this.renderer.setRenderTarget(this.mediaRawTarget)",
          "this.mediaCompositeMaterial.uniforms.tScene.value = this.mediaRawTarget.texture",
          "this.renderer.setRenderTarget(this.mediaTarget)",
          "this.renderer.render(this.mediaCompositeScene, this.backgroundCamera)",
          "this.renderer.autoClear = previousAutoClear",
        ]),
        runtimeProbe: [
          "renderManagerOwnership: \"source-j1-Lo-settings-clear-unused-autoClear-owned-by-dollar1-update\"",
          "settingsClearMode: \"source-j1-clear-true-unused-by-Lo-update\"",
          "autoClearMode: \"source-dollar1-update-temporarily-autoClear-true-around-super-update\"",
          "rendererAutoClearRestored: this.renderer.autoClear === false",
        ].every((needle) => rebuildWebgl.includes(needle)) && [
          "mediaCompositeRenderManagerOwnership",
          "mediaCompositeSettingsClearMode",
          "mediaCompositeAutoClearMode",
          "mediaCompositeRendererAutoClearRestored",
        ].every((needle) => rebuildOutputProbe.includes(needle)),
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
        sourceBloomDirectionRuntimeAssignment: {
          LuHorizontal:
            sourceLu.text.includes("this.blurMaterials[p].uniforms.uDirection.value=bf"),
          LuVertical:
            sourceLu.text.includes("this.blurMaterials[p].uniforms.uDirection.value=Mf"),
          I1Horizontal:
            sourceMainI1.text.includes("this.blurMaterials[p].uniforms.uDirection.value=wf"),
          I1Vertical:
            sourceMainI1.text.includes("this.blurMaterials[p].uniforms.uDirection.value=Tf"),
        },
        rebuildBloomDirectionRuntimeAssignment: Boolean(rebuildRenderBloomChain)
          && [
            "private readonly sourceWorkBloomHorizontalDirection = new Vector2(1, 0);",
            "private readonly sourceWorkBloomVerticalDirection = new Vector2(0, 1);",
            "private readonly sourceMainBloomHorizontalDirection = new Vector2(1, 0);",
            "private readonly sourceMainBloomVerticalDirection = new Vector2(0, 1);",
            "blurMaterial.uniforms.uDirection.value = horizontalDirection;",
            "blurMaterial.uniforms.uDirection.value = verticalDirection;",
            "source-Lu-I1-rg-uDirection-value-shared-vector-assignment",
          ].every((needle) => rebuildWebgl.includes(needle))
          && rebuildCreateBloomBlurMaterial.includes("material.userData.sourceConstructorDirection")
          && !rebuildRenderBloomChain.includes("blurMaterial.uniforms.uDirection.value.set"),
        rebuildStandardBlurConstructorOwnsDirection: Boolean(rebuildCreateBlurMaterial)
          && rebuildCreateBlurMaterial.includes("uDirection: { value: new Vector2(directionX, directionY) }")
          && rebuildCreateBlurMaterial.includes("material.userData.sourceConstructorDirection")
          && rebuildWebgl.includes("source-Na-constructor-direction-no-post-constructor-set")
          && !rebuildWebgl.includes("workBlurHorizontalMaterial.uniforms.uDirection.value.set(1, 0)")
          && !rebuildWebgl.includes("workBlurVerticalMaterial.uniforms.uDirection.value.set(0, 1)")
          && !rebuildWebgl.includes("mainBlurHorizontalMaterial.uniforms.uDirection.value.set(1, 0)")
          && !rebuildWebgl.includes("mainBlurVerticalMaterial.uniforms.uDirection.value.set(0, 1)"),
        lensflareTMapNull: Boolean(rebuildCreateLensflareMaterial?.includes("tMap: { value: null }")),
        luminosityTMapNull: Boolean(rebuildCreateLuminosityMaterial?.includes("tMap: { value: null }")),
        bloomBlurTMapNull: Boolean(rebuildCreateBloomBlurMaterial?.includes("tMap: { value: null }")),
        bloomBlurSourceUnusedSamplers: Boolean(rebuildCreateBloomBlurMaterial)
          && [
            "tDetail: { value: null }",
            "tOverview: { value: null }",
            "tOverviewMask: { value: null }",
          ].every((needle) => rebuildCreateBloomBlurMaterial.includes(needle)),
        bloomBlurConstructorDirection: Boolean(rebuildCreateBloomBlurMaterial)
          && rebuildCreateBloomBlurMaterial.includes("uDirection: { value: new Vector2(0.5, 0.5) }")
          && rebuildCreateBloomBlurMaterial.includes("material.userData.sourceConstructorDirection"),
        bloomBlurConstructorZeroResolution: Boolean(rebuildCreateBloomBlurMaterial)
          && rebuildCreateBloomBlurMaterial.includes("uResolution: { value: new Vector2() }")
          && rebuildCreateBloomBlurMaterial.includes("material.userData.sourceConstructorResolution"),
        standardBlurTMapNull: Boolean(rebuildCreateBlurMaterial?.includes("tMap: { value: null }")),
        standardBlurConstructorZeroResolution: Boolean(rebuildCreateBlurMaterial)
          && rebuildCreateBlurMaterial.includes("uResolution: { value: new Vector2() }")
          && rebuildCreateBlurMaterial.includes("material.userData.sourceConstructorResolution")
          && !rebuildCreateBlurMaterial.includes("uResolution: { value: new Vector2(1, 1) }"),
        fxaaTMapNull: Boolean(rebuildCreateFxaaMaterial?.includes("tMap: { value: null }")),
        fxaaConstructorZeroResolution: Boolean(rebuildCreateFxaaMaterial)
          && rebuildCreateFxaaMaterial.includes("uResolution: { value: new Vector2() }")
          && rebuildCreateFxaaMaterial.includes("material.userData.sourceConstructorResolution")
          && !rebuildCreateFxaaMaterial.includes("uResolution: { value: new Vector2(1, 1) }"),
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
            "calcSizes(e,t){const{resolution:n}=this.options;this.width=Math.round(e*n),this.height=Math.round(t*n),this.cellScale.set(1/e,1/t),this.fboSize.set(e,t)}",
            "onResize(e,t){this.calcSizes(e,t);for(const n in this.fbos)this.fbos[n].setSize(this.fboSize.x,this.fboSize.y)}",
            "new Dn(this.fboSize.x,this.fboSize.y,{depthBuffer:!1,stencilBuffer:!1,type:kn})",
            "this.advection=new GT",
            "this.force=new qT",
            "this.viscosity=new eA",
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
        eA: sourceEA && {
          index: sourceEA.index,
          checks: checks(sourceEA.text, [
            "class eA extends Ir",
            "glslVersion:lt",
            "blending:ot",
            "vertexShader:Co",
            "fragmentShader:QT",
            "velocity:{value:e.src.texture}",
            "velocity_new:{value:e.dst_.texture}",
            "v:{value:e.viscosity.intensity}",
            "this.output0=e.dst_",
            "this.output1=e.dst",
            "for(let r=0;r<t;r++)",
            "this.material.uniforms.velocity_new.value=n.texture",
            "return i",
          ]),
          excerpt: compact(sourceEA.text),
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
        rebuildViscosityTopology: {
          sourceShapedCreate: checks(rebuildCreateMainFluidPass || "", [
            "const viscosityMaterial = new RawShaderMaterial({",
            "fragmentShader: fluidViscosityFragment",
            "dumpShader(\"ag-viscosity\", fluidBoundedVertex, fluidViscosityFragment)",
            "velocity_new: { value: this.fluidPlaceholder }",
            "v: { value: undefined as number | undefined }",
            "viscosityMaterial",
            "viscosityScene: makeBoundedScene(viscosityMaterial)",
            "viscosityA: makeFluidRenderTarget()",
            "viscosityB: makeFluidRenderTarget()",
          ]),
          sourceShapedResize: checks(rebuildResizeMainFluidPass || "", [
            "const fluidWidth = width;",
            "const fluidHeight = height;",
            "pass.fboSize.set(fluidWidth, fluidHeight);",
            "pass.cellScale.set(1 / width, 1 / height);",
            "Object.values(pass.targets).forEach((target) => target.setSize(fluidWidth, fluidHeight));",
          ]),
          noRoundedResizeBridge: Boolean(rebuildResizeMainFluidPass)
            && !rebuildResizeMainFluidPass.includes("Math.round(width)")
            && !rebuildResizeMainFluidPass.includes("Math.round(height)")
            && !rebuildResizeMainFluidPass.includes("Math.max(1"),
          sourceShapedUpdate: checks(rebuildUpdateMainFluidPass || "", [
            "if (SOURCE_AG_VISCOSITY_DEFAULTS.enabled) {",
            "pass.viscosityMaterial.uniforms.velocity.value = pass.targets.velocity.texture",
            "pass.viscosityMaterial.uniforms.v.value = SOURCE_AG_VISCOSITY_DEFAULTS.intensity",
            "for (let index = 0; index < SOURCE_AG_VISCOSITY_DEFAULTS.iterations; index += 1)",
            "pass.viscosityMaterial.uniforms.velocity_new.value = readTarget.texture",
            "this.renderer.render(pass.viscosityScene, this.backgroundCamera)",
            "velocityTarget = writeTarget",
            "pass.divergenceMaterial.uniforms.velocity.value = velocityTarget.texture",
            "pass.pressureMaterial.uniforms.velocity.value = velocityTarget.texture",
          ]),
          sourceShapedProbe: checks(rebuildMainFluidProbe || "", [
            "mode: \"source-ag-createFbos-seven-targets-including-disabled-viscosity\"",
            "targetKeys: Object.keys(pass.targets)",
            "viscosityRuntimeMode: SOURCE_AG_VISCOSITY_DEFAULTS.enabled",
            "\"source-ag-eA-viscosity-pass-constructed-default-disabled\"",
            "viscosityConstructorV: pass.viscosityMaterial.uniforms.v.value ?? null",
            "viscosity: sourceMaterialProbe(pass.viscosityMaterial, \"source-eA-raw-glsl3\")",
            "viscosityA: renderTargetProbe(this.renderer, pass.targets.viscosityA)",
            "viscosityB: renderTargetProbe(this.renderer, pass.targets.viscosityB)",
            "mode: \"source-ag-calcSizes-raw-size-preserved-for-fboSize-cellScale-and-targets\"",
            "sourceResizeChain: \"source-I1-Fa-render-size-div-2-then-ag-onResize-div-3\"",
            "fboSizeMatchesSource",
            "cellScaleMatchesSource",
            "targetsMatchFboSize",
          ]),
        rebuildDefaults: checks(rebuildWebgl, [
          "const SOURCE_AG_VISCOSITY_DEFAULTS = {",
          "enabled: false",
          "intensity: 30",
          "iterations: 5",
          "const fluidViscosityFragment = `precision mediump float;",
        ]),
        shaderDumpAttribution: checks(readFileSync("scripts/dump-va-shader.mjs", "utf8"), [
          "\"ag-viscosity\": sourceShader(bundle, \"QT\")",
          "\"ag-viscosity\": sourceShader(bundle, \"Co\")",
          "shaderName === \"ag-viscosity\"",
          "viscosityUniformSurface",
          "viscosityJacobiFormula",
        ]),
        shaderResidualSummary: checks(readFileSync("scripts/summarize-phase1-shader-gaps.mjs", "utf8"), [
          "\"ag-viscosity\"",
          "including the default-disabled `ag-viscosity` branch",
        ]),
        outputProbeGuards: checks(rebuildOutputProbe, [
          "source-ag-createFbos-seven-targets-including-disabled-viscosity",
          "source-ag-eA-viscosity-pass-constructed-default-disabled",
            "source-eA-raw-glsl3",
            "\"main\", \"velocity\", \"viscosityA\", \"viscosityB\", \"divergence\", \"pressureA\", \"pressureB\"",
            "mainFluidViscosityDefaultIntensity",
            "source-ag-calcSizes-raw-size-preserved-for-fboSize-cellScale-and-targets",
            "mainFluidRawSizingMode",
            "mainFluidRawFboSize",
            "mainFluidRawCellScale",
            "mainFluidRawTargetSize",
            "for (const key of [\"advection\", \"viscosity\", \"divergence\", \"poisson\", \"pressure\"])",
            "for (const uniformKey of [\"bounds\", \"velocity\", \"velocity_new\", \"v\", \"px\", \"dt\"])",
            "materialSurfaceErrors.push(`mainFluidViscosity${uniformKey}Uniform`)",
            "for (const key of expectedMainFluidTargetKeys)",
          ]),
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
        "setLightPosition(e,t){this.settings.lensflare.enabled&&this.lensflareMaterial.uniforms.uLightPosition.value.set(e,t)}",
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
        sourceSetLightPositionGuard:
          sourceMainI1.text.includes("setLightPosition(e,t){this.settings.lensflare.enabled&&this.lensflareMaterial.uniforms.uLightPosition.value.set(e,t)}"),
        rebuildSetLightPositionGuard:
          rebuildWebgl.includes("private setMainLensflareLightPosition(x: number, y: number)") &&
          rebuildWebgl.includes("if (!SOURCE_MAIN_LENSFLARE_SETTINGS.enabled || !this.mainLensflareMaterial) return;") &&
          rebuildWebgl.includes("(this.mainLensflareMaterial.uniforms.uLightPosition.value as Vector2).set(x, y);") &&
          rebuildWebgl.includes("setLightPositionMode: \"source-I1-setLightPosition-guards-lensflare-enabled\""),
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
        sourceC1RuntimeUniformOrder:
          orderedIncludes(sourceMainI1.text, [
            "this.settings.fluid.enabled&&(this.compositeMaterial.uniforms.uFluidStrength.value>0&&this.fluidSimulation.update()",
            "this.compositeMaterial.uniforms.tScene.value=this.settings.blur.enabled?f.texture:a.texture",
            "this.compositeMaterial.uniforms.boolBloom.value=this.settings.bloom.enabled",
            "this.compositeMaterial.uniforms.boolFluid.value=this.settings.fluid.enabled",
            "this.compositeMaterial.uniforms.boolLuminosity.value=this.settings.luminosity.enabled",
            "this.compositeMaterial.uniforms.boolFxaa.value=this.settings.fxaa.enabled",
            "this.compositeMaterial.uniforms.tLensflare.value=v.texture",
            "this.screen.material=this.compositeMaterial",
            "this.settings.renderToScreen?(r.setRenderTarget(null)",
          ]),
        rebuildC1RuntimeUniformOrder:
          Boolean(rebuildTick)
          && orderedIncludes(rebuildTick, [
            "if (this.sourceMainRenderSettings.fluid.enabled) {",
            "if ((this.preCompositeMaterial.uniforms.uFluidStrength.value as number) > 0)",
            "this.preCompositeMaterial.uniforms.tFluid.value = this.mainFluidPass.targets.main.texture;",
            "this.preCompositeMaterial.uniforms.tScene.value = this.sourceMainRenderSettings.blur.enabled ? this.mainBlurTargetB.texture : this.mainRawTarget.texture;",
            "this.preCompositeMaterial.uniforms.boolBloom.value = this.sourceMainRenderSettings.bloom.enabled;",
            "this.preCompositeMaterial.uniforms.boolFluid.value = this.sourceMainRenderSettings.fluid.enabled;",
            "this.preCompositeMaterial.uniforms.boolLuminosity.value = this.sourceMainRenderSettings.luminosity.enabled;",
            "this.preCompositeMaterial.uniforms.boolFxaa.value = this.sourceMainRenderSettings.fxaa.enabled;",
            "this.preCompositeMaterial.uniforms.tLensflare.value = this.mainLensflareTarget.texture;",
            "this.renderHomeCompositePass();",
          ])
          && rebuildWebgl.includes("c1RuntimeUniformOrder: \"source-I1-update-writes-C1-tScene-bools-tLensflare-after-fluid-before-screen-render\""),
        rebuildNoEarlyC1RuntimeUniformBinding:
          !rebuildTickBeforeMainRaw.includes("this.preCompositeMaterial.uniforms.boolBloom.value")
          && !rebuildTickBeforeMainRaw.includes("this.preCompositeMaterial.uniforms.boolFluid.value")
          && !rebuildTickBeforeMainRaw.includes("this.preCompositeMaterial.uniforms.boolLuminosity.value")
          && !rebuildTickBeforeMainRaw.includes("this.preCompositeMaterial.uniforms.boolFxaa.value")
          && !rebuildTickBeforeMainRaw.includes("this.preCompositeMaterial.uniforms.tLensflare.value"),
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
        "onMouseMove({x:e,y:t}){this.renderManager&&this.renderManager.setLightPosition(0,1-t/Pe.h)}",
        "setRenderManager(){this.renderManager=new I1(this.renderer,this.scene,this.camera)}",
        "update(e,t,n){super.update(e,t,n),this.renderManager.compositeMaterial.update(e,t,n)}",
        "resize(e,t,n){super.resize(e,t,n),this.renderManager.compositeMaterial.resize(e,t)}",
      ]),
      rebuildChecks: {
        mainRawCameraMode: rebuildWebgl.includes("mainRawCameraMode: \"source-yg-perspective-distance-1000-no-camera-controller\""),
        mainRawRenderCamera: rebuildWebgl.includes("mainRawRenderCamera: \"source-U1-I1-renderTargetA-uses-yg-camera\""),
        c1UpdateOrder: rebuildWebgl.includes("uTimeUpdateOrder: \"source-U1-C1-update-after-I1-render\""),
        lensflareMouseMoveInput:
          rebuildWebgl.includes("this.setMainLensflareLightPosition(0, 1 - event.clientY / window.innerHeight);") &&
          !rebuildWebgl.includes("this.setMainLensflareLightPosition(0, 1 - event.clientY / Math.max(1, window.innerHeight));") &&
          rebuildWebgl.includes("mouseMoveInputMode: \"source-U1-onMouseMove-setLightPosition-0-1-y-over-Pe-h-direct-viewport-height\"") &&
          rebuildWebgl.includes("mouseMoveDenominatorMode: \"source-Pe-h-direct-no-rebuild-Math.max-clamp\""),
      },
      excerpt: compact(sourceMainU1Scene.text),
    },
    mainYgCameraSurface: sourceMainYg && {
      index: sourceMainYg.index,
      checks: checks(sourceMainYg.text, [
        "function Ef(s,e,t,n=1){const i=t/n;return 2*Math.atan(s/e/(2*i))*(180/Math.PI)}",
        "this.distance=1e3",
        "this.fov=Ef(innerWidth,innerWidth/innerHeight,this.distance)",
        "this.camera=new Ya(this.fov,Pe.aspect,1,this.distance*2)",
        "this.camera.position.set(0,0,this.distance)",
        "setCameraController(){}",
        "this.camera.fov=Ef(e,e/t,this.distance)",
        "this.camera.aspect=e/t",
        "this.camera.updateProjectionMatrix()",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "function sourceYgFov(width: number, aspect: number, distance: number, scale = 1)",
        "return MathUtils.radToDeg(2 * Math.atan(width / safeAspect / (2 * (distance / scale))))",
        "private mainCamera = new PerspectiveCamera(55, 1, 1, 2000)",
        "private mainCameraDistance = 1000",
        "this.mainCamera.fov = sourceYgFov(width, width / height, this.mainCameraDistance)",
        "this.mainCamera.aspect = width / height",
        "this.mainCamera.far = this.mainCameraDistance * 2",
        "this.mainCamera.position.set(0, 0, this.mainCameraDistance)",
        "this.mainCamera.updateProjectionMatrix()",
        "surfaceMode: \"source-yg-Ya-perspective-Ef-inner-aspect-near1-distance1000-far2000\"",
        "resizeProjectionMode: \"source-yg-resize-super-then-Ef-fov-aspect-updateProjectionMatrix\"",
        "expectedFov: sourceYgFov(window.innerWidth, window.innerWidth / window.innerHeight, this.mainCameraDistance)",
        "expectedNear: 1",
        "expectedFar: this.mainCameraDistance * 2",
        "fovMatchesSource: Math.abs(this.mainCamera.fov - sourceYgFov(window.innerWidth, window.innerWidth / window.innerHeight, this.mainCameraDistance)) < 0.0001",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "mainRawCamera.surfaceMode !== \"source-yg-Ya-perspective-Ef-inner-aspect-near1-distance1000-far2000\"",
        "mainRawCamera.resizeProjectionMode !== \"source-yg-resize-super-then-Ef-fov-aspect-updateProjectionMatrix\"",
        "mainRawCameraExpectedFov",
        "mainRawCameraFovMatchesSource",
        "mainRawCameraNear",
        "mainRawCameraExpectedFar",
      ]),
      excerpt: compact(sourceMainYg.text),
    },
    renderer: sourceRenderer && {
      index: sourceRenderer.index,
      checks: checks(sourceRenderer.text, [
        "super({alpha:!0,antialias:!1,preserveDrawingBuffer:!1,powerPreference:\"high-performance\",stencil:!1,depth:!1})",
        "this.autoClear=!1",
        "this.outputColorSpace=Gt",
        "resize(e,t,n){this.setSize(e,t),this.setPixelRatio(n)}",
      ]),
      sourceResizeOrder: orderedIncludes(sourceRenderer.text, [
        "resize(e,t,n){this.setSize(e,t)",
        "this.setPixelRatio(n)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "this.renderer.setSize(width, height);",
        "this.renderer.setPixelRatio(dpr);",
        "constructorDprMode: \"source-qw-constructor-no-initial-setPixelRatio-resize-owns-dpr\"",
        "resizeMode: \"source-qw-resize-setSize-before-setPixelRatio-default-updateStyle\"",
        "canvasStyleUpdateMode: \"source-qw-setSize-default-updateStyle-true\"",
      ]),
      rebuildResizeOrder: orderedIncludes(rebuildWebgl, [
        "this.renderer.setSize(width, height);",
        "this.renderer.setPixelRatio(dpr);",
      ]),
      rejectsConstructorDpr: Boolean(rebuildConstructor) && !rebuildConstructor.includes("this.renderer.setPixelRatio("),
      rejectsOldResizeOrder: !rebuildWebgl.includes("this.renderer.setPixelRatio(dpr);\n    this.renderer.setSize(width, height, false);"),
      rejectsNoStyleUpdateSetSize: !rebuildWebgl.includes("this.renderer.setSize(width, height, false);"),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "renderer.constructorDprMode !== \"source-qw-constructor-no-initial-setPixelRatio-resize-owns-dpr\"",
        "renderer.resizeMode !== \"source-qw-resize-setSize-before-setPixelRatio-default-updateStyle\"",
        "renderer.canvasStyleUpdateMode !== \"source-qw-setSize-default-updateStyle-true\"",
        "renderer.resizeOrder !== \"setSize-then-setPixelRatio\"",
        "Renderer qw resize source-shape mismatch",
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
        "rebuildFrameOrder: [\"media-position\", \"sky\", \"media\", \"work-raw\", \"work-bloom\", \"work-mousesim\", \"work-composite\", \"p1-post-render\", \"main-raw\", \"main-blur\", \"main-lensflare\", \"main-luminosity\", \"main-bloom\", \"main-fluid\", \"main-C1-runtime-uniforms\", \"main-C1\", \"main-final-screen\", \"workthumb\", \"wavves\", \"character-when-about\"]",
        "workUpdateOrder: [\"Lu.renderManager.raw\", \"Lu.renderManager.bloom\", \"Ka.mouseSimulation\", \"Lu.renderManager.composite\", \"IT.cameraController\", \"p1.components\"]",
        "mainUpdateOrder: [\"I1.raw\", \"I1.optional-blur\", \"I1.optional-lensflare\", \"I1.optional-luminosity\", \"I1.optional-bloom\", \"I1.fluid\", \"I1.C1-runtime-uniforms\", \"I1.C1-screen\"]",
        "mouseSimulationOrder: \"source-Lu-mousesim-after-raw-bloom-before-composite\"",
        "environmentUpdateOrder: \"source-Iu-cameraController-before-h1-component-before-p1-spotlight-blocks\"",
        "tWorkBindingMode: \"source-nD-init-one-time-C1-tWork-work-renderTargetComposite\"",
        "tMediaBindingMode: \"source-nD-init-one-time-C1-tMedia-media-renderTargetComposite\"",
        "tMouseSimBindingMode: \"source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output\"",
        "mode: \"source-nD-samples-sA-output-texture-once-before-render-loop\"",
        "sourceSAOutputFlipMode: \"source-sA-render-uses-current-as-input-then-flips-output\"",
        "sourceInitLifecycleMode: this.sourceInitLifecycle.mode",
        "firstResizeBeforeDelayedBindings: this.sourceInitLifecycle.firstResizeDone",
        "delayedBindingsApplied: this.sourceInitLifecycle.delayedBindingsApplied",
        "startedAfterDelayedBindings: this.sourceInitLifecycle.started && this.sourceInitLifecycle.delayedBindingsApplied",
      ]),
      rebuildP1PostRenderOrder: {
        blockFound: Boolean(rebuildUpdateWorkSceneForNextFrame),
        cameraBeforeEnvironmentBeforeP1OwnWork: Boolean(rebuildUpdateWorkSceneForNextFrame)
          && orderedIncludes(rebuildUpdateWorkSceneForNextFrame, [
            "this.updateHomeCamera(delta);",
            "this.environmentMaterial.customUniforms.uTime.value = time;",
            "this.spotLight.position.x = this.homeCamera.position.x * 0.175;",
            "this.updateVisibleWorkItems(time, delta);",
            "this.updateAuxiliaryBlocks(time, delta);",
          ]),
        noEnvironmentBeforeCamera: Boolean(rebuildUpdateWorkSceneForNextFrame)
          && !orderedIncludes(rebuildUpdateWorkSceneForNextFrame, [
            "this.environmentMaterial.customUniforms.uTime.value = time;",
            "this.updateHomeCamera(delta);",
          ]),
        runtimeProbeMarker: rebuildWebgl.includes("environmentUpdateOrder: \"source-Iu-cameraController-before-h1-component-before-p1-spotlight-blocks\""),
        outputProbeAssertion: rebuildOutputProbe.includes("source-Iu-cameraController-before-h1-component-before-p1-spotlight-blocks"),
      },
      rebuildInitLifecycle: {
        constructorFound: Boolean(rebuildConstructor),
        lifecycleMethodFound: Boolean(rebuildSourceInitLifecycle),
        delayedBinderFound: Boolean(rebuildDelayedCompositeSkyBinding),
        constructorFirstResizeOnly: Boolean(rebuildConstructor)
          && rebuildConstructor.includes("this.resize();")
          && rebuildConstructor.includes("this.sourceInitLifecycle.firstResizeDone = true;"),
        constructorNoImmediateMainInputBinding: Boolean(rebuildConstructor)
          && !rebuildConstructor.includes("this.bindSourceMainCompositeInputs();"),
        constructorNoImmediateSkyRepeat: Boolean(rebuildConstructor)
          && !rebuildConstructor.includes("this.skyCompositeTarget.texture.wrapS = RepeatWrapping")
          && !rebuildConstructor.includes("this.skyCompositeTarget.texture.wrapT = RepeatWrapping"),
        constructorNoImmediateTick: Boolean(rebuildConstructor)
          && !rebuildConstructor.includes("this.tick();"),
        delayedBinderSetsCompositeInputsSkyRepeatAndTSky: Boolean(rebuildDelayedCompositeSkyBinding)
          && rebuildDelayedCompositeSkyBinding.includes("this.bindSourceMainCompositeInputs();")
          && rebuildDelayedCompositeSkyBinding.includes("this.skyCompositeTarget.texture.wrapS = RepeatWrapping;")
          && rebuildDelayedCompositeSkyBinding.includes("this.skyCompositeTarget.texture.wrapT = RepeatWrapping;")
          && rebuildDelayedCompositeSkyBinding.includes("this.environmentMaterial.customUniforms.tSky.value = this.environmentSkyTexture();")
          && rebuildDelayedCompositeSkyBinding.includes("sourceDelayedTSkyBindingMode = \"source-nD-after-first-resize-100ms-bind-repeat-composite\""),
        startAfterDelayedBindings: Boolean(rebuildSourceInitLifecycle)
          && orderedIncludes(rebuildSourceInitLifecycle, [
            "this.bindSourceDelayedCompositeInputsAndSky();",
            "this.resize();",
            "this.sourceInitLifecycle.secondResizeAfterDelayedBindings = true;",
            "this.sourceInitLifecycle.started = true;",
            "this.raf = requestAnimationFrame(this.tick);",
          ]),
        startNoImmediateTick: Boolean(rebuildSourceInitLifecycle)
          && !rebuildSourceInitLifecycle.includes("this.tick();"),
        animateInAwaitsInitLifecycle: rebuildWebgl.includes("this.sourceInitLifecyclePromise")
          && rebuildWebgl.includes("this.sourceTexturePreloadPromise"),
      },
      excerpt: compact(sourceCanvasManager.text),
    },
    rafManager: sourceRafManager && {
      index: sourceRafManager.index,
      checks: checks(sourceRafManager.text, [
        "class w0{constructor(){this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.count=0,this.time=0,this.prev=0,this.running=!1}",
        "start(){this.startTime=El(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}",
        "getDelta(){let e=0;if(this.running){const t=El();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}",
        "getElapsedTime(){return this.getDelta(),this.elapsedTime}",
        "static start(){this.stopped=!1,this.time.start(),this.id=window.requestAnimationFrame(this.render)}",
        "static frame(e){const t=this.time.getDelta(),n=this.time.getElapsedTime(),i=this.time.getFPS();",
        "this.frames[r].handler({time:n,delta:t,frame:e,fps:i})",
      ]),
      rebuildChecks: {
        rawFrameDelta: Boolean(rebuildTick) && rebuildTick.includes("const delta = deltaNow - this.lastTickTime;"),
        noFrameDeltaClamp: !rebuildWebgl.includes("MathUtils.clamp(time - this.lastTickTime, 1 / 120, 1 / 20)"),
        elapsedTimeState: rebuildWebgl.includes("private sourceElapsedTime = 0;"),
        elapsedTimeResetOnStart: Boolean(rebuildSourceInitLifecycle)
          && rebuildSourceInitLifecycle.includes("this.sourceElapsedTime = 0;"),
        elapsedTimeAccumulatesRawDelta: Boolean(rebuildTick)
          && orderedIncludes(rebuildTick, [
            "this.sourceElapsedTime += delta;",
            "this.lastTickTime = deltaNow;",
            "const elapsedNow = performance.now() * 0.001;",
            "const elapsedDelta = elapsedNow - this.lastTickTime;",
            "this.sourceElapsedTime += elapsedDelta;",
            "this.lastTickTime = elapsedNow;",
            "const time = this.sourceElapsedTime;",
          ]),
        noWallClockSceneTime: Boolean(rebuildTick)
          && !rebuildTick.includes("const time = performance.now() * 0.001;"),
        storesLastFrameDelta: Boolean(rebuildTick) && rebuildTick.includes("this.lastFrameDelta = delta;"),
        storesLastFrameElapsedDelta: Boolean(rebuildTick) && rebuildTick.includes("this.lastFrameElapsedDelta = elapsedDelta;"),
        startUsesRequestAnimationFrame: Boolean(rebuildSourceInitLifecycle)
          && rebuildSourceInitLifecycle.includes("this.raf = requestAnimationFrame(this.tick);"),
        startNoImmediateTick: Boolean(rebuildSourceInitLifecycle)
          && !rebuildSourceInitLifecycle.includes("this.tick();"),
        probeDeltaMarker: rebuildWebgl.includes("frameDeltaMode: \"source-Bt-w0-getDelta-raw-no-min-max-clamp\""),
        probeStartMarker: rebuildWebgl.includes("frameStartMode: \"source-Bt-start-requestAnimationFrame-before-frame\""),
        probeTimeMarker: rebuildWebgl.includes("frameTimeMode: \"source-Bt-w0-getElapsedTime-elapsed-after-start-not-wall-clock\""),
        probeElapsedTimeMarker: rebuildWebgl.includes("frameElapsedTimeMode: \"source-Bt-frame-delta-then-getElapsedTime-second-getDelta-before-handlers\""),
        outputProbeTimeAssertion: rebuildOutputProbe.includes("Frame time source-shape mismatch"),
        outputProbeElapsedTimeAssertion: rebuildOutputProbe.includes("Frame elapsed-time source-shape mismatch"),
        mousePersistenceUsesRawDelta: rebuildWebgl.includes("persistenceDeltaMode: \"source-Ka-update-uPersistance-pow-persistence-raw-delta-times-10\""),
        mousePersistenceNoFixedSixtyFpsGuard: !rebuildWebgl.includes("Math.pow(0.85, 1 / 60 * 10)"),
        outputProbeDeltaAssertion: rebuildOutputProbe.includes("Frame delta source-shape mismatch"),
        outputProbeStartAssertion: rebuildOutputProbe.includes("Frame start source-shape mismatch"),
      },
      excerpt: compact(sourceRafManager.text),
    },
    textures: sourceTextureManager && {
      index: sourceTextureManager.index,
      checks: checks(sourceTextureManager.text, [
        "static loadTexture=e=>this.textureLoader.load(e)",
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
        sourceImmediateTextureLoadHelper: rebuildWebgl.includes("private loadTextureImmediate(src: string")
          && rebuildWebgl.includes("texture = this.loader.load(src")
          && rebuildWebgl.includes("this.textureCache.set(src, texture)")
          && rebuildWebgl.includes("this.textureLoadPromises.set(src, loaded)"),
        noLoadedTextureFilterOverride: !rebuildWebgl.includes("function setTextureQuality")
          && !sourceLoadedTextureHelperBody.includes("texture.minFilter")
          && !sourceLoadedTextureHelperBody.includes("texture.magFilter")
          && !sourceLoadedTextureHelperBody.includes("texture.anisotropy"),
        runtimeGuard: rebuildWebgl.includes("sourceLoadedTextureMode: \"source-Xt-TextureLoader-default-sampling-wrap-only-overrides\""),
      },
      rebuildImmediateTextureBindings: {
        blueNoise: orderedIncludes(rebuildWebgl, [
          "const blueNoiseLoad = this.loadTextureImmediate(\"/images/textures/blue-noise.png\")",
          "const blueNoiseTexture = blueNoiseLoad.texture",
          "blueNoiseTexture.wrapS = RepeatWrapping",
          "this.sourceBlueNoiseTexture = blueNoiseTexture",
          "this.sourceBlueNoiseObjectBindingMode = \"source-Xt-loadTexture-immediate-texture-object-bound-before-onload\"",
          "this.noiseTexture = blueNoiseTexture",
          "this.preCompositeMaterial.uniforms.tNoise.value = blueNoiseTexture",
          "const blueNoise = blueNoiseLoad.loaded.then((texture) =>",
          "this.sourceBlueNoiseLoadedTexture = texture",
          "this.sourceTexturePreloadState.blueNoise = true",
        ]),
        kaNoiseTextureSourceNull:
          rebuildWebgl.includes("kaNoiseTextureBindingMode: \"source-Ka-uNoiseTexture-constructor-null-no-runtime-writer\"")
          && !rebuildWebgl.includes("this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value = blueNoiseTexture")
          && !rebuildWebgl.includes("item.mouseMaterial.uniforms.uNoiseTexture.value = blueNoiseTexture"),
        perlin2: orderedIncludes(rebuildWebgl, [
          "const perlin2Load = this.loadTextureImmediate(`/images/textures/perlin-2.${sourceExt}`)",
          "const perlin2Texture = perlin2Load.texture",
          "perlin2Texture.wrapS = RepeatWrapping",
          "this.sourcePerlin2Texture = perlin2Texture",
          "this.sourcePerlin2ObjectBindingMode = \"source-Xt-loadTexture-immediate-texture-object-bound-before-onload\"",
          "this.perlinTexture = perlin2Texture",
          "this.preCompositeMaterial.uniforms.tPerlin.value = perlin2Texture",
          "const perlin2 = perlin2Load.loaded.then((texture) =>",
          "this.sourcePerlin2LoadedTexture = texture",
          "this.sourceTexturePreloadState.perlin2 = true",
        ]),
        perlin1: orderedIncludes(rebuildWebgl, [
          "const perlin1Load = this.loadTextureImmediate(`/images/textures/perlin-1.${sourceExt}`)",
          "const perlin1Texture = perlin1Load.texture",
          "perlin1Texture.wrapS = MirroredRepeatWrapping",
          "this.sourcePerlin1Texture = perlin1Texture",
          "this.sourcePerlin1ObjectBindingMode = \"source-Xt-loadTexture-immediate-texture-object-bound-before-onload\"",
          "this.workPerlinTexture = perlin1Texture",
          "item.material.uniforms.tPerlin.value = perlin1Texture",
          "if (this.aboutBlocks) this.aboutBlocks.material.uniforms.tPerlin.value = perlin1Texture",
          "if (this.floatingBlocks) this.floatingBlocks.material.uniforms.tPerlin.value = perlin1Texture",
          "const perlin1 = perlin1Load.loaded.then((texture) =>",
          "this.sourcePerlin1LoadedTexture = texture",
          "this.sourceTexturePreloadState.perlin1 = true",
        ]),
        runtimeProbe: rebuildWebgl.includes("sourceImmediateTextureBindings")
          && rebuildWebgl.includes("c1TNoiseIsImmediateTexture")
          && rebuildWebgl.includes("c1TPerlinIsImmediateTexture")
          && rebuildWebgl.includes("allWorkUniformsImmediate")
          && rebuildOutputProbe.includes("immediateBindingMode")
          && rebuildOutputProbe.includes("blueNoiseC1TNoiseImmediate")
          && rebuildOutputProbe.includes("blueNoiseKaNoiseMode")
          && rebuildOutputProbe.includes("perlin2C1Immediate")
          && rebuildOutputProbe.includes("perlin1WorkImmediate"),
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
    p1HomeCamera: sourceP1SetCamera && {
      index: sourceP1SetCamera.index,
      checks: checks(sourceP1SetCamera.text, [
        "setCamera(){this.camera=new Ya(55,innerWidth/innerHeight,1,2e3)",
        "this.camera.position.set(0,0,5.5)",
      ]),
      Ya: sourceYa && {
        index: sourceYa.index,
        checks: checks(sourceYa.text, [
          "class Ya extends Wt",
          "constructor(e){super(e)}",
          "resize(){this.updateProjectionMatrix()}",
        ]),
        excerpt: compact(sourceYa.text),
      },
      IuResize: sourceIuResize && {
        index: sourceIuResize.index,
        checks: checks(sourceIuResize.text, [
          "this.renderManager.resize(e,t,n)",
          "this.camera.resize(e,t)",
          "this.camera.aspect=e/t",
          "this.camera.updateProjectionMatrix()",
        ]),
        excerpt: compact(sourceIuResize.text),
      },
      rebuildChecks: checks(rebuildWebgl, [
        "private homeCamera = new PerspectiveCamera(55, 1, 1, 2000)",
        "this.homeCamera.position.set(0, 0, 5.5)",
        "this.homeCamera.aspect = width / height",
        "this.homeCamera.updateProjectionMatrix()",
        "surfaceMode: \"source-p1-Ya-perspective-55-inner-aspect-near1-far2000-position-5_5\"",
        "resizeProjectionMode: \"source-Ya-resize-updateProjectionMatrix-plus-Iu-aspect-update\"",
        "initialPositionMode: \"source-p1-setCamera-position-0-0-5_5\"",
        "expectedFov: 55",
        "expectedNear: 1",
        "expectedFar: 2000",
        "aspectMatchesViewport: Math.abs(this.homeCamera.aspect - window.innerWidth / window.innerHeight) < 0.0001",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "camera.surfaceMode !== \"source-p1-Ya-perspective-55-inner-aspect-near1-far2000-position-5_5\"",
        "camera.resizeProjectionMode !== \"source-Ya-resize-updateProjectionMatrix-plus-Iu-aspect-update\"",
        "camera.initialPositionMode !== \"source-p1-setCamera-position-0-0-5_5\"",
        "camera.expectedFov !== 55",
        "camera.expectedNear !== 1",
        "camera.expectedFar !== 2000",
        "camera.aspectMatchesViewport !== true",
      ]),
      excerpt: compact(sourceP1SetCamera.text),
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
        "const t=4,n=bo(this.scroll.velocity*-.015,-t,t)",
        "this.sceneRotation=Yi(this.sceneRotation,n,5,e)",
        "const i=1,r=bo(Math.abs(this.scroll.velocity*.0015),0,i)",
        "this.zoom=Yi(this.zoom,r,5,e)",
        "J.workScene.scene.rotation.z=_a.degToRad(this.sceneRotation)",
        "J.workScene.scene.position.z=J.workScene.scene.rotation.z-this.zoom",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "function sourceClampRound(value: number, min: number, max: number)",
        "const targetRotation = MathUtils.degToRad(progress * 360 + 180)",
        "this.sceneWrap.rotation.y = targetRotation",
        "this.preCompositeMaterial.uniforms.uTransformX.value = progress",
        "this.galleryRollTarget = sourceClampRound(velocity * -0.015, -4, 4)",
        "this.galleryZoomTarget = sourceClampRound(Math.abs(velocity * 0.0015), 0, 1)",
        "this.sceneRotation = sourceDamp(this.sceneRotation, this.galleryRollTarget, 5, delta)",
        "this.zoom = sourceDamp(this.zoom, this.galleryZoomTarget, 5, delta)",
        "this.homeScene.rotation.z = MathUtils.degToRad(this.sceneRotation)",
        "this.homeScene.position.z = this.homeScene.rotation.z - this.zoom",
        "this.updateThumbGallery(-progress)",
        "sourceProgressSignMode: \"source-yD-updateScene-workThumbScene-thumbs-updateGalleryProgress-negative-scroll-progress\"",
        "sourceProgressUpdateOrder: \"source-yD-sceneWrap-uTransformX-thumbProgress-before-roll-zoom\"",
        "sourceProgressTransformOrder: \"source-yD-sceneWrap-then-uTransformX-then-thumbProgress\"",
        "mode: \"source-yD-updateScene-roll-zoom-bo-targets-Yi-rounded-lerp\"",
      ]),
      rebuildProbeChecks: checks(rebuildThumbProbe + rebuildOutputProbe, [
        "source-yD-updateScene-roll-zoom-bo-targets-Yi-rounded-lerp",
        "source-bo-clamp-minus4-plus4-Fn4",
        "source-bo-clamp-0-1-Fn4",
        "source-Yi-PT-Fn4-exponential-lerp",
      ]),
      scrollRuntime: {
        source:
          sourceYDClass?.text.includes("this.scroll.diff=Yi(this.scroll.diff,0,5,t)") === true
          && sourceYDClass.text.includes("this.scroll.animated=Yi(this.scroll.animated,this.scroll.targetPlusDiff,5,t)")
          && sourceYDUpdateScene.text.includes("const t=4,n=bo(this.scroll.velocity*-.015,-t,t)")
          && sourceYDUpdateScene.text.includes("this.sceneRotation=Yi(this.sceneRotation,n,5,e)"),
        rebuild:
          rebuildMain.includes("const sourceRound = (value: number, precision = 4)")
          && rebuildMain.includes("const sourceDamp = (current: number, target: number, factor: number, delta: number)")
          && rebuildMain.includes("const sourceClampRound = (value: number, min: number, max: number)")
          && rebuildMain.includes("if (snap) scroll.diff = sourceDamp(scroll.diff, 0, 5, delta);")
          && rebuildMain.includes("scroll.targetPlusDiff = scroll.target + scroll.diff;")
          && rebuildMain.includes("scroll.animated = sourceDamp(scroll.animated, scroll.targetPlusDiff, 5, delta);")
          && rebuildMain.includes("const rollTarget = sourceClampRound(scroll.velocity * -0.015, -4, 4);")
          && rebuildMain.includes("sceneRotation = sourceDamp(sceneRotation, rollTarget, 5, delta);")
          && !rebuildMain.includes("if (snap) scroll.diff = lerp(scroll.diff, 0, 5, delta);")
          && !rebuildMain.includes("scroll.animated = lerp(scroll.animated, targetPlusDiff, 5, delta);")
          && !rebuildMain.includes("sceneRotation = lerp(sceneRotation, rollTarget, 5, delta);"),
      },
      rafDeltaOwnership: {
        source:
          sourceYDClass?.text.includes("Bt.add(this.onRaf,this.id)") === true
          && sourceYDClass.text.includes("onRaf({time:e,delta:t,frame:n,fps:i})")
          && sourceYDClass.text.includes("this.scroll.diff=Yi(this.scroll.diff,0,5,t)")
          && sourceYDClass.text.includes("this.scroll.animated=Yi(this.scroll.animated,this.scroll.targetPlusDiff,5,t)")
          && sourceYDClass.text.includes("this.updateScene(t)"),
        rebuild:
          Boolean(rebuildHomeGalleryTick)
          && rebuildHomeGalleryTick.includes("const delta = (now - lastFrame) / 1000;")
          && rebuildHomeGalleryTick.includes("lastFrame = now;")
          && rebuildHomeGalleryTick.includes("deltaMode: \"source-yD-onRaf-uses-Bt-raw-delta-no-gallery-clamp\"")
          && rebuildHomeGalleryTick.includes("deltaClampApplied: false")
          && rebuildHomeGalleryTick.includes("lastDeltaFinite: Number.isFinite(delta)")
          && rebuildHomeGalleryTick.includes("if (snap) scroll.diff = sourceDamp(scroll.diff, 0, 5, delta);")
          && rebuildHomeGalleryTick.includes("scroll.animated = sourceDamp(scroll.animated, scroll.targetPlusDiff, 5, delta);")
          && rebuildHomeGalleryTick.includes("getWebgl()?.setGalleryProgress?.(scroll.progress, scroll.velocity, delta)")
          && !rebuildHomeGalleryTick.includes("Math.min(0.05")
          && !rebuildHomeGalleryTick.includes("Math.max(0.001"),
        probe:
          rebuildWebgl.includes("deltaMode: \"source-yD-onRaf-uses-Bt-raw-delta-no-gallery-clamp\"")
          && rebuildWebgl.includes("deltaClampApplied: false")
          && rebuildWebgl.includes("deltaFinite: Number.isFinite(this.galleryDynamicsDelta)")
          && rebuildOutputProbe.includes("homeGalleryRuntime: window.__rogierHomeGalleryRuntime || null")
          && rebuildOutputProbe.includes("homeGalleryRuntimeDeltaMode")
          && rebuildOutputProbe.includes("homeGalleryRuntimeLastDelta")
          && rebuildThumbProbe.includes("galleryDeltaMode"),
      },
      workStatePersistence: {
        source:
          sourceYDClass?.text.includes("Qe.workState&&(this.scroll=Qe.workState.scroll") === true
          && sourceYDClass.text.includes("destroy(){super.destroy(),Qe.workState={scroll:this.scroll,index:this.index,activeProject:this.activeProject,activeHook:this.activeHook,targetHook:this.targetHook,sceneRotation:this.sceneRotation}")
          && sourceYDClass.text.includes("this.scroll.targetPlusDiff=this.scroll.target+this.scroll.diff"),
        rebuild:
          rebuildMain.includes("targetPlusDiff?: number;")
          && rebuildMain.includes("Object.assign(scroll, restored.scroll);")
          && rebuildMain.includes("diff: scroll.diff,")
          && rebuildMain.includes("targetPlusDiff: scroll.targetPlusDiff,")
          && rebuildMain.includes("velocity: scroll.velocity,")
          && rebuildMain.includes("active: scroll.active,")
          && rebuildMain.includes("sceneRotation,"),
      },
      sourceOrder: {
        sceneWrapBeforeTransform:
          sourceYDUpdateScene.text.indexOf("J.workScene.sceneWrap.rotation.y=_a.degToRad(this.scroll.progress*360+180)")
          < sourceYDUpdateScene.text.indexOf("J.mainScene.renderManager.compositeMaterial.uniforms.uTransformX.value=this.scroll.progress*1"),
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
        sceneWrapBeforeTransform:
          rebuildSetGalleryProgress.indexOf("this.sceneWrap.rotation.y = targetRotation")
          < rebuildSetGalleryProgress.indexOf("this.preCompositeMaterial.uniforms.uTransformX.value = progress"),
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
        "ln.playWoosh()",
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
      activeProjectApplicationOrder: {
        source:
          orderedIncludes(sourceYDOnProjectActive.text, [
            "this.activeProject=e",
            "Se.setSpotLightIntensity(t.data.spotlight||J.workScene.maxSpotLightIntensity,1)",
            "Se.setRevealSpread(0)",
            "ln.playWoosh()",
            "J.workScene.blocks.forEach((a,c)=>{c!==n&&this.inAnimation.to",
            "this.inAnimation.to(J.workScene.blocks[n].instance.material.customUniforms.uReveal,{value:1,delay:.2,ease:\"power4.out\",duration:4},0)",
            "Se.setAmbientLight(r,i)",
            "Se.setMainColor(o)",
            "Se.setDarken(t.data.darkenOverview||.1)",
            "Se.setSaturation(t.data.saturation||1)",
            "Se.setContrast(t.data.contrast||1.15)",
            "Se.setThumbDarknessIntensity(t.data.thumbnail.darkness||0)",
            "Se.setThumbDarknessColor(t.data.thumbnail.darknessColor||\"#000000\")",
            "Se.setThumbSaturation(t.data.thumbnail.saturation||1)",
            "Se.setThumbMouseLightness(t.data.thumbnail.mouseLightness||1)",
            "Se.setBlocksColor(t.data.colors.blocks||\"#000000\")",
            "Se.setDirectionalLightIntensity(1.5)",
          ]),
        rebuildSetProject:
          Boolean(rebuildSetProject)
          && orderedIncludes(rebuildSetProject, [
            "this.prepareHomeLighting()",
            "this.applyActiveProjectSourceOrder(payload, active)",
            "this.setDirectionalLight2Intensity(1)",
          ]),
        rebuildHelper:
          Boolean(rebuildApplyActiveProjectSourceOrder)
          && orderedIncludes(rebuildApplyActiveProjectSourceOrder, [
            "this.activeSlug = payload.slug ?? this.activeSlug",
            "this.setSpotLightIntensity(sourceProjectSpotlightIntensity(payload.spotlight, this.maxSpotLightIntensity), 1)",
            "this.setRevealSpread(0)",
            "window.dispatchEvent(new CustomEvent(\"rd:woosh\"))",
            "this.setProjectBlockReveal(active)",
            "this.applyProjectLook(payload)",
            "this.setDirectionalLightIntensity(1.5)",
          ]),
        rebuildMainWooshOwnership:
          !rebuildMain.includes("window.dispatchEvent(new CustomEvent(\"rd:woosh\"))"),
        sourceWooshHowl:
          Boolean(sourceAudioWoosh)
          && sourceAudioWoosh.text.includes("this.woosh=new zi.Howl({src:[\"/audio/woosh.webm\",\"/audio/woosh.ogg\",\"/audio/woosh.mp3\"],volume:.25,rate:1.8})"),
        rebuildWooshHowl:
          rebuildAudio.includes("src: [\"/audio/woosh.webm\", \"/audio/woosh.ogg\", \"/audio/woosh.mp3\"]")
          && rebuildAudio.includes("volume: 0.25")
          && rebuildAudio.includes("rate: 1.8"),
        rebuildProjectLook:
          Boolean(rebuildApplyProjectLook)
          && orderedIncludes(rebuildApplyProjectLook, [
            "this.setAmbientLight(ambientColor, ambientIntensity)",
            "this.setMainColor(payload.color)",
            "this.setDarken(",
            "this.setSaturation(",
            "this.setContrast(",
            "this.setThumbDarknessIntensity(",
            "this.setThumbDarknessColor(",
            "this.setThumbSaturation(",
            "this.setThumbMouseLightness(",
            "this.setBlocksColor(",
          ]),
        rebuildEnterWorkGallery:
          Boolean(rebuildEnterWorkGallery)
          && orderedIncludes(rebuildEnterWorkGallery, [
            "this.setCameraControllerSettings({ x: 0, y: 0, z: 0 }, { x: 1, y: 0.5 }, 20)",
            "this.setMouseFactor(1, 3)",
            "const active = this.workItems.find((item) => item.slug === activeSlug) ?? this.workItems[0]",
            "this.workItems.forEach((item) =>",
            "this.applyActiveProjectSourceOrder(active.payload, active)",
            "this.setDirectionalLight2Intensity(1)",
          ])
          && !rebuildEnterWorkGallery.includes("this.setRevealSpread(0)"),
        rebuildProbeCoverage:
          rebuildWebgl.includes("SOURCE_ACTIVE_PROJECT_APPLICATION_ORDER_MODE = \"source-yD-onProjectActive-spotlight-reveal-woosh-uReveal-before-look-directional\"")
          && rebuildWebgl.includes("SOURCE_ACTIVE_PROJECT_WOOSH_MODE = \"source-yD-onProjectActive-ln-playWoosh-after-revealSpread-before-uReveal\"")
          && rebuildWebgl.includes("private sourceActiveProjectApplicationOrderProbe()")
          && rebuildWebgl.includes("wooshBeforeUReveal: true")
          && rebuildWebgl.includes("activeProjectApplicationOrder: this.sourceActiveProjectApplicationOrderProbe()")
          && rebuildOutputProbe.includes("sourceActiveProjectWooshMode")
          && rebuildOutputProbe.includes("activeProjectWooshMode")
          && rebuildOutputProbe.includes("sourceActiveProjectApplicationOrderMode")
          && rebuildOutputProbe.includes("activeProjectApplicationOrder")
          && rebuildThumbProbe.includes("sourceActiveProjectWooshMode")
          && rebuildThumbProbe.includes("activeProjectWooshMode")
          && rebuildThumbProbe.includes("sourceActiveProjectApplicationOrderMode")
          && rebuildThumbProbe.includes("activeProjectApplicationOrder"),
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
        rebuildChecks: checks(rebuildWebgl, [
          "SOURCE_HOME_SPOTLIGHT_INTENSITY = 220",
          "SOURCE_HOME_SPOTLIGHT_INTENSITY_MODE = \"source-SD-init-direct-spotLight-intensity-220-no-project-payload\"",
          "private maxSpotLightIntensity = SOURCE_HOME_SPOTLIGHT_INTENSITY",
          "private spotLight = new SpotLight(colorFrom(\"white\"), this.maxSpotLightIntensity)",
          "maxSpotLightIntensity: this.maxSpotLightIntensity",
          "homeEntryIntensityMode: SOURCE_HOME_SPOTLIGHT_INTENSITY_MODE",
          "homeEntryIntensityIgnoresPayload: true",
          "expectedHomeEntryIntensity: SOURCE_HOME_SPOTLIGHT_INTENSITY",
          "maxSpotLightIntensityMatchesSource: this.maxSpotLightIntensity === SOURCE_HOME_SPOTLIGHT_INTENSITY",
        ]),
        rebuildProbeChecks: checks(rebuildOutputProbe, [
          "sourceHomeSpotlightIntensityMode",
          "homeEntryIntensityMode",
          "homeEntryIntensityIgnoresPayload",
          "expectedHomeEntryIntensity",
          "maxSpotLightIntensity",
          "maxSpotLightIntensityMatchesSource",
        ]),
        excerpt: compact(sourceP1SetLights.text),
      },
      spotLightDefaultOwnership: {
        sourceQmConstructor: sourceSpotLightClass && {
          index: sourceSpotLightClass.index,
          checks: checks(sourceSpotLightClass.text, [
            "constructor(e,t,n=0,i=Math.PI/3,r=0,o=2)",
            "this.distance=n",
            "this.angle=i",
            "this.penumbra=r",
            "this.decay=o",
            "this.map=null",
            "this.shadow=new Iw",
          ]),
          excerpt: compact(sourceSpotLightClass.text),
        },
        sourceIwShadow: sourceSpotLightShadowClass && {
          index: sourceSpotLightShadowClass.index,
          checks: checks(sourceSpotLightShadowClass.text, [
            "super(new Wt(50,1,.5,500))",
            "this.isSpotLightShadow=!0",
            "this.focus=1",
            "const t=this.camera,n=br*2*e.angle*this.focus",
            "i=this.mapSize.width/this.mapSize.height",
            "r=e.distance||t.far",
          ]),
          excerpt: compact(sourceSpotLightShadowClass.text),
        },
        localThreeSpotLight: checks(threeSpotLight, [
          "constructor( color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2 )",
          "this.distance = distance",
          "this.decay = decay",
          "this.map = null",
          "this.shadow = new SpotLightShadow()",
        ]),
        localThreeSpotLightShadow: checks(threeSpotLightShadow, [
          "super( new PerspectiveCamera( 50, 1, 0.5, 500 ) )",
          "this.focus = 1",
          "const fov = MathUtils.RAD2DEG * 2 * light.angle * this.focus",
          "const aspect = this.mapSize.width / this.mapSize.height",
          "const far = light.distance || camera.far",
        ]),
        localThreeLightShadow: checks(threeLightShadow, [
          "this.mapSize = new Vector2( 512, 512 )",
          "this.bias = 0",
          "this.normalBias = 0",
          "this.radius = 1",
        ]),
        sourceP1KeepsDefaults: Boolean(sourceP1SetLights)
          && sourceP1SetLights.text.includes("this.spotLight=new Qm(16777215,this.maxSpotLightIntensity)")
          && sourceP1SetLights.text.includes("this.spotLight.angle=Math.PI/4")
          && sourceP1SetLights.text.includes("this.spotLight.penumbra=.95")
          && !sourceP1SetLights.text.includes("spotLight.distance")
          && !sourceP1SetLights.text.includes("spotLight.decay")
          && !sourceP1SetLights.text.includes("spotLight.shadow")
          && !sourceP1SetLights.text.includes("spotLight.castShadow"),
        rebuildProbeSurface: checks(rebuildWebgl, [
          "private sourceSpotLightDefaultsProbe()",
          "defaultMode: \"source-Qm-constructor-color-intensity-default-distance-decay-SpotLightShadow\"",
          "shadowDefaultMode: \"source-Iw-SpotLightShadow-default-focus1-camera-50-1-0_5-500-mapSize512\"",
          "shadowCameraFovMode: \"source-SpotLightShadow-updateMatrices-angle-focus-fov\"",
          "shadowCameraFarMode: \"source-SpotLightShadow-updateMatrices-distance-0-keeps-camera-far-500\"",
          "SOURCE_SPOTLIGHT_SHADOW_MAP_SIZE",
        ]),
        outputProbeChecks: checks(rebuildOutputProbe, [
          "light.defaultMode !== \"source-Qm-constructor-color-intensity-default-distance-decay-SpotLightShadow\"",
          "light.shadowDefaultMode !== \"source-Iw-SpotLightShadow-default-focus1-camera-50-1-0_5-500-mapSize512\"",
          "light.colorHex !== 0xffffff",
          "light.distance",
          "light.decay",
          "light.shadowCameraFovMode !== \"source-SpotLightShadow-updateMatrices-angle-focus-fov\"",
          "light.shadowCameraFarMode !== \"source-SpotLightShadow-updateMatrices-distance-0-keeps-camera-far-500\"",
        ]),
        thumbProbeChecks: checks(rebuildThumbProbe, [
          "function assertSourceSpotlightDefaults",
          "source-Qm-constructor-color-intensity-default-distance-decay-SpotLightShadow",
          "source-Iw-SpotLightShadow-default-focus1-camera-50-1-0_5-500-mapSize512",
          "assertSourceSpotlightDefaults(probe.spotlight, \"spotlight\", sourceShapeErrors)",
          "assertSourceSpotlightDefaults(projection.spotlight, \"projection\", sourceShapeErrors)",
        ]),
      },
      sdInitChecks: checks(sourceSDInitSpotlight.text, [
        "J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture",
        "J.workScene.spotLight.position.set(0,0,3.7)",
        "J.workScene.spotLight.target.position.set(0,0,-8)",
        "J.workScene.spotLight.intensity=220",
      ]),
      rebuildHomeEntryIntensityOwnership:
        Boolean(rebuildInitHomeSpotlight)
        && rebuildInitHomeSpotlight.includes("this.setSpotLightIntensity(this.maxSpotLightIntensity, 0)")
        && !rebuildInitHomeSpotlight.includes("payload.spotlight")
        && !rebuildInitHomeSpotlight.includes("sourceProjectSpotlightIntensity("),
      sourceActiveProjectSpotlightOwnership:
        sourceYDOnProjectActive?.text.includes("Se.setSpotLightIntensity(t.data.spotlight||J.workScene.maxSpotLightIntensity,1)"),
      rebuildActiveProjectSpotlightOwnership:
        Boolean(rebuildPrepareHomeLighting)
        && Boolean(rebuildApplyActiveProjectSourceOrder)
        && Boolean(rebuildEnterWorkGallery)
        && rebuildWebgl.includes("SOURCE_ACTIVE_PROJECT_SPOTLIGHT_INTENSITY_MODE = \"source-yD-onProjectActive-spotlight-payload-or-maxSpotLightIntensity\"")
        && rebuildWebgl.includes("function sourceProjectSpotlightIntensity(")
        && rebuildWebgl.includes("function sourceProjectSpotlightUsesPayload(")
        && rebuildPrepareHomeLighting.includes("this.initHomeSpotlight()")
        && !rebuildPrepareHomeLighting.includes("sourceProjectSpotlightIntensity(")
        && rebuildApplyActiveProjectSourceOrder.includes("this.setSpotLightIntensity(sourceProjectSpotlightIntensity(payload.spotlight, this.maxSpotLightIntensity), 1)")
        && rebuildApplyActiveProjectSourceOrder.includes("this.setDirectionalLightIntensity(1.5)")
        && rebuildEnterWorkGallery.includes("const active = this.workItems.find((item) => item.slug === activeSlug) ?? this.workItems[0]")
        && rebuildEnterWorkGallery.includes("this.applyActiveProjectSourceOrder(active.payload, active)")
        && !rebuildEnterWorkGallery.includes("this.setSpotLightIntensity(this.maxSpotLightIntensity, 1.6)")
        && rebuildWebgl.includes("activeProjectIntensityMode: SOURCE_ACTIVE_PROJECT_SPOTLIGHT_INTENSITY_MODE")
        && rebuildWebgl.includes("activeProjectFallbackMode: \"source-js-or-falsy-zero-empty-missing-to-maxSpotLightIntensity\"")
        && rebuildOutputProbe.includes("sourceActiveProjectSpotlightIntensityMode")
        && rebuildOutputProbe.includes("activeProjectIntensityMatchesExpected")
        && rebuildThumbProbe.includes("function assertActiveProjectSpotlight")
        && rebuildThumbProbe.includes("assertActiveProjectSpotlight(probe.spotlight, \"spotlight\", sourceShapeErrors)")
        && rebuildThumbProbe.includes("assertActiveProjectSpotlight(projection.spotlight, \"projection\", sourceShapeErrors)"),
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
      sourceMobileSpotlightParallaxBranch:
        sourceP1Update?.text.includes("Pe.w>=Le.BREAKPOINTS.MD?this.spotLight.position.y=this.camera.position.y*.175:this.spotLight.position.y=.3+this.camera.position.y*.175"),
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
      rebuildMobileSpotlightParallaxProbe:
        rebuildWebgl.includes("parallaxYOffsetMode: window.innerWidth >= BREAKPOINT_MD")
        && rebuildWebgl.includes("? \"source-p1-desktop-camera-y-parallax\"")
        && rebuildWebgl.includes(": \"source-p1-mobile-0_3-plus-camera-y-parallax\"")
        && rebuildThumbProbe.includes("const viewportName = process.env.VIEWPORT || \"desktop\"")
        && rebuildThumbProbe.includes("viewportName === \"mobile\"")
        && rebuildThumbProbe.includes("const expectedSpotlightParallaxYOffsetMode = viewport.width >= 800")
        && rebuildThumbProbe.includes("\"source-p1-mobile-0_3-plus-camera-y-parallax\"")
        && rebuildThumbProbe.includes("const expectedSpotlightMobileYOffset = viewport.width >= 800 ? 0 : 0.3")
        && rebuildThumbProbe.includes("const expectedTargetSize = Math.max(1, Math.round(viewport.height))"),
      rebuildMapProjectionGuards:
        rebuildWebgl.includes("this.thumbWrap.frustumCulled = false")
        && rebuildWebgl.includes("projectionPath: \"source-SpotLight.map-without-castShadow\"")
        && rebuildWebgl.includes("shadowPathMode: \"source-map-projection-not-shadow-cast\""),
      rebuildThumbProjectionSamplingProbe:
        rebuildWebgl.includes("const spotlightProjection = this.spotlightProjectionProbe();")
        && rebuildWebgl.includes("spotlightProjection,")
        && rebuildThumbProbe.includes("const projection = probe.spotlightProjection;")
        && rebuildThumbProbe.includes("sourceHomeSpotlightIntensityMode")
        && rebuildThumbProbe.includes("projection.spotlight?.homeEntryIntensityIgnoresPayload")
        && rebuildThumbProbe.includes("projection.projectionMatrixMode !== \"source-SD-SpotLight-map-through-three-shadow-matrix\"")
        && rebuildThumbProbe.includes("projection.sampleGridMode !== \"source-spotlight-map-3x3-active-bounds\"")
        && rebuildThumbProbe.includes("projection.inMapCoverage <= 0")
        && rebuildThumbProbe.includes("projection.mapLumaMean <= 0.01"),
    },
    p1EnvironmentHierarchy: sourceP1InitEnv && {
      index: sourceP1InitEnv.index,
      checks: checks(sourceP1InitEnv.text, [
        "this.blocksWrap=new rt,this.sceneWrap=new rt",
        "this.fog=new bu(\"grey\",0,100),this.scene.fog=this.fog",
        "this.backgroundColor=new ye(BA.BACKGROUND_COLOR).convertLinearToSRGB()",
        "this.scene.background=this.backgroundColor",
        "this.setAboutBlocks(),this.setFloatingBlocks(),this.sceneWrap.add(this.blocksWrap)",
        "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)",
        "this.env.position.y=-12.65",
        "this.env.rotation.y=-Xc(this.rotationAdjustment)",
        "this.sceneWrap.add(this.blocksWrap)",
        "this.sceneWrap.add(this.floor)",
        "this.sceneWrap.add(this.env)",
        "this.scene.add(this.sceneWrap)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private sceneWrap = new Object3D()",
        "private blocksWrap = new Object3D()",
        "private floorGroup = new Object3D()",
        "private environmentGroup = new Object3D()",
        "this.homeScene.fog = new Fog(SOURCE_WORK_FOG_COLOR, 0, 100)",
        "this.homeScene.background = sourceLinearToSrgbColor(SOURCE_WORK_BG, SOURCE_WORK_BG)",
        "mode: \"source-p1-scene-background-and-fog-owned-by-init\"",
        "backgroundMode: \"source-p1-BA-BACKGROUND_COLOR-linear-to-srgb\"",
        "fogMode: \"source-p1-fog-grey-0-100-scene-fog\"",
        "mode: \"source-p1-env-rotation-y-negative-rotationAdjustment-from-demorgen\"",
        "if (payload.slug === \"demorgen\")",
        "this.environmentGroup.rotation.y = -MathUtils.degToRad(rotationAdjustment)",
        "sourceChildOrderMode: \"source-p1-sceneWrap-blocksWrap-floor-env\"",
        "sourceChildOrder: this.sceneWrap.children.map",
        "sourceRootChildOrderMode: \"source-p1-scene-lights-about-floating-sceneWrap\"",
        "const sourceRootChildOrder = this.homeScene.children.map",
        "sourceRootChildOrderMatches: JSON.stringify(sourceRootChildOrder) === JSON.stringify(expectedRootChildOrder)",
        "rotationMatchesSource: Math.abs(this.environmentGroup.rotation.y - this.environmentRotationSource.expectedRotationY) < 1e-6",
        "mode: \"source-a1-i1-rt-object3d-floorPlane-reflector\"",
        "hierarchyMode: \"source-h1-rt-object3d-owns-transform\"",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "sceneRootChildOrderMode",
        "sceneRootChildOrder",
        "sceneRootChildOrderMatches",
        "sceneWrapChildOrderMode",
        "sceneWrapChildOrder",
        "rotationSource.mode",
        "rotationSourceTheta",
        "rotationMatchesSource",
        "groupRotationY",
        "sceneSurface.mode !== \"source-p1-scene-background-and-fog-owned-by-init\"",
        "sceneSurface.backgroundMode !== \"source-p1-BA-BACKGROUND_COLOR-linear-to-srgb\"",
        "sceneSurface.fogMode !== \"source-p1-fog-grey-0-100-scene-fog\"",
        "sceneSurface.floorMaterialFogBranch !== false",
        "sceneSurface.environmentMaterialFog !== false",
      ]),
      rootSceneDirectChildOrder: {
        source:
          orderedIncludes(sourceP1InitEnv.text, [
            "this.setAboutBlocks(),this.setFloatingBlocks(),this.sceneWrap.add(this.blocksWrap)",
            "this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1)",
            "this.sceneWrap.add(this.floor),this.sceneWrap.add(this.env),this.scene.add(this.sceneWrap)",
          ]),
        rebuild:
          orderedIncludes(rebuildWebgl, [
            "this.homeScene.add(this.directionalLight);",
            "this.createWorkScene();",
            "this.createAuxiliaryBlocks();",
            "this.sceneWrap.add(this.blocksWrap);",
            "this.sceneWrap.add(this.floorGroup);",
            "this.sceneWrap.add(this.environmentGroup);",
            "this.homeScene.add(this.sceneWrap);",
          ]),
        rejectsOldEarlySceneWrapAdd:
          !orderedIncludes(rebuildWebgl, [
            "this.homeScene.add(this.directionalLight);",
            "this.homeScene.add(this.sceneWrap);",
            "this.createAuxiliaryBlocks();",
          ]),
        rejectsOldEarlySceneWrapChildAttach:
          !orderedIncludes(rebuildWebgl, [
            "this.sceneWrap.add(this.blocksWrap);",
            "this.sceneWrap.add(this.floorGroup);",
            "this.sceneWrap.add(this.environmentGroup);",
            "this.createWorkScene();",
            "this.createAuxiliaryBlocks();",
          ]),
        runtimeProbe:
          rebuildWebgl.includes("sourceRootChildOrderMode: \"source-p1-scene-lights-about-floating-sceneWrap\"")
          && rebuildOutputProbe.includes("sceneRootChildOrderMatches"),
      },
      excerpt: compact(sourceP1InitEnv.text),
    },
    projectDataOrder: sourceProjectDataManager && {
      index: sourceProjectDataManager.index,
      checks: checks(sourceProjectDataManager.text, [
        "class is{static getProjects()",
        "xf.filter(e=>e.data.active!==!1).sort((e,t)=>Date.parse(t.data.date)-Date.parse(e.data.date))",
        "static getProjectById(e){return xf.find(t=>t.id===e)}",
        "static getNextProject(e){const t=this.getProjects()",
      ]),
      rebuildChecks: checks(rebuildSite, [
        "export const activeProjects = projects",
        ".filter((project) => project.data.active !== false)",
        ".sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date))",
        "const index = activeProjects.findIndex((item) => item.data.slug === project.data.slug)",
      ]),
      rebuildRuntimeChecks: checks(rebuildWebgl, [
        "const SOURCE_ACTIVE_PROJECT_ORDER = [",
        "\"hashgraph-vc\"",
        "\"thoughtlab\"",
        "sourceProjectOrder: {",
        "mode: \"source-is-getProjects-active-filter-date-desc\"",
        "expected: SOURCE_ACTIVE_PROJECT_ORDER",
        "actual: actualProjectOrder",
        "matchesSource: JSON.stringify(actualProjectOrder) === JSON.stringify(SOURCE_ACTIVE_PROJECT_ORDER)",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "projectOrder.mode !== \"source-is-getProjects-active-filter-date-desc\"",
        "projectOrderExpected",
        "projectOrderActual",
        "projectOrderMatchesSource",
      ]),
      rebuildThumbProbeChecks: checks(rebuildThumbProbe, [
        "projectOrder.mode !== \"source-is-getProjects-active-filter-date-desc\"",
        "projectOrderExpected",
        "projectOrderActual",
        "projectOrderMatchesSource",
      ]),
      excerpt: compact(sourceProjectDataManager.text),
    },
    p1CarouselDistribution: sourceP1SetBlocks && {
      index: sourceP1SetBlocks.index,
      checks: checks(sourceP1SetBlocks.text, [
        "setBlocks(){this.blocks=[]",
        "rotation:-this.theta*i",
        "this.radius=Math.round(e/2/Math.tan(Math.PI/t))",
        "this.lightRadius=this.radius-3.5",
        "n.instance.position.x=-Math.sin(this.theta*i*Math.PI/180)*this.radius",
        "n.instance.position.z=Math.cos(this.theta*i*Math.PI/180)*this.radius",
        "n.id===\"demorgen\"&&(this.rotationAdjustment=n.rotation)",
        "n.instance.lookAt(this.blocksWrap.position)",
        "this.sceneWrap.position.set(0,0,this.radius-.3)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "private count = 0",
        "private theta = 0",
        "private itemWidth = 6.5",
        "private lightRadius = 0",
        "this.count = cards.length",
        "this.theta = 360 / this.count",
        "this.itemWidth = 6.5",
        "this.radius = Math.round(this.itemWidth / 2 / Math.tan(Math.PI / this.count))",
        "this.lightRadius = this.radius - 3.5",
        "const sourceItemWidth = 6.5",
        "const sourceTheta = sourceCount > 0 ? 360 / sourceCount : 0",
        "const sourceRadius = sourceCount > 0 ? Math.round(sourceItemWidth / 2 / Math.tan(Math.PI / sourceCount)) : 0",
        "const sourceSceneWrapZ = sourceRadius - 0.3",
        "const sourceRotationAdjustment = demorgenIndex >= 0 ? -sourceTheta * demorgenIndex : 0",
        "group.position.x = -Math.sin(MathUtils.degToRad(this.theta * index)) * this.radius",
        "group.position.z = Math.cos(MathUtils.degToRad(this.theta * index)) * this.radius",
        "group.lookAt(0, 0, 0)",
        "this.sceneWrap.position.set(0, 0, this.radius - 0.3)",
        "sourceCarouselDistribution: {",
        "mode: \"source-p1-setBlocks-circular-radius-sceneWrap-z-demorgen-rotation-lightRadius\"",
        "actualItemWidth: this.itemWidth",
        "actualCount: this.count",
        "actualThetaDegrees: this.theta",
        "expectedLightRadius: sourceRadius - 3.5",
        "actualLightRadius: this.lightRadius",
        "lightRadiusMatchesSource: Math.abs(this.lightRadius - (sourceRadius - 3.5)) < 1e-6",
        "itemPositionsAllMatch: items.every((item) => item.sourcePositionMatches)",
        "itemLookAtAllMatch: items.every((item) => item.sourceLookAtBlocksWrapMatches)",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "sourceCarouselDistribution",
        "carouselMode",
        "carouselItemWidth",
        "carouselActualItemWidth",
        "carouselItemWidthMatchesSource",
        "carouselActualCount",
        "carouselCountMatchesSource",
        "carouselTheta",
        "carouselActualTheta",
        "carouselThetaMatchesSource",
        "carouselExpectedRadius",
        "carouselExpectedLightRadius",
        "carouselActualLightRadius",
        "carouselLightRadius",
        "carouselSceneWrapZ",
        "carouselDemorgenRotationAdjustment",
        "carouselItemPositions",
        "carouselItemLookAt",
      ]),
      excerpt: compact(sourceP1SetBlocks.text),
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
      qnConstants: sourceQnEnvironmentConstants && {
        index: sourceQnEnvironmentConstants.index,
        checks: checks(sourceQnEnvironmentConstants.text, [
          "Qn={ROUGHNESS_INTENSITY:.94",
          "ENVMAP_INTENSITY:1",
          "SHADER_1_ALPHA:.5",
          "SHADER_1_SPEED:.5",
          "SHADER_1_SCALE:5.5",
          "SHADER_2_ALPHA:0",
          "SHADER_2_SCALE:13",
          "SHADER_3_ALPHA:0",
          "SHADER_3_SPEED:0",
          "SHADER_3_SCALE:0",
          "SHADER_1_MIX_3:1.5",
        ]),
        usedByU1: checks(sourceU1.text, [
          "uShader1Speed:new I(Qn.SHADER_1_SPEED)",
          "uShader2Scale:new I(Qn.SHADER_2_SCALE)",
          "uShader1Mix3:new I(Qn.SHADER_1_MIX_3)",
        ]),
      },
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
        constructorTSkyNull: Boolean(rebuildEnvironmentMaterialFactory)
          && rebuildEnvironmentMaterialFactory.includes("tSky: { value: null as Texture | null }")
          && rebuildEnvironmentMaterialFactory.includes("sourceConstructorTSkyMode = \"source-u1-constructor-tSky-null\"")
          && rebuildEnvironmentMaterialFactory.includes("sourceConstructorTSkyWasNull = uniforms.tSky.value === null")
          && !rebuildEnvironmentMaterialFactory.includes("tSky: { value: this.environmentSkyTexture() }"),
        runtimeProbe: rebuildWebgl.includes("customUniformsMode: \"source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias\"")
          && rebuildWebgl.includes("hasMaterialUniformsAlias: \"uniforms\" in this.environmentMaterial")
          && rebuildWebgl.includes("tSkyConstructorMode: this.environmentMaterial.userData.sourceConstructorTSkyMode")
          && rebuildWebgl.includes("tSkyDelayedBindingMode: this.environmentMaterial.userData.sourceDelayedTSkyBindingMode"),
        updatePathsUseCustomUniforms: [
          "this.environmentMaterial.customUniforms.uDarkenColor.value",
          "this.environmentMaterial.customUniforms.uTime.value",
          "this.environmentMaterial.customUniforms.tSky.value",
        ].every((needle) => rebuildWebgl.includes(needle)),
        noRuntimeEnvironmentUniformAliasAccess: !rebuildWebgl.includes("this.environmentMaterial.uniforms."),
      },
      rebuildDitheringOwnership: {
        sourceU1SetsAfterSuper: sourceU1.text.includes("constructor(e){super(e),this.dithering=!0"),
        sourceH1ConstructorArgsExcludeDithering: Boolean(sourceH1)
          && sourceH1.text.includes("this.material=new u1({side:hn,envMapIntensity:Qn.ENVMAP_INTENSITY,fog:!1})")
          && !sourceH1.text.includes("dithering"),
        factorySetsAfterConstruction: Boolean(rebuildEnvironmentMaterialFactory)
          && rebuildEnvironmentMaterialFactory.includes("material.dithering = true;")
          && rebuildEnvironmentMaterialFactory.includes("sourceDitheringOwnership = \"source-u1-constructor-sets-dithering-after-super\""),
        factoryConstructorExcludesDithering: Boolean(rebuildEnvironmentMaterialFactory)
          && !rebuildEnvironmentMaterialFactory.includes("dithering: true"),
        runtimeProbe: rebuildWebgl.includes("ditheringOwnershipMode: this.environmentMaterial.sourceDitheringOwnership")
          && rebuildWebgl.includes("constructorParamsIncludesDithering")
          && rebuildOutputProbe.includes("materialDitheringOwnership")
          && rebuildOutputProbe.includes("constructorParamsDithering"),
      },
      rebuildQnConstantGuardrail: {
        namedConstants: checks(rebuildWebgl, [
          "const SOURCE_QN_ENVIRONMENT_SHADER_CONSTANTS = {",
          "uShader1Speed: 0.5",
          "uShader2Scale: 13",
          "uShader1Mix3: 1.5",
        ]),
        factoryUsesNamedConstants: Boolean(rebuildEnvironmentMaterialFactory)
          && [
            "SOURCE_QN_ENVIRONMENT_SHADER_CONSTANTS.uShader1Speed",
            "SOURCE_QN_ENVIRONMENT_SHADER_CONSTANTS.uShader2Scale",
            "SOURCE_QN_ENVIRONMENT_SHADER_CONSTANTS.uShader1Mix3",
          ].every((needle) => rebuildEnvironmentMaterialFactory.includes(needle)),
        runtimeProbe: rebuildWebgl.includes("sourceConstantsMode: \"source-u1-uses-Qn-not-BA-Z1\"")
          && rebuildWebgl.includes("constantsMatchSource: environmentShaderConstantsMatchSource")
          && rebuildOutputProbe.includes("expectedEnvironmentQnConstants")
          && rebuildOutputProbe.includes("shaderMix2Binding"),
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
        "private floorReflectionRenderTargetUniform = {",
        "value: this.floorReflectionBlurIterations > 0",
        "private floorGroup = new Object3D()",
        "private floorReflector = new Object3D()",
        "tReflect: this.floorReflectionRenderTargetUniform",
        "uMatrix: this.floorReflectionTextureMatrixUniform",
        "sourceFloorNormalObjectBindingMode = \"pending-source-Xt-floorNormal\"",
        "objectBindingMode: this.sourceFloorNormalObjectBindingMode",
        "uniformIsImmediateTexture: this.floorMaterial.uniforms.tNormalMap.value === this.sourceFloorNormalTexture",
        "loadedSameImmediateTexture: this.sourceTexturePreloadState.floorNormal",
        "groupType: this.floorGroup.type",
        "reflectionUniformOwnership: \"source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform\"",
        "private floorReflectionDrawState = {",
        "mode: \"source-a1-onBeforeRender-hide-component-group-render-full-scene-restore\"",
        "renderSceneMode: \"source-i1-update-renders-this.scene-with-a1-hidden\"",
        "this.floorReflectionDrawState.before = this.floorReflectionVisibilitySnapshot()",
        "this.floorReflectionDrawState.during = this.floorReflectionVisibilitySnapshot()",
        "this.floorReflectionDrawState.after = this.floorReflectionVisibilitySnapshot()",
        "floorReflectionDrawState: this.floorReflectionDrawStateProbe()",
      ]),
      rebuildOnBeforeRenderVisibilityOrder: orderedIncludes(rebuildWebgl, [
        "this.floorPlane.onBeforeRender = () => {",
        "this.floorReflectionDrawState.before = this.floorReflectionVisibilitySnapshot()",
        "this.floorGroup.visible = false",
        "this.floorReflectionDrawState.during = this.floorReflectionVisibilitySnapshot()",
        "this.renderFloorReflection()",
        "this.floorGroup.visible = true",
        "this.floorReflectionDrawState.after = this.floorReflectionVisibilitySnapshot()",
      ]),
      floorNormalImmediateBinding: orderedIncludes(rebuildWebgl, [
        "const floorNormalLoad = this.loadTextureImmediate(`/images/textures/floor-normal.${sourceExt}`, NoColorSpace)",
        "const floorNormalTexture = floorNormalLoad.texture",
        "floorNormalTexture.repeat.set(45, 45)",
        "this.sourceFloorNormalTexture = floorNormalTexture",
        "this.sourceFloorNormalObjectBindingMode = \"source-Xt-loadTexture-immediate-texture-object-bound-before-onload\"",
        "this.floorMaterial.uniforms.tNormalMap.value = floorNormalTexture",
        "this.floorMaterial.uniforms.uMapTransform.value = floorNormalTexture.matrix",
        "const floorNormal = floorNormalLoad.loaded.then((texture) =>",
        "this.sourceFloorNormalLoadedTexture = texture",
        "this.sourceTexturePreloadState.floorNormal = true",
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
      sourceUniformOrder: orderedIncludes(sourceO1FloorMaterial.text, [
        "tReflect:new I(null)",
        "uMapTransform:new I(new Ne)",
        "uMatrix:new I(new Ce)",
        "uColor:new I(e instanceof ye?e:new ye(e))",
        "uReflectivity:new I(r)",
        "uMirror:new I(o)",
        "uFloorMixStrength:new I(a)",
        "uNormalDistortionStrength:new I(2.5)",
        "tNormalMap:new I(n)",
        "uNormalScale:new I(i)",
      ]),
      rebuildUniformOrder: Boolean(rebuildCreateFloorMaterial) && orderedIncludes(rebuildCreateFloorMaterial, [
        "tReflect: this.floorReflectionRenderTargetUniform",
        "uMapTransform: { value: new Matrix3().identity() }",
        "uMatrix: this.floorReflectionTextureMatrixUniform",
        "uColor: { value: colorFrom(\"#4a4a4a\") }",
        "uReflectivity: { value: 0.97 }",
        "uMirror: { value: 1 }",
        "uFloorMixStrength: { value: 15 }",
        "uNormalDistortionStrength: { value: 2.5 }",
        "tNormalMap: { value: this.placeholder }",
        "uNormalScale: { value: new Vector2(1, 1) }",
      ]),
      rebuildProbeOrder: rebuildWebgl.includes("const SOURCE_O1_FLOOR_UNIFORM_KEYS = [")
        && rebuildWebgl.includes("sourceUniformKeys: [...SOURCE_O1_FLOOR_UNIFORM_KEYS]")
        && rebuildWebgl.includes("matchesSourceOrder: SOURCE_O1_FLOOR_UNIFORM_KEYS.length === Object.keys(this.floorMaterial.uniforms).length"),
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
        "this.normal=new L",
        "this.normal.set(0,0,1)",
        "this.normal.applyMatrix4(this.rotationMatrix)",
        "this.screenTriangle=n1()",
        "this.screen=new at(this.screenTriangle,this.blurMaterial)",
        "this.screen.frustumCulled=!1",
        "this.screenTriangle.dispose()",
        "this.renderTarget=new Dn(e,t,{depthBuffer:!1})",
        "this.renderTarget.depthBuffer=!0",
        "this.renderTargetRead=this.renderTarget.clone()",
        "this.renderTargetWrite=this.renderTarget.clone()",
        "this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1)",
        "this.textureMatrix.multiply(this.virtualCamera.projectionMatrix)",
        "this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse)",
        "this.textureMatrix.multiply(this.matrixWorld)",
        "this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal,this.reflectorWorldPosition)",
        "this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse)",
        "this.clipPlane.set(this.reflectorPlane.normal.x,this.reflectorPlane.normal.y,this.reflectorPlane.normal.z,this.reflectorPlane.constant)",
        "this.clipPlane.multiplyScalar(2/this.clipPlane.dot(this.q))",
        "i.elements[2]=this.clipPlane.x",
        "i.elements[6]=this.clipPlane.y",
        "i.elements[10]=this.clipPlane.z+1-this.clipBias",
        "i.elements[14]=this.clipPlane.w",
        "const r=e.getRenderTarget(),o=e.xr.enabled,a=e.shadowMap.autoUpdate",
        "e.xr.enabled=!1,e.shadowMap.autoUpdate=!1",
        "e.state.buffers.depth.setMask(!0)",
        "e.autoClear===!1&&e.clear()",
        "e.xr.enabled=o,e.shadowMap.autoUpdate=a,e.setRenderTarget(r)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "new WebGLRenderTarget(SOURCE_I1_REFLECTION_WIDTH, SOURCE_I1_REFLECTION_HEIGHT, { depthBuffer: false })",
        "private floorReflectionReadTarget = this.floorReflectionTarget.clone()",
        "private floorReflectionWriteTarget = this.floorReflectionTarget.clone()",
        "private floorReflector = new Object3D()",
        "private floorReflectorNormal = new Vector3()",
        "private readonly floorReflectorNormalConstructorWasZero = this.floorReflectorNormal.equals(new Vector3())",
        "this.floorReflectorNormal.set(0, 0, 1)",
        "private floorReflectionScreenTriangle = makeSourceScreenTriangleGeometry()",
        "this.floorReflectionScreen = new Mesh(this.floorReflectionScreenTriangle, this.floorReflectionBlurMaterial)",
        "this.floorReflectionScreen.frustumCulled = false",
        "this.floorReflectionScreenTriangle.dispose()",
        "this.renderer.setRenderTarget(this.floorReflectionWriteTarget)",
        "const swap = this.floorReflectionReadTarget",
        "this.floorReflectionReadTarget = this.floorReflectionWriteTarget",
        "this.floorReflectionWriteTarget = swap",
        "this.updateFloorReflectionRenderTargetUniform(this.floorReflectionReadTarget.texture)",
        "screenTriangleMode: \"source-i1-screenTriangle-n1-geometry-owned-by-reflector\"",
        "screenDisposeMode: \"source-i1-destroy-disposes-screenTriangle\"",
        "blurSwapOwnershipMode: \"source-i1-direct-renderTargetRead-renderTargetWrite-field-swap-inside-loop\"",
        "reflectorNormalConstructorMode: \"source-i1-normal-new-Vector3-zero-runtime-update-sets-0-0-1\"",
        "reflectorNormalRuntimeMode: \"source-i1-update-normal-set-0-0-1-then-apply-reflector-rotation\"",
        "reflectorType: this.floorReflector.type",
        "this.floorReflectionTarget.depthBuffer = true",
        "readConstructionMode: \"source-i1-renderTargetRead-renderTarget-clone\"",
        "writeConstructionMode: \"source-i1-renderTargetWrite-renderTarget-clone\"",
        "private floorReflectionRendererState = {",
        "mode: \"source-i1-save-renderer-state-disable-xr-shadow-restore-target\"",
        "rawPassMode: \"source-i1-set-raw-target-depth-mask-conditional-clear-render-scene\"",
        "restoreMode: \"source-i1-restore-xr-shadow-and-previous-render-target\"",
        "private floorReflectionCameraState = {",
        "mode: \"source-i1-camera-textureMatrix-clipPlane-update-order\"",
        "cameraOrderMode: \"source-i1-lookAt-target-far-updateMatrixWorld-copy-projection\"",
        "textureMatrixOrderMode: \"source-i1-bias-multiply-projection-cameraInverse-reflectorMatrixWorld\"",
        "clipPlaneOrderMode: \"source-i1-plane-normal-worldPosition-cameraInverse-oblique-row-write\"",
        "this.resetFloorReflectionCameraState();",
        "this.markFloorReflectionCameraStep(\"lookAtTarget\");",
        "this.markFloorReflectionCameraStep(\"farCopy\");",
        "this.markFloorReflectionCameraStep(\"updateMatrixWorld\");",
        "this.markFloorReflectionCameraStep(\"projectionCopy\");",
        "this.markFloorReflectionCameraStep(\"textureMatrixBias\");",
        "this.markFloorReflectionCameraStep(\"textureMatrixProjection\");",
        "this.markFloorReflectionCameraStep(\"textureMatrixCameraInverse\");",
        "this.markFloorReflectionCameraStep(\"textureMatrixReflectorMatrixWorld\");",
        "this.markFloorReflectionCameraStep(\"reflectorPlaneFromNormalAndWorldPosition\");",
        "this.markFloorReflectionCameraStep(\"clipPlaneAppliedToCameraInverse\");",
        "this.markFloorReflectionCameraStep(\"clipPlaneVectorSet\");",
        "this.markFloorReflectionCameraStep(\"clipPlaneScaledByQ\");",
        "this.markFloorReflectionCameraStep(\"projectionRowWrite\");",
        "this.floorReflectionRendererState.previous = this.floorReflectionRendererSnapshot(previousTarget)",
        "this.floorReflectionRendererState.duringRaw = this.floorReflectionRendererSnapshot()",
        "this.floorReflectionRendererState.duringBlur = this.floorReflectionRendererSnapshot()",
        "this.floorReflectionRendererState.restored = this.floorReflectionRendererSnapshot()",
        "floorReflectionRendererState: this.floorReflectionRendererStateProbe()",
        "floorReflectionCameraState: this.floorReflectionCameraStateProbe()",
      ]),
      rebuildNoPresetNormal: !rebuildWebgl.includes("private floorReflectorNormal = new Vector3(0, 1, 0)"),
      sourceRendererStateOrder: orderedIncludes(sourceI1.text, [
        "const r=e.getRenderTarget(),o=e.xr.enabled,a=e.shadowMap.autoUpdate",
        "e.xr.enabled=!1,e.shadowMap.autoUpdate=!1",
        "e.setRenderTarget(this.renderTarget)",
        "e.state.buffers.depth.setMask(!0)",
        "e.autoClear===!1&&e.clear()",
        "e.render(t,this.virtualCamera)",
        "e.setRenderTarget(this.renderTargetWrite)",
        "e.xr.enabled=o,e.shadowMap.autoUpdate=a,e.setRenderTarget(r)",
      ]),
      sourceCameraTextureClipOrder: orderedIncludes(sourceI1.text, [
        "this.virtualCamera.lookAt(this.target)",
        "this.virtualCamera.far=n.far",
        "this.virtualCamera.updateMatrixWorld()",
        "this.virtualCamera.projectionMatrix.copy(n.projectionMatrix)",
        "this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1)",
        "this.textureMatrix.multiply(this.virtualCamera.projectionMatrix)",
        "this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse)",
        "this.textureMatrix.multiply(this.matrixWorld)",
        "this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal,this.reflectorWorldPosition)",
        "this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse)",
        "this.clipPlane.set(this.reflectorPlane.normal.x,this.reflectorPlane.normal.y,this.reflectorPlane.normal.z,this.reflectorPlane.constant)",
        "this.clipPlane.multiplyScalar(2/this.clipPlane.dot(this.q))",
        "i.elements[2]=this.clipPlane.x",
        "i.elements[6]=this.clipPlane.y",
        "i.elements[10]=this.clipPlane.z+1-this.clipBias",
        "i.elements[14]=this.clipPlane.w",
      ]),
      rebuildRendererStateOrder: orderedIncludes(rebuildRenderFloorReflection ?? "", [
        "const previousTarget = this.renderer.getRenderTarget();",
        "const previousXrEnabled = this.renderer.xr.enabled;",
        "const previousShadowAutoUpdate = this.renderer.shadowMap.autoUpdate;",
        "this.floorReflectionRendererState.previous = this.floorReflectionRendererSnapshot(previousTarget);",
        "this.renderer.xr.enabled = false;",
        "this.renderer.shadowMap.autoUpdate = false;",
        "this.renderer.setRenderTarget(this.floorReflectionTarget);",
        "this.renderer.state.buffers.depth.setMask(true);",
        "this.floorReflectionRendererState.duringRaw = this.floorReflectionRendererSnapshot();",
        "if (!this.renderer.autoClear) {",
        "this.renderer.clear();",
        "this.renderer.render(this.homeScene, this.floorReflectionCamera);",
        "this.renderer.setRenderTarget(this.floorReflectionWriteTarget);",
        "this.floorReflectionRendererState.duringBlur = this.floorReflectionRendererSnapshot();",
        "this.renderer.xr.enabled = previousXrEnabled;",
        "this.renderer.shadowMap.autoUpdate = previousShadowAutoUpdate;",
        "this.renderer.setRenderTarget(previousTarget);",
        "this.floorReflectionRendererState.restored = this.floorReflectionRendererSnapshot();",
      ]),
      rebuildCameraTextureClipOrder: orderedIncludes(rebuildRenderFloorReflection ?? "", [
        "this.floorReflectionCamera.lookAt(this.floorReflectionTargetPosition);",
        "this.markFloorReflectionCameraStep(\"lookAtTarget\");",
        "this.floorReflectionCamera.far = this.homeCamera.far;",
        "this.markFloorReflectionCameraStep(\"farCopy\");",
        "this.floorReflectionCamera.updateMatrixWorld();",
        "this.markFloorReflectionCameraStep(\"updateMatrixWorld\");",
        "this.floorReflectionCamera.projectionMatrix.copy(this.homeCamera.projectionMatrix);",
        "this.markFloorReflectionCameraStep(\"projectionCopy\");",
        "this.floorReflectionMatrix.set(",
        "this.markFloorReflectionCameraStep(\"textureMatrixBias\");",
        "this.floorReflectionMatrix.multiply(this.floorReflectionCamera.projectionMatrix);",
        "this.markFloorReflectionCameraStep(\"textureMatrixProjection\");",
        "this.floorReflectionMatrix.multiply(this.floorReflectionCamera.matrixWorldInverse);",
        "this.markFloorReflectionCameraStep(\"textureMatrixCameraInverse\");",
        "this.floorReflectionMatrix.multiply(this.floorReflector.matrixWorld);",
        "this.markFloorReflectionCameraStep(\"textureMatrixReflectorMatrixWorld\");",
        "this.floorReflectorPlane.setFromNormalAndCoplanarPoint(this.floorReflectorNormal, this.floorReflectorWorldPosition);",
        "this.markFloorReflectionCameraStep(\"reflectorPlaneFromNormalAndWorldPosition\");",
        "this.floorReflectorPlane.applyMatrix4(this.floorReflectionCamera.matrixWorldInverse);",
        "this.markFloorReflectionCameraStep(\"clipPlaneAppliedToCameraInverse\");",
        "this.floorReflectionClipPlane.set(",
        "this.markFloorReflectionCameraStep(\"clipPlaneVectorSet\");",
        "this.floorReflectionClipPlane.multiplyScalar(2 / this.floorReflectionClipPlane.dot(this.floorReflectionQ));",
        "this.markFloorReflectionCameraStep(\"clipPlaneScaledByQ\");",
        "projectionElements[2] = this.floorReflectionClipPlane.x;",
        "projectionElements[6] = this.floorReflectionClipPlane.y;",
        "projectionElements[10] = this.floorReflectionClipPlane.z + 1 - this.floorReflectionClipBias;",
        "projectionElements[14] = this.floorReflectionClipPlane.w;",
        "this.markFloorReflectionCameraStep(\"projectionRowWrite\");",
      ]),
      rebuildDirectFieldSwapNoLocalAlias:
        rebuildRenderFloorReflection?.includes("this.floorReflectionReadTarget = this.floorReflectionWriteTarget") === true
        && rebuildRenderFloorReflection?.includes("this.floorReflectionWriteTarget = swap") === true
        && !rebuildRenderFloorReflection?.includes("let readTarget = this.floorReflectionReadTarget")
        && !rebuildRenderFloorReflection?.includes("this.floorReflectionReadTarget = readTarget"),
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
      updateOrder: orderedIncludes(sourceIuUpdate.text, [
        "update(e,t,n,i){this.renderManager.update(e,t,n,i),",
        "this.cameraController&&this.cameraController.update(e,t,n,i);",
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
      sideRevealOwnership: {
        sourceUsesCs:
          sourceP1Update.text.includes("o.instance.material.customUniforms.uRevealSides.value=Cs(Math.abs(a.x),0,5,1,0,!0)")
          && sourceP1Update.text.includes("o.instance.material.customUniforms.uRevealSpreadSides.value=Cs(Math.abs(a.x),2,6,1,0,!0)"),
        sourceCsRoundsWithFn4:
          bundle.includes("function Cs(s,e,t,n,i,r){const o=(s-e)*(i-n)/(t-e)+n;if(r!==null&&r){const a=n>i?n:i,c=n>i?i:n;return bo(o,c,a)}return Fn(o)}")
          && bundle.includes("function bo(s,e,t){return Fn(Math.min(Math.max(e,s),t))}")
          && bundle.includes("function Fn(s,e=4){const t=Math.pow(10,e);return Math.round(s*t)/t}"),
        rebuildUsesSourceRoundHelper:
          rebuildWebgl.includes("function sourceMapClampRound(value: number, inMin: number, inMax: number, outMin: number, outMax: number)")
          && rebuildWebgl.includes("return sourceClampRound(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax));"),
        rebuildRuntimeUsesCsEquivalent:
          rebuildWebgl.includes("const sideReveal = sourceMapClampRound(Math.abs(world.x), 0, 5, 1, 0);")
          && rebuildWebgl.includes("const sideSpreadReveal = sourceMapClampRound(Math.abs(world.x), 2, 6, 1, 0);")
          && !rebuildWebgl.includes("const sideReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 0, 5, 0, 1), 0, 1);")
          && !rebuildWebgl.includes("const sideSpreadReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 2, 6, 0, 1), 0, 1);"),
        rebuildProbeExposesExactValues:
          rebuildWebgl.includes("revealSidesMode: \"source-Cs-abs-world-x-0-5-1-0-clamped-Fn4\"")
          && rebuildWebgl.includes("expectedRevealSides")
          && rebuildWebgl.includes("revealSidesMatchesSource")
          && rebuildWebgl.includes("revealSpreadSidesMode: \"source-Cs-abs-world-x-2-6-1-0-clamped-Fn4\"")
          && rebuildWebgl.includes("expectedRevealSpreadSides")
          && rebuildWebgl.includes("revealSpreadSidesMatchesSource"),
        outputProbeRecomputesCsEquivalent:
          rebuildOutputProbe.includes("function sourceMapClampRound(value, inMin, inMax, outMin, outMax)")
          && rebuildOutputProbe.includes("const expectedRevealSides = sourceMapClampRound(Math.abs(worldX), 0, 5, 1, 0);")
          && rebuildOutputProbe.includes("const expectedRevealSpreadSides = sourceMapClampRound(Math.abs(worldX), 2, 6, 1, 0);")
          && rebuildOutputProbe.includes("item.revealSidesMatchesSource !== true")
          && rebuildOutputProbe.includes("item.revealSpreadSidesMatchesSource !== true"),
      },
      updateOrder: orderedIncludes(sourceP1Update.text, [
        "update(e,t,n,i){super.update(e,t,n,i),",
        "this.spotLight&&this.spotLightParallax",
        "o.instance.update(e,t,n,Math.min(Pe.dpr,1.5))",
        "this.aboutBlocks.visible&&",
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
        sourceE1ConstructorOrder:
          orderedIncludes(sourceThumbE1.text, [
            "this.material=new M1",
            "this.setImage(e)",
            "this.mesh=new at(this.geometry,this.material)",
            "this.mesh.scale.set(2,2,2)",
          ]),
        rebuildE1ConstructorOrder:
          Boolean(rebuildCreateThumbPlane)
          && orderedIncludes(rebuildCreateThumbPlane, [
            "material.userData.sourceE1ConstructorOrder = \"source-E1-material-setImage-before-mesh-construction\"",
            "let mesh: Mesh<PlaneGeometry, RawShaderMaterial> | null = null",
            "this.setSourceThumbImage(id, material, () => mesh);",
            "mesh = new Mesh(new PlaneGeometry(1, 1), material)",
            "mesh.userData.sourceE1ConstructorOrder = material.userData.sourceE1ConstructorOrder",
            "mesh.scale.set(2, 2, 2)",
          ])
          && rebuildWebgl.includes("constructorOrder: item.thumb.userData.sourceE1ConstructorOrder")
          && rebuildWebgl.includes("constructorOrder: first.userData.sourceE1ConstructorOrder")
          && rebuildThumbProbe.includes("thumb.constructorOrder !== \"source-E1-material-setImage-before-mesh-construction\"")
          && rebuildThumbProbe.includes("material.constructorOrder !== \"source-E1-material-setImage-before-mesh-construction\""),
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
          && rebuildWebgl.includes("private setSourceThumbImage(")
          && rebuildWebgl.includes("material: RawShaderMaterial")
          && rebuildWebgl.includes("getMesh: () => Mesh<PlaneGeometry, RawShaderMaterial> | null")
          && rebuildWebgl.includes("void this.sourceThumbsReady.then(async () =>")
          && rebuildWebgl.includes("const projectThumb = this.getSourceProjectThumbById(id)")
          && rebuildWebgl.includes("const mesh = getMesh()")
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
      rebuildChecks: checks(rebuildWebgl, [
        "private thumbRenderSettings = { renderToScreen: false };",
        "mode: \"source-x1-initSettings-renderToScreen-false\"",
        "actual: { renderToScreen: this.thumbRenderSettings.renderToScreen }",
        "matchesSource: this.thumbRenderSettings.renderToScreen === false",
      ]),
      rebuildRenderBranch:
        Boolean(rebuildRenderThumbTargets)
        && rebuildRenderThumbTargets.includes("if (this.thumbRenderSettings.renderToScreen)")
        && rebuildRenderThumbTargets.includes("this.renderer.setRenderTarget(this.thumbCompositeTarget)")
        && rebuildRenderThumbTargets.includes("this.renderer.setRenderTarget(null)"),
      sourceLoTransferOrder:
        Boolean(sourceLo)
        && orderedIncludes(sourceLo.text, [
          "o.setRenderTarget(c),o.render(a,r)",
          "this.compositeMaterial.uniforms.tScene.value=c.texture",
          "this.screen.material=this.compositeMaterial",
          "o.setRenderTarget(u),o.render(this.screen,this.screenCamera),o.setRenderTarget(null)",
        ]),
      rebuildTransferOrderProbe:
        Boolean(rebuildRenderThumbTargets)
        && rebuildRenderThumbTargets.includes("mark(\"setRenderTarget(renderTargetA)\")")
        && rebuildRenderThumbTargets.includes("mark(\"render(scene,camera)\")")
        && rebuildRenderThumbTargets.includes("mark(\"bindCompositeTScene(renderTargetA.texture)\")")
        && rebuildRenderThumbTargets.includes("mark(\"assignScreenCompositeMaterial\")")
        && rebuildRenderThumbTargets.includes("mark(\"setRenderTarget(renderTargetComposite)\")")
        && rebuildRenderThumbTargets.includes("mark(\"render(screen,screenCamera)\")")
        && rebuildRenderThumbTargets.includes("mark(\"setRenderTarget(null)\")")
        && rebuildRenderThumbTargets.includes("stepsMatchExpected: JSON.stringify(steps) === JSON.stringify(SOURCE_THUMB_TRANSFER_STEPS)")
        && rebuildWebgl.includes("thumbRenderTransfer: this.thumbRenderTransferState")
        && rebuildWebgl.includes("spotlightMapReceivesCompositeTexture: this.spotLight.map === this.thumbCompositeTarget.texture"),
      rebuildProbeChecks: checks(rebuildThumbProbe, [
        "thumbRenderManagerSettings.mode !== \"source-x1-initSettings-renderToScreen-false\"",
        "thumbRenderManagerSettings.matchesSource !== true",
        "const expectedThumbTransferSteps = [",
        "thumbTransferMode",
        "thumbTransferSteps",
        "thumbTransferTScene",
        "thumbTransferSpotlightMap",
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
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_THUMB_BACKGROUND = \"#222222\"",
        "this.thumbScene.background = sourceLinearToSrgbColor(SOURCE_THUMB_BACKGROUND)",
        "private thumbCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)",
        "mode: \"source-T1-background-camera-x1-renderToScreen-settings\"",
        "backgroundMode: \"source-T1-222222-linear-to-srgb\"",
        "cameraMode: \"source-T1-orthographic-minus1-plus1-near0-far1\"",
      ]),
      rebuildProbeChecks: checks(rebuildThumbProbe, [
        "thumbSceneSurface.mode !== \"source-T1-background-camera-x1-renderToScreen-settings\"",
        "thumbSceneSurface.backgroundMode !== \"source-T1-222222-linear-to-srgb\"",
        "thumbSceneSurface.backgroundMatchesSource !== true",
        "thumbSceneSurface.cameraMode !== \"source-T1-orthographic-minus1-plus1-near0-far1\"",
        "thumbSceneSurface.cameraMatchesSource !== true",
      ]),
      excerpt: compact(sourceThumbT1.text),
    },
    skyV1: sourceSkyV1 && {
      index: sourceSkyV1.index,
      checks: checks(sourceSkyV1.text, [
        "class V1 extends Uu",
        "this.backgroundColor=new ye(\"#666666\").convertLinearToSRGB()",
        "this.scene.background=this.backgroundColor",
        "Le.LOW_RES&&(this.ticking=!0)",
        "this.renderManager.resize(t*.75,t*.75,1)",
        "Le.LOW_RES&&(await fn(100),this.ticking=!1)",
        "update(e,t,n,i){this.ticking&&(super.update(Le.LOW_RES?0:e,t,n,i)",
        "this.renderManager.compositeMaterial.uniforms.uTime.value=Le.LOW_RES?0:e",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_SKY_BACKGROUND = \"#666666\"",
        "this.skyScene.background = sourceLinearToSrgbColor(SOURCE_SKY_BACKGROUND, SOURCE_SKY_BACKGROUND)",
        "backgroundMatchesSource: this.skyScene.background instanceof Color",
        "private skyTicking = true",
        "private skyLowResStopTimers: ReturnType<typeof window.setTimeout>[] = []",
        "this.markSourceSkyResizeTicking()",
        "if (sourceLowRes() && !this.skyTicking)",
        "skyUpdateMode: \"source-V1-ticking-gated-low-res-resize-starts-then-100ms-stops\"",
        "lowResRenderMode: sourceLowRes()",
        "uTimeUpdateOrder: \"source-V1-super-update-before-z1-uTime-write\"",
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
    mgRoundedBox: sourceMG && {
      index: sourceMG.index,
      checks: checks(sourceMG.text, [
        "class mg extends Vt",
        "this.type=\"RoundedBoxGeometry\"",
        "r=isNaN(r)?1:Math.max(1,Math.floor(r))",
        "i=isNaN(i)?.15:i",
        "i=Math.min(i,Math.min(e,Math.min(t,Math.min(n)))/2)",
        "this.parameters={width:e,height:t,depth:n,radius:i,radiusSegments:r}",
        "var u=r+1,d=u*r+1<<3",
        "E(),C(),w(),y(),U(),b()",
        "f.setXY(z,.5,.5)",
        "this.setIndex(new It(new Uint16Array(_),1))",
        "this.setAttribute(\"position\",l),this.setAttribute(\"normal\",h),this.setAttribute(\"uv\",f)",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "function sourceRoundedBoxGeometry(",
        "function sourceRoundedBoxVertexCount(radiusSegments: number)",
        "function sourceRoundedBoxIndexCount(radiusSegments: number)",
        "geometry.type = \"RoundedBoxGeometry\"",
        "sourceRoundedBoxGeometry(GRID_CUBE_SIZE, GRID_CUBE_SIZE, GRID_CUBE_SIZE, 0.05)",
        "geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1))",
        "uvValues.push(0.5, 0.5)",
        "sourceOrder: \"source-mg-E-C-w-y-U-b-index-order\"",
        "activeGeometry: activeWorkItem ? sourceRoundedBoxGeometryProbe(activeWorkItem.mesh.geometry) : null",
        "aboutGeometry: this.aboutBlocks ? sourceRoundedBoxGeometryProbe(this.aboutBlocks.mesh.geometry) : null",
        "mode: \"source-ZA-box-geometry-not-mg\"",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "assertSourceMgGeometry(\"active\", workSettings.activeGeometry)",
        "assertSourceMgGeometry(\"about\", workSettings.aboutGeometry)",
        "geometry?.positionCount !== 24",
        "geometry?.indexCount !== 132",
        "geometry?.uvAllCenter !== true",
        "parameters.radiusSegments !== 1",
        "floatingGeometry.mode !== \"source-ZA-box-geometry-not-mg\"",
        "floatingGeometry.type !== \"BoxGeometry\"",
      ]),
      noExamplesRoundedBox:
        !rebuildWebgl.includes("three/examples/jsm/geometries/RoundedBoxGeometry")
        && !rebuildWebgl.includes("new RoundedBoxGeometry"),
      excerpt: compact(sourceMG.text),
    },
    GA: sourceGA && {
      index: sourceGA.index,
      checks: checks(sourceGA.text, [
        "class GA extends rt",
        "this.settings={xNum:35,yNum:23,zNum:Le.LOW_RES?4:7,size:1.25,spacing:.1,scale:.09}",
        "this.geometry=new mg(e,e,e,.05)",
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
        "mesh.scale.set(raySize.x, raySize.y, MOUSE_RAY_SCALE);",
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
        "sourceRayPlaneScale: [sourceRayPlaneSize.x, sourceRayPlaneSize.y, MOUSE_RAY_SCALE]",
        "&& Math.abs(active.rayPlane.scale.z - MOUSE_RAY_SCALE) < 1e-6",
        "targetSizingMode: \"source-GA-mouseSim-onResize-plane-scale-no-clamp\"",
        "targetSizingMode: \"source-GA-mouseSim-onResize-plane-scale-no-pre-rounding-no-clamp\"",
        "sourceRoundedBoxGeometry(GRID_CUBE_SIZE, GRID_CUBE_SIZE, GRID_CUBE_SIZE, 0.05)",
      ]),
      localMouseSimResizeOwnership: {
        source:
          sourceGA.text.includes("resize(e,t,n){this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)}")
          && !sourceGA.text.includes("Math.max(1,this.plane.scale.x)")
          && !sourceGA.text.includes("Math.round(this.plane.scale.x)"),
        rebuild:
          rebuildWebgl.includes("const planeWidth = item.mousePlane.scale.x;")
          && rebuildWebgl.includes("const planeHeight = item.mousePlane.scale.y;")
          && rebuildWebgl.includes("targetSizingMode: \"source-GA-mouseSim-onResize-plane-scale-no-clamp\"")
          && rebuildWebgl.includes("targetSizingMode: \"source-GA-mouseSim-onResize-plane-scale-no-pre-rounding-no-clamp\"")
          && !rebuildWebgl.includes("Math.max(1, item.mousePlane.scale.x)")
          && !rebuildWebgl.includes("Math.max(1, item.mousePlane.scale.y)")
          && !rebuildWebgl.includes("Math.round(item.mousePlane.scale.x)")
          && !rebuildWebgl.includes("Math.round(item.mousePlane.scale.y)"),
      },
      uCoordsOwnership: {
        sourceWorkAndAboutRuntimeWrite:
          sourceVA?.text.includes("this.customUniforms.uCoords.value.set(Pe.w*i,Pe.h*i)") === true
          && sourceXA?.text.includes("this.customUniforms.uCoords.value.set(Pe.w*i,Pe.h*i)") === true,
        sourceConstructorZero:
          sourceVA?.text.includes("uCoords:new I(new Q)") === true
          && sourceXABody.includes("uCoords:new I(new Q)")
          && sourceKABody.includes("uCoords:new I(new Q)"),
        sourceFloatingRuntimeNoWrite:
          sourceKABody.includes("update(e,t,n){this.mouse.x=zn(this.mouse.x,Pe.mouse.x,.1),this.mouse.y=zn(this.mouse.y,Pe.mouse.y,.1),this.customUniforms.uTime.value=e}")
          && !sourceKABody.includes("uCoords.value.set"),
        sourceZANoUCoordsWriter:
          sourceZABody.includes("update({time:e,delta:t,frame:n}){this.material.update(e,t,n),this.positionOnUpdate(e),this.mesh.instanceMatrix.needsUpdate=!0}")
          && !sourceZABody.includes("uCoords.value.set"),
        rebuildWorkAndAboutRuntimeWrite:
          rebuildWebgl.includes("function sourceWorkViewportCoords()")
          && rebuildWebgl.includes("material.uniforms.uCoords.value.set(coords.width, coords.height)")
          && rebuildWebgl.includes("sourceUCoordsMode: \"source-VA-update-Pe-width-height-times-capped-dpr-no-render-target-rounding\""),
        rebuildConstructorZero:
          rebuildWebgl.includes("uCoords: { value: new Vector2(0, 0) }")
          && rebuildWebgl.includes("sourceUCoordsConstructorMode = \"source-VA-XA-KA-uCoords-construct-new-Q-zero\"")
          && rebuildWebgl.includes("sourceUCoordsConstructorWasZero"),
        rebuildFloatingNoResizeWrite:
          !rebuildWebgl.includes("else item.material.uniforms.uCoords.value.set(Math.round(width * dpr), Math.round(height * dpr))")
          && rebuildWebgl.includes("runtimeUCoordsMode: \"source-ZA-KA-update-uTime-only-no-uCoords-resize\"")
          && rebuildWebgl.includes("uCoordsStaysConstructorZero:"),
        probeCoverage:
          rebuildOutputProbe.includes("activeUCoordsConstructorMode")
          && rebuildOutputProbe.includes("auxUCoordsConstructorMode")
          && rebuildOutputProbe.includes("floatingAuxUCoordsConstructorMode")
          && rebuildOutputProbe.includes("floatingAuxRuntimeUCoordsMode")
          && rebuildOutputProbe.includes("floatingAuxUCoordsRuntimeStaysConstructorZero"),
      },
      uUvOffsetOwnership: {
        sourceShaderVec3:
          bundle.includes("uniform vec3 uUvOffset;\nuniform float uUvOffsetScale;")
          && bundle.includes("vec2 mouseUv = newUv + uUvOffset.xy"),
        sourceRuntimeVector2:
          sourceVA?.text.includes("uUvOffset:new I(new Q),uUvOffsetScale:new I(1)") === true
          && sourceGA.text.includes("this.material.customUniforms.uUvOffset.value.x=")
          && sourceGA.text.includes("this.material.customUniforms.uUvOffset.value.y="),
        rebuildWorkShaderVec3:
          rebuildWorkBlockSourceHaVertexShader.includes("uniform vec3 uUvOffset;")
          && !rebuildWorkBlockSourceHaVertexShader.includes("uniform vec2 uUvOffset;"),
        rebuildAuxShaderVec3:
          rebuildWorkBlockVertexPars.includes("uniform vec3 uUvOffset;")
          && !rebuildWorkBlockVertexPars.includes("uniform vec2 uUvOffset;"),
        rebuildRuntimeVector2:
          rebuildWebgl.includes("uUvOffset: { value: sourceMouseUvOffset() }")
          && rebuildWebgl.includes("uvOffsetType: uvOffset?.isVector2 ? \"Vector2\"")
          && rebuildWebgl.includes("uvOffsetRuntimeBridgeMode: \"source-VA-uniform-value-Vector2-GA-writes-xy-shader-reads-xy\""),
      },
      uMouseSpeedConstructorOwnership: {
        sourceConstructorNull:
          sourceVA?.text.includes("uMouseSpeed:new I(null)") === true
          && sourceXABody.includes("uMouseSpeed:new I(null)")
          && sourceKABody.includes("uMouseSpeed:new I(null)"),
        sourceRuntimeWrite:
          sourceGA.text.includes("this.material.customUniforms.uMouseSpeed.value=this.mouseSpeed"),
        rebuildConstructorNull:
          rebuildWebgl.includes("uMouseSpeed: { value: null }")
          && !rebuildWebgl.includes("uMouseSpeed: { value: 0 }"),
        rebuildRuntimeWrite:
          rebuildWebgl.includes("item.material.uniforms.uMouseSpeed.value = item.mouseSpeed"),
        rebuildConstructorProbe:
          rebuildWebgl.includes("sourceUMouseSpeedConstructorMode = \"source-VA-XA-KA-uMouseSpeed-construct-null-GA-update-writes-runtime\"")
          && rebuildWebgl.includes("uMouseSpeedConstructorWasNull: activeWorkItem.material.userData.sourceUMouseSpeedConstructorWasNull")
          && rebuildOutputProbe.includes("activeUMouseSpeedConstructorWasNull")
          && rebuildOutputProbe.includes("auxUMouseSpeedConstructorWasNull")
          && rebuildOutputProbe.includes("floatingAuxUMouseSpeedConstructorWasNull"),
      },
      blockMaterialConstructorOwnership: {
        sourceDefaults:
          sourceVA?.text.includes("tMouseSim:new I(null),tMouseSim2:new I(null),uMouseSpeed:new I(null)") === true
          && sourceVA?.text.includes("uMouseLightness:new I(1)") === true
          && sourceVA?.text.includes("uReveal:new I(0),uRevealProject:new I(1)") === true
          && sourceVA?.text.includes("uCoords:new I(new Q)") === true
          && sourceVA?.text.includes("tDisplacement:new I(null)") === true
          && sourceGA.text.includes("this.material=new VA({color:new ye(\"#808080\")})")
          && sourceXABody.includes("tMouseSim:new I(null),tMouseSim2:new I(null),uMouseSpeed:new I(null)")
          && sourceXABody.includes("uMouseLightness:new I(1)")
          && sourceXABody.includes("uReveal:new I(0),uRevealSpread:new I(1)")
          && sourceXABody.includes("uCoords:new I(new Q)")
          && sourceXABody.includes("tDisplacement:new I(null)")
          && sourceKABody.includes("tMouseSim:new I(null),tMouseSim2:new I(null),uMouseSpeed:new I(null)")
          && sourceKABody.includes("uMouseLightness:new I(1)")
          && sourceKABody.includes("uReveal:new I(0),uRevealSpread:new I(10)")
          && sourceKABody.includes("uCoords:new I(new Q)")
          && sourceKABody.includes("tDisplacement:new I(null)"),
        sourceRuntimeWrites:
          sourceGA.text.includes("this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture")
          && sourceGA.text.includes("this.material.customUniforms.tDisplacement.value=J.wavvesScene.renderManager.renderTargetComposite.texture")
          && sourceP1Update?.text.includes("o.instance.material.customUniforms.tMouseSim2.value=this.renderManager.mouseSimulation.bufferSim.output.texture") === true
          && sourceSe.text.includes("setThumbMouseLightness=(e,t=1.6)=>{t===0?J.workScene.blocks.forEach"),
        rebuildConstructorDefaults:
          Boolean(rebuildCreateWorkBlockMaterial)
          && rebuildWebgl.includes("sourceBlockMaterialConstructorMode = \"source-VA-XA-KA-default-uniform-constructors\"")
          && rebuildCreateWorkBlockMaterial.includes("uReveal: { value: 0 }")
          && rebuildCreateWorkBlockMaterial.includes("uMouseLightness: { value: 1 }")
          && rebuildCreateWorkBlockMaterial.includes("uCoords: { value: new Vector2(0, 0) }")
          && rebuildCreateWorkBlockMaterial.includes("sourceUCoordsConstructorMode = \"source-VA-XA-KA-uCoords-construct-new-Q-zero\"")
          && rebuildCreateWorkBlockMaterial.includes("tMouseSim: { value: null }")
          && rebuildCreateWorkBlockMaterial.includes("tMouseSim2: { value: null }")
          && rebuildCreateWorkBlockMaterial.includes("tDisplacement: { value: null }")
          && rebuildCreateWorkBlockMaterial.includes("emissive: sourceRgbColor(\"#000000\", \"#000000\")")
          && rebuildCreateWorkBlockMaterial.includes("sourceEmissiveConstructorMode = \"source-VA-new-VA-color-only-emissive-default-black\"")
          && rebuildCreateWorkBlockMaterial.includes("sourceEmissiveConstructorWasBlack = material.emissive.equals(new Color(0, 0, 0))")
          && !rebuildWebgl.includes("uReveal: { value: reveal }")
          && !rebuildWebgl.includes("uMouseLightness: { value: numeric(payload.mouseLightness, 1) }")
          && !rebuildWebgl.includes("tMouseSim: { value: this.placeholder }")
          && !rebuildWebgl.includes("tMouseSim2: { value: this.screenMouseSimulationTexture }")
          && !rebuildWebgl.includes("tDisplacement: { value: this.displacementTarget.texture }")
          && !rebuildCreateWorkBlockMaterial.includes("payload.blocks")
          && !rebuildCreateWorkBlockMaterial.includes("DEFAULT_BG"),
        rebuildRuntimeWrites:
          rebuildWebgl.includes("item.material.uniforms.tMouseSim.value = item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder")
          && rebuildWebgl.includes("item.material.uniforms.tMouseSim2.value = this.screenMouseSimulationTexture")
          && rebuildWebgl.includes("item.material.uniforms.tDisplacement.value = this.displacementTarget.texture")
          && rebuildWebgl.includes("item.material.uniforms.uMouseLightness.value = this.thumbState.mouseLightness")
          && rebuildWebgl.includes("const material = this.createWorkBlockMaterial()"),
        probeCoverage:
          rebuildWebgl.includes("constructorDefaultsMode: activeWorkItem.material.userData.sourceBlockMaterialConstructorMode")
          && rebuildWebgl.includes("emissiveConstructorMode: activeWorkItem.material.userData.sourceEmissiveConstructorMode")
          && rebuildWebgl.includes("emissiveConstructorWasBlack: activeWorkItem.material.userData.sourceEmissiveConstructorWasBlack")
          && rebuildWebgl.includes("uCoordsConstructorMode: activeWorkItem.material.userData.sourceUCoordsConstructorMode")
          && rebuildWebgl.includes("tMouseSimRuntimeIsLocal:")
          && rebuildOutputProbe.includes("activeConstructorDefaultsMode")
          && rebuildOutputProbe.includes("activeEmissiveConstructorWasBlack")
          && rebuildOutputProbe.includes("activeUCoordsConstructorWasZero")
          && rebuildOutputProbe.includes("activeTMouseSimConstructorWasNull")
          && rebuildOutputProbe.includes("activeTMouseSimRuntimeLocal")
          && rebuildOutputProbe.includes("activeUMouseLightnessRuntimeThumbState"),
      },
      mouseFactorOwnership: {
        sourceConstructorDefault:
          sourceVA?.text.includes("uMouseFactor:new I(0)") === true,
        sourceP1SetMouseFactor:
          sourceP1SetBlocks?.text.includes("setMouseFactor(e){this.mouseF=e,this.blocks.forEach") === true
          && sourceP1SetBlocks?.text.includes("t.instance.material.customUniforms.uMouseFactor.value=e") === true,
        sourceP1UpdateDoesNotWrite:
          Boolean(sourceP1Update)
          && !sourceP1Update.text.includes("uMouseFactor"),
        sourceGalleryEntry:
          sourceYDAnimateIn?.text.includes("J.workScene.setMouseFactor(0)") === true
          && sourceYDAnimateIn?.text.includes("mouseF:1,duration:3,ease:\"none\"") === true
          && sourceYDAnimateIn?.text.includes("J.workScene.setMouseFactor(this.mouseF)") === true,
        sourcePreviewEnterLeave:
          bundle.includes("mouseF:.25,duration:3,ease:\"none\",onUpdate:()=>J.workScene.setMouseFactor(this.mouseF)")
          && bundle.includes("mouseF:1,duration:3,ease:\"none\",onUpdate:()=>J.workScene.setMouseFactor(this.mouseF)"),
        rebuild:
          rebuildWebgl.includes("private mouseFactor = 0;")
          && rebuildWebgl.includes("uMouseFactor: { value: this.mouseFactor }")
          && rebuildWebgl.includes("this.setMouseFactor(0, 0);")
          && rebuildWebgl.includes("this.setMouseFactor(1, 3);")
          && rebuildWebgl.includes("this.setMouseFactor(enabled ? 0.25 : 1, 3);")
          && rebuildWebgl.includes("mouseFactorOwnership: {")
          && rebuildWebgl.includes("updateOwnershipMode: \"source-p1-update-does-not-write-uMouseFactor\"")
          && rebuildWebgl.includes("p1UpdateDoesNotOwnRuntimeWrite: true")
          && rebuildWebgl.includes("allWorkUniformsMatchState"),
        rebuildP1UpdateDoesNotWrite:
          Boolean(rebuildUpdateVisibleWorkItems)
          && !rebuildUpdateVisibleWorkItems.includes("uMouseFactor.value"),
        probe:
          rebuildOutputProbe.includes("mouseFactor.mode !== \"source-p1-setMouseFactor-updates-VA-uMouseFactor\"")
          && rebuildOutputProbe.includes("mouseFactor.updateOwnershipMode !== \"source-p1-update-does-not-write-uMouseFactor\"")
          && rebuildOutputProbe.includes("mouseFactor.p1UpdateDoesNotOwnRuntimeWrite !== true")
          && rebuildOutputProbe.includes("mouseFactor.allWorkUniformsMatchState !== true"),
      },
      rebuildNoSplitLocalMouseUpdate:
        !rebuildWebgl.includes("private updateWorkMouseSimulation(")
        && !rebuildWebgl.includes("private syncWorkMouseSimulationUniforms("),
      rebuildNoRoundedTargetCoords:
        !rebuildWebgl.includes("item.material.uniforms.uCoords.value.set(this.workRawTarget.width, this.workRawTarget.height)")
        && !rebuildWebgl.includes("item.material.uniforms.uCoords.value.set(workRenderWidth, workRenderHeight)"),
      excerpt: compact(sourceGA.text),
    },
    auxiliaryBlockMaterials: {
      sourceXA: {
        checks: checks(sourceXABody, [
          "class XA extends Vn",
          "this.dithering=!0,this.transparent=!0,this.envMapIntensity=.75,this.roughness=1",
          "this.depthTest=!1,this.renderOrder=10,this.depthWrite=!1",
          "uMouse:new I(new Q)",
          "uCoords:new I(new Q)",
          "tMouseSim:new I(null),tMouseSim2:new I(null)",
          "uMouseSpeed:new I(null)",
          "uMouseFactor:new I(1)",
          "uMouseLightness:new I(1)",
          "uUvOffset:new I(new Q),uUvOffsetScale:new I(1)",
          "uReveal:new I(0),uRevealSpread:new I(1)",
          "tDisplacement:new I(null)",
          "uScrollOpacity:new I(1)",
          "t.vertexShader=jA,t.fragmentShader=WA",
        ]),
        defaultDepthState: {
          depthTestFalse: sourceXABody.includes("this.depthTest=!1"),
          depthWriteFalse: sourceXABody.includes("this.depthWrite=!1"),
          renderOrder10: sourceXABody.includes("this.renderOrder=10"),
        },
      },
      sourceKA: sourceKA && {
        index: sourceKA.index,
        checks: checks(sourceKABody, [
          "class KA extends Vn",
          "this.dithering=!0,this.transparent=!0,this.envMapIntensity=.75,this.roughness=1",
          "uMouse:new I(new Q)",
          "uCoords:new I(new Q)",
          "tMouseSim:new I(null),tMouseSim2:new I(null)",
          "uMouseSpeed:new I(null)",
          "uMouseFactor:new I(1)",
          "uMouseLightness:new I(1)",
          "uUvOffset:new I(new Q),uUvOffsetScale:new I(1)",
          "uReveal:new I(0),uRevealSpread:new I(10)",
          "uRevealProject:new I(1),uRevealSides:new I(1)",
          "tDisplacement:new I(null)",
          "uScrollOpacity:new I(1)",
          "t.vertexShader=YA,t.fragmentShader=qA",
        ]),
        defaultDepthState: {
          keepsDepthTestDefault: !sourceKABody.includes("this.depthTest=!1"),
          keepsDepthWriteDefault: !sourceKABody.includes("this.depthWrite=!1"),
          keepsRenderOrderDefault: !sourceKABody.includes("this.renderOrder=10"),
        },
        excerpt: compact(sourceKABody),
      },
      rebuildChecks: checks(rebuildWebgl, [
        "uMouse: { value: new Vector2(0, 0) }",
        "uCoords: { value: new Vector2(0, 0) }",
        "uMouseSpeed: { value: null }",
        "tMouseSim: { value: null }",
        "tMouseSim2: { value: null }",
        "tDisplacement: { value: null }",
        "sourceBlockMaterialConstructorMode = \"source-VA-XA-KA-default-uniform-constructors\"",
        "sourceUCoordsConstructorMode = \"source-VA-XA-KA-uCoords-construct-new-Q-zero\"",
        "sourceUCoordsConstructorWasZero",
        "sourceTMouseSimConstructorWasNull",
        "sourceTMouseSim2ConstructorWasNull",
        "sourceTDisplacementConstructorWasNull",
        "uUvOffsetScale: { value: 1 }",
        "...(kind === \"about\" ? { depthWrite: false, depthTest: false } : {})",
        "if (kind === \"about\") material.renderOrder = 10",
        "mode: \"source-XA-about-material-state\"",
        "mode: \"source-KA-floating-material-state\"",
        "floatingAuxiliaryMaterial: this.floatingBlocks ?",
        "runtimeBindingMode: \"source-XA-$A-update-local-tMouseSim-uMouseSpeed-tDisplacement-p1-update-tMouseSim2\"",
        "runtimeBindingMode: \"source-ZA-update-material-time-position-no-sampler-writes\"",
        "runtimeUCoordsMode: \"source-ZA-KA-update-uTime-only-no-uCoords-resize\"",
        "uCoordsStaysConstructorZero:",
        "source-XA-jA-WA-direct-shader",
        "source-KA-YA-qA-direct-shader",
        "patchWorkBlockShader(shader, uniforms, kind === \"about\" ? \"aboutAuxiliary\" : \"floatingAuxiliary\")",
      ]),
      probeChecks: checks(rebuildOutputProbe, [
        "auxiliaryMaterial?.mode !== \"source-XA-about-material-state\"",
        "auxiliaryMaterial?.shaderMode !== \"source-XA-jA-WA-direct-shader\"",
        "auxiliaryMaterial?.renderOrder !== 10",
        "auxiliaryMaterial?.uMouseType !== \"Vector2\"",
        "auxiliaryMaterial?.uMouseSpeedConstructorWasNull !== true",
        "auxiliaryMaterial?.uCoordsConstructorMode !== \"source-VA-XA-KA-uCoords-construct-new-Q-zero\"",
        "auxiliaryMaterial?.uCoordsConstructorWasZero !== true",
        "auxiliaryMaterial?.tMouseSimConstructorWasNull !== true",
        "auxiliaryMaterial?.tMouseSim2ConstructorWasNull !== true",
        "auxiliaryMaterial?.tDisplacementConstructorWasNull !== true",
        "auxiliaryMaterial?.runtimeBindingMode",
        "auxiliaryMaterial?.tMouseSimRuntimeIsLocal === false",
        "auxiliaryMaterial?.uUvOffsetScale ?? 0",
        "floatingAuxiliaryMaterial?.mode !== \"source-KA-floating-material-state\"",
        "floatingAuxiliaryMaterial?.shaderMode !== \"source-KA-YA-qA-direct-shader\"",
        "floatingAuxiliaryMaterial?.depthWrite !== true",
        "floatingAuxiliaryMaterial?.depthTest !== true",
        "floatingAuxiliaryMaterial?.renderOrder ?? null",
        "floatingAuxiliaryMaterial?.uMouseType !== \"Vector2\"",
        "floatingAuxiliaryMaterial?.uMouseSpeedConstructorWasNull !== true",
        "floatingAuxiliaryMaterial?.uCoordsConstructorMode !== \"source-VA-XA-KA-uCoords-construct-new-Q-zero\"",
        "floatingAuxiliaryMaterial?.uCoordsConstructorWasZero !== true",
        "floatingAuxiliaryMaterial?.runtimeUCoordsMode !== \"source-ZA-KA-update-uTime-only-no-uCoords-resize\"",
        "floatingAuxUCoordsZero",
        "floatingAuxiliaryMaterial?.uCoordsStaysConstructorZero !== true",
        "floatingAuxiliaryMaterial?.tMouseSimConstructorWasNull !== true",
        "floatingAuxiliaryMaterial?.tMouseSim2ConstructorWasNull !== true",
        "floatingAuxiliaryMaterial?.tDisplacementConstructorWasNull !== true",
        "floatingAuxiliaryMaterial?.runtimeBindingMode !== \"source-ZA-update-material-time-position-no-sampler-writes\"",
        "floatingAuxiliaryMaterial?.tMouseSimRuntimeStaysConstructorNull !== true",
        "floatingAuxiliaryMaterial?.uUvOffsetScale ?? 0",
        "auxiliaryLifecycle.floatingEntryVisibilityMode !== \"source-Fg-animateIn-onStart-visible-not-enter-state\"",
        "auxiliaryLifecycle.floatingScrollVelocityMode !== \"source-Fg-onRaf-page-scroll-velocity\"",
      ]),
    },
    auxiliaryBlockShaders: {
      sourceChecks: {
        jA: checks(sourceAuxiliaryJA, [
          "attribute float instanceIndex",
          "uniform vec3 uUvOffset",
          "float revealCombined = uReveal;",
          "transformed = mix(transformed, perlinDisplaced, (1. - fadeDiplacement) * 10.25)",
          "float waveDisplacement = displacementF * 3.0 + 9. * (1. - revealCombined);",
          "transformed *= uReveal;",
        ]),
        WA: checks(sourceAuxiliaryWA, [
          "uniform float uScrollOpacity;",
          "#include <tonemapping_fragment>",
          "float revealCombined = 1.;",
          "uMouseFactor * 0.15",
          "gl_FragColor.a = mixedAlpha * uScrollOpacity;",
        ]),
        YA: checks(sourceAuxiliaryYA, [
          "float perlinDisplacementHeight = 5.;",
          "vec4 perlin = texture2D(tPerlin, perlinUv);",
          "transformed.z *= 7. *  (.5 + instanceColor.r);",
          "float waveDisplacement = displacementF * 3.0 + 9. * (1.);",
          "// mvPosition.z = mod(mvPosition.z + (uTime * instanceColor.r * 10.), 1000.) - 50.;",
        ]),
        qA: checks(sourceAuxiliaryQA, [
          "float revealCombined = 1.;",
          "uMouseFactor * 0.15",
          "mixedAlpha = clamp(mixedAlpha, 0.05, 1.);",
          "gl_FragColor.a = mixedAlpha * uReveal;",
        ]),
      },
      rebuildChecks: checks(rebuildWebgl, [
        "const sourceAboutAuxiliaryJAVertexShader = `",
        "const sourceAboutAuxiliaryWAFragmentShader = `",
        "const sourceFloatingAuxiliaryYAVertexShader = `",
        "const sourceFloatingAuxiliaryQAFragmentShader = `",
        "shader.vertexShader = sourceAboutAuxiliaryJAVertexShader;",
        "shader.fragmentShader = sourceAboutAuxiliaryWAFragmentShader;",
        "shader.vertexShader = sourceFloatingAuxiliaryYAVertexShader;",
        "shader.fragmentShader = sourceFloatingAuxiliaryQAFragmentShader;",
        "name: variant === \"work\" ? \"VA-work\" : variant === \"aboutAuxiliary\" ? \"XA-about\" : \"KA-floating\"",
        "source-XA-jA-WA-direct-shader",
        "source-KA-YA-qA-direct-shader",
      ]),
      noOldBridgeChecks: {
        noAuxiliaryChunkVariant: !rebuildWebgl.includes("variant: \"work\" | \"auxiliary\""),
        noAuxiliaryOpaqueChunk: !rebuildWebgl.includes("const auxiliaryBlockOpaqueFragmentChunk"),
        noAuxiliaryMaterialUniform: !rebuildWebgl.includes("uAuxiliaryMaterial: { value: 1 }"),
      },
      dumpChecks: checks(readFileSync("scripts/dump-va-shader.mjs", "utf8"), [
        "\"XA-about\": sourceShader(bundle, \"WA\")",
        "\"KA-floating\": sourceShader(bundle, \"qA\")",
        "\"XA-about\": sourceShader(bundle, \"jA\")",
        "\"KA-floating\": sourceShader(bundle, \"YA\")",
      ]),
      probeChecks: checks(rebuildOutputProbe, [
        "auxiliaryMaterial?.shaderMode !== \"source-XA-jA-WA-direct-shader\"",
        "floatingAuxiliaryMaterial?.shaderMode !== \"source-KA-YA-qA-direct-shader\"",
      ]),
    },
    dollarAAboutBlocks: sourceDollarA && {
      index: sourceDollarA.index,
      checks: checks(sourceDollarA.text, [
        "class $A extends rt",
        "this.settings={xNum:23,yNum:23,zNum:(Le.LOW_RES,4),size:1.25,spacing:.1,scale:.09}",
        "this.geometry=new mg(e,e,e,.05)",
        "this.scaleWrap.scale.set(.35,.35,.35)",
        "this.mouseSim=new Ka({renderer:e.renderer,camera:e.camera,mesh:this.plane,persistance:.85,thickness:.1,rayCastMesh:this.rayPlane})",
        "this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture",
        "this.material.customUniforms.uMouseSpeed.value=this.mouseSpeed",
        "this.material.customUniforms.tDisplacement.value=J.wavvesScene.renderManager.renderTargetComposite.texture",
        "_*_+S*S<=u*u&&",
        "this.geometry.setAttribute(\"instanceOffset\",new un(v,3))",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "const zNum = sourceLowRes() ? 4 : 4",
        "const geometry = sourceRoundedBoxGeometry(GRID_CUBE_SIZE, GRID_CUBE_SIZE, GRID_CUBE_SIZE, 0.05)",
        "if (px * px + py * py > radius * radius) continue",
        "const mouseSimulation = this.createAuxiliaryMouseSimulation()",
        "rayPlane.scale.set(xNum * MOUSE_RAY_SCALE, yNum * MOUSE_RAY_SCALE, MOUSE_RAY_SCALE)",
        "rayPlane.position.set(0, 0, zNum / 2 + 0.01)",
        "item.material.uniforms.tMouseSim.value = item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder",
        "item.material.uniforms.uMouseSpeed.value = item.mouseSpeed",
        "runtimeBindingMode: \"source-XA-$A-update-local-tMouseSim-uMouseSpeed-tDisplacement-p1-update-tMouseSim2\"",
        "scaleWrap.scale.setScalar(0.35)",
        "kind: \"about\"",
      ]),
      excerpt: compact(sourceDollarA.text),
    },
    ZAFloatingBlocks: sourceZA && {
      index: sourceZA.index,
      checks: checks(sourceZA.text, [
        "class ZA extends rt",
        "this.settings={xNum:30,yNum:30,zNum:1,size:.5,spacing:.3,scale:.3,speed:1}",
        "this.geometry=new Cr(e,e,e)",
        "update({time:e,delta:t,frame:n}){this.material.update(e,t,n),this.positionOnUpdate(e),this.mesh.instanceMatrix.needsUpdate=!0}",
      ]),
      samplerRuntimeOwnership: {
        sourceNoLocalMouseSim:
          !sourceZABody.includes("new Ka({")
          && !sourceZABody.includes("tMouseSim.value")
          && !sourceZABody.includes("tDisplacement.value"),
        rebuildNoFloatingSamplerWrites:
          rebuildWebgl.includes("runtimeBindingMode: \"source-ZA-update-material-time-position-no-sampler-writes\"")
          && rebuildWebgl.includes("tMouseSimRuntimeStaysConstructorNull")
          && rebuildWebgl.includes("tMouseSim2RuntimeStaysConstructorNull")
          && rebuildWebgl.includes("tDisplacementRuntimeStaysConstructorNull")
          && !rebuildWebgl.includes("if (item.kind === \"floating\")"),
      },
      rebuildChecks: checks(rebuildWebgl, [
        "private createFloatingBlocks(): AuxiliaryBlockItem",
        "const geometry = new BoxGeometry(0.5, 0.5, 0.5)",
        "mode: \"source-ZA-box-geometry-not-mg\"",
        "runtimeBindingMode: \"source-ZA-update-material-time-position-no-sampler-writes\"",
      ]),
      excerpt: compact(sourceZA.text),
    },
    TDAboutVisualLifecycle: sourceTDSpotlight && {
      index: sourceTDSpotlight.index,
      checks: checks(sourceTDSpotlight.text, [
        "J.workScene.aboutBlocks.visible=!0",
        "J.workScene.spotLightParallax=!1",
        "await fn(100)",
        "Bt.add(this.onRaf,\"aboutVisual\")",
        "J.workScene.spotLight.map=J.characterScene.renderManager.renderTargetComposite.texture",
        "J.characterScene.character.rotatableMesh.addEvents()",
        "pe.emit(xe.FORCE_RESIZE)",
        "await fn(200)",
        "this.onScroll()",
        "Bt.remove(\"aboutVisual\")",
        "J.characterScene.character.rotatableMesh.removeEvents()",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_TD_SPOTLIGHT_MAP_DELAY_MS = 100",
        "const SOURCE_TD_INITIAL_SCROLL_DELAY_MS = 200",
        "mode: \"source-TD-addEvents-100ms-map-resize-200ms-initial-scroll\"",
        "mapBindingMode: \"source-TD-after-100ms-character-composite-not-enter-state\"",
        "resizeMode: \"source-TD-pe-FORCE_RESIZE-after-character-map\"",
        "initialScrollMode: \"source-TD-await-200ms-after-map-then-onScroll\"",
        "private scheduleAboutVisualLifecycle()",
        "this.aboutSpotlightMapTimer = window.setTimeout(() => {",
        "this.spotLight.map = this.characterTarget.texture",
        "this.sourceAddCharacterRotatableEvents();",
        "this.resize();",
        "this.aboutInitialScrollTimer = window.setTimeout(() => {",
        "this.applySourceAboutScrollState();",
        "}, SOURCE_TD_INITIAL_SCROLL_DELAY_MS);",
        "}, SOURCE_TD_SPOTLIGHT_MAP_DELAY_MS);",
        "this.clearAboutVisualLifecycleTimers();",
        "this.sourceRemoveCharacterRotatableEvents();",
      ]),
      outputProbeChecks: checks(rebuildOutputProbe, [
        "auxiliaryLifecycle.aboutSpotlightLifecycleMode !== \"source-TD-addEvents-100ms-map-resize-200ms-initial-scroll\"",
        "auxiliaryLifecycle.aboutMapDelayMs !== 100",
        "auxiliaryLifecycle.aboutInitialScrollDelayMs !== 200",
        "auxiliaryLifecycle.aboutMapBindingMode !== \"source-TD-after-100ms-character-composite-not-enter-state\"",
        "auxiliaryLifecycle.aboutResizeMode !== \"source-TD-pe-FORCE_RESIZE-after-character-map\"",
        "auxiliaryLifecycle.aboutInitialScrollMode !== \"source-TD-await-200ms-after-map-then-onScroll\"",
        "auxiliaryLifecycle.aboutCharacterRotatableMode !== \"source-TD-character-rotatableMesh-addEvents-after-map-remove-on-destroy\"",
      ]),
      excerpt: compact(sourceTDSpotlight.text),
    },
    TDCharacterRotatableLifecycle: sourceCharacterRotatable && sourceCharacterScene && {
      index: sourceCharacterRotatable.index,
      checks: {
        Q1: checks(sourceCharacterRotatable.text, [
          "class Q1 extends rt",
          "this.params={horizontal:!0,vertical:!1,dampingFactor:5}",
          "window.addEventListener(t,this.onMouseDown,e)",
          "window.addEventListener(n,this.onMouseMove,e)",
          "window.addEventListener(i,this.onMouseUp)",
          "window.removeEventListener(e,this.onMouseDown)",
          "window.removeEventListener(t,this.onMouseMove)",
          "window.removeEventListener(n,this.onMouseUp)",
          "this.targetRotation.x=this.targetRotationOnMouseDown.x+(this.currentMove.x+this.mouseOnMouseDown.x)*.01",
          "this.rotation.y=Yi(this.rotation.y,i,this.params.dampingFactor,e)",
        ]),
        eD: checks(sourceCharacterScene.text, [
          "this.cameraPanGroup=new rt",
          "this.rotatableMesh=new Q1({horizontal:!0,vertical:!1})",
          "this.rotatableMesh.add(this)",
          "this.cameraPanGroup.add(this.rotatableMesh)",
          "e.scene.add(this.cameraPanGroup)",
          "this.rotatingActive||this.rotatableMesh.update(t)",
          "this.mouse.x=zn(this.mouse.x,Pe.mouse.normalized.x,.1)",
          "this.cameraPanGroup.rotation.x=bo(zn(this.cameraPanGroup.rotation.x,-this.mouse.y+.5,2*t),-.15,.3)",
          "this.rotation.y+=t*1",
        ]),
      },
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_CHARACTER_ROTATABLE_DAMPING = 5",
        "const SOURCE_CHARACTER_AUTO_ROTATE_SPEED = 1",
        "private characterCameraPanGroup = new Object3D();",
        "private characterRotatableMesh = new Object3D();",
        "private characterBodyGroup = new Group();",
        "this.characterBodyGroup.add(this.characterFallbackMesh);",
        "this.characterRotatableMesh.add(this.characterBodyGroup);",
        "this.characterCameraPanGroup.add(this.characterRotatableMesh);",
        "private sourceAddCharacterRotatableEvents()",
        "private sourceRemoveCharacterRotatableEvents()",
        "private updateSourceCharacterScene(delta: number)",
        "this.characterRotatableMesh.rotation.y = sourceDamp(",
        "this.characterBodyGroup.rotation.y += delta * SOURCE_CHARACTER_AUTO_ROTATE_SPEED;",
      ]),
      outputProbeChecks: checks(rebuildOutputProbe, [
        "auxiliaryLifecycle.aboutCharacterRotatableMode !== \"source-TD-character-rotatableMesh-addEvents-after-map-remove-on-destroy\"",
        "auxiliaryLifecycle.aboutCharacterRotatableWrapperMode !== \"source-eD-cameraPanGroup-rotatableMesh-character\"",
        "auxiliaryLifecycle.aboutCharacterRotatableEventMode !== \"source-Q1-window-mouse-touch-passive-events\"",
        "auxiliaryLifecycle.aboutCharacterRotatableUpdateMode !== \"source-eD-Q1-update-horizontal-damped-rotation-and-auto-rotate\"",
        "auxiliaryLifecycle.aboutCharacterRotatableDamping !== 5",
      ]),
      excerpt: compact(`${sourceCharacterRotatable.text} ${sourceCharacterScene.text}`),
    },
    FgFloatingBlocksLifecycle: sourceFg && {
      index: sourceFg.index,
      checks: checks(sourceFg.text, [
        "class Fg extends Ht",
        "this.translation=.005",
        "J.workScene.floatingBlocks.update(e)",
        "J.workScene.floatingBlocks.translationZ+=this.translation*Math.abs(this.page.scroll.velocity)",
        "onComplete:()=>{J.workScene.floatingBlocks.visible=!1}",
        "onStart:()=>{J.workScene.floatingBlocks.visible=!0}",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_FLOATING_SCROLL_TRANSLATION = 0.005",
        "setAboutScrollState(scroll = window.scrollY, velocity = 0)",
        "this.auxiliaryPageScrollActive = true",
        "this.floatingBlocks.group.visible = false",
        "onStart: () => {",
        "this.floatingBlocks.group.visible = true",
        "const scrollVelocity = this.auxiliaryPageScrollActive ? this.auxiliaryPageScrollVelocity : window.scrollY - this.auxiliaryScrollLast",
        "item.translationZ += SOURCE_FLOATING_SCROLL_TRANSLATION * Math.abs(scrollVelocity)",
        "floatingScrollVelocityMode: \"source-Fg-onRaf-page-scroll-velocity\"",
      ]),
      mainChecks: checks(rebuildMain, [
        "type PageScrollDetail = {",
        "setAboutScrollState?(scroll?: number, velocity?: number): void",
        "window.addEventListener(\"rd:page-scroll\", onPageScroll)",
        "webgl?.setAboutScrollState?.(detail.scroll ?? window.scrollY, detail.velocity ?? 0)",
      ]),
      motionChecks: checks(rebuildMotion, [
        "function dispatchPageScroll(scroll: number, velocity: number)",
        "dispatchPageScroll(lenis.scroll, lenis.velocity)",
      ]),
      outputProbeChecks: checks(rebuildOutputProbe, [
        "auxiliaryLifecycle.mode !== \"source-TD-Fg-split-about-floating-lifecycle\"",
        "auxiliaryLifecycle.floatingEntryVisibilityMode !== \"source-Fg-animateIn-onStart-visible-not-enter-state\"",
        "auxiliaryLifecycle.floatingScrollVelocityMode !== \"source-Fg-onRaf-page-scroll-velocity\"",
      ]),
      excerpt: compact(sourceFg.text),
    },
    Ka: (() => {
      const start = bundle.indexOf("class Ka{constructor");
      const end = start >= 0 ? bundle.indexOf("const Ur=", start) : -1;
      const sourceKa = start >= 0 && end > start ? bundle.slice(start, end) : null;
      return sourceKa
        ? {
            index: start,
            checks: checks(sourceKa, [
              "uTexture:{value:null},uNoiseTexture:{value:null},uCoords:{value:new Q(innerWidth,innerHeight)}",
              "uPosOld:{value:new Q(0,0)},uPosNew:{value:new Q(0,0)}",
              "onResize(e,t){this.bufferSim.onResize(e,t),this.simulationMaterial.uniforms.uCoords.value.set(e,t)}",
              "onMouseMove({x:e,y:t}){this.onMesh?this.raycast({x:e,y:t}):this.targetPos.set(e/Pe.w,1-t/Pe.h)}",
              "this.mouse.x=e/Pe.w*2-1",
              "this.mouse.y=-(t/Pe.h)*2+1",
              "this.raycaster.setFromCamera(this.mouse,this.camera)",
              "this.intersects=this.raycaster.intersectObjects([this.rayCastMesh])",
              "this.intersects.length>0&&(this.targetPos.x=this.intersects[0].uv.x,this.targetPos.y=this.intersects[0].uv.y)",
              "this.simulationMaterial.uniforms.uPosNew.value=this.newPos",
              "this.simulationMaterial.uniforms.uPosOld.value=this.oldPos",
              "this.oldPos=this.newPos.clone()",
            ]),
            rebuildRaycastChecks: checks(rebuildWebgl, [
              "private pointerRay = new Vector2()",
              "this.pointerRay.set(this.targetPointer.x, this.targetPointer.y)",
              "private onMouseMove = (event: MouseEvent) => {",
              "this.updatePointerProjection()",
              "this.raycaster.setFromCamera(this.pointerRay, this.homeCamera)",
              "const hit = this.raycaster.intersectObject(item.rayPlane, false)[0]",
              "item.mouseTarget.set(hit.uv.x, hit.uv.y)",
              "raycastMode: \"source-Ka-onMouseMove-per-item-raycast-immediate-pointer\"",
              "raycastEventMode: \"source-Ka-raycast-during-mousemove-not-raf-tail\"",
              "raycastUvWriteMode: \"source-Ka-raycast-hit-uv-direct-targetPos-no-clamp\"",
            ]),
            rebuildConstructorChecks: checks(rebuildWebgl, [
              "uTexture: { value: null }",
              "uNoiseTexture: { value: null }",
              "uCoords: { value: new Vector2(window.innerWidth, window.innerHeight) }",
              "uPosOld: { value: new Vector2(0, 0) }",
              "uPosNew: { value: new Vector2(0, 0) }",
              "sourceKaConstructorUniformDefaults",
              "constructorUniformMode: screenConstructorDefaults?.mode",
              "noiseTextureBindingMode: \"source-Ka-uNoiseTexture-constructor-null-no-runtime-writer\"",
            ]),
            rebuildUPosUpdateChecks: checks(rebuildWebgl, [
              "material.uniforms.uPosNew.value = newPos;",
              "material.uniforms.uPosOld.value = oldPos;",
              "return { speed, index: outputIndex, oldPos: newPos.clone() };",
              "item.mouseOld = meshResult.oldPos;",
              "this.screenMouseSimOldPos = screenResult.oldPos;",
              "uPosUniformWriteMode: \"source-Ka-update-direct-uPosNew-uPosOld-vector-ref-assignment\"",
              "oldPosCloneMode: \"source-Ka-update-oldPos-newPos-clone-after-render\"",
              "uPosNewUniformIsStateNew",
              "uPosOldUniformDetachedAfterClone",
            ]),
            rebuildNoUPosUniformCopy:
              !rebuildWebgl.includes("material.uniforms.uPosNew.value.copy(newPos)")
              && !rebuildWebgl.includes("material.uniforms.uPosOld.value.copy(oldPos)")
              && !rebuildWebgl.includes("oldPos.copy(newPos)"),
            rebuildNoNoiseTextureRuntimeWriter:
              !rebuildWebgl.includes("this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value = blueNoiseTexture")
              && !rebuildWebgl.includes("item.mouseMaterial.uniforms.uNoiseTexture.value = blueNoiseTexture"),
            rebuildNoRaycastUvClamp:
              !rebuildWebgl.includes("MathUtils.clamp(hit.uv.x")
              && !rebuildWebgl.includes("MathUtils.clamp(hit.uv.y"),
            outputProbeChecks: checks(rebuildOutputProbe + rebuildInteractiveMouseProbe, [
              "source-Ka-raycast-hit-uv-direct-targetPos-no-clamp",
              "raycastUvWriteMode",
              "active-raycast-uv-write-mode",
              "source-Ka-simulationMaterial-constructor-uniform-defaults",
              "source-Ka-uNoiseTexture-constructor-null-no-runtime-writer",
              "source-Ka-update-direct-uPosNew-uPosOld-vector-ref-assignment",
              "source-Ka-update-oldPos-newPos-clone-after-render",
              "screen-upos-new-ref",
              "active-upos-old-clone-detach",
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
              "float br = 1. - + (oldTexture.r + oldTexture.g + oldTexture.b)/3.0",
              "float p2 = (uDiffusion)/4.0",
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
            "this.fbos=[this.fbo,this.fbo.clone()],this.current=0,this.output=this.fbos[0]",
            "this.shader.uniforms.uTexture.value=this.fbos[this.current].texture",
            "this.current=1-this.current,this.output=this.fbos[this.current]",
            "this.renderer.setRenderTarget(this.output)",
            "this.renderer.render(this.orthoScene,this.orthoCamera)",
            "this.renderer.setRenderTarget(null)",
          ]),
          rebuildPingPongBindingChecks: checks(rebuildWebgl, [
            "sourceSAInitialOutputIndex: 0",
            "sourceSAOutputFlipMode: \"source-sA-render-uses-current-as-input-then-flips-output\"",
            "boundTextureIndex: c1MouseSimBoundIndex",
            "currentOutputIndex: this.screenMouseSimulationIndex",
            "remainsInitialOutputTexture: c1MouseSimTexture === this.screenMouseSimulationTargets[0]?.texture",
            "matchesCurrentOnlyWhenOutputIndexZero: c1MouseSimMatchesCurrentOutput === (this.screenMouseSimulationIndex === 0)",
          ]),
          rebuildProbeChecks: checks(rebuildOutputProbe, [
            "c1MouseSimBinding.mode !== \"source-nD-samples-sA-output-texture-once-before-render-loop\"",
            "c1MouseSimBinding.sourceSAOutputFlipMode !== \"source-sA-render-uses-current-as-input-then-flips-output\"",
            "c1MouseSimBinding.boundTextureIndex !== 0",
            "c1MouseSimBinding.matchesCurrentOutputTexture !== (screenMouse?.index === 0)",
            "c1MouseSimBinding.matchesCurrentOnlyWhenOutputIndexZero !== true",
          ]),
          noExplicitClear: !sourceSA.includes(".clear()"),
          excerpt: compact(sourceSA),
        }
      : null,
    i1: sourceI1 && {
      index: sourceI1.index,
      checks: checks(sourceI1.text, [
        "constructor({width:e=512,height:t=512,clipBias:n=0,blurIterations:i=2}",
        "this.blurIterations=i",
        "this.renderTarget=new Dn(e,t,{depthBuffer:!1})",
        "this.renderTargetUniform=new I(this.blurIterations>0?this.renderTargetRead.texture:this.renderTarget.texture)",
        "this.blurMaterial.uniforms.uResolution.value.set(e,t)",
        "this.screenTriangle=n1()",
        "this.screen=new at(this.screenTriangle,this.blurMaterial)",
        "this.screen.frustumCulled=!1",
        "this.virtualCamera.lookAt(this.target)",
        "this.virtualCamera.far=n.far",
        "this.virtualCamera.updateMatrixWorld()",
        "this.virtualCamera.projectionMatrix.copy(n.projectionMatrix)",
        "this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1)",
        "this.textureMatrix.multiply(this.virtualCamera.projectionMatrix)",
        "this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse)",
        "this.textureMatrix.multiply(this.matrixWorld)",
        "this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal,this.reflectorWorldPosition)",
        "this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse)",
        "this.clipPlane.set(this.reflectorPlane.normal.x,this.reflectorPlane.normal.y,this.reflectorPlane.normal.z,this.reflectorPlane.constant)",
        "this.clipPlane.multiplyScalar(2/this.clipPlane.dot(this.q))",
        "i.elements[2]=this.clipPlane.x",
        "i.elements[6]=this.clipPlane.y",
        "i.elements[10]=this.clipPlane.z+1-this.clipBias",
        "i.elements[14]=this.clipPlane.w",
        "const r=e.getRenderTarget(),o=e.xr.enabled,a=e.shadowMap.autoUpdate",
        "e.xr.enabled=!1,e.shadowMap.autoUpdate=!1",
        "e.autoClear===!1&&e.clear()",
        "e.setRenderTarget(this.renderTarget)",
        "e.state.buffers.depth.setMask(!0)",
        "const c=this.blurIterations",
        "u===0?this.blurMaterial.uniforms.tMap.value=this.renderTarget.texture:this.blurMaterial.uniforms.tMap.value=this.renderTargetRead.texture",
        "e.setRenderTarget(this.renderTargetWrite)",
        "const l=this.renderTargetRead;this.renderTargetRead=this.renderTargetWrite,this.renderTargetWrite=l,this.renderTargetUniform.value=this.renderTargetRead.texture",
        "this.screenTriangle.dispose()",
      ]),
      rebuildChecks: checks(rebuildWebgl, [
        "const SOURCE_I1_REFLECTION_WIDTH = 512",
        "const SOURCE_I1_REFLECTION_HEIGHT = 512",
        "const SOURCE_I1_REFLECTION_BLUR_ITERATIONS = 2",
        "new WebGLRenderTarget(SOURCE_I1_REFLECTION_WIDTH, SOURCE_I1_REFLECTION_HEIGHT, { depthBuffer: false })",
        "private readonly floorReflectionBlurIterations = SOURCE_I1_REFLECTION_BLUR_ITERATIONS",
        "value: this.floorReflectionBlurIterations > 0",
        "this.floorReflectionBlurMaterial.uniforms.uResolution.value.set(SOURCE_I1_REFLECTION_WIDTH, SOURCE_I1_REFLECTION_HEIGHT)",
        "private floorReflectionScreenTriangle = makeSourceScreenTriangleGeometry()",
        "this.floorReflectionScreen = new Mesh(this.floorReflectionScreenTriangle, this.floorReflectionBlurMaterial)",
        "this.floorReflectionScreen.frustumCulled = false",
        "this.floorReflectionScreenTriangle.dispose()",
        "this.renderer.setRenderTarget(this.floorReflectionWriteTarget)",
        "this.floorReflectionRendererState.previous = this.floorReflectionRendererSnapshot(previousTarget)",
        "this.floorReflectionRendererState.duringRaw = this.floorReflectionRendererSnapshot()",
        "this.floorReflectionRendererState.duringBlur = this.floorReflectionRendererSnapshot()",
        "this.floorReflectionRendererState.restored = this.floorReflectionRendererSnapshot()",
        "const FLOOR_REFLECTION_CAMERA_EXPECTED_STEPS = [",
        "private floorReflectionCameraState = {",
        "this.resetFloorReflectionCameraState();",
        "this.markFloorReflectionCameraStep(\"lookAtTarget\");",
        "this.markFloorReflectionCameraStep(\"projectionCopy\");",
        "this.markFloorReflectionCameraStep(\"textureMatrixBias\");",
        "this.markFloorReflectionCameraStep(\"textureMatrixReflectorMatrixWorld\");",
        "this.markFloorReflectionCameraStep(\"clipPlaneScaledByQ\");",
        "this.markFloorReflectionCameraStep(\"projectionRowWrite\");",
        "floorReflectionCameraState: this.floorReflectionCameraStateProbe()",
        "const swap = this.floorReflectionReadTarget",
        "this.floorReflectionReadTarget = this.floorReflectionWriteTarget",
        "this.floorReflectionWriteTarget = swap",
        "this.updateFloorReflectionRenderTargetUniform(this.floorReflectionReadTarget.texture)",
        "const blurIterations = this.floorReflectionBlurIterations",
        "for (let iteration = 0; iteration < blurIterations; iteration += 1)",
        "const direction = (blurIterations - iteration - 1) * 15",
      ]),
      rebuildProbeChecks: checks(rebuildOutputProbe, [
        "reflectionTargets.constructorMode !== \"source-i1-default-width-height-512-blurIterations-2\"",
        "reflectionTargets.blurIterations !== 2",
        "reflectionTargets?.renderTargetUniformConstructorMode !== \"source-i1-positive-blurIterations-initial-read-texture\"",
        "reflectionTargets?.blurConstructorResolutionMode !== \"source-i1-sets-t1-uResolution-to-constructor-width-height\"",
        "JSON.stringify(reflectionTargets?.blurConstructorResolution) !== JSON.stringify([512, 512])",
        "reflectionTargets?.blurDirectionMode !== \"source-i1-direction-(blurIterations-u-1)*15-axis-by-iteration\"",
        "JSON.stringify(reflectionTargets?.blurExpectedDirections) !== JSON.stringify([[15, 0], [0, 0]])",
        "reflectionTargets?.screenTriangleMode !== \"source-i1-screenTriangle-n1-geometry-owned-by-reflector\"",
        "reflectionTargets?.screenTriangleSharedWithScreen !== true",
        "reflectionTargets?.screenDisposeMode !== \"source-i1-destroy-disposes-screenTriangle\"",
        "reflectionTargets?.blurSwapOwnershipMode !== \"source-i1-direct-renderTargetRead-renderTargetWrite-field-swap-inside-loop\"",
        "floorRendererState?.mode !== \"source-i1-save-renderer-state-disable-xr-shadow-restore-target\"",
        "floorRendererState?.rawPassMode !== \"source-i1-set-raw-target-depth-mask-conditional-clear-render-scene\"",
        "floorRendererState?.restoreMode !== \"source-i1-restore-xr-shadow-and-previous-render-target\"",
        "floorRendererState?.xrDisabledDuringReflection !== true",
        "floorRendererState?.shadowAutoUpdateDisabledDuringReflection !== true",
        "floorRendererState?.renderTargetRestored !== true",
        "floorCameraState?.mode !== \"source-i1-camera-textureMatrix-clipPlane-update-order\"",
        "floorCameraState?.cameraOrderMode !== \"source-i1-lookAt-target-far-updateMatrixWorld-copy-projection\"",
        "floorCameraState?.textureMatrixOrderMode !== \"source-i1-bias-multiply-projection-cameraInverse-reflectorMatrixWorld\"",
        "floorCameraState?.clipPlaneOrderMode !== \"source-i1-plane-normal-worldPosition-cameraInverse-oblique-row-write\"",
        "floorCameraState?.stepsMatchExpected !== true",
        "floorCameraState?.cameraCoreOrderMatchesSource !== true",
        "floorCameraState?.textureMatrixOrderMatchesSource !== true",
        "floorCameraState?.clipPlaneOrderMatchesSource !== true",
        "floorCameraState?.runtimeChecksPass !== true",
      ]),
      order: regexAnchorOrder(sourceI1.text, [
        { label: "lookAt", pattern: /this\.virtualCamera\.lookAt\(this\.target\)/ },
        { label: "far", pattern: /this\.virtualCamera\.far=n\.far/ },
        { label: "updateMatrixWorld", pattern: /this\.virtualCamera\.updateMatrixWorld\(\)/ },
        { label: "projectionCopy", pattern: /this\.virtualCamera\.projectionMatrix\.copy\(n\.projectionMatrix\)/ },
        { label: "textureMatrixBias", pattern: /this\.textureMatrix\.set\(\.5,0,0,\.5,0,\.5,0,\.5,0,0,\.5,\.5,0,0,0,1\)/ },
        { label: "textureMatrixProjection", pattern: /this\.textureMatrix\.multiply\(this\.virtualCamera\.projectionMatrix\)/ },
        { label: "textureMatrixCameraInverse", pattern: /this\.textureMatrix\.multiply\(this\.virtualCamera\.matrixWorldInverse\)/ },
        { label: "textureMatrixReflectorWorld", pattern: /this\.textureMatrix\.multiply\(this\.matrixWorld\)/ },
        { label: "reflectorPlane", pattern: /this\.reflectorPlane\.setFromNormalAndCoplanarPoint\(this\.normal,this\.reflectorWorldPosition\)/ },
        { label: "clipPlaneCameraInverse", pattern: /this\.reflectorPlane\.applyMatrix4\(this\.virtualCamera\.matrixWorldInverse\)/ },
        { label: "clipPlaneVector", pattern: /this\.clipPlane\.set\(this\.reflectorPlane\.normal\.x,this\.reflectorPlane\.normal\.y,this\.reflectorPlane\.normal\.z,this\.reflectorPlane\.constant\)/ },
        { label: "clipPlaneScale", pattern: /this\.clipPlane\.multiplyScalar\(2\/this\.clipPlane\.dot\(this\.q\)\)/ },
        { label: "projectionRowWrite", pattern: /i\.elements\[2\]=this\.clipPlane\.x,i\.elements\[6\]=this\.clipPlane\.y,i\.elements\[10\]=this\.clipPlane\.z\+1-this\.clipBias,i\.elements\[14\]=this\.clipPlane\.w/ },
        { label: "saveRendererState", pattern: /const r=e\.getRenderTarget\(\),o=e\.xr\.enabled,a=e\.shadowMap\.autoUpdate/ },
        { label: "disableXrShadow", pattern: /e\.xr\.enabled=!1,e\.shadowMap\.autoUpdate=!1/ },
        { label: "setRenderTargetRaw", pattern: /e\.setRenderTarget\(this\.renderTarget\)/ },
        { label: "depthMask", pattern: /e\.state\.buffers\.depth\.setMask\(!0\)/ },
        { label: "conditionalClear", pattern: /e\.autoClear===!1&&e\.clear\(\)/ },
        { label: "blurLoop", pattern: /for\(let u=0;u<c;u\+\+\)/ },
        { label: "setRenderTargetWrite", pattern: /e\.setRenderTarget\(this\.renderTargetWrite\)/ },
        { label: "swapReadWrite", pattern: /this\.renderTargetRead=this\.renderTargetWrite,this\.renderTargetWrite=l/ },
        { label: "updateRenderTargetUniform", pattern: /this\.renderTargetUniform\.value=this\.renderTargetRead\.texture/ },
        { label: "restoreXrShadowTarget", pattern: /e\.xr\.enabled=o,e\.shadowMap\.autoUpdate=a,e\.setRenderTarget\(r\)/ },
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
      "this.canvasAnimateInPromise = Promise.all([",
      "this.sourceInitLifecyclePromise",
      "this.sourceTexturePreloadPromise",
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
    captureOriginalAssetPreflight: checks(rebuildCapture, [
      "const originalAssetPreflightPaths = [",
      "\"/images/thumbs/thoughtlab.webp\"",
      "\"/images/textures/perlin-1.webp\"",
      "\"/images/textures/floor-normal.webp\"",
      "\"/images/cubemaps/01/px.webp\"",
      "SKIP_ORIGINAL_ASSET_PREFLIGHT",
      "contentType.toLowerCase().startsWith(\"image/\")",
      "original-asset-preflight.json",
      "FALLBACK_ROOT=public",
      "await validateOriginalAssetPreflight();",
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
    defaultRenderTarget: targetSnapshot(localDefaultTarget, expectedDefaultRenderTarget),
    sourceLikeRenderTarget: targetSnapshot(localSourceTarget, expectedSourceDepthlessRenderTarget),
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
          : {
              status: "unavailable",
              reason: "OffscreenCanvas is unavailable in this Node audit environment",
            };
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

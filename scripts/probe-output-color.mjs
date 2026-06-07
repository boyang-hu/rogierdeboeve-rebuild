import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import net from "node:net";

const chromePath = process.env.CHROME_PATH
  || [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Users/boyang/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  ].find((candidate) => existsSync(candidate));

if (!chromePath) {
  throw new Error("Chrome executable not found. Set CHROME_PATH to a Chrome/Chromium binary.");
}

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-output-color-probe");
const port = Number(process.env.CDP_PORT || 9278);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const waitAfter = Number(process.env.PROBE_WAIT || 5200);
const deviceScaleFactor = Number(process.env.DEVICE_SCALE_FACTOR || 1);
const skipScreenshot = process.env.SKIP_SCREENSHOT === "1";
const viewportName = process.env.VIEWPORT || "desktop";
const viewports = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
const viewport = viewports[viewportName] || viewports.desktop;
const rebuildSearchParams = new URL(rebuildUrl).searchParams;
const debugCompositeProbe = rebuildSearchParams.has("debug-composite-stage")
  || rebuildSearchParams.has("debug-composite-darken")
  || rebuildSearchParams.has("debug-composite-transfer")
  || rebuildSearchParams.has("debug-composite-lighten");

function withProbeParams(url) {
  const parsed = new URL(url);
  parsed.searchParams.set("skip-preloader", "");
  parsed.searchParams.set("debug-output-probe", "1");
  return parsed.toString();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForPort(portNumber, timeout = 6000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const socket = net.createConnection({ port: portNumber, host: "127.0.0.1" });
      socket.on("connect", () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout) reject(new Error(`Timed out waiting for ${portNumber}`));
        else setTimeout(probe, 100);
      });
    };
    probe();
  });
}

function send(ws, method, params = {}) {
  const id = ++send.id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      send.pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 15000);
    send.pending.set(id, { resolve, reject, timeout });
  });
}
send.id = 0;
send.pending = new Map();

async function connectWs(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const pending = send.pending.get(message.id);
    if (!pending) return;
    clearTimeout(pending.timeout);
    send.pending.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message));
    else pending.resolve(message.result);
  });
  return ws;
}

async function runProbe() {
  const failures = [];
  const exceptions = [];
  const consoleMessages = [];
  const newTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((res) => res.json());
  const ws = await connectWs(newTarget.webSocketDebuggerUrl);
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.loadingFailed") failures.push(message.params);
    if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails?.text || "Runtime exception");
    if (message.method === "Runtime.consoleAPICalled") {
      consoleMessages.push((message.params.args || []).map((arg) => arg.value || arg.description).join(" "));
    }
  });
  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");
  await send(ws, "Network.enable");
  await send(ws, "Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await send(ws, "Page.navigate", { url: withProbeParams(rebuildUrl) });
  await wait(waitAfter);
  const result = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      body: document.body.className,
      ready: document.readyState,
      active: document.querySelector('[data-project-card].is-active')?.dataset.slug || null,
      probe: window.__rogierOutputProbe || null,
      canvas: [...document.querySelectorAll('canvas')].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return { width: canvas.width, height: canvas.height, rectWidth: rect.width, rectHeight: rect.height };
      })
    })`,
    returnByValue: true,
  });
  const parsed = JSON.parse(result.result.value);
  if (!parsed.probe) throw new Error("No __rogierOutputProbe data found");
  const sourceDefaults = parsed.probe.sourceDefaults || {};
  const sourceDefaultErrors = [];
  if (sourceDefaults.darken !== 0.2) sourceDefaultErrors.push("darken");
  if (sourceDefaults.saturation !== 0.35) sourceDefaultErrors.push("saturation");
  if (sourceDefaults.contrast !== 1.1) sourceDefaultErrors.push("contrast");
  if (sourceDefaults.homeOverviewDarkenFallback !== 0.1) sourceDefaultErrors.push("homeOverviewDarkenFallback");
  if (sourceDefaults.homeOverviewSaturationFallback !== 1) sourceDefaultErrors.push("homeOverviewSaturationFallback");
  if (sourceDefaults.projectDetailDarken !== 0.25) sourceDefaultErrors.push("projectDetailDarken");
  if (sourceDefaults.projectSaturationFallback !== 1) sourceDefaultErrors.push("projectSaturationFallback");
  if (sourceDefaults.projectContrastFallback !== 1.15) sourceDefaultErrors.push("projectContrastFallback");
  if (sourceDefaults.thumbDarknessIntensity !== 0.5) sourceDefaultErrors.push("thumbDarknessIntensity");
  if (sourceDefaults.homeThumbDarknessFallback !== 0) sourceDefaultErrors.push("homeThumbDarknessFallback");
  if (sourceDefaults.thumbDarknessColor !== "#000000") sourceDefaultErrors.push("thumbDarknessColor");
  if (sourceDefaults.thumbSaturation !== 1) sourceDefaultErrors.push("thumbSaturation");
  if (sourceDefaults.thumbMouseLightness !== 1) sourceDefaultErrors.push("thumbMouseLightness");
  if (sourceDefaultErrors.length) {
    throw new Error(`Se/xt source default mismatch: ${sourceDefaultErrors.join(", ")}`);
  }
  const spotlight = parsed.probe.spotlightProjection;
  const spotlightErrors = [];
  if (!spotlight) spotlightErrors.push("missing");
  if (spotlight?.spotlight?.mapMode !== "source-thumb-composite-target") spotlightErrors.push("mapMode");
  if (spotlight?.spotlight?.mapProjectionMode !== "three-r164-spotLightMap-vSpotLightCoord") spotlightErrors.push("mapProjectionMode");
  if (spotlight?.projectionMatrixMode !== "source-SD-SpotLight-map-through-three-shadow-matrix") spotlightErrors.push("projectionMatrixMode");
  if (spotlight?.threeChunkMode !== "r164-lights_fragment_begin-multiplies-directLight-by-spotLightMap") spotlightErrors.push("threeChunkMode");
  if (spotlight?.sampleGridMode !== "source-spotlight-map-3x3-active-bounds") spotlightErrors.push("sampleGridMode");
  if (spotlight?.sampleCount !== 9) spotlightErrors.push("sampleCount");
  if (spotlight?.inMapCount !== 9) spotlightErrors.push("inMapCount");
  if (spotlight?.inMapCoverage !== 1) spotlightErrors.push("inMapCoverage");
  if ((spotlight?.mapLumaMean ?? 0) <= 0) spotlightErrors.push("mapLumaMean");
  const light = spotlight?.spotlight || {};
  if (Math.abs((light.intensity ?? 0) - 220) > 0.001) spotlightErrors.push("intensity");
  if (Math.abs((light.angle ?? 0) - Math.PI / 4) > 0.0001) spotlightErrors.push("angle");
  if (Math.abs((light.penumbra ?? 0) - 0.95) > 0.0001) spotlightErrors.push("penumbra");
  if (JSON.stringify(light.position) !== JSON.stringify([0, 0, 3.7])) spotlightErrors.push(`position=${JSON.stringify(light.position)}`);
  if (JSON.stringify(light.target) !== JSON.stringify([0, 0, -8])) spotlightErrors.push(`target=${JSON.stringify(light.target)}`);
  if (!Array.isArray(light.shadowMatrix) || light.shadowMatrix.length !== 16) spotlightErrors.push("shadowMatrix");
  if (spotlightErrors.length) {
    throw new Error(`Spotlight/thumb projection source-shape mismatch: ${spotlightErrors.join(", ")}`);
  }
  const camera = parsed.probe.camera || {};
  const resizeErrors = [];
  const expectedMobile = viewport.width < 800;
  const expectedOriginZ = expectedMobile ? 5 : 5.5;
  const expectedSceneWrapY = expectedMobile ? 0.3 : 0;
  if (camera.resizeMode !== "source-p1-mobile-origin-sceneWrap") resizeErrors.push("resizeMode");
  if (camera.breakpointMd !== 800) resizeErrors.push("breakpointMd");
  if (camera.mobileResizeBranch !== expectedMobile) resizeErrors.push("mobileResizeBranch");
  if (Math.abs((camera.origin?.[2] ?? 0) - expectedOriginZ) > 0.001) resizeErrors.push("cameraOriginZ");
  if (Math.abs((camera.sceneWrapY ?? 0) - expectedSceneWrapY) > 0.001) resizeErrors.push("sceneWrapY");
  if (resizeErrors.length) {
    throw new Error(`p1.resize source-shape mismatch: ${resizeErrors.join(", ")}`);
  }
  const workSettings = parsed.probe.settings?.work || {};
  const activeMaterial = workSettings.activeMaterial;
  const auxiliaryMaterial = workSettings.auxiliaryMaterial;
  const materialErrors = [];
  if (workSettings.materialStateMode !== "source-VA-meshstandard-default-toneMapped") materialErrors.push("materialStateMode");
  if (workSettings.vertexWorldPositionMode !== "source-HA-unconditional-instance-world") materialErrors.push("vertexWorldPositionMode");
  if (!activeMaterial) materialErrors.push("activeMaterialMissing");
  if (activeMaterial?.toneMapped !== true) materialErrors.push("activeToneMapped");
  if (activeMaterial?.transparent !== true) materialErrors.push("activeTransparent");
  if (activeMaterial?.depthWrite !== false) materialErrors.push("activeDepthWrite");
  if (activeMaterial?.depthTest !== false) materialErrors.push("activeDepthTest");
  if (activeMaterial?.dithering !== true) materialErrors.push("activeDithering");
  if (Math.abs((activeMaterial?.envMapIntensity ?? 0) - 0.75) > 0.001) materialErrors.push("activeEnvMapIntensity");
  if (Math.abs((activeMaterial?.roughness ?? 0) - 1) > 0.001) materialErrors.push("activeRoughness");
  if (Math.abs((activeMaterial?.metalness ?? 0) - 0) > 0.001) materialErrors.push("activeMetalness");
  if (!auxiliaryMaterial) materialErrors.push("auxiliaryMaterialMissing");
  if (auxiliaryMaterial?.toneMapped !== true) materialErrors.push("auxToneMapped");
  if (auxiliaryMaterial?.transparent !== true) materialErrors.push("auxTransparent");
  if (auxiliaryMaterial?.depthWrite !== false) materialErrors.push("auxDepthWrite");
  if (auxiliaryMaterial?.depthTest !== false) materialErrors.push("auxDepthTest");
  if (auxiliaryMaterial?.dithering !== true) materialErrors.push("auxDithering");
  if (Math.abs((auxiliaryMaterial?.envMapIntensity ?? 0) - 0.75) > 0.001) materialErrors.push("auxEnvMapIntensity");
  if (Math.abs((auxiliaryMaterial?.roughness ?? 0) - 1) > 0.001) materialErrors.push("auxRoughness");
  if (Math.abs((auxiliaryMaterial?.metalness ?? 0) - 0) > 0.001) materialErrors.push("auxMetalness");
  if (materialErrors.length) {
    throw new Error(`VA material source-state mismatch: ${materialErrors.join(", ")}`);
  }
  const p1UpdateCulling = workSettings.p1UpdateCulling || {};
  const cullingErrors = [];
  if (p1UpdateCulling.source !== "p1.update-world-position-cull-then-visible-block-update") cullingErrors.push("source");
  if (JSON.stringify(p1UpdateCulling.bounds) !== JSON.stringify({ minX: -5.5, maxX: 5.5, maxZ: 5 })) cullingErrors.push("bounds");
  if (p1UpdateCulling.total !== 10) cullingErrors.push("total");
  if (p1UpdateCulling.sourceVisibilityAllMatch !== true) cullingErrors.push("sourceVisibilityAllMatch");
  if (p1UpdateCulling.visibleUpdateShapeAllMatch !== true) cullingErrors.push("visibleUpdateShapeAllMatch");
  if (!Array.isArray(p1UpdateCulling.items) || p1UpdateCulling.items.length !== p1UpdateCulling.total) cullingErrors.push("items");
  if ((p1UpdateCulling.visibleCount ?? 0) < 1) cullingErrors.push("visibleCount");
  const visibleP1Items = Array.isArray(p1UpdateCulling.items) ? p1UpdateCulling.items.filter((item) => item.visible) : [];
  if (!visibleP1Items.every((item) => item.tMouseSim2IsScreen === true)) cullingErrors.push("visibleTMouseSim2Screen");
  if (!visibleP1Items.every((item) => item.tMouseSimIsLocal === true)) cullingErrors.push("visibleTMouseSimLocal");
  if (parsed.probe.settings?.updateOrder?.frameTail !== "source-main/work-render-then-p1-update-before-wavves-displacement") {
    cullingErrors.push("frameTailOrder");
  }
  if (cullingErrors.length) {
    throw new Error(`p1.update source culling mismatch: ${cullingErrors.join(", ")}`);
  }
  const gaShape = parsed.probe.mouseSimulation?.active?.sourceShape;
  if (gaShape) {
    const shapeErrors = Object.entries(gaShape)
      .filter(([, value]) => typeof value === "boolean" && value !== true)
      .map(([key]) => key);
    if (shapeErrors.length) {
      throw new Error(`GA mouse/ray source-shape mismatch: ${shapeErrors.join(", ")}`);
    }
  }
  const activeMouse = parsed.probe.mouseSimulation?.active;
  if (activeMouse && activeMouse.renderClearMode !== "source-sA-no-explicit-clear") {
    throw new Error(`Ka/sA mouse simulation clear mode mismatch: ${activeMouse.renderClearMode}`);
  }
  const reflectionTargets = parsed.probe.reflectionState?.targets;
  const reflectionErrors = [];
  if (reflectionTargets) {
    if (reflectionTargets.rawClearMode !== "source-i1-conditional-clear-when-autoClear-false") reflectionErrors.push("rawClearMode");
    if (reflectionTargets.cameraProjectionCopyOrder !== "source-updateMatrixWorld-before-projection-copy") reflectionErrors.push("cameraProjectionCopyOrder");
    if (reflectionTargets.blurPassScreenMode !== "source-i1-private-screen-camera") reflectionErrors.push("blurPassScreenMode");
    if (reflectionTargets.sourceCssSized !== true) reflectionErrors.push("sourceCssSized");
  }
  if (reflectionErrors.length) {
    throw new Error(`Floor reflection source-shape mismatch: ${reflectionErrors.join(", ")}`);
  }
  const workRenderSizing = parsed.probe.settings?.work?.renderManagerSizing;
  const mainRenderSizing = parsed.probe.settings?.main?.renderManagerSizing;
  const workClearing = parsed.probe.settings?.work?.renderManagerClearing;
  const mainClearing = parsed.probe.settings?.main?.renderManagerClearing;
  const bloomClearingErrors = [];
  if (workRenderSizing?.bloomPassClearing !== "source-Lu-no-explicit-clear") bloomClearingErrors.push("workBloomPassClearing");
  if (mainRenderSizing?.bloomPassClearing !== "source-Lu-no-explicit-clear") bloomClearingErrors.push("mainBloomPassClearing");
  if (workClearing?.rawPass !== "source-Lu-no-explicit-clear") bloomClearingErrors.push("workRawPassClearing");
  if (workClearing?.blurPass !== "source-Lu-no-explicit-clear") bloomClearingErrors.push("workBlurPassClearing");
  if (workClearing?.compositePass !== "source-Lu-no-explicit-clear") bloomClearingErrors.push("workCompositePassClearing");
  if (mainClearing?.frameStart !== "source-nD-no-explicit-clear") bloomClearingErrors.push("mainFrameStartClearing");
  if (mainClearing?.preCompositePass !== "source-I1-no-explicit-clear") bloomClearingErrors.push("mainPreCompositePassClearing");
  if (mainClearing?.lensflarePass !== "source-I1-lensflare-explicit-clear") bloomClearingErrors.push("mainLensflarePassClearing");
  if (mainClearing?.blurPass !== "source-I1-no-explicit-clear") bloomClearingErrors.push("mainBlurPassClearing");
  if (mainClearing?.fxaaPass !== "source-I1-no-explicit-clear") bloomClearingErrors.push("mainFxaaPassClearing");
  if (bloomClearingErrors.length) {
    throw new Error(`Render-manager clearing source-shape mismatch: ${bloomClearingErrors.join(", ")}`);
  }
  const workOwnership = parsed.probe.settings?.work?.renderManagerOwnership;
  const mainOwnership = parsed.probe.settings?.main?.renderManagerOwnership;
  const ownershipErrors = [];
  if (workOwnership?.source !== "Lu-single-screen-mesh-material-swap") ownershipErrors.push("workSourceOwnership");
  if (workOwnership?.bridge !== "source-single-screen-material-swap") ownershipErrors.push("workBridgeOwnership");
  if (workOwnership?.compositeScreenMode !== "source-work-post-screen") ownershipErrors.push("workCompositeScreenMode");
  if (workOwnership?.productionOutputChanged !== true) ownershipErrors.push("workProductionOutputChanged");
  if (mainOwnership?.source !== "I1-single-screen-mesh-material-swap") ownershipErrors.push("mainSourceOwnership");
  if (mainOwnership?.bridge !== "source-single-screen-material-swap") ownershipErrors.push("mainBridgeOwnership");
  if (mainOwnership?.finalScreenMode !== "source-main-post-screen") ownershipErrors.push("mainFinalScreenMode");
  if (mainOwnership?.productionOutputChanged !== true) ownershipErrors.push("mainProductionOutputChanged");
  if (ownershipErrors.length) {
    throw new Error(`Render-manager ownership attribution mismatch: ${ownershipErrors.join(", ")}`);
  }
  const sizingErrors = [];
  if (workRenderSizing?.bloomStartMode !== "source-Lu-Fa-render-size-div-4") sizingErrors.push("workBloomStartMode");
  if (mainRenderSizing?.bloomStartMode !== "source-I1-Fa-render-size-div-2") sizingErrors.push("mainBloomStartMode");
  if (mainRenderSizing?.fluidSizeMode !== "source-I1-Fa-render-size-div-2-then-div-3") sizingErrors.push("mainFluidSizeMode");
  if (sizingErrors.length) {
    throw new Error(`Render-manager sizing source-shape mismatch: ${sizingErrors.join(", ")}`);
  }
  const targetStateErrors = [];
  const LinearFilter = 1006;
  const RGBAFormat = 1023;
  const UnsignedByteType = 1009;
  const NoColorSpace = "";
  const workTargetState = parsed.probe.settings?.work?.renderTargetState || {};
  const mainTargetState = parsed.probe.settings?.main?.renderTargetState || {};
  function assertDefaultTargetState(board, key, expectedDepth, label) {
    const target = board?.targets?.[key];
    if (!target) {
      targetStateErrors.push(`${label}Missing`);
      return;
    }
    if (target.depthBuffer !== expectedDepth) targetStateErrors.push(`${label}DepthBuffer`);
    if (target.stencilBuffer !== false) targetStateErrors.push(`${label}StencilBuffer`);
    if (target.texture?.colorSpace !== NoColorSpace) targetStateErrors.push(`${label}ColorSpace`);
    if (target.texture?.type !== UnsignedByteType) targetStateErrors.push(`${label}Type`);
    if (target.texture?.format !== RGBAFormat) targetStateErrors.push(`${label}Format`);
    if (target.texture?.minFilter !== LinearFilter) targetStateErrors.push(`${label}MinFilter`);
    if (target.texture?.magFilter !== LinearFilter) targetStateErrors.push(`${label}MagFilter`);
    if (target.texture?.generateMipmaps !== false) targetStateErrors.push(`${label}Mipmaps`);
  }
  if (workTargetState.sourceMode !== "source-Lu-target-state-renderTargetA-depthBuffer-true-clones-false") {
    targetStateErrors.push("workTargetStateMode");
  }
  if (mainTargetState.sourceMode !== "source-I1-target-default-state-depthBuffer-false-clones-false") {
    targetStateErrors.push("mainTargetStateMode");
  }
  assertDefaultTargetState(workTargetState, "renderTargetA", true, "workRenderTargetA");
  for (const key of [
    "renderTargetBright",
    "renderTargetsHorizontal0",
    "renderTargetsVertical0",
    "renderTargetComposite",
    "renderTargetBlurA",
    "renderTargetBlurB",
    "renderTargetFXAA",
  ]) {
    assertDefaultTargetState(workTargetState, key, false, `work${key[0].toUpperCase()}${key.slice(1)}`);
  }
  for (const key of [
    "renderTargetA",
    "renderTargetB",
    "renderTargetLensflare",
    "renderTargetBright",
    "renderTargetsHorizontal0",
    "renderTargetsVertical0",
    "renderTargetComposite",
    "renderTargetBlurA",
    "renderTargetBlurB",
    "renderTargetFXAA",
  ]) {
    assertDefaultTargetState(mainTargetState, key, false, `main${key[0].toUpperCase()}${key.slice(1)}`);
  }
  if (targetStateErrors.length) {
    throw new Error(`Render-target source-state mismatch: ${targetStateErrors.join(", ")}`);
  }
  const materialSurfaceErrors = [];
  const preCompositeUniforms = parsed.probe.uniforms?.preComposite;
  const workCompositeUniforms = parsed.probe.uniforms?.composite;
  const mainCompositeUniforms = parsed.probe.uniforms?.mainComposite;
  const passMaterials = parsed.probe.uniforms?.passMaterials || {};
  if (preCompositeUniforms?.materialMode !== "source-C1-raw-glsl3") materialSurfaceErrors.push("preCompositeMaterialMode");
  if (preCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("preCompositeGlslVersion");
  const expectedWorkCompositeMaterialMode = debugCompositeProbe ? "debug-OA-raw-glsl3" : "source-OA-raw-glsl3";
  if (workCompositeUniforms?.materialMode !== expectedWorkCompositeMaterialMode) materialSurfaceErrors.push("workCompositeMaterialMode");
  if (workCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("workCompositeGlslVersion");
  if (!debugCompositeProbe && workCompositeUniforms?.debugShaderActive !== false) materialSurfaceErrors.push("workCompositeDebugShaderActive");
  if (!debugCompositeProbe && workCompositeUniforms?.productionShaderIsSourceSurface !== true) materialSurfaceErrors.push("workCompositeProductionShader");
  const workCompositeSurface = workCompositeUniforms?.shaderSurface || {};
  if (workCompositeSurface.formulaMode !== "source-CA-mixed-blend-surface") materialSurfaceErrors.push("workCompositeFormulaMode");
  if (workCompositeSurface.blendEntry !== "source-Po-blend") materialSurfaceErrors.push("workCompositeBlendEntry");
  if (workCompositeSurface.hasLuminanceHelper !== true) materialSurfaceErrors.push("workCompositeLuminanceHelper");
  if (workCompositeSurface.hasVignetteHelper !== true) materialSurfaceErrors.push("workCompositeVignetteHelper");
  if (workCompositeSurface.hasSourceVignetteLocals !== true) materialSurfaceErrors.push("workCompositeVignetteLocals");
  if (workCompositeSurface.hasInertColorLocals !== true) materialSurfaceErrors.push("workCompositeInertColorLocals");
  if (workCompositeSurface.usesMixedVariable !== true) materialSurfaceErrors.push("workCompositeMixedVariable");
  if (workCompositeSurface.usesSourceBlendEntry !== true) materialSurfaceErrors.push("workCompositeSourceBlendEntry");
  if (workCompositeSurface.usesRebuildSourceBlendEntry !== false) materialSurfaceErrors.push("workCompositeRebuildBlendEntry");
  if (mainCompositeUniforms?.materialMode !== "source-lA-raw-glsl3") materialSurfaceErrors.push("mainCompositeMaterialMode");
  if (mainCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("mainCompositeGlslVersion");
  const lensflareUniforms = parsed.probe.uniforms?.lensflare;
  if (lensflareUniforms?.materialMode !== "source-L1-raw-glsl3") materialSurfaceErrors.push("lensflareMaterialMode");
  if (lensflareUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("lensflareGlslVersion");
  if (lensflareUniforms?.enabled !== false) materialSurfaceErrors.push("lensflareDefaultEnabled");
  if (lensflareUniforms?.clearMode !== "source-I1-lensflare-explicit-clear") materialSurfaceErrors.push("lensflareClearMode");
  if (JSON.stringify(lensflareUniforms?.lightPosition) !== JSON.stringify([0.5, 0.5])) materialSurfaceErrors.push("lensflareLightPosition");
  if (JSON.stringify(lensflareUniforms?.scale) !== JSON.stringify([1.5, 1.5])) materialSurfaceErrors.push("lensflareScale");
  if (lensflareUniforms?.exposure !== 1) materialSurfaceErrors.push("lensflareExposure");
  if (lensflareUniforms?.clamp !== 1) materialSurfaceErrors.push("lensflareClamp");
  for (const [key, expectedMode] of Object.entries({
    mediaComposite: "source-W1-raw-glsl3",
    luminosity: "source-sg-raw-glsl3",
    bloomBlur: "source-rg-raw-glsl3",
    bloomComposite: "source-cg-raw-glsl3",
    mainBloomBlur: "source-rg-raw-glsl3",
    mainBloomComposite: "source-cg-raw-glsl3",
    fxaa: "source-ig-raw-glsl3",
  })) {
    if (passMaterials[key]?.materialMode !== expectedMode) materialSurfaceErrors.push(`${key}MaterialMode`);
    if (passMaterials[key]?.glslVersion !== "300 es") materialSurfaceErrors.push(`${key}GlslVersion`);
  }
  const expectedBloomKernels = [3, 5, 7, 9, 11];
  for (const key of ["bloomBlur", "mainBloomBlur"]) {
    const material = passMaterials[key];
    if (material?.materialCount !== expectedBloomKernels.length) materialSurfaceErrors.push(`${key}MaterialCount`);
    if (JSON.stringify(material?.kernelDefines) !== JSON.stringify(expectedBloomKernels)) materialSurfaceErrors.push(`${key}KernelDefines`);
    if (JSON.stringify(material?.sigmaDefines) !== JSON.stringify(expectedBloomKernels)) materialSurfaceErrors.push(`${key}SigmaDefines`);
    if (material?.runtimeKernelUniforms !== false) materialSurfaceErrors.push(`${key}RuntimeKernelUniforms`);
  }
  for (const key of ["bloomComposite", "mainBloomComposite"]) {
    const material = passMaterials[key];
    if (material?.uniformMode !== "source-cg-tBlur-uBloomFactors") materialSurfaceErrors.push(`${key}UniformMode`);
    if (material?.numMipsDefine !== 5) materialSurfaceErrors.push(`${key}NumMipsDefine`);
    if (material?.ditheringDefine != null) materialSurfaceErrors.push(`${key}DitheringDefine`);
    if (material?.hasBloomFactorsArray !== true) materialSurfaceErrors.push(`${key}BloomFactorsArray`);
    if (material?.hasSourceBlurUniforms !== true) materialSurfaceErrors.push(`${key}SourceBlurUniforms`);
    if (material?.hasRebuildBloomUniforms !== false) materialSurfaceErrors.push(`${key}RebuildBloomUniforms`);
    if (material?.hasRebuildFactorUniforms !== false) materialSurfaceErrors.push(`${key}RebuildFactorUniforms`);
  }
  const standardBlur = passMaterials.standardBlur || {};
  for (const key of ["horizontal", "vertical"]) {
    const material = standardBlur[key];
    if (material?.materialMode !== "source-Na-raw-glsl3") materialSurfaceErrors.push(`standardBlur${key}MaterialMode`);
    if (material?.glslVersion !== "300 es") materialSurfaceErrors.push(`standardBlur${key}GlslVersion`);
    if (material?.blending !== 0) materialSurfaceErrors.push(`standardBlur${key}Blending`);
    if (material?.hasBlurinessUniform !== true) materialSurfaceErrors.push(`standardBlur${key}BlurinessUniform`);
    if (material?.hasKernelDefines !== false) materialSurfaceErrors.push(`standardBlur${key}KernelDefines`);
  }
  if (JSON.stringify(standardBlur.horizontal?.direction) !== JSON.stringify([1, 0])) materialSurfaceErrors.push("standardBlurHorizontalDirection");
  if (JSON.stringify(standardBlur.vertical?.direction) !== JSON.stringify([0, 1])) materialSurfaceErrors.push("standardBlurVerticalDirection");
  if (passMaterials.fxaa?.vertexMode !== "source-FT-neighbor-uv") materialSurfaceErrors.push("fxaaVertexMode");
  const displacement = passMaterials.displacement || {};
  const rendererSize = parsed.probe.renderer?.size || {};
  const expectedDisplacementSize = Math.max(1, Math.round((rendererSize.height || 0) / 10));
  if (displacement.materialMode !== "source-N1-raw-glsl3") materialSurfaceErrors.push("displacementMaterialMode");
  if (displacement.glslVersion !== "300 es") materialSurfaceErrors.push("displacementGlslVersion");
  if (displacement.blending !== 0) materialSurfaceErrors.push("displacementBlending");
  if (displacement.vertexMode !== "source-tl-matrix-fullscreen") materialSurfaceErrors.push("displacementVertexMode");
  if (displacement.clearMode !== "source-Lo-no-explicit-clear") materialSurfaceErrors.push("displacementClearMode");
  if (displacement.tSceneBound !== true) materialSurfaceErrors.push("displacementTSceneBound");
  if (displacement.vignetteConstantsMode !== "source-F1-globals") materialSurfaceErrors.push("displacementVignetteConstants");
  if (displacement.toneMapped !== false) materialSurfaceErrors.push("displacementToneMapped");
  if (displacement.transparent !== true) materialSurfaceErrors.push("displacementTransparent");
  if (displacement.targetSize && (
    displacement.targetSize.width !== expectedDisplacementSize ||
    displacement.targetSize.height !== expectedDisplacementSize
  )) {
    materialSurfaceErrors.push("displacementTargetSize");
  }
  const mainFluidMaterials = parsed.probe.mainFluid?.materialSurface || {};
  for (const [key, expectedMode] of Object.entries({
    advection: "source-GT-raw-glsl3",
    advectionBounds: "source-GT-bounds-raw-glsl3",
    force: "source-qT-raw-glsl3",
    divergence: "source-jT-raw-glsl3",
    poisson: "source-KT-raw-glsl3",
    pressure: "source-JT-raw-glsl3",
  })) {
    if (mainFluidMaterials[key]?.materialMode !== expectedMode) materialSurfaceErrors.push(`mainFluid${key}MaterialMode`);
    if (mainFluidMaterials[key]?.glslVersion !== "300 es") materialSurfaceErrors.push(`mainFluid${key}GlslVersion`);
    if (mainFluidMaterials[key]?.depthWrite !== false) materialSurfaceErrors.push(`mainFluid${key}DepthWrite`);
    if (mainFluidMaterials[key]?.depthTest !== false) materialSurfaceErrors.push(`mainFluid${key}DepthTest`);
  }
  for (const key of ["advection", "divergence", "poisson", "pressure"]) {
    if (mainFluidMaterials[key]?.blending !== 0) materialSurfaceErrors.push(`mainFluid${key}Blending`);
  }
  if (mainFluidMaterials.advectionBounds?.blending !== 0) materialSurfaceErrors.push("mainFluidAdvectionBoundsBlending");
  if (mainFluidMaterials.advectionBounds?.sharedUniforms !== true) materialSurfaceErrors.push("mainFluidAdvectionBoundsSharedUniforms");
  if (mainFluidMaterials.advectionBounds?.sceneChildren !== 2) materialSurfaceErrors.push("mainFluidAdvectionBoundsSceneChildren");
  if (mainFluidMaterials.force?.blending !== 2) materialSurfaceErrors.push("mainFluidForceBlending");
  const mainFluidTargets = parsed.probe.mainFluid?.targets || {};
  for (const key of ["main", "velocity", "divergence", "pressureA", "pressureB"]) {
    if (mainFluidTargets[key]?.texture?.type !== 1015) materialSurfaceErrors.push(`mainFluid${key}FloatType`);
    if (mainFluidTargets[key]?.depthBuffer !== false) materialSurfaceErrors.push(`mainFluid${key}DepthBuffer`);
    if (mainFluidTargets[key]?.stencilBuffer !== false) materialSurfaceErrors.push(`mainFluid${key}StencilBuffer`);
  }
  if (materialSurfaceErrors.length) {
    throw new Error(`Composite material source-shape mismatch: ${materialSurfaceErrors.join(", ")}`);
  }
  const updateOrder = parsed.probe.settings?.updateOrder;
  if (updateOrder?.environmentUpdateOrder !== "source-p1-component-post-render") {
    throw new Error(`Environment update-order source-shape mismatch: ${updateOrder?.environmentUpdateOrder || "missing"}`);
  }
  const diagnostics = parsed.probe.settings?.diagnostics;
  if (diagnostics?.productionDebugClean !== true) {
    throw new Error(`Production debug branch leaked into output probe: ${JSON.stringify(diagnostics || {})}`);
  }
  const environmentUniforms = parsed.probe.uniforms?.environment;
  const environmentHierarchy = parsed.probe.reflectionState?.environment;
  const environmentErrors = [];
  if (environmentUniforms?.materialMode !== "source-u1-meshstandard-onBeforeCompile") environmentErrors.push("materialMode");
  if (environmentUniforms?.customUniformsAlias !== true) environmentErrors.push("customUniformsAlias");
  if (environmentUniforms?.hierarchyMode !== "source-h1-group-owns-transform") environmentErrors.push("hierarchyMode");
  if (environmentUniforms?.updateMode !== "source-h1-material-update-only") environmentErrors.push("updateMode");
  if (environmentUniforms?.rotationMode !== "source-p1-demorgen-initial-adjustment-only") environmentErrors.push("rotationMode");
  if (environmentUniforms && Math.abs((environmentUniforms.speed ?? 0) - 0.00005) > 0.0000001) environmentErrors.push("speed");
  if (environmentUniforms?.geometry?.mode !== "source-Du-icosahedron") environmentErrors.push("geometryMode");
  if (environmentUniforms?.geometry?.type !== "IcosahedronGeometry") environmentErrors.push("geometryType");
  if (environmentUniforms?.geometry && Math.abs((environmentUniforms.geometry.radius ?? 0) - 300) > 0.0001) environmentErrors.push("geometryRadius");
  if (environmentUniforms?.geometry?.detail !== 10) environmentErrors.push("geometryDetail");
  if (environmentUniforms?.fog !== false) environmentErrors.push("materialFog");
  if (environmentUniforms?.dithering !== true) environmentErrors.push("materialDithering");
  if (environmentUniforms && Math.abs((environmentUniforms.envMapIntensity ?? 0) - 1) > 0.0001) environmentErrors.push("envMapIntensity");
  if (environmentUniforms && Math.abs((environmentUniforms.groupPositionY ?? 0) + 12.65) > 0.0001) environmentErrors.push("groupPositionY");
  if (environmentUniforms && Math.abs(environmentUniforms.meshPositionY ?? 0) > 0.0001) environmentErrors.push("meshPositionY");
  if (environmentUniforms && Math.abs(environmentUniforms.meshRotationY ?? 0) > 0.0001) environmentErrors.push("meshRotationY");
  if (environmentHierarchy?.group?.children !== 1) environmentErrors.push("groupChildren");
  if (environmentHierarchy?.object?.position?.[1] !== 0) environmentErrors.push("meshLocalPosition");
  if (environmentHierarchy?.geometry?.mode !== "source-Du-icosahedron") environmentErrors.push("reflectionGeometryMode");
  if (environmentHierarchy?.geometry?.type !== "IcosahedronGeometry") environmentErrors.push("reflectionGeometryType");
  if (environmentHierarchy?.geometry && Math.abs((environmentHierarchy.geometry.radius ?? 0) - 300) > 0.0001) environmentErrors.push("reflectionGeometryRadius");
  if (environmentHierarchy?.geometry?.detail !== 10) environmentErrors.push("reflectionGeometryDetail");
  if (environmentHierarchy?.material?.mode !== "source-u1-meshstandard-onBeforeCompile") environmentErrors.push("reflectionMaterialMode");
  if (environmentHierarchy?.material?.customUniformsAlias !== true) environmentErrors.push("reflectionCustomUniformsAlias");
  if (environmentErrors.length) {
    throw new Error(`Environment hierarchy source-shape mismatch: ${environmentErrors.join(", ")}`);
  }
  const floorUniforms = parsed.probe.uniforms?.floor;
  const floorErrors = [];
  if (floorUniforms?.reflectionVisibilityMode !== "source-a1-onBeforeRender-hide-component-group") floorErrors.push("reflectionVisibilityMode");
  if (floorUniforms?.materialMode !== "source-o1-raw-glsl3") floorErrors.push("materialMode");
  if (floorUniforms?.reflectionBlurMode !== "source-t1-raw-glsl3") floorErrors.push("reflectionBlurMode");
  if (floorUniforms?.shaderBranches?.normalMap !== true) floorErrors.push("floorNormalMapBranch");
  if (floorUniforms?.shaderBranches?.map !== false) floorErrors.push("floorMapBranch");
  if (floorUniforms?.shaderBranches?.fog !== false) floorErrors.push("floorFogBranch");
  if (floorUniforms?.shaderBranches?.dithering !== false) floorErrors.push("floorDitheringBranch");
  if (parsed.probe.reflectionState?.floor?.material?.mode !== "source-o1-raw-glsl3") floorErrors.push("reflectionFloorMaterialMode");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.normalMap !== true) floorErrors.push("reflectionNormalMapBranch");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.map !== false) floorErrors.push("reflectionMapBranch");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.fog !== false) floorErrors.push("reflectionFogBranch");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.dithering !== false) floorErrors.push("reflectionDitheringBranch");
  if (reflectionTargets?.blurMaterialMode !== "source-t1-raw-glsl3") floorErrors.push("blurMaterialMode");
  if (reflectionTargets?.blurPassScreenMode !== "source-i1-private-screen-camera") floorErrors.push("blurPassScreenMode");
  if (reflectionTargets?.floorVisibilityMode !== "source-a1-onBeforeRender-hide-component-group") floorErrors.push("floorVisibilityMode");
  if (reflectionTargets?.clipBias !== 0) floorErrors.push("clipBias");
  if (reflectionTargets?.blurSwapMode !== "source-i1-write-target-loop-swap") floorErrors.push("blurSwapMode");
  if (reflectionTargets?.renderTargetUniformMode !== "source-i1-update-after-each-blur-swap") floorErrors.push("renderTargetUniformMode");
  if (floorErrors.length) {
    throw new Error(`Floor reflection visibility source-shape mismatch: ${floorErrors.join(", ")}`);
  }
  const skyUniforms = parsed.probe.textures?.skyComposite?.uniforms;
  const skyComposite = parsed.probe.textures?.skyComposite;
  const skyTarget = parsed.probe.targets?.skyComposite;
  const skyUniformErrors = [];
  if (skyComposite?.materialMode !== "source-z1-raw-glsl3") skyUniformErrors.push("materialMode");
  if (skyComposite?.glslVersion !== "300 es") skyUniformErrors.push("glslVersion");
  if (skyComposite?.vertexMode !== "source-tl-matrix-fullscreen") skyUniformErrors.push("vertexMode");
  if (skyComposite?.sizingMode !== "source-V1-height-0.75-square") skyUniformErrors.push("sizingMode");
  if (skyComposite?.timeMode !== (parsed.probe.renderer?.dprPolicy?.lowRes ? "source-V1-low-res-time-0" : "source-V1-live-time")) skyUniformErrors.push("timeMode");
  if (skyTarget && skyComposite && (skyTarget.width !== skyComposite.expectedSize || skyTarget.height !== skyComposite.expectedSize)) skyUniformErrors.push("targetSize");
  const RepeatWrapping = 1000;
  if (skyComposite?.wrapMode !== "source-nD-sky-composite-repeat-for-work-env") skyUniformErrors.push("skyCompositeWrapMode");
  if (skyComposite?.wrapS !== RepeatWrapping || skyComposite?.wrapT !== RepeatWrapping) skyUniformErrors.push("sourceNdSkyCompositeRepeatWrap");
  if (skyUniforms?.uShader1Mix3Binding !== "source-declared-only") skyUniformErrors.push("uShader1Mix3Binding");
  if (skyUniforms?.uShader3ScaleBinding !== "source-declared-only") skyUniformErrors.push("uShader3ScaleBinding");
  if (skyUniforms?.uShaderMix !== null) skyUniformErrors.push("uShaderMixValue");
  if (skyUniforms?.uShaderMixMode !== "source-Zs-missing-SHADER_1_MIX_3") skyUniformErrors.push("uShaderMixMode");
  if (skyUniformErrors.length) {
    throw new Error(`Sky composite uniform binding source-shape mismatch: ${skyUniformErrors.join(", ")}`);
  }
  const MirroredRepeatWrapping = 1002;
  const textures = parsed.probe.textures || {};
  const textureWrappingErrors = [];
  if (textures.noise?.wrapS !== RepeatWrapping || textures.noise?.wrapT !== RepeatWrapping) textureWrappingErrors.push("blueNoise");
  if (textures.floorNormal?.wrapS !== RepeatWrapping || textures.floorNormal?.wrapT !== RepeatWrapping) textureWrappingErrors.push("floorNormal");
  if (textures.perlin?.wrapS !== RepeatWrapping || textures.perlin?.wrapT !== RepeatWrapping) textureWrappingErrors.push("perlin2");
  if (textures.workPerlin?.wrapS !== MirroredRepeatWrapping || textures.workPerlin?.wrapT !== MirroredRepeatWrapping) textureWrappingErrors.push("perlin1");
  if (textureWrappingErrors.length) {
    throw new Error(`Texture wrapping source-shape mismatch: ${textureWrappingErrors.join(", ")}`);
  }
  const shaderConsoleMessages = consoleMessages.filter((message) => /Shader Error|WebGLProgram|exception/i.test(message));
  if (shaderConsoleMessages.length) {
    throw new Error(`Shader/WebGL console errors: ${shaderConsoleMessages.join("\n")}`);
  }
  let screenshotFile = null;
  if (!skipScreenshot) {
    const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    screenshotFile = path.join(outDir, "rebuild-home-output-probe.png");
    writeFileSync(screenshotFile, Buffer.from(screenshot.data, "base64"));
  }
  ws.close();
  return {
    screenshot: screenshotFile,
    ...parsed,
    failures: failures.filter((failure) => !failure.canceled).map((failure) => ({ type: failure.type, errorText: failure.errorText })),
    exceptions,
    consoleMessages: shaderConsoleMessages,
  };
}

mkdirSync(outDir, { recursive: true });

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  "--headless=new",
  "--use-gl=swiftshader",
  "--enable-unsafe-swiftshader",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${path.join(tmpdir(), `rogier-output-probe-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const summary = await runProbe();
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  chrome.kill("SIGTERM");
}

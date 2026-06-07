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
  const expectedMobile = viewport.width < 800;
  const expectedSpotlightY = expectedMobile ? 0.3 : 0;
  const expectedSpotlightPosition = [0, expectedSpotlightY, 3.7];
  if (JSON.stringify(light.position) !== JSON.stringify(expectedSpotlightPosition)) spotlightErrors.push(`position=${JSON.stringify(light.position)}`);
  if (JSON.stringify(light.target) !== JSON.stringify([0, 0, -8])) spotlightErrors.push(`target=${JSON.stringify(light.target)}`);
  if (!Array.isArray(light.shadowMatrix) || light.shadowMatrix.length !== 16) spotlightErrors.push("shadowMatrix");
  if (spotlightErrors.length) {
    throw new Error(`Spotlight/thumb projection source-shape mismatch: ${spotlightErrors.join(", ")}`);
  }
  const camera = parsed.probe.camera || {};
  const resizeErrors = [];
  const expectedOriginZ = expectedMobile ? 5 : 5.5;
  const expectedSceneWrapY = expectedMobile ? 0.3 : 0;
  if (camera.resizeMode !== "source-p1-mobile-origin-sceneWrap") resizeErrors.push("resizeMode");
  if (camera.breakpointMd !== 800) resizeErrors.push("breakpointMd");
  if (camera.mobileResizeBranch !== expectedMobile) resizeErrors.push("mobileResizeBranch");
  if (Math.abs((camera.origin?.[2] ?? 0) - expectedOriginZ) > 0.001) resizeErrors.push("cameraOriginZ");
  if (Math.abs((camera.sceneWrapY ?? 0) - expectedSceneWrapY) > 0.001) resizeErrors.push("sceneWrapY");
  if (camera.controllerMode !== "source-IT-three-group-matrix-decompose") resizeErrors.push("controllerMode");
  if (camera.mouseInitialMode !== "source-IT-documentElement-center") resizeErrors.push("mouseInitialMode");
  if (camera.updateLerpMode !== "source-IT-min-Fn-2-over-fps60-0-2-times-0_01") resizeErrors.push("updateLerpMode");
  if (camera.updateTargetMode !== "source-IT-origin-plus-targetXY-and-y-z-depth-coupling") resizeErrors.push("updateTargetMode");
  if (camera.entrySettingsMode !== "source-SD-yD-targetXY-1-0_5-rotateAngle-20") resizeErrors.push("entrySettingsMode");
  if (camera.matrixMode !== "source-IT-group-rotateGroup-innerGroup-manual-matrices") resizeErrors.push("matrixMode");
  if (Math.abs((camera.targetXY?.[0] ?? 0) - 1) > 0.001) resizeErrors.push("targetXYX");
  if (Math.abs((camera.targetXY?.[1] ?? 0) - 0.5) > 0.001) resizeErrors.push("targetXYY");
  if (Math.abs((camera.rotateAngle ?? 0) - 20) > 0.001) resizeErrors.push("rotateAngle");
  if (!Array.isArray(camera.controllerPosition) || camera.controllerPosition.length !== 3) resizeErrors.push("controllerPosition");
  if (!Array.isArray(camera.rotateGroupRotation) || camera.rotateGroupRotation.length !== 3) resizeErrors.push("rotateGroupRotation");
  if (Math.abs((camera.rotateGroupRotation?.[1] ?? 0) - Math.PI) > 0.001) resizeErrors.push("rotateGroupRotationY");
  if ((camera.lastLerp ?? 0) <= 0 || (camera.lastLerp ?? 0) > 0.021) resizeErrors.push("lastLerp");
  if (!Array.isArray(camera.mousePixels) || camera.mousePixels.length !== 2) resizeErrors.push("mousePixels");
  if (!Array.isArray(camera.mouseDeltaPixels) || camera.mouseDeltaPixels.length !== 2) resizeErrors.push("mouseDeltaPixels");
  if (resizeErrors.length) {
    throw new Error(`p1.resize/IT camera source-shape mismatch: ${resizeErrors.join(", ")}`);
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
  if (!visibleP1Items.every((item) => item.sourceGAUpdateMode === "source-GA-update-material-then-local-Ka-then-bindings-before-p1-side-reveal")) cullingErrors.push("sourceGAUpdateMode");
  if (!visibleP1Items.every((item) => item.uCoordsMatchesWorkTarget === true)) cullingErrors.push("uCoordsMatchesWorkTarget");
  if (!visibleP1Items.every((item) => item.mousePlaneTimeMatchesMaterialTime === true)) cullingErrors.push("mousePlaneTime");
  if (!visibleP1Items.every((item) => item.tDisplacementIsWavves === true)) cullingErrors.push("tDisplacement");
  if (!visibleP1Items.every((item) => item.uMouseSpeedMatchesLocal === true)) cullingErrors.push("uMouseSpeed");
  if (parsed.probe.settings?.updateOrder?.frameTail !== "source-work-renderManager-then-p1-update-before-main") {
    cullingErrors.push("frameTailOrder");
  }
  if (cullingErrors.length) {
    throw new Error(`p1.update source culling mismatch: ${cullingErrors.join(", ")}`);
  }
  const gaShape = parsed.probe.mouseSimulation?.active?.sourceShape;
  const screenMouse = parsed.probe.mouseSimulation?.screen;
  const activeMouse = parsed.probe.mouseSimulation?.active;
  const FloatType = 1015;
  const LinearFilter = 1006;
  const RGBAFormat = 1023;
  const ClampToEdgeWrapping = 1001;
  const uniformSurfaceErrors = [];
  for (const [label, mouse] of [["screen", screenMouse], ["active", activeMouse]]) {
    if (mouse?.uniformSurfaceMode !== "source-Ka-simulationMaterial-uniform-surface") uniformSurfaceErrors.push(`${label}UniformSurfaceMode`);
    if (mouse?.hasNoiseTexture !== true) uniformSurfaceErrors.push(`${label}NoiseTexture`);
    if (mouse?.noiseTextureIsBlueNoise !== true) uniformSurfaceErrors.push(`${label}NoiseTextureBinding`);
    if (mouse?.diffusion !== 0) uniformSurfaceErrors.push(`${label}Diffusion`);
    if (mouse?.diffusionSize !== 0) uniformSurfaceErrors.push(`${label}DiffusionSize`);
    if (JSON.stringify(mouse?.color) !== JSON.stringify([1, 1, 1])) uniformSurfaceErrors.push(`${label}Color`);
    const target = mouse?.targetState;
    if (!target) uniformSurfaceErrors.push(`${label}TargetState`);
    if (target?.depthBuffer !== false) uniformSurfaceErrors.push(`${label}TargetDepth`);
    if (target?.stencilBuffer !== false) uniformSurfaceErrors.push(`${label}TargetStencil`);
    if (target?.texture?.wrapS !== ClampToEdgeWrapping) uniformSurfaceErrors.push(`${label}TargetWrapS`);
    if (target?.texture?.wrapT !== ClampToEdgeWrapping) uniformSurfaceErrors.push(`${label}TargetWrapT`);
    if (target?.texture?.minFilter !== LinearFilter) uniformSurfaceErrors.push(`${label}TargetMinFilter`);
    if (target?.texture?.magFilter !== LinearFilter) uniformSurfaceErrors.push(`${label}TargetMagFilter`);
    if (target?.texture?.format !== RGBAFormat) uniformSurfaceErrors.push(`${label}TargetFormat`);
    if (target?.texture?.type !== FloatType) uniformSurfaceErrors.push(`${label}TargetType`);
    if (target?.texture?.generateMipmaps !== false) uniformSurfaceErrors.push(`${label}TargetMipmaps`);
  }
  if (uniformSurfaceErrors.length) {
    throw new Error(`Ka simulation uniform source-shape mismatch: ${uniformSurfaceErrors.join(", ")}`);
  }
  if (gaShape) {
    const shapeErrors = Object.entries(gaShape)
      .filter(([, value]) => typeof value === "boolean" && value !== true)
      .map(([key]) => key);
    if (gaShape.targetSizingMode !== "source-GA-resize-plane-scale-no-pre-rounding") shapeErrors.push("targetSizingMode");
    if (gaShape.updateLerpMode !== "source-Ka-newPos-lerp-targetPos-delta-times-7_5-no-clamp") shapeErrors.push("updateLerpMode");
    if (gaShape.raycastMode !== "source-Ka-onMouseMove-per-item-raycast-immediate-pointer") shapeErrors.push("raycastMode");
    if (gaShape.raycastEventMode !== "source-Ka-raycast-during-mousemove-not-raf-tail") shapeErrors.push("raycastEventMode");
    if (gaShape.raycastNormalizationMode !== "source-Pe-width-height") shapeErrors.push("raycastNormalizationMode");
    if (shapeErrors.length) {
      throw new Error(`GA mouse/ray source-shape mismatch: ${shapeErrors.join(", ")}`);
    }
  }
  if (activeMouse?.raycastMode !== "source-Ka-onMouseMove-per-item-raycast-immediate-pointer") {
    throw new Error(`GA/Ka raycast mode mismatch: ${activeMouse?.raycastMode || "missing"}`);
  }
  if (activeMouse?.raycastEventMode !== "source-Ka-raycast-during-mousemove-not-raf-tail") {
    throw new Error(`GA/Ka raycast event mode mismatch: ${activeMouse?.raycastEventMode || "missing"}`);
  }
  if (activeMouse?.raycastNormalizationMode !== "source-Pe-width-height") {
    throw new Error(`GA/Ka raycast normalization mismatch: ${activeMouse?.raycastNormalizationMode || "missing"}`);
  }
  if (activeMouse?.allVisibleHaveIndependentTargets !== true) {
    throw new Error("GA/Ka visible item target ownership mismatch");
  }
  if (!Array.isArray(activeMouse?.visibleTargets) || activeMouse.visibleTargets.length !== activeMouse.visibleWorkItemCount) {
    throw new Error("GA/Ka visible target list mismatch");
  }
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
  const mainSettings = parsed.probe.settings?.main || {};
  const ownershipErrors = [];
  if (workOwnership?.source !== "Lu-single-screen-mesh-material-swap") ownershipErrors.push("workSourceOwnership");
  if (workOwnership?.bridge !== "source-single-screen-material-swap") ownershipErrors.push("workBridgeOwnership");
  if (workOwnership?.compositeScreenMode !== "source-work-post-screen") ownershipErrors.push("workCompositeScreenMode");
  if (workOwnership?.productionOutputChanged !== true) ownershipErrors.push("workProductionOutputChanged");
  if (mainOwnership?.source !== "I1-single-screen-mesh-material-swap") ownershipErrors.push("mainSourceOwnership");
  if (mainOwnership?.bridge !== "source-single-screen-material-swap") ownershipErrors.push("mainBridgeOwnership");
  if (mainOwnership?.finalScreenMode !== "source-main-post-screen") ownershipErrors.push("mainFinalScreenMode");
  if (mainOwnership?.defaultScreenMaterialMode !== "source-I1-default-direct-C1-screen-render-fxaa-tail-only") ownershipErrors.push("mainDefaultScreenMaterialMode");
  if (mainOwnership?.preCompositeTargetRole !== "qa-mirror-of-source-renderTargetComposite-not-default-screen-output") {
    ownershipErrors.push("mainPreCompositeTargetRole");
  }
  if (mainOwnership?.productionOutputChanged !== true) ownershipErrors.push("mainProductionOutputChanged");
  if (mainSettings?.mainRawSceneMode !== "source-U1-empty-main-scene-background-D9D9D9-linear-to-srgb") {
    ownershipErrors.push("mainRawSceneMode");
  }
  const mainPassInputs = mainSettings?.renderManagerPassInputs || {};
  for (const [key, expected] of Object.entries({
    blurSource: "source-I1-renderTargetA",
    lensflareSource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
    luminositySource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
    bloomSource: "source-I1-renderTargetBright-if-luminosity-else-renderTargetA",
    c1SceneSource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
    c1BloomSource: "source-I1-renderTargetsHorizontal0",
  })) {
    if (mainPassInputs[key] !== expected) ownershipErrors.push(`mainPassInput-${key}`);
  }
  if (mainPassInputs.noPostC1Bloom !== true) ownershipErrors.push("mainPassInput-noPostC1Bloom");
  const sourceMainBackground = mainSettings?.mainRawSceneBackground || [];
  if (!Array.isArray(sourceMainBackground) || sourceMainBackground.some((value) => Math.abs(value - 0.8509825995357807) > 0.0001)) {
    ownershipErrors.push("mainRawSceneBackground");
  }
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
  const mainRawProbe = parsed.probe.targets?.mainRaw;
  const preCompositeProbe = parsed.probe.targets?.preComposite;
  if (!mainRawProbe || typeof mainRawProbe.width !== "number" || !mainRawProbe.texture || !mainRawProbe.stats) {
    targetStateErrors.push("mainRawTargetProbe");
  }
  if (!preCompositeProbe || typeof preCompositeProbe.width !== "number" || !preCompositeProbe.texture || !preCompositeProbe.stats) {
    targetStateErrors.push("preCompositeTargetProbe");
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
  if (preCompositeUniforms?.tSceneSourceMode !== "source-I1-renderTargetA-raw-main-scene") materialSurfaceErrors.push("preCompositeSceneSourceMode");
  if (preCompositeUniforms?.tSceneIsMainRawTarget !== true) materialSurfaceErrors.push("preCompositeSceneMainRawBinding");
  if (preCompositeUniforms?.tSceneIsCompositeTarget !== false) materialSurfaceErrors.push("preCompositeSceneCompositeSelfBinding");
  const expectedWorkCompositeMaterialMode = debugCompositeProbe ? "debug-OA-raw-glsl3" : "source-OA-raw-glsl3";
  if (workCompositeUniforms?.materialMode !== expectedWorkCompositeMaterialMode) materialSurfaceErrors.push("workCompositeMaterialMode");
  if (workCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("workCompositeGlslVersion");
  if (!debugCompositeProbe && workCompositeUniforms?.debugShaderActive !== false) materialSurfaceErrors.push("workCompositeDebugShaderActive");
  if (!debugCompositeProbe && workCompositeUniforms?.productionShaderIsSourceSurface !== true) materialSurfaceErrors.push("workCompositeProductionShader");
  const preCompositeSurface = preCompositeUniforms?.shaderSurface || {};
  for (const key of [
    "hasSourceSaturationHelper",
    "hasSourceVignetteHelper",
    "hasSourceCircleHelper",
    "hasSourceContrastHelper",
    "hasSourceHueHelper",
    "hasSourceRgbshiftHelper",
    "hasNoRatioVignetteBridge",
    "hasSourceCoverTextureTemporary",
  ]) {
    if (preCompositeSurface[key] !== true) materialSurfaceErrors.push(`preComposite${key[0].toUpperCase()}${key.slice(1)}`);
  }
  if (preCompositeSurface.helperOrderMode !== "source-A1-helpers-coverTexture-before-uniforms-random-after-uniforms") {
    materialSurfaceErrors.push("preCompositeHelperOrderMode");
  }
  const workCompositeSurface = workCompositeUniforms?.shaderSurface || {};
  if (workCompositeSurface.formulaMode !== "source-CA-mixed-blend-surface") materialSurfaceErrors.push("workCompositeFormulaMode");
  if (workCompositeSurface.blendEntry !== "source-Po-blend") materialSurfaceErrors.push("workCompositeBlendEntry");
  if (workCompositeSurface.hasLuminanceHelper !== true) materialSurfaceErrors.push("workCompositeLuminanceHelper");
  for (const key of [
    "hasSourceSaturationHelper",
    "hasSourceVignetteHelper",
    "hasSourceCircleHelper",
    "hasSourceContrastHelper",
    "hasSourceHueHelper",
    "hasSourceRgbshiftHelper",
  ]) {
    if (workCompositeSurface[key] !== true) materialSurfaceErrors.push(`workComposite${key[0].toUpperCase()}${key.slice(1)}`);
  }
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
    if (material?.ditheringDefinePresent !== true) materialSurfaceErrors.push(`${key}DitheringDefinePresent`);
    if (material?.ditheringDefine !== null) materialSurfaceErrors.push(`${key}DitheringDefineJsonValue`);
    if (material?.ditheringDefineString !== "undefined") materialSurfaceErrors.push(`${key}DitheringDefineString`);
    if (material?.ditheringDefineMode !== "source-cg-defines-DITHERING-undefined") materialSurfaceErrors.push(`${key}DitheringDefineMode`);
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
  if (!mainFluidMaterials.advection?.uniformKeys?.includes("px")) materialSurfaceErrors.push("mainFluidAdvectionPxUniform");
  if (!mainFluidMaterials.advection?.uniformKeys?.includes("bounds")) materialSurfaceErrors.push("mainFluidAdvectionBoundsUniform");
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
  const expectedSourceSceneOrder = ["sky", "media", "work", "main", "workthumb", "wavves", "character"];
  if (JSON.stringify(updateOrder?.sourceSceneOrder) !== JSON.stringify(expectedSourceSceneOrder)) {
    throw new Error(`Source scene order probe mismatch: ${JSON.stringify(updateOrder?.sourceSceneOrder || null)}`);
  }
  if (JSON.stringify(updateOrder?.rebuildSceneOrder) !== JSON.stringify(expectedSourceSceneOrder)) {
    throw new Error(`Rebuild scene order source-shape mismatch: ${JSON.stringify(updateOrder?.rebuildSceneOrder || null)}`);
  }
  const expectedRebuildFrameOrder = ["media-position", "sky", "media", "work-raw", "work-bloom", "work-mousesim", "work-composite", "p1-post-render", "main-raw", "main-blur", "main-lensflare", "main-luminosity", "main-bloom", "main-fluid", "main-C1", "main-final-screen", "workthumb", "wavves", "character-when-about"];
  if (JSON.stringify(updateOrder?.rebuildFrameOrder) !== JSON.stringify(expectedRebuildFrameOrder)) {
    throw new Error(`Rebuild frame order source-shape mismatch: ${JSON.stringify(updateOrder?.rebuildFrameOrder || null)}`);
  }
  const expectedWorkUpdateOrder = ["Lu.renderManager.raw", "Lu.renderManager.bloom", "Ka.mouseSimulation", "Lu.renderManager.composite", "IT.cameraController", "p1.components"];
  if (JSON.stringify(updateOrder?.workUpdateOrder) !== JSON.stringify(expectedWorkUpdateOrder)) {
    throw new Error(`Work update order source-shape mismatch: ${JSON.stringify(updateOrder?.workUpdateOrder || null)}`);
  }
  const expectedMainUpdateOrder = ["I1.raw", "I1.optional-blur", "I1.optional-lensflare", "I1.optional-luminosity", "I1.optional-bloom", "I1.fluid", "I1.C1-screen"];
  if (JSON.stringify(updateOrder?.mainUpdateOrder) !== JSON.stringify(expectedMainUpdateOrder)) {
    throw new Error(`Main update order source-shape mismatch: ${JSON.stringify(updateOrder?.mainUpdateOrder || null)}`);
  }
  if (updateOrder?.mouseSimulationOrder !== "source-Lu-mousesim-after-raw-bloom-before-composite") {
    throw new Error(`Mouse simulation order source-shape mismatch: ${updateOrder?.mouseSimulationOrder || "missing"}`);
  }
  if (updateOrder?.preloadGate !== "source-nD-await-blueNoise-floorNormal-perlin1-perlin2-before-animate-in") {
    throw new Error(`Texture preload gate source-shape mismatch: ${updateOrder?.preloadGate || "missing"}`);
  }
  const preloadState = updateOrder?.sourceTexturePreloadState || {};
  const preloadErrors = [];
  if (updateOrder?.animateInMode !== "source-nD-animateIn-awaits-init-and-four-preloaded-textures") preloadErrors.push("animateInMode");
  if (updateOrder?.animateInStarted !== true) preloadErrors.push("animateInStarted");
  if (updateOrder?.animateInResolvedMode !== "source-nD-animateIn-resolves-after-fade-scheduled") preloadErrors.push("animateInResolvedMode");
  if (updateOrder?.sourceTexturePreloadComplete !== true) preloadErrors.push("sourceTexturePreloadComplete");
  for (const key of ["blueNoise", "floorNormal", "perlin1", "perlin2"]) {
    if (preloadState[key] !== true) preloadErrors.push(`preload-${key}`);
  }
  if (preloadErrors.length) {
    throw new Error(`nD.animateIn texture preload source-shape mismatch: ${preloadErrors.join(", ")}`);
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
  if (environmentUniforms?.constructorParamsMode !== "source-h1-passes-side-envMapIntensity-fog-only") environmentErrors.push("constructorParamsMode");
  if (environmentUniforms?.defaultStandardParamsMode !== "source-u1-does-not-apply-Qn-roughness-metalness-emissive-constants") environmentErrors.push("defaultStandardParamsMode");
  if (environmentUniforms && Math.abs((environmentUniforms.roughness ?? -1) - 1) > 0.0001) environmentErrors.push("roughnessDefault");
  if (environmentUniforms && Math.abs((environmentUniforms.metalness ?? -1) - 0) > 0.0001) environmentErrors.push("metalnessDefault");
  if (environmentUniforms && Math.abs((environmentUniforms.emissiveIntensity ?? -1) - 1) > 0.0001) environmentErrors.push("emissiveIntensityDefault");
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
  if (environmentHierarchy?.material?.constructorParamsMode !== "source-h1-passes-side-envMapIntensity-fog-only") environmentErrors.push("reflectionConstructorParamsMode");
  if (environmentHierarchy?.material?.defaultStandardParamsMode !== "source-u1-does-not-apply-Qn-roughness-metalness-emissive-constants") environmentErrors.push("reflectionDefaultStandardParamsMode");
  if (environmentErrors.length) {
    throw new Error(`Environment hierarchy source-shape mismatch: ${environmentErrors.join(", ")}`);
  }
  const lights = parsed.probe.reflectionState?.lights;
  const lightErrors = [];
  if (lights?.ownershipMode !== "source-p1-adds-ambient-spot-target-directionalLight-only") lightErrors.push("ownershipMode");
  if (lights?.directionalLight1InScene !== true) lightErrors.push("directionalLight1InScene");
  if (lights?.directionalLight2InScene !== false) lightErrors.push("directionalLight2InScene");
  if (!Array.isArray(lights?.directionalLight1Position) || Math.abs((lights.directionalLight1Position[0] ?? 0) - 10.5) > 0.0001 || Math.abs((lights.directionalLight1Position[1] ?? 0) - 10) > 0.0001 || Math.abs((lights.directionalLight1Position[2] ?? 0) - 1) > 0.0001) lightErrors.push("directionalLight1Position");
  if (!Array.isArray(lights?.directionalLight2Position) || Math.abs((lights.directionalLight2Position[0] ?? 0) + 10.5) > 0.0001 || Math.abs((lights.directionalLight2Position[1] ?? 0) - 5) > 0.0001 || Math.abs((lights.directionalLight2Position[2] ?? 0) + 1) > 0.0001) lightErrors.push("directionalLight2Position");
  if (lightErrors.length) {
    throw new Error(`p1 light ownership source-shape mismatch: ${lightErrors.join(", ")}`);
  }
  const floorUniforms = parsed.probe.uniforms?.floor;
  const floorErrors = [];
  if (floorUniforms?.reflectionVisibilityMode !== "source-a1-onBeforeRender-hide-component-group") floorErrors.push("reflectionVisibilityMode");
  if (floorUniforms?.materialMode !== "source-o1-raw-glsl3") floorErrors.push("materialMode");
  if (floorUniforms?.reflectionBlurMode !== "source-t1-raw-glsl3") floorErrors.push("reflectionBlurMode");
  if (floorUniforms?.normalMap?.bindingMode !== "source-a1-Xt-floorNormal-repeat-45-updateMatrix") floorErrors.push("floorNormalBindingMode");
  if (floorUniforms?.normalMap?.isLoadedTexture !== true) floorErrors.push("floorNormalLoaded");
  if (!Array.isArray(floorUniforms?.normalMap?.repeat) || Math.abs((floorUniforms.normalMap.repeat[0] ?? 0) - 45) > 0.0001 || Math.abs((floorUniforms.normalMap.repeat[1] ?? 0) - 45) > 0.0001) floorErrors.push("floorNormalRepeat");
  if (!Array.isArray(floorUniforms?.normalMap?.matrix) || floorUniforms.normalMap.matrix.length !== 9) floorErrors.push("floorNormalMatrix");
  if (floorUniforms?.normalMap?.colorSpace !== "") floorErrors.push("floorNormalColorSpace");
  if (floorUniforms?.shaderBranches?.normalMap !== true) floorErrors.push("floorNormalMapBranch");
  if (floorUniforms?.shaderBranches?.map !== false) floorErrors.push("floorMapBranch");
  if (floorUniforms?.shaderBranches?.fog !== false) floorErrors.push("floorFogBranch");
  if (floorUniforms?.shaderBranches?.dithering !== false) floorErrors.push("floorDitheringBranch");
  if (floorUniforms?.materialDefaults?.transparent !== false) floorErrors.push("floorMaterialTransparent");
  if (floorUniforms?.materialDefaults?.depthWrite !== true) floorErrors.push("floorMaterialDepthWrite");
  if (floorUniforms?.materialDefaults?.depthTest !== true) floorErrors.push("floorMaterialDepthTest");
  if (floorUniforms?.materialDefaults?.blending !== 0) floorErrors.push("floorMaterialNoBlending");
  if (floorUniforms?.materialDefaults?.toneMapped !== true) floorErrors.push("floorMaterialToneMappedDefault");
  if (floorUniforms?.geometry?.mode !== "source-a1-Tu-circle-geometry") floorErrors.push("floorGeometryMode");
  if (floorUniforms?.geometry?.type !== "CircleGeometry") floorErrors.push("floorGeometryType");
  if (floorUniforms?.geometry && Math.abs((floorUniforms.geometry.radius ?? 0) - 60) > 0.0001) floorErrors.push("floorGeometryRadius");
  if (floorUniforms?.geometry?.segments !== 32) floorErrors.push("floorGeometrySegments");
  if (floorUniforms?.hierarchy?.mode !== "source-a1-floorGroup-floorPlane-reflector") floorErrors.push("floorHierarchyMode");
  if (floorUniforms?.hierarchy?.groupChildren !== 1) floorErrors.push("floorGroupChildren");
  if (floorUniforms?.hierarchy?.planeChildren !== 1) floorErrors.push("floorPlaneChildren");
  if (floorUniforms?.hierarchy?.reflectorParentIsPlane !== true) floorErrors.push("floorReflectorParent");
  if (floorUniforms?.hierarchy?.planeParentIsGroup !== true) floorErrors.push("floorPlaneParent");
  if (floorUniforms?.hierarchy?.groupParentIsSceneWrap !== true) floorErrors.push("floorGroupParent");
  if (floorUniforms?.hierarchy && Math.abs((floorUniforms.hierarchy.groupPositionY ?? 0) + 1.65) > 0.0001) floorErrors.push("floorGroupPositionY");
  if (floorUniforms?.hierarchy && Math.abs((floorUniforms.hierarchy.planeRotationX ?? 0) + Math.PI / 2) > 0.0001) floorErrors.push("floorPlaneRotationX");
  if (!Array.isArray(floorUniforms?.hierarchy?.planePosition) || floorUniforms.hierarchy.planePosition.some((value) => Math.abs(value) > 0.0001)) floorErrors.push("floorPlanePosition");
  if (parsed.probe.reflectionState?.floor?.material?.mode !== "source-o1-raw-glsl3") floorErrors.push("reflectionFloorMaterialMode");
  if (parsed.probe.reflectionState?.floor?.material?.transparent !== false) floorErrors.push("reflectionFloorTransparent");
  if (parsed.probe.reflectionState?.floor?.material?.depthWrite !== true) floorErrors.push("reflectionFloorDepthWrite");
  if (parsed.probe.reflectionState?.floor?.material?.depthTest !== true) floorErrors.push("reflectionFloorDepthTest");
  if (parsed.probe.reflectionState?.floor?.material?.blending !== 0) floorErrors.push("reflectionFloorNoBlending");
  if (parsed.probe.reflectionState?.floor?.material?.toneMapped !== true) floorErrors.push("reflectionFloorToneMappedDefault");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.normalMap !== true) floorErrors.push("reflectionNormalMapBranch");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.map !== false) floorErrors.push("reflectionMapBranch");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.fog !== false) floorErrors.push("reflectionFogBranch");
  if (parsed.probe.reflectionState?.floor?.material?.branches?.dithering !== false) floorErrors.push("reflectionDitheringBranch");
  if (parsed.probe.reflectionState?.floor?.geometry?.mode !== "source-a1-Tu-circle-geometry") floorErrors.push("reflectionFloorGeometryMode");
  if (parsed.probe.reflectionState?.floor?.geometry?.type !== "CircleGeometry") floorErrors.push("reflectionFloorGeometryType");
  if (parsed.probe.reflectionState?.floor?.geometry && Math.abs((parsed.probe.reflectionState.floor.geometry.radius ?? 0) - 60) > 0.0001) floorErrors.push("reflectionFloorGeometryRadius");
  if (parsed.probe.reflectionState?.floor?.geometry?.segments !== 32) floorErrors.push("reflectionFloorGeometrySegments");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.mode !== "source-a1-floorGroup-floorPlane-reflector") floorErrors.push("reflectionFloorHierarchyMode");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.reflectorParentIsPlane !== true) floorErrors.push("reflectionFloorReflectorParent");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.planeParentIsGroup !== true) floorErrors.push("reflectionFloorPlaneParent");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.groupParentIsSceneWrap !== true) floorErrors.push("reflectionFloorGroupParent");
  if (reflectionTargets?.blurMaterialMode !== "source-t1-raw-glsl3") floorErrors.push("blurMaterialMode");
  if (reflectionTargets?.blurPassScreenMode !== "source-i1-private-screen-camera") floorErrors.push("blurPassScreenMode");
  if (reflectionTargets?.floorVisibilityMode !== "source-a1-onBeforeRender-hide-component-group") floorErrors.push("floorVisibilityMode");
  if (reflectionTargets?.clipBias !== 0) floorErrors.push("clipBias");
  if (reflectionTargets?.blurSwapMode !== "source-i1-write-target-loop-swap") floorErrors.push("blurSwapMode");
  if (reflectionTargets?.renderTargetUniformMode !== "source-i1-update-after-each-blur-swap") floorErrors.push("renderTargetUniformMode");
  if (floorUniforms?.reflectionTargetSize?.constructionDepthBuffer !== false) floorErrors.push("floorRawConstructionDepthBuffer");
  if (floorUniforms?.reflectionTargetSize?.runtimeDepthBuffer !== true) floorErrors.push("floorRawRuntimeDepthBuffer");
  if (reflectionTargets?.rawConstructionDepthBuffer !== false) floorErrors.push("reflectionRawConstructionDepthBuffer");
  if (reflectionTargets?.rawRuntimeDepthBuffer !== true) floorErrors.push("reflectionRawRuntimeDepthBuffer");
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
  if (skyComposite?.rawSizingMode !== "source-V1-height-0.75-square") skyUniformErrors.push("rawSizingMode");
  if (skyComposite?.bindingMode !== "source-nD-after-init-resize-delay-bind-repeat-composite") skyUniformErrors.push("bindingMode");
  if (skyComposite?.isEnvironmentSkySource !== true) skyUniformErrors.push("environmentSkySource");
  if (skyComposite?.backgroundMode !== "source-V1-background-666666-linear-to-srgb") skyUniformErrors.push("backgroundMode");
  if (!Array.isArray(skyComposite?.background) || skyComposite.background.length !== 3) skyUniformErrors.push("backgroundValue");
  if (skyComposite?.timeMode !== (parsed.probe.renderer?.dprPolicy?.lowRes ? "source-V1-low-res-time-0" : "source-V1-live-time")) skyUniformErrors.push("timeMode");
  if (skyTarget && skyComposite && (skyTarget.width !== skyComposite.expectedSize || skyTarget.height !== skyComposite.expectedSize)) skyUniformErrors.push("targetSize");
  const skyRawTarget = parsed.probe.targets?.skyRaw;
  if (skyRawTarget && skyComposite && (skyRawTarget.width !== skyComposite.expectedRawSize || skyRawTarget.height !== skyComposite.expectedRawSize)) skyUniformErrors.push("rawTargetSize");
  const RepeatWrapping = 1000;
  if (skyComposite?.wrapMode !== "source-nD-sky-composite-repeat-for-work-env") skyUniformErrors.push("skyCompositeWrapMode");
  if (skyComposite?.wrapS !== RepeatWrapping || skyComposite?.wrapT !== RepeatWrapping) skyUniformErrors.push("sourceNdSkyCompositeRepeatWrap");
  if (environmentUniforms?.tSkyBindingMode !== "source-nD-after-init-resize-delay-bind-repeat-composite") skyUniformErrors.push("environmentBindingMode");
  if (environmentUniforms?.tSkyIsComposite !== true || environmentUniforms?.skyCompositeBindingMatchesUniform !== true) skyUniformErrors.push("environmentCompositeBinding");
  if (environmentUniforms?.tSkyWrapS !== RepeatWrapping || environmentUniforms?.tSkyWrapT !== RepeatWrapping) skyUniformErrors.push("environmentSkyWrap");
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

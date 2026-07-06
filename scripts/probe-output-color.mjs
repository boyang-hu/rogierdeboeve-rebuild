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
const stableTimeout = Number(process.env.PROBE_STABLE_TIMEOUT || 30000);
const deviceScaleFactor = Number(process.env.DEVICE_SCALE_FACTOR || 1);
const skipScreenshot = process.env.SKIP_SCREENSHOT === "1";
const viewportName = process.env.VIEWPORT || "desktop";
const viewports = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
const viewport = viewports[viewportName] || viewports.desktop;
const sourceHomeSpotlightIntensityMode = "source-SD-init-direct-spotLight-intensity-220-no-project-payload";
const sourceActiveProjectSpotlightIntensityMode = "source-yD-onProjectActive-spotlight-payload-or-maxSpotLightIntensity";
const sourceActiveProjectApplicationOrderMode = "source-yD-onProjectActive-spotlight-reveal-woosh-uReveal-before-look-directional";
const sourceActiveProjectWooshMode = "source-yD-onProjectActive-ln-playWoosh-after-revealSpread-before-uReveal";
const sourceActiveProjectApplicationOrder = [
  "activeProject",
  "spotLightIntensity",
  "revealSpread",
  "woosh",
  "uRevealTweens",
  "ambientLight",
  "mainColor",
  "darken",
  "saturation",
  "contrast",
  "thumbDarknessIntensity",
  "thumbDarknessColor",
  "thumbSaturation",
  "thumbMouseLightness",
  "blocksColor",
  "directionalLightIntensity",
];
const rebuildSearchParams = new URL(rebuildUrl).searchParams;
const debugCompositeProbe = rebuildSearchParams.has("debug-composite-stage")
  || rebuildSearchParams.has("debug-composite-darken")
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

function closeTo(actual, expected, epsilon = 0.001) {
  return Math.abs((actual ?? NaN) - expected) <= epsilon;
}

function sourceProjectSpotlightUsesPayload(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed !== 0;
}

function sourceProjectSpotlightIntensity(value, fallback = 220) {
  return sourceProjectSpotlightUsesPayload(value) ? Number(value) : fallback;
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

async function readProbeSummary(ws) {
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
  return JSON.parse(result.result.value);
}

function outputProbeSettled(parsed) {
  const workSettings = parsed.probe?.settings?.work || {};
  const lightState = workSettings.lightStateOwnership || {};
  const settingsState = workSettings.settingsStateOwnership || {};
  const mouseFactor = workSettings.mouseFactorOwnership || {};
  const ambient = workSettings.ambientOwnership || {};
  const blocksColor = workSettings.blocksColorOwnership || {};
  return Boolean(
    parsed.probe
    && parsed.body?.includes("has-entered")
    && lightState.mode === "source-Se-settings-light-state-onUpdate-intensities"
    && lightState.matchesLights === true
    && closeTo(lightState.state?.spotLight, 220)
    && closeTo(lightState.state?.directionalLight, 1.5)
    && closeTo(lightState.state?.directionalLight2, 1)
    && settingsState.mode === "source-Se-settings-scalar-media-state-onUpdate"
    && settingsState.scalarNoKillMode === "source-no-kill-for-darken-saturation-contrast-showScene-fluidStrength-mediaOpacity"
    && settingsState.killOwnedMode === "source-kill-owned-revealSpread-envRotation"
    && settingsState.matchesUniforms === true
    && closeTo(settingsState.state?.sceneReveal, 1)
    && mouseFactor.mode === "source-p1-setMouseFactor-updates-VA-uMouseFactor"
    && closeTo(mouseFactor.state, 1)
    && closeTo(mouseFactor.activeUniform, mouseFactor.state)
    && mouseFactor.allWorkUniformsMatchState === true
    && ambient.mode === "source-Se-setAmbientLight-delegates-color-intensity"
    && ambient.colorMode === "source-Se-setAmbientColor-tweens-ambientLight-color-fanout-env-uDarkenColor"
    && ambient.intensityMode === "source-Se-setAmbientIntensity-tweens-ambientLight-intensity"
    && ambient.killMode === "source-no-kill-for-setAmbientColor-setAmbientIntensity"
    && ambient.environmentDarkenMatchesAmbientColor === true
    && blocksColor.mode === "source-Se-setBlocksColor-tweens-all-work-material-emissive"
    && blocksColor.killMode === "source-no-kill-for-setBlocksColor"
    && blocksColor.allWorkEmissiveMatchesActive === true
  );
}

async function waitForOutputProbeSettled(ws) {
  const start = Date.now();
  let parsed = await readProbeSummary(ws);
  while (!outputProbeSettled(parsed) && Date.now() - start < stableTimeout) {
    await wait(250);
    parsed = await readProbeSummary(ws);
  }
  return parsed;
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
  const parsed = await waitForOutputProbeSettled(ws);
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
  if (sourceDefaults.c1FluidStrength !== 0.5) sourceDefaultErrors.push("c1FluidStrength");
  if (sourceDefaultErrors.length) {
    throw new Error(`Se/xt source default mismatch: ${sourceDefaultErrors.join(", ")}`);
  }
  const spotlight = parsed.probe.spotlightProjection;
  const spotlightErrors = [];
  if (!spotlight) spotlightErrors.push("missing");
  if (spotlight?.spotlight?.mapMode !== "source-thumb-composite-target") spotlightErrors.push("mapMode");
  if (spotlight?.spotlight?.mapProjectionMode !== "three-r164-spotLightMap-vSpotLightCoord") spotlightErrors.push("mapProjectionMode");
  if (spotlight?.spotlight?.projectionPath !== "source-SpotLight.map-without-castShadow") spotlightErrors.push("projectionPath");
  if (spotlight?.projectionMatrixMode !== "source-SD-SpotLight-map-through-three-shadow-matrix") spotlightErrors.push("projectionMatrixMode");
  if (spotlight?.shadowPathMode !== "source-map-projection-not-shadow-cast") spotlightErrors.push("shadowPathMode");
  if (spotlight?.threeChunkMode !== "r164-lights_fragment_begin-multiplies-directLight-by-spotLightMap") spotlightErrors.push("threeChunkMode");
  if (spotlight?.sampleGridMode !== "source-spotlight-map-3x3-active-bounds") spotlightErrors.push("sampleGridMode");
  if (spotlight?.sampleCount !== 9) spotlightErrors.push("sampleCount");
  if (spotlight?.inMapCount !== 9) spotlightErrors.push("inMapCount");
  if (spotlight?.inMapCoverage !== 1) spotlightErrors.push("inMapCoverage");
  if ((spotlight?.mapLumaMean ?? 0) <= 0) spotlightErrors.push("mapLumaMean");
  const light = spotlight?.spotlight || {};
  if (light.positionOwnershipMode !== "source-direct-SpotLight-position-target-no-local-mirror") spotlightErrors.push("positionOwnershipMode");
  if (light.stateOwnership !== "source-Se-settings-light-state-onUpdate-intensities") spotlightErrors.push("stateOwnership");
  if (light.stateIntensityMatchesLight !== true) spotlightErrors.push("stateIntensityMatchesLight");
  if (light.homeEntryIntensityMode !== sourceHomeSpotlightIntensityMode) spotlightErrors.push("homeEntryIntensityMode");
  if (light.homeEntryIntensityIgnoresPayload !== true) spotlightErrors.push("homeEntryIntensityIgnoresPayload");
  if (Math.abs((light.expectedHomeEntryIntensity ?? 0) - 220) > 0.001) spotlightErrors.push("expectedHomeEntryIntensity");
  const expectedActiveProjectSpotlight = sourceProjectSpotlightIntensity(light.activeProjectSpotlightRaw, 220);
  const expectedActiveProjectUsesPayload = sourceProjectSpotlightUsesPayload(light.activeProjectSpotlightRaw);
  if (light.activeProjectIntensityMode !== sourceActiveProjectSpotlightIntensityMode) spotlightErrors.push("activeProjectIntensityMode");
  if (light.activeProjectFallbackMode !== "source-js-or-falsy-zero-empty-missing-to-maxSpotLightIntensity") spotlightErrors.push("activeProjectFallbackMode");
  if (light.activeProjectUsesPayloadSpotlight !== expectedActiveProjectUsesPayload) spotlightErrors.push("activeProjectUsesPayloadSpotlight");
  if (Math.abs((light.expectedActiveProjectIntensity ?? 0) - expectedActiveProjectSpotlight) > 0.001) spotlightErrors.push("expectedActiveProjectIntensity");
  if (light.activeProjectIntensityMatchesExpected !== true) spotlightErrors.push("activeProjectIntensityMatchesExpected");
  if (Math.abs((light.intensity ?? 0) - expectedActiveProjectSpotlight) > 0.001) spotlightErrors.push("intensity");
  if (Math.abs((light.stateIntensity ?? 0) - expectedActiveProjectSpotlight) > 0.001) spotlightErrors.push("stateIntensity");
  if (light.defaultMode !== "source-Qm-constructor-color-intensity-default-distance-decay-SpotLightShadow") spotlightErrors.push("defaultMode");
  if (light.shadowDefaultMode !== "source-Iw-SpotLightShadow-default-focus1-camera-50-1-0_5-500-mapSize512") spotlightErrors.push("shadowDefaultMode");
  if (light.colorHex !== 0xffffff) spotlightErrors.push(`colorHex=${light.colorHex}`);
  if (!closeTo(light.distance, 0)) spotlightErrors.push(`distance=${light.distance}`);
  if (!closeTo(light.decay, 2)) spotlightErrors.push(`decay=${light.decay}`);
  if (Math.abs((light.angle ?? 0) - Math.PI / 4) > 0.0001) spotlightErrors.push("angle");
  if (Math.abs((light.penumbra ?? 0) - 0.95) > 0.0001) spotlightErrors.push("penumbra");
  if (light.castShadow !== false) spotlightErrors.push("castShadow");
  if (!closeTo(light.shadowFocus, 1)) spotlightErrors.push(`shadowFocus=${light.shadowFocus}`);
  if (JSON.stringify(light.shadowMapSize) !== JSON.stringify([512, 512])) spotlightErrors.push(`shadowMapSize=${JSON.stringify(light.shadowMapSize)}`);
  if (light.shadowCameraFovMode !== "source-SpotLightShadow-updateMatrices-angle-focus-fov") spotlightErrors.push("shadowCameraFovMode");
  if (!closeTo(light.shadowCameraExpectedFov, 90)) spotlightErrors.push(`shadowCameraExpectedFov=${light.shadowCameraExpectedFov}`);
  if (!closeTo(light.shadowCameraFov, light.shadowCameraExpectedFov ?? 90)) spotlightErrors.push(`shadowCameraFov=${light.shadowCameraFov}`);
  if (!closeTo(light.shadowCameraAspect, 1)) spotlightErrors.push(`shadowCameraAspect=${light.shadowCameraAspect}`);
  if (!closeTo(light.shadowCameraNear, 0.5)) spotlightErrors.push(`shadowCameraNear=${light.shadowCameraNear}`);
  if (light.shadowCameraFarMode !== "source-SpotLightShadow-updateMatrices-distance-0-keeps-camera-far-500") spotlightErrors.push("shadowCameraFarMode");
  if (!closeTo(light.shadowCameraFar, 500)) spotlightErrors.push(`shadowCameraFar=${light.shadowCameraFar}`);
  const expectedMobile = viewport.width < 800;
  const expectedSpotlightY = expectedMobile ? 0.3 : 0;
  const expectedSpotlightPosition = [0, expectedSpotlightY, 3.7];
  const expectedSpotlightYOffsetMode = expectedMobile
    ? "source-p1-mobile-0_3-plus-camera-y-parallax"
    : "source-p1-desktop-camera-y-parallax";
  if (light.parallaxMode !== "source-p1-spotLight-x-camera-y-desktop-or-0_3-mobile") spotlightErrors.push("parallaxMode");
  if (light.parallaxYOffsetMode !== expectedSpotlightYOffsetMode) spotlightErrors.push("parallaxYOffsetMode");
  if (light.mobileBreakpoint !== 800) spotlightErrors.push("mobileBreakpoint");
  if (Math.abs((light.mobileYOffset ?? -1) - expectedSpotlightY) > 0.0001) spotlightErrors.push("mobileYOffset");
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
  const expectedAspect = viewport.width / viewport.height;
  if (camera.surfaceMode !== "source-p1-Ya-perspective-55-inner-aspect-near1-far2000-position-5_5") resizeErrors.push("surfaceMode");
  if (camera.resizeProjectionMode !== "source-Ya-resize-updateProjectionMatrix-plus-Iu-aspect-update") resizeErrors.push("resizeProjectionMode");
  if (camera.initialPositionMode !== "source-p1-setCamera-position-0-0-5_5") resizeErrors.push("initialPositionMode");
  if (camera.expectedFov !== 55) resizeErrors.push("expectedFov");
  if (camera.expectedNear !== 1) resizeErrors.push("expectedNear");
  if (camera.expectedFar !== 2000) resizeErrors.push("expectedFar");
  if (JSON.stringify(camera.expectedInitialPosition) !== JSON.stringify([0, 0, 5.5])) resizeErrors.push("expectedInitialPosition");
  if (Math.abs((camera.fov ?? 0) - 55) > 0.001) resizeErrors.push("fov");
  if (Math.abs((camera.near ?? 0) - 1) > 0.001) resizeErrors.push("near");
  if (Math.abs((camera.far ?? 0) - 2000) > 0.001) resizeErrors.push("far");
  if (Math.abs((camera.aspect ?? 0) - expectedAspect) > 0.001) resizeErrors.push("aspect");
  if (Math.abs((camera.viewportAspect ?? 0) - expectedAspect) > 0.001) resizeErrors.push("viewportAspect");
  if (camera.aspectMatchesViewport !== true) resizeErrors.push("aspectMatchesViewport");
  if (camera.resizeMode !== "source-p1-mobile-origin-sceneWrap") resizeErrors.push("resizeMode");
  if (camera.breakpointMd !== 800) resizeErrors.push("breakpointMd");
  if (camera.mobileResizeBranch !== expectedMobile) resizeErrors.push("mobileResizeBranch");
  if (Math.abs((camera.origin?.[2] ?? 0) - expectedOriginZ) > 0.001) resizeErrors.push("cameraOriginZ");
  if (Math.abs((camera.sceneWrapY ?? 0) - expectedSceneWrapY) > 0.001) resizeErrors.push("sceneWrapY");
  if (camera.controllerMode !== "source-IT-three-group-matrix-decompose") resizeErrors.push("controllerMode");
  if (camera.controllerObjectMode !== "source-IT-rt-object3d-containers") resizeErrors.push("controllerObjectMode");
  for (const key of ["group", "rotateGroup", "innerGroup"]) {
    if (camera.controllerObjectTypes?.[key] !== "Object3D") resizeErrors.push(`controllerObjectType-${key}`);
  }
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
  const galleryDynamics = camera.galleryDynamics || {};
  if (galleryDynamics.mode !== "source-yD-updateScene-roll-zoom-bo-targets-Yi-rounded-lerp") resizeErrors.push("galleryDynamicsMode");
  if (galleryDynamics.rollTargetMode !== "source-bo-clamp-minus4-plus4-Fn4") resizeErrors.push("galleryRollTargetMode");
  if (galleryDynamics.zoomTargetMode !== "source-bo-clamp-0-1-Fn4") resizeErrors.push("galleryZoomTargetMode");
  if (galleryDynamics.lerpMode !== "source-Yi-PT-Fn4-exponential-lerp") resizeErrors.push("galleryLerpMode");
  if (galleryDynamics.sceneRotationRounded !== true) resizeErrors.push("gallerySceneRotationRounded");
  if (galleryDynamics.zoomRounded !== true) resizeErrors.push("galleryZoomRounded");
  if (galleryDynamics.rotationMatchesSourceState !== true) resizeErrors.push("galleryRotationMatchesSourceState");
  if (galleryDynamics.positionMatchesSourceState !== true) resizeErrors.push("galleryPositionMatchesSourceState");
  if (resizeErrors.length) {
    throw new Error(`p1.resize/IT camera source-shape mismatch: ${resizeErrors.join(", ")}`);
  }
  const workSettings = parsed.probe.settings?.work || {};
  const activeMaterial = workSettings.activeMaterial;
  const auxiliaryMaterial = workSettings.auxiliaryMaterial;
  const floatingAuxiliaryMaterial = workSettings.floatingAuxiliaryMaterial;
  const auxiliaryLifecycle = workSettings.auxiliaryLifecycle || {};
  const materialErrors = [];
  if (workSettings.materialStateMode !== "source-VA-meshstandard-default-toneMapped") materialErrors.push("materialStateMode");
  if (workSettings.vertexWorldPositionMode !== "source-HA-unconditional-instance-world") materialErrors.push("vertexWorldPositionMode");
  if (!activeMaterial) materialErrors.push("activeMaterialMissing");
  if (activeMaterial?.type !== "MeshStandardMaterial") materialErrors.push("activeMaterialType");
  if (activeMaterial?.isMeshStandardMaterial !== true) materialErrors.push("activeIsMeshStandardMaterial");
  if (activeMaterial?.isMeshPhysicalMaterial !== false) materialErrors.push("activeIsMeshPhysicalMaterial");
  if (activeMaterial?.hasPhysicalDefine !== false) materialErrors.push("activePhysicalDefine");
  if (activeMaterial?.physicalBranchMode !== "source-VA-standard-material-PHYSICAL-inactive") materialErrors.push("activePhysicalBranchMode");
  if (activeMaterial?.constructorDefaultsMode !== "source-VA-XA-KA-default-uniform-constructors") {
    materialErrors.push("activeConstructorDefaultsMode");
  }
  if (activeMaterial?.uRevealConstructorWasZero !== true) materialErrors.push("activeURevealConstructorWasZero");
  if (activeMaterial?.uMouseLightnessConstructorWasOne !== true) materialErrors.push("activeUMouseLightnessConstructorWasOne");
  if (activeMaterial?.uMouseSpeedConstructorMode !== "source-VA-XA-KA-uMouseSpeed-construct-null-GA-update-writes-runtime") {
    materialErrors.push("activeUMouseSpeedConstructorMode");
  }
  if (activeMaterial?.uMouseSpeedConstructorWasNull !== true) materialErrors.push("activeUMouseSpeedConstructorWasNull");
  if (activeMaterial?.tMouseSimConstructorWasNull !== true) materialErrors.push("activeTMouseSimConstructorWasNull");
  if (activeMaterial?.tMouseSim2ConstructorWasNull !== true) materialErrors.push("activeTMouseSim2ConstructorWasNull");
  if (activeMaterial?.tDisplacementConstructorWasNull !== true) materialErrors.push("activeTDisplacementConstructorWasNull");
  if (activeMaterial?.tMouseSimRuntimeIsLocal !== true) materialErrors.push("activeTMouseSimRuntimeLocal");
  if (activeMaterial?.tMouseSim2RuntimeIsScreen !== true) materialErrors.push("activeTMouseSim2RuntimeScreen");
  if (activeMaterial?.tDisplacementRuntimeIsWavves !== true) materialErrors.push("activeTDisplacementRuntimeWavves");
  if (activeMaterial?.uMouseLightnessRuntimeMatchesThumbState !== true) materialErrors.push("activeUMouseLightnessRuntimeThumbState");
  if (activeMaterial?.toneMapped !== true) materialErrors.push("activeToneMapped");
  if (activeMaterial?.transparent !== true) materialErrors.push("activeTransparent");
  if (activeMaterial?.depthWrite !== false) materialErrors.push("activeDepthWrite");
  if (activeMaterial?.depthTest !== false) materialErrors.push("activeDepthTest");
  if (activeMaterial?.dithering !== true) materialErrors.push("activeDithering");
  if (Math.abs((activeMaterial?.envMapIntensity ?? 0) - 0.75) > 0.001) materialErrors.push("activeEnvMapIntensity");
  if (Math.abs((activeMaterial?.roughness ?? 0) - 1) > 0.001) materialErrors.push("activeRoughness");
  if (Math.abs((activeMaterial?.metalness ?? 0) - 0) > 0.001) materialErrors.push("activeMetalness");
  const mouseFactor = workSettings.mouseFactorOwnership || {};
  if (mouseFactor.mode !== "source-p1-setMouseFactor-updates-VA-uMouseFactor") materialErrors.push("mouseFactorMode");
  if (mouseFactor.constructorDefault !== 0) materialErrors.push("mouseFactorConstructorDefault");
  if (mouseFactor.galleryEntryMode !== "source-yD-gallery-entry-set-0-then-tween-1") materialErrors.push("mouseFactorGalleryEntryMode");
  if (mouseFactor.previewMode !== "source-work-preview-enter-0_25-leave-1") materialErrors.push("mouseFactorPreviewMode");
  if (mouseFactor.steadyGalleryTarget !== 1) materialErrors.push("mouseFactorSteadyGalleryTarget");
  if (mouseFactor.previewEnterTarget !== 0.25) materialErrors.push("mouseFactorPreviewEnterTarget");
  if (mouseFactor.previewLeaveTarget !== 1) materialErrors.push("mouseFactorPreviewLeaveTarget");
  if (Math.abs((mouseFactor.state ?? NaN) - 1) > 0.001) materialErrors.push("mouseFactorState");
  if (Math.abs((mouseFactor.activeUniform ?? NaN) - (mouseFactor.state ?? NaN)) > 0.001) materialErrors.push("mouseFactorActiveUniform");
  if (mouseFactor.allWorkUniformsMatchState !== true) materialErrors.push("mouseFactorUniformsMatchState");
  if (auxiliaryLifecycle.mode !== "source-TD-Fg-split-about-floating-lifecycle") materialErrors.push("auxiliaryLifecycleMode");
  if (auxiliaryLifecycle.aboutEntryVisibilityMode !== "source-TD-addEvents-visible-before-animateIn") {
    materialErrors.push("auxiliaryAboutEntryVisibility");
  }
  if (auxiliaryLifecycle.aboutSpotlightLifecycleMode !== "source-TD-addEvents-100ms-map-resize-200ms-initial-scroll") {
    materialErrors.push("auxiliaryAboutSpotlightLifecycleMode");
  }
  if (auxiliaryLifecycle.aboutMapDelayMs !== 100) materialErrors.push("auxiliaryAboutMapDelay");
  if (auxiliaryLifecycle.aboutInitialScrollDelayMs !== 200) materialErrors.push("auxiliaryAboutInitialScrollDelay");
  if (auxiliaryLifecycle.aboutMapBindingMode !== "source-TD-after-100ms-character-composite-not-enter-state") {
    materialErrors.push("auxiliaryAboutMapBindingMode");
  }
  if (auxiliaryLifecycle.aboutResizeMode !== "source-TD-pe-FORCE_RESIZE-after-character-map") {
    materialErrors.push("auxiliaryAboutResizeMode");
  }
  if (auxiliaryLifecycle.aboutInitialScrollMode !== "source-TD-await-200ms-after-map-then-onScroll") {
    materialErrors.push("auxiliaryAboutInitialScrollMode");
  }
  if (auxiliaryLifecycle.aboutCharacterRotatableMode !== "source-TD-character-rotatableMesh-addEvents-after-map-remove-on-destroy") {
    materialErrors.push("auxiliaryAboutCharacterRotatableMode");
  }
  if (auxiliaryLifecycle.aboutCharacterRotatableWrapperMode !== "source-eD-cameraPanGroup-rotatableMesh-character") {
    materialErrors.push("auxiliaryAboutCharacterRotatableWrapperMode");
  }
  if (auxiliaryLifecycle.aboutCharacterRotatableEventMode !== "source-Q1-window-mouse-touch-passive-events") {
    materialErrors.push("auxiliaryAboutCharacterRotatableEventMode");
  }
  if (auxiliaryLifecycle.aboutCharacterRotatableUpdateMode !== "source-eD-Q1-update-horizontal-damped-rotation-and-auto-rotate") {
    materialErrors.push("auxiliaryAboutCharacterRotatableUpdateMode");
  }
  if (auxiliaryLifecycle.aboutCharacterRotatableHorizontal !== true) materialErrors.push("auxiliaryAboutCharacterRotatableHorizontal");
  if (auxiliaryLifecycle.aboutCharacterRotatableVertical !== false) materialErrors.push("auxiliaryAboutCharacterRotatableVertical");
  if (auxiliaryLifecycle.aboutCharacterRotatableDamping !== 5) materialErrors.push("auxiliaryAboutCharacterRotatableDamping");
  if (auxiliaryLifecycle.aboutCharacterAutoRotateSpeed !== 1) materialErrors.push("auxiliaryAboutCharacterAutoRotateSpeed");
  if (
    !Array.isArray(auxiliaryLifecycle.aboutCharacterCameraPanClamp)
    || auxiliaryLifecycle.aboutCharacterCameraPanClamp[0] !== -0.15
    || auxiliaryLifecycle.aboutCharacterCameraPanClamp[1] !== 0.3
  ) {
    materialErrors.push("auxiliaryAboutCharacterCameraPanClamp");
  }
  if (auxiliaryLifecycle.floatingEntryVisibilityMode !== "source-Fg-animateIn-onStart-visible-not-enter-state") {
    materialErrors.push("auxiliaryFloatingEntryVisibility");
  }
  if (auxiliaryLifecycle.floatingExitVisibilityMode !== "source-Fg-animateOut-onComplete-hidden") {
    materialErrors.push("auxiliaryFloatingExitVisibility");
  }
  if (auxiliaryLifecycle.floatingScrollVelocityMode !== "source-Fg-onRaf-page-scroll-velocity") {
    materialErrors.push("auxiliaryFloatingScrollVelocity");
  }
  if (Math.abs((auxiliaryLifecycle.floatingTranslation ?? NaN) - 0.005) > 0.000001) {
    materialErrors.push("auxiliaryFloatingTranslation");
  }
  const blocksColor = workSettings.blocksColorOwnership || {};
  if (blocksColor.mode !== "source-Se-setBlocksColor-tweens-all-work-material-emissive") materialErrors.push("blocksColorMode");
  if (blocksColor.targetMode !== "source-VA-MeshStandardMaterial-emissive") materialErrors.push("blocksColorTargetMode");
  if (blocksColor.killMode !== "source-no-kill-for-setBlocksColor") materialErrors.push("blocksColorKillMode");
  if ((blocksColor.workItemCount ?? 0) !== 10) materialErrors.push("blocksColorWorkItemCount");
  if (!Array.isArray(blocksColor.activeEmissive) || blocksColor.activeEmissive.length !== 3) materialErrors.push("blocksColorActiveEmissive");
  if (blocksColor.allWorkEmissiveMatchesActive !== true) materialErrors.push("blocksColorFanout");
  if (!auxiliaryMaterial) materialErrors.push("auxiliaryMaterialMissing");
  if (auxiliaryMaterial?.mode !== "source-XA-about-material-state") materialErrors.push("auxMode");
  if (auxiliaryMaterial?.shaderMode !== "source-XA-jA-WA-direct-shader") materialErrors.push("auxShaderMode");
  if (auxiliaryMaterial?.toneMapped !== true) materialErrors.push("auxToneMapped");
  if (auxiliaryMaterial?.transparent !== true) materialErrors.push("auxTransparent");
  if (auxiliaryMaterial?.depthWrite !== false) materialErrors.push("auxDepthWrite");
  if (auxiliaryMaterial?.depthTest !== false) materialErrors.push("auxDepthTest");
  if (auxiliaryMaterial?.dithering !== true) materialErrors.push("auxDithering");
  if (Math.abs((auxiliaryMaterial?.envMapIntensity ?? 0) - 0.75) > 0.001) materialErrors.push("auxEnvMapIntensity");
  if (Math.abs((auxiliaryMaterial?.roughness ?? 0) - 1) > 0.001) materialErrors.push("auxRoughness");
  if (Math.abs((auxiliaryMaterial?.metalness ?? 0) - 0) > 0.001) materialErrors.push("auxMetalness");
  if (auxiliaryMaterial?.renderOrder !== 10) materialErrors.push("auxRenderOrder");
  if (auxiliaryMaterial?.uMouseType !== "Vector2") materialErrors.push("auxMouseUniform");
  if (Math.abs((auxiliaryMaterial?.uUvOffsetScale ?? 0) - 1) > 0.001) materialErrors.push("auxUvOffsetScale");
  if (auxiliaryMaterial?.constructorDefaultsMode !== "source-VA-XA-KA-default-uniform-constructors") {
    materialErrors.push("auxConstructorDefaultsMode");
  }
  if (auxiliaryMaterial?.uRevealConstructorWasZero !== true) materialErrors.push("auxURevealConstructorWasZero");
  if (auxiliaryMaterial?.uMouseLightnessConstructorWasOne !== true) materialErrors.push("auxUMouseLightnessConstructorWasOne");
  if (auxiliaryMaterial?.uMouseSpeedConstructorMode !== "source-VA-XA-KA-uMouseSpeed-construct-null-GA-update-writes-runtime") {
    materialErrors.push("auxUMouseSpeedConstructorMode");
  }
  if (auxiliaryMaterial?.uMouseSpeedConstructorWasNull !== true) materialErrors.push("auxUMouseSpeedConstructorWasNull");
  if (auxiliaryMaterial?.tMouseSimConstructorWasNull !== true) materialErrors.push("auxTMouseSimConstructorWasNull");
  if (auxiliaryMaterial?.tMouseSim2ConstructorWasNull !== true) materialErrors.push("auxTMouseSim2ConstructorWasNull");
  if (auxiliaryMaterial?.tDisplacementConstructorWasNull !== true) materialErrors.push("auxTDisplacementConstructorWasNull");
  if (
    auxiliaryMaterial?.runtimeBindingMode
    !== "source-XA-$A-update-local-tMouseSim-uMouseSpeed-tDisplacement-p1-update-tMouseSim2"
  ) {
    materialErrors.push("auxRuntimeBindingMode");
  }
  if (auxiliaryMaterial?.tMouseSimRuntimeIsLocal === false) materialErrors.push("auxTMouseSimRuntimeLocal");
  if (auxiliaryMaterial?.tMouseSim2RuntimeIsScreen === false) materialErrors.push("auxTMouseSim2RuntimeScreen");
  if (auxiliaryMaterial?.tDisplacementRuntimeIsWavves === false) materialErrors.push("auxTDisplacementRuntimeWavves");
  if (auxiliaryMaterial?.uMouseSpeedRuntimeMatchesLocal === false) materialErrors.push("auxUMouseSpeedRuntimeLocal");
  if (!floatingAuxiliaryMaterial) materialErrors.push("floatingAuxiliaryMaterialMissing");
  if (floatingAuxiliaryMaterial?.mode !== "source-KA-floating-material-state") materialErrors.push("floatingAuxMode");
  if (floatingAuxiliaryMaterial?.shaderMode !== "source-KA-YA-qA-direct-shader") materialErrors.push("floatingAuxShaderMode");
  if (floatingAuxiliaryMaterial?.toneMapped !== true) materialErrors.push("floatingAuxToneMapped");
  if (floatingAuxiliaryMaterial?.transparent !== true) materialErrors.push("floatingAuxTransparent");
  if (floatingAuxiliaryMaterial?.depthWrite !== true) materialErrors.push("floatingAuxDepthWrite");
  if (floatingAuxiliaryMaterial?.depthTest !== true) materialErrors.push("floatingAuxDepthTest");
  if (floatingAuxiliaryMaterial?.dithering !== true) materialErrors.push("floatingAuxDithering");
  if (Math.abs((floatingAuxiliaryMaterial?.envMapIntensity ?? 0) - 0.75) > 0.001) materialErrors.push("floatingAuxEnvMapIntensity");
  if (Math.abs((floatingAuxiliaryMaterial?.roughness ?? 0) - 1) > 0.001) materialErrors.push("floatingAuxRoughness");
  if (Math.abs((floatingAuxiliaryMaterial?.metalness ?? 0) - 0) > 0.001) materialErrors.push("floatingAuxMetalness");
  if ((floatingAuxiliaryMaterial?.renderOrder ?? null) !== null) materialErrors.push("floatingAuxRenderOrder");
  if (floatingAuxiliaryMaterial?.uMouseType !== "Vector2") materialErrors.push("floatingAuxMouseUniform");
  if (Math.abs((floatingAuxiliaryMaterial?.uUvOffsetScale ?? 0) - 1) > 0.001) materialErrors.push("floatingAuxUvOffsetScale");
  if (floatingAuxiliaryMaterial?.constructorDefaultsMode !== "source-VA-XA-KA-default-uniform-constructors") {
    materialErrors.push("floatingAuxConstructorDefaultsMode");
  }
  if (floatingAuxiliaryMaterial?.uRevealConstructorWasZero !== true) materialErrors.push("floatingAuxURevealConstructorWasZero");
  if (floatingAuxiliaryMaterial?.uMouseLightnessConstructorWasOne !== true) {
    materialErrors.push("floatingAuxUMouseLightnessConstructorWasOne");
  }
  if (floatingAuxiliaryMaterial?.uMouseSpeedConstructorMode !== "source-VA-XA-KA-uMouseSpeed-construct-null-GA-update-writes-runtime") {
    materialErrors.push("floatingAuxUMouseSpeedConstructorMode");
  }
  if (floatingAuxiliaryMaterial?.uMouseSpeedConstructorWasNull !== true) materialErrors.push("floatingAuxUMouseSpeedConstructorWasNull");
  if (floatingAuxiliaryMaterial?.tMouseSimConstructorWasNull !== true) {
    materialErrors.push("floatingAuxTMouseSimConstructorWasNull");
  }
  if (floatingAuxiliaryMaterial?.tMouseSim2ConstructorWasNull !== true) {
    materialErrors.push("floatingAuxTMouseSim2ConstructorWasNull");
  }
  if (floatingAuxiliaryMaterial?.tDisplacementConstructorWasNull !== true) {
    materialErrors.push("floatingAuxTDisplacementConstructorWasNull");
  }
  if (floatingAuxiliaryMaterial?.runtimeBindingMode !== "source-ZA-update-material-time-position-no-sampler-writes") {
    materialErrors.push("floatingAuxRuntimeBindingMode");
  }
  if (floatingAuxiliaryMaterial?.tMouseSimRuntimeStaysConstructorNull !== true) {
    materialErrors.push("floatingAuxTMouseSimRuntimeConstructorNull");
  }
  if (floatingAuxiliaryMaterial?.tMouseSim2RuntimeStaysConstructorNull !== true) {
    materialErrors.push("floatingAuxTMouseSim2RuntimeConstructorNull");
  }
  if (floatingAuxiliaryMaterial?.tDisplacementRuntimeStaysConstructorNull !== true) {
    materialErrors.push("floatingAuxTDisplacementRuntimeConstructorNull");
  }
  if (materialErrors.length) {
    throw new Error(`VA material source-state mismatch: ${materialErrors.join(", ")}`);
  }
  const geometryErrors = [];
  const assertSourceMgGeometry = (label, geometry) => {
    const parameters = geometry?.parameters || {};
    if (!geometry) geometryErrors.push(`${label}GeometryMissing`);
    if (geometry?.mode !== "source-mg-rounded-box-radius-default-segments") geometryErrors.push(`${label}Mode`);
    if (geometry?.sourceOrder !== "source-mg-E-C-w-y-U-b-index-order") geometryErrors.push(`${label}SourceOrder`);
    if (geometry?.type !== "RoundedBoxGeometry") geometryErrors.push(`${label}Type`);
    if (geometry?.indexed !== true) geometryErrors.push(`${label}Indexed`);
    if (geometry?.positionCount !== 24) geometryErrors.push(`${label}PositionCount`);
    if (geometry?.normalCount !== 24) geometryErrors.push(`${label}NormalCount`);
    if (geometry?.uvCount !== 24) geometryErrors.push(`${label}UvCount`);
    if (geometry?.indexCount !== 132) geometryErrors.push(`${label}IndexCount`);
    if (geometry?.expectedVertexCount !== 24) geometryErrors.push(`${label}ExpectedVertexCount`);
    if (geometry?.expectedIndexCount !== 132) geometryErrors.push(`${label}ExpectedIndexCount`);
    if (geometry?.uvAllCenter !== true) geometryErrors.push(`${label}UvCenter`);
    if (Math.abs((parameters.width ?? 0) - 1.25) > 0.001) geometryErrors.push(`${label}Width`);
    if (Math.abs((parameters.height ?? 0) - 1.25) > 0.001) geometryErrors.push(`${label}Height`);
    if (Math.abs((parameters.depth ?? 0) - 1.25) > 0.001) geometryErrors.push(`${label}Depth`);
    if (Math.abs((parameters.radius ?? 0) - 0.05) > 0.001) geometryErrors.push(`${label}Radius`);
    if (parameters.radiusSegments !== 1) geometryErrors.push(`${label}RadiusSegments`);
  };
  assertSourceMgGeometry("active", workSettings.activeGeometry);
  assertSourceMgGeometry("about", workSettings.aboutGeometry);
  const floatingGeometry = workSettings.floatingGeometry || {};
  if (floatingGeometry.mode !== "source-ZA-box-geometry-not-mg") geometryErrors.push("floatingMode");
  if (floatingGeometry.type !== "BoxGeometry") geometryErrors.push("floatingType");
  if (floatingGeometry.indexed !== true) geometryErrors.push("floatingIndexed");
  if (Math.abs((floatingGeometry.parameters?.width ?? 0) - 0.5) > 0.001) geometryErrors.push("floatingWidth");
  if (geometryErrors.length) {
    throw new Error(`source block geometry mismatch: ${geometryErrors.join(", ")}`);
  }
  const p1UpdateCulling = workSettings.p1UpdateCulling || {};
  const activeRevealErrors = [];
  if (workSettings.activeProjectRevealOwnership !== "source-yD-onProjectActive-uReveal-only-uRevealProject-owned-by-gallery-enter-out") {
    activeRevealErrors.push("ownership");
  }
  const activeProjectApplicationOrder = workSettings.activeProjectApplicationOrder || {};
  if (activeProjectApplicationOrder.mode !== sourceActiveProjectApplicationOrderMode) activeRevealErrors.push("activeProjectApplicationOrderMode");
  if (activeProjectApplicationOrder.wooshMode !== sourceActiveProjectWooshMode) activeRevealErrors.push("activeProjectWooshMode");
  if (activeProjectApplicationOrder.mainDoesNotOwnActiveProjectWoosh !== true) activeRevealErrors.push("activeProjectWooshMainOwnership");
  if (JSON.stringify(activeProjectApplicationOrder.expected) !== JSON.stringify(sourceActiveProjectApplicationOrder)) {
    activeRevealErrors.push("activeProjectApplicationOrderExpected");
  }
  for (const key of [
    "activeProjectBeforeSpotlight",
    "spotlightBeforeRevealSpread",
    "revealSpreadBeforeWoosh",
    "wooshBeforeUReveal",
    "uRevealBeforeLook",
    "lookBeforeDirectionalLight",
  ]) {
    if (activeProjectApplicationOrder[key] !== true) activeRevealErrors.push(key);
  }
  if ((workSettings.activeProjectRevealTweenCount ?? 0) !== p1UpdateCulling?.total) activeRevealErrors.push("uRevealTweenCount");
  const lightStateOwnership = workSettings.lightStateOwnership || {};
  if (lightStateOwnership.mode !== "source-Se-settings-light-state-onUpdate-intensities") activeRevealErrors.push("lightStateOwnership");
  if (lightStateOwnership.matchesLights !== true) activeRevealErrors.push("lightStateMatches");
  if (Math.abs((lightStateOwnership.state?.spotLight ?? 0) - 220) > 0.001) activeRevealErrors.push("lightStateSpot");
  if (Math.abs((lightStateOwnership.state?.directionalLight ?? 0) - 1.5) > 0.001) activeRevealErrors.push("lightStateDirectional");
  if (Math.abs((lightStateOwnership.state?.directionalLight2 ?? 0) - 1) > 0.001) activeRevealErrors.push("lightStateDirectional2");
  const ambientOwnership = workSettings.ambientOwnership || {};
  if (ambientOwnership.mode !== "source-Se-setAmbientLight-delegates-color-intensity") activeRevealErrors.push("ambientOwnership");
  if (ambientOwnership.colorMode !== "source-Se-setAmbientColor-tweens-ambientLight-color-fanout-env-uDarkenColor") {
    activeRevealErrors.push("ambientColorMode");
  }
  if (ambientOwnership.intensityMode !== "source-Se-setAmbientIntensity-tweens-ambientLight-intensity") {
    activeRevealErrors.push("ambientIntensityMode");
  }
  if (ambientOwnership.killMode !== "source-no-kill-for-setAmbientColor-setAmbientIntensity") activeRevealErrors.push("ambientKillMode");
  if (ambientOwnership.backgroundUniformMode !== "rebuild-background-material-not-source-Se-ambient-target") {
    activeRevealErrors.push("ambientBackgroundUniformMode");
  }
  if (ambientOwnership.environmentDarkenMatchesAmbientColor !== true) activeRevealErrors.push("ambientEnvDarkenColor");
  if (!Array.isArray(ambientOwnership.ambientLightColor) || ambientOwnership.ambientLightColor.length !== 3) {
    activeRevealErrors.push("ambientLightColor");
  }
  if (!Array.isArray(ambientOwnership.environmentDarkenColor) || ambientOwnership.environmentDarkenColor.length !== 3) {
    activeRevealErrors.push("ambientEnvironmentDarkenColor");
  }
  if (!Number.isFinite(ambientOwnership.ambientLightIntensity)) activeRevealErrors.push("ambientLightIntensity");
  const settingsStateOwnership = workSettings.settingsStateOwnership || {};
  if (settingsStateOwnership.mode !== "source-Se-settings-scalar-media-state-onUpdate") activeRevealErrors.push("settingsStateOwnership");
  if (settingsStateOwnership.scalarNoKillMode !== "source-no-kill-for-darken-saturation-contrast-showScene-fluidStrength-mediaOpacity") {
    activeRevealErrors.push("settingsStateScalarNoKillMode");
  }
  if (settingsStateOwnership.killOwnedMode !== "source-kill-owned-revealSpread-envRotation") {
    activeRevealErrors.push("settingsStateKillOwnedMode");
  }
  if (settingsStateOwnership.matchesUniforms !== true) activeRevealErrors.push("settingsStateUniforms");
  if (settingsStateOwnership.fluidStrengthConstructorDefault !== 0.5) activeRevealErrors.push("settingsStateFluidStrengthConstructorDefault");
  if (settingsStateOwnership.fluidStrengthRuntimeOwnership !== "source-Se-setFluidStrength-writes-C1-uFluidStrength") {
    activeRevealErrors.push("settingsStateFluidStrengthRuntimeOwnership");
  }
  if (settingsStateOwnership.fluidStrengthStateDivergenceMode !== "source-C1-constructor-0_5-Se-settings-initial-0") {
    activeRevealErrors.push("settingsStateFluidStrengthDivergenceMode");
  }
  if (Math.abs((settingsStateOwnership.state?.fluidStrength ?? -1) - 0) > 0.0001) {
    activeRevealErrors.push("settingsStateFluidStrengthInitial");
  }
  if (Math.abs((settingsStateOwnership.fluidStrengthUniform ?? -1) - 0.5) > 0.0001) {
    activeRevealErrors.push("settingsStateFluidStrengthUniform");
  }
  if (settingsStateOwnership.fluidStrengthUniformMatchesState !== false) {
    activeRevealErrors.push("settingsStateFluidStrengthShouldDiverge");
  }
  if (settingsStateOwnership.revealSpreadUniformsMatch !== true) activeRevealErrors.push("settingsStateRevealSpread");
  if (settingsStateOwnership.envRotationMatches !== true) activeRevealErrors.push("settingsStateEnvRotation");
  if (settingsStateOwnership.mainColorElementsMatchState !== true) activeRevealErrors.push("settingsStateMainColor");
  if (settingsStateOwnership.mediaBackgroundMatchesState !== true) activeRevealErrors.push("settingsStateMediaBackground");
  if (settingsStateOwnership.mediaPlaneBackgroundsMatchState !== true) activeRevealErrors.push("settingsStateMediaPlanes");
  if (activeRevealErrors.length) {
    throw new Error(`Active project reveal source-shape mismatch: ${activeRevealErrors.join(", ")}`);
  }
  const cullingErrors = [];
  if (p1UpdateCulling.source !== "p1.update-world-position-cull-then-visible-block-update") cullingErrors.push("source");
  if (JSON.stringify(p1UpdateCulling.bounds) !== JSON.stringify({ minX: -5.5, maxX: 5.5, maxZ: 5 })) cullingErrors.push("bounds");
  if (p1UpdateCulling.total !== 10) cullingErrors.push("total");
  const expectedProjectOrder = ["hashgraph-vc", "gc-2026", "following-wildfire", "engaged", "spritexmarvel", "filmsecession", "theroger", "poppr", "demorgen", "thoughtlab"];
  const projectOrder = p1UpdateCulling.sourceProjectOrder || {};
  if (projectOrder.mode !== "source-is-getProjects-active-filter-date-desc") cullingErrors.push("projectOrderMode");
  if (JSON.stringify(projectOrder.expected) !== JSON.stringify(expectedProjectOrder)) cullingErrors.push("projectOrderExpected");
  if (JSON.stringify(projectOrder.actual) !== JSON.stringify(expectedProjectOrder)) cullingErrors.push("projectOrderActual");
  if (projectOrder.matchesSource !== true) cullingErrors.push("projectOrderMatchesSource");
  const carousel = p1UpdateCulling.sourceCarouselDistribution || {};
  const expectedTheta = p1UpdateCulling.total > 0 ? 360 / p1UpdateCulling.total : 0;
  const expectedRadius = p1UpdateCulling.total > 0 ? Math.round(6.5 / 2 / Math.tan(Math.PI / p1UpdateCulling.total)) : 0;
  if (carousel.mode !== "source-p1-setBlocks-circular-radius-sceneWrap-z-demorgen-rotation-lightRadius") cullingErrors.push("carouselMode");
  if (Math.abs((carousel.itemWidth ?? NaN) - 6.5) > 0.0001) cullingErrors.push("carouselItemWidth");
  if (Math.abs((carousel.actualItemWidth ?? NaN) - 6.5) > 0.0001) cullingErrors.push("carouselActualItemWidth");
  if (carousel.itemWidthMatchesSource !== true) cullingErrors.push("carouselItemWidthMatchesSource");
  if (carousel.count !== p1UpdateCulling.total) cullingErrors.push("carouselCount");
  if (carousel.actualCount !== p1UpdateCulling.total) cullingErrors.push("carouselActualCount");
  if (carousel.countMatchesSource !== true) cullingErrors.push("carouselCountMatchesSource");
  if (Math.abs((carousel.thetaDegrees ?? NaN) - expectedTheta) > 0.0001) cullingErrors.push("carouselTheta");
  if (Math.abs((carousel.actualThetaDegrees ?? NaN) - expectedTheta) > 0.0001) cullingErrors.push("carouselActualTheta");
  if (carousel.thetaMatchesSource !== true) cullingErrors.push("carouselThetaMatchesSource");
  if (Math.abs((carousel.expectedRadius ?? NaN) - expectedRadius) > 0.0001) cullingErrors.push("carouselExpectedRadius");
  if (carousel.radiusMatchesSource !== true) cullingErrors.push("carouselRadius");
  if (Math.abs((carousel.expectedLightRadius ?? NaN) - (expectedRadius - 3.5)) > 0.0001) cullingErrors.push("carouselExpectedLightRadius");
  if (Math.abs((carousel.actualLightRadius ?? NaN) - (expectedRadius - 3.5)) > 0.0001) cullingErrors.push("carouselActualLightRadius");
  if (carousel.lightRadiusMatchesSource !== true) cullingErrors.push("carouselLightRadius");
  if (Math.abs((carousel.expectedSceneWrapZ ?? NaN) - (expectedRadius - 0.3)) > 0.0001) cullingErrors.push("carouselExpectedSceneWrapZ");
  if (carousel.sceneWrapZMatchesSource !== true) cullingErrors.push("carouselSceneWrapZ");
  if (!Number.isFinite(carousel.demorgenIndex) || carousel.demorgenIndex < 0 || carousel.demorgenIndex >= p1UpdateCulling.total) {
    cullingErrors.push("carouselDemorgenIndex");
  }
  if (Math.abs((carousel.expectedRotationAdjustmentDegrees ?? NaN) - (-expectedTheta * carousel.demorgenIndex)) > 0.0001) {
    cullingErrors.push("carouselExpectedRotationAdjustment");
  }
  if (carousel.demorgenRotationAdjustmentMatchesSource !== true) cullingErrors.push("carouselDemorgenRotationAdjustment");
  if (carousel.itemPositionsAllMatch !== true) cullingErrors.push("carouselItemPositions");
  if (carousel.itemLookAtAllMatch !== true) cullingErrors.push("carouselItemLookAt");
  if (p1UpdateCulling.sourceVisibilityAllMatch !== true) cullingErrors.push("sourceVisibilityAllMatch");
  if (p1UpdateCulling.visibleUpdateShapeAllMatch !== true) cullingErrors.push("visibleUpdateShapeAllMatch");
  if (!Array.isArray(p1UpdateCulling.items) || p1UpdateCulling.items.length !== p1UpdateCulling.total) cullingErrors.push("items");
  if ((p1UpdateCulling.visibleCount ?? 0) < 1) cullingErrors.push("visibleCount");
  if (Array.isArray(p1UpdateCulling.items)) {
    for (const item of p1UpdateCulling.items) {
      const index = item.sourceIndex ?? -1;
      const expectedPosition = [
        -Math.sin((expectedTheta * index) * Math.PI / 180) * expectedRadius,
        0,
        Math.cos((expectedTheta * index) * Math.PI / 180) * expectedRadius,
      ];
      if (Math.abs((item.sourceRotationDegrees ?? NaN) - (-expectedTheta * index)) > 0.0001) cullingErrors.push(`${item.slug}:sourceRotation`);
      if (item.sourcePositionMatches !== true) cullingErrors.push(`${item.slug}:sourcePosition`);
      if (item.sourceLookAtBlocksWrapMatches !== true) cullingErrors.push(`${item.slug}:sourceLookAt`);
      if (
        !Array.isArray(item.expectedSourcePosition)
        || item.expectedSourcePosition.some((value, positionIndex) => Math.abs(value - expectedPosition[positionIndex]) > 0.0001)
      ) {
        cullingErrors.push(`${item.slug}:expectedSourcePosition`);
      }
    }
  }
  const visibleP1Items = Array.isArray(p1UpdateCulling.items) ? p1UpdateCulling.items.filter((item) => item.visible) : [];
  if (!visibleP1Items.every((item) => item.tMouseSim2IsScreen === true)) cullingErrors.push("visibleTMouseSim2Screen");
  if (!visibleP1Items.every((item) => item.tMouseSimIsLocal === true)) cullingErrors.push("visibleTMouseSimLocal");
  if (!visibleP1Items.every((item) => item.sourceGAUpdateMode === "source-GA-update-material-then-local-Ka-then-bindings-before-p1-side-reveal")) cullingErrors.push("sourceGAUpdateMode");
  if (!visibleP1Items.every((item) => item.sourceUCoordsMode === "source-VA-update-Pe-width-height-times-capped-dpr-no-render-target-rounding")) {
    cullingErrors.push("sourceUCoordsMode");
  }
  if (!visibleP1Items.every((item) => item.uCoordsMatchesSource === true)) cullingErrors.push("uCoordsMatchesSource");
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
    if (mouse?.constructorUniformMode !== "source-Ka-simulationMaterial-constructor-uniform-defaults") uniformSurfaceErrors.push(`${label}ConstructorUniformMode`);
    if (mouse?.constructorUniformDefaults?.uTextureWasNull !== true) uniformSurfaceErrors.push(`${label}ConstructorUTexture`);
    if (mouse?.constructorUniformDefaults?.uNoiseTextureWasNull !== true) uniformSurfaceErrors.push(`${label}ConstructorUNoiseTexture`);
    if (mouse?.constructorUniformDefaults?.uCoordsMode !== "source-Ka-constructor-innerWidth-innerHeight") uniformSurfaceErrors.push(`${label}ConstructorUCoords`);
    if (mouse?.constructorUniformDefaults?.uPosConstructorMode !== "source-Ka-constructor-uPosOld-uPosNew-zero-vectors") uniformSurfaceErrors.push(`${label}ConstructorUPos`);
    if (JSON.stringify(mouse?.constructorUniformDefaults?.uPosOld) !== JSON.stringify([0, 0])) uniformSurfaceErrors.push(`${label}ConstructorUPosOld`);
    if (JSON.stringify(mouse?.constructorUniformDefaults?.uPosNew) !== JSON.stringify([0, 0])) uniformSurfaceErrors.push(`${label}ConstructorUPosNew`);
    if (mouse?.noiseTextureBindingMode !== "source-Ka-uNoiseTexture-constructor-null-no-runtime-writer") uniformSurfaceErrors.push(`${label}NoiseTextureBindingMode`);
    if (mouse?.uNoiseTextureIsSourceNull !== true) uniformSurfaceErrors.push(`${label}NoiseTextureSourceNull`);
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
  const screenSizingErrors = [];
  if (screenMouse?.targetSizingMode !== "source-Lu-mousesim-render-size-div-10-no-post-rounding-no-clamp") {
    screenSizingErrors.push("targetSizingMode");
  }
  if (screenMouse?.targetSizeMatchesSource !== true) screenSizingErrors.push("targetSize");
  if (screenMouse?.uCoordsMatchesSource !== true) screenSizingErrors.push("uCoords");
  if (screenSizingErrors.length) {
    throw new Error(`Lu screen mouse-sim sizing mismatch: ${screenSizingErrors.join(", ")}`);
  }
  const mouseShaderSurface = parsed.probe.mouseSimulation?.shaderSurface || {};
  const mouseShaderErrors = [];
  if (mouseShaderSurface.mode !== "source-Ka-rA-oA-shader-surface") mouseShaderErrors.push("mode");
  if (mouseShaderSurface.vertexMode !== "source-oA-modelview-projection") mouseShaderErrors.push("vertexMode");
  if (mouseShaderSurface.hasSourceNoisePath !== true) mouseShaderErrors.push("noisePath");
  if (mouseShaderSurface.hasSourceDiffusionPlaceholders !== true) mouseShaderErrors.push("diffusionPlaceholders");
  if (mouseShaderSurface.hasSourceCommentedHelpers !== true) mouseShaderErrors.push("commentedHelpers");
  if (mouseShaderSurface.hasSourceCircleBrush !== true) mouseShaderErrors.push("circleBrush");
  if (mouseShaderErrors.length) {
    throw new Error(`Ka/rA shader source-surface mismatch: ${mouseShaderErrors.join(", ")}`);
  }
  if (gaShape) {
    const shapeErrors = Object.entries(gaShape)
      .filter(([, value]) => typeof value === "boolean" && value !== true)
      .map(([key]) => key);
    if (activeMouse?.uvOffsetShaderDeclaration !== "source-HA-vec3-uUvOffset") shapeErrors.push("uvOffsetShaderDeclaration");
    if (activeMouse?.uvOffsetRuntimeBridgeMode !== "source-VA-uniform-value-Vector2-GA-writes-xy-shader-reads-xy") shapeErrors.push("uvOffsetRuntimeBridgeMode");
    if (gaShape.targetSizingMode !== "source-GA-mouseSim-onResize-plane-scale-no-pre-rounding-no-clamp") shapeErrors.push("targetSizingMode");
    if (activeMouse?.targetSizingMode !== "source-GA-mouseSim-onResize-plane-scale-no-clamp") shapeErrors.push("activeTargetSizingMode");
    if (gaShape.updateLerpMode !== "source-Ka-newPos-lerp-targetPos-delta-times-7_5-no-clamp") shapeErrors.push("updateLerpMode");
    if (gaShape.raycastMode !== "source-Ka-onMouseMove-per-item-raycast-immediate-pointer") shapeErrors.push("raycastMode");
    if (gaShape.raycastEventMode !== "source-Ka-raycast-during-mousemove-not-raf-tail") shapeErrors.push("raycastEventMode");
    if (gaShape.raycastNormalizationMode !== "source-Pe-width-height") shapeErrors.push("raycastNormalizationMode");
    if (gaShape.raycastUvWriteMode !== "source-Ka-raycast-hit-uv-direct-targetPos-no-clamp") shapeErrors.push("raycastUvWriteMode");
    if (activeMouse?.raycastUvWriteMode !== "source-Ka-raycast-hit-uv-direct-targetPos-no-clamp") shapeErrors.push("activeRaycastUvWriteMode");
    if (!Array.isArray(activeMouse?.sourceRayPlaneScale) || Math.abs((activeMouse.sourceRayPlaneScale[2] ?? NaN) - 1.5) > 0.0001) {
      shapeErrors.push("sourceRayPlaneScaleZ");
    }
    if (!Array.isArray(activeMouse?.rayPlaneScale) || Math.abs((activeMouse.rayPlaneScale[2] ?? NaN) - 1.5) > 0.0001) {
      shapeErrors.push("rayPlaneScaleZ");
    }
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
  if (activeMouse?.raycastUvWriteMode !== "source-Ka-raycast-hit-uv-direct-targetPos-no-clamp") {
    throw new Error(`GA/Ka raycast UV write mismatch: ${activeMouse?.raycastUvWriteMode || "missing"}`);
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
    if (reflectionTargets.constructorMode !== "source-i1-default-width-height-512-blurIterations-2") reflectionErrors.push("constructorMode");
    if (reflectionTargets.constructorWidth !== 512 || reflectionTargets.constructorHeight !== 512) reflectionErrors.push("constructorSize");
    if (reflectionTargets.blurIterations !== 2) reflectionErrors.push("blurIterations");
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
  const gpuBridge = parsed.probe.renderer?.gpuBridge || {};
  const gpuBridgeErrors = [];
  if (gpuBridge.mode !== "source-Qe-gpuCheck-XD-detect-gpu-5_0_38") gpuBridgeErrors.push("mode");
  if (gpuBridge.defaultMode !== "source-Le-GPU_TIER-default-3-LOW_RES-false") gpuBridgeErrors.push("defaultMode");
  if (gpuBridge.benchmarksURL !== "/vendor/detect-gpu/benchmarks") gpuBridgeErrors.push("benchmarksURL");
  if (gpuBridge.defaultTier !== 3) gpuBridgeErrors.push("defaultTier");
  if (typeof gpuBridge.tier !== "number") gpuBridgeErrors.push("tier");
  if (gpuBridge.lowRes !== (gpuBridge.tier < 3)) gpuBridgeErrors.push("lowRes");
  if (gpuBridge.initialized !== true) gpuBridgeErrors.push("initialized");
  if (gpuBridge.fallbackApplied === true && gpuBridge.tier !== 3) gpuBridgeErrors.push("fallbackTier");
  if (gpuBridge.result && gpuBridge.result.tier !== gpuBridge.tier) gpuBridgeErrors.push("resultTier");
  if (parsed.probe.renderer?.dprPolicy?.lowRes !== gpuBridge.lowRes) gpuBridgeErrors.push("dprLowRes");
  if ((mainSettings.gpuTier ?? null) !== gpuBridge.tier) gpuBridgeErrors.push("mainGpuTier");
  if (gpuBridgeErrors.length) {
    throw new Error(`GPU tier bridge source-shape mismatch: ${gpuBridgeErrors.join(", ")}`);
  }
  const expectedWorkRenderSettings = {
    renderToScreen: false,
    fxaa: { enabled: false },
    mousesim: { enabled: true },
    luminosity: { threshold: 0.1, smoothing: 0.95, enabled: true },
    bloom: { strength: 0.15, radius: 1.5, enabled: true },
    blur: { scale: 1, strength: 8, enabled: false },
    fluid: { enabled: false, mouseForce: 25, cursorSize: 20, delta: 0.019, poissonIterations: 1, bounce: false },
  };
  const expectedMainFluidEnabled = (mainSettings.gpuTier ?? 0) >= 3;
  const expectedMainRenderSettings = {
    renderToScreen: true,
    fxaa: { enabled: false },
    mousesim: { enabled: false },
    luminosity: { threshold: 0.1, smoothing: 1, enabled: false },
    bloom: { strength: 0.05, radius: 0.01, enabled: false },
    blur: { scale: 1, strength: 8, enabled: false },
    fluid: { enabled: expectedMainFluidEnabled, mouseForce: 5, cursorSize: 6, delta: 0.125, poissonIterations: 1, bounce: false },
  };
  const ownershipErrors = [];
  const workRenderManagerSettings = parsed.probe.settings?.work?.renderManagerSettings || {};
  const mainRenderManagerSettings = mainSettings?.renderManagerSettings || {};
  if (workRenderManagerSettings.mode !== "source-kA-initSettings-overrides-Lu-work-render-manager-settings") {
    ownershipErrors.push("workRenderManagerSettingsMode");
  }
  if (JSON.stringify(workRenderManagerSettings.expected) !== JSON.stringify(expectedWorkRenderSettings)) {
    ownershipErrors.push("workRenderManagerSettingsExpected");
  }
  if (JSON.stringify(workRenderManagerSettings.actual) !== JSON.stringify(expectedWorkRenderSettings)) {
    ownershipErrors.push("workRenderManagerSettingsActual");
  }
  if (workRenderManagerSettings.matchesSource !== true) ownershipErrors.push("workRenderManagerSettingsMatch");
  if (workRenderManagerSettings.instanceOwned !== true) ownershipErrors.push("workRenderManagerSettingsInstanceOwned");
  if (mainRenderManagerSettings.mode !== "source-I1-initSettings-main-render-manager-settings-gpu-tier-fluid-branch") {
    ownershipErrors.push("mainRenderManagerSettingsMode");
  }
  if (mainRenderManagerSettings.expectedFluidEnabled !== expectedMainFluidEnabled) {
    ownershipErrors.push("mainRenderManagerSettingsExpectedFluidEnabled");
  }
  if (JSON.stringify(mainRenderManagerSettings.expected) !== JSON.stringify(expectedMainRenderSettings)) {
    ownershipErrors.push("mainRenderManagerSettingsExpected");
  }
  if (JSON.stringify(mainRenderManagerSettings.actual) !== JSON.stringify(expectedMainRenderSettings)) {
    ownershipErrors.push("mainRenderManagerSettingsActual");
  }
  if (mainRenderManagerSettings.matchesSource !== true) ownershipErrors.push("mainRenderManagerSettingsMatch");
  if (mainRenderManagerSettings.instanceOwned !== true) ownershipErrors.push("mainRenderManagerSettingsInstanceOwned");
  const lensflareSettings = mainSettings?.lensflareSettings || {};
  const expectedLensflareSettings = {
    scale: [1.5, 1.5],
    exposure: 1,
    clamp: 1,
    enabled: false,
  };
  if (lensflareSettings.mode !== "source-I1-initSettings-lensflare-disabled-scale-1_5-exposure-1-clamp-1") {
    ownershipErrors.push("lensflareSettingsMode");
  }
  if (JSON.stringify(lensflareSettings.expected) !== JSON.stringify(expectedLensflareSettings)) ownershipErrors.push("lensflareSettingsExpected");
  if (JSON.stringify(lensflareSettings.actual) !== JSON.stringify(expectedLensflareSettings)) ownershipErrors.push("lensflareSettingsActual");
  if (lensflareSettings.matchesSource !== true) ownershipErrors.push("lensflareSettingsMatch");
  if (workOwnership?.source !== "Lu-single-screen-mesh-material-swap") ownershipErrors.push("workSourceOwnership");
  if (workOwnership?.bridge !== "source-single-screen-material-swap") ownershipErrors.push("workBridgeOwnership");
  if (workOwnership?.compositeScreenMode !== "source-work-post-screen") ownershipErrors.push("workCompositeScreenMode");
  if (workOwnership?.sourceFinalTargetReset !== "source-Lu-renderToScreen-false-renderTargetComposite-then-null") {
    ownershipErrors.push("workFinalTargetReset");
  }
  if (workOwnership?.productionOutputChanged !== true) ownershipErrors.push("workProductionOutputChanged");
  if (mainOwnership?.source !== "I1-single-screen-mesh-material-swap") ownershipErrors.push("mainSourceOwnership");
  if (mainOwnership?.bridge !== "source-single-screen-material-swap") ownershipErrors.push("mainBridgeOwnership");
  if (mainOwnership?.finalScreenMode !== "source-main-post-screen") ownershipErrors.push("mainFinalScreenMode");
  if (mainOwnership?.optionalBlurScreenMode !== "source-I1-mainPostScreen-material-swap") ownershipErrors.push("mainOptionalBlurScreenMode");
  if (mainOwnership?.lensflareScreenMode !== "source-I1-mainPostScreen-material-swap") ownershipErrors.push("mainLensflareScreenMode");
  if (mainOwnership?.defaultScreenMaterialMode !== "source-I1-default-direct-C1-screen-render-fxaa-tail-only") ownershipErrors.push("mainDefaultScreenMaterialMode");
  if (mainOwnership?.retainedMainCompositeSurfaceRole !== "retained-source-Lu-lA-surface-not-active-I1-screen-material") {
    ownershipErrors.push("mainRetainedCompositeSurfaceRole");
  }
  if (mainOwnership?.retainedMainCompositeConstructionChain !== "source-Lu-initRenderer-creates-lA-kA-replaces-with-OA-I1-initRenderer-creates-C1") {
    ownershipErrors.push("mainRetainedCompositeConstructionChain");
  }
  if (mainOwnership?.activeMainScreenMaterial !== "source-I1-C1") ownershipErrors.push("mainActiveScreenMaterial");
  if (mainOwnership?.preCompositeTargetRole !== "source-I1-renderTargetComposite-unused-in-default-renderToScreen") {
    ownershipErrors.push("mainPreCompositeTargetRole");
  }
  if (mainOwnership?.defaultRenderToScreenWritesCompositeTarget !== false) {
    ownershipErrors.push("mainDefaultRenderToScreenWritesCompositeTarget");
  }
  if (mainOwnership?.productionOutputChanged !== false) ownershipErrors.push("mainProductionOutputChanged");
  if (mainSettings?.mainRawSceneMode !== "source-U1-empty-main-scene-background-D9D9D9-linear-to-srgb") {
    ownershipErrors.push("mainRawSceneMode");
  }
  if (mainSettings?.mainRawCameraMode !== "source-yg-perspective-distance-1000-no-camera-controller") {
    ownershipErrors.push("mainRawCameraMode");
  }
  if (mainSettings?.mainRawRenderCamera !== "source-U1-I1-renderTargetA-uses-yg-camera") {
    ownershipErrors.push("mainRawRenderCamera");
  }
  const mainRawCamera = mainSettings?.mainRawCamera || {};
  const expectedMainRawFov = (2 * Math.atan(viewport.width / (viewport.width / viewport.height) / (2 * 1000))) * (180 / Math.PI);
  if (mainRawCamera.surfaceMode !== "source-yg-Ya-perspective-Ef-inner-aspect-near1-distance1000-far2000") {
    ownershipErrors.push("mainRawCameraSurfaceMode");
  }
  if (mainRawCamera.resizeProjectionMode !== "source-yg-resize-super-then-Ef-fov-aspect-updateProjectionMatrix") {
    ownershipErrors.push("mainRawCameraResizeProjectionMode");
  }
  if (Math.abs((mainRawCamera.expectedFov ?? 0) - expectedMainRawFov) > 0.001) ownershipErrors.push("mainRawCameraExpectedFov");
  if (Math.abs((mainRawCamera.fov ?? 0) - expectedMainRawFov) > 0.001) ownershipErrors.push("mainRawCameraFov");
  if (mainRawCamera.fovMatchesSource !== true) ownershipErrors.push("mainRawCameraFovMatchesSource");
  if (Math.abs((mainRawCamera.distance ?? 0) - 1000) > 0.001) ownershipErrors.push("mainRawCameraDistance");
  if (Math.abs((mainRawCamera.expectedNear ?? 0) - 1) > 0.001) ownershipErrors.push("mainRawCameraExpectedNear");
  if (Math.abs((mainRawCamera.near ?? 0) - 1) > 0.001) ownershipErrors.push("mainRawCameraNear");
  if (Math.abs((mainRawCamera.expectedFar ?? 0) - 2000) > 0.001) ownershipErrors.push("mainRawCameraExpectedFar");
  if (Math.abs((mainRawCamera.far ?? 0) - 2000) > 0.001) ownershipErrors.push("mainRawCameraFar");
  if (Math.abs((mainRawCamera.aspect ?? 0) - (viewport.width / viewport.height)) > 0.001) ownershipErrors.push("mainRawCameraAspect");
  if (JSON.stringify(mainRawCamera.position || null) !== JSON.stringify([0, 0, 1000])) {
    ownershipErrors.push(`mainRawCameraPosition=${JSON.stringify(mainRawCamera.position || null)}`);
  }
  const workPassInputs = parsed.probe.settings?.work?.renderManagerPassInputs || {};
  for (const [key, expected] of Object.entries({
    blurSource: "source-Lu-renderTargetA-to-renderTargetBlurA-then-renderTargetBlurB",
    luminositySource: "source-Lu-renderTargetBlurB-if-blur-else-renderTargetA",
    bloomSource: "source-Lu-renderTargetBright-if-luminosity-else-renderTargetA",
    oaSceneSource: "source-Lu-renderTargetBlurB-if-blur-else-renderTargetA",
    blurinessUpdateMode: "source-Na-uBluriness-init-zero-no-update-write",
  })) {
    if (workPassInputs[key] !== expected) ownershipErrors.push(`workPassInput-${key}`);
  }
  const mainPassInputs = mainSettings?.renderManagerPassInputs || {};
  for (const [key, expected] of Object.entries({
    blurSource: "source-I1-renderTargetA-to-renderTargetBlurA-then-renderTargetBlurB",
    lensflareSource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
    luminositySource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
    bloomSource: "source-I1-renderTargetBright-if-luminosity-else-renderTargetA",
    c1SceneSource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
    c1BloomSource: "source-I1-renderTargetsHorizontal0",
    c1RuntimeUniformOrder: "source-I1-update-writes-C1-tScene-bools-tLensflare-after-fluid-before-screen-render",
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
  if (workTargetState.sourceMode !== "source-Lu-target-state-renderTargetA-depthBuffer-true-derived-clones") {
    targetStateErrors.push("workTargetStateMode");
  }
  if (workTargetState.targetOwnershipMode !== "source-Lu-renderTargetA-clone-graph-depth-toggle-after-clones") {
    targetStateErrors.push("workTargetOwnershipMode");
  }
  if (mainTargetState.sourceMode !== "source-I1-target-state-renderTargetA-depthBuffer-false-derived-clones") {
    targetStateErrors.push("mainTargetStateMode");
  }
  if (mainTargetState.targetOwnershipMode !== "source-I1-renderTargetA-clone-graph-depthless-raw") {
    targetStateErrors.push("mainTargetOwnershipMode");
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
    "renderTargetB",
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
  if (preCompositeUniforms?.vertexMode !== "source-D1-matrix-fullscreen") materialSurfaceErrors.push("preCompositeVertexMode");
  if (preCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("preCompositeGlslVersion");
  if (preCompositeUniforms?.tSceneSourceMode !== "source-I1-renderTargetA-raw-main-scene") materialSurfaceErrors.push("preCompositeSceneSourceMode");
  if (preCompositeUniforms?.tSceneIsMainRawTarget !== true) materialSurfaceErrors.push("preCompositeSceneMainRawBinding");
  if (preCompositeUniforms?.tSceneIsCompositeTarget !== false) materialSurfaceErrors.push("preCompositeSceneCompositeSelfBinding");
  if (preCompositeUniforms?.uTimeUpdateOrder !== "source-U1-C1-update-after-I1-render") {
    materialSurfaceErrors.push("preCompositeUTimeUpdateOrder");
  }
  const expectedC1UniformKeys = [
    "tScene",
    "tWork",
    "tMedia",
    "tBloom",
    "tBlur",
    "tFluid",
    "tPortal",
    "tMouseSim",
    "boolBloom",
    "boolFluid",
    "boolLuminosity",
    "boolFxaa",
    "uTime",
    "tNoise",
    "tLensflare",
    "uRatio",
    "tPerlin",
    "uDisplacementSize",
    "uContainerSize",
    "uDisplacement",
    "uPerlin",
    "uBgColor",
    "uReveal",
    "uMediaReveal",
    "uContrast",
    "uTransformX",
    "uFluidStrength",
  ];
  const c1MaterialSurface = preCompositeUniforms?.materialUniformSurface || {};
  if (c1MaterialSurface.mode !== "source-C1-constructor-uniform-order-with-unused-tPortal") {
    materialSurfaceErrors.push("preCompositeC1UniformSurfaceMode");
  }
  if (c1MaterialSurface.resizeMode !== "source-U1-C1-resize-css-width-height") {
    materialSurfaceErrors.push("preCompositeC1ResizeMode");
  }
  if (JSON.stringify(c1MaterialSurface.sourceUniformKeys || null) !== JSON.stringify(expectedC1UniformKeys)) {
    materialSurfaceErrors.push("preCompositeC1SourceUniformKeys");
  }
  if (JSON.stringify(c1MaterialSurface.uniformKeys || null) !== JSON.stringify(expectedC1UniformKeys)) {
    materialSurfaceErrors.push("preCompositeC1RuntimeUniformKeys");
  }
  if (c1MaterialSurface.matchesSourceOrder !== true) materialSurfaceErrors.push("preCompositeC1UniformOrder");
  if (c1MaterialSurface.hasTPortalUniform !== true) materialSurfaceErrors.push("preCompositeC1TPortalUniform");
  if (c1MaterialSurface.samplerConstructorMode !== "source-C1-sampler-uniforms-construct-null-branch-owned-bindings") {
    materialSurfaceErrors.push("preCompositeC1SamplerConstructorMode");
  }
  if (preCompositeUniforms?.uFluidStrengthConstructorDefault !== 0.5) {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthConstructorDefault");
  }
  if (preCompositeUniforms?.uFluidStrengthRuntimeOwnership !== "source-Se-setFluidStrength-writes-C1-uFluidStrength") {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthRuntimeOwnership");
  }
  if (preCompositeUniforms?.uFluidStrengthStateDivergenceMode !== "source-C1-constructor-0_5-Se-settings-initial-0") {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthDivergenceMode");
  }
  if (Math.abs((preCompositeUniforms?.uFluidStrength ?? -1) - 0.5) > 0.0001) {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthInitialValue");
  }
  if (c1MaterialSurface.uFluidStrengthConstructorMode !== "source-C1-uFluidStrength-new-I-0_5") {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthConstructorMode");
  }
  if (c1MaterialSurface.uFluidStrengthConstructorDefault !== 0.5) {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthSurfaceDefault");
  }
  if (c1MaterialSurface.uFluidStrengthRuntimeOwnership !== "source-Se-setFluidStrength-writes-C1-uFluidStrength") {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthSurfaceRuntimeOwnership");
  }
  if (c1MaterialSurface.uFluidStrengthStateDivergenceMode !== "source-C1-constructor-0_5-Se-settings-initial-0") {
    materialSurfaceErrors.push("preCompositeC1FluidStrengthSurfaceDivergenceMode");
  }
  if (c1MaterialSurface.tBloomBindingMode !== "source-I1-bloom-branch-only") {
    materialSurfaceErrors.push("preCompositeC1TBloomBindingMode");
  }
  if (preCompositeUniforms?.boolBloom === false && c1MaterialSurface.tBloomIsNullWhenDisabled !== true) {
    materialSurfaceErrors.push("preCompositeC1TBloomNullWhenDisabled");
  }
  if (preCompositeUniforms?.boolBloom === true && c1MaterialSurface.tBloomIsMainBloomTargetWhenEnabled !== true) {
    materialSurfaceErrors.push("preCompositeC1TBloomMainTargetWhenEnabled");
  }
  if (c1MaterialSurface.tPortalBindingMode !== "source-C1-material-uniform-A1-unused-constructor-null") {
    materialSurfaceErrors.push("preCompositeC1TPortalBindingMode");
  }
  if (c1MaterialSurface.tPortalIsSourceNull !== true) materialSurfaceErrors.push("preCompositeC1TPortalSourceNull");
  if (c1MaterialSurface.tBlurBindingMode !== "source-C1-constructor-null-A1-unused") {
    materialSurfaceErrors.push("preCompositeC1TBlurBindingMode");
  }
  if (c1MaterialSurface.tBlurIsSourceNull !== true) materialSurfaceErrors.push("preCompositeC1TBlurSourceNull");
  if (c1MaterialSurface.tFluidBindingMode !== "source-I1-fluid-branch-when-enabled-else-constructor-null") {
    materialSurfaceErrors.push("preCompositeC1TFluidBindingMode");
  }
  if (preCompositeUniforms?.boolFluid === false && c1MaterialSurface.tFluidIsNullWhenDisabled !== true) {
    materialSurfaceErrors.push("preCompositeC1TFluidNullWhenDisabled");
  }
  if (preCompositeUniforms?.boolFluid === true && c1MaterialSurface.tFluidIsMainFluidTargetWhenEnabled !== true) {
    materialSurfaceErrors.push("preCompositeC1TFluidMainTargetWhenEnabled");
  }
  if (c1MaterialSurface.tWorkBindingMode !== "source-nD-init-one-time-C1-tWork-work-renderTargetComposite") {
    materialSurfaceErrors.push("preCompositeC1TWorkBindingMode");
  }
  if (c1MaterialSurface.tWorkIsWorkCompositeTarget !== true) {
    materialSurfaceErrors.push("preCompositeC1TWorkCompositeTarget");
  }
  if (c1MaterialSurface.tMediaBindingMode !== "source-nD-init-one-time-C1-tMedia-media-renderTargetComposite") {
    materialSurfaceErrors.push("preCompositeC1TMediaBindingMode");
  }
  if (c1MaterialSurface.tMediaIsMediaCompositeTarget !== true) {
    materialSurfaceErrors.push("preCompositeC1TMediaCompositeTarget");
  }
  if (c1MaterialSurface.tMouseSimBindingMode !== "source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output") {
    materialSurfaceErrors.push("preCompositeC1TMouseSimBindingMode");
  }
  if (c1MaterialSurface.tMouseSimIsInitialScreenMouseTarget !== true) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimInitialTarget");
  }
  const c1MouseSimBinding = c1MaterialSurface.tMouseSimSourceBinding || {};
  if (c1MouseSimBinding.mode !== "source-nD-samples-sA-output-texture-once-before-render-loop") {
    materialSurfaceErrors.push("preCompositeC1TMouseSimSourceBindingMode");
  }
  if (c1MouseSimBinding.sourceSAInitialOutputIndex !== 0) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimSourceInitialIndex");
  }
  if (c1MouseSimBinding.sourceSAOutputFlipMode !== "source-sA-render-uses-current-as-input-then-flips-output") {
    materialSurfaceErrors.push("preCompositeC1TMouseSimSourceFlipMode");
  }
  if (c1MouseSimBinding.targetCount !== 2) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimTargetCount");
  }
  if (c1MouseSimBinding.boundTextureIndex !== 0) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimBoundIndex");
  }
  if (c1MouseSimBinding.currentOutputIndex !== screenMouse?.index) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimCurrentOutputIndex");
  }
  if (c1MouseSimBinding.remainsInitialOutputTexture !== true) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimRemainsInitial");
  }
  if (c1MouseSimBinding.matchesCurrentOutputTexture !== (screenMouse?.index === 0)) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimCurrentOutputTexture");
  }
  if (c1MouseSimBinding.matchesCurrentOnlyWhenOutputIndexZero !== true) {
    materialSurfaceErrors.push("preCompositeC1TMouseSimCurrentOnlyWhenIndexZero");
  }
  if (c1MaterialSurface.tPerlinIsLoadedTexture !== true) materialSurfaceErrors.push("preCompositeC1TPerlinBinding");
  if (c1MaterialSurface.uDisplacementSizeMode !== "source-C1-constructor-default-new-Vector2-no-runtime-write") {
    materialSurfaceErrors.push("preCompositeC1UDisplacementSizeMode");
  }
  if (Math.abs((c1MaterialSurface.uDisplacement ?? 0) - 0.1) > 0.0001) {
    materialSurfaceErrors.push("preCompositeC1UDisplacement");
  }
  if (Math.abs((c1MaterialSurface.uPerlin ?? 0) - 0.1) > 0.0001) {
    materialSurfaceErrors.push("preCompositeC1UPerlin");
  }
  if (!Array.isArray(c1MaterialSurface.uDisplacementSize) || c1MaterialSurface.uDisplacementSize.length !== 2) {
    materialSurfaceErrors.push("preCompositeC1UDisplacementSize");
  }
  if (JSON.stringify(c1MaterialSurface.uDisplacementSize || null) !== JSON.stringify([0, 0])) {
    materialSurfaceErrors.push("preCompositeC1UDisplacementSizeDefault");
  }
  if (!Array.isArray(c1MaterialSurface.uContainerSize) || c1MaterialSurface.uContainerSize.length !== 2) {
    materialSurfaceErrors.push("preCompositeC1UContainerSize");
  }
  if (JSON.stringify(c1MaterialSurface.uContainerSize || null) !== JSON.stringify([viewport.width, viewport.height])) {
    materialSurfaceErrors.push("preCompositeC1UContainerSizeCssViewport");
  }
  const expectedWorkCompositeMaterialMode = debugCompositeProbe ? "debug-OA-raw-glsl3" : "source-OA-raw-glsl3";
  if (workCompositeUniforms?.materialMode !== expectedWorkCompositeMaterialMode) materialSurfaceErrors.push("workCompositeMaterialMode");
  if (workCompositeUniforms?.vertexMode !== "source-el-matrix-fullscreen") materialSurfaceErrors.push("workCompositeVertexMode");
  if (workCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("workCompositeGlslVersion");
  if (!debugCompositeProbe && workCompositeUniforms?.debugShaderActive !== false) materialSurfaceErrors.push("workCompositeDebugShaderActive");
  if (!debugCompositeProbe && workCompositeUniforms?.productionShaderIsSourceSurface !== true) materialSurfaceErrors.push("workCompositeProductionShader");
  const expectedOABoolConstructorDefaults = {
    boolBloom: false,
    boolFluid: false,
    boolLuminosity: false,
    boolFxaa: false,
  };
  if (JSON.stringify(workCompositeUniforms?.constructorBoolDefaults || null) !== JSON.stringify(expectedOABoolConstructorDefaults)) {
    materialSurfaceErrors.push("workCompositeConstructorBoolDefaults");
  }
  if (workCompositeUniforms?.runtimeBoolOwnership !== "source-Lu-update-writes-OA-bools-from-settings-before-composite-render") {
    materialSurfaceErrors.push("workCompositeRuntimeBoolOwnership");
  }
  if (workCompositeUniforms?.runtimeBoolsMatchSettings !== true) materialSurfaceErrors.push("workCompositeRuntimeBools");
  if (workCompositeUniforms?.boolBloom !== true) materialSurfaceErrors.push("workCompositeBoolBloomRuntime");
  if (workCompositeUniforms?.boolFluid !== false) materialSurfaceErrors.push("workCompositeBoolFluidRuntime");
  if (workCompositeUniforms?.boolLuminosity !== true) materialSurfaceErrors.push("workCompositeBoolLuminosityRuntime");
  if (workCompositeUniforms?.boolFxaa !== false) materialSurfaceErrors.push("workCompositeBoolFxaaRuntime");
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
  if (mainCompositeUniforms?.vertexMode !== "source-el-matrix-fullscreen") materialSurfaceErrors.push("mainCompositeVertexMode");
  if (mainCompositeUniforms?.glslVersion !== "300 es") materialSurfaceErrors.push("mainCompositeGlslVersion");
  if (mainCompositeUniforms?.surfaceRole !== "retained-source-Lu-lA-surface-not-active-I1-screen-material") {
    materialSurfaceErrors.push("mainCompositeSurfaceRole");
  }
  if (mainCompositeUniforms?.constructionChain !== "source-Lu-initRenderer-creates-lA-kA-replaces-with-OA-I1-initRenderer-creates-C1") {
    materialSurfaceErrors.push("mainCompositeConstructionChain");
  }
  if (mainCompositeUniforms?.activeMainScreenMaterial !== "source-I1-C1") {
    materialSurfaceErrors.push("mainCompositeActiveMainScreenMaterial");
  }
  if (mainCompositeUniforms?.hasSourceUnusedMouseSimUniform !== true) materialSurfaceErrors.push("mainCompositeUnusedMouseSimUniform");
  const expectedMainCompositeConstructorBools = {
    boolBloom: false,
    boolFluid: false,
    boolLuminosity: false,
    boolFxaa: false,
  };
  if (JSON.stringify(mainCompositeUniforms?.constructorBoolDefaults) !== JSON.stringify(expectedMainCompositeConstructorBools)) {
    materialSurfaceErrors.push("mainCompositeConstructorBoolDefaults");
  }
  if (mainCompositeUniforms?.runtimeBoolOwnership !== "source-Lu-update-writes-lA-bools-from-settings-before-composite-render") {
    materialSurfaceErrors.push("mainCompositeRuntimeBoolOwnership");
  }
  for (const [key, value] of Object.entries(expectedMainCompositeConstructorBools)) {
    if (mainCompositeUniforms?.[key] !== value) materialSurfaceErrors.push(`mainComposite${key[0].toUpperCase()}${key.slice(1)}`);
  }
  const mainCompositeSurface = mainCompositeUniforms?.shaderSurface || {};
  if (mainCompositeSurface.formulaMode !== "source-aA-helper-surface-and-vignette-local") materialSurfaceErrors.push("mainCompositeFormulaMode");
  for (const key of [
    "hasLuminanceHelper",
    "hasSourceSaturationHelper",
    "hasSourceVignetteHelper",
    "hasSourceCircleHelper",
    "hasSourceContrastHelper",
    "hasSourceHueHelper",
    "hasSourceRgbshiftHelper",
    "hasSourceVignetteLocals",
    "sourceUniformOrder",
  ]) {
    if (mainCompositeSurface[key] !== true) materialSurfaceErrors.push(`mainComposite${key[0].toUpperCase()}${key.slice(1)}`);
  }
  const lensflareUniforms = parsed.probe.uniforms?.lensflare;
  if (lensflareUniforms?.screenMode !== "source-I1-mainPostScreen-material-swap") materialSurfaceErrors.push("lensflareScreenMode");
  if (lensflareUniforms?.ownership !== "source-I1-lensflareMaterial-created-only-when-enabled") materialSurfaceErrors.push("lensflareOwnership");
  if (lensflareUniforms?.setLightPositionMode !== "source-I1-setLightPosition-guards-lensflare-enabled") {
    materialSurfaceErrors.push("lensflareSetLightPositionMode");
  }
  if (lensflareUniforms?.mouseMoveInputMode !== "source-U1-onMouseMove-setLightPosition-0-1-y-over-Pe-h") {
    materialSurfaceErrors.push("lensflareMouseMoveInputMode");
  }
  if (lensflareUniforms?.defaultDisabledNoMaterialMutation !== true) {
    materialSurfaceErrors.push("lensflareDefaultDisabledNoMaterialMutation");
  }
  if (lensflareUniforms?.enabled !== false) materialSurfaceErrors.push("lensflareDefaultEnabled");
  if (lensflareUniforms?.materialCreated !== false) materialSurfaceErrors.push("lensflareDefaultMaterialCreated");
  if (lensflareUniforms?.materialMode !== null) materialSurfaceErrors.push("lensflareDefaultMaterialMode");
  if (lensflareUniforms?.glslVersion !== null) materialSurfaceErrors.push("lensflareDefaultGlslVersion");
  if (lensflareUniforms?.clearMode !== "source-I1-lensflare-explicit-clear") materialSurfaceErrors.push("lensflareClearMode");
  if (lensflareUniforms?.lightPosition !== null) materialSurfaceErrors.push("lensflareDefaultLightPosition");
  if (lensflareUniforms?.scale !== null) materialSurfaceErrors.push("lensflareDefaultScale");
  if (lensflareUniforms?.exposure !== null) materialSurfaceErrors.push("lensflareDefaultExposure");
  if (lensflareUniforms?.clamp !== null) materialSurfaceErrors.push("lensflareDefaultClamp");
  const passMaterialOwnership = passMaterials.ownership || {};
  if (passMaterialOwnership.source !== "Lu-and-I1-each-create-owned-pass-materials-in-initRenderer") {
    materialSurfaceErrors.push("passMaterialOwnershipSource");
  }
  if (passMaterialOwnership.workMaterialOwnership !== "source-Lu-pass-materials-owned-by-work-render-manager") {
    materialSurfaceErrors.push("workPassMaterialOwnership");
  }
  if (passMaterialOwnership.mainMaterialOwnership !== "source-I1-pass-materials-owned-by-main-render-manager") {
    materialSurfaceErrors.push("mainPassMaterialOwnership");
  }
  if (passMaterialOwnership.workMainLuminosityShared !== false) materialSurfaceErrors.push("workMainLuminosityShared");
  if (passMaterialOwnership.workMainStandardBlurShared !== false) materialSurfaceErrors.push("workMainStandardBlurShared");
  if (passMaterialOwnership.workMainFxaaShared !== false) materialSurfaceErrors.push("workMainFxaaShared");
  if (passMaterialOwnership.workMainBloomBlurShared !== false) materialSurfaceErrors.push("workMainBloomBlurShared");
  if (passMaterialOwnership.workMainBloomCompositeShared !== false) materialSurfaceErrors.push("workMainBloomCompositeShared");
  if (passMaterialOwnership.allOwnedMaterialsSeparate !== true) materialSurfaceErrors.push("allOwnedMaterialsSeparate");
  for (const [key, expectedMode] of Object.entries({
    mediaComposite: "source-W1-raw-glsl3",
    luminosity: "source-sg-raw-glsl3",
    workLuminosity: "source-sg-raw-glsl3",
    mainLuminosity: "source-sg-raw-glsl3",
    bloomBlur: "source-rg-raw-glsl3",
    bloomComposite: "source-cg-raw-glsl3",
    mainBloomBlur: "source-rg-raw-glsl3",
    mainBloomComposite: "source-cg-raw-glsl3",
    fxaa: "source-ig-raw-glsl3",
    workFxaa: "source-ig-raw-glsl3",
    mainFxaa: "source-ig-raw-glsl3",
  })) {
    if (passMaterials[key]?.materialMode !== expectedMode) materialSurfaceErrors.push(`${key}MaterialMode`);
    if (passMaterials[key]?.glslVersion !== "300 es") materialSurfaceErrors.push(`${key}GlslVersion`);
  }
  for (const key of ["luminosity", "workLuminosity", "mainLuminosity"]) {
    if (passMaterials[key]?.tMapConstructorMode !== "source-sg-tMap-construct-null-branch-owned-binding") {
      materialSurfaceErrors.push(`${key}TMapConstructorMode`);
    }
    if (passMaterials[key]?.constructorThreshold !== 1) materialSurfaceErrors.push(`${key}ConstructorThreshold`);
    if (passMaterials[key]?.constructorSmoothing !== 1) materialSurfaceErrors.push(`${key}ConstructorSmoothing`);
    if (passMaterials[key]?.initSettingsOwnership !== "source-Lu-I1-initRenderer-writes-sg-threshold-smoothing-after-construction") {
      materialSurfaceErrors.push(`${key}InitSettingsOwnership`);
    }
  }
  const expectedLuminositySettings = {
    luminosity: parsed.probe.settings?.main?.luminosity,
    workLuminosity: parsed.probe.settings?.work?.luminosity,
    mainLuminosity: parsed.probe.settings?.main?.luminosity,
  };
  for (const [key, settings] of Object.entries(expectedLuminositySettings)) {
    if (settings && passMaterials[key]?.threshold !== settings.threshold) materialSurfaceErrors.push(`${key}ThresholdSetting`);
    if (settings && passMaterials[key]?.smoothing !== settings.smoothing) materialSurfaceErrors.push(`${key}SmoothingSetting`);
  }
  if (passMaterials.mediaComposite?.vertexMode !== "source-el-matrix-fullscreen") materialSurfaceErrors.push("mediaCompositeVertexMode");
  if (passMaterials.mediaComposite?.renderManagerOwnership !== "source-j1-Lo-settings-clear-unused-autoClear-owned-by-dollar1-update") {
    materialSurfaceErrors.push("mediaCompositeRenderManagerOwnership");
  }
  if (passMaterials.mediaComposite?.settingsClearMode !== "source-j1-clear-true-unused-by-Lo-update") {
    materialSurfaceErrors.push("mediaCompositeSettingsClearMode");
  }
  if (passMaterials.mediaComposite?.autoClearMode !== "source-dollar1-update-temporarily-autoClear-true-around-super-update") {
    materialSurfaceErrors.push("mediaCompositeAutoClearMode");
  }
  if (passMaterials.mediaComposite?.rendererAutoClearRestored !== true) {
    materialSurfaceErrors.push("mediaCompositeRendererAutoClearRestored");
  }
  const expectedBloomKernels = [3, 5, 7, 9, 11];
  const expectedZeroResolutionConstructor = [0, 0];
  const expectedBloomResolutions = (start, enabled = true) => {
    if (!enabled) return expectedBloomKernels.map(() => expectedZeroResolutionConstructor);
    const out = [];
    let width = start?.width ?? 0;
    let height = start?.height ?? 0;
    for (let index = 0; index < expectedBloomKernels.length; index += 1) {
      out.push([width, height]);
      width = Math.max(1, Math.round(width / 2));
      height = Math.max(1, Math.round(height / 2));
    }
    return out;
  };
  for (const [key, expectedStart, bloomEnabled] of [
    ["bloomBlur", workRenderSizing?.bloomStart, parsed.probe.settings?.work?.bloom?.enabled],
    ["mainBloomBlur", mainRenderSizing?.bloomStart, parsed.probe.settings?.main?.bloom?.enabled],
  ]) {
    const material = passMaterials[key];
    if (material?.materialCount !== expectedBloomKernels.length) materialSurfaceErrors.push(`${key}MaterialCount`);
    if (JSON.stringify(material?.kernelDefines) !== JSON.stringify(expectedBloomKernels)) materialSurfaceErrors.push(`${key}KernelDefines`);
    if (JSON.stringify(material?.sigmaDefines) !== JSON.stringify(expectedBloomKernels)) materialSurfaceErrors.push(`${key}SigmaDefines`);
    if (material?.runtimeKernelUniforms !== false) materialSurfaceErrors.push(`${key}RuntimeKernelUniforms`);
    if (material?.tMapConstructorMode !== "source-rg-tMap-construct-null-branch-owned-binding") {
      materialSurfaceErrors.push(`${key}TMapConstructorMode`);
    }
    if (JSON.stringify(material?.constructorResolution) !== JSON.stringify(expectedZeroResolutionConstructor)) {
      materialSurfaceErrors.push(`${key}ConstructorResolution`);
    }
    if (JSON.stringify(material?.constructorDirection) !== JSON.stringify([0.5, 0.5])) {
      materialSurfaceErrors.push(`${key}ConstructorDirection`);
    }
    if (material?.hasSourceUnusedSamplers !== true) materialSurfaceErrors.push(`${key}SourceUnusedSamplers`);
    if (material?.unusedSamplerConstructorNull !== true) materialSurfaceErrors.push(`${key}UnusedSamplerConstructorNull`);
    if (material?.directionAssignmentMode !== "source-Lu-I1-rg-uDirection-value-shared-vector-assignment") {
      materialSurfaceErrors.push(`${key}DirectionAssignmentMode`);
    }
    if (bloomEnabled) {
      if (material?.runtimeDirectionMode !== "source-enabled-loop-leaves-each-rg-on-shared-vertical-direction") {
        materialSurfaceErrors.push(`${key}RuntimeDirectionMode`);
      }
      if (material?.runtimeUsesSourceVerticalDirection !== true) materialSurfaceErrors.push(`${key}RuntimeVerticalDirectionIdentity`);
      if (material?.runtimeUsesSourceHorizontalDirection !== false) materialSurfaceErrors.push(`${key}RuntimeHorizontalDirectionIdentity`);
      if (!Array.isArray(material?.runtimeDirections) || material.runtimeDirections.some((direction) => (
        JSON.stringify(direction) !== JSON.stringify([0, 1])
      ))) {
        materialSurfaceErrors.push(`${key}RuntimeDirections`);
      }
    } else {
      if (material?.runtimeDirectionMode !== "source-disabled-loop-not-run-keeps-constructor-direction") {
        materialSurfaceErrors.push(`${key}RuntimeDirectionMode`);
      }
      if (material?.runtimeKeepsConstructorDirectionWhenDisabled !== true) {
        materialSurfaceErrors.push(`${key}RuntimeConstructorDirectionWhenDisabled`);
      }
      if (!Array.isArray(material?.runtimeDirections) || material.runtimeDirections.some((direction) => (
        JSON.stringify(direction) !== JSON.stringify([0.5, 0.5])
      ))) {
        materialSurfaceErrors.push(`${key}RuntimeDirections`);
      }
    }
    if (material?.resolutionResizeMode !== "source-Lu-I1-rg-uResolution-resize-loop") {
      materialSurfaceErrors.push(`${key}ResolutionResizeMode`);
    }
    if (material?.resolutionUpdateMode !== "source-Lu-I1-rg-update-keeps-resize-resolution") {
      materialSurfaceErrors.push(`${key}ResolutionUpdateMode`);
    }
    if (JSON.stringify(material?.resolutions) !== JSON.stringify(expectedBloomResolutions(expectedStart, bloomEnabled))) {
      materialSurfaceErrors.push(`${key}Resolutions`);
    }
  }
  for (const key of ["bloomComposite", "mainBloomComposite"]) {
    const material = passMaterials[key];
    if (material?.samplerConstructorMode !== "source-cg-samplers-construct-null-initRenderer-binds-targets") {
      materialSurfaceErrors.push(`${key}SamplerConstructorMode`);
    }
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
  const workStandardBlur = passMaterials.workStandardBlur || {};
  const mainStandardBlur = passMaterials.mainStandardBlur || {};
  for (const [group, blur, expectedScreenMode] of [
    ["standardBlur", standardBlur, "source-I1-mainPostScreen-material-swap"],
    ["workStandardBlur", workStandardBlur, "source-Lu-workPostScreen-material-swap"],
    ["mainStandardBlur", mainStandardBlur, "source-I1-mainPostScreen-material-swap"],
  ]) {
    for (const key of ["horizontal", "vertical"]) {
      const material = blur[key];
      if (material?.materialMode !== "source-Na-raw-glsl3") materialSurfaceErrors.push(`${group}${key}MaterialMode`);
      if (material?.glslVersion !== "300 es") materialSurfaceErrors.push(`${group}${key}GlslVersion`);
      if (material?.screenMode !== expectedScreenMode) materialSurfaceErrors.push(`${group}${key}ScreenMode`);
      if (material?.tMapConstructorMode !== "source-Na-tMap-construct-null-branch-owned-binding") {
        materialSurfaceErrors.push(`${group}${key}TMapConstructorMode`);
      }
      if (JSON.stringify(material?.constructorResolution) !== JSON.stringify(expectedZeroResolutionConstructor)) {
        materialSurfaceErrors.push(`${group}${key}ConstructorResolution`);
      }
      if (JSON.stringify(material?.constructorDirection) !== JSON.stringify(key === "horizontal" ? [1, 0] : [0, 1])) {
        materialSurfaceErrors.push(`${group}${key}ConstructorDirection`);
      }
      if (material?.directionConstructorOwnership !== "source-Na-constructor-direction-no-post-constructor-set") {
        materialSurfaceErrors.push(`${group}${key}DirectionConstructorOwnership`);
      }
      if (material?.blending !== 0) materialSurfaceErrors.push(`${group}${key}Blending`);
      if (material?.hasBlurinessUniform !== true) materialSurfaceErrors.push(`${group}${key}BlurinessUniform`);
      if (material?.bluriness !== 0) materialSurfaceErrors.push(`${group}${key}BlurinessValue`);
      if (material?.blurinessUpdateMode !== "source-Na-uBluriness-init-zero-no-update-write") {
        materialSurfaceErrors.push(`${group}${key}BlurinessUpdateMode`);
      }
      if (material?.hasKernelDefines !== false) materialSurfaceErrors.push(`${group}${key}KernelDefines`);
      const expectedResizeMode = group === "workStandardBlur"
        ? "source-Lu-Na-resize-css-width-height-when-blur-enabled"
        : "source-I1-Na-resize-css-width-height-when-blur-enabled";
      if (material?.resizeMode !== expectedResizeMode) materialSurfaceErrors.push(`${group}${key}ResizeMode`);
      if (!Array.isArray(material?.resolution) || material.resolution.length !== 2) {
        materialSurfaceErrors.push(`${group}${key}ResolutionVector`);
      }
    }
    if (JSON.stringify(blur.horizontal?.direction) !== JSON.stringify([1, 0])) materialSurfaceErrors.push(`${group}HorizontalDirection`);
    if (JSON.stringify(blur.vertical?.direction) !== JSON.stringify([0, 1])) materialSurfaceErrors.push(`${group}VerticalDirection`);
  }
  for (const [group, fxaa, expectedScreenMode, expectedResizeMode] of [
    ["fxaa", passMaterials.fxaa, "source-I1-mainPostScreen-material-swap", "source-I1-ig-resize-render-size-when-fxaa-enabled"],
    ["workFxaa", passMaterials.workFxaa, "source-Lu-workPostScreen-material-swap", "source-Lu-ig-resize-work-render-size-when-fxaa-enabled"],
    ["mainFxaa", passMaterials.mainFxaa, "source-I1-mainPostScreen-material-swap", "source-I1-ig-resize-render-size-when-fxaa-enabled"],
  ]) {
    if (fxaa?.materialMode !== "source-ig-raw-glsl3") materialSurfaceErrors.push(`${group}MaterialMode`);
    if (fxaa?.glslVersion !== "300 es") materialSurfaceErrors.push(`${group}GlslVersion`);
    if (fxaa?.vertexMode !== "source-FT-neighbor-uv") materialSurfaceErrors.push(`${group}VertexMode`);
    if (fxaa?.tMapConstructorMode !== "source-ig-tMap-construct-null-branch-owned-binding") {
      materialSurfaceErrors.push(`${group}TMapConstructorMode`);
    }
    if (JSON.stringify(fxaa?.constructorResolution) !== JSON.stringify(expectedZeroResolutionConstructor)) {
      materialSurfaceErrors.push(`${group}ConstructorResolution`);
    }
    if (fxaa?.screenMode !== expectedScreenMode) materialSurfaceErrors.push(`${group}ScreenMode`);
    if (fxaa?.resizeMode !== expectedResizeMode) materialSurfaceErrors.push(`${group}ResizeMode`);
    if (fxaa?.blending !== 0) materialSurfaceErrors.push(`${group}Blending`);
    if (!Array.isArray(fxaa?.resolution) || fxaa.resolution.length !== 2) materialSurfaceErrors.push(`${group}ResolutionVector`);
  }
  const displacement = passMaterials.displacement || {};
  const rendererSize = parsed.probe.renderer?.size || {};
  const expectedDisplacementSize = Math.max(
    1,
    Math.round(((rendererSize.height || 0) / 10) * (parsed.probe.renderer?.dprPolicy?.globalDpr || 1)),
  );
  if (displacement.materialMode !== "source-N1-raw-glsl3") materialSurfaceErrors.push("displacementMaterialMode");
  if (displacement.glslVersion !== "300 es") materialSurfaceErrors.push("displacementGlslVersion");
  if (displacement.blending !== 0) materialSurfaceErrors.push("displacementBlending");
  if (displacement.vertexMode !== "source-tl-matrix-fullscreen") materialSurfaceErrors.push("displacementVertexMode");
  if (displacement.sizingMode !== "source-k1-resize-height-div-10-then-Lo-round-times-dpr") {
    materialSurfaceErrors.push("displacementSizingMode");
  }
  if (displacement.expectedTargetSize !== expectedDisplacementSize) materialSurfaceErrors.push("displacementExpectedTargetSize");
  if (displacement.clearMode !== "source-Lo-no-explicit-clear") materialSurfaceErrors.push("displacementClearMode");
  if (displacement.renderManagerOwnership !== "source-O1-Lo-single-screen-material-swap") materialSurfaceErrors.push("displacementOwnership");
  if (displacement.screenMode !== "source-Lo-screen-material-composite") materialSurfaceErrors.push("displacementScreenMode");
  if (displacement.rawTargetMode !== "source-Lo-renderTargetA-new-depthless-stencilless") materialSurfaceErrors.push("displacementRawTargetMode");
  if (displacement.compositeTargetMode !== "source-Lo-renderTargetComposite-renderTargetA-clone") materialSurfaceErrors.push("displacementCompositeTargetMode");
  if (displacement.tSceneConstructorMode !== "source-N1-tScene-construct-null-Lo-update-binds-raw") {
    materialSurfaceErrors.push("displacementTSceneConstructorMode");
  }
  if (displacement.tSceneBound !== true) materialSurfaceErrors.push("displacementTSceneBound");
  if (displacement.tSceneIsRawTarget !== true) materialSurfaceErrors.push("displacementRawSceneBinding");
  if (displacement.tSceneIsCompositeTarget !== false) materialSurfaceErrors.push("displacementCompositeSelfBinding");
  if (displacement.vignetteConstantsMode !== "source-F1-globals") materialSurfaceErrors.push("displacementVignetteConstants");
  if (displacement.uTimeUpdateOrder !== "source-k1-super-update-before-N1-uTime-write") materialSurfaceErrors.push("displacementUTimeUpdateOrder");
  if (displacement.backgroundMode !== "source-k1-red-linear-to-srgb") materialSurfaceErrors.push("displacementBackgroundMode");
  if (displacement.backgroundMatchesSource !== true) materialSurfaceErrors.push("displacementBackgroundMatchesSource");
  if (!Array.isArray(displacement.rawSceneBackground) || displacement.rawSceneBackground.length !== 3) materialSurfaceErrors.push("displacementRawSceneBackground");
  if (displacement.toneMapped !== false) materialSurfaceErrors.push("displacementToneMapped");
  if (displacement.transparent !== true) materialSurfaceErrors.push("displacementTransparent");
  if (displacement.targetSize && (
    displacement.targetSize.width !== expectedDisplacementSize ||
    displacement.targetSize.height !== expectedDisplacementSize
  )) {
    materialSurfaceErrors.push("displacementTargetSize");
  }
  if (displacement.rawTargetSize && (
    displacement.rawTargetSize.width !== expectedDisplacementSize ||
    displacement.rawTargetSize.height !== expectedDisplacementSize
  )) {
    materialSurfaceErrors.push("displacementRawTargetSize");
  }
  const skyPassMaterial = passMaterials.skyComposite || {};
  if (skyPassMaterial.renderManagerOwnership !== "source-H1-Lo-single-screen-material-swap") materialSurfaceErrors.push("skyOwnership");
  if (skyPassMaterial.screenMode !== "source-Lo-screen-material-composite") materialSurfaceErrors.push("skyScreenMode");
  if (skyPassMaterial.rawTargetMode !== "source-Lo-renderTargetA-new-depthless-stencilless") materialSurfaceErrors.push("skyRawTargetMode");
  if (skyPassMaterial.compositeTargetMode !== "source-Lo-renderTargetComposite-renderTargetA-clone") materialSurfaceErrors.push("skyCompositeTargetMode");
  if (skyPassMaterial.tSceneConstructorMode !== "source-z1-tScene-construct-null-Lo-update-binds-raw") {
    materialSurfaceErrors.push("skyTSceneConstructorMode");
  }
  if (skyPassMaterial.tSceneIsRawTarget !== true) materialSurfaceErrors.push("skyRawSceneBinding");
  const mainFluid = parsed.probe.mainFluid || {};
  const mainFluidTopology = mainFluid.topology || {};
  const expectedMainFluidTargetKeys = ["main", "velocity", "viscosityA", "viscosityB", "divergence", "pressureA", "pressureB"];
  if (mainFluidTopology.mode !== "source-ag-createFbos-seven-targets-including-disabled-viscosity") {
    materialSurfaceErrors.push("mainFluidTopologyMode");
  }
  if (JSON.stringify(mainFluidTopology.targetKeys || []) !== JSON.stringify(expectedMainFluidTargetKeys)) {
    materialSurfaceErrors.push(`mainFluidTargetKeys=${JSON.stringify(mainFluidTopology.targetKeys || null)}`);
  }
  if (mainFluidTopology.viscosityDefaults?.enabled !== false) materialSurfaceErrors.push("mainFluidViscosityDefaultEnabled");
  if (mainFluidTopology.viscosityDefaults?.intensity !== 30) materialSurfaceErrors.push("mainFluidViscosityDefaultIntensity");
  if (mainFluidTopology.viscosityDefaults?.iterations !== 5) materialSurfaceErrors.push("mainFluidViscosityDefaultIterations");
  if (mainFluidTopology.viscosityRuntimeMode !== "source-ag-eA-viscosity-pass-constructed-default-disabled") {
    materialSurfaceErrors.push("mainFluidViscosityRuntimeMode");
  }
  if (mainFluidTopology.viscosityConstructorV !== null) materialSurfaceErrors.push("mainFluidViscosityConstructorV");
  const mainFluidMaterials = mainFluid.materialSurface || {};
  for (const [key, expectedMode] of Object.entries({
    advection: "source-GT-raw-glsl3",
    advectionBounds: "source-GT-bounds-raw-glsl3",
    force: "source-qT-raw-glsl3",
    viscosity: "source-eA-raw-glsl3",
    divergence: "source-jT-raw-glsl3",
    poisson: "source-KT-raw-glsl3",
    pressure: "source-JT-raw-glsl3",
  })) {
    if (mainFluidMaterials[key]?.materialMode !== expectedMode) materialSurfaceErrors.push(`mainFluid${key}MaterialMode`);
    if (mainFluidMaterials[key]?.glslVersion !== "300 es") materialSurfaceErrors.push(`mainFluid${key}GlslVersion`);
    if (mainFluidMaterials[key]?.depthWrite !== false) materialSurfaceErrors.push(`mainFluid${key}DepthWrite`);
    if (mainFluidMaterials[key]?.depthTest !== false) materialSurfaceErrors.push(`mainFluid${key}DepthTest`);
  }
  for (const key of ["advection", "viscosity", "divergence", "poisson", "pressure"]) {
    if (mainFluidMaterials[key]?.blending !== 0) materialSurfaceErrors.push(`mainFluid${key}Blending`);
  }
  if (mainFluidMaterials.advectionBounds?.blending !== 0) materialSurfaceErrors.push("mainFluidAdvectionBoundsBlending");
  if (mainFluidMaterials.advectionBounds?.sharedUniforms !== true) materialSurfaceErrors.push("mainFluidAdvectionBoundsSharedUniforms");
  if (mainFluidMaterials.advectionBounds?.sceneChildren !== 2) materialSurfaceErrors.push("mainFluidAdvectionBoundsSceneChildren");
  if (!mainFluidMaterials.advection?.uniformKeys?.includes("px")) materialSurfaceErrors.push("mainFluidAdvectionPxUniform");
  if (!mainFluidMaterials.advection?.uniformKeys?.includes("bounds")) materialSurfaceErrors.push("mainFluidAdvectionBoundsUniform");
  for (const uniformKey of ["bounds", "velocity", "velocity_new", "v", "px", "dt"]) {
    if (!mainFluidMaterials.viscosity?.uniformKeys?.includes(uniformKey)) {
      materialSurfaceErrors.push(`mainFluidViscosity${uniformKey}Uniform`);
    }
  }
  if (mainFluidMaterials.force?.blending !== 2) materialSurfaceErrors.push("mainFluidForceBlending");
  const mainFluidTargets = mainFluid.targets || {};
  for (const key of expectedMainFluidTargetKeys) {
    if (mainFluidTargets[key]?.texture?.type !== 1015) materialSurfaceErrors.push(`mainFluid${key}FloatType`);
    if (mainFluidTargets[key]?.depthBuffer !== false) materialSurfaceErrors.push(`mainFluid${key}DepthBuffer`);
    if (mainFluidTargets[key]?.stencilBuffer !== false) materialSurfaceErrors.push(`mainFluid${key}StencilBuffer`);
  }
  if (mainFluid.enabled) {
    const mainFluidSizing = mainFluid.sizing || {};
    if (mainFluidSizing.mode !== "source-ag-calcSizes-raw-size-preserved-for-fboSize-cellScale-and-targets") {
      materialSurfaceErrors.push("mainFluidRawSizingMode");
    }
    if (mainFluidSizing.sourceResizeChain !== "source-I1-Fa-render-size-div-2-then-ag-onResize-div-3") {
      materialSurfaceErrors.push("mainFluidRawResizeChain");
    }
    if (mainFluidSizing.fboSizeMatchesSource !== true) materialSurfaceErrors.push("mainFluidRawFboSize");
    if (mainFluidSizing.cellScaleMatchesSource !== true) materialSurfaceErrors.push("mainFluidRawCellScale");
    if (mainFluidSizing.targetsMatchFboSize !== true) materialSurfaceErrors.push("mainFluidRawTargetSize");
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
  const expectedRebuildFrameOrder = ["media-position", "sky", "media", "work-raw", "work-bloom", "work-mousesim", "work-composite", "p1-post-render", "main-raw", "main-blur", "main-lensflare", "main-luminosity", "main-bloom", "main-fluid", "main-C1-runtime-uniforms", "main-C1", "main-final-screen", "workthumb", "wavves", "character-when-about"];
  if (JSON.stringify(updateOrder?.rebuildFrameOrder) !== JSON.stringify(expectedRebuildFrameOrder)) {
    throw new Error(`Rebuild frame order source-shape mismatch: ${JSON.stringify(updateOrder?.rebuildFrameOrder || null)}`);
  }
  const expectedWorkUpdateOrder = ["Lu.renderManager.raw", "Lu.renderManager.bloom", "Ka.mouseSimulation", "Lu.renderManager.composite", "IT.cameraController", "p1.components"];
  if (JSON.stringify(updateOrder?.workUpdateOrder) !== JSON.stringify(expectedWorkUpdateOrder)) {
    throw new Error(`Work update order source-shape mismatch: ${JSON.stringify(updateOrder?.workUpdateOrder || null)}`);
  }
  const expectedMainUpdateOrder = ["I1.raw", "I1.optional-blur", "I1.optional-lensflare", "I1.optional-luminosity", "I1.optional-bloom", "I1.fluid", "I1.C1-runtime-uniforms", "I1.C1-screen"];
  if (JSON.stringify(updateOrder?.mainUpdateOrder) !== JSON.stringify(expectedMainUpdateOrder)) {
    throw new Error(`Main update order source-shape mismatch: ${JSON.stringify(updateOrder?.mainUpdateOrder || null)}`);
  }
  if (updateOrder?.mainCompositeUpdateOrder !== "source-U1-super-update-renders-I1-before-C1-update") {
    throw new Error(`Main C1 update order source-shape mismatch: ${updateOrder?.mainCompositeUpdateOrder || "missing"}`);
  }
  if (updateOrder?.mouseSimulationOrder !== "source-Lu-mousesim-after-raw-bloom-before-composite") {
    throw new Error(`Mouse simulation order source-shape mismatch: ${updateOrder?.mouseSimulationOrder || "missing"}`);
  }
  const initLifecycleErrors = [];
  if (updateOrder?.sourceInitLifecycleMode !== "source-nD-resize-delay-bind-composite-inputs-sky-repeat-then-start") {
    initLifecycleErrors.push("sourceInitLifecycleMode");
  }
  if (updateOrder?.firstResizeBeforeDelayedBindings !== true) initLifecycleErrors.push("firstResizeBeforeDelayedBindings");
  if (updateOrder?.delayedBindingsApplied !== true) initLifecycleErrors.push("delayedBindingsApplied");
  if (updateOrder?.secondResizeAfterDelayedBindings !== true) initLifecycleErrors.push("secondResizeAfterDelayedBindings");
  if (updateOrder?.startedAfterDelayedBindings !== true) initLifecycleErrors.push("startedAfterDelayedBindings");
  if (initLifecycleErrors.length) {
    throw new Error(`nD init lifecycle source-shape mismatch: ${initLifecycleErrors.join(", ")}`);
  }
  if (updateOrder?.preloadGate !== "source-nD-await-blueNoise-floorNormal-perlin1-perlin2-before-animate-in") {
    throw new Error(`Texture preload gate source-shape mismatch: ${updateOrder?.preloadGate || "missing"}`);
  }
  const preloadState = updateOrder?.sourceTexturePreloadState || {};
  const preloadErrors = [];
  if (updateOrder?.sourceWebpDetectionMode !== "source-Qe-k0-lossy-before-Xt-and-p1-assets") preloadErrors.push("sourceWebpDetectionMode");
  if (![true, false].includes(updateOrder?.sourceWebpSupport)) preloadErrors.push("sourceWebpSupport");
  if (!["webp", "jpg"].includes(updateOrder?.sourceAssetExt)) preloadErrors.push("sourceAssetExt");
  if (updateOrder?.sourceAssetExt !== (updateOrder?.sourceWebpSupport ? "webp" : "jpg")) preloadErrors.push("sourceAssetExtSupportMismatch");
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
  const sceneSurface = parsed.probe.settings?.work?.sceneSurface || {};
  const sceneSurfaceErrors = [];
  if (sceneSurface.mode !== "source-p1-scene-background-and-fog-owned-by-init") sceneSurfaceErrors.push("mode");
  if (sceneSurface.backgroundMode !== "source-p1-BA-BACKGROUND_COLOR-linear-to-srgb") sceneSurfaceErrors.push("backgroundMode");
  if (sceneSurface.sourceBackgroundColor !== "#1a1a1a") sceneSurfaceErrors.push("sourceBackgroundColor");
  if (sceneSurface.backgroundMatchesSource !== true) sceneSurfaceErrors.push("backgroundMatchesSource");
  if (sceneSurface.fogMode !== "source-p1-fog-grey-0-100-scene-fog") sceneSurfaceErrors.push("fogMode");
  if (sceneSurface.fogType !== "Fog") sceneSurfaceErrors.push("fogType");
  if (Math.abs((sceneSurface.fogNear ?? NaN) - 0) > 0.0001) sceneSurfaceErrors.push("fogNear");
  if (Math.abs((sceneSurface.fogFar ?? NaN) - 100) > 0.0001) sceneSurfaceErrors.push("fogFar");
  if (sceneSurface.fogMatchesSource !== true) sceneSurfaceErrors.push("fogMatchesSource");
  if (sceneSurface.floorMaterialFogBranch !== false) sceneSurfaceErrors.push("floorMaterialFogBranch");
  if (sceneSurface.environmentMaterialFog !== false) sceneSurfaceErrors.push("environmentMaterialFog");
  if (sceneSurfaceErrors.length) {
    throw new Error(`p1 scene background/fog source-shape mismatch: ${sceneSurfaceErrors.join(", ")}`);
  }
  const environmentUniforms = parsed.probe.uniforms?.environment;
  const environmentHierarchy = parsed.probe.reflectionState?.environment;
  const sceneWrapHierarchy = parsed.probe.reflectionState?.sceneWrap;
  const sceneRootHierarchy = parsed.probe.reflectionState?.scene;
  const environmentErrors = [];
  const expectedRootChildOrder = [
    "ambientLight",
    "spotLight",
    "spotLight.target",
    "directionalLight",
    "aboutBlocks",
    "floatingBlocks",
    "sceneWrap",
  ];
  if (sceneRootHierarchy?.sourceRootChildOrderMode !== "source-p1-scene-lights-about-floating-sceneWrap") {
    environmentErrors.push("sceneRootChildOrderMode");
  }
  if (JSON.stringify(sceneRootHierarchy?.sourceRootChildOrder) !== JSON.stringify(expectedRootChildOrder)) {
    environmentErrors.push(`sceneRootChildOrder=${JSON.stringify(sceneRootHierarchy?.sourceRootChildOrder || null)}`);
  }
  if (sceneRootHierarchy?.sourceRootChildOrderMatches !== true) environmentErrors.push("sceneRootChildOrderMatches");
  if (sceneWrapHierarchy?.sourceChildOrderMode !== "source-p1-sceneWrap-blocksWrap-floor-env") environmentErrors.push("sceneWrapChildOrderMode");
  if (JSON.stringify(sceneWrapHierarchy?.sourceChildOrder) !== JSON.stringify(["blocksWrap", "floor", "env"])) {
    environmentErrors.push(`sceneWrapChildOrder=${JSON.stringify(sceneWrapHierarchy?.sourceChildOrder || null)}`);
  }
  if (environmentUniforms?.materialMode !== "source-u1-meshstandard-onBeforeCompile") environmentErrors.push("materialMode");
  if (environmentUniforms?.customUniformsMode !== "source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias") environmentErrors.push("customUniformsMode");
  if (environmentUniforms?.hasMaterialUniformsAlias !== false) environmentErrors.push("materialUniformsAlias");
  if (environmentUniforms?.tSkyConstructorMode !== "source-u1-constructor-tSky-null") environmentErrors.push("tSkyConstructorMode");
  if (environmentUniforms?.tSkyConstructorWasNull !== true) environmentErrors.push("tSkyConstructorWasNull");
  if (environmentUniforms?.tSkyDelayedBindingMode !== "source-nD-after-first-resize-100ms-bind-repeat-composite") environmentErrors.push("tSkyDelayedBindingMode");
  if (environmentUniforms?.hierarchyMode !== "source-h1-rt-object3d-owns-transform") environmentErrors.push("hierarchyMode");
  if (environmentUniforms?.groupType !== "Object3D") environmentErrors.push("groupType");
  if (environmentUniforms?.updateMode !== "source-h1-material-update-only") environmentErrors.push("updateMode");
  if (environmentUniforms?.rotationMode !== "source-p1-demorgen-initial-adjustment-only") environmentErrors.push("rotationMode");
  const rotationSource = environmentUniforms?.rotationSource || {};
  const hierarchyRotationSource = environmentHierarchy?.rotationSource || {};
  const expectedRotationY = -((rotationSource.rotationAdjustmentDegrees ?? NaN) * Math.PI / 180);
  if (rotationSource.mode !== "source-p1-env-rotation-y-negative-rotationAdjustment-from-demorgen") environmentErrors.push("rotationSourceMode");
  if (!Number.isFinite(rotationSource.count) || rotationSource.count <= 0) environmentErrors.push("rotationSourceCount");
  if (!Number.isFinite(rotationSource.demorgenIndex) || rotationSource.demorgenIndex < 0 || rotationSource.demorgenIndex >= rotationSource.count) {
    environmentErrors.push("rotationSourceDemorgenIndex");
  }
  if (Math.abs((rotationSource.thetaDegrees ?? NaN) - (360 / Math.max(1, rotationSource.count || 1))) > 0.0001) environmentErrors.push("rotationSourceTheta");
  if (Math.abs((rotationSource.expectedRotationY ?? NaN) - expectedRotationY) > 0.0001) environmentErrors.push("rotationSourceExpectedY");
  if (environmentUniforms?.rotationMatchesSource !== true) environmentErrors.push("rotationMatchesSource");
  if (hierarchyRotationSource.mode !== rotationSource.mode) environmentErrors.push("reflectionRotationSourceMode");
  if (environmentHierarchy?.rotationMatchesSource !== true) environmentErrors.push("reflectionRotationMatchesSource");
  if (environmentUniforms && Math.abs((environmentUniforms.groupRotationY ?? NaN) - expectedRotationY) > 0.0001) {
    environmentErrors.push("groupRotationY");
  }
  if (environmentUniforms && Math.abs((environmentUniforms.speed ?? 0) - 0.00005) > 0.0000001) environmentErrors.push("speed");
  if (environmentUniforms?.geometry?.mode !== "source-Du-icosahedron") environmentErrors.push("geometryMode");
  if (environmentUniforms?.geometry?.type !== "IcosahedronGeometry") environmentErrors.push("geometryType");
  if (environmentUniforms?.geometry && Math.abs((environmentUniforms.geometry.radius ?? 0) - 300) > 0.0001) environmentErrors.push("geometryRadius");
  if (environmentUniforms?.geometry?.detail !== 10) environmentErrors.push("geometryDetail");
  if (environmentUniforms?.fog !== false) environmentErrors.push("materialFog");
  if (environmentUniforms?.dithering !== true) environmentErrors.push("materialDithering");
  if (environmentUniforms?.ditheringOwnershipMode !== "source-u1-constructor-sets-dithering-after-super") {
    environmentErrors.push("materialDitheringOwnership");
  }
  if (environmentUniforms && Math.abs((environmentUniforms.envMapIntensity ?? 0) - 1) > 0.0001) environmentErrors.push("envMapIntensity");
  if (environmentUniforms?.constructorParamsMode !== "source-h1-passes-side-envMapIntensity-fog-only") environmentErrors.push("constructorParamsMode");
  if (environmentUniforms?.constructorParamsIncludesDithering !== false) environmentErrors.push("constructorParamsDithering");
  if (environmentUniforms?.defaultStandardParamsMode !== "source-u1-does-not-apply-Qn-roughness-metalness-emissive-constants") environmentErrors.push("defaultStandardParamsMode");
  if (environmentUniforms && Math.abs((environmentUniforms.roughness ?? -1) - 1) > 0.0001) environmentErrors.push("roughnessDefault");
  if (environmentUniforms && Math.abs((environmentUniforms.metalness ?? -1) - 0) > 0.0001) environmentErrors.push("metalnessDefault");
  if (environmentUniforms && Math.abs((environmentUniforms.emissiveIntensity ?? -1) - 1) > 0.0001) environmentErrors.push("emissiveIntensityDefault");
  if (environmentUniforms && Math.abs((environmentUniforms.groupPositionY ?? 0) + 12.65) > 0.0001) environmentErrors.push("groupPositionY");
  if (environmentUniforms && Math.abs(environmentUniforms.meshPositionY ?? 0) > 0.0001) environmentErrors.push("meshPositionY");
  if (environmentUniforms && Math.abs(environmentUniforms.meshRotationY ?? 0) > 0.0001) environmentErrors.push("meshRotationY");
  const environmentShaderSurface = environmentUniforms?.shaderSurface || {};
  const expectedEnvironmentQnConstants = {
    uShader1Alpha: 0.5,
    uShader1Speed: 0.5,
    uShader1Scale: 5.5,
    uShader2Alpha: 0,
    uShader2Scale: 13,
    uShader3Alpha: 0,
    uShader3Speed: 0,
    uShader3Scale: 0,
    uShader1Mix3: 1.5,
  };
  if (environmentShaderSurface.sourceConstantsMode !== "source-u1-uses-Qn-not-BA-Z1") {
    environmentErrors.push("shaderSourceConstantsMode");
  }
  if (environmentShaderSurface.constantsMatchSource !== true) environmentErrors.push("shaderConstantsMatchSource");
  for (const [key, expected] of Object.entries(expectedEnvironmentQnConstants)) {
    if (Math.abs((environmentShaderSurface[key] ?? NaN) - expected) > 0.0001) {
      environmentErrors.push(`shaderConstant-${key}`);
    }
    if (Math.abs((environmentShaderSurface.expectedConstants?.[key] ?? NaN) - expected) > 0.0001) {
      environmentErrors.push(`expectedShaderConstant-${key}`);
    }
  }
  if (environmentShaderSurface.uShader1Mix2 !== null) environmentErrors.push("shaderMix2RuntimeValue");
  if (environmentShaderSurface.uShader1Mix2Binding !== "source-declared-only") environmentErrors.push("shaderMix2Binding");
  if (environmentHierarchy?.group?.type !== "Object3D") environmentErrors.push("reflectionGroupType");
  if (environmentHierarchy?.group?.children !== 1) environmentErrors.push("groupChildren");
  if (environmentHierarchy?.object?.position?.[1] !== 0) environmentErrors.push("meshLocalPosition");
  if (environmentHierarchy?.geometry?.mode !== "source-Du-icosahedron") environmentErrors.push("reflectionGeometryMode");
  if (environmentHierarchy?.geometry?.type !== "IcosahedronGeometry") environmentErrors.push("reflectionGeometryType");
  if (environmentHierarchy?.geometry && Math.abs((environmentHierarchy.geometry.radius ?? 0) - 300) > 0.0001) environmentErrors.push("reflectionGeometryRadius");
  if (environmentHierarchy?.geometry?.detail !== 10) environmentErrors.push("reflectionGeometryDetail");
  if (environmentHierarchy?.material?.mode !== "source-u1-meshstandard-onBeforeCompile") environmentErrors.push("reflectionMaterialMode");
  if (environmentHierarchy?.material?.customUniformsMode !== "source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias") environmentErrors.push("reflectionCustomUniformsMode");
  if (environmentHierarchy?.material?.hasMaterialUniformsAlias !== false) environmentErrors.push("reflectionMaterialUniformsAlias");
  if (environmentHierarchy?.material?.constructorParamsMode !== "source-h1-passes-side-envMapIntensity-fog-only") environmentErrors.push("reflectionConstructorParamsMode");
  if (environmentHierarchy?.material?.ditheringOwnershipMode !== "source-u1-constructor-sets-dithering-after-super") {
    environmentErrors.push("reflectionDitheringOwnership");
  }
  if (environmentHierarchy?.material?.constructorParamsIncludesDithering !== false) environmentErrors.push("reflectionConstructorParamsDithering");
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
  if (lights?.homeEntryIntensityMode !== sourceHomeSpotlightIntensityMode) lightErrors.push("homeEntryIntensityMode");
  if (lights?.homeEntryIntensityIgnoresPayload !== true) lightErrors.push("homeEntryIntensityIgnoresPayload");
  if (Math.abs((lights?.expectedHomeEntryIntensity ?? NaN) - 220) > 0.0001) lightErrors.push("expectedHomeEntryIntensity");
  if (Math.abs((lights?.maxSpotLightIntensity ?? NaN) - 220) > 0.0001) lightErrors.push("maxSpotLightIntensity");
  if (lights?.maxSpotLightIntensityMatchesSource !== true) lightErrors.push("maxSpotLightIntensityMatchesSource");
  const expectedLightActiveProjectSpotlight = sourceProjectSpotlightIntensity(lights?.activeProjectSpotlightRaw, 220);
  const expectedLightActiveProjectUsesPayload = sourceProjectSpotlightUsesPayload(lights?.activeProjectSpotlightRaw);
  if (lights?.activeProjectIntensityMode !== sourceActiveProjectSpotlightIntensityMode) lightErrors.push("activeProjectIntensityMode");
  if (lights?.activeProjectFallbackMode !== "source-js-or-falsy-zero-empty-missing-to-maxSpotLightIntensity") lightErrors.push("activeProjectFallbackMode");
  if (lights?.activeProjectUsesPayloadSpotlight !== expectedLightActiveProjectUsesPayload) lightErrors.push("activeProjectUsesPayloadSpotlight");
  if (Math.abs((lights?.expectedActiveProjectIntensity ?? NaN) - expectedLightActiveProjectSpotlight) > 0.0001) lightErrors.push("expectedActiveProjectIntensity");
  if (lights?.activeProjectIntensityMatchesExpected !== true) lightErrors.push("activeProjectIntensityMatchesExpected");
  if (lightErrors.length) {
    throw new Error(`p1 light ownership source-shape mismatch: ${lightErrors.join(", ")}`);
  }
  const floorUniforms = parsed.probe.uniforms?.floor;
  const floorErrors = [];
  const expectedFloorUniformKeys = [
    "tReflect",
    "uMapTransform",
    "uMatrix",
    "uColor",
    "uReflectivity",
    "uMirror",
    "uFloorMixStrength",
    "uNormalDistortionStrength",
    "tNormalMap",
    "uNormalScale",
  ];
  if (floorUniforms?.reflectionVisibilityMode !== "source-a1-onBeforeRender-hide-component-group") floorErrors.push("reflectionVisibilityMode");
  if (floorUniforms?.materialMode !== "source-o1-raw-glsl3") floorErrors.push("materialMode");
  if (floorUniforms?.reflectionBlurMode !== "source-t1-raw-glsl3") floorErrors.push("reflectionBlurMode");
  if (floorUniforms?.reflectionBlurTMapConstructorMode !== "source-t1-tMap-construct-null-update-loop-binds") {
    floorErrors.push("reflectionBlurTMapConstructorMode");
  }
  if (JSON.stringify(floorUniforms?.sourceUniformKeys || null) !== JSON.stringify(expectedFloorUniformKeys)) {
    floorErrors.push("floorSourceUniformKeys");
  }
  if (JSON.stringify(floorUniforms?.uniformKeys || null) !== JSON.stringify(expectedFloorUniformKeys)) {
    floorErrors.push("floorUniformKeys");
  }
  if (floorUniforms?.matchesSourceOrder !== true) floorErrors.push("floorUniformOrder");
  if (floorUniforms?.normalMap?.bindingMode !== "source-a1-Xt-floorNormal-repeat-45-updateMatrix") floorErrors.push("floorNormalBindingMode");
  if (floorUniforms?.normalMap?.objectBindingMode !== "source-Xt-loadTexture-immediate-texture-object-bound-before-onload") {
    floorErrors.push("floorNormalObjectBindingMode");
  }
  if (floorUniforms?.normalMap?.isLoadedTexture !== true) floorErrors.push("floorNormalLoaded");
  if (floorUniforms?.normalMap?.uniformIsImmediateTexture !== true) floorErrors.push("floorNormalImmediateTexture");
  if (floorUniforms?.normalMap?.loadedSameImmediateTexture !== true) floorErrors.push("floorNormalLoadedSameImmediateTexture");
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
  if (floorUniforms?.hierarchy?.mode !== "source-a1-i1-rt-object3d-floorPlane-reflector") floorErrors.push("floorHierarchyMode");
  if (floorUniforms?.hierarchy?.groupType !== "Object3D") floorErrors.push("floorGroupType");
  if (floorUniforms?.hierarchy?.groupChildren !== 1) floorErrors.push("floorGroupChildren");
  if (floorUniforms?.hierarchy?.planeChildren !== 1) floorErrors.push("floorPlaneChildren");
  if (floorUniforms?.hierarchy?.reflectorType !== "Object3D") floorErrors.push("floorReflectorType");
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
  if (parsed.probe.reflectionState?.floor?.hierarchy?.mode !== "source-a1-i1-rt-object3d-floorPlane-reflector") floorErrors.push("reflectionFloorHierarchyMode");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.groupType !== "Object3D") floorErrors.push("reflectionFloorGroupType");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.reflectorType !== "Object3D") floorErrors.push("reflectionFloorReflectorType");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.reflectorParentIsPlane !== true) floorErrors.push("reflectionFloorReflectorParent");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.planeParentIsGroup !== true) floorErrors.push("reflectionFloorPlaneParent");
  if (parsed.probe.reflectionState?.floor?.hierarchy?.groupParentIsSceneWrap !== true) floorErrors.push("reflectionFloorGroupParent");
  const floorDrawState = parsed.probe.reflectionState?.floorReflectionDrawState;
  if (floorDrawState?.mode !== "source-a1-onBeforeRender-hide-component-group-render-full-scene-restore") {
    floorErrors.push("reflectionDrawStateMode");
  }
  if (floorDrawState?.renderSceneMode !== "source-i1-update-renders-this.scene-with-a1-hidden") {
    floorErrors.push("reflectionRenderSceneMode");
  }
  if (floorDrawState?.renderSceneIsHomeScene !== true) floorErrors.push("reflectionRenderSceneIsHomeScene");
  if (!floorDrawState?.before || !floorDrawState?.during || !floorDrawState?.after) floorErrors.push("reflectionDrawSnapshots");
  if (floorDrawState?.before?.floorGroupVisible !== true) floorErrors.push("reflectionBeforeFloorVisible");
  if (floorDrawState?.during?.floorGroupVisible !== false) floorErrors.push("reflectionDuringFloorHidden");
  if (floorDrawState?.after?.floorGroupVisible !== true) floorErrors.push("reflectionAfterFloorVisible");
  if (floorDrawState?.floorHiddenDuringReflection !== true) floorErrors.push("reflectionFloorHiddenDuring");
  if (floorDrawState?.floorPlaneLocalVisibleDuringReflection !== true) floorErrors.push("reflectionFloorPlaneLocalVisible");
  if (floorDrawState?.floorReflectorLocalVisibleDuringReflection !== true) floorErrors.push("reflectionReflectorLocalVisible");
  if (floorDrawState?.sceneWrapRenderedInReflection !== true) floorErrors.push("reflectionSceneWrapRendered");
  if (floorDrawState?.blocksRenderedInReflection !== true) floorErrors.push("reflectionBlocksRendered");
  if (floorDrawState?.environmentRenderedInReflection !== true) floorErrors.push("reflectionEnvironmentRendered");
  if (floorDrawState?.floorRestoredAfterReflection !== true) floorErrors.push("reflectionFloorRestored");
  if (floorDrawState?.restoreMatchesBefore !== true) floorErrors.push("reflectionRestoreMatchesBefore");
  if (!Number.isFinite(floorDrawState?.lastRenderFrame) || floorDrawState.lastRenderFrame < 0) floorErrors.push("reflectionLastRenderFrame");
  const floorRendererState = parsed.probe.reflectionState?.floorReflectionRendererState;
  if (floorRendererState?.mode !== "source-i1-save-renderer-state-disable-xr-shadow-restore-target") {
    floorErrors.push("reflectionRendererStateMode");
  }
  if (floorRendererState?.rawPassMode !== "source-i1-set-raw-target-depth-mask-conditional-clear-render-scene") {
    floorErrors.push("reflectionRendererRawPassMode");
  }
  if (floorRendererState?.blurPassMode !== "source-i1-write-target-loop-then-restore-previous-target") {
    floorErrors.push("reflectionRendererBlurPassMode");
  }
  if (floorRendererState?.restoreMode !== "source-i1-restore-xr-shadow-and-previous-render-target") {
    floorErrors.push("reflectionRendererRestoreMode");
  }
  if (!floorRendererState?.previous || !floorRendererState?.duringRaw || !floorRendererState?.duringBlur || !floorRendererState?.restored) {
    floorErrors.push("reflectionRendererSnapshots");
  }
  if (floorRendererState?.previous?.autoClear !== false) floorErrors.push("reflectionPreviousAutoClear");
  if (floorRendererState?.duringRaw?.xrEnabled !== false) floorErrors.push("reflectionDuringRawXrDisabled");
  if (floorRendererState?.duringRaw?.shadowAutoUpdate !== false) floorErrors.push("reflectionDuringRawShadowDisabled");
  if (floorRendererState?.duringRaw?.targetIsFloorReflectionRaw !== true) floorErrors.push("reflectionDuringRawTarget");
  if (floorRendererState?.duringRaw?.autoClear !== false) floorErrors.push("reflectionDuringRawAutoClear");
  if (floorRendererState?.duringBlur?.targetIsFloorReflectionWrite !== true) floorErrors.push("reflectionDuringBlurWriteTarget");
  if (floorRendererState?.depthMaskWritableCommanded !== true) floorErrors.push("reflectionDepthMaskWritable");
  if (floorRendererState?.conditionalClearExecuted !== true) floorErrors.push("reflectionConditionalClearExecuted");
  if (floorRendererState?.conditionalClearMatchesAutoClear !== true) floorErrors.push("reflectionConditionalClearMatchesAutoClear");
  if (floorRendererState?.xrDisabledDuringReflection !== true) floorErrors.push("reflectionXrDisabledDuring");
  if (floorRendererState?.shadowAutoUpdateDisabledDuringReflection !== true) floorErrors.push("reflectionShadowDisabledDuring");
  if (floorRendererState?.rawTargetActiveDuringReflection !== true) floorErrors.push("reflectionRawTargetActive");
  if (floorRendererState?.writeTargetActiveDuringBlur !== true) floorErrors.push("reflectionWriteTargetActive");
  if (floorRendererState?.xrRestored !== true) floorErrors.push("reflectionXrRestored");
  if (floorRendererState?.shadowAutoUpdateRestored !== true) floorErrors.push("reflectionShadowRestored");
  if (floorRendererState?.autoClearPreserved !== true) floorErrors.push("reflectionAutoClearPreserved");
  if (floorRendererState?.renderTargetRestored !== true) floorErrors.push("reflectionRenderTargetRestored");
  if (floorRendererState?.restoreMatchesBefore !== true) floorErrors.push("reflectionRendererRestoreMatchesBefore");
  if (!Number.isFinite(floorRendererState?.lastRenderFrame) || floorRendererState.lastRenderFrame < 0) {
    floorErrors.push("reflectionRendererLastRenderFrame");
  }
  if (reflectionTargets?.blurIterations > 0 && floorRendererState?.lastBlurIteration !== reflectionTargets.blurIterations - 1) {
    floorErrors.push(`reflectionLastBlurIteration=${floorRendererState?.lastBlurIteration}`);
  }
  const floorCameraState = parsed.probe.reflectionState?.floorReflectionCameraState;
  const expectedFloorCameraSteps = [
    "normalFromReflectorMatrixWorld",
    "viewReflectedAcrossNormal",
    "targetReflectedAcrossNormal",
    "cameraPositionCopiedFromReflectedView",
    "cameraUpReflectedAcrossNormal",
    "lookAtTarget",
    "farCopy",
    "updateMatrixWorld",
    "projectionCopy",
    "textureMatrixBias",
    "textureMatrixProjection",
    "textureMatrixCameraInverse",
    "textureMatrixReflectorMatrixWorld",
    "reflectorPlaneFromNormalAndWorldPosition",
    "clipPlaneAppliedToCameraInverse",
    "clipPlaneVectorSet",
    "clipPlaneScaledByQ",
    "projectionRowWrite",
  ];
  if (floorCameraState?.mode !== "source-i1-camera-textureMatrix-clipPlane-update-order") {
    floorErrors.push("reflectionCameraStateMode");
  }
  if (floorCameraState?.cameraOrderMode !== "source-i1-lookAt-target-far-updateMatrixWorld-copy-projection") {
    floorErrors.push("reflectionCameraOrderMode");
  }
  if (floorCameraState?.textureMatrixOrderMode !== "source-i1-bias-multiply-projection-cameraInverse-reflectorMatrixWorld") {
    floorErrors.push("reflectionTextureMatrixOrderMode");
  }
  if (floorCameraState?.clipPlaneOrderMode !== "source-i1-plane-normal-worldPosition-cameraInverse-oblique-row-write") {
    floorErrors.push("reflectionClipPlaneOrderMode");
  }
  if (JSON.stringify(floorCameraState?.expectedSteps) !== JSON.stringify(expectedFloorCameraSteps)) {
    floorErrors.push(`reflectionExpectedCameraSteps=${JSON.stringify(floorCameraState?.expectedSteps || null)}`);
  }
  if (JSON.stringify(floorCameraState?.steps) !== JSON.stringify(expectedFloorCameraSteps)) {
    floorErrors.push(`reflectionCameraSteps=${JSON.stringify(floorCameraState?.steps || null)}`);
  }
  if (floorCameraState?.stepsMatchExpected !== true) floorErrors.push("reflectionCameraStepsMatchExpected");
  if (floorCameraState?.sourceOrderMatched !== true) floorErrors.push("reflectionCameraSourceOrderMatched");
  if (floorCameraState?.cameraCoreOrderMatchesSource !== true) floorErrors.push("reflectionCameraCoreOrder");
  if (floorCameraState?.textureMatrixOrderMatchesSource !== true) floorErrors.push("reflectionTextureMatrixOrder");
  if (floorCameraState?.clipPlaneOrderMatchesSource !== true) floorErrors.push("reflectionClipPlaneOrder");
  if (floorCameraState?.farMatchesHomeCamera !== true) floorErrors.push("reflectionCameraFarCopy");
  if (floorCameraState?.projectionCopiedAfterMatrixWorldUpdate !== true) floorErrors.push("reflectionProjectionAfterUpdateMatrixWorld");
  if (floorCameraState?.projectionCopyMatchesHomeCamera !== true) floorErrors.push("reflectionProjectionCopyMatchesHome");
  if (floorCameraState?.textureMatrixUniformShared !== true) floorErrors.push("reflectionTextureMatrixUniformShared");
  if (floorCameraState?.textureMatrixUniformUsesMatrix !== true) floorErrors.push("reflectionTextureMatrixUniformUsesMatrix");
  if (JSON.stringify(floorCameraState?.projectionRowIndices) !== JSON.stringify([2, 6, 10, 14])) {
    floorErrors.push(`reflectionProjectionRowIndices=${JSON.stringify(floorCameraState?.projectionRowIndices || null)}`);
  }
  if (floorCameraState?.projectionRowWriteMatchesClipPlane !== true) floorErrors.push("reflectionProjectionRowWriteMatchesClipPlane");
  if (floorCameraState?.clipBias !== 0) floorErrors.push("reflectionCameraClipBias");
  if (floorCameraState?.runtimeChecksPass !== true) floorErrors.push("reflectionCameraRuntimeChecksPass");
  if (!Number.isFinite(floorCameraState?.lastRenderFrame) || floorCameraState.lastRenderFrame < 0) {
    floorErrors.push("reflectionCameraLastRenderFrame");
  }
  if (reflectionTargets?.blurMaterialMode !== "source-t1-raw-glsl3") floorErrors.push("blurMaterialMode");
  if (reflectionTargets?.blurTMapConstructorMode !== "source-t1-tMap-construct-null-update-loop-binds") {
    floorErrors.push("blurTMapConstructorMode");
  }
  if (reflectionTargets?.constructorMode !== "source-i1-default-width-height-512-blurIterations-2") floorErrors.push("reflectionConstructorMode");
  if (reflectionTargets?.constructorWidth !== 512 || reflectionTargets?.constructorHeight !== 512) floorErrors.push("reflectionConstructorSize");
  if (reflectionTargets?.blurIterations !== 2) floorErrors.push("reflectionBlurIterations");
  if (reflectionTargets?.renderTargetUniformConstructorMode !== "source-i1-positive-blurIterations-initial-read-texture") {
    floorErrors.push("reflectionRenderTargetUniformConstructorMode");
  }
  if (reflectionTargets?.blurConstructorResolutionMode !== "source-i1-sets-t1-uResolution-to-constructor-width-height") {
    floorErrors.push("reflectionBlurConstructorResolutionMode");
  }
  if (JSON.stringify(reflectionTargets?.blurConstructorResolution) !== JSON.stringify([512, 512])) {
    floorErrors.push(`reflectionBlurConstructorResolution=${JSON.stringify(reflectionTargets?.blurConstructorResolution || null)}`);
  }
  if (reflectionTargets?.blurDirectionMode !== "source-i1-direction-(blurIterations-u-1)*15-axis-by-iteration") {
    floorErrors.push("reflectionBlurDirectionMode");
  }
  if (JSON.stringify(reflectionTargets?.blurExpectedDirections) !== JSON.stringify([[15, 0], [0, 0]])) {
    floorErrors.push(`reflectionBlurExpectedDirections=${JSON.stringify(reflectionTargets?.blurExpectedDirections || null)}`);
  }
  if (reflectionTargets?.blurPassScreenMode !== "source-i1-private-screen-camera") floorErrors.push("blurPassScreenMode");
  if (reflectionTargets?.screenTriangleMode !== "source-i1-screenTriangle-n1-geometry-owned-by-reflector") {
    floorErrors.push("screenTriangleMode");
  }
  if (reflectionTargets?.screenTriangleSharedWithScreen !== true) floorErrors.push("screenTriangleSharedWithScreen");
  if (JSON.stringify(reflectionTargets?.screenTrianglePosition) !== JSON.stringify([-1, 3, 0, -1, -1, 0, 3, -1, 0])) {
    floorErrors.push(`screenTrianglePosition=${JSON.stringify(reflectionTargets?.screenTrianglePosition || null)}`);
  }
  if (JSON.stringify(reflectionTargets?.screenTriangleUv) !== JSON.stringify([0, 2, 0, 0, 2, 0])) {
    floorErrors.push(`screenTriangleUv=${JSON.stringify(reflectionTargets?.screenTriangleUv || null)}`);
  }
  if (reflectionTargets?.screenFrustumCulled !== false) floorErrors.push("screenFrustumCulled");
  if (reflectionTargets?.screenMaterialShared !== true) floorErrors.push("screenMaterialShared");
  if (reflectionTargets?.screenDisposeMode !== "source-i1-destroy-disposes-screenTriangle") floorErrors.push("screenDisposeMode");
  if (reflectionTargets?.reflectorNormalConstructorMode !== "source-i1-normal-new-Vector3-zero-runtime-update-sets-0-0-1") {
    floorErrors.push("reflectorNormalConstructorMode");
  }
  if (reflectionTargets?.reflectorNormalConstructorWasZero !== true) floorErrors.push("reflectorNormalConstructorWasZero");
  if (reflectionTargets?.reflectorNormalRuntimeMode !== "source-i1-update-normal-set-0-0-1-then-apply-reflector-rotation") {
    floorErrors.push("reflectorNormalRuntimeMode");
  }
  if (parsed.probe.reflectionState?.camera?.reflectorNormalConstructorMode !== "source-i1-normal-new-Vector3-zero-runtime-update-sets-0-0-1") {
    floorErrors.push("cameraReflectorNormalConstructorMode");
  }
  if (parsed.probe.reflectionState?.camera?.reflectorNormalConstructorWasZero !== true) {
    floorErrors.push("cameraReflectorNormalConstructorWasZero");
  }
  if (reflectionTargets?.floorVisibilityMode !== "source-a1-onBeforeRender-hide-component-group") floorErrors.push("floorVisibilityMode");
  if (reflectionTargets?.clipBias !== 0) floorErrors.push("clipBias");
  if (reflectionTargets?.blurSwapMode !== "source-i1-write-target-loop-swap") floorErrors.push("blurSwapMode");
  if (reflectionTargets?.blurSwapOwnershipMode !== "source-i1-direct-renderTargetRead-renderTargetWrite-field-swap-inside-loop") {
    floorErrors.push("blurSwapOwnershipMode");
  }
  if (reflectionTargets?.renderTargetUniformMode !== "source-i1-update-after-each-blur-swap") floorErrors.push("renderTargetUniformMode");
  if (reflectionTargets?.readConstructionMode !== "source-i1-renderTargetRead-renderTarget-clone") floorErrors.push("reflectionReadCloneMode");
  if (reflectionTargets?.writeConstructionMode !== "source-i1-renderTargetWrite-renderTarget-clone") floorErrors.push("reflectionWriteCloneMode");
  if (reflectionTargets?.readDepthBufferFromCloneBeforeRawToggle !== false) floorErrors.push("reflectionReadCloneDepthBuffer");
  if (reflectionTargets?.writeDepthBufferFromCloneBeforeRawToggle !== false) floorErrors.push("reflectionWriteCloneDepthBuffer");
  if (floorUniforms?.reflectionTargetSize?.constructionDepthBuffer !== false) floorErrors.push("floorRawConstructionDepthBuffer");
  if (floorUniforms?.reflectionTargetSize?.constructorMode !== "source-i1-default-width-height-512-blurIterations-2") {
    floorErrors.push("floorReflectionConstructorMode");
  }
  if (floorUniforms?.reflectionTargetSize?.constructorWidth !== 512 || floorUniforms?.reflectionTargetSize?.constructorHeight !== 512) {
    floorErrors.push("floorReflectionConstructorSize");
  }
  if (floorUniforms?.reflectionTargetSize?.blurIterations !== 2) floorErrors.push("floorReflectionBlurIterations");
  if (floorUniforms?.reflectionTargetSize?.runtimeDepthBuffer !== true) floorErrors.push("floorRawRuntimeDepthBuffer");
  if (floorUniforms?.reflectionReadTargetSize?.constructionMode !== "source-i1-renderTargetRead-cloned-before-raw-depthBuffer-toggle") floorErrors.push("floorReadCloneMode");
  if (floorUniforms?.reflectionWriteTargetSize?.constructionMode !== "source-i1-renderTargetWrite-cloned-before-raw-depthBuffer-toggle") floorErrors.push("floorWriteCloneMode");
  if (floorUniforms?.reflectionReadTargetSize?.depthBuffer !== false) floorErrors.push("floorReadCloneDepthBuffer");
  if (floorUniforms?.reflectionWriteTargetSize?.depthBuffer !== false) floorErrors.push("floorWriteCloneDepthBuffer");
  if (floorUniforms?.reflectionUniformOwnership !== "source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform") floorErrors.push("floorReflectionUniformOwnership");
  if (floorUniforms?.tReflectUniformShared !== true) floorErrors.push("floorTReflectUniformShared");
  if (floorUniforms?.uMatrixUniformShared !== true) floorErrors.push("floorUMatrixUniformShared");
  if (reflectionTargets?.reflectionUniformOwnership !== "source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform") floorErrors.push("reflectionUniformOwnership");
  if (reflectionTargets?.tReflectUniformShared !== true) floorErrors.push("reflectionTReflectUniformShared");
  if (reflectionTargets?.uMatrixUniformShared !== true) floorErrors.push("reflectionUMatrixUniformShared");
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
  if (skyComposite?.delayedBindingMode !== "source-nD-after-first-resize-100ms-bind-repeat-composite") skyUniformErrors.push("delayedBindingMode");
  if (skyComposite?.tSceneConstructorMode !== "source-z1-tScene-construct-null-Lo-update-binds-raw") skyUniformErrors.push("tSceneConstructorMode");
  if (skyComposite?.tSceneIsRawTarget !== true) skyUniformErrors.push("tSceneRawBinding");
  if (skyComposite?.isEnvironmentSkySource !== true) skyUniformErrors.push("environmentSkySource");
  if (skyComposite?.backgroundMode !== "source-V1-background-666666-linear-to-srgb") skyUniformErrors.push("backgroundMode");
  if (!Array.isArray(skyComposite?.background) || skyComposite.background.length !== 3) skyUniformErrors.push("backgroundValue");
  if (skyComposite?.backgroundMatchesSource !== true) skyUniformErrors.push("backgroundMatchesSource");
  if (skyComposite?.timeMode !== (parsed.probe.renderer?.dprPolicy?.lowRes ? "source-V1-low-res-time-0" : "source-V1-live-time")) skyUniformErrors.push("timeMode");
  if (skyComposite?.uTimeUpdateOrder !== "source-V1-super-update-before-z1-uTime-write") skyUniformErrors.push("uTimeUpdateOrder");
  if (skyTarget && skyComposite && (skyTarget.width !== skyComposite.expectedSize || skyTarget.height !== skyComposite.expectedSize)) skyUniformErrors.push("targetSize");
  const skyRawTarget = parsed.probe.targets?.skyRaw;
  if (skyRawTarget && skyComposite && (skyRawTarget.width !== skyComposite.expectedRawSize || skyRawTarget.height !== skyComposite.expectedRawSize)) skyUniformErrors.push("rawTargetSize");
  const RepeatWrapping = 1000;
  if (skyComposite?.wrapMode !== "source-nD-sky-composite-repeat-for-work-env") skyUniformErrors.push("skyCompositeWrapMode");
  if (skyComposite?.wrapS !== RepeatWrapping || skyComposite?.wrapT !== RepeatWrapping) skyUniformErrors.push("sourceNdSkyCompositeRepeatWrap");
  if (environmentUniforms?.tSkyBindingMode !== "source-nD-after-init-resize-delay-bind-repeat-composite") skyUniformErrors.push("environmentBindingMode");
  if (environmentUniforms?.tSkyIsComposite !== true || environmentUniforms?.skyCompositeBindingMatchesUniform !== true) skyUniformErrors.push("environmentCompositeBinding");
  if (environmentUniforms?.tSkyWrapS !== RepeatWrapping || environmentUniforms?.tSkyWrapT !== RepeatWrapping) skyUniformErrors.push("environmentSkyWrap");
  if (environmentUniforms?.sceneEnvironmentLoadMode !== "source-p1-addEnvironment-Le-WEBP-selected-extension-no-runtime-fallback") skyUniformErrors.push("sceneEnvironmentLoadMode");
  if (environmentUniforms?.sceneEnvironmentExt !== updateOrder?.sourceAssetExt) skyUniformErrors.push("sceneEnvironmentExt");
  if (environmentUniforms?.sceneEnvironmentLoaded !== true) skyUniformErrors.push("sceneEnvironmentLoaded");
  if (environmentUniforms?.sceneEnvironmentFailed !== false) skyUniformErrors.push("sceneEnvironmentFailed");
  if (!Array.isArray(environmentUniforms?.sceneEnvironmentUrls) || environmentUniforms.sceneEnvironmentUrls.length !== 6) skyUniformErrors.push("sceneEnvironmentUrls");
  if (Array.isArray(environmentUniforms?.sceneEnvironmentUrls) && !environmentUniforms.sceneEnvironmentUrls.every((url) => url.endsWith(`.${updateOrder?.sourceAssetExt}`))) {
    skyUniformErrors.push("sceneEnvironmentUrlExt");
  }
  if (skyUniforms?.uShader1Mix3Binding !== "source-declared-only") skyUniformErrors.push("uShader1Mix3Binding");
  if (skyUniforms?.uShader3ScaleBinding !== "source-declared-only") skyUniformErrors.push("uShader3ScaleBinding");
  if (skyUniforms?.uShaderMix !== null) skyUniformErrors.push("uShaderMixValue");
  if (skyUniforms?.uShaderMixMode !== "source-Zs-missing-SHADER_1_MIX_3") skyUniformErrors.push("uShaderMixMode");
  if (skyUniformErrors.length) {
    throw new Error(`Sky composite uniform binding source-shape mismatch: ${skyUniformErrors.join(", ")}`);
  }
  const MirroredRepeatWrapping = 1002;
  const LinearMipmapLinearFilter = 1008;
  const textures = parsed.probe.textures || {};
  const textureWrappingErrors = [];
  if (textures.sourceLoadedTextureMode !== "source-Xt-TextureLoader-default-sampling-wrap-only-overrides") textureWrappingErrors.push("sourceLoadedTextureMode");
  if (textures.sourceWebpDetectionMode !== "source-Qe-k0-lossy-before-Xt-preloadTextures") textureWrappingErrors.push("sourceWebpDetectionMode");
  if (textures.sourceWebpSupport !== updateOrder?.sourceWebpSupport) textureWrappingErrors.push("sourceWebpSupport");
  if (textures.sourceAssetExt !== updateOrder?.sourceAssetExt) textureWrappingErrors.push("sourceAssetExt");
  const immediateBindings = textures.sourceImmediateTextureBindings || {};
  if (immediateBindings.mode !== "source-Xt-loadTexture-immediate-texture-object-bound-before-onload") {
    textureWrappingErrors.push("immediateBindingMode");
  }
  const immediateBindingErrors = [];
  const blueNoiseImmediate = immediateBindings.blueNoise || {};
  const perlin2Immediate = immediateBindings.perlin2 || {};
  const perlin1Immediate = immediateBindings.perlin1 || {};
  if (blueNoiseImmediate.objectBindingMode !== "source-Xt-loadTexture-immediate-texture-object-bound-before-onload") immediateBindingErrors.push("blueNoiseObjectMode");
  if (blueNoiseImmediate.stateIsImmediateTexture !== true) immediateBindingErrors.push("blueNoiseStateImmediate");
  if (blueNoiseImmediate.c1TNoiseIsImmediateTexture !== true) immediateBindingErrors.push("blueNoiseC1TNoiseImmediate");
  if (blueNoiseImmediate.kaNoiseTextureBindingMode !== "source-Ka-uNoiseTexture-constructor-null-no-runtime-writer") immediateBindingErrors.push("blueNoiseKaNoiseMode");
  if (blueNoiseImmediate.screenMouseNoiseIsSourceNull !== true) immediateBindingErrors.push("blueNoiseScreenMouseSourceNull");
  if (blueNoiseImmediate.allWorkMouseNoiseUniformsSourceNull !== true) immediateBindingErrors.push("blueNoiseWorkMouseSourceNull");
  if (blueNoiseImmediate.loadedSameImmediateTexture !== true) immediateBindingErrors.push("blueNoiseLoadedSame");
  if (perlin2Immediate.objectBindingMode !== "source-Xt-loadTexture-immediate-texture-object-bound-before-onload") immediateBindingErrors.push("perlin2ObjectMode");
  if (perlin2Immediate.stateIsImmediateTexture !== true) immediateBindingErrors.push("perlin2StateImmediate");
  if (perlin2Immediate.c1TPerlinIsImmediateTexture !== true) immediateBindingErrors.push("perlin2C1Immediate");
  if (perlin2Immediate.loadedSameImmediateTexture !== true) immediateBindingErrors.push("perlin2LoadedSame");
  if (perlin1Immediate.objectBindingMode !== "source-Xt-loadTexture-immediate-texture-object-bound-before-onload") immediateBindingErrors.push("perlin1ObjectMode");
  if (perlin1Immediate.stateIsImmediateTexture !== true) immediateBindingErrors.push("perlin1StateImmediate");
  if (perlin1Immediate.allWorkUniformsImmediate !== true) immediateBindingErrors.push("perlin1WorkImmediate");
  if (perlin1Immediate.auxiliaryUniformsImmediate !== true) immediateBindingErrors.push("perlin1AuxImmediate");
  if (perlin1Immediate.loadedSameImmediateTexture !== true) immediateBindingErrors.push("perlin1LoadedSame");
  if (immediateBindingErrors.length) {
    textureWrappingErrors.push(`immediate:${immediateBindingErrors.join("|")}`);
  }
  if (textures.noise?.wrapS !== RepeatWrapping || textures.noise?.wrapT !== RepeatWrapping) textureWrappingErrors.push("blueNoise");
  if (textures.floorNormal?.wrapS !== RepeatWrapping || textures.floorNormal?.wrapT !== RepeatWrapping) textureWrappingErrors.push("floorNormal");
  if (textures.perlin?.wrapS !== RepeatWrapping || textures.perlin?.wrapT !== RepeatWrapping) textureWrappingErrors.push("perlin2");
  if (textures.workPerlin?.wrapS !== MirroredRepeatWrapping || textures.workPerlin?.wrapT !== MirroredRepeatWrapping) textureWrappingErrors.push("perlin1");
  for (const key of ["noise", "floorNormal", "perlin", "workPerlin"]) {
    const texture = textures[key];
    if (!texture) {
      textureWrappingErrors.push(`${key}:missing`);
      continue;
    }
    if (texture.minFilter !== LinearMipmapLinearFilter) textureWrappingErrors.push(`${key}:minFilter=${texture.minFilter}`);
    if (texture.magFilter !== LinearFilter) textureWrappingErrors.push(`${key}:magFilter=${texture.magFilter}`);
    if (texture.generateMipmaps !== true) textureWrappingErrors.push(`${key}:mipmaps=${texture.generateMipmaps}`);
    if (texture.anisotropy !== 1) textureWrappingErrors.push(`${key}:anisotropy=${texture.anisotropy}`);
  }
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

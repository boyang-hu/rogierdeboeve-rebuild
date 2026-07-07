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

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-thumb-spotlight-probe");
const port = Number(process.env.CDP_PORT || 9233);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const waitAfter = Number(process.env.PROBE_WAIT || 5000);
const sourceProbeProgress = Number(process.env.THUMB_PROGRESS || 0.27);
const viewportName = process.env.VIEWPORT || "desktop";
const viewport = viewportName === "mobile"
  ? { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }
  : { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
const expectedSpotlightParallaxYOffsetMode = viewport.width >= 800
  ? "source-p1-desktop-camera-y-parallax"
  : "source-p1-mobile-0_3-plus-camera-y-parallax";
const expectedSpotlightMobileYOffset = viewport.width >= 800 ? 0 : 0.3;
const expectedTargetSize = Math.round(viewport.height);
const expectedThumbTransferSteps = [
  "setRenderTarget(renderTargetA)",
  "render(scene,camera)",
  "bindCompositeTScene(renderTargetA.texture)",
  "assignScreenCompositeMaterial",
  "setRenderTarget(renderTargetComposite)",
  "render(screen,screenCamera)",
  "setRenderTarget(null)",
];
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

if (!Number.isFinite(sourceProbeProgress)) {
  throw new Error(`Invalid THUMB_PROGRESS: ${process.env.THUMB_PROGRESS}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function closeTo(actual, expected, epsilon = 1e-6) {
  return Math.abs(actual - expected) <= epsilon;
}

function sourceProjectSpotlightUsesPayload(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed !== 0;
}

function sourceProjectSpotlightIntensity(value, fallback = 220) {
  return sourceProjectSpotlightUsesPayload(value) ? Number(value) : fallback;
}

function expectedThumbX(hook, thumbProgress, totalWidth) {
  let x = (hook + thumbProgress + totalWidth * 67890) % totalWidth;
  if (x > totalWidth / 2) x -= totalWidth;
  return x;
}

function assertSourceSpotlightDefaults(light, label, errors) {
  if (light?.defaultMode !== "source-Qm-constructor-color-intensity-default-distance-decay-SpotLightShadow") {
    errors.push(`${label}DefaultMode=${light?.defaultMode}`);
  }
  if (light?.constructorLifecycleMode !== "source-p1-setLights-no-map-no-target-position") {
    errors.push(`${label}ConstructorLifecycleMode=${light?.constructorLifecycleMode}`);
  }
  if (light?.constructorMapWasNull !== true) errors.push(`${label}ConstructorMapWasNull=${light?.constructorMapWasNull}`);
  if (JSON.stringify(light?.constructorTarget) !== JSON.stringify([0, 0, 0])) {
    errors.push(`${label}ConstructorTarget=${JSON.stringify(light?.constructorTarget)}`);
  }
  if (light?.constructorTargetWasDefault !== true) {
    errors.push(`${label}ConstructorTargetWasDefault=${light?.constructorTargetWasDefault}`);
  }
  if (light?.homeInitMode !== "source-SD-init-owns-spotLight-map-position-target-intensity") {
    errors.push(`${label}HomeInitMode=${light?.homeInitMode}`);
  }
  if (light?.shadowDefaultMode !== "source-Iw-SpotLightShadow-default-focus1-camera-50-1-0_5-500-mapSize512") {
    errors.push(`${label}ShadowDefaultMode=${light?.shadowDefaultMode}`);
  }
  if (light?.colorHex !== 0xffffff) errors.push(`${label}ColorHex=${light?.colorHex}`);
  if (!closeTo(light?.distance, 0)) errors.push(`${label}Distance=${light?.distance}`);
  if (!closeTo(light?.decay, 2)) errors.push(`${label}Decay=${light?.decay}`);
  if (!closeTo(light?.shadowFocus, 1)) errors.push(`${label}ShadowFocus=${light?.shadowFocus}`);
  if (JSON.stringify(light?.shadowMapSize) !== JSON.stringify([512, 512])) {
    errors.push(`${label}ShadowMapSize=${JSON.stringify(light?.shadowMapSize)}`);
  }
  if (light?.shadowCameraFovMode !== "source-SpotLightShadow-updateMatrices-angle-focus-fov") {
    errors.push(`${label}ShadowCameraFovMode=${light?.shadowCameraFovMode}`);
  }
  if (!closeTo(light?.shadowCameraExpectedFov, 90)) errors.push(`${label}ShadowCameraExpectedFov=${light?.shadowCameraExpectedFov}`);
  if (!closeTo(light?.shadowCameraFov, light?.shadowCameraExpectedFov ?? 90)) errors.push(`${label}ShadowCameraFov=${light?.shadowCameraFov}`);
  if (!closeTo(light?.shadowCameraAspect, 1)) errors.push(`${label}ShadowCameraAspect=${light?.shadowCameraAspect}`);
  if (!closeTo(light?.shadowCameraNear, 0.5)) errors.push(`${label}ShadowCameraNear=${light?.shadowCameraNear}`);
  if (light?.shadowCameraFarMode !== "source-SpotLightShadow-updateMatrices-distance-0-keeps-camera-far-500") {
    errors.push(`${label}ShadowCameraFarMode=${light?.shadowCameraFarMode}`);
  }
  if (!closeTo(light?.shadowCameraFar, 500)) errors.push(`${label}ShadowCameraFar=${light?.shadowCameraFar}`);
}

function assertActiveProjectSpotlight(light, label, errors) {
  const expected = sourceProjectSpotlightIntensity(light?.activeProjectSpotlightRaw, 220);
  const expectedUsesPayload = sourceProjectSpotlightUsesPayload(light?.activeProjectSpotlightRaw);
  if (light?.activeProjectIntensityMode !== sourceActiveProjectSpotlightIntensityMode) {
    errors.push(`${label}ActiveProjectIntensityMode=${light?.activeProjectIntensityMode}`);
  }
  if (light?.activeProjectFallbackMode !== "source-js-or-falsy-zero-empty-missing-to-maxSpotLightIntensity") {
    errors.push(`${label}ActiveProjectFallbackMode=${light?.activeProjectFallbackMode}`);
  }
  if (light?.activeProjectUsesPayloadSpotlight !== expectedUsesPayload) {
    errors.push(`${label}ActiveProjectUsesPayload=${light?.activeProjectUsesPayloadSpotlight}`);
  }
  if (!closeTo(light?.expectedActiveProjectIntensity, expected)) {
    errors.push(`${label}ExpectedActiveProjectIntensity=${light?.expectedActiveProjectIntensity}`);
  }
  if (light?.activeProjectIntensityMatchesExpected !== true) {
    errors.push(`${label}ActiveProjectIntensityMatchesExpected=${light?.activeProjectIntensityMatchesExpected}`);
  }
  return expected;
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
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  const url = new URL(rebuildUrl);
  url.searchParams.set("skip-preloader", "");
  url.searchParams.set("debug-thumb-probe", "1");
  url.searchParams.set("debug-thumb-progress", String(sourceProbeProgress));
  await send(ws, "Page.navigate", { url: url.href });
  await wait(waitAfter);
  const result = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      body: document.body.className,
      html: document.documentElement.className,
      active: document.querySelector('[data-project-card].is-active')?.dataset.slug || null,
      probe: window.__rogierThumbProbe || null,
      canvas: [...document.querySelectorAll('canvas')].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return { width: canvas.width, height: canvas.height, rectWidth: rect.width, rectHeight: rect.height };
      })
    })`,
    returnByValue: true,
  });
  const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const parsed = JSON.parse(result.result.value);
  if (!parsed.probe) throw new Error("No __rogierThumbProbe data found");
  const probe = parsed.probe;
  const sourceShapeErrors = [];
  const sourceDefaults = probe.sourceDefaults || {};
  if (sourceDefaults.thumbDarknessIntensity !== 0.5) {
    sourceShapeErrors.push(`thumbDefaultDarkness=${sourceDefaults.thumbDarknessIntensity}`);
  }
  if (sourceDefaults.homeThumbDarknessFallback !== 0) {
    sourceShapeErrors.push(`homeThumbDarknessFallback=${sourceDefaults.homeThumbDarknessFallback}`);
  }
  if (sourceDefaults.thumbDarknessColor !== "#000000") {
    sourceShapeErrors.push(`thumbDefaultColor=${sourceDefaults.thumbDarknessColor}`);
  }
  if (sourceDefaults.thumbSaturation !== 1) {
    sourceShapeErrors.push(`thumbDefaultSaturation=${sourceDefaults.thumbSaturation}`);
  }
  if (sourceDefaults.thumbMouseLightness !== 1) {
    sourceShapeErrors.push(`thumbDefaultMouseLightness=${sourceDefaults.thumbMouseLightness}`);
  }
  if (probe.thumbPositionMode !== "source-w1-centered-x-wrap") {
    sourceShapeErrors.push(`thumbPositionMode=${probe.thumbPositionMode}`);
  }
  if (probe.sourceProgressSignMode !== "source-yD-updateScene-workThumbScene-thumbs-updateGalleryProgress-negative-scroll-progress") {
    sourceShapeErrors.push(`sourceProgressSignMode=${probe.sourceProgressSignMode}`);
  }
  if (probe.sourceProgressUpdateOrder !== "source-yD-sceneWrap-uTransformX-thumbProgress-before-roll-zoom") {
    sourceShapeErrors.push(`sourceProgressUpdateOrder=${probe.sourceProgressUpdateOrder}`);
  }
  if (probe.sourceProgressTransformOrder !== "source-yD-sceneWrap-then-uTransformX-then-thumbProgress") {
    sourceShapeErrors.push(`sourceProgressTransformOrder=${probe.sourceProgressTransformOrder}`);
  }
  const activeProjectApplicationOrder = probe.activeProjectApplicationOrder || {};
  if (activeProjectApplicationOrder.mode !== sourceActiveProjectApplicationOrderMode) {
    sourceShapeErrors.push(`activeProjectApplicationOrderMode=${activeProjectApplicationOrder.mode}`);
  }
  if (activeProjectApplicationOrder.wooshMode !== sourceActiveProjectWooshMode) {
    sourceShapeErrors.push(`activeProjectWooshMode=${activeProjectApplicationOrder.wooshMode}`);
  }
  if (activeProjectApplicationOrder.mainDoesNotOwnActiveProjectWoosh !== true) {
    sourceShapeErrors.push(`activeProjectWooshMainOwnership=${activeProjectApplicationOrder.mainDoesNotOwnActiveProjectWoosh}`);
  }
  if (JSON.stringify(activeProjectApplicationOrder.expected) !== JSON.stringify(sourceActiveProjectApplicationOrder)) {
    sourceShapeErrors.push(`activeProjectApplicationOrder=${JSON.stringify(activeProjectApplicationOrder.expected)}`);
  }
  for (const key of [
    "activeProjectBeforeSpotlight",
    "spotlightBeforeRevealSpread",
    "revealSpreadBeforeWoosh",
    "wooshBeforeUReveal",
    "uRevealBeforeLook",
    "lookBeforeDirectionalLight",
  ]) {
    if (activeProjectApplicationOrder[key] !== true) {
      sourceShapeErrors.push(`${key}=${activeProjectApplicationOrder[key]}`);
    }
  }
  if (probe.debugProgress !== sourceProbeProgress) {
    sourceShapeErrors.push(`debugProgress=${probe.debugProgress}`);
  }
  if (!closeTo(probe.galleryProgress, sourceProbeProgress)) {
    sourceShapeErrors.push(`galleryProgress=${probe.galleryProgress},expected=${sourceProbeProgress}`);
  }
  const galleryDynamics = probe.galleryDynamics || {};
  if (galleryDynamics.mode !== "source-yD-updateScene-roll-zoom-bo-targets-Yi-rounded-lerp") {
    sourceShapeErrors.push(`galleryDynamicsMode=${galleryDynamics.mode}`);
  }
  if (galleryDynamics.rollTargetMode !== "source-bo-clamp-minus4-plus4-Fn4") {
    sourceShapeErrors.push(`galleryRollTargetMode=${galleryDynamics.rollTargetMode}`);
  }
  if (galleryDynamics.zoomTargetMode !== "source-bo-clamp-0-1-Fn4") {
    sourceShapeErrors.push(`galleryZoomTargetMode=${galleryDynamics.zoomTargetMode}`);
  }
  if (galleryDynamics.lerpMode !== "source-Yi-PT-Fn4-exponential-lerp") {
    sourceShapeErrors.push(`galleryLerpMode=${galleryDynamics.lerpMode}`);
  }
  if (galleryDynamics.deltaMode !== "source-yD-onRaf-uses-Bt-raw-delta-no-gallery-clamp") {
    sourceShapeErrors.push(`galleryDeltaMode=${galleryDynamics.deltaMode}`);
  }
  if (galleryDynamics.deltaClampApplied !== false) {
    sourceShapeErrors.push(`galleryDeltaClampApplied=${galleryDynamics.deltaClampApplied}`);
  }
  if (galleryDynamics.deltaFinite !== true || !Number.isFinite(galleryDynamics.delta) || galleryDynamics.delta < 0) {
    sourceShapeErrors.push(`galleryDelta=${galleryDynamics.delta}`);
  }
  if (!closeTo(galleryDynamics.rollTarget ?? NaN, 0)) {
    sourceShapeErrors.push(`galleryRollTarget=${galleryDynamics.rollTarget}`);
  }
  if (!closeTo(galleryDynamics.zoomTarget ?? NaN, 0)) {
    sourceShapeErrors.push(`galleryZoomTarget=${galleryDynamics.zoomTarget}`);
  }
  if (galleryDynamics.sceneRotationRounded !== true) {
    sourceShapeErrors.push(`gallerySceneRotationRounded=${galleryDynamics.sceneRotationRounded}`);
  }
  if (galleryDynamics.zoomRounded !== true) {
    sourceShapeErrors.push(`galleryZoomRounded=${galleryDynamics.zoomRounded}`);
  }
  if (galleryDynamics.rotationMatchesSourceState !== true) {
    sourceShapeErrors.push(`galleryRotationMatchesSourceState=${galleryDynamics.rotationMatchesSourceState}`);
  }
  if (galleryDynamics.positionMatchesSourceState !== true) {
    sourceShapeErrors.push(`galleryPositionMatchesSourceState=${galleryDynamics.positionMatchesSourceState}`);
  }
  if (probe.thumbHierarchyMode !== "source-T1-w1-scrollWrap-E1-mesh") {
    sourceShapeErrors.push(`thumbHierarchyMode=${probe.thumbHierarchyMode}`);
  }
  if (probe.spotlight?.positionOwnershipMode !== "source-direct-SpotLight-position-target-no-local-mirror") {
    sourceShapeErrors.push(`spotlightPositionOwnership=${probe.spotlight?.positionOwnershipMode}`);
  }
  if (probe.spotlight?.parallaxMode !== "source-p1-spotLight-x-camera-y-desktop-or-0_3-mobile") {
    sourceShapeErrors.push(`spotlightParallaxMode=${probe.spotlight?.parallaxMode}`);
  }
  if (probe.spotlight?.parallaxYOffsetMode !== expectedSpotlightParallaxYOffsetMode) {
    sourceShapeErrors.push(`spotlightParallaxYOffsetMode=${probe.spotlight?.parallaxYOffsetMode}`);
  }
  if (probe.spotlight?.mobileBreakpoint !== 800) {
    sourceShapeErrors.push(`spotlightMobileBreakpoint=${probe.spotlight?.mobileBreakpoint}`);
  }
  if (probe.spotlight?.mobileYOffset !== expectedSpotlightMobileYOffset) {
    sourceShapeErrors.push(`spotlightMobileYOffset=${probe.spotlight?.mobileYOffset}`);
  }
  if (probe.spotlight?.hasMap !== true) {
    sourceShapeErrors.push(`spotlightHasMap=${probe.spotlight?.hasMap}`);
  }
  assertSourceSpotlightDefaults(probe.spotlight, "spotlight", sourceShapeErrors);
  const expectedActiveProjectSpotlight = assertActiveProjectSpotlight(probe.spotlight, "spotlight", sourceShapeErrors);
  if (!closeTo(probe.spotlight?.intensity, expectedActiveProjectSpotlight)) {
    sourceShapeErrors.push(`spotlightIntensity=${probe.spotlight?.intensity}`);
  }
  if (probe.spotlight?.stateOwnership !== "source-Se-settings-light-state-onUpdate-intensities") {
    sourceShapeErrors.push(`spotlightStateOwnership=${probe.spotlight?.stateOwnership}`);
  }
  if (probe.spotlight?.stateIntensityMatchesLight !== true) {
    sourceShapeErrors.push(`spotlightStateIntensityMatchesLight=${probe.spotlight?.stateIntensityMatchesLight}`);
  }
  if (probe.spotlight?.homeEntryIntensityMode !== sourceHomeSpotlightIntensityMode) {
    sourceShapeErrors.push(`spotlightHomeEntryIntensityMode=${probe.spotlight?.homeEntryIntensityMode}`);
  }
  if (probe.spotlight?.homeEntryIntensityIgnoresPayload !== true) {
    sourceShapeErrors.push(`spotlightHomeEntryIntensityIgnoresPayload=${probe.spotlight?.homeEntryIntensityIgnoresPayload}`);
  }
  if (probe.spotlight?.expectedHomeEntryIntensity !== 220) {
    sourceShapeErrors.push(`spotlightExpectedHomeEntryIntensity=${probe.spotlight?.expectedHomeEntryIntensity}`);
  }
  if (!closeTo(probe.spotlight?.stateIntensity, expectedActiveProjectSpotlight)) {
    sourceShapeErrors.push(`spotlightStateIntensity=${probe.spotlight?.stateIntensity}`);
  }
  if (JSON.stringify(probe.spotlight?.position) !== JSON.stringify([0, expectedSpotlightMobileYOffset, 3.7])) {
    sourceShapeErrors.push(`spotlightPosition=${JSON.stringify(probe.spotlight?.position)}`);
  }
  if (JSON.stringify(probe.spotlight?.target) !== JSON.stringify([0, 0, -8])) {
    sourceShapeErrors.push(`spotlightTarget=${JSON.stringify(probe.spotlight?.target)}`);
  }
  if (probe.spotlight?.parallax !== true) {
    sourceShapeErrors.push(`spotlightParallax=${probe.spotlight?.parallax}`);
  }
  const projection = probe.spotlightProjection;
  if (!projection) {
    sourceShapeErrors.push("spotlightProjection=missing");
  } else {
    if (projection.spotlight?.hasMap !== true) sourceShapeErrors.push(`projectionHasMap=${projection.spotlight?.hasMap}`);
    if (projection.spotlight?.mapMode !== "source-thumb-composite-target") sourceShapeErrors.push(`projectionMapMode=${projection.spotlight?.mapMode}`);
    if (projection.spotlight?.mapProjectionMode !== "three-r164-spotLightMap-vSpotLightCoord") {
      sourceShapeErrors.push(`projectionMapProjectionMode=${projection.spotlight?.mapProjectionMode}`);
    }
    if (projection.spotlight?.projectionPath !== "source-SpotLight.map-without-castShadow") {
      sourceShapeErrors.push(`projectionPath=${projection.spotlight?.projectionPath}`);
    }
    if (projection.spotlight?.castShadow !== false) sourceShapeErrors.push(`projectionCastShadow=${projection.spotlight?.castShadow}`);
    if (projection.spotlight?.mapColorSpace !== "") sourceShapeErrors.push(`projectionMapColorSpace=${projection.spotlight?.mapColorSpace}`);
    assertSourceSpotlightDefaults(projection.spotlight, "projection", sourceShapeErrors);
    const expectedProjectionSpotlight = assertActiveProjectSpotlight(projection.spotlight, "projection", sourceShapeErrors);
    if (!closeTo(projection.spotlight?.intensity, expectedProjectionSpotlight)) {
      sourceShapeErrors.push(`projectionIntensity=${projection.spotlight?.intensity}`);
    }
    if (!closeTo(projection.spotlight?.stateIntensity, expectedProjectionSpotlight)) {
      sourceShapeErrors.push(`projectionStateIntensity=${projection.spotlight?.stateIntensity}`);
    }
    if (projection.spotlight?.homeEntryIntensityMode !== sourceHomeSpotlightIntensityMode) {
      sourceShapeErrors.push(`projectionHomeEntryIntensityMode=${projection.spotlight?.homeEntryIntensityMode}`);
    }
    if (projection.spotlight?.homeEntryIntensityIgnoresPayload !== true) {
      sourceShapeErrors.push(`projectionHomeEntryIntensityIgnoresPayload=${projection.spotlight?.homeEntryIntensityIgnoresPayload}`);
    }
    if (projection.spotlight?.expectedHomeEntryIntensity !== 220) {
      sourceShapeErrors.push(`projectionExpectedHomeEntryIntensity=${projection.spotlight?.expectedHomeEntryIntensity}`);
    }
    if (projection.spotlight?.positionOwnershipMode !== "source-direct-SpotLight-position-target-no-local-mirror") {
      sourceShapeErrors.push(`projectionPositionOwnership=${projection.spotlight?.positionOwnershipMode}`);
    }
    if (projection.spotlight?.parallaxYOffsetMode !== expectedSpotlightParallaxYOffsetMode) {
      sourceShapeErrors.push(`projectionParallaxYOffsetMode=${projection.spotlight?.parallaxYOffsetMode}`);
    }
    if (projection.projectionMatrixMode !== "source-SD-SpotLight-map-through-three-shadow-matrix") {
      sourceShapeErrors.push(`projectionMatrixMode=${projection.projectionMatrixMode}`);
    }
    if (projection.shadowPathMode !== "source-map-projection-not-shadow-cast") {
      sourceShapeErrors.push(`projectionShadowPathMode=${projection.shadowPathMode}`);
    }
    if (projection.threeChunkMode !== "r164-lights_fragment_begin-multiplies-directLight-by-spotLightMap") {
      sourceShapeErrors.push(`projectionThreeChunkMode=${projection.threeChunkMode}`);
    }
    if (projection.sampleGridMode !== "source-spotlight-map-3x3-active-bounds") {
      sourceShapeErrors.push(`projectionSampleGridMode=${projection.sampleGridMode}`);
    }
    if (projection.sampleCount !== 9 || !Array.isArray(projection.samples) || projection.samples.length !== 9) {
      sourceShapeErrors.push(`projectionSamples=${projection.sampleCount}/${projection.samples?.length}`);
    }
    if (!Number.isFinite(projection.inMapCoverage) || projection.inMapCoverage <= 0) {
      sourceShapeErrors.push(`projectionInMapCoverage=${projection.inMapCoverage}`);
    }
    if (!Number.isFinite(projection.inMapCount) || projection.inMapCount < 1) {
      sourceShapeErrors.push(`projectionInMapCount=${projection.inMapCount}`);
    }
    if (!Number.isFinite(projection.mapLumaMean) || projection.mapLumaMean <= 0.01) {
      sourceShapeErrors.push(`projectionMapLumaMean=${projection.mapLumaMean}`);
    }
    const inMapSamples = (projection.samples || []).filter((sample) => sample.inMap);
    if (!inMapSamples.every((sample) => Number.isFinite(sample.mapPixel?.luma) && sample.mapPixel.luma > 0.01)) {
      sourceShapeErrors.push("projectionInMapSampleLuma");
    }
  }
  const imageOwnership = probe.thumbImageOwnership || {};
  if (imageOwnership.mode !== "source-Xt-preloadThumbs-projectThumbs-thumbsReady-E1-setImage") {
    sourceShapeErrors.push(`thumbImageOwnership=${imageOwnership.mode}`);
  }
  if (imageOwnership.thumbsReadyResolved !== true) {
    sourceShapeErrors.push(`thumbsReadyResolved=${imageOwnership.thumbsReadyResolved}`);
  }
  if (imageOwnership.projectThumbCount !== probe.totalItems) {
    sourceShapeErrors.push(`projectThumbCount=${imageOwnership.projectThumbCount},total=${probe.totalItems}`);
  }
  if (imageOwnership.allProjectThumbsUseSourcePromise !== true) {
    sourceShapeErrors.push(`allProjectThumbsUseSourcePromise=${imageOwnership.allProjectThumbsUseSourcePromise}`);
  }
  if (![true, false].includes(imageOwnership.webpSupport)) {
    sourceShapeErrors.push(`thumbWebpSupport=${imageOwnership.webpSupport}`);
  }
  if (!["webp", "jpg"].includes(imageOwnership.assetExt)) {
    sourceShapeErrors.push(`thumbAssetExt=${imageOwnership.assetExt}`);
  }
  if (!Array.isArray(imageOwnership.urls) || imageOwnership.urls.length !== probe.totalItems) {
    sourceShapeErrors.push(`thumbUrls=${JSON.stringify(imageOwnership.urls || null)}`);
  } else if (!imageOwnership.urls.every((url) => typeof url === "string" && url.endsWith(`.${imageOwnership.assetExt}`))) {
    sourceShapeErrors.push(`thumbUrlExts=${JSON.stringify(imageOwnership.urls)}`);
  }
  if (!Array.isArray(imageOwnership.loaders) || !imageOwnership.loaders.every((loader) => loader === "loadImage" || loader === "loadVideo")) {
    sourceShapeErrors.push(`thumbLoaders=${JSON.stringify(imageOwnership.loaders || null)}`);
  }
  if (probe.thumbWrapParentIsScene !== true) {
    sourceShapeErrors.push(`thumbWrapParentIsScene=${probe.thumbWrapParentIsScene}`);
  }
  if (probe.thumbScrollWrapParentIsThumbWrap !== true) {
    sourceShapeErrors.push(`thumbScrollWrapParentIsThumbWrap=${probe.thumbScrollWrapParentIsThumbWrap}`);
  }
  if (probe.thumbObjectMode !== "source-w1-rt-object3d-scrollWrap") {
    sourceShapeErrors.push(`thumbObjectMode=${probe.thumbObjectMode}`);
  }
  if (probe.thumbWrapType !== "Object3D") {
    sourceShapeErrors.push(`thumbWrapType=${probe.thumbWrapType}`);
  }
  if (probe.thumbScrollWrapType !== "Object3D") {
    sourceShapeErrors.push(`thumbScrollWrapType=${probe.thumbScrollWrapType}`);
  }
  if (probe.thumbWrapFrustumCulled !== false) {
    sourceShapeErrors.push(`thumbWrapFrustumCulled=${probe.thumbWrapFrustumCulled}`);
  }
  if (probe.thumbSceneMode !== "source-T1-square-height-target-orthographic") {
    sourceShapeErrors.push(`thumbSceneMode=${probe.thumbSceneMode}`);
  }
  const thumbSceneSurface = probe.thumbSceneSurface || {};
  if (thumbSceneSurface.mode !== "source-T1-background-camera-x1-renderToScreen-settings") {
    sourceShapeErrors.push(`thumbSceneSurfaceMode=${thumbSceneSurface.mode}`);
  }
  if (thumbSceneSurface.backgroundMode !== "source-T1-222222-linear-to-srgb") {
    sourceShapeErrors.push(`thumbSceneBackgroundMode=${thumbSceneSurface.backgroundMode}`);
  }
  if (thumbSceneSurface.sourceBackgroundColor !== "#222222") {
    sourceShapeErrors.push(`thumbSceneBackgroundColor=${thumbSceneSurface.sourceBackgroundColor}`);
  }
  if (JSON.stringify(thumbSceneSurface.background) !== JSON.stringify(thumbSceneSurface.expectedBackground)) {
    sourceShapeErrors.push(`thumbSceneBackground=${JSON.stringify(thumbSceneSurface.background)},expected=${JSON.stringify(thumbSceneSurface.expectedBackground)}`);
  }
  if (thumbSceneSurface.backgroundMatchesSource !== true) {
    sourceShapeErrors.push(`thumbSceneBackgroundMatchesSource=${thumbSceneSurface.backgroundMatchesSource}`);
  }
  if (thumbSceneSurface.cameraMode !== "source-T1-orthographic-minus1-plus1-near0-far1") {
    sourceShapeErrors.push(`thumbSceneCameraMode=${thumbSceneSurface.cameraMode}`);
  }
  if (JSON.stringify(thumbSceneSurface.cameraBounds) !== JSON.stringify([-1, 1, 1, -1, 0, 1])) {
    sourceShapeErrors.push(`thumbSceneCameraBounds=${JSON.stringify(thumbSceneSurface.cameraBounds)}`);
  }
  if (JSON.stringify(thumbSceneSurface.expectedCameraBounds) !== JSON.stringify([-1, 1, 1, -1, 0, 1])) {
    sourceShapeErrors.push(`thumbSceneExpectedCameraBounds=${JSON.stringify(thumbSceneSurface.expectedCameraBounds)}`);
  }
  if (thumbSceneSurface.cameraMatchesSource !== true) {
    sourceShapeErrors.push(`thumbSceneCameraMatchesSource=${thumbSceneSurface.cameraMatchesSource}`);
  }
  const thumbRenderManagerSettings = thumbSceneSurface.renderManagerSettings || {};
  if (thumbRenderManagerSettings.mode !== "source-x1-initSettings-renderToScreen-false") {
    sourceShapeErrors.push(`thumbRenderManagerSettingsMode=${thumbRenderManagerSettings.mode}`);
  }
  if (JSON.stringify(thumbRenderManagerSettings.expected) !== JSON.stringify({ renderToScreen: false })) {
    sourceShapeErrors.push(`thumbRenderManagerSettingsExpected=${JSON.stringify(thumbRenderManagerSettings.expected)}`);
  }
  if (JSON.stringify(thumbRenderManagerSettings.actual) !== JSON.stringify({ renderToScreen: false })) {
    sourceShapeErrors.push(`thumbRenderManagerSettingsActual=${JSON.stringify(thumbRenderManagerSettings.actual)}`);
  }
  if (thumbRenderManagerSettings.matchesSource !== true) {
    sourceShapeErrors.push(`thumbRenderManagerSettingsMatchesSource=${thumbRenderManagerSettings.matchesSource}`);
  }
  if (probe.itemWidth !== 2) {
    sourceShapeErrors.push(`itemWidth=${probe.itemWidth}`);
  }
  if (probe.totalWidth !== probe.totalItems * probe.itemWidth) {
    sourceShapeErrors.push(`totalWidth=${probe.totalWidth}`);
  }
  const expectedProjectOrder = ["hashgraph-vc", "gc-2026", "following-wildfire", "engaged", "spritexmarvel", "filmsecession", "theroger", "poppr", "demorgen", "thoughtlab"];
  const projectOrder = probe.sourceProjectOrder || {};
  if (projectOrder.mode !== "source-is-getProjects-active-filter-date-desc") {
    sourceShapeErrors.push(`projectOrderMode=${projectOrder.mode}`);
  }
  if (JSON.stringify(projectOrder.expected) !== JSON.stringify(expectedProjectOrder)) {
    sourceShapeErrors.push(`projectOrderExpected=${JSON.stringify(projectOrder.expected)}`);
  }
  if (JSON.stringify(projectOrder.actual) !== JSON.stringify(expectedProjectOrder)) {
    sourceShapeErrors.push(`projectOrderActual=${JSON.stringify(projectOrder.actual)}`);
  }
  if (projectOrder.matchesSource !== true) {
    sourceShapeErrors.push(`projectOrderMatchesSource=${projectOrder.matchesSource}`);
  }
  const expectedThumbProgress = -sourceProbeProgress * probe.totalWidth;
  if (!closeTo(probe.thumbProgress, expectedThumbProgress)) {
    sourceShapeErrors.push(`thumbProgress=${probe.thumbProgress},expected=${expectedThumbProgress}`);
  }
  if (probe.offsetY !== 0) {
    sourceShapeErrors.push(`offsetY=${probe.offsetY}`);
  }
  if (probe.isTransitioning !== false) {
    sourceShapeErrors.push(`isTransitioning=${probe.isTransitioning}`);
  }
  const expectedVisibleCount = (probe.thumbs || []).reduce((count, thumb, index) => {
    const hook = probe.itemWidth * index;
    const x = expectedThumbX(hook, expectedThumbProgress, probe.totalWidth);
    return count + (x >= -1.5 && x <= 1.5 ? 1 : 0);
  }, 0);
  if (probe.visibleThumbs !== expectedVisibleCount) {
    sourceShapeErrors.push(`visibleThumbs=${probe.visibleThumbs},expected=${expectedVisibleCount}`);
  }
  for (const [index, thumb] of (probe.thumbs || []).entries()) {
    const x = thumb.position?.[0];
    const y = thumb.position?.[1];
    const z = thumb.position?.[2];
    const expectedHook = probe.itemWidth * index;
    const expectedX = expectedThumbX(expectedHook, expectedThumbProgress, probe.totalWidth);
    if (!closeTo(thumb.xHook, expectedHook)) {
      sourceShapeErrors.push(`${thumb.slug}:xHook=${thumb.xHook},expected=${expectedHook}`);
    }
    if (!closeTo(x, expectedX)) {
      sourceShapeErrors.push(`${thumb.slug}:x=${x},expected=${expectedX}`);
    }
    if (Math.abs(x) > probe.totalWidth / 2 + 1e-6) {
      sourceShapeErrors.push(`${thumb.slug}:xWrap=${x}`);
    }
    if (thumb.visible !== (expectedX >= -1.5 && expectedX <= 1.5)) {
      sourceShapeErrors.push(`${thumb.slug}:visible=${thumb.visible},expectedX=${expectedX}`);
    }
    if (thumb.sourceInitialVisibleMode !== "source-E1-no-initial-hidden-state-w1-updateGalleryProgress-owns-visible") {
      sourceShapeErrors.push(`${thumb.slug}:initialVisibleMode=${thumb.sourceInitialVisibleMode}`);
    }
    if (thumb.sourceImageMode !== "source-E1-setImage-awaits-Xt-thumbsReady-getProjectThumbById") {
      sourceShapeErrors.push(`${thumb.slug}:imageMode=${thumb.sourceImageMode}`);
    }
    if (thumb.sourceImageId !== thumb.slug) {
      sourceShapeErrors.push(`${thumb.slug}:imageId=${thumb.sourceImageId}`);
    }
    if (thumb.sourceImageBound !== true || thumb.sourceMaterialBound !== true) {
      sourceShapeErrors.push(`${thumb.slug}:imageBound=${thumb.sourceImageBound}/${thumb.sourceMaterialBound}`);
    }
    if (thumb.sourceMaterialImageMode !== "source-E1-setImage-awaits-Xt-thumbsReady-getProjectThumbById") {
      sourceShapeErrors.push(`${thumb.slug}:materialImageMode=${thumb.sourceMaterialImageMode}`);
    }
    if (thumb.sourceMaterialReady !== true) {
      sourceShapeErrors.push(`${thumb.slug}:materialReady=${thumb.sourceMaterialReady}`);
    }
    if (thumb.sourceMaterialBindingMode !== "source-Xt-projectThumbs-src-promise") {
      sourceShapeErrors.push(`${thumb.slug}:bindingMode=${thumb.sourceMaterialBindingMode}`);
    }
    if (thumb.constructorOrder !== "source-E1-material-setImage-before-mesh-construction") {
      sourceShapeErrors.push(`${thumb.slug}:constructorOrder=${thumb.constructorOrder}`);
    }
    if (typeof thumb.sourceMaterialUrl !== "string" || !thumb.sourceMaterialUrl.endsWith(`.${imageOwnership.assetExt}`)) {
      sourceShapeErrors.push(`${thumb.slug}:materialUrl=${thumb.sourceMaterialUrl}`);
    }
    if (!["loadImage", "loadVideo"].includes(thumb.sourceMaterialLoader)) {
      sourceShapeErrors.push(`${thumb.slug}:materialLoader=${thumb.sourceMaterialLoader}`);
    }
    if (Math.abs(y) > 1e-6 || Math.abs(z) > 1e-6) {
      sourceShapeErrors.push(`${thumb.slug}:position=${JSON.stringify(thumb.position)}`);
    }
    if (JSON.stringify(thumb.scale) !== JSON.stringify([2, 2, 2])) {
      sourceShapeErrors.push(`${thumb.slug}:scale=${JSON.stringify(thumb.scale)}`);
    }
  }
  const material = probe.thumbMaterial;
  if (!material) {
    sourceShapeErrors.push("thumbMaterial=missing");
  } else {
    if (material.mode !== "source-M1-raw-glsl3") sourceShapeErrors.push(`thumbMaterialMode=${material.mode}`);
    if (material.glslVersion !== "300 es") sourceShapeErrors.push(`thumbGlsl=${material.glslVersion}`);
    if (material.toneMapped !== false) sourceShapeErrors.push(`thumbToneMapped=${material.toneMapped}`);
    if (material.transparent !== false) sourceShapeErrors.push(`thumbTransparent=${material.transparent}`);
    if (material.blending !== 1) sourceShapeErrors.push(`thumbBlending=${material.blending}`);
    if (material.depthWrite !== false) sourceShapeErrors.push(`thumbDepthWrite=${material.depthWrite}`);
    if (material.depthTest !== false) sourceShapeErrors.push(`thumbDepthTest=${material.depthTest}`);
    if (material.constructorMode !== "source-M1-constructor-null-tMap-zero-size-vectors") {
      sourceShapeErrors.push(`thumbConstructorMode=${material.constructorMode}`);
    }
    if (material.constructorTMapWasNull !== true) {
      sourceShapeErrors.push(`thumbConstructorTMapWasNull=${material.constructorTMapWasNull}`);
    }
    if (JSON.stringify(material.constructorMapSize) !== JSON.stringify([0, 0])) {
      sourceShapeErrors.push(`thumbConstructorMapSize=${JSON.stringify(material.constructorMapSize)}`);
    }
    if (JSON.stringify(material.constructorResolution) !== JSON.stringify([0, 0])) {
      sourceShapeErrors.push(`thumbConstructorResolution=${JSON.stringify(material.constructorResolution)}`);
    }
    const expectedUniformOrder = ["tMap", "uResolution", "uMapSize", "uProgress", "uTransitionCount", "uTransitionSmoothness"];
    if (JSON.stringify(material.uniformOrder) !== JSON.stringify(expectedUniformOrder)) {
      sourceShapeErrors.push(`thumbUniformOrder=${JSON.stringify(material.uniformOrder)}`);
    }
    if (material.setImageBindingMode !== "source-E1-setImage-binds-texture-and-1x1-size-after-Xt-thumbsReady") {
      sourceShapeErrors.push(`thumbSetImageBindingMode=${material.setImageBindingMode}`);
    }
    if (material.constructorOrder !== "source-E1-material-setImage-before-mesh-construction") {
      sourceShapeErrors.push(`thumbConstructorOrder=${material.constructorOrder}`);
    }
    if (material.uProgress !== 1) sourceShapeErrors.push(`thumbProgressUniform=${material.uProgress}`);
    if (material.uTransitionCount !== 150) sourceShapeErrors.push(`thumbTransitionCount=${material.uTransitionCount}`);
    if (material.uTransitionSmoothness !== 0.2) sourceShapeErrors.push(`thumbTransitionSmoothness=${material.uTransitionSmoothness}`);
    if (!material.mapBound) sourceShapeErrors.push("thumbMapBound=false");
    const mapTexture = material.mapTexture || {};
    if (mapTexture.minFilter !== 1008) sourceShapeErrors.push(`thumbMapMinFilter=${mapTexture.minFilter}`);
    if (mapTexture.magFilter !== 1006) sourceShapeErrors.push(`thumbMapMagFilter=${mapTexture.magFilter}`);
    if (mapTexture.generateMipmaps !== true) sourceShapeErrors.push(`thumbMapMipmaps=${mapTexture.generateMipmaps}`);
    if (mapTexture.anisotropy !== 1) sourceShapeErrors.push(`thumbMapAnisotropy=${mapTexture.anisotropy}`);
    if (JSON.stringify(material.mapSize) !== JSON.stringify([1, 1])) sourceShapeErrors.push(`thumbMapSize=${JSON.stringify(material.mapSize)}`);
    if (JSON.stringify(material.resolution) !== JSON.stringify([1, 1])) sourceShapeErrors.push(`thumbResolution=${JSON.stringify(material.resolution)}`);
  }
  if (probe.targets?.sizingMode !== "source-T1-renderManager-resize-height-height-dpr-1") {
    sourceShapeErrors.push(`thumbTargetSizing=${probe.targets?.sizingMode}`);
  }
  if (probe.targets?.resizeClampMode !== "source-T1-x1-Lo-round-no-rebuild-pre-clamp") {
    sourceShapeErrors.push(`thumbTargetResizeClamp=${probe.targets?.resizeClampMode}`);
  }
  if (probe.targets?.sourceTargetMode !== "source-Lo-renderTargetA-depthless-renderTargetComposite-clone") {
    sourceShapeErrors.push(`thumbTargetMode=${probe.targets?.sourceTargetMode}`);
  }
  if (probe.targets?.rawConstructionMode !== "source-Lo-renderTargetA-new-depthless-stencilless") {
    sourceShapeErrors.push(`thumbRawConstruction=${probe.targets?.rawConstructionMode}`);
  }
  if (probe.targets?.compositeConstructionMode !== "source-Lo-renderTargetComposite-renderTargetA-clone") {
    sourceShapeErrors.push(`thumbCompositeConstruction=${probe.targets?.compositeConstructionMode}`);
  }
  if (probe.targets?.thumb?.width !== expectedTargetSize || probe.targets?.thumb?.height !== expectedTargetSize) {
    sourceShapeErrors.push(`thumbTarget=${probe.targets?.thumb?.width}x${probe.targets?.thumb?.height}`);
  }
  if (probe.targets?.composite?.width !== expectedTargetSize || probe.targets?.composite?.height !== expectedTargetSize) {
    sourceShapeErrors.push(`thumbCompositeTarget=${probe.targets?.composite?.width}x${probe.targets?.composite?.height}`);
  }
  if (!Number.isFinite(probe.targets?.thumb?.luma) || probe.targets.thumb.luma <= 0) {
    sourceShapeErrors.push(`thumbTargetLuma=${probe.targets?.thumb?.luma}`);
  }
  if (!Number.isFinite(probe.targets?.composite?.luma) || probe.targets.composite.luma <= 0) {
    sourceShapeErrors.push(`thumbCompositeLuma=${probe.targets?.composite?.luma}`);
  }
  const composite = probe.thumbComposite || {};
  if (composite.mode !== "source-x1-_1-raw-glsl3") sourceShapeErrors.push(`thumbCompositeMode=${composite.mode}`);
  if (composite.glslVersion !== "300 es") sourceShapeErrors.push(`thumbCompositeGlsl=${composite.glslVersion}`);
  if (composite.renderManagerOwnership !== "source-x1-Lo-single-screen-material-swap") sourceShapeErrors.push(`thumbCompositeOwnership=${composite.renderManagerOwnership}`);
  if (composite.screenMode !== "source-Lo-screen-material-composite") sourceShapeErrors.push(`thumbCompositeScreen=${composite.screenMode}`);
  if (composite.toneMapped !== false) sourceShapeErrors.push(`thumbCompositeToneMapped=${composite.toneMapped}`);
  if (composite.transparent !== true) sourceShapeErrors.push(`thumbCompositeTransparent=${composite.transparent}`);
  if (composite.blending !== 0) sourceShapeErrors.push(`thumbCompositeBlending=${composite.blending}`);
  if (composite.depthWrite !== false) sourceShapeErrors.push(`thumbCompositeDepthWrite=${composite.depthWrite}`);
  if (composite.depthTest !== false) sourceShapeErrors.push(`thumbCompositeDepthTest=${composite.depthTest}`);
  if (composite.tSceneIsThumbTarget !== true) sourceShapeErrors.push(`thumbCompositeSceneTarget=${composite.tSceneIsThumbTarget}`);
  if (composite.stateOwnership !== "source-Se-settings-thumb-state-onUpdate-uniforms") {
    sourceShapeErrors.push(`thumbStateOwnership=${composite.stateOwnership}`);
  }
  if (composite.killMode !== "source-no-kill-for-thumb-state-setters") {
    sourceShapeErrors.push(`thumbStateKillMode=${composite.killMode}`);
  }
  if (composite.stateUniformsMatch !== true) sourceShapeErrors.push(`thumbStateUniformsMatch=${composite.stateUniformsMatch}`);
  if (composite.mouseLightnessUniformsMatchState !== true) {
    sourceShapeErrors.push(`thumbMouseLightnessUniformsMatch=${composite.mouseLightnessUniformsMatchState}`);
  }
  if (Math.abs((composite.state?.darknessIntensity ?? -1) - composite.darkenIntensity) > 1e-6) {
    sourceShapeErrors.push(`thumbStateDarkness=${composite.state?.darknessIntensity},uniform=${composite.darkenIntensity}`);
  }
  if (Math.abs((composite.state?.saturation ?? -1) - composite.saturation) > 1e-6) {
    sourceShapeErrors.push(`thumbStateSaturation=${composite.state?.saturation},uniform=${composite.saturation}`);
  }
  const transfer = probe.thumbRenderTransfer || {};
  if (transfer.mode !== "source-Lo-update-renderTargetA-to-renderTargetComposite") {
    sourceShapeErrors.push(`thumbTransferMode=${transfer.mode}`);
  }
  if (transfer.renderToScreen !== false || transfer.renderToScreenMatchesSource !== true) {
    sourceShapeErrors.push(`thumbTransferRenderToScreen=${transfer.renderToScreen}`);
  }
  if (JSON.stringify(transfer.expectedSteps || null) !== JSON.stringify(expectedThumbTransferSteps)) {
    sourceShapeErrors.push(`thumbTransferExpectedSteps=${JSON.stringify(transfer.expectedSteps || null)}`);
  }
  if (JSON.stringify(transfer.steps || null) !== JSON.stringify(expectedThumbTransferSteps)) {
    sourceShapeErrors.push(`thumbTransferSteps=${JSON.stringify(transfer.steps || null)}`);
  }
  if (transfer.stepsMatchExpected !== true) sourceShapeErrors.push(`thumbTransferStepsMatch=${transfer.stepsMatchExpected}`);
  if (transfer.rawTargetRole !== "thumbRaw") sourceShapeErrors.push(`thumbTransferRawRole=${transfer.rawTargetRole}`);
  if (transfer.compositeTargetRole !== "thumbComposite") {
    sourceShapeErrors.push(`thumbTransferCompositeRole=${transfer.compositeTargetRole}`);
  }
  if (transfer.tSceneRole !== "renderTargetA.texture" || transfer.tSceneIsRawTarget !== true) {
    sourceShapeErrors.push(`thumbTransferTScene=${transfer.tSceneRole}/${transfer.tSceneIsRawTarget}`);
  }
  if (transfer.screenMaterialRole !== "compositeMaterial" || transfer.screenMaterialIsComposite !== true) {
    sourceShapeErrors.push(`thumbTransferScreenMaterial=${transfer.screenMaterialRole}/${transfer.screenMaterialIsComposite}`);
  }
  if (transfer.compositeTargetReceivesScreenRender !== true) {
    sourceShapeErrors.push(`thumbTransferCompositeRender=${transfer.compositeTargetReceivesScreenRender}`);
  }
  if (transfer.finalRenderTargetRole !== "canvas" || transfer.finalTargetResetToCanvas !== true) {
    sourceShapeErrors.push(`thumbTransferFinalTarget=${transfer.finalRenderTargetRole}/${transfer.finalTargetResetToCanvas}`);
  }
  if (transfer.spotlightMapRole !== "renderTargetComposite.texture" || transfer.spotlightMapReceivesCompositeTexture !== true) {
    sourceShapeErrors.push(`thumbTransferSpotlightMap=${transfer.spotlightMapRole}/${transfer.spotlightMapReceivesCompositeTexture}`);
  }
  for (const [label, target] of Object.entries({
    thumb: probe.targets?.thumbState,
    thumbComposite: probe.targets?.compositeState,
  })) {
    if (!target) {
      sourceShapeErrors.push(`${label}TargetState=missing`);
      continue;
    }
    if (target.depthBuffer !== false) sourceShapeErrors.push(`${label}Depth=${target.depthBuffer}`);
    if (target.stencilBuffer !== false) sourceShapeErrors.push(`${label}Stencil=${target.stencilBuffer}`);
    if (target.texture?.colorSpace !== "") sourceShapeErrors.push(`${label}ColorSpace=${target.texture?.colorSpace}`);
    if (target.texture?.type !== 1009) sourceShapeErrors.push(`${label}Type=${target.texture?.type}`);
    if (target.texture?.format !== 1023) sourceShapeErrors.push(`${label}Format=${target.texture?.format}`);
    if (target.texture?.minFilter !== 1006) sourceShapeErrors.push(`${label}MinFilter=${target.texture?.minFilter}`);
    if (target.texture?.magFilter !== 1006) sourceShapeErrors.push(`${label}MagFilter=${target.texture?.magFilter}`);
    if (target.texture?.generateMipmaps !== false) sourceShapeErrors.push(`${label}Mipmaps=${target.texture?.generateMipmaps}`);
  }
  if (sourceShapeErrors.length) {
    throw new Error(`Thumb gallery source-shape mismatch: ${sourceShapeErrors.join(", ")}`);
  }
  const screenshotFile = path.join(outDir, "rebuild-home-thumb-probe.png");
  writeFileSync(screenshotFile, Buffer.from(screenshot.data, "base64"));
  ws.close();
  return {
    viewportName,
    viewport,
    screenshot: screenshotFile,
    ...parsed,
    failures: failures.filter((failure) => !failure.canceled).map((failure) => ({ type: failure.type, errorText: failure.errorText })),
    exceptions,
    consoleMessages: consoleMessages.filter((message) => /Shader Error|WebGLProgram|exception/i.test(message)),
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
  `--user-data-dir=${path.join(tmpdir(), `rogier-thumb-probe-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const summary = await runProbe();
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  chrome.kill("SIGTERM");
}

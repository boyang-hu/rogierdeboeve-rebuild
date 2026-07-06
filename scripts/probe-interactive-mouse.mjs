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

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-interactive-mouse-probe");
const port = Number(process.env.CDP_PORT || 9241);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const waitAfter = Number(process.env.PROBE_WAIT || 9000);
const waitAfterMoves = Number(process.env.PROBE_MOVE_WAIT || 900);
const viewportName = process.env.VIEWPORT || "desktop";
const viewports = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
const viewport = viewports[viewportName] || viewports.desktop;

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

function withProbeParams(url) {
  const parsed = new URL(url);
  parsed.searchParams.set("skip-preloader", "");
  parsed.searchParams.set("debug-output-probe", "1");
  return parsed.toString();
}

async function snapshot(ws, label) {
  const result = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      label: ${JSON.stringify(label)},
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

function distance2(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return Infinity;
  return Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0));
}

function vectorLength(vector) {
  if (!Array.isArray(vector)) return 0;
  return Math.hypot(...vector.map((value) => Number(value) || 0));
}

async function moveMouse(ws, x, y) {
  await send(ws, "Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x,
    y,
    button: "none",
    pointerType: "mouse",
  });
}

function assertInteractiveResponse(before, after, finalPoint) {
  const errors = [];
  const beforeProbe = before.probe || {};
  const afterProbe = after.probe || {};
  const mouse = afterProbe.mouseSimulation || {};
  const beforeMouse = beforeProbe.mouseSimulation || {};
  const screen = mouse.screen || {};
  const beforeScreen = beforeMouse.screen || {};
  const active = mouse.active || {};
  const beforeActive = beforeMouse.active || {};
  const mainFluid = afterProbe.mainFluid || {};
  const beforeMainFluid = beforeProbe.mainFluid || {};
  const expectedScreenTarget = [finalPoint.x / viewport.width, 1 - finalPoint.y / viewport.height];
  const expectedPointerRay = [(finalPoint.x / viewport.width - 0.5) * 2, -(finalPoint.y / viewport.height - 0.5) * 2];
  const expectedFluidPointer = expectedPointerRay;
  const metrics = {
    screenTargetBefore: beforeScreen.target,
    screenTargetAfter: screen.target,
    activePointerRayBefore: beforeActive.pointerRay,
    activePointerRayAfter: active.pointerRay,
    activeMouseTargetBefore: beforeActive.mouseTarget,
    activeMouseTargetAfter: active.mouseTarget,
    mainFluidPointerBefore: beforeMainFluid.pointer,
    mainFluidPointerAfter: mainFluid.pointer,
    mainFluidPointerOldAfter: mainFluid.pointerOld,
    mainFluidCenterAfter: mainFluid.interaction?.center,
    screenSpeed: screen.speed,
    activeUniformSpeed: active.uniformSpeed,
    mainFluidForce: mainFluid.interaction?.force,
  };

  if (!afterProbe || !mouse.enabled) errors.push("missing-mouse-simulation-probe");
  if (!screen.target) errors.push("missing-screen-mouse-probe");
  if (screen.uniformSurfaceMode !== "source-Ka-simulationMaterial-uniform-surface") errors.push("screen-uniform-surface");
  if (screen.targetState?.depthBuffer !== false || screen.targetState?.stencilBuffer !== false) errors.push("screen-target-state");
  if (screen.targetSizingMode !== "source-Lu-mousesim-render-size-div-10-no-post-rounding-no-clamp") errors.push("screen-target-sizing-mode");
  if (screen.targetSizeMatchesSource !== true) errors.push("screen-target-size");
  if (screen.uCoordsMatchesSource !== true) errors.push("screen-ucoords");
  if (distance2(screen.target, expectedScreenTarget) > 0.015) errors.push(`screen-target=${JSON.stringify(screen.target)}`);
  if (distance2(screen.old, beforeScreen.old) < 0.001 && distance2(screen.new, beforeScreen.new) < 0.001) errors.push("screen-old-new-did-not-move");
  if ((screen.speed ?? 0) <= 0.0001) errors.push(`screen-speed=${screen.speed}`);

  if (!active) errors.push("missing-active-mouse-probe");
  if (active.raycastMode !== "source-Ka-onMouseMove-per-item-raycast-immediate-pointer") errors.push("active-raycast-mode");
  if (active.raycastEventMode !== "source-Ka-raycast-during-mousemove-not-raf-tail") errors.push("active-raycast-event-mode");
  if (active.raycastNormalizationMode !== "source-Pe-width-height") errors.push("active-raycast-normalization-mode");
  if (active.raycastUvWriteMode !== "source-Ka-raycast-hit-uv-direct-targetPos-no-clamp") errors.push("active-raycast-uv-write-mode");
  if (active.allVisibleHaveIndependentTargets !== true) errors.push("active-independent-targets");
  if (distance2(active.pointerRay, expectedPointerRay) > 0.02) errors.push(`pointer-ray=${JSON.stringify(active.pointerRay)}`);
  if (distance2(active.mouseTarget, beforeActive.mouseTarget) < 0.001) errors.push("active-mouse-target-did-not-move");
  if ((active.uniformSpeed ?? 0) <= 0.0001) errors.push(`active-uniform-speed=${active.uniformSpeed}`);
  const sourceShapeErrors = Object.entries(active.sourceShape || {})
    .filter(([, value]) => typeof value === "boolean" && value !== true)
    .map(([key]) => key);
  if (active.sourceShape?.updateLerpMode !== "source-Ka-newPos-lerp-targetPos-delta-times-7_5-no-clamp") sourceShapeErrors.push("updateLerpMode");
  if (active.sourceShape?.raycastMode !== "source-Ka-onMouseMove-per-item-raycast-immediate-pointer") sourceShapeErrors.push("raycastMode");
  if (active.sourceShape?.raycastEventMode !== "source-Ka-raycast-during-mousemove-not-raf-tail") sourceShapeErrors.push("raycastEventMode");
  if (active.sourceShape?.raycastNormalizationMode !== "source-Pe-width-height") sourceShapeErrors.push("raycastNormalizationMode");
  if (active.sourceShape?.raycastUvWriteMode !== "source-Ka-raycast-hit-uv-direct-targetPos-no-clamp") sourceShapeErrors.push("raycastUvWriteMode");
  if (active.sourceShape?.targetSizingMode !== "source-GA-mouseSim-onResize-plane-scale-no-pre-rounding-no-clamp") sourceShapeErrors.push("targetSizingMode");
  if (active.targetSizingMode !== "source-GA-mouseSim-onResize-plane-scale-no-clamp") sourceShapeErrors.push("activeTargetSizingMode");
  if (sourceShapeErrors.length) errors.push(`active-source-shape=${sourceShapeErrors.join("|")}`);

  if (mainFluid.enabled) {
    if (mainFluid.interaction?.source !== "source-ag-qT-window-mousemove-force-pass") errors.push("main-fluid-interaction-source");
    if (distance2(mainFluid.pointer, expectedFluidPointer) > 0.02) errors.push(`main-fluid-pointer=${JSON.stringify(mainFluid.pointer)}`);
    if (distance2(mainFluid.pointerOld, expectedFluidPointer) > 0.02) errors.push(`main-fluid-pointer-old=${JSON.stringify(mainFluid.pointerOld)}`);
    if (distance2(mainFluid.interaction?.center, expectedFluidPointer) > 0.08) errors.push(`main-fluid-center=${JSON.stringify(mainFluid.interaction?.center)}`);
    if (distance2(mainFluid.pointerOld, beforeMainFluid.pointerOld) < 0.001) errors.push("main-fluid-pointer-old-did-not-update");
    if (vectorLength(mainFluid.interaction?.scale) <= 0) errors.push(`main-fluid-scale=${JSON.stringify(mainFluid.interaction?.scale)}`);
  }

  if (errors.length) {
    throw new Error(`Interactive mouse/source simulation mismatch: ${errors.join(", ")} ${JSON.stringify(metrics)}`);
  }
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
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await send(ws, "Page.navigate", { url: withProbeParams(rebuildUrl) });
  await wait(waitAfter);
  const before = await snapshot(ws, "before");
  if (!before.probe) throw new Error("No initial __rogierOutputProbe data found");

  const points = [
    { x: viewport.width * 0.50, y: viewport.height * 0.50 },
    { x: viewport.width * 0.56, y: viewport.height * 0.48 },
    { x: viewport.width * 0.44, y: viewport.height * 0.52 },
    { x: viewport.width * 0.58, y: viewport.height * 0.46 },
  ];
  for (const point of points) {
    await moveMouse(ws, point.x, point.y);
    await wait(160);
  }
  await wait(waitAfterMoves);
  const after = await snapshot(ws, "after");
  if (!after.probe) throw new Error("No post-move __rogierOutputProbe data found");

  assertInteractiveResponse(before, after, points[points.length - 1]);
  return { before, after, failures, exceptions, consoleMessages };
}

function consoleSummary(summary) {
  const beforeProbe = summary.before.probe || {};
  const afterProbe = summary.after.probe || {};
  const beforeMouse = beforeProbe.mouseSimulation || {};
  const afterMouse = afterProbe.mouseSimulation || {};
  return {
    url: withProbeParams(rebuildUrl),
    viewport: viewportName,
    activeBefore: summary.before.active,
    activeAfter: summary.after.active,
    screen: {
      targetBefore: beforeMouse.screen?.target,
      targetAfter: afterMouse.screen?.target,
      speedAfter: afterMouse.screen?.speed,
    },
    active: {
      pointerRayBefore: beforeMouse.active?.pointerRay,
      pointerRayAfter: afterMouse.active?.pointerRay,
      mouseTargetBefore: beforeMouse.active?.mouseTarget,
      mouseTargetAfter: afterMouse.active?.mouseTarget,
      uniformSpeedAfter: afterMouse.active?.uniformSpeed,
      sourceShape: afterMouse.active?.sourceShape,
    },
    mainFluid: {
      enabled: afterProbe.mainFluid?.enabled,
      pointerBefore: beforeProbe.mainFluid?.pointer,
      pointerAfter: afterProbe.mainFluid?.pointer,
      pointerOldAfter: afterProbe.mainFluid?.pointerOld,
      interactionAfter: afterProbe.mainFluid?.interaction,
    },
    failures: summary.failures.length,
    exceptions: summary.exceptions.length,
    consoleMessages: summary.consoleMessages.length,
    fullSummary: path.join(outDir, "summary.json"),
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
  `--user-data-dir=${path.join(tmpdir(), `rogier-interactive-mouse-probe-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const summary = await runProbe();
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(consoleSummary(summary), null, 2));
} finally {
  chrome.kill("SIGTERM");
}

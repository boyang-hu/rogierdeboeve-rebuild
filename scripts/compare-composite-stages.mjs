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

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-composite-stages");
const port = Number(process.env.CDP_PORT || 9282);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const waitAfter = Number(process.env.CAPTURE_WAIT || 5200);
const viewportName = process.env.VIEWPORT || "desktop";
const viewports = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
const viewport = viewports[viewportName];
if (!viewport) {
  throw new Error(`Unknown VIEWPORT="${viewportName}". Use desktop or mobile.`);
}
const stages = [0, 1, 2, 3, 4, 5];
const darkenModes = [
  { label: "default", mode: 0 },
  { label: "base-only", mode: 1 },
  { label: "mouse-only", mode: 2 },
  { label: "off", mode: 3 },
];
function compactProbeResult(result) {
  const probe = result.probe || {};
  const targets = probe.targets || {};
  return {
    label: result.label,
    stage: result.stage,
    darkenMode: result.darkenMode,
    active: result.active,
    workRaw: targets.workRaw?.gridStats?.luma,
    workComposite: targets.workComposite?.gridStats?.luma,
    preComposite: targets.preComposite?.gridStats?.luma,
    bloom: targets.bloom?.gridStats?.luma,
    thumbComposite: targets.thumbComposite?.gridStats?.luma,
    uDarken: probe.uniforms?.composite?.uDarken,
    estimatedDarkenOpacity: probe.uniforms?.composite?.estimatedDarkenOpacityFromMouseGrid,
    errors: (result.failures?.length || 0) + (result.exceptions?.length || 0) + (result.consoleMessages?.length || 0),
  };
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

async function captureVariant({ stage, darkenMode = 0, label = `stage-${stage}` }) {
  const failures = [];
  const exceptions = [];
  const consoleMessages = [];
  const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((res) => res.json());
  const ws = await connectWs(target.webSocketDebuggerUrl);
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
  await send(ws, "Page.navigate", {
    url: `${rebuildUrl}/?skip-preloader&debug-output-probe=1&debug-composite-stage=${stage}&debug-composite-darken=${darkenMode}`,
  });
  await wait(waitAfter);
  const result = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      body: document.body.className,
      ready: document.readyState,
      active: document.querySelector('[data-project-card].is-active')?.dataset.slug || null,
      probe: window.__rogierOutputProbe || null,
      canvases: [...document.querySelectorAll('canvas')].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return { width: canvas.width, height: canvas.height, rectWidth: rect.width, rectHeight: rect.height };
      })
    })`,
    returnByValue: true,
  });
  const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const parsed = JSON.parse(result.result.value);
  if (!parsed.probe) throw new Error(`No __rogierOutputProbe data found for ${label}`);
  const screenshotFile = path.join(outDir, `${label}.png`);
  writeFileSync(screenshotFile, Buffer.from(screenshot.data, "base64"));
  ws.close();
  return {
    stage,
    label,
    viewport: viewportName,
    darkenMode,
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
  `--user-data-dir=${path.join(tmpdir(), `rogier-composite-stages-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const results = [];
  for (const stage of stages) {
    results.push(await captureVariant({ stage }));
  }
  const darkenResults = [];
  for (const variant of darkenModes) {
    darkenResults.push(await captureVariant({ stage: 0, darkenMode: variant.mode, label: `darken-${variant.label}` }));
  }
  const compact = {
    stages: results.map(compactProbeResult),
    darkenModes: darkenResults.map(compactProbeResult),
  };
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify({ stages: results, darkenModes: darkenResults }, null, 2));
  writeFileSync(path.join(outDir, "compact-summary.json"), JSON.stringify(compact, null, 2));
  console.log(JSON.stringify({ outDir, ...compact }, null, 2));
} finally {
  chrome.kill("SIGTERM");
}

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
    width: 1440,
    height: 900,
    deviceScaleFactor,
    mobile: false,
    screenWidth: 1440,
    screenHeight: 900,
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
  const gaShape = parsed.probe.mouseSimulation?.active?.sourceShape;
  if (gaShape) {
    const shapeErrors = Object.entries(gaShape)
      .filter(([, value]) => typeof value === "boolean" && value !== true)
      .map(([key]) => key);
    if (shapeErrors.length) {
      throw new Error(`GA mouse/ray source-shape mismatch: ${shapeErrors.join(", ")}`);
    }
  }
  const reflectionTargets = parsed.probe.reflectionState?.targets;
  const reflectionErrors = [];
  if (reflectionTargets) {
    if (reflectionTargets.rawClearMode !== "source-autoClear-false-only") reflectionErrors.push("rawClearMode");
    if (reflectionTargets.cameraProjectionCopyOrder !== "source-updateMatrixWorld-before-projection-copy") reflectionErrors.push("cameraProjectionCopyOrder");
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
  if (mainClearing?.blurPass !== "source-I1-no-explicit-clear") bloomClearingErrors.push("mainBlurPassClearing");
  if (mainClearing?.fxaaPass !== "source-I1-no-explicit-clear") bloomClearingErrors.push("mainFxaaPassClearing");
  if (bloomClearingErrors.length) {
    throw new Error(`Render-manager clearing source-shape mismatch: ${bloomClearingErrors.join(", ")}`);
  }
  const sizingErrors = [];
  if (workRenderSizing?.bloomStartMode !== "source-Lu-Fa-render-size-div-4") sizingErrors.push("workBloomStartMode");
  if (mainRenderSizing?.bloomStartMode !== "source-I1-Fa-render-size-div-2") sizingErrors.push("mainBloomStartMode");
  if (mainRenderSizing?.fluidSizeMode !== "source-I1-Fa-render-size-div-2-then-div-3") sizingErrors.push("mainFluidSizeMode");
  if (sizingErrors.length) {
    throw new Error(`Render-manager sizing source-shape mismatch: ${sizingErrors.join(", ")}`);
  }
  const updateOrder = parsed.probe.settings?.updateOrder;
  if (updateOrder?.environmentUpdateOrder !== "source-p1-component-post-render") {
    throw new Error(`Environment update-order source-shape mismatch: ${updateOrder?.environmentUpdateOrder || "missing"}`);
  }
  const environmentUniforms = parsed.probe.uniforms?.environment;
  const environmentHierarchy = parsed.probe.reflectionState?.environment;
  const environmentErrors = [];
  if (environmentUniforms?.hierarchyMode !== "source-h1-group-owns-transform") environmentErrors.push("hierarchyMode");
  if (environmentUniforms && Math.abs((environmentUniforms.groupPositionY ?? 0) + 12.65) > 0.0001) environmentErrors.push("groupPositionY");
  if (environmentUniforms && Math.abs(environmentUniforms.meshPositionY ?? 0) > 0.0001) environmentErrors.push("meshPositionY");
  if (environmentUniforms && Math.abs(environmentUniforms.meshRotationY ?? 0) > 0.0001) environmentErrors.push("meshRotationY");
  if (environmentHierarchy?.group?.children !== 1) environmentErrors.push("groupChildren");
  if (environmentHierarchy?.object?.position?.[1] !== 0) environmentErrors.push("meshLocalPosition");
  if (environmentErrors.length) {
    throw new Error(`Environment hierarchy source-shape mismatch: ${environmentErrors.join(", ")}`);
  }
  const skyUniforms = parsed.probe.textures?.skyComposite?.uniforms;
  const skyUniformErrors = [];
  if (skyUniforms?.uShader1Mix3Binding !== "source-declared-only") skyUniformErrors.push("uShader1Mix3Binding");
  if (skyUniforms?.uShader3ScaleBinding !== "source-declared-only") skyUniformErrors.push("uShader3ScaleBinding");
  if (skyUniformErrors.length) {
    throw new Error(`Sky composite uniform binding source-shape mismatch: ${skyUniformErrors.join(", ")}`);
  }
  const RepeatWrapping = 1000;
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

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

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-project-media-probe");
const port = Number(process.env.CDP_PORT || 9283);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const slugs = (process.env.PROJECT_SLUGS || "gc-2026,hashgraph-vc").split(",").map((slug) => slug.trim()).filter(Boolean);
const waitAfter = Number(process.env.PROBE_WAIT || 5800);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function projectUrl(slug) {
  const parsed = new URL(`/${slug}/`, rebuildUrl);
  parsed.searchParams.set("skip-preloader", "");
  parsed.searchParams.set("debug-output-probe", "1");
  return parsed.toString();
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

async function evaluateJson(ws, expression) {
  const result = await send(ws, "Runtime.evaluate", { expression: `JSON.stringify(${expression})`, returnByValue: true });
  return JSON.parse(result.result.value);
}

function assertArray(actual, expected, label, errors) {
  if (JSON.stringify(actual || null) !== JSON.stringify(expected)) errors.push(label);
}

function assertProjectMediaMaterial(parsed, slug) {
  const errors = [];
  const projectMedia = parsed.probe?.uniforms?.projectMedia;
  const planes = projectMedia?.planes || [];
  if (projectMedia?.mode !== "source-UD-FD-ND-project-media-material-lifecycle") errors.push("mode");
  if (projectMedia?.shaderMode !== "source-UD-ID-LD-ShaderMaterial-glsl3") errors.push("shaderMode");
  if (projectMedia?.glslVersionMode !== "source-UD-glslVersion-lt-GLSL3") errors.push("glslVersionMode");
  if (projectMedia?.glslVersion !== "300 es") errors.push("glslVersion");
  if (projectMedia?.constructorDefaultsMode !== "source-UD-null-tMap-zero-size-vectors-zero-background") {
    errors.push("constructorDefaultsMode");
  }
  if (projectMedia?.uMapSizeBindingMode !== "source-ND-init-writes-data-media-width-height-load-updates-natural-size") {
    errors.push("uMapSizeBindingMode");
  }
  if (projectMedia?.uContainerSizeBindingMode !== "source-FD-resize-writes-bounds-width-height") {
    errors.push("uContainerSizeBindingMode");
  }
  if (projectMedia?.tMapBindingMode !== "source-ND-loadImage-loadVideo-binds-after-load") {
    errors.push("tMapBindingMode");
  }
  if (projectMedia?.uBackgroundColorBindingMode !== "source-FD-updateBackground-Se-setMediaBackground-resize-writes-runtime") {
    errors.push("uBackgroundColorBindingMode");
  }
  if (projectMedia?.planeCount !== parsed.mediaCount) errors.push("planeCount");
  if (!Array.isArray(planes) || planes.length !== parsed.mediaCount || planes.length === 0) errors.push("planes");
  if (projectMedia?.allConstructorDefaultsMatchSource !== true) errors.push("allConstructorDefaultsMatchSource");
  if (projectMedia?.allShaderSurfacesMatchSource !== true) errors.push("allShaderSurfacesMatchSource");
  if (projectMedia?.allRuntimeBackgroundsMatchState !== true) errors.push("allRuntimeBackgroundsMatchState");

  planes.forEach((plane, index) => {
    const label = `plane${index}`;
    if (plane.shaderMode !== "source-UD-ID-LD-ShaderMaterial-glsl3") errors.push(`${label}ShaderMode`);
    if (plane.glslVersionMode !== "source-UD-glslVersion-lt-GLSL3") errors.push(`${label}GlslVersionMode`);
    if (plane.glslVersion !== "300 es") errors.push(`${label}GlslVersion`);
    if (plane.constructorDefaultsMode !== "source-UD-null-tMap-zero-size-vectors-zero-background") {
      errors.push(`${label}ConstructorDefaultsMode`);
    }
    if (plane.toneMappedMode !== "source-UD-toneMapped-false") errors.push(`${label}ToneMappedMode`);
    if (plane.toneMapped !== false) errors.push(`${label}ToneMapped`);
    if (plane.transparent !== true) errors.push(`${label}Transparent`);
    if (plane.depthWrite !== false) errors.push(`${label}DepthWrite`);
    if (plane.depthTest !== false) errors.push(`${label}DepthTest`);
    if (plane.constructorTMapWasNull !== true) errors.push(`${label}ConstructorTMapWasNull`);
    assertArray(plane.constructorContainerSize, [0, 0], `${label}ConstructorContainerSize`, errors);
    assertArray(plane.constructorMapSize, [0, 0], `${label}ConstructorMapSize`, errors);
    assertArray(plane.constructorBackgroundColor, [0, 0, 0], `${label}ConstructorBackgroundColor`, errors);
    if (plane.constructorBackgroundWasZero !== true) errors.push(`${label}ConstructorBackgroundWasZero`);
    if (plane.constructorRevealWasZero !== true) errors.push(`${label}ConstructorRevealWasZero`);
    if (plane.uMapSizeBindingMode !== "source-ND-init-writes-data-media-width-height-load-updates-natural-size") {
      errors.push(`${label}UMapSizeBindingMode`);
    }
    if (plane.uContainerSizeBindingMode !== "source-FD-resize-writes-bounds-width-height") {
      errors.push(`${label}UContainerSizeBindingMode`);
    }
    if (plane.tMapBindingMode !== "source-ND-loadImage-loadVideo-binds-after-load") errors.push(`${label}TMapBindingMode`);
    if (plane.uBackgroundColorBindingMode !== "source-FD-updateBackground-Se-setMediaBackground-resize-writes-runtime") {
      errors.push(`${label}BackgroundBindingMode`);
    }
    if (plane.tMapBound !== true && plane.tMapIsNull !== true) errors.push(`${label}TMapBindingState`);
    if (!Array.isArray(plane.uMapSize) || plane.uMapSize.some((value) => !(value > 0))) errors.push(`${label}UMapSizeRuntime`);
    if (!Array.isArray(plane.uContainerSize) || plane.uContainerSize.some((value) => !(value > 0))) {
      errors.push(`${label}UContainerSizeRuntime`);
    }
    if (plane.uBackgroundColorMatchesState !== true) errors.push(`${label}BackgroundMatchesState`);
  });

  if (errors.length) {
    throw new Error(`Project media material mismatch for ${slug}: ${errors.join(", ")}`);
  }
}

async function probeSlug(ws, slug) {
  const failures = [];
  const exceptions = [];
  const consoleMessages = [];
  const onMessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.loadingFailed") failures.push(message.params);
    if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails?.text || "Runtime exception");
    if (message.method === "Runtime.consoleAPICalled") {
      consoleMessages.push((message.params.args || []).map((arg) => arg.value || arg.description).join(" "));
    }
  };
  ws.addEventListener("message", onMessage);
  await send(ws, "Page.navigate", { url: projectUrl(slug) });
  await wait(waitAfter);
  await send(ws, "Runtime.evaluate", { expression: "window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.38))" });
  await wait(1800);
  const parsed = await evaluateJson(ws, `{
    path: location.pathname,
    body: document.body.className,
    ready: document.readyState,
    mediaCount: document.querySelectorAll('[data-media][data-media-src]').length,
    visibleMediaCount: [...document.querySelectorAll('[data-media][data-media-src]')].filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }).length,
    mobileFallbackCount: document.querySelectorAll('[data-media] picture, [data-media] img, [data-media] video').length,
    canvas: [...document.querySelectorAll('canvas')].map((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { width: canvas.width, height: canvas.height, rectWidth: rect.width, rectHeight: rect.height };
    }),
    probe: window.__rogierOutputProbe || null
  }`);
  if (!parsed.probe) throw new Error(`No __rogierOutputProbe data found for ${slug}`);
  assertProjectMediaMaterial(parsed, slug);
  const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const screenshotFile = path.join(outDir, `${slug}-project-media-probe.png`);
  writeFileSync(screenshotFile, Buffer.from(screenshot.data, "base64"));
  const projectMedia = parsed.probe?.uniforms?.projectMedia || null;
  ws.removeEventListener("message", onMessage);
  return {
    slug,
    screenshot: screenshotFile,
    ...parsed,
    mediaReveal: parsed.probe?.uniforms?.preComposite?.uMediaReveal,
    mediaRawMean: parsed.probe?.targets?.mediaRaw?.gridStats?.mean,
    mediaMean: parsed.probe?.targets?.media?.gridStats?.mean,
    projectMediaShaderMode: projectMedia?.shaderMode,
    projectMediaGlslVersion: projectMedia?.glslVersion,
    projectMediaConstructorMode: projectMedia?.constructorDefaultsMode,
    projectMediaPlaneCount: projectMedia?.planeCount,
    projectMediaAllShaderSurfacesMatchSource: projectMedia?.allShaderSurfacesMatchSource,
    projectMediaAllConstructorDefaultsMatchSource: projectMedia?.allConstructorDefaultsMatchSource,
    projectMediaAllRuntimeBackgroundsMatchState: projectMedia?.allRuntimeBackgroundsMatchState,
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
  `--user-data-dir=${path.join(tmpdir(), `rogier-project-media-probe-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const newTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((res) => res.json());
  const ws = await connectWs(newTarget.webSocketDebuggerUrl);
  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");
  await send(ws, "Network.enable");
  await send(ws, "Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1440,
    screenHeight: 900,
  });
  const summaries = [];
  for (const slug of slugs) summaries.push(await probeSlug(ws, slug));
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summaries, null, 2));
  console.log(JSON.stringify(summaries, null, 2));
  ws.close();
} finally {
  chrome.kill("SIGTERM");
}

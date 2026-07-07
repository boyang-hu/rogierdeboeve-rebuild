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

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-about-scroll-opacity-probe");
const port = Number(process.env.CDP_PORT || 9298);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173/about/";
const waitAfter = Number(process.env.PROBE_WAIT || 30000);
const stableTimeout = Number(process.env.PROBE_STABLE_TIMEOUT || 10000);
const skipScreenshot = process.env.SKIP_SCREENSHOT === "1";
const viewportName = process.env.VIEWPORT || "desktop";
const viewports = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
const viewport = viewports[viewportName] || viewports.desktop;
const sourceBreakpointLg = 1000;
const sourceAboutScrollOpacityMode = "source-TD-onScroll-uScrollOpacity-Cs-scroll-0-PeH025-1-0-Fn4";
const aboutScrollOpacityProbeScroll = 137.1373;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function closeTo(actual, expected, epsilon = 0.00001) {
  return Math.abs((actual ?? NaN) - expected) <= epsilon;
}

function sourceRound(value, precision = 4) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function sourceMapClampRound(value, inMin, inMax, outMin, outMax) {
  const mapped = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return sourceRound(Math.min(Math.max(Math.min(outMin, outMax), mapped), Math.max(outMin, outMax)));
}

function withProbeParams(url) {
  const parsed = new URL(url);
  if (parsed.pathname === "/" || parsed.pathname === "") parsed.pathname = "/about/";
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

async function readProbeSummary(ws) {
  const result = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      body: document.body.className,
      ready: document.readyState,
      helperType: typeof window.__rogierAboutScrollProbeSet,
      lifecycle: window.__rogierOutputProbe?.settings?.work?.auxiliaryLifecycle || null,
      aboutVisible: window.__rogierOutputProbe?.reflectionState?.auxiliary?.aboutVisible ?? null
    })`,
    returnByValue: true,
  });
  return JSON.parse(result.result.value);
}

async function waitForAboutScrollProbe(ws) {
  const start = Date.now();
  let parsed = await readProbeSummary(ws);
  while (
    (
      !parsed.lifecycle
      || parsed.lifecycle.aboutSpotlightLifecycleMode !== "source-TD-addEvents-100ms-map-resize-200ms-initial-scroll"
      || parsed.lifecycle.aboutScrollOpacityMode !== sourceAboutScrollOpacityMode
      || parsed.aboutVisible !== true
      || parsed.lifecycle.aboutMapBoundAfterDelay !== true
      || parsed.lifecycle.aboutInitialScrollAfterDelay !== true
      || !Number.isFinite(parsed.lifecycle.aboutScrollOpacityScroll)
      || parsed.lifecycle.aboutScrollOpacityScroll <= 0
    )
    && Date.now() - start < stableTimeout
  ) {
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
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await send(ws, "Page.navigate", { url: withProbeParams(rebuildUrl) });
  await wait(waitAfter);
  await send(ws, "Runtime.evaluate", {
    expression: `
      window.clearInterval(window.__rdAboutScrollOpacityProbeInterval);
      window.__rdAboutScrollOpacityProbeInterval = window.setInterval(() => {
        window.scrollTo(0, ${aboutScrollOpacityProbeScroll});
        document.documentElement.scrollTop = ${aboutScrollOpacityProbeScroll};
        document.body.scrollTop = ${aboutScrollOpacityProbeScroll};
        window.__rogierAboutScrollProbeSet?.(${aboutScrollOpacityProbeScroll}, 0);
        window.dispatchEvent(new CustomEvent("rd:page-scroll", { detail: { scroll: ${aboutScrollOpacityProbeScroll}, velocity: 0 } }));
      }, 5);
      window.scrollTo(0, ${aboutScrollOpacityProbeScroll});
      document.documentElement.scrollTop = ${aboutScrollOpacityProbeScroll};
      document.body.scrollTop = ${aboutScrollOpacityProbeScroll};
      window.__rogierAboutScrollProbeSet?.(${aboutScrollOpacityProbeScroll}, 0);
      window.dispatchEvent(new CustomEvent("rd:page-scroll", { detail: { scroll: ${aboutScrollOpacityProbeScroll}, velocity: 0 } }));
    `,
  });
  await wait(750);
  const parsed = await waitForAboutScrollProbe(ws);
  await send(ws, "Runtime.evaluate", {
    expression: "window.clearInterval(window.__rdAboutScrollOpacityProbeInterval);",
  });
  const lifecycle = parsed.lifecycle || {};
  let screenshotFile = null;
  if (!skipScreenshot) {
    const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    screenshotFile = path.join(outDir, `about-scroll-opacity-${viewportName}.png`);
    writeFileSync(screenshotFile, Buffer.from(screenshot.data, "base64"));
  }
  const destroyProbe = await send(ws, "Runtime.evaluate", {
    expression: "window.__rogierAboutLifecycleDestroyProbe?.()",
    returnByValue: true,
  });
  const destroyLifecycle = destroyProbe.result?.value || {};
  const actualScroll = lifecycle.aboutScrollOpacityScroll;
  const actualViewportHeight = lifecycle.aboutScrollOpacityViewportHeight;
  const expectedMobile = sourceMapClampRound(actualScroll, 0, actualViewportHeight * 0.25, 1, 0);
  const expected = viewport.width >= sourceBreakpointLg ? 1 : expectedMobile;
  const errors = [];
  if (!parsed.body?.includes("has-entered")) errors.push("bodyHasEntered");
  if (parsed.aboutVisible !== true) errors.push("aboutVisible");
  if (lifecycle.aboutScrollOpacityMode !== sourceAboutScrollOpacityMode) errors.push("mode");
  if (lifecycle.aboutPreviousSpotlightMapMode !== "source-p1-setLights-null-map-before-TD-delay") {
    errors.push(`previousMapMode=${lifecycle.aboutPreviousSpotlightMapMode}`);
  }
  if (lifecycle.aboutPreviousSpotlightMapWasNull !== true) {
    errors.push(`previousMapWasNull=${lifecycle.aboutPreviousSpotlightMapWasNull}`);
  }
  if (destroyLifecycle.mode !== "source-TD-destroy-keeps-current-spotLight-map-SD-init-restores-home-map") {
    errors.push(`destroyMapMode=${destroyLifecycle.mode}`);
  }
  if (destroyLifecycle.mapBeforeDestroyWasCharacter !== true) errors.push("destroyBeforeMap");
  if (destroyLifecycle.mapAfterDestroyWasCharacter !== true) errors.push("destroyAfterMap");
  if (destroyLifecycle.mapAfterDestroyMatchesBefore !== true) errors.push("destroyMapChanged");
  if (destroyLifecycle.destroyKeepsCurrentSpotlightMap !== true) errors.push("destroyKeepsMap");
  if (destroyLifecycle.parallaxAfterDestroy !== true) errors.push("destroyParallax");
  if (destroyLifecycle.aboutVisibleAfterDestroy !== false) errors.push("destroyAboutVisible");
  if (destroyLifecycle.characterRotatableEventsActiveAfterDestroy !== false) errors.push("destroyRotatableEvents");
  if (!Number.isFinite(actualScroll) || actualScroll <= 0) errors.push("scroll");
  if (lifecycle.aboutScrollOpacityDesktopOverride !== (viewport.width >= sourceBreakpointLg)) errors.push("desktopOverride");
  if (!closeTo(lifecycle.aboutScrollOpacityExpectedMobile, expectedMobile)) errors.push("expectedMobile");
  if (!closeTo(lifecycle.aboutScrollOpacityExpected, expected)) errors.push("expected");
  if (!closeTo(lifecycle.aboutScrollOpacityActual, expected)) errors.push("actual");
  if (lifecycle.aboutScrollOpacityMatchesSource !== true) errors.push("matchesSource");
  if (failures.some((failure) => !failure.canceled)) errors.push("networkFailures");
  if (exceptions.length) errors.push("exceptions");
  const unexpectedConsoleMessages = consoleMessages.filter((message) => (
    !message.startsWith("[vite] ")
    && message !== "Failed to get subsystem status for purpose Object"
  ));
  if (unexpectedConsoleMessages.length) errors.push("consoleMessages");
  if (errors.length) {
    throw new Error(`About scroll opacity source-shape mismatch: ${errors.join(", ")} ${JSON.stringify({
      lifecycle,
      destroyLifecycle,
      helperType: parsed.helperType,
      expectedMobile,
      expected,
      consoleMessages: unexpectedConsoleMessages,
    })}`);
  }
  ws.close();
  return {
    screenshot: screenshotFile,
    ...parsed,
    destroyLifecycle,
    expectedMobile,
    expected,
    failures: failures.filter((failure) => !failure.canceled).map((failure) => ({ type: failure.type, errorText: failure.errorText })),
    exceptions,
    consoleMessages: unexpectedConsoleMessages,
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
  `--user-data-dir=${path.join(tmpdir(), `rogier-about-scroll-opacity-probe-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const summary = await runProbe();
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  chrome.kill("SIGTERM");
}

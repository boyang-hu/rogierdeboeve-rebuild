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
const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-compare");
const port = Number(process.env.CDP_PORT || 9227);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const originalUrl = process.env.ORIGINAL_URL || "http://127.0.0.1:5175";
const captureWait = Number(process.env.CAPTURE_WAIT || 3000);
const captureSet = process.env.CAPTURE_SET || "full";
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

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
    }, 10000);
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

async function capture({ name, url, viewportName = "desktop", clickEnter = false, waitAfter = captureWait }) {
  const viewport = viewports[viewportName];
  const failures = [];
  const exceptions = [];
  const newTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((res) => res.json());
  const ws = await connectWs(newTarget.webSocketDebuggerUrl);
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.loadingFailed") {
      failures.push(message.params);
    }
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params.exceptionDetails?.text || "Runtime exception");
    }
  });
  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");
  await send(ws, "Network.enable");
  await send(ws, "Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewportName === "mobile",
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await send(ws, "Page.navigate", { url });
  await wait(900);
  if (clickEnter) {
    for (let i = 0; i < 60; i++) {
      const ready = await send(ws, "Runtime.evaluate", {
        expression: "!!document.querySelector('.preloader-cta.is-active, .preloader-cta-2.is-active, [data-preloader-enter].is-active')",
        returnByValue: true,
      });
      if (ready.result.value) break;
      await wait(100);
    }
    await send(ws, "Runtime.evaluate", {
      expression: "document.querySelector('[data-preloader-enter][data-sound-mode=\"off\"], .preloader-cta-2.is-active, .preloader-cta.is-active')?.click()",
      awaitPromise: false,
    });
    await wait(Math.max(waitAfter, 2400));
  } else {
    await wait(waitAfter);
  }
  const info = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      body: document.body.className,
      html: document.documentElement.className,
      preloader: !!document.querySelector('[data-preloader], .preloader'),
      canvas: [...document.querySelectorAll('canvas')].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return { width: canvas.width, height: canvas.height, rectWidth: rect.width, rectHeight: rect.height };
      }),
      active: document.querySelector('[data-project-card].is-active, .ui-work-ul [data-slug].is-active, .ui-progressbar-item.is-active')?.dataset.slug || null,
      firstWorkSlug: document.querySelector('[data-project-card], .ui-work-ul [data-slug]')?.dataset.slug || null,
      workSlugCount: document.querySelectorAll('[data-project-card], .ui-work-ul [data-slug]').length,
      text: document.body.innerText.slice(0, 300)
    })`,
    returnByValue: true,
  });
  const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const file = path.join(outDir, `${name}.png`);
  writeFileSync(file, Buffer.from(screenshot.data, "base64"));
  ws.close();
  return {
    file,
    info: JSON.parse(info.result.value),
    failures: failures
      .filter((failure) => !failure.canceled)
      .map((failure) => ({ type: failure.type, errorText: failure.errorText })),
    exceptions,
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
  `--user-data-dir=${path.join(tmpdir(), `rogier-cdp-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const results = [];
  results.push(await capture({ name: "original-home-desktop", url: `${originalUrl}/`, clickEnter: true }));
  results.push(await capture({ name: "rebuild-home-desktop", url: `${rebuildUrl}/?skip-preloader` }));
  results.push(await capture({ name: "original-home-mobile", url: `${originalUrl}/`, viewportName: "mobile", clickEnter: true }));
  results.push(await capture({ name: "rebuild-home-mobile", url: `${rebuildUrl}/?skip-preloader`, viewportName: "mobile" }));
  if (captureSet === "full") {
    results.push(await capture({ name: "original-about-desktop", url: `${originalUrl}/about/`, clickEnter: true }));
    results.push(await capture({ name: "rebuild-about-desktop", url: `${rebuildUrl}/about/?skip-preloader` }));
    results.push(await capture({ name: "original-gc-2026-desktop", url: `${originalUrl}/gc-2026/`, clickEnter: true }));
    results.push(await capture({ name: "rebuild-gc-2026-desktop", url: `${rebuildUrl}/gc-2026/?skip-preloader` }));
    results.push(await capture({ name: "original-hashgraph-vc-desktop", url: `${originalUrl}/hashgraph-vc/`, clickEnter: true }));
    results.push(await capture({ name: "rebuild-hashgraph-vc-desktop", url: `${rebuildUrl}/hashgraph-vc/?skip-preloader` }));
  }
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  chrome.kill("SIGTERM");
}

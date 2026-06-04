import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const origin = "https://rogierdeboeve.com";
const outDir = path.resolve("public");

const initialPaths = [
  "/",
  "/about/",
  "/welcome-to-berk/",
  "/demorgen/",
  "/engaged/",
  "/filmsecession/",
  "/following-wildfire/",
  "/gc-2026/",
  "/glenncatteeuw/",
  "/hashgraph-vc/",
  "/metropolis/",
  "/omega/",
  "/poppr/",
  "/spritexmarvel/",
  "/theroger/",
  "/thoughtlab/",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon.svg",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/safari-pinned-tab.svg",
  "/site.webmanifest",
  "/open-graph.jpg",
  "/sw.js",
  "/workers/image-loader.js",
  "/workers/video-loader.js",
  "/images/textures/blue-noise.png",
  "/images/textures/floor-normal.webp",
  "/images/textures/floor-normal.jpg",
  "/images/textures/perlin-1.webp",
  "/images/textures/perlin-1.jpg",
  "/images/textures/perlin-2.webp",
  "/images/textures/perlin-2.jpg",
  "/images/cubemaps/01/px.webp",
  "/images/cubemaps/01/nx.webp",
  "/images/cubemaps/01/py.webp",
  "/images/cubemaps/01/ny.webp",
  "/images/cubemaps/01/pz.webp",
  "/images/cubemaps/01/nz.webp",
  "/images/cubemaps/01/px.jpg",
  "/images/cubemaps/01/nx.jpg",
  "/images/cubemaps/01/py.jpg",
  "/images/cubemaps/01/ny.jpg",
  "/images/cubemaps/01/pz.jpg",
  "/images/cubemaps/01/nz.jpg",
  "/models/me/me.gltf",
  "/assets/bundle.ee0b1c10.css",
  "/assets/bundle.87ba3613.css",
  "/assets/bundle.250f01b7.js",
];

const queue = [];
const seen = new Set();
const downloaded = new Set();

function enqueue(raw) {
  const normalized = normalizePath(raw);
  if (!normalized || seen.has(normalized)) return;
  seen.add(normalized);
  queue.push(normalized);
}

function normalizePath(raw) {
  if (!raw || typeof raw !== "string") return null;
  let value = raw.trim();
  if (!value || value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("mailto:")) {
    return null;
  }
  value = value.replace(/^&quot;|&quot;$/g, "");
  value = value.replace(/^['"`]|['"`]$/g, "");
  value = value.replace(/^\\+/, "");
  value = value.replace(/^\.\/+/, "/");
  value = value.replace(/^\.\.\//, "/");
  if (value.startsWith("//rogierdeboeve.com/")) value = `https:${value}`;
  if (/^https?:\/\//i.test(value)) {
    let url;
    try {
      url = new URL(value);
    } catch {
      return null;
    }
    if (url.origin !== origin) return null;
    value = url.pathname + url.search;
  }
  if (!value.startsWith("/")) {
    if (/^(?:assets|_astro|audio|content|fonts|images|models|workers)\//.test(value)) value = `/${value}`;
    else return null;
  }
  if (value.includes("..")) return null;
  value = value.replace(/#.*$/, "");
  return value || "/";
}

function localPathFor(sitePath) {
  const clean = sitePath.split("?")[0];
  if (clean === "/") return path.join(outDir, "index.html");
  if (clean.endsWith("/")) return path.join(outDir, clean.slice(1), "index.html");
  return path.join(outDir, clean.slice(1));
}

function contentLooksLikeHtml(sitePath, contentType) {
  return sitePath.endsWith("/") || contentType.includes("text/html");
}

function extractResources(text) {
  const matches = new Set();
  const patterns = [
    /(?:href|src|poster|content)=["']([^"']+)["']/gi,
    /url\((?:"([^"]+)"|'([^']+)'|([^)'"]+))\)/gi,
    /import\(["']([^"']+)["']\)/gi,
    /new Worker\(["']([^"']+)["']/gi,
    /fetch\(["']([^"']+)["']/gi,
    /["'`](\/(?:assets|_astro|audio|content|fonts|images|models|workers)\/[^"'`<>\\\s)]+)["'`]/gi,
    /["'`](\/[^"'`<>\\\s)]+\.(?:js|mjs|css|json|jpg|jpeg|png|webp|gif|svg|mp4|webm|mp3|ogg|wav|wasm|glb|gltf|bin|ktx2|hdr|woff2?|ttf|otf))["'`]/gi,
    /["'`](?:\.\.\/|\.\/)?((?:assets|_astro|audio|content|fonts|images|models|workers)\/[^"'`<>\\\s)]+)["'`]/gi,
    /(https?:\/\/rogierdeboeve\.com\/[A-Za-z0-9._~%!$&'()*+,;=:@/-]+)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const value = match[1] || match[2] || match[3];
      if (value) matches.add(value);
    }
  }
  return matches;
}

function extractProjectThumbs(text) {
  const paths = new Set();
  for (const match of text.matchAll(/thumbnail:\{[^}]*src:"([^"]+)"[^}]*type:"([^"]+)"/g)) {
    paths.add(`/images/thumbs/${match[1]}.${match[2]}`);
  }
  for (const match of text.matchAll(/thumbnail:\{[^}]*src:"([^"]+)"/g)) {
    paths.add(`/images/thumbs/${match[1]}.webp`);
    paths.add(`/images/thumbs/${match[1]}.jpg`);
  }
  return paths;
}

async function postProcess() {
  const faviconPath = path.join(outDir, "favicon.svg");
  if (!existsSync(faviconPath)) {
    await writeFile(
      faviconPath,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111"/><path fill="#fff" d="M18 46V18h19c6 0 10 4 10 9 0 4-2 7-6 8 4 1 6 4 6 9v2h-8v-2c0-4-2-6-6-6h-7v8h-8Zm8-15h10c2 0 3-1 3-3s-1-3-3-3H26v6Z"/></svg>\n',
    );
  }

  const bundlePath = path.join(outDir, "assets/bundle.250f01b7.js");
  if (existsSync(bundlePath)) {
    let bundle = await readFile(bundlePath, "utf8");
    bundle = bundle.replace(
      "static registerSw(){\"serviceWorker\"in navigator&&window.addEventListener(\"load\",()=>{navigator.serviceWorker.register(\"/sw.js\").then(e=>{e.update()}).catch(e=>{console.log(\"SW registration failed: \",e)})})}",
      "static registerSw(){}",
    );
    bundle = bundle.replace(
      "await this.gpuCheck(),this.projects=await gc(\"projects\")",
      "await this.gpuCheck().catch(()=>{Le.GPU_TIER=3}),this.projects=await gc(\"projects\")",
    );
    bundle = bundle.replace(
      'benchmarksURL:r="https://unpkg.com/detect-gpu@5.0.38/dist/benchmarks"',
      'benchmarksURL:r="/vendor/detect-gpu/benchmarks"',
    );
    await writeFile(bundlePath, bundle);
  }

  const astroDir = path.join(outDir, "_astro");
  if (existsSync(astroDir)) {
    const { readdir } = await import("node:fs/promises");
    for (const file of await readdir(astroDir)) {
      if (!file.endsWith(".js")) continue;
      const text = await readFile(path.join(astroDir, file), "utf8");
      for (const thumb of extractProjectThumbs(text)) enqueue(thumb);
    }
  }
}

async function download(sitePath) {
  const url = `${origin}${sitePath}`;
  const localPath = localPathFor(sitePath);
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 local static mirror",
      "accept": "*/*",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    console.warn(`skip ${sitePath}: ${response.status} ${response.statusText}`);
    return;
  }
  const contentType = response.headers.get("content-type") || "";
  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, bytes);
  downloaded.add(sitePath);
  console.log(`${response.status} ${sitePath} -> ${path.relative(process.cwd(), localPath)}`);

  if (contentLooksLikeHtml(sitePath, contentType) || /(?:javascript|json|css|svg|text|xml)/i.test(contentType)) {
    const text = bytes.toString("utf8");
    for (const resource of extractResources(text)) enqueue(resource);
  }

  if (sitePath.endsWith(".gltf")) {
    const text = bytes.toString("utf8");
    try {
      const gltf = JSON.parse(text);
      const base = path.posix.dirname(sitePath);
      const addUri = (uri) => {
        if (!uri || uri.startsWith("data:")) return;
        enqueue(path.posix.join(base, uri));
      };
      gltf.buffers?.forEach((item) => addUri(item.uri));
      gltf.images?.forEach((item) => addUri(item.uri));
    } catch {
      // Non-JSON glTF is unusual, but the downloaded file itself is still valid.
    }
  }
}

for (const item of initialPaths) enqueue(item);

while (queue.length) {
  const item = queue.shift();
  try {
    await download(item);
  } catch (error) {
    console.warn(`error ${item}: ${error.message}`);
  }
}

await postProcess();

while (queue.length) {
  const item = queue.shift();
  try {
    await download(item);
  } catch (error) {
    console.warn(`error ${item}: ${error.message}`);
  }
}

// Preserve a small manifest for verification and future refreshes.
await writeFile(
  path.join(outDir, "mirror-manifest.json"),
  JSON.stringify({ origin, downloaded: [...downloaded].sort() }, null, 2),
);

// Keep a readable 404 page, matching the original static fallback behavior.
const indexPath = path.join(outDir, "index.html");
if (existsSync(indexPath)) {
  const index = await readFile(indexPath, "utf8");
  await writeFile(path.join(outDir, "404.html"), index);
}

import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.env.SERVE_ROOT || "dist");
const fallbackRoot = process.env.FALLBACK_ROOT ? path.resolve(process.env.FALLBACK_ROOT) : "";
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 5173);
const contentJsonFallback = process.env.ENABLE_CONTENT_JSON_FALLBACK === "1";

const types = {
  ".bin": "application/octet-stream",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".gltf": "model/gltf+json",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

let contentCache;

async function loadContentCache() {
  if (contentCache) return contentCache;
  const [projectsRaw, awardsRaw] = await Promise.all([
    readFile(path.resolve("src/data/projects.json"), "utf8"),
    readFile(path.resolve("src/data/awards.json"), "utf8"),
  ]);
  const projects = JSON.parse(projectsRaw);
  const awards = JSON.parse(awardsRaw);
  contentCache = {
    projectsById: new Map(projects.map((item) => [item.id, item])),
    projectsBySlug: new Map(projects.map((item) => [item.data?.slug || item.id, item])),
    awardsById: new Map(awards.map((item) => [item.id, item])),
  };
  return contentCache;
}

async function resolveContentJson(requestPath) {
  if (!contentJsonFallback) return null;
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const match = decoded.match(/(?:^|\/)(src\/content|opt\/build\/repo\/src\/content)\/(projects|awards)\/([^/]+)\.json$/);
  if (!match) return null;
  const [, , collection, rawId] = match;
  const cache = await loadContentCache();
  const id = rawId.replace(/%20/g, " ");
  const item = collection === "projects"
    ? cache.projectsById.get(id) || cache.projectsBySlug.get(id)
    : cache.awardsById.get(id);
  if (!item) return null;
  return {
    id: item.id,
    collection,
    data: item.data,
    _internal: {
      type: "data",
      filePath: decoded,
      rawData: "",
    },
  };
}

function safePath(urlPath, base = root) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(base, normalized);
}

async function resolveFile(requestPath) {
  let file = safePath(requestPath);
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && (await stat(file)).isDirectory()) file = path.join(file, "index.html");
  if (existsSync(file)) return file;
  const asIndex = path.join(file, "index.html");
  if (existsSync(asIndex)) return asIndex;

  if (fallbackRoot) {
    let fallbackFile = safePath(requestPath, fallbackRoot);
    if (fallbackFile.startsWith(fallbackRoot)) {
      if (existsSync(fallbackFile) && (await stat(fallbackFile)).isDirectory()) fallbackFile = path.join(fallbackFile, "index.html");
      if (existsSync(fallbackFile)) return fallbackFile;
      const fallbackIndex = path.join(fallbackFile, "index.html");
      if (existsSync(fallbackIndex)) return fallbackIndex;
    }
  }

  const fallback = path.join(root, "404.html");
  return existsSync(fallback) ? fallback : path.join(root, "index.html");
}

const server = http.createServer(async (req, res) => {
  try {
    const contentJson = await resolveContentJson(req.url || "/");
    if (contentJson) {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify(contentJson));
      return;
    }

    const file = await resolveFile(req.url || "/");
    if (!file) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === ".webm" && file.includes(`${path.sep}audio${path.sep}`)
      ? "audio/webm"
      : types[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    });
    createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(error.message);
  }
});

server.listen(port, host, () => {
  console.log(`Local rebuild running at http://localhost:${port}/`);
});

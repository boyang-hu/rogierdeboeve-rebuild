import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.env.SERVE_ROOT || "dist");
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 5173);

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

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(root, normalized);
}

async function resolveFile(requestPath) {
  let file = safePath(requestPath);
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && (await stat(file)).isDirectory()) file = path.join(file, "index.html");
  if (existsSync(file)) return file;
  const asIndex = path.join(file, "index.html");
  if (existsSync(asIndex)) return asIndex;
  const fallback = path.join(root, "404.html");
  return existsSync(fallback) ? fallback : path.join(root, "index.html");
}

const server = http.createServer(async (req, res) => {
  try {
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

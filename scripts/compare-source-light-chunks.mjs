import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ShaderChunk } from "three";

const bundlePath = process.env.SOURCE_BUNDLE || "legacy-mirror/public/assets/bundle.250f01b7.js";
const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-source-light-chunks");

function extractBacktickConst(bundle, name) {
  const start = bundle.indexOf(`${name}=\``);
  if (start < 0) throw new Error(`Unable to find ${name} backtick const in ${bundlePath}`);
  const bodyStart = start + name.length + 2;
  const end = bundle.indexOf("`", bodyStart);
  if (end < 0) throw new Error(`Unable to find end of ${name}`);
  return bundle.slice(bodyStart, end);
}

function lineNumber(text, index) {
  if (index < 0) return null;
  return text.slice(0, index).split("\n").length;
}

function findLines(text, pattern) {
  return text
    .split("\n")
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter((entry) => pattern.test(entry.text));
}

function lineWindow(text, needle, before = 8, after = 12) {
  const index = text.indexOf(needle);
  if (index < 0) return null;
  const lines = text.split("\n");
  const line = lineNumber(text, index);
  const start = Math.max(1, line - before);
  const end = Math.min(lines.length, line + after);
  return {
    needle,
    line,
    text: lines.slice(start - 1, end).map((value, offset) => `${start + offset}: ${value}`).join("\n"),
  };
}

function compareChecks(source, rebuild, checks) {
  return Object.fromEntries(checks.map((check) => [
    check,
    {
      source: {
        present: source.includes(check),
        line: lineNumber(source, source.indexOf(check)),
      },
      rebuild: {
        present: rebuild.includes(check),
        line: lineNumber(rebuild, rebuild.indexOf(check)),
      },
    },
  ]));
}

function summarizeChunk(source, rebuild, checks, windows) {
  return {
    lengths: {
      source: source.length,
      rebuild: rebuild.length,
      delta: rebuild.length - source.length,
    },
    checks: compareChecks(source, rebuild, checks),
    sourceWindows: windows.map((needle) => lineWindow(source, needle)).filter(Boolean),
    rebuildWindows: windows.map((needle) => lineWindow(rebuild, needle)).filter(Boolean),
    sourceLines: findLines(source, /spotLight|SpotLight|SPOT_LIGHT|RE_Direct|PhysicalMaterial|specular|roughness|metalness|anisotropy|dispersion/i),
    rebuildLines: findLines(rebuild, /spotLight|SpotLight|SPOT_LIGHT|RE_Direct|PhysicalMaterial|specular|roughness|metalness|anisotropy|dispersion/i),
  };
}

if (!existsSync(bundlePath)) {
  throw new Error(`Source bundle not found: ${bundlePath}`);
}

mkdirSync(outDir, { recursive: true });

const bundle = readFileSync(bundlePath, "utf8");
const sourceChunks = {
  lightsParsBegin: extractBacktickConst(bundle, "MS"),
  lightsPhysicalFragment: extractBacktickConst(bundle, "CS"),
  lightsPhysicalParsFragment: extractBacktickConst(bundle, "RS"),
  lightsFragmentBegin: extractBacktickConst(bundle, "PS"),
  lightsFragmentEnd: extractBacktickConst(bundle, "IS"),
};
const rebuildChunks = {
  lightsParsBegin: ShaderChunk.lights_pars_begin,
  lightsPhysicalFragment: ShaderChunk.lights_physical_fragment,
  lightsPhysicalParsFragment: ShaderChunk.lights_physical_pars_fragment,
  lightsFragmentBegin: ShaderChunk.lights_fragment_begin,
  lightsFragmentEnd: ShaderChunk.lights_fragment_end,
};

for (const [name, source] of Object.entries(sourceChunks)) {
  writeFileSync(path.join(outDir, `source-${name}.glsl`), source);
}
for (const [name, rebuild] of Object.entries(rebuildChunks)) {
  writeFileSync(path.join(outDir, `rebuild-${name}.glsl`), rebuild);
}

const checks = [
  "spotLight = spotLights[ i ];",
  "getSpotLightInfo( spotLight, geometryPosition, directLight );",
  "spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;",
  "inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );",
  "spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );",
  "directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;",
  "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
  "material.specularColor",
  "material.specularF90",
  "material.dispersion",
  "material.anisotropy",
  "material.iridescence",
];
const windows = [
  "spotLight = spotLights[ i ];",
  "spotColor = texture2D( spotLightMap",
  "directLight.color = inSpotLightMap",
  "RE_Direct( directLight",
  "PhysicalMaterial material;",
  "material.specularColor",
];

const summary = {
  bundlePath,
  outDir,
  chunks: Object.fromEntries(Object.keys(sourceChunks).map((name) => [
    name,
    summarizeChunk(sourceChunks[name], rebuildChunks[name] || "", checks, windows),
  ])),
};

writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  outDir,
  chunks: Object.fromEntries(Object.entries(summary.chunks).map(([name, chunk]) => [
    name,
    {
      lengths: chunk.lengths,
      keyChecks: Object.fromEntries(Object.entries(chunk.checks)
        .filter(([check]) => /spotLight|directLight\.color|RE_Direct|material\.(specular|dispersion|anisotropy)/.test(check))
        .map(([check, value]) => [check, value])),
    },
  ])),
}, null, 2));

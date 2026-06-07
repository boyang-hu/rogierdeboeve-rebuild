import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const inputDir = process.env.IN_DIR || process.env.OUT_DIR || process.argv[2];
if (!inputDir) {
  throw new Error("Usage: IN_DIR=/path/to/shader-dump node scripts/summarize-phase1-shader-gaps.mjs");
}

const summaryPath = path.join(inputDir, "shader-dump-summary.json");
if (!existsSync(summaryPath)) {
  throw new Error(`Missing shader dump summary: ${summaryPath}`);
}

const shaderSummary = JSON.parse(readFileSync(summaryPath, "utf8"));
const focusOrder = [
  "VA-work",
  "OA-work-composite",
  "A1-pre-composite",
  "x1-thumb-composite",
  "M1-thumb-plane",
  "u1-environment",
  "j1-media-composite",
  "ag-advection",
  "ag-advection-bounds",
  "ag-force",
  "ag-divergence",
  "ag-poisson",
  "ag-pressure",
];

function values(value) {
  if (!Array.isArray(value) || value.length === 0) return "-";
  return value.map((entry) => `\`${entry}\``).join(", ");
}

function checksStatus(checks) {
  if (!checks) return "-";
  const entries = Object.entries(checks);
  if (entries.length === 0) return "-";
  const missing = entries
    .filter(([, state]) => state?.source === true && state?.rebuild !== true)
    .map(([name]) => name);
  const rebuildOnly = entries
    .filter(([, state]) => state?.source !== true && state?.rebuild === true)
    .map(([name]) => name);
  if (missing.length === 0 && rebuildOnly.length === 0) return "source/rebuild anchors match";
  const parts = [];
  if (missing.length) parts.push(`missing source anchors: ${missing.map((name) => `\`${name}\``).join(", ")}`);
  if (rebuildOnly.length) parts.push(`rebuild-only anchors: ${rebuildOnly.map((name) => `\`${name}\``).join(", ")}`);
  return parts.join("; ");
}

function classify(name, entry) {
  const fragment = entry.fragment || {};
  const vertex = entry.vertex || {};
  const sourceIncludeCount = fragment.includes?.onlySource?.length || 0;
  const rebuildIncludeCount = fragment.includes?.onlyRebuild?.length || 0;
  const sourceUniformCount = fragment.uniforms?.onlySource?.length || 0;
  const rebuildUniformCount = fragment.uniforms?.onlyRebuild?.length || 0;
  const relevantChecks = entry.vaFragmentCoreChecks
    || entry.compositeCoreChecks
    || entry.environmentCoreChecks
    || entry.rgBlurCoreChecks
    || entry.standardBlurCoreChecks
    || entry.lensflareCoreChecks
    || entry.igFxaaCoreChecks;
  const checkText = checksStatus(relevantChecks);
  const hasCheckMismatch = checkText !== "-" && checkText !== "source/rebuild anchors match";
  if (sourceIncludeCount || rebuildIncludeCount || sourceUniformCount || rebuildUniformCount || hasCheckMismatch) {
    if (name === "VA-work" && sourceIncludeCount === 2 && rebuildIncludeCount === 0 && sourceUniformCount === 0 && rebuildUniformCount === 0 && !hasCheckMismatch) {
      return "open include-surface residual";
    }
    return "open residual";
  }
  if ((fragment.lengths?.delta || 0) !== 0 || (vertex.lengths?.delta || 0) !== 0) return "source anchors match; text differs";
  return "source-shaped";
}

const rows = focusOrder
  .filter((name) => shaderSummary[name])
  .map((name) => {
    const entry = shaderSummary[name];
    return {
      shader: name,
      status: classify(name, entry),
      vertexDelta: entry.vertex?.lengths?.delta ?? null,
      fragmentDelta: entry.fragment?.lengths?.delta ?? null,
      fragmentOnlySourceIncludes: entry.fragment?.includes?.onlySource || [],
      fragmentOnlyRebuildIncludes: entry.fragment?.includes?.onlyRebuild || [],
      fragmentOnlySourceUniforms: entry.fragment?.uniforms?.onlySource || [],
      fragmentOnlyRebuildUniforms: entry.fragment?.uniforms?.onlyRebuild || [],
      coreChecks: checksStatus(
        entry.vaFragmentCoreChecks
          || entry.compositeCoreChecks
          || entry.environmentCoreChecks
          || entry.rgBlurCoreChecks
          || entry.standardBlurCoreChecks
          || entry.lensflareCoreChecks
          || entry.igFxaaCoreChecks,
      ),
    };
  });

const markdown = [
  "# Phase 1 Shader Residual Summary",
  "",
  `Input: \`${inputDir}\``,
  "",
  "| Shader | Status | Vertex Delta | Fragment Delta | Fragment Source-Only Includes | Fragment Rebuild-Only Includes | Fragment Source-Only Uniforms | Fragment Rebuild-Only Uniforms | Core Checks |",
  "| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |",
  ...rows.map((row) => [
    `\`${row.shader}\``,
    row.status,
    row.vertexDelta ?? "-",
    row.fragmentDelta ?? "-",
    values(row.fragmentOnlySourceIncludes),
    values(row.fragmentOnlyRebuildIncludes),
    values(row.fragmentOnlySourceUniforms),
    values(row.fragmentOnlyRebuildUniforms),
    row.coreChecks,
  ].join(" | ")).map((line) => `| ${line} |`),
  "",
  "## Current Phase 1 Reading",
  "",
  "- `OA-work-composite`, `A1-pre-composite`, `u1-environment`, thumb, media, and main-fluid helper shaders currently have matched core anchors in the generated dump.",
  "- `VA-work` still has a source-only include surface residual for `bsdfs` and `opaque_fragment`; the expanded rebuild tail is semantically source-shaped by the current core checks, but the include surface is not byte-for-byte source-shaped.",
  "- Treat this report as attribution input. It is not visual acceptance and does not close Phase 1.",
  "",
].join("\n");

writeFileSync(path.join(inputDir, "phase1-shader-residuals.json"), JSON.stringify({ inputDir, rows }, null, 2));
writeFileSync(path.join(inputDir, "phase1-shader-residuals.md"), markdown);
console.log(markdown);

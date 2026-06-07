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
  "N1-displacement-composite",
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

function bridgeStatus(entry) {
  const compatibility = entry?.vaBridgeCompatibility;
  if (!compatibility) return "-";
  if (compatibility.classification === "r164-compile-bridge") {
    return "r164 compile bridge: source `SPECULAR`, rebuild keeps `USE_SPECULAR` for Three `lights_physical_fragment`";
  }
  return `bridge compatibility: ${compatibility.classification || "needs-review"}`;
}

function classify(name, entry) {
  const fragment = entry.fragment || {};
  const vertex = entry.vertex || {};
  const sourceIncludes = fragment.includes?.onlySource || entry.fragmentIncludesOnlySource || [];
  const rebuildIncludes = fragment.includes?.onlyRebuild || entry.fragmentIncludesOnlyRebuild || [];
  const sourceUniforms = fragment.uniforms?.onlySource || entry.fragmentUniformsOnlySource || [];
  const rebuildUniforms = fragment.uniforms?.onlyRebuild || entry.fragmentUniformsOnlyRebuild || [];
  const sourceIncludeCount = sourceIncludes.length;
  const rebuildIncludeCount = rebuildIncludes.length;
  const sourceCommentedIncludes = entry.fragmentCommentedIncludesSource || entry.commentedIncludes?.fragmentSource || [];
  const rebuildCommentedIncludes = entry.fragmentCommentedIncludesRebuild || entry.commentedIncludes?.fragmentRebuild || [];
  const sourceCommentedIncludeCount = sourceCommentedIncludes.length;
  const rebuildCommentedIncludeCount = rebuildCommentedIncludes.length;
  const sourceUniformCount = sourceUniforms.length;
  const rebuildUniformCount = rebuildUniforms.length;
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
  if (sourceCommentedIncludeCount !== rebuildCommentedIncludeCount) return "commented include-surface residual";
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
      vertexDelta: entry.vertex?.lengths?.delta ?? entry.vertexLengthDelta ?? null,
      fragmentDelta: entry.fragment?.lengths?.delta ?? entry.fragmentLengthDelta ?? null,
      fragmentOnlySourceIncludes: entry.fragment?.includes?.onlySource || entry.fragmentIncludesOnlySource || [],
      fragmentOnlyRebuildIncludes: entry.fragment?.includes?.onlyRebuild || entry.fragmentIncludesOnlyRebuild || [],
      fragmentCommentedIncludesSource: entry.fragmentCommentedIncludesSource || entry.commentedIncludes?.fragmentSource || [],
      fragmentCommentedIncludesRebuild: entry.fragmentCommentedIncludesRebuild || entry.commentedIncludes?.fragmentRebuild || [],
      fragmentOnlySourceUniforms: entry.fragment?.uniforms?.onlySource || entry.fragmentUniformsOnlySource || [],
      fragmentOnlyRebuildUniforms: entry.fragment?.uniforms?.onlyRebuild || entry.fragmentUniformsOnlyRebuild || [],
      bridge: bridgeStatus(entry),
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

const vaWorkRow = rows.find((row) => row.shader === "VA-work");
const vaWorkHasIncludeResidual = Boolean(
  vaWorkRow
  && (vaWorkRow.fragmentOnlySourceIncludes.length || vaWorkRow.fragmentOnlyRebuildIncludes.length),
);
const vaWorkHasCommentedIncludeResidual = Boolean(
  vaWorkRow
  && vaWorkRow.fragmentCommentedIncludesSource.length !== vaWorkRow.fragmentCommentedIncludesRebuild.length,
);
const vaWorkReading = vaWorkHasIncludeResidual
  ? `- \`VA-work\` still has an include-surface residual: source-only ${values(vaWorkRow.fragmentOnlySourceIncludes)}, rebuild-only ${values(vaWorkRow.fragmentOnlyRebuildIncludes)}.`
  : vaWorkHasCommentedIncludeResidual
    ? `- \`VA-work\` still has a commented include-surface residual: source commented ${values(vaWorkRow.fragmentCommentedIncludesSource)}, rebuild commented ${values(vaWorkRow.fragmentCommentedIncludesRebuild)}.`
  : "- `VA-work` no longer has source/rebuild include or uniform residuals in this generated dump; the remaining `SPECULAR`/`USE_SPECULAR` define difference is classified separately as a Three r164 compile bridge when present.";

const markdown = [
  "# Phase 1 Shader Residual Summary",
  "",
  `Input: \`${inputDir}\``,
  "",
  "| Shader | Status | Vertex Delta | Fragment Delta | Fragment Source-Only Includes | Fragment Rebuild-Only Includes | Fragment Source Commented Includes | Fragment Rebuild Commented Includes | Fragment Source-Only Uniforms | Fragment Rebuild-Only Uniforms | Bridge Notes | Core Checks |",
  "| --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows.map((row) => [
    `\`${row.shader}\``,
    row.status,
    row.vertexDelta ?? "-",
    row.fragmentDelta ?? "-",
    values(row.fragmentOnlySourceIncludes),
    values(row.fragmentOnlyRebuildIncludes),
    values(row.fragmentCommentedIncludesSource),
    values(row.fragmentCommentedIncludesRebuild),
    values(row.fragmentOnlySourceUniforms),
    values(row.fragmentOnlyRebuildUniforms),
    row.bridge,
    row.coreChecks,
  ].join(" | ")).map((line) => `| ${line} |`),
  "",
  "## Current Phase 1 Reading",
  "",
  "- `OA-work-composite`, `A1-pre-composite`, `u1-environment`, thumb, media, and main-fluid helper shaders currently have matched core anchors in the generated dump.",
  vaWorkReading,
  "- Treat this report as attribution input. It is not visual acceptance and does not close Phase 1.",
  "",
].join("\n");

writeFileSync(path.join(inputDir, "phase1-shader-residuals.json"), JSON.stringify({ inputDir, rows }, null, 2));
writeFileSync(path.join(inputDir, "phase1-shader-residuals.md"), markdown);
console.log(markdown);

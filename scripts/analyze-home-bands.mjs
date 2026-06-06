import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = process.argv[2] || process.env.OUT_DIR || "/tmp/rogier-compare";
const files = [
  ["original-desktop", "original-home-desktop.png"],
  ["rebuild-desktop", "rebuild-home-desktop.png"],
  ["original-mobile", "original-home-mobile.png"],
  ["rebuild-mobile", "rebuild-home-mobile.png"],
];

function luma(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

async function analyze(label, file) {
  const fullPath = path.join(outDir, file);
  if (!existsSync(fullPath)) return { label, file: fullPath, missing: true };

  const { data, info } = await sharp(fullPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rows = [];
  const x0 = Math.floor(info.width * 0.2);
  const x1 = Math.floor(info.width * 0.8);
  for (let y = 0; y < info.height; y += 1) {
    let sum = 0;
    let count = 0;
    for (let x = x0; x < x1; x += 1) {
      const index = (y * info.width + x) * 3;
      sum += luma(data[index], data[index + 1], data[index + 2]);
      count += 1;
    }
    rows.push(sum / count);
  }

  let maxDelta = { y: 0, value: 0 };
  for (let y = 2; y < rows.length - 2; y += 1) {
    const value = Math.abs(rows[y + 2] - rows[y - 2]);
    if (value > maxDelta.value) maxDelta = { y, value };
  }

  const bands = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map((position) => {
    const center = Math.round(info.height * position);
    const slice = rows.slice(Math.max(0, center - 10), Math.min(info.height, center + 10));
    return [position, Number(mean(slice).toFixed(4))];
  });

  return {
    label,
    file: fullPath,
    width: info.width,
    height: info.height,
    centerBandLuma: Number(mean(rows).toFixed(4)),
    maxHorizontalDelta: {
      y: maxDelta.y,
      position: Number((maxDelta.y / info.height).toFixed(3)),
      value: Number(maxDelta.value.toFixed(4)),
    },
    bands,
  };
}

const results = [];
for (const [label, file] of files) {
  results.push(await analyze(label, file));
}

function bandDelta(sourceLabel, rebuildLabel) {
  const source = results.find((result) => result.label === sourceLabel);
  const rebuild = results.find((result) => result.label === rebuildLabel);
  if (!source || !rebuild || source.missing || rebuild.missing) return null;
  return {
    pair: `${sourceLabel} -> ${rebuildLabel}`,
    centerBandLumaDelta: Number((rebuild.centerBandLuma - source.centerBandLuma).toFixed(4)),
    maxHorizontalDeltaDelta: Number((rebuild.maxHorizontalDelta.value - source.maxHorizontalDelta.value).toFixed(4)),
    bands: source.bands.map(([position, sourceValue], index) => {
      const rebuildValue = rebuild.bands[index]?.[1] ?? 0;
      return [position, Number((rebuildValue - sourceValue).toFixed(4))];
    }),
  };
}

console.log(JSON.stringify({
  outDir,
  results,
  deltas: [
    bandDelta("original-desktop", "rebuild-desktop"),
    bandDelta("original-mobile", "rebuild-mobile"),
  ].filter(Boolean),
}, null, 2));

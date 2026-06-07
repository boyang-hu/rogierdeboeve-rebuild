import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import net from "node:net";
import { ShaderChunk } from "three";

const chromePath = process.env.CHROME_PATH
  || [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Users/boyang/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  ].find((candidate) => existsSync(candidate));

if (!chromePath) {
  throw new Error("Chrome executable not found. Set CHROME_PATH to a Chrome/Chromium binary.");
}

const outDir = process.env.OUT_DIR || path.join(tmpdir(), "rogier-va-shader");
const port = Number(process.env.CDP_PORT || 9231);
const rebuildUrl = process.env.REBUILD_URL || "http://127.0.0.1:5173";
const extraQuery = process.env.EXTRA_QUERY || "";
const bundlePath = process.env.SOURCE_BUNDLE || "legacy-mirror/public/assets/bundle.250f01b7.js";

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

function extractSourceShader(bundle, name, terminator) {
  const start = bundle.indexOf(`${name}=\``);
  if (start < 0) throw new Error(`Unable to find source shader ${name}`);
  const bodyStart = start + name.length + 2;
  const end = terminator
    ? bundle.indexOf(terminator, bodyStart)
    : bundle.indexOf("`", bodyStart);
  if (end < 0) throw new Error(`Unable to find end of source shader ${name}`);
  return bundle.slice(bodyStart, end);
}

function tryExtractSourceShader(bundle, name, terminator) {
  try {
    return extractSourceShader(bundle, name, terminator);
  } catch {
    return null;
  }
}

function summarizeShader(label, shader, sourceShader) {
  const checks = [
    "#include <uv_pars_vertex>",
    "#include <worldpos_vertex>",
    "#include <lights_fragment_maps>",
    "#include <aomap_fragment>",
    "#include <transmission_fragment>",
    "#include <tonemapping_fragment>",
    "#include <colorspace_fragment>",
    "gl_FragColor = vec4(sourceColor",
    "gl_FragColor.rgb = mix",
    "NUM_SPOT_LIGHT_COORDS",
    "spotLightMap",
    "sourceWorldTransformed",
  ];
  return {
    label,
    length: shader.length,
    sourceLength: sourceShader.length,
    checks: Object.fromEntries(checks.map((check) => [check, shader.includes(check)])),
  };
}

function collectIncludes(shader) {
  return shader
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !line.startsWith("//"))
    .flatMap((line) => [...line.matchAll(/#include <([^>]+)>/g)].map((match) => match[1]));
}

function collectCommentedIncludes(shader) {
  return shader
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("//"))
    .flatMap((line) => [...line.matchAll(/#include <([^>]+)>/g)].map((match) => match[1]));
}

function collectUniformNames(shader) {
  const names = [];
  for (const match of shader.matchAll(/\buniform\s+[^;]*?\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\[[^\]]+\])?\s*;/g)) {
    names.push(match[1]);
  }
  return names;
}

function unique(values) {
  return [...new Set(values)];
}

function lineNumber(shader, index) {
  if (index < 0) return null;
  return shader.slice(0, index).split("\n").length;
}

function findLines(shader, pattern) {
  return shader
    .split("\n")
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter((entry) => pattern.test(entry.text));
}

function lineWindow(shader, needle, before = 5, after = 8) {
  const index = shader.indexOf(needle);
  if (index < 0) return null;
  const lines = shader.split("\n");
  const line = lineNumber(shader, index);
  const start = Math.max(1, line - before);
  const end = Math.min(lines.length, line + after);
  return {
    needle,
    line,
    text: lines.slice(start - 1, end).map((value, offset) => `${start + offset}: ${value}`).join("\n"),
  };
}

function compareLists(sourceValues, rebuildValues) {
  const sourceSet = new Set(sourceValues);
  const rebuildSet = new Set(rebuildValues);
  return {
    source: unique(sourceValues),
    rebuild: unique(rebuildValues),
    onlySource: unique(sourceValues).filter((value) => !rebuildSet.has(value)),
    onlyRebuild: unique(rebuildValues).filter((value) => !sourceSet.has(value)),
  };
}

function analyzeFragment(sourceShader, rebuildShader) {
  const anchors = [
    "#include <roughnessmap_fragment>",
    "#include <metalnessmap_fragment>",
    "#include <normal_fragment_begin>",
    "#include <normal_fragment_maps>",
    "#include <lights_physical_fragment>",
    "#include <lights_fragment_begin>",
    "#include <lights_fragment_end>",
    "vec3 totalDiffuse",
    "vec3 totalSpecular",
    "vec3 outgoingLight",
    "#include <opaque_fragment>",
    "gl_FragColor.rgb",
    "gl_FragColor.a",
  ];
  const checks = [
    "NUM_SPOT_LIGHT_COORDS",
    "spotLightMap",
    "spotLightMatrix",
    "getSpotLightInfo",
    "RE_Direct",
    "RE_IndirectDiffuse",
    "RE_IndirectSpecular",
    "PhysicalMaterial material",
    "material.specularColor",
    "material.specularF90",
    "material.dispersion",
    "material.anisotropy",
    "USE_SPECULAR",
    "USE_SPECULAR_COLORMAP",
    "USE_SPECULARCOLORMAP",
    "USE_SPECULAR_INTENSITYMAP",
    "USE_SPECULARINTENSITYMAP",
    "totalEmissiveRadiance = emissive",
    "gl_FragColor = vec4( outgoingLight",
    "gl_FragColor = vec4(sourceColor",
  ];
  const sourceIncludes = collectIncludes(sourceShader);
  const rebuildIncludes = collectIncludes(rebuildShader);
  const sourceUniforms = collectUniformNames(sourceShader);
  const rebuildUniforms = collectUniformNames(rebuildShader);

  return {
    lengths: {
      source: sourceShader.length,
      rebuild: rebuildShader.length,
      delta: rebuildShader.length - sourceShader.length,
    },
    includes: compareLists(sourceIncludes, rebuildIncludes),
    uniforms: {
      onlySource: compareLists(sourceUniforms, rebuildUniforms).onlySource,
      onlyRebuild: compareLists(sourceUniforms, rebuildUniforms).onlyRebuild,
    },
    anchors: Object.fromEntries(anchors.map((anchor) => [
      anchor,
      {
        sourceLine: lineNumber(sourceShader, sourceShader.indexOf(anchor)),
        rebuildLine: lineNumber(rebuildShader, rebuildShader.indexOf(anchor)),
      },
    ])),
    checks: Object.fromEntries(checks.map((check) => [
      check,
      {
        source: sourceShader.includes(check),
        rebuild: rebuildShader.includes(check),
      },
    ])),
    sourceWindows: [
      lineWindow(sourceShader, "#include <lights_physical_fragment>"),
      lineWindow(sourceShader, "#include <lights_fragment_begin>"),
      lineWindow(sourceShader, "vec3 totalDiffuse"),
      lineWindow(sourceShader, "gl_FragColor.rgb"),
    ].filter(Boolean),
    rebuildWindows: [
      lineWindow(rebuildShader, "#include <lights_physical_fragment>"),
      lineWindow(rebuildShader, "#include <lights_fragment_begin>"),
      lineWindow(rebuildShader, "vec3 totalDiffuse"),
      lineWindow(rebuildShader, "gl_FragColor = vec4(sourceColor"),
    ].filter(Boolean),
    spotlightLines: {
      source: findLines(sourceShader, /spotLight|SpotLight|NUM_SPOT/i),
      rebuild: findLines(rebuildShader, /spotLight|SpotLight|NUM_SPOT/i),
    },
    materialInterfaceLines: {
      source: findLines(sourceShader, /specular|dispersion|anisotropy|clearcoat|sheen/i),
      rebuild: findLines(rebuildShader, /specular|dispersion|anisotropy|clearcoat|sheen/i),
    },
  };
}

function analyzeVertex(sourceShader, rebuildShader) {
  const anchors = [
    "#include <begin_vertex>",
    "#include <project_vertex>",
    "#include <worldpos_vertex>",
    "vec2 screenUv",
    "vec2 newUv",
    "float mouse",
    "vec4 mvPosition",
    "gl_Position",
    "vViewPosition",
    "transformed /= 1. - mouseSim.r * .2",
    "sourceWorldTransformed",
    "max(1.0 - vMouseSim * 0.2, 0.0001)",
  ];
  const checks = [
    "gl_Position.xy / uCoords.xy",
    "vec2 screenUv = vec2(0.0)",
    "vec2 newUv = uv",
    "vec2 newUv = screenUv",
    "texture2D(tMouseSim",
    "transformed *= 1.0 - mouse",
    "transformed /= 1. - mouseSim.r * .2",
    "transformed / max(1.0 - vMouseSim * 0.2, 0.0001)",
    "transformed / (1.0 - vMouseSim * 0.2)",
    "vSpotLightCoord",
    "NUM_SPOT_LIGHT_COORDS",
    "USE_BATCHING",
    "USE_INSTANCING",
  ];
  return {
    lengths: {
      source: sourceShader.length,
      rebuild: rebuildShader.length,
      delta: rebuildShader.length - sourceShader.length,
    },
    includes: compareLists(collectIncludes(sourceShader), collectIncludes(rebuildShader)),
    uniforms: {
      onlySource: compareLists(collectUniformNames(sourceShader), collectUniformNames(rebuildShader)).onlySource,
      onlyRebuild: compareLists(collectUniformNames(sourceShader), collectUniformNames(rebuildShader)).onlyRebuild,
    },
    anchors: Object.fromEntries(anchors.map((anchor) => [
      anchor,
      {
        sourceLine: lineNumber(sourceShader, sourceShader.indexOf(anchor)),
        rebuildLine: lineNumber(rebuildShader, rebuildShader.indexOf(anchor)),
      },
    ])),
    checks: Object.fromEntries(checks.map((check) => [
      check,
      {
        source: sourceShader.includes(check),
        rebuild: rebuildShader.includes(check),
      },
    ])),
    sourceWindows: [
      lineWindow(sourceShader, "vec2 screenUv"),
      lineWindow(sourceShader, "vec2 newUv"),
      lineWindow(sourceShader, "vec4 mvPosition"),
      lineWindow(sourceShader, "transformed /= 1. - mouseSim.r * .2", 8, 12),
    ].filter(Boolean),
    rebuildWindows: [
      lineWindow(rebuildShader, "vec2 newUv"),
      lineWindow(rebuildShader, "#include <project_vertex>"),
      lineWindow(rebuildShader, "sourceWorldTransformed", 8, 12),
      lineWindow(rebuildShader, "vSpotLightCoord", 8, 12),
    ].filter(Boolean),
    mouseLines: {
      source: findLines(sourceShader, /mouseSim|tMouseSim|mouseUv|uUvOffset|uUvOffsetScale/i),
      rebuild: findLines(rebuildShader, /mouseSim|tMouseSim|mouseUv|uUvOffset|uUvOffsetScale/i),
    },
    worldPositionLines: {
      source: findLines(sourceShader, /worldPosition|modelMatrix|instanceMatrix|vSpotLightCoord|spotLightMatrix/i),
      rebuild: findLines(rebuildShader, /worldPosition|modelMatrix|instanceMatrix|vSpotLightCoord|spotLightMatrix|sourceWorldTransformed/i),
    },
  };
}

function analyzeShaderChunk(name) {
  const chunk = ShaderChunk[name] || "";
  const checks = [
    "spotLightMap",
    "spotLightMatrix",
    "inSpotLightMap",
    "directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;",
    "RE_Direct",
    "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
  ];
  return {
    name,
    length: chunk.length,
    checks: Object.fromEntries(checks.map((check) => [
      check,
      {
        present: chunk.includes(check),
        line: lineNumber(chunk, chunk.indexOf(check)),
      },
    ])),
    spotlightWindow: lineWindow(chunk, "spotLightMap", 12, 12),
  };
}

function summarizeGenericShader(sourceShader, rebuildShader) {
  const sourceIncludes = sourceShader ? collectIncludes(sourceShader) : [];
  const rebuildIncludes = collectIncludes(rebuildShader);
  const sourceUniforms = sourceShader ? collectUniformNames(sourceShader) : [];
  const rebuildUniforms = collectUniformNames(rebuildShader);
  const keyChecks = [
    "toneMapped",
    "#include <tonemapping_fragment>",
    "#include <colorspace_fragment>",
    "convertLinearToSRGB",
    "blend(4",
    "blend(11",
    "blend(15",
    "blend(16",
    "rgbshift",
    "uReveal",
    "uMediaReveal",
    "uDarkenColor",
    "uDarkenIntensity",
    "uSaturation",
    "tMouseSim",
    "tFluid",
    "tBloom",
    "tSky",
    "opaque_fragment",
  ];
  return {
    lengths: {
      source: sourceShader?.length ?? null,
      rebuild: rebuildShader.length,
      delta: sourceShader ? rebuildShader.length - sourceShader.length : null,
    },
    includes: sourceShader ? compareLists(sourceIncludes, rebuildIncludes) : { source: [], rebuild: unique(rebuildIncludes), onlySource: [], onlyRebuild: unique(rebuildIncludes) },
    uniforms: sourceShader
      ? {
          onlySource: compareLists(sourceUniforms, rebuildUniforms).onlySource,
          onlyRebuild: compareLists(sourceUniforms, rebuildUniforms).onlyRebuild,
        }
      : { onlySource: [], onlyRebuild: unique(rebuildUniforms) },
    checks: Object.fromEntries(keyChecks.map((check) => [
      check,
      {
        source: sourceShader ? sourceShader.includes(check) : null,
        rebuild: rebuildShader.includes(check),
      },
    ])),
  };
}

function normalizeShaderForCoreChecks(shader = "") {
  return shader
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith("//") ? "" : line;
    })
    .join("\n")
    .replace(/\s+/g, "")
    .replace(/texture2D/g, "texture");
}

function analyzeCompositeCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    sceneRgbshift: ["rgbshift(tScene,uv,-1.,.0015)", "rgbshift(tScene,uv,-1.0,0.0015)"],
    bloomPrimaryRgbshift: ["rgbshift(tBloom,uv,-1.5,.02)", "rgbshift(tBloom,uv,-1.5,0.02)"],
    bloomDistortionAngle: ["length(uv+0.5)"],
    bloomDistortionAmount: ["amount/.5", "amount/0.5"],
    fluidLuminanceAdd: ["length(fluid.xy)*.015", "length(fluid.xy)*0.015"],
    darkenOpacity: ["uDarken*2.+mouseSim.r*.25*uDarken", "uDarken*2.0+mouseSim.r*0.25*uDarken"],
    multiplyDarken: ["blend(15,", "sourceBlend(15,"],
    lightenBlack: ["blend(11,", "sourceBlend(11,"],
    saturationTail: ["saturation("],
    tonemappingTail: ["#include<tonemapping_fragment>"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => [
    name,
    {
      source: candidates.some((candidate) => source.includes(candidate)),
      rebuild: candidates.some((candidate) => rebuild.includes(candidate)),
    },
  ]));
}

function analyzeVertexCore(sourceShader, rebuildShader) {
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    screenUvFromClip: ["gl_Position.xy/uCoords.xy"],
    newUvFromScreenUv: ["vec2newUv=screenUv"],
    localMouseSample: ["texture(tMouseSim,mouseUv)"],
    perlinHeight: ["perlinDisplacementHeight=10.", "perlinHeight=10.0"],
    mousePrePerlinScale: ["transformed*=1.-mouseSim.r*.05", "transformed*=1.0-mouseSim.r*0.05"],
    perlinRevealMix: ["mix(transformed,perlinDisplaced,(1.-fadeDiplacement)*.25)", "mix(transformed,perlinDisplaced,(1.0-fadeDisplacement)*0.25)"],
    mouseZTransform: ["mouseTransform*uMouseFactor", "mouseSim.r*15.0*uMouseFactor"],
    spreadScale: ["floatspread=3.", "floatspread=3.0"],
    sourceWorldDivide: ["transformed/=1.-mouseSim.r*.2", "transformed/=1.0-mouseSim.r*0.2"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => [
    name,
    {
      source: candidates.some((candidate) => source.includes(candidate)),
      rebuild: candidates.some((candidate) => rebuild.includes(candidate)),
    },
  ]));
}

function analyzeVaFragmentCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    sourceTailOutput: ["#include<opaque_fragment>", "gl_FragColor=vec4(outgoingLight,diffuseColor.a)"],
    sourceMouseLightness: [
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),(1.-uMouseLightness))",
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),1.-uMouseLightness)",
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),1.0-uMouseLightness)",
    ],
    sourceAlphaGrid: ["mixedAlpha=((alpha*alpha2)*vInstanceAlpha)", "floatalpha=alpha1*alpha2*vAlpha"],
    sourceRevealRadius: ["2.0*pow(revealCombined,.25)", "2.0*pow(revealCombined,0.25)"],
    sourceMouseAlpha: [
      "mixedAlpha+=clamp(mouseSim.r*(uMouseFactor*0.5),0.,1.)",
      "clamp(simLight*(uMouseFactor*.5),0.,1.)",
      "clamp(simLight*(uMouseFactor*0.5),0.0,1.0)",
    ],
    sourceSpecularMacro: ["USE_SPECULARCOLORMAP", "USE_SPECULARINTENSITYMAP"],
    modernSpecularMacro: ["USE_SPECULAR_COLORMAP", "USE_SPECULAR_INTENSITYMAP"],
    modernPhysicalResidual: ["USE_DISPERSION", "USE_ANISOTROPY"],
    sheenResidual: ["USE_SHEEN"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => [
    name,
    {
      source: candidates.some((candidate) => source.includes(candidate)),
      rebuild: candidates.some((candidate) => rebuild.includes(candidate)),
    },
  ]));
}

mkdirSync(outDir, { recursive: true });

const bundle = readFileSync(bundlePath, "utf8");
const sourceZ = extractSourceShader(bundle, "zA", "`,HA=`");
const sourceH = extractSourceShader(bundle, "HA", "`;class VA extends");
const sourceFragmentShaders = {
  "VA-work": sourceZ,
  "A1-pre-composite": tryExtractSourceShader(bundle, "A1"),
  "Lu-main-composite": tryExtractSourceShader(bundle, "aA"),
  "OA-work-composite": tryExtractSourceShader(bundle, "CA"),
  "x1-thumb-composite": tryExtractSourceShader(bundle, "v1"),
  "M1-thumb-plane": tryExtractSourceShader(bundle, "S1"),
  "j1-media-composite": tryExtractSourceShader(bundle, "G1"),
  "UD-project-media": tryExtractSourceShader(bundle, "LD"),
  "u1-environment": tryExtractSourceShader(bundle, "l1"),
};
const sourceVertexShaders = {
  "VA-work": sourceH,
  "M1-thumb-plane": tryExtractSourceShader(bundle, "b1"),
};
writeFileSync(path.join(outDir, "source-HA.glsl"), sourceH);
writeFileSync(path.join(outDir, "source-zA.glsl"), sourceZ);
for (const [name, shader] of Object.entries(sourceFragmentShaders)) {
  if (shader) writeFileSync(path.join(outDir, `source-${name}.glsl`), shader);
}
for (const [name, shader] of Object.entries(sourceVertexShaders)) {
  if (shader) writeFileSync(path.join(outDir, `source-${name}-vertex.glsl`), shader);
}

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  "--headless=new",
  "--use-gl=swiftshader",
  "--enable-unsafe-swiftshader",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${path.join(tmpdir(), `rogier-va-dump-${port}`)}`,
], { stdio: ["ignore", "ignore", "pipe"] });

try {
  await waitForPort(port);
  const newTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((res) => res.json());
  const ws = await connectWs(newTarget.webSocketDebuggerUrl);
  const consoleMessages = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.consoleAPICalled") {
      consoleMessages.push((message.params.args || []).map((arg) => arg.value || arg.description).join(" "));
    }
    if (message.method === "Runtime.exceptionThrown") {
      consoleMessages.push(message.params.exceptionDetails?.text || "Runtime exception");
    }
  });
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
  await send(ws, "Page.navigate", { url: `${rebuildUrl}/?skip-preloader&dump-va-shader=1${extraQuery}` });
  await wait(Number(process.env.DUMP_WAIT || 5000));
  const result = await send(ws, "Runtime.evaluate", {
    expression: "JSON.stringify({ body: document.body.className, dump: window.__rogierVaShaderDump || [], shaderDump: window.__rogierShaderDump || [] })",
    returnByValue: true,
  });
  const parsed = JSON.parse(result.result.value);
  const workDump = parsed.dump.find((entry) => entry.variant === "work");
  if (!workDump) {
    throw new Error(`No work shader dump found. Body: ${parsed.body}`);
  }
  writeFileSync(path.join(outDir, "rebuild-work-vertex.glsl"), workDump.vertexShader);
  writeFileSync(path.join(outDir, "rebuild-work-fragment.glsl"), workDump.fragmentShader);
  const genericShaderAnalysis = {};
  for (const entry of parsed.shaderDump || []) {
    const safeName = entry.name.replace(/[^A-Za-z0-9_.-]/g, "_");
    const sourceVertex = sourceVertexShaders[entry.name] || null;
    const sourceFragment = sourceFragmentShaders[entry.name] || null;
    writeFileSync(path.join(outDir, `rebuild-${safeName}-vertex.glsl`), entry.vertexShader);
    writeFileSync(path.join(outDir, `rebuild-${safeName}-fragment.glsl`), entry.fragmentShader);
    genericShaderAnalysis[entry.name] = {
      vertex: summarizeGenericShader(sourceVertex, entry.vertexShader),
      fragment: summarizeGenericShader(sourceFragment, entry.fragmentShader),
      compositeCoreChecks: analyzeCompositeCore(sourceFragment, entry.fragmentShader),
      vaFragmentCoreChecks: entry.name === "VA-work" ? analyzeVaFragmentCore(sourceFragment, entry.fragmentShader) : null,
      commentedIncludes: {
        fragmentSource: sourceFragment ? collectCommentedIncludes(sourceFragment) : [],
        fragmentRebuild: collectCommentedIncludes(entry.fragmentShader),
      },
      files: {
        rebuildVertex: path.join(outDir, `rebuild-${safeName}-vertex.glsl`),
        rebuildFragment: path.join(outDir, `rebuild-${safeName}-fragment.glsl`),
        source: sourceFragment ? path.join(outDir, `source-${entry.name}.glsl`) : null,
        sourceVertex: sourceVertex ? path.join(outDir, `source-${entry.name}-vertex.glsl`) : null,
      },
    };
  }
  writeFileSync(path.join(outDir, "shader-dump-summary.json"), JSON.stringify(genericShaderAnalysis, null, 2));
  const vertexAnalysis = analyzeVertex(sourceH, workDump.vertexShader);
  const fragmentAnalysis = analyzeFragment(sourceZ, workDump.fragmentShader);
  const vertexCoreChecks = analyzeVertexCore(sourceH, workDump.vertexShader);
  writeFileSync(path.join(outDir, "vertex-analysis.json"), JSON.stringify(vertexAnalysis, null, 2));
  writeFileSync(path.join(outDir, "fragment-analysis.json"), JSON.stringify(fragmentAnalysis, null, 2));
  const chunkAnalysis = {
    lightsFragmentBegin: analyzeShaderChunk("lights_fragment_begin"),
    lightsPhysicalFragment: analyzeShaderChunk("lights_physical_fragment"),
    opaqueFragment: analyzeShaderChunk("opaque_fragment"),
  };
  writeFileSync(path.join(outDir, "three-chunk-analysis.json"), JSON.stringify(chunkAnalysis, null, 2));
  const summary = {
    body: parsed.body,
    dumpCount: parsed.dump.length,
    shaderDumpCount: parsed.shaderDump?.length || 0,
    consoleMessages: consoleMessages.filter((message) => /Shader Error|WebGLProgram|exception/i.test(message)),
    vertex: summarizeShader("work vertex", workDump.vertexShader, sourceH),
    fragment: summarizeShader("work fragment", workDump.fragmentShader, sourceZ),
    vertexAnalysis: {
      lengths: vertexAnalysis.lengths,
      includesOnlySource: vertexAnalysis.includes.onlySource,
      includesOnlyRebuild: vertexAnalysis.includes.onlyRebuild,
      uniformsOnlySource: vertexAnalysis.uniforms.onlySource,
      uniformsOnlyRebuild: vertexAnalysis.uniforms.onlyRebuild,
      keyChecks: vertexAnalysis.checks,
      coreChecks: vertexCoreChecks,
      anchors: vertexAnalysis.anchors,
    },
    fragmentAnalysis: {
      lengths: fragmentAnalysis.lengths,
      includesOnlySource: fragmentAnalysis.includes.onlySource,
      includesOnlyRebuild: fragmentAnalysis.includes.onlyRebuild,
      uniformsOnlySource: fragmentAnalysis.uniforms.onlySource,
      uniformsOnlyRebuild: fragmentAnalysis.uniforms.onlyRebuild,
      keyChecks: fragmentAnalysis.checks,
      anchors: fragmentAnalysis.anchors,
    },
    threeChunkAnalysis: {
      lightsFragmentBegin: {
        length: chunkAnalysis.lightsFragmentBegin.length,
        checks: chunkAnalysis.lightsFragmentBegin.checks,
      },
      opaqueFragment: {
        length: chunkAnalysis.opaqueFragment.length,
        checks: chunkAnalysis.opaqueFragment.checks,
      },
    },
    genericShaders: Object.fromEntries(Object.entries(genericShaderAnalysis).map(([name, analysis]) => [
      name,
      {
        vertexLengthDelta: analysis.vertex.lengths.delta,
        fragmentLengthDelta: analysis.fragment.lengths.delta,
        fragmentUniformsOnlySource: analysis.fragment.uniforms.onlySource,
        fragmentUniformsOnlyRebuild: analysis.fragment.uniforms.onlyRebuild,
        fragmentIncludesOnlySource: analysis.fragment.includes.onlySource,
        fragmentIncludesOnlyRebuild: analysis.fragment.includes.onlyRebuild,
        fragmentCommentedIncludesSource: analysis.commentedIncludes.fragmentSource,
        fragmentCommentedIncludesRebuild: analysis.commentedIncludes.fragmentRebuild,
        compositeCoreChecks: analysis.compositeCoreChecks,
        vaFragmentCoreChecks: analysis.vaFragmentCoreChecks,
        files: analysis.files,
      },
    ])),
    files: {
      sourceVertex: path.join(outDir, "source-HA.glsl"),
      sourceFragment: path.join(outDir, "source-zA.glsl"),
      rebuildVertex: path.join(outDir, "rebuild-work-vertex.glsl"),
      rebuildFragment: path.join(outDir, "rebuild-work-fragment.glsl"),
      vertexAnalysis: path.join(outDir, "vertex-analysis.json"),
      fragmentAnalysis: path.join(outDir, "fragment-analysis.json"),
      threeChunkAnalysis: path.join(outDir, "three-chunk-analysis.json"),
      shaderDumpSummary: path.join(outDir, "shader-dump-summary.json"),
    },
  };
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  ws.close();
} finally {
  chrome.kill("SIGTERM");
}

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

function expandSourceTemplate(bundle, shader, stack = []) {
  if (!shader) return shader;
  if (stack.length > 40) return shader;
  return shader.replace(/\$\{([A-Za-z_$][\w$]*)\}/g, (match, name) => {
    if (stack.includes(name)) return match;
    const helper = tryExtractSourceShader(bundle, name);
    if (!helper) return match;
    return expandSourceTemplate(bundle, helper, [...stack, name]);
  });
}

function sourceShader(bundle, name, terminator) {
  const shader = tryExtractSourceShader(bundle, name, terminator);
  return expandSourceTemplate(bundle, shader);
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
    "worldPosition = instanceMatrix * worldPosition",
    "worldPosition = batchingMatrix * worldPosition",
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

function analyzeCompositeCore(sourceShader, rebuildShader, shaderName = "") {
  if (!sourceShader) return null;
  if (!["A1-pre-composite", "OA-work-composite", "Lu-main-composite", "x1-thumb-composite"].includes(shaderName)) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const isA1PreComposite = source.includes("uniformsampler2DtWork")
    && source.includes("uniformsampler2DtMedia")
    && source.includes("uniformfloatuMediaReveal")
    && source.includes("uniformfloatuDisplacement");
  const usesSourceFullBlendDispatcher = ["A1-pre-composite", "OA-work-composite"].includes(shaderName);
  const isThumbComposite = shaderName === "x1-thumb-composite";
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
    ...(usesSourceFullBlendDispatcher ? {
      sourceSaturationHelper: ["vec3saturation(vec3rgb,floatadjustment)"],
      sourceVignetteHelper: ["floatvignette(vec2coords,floatvignin,floatvignout,floatvignfade,floatfstop)"],
      sourceCircleHelper: ["vec3circle(vec2uv,vec2center,vec3color,floatsize)"],
      sourceContrastHelper: ["vec3contrast(vec3color,floatvalue)"],
      sourceHueHelper: ["vec3hue(vec3color,floathue)"],
      sourceRgbshiftHelper: ["vec4rgbshift(sampler2Dimage,vec2uv,floatangle,floatamount)"],
      sourceFullBlendDispatcher: ["if(mode==25){returnblendVividLight(base,blend,opacity);}"],
      sourceBlendAddSurface: ["vec3blendAdd(vec3base,vec3blend,floatopacity)"],
      sourceBlendMultiplySurface: ["vec3blendMultiply(vec3base,vec3blend,floatopacity)"],
      sourceBlendLightenSurface: ["vec3blendLighten(vec3base,vec3blend,floatopacity)"],
    } : {}),
    ...(isA1PreComposite ? {
      a1LuminanceHelper: ["floatluminance(vec3rgb)"],
      a1CoverTextureHelper: ["vec4coverTexture(sampler2Dtex,vec2imgSize,vec2ouv,vec2containerSize)"],
      a1RandomHelper: ["floatrandom(vec2st)"],
      a1BlendCallName: ["blend(1,", "blend(11,"],
      noA1SourceBlendCallName: ["sourceBlend("],
      noA1RatioVignetteBridge: ["p.x*=uRatio"],
    } : {}),
    ...(isThumbComposite ? {
      sourceThumbBlendMultiplyHelper: ["vec3blendMultiply(vec3base,vec3blend)", "returnbase*blend;"],
      sourceThumbBlendMultiplyOpacityHelper: ["vec3blendMultiply(vec3base,vec3blend,floatopacity)", "return(blendMultiply(base,blend)*opacity+base*(1.0-opacity));"],
      sourceThumbSaturationHelper: ["vec3saturation(vec3rgb,floatadjustment)", "constvec3W=vec3(0.2125,0.7154,0.0721)"],
      noThumbLocalGraySaturationBridge: ["floatgray=dot("],
      noThumbInlineMultiplyOpacityBridge: ["returnbase*blend*opacity+base*(1.0-opacity)"],
    } : {}),
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => [
    name,
    name.startsWith("no")
      ? {
          source: !candidates.some((candidate) => source.includes(candidate)),
          rebuild: !candidates.some((candidate) => rebuild.includes(candidate)),
        }
      : {
          source: candidates.some((candidate) => source.includes(candidate)),
          rebuild: candidates.some((candidate) => rebuild.includes(candidate)),
        },
  ]));
}

function analyzeRgBlurCore(sourceFragment, rebuildFragment) {
  if (!sourceFragment) return null;
  const source = normalizeShaderForCoreChecks(sourceFragment);
  const rebuild = normalizeShaderForCoreChecks(rebuildFragment);
  const checks = {
    compileTimeKernelRadius: ["KERNEL_RADIUS"],
    compileTimeSigma: ["float(SIGMA)"],
    kernelLoop: ["for(inti=1;i<KERNEL_RADIUS;i++)"],
    noRuntimeKernelRadius: ["uKernelRadius"],
    noRuntimeSigma: ["uSigma"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const isNegative = name.startsWith("noRuntime");
    const sourcePresent = candidates.some((candidate) => source.includes(candidate));
    const rebuildPresent = candidates.some((candidate) => rebuild.includes(candidate));
    return [
      name,
      {
        source: isNegative ? !sourcePresent : sourcePresent,
        rebuild: isNegative ? !rebuildPresent : rebuildPresent,
      },
    ];
  }));
}

function analyzeIgFxaaCore(sourceVertex, sourceFragment, rebuildVertex, rebuildFragment) {
  if (!sourceFragment || !sourceVertex) return null;
  const sourceV = normalizeShaderForCoreChecks(sourceVertex);
  const sourceF = normalizeShaderForCoreChecks(sourceFragment);
  const rebuildV = normalizeShaderForCoreChecks(rebuildVertex);
  const rebuildF = normalizeShaderForCoreChecks(rebuildFragment);
  const checks = {
    vertexNeighborUvNW: { source: sourceV, rebuild: rebuildV, candidates: ["v_rgbNW"] },
    vertexNeighborUvNE: { source: sourceV, rebuild: rebuildV, candidates: ["v_rgbNE"] },
    vertexNeighborUvSW: { source: sourceV, rebuild: rebuildV, candidates: ["v_rgbSW"] },
    vertexNeighborUvSE: { source: sourceV, rebuild: rebuildV, candidates: ["v_rgbSE"] },
    vertexNeighborUvM: { source: sourceV, rebuild: rebuildV, candidates: ["v_rgbM"] },
    reduceMinMacro: { source: sourceF, rebuild: rebuildF, candidates: ["FXAA_REDUCE_MIN"] },
    reduceMulMacro: { source: sourceF, rebuild: rebuildF, candidates: ["FXAA_REDUCE_MUL"] },
    spanMaxMacro: { source: sourceF, rebuild: rebuildF, candidates: ["FXAA_SPAN_MAX"] },
    sourceCallShape: {
      source: sourceF,
      rebuild: rebuildF,
      candidates: ["fxaa(tMap,vUv*uResolution,uResolution,v_rgbNW,v_rgbNE,v_rgbSW,v_rgbSE,v_rgbM)"],
    },
  };
  return Object.fromEntries(Object.entries(checks).map(([name, config]) => [
    name,
    {
      source: config.candidates.some((candidate) => config.source.includes(candidate)),
      rebuild: config.candidates.some((candidate) => config.rebuild.includes(candidate)),
    },
  ]));
}

function analyzeStandardBlurCore(sourceFragment, rebuildFragment) {
  if (!sourceFragment) return null;
  const source = normalizeShaderForCoreChecks(sourceFragment);
  const rebuild = normalizeShaderForCoreChecks(rebuildFragment);
  const checks = {
    blurinessUniform: ["uniformfloatuBluriness"],
    directionUniform: ["uniformvec2uDirection"],
    nineTapMin4: ["uv-4.0*pixel*direction"],
    nineTapCenter: ["texture(image,uv)*0.1633"],
    nineTapPlus4: ["uv+4.0*pixel*direction"],
    blurinessDirectionCall: ["blur(tMap,vUv,uResolution,uBluriness*uDirection)"],
    noBloomKernelDefine: ["KERNEL_RADIUS", "SIGMA"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const isNegative = name.startsWith("no");
    const sourcePresent = candidates.some((candidate) => source.includes(candidate));
    const rebuildPresent = candidates.some((candidate) => rebuild.includes(candidate));
    return [
      name,
      {
        source: isNegative ? !sourcePresent : sourcePresent,
        rebuild: isNegative ? !rebuildPresent : rebuildPresent,
      },
    ];
  }));
}

function analyzeLensflareCore(sourceFragment, rebuildFragment) {
  if (!sourceFragment) return null;
  const source = normalizeShaderForCoreChecks(sourceFragment);
  const rebuild = normalizeShaderForCoreChecks(rebuildFragment);
  const checks = {
    lightPositionUniform: ["uniformvec2uLightPosition"],
    scaleUniform: ["uniformvec2uScale"],
    exposureUniform: ["uniformfloatuExposure"],
    clampUniform: ["uniformfloatuClamp"],
    lensflareFunction: ["vec3lensflare(vec2uv,vec2pos)"],
    mapSampleAtLight: ["texture(tMap,uLightPosition).rgb*2.0", "texture(tMap,uLightPosition).rgb*2."],
    gammaPow: ["pow(color,vec3(0.5))", "pow(color,vec3(.5))"],
    exposureMultiply: ["color*=uExposure"],
    clampColor: ["clamp(color,0.0,uClamp)", "clamp(color,0.,uClamp)"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const isNegative = name.startsWith("no");
    const sourcePresent = candidates.some((candidate) => source.includes(candidate));
    const rebuildPresent = candidates.some((candidate) => rebuild.includes(candidate));
    return [
      name,
      {
        source: isNegative ? !sourcePresent : sourcePresent,
        rebuild: isNegative ? !rebuildPresent : rebuildPresent,
      },
    ];
  }));
}

function analyzeThumbPlaneCore(sourceVertex, sourceFragment, rebuildVertex, rebuildFragment) {
  if (!sourceFragment) return null;
  const sourceV = normalizeShaderForCoreChecks(sourceVertex || "");
  const rebuildV = normalizeShaderForCoreChecks(rebuildVertex || "");
  const source = normalizeShaderForCoreChecks(sourceFragment);
  const rebuild = normalizeShaderForCoreChecks(rebuildFragment);
  const checks = {
    vertexMatrixFullscreen: {
      source: sourceV.includes("worldPosition=modelMatrix*vec4(position,1.0)") && sourceV.includes("gl_Position=projectionMatrix*mvPosition"),
      rebuild: rebuildV.includes("worldPosition=modelMatrix*vec4(position,1.0)") && rebuildV.includes("gl_Position=projectionMatrix*mvPosition"),
    },
    coverTextureHelper: {
      source: source.includes("vec4coverTexture(sampler2Dtex,vec2imgSize,vec2ouv,vec2containerSize)"),
      rebuild: rebuild.includes("vec4coverTexture(sampler2Dtex,vec2imgSize,vec2ouv,vec2containerSize)"),
    },
    coverTextureColorTemporary: {
      source: source.includes("vec4color=texture(tex,uv)") && source.includes("returncolor"),
      rebuild: rebuild.includes("vec4color=texture(tex,uv)") && rebuild.includes("returncolor"),
    },
    transitionFunction: {
      source: source.includes("vec4transition(vec4color1,vec4color2,floatprogress,vec2uv)"),
      rebuild: rebuild.includes("vec4transition(vec4color1,vec4color2,floatprogress,vec2uv)"),
    },
    transitionStepShape: {
      source: source.includes("smoothstep(-uTransitionSmoothness,0.0,uv.y-progress*(1.0+uTransitionSmoothness))") && source.includes("step(pr,fract(uTransitionCount*uv.y))"),
      rebuild: rebuild.includes("smoothstep(-uTransitionSmoothness,0.0,uv.y-progress*(1.0+uTransitionSmoothness))") && rebuild.includes("step(pr,fract(uTransitionCount*uv.y))"),
    },
    transitionProgressInvert: {
      source: source.includes("transition(map,color,1.-uProgress,uv)") || source.includes("transition(map,color,1.0-uProgress,uv)"),
      rebuild: rebuild.includes("transition(map,color,1.-uProgress,uv)") || rebuild.includes("transition(map,color,1.0-uProgress,uv)"),
    },
    sourceOutput: {
      source: source.includes("FragColor=mixed"),
      rebuild: rebuild.includes("FragColor=mixed"),
    },
  };
  return checks;
}

function analyzeVertexCore(sourceShader, rebuildShader) {
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    sourceVaryingUv: ["varyingvec2vUv"],
    sourceVaryingInstanceAlpha: ["varyingfloatvInstanceAlpha"],
    sourceVaryingInstanceIndex: ["varyingfloatvInstanceIndex"],
    sourceVaryingInstanceColor: ["varyingvec3vInstanceColor"],
    sourceVaryingPosition: ["varyingvec3vPosition"],
    sourceVaryingNoise: ["varyingfloatvNoise"],
    sourceVaryingOffset: ["varyingvec3vOffset"],
    sourceBeginVertexInclude: ["#include<begin_vertex>"],
    assignsSourceUv: ["vUv=uv"],
    assignsSourceInstanceIndex: ["vInstanceIndex=instanceIndex"],
    assignsSourceInstanceColor: ["vInstanceColor=instanceColor"],
    assignsSourcePosition: ["vPosition=position"],
    noRebuildLocalUv: ["vLocalUv"],
    noRebuildAlphaVarying: ["vAlpha"],
    screenUvFromClip: ["gl_Position.xy/uCoords.xy"],
    newUvFromScreenUv: ["vec2newUv=screenUv"],
    newOffsetStep: ["vec2newOffset=instanceOffset.xy"],
    mouseUvTwoStep: ["vec2mouseUv=newUv+uUvOffset.xy", "mouseUv/=uUvOffsetScale"],
    localMouseSample: ["texture(tMouseSim,mouseUv)"],
    sourcePerlinUv: ["vec2perlinUv=newUv*.75", "vec2perlinUv=newUv*0.75"],
    sourcePerlinSample: ["vec4perlin=texture2D(tPerlin,perlinUv-uTime*.05)", "vec4perlin=texture2D(tPerlin,perlinUv-uTime*0.05)", "vec4perlin=texture(tPerlin,perlinUv-uTime*.05)", "vec4perlin=texture(tPerlin,perlinUv-uTime*0.05)"],
    sourceRevealCombined: ["floatrevealCombined=uReveal*uRevealProject"],
    perlinHeight: ["perlinDisplacementHeight=10.", "perlinHeight=10.0"],
    sourcePerlinScaleDisplacement: ["floatperlinScaleDisplacement=min(1.,1.-(perlinDisplacement-(perlinDisplacementHeight/2.))*.1)", "floatperlinScaleDisplacement=min(1.0,1.0-(perlinDisplacement-(perlinDisplacementHeight/2.0))*0.1)"],
    mousePrePerlinScale: ["transformed*=1.-mouseSim.r*.05", "transformed*=1.0-mouseSim.r*0.05"],
    sourceFadeDiplacementName: ["fadeDiplacementScale", "fadeDiplacement"],
    perlinRevealMix: ["mix(transformed,perlinDisplaced,(1.-fadeDiplacement)*.25)", "mix(transformed,perlinDisplaced,(1.0-fadeDiplacement)*0.25)"],
    mouseZTransform: ["mouseTransform*uMouseFactor", "mouseSim.r*15.0*uMouseFactor"],
    sourceWaveDisplacementName: ["floatwaveDisplacement=displacementF*3.0+6.*(1.-revealCombined)", "floatwaveDisplacement=displacementF*3.0+6.0*(1.0-revealCombined)"],
    spreadScale: ["floatspread=3.", "floatspread=3.0"],
    spreadHalfDivide: ["spread/2.0"],
    sourceWorldDivide: ["transformed/=1.-mouseSim.r*.2", "transformed/=1.0-mouseSim.r*0.2"],
    sourceWorldInstanceMatrix: ["worldPosition=instanceMatrix*worldPosition"],
    noBatchingWorldMatrix: ["worldPosition=batchingMatrix*worldPosition"],
    noBatchingParsVertex: ["#include<batching_pars_vertex>"],
    noDisplacementmapParsVertex: ["#include<displacementmap_pars_vertex>"],
    noMorphtargetParsVertex: ["#include<morphtarget_pars_vertex>"],
    noSkinningParsVertex: ["#include<skinning_pars_vertex>"],
    noLogdepthbufParsVertex: ["#include<logdepthbuf_pars_vertex>"],
    noClippingPlanesParsVertex: ["#include<clipping_planes_pars_vertex>"],
    noMorphinstanceVertex: ["#include<morphinstance_vertex>"],
    noMorphcolorVertex: ["#include<morphcolor_vertex>"],
    noBatchingVertex: ["#include<batching_vertex>"],
    noMorphnormalVertex: ["#include<morphnormal_vertex>"],
    noSkinbaseVertex: ["#include<skinbase_vertex>"],
    noSkinnormalVertex: ["#include<skinnormal_vertex>"],
    noMorphtargetVertex: ["#include<morphtarget_vertex>"],
    noSkinningVertex: ["#include<skinning_vertex>"],
    noDisplacementmapVertex: ["#include<displacementmap_vertex>"],
    noProjectVertexInclude: ["#include<project_vertex>"],
    noLogdepthbufVertex: ["#include<logdepthbuf_vertex>"],
    noClippingPlanesVertex: ["#include<clipping_planes_vertex>"],
    sourceManualMvPosition: ["vec4mvPosition=vec4(transformed,1.0);"],
    sourceManualGlPosition: ["gl_Position=projectionMatrix*mvPosition"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const isNegative = name.startsWith("no");
    const sourcePresent = candidates.some((candidate) => source.includes(candidate));
    const rebuildPresent = candidates.some((candidate) => rebuild.includes(candidate));
    return [
      name,
      {
        source: isNegative ? !sourcePresent : sourcePresent,
        rebuild: isNegative ? !rebuildPresent : rebuildPresent,
      },
    ];
  }));
}

function analyzeWorkUvOffsetSourceEvidence(bundle, rebuildShader) {
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  return {
    sourceVaUniformUsesVector2: bundle.includes("uUvOffset:new I(new Q),uUvOffsetScale:new I(1)"),
    sourceGaWritesXYComponents:
      bundle.includes("this.material.customUniforms.uUvOffset.value.x=(this.rayPlane.scale.x-this.plane.scale.x)/2/this.plane.scale.x")
      && bundle.includes("this.material.customUniforms.uUvOffset.value.y=(this.rayPlane.scale.y-this.plane.scale.y)/2/this.plane.scale.y")
      && bundle.includes("this.material.customUniforms.uUvOffsetScale.value=t"),
    rebuildRuntimeShaderUsesVec2: rebuild.includes("uniformvec2uUvOffset"),
    rebuildRuntimeShaderAvoidsVec3: !rebuild.includes("uniformvec3uUvOffset"),
  };
}

function analyzeVaFragmentCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    sourceVaryingUv: ["varyingvec2vUv"],
    sourceVaryingInstanceAlpha: ["varyingfloatvInstanceAlpha"],
    sourceVaryingInstanceIndex: ["varyingfloatvInstanceIndex"],
    sourceVaryingInstanceColor: ["varyingvec3vInstanceColor"],
    sourceVaryingPosition: ["varyingvec3vPosition"],
    sourceVaryingOffset: ["varyingvec3vOffset"],
    sourceRandomName: ["floatrandom(vec2st)"],
    sourceVignetteName: ["floatvignette(vec2coords"],
    noRebuildSourceRandomName: ["sourceRandom"],
    noRebuildSourceVignetteName: ["sourceVignette"],
    noRebuildLocalUv: ["vLocalUv"],
    noRebuildAlphaVarying: ["vAlpha"],
    sourceTailOutput: ["#include<opaque_fragment>", "gl_FragColor=vec4(outgoingLight,diffuseColor.a)"],
    sourceMouseLightness: [
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),(1.-uMouseLightness))",
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),(1.0-uMouseLightness))",
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),1.-uMouseLightness)",
      "mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(mouseF),1.0-uMouseLightness)",
    ],
    sourceAlphaGrid: ["mixedAlpha=((alpha*alpha2)*vInstanceAlpha)", "mixedAlpha=alpha*alpha2*vInstanceAlpha", "floatalpha=alpha1*alpha2*vAlpha"],
    sourceNewUvStepSurface: ["vec2newUv=vUv", "vec2newOffset=vOffset.xy", "newUv.x/=uGridSize.x", "newUv.y/=uGridSize.y", "newUv.x+=newOffset.x", "newUv.y+=newOffset.y"],
    sourceMouseSimVec4: ["vec4mouseSim=texture2D(tMouseSim2,screenUv)", "vec4mouseSim=texture(tMouseSim2,screenUv)"],
    sourceDisplacementSample: ["vec4displacement=texture2D(tDisplacement,newUv)", "vec4displacement=texture(tDisplacement,newUv)"],
    sourceVignetteTemporaries: ["floatvignin=0.01", "floatvignout=0.2", "floatvignfade=6.", "floatfstop=1.0", "vec2center=vec2(0.5,0.5)"],
    sourceVignetteVariables: [
      "floatv=vignette(newUv.xy,center.xy,0.01,0.2,6.,1.0)",
      "floatv=vignette(newUv.xy,center.xy,0.01,0.2,6.0,1.0)",
      "floatv2=vignette(newUv.xy,center.xy,0.01,2.0*pow(revealCombined,.25),6.,1.0)",
      "floatv2=vignette(newUv.xy,center.xy,0.01,2.0*pow(revealCombined,0.25),6.0,1.0)",
    ],
    sourceRevealRadius: ["2.0*pow(revealCombined,.25)", "2.0*pow(revealCombined,0.25)"],
    sourceMouseAlpha: [
      "mixedAlpha+=clamp(mouseSim.r*(uMouseFactor*0.5),0.,1.)",
      "mixedAlpha+=clamp(mouseSim.r*(uMouseFactor*0.5),0.0,1.0)",
      "clamp(simLight*(uMouseFactor*.5),0.,1.)",
      "clamp(simLight*(uMouseFactor*0.5),0.0,1.0)",
    ],
    sourceSpecularMacro: ["USE_SPECULARCOLORMAP", "USE_SPECULARINTENSITYMAP"],
    modernSpecularMacro: ["USE_SPECULAR_COLORMAP", "USE_SPECULAR_INTENSITYMAP"],
    sourceSheenMapMacro: ["USE_SHEENCOLORMAP", "USE_SHEENROUGHNESSMAP"],
    modernSheenMapMacro: ["USE_SHEEN_COLORMAP", "USE_SHEEN_ROUGHNESSMAP"],
    modernPhysicalResidual: ["USE_DISPERSION", "USE_ANISOTROPY"],
    sheenDeclaration: ["USE_SHEEN"],
    r164SheenOutgoingTail: ["sheenEnergyComp", "outgoingLight=outgoingLight*sheenEnergyComp+sheenSpecularDirect+sheenSpecularIndirect"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const isNegative = name.startsWith("no");
    const sourcePresent = candidates.some((candidate) => source.includes(candidate));
    const rebuildPresent = candidates.some((candidate) => rebuild.includes(candidate));
    return [
      name,
      {
        source: isNegative ? !sourcePresent : sourcePresent,
        rebuild: isNegative ? !rebuildPresent : rebuildPresent,
      },
    ];
  }));
}

function analyzeVaBridgeCompatibility(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const lightsPhysical = normalizeShaderForCoreChecks(ShaderChunk.lights_physical_fragment || "");
  const sourceHasOldSpecularDefine = source.includes("#ifdefPHYSICAL#defineIOR#defineSPECULAR#endif");
  const rebuildHasR164SpecularDefine = rebuild.includes("#ifdefPHYSICAL#defineIOR#defineUSE_SPECULAR#endif");
  const lightsPhysicalRequiresUseSpecular = lightsPhysical.includes("#ifdefUSE_SPECULAR");
  const lightsPhysicalAcceptsOldSpecular = lightsPhysical.includes("#ifdefSPECULAR");
  return {
    sourceHasOldSpecularDefine,
    rebuildHasR164SpecularDefine,
    lightsPhysicalRequiresUseSpecular,
    lightsPhysicalAcceptsOldSpecular,
    mapMacroSurfaceAligned: {
      source: source.includes("USE_SPECULARCOLORMAP") && source.includes("USE_SPECULARINTENSITYMAP"),
      rebuild: rebuild.includes("USE_SPECULARCOLORMAP") && rebuild.includes("USE_SPECULARINTENSITYMAP"),
    },
    modernMapMacroSurfaceAbsent: {
      source: !source.includes("USE_SPECULAR_COLORMAP") && !source.includes("USE_SPECULAR_INTENSITYMAP"),
      rebuild: !rebuild.includes("USE_SPECULAR_COLORMAP") && !rebuild.includes("USE_SPECULAR_INTENSITYMAP"),
    },
    r164PhysicalBranchesStripped: {
      rebuild: !rebuild.includes("USE_DISPERSION") && !rebuild.includes("USE_ANISOTROPY") && !rebuild.includes("sheenEnergyComp"),
    },
    classification: sourceHasOldSpecularDefine
      && rebuildHasR164SpecularDefine
      && lightsPhysicalRequiresUseSpecular
      && !lightsPhysicalAcceptsOldSpecular
      ? "r164-compile-bridge"
      : "needs-review",
  };
}

function analyzeEnvironmentCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    skyUvOffset: ["skyUv.x+=.5;skyUv2.x-=.75", "skyUv.x+=0.5;skyUv2.x-=0.75"],
    tSkySamples: ["texture(tSky,(skyUv*2.))", "texture(tSky,skyUv*2.0)", "texture(tSky,skyUv*2.)"],
    inertMaskColor: ["vec3maskColor=vec3(1.0,1.0,1.0)"],
    smoothMaskBands: [
      "m=max(m,smoothMask(vUv.x,.5,0.01));m=m*1.-smoothMask(vUv.x,.75,0.02)",
      "m=max(m,smoothMask(vUv.x,0.5,0.01));m=m*1.0-smoothMask(vUv.x,0.75,0.02)",
    ],
    colorDodgeBlend: ["diffuseColor.rgb=blend(4,diffuseColor.rgb,noiseMixed.rgb,0.5)"],
    negationBlend: ["diffuseColor.rgb=blend(16,diffuseColor.rgb,noiseMixed.rgb,skyMask)"],
    verticalWhiteBand: [
      "diffuseColor.rgb+=vec3(smoothstep(vUv.y,.45,.595))",
      "diffuseColor.rgb+=vec3(smoothstep(vUv.y,0.45,0.595))",
    ],
    whiteMix: [
      "diffuseColor.rgb=mix(vec3(1.0,1.0,1.0),diffuseColor.rgb,skyMask2*1.5)",
      "diffuseColor.rgb=mix(vec3(1.0),diffuseColor.rgb,skyMask2*1.5)",
    ],
    clampSquare: ["diffuseColor.rgb*=clamp(diffuseColor.rgb,vec3(0.0),vec3(1.0))"],
    indirectDiffuseOnly: ["vec3totalDiffuse=reflectedLight.indirectDiffuse"],
    inertBlack: ["vec3black=vec3(0.095,0.095,0.095)"],
    darkenColorDodgeTail: ["gl_FragColor.rgb=blend(4,gl_FragColor.rgb,uDarkenColor,uDarken)"],
    sourceFullBlendDispatcher: ["if(mode==25){returnblendVividLight(base,blend,opacity);}"],
    sourceOilHelperSurface: ["vec4oil(vec2uv,floattime,floatstrength)"],
    sourceSimplexNoiseSurface: ["floatsnoise(vec2v)"],
    sourceRoughnessHelperSurface: ["floatcustomRoughness(floatroughness,vec2vUv,floatsize,floattime)", "floatrandomF(vec2st)"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => [
    name,
    {
      source: candidates.some((candidate) => source.includes(candidate)),
      rebuild: candidates.some((candidate) => rebuild.includes(candidate)),
    },
  ]));
}

function analyzeSkyCompositeCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    uvTemporary: ["vec2uv=vUv"],
    sourceNoiseTemporary: ["vec4noise=noiseShader(pos,uTime,uShader1Speed*.1)", "vec4noise=noiseShader(pos,uTime,uShader1Speed*0.1)"],
    sourceContrastFunction: ["vec3contrast(vec3color,floatamount)"],
    blendReflectNoise: ["diffuseColor.rgb=blendReflect(diffuseColor.rgb,noise.rgb,.5)", "diffuseColor.rgb=blendReflect(diffuseColor.rgb,noise.rgb,0.5)"],
    contrastCall: ["diffuseColor.rgb=contrast(diffuseColor.rgb,2.)", "diffuseColor.rgb=contrast(diffuseColor.rgb,2.0)"],
    multiplyStep: ["diffuseColor.rgb=diffuseColor.rgb*2.", "diffuseColor.rgb=diffuseColor.rgb*2.0"],
    sourceOutput: ["FragColor=vec4(.9-diffuseColor.rgb,1.)", "FragColor=vec4(0.9-diffuseColor.rgb,1.0)"],
    sourceSkyBlendSurface: ["vec3blendColorBurn(vec3base,vec3blend,floatopacity)", "vec3blendNegation(vec3base,vec3blend,floatopacity)", "vec3blendReflect(vec3base,vec3blend,floatopacity)"],
    sourceOilHelperSurface: ["vec4oil(vec2uv,floattime,floatstrength)"],
    sourceSimplexNoiseSurface: ["floatsnoise(vec2v)"],
    sourceRoughnessHelperSurface: ["floatcustomRoughness(floatroughness,vec2vUv,floatsize,floattime)", "floatrandomF(vec2st)"],
    noRebuildProceduralName: ["vec4procedural="],
    noRebuildContrastColorName: ["contrastColor("],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const sourceHas = candidates.some((candidate) => source.includes(candidate));
    const rebuildHas = candidates.some((candidate) => rebuild.includes(candidate));
    const isNegative = name.startsWith("noRebuild");
    return [
      name,
      {
        source: isNegative ? !sourceHas : sourceHas,
        rebuild: isNegative ? !rebuildHas : rebuildHas,
      },
    ];
  }));
}

function analyzeFloorCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    colorMapBranch: ["#ifdefUSE_MAP"],
    normalMapBranch: ["#ifdefUSE_NORMALMAP"],
    normalDistortion: ["normalColor.r*uNormalDistortionStrength-(uNormalDistortionStrength/2.)", "normalColor.r*uNormalDistortionStrength-(uNormalDistortionStrength/2.0)"],
    sourceDistortedUvName: ["vec2uv=coord.xy+coord.z*normal.xz*0.05"],
    sourceDistortedUvSample: ["texture(tReflect,uv)"],
    projectedRawReflect: ["textureProj(tReflect,vCoord)"],
    normalDistortedReflect: ["coord.xy+coord.z*normal.xz*0.05"],
    fresnelReflectance: ["pow((1.-theta),5.)", "pow((1.0-theta),5.0)"],
    floorMix: ["color.rgb*((1.-min(1.,uMirror))+reflectColor.rgb*uFloorMixStrength)", "color.rgb*((1.0-min(1.0,uMirror))+reflectColor.rgb*uFloorMixStrength)"],
    fogBranch: ["#ifdefUSE_FOG"],
    ditheringBranch: ["#ifdefDITHERING"],
    ditherCall: ["dither(FragColor.rgb)"],
    noRebuildReflectUvName: ["reflectUv"],
    fragColor: ["FragColor.rgb=", "FragColor=vec4"],
  };
  return Object.fromEntries(Object.entries(checks).map(([name, candidates]) => {
    const sourceHas = candidates.some((candidate) => source.includes(candidate));
    const rebuildHas = candidates.some((candidate) => rebuild.includes(candidate));
    const isNegative = name.startsWith("noRebuild");
    return [
      name,
      {
        source: isNegative ? !sourceHas : sourceHas,
        rebuild: isNegative ? !rebuildHas : rebuildHas,
      },
    ];
  }));
}

function analyzeFloorBlurCore(sourceShader, rebuildShader) {
  if (!sourceShader) return null;
  const source = normalizeShaderForCoreChecks(sourceShader);
  const rebuild = normalizeShaderForCoreChecks(rebuildShader);
  const checks = {
    glsl3Input: ["invec2vUv"],
    mappedSampleName: ["vec4tMapped=texture(tMap,vUv)"],
    distanceMask: ["smootherstep(1.0,0.0,vUv.y)*uDirection"],
    blurCall: ["blur(tMap,vUv,uResolution,distance)"],
    mixAmount: ["FragColor=mix(tMapped,blurred,1.25)"],
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
const sourceZ = expandSourceTemplate(bundle, extractSourceShader(bundle, "zA", "`,HA=`"));
const sourceH = expandSourceTemplate(bundle, extractSourceShader(bundle, "HA", "`;class VA extends"));
const sourceStandardBlurFragment = (() => {
  const helper = tryExtractSourceShader(bundle, "og");
  const fragment = tryExtractSourceShader(bundle, "zT");
  return helper && fragment ? expandSourceTemplate(bundle, fragment.replace("${og}", helper)) : expandSourceTemplate(bundle, fragment);
})();
const sourceFragmentShaders = {
  "VA-work": sourceZ,
  "A1-pre-composite": sourceShader(bundle, "A1"),
  "Lu-main-composite": sourceShader(bundle, "aA"),
  "OA-work-composite": sourceShader(bundle, "CA"),
  "x1-thumb-composite": sourceShader(bundle, "v1"),
  "M1-thumb-plane": sourceShader(bundle, "S1"),
  "j1-media-composite": sourceShader(bundle, "G1"),
  "sg-luminosity": sourceShader(bundle, "NT"),
  "Na-standard-blur": sourceStandardBlurFragment,
  "rg-bloom-blur": sourceShader(bundle, "kT"),
  "cg-bloom-composite": sourceShader(bundle, "nA"),
  "ig-fxaa": sourceShader(bundle, "UT"),
  "L1-lensflare": sourceShader(bundle, "P1"),
  "N1-displacement-composite": sourceShader(bundle, "F1"),
  "ag-advection": sourceShader(bundle, "Sf"),
  "ag-advection-bounds": sourceShader(bundle, "Sf"),
  "ag-force": sourceShader(bundle, "$T"),
  "ag-divergence": sourceShader(bundle, "WT"),
  "ag-poisson": sourceShader(bundle, "YT"),
  "ag-pressure": sourceShader(bundle, "ZT"),
  "UD-project-media": sourceShader(bundle, "LD"),
  "z1-sky-composite": sourceShader(bundle, "B1"),
  "u1-environment": sourceShader(bundle, "l1"),
  "o1-floor-material": sourceShader(bundle, "s1"),
  "t1-floor-reflection-blur": sourceShader(bundle, "QA"),
};
const sourceVertexShaders = {
  "VA-work": sourceH,
  "M1-thumb-plane": sourceShader(bundle, "b1"),
  "z1-sky-composite": sourceShader(bundle, "tl"),
  "x1-thumb-composite": sourceShader(bundle, "tl"),
  "sg-luminosity": sourceShader(bundle, "OT"),
  "Na-standard-blur": sourceShader(bundle, "HT"),
  "rg-bloom-blur": sourceShader(bundle, "BT"),
  "cg-bloom-composite": sourceShader(bundle, "iA"),
  "ig-fxaa": sourceShader(bundle, "FT"),
  "L1-lensflare": sourceShader(bundle, "R1"),
  "N1-displacement-composite": sourceShader(bundle, "tl"),
  "ag-advection": sourceShader(bundle, "Co"),
  "ag-advection-bounds": sourceShader(bundle, "VT"),
  "ag-force": sourceShader(bundle, "XT"),
  "ag-divergence": sourceShader(bundle, "Co"),
  "ag-poisson": sourceShader(bundle, "Co"),
  "ag-pressure": sourceShader(bundle, "Co"),
  "o1-floor-material": sourceShader(bundle, "r1"),
  "t1-floor-reflection-blur": sourceShader(bundle, "e1"),
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
      compositeCoreChecks: analyzeCompositeCore(sourceFragment, entry.fragmentShader, entry.name),
      rgBlurCoreChecks: entry.name === "rg-bloom-blur" ? analyzeRgBlurCore(sourceFragment, entry.fragmentShader) : null,
      standardBlurCoreChecks: entry.name === "Na-standard-blur" ? analyzeStandardBlurCore(sourceFragment, entry.fragmentShader) : null,
      lensflareCoreChecks: entry.name === "L1-lensflare" ? analyzeLensflareCore(sourceFragment, entry.fragmentShader) : null,
      thumbPlaneCoreChecks: entry.name === "M1-thumb-plane" ? analyzeThumbPlaneCore(sourceVertex, sourceFragment, entry.vertexShader, entry.fragmentShader) : null,
      igFxaaCoreChecks: entry.name === "ig-fxaa" ? analyzeIgFxaaCore(sourceVertex, sourceFragment, entry.vertexShader, entry.fragmentShader) : null,
      vaFragmentCoreChecks: entry.name === "VA-work" ? analyzeVaFragmentCore(sourceFragment, entry.fragmentShader) : null,
      vaBridgeCompatibility: entry.name === "VA-work" ? analyzeVaBridgeCompatibility(sourceFragment, entry.fragmentShader) : null,
      skyCompositeCoreChecks: entry.name === "z1-sky-composite" ? analyzeSkyCompositeCore(sourceFragment, entry.fragmentShader) : null,
      environmentCoreChecks: entry.name === "u1-environment" ? analyzeEnvironmentCore(sourceFragment, entry.fragmentShader) : null,
      floorCoreChecks: entry.name === "o1-floor-material" ? analyzeFloorCore(sourceFragment, entry.fragmentShader) : null,
      floorBlurCoreChecks: entry.name === "t1-floor-reflection-blur" ? analyzeFloorBlurCore(sourceFragment, entry.fragmentShader) : null,
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
  const uvOffsetSourceEvidence = analyzeWorkUvOffsetSourceEvidence(bundle, workDump.vertexShader);
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
      uvOffsetSourceEvidence,
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
      lightsPhysicalFragment: {
        length: chunkAnalysis.lightsPhysicalFragment.length,
        checks: chunkAnalysis.lightsPhysicalFragment.checks,
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
        rgBlurCoreChecks: analysis.rgBlurCoreChecks,
        standardBlurCoreChecks: analysis.standardBlurCoreChecks,
        lensflareCoreChecks: analysis.lensflareCoreChecks,
        igFxaaCoreChecks: analysis.igFxaaCoreChecks,
        vaFragmentCoreChecks: analysis.vaFragmentCoreChecks,
        vaBridgeCompatibility: analysis.vaBridgeCompatibility,
        skyCompositeCoreChecks: analysis.skyCompositeCoreChecks,
        environmentCoreChecks: analysis.environmentCoreChecks,
        floorCoreChecks: analysis.floorCoreChecks,
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
  process.env.IN_DIR = outDir;
  await import("./summarize-phase1-shader-gaps.mjs");
  console.log(JSON.stringify(summary, null, 2));
  ws.close();
} finally {
  chrome.kill("SIGTERM");
}

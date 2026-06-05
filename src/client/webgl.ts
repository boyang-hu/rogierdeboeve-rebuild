import {
  AdditiveBlending,
  Color,
  DataTexture,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RGBAFormat,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  VideoTexture,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";

type ProjectPayload = {
  slug?: string;
  color?: string;
  secondary?: string;
  invert?: string;
  mediaColor?: string;
  thumb?: string;
  ambient?: string | number;
  darkness?: string | number;
  overviewDarkness?: string | number;
  thumbDarkness?: string | number;
  darknessColor?: string;
  saturation?: string | number;
  contrast?: string | number;
  mouseLightness?: string | number;
  spotlight?: string | number;
  blocks?: string;
};

type WorkItem = {
  slug: string;
  payload: ProjectPayload;
  group: Group;
  material: ShaderMaterial;
  mesh: InstancedMesh;
  thumb: Mesh<PlaneGeometry, ShaderMaterial>;
  reveal: number;
};

type MediaPlane = {
  track: HTMLElement;
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  material: ShaderMaterial;
  src: string;
  type: string;
  translation: Vector2;
  offset: Vector2;
  loaded: boolean;
  video?: HTMLVideoElement;
  texture?: Texture;
};

const BREAKPOINT_LG = 1000;
const BREAKPOINT_MD = 800;
const DEFAULT_BG = "#141414";
const DEFAULT_COLOR = "#bcbcbc";
const GRID_COLS = 35;
const GRID_ROWS = 23;
const GRID_LAYERS = 7;
const GRID_CUBE_SIZE = 1.25;
const GRID_SPACING = 0.1;
const GRID_SCALE = 0.09;

const projectMediaVertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const projectMediaFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uMapSize;
uniform vec2 uContainerSize;
uniform float uCameraDistance;
uniform float uRadius;
uniform vec3 uBackgroundColor;
uniform float uReveal;
uniform float uSceneOpacity;

varying vec2 vUv;

vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 size) {
  vec2 s = size;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((newSize.x - s.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - s.y) / 2.0)) / newSize;
  vec2 uv = ouv * s / newSize + newOffset;
  return texture2D(tex, uv);
}

float udRoundBox(vec2 p, vec2 b, float r) {
  return length(max(abs(p) - b + r, 0.0)) - r;
}

void main() {
  float parallax = uCameraDistance * 0.0001;
  vec2 uv = vUv;
  uv.y -= parallax;

  vec4 color = coverTexture(tMap, uMapSize, uv, uContainerSize);
  color.rgb = max(color.rgb, vec3(0.02));

  vec2 res = uContainerSize;
  vec2 halfRes = 0.5 * res;
  float rounded = udRoundBox(vUv.xy * res - halfRes, halfRes, uRadius);
  float mask = 1.0 - smoothstep(0.0, 1.0, rounded);

  color.rgb = mix(color.rgb, uBackgroundColor, 1.0 - uReveal);
  gl_FragColor = vec4(color.rgb, mask * uSceneOpacity);
}
`;

const workBlockVertex = `
attribute vec3 instanceGrid;
attribute float instanceAlpha;
attribute vec3 instanceColor;

varying vec2 vThumbUv;
varying float vAlpha;
varying float vReveal;
varying vec3 vColorSeed;
varying vec3 vLocalNormal;
varying vec2 vSpotUv;
varying float vSpotMask;

uniform vec3 uGridSize;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
uniform float uRevealSpread;
uniform float uRevealSpreadSides;
uniform float uMouseFactor;
uniform vec2 uPointer;
uniform vec2 uMouseUvOffset;
uniform float uMouseUvScale;
uniform sampler2D tMouseSim;
uniform sampler2D tDisplacement;
uniform sampler2D tPerlin;
uniform vec3 uSpotLightPosition;
uniform float uSpotConeTan;
uniform float uSpotIntensity;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec3 transformed = position;
  vec4 instancePos = instanceMatrix[3];
  float revealMask = uReveal * uRevealProject;
  float toCenter = length(instancePos.xy);

  float fadeScale = (revealMask * 5.75) - (toCenter * (revealMask / 5.75));
  float fade = clamp(fadeScale, 0.0, 1.05);
  float fadeDisplacementScale = (revealMask * 4.85) - (toCenter * (revealMask / 4.85));
  float fadeDisplacement = clamp(fadeDisplacementScale, -1.0, 1.0);
  vec4 displacementMap = texture2D(tDisplacement, instanceGrid.xy);
  vec4 perlinMap = texture2D(tPerlin, instanceGrid.xy * 0.75 - uTime * 0.05);
  float perlin = mix(noise(instanceGrid.xy * 12.0 - uTime * 0.05), perlinMap.r, 0.72);
  float wave = sin(instanceGrid.x * 24.0 + instanceGrid.y * 13.0 - uTime * 0.8) * 0.5 + 0.5;
  float displacement = mix(mix(perlin, wave, 0.35), displacementMap.r, 0.58);
  float perlinHeight = 10.0;

  vec3 perlinDisplaced = transformed;
  perlinDisplaced.z += displacement * perlinHeight - perlinHeight * 0.5;
  perlinDisplaced *= min(1.0, 1.0 - ((displacement * perlinHeight) - perlinHeight * 0.5) * 0.1);
  transformed = mix(transformed, perlinDisplaced, (1.0 - fadeDisplacement) * 10.25);
  transformed *= fade * uRevealSides;

  vec2 mouseUv = (instanceGrid.xy + uMouseUvOffset) / uMouseUvScale;
  float mouse = texture2D(tMouseSim, mouseUv).r;
  transformed *= 1.0 - mouse * 0.05;
  transformed.z -= 1.5;
  transformed.z += displacement * 3.0 + 9.0 * (1.0 - revealMask);
  transformed.z += mouse * 15.0 * uMouseFactor;
  transformed *= 1.0 - displacement * 0.1;

  vec3 transformedSpread = transformed;
  float spread = 3.0;
  transformedSpread.x -= instanceColor.x * spread;
  transformedSpread.x += spread * 0.5;
  transformedSpread.y -= instanceColor.y * spread;
  transformedSpread.y += spread * 0.5;
  transformedSpread.z -= instanceColor.z * spread;
  transformedSpread.z += spread * 0.5;
  transformed = mix(transformedSpread, transformed, uRevealSpreadSides);
  transformed = mix(transformedSpread, transformed, 1.0 - uRevealSpread);

  vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
  vec4 worldPosition = modelMatrix * mvPosition;
  vec3 fromLight = worldPosition.xyz - uSpotLightPosition;
  float lightDepth = max(0.001, -fromLight.z);
  vec2 spotUv = fromLight.xy / (lightDepth * uSpotConeTan) * 0.5 + 0.5;
  vec2 spotDelta = spotUv - 0.5;
  float spotRadius = length(spotDelta);
  float coneMask = 1.0 - smoothstep(0.42, 0.5, spotRadius);
  float depthMask = smoothstep(0.0, 0.9, lightDepth) * (1.0 - smoothstep(12.0, 17.0, lightDepth));
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

  vThumbUv = instanceGrid.xy;
  vAlpha = instanceAlpha;
  vReveal = revealMask;
  vColorSeed = instanceColor;
  vLocalNormal = normalize(normal);
  vSpotUv = spotUv;
  vSpotMask = coneMask * depthMask * uSpotIntensity;
}
`;

const workBlockFragment = `
precision highp float;

uniform sampler2D tThumb;
uniform vec2 uMapSize;
uniform vec3 uTint;
uniform vec3 uBlockColor;
uniform vec3 uDarknessColor;
uniform float uDarkness;
uniform float uSaturation;
uniform float uContrast;
uniform float uMouseLightness;
uniform vec2 uPointer;
uniform sampler2D tMouseSim;
uniform sampler2D tMouseSim2;
uniform vec2 uCoords;

varying vec2 vThumbUv;
varying float vAlpha;
varying float vReveal;
varying vec3 vColorSeed;
varying vec3 vLocalNormal;
varying vec2 vSpotUv;
varying float vSpotMask;

vec3 saturateColor(vec3 color, float amount) {
  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(gray), color, amount);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float vignette(vec2 uv, vec2 center, float inner, float outer) {
  return smoothstep(outer, inner, distance(uv, center));
}

float sourceVignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}

void main() {
  vec2 uv = vThumbUv;
  vec2 projectedUv = (uv - 0.5) * 0.36 + 0.5;
  vec3 gridThumb = mix(texture2D(tThumb, uv).rgb, texture2D(tThumb, projectedUv).rgb, 0.52);
  vec3 spotThumb = texture2D(tThumb, vSpotUv).rgb;
  float spotMask = vSpotMask * smoothstep(0.0, 0.08, vSpotUv.x) * smoothstep(1.0, 0.92, vSpotUv.x) * smoothstep(0.0, 0.08, vSpotUv.y) * smoothstep(1.0, 0.92, vSpotUv.y);
  vec3 thumb = mix(gridThumb, spotThumb, spotMask * 0.82);
  thumb = (thumb - 0.5) * uContrast + 0.5;
  thumb = saturateColor(thumb, uSaturation);
  float lum = dot(thumb, vec3(0.2126, 0.7152, 0.0722));
  float centerMask = pow(vignette(uv, vec2(0.5), 0.02, 0.72), 1.45);
  float spotCenter = pow(1.0 - smoothstep(0.0, 0.5, length(vSpotUv - 0.5)), 1.8) * spotMask;
  float neutral = 1.0 - smoothstep(0.04, 0.22, length(thumb - vec3(lum)));
  float centeredLum = lum * (0.28 + centerMask * 1.15 + spotCenter * 2.35);
  float lightMask = smoothstep(0.14, 0.66, centeredLum);
  float logoMask = smoothstep(0.18, 0.56, lum) * neutral * max(centerMask, spotCenter);
  lightMask = max(lightMask * (0.16 + centerMask * 0.72 + spotCenter * 1.45), logoMask * 1.25);
  float hotMask = max(smoothstep(0.38, 0.82, centeredLum), logoMask);

  float faceLight = clamp(dot(normalize(vLocalNormal), normalize(vec3(-0.35, 0.62, 0.72))) * 0.5 + 0.5, 0.45, 1.2);
  vec3 base = mix(vec3(0.026, 0.031, 0.04), uBlockColor, 0.26);
  vec3 projection = mix(uTint * (0.38 + lightMask * 1.8), thumb * (1.65 + spotMask * 0.9), 0.45 + spotMask * 0.22);
  vec3 color = mix(base, projection, 0.42 + lightMask * 0.52);
  color += thumb * (0.14 + lightMask * 1.12 + spotMask * 0.72);
  color += vec3(1.0) * hotMask * 1.25;
  color += uTint * pow(max(lightMask, 0.0), 1.65) * 0.58;
  color = mix(color, uTint, 0.035 + lightMask * 0.08);
  color = mix(color, uDarknessColor, uDarkness * (0.06 + (1.0 - lum) * 0.16));
  color *= faceLight;

  vec2 pointerUv = uPointer * 0.5 + 0.5;
  vec2 screenUv = gl_FragCoord.xy / max(uCoords, vec2(1.0));
  float pointerLight = 1.0 - smoothstep(0.02, 0.58, distance(uv, pointerUv));
  float simLight = texture2D(tMouseSim2, screenUv).r;
  float mouseLight = max(pointerLight, simLight);
  color *= 0.72 + mouseLight * uMouseLightness * 0.24;
  color += pow(max(0.0, 1.0 - length(uv - 0.5) * 1.65), 2.0) * 0.12;

  vec2 gridUv = floor(uv * vec2(35.0, 23.0));
  vec2 gridUv2 = floor(uv.yx * vec2(23.0, 35.0));
  float alpha = random(gridUv + vColorSeed.xy) * random(gridUv2 + vColorSeed.yz) * vAlpha;
  float revealCombined = clamp(vReveal, 0.0, 1.0);
  float revealRadius = 2.0 * pow(max(revealCombined, 0.0001), 0.25);
  float centerAlpha = sourceVignette(uv, vec2(0.5), 0.01, 0.2, 6.0, 1.0);
  float revealAlpha = sourceVignette(uv, vec2(0.5), 0.01, revealRadius, 6.0, 1.0);
  alpha += centerAlpha * 0.1;
  alpha -= 1.0 - revealAlpha;
  alpha += clamp(mouseLight * uMouseLightness * 0.08, 0.0, 0.18);
  alpha = max(alpha, logoMask * revealCombined * 0.32);
  alpha *= revealCombined * clamp(vAlpha + 0.35, 0.0, 1.0);

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
}
`;

const homeCompositeFragment = `
precision highp float;

uniform sampler2D tWork;
uniform sampler2D tBloom;
uniform sampler2D tMouseSim;
uniform sampler2D tNoise;
uniform sampler2D tPerlin;
uniform float uTime;
uniform float uRatio;
uniform float uProgress;
uniform float uTransformX;
uniform float uReveal;
uniform float uFluidStrength;
uniform float uContrast;
uniform float uDarken;
uniform float uSaturation;
uniform vec3 uBgColor;
uniform vec3 uActiveColor;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    f += a * noise(p);
    p = p * 2.02 + 13.17;
    a *= 0.5;
  }
  return f;
}

vec3 contrast(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}

vec3 saturation(vec3 color, float amount) {
  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(gray), color, amount);
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
  return max(blend, base) * opacity + base * (1.0 - opacity);
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return base * blend * opacity + base * (1.0 - opacity);
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
  return min(base + blend, vec3(1.0)) * opacity + base * (1.0 - opacity);
}

vec4 rgbshift(sampler2D tex, vec2 uv, float angle, float amount) {
  vec2 offset = vec2(cos(angle), sin(angle)) * amount;
  float r = texture2D(tex, uv + offset).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - offset).b;
  float a = texture2D(tex, uv).a;
  return vec4(r, g, b, a);
}

float vignette(vec2 uv, float inner, float outer) {
  vec2 p = uv - 0.5;
  p.x *= uRatio;
  return smoothstep(outer, inner, length(p));
}

vec3 brightBloom(sampler2D tex, vec2 uv, vec2 texel) {
  vec3 bloom = vec3(0.0);
  bloom += max(texture2D(tex, uv + texel * vec2(4.0, 0.0)).rgb - 0.18, vec3(0.0)) * 0.18;
  bloom += max(texture2D(tex, uv - texel * vec2(4.0, 0.0)).rgb - 0.18, vec3(0.0)) * 0.18;
  bloom += max(texture2D(tex, uv + texel * vec2(0.0, 4.0)).rgb - 0.18, vec3(0.0)) * 0.18;
  bloom += max(texture2D(tex, uv - texel * vec2(0.0, 4.0)).rgb - 0.18, vec3(0.0)) * 0.18;
  bloom += max(texture2D(tex, uv + texel * vec2(9.0, 6.0)).rgb - 0.12, vec3(0.0)) * 0.12;
  bloom += max(texture2D(tex, uv + texel * vec2(-9.0, 6.0)).rgb - 0.12, vec3(0.0)) * 0.12;
  bloom += max(texture2D(tex, uv + texel * vec2(9.0, -6.0)).rgb - 0.12, vec3(0.0)) * 0.12;
  bloom += max(texture2D(tex, uv + texel * vec2(-9.0, -6.0)).rgb - 0.12, vec3(0.0)) * 0.12;
  return bloom;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  p.x *= uRatio;

  vec4 mouseSim = texture2D(tMouseSim, uv);
  vec2 perlinUv = uv * 0.25;
  perlinUv -= 0.5;
  perlinUv.x *= uRatio;
  perlinUv += 0.5;
  perlinUv.x -= uTime * 0.01;
  perlinUv.y -= uTime * 0.005;
  perlinUv.x += uTransformX;

  vec4 perlinMap = texture2D(tPerlin, perlinUv);
  perlinMap.rgb = contrast(perlinMap.rgb, 5.0);
  float proceduralPerlin = fbm(perlinUv * 6.0);
  float perlin = mix(proceduralPerlin, perlinMap.b, 0.72);
  vec2 perlinCoords = uv + perlin * 0.1 - 0.0065;
  vec2 flowVector = vec2(mouseSim.g - 0.5, mouseSim.b - 0.5);
  vec2 fluidUv = uv + flowVector * -0.2 * uFluidStrength;
  vec2 sourceUv = fluidUv;

  float flow = fbm(p * 2.3 + vec2(uTime * -0.035 + uTransformX, uTime * -0.018));
  float rings = abs(1.0 / (sin(pow(length(p) * 0.9, 0.25) - uTime * 0.35 + sin(length(p) * 0.8 - 1.6)) * 10.8)) - 0.1;
  float perlinVignette = vignette(perlinCoords, 0.1, 0.35);
  float displacementVignette = vignette(sourceUv, 0.1, 0.5);
  vec4 sampledMouse = texture2D(tMouseSim, mix(perlinCoords, sourceUv, 2.5));
  sampledMouse.rgb = contrast(sampledMouse.rgb, 1.0);
  vec4 workBase = texture2D(tWork, sourceUv);
  vec4 sceneDisplaced = rgbshift(tWork, sourceUv, -1.0, 0.005);
  vec4 workShift = rgbshift(tWork, sourceUv, -1.0, 0.0005 + 0.1 * length(flowVector) * uFluidStrength);
  vec4 glowX = texture2D(tWork, uv + vec2(0.006, 0.0)) + texture2D(tWork, uv - vec2(0.006, 0.0));
  vec4 glowY = texture2D(tWork, uv + vec2(0.0, 0.006)) + texture2D(tWork, uv - vec2(0.0, 0.006));
  vec3 glow = max(vec3(0.0), (glowX.rgb + glowY.rgb) * 0.25 - vec3(0.22));
  vec3 bloom = texture2D(tBloom, uv).rgb;
  vec3 bloomShift = rgbshift(tBloom, uv, length(uv + 0.5), 0.005).rgb;
  vec3 work = mix(workShift.rgb, sceneDisplaced.rgb, 1.0 - displacementVignette);

  vec3 deep = mix(uBgColor, vec3(0.015, 0.018, 0.032), 0.68);
  vec3 accent = mix(uActiveColor, uAmbientColor, clamp(uAmbientIntensity, 0.0, 1.4) * 0.28);
  vec3 color = deep;
  color = mix(color, accent, 0.18 + flow * 0.26);
  color += accent * rings * 0.08 * uFluidStrength;
  color *= 0.52 + vignette(uv, 0.05, 0.84) * 0.98;

  float workMask = clamp(workBase.a * 1.25, 0.0, 1.0);
  color = mix(color, work, workMask);
  color += glow * (0.24 + uFluidStrength * 0.18);
  color += rgbshift(tWork, sourceUv, -1.5, 0.02).rgb * 0.08;
  color += bloom;
  color += bloomShift;
  color += sampledMouse.rgb * 0.065;
  color = mix(color, color * 5.0, (1.0 - perlinVignette) * 0.075);
  color = blendAdd(color, perlinMap.rgb, (1.0 - displacementVignette + sampledMouse.r * 0.5) * 0.05);
  color = contrast(color, uContrast);
  color *= uContrast;
  color = saturation(color, uSaturation);
  color = blendLighten(color, uBgColor, 0.85);

  vec2 noiseUv = uv - 0.5;
  noiseUv.x *= uRatio;
  noiseUv += 0.5;
  noiseUv *= 15.0;
  vec3 noiseMap = texture2D(tNoise, noiseUv).rgb;
  color = mix(color * noiseMap, color, 0.75);
  color = mix(color * noiseMap, color, 1.5);
  color = blendMultiply(color, vec3(0.095), uDarken * 2.0 + mouseSim.r * 0.25 * uDarken);
  color = blendLighten(color, vec3(0.095), 1.0);
  color = saturation(color, uSaturation);
  color = mix(uBgColor, color, uReveal);

  gl_FragColor = vec4(color, 1.0);
}
`;

const homeBloomFragment = `
precision highp float;

uniform sampler2D tScene;
uniform vec2 uTexel;
uniform float uRadius;

varying vec2 vUv;

vec3 thresholdBloom(vec2 uv) {
  vec3 color = texture2D(tScene, uv).rgb;
  float luma = dot(color, vec3(0.2125, 0.7154, 0.0721));
  float mask = smoothstep(0.1, 1.05, luma);
  return max(color - vec3(0.1), vec3(0.0)) * mask;
}

void main() {
  vec3 color = thresholdBloom(vUv) * 0.24;
  color += thresholdBloom(vUv + uTexel * vec2(uRadius, 0.0)) * 0.16;
  color += thresholdBloom(vUv - uTexel * vec2(uRadius, 0.0)) * 0.16;
  color += thresholdBloom(vUv + uTexel * vec2(0.0, uRadius)) * 0.16;
  color += thresholdBloom(vUv - uTexel * vec2(0.0, uRadius)) * 0.16;
  color += thresholdBloom(vUv + uTexel * vec2(2.0, 1.5) * uRadius) * 0.08;
  color += thresholdBloom(vUv + uTexel * vec2(-2.0, 1.5) * uRadius) * 0.08;
  color *= 0.15;
  gl_FragColor = vec4(color, 1.0);
}
`;

const projectionFragment = `
precision highp float;

uniform sampler2D tThumb;
uniform vec3 uTint;
uniform float uReveal;
uniform float uOpacity;

varying vec2 vUv;

float vignette(vec2 uv, vec2 center, float inner, float outer) {
  return smoothstep(outer, inner, distance(uv, center));
}

void main() {
  vec2 sourceUv = (vUv - 0.5) * 0.42 + 0.5;
  vec3 thumb = texture2D(tThumb, sourceUv).rgb;
  float lum = dot(thumb, vec3(0.2126, 0.7152, 0.0722));
  float neutral = 1.0 - smoothstep(0.04, 0.22, length(thumb - vec3(lum)));
  float center = pow(vignette(vUv, vec2(0.5), 0.02, 0.52), 2.4);
  float mask = max(smoothstep(0.36, 0.76, lum), neutral * smoothstep(0.28, 0.68, lum));
  mask *= center * uReveal;
  vec3 color = mix(uTint * 0.95, vec3(1.0), smoothstep(0.52, 0.86, lum));
  color += thumb * 0.18;
  gl_FragColor = vec4(color, clamp(mask * uOpacity, 0.0, 0.16));
}
`;

const thumbVertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const thumbFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uTransitionCount;
uniform float uTransitionSmoothness;

varying vec2 vUv;

vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 size) {
  vec2 s = size;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((newSize.x - s.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - s.y) / 2.0)) / newSize;
  vec2 uv = ouv * s / newSize + newOffset;
  return texture2D(tex, uv);
}

vec4 transition(vec4 color1, vec4 color2, float progress, vec2 uv) {
  float pr = smoothstep(-uTransitionSmoothness, 0.0, uv.y - progress * (1.0 + uTransitionSmoothness));
  float s = step(pr, fract(uTransitionCount * uv.y));
  return mix(color1, color2, s);
}

void main() {
  vec4 map = coverTexture(tMap, uMapSize, vUv, uResolution);
  vec4 fallback = vec4(vUv.x, vUv.y, 0.0, 1.0);
  vec4 mixed = transition(map, fallback, 1.0 - uProgress, vUv);
  gl_FragColor = vec4(mixed.rgb, 1.0);
}
`;

const thumbCompositeFragment = `
precision highp float;

uniform sampler2D tScene;
uniform float uDarkness;
uniform vec3 uDarknessColor;
uniform float uSaturation;

varying vec2 vUv;

vec3 saturateColor(vec3 color, float amount) {
  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(gray), color, amount);
}

void main() {
  vec4 color = texture2D(tScene, vUv);
  color.rgb = saturateColor(color.rgb, uSaturation);
  color.rgb = mix(color.rgb, uDarknessColor, uDarkness);
  gl_FragColor = vec4(color.rgb, 1.0);
}
`;

const backgroundVertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const backgroundFragment = `
precision highp float;

uniform float uTime;
uniform float uRatio;
uniform float uFluidStrength;
uniform float uProgress;
uniform vec3 uBgColor;
uniform vec3 uActiveColor;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    f += a * noise(p);
    p = p * 2.02 + 13.17;
    a *= 0.5;
  }
  return f;
}

float vignette(vec2 uv, float inner, float outer) {
  vec2 p = uv - 0.5;
  p.x *= uRatio;
  return smoothstep(outer, inner, length(p));
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  p.x *= uRatio;

  float flowA = fbm(p * 2.3 + vec2(uTime * -0.035 + uProgress, uTime * -0.018));
  float flowB = fbm(p * 5.0 + vec2(uTime * 0.02, uTime * -0.03));
  float fluid = mix(flowA, flowB, 0.38);
  float rings = abs(1.0 / (sin(pow(length(p) * 0.9, 0.25) - uTime * 0.35 + sin(length(p) * 0.8 - 1.6)) * 10.8)) - 0.1;

  vec3 deep = mix(uBgColor, vec3(0.015, 0.018, 0.032), 0.65);
  vec3 accent = mix(uActiveColor, uAmbientColor, clamp(uAmbientIntensity, 0.0, 1.4) * 0.28);
  vec3 color = deep;
  color = mix(color, accent, 0.22 + fluid * 0.34);
  color += accent * rings * 0.095 * uFluidStrength;
  color += vec3(flowB) * 0.05;

  float v = vignette(uv, 0.05, 0.84);
  color *= 0.52 + v * 0.98;
  color += accent * pow(max(0.0, 1.0 - length(p * vec2(0.8, 1.15))), 3.0) * 0.2;

  gl_FragColor = vec4(color, 1.0);
}
`;

const displacementFragment = `
precision highp float;

uniform float uTime;
uniform float uRatio;

varying vec2 vUv;

float vignette(vec2 uv, float inner, float outer) {
  vec2 p = uv - 0.5;
  p.x *= uRatio;
  return smoothstep(outer, inner, length(p));
}

void main() {
  vec2 uvOff = vUv;
  uvOff.x -= 0.5;
  uvOff.x *= uRatio;
  uvOff.x += 0.5;

  vec2 waveUv = uvOff;
  waveUv -= 0.5;
  waveUv *= 5.0;
  waveUv += 0.5;

  float strength = 1.0 - abs(sin(distance(waveUv, vec2(0.5)) - 0.5 - uTime));
  float mask = 1.0 - vignette(uvOff, 0.01, 0.5);
  float displacement = clamp(strength * mask, 0.0, 1.0);
  gl_FragColor = vec4(vec3(displacement), 1.0);
}
`;

const floorFragment = `
precision highp float;

uniform float uTime;
uniform vec3 uActiveColor;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;

varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  float horizon = smoothstep(1.0, 0.18, uv.y);
  float edge = smoothstep(0.0, 0.22, uv.x) * smoothstep(1.0, 0.78, uv.x);
  float scan = random(floor(vec2(uv.x * 70.0, uv.y * 8.0 + uTime * 0.4))) * 0.08;
  vec3 base = vec3(0.024, 0.025, 0.027);
  vec3 reflection = mix(uActiveColor, uAmbientColor, clamp(uAmbientIntensity, 0.0, 1.0));
  vec3 color = mix(base, reflection, horizon * 0.22 + scan);
  float alpha = horizon * edge * 0.34;
  gl_FragColor = vec4(color, alpha);
}
`;

const environmentFragment = `
precision highp float;

uniform float uTime;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vUv;
  float band = smoothstep(1.0, 0.2, uv.y) * smoothstep(0.0, 0.25, uv.y);
  float flow = noise(vec2(uv.x * 4.0 - uTime * 0.018, uv.y * 1.6));
  vec3 color = mix(vec3(0.012, 0.013, 0.016), uAmbientColor, 0.12 + flow * 0.18 * clamp(uAmbientIntensity, 0.0, 1.0));
  gl_FragColor = vec4(color, band * 0.22);
}
`;

function normalizeColor(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("#") || trimmed.startsWith("rgb")) return trimmed;
  if (/^[0-9a-f]{3,8}$/i.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

function colorFrom(value?: string, fallback = DEFAULT_COLOR) {
  return new Color(normalizeColor(value) ?? fallback);
}

function numeric(value: string | number | undefined, fallback: number) {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function seededRandom(index: number, projectIndex: number, salt: number) {
  const value = Math.sin(index * 12.9898 + projectIndex * 78.233 + salt * 37.719) * 43758.5453123;
  return value - Math.floor(value);
}

function makePlaceholderTexture(color = [20, 20, 20, 255]) {
  const texture = new DataTexture(new Uint8Array(color), 1, 1, RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function setTextureQuality(texture: Texture, renderer: WebGLRenderer) {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function tweenColor(target: Color, value?: string, duration = 1.6) {
  const next = colorFrom(value, `#${target.getHexString()}`);
  gsap.to(target, {
    r: next.r,
    g: next.g,
    b: next.b,
    duration,
    ease: "expo.out",
  });
}

export class WebGLBackdrop {
  private root: HTMLElement;
  private renderer: WebGLRenderer;
  private backgroundScene = new Scene();
  private homeScene = new Scene();
  private thumbScene = new Scene();
  private mediaScene = new Scene();
  private backgroundCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private homeCamera = new PerspectiveCamera(55, 1, 0.1, 2000);
  private thumbCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
  private mediaCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private sceneWrap = new Group();
  private thumbWrap = new Group();
  private workItems: WorkItem[] = [];
  private mediaPlanes: MediaPlane[] = [];
  private loader = new TextureLoader();
  private textureCache = new Map<string, Texture>();
  private placeholder = makePlaceholderTexture();
  private mouseSimTexture = makePlaceholderTexture([128, 128, 0, 255]);
  private mouseSimData = new Uint8Array(128 * 128 * 4);
  private screenMouseSimTexture = makePlaceholderTexture([128, 128, 0, 255]);
  private screenMouseSimData = new Uint8Array(128 * 128 * 4);
  private noiseTexture = makePlaceholderTexture([255, 255, 255, 255]);
  private perlinTexture = makePlaceholderTexture([128, 128, 128, 255]);
  private backgroundMaterial: ShaderMaterial;
  private compositeMaterial: ShaderMaterial;
  private compositeScene = new Scene();
  private compositeTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  private bloomMaterial: ShaderMaterial;
  private bloomScene = new Scene();
  private bloomTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  private displacementMaterial: ShaderMaterial;
  private displacementScene = new Scene();
  private displacementTarget = new WebGLRenderTarget(128, 128, { depthBuffer: false, stencilBuffer: false });
  private thumbCompositeMaterial: ShaderMaterial;
  private thumbCompositeScene = new Scene();
  private projectionMaterial: ShaderMaterial;
  private projectionPlane: Mesh<PlaneGeometry, ShaderMaterial>;
  private floorMaterial: ShaderMaterial;
  private floorPlane: Mesh<PlaneGeometry, ShaderMaterial>;
  private environmentMaterial: ShaderMaterial;
  private environmentPlane: Mesh<PlaneGeometry, ShaderMaterial>;
  private thumbTarget = new WebGLRenderTarget(1024, 1024, { depthBuffer: false, stencilBuffer: false });
  private thumbCompositeTarget = new WebGLRenderTarget(1024, 1024, { depthBuffer: false, stencilBuffer: false });
  private particles: Points;
  private raycaster = new Raycaster();
  private mousePlane: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private raf = 0;
  private pointer = new Vector2();
  private targetPointer = new Vector2();
  private mouseSimOldPos = new Vector2(0.5, 0.5);
  private mouseSimNewPos = new Vector2(0.5, 0.5);
  private mouseSimTargetPos = new Vector2(0.5, 0.5);
  private mouseSimSpeed = 0;
  private screenMouseSimOldPos = new Vector2(0.5, 0.5);
  private screenMouseSimNewPos = new Vector2(0.5, 0.5);
  private screenMouseSimTargetPos = new Vector2(0.5, 0.5);
  private lastTickTime = performance.now() * 0.001;
  private galleryProgress = 0;
  private sceneRotation = 0;
  private zoom = 0;
  private activeSlug = "";
  private mouseFactor = 0;
  private maxSpotLightIntensity = 220;
  private spotLightIntensity = 1;
  private spotLightPosition = new Vector3(0, 0, 3.7);
  private fluidStrength = 0.5;
  private sceneReveal = 0;
  private revealSpread = 0;
  private projectRevealTweens: gsap.core.Tween[] = [];
  private currentAmbientIntensity = 0.5;
  private mediaBackground = colorFrom(DEFAULT_BG);
  private mediaSceneOpacity = 0;
  private radius = 8;

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.domElement.className = "gl-canvas";
    this.root.appendChild(this.renderer.domElement);
    document.body.classList.add("has-webgl");

    this.homeCamera.position.set(0, 0, 5.5);
    this.thumbCamera.position.set(0, 0, 1);
    this.mediaCamera.position.set(0, 0, 1000);
    this.backgroundMaterial = this.createBackgroundMaterial();
    this.backgroundScene.add(new Mesh(new PlaneGeometry(2, 2), this.backgroundMaterial));
    this.compositeMaterial = this.createCompositeMaterial();
    this.compositeScene.add(new Mesh(new PlaneGeometry(2, 2), this.compositeMaterial));
    this.bloomMaterial = this.createBloomMaterial();
    this.bloomScene.add(new Mesh(new PlaneGeometry(2, 2), this.bloomMaterial));
    this.displacementMaterial = this.createDisplacementMaterial();
    this.displacementScene.add(new Mesh(new PlaneGeometry(2, 2), this.displacementMaterial));
    this.thumbCompositeMaterial = this.createThumbCompositeMaterial();
    this.thumbCompositeScene.add(new Mesh(new PlaneGeometry(2, 2), this.thumbCompositeMaterial));
    this.projectionMaterial = this.createProjectionMaterial();
    this.projectionPlane = new Mesh(new PlaneGeometry(3.9, 2.72), this.projectionMaterial);
    this.projectionPlane.position.set(0, 0, 0.42);
    this.floorMaterial = this.createFloorMaterial();
    this.floorPlane = new Mesh(new PlaneGeometry(60, 32), this.floorMaterial);
    this.floorPlane.position.y = -1.65;
    this.floorPlane.rotation.x = -Math.PI / 2;
    this.environmentMaterial = this.createEnvironmentMaterial();
    this.environmentPlane = new Mesh(new PlaneGeometry(300, 10), this.environmentMaterial);
    this.environmentPlane.position.y = -12.65;
    this.homeScene.add(this.sceneWrap);
    this.sceneWrap.add(this.floorPlane);
    this.sceneWrap.add(this.environmentPlane);
    this.homeScene.add(this.projectionPlane);
    this.thumbScene.background = colorFrom("#222222");
    this.thumbScene.add(this.thumbWrap);

    this.createWorkScene();
    this.mousePlane = this.createMousePlane();
    this.particles = this.createParticles();
    this.homeScene.add(this.particles);
    this.createMediaPlanes();
    this.loadCompositeTextures();

    this.resize();
    this.bind();
    gsap.to(this, { mouseFactor: 1, duration: 3, ease: "none" });
    this.tick();
  }

  setProject(payload: ProjectPayload) {
    const ambientIntensity = numeric(payload.ambient, 0.5);
    const ambientColor = ambientIntensity < 0 && payload.invert ? payload.invert : payload.secondary;
    const sceneDarkness = payload.overviewDarkness ?? payload.darkness;
    this.activeSlug = payload.slug ?? this.activeSlug;
    this.setMainColor(payload.color);
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setDarken(numeric(sceneDarkness, document.body.classList.contains("is-project") ? 0.25 : 0.1));
    this.setSaturation(numeric(payload.saturation, 1));
    this.setContrast(numeric(payload.contrast, 1.15));
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setThumbDarknessIntensity(numeric(payload.thumbDarkness ?? payload.darkness, 0));
    this.setThumbDarknessColor(payload.darknessColor ?? "#000000");
    this.setThumbMouseLightness(numeric(payload.mouseLightness, 1));
    this.setBlocksColor(payload.blocks ?? DEFAULT_BG);
    this.setSpotLightIntensity(numeric(payload.spotlight, this.maxSpotLightIntensity), 1);
    this.setFluidStrength(document.body.classList.contains("is-project") ? 1 : 0.5, document.body.classList.contains("is-project") ? 0.5 : 1);
    this.setRevealSpread(0);

    if (payload.slug) this.setActiveSlug(payload.slug);
    if (document.body.classList.contains("is-project")) this.mediaAnimateIn();
  }

  setActiveSlug(slug: string) {
    this.activeSlug = slug;
    const active = this.workItems.find((item) => item.slug === slug);
    if (active) this.setProjectBlockReveal(active);
  }

  setGalleryProgress(progress: number, velocity = 0, delta = 1 / 60) {
    this.galleryProgress = progress;
    this.compositeMaterial.uniforms.uTransformX.value = progress;
    const targetRotation = MathUtils.degToRad(progress * 360 + 180);
    const lerpFactor = Math.min(1, 5 * Math.max(0.001, delta));
    this.sceneRotation += (MathUtils.clamp(velocity * -0.015, -4, 4) - this.sceneRotation) * lerpFactor;
    this.zoom += (MathUtils.clamp(Math.abs(velocity * 0.0015), 0, 1) - this.zoom) * lerpFactor;
    this.sceneWrap.rotation.y = targetRotation;
    this.homeScene.rotation.z = MathUtils.degToRad(this.sceneRotation);
    this.homeScene.position.z = this.homeScene.rotation.z - this.zoom;
    this.updateThumbGallery(-progress);
  }

  setPreviewMode(enabled: boolean) {
    this.setFluidStrength(enabled ? 0.35 : 0.5, 0.5);
    gsap.to(this, {
      mouseFactor: enabled ? 0.25 : 1,
      duration: 3,
      ease: "none",
      onUpdate: () => {
        this.workItems.forEach((item) => {
          item.material.uniforms.uMouseFactor.value = this.mouseFactor;
        });
      },
    });
  }

  showScene() {
    gsap.to(this, {
      sceneReveal: 1,
      duration: 1.6,
      ease: "expo.out",
      onUpdate: () => {
        this.compositeMaterial.uniforms.uReveal.value = this.sceneReveal;
        this.projectionMaterial.uniforms.uReveal.value = this.sceneReveal;
      },
    });
  }

  hideWorkScene() {
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.setRevealSpread(1, 0.65, "power3.in");
    this.setSpotLightIntensity(0, 1, "none");
    this.setFluidStrength(0.5, 0.5);
    gsap.to(this.projectionMaterial.uniforms.uReveal, { value: 0, duration: 0.5, ease: "none" });
    this.workItems.forEach((item) => {
      gsap.to(item.material.uniforms.uRevealProject, { value: 0, duration: 0.5, ease: "none" });
    });
  }

  mediaAnimateIn() {
    this.setMediaOpacity(1, 1.6, "expo.out", 0.25);
    this.mediaPlanes.forEach((plane) => {
      gsap.to(plane.translation, {
        y: 0,
        duration: 1.6,
        delay: 0.25,
        ease: "expo.out",
      });
    });
  }

  refreshMedia() {
    this.createMediaPlanes();
    this.resize();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("scroll", this.onScroll);
    this.textureCache.forEach((texture) => texture.dispose());
    this.mouseSimTexture.dispose();
    this.screenMouseSimTexture.dispose();
    this.noiseTexture.dispose();
    this.perlinTexture.dispose();
    this.mediaPlanes.forEach((plane) => {
      plane.video?.pause();
      plane.texture?.dispose();
      plane.mesh.geometry.dispose();
      plane.material.dispose();
    });
    this.workItems.forEach((item) => {
      item.mesh.geometry.dispose();
      item.material.dispose();
      item.thumb.geometry.dispose();
      item.thumb.material.dispose();
    });
    this.backgroundMaterial.dispose();
    this.compositeTarget.dispose();
    this.compositeMaterial.dispose();
    this.bloomTarget.dispose();
    this.bloomMaterial.dispose();
    this.displacementTarget.dispose();
    this.displacementMaterial.dispose();
    this.thumbCompositeTarget.dispose();
    this.thumbCompositeMaterial.dispose();
    this.projectionPlane.geometry.dispose();
    this.projectionMaterial.dispose();
    this.floorPlane.geometry.dispose();
    this.floorMaterial.dispose();
    this.environmentPlane.geometry.dispose();
    this.environmentMaterial.dispose();
    this.mousePlane.geometry.dispose();
    this.mousePlane.material.dispose();
    this.thumbTarget.dispose();
    this.renderer.dispose();
    this.root.replaceChildren();
  }

  private createWorkScene() {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-project-card]"));
    if (!cards.length) {
      this.sceneWrap.visible = false;
      return;
    }

    const count = cards.length;
    const theta = 360 / count;
    const itemWidth = 6.5;
    let rotationAdjustment = 0;
    this.radius = Math.round(itemWidth / 2 / Math.tan(Math.PI / count));
    this.sceneWrap.position.set(0, 0, this.radius - 0.3);
    this.sceneWrap.rotation.y = Math.PI;

    cards.forEach((card, index) => {
      const payload = this.payloadFromElement(card);
      const material = this.createWorkBlockMaterial(payload, card.classList.contains("is-active") ? 1 : 0);
      const mesh = this.createBlockMesh(material, index);
      const thumb = this.createThumbPlane(payload);
      const group = new Group();
      group.add(mesh);
      if (payload.slug === "demorgen") rotationAdjustment = -theta * index;
      group.position.x = -Math.sin(MathUtils.degToRad(theta * index)) * this.radius;
      group.position.z = Math.cos(MathUtils.degToRad(theta * index)) * this.radius;
      group.lookAt(0, 0, 0);
      this.sceneWrap.add(group);
      this.thumbWrap.add(thumb);
      this.workItems.push({
        slug: card.dataset.slug ?? String(index),
        payload,
        group,
        material,
        mesh,
        thumb,
        reveal: card.classList.contains("is-active") ? 1 : 0,
      });
      if (payload.thumb) this.loadTexture(payload.thumb, (texture) => {
        thumb.material.uniforms.tMap.value = texture;
        const image = texture.image as HTMLImageElement | undefined;
        if (image?.naturalWidth && image?.naturalHeight) {
          thumb.material.uniforms.uMapSize.value.set(image.naturalWidth, image.naturalHeight);
        }
      });
    });
    this.environmentPlane.rotation.y = -MathUtils.degToRad(rotationAdjustment);
  }

  private createWorkBlockMaterial(payload: ProjectPayload, reveal: number) {
    const thumbDarkness = payload.thumbDarkness ?? payload.darkness;
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        tThumb: { value: this.thumbCompositeTarget.texture },
        uMapSize: { value: new Vector2(1600, 1200) },
        uGridSize: { value: new Vector3(GRID_COLS, GRID_ROWS, GRID_LAYERS) },
        uTint: { value: colorFrom(payload.color) },
        uBlockColor: { value: colorFrom(payload.blocks ?? DEFAULT_BG, DEFAULT_BG) },
        uDarknessColor: { value: colorFrom(payload.darknessColor ?? payload.mediaColor ?? DEFAULT_BG, DEFAULT_BG) },
        uReveal: { value: reveal },
        uRevealProject: { value: 1 },
        uRevealSides: { value: 1 },
        uRevealSpread: { value: 0 },
        uRevealSpreadSides: { value: 1 },
        uDarkness: { value: numeric(thumbDarkness, 0.18) },
        uSaturation: { value: numeric(payload.saturation, 1) },
        uContrast: { value: numeric(payload.contrast, 1.15) },
        uMouseLightness: { value: numeric(payload.mouseLightness, 1) },
        uMouseFactor: { value: this.mouseFactor },
        uPointer: { value: this.pointer },
        uMouseUvOffset: { value: new Vector2(0.25, 0.25) },
        uMouseUvScale: { value: 1.5 },
        tMouseSim: { value: this.mouseSimTexture },
        tMouseSim2: { value: this.screenMouseSimTexture },
        tDisplacement: { value: this.displacementTarget.texture },
        tPerlin: { value: this.perlinTexture },
        uCoords: { value: new Vector2(1, 1) },
        uSpotLightPosition: { value: this.spotLightPosition },
        uSpotConeTan: { value: Math.tan(Math.PI / 4) },
        uSpotIntensity: { value: this.spotLightIntensity },
        uTime: { value: 0 },
      },
      vertexShader: workBlockVertex,
      fragmentShader: workBlockFragment,
    });
  }

  private createBlockMesh(material: ShaderMaterial, projectIndex: number) {
    const geometry = new RoundedBoxGeometry(GRID_CUBE_SIZE, GRID_CUBE_SIZE, GRID_CUBE_SIZE, 2, 0.05);
    const count = GRID_COLS * GRID_ROWS * GRID_LAYERS;
    const matrices = new Array<Matrix4>(count);
    const gridOffsets = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const dummy = new Object3D();
    const cell = GRID_CUBE_SIZE + GRID_SPACING;
    const width = (GRID_COLS - 1) * cell;
    const height = (GRID_ROWS - 1) * cell;
    const depth = (GRID_LAYERS - 1) * cell;
    let index = 0;

    for (let z = 0; z < GRID_LAYERS; z++) {
      for (let x = 0; x < GRID_COLS; x++) {
        for (let y = 0; y < GRID_ROWS; y++) {
          dummy.position.set(x * cell - width / 2, y * cell - height / 2, z * cell - depth / 2);
          dummy.scale.setScalar(1);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          matrices[index] = dummy.matrix.clone();
          gridOffsets[index * 3] = x / GRID_COLS;
          gridOffsets[index * 3 + 1] = y / GRID_ROWS;
          gridOffsets[index * 3 + 2] = z / GRID_LAYERS;
          colors[index * 3] = seededRandom(index, projectIndex, 1);
          colors[index * 3 + 1] = seededRandom(index, projectIndex, 2);
          colors[index * 3 + 2] = seededRandom(index, projectIndex, 3);
          alphas[index] = seededRandom(index, projectIndex, 4);
          index++;
        }
      }
    }

    const mesh = new InstancedMesh(geometry, material, count);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    geometry.setAttribute("instanceGrid", new InstancedBufferAttribute(gridOffsets, 3));
    geometry.setAttribute("instanceAlpha", new InstancedBufferAttribute(alphas, 1));
    geometry.setAttribute("instanceColor", new InstancedBufferAttribute(colors, 3));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.scale.setScalar(GRID_SCALE);
    return mesh;
  }

  private createThumbPlane(payload: ProjectPayload) {
    const material = new ShaderMaterial({
      transparent: false,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: this.placeholder },
        uMapSize: { value: new Vector2(1, 1) },
        uResolution: { value: new Vector2(1, 1) },
        uProgress: { value: 1 },
        uTransitionCount: { value: 150 },
        uTransitionSmoothness: { value: 0.2 },
      },
      vertexShader: thumbVertex,
      fragmentShader: thumbFragment,
    });
    const mesh = new Mesh(new PlaneGeometry(1, 1), material);
    mesh.scale.set(2, 2, 2);
    mesh.visible = false;
    return mesh;
  }

  private createBackgroundMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uRatio: { value: 1 },
        uFluidStrength: { value: 0.5 },
        uProgress: { value: 0 },
        uBgColor: { value: colorFrom("#1f1f1f") },
        uActiveColor: { value: colorFrom(DEFAULT_COLOR) },
        uAmbientColor: { value: colorFrom("#414652") },
        uAmbientIntensity: { value: 0.5 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: backgroundFragment,
    });
  }

  private createCompositeMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tWork: { value: this.compositeTarget.texture },
        tBloom: { value: this.bloomTarget.texture },
        tMouseSim: { value: this.screenMouseSimTexture },
        tNoise: { value: this.noiseTexture },
        tPerlin: { value: this.perlinTexture },
        uTime: { value: 0 },
        uRatio: { value: 1 },
        uProgress: { value: 0 },
        uTransformX: { value: 0 },
        uReveal: { value: 0 },
        uFluidStrength: { value: this.fluidStrength },
        uContrast: { value: 1.1 },
        uDarken: { value: 0.1 },
        uSaturation: { value: 1.15 },
        uBgColor: { value: colorFrom("#1f1f1f") },
        uActiveColor: { value: colorFrom(DEFAULT_COLOR) },
        uAmbientColor: { value: colorFrom("#414652") },
        uAmbientIntensity: { value: 0.5 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeCompositeFragment,
    });
  }

  private createBloomMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.compositeTarget.texture },
        uTexel: { value: new Vector2(1, 1) },
        uRadius: { value: 1.5 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeBloomFragment,
    });
  }

  private loadCompositeTextures() {
    this.loadTexture("/images/textures/blue-noise.png", (texture) => {
      this.compositeMaterial.uniforms.tNoise.value = texture;
    });
    this.loadTexture("/images/textures/perlin-2.webp", (texture) => {
      this.compositeMaterial.uniforms.tPerlin.value = texture;
      this.workItems.forEach((item) => {
        item.material.uniforms.tPerlin.value = texture;
      });
    });
  }

  private createDisplacementMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uRatio: { value: 1 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: displacementFragment,
    });
  }

  private createThumbCompositeMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.thumbTarget.texture },
        uDarkness: { value: 0 },
        uDarknessColor: { value: colorFrom("#000000", "#000000") },
        uSaturation: { value: 1 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: thumbCompositeFragment,
    });
  }

  private createProjectionMaterial() {
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        tThumb: { value: this.thumbCompositeTarget.texture },
        uTint: { value: colorFrom(DEFAULT_COLOR) },
        uReveal: { value: 0 },
        uOpacity: { value: 0.065 },
      },
      vertexShader: thumbVertex,
      fragmentShader: projectionFragment,
    });
  }

  private createFloorMaterial() {
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uActiveColor: { value: colorFrom(DEFAULT_COLOR) },
        uAmbientColor: { value: colorFrom("#414652") },
        uAmbientIntensity: { value: 0.5 },
      },
      vertexShader: thumbVertex,
      fragmentShader: floorFragment,
    });
  }

  private createEnvironmentMaterial() {
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uAmbientColor: { value: colorFrom("#414652") },
        uAmbientIntensity: { value: 0.5 },
      },
      vertexShader: thumbVertex,
      fragmentShader: environmentFragment,
    });
  }

  private createMousePlane() {
    const material = new MeshBasicMaterial({ visible: false });
    const mesh = new Mesh(new PlaneGeometry(GRID_COLS * 1.3 * GRID_SCALE * 1.5, GRID_ROWS * 1.3 * GRID_SCALE * 1.5), material);
    mesh.position.set(0, 0, 0.01);
    this.homeScene.add(mesh);
    return mesh;
  }

  private createParticles() {
    const geometry = new PlaneGeometry(1, 1);
    const positions: number[] = [];
    for (let i = 0; i < 160; i++) {
      const angle = i * 2.399963;
      const radius = 1.6 + (i % 37) * 0.075;
      positions.push(Math.cos(angle) * radius, Math.sin(angle * 0.73) * 2.3, -3.8 + Math.sin(i * 0.61) * 2.1);
    }
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    const material = new PointsMaterial({
      color: DEFAULT_COLOR,
      size: 0.018,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });
    return new Points(geometry, material);
  }

  private createMediaPlanes() {
    const existing = new Set(this.mediaPlanes.map((plane) => plane.track));
    const tracks = Array.from(document.querySelectorAll<HTMLElement>("[data-media][data-media-src]")).filter(
      (track) => !existing.has(track),
    );

    tracks.forEach((track) => {
      const material = this.createMediaMaterial();
      const mesh = new Mesh(new PlaneGeometry(1, 1), material);
      const plane: MediaPlane = {
        track,
        mesh,
        material,
        src: track.dataset.mediaSrc ?? "",
        type: track.dataset.mediaType ?? track.dataset.mediaSrc?.split(".").pop() ?? "",
        translation: new Vector2(0, -100),
        offset: new Vector2(),
        loaded: false,
      };
      material.uniforms.uMapSize.value.set(
        numeric(track.dataset.mediaWidth, 1600),
        numeric(track.dataset.mediaHeight, 1200),
      );
      this.mediaScene.add(mesh);
      this.mediaPlanes.push(plane);
      this.observeMediaPlane(plane);
    });
  }

  private createMediaMaterial() {
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: this.placeholder },
        uContainerSize: { value: new Vector2(1, 1) },
        uMapSize: { value: new Vector2(1600, 1200) },
        uCameraDistance: { value: 0 },
        uRadius: { value: 0 },
        uBackgroundColor: { value: this.mediaBackground.clone() },
        uReveal: { value: 0 },
        uSceneOpacity: { value: 0 },
      },
      vertexShader: projectMediaVertex,
      fragmentShader: projectMediaFragment,
    });
  }

  private observeMediaPlane(plane: MediaPlane) {
    if (!("IntersectionObserver" in window)) {
      this.loadMediaPlane(plane);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== plane.track) return;
          if (entry.isIntersecting) {
            this.loadMediaPlane(plane);
            void plane.video?.play();
          } else {
            plane.video?.pause();
          }
        });
      },
      { rootMargin: "20% 0px", threshold: 0 },
    );
    observer.observe(plane.track);
  }

  private loadMediaPlane(plane: MediaPlane) {
    if (plane.loaded || !plane.src) return;
    plane.loaded = true;
    if (plane.type === "video" || /\.(mp4|mov|webm)$/i.test(plane.src)) {
      const video = Object.assign(document.createElement("video"), {
        crossOrigin: "anonymous",
        muted: true,
        loop: true,
        playsInline: true,
        preload: "metadata",
        src: plane.src,
      });
      plane.video = video;
      video.addEventListener("loadedmetadata", () => {
        plane.material.uniforms.uMapSize.value.set(video.videoWidth || 1600, video.videoHeight || 1200);
        const texture = new VideoTexture(video);
        setTextureQuality(texture, this.renderer);
        plane.texture = texture;
        plane.material.uniforms.tMap.value = texture;
        this.showMediaPlane(plane);
        void video.play();
      });
      video.load();
      return;
    }

    this.loader.load(plane.src, (texture) => {
      setTextureQuality(texture, this.renderer);
      const image = texture.image as HTMLImageElement | undefined;
      if (image?.naturalWidth && image?.naturalHeight) {
        plane.material.uniforms.uMapSize.value.set(image.naturalWidth, image.naturalHeight);
      }
      plane.texture = texture;
      plane.material.uniforms.tMap.value = texture;
      this.showMediaPlane(plane);
    });
  }

  private showMediaPlane(plane: MediaPlane) {
    gsap.fromTo(plane.material.uniforms.uReveal, { value: 0 }, { value: 1, duration: 0.5, ease: "none" });
  }

  private setProjectBlockReveal(active: WorkItem) {
    const thumbDarkness = active.payload.thumbDarkness ?? active.payload.darkness;
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.workItems.forEach((item) => {
      const isActive = item === active;
      item.reveal = isActive ? 1 : 0;
      const revealTween = gsap.to(item.material.uniforms.uReveal, {
        value: isActive ? 1 : 0,
        delay: isActive ? 0.2 : 0,
        duration: isActive ? 4 : 1.6,
        ease: "power4.out",
      });
      this.projectRevealTweens.push(revealTween);
      gsap.to(item.material.uniforms.uRevealProject, { value: 1, duration: 0.5, ease: "none" });
      if (isActive) {
        tweenColor(item.material.uniforms.uTint.value as Color, active.payload.color, 1.6);
        tweenColor(this.projectionMaterial.uniforms.uTint.value as Color, active.payload.color, 1.6);
        tweenColor(item.material.uniforms.uDarknessColor.value as Color, active.payload.darknessColor ?? "#000000", 1.6);
        tweenColor(item.material.uniforms.uBlockColor.value as Color, active.payload.blocks ?? active.payload.mediaColor ?? DEFAULT_BG, 1.6);
        gsap.to(item.material.uniforms.uDarkness, { value: numeric(thumbDarkness, 0.18), duration: 1.6, ease: "expo.out" });
        gsap.to(item.material.uniforms.uSaturation, { value: numeric(active.payload.saturation, 1), duration: 1.6, ease: "expo.out" });
        gsap.to(item.material.uniforms.uContrast, { value: numeric(active.payload.contrast, 1.15), duration: 1.6, ease: "expo.out" });
        gsap.to(item.material.uniforms.uMouseLightness, { value: numeric(active.payload.mouseLightness, 1), duration: 1.6, ease: "expo.out" });
        gsap.to(this.thumbCompositeMaterial.uniforms.uDarkness, { value: numeric(thumbDarkness, 0), duration: 1.6, ease: "expo.out" });
        tweenColor(this.thumbCompositeMaterial.uniforms.uDarknessColor.value as Color, active.payload.darknessColor ?? "#000000", 1.6);
        gsap.to(this.thumbCompositeMaterial.uniforms.uSaturation, { value: numeric(active.payload.saturation, 1), duration: 1.6, ease: "expo.out" });
      }
    });
  }

  private setMainColor(color?: string) {
    const elements = document.querySelectorAll<HTMLElement>(".c-color");
    const next = colorFrom(color);
    tweenColor(this.backgroundMaterial.uniforms.uActiveColor.value as Color, color, 1.6);
    tweenColor(this.compositeMaterial.uniforms.uActiveColor.value as Color, color, 1.6);
    tweenColor(this.floorMaterial.uniforms.uActiveColor.value as Color, color, 1.6);
    elements.forEach((element) => {
      gsap.to(element, {
        color: `rgb(${Math.round(next.r * 255)}, ${Math.round(next.g * 255)}, ${Math.round(next.b * 255)})`,
        duration: 1.6,
        ease: "expo.out",
      });
    });
    const particleMaterial = this.particles.material as PointsMaterial;
    tweenColor(particleMaterial.color, color, 1.6);
  }

  private setAmbientLight(color?: string, intensity = 0.5) {
    this.currentAmbientIntensity = intensity;
    this.workItems.forEach((item) => {
      if (item.slug === this.activeSlug) tweenColor(item.material.uniforms.uTint.value as Color, color, 1.6);
    });
    tweenColor(this.backgroundMaterial.uniforms.uAmbientColor.value as Color, color, 1.6);
    tweenColor(this.compositeMaterial.uniforms.uAmbientColor.value as Color, color, 1.6);
    tweenColor(this.floorMaterial.uniforms.uAmbientColor.value as Color, color, 1.6);
    tweenColor(this.environmentMaterial.uniforms.uAmbientColor.value as Color, color, 1.6);
    gsap.to(this.backgroundMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration: 1.6,
      ease: "expo.out",
    });
    gsap.to(this.compositeMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration: 1.6,
      ease: "expo.out",
    });
    gsap.to(this.floorMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration: 1.6,
      ease: "expo.out",
    });
    gsap.to(this.environmentMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration: 1.6,
      ease: "expo.out",
    });
    gsap.to(this.particles.material as PointsMaterial, {
      opacity: MathUtils.clamp(0.06 + intensity * 0.12, 0.05, 0.24),
      duration: 1.6,
      ease: "expo.out",
    });
  }

  private setDarken(value: number) {
    gsap.to(this.compositeMaterial.uniforms.uDarken, { value, duration: 1.6, ease: "expo.out" });
  }

  private setThumbDarknessIntensity(value: number) {
    gsap.to(this.thumbCompositeMaterial.uniforms.uDarkness, { value, duration: 1.6, ease: "expo.out" });
  }

  private setSaturation(value: number) {
    this.workItems.forEach((item) => {
      if (item.slug === this.activeSlug) gsap.to(item.material.uniforms.uSaturation, { value, duration: 1.6, ease: "expo.out" });
    });
    gsap.to(this.thumbCompositeMaterial.uniforms.uSaturation, { value, duration: 1.6, ease: "expo.out" });
    gsap.to(this.compositeMaterial.uniforms.uSaturation, { value: Math.max(1.15, value), duration: 1.6, ease: "expo.out" });
  }

  private setContrast(value: number) {
    this.workItems.forEach((item) => {
      if (item.slug === this.activeSlug) gsap.to(item.material.uniforms.uContrast, { value, duration: 1.6, ease: "expo.out" });
    });
    gsap.to(this.compositeMaterial.uniforms.uContrast, { value, duration: 1.6, ease: "expo.out" });
  }

  private setThumbDarknessColor(value?: string) {
    this.workItems.forEach((item) => {
      if (item.slug === this.activeSlug) tweenColor(item.material.uniforms.uDarknessColor.value as Color, value, 1.6);
    });
    tweenColor(this.thumbCompositeMaterial.uniforms.uDarknessColor.value as Color, value ?? "#000000", 1.6);
  }

  private setThumbMouseLightness(value: number) {
    this.workItems.forEach((item) => {
      gsap.to(item.material.uniforms.uMouseLightness, { value, duration: 1.6, ease: "expo.out" });
    });
  }

  private setMediaBackground(value?: string) {
    this.mediaBackground = colorFrom(value, DEFAULT_BG);
    tweenColor(this.compositeMaterial.uniforms.uBgColor.value as Color, value ?? DEFAULT_BG, 1.6);
    this.mediaPlanes.forEach((plane) => tweenColor(plane.material.uniforms.uBackgroundColor.value as Color, value, 1.6));
  }

  private setBlocksColor(value?: string) {
    this.workItems.forEach((item) => {
      if (item.slug === this.activeSlug) tweenColor(item.material.uniforms.uBlockColor.value as Color, value ?? DEFAULT_BG, 1.6);
    });
  }

  private setRevealSpread(value: number, duration = 1.6, ease = "power4.out") {
    gsap.to(this, {
      revealSpread: value,
      duration,
      ease,
      onUpdate: () => {
        this.workItems.forEach((item) => {
          item.material.uniforms.uRevealSpread.value = this.revealSpread;
        });
      },
    });
  }

  private setSpotLightIntensity(value: number, duration = 1.6, ease = "expo.out") {
    gsap.to(this, {
      spotLightIntensity: MathUtils.clamp(value / this.maxSpotLightIntensity, 0, 1.35),
      duration,
      ease,
      onUpdate: () => {
        this.workItems.forEach((item) => {
          item.material.uniforms.uSpotIntensity.value = this.spotLightIntensity;
        });
      },
    });
  }

  private setFluidStrength(value: number, duration = 0.5) {
    gsap.to(this, {
      fluidStrength: value,
      duration,
      ease: "none",
      onUpdate: () => {
        this.compositeMaterial.uniforms.uFluidStrength.value = this.fluidStrength;
      },
    });
  }

  private setMediaOpacity(value: number, duration = 1.6, ease = "expo.out", delay = 0.25) {
    gsap.to(this, {
      mediaSceneOpacity: value,
      duration,
      ease,
      delay,
      onUpdate: () => {
        this.mediaPlanes.forEach((plane) => {
          plane.material.uniforms.uSceneOpacity.value = this.mediaSceneOpacity;
        });
      },
    });
  }

  private loadTexture(src: string, onLoad: (texture: Texture) => void) {
    const cached = this.textureCache.get(src);
    if (cached) {
      onLoad(cached);
      return;
    }
    this.loader.load(src, (texture) => {
      setTextureQuality(texture, this.renderer);
      this.textureCache.set(src, texture);
      onLoad(texture);
    });
  }

  private payloadFromElement(element: HTMLElement): ProjectPayload {
    return {
      slug: element.dataset.slug ?? element.dataset.project,
      color: element.dataset.color,
      secondary: element.dataset.secondary,
      invert: element.dataset.invert,
      mediaColor: element.dataset.mediaColor,
      thumb: element.dataset.thumb,
      blocks: element.dataset.blocks,
      ambient: element.dataset.ambient,
      darkness: element.dataset.darkness,
      overviewDarkness: element.dataset.overviewDarkness,
      thumbDarkness: element.dataset.thumbDarkness,
      darknessColor: element.dataset.darknessColor,
      saturation: element.dataset.saturation,
      contrast: element.dataset.contrast,
      mouseLightness: element.dataset.mouseLightness,
      spotlight: element.dataset.spotlight,
    };
  }

  private bind() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  private onPointerMove = (event: PointerEvent) => {
    this.targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    this.targetPointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    this.screenMouseSimTargetPos.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    this.mouseSimTargetPos.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
  };

  private onScroll = () => {
    this.updateMediaPlanePositions();
  };

  private resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.6);
    this.renderer.setSize(width, height, false);
    const renderWidth = Math.max(1, Math.round(width * dpr));
    const renderHeight = Math.max(1, Math.round(height * dpr));
    this.compositeTarget.setSize(renderWidth, renderHeight);
    const bloomWidth = Math.max(1, Math.round(renderWidth / 4));
    const bloomHeight = Math.max(1, Math.round(renderHeight / 4));
    this.bloomTarget.setSize(bloomWidth, bloomHeight);
    this.bloomMaterial.uniforms.uTexel.value.set(1 / bloomWidth, 1 / bloomHeight);
    this.homeCamera.aspect = width / height;
    this.homeCamera.updateProjectionMatrix();
    this.backgroundMaterial.uniforms.uRatio.value = width / height;
    this.compositeMaterial.uniforms.uRatio.value = width / height;
    this.displacementMaterial.uniforms.uRatio.value = width / height;
    const thumbSize = Math.max(512, Math.round(height * dpr));
    this.thumbTarget.setSize(thumbSize, thumbSize);
    this.thumbCompositeTarget.setSize(thumbSize, thumbSize);

    const distance = 1000;
    this.mediaCamera.fov = MathUtils.radToDeg(2 * Math.atan(height / (2 * distance)));
    this.mediaCamera.aspect = width / height;
    this.mediaCamera.position.set(0, 0, distance);
    this.mediaCamera.updateProjectionMatrix();

    const mobile = width < BREAKPOINT_LG;
    this.sceneWrap.visible = this.workItems.length > 0;
    this.sceneWrap.position.y = width >= BREAKPOINT_MD ? 0 : 0.3;
    this.projectionPlane.visible = this.sceneWrap.visible;
    this.mediaPlanes.forEach((plane) => {
      plane.mesh.visible = !mobile;
      const rect = plane.track.getBoundingClientRect();
      const style = window.getComputedStyle(plane.track);
      plane.offset.set(-width / 2 + rect.width / 2 + rect.left, height / 2 - rect.height / 2 - (rect.top + window.scrollY));
      plane.mesh.scale.set(rect.width, rect.height, 1);
      plane.material.uniforms.uContainerSize.value.set(Math.max(1, rect.width), Math.max(1, rect.height));
      plane.material.uniforms.uRadius.value = parseFloat(style.borderRadius) || 0;
      plane.material.uniforms.uBackgroundColor.value.copy(this.mediaBackground);
    });
    this.workItems.forEach((item) => {
      item.material.uniforms.uCoords.value.set(Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr)));
    });
    this.updateMediaPlanePositions();
  };

  private updateMediaPlanePositions() {
    const scroll = window.scrollY;
    this.mediaPlanes.forEach((plane) => {
      plane.mesh.position.x = plane.offset.x + plane.translation.x;
      plane.mesh.position.y = plane.offset.y + plane.translation.y + scroll;
      plane.material.uniforms.uCameraDistance.value =
        plane.track.dataset.mediaParallax === "top" ? -scroll : -plane.mesh.position.y;
    });
  }

  private updateThumbGallery(progress: number) {
    if (!this.workItems.length) return;
    const itemWidth = 2;
    const totalWidth = this.workItems.length * itemWidth;
    const thumbProgress = progress * totalWidth;
    this.workItems.forEach((item, index) => {
      const hook = itemWidth * index;
      let x = (hook + thumbProgress + totalWidth * 67890) % totalWidth;
      if (x > totalWidth / 2) x -= totalWidth;
      item.thumb.position.set(x, 0, 0);
      item.thumb.visible = x >= -1.5 && x <= 1.5;
    });
  }

  private updatePointerProjection() {
    if (!this.sceneWrap.visible) return;
    this.raycaster.setFromCamera(this.pointer, this.homeCamera);
    const hit = this.raycaster.intersectObject(this.mousePlane, false)[0];
    if (!hit) return;
    const x = MathUtils.clamp(hit.point.x / (GRID_COLS * 1.3 * GRID_SCALE * 1.5) + 0.5, 0, 1);
    const y = MathUtils.clamp(hit.point.y / (GRID_ROWS * 1.3 * GRID_SCALE * 1.5) + 0.5, 0, 1);
    this.mouseSimTargetPos.set(x, y);
    this.workItems.forEach((item) => {
      item.material.uniforms.uPointer.value.set(x * 2 - 1, y * 2 - 1);
    });
  }

  private updateMouseBrush(
    data: Uint8Array,
    texture: Texture,
    oldPos: Vector2,
    newPos: Vector2,
    targetPos: Vector2,
    delta: number,
    ratio: number,
    strength: number,
  ) {
    const size = 128;
    const lerpFactor = MathUtils.clamp(delta * 7.5, 0, 1);
    newPos.lerp(targetPos, lerpFactor);
    const speed = newPos.distanceTo(oldPos);
    const brushUv = oldPos;
    const sourcePersistence = Math.pow(0.85, delta * 10);
    const thickness = MathUtils.clamp(0.1 + speed * 0.3, 0.0001, 0.2) * strength;
    const previousFlowX = (newPos.x - oldPos.x) * 14;
    const previousFlowY = (newPos.y - oldPos.y) * 14;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        const uvx = (x + 0.5) / size;
        const uvy = (y + 0.5) / size;
        const dx = uvx - brushUv.x;
        const dy = uvy / ratio - brushUv.y / ratio;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const lineValue = 1 - MathUtils.smoothstep(distance, 0, thickness);
        const injection = lineValue * 0.05 * 255;
        const red = MathUtils.clamp(data[index] * sourcePersistence + (255 - data[index]) * (injection / 255), 0, 255);
        const flowX = 128 + MathUtils.clamp(previousFlowX, -1, 1) * red * 0.5;
        const flowY = 128 + MathUtils.clamp(previousFlowY, -1, 1) * red * 0.5;
        data[index] = red;
        data[index + 1] = MathUtils.clamp(data[index + 1] * sourcePersistence + (flowX - 128) * 0.18 + 128 * (1 - sourcePersistence), 0, 255);
        data[index + 2] = MathUtils.clamp(data[index + 2] * sourcePersistence + (flowY - 128) * 0.18 + 128 * (1 - sourcePersistence), 0, 255);
        data[index + 3] = 255;
      }
    }

    oldPos.copy(newPos);
    texture.image.data = data;
    texture.image.width = size;
    texture.image.height = size;
    texture.needsUpdate = true;
    return speed;
  }

  private updateMouseSimulation(delta: number) {
    this.mouseSimSpeed = this.updateMouseBrush(
      this.mouseSimData,
      this.mouseSimTexture,
      this.mouseSimOldPos,
      this.mouseSimNewPos,
      this.mouseSimTargetPos,
      delta,
      GRID_COLS / GRID_ROWS,
      MathUtils.clamp(this.mouseFactor, 0.25, 1),
    );
    this.updateMouseBrush(
      this.screenMouseSimData,
      this.screenMouseSimTexture,
      this.screenMouseSimOldPos,
      this.screenMouseSimNewPos,
      this.screenMouseSimTargetPos,
      delta,
      window.innerWidth / Math.max(1, window.innerHeight),
      1,
    );
  }

  private tick = () => {
    const time = performance.now() * 0.001;
    const delta = MathUtils.clamp(time - this.lastTickTime, 1 / 120, 1 / 20);
    this.lastTickTime = time;
    this.pointer.lerp(this.targetPointer, 0.055);
    this.updatePointerProjection();
    this.updateMouseSimulation(delta);
    this.workItems.forEach((item) => {
      item.material.uniforms.uTime.value = time;
      item.material.uniforms.uMouseFactor.value = this.mouseFactor;
      item.material.uniforms.uSpotLightPosition.value.copy(this.spotLightPosition);
      const world = new Vector3();
      item.group.getWorldPosition(world);
      item.group.visible = !(world.x > 5.5 || world.x < -5.5 || world.z > 5);
      const sideReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 0, 5, 0, 1), 0, 1);
      const sideSpreadReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 2, 6, 0, 1), 0, 1);
      item.material.uniforms.uRevealSides.value = sideReveal;
      item.material.uniforms.uRevealSpreadSides.value = sideSpreadReveal;
    });
    this.homeCamera.position.x += (this.pointer.x * 0.25 - this.homeCamera.position.x) * 0.08;
    this.homeCamera.position.y += (this.pointer.y * 0.25 - this.homeCamera.position.y) * 0.08;
    this.homeCamera.lookAt(0, 0, 0);
    this.spotLightPosition.x = this.homeCamera.position.x * 0.175;
    this.spotLightPosition.y = (window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3) + this.homeCamera.position.y * 0.175;
    this.spotLightPosition.z = 3.7;
    this.particles.rotation.z = time * 0.015 + this.galleryProgress * Math.PI * 0.2;
    this.particles.position.x = this.pointer.x * 0.1;
    this.particles.position.y = this.pointer.y * 0.08;
    this.backgroundMaterial.uniforms.uTime.value = time;
    this.backgroundMaterial.uniforms.uProgress.value = this.galleryProgress;
    this.compositeMaterial.uniforms.uTime.value = time;
    this.compositeMaterial.uniforms.uProgress.value = this.galleryProgress;
    this.compositeMaterial.uniforms.uFluidStrength.value = this.fluidStrength;
    this.displacementMaterial.uniforms.uTime.value = time;
    this.floorMaterial.uniforms.uTime.value = time;
    this.environmentMaterial.uniforms.uTime.value = time;
    this.updateMediaPlanePositions();

    this.renderer.clear();
    this.renderer.setRenderTarget(this.displacementTarget);
    this.renderer.clear();
    this.renderer.render(this.displacementScene, this.backgroundCamera);
    this.renderer.setRenderTarget(this.thumbTarget);
    this.renderer.clear();
    this.renderer.render(this.thumbScene, this.thumbCamera);
    this.renderer.setRenderTarget(this.thumbCompositeTarget);
    this.renderer.clear();
    this.renderer.render(this.thumbCompositeScene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    const hasHome = this.sceneWrap.visible;
    const hasMedia = this.mediaPlanes.some((plane) => plane.mesh.visible);
    if (!hasHome && hasMedia) {
      this.renderer.render(this.backgroundScene, this.backgroundCamera);
    }
    if (hasHome) {
      this.renderer.setRenderTarget(this.compositeTarget);
      this.renderer.clear();
      this.renderer.render(this.homeScene, this.homeCamera);
      this.renderer.setRenderTarget(this.bloomTarget);
      this.renderer.clear();
      this.renderer.render(this.bloomScene, this.backgroundCamera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.compositeScene, this.backgroundCamera);
    }
    if (hasMedia) this.renderer.render(this.mediaScene, this.mediaCamera);
    this.raf = requestAnimationFrame(this.tick);
  };
}

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
  thumbSaturation?: string | number;
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
  parallaxTop: boolean;
  video?: HTMLVideoElement;
  texture?: Texture;
};

const BREAKPOINT_LG = 1000;
const BREAKPOINT_MD = 800;
const SOURCE_MAX_DPR = 1.5;
const SOURCE_WORK_BG = "#1a1a1a";
const SOURCE_COMPOSITE_BG = "#1f1f1f";
const DEFAULT_BG = SOURCE_WORK_BG;
const DEFAULT_COLOR = "#bcbcbc";
const GRID_COLS = 35;
const GRID_ROWS = 23;
const SOURCE_GRID_LAYERS = 7;
const SOURCE_LOW_RES_GRID_LAYERS = 4;
const GRID_CUBE_SIZE = 1.25;
const GRID_SPACING = 0.1;
const GRID_SCALE = 0.09;
const MOUSE_SIM_SCALE = 4;

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
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceColor;

varying vec2 vThumbUv;
varying vec2 vLocalUv;
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
uniform vec3 uSpotLightTarget;
uniform vec3 uSpotLightRight;
uniform vec3 uSpotLightUp;
uniform float uSpotConeTan;
uniform float uSpotIntensity;
uniform float uTime;

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
  float perlinHeight = 10.0;
  float perlinDisplacement = perlinMap.r * perlinHeight;
  perlinDisplacement *= fade;

  vec3 perlinDisplaced = transformed;
  perlinDisplaced.z += perlinDisplacement - perlinHeight * 0.5;
  perlinDisplaced *= min(1.0, 1.0 - (perlinDisplacement - perlinHeight * 0.5) * 0.1);
  transformed = mix(transformed, perlinDisplaced, (1.0 - fadeDisplacement) * 0.25);
  transformed *= fade * uRevealSides;

  vec2 mouseUv = (instanceGrid.xy + uMouseUvOffset) / uMouseUvScale;
  float mouse = texture2D(tMouseSim, mouseUv).r;
  float displacement = displacementMap.r;
  transformed *= 1.0 - mouse * 0.05;
  transformed.z -= 1.5;
  transformed.z += displacement * 3.0 + 6.0 * (1.0 - revealMask);
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

  vec3 spotTransformed = transformed / max(0.001, 1.0 - mouse * 0.2);
  vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
  vec4 spotMvPosition = instanceMatrix * vec4(spotTransformed, 1.0);
  vec4 worldPosition = modelMatrix * spotMvPosition;
  vec3 lightDir = normalize(uSpotLightTarget - uSpotLightPosition);
  vec3 fromLight = worldPosition.xyz - uSpotLightPosition;
  float lightDepth = max(0.001, dot(fromLight, lightDir));
  vec2 lightPlane = vec2(dot(fromLight, uSpotLightRight), dot(fromLight, uSpotLightUp));
  vec2 spotUv = lightPlane / (lightDepth * uSpotConeTan) * 0.5 + 0.5;
  vec2 spotDelta = spotUv - 0.5;
  float spotRadius = length(spotDelta);
  float coneMask = 1.0 - smoothstep(0.45, 0.5, spotRadius);
  float depthMask = smoothstep(0.0, 0.9, lightDepth) * (1.0 - smoothstep(12.0, 17.0, lightDepth));
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

  vThumbUv = instanceGrid.xy;
  vLocalUv = uv;
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
uniform float uDirectionalLightIntensity;
uniform float uRevealSides;
uniform float uMouseFactor;
uniform vec2 uPointer;
uniform sampler2D tMouseSim;
uniform sampler2D tMouseSim2;
uniform vec2 uCoords;

varying vec2 vThumbUv;
varying vec2 vLocalUv;
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
  vec2 uv = vLocalUv / vec2(35.0, 23.0) + vThumbUv;
  vec2 projectedUv = (uv - 0.5) * 0.48 + 0.5;
  vec3 gridThumb = mix(texture2D(tThumb, uv).rgb, texture2D(tThumb, projectedUv).rgb, 0.22);
  vec3 spotThumb = texture2D(tThumb, vSpotUv).rgb;
  float spotMask = vSpotMask * smoothstep(0.0, 0.08, vSpotUv.x) * smoothstep(1.0, 0.92, vSpotUv.x) * smoothstep(0.0, 0.08, vSpotUv.y) * smoothstep(1.0, 0.92, vSpotUv.y);
  vec3 thumb = mix(gridThumb, spotThumb, spotMask * 0.58);
  thumb = (thumb - 0.5) * uContrast + 0.5;
  thumb = saturateColor(thumb, uSaturation);
  float lum = dot(thumb, vec3(0.2126, 0.7152, 0.0722));
  float centerMask = sourceVignette(uv, vec2(0.5), 0.01, 0.2, 6.0, 1.0);
  float spotCenter = pow(1.0 - smoothstep(0.0, 0.5, length(vSpotUv - 0.5)), 1.6) * spotMask;
  float neutral = 1.0 - smoothstep(0.04, 0.22, length(thumb - vec3(lum)));
  float centeredLum = lum * (0.3 + centerMask * 0.55 + spotCenter * 1.1);
  float lightMask = smoothstep(0.14, 0.66, centeredLum);
  float logoMask = smoothstep(0.18, 0.56, lum) * neutral * max(centerMask, spotCenter * 0.8);
  lightMask = max(lightMask * (0.18 + centerMask * 0.38 + spotCenter * 0.85), logoMask * 0.68);
  float hotMask = max(smoothstep(0.52, 0.9, centeredLum), logoMask * 0.7);

  float directional = dot(normalize(vLocalNormal), normalize(vec3(-0.35, 0.62, 0.72))) * 0.5 + 0.5;
  float faceLight = mix(1.0, clamp(directional, 0.45, 1.2), clamp(uDirectionalLightIntensity / 1.5, 0.0, 2.0));
  vec3 base = mix(vec3(0.026, 0.031, 0.04), uBlockColor, 0.34);
  vec3 projection = mix(uTint * (0.42 + lightMask * 0.72), thumb * (0.75 + spotMask * 0.38), 0.38 + spotMask * 0.18);
  vec3 color = mix(base, projection, 0.34 + lightMask * 0.32);
  color += thumb * (0.08 + lightMask * 0.34 + spotMask * 0.24);
  color += vec3(1.0) * hotMask * 0.34;
  color += uTint * pow(max(lightMask, 0.0), 1.65) * 0.22;
  color = mix(color, uTint, 0.025 + lightMask * 0.045);
  color = mix(color, uDarknessColor, uDarkness * (0.06 + (1.0 - lum) * 0.16));
  color *= faceLight;

  vec2 pointerUv = uPointer * 0.5 + 0.5;
  vec2 screenUv = gl_FragCoord.xy / max(uCoords, vec2(1.0));
  float pointerLight = 1.0 - smoothstep(0.02, 0.58, distance(vThumbUv, pointerUv));
  float simLight = texture2D(tMouseSim2, screenUv).r;
  float mouseLight = max(pointerLight, simLight);
  float mouseF = 1.0 - simLight;
  color *= 0.78 + mouseLight * 0.18;
  color = mix(color, color * vec3(mouseF), 1.0 - uMouseLightness);

  vec2 gridUv = vec2(floor(uv.x * 35.0), floor(uv.y * 23.0));
  vec2 gridUv2 = vec2(floor(uv.y * 23.0), floor(uv.x * 23.0));
  float alpha1 = mix(random(gridUv * vAlpha), random(gridUv), 1.0);
  float alpha2 = mix(random(gridUv2 * vAlpha), random(gridUv2), 1.0);
  float alpha = alpha1 * alpha2 * vAlpha;
  float revealCombined = clamp(vReveal, 0.0, 1.0);
  float revealRadius = 2.0 * pow(max(revealCombined, 0.0001), 0.25);
  float centerAlpha = sourceVignette(uv, vec2(0.5), 0.01, 0.2, 6.0, 1.0);
  float revealAlpha = sourceVignette(uv, vec2(0.5), 0.01, revealRadius, 6.0, 1.0);
  if (screenUv.y > 0.1) alpha += clamp(simLight * (uMouseFactor * 0.5), 0.0, 1.0);
  alpha += centerAlpha * 0.1;
  alpha -= 1.0 - revealAlpha;
  alpha *= uRevealSides;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.9));
}
`;

const homeCompositeFragment = `
precision highp float;

uniform sampler2D tWork;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tMouseSim;
uniform bool boolBloom;
uniform float uReveal;
uniform float uDarken;
uniform float uSaturation;
uniform float uBloomDistortion;
uniform vec3 uBgColor;

varying vec2 vUv;

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

vec4 rgbshift(sampler2D tex, vec2 uv, float angle, float amount) {
  vec2 offset = vec2(cos(angle), sin(angle)) * amount;
  float r = texture2D(tex, uv + offset).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - offset).b;
  float a = texture2D(tex, uv).a;
  return vec4(r, g, b, a);
}

void main() {
  vec2 uv = vUv;
  vec4 fluid = texture2D(tFluid, uv);
  vec4 mouseSim = texture2D(tMouseSim, uv);
  vec3 color = rgbshift(tWork, uv, -1.0, 0.0015).rgb;
  if (boolBloom) {
    vec3 bloom = rgbshift(tBloom, uv, -1.5, 0.02).rgb;
    float amount = 0.001 * uBloomDistortion;
    vec3 bloomShift = rgbshift(tBloom, uv, length(uv + 0.5), amount / 0.5).rgb;
    color += bloom;
    color += bloomShift;
  }
  color += length(fluid.xy) * 0.015;
  color = blendMultiply(color, vec3(0.095), uDarken * 2.0 + mouseSim.r * 0.25 * uDarken);
  color = blendLighten(color, vec3(0.095), 1.0);
  color = saturation(color, uSaturation);
  color = mix(uBgColor, color, uReveal);

  gl_FragColor = vec4(color, 1.0);
}
`;

const homePreCompositeFragment = `
precision highp float;

uniform sampler2D tWork;
uniform sampler2D tFluid;
uniform sampler2D tMouseSim;
uniform sampler2D tNoise;
uniform sampler2D tPerlin;
uniform float uTime;
uniform float uRatio;
uniform float uTransformX;
uniform float uFluidStrength;
uniform float uPerlin;
uniform float uContrast;
uniform vec3 uBgColor;

varying vec2 vUv;

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

void main() {
  vec2 uv = vUv;
  vec2 baseUv = vUv;
  vec2 perlinUv = uv * 0.25;
  perlinUv -= 0.5;
  perlinUv.x *= uRatio;
  perlinUv += 0.5;
  perlinUv.x -= uTime * 0.01;
  perlinUv.y -= uTime * 0.005;
  perlinUv.x += uTransformX;

  vec4 perlin = texture2D(tPerlin, perlinUv);
  perlin.rgb = contrast(perlin.rgb, 5.0);

  vec4 fluid = texture2D(tFluid, uv);
  vec2 fluidUv = uv + fluid.rg * -0.2 * uFluidStrength;
  uv = fluidUv;
  vec2 perlinCoords = baseUv;
  if (uPerlin > 0.0) {
    perlinCoords += perlin.b * uPerlin;
    perlinCoords -= uPerlin * 0.065;
  }

  vec4 mouseSim = texture2D(tMouseSim, mix(perlinCoords, uv, 2.5));
  mouseSim.rgb = contrast(mouseSim.rgb, 1.0);

  float perlinVignette = vignette(perlinCoords, 0.1, 0.35);
  float displacementVignette = vignette(uv, 0.1, 0.5);
  vec4 sceneDisplaced = rgbshift(tWork, uv, -1.0, 0.005);
  vec4 scene = rgbshift(tWork, uv, -1.0, 0.0005 + 0.1 * length(fluid.xy) * uFluidStrength);
  vec3 color = mix(scene.rgb, sceneDisplaced.rgb, 1.0 - displacementVignette);
  color = mix(uBgColor, color, 1.0);
  color += mouseSim.rgb * 0.065;
  color = mix(color, color * 5.0, (1.0 - perlinVignette) * 0.075);
  color = blendAdd(color, perlin.rgb, (1.0 - displacementVignette + mouseSim.r * 0.5) * 0.05);
  color = contrast(color, uContrast);
  color *= uContrast;
  color = saturation(color, 1.15);
  color = blendLighten(color, uBgColor, 0.85);

  vec2 noiseUv = uv - 0.5;
  noiseUv.x *= uRatio;
  noiseUv += 0.5;
  noiseUv *= 15.0;
  vec3 noise = texture2D(tNoise, noiseUv).rgb;
  color = mix(color * noise, color, 0.75);
  color = mix(color * noise, color, 1.5);

  gl_FragColor = vec4(color, 1.0);
}
`;

const homeLuminosityFragment = `
precision highp float;

uniform sampler2D tScene;
uniform float uThreshold;
uniform float uSmoothing;

varying vec2 vUv;

void main() {
  vec3 color = texture2D(tScene, vUv).rgb;
  float luma = dot(color, vec3(0.2125, 0.7154, 0.0721));
  float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, luma);
  gl_FragColor = vec4(color * alpha, 1.0);
}
`;

const homeBloomBlurFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;
uniform vec2 uDirection;

varying vec2 vUv;

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec2 off1 = vec2(1.411764705882353) * direction / resolution;
  vec2 off2 = vec2(3.2941176470588234) * direction / resolution;
  vec2 off3 = vec2(5.176470588235294) * direction / resolution;
  vec4 color = texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + off1) * 0.2969069646728344;
  color += texture2D(image, uv - off1) * 0.2969069646728344;
  color += texture2D(image, uv + off2) * 0.09447039785044732;
  color += texture2D(image, uv - off2) * 0.09447039785044732;
  color += texture2D(image, uv + off3) * 0.010381362401148057;
  color += texture2D(image, uv - off3) * 0.010381362401148057;
  return color;
}

void main() {
  gl_FragColor = blur13(tMap, vUv, uResolution, uDirection);
}
`;

const homeBloomCompositeFragment = `
precision highp float;

uniform sampler2D tBloom1;
uniform sampler2D tBloom2;
uniform sampler2D tBloom3;
uniform sampler2D tBloom4;
uniform sampler2D tBloom5;
uniform float uFactor1;
uniform float uFactor2;
uniform float uFactor3;
uniform float uFactor4;
uniform float uFactor5;

varying vec2 vUv;

void main() {
  vec3 color = texture2D(tBloom1, vUv).rgb * uFactor1;
  color += texture2D(tBloom2, vUv).rgb * uFactor2;
  color += texture2D(tBloom3, vUv).rgb * uFactor3;
  color += texture2D(tBloom4, vUv).rgb * uFactor4;
  color += texture2D(tBloom5, vUv).rgb * uFactor5;
  gl_FragColor = vec4(color, 1.0);
}
`;

const mouseSimulationFragment = `
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uNoiseTexture;
uniform vec2 uPosOld;
uniform vec2 uPosNew;
uniform vec2 uCoords;
uniform float uSpeed;
uniform float uPersistance;
uniform float uThickness;
uniform float uTime;
uniform float uDiffusionSize;
uniform float uDiffusion;
uniform vec3 uColor;

varying vec2 vUv;

float circle(vec2 uv, vec2 center, float size) {
  float circle = length(uv - center);
  return 1.0 - smoothstep(0.0, size, circle);
}

void main() {
  vec4 noise1 = texture2D(uNoiseTexture, vUv * 4.0 + vec2(uTime * 0.1, 0.0));
  vec4 noise2 = texture2D(uNoiseTexture, vUv * 8.0 + vec2(0.0, uTime * 0.1) + noise1.rg * 0.5);
  vec4 noise3 = texture2D(uNoiseTexture, vUv * 16.0 + vec2(-uTime * 0.05, 0.0) + noise2.rg * 0.5);
  vec4 noise = (noise1 + noise2 * 0.5 + noise3 * 0.25) / 1.75;

  float dirX = (-0.5 + noise.g) * noise.r * 10.0;
  float dirY = (-0.5 + noise.b) * noise.r * 10.0;
  vec4 oldTexture = texture2D(uTexture, vUv);
  float br = 1.0 - (oldTexture.r + oldTexture.g + oldTexture.b) / 3.0;
  vec4 col = oldTexture * (1.0 - uDiffusion);
  float p2 = uDiffusion / 4.0;
  col += texture2D(uTexture, vUv + vec2(dirX, dirY) * uDiffusionSize * br) * p2;
  col += texture2D(uTexture, vUv + vec2(dirY, dirX) * uDiffusionSize * br) * p2;
  col.rgb *= uPersistance;

  if (uSpeed > 0.0) {
    float th = clamp(uThickness + uSpeed * 0.3, 0.0001, 0.2);
    vec2 newUv = vUv;
    float ratio = uCoords.x / uCoords.y;
    newUv.y /= ratio;
    vec2 posOld = uPosOld;
    posOld.y /= ratio;
    float lineValue = circle(newUv, posOld, th);
    col.rgb = mix(col.rgb, uColor, lineValue * 0.05);
    col.rgb = clamp(col.rgb, vec3(0.0), vec3(1.0));
  }

  gl_FragColor = vec4(col.rgb, 1.0);
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
  vec2 sourceUv = (vUv - 0.5) * 0.34 + 0.5;
  vec3 thumb = texture2D(tThumb, sourceUv).rgb;
  float lum = dot(thumb, vec3(0.2126, 0.7152, 0.0722));
  float neutral = 1.0 - smoothstep(0.04, 0.22, length(thumb - vec3(lum)));
  float center = pow(vignette(vUv, vec2(0.5), 0.02, 0.52), 2.4);
  float mask = max(smoothstep(0.36, 0.76, lum), neutral * smoothstep(0.28, 0.68, lum));
  mask *= center * uReveal;
  vec3 color = mix(uTint * 0.95, vec3(1.0), smoothstep(0.52, 0.86, lum));
  color += thumb * 0.1;
  gl_FragColor = vec4(color, clamp(mask * uOpacity, 0.0, 0.035));
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
  vec4 fallback = vec4(vUv.x, vUv.y, 0.0, 0.0);
  vec4 mixed = transition(map, fallback, 1.0 - uProgress, vUv);
  gl_FragColor = mixed;
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

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return base * blend * opacity + base * (1.0 - opacity);
}

void main() {
  vec4 color = texture2D(tScene, vUv);
  color.rgb = blendMultiply(color.rgb, uDarknessColor, uDarkness);
  color.rgb = saturateColor(color.rgb, uSaturation);
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

function makePlaceholderTexture(color = [20, 20, 20, 255]) {
  const texture = new DataTexture(new Uint8Array(color), 1, 1, RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function makeSimulationTarget() {
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  target.texture.generateMipmaps = false;
  target.texture.minFilter = LinearFilter;
  target.texture.magFilter = LinearFilter;
  return target;
}

function setTextureQuality(texture: Texture, renderer: WebGLRenderer) {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function floorPowerOfTwo(value: number) {
  return Math.pow(2, Math.floor(Math.log(Math.max(1, value)) / Math.LN2));
}

function sourceDpr() {
  return Math.min(window.devicePixelRatio || 1, SOURCE_MAX_DPR);
}

function sourceLowRes() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return Boolean(nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory < 4));
}

function tweenColorOwned(target: Color, value?: string, duration = 1.6, tweens?: gsap.core.Tween[], fallback?: string) {
  const next = colorFrom(value, fallback ?? `#${target.getHexString()}`);
  if (duration <= 0) {
    target.copy(next);
    return;
  }
  const tween = gsap.to(target, {
    r: next.r,
    g: next.g,
    b: next.b,
    duration,
    ease: "expo.out",
  });
  tweens?.push(tween);
}

export class WebGLBackdrop {
  private root: HTMLElement;
  private renderer: WebGLRenderer;
  private backgroundScene = new Scene();
  private homeScene = new Scene();
  private thumbScene = new Scene();
  private mediaScene = new Scene();
  private mouseSimulationScene = new Scene();
  private screenMouseSimulationScene = new Scene();
  private backgroundCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private homeCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private thumbCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private mediaCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private sceneWrap = new Group();
  private thumbWrap = new Group();
  private workItems: WorkItem[] = [];
  private mediaPlanes: MediaPlane[] = [];
  private loader = new TextureLoader();
  private textureCache = new Map<string, Texture>();
  private placeholder = makePlaceholderTexture();
  private fluidPlaceholder = makePlaceholderTexture([0, 0, 0, 255]);
  private noiseTexture = makePlaceholderTexture([255, 255, 255, 255]);
  private perlinTexture = makePlaceholderTexture([128, 128, 128, 255]);
  private backgroundMaterial: ShaderMaterial;
  private compositeMaterial: ShaderMaterial;
  private compositeScene = new Scene();
  private workRawTarget = new WebGLRenderTarget(1, 1, { depthBuffer: true, stencilBuffer: false });
  private preCompositeMaterial: ShaderMaterial;
  private preCompositeScene = new Scene();
  private compositeTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  private luminosityMaterial: ShaderMaterial;
  private luminosityScene = new Scene();
  private bloomBlurMaterial: ShaderMaterial;
  private bloomBlurScene = new Scene();
  private bloomBrightTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  private bloomTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  private bloomHorizontalTargets: WebGLRenderTarget[] = [];
  private bloomVerticalTargets: WebGLRenderTarget[] = [];
  private bloomCompositeMaterial: ShaderMaterial;
  private bloomCompositeScene = new Scene();
  private displacementMaterial: ShaderMaterial;
  private displacementScene = new Scene();
  private displacementTarget = new WebGLRenderTarget(128, 128, { depthBuffer: false, stencilBuffer: false });
  private mouseSimulationMaterial: ShaderMaterial;
  private screenMouseSimulationMaterial: ShaderMaterial;
  private mouseSimulationTargets: WebGLRenderTarget[] = [];
  private screenMouseSimulationTargets: WebGLRenderTarget[] = [];
  private mouseSimulationIndex = 0;
  private screenMouseSimulationIndex = 0;
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
  private pointerPixels = new Vector2(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2);
  private lastPointerPixels = this.pointerPixels.clone();
  private pointerDeltaPixels = new Vector2();
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
  private cameraOrigin = new Vector3(0, 0, 5.5);
  private cameraTarget = new Vector3(0, 0, 5.5);
  private cameraLookAt = new Vector3(0, 0, 0);
  private cameraTargetXY = new Vector2(1, 0.5);
  private cameraRoll = 0;
  private cameraRotateAngle = MathUtils.degToRad(20);
  private activeSlug = "";
  private mouseFactor = 0;
  private mouseFactorTween?: gsap.core.Tween;
  private mainColorTweens: gsap.core.Tween[] = [];
  private ambientTweens: gsap.core.Tween[] = [];
  private mediaBackgroundTweens: gsap.core.Tween[] = [];
  private saturationTween?: gsap.core.Tween;
  private contrastTween?: gsap.core.Tween;
  private contrastBlockTweens: gsap.core.Tween[] = [];
  private blockColorTweens: gsap.core.Tween[] = [];
  private thumbDarknessTweens: gsap.core.Tween[] = [];
  private thumbDarknessColorTweens: gsap.core.Tween[] = [];
  private thumbSaturationTweens: gsap.core.Tween[] = [];
  private thumbMouseLightnessTweens: gsap.core.Tween[] = [];
  private darkenTween?: gsap.core.Tween;
  private revealSpreadTween?: gsap.core.Tween;
  private sceneRevealTween?: gsap.core.Tween;
  private spotLightTween?: gsap.core.Tween;
  private directionalLightTween?: gsap.core.Tween;
  private fluidStrengthTween?: gsap.core.Tween;
  private mediaOpacityTween?: gsap.core.Tween;
  private mediaTranslationTweens: gsap.core.Tween[] = [];
  private maxSpotLightIntensity = 220;
  private spotLightIntensity = 1;
  private directionalLightIntensity = 1.5;
  private spotLightPosition = new Vector3(0, 0, 3.7);
  private spotLightTarget = new Vector3(0, 0, -8);
  private spotLightRight = new Vector3(1, 0, 0);
  private spotLightUp = new Vector3(0, 1, 0);
  private fluidStrength = 0.5;
  private sceneReveal = 0;
  private revealSpread = 0;
  private projectRevealTweens: gsap.core.Tween[] = [];
  private projectRevealProjectTweens: gsap.core.Tween[] = [];
  private projectBlockStateTweens: gsap.core.Tween[] = [];
  private currentAmbientIntensity = 0.5;
  private mediaBackground = colorFrom(DEFAULT_BG);
  private mediaSceneOpacity = 0;
  private gridLayers = SOURCE_GRID_LAYERS;
  private radius = 8;

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(colorFrom(SOURCE_WORK_BG), 0);
    this.renderer.setPixelRatio(sourceDpr());
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.domElement.className = "gl-canvas";
    this.root.appendChild(this.renderer.domElement);
    document.body.classList.add("has-webgl");

    this.homeCamera.position.set(0, 0, 5.5);
    this.thumbCamera.position.set(0, 0, 0);
    this.mediaCamera.position.set(0, 0, 1000);
    this.homeScene.background = colorFrom(SOURCE_WORK_BG);
    this.backgroundMaterial = this.createBackgroundMaterial();
    this.backgroundScene.add(new Mesh(new PlaneGeometry(2, 2), this.backgroundMaterial));
    this.preCompositeMaterial = this.createPreCompositeMaterial();
    this.preCompositeScene.add(new Mesh(new PlaneGeometry(2, 2), this.preCompositeMaterial));
    this.compositeMaterial = this.createCompositeMaterial();
    this.compositeScene.add(new Mesh(new PlaneGeometry(2, 2), this.compositeMaterial));
    this.bloomHorizontalTargets = Array.from({ length: 5 }, () => new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false }));
    this.bloomVerticalTargets = Array.from({ length: 5 }, () => new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false }));
    this.luminosityMaterial = this.createLuminosityMaterial();
    this.luminosityScene.add(new Mesh(new PlaneGeometry(2, 2), this.luminosityMaterial));
    this.bloomBlurMaterial = this.createBloomBlurMaterial();
    this.bloomBlurScene.add(new Mesh(new PlaneGeometry(2, 2), this.bloomBlurMaterial));
    this.bloomCompositeMaterial = this.createBloomCompositeMaterial();
    this.bloomCompositeScene.add(new Mesh(new PlaneGeometry(2, 2), this.bloomCompositeMaterial));
    this.gridLayers = sourceLowRes() ? SOURCE_LOW_RES_GRID_LAYERS : SOURCE_GRID_LAYERS;
    this.displacementMaterial = this.createDisplacementMaterial();
    this.displacementScene.add(new Mesh(new PlaneGeometry(2, 2), this.displacementMaterial));
    this.mouseSimulationMaterial = this.createMouseSimulationMaterial(GRID_COLS / GRID_ROWS, 0.1, 0.85);
    this.screenMouseSimulationMaterial = this.createMouseSimulationMaterial(window.innerWidth / Math.max(1, window.innerHeight), 0.1, 0.85);
    this.mouseSimulationTargets = Array.from({ length: 2 }, makeSimulationTarget);
    this.screenMouseSimulationTargets = Array.from({ length: 2 }, makeSimulationTarget);
    this.mouseSimulationScene.add(new Mesh(new PlaneGeometry(2, 2), this.mouseSimulationMaterial));
    this.screenMouseSimulationScene.add(new Mesh(new PlaneGeometry(2, 2), this.screenMouseSimulationMaterial));
    this.thumbCompositeMaterial = this.createThumbCompositeMaterial();
    this.thumbCompositeScene.add(new Mesh(new PlaneGeometry(2, 2), this.thumbCompositeMaterial));
    this.projectionMaterial = this.createProjectionMaterial();
    this.projectionPlane = new Mesh(new PlaneGeometry(2.6, 1.82), this.projectionMaterial);
    this.projectionPlane.position.set(0, 0, 0);
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
    this.setThumbSaturation(numeric(payload.thumbSaturation, 1));
    this.setThumbMouseLightness(numeric(payload.mouseLightness, 1));
    this.setBlocksColor(payload.blocks ?? DEFAULT_BG);
    this.setSpotLightIntensity(numeric(payload.spotlight, this.maxSpotLightIntensity), 1);
    this.setDirectionalLightIntensity(1.5);
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
    this.preCompositeMaterial.uniforms.uTransformX.value = progress;
    const targetRotation = MathUtils.degToRad(progress * 360 + 180);
    const lerpFactor = 1 - Math.exp(-5 * Math.max(0.001, delta));
    this.sceneRotation += (MathUtils.clamp(velocity * -0.015, -4, 4) - this.sceneRotation) * lerpFactor;
    this.zoom += (MathUtils.clamp(Math.abs(velocity * 0.0015), 0, 1) - this.zoom) * lerpFactor;
    this.sceneWrap.rotation.y = targetRotation;
    this.homeScene.rotation.z = MathUtils.degToRad(this.sceneRotation);
    this.homeScene.position.z = this.homeScene.rotation.z - this.zoom;
    this.updateThumbGallery(-progress);
  }

  enterWorkGallery(activeSlug = this.activeSlug) {
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealProjectTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.projectRevealProjectTweens = [];
    this.setMouseFactor(0, 0);
    this.setMouseFactor(1, 3);
    this.workItems.forEach((item) => {
      item.material.uniforms.uReveal.value = 0;
      this.projectRevealProjectTweens.push(gsap.to(item.material.uniforms.uRevealProject, { value: 1, duration: 0.5, ease: "none" }));
    });
    const active = this.workItems.find((item) => item.slug === activeSlug) ?? this.workItems[0];
    if (active) this.setProjectBlockReveal(active);
  }

  restoreGalleryState(progress: number, sceneRotation = 0, zoom = 0) {
    this.galleryProgress = progress;
    this.sceneRotation = sceneRotation;
    this.zoom = zoom;
    this.preCompositeMaterial.uniforms.uTransformX.value = progress;
    this.sceneWrap.rotation.y = MathUtils.degToRad(progress * 360 + 180);
    this.homeScene.rotation.z = MathUtils.degToRad(sceneRotation);
    this.homeScene.position.z = this.homeScene.rotation.z - zoom;
    this.updateThumbGallery(-progress);
  }

  setCameraControllerSettings(
    lookAt: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    targetXY: { x: number; y: number } = { x: 0.25, y: 0.25 },
    rotateAngle = 10,
  ) {
    this.cameraLookAt.set(lookAt.x, lookAt.y, lookAt.z);
    this.cameraTargetXY.set(targetXY.x, targetXY.y);
    this.cameraRotateAngle = MathUtils.degToRad(rotateAngle);
  }

  setPreviewMode(enabled: boolean) {
    this.setMouseFactor(enabled ? 0.25 : 1, 3);
  }

  animateWorkMouseIn() {
    this.setMouseFactor(0, 0);
    this.setMouseFactor(1, 3);
  }

  showScene() {
    this.sceneRevealTween?.kill();
    this.sceneRevealTween = gsap.to(this, {
      sceneReveal: 1,
      duration: 1.6,
      ease: "expo.out",
      onUpdate: () => {
        this.compositeMaterial.uniforms.uReveal.value = this.sceneReveal;
      },
    });
  }

  hideWorkScene() {
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealProjectTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.projectRevealProjectTweens = [];
    this.setRevealSpread(1, 0.65, "power3.in");
    this.setSpotLightIntensity(0, 1, "none");
    this.setFluidStrength(0.5, 0.5);
    this.setMouseFactor(1, 0.5);
    gsap.to(this.projectionMaterial.uniforms.uReveal, { value: 0, duration: 0.5, ease: "none" });
    this.workItems.forEach((item) => {
      this.projectRevealProjectTweens.push(gsap.to(item.material.uniforms.uRevealProject, { value: 0, duration: 0.5, ease: "none" }));
    });
  }

  mediaAnimateIn() {
    this.setMediaOpacity(1, 1.6, "expo.out", 0.25);
    this.mediaTranslationTweens.forEach((tween) => tween.kill());
    this.mediaTranslationTweens = [];
    this.mediaPlanes.forEach((plane) => {
      this.mediaTranslationTweens.push(gsap.to(plane.translation, {
        y: 0,
        duration: 1.6,
        delay: 0.25,
        ease: "expo.out",
      }));
    });
  }

  setProjectScrollState(payload: ProjectPayload) {
    const ambientIntensity = numeric(payload.ambient, 0.5);
    const ambientColor = ambientIntensity < 0 && payload.invert ? payload.invert : payload.secondary;
    this.setMainColor(payload.color);
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setSaturation(numeric(payload.saturation, 1));
    this.setContrast(numeric(payload.contrast, 1.15));
  }

  projectLeave() {
    this.mediaTranslationTweens.forEach((tween) => tween.kill());
    this.mediaTranslationTweens = [];
    this.setMediaOpacity(0, 0.5, "none", 0);
    this.setFluidStrength(0.5, 0.5);
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
    this.noiseTexture.dispose();
    this.fluidPlaceholder.dispose();
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
    this.workRawTarget.dispose();
    this.preCompositeMaterial.dispose();
    this.compositeTarget.dispose();
    this.compositeMaterial.dispose();
    this.bloomBrightTarget.dispose();
    this.bloomTarget.dispose();
    this.bloomHorizontalTargets.forEach((target) => target.dispose());
    this.bloomVerticalTargets.forEach((target) => target.dispose());
    this.luminosityMaterial.dispose();
    this.bloomBlurMaterial.dispose();
    this.bloomCompositeMaterial.dispose();
    this.displacementTarget.dispose();
    this.displacementMaterial.dispose();
    this.mouseSimulationTargets.forEach((target) => target.dispose());
    this.screenMouseSimulationTargets.forEach((target) => target.dispose());
    this.mouseSimulationMaterial.dispose();
    this.screenMouseSimulationMaterial.dispose();
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
      const mesh = this.createBlockMesh(material);
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
        thumb.material.uniforms.uMapSize.value.set(1, 1);
        thumb.material.uniforms.uResolution.value.set(1, 1);
      });
    });
    this.environmentPlane.rotation.y = -MathUtils.degToRad(rotationAdjustment);
  }

  private createWorkBlockMaterial(payload: ProjectPayload, reveal: number) {
    const thumbDarkness = payload.thumbDarkness ?? payload.darkness;
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tThumb: { value: this.thumbCompositeTarget.texture },
        uMapSize: { value: new Vector2(1600, 1200) },
        uGridSize: { value: new Vector3(GRID_COLS, GRID_ROWS, this.gridLayers) },
        uTint: { value: colorFrom(payload.color) },
        uBlockColor: { value: colorFrom(payload.blocks ?? DEFAULT_BG, DEFAULT_BG) },
        uDarknessColor: { value: colorFrom(payload.darknessColor ?? payload.mediaColor ?? DEFAULT_BG, DEFAULT_BG) },
        uReveal: { value: reveal },
        uRevealProject: { value: 1 },
        uRevealSides: { value: 1 },
        uRevealSpread: { value: 0 },
        uRevealSpreadSides: { value: 1 },
        uDarkness: { value: numeric(thumbDarkness, 0.18) },
        uSaturation: { value: 1 },
        uContrast: { value: numeric(payload.contrast, 1.15) },
        uMouseLightness: { value: numeric(payload.mouseLightness, 1) },
        uDirectionalLightIntensity: { value: this.directionalLightIntensity },
        uMouseFactor: { value: this.mouseFactor },
        uPointer: { value: this.pointer },
        uMouseUvOffset: { value: new Vector2(0.25, 0.25) },
        uMouseUvScale: { value: 1.5 },
        tMouseSim: { value: this.mouseSimulationTexture },
        tMouseSim2: { value: this.screenMouseSimulationTexture },
        tDisplacement: { value: this.displacementTarget.texture },
        tPerlin: { value: this.perlinTexture },
        uCoords: { value: new Vector2(1, 1) },
        uSpotLightPosition: { value: this.spotLightPosition },
        uSpotLightTarget: { value: this.spotLightTarget },
        uSpotLightRight: { value: this.spotLightRight },
        uSpotLightUp: { value: this.spotLightUp },
        uSpotConeTan: { value: Math.tan(Math.PI / 4) },
        uSpotIntensity: { value: this.spotLightIntensity },
        uTime: { value: 0 },
      },
      vertexShader: workBlockVertex,
      fragmentShader: workBlockFragment,
    });
  }

  private createBlockMesh(material: ShaderMaterial) {
    const geometry = new RoundedBoxGeometry(GRID_CUBE_SIZE, GRID_CUBE_SIZE, GRID_CUBE_SIZE, 1, 0.05);
    const count = GRID_COLS * GRID_ROWS * this.gridLayers;
    const matrices = new Array<Matrix4>(count);
    const gridOffsets = new Float32Array(count * 3);
    const instanceIndexes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const dummy = new Object3D();
    const cell = GRID_CUBE_SIZE + GRID_SPACING;
    const width = (GRID_COLS - 1) * cell;
    const height = (GRID_ROWS - 1) * cell;
    const depth = (this.gridLayers - 1) * cell;
    let index = 0;

    for (let z = 0; z < this.gridLayers; z++) {
      for (let x = 0; x < GRID_COLS; x++) {
        for (let y = 0; y < GRID_ROWS; y++) {
          dummy.position.set(x * cell - width / 2, y * cell - height / 2, z * cell - depth / 2);
          dummy.scale.setScalar(1);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          matrices[index] = dummy.matrix.clone();
          gridOffsets[index * 3] = x / GRID_COLS;
          gridOffsets[index * 3 + 1] = y / GRID_ROWS;
          gridOffsets[index * 3 + 2] = z / this.gridLayers;
          instanceIndexes[index] = index;
          colors[index * 3] = Math.random();
          colors[index * 3 + 1] = Math.random();
          colors[index * 3 + 2] = Math.random();
          alphas[index] = Math.random();
          index++;
        }
      }
    }

    const mesh = new InstancedMesh(geometry, material, count);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    geometry.setAttribute("instanceGrid", new InstancedBufferAttribute(gridOffsets, 3));
    geometry.setAttribute("instanceIndex", new InstancedBufferAttribute(instanceIndexes, 1));
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
        uBgColor: { value: colorFrom(SOURCE_COMPOSITE_BG) },
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
        tFluid: { value: this.fluidPlaceholder },
        tMouseSim: { value: this.screenMouseSimulationTexture },
        boolBloom: { value: true },
        uReveal: { value: 0 },
        uDarken: { value: 0.1 },
        uSaturation: { value: 1.15 },
        uBloomDistortion: { value: 2.5 },
        uBgColor: { value: colorFrom(SOURCE_COMPOSITE_BG) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeCompositeFragment,
    });
  }

  private createPreCompositeMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tWork: { value: this.workRawTarget.texture },
        tFluid: { value: this.fluidPlaceholder },
        tMouseSim: { value: this.screenMouseSimulationTexture },
        tNoise: { value: this.noiseTexture },
        tPerlin: { value: this.perlinTexture },
        uTime: { value: 0 },
        uRatio: { value: 1 },
        uTransformX: { value: 0 },
        uFluidStrength: { value: this.fluidStrength },
        uPerlin: { value: 0.1 },
        uContrast: { value: 1.1 },
        uBgColor: { value: colorFrom(SOURCE_COMPOSITE_BG) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homePreCompositeFragment,
    });
  }

  private createLuminosityMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.compositeTarget.texture },
        uThreshold: { value: 0.1 },
        uSmoothing: { value: 0.95 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeLuminosityFragment,
    });
  }

  private createBloomBlurMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: this.bloomBrightTarget.texture },
        uResolution: { value: new Vector2(1, 1) },
        uDirection: { value: new Vector2(1, 0) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeBloomBlurFragment,
    });
  }

  private createBloomCompositeMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tBloom1: { value: this.bloomVerticalTargets[0].texture },
        tBloom2: { value: this.bloomVerticalTargets[1].texture },
        tBloom3: { value: this.bloomVerticalTargets[2].texture },
        tBloom4: { value: this.bloomVerticalTargets[3].texture },
        tBloom5: { value: this.bloomVerticalTargets[4].texture },
        uFactor1: { value: -0.03 },
        uFactor2: { value: 0.03 },
        uFactor3: { value: 0.09 },
        uFactor4: { value: 0.15 },
        uFactor5: { value: 0.21 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeBloomCompositeFragment,
    });
  }

  private loadCompositeTextures() {
    this.loadTexture("/images/textures/blue-noise.png", (texture) => {
      this.preCompositeMaterial.uniforms.tNoise.value = texture;
      this.mouseSimulationMaterial.uniforms.uNoiseTexture.value = texture;
      this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value = texture;
    });
    this.loadTexture("/images/textures/perlin-2.webp", (texture) => {
      this.preCompositeMaterial.uniforms.tPerlin.value = texture;
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

  private createMouseSimulationMaterial(ratio: number, thickness: number, persistance = 0.75) {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTexture: { value: this.placeholder },
        uNoiseTexture: { value: this.noiseTexture },
        uCoords: { value: new Vector2(Math.max(1, Math.round(128 * ratio)), 128) },
        uPersistance: { value: persistance },
        uThickness: { value: thickness },
        uDiffusion: { value: 0 },
        uDiffusionSize: { value: 0 },
        uTime: { value: 0 },
        uPosOld: { value: new Vector2(0.5, 0.5) },
        uPosNew: { value: new Vector2(0.5, 0.5) },
        uSpeed: { value: 0 },
        uColor: { value: new Color(0xffffff) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: mouseSimulationFragment,
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
        uOpacity: { value: 0.014 },
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
        parallaxTop: track.dataset.mediaParallax === "top",
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
    this.updateMediaPlanePositions();
    gsap.fromTo(plane.material.uniforms.uReveal, { value: 0 }, { value: 1, duration: 0.5, ease: "none" });
  }

  private setProjectBlockReveal(active: WorkItem) {
    const thumbDarkness = active.payload.thumbDarkness ?? active.payload.darkness;
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealProjectTweens.forEach((tween) => tween.kill());
    this.projectBlockStateTweens.forEach((tween) => tween.kill());
    this.contrastBlockTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.projectRevealProjectTweens = [];
    this.projectBlockStateTweens = [];
    this.contrastBlockTweens = [];
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
      this.projectRevealProjectTweens.push(gsap.to(item.material.uniforms.uRevealProject, { value: 1, duration: 0.5, ease: "none" }));
      if (isActive) {
        tweenColorOwned(item.material.uniforms.uTint.value as Color, active.payload.color, 1.6, this.projectBlockStateTweens);
        tweenColorOwned(this.projectionMaterial.uniforms.uTint.value as Color, active.payload.color, 1.6, this.projectBlockStateTweens);
        tweenColorOwned(item.material.uniforms.uDarknessColor.value as Color, active.payload.darknessColor ?? "#000000", 1.6, this.projectBlockStateTweens);
        this.projectBlockStateTweens.push(gsap.to(item.material.uniforms.uDarkness, { value: numeric(thumbDarkness, 0.18), duration: 1.6, ease: "expo.out" }));
        this.projectBlockStateTweens.push(gsap.to(item.material.uniforms.uContrast, { value: numeric(active.payload.contrast, 1.15), duration: 1.6, ease: "expo.out" }));
      }
    });
  }

  private setMainColor(color?: string, duration = 1.6) {
    this.mainColorTweens.forEach((tween) => tween.kill());
    this.mainColorTweens = [];
    const elements = document.querySelectorAll<HTMLElement>(".c-color");
    const next = colorFrom(color);
    if (duration <= 0) {
      this.backgroundMaterial.uniforms.uActiveColor.value.copy(next);
      this.floorMaterial.uniforms.uActiveColor.value.copy(next);
      (this.particles.material as PointsMaterial).color.copy(next);
      elements.forEach((element) => {
        element.style.color = `rgb(${Math.round(next.r * 255)}, ${Math.round(next.g * 255)}, ${Math.round(next.b * 255)})`;
      });
      return;
    }
    this.mainColorTweens.push(gsap.to(this.backgroundMaterial.uniforms.uActiveColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.mainColorTweens.push(gsap.to(this.floorMaterial.uniforms.uActiveColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    elements.forEach((element) => {
      this.mainColorTweens.push(gsap.to(element, {
        color: `rgb(${Math.round(next.r * 255)}, ${Math.round(next.g * 255)}, ${Math.round(next.b * 255)})`,
        duration,
        ease: "expo.out",
      }));
    });
    const particleMaterial = this.particles.material as PointsMaterial;
    this.mainColorTweens.push(gsap.to(particleMaterial.color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
  }

  private setAmbientLight(color?: string, intensity = 0.5, duration = 1.6) {
    this.ambientTweens.forEach((tween) => tween.kill());
    this.ambientTweens = [];
    this.currentAmbientIntensity = intensity;
    const next = colorFrom(color, "#414652");
    const particleOpacity = MathUtils.clamp(0.06 + intensity * 0.12, 0.05, 0.24);
    if (duration <= 0) {
      this.workItems.forEach((item) => {
        if (item.slug === this.activeSlug) item.material.uniforms.uTint.value.copy(next);
      });
      this.backgroundMaterial.uniforms.uAmbientColor.value.copy(next);
      this.floorMaterial.uniforms.uAmbientColor.value.copy(next);
      this.environmentMaterial.uniforms.uAmbientColor.value.copy(next);
      this.backgroundMaterial.uniforms.uAmbientIntensity.value = intensity;
      this.floorMaterial.uniforms.uAmbientIntensity.value = intensity;
      this.environmentMaterial.uniforms.uAmbientIntensity.value = intensity;
      (this.particles.material as PointsMaterial).opacity = particleOpacity;
      return;
    }
    this.workItems.forEach((item) => {
      if (item.slug === this.activeSlug) this.ambientTweens.push(gsap.to(item.material.uniforms.uTint.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    });
    this.ambientTweens.push(gsap.to(this.backgroundMaterial.uniforms.uAmbientColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.floorMaterial.uniforms.uAmbientColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.environmentMaterial.uniforms.uAmbientColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.backgroundMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration,
      ease: "expo.out",
    }));
    this.ambientTweens.push(gsap.to(this.floorMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration,
      ease: "expo.out",
    }));
    this.ambientTweens.push(gsap.to(this.environmentMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration,
      ease: "expo.out",
    }));
    this.ambientTweens.push(gsap.to(this.particles.material as PointsMaterial, {
      opacity: particleOpacity,
      duration,
      ease: "expo.out",
    }));
  }

  private setDarken(value: number, duration = 0.5) {
    this.darkenTween?.kill();
    if (duration <= 0) {
      this.compositeMaterial.uniforms.uDarken.value = value;
      return;
    }
    this.darkenTween = gsap.to(this.compositeMaterial.uniforms.uDarken, { value, duration, ease: "none" });
  }

  private setThumbDarknessIntensity(value: number, duration = 1.6) {
    this.thumbDarknessTweens.forEach((tween) => tween.kill());
    this.thumbDarknessTweens = [];
    if (duration <= 0) {
      this.thumbCompositeMaterial.uniforms.uDarkness.value = value;
      return;
    }
    this.thumbDarknessTweens.push(gsap.to(this.thumbCompositeMaterial.uniforms.uDarkness, { value, duration, ease: "expo.out" }));
  }

  private setSaturation(value: number, duration = 1.6) {
    this.saturationTween?.kill();
    if (duration <= 0) {
      this.compositeMaterial.uniforms.uSaturation.value = value;
      return;
    }
    this.saturationTween = gsap.to(this.compositeMaterial.uniforms.uSaturation, { value, duration, ease: "expo.out" });
  }

  private setThumbSaturation(value: number, duration = 1.6) {
    this.thumbSaturationTweens.forEach((tween) => tween.kill());
    this.thumbSaturationTweens = [];
    if (duration <= 0) {
      this.thumbCompositeMaterial.uniforms.uSaturation.value = value;
      return;
    }
    this.thumbSaturationTweens.push(gsap.to(this.thumbCompositeMaterial.uniforms.uSaturation, { value, duration, ease: "expo.out" }));
  }

  private setContrast(value: number, duration = 1.6) {
    this.contrastTween?.kill();
    this.contrastBlockTweens.forEach((tween) => tween.kill());
    this.contrastBlockTweens = [];
    this.workItems.forEach((item) => {
      if (item.slug !== this.activeSlug) return;
      if (duration <= 0) {
        item.material.uniforms.uContrast.value = value;
        return;
      }
      this.contrastBlockTweens.push(gsap.to(item.material.uniforms.uContrast, { value, duration, ease: "expo.out" }));
    });
    if (duration <= 0) {
      this.preCompositeMaterial.uniforms.uContrast.value = value;
      return;
    }
    this.contrastTween = gsap.to(this.preCompositeMaterial.uniforms.uContrast, { value, duration, ease: "expo.out" });
  }

  private setThumbDarknessColor(value?: string, duration = 1.6) {
    this.thumbDarknessColorTweens.forEach((tween) => tween.kill());
    this.thumbDarknessColorTweens = [];
    tweenColorOwned(this.thumbCompositeMaterial.uniforms.uDarknessColor.value as Color, value ?? "#000000", duration, this.thumbDarknessColorTweens, "#000000");
  }

  private setThumbMouseLightness(value: number, duration = 1.6) {
    this.thumbMouseLightnessTweens.forEach((tween) => tween.kill());
    this.thumbMouseLightnessTweens = [];
    this.workItems.forEach((item) => {
      if (duration <= 0) {
        item.material.uniforms.uMouseLightness.value = value;
        return;
      }
      this.thumbMouseLightnessTweens.push(gsap.to(item.material.uniforms.uMouseLightness, { value, duration, ease: "expo.out" }));
    });
  }

  private setMouseFactor(value: number, duration = 0, ease = "none") {
    this.mouseFactorTween?.kill();
    const updateUniforms = () => {
      this.workItems.forEach((item) => {
        item.material.uniforms.uMouseFactor.value = this.mouseFactor;
      });
    };
    if (duration <= 0) {
      this.mouseFactor = value;
      updateUniforms();
      return;
    }
    this.mouseFactorTween = gsap.to(this, {
      mouseFactor: value,
      duration,
      ease,
      onUpdate: updateUniforms,
    });
  }

  private setMediaBackground(value?: string, duration = 1.6) {
    this.mediaBackgroundTweens.forEach((tween) => tween.kill());
    this.mediaBackgroundTweens = [];
    this.mediaBackground = colorFrom(value, DEFAULT_BG);
    this.mediaPlanes.forEach((plane) => {
      if (duration <= 0) {
        plane.material.uniforms.uBackgroundColor.value.copy(this.mediaBackground);
        return;
      }
      this.mediaBackgroundTweens.push(gsap.to(plane.material.uniforms.uBackgroundColor.value as Color, {
        r: this.mediaBackground.r,
        g: this.mediaBackground.g,
        b: this.mediaBackground.b,
        duration,
        ease: "expo.out",
      }));
    });
  }

  private setBlocksColor(value?: string, duration = 1.6) {
    this.blockColorTweens.forEach((tween) => tween.kill());
    this.blockColorTweens = [];
    const next = colorFrom(value ?? DEFAULT_BG, DEFAULT_BG);
    this.workItems.forEach((item) => {
      if (duration <= 0) {
        item.material.uniforms.uBlockColor.value.copy(next);
        return;
      }
      this.blockColorTweens.push(gsap.to(item.material.uniforms.uBlockColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    });
  }

  private setRevealSpread(value: number, duration = 1.6, ease = "power4.out") {
    this.revealSpreadTween?.kill();
    if (duration <= 0) {
      this.revealSpread = value;
      this.workItems.forEach((item) => {
        item.material.uniforms.uRevealSpread.value = this.revealSpread;
      });
      return;
    }
    this.revealSpreadTween = gsap.to(this, {
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
    this.spotLightTween?.kill();
    const target = MathUtils.clamp(value / this.maxSpotLightIntensity, 0, 1);
    const update = () => {
      this.updateSpotLightBasis();
      this.workItems.forEach((item) => {
        item.material.uniforms.uSpotIntensity.value = this.spotLightIntensity;
        item.material.uniforms.uSpotLightTarget.value.copy(this.spotLightTarget);
        item.material.uniforms.uSpotLightRight.value.copy(this.spotLightRight);
        item.material.uniforms.uSpotLightUp.value.copy(this.spotLightUp);
      });
    };
    if (duration <= 0) {
      this.spotLightIntensity = target;
      update();
      return;
    }
    this.spotLightTween = gsap.to(this, {
      spotLightIntensity: target,
      duration,
      ease,
      onUpdate: update,
    });
  }

  private setDirectionalLightIntensity(value: number, duration = 1.6, ease = "expo.out") {
    this.directionalLightTween?.kill();
    const update = () => {
      this.workItems.forEach((item) => {
        item.material.uniforms.uDirectionalLightIntensity.value = this.directionalLightIntensity;
      });
    };
    if (duration <= 0) {
      this.directionalLightIntensity = value;
      update();
      return;
    }
    this.directionalLightTween = gsap.to(this, {
      directionalLightIntensity: value,
      duration,
      ease,
      onUpdate: update,
    });
  }

  private setFluidStrength(value: number, duration = 0.5) {
    this.fluidStrengthTween?.kill();
    const update = () => {
      this.preCompositeMaterial.uniforms.uFluidStrength.value = this.fluidStrength;
    };
    if (duration <= 0) {
      this.fluidStrength = value;
      update();
      return;
    }
    this.fluidStrengthTween = gsap.to(this, {
      fluidStrength: value,
      duration,
      ease: "none",
      onUpdate: update,
    });
  }

  private setMediaOpacity(value: number, duration = 1.6, ease = "expo.out", delay = 0.25) {
    this.mediaOpacityTween?.kill();
    const update = () => {
      this.mediaPlanes.forEach((plane) => {
        plane.material.uniforms.uSceneOpacity.value = this.mediaSceneOpacity;
      });
    };
    if (duration <= 0) {
      this.mediaSceneOpacity = value;
      update();
      return;
    }
    this.mediaOpacityTween = gsap.to(this, {
      mediaSceneOpacity: value,
      duration,
      ease,
      delay,
      onUpdate: update,
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
      thumbSaturation: element.dataset.thumbSaturation,
      contrast: element.dataset.contrast,
      mouseLightness: element.dataset.mouseLightness,
      spotlight: element.dataset.spotlight,
    };
  }

  private get mouseSimulationTexture() {
    return this.mouseSimulationTargets[this.mouseSimulationIndex]?.texture ?? this.placeholder;
  }

  private get screenMouseSimulationTexture() {
    return this.screenMouseSimulationTargets[this.screenMouseSimulationIndex]?.texture ?? this.placeholder;
  }

  private bind() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  private onPointerMove = (event: PointerEvent) => {
    this.pointerPixels.set(event.clientX, event.clientY);
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
    const dpr = sourceDpr();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    const renderWidth = Math.max(1, Math.round(width * dpr));
    const renderHeight = Math.max(1, Math.round(height * dpr));
    this.workRawTarget.setSize(renderWidth, renderHeight);
    this.compositeTarget.setSize(renderWidth, renderHeight);
    let mipWidth = Math.max(1, Math.round(floorPowerOfTwo(renderWidth) / 4));
    let mipHeight = Math.max(1, Math.round(floorPowerOfTwo(renderHeight) / 4));
    this.bloomBrightTarget.setSize(mipWidth, mipHeight);
    this.bloomTarget.setSize(mipWidth, mipHeight);
    this.bloomHorizontalTargets.forEach((target, index) => {
      target.setSize(mipWidth, mipHeight);
      this.bloomVerticalTargets[index].setSize(mipWidth, mipHeight);
      mipWidth = Math.max(1, Math.round(mipWidth / 2));
      mipHeight = Math.max(1, Math.round(mipHeight / 2));
    });
    this.homeCamera.aspect = width / height;
    this.homeCamera.updateProjectionMatrix();
    this.cameraOrigin.z = width >= BREAKPOINT_MD ? 5.5 : 5;
    this.backgroundMaterial.uniforms.uRatio.value = width / height;
    this.preCompositeMaterial.uniforms.uRatio.value = width / height;
    this.displacementMaterial.uniforms.uRatio.value = width / height;
    const simWidth = Math.max(1, Math.round(width / MOUSE_SIM_SCALE));
    const simHeight = Math.max(1, Math.round(height / MOUSE_SIM_SCALE));
    this.screenMouseSimulationTargets.forEach((target) => target.setSize(simWidth, simHeight));
    this.screenMouseSimulationMaterial.uniforms.uCoords.value.set(simWidth, simHeight);
    this.mouseSimulationTargets.forEach((target) => target.setSize(simWidth, simHeight));
    this.mouseSimulationMaterial.uniforms.uCoords.value.set(simWidth, simHeight);
    const thumbSize = Math.max(1, Math.round(height));
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
      item.material.uniforms.uCoords.value.set(renderWidth, renderHeight);
    });
    this.updateMediaPlanePositions();
  };

  private updateMediaPlanePositions() {
    const scroll = window.scrollY;
    this.mediaPlanes.forEach((plane) => {
      plane.mesh.position.x = plane.offset.x + plane.translation.x;
      plane.mesh.position.y = plane.offset.y + plane.translation.y + scroll;
      plane.material.uniforms.uCameraDistance.value =
        plane.parallaxTop ? -scroll : this.mediaCamera.position.y - plane.mesh.position.y;
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
    material: ShaderMaterial,
    scene: Scene,
    targets: WebGLRenderTarget[],
    currentIndex: number,
    oldPos: Vector2,
    newPos: Vector2,
    targetPos: Vector2,
    delta: number,
    strength: number,
    persistance: number,
    thickness: number,
  ) {
    const lerpFactor = MathUtils.clamp(delta * 7.5, 0, 1);
    newPos.lerp(targetPos, lerpFactor);
    const speed = newPos.distanceTo(oldPos);
    const outputIndex = 1 - currentIndex;
    material.uniforms.uTexture.value = targets[currentIndex].texture;
    material.uniforms.uPosNew.value.copy(newPos);
    material.uniforms.uPosOld.value.copy(oldPos);
    material.uniforms.uSpeed.value = Math.max(speed, 0.0001);
    material.uniforms.uPersistance.value = Math.pow(persistance, delta * 10);
    material.uniforms.uThickness.value = thickness * strength;
    material.uniforms.uTime.value = performance.now() * 0.001;
    this.renderer.setRenderTarget(targets[outputIndex]);
    this.renderer.clear();
    this.renderer.render(scene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    oldPos.copy(newPos);
    return { speed, index: outputIndex };
  }

  private updateMouseSimulation(delta: number) {
    const meshResult = this.updateMouseBrush(
      this.mouseSimulationMaterial,
      this.mouseSimulationScene,
      this.mouseSimulationTargets,
      this.mouseSimulationIndex,
      this.mouseSimOldPos,
      this.mouseSimNewPos,
      this.mouseSimTargetPos,
      delta,
      MathUtils.clamp(this.mouseFactor, 0.25, 1),
      0.85,
      0.1,
    );
    this.mouseSimSpeed = meshResult.speed;
    this.mouseSimulationIndex = meshResult.index;
    const screenResult = this.updateMouseBrush(
      this.screenMouseSimulationMaterial,
      this.screenMouseSimulationScene,
      this.screenMouseSimulationTargets,
      this.screenMouseSimulationIndex,
      this.screenMouseSimOldPos,
      this.screenMouseSimNewPos,
      this.screenMouseSimTargetPos,
      delta,
      1,
      0.85,
      0.1,
    );
    this.screenMouseSimulationIndex = screenResult.index;
    this.compositeMaterial.uniforms.tFluid.value = this.fluidPlaceholder;
    this.compositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
    this.workItems.forEach((item) => {
      item.material.uniforms.tMouseSim.value = this.mouseSimulationTexture;
      item.material.uniforms.tMouseSim2.value = this.screenMouseSimulationTexture;
    });
  }

  private updateSpotLightBasis() {
    const direction = this.spotLightTarget.clone().sub(this.spotLightPosition).normalize();
    this.spotLightRight.crossVectors(direction, new Vector3(0, 1, 0)).normalize();
    if (this.spotLightRight.lengthSq() < 0.0001) this.spotLightRight.set(1, 0, 0);
    this.spotLightUp.crossVectors(this.spotLightRight, direction).normalize();
  }

  private updateHomeCamera(delta: number) {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const fps = 1 / delta;
    const cameraLerp = Math.min(Math.round(2 / (fps / 60)), 2) * 0.01 || 0.01;
    this.pointerDeltaPixels.subVectors(this.pointerPixels, this.lastPointerPixels);
    this.lastPointerPixels.copy(this.pointerPixels);

    const mouseX = MathUtils.mapLinear(this.pointerPixels.x, 0, width, -1, 1);
    const mouseY = MathUtils.mapLinear(this.pointerPixels.y, 0, height, 1, -1);
    this.cameraTarget.set(
      this.cameraOrigin.x + this.cameraTargetXY.x * mouseX,
      this.cameraOrigin.y + this.cameraTargetXY.y * mouseY,
      this.cameraOrigin.z + this.cameraTargetXY.y * (mouseY * 1.25),
    );
    this.homeCamera.position.lerp(this.cameraTarget, cameraLerp);
    this.homeCamera.lookAt(this.cameraLookAt);

    const rollInput = MathUtils.mapLinear(Math.abs(this.pointerDeltaPixels.x) / width, 0, 0.02, 0, 0.5);
    const rollTarget = this.cameraRotateAngle * rollInput * Math.sign(this.pointerDeltaPixels.x);
    this.cameraRoll += (rollTarget - this.cameraRoll) * cameraLerp;
    this.homeCamera.rotation.z += (this.cameraRoll - this.homeCamera.rotation.z) * cameraLerp;
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
      item.material.uniforms.uDirectionalLightIntensity.value = this.directionalLightIntensity;
      item.material.uniforms.uSpotLightPosition.value.copy(this.spotLightPosition);
      const world = new Vector3();
      item.group.getWorldPosition(world);
      item.group.visible = !(world.x > 5.5 || world.x < -5.5 || world.z > 5);
      const sideReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 0, 5, 0, 1), 0, 1);
      const sideSpreadReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 2, 6, 0, 1), 0, 1);
      item.material.uniforms.uRevealSides.value = sideReveal;
      item.material.uniforms.uRevealSpreadSides.value = sideSpreadReveal;
    });
    this.updateHomeCamera(delta);
    this.spotLightPosition.x = this.homeCamera.position.x * 0.175;
    this.spotLightPosition.y = (window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3) + this.homeCamera.position.y * 0.175;
    this.spotLightPosition.z = 3.7;
    this.updateSpotLightBasis();
    this.workItems.forEach((item) => {
      item.material.uniforms.uSpotLightTarget.value.copy(this.spotLightTarget);
      item.material.uniforms.uSpotLightRight.value.copy(this.spotLightRight);
      item.material.uniforms.uSpotLightUp.value.copy(this.spotLightUp);
    });
    this.particles.rotation.z = time * 0.015 + this.galleryProgress * Math.PI * 0.2;
    this.particles.position.x = this.pointer.x * 0.1;
    this.particles.position.y = this.pointer.y * 0.08;
    this.backgroundMaterial.uniforms.uTime.value = time;
    this.backgroundMaterial.uniforms.uProgress.value = this.galleryProgress;
    this.preCompositeMaterial.uniforms.uTime.value = time;
    this.preCompositeMaterial.uniforms.uFluidStrength.value = this.fluidStrength;
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
      this.renderer.setRenderTarget(this.workRawTarget);
      this.renderer.clear();
      this.renderer.render(this.homeScene, this.homeCamera);
      this.preCompositeMaterial.uniforms.tWork.value = this.workRawTarget.texture;
      this.preCompositeMaterial.uniforms.tFluid.value = this.fluidPlaceholder;
      this.preCompositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
      this.renderer.setRenderTarget(this.compositeTarget);
      this.renderer.clear();
      this.renderer.render(this.preCompositeScene, this.backgroundCamera);
      this.luminosityMaterial.uniforms.tScene.value = this.compositeTarget.texture;
      this.renderer.setRenderTarget(this.bloomBrightTarget);
      this.renderer.clear();
      this.renderer.render(this.luminosityScene, this.backgroundCamera);
      let bloomSource = this.bloomBrightTarget;
      this.bloomHorizontalTargets.forEach((horizontalTarget, index) => {
        const verticalTarget = this.bloomVerticalTargets[index];
        this.bloomBlurMaterial.uniforms.tMap.value = bloomSource.texture;
        this.bloomBlurMaterial.uniforms.uResolution.value.set(horizontalTarget.width, horizontalTarget.height);
        this.bloomBlurMaterial.uniforms.uDirection.value.set(1, 0);
        this.renderer.setRenderTarget(horizontalTarget);
        this.renderer.clear();
        this.renderer.render(this.bloomBlurScene, this.backgroundCamera);
        this.bloomBlurMaterial.uniforms.tMap.value = horizontalTarget.texture;
        this.bloomBlurMaterial.uniforms.uResolution.value.set(verticalTarget.width, verticalTarget.height);
        this.bloomBlurMaterial.uniforms.uDirection.value.set(0, 1);
        this.renderer.setRenderTarget(verticalTarget);
        this.renderer.clear();
        this.renderer.render(this.bloomBlurScene, this.backgroundCamera);
        bloomSource = verticalTarget;
      });
      this.renderer.setRenderTarget(this.bloomTarget);
      this.renderer.clear();
      this.renderer.render(this.bloomCompositeScene, this.backgroundCamera);
      this.renderer.setRenderTarget(null);
      this.compositeMaterial.uniforms.tBloom.value = this.bloomTarget.texture;
      this.compositeMaterial.uniforms.boolBloom.value = true;
      this.renderer.render(this.compositeScene, this.backgroundCamera);
    }
    if (hasMedia) this.renderer.render(this.mediaScene, this.mediaCamera);
    this.raf = requestAnimationFrame(this.tick);
  };
}

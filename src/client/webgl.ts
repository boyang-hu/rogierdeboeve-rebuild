import {
  AmbientLight,
  AdditiveBlending,
  BackSide,
  Box3,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  ClampToEdgeWrapping,
  Color,
  CubeTextureLoader,
  DataTexture,
  DirectionalLight,
  Fog,
  FloatType,
  Float32BufferAttribute,
  GLSL3,
  Group,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  LinearSRGBColorSpace,
  LineSegments,
  MathUtils,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NoBlending,
  NoColorSpace,
  NormalBlending,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  RGBAFormat,
  RawShaderMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  SpotLight,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  Vector4,
  VideoTexture,
  WebGLRenderer,
  WebGLRenderTarget,
  RepeatWrapping,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

type SourceProjectThumb = {
  id: string;
  src: Promise<Texture>;
  url: string | null;
  loader: "loadImage" | "loadVideo" | null;
  bindingMode: "source-Xt-projectThumbs-src-promise";
};

type WorkItem = {
  slug: string;
  payload: ProjectPayload;
  group: Object3D;
  rotationWrap: Object3D;
  material: WorkBlockMaterial;
  mesh: InstancedMesh;
  thumb: Mesh<PlaneGeometry, ShaderMaterial>;
  thumbXHook: number;
  thumbYHook: number;
  mousePlane: Mesh<PlaneGeometry, ShaderMaterial>;
  rayPlane: Mesh<PlaneGeometry, MeshBasicMaterial>;
  mouseMaterial: ShaderMaterial;
  mouseScene: Scene;
  mouseTargets: WebGLRenderTarget[];
  mouseIndex: number;
  mouseRenderClearMode: "source-sA-no-explicit-clear";
  mouseTarget: Vector2;
  mouseOld: Vector2;
  mouseNew: Vector2;
  mouseSpeed: number;
  reveal: number;
};

type WorkBlockMaterial = MeshStandardMaterial & { uniforms: Record<string, { value: any }> };
type EnvironmentMaterial = MeshStandardMaterial & {
  customUniforms: Record<string, { value: any }>;
  sourceConstructorParams?: Record<string, any>;
};
type ShaderDumpWindow = Window & {
  __rogierVaShaderDump?: Array<{
    variant: "work" | "auxiliary";
    vertexShader: string;
    fragmentShader: string;
  }>;
  __rogierShaderDump?: Array<{
    name: string;
    vertexShader: string;
    fragmentShader: string;
  }>;
};

type OutputProbeWindow = Window & {
  __rogierOutputProbe?: Record<string, any>;
};

type RenderTargetStats = {
  width: number;
  height: number;
  sampleWidth: number;
  sampleHeight: number;
  mean: [number, number, number, number];
  min: [number, number, number, number];
  max: [number, number, number, number];
  luma: number;
};

type RenderTargetBandStats = {
  bands: Array<[number, number]>;
  maxHorizontalDelta: {
    position: number;
    value: number;
  };
};

type ThumbProbeWindow = Window & {
  __rogierThumbProbe?: {
    activeSlug: string;
    galleryProgress: number;
    thumbProgress: number;
    debugProgress: number | null;
    sourceProgressSignMode: string;
    sourceProgressUpdateOrder: string;
    thumbPositionMode: string;
    thumbHierarchyMode: string;
    thumbWrapParentIsScene: boolean;
    thumbScrollWrapParentIsThumbWrap: boolean;
    itemWidth: number;
    totalItems: number;
    totalWidth: number;
    offsetY: number;
    isTransitioning: boolean;
    visibleThumbs: number;
    thumbs: Array<{
      slug: string;
      xHook: number;
      yHook: number;
      position: [number, number, number];
      scale: [number, number, number];
      visible: boolean;
      sourceInitialVisibleMode: string;
    }>;
    thumbMaterial: {
      mode: string;
      glslVersion: string | null;
      toneMapped: boolean;
      transparent: boolean;
      blending: number;
      depthWrite: boolean;
      depthTest: boolean;
      uProgress: number;
      uTransitionCount: number;
      uTransitionSmoothness: number;
      mapBound: boolean;
      mapSize: [number, number];
      resolution: [number, number];
    } | null;
    thumbComposite: {
      darkness: number;
      darkenIntensity: number;
      darknessColor: [number, number, number];
      darkenColor: [number, number, number];
      saturation: number;
      stateOwnership: string;
      state: {
        darknessIntensity: number;
        darknessColor: number[];
        saturation: number;
        mouseLightness: number;
      };
      stateUniformsMatch: boolean;
      mouseLightnessUniformsMatchState: boolean;
    };
    spotlight: {
      hasMap: boolean;
      positionOwnershipMode: string;
      parallaxMode: string;
      parallaxYOffsetMode: string;
      mobileBreakpoint: number;
      mobileYOffset: number;
      intensity: number;
      position: number[];
      target: number[];
      parallax: boolean;
      mapColorSpace: string;
      rendererOutputColorSpace: string;
    };
    targets: {
      thumb: RenderTargetStats;
      composite: RenderTargetStats;
    };
  };
};

type AuxiliaryBlockItem = {
  kind: "about" | "floating";
  group: Object3D;
  scaleWrap: Object3D;
  rotationWrap: Object3D;
  material: WorkBlockMaterial;
  mesh: InstancedMesh;
  rayPlane?: Mesh<PlaneGeometry, MeshBasicMaterial>;
  gridSize: Vector3;
  colors: Float32Array;
  translation: Vector2;
  translationZ: number;
  track?: HTMLElement | null;
  bounds?: DOMRect;
  offset: Vector2;
  trackScaleF: number;
  mouseTarget: Vector2;
  mouseOld: Vector2;
  mouseNew: Vector2;
  mouseSpeed: number;
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
  observer?: IntersectionObserver;
  video?: HTMLVideoElement;
  texture?: Texture;
};

type MainFluidPass = {
  advectionMaterial: ShaderMaterial;
  advectionBoundsMaterial: ShaderMaterial;
  advectionScene: Scene;
  forceMaterial: ShaderMaterial;
  forceScene: Scene;
  divergenceMaterial: ShaderMaterial;
  divergenceScene: Scene;
  poissonMaterial: ShaderMaterial;
  poissonScene: Scene;
  pressureMaterial: ShaderMaterial;
  pressureScene: Scene;
  targets: {
    main: WebGLRenderTarget;
    velocity: WebGLRenderTarget;
    divergence: WebGLRenderTarget;
    pressureA: WebGLRenderTarget;
    pressureB: WebGLRenderTarget;
  };
  cellScale: Vector2;
  fboSize: Vector2;
  bounds: Vector2;
  pointerOld: Vector2;
  pointer: Vector2;
  enabled: boolean;
};

const BREAKPOINT_LG = 1000;
const BREAKPOINT_MD = 800;
const SOURCE_MAX_DPR = 2;
const SOURCE_LOW_RES_MAX_DPR = 1.5;
const SOURCE_WORK_MAX_DPR = 1.5;
const SOURCE_WORK_BG = "#1a1a1a";
const SOURCE_COMPOSITE_BG = "#1f1f1f";
const DEFAULT_BG = SOURCE_WORK_BG;
const DEFAULT_COLOR = "#bcbcbc";
const SOURCE_INITIAL_SECONDARY = "#464646";
const SOURCE_INITIAL_AMBIENT = 1;
const SOURCE_INITIAL_DARKEN = 0.2;
const SOURCE_INITIAL_SATURATION = 0.35;
const SOURCE_INITIAL_CONTRAST = 1.1;
const SOURCE_HOME_OVERVIEW_DARKEN_FALLBACK = 0.1;
const SOURCE_HOME_OVERVIEW_SATURATION_FALLBACK = 1;
const SOURCE_PROJECT_DETAIL_DARKEN = 0.25;
const SOURCE_PROJECT_SATURATION_FALLBACK = 1;
const SOURCE_PROJECT_CONTRAST_FALLBACK = 1.15;
const SOURCE_INITIAL_THUMB_DARKNESS = 0.5;
const SOURCE_HOME_THUMB_DARKNESS_FALLBACK = 0;
const SOURCE_INITIAL_THUMB_DARKNESS_COLOR = "#000000";
const SOURCE_INITIAL_THUMB_SATURATION = 1;
const SOURCE_INITIAL_THUMB_MOUSE_LIGHTNESS = 1;
const SOURCE_WORK_DIFFUSE = "#808080";
const SOURCE_WORK_ENVMAP_INTENSITY = 0.75;
const SOURCE_WORK_ROUGHNESS = 1;
const SOURCE_WORK_METALNESS = 0;
const SOURCE_WORK_EMISSIVE_INTENSITY = 1;
const SOURCE_ASSET_WEBP_PROBE =
  "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
const GRID_COLS = 35;
const GRID_ROWS = 23;
const SOURCE_GRID_LAYERS = 7;
const SOURCE_LOW_RES_GRID_LAYERS = 4;
const GRID_CUBE_SIZE = 1.25;
const GRID_SPACING = 0.1;
const GRID_SCALE = 0.09;
const MOUSE_PLANE_SCALE = 1.3;
const MOUSE_RAY_SCALE = 1.5;
const SCREEN_MOUSE_SIM_SCALE = 10;
const ABOUT_TRACK_SCALE = 0.005;
const AUX_BLOCK_SCALE = 0.09;
const SOURCE_BLOOM_KERNELS = [3, 5, 7, 9, 11];
const SOURCE_MAIN_SCENE_BACKGROUND = "#D9D9D9";

function sourceRound(value: number, precision = 4) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

function sourceDamp(value: number, target: number, lambda: number, delta: number) {
  return sourceRound(MathUtils.lerp(value, target, 1 - Math.exp(-lambda * delta)));
}

type SourceRenderSettings = {
  renderToScreen: boolean;
  fxaa: { enabled: boolean };
  mousesim: { enabled: boolean };
  luminosity: { threshold: number; smoothing: number; enabled: boolean };
  bloom: { strength: number; radius: number; enabled: boolean };
  blur: { scale: number; strength: number; enabled: boolean };
  fluid: {
    enabled: boolean;
    mouseForce: number;
    cursorSize: number;
    delta: number;
    poissonIterations: number;
    bounce: boolean;
  };
};

const SOURCE_MAIN_LENSFLARE_SETTINGS = {
  scale: new Vector2(1.5, 1.5),
  exposure: 1,
  clamp: 1,
  enabled: false,
};

const SOURCE_C1_UNIFORM_KEYS = [
  "tScene",
  "tWork",
  "tMedia",
  "tBloom",
  "tBlur",
  "tFluid",
  "tPortal",
  "tMouseSim",
  "boolBloom",
  "boolFluid",
  "boolLuminosity",
  "boolFxaa",
  "uTime",
  "tNoise",
  "tLensflare",
  "uRatio",
  "tPerlin",
  "uDisplacementSize",
  "uContainerSize",
  "uDisplacement",
  "uPerlin",
  "uBgColor",
  "uReveal",
  "uMediaReveal",
  "uContrast",
  "uTransformX",
  "uFluidStrength",
] as const;

const SOURCE_HOME_RENDER_SETTINGS: SourceRenderSettings = {
  renderToScreen: false,
  fxaa: { enabled: false },
  mousesim: { enabled: true },
  luminosity: { threshold: 0.1, smoothing: 0.95, enabled: true },
  bloom: { strength: 0.15, radius: 1.5, enabled: true },
  blur: { scale: 1, strength: 8, enabled: false },
  fluid: { enabled: false, mouseForce: 25, cursorSize: 20, delta: 0.019, poissonIterations: 1, bounce: false },
};

const SOURCE_MAIN_RENDER_SETTINGS: SourceRenderSettings = {
  renderToScreen: true,
  fxaa: { enabled: false },
  mousesim: { enabled: false },
  luminosity: { threshold: 0.1, smoothing: 1, enabled: false },
  bloom: { strength: 0.05, radius: 0.01, enabled: false },
  blur: { scale: 1, strength: 8, enabled: false },
  fluid: { enabled: false, mouseForce: 5, cursorSize: 6, delta: 0.125, poissonIterations: 1, bounce: false },
};

function sourceBloomFactors(strength: number, radius: number) {
  return [1, 0.8, 0.6, 0.4, 0.2].map((factor) => strength * MathUtils.lerp(factor, 1.2 - factor, radius));
}

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
  gl_FragColor = vec4(color.rgb, mask);
}
`;

const SOURCE_TRAILING_SPACE = " ";

const workBlockVertexPars = `
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceOffset;
attribute vec3 instanceColor;

varying float vInstanceIndex;
varying float vInstanceAlpha;
varying vec3 vInstanceColor;
varying vec3 vPosition;
varying vec3 vOffset;
varying vec2 vUv;

uniform vec2 uCoords;
uniform float uTime;
uniform float uMouseFactor;
uniform sampler2D tDisplacement;
uniform sampler2D tMouseSim;
uniform sampler2D tPerlin;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform vec2 uUvOffset;
uniform float uUvOffsetScale;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
uniform float uRevealSpread;
uniform float uRevealSpreadSides;
`;

const workBlockVertexSourceViewVaryings = `
varying vec3 vViewPosition;
varying float vNoise;`;

const workBlockSourceHaVertexShader = `
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceOffset;
attribute vec3 instanceColor;
varying float vInstanceIndex;${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
varying float vInstanceAlpha;
varying vec3 vInstanceColor;
varying vec3 vPosition;
varying vec3 vOffset;
varying vec2 vUv;
uniform vec2 uCoords;
uniform float uTime;
uniform float uMouseFactor;
uniform sampler2D tDisplacement;
uniform sampler2D tMouseSim;
uniform sampler2D tPerlin;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform vec2 uUvOffset;
uniform float uUvOffsetScale;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
uniform float uRevealSpread;
uniform float uRevealSpreadSides;
#define STANDARD
varying vec3 vViewPosition;
varying float vNoise;

#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <shadowmap_pars_vertex>

void main() {
  vUv = uv;
	#include <uv_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>

  vec2 screenUv = gl_Position.xy / uCoords.xy;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec2 newUv = screenUv;
  vec2 newOffset = instanceOffset.xy;

  newUv.x /= uGridSize.x;${SOURCE_TRAILING_SPACE}
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y;${SOURCE_TRAILING_SPACE}

  vec2 mouseUv = newUv + uUvOffset.xy;

  mouseUv /= uUvOffsetScale;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec4 mouseSim = texture2D(tMouseSim, mouseUv);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec4 instancePos = instanceMatrix[3];
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec2 perlinUv = newUv * .75;
  vec4 perlin = texture2D(tPerlin, perlinUv - uTime * .05);



  float revealCombined = uReveal * uRevealProject;

  // vec2 displacementPos = instancePos.xy + uTime;
  float perlinDisplacementHeight = 10.;
  float perlinDisplacement =  (perlin.x * perlinDisplacementHeight);
  float toCenter = length(instancePos.xy);
  float fadeScale = (revealCombined * 5.75) - (toCenter * (revealCombined / 5.75));
  float fade = clamp(fadeScale, .0, 1.05);


  perlinDisplacement *= fade;

  float perlinScaleDisplacement = min(1., 1. - (perlinDisplacement -  (perlinDisplacementHeight / 2.)) * .1);

  vec3 perlinDisplaced = vec3(transformed);
  perlinDisplaced.z += perlinDisplacement - (perlinDisplacementHeight / 2.);
  perlinDisplaced *= perlinScaleDisplacement;

  transformed *= 1. - mouseSim.r * .05;

${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  // float toCenter = length(instancePos.xy);
  float fadeDiplacementScale = (revealCombined * 4.85) - (toCenter * (revealCombined / 4.85));
  float fadeDiplacement = clamp(fadeDiplacementScale, -1.0, 1.0);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  transformed = mix(transformed, perlinDisplaced, (1. - fadeDiplacement) * .25);
  transformed *= fade;
  transformed *= uRevealSides;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  float mouseTransform = mouseSim.r * 15.;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec4 displacement = texture2D(tDisplacement, newUv);${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  float displacementF = displacement.r;

  // vec2 displacementUv = newUv;
  // vec4 displacement = texture2D(tPerlin, displacementUv - uTime * .05);
  // float displacementF = displacement.r * 5.0;

  float waveDisplacement = displacementF * 3.0 + 6. * (1. - revealCombined);

  transformed.z -= 1.5;
  transformed.z += waveDisplacement;
  transformed.z += mouseTransform * uMouseFactor;
  transformed *= 1. - displacementF * .1;

  float spread = 3.;

  vec3 transformedSpread = transformed;

  transformedSpread.x -= instanceColor.x * spread;
  transformedSpread.x += spread / 2.0;
  transformedSpread.y -= instanceColor.y * spread;
  transformedSpread.y += spread / 2.0;
  transformedSpread.z -= instanceColor.z * spread;
  transformedSpread.z += spread / 2.0;

  transformed = mix(transformedSpread, transformed, uRevealSpreadSides);
  transformed = mix(transformedSpread, transformed, 1. - uRevealSpread);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec4 mvPosition = vec4( transformed, 1.0 );

  #ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
  #endif

  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

	vViewPosition = - mvPosition.xyz;

  transformed /= 1. - mouseSim.r * .2;
  vec4 worldPosition = vec4( transformed, 1.0 );
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  worldPosition = instanceMatrix * worldPosition;
  worldPosition = modelMatrix * worldPosition;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
	#include <shadowmap_vertex>
	#include <fog_vertex>
  vInstanceIndex = instanceIndex;
  vInstanceAlpha = instanceAlpha;
  vOffset = instanceOffset;

  #ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
  #endif
  vPosition = position;
  vInstanceColor = instanceColor;
}
`;

const workBlockBeginVertexChunk = `
#include <begin_vertex>
vec2 newUv = uv;
vec2 newOffset = instanceOffset.xy;
newUv.x /= uGridSize.x;
newUv.y /= uGridSize.y;
newUv.x += newOffset.x;
newUv.y += newOffset.y;
vec2 mouseUv = newUv + uUvOffset.xy;
mouseUv /= uUvOffsetScale;
vec4 mouseSim = texture2D(tMouseSim, mouseUv);

vec4 instancePos = instanceMatrix[3];
vec2 perlinUv = newUv * 0.75;
vec4 perlin = texture2D(tPerlin, perlinUv - uTime * 0.05);

float revealCombined = uReveal * uRevealProject;
float perlinDisplacementHeight = 10.0;
float perlinDisplacement = perlin.r * perlinDisplacementHeight;
float toCenter = length(instancePos.xy);

float fadeScale = (revealCombined * 5.75) - (toCenter * (revealCombined / 5.75));
float fade = clamp(fadeScale, 0.0, 1.05);
perlinDisplacement *= fade;

float perlinScaleDisplacement = min(1.0, 1.0 - (perlinDisplacement - (perlinDisplacementHeight / 2.0)) * 0.1);

vec3 perlinDisplaced = transformed;
perlinDisplaced.z += perlinDisplacement - (perlinDisplacementHeight / 2.0);
perlinDisplaced *= perlinScaleDisplacement;
transformed *= 1.0 - mouseSim.r * 0.05;

float fadeDiplacementScale = (revealCombined * 4.85) - (toCenter * (revealCombined / 4.85));
float fadeDiplacement = clamp(fadeDiplacementScale, -1.0, 1.0);

transformed = mix(transformed, perlinDisplaced, (1.0 - fadeDiplacement) * 0.25);
transformed *= fade;
transformed *= uRevealSides;

float mouseTransform = mouseSim.r * 15.0;

vec4 displacement = texture2D(tDisplacement, newUv);
float displacementF = displacement.r;
float waveDisplacement = displacementF * 3.0 + 6.0 * (1.0 - revealCombined);

transformed.z -= 1.5;
transformed.z += waveDisplacement;
transformed.z += mouseTransform * uMouseFactor;
transformed *= 1.0 - displacementF * 0.1;

float spread = 3.0;
vec3 transformedSpread = transformed;
transformedSpread.x -= instanceColor.x * spread;
transformedSpread.x += spread / 2.0;
transformedSpread.y -= instanceColor.y * spread;
transformedSpread.y += spread / 2.0;
transformedSpread.z -= instanceColor.z * spread;
transformedSpread.z += spread / 2.0;
transformed = mix(transformedSpread, transformed, uRevealSpreadSides);
transformed = mix(transformedSpread, transformed, 1.0 - uRevealSpread);
`;

const workBlockSourceScreenUvBeginVertexChunk = workBlockBeginVertexChunk.replace(
  [
    "vec2 newUv = uv;",
    "vec2 newOffset = instanceOffset.xy;",
    "newUv.x /= uGridSize.x;",
    "newUv.y /= uGridSize.y;",
    "newUv.x += newOffset.x;",
    "newUv.y += newOffset.y;",
  ].join("\n"),
  [
    "vec2 screenUv = gl_Position.xy / uCoords.xy;",
    "vec2 newUv = screenUv;",
    "vec2 newOffset = instanceOffset.xy;",
    "newUv.x /= uGridSize.x;",
    "newUv.y /= uGridSize.y;",
    "newUv.x += newOffset.x;",
    "newUv.y += newOffset.y;",
  ].join("\n"),
);

const workBlockSourceWorldPositionChunk = `
transformed /= 1. - mouseSim.r * .2;
vec4 worldPosition = vec4( transformed, 1.0 );

worldPosition = instanceMatrix * worldPosition;
worldPosition = modelMatrix * worldPosition;
`;

const workBlockSourceShadowmapVertexChunk = `
#include <shadowmap_vertex>
#include <fog_vertex>
vInstanceIndex = instanceIndex;
vInstanceAlpha = instanceAlpha;
vOffset = instanceOffset;

#ifdef USE_TRANSMISSION
  vWorldPosition = worldPosition.xyz;
#endif
vPosition = position;
vInstanceColor = instanceColor;
`;

const workBlockSourceProjectVertexChunk = `
vec4 mvPosition = vec4( transformed, 1.0 );

#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif

mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`;

const workBlockFragmentDeclarationPars = `
varying float vInstanceIndex;
varying float vInstanceAlpha;
varying vec3 vInstanceColor;
varying vec3 vPosition;
varying vec3 vOffset;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uTime;
uniform float uMouseFactor;
uniform float uMouseLightness;
uniform vec2 uCoords;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
varying vec2 vUv;
uniform sampler2D tMouseSim2;
uniform sampler2D tDisplacement;
`;

const workBlockFragmentHelperPars = `
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float vignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}
`;

const workBlockSourceZaFragmentShader = `
varying float vInstanceIndex;
varying float vInstanceAlpha;
varying vec3 vInstanceColor;
varying vec3 vPosition;
varying vec3 vOffset;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uTime;
uniform float uMouseFactor;
uniform float uMouseLightness;
uniform vec2 uCoords;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
varying vec2 vUv;
uniform sampler2D tMouseSim2;
uniform sampler2D tDisplacement;

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
// #include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <map_pars_fragment>
// #include <alphamap_pars_fragment>
// #include <alphatest_pars_fragment>
// #include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
// #include <emissivemap_pars_fragment>
#include <bsdfs>
// #include <iridescence_fragment>
// #include <cube_uv_reflection_fragment>
// #include <envmap_common_pars_fragment>
// #include <envmap_physical_pars_fragment>
// #include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>
// #include <normalmap_pars_fragment>
// #include <clearcoat_pars_fragment>
// #include <iridescence_pars_fragment>
// #include <roughnessmap_pars_fragment>
// #include <metalnessmap_pars_fragment>
// #include <logdepthbuf_pars_fragment>
// #include <clipping_planes_pars_fragment>

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


float vignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}


void main() {
	// #include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

  #include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_end>

  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

  #include <opaque_fragment>

  float mixedAlpha = vInstanceAlpha;
  vec2 newUv = vUv;
  vec2 newOffset = vOffset.xy;

  newUv.x /= uGridSize.x;${SOURCE_TRAILING_SPACE}
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y;${SOURCE_TRAILING_SPACE}
${SOURCE_TRAILING_SPACE}
  vec2 gridUv = vec2(floor(newUv.x * uGridSize.x), floor(newUv.y * uGridSize.y));
  vec2 gridUv2 = vec2(floor(newUv.y * uGridSize.y), floor(newUv.x * uGridSize.y));

  float alpha = mix(random(gridUv * vInstanceAlpha), random(gridUv), 1.);
  float alpha2 = mix(random(gridUv2 * vInstanceAlpha), random(gridUv2), 1.);

  // create a vignette
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  // get screen uv
  vec2 screenUv = gl_FragCoord.xy / uCoords.xy;
  vec4 mouseSim = texture2D(tMouseSim2, screenUv);
  vec4 displacement = texture2D(tDisplacement, newUv);

  float revealCombined = uReveal * uRevealProject;
  float mouseF = 1. - mouseSim.r;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  mixedAlpha =  ((alpha * alpha2) * vInstanceAlpha);
  if(screenUv.y > 0.1) mixedAlpha += clamp(mouseSim.r * (uMouseFactor * 0.5), 0., 1.);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(mouseF), (1. - uMouseLightness));
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  float vignin = 0.01;
  float vignout = 0.2;
  float vignfade = 6.;
  float fstop = 1.0;

  vec2 center = vec2(0.5, 0.5);

  float v = vignette(newUv.xy, center.xy, 0.01, 0.2,  6., 1.0);
  float v2 = vignette(newUv.xy, center.xy, 0.01, 2.0 * pow(revealCombined, .25),  6. , 1.0);

  mixedAlpha += v * .1;
  mixedAlpha -= 1. - v2;
  mixedAlpha *= uRevealSides;

  gl_FragColor.a = mixedAlpha;

  // #include <tonemapping_fragment>
}
`;

const auxiliaryBlockFragmentPars = `
uniform float uAuxiliaryMaterial;
uniform float uScrollOpacity;
`;

const auxiliaryBlockOpaqueFragmentChunk = `
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

vec3 sourceColor = outgoingLight;
vec2 sourceUv = vUv / uGridSize.xy + vOffset.xy;

vec2 screenUv = gl_FragCoord.xy / max(uCoords, vec2(1.0));
float simLight = texture2D(tMouseSim2, screenUv).r;
float mouseF = 1.0 - simLight;
sourceColor = mix(sourceColor, sourceColor * vec3(mouseF), 1.0 - uMouseLightness);

vec2 gridUv = vec2(floor(sourceUv.x * uGridSize.x), floor(sourceUv.y * uGridSize.y));
vec2 gridUv2 = vec2(floor(sourceUv.y * uGridSize.y), floor(sourceUv.x * uGridSize.y));
float alpha1 = mix(random(gridUv * vInstanceAlpha), random(gridUv), 1.0);
float alpha2 = mix(random(gridUv2 * vInstanceAlpha), random(gridUv2), 1.0);
float alpha = alpha1 * alpha2 * vInstanceAlpha;
float revealCombined = uReveal * uRevealProject;
float fragmentReveal = mix(revealCombined, 1.0, uAuxiliaryMaterial);
float revealRadius = 2.0 * pow(fragmentReveal, 0.25);
float centerAlpha = vignette(sourceUv, vec2(0.5), 0.01, 0.2, 6.0, 1.0);
float revealAlpha = vignette(sourceUv, vec2(0.5), 0.01, revealRadius, 6.0, 1.0);
float mouseAlphaFactor = mix(0.5, 0.15, uAuxiliaryMaterial);
if (screenUv.y > 0.1) alpha += clamp(simLight * (uMouseFactor * mouseAlphaFactor), 0.0, 1.0);
alpha += centerAlpha * 0.1;
alpha -= 1.0 - revealAlpha;
alpha *= mix(uRevealSides, uScrollOpacity, uAuxiliaryMaterial);

gl_FragColor = vec4(sourceColor, alpha * diffuseColor.a);
`;

const workBlockSourceTailFragmentChunk = `
#include <opaque_fragment>

float mixedAlpha = vInstanceAlpha;
vec2 newUv = vUv;
vec2 newOffset = vOffset.xy;

newUv.x /= uGridSize.x;
newUv.y /= uGridSize.y;

newUv.x += newOffset.x;
newUv.y += newOffset.y;

vec2 gridUv = vec2(floor(newUv.x * uGridSize.x), floor(newUv.y * uGridSize.y));
vec2 gridUv2 = vec2(floor(newUv.y * uGridSize.y), floor(newUv.x * uGridSize.y));
float alpha = mix(random(gridUv * vInstanceAlpha), random(gridUv), 1.0);
float alpha2 = mix(random(gridUv2 * vInstanceAlpha), random(gridUv2), 1.0);
vec2 screenUv = gl_FragCoord.xy / uCoords.xy;
vec4 mouseSim = texture2D(tMouseSim2, screenUv);
vec4 displacement = texture2D(tDisplacement, newUv);
float revealCombined = uReveal * uRevealProject;
float mouseF = 1.0 - mouseSim.r;

mixedAlpha = ((alpha * alpha2) * vInstanceAlpha);
if (screenUv.y > 0.1) mixedAlpha += clamp(mouseSim.r * (uMouseFactor * 0.5), 0.0, 1.0);
gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(mouseF), (1.0 - uMouseLightness));

float vignin = 0.01;
float vignout = 0.2;
float vignfade = 6.0;
float fstop = 1.0;

vec2 center = vec2(0.5, 0.5);

float v = vignette(newUv.xy, center.xy, 0.01, 0.2, 6.0, 1.0);
float v2 = vignette(newUv.xy, center.xy, 0.01, 2.0 * pow(revealCombined, 0.25), 6.0, 1.0);

mixedAlpha += v * 0.1;
mixedAlpha -= 1.0 - v2;
mixedAlpha *= uRevealSides;

gl_FragColor.a = mixedAlpha;
`;

function stripSourceVaFragmentPaths(fragmentShader: string) {
  return fragmentShader
    .replace("#include <color_pars_fragment>", "// #include <color_pars_fragment>")
    .replace("#include <map_pars_fragment>", "// #include <map_pars_fragment>")
    .replace("#include <alphamap_pars_fragment>", "// #include <alphamap_pars_fragment>")
    .replace("#include <alphatest_pars_fragment>", "// #include <alphatest_pars_fragment>")
    .replace("#include <alphahash_pars_fragment>", "// source VA omits alphahash_pars_fragment")
    .replace("#include <aomap_pars_fragment>", "// #include <aomap_pars_fragment>")
    .replace("#include <lightmap_pars_fragment>", "// #include <lightmap_pars_fragment>")
    .replace("#include <emissivemap_pars_fragment>", "// #include <emissivemap_pars_fragment>")
    .replace("#include <iridescence_fragment>", "// #include <iridescence_fragment>")
    .replace("#include <cube_uv_reflection_fragment>", "// #include <cube_uv_reflection_fragment>")
    .replace("#include <envmap_common_pars_fragment>", "// #include <envmap_common_pars_fragment>")
    .replace("#include <envmap_physical_pars_fragment>", "// #include <envmap_physical_pars_fragment>")
    .replace("#include <fog_pars_fragment>", "// #include <fog_pars_fragment>")
    .replace("#include <bumpmap_pars_fragment>", "// #include <bumpmap_pars_fragment>")
    .replace("#include <normalmap_pars_fragment>", "// #include <normalmap_pars_fragment>")
    .replace("#include <clearcoat_pars_fragment>", "// #include <clearcoat_pars_fragment>")
    .replace("#include <iridescence_pars_fragment>", "// #include <iridescence_pars_fragment>")
    .replace("#include <roughnessmap_pars_fragment>", "// #include <roughnessmap_pars_fragment>")
    .replace("#include <metalnessmap_pars_fragment>", "// #include <metalnessmap_pars_fragment>")
    .replace("#include <logdepthbuf_pars_fragment>", "// #include <logdepthbuf_pars_fragment>")
    .replace("#include <clipping_planes_pars_fragment>", "// #include <clipping_planes_pars_fragment>")
    .replace("#include <clipping_planes_fragment>", "// #include <clipping_planes_fragment>")
    .replace("#include <logdepthbuf_fragment>", "// source VA omits logdepthbuf_fragment")
    .replace("#include <map_fragment>", "// source VA omits map_fragment")
    .replace("#include <color_fragment>", "// source VA omits color_fragment")
    .replace("#include <alphamap_fragment>", "// source VA omits alphamap_fragment")
    .replace("#include <alphatest_fragment>", "// source VA omits alphatest_fragment")
    .replace("#include <alphahash_fragment>", "// source VA omits alphahash_fragment")
    .replace("#include <clearcoat_normal_fragment_begin>", "// source VA omits clearcoat_normal_fragment_begin")
    .replace("#include <clearcoat_normal_fragment_maps>", "// source VA omits clearcoat_normal_fragment_maps")
    .replace("#include <emissivemap_fragment>", "// source VA omits emissivemap_fragment")
    .replace("#include <lights_fragment_maps>", "// source VA omits lights_fragment_maps")
    .replace("#include <aomap_fragment>", "// source VA omits aomap_fragment")
    .replace("#include <transmission_fragment>", "// source VA omits transmission_fragment")
    .replace(/#ifdef USE_SHEEN\s+outgoingLight = outgoingLight \+ sheenSpecularDirect \+ sheenSpecularIndirect;\s+#endif/g, "// source VA omits sheen outgoing-light tail")
    .replace(/#ifdef USE_SHEEN\s+float sheenEnergyComp = 1\.0 - 0\.157 \* max3\( material\.sheenColor \);\s+outgoingLight = outgoingLight \* sheenEnergyComp \+ sheenSpecularDirect \+ sheenSpecularIndirect;\s+#endif/g, "// source VA omits r164 sheen outgoing-light tail")
    .replace(/#ifdef USE_CLEARCOAT\s+float dotNVcc = saturate\( dot\( geometryClearcoatNormal, geometryViewDir \) \);\s+vec3 Fcc = F_Schlick\( material.clearcoatF0, material.clearcoatF90, dotNVcc \);\s+outgoingLight = outgoingLight \* \( 1.0 - material.clearcoat \* Fcc \) \+ \( clearcoatSpecularDirect \+ clearcoatSpecularIndirect \) \* material.clearcoat;\s+#endif/g, "// source VA omits clearcoat outgoing-light tail");
}

function patchWorkBlockShader(
  shader: { uniforms: Record<string, any>; vertexShader: string; fragmentShader: string },
  uniforms: Record<string, any>,
  variant: "work" | "auxiliary" = "work",
) {
  Object.assign(shader.uniforms, uniforms);
  if (variant === "work") {
    shader.vertexShader = workBlockSourceHaVertexShader;
  } else {
    shader.vertexShader = `${workBlockVertexPars}\n${shader.vertexShader}`
      .replace("varying vec3 vViewPosition;", workBlockVertexSourceViewVaryings)
      .replace("void main() {", "void main() {\n  vUv = uv;")
      .replace("#include <begin_vertex>", workBlockSourceScreenUvBeginVertexChunk)
      .replace("#include <worldpos_vertex>", workBlockSourceWorldPositionChunk)
      .replace("#include <shadowmap_vertex>\n\t#include <fog_vertex>", workBlockSourceShadowmapVertexChunk);
  }
  if (variant === "work") {
    shader.fragmentShader = workBlockSourceZaFragmentShader;
  } else {
    shader.fragmentShader = `${workBlockFragmentDeclarationPars}\n${auxiliaryBlockFragmentPars}\n${shader.fragmentShader}`
      .replace("#include <clipping_planes_pars_fragment>", `#include <clipping_planes_pars_fragment>\n\n${workBlockFragmentHelperPars}`)
      .replace("#include <tonemapping_fragment>", "// source VA omits tonemapping_fragment")
      .replace("#include <colorspace_fragment>", "// source VA omits colorspace_fragment")
      .replace("#include <fog_fragment>", "// source VA omits fog_fragment")
      .replace("#include <premultiplied_alpha_fragment>", "// source VA omits premultiplied_alpha_fragment")
      .replace("#include <dithering_fragment>", "// source VA omits dithering_fragment");
    shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", auxiliaryBlockOpaqueFragmentChunk);
  }
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("dump-va-shader")) {
    const dumpWindow = window as ShaderDumpWindow;
    dumpWindow.__rogierVaShaderDump ??= [];
    dumpWindow.__rogierVaShaderDump.push({
      variant,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });
    dumpWindow.__rogierShaderDump ??= [];
    dumpWindow.__rogierShaderDump.push({
      name: `VA-${variant}`,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });
  }
}

function stripSourceHaR164VertexSurface(vertexShader: string) {
  return vertexShader
    .replace("#include <batching_pars_vertex>", "// source HA omits batching_pars_vertex")
    .replace("#include <displacementmap_pars_vertex>", "// source HA omits displacementmap_pars_vertex")
    .replace("#include <morphtarget_pars_vertex>", "// source HA omits morphtarget_pars_vertex")
    .replace("#include <skinning_pars_vertex>", "// source HA omits skinning_pars_vertex")
    .replace("#include <logdepthbuf_pars_vertex>", "// source HA omits logdepthbuf_pars_vertex")
    .replace("#include <clipping_planes_pars_vertex>", "// source HA omits clipping_planes_pars_vertex")
    .replace("#include <morphinstance_vertex>", "// source HA omits morphinstance_vertex")
    .replace("#include <morphcolor_vertex>", "// source HA omits morphcolor_vertex")
    .replace("#include <batching_vertex>", "// source HA omits batching_vertex")
    .replace("#include <morphnormal_vertex>", "// source HA omits morphnormal_vertex")
    .replace("#include <skinbase_vertex>", "// source HA omits skinbase_vertex")
    .replace("#include <skinnormal_vertex>", "// source HA omits skinnormal_vertex")
    .replace("#include <morphtarget_vertex>", "// source HA omits morphtarget_vertex")
    .replace("#include <skinning_vertex>", "// source HA omits skinning_vertex")
    .replace("#include <displacementmap_vertex>", "// source HA omits displacementmap_vertex")
    .replace("#include <project_vertex>", workBlockSourceProjectVertexChunk)
    .replace("#include <logdepthbuf_vertex>", "// source HA omits logdepthbuf_vertex")
    .replace("#include <clipping_planes_vertex>", "// source HA omits clipping_planes_vertex")
    .replace(
      /\n#ifdef USE_TRANSMISSION\s+vWorldPosition = worldPosition\.xyz;\s+#endif(?=\s*\})/,
      "",
    );
}

function stripSourceVaR164PhysicalBranches(fragmentShader: string) {
  return fragmentShader
    .replace(/#ifdef USE_DISPERSION[\s\S]*?uniform float dispersion;[\s\S]*?#endif/g, "// source VA omits r164 dispersion uniforms")
    .replace(/#ifdef USE_ANISOTROPY[\s\S]*?uniform vec2 anisotropyVector;[\s\S]*?#ifdef USE_ANISOTROPYMAP[\s\S]*?uniform sampler2D anisotropyMap;[\s\S]*?#endif[\s\S]*?#endif/g, "// source VA omits r164 anisotropy uniforms");
}

function alignSourceVaMaterialMacroSurface(fragmentShader: string) {
  return fragmentShader
    .replace(/USE_SPECULAR_COLORMAP/g, "USE_SPECULARCOLORMAP")
    .replace(/USE_SPECULAR_INTENSITYMAP/g, "USE_SPECULARINTENSITYMAP")
    .replace(/USE_SHEEN_COLORMAP/g, "USE_SHEENCOLORMAP")
    .replace(/USE_SHEEN_ROUGHNESSMAP/g, "USE_SHEENROUGHNESSMAP");
}

const environmentVertexShader = `
varying vec2 vUv;
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  vUv = uv;
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphcolor_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = -mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
#ifdef USE_TRANSMISSION
  vWorldPosition = worldPosition.xyz;
#endif
}
`;

const sourceContrastHelper = `
vec3 contrast(vec3 color, float value) {
  return 0.5 + value * (color - 0.5);
}
`;

const sourceSaturationHelper = `
vec3 saturation(vec3 rgb, float adjustment) {
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
}
`;

const sourceCompositeColorHelper = `${sourceSaturationHelper}

float vignette(vec2 coords, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, vec2(0.5, 0.5));
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}


vec3 circle(vec2 uv, vec2 center, vec3 color, float size) {
  float circle = length(uv - center);
  circle = 1. - smoothstep(0.0, size, circle);
  return color * circle;
}


vec3 contrast(vec3 color, float value) {
  return 0.5 + value * (color - 0.5);
}


vec3 hue(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}


vec4 rgbshift(sampler2D image, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture(image, uv + offset);
    vec4 g = texture(image, uv);
    vec4 b = texture(image, uv - offset);
    return vec4(r.r, g.g, b.b, g.a);
}
`;

const sourceSimplexNoiseHelper = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
\t\t+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const sourceNoiseShaderHelper = `
float randomF(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float customRoughness(float roughness, vec2 vUv, float size, float time) {
  float roughnessFactor = roughness;
  // Triangular tiling
  vec2 triangle = vec2(mod(vUv.x * size, 1.0), mod(vUv.y * size, 1.0));

    // Generate random shades of grey based on the cell position
  vec2 cell = floor(vUv * size);
  float shade = randomF(cell) * 0.8 + 0.1; // Shades between 0.25 and 0.75
  vec4 roughnessColor = vec4(1.);

    // Create the triangle pattern
  if(triangle.y > triangle.x) {
    roughnessColor = vec4(vec3(shade), 1.0);
  } else {
    roughnessColor = vec4(vec3(1.0 - shade), 1.0);
  }

   roughnessFactor *= roughnessColor.g;

  return roughnessFactor;
}


float noiseShaderRandom(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(mix(noiseShaderRandom(ip), noiseShaderRandom(ip + vec2(1.0, 0.0)), u.x), mix(noiseShaderRandom(ip + vec2(0.0, 1.0)), noiseShaderRandom(ip + vec2(1.0, 1.0)), u.x), u.y);
  return res * res;
}

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p, float time, float speed) {
  float f = 0.0;

  f += 0.500000 * noise(p - time * speed);
  p = mtx * p * 2.02;
  f += 0.031250 * noise(p);
  p = mtx * p * 2.01;
  f += 0.250000 * noise(p);
  p = mtx * p * 2.03;
  f += 0.125000 * noise(p);
  p = mtx * p * 2.01;
  f += 0.062500 * noise(p - time * (speed * 5.));
  p = mtx * p * 2.04;
  f += 0.015625 * noise(p + time * (speed * 5.));

  return f / 0.96875;
}

float pattern(vec2 p, float time, float speed) {
  float f1 = fbm(p, time, speed);
  float f2 = fbm(p + f1, time, speed);

  return fbm(p + f2, time, speed);
}
vec4 noiseShader(vec2 uv, float time, float speed) {
  float shade = pattern(uv, time, speed);
  return vec4(vec3(shade), shade);
}
`;

const sourceBlendHelper = `

float blendColorDodge(float base, float blend) {
	return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
	return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
	return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}


float blendColorBurn(float base, float blend) {
	return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
	return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
	return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}


float blendLinearBurn(float base, float blend) {
	// Note : Same implementation as BlendSubtractf
	return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendSubtract
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
	return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}


float blendLinearDodge(float base, float blend) {
	// Note : Same implementation as BlendAddf
	return min(base+blend,1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendAdd
	return min(base+blend,vec3(1.0));
}

vec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {
	return (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
}


float blendDarken(float base, float blend) {
	return min(blend,base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
	return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
	return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}


float blendLighten(float base, float blend) {
	return max(blend,base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
	return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
	return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}


float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}


float blendReflect(float base, float blend) {
	return (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
	return vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
	return (blendReflect(base, blend) * opacity + base * (1.0 - opacity));
}


float blendVividLight(float base, float blend) {
	return (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));
}

vec3 blendVividLight(vec3 base, vec3 blend) {
	return vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));
}

vec3 blendVividLight(vec3 base, vec3 blend, float opacity) {
	return (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));
}


float blendHardMix(float base, float blend) {
	return (blendVividLight(base,blend)<0.5)?0.0:1.0;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
	return vec3(blendHardMix(base.r,blend.r),blendHardMix(base.g,blend.g),blendHardMix(base.b,blend.b));
}

vec3 blendHardMix(vec3 base, vec3 blend, float opacity) {
	return (blendHardMix(base, blend) * opacity + base * (1.0 - opacity));
}


float blendLinearLight(float base, float blend) {
	return blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
	return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

vec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {
	return (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));
}


float blendPinLight(float base, float blend) {
	return (blend<0.5)?blendDarken(base,(2.0*blend)):blendLighten(base,(2.0*(blend-0.5)));
}

vec3 blendPinLight(vec3 base, vec3 blend) {
	return vec3(blendPinLight(base.r,blend.r),blendPinLight(base.g,blend.g),blendPinLight(base.b,blend.b));
}

vec3 blendPinLight(vec3 base, vec3 blend, float opacity) {
	return (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendGlow(vec3 base, vec3 blend) {
	return blendReflect(blend,base);
}

vec3 blendGlow(vec3 base, vec3 blend, float opacity) {
	return (blendGlow(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendHardLight(vec3 base, vec3 blend) {
	return blendOverlay(blend,base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
	return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendPhoenix(vec3 base, vec3 blend) {
	return min(base,blend)-max(base,blend)+vec3(1.0);
}

vec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {
	return (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendNormal(vec3 base, vec3 blend) {
	return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
	return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendNegation(vec3 base, vec3 blend) {
	return vec3(1.0)-abs(vec3(1.0)-base-blend);
}

vec3 blendNegation(vec3 base, vec3 blend, float opacity) {
	return (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendMultiply(vec3 base, vec3 blend) {
	return base*blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
	return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendAverage(vec3 base, vec3 blend) {
	return (base+blend)/2.0;
}

vec3 blendAverage(vec3 base, vec3 blend, float opacity) {
	return (blendAverage(base, blend) * opacity + base * (1.0 - opacity));
}


float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}


float blendSoftLight(float base, float blend) {
	return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
	return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
	return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}


float blendSubtract(float base, float blend) {
	return max(base+blend-1.0,0.0);
}

vec3 blendSubtract(vec3 base, vec3 blend) {
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendSubtract(vec3 base, vec3 blend, float opacity) {
	return (blendSubtract(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendExclusion(vec3 base, vec3 blend) {
	return base+blend-2.0*base*blend;
}

vec3 blendExclusion(vec3 base, vec3 blend, float opacity) {
	return (blendExclusion(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendDifference(vec3 base, vec3 blend) {
	return abs(base-blend);
}

vec3 blendDifference(vec3 base, vec3 blend, float opacity) {
	return (blendDifference(base, blend) * opacity + base * (1.0 - opacity));
}


float blendAdd(float base, float blend) {
	return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
	return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}



vec3 blend(int mode, vec3 base, vec3 blend, float opacity) {
  if(mode == 1) {
    return blendAdd(base, blend, opacity);
  } else if(mode == 2) {
    return blendAverage(base, blend, opacity);
  } else if(mode == 3) {
    return blendColorBurn(base, blend, opacity);
  } else if(mode == 4) {
    return blendColorDodge(base, blend, opacity);
  } else if(mode == 5) {
    return blendDarken(base, blend, opacity);
  } else if(mode == 6) {
    return blendDifference(base, blend, opacity);
  } else if(mode == 7) {
    return blendExclusion(base, blend, opacity);
  } else if(mode == 8) {
    return blendGlow(base, blend, opacity);
  } else if(mode == 9) {
    return blendHardLight(base, blend, opacity);
  } else if(mode == 10) {
    return blendHardMix(base, blend, opacity);
  } else if(mode == 11) {
    return blendLighten(base, blend, opacity);
  } else if(mode == 12) {
    return blendLinearBurn(base, blend, opacity);
  } else if(mode == 13) {
    return blendLinearDodge(base, blend, opacity);
  } else if(mode == 14) {
    return blendLinearLight(base, blend, opacity);
  } else if(mode == 15) {
    return blendMultiply(base, blend, opacity);
  } else if(mode == 16) {
    return blendNegation(base, blend, opacity);
  } else if(mode == 17) {
    return blendNormal(base, blend, opacity);
  } else if(mode == 18) {
    return blendOverlay(base, blend, opacity);
  } else if(mode == 19) {
    return blendPhoenix(base, blend, opacity);
  } else if(mode == 20) {
    return blendPinLight(base, blend, opacity);
  } else if(mode == 21) {
    return blendReflect(base, blend, opacity);
  } else if(mode == 22) {
    return blendScreen(base, blend, opacity);
  } else if(mode == 23) {
    return blendSoftLight(base, blend, opacity);
  } else if(mode == 24) {
    return blendSubtract(base, blend, opacity);
  } else if(mode == 25) {
    return blendVividLight(base, blend, opacity);
  }
}

`;

const sourceBlendMultiplyHelper = `
vec3 blendMultiply(vec3 base, vec3 blend) {
\treturn base*blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
\treturn (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}
`;

const sourceSkyBlendHelper = `
float blendReflect(float base, float blend) {
\treturn (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
\treturn vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
\treturn (blendReflect(base, blend) * opacity + base * (1.0 - opacity));
}


vec3 blendNegation(vec3 base, vec3 blend) {
\treturn vec3(1.0)-abs(vec3(1.0)-base-blend);
}

vec3 blendNegation(vec3 base, vec3 blend, float opacity) {
\treturn (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
}


float blendColorBurn(float base, float blend) {
\treturn (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
\treturn vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
\treturn (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}

`;

const sourceOilHelper = `
vec4 oil(vec2 uv, float time, float strength) {
    float t = time;
    vec3 col = vec3(0.0);
    vec2 pos = uv;
    float noisePos = snoise(uv * 1.15) * .005;

    for (float k = 1.0; k < 5.0; k += 1.) {${SOURCE_TRAILING_SPACE}
        pos.x += strength * sin(2.0 * t + k * 1.5 * pos.y + noisePos * 10.);
        pos.y += strength * cos(2.0 * t + k * 1.5 * pos.x - noisePos);
    }

    col += clamp(-0.0 + 0.5 * cos(t * 0.5 + pos.xyx * 3.0).xxx, -0.1, 0.99);
    return vec4(col, 1.0);
}
`;

const environmentFragmentShader = `
${sourceSimplexNoiseHelper}
${sourceNoiseShaderHelper}
${sourceBlendHelper}
${sourceOilHelper}

uniform float uMultiplier;
uniform float uShader1Speed;
uniform float uShader1Alpha;
uniform float uShader1Scale;

uniform float uShader2Alpha;
uniform float uShader2Scale;

uniform float uShader3Speed;
uniform float uShader3Alpha;
uniform float uShader3Scale;

uniform float uShader1Mix2;
uniform float uShader1Mix3;

uniform vec3 uDarkenColor;
uniform float uDarken;

uniform sampler2D tSky;

uniform float uTime;
varying vec2 vUv;

#define STANDARD
#ifdef PHYSICAL
\t#define IOR
\t#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
\t#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
\t#endif
\t#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
\t#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
\t#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
\t#endif
\t#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
\t#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
// #include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <map_pars_fragment>
// #include <alphamap_pars_fragment>
// #include <alphatest_pars_fragment>
// #include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
// #include <emissivemap_pars_fragment>
#include <bsdfs>
// #include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
// #include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>
// #include <normalmap_pars_fragment>
// #include <clearcoat_pars_fragment>
// #include <iridescence_pars_fragment>
// #include <roughnessmap_pars_fragment>
// #include <metalnessmap_pars_fragment>
// #include <logdepthbuf_pars_fragment>
// #include <clipping_planes_pars_fragment>

float smoothMask(float coord, float center, float spread) {
  return (1. - smoothstep(coord,  center, center - spread)) + (1. - smoothstep(coord,  center, center + spread));
}

void main() {
\t// #include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

\t// #include <logdepthbuf_fragment>
\t// #include <map_fragment>
\t// #include <color_fragment>

  vec2 skyUv = vUv;
  vec2 skyUv2 = vUv;

${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  skyUv.x += .5;
  skyUv2.x -= .75;

  vec4 noise = texture(tSky, (skyUv * 2.));
  vec4 noise2 = texture(tSky, (skyUv2 * 1.));
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec3 maskColor = vec3(1.0, 1.0, 1.0);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  float m = 0.0;

  m = max(m, 1. - smoothstep(vUv.x, 0.00, 0.015));
  m = max(m, 1. - smoothstep(vUv.x, 1.015, 0.985));
  m = max(m, smoothMask(vUv.x, .5, 0.01));
  m = m * 1. - smoothMask(vUv.x, .75, 0.02);
  m = clamp(m, 0.0, 1.0);

  vec4 noiseMixed = mix(noise, noise2, m);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  diffuseColor.rgb = blend(4, diffuseColor.rgb, noiseMixed.rgb, 0.5);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec2 skyMaskUv = vUv;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  skyMaskUv.y -= .1;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  float skyMask = mod((skyMaskUv.y) * 5., 1.);
  skyMask = max(skyMask, step(0.6, skyMaskUv.y));
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  diffuseColor.rgb = blend(16, diffuseColor.rgb, noiseMixed.rgb , skyMask);
  diffuseColor.rgb += vec3(smoothstep(vUv.y, .45, .595));

  float skyMask2 = mod((skyMaskUv.y) * 2.5, 1.);
  skyMask2 = max(skyMask, step(0.6, skyMaskUv.y));

  diffuseColor.rgb = mix(vec3(1.0, 1.0, 1.0), diffuseColor.rgb, skyMask2 * 1.5);
  diffuseColor.rgb *= 1.15;
  diffuseColor.rgb *= clamp(diffuseColor.rgb, vec3(0.0), vec3(1.0));
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
\t// #include <alphamap_fragment>
\t// #include <alphatest_fragment>
\t#include <roughnessmap_fragment>
\t#include <metalnessmap_fragment>
\t#include <normal_fragment_begin>
\t#include <normal_fragment_maps>
\t// #include <clearcoat_normal_fragment_begin>
\t// #include <clearcoat_normal_fragment_maps>
\t// #include <emissivemap_fragment>
\t#include <lights_physical_fragment>
\t#include <lights_fragment_begin>
\t#include <lights_fragment_maps>
\t#include <lights_fragment_end>
\t// #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
\t// #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec3 black = vec3(0.095, 0.095, 0.095);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
\t#include <opaque_fragment>

  gl_FragColor.rgb = blend(4, gl_FragColor.rgb, uDarkenColor, uDarken);
  // gl_FragColor.rgb = 1. - noiseMixed.rgb;
  // gl_FragColor.rgb = vec3(mask4);



\t// #include <tonemapping_fragment>
\t// #include <colorspace_fragment>
\t// #include <fog_fragment>
\t// #include <premultiplied_alpha_fragment>
\t#include <dithering_fragment>
}
`;

function patchEnvironmentShader(
  shader: { uniforms: Record<string, any>; vertexShader: string; fragmentShader: string },
  uniforms: Record<string, any>,
) {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = environmentVertexShader;
  shader.fragmentShader = environmentFragmentShader;
  dumpShader("u1-environment", shader.vertexShader, shader.fragmentShader);
}

function dumpShader(name: string, vertexShader: string, fragmentShader: string) {
  if (typeof window === "undefined" || !new URLSearchParams(window.location.search).has("dump-va-shader")) return;
  const dumpWindow = window as ShaderDumpWindow;
  dumpWindow.__rogierShaderDump ??= [];
  if (dumpWindow.__rogierShaderDump.some((entry) => entry.name === name)) return;
  dumpWindow.__rogierShaderDump.push({ name, vertexShader, fragmentShader });
}

const homeCompositeFragment = `
precision highp float;

#include <tonemapping_pars_fragment>

${sourceCompositeColorHelper}
${sourceBlendHelper}

float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tMouseSim;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

uniform float uDarken;
uniform float uSaturation;

float vignout = .55; // vignetting outer border
float vignin = 0.1; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 fluid = texture(tFluid, vUv);
  vec4 mouseSim = texture(tMouseSim, vUv);
  vec2 uv = vUv;
  vec4 mixed = rgbshift(tScene, uv, -1., .0015);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  mixed.rgb += length(fluid.xy) * .015;

  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .75);

  // mixed.rgb *= vignetteF;

  vec3 green = vec3(0.063,0.141,0.086);
  vec3 greenLight = vec3(0.337,1.,0.561);
  vec3 black = vec3(0.095,0.095,0.095);

  // mixed.rgb = blend(5, mixed.rgb, greenLight, .5);
  mixed.rgb = blend(15, mixed.rgb, black, uDarken * 2. + mouseSim.r * .25 * uDarken);
  mixed.rgb = blend(11, mixed.rgb, black, 1.);

  mixed.rgb = saturation(mixed.rgb, uSaturation);

  FragColor = vec4(mixed.rgb, 1.);

  #include <tonemapping_fragment>
}
`;

const homeCompositeDebugFragment = homeCompositeFragment
  .replace(
    "uniform float uSaturation;",
    `uniform float uSaturation;
uniform int uDebugStage;
uniform int uDebugDarkenMode;
uniform int uDebugTransferMode;
uniform int uDebugLightenMode;`,
  )
  .replace(
    "vec4 mixed = rgbshift(tScene, uv, -1., .0015);",
    `vec4 mixed = rgbshift(tScene, uv, -1., .0015);
  if (uDebugTransferMode == 1) mixed.rgb = pow(max(mixed.rgb, vec3(0.0)), vec3(1.0 / 2.2));
  if (uDebugTransferMode == 2) mixed.rgb = pow(max(mixed.rgb, vec3(0.0)), vec3(2.2));
  if (uDebugStage == 1) {
    FragColor = vec4(mixed.rgb, 1.0);
    return;
  }`,
  )
  .replace(
    "mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;\n  }\n\n\n  mixed.rgb += length(fluid.xy) * .015;",
    `mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }
  if (uDebugStage == 2) {
    FragColor = vec4(mixed.rgb, 1.0);
    return;
  }
  mixed.rgb += length(fluid.xy) * .015;`,
  )
  .replace(
    "mixed.rgb += length(fluid.xy) * .015;\n\n  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .75);",
    `mixed.rgb += length(fluid.xy) * .015;
  if (uDebugStage == 3) {
    FragColor = vec4(mixed.rgb, 1.0);
    return;
  }
  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .75);`,
  )
  .replace(
    "mixed.rgb = blend(15, mixed.rgb, black, uDarken * 2. + mouseSim.r * .25 * uDarken);",
    `float darkenOpacity = uDarken * 2.0 + mouseSim.r * 0.25 * uDarken;
  if (uDebugDarkenMode == 1) darkenOpacity = uDarken * 2.0;
  if (uDebugDarkenMode == 2) darkenOpacity = mouseSim.r * 0.25 * uDarken;
  if (uDebugDarkenMode == 3) darkenOpacity = 0.0;
  mixed.rgb = blend(15, mixed.rgb, black, darkenOpacity);
  if (uDebugStage == 4) {
    FragColor = vec4(mixed.rgb, 1.0);
    return;
  }`,
  )
  .replace(
    "mixed.rgb = blend(11, mixed.rgb, black, 1.);\n\n  mixed.rgb = saturation(mixed.rgb, uSaturation);",
    `if (uDebugLightenMode != 1) {
    mixed.rgb = blend(11, mixed.rgb, black, 1.0);
  }
  if (uDebugStage == 5) {
    FragColor = vec4(mixed.rgb, 1.0);
    return;
  }
  mixed.rgb = saturation(mixed.rgb, uSaturation);`,
  );

const homePreCompositeFragment = `
precision highp float;

${sourceCompositeColorHelper}
${sourceBlendHelper}

float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 containerSize) {
  vec2 s = containerSize;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  vec2 uv = ouv * s / new + newOffset;
  vec4 color = texture(tex, uv);

  return color;
}

uniform sampler2D tScene;
uniform sampler2D tWork;
uniform sampler2D tBloom;
uniform sampler2D tMouseSim;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tNoise;
uniform sampler2D tLensflare;

uniform sampler2D tMedia;
uniform float uMediaReveal;
uniform float uFluidStrength;

uniform float uRatio;
uniform float uReveal;
uniform vec3 uBgColor;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

uniform vec2 uDisplacementSize;
uniform vec2 uContainerSize;
uniform float uDisplacement;
uniform float uPerlin;
uniform float uContrast;
uniform sampler2D tPerlin;
uniform float uTime;
uniform float uTransformX;

in vec2 vUv;
out vec4 FragColor;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


void main() {
  vec2 perlinUv = vUv * .25;

  // apply ratio
  perlinUv.xy -= 0.5;
  perlinUv.x *= uRatio;
  perlinUv.xy += 0.5;

  perlinUv.x -= uTime * .01;${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  perlinUv.y -= uTime * .005;${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}

  perlinUv.x += uTransformX;

  vec4 perlin = texture(tPerlin, perlinUv);
  perlin.rgb = contrast(perlin.rgb, 5.);

  vec2 displacementUv = vUv * 2.;

  displacementUv.xy -= 0.5;
  displacementUv.x *= uRatio;
  displacementUv.xy += 0.5;

  vec4 fluid = texture(tFluid, vUv);
  vec2 fluidUv = vUv + fluid.rg * -.2 * uFluidStrength;
  vec2 uv = vUv + fluid.rg * -.2 * uFluidStrength;

  // vec2 uv = vUv;
  vec2 perlinCoords = vUv;

  float vignetteF = vignette(uv.xy, 0.1, .55, 2.0, .25);

  if(uPerlin > 0.0) {
    perlinCoords += perlin.b * uPerlin;
    perlinCoords -= uPerlin * .065;
  }

  vec4 mouseSim = texture(tMouseSim, mix(perlinCoords, uv, 2.5));

  mouseSim.rgb = contrast(mouseSim.rgb, 1.);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  float perlinVignette = vignette(perlinCoords.xy, 0.1, .35, 2.0, .5);
  float displacementVignette = vignette(uv.xy, 0.1, .5, 2.0, .5);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec4 sceneDisplaced = rgbshift(tWork, uv, -1., .005);
  vec4 scene = rgbshift(tWork, uv, -1., .0005 + .1 * length(fluid.xy) * uFluidStrength);

  vec3 sceneMixed = mix(scene.rgb, sceneDisplaced.rgb, (1. - displacementVignette) * 1.);
  vec3 mixed = mix(uBgColor, sceneMixed.rgb, 1.);

  mixed.rgb += mouseSim.rgb * .065;
  mixed.rgb = mix(mixed.rgb, mixed.rgb * 5., (1. - perlinVignette) * .075);

  vec3 displacedPerlin = perlin.rgb;
  mixed.rgb = blend(1, mixed.rgb, displacedPerlin, (1. - displacementVignette +  mouseSim.r * .5) * .05);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  vec2 noiseUv = vUv;

  noiseUv.xy -= 0.5;
  noiseUv.x *= uRatio;
  noiseUv.xy += 0.5;

  noiseUv.xy *= 15.;

  vec4 noise = texture(tNoise, noiseUv);

  mixed.rgb = contrast(mixed.rgb, uContrast);
  mixed.rgb *= uContrast;

  // mixed.rgb += length(fluid.xy) * 1.15;

  mixed.rgb = saturation(mixed.rgb, 1.15);
  mixed.rgb = blend(11, mixed.rgb, uBgColor.rgb, .85);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  vec4 media = rgbshift(tMedia, fluidUv, length(fluidUv + 2.5), .15 * length(fluid.xy) * uFluidStrength);
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  mixed.rgb = mix(mixed.rgb, media.rgb, media.a * uMediaReveal);
  mixed.rgb = mix(mixed.rgb * noise.rgb, mixed.rgb, .75);
  mixed.rgb = mix(mixed.rgb * noise.rgb, mixed.rgb, 1.5);
${SOURCE_TRAILING_SPACE}
  FragColor = vec4(mixed.rgb, 1.);
}
`;

const mainCompositeFragment = `
precision highp float;

${sourceCompositeColorHelper}

float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

float vignout = .55; // vignetting outer border
float vignin = 0.1; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 fluid = texture(tFluid, vUv);
  vec2 uv = vUv + fluid.rg * -.15;
  vec4 mixed = rgbshift(tScene, uv, -1., .001);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  mixed.rgb += length(fluid.xy) * .015;

  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .25);

  FragColor = vec4(mixed.rgb, 1.);
}
`;

const homeLuminosityFragment = `
precision highp float;

uniform sampler2D tMap;
uniform float uThreshold;
uniform float uSmoothing;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 texel = texture(tMap, vUv);
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float value = dot(texel.xyz, luma);
  float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, value);
  FragColor = mix(vec4(0.0), texel, alpha);
}
`;

const homeBloomBlurFragment = `
precision mediump float;

uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;

in vec2 vUv;
out vec4 FragColor;

float gaussianPdf(float x, float sigma) {
  return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

vec4 gaussianBlur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec2 invSize = 1.0 / resolution;
  float fSigma = float(SIGMA);
  float weightSum = gaussianPdf(0.0, fSigma);
  vec3 diffuseSum = texture(image, uv).rgb * weightSum;
  for (int i = 1; i < KERNEL_RADIUS; i++) {
    float x = float(i);
    float weight = gaussianPdf(x, fSigma);
    vec2 uvOffset = direction * invSize * x;
    vec3 sample1 = texture(image, uv + uvOffset).rgb;
    vec3 sample2 = texture(image, uv - uvOffset).rgb;
    diffuseSum += (sample1 + sample2) * weight;
    weightSum += 2.0 * weight;
  }
  return vec4(diffuseSum / weightSum, 1.0);
}

void main() {
  FragColor = gaussianBlur(tMap, vUv, uResolution, uDirection);
}
`;

const sourceBlurHelper = `
vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 sum = vec4(0.0);
  vec2 pixel = 1.0 / resolution;
  sum += texture(image, uv - 4.0 * pixel * direction) * 0.051;
  sum += texture(image, uv - 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv - 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv - 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv) * 0.1633;
  sum += texture(image, uv + 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv + 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv + 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv + 4.0 * pixel * direction) * 0.051;
  return sum;
}
`;

const homeBlurFragment = `
precision highp float;

${sourceBlurHelper}

uniform sampler2D tMap;
uniform float uBluriness;
uniform vec2 uDirection;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 FragColor;

void main() {
  FragColor = blur(tMap, vUv, uResolution, uBluriness * uDirection);
}
`;

const floorReflectionBlurVertex = `
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const floorReflectionBlurFragment = `
precision mediump float;


vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 sum = vec4(0.0);
  vec2 pixel = 1.0 / resolution;
  sum += texture(image, uv - 4.0 * pixel * direction) * 0.051;
  sum += texture(image, uv - 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv - 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv - 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv) * 0.1633;
  sum += texture(image, uv + 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv + 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv + 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv + 4.0 * pixel * direction) * 0.051;
  return sum;
}


float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}


uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;

in vec2 vUv;

out vec4 FragColor;

void main() {
  vec4 tMapped = texture(tMap, vUv);

  vec2 distance = smootherstep(1.0, 0.0, vUv.y) * uDirection;
  vec4 blurred = blur(tMap, vUv, uResolution, distance);

  FragColor = mix(tMapped, blurred, 1.25);
}
`;

const sourceDitherHelper = `

float random(vec2 co) {
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a, b));
    float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}


vec3 dither(vec3 color) {
    // Calculate grid position
    float grid_position = random(gl_FragCoord.xy);
    // Shift the individual colors differently, thus making it even harder to see the dithering pattern
    vec3 dither_shift_RGB = vec3(0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0);
    // Modify shift acording to grid position
    dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);
    // Shift the color by dither_shift
    return color + dither_shift_RGB;
}
`;

const homeBloomCompositeFragment = `
precision mediump float;

${sourceDitherHelper}

uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform sampler2D tBlur4;
uniform sampler2D tBlur5;
uniform float uBloomFactors[NUM_MIPS];
in vec2 vUv;
out vec4 FragColor;
void main() {
  FragColor = uBloomFactors[0] * texture(tBlur1, vUv) +
    uBloomFactors[1] * texture(tBlur2, vUv) +
    uBloomFactors[2] * texture(tBlur3, vUv) +
    uBloomFactors[3] * texture(tBlur4, vUv) +
    uBloomFactors[4] * texture(tBlur5, vUv);
    #ifdef DITHERING
  FragColor.rgb = dither(FragColor.rgb);
    #endif
}
`;

const homeFxaaFragment = `
precision mediump float;

uniform sampler2D tMap;
uniform vec2 uResolution;

in vec2 v_rgbNW;
in vec2 v_rgbNE;
in vec2 v_rgbSW;
in vec2 v_rgbSE;
in vec2 v_rgbM;
in vec2 vUv;
out vec4 FragColor;

#ifndef FXAA_REDUCE_MIN
  #define FXAA_REDUCE_MIN (1.0 / 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
  #define FXAA_REDUCE_MUL (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
  #define FXAA_SPAN_MAX 8.0
#endif

vec4 fxaa(
  sampler2D tex,
  vec2 fragCoord,
  vec2 resolution,
  vec2 rgbNWUv,
  vec2 rgbNEUv,
  vec2 rgbSWUv,
  vec2 rgbSEUv,
  vec2 rgbMUv
) {
  vec4 color;
  mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
  vec3 rgbNW = texture(tex, rgbNWUv).xyz;
  vec3 rgbNE = texture(tex, rgbNEUv).xyz;
  vec3 rgbSW = texture(tex, rgbSWUv).xyz;
  vec3 rgbSE = texture(tex, rgbSEUv).xyz;
  vec4 texColor = texture(tex, rgbMUv);
  vec3 rgbM = texColor.xyz;
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM = dot(rgbM, luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
  mediump vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));
  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX), dir * rcpDirMin)) * inverseVP;
  vec3 rgbA = 0.5 * (
    texture(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
    texture(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz
  );
  vec3 rgbB = rgbA * 0.5 + 0.25 * (
    texture(tex, fragCoord * inverseVP + dir * -0.5).xyz +
    texture(tex, fragCoord * inverseVP + dir * 0.5).xyz
  );
  float lumaB = dot(rgbB, luma);
  if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
    color = vec4(rgbA, texColor.a);
  } else {
    color = vec4(rgbB, texColor.a);
  }
  return color;
}

void main() {
  FragColor = fxaa(tMap, vUv * uResolution, uResolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
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

// float lineSegment(vec2 p, vec2 a, vec2 b, float thickness, float aspectRatio) {
//   vec2 pa = p - a, ba = b - a;
//   float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
//   float circle = length(pa - ba * h);
//   return smoothstep(thickness, thickness * 0.5, circle);
// }

// vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction){
//   vec4 color = vec4(0.0);
//   vec2 off1 = vec2(.013846153846) * direction;
//   vec2 off2 = vec2(.032307692308) * direction;
//   color += texture2D(image, uv) * 0.2270270270;
//   color += texture2D(image, uv + vec2(off1 * resolution)) * 0.3162162162;
//   color += texture2D(image, uv - vec2(off1 * resolution)) * 0.3162162162;
//   color += texture2D(image, uv + vec2(off2 * resolution)) * 0.0702702703;
//   color += texture2D(image, uv - vec2(off2 * resolution)) * 0.0702702703;
//   return color;
// }

void main() {
  vec4 noise1 = texture2D(uNoiseTexture, vUv * 4.0 + vec2(uTime * 0.1, 0.0));
  vec4 noise2 = texture2D(uNoiseTexture, vUv * 8.0 + vec2(0.0, uTime * 0.1) + noise1.rg * 0.5);
  vec4 noise3 = texture2D(uNoiseTexture, vUv * 16.0 + vec2(-uTime * 0.05, 0.0) + noise2.rg * 0.5);
  vec4 noise = (noise1 + noise2 * 0.5 + noise3 * 0.25) / 1.75;

  float dirX = (-0.5 + noise.g) * noise.r * 10.0;
  float dirY = (-0.5 + noise.b) * noise.r * 10.0;
  vec4 oldTexture = texture2D(uTexture, vUv);
  float br = 1.0 - + (oldTexture.r + oldTexture.g + oldTexture.b) / 3.0;
  vec4 col = oldTexture * (1.0 - uDiffusion);
  float p2 = uDiffusion / 4.0;
  // vec2 stretchUv = vUv * vec2(1.0, 1.0);
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(dirX, dirY) ) * p2;
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(dirY, dirX) ) * p2;
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(-dirX, -dirY) ) * p2;
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(-dirY, -dirX) ) * p2;
  col.rgb *= uPersistance;

  if (uSpeed > 0.0) {
    float lineValue = 0.0;
    float th = clamp(uThickness + uSpeed * 0.3, 0.0001, 0.2);
    vec2 newUv = vUv;
    float ratio = uCoords.x / uCoords.y;
    newUv.y /= ratio;
    vec2 posOld = uPosOld;
    posOld.y /= ratio;
    // lineValue = lineSegment(newUv, uPosOld, uPosNew, th, ratio);
    lineValue = circle(newUv, posOld, th);
    col.rgb = mix(col.rgb, uColor, lineValue * 0.05);
    col.rgb = clamp(col.rgb, vec3(0.0), vec3(1.0));
  }

  gl_FragColor = vec4(col);
}
`;

const thumbVertex = `
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const floorVertex = `
in vec3 position;
in vec3 normal;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform mat3 uMapTransform;
uniform mat4 uMatrix;
out vec2 vUv;
out vec4 vCoord;
out vec3 vNormal;
out vec3 vToEye;
void main() {
  vUv = (uMapTransform * vec3(uv, 1.0)).xy;
  vCoord = uMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vToEye = cameraPosition - worldPosition.xyz;
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}

`;

const thumbFragment = `
precision highp float;


vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 containerSize) {
  vec2 s = containerSize;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  vec2 uv = ouv * s / new + newOffset;
  vec4 color = texture(tex, uv);

  return color;
}


uniform sampler2D tMap;
uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform float uProgress;${SOURCE_TRAILING_SPACE}
uniform float uTransitionCount;${SOURCE_TRAILING_SPACE}
uniform float uTransitionSmoothness;
in vec2 vUv;
out vec4 FragColor;

vec4 transition (vec4 color1, vec4 color2, float progress, vec2 uv) {
  float pr = smoothstep(-uTransitionSmoothness, 0.0, uv.y - progress * (1.0 + uTransitionSmoothness));
  float s = step(pr, fract(uTransitionCount * uv.y));
  return mix(color1, color2, s);
}

void main() {
  vec2 uv = vUv;
  vec4 map = coverTexture(tMap, uMapSize, uv, uResolution);
  vec4 color = vec4(uv.x, uv.y, 0.0, 0.0);
  vec4 mixed = transition(map, color, 1. - uProgress, uv);
  FragColor = mixed;
}
`;

const thumbCompositeVertex = `
in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const sourceTlFullscreenVertex = `
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const sourceMatrixFullscreenVertex = sourceTlFullscreenVertex;

const thumbCompositeFragment = `
precision highp float;

${sourceBlendMultiplyHelper}
${sourceSaturationHelper}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uDarkenIntensity;
uniform vec3 uDarkenColor;
uniform float uSaturation;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uv = vUv ;
  vec4 mixed = texture(tScene, uv);

  mixed.rgb = blendMultiply(mixed.rgb, uDarkenColor, uDarkenIntensity);
  mixed.rgb = saturation(mixed.rgb, uSaturation);
  FragColor = vec4(mixed.rgb, 1.);

  #include <tonemapping_fragment>
}
`;

const mediaCompositeFragment = `
precision highp float;

#include <tonemapping_pars_fragment>

${sourceCompositeColorHelper}
${sourceBlendHelper}

float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tMouseSim;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 mixed = texture(tScene, vUv);
  FragColor = mixed;

  #include <tonemapping_fragment>
}
`;

const characterCompositeFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec3 uBackgroundColor;
uniform float uReveal;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 map = texture2D(tMap, uv);
  float mask = smoothstep(0.04, 0.35, map.r + map.g + map.b);
  vec3 color = mix(uBackgroundColor, map.rgb, mask);
  gl_FragColor = vec4(color * uReveal, 1.0);
}
`;

const backgroundVertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const mouseSimulationVertex = `
precision highp float;

uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
}
`;

const sourceFullscreenVertex = `
in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const sourceLensflareFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uLightPosition;
uniform vec2 uScale;
uniform float uExposure;
uniform float uClamp;
uniform vec2 uResolution;

in vec2 vUv;
out vec4 FragColor;

vec3 lensflare(vec2 uv, vec2 pos) {
  vec2 uvd = uv * length(uv);

  float f21 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.8 * pos), 2.0)), 0.0) * 0.25;
  float f22 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.85 * pos), 2.0)), 0.0) * 0.23;
  float f23 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.9 * pos), 2.0)), 0.0) * 0.21;

  vec2 uvx = mix(uv, uvd, -0.5);
  float f41 = max(0.01 - pow(length(uvx + 0.4 * pos), 2.4), 0.0) * 6.0;
  float f42 = max(0.01 - pow(length(uvx + 0.45 * pos), 2.4), 0.0) * 5.0;
  float f43 = max(0.01 - pow(length(uvx + 0.5 * pos), 2.4), 0.0) * 3.0;

  uvx = mix(uv, uvd, -0.4);
  float f51 = max(0.01 - pow(length(uvx + 0.2 * pos), 5.5), 0.0) * 2.0;
  float f52 = max(0.01 - pow(length(uvx + 0.4 * pos), 5.5), 0.0) * 2.0;
  float f53 = max(0.01 - pow(length(uvx + 0.6 * pos), 5.5), 0.0) * 2.0;

  uvx = mix(uv, uvd, -0.5);
  float f61 = max(0.01 - pow(length(uvx - 0.3 * pos), 1.6), 0.0) * 6.0;
  float f62 = max(0.01 - pow(length(uvx - 0.325 * pos), 1.6), 0.0) * 3.0;
  float f63 = max(0.01 - pow(length(uvx - 0.35 * pos), 1.6), 0.0) * 5.0;

  return vec3(f21 + f41 + f51 + f61, f22 + f42 + f52 + f62, f23 + f43 + f53 + f63);
}

void main() {
  vec2 uv = vUv - 0.5;
  vec2 pos = uLightPosition - 0.5;

  uv.x *= uResolution.x / uResolution.y;
  pos.x *= uResolution.x / uResolution.y;

  uv *= uScale;
  pos *= uScale;

  vec3 color = lensflare(uv, pos) * texture(tMap, uLightPosition).rgb * 2.0;
  color = pow(color, vec3(0.5));
  color *= uExposure;
  color = clamp(color, 0.0, uClamp);

  FragColor = vec4(color, 1.0);
}
`;

const sourceFxaaVertex = `
precision mediump float;

in vec3 position;
in vec2 uv;
uniform vec2 uResolution;

out vec2 v_rgbNW;
out vec2 v_rgbNE;
out vec2 v_rgbSW;
out vec2 v_rgbSE;
out vec2 v_rgbM;
out vec2 vUv;

void main() {
  vUv = uv;
  vec2 fragCoord = uv * uResolution;
  vec2 inverseVP = 1.0 / uResolution.xy;
  v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
  v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
  v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
  v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
  v_rgbM = vec2(fragCoord * inverseVP);
  gl_Position = vec4(position, 1.0);
}
`;

const fluidBoundedVertex = `precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 px;uniform vec2 bounds;out vec2 vUv;void main(){vec3 pos=position;vec2 scale=1.0-bounds*2.0;pos.xy=pos.xy*scale;vUv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;

const fluidBoundsVertex = `precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 px;out vec2 vUv;void main(){vec3 pos=position;vUv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;

const fluidForceVertex = `precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;out vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;

const fluidAdvectionFragment = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform float dt;uniform vec2 fboSize;in vec2 vUv;out vec4 FragColor;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;vec2 spot_new=vUv;vec2 vel_old=texture(velocity,vUv).xy;vec2 spot_old=spot_new-vel_old*dt*ratio;vec2 vel_new1=texture(velocity,spot_old).xy;vec2 spot_new2=spot_old+vel_new1*dt*ratio;vec2 error=spot_new2-spot_new;vec2 spot_new3=spot_new-error/2.0;vec2 vel_2=texture(velocity,spot_new3).xy;vec2 spot_old2=spot_new3-vel_2*dt*ratio;vec2 newVel2=texture(velocity,spot_old2).xy;FragColor=vec4(newVel2,0.0,0.0);}`;

const fluidForceFragment = `precision mediump float;
#define GLSLIFY 1
uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;FragColor=vec4(force*d,0,1);}`;

const fluidDivergenceFragment = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform float dt;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float x0=texture(velocity,vUv-vec2(px.x,0)).x;float x1=texture(velocity,vUv+vec2(px.x,0)).x;float y0=texture(velocity,vUv-vec2(0,px.y)).y;float y1=texture(velocity,vUv+vec2(0,px.y)).y;float divergence=(x1-x0+y1-y0)/2.0;FragColor=vec4(divergence/dt);}`;

const fluidPoissonFragment = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float p0=texture(pressure,vUv+vec2(px.x*2.0,0)).r;float p1=texture(pressure,vUv-vec2(px.x*2.0,0)).r;float p2=texture(pressure,vUv+vec2(0,px.y*2.0)).r;float p3=texture(pressure,vUv-vec2(0,px.y*2.0)).r;float div=texture(divergence,vUv).r;float newP=(p0+p1+p2+p3)/4.0-div;FragColor=vec4(newP);}`;

const fluidPressureFragment = `precision mediump float;
#define GLSLIFY 1
uniform sampler2D pressure;uniform sampler2D velocity;uniform float dt;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float step=1.0;float p0=texture(pressure,vUv+vec2(px.x*step,0)).r;float p1=texture(pressure,vUv-vec2(px.x*step,0)).r;float p2=texture(pressure,vUv+vec2(0,px.y*step)).r;float p3=texture(pressure,vUv-vec2(0,px.y*step)).r;vec2 v=texture(velocity,vUv).xy;vec2 gradP=vec2(p0-p1,p2-p3)*0.5;v=v-dt*gradP;FragColor=vec4(v,0.0,1.0);}`;

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

const skyCompositeFragment = `
precision highp float;

${sourceContrastHelper}
${sourceSimplexNoiseHelper}
${sourceNoiseShaderHelper}
${sourceSkyBlendHelper}
${sourceOilHelper}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uTime;
uniform float uShader1Speed;
uniform float uShader1Alpha;
uniform float uShader1Scale;
uniform float uShader2Speed;
uniform float uShader2Scale;
uniform float uShader1Mix3;
uniform float uShader3Scale;
uniform float uShaderMix;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uv = vUv;

  vec2 pos = vUv.xy * 4.;
  pos.x *= 1.5;

  vec4 noise = noiseShader(pos, uTime, uShader1Speed * .1);
  vec4 diffuseColor = texture(tScene, vUv);

  diffuseColor.rgb = blendReflect(diffuseColor.rgb, noise.rgb, .5);
  diffuseColor.rgb = contrast(diffuseColor.rgb, 2.);
  diffuseColor.rgb = diffuseColor.rgb * 2.;

  FragColor = vec4(.9 - diffuseColor.rgb, 1.);

  #include <tonemapping_fragment>
}
`;

const displacementFragment = `
precision highp float;


float vignette(vec2 coords, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, vec2(0.5, 0.5));
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}


#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uTime;
uniform float uRatio;${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}

float vignout = .5; // vignetting outer border
float vignin = 0.01; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uvOff = vUv;
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  uvOff.x -= 0.5;
  uvOff.x *= uRatio;
  uvOff.x += 0.5;

  vec2 uvVignette = uvOff;${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
${SOURCE_TRAILING_SPACE}${SOURCE_TRAILING_SPACE}
  uvOff.xy -= 0.5;
  uvOff *= 5.;
  uvOff.xy += 0.5;

  float strength = 1. - abs(sin(distance(uvOff, vec2(0.5)) - 0.5 - uTime)) ;

  float vignetteF = vignette(uvVignette.xy, vignin, vignout, vignfade, .4);

  FragColor = vec4(vec3(strength), 1.);
  FragColor.rgb *= 1. - vignetteF;

  #include <tonemapping_fragment>
}
`;

const floorFragment = `
precision mediump float;

${sourceDitherHelper}

uniform sampler2D tReflect;
uniform vec3 uColor;
uniform float uReflectivity;
uniform float uMirror;
uniform float uFloorMixStrength;
uniform float uNormalDistortionStrength;

#ifdef USE_MAP
uniform sampler2D tMap;
#endif

#ifdef USE_NORMALMAP
uniform sampler2D tNormalMap;
uniform vec2 uNormalScale;
#endif

#ifdef USE_FOG
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
#endif

in vec2 vUv;
in vec4 vCoord;
in vec3 vNormal;
in vec3 vToEye;

out vec4 FragColor;

void main() {
    #ifdef USE_MAP
  vec4 color = texture(tMap, vUv);
    #else
  vec4 color = vec4(uColor, 1.0);
    #endif

    #ifdef USE_NORMALMAP
  vec4 normalColor = texture(tNormalMap, vUv * uNormalScale);
  vec3 normal = normalize(vec3(normalColor.r * uNormalDistortionStrength - (uNormalDistortionStrength / 2.), normalColor.b, normalColor.g * uNormalDistortionStrength - (uNormalDistortionStrength / 2.)));
  vec3 coord = vCoord.xyz / vCoord.w;
  vec2 uv = coord.xy + coord.z * normal.xz * 0.05;
  vec4 reflectColor = texture(tReflect, uv);
    #else
  vec3 normal = vNormal;
  vec4 reflectColor = textureProj(tReflect, vCoord);
    #endif

    // Fresnel term
  vec3 toEye = normalize(vToEye);
  float theta = max(dot(toEye, normal), .0);
  float reflectance = max(0.01, min(uReflectivity + (1.0 - uReflectivity) * pow((1.0 - theta), 5.0), 1.));

  reflectColor = mix(vec4(0), reflectColor, reflectance);

  FragColor.rgb = color.rgb * ((1.0 - min(1.0, uMirror)) + reflectColor.rgb * uFloorMixStrength);

    #ifdef USE_FOG
  float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);

  FragColor.rgb = mix(FragColor.rgb, uFogColor, fogFactor);
    #endif

    #ifdef DITHERING
  FragColor.rgb = dither(FragColor.rgb);
    #endif



  FragColor.a = 1.0;
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

function sourceLinearToSrgbColor(value?: string, fallback = DEFAULT_COLOR) {
  return colorFrom(value, fallback).convertLinearToSRGB();
}

function sourceRgbColor(value?: string, fallback = DEFAULT_COLOR) {
  const normalized = normalizeColor(value) ?? normalizeColor(fallback) ?? DEFAULT_COLOR;
  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    const expanded = hex.length === 3
      ? hex.split("").map((char) => `${char}${char}`).join("")
      : hex.slice(0, 6);
    if (/^[0-9a-f]{6}$/i.test(expanded)) {
      return new Color(
        Number.parseInt(expanded.slice(0, 2), 16) / 255,
        Number.parseInt(expanded.slice(2, 4), 16) / 255,
        Number.parseInt(expanded.slice(4, 6), 16) / 255,
      );
    }
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(normalized);
  if (rgb) {
    const channels = rgb[1].split(",").slice(0, 3).map((part) => Number.parseFloat(part.trim()));
    if (channels.length === 3 && channels.every((channel) => Number.isFinite(channel))) {
      return new Color(channels[0] / 255, channels[1] / 255, channels[2] / 255);
    }
  }
  return colorFrom(value, fallback);
}

function numeric(value: string | number | undefined, fallback: number) {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function makePlaceholderTexture(color = [20, 20, 20, 255]) {
  const texture = new DataTexture(new Uint8Array(color), 1, 1, RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

function makeSimulationTarget() {
  const target = new WebGLRenderTarget(1, 1, {
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: FloatType,
    stencilBuffer: false,
    depthBuffer: false,
  });
  target.texture.generateMipmaps = false;
  return target;
}

function makeSourceRenderTarget(depthBuffer = false) {
  return new WebGLRenderTarget(1, 1, { depthBuffer, stencilBuffer: false });
}

function makeFluidRenderTarget() {
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false, type: FloatType });
  target.texture.generateMipmaps = false;
  target.texture.wrapS = ClampToEdgeWrapping;
  target.texture.wrapT = ClampToEdgeWrapping;
  target.texture.minFilter = LinearFilter;
  target.texture.magFilter = LinearFilter;
  return target;
}

function makeFullscreenTriangle(material: Material) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
}

function makeSourcePassScreen() {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  const mesh = new Mesh(geometry);
  mesh.frustumCulled = false;
  return mesh as Mesh<BufferGeometry, Material>;
}

function makeSourceFullscreenTriangle(material: Material) {
  const mesh = makeFullscreenTriangle(material);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  return mesh;
}

function sourceMaterialProbe(material: ShaderMaterial, materialMode: string) {
  return {
    materialMode,
    glslVersion: material.glslVersion ?? null,
    blending: material.blending,
    depthWrite: material.depthWrite,
    depthTest: material.depthTest,
    transparent: material.transparent,
    uniformKeys: Object.keys(material.uniforms ?? {}),
  };
}

function renderTargetStats(renderer: WebGLRenderer, target: WebGLRenderTarget, sampleSize = 64): RenderTargetStats {
  const width = Math.max(1, target.width);
  const height = Math.max(1, target.height);
  const sampleWidth = Math.min(sampleSize, width);
  const sampleHeight = Math.min(sampleSize, height);
  const x = Math.max(0, Math.floor((width - sampleWidth) / 2));
  const y = Math.max(0, Math.floor((height - sampleHeight) / 2));
  const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
  renderer.readRenderTargetPixels(target, x, y, sampleWidth, sampleHeight, pixels);
  const sums = [0, 0, 0, 0];
  const mins = [255, 255, 255, 255];
  const maxes = [0, 0, 0, 0];
  for (let index = 0; index < pixels.length; index += 4) {
    for (let channel = 0; channel < 4; channel += 1) {
      const value = pixels[index + channel];
      sums[channel] += value;
      mins[channel] = Math.min(mins[channel], value);
      maxes[channel] = Math.max(maxes[channel], value);
    }
  }
  const count = sampleWidth * sampleHeight;
  const mean = sums.map((value) => value / count / 255) as [number, number, number, number];
  const min = mins.map((value) => value / 255) as [number, number, number, number];
  const max = maxes.map((value) => value / 255) as [number, number, number, number];
  return {
    width,
    height,
    sampleWidth,
    sampleHeight,
    mean,
    min,
    max,
    luma: mean[0] * 0.2126 + mean[1] * 0.7152 + mean[2] * 0.0722,
  };
}

function renderTargetGridStats(renderer: WebGLRenderer, target: WebGLRenderTarget, grid = 9) {
  const width = Math.max(1, target.width);
  const height = Math.max(1, target.height);
  const pixels = new Uint8Array(4);
  const sums = [0, 0, 0, 0];
  const mins = [255, 255, 255, 255];
  const maxes = [0, 0, 0, 0];
  let count = 0;
  for (let yIndex = 0; yIndex < grid; yIndex += 1) {
    for (let xIndex = 0; xIndex < grid; xIndex += 1) {
      const x = Math.min(width - 1, Math.max(0, Math.round(((xIndex + 0.5) / grid) * width)));
      const y = Math.min(height - 1, Math.max(0, Math.round(((yIndex + 0.5) / grid) * height)));
      renderer.readRenderTargetPixels(target, x, y, 1, 1, pixels);
      for (let channel = 0; channel < 4; channel += 1) {
        const value = pixels[channel];
        sums[channel] += value;
        mins[channel] = Math.min(mins[channel], value);
        maxes[channel] = Math.max(maxes[channel], value);
      }
      count += 1;
    }
  }
  const mean = sums.map((value) => value / count / 255) as [number, number, number, number];
  return {
    grid,
    mean,
    min: mins.map((value) => value / 255) as [number, number, number, number],
    max: maxes.map((value) => value / 255) as [number, number, number, number],
    luma: mean[0] * 0.2126 + mean[1] * 0.7152 + mean[2] * 0.0722,
  };
}

function renderTargetBandStats(renderer: WebGLRenderer, target: WebGLRenderTarget): RenderTargetBandStats {
  const width = Math.max(1, target.width);
  const height = Math.max(1, target.height);
  const positions = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
  const pixels = new Uint8Array(4);
  const bands = positions.map((position) => {
    const y = Math.min(height - 1, Math.max(0, Math.round((1 - position) * (height - 1))));
    let lumaSum = 0;
    const sampleCount = 17;
    for (let index = 0; index < sampleCount; index += 1) {
      const x = Math.min(width - 1, Math.max(0, Math.round(((index + 0.5) / sampleCount) * (width - 1))));
      renderer.readRenderTargetPixels(target, x, y, 1, 1, pixels);
      const r = pixels[0] / 255;
      const g = pixels[1] / 255;
      const b = pixels[2] / 255;
      lumaSum += r * 0.2126 + g * 0.7152 + b * 0.0722;
    }
    return [position, Number((lumaSum / sampleCount).toFixed(4))] as [number, number];
  });
  let maxHorizontalDelta = { position: 0, value: 0 };
  for (let index = 1; index < bands.length; index += 1) {
    const value = Math.abs(bands[index][1] - bands[index - 1][1]);
    if (value > maxHorizontalDelta.value) {
      maxHorizontalDelta = {
        position: Number(((bands[index][0] + bands[index - 1][0]) / 2).toFixed(3)),
        value: Number(value.toFixed(4)),
      };
    }
  }
  return { bands, maxHorizontalDelta };
}

function renderTargetPixel(renderer: WebGLRenderer, target: WebGLRenderTarget, uv: Vector2) {
  const width = Math.max(1, target.width);
  const height = Math.max(1, target.height);
  const x = Math.min(width - 1, Math.max(0, Math.round(uv.x * (width - 1))));
  const y = Math.min(height - 1, Math.max(0, Math.round((1 - uv.y) * (height - 1))));
  const pixels = new Uint8Array(4);
  renderer.readRenderTargetPixels(target, x, y, 1, 1, pixels);
  const rgba = [pixels[0] / 255, pixels[1] / 255, pixels[2] / 255, pixels[3] / 255] as [number, number, number, number];
  return {
    x,
    y,
    rgba,
    luma: rgba[0] * 0.2126 + rgba[1] * 0.7152 + rgba[2] * 0.0722,
  };
}

function renderTargetProbe(renderer: WebGLRenderer, target: WebGLRenderTarget, sampleSize = 64) {
  return {
    width: target.width,
    height: target.height,
    depthBuffer: target.depthBuffer,
    stencilBuffer: target.stencilBuffer,
    texture: {
      colorSpace: target.texture.colorSpace,
      type: target.texture.type,
      format: target.texture.format,
      minFilter: target.texture.minFilter,
      magFilter: target.texture.magFilter,
      generateMipmaps: target.texture.generateMipmaps,
    },
    stats: renderTargetStats(renderer, target, sampleSize),
    gridStats: renderTargetGridStats(renderer, target),
    bandStats: renderTargetBandStats(renderer, target),
  };
}

function renderTargetStateProbe(target: WebGLRenderTarget, role: string) {
  return {
    role,
    width: target.width,
    height: target.height,
    depthBuffer: target.depthBuffer,
    stencilBuffer: target.stencilBuffer,
    texture: {
      colorSpace: target.texture.colorSpace,
      type: target.texture.type,
      format: target.texture.format,
      minFilter: target.texture.minFilter,
      magFilter: target.texture.magFilter,
      generateMipmaps: target.texture.generateMipmaps,
      wrapS: target.texture.wrapS,
      wrapT: target.texture.wrapT,
    },
  };
}

function sourceRenderTargetStateBoard(
  targets: Record<string, WebGLRenderTarget>,
  sourceMode: string,
  targetOwnershipMode: string,
) {
  return {
    sourceMode,
    targetOwnershipMode,
    targets: Object.fromEntries(
      Object.entries(targets).map(([key, target]) => [key, renderTargetStateProbe(target, key)]),
    ),
  };
}

function applySourceLoadedTextureState(texture: Texture, colorSpace: typeof SRGBColorSpace | typeof NoColorSpace | "" = "") {
  texture.colorSpace = colorSpace;
}

let sourceWebpSupportPromise: Promise<boolean> | null = null;

function detectSourceWebpSupport() {
  if (!sourceWebpSupportPromise) {
    sourceWebpSupportPromise = new Promise<boolean>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image.width > 0 && image.height > 0);
      image.onerror = () => resolve(false);
      image.src = SOURCE_ASSET_WEBP_PROBE;
    });
  }
  return sourceWebpSupportPromise;
}

function sourceTextureProbe(texture: Texture) {
  return {
    colorSpace: texture.colorSpace,
    type: texture.type,
    format: texture.format,
    wrapS: texture.wrapS,
    wrapT: texture.wrapT,
    minFilter: texture.minFilter,
    magFilter: texture.magFilter,
    generateMipmaps: texture.generateMipmaps,
    anisotropy: texture.anisotropy,
  };
}

function floorPowerOfTwo(value: number) {
  return Math.pow(2, Math.floor(Math.log(Math.max(1, value)) / Math.LN2));
}

function sourceDpr() {
  return Math.min(
    window.devicePixelRatio || 1,
    sourceLowRes() ? SOURCE_LOW_RES_MAX_DPR : SOURCE_MAX_DPR,
  );
}

function sourceWorkDpr() {
  return Math.min(sourceDpr(), SOURCE_WORK_MAX_DPR);
}

function sourceGpuTier() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory < 4) ? 2 : 3;
}

function sourceLowRes() {
  return sourceGpuTier() < 3;
}

function sourceMouseUvOffset() {
  const planeSize = sourceWorkMousePlaneSize();
  const raySize = sourceWorkRayPlaneSize();
  return new Vector2(
    (raySize.x - planeSize.x) / 2 / planeSize.x,
    (raySize.y - planeSize.y) / 2 / planeSize.y,
  );
}

function sourceWorkMousePlaneSize() {
  return new Vector2(GRID_COLS * MOUSE_PLANE_SCALE, GRID_ROWS * MOUSE_PLANE_SCALE);
}

function sourceWorkRayPlaneSize() {
  return sourceWorkMousePlaneSize().multiplyScalar(MOUSE_RAY_SCALE);
}

function sourceYgFov(width: number, aspect: number, distance: number, scale = 1) {
  const safeAspect = Math.max(0.0001, aspect);
  return MathUtils.radToDeg(2 * Math.atan(width / safeAspect / (2 * (distance / scale))));
}

function tweenColorOwned(target: Color, value?: string, duration = 1.6, tweens?: gsap.core.Tween[], fallback?: string) {
  const next = sourceRgbColor(value, fallback ?? `#${target.getHexString()}`);
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
  private mainScene = new Scene();
  private backgroundScene = new Scene();
  private homeScene = new Scene();
  private skyScene = new Scene();
  private thumbScene = new Scene();
  private mediaScene = new Scene();
  private displacementRawScene = new Scene();
  private screenMouseSimulationScene = new Scene();
  private backgroundCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private skyPostScreen = makeSourcePassScreen();
  private displacementPostScreen = makeSourcePassScreen();
  private thumbPostScreen = makeSourcePassScreen();
  private workPostScreen = makeSourcePassScreen();
  private mainPostScreen = makeSourcePassScreen();
  private homeCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private thumbCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private mainCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private mainCameraDistance = 1000;
  private characterCamera = new PerspectiveCamera(30, 1, 0.1, 100);
  private mediaCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private characterAmbientLight = new AmbientLight(colorFrom("white"), 1.2);
  private characterDirectionalLight = new DirectionalLight(colorFrom("white"), 2.5);
  private sceneWrap = new Object3D();
  private blocksWrap = new Object3D();
  private aboutBlocks?: AuxiliaryBlockItem;
  private floatingBlocks?: AuxiliaryBlockItem;
  private thumbWrap = new Object3D();
  private thumbScrollWrap = new Object3D();
  private workItems: WorkItem[] = [];
  private mediaPlanes: MediaPlane[] = [];
  private loader = new TextureLoader();
  private cubeLoader = new CubeTextureLoader();
  private textureCache = new Map<string, Texture>();
  private videoTextureCache = new Map<string, Texture>();
  private sourceProjectThumbs: SourceProjectThumb[] = [];
  private sourceThumbsReadyResolve?: () => void;
  private sourceThumbsReady = new Promise<void>((resolve) => {
    this.sourceThumbsReadyResolve = resolve;
  });
  private sourceThumbsReadyResolved = false;
  private placeholder = makePlaceholderTexture();
  private fluidPlaceholder = makePlaceholderTexture([0, 0, 0, 255]);
  private renderSettings = SOURCE_HOME_RENDER_SETTINGS;
  private sourceMainRenderSettings: SourceRenderSettings = {
    ...SOURCE_MAIN_RENDER_SETTINGS,
    fxaa: { ...SOURCE_MAIN_RENDER_SETTINGS.fxaa },
    mousesim: { ...SOURCE_MAIN_RENDER_SETTINGS.mousesim },
    luminosity: { ...SOURCE_MAIN_RENDER_SETTINGS.luminosity },
    bloom: { ...SOURCE_MAIN_RENDER_SETTINGS.bloom },
    blur: { ...SOURCE_MAIN_RENDER_SETTINGS.blur },
    fluid: { ...SOURCE_MAIN_RENDER_SETTINGS.fluid, enabled: sourceGpuTier() >= 3 },
  };
  private noiseTexture = makePlaceholderTexture([255, 255, 255, 255]);
  private perlinTexture = makePlaceholderTexture([128, 128, 128, 255]);
  private workPerlinTexture = makePlaceholderTexture([128, 128, 128, 255]);
  private skyCompositeMaterial: ShaderMaterial;
  private skyRawTarget = makeSourceRenderTarget(false);
  private skyCompositeTarget = this.skyRawTarget.clone();
  private backgroundMaterial: ShaderMaterial;
  private compositeMaterial: ShaderMaterial;
  private workRawTarget = makeSourceRenderTarget(false);
  private workTargetB = this.workRawTarget.clone();
  private workCompositeTarget = this.workRawTarget.clone();
  private workBloomBrightTarget = this.workRawTarget.clone();
  private workBloomHorizontalTargets: WebGLRenderTarget[] = [];
  private workBloomVerticalTargets: WebGLRenderTarget[] = [];
  private workBlurTargetA = this.workRawTarget.clone();
  private workBlurTargetB = this.workRawTarget.clone();
  private workFxaaTarget = this.workRawTarget.clone();
  private mainRawTarget = makeSourceRenderTarget(false);
  private backgroundTarget = this.mainRawTarget.clone();
  private preCompositeMaterial: ShaderMaterial;
  private compositeTarget = this.mainRawTarget.clone();
  private mainCompositeMaterial: ShaderMaterial;
  private mainLensflareTarget = this.mainRawTarget.clone();
  private mainLensflareMaterial?: ShaderMaterial;
  private mainBloomBrightTarget = this.mainRawTarget.clone();
  private mainBloomHorizontalTargets: WebGLRenderTarget[] = [];
  private mainBloomVerticalTargets: WebGLRenderTarget[] = [];
  private mainBlurTargetA = this.mainRawTarget.clone();
  private mainBlurTargetB = this.mainRawTarget.clone();
  private mainFxaaTarget = this.mainRawTarget.clone();
  private mainLuminosityMaterial: ShaderMaterial;
  private mainBlurHorizontalMaterial: ShaderMaterial;
  private mainBlurVerticalMaterial: ShaderMaterial;
  private mainFxaaMaterial: ShaderMaterial;
  private mainBloomCompositeMaterial: ShaderMaterial;
  private mainBloomBlurMaterials: ShaderMaterial[] = [];
  private mediaRawTarget = makeSourceRenderTarget(false);
  private mediaTarget = makeSourceRenderTarget(false);
  private mediaCompositeMaterial: ShaderMaterial;
  private mediaCompositeScene = new Scene();
  private workLuminosityMaterial: ShaderMaterial;
  private workBlurHorizontalMaterial: ShaderMaterial;
  private workBlurVerticalMaterial: ShaderMaterial;
  private workFxaaMaterial: ShaderMaterial;
  private bloomBlurMaterials: ShaderMaterial[] = [];
  private bloomCompositeMaterial: ShaderMaterial;
  private displacementMaterial: ShaderMaterial;
  private displacementRawTarget = makeSourceRenderTarget(false);
  private displacementTarget = this.displacementRawTarget.clone();
  private floorReflectionTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
  private floorReflectionReadTarget = this.floorReflectionTarget.clone();
  private floorReflectionWriteTarget = this.floorReflectionTarget.clone();
  private floorReflectionCamera = new PerspectiveCamera();
  private floorReflectionMatrix = new Matrix4();
  private floorReflectionTextureMatrixUniform = { value: this.floorReflectionMatrix };
  private floorReflectionRenderTargetUniform = { value: this.floorReflectionReadTarget.texture };
  private floorReflectorPlane = new Plane();
  private floorReflectorNormal = new Vector3(0, 1, 0);
  private floorReflectorWorldPosition = new Vector3();
  private floorReflectionCameraWorldPosition = new Vector3();
  private floorReflectionRotationMatrix = new Matrix4();
  private floorReflectionLookAtPosition = new Vector3(0, 0, -1);
  private floorReflectionView = new Vector3();
  private floorReflectionTargetPosition = new Vector3();
  private floorReflectionClipPlane = new Vector4();
  private floorReflectionQ = new Vector4();
  private floorReflectionClipBias = 0;
  private floorReflectionBlurMaterial: ShaderMaterial;
  private floorReflectionScreenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private floorReflectionScreen: Mesh<BufferGeometry, ShaderMaterial>;
  private screenMouseSimulationMaterial: ShaderMaterial;
  private screenMouseSimulationTargets: WebGLRenderTarget[] = [];
  private screenMouseSimulationIndex = 0;
  private mainFluidPass: MainFluidPass;
  private thumbCompositeMaterial: ShaderMaterial;
  private characterMaterial: ShaderMaterial;
  private characterScene = new Scene();
  private characterModelRoot = new Group();
  private characterFallbackMesh: Mesh<PlaneGeometry, ShaderMaterial>;
  private characterTarget = makeSourceRenderTarget(false);
  private floorMaterial: ShaderMaterial;
  private floorGroup = new Object3D();
  private floorReflector = new Object3D();
  private floorPlane: Mesh<CircleGeometry, ShaderMaterial>;
  private environmentMaterial: EnvironmentMaterial;
  private environmentGroup = new Object3D();
  private environmentPlane: Mesh<IcosahedronGeometry, EnvironmentMaterial>;
  private readonly environmentSpeed = 0.00005;
  private thumbTarget = makeSourceRenderTarget(false);
  private thumbCompositeTarget = this.thumbTarget.clone();
  private raycaster = new Raycaster();
  private raf = 0;
  private pointer = new Vector2();
  private targetPointer = new Vector2();
  private pointerRay = new Vector2();
  private pointerPixels = new Vector2(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2);
  private lastPointerPixels = this.pointerPixels.clone();
  private pointerDeltaPixels = new Vector2();
  private screenMouseSimOldPos = new Vector2(0.5, 0.5);
  private screenMouseSimNewPos = new Vector2(0.5, 0.5);
  private screenMouseSimTargetPos = new Vector2(0.5, 0.5);
  private lastTickTime = performance.now() * 0.001;
  private galleryProgress = 0;
  private thumbProgress = 0;
  private thumbItemWidth = 2;
  private thumbTotalItems = 0;
  private thumbOffsetY = 0;
  private thumbIsTransitioning = false;
  private sceneRotation = 0;
  private zoom = 0;
  private auxiliaryScrollLast = 0;
  private cameraOrigin = new Vector3(0, 0, 5.5);
  private cameraTarget = new Vector3(0, 0, 5.5);
  private cameraLookAt = new Vector3(0, 0, 0);
  private cameraTargetXY = new Vector2(0.25, 0.25);
  private cameraRoll = 0;
  private cameraRotateAngle = MathUtils.degToRad(10);
  private cameraLastLerp = 0.01;
  private cameraControllerGroup = new Object3D();
  private cameraRotateGroup = new Object3D();
  private cameraInnerGroup = new Object3D();
  private activeSlug = "";
  private mouseFactor = 0;
  private mouseFactorTween?: gsap.core.Tween;
  private mainColorTweens: gsap.core.Tween[] = [];
  private ambientTweens: gsap.core.Tween[] = [];
  private mediaBackgroundTweens: gsap.core.Tween[] = [];
  private saturationTween?: gsap.core.Tween;
  private contrastTween?: gsap.core.Tween;
  private blockColorTweens: gsap.core.Tween[] = [];
  private thumbDarknessTweens: gsap.core.Tween[] = [];
  private thumbDarknessColorTweens: gsap.core.Tween[] = [];
  private thumbSaturationTweens: gsap.core.Tween[] = [];
  private thumbMouseLightnessTweens: gsap.core.Tween[] = [];
  private thumbState = {
    darknessIntensity: 0,
    darknessColor: sourceRgbColor("#000000", "#000000"),
    saturation: 1,
    mouseLightness: 1,
  };
  private lightState = {
    directionalLight: { intensity: 0 },
    directionalLight2: { intensity: 0 },
    spotLight: { intensity: 0 },
  };
  private darkenTween?: gsap.core.Tween;
  private revealSpreadTween?: gsap.core.Tween;
  private sceneRevealTween?: gsap.core.Tween;
  private spotLightTween?: gsap.core.Tween;
  private directionalLightTween?: gsap.core.Tween;
  private directionalLight2Tween?: gsap.core.Tween;
  private envRotationTween?: gsap.core.Tween;
  private auxiliaryRevealTweens: gsap.core.Tween[] = [];
  private fluidStrengthTween?: gsap.core.Tween;
  private mediaOpacityTween?: gsap.core.Tween;
  private mediaTranslationTweens: gsap.core.Tween[] = [];
  private maxSpotLightIntensity = 220;
  private spotLightParallax = true;
  private debugDisableHomeSpotlightMap = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug-spotlight-map") === "off";
  private debugSkyTarget = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-sky-target") : null;
  private debugTextureColorSpace = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-texture-colorspace") : null;
  private debugPassOrder = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-pass-order") : null;
  private debugThumbColorSpace = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-thumb-colorspace") : null;
  private debugThumbProbe = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug-thumb-probe");
  private debugThumbProgress = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug-thumb-progress")
    ? numeric(new URLSearchParams(window.location.search).get("debug-thumb-progress"), 0)
    : null;
  private debugOutputProbe = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug-output-probe");
  private debugCompositeStage =
    typeof window !== "undefined" ? MathUtils.clamp(Math.round(numeric(new URLSearchParams(window.location.search).get("debug-composite-stage"), 0)), 0, 5) : 0;
  private debugCompositeDarkenMode =
    typeof window !== "undefined" ? MathUtils.clamp(Math.round(numeric(new URLSearchParams(window.location.search).get("debug-composite-darken"), 0)), 0, 3) : 0;
  private debugCompositeTransferMode =
    typeof window !== "undefined" ? MathUtils.clamp(Math.round(numeric(new URLSearchParams(window.location.search).get("debug-composite-transfer"), 0)), 0, 2) : 0;
  private debugCompositeLightenMode =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug-composite-lighten") === "off" ? 1 : 0;
  private debugCompositeShader =
    this.debugCompositeStage !== 0
    || this.debugCompositeDarkenMode !== 0
    || this.debugCompositeTransferMode !== 0
    || this.debugCompositeLightenMode !== 0;
  private debugRendererOutput = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-renderer-output") : null;
  private debugMainFluid = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-main-fluid") : null;
  private debugFloor = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-floor") : null;
  private debugFloorReflection = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-floor-reflection") : null;
  private debugEnvironment = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-environment") : null;
  private thumbProbeLastUpdate = 0;
  private outputProbeLastUpdate = 0;
  private sourceUpdateOrder = "nD.scenes sky -> media -> work -> main -> workthumb -> wavves -> character; Iu.renderManager -> IT.cameraController -> components";
  private sourcePostRenderFrame = 0;
  private fluidStrength = 0.5;
  private darken = SOURCE_INITIAL_DARKEN;
  private saturation = SOURCE_INITIAL_SATURATION;
  private contrast = SOURCE_INITIAL_CONTRAST;
  private envRotation = 0;
  private sceneReveal = 0;
  private revealSpread = 0;
  private projectRevealTweens: gsap.core.Tween[] = [];
  private projectRevealProjectTweens: gsap.core.Tween[] = [];
  private currentAmbientIntensity = SOURCE_INITIAL_AMBIENT;
  private mediaBackground = colorFrom(DEFAULT_BG);
  private mediaBackgroundState = colorFrom(DEFAULT_BG);
  private mediaSceneOpacity = 0;
  private gridLayers = SOURCE_GRID_LAYERS;
  private radius = 8;
  private ambientLight = new AmbientLight(colorFrom(SOURCE_INITIAL_SECONDARY), SOURCE_INITIAL_AMBIENT);
  private spotLight = new SpotLight(colorFrom("white"), 220);
  private directionalLight = new DirectionalLight(colorFrom("white"), 1.5);
  private directionalLight2 = new DirectionalLight(colorFrom("white"), 1);
  private sourceTexturePreloadPromise: Promise<void> = Promise.resolve();
  private sourceTexturePreloadState = {
    blueNoise: false,
    floorNormal: false,
    perlin1: false,
    perlin2: false,
  };
  private sourceWebpSupport: boolean | null = null;
  private sourceAssetExt: "webp" | "jpg" | null = null;
  private sourceCubemapLoadState: {
    mode: string;
    ext: "webp" | "jpg" | null;
    loaded: boolean;
    failed: boolean;
    urls: string[];
  } = {
    mode: "pending-source-p1-addEnvironment",
    ext: null,
    loaded: false,
    failed: false,
    urls: [],
  };
  private canvasAnimateInPromise?: Promise<void>;
  private canvasAnimateInStarted = false;
  private canvasFadeCompleted = false;

  private loadedTextureColorSpace() {
    return this.debugTextureColorSpace === "srgb" ? SRGBColorSpace : "";
  }

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: false,
    });
    this.renderer.setClearColor(colorFrom(SOURCE_WORK_BG), 0);
    this.renderer.setPixelRatio(sourceDpr());
    this.renderer.outputColorSpace = this.debugRendererOutput === "linear" ? LinearSRGBColorSpace : SRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.domElement.className = "gl-canvas";
    this.root.appendChild(this.renderer.domElement);
    document.body.classList.add("has-webgl");

    this.homeCamera.position.set(0, 0, 5.5);
    this.cameraControllerGroup.position.copy(this.homeCamera.position);
    this.cameraControllerGroup.matrixAutoUpdate = false;
    this.cameraRotateGroup.matrixAutoUpdate = false;
    this.cameraInnerGroup.matrixAutoUpdate = false;
    this.cameraRotateGroup.rotation.y = Math.PI;
    this.cameraRotateGroup.add(this.cameraInnerGroup);
    this.cameraControllerGroup.add(this.cameraRotateGroup);
    this.cameraOrigin.copy(this.cameraControllerGroup.position);
    this.thumbCamera.position.set(0, 0, 0);
    this.mainCamera.position.set(0, 0, this.mainCameraDistance);
    this.characterCamera.position.set(0, 0, 12);
    this.characterCamera.lookAt(0, 0, 0);
    this.mediaCamera.position.set(0, 0, 1000);
    this.mainScene.background = sourceLinearToSrgbColor(SOURCE_MAIN_SCENE_BACKGROUND, SOURCE_MAIN_SCENE_BACKGROUND);
    this.skyScene.background = sourceLinearToSrgbColor("#666666", "#666666");
    this.displacementRawScene.background = sourceLinearToSrgbColor("red", "red");
    this.homeScene.fog = new Fog("grey", 0, 100);
    this.homeScene.background = sourceLinearToSrgbColor(SOURCE_WORK_BG, SOURCE_WORK_BG);
    this.spotLight.position.set(0, 0, 3.7);
    this.spotLight.target.position.set(0, 0, -8);
    this.spotLight.angle = Math.PI / 4;
    this.spotLight.penumbra = 0.95;
    this.spotLight.map = this.homeSpotlightMap();
    this.directionalLight.position.set(10.5, 10, 1);
    this.directionalLight2.position.set(-10.5, 5, -1);
    this.homeScene.add(this.ambientLight);
    this.homeScene.add(this.spotLight);
    this.homeScene.add(this.spotLight.target);
    this.homeScene.add(this.directionalLight);
    this.skyCompositeMaterial = this.createSkyCompositeMaterial();
    this.backgroundMaterial = this.createBackgroundMaterial();
    this.backgroundScene.add(makeFullscreenTriangle(this.backgroundMaterial));
    this.preCompositeMaterial = this.createPreCompositeMaterial();
    this.mainCompositeMaterial = this.createMainCompositeMaterial();
    if (SOURCE_MAIN_LENSFLARE_SETTINGS.enabled) {
      this.mainLensflareMaterial = this.createLensflareMaterial();
    }
    this.compositeMaterial = this.createCompositeMaterial();
    this.workBloomHorizontalTargets = Array.from({ length: 5 }, () => this.workRawTarget.clone());
    this.workBloomVerticalTargets = Array.from({ length: 5 }, () => this.workRawTarget.clone());
    this.mainBloomHorizontalTargets = Array.from({ length: 5 }, () => this.mainRawTarget.clone());
    this.mainBloomVerticalTargets = Array.from({ length: 5 }, () => this.mainRawTarget.clone());
    this.workRawTarget.depthBuffer = true;
    this.workBlurHorizontalMaterial = this.createBlurMaterial(1, 0);
    this.workBlurHorizontalMaterial.uniforms.uDirection.value.set(1, 0);
    this.workBlurVerticalMaterial = this.createBlurMaterial(0, 1);
    this.workBlurVerticalMaterial.uniforms.uDirection.value.set(0, 1);
    this.workFxaaMaterial = this.createFxaaMaterial();
    this.workLuminosityMaterial = this.createLuminosityMaterial(this.renderSettings);
    this.bloomBlurMaterials = this.createBloomBlurMaterials();
    this.bloomCompositeMaterial = this.createBloomCompositeMaterial(this.workBloomVerticalTargets);
    this.mainBlurHorizontalMaterial = this.createBlurMaterial(1, 0);
    this.mainBlurHorizontalMaterial.uniforms.uDirection.value.set(1, 0);
    this.mainBlurVerticalMaterial = this.createBlurMaterial(0, 1);
    this.mainBlurVerticalMaterial.uniforms.uDirection.value.set(0, 1);
    this.mainFxaaMaterial = this.createFxaaMaterial();
    this.mainLuminosityMaterial = this.createLuminosityMaterial(this.sourceMainRenderSettings);
    this.mainBloomBlurMaterials = this.createBloomBlurMaterials();
    this.mainBloomCompositeMaterial = this.createBloomCompositeMaterial(this.mainBloomVerticalTargets, this.sourceMainRenderSettings);
    this.mediaCompositeMaterial = this.createMediaCompositeMaterial();
    this.mediaCompositeScene.add(makeFullscreenTriangle(this.mediaCompositeMaterial));
    this.gridLayers = sourceLowRes() ? SOURCE_LOW_RES_GRID_LAYERS : SOURCE_GRID_LAYERS;
    this.displacementMaterial = this.createDisplacementMaterial();
    this.floorReflectionTarget.depthBuffer = true;
    this.floorReflectionBlurMaterial = this.createFloorReflectionBlurMaterial();
    this.floorReflectionScreen = makeFullscreenTriangle(this.floorReflectionBlurMaterial);
    this.screenMouseSimulationMaterial = this.createMouseSimulationMaterial(window.innerWidth / Math.max(1, window.innerHeight));
    this.screenMouseSimulationTargets = Array.from({ length: 2 }, makeSimulationTarget);
    this.screenMouseSimulationScene.add(makeFullscreenTriangle(this.screenMouseSimulationMaterial));
    this.mainFluidPass = this.createMainFluidPass();
    this.thumbCompositeMaterial = this.createThumbCompositeMaterial();
    this.characterMaterial = this.createCharacterMaterial();
    this.characterFallbackMesh = new Mesh(new PlaneGeometry(2, 2), this.characterMaterial);
    this.characterDirectionalLight.position.set(2, 3, 5);
    this.characterScene.add(this.characterFallbackMesh);
    this.characterScene.add(this.characterModelRoot);
    this.characterScene.add(this.characterAmbientLight);
    this.characterScene.add(this.characterDirectionalLight);
    if (this.debugThumbColorSpace === "both-srgb") {
      this.thumbTarget.texture.colorSpace = SRGBColorSpace;
      this.thumbCompositeTarget.texture.colorSpace = SRGBColorSpace;
    } else if (this.debugThumbColorSpace === "composite-srgb") {
      this.thumbCompositeTarget.texture.colorSpace = SRGBColorSpace;
    }
    this.skyCompositeTarget.texture.wrapS = RepeatWrapping;
    this.skyCompositeTarget.texture.wrapT = RepeatWrapping;
    this.floorMaterial = this.createFloorMaterial();
    this.floorPlane = new Mesh(new CircleGeometry(60, 32), this.floorMaterial);
    this.floorPlane.rotation.x = -Math.PI / 2;
    this.floorPlane.add(this.floorReflector);
    this.floorPlane.onBeforeRender = () => {
      if (!this.sceneWrap.visible) return;
      if (this.debugFloorReflection === "off") return;
      this.floorGroup.visible = false;
      this.renderFloorReflection();
      this.floorGroup.visible = true;
    };
    this.floorGroup.position.y = -1.65;
    this.floorGroup.add(this.floorPlane);
    this.environmentMaterial = this.createEnvironmentMaterial();
    this.environmentPlane = new Mesh(new IcosahedronGeometry(300, 10), this.environmentMaterial);
    this.environmentGroup.position.y = -12.65;
    this.environmentGroup.add(this.environmentPlane);
    this.homeScene.add(this.sceneWrap);
    this.sceneWrap.add(this.blocksWrap);
    this.sceneWrap.add(this.floorGroup);
    this.sceneWrap.add(this.environmentGroup);
    this.thumbScene.background = sourceLinearToSrgbColor("#222222");
    this.thumbWrap.frustumCulled = false;
    this.thumbWrap.add(this.thumbScrollWrap);
    this.thumbScene.add(this.thumbWrap);

    this.createWorkScene();
    this.createAuxiliaryBlocks();
    this.createMediaPlanes();
    this.loadCompositeTextures();

    this.resize();
    this.bindSourceMainCompositeInputs();
    this.bind();
    this.tick();
  }

  setProject(payload: ProjectPayload) {
    this.applyProjectLook(payload);
    this.prepareHomeLighting(payload);

    if (payload.slug) this.setActiveSlug(payload.slug);
  }

  prepareHomeVisualState(payload: ProjectPayload) {
    this.applyProjectLook(payload);
    this.setCameraControllerSettings();
    this.spotLightParallax = true;
    this.spotLight.map = this.homeSpotlightMap();
    this.keepWorkSceneHidden();
  }

  private applyProjectLook(payload: ProjectPayload) {
    const ambientIntensity = numeric(payload.ambient, 0.5);
    const ambientColor = ambientIntensity < 0 && payload.invert ? payload.invert : payload.secondary;
    const sceneDarkness = payload.overviewDarkness ?? payload.darkness;
    const isProjectView = document.body.classList.contains("is-project");
    this.activeSlug = payload.slug ?? this.activeSlug;
    this.setMainColor(payload.color);
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setDarken(numeric(sceneDarkness, isProjectView ? SOURCE_PROJECT_DETAIL_DARKEN : SOURCE_HOME_OVERVIEW_DARKEN_FALLBACK));
    this.setSaturation(numeric(payload.saturation, isProjectView ? SOURCE_PROJECT_SATURATION_FALLBACK : SOURCE_HOME_OVERVIEW_SATURATION_FALLBACK));
    this.setContrast(numeric(payload.contrast, SOURCE_PROJECT_CONTRAST_FALLBACK));
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    const thumbDarkness = isProjectView ? payload.thumbDarkness ?? payload.darkness : payload.thumbDarkness;
    this.setThumbDarknessIntensity(numeric(thumbDarkness, isProjectView ? SOURCE_INITIAL_THUMB_DARKNESS : SOURCE_HOME_THUMB_DARKNESS_FALLBACK));
    this.setThumbDarknessColor(payload.darknessColor ?? SOURCE_INITIAL_THUMB_DARKNESS_COLOR);
    this.setThumbSaturation(numeric(payload.thumbSaturation, SOURCE_INITIAL_THUMB_SATURATION));
    this.setThumbMouseLightness(numeric(payload.mouseLightness, SOURCE_INITIAL_THUMB_MOUSE_LIGHTNESS));
    this.setBlocksColor(payload.blocks ?? DEFAULT_BG);
  }

  private prepareHomeLighting(payload: ProjectPayload) {
    this.setSpotLightIntensity(numeric(payload.spotlight, this.maxSpotLightIntensity), 1);
    this.setDirectionalLightIntensity(1.5);
    this.setDirectionalLight2Intensity(1);
    this.setEnvRotation(0, 0);
    this.setFluidStrength(document.body.classList.contains("is-project") ? 1 : 0.5, document.body.classList.contains("is-project") ? 0.5 : 1);
    this.setRevealSpread(0);
    this.resetThumbOffsetY();
    this.setCameraControllerSettings();
    this.initHomeSpotlight();
  }

  beginProjectTransition(payload: ProjectPayload) {
    const ambientIntensity = numeric(payload.ambient, 0.5);
    const ambientColor = ambientIntensity < 0 && payload.invert ? payload.invert : payload.secondary;
    this.activeSlug = payload.slug ?? this.activeSlug;
    this.setMainColor(payload.color);
    this.setDarken(numeric(payload.darkness, SOURCE_PROJECT_DETAIL_DARKEN), 0.5);
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setSaturation(numeric(payload.saturation, SOURCE_PROJECT_SATURATION_FALLBACK));
    this.setContrast(numeric(payload.contrast, SOURCE_PROJECT_CONTRAST_FALLBACK));
    this.setFluidStrength(1, 0.5);
    this.setSpotLightIntensity(0, 0.5, "none");
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
    this.sceneWrap.rotation.y = targetRotation;
    this.updateThumbGallery(-progress);
    this.sceneRotation += (MathUtils.clamp(velocity * -0.015, -4, 4) - this.sceneRotation) * lerpFactor;
    this.zoom += (MathUtils.clamp(Math.abs(velocity * 0.0015), 0, 1) - this.zoom) * lerpFactor;
    this.homeScene.rotation.z = MathUtils.degToRad(this.sceneRotation);
    this.homeScene.position.z = this.homeScene.rotation.z - this.zoom;
  }

  enterWorkGallery(activeSlug = this.activeSlug) {
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealProjectTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.projectRevealProjectTweens = [];
    this.setThumbTransitioning(false);
    this.resetThumbOffsetY();
    this.setMouseFactor(0, 0);
    this.setCameraControllerSettings({ x: 0, y: 0, z: 0 }, { x: 1, y: 0.5 }, 20);
    this.setMouseFactor(1, 3);
    this.setRevealSpread(0);
    this.setSpotLightIntensity(this.maxSpotLightIntensity, 1.6);
    this.setFluidStrength(0.5, 0.5);
    this.workItems.forEach((item) => {
      item.material.uniforms.uReveal.value = 0;
      this.projectRevealProjectTweens.push(gsap.to(item.material.uniforms.uRevealProject, { value: 1, duration: 0.5, ease: "none" }));
    });
    const active = this.workItems.find((item) => item.slug === activeSlug) ?? this.workItems[0];
    if (active) this.setProjectBlockReveal(active);
  }

  restoreGalleryState(progress: number, sceneRotation = 0) {
    this.galleryProgress = progress;
    this.sceneRotation = sceneRotation;
    this.zoom = 0;
    this.setThumbTransitioning(false);
    this.resetThumbOffsetY();
    this.preCompositeMaterial.uniforms.uTransformX.value = progress;
    this.sceneWrap.rotation.y = MathUtils.degToRad(progress * 360 + 180);
    this.homeScene.rotation.z = MathUtils.degToRad(sceneRotation);
    this.homeScene.position.z = this.homeScene.rotation.z;
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

  initHomeSpotlight() {
    this.spotLightParallax = true;
    this.spotLight.map = this.homeSpotlightMap();
    this.spotLight.position.set(0, 0, 3.7);
    this.spotLight.target.position.set(0, 0, -8);
    this.setSpotLightIntensity(this.maxSpotLightIntensity, 0);
  }

  setPreviewMode(enabled: boolean) {
    this.setMouseFactor(enabled ? 0.25 : 1, 3);
  }

  animateWorkMouseIn() {
    this.setMouseFactor(0, 0);
    this.setMouseFactor(1, 3);
  }

  async animateIn() {
    if (this.canvasAnimateInPromise) return this.canvasAnimateInPromise;
    this.canvasAnimateInStarted = true;
    this.canvasAnimateInPromise = this.sourceTexturePreloadPromise.then(() => {
      gsap.fromTo(this.renderer.domElement, { opacity: 0 }, {
        opacity: 1,
        duration: 0.5,
        ease: "none",
        onComplete: () => {
          this.canvasFadeCompleted = true;
        },
      });
    });
    return this.canvasAnimateInPromise;
  }

  showScene() {
    this.sceneRevealTween?.kill();
    this.sceneRevealTween = gsap.to(this, {
      sceneReveal: 1,
      duration: 1.6,
      ease: "expo.out",
      onUpdate: () => {
        this.preCompositeMaterial.uniforms.uReveal.value = this.sceneReveal;
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

  enterProjectVisualState(payload: ProjectPayload) {
    const ambientIntensity = numeric(payload.ambient, 0.5);
    const ambientColor = ambientIntensity < 0 && payload.invert ? payload.invert : payload.secondary;
    this.activeSlug = payload.slug ?? this.activeSlug;
    this.refreshMedia();
    this.keepWorkSceneHidden();
    this.setMainColor(payload.color);
    this.setMediaOpacity(0, 0, "none", 0);
    this.setDarken(numeric(payload.darkness, SOURCE_PROJECT_DETAIL_DARKEN));
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setSaturation(numeric(payload.saturation, SOURCE_PROJECT_SATURATION_FALLBACK));
    this.setContrast(numeric(payload.contrast, SOURCE_PROJECT_CONTRAST_FALLBACK));
    this.setFluidStrength(1);
  }

  enterAboutVisualState(visual?: HTMLElement | null, floating?: HTMLElement | null) {
    this.auxiliaryRevealTweens.forEach((tween) => tween.kill());
    this.auxiliaryRevealTweens = [];
    this.setMainColor(DEFAULT_COLOR, 0);
    this.setDarken(SOURCE_INITIAL_DARKEN, 0.5);
    this.setSaturation(SOURCE_INITIAL_SATURATION);
    this.setContrast(SOURCE_INITIAL_CONTRAST);
    this.setMediaBackground(DEFAULT_COLOR);
    this.setAmbientLight("#000000", 1);
    this.setDirectionalLightIntensity(5);
    this.spotLightParallax = false;
    this.spotLight.map = this.characterTarget.texture;
    this.setSpotLightIntensity(0, 0);
    if (this.aboutBlocks) {
      this.aboutBlocks.track = visual ?? null;
      this.aboutBlocks.group.visible = true;
      this.aboutBlocks.material.uniforms.uReveal.value = 0;
      this.aboutBlocks.material.uniforms.uRevealSpread.value = 1;
      this.aboutBlocks.material.uniforms.uScrollOpacity.value = 1;
    }
    if (this.floatingBlocks) {
      this.floatingBlocks.track = floating ?? null;
      this.floatingBlocks.group.visible = true;
      this.floatingBlocks.translationZ = 0;
      this.floatingBlocks.material.uniforms.uReveal.value = 0;
      this.floatingBlocks.material.uniforms.uRevealSpread.value = 0;
    }
    this.auxiliaryScrollLast = window.scrollY;
    this.resize();
    this.updateAboutSpotlight();
  }

  animateAboutVisualIn() {
    this.auxiliaryRevealTweens.forEach((tween) => tween.kill());
    this.auxiliaryRevealTweens = [];
    if (this.aboutBlocks) {
      this.auxiliaryRevealTweens.push(gsap.to(this.aboutBlocks.material.uniforms.uReveal, {
        value: 1,
        delay: 0.3,
        duration: 1.6,
        ease: "expo.out",
        onStart: () => this.setSpotLightIntensity(270),
      }));
      this.auxiliaryRevealTweens.push(gsap.to(this.aboutBlocks.material.uniforms.uRevealSpread, { value: 0, duration: 1.6, ease: "expo.out" }));
    }
    if (this.floatingBlocks) {
      this.auxiliaryRevealTweens.push(gsap.to(this.floatingBlocks.material.uniforms.uReveal, { value: 1, duration: 1.6, ease: "expo.out" }));
      this.auxiliaryRevealTweens.push(gsap.to(this.floatingBlocks.material.uniforms.uRevealSpread, { value: 1, duration: 1.6, ease: "none" }));
    }
  }

  animateAboutVisualOut() {
    this.auxiliaryRevealTweens.forEach((tween) => tween.kill());
    this.auxiliaryRevealTweens = [];
    if (this.aboutBlocks) {
      this.auxiliaryRevealTweens.push(gsap.to(this.aboutBlocks.material.uniforms.uReveal, {
        value: 0,
        duration: 1,
        ease: "expo.out",
        onComplete: () => {
          if (this.aboutBlocks) {
            this.aboutBlocks.group.visible = false;
            this.aboutBlocks.track = null;
          }
        },
      }));
      this.auxiliaryRevealTweens.push(gsap.to(this.aboutBlocks.material.uniforms.uRevealSpread, { value: 1, duration: 1, ease: "none" }));
    }
    if (this.floatingBlocks) {
      this.auxiliaryRevealTweens.push(gsap.to(this.floatingBlocks.material.uniforms.uReveal, {
        value: 0,
        duration: 1,
        ease: "expo.out",
        onComplete: () => {
          if (this.floatingBlocks) {
            this.floatingBlocks.group.visible = false;
            this.floatingBlocks.track = null;
          }
        },
      }));
      this.auxiliaryRevealTweens.push(gsap.to(this.floatingBlocks.material.uniforms.uRevealSpread, { value: 0, duration: 1, ease: "none" }));
    }
    this.setSpotLightIntensity(0);
    this.spotLightParallax = true;
    this.spotLight.map = this.homeSpotlightMap();
  }

  destroyAboutVisualState() {
    this.auxiliaryRevealTweens.forEach((tween) => tween.kill());
    this.auxiliaryRevealTweens = [];
    if (this.aboutBlocks) {
      this.aboutBlocks.group.visible = false;
      this.aboutBlocks.track = null;
    }
    if (this.floatingBlocks) {
      this.floatingBlocks.group.visible = false;
      this.floatingBlocks.track = null;
      this.floatingBlocks.translationZ = 0;
    }
    this.auxiliaryScrollLast = window.scrollY;
    this.setSpotLightIntensity(0, 0);
    this.spotLightParallax = true;
    this.spotLight.map = this.homeSpotlightMap();
  }

  leaveAboutVisualState() {
    this.animateAboutVisualOut();
  }

  setProjectScrollState(payload: ProjectPayload) {
    const ambientIntensity = numeric(payload.ambient, 0.5);
    const ambientColor = ambientIntensity < 0 && payload.invert ? payload.invert : payload.secondary;
    this.activeSlug = payload.slug ?? this.activeSlug;
    this.setMainColor(payload.color);
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setSaturation(numeric(payload.saturation, SOURCE_PROJECT_SATURATION_FALLBACK));
    this.setContrast(numeric(payload.contrast, SOURCE_PROJECT_CONTRAST_FALLBACK));
    this.keepWorkSceneHidden();
  }

  projectLeave() {
    this.mediaTranslationTweens.forEach((tween) => tween.kill());
    this.mediaTranslationTweens = [];
    this.setMediaOpacity(0, 0.5, "none", 0);
    this.setFluidStrength(0.5, 0.5);
  }

  private keepWorkSceneHidden() {
    this.projectRevealTweens.forEach((tween) => tween.kill());
    this.projectRevealProjectTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.projectRevealProjectTweens = [];
    this.setRevealSpread(1, 0, "none");
    this.setSpotLightIntensity(0, 0, "none");
    this.workItems.forEach((item) => {
      item.material.uniforms.uRevealProject.value = 0;
    });
  }

  refreshMedia() {
    const stalePlanes = this.mediaPlanes.filter((plane) => !plane.track.isConnected);
    stalePlanes.forEach((plane) => this.destroyMediaPlane(plane));
    this.mediaPlanes = this.mediaPlanes.filter((plane) => plane.track.isConnected);
    this.createMediaPlanes();
    this.resize();
  }

  private destroyMediaPlane(plane: MediaPlane) {
    plane.observer?.disconnect();
    plane.video?.pause();
    plane.texture?.dispose();
    plane.mesh.geometry.dispose();
    plane.material.dispose();
    this.mediaScene.remove(plane.mesh);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("scroll", this.onScroll);
    this.textureCache.forEach((texture) => texture.dispose());
    this.noiseTexture.dispose();
    this.fluidPlaceholder.dispose();
    this.perlinTexture.dispose();
    this.workPerlinTexture.dispose();
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
      item.mousePlane.geometry.dispose();
      item.mousePlane.material.dispose();
      item.rayPlane.geometry.dispose();
      item.rayPlane.material.dispose();
      item.mouseTargets.forEach((target) => target.dispose());
      item.mouseMaterial.dispose();
    });
    [this.aboutBlocks, this.floatingBlocks].forEach((item) => {
      item?.mesh.geometry.dispose();
      item?.material.dispose();
      item?.rayPlane?.geometry.dispose();
      item?.rayPlane?.material.dispose();
    });
    this.backgroundMaterial.dispose();
    this.workRawTarget.dispose();
    this.workTargetB.dispose();
    this.workCompositeTarget.dispose();
    this.workBloomBrightTarget.dispose();
    this.workBloomHorizontalTargets.forEach((target) => target.dispose());
    this.workBloomVerticalTargets.forEach((target) => target.dispose());
    this.workBlurTargetA.dispose();
    this.workBlurTargetB.dispose();
    this.workFxaaTarget.dispose();
    this.mainRawTarget.dispose();
    this.backgroundTarget.dispose();
    this.preCompositeMaterial.dispose();
    this.compositeTarget.dispose();
    this.mainCompositeMaterial.dispose();
    this.mainLensflareMaterial?.dispose();
    this.mainLensflareTarget.dispose();
    this.mediaRawTarget.dispose();
    this.mediaTarget.dispose();
    this.mediaCompositeMaterial.dispose();
    this.compositeMaterial.dispose();
    this.mainBloomBrightTarget.dispose();
    this.mainBloomHorizontalTargets.forEach((target) => target.dispose());
    this.mainBloomVerticalTargets.forEach((target) => target.dispose());
    this.mainBlurTargetA.dispose();
    this.mainBlurTargetB.dispose();
    this.mainFxaaTarget.dispose();
    this.workLuminosityMaterial.dispose();
    this.workBlurHorizontalMaterial.dispose();
    this.workBlurVerticalMaterial.dispose();
    this.workFxaaMaterial.dispose();
    this.bloomBlurMaterials.forEach((material) => material.dispose());
    this.bloomCompositeMaterial.dispose();
    this.mainLuminosityMaterial.dispose();
    this.mainBlurHorizontalMaterial.dispose();
    this.mainBlurVerticalMaterial.dispose();
    this.mainFxaaMaterial.dispose();
    this.mainBloomBlurMaterials.forEach((material) => material.dispose());
    this.mainBloomCompositeMaterial.dispose();
    this.displacementRawTarget.dispose();
    this.displacementTarget.dispose();
    this.floorReflectionTarget.dispose();
    this.floorReflectionReadTarget.dispose();
    this.floorReflectionWriteTarget.dispose();
    this.floorReflectionBlurMaterial.dispose();
    this.floorReflectionScreen.geometry.dispose();
    this.displacementMaterial.dispose();
    this.screenMouseSimulationTargets.forEach((target) => target.dispose());
    this.screenMouseSimulationMaterial.dispose();
    this.disposeMainFluidPass();
    this.thumbCompositeTarget.dispose();
    this.thumbCompositeMaterial.dispose();
    this.disposeCharacterModel();
    this.characterTarget.dispose();
    this.characterMaterial.dispose();
    this.floorPlane.geometry.dispose();
    this.floorMaterial.dispose();
    this.environmentPlane.geometry.dispose();
    this.environmentMaterial.dispose();
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

    this.preloadSourceThumbs(cards);

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
      const slug = card.dataset.slug ?? String(index);
      const thumb = this.createThumbPlane(slug);
      const mousePlane = this.createWorkMousePlane();
      const rayPlane = this.createWorkRayPlane();
      const mouseSimulation = this.createWorkMouseSimulation();
      const group = new Object3D();
      const rotationWrap = new Object3D();
      rotationWrap.scale.setScalar(GRID_SCALE);
      rotationWrap.add(mesh);
      rotationWrap.add(rayPlane);
      group.add(rotationWrap);
      if (payload.slug === "demorgen") rotationAdjustment = -theta * index;
      group.position.x = -Math.sin(MathUtils.degToRad(theta * index)) * this.radius;
      group.position.z = Math.cos(MathUtils.degToRad(theta * index)) * this.radius;
      group.lookAt(0, 0, 0);
      this.blocksWrap.add(group);
      this.thumbScrollWrap.add(thumb);
      this.workItems.push({
        slug,
        payload,
        group,
        rotationWrap,
        material,
        mesh,
        thumb,
        thumbXHook: 0,
        thumbYHook: 0,
        mousePlane,
        rayPlane,
        mouseMaterial: mouseSimulation.material,
        mouseScene: mouseSimulation.scene,
        mouseTargets: mouseSimulation.targets,
        mouseIndex: 0,
        mouseRenderClearMode: "source-sA-no-explicit-clear",
        mouseTarget: new Vector2(0.5, 0.5),
        mouseOld: new Vector2(0.5, 0.5),
        mouseNew: new Vector2(0.5, 0.5),
        mouseSpeed: 0,
        reveal: card.classList.contains("is-active") ? 1 : 0,
      });
    });
    this.thumbTotalItems = this.workItems.length;
    this.calcThumbItemWidth();
    this.environmentGroup.rotation.y = -MathUtils.degToRad(rotationAdjustment);
  }

  private createWorkBlockMaterial(payload: ProjectPayload, reveal: number) {
    const uniforms = {
      uGridSize: { value: new Vector3(GRID_COLS, GRID_ROWS, this.gridLayers) },
      uGridOffset: { value: new Vector3(0, 0, 0) },
      uReveal: { value: reveal },
      uRevealProject: { value: 1 },
      uRevealSides: { value: 0 },
      uRevealSpread: { value: 0 },
      uRevealSpreadSides: { value: 0 },
      uMouseSpeed: { value: 0 },
      uMouseLightness: { value: numeric(payload.mouseLightness, 1) },
      uMouseFactor: { value: this.mouseFactor },
      uAuxiliaryMaterial: { value: 0 },
      uScrollOpacity: { value: 1 },
      uUvOffset: { value: sourceMouseUvOffset() },
      uUvOffsetScale: { value: MOUSE_RAY_SCALE },
      tMouseSim: { value: this.placeholder },
      tMouseSim2: { value: this.screenMouseSimulationTexture },
      tDisplacement: { value: this.displacementTarget.texture },
      tPerlin: { value: this.workPerlinTexture },
      uCoords: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
    };
    const material = new MeshStandardMaterial({
      color: colorFrom(SOURCE_WORK_DIFFUSE, SOURCE_WORK_DIFFUSE),
      emissive: sourceRgbColor(payload.blocks ?? DEFAULT_BG, DEFAULT_BG),
      emissiveIntensity: SOURCE_WORK_EMISSIVE_INTENSITY,
      roughness: SOURCE_WORK_ROUGHNESS,
      metalness: SOURCE_WORK_METALNESS,
      dithering: true,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    }) as WorkBlockMaterial;
    material.envMapIntensity = SOURCE_WORK_ENVMAP_INTENSITY;
    material.uniforms = uniforms;
    material.onBeforeCompile = (shader) => {
      patchWorkBlockShader(shader, uniforms, "work");
    };
    material.customProgramCacheKey = () => "source-va-work-block-chunks";
    return material;
  }

  private createBlockMesh(material: WorkBlockMaterial) {
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
    geometry.setAttribute("instanceOffset", new InstancedBufferAttribute(gridOffsets, 3));
    geometry.setAttribute("instanceIndex", new InstancedBufferAttribute(instanceIndexes, 1));
    geometry.setAttribute("instanceAlpha", new InstancedBufferAttribute(alphas, 1));
    geometry.setAttribute("instanceColor", new InstancedBufferAttribute(colors, 3));
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  private createAuxiliaryBlockMaterial(kind: "about" | "floating") {
    const uniforms = {
      uGridSize: { value: kind === "about" ? new Vector3(23, 23, this.gridLayers) : new Vector3(30, 30, 1) },
      uGridOffset: { value: new Vector3(0, 0, 0) },
      uReveal: { value: 0 },
      uRevealProject: { value: 1 },
      uRevealSides: { value: 1 },
      uRevealSpread: { value: kind === "about" ? 1 : 10 },
      uRevealSpreadSides: { value: 1 },
      uMouseSpeed: { value: 0 },
      uMouseLightness: { value: 1 },
      uMouseFactor: { value: 1 },
      uAuxiliaryMaterial: { value: 1 },
      uUvOffset: { value: new Vector2(0, 0) },
      uUvOffsetScale: { value: 1.5 },
      uScrollOpacity: { value: 1 },
      tMouseSim: { value: this.placeholder },
      tMouseSim2: { value: this.screenMouseSimulationTexture },
      tDisplacement: { value: this.displacementTarget.texture },
      tPerlin: { value: this.workPerlinTexture },
      uCoords: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
    };
    const material = new MeshStandardMaterial({
      color: colorFrom("#808080", "#808080"),
      emissive: sourceRgbColor("#000000", "#000000"),
      emissiveIntensity: SOURCE_WORK_EMISSIVE_INTENSITY,
      roughness: SOURCE_WORK_ROUGHNESS,
      metalness: SOURCE_WORK_METALNESS,
      dithering: true,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    }) as WorkBlockMaterial;
    material.envMapIntensity = SOURCE_WORK_ENVMAP_INTENSITY;
    material.renderOrder = 10;
    material.uniforms = uniforms;
    material.onBeforeCompile = (shader) => {
      patchWorkBlockShader(shader, uniforms, "auxiliary");
    };
    material.customProgramCacheKey = () => `source-${kind}-aux-block-chunks`;
    return material;
  }

  private createAuxiliaryBlocks() {
    this.aboutBlocks = this.createAboutBlocks();
    this.floatingBlocks = this.createFloatingBlocks();
    this.aboutBlocks.group.visible = false;
    this.floatingBlocks.group.visible = false;
    this.floatingBlocks.group.scale.set(3.5, 3.5, 3.5);
    this.floatingBlocks.group.position.y = 4.65;
    this.homeScene.add(this.aboutBlocks.group);
    this.homeScene.add(this.floatingBlocks.group);
  }

  private createAboutBlocks(): AuxiliaryBlockItem {
    const xNum = 23;
    const yNum = 23;
    const zNum = sourceLowRes() ? 4 : 4;
    const material = this.createAuxiliaryBlockMaterial("about");
    material.uniforms.uGridSize.value.set(xNum, yNum, zNum);
    const geometry = new RoundedBoxGeometry(GRID_CUBE_SIZE, GRID_CUBE_SIZE, GRID_CUBE_SIZE, 1, 0.05);
    const maxCount = xNum * yNum * zNum;
    const mesh = new InstancedMesh(geometry, material, maxCount);
    const rotationWrap = new Object3D();
    const scaleWrap = new Object3D();
    const group = new Object3D();
    const rayPlane = new Mesh(new PlaneGeometry(xNum, yNum), new MeshBasicMaterial({ visible: false }));
    const colors = new Float32Array(maxCount * 3);
    const alphas = new Float32Array(maxCount);
    const offsets = new Float32Array(maxCount * 3);
    const indexes = new Float32Array(maxCount);
    const dummy = new Object3D();
    const cell = GRID_CUBE_SIZE + GRID_SPACING;
    const radius = Math.min(xNum, yNum) * cell / 2;
    const width = (xNum - 1) * cell;
    const height = (yNum - 1) * cell;
    const depth = (zNum - 1) * cell;
    let index = 0;
    for (let z = 0; z < zNum; z++) {
      for (let x = 0; x < xNum; x++) {
        for (let y = 0; y < yNum; y++) {
          const px = x * cell - width / 2;
          const py = y * cell - height / 2;
          if (px * px + py * py > radius * radius) continue;
          dummy.position.set(px, py, z * cell - depth / 2);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          offsets[index * 3] = x / xNum;
          offsets[index * 3 + 1] = y / yNum;
          offsets[index * 3 + 2] = z / zNum;
          indexes[index] = index;
          colors[index * 3] = Math.random();
          colors[index * 3 + 1] = Math.random();
          colors[index * 3 + 2] = Math.random();
          alphas[index] = Math.random();
          index++;
        }
      }
    }
    mesh.count = index;
    geometry.setAttribute("instanceOffset", new InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute("instanceIndex", new InstancedBufferAttribute(indexes, 1));
    geometry.setAttribute("instanceAlpha", new InstancedBufferAttribute(alphas, 1));
    geometry.setAttribute("instanceColor", new InstancedBufferAttribute(colors, 3));
    mesh.instanceMatrix.needsUpdate = true;
    rotationWrap.add(mesh);
    rotationWrap.add(rayPlane);
    rotationWrap.scale.setScalar(AUX_BLOCK_SCALE);
    scaleWrap.add(rotationWrap);
    scaleWrap.scale.setScalar(0.35);
    group.add(scaleWrap);
    return {
      kind: "about",
      group,
      scaleWrap,
      rotationWrap,
      material,
      mesh,
      rayPlane,
      gridSize: new Vector3(xNum, yNum, zNum),
      colors,
      translation: new Vector2(),
      translationZ: 0,
      offset: new Vector2(),
      trackScaleF: ABOUT_TRACK_SCALE,
      mouseTarget: new Vector2(0.5, 0.5),
      mouseOld: new Vector2(0.5, 0.5),
      mouseNew: new Vector2(0.5, 0.5),
      mouseSpeed: 0,
    };
  }

  private createFloatingBlocks(): AuxiliaryBlockItem {
    const xNum = 30;
    const yNum = 30;
    const zNum = 1;
    const material = this.createAuxiliaryBlockMaterial("floating");
    material.uniforms.uGridSize.value.set(xNum, yNum, zNum);
    const geometry = new BoxGeometry(0.5, 0.5, 0.5);
    const count = xNum * yNum * zNum;
    const mesh = new InstancedMesh(geometry, material, count);
    const group = new Object3D();
    const rotationWrap = new Object3D();
    const scaleWrap = new Object3D();
    const colors = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const offsets = new Float32Array(count * 3);
    const indexes = new Float32Array(count);
    const dummy = new Object3D();
    const cell = 0.5 + 0.3;
    const width = (xNum - 1) * cell;
    const height = (yNum - 1) * cell;
    let index = 0;
    for (let z = 0; z < zNum; z++) {
      for (let x = 0; x < xNum; x++) {
        for (let y = 0; y < yNum; y++) {
          dummy.position.set(x * cell - width / 2, y * cell - height / 2, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          offsets[index * 3] = x / xNum;
          offsets[index * 3 + 1] = y / yNum;
          offsets[index * 3 + 2] = z / zNum;
          indexes[index] = index;
          colors[index * 3] = Math.random();
          colors[index * 3 + 1] = Math.random();
          colors[index * 3 + 2] = Math.random();
          alphas[index] = Math.random();
          index++;
        }
      }
    }
    geometry.setAttribute("instanceOffset", new InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute("instanceIndex", new InstancedBufferAttribute(indexes, 1));
    geometry.setAttribute("instanceAlpha", new InstancedBufferAttribute(alphas, 1));
    geometry.setAttribute("instanceColor", new InstancedBufferAttribute(colors, 3));
    mesh.instanceMatrix.needsUpdate = true;
    scaleWrap.add(mesh);
    scaleWrap.scale.setScalar(0.3);
    group.add(scaleWrap);
    return {
      kind: "floating",
      group,
      scaleWrap,
      rotationWrap,
      material,
      mesh,
      gridSize: new Vector3(xNum, yNum, zNum),
      colors,
      translation: new Vector2(),
      translationZ: 0,
      offset: new Vector2(),
      trackScaleF: ABOUT_TRACK_SCALE,
      mouseTarget: new Vector2(0.5, 0.5),
      mouseOld: new Vector2(0.5, 0.5),
      mouseNew: new Vector2(0.5, 0.5),
      mouseSpeed: 0,
    };
  }

  private createThumbPlane(id: string) {
    dumpShader("M1-thumb-plane", thumbVertex, thumbFragment);
    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
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
    mesh.userData.sourceThumbId = id;
    mesh.userData.sourceThumbMode = "source-E1-setImage-awaits-Xt-thumbsReady-getProjectThumbById";
    mesh.userData.sourceThumbBound = false;
    this.setSourceThumbImage(id, mesh);
    mesh.scale.set(2, 2, 2);
    return mesh;
  }

  private preloadSourceThumbs(cards: HTMLElement[]) {
    void this.preloadSourceThumbsFromCards(cards);
  }

  private async preloadSourceThumbsFromCards(cards: HTMLElement[]) {
    const sourceWebpSupport = await detectSourceWebpSupport();
    this.sourceWebpSupport = sourceWebpSupport;
    const sourceExt: "webp" | "jpg" = sourceWebpSupport ? "webp" : "jpg";
    this.sourceAssetExt = sourceExt;
    this.sourceProjectThumbs = cards.map((card, index) => {
      const payload = this.payloadFromElement(card);
      const id = card.dataset.slug ?? String(index);
      const url = this.sourceThumbUrl(payload.thumb, sourceExt);
      const loader = url?.endsWith(".mp4") ? "loadVideo" : url ? "loadImage" : null;
      const src = url
        ? loader === "loadVideo"
          ? this.loadVideoTextureAsync(url)
          : this.loadTextureAsync(url)
        : Promise.resolve(this.placeholder);
      return {
        id,
        src,
        url,
        loader,
        bindingMode: "source-Xt-projectThumbs-src-promise" as const,
      };
    });
    this.sourceThumbsReadyResolved = true;
    this.sourceThumbsReadyResolve?.();
  }

  private sourceThumbUrl(src: string | undefined, sourceExt: "webp" | "jpg") {
    if (!src) return null;
    if (src.endsWith(".mp4")) return src;
    if (/\.(webp|jpe?g)$/i.test(src)) return src.replace(/\.(webp|jpe?g)$/i, `.${sourceExt}`);
    return `${src}.${sourceExt}`;
  }

  private getSourceProjectThumbById(id: string) {
    return this.sourceProjectThumbs.find((thumb) => thumb.id === id);
  }

  private setSourceThumbImage(id: string, mesh: Mesh<PlaneGeometry, RawShaderMaterial>) {
    const material = mesh.material;
    material.userData.sourceThumbId = id;
    material.userData.sourceThumbImageMode = "source-E1-setImage-awaits-Xt-thumbsReady-getProjectThumbById";
    material.userData.sourceThumbBound = false;
    void this.sourceThumbsReady.then(async () => {
      const projectThumb = this.getSourceProjectThumbById(id);
      mesh.userData.sourceThumbReady = this.sourceThumbsReadyResolved;
      mesh.userData.sourceThumbUrl = projectThumb?.url ?? null;
      mesh.userData.sourceThumbLoader = projectThumb?.loader ?? null;
      mesh.userData.sourceThumbBindingMode = projectThumb?.bindingMode ?? null;
      material.userData.sourceThumbReady = this.sourceThumbsReadyResolved;
      material.userData.sourceThumbUrl = projectThumb?.url ?? null;
      material.userData.sourceThumbLoader = projectThumb?.loader ?? null;
      material.userData.sourceThumbBindingMode = projectThumb?.bindingMode ?? null;
      if (!projectThumb) return;
      const texture = await projectThumb.src;
      material.uniforms.tMap.value = texture;
      material.uniforms.uMapSize.value.set(1, 1);
      material.uniforms.uResolution.value.set(1, 1);
      material.userData.sourceThumbBound = true;
      mesh.userData.sourceThumbBound = true;
    });
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
        uAmbientColor: { value: colorFrom(SOURCE_INITIAL_SECONDARY) },
        uAmbientIntensity: { value: SOURCE_INITIAL_AMBIENT },
      },
      vertexShader: backgroundVertex,
      fragmentShader: backgroundFragment,
    });
  }

  private createCompositeMaterial() {
    const settings = this.renderSettings;
    dumpShader("OA-work-composite", sourceMatrixFullscreenVertex, homeCompositeFragment);
    const fragmentShader = this.debugCompositeShader ? homeCompositeDebugFragment : homeCompositeFragment;
    const uniforms: Record<string, { value: any }> = {
      tScene: { value: null },
      tBloom: { value: null },
      tBlur: { value: null },
      tFluid: { value: null },
      tMouseSim: { value: null },
      boolBloom: { value: settings.bloom.enabled },
      boolFluid: { value: settings.fluid.enabled },
      boolLuminosity: { value: settings.luminosity.enabled },
      boolFxaa: { value: settings.fxaa.enabled },
      uDarken: { value: this.darken },
      uSaturation: { value: this.saturation },
    };
    if (this.debugCompositeShader) {
      uniforms.uDebugStage = { value: this.debugCompositeStage };
      uniforms.uDebugDarkenMode = { value: this.debugCompositeDarkenMode };
      uniforms.uDebugTransferMode = { value: this.debugCompositeTransferMode };
      uniforms.uDebugLightenMode = { value: this.debugCompositeLightenMode };
      return new RawShaderMaterial({
        glslVersion: GLSL3,
        toneMapped: false,
        transparent: true,
        blending: NoBlending,
        depthWrite: false,
        depthTest: false,
        uniforms,
        vertexShader: sourceMatrixFullscreenVertex,
        fragmentShader,
      });
    }
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      transparent: true,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms,
      vertexShader: sourceMatrixFullscreenVertex,
      fragmentShader,
    });
  }

  private createPreCompositeMaterial() {
    dumpShader("A1-pre-composite", sourceMatrixFullscreenVertex, homePreCompositeFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: null },
        tWork: { value: null },
        tMedia: { value: null },
        tBloom: { value: null },
        tBlur: { value: null },
        tFluid: { value: null },
        tPortal: { value: null },
        tMouseSim: { value: null },
        boolBloom: { value: false },
        boolFluid: { value: false },
        boolLuminosity: { value: false },
        boolFxaa: { value: false },
        uTime: { value: 0 },
        tNoise: { value: this.noiseTexture },
        tLensflare: { value: null },
        uRatio: { value: 1 },
        tPerlin: { value: this.perlinTexture },
        uDisplacementSize: { value: new Vector2(0, 0) },
        uContainerSize: { value: new Vector2(0, 0) },
        uDisplacement: { value: 0.1 },
        uPerlin: { value: 0.1 },
        uBgColor: { value: sourceLinearToSrgbColor(SOURCE_COMPOSITE_BG) },
        uReveal: { value: 0 },
        uMediaReveal: { value: 0 },
        uContrast: { value: this.contrast },
        uTransformX: { value: 0 },
        uFluidStrength: { value: this.fluidStrength },
      },
      vertexShader: sourceMatrixFullscreenVertex,
      fragmentShader: homePreCompositeFragment,
    });
  }

  private createMainCompositeMaterial() {
    const settings = this.sourceMainRenderSettings;
    dumpShader("Lu-main-composite", sourceMatrixFullscreenVertex, mainCompositeFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        tBlur: { value: null },
        tFluid: { value: null },
        tMouseSim: { value: null },
        boolBloom: { value: settings.bloom.enabled },
        boolFluid: { value: settings.fluid.enabled },
        boolLuminosity: { value: settings.luminosity.enabled },
        boolFxaa: { value: settings.fxaa.enabled },
      },
      vertexShader: sourceMatrixFullscreenVertex,
      fragmentShader: mainCompositeFragment,
    });
  }

  private createLensflareMaterial() {
    dumpShader("L1-lensflare", sourceFullscreenVertex, sourceLensflareFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: null },
        uLightPosition: { value: new Vector2(0.5, 0.5) },
        uScale: { value: SOURCE_MAIN_LENSFLARE_SETTINGS.scale.clone() },
        uExposure: { value: SOURCE_MAIN_LENSFLARE_SETTINGS.exposure },
        uClamp: { value: SOURCE_MAIN_LENSFLARE_SETTINGS.clamp },
        uResolution: { value: new Vector2() },
      },
      vertexShader: sourceFullscreenVertex,
      fragmentShader: sourceLensflareFragment,
    });
  }

  private createMediaCompositeMaterial() {
    dumpShader("j1-media-composite", sourceMatrixFullscreenVertex, mediaCompositeFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      transparent: true,
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        tBlur: { value: null },
        tFluid: { value: null },
        tMouseSim: { value: null },
        boolBloom: { value: false },
        boolFluid: { value: false },
        boolLuminosity: { value: false },
        boolFxaa: { value: false },
      },
      vertexShader: sourceMatrixFullscreenVertex,
      fragmentShader: mediaCompositeFragment,
    });
  }

  private createLuminosityMaterial(settings: SourceRenderSettings) {
    const { luminosity } = settings;
    dumpShader("sg-luminosity", sourceFullscreenVertex, homeLuminosityFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: null },
        uThreshold: { value: luminosity.threshold },
        uSmoothing: { value: luminosity.smoothing },
      },
      vertexShader: sourceFullscreenVertex,
      fragmentShader: homeLuminosityFragment,
    });
  }

  private createBloomBlurMaterial(kernelRadius = SOURCE_BLOOM_KERNELS[0]) {
    dumpShader("rg-bloom-blur", sourceFullscreenVertex, homeBloomBlurFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      defines: {
        KERNEL_RADIUS: kernelRadius,
        SIGMA: kernelRadius,
      },
      uniforms: {
        tMap: { value: null },
        uResolution: { value: new Vector2(1, 1) },
        uDirection: { value: new Vector2(1, 0) },
      },
      vertexShader: sourceFullscreenVertex,
      fragmentShader: homeBloomBlurFragment,
    });
  }

  private createBloomBlurMaterials() {
    return SOURCE_BLOOM_KERNELS.map((kernelRadius) => this.createBloomBlurMaterial(kernelRadius));
  }

  private createBlurMaterial(directionX: number, directionY: number) {
    dumpShader("Na-standard-blur", sourceFullscreenVertex, homeBlurFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: null },
        uBluriness: { value: 0 },
        uDirection: { value: new Vector2(directionX, directionY) },
        uResolution: { value: new Vector2(1, 1) },
      },
      vertexShader: sourceFullscreenVertex,
      fragmentShader: homeBlurFragment,
    });
  }

  private createBloomCompositeMaterial(verticalTargets: WebGLRenderTarget[], settings = this.renderSettings) {
    const factors = sourceBloomFactors(settings.bloom.strength, settings.bloom.radius);
    dumpShader("cg-bloom-composite", sourceFullscreenVertex, homeBloomCompositeFragment);
    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      defines: {
        NUM_MIPS: 5,
        DITHERING: undefined,
      },
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tBlur1: { value: null },
        tBlur2: { value: null },
        tBlur3: { value: null },
        tBlur4: { value: null },
        tBlur5: { value: null },
        uBloomFactors: { value: null },
      },
      vertexShader: sourceFullscreenVertex,
      fragmentShader: homeBloomCompositeFragment,
    });
    material.uniforms.tBlur1.value = verticalTargets[0].texture;
    material.uniforms.tBlur2.value = verticalTargets[1].texture;
    material.uniforms.tBlur3.value = verticalTargets[2].texture;
    material.uniforms.tBlur4.value = verticalTargets[3].texture;
    material.uniforms.tBlur5.value = verticalTargets[4].texture;
    material.uniforms.uBloomFactors.value = factors;
    return material;
  }

  private createFloorReflectionBlurMaterial() {
    dumpShader("t1-floor-reflection-blur", floorReflectionBlurVertex, floorReflectionBlurFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: null },
        uDirection: { value: new Vector2(1, 0) },
        uResolution: { value: new Vector2(1, 1) },
      },
      vertexShader: floorReflectionBlurVertex,
      fragmentShader: floorReflectionBlurFragment,
    });
  }

  private createFxaaMaterial() {
    dumpShader("ig-fxaa", sourceFxaaVertex, homeFxaaFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: null },
        uResolution: { value: new Vector2(1, 1) },
      },
      vertexShader: sourceFxaaVertex,
      fragmentShader: homeFxaaFragment,
    });
  }

  private loadCompositeTextures() {
    this.sourceTexturePreloadPromise = this.loadCompositeTexturesFromSourceWebpState();
  }

  private async loadCompositeTexturesFromSourceWebpState() {
    this.sourceWebpSupport = await detectSourceWebpSupport();
    const sourceExt: "webp" | "jpg" = this.sourceWebpSupport ? "webp" : "jpg";
    this.sourceAssetExt = sourceExt;
    const blueNoise = this.loadTextureAsync("/images/textures/blue-noise.png").then((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      this.noiseTexture = texture;
      this.preCompositeMaterial.uniforms.tNoise.value = texture;
      this.workItems.forEach((item) => {
        item.mouseMaterial.uniforms.uNoiseTexture.value = texture;
      });
      this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value = texture;
      this.sourceTexturePreloadState.blueNoise = true;
    });
    const perlin2 = this.loadTextureAsync(`/images/textures/perlin-2.${sourceExt}`).then((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      this.perlinTexture = texture;
      this.preCompositeMaterial.uniforms.tPerlin.value = texture;
      this.sourceTexturePreloadState.perlin2 = true;
    });
    const perlin1 = this.loadTextureAsync(`/images/textures/perlin-1.${sourceExt}`).then((texture) => {
      texture.wrapS = MirroredRepeatWrapping;
      texture.wrapT = MirroredRepeatWrapping;
      this.workPerlinTexture = texture;
      this.workItems.forEach((item) => {
        item.material.uniforms.tPerlin.value = texture;
      });
      if (this.aboutBlocks) this.aboutBlocks.material.uniforms.tPerlin.value = texture;
      if (this.floatingBlocks) this.floatingBlocks.material.uniforms.tPerlin.value = texture;
      this.sourceTexturePreloadState.perlin1 = true;
    });
    const floorNormal = this.loadTextureAsync(`/images/textures/floor-normal.${sourceExt}`).then((texture) => {
      texture.colorSpace = NoColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(45, 45);
      texture.updateMatrix();
      this.floorMaterial.uniforms.tNormalMap.value = texture;
      this.floorMaterial.uniforms.uMapTransform.value = texture.matrix;
      this.sourceTexturePreloadState.floorNormal = true;
    });
    this.loadTexture("/models/me/model_T.jpg", (texture) => {
      this.characterMaterial.uniforms.tMap.value = texture;
    });
    this.loadCharacterModel();
    const cubeBase = "/images/cubemaps/01";
    const cubeUrls = ["px", "nx", "ny", "py", "pz", "nz"].map((side) => `${cubeBase}/${side}.${sourceExt}`);
    this.sourceCubemapLoadState = {
      mode: "source-p1-addEnvironment-Le-WEBP-selected-extension-no-runtime-fallback",
      ext: sourceExt,
      loaded: false,
      failed: false,
      urls: cubeUrls,
    };
    this.cubeLoader.load(
      cubeUrls,
      (texture) => {
        this.homeScene.environment = texture;
        this.sourceCubemapLoadState.loaded = true;
      },
      undefined,
      (error) => {
        this.sourceCubemapLoadState.failed = true;
        console.error("Source p1.addEnvironment cubemap load failed", error);
      },
    );
    await Promise.all([blueNoise, floorNormal, perlin1, perlin2]);
  }

  private createSkyCompositeMaterial() {
    dumpShader("z1-sky-composite", sourceTlFullscreenVertex, skyCompositeFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: NoBlending,
      uniforms: {
        tScene: { value: null },
        uTime: { value: 0 },
        uShader1Alpha: { value: 0.5 },
        uShader1Speed: { value: 0.5 },
        uShader2Speed: { value: 0 },
        uShader1Scale: { value: 5.5 },
        uShader2Scale: { value: 0 },
        uShaderMix: { value: undefined },
      },
      vertexShader: sourceTlFullscreenVertex,
      fragmentShader: skyCompositeFragment,
    });
  }

  private createDisplacementMaterial() {
    dumpShader("N1-displacement-composite", sourceTlFullscreenVertex, displacementFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      blending: NoBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: null },
        uTime: { value: 0 },
        uRatio: { value: 1 },
      },
      vertexShader: sourceTlFullscreenVertex,
      fragmentShader: displacementFragment,
    });
  }

  private createMouseSimulationMaterial(ratio: number, thickness: number, persistance = 0.75) {
    dumpShader("Ka-mouse-simulation", mouseSimulationVertex, mouseSimulationFragment);
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
      vertexShader: mouseSimulationVertex,
      fragmentShader: mouseSimulationFragment,
    });
  }

  private createWorkMouseSimulation() {
    const material = this.createMouseSimulationMaterial(GRID_COLS / GRID_ROWS, 0.1, 0.85);
    const scene = new Scene();
    scene.add(makeFullscreenTriangle(material));
    return {
      material,
      scene,
      targets: Array.from({ length: 2 }, makeSimulationTarget),
    };
  }

  private createSourceWorkMousePlaneMaterial() {
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uUvOffset: { value: new Vector2(0, 0) },
        tMouseSim: { value: null },
        uTime: { value: 0 },
        uRatio: { value: GRID_COLS / GRID_ROWS },
      },
      vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
      fragmentShader: `
uniform vec2 uUvOffset;
uniform float uTime;
uniform sampler2D tMouseSim;
varying vec2 vUv;
uniform float uRatio;
void main() {
  vec2 uvOff = vUv;
  uvOff.x -= 0.5;
  uvOff.x *= uRatio;
  uvOff.x += 0.5;
  vec2 p = uvOff.xy * 2.0 - 1.0;
  float r = length(p) * 0.9;
  vec3 color = vec3(0.24, 0.7, 0.4);
  float a = pow(r, 0.25);
  float b = sin(r * 0.8 - 1.6);
  float c = sin(r - 0.010);
  float s = sin(a - uTime * 1.0 + b);
  color *= abs(1.0 / (s * 10.8)) - 0.1;
  gl_FragColor = vec4(color, 1.0);
}
`,
    });
    return material;
  }

  private createMainFluidPass(): MainFluidPass {
    const settings = this.sourceMainRenderSettings.fluid;
    const cellScale = new Vector2();
    const fboSize = new Vector2(1, 1);
    const bounds = new Vector2();
    const makeBoundedScene = (material: ShaderMaterial) => {
      const scene = new Scene();
      scene.add(makeFullscreenTriangle(material));
      return scene;
    };
    const makeAdvectionScene = (material: ShaderMaterial, boundsMaterial: ShaderMaterial) => {
      const scene = makeBoundedScene(material);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute([
        -1, -1, 0,
        -1, 1, 0,
        -1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, -1, 0,
        1, -1, 0,
        -1, -1, 0,
      ], 3));
      const line = new LineSegments(geometry, boundsMaterial);
      line.frustumCulled = false;
      scene.add(line);
      return scene;
    };
    dumpShader("ag-advection", fluidBoundedVertex, fluidAdvectionFragment);
    dumpShader("ag-advection-bounds", fluidBoundsVertex, fluidAdvectionFragment);
    dumpShader("ag-force", fluidForceVertex, fluidForceFragment);
    dumpShader("ag-divergence", fluidBoundedVertex, fluidDivergenceFragment);
    dumpShader("ag-poisson", fluidBoundedVertex, fluidPoissonFragment);
    dumpShader("ag-pressure", fluidBoundedVertex, fluidPressureFragment);
    const advectionMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        bounds: { value: cellScale },
        px: { value: cellScale },
        fboSize: { value: fboSize },
        velocity: { value: this.fluidPlaceholder },
        dt: { value: settings.delta },
      },
      vertexShader: fluidBoundedVertex,
      fragmentShader: fluidAdvectionFragment,
    });
    const advectionBoundsMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: advectionMaterial.uniforms,
      vertexShader: fluidBoundsVertex,
      fragmentShader: fluidAdvectionFragment,
    });
    const forceMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        center: { value: new Vector2() },
        scale: { value: new Vector2(settings.cursorSize, settings.cursorSize) },
        px: { value: cellScale },
        force: { value: new Vector2() },
      },
      vertexShader: fluidForceVertex,
      fragmentShader: fluidForceFragment,
    });
    const forceScene = new Scene();
    forceScene.add(new Mesh(new PlaneGeometry(2, 2), forceMaterial));
    const divergenceMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        bounds: { value: bounds },
        velocity: { value: this.fluidPlaceholder },
        px: { value: cellScale },
        dt: { value: settings.delta },
      },
      vertexShader: fluidBoundedVertex,
      fragmentShader: fluidDivergenceFragment,
    });
    const poissonMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        bounds: { value: bounds },
        pressure: { value: this.fluidPlaceholder },
        divergence: { value: this.fluidPlaceholder },
        px: { value: cellScale },
      },
      vertexShader: fluidBoundedVertex,
      fragmentShader: fluidPoissonFragment,
    });
    const pressureMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        bounds: { value: bounds },
        pressure: { value: this.fluidPlaceholder },
        velocity: { value: this.fluidPlaceholder },
        px: { value: cellScale },
        dt: { value: settings.delta },
      },
      vertexShader: fluidBoundedVertex,
      fragmentShader: fluidPressureFragment,
    });
    return {
      advectionMaterial,
      advectionBoundsMaterial,
      advectionScene: makeAdvectionScene(advectionMaterial, advectionBoundsMaterial),
      forceMaterial,
      forceScene,
      divergenceMaterial,
      divergenceScene: makeBoundedScene(divergenceMaterial),
      poissonMaterial,
      poissonScene: makeBoundedScene(poissonMaterial),
      pressureMaterial,
      pressureScene: makeBoundedScene(pressureMaterial),
      targets: {
        main: makeFluidRenderTarget(),
        velocity: makeFluidRenderTarget(),
        divergence: makeFluidRenderTarget(),
        pressureA: makeFluidRenderTarget(),
        pressureB: makeFluidRenderTarget(),
      },
      cellScale,
      fboSize,
      bounds,
      pointerOld: new Vector2(),
      pointer: new Vector2(),
      enabled: settings.enabled && this.debugMainFluid !== "off",
    };
  }

  private disposeMainFluidPass() {
    const pass = this.mainFluidPass;
    pass.advectionMaterial.dispose();
    pass.advectionBoundsMaterial.dispose();
    pass.forceMaterial.dispose();
    pass.divergenceMaterial.dispose();
    pass.poissonMaterial.dispose();
    pass.pressureMaterial.dispose();
    Object.values(pass.targets).forEach((target) => target.dispose());
  }

  private createThumbCompositeMaterial() {
    dumpShader("x1-thumb-composite", sourceTlFullscreenVertex, thumbCompositeFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      transparent: true,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: null },
        uDarkenIntensity: { value: 0 },
        uDarkenColor: { value: sourceRgbColor("#000000", "#000000") },
        uSaturation: { value: 1 },
      },
      vertexShader: sourceTlFullscreenVertex,
      fragmentShader: thumbCompositeFragment,
    });
  }

  private createCharacterMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: this.placeholder },
        uBackgroundColor: { value: colorFrom("#000000") },
        uReveal: { value: 1 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: characterCompositeFragment,
    });
  }

  private loadCharacterModel() {
    const loader = new GLTFLoader();
    loader.load(
      "/models/me/me.gltf",
      (gltf) => {
        this.characterModelRoot.clear();
        const model = gltf.scene;
        model.rotation.set(0, Math.PI, 0);
        model.updateMatrixWorld(true);
        const box = new Box3().setFromObject(model);
        const size = new Vector3();
        box.getSize(size);
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 0) model.scale.multiplyScalar(4.8 / maxSize);
        model.updateMatrixWorld(true);
        const centeredBox = new Box3().setFromObject(model);
        const center = new Vector3();
        centeredBox.getCenter(center);
        model.position.sub(center);
        model.position.y -= 0.15;
        model.traverse((child) => {
          if (!(child instanceof Mesh)) return;
          child.frustumCulled = false;
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              material.depthWrite = true;
              material.depthTest = true;
            });
          } else {
            child.material.depthWrite = true;
            child.material.depthTest = true;
          }
        });
        this.characterFallbackMesh.visible = false;
        this.characterModelRoot.add(model);
        this.renderCharacterTarget();
      },
      undefined,
      () => {
        this.characterFallbackMesh.visible = true;
      },
    );
  }

  private disposeCharacterModel() {
    this.characterModelRoot.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material: Material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof Texture) value.dispose();
        });
        material.dispose();
      });
    });
    this.characterModelRoot.clear();
  }

  private createFloorMaterial() {
    this.updateFloorReflectionRenderTargetUniform(this.floorReflectionReadTarget.texture);
    dumpShader("o1-floor-material", floorVertex, floorFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      blending: NoBlending,
      defines: {
        USE_NORMALMAP: "",
      },
      uniforms: {
        tReflect: this.floorReflectionRenderTargetUniform,
        uMapTransform: { value: new Matrix3().identity() },
        uMatrix: this.floorReflectionTextureMatrixUniform,
        uColor: { value: colorFrom("#4a4a4a") },
        tNormalMap: { value: this.placeholder },
        uReflectivity: { value: 0.97 },
        uMirror: { value: 1 },
        uFloorMixStrength: { value: 15 },
        uNormalDistortionStrength: { value: 2.5 },
        uNormalScale: { value: new Vector2(1, 1) },
      },
      vertexShader: floorVertex,
      fragmentShader: floorFragment,
    });
  }

  private updateFloorReflectionRenderTargetUniform(texture: Texture) {
    this.floorReflectionRenderTargetUniform.value = this.debugFloorReflection === "raw-sample"
      ? this.floorReflectionTarget.texture
      : texture;
  }

  private createEnvironmentMaterial() {
    const uniforms = {
      uTime: { value: 0 },
      uMultiplier: { value: 2 },
      uDarkenColor: { value: colorFrom(SOURCE_INITIAL_SECONDARY) },
      uDarken: { value: 1 },
      tSky: { value: this.environmentSkyTexture() },
      uShader1Alpha: { value: 0.5 },
      uShader1Speed: { value: 0.5 },
      uShader1Scale: { value: 5.5 },
      uShader2Alpha: { value: 0 },
      uShader2Scale: { value: 13 },
      uShader3Alpha: { value: 0 },
      uShader3Speed: { value: 0 },
      uShader3Scale: { value: 0 },
      uShader1Mix3: { value: 1.5 },
    };
    const material = new MeshStandardMaterial({
      side: BackSide,
      envMapIntensity: 1,
      fog: false,
      dithering: true,
    }) as EnvironmentMaterial;
    material.customUniforms = uniforms;
    material.sourceConstructorParams = {
      side: BackSide,
      envMapIntensity: 1,
      fog: false,
    };
    material.onBeforeCompile = (shader) => {
      patchEnvironmentShader(shader, material.customUniforms);
    };
    material.customProgramCacheKey = () => "source-u1-environment-standard";
    return material;
  }

  private createWorkMousePlane() {
    const planeSize = sourceWorkMousePlaneSize();
    const material = this.createSourceWorkMousePlaneMaterial();
    const mesh = new Mesh(new PlaneGeometry(1, 1), material);
    mesh.scale.set(planeSize.x, planeSize.y, 1);
    mesh.position.set(0, 0, planeSize.y / 2);
    return mesh;
  }

  private createWorkRayPlane() {
    const raySize = sourceWorkRayPlaneSize();
    const material = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new Mesh(new PlaneGeometry(1, 1), material);
    mesh.scale.set(raySize.x, raySize.y, 1);
    mesh.position.set(0, 0, sourceWorkMousePlaneSize().y / 2 + 0.01);
    return mesh;
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
    dumpShader("UD-project-media", projectMediaVertex, projectMediaFragment);
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
            this.playMediaVideo(plane);
          } else {
            plane.video?.pause();
          }
        });
      },
      { rootMargin: "20% 0px", threshold: 0 },
    );
    observer.observe(plane.track);
    plane.observer = observer;
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
        if (!this.mediaPlanes.includes(plane) || !plane.track.isConnected) return;
        plane.material.uniforms.uMapSize.value.set(video.videoWidth || 1600, video.videoHeight || 1200);
        const texture = new VideoTexture(video);
        applySourceLoadedTextureState(texture, this.loadedTextureColorSpace());
        plane.texture = texture;
        plane.material.uniforms.tMap.value = texture;
        this.showMediaPlane(plane);
        this.playMediaVideo(plane);
      });
      video.load();
      return;
    }

    this.loader.load(plane.src, (texture) => {
      if (!this.mediaPlanes.includes(plane) || !plane.track.isConnected) {
        texture.dispose();
        return;
      }
      applySourceLoadedTextureState(texture, this.loadedTextureColorSpace());
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

  private playMediaVideo(plane: MediaPlane) {
    if (!plane.video || !plane.track.isConnected) return;
    plane.video.play().catch(() => {});
  }

  private setProjectBlockReveal(active: WorkItem) {
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
    });
  }

  private setMainColor(color?: string, duration = 1.6) {
    this.mainColorTweens.forEach((tween) => tween.kill());
    this.mainColorTweens = [];
    const elements = document.querySelectorAll<HTMLElement>(".c-color");
    const next = sourceRgbColor(color);
    if (duration <= 0) {
      elements.forEach((element) => {
        element.style.color = `rgb(${Math.round(next.r * 255)}, ${Math.round(next.g * 255)}, ${Math.round(next.b * 255)})`;
      });
      return;
    }
    elements.forEach((element) => {
      this.mainColorTweens.push(gsap.to(element, {
        color: `rgb(${Math.round(next.r * 255)}, ${Math.round(next.g * 255)}, ${Math.round(next.b * 255)})`,
        duration,
        ease: "expo.out",
      }));
    });
  }

  private setAmbientLight(color?: string, intensity = 0.5, duration = 1.6) {
    this.ambientTweens.forEach((tween) => tween.kill());
    this.ambientTweens = [];
    this.currentAmbientIntensity = intensity;
    const next = sourceRgbColor(color, SOURCE_INITIAL_SECONDARY);
    if (duration <= 0) {
      this.ambientLight.color.copy(next);
      this.ambientLight.intensity = intensity;
      this.backgroundMaterial.uniforms.uAmbientColor.value.copy(next);
      this.environmentMaterial.customUniforms.uDarkenColor.value.copy(next);
      this.backgroundMaterial.uniforms.uAmbientIntensity.value = intensity;
      return;
    }
    this.ambientTweens.push(gsap.to(this.ambientLight.color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.ambientLight, { intensity, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.backgroundMaterial.uniforms.uAmbientColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.environmentMaterial.customUniforms.uDarkenColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.backgroundMaterial.uniforms.uAmbientIntensity, {
      value: intensity,
      duration,
      ease: "expo.out",
    }));
  }

  private setDarken(value: number, duration = 0.5) {
    this.darkenTween?.kill();
    const update = () => {
      this.compositeMaterial.uniforms.uDarken.value = this.darken;
    };
    if (duration <= 0) {
      this.darken = value;
      update();
      return;
    }
    this.darkenTween = gsap.to(this, {
      darken: value,
      duration: 0.5,
      ease: "none",
      onUpdate: update,
    });
  }

  private setThumbDarknessIntensity(value: number, duration = 1.6) {
    this.thumbDarknessTweens.forEach((tween) => tween.kill());
    this.thumbDarknessTweens = [];
    const update = () => {
      this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value = this.thumbState.darknessIntensity;
    };
    if (duration <= 0) {
      this.thumbState.darknessIntensity = value;
      update();
      return;
    }
    this.thumbDarknessTweens.push(gsap.to(this.thumbState, {
      darknessIntensity: value,
      duration,
      ease: "expo.out",
      onUpdate: update,
    }));
  }

  private setSaturation(value: number, duration = 1.6) {
    this.saturationTween?.kill();
    const update = () => {
      this.compositeMaterial.uniforms.uSaturation.value = this.saturation;
    };
    if (duration <= 0) {
      this.saturation = value;
      update();
      return;
    }
    this.saturationTween = gsap.to(this, {
      saturation: value,
      duration,
      ease: "expo.out",
      onUpdate: update,
    });
  }

  private setThumbSaturation(value: number, duration = 1.6) {
    this.thumbSaturationTweens.forEach((tween) => tween.kill());
    this.thumbSaturationTweens = [];
    const update = () => {
      this.thumbCompositeMaterial.uniforms.uSaturation.value = this.thumbState.saturation;
    };
    if (duration <= 0) {
      this.thumbState.saturation = value;
      update();
      return;
    }
    this.thumbSaturationTweens.push(gsap.to(this.thumbState, {
      saturation: value,
      duration,
      ease: "expo.out",
      onUpdate: update,
    }));
  }

  private setContrast(value: number, duration = 1.6) {
    this.contrastTween?.kill();
    const update = () => {
      this.preCompositeMaterial.uniforms.uContrast.value = this.contrast;
    };
    if (duration <= 0) {
      this.contrast = value;
      update();
      return;
    }
    this.contrastTween = gsap.to(this, {
      contrast: value,
      duration,
      ease: "expo.out",
      onUpdate: update,
    });
  }

  private setThumbDarknessColor(value?: string, duration = 1.6) {
    this.thumbDarknessColorTweens.forEach((tween) => tween.kill());
    this.thumbDarknessColorTweens = [];
    const next = sourceRgbColor(value ?? "#000000", "#000000");
    const update = () => {
      (this.thumbCompositeMaterial.uniforms.uDarkenColor.value as Color).copy(this.thumbState.darknessColor);
    };
    if (duration <= 0) {
      this.thumbState.darknessColor.copy(next);
      update();
      return;
    }
    this.thumbDarknessColorTweens.push(gsap.to(this.thumbState.darknessColor, {
      r: next.r,
      g: next.g,
      b: next.b,
      duration,
      ease: "expo.out",
      onUpdate: update,
    }));
  }

  private setThumbMouseLightness(value: number, duration = 1.6) {
    this.thumbMouseLightnessTweens.forEach((tween) => tween.kill());
    this.thumbMouseLightnessTweens = [];
    const update = () => {
      this.workItems.forEach((item) => {
        item.material.uniforms.uMouseLightness.value = this.thumbState.mouseLightness;
      });
    };
    if (duration <= 0) {
      this.thumbState.mouseLightness = value;
      update();
      return;
    }
    this.thumbMouseLightnessTweens.push(gsap.to(this.thumbState, {
      mouseLightness: value,
      duration,
      ease: "expo.out",
      onUpdate: update,
    }));
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
    const next = sourceRgbColor(value, DEFAULT_BG);
    const update = () => {
      this.mediaBackground.copy(this.mediaBackgroundState);
      this.mediaPlanes.forEach((plane) => {
        plane.material.uniforms.uBackgroundColor.value.copy(this.mediaBackgroundState);
      });
    };
    if (duration <= 0) {
      this.mediaBackgroundState.copy(next);
      update();
      return;
    }
    this.mediaBackgroundTweens.push(gsap.to(this.mediaBackgroundState, {
      r: next.r,
      g: next.g,
      b: next.b,
      duration,
      ease: "expo.out",
      onUpdate: update,
    }));
  }

  private setBlocksColor(value?: string, duration = 1.6) {
    this.blockColorTweens.forEach((tween) => tween.kill());
    this.blockColorTweens = [];
    const next = sourceRgbColor(value ?? DEFAULT_BG, DEFAULT_BG);
    this.workItems.forEach((item) => {
      if (duration <= 0) {
        item.material.emissive.copy(next);
        return;
      }
      this.blockColorTweens.push(gsap.to(item.material.emissive, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
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
    const update = () => {
      this.spotLight.intensity = this.lightState.spotLight.intensity;
    };
    this.spotLightTween = gsap.to(this.lightState.spotLight, {
      intensity: value,
      duration,
      ease,
      onUpdate: update,
    });
  }

  private homeSpotlightMap() {
    return this.debugDisableHomeSpotlightMap ? null : this.thumbCompositeTarget.texture;
  }

  private environmentSkyTexture() {
    if (this.debugSkyTarget === "off") return this.placeholder;
    if (this.debugSkyTarget === "raw") return this.skyRawTarget.texture;
    return this.skyCompositeTarget.texture;
  }

  private setDirectionalLightIntensity(value: number, duration = 1.6, ease = "expo.out") {
    this.directionalLightTween?.kill();
    this.directionalLightTween = gsap.to(this.lightState.directionalLight, {
      intensity: value,
      duration,
      ease,
      onUpdate: () => {
        this.directionalLight.intensity = this.lightState.directionalLight.intensity;
      },
    });
  }

  private setDirectionalLight2Intensity(value: number, duration = 1.6, ease = "expo.out") {
    this.directionalLight2Tween?.kill();
    this.directionalLight2Tween = gsap.to(this.lightState.directionalLight2, {
      intensity: value,
      duration,
      ease,
      onUpdate: () => {
        this.directionalLight2.intensity = this.lightState.directionalLight2.intensity;
      },
    });
  }

  private setEnvRotation(value: number, duration = 5.6, ease = "expo.inOut") {
    this.envRotationTween?.kill();
    const update = () => {
      this.sceneWrap.rotation.x = this.envRotation;
    };
    if (duration <= 0) {
      this.envRotation = value;
      update();
      return;
    }
    this.envRotationTween = gsap.to(this, {
      envRotation: value,
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
      this.preCompositeMaterial.uniforms.uMediaReveal.value = this.mediaSceneOpacity;
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
    void this.loadTextureAsync(src).then(onLoad);
  }

  private loadTextureAsync(src: string) {
    const cached = this.textureCache.get(src);
    if (cached) return Promise.resolve(cached);
    return new Promise<Texture>((resolve, reject) => {
      this.loader.load(
        src,
        (texture) => {
          applySourceLoadedTextureState(texture, this.loadedTextureColorSpace());
          this.textureCache.set(src, texture);
          resolve(texture);
        },
        undefined,
        reject,
      );
    });
  }

  private loadVideoTextureAsync(src: string) {
    const cached = this.videoTextureCache.get(src);
    if (cached) return Promise.resolve(cached);
    return new Promise<Texture>((resolve, reject) => {
      const video = Object.assign(document.createElement("video"), {
        crossOrigin: "anonymous",
        muted: true,
        loop: true,
        playsInline: true,
        preload: "metadata",
        src,
      });
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
        const texture = new VideoTexture(video);
        applySourceLoadedTextureState(texture, this.loadedTextureColorSpace());
        this.videoTextureCache.set(src, texture);
        resolve(texture);
      }, { once: true });
      video.addEventListener("error", () => reject(new Error(`Unable to load source thumb video ${src}`)), { once: true });
      video.load();
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

  private get screenMouseSimulationTexture() {
    return this.screenMouseSimulationTargets[this.screenMouseSimulationIndex]?.texture ?? this.placeholder;
  }

  private bindSourceMainCompositeInputs() {
    this.preCompositeMaterial.uniforms.tWork.value = this.workCompositeTarget.texture;
    this.preCompositeMaterial.uniforms.tMedia.value = this.mediaTarget.texture;
    this.preCompositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTargets[0]?.texture ?? this.placeholder;
  }

  private bind() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  private onMouseMove = (event: MouseEvent) => {
    const sourceWidth = Math.max(1, this.root.offsetWidth || window.innerWidth);
    const sourceHeight = Math.max(1, this.root.offsetHeight || window.innerHeight);
    this.pointerPixels.set(event.clientX, event.clientY);
    this.targetPointer.x = (event.clientX / sourceWidth - 0.5) * 2;
    this.targetPointer.y = -(event.clientY / sourceHeight - 0.5) * 2;
    this.pointerRay.set(this.targetPointer.x, this.targetPointer.y);
    this.screenMouseSimTargetPos.set(event.clientX / sourceWidth, 1 - event.clientY / sourceHeight);
    this.updatePointerProjection();
  };

  private onScroll = () => {
    this.updateMediaPlanePositions();
  };

  private resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = sourceDpr();
    const workDpr = sourceWorkDpr();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    const renderWidth = Math.max(1, Math.round(width * dpr));
    const renderHeight = Math.max(1, Math.round(height * dpr));
    const workRenderWidth = Math.max(1, Math.round(width * workDpr));
    const workRenderHeight = Math.max(1, Math.round(height * workDpr));
    if (this.renderSettings.fxaa.enabled) {
      this.workFxaaTarget.setSize(workRenderWidth, workRenderHeight);
      this.workFxaaMaterial.uniforms.uResolution.value.set(workRenderWidth, workRenderHeight);
    }
    if (this.sourceMainRenderSettings.fxaa.enabled) {
      this.mainFxaaTarget.setSize(renderWidth, renderHeight);
      this.mainFxaaMaterial.uniforms.uResolution.value.set(renderWidth, renderHeight);
    }
    if (this.renderSettings.blur.enabled) {
      const workBlurWidth = Math.max(1, Math.round(width * this.renderSettings.blur.scale));
      const workBlurHeight = Math.max(1, Math.round(height * this.renderSettings.blur.scale));
      this.workBlurTargetA.setSize(workBlurWidth, workBlurHeight);
      this.workBlurTargetB.setSize(workBlurWidth, workBlurHeight);
      this.workBlurHorizontalMaterial.uniforms.uResolution.value.set(width, height);
      this.workBlurVerticalMaterial.uniforms.uResolution.value.set(width, height);
    }
    if (this.sourceMainRenderSettings.blur.enabled) {
      const blurWidth = Math.max(1, Math.round(width * this.sourceMainRenderSettings.blur.scale));
      const blurHeight = Math.max(1, Math.round(height * this.sourceMainRenderSettings.blur.scale));
      this.mainBlurTargetA.setSize(blurWidth, blurHeight);
      this.mainBlurTargetB.setSize(blurWidth, blurHeight);
      this.mainBlurHorizontalMaterial.uniforms.uResolution.value.set(width, height);
      this.mainBlurVerticalMaterial.uniforms.uResolution.value.set(width, height);
    }
    this.workRawTarget.setSize(workRenderWidth, workRenderHeight);
    this.workCompositeTarget.setSize(workRenderWidth, workRenderHeight);
    this.mainRawTarget.setSize(renderWidth, renderHeight);
    this.compositeTarget.setSize(renderWidth, renderHeight);
    this.mainLensflareTarget.setSize(renderWidth, renderHeight);
    if (SOURCE_MAIN_LENSFLARE_SETTINGS.enabled && this.mainLensflareMaterial) {
      this.mainLensflareMaterial.uniforms.uResolution.value.set(width / 8, height / 8);
    }
    this.mediaRawTarget.setSize(renderWidth, renderHeight);
    this.mediaTarget.setSize(renderWidth, renderHeight);
    const workQuarterMipWidth = Math.max(1, Math.round(floorPowerOfTwo(workRenderWidth) / 4));
    const workQuarterMipHeight = Math.max(1, Math.round(floorPowerOfTwo(workRenderHeight) / 4));
    const mainHalfMipWidth = Math.max(1, Math.round(floorPowerOfTwo(renderWidth) / 2));
    const mainHalfMipHeight = Math.max(1, Math.round(floorPowerOfTwo(renderHeight) / 2));
    if (this.renderSettings.luminosity.enabled) this.workBloomBrightTarget.setSize(workQuarterMipWidth, workQuarterMipHeight);
    if (this.renderSettings.bloom.enabled) {
      this.resizeBloomMipChain(
        this.workBloomHorizontalTargets,
        this.workBloomVerticalTargets,
        this.bloomBlurMaterials,
        workQuarterMipWidth,
        workQuarterMipHeight,
      );
    }
    if (this.sourceMainRenderSettings.luminosity.enabled) this.mainBloomBrightTarget.setSize(mainHalfMipWidth, mainHalfMipHeight);
    if (this.sourceMainRenderSettings.bloom.enabled) {
      this.resizeBloomMipChain(
        this.mainBloomHorizontalTargets,
        this.mainBloomVerticalTargets,
        this.mainBloomBlurMaterials,
        mainHalfMipWidth,
        mainHalfMipHeight,
      );
    }
    if (this.sourceMainRenderSettings.fluid.enabled) this.resizeMainFluidPass(mainHalfMipWidth / 3, mainHalfMipHeight / 3);
    const skySize = Math.max(1, Math.round(height * 0.75));
    this.skyRawTarget.setSize(skySize, skySize);
    this.skyCompositeTarget.setSize(skySize, skySize);
    this.homeCamera.aspect = width / height;
    this.homeCamera.updateProjectionMatrix();
    this.mainCamera.fov = sourceYgFov(width, width / height, this.mainCameraDistance);
    this.mainCamera.aspect = width / height;
    this.mainCamera.far = this.mainCameraDistance * 2;
    this.mainCamera.position.set(0, 0, this.mainCameraDistance);
    this.mainCamera.updateProjectionMatrix();
    this.cameraOrigin.z = width >= BREAKPOINT_MD ? 5.5 : 5;
    this.cameraControllerGroup.lookAt(this.cameraLookAt);
    this.backgroundMaterial.uniforms.uRatio.value = width / height;
    this.preCompositeMaterial.uniforms.uRatio.value = width / height;
    this.preCompositeMaterial.uniforms.uContainerSize.value.set(width, height);
    this.displacementMaterial.uniforms.uRatio.value = width / height;
    const displacementSize = Math.max(1, Math.round(height / 10));
    this.displacementRawTarget.setSize(displacementSize, displacementSize);
    this.displacementTarget.setSize(displacementSize, displacementSize);
    const floorReflectionWidth = Math.max(1, width * 0.75);
    const floorReflectionHeight = Math.max(1, height * 0.75);
    this.floorReflectionTarget.setSize(floorReflectionWidth, floorReflectionHeight);
    this.floorReflectionReadTarget.setSize(floorReflectionWidth, floorReflectionHeight);
    this.floorReflectionWriteTarget.setSize(floorReflectionWidth, floorReflectionHeight);
    this.floorReflectionBlurMaterial.uniforms.uResolution.value.set(width, height);
    const screenSimWidth = Math.max(1, workRenderWidth / SCREEN_MOUSE_SIM_SCALE);
    const screenSimHeight = Math.max(1, workRenderHeight / SCREEN_MOUSE_SIM_SCALE);
    if (this.renderSettings.mousesim.enabled) {
      this.screenMouseSimulationTargets.forEach((target) => target.setSize(screenSimWidth, screenSimHeight));
      this.screenMouseSimulationMaterial.uniforms.uCoords.value.set(screenSimWidth, screenSimHeight);
    }
    if (this.renderSettings.mousesim.enabled) {
      this.workItems.forEach((item) => {
        const planeWidth = Math.max(1, item.mousePlane.scale.x);
        const planeHeight = Math.max(1, item.mousePlane.scale.y);
        item.mouseTargets.forEach((target) => target.setSize(planeWidth, planeHeight));
        item.mouseMaterial.uniforms.uCoords.value.set(planeWidth, planeHeight);
      });
    }
    const thumbSize = Math.max(1, Math.round(height));
    this.thumbTarget.setSize(thumbSize, thumbSize);
    this.thumbCompositeTarget.setSize(thumbSize, thumbSize);
    this.characterTarget.setSize(thumbSize, thumbSize);
    this.renderCharacterTarget();
    this.calcThumbItemWidth();

    const distance = 1000;
    this.mediaCamera.fov = MathUtils.radToDeg(2 * Math.atan(height / (2 * distance)));
    this.mediaCamera.aspect = width / height;
    this.mediaCamera.position.set(0, 0, distance);
    this.mediaCamera.updateProjectionMatrix();

    const mobile = width < BREAKPOINT_LG;
    this.sceneWrap.visible = this.workItems.length > 0;
    this.sceneWrap.position.y = width >= BREAKPOINT_MD ? 0 : 0.3;
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
      item.material.uniforms.uCoords.value.set(workRenderWidth, workRenderHeight);
    });
    this.resizeAuxiliaryBlocks(width, height, dpr);
    this.updateMediaPlanePositions();
  };

  private resizeBloomMipChain(
    horizontalTargets: WebGLRenderTarget[],
    verticalTargets: WebGLRenderTarget[],
    blurMaterials: ShaderMaterial[],
    startWidth: number,
    startHeight: number,
  ) {
    let mipWidth = startWidth;
    let mipHeight = startHeight;
    horizontalTargets.forEach((target, index) => {
      target.setSize(mipWidth, mipHeight);
      verticalTargets[index].setSize(mipWidth, mipHeight);
      blurMaterials[index]?.uniforms.uResolution.value.set(mipWidth, mipHeight);
      mipWidth = Math.max(1, Math.round(mipWidth / 2));
      mipHeight = Math.max(1, Math.round(mipHeight / 2));
    });
  }

  private updateMediaPlanePositions() {
    const scroll = window.scrollY;
    this.mediaPlanes.forEach((plane) => {
      plane.mesh.position.x = plane.offset.x + plane.translation.x;
      plane.mesh.position.y = plane.offset.y + plane.translation.y + scroll;
      plane.material.uniforms.uCameraDistance.value =
        plane.parallaxTop ? -scroll : this.mediaCamera.position.y - plane.mesh.position.y;
    });
  }

  private calcThumbItemWidth() {
    this.thumbItemWidth = this.workItems[0]?.thumb.scale.x ?? 2;
  }

  private resetThumbOffsetY() {
    this.thumbOffsetY = 0;
  }

  private setThumbTransitioning(value: boolean) {
    this.thumbIsTransitioning = value;
  }

  private updateThumbGallery(progress: number) {
    if (!this.workItems.length || this.thumbIsTransitioning) return;
    const itemWidth = this.thumbItemWidth;
    const totalWidth = this.thumbTotalItems * itemWidth;
    this.thumbProgress = progress * totalWidth;
    this.workItems.forEach((item, index) => {
      const hook = itemWidth * index;
      item.thumbXHook = hook;
      let x = (hook + this.thumbProgress + totalWidth * 67890) % totalWidth;
      if (x > totalWidth / 2) x -= totalWidth;
      item.thumb.position.set(x, 0, 0);
      item.thumb.visible = x >= -1.5 && x <= 1.5;
    });
  }

  private applyDebugThumbProgress() {
    if (!this.debugThumbProbe || this.debugThumbProgress === null) return;
    this.setGalleryProgress(this.debugThumbProgress, 0, 1 / 60);
  }

  private updatePointerProjection() {
    if (!this.sceneWrap.visible) return;
    this.raycaster.setFromCamera(this.pointerRay, this.homeCamera);
    this.workItems.forEach((item) => {
      if (!item.group.visible) return;
      const hit = this.raycaster.intersectObject(item.rayPlane, false)[0];
      if (!hit?.uv) return;
      item.mouseTarget.set(
        MathUtils.clamp(hit.uv.x, 0, 1),
        MathUtils.clamp(hit.uv.y, 0, 1),
      );
    });
  }

  private updateVisibleWorkItems(time: number, delta: number) {
    this.workItems.forEach((item) => {
      item.material.uniforms.uTime.value = time;
      item.material.uniforms.uCoords.value.set(this.workRawTarget.width, this.workRawTarget.height);
      const world = new Vector3();
      item.group.getWorldPosition(world);
      const visible = !(world.x > 5.5 || world.x < -5.5 || world.z > 5);
      item.group.visible = visible;
      if (!visible) return;

      if (this.renderSettings.mousesim.enabled) {
        const meshResult = this.updateMouseBrush(
          item.mouseMaterial,
          item.mouseScene,
          item.mouseTargets,
          item.mouseIndex,
          item.mouseOld,
          item.mouseNew,
          item.mouseTarget,
          time,
          delta,
          1,
          0.85,
          0.1,
        );
        item.mouseIndex = meshResult.index;
        item.material.uniforms.tMouseSim.value = item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder;
        item.mouseSpeed = sourceDamp(item.mouseSpeed, meshResult.speed, 10, delta);
        item.material.uniforms.uMouseSpeed.value = item.mouseSpeed;
      }
      item.mousePlane.material.uniforms.uTime.value = time;
      item.material.uniforms.tDisplacement.value = this.displacementTarget.texture;

      const sideReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 0, 5, 0, 1), 0, 1);
      const sideSpreadReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 2, 6, 0, 1), 0, 1);
      item.material.uniforms.uRevealSides.value = sideReveal;
      item.material.uniforms.uRevealSpreadSides.value = sideSpreadReveal;
      item.material.uniforms.uMouseFactor.value = this.mouseFactor;
      item.material.uniforms.tMouseSim2.value = this.screenMouseSimulationTexture;
    });
  }

  private p1UpdateCullingProbe() {
    const items = this.workItems.map((item) => {
      const world = new Vector3();
      item.group.getWorldPosition(world);
      const culledBySourceBounds = world.x > 5.5 || world.x < -5.5 || world.z > 5;
      return {
        slug: item.slug,
        world: world.toArray(),
        visible: item.group.visible,
        culledBySourceBounds,
        sourceVisibilityMatches: item.group.visible === !culledBySourceBounds,
        revealSides: item.material.uniforms.uRevealSides.value,
        revealSpreadSides: item.material.uniforms.uRevealSpreadSides.value,
        revealSidesInSourceRange: item.material.uniforms.uRevealSides.value >= 0 && item.material.uniforms.uRevealSides.value <= 1,
        revealSpreadSidesInSourceRange:
          item.material.uniforms.uRevealSpreadSides.value >= 0 && item.material.uniforms.uRevealSpreadSides.value <= 1,
        sourceGAUpdateMode: "source-GA-update-material-then-local-Ka-then-bindings-before-p1-side-reveal",
        uCoords: item.material.uniforms.uCoords.value.toArray(),
        uCoordsMatchesWorkTarget:
          item.material.uniforms.uCoords.value.x === this.workRawTarget.width
          && item.material.uniforms.uCoords.value.y === this.workRawTarget.height,
        mousePlaneTimeMatchesMaterialTime:
          item.mousePlane.material.uniforms.uTime.value === item.material.uniforms.uTime.value,
        tDisplacementIsWavves: item.material.uniforms.tDisplacement.value === this.displacementTarget.texture,
        uMouseSpeedMatchesLocal: item.material.uniforms.uMouseSpeed.value === item.mouseSpeed,
        tMouseSim2IsScreen: item.material.uniforms.tMouseSim2.value === this.screenMouseSimulationTexture,
        tMouseSimIsLocal: item.material.uniforms.tMouseSim.value === (item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder),
      };
    });
    const visible = items.filter((item) => item.visible);
    return {
      source: "p1.update-world-position-cull-then-visible-block-update",
      bounds: {
        minX: -5.5,
        maxX: 5.5,
        maxZ: 5,
      },
      total: items.length,
      visibleCount: visible.length,
      culledCount: items.length - visible.length,
      sourceVisibilityAllMatch: items.every((item) => item.sourceVisibilityMatches),
      visibleUpdateShapeAllMatch: visible.every((item) =>
        item.revealSidesInSourceRange
        && item.revealSpreadSidesInSourceRange,
      ),
      items,
    };
  }

  private resizeAuxiliaryBlocks(width: number, height: number, dpr: number) {
    const updateTracked = (item?: AuxiliaryBlockItem) => {
      if (!item) return;
      item.material.uniforms.uCoords.value.set(Math.round(width * dpr), Math.round(height * dpr));
      if (!item.track) return;
      const rect = item.track.getBoundingClientRect();
      item.bounds = rect;
      item.offset.set(
        (-width / 2 + rect.width / 2 + rect.left) * item.trackScaleF,
        (height / 2 - rect.height / 2 - (rect.top + window.scrollY)) * item.trackScaleF,
      );
      item.group.scale.setScalar(rect.width * item.trackScaleF);
    };
    updateTracked(this.aboutBlocks);
    updateTracked(this.floatingBlocks);
  }

  private updateAuxiliaryBlocks(time: number, delta: number) {
    const updateShared = (item?: AuxiliaryBlockItem) => {
      if (!item?.group.visible) return;
      item.material.uniforms.uTime.value = time;
      item.material.uniforms.tDisplacement.value = this.displacementTarget.texture;
      item.material.uniforms.tMouseSim2.value = this.screenMouseSimulationTexture;
      item.group.position.x = item.offset.x + item.translation.x;
      item.group.position.y = item.offset.y + item.translation.y + (window.innerWidth >= BREAKPOINT_LG ? window.scrollY : 0) * item.trackScaleF;
    };
    updateShared(this.aboutBlocks);
    if (this.aboutBlocks?.group.visible) {
      this.aboutBlocks.material.uniforms.uScrollOpacity.value =
        window.innerWidth >= BREAKPOINT_LG ? 1 : MathUtils.clamp(1 - window.scrollY / Math.max(1, window.innerHeight * 0.25), 0, 1);
      this.updateAboutSpotlight();
    }
    const item = this.floatingBlocks;
    if (!item?.group.visible) return;
    updateShared(item);
    const scrollVelocity = window.scrollY - this.auxiliaryScrollLast;
    this.auxiliaryScrollLast = window.scrollY;
    item.translationZ += 0.005 * Math.abs(scrollVelocity);
    const dummy = new Object3D();
    const xNum = item.gridSize.x;
    const yNum = item.gridSize.y;
    const zNum = item.gridSize.z;
    const cell = 0.5 + 0.3;
    const width = (xNum - 1) * cell;
    const height = (yNum - 1) * cell;
    const depthRange = 500;
    let index = 0;
    for (let z = 0; z < zNum; z++) {
      for (let x = 0; x < xNum; x++) {
        for (let y = 0; y < yNum; y++) {
          const px = x * cell - width / 2;
          const py = y * cell - height / 2;
          const colorSeed = item.colors[index * 3] || 0;
          let pz = z * (cell + depthRange * colorSeed) + colorSeed * depthRange - depthRange / 2;
          pz -= time * MathUtils.clamp((item.colors[index * 2] || colorSeed) * 15, 5, 50);
          pz -= item.translationZ;
          pz = ((pz % (depthRange / 2)) + depthRange / 2) % (depthRange / 2) + 10;
          if (px > -3.5 && px < 3.5 && py < 5) dummy.position.set(-10000, -10000, -10000);
          else dummy.position.set(px, py, pz);
          dummy.updateMatrix();
          item.mesh.setMatrixAt(index, dummy.matrix);
          index++;
        }
      }
    }
    item.mesh.instanceMatrix.needsUpdate = true;
  }

  private updateMouseBrush(
    material: ShaderMaterial,
    scene: Scene,
    targets: WebGLRenderTarget[],
    currentIndex: number,
    oldPos: Vector2,
    newPos: Vector2,
    targetPos: Vector2,
    time: number,
    delta: number,
    strength: number,
    persistance: number,
    thickness: number,
  ) {
    newPos.lerp(targetPos, delta * 7.5);
    const speed = sourceRound(newPos.distanceTo(oldPos));
    const outputIndex = 1 - currentIndex;
    material.uniforms.uTexture.value = targets[currentIndex].texture;
    material.uniforms.uPosNew.value.copy(newPos);
    material.uniforms.uPosOld.value.copy(oldPos);
    material.uniforms.uSpeed.value = Math.max(speed, 0.0001);
    material.uniforms.uPersistance.value = Math.pow(persistance, delta * 10);
    material.uniforms.uThickness.value = thickness * strength;
    material.uniforms.uTime.value = time;
    this.renderer.setRenderTarget(targets[outputIndex]);
    this.renderer.render(scene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    oldPos.copy(newPos);
    return { speed, index: outputIndex };
  }

  private updateScreenMouseSimulation(time: number, delta: number) {
    if (!this.renderSettings.mousesim.enabled) return;
    const screenResult = this.updateMouseBrush(
      this.screenMouseSimulationMaterial,
      this.screenMouseSimulationScene,
      this.screenMouseSimulationTargets,
      this.screenMouseSimulationIndex,
      this.screenMouseSimOldPos,
      this.screenMouseSimNewPos,
      this.screenMouseSimTargetPos,
      time,
      delta,
      1,
      0.75,
      0.25,
    );
    this.screenMouseSimulationIndex = screenResult.index;
    this.compositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
  }

  private updateWorkSceneForNextFrame(time: number, delta: number) {
    this.environmentMaterial.customUniforms.uTime.value = time;
    this.updateHomeCamera(delta);
    if (this.spotLightParallax) {
      this.spotLight.position.x = this.homeCamera.position.x * 0.175;
      this.spotLight.position.y = (window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3) + this.homeCamera.position.y * 0.175;
    } else {
      this.updateAboutSpotlight();
    }
    this.updateVisibleWorkItems(time, delta);
    this.updateAuxiliaryBlocks(time, delta);
    this.sourcePostRenderFrame += 1;
  }

  private resizeMainFluidPass(width: number, height: number) {
    const pass = this.mainFluidPass;
    if (!pass.enabled) return;
    const fluidWidth = Math.max(1, Math.round(width));
    const fluidHeight = Math.max(1, Math.round(height));
    pass.fboSize.set(fluidWidth, fluidHeight);
    pass.cellScale.set(1 / fluidWidth, 1 / fluidHeight);
    Object.values(pass.targets).forEach((target) => target.setSize(fluidWidth, fluidHeight));
  }

  private updateMainFluidPass() {
    const pass = this.mainFluidPass;
    if (!pass.enabled) return this.fluidPlaceholder;
    const settings = this.sourceMainRenderSettings.fluid;
    const pointer = pass.pointer;
    pointer.set(
      MathUtils.clamp((this.pointerPixels.x / Math.max(1, window.innerWidth)) * 2 - 1, -1, 1),
      MathUtils.clamp(-(this.pointerPixels.y / Math.max(1, window.innerHeight)) * 2 + 1, -1, 1),
    );
    const diff = pointer.clone().sub(pass.pointerOld);
    pass.pointerOld.copy(pointer);
    pass.bounds.copy(settings.bounce ? new Vector2(0, 0) : pass.cellScale);

    pass.advectionMaterial.uniforms.velocity.value = pass.targets.main.texture;
    pass.advectionMaterial.uniforms.dt.value = settings.delta;
    this.renderer.setRenderTarget(pass.targets.velocity);
    this.renderer.render(pass.advectionScene, this.backgroundCamera);

    const cursorX = settings.cursorSize * pass.cellScale.x;
    const cursorY = settings.cursorSize * pass.cellScale.y;
    const centerX = MathUtils.clamp(pointer.x, -1 + cursorX + pass.cellScale.x * 2, 1 - cursorX - pass.cellScale.x * 2);
    const centerY = MathUtils.clamp(pointer.y, -1 + cursorY + pass.cellScale.y * 2, 1 - cursorY - pass.cellScale.y * 2);
    pass.forceMaterial.uniforms.force.value.set((diff.x / 2) * settings.mouseForce, (diff.y / 2) * settings.mouseForce);
    pass.forceMaterial.uniforms.center.value.set(centerX, centerY);
    pass.forceMaterial.uniforms.scale.value.set(settings.cursorSize, settings.cursorSize);
    this.renderer.setRenderTarget(pass.targets.velocity);
    this.renderer.render(pass.forceScene, this.backgroundCamera);

    pass.divergenceMaterial.uniforms.velocity.value = pass.targets.velocity.texture;
    pass.divergenceMaterial.uniforms.dt.value = settings.delta;
    this.renderer.setRenderTarget(pass.targets.divergence);
    this.renderer.render(pass.divergenceScene, this.backgroundCamera);

    let pressure = pass.targets.pressureA;
    let pressureNext = pass.targets.pressureB;
    for (let index = 0; index < settings.poissonIterations; index++) {
      pressure = index % 2 === 0 ? pass.targets.pressureA : pass.targets.pressureB;
      pressureNext = index % 2 === 0 ? pass.targets.pressureB : pass.targets.pressureA;
      pass.poissonMaterial.uniforms.pressure.value = pressure.texture;
      pass.poissonMaterial.uniforms.divergence.value = pass.targets.divergence.texture;
      this.renderer.setRenderTarget(pressureNext);
      this.renderer.render(pass.poissonScene, this.backgroundCamera);
    }

    pass.pressureMaterial.uniforms.pressure.value = pressureNext.texture;
    pass.pressureMaterial.uniforms.velocity.value = pass.targets.velocity.texture;
    pass.pressureMaterial.uniforms.dt.value = settings.delta;
    this.renderer.setRenderTarget(pass.targets.main);
    this.renderer.render(pass.pressureScene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    return pass.targets.main.texture;
  }

  private updateAboutSpotlight() {
    const item = this.aboutBlocks;
    if (!item?.group.visible) return;
    this.spotLight.position.set(item.group.position.x - 0.5, item.group.position.y, item.group.position.z + 4.2);
    this.spotLight.target.position.set(item.group.position.x + 1.5, item.group.position.y, item.group.position.z - 8);
  }

  private updateHomeCamera(delta: number) {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const fps = 1 / delta;
    const cameraLerp = Math.min(Math.round(2 / (fps / 60)), 2) * 0.01 || 0.01;
    this.cameraLastLerp = cameraLerp;
    this.pointerDeltaPixels.subVectors(this.pointerPixels, this.lastPointerPixels);
    this.lastPointerPixels.copy(this.pointerPixels);

    const mouseX = MathUtils.mapLinear(this.pointerPixels.x, 0, width, -1, 1);
    const mouseY = MathUtils.mapLinear(this.pointerPixels.y, 0, height, 1, -1);
    this.cameraTarget.set(
      this.cameraOrigin.x + this.cameraTargetXY.x * mouseX,
      this.cameraOrigin.y + this.cameraTargetXY.y * mouseY,
      this.cameraOrigin.z + this.cameraTargetXY.y * (mouseY * 1.25),
    );
    this.cameraControllerGroup.position.lerp(this.cameraTarget, cameraLerp);
    this.cameraControllerGroup.lookAt(this.cameraLookAt);

    const rollInput = MathUtils.mapLinear(Math.abs(this.pointerDeltaPixels.x) / width, 0, 0.02, 0, 0.5);
    const rollTarget = this.cameraRotateAngle * rollInput * Math.sign(this.pointerDeltaPixels.x);
    this.cameraRoll += (rollTarget - this.cameraRoll) * cameraLerp;
    this.cameraRotateGroup.rotation.z += (this.cameraRoll - this.cameraRotateGroup.rotation.z) * cameraLerp;
    this.cameraControllerGroup.updateMatrix();
    this.cameraRotateGroup.updateMatrix();
    this.cameraInnerGroup.updateMatrix();
    this.cameraControllerGroup.updateMatrixWorld();
    this.cameraInnerGroup.matrixWorld.decompose(
      this.homeCamera.position,
      this.homeCamera.quaternion,
      this.homeCamera.scale,
    );
  }

  private renderFloorReflection() {
    if (!this.sceneWrap.visible) return;
    const previousTarget = this.renderer.getRenderTarget();
    const previousXrEnabled = this.renderer.xr.enabled;
    const previousShadowAutoUpdate = this.renderer.shadowMap.autoUpdate;
    this.floorReflectorWorldPosition.setFromMatrixPosition(this.floorReflector.matrixWorld);
    this.floorReflectionCameraWorldPosition.setFromMatrixPosition(this.homeCamera.matrixWorld);
    this.floorReflectionRotationMatrix.extractRotation(this.floorReflector.matrixWorld);
    this.floorReflectorNormal.set(0, 0, 1);
    this.floorReflectorNormal.applyMatrix4(this.floorReflectionRotationMatrix);
    this.floorReflectionView.subVectors(this.floorReflectorWorldPosition, this.floorReflectionCameraWorldPosition);
    if (this.floorReflectionView.dot(this.floorReflectorNormal) > 0) return;
    this.floorReflectionView.reflect(this.floorReflectorNormal).negate();
    this.floorReflectionView.add(this.floorReflectorWorldPosition);
    this.floorReflectionRotationMatrix.extractRotation(this.homeCamera.matrixWorld);
    this.floorReflectionLookAtPosition.set(0, 0, -1);
    this.floorReflectionLookAtPosition.applyMatrix4(this.floorReflectionRotationMatrix);
    this.floorReflectionLookAtPosition.add(this.floorReflectionCameraWorldPosition);
    this.floorReflectionTargetPosition.subVectors(this.floorReflectorWorldPosition, this.floorReflectionLookAtPosition);
    this.floorReflectionTargetPosition.reflect(this.floorReflectorNormal).negate();
    this.floorReflectionTargetPosition.add(this.floorReflectorWorldPosition);
    this.floorReflectionCamera.position.copy(this.floorReflectionView);
    this.floorReflectionCamera.up.set(0, 1, 0);
    this.floorReflectionCamera.up.applyMatrix4(this.floorReflectionRotationMatrix);
    this.floorReflectionCamera.up.reflect(this.floorReflectorNormal);
    this.floorReflectionCamera.lookAt(this.floorReflectionTargetPosition);
    this.floorReflectionCamera.far = this.homeCamera.far;
    this.floorReflectionCamera.updateMatrixWorld();
    this.floorReflectionCamera.projectionMatrix.copy(this.homeCamera.projectionMatrix);
    this.floorReflectionMatrix.set(
      0.5, 0, 0, 0.5,
      0, 0.5, 0, 0.5,
      0, 0, 0.5, 0.5,
      0, 0, 0, 1,
    );
    this.floorReflectionMatrix.multiply(this.floorReflectionCamera.projectionMatrix);
    this.floorReflectionMatrix.multiply(this.floorReflectionCamera.matrixWorldInverse);
    this.floorReflectionMatrix.multiply(this.floorReflector.matrixWorld);
    this.floorReflectorPlane.setFromNormalAndCoplanarPoint(this.floorReflectorNormal, this.floorReflectorWorldPosition);
    this.floorReflectorPlane.applyMatrix4(this.floorReflectionCamera.matrixWorldInverse);
    this.floorReflectionClipPlane.set(
      this.floorReflectorPlane.normal.x,
      this.floorReflectorPlane.normal.y,
      this.floorReflectorPlane.normal.z,
      this.floorReflectorPlane.constant,
    );
    const projection = this.floorReflectionCamera.projectionMatrix;
    const projectionElements = projection.elements;
    this.floorReflectionQ.x = (Math.sign(this.floorReflectionClipPlane.x) + projectionElements[8]) / projectionElements[0];
    this.floorReflectionQ.y = (Math.sign(this.floorReflectionClipPlane.y) + projectionElements[9]) / projectionElements[5];
    this.floorReflectionQ.z = -1;
    this.floorReflectionQ.w = (1 + projectionElements[10]) / projectionElements[14];
    if (this.debugFloorReflection !== "no-clip") {
      this.floorReflectionClipPlane.multiplyScalar(2 / this.floorReflectionClipPlane.dot(this.floorReflectionQ));
      projectionElements[2] = this.floorReflectionClipPlane.x;
      projectionElements[6] = this.floorReflectionClipPlane.y;
      projectionElements[10] = this.floorReflectionClipPlane.z + 1 - this.floorReflectionClipBias;
      projectionElements[14] = this.floorReflectionClipPlane.w;
    }

    try {
      this.renderer.xr.enabled = false;
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.setRenderTarget(this.floorReflectionTarget);
      this.renderer.state.buffers.depth.setMask(true);
      if (!this.renderer.autoClear) this.renderer.clear();
      this.renderer.render(this.homeScene, this.floorReflectionCamera);

      if (this.debugFloorReflection === "no-blur") {
        this.floorReflectionBlurMaterial.uniforms.tMap.value = this.floorReflectionTarget.texture;
        this.floorReflectionBlurMaterial.uniforms.uDirection.value.set(0, 0);
        this.renderer.setRenderTarget(this.floorReflectionWriteTarget);
        this.renderer.render(this.floorReflectionScreen, this.floorReflectionScreenCamera);
        const swap = this.floorReflectionReadTarget;
        this.floorReflectionReadTarget = this.floorReflectionWriteTarget;
        this.floorReflectionWriteTarget = swap;
        this.updateFloorReflectionRenderTargetUniform(this.floorReflectionReadTarget.texture);
      } else {
        let readTarget = this.floorReflectionReadTarget;
        let writeTarget = this.floorReflectionWriteTarget;
        for (let iteration = 0; iteration < 2; iteration += 1) {
          this.floorReflectionBlurMaterial.uniforms.tMap.value = iteration === 0
            ? this.floorReflectionTarget.texture
            : readTarget.texture;
          const direction = (2 - iteration - 1) * 15;
          this.floorReflectionBlurMaterial.uniforms.uDirection.value.set(
            iteration % 2 === 0 ? direction : 0,
            iteration % 2 === 0 ? 0 : direction,
          );
          this.renderer.setRenderTarget(writeTarget);
          this.renderer.render(this.floorReflectionScreen, this.floorReflectionScreenCamera);
          const swap = readTarget;
          readTarget = writeTarget;
          writeTarget = swap;
          this.updateFloorReflectionRenderTargetUniform(readTarget.texture);
        }
        this.floorReflectionReadTarget = readTarget;
        this.floorReflectionWriteTarget = writeTarget;
      }
    } finally {
      this.renderer.xr.enabled = previousXrEnabled;
      this.renderer.shadowMap.autoUpdate = previousShadowAutoUpdate;
      this.renderer.setRenderTarget(previousTarget);
    }
  }

  private renderSkyTarget(time: number) {
    this.renderer.setRenderTarget(this.skyRawTarget);
    this.renderer.render(this.skyScene, this.backgroundCamera);
    this.skyCompositeMaterial.uniforms.tScene.value = this.skyRawTarget.texture;
    this.skyPostScreen.material = this.skyCompositeMaterial;
    this.renderer.setRenderTarget(this.skyCompositeTarget);
    this.renderer.render(this.skyPostScreen, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    this.skyCompositeMaterial.uniforms.uTime.value = sourceLowRes() ? 0 : time;
  }

  private renderDisplacementTarget(time: number) {
    this.renderer.setRenderTarget(this.displacementRawTarget);
    this.renderer.render(this.displacementRawScene, this.backgroundCamera);
    this.displacementMaterial.uniforms.tScene.value = this.displacementRawTarget.texture;
    this.displacementPostScreen.material = this.displacementMaterial;
    this.renderer.setRenderTarget(this.displacementTarget);
    this.renderer.render(this.displacementPostScreen, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    this.displacementMaterial.uniforms.uTime.value = time;
  }

  private renderThumbTargets() {
    this.renderer.setRenderTarget(this.thumbTarget);
    this.renderer.render(this.thumbScene, this.thumbCamera);
    this.thumbCompositeMaterial.uniforms.tScene.value = this.thumbTarget.texture;
    this.thumbPostScreen.material = this.thumbCompositeMaterial;
    this.renderer.setRenderTarget(this.thumbCompositeTarget);
    this.renderer.render(this.thumbPostScreen, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
  }

  private updateThumbProbe(time: number) {
    if (!this.debugThumbProbe || time - this.thumbProbeLastUpdate < 0.5) return;
    this.thumbProbeLastUpdate = time;
    const color = this.thumbCompositeMaterial.uniforms.uDarkenColor.value as Color;
    const probeWindow = window as ThumbProbeWindow;
    probeWindow.__rogierThumbProbe = {
      activeSlug: this.activeSlug,
      galleryProgress: this.galleryProgress,
      thumbProgress: this.thumbProgress,
      debugProgress: this.debugThumbProgress,
      sourceProgressSignMode: "source-yD-updateScene-workThumbScene-thumbs-updateGalleryProgress-negative-scroll-progress",
      sourceProgressUpdateOrder: "source-yD-sceneWrap-uTransformX-thumbProgress-before-roll-zoom",
      sourceDefaults: {
        thumbDarknessIntensity: SOURCE_INITIAL_THUMB_DARKNESS,
        homeThumbDarknessFallback: SOURCE_HOME_THUMB_DARKNESS_FALLBACK,
        thumbDarknessColor: SOURCE_INITIAL_THUMB_DARKNESS_COLOR,
        thumbSaturation: SOURCE_INITIAL_THUMB_SATURATION,
        thumbMouseLightness: SOURCE_INITIAL_THUMB_MOUSE_LIGHTNESS,
      },
      thumbPositionMode: "source-w1-centered-x-wrap",
      thumbHierarchyMode: "source-T1-w1-scrollWrap-E1-mesh",
      thumbImageOwnership: {
        mode: "source-Xt-preloadThumbs-projectThumbs-thumbsReady-E1-setImage",
        thumbsReadyResolved: this.sourceThumbsReadyResolved,
        projectThumbCount: this.sourceProjectThumbs.length,
        allProjectThumbsUseSourcePromise: this.sourceProjectThumbs.every((thumb) => thumb.bindingMode === "source-Xt-projectThumbs-src-promise"),
        webpSupport: this.sourceWebpSupport,
        assetExt: this.sourceAssetExt,
        urls: this.sourceProjectThumbs.map((thumb) => thumb.url),
        loaders: this.sourceProjectThumbs.map((thumb) => thumb.loader),
      },
      thumbWrapParentIsScene: this.thumbWrap.parent === this.thumbScene,
      thumbScrollWrapParentIsThumbWrap: this.thumbScrollWrap.parent === this.thumbWrap,
      thumbObjectMode: "source-w1-rt-object3d-scrollWrap",
      thumbWrapType: this.thumbWrap.type,
      thumbScrollWrapType: this.thumbScrollWrap.type,
      thumbWrapFrustumCulled: this.thumbWrap.frustumCulled,
      thumbSceneMode: "source-T1-square-height-target-orthographic",
      itemWidth: this.thumbItemWidth,
      totalItems: this.thumbTotalItems,
      totalWidth: this.thumbTotalItems * this.thumbItemWidth,
      offsetY: this.thumbOffsetY,
      isTransitioning: this.thumbIsTransitioning,
      visibleThumbs: this.workItems.filter((item) => item.thumb.visible).length,
      thumbs: this.workItems.map((item) => ({
        slug: item.slug,
        xHook: item.thumbXHook,
        yHook: item.thumbYHook,
        position: item.thumb.position.toArray() as [number, number, number],
        scale: item.thumb.scale.toArray() as [number, number, number],
        visible: item.thumb.visible,
        sourceInitialVisibleMode: "source-E1-no-initial-hidden-state-w1-updateGalleryProgress-owns-visible",
        sourceImageMode: item.thumb.userData.sourceThumbMode,
        sourceImageId: item.thumb.userData.sourceThumbId,
        sourceImageBound: item.thumb.userData.sourceThumbBound,
        sourceMaterialImageMode: item.thumb.material.userData.sourceThumbImageMode,
        sourceMaterialReady: item.thumb.material.userData.sourceThumbReady,
        sourceMaterialBound: item.thumb.material.userData.sourceThumbBound,
        sourceMaterialUrl: item.thumb.material.userData.sourceThumbUrl,
        sourceMaterialLoader: item.thumb.material.userData.sourceThumbLoader,
        sourceMaterialBindingMode: item.thumb.material.userData.sourceThumbBindingMode,
      })),
      thumbMaterial: (() => {
        const first = this.workItems[0]?.thumb.material as RawShaderMaterial | undefined;
        if (!first) return null;
        return {
          mode: "source-M1-raw-glsl3",
          glslVersion: first.glslVersion ?? null,
          toneMapped: first.toneMapped,
          transparent: first.transparent,
          blending: first.blending,
          depthWrite: first.depthWrite,
          depthTest: first.depthTest,
          uProgress: first.uniforms.uProgress.value as number,
          uTransitionCount: first.uniforms.uTransitionCount.value as number,
          uTransitionSmoothness: first.uniforms.uTransitionSmoothness.value as number,
          mapBound: first.uniforms.tMap.value !== this.placeholder,
          mapTexture: sourceTextureProbe(first.uniforms.tMap.value as Texture),
          mapSize: (first.uniforms.uMapSize.value as Vector2).toArray() as [number, number],
          resolution: (first.uniforms.uResolution.value as Vector2).toArray() as [number, number],
        };
      })(),
      thumbComposite: {
        mode: "source-x1-_1-raw-glsl3",
        glslVersion: this.thumbCompositeMaterial.glslVersion ?? null,
        renderManagerOwnership: "source-x1-Lo-single-screen-material-swap",
        screenMode: this.thumbPostScreen.material === this.thumbCompositeMaterial ? "source-Lo-screen-material-composite" : "non-source",
        toneMapped: this.thumbCompositeMaterial.toneMapped,
        transparent: this.thumbCompositeMaterial.transparent,
        blending: this.thumbCompositeMaterial.blending,
        depthWrite: this.thumbCompositeMaterial.depthWrite,
        depthTest: this.thumbCompositeMaterial.depthTest,
        tSceneIsThumbTarget: this.thumbCompositeMaterial.uniforms.tScene.value === this.thumbTarget.texture,
        darkness: this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value as number,
        darkenIntensity: this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value as number,
        darknessColor: [color.r, color.g, color.b],
        darkenColor: [color.r, color.g, color.b],
        saturation: this.thumbCompositeMaterial.uniforms.uSaturation.value as number,
        stateOwnership: "source-Se-settings-thumb-state-onUpdate-uniforms",
        state: {
          darknessIntensity: this.thumbState.darknessIntensity,
          darknessColor: this.thumbState.darknessColor.toArray(),
          saturation: this.thumbState.saturation,
          mouseLightness: this.thumbState.mouseLightness,
        },
        stateUniformsMatch:
          Math.abs((this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value as number) - this.thumbState.darknessIntensity) < 1e-6
          && Math.abs(color.r - this.thumbState.darknessColor.r) < 1e-6
          && Math.abs(color.g - this.thumbState.darknessColor.g) < 1e-6
          && Math.abs(color.b - this.thumbState.darknessColor.b) < 1e-6
          && Math.abs((this.thumbCompositeMaterial.uniforms.uSaturation.value as number) - this.thumbState.saturation) < 1e-6,
        mouseLightnessUniformsMatchState: this.workItems.every((item) => (
          Math.abs((item.material.uniforms.uMouseLightness.value as number) - this.thumbState.mouseLightness) < 1e-6
        )),
      },
      spotlight: {
        hasMap: this.spotLight.map === this.thumbCompositeTarget.texture,
        positionOwnershipMode: "source-direct-SpotLight-position-target-no-local-mirror",
        parallaxMode: "source-p1-spotLight-x-camera-y-desktop-or-0_3-mobile",
        parallaxYOffsetMode: window.innerWidth >= BREAKPOINT_MD
          ? "source-p1-desktop-camera-y-parallax"
          : "source-p1-mobile-0_3-plus-camera-y-parallax",
        mobileBreakpoint: BREAKPOINT_MD,
        mobileYOffset: window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3,
        intensity: this.spotLight.intensity,
        stateOwnership: "source-Se-settings-light-state-onUpdate-intensities",
        stateIntensity: this.lightState.spotLight.intensity,
        stateIntensityMatchesLight: Math.abs(this.spotLight.intensity - this.lightState.spotLight.intensity) < 1e-6,
        position: this.spotLight.position.toArray(),
        target: this.spotLight.target.position.toArray(),
        parallax: this.spotLightParallax,
        mapColorSpace: this.thumbCompositeTarget.texture.colorSpace,
        rendererOutputColorSpace: this.renderer.outputColorSpace,
      },
      targets: {
        sizingMode: "source-T1-renderManager-resize-height-height-dpr-1",
        sourceTargetMode: "source-Lo-renderTargetA-depthless-renderTargetComposite-clone",
        rawConstructionMode: "source-Lo-renderTargetA-new-depthless-stencilless",
        compositeConstructionMode: "source-Lo-renderTargetComposite-renderTargetA-clone",
        thumb: renderTargetStats(this.renderer, this.thumbTarget),
        composite: renderTargetStats(this.renderer, this.thumbCompositeTarget),
        thumbState: renderTargetProbe(this.renderer, this.thumbTarget),
        compositeState: renderTargetProbe(this.renderer, this.thumbCompositeTarget),
      },
    };
  }

  private updateOutputProbe(time: number) {
    if (!this.debugOutputProbe || time - this.outputProbeLastUpdate < 0.5) return;
    this.outputProbeLastUpdate = time;
    const rendererSize = new Vector2();
    const drawingBufferSize = new Vector2();
    this.renderer.getSize(rendererSize);
    this.renderer.getDrawingBufferSize(drawingBufferSize);
    const mouseSimProbe = this.renderSettings.mousesim.enabled
      ? renderTargetProbe(this.renderer, this.screenMouseSimulationTargets[this.screenMouseSimulationIndex])
      : null;
    const mouseSimRed = mouseSimProbe?.gridStats.mean[0] ?? 0;
    const darkenValue = this.compositeMaterial.uniforms.uDarken.value as number;
    const spotlightProjection = this.spotlightProjectionProbe();
    const mouseSimulation = this.mouseSimulationProbe(mouseSimProbe);
    const mainFluid = this.mainFluidProbe();
    const activeWorkItem = this.workItems.find((item) => item.slug === this.activeSlug) ?? this.workItems[0];
    const luminosityProbe = (material: ShaderMaterial) => ({
      blending: material.blending,
      materialMode: "source-sg-raw-glsl3",
      glslVersion: (material as RawShaderMaterial).glslVersion ?? null,
      tMapConstructorMode: "source-sg-tMap-construct-null-branch-owned-binding",
      threshold: material.uniforms.uThreshold.value,
      smoothing: material.uniforms.uSmoothing.value,
    });
    const bloomBlurProbe = (materials: ShaderMaterial[]) => ({
      blending: materials[0]?.blending ?? null,
      materialMode: "source-rg-raw-glsl3",
      glslVersion: (materials[0] as RawShaderMaterial | undefined)?.glslVersion ?? null,
      tMapConstructorMode: "source-rg-tMap-construct-null-branch-owned-binding",
      materialCount: materials.length,
      kernelDefines: materials.map((material) => material.defines?.KERNEL_RADIUS ?? null),
      sigmaDefines: materials.map((material) => material.defines?.SIGMA ?? null),
      runtimeKernelUniforms: materials.some((material) => "uKernelRadius" in material.uniforms || "uSigma" in material.uniforms),
      resolutionResizeMode: "source-Lu-I1-rg-uResolution-resize-loop",
      resolutionUpdateMode: "source-Lu-I1-rg-update-keeps-resize-resolution",
      resolutions: materials.map((material) => (material.uniforms.uResolution.value as Vector2).toArray()),
    });
    const standardBlurProbe = (
      horizontalMaterial: ShaderMaterial,
      verticalMaterial: ShaderMaterial,
      screenMode: string,
      resizeMode: string,
    ) => ({
      horizontal: {
        blending: horizontalMaterial.blending,
        materialMode: "source-Na-raw-glsl3",
        glslVersion: (horizontalMaterial as RawShaderMaterial).glslVersion ?? null,
        tMapConstructorMode: "source-Na-tMap-construct-null-branch-owned-binding",
        screenMode,
        resizeMode,
        hasBlurinessUniform: "uBluriness" in horizontalMaterial.uniforms,
        hasKernelDefines: Boolean(horizontalMaterial.defines?.KERNEL_RADIUS || horizontalMaterial.defines?.SIGMA),
        direction: (horizontalMaterial.uniforms.uDirection.value as Vector2).toArray(),
        resolution: (horizontalMaterial.uniforms.uResolution.value as Vector2).toArray(),
        bluriness: horizontalMaterial.uniforms.uBluriness.value,
        blurinessUpdateMode: "source-Na-uBluriness-init-zero-no-update-write",
      },
      vertical: {
        blending: verticalMaterial.blending,
        materialMode: "source-Na-raw-glsl3",
        glslVersion: (verticalMaterial as RawShaderMaterial).glslVersion ?? null,
        tMapConstructorMode: "source-Na-tMap-construct-null-branch-owned-binding",
        screenMode,
        resizeMode,
        hasBlurinessUniform: "uBluriness" in verticalMaterial.uniforms,
        hasKernelDefines: Boolean(verticalMaterial.defines?.KERNEL_RADIUS || verticalMaterial.defines?.SIGMA),
        direction: (verticalMaterial.uniforms.uDirection.value as Vector2).toArray(),
        resolution: (verticalMaterial.uniforms.uResolution.value as Vector2).toArray(),
        bluriness: verticalMaterial.uniforms.uBluriness.value,
        blurinessUpdateMode: "source-Na-uBluriness-init-zero-no-update-write",
      },
    });
    const fxaaProbe = (material: ShaderMaterial, screenMode: string, resizeMode: string) => ({
      blending: material.blending,
      materialMode: "source-ig-raw-glsl3",
      glslVersion: (material as RawShaderMaterial).glslVersion ?? null,
      vertexMode: "source-FT-neighbor-uv",
      tMapConstructorMode: "source-ig-tMap-construct-null-branch-owned-binding",
      screenMode,
      resizeMode,
      resolution: (material.uniforms.uResolution.value as Vector2).toArray(),
    });
    const c1Uniforms = this.preCompositeMaterial.uniforms;
    const c1UniformKeys = Object.keys(c1Uniforms);
    const probeWindow = window as OutputProbeWindow;
    probeWindow.__rogierOutputProbe = {
      activeSlug: this.activeSlug,
      bodyClass: document.body.className,
      sourceDefaults: {
        darken: SOURCE_INITIAL_DARKEN,
        saturation: SOURCE_INITIAL_SATURATION,
        contrast: SOURCE_INITIAL_CONTRAST,
        homeOverviewDarkenFallback: SOURCE_HOME_OVERVIEW_DARKEN_FALLBACK,
        homeOverviewSaturationFallback: SOURCE_HOME_OVERVIEW_SATURATION_FALLBACK,
        projectDetailDarken: SOURCE_PROJECT_DETAIL_DARKEN,
        projectSaturationFallback: SOURCE_PROJECT_SATURATION_FALLBACK,
        projectContrastFallback: SOURCE_PROJECT_CONTRAST_FALLBACK,
        thumbDarknessIntensity: SOURCE_INITIAL_THUMB_DARKNESS,
        homeThumbDarknessFallback: SOURCE_HOME_THUMB_DARKNESS_FALLBACK,
        thumbDarknessColor: SOURCE_INITIAL_THUMB_DARKNESS_COLOR,
        thumbSaturation: SOURCE_INITIAL_THUMB_SATURATION,
        thumbMouseLightness: SOURCE_INITIAL_THUMB_MOUSE_LIGHTNESS,
      },
      renderer: {
        outputColorSpace: this.renderer.outputColorSpace,
        toneMapping: this.renderer.toneMapping,
        autoClear: this.renderer.autoClear,
        pixelRatio: this.renderer.getPixelRatio(),
        dprPolicy: {
          devicePixelRatio: window.devicePixelRatio || 1,
          sourceMaxDpr: SOURCE_MAX_DPR,
          sourceLowResMaxDpr: SOURCE_LOW_RES_MAX_DPR,
          sourceWorkMaxDpr: SOURCE_WORK_MAX_DPR,
          globalDpr: sourceDpr(),
          workDpr: sourceWorkDpr(),
          lowRes: sourceLowRes(),
        },
        size: { width: rendererSize.x, height: rendererSize.y },
        drawingBufferSize: { width: drawingBufferSize.x, height: drawingBufferSize.y },
      },
      camera: {
        position: this.homeCamera.position.toArray(),
        quaternion: this.homeCamera.quaternion.toArray(),
        origin: this.cameraOrigin.toArray(),
        resizeMode: "source-p1-mobile-origin-sceneWrap",
        breakpointMd: BREAKPOINT_MD,
        mobileResizeBranch: window.innerWidth < BREAKPOINT_MD,
        controllerMode: "source-IT-three-group-matrix-decompose",
        controllerObjectMode: "source-IT-rt-object3d-containers",
        controllerObjectTypes: {
          group: this.cameraControllerGroup.type,
          rotateGroup: this.cameraRotateGroup.type,
          innerGroup: this.cameraInnerGroup.type,
        },
        mouseInitialMode: "source-IT-documentElement-center",
        updateLerpMode: "source-IT-min-Fn-2-over-fps60-0-2-times-0_01",
        updateTargetMode: "source-IT-origin-plus-targetXY-and-y-z-depth-coupling",
        entrySettingsMode: "source-SD-yD-targetXY-1-0_5-rotateAngle-20",
        matrixMode: "source-IT-group-rotateGroup-innerGroup-manual-matrices",
        mouseEventMode: "source-Pe-window-mousemove-only",
        mouseNormalizationMode: "source-Pe-gl-root-width-height",
        lastLerp: this.cameraLastLerp,
        mousePixels: this.pointerPixels.toArray(),
        pointerRay: this.pointerRay.toArray(),
        smoothedPointer: this.pointer.toArray(),
        lastMousePixels: this.lastPointerPixels.toArray(),
        mouseDeltaPixels: this.pointerDeltaPixels.toArray(),
        target: this.cameraTarget.toArray(),
        controllerPosition: this.cameraControllerGroup.position.toArray(),
        controllerRotation: [
          this.cameraControllerGroup.rotation.x,
          this.cameraControllerGroup.rotation.y,
          this.cameraControllerGroup.rotation.z,
        ],
        rotateGroupRotation: [
          this.cameraRotateGroup.rotation.x,
          this.cameraRotateGroup.rotation.y,
          this.cameraRotateGroup.rotation.z,
        ],
        targetXY: this.cameraTargetXY.toArray(),
        lookAt: this.cameraLookAt.toArray(),
        rotateAngle: MathUtils.radToDeg(this.cameraRotateAngle),
        sceneWrapY: this.sceneWrap.position.y,
      },
      settings: {
        passOrder: this.debugPassOrder === "raw-work-composite" ? "raw-work-composite" : "source-work-composite",
        diagnostics: {
          floor: this.debugFloor,
          floorReflection: this.debugFloorReflection,
          environment: this.debugEnvironment,
          productionDebugClean: !this.debugFloor && !this.debugFloorReflection && !this.debugEnvironment,
        },
        work: {
          bloom: this.renderSettings.bloom,
          luminosity: this.renderSettings.luminosity,
          blur: this.renderSettings.blur,
          mousesim: this.renderSettings.mousesim,
          fluid: this.renderSettings.fluid,
          renderManagerSizing: {
            primaryDepthBuffer: this.workRawTarget.depthBuffer,
            renderTargetSize: { width: this.workRawTarget.width, height: this.workRawTarget.height },
            bloomStart: this.workBloomHorizontalTargets[0]
              ? { width: this.workBloomHorizontalTargets[0].width, height: this.workBloomHorizontalTargets[0].height }
              : null,
            bloomStartMode: "source-Lu-Fa-render-size-div-4",
            bloomPassClearing: "source-Lu-no-explicit-clear",
            dprMode: "source-p1-resize-min-Pe-dpr-1.5",
            mouseSimScale: SCREEN_MOUSE_SIM_SCALE,
          },
          renderTargetState: sourceRenderTargetStateBoard({
            renderTargetA: this.workRawTarget,
            renderTargetB: this.workTargetB,
            renderTargetBright: this.workBloomBrightTarget,
            renderTargetsHorizontal0: this.workBloomHorizontalTargets[0],
            renderTargetsVertical0: this.workBloomVerticalTargets[0],
            renderTargetComposite: this.workCompositeTarget,
            renderTargetBlurA: this.workBlurTargetA,
            renderTargetBlurB: this.workBlurTargetB,
            renderTargetFXAA: this.workFxaaTarget,
          }, "source-Lu-target-state-renderTargetA-depthBuffer-true-derived-clones", "source-Lu-renderTargetA-clone-graph-depth-toggle-after-clones"),
          renderManagerClearing: {
            rawPass: "source-Lu-no-explicit-clear",
            blurPass: "source-Lu-no-explicit-clear",
            compositePass: "source-Lu-no-explicit-clear",
          },
          renderManagerOwnership: {
            source: "Lu-single-screen-mesh-material-swap",
            bridge: "source-single-screen-material-swap",
            compositeScreenMode: "source-work-post-screen",
            sourceCompositeRender: "o.setRenderTarget(h),o.render(this.screen,this.screenCamera)",
            sourceFinalTargetReset: "source-Lu-renderToScreen-false-renderTargetComposite-then-null",
            productionOutputChanged: true,
          },
          renderManagerPassInputs: {
            blurSource: "source-Lu-renderTargetA-to-renderTargetBlurA-then-renderTargetBlurB",
            luminositySource: "source-Lu-renderTargetBlurB-if-blur-else-renderTargetA",
            bloomSource: "source-Lu-renderTargetBright-if-luminosity-else-renderTargetA",
            oaSceneSource: "source-Lu-renderTargetBlurB-if-blur-else-renderTargetA",
            blurinessUpdateMode: "source-Na-uBluriness-init-zero-no-update-write",
          },
          activeProjectRevealOwnership: "source-yD-onProjectActive-uReveal-only-uRevealProject-owned-by-gallery-enter-out",
          activeProjectRevealTweenCount: this.projectRevealTweens.length,
          revealProjectTweenCount: this.projectRevealProjectTweens.length,
          lightStateOwnership: {
            mode: "source-Se-settings-light-state-onUpdate-intensities",
            state: {
              directionalLight: this.lightState.directionalLight.intensity,
              directionalLight2: this.lightState.directionalLight2.intensity,
              spotLight: this.lightState.spotLight.intensity,
            },
            matchesLights:
              Math.abs(this.directionalLight.intensity - this.lightState.directionalLight.intensity) < 1e-6
              && Math.abs(this.directionalLight2.intensity - this.lightState.directionalLight2.intensity) < 1e-6
              && Math.abs(this.spotLight.intensity - this.lightState.spotLight.intensity) < 1e-6,
          },
          p1UpdateCulling: this.p1UpdateCullingProbe(),
          activeMaterial: activeWorkItem ? {
            color: activeWorkItem.material.color.toArray(),
            emissive: activeWorkItem.material.emissive.toArray(),
            emissiveIntensity: activeWorkItem.material.emissiveIntensity,
            envMapIntensity: activeWorkItem.material.envMapIntensity,
            roughness: activeWorkItem.material.roughness,
            metalness: activeWorkItem.material.metalness,
            toneMapped: activeWorkItem.material.toneMapped,
            transparent: activeWorkItem.material.transparent,
            depthWrite: activeWorkItem.material.depthWrite,
            depthTest: activeWorkItem.material.depthTest,
            dithering: activeWorkItem.material.dithering,
            type: activeWorkItem.material.type,
            isMeshStandardMaterial: activeWorkItem.material.isMeshStandardMaterial === true,
            isMeshPhysicalMaterial: "isMeshPhysicalMaterial" in activeWorkItem.material
              ? (activeWorkItem.material as MeshStandardMaterial & { isMeshPhysicalMaterial?: boolean }).isMeshPhysicalMaterial === true
              : false,
            hasPhysicalDefine: Object.hasOwn(activeWorkItem.material.defines ?? {}, "PHYSICAL"),
            physicalBranchMode: "source-VA-standard-material-PHYSICAL-inactive",
          } : null,
          materialStateMode: "source-VA-meshstandard-default-toneMapped",
          vertexWorldPositionMode: "source-HA-unconditional-instance-world",
          auxiliaryMaterial: this.aboutBlocks ? {
            toneMapped: this.aboutBlocks.material.toneMapped,
            transparent: this.aboutBlocks.material.transparent,
            depthWrite: this.aboutBlocks.material.depthWrite,
            depthTest: this.aboutBlocks.material.depthTest,
            dithering: this.aboutBlocks.material.dithering,
            envMapIntensity: this.aboutBlocks.material.envMapIntensity,
            roughness: this.aboutBlocks.material.roughness,
            metalness: this.aboutBlocks.material.metalness,
          } : null,
        },
        main: {
          gpuTier: sourceGpuTier(),
          bloom: this.sourceMainRenderSettings.bloom,
          luminosity: this.sourceMainRenderSettings.luminosity,
          blur: this.sourceMainRenderSettings.blur,
          mousesim: this.sourceMainRenderSettings.mousesim,
          fluid: this.sourceMainRenderSettings.fluid,
          renderManagerSizing: {
            primaryDepthBuffer: this.mainRawTarget.depthBuffer,
            renderTargetSize: { width: this.mainRawTarget.width, height: this.mainRawTarget.height },
            bloomStart: this.mainBloomHorizontalTargets[0]
              ? { width: this.mainBloomHorizontalTargets[0].width, height: this.mainBloomHorizontalTargets[0].height }
              : null,
            bloomStartMode: "source-I1-Fa-render-size-div-2",
            bloomPassClearing: "source-Lu-no-explicit-clear",
            fluidSizeMode: "source-I1-Fa-render-size-div-2-then-div-3",
            dprMode: "source-Pe-dpr-global",
          },
          renderTargetState: sourceRenderTargetStateBoard({
            renderTargetA: this.mainRawTarget,
            renderTargetB: this.backgroundTarget,
            renderTargetLensflare: this.mainLensflareTarget,
            renderTargetBright: this.mainBloomBrightTarget,
            renderTargetsHorizontal0: this.mainBloomHorizontalTargets[0],
            renderTargetsVertical0: this.mainBloomVerticalTargets[0],
            renderTargetComposite: this.compositeTarget,
            renderTargetBlurA: this.mainBlurTargetA,
            renderTargetBlurB: this.mainBlurTargetB,
            renderTargetFXAA: this.mainFxaaTarget,
          }, "source-I1-target-state-renderTargetA-depthBuffer-false-derived-clones", "source-I1-renderTargetA-clone-graph-depthless-raw"),
          renderManagerClearing: {
            frameStart: "source-nD-no-explicit-clear",
            preCompositePass: "source-I1-no-explicit-clear",
            lensflarePass: "source-I1-lensflare-explicit-clear",
            blurPass: "source-I1-no-explicit-clear",
            fxaaPass: "source-I1-no-explicit-clear",
          },
          renderManagerOwnership: {
            source: "I1-single-screen-mesh-material-swap",
            bridge: "source-single-screen-material-swap",
            finalScreenMode: "source-main-post-screen",
            optionalBlurScreenMode: "source-I1-mainPostScreen-material-swap",
            lensflareScreenMode: "source-I1-mainPostScreen-material-swap",
            sourceFinalRender: "settings.renderToScreen -> setRenderTarget(null), render(this.screen,this.screenCamera)",
            defaultScreenMaterialMode: "source-I1-default-direct-C1-screen-render-fxaa-tail-only",
            preCompositeTargetRole: "source-I1-renderTargetComposite-unused-in-default-renderToScreen",
            defaultRenderToScreenWritesCompositeTarget: false,
            productionOutputChanged: false,
          },
          renderManagerPassInputs: {
            blurSource: "source-I1-renderTargetA-to-renderTargetBlurA-then-renderTargetBlurB",
            lensflareSource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
            luminositySource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
            bloomSource: "source-I1-renderTargetBright-if-luminosity-else-renderTargetA",
            c1SceneSource: "source-I1-renderTargetBlurB-if-blur-else-renderTargetA",
            c1BloomSource: "source-I1-renderTargetsHorizontal0",
            noPostC1Bloom: true,
          },
          mainRawSceneMode: "source-U1-empty-main-scene-background-D9D9D9-linear-to-srgb",
          mainRawCameraMode: "source-yg-perspective-distance-1000-no-camera-controller",
          mainRawRenderCamera: "source-U1-I1-renderTargetA-uses-yg-camera",
          mainRawCamera: {
            fov: this.mainCamera.fov,
            aspect: this.mainCamera.aspect,
            near: this.mainCamera.near,
            far: this.mainCamera.far,
            position: this.mainCamera.position.toArray(),
            distance: this.mainCameraDistance,
          },
          mainRawSceneBackground: this.mainScene.background instanceof Color ? this.mainScene.background.toArray() : null,
        },
        updateOrder: {
          source: this.sourceUpdateOrder,
          sourceSceneOrder: ["sky", "media", "work", "main", "workthumb", "wavves", "character"],
          rebuildSceneOrder: ["sky", "media", "work", "main", "workthumb", "wavves", "character"],
          rebuildFrameOrder: ["media-position", "sky", "media", "work-raw", "work-bloom", "work-mousesim", "work-composite", "p1-post-render", "main-raw", "main-blur", "main-lensflare", "main-luminosity", "main-bloom", "main-fluid", "main-C1", "main-final-screen", "workthumb", "wavves", "character-when-about"],
          workUpdateOrder: ["Lu.renderManager.raw", "Lu.renderManager.bloom", "Ka.mouseSimulation", "Lu.renderManager.composite", "IT.cameraController", "p1.components"],
          mainUpdateOrder: ["I1.raw", "I1.optional-blur", "I1.optional-lensflare", "I1.optional-luminosity", "I1.optional-bloom", "I1.fluid", "I1.C1-screen"],
          mainCompositeUpdateOrder: "source-U1-super-update-renders-I1-before-C1-update",
          frameTail: "source-work-renderManager-then-p1-update-before-main",
          mouseSimulationOrder: "source-Lu-mousesim-after-raw-bloom-before-composite",
          postRenderFrame: this.sourcePostRenderFrame,
          environmentUpdateOrder: "source-p1-component-post-render",
          skyPassClearing: "source-Lo-no-explicit-clear",
          skyUpdateMode: "source-V1-low-res-freezes-time",
          skyEnvironmentBinding: "source-nD-resize-delay-then-repeat-composite-bind",
          preloadGate: "source-nD-await-blueNoise-floorNormal-perlin1-perlin2-before-animate-in",
          animateInMode: "source-nD-animateIn-awaits-init-and-four-preloaded-textures",
          animateInStarted: this.canvasAnimateInStarted,
          animateInResolvedMode: "source-nD-animateIn-resolves-after-fade-scheduled",
          canvasFadeCompleted: this.canvasFadeCompleted,
          sourceWebpDetectionMode: "source-Qe-k0-lossy-before-Xt-and-p1-assets",
          sourceWebpSupport: this.sourceWebpSupport,
          sourceAssetExt: this.sourceAssetExt,
          sourceTexturePreloadState: { ...this.sourceTexturePreloadState },
          sourceTexturePreloadComplete: Object.values(this.sourceTexturePreloadState).every(Boolean),
        },
      },
      uniforms: {
        preComposite: {
          materialMode: "source-C1-raw-glsl3",
          vertexMode: "source-D1-matrix-fullscreen",
          glslVersion: (this.preCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
          blending: this.preCompositeMaterial.blending,
          tSceneSourceMode: "source-I1-renderTargetA-raw-main-scene",
          tSceneIsMainRawTarget: this.preCompositeMaterial.uniforms.tScene.value === this.mainRawTarget.texture,
          tSceneIsCompositeTarget: this.preCompositeMaterial.uniforms.tScene.value === this.compositeTarget.texture,
          uBgColor: (this.preCompositeMaterial.uniforms.uBgColor.value as Color).toArray(),
          uTime: this.preCompositeMaterial.uniforms.uTime.value,
          uTimeUpdateOrder: "source-U1-C1-update-after-I1-render",
          uContrast: this.preCompositeMaterial.uniforms.uContrast.value,
          uFluidStrength: this.preCompositeMaterial.uniforms.uFluidStrength.value,
          uMediaReveal: this.preCompositeMaterial.uniforms.uMediaReveal.value,
          lensflareEnabled: SOURCE_MAIN_LENSFLARE_SETTINGS.enabled,
          lensflareTargetSize: {
            width: this.mainLensflareTarget.width,
            height: this.mainLensflareTarget.height,
          },
          boolBloom: this.preCompositeMaterial.uniforms.boolBloom.value,
          boolFluid: this.preCompositeMaterial.uniforms.boolFluid.value,
          boolLuminosity: this.preCompositeMaterial.uniforms.boolLuminosity.value,
          materialUniformSurface: {
            mode: "source-C1-constructor-uniform-order-with-unused-tPortal",
            resizeMode: "source-U1-C1-resize-css-width-height",
            sourceUniformKeys: [...SOURCE_C1_UNIFORM_KEYS],
            uniformKeys: c1UniformKeys,
            matchesSourceOrder: c1UniformKeys.length === SOURCE_C1_UNIFORM_KEYS.length
              && SOURCE_C1_UNIFORM_KEYS.every((key, index) => c1UniformKeys[index] === key),
            hasTPortalUniform: Object.hasOwn(c1Uniforms, "tPortal"),
            samplerConstructorMode: "source-C1-sampler-uniforms-construct-null-branch-owned-bindings",
            tBloomBindingMode: "source-I1-bloom-branch-only",
            tBloomIsNullWhenDisabled: !this.sourceMainRenderSettings.bloom.enabled && c1Uniforms.tBloom.value === null,
            tBloomIsMainBloomTargetWhenEnabled:
              this.sourceMainRenderSettings.bloom.enabled
              && c1Uniforms.tBloom.value === this.mainBloomHorizontalTargets[0]?.texture,
            tPortalBindingMode: "source-C1-material-uniform-A1-unused-constructor-null",
            tPortalIsSourceNull: c1Uniforms.tPortal.value === null,
            tBlurBindingMode: "source-C1-constructor-null-A1-unused",
            tBlurIsSourceNull: c1Uniforms.tBlur.value === null,
            tFluidBindingMode: "source-I1-fluid-branch-when-enabled-else-constructor-null",
            tFluidIsNullWhenDisabled: !this.sourceMainRenderSettings.fluid.enabled && c1Uniforms.tFluid.value === null,
            tFluidIsMainFluidTargetWhenEnabled:
              this.sourceMainRenderSettings.fluid.enabled
              && c1Uniforms.tFluid.value === this.mainFluidPass.targets.main.texture,
            tWorkBindingMode: "source-nD-init-one-time-C1-tWork-work-renderTargetComposite",
            tWorkIsWorkCompositeTarget: c1Uniforms.tWork.value === this.workCompositeTarget.texture,
            tWorkIsWorkRawTarget: c1Uniforms.tWork.value === this.workRawTarget.texture,
            tMediaBindingMode: "source-nD-init-one-time-C1-tMedia-media-renderTargetComposite",
            tMediaIsMediaCompositeTarget: c1Uniforms.tMedia.value === this.mediaTarget.texture,
            tMouseSimBindingMode: "source-nD-init-one-time-C1-tMouseSim-initial-work-mousesim-output",
            tMouseSimIsInitialScreenMouseTarget: c1Uniforms.tMouseSim.value === this.screenMouseSimulationTargets[0]?.texture,
            tMouseSimIsCurrentScreenMouseTarget: c1Uniforms.tMouseSim.value === this.screenMouseSimulationTexture,
            screenMouseSimulationIndex: this.screenMouseSimulationIndex,
            tPerlinIsLoadedTexture: c1Uniforms.tPerlin.value === this.perlinTexture,
            uDisplacementSizeMode: "source-C1-constructor-default-new-Vector2-no-runtime-write",
            uDisplacement: c1Uniforms.uDisplacement.value,
            uPerlin: c1Uniforms.uPerlin.value,
            uDisplacementSize: (c1Uniforms.uDisplacementSize.value as Vector2).toArray(),
            uContainerSize: (c1Uniforms.uContainerSize.value as Vector2).toArray(),
          },
          shaderSurface: {
            hasSourceSaturationHelper: homePreCompositeFragment.includes("vec3 saturation(vec3 rgb, float adjustment)"),
            hasSourceVignetteHelper: homePreCompositeFragment.includes("float vignette(vec2 coords"),
            hasSourceCircleHelper: homePreCompositeFragment.includes("vec3 circle(vec2 uv"),
            hasSourceContrastHelper: homePreCompositeFragment.includes("vec3 contrast(vec3 color, float value)"),
            hasSourceHueHelper: homePreCompositeFragment.includes("vec3 hue(vec3 color, float hue)"),
            hasSourceRgbshiftHelper: homePreCompositeFragment.includes("vec4 rgbshift(sampler2D image"),
            helperOrderMode: homePreCompositeFragment.indexOf("vec3 saturation(vec3 rgb, float adjustment)") < homePreCompositeFragment.indexOf("uniform sampler2D tScene")
              && homePreCompositeFragment.indexOf("vec4 coverTexture(sampler2D tex") < homePreCompositeFragment.indexOf("uniform sampler2D tScene")
              && homePreCompositeFragment.indexOf("uniform float uTransformX") < homePreCompositeFragment.indexOf("float random(vec2 st")
              ? "source-A1-helpers-coverTexture-before-uniforms-random-after-uniforms"
              : "rebuild-order",
            hasSourceCoverTextureTemporary: homePreCompositeFragment.includes("vec4 color = texture(tex, uv)") && homePreCompositeFragment.includes("return color;"),
            hasNoRatioVignetteBridge: !homePreCompositeFragment.includes("p.x *= uRatio"),
          },
        },
        composite: {
          materialMode: this.debugCompositeShader ? "debug-OA-raw-glsl3" : "source-OA-raw-glsl3",
          vertexMode: "source-el-matrix-fullscreen",
          glslVersion: (this.compositeMaterial as RawShaderMaterial).glslVersion ?? null,
          blending: this.compositeMaterial.blending,
          debugShaderActive: this.debugCompositeShader,
          productionShaderIsSourceSurface: !this.debugCompositeShader && !("uDebugStage" in this.compositeMaterial.uniforms),
          uDarken: darkenValue,
          uSaturation: this.compositeMaterial.uniforms.uSaturation.value,
          uDebugStage: this.compositeMaterial.uniforms.uDebugStage?.value ?? 0,
          uDebugDarkenMode: this.compositeMaterial.uniforms.uDebugDarkenMode?.value ?? 0,
          uDebugTransferMode: this.compositeMaterial.uniforms.uDebugTransferMode?.value ?? 0,
          uDebugLightenMode: this.compositeMaterial.uniforms.uDebugLightenMode?.value ?? 0,
          shaderSurface: {
            formulaMode: "source-CA-mixed-blend-surface",
            blendEntry: "source-Po-blend",
            hasLuminanceHelper: homeCompositeFragment.includes("float luminance(vec3 rgb)"),
            hasSourceSaturationHelper: homeCompositeFragment.includes("vec3 saturation(vec3 rgb, float adjustment)"),
            hasSourceVignetteHelper: homeCompositeFragment.includes("float vignette(vec2 coords"),
            hasSourceCircleHelper: homeCompositeFragment.includes("vec3 circle(vec2 uv"),
            hasSourceContrastHelper: homeCompositeFragment.includes("vec3 contrast(vec3 color, float value)"),
            hasSourceHueHelper: homeCompositeFragment.includes("vec3 hue(vec3 color, float hue)"),
            hasSourceRgbshiftHelper: homeCompositeFragment.includes("vec4 rgbshift(sampler2D image"),
            hasSourceVignetteLocals: homeCompositeFragment.includes("float vignout") && homeCompositeFragment.includes("float vignin") && homeCompositeFragment.includes("float vignfade"),
            hasInertColorLocals: homeCompositeFragment.includes("vec3 green =") && homeCompositeFragment.includes("vec3 greenLight ="),
            usesMixedVariable: homeCompositeFragment.includes("vec4 mixed = rgbshift(tScene"),
            usesSourceBlendEntry: homeCompositeFragment.includes("mixed.rgb = blend(15") && homeCompositeFragment.includes("mixed.rgb = blend(11"),
            usesRebuildSourceBlendEntry: homeCompositeFragment.includes("sourceBlend(15") || homeCompositeFragment.includes("sourceBlend(11"),
          },
          estimatedDarkenOpacityFromMouseGrid: darkenValue * 2 + mouseSimRed * 0.25 * darkenValue,
          estimatedDarkenOpacityWithoutMouse: darkenValue * 2,
          estimatedDarkenOpacityMouseOnly: mouseSimRed * 0.25 * darkenValue,
          boolBloom: this.compositeMaterial.uniforms.boolBloom.value,
          boolLuminosity: this.compositeMaterial.uniforms.boolLuminosity.value,
        },
          mainComposite: {
            blending: this.mainCompositeMaterial.blending,
            materialMode: "source-lA-raw-glsl3",
            vertexMode: "source-el-matrix-fullscreen",
            glslVersion: (this.mainCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
            hasSourceUnusedMouseSimUniform: "tMouseSim" in this.mainCompositeMaterial.uniforms,
            shaderSurface: {
              formulaMode: "source-aA-helper-surface-and-vignette-local",
              hasLuminanceHelper: mainCompositeFragment.includes("float luminance(vec3 rgb)"),
              hasSourceSaturationHelper: mainCompositeFragment.includes("vec3 saturation(vec3 rgb, float adjustment)"),
              hasSourceVignetteHelper: mainCompositeFragment.includes("float vignette(vec2 coords"),
              hasSourceCircleHelper: mainCompositeFragment.includes("vec3 circle(vec2 uv"),
              hasSourceContrastHelper: mainCompositeFragment.includes("vec3 contrast(vec3 color, float value)"),
              hasSourceHueHelper: mainCompositeFragment.includes("vec3 hue(vec3 color, float hue)"),
              hasSourceRgbshiftHelper: mainCompositeFragment.includes("vec4 rgbshift(sampler2D image"),
              hasSourceVignetteLocals: mainCompositeFragment.includes("float vignout = .55") && mainCompositeFragment.includes("float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .25);"),
              sourceUniformOrder: mainCompositeFragment.indexOf("uniform sampler2D tFluid;") < mainCompositeFragment.indexOf("uniform sampler2D tBlur;"),
            },
          },
          lensflare: {
            blending: this.mainLensflareMaterial?.blending ?? null,
            materialCreated: Boolean(this.mainLensflareMaterial),
            materialMode: this.mainLensflareMaterial ? "source-L1-raw-glsl3" : null,
            glslVersion: this.mainLensflareMaterial ? ((this.mainLensflareMaterial as RawShaderMaterial).glslVersion ?? null) : null,
            screenMode: "source-I1-mainPostScreen-material-swap",
            ownership: "source-I1-lensflareMaterial-created-only-when-enabled",
            enabled: SOURCE_MAIN_LENSFLARE_SETTINGS.enabled,
            clearMode: "source-I1-lensflare-explicit-clear",
            targetSize: {
              width: this.mainLensflareTarget.width,
              height: this.mainLensflareTarget.height,
            },
            lightPosition: this.mainLensflareMaterial ? (this.mainLensflareMaterial.uniforms.uLightPosition.value as Vector2).toArray() : null,
            scale: this.mainLensflareMaterial ? (this.mainLensflareMaterial.uniforms.uScale.value as Vector2).toArray() : null,
            exposure: this.mainLensflareMaterial?.uniforms.uExposure.value ?? null,
            clamp: this.mainLensflareMaterial?.uniforms.uClamp.value ?? null,
            resolution: this.mainLensflareMaterial ? (this.mainLensflareMaterial.uniforms.uResolution.value as Vector2).toArray() : null,
          },
        passMaterials: {
          mediaComposite: {
            blending: this.mediaCompositeMaterial.blending,
            materialMode: "source-W1-raw-glsl3",
            vertexMode: "source-el-matrix-fullscreen",
            glslVersion: (this.mediaCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
          },
          ownership: {
            source: "Lu-and-I1-each-create-owned-pass-materials-in-initRenderer",
            sourceWorkManager: "Lu/kA owns hBlurMaterial/vBlurMaterial/FxaaMaterial/luminosityMaterial/blurMaterials/BloomMaterial",
            sourceMainManager: "I1 owns hBlurMaterial/vBlurMaterial/FxaaMaterial/luminosityMaterial/lensflareMaterial?/blurMaterials/BloomMaterial",
            workMainLuminosityShared: this.workLuminosityMaterial === this.mainLuminosityMaterial,
            workMainStandardBlurShared:
              this.workBlurHorizontalMaterial === this.mainBlurHorizontalMaterial
              || this.workBlurVerticalMaterial === this.mainBlurVerticalMaterial,
            workMainFxaaShared: this.workFxaaMaterial === this.mainFxaaMaterial,
            workMainBloomBlurShared: this.bloomBlurMaterials.some((material) => this.mainBloomBlurMaterials.includes(material)),
            workMainBloomCompositeShared: this.bloomCompositeMaterial === this.mainBloomCompositeMaterial,
            allOwnedMaterialsSeparate:
              this.workLuminosityMaterial !== this.mainLuminosityMaterial
              && this.workBlurHorizontalMaterial !== this.mainBlurHorizontalMaterial
              && this.workBlurVerticalMaterial !== this.mainBlurVerticalMaterial
              && this.workFxaaMaterial !== this.mainFxaaMaterial
              && !this.bloomBlurMaterials.some((material) => this.mainBloomBlurMaterials.includes(material))
              && this.bloomCompositeMaterial !== this.mainBloomCompositeMaterial,
            workMaterialOwnership: "source-Lu-pass-materials-owned-by-work-render-manager",
            mainMaterialOwnership: "source-I1-pass-materials-owned-by-main-render-manager",
          },
          luminosity: luminosityProbe(this.mainLuminosityMaterial),
          workLuminosity: luminosityProbe(this.workLuminosityMaterial),
          mainLuminosity: luminosityProbe(this.mainLuminosityMaterial),
          bloomBlur: bloomBlurProbe(this.bloomBlurMaterials),
          bloomComposite: {
            blending: this.bloomCompositeMaterial.blending,
            materialMode: "source-cg-raw-glsl3",
            glslVersion: (this.bloomCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
            samplerConstructorMode: "source-cg-samplers-construct-null-initRenderer-binds-targets",
            uniformMode: "source-cg-tBlur-uBloomFactors",
            numMipsDefine: this.bloomCompositeMaterial.defines?.NUM_MIPS ?? null,
            ditheringDefine: this.bloomCompositeMaterial.defines?.DITHERING ?? null,
            ditheringDefinePresent: Object.hasOwn(this.bloomCompositeMaterial.defines ?? {}, "DITHERING"),
            ditheringDefineString: Object.hasOwn(this.bloomCompositeMaterial.defines ?? {}, "DITHERING")
              ? String(this.bloomCompositeMaterial.defines?.DITHERING)
              : null,
            ditheringDefineMode: "source-cg-defines-DITHERING-undefined",
            hasBloomFactorsArray: Array.isArray(this.bloomCompositeMaterial.uniforms.uBloomFactors?.value),
            hasSourceBlurUniforms: [1, 2, 3, 4, 5].every((index) => `tBlur${index}` in this.bloomCompositeMaterial.uniforms),
            hasRebuildBloomUniforms: [1, 2, 3, 4, 5].some((index) => `tBloom${index}` in this.bloomCompositeMaterial.uniforms),
            hasRebuildFactorUniforms: [1, 2, 3, 4, 5].some((index) => `uFactor${index}` in this.bloomCompositeMaterial.uniforms),
          },
          mainBloomBlur: bloomBlurProbe(this.mainBloomBlurMaterials),
          mainBloomComposite: {
            blending: this.mainBloomCompositeMaterial.blending,
            materialMode: "source-cg-raw-glsl3",
            glslVersion: (this.mainBloomCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
            samplerConstructorMode: "source-cg-samplers-construct-null-initRenderer-binds-targets",
            uniformMode: "source-cg-tBlur-uBloomFactors",
            numMipsDefine: this.mainBloomCompositeMaterial.defines?.NUM_MIPS ?? null,
            ditheringDefine: this.mainBloomCompositeMaterial.defines?.DITHERING ?? null,
            ditheringDefinePresent: Object.hasOwn(this.mainBloomCompositeMaterial.defines ?? {}, "DITHERING"),
            ditheringDefineString: Object.hasOwn(this.mainBloomCompositeMaterial.defines ?? {}, "DITHERING")
              ? String(this.mainBloomCompositeMaterial.defines?.DITHERING)
              : null,
            ditheringDefineMode: "source-cg-defines-DITHERING-undefined",
            hasBloomFactorsArray: Array.isArray(this.mainBloomCompositeMaterial.uniforms.uBloomFactors?.value),
            hasSourceBlurUniforms: [1, 2, 3, 4, 5].every((index) => `tBlur${index}` in this.mainBloomCompositeMaterial.uniforms),
            hasRebuildBloomUniforms: [1, 2, 3, 4, 5].some((index) => `tBloom${index}` in this.mainBloomCompositeMaterial.uniforms),
            hasRebuildFactorUniforms: [1, 2, 3, 4, 5].some((index) => `uFactor${index}` in this.mainBloomCompositeMaterial.uniforms),
          },
          standardBlur: standardBlurProbe(
            this.mainBlurHorizontalMaterial,
            this.mainBlurVerticalMaterial,
            "source-I1-mainPostScreen-material-swap",
            "source-I1-Na-resize-css-width-height-when-blur-enabled",
          ),
          workStandardBlur: standardBlurProbe(
            this.workBlurHorizontalMaterial,
            this.workBlurVerticalMaterial,
            "source-Lu-workPostScreen-material-swap",
            "source-Lu-Na-resize-css-width-height-when-blur-enabled",
          ),
          mainStandardBlur: standardBlurProbe(
            this.mainBlurHorizontalMaterial,
            this.mainBlurVerticalMaterial,
            "source-I1-mainPostScreen-material-swap",
            "source-I1-Na-resize-css-width-height-when-blur-enabled",
          ),
          fxaa: fxaaProbe(
            this.mainFxaaMaterial,
            "source-I1-mainPostScreen-material-swap",
            "source-I1-ig-resize-render-size-when-fxaa-enabled",
          ),
          workFxaa: fxaaProbe(
            this.workFxaaMaterial,
            "source-Lu-workPostScreen-material-swap",
            "source-Lu-ig-resize-work-render-size-when-fxaa-enabled",
          ),
          mainFxaa: fxaaProbe(
            this.mainFxaaMaterial,
            "source-I1-mainPostScreen-material-swap",
            "source-I1-ig-resize-render-size-when-fxaa-enabled",
          ),
          skyComposite: {
            blending: this.skyCompositeMaterial.blending,
            materialMode: "source-z1-raw-glsl3",
            glslVersion: (this.skyCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
            vertexMode: "source-tl-matrix-fullscreen",
            renderManagerOwnership: "source-H1-Lo-single-screen-material-swap",
            screenMode: this.skyPostScreen.material === this.skyCompositeMaterial ? "source-Lo-screen-material-composite" : "non-source",
            rawTargetMode: "source-Lo-renderTargetA-new-depthless-stencilless",
            compositeTargetMode: "source-Lo-renderTargetComposite-renderTargetA-clone",
            tSceneConstructorMode: "source-z1-tScene-construct-null-Lo-update-binds-raw",
            tSceneIsRawTarget: this.skyCompositeMaterial.uniforms.tScene.value === this.skyRawTarget.texture,
          },
          displacement: {
            blending: this.displacementMaterial.blending,
            materialMode: "source-N1-raw-glsl3",
            glslVersion: (this.displacementMaterial as RawShaderMaterial).glslVersion ?? null,
            vertexMode: "source-tl-matrix-fullscreen",
            clearMode: "source-Lo-no-explicit-clear",
            renderManagerOwnership: "source-O1-Lo-single-screen-material-swap",
            screenMode: this.displacementPostScreen.material === this.displacementMaterial ? "source-Lo-screen-material-composite" : "non-source",
            rawTargetMode: "source-Lo-renderTargetA-new-depthless-stencilless",
            compositeTargetMode: "source-Lo-renderTargetComposite-renderTargetA-clone",
            tSceneConstructorMode: "source-N1-tScene-construct-null-Lo-update-binds-raw",
            targetSize: {
              width: this.displacementTarget.width,
              height: this.displacementTarget.height,
            },
            rawTargetSize: {
              width: this.displacementRawTarget.width,
              height: this.displacementRawTarget.height,
            },
            ratio: this.displacementMaterial.uniforms.uRatio.value,
            tSceneBound: this.displacementMaterial.uniforms.tScene.value === this.displacementRawTarget.texture,
            tSceneIsRawTarget: this.displacementMaterial.uniforms.tScene.value === this.displacementRawTarget.texture,
            tSceneIsCompositeTarget: this.displacementMaterial.uniforms.tScene.value === this.displacementTarget.texture,
            vignetteConstantsMode: "source-F1-globals",
            toneMapped: this.displacementMaterial.toneMapped,
            transparent: this.displacementMaterial.transparent,
            rawSceneBackground: this.displacementRawScene.background instanceof Color ? this.displacementRawScene.background.toArray() : null,
          },
        },
        thumbComposite: {
          blending: this.thumbCompositeMaterial.blending,
        },
        floor: {
          visible: this.floorGroup.visible,
          groupPosition: this.floorGroup.position.toArray(),
          planePosition: this.floorPlane.position.toArray(),
          reflectionVisibilityMode: "source-a1-onBeforeRender-hide-component-group",
          shaderBranches: {
            map: Object.hasOwn(this.floorMaterial.defines ?? {}, "USE_MAP"),
            normalMap: Object.hasOwn(this.floorMaterial.defines ?? {}, "USE_NORMALMAP"),
            fog: Object.hasOwn(this.floorMaterial.defines ?? {}, "USE_FOG"),
            dithering: Object.hasOwn(this.floorMaterial.defines ?? {}, "DITHERING"),
          },
          uReflectivity: this.floorMaterial.uniforms.uReflectivity.value,
          uMirror: this.floorMaterial.uniforms.uMirror.value,
          uFloorMixStrength: this.floorMaterial.uniforms.uFloorMixStrength.value,
          uNormalScale: (this.floorMaterial.uniforms.uNormalScale.value as Vector2).toArray(),
          materialDefaults: {
            transparent: this.floorMaterial.transparent,
            depthWrite: this.floorMaterial.depthWrite,
            depthTest: this.floorMaterial.depthTest,
            blending: this.floorMaterial.blending,
            toneMapped: this.floorMaterial.toneMapped,
          },
          geometry: {
            mode: "source-a1-Tu-circle-geometry",
            type: this.floorPlane.geometry.type,
            radius: this.floorPlane.geometry.parameters.radius,
            segments: this.floorPlane.geometry.parameters.segments,
          },
          hierarchy: {
            mode: "source-a1-i1-rt-object3d-floorPlane-reflector",
            groupType: this.floorGroup.type,
            groupChildren: this.floorGroup.children.length,
            planeChildren: this.floorPlane.children.length,
            reflectorType: this.floorReflector.type,
            reflectorParentIsPlane: this.floorReflector.parent === this.floorPlane,
            planeParentIsGroup: this.floorPlane.parent === this.floorGroup,
            groupParentIsSceneWrap: this.floorGroup.parent === this.sceneWrap,
            groupPositionY: this.floorGroup.position.y,
            planeRotationX: this.floorPlane.rotation.x,
            planePosition: this.floorPlane.position.toArray(),
          },
          reflectionTargetSize: {
            width: this.floorReflectionTarget.width,
            height: this.floorReflectionTarget.height,
            constructionDepthBuffer: false,
            runtimeDepthBuffer: this.floorReflectionTarget.depthBuffer,
          },
          reflectionReadTargetSize: {
            width: this.floorReflectionReadTarget.width,
            height: this.floorReflectionReadTarget.height,
            constructionMode: "source-i1-renderTargetRead-cloned-before-raw-depthBuffer-toggle",
            depthBuffer: this.floorReflectionReadTarget.depthBuffer,
          },
          reflectionWriteTargetSize: {
            width: this.floorReflectionWriteTarget.width,
            height: this.floorReflectionWriteTarget.height,
            constructionMode: "source-i1-renderTargetWrite-cloned-before-raw-depthBuffer-toggle",
            depthBuffer: this.floorReflectionWriteTarget.depthBuffer,
          },
          reflectionUniformOwnership: "source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform",
          tReflectUniformShared: this.floorMaterial.uniforms.tReflect === this.floorReflectionRenderTargetUniform,
          uMatrixUniformShared: this.floorMaterial.uniforms.uMatrix === this.floorReflectionTextureMatrixUniform,
          reflectionSizing: "source-i1-css-viewport-0.75",
          reflectionExpectedCssSize: {
            width: Math.max(1, window.innerWidth * 0.75),
            height: Math.max(1, window.innerHeight * 0.75),
          },
          blurResolution: (this.floorReflectionBlurMaterial.uniforms.uResolution.value as Vector2).toArray(),
          normalMap: {
            bindingMode: "source-a1-Xt-floorNormal-repeat-45-updateMatrix",
            isLoadedTexture: this.floorMaterial.uniforms.tNormalMap.value !== this.placeholder,
            repeat: this.floorMaterial.uniforms.tNormalMap.value instanceof Texture
              ? this.floorMaterial.uniforms.tNormalMap.value.repeat.toArray()
              : null,
            matrix: this.floorMaterial.uniforms.uMapTransform.value instanceof Matrix3
              ? this.floorMaterial.uniforms.uMapTransform.value.toArray()
              : null,
            colorSpace: (this.floorMaterial.uniforms.tNormalMap.value as Texture).colorSpace,
            matrixAutoUpdate: this.floorMaterial.uniforms.tNormalMap.value instanceof Texture
              ? this.floorMaterial.uniforms.tNormalMap.value.matrixAutoUpdate
              : null,
          },
          materialMode: "source-o1-raw-glsl3",
          reflectionBlurMode: "source-t1-raw-glsl3",
          reflectionBlurTMapConstructorMode: "source-t1-tMap-construct-null-update-loop-binds",
        },
        environment: {
          visible: this.environmentGroup.visible,
          materialMode: "source-u1-meshstandard-onBeforeCompile",
          customUniformsMode: "source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias",
          hasMaterialUniformsAlias: "uniforms" in this.environmentMaterial,
          geometry: {
            mode: "source-Du-icosahedron",
            type: this.environmentPlane.geometry.type,
            radius: this.environmentPlane.geometry.parameters.radius,
            detail: this.environmentPlane.geometry.parameters.detail,
          },
          uTime: this.environmentMaterial.customUniforms.uTime.value,
          updateMode: "source-h1-material-update-only",
          speed: this.environmentSpeed,
          uMultiplier: this.environmentMaterial.customUniforms.uMultiplier.value,
          uDarken: this.environmentMaterial.customUniforms.uDarken.value,
          uDarkenColor: (this.environmentMaterial.customUniforms.uDarkenColor.value as Color).toArray(),
          tSkyIsComposite: this.environmentMaterial.customUniforms.tSky.value === this.skyCompositeTarget.texture,
          tSkySource: this.debugSkyTarget === "off" ? "placeholder" : this.debugSkyTarget === "raw" ? "raw" : "composite",
          tSkyBindingMode: "source-nD-after-init-resize-delay-bind-repeat-composite",
          tSkyWrapS: this.environmentMaterial.customUniforms.tSky.value instanceof Texture
            ? this.environmentMaterial.customUniforms.tSky.value.wrapS
            : null,
          tSkyWrapT: this.environmentMaterial.customUniforms.tSky.value instanceof Texture
            ? this.environmentMaterial.customUniforms.tSky.value.wrapT
            : null,
          skyCompositeBindingMatchesUniform: this.environmentMaterial.customUniforms.tSky.value === this.skyCompositeTarget.texture,
          shaderSurface: {
            uShader1Alpha: this.environmentMaterial.customUniforms.uShader1Alpha.value,
            uShader1Speed: this.environmentMaterial.customUniforms.uShader1Speed.value,
            uShader1Scale: this.environmentMaterial.customUniforms.uShader1Scale.value,
            uShader2Alpha: this.environmentMaterial.customUniforms.uShader2Alpha.value,
            uShader2Scale: this.environmentMaterial.customUniforms.uShader2Scale.value,
            uShader3Alpha: this.environmentMaterial.customUniforms.uShader3Alpha.value,
            uShader3Speed: this.environmentMaterial.customUniforms.uShader3Speed.value,
            uShader3Scale: this.environmentMaterial.customUniforms.uShader3Scale.value,
            uShader1Mix2: this.environmentMaterial.customUniforms.uShader1Mix2?.value ?? null,
            uShader1Mix2Binding: this.environmentMaterial.customUniforms.uShader1Mix2 ? "runtime" : "source-declared-only",
            uShader1Mix3: this.environmentMaterial.customUniforms.uShader1Mix3.value,
          },
          sceneEnvironment: this.homeScene.environment ? {
            colorSpace: this.homeScene.environment.colorSpace,
            type: this.homeScene.environment.type,
            format: this.homeScene.environment.format,
          } : null,
          sceneEnvironmentLoadMode: this.sourceCubemapLoadState.mode,
          sceneEnvironmentExt: this.sourceCubemapLoadState.ext,
          sceneEnvironmentLoaded: this.sourceCubemapLoadState.loaded,
          sceneEnvironmentFailed: this.sourceCubemapLoadState.failed,
          sceneEnvironmentUrls: [...this.sourceCubemapLoadState.urls],
          fog: this.environmentMaterial.fog,
          dithering: this.environmentMaterial.dithering,
          envMapIntensity: this.environmentMaterial.envMapIntensity,
          constructorParamsMode: "source-h1-passes-side-envMapIntensity-fog-only",
          constructorParams: this.environmentMaterial.sourceConstructorParams ?? null,
          defaultStandardParamsMode: "source-u1-does-not-apply-Qn-roughness-metalness-emissive-constants",
          roughness: this.environmentMaterial.roughness,
          metalness: this.environmentMaterial.metalness,
          emissiveIntensity: this.environmentMaterial.emissiveIntensity,
          hierarchyMode: "source-h1-rt-object3d-owns-transform",
          groupType: this.environmentGroup.type,
          rotationMode: "source-p1-demorgen-initial-adjustment-only",
          groupRotationY: this.environmentGroup.rotation.y,
          groupPositionY: this.environmentGroup.position.y,
          meshRotationY: this.environmentPlane.rotation.y,
          meshPositionY: this.environmentPlane.position.y,
          rotationY: this.environmentGroup.rotation.y,
          positionY: this.environmentGroup.position.y,
        },
      },
      targets: {
        workRaw: renderTargetProbe(this.renderer, this.workRawTarget),
        workComposite: renderTargetProbe(this.renderer, this.workCompositeTarget),
        mainRaw: renderTargetProbe(this.renderer, this.mainRawTarget),
        preComposite: renderTargetProbe(this.renderer, this.compositeTarget),
        bloomBright: renderTargetProbe(this.renderer, this.workBloomBrightTarget),
        bloom: renderTargetProbe(this.renderer, this.workBloomHorizontalTargets[0]),
        mainBloomBright: renderTargetProbe(this.renderer, this.mainBloomBrightTarget),
        mainBloom: renderTargetProbe(this.renderer, this.mainBloomHorizontalTargets[0]),
        mediaRaw: renderTargetProbe(this.renderer, this.mediaRawTarget),
        media: renderTargetProbe(this.renderer, this.mediaTarget),
        floorReflection: renderTargetProbe(this.renderer, this.floorReflectionTarget),
        floorReflectionRead: renderTargetProbe(this.renderer, this.floorReflectionReadTarget),
        skyRaw: renderTargetProbe(this.renderer, this.skyRawTarget),
        skyComposite: renderTargetProbe(this.renderer, this.skyCompositeTarget),
        displacementRaw: renderTargetProbe(this.renderer, this.displacementRawTarget),
        displacementComposite: renderTargetProbe(this.renderer, this.displacementTarget),
        thumb: renderTargetProbe(this.renderer, this.thumbTarget),
        thumbComposite: renderTargetProbe(this.renderer, this.thumbCompositeTarget),
        screenMouseSim: mouseSimProbe,
      },
      textures: {
        sourceLoadedTextureMode: "source-Xt-TextureLoader-default-sampling-wrap-only-overrides",
        sourceWebpDetectionMode: "source-Qe-k0-lossy-before-Xt-preloadTextures",
        sourceWebpSupport: this.sourceWebpSupport,
        sourceAssetExt: this.sourceAssetExt,
        noise: sourceTextureProbe(this.noiseTexture),
        skyComposite: {
          materialMode: "source-z1-raw-glsl3",
          vertexMode: "source-tl-matrix-fullscreen",
          sizingMode: "source-V1-height-0.75-square",
          rawSizingMode: "source-V1-height-0.75-square",
          bindingMode: "source-nD-after-init-resize-delay-bind-repeat-composite",
          tSceneConstructorMode: "source-z1-tScene-construct-null-Lo-update-binds-raw",
          tSceneIsRawTarget: this.skyCompositeMaterial.uniforms.tScene.value === this.skyRawTarget.texture,
          isEnvironmentSkySource: this.environmentMaterial.customUniforms.tSky.value === this.skyCompositeTarget.texture,
          backgroundMode: "source-V1-background-666666-linear-to-srgb",
          background: this.skyScene.background instanceof Color ? this.skyScene.background.toArray() : null,
          wrapMode: "source-nD-sky-composite-repeat-for-work-env",
          expectedSize: Math.max(1, Math.round(window.innerHeight * 0.75)),
          expectedRawSize: Math.max(1, Math.round(window.innerHeight * 0.75)),
          timeMode: sourceLowRes() ? "source-V1-low-res-time-0" : "source-V1-live-time",
          glslVersion: (this.skyCompositeMaterial as RawShaderMaterial).glslVersion ?? null,
          wrapS: this.skyCompositeTarget.texture.wrapS,
          wrapT: this.skyCompositeTarget.texture.wrapT,
          colorSpace: this.skyCompositeTarget.texture.colorSpace,
          generateMipmaps: this.skyCompositeTarget.texture.generateMipmaps,
          minFilter: this.skyCompositeTarget.texture.minFilter,
          magFilter: this.skyCompositeTarget.texture.magFilter,
          uniforms: {
            uShader1Alpha: this.skyCompositeMaterial.uniforms.uShader1Alpha.value,
            uShader1Speed: this.skyCompositeMaterial.uniforms.uShader1Speed.value,
            uShader1Scale: this.skyCompositeMaterial.uniforms.uShader1Scale.value,
            uShader2Speed: this.skyCompositeMaterial.uniforms.uShader2Speed.value,
            uShader2Scale: this.skyCompositeMaterial.uniforms.uShader2Scale.value,
            uShader1Mix3: this.skyCompositeMaterial.uniforms.uShader1Mix3?.value ?? null,
            uShader1Mix3Binding: this.skyCompositeMaterial.uniforms.uShader1Mix3 ? "runtime" : "source-declared-only",
            uShader3Scale: this.skyCompositeMaterial.uniforms.uShader3Scale?.value ?? null,
            uShader3ScaleBinding: this.skyCompositeMaterial.uniforms.uShader3Scale ? "runtime" : "source-declared-only",
            uShaderMix: this.skyCompositeMaterial.uniforms.uShaderMix.value ?? null,
            uShaderMixMode: this.skyCompositeMaterial.uniforms.uShaderMix.value == null
              ? "source-Zs-missing-SHADER_1_MIX_3"
              : "runtime",
          },
        },
        perlin: sourceTextureProbe(this.perlinTexture),
        workPerlin: sourceTextureProbe(this.workPerlinTexture),
        floorNormal: sourceTextureProbe(this.floorMaterial.uniforms.tNormalMap.value as Texture),
        placeholder: { colorSpace: this.placeholder.colorSpace, type: this.placeholder.type, format: this.placeholder.format },
        fluidPlaceholder: { colorSpace: this.fluidPlaceholder.colorSpace, type: this.fluidPlaceholder.type, format: this.fluidPlaceholder.format },
      },
      spotlightProjection,
      mouseSimulation,
      mainFluid,
      reflectionState: this.reflectionStateProbe(),
    };
  }

  private reflectionStateProbe() {
    const objectSummary = (object: Object3D) => ({
      name: object.name || object.type,
      type: object.type,
      visible: object.visible,
      renderOrder: object.renderOrder,
      children: object.children.length,
      position: object.position.toArray(),
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
    });
    const renderTargetSummary = (target: WebGLRenderTarget) => ({
      width: target.width,
      height: target.height,
      depthBuffer: target.depthBuffer,
      stencilBuffer: target.stencilBuffer,
      texture: {
        colorSpace: target.texture.colorSpace,
        generateMipmaps: target.texture.generateMipmaps,
        minFilter: target.texture.minFilter,
        magFilter: target.texture.magFilter,
        wrapS: target.texture.wrapS,
        wrapT: target.texture.wrapT,
        type: target.texture.type,
        format: target.texture.format,
      },
    });
    return {
      scene: {
        children: this.homeScene.children.map(objectSummary),
        background: this.homeScene.background instanceof Color ? this.homeScene.background.toArray() : null,
        fog: this.homeScene.fog ? {
          type: this.homeScene.fog.type,
          color: this.homeScene.fog.color.toArray(),
          near: this.homeScene.fog.near,
          far: this.homeScene.fog.far,
        } : null,
      },
      sceneWrap: {
        type: this.sceneWrap.type,
        visible: this.sceneWrap.visible,
        position: this.sceneWrap.position.toArray(),
        rotation: [this.sceneWrap.rotation.x, this.sceneWrap.rotation.y, this.sceneWrap.rotation.z],
        children: this.sceneWrap.children.map(objectSummary),
      },
      lights: {
        ownershipMode: "source-p1-adds-ambient-spot-target-directionalLight-only",
        directionalLight1InScene: this.directionalLight.parent === this.homeScene,
        directionalLight2InScene: this.directionalLight2.parent === this.homeScene,
        directionalLight1Position: this.directionalLight.position.toArray(),
        directionalLight2Position: this.directionalLight2.position.toArray(),
      },
      auxiliary: {
        aboutVisible: this.aboutBlocks?.group.visible ?? null,
        floatingVisible: this.floatingBlocks?.group.visible ?? null,
      },
      floor: {
        group: objectSummary(this.floorGroup),
        plane: objectSummary(this.floorPlane),
        reflector: objectSummary(this.floorReflector),
        material: {
          transparent: this.floorMaterial.transparent,
          depthWrite: this.floorMaterial.depthWrite,
          depthTest: this.floorMaterial.depthTest,
          blending: this.floorMaterial.blending,
          toneMapped: this.floorMaterial.toneMapped,
          mode: "source-o1-raw-glsl3",
          branches: {
            map: Object.hasOwn(this.floorMaterial.defines ?? {}, "USE_MAP"),
            normalMap: Object.hasOwn(this.floorMaterial.defines ?? {}, "USE_NORMALMAP"),
            fog: Object.hasOwn(this.floorMaterial.defines ?? {}, "USE_FOG"),
            dithering: Object.hasOwn(this.floorMaterial.defines ?? {}, "DITHERING"),
          },
        },
        geometry: {
          mode: "source-a1-Tu-circle-geometry",
          type: this.floorPlane.geometry.type,
          radius: this.floorPlane.geometry.parameters.radius,
          segments: this.floorPlane.geometry.parameters.segments,
        },
          hierarchy: {
            mode: "source-a1-i1-rt-object3d-floorPlane-reflector",
            groupType: this.floorGroup.type,
            groupChildren: this.floorGroup.children.length,
            planeChildren: this.floorPlane.children.length,
            reflectorType: this.floorReflector.type,
            reflectorParentIsPlane: this.floorReflector.parent === this.floorPlane,
          planeParentIsGroup: this.floorPlane.parent === this.floorGroup,
          groupParentIsSceneWrap: this.floorGroup.parent === this.sceneWrap,
          groupPositionY: this.floorGroup.position.y,
          planeRotationX: this.floorPlane.rotation.x,
          planePosition: this.floorPlane.position.toArray(),
        },
      },
      environment: {
        group: objectSummary(this.environmentGroup),
        object: objectSummary(this.environmentPlane),
        geometry: {
          mode: "source-Du-icosahedron",
          type: this.environmentPlane.geometry.type,
          radius: this.environmentPlane.geometry.parameters.radius,
          detail: this.environmentPlane.geometry.parameters.detail,
        },
        material: {
          mode: "source-u1-meshstandard-onBeforeCompile",
          customUniformsMode: "source-u1-customUniforms-injected-onBeforeCompile-no-material-uniforms-alias",
          hasMaterialUniformsAlias: "uniforms" in this.environmentMaterial,
          transparent: this.environmentMaterial.transparent,
          depthWrite: this.environmentMaterial.depthWrite,
          depthTest: this.environmentMaterial.depthTest,
          blending: this.environmentMaterial.blending,
          side: this.environmentMaterial.side,
          toneMapped: this.environmentMaterial.toneMapped,
          fog: this.environmentMaterial.fog,
          dithering: this.environmentMaterial.dithering,
          envMapIntensity: this.environmentMaterial.envMapIntensity,
          constructorParamsMode: "source-h1-passes-side-envMapIntensity-fog-only",
          constructorParams: this.environmentMaterial.sourceConstructorParams ?? null,
          defaultStandardParamsMode: "source-u1-does-not-apply-Qn-roughness-metalness-emissive-constants",
          roughness: this.environmentMaterial.roughness,
          metalness: this.environmentMaterial.metalness,
          emissiveIntensity: this.environmentMaterial.emissiveIntensity,
        },
      },
      camera: {
        fov: this.floorReflectionCamera.fov,
        aspect: this.floorReflectionCamera.aspect,
        position: this.floorReflectionCamera.position.toArray(),
        target: this.floorReflectionTargetPosition.toArray(),
        up: this.floorReflectionCamera.up.toArray(),
        near: this.floorReflectionCamera.near,
        far: this.floorReflectionCamera.far,
        matrixWorldPosition: this.floorReflectionCameraWorldPosition.toArray(),
        reflectorWorldPosition: this.floorReflectorWorldPosition.toArray(),
        reflectorNormal: this.floorReflectorNormal.toArray(),
        clipPlane: this.floorReflectionClipPlane.toArray(),
        projectionRow3: [
          this.floorReflectionCamera.projectionMatrix.elements[2],
          this.floorReflectionCamera.projectionMatrix.elements[6],
          this.floorReflectionCamera.projectionMatrix.elements[10],
          this.floorReflectionCamera.projectionMatrix.elements[14],
        ],
      },
      targets: {
        raw: renderTargetSummary(this.floorReflectionTarget),
        rawConstructionDepthBuffer: false,
        rawRuntimeDepthBuffer: this.floorReflectionTarget.depthBuffer,
        read: renderTargetSummary(this.floorReflectionReadTarget),
        write: renderTargetSummary(this.floorReflectionWriteTarget),
        readConstructionMode: "source-i1-renderTargetRead-renderTarget-clone",
        writeConstructionMode: "source-i1-renderTargetWrite-renderTarget-clone",
        readDepthBufferFromCloneBeforeRawToggle: this.floorReflectionReadTarget.depthBuffer,
        writeDepthBufferFromCloneBeforeRawToggle: this.floorReflectionWriteTarget.depthBuffer,
        floorReflectUsesRead: this.floorMaterial.uniforms.tReflect.value === this.floorReflectionReadTarget.texture,
        floorReflectUsesRaw: this.floorMaterial.uniforms.tReflect.value === this.floorReflectionTarget.texture,
        blurInputUsesRaw: this.floorReflectionBlurMaterial.uniforms.tMap.value === this.floorReflectionTarget.texture,
        blurInputUsesRead: this.floorReflectionBlurMaterial.uniforms.tMap.value === this.floorReflectionReadTarget.texture,
        blurMaterialBlending: this.floorReflectionBlurMaterial.blending,
        blurMaterialMode: "source-t1-raw-glsl3",
        blurTMapConstructorMode: "source-t1-tMap-construct-null-update-loop-binds",
        blurPassScreenMode: "source-i1-private-screen-camera",
        reflectionUniformOwnership: "source-a1-uses-i1-renderTargetUniform-and-textureMatrixUniform",
        tReflectUniformShared: this.floorMaterial.uniforms.tReflect === this.floorReflectionRenderTargetUniform,
        uMatrixUniformShared: this.floorMaterial.uniforms.uMatrix === this.floorReflectionTextureMatrixUniform,
        floorVisibilityMode: "source-a1-onBeforeRender-hide-component-group",
        rawClearMode: "source-i1-conditional-clear-when-autoClear-false",
        cameraProjectionCopyOrder: "source-updateMatrixWorld-before-projection-copy",
        clipBias: this.floorReflectionClipBias,
        blurSwapMode: "source-i1-write-target-loop-swap",
        renderTargetUniformMode: "source-i1-update-after-each-blur-swap",
        sourceCssSized: this.floorReflectionTarget.width === Math.max(1, window.innerWidth * 0.75)
          && this.floorReflectionTarget.height === Math.max(1, window.innerHeight * 0.75),
      },
    };
  }

  private mainFluidProbe() {
    const pass = this.mainFluidPass;
    return {
      enabled: pass.enabled,
      debug: this.debugMainFluid,
      fboSize: pass.fboSize.toArray(),
      cellScale: pass.cellScale.toArray(),
      bounds: pass.bounds.toArray(),
      pointer: pass.pointer.toArray(),
      pointerOld: pass.pointerOld.toArray(),
      interaction: {
        source: "source-ag-qT-window-mousemove-force-pass",
        force: (pass.forceMaterial.uniforms.force.value as Vector2).toArray(),
        center: (pass.forceMaterial.uniforms.center.value as Vector2).toArray(),
        scale: (pass.forceMaterial.uniforms.scale.value as Vector2).toArray(),
      },
      materialSurface: {
        advection: sourceMaterialProbe(pass.advectionMaterial, "source-GT-raw-glsl3"),
        advectionBounds: {
          ...sourceMaterialProbe(pass.advectionBoundsMaterial, "source-GT-bounds-raw-glsl3"),
          sharedUniforms: pass.advectionBoundsMaterial.uniforms === pass.advectionMaterial.uniforms,
          sceneChildren: pass.advectionScene.children.length,
        },
        force: sourceMaterialProbe(pass.forceMaterial, "source-qT-raw-glsl3"),
        divergence: sourceMaterialProbe(pass.divergenceMaterial, "source-jT-raw-glsl3"),
        poisson: sourceMaterialProbe(pass.poissonMaterial, "source-KT-raw-glsl3"),
        pressure: sourceMaterialProbe(pass.pressureMaterial, "source-JT-raw-glsl3"),
      },
      targets: {
        main: renderTargetProbe(this.renderer, pass.targets.main),
        velocity: renderTargetProbe(this.renderer, pass.targets.velocity),
        divergence: renderTargetProbe(this.renderer, pass.targets.divergence),
        pressureA: renderTargetProbe(this.renderer, pass.targets.pressureA),
        pressureB: renderTargetProbe(this.renderer, pass.targets.pressureB),
      },
    };
  }

  private mouseSimulationProbe(screenProbe: ReturnType<typeof renderTargetProbe> | null) {
    const active = this.workItems.find((item) => item.slug === this.activeSlug && item.group.visible) ?? this.workItems.find((item) => item.group.visible);
    const screenCoords = this.screenMouseSimulationMaterial.uniforms.uCoords.value as Vector2;
    const screenTarget = this.screenMouseSimulationTargets[this.screenMouseSimulationIndex];
    const activeCoords = active?.mouseMaterial.uniforms.uCoords.value as Vector2 | undefined;
    const activeTarget = active?.mouseTargets[active.mouseIndex];
    const uvOffset = active?.material.uniforms.uUvOffset.value as Vector2 | undefined;
    const uvOffsetScale = active?.material.uniforms.uUvOffsetScale.value as number | undefined;
    const sourcePlaneSize = sourceWorkMousePlaneSize();
    const sourceRayPlaneSize = sourceWorkRayPlaneSize();
    const visibleWorkItems = this.workItems.filter((item) => item.group.visible);
    const expectedTargetSize = {
      width: Math.max(1, sourcePlaneSize.x),
      height: Math.max(1, sourcePlaneSize.y),
    };
    const expectedScreenTargetSize = {
      width: Math.max(1, this.workRawTarget.width / SCREEN_MOUSE_SIM_SCALE),
      height: Math.max(1, this.workRawTarget.height / SCREEN_MOUSE_SIM_SCALE),
    };
    const expectedUvOffset = sourceMouseUvOffset();
    return {
      enabled: this.renderSettings.mousesim.enabled,
      shaderSurface: {
        mode: "source-Ka-rA-oA-shader-surface",
        vertexMode: this.screenMouseSimulationMaterial.vertexShader === mouseSimulationVertex
          ? "source-oA-modelview-projection"
          : "non-source",
        hasSourceNoisePath: mouseSimulationFragment.includes("vec4 noise1 = texture2D(uNoiseTexture")
          && mouseSimulationFragment.includes("float dirX = (-0.5 + noise.g) * noise.r * 10.0")
          && mouseSimulationFragment.includes("float dirY = (-0.5 + noise.b) * noise.r * 10.0"),
        hasSourceDiffusionPlaceholders: mouseSimulationFragment.includes("float br = 1.0 - +")
          && mouseSimulationFragment.includes("float p2 = uDiffusion / 4.0")
          && mouseSimulationFragment.includes("// col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(dirX, dirY) ) * p2"),
        hasSourceCommentedHelpers: mouseSimulationFragment.includes("// float lineSegment")
          && mouseSimulationFragment.includes("// vec4 blur"),
        hasSourceCircleBrush: mouseSimulationFragment.includes("lineValue = circle(newUv, posOld, th)")
          && mouseSimulationFragment.includes("// lineValue = lineSegment(newUv, uPosOld, uPosNew, th, ratio)"),
      },
      screen: {
        index: this.screenMouseSimulationIndex,
        targetSize: screenTarget ? { width: screenTarget.width, height: screenTarget.height } : null,
        expectedTargetSize: expectedScreenTargetSize,
        targetSizingMode: "source-Lu-mousesim-render-size-div-10-no-post-rounding",
        targetSizeMatchesSource: Boolean(
          screenTarget
            && Math.abs(screenTarget.width - expectedScreenTargetSize.width) < 1e-6
            && Math.abs(screenTarget.height - expectedScreenTargetSize.height) < 1e-6,
        ),
        targetState: screenTarget ? renderTargetStateProbe(screenTarget, "screenMouseSim") : null,
        uCoords: screenCoords.toArray(),
        uCoordsMatchesSource:
          Math.abs(screenCoords.x - expectedScreenTargetSize.width) < 1e-6
          && Math.abs(screenCoords.y - expectedScreenTargetSize.height) < 1e-6,
        uniformSurfaceMode: "source-Ka-simulationMaterial-uniform-surface",
        hasNoiseTexture: this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value instanceof Texture,
        noiseTextureIsBlueNoise: this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value === this.noiseTexture,
        diffusion: this.screenMouseSimulationMaterial.uniforms.uDiffusion.value,
        diffusionSize: this.screenMouseSimulationMaterial.uniforms.uDiffusionSize.value,
        color: (this.screenMouseSimulationMaterial.uniforms.uColor.value as Color).toArray(),
        old: this.screenMouseSimOldPos.toArray(),
        new: this.screenMouseSimNewPos.toArray(),
        target: this.screenMouseSimTargetPos.toArray(),
        speed: this.screenMouseSimulationMaterial.uniforms.uSpeed.value,
        persistence: this.screenMouseSimulationMaterial.uniforms.uPersistance.value,
        thickness: this.screenMouseSimulationMaterial.uniforms.uThickness.value,
        stats: screenProbe,
      },
      active: active && activeTarget && activeCoords ? {
        slug: active.slug,
        raycastMode: "source-Ka-onMouseMove-per-item-raycast-immediate-pointer",
        raycastEventMode: "source-Ka-raycast-during-mousemove-not-raf-tail",
        raycastNormalizationMode: "source-Pe-width-height",
        pointerRay: this.pointerRay.toArray(),
        smoothedPointer: this.pointer.toArray(),
        visibleWorkItemCount: visibleWorkItems.length,
        visibleMouseTargetCount: visibleWorkItems.filter((item) => item.mouseTarget).length,
        allVisibleHaveIndependentTargets: visibleWorkItems.every((item) => item.mouseTarget instanceof Vector2),
        visibleTargets: visibleWorkItems.map((item) => ({
          slug: item.slug,
          target: item.mouseTarget.toArray(),
          rayPlaneVisible: item.rayPlane.visible,
          rayPlaneParentIsRotationWrap: item.rayPlane.parent === item.rotationWrap,
        })),
        index: active.mouseIndex,
        targetSize: { width: activeTarget.width, height: activeTarget.height },
        targetState: renderTargetStateProbe(activeTarget, "activeMouseSim"),
        uCoords: activeCoords.toArray(),
        mouseTarget: active.mouseTarget.toArray(),
        mouseOld: active.mouseOld.toArray(),
        mouseNew: active.mouseNew.toArray(),
        mouseSpeed: active.mouseSpeed,
        renderClearMode: active.mouseRenderClearMode,
        uniformSpeed: active.mouseMaterial.uniforms.uSpeed.value,
        uniformSurfaceMode: "source-Ka-simulationMaterial-uniform-surface",
        hasNoiseTexture: active.mouseMaterial.uniforms.uNoiseTexture.value instanceof Texture,
        noiseTextureIsBlueNoise: active.mouseMaterial.uniforms.uNoiseTexture.value === this.noiseTexture,
        diffusion: active.mouseMaterial.uniforms.uDiffusion.value,
        diffusionSize: active.mouseMaterial.uniforms.uDiffusionSize.value,
        color: (active.mouseMaterial.uniforms.uColor.value as Color).toArray(),
        persistence: active.mouseMaterial.uniforms.uPersistance.value,
        thickness: active.mouseMaterial.uniforms.uThickness.value,
        uvOffset: uvOffset?.toArray() ?? null,
        uvOffsetType: uvOffset?.isVector2 ? "Vector2" : uvOffset ? "non-source" : null,
        uvOffsetScale: uvOffsetScale ?? null,
        mousePlaneScale: active.mousePlane.scale.toArray(),
        mousePlanePosition: active.mousePlane.position.toArray(),
        mousePlaneVisible: active.mousePlane.visible,
        mousePlaneParentIsNull: active.mousePlane.parent === null,
        mousePlaneMaterial: {
          transparent: active.mousePlane.material.transparent,
          depthWrite: active.mousePlane.material.depthWrite,
          depthTest: active.mousePlane.material.depthTest,
          ratio: active.mousePlane.material.uniforms.uRatio.value,
        },
        rotationWrapScale: active.rotationWrap.scale.toArray(),
        meshScale: active.mesh.scale.toArray(),
        rayPlaneScale: active.rayPlane.scale.toArray(),
        rayPlanePosition: active.rayPlane.position.toArray(),
        rayPlaneParentIsRotationWrap: active.rayPlane.parent === active.rotationWrap,
        rayPlaneVisible: active.rayPlane.visible,
        rayPlaneMaterial: {
          transparent: active.rayPlane.material.transparent,
          opacity: active.rayPlane.material.opacity,
          depthWrite: active.rayPlane.material.depthWrite,
          depthTest: active.rayPlane.material.depthTest,
        },
        sourcePlaneSize: sourcePlaneSize.toArray(),
        sourceRayPlaneSize: sourceRayPlaneSize.toArray(),
        expectedTargetSize,
        sourceShape: {
          planeScale: MOUSE_PLANE_SCALE,
          rayScale: MOUSE_RAY_SCALE,
          gridScale: GRID_SCALE,
          rotationWrapScaleMatchesSource:
            Math.abs(active.rotationWrap.scale.x - GRID_SCALE) < 1e-6
            && Math.abs(active.rotationWrap.scale.y - GRID_SCALE) < 1e-6
            && Math.abs(active.rotationWrap.scale.z - GRID_SCALE) < 1e-6,
          meshScaleIsSourceIdentity:
            Math.abs(active.mesh.scale.x - 1) < 1e-6
            && Math.abs(active.mesh.scale.y - 1) < 1e-6
            && Math.abs(active.mesh.scale.z - 1) < 1e-6,
          targetSizeMatchesPlane: activeTarget.width === expectedTargetSize.width && activeTarget.height === expectedTargetSize.height,
          targetStateMatchesSource:
            activeTarget.depthBuffer === false
            && activeTarget.stencilBuffer === false
            && activeTarget.texture.wrapS === ClampToEdgeWrapping
            && activeTarget.texture.wrapT === ClampToEdgeWrapping
            && activeTarget.texture.minFilter === LinearFilter
            && activeTarget.texture.magFilter === LinearFilter
            && activeTarget.texture.format === RGBAFormat
            && activeTarget.texture.type === FloatType
            && activeTarget.texture.generateMipmaps === false,
          renderClearModeMatchesSource: active.mouseRenderClearMode === "source-sA-no-explicit-clear",
          updateLerpMode: "source-Ka-newPos-lerp-targetPos-delta-times-7_5-no-clamp",
          raycastMode: "source-Ka-onMouseMove-per-item-raycast-immediate-pointer",
          raycastEventMode: "source-Ka-raycast-during-mousemove-not-raf-tail",
          raycastNormalizationMode: "source-Pe-width-height",
          raycastModeMatchesSource: true,
          raycastEventModeMatchesSource: true,
          raycastNormalizationModeMatchesSource: true,
          allVisibleHaveIndependentTargets: visibleWorkItems.every((item) => item.mouseTarget instanceof Vector2),
          uCoordsMatchesTarget: activeCoords.x === expectedTargetSize.width && activeCoords.y === expectedTargetSize.height,
          mousePlaneScaleMatchesSource:
            Math.abs(active.mousePlane.scale.x - sourcePlaneSize.x) < 1e-6
            && Math.abs(active.mousePlane.scale.y - sourcePlaneSize.y) < 1e-6,
          mousePlaneZMatchesSource:
            Math.abs(active.mousePlane.position.z - sourcePlaneSize.y / 2) < 1e-6,
          mousePlaneVisibleMatchesSource: active.mousePlane.visible === true,
          mousePlaneNotInScene: active.mousePlane.parent === null,
          mousePlaneMaterialMatchesSource:
            active.mousePlane.material.transparent === true
            && active.mousePlane.material.depthWrite === false
            && active.mousePlane.material.depthTest === false
            && Math.abs((active.mousePlane.material.uniforms.uRatio.value as number) - GRID_COLS / GRID_ROWS) < 1e-6,
          uvOffsetMatchesSource: Boolean(
            uvOffset
              && uvOffset.isVector2
              && Math.abs(uvOffset.x - expectedUvOffset.x) < 1e-6
              && Math.abs(uvOffset.y - expectedUvOffset.y) < 1e-6,
          ),
          uvOffsetTypeMatchesSource: Boolean(uvOffset?.isVector2),
          uvOffsetScaleMatchesSource: uvOffsetScale === MOUSE_RAY_SCALE,
          targetSizingMode: "source-GA-resize-plane-scale-no-pre-rounding",
          rayPlaneScaleMatchesSource:
            Math.abs(active.rayPlane.scale.x - sourceRayPlaneSize.x) < 1e-6
            && Math.abs(active.rayPlane.scale.y - sourceRayPlaneSize.y) < 1e-6,
          rayPlaneGeometryMatchesSource:
            Math.abs(active.rayPlane.geometry.parameters.width - 1) < 1e-6
            && Math.abs(active.rayPlane.geometry.parameters.height - 1) < 1e-6,
          rayPlaneParentMatchesSource: active.rayPlane.parent === active.rotationWrap,
          rayPlaneZMatchesSource:
            Math.abs(active.rayPlane.position.z - (sourcePlaneSize.y / 2 + 0.01)) < 1e-6,
          rayPlaneVisibleMatchesSource: active.rayPlane.visible === true,
          rayPlaneMaterialMatchesSource:
            active.rayPlane.material.transparent === true
            && active.rayPlane.material.opacity === 0
            && active.rayPlane.material.depthWrite === false
            && active.rayPlane.material.depthTest === false,
          persistenceMatchesSource: Math.abs((active.mouseMaterial.uniforms.uPersistance.value as number) - Math.pow(0.85, 1 / 60 * 10)) < 0.2,
          thicknessMatchesSource: Math.abs((active.mouseMaterial.uniforms.uThickness.value as number) - 0.1) < 1e-6,
        },
        groupVisible: active.group.visible,
        stats: renderTargetProbe(this.renderer, activeTarget),
      } : null,
    };
  }

  private spotlightProjectionProbe() {
    const active = this.workItems.find((item) => item.slug === this.activeSlug && item.group.visible) ?? this.workItems.find((item) => item.group.visible);
    if (!active) return null;
    this.spotLight.shadow.updateMatrices(this.spotLight);
    active.mesh.updateWorldMatrix(true, false);
    const box = new Box3().setFromObject(active.mesh);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const sampleOffsets = [
      { label: "center", offset: new Vector3(0, 0, 0) },
      { label: "left", offset: new Vector3(-0.5, 0, 0) },
      { label: "right", offset: new Vector3(0.5, 0, 0) },
      { label: "top", offset: new Vector3(0, 0.5, 0) },
      { label: "bottom", offset: new Vector3(0, -0.5, 0) },
      { label: "top-left", offset: new Vector3(-0.5, 0.5, 0) },
      { label: "top-right", offset: new Vector3(0.5, 0.5, 0) },
      { label: "bottom-left", offset: new Vector3(-0.5, -0.5, 0) },
      { label: "bottom-right", offset: new Vector3(0.5, -0.5, 0) },
    ];
    const samples = sampleOffsets.map(({ label, offset }) => {
      const world = center.clone().add(new Vector3(size.x * offset.x, size.y * offset.y, size.z * offset.z));
      const projected = world.clone().applyMatrix4(this.spotLight.shadow.matrix);
      const uv = new Vector2(projected.x, projected.y);
      const inMap = Math.abs(uv.x * 2 - 1) < 1 && Math.abs(uv.y * 2 - 1) < 1 && Math.abs(projected.z * 2 - 1) < 1;
      return {
        label,
        world: world.toArray(),
        projected: projected.toArray(),
        uv: uv.toArray(),
        inMap,
        mapPixel: renderTargetPixel(this.renderer, this.thumbCompositeTarget, uv),
      };
    });
    const inMapSamples = samples.filter((sample) => sample.inMap);
    const mapLumaMean = inMapSamples.length
      ? inMapSamples.reduce((sum, sample) => sum + sample.mapPixel.luma, 0) / inMapSamples.length
      : 0;
    const uvBounds = samples.reduce((bounds, sample) => ({
      min: [Math.min(bounds.min[0], sample.uv[0]), Math.min(bounds.min[1], sample.uv[1])],
      max: [Math.max(bounds.max[0], sample.uv[0]), Math.max(bounds.max[1], sample.uv[1])],
    }), { min: [Infinity, Infinity], max: [-Infinity, -Infinity] });
    return {
      activeSlug: active.slug,
      spotlight: {
        intensity: this.spotLight.intensity,
        stateOwnership: "source-Se-settings-light-state-onUpdate-intensities",
        stateIntensity: this.lightState.spotLight.intensity,
        stateIntensityMatchesLight: Math.abs(this.spotLight.intensity - this.lightState.spotLight.intensity) < 1e-6,
        hasMap: this.spotLight.map === this.thumbCompositeTarget.texture,
        mapMode: this.spotLight.map === this.thumbCompositeTarget.texture ? "source-thumb-composite-target" : "missing-or-debug-disabled",
        mapProjectionMode: "three-r164-spotLightMap-vSpotLightCoord",
        positionOwnershipMode: "source-direct-SpotLight-position-target-no-local-mirror",
        parallaxMode: "source-p1-spotLight-x-camera-y-desktop-or-0_3-mobile",
        parallaxYOffsetMode: window.innerWidth >= BREAKPOINT_MD
          ? "source-p1-desktop-camera-y-parallax"
          : "source-p1-mobile-0_3-plus-camera-y-parallax",
        mobileBreakpoint: BREAKPOINT_MD,
        mobileYOffset: window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3,
        position: this.spotLight.position.toArray(),
        target: this.spotLight.target.position.toArray(),
        angle: this.spotLight.angle,
        penumbra: this.spotLight.penumbra,
        parallax: this.spotLightParallax,
        castShadow: this.spotLight.castShadow,
        projectionPath: "source-SpotLight.map-without-castShadow",
        mapColorSpace: this.thumbCompositeTarget.texture.colorSpace,
        shadowMatrix: this.spotLight.shadow.matrix.toArray(),
      },
      bounds: {
        center: center.toArray(),
        size: size.toArray(),
      },
      samples,
      inMapCount: inMapSamples.length,
      projectionMatrixMode: "source-SD-SpotLight-map-through-three-shadow-matrix",
      shadowPathMode: "source-map-projection-not-shadow-cast",
      threeChunkMode: "r164-lights_fragment_begin-multiplies-directLight-by-spotLightMap",
      sampleGridMode: "source-spotlight-map-3x3-active-bounds",
      sampleCount: samples.length,
      inMapCoverage: samples.length ? inMapSamples.length / samples.length : 0,
      uvBounds,
      mapLumaMean,
    };
  }

  private renderCharacterTarget() {
    this.renderer.setRenderTarget(this.characterTarget);
    this.renderer.clear();
    if (this.characterFallbackMesh.visible) this.renderer.render(this.characterScene, this.backgroundCamera);
    else this.renderer.render(this.characterScene, this.characterCamera);
    this.renderer.setRenderTarget(null);
  }

  private renderMediaCompositeTarget(hasMedia: boolean) {
    const previousAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = true;
    this.renderer.setRenderTarget(this.mediaRawTarget);
    if (hasMedia) this.renderer.render(this.mediaScene, this.mediaCamera);
    else this.renderer.clear();

    this.mediaCompositeMaterial.uniforms.tScene.value = this.mediaRawTarget.texture;
    this.renderer.setRenderTarget(this.mediaTarget);
    this.renderer.render(this.mediaCompositeScene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = previousAutoClear;
  }

  private renderWorkBlurPass() {
    this.workBlurHorizontalMaterial.uniforms.tMap.value = this.workRawTarget.texture;
    this.workPostScreen.material = this.workBlurHorizontalMaterial;
    this.renderer.setRenderTarget(this.workBlurTargetA);
    this.renderer.render(this.workPostScreen, this.backgroundCamera);
    this.workBlurVerticalMaterial.uniforms.tMap.value = this.workBlurTargetA.texture;
    this.workPostScreen.material = this.workBlurVerticalMaterial;
    this.renderer.setRenderTarget(this.workBlurTargetB);
    this.renderer.render(this.workPostScreen, this.backgroundCamera);
  }

  private renderHomeBlurPass() {
    this.mainBlurHorizontalMaterial.uniforms.tMap.value = this.mainRawTarget.texture;
    this.mainPostScreen.material = this.mainBlurHorizontalMaterial;
    this.renderer.setRenderTarget(this.mainBlurTargetA);
    this.renderer.render(this.mainPostScreen, this.backgroundCamera);
    this.mainBlurVerticalMaterial.uniforms.tMap.value = this.mainBlurTargetA.texture;
    this.mainPostScreen.material = this.mainBlurVerticalMaterial;
    this.renderer.setRenderTarget(this.mainBlurTargetB);
    this.renderer.render(this.mainPostScreen, this.backgroundCamera);
  }

  private renderMainLensflarePass(sourceTarget: WebGLRenderTarget) {
    if (!SOURCE_MAIN_LENSFLARE_SETTINGS.enabled || !this.mainLensflareMaterial) return;
    this.mainLensflareMaterial.uniforms.tMap.value = this.sourceMainRenderSettings.blur.enabled ? this.mainBlurTargetB.texture : sourceTarget.texture;
    this.mainPostScreen.material = this.mainLensflareMaterial;
    this.renderer.setRenderTarget(this.mainLensflareTarget);
    this.renderer.clear();
    this.renderer.render(this.mainPostScreen, this.backgroundCamera);
  }

  private renderMainLuminosityPass(sourceTarget: WebGLRenderTarget) {
    if (!this.sourceMainRenderSettings.luminosity.enabled) return;
    this.mainLuminosityMaterial.uniforms.tMap.value = this.sourceMainRenderSettings.blur.enabled ? this.mainBlurTargetB.texture : sourceTarget.texture;
    this.mainPostScreen.material = this.mainLuminosityMaterial;
    this.renderer.setRenderTarget(this.mainBloomBrightTarget);
    this.renderer.render(this.mainPostScreen, this.backgroundCamera);
  }

  private renderBloomChain(
    sourceTarget: WebGLRenderTarget,
    horizontalTargets: WebGLRenderTarget[],
    verticalTargets: WebGLRenderTarget[],
    blurMaterials: ShaderMaterial[],
    screen: Mesh<BufferGeometry, Material>,
    compositeMaterial: ShaderMaterial,
    brightTarget?: WebGLRenderTarget,
  ) {
    let bloomSource = brightTarget ?? sourceTarget;
    horizontalTargets.forEach((horizontalTarget, index) => {
      const verticalTarget = verticalTargets[index];
      const blurMaterial = blurMaterials[index] ?? blurMaterials[blurMaterials.length - 1];
      blurMaterial.uniforms.tMap.value = bloomSource.texture;
      blurMaterial.uniforms.uDirection.value.set(1, 0);
      screen.material = blurMaterial;
      this.renderer.setRenderTarget(horizontalTarget);
      this.renderer.render(screen, this.backgroundCamera);
      blurMaterial.uniforms.tMap.value = horizontalTarget.texture;
      blurMaterial.uniforms.uDirection.value.set(0, 1);
      this.renderer.setRenderTarget(verticalTarget);
      this.renderer.render(screen, this.backgroundCamera);
      bloomSource = verticalTarget;
    });
    screen.material = compositeMaterial;
    this.renderer.setRenderTarget(horizontalTargets[0]);
    this.renderer.render(screen, this.backgroundCamera);
  }

  private renderHomeBloomPass(sourceTarget: WebGLRenderTarget, luminositySourceTarget = sourceTarget) {
    let brightTarget: WebGLRenderTarget | undefined;
    if (this.renderSettings.luminosity.enabled) {
      this.workLuminosityMaterial.uniforms.tMap.value = luminositySourceTarget.texture;
      this.workPostScreen.material = this.workLuminosityMaterial;
      this.renderer.setRenderTarget(this.workBloomBrightTarget);
      this.renderer.render(this.workPostScreen, this.backgroundCamera);
      brightTarget = this.workBloomBrightTarget;
    }
    this.renderBloomChain(
      sourceTarget,
      this.workBloomHorizontalTargets,
      this.workBloomVerticalTargets,
      this.bloomBlurMaterials,
      this.workPostScreen,
      this.bloomCompositeMaterial,
      brightTarget,
    );
  }

  private renderMainBloomPass(sourceTarget: WebGLRenderTarget) {
    this.renderBloomChain(
      sourceTarget,
      this.mainBloomHorizontalTargets,
      this.mainBloomVerticalTargets,
      this.mainBloomBlurMaterials,
      this.mainPostScreen,
      this.mainBloomCompositeMaterial,
      this.sourceMainRenderSettings.luminosity.enabled ? this.mainBloomBrightTarget : undefined,
    );
  }

  private renderHomeCompositePass() {
    const settings = this.sourceMainRenderSettings;
    this.mainPostScreen.material = this.preCompositeMaterial;
    if (settings.fxaa.enabled) {
      this.renderer.setRenderTarget(this.mainFxaaTarget);
      this.renderer.render(this.mainPostScreen, this.backgroundCamera);
      this.mainFxaaMaterial.uniforms.tMap.value = this.mainFxaaTarget.texture;
      this.mainPostScreen.material = this.mainFxaaMaterial;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.mainPostScreen, this.backgroundCamera);
      return;
    }
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.mainPostScreen, this.backgroundCamera);
  }

  private tick = () => {
    const time = performance.now() * 0.001;
    const delta = MathUtils.clamp(time - this.lastTickTime, 1 / 120, 1 / 20);
    this.lastTickTime = time;
    this.pointer.lerp(this.targetPointer, 0.055);
    this.applyDebugThumbProgress();
    this.backgroundMaterial.uniforms.uTime.value = time;
    this.backgroundMaterial.uniforms.uProgress.value = this.galleryProgress;
    this.preCompositeMaterial.uniforms.uFluidStrength.value = this.fluidStrength;
    this.preCompositeMaterial.uniforms.boolBloom.value = this.sourceMainRenderSettings.bloom.enabled;
    this.preCompositeMaterial.uniforms.boolFluid.value = this.sourceMainRenderSettings.fluid.enabled;
    this.preCompositeMaterial.uniforms.boolLuminosity.value = this.sourceMainRenderSettings.luminosity.enabled;
    this.preCompositeMaterial.uniforms.boolFxaa.value = this.sourceMainRenderSettings.fxaa.enabled;
    this.updateMediaPlanePositions();

    const isProjectView = document.body.classList.contains("is-project");
    const hasHome = this.sceneWrap.visible;
    const hasMedia = this.mediaPlanes.some((plane) => plane.mesh.visible);
    const debugRawWorkComposite = this.debugPassOrder === "raw-work-composite";

    this.renderSkyTarget(time);
    this.renderMediaCompositeTarget(isProjectView && hasMedia);
    if (hasHome) {
      this.renderer.setRenderTarget(this.workRawTarget);
      const previousFloorVisible = this.floorPlane.visible;
      const previousFloorGroupVisible = this.floorGroup.visible;
      const previousEnvironmentVisible = this.environmentGroup.visible;
      if (this.debugFloor === "off") this.floorGroup.visible = false;
      if (this.debugEnvironment === "off") this.environmentGroup.visible = false;
      try {
        this.renderer.render(this.homeScene, this.homeCamera);
        if (!debugRawWorkComposite) {
          if (this.renderSettings.blur.enabled) {
            this.renderWorkBlurPass();
          }
          const workSceneTarget = this.renderSettings.blur.enabled ? this.workBlurTargetB : this.workRawTarget;
          if (this.renderSettings.bloom.enabled) {
            this.renderHomeBloomPass(this.workRawTarget, workSceneTarget);
            this.compositeMaterial.uniforms.tBloom.value = this.workBloomHorizontalTargets[0].texture;
          }
          this.updateScreenMouseSimulation(time, delta);
          this.compositeMaterial.uniforms.tScene.value = workSceneTarget.texture;
          this.compositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
          this.compositeMaterial.uniforms.boolBloom.value = this.renderSettings.bloom.enabled;
          this.compositeMaterial.uniforms.boolFluid.value = this.renderSettings.fluid.enabled;
          this.compositeMaterial.uniforms.boolLuminosity.value = this.renderSettings.luminosity.enabled;
          this.compositeMaterial.uniforms.boolFxaa.value = this.renderSettings.fxaa.enabled;
          this.workPostScreen.material = this.compositeMaterial;
          if (this.renderSettings.fxaa.enabled) {
            this.renderer.setRenderTarget(this.workFxaaTarget);
            this.renderer.render(this.workPostScreen, this.backgroundCamera);
            this.workFxaaMaterial.uniforms.tMap.value = this.workFxaaTarget.texture;
            this.workPostScreen.material = this.workFxaaMaterial;
          }
          this.renderer.setRenderTarget(this.workCompositeTarget);
          this.renderer.render(this.workPostScreen, this.backgroundCamera);
          this.renderer.setRenderTarget(null);
        }
      } finally {
        this.floorPlane.visible = previousFloorVisible;
        this.floorGroup.visible = previousFloorGroupVisible;
        this.environmentGroup.visible = previousEnvironmentVisible;
      }
    } else {
      this.renderer.setRenderTarget(this.workRawTarget);
      this.renderer.setRenderTarget(this.workCompositeTarget);
    }
    this.updateWorkSceneForNextFrame(time, delta);
    if (debugRawWorkComposite) {
      this.preCompositeMaterial.uniforms.tWork.value = this.workRawTarget.texture;
    }
    this.renderer.setRenderTarget(this.mainRawTarget);
    this.renderer.render(this.mainScene, this.mainCamera);
    this.preCompositeMaterial.uniforms.tLensflare.value = this.mainLensflareTarget.texture;
    if (this.sourceMainRenderSettings.blur.enabled) {
      this.renderHomeBlurPass();
    }
    this.renderMainLensflarePass(this.mainRawTarget);
    this.renderMainLuminosityPass(this.mainRawTarget);
    if (this.sourceMainRenderSettings.bloom.enabled) {
      this.renderMainBloomPass(this.mainRawTarget);
      this.preCompositeMaterial.uniforms.tBloom.value = this.mainBloomHorizontalTargets[0].texture;
    }
    this.preCompositeMaterial.uniforms.tScene.value = this.sourceMainRenderSettings.blur.enabled ? this.mainBlurTargetB.texture : this.mainRawTarget.texture;
    if (this.sourceMainRenderSettings.fluid.enabled) {
      const mainFluidTexture = this.fluidStrength > 0
        ? this.updateMainFluidPass()
        : this.mainFluidPass.enabled
          ? this.mainFluidPass.targets.main.texture
          : null;
      this.preCompositeMaterial.uniforms.tFluid.value = mainFluidTexture;
    }
    this.renderHomeCompositePass();
    this.preCompositeMaterial.uniforms.uTime.value = time;
    this.renderThumbTargets();
    this.renderDisplacementTarget(time);
    if (this.aboutBlocks?.group.visible) this.renderCharacterTarget();
    this.updateThumbProbe(time);
    this.updateOutputProbe(time);
    this.raf = requestAnimationFrame(this.tick);
  };
}

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
  MathUtils,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
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

type WorkItem = {
  slug: string;
  payload: ProjectPayload;
  group: Group;
  material: WorkBlockMaterial;
  mesh: InstancedMesh;
  thumb: Mesh<PlaneGeometry, ShaderMaterial>;
  thumbXHook: number;
  thumbYHook: number;
  rayPlane: Mesh<PlaneGeometry, MeshBasicMaterial>;
  mouseMaterial: ShaderMaterial;
  mouseScene: Scene;
  mouseTargets: WebGLRenderTarget[];
  mouseIndex: number;
  mouseTarget: Vector2;
  mouseOld: Vector2;
  mouseNew: Vector2;
  mouseSpeed: number;
  reveal: number;
};

type WorkBlockMaterial = MeshStandardMaterial & { uniforms: Record<string, { value: any }> };
type EnvironmentMaterial = MeshStandardMaterial & { uniforms: Record<string, { value: any }> };
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
    visibleThumbs: number;
    thumbComposite: {
      darkness: number;
      darknessColor: [number, number, number];
      saturation: number;
    };
    spotlight: {
      hasMap: boolean;
      intensity: number;
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
  group: Group;
  scaleWrap: Group;
  rotationWrap: Group;
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
const SOURCE_MAX_DPR = 1.5;
const SOURCE_WORK_BG = "#1a1a1a";
const SOURCE_COMPOSITE_BG = "#1f1f1f";
const DEFAULT_BG = SOURCE_WORK_BG;
const DEFAULT_COLOR = "#bcbcbc";
const SOURCE_INITIAL_SECONDARY = "#464646";
const SOURCE_INITIAL_AMBIENT = 1;
const SOURCE_WORK_DIFFUSE = "#808080";
const SOURCE_WORK_ENVMAP_INTENSITY = 0.75;
const SOURCE_WORK_ROUGHNESS = 1;
const SOURCE_WORK_METALNESS = 0;
const SOURCE_WORK_EMISSIVE_INTENSITY = 1;
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

const workBlockVertexPars = `
attribute vec3 instanceOffset;
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceColor;

varying vec2 vLocalUv;
varying vec2 vOffset;
varying float vMouseSim;
varying float vAlpha;

uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
uniform float uRevealSpread;
uniform float uRevealSpreadSides;
uniform float uMouseFactor;
uniform vec2 uCoords;
uniform vec3 uUvOffset;
uniform float uUvOffsetScale;
uniform sampler2D tMouseSim;
uniform sampler2D tDisplacement;
uniform sampler2D tPerlin;
uniform float uTime;
`;

const workBlockBeginVertexChunk = `
vec3 transformed = vec3(position);
vec2 newUv = uv;
newUv.x /= uGridSize.x;
newUv.y /= uGridSize.y;
newUv += instanceOffset.xy;
vec2 mouseUv = (newUv + uUvOffset.xy) / uUvOffsetScale;
vec4 mouseSim = texture2D(tMouseSim, mouseUv);

vec4 instancePos = instanceMatrix[3];
float revealMask = uReveal * uRevealProject;
float toCenter = length(instancePos.xy);

float fadeScale = (revealMask * 5.75) - (toCenter * (revealMask / 5.75));
float fade = clamp(fadeScale, 0.0, 1.05);
float fadeDisplacementScale = (revealMask * 4.85) - (toCenter * (revealMask / 4.85));
float fadeDisplacement = clamp(fadeDisplacementScale, -1.0, 1.0);
vec4 displacementMap = texture2D(tDisplacement, newUv);
vec4 perlinMap = texture2D(tPerlin, newUv * 0.75 - uTime * 0.05);
float perlinHeight = 10.0;
float perlinDisplacement = perlinMap.r * perlinHeight;
perlinDisplacement *= fade;

vec3 perlinDisplaced = transformed;
perlinDisplaced.z += perlinDisplacement - perlinHeight * 0.5;
perlinDisplaced *= min(1.0, 1.0 - (perlinDisplacement - perlinHeight * 0.5) * 0.1);
transformed *= 1.0 - mouseSim.r * 0.05;
transformed = mix(transformed, perlinDisplaced, (1.0 - fadeDisplacement) * 0.25);
transformed *= fade * uRevealSides;

float displacement = displacementMap.r;
transformed.z -= 1.5;
transformed.z += displacement * 3.0 + 6.0 * (1.0 - revealMask);
transformed.z += mouseSim.r * 15.0 * uMouseFactor;
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

vLocalUv = uv;
vOffset = instanceOffset.xy;
vMouseSim = mouseSim.r;
vAlpha = instanceAlpha;
#ifdef USE_ALPHAHASH
  vPosition = vec3(position);
#endif
`;

const workBlockSourceScreenUvBeginVertexChunk = workBlockBeginVertexChunk.replace(
  [
    "vec2 newUv = uv;",
    "newUv.x /= uGridSize.x;",
    "newUv.y /= uGridSize.y;",
    "newUv += instanceOffset.xy;",
  ].join("\n"),
  [
    "vec2 screenUv = gl_Position.xy / uCoords.xy;",
    "vec2 newUv = screenUv;",
    "newUv.x /= uGridSize.x;",
    "newUv.y /= uGridSize.y;",
    "newUv += instanceOffset.xy;",
  ].join("\n"),
);

const workBlockSourceWorldPositionChunk = `
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
  transformed /= 1. - mouseSim.r * .2;
  vec4 worldPosition = vec4(transformed, 1.0);
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
#endif
`;

const workBlockFragmentPars = `
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
uniform float uTime;
uniform float uMouseLightness;
uniform float uMouseFactor;
uniform sampler2D tMouseSim2;
uniform sampler2D tDisplacement;
uniform vec2 uCoords;

varying vec2 vLocalUv;
varying vec2 vOffset;
varying float vMouseSim;
varying float vAlpha;

float sourceRandom(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float sourceVignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
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
vec2 sourceUv = vLocalUv / uGridSize.xy + vOffset;

vec2 screenUv = gl_FragCoord.xy / max(uCoords, vec2(1.0));
float simLight = texture2D(tMouseSim2, screenUv).r;
float mouseF = 1.0 - simLight;
sourceColor = mix(sourceColor, sourceColor * vec3(mouseF), 1.0 - uMouseLightness);

vec2 gridUv = vec2(floor(sourceUv.x * uGridSize.x), floor(sourceUv.y * uGridSize.y));
vec2 gridUv2 = vec2(floor(sourceUv.y * uGridSize.y), floor(sourceUv.x * uGridSize.y));
float alpha1 = mix(sourceRandom(gridUv * vAlpha), sourceRandom(gridUv), 1.0);
float alpha2 = mix(sourceRandom(gridUv2 * vAlpha), sourceRandom(gridUv2), 1.0);
float alpha = alpha1 * alpha2 * vAlpha;
float revealCombined = uReveal * uRevealProject;
float fragmentReveal = mix(revealCombined, 1.0, uAuxiliaryMaterial);
float revealRadius = 2.0 * pow(fragmentReveal, 0.25);
float centerAlpha = sourceVignette(sourceUv, vec2(0.5), 0.01, 0.2, 6.0, 1.0);
float revealAlpha = sourceVignette(sourceUv, vec2(0.5), 0.01, revealRadius, 6.0, 1.0);
float mouseAlphaFactor = mix(0.5, 0.15, uAuxiliaryMaterial);
if (screenUv.y > 0.1) alpha += clamp(simLight * (uMouseFactor * mouseAlphaFactor), 0.0, 1.0);
alpha += centerAlpha * 0.1;
alpha -= 1.0 - revealAlpha;
alpha *= mix(uRevealSides, uScrollOpacity, uAuxiliaryMaterial);

gl_FragColor = vec4(sourceColor, alpha * diffuseColor.a);
`;

const workBlockSourceTailFragmentChunk = `
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

gl_FragColor = vec4(outgoingLight, diffuseColor.a);

vec2 sourceUv = vLocalUv / uGridSize.xy + vOffset;
vec2 screenUv = gl_FragCoord.xy / uCoords.xy;
float simLight = texture2D(tMouseSim2, screenUv).r;
float mouseF = 1.0 - simLight;
gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(mouseF), 1.0 - uMouseLightness);

vec2 gridUv = vec2(floor(sourceUv.x * uGridSize.x), floor(sourceUv.y * uGridSize.y));
vec2 gridUv2 = vec2(floor(sourceUv.y * uGridSize.y), floor(sourceUv.x * uGridSize.y));
float alpha1 = mix(sourceRandom(gridUv * vAlpha), sourceRandom(gridUv), 1.0);
float alpha2 = mix(sourceRandom(gridUv2 * vAlpha), sourceRandom(gridUv2), 1.0);
float alpha = alpha1 * alpha2 * vAlpha;
float revealCombined = uReveal * uRevealProject;
float revealRadius = 2.0 * pow(revealCombined, 0.25);
float centerAlpha = sourceVignette(sourceUv, vec2(0.5), 0.01, 0.2, 6.0, 1.0);
float revealAlpha = sourceVignette(sourceUv, vec2(0.5), 0.01, revealRadius, 6.0, 1.0);
if (screenUv.y > 0.1) alpha += clamp(simLight * (uMouseFactor * 0.5), 0.0, 1.0);
alpha += centerAlpha * 0.1;
alpha -= 1.0 - revealAlpha;
alpha *= uRevealSides;

gl_FragColor.a = alpha;
`;

function stripSourceVaFragmentPaths(fragmentShader: string) {
  return fragmentShader
    .replace("#include <color_pars_fragment>", "// source VA omits color_pars_fragment")
    .replace("#include <map_pars_fragment>", "// source VA omits map_pars_fragment")
    .replace("#include <alphamap_pars_fragment>", "// source VA omits alphamap_pars_fragment")
    .replace("#include <alphatest_pars_fragment>", "// source VA omits alphatest_pars_fragment")
    .replace("#include <alphahash_pars_fragment>", "// source VA omits alphahash_pars_fragment")
    .replace("#include <aomap_pars_fragment>", "// source VA omits aomap_pars_fragment")
    .replace("#include <lightmap_pars_fragment>", "// source VA omits lightmap_pars_fragment")
    .replace("#include <emissivemap_pars_fragment>", "// source VA omits emissivemap_pars_fragment")
    .replace("#include <iridescence_fragment>", "// source VA omits iridescence_fragment")
    .replace("#include <cube_uv_reflection_fragment>", "// source VA omits cube_uv_reflection_fragment")
    .replace("#include <envmap_common_pars_fragment>", "// source VA omits envmap_common_pars_fragment")
    .replace("#include <envmap_physical_pars_fragment>", "// source VA omits envmap_physical_pars_fragment")
    .replace("#include <fog_pars_fragment>", "// source VA omits fog_pars_fragment")
    .replace("#include <bumpmap_pars_fragment>", "// source VA omits bumpmap_pars_fragment")
    .replace("#include <normalmap_pars_fragment>", "// source VA omits normalmap_pars_fragment")
    .replace("#include <clearcoat_pars_fragment>", "// source VA omits clearcoat_pars_fragment")
    .replace("#include <iridescence_pars_fragment>", "// source VA omits iridescence_pars_fragment")
    .replace("#include <roughnessmap_pars_fragment>", "// source VA omits roughnessmap_pars_fragment")
    .replace("#include <metalnessmap_pars_fragment>", "// source VA omits metalnessmap_pars_fragment")
    .replace("#include <logdepthbuf_pars_fragment>", "// source VA omits logdepthbuf_pars_fragment")
    .replace("#include <clipping_planes_pars_fragment>", "// source VA omits clipping_planes_pars_fragment")
    .replace("#include <clipping_planes_fragment>", "// source VA omits clipping_planes_fragment")
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
    .replace(/#ifdef USE_CLEARCOAT\s+float dotNVcc = saturate\( dot\( geometryClearcoatNormal, geometryViewDir \) \);\s+vec3 Fcc = F_Schlick\( material.clearcoatF0, material.clearcoatF90, dotNVcc \);\s+outgoingLight = outgoingLight \* \( 1.0 - material.clearcoat \* Fcc \) \+ \( clearcoatSpecularDirect \+ clearcoatSpecularIndirect \) \* material.clearcoat;\s+#endif/g, "// source VA omits clearcoat outgoing-light tail");
}

function patchWorkBlockShader(
  shader: { uniforms: Record<string, any>; vertexShader: string; fragmentShader: string },
  uniforms: Record<string, any>,
  variant: "work" | "auxiliary" = "work",
) {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `${workBlockVertexPars}\n#include <common>`)
    .replace("#include <begin_vertex>", workBlockSourceScreenUvBeginVertexChunk)
    .replace("#include <worldpos_vertex>", workBlockSourceWorldPositionChunk);
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `${workBlockFragmentPars}\n${variant === "auxiliary" ? auxiliaryBlockFragmentPars : ""}\n#include <common>`)
    .replace("#include <tonemapping_fragment>", "// source VA omits tonemapping_fragment")
    .replace("#include <colorspace_fragment>", "// source VA omits colorspace_fragment")
    .replace("#include <fog_fragment>", "// source VA omits fog_fragment")
    .replace("#include <premultiplied_alpha_fragment>", "// source VA omits premultiplied_alpha_fragment")
    .replace("#include <dithering_fragment>", "// source VA omits dithering_fragment");
  if (variant === "work") {
    shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", workBlockSourceTailFragmentChunk);
    shader.fragmentShader = stripSourceVaFragmentPaths(shader.fragmentShader);
    shader.fragmentShader = stripSourceVaR164PhysicalBranches(shader.fragmentShader);
  } else {
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

function stripSourceVaR164PhysicalBranches(fragmentShader: string) {
  return fragmentShader
    .replace(/#ifdef USE_DISPERSION[\s\S]*?uniform float dispersion;[\s\S]*?#endif/g, "// source VA omits r164 dispersion uniforms")
    .replace(/#ifdef USE_ANISOTROPY[\s\S]*?uniform vec2 anisotropyVector;[\s\S]*?#ifdef USE_ANISOTROPYMAP[\s\S]*?uniform sampler2D anisotropyMap;[\s\S]*?#endif[\s\S]*?#endif/g, "// source VA omits r164 anisotropy uniforms");
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

const environmentFragmentShader = `
uniform float uDarken;
uniform vec3 uDarkenColor;
uniform sampler2D tSky;
uniform float uTime;
uniform float uMultiplier;
uniform float uShader1Alpha;
uniform float uShader1Speed;
uniform float uShader1Scale;
uniform float uShader2Alpha;
uniform float uShader2Scale;
uniform float uShader3Alpha;
uniform float uShader3Speed;
uniform float uShader3Scale;
uniform float uShader1Mix2;
uniform float uShader1Mix3;

varying vec2 vUv;

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
#include <uv_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>

float environmentBlendColorDodgeChannel(float base, float blend) {
  return blend == 1.0 ? blend : min(base / (1.0 - blend), 1.0);
}

vec3 environmentBlendColorDodge(vec3 base, vec3 blend, float opacity) {
  vec3 mixed = vec3(
    environmentBlendColorDodgeChannel(base.r, blend.r),
    environmentBlendColorDodgeChannel(base.g, blend.g),
    environmentBlendColorDodgeChannel(base.b, blend.b)
  );
  return mix(base, mixed, opacity);
}

vec3 environmentBlendNegation(vec3 base, vec3 blend, float opacity) {
  vec3 mixed = vec3(1.0) - abs(vec3(1.0) - base - blend);
  return mix(base, mixed, opacity);
}

vec3 environmentBlend(int mode, vec3 base, vec3 blend, float opacity) {
  if (mode == 4) return environmentBlendColorDodge(base, blend, opacity);
  if (mode == 16) return environmentBlendNegation(base, blend, opacity);
  return base;
}

float smoothMask(float coord, float center, float spread) {
  return (1.0 - smoothstep(coord, center, center - spread)) + (1.0 - smoothstep(coord, center, center + spread));
}

void main() {
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

  vec2 skyUv = vUv;
  vec2 skyUv2 = vUv;

  skyUv.x += 0.5;
  skyUv2.x -= 0.75;

  vec4 noise = texture2D(tSky, skyUv * 2.0);
  vec4 noise2 = texture2D(tSky, skyUv2);

  float m = 0.0;
  m = max(m, 1.0 - smoothstep(vUv.x, 0.00, 0.015));
  m = max(m, 1.0 - smoothstep(vUv.x, 1.015, 0.985));
  m = max(m, smoothMask(vUv.x, 0.5, 0.01));
  m = m * 1.0 - smoothMask(vUv.x, 0.75, 0.02);
  m = clamp(m, 0.0, 1.0);

  vec4 noiseMixed = mix(noise, noise2, m);
  diffuseColor.rgb = environmentBlend(4, diffuseColor.rgb, noiseMixed.rgb, 0.5);

  vec2 skyMaskUv = vUv;
  skyMaskUv.y -= 0.1;

  float skyMask = mod(skyMaskUv.y * 5.0, 1.0);
  skyMask = max(skyMask, step(0.6, skyMaskUv.y));

  diffuseColor.rgb = environmentBlend(16, diffuseColor.rgb, noiseMixed.rgb, skyMask);
  diffuseColor.rgb += vec3(smoothstep(vUv.y, 0.45, 0.595));

  float skyMask2 = mod(skyMaskUv.y * 2.5, 1.0);
  skyMask2 = max(skyMask, step(0.6, skyMaskUv.y));

  diffuseColor.rgb = mix(vec3(1.0), diffuseColor.rgb, skyMask2 * 1.5);
  diffuseColor.rgb *= 1.15;
  diffuseColor.rgb *= clamp(diffuseColor.rgb, vec3(0.0), vec3(1.0));

  #include <roughnessmap_fragment>
  #include <metalnessmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <lights_physical_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>

  vec3 totalDiffuse = reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

  #include <opaque_fragment>

  gl_FragColor.rgb = environmentBlend(4, gl_FragColor.rgb, uDarkenColor, uDarken);
  #include <dithering_fragment>
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

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tBlur;
uniform sampler2D tFluid;
uniform sampler2D tMouseSim;
uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;
uniform float uDarken;
uniform float uSaturation;

varying vec2 vUv;

vec3 saturation(vec3 color, float amount) {
  float gray = dot(color, vec3(0.2125, 0.7154, 0.0721));
  return mix(vec3(gray), color, amount);
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
  return max(blend, base) * opacity + base * (1.0 - opacity);
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return base * blend * opacity + base * (1.0 - opacity);
}

vec3 sourceBlend(int mode, vec3 base, vec3 blend, float opacity) {
  if (mode == 11) return blendLighten(base, blend, opacity);
  if (mode == 15) return blendMultiply(base, blend, opacity);
  return base;
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
  vec3 color = rgbshift(tScene, uv, -1.0, 0.0015).rgb;
  if (boolBloom) {
    vec3 bloom = rgbshift(tBloom, uv, -1.5, 0.02).rgb;
    float uBloomDistortion = 2.5;
    float amount = 0.001 * uBloomDistortion;
    vec3 bloomShift = rgbshift(tBloom, uv, length(uv + 0.5), amount / 0.5).rgb;
    color += bloom;
    color += bloomShift;
  }
  color += length(fluid.xy) * 0.015;
  float darkenOpacity = uDarken * 2.0 + mouseSim.r * 0.25 * uDarken;
  color = sourceBlend(15, color, vec3(0.095), darkenOpacity);
  color = sourceBlend(11, color, vec3(0.095), 1.0);
  color = saturation(color, uSaturation);

  gl_FragColor = vec4(color, 1.0);
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
    "vec3 color = rgbshift(tScene, uv, -1.0, 0.0015).rgb;",
    `vec3 color = rgbshift(tScene, uv, -1.0, 0.0015).rgb;
  if (uDebugTransferMode == 1) color = pow(max(color, vec3(0.0)), vec3(1.0 / 2.2));
  if (uDebugTransferMode == 2) color = pow(max(color, vec3(0.0)), vec3(2.2));
  if (uDebugStage == 1) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }`,
  )
  .replace(
    "color += bloomShift;\n  }\n  color += length(fluid.xy) * 0.015;",
    `color += bloomShift;
  }
  if (uDebugStage == 2) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }
  color += length(fluid.xy) * 0.015;`,
  )
  .replace(
    "color += length(fluid.xy) * 0.015;\n  float darkenOpacity = uDarken * 2.0 + mouseSim.r * 0.25 * uDarken;",
    `color += length(fluid.xy) * 0.015;
  if (uDebugStage == 3) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }
  float darkenOpacity = uDarken * 2.0 + mouseSim.r * 0.25 * uDarken;`,
  )
  .replace(
    "float darkenOpacity = uDarken * 2.0 + mouseSim.r * 0.25 * uDarken;\n  color = sourceBlend(15, color, vec3(0.095), darkenOpacity);",
    `float darkenOpacity = uDarken * 2.0 + mouseSim.r * 0.25 * uDarken;
  if (uDebugDarkenMode == 1) darkenOpacity = uDarken * 2.0;
  if (uDebugDarkenMode == 2) darkenOpacity = mouseSim.r * 0.25 * uDarken;
  if (uDebugDarkenMode == 3) darkenOpacity = 0.0;
  color = sourceBlend(15, color, vec3(0.095), darkenOpacity);
  if (uDebugStage == 4) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }`,
  )
  .replace(
    "color = sourceBlend(11, color, vec3(0.095), 1.0);\n  color = saturation(color, uSaturation);",
    `if (uDebugLightenMode != 1) {
    color = sourceBlend(11, color, vec3(0.095), 1.0);
  }
  if (uDebugStage == 5) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }
  color = saturation(color, uSaturation);`,
  );

const homePreCompositeFragment = `
precision highp float;

uniform sampler2D tWork;
uniform sampler2D tScene;
uniform sampler2D tFluid;
uniform sampler2D tMouseSim;
uniform sampler2D tNoise;
uniform sampler2D tPerlin;
uniform sampler2D tBloom;
uniform sampler2D tMedia;
uniform sampler2D tBlur;
uniform sampler2D tLensflare;
uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;
uniform float uTime;
uniform float uRatio;
uniform float uTransformX;
uniform float uFluidStrength;
uniform float uMediaReveal;
uniform float uDisplacement;
uniform float uPerlin;
uniform float uReveal;
uniform float uContrast;
uniform vec3 uBgColor;
uniform vec2 uDisplacementSize;
uniform vec2 uContainerSize;

varying vec2 vUv;

vec3 contrast(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}

vec3 saturation(vec3 color, float amount) {
  float gray = dot(color, vec3(0.2125, 0.7154, 0.0721));
  return mix(vec3(gray), color, amount);
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
  return max(blend, base) * opacity + base * (1.0 - opacity);
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
  return min(base + blend, vec3(1.0)) * opacity + base * (1.0 - opacity);
}

vec3 sourceBlend(int mode, vec3 base, vec3 blend, float opacity) {
  if (mode == 1) return blendAdd(base, blend, opacity);
  if (mode == 11) return blendLighten(base, blend, opacity);
  return base;
}

vec4 rgbshift(sampler2D tex, vec2 uv, float angle, float amount) {
  vec2 offset = vec2(cos(angle), sin(angle)) * amount;
  float r = texture2D(tex, uv + offset).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - offset).b;
  float a = texture2D(tex, uv).a;
  return vec4(r, g, b, a);
}

float vignette(vec2 uv, float vignin, float vignout, float vignfade, float fstop) {
  vec2 p = uv - 0.5;
  p.x *= uRatio;
  float dist = length(p);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
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

  float perlinVignette = vignette(perlinCoords, 0.1, 0.35, 2.0, 0.5);
  float displacementVignette = vignette(uv, 0.1, 0.5, 2.0, 0.5);
  vec4 sceneDisplaced = rgbshift(tWork, uv, -1.0, 0.005);
  vec4 scene = rgbshift(tWork, uv, -1.0, 0.0005 + 0.1 * length(fluid.xy) * uFluidStrength);
  vec3 color = mix(scene.rgb, sceneDisplaced.rgb, 1.0 - displacementVignette);
  color = mix(uBgColor, color, 1.0);
  color += mouseSim.rgb * 0.065;
  color = mix(color, color * 5.0, (1.0 - perlinVignette) * 0.075);
  color = sourceBlend(1, color, perlin.rgb, (1.0 - displacementVignette + mouseSim.r * 0.5) * 0.05);
  if (boolBloom) {
    vec3 bloom = rgbshift(tBloom, uv, -1.5, 0.02).rgb;
    float amount = 0.001 * 2.5;
    vec3 bloomShift = rgbshift(tBloom, uv, length(uv + 0.5), amount / 0.5).rgb;
    color += bloom + bloomShift;
  }
  color = contrast(color, uContrast);
  color *= uContrast;
  color = saturation(color, 1.15);
  color = sourceBlend(11, color, uBgColor, 0.85);

  vec4 media = rgbshift(tMedia, fluidUv, length(fluidUv + 2.5), 0.15 * length(fluid.xy) * uFluidStrength);
  color = mix(color, media.rgb, media.a * uMediaReveal);

  vec2 noiseUv = baseUv - 0.5;
  noiseUv.x *= uRatio;
  noiseUv += 0.5;
  noiseUv *= 15.0;
  vec3 noise = texture2D(tNoise, noiseUv).rgb;
  color = mix(color * noise, color, 0.75);
  color = mix(color * noise, color, 1.5);
  gl_FragColor = vec4(color, 1.0);
}
`;

const mainCompositeFragment = `
precision highp float;

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tBlur;
uniform sampler2D tFluid;
uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

varying vec2 vUv;

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
  uv = uv + fluid.rg * -0.15;
  vec4 mixed = rgbshift(tScene, uv, -1.0, 0.001);
  if (boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, 0.02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = 0.001 * uBloomDistortion;
    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / 0.5).rgb;
  }
  mixed.rgb += length(fluid.xy) * 0.015;
  gl_FragColor = vec4(mixed.rgb, 1.0);
}
`;

const homeLuminosityFragment = `
precision highp float;

uniform sampler2D tScene;
uniform float uThreshold;
uniform float uSmoothing;

varying vec2 vUv;

void main() {
  vec4 texel = texture2D(tScene, vUv);
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float value = dot(texel.xyz, luma);
  float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, value);
  gl_FragColor = mix(vec4(0.0), texel, alpha);
}
`;

const homeBloomBlurFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;
uniform vec2 uDirection;
uniform int uKernelRadius;
uniform float uSigma;

varying vec2 vUv;

float gaussianPdf(float x, float sigma) {
  return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

vec4 gaussianBlur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec2 invSize = 1.0 / resolution;
  float weightSum = gaussianPdf(0.0, uSigma);
  vec3 diffuseSum = texture2D(image, uv).rgb * weightSum;
  for (int i = 1; i < 12; i++) {
    if (i >= uKernelRadius) break;
    float x = float(i);
    float weight = gaussianPdf(x, uSigma);
    vec2 uvOffset = direction * invSize * x;
    vec3 sample1 = texture2D(image, uv + uvOffset).rgb;
    vec3 sample2 = texture2D(image, uv - uvOffset).rgb;
    diffuseSum += (sample1 + sample2) * weight;
    weightSum += 2.0 * weight;
  }
  return vec4(diffuseSum / weightSum, 1.0);
}

void main() {
  gl_FragColor = gaussianBlur(tMap, vUv, uResolution, uDirection);
}
`;

const floorReflectionBlurFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;

varying vec2 vUv;

float smootherstep(float edge0, float edge1, float x) {
  x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 sum = vec4(0.0);
  vec2 pixel = 1.0 / resolution;
  sum += texture2D(image, uv - 4.0 * pixel * direction) * 0.051;
  sum += texture2D(image, uv - 3.0 * pixel * direction) * 0.0918;
  sum += texture2D(image, uv - 2.0 * pixel * direction) * 0.12245;
  sum += texture2D(image, uv - 1.0 * pixel * direction) * 0.1531;
  sum += texture2D(image, uv) * 0.1633;
  sum += texture2D(image, uv + 1.0 * pixel * direction) * 0.1531;
  sum += texture2D(image, uv + 2.0 * pixel * direction) * 0.12245;
  sum += texture2D(image, uv + 3.0 * pixel * direction) * 0.0918;
  sum += texture2D(image, uv + 4.0 * pixel * direction) * 0.051;
  return sum;
}

void main() {
  vec2 distance = smootherstep(1.0, 0.0, vUv.y) * uDirection;
  vec4 mapped = texture2D(tMap, vUv);
  vec4 blurred = blur(tMap, vUv, uResolution, distance);
  gl_FragColor = mix(mapped, blurred, 1.25);
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

const homeFxaaFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  vec2 inverseVP = 1.0 / max(uResolution, vec2(1.0));
  vec3 rgbNW = texture2D(tMap, vUv + vec2(-1.0, -1.0) * inverseVP).rgb;
  vec3 rgbNE = texture2D(tMap, vUv + vec2(1.0, -1.0) * inverseVP).rgb;
  vec3 rgbSW = texture2D(tMap, vUv + vec2(-1.0, 1.0) * inverseVP).rgb;
  vec3 rgbSE = texture2D(tMap, vUv + vec2(1.0, 1.0) * inverseVP).rgb;
  vec3 rgbM = texture2D(tMap, vUv).rgb;
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM = dot(rgbM, luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
  vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));
  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.03125, 0.0078125);
  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = clamp(dir * rcpDirMin, vec2(-8.0), vec2(8.0)) * inverseVP;
  vec3 rgbA = 0.5 * (
    texture2D(tMap, vUv + dir * (1.0 / 3.0 - 0.5)).rgb +
    texture2D(tMap, vUv + dir * (2.0 / 3.0 - 0.5)).rgb
  );
  vec3 rgbB = rgbA * 0.5 + 0.25 * (
    texture2D(tMap, vUv + dir * -0.5).rgb +
    texture2D(tMap, vUv + dir * 0.5).rgb
  );
  float lumaB = dot(rgbB, luma);
  vec3 color = (lumaB < lumaMin || lumaB > lumaMax) ? rgbA : rgbB;
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
  vec4 col = oldTexture * (1.0 - uDiffusion);
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

uniform sampler2D tMap;
uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uTransitionCount;
uniform float uTransitionSmoothness;

in vec2 vUv;
out vec4 FragColor;

vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 size) {
  vec2 s = size;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((newSize.x - s.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - s.y) / 2.0)) / newSize;
  vec2 uv = ouv * s / newSize + newOffset;
  return texture(tex, uv);
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

const thumbCompositeFragment = `
precision highp float;

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uDarkenIntensity;
uniform vec3 uDarkenColor;
uniform float uSaturation;

in vec2 vUv;
out vec4 FragColor;

vec3 saturateColor(vec3 color, float amount) {
  float gray = dot(color, vec3(0.2125, 0.7154, 0.0721));
  return mix(vec3(gray), color, amount);
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return base * blend * opacity + base * (1.0 - opacity);
}

void main() {
  vec4 color = texture(tScene, vUv);
  color.rgb = blendMultiply(color.rgb, uDarkenColor, uDarkenIntensity);
  color.rgb = saturateColor(color.rgb, uSaturation);
  FragColor = vec4(color.rgb, 1.0);
  #include <tonemapping_fragment>
}
`;

const mediaCompositeFragment = `
precision highp float;

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tBlur;
uniform sampler2D tFluid;
uniform sampler2D tMouseSim;
uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(tScene, vUv);
  gl_FragColor = color;

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

const fluidBoundedVertex = `
precision mediump float;

uniform vec2 bounds;

varying vec2 vUv;

void main() {
  vec3 pos = position;
  vec2 scale = 1.0 - bounds * 2.0;
  pos.xy *= scale;
  vUv = vec2(0.5) + pos.xy * 0.5;
  gl_Position = vec4(pos, 1.0);
}
`;

const fluidForceVertex = `
precision mediump float;

uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;

varying vec2 vUv;

void main() {
  vec2 pos = position.xy * scale * 2.0 * px + center;
  vUv = uv;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const fluidAdvectionFragment = `
precision mediump float;

uniform sampler2D velocity;
uniform float dt;
uniform vec2 fboSize;

varying vec2 vUv;

void main() {
  vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
  vec2 spotNew = vUv;
  vec2 velOld = texture2D(velocity, vUv).xy;
  vec2 spotOld = spotNew - velOld * dt * ratio;
  vec2 velNew1 = texture2D(velocity, spotOld).xy;
  vec2 spotNew2 = spotOld + velNew1 * dt * ratio;
  vec2 error = spotNew2 - spotNew;
  vec2 spotNew3 = spotNew - error / 2.0;
  vec2 vel2 = texture2D(velocity, spotNew3).xy;
  vec2 spotOld2 = spotNew3 - vel2 * dt * ratio;
  vec2 newVel2 = texture2D(velocity, spotOld2).xy;
  gl_FragColor = vec4(newVel2, 0.0, 0.0);
}
`;

const fluidForceFragment = `
precision mediump float;

uniform vec2 force;

varying vec2 vUv;

void main() {
  vec2 circle = (vUv - 0.5) * 2.0;
  float d = 1.0 - min(length(circle), 1.0);
  d *= d;
  gl_FragColor = vec4(force * d, 0.0, 1.0);
}
`;

const fluidDivergenceFragment = `
precision mediump float;

uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;

varying vec2 vUv;

void main() {
  float x0 = texture2D(velocity, vUv - vec2(px.x, 0.0)).x;
  float x1 = texture2D(velocity, vUv + vec2(px.x, 0.0)).x;
  float y0 = texture2D(velocity, vUv - vec2(0.0, px.y)).y;
  float y1 = texture2D(velocity, vUv + vec2(0.0, px.y)).y;
  float divergence = (x1 - x0 + y1 - y0) / 2.0;
  gl_FragColor = vec4(divergence / dt);
}
`;

const fluidPoissonFragment = `
precision mediump float;

uniform sampler2D pressure;
uniform sampler2D divergence;
uniform vec2 px;

varying vec2 vUv;

void main() {
  float p0 = texture2D(pressure, vUv + vec2(px.x * 2.0, 0.0)).r;
  float p1 = texture2D(pressure, vUv - vec2(px.x * 2.0, 0.0)).r;
  float p2 = texture2D(pressure, vUv + vec2(0.0, px.y * 2.0)).r;
  float p3 = texture2D(pressure, vUv - vec2(0.0, px.y * 2.0)).r;
  float div = texture2D(divergence, vUv).r;
  float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
  gl_FragColor = vec4(newP);
}
`;

const fluidPressureFragment = `
precision mediump float;

uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;

varying vec2 vUv;

void main() {
  float step = 1.0;
  float p0 = texture2D(pressure, vUv + vec2(px.x * step, 0.0)).r;
  float p1 = texture2D(pressure, vUv - vec2(px.x * step, 0.0)).r;
  float p2 = texture2D(pressure, vUv + vec2(0.0, px.y * step)).r;
  float p3 = texture2D(pressure, vUv - vec2(0.0, px.y * step)).r;
  vec2 v = texture2D(velocity, vUv).xy;
  vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
  v = v - dt * gradP;
  gl_FragColor = vec4(v, 0.0, 1.0);
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

const skyCompositeFragment = `
precision highp float;

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

varying vec2 vUv;

float noiseShaderRandom(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  float res = mix(
    mix(noiseShaderRandom(ip), noiseShaderRandom(ip + vec2(1.0, 0.0)), u.x),
    mix(noiseShaderRandom(ip + vec2(0.0, 1.0)), noiseShaderRandom(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
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
  f += 0.062500 * noise(p - time * (speed * 5.0));
  p = mtx * p * 2.04;
  f += 0.015625 * noise(p + time * (speed * 5.0));

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

vec3 contrastColor(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
  vec3 mixed = vec3(
    blend.r == 1.0 ? blend.r : min(base.r * base.r / (1.0 - blend.r), 1.0),
    blend.g == 1.0 ? blend.g : min(base.g * base.g / (1.0 - blend.g), 1.0),
    blend.b == 1.0 ? blend.b : min(base.b * base.b / (1.0 - blend.b), 1.0)
  );
  return mix(base, mixed, opacity);
}

void main() {
  vec2 pos = vUv.xy * 4.0;
  pos.x *= 1.5;

  vec4 procedural = noiseShader(pos, uTime, uShader1Speed * 0.1);
  vec4 diffuseColor = texture2D(tScene, vUv);

  diffuseColor.rgb = blendReflect(diffuseColor.rgb, procedural.rgb, 0.5);
  diffuseColor.rgb = contrastColor(diffuseColor.rgb, 2.0);
  diffuseColor.rgb *= 2.0;

  gl_FragColor = vec4(0.9 - diffuseColor.rgb, 1.0);
  #include <tonemapping_fragment>
}
`;

const displacementFragment = `
precision highp float;

uniform float uTime;
uniform float uRatio;

varying vec2 vUv;

float vignette(vec2 coords, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, vec2(0.5));
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}

void main() {
  vec2 uvOff = vUv;
  uvOff.x -= 0.5;
  uvOff.x *= uRatio;
  uvOff.x += 0.5;

  vec2 uvVignette = uvOff;
  uvOff -= 0.5;
  uvOff *= 5.0;
  uvOff += 0.5;

  float strength = 1.0 - abs(sin(distance(uvOff, vec2(0.5)) - 0.5 - uTime));
  float vignetteF = vignette(uvVignette, 0.01, 0.5, 2.0, 0.4);
  gl_FragColor = vec4(vec3(strength * (1.0 - vignetteF)), 1.0);
}
`;

const floorFragment = `
precision mediump float;

uniform sampler2D tReflect;
uniform vec3 uColor;
uniform float uReflectivity;
uniform float uMirror;
uniform float uFloorMixStrength;
uniform float uNormalDistortionStrength;
uniform vec2 uNormalScale;
uniform sampler2D tNormalMap;

in vec2 vUv;
in vec4 vCoord;
in vec3 vNormal;
in vec3 vToEye;

out vec4 FragColor;

void main() {
  vec4 color = vec4(uColor, 1.0);
  vec4 normalColor = texture(tNormalMap, vUv * uNormalScale);
  vec3 normal = normalize(vec3(
    normalColor.r * uNormalDistortionStrength - (uNormalDistortionStrength / 2.0),
    normalColor.b,
    normalColor.g * uNormalDistortionStrength - (uNormalDistortionStrength / 2.0)
  ));
  vec3 coord = vCoord.xyz / vCoord.w;
  vec2 reflectUv = coord.xy + coord.z * normal.xz * 0.05;
  vec4 reflectColor = texture(tReflect, reflectUv);

  vec3 toEye = normalize(vToEye);
  float theta = max(dot(toEye, normal), 0.0);
  float reflectance = max(0.01, min(uReflectivity + (1.0 - uReflectivity) * pow((1.0 - theta), 5.0), 1.0));
  reflectColor = mix(vec4(0.0), reflectColor, reflectance);

  FragColor.rgb = color.rgb * ((1.0 - min(1.0, uMirror)) + reflectColor.rgb * uFloorMixStrength);
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
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  target.texture.generateMipmaps = false;
  target.texture.wrapS = ClampToEdgeWrapping;
  target.texture.wrapT = ClampToEdgeWrapping;
  target.texture.minFilter = LinearFilter;
  target.texture.magFilter = LinearFilter;
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

function makeFullscreenTriangle(material: ShaderMaterial) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
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

function setTextureQuality(texture: Texture, renderer: WebGLRenderer, colorSpace: typeof SRGBColorSpace | typeof NoColorSpace | "" = "") {
  texture.colorSpace = colorSpace;
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
  const planeWidth = GRID_COLS * MOUSE_PLANE_SCALE;
  const planeHeight = GRID_ROWS * MOUSE_PLANE_SCALE;
  const rayWidth = planeWidth * MOUSE_RAY_SCALE;
  const rayHeight = planeHeight * MOUSE_RAY_SCALE;
  return new Vector3((rayWidth - planeWidth) / 2 / planeWidth, (rayHeight - planeHeight) / 2 / planeHeight, 0);
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
  private backgroundScene = new Scene();
  private homeScene = new Scene();
  private skyScene = new Scene();
  private thumbScene = new Scene();
  private mediaScene = new Scene();
  private screenMouseSimulationScene = new Scene();
  private backgroundCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private homeCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private thumbCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private characterCamera = new PerspectiveCamera(30, 1, 0.1, 100);
  private mediaCamera = new PerspectiveCamera(55, 1, 1, 2000);
  private characterAmbientLight = new AmbientLight(colorFrom("white"), 1.2);
  private characterDirectionalLight = new DirectionalLight(colorFrom("white"), 2.5);
  private sceneWrap = new Group();
  private blocksWrap = new Group();
  private aboutBlocks?: AuxiliaryBlockItem;
  private floatingBlocks?: AuxiliaryBlockItem;
  private thumbWrap = new Group();
  private workItems: WorkItem[] = [];
  private mediaPlanes: MediaPlane[] = [];
  private loader = new TextureLoader();
  private cubeLoader = new CubeTextureLoader();
  private textureCache = new Map<string, Texture>();
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
  private skyCompositeScene = new Scene();
  private skyRawTarget = makeSourceRenderTarget(false);
  private skyCompositeTarget = makeSourceRenderTarget(false);
  private backgroundMaterial: ShaderMaterial;
  private compositeMaterial: ShaderMaterial;
  private compositeScene = new Scene();
  private workRawTarget = makeSourceRenderTarget(true);
  private workCompositeTarget = makeSourceRenderTarget(false);
  private backgroundTarget = makeSourceRenderTarget(false);
  private preCompositeMaterial: ShaderMaterial;
  private preCompositeScene = new Scene();
  private compositeTarget = makeSourceRenderTarget(false);
  private mainCompositeMaterial: ShaderMaterial;
  private mainCompositeScene = new Scene();
  private mainLensflareTarget = makeSourceRenderTarget(false);
  private mainBloomBrightTarget = makeSourceRenderTarget(false);
  private mainBloomHorizontalTargets: WebGLRenderTarget[] = [];
  private mainBloomVerticalTargets: WebGLRenderTarget[] = [];
  private mainBloomCompositeMaterial: ShaderMaterial;
  private mainBloomCompositeScene = new Scene();
  private mainBloomBlurMaterial: ShaderMaterial;
  private mainBloomBlurScene = new Scene();
  private mediaRawTarget = makeSourceRenderTarget(false);
  private mediaTarget = makeSourceRenderTarget(false);
  private mediaCompositeMaterial: ShaderMaterial;
  private mediaCompositeScene = new Scene();
  private luminosityMaterial: ShaderMaterial;
  private luminosityScene = new Scene();
  private bloomBlurMaterial: ShaderMaterial;
  private bloomBlurScene = new Scene();
  private bloomBrightTarget = makeSourceRenderTarget(false);
  private bloomHorizontalTargets: WebGLRenderTarget[] = [];
  private bloomVerticalTargets: WebGLRenderTarget[] = [];
  private bloomCompositeMaterial: ShaderMaterial;
  private bloomCompositeScene = new Scene();
  private blurHorizontalMaterial: ShaderMaterial;
  private blurHorizontalScene = new Scene();
  private blurVerticalMaterial: ShaderMaterial;
  private blurVerticalScene = new Scene();
  private blurTargetA = makeSourceRenderTarget(false);
  private blurTargetB = makeSourceRenderTarget(false);
  private fxaaMaterial: ShaderMaterial;
  private fxaaScene = new Scene();
  private fxaaTarget = makeSourceRenderTarget(false);
  private displacementMaterial: ShaderMaterial;
  private displacementScene = new Scene();
  private displacementTarget = new WebGLRenderTarget(128, 128, { depthBuffer: false, stencilBuffer: false });
  private floorReflectionTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  private floorReflectionReadTarget = makeSourceRenderTarget(false);
  private floorReflectionWriteTarget = makeSourceRenderTarget(false);
  private floorReflectionCamera = new PerspectiveCamera();
  private floorReflectionMatrix = new Matrix4();
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
  private floorReflectionBlurMaterial: ShaderMaterial;
  private floorReflectionBlurScene = new Scene();
  private screenMouseSimulationMaterial: ShaderMaterial;
  private screenMouseSimulationTargets: WebGLRenderTarget[] = [];
  private screenMouseSimulationIndex = 0;
  private mainFluidPass: MainFluidPass;
  private thumbCompositeMaterial: ShaderMaterial;
  private thumbCompositeScene = new Scene();
  private characterMaterial: ShaderMaterial;
  private characterScene = new Scene();
  private characterModelRoot = new Group();
  private characterFallbackMesh: Mesh<PlaneGeometry, ShaderMaterial>;
  private characterTarget = makeSourceRenderTarget(false);
  private floorMaterial: ShaderMaterial;
  private floorGroup = new Group();
  private floorReflector = new Object3D();
  private floorPlane: Mesh<CircleGeometry, ShaderMaterial>;
  private environmentMaterial: EnvironmentMaterial;
  private environmentPlane: Mesh<IcosahedronGeometry, EnvironmentMaterial>;
  private thumbTarget = new WebGLRenderTarget(1024, 1024, { depthBuffer: false, stencilBuffer: false });
  private thumbCompositeTarget = new WebGLRenderTarget(1024, 1024, { depthBuffer: false, stencilBuffer: false });
  private raycaster = new Raycaster();
  private raf = 0;
  private pointer = new Vector2();
  private targetPointer = new Vector2();
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
  private cameraControllerGroup = new Group();
  private cameraRotateGroup = new Group();
  private cameraInnerGroup = new Group();
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
  private spotLightIntensity = 220;
  private directionalLightIntensity = 1.5;
  private directionalLight2Intensity = 1;
  private spotLightPosition = new Vector3(0, 0, 3.7);
  private spotLightTarget = new Vector3(0, 0, -8);
  private spotLightRight = new Vector3(1, 0, 0);
  private spotLightUp = new Vector3(0, 1, 0);
  private spotLightParallax = true;
  private debugDisableHomeSpotlightMap = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug-spotlight-map") === "off";
  private debugSkyTarget = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-sky-target") : null;
  private debugTextureColorSpace = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-texture-colorspace") : null;
  private debugPassOrder = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-pass-order") : null;
  private debugThumbColorSpace = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debug-thumb-colorspace") : null;
  private debugThumbProbe = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug-thumb-probe");
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
  private sourceUpdateOrder = "Iu.renderManager -> IT.cameraController -> p1.components";
  private sourcePostRenderFrame = 0;
  private fluidStrength = 0.5;
  private darken = 0.1;
  private saturation = 1.15;
  private contrast = 1.1;
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
    this.characterCamera.position.set(0, 0, 12);
    this.characterCamera.lookAt(0, 0, 0);
    this.mediaCamera.position.set(0, 0, 1000);
    this.skyScene.background = sourceLinearToSrgbColor("#666666", "#666666");
    this.homeScene.fog = new Fog("grey", 0, 100);
    this.homeScene.background = sourceLinearToSrgbColor(SOURCE_WORK_BG, SOURCE_WORK_BG);
    this.spotLight.position.copy(this.spotLightPosition);
    this.spotLight.target.position.copy(this.spotLightTarget);
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
    this.skyCompositeScene.add(makeFullscreenTriangle(this.skyCompositeMaterial));
    this.skyCompositeTarget.texture.wrapS = RepeatWrapping;
    this.skyCompositeTarget.texture.wrapT = RepeatWrapping;
    this.backgroundMaterial = this.createBackgroundMaterial();
    this.backgroundScene.add(makeFullscreenTriangle(this.backgroundMaterial));
    this.preCompositeMaterial = this.createPreCompositeMaterial();
    this.preCompositeScene.add(makeFullscreenTriangle(this.preCompositeMaterial));
    this.mainCompositeMaterial = this.createMainCompositeMaterial();
    this.mainCompositeScene.add(makeFullscreenTriangle(this.mainCompositeMaterial));
    this.compositeMaterial = this.createCompositeMaterial();
    this.compositeScene.add(makeFullscreenTriangle(this.compositeMaterial));
    this.bloomHorizontalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));
    this.bloomVerticalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));
    this.mainBloomHorizontalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));
    this.mainBloomVerticalTargets = Array.from({ length: 5 }, () => makeSourceRenderTarget(false));
    this.luminosityMaterial = this.createLuminosityMaterial();
    this.luminosityScene.add(makeFullscreenTriangle(this.luminosityMaterial));
    this.bloomBlurMaterial = this.createBloomBlurMaterial();
    this.bloomBlurScene.add(makeFullscreenTriangle(this.bloomBlurMaterial));
    this.bloomCompositeMaterial = this.createBloomCompositeMaterial(this.bloomVerticalTargets);
    this.bloomCompositeScene.add(makeFullscreenTriangle(this.bloomCompositeMaterial));
    this.mainBloomBlurMaterial = this.createBloomBlurMaterial();
    this.mainBloomBlurScene.add(makeFullscreenTriangle(this.mainBloomBlurMaterial));
    this.mainBloomCompositeMaterial = this.createBloomCompositeMaterial(this.mainBloomVerticalTargets, this.sourceMainRenderSettings);
    this.mainBloomCompositeScene.add(makeFullscreenTriangle(this.mainBloomCompositeMaterial));
    this.mediaCompositeMaterial = this.createMediaCompositeMaterial();
    this.mediaCompositeScene.add(makeFullscreenTriangle(this.mediaCompositeMaterial));
    this.blurHorizontalMaterial = this.createBloomBlurMaterial();
    this.blurHorizontalMaterial.uniforms.uKernelRadius.value = this.renderSettings.blur.strength;
    this.blurHorizontalMaterial.uniforms.uSigma.value = this.renderSettings.blur.strength;
    this.blurHorizontalMaterial.uniforms.uDirection.value.set(1, 0);
    this.blurHorizontalScene.add(makeFullscreenTriangle(this.blurHorizontalMaterial));
    this.blurVerticalMaterial = this.createBloomBlurMaterial();
    this.blurVerticalMaterial.uniforms.uKernelRadius.value = this.renderSettings.blur.strength;
    this.blurVerticalMaterial.uniforms.uSigma.value = this.renderSettings.blur.strength;
    this.blurVerticalMaterial.uniforms.uDirection.value.set(0, 1);
    this.blurVerticalScene.add(makeFullscreenTriangle(this.blurVerticalMaterial));
    this.fxaaMaterial = this.createFxaaMaterial();
    this.fxaaScene.add(makeFullscreenTriangle(this.fxaaMaterial));
    this.gridLayers = sourceLowRes() ? SOURCE_LOW_RES_GRID_LAYERS : SOURCE_GRID_LAYERS;
    this.displacementMaterial = this.createDisplacementMaterial();
    this.displacementScene.add(makeFullscreenTriangle(this.displacementMaterial));
    this.floorReflectionTarget.depthBuffer = true;
    this.floorReflectionTarget.texture.generateMipmaps = false;
    this.floorReflectionTarget.texture.minFilter = LinearFilter;
    this.floorReflectionTarget.texture.magFilter = LinearFilter;
    this.floorReflectionReadTarget.texture.generateMipmaps = false;
    this.floorReflectionReadTarget.texture.minFilter = LinearFilter;
    this.floorReflectionReadTarget.texture.magFilter = LinearFilter;
    this.floorReflectionWriteTarget.texture.generateMipmaps = false;
    this.floorReflectionWriteTarget.texture.minFilter = LinearFilter;
    this.floorReflectionWriteTarget.texture.magFilter = LinearFilter;
    this.floorReflectionBlurMaterial = this.createFloorReflectionBlurMaterial();
    this.floorReflectionBlurScene.add(makeFullscreenTriangle(this.floorReflectionBlurMaterial));
    this.screenMouseSimulationMaterial = this.createMouseSimulationMaterial(window.innerWidth / Math.max(1, window.innerHeight));
    this.screenMouseSimulationTargets = Array.from({ length: 2 }, makeSimulationTarget);
    this.screenMouseSimulationScene.add(makeFullscreenTriangle(this.screenMouseSimulationMaterial));
    this.mainFluidPass = this.createMainFluidPass();
    this.thumbCompositeMaterial = this.createThumbCompositeMaterial();
    this.thumbCompositeScene.add(makeFullscreenTriangle(this.thumbCompositeMaterial));
    this.characterMaterial = this.createCharacterMaterial();
    this.characterFallbackMesh = new Mesh(new PlaneGeometry(2, 2), this.characterMaterial);
    this.characterDirectionalLight.position.set(2, 3, 5);
    this.characterScene.add(this.characterFallbackMesh);
    this.characterScene.add(this.characterModelRoot);
    this.characterScene.add(this.characterAmbientLight);
    this.characterScene.add(this.characterDirectionalLight);
    [this.thumbTarget, this.thumbCompositeTarget].forEach((target) => {
      target.texture.generateMipmaps = false;
      target.texture.minFilter = LinearFilter;
      target.texture.magFilter = LinearFilter;
      target.texture.wrapS = ClampToEdgeWrapping;
      target.texture.wrapT = ClampToEdgeWrapping;
    });
    if (this.debugThumbColorSpace === "both-srgb") {
      this.thumbTarget.texture.colorSpace = SRGBColorSpace;
      this.thumbCompositeTarget.texture.colorSpace = SRGBColorSpace;
    } else if (this.debugThumbColorSpace === "composite-srgb") {
      this.thumbCompositeTarget.texture.colorSpace = SRGBColorSpace;
    }
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
    this.environmentPlane.position.y = -12.65;
    this.homeScene.add(this.sceneWrap);
    this.sceneWrap.add(this.blocksWrap);
    this.sceneWrap.add(this.floorGroup);
    this.sceneWrap.add(this.environmentPlane);
    this.thumbScene.background = sourceLinearToSrgbColor("#222222");
    this.thumbScene.add(this.thumbWrap);

    this.createWorkScene();
    this.createAuxiliaryBlocks();
    this.createMediaPlanes();
    this.loadCompositeTextures();

    this.resize();
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
    this.setDarken(numeric(payload.darkness, 0.25), 0.5);
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setSaturation(numeric(payload.saturation, 1));
    this.setContrast(numeric(payload.contrast, 1.15));
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
    this.spotLightPosition.set(0, 0, 3.7);
    this.spotLightTarget.set(0, 0, -8);
    this.setSpotLightIntensity(this.maxSpotLightIntensity, 0);
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
    this.setDarken(numeric(payload.darkness, 0.25));
    this.setAmbientLight(ambientColor, ambientIntensity);
    this.setMediaBackground(payload.mediaColor ?? payload.color);
    this.setSaturation(numeric(payload.saturation, 1));
    this.setContrast(numeric(payload.contrast, 1.15));
    this.setFluidStrength(1);
  }

  enterAboutVisualState(visual?: HTMLElement | null, floating?: HTMLElement | null) {
    this.auxiliaryRevealTweens.forEach((tween) => tween.kill());
    this.auxiliaryRevealTweens = [];
    this.setMainColor(DEFAULT_COLOR, 0);
    this.setDarken(0.2, 0.5);
    this.setSaturation(0.35);
    this.setContrast(1.1);
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
    this.setSaturation(numeric(payload.saturation, 1));
    this.setContrast(numeric(payload.contrast, 1.15));
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
    window.removeEventListener("pointerdown", this.onPointerMove);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerMove);
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
    this.workCompositeTarget.dispose();
    this.backgroundTarget.dispose();
    this.preCompositeMaterial.dispose();
    this.compositeTarget.dispose();
    this.mainCompositeMaterial.dispose();
    this.mainLensflareTarget.dispose();
    this.mediaRawTarget.dispose();
    this.mediaTarget.dispose();
    this.mediaCompositeMaterial.dispose();
    this.compositeMaterial.dispose();
    this.bloomBrightTarget.dispose();
    this.bloomHorizontalTargets.forEach((target) => target.dispose());
    this.bloomVerticalTargets.forEach((target) => target.dispose());
    this.mainBloomBrightTarget.dispose();
    this.mainBloomHorizontalTargets.forEach((target) => target.dispose());
    this.mainBloomVerticalTargets.forEach((target) => target.dispose());
    this.luminosityMaterial.dispose();
    this.bloomBlurMaterial.dispose();
    this.bloomCompositeMaterial.dispose();
    this.mainBloomBlurMaterial.dispose();
    this.mainBloomCompositeMaterial.dispose();
    this.blurHorizontalMaterial.dispose();
    this.blurVerticalMaterial.dispose();
    this.blurTargetA.dispose();
    this.blurTargetB.dispose();
    this.fxaaMaterial.dispose();
    this.fxaaTarget.dispose();
    this.displacementTarget.dispose();
    this.floorReflectionTarget.dispose();
    this.floorReflectionReadTarget.dispose();
    this.floorReflectionWriteTarget.dispose();
    this.floorReflectionBlurMaterial.dispose();
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
      const rayPlane = this.createWorkRayPlane();
      const mouseSimulation = this.createWorkMouseSimulation();
      const group = new Group();
      group.add(mesh);
      group.add(rayPlane);
      if (payload.slug === "demorgen") rotationAdjustment = -theta * index;
      group.position.x = -Math.sin(MathUtils.degToRad(theta * index)) * this.radius;
      group.position.z = Math.cos(MathUtils.degToRad(theta * index)) * this.radius;
      group.lookAt(0, 0, 0);
      this.blocksWrap.add(group);
      this.thumbWrap.add(thumb);
      this.workItems.push({
        slug: card.dataset.slug ?? String(index),
        payload,
        group,
        material,
        mesh,
        thumb,
        thumbXHook: 0,
        thumbYHook: 0,
        rayPlane,
        mouseMaterial: mouseSimulation.material,
        mouseScene: mouseSimulation.scene,
        mouseTargets: mouseSimulation.targets,
        mouseIndex: 0,
        mouseTarget: new Vector2(0.5, 0.5),
        mouseOld: new Vector2(0.5, 0.5),
        mouseNew: new Vector2(0.5, 0.5),
        mouseSpeed: 0,
        reveal: card.classList.contains("is-active") ? 1 : 0,
      });
      if (payload.thumb) this.loadTexture(payload.thumb, (texture) => {
        thumb.material.uniforms.tMap.value = texture;
        thumb.material.uniforms.uMapSize.value.set(1, 1);
        thumb.material.uniforms.uResolution.value.set(1, 1);
      });
    });
    this.thumbTotalItems = this.workItems.length;
    this.calcThumbItemWidth();
    this.environmentPlane.rotation.y = -MathUtils.degToRad(rotationAdjustment);
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
      toneMapped: false,
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
    mesh.scale.setScalar(GRID_SCALE);
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
      uUvOffset: { value: new Vector3(0, 0, 0) },
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
      toneMapped: false,
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
    const rotationWrap = new Group();
    const scaleWrap = new Group();
    const group = new Group();
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
    const group = new Group();
    const rotationWrap = new Group();
    const scaleWrap = new Group();
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

  private createThumbPlane(payload: ProjectPayload) {
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
        uAmbientColor: { value: colorFrom(SOURCE_INITIAL_SECONDARY) },
        uAmbientIntensity: { value: SOURCE_INITIAL_AMBIENT },
      },
      vertexShader: backgroundVertex,
      fragmentShader: backgroundFragment,
    });
  }

  private createCompositeMaterial() {
    const settings = this.renderSettings;
    dumpShader("OA-work-composite", backgroundVertex, homeCompositeFragment);
    const fragmentShader = this.debugCompositeShader ? homeCompositeDebugFragment : homeCompositeFragment;
    const uniforms: Record<string, { value: any }> = {
      tScene: { value: this.compositeTarget.texture },
      tBloom: { value: this.fluidPlaceholder },
      tBlur: { value: this.fluidPlaceholder },
      tFluid: { value: this.fluidPlaceholder },
      tMouseSim: { value: this.screenMouseSimulationTexture },
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
    }
    return new ShaderMaterial({
      toneMapped: false,
      transparent: true,
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms,
      vertexShader: backgroundVertex,
      fragmentShader,
    });
  }

  private createPreCompositeMaterial() {
    dumpShader("A1-pre-composite", backgroundVertex, homePreCompositeFragment);
    return new ShaderMaterial({
      toneMapped: false,
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tWork: { value: this.workRawTarget.texture },
        tScene: { value: this.compositeTarget.texture },
        tFluid: { value: this.fluidPlaceholder },
        tMouseSim: { value: this.screenMouseSimulationTexture },
        tNoise: { value: this.noiseTexture },
        tPerlin: { value: this.perlinTexture },
        tBloom: { value: this.fluidPlaceholder },
        tMedia: { value: this.fluidPlaceholder },
        tPortal: { value: this.fluidPlaceholder },
        tBlur: { value: this.fluidPlaceholder },
        tLensflare: { value: this.mainLensflareTarget.texture },
        boolBloom: { value: this.renderSettings.bloom.enabled },
        boolFluid: { value: this.renderSettings.fluid.enabled },
        boolLuminosity: { value: this.renderSettings.luminosity.enabled },
        boolFxaa: { value: this.renderSettings.fxaa.enabled },
        uTime: { value: 0 },
        uRatio: { value: 1 },
        uTransformX: { value: 0 },
        uFluidStrength: { value: this.fluidStrength },
        uMediaReveal: { value: 0 },
        uDisplacement: { value: 0.1 },
        uPerlin: { value: 0.1 },
        uReveal: { value: 0 },
        uContrast: { value: this.contrast },
        uBgColor: { value: sourceLinearToSrgbColor(SOURCE_COMPOSITE_BG) },
        uDisplacementSize: { value: new Vector2(1, 1) },
        uContainerSize: { value: new Vector2(1, 1) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homePreCompositeFragment,
    });
  }

  private createMainCompositeMaterial() {
    const settings = this.sourceMainRenderSettings;
    dumpShader("Lu-main-composite", backgroundVertex, mainCompositeFragment);
    return new ShaderMaterial({
      toneMapped: false,
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.compositeTarget.texture },
        tBloom: { value: this.fluidPlaceholder },
        tBlur: { value: this.fluidPlaceholder },
        tFluid: { value: this.fluidPlaceholder },
        boolBloom: { value: settings.bloom.enabled },
        boolFluid: { value: settings.fluid.enabled },
        boolLuminosity: { value: settings.luminosity.enabled },
        boolFxaa: { value: settings.fxaa.enabled },
      },
      vertexShader: backgroundVertex,
      fragmentShader: mainCompositeFragment,
    });
  }

  private createMediaCompositeMaterial() {
    dumpShader("j1-media-composite", backgroundVertex, mediaCompositeFragment);
    return new ShaderMaterial({
      toneMapped: false,
      transparent: true,
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.mediaRawTarget.texture },
        tBloom: { value: this.fluidPlaceholder },
        tBlur: { value: this.fluidPlaceholder },
        tFluid: { value: this.fluidPlaceholder },
        tMouseSim: { value: this.fluidPlaceholder },
        boolBloom: { value: false },
        boolFluid: { value: false },
        boolLuminosity: { value: false },
        boolFxaa: { value: false },
      },
      vertexShader: backgroundVertex,
      fragmentShader: mediaCompositeFragment,
    });
  }

  private createLuminosityMaterial() {
    const { luminosity } = this.renderSettings;
    return new ShaderMaterial({
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.compositeTarget.texture },
        uThreshold: { value: luminosity.threshold },
        uSmoothing: { value: luminosity.smoothing },
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
        uKernelRadius: { value: 3 },
        uSigma: { value: 3 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeBloomBlurFragment,
    });
  }

  private createBloomCompositeMaterial(verticalTargets: WebGLRenderTarget[], settings = this.renderSettings) {
    const factors = sourceBloomFactors(settings.bloom.strength, settings.bloom.radius);
    return new ShaderMaterial({
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tBloom1: { value: verticalTargets[0].texture },
        tBloom2: { value: verticalTargets[1].texture },
        tBloom3: { value: verticalTargets[2].texture },
        tBloom4: { value: verticalTargets[3].texture },
        tBloom5: { value: verticalTargets[4].texture },
        uFactor1: { value: factors[0] },
        uFactor2: { value: factors[1] },
        uFactor3: { value: factors[2] },
        uFactor4: { value: factors[3] },
        uFactor5: { value: factors[4] },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeBloomCompositeFragment,
    });
  }

  private createFloorReflectionBlurMaterial() {
    return new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: this.floorReflectionTarget.texture },
        uDirection: { value: new Vector2(1, 0) },
        uResolution: { value: new Vector2(1, 1) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: floorReflectionBlurFragment,
    });
  }

  private createFxaaMaterial() {
    return new ShaderMaterial({
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: this.compositeTarget.texture },
        uResolution: { value: new Vector2(1, 1) },
      },
      vertexShader: backgroundVertex,
      fragmentShader: homeFxaaFragment,
    });
  }

  private loadCompositeTextures() {
    this.loadTexture("/images/textures/blue-noise.png", (texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      this.preCompositeMaterial.uniforms.tNoise.value = texture;
      this.workItems.forEach((item) => {
        item.mouseMaterial.uniforms.uNoiseTexture.value = texture;
      });
      this.screenMouseSimulationMaterial.uniforms.uNoiseTexture.value = texture;
    });
    this.loadTexture("/images/textures/perlin-2.webp", (texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      this.perlinTexture = texture;
      this.preCompositeMaterial.uniforms.tPerlin.value = texture;
    });
    this.loadTexture("/images/textures/perlin-1.webp", (texture) => {
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      this.workPerlinTexture = texture;
      this.workItems.forEach((item) => {
        item.material.uniforms.tPerlin.value = texture;
      });
      if (this.aboutBlocks) this.aboutBlocks.material.uniforms.tPerlin.value = texture;
      if (this.floatingBlocks) this.floatingBlocks.material.uniforms.tPerlin.value = texture;
    });
    this.loadTexture("/images/textures/floor-normal.webp", (texture) => {
      texture.colorSpace = NoColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(45, 45);
      texture.updateMatrix();
      this.floorMaterial.uniforms.tNormalMap.value = texture;
      this.floorMaterial.uniforms.uMapTransform.value = texture.matrix;
    });
    this.loadTexture("/models/me/model_T.jpg", (texture) => {
      this.characterMaterial.uniforms.tMap.value = texture;
    });
    this.loadCharacterModel();
    const cubeExt = "webp";
    const cubeBase = "/images/cubemaps/01";
    this.cubeLoader.load(
      ["px", "nx", "ny", "py", "pz", "nz"].map((side) => `${cubeBase}/${side}.${cubeExt}`),
      (texture) => {
        this.homeScene.environment = texture;
      },
      undefined,
      () => {
        this.cubeLoader.load(
          ["px", "nx", "ny", "py", "pz", "nz"].map((side) => `${cubeBase}/${side}.jpg`),
          (texture) => {
            this.homeScene.environment = texture;
          },
        );
      },
    );
  }

  private createSkyCompositeMaterial() {
    return new ShaderMaterial({
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: NormalBlending,
      uniforms: {
        tScene: { value: this.skyRawTarget.texture },
        uTime: { value: 0 },
        uShader1Alpha: { value: 0.5 },
        uShader1Speed: { value: 0.5 },
        uShader2Speed: { value: 0 },
        uShader1Scale: { value: 5.5 },
        uShader2Scale: { value: 0 },
        uShader1Mix3: { value: 1.5 },
        uShader3Scale: { value: 0 },
        uShaderMix: { value: 1.5 },
      },
      vertexShader: backgroundVertex,
      fragmentShader: skyCompositeFragment,
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
    const advectionMaterial = new ShaderMaterial({
      blending: NormalBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        bounds: { value: cellScale },
        fboSize: { value: fboSize },
        velocity: { value: this.fluidPlaceholder },
        dt: { value: settings.delta },
      },
      vertexShader: fluidBoundedVertex,
      fragmentShader: fluidAdvectionFragment,
    });
    const forceMaterial = new ShaderMaterial({
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
    const divergenceMaterial = new ShaderMaterial({
      blending: NormalBlending,
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
    const poissonMaterial = new ShaderMaterial({
      blending: NormalBlending,
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
    const pressureMaterial = new ShaderMaterial({
      blending: NormalBlending,
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
      advectionScene: makeBoundedScene(advectionMaterial),
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
    pass.forceMaterial.dispose();
    pass.divergenceMaterial.dispose();
    pass.poissonMaterial.dispose();
    pass.pressureMaterial.dispose();
    Object.values(pass.targets).forEach((target) => target.dispose());
  }

  private createThumbCompositeMaterial() {
    dumpShader("x1-thumb-composite", thumbCompositeVertex, thumbCompositeFragment);
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: this.thumbTarget.texture },
        uDarkenIntensity: { value: 0 },
        uDarkenColor: { value: sourceRgbColor("#000000", "#000000") },
        uSaturation: { value: 1 },
      },
      vertexShader: thumbCompositeVertex,
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
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      defines: {
        USE_NORMALMAP: "",
      },
      uniforms: {
        tReflect: {
          value: this.debugFloorReflection === "raw-sample"
            ? this.floorReflectionTarget.texture
            : this.floorReflectionReadTarget.texture,
        },
        uMapTransform: { value: new Matrix3().identity() },
        uMatrix: { value: this.floorReflectionMatrix },
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
      uShader1Mix2: { value: 0 },
      uShader1Mix3: { value: 1.5 },
    };
    const material = new MeshStandardMaterial({
      side: BackSide,
      envMapIntensity: 1,
      fog: false,
      dithering: true,
    }) as EnvironmentMaterial;
    material.uniforms = uniforms;
    material.onBeforeCompile = (shader) => {
      patchEnvironmentShader(shader, uniforms);
    };
    material.customProgramCacheKey = () => "source-u1-environment-standard";
    return material;
  }

  private createWorkRayPlane() {
    const material = new MeshBasicMaterial({ visible: false });
    const mesh = new Mesh(
      new PlaneGeometry(
        GRID_COLS * MOUSE_PLANE_SCALE * GRID_SCALE * MOUSE_RAY_SCALE,
        GRID_ROWS * MOUSE_PLANE_SCALE * GRID_SCALE * MOUSE_RAY_SCALE,
      ),
      material,
    );
    mesh.position.set(0, 0, (GRID_ROWS * MOUSE_PLANE_SCALE / 2 + 0.01) * GRID_SCALE);
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
        setTextureQuality(texture, this.renderer, this.loadedTextureColorSpace());
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
      setTextureQuality(texture, this.renderer, this.loadedTextureColorSpace());
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
    this.projectRevealProjectTweens.forEach((tween) => tween.kill());
    this.projectRevealTweens = [];
    this.projectRevealProjectTweens = [];
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
      this.environmentMaterial.uniforms.uDarkenColor.value.copy(next);
      this.backgroundMaterial.uniforms.uAmbientIntensity.value = intensity;
      return;
    }
    this.ambientTweens.push(gsap.to(this.ambientLight.color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.ambientLight, { intensity, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.backgroundMaterial.uniforms.uAmbientColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
    this.ambientTweens.push(gsap.to(this.environmentMaterial.uniforms.uDarkenColor.value as Color, { r: next.r, g: next.g, b: next.b, duration, ease: "expo.out" }));
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
    if (duration <= 0) {
      this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value = value;
      return;
    }
    this.thumbDarknessTweens.push(gsap.to(this.thumbCompositeMaterial.uniforms.uDarkenIntensity, { value, duration, ease: "expo.out" }));
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
    if (duration <= 0) {
      this.thumbCompositeMaterial.uniforms.uSaturation.value = value;
      return;
    }
    this.thumbSaturationTweens.push(gsap.to(this.thumbCompositeMaterial.uniforms.uSaturation, { value, duration, ease: "expo.out" }));
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
    tweenColorOwned(this.thumbCompositeMaterial.uniforms.uDarkenColor.value as Color, value ?? "#000000", duration, this.thumbDarknessColorTweens, "#000000");
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
      this.spotLight.intensity = this.spotLightIntensity;
      this.updateSpotLightBasis();
    };
    if (duration <= 0) {
      this.spotLightIntensity = value;
      update();
      return;
    }
    this.spotLightTween = gsap.to(this, {
      spotLightIntensity: value,
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
    if (duration <= 0) {
      this.directionalLightIntensity = value;
      this.directionalLight.intensity = value;
      return;
    }
    this.directionalLightTween = gsap.to(this, {
      directionalLightIntensity: value,
      duration,
      ease,
      onUpdate: () => {
        this.directionalLight.intensity = this.directionalLightIntensity;
      },
    });
  }

  private setDirectionalLight2Intensity(value: number, duration = 1.6, ease = "expo.out") {
    this.directionalLight2Tween?.kill();
    if (duration <= 0) {
      this.directionalLight2Intensity = value;
      this.directionalLight2.intensity = value;
      return;
    }
    this.directionalLight2Tween = gsap.to(this, {
      directionalLight2Intensity: value,
      duration,
      ease,
      onUpdate: () => {
        this.directionalLight2.intensity = this.directionalLight2Intensity;
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
    const cached = this.textureCache.get(src);
    if (cached) {
      onLoad(cached);
      return;
    }
    this.loader.load(src, (texture) => {
      setTextureQuality(texture, this.renderer, this.loadedTextureColorSpace());
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

  private get screenMouseSimulationTexture() {
    return this.screenMouseSimulationTargets[this.screenMouseSimulationIndex]?.texture ?? this.placeholder;
  }

  private bind() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("pointerdown", this.onPointerMove, { passive: true });
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerup", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  private onPointerMove = (event: PointerEvent) => {
    this.pointerPixels.set(event.clientX, event.clientY);
    this.targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    this.targetPointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    this.screenMouseSimTargetPos.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
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
    if (this.sourceMainRenderSettings.fxaa.enabled) {
      this.fxaaTarget.setSize(renderWidth, renderHeight);
      this.fxaaMaterial.uniforms.uResolution.value.set(renderWidth, renderHeight);
    }
    if (this.sourceMainRenderSettings.blur.enabled) {
      const blurWidth = Math.max(1, Math.round(width * this.sourceMainRenderSettings.blur.scale));
      const blurHeight = Math.max(1, Math.round(height * this.sourceMainRenderSettings.blur.scale));
      this.blurTargetA.setSize(blurWidth, blurHeight);
      this.blurTargetB.setSize(blurWidth, blurHeight);
      this.blurHorizontalMaterial.uniforms.uResolution.value.set(width, height);
      this.blurVerticalMaterial.uniforms.uResolution.value.set(width, height);
    }
    this.workRawTarget.setSize(renderWidth, renderHeight);
    this.workCompositeTarget.setSize(renderWidth, renderHeight);
    this.backgroundTarget.setSize(renderWidth, renderHeight);
    this.compositeTarget.setSize(renderWidth, renderHeight);
    this.mainLensflareTarget.setSize(renderWidth, renderHeight);
    this.mediaRawTarget.setSize(renderWidth, renderHeight);
    this.mediaTarget.setSize(renderWidth, renderHeight);
    const halfMipWidth = Math.max(1, Math.round(floorPowerOfTwo(renderWidth) / 2));
    const halfMipHeight = Math.max(1, Math.round(floorPowerOfTwo(renderHeight) / 2));
    const quarterMipWidth = Math.max(1, Math.round(floorPowerOfTwo(renderWidth) / 4));
    const quarterMipHeight = Math.max(1, Math.round(floorPowerOfTwo(renderHeight) / 4));
    if (this.renderSettings.luminosity.enabled) this.bloomBrightTarget.setSize(quarterMipWidth, quarterMipHeight);
    if (this.renderSettings.bloom.enabled) {
      this.resizeBloomMipChain(this.bloomHorizontalTargets, this.bloomVerticalTargets, quarterMipWidth, quarterMipHeight);
    }
    if (this.sourceMainRenderSettings.luminosity.enabled) this.mainBloomBrightTarget.setSize(halfMipWidth, halfMipHeight);
    if (this.sourceMainRenderSettings.bloom.enabled) {
      this.resizeBloomMipChain(this.mainBloomHorizontalTargets, this.mainBloomVerticalTargets, halfMipWidth, halfMipHeight);
    }
    if (this.sourceMainRenderSettings.fluid.enabled) this.resizeMainFluidPass(halfMipWidth / 3, halfMipHeight / 3);
    const skySize = Math.max(1, Math.round(height * 0.75));
    this.skyRawTarget.setSize(skySize, skySize);
    this.skyCompositeTarget.setSize(skySize, skySize);
    this.homeCamera.aspect = width / height;
    this.homeCamera.updateProjectionMatrix();
    this.cameraOrigin.z = width >= BREAKPOINT_MD ? 5.5 : 5;
    this.cameraControllerGroup.lookAt(this.cameraLookAt);
    this.backgroundMaterial.uniforms.uRatio.value = width / height;
    this.preCompositeMaterial.uniforms.uRatio.value = width / height;
    this.preCompositeMaterial.uniforms.uContainerSize.value.set(renderWidth, renderHeight);
    this.displacementMaterial.uniforms.uRatio.value = width / height;
    const displacementSize = Math.max(1, Math.round(height / 10));
    this.displacementTarget.setSize(displacementSize, displacementSize);
    this.preCompositeMaterial.uniforms.uDisplacementSize.value.set(displacementSize, displacementSize);
    const floorReflectionWidth = Math.max(1, Math.round(renderWidth * 0.75));
    const floorReflectionHeight = Math.max(1, Math.round(renderHeight * 0.75));
    this.floorReflectionTarget.setSize(floorReflectionWidth, floorReflectionHeight);
    this.floorReflectionReadTarget.setSize(floorReflectionWidth, floorReflectionHeight);
    this.floorReflectionWriteTarget.setSize(floorReflectionWidth, floorReflectionHeight);
    this.floorReflectionBlurMaterial.uniforms.uResolution.value.set(renderWidth, renderHeight);
    const screenSimWidth = Math.max(1, Math.round(renderWidth / SCREEN_MOUSE_SIM_SCALE));
    const screenSimHeight = Math.max(1, Math.round(renderHeight / SCREEN_MOUSE_SIM_SCALE));
    if (this.renderSettings.mousesim.enabled) {
      this.screenMouseSimulationTargets.forEach((target) => target.setSize(screenSimWidth, screenSimHeight));
      this.screenMouseSimulationMaterial.uniforms.uCoords.value.set(screenSimWidth, screenSimHeight);
    }
    const meshSimWidth = Math.max(1, Math.round(GRID_COLS * MOUSE_PLANE_SCALE));
    const meshSimHeight = Math.max(1, Math.round(GRID_ROWS * MOUSE_PLANE_SCALE));
    if (this.renderSettings.mousesim.enabled) {
      this.workItems.forEach((item) => {
        item.mouseTargets.forEach((target) => target.setSize(meshSimWidth, meshSimHeight));
        item.mouseMaterial.uniforms.uCoords.value.set(meshSimWidth, meshSimHeight);
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
      item.material.uniforms.uCoords.value.set(renderWidth, renderHeight);
    });
    this.resizeAuxiliaryBlocks(width, height, dpr);
    this.updateMediaPlanePositions();
  };

  private resizeBloomMipChain(
    horizontalTargets: WebGLRenderTarget[],
    verticalTargets: WebGLRenderTarget[],
    startWidth: number,
    startHeight: number,
  ) {
    let mipWidth = startWidth;
    let mipHeight = startHeight;
    horizontalTargets.forEach((target, index) => {
      target.setSize(mipWidth, mipHeight);
      verticalTargets[index].setSize(mipWidth, mipHeight);
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
      item.thumb.position.set(x, item.thumbYHook + this.thumbOffsetY, 0);
      item.thumb.visible = x >= -1.5 && x <= 1.5;
    });
  }

  private updatePointerProjection() {
    if (!this.sceneWrap.visible) return;
    this.raycaster.setFromCamera(this.pointer, this.homeCamera);
    const active = this.workItems.find((item) => item.slug === this.activeSlug && item.group.visible);
    const orderedItems = [
      ...(active ? [active] : []),
      ...this.workItems.filter((item) => item !== active && item.group.visible),
    ];
    const hit = this.raycaster.intersectObjects(orderedItems.map((item) => item.rayPlane), false)[0];
    if (!hit) return;
    const item = orderedItems.find((candidate) => candidate.rayPlane === hit.object);
    if (!item) return;
    const x = MathUtils.clamp(hit.uv?.x ?? 0.5, 0, 1);
    const y = MathUtils.clamp(hit.uv?.y ?? 0.5, 0, 1);
    item.mouseTarget.set(x, y);
  }

  private updateVisibleWorkItems(time: number) {
    this.workItems.forEach((item) => {
      item.material.uniforms.uTime.value = time;
      const world = new Vector3();
      item.group.getWorldPosition(world);
      const visible = !(world.x > 5.5 || world.x < -5.5 || world.z > 5);
      item.group.visible = visible;
      if (!visible) return;

      const sideReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 0, 5, 0, 1), 0, 1);
      const sideSpreadReveal = MathUtils.clamp(1 - MathUtils.mapLinear(Math.abs(world.x), 2, 6, 0, 1), 0, 1);
      item.material.uniforms.uRevealSides.value = sideReveal;
      item.material.uniforms.uRevealSpreadSides.value = sideSpreadReveal;
      item.material.uniforms.uMouseFactor.value = this.mouseFactor;
      item.material.uniforms.tMouseSim.value = item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder;
      item.material.uniforms.tMouseSim2.value = this.screenMouseSimulationTexture;
    });
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
    const lerpFactor = MathUtils.clamp(delta * 7.5, 0, 1);
    newPos.lerp(targetPos, lerpFactor);
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
    this.renderer.clear();
    this.renderer.render(scene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
    oldPos.copy(newPos);
    return { speed, index: outputIndex };
  }

  private updateWorkMouseSimulation(time: number, delta: number) {
    if (!this.renderSettings.mousesim.enabled) return;
    this.workItems.forEach((item) => {
      if (!item.group.visible) return;
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
      item.mouseSpeed = sourceDamp(item.mouseSpeed, meshResult.speed, 10, delta);
      item.mouseIndex = meshResult.index;
    });
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
    this.compositeMaterial.uniforms.tFluid.value = this.fluidPlaceholder;
    this.compositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
  }

  private syncWorkMouseSimulationUniforms() {
    if (!this.renderSettings.mousesim.enabled) return;
    this.workItems.forEach((item) => {
      if (!item.group.visible) return;
      item.material.uniforms.tMouseSim.value = item.mouseTargets[item.mouseIndex]?.texture ?? this.placeholder;
      item.material.uniforms.tMouseSim2.value = this.screenMouseSimulationTexture;
      item.material.uniforms.uMouseSpeed.value = item.mouseSpeed;
    });
  }

  private updateWorkSceneForNextFrame(time: number, delta: number) {
    this.updateHomeCamera(delta);
    if (this.spotLightParallax) {
      this.spotLightPosition.x = this.homeCamera.position.x * 0.175;
      this.spotLightPosition.y = (window.innerWidth >= BREAKPOINT_MD ? 0 : 0.3) + this.homeCamera.position.y * 0.175;
      this.spotLightPosition.z = 3.7;
    } else {
      this.updateAboutSpotlight();
    }
    this.spotLight.position.copy(this.spotLightPosition);
    this.spotLight.target.position.copy(this.spotLightTarget);
    this.updateSpotLightBasis();
    this.updateVisibleWorkItems(time);
    this.updateAuxiliaryBlocks(time, delta);
    this.updatePointerProjection();
    this.updateWorkMouseSimulation(time, delta);
    this.syncWorkMouseSimulationUniforms();
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

  private updateSpotLightBasis() {
    const direction = this.spotLightTarget.clone().sub(this.spotLightPosition).normalize();
    this.spotLightRight.crossVectors(direction, new Vector3(0, 1, 0)).normalize();
    if (this.spotLightRight.lengthSq() < 0.0001) this.spotLightRight.set(1, 0, 0);
    this.spotLightUp.crossVectors(this.spotLightRight, direction).normalize();
  }

  private updateAboutSpotlight() {
    const item = this.aboutBlocks;
    if (!item?.group.visible) return;
    this.spotLightPosition.set(item.group.position.x - 0.5, item.group.position.y, item.group.position.z + 4.2);
    this.spotLightTarget.set(item.group.position.x + 1.5, item.group.position.y, item.group.position.z - 8);
    this.spotLight.position.copy(this.spotLightPosition);
    this.spotLight.target.position.copy(this.spotLightTarget);
    this.updateSpotLightBasis();
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
    this.floorReflectionCamera.projectionMatrix.copy(this.homeCamera.projectionMatrix);
    this.floorReflectionCamera.updateMatrixWorld();
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
      projectionElements[10] = this.floorReflectionClipPlane.z + 1;
      projectionElements[14] = this.floorReflectionClipPlane.w;
    }

    try {
      this.renderer.xr.enabled = false;
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.setRenderTarget(this.floorReflectionTarget);
      this.renderer.state.buffers.depth.setMask(true);
      this.renderer.clear();
      this.renderer.render(this.homeScene, this.floorReflectionCamera);

      this.renderer.setRenderTarget(this.floorReflectionReadTarget);
      if (this.debugFloorReflection === "no-blur") {
        this.floorReflectionBlurMaterial.uniforms.tMap.value = this.floorReflectionTarget.texture;
        this.floorReflectionBlurMaterial.uniforms.uDirection.value.set(0, 0);
        this.renderer.render(this.floorReflectionBlurScene, this.backgroundCamera);
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
          this.renderer.render(this.floorReflectionBlurScene, this.backgroundCamera);
          const swap = readTarget;
          readTarget = writeTarget;
          writeTarget = swap;
        }
        this.floorReflectionReadTarget = readTarget;
        this.floorReflectionWriteTarget = writeTarget;
        this.floorMaterial.uniforms.tReflect.value = this.floorReflectionReadTarget.texture;
      }
    } finally {
      this.renderer.xr.enabled = previousXrEnabled;
      this.renderer.shadowMap.autoUpdate = previousShadowAutoUpdate;
      this.renderer.setRenderTarget(previousTarget);
    }
  }

  private renderSkyTarget(time: number) {
    this.skyCompositeMaterial.uniforms.uTime.value = sourceLowRes() ? 0 : time;
    this.renderer.setRenderTarget(this.skyRawTarget);
    this.renderer.clear();
    this.renderer.render(this.skyScene, this.backgroundCamera);
    this.renderer.setRenderTarget(this.skyCompositeTarget);
    this.renderer.clear();
    this.renderer.render(this.skyCompositeScene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
  }

  private renderDisplacementTarget(time: number) {
    this.displacementMaterial.uniforms.uTime.value = time;
    this.renderer.setRenderTarget(this.displacementTarget);
    this.renderer.clear();
    this.renderer.render(this.displacementScene, this.backgroundCamera);
    this.renderer.setRenderTarget(null);
  }

  private renderThumbTargets() {
    this.renderer.setRenderTarget(this.thumbTarget);
    this.renderer.render(this.thumbScene, this.thumbCamera);
    this.renderer.setRenderTarget(this.thumbCompositeTarget);
    this.renderer.render(this.thumbCompositeScene, this.backgroundCamera);
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
      visibleThumbs: this.workItems.filter((item) => item.thumb.visible).length,
      thumbComposite: {
        darkness: this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value as number,
        darkenIntensity: this.thumbCompositeMaterial.uniforms.uDarkenIntensity.value as number,
        darknessColor: [color.r, color.g, color.b],
        darkenColor: [color.r, color.g, color.b],
        saturation: this.thumbCompositeMaterial.uniforms.uSaturation.value as number,
      },
      spotlight: {
        hasMap: this.spotLight.map === this.thumbCompositeTarget.texture,
        intensity: this.spotLight.intensity,
        position: this.spotLight.position.toArray(),
        target: this.spotLight.target.position.toArray(),
        parallax: this.spotLightParallax,
        mapColorSpace: this.thumbCompositeTarget.texture.colorSpace,
        rendererOutputColorSpace: this.renderer.outputColorSpace,
      },
      targets: {
        thumb: renderTargetStats(this.renderer, this.thumbTarget),
        composite: renderTargetStats(this.renderer, this.thumbCompositeTarget),
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
    const probeWindow = window as OutputProbeWindow;
    probeWindow.__rogierOutputProbe = {
      activeSlug: this.activeSlug,
      bodyClass: document.body.className,
      renderer: {
        outputColorSpace: this.renderer.outputColorSpace,
        toneMapping: this.renderer.toneMapping,
        autoClear: this.renderer.autoClear,
        pixelRatio: this.renderer.getPixelRatio(),
        size: { width: rendererSize.x, height: rendererSize.y },
        drawingBufferSize: { width: drawingBufferSize.x, height: drawingBufferSize.y },
      },
      camera: {
        position: this.homeCamera.position.toArray(),
        quaternion: this.homeCamera.quaternion.toArray(),
        origin: this.cameraOrigin.toArray(),
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
        },
        work: {
          bloom: this.renderSettings.bloom,
          luminosity: this.renderSettings.luminosity,
          blur: this.renderSettings.blur,
          mousesim: this.renderSettings.mousesim,
          fluid: this.renderSettings.fluid,
          activeMaterial: activeWorkItem ? {
            color: activeWorkItem.material.color.toArray(),
            emissive: activeWorkItem.material.emissive.toArray(),
            emissiveIntensity: activeWorkItem.material.emissiveIntensity,
            envMapIntensity: activeWorkItem.material.envMapIntensity,
            roughness: activeWorkItem.material.roughness,
            metalness: activeWorkItem.material.metalness,
          } : null,
        },
        main: {
          gpuTier: sourceGpuTier(),
          bloom: this.sourceMainRenderSettings.bloom,
          luminosity: this.sourceMainRenderSettings.luminosity,
          blur: this.sourceMainRenderSettings.blur,
          mousesim: this.sourceMainRenderSettings.mousesim,
          fluid: this.sourceMainRenderSettings.fluid,
        },
        updateOrder: {
          source: this.sourceUpdateOrder,
          postRenderFrame: this.sourcePostRenderFrame,
        },
      },
      uniforms: {
        preComposite: {
          uBgColor: (this.preCompositeMaterial.uniforms.uBgColor.value as Color).toArray(),
          uContrast: this.preCompositeMaterial.uniforms.uContrast.value,
          uFluidStrength: this.preCompositeMaterial.uniforms.uFluidStrength.value,
          uMediaReveal: this.preCompositeMaterial.uniforms.uMediaReveal.value,
          lensflareEnabled: SOURCE_MAIN_LENSFLARE_SETTINGS.enabled,
          lensflareTargetSize: {
            width: this.mainLensflareTarget.width,
            height: this.mainLensflareTarget.height,
          },
          boolBloom: this.preCompositeMaterial.uniforms.boolBloom.value,
          boolLuminosity: this.preCompositeMaterial.uniforms.boolLuminosity.value,
        },
        composite: {
          uDarken: darkenValue,
          uSaturation: this.compositeMaterial.uniforms.uSaturation.value,
          uDebugStage: this.compositeMaterial.uniforms.uDebugStage?.value ?? 0,
          uDebugDarkenMode: this.compositeMaterial.uniforms.uDebugDarkenMode?.value ?? 0,
          uDebugTransferMode: this.compositeMaterial.uniforms.uDebugTransferMode?.value ?? 0,
          uDebugLightenMode: this.compositeMaterial.uniforms.uDebugLightenMode?.value ?? 0,
          estimatedDarkenOpacityFromMouseGrid: darkenValue * 2 + mouseSimRed * 0.25 * darkenValue,
          estimatedDarkenOpacityWithoutMouse: darkenValue * 2,
          estimatedDarkenOpacityMouseOnly: mouseSimRed * 0.25 * darkenValue,
          boolBloom: this.compositeMaterial.uniforms.boolBloom.value,
          boolLuminosity: this.compositeMaterial.uniforms.boolLuminosity.value,
        },
        floor: {
          visible: this.floorGroup.visible,
          groupPosition: this.floorGroup.position.toArray(),
          planePosition: this.floorPlane.position.toArray(),
          uReflectivity: this.floorMaterial.uniforms.uReflectivity.value,
          uMirror: this.floorMaterial.uniforms.uMirror.value,
          uFloorMixStrength: this.floorMaterial.uniforms.uFloorMixStrength.value,
          uNormalScale: (this.floorMaterial.uniforms.uNormalScale.value as Vector2).toArray(),
          reflectionTargetSize: {
            width: this.floorReflectionTarget.width,
            height: this.floorReflectionTarget.height,
          },
          reflectionReadTargetSize: {
            width: this.floorReflectionReadTarget.width,
            height: this.floorReflectionReadTarget.height,
          },
          blurResolution: (this.floorReflectionBlurMaterial.uniforms.uResolution.value as Vector2).toArray(),
        },
        environment: {
          visible: this.environmentPlane.visible,
          uTime: this.environmentMaterial.uniforms.uTime.value,
          uMultiplier: this.environmentMaterial.uniforms.uMultiplier.value,
          uDarken: this.environmentMaterial.uniforms.uDarken.value,
          uDarkenColor: (this.environmentMaterial.uniforms.uDarkenColor.value as Color).toArray(),
          tSkyIsComposite: this.environmentMaterial.uniforms.tSky.value === this.skyCompositeTarget.texture,
          tSkySource: this.debugSkyTarget === "off" ? "placeholder" : this.debugSkyTarget === "raw" ? "raw" : "composite",
          shaderSurface: {
            uShader1Alpha: this.environmentMaterial.uniforms.uShader1Alpha.value,
            uShader1Speed: this.environmentMaterial.uniforms.uShader1Speed.value,
            uShader1Scale: this.environmentMaterial.uniforms.uShader1Scale.value,
            uShader2Alpha: this.environmentMaterial.uniforms.uShader2Alpha.value,
            uShader2Scale: this.environmentMaterial.uniforms.uShader2Scale.value,
            uShader3Alpha: this.environmentMaterial.uniforms.uShader3Alpha.value,
            uShader3Speed: this.environmentMaterial.uniforms.uShader3Speed.value,
            uShader3Scale: this.environmentMaterial.uniforms.uShader3Scale.value,
            uShader1Mix2: this.environmentMaterial.uniforms.uShader1Mix2.value,
            uShader1Mix3: this.environmentMaterial.uniforms.uShader1Mix3.value,
          },
          sceneEnvironment: this.homeScene.environment ? {
            colorSpace: this.homeScene.environment.colorSpace,
            type: this.homeScene.environment.type,
            format: this.homeScene.environment.format,
          } : null,
          envMapIntensity: this.environmentMaterial.envMapIntensity,
          rotationY: this.environmentPlane.rotation.y,
          positionY: this.environmentPlane.position.y,
        },
      },
      targets: {
        workRaw: renderTargetProbe(this.renderer, this.workRawTarget),
        workComposite: renderTargetProbe(this.renderer, this.workCompositeTarget),
        preComposite: renderTargetProbe(this.renderer, this.compositeTarget),
        bloomBright: renderTargetProbe(this.renderer, this.bloomBrightTarget),
        bloom: renderTargetProbe(this.renderer, this.bloomHorizontalTargets[0]),
        mainBloomBright: renderTargetProbe(this.renderer, this.mainBloomBrightTarget),
        mainBloom: renderTargetProbe(this.renderer, this.mainBloomHorizontalTargets[0]),
        mediaRaw: renderTargetProbe(this.renderer, this.mediaRawTarget),
        media: renderTargetProbe(this.renderer, this.mediaTarget),
        floorReflection: renderTargetProbe(this.renderer, this.floorReflectionTarget),
        floorReflectionRead: renderTargetProbe(this.renderer, this.floorReflectionReadTarget),
        skyRaw: renderTargetProbe(this.renderer, this.skyRawTarget),
        skyComposite: renderTargetProbe(this.renderer, this.skyCompositeTarget),
        thumb: renderTargetProbe(this.renderer, this.thumbTarget),
        thumbComposite: renderTargetProbe(this.renderer, this.thumbCompositeTarget),
        screenMouseSim: mouseSimProbe,
      },
      textures: {
        noise: { colorSpace: this.noiseTexture.colorSpace, type: this.noiseTexture.type, format: this.noiseTexture.format },
        skyComposite: {
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
            uShader1Mix3: this.skyCompositeMaterial.uniforms.uShader1Mix3.value,
            uShader3Scale: this.skyCompositeMaterial.uniforms.uShader3Scale.value,
            uShaderMix: this.skyCompositeMaterial.uniforms.uShaderMix.value,
          },
        },
        perlin: { colorSpace: this.perlinTexture.colorSpace, type: this.perlinTexture.type, format: this.perlinTexture.format },
        workPerlin: { colorSpace: this.workPerlinTexture.colorSpace, type: this.workPerlinTexture.type, format: this.workPerlinTexture.format },
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
        visible: this.sceneWrap.visible,
        position: this.sceneWrap.position.toArray(),
        rotation: [this.sceneWrap.rotation.x, this.sceneWrap.rotation.y, this.sceneWrap.rotation.z],
        children: this.sceneWrap.children.map(objectSummary),
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
        },
      },
      environment: {
        object: objectSummary(this.environmentPlane),
        material: {
          transparent: this.environmentMaterial.transparent,
          depthWrite: this.environmentMaterial.depthWrite,
          depthTest: this.environmentMaterial.depthTest,
          blending: this.environmentMaterial.blending,
          side: this.environmentMaterial.side,
          toneMapped: this.environmentMaterial.toneMapped,
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
        read: renderTargetSummary(this.floorReflectionReadTarget),
        write: renderTargetSummary(this.floorReflectionWriteTarget),
        floorReflectUsesRead: this.floorMaterial.uniforms.tReflect.value === this.floorReflectionReadTarget.texture,
        floorReflectUsesRaw: this.floorMaterial.uniforms.tReflect.value === this.floorReflectionTarget.texture,
        blurInputUsesRaw: this.floorReflectionBlurMaterial.uniforms.tMap.value === this.floorReflectionTarget.texture,
        blurInputUsesRead: this.floorReflectionBlurMaterial.uniforms.tMap.value === this.floorReflectionReadTarget.texture,
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
    const uvOffset = active?.material.uniforms.uUvOffset.value as Vector3 | undefined;
    const uvOffsetScale = active?.material.uniforms.uUvOffsetScale.value as number | undefined;
    return {
      enabled: this.renderSettings.mousesim.enabled,
      screen: {
        index: this.screenMouseSimulationIndex,
        targetSize: screenTarget ? { width: screenTarget.width, height: screenTarget.height } : null,
        uCoords: screenCoords.toArray(),
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
        index: active.mouseIndex,
        targetSize: { width: activeTarget.width, height: activeTarget.height },
        uCoords: activeCoords.toArray(),
        mouseTarget: active.mouseTarget.toArray(),
        mouseOld: active.mouseOld.toArray(),
        mouseNew: active.mouseNew.toArray(),
        mouseSpeed: active.mouseSpeed,
        uniformSpeed: active.mouseMaterial.uniforms.uSpeed.value,
        persistence: active.mouseMaterial.uniforms.uPersistance.value,
        thickness: active.mouseMaterial.uniforms.uThickness.value,
        uvOffset: uvOffset?.toArray() ?? null,
        uvOffsetScale: uvOffsetScale ?? null,
        rayPlaneScale: active.rayPlane.scale.toArray(),
        rayPlaneGeometrySize: [
          GRID_COLS * MOUSE_PLANE_SCALE * GRID_SCALE * MOUSE_RAY_SCALE,
          GRID_ROWS * MOUSE_PLANE_SCALE * GRID_SCALE * MOUSE_RAY_SCALE,
        ],
        sourcePlaneSize: [GRID_COLS * MOUSE_PLANE_SCALE, GRID_ROWS * MOUSE_PLANE_SCALE],
        sourceRayPlaneSize: [GRID_COLS * MOUSE_PLANE_SCALE * MOUSE_RAY_SCALE, GRID_ROWS * MOUSE_PLANE_SCALE * MOUSE_RAY_SCALE],
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
    const samples = [
      { label: "center", offset: new Vector3(0, 0, 0) },
      { label: "left", offset: new Vector3(-0.5, 0, 0) },
      { label: "right", offset: new Vector3(0.5, 0, 0) },
      { label: "top", offset: new Vector3(0, 0.5, 0) },
      { label: "bottom", offset: new Vector3(0, -0.5, 0) },
    ].map(({ label, offset }) => {
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
    return {
      activeSlug: active.slug,
      spotlight: {
        intensity: this.spotLight.intensity,
        hasMap: this.spotLight.map === this.thumbCompositeTarget.texture,
        position: this.spotLight.position.toArray(),
        target: this.spotLight.target.position.toArray(),
        parallax: this.spotLightParallax,
        mapColorSpace: this.thumbCompositeTarget.texture.colorSpace,
      },
      bounds: {
        center: center.toArray(),
        size: size.toArray(),
      },
      samples,
      inMapCount: inMapSamples.length,
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

  private renderHomeBlurPass() {
    this.blurHorizontalMaterial.uniforms.tMap.value = this.compositeTarget.texture;
    this.renderer.setRenderTarget(this.blurTargetA);
    this.renderer.clear();
    this.renderer.render(this.blurHorizontalScene, this.backgroundCamera);
    this.blurVerticalMaterial.uniforms.tMap.value = this.blurTargetA.texture;
    this.renderer.setRenderTarget(this.blurTargetB);
    this.renderer.clear();
    this.renderer.render(this.blurVerticalScene, this.backgroundCamera);
  }

  private renderBloomChain(
    sourceTarget: WebGLRenderTarget,
    horizontalTargets: WebGLRenderTarget[],
    verticalTargets: WebGLRenderTarget[],
    blurMaterial: ShaderMaterial,
    blurScene: Scene,
    compositeScene: Scene,
    brightTarget?: WebGLRenderTarget,
  ) {
    let bloomSource = brightTarget ?? sourceTarget;
    horizontalTargets.forEach((horizontalTarget, index) => {
      const verticalTarget = verticalTargets[index];
      const kernelRadius = SOURCE_BLOOM_KERNELS[index] ?? SOURCE_BLOOM_KERNELS[SOURCE_BLOOM_KERNELS.length - 1];
      blurMaterial.uniforms.tMap.value = bloomSource.texture;
      blurMaterial.uniforms.uResolution.value.set(horizontalTarget.width, horizontalTarget.height);
      blurMaterial.uniforms.uDirection.value.set(1, 0);
      blurMaterial.uniforms.uKernelRadius.value = kernelRadius;
      blurMaterial.uniforms.uSigma.value = kernelRadius;
      this.renderer.setRenderTarget(horizontalTarget);
      this.renderer.clear();
      this.renderer.render(blurScene, this.backgroundCamera);
      blurMaterial.uniforms.tMap.value = horizontalTarget.texture;
      blurMaterial.uniforms.uResolution.value.set(verticalTarget.width, verticalTarget.height);
      blurMaterial.uniforms.uDirection.value.set(0, 1);
      blurMaterial.uniforms.uKernelRadius.value = kernelRadius;
      blurMaterial.uniforms.uSigma.value = kernelRadius;
      this.renderer.setRenderTarget(verticalTarget);
      this.renderer.clear();
      this.renderer.render(blurScene, this.backgroundCamera);
      bloomSource = verticalTarget;
    });
    this.renderer.setRenderTarget(horizontalTargets[0]);
    this.renderer.clear();
    this.renderer.render(compositeScene, this.backgroundCamera);
  }

  private renderHomeBloomPass(sourceTarget: WebGLRenderTarget) {
    let brightTarget: WebGLRenderTarget | undefined;
    if (this.renderSettings.luminosity.enabled) {
      this.luminosityMaterial.uniforms.tScene.value = sourceTarget.texture;
      this.renderer.setRenderTarget(this.bloomBrightTarget);
      this.renderer.clear();
      this.renderer.render(this.luminosityScene, this.backgroundCamera);
      brightTarget = this.bloomBrightTarget;
    }
    this.renderBloomChain(
      sourceTarget,
      this.bloomHorizontalTargets,
      this.bloomVerticalTargets,
      this.bloomBlurMaterial,
      this.bloomBlurScene,
      this.bloomCompositeScene,
      brightTarget,
    );
  }

  private renderMainBloomPass(sourceTarget: WebGLRenderTarget) {
    let brightTarget: WebGLRenderTarget | undefined;
    if (this.sourceMainRenderSettings.luminosity.enabled) {
      this.luminosityMaterial.uniforms.tScene.value = sourceTarget.texture;
      this.renderer.setRenderTarget(this.mainBloomBrightTarget);
      this.renderer.clear();
      this.renderer.render(this.luminosityScene, this.backgroundCamera);
      brightTarget = this.mainBloomBrightTarget;
    }
    this.renderBloomChain(
      sourceTarget,
      this.mainBloomHorizontalTargets,
      this.mainBloomVerticalTargets,
      this.mainBloomBlurMaterial,
      this.mainBloomBlurScene,
      this.mainBloomCompositeScene,
      brightTarget,
    );
  }

  private renderHomeCompositePass() {
    const settings = this.sourceMainRenderSettings;
    if (!settings.blur.enabled && !settings.bloom.enabled && !settings.fxaa.enabled) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.preCompositeScene, this.backgroundCamera);
      return;
    }
    this.mainCompositeMaterial.uniforms.tScene.value = settings.blur.enabled ? this.blurTargetB.texture : this.compositeTarget.texture;
    this.mainCompositeMaterial.uniforms.tBloom.value = this.mainBloomHorizontalTargets[0].texture;
    this.mainCompositeMaterial.uniforms.tBlur.value = settings.blur.enabled ? this.blurTargetB.texture : this.fluidPlaceholder;
    this.mainCompositeMaterial.uniforms.tFluid.value = this.preCompositeMaterial.uniforms.tFluid.value;
    this.mainCompositeMaterial.uniforms.boolBloom.value = settings.bloom.enabled;
    this.mainCompositeMaterial.uniforms.boolFluid.value = settings.fluid.enabled;
    this.mainCompositeMaterial.uniforms.boolLuminosity.value = settings.luminosity.enabled;
    this.mainCompositeMaterial.uniforms.boolFxaa.value = settings.fxaa.enabled;
    if (settings.fxaa.enabled) {
      this.renderer.setRenderTarget(this.fxaaTarget);
      this.renderer.clear();
      this.renderer.render(this.mainCompositeScene, this.backgroundCamera);
      this.fxaaMaterial.uniforms.tMap.value = this.fxaaTarget.texture;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.fxaaScene, this.backgroundCamera);
      return;
    }
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.mainCompositeScene, this.backgroundCamera);
  }

  private tick = () => {
    const time = performance.now() * 0.001;
    const delta = MathUtils.clamp(time - this.lastTickTime, 1 / 120, 1 / 20);
    this.lastTickTime = time;
    this.pointer.lerp(this.targetPointer, 0.055);
    this.backgroundMaterial.uniforms.uTime.value = time;
    this.environmentMaterial.uniforms.uTime.value = time;
    this.backgroundMaterial.uniforms.uProgress.value = this.galleryProgress;
    this.preCompositeMaterial.uniforms.uTime.value = time;
    this.preCompositeMaterial.uniforms.uFluidStrength.value = this.fluidStrength;
    const mainFluidTexture = this.sourceMainRenderSettings.fluid.enabled && this.fluidStrength > 0
      ? this.updateMainFluidPass()
      : this.mainFluidPass.enabled
        ? this.mainFluidPass.targets.main.texture
        : this.fluidPlaceholder;
    this.preCompositeMaterial.uniforms.tFluid.value = mainFluidTexture;
    this.preCompositeMaterial.uniforms.tBloom.value = this.mainBloomHorizontalTargets[0].texture;
    this.preCompositeMaterial.uniforms.boolBloom.value = this.sourceMainRenderSettings.bloom.enabled;
    this.preCompositeMaterial.uniforms.boolFluid.value = this.sourceMainRenderSettings.fluid.enabled;
    this.preCompositeMaterial.uniforms.boolLuminosity.value = this.sourceMainRenderSettings.luminosity.enabled;
    this.preCompositeMaterial.uniforms.boolFxaa.value = this.sourceMainRenderSettings.fxaa.enabled;
    this.updateMediaPlanePositions();

    this.renderer.clear();
    const isProjectView = document.body.classList.contains("is-project");
    const hasHome = this.sceneWrap.visible;
    const hasMedia = this.mediaPlanes.some((plane) => plane.mesh.visible);
    let preCompositeWorkTarget = this.debugPassOrder === "raw-work-composite" ? this.workRawTarget : this.workCompositeTarget;
    if (hasHome) {
      this.updateScreenMouseSimulation(time, delta);
      this.renderSkyTarget(time);
      this.renderer.setRenderTarget(this.workRawTarget);
      this.renderer.clear();
      const previousFloorVisible = this.floorPlane.visible;
      const previousFloorGroupVisible = this.floorGroup.visible;
      const previousEnvironmentVisible = this.environmentPlane.visible;
      if (this.debugFloor === "off") this.floorGroup.visible = false;
      if (this.debugEnvironment === "off") this.environmentPlane.visible = false;
      try {
        this.renderer.render(this.homeScene, this.homeCamera);
        if (preCompositeWorkTarget === this.workCompositeTarget) {
          if (this.renderSettings.bloom.enabled) {
            this.renderHomeBloomPass(this.workRawTarget);
          }
          this.compositeMaterial.uniforms.tScene.value = this.workRawTarget.texture;
          this.compositeMaterial.uniforms.tBloom.value = this.bloomHorizontalTargets[0].texture;
          this.compositeMaterial.uniforms.tBlur.value = this.fluidPlaceholder;
          this.compositeMaterial.uniforms.tFluid.value = this.fluidPlaceholder;
          this.compositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
          this.compositeMaterial.uniforms.boolBloom.value = this.renderSettings.bloom.enabled;
          this.compositeMaterial.uniforms.boolFluid.value = this.renderSettings.fluid.enabled;
          this.compositeMaterial.uniforms.boolLuminosity.value = this.renderSettings.luminosity.enabled;
          this.compositeMaterial.uniforms.boolFxaa.value = this.renderSettings.fxaa.enabled;
          this.renderer.setRenderTarget(this.workCompositeTarget);
          this.renderer.clear();
          this.renderer.render(this.compositeScene, this.backgroundCamera);
        }
      } finally {
        this.floorPlane.visible = previousFloorVisible;
        this.floorGroup.visible = previousFloorGroupVisible;
        this.environmentPlane.visible = previousEnvironmentVisible;
      }
    } else {
      this.renderer.setRenderTarget(this.workRawTarget);
      this.renderer.clear();
      this.renderer.setRenderTarget(this.workCompositeTarget);
      this.renderer.clear();
      preCompositeWorkTarget = this.workCompositeTarget;
    }
    this.preCompositeMaterial.uniforms.tWork.value = preCompositeWorkTarget.texture;
    this.preCompositeMaterial.uniforms.tScene.value = this.compositeTarget.texture;
    this.preCompositeMaterial.uniforms.tLensflare.value = this.mainLensflareTarget.texture;
    this.renderMediaCompositeTarget(isProjectView && hasMedia);
    this.preCompositeMaterial.uniforms.tMedia.value = this.mediaTarget.texture;
    this.preCompositeMaterial.uniforms.tFluid.value = mainFluidTexture;
    this.preCompositeMaterial.uniforms.tMouseSim.value = this.screenMouseSimulationTexture;
    if (this.sourceMainRenderSettings.bloom.enabled) {
      this.renderMainBloomPass(preCompositeWorkTarget);
    }
    this.preCompositeMaterial.uniforms.tBloom.value = this.mainBloomHorizontalTargets[0].texture;
    this.renderer.setRenderTarget(this.compositeTarget);
    this.renderer.clear();
    this.renderer.render(this.preCompositeScene, this.backgroundCamera);
    const sceneSourceTarget = this.sourceMainRenderSettings.blur.enabled ? this.blurTargetB : this.compositeTarget;
    if (this.sourceMainRenderSettings.blur.enabled) {
      this.renderHomeBlurPass();
    }
    if (this.sourceMainRenderSettings.bloom.enabled) {
      this.renderMainBloomPass(sceneSourceTarget);
    }
    this.renderHomeCompositePass();
    this.renderThumbTargets();
    this.updateThumbProbe(time);
    this.updateOutputProbe(time);
    if (this.aboutBlocks?.group.visible) this.renderCharacterTarget();
    this.renderDisplacementTarget(time);
    this.updateWorkSceneForNextFrame(time, delta);
    this.raf = requestAnimationFrame(this.tick);
  };
}

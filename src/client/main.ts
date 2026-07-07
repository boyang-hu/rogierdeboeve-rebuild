import gsap from "gsap";
import projectsData from "../data/projects.json";
import type { Project } from "../types";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type WebGLLike = {
  setProject(payload: {
    slug?: string;
    color?: string;
    secondary?: string;
    invert?: string;
    mediaColor?: string;
    thumb?: string;
    blocks?: string;
    ambient?: string;
    darkness?: string;
    darknessColor?: string;
    saturation?: string;
    thumbSaturation?: string;
    contrast?: string;
    mouseLightness?: string;
    spotlight?: string;
  }): void;
  beginProjectTransition?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  setActiveSlug?(slug: string): void;
  setGalleryProgress?(progress: number, velocity?: number, delta?: number): void;
  restoreGalleryState?(progress: number, sceneRotation?: number): void;
  prepareHomeVisualState?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  enterWorkGallery?(activeSlug?: string): void;
  setCameraControllerSettings?(lookAt?: { x: number; y: number; z: number }, targetXY?: { x: number; y: number }, rotateAngle?: number): void;
  initHomeSpotlight?(): void;
  setPreviewMode?(enabled: boolean): void;
  animateWorkMouseIn?(): void;
  animateIn?(): Promise<void>;
  showScene?(): void;
  hideWorkScene?(): void;
  mediaAnimateIn?(): void;
  enterProjectVisualState?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  setProjectScrollState?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  projectLeave?(): void;
  enterAboutVisualState?(visual?: HTMLElement | null, floating?: HTMLElement | null): void;
  setAboutScrollState?(scroll?: number, velocity?: number): void;
  animateAboutVisualIn?(): void;
  animateAboutVisualOut?(): void;
  destroyAboutVisualState?(): void;
  leaveAboutVisualState?(): void;
  refreshMedia?(): void;
};

type PageScrollDetail = {
  scroll?: number;
  animatedScroll?: number;
  velocity?: number;
  limit?: number;
  dimensions?: {
    scrollHeight?: number;
  };
};

type PageScrollController = {
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
  getState: () => {
    scroll: number;
    animatedScroll: number;
    velocity: number;
    limit: number;
    dimensions: {
      scrollHeight: number;
    };
  };
};

type HomeGalleryRuntimeProbe = {
  deltaMode: "source-yD-onRaf-uses-Bt-raw-delta-no-gallery-clamp";
  deltaClampApplied: false;
  lastDelta: number;
  lastDeltaFinite: boolean;
  workStateRestoreMode: "source-yD-Qe-workState-preserves-scroll-active";
  workStateRestored: boolean;
  restoredScrollActive: boolean | null;
  restoredScrollActivePreserved: boolean;
  scrollActive: boolean;
};

type HomeGalleryProbeWindow = Window & {
  __rogierHomeGalleryRuntime?: HomeGalleryRuntimeProbe;
  __rogierPageScroll?: PageScrollController;
};

type TransitionMode = "home" | "project" | "about" | "work" | "default";
type AppNavigate = (url: string, mode?: TransitionMode, historyMode?: "push" | "replace") => void;

type WorkGalleryIndexState = {
  current: number;
  prev: number;
  next: number;
};

type WorkGalleryScrollState = {
  virtual: number;
  target: number;
  animated: number;
  diff: number;
  current: number;
  progress: number;
  limit: number;
  remainder: number;
  step: number;
  offset: number;
  velocity: number;
  active: boolean;
  targetPlusDiff?: number;
};

type RuntimeWorkState = {
  slug?: string;
  index: WorkGalleryIndexState;
  scroll: WorkGalleryScrollState;
  activeHook: number;
  targetHook: number;
  activeProject?: string;
  sceneRotation: number;
};

let runtimeWorkState: RuntimeWorkState | null = null;
let currentProjectId: string | null = null;

const colorValue = (value?: string) => {
  if (!value) return undefined;
  return value.startsWith("#") ? value : `#${value}`;
};

const dataValue = (value?: string | number | null) => (value == null ? undefined : String(value));

const projectPayloadsBySlug = new Map(
  (projectsData as Project[]).map((project) => [
    project.data.slug,
    {
      slug: project.data.slug,
      color: colorValue(project.data.colors.primary),
      secondary: colorValue(project.data.colors.secondary),
      invert: colorValue(project.data.colors.invert),
      mediaColor: colorValue(project.data.colors.media),
      thumb: `/images/thumbs/${project.data.thumbnail.src}.${project.data.thumbnail.type ?? "webp"}`,
      blocks: colorValue(project.data.colors.blocks),
      ambient: dataValue(project.data.ambient),
      darkness: dataValue(project.data.darkenDetail),
      overviewDarkness: dataValue(project.data.darkenOverview),
      thumbDarkness: dataValue(project.data.thumbnail.darkness),
      darknessColor: colorValue(project.data.thumbnail.darknessColor),
      saturation: dataValue(project.data.saturation),
      thumbSaturation: dataValue(project.data.thumbnail.saturation),
      contrast: dataValue(project.data.contrast),
      mouseLightness: dataValue(project.data.thumbnail.mouseLightness),
      spotlight: dataValue(project.data.spotlight),
    },
  ] as const),
);

function projectPayloadFromElement(element?: HTMLElement | null) {
  const slug = element?.dataset.slug ?? element?.dataset.project ?? element?.dataset.projectSlug;
  const fallback = slug ? projectPayloadsBySlug.get(slug) : undefined;

  return {
    slug,
    color: element?.dataset.color ?? fallback?.color,
    secondary: element?.dataset.secondary ?? fallback?.secondary,
    invert: element?.dataset.invert ?? fallback?.invert,
    mediaColor: element?.dataset.mediaColor ?? fallback?.mediaColor,
    thumb: element?.dataset.thumb ?? fallback?.thumb,
    blocks: element?.dataset.blocks ?? fallback?.blocks,
    ambient: element?.dataset.ambient ?? fallback?.ambient,
    darkness: element?.dataset.darkness ?? fallback?.darkness,
    overviewDarkness: element?.dataset.overviewDarkness ?? fallback?.overviewDarkness,
    thumbDarkness: element?.dataset.thumbDarkness ?? fallback?.thumbDarkness,
    darknessColor: element?.dataset.darknessColor ?? fallback?.darknessColor,
    saturation: element?.dataset.saturation ?? fallback?.saturation,
    thumbSaturation: element?.dataset.thumbSaturation ?? fallback?.thumbSaturation,
    contrast: element?.dataset.contrast ?? fallback?.contrast,
    mouseLightness: element?.dataset.mouseLightness ?? fallback?.mouseLightness,
    spotlight: element?.dataset.spotlight ?? fallback?.spotlight,
  };
}

function applyActiveColor(color?: string) {
  if (color) document.documentElement.style.setProperty("--active-color", color);
}

const sourceRound = (value: number, precision = 4) => {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
};

const sourceMap = (value: number, inputMin: number, inputMax: number, outputMin: number, outputMax: number, clamp = false) => {
  if (inputMax === inputMin) return sourceRound(outputMin);
  const mapped = ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
  if (!clamp) return sourceRound(mapped);
  const max = outputMin > outputMax ? outputMin : outputMax;
  const min = outputMin > outputMax ? outputMax : outputMin;
  return sourceRound(Math.min(Math.max(mapped, min), max));
};

function pageScrollState(detail?: PageScrollDetail) {
  const scrollHeight = detail?.dimensions?.scrollHeight ?? document.documentElement.scrollHeight;
  const limit = detail?.limit ?? Math.max(0, scrollHeight - window.innerHeight);
  const scroll = detail?.scroll ?? window.scrollY;
  return {
    scroll,
    animatedScroll: detail?.animatedScroll ?? scroll,
    velocity: detail?.velocity ?? 0,
    limit,
    dimensions: {
      scrollHeight,
    },
  };
}

function hasPageEntered() {
  return document.body.classList.contains("has-entered") && !document.documentElement.classList.contains("is-route-swapping");
}

function emitPageEntered() {
  window.dispatchEvent(new CustomEvent("rd:page-entered"));
}

function onPageEntered(callback: () => void, cleanupCallbacks: Array<() => void>) {
  if (hasPageEntered()) {
    callback();
    return;
  }
  window.addEventListener("rd:page-entered", callback, { once: true });
  cleanupCallbacks.push(() => window.removeEventListener("rd:page-entered", callback));
}

function clearWorkPreview(webgl?: WebGLLike) {
  webgl?.setPreviewMode?.(false);
}

function initCtaMagnet(cta: HTMLElement) {
  const button = cta.querySelector<HTMLElement>(".c-button");
  if (!button || window.matchMedia("(max-width: 999px)").matches) return () => {};

  const state = { x: 0, y: 0, xLerp: 0, yLerp: 0 };
  const render = (_time: number, deltaTime: number) => {
    const delta = Math.min(0.05, Math.max(0.001, deltaTime / 1000));
    const factor = 1 - Math.exp(-2.5 * delta);
    state.xLerp += (state.x - state.xLerp) * factor;
    state.yLerp += (state.y - state.yLerp) * factor;
    button.style.transform = `translate3d(${state.xLerp}px, ${state.yLerp}px, 0)`;
    if (Math.abs(state.x) + Math.abs(state.y) + Math.abs(state.xLerp) + Math.abs(state.yLerp) < 0.02) {
      state.xLerp = 0;
      state.yLerp = 0;
      button.style.transform = "";
      gsap.ticker.remove(render);
    }
  };
  const move = (event: PointerEvent) => {
    const bounds = cta.getBoundingClientRect();
    state.x = (event.clientX - bounds.left - bounds.width / 2) * 0.5;
    state.y = (event.clientY - bounds.top - bounds.height / 2) * 0.35;
  };
  const reset = () => {
    state.x = 0;
    state.y = 0;
  };

  const enter = () => {
    gsap.ticker.remove(render);
    gsap.ticker.add(render);
  };
  const cleanup = () => gsap.ticker.remove(render);

  cta.addEventListener("pointerenter", enter);
  cta.addEventListener("pointermove", move);
  cta.addEventListener("pointerleave", reset);
  cta.addEventListener("focusout", reset);
  window.addEventListener("beforeunload", cleanup, { once: true });
  return () => {
    cleanup();
    cta.removeEventListener("pointerenter", enter);
    cta.removeEventListener("pointermove", move);
    cta.removeEventListener("pointerleave", reset);
    cta.removeEventListener("focusout", reset);
    window.removeEventListener("beforeunload", cleanup);
  };
}

function runWorkGalleryOut(webgl?: WebGLLike) {
  window.dispatchEvent(new CustomEvent("rd:soft-woosh"));
  clearWorkPreview(webgl);
  document.documentElement.classList.add("is-work-gallery-leaving");
  if (!prefersReducedMotion()) {
    const descriptionTargets = gsap.utils.toArray<HTMLElement>(".ui-header-description .ui-header-part-inner");
    const availabilityTargets = gsap.utils.toArray<HTMLElement>(".ui-header-availability .ui-header-part-inner");
    gsap.killTweensOf(descriptionTargets);
    gsap.killTweensOf(availabilityTargets);
    gsap.to(descriptionTargets, { opacity: 0, duration: 0.5, ease: "none" });
    gsap.to(availabilityTargets, { opacity: 0, duration: 0.5, ease: "none" });
  }
  webgl?.hideWorkScene?.();
}

function navigateWithWorkSceneOut(url: string, webgl?: WebGLLike, navigate?: AppNavigate) {
  if (document.documentElement.classList.contains("is-work-gallery-leaving")) return;
  window.dispatchEvent(new CustomEvent("rd:work-gallery-out", { detail: { url } }));
  if (navigate) navigate(url, "home");
  else window.setTimeout(() => window.location.assign(url), 500);
}

function animateCurrentViewOut() {
  if (prefersReducedMotion()) return;
  const view = document.querySelector<HTMLElement>("[data-view]");
  if (!view) return;
  gsap.killTweensOf(view);
  gsap.to(view, { opacity: 0, duration: 0.5, ease: "linear" });
}

function dispatchSoundMode(enabled: boolean) {
  window.dispatchEvent(new CustomEvent("rd:sound-mode", { detail: { enabled } }));
}

function formatButton(button: HTMLElement) {
  const background = button.querySelector<HTMLElement>(".c-button-bg");
  const svg = background?.querySelector<SVGSVGElement>("svg");
  const rectStatic = svg?.querySelector<SVGRectElement>(".c-button-bg-static");
  const rectHover = svg?.querySelector<SVGRectElement>(".c-button-bg-hover");
  if (!background || !svg || !rectStatic || !rectHover) return;

  const width = Math.max(1, Math.round(background.offsetWidth));
  const height = Math.max(1, Math.round(background.offsetHeight));
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  rectStatic.setAttribute("width", String(width));
  rectStatic.setAttribute("height", String(Math.max(1, height - 2)));
  rectHover.setAttribute("width", String(width));
  rectHover.setAttribute("height", String(Math.max(1, height - 2)));
}

function initButtons() {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>(".c-button"));
  if (!buttons.length) return () => {};
  const formatAll = () => buttons.forEach(formatButton);
  requestAnimationFrame(formatAll);
  window.addEventListener("resize", formatAll);
  return () => window.removeEventListener("resize", formatAll);
}

function initPreloader(loadCompletePromise: Promise<unknown> = Promise.resolve()) {
  const preloader = document.querySelector<HTMLElement>(".preloader");
  const progressContainer = document.querySelector<HTMLElement>(".preloader-progress");
  const progressCircles = document.querySelector<HTMLElement>(".preloader-progress-circles");
  const progressCircle = document.querySelector<SVGCircleElement>(".preloader-progress-circle");
  const progressCircleOutline = document.querySelector<SVGCircleElement>(".preloader-progress-outline");
  const progressTextInner = document.querySelector<HTMLElement>(".preloader-progress-text-inner");
  const progressText = document.querySelector<HTMLElement>(".preloader-progress-text-percent");
  const textDots = document.querySelector<HTMLElement>(".preloader-footer-text-dots");
  const cta = document.querySelector<HTMLElement>(".preloader-cta");
  const cta2 = document.querySelector<HTMLElement>(".preloader-cta-2");
  const ctaTextInner = document.querySelector<HTMLElement>(".preloader-cta-text-inner");
  const ctaTextInner2 = document.querySelector<HTMLElement>(".preloader-cta-text-2-inner");
  const footerTextInner = document.querySelector<HTMLElement>(".preloader-footer-text-inner");
  const isMobile = () => window.matchMedia("(pointer: coarse)").matches;
  const skipPreloader = new URLSearchParams(window.location.search).has("skip-preloader");
  const progressState = {
    progress: 0,
    progressCircleR: progressCircle?.r.baseVal.value ?? 230,
    progressCircleOutlineR: progressCircleOutline?.r.baseVal.value ?? 224,
    rotation: 0,
  };
  let loadingTextTimer = 0;
  let loadCompleteTimer = 0;
  let activeTimer = 0;
  let rotationTween: gsap.core.Tween | undefined;
  let progressTween: gsap.core.Tween | undefined;
  let complete = false;

  const reveal = (soundEnabled: boolean) => {
    if (complete) return;
    complete = true;
    window.clearTimeout(loadingTextTimer);
    window.clearTimeout(loadCompleteTimer);
    window.clearTimeout(activeTimer);
    rotationTween?.kill();
    progressTween?.kill();
    if (!isMobile()) {
      window.dispatchEvent(new CustomEvent("rd:sound-init"));
      if (soundEnabled) {
        dispatchSoundMode(true);
        window.dispatchEvent(new CustomEvent("rd:sound-click"));
      }
    }
    window.dispatchEvent(new CustomEvent("rd:sound-show-button"));
    document.body.classList.remove("is-preloading");
    document.body.classList.add("has-entered");
    if (preloader) preloader.style.pointerEvents = "none";
    if (cta) cta.style.pointerEvents = "none";
    if (cta2) cta2.style.pointerEvents = "none";
    let finalized = false;
    const finalize = () => {
      if (finalized) return;
      finalized = true;
      preloader?.remove();
      emitPageEntered();
    };
    if (progressContainer) {
      gsap.killTweensOf(progressContainer);
      gsap.to(progressContainer, {
        scale: 1.2,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        onComplete: finalize,
      });
      window.setTimeout(finalize, 1100);
    } else {
      finalize();
    }
  };

  if (skipPreloader) {
    document.body.classList.remove("is-preloading");
    document.body.classList.add("has-entered");
    preloader?.remove();
    emitPageEntered();
    return;
  }

  const setProgressText = (value: number) => {
    if (progressText) progressText.innerHTML = String(Math.floor(value));
  };

  const setProgressCircle = (value = 0) => {
    if (!progressCircle) return;
    const radius = progressCircle.r.baseVal.value;
    const circumference = Math.PI * radius * 2;
    const offset = circumference - (circumference * value) / 100;
    progressCircle.style.strokeDasharray = String(circumference);
    progressCircle.style.strokeDashoffset = String(offset);
  };

  const setProgressCircleToIntro = (value = 100) => {
    if (!progressCircle || !progressCircleOutline) return;
    const radius = progressCircle.r.baseVal.value;
    const hoverRadius = radius * 0.95;
    const circumference = Math.PI * (radius * 2);
    const hoverCircumference = Math.PI * (hoverRadius * 2);
    const staticRatio = 0.05 * (value / 100);
    const hoverRatio = 0.0001 * (value / 100);
    const staticDash = circumference * (0.5 - staticRatio);
    const staticGap = circumference * staticRatio;
    const hoverDash = hoverCircumference * (0.5 - hoverRatio);
    const hoverGap = hoverCircumference * hoverRatio;
    progressCircle.style.setProperty("--circle-dash-array-static", `${staticDash} ${staticGap}`);
    progressCircle.style.setProperty("--circle-dash-offset-static", String(staticDash));
    progressCircle.style.setProperty("--circle-dash-array-hover", `${hoverDash} ${hoverGap}`);
    progressCircle.style.setProperty("--circle-dash-offset-hover", String(hoverDash));
    progressCircle.style.setProperty("--circle-r1-hover", `${hoverRadius}px`);
    progressCircleOutline.style.setProperty("--circle-r2-hover", `${hoverRadius * 1.075}px`);
    progressCircle.style.strokeDasharray = "";
    progressCircle.style.strokeDashoffset = "";
  };

  const loadingTextAnimation = (text = "") => {
    if (textDots) textDots.innerText = text;
    const nextText = text.length < 3 ? `${text}.` : "";
    loadingTextTimer = window.setTimeout(() => loadingTextAnimation(nextText), 400);
  };

  const activateCtas = () => {
    cta?.classList.add("is-active");
    cta2?.classList.add("is-active");
    cta?.addEventListener("click", () => reveal(cta.dataset.sound !== "false"), { once: true });
    cta2?.addEventListener("click", () => reveal(false), { once: true });
  };

  const onLoadComplete = () => {
    rotationTween?.pause();
    const rotationTarget = 135 - (progressState.rotation % 360) + 360;
    if (progressCircles) gsap.to(progressCircles, { rotate: `+=${rotationTarget}deg`, duration: 2, ease: "expo.out" });
    const introState = { progress: 0 };
    if (progressContainer) gsap.to(progressContainer, { translateY: "-.75rem", duration: 2, ease: "expo.out" });
    if (ctaTextInner) gsap.fromTo(ctaTextInner, { translateY: "-102%", opacity: 0 }, { translateY: "0", opacity: 1, duration: 1.2, ease: "expo.out" });
    if (progressTextInner) {
      gsap.fromTo(progressTextInner, { translateY: "0" }, { translateY: "102%", duration: 1.2, ease: "expo.out" });
      gsap.to(progressTextInner, { opacity: 0, duration: 0.2, ease: "none" });
    }
    if (progressCircle) {
      gsap.to(progressState, {
        progressCircleR: 120,
        duration: 2,
        ease: "expo.out",
        onUpdate: () => progressCircle.setAttribute("r", String(progressState.progressCircleR)),
      });
    }
    if (progressCircleOutline) {
      gsap.to(progressState, {
        progressCircleOutlineR: 115,
        duration: 2,
        ease: "expo.out",
        onUpdate: () => progressCircleOutline.setAttribute("r", String(progressState.progressCircleOutlineR)),
      });
    }
    gsap.to(introState, {
      progress: 100,
      duration: 2,
      ease: "expo.out",
      onUpdate: () => setProgressCircleToIntro(introState.progress),
    });
    if (footerTextInner) gsap.fromTo(footerTextInner, { translateY: "0", opacity: 1 }, { translateY: "102%", opacity: 0, duration: 1, ease: "expo.out" });
    if (ctaTextInner2) gsap.fromTo(ctaTextInner2, { translateY: "102%", opacity: 0 }, { translateY: "0", opacity: 1, duration: 2, delay: 0.2, ease: "expo.out" });
    activeTimer = window.setTimeout(activateCtas, 1000);
  };

  setProgressCircle(0);
  window.setTimeout(() => {
    if (progressContainer) gsap.fromTo(progressContainer, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 3, ease: "power4.out" });
    if (footerTextInner) gsap.fromTo(footerTextInner, { opacity: 0, translateY: "110%" }, { opacity: 1, translateY: "0", duration: 1.8, delay: 0.02, ease: "expo.out" });
    rotationTween = gsap.to(progressState, {
      rotation: 360,
      duration: 6,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        if (progressCircles) progressCircles.style.transform = `rotate(${progressState.rotation}deg)`;
      },
    });
    progressTween = gsap.to(progressState, {
      progress: 100,
      duration: 1,
      ease: "power4.out",
      onUpdate: () => {
        setProgressCircle(progressState.progress);
        setProgressText(progressState.progress);
      },
      onComplete: () => {
        void loadCompletePromise.finally(() => {
          loadCompleteTimer = window.setTimeout(onLoadComplete, 1000);
        });
      },
    });
    loadingTextAnimation();
  }, 100);
}

function initMenu() {
  const nav = document.querySelector<HTMLElement>(".ui-nav-mobile");
  const toggle = document.querySelector<HTMLElement>(".ui-nav-mobile-toggle");
  const links = Array.from(nav?.querySelectorAll<HTMLAnchorElement>(".ui-nav-mobile-a") ?? []);
  const cleanupCallbacks: Array<() => void> = [];
  let closeTimer = 0;
  const close = () => {
    window.clearTimeout(closeTimer);
    nav?.classList.remove("is-active");
    document.documentElement.classList.remove("is-nav-mobile-open");
  };
  const setActive = (slug: string | undefined) => {
    links.forEach((link) => link.classList.toggle("is-active", Boolean(slug) && link.dataset.slug === slug));
  };

  if (nav) {
    gsap.fromTo(nav, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" });
  }

  const onToggleClick = () => {
    const active = nav?.classList.toggle("is-active") ?? false;
    document.documentElement.classList.toggle("is-nav-mobile-open", active);
  };
  toggle?.addEventListener("click", onToggleClick);
  cleanupCallbacks.push(() => toggle?.removeEventListener("click", onToggleClick));

  links.forEach((link) => {
    const onClick = () => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        setActive(link.dataset.slug);
        close();
      }, 300);
    };
    link.addEventListener("click", onClick);
    cleanupCallbacks.push(() => link.removeEventListener("click", onClick));
  });
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
  window.addEventListener("keydown", onKeyDown);
  cleanupCallbacks.push(() => window.removeEventListener("keydown", onKeyDown));
  return () => {
    window.clearTimeout(closeTimer);
    cleanupCallbacks.splice(0).forEach((cleanup) => cleanup());
    close();
  };
}

function initWorkPreview(getWebgl: () => WebGLLike | undefined, navigate?: AppNavigate) {
  document.documentElement.classList.remove("is-work-gallery-leaving");
  const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
  const progressItems = document.querySelectorAll<HTMLElement>("[data-progress-slug]");
  const cardsArray = Array.from(cards);
  const progressArray = Array.from(progressItems);
  let activeIndex = Math.max(0, Array.from(cards).findIndex((card) => card.classList.contains("is-active")));
  if (!cards.length) return () => {};

  const totalItems = cardsArray.length - 1;
  const step = 1000;
  const limit = cardsArray.length * step;
  const indexState: WorkGalleryIndexState = {
    current: activeIndex,
    prev: activeIndex === 0 ? totalItems : activeIndex - 1,
    next: activeIndex === totalItems ? 0 : activeIndex + 1,
  };
  let activeHook = activeIndex * step;
  let targetHook = activeHook;
  let sceneRotation = 0;
  let activeProjectId = cardsArray[activeIndex]?.dataset.slug ?? "";
  let restoredWorkState = false;
  let restoredScrollActive: boolean | null = null;
  let restoredScrollActivePreserved = true;
  const scroll: WorkGalleryScrollState = {
    virtual: cardsArray.length * 100000,
    target: cardsArray.length * 100000,
    animated: cardsArray.length * 100000,
    diff: 0,
    current: 0,
    progress: 0,
    limit,
    remainder: 0,
    step,
    offset: 0,
    velocity: 0,
    active: false,
  };
  const galleryElement = document.querySelector<HTMLElement>(".ui-work-content") ?? document.querySelector<HTMLElement>("[data-view='home']");
  const wrap = (value: number, max: number) => ((value % max) + max) % max;
  const restored = runtimeWorkState;
  const restoredSlug = restored?.activeProject ?? restored?.slug ?? currentProjectId ?? undefined;
  const restoredIndex = cardsArray.findIndex((card) => card.dataset.slug === restoredSlug);
  if (restored && restoredIndex >= 0) {
    activeIndex = restoredIndex;
    const sourceRestoredActive = restored.scroll.active;
    Object.assign(indexState, restored.index);
    Object.assign(scroll, restored.scroll);
    activeHook = typeof restored.activeHook === "number" ? restored.activeHook : restoredIndex * step + scroll.remainder;
    targetHook = typeof restored.targetHook === "number" ? restored.targetHook : activeHook;
    sceneRotation = typeof restored.sceneRotation === "number" && Math.abs(restored.sceneRotation) <= 30 ? restored.sceneRotation : 0;
    activeProjectId = restored.activeProject ?? restored.slug ?? cardsArray[restoredIndex]?.dataset.slug ?? "";
    currentProjectId = activeProjectId || currentProjectId;
    restoredWorkState = true;
    restoredScrollActive = scroll.active;
    restoredScrollActivePreserved = scroll.active === sourceRestoredActive;
    scroll.current = wrap(scroll.animated || scroll.target || restoredIndex * step, limit);
    scroll.progress = scroll.current / limit;
    scroll.remainder = scroll.target - (scroll.target % limit);
  }
  indexState.current = activeIndex;
  indexState.prev = activeIndex === 0 ? totalItems : activeIndex - 1;
  indexState.next = activeIndex === totalItems ? 0 : activeIndex + 1;
  let isTransitioning = false;
  let nextTransitioning = false;
  let prevTransitioning = false;
  let snap = false;
  let snapTimeout = 0;
  let nextTimeout = 0;
  let prevTimeout = 0;
  let navClickTimeout = 0;
  let lastFrame = performance.now();
  let raf = 0;
  let scrollToAnimation: ReturnType<typeof gsap.to> | undefined;
  const ctaTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
  const cleanupCallbacks: Array<() => void> = [];
  const mobileQuery = window.matchMedia("(max-width: 999px)");
  const hasTouch = "ontouchstart" in window;
  const pointer = {
    active: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    lastDeltaX: 0,
    lastDeltaY: 0,
    moved: false,
  };
  let lastTouchSelect = 0;
  let webglGalleryEntered = false;

  const sourceRound = (value: number, precision = 4) => {
    const scale = 10 ** precision;
    return Math.round(value * scale) / scale;
  };
  const sourceDamp = (current: number, target: number, factor: number, delta: number) =>
    sourceRound(current + (target - current) * (1 - Math.exp(-factor * delta)));
  const sourceClampRound = (value: number, min: number, max: number) =>
    sourceRound(Math.min(Math.max(min, value), max));

  const setIndexState = (index: number) => {
    activeIndex = index < 0 ? totalItems : index > totalItems ? 0 : index;
    indexState.current = activeIndex;
    indexState.prev = activeIndex === 0 ? totalItems : activeIndex - 1;
    indexState.next = activeIndex === totalItems ? 0 : activeIndex + 1;
  };

  const setDomActiveIndex = (index: number) => {
    setIndexState(index);
    const card = cardsArray[activeIndex];
    if (!card) return;
    cardsArray.forEach((item) => {
      const wasActive = item.classList.contains("is-active");
      item.classList.remove("is-active");
      if (item !== card && wasActive) animateCta(item, false);
    });
    progressArray.forEach((item) => item.classList.toggle("is-active", (item.dataset.slug ?? item.dataset.progressSlug) === card.dataset.slug));
    card.classList.add("is-active");
    animateCta(card, true);
  };

  const activateIndex = (index: number, emitScene = true, force = false, emitEvents = true) => {
    setDomActiveIndex(index);
    const card = cardsArray[activeIndex];
    if (!card) return;
    const nextProjectId = card.dataset.slug ?? "";
    const changedProject = nextProjectId !== activeProjectId;
    if (!changedProject && !force) return;
    activeProjectId = nextProjectId;
    currentProjectId = nextProjectId;
    const payload = projectPayloadFromElement(card);
    applyActiveColor(payload.color);
    if (emitEvents) window.dispatchEvent(new CustomEvent("rd:project-active", { detail: nextProjectId }));
    if (emitScene) getWebgl()?.setProject(payload);
  };

  function animateCta(card: HTMLElement, active: boolean) {
    const cta = card.querySelector<HTMLElement>(".ui-work-cta .c-button");
    if (!cta) return;
    ctaTimelines.get(cta)?.kill();
    const textInner = cta.querySelector<HTMLElement>(".c-button-text-inner");
    const timeline = gsap.timeline();
    ctaTimelines.set(cta, timeline);
    if (active) {
      timeline.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" });
      if (textInner) {
        timeline.fromTo(
          textInner,
          { opacity: 0, y: "102%" },
          { opacity: 1, y: 0, duration: 1.6, ease: "expo.out", clearProps: "transform,opacity" },
          0,
        );
      }
      return;
    }
    timeline.to(cta, { opacity: 0, duration: 0.3, ease: "none", clearProps: "opacity" });
  }

  const finalScrollPosition = (index: number) => {
    const close = Math.abs(activeIndex - index) <= cardsArray.length / 2;
    const activePastHalf = activeIndex > cardsArray.length / 2;
    const hook = index * scroll.step;
    if (close) return hook + scroll.remainder;
    if (activePastHalf) return hook + scroll.remainder + scroll.limit;
    return hook + scroll.remainder - (scroll.virtual > scroll.target ? 0 : scroll.limit);
  };

  const scrollTo = (position: number) => {
    scroll.virtual = position;
    scrollToAnimation?.kill();
    scrollToAnimation = gsap.to(scroll, {
      target: position,
      duration: 1.6,
      ease: "expo.out",
    });
  };

  const scrollToIndex = (index: number) => {
    if (!cardsArray[index]) return;
    if (index === activeIndex && !isTransitioning) return;
    window.clearTimeout(navClickTimeout);
    isTransitioning = true;
    targetHook = finalScrollPosition(index);
    scrollTo(targetHook);
    activateIndex(index);
    targetHook = index * scroll.step + scroll.remainder;
    navClickTimeout = window.setTimeout(() => {
      isTransitioning = false;
    }, 1200);
  };

  const next = () => {
    window.clearTimeout(nextTimeout);
    nextTransitioning = true;
    scrollTo(scroll.virtual + scroll.step);
    nextTimeout = window.setTimeout(() => {
      nextTransitioning = false;
    }, 800);
  };

  const prev = () => {
    window.clearTimeout(prevTimeout);
    prevTransitioning = true;
    scrollTo(scroll.virtual - scroll.step);
    prevTimeout = window.setTimeout(() => {
      prevTransitioning = false;
    }, 800);
  };

  const setDragging = (enabled: boolean) => {
    galleryElement?.classList.toggle("is-dragging", enabled);
  };

  const checkSpeed = () => {
    const moving = Math.abs(pointer.lastDeltaX) + Math.abs(pointer.lastDeltaY) * 0.001 > 0.2;
    setDragging(pointer.active && moving);
  };

  const handleGalleryDelta = (delta: number, allowZero = false) => {
    if (!scroll.active) return false;
    if (nextTransitioning || prevTransitioning) return false;
    if (!allowZero && Math.abs(delta) < 0.01) return false;
    window.clearTimeout(snapTimeout);
    snap = true;
    scroll.diff += delta;
    if (delta > 15) next();
    if (delta < -15) prev();
    snapTimeout = window.setTimeout(() => {
      snap = true;
    }, 100);
    return true;
  };

  const saveWorkState = () => {
    const card = cardsArray[activeIndex];
    if (!card) return;
    const slug = card.dataset.slug;
    currentProjectId = slug ?? activeProjectId;
    runtimeWorkState = {
      slug,
      activeProject: slug,
      index: { ...indexState },
      scroll: {
        virtual: scroll.virtual,
        target: scroll.target,
        animated: scroll.animated,
        diff: scroll.diff,
        current: scroll.current,
        progress: scroll.progress,
        targetPlusDiff: scroll.targetPlusDiff,
        remainder: scroll.remainder,
        limit: scroll.limit,
        step: scroll.step,
        offset: scroll.offset,
        velocity: scroll.velocity,
        active: scroll.active,
      },
      activeHook,
      targetHook,
      sceneRotation,
    };
  };

  const previewWork = (enabled: boolean) => {
    if (document.documentElement.classList.contains("is-work-gallery-leaving")) return;
    getWebgl()?.setPreviewMode?.(enabled);
  };

  const enterWorkGallery = () => {
    activateIndex(activeIndex, false, true, true);
    scroll.active = true;
    const webgl = getWebgl();
    if (!webgl) return;
    if (webglGalleryEntered) return;
    webgl.restoreGalleryState?.(scroll.progress, sceneRotation);
    webgl.setGalleryProgress?.(scroll.progress, scroll.velocity, 1 / 60);
    webgl.enterWorkGallery?.(activeProjectId || cardsArray[activeIndex]?.dataset.slug);
    webglGalleryEntered = true;
  };

  const onPageShow = () => {
    document.documentElement.classList.remove("is-work-gallery-leaving");
    previewWork(false);
  };
  const onWorkGalleryOut = () => runWorkGalleryOut(getWebgl());
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("rd:work-gallery-out", onWorkGalleryOut);
  window.addEventListener("rd:home-gallery-in", enterWorkGallery);
  cleanupCallbacks.push(() => {
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("rd:work-gallery-out", onWorkGalleryOut);
    window.removeEventListener("rd:home-gallery-in", enterWorkGallery);
  });

  cardsArray.forEach((card, index) => {
    const workLink = card.querySelector<HTMLElement>(".ui-work-a");
    const onWorkLinkClick = (event: MouseEvent) => {
      event.preventDefault();
      if (performance.now() - lastTouchSelect < 500) return;
      scrollToIndex(index);
    };
    const onWorkLinkTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      lastTouchSelect = performance.now();
      scrollToIndex(index);
    };
    const cta = card.querySelector<HTMLElement>(".ui-work-cta");
    const onCtaClick = (event: MouseEvent) => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("rd:sound-click"));
      if (performance.now() - lastTouchSelect < 500) return;
    };
    const onCtaMouseEnter = () => previewWork(true);
    const onCtaMouseLeave = () => previewWork(false);
    const onCtaFocusIn = () => previewWork(true);
    const onCtaFocusOut = () => previewWork(false);
    const cleanupCtaMagnet = cta ? initCtaMagnet(cta) : undefined;

    workLink?.addEventListener("click", onWorkLinkClick);
    if (mobileQuery.matches) workLink?.addEventListener("touchstart", onWorkLinkTouchStart);
    cta?.addEventListener("click", onCtaClick);
    cta?.addEventListener("mouseenter", onCtaMouseEnter);
    cta?.addEventListener("mouseleave", onCtaMouseLeave);
    cta?.addEventListener("focusin", onCtaFocusIn);
    cta?.addEventListener("focusout", onCtaFocusOut);
    cleanupCallbacks.push(() => {
      workLink?.removeEventListener("click", onWorkLinkClick);
      if (mobileQuery.matches) workLink?.removeEventListener("touchstart", onWorkLinkTouchStart);
      cta?.removeEventListener("click", onCtaClick);
      cta?.removeEventListener("mouseenter", onCtaMouseEnter);
      cta?.removeEventListener("mouseleave", onCtaMouseLeave);
      cta?.removeEventListener("focusin", onCtaFocusIn);
      cta?.removeEventListener("focusout", onCtaFocusOut);
      cleanupCtaMagnet?.();
    });
  });

  progressArray.forEach((item) => {
    const selectProgressItem = () => {
      const slug = item.dataset.slug ?? item.dataset.progressSlug;
      const index = cardsArray.findIndex((candidate) => candidate.dataset.slug === slug);
      if (index >= 0) {
        scrollToIndex(index);
      }
    };
    const onProgressClick = (event: MouseEvent) => {
      event.preventDefault();
      if (performance.now() - lastTouchSelect < 500) return;
      selectProgressItem();
    };
    const onProgressTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      lastTouchSelect = performance.now();
      selectProgressItem();
    };
    item.addEventListener("click", onProgressClick);
    if (mobileQuery.matches) item.addEventListener("touchstart", onProgressTouchStart);
    cleanupCallbacks.push(() => {
      item.removeEventListener("click", onProgressClick);
      if (mobileQuery.matches) item.removeEventListener("touchstart", onProgressTouchStart);
    });
  });

  const onWheel = (event: WheelEvent) => {
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!handleGalleryDelta(delta)) return;
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next();
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") prev();
  };

  const onMouseDown = (event: MouseEvent) => {
    if (pointer.active) return;
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.lastDeltaX = 0;
    pointer.lastDeltaY = 0;
    pointer.moved = false;
    event.preventDefault();
    handleGalleryDelta(0, true);
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!pointer.active) return;
    const deltaX = -(event.clientX - pointer.x);
    const deltaY = -(event.clientY - pointer.y);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.lastDeltaX = deltaX;
    pointer.lastDeltaY = deltaY;
    const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    pointer.moved = handleGalleryDelta(delta) || pointer.moved;
  };

  const onPointerEnd = () => {
    pointer.active = false;
    pointer.lastDeltaX = 0;
    pointer.lastDeltaY = 0;
    handleGalleryDelta(0, true);
  };

  const onBlur = () => {
    pointer.active = false;
    pointer.lastDeltaX = 0;
    pointer.lastDeltaY = 0;
    setDragging(false);
  };

  const onTouchStart = (event: TouchEvent) => {
    if (pointer.active) return;
    const point = event.touches[0];
    pointer.active = true;
    pointer.x = point?.clientX ?? 0;
    pointer.y = point?.clientY ?? 0;
    pointer.startX = pointer.x;
    pointer.startY = pointer.y;
    pointer.lastDeltaX = 0;
    pointer.lastDeltaY = 0;
    pointer.moved = false;
    handleGalleryDelta(0, true);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!pointer.active) return;
    const point = event.touches[0];
    if (!point) return;
    const deltaX = -(point.clientX - pointer.x);
    const deltaY = -(point.clientY - pointer.y);
    pointer.x = point.clientX;
    pointer.y = point.clientY;
    pointer.lastDeltaX = deltaX;
    pointer.lastDeltaY = deltaY;
    const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    pointer.moved = handleGalleryDelta(delta) || pointer.moved;
  };

  const onTouchEnd = () => {
    pointer.active = false;
    pointer.lastDeltaX = 0;
    pointer.lastDeltaY = 0;
    handleGalleryDelta(0, true);
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("blur", onBlur);
  if (hasTouch) {
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
  } else {
    window.addEventListener("mousedown", onMouseDown, { passive: false });
    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", onPointerEnd, { passive: false });
  }
  cleanupCallbacks.push(() => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("blur", onBlur);
    if (hasTouch) {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    } else {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onPointerEnd);
    }
  });

  const tick = (now: number) => {
    const delta = (now - lastFrame) / 1000;
    lastFrame = now;
    (window as HomeGalleryProbeWindow).__rogierHomeGalleryRuntime = {
      deltaMode: "source-yD-onRaf-uses-Bt-raw-delta-no-gallery-clamp",
      deltaClampApplied: false,
      lastDelta: delta,
      lastDeltaFinite: Number.isFinite(delta),
      workStateRestoreMode: "source-yD-Qe-workState-preserves-scroll-active",
      workStateRestored: restoredWorkState,
      restoredScrollActive,
      restoredScrollActivePreserved,
      scrollActive: scroll.active,
    };
    scroll.velocity = scroll.target - scroll.animated;
    checkSpeed();
    if (snap) scroll.diff = sourceDamp(scroll.diff, 0, 5, delta);
    scroll.targetPlusDiff = scroll.target + scroll.diff;
    scroll.remainder = scroll.target - (scroll.target % scroll.limit);
    scroll.animated = sourceDamp(scroll.animated, scroll.targetPlusDiff, 5, delta);
    scroll.current = wrap(scroll.animated, scroll.limit);
    scroll.progress = scroll.current / scroll.limit;

    if (!isTransitioning && scroll.active) {
      let index = Math.round(Math.abs((scroll.current % scroll.limit) / scroll.step));
      if (scroll.current > scroll.limit - scroll.step / 2) index = 0;
      activeHook = index * scroll.step + scroll.remainder;
      if (cardsArray[index] && index !== activeIndex) {
        activateIndex(index);
        targetHook = index * scroll.step + scroll.remainder;
      }
    }
    if (scroll.active) getWebgl()?.setGalleryProgress?.(scroll.progress, scroll.velocity, delta);
    const rollTarget = sourceClampRound(scroll.velocity * -0.015, -4, 4);
    sceneRotation = sourceDamp(sceneRotation, rollTarget, 5, delta);
    raf = requestAnimationFrame(tick);
  };

  const cleanupWorkGallery = () => {
    saveWorkState();
    scrollToAnimation?.kill();
    window.clearTimeout(snapTimeout);
    window.clearTimeout(nextTimeout);
    window.clearTimeout(prevTimeout);
    window.clearTimeout(navClickTimeout);
    cancelAnimationFrame(raf);
    cardsArray.forEach((card) => {
      const cta = card.querySelector<HTMLElement>(".ui-work-cta .c-button");
      if (cta) {
        ctaTimelines.get(cta)?.kill();
        ctaTimelines.delete(cta);
      }
    });
    setDragging(false);
    cleanupCallbacks.splice(0).forEach((cleanup) => cleanup());
  };

  raf = requestAnimationFrame(tick);
  const onPageHide = () => saveWorkState();
  const onBeforeUnload = () => cleanupWorkGallery();
  window.addEventListener("pagehide", onPageHide, { once: true });
  window.addEventListener("beforeunload", onBeforeUnload, { once: true });
  cleanupCallbacks.push(() => {
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("beforeunload", onBeforeUnload);
  });
  return cleanupWorkGallery;
}

function initScrollState() {
  const projectHeader = document.querySelector<HTMLElement>(".ui-project-content-header");
  const desktopQuery = window.matchMedia("(min-width: 1000px)");
  const scrollbar = document.querySelector<HTMLElement>(".ui-scrollbar");
  const scrollbarThumb = scrollbar?.querySelector<HTMLElement>(".ui-scrollbar-thumb");
  let projectHeaderHeight = projectHeader?.clientHeight ?? 0;
  let projectHeaderActive = desktopQuery.matches;
  let scrollbarThumbHeight = scrollbarThumb?.offsetHeight ?? 0;
  let scrollbarInnerHeight = scrollbar?.offsetHeight ?? 0;
  let pointerStart: number | null = null;
  let lastScrollState = pageScrollState();

  const updateScrollbarBounds = () => {
    scrollbarThumbHeight = scrollbarThumb?.offsetHeight ?? 0;
    scrollbarInnerHeight = scrollbar?.offsetHeight ?? 0;
  };

  const updateScrollbarVisibility = () => {
    if (!scrollbar) return;
    scrollbar.style.opacity = lastScrollState.limit > window.innerHeight ? "1" : "0";
  };

  const update = (detail?: PageScrollDetail) => {
    lastScrollState = pageScrollState(detail);
    document.documentElement.classList.toggle("is-scrolled", lastScrollState.scroll > 20);

    if (projectHeader && projectHeaderActive) {
      const opacity = sourceMap(lastScrollState.scroll, 0, projectHeaderHeight, 1, 0);
      const y = sourceMap(lastScrollState.scroll, 0, projectHeaderHeight, 0, 25);
      projectHeader.style.opacity = String(opacity);
      projectHeader.style.transform = `translate3d(0, ${y}px, 0)`;
    }

    if (scrollbarThumb && scrollbarInnerHeight > scrollbarThumbHeight && lastScrollState.limit > 0) {
      const progress = lastScrollState.scroll / lastScrollState.limit;
      scrollbarThumb.style.transform = `translate3d(0,${progress * (scrollbarInnerHeight - scrollbarThumbHeight)}px,0)`;
    }
  };

  const onPageScroll = (event: Event) => update((event as CustomEvent<PageScrollDetail>).detail);
  const onNativeScroll = () => update();
  const onResize = () => {
    projectHeaderHeight = projectHeader?.clientHeight ?? 0;
    projectHeaderActive = desktopQuery.matches;
    if (projectHeader && !projectHeaderActive) {
      projectHeader.style.opacity = "1";
      projectHeader.style.transform = "translate3d(0, 0, 0)";
    }
    updateScrollbarBounds();
    update(lastScrollState);
    updateScrollbarVisibility();
  };
  const onPointerDown = (event: PointerEvent) => {
    pointerStart = event.clientY;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (pointerStart == null || !scrollbarInnerHeight || !scrollbarThumbHeight) return;
    event.preventDefault();
    const target = sourceMap(
      event.clientY,
      pointerStart,
      scrollbarInnerHeight - (scrollbarThumbHeight - pointerStart),
      0,
      lastScrollState.limit,
    );
    (window as HomeGalleryProbeWindow).__rogierPageScroll?.scrollTo(target, { immediate: true }) ?? window.scrollTo(0, target);
  };
  const onPointerUp = () => {
    pointerStart = null;
  };

  updateScrollbarBounds();
  update((window as HomeGalleryProbeWindow).__rogierPageScroll?.getState());
  updateScrollbarVisibility();
  window.addEventListener("rd:page-scroll", onPageScroll);
  window.addEventListener("scroll", onNativeScroll, { passive: true });
  window.addEventListener("resize", onResize);
  scrollbar?.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  return () => {
    window.removeEventListener("rd:page-scroll", onPageScroll);
    window.removeEventListener("scroll", onNativeScroll);
    window.removeEventListener("resize", onResize);
    scrollbar?.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    if (projectHeader) {
      projectHeader.style.opacity = "";
      projectHeader.style.transform = "";
    }
    if (scrollbar) scrollbar.style.opacity = "";
    if (scrollbarThumb) scrollbarThumb.style.transform = "";
  };
}

function initProjectNextState(getWebgl: () => WebGLLike | undefined) {
  const project = document.querySelector<HTMLElement>("[data-view='project'][data-project]");
  const next = document.querySelector<HTMLElement>(".ui-project-next[data-project-slug]");
  if (!project || !next) return;

  const currentPayload = projectPayloadFromElement(project);
  const nextPayload = projectPayloadFromElement(next);
  let nextActive = false;
  let nextHeight = next.clientHeight;
  let viewportHeight = window.innerHeight;
  let lastScrollState = pageScrollState();

  const apply = (payload: ReturnType<typeof projectPayloadFromElement>) => {
    applyActiveColor(payload.color);
    getWebgl()?.setProjectScrollState?.(payload);
  };

  const resize = () => {
    nextHeight = next.clientHeight;
    viewportHeight = window.innerHeight;
  };

  const update = (detail?: PageScrollDetail) => {
    lastScrollState = pageScrollState(detail);
    const scrollHeight = lastScrollState.dimensions.scrollHeight;
    const endScroll = scrollHeight - viewportHeight;
    const start = endScroll - nextHeight / 2;
    const progress = sourceMap(lastScrollState.animatedScroll, start, endScroll, 0, 1, true);
    if (progress >= 0.01) {
      if (!nextActive) {
        nextActive = true;
        apply(nextPayload);
      }
      return;
    }
    if (nextActive) {
      nextActive = false;
      apply(currentPayload);
    }
  };

  const onResize = () => {
    resize();
    update(lastScrollState);
  };
  const onPageScroll = (event: Event) => update((event as CustomEvent<PageScrollDetail>).detail);
  const onNativeScroll = () => update();
  const onPageHide = () => apply(currentPayload);

  resize();
  update((window as HomeGalleryProbeWindow).__rogierPageScroll?.getState());
  window.addEventListener("rd:page-scroll", onPageScroll);
  window.addEventListener("scroll", onNativeScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("pagehide", onPageHide, { once: true });
  return () => {
    window.removeEventListener("rd:page-scroll", onPageScroll);
    window.removeEventListener("scroll", onNativeScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pagehide", onPageHide);
  };
}

function initProjectLeave(getWebgl: () => WebGLLike | undefined) {
  const project = document.querySelector<HTMLElement>("[data-view='project'][data-project]");
  if (!project) return () => {};

  const cleanups: Array<() => void> = [];
  project.querySelectorAll<HTMLAnchorElement>("a[href]:not([target]):not([href^='#']):not([data-router-ignore])").forEach((link) => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.href === window.location.href) return;
      if (event.defaultPrevented) return;
      getWebgl()?.projectLeave?.();
    };
    link.addEventListener("click", onClick);
    cleanups.push(() => link.removeEventListener("click", onClick));
  });
  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}

function initAboutLeave(getWebgl: () => WebGLLike | undefined, navigate?: AppNavigate) {
  const about = document.querySelector<HTMLElement>("[data-view='about']");
  if (!about) return () => {};

  const cleanups: Array<() => void> = [];
  about.querySelectorAll<HTMLAnchorElement>("a[href]:not([target]):not([href^='#']):not([data-router-ignore])").forEach((link) => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.href === window.location.href) return;
      event.preventDefault();
      animateCurrentViewOut();
      getWebgl()?.animateAboutVisualOut?.();
      if (navigate) navigate(target.href, "about");
      else window.setTimeout(() => window.location.assign(target.href), 500);
    };
    link.addEventListener("click", onClick);
    cleanups.push(() => link.removeEventListener("click", onClick));
  });
  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}

function initHomeRouteLeave(getWebgl: () => WebGLLike | undefined, navigate?: AppNavigate) {
  const home = document.querySelector<HTMLElement>("[data-view='home']");
  if (!home) return () => {};

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]:not([target]):not([href^='#']):not([data-router-ignore])"));
  const cleanups: Array<() => void> = [];
  links.forEach((link) => {
    if (link.closest(".ui-work-content")) return;
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.href === window.location.href) return;
      event.preventDefault();
      navigateWithWorkSceneOut(target.href, getWebgl(), navigate);
    };
    link.addEventListener("click", onClick);
    cleanups.push(() => link.removeEventListener("click", onClick));
  });
  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}

function initViewLifecycle(animate = true) {
  const view = document.querySelector<HTMLElement>("[data-view]");
  if (!view) return () => {};

  const viewClass = `is-${view.dataset.view}`;
  document.documentElement.classList.add(viewClass);
  document.querySelector<HTMLElement>(".ui-header-name")?.style.setProperty("pointer-events", "all");

  if (prefersReducedMotion()) {
    view.style.opacity = "1";
    return () => {
      document.documentElement.classList.remove(viewClass);
      view.style.opacity = "";
      document.querySelector<HTMLElement>(".ui-header-name")?.style.removeProperty("pointer-events");
    };
  }

  if (!animate) {
    view.style.opacity = "1";
    const reveal = () => {
      gsap.killTweensOf(view);
      gsap.to(view, { opacity: 1, duration: 0.5, ease: "linear" });
    };
    window.addEventListener("rd:page-entered", reveal, { once: true });
    return () => {
      window.removeEventListener("rd:page-entered", reveal);
      gsap.killTweensOf(view);
      document.documentElement.classList.remove(viewClass);
      view.style.opacity = "";
      document.querySelector<HTMLElement>(".ui-header-name")?.style.removeProperty("pointer-events");
    };
  }

  gsap.killTweensOf(view);
  gsap.fromTo(view, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "linear" });

  return () => {
    gsap.killTweensOf(view);
    document.documentElement.classList.remove(viewClass);
    view.style.opacity = "";
    document.querySelector<HTMLElement>(".ui-header-name")?.style.removeProperty("pointer-events");
  };
}

function shouldInitWebGL() {
  if (new URLSearchParams(window.location.search).has("disable-webgl")) return false;
  const probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return false;
  return true;
}

async function initWebGL() {
  const root = document.querySelector<HTMLElement>("[data-webgl-root]");
  if (!root || !shouldInitWebGL()) return undefined;
  try {
    const { WebGLBackdrop, initializeSourceGpuTier, prepareSourceTextureAssets } = await import("./webgl");
    await initializeSourceGpuTier();
    const sourceTextureAssets = await prepareSourceTextureAssets();
    return new WebGLBackdrop(root, sourceTextureAssets);
  } catch (error) {
    console.warn("WebGL initialization failed", error);
    document.body.classList.remove("has-webgl");
    root.replaceChildren();
    return undefined;
  }
}

function boot() {
  document.documentElement.classList.toggle("is-mobile", window.matchMedia("(pointer: coarse)").matches);
  document.body.classList.add("is-ready");
  let webgl: WebGLLike | undefined;
  let homeGalleryEntered = false;
  let routing = false;
  const pageCache = new Map<string, Document>();
  let cleanupMotion: (() => void) | undefined;
  const cleanupPageCallbacks: Array<() => void> = [];
  const cleanupPageMotion = () => {
    cleanupMotion?.();
    cleanupMotion = undefined;
  };
  const cleanupPage = () => {
    cleanupPageMotion();
    cleanupPageCallbacks.splice(0).forEach((cleanup) => cleanup());
  };
  const cleanupApp = () => {
    cleanupPage();
    document.removeEventListener("click", onRouterClick);
    window.removeEventListener("pagehide", cleanupApp);
    window.removeEventListener("beforeunload", cleanupApp);
  };
  const normalizeRouteUrl = (url: string) => new URL(url, window.location.href).href.split("#")[0];
  const transitionDelay = (mode: TransitionMode) => {
    if (prefersReducedMotion()) return 0;
    if (mode === "home" || mode === "project" || mode === "about" || mode === "work") return 500;
    return 500;
  };
  const loadRoute = async (url: string) => {
    const routeUrl = normalizeRouteUrl(url);
    const cached = pageCache.get(routeUrl);
    if (cached) return cached.cloneNode(true) as Document;
    const response = await fetch(routeUrl, {
      credentials: "same-origin",
      headers: { "X-Requested-With": "rdb" },
    });
    if (!response.ok) throw new Error(`Router request failed: ${response.status}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    pageCache.set(routeUrl, doc);
    return doc.cloneNode(true) as Document;
  };
  const setPageClasses = (nextBody: HTMLBodyElement, nextHtml: HTMLElement) => {
    const routeClasses = ["is-home", "is-about", "is-project", "is-scrolled", "is-work-gallery-leaving", "is-nav-mobile-open"];
    routeClasses.forEach((className) => {
      document.body.classList.toggle(className, nextBody.classList.contains(className));
      document.documentElement.classList.toggle(className, nextHtml.classList.contains(className));
    });
    document.body.classList.add("is-ready", "has-entered");
    document.body.classList.remove("is-preloading");
    document.documentElement.classList.add("js");
  };
  const replacePageDom = (doc: Document) => {
    const nextBody = doc.body;
    const nextHtml = doc.documentElement;
    const nextHeader = doc.querySelector<HTMLElement>(".ui-header");
    const nextNav = doc.querySelector<HTMLElement>(".ui-nav");
    const nextMain = doc.querySelector<HTMLElement>(".ui-main");
    const header = document.querySelector<HTMLElement>(".ui-header");
    const nav = document.querySelector<HTMLElement>(".ui-nav");
    const main = document.querySelector<HTMLElement>(".ui-main");
    if (!nextMain || !main) throw new Error("Router response is missing .ui-main");
    if (nextHeader && header) header.replaceWith(nextHeader);
    if (nextNav && nav) nav.replaceWith(nextNav);
    main.replaceWith(nextMain);
    document.title = doc.title;
    setPageClasses(nextBody, nextHtml);
  };
  const initWebglForCurrentPage = (callbacks: Array<() => void>) => {
    const active = document.querySelector<HTMLElement>("[data-project-card].is-active");
    const project = document.querySelector<HTMLElement>("[data-view='project'][data-project]");
    const payload = projectPayloadFromElement(active ?? project);
    applyActiveColor(payload.color);
    if (document.querySelector("[data-view='home']")) {
      const routeSwapping = document.documentElement.classList.contains("is-route-swapping");
      if (routeSwapping) webgl?.prepareHomeVisualState?.(payload);
      else webgl?.initHomeSpotlight?.();
      onPageEntered(() => {
        void webgl?.animateIn?.();
        const enter = () => {
          webgl?.showScene?.();
          homeGalleryEntered = true;
          window.dispatchEvent(new CustomEvent("rd:home-gallery-in"));
        };
        if (document.querySelector(".preloader") && !prefersReducedMotion()) {
          const timer = window.setTimeout(enter, 1100);
          callbacks.push(() => window.clearTimeout(timer));
          return;
        }
        enter();
      }, callbacks);
    } else if (document.querySelector("[data-view='about']")) {
      webgl?.enterAboutVisualState?.(
        document.querySelector<HTMLElement>(".ui-about-hero-visual"),
        document.querySelector<HTMLElement>(".ui-about-hero"),
      );
      const onPageScroll = (event: Event) => {
        const detail = (event as CustomEvent<PageScrollDetail>).detail ?? {};
        webgl?.setAboutScrollState?.(detail.scroll ?? window.scrollY, detail.velocity ?? 0);
      };
      window.addEventListener("rd:page-scroll", onPageScroll);
      callbacks.push(() => window.removeEventListener("rd:page-scroll", onPageScroll));
      onPageEntered(() => webgl?.animateAboutVisualIn?.(), callbacks);
      callbacks.push(() => webgl?.destroyAboutVisualState?.());
    } else if (project) {
      webgl?.refreshMedia?.();
      webgl?.enterProjectVisualState?.(payload);
      onPageEntered(() => webgl?.mediaAnimateIn?.(), callbacks);
    }
  };
  const initCurrentPage = () => {
    cleanupPage();
    cleanupPageCallbacks.push(initViewLifecycle(!document.documentElement.classList.contains("is-route-swapping")));
    void import("./motion").then(({ initMotion }) => {
      cleanupMotion = initMotion();
    });
    initWebglForCurrentPage(cleanupPageCallbacks);
    cleanupPageCallbacks.push(initMenu() ?? (() => {}));
    cleanupPageCallbacks.push(initButtons());
    window.dispatchEvent(new CustomEvent("rd:bind-sound-items"));
    cleanupPageCallbacks.push(initWorkPreview(() => webgl, navigateTo));
    cleanupPageCallbacks.push(initProjectNextState(() => webgl) ?? (() => {}));
    cleanupPageCallbacks.push(initProjectLeave(() => webgl));
    cleanupPageCallbacks.push(initAboutLeave(() => webgl, navigateTo));
    cleanupPageCallbacks.push(initHomeRouteLeave(() => webgl, navigateTo));
    cleanupPageCallbacks.push(initScrollState());
  };
  const preloadRoutes = () => {
    const urls = new Set<string>([normalizeRouteUrl("/"), normalizeRouteUrl("/about/")]);
    document.querySelectorAll<HTMLAnchorElement>("a[href^='/']:not([target]):not([href^='#'])").forEach((link) => {
      urls.add(normalizeRouteUrl(link.href));
    });
    urls.delete(normalizeRouteUrl(window.location.href));
    urls.forEach((routeUrl) => {
      void loadRoute(routeUrl).catch(() => {});
    });
  };
  const navigateTo: AppNavigate = (url, mode = "default", historyMode = "push") => {
    if (routing) return;
    routing = true;
    const routeUrl = normalizeRouteUrl(url);
    const routePromise = loadRoute(routeUrl);
    const leavePromise = new Promise((resolve) => window.setTimeout(resolve, transitionDelay(mode)));
    if ((mode === "home" || mode === "project") && !document.documentElement.classList.contains("is-work-gallery-leaving")) {
      window.dispatchEvent(new CustomEvent("rd:work-gallery-out", { detail: { url } }));
    }
    animateCurrentViewOut();
    Promise.all([routePromise, leavePromise])
      .then(([nextDoc]) => {
        document.documentElement.classList.add("is-route-swapping");
        cleanupPage();
        replacePageDom(nextDoc);
        if (historyMode === "replace") {
          window.history.replaceState({}, "", routeUrl);
        } else {
          window.history.pushState({}, "", routeUrl);
        }
        window.scrollTo(0, 0);
        initCurrentPage();
        preloadRoutes();
        window.setTimeout(() => {
          document.documentElement.classList.remove("is-route-swapping");
          emitPageEntered();
        }, prefersReducedMotion() ? 0 : 100);
      })
      .catch((error) => {
        console.warn("Internal router failed; falling back to full navigation", error);
        window.location.assign(url);
      })
      .finally(() => {
        routing = false;
      });
  };
  const onRouterClick = (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]:not([target]):not([href^='#']):not([data-router-ignore])");
    if (!link) return;
    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || target.href === window.location.href) return;
    event.preventDefault();
    const view = document.querySelector<HTMLElement>("[data-view]");
    const transition = link.dataset.transition;
    const mode: TransitionMode = transition === "project" || transition === "work"
      ? transition
      : view?.dataset.view === "home" || view?.dataset.view === "about"
        ? view.dataset.view
        : "default";
    navigateTo(target.href, mode);
  };

  const webglReady = initWebGL().then((instance) => {
    webgl = instance;
    initWebglForCurrentPage(cleanupPageCallbacks);
  });
  const audioReady = import("./audio").then(({ initAudio }) => {
    initAudio();
    if (homeGalleryEntered) window.dispatchEvent(new CustomEvent("rd:home-gallery-in"));
  });

  initPreloader(Promise.all([webglReady, audioReady]));
  initCurrentPage();
  preloadRoutes();
  document.addEventListener("click", onRouterClick);
  window.addEventListener("popstate", () => navigateTo(window.location.href, "default", "replace"));
  window.addEventListener("pagehide", cleanupApp, { once: true });
  window.addEventListener("beforeunload", cleanupApp, { once: true });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

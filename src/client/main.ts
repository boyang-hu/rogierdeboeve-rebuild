import gsap from "gsap";

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
  enterWorkGallery?(activeSlug?: string): void;
  setCameraControllerSettings?(lookAt?: { x: number; y: number; z: number }, targetXY?: { x: number; y: number }, rotateAngle?: number): void;
  initHomeSpotlight?(): void;
  setPreviewMode?(enabled: boolean): void;
  animateWorkMouseIn?(): void;
  showScene?(): void;
  hideWorkScene?(): void;
  mediaAnimateIn?(): void;
  enterProjectVisualState?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  setProjectScrollState?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  projectLeave?(): void;
  enterAboutVisualState?(visual?: HTMLElement | null, floating?: HTMLElement | null): void;
  animateAboutVisualIn?(): void;
  animateAboutVisualOut?(): void;
  destroyAboutVisualState?(): void;
  leaveAboutVisualState?(): void;
  refreshMedia?(): void;
};

type AppNavigate = (url: string, mode?: "home" | "project" | "about" | "default", historyMode?: "push" | "replace") => void;

function projectPayloadFromElement(element?: HTMLElement | null) {
  return {
    slug: element?.dataset.slug ?? element?.dataset.project,
    color: element?.dataset.color,
    secondary: element?.dataset.secondary,
    invert: element?.dataset.invert,
    mediaColor: element?.dataset.mediaColor,
    thumb: element?.dataset.thumb,
    blocks: element?.dataset.blocks,
    ambient: element?.dataset.ambient,
    darkness: element?.dataset.darkness,
    overviewDarkness: element?.dataset.overviewDarkness,
    thumbDarkness: element?.dataset.thumbDarkness,
    darknessColor: element?.dataset.darknessColor,
    saturation: element?.dataset.saturation,
    thumbSaturation: element?.dataset.thumbSaturation,
    contrast: element?.dataset.contrast,
    mouseLightness: element?.dataset.mouseLightness,
    spotlight: element?.dataset.spotlight,
  };
}

function applyActiveColor(color?: string) {
  if (color) document.documentElement.style.setProperty("--active-color", color);
}

function hasPageEntered() {
  return document.body.classList.contains("has-entered");
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
    gsap.to(".ui-work-content, .ui-progressbar--work, .ui-work .ui-footer", { opacity: 0, duration: 0.5, ease: "linear" });
  }
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
  persistEnteredSession();
  window.dispatchEvent(new CustomEvent("rd:work-gallery-out", { detail: { url } }));
  navigate?.(url, "home") ?? window.setTimeout(() => window.location.assign(url), 500);
}

function dispatchSoundMode(enabled: boolean) {
  window.dispatchEvent(new CustomEvent("rd:sound-mode", { detail: { enabled } }));
}

function getSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
}

function persistSoundMode(enabled: boolean) {
  setSessionValue("rd:sound-enabled", String(enabled));
}

function persistEnteredSession() {
  setSessionValue("rd:has-entered", "true");
  document.documentElement.classList.add("has-session-entered");
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

function initPreloader() {
  const preloader = document.querySelector<HTMLElement>("[data-preloader]");
  const percent = document.querySelector<HTMLElement>("[data-preloader-percent]");
  const enterButtons = document.querySelectorAll<HTMLButtonElement>("[data-preloader-enter]");
  const soundToggle = document.querySelector<HTMLButtonElement>("[data-sound-toggle]");
  const hasEntered = () => getSessionValue("rd:has-entered") === "true";
  const getSessionSoundMode = () => getSessionValue("rd:sound-enabled") !== "false";
  const setSessionState = (soundEnabled: boolean) => {
    persistEnteredSession();
    setSessionValue("rd:sound-enabled", String(soundEnabled));
  };
  const skipPreloader = new URLSearchParams(window.location.search).has("skip-preloader") || hasEntered();
  let progress = 0;
  let complete = false;

  const reveal = (soundEnabled: boolean) => {
    if (complete) return;
    complete = true;
    setSessionState(soundEnabled);
    dispatchSoundMode(soundEnabled);
    soundToggle?.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle?.classList.toggle("is-muted", !soundEnabled);
    document.body.classList.remove("is-preloading");
    document.body.classList.add("has-entered");
    preloader?.classList.add("is-hidden");
    emitPageEntered();
    window.setTimeout(() => preloader?.remove(), 850);
  };

  if (skipPreloader) {
    reveal(getSessionSoundMode());
    return;
  }

  const timer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.ceil((100 - progress) * 0.18));
    if (percent) percent.textContent = String(progress);
    if (progress >= 100) {
      window.clearInterval(timer);
      enterButtons.forEach((button) => button.classList.add("is-active"));
    }
  }, 90);

  enterButtons.forEach((button) => {
    button.addEventListener("click", () => reveal(button.dataset.soundMode !== "off"));
  });

  window.setTimeout(() => {
    enterButtons.forEach((button) => button.classList.add("is-active"));
    if (percent) percent.textContent = "100";
  }, 1000);
}

function initSoundToggle() {
  const toggle = document.querySelector<HTMLButtonElement>("[data-sound-toggle]");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const enabled = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.classList.toggle("is-muted", !enabled);
    persistSoundMode(enabled);
    dispatchSoundMode(enabled);
  });
}

function initMenu() {
  const nav = document.querySelector<HTMLElement>(".ui-nav-mobile");
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const links = Array.from(nav?.querySelectorAll<HTMLAnchorElement>(".ui-nav-mobile-a") ?? []);
  const cleanupCallbacks: Array<() => void> = [];
  let closeTimer = 0;
  const close = () => {
    window.clearTimeout(closeTimer);
    nav?.classList.remove("is-active");
    document.documentElement.classList.remove("is-nav-mobile-open");
    toggle?.setAttribute("aria-expanded", "false");
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
    toggle?.setAttribute("aria-expanded", String(active));
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
  const stateKey = "rd:work-state";
  const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
  const progressItems = document.querySelectorAll<HTMLElement>("[data-progress-slug]");
  const cardsArray = Array.from(cards);
  const progressArray = Array.from(progressItems);
  let activeIndex = Math.max(0, Array.from(cards).findIndex((card) => card.classList.contains("is-active")));
  if (!cards.length) return () => {};

  const totalItems = cardsArray.length - 1;
  const step = 1000;
  const limit = cardsArray.length * step;
  const indexState = {
    current: activeIndex,
    prev: activeIndex === 0 ? totalItems : activeIndex - 1,
    next: activeIndex === totalItems ? 0 : activeIndex + 1,
  };
  let activeHook = activeIndex * step;
  let targetHook = activeHook;
  let sceneRotation = 0;
  let activeProjectId = cardsArray[activeIndex]?.dataset.slug ?? "";
  const scroll = {
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
  try {
    const restored = JSON.parse(sessionStorage.getItem(stateKey) ?? "null") as
      | {
          slug?: string;
          index?: Partial<typeof indexState>;
          scroll?: Partial<typeof scroll>;
          activeHook?: number;
          targetHook?: number;
          activeProject?: string;
          sceneRotation?: number;
        }
      | null;
    const restoredIndex = cardsArray.findIndex((card) => card.dataset.slug === restored?.slug);
    if (restored && restoredIndex >= 0) {
      activeIndex = restoredIndex;
      Object.assign(indexState, restored.index);
      Object.assign(scroll, restored.scroll);
      activeHook = typeof restored.activeHook === "number" ? restored.activeHook : restoredIndex * step + scroll.remainder;
      targetHook = typeof restored.targetHook === "number" ? restored.targetHook : activeHook;
      sceneRotation = typeof restored.sceneRotation === "number" && Math.abs(restored.sceneRotation) <= 30 ? restored.sceneRotation : 0;
      activeProjectId = restored.activeProject ?? restored.slug ?? cardsArray[restoredIndex]?.dataset.slug ?? "";
      scroll.active = false;
      scroll.current = wrap(scroll.animated || scroll.target || restoredIndex * step, limit);
      scroll.progress = scroll.current / limit;
      scroll.remainder = scroll.target - (scroll.target % limit);
    }
  } catch {
    sessionStorage.removeItem(stateKey);
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

  const lerp = (current: number, target: number, factor: number, delta: number) =>
    current + (target - current) * (1 - Math.exp(-factor * delta));

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
    const payload = projectPayloadFromElement(card);
    applyActiveColor(payload.color);
    if (emitEvents) window.dispatchEvent(new CustomEvent("rd:project-active", { detail: nextProjectId }));
    if (changedProject && emitEvents) window.dispatchEvent(new CustomEvent("rd:woosh"));
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
    sessionStorage.setItem(
      stateKey,
      JSON.stringify({
        slug: card.dataset.slug,
        activeProject: card.dataset.slug,
        index: indexState,
        scroll: {
          virtual: scroll.virtual,
          target: scroll.target,
          animated: scroll.animated,
          current: scroll.current,
          progress: scroll.progress,
          remainder: scroll.remainder,
          limit: scroll.limit,
          step: scroll.step,
          offset: scroll.offset,
        },
        activeHook,
        targetHook,
        sceneRotation,
      }),
    );
  };

  const previewWork = (enabled: boolean) => {
    if (document.documentElement.classList.contains("is-work-gallery-leaving")) return;
    getWebgl()?.setPreviewMode?.(enabled);
  };

  const enterWorkGallery = () => {
    if (scroll.active) return;
    activateIndex(activeIndex, false, true, true);
    getWebgl()?.restoreGalleryState?.(scroll.progress, sceneRotation);
    getWebgl()?.setGalleryProgress?.(scroll.progress, scroll.velocity, 1 / 60);
    getWebgl()?.enterWorkGallery?.(activeProjectId || cardsArray[activeIndex]?.dataset.slug);
    scroll.active = true;
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
      if (performance.now() - lastTouchSelect < 500) return;
      setDomActiveIndex(index);
      getWebgl()?.beginProjectTransition?.(projectPayloadFromElement(card));
      navigateWithWorkSceneOut((event.currentTarget as HTMLAnchorElement).href, getWebgl(), navigate);
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
    const onProgressClick = () => {
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
    event.preventDefault();
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
    const delta = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    scroll.velocity = scroll.target - scroll.animated;
    checkSpeed();
    if (snap) scroll.diff = lerp(scroll.diff, 0, 5, delta);
    const targetPlusDiff = scroll.target + scroll.diff;
    scroll.remainder = scroll.target - (scroll.target % scroll.limit);
    scroll.animated = lerp(scroll.animated, targetPlusDiff, 5, delta);
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
    const rollTarget = Math.max(-4, Math.min(4, scroll.velocity * -0.015));
    sceneRotation = lerp(sceneRotation, rollTarget, 5, delta);
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

  activateIndex(activeIndex, false, true, false);
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
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    const projectHeader = document.querySelector<HTMLElement>(".ui-project-content-header");
    const projectHeaderMax = Math.max(1, projectHeader?.offsetHeight ?? window.innerHeight);
    const projectHeaderProgress = Math.min(1, Math.max(0, window.scrollY / projectHeaderMax));
    document.documentElement.classList.toggle("is-scrolled", window.scrollY > 24);
    document.documentElement.style.setProperty("--scroll-progress", String(progress));
    document.documentElement.style.setProperty("--project-header-progress", String(projectHeaderProgress));
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}

function initProjectMedia() {
  const videos = document.querySelectorAll<HTMLVideoElement>(".media-block video");
  if (!videos.length) return () => {};

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) {
        void video.play();
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    observer.observe(video);
  });
  return () => {
    observer.disconnect();
    videos.forEach((video) => video.pause());
  };
}

function initProjectNextState(getWebgl: () => WebGLLike | undefined) {
  const project = document.querySelector<HTMLElement>("[data-webgl-project]");
  const next = document.querySelector<HTMLElement>(".ui-project-next[data-project-slug]");
  if (!project || !next) return;

  const currentPayload = projectPayloadFromElement(project);
  const nextPayload = projectPayloadFromElement(next);
  let nextActive = false;
  let nextHeight = next.clientHeight;
  let viewportHeight = window.innerHeight;

  const apply = (payload: ReturnType<typeof projectPayloadFromElement>) => {
    applyActiveColor(payload.color);
    getWebgl()?.setProjectScrollState?.(payload);
  };

  const resize = () => {
    nextHeight = next.clientHeight;
    viewportHeight = window.innerHeight;
  };

  const update = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const endScroll = scrollHeight - viewportHeight;
    const start = endScroll - nextHeight / 2;
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, endScroll - start)));
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
    update();
  };
  const onPageHide = () => apply(currentPayload);

  resize();
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("pagehide", onPageHide, { once: true });
  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pagehide", onPageHide);
  };
}

function initProjectLeave(getWebgl: () => WebGLLike | undefined, navigate?: AppNavigate) {
  const project = document.querySelector<HTMLElement>("[data-webgl-project]");
  if (!project) return () => {};

  const cleanups: Array<() => void> = [];
  project.querySelectorAll<HTMLAnchorElement>("a[href]:not([target]):not([href^='#']):not([data-router-ignore])").forEach((link) => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.href === window.location.href) return;
      event.preventDefault();
      if (!prefersReducedMotion()) {
        gsap.to("[data-view]", { opacity: 0, duration: 0.5, ease: "linear" });
      }
      getWebgl()?.projectLeave?.();
      navigate?.(target.href, "project") ?? window.setTimeout(() => window.location.assign(target.href), 500);
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
      if (!prefersReducedMotion()) {
        gsap.to("[data-view]", { opacity: 0, duration: 0.5, ease: "linear" });
      }
      getWebgl()?.animateAboutVisualOut?.();
      navigate?.(target.href, "about") ?? window.setTimeout(() => window.location.assign(target.href), 500);
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

  if (prefersReducedMotion() || !animate) {
    view.style.opacity = "1";
    return () => {
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
  const probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return false;
  return true;
}

async function initWebGL() {
  const root = document.querySelector<HTMLElement>("[data-webgl-root]");
  if (!root || !shouldInitWebGL()) return undefined;
  try {
    const { WebGLBackdrop } = await import("./webgl");
    return new WebGLBackdrop(root);
  } catch (error) {
    console.warn("WebGL initialization failed", error);
    document.body.classList.remove("has-webgl");
    root.replaceChildren();
    return undefined;
  }
}

function boot() {
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
    window.removeEventListener("pagehide", cleanupApp);
    window.removeEventListener("beforeunload", cleanupApp);
  };
  const normalizeRouteUrl = (url: string) => new URL(url, window.location.href).href.split("#")[0];
  const transitionDelay = (mode: "home" | "project" | "about" | "default") => {
    if (prefersReducedMotion()) return 0;
    if (mode === "home" || mode === "project" || mode === "about") return 500;
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
    document.documentElement.classList.add("js", "has-session-entered");
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
    const project = document.querySelector<HTMLElement>("[data-webgl-project]");
    const payload = projectPayloadFromElement(active ?? project);
    applyActiveColor(payload.color);
    if (document.querySelector("[data-view='home']")) {
      webgl?.setProject(payload);
      webgl?.setCameraControllerSettings?.({ x: 0, y: 0, z: 0 }, { x: 1, y: 0.5 }, 20);
      webgl?.initHomeSpotlight?.();
      onPageEntered(() => {
        webgl?.showScene?.();
        homeGalleryEntered = true;
        window.dispatchEvent(new CustomEvent("rd:home-gallery-in"));
      }, callbacks);
    } else if (document.querySelector("[data-view='about']")) {
      webgl?.enterAboutVisualState?.(
        document.querySelector<HTMLElement>(".ui-about-hero-visual"),
        document.querySelector<HTMLElement>(".ui-about-hero"),
      );
      onPageEntered(() => webgl?.animateAboutVisualIn?.(), callbacks);
      callbacks.push(() => webgl?.destroyAboutVisualState?.());
    } else if (project) {
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
    cleanupPageCallbacks.push(initWorkPreview(() => webgl, navigateTo));
    cleanupPageCallbacks.push(initProjectMedia());
    cleanupPageCallbacks.push(initProjectNextState(() => webgl) ?? (() => {}));
    cleanupPageCallbacks.push(initProjectLeave(() => webgl, navigateTo));
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
    persistEnteredSession();
    const routeUrl = normalizeRouteUrl(url);
    const routePromise = loadRoute(routeUrl);
    const leavePromise = new Promise((resolve) => window.setTimeout(resolve, transitionDelay(mode)));
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

  initPreloader();
  void import("./audio").then(({ initAudio }) => {
    initAudio();
    if (homeGalleryEntered) window.dispatchEvent(new CustomEvent("rd:home-gallery-in"));
  });
  void initWebGL().then((instance) => {
    webgl = instance;
    initWebglForCurrentPage(cleanupPageCallbacks);
  });

  initSoundToggle();
  initCurrentPage();
  preloadRoutes();
  window.addEventListener("popstate", () => navigateTo(window.location.href, "default", "replace"));
  window.addEventListener("pagehide", cleanupApp, { once: true });
  window.addEventListener("beforeunload", cleanupApp, { once: true });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

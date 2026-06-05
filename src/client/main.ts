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
  setActiveSlug?(slug: string): void;
  setGalleryProgress?(progress: number, velocity?: number, delta?: number): void;
  restoreGalleryState?(progress: number, sceneRotation?: number, zoom?: number): void;
  setCameraControllerSettings?(lookAt?: { x: number; y: number; z: number }, targetXY?: { x: number; y: number }, rotateAngle?: number): void;
  setPreviewMode?(enabled: boolean): void;
  animateWorkMouseIn?(): void;
  showScene?(): void;
  hideWorkScene?(): void;
  mediaAnimateIn?(): void;
  setProjectScrollState?(payload: ReturnType<typeof projectPayloadFromElement>): void;
  projectLeave?(): void;
  refreshMedia?(): void;
};

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

function setWorkPreviewing(enabled: boolean) {
  document.documentElement.classList.toggle("is-work-previewing", enabled);
}

function clearWorkPreview(webgl?: WebGLLike) {
  setWorkPreviewing(false);
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
    gsap.to(".ui-header-description .ui-header-part-inner", { opacity: 0, duration: 0.5, ease: "none" });
    gsap.to(".ui-header-availability .ui-header-part-inner", { opacity: 0, duration: 0.5, ease: "none" });
  }
  webgl?.hideWorkScene?.();
}

function navigateWithWorkSceneOut(url: string, webgl?: WebGLLike) {
  if (document.documentElement.classList.contains("is-work-gallery-leaving")) return;
  window.dispatchEvent(new CustomEvent("rd:work-gallery-out", { detail: { url } }));
  window.setTimeout(() => {
    window.location.href = url;
  }, 500);
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
  if (!buttons.length) return;
  const formatAll = () => buttons.forEach(formatButton);
  requestAnimationFrame(formatAll);
  window.addEventListener("resize", formatAll);
}

function initPreloader() {
  const preloader = document.querySelector<HTMLElement>("[data-preloader]");
  const percent = document.querySelector<HTMLElement>("[data-preloader-percent]");
  const enterButtons = document.querySelectorAll<HTMLButtonElement>("[data-preloader-enter]");
  const soundToggle = document.querySelector<HTMLButtonElement>("[data-sound-toggle]");
  let progress = 0;
  let complete = false;

  const reveal = (soundEnabled: boolean) => {
    if (complete) return;
    complete = true;
    dispatchSoundMode(soundEnabled);
    soundToggle?.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle?.classList.toggle("is-muted", !soundEnabled);
    document.body.classList.remove("is-preloading");
    document.body.classList.add("has-entered");
    preloader?.classList.add("is-hidden");
    window.setTimeout(() => preloader?.remove(), 850);
  };

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

  if (new URLSearchParams(window.location.search).has("skip-preloader")) {
    reveal(false);
    return;
  }

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
    dispatchSoundMode(enabled);
  });
}

function initMenu() {
  const nav = document.querySelector<HTMLElement>(".ui-nav-mobile");
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const links = Array.from(nav?.querySelectorAll<HTMLAnchorElement>(".ui-nav-mobile-a") ?? []);
  const close = () => {
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

  toggle?.addEventListener("click", () => {
    const active = nav?.classList.toggle("is-active") ?? false;
    document.documentElement.classList.toggle("is-nav-mobile-open", active);
    toggle.setAttribute("aria-expanded", String(active));
  });

  links.forEach((link) =>
    link.addEventListener("click", () => {
      window.setTimeout(() => {
        setActive(link.dataset.slug);
        close();
      }, 300);
    }),
  );
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initWorkPreview(getWebgl: () => WebGLLike | undefined) {
  document.documentElement.classList.remove("is-work-gallery-leaving");
  const stateKey = "rd:work-state";
  const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
  const progressItems = document.querySelectorAll<HTMLElement>("[data-progress-slug]");
  const cardsArray = Array.from(cards);
  const progressArray = Array.from(progressItems);
  let activeIndex = Math.max(0, Array.from(cards).findIndex((card) => card.classList.contains("is-active")));
  if (!cards.length) return;

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
  let sceneZoom = 0;
  let activeProjectId = cardsArray[activeIndex]?.dataset.slug ?? "";
  const scroll = {
    virtual: cardsArray.length * 100000,
    target: cardsArray.length * 100000,
    animated: cardsArray.length * 100000,
    diff: 0,
    current: 0,
    progress: 0,
    remainder: 0,
    velocity: 0,
    active: false,
  };
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
          zoom?: number;
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
      sceneZoom = typeof restored.zoom === "number" ? Math.max(0, Math.min(1, restored.zoom)) : 0;
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

  const activateIndex = (index: number, emitScene = true) => {
    setDomActiveIndex(index);
    const card = cardsArray[activeIndex];
    if (!card) return;
    const nextProjectId = card.dataset.slug ?? "";
    const changedProject = nextProjectId !== activeProjectId;
    activeProjectId = nextProjectId;
    const payload = projectPayloadFromElement(card);
    applyActiveColor(payload.color);
    window.dispatchEvent(new CustomEvent("rd:project-active", { detail: { slug: card.dataset.slug, payload } }));
    if (changedProject) window.dispatchEvent(new CustomEvent("rd:woosh"));
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
    const hook = index * step;
    if (close) return hook + scroll.remainder;
    if (activePastHalf) return hook + scroll.remainder + limit;
    return hook + scroll.remainder - (scroll.virtual > scroll.target ? 0 : limit);
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
    if (index === activeIndex && !isTransitioning) return;
    window.clearTimeout(navClickTimeout);
    isTransitioning = true;
    targetHook = finalScrollPosition(index);
    window.dispatchEvent(new CustomEvent("rd:nav-click", { detail: { slug: cardsArray[index]?.dataset.slug } }));
    scrollTo(targetHook);
    activateIndex(index);
    targetHook = index * step + scroll.remainder;
    navClickTimeout = window.setTimeout(() => {
      isTransitioning = false;
    }, 1200);
  };

  const next = () => {
    if (nextTransitioning || prevTransitioning) return;
    window.clearTimeout(nextTimeout);
    nextTransitioning = true;
    scrollTo(scroll.virtual + step);
    nextTimeout = window.setTimeout(() => {
      nextTransitioning = false;
    }, 800);
  };

  const prev = () => {
    if (nextTransitioning || prevTransitioning) return;
    window.clearTimeout(prevTimeout);
    prevTransitioning = true;
    scrollTo(scroll.virtual - step);
    prevTimeout = window.setTimeout(() => {
      prevTransitioning = false;
    }, 800);
  };

  const setDragging = (enabled: boolean) => {
    document.querySelector<HTMLElement>("[data-view='home']")?.classList.toggle("is-dragging", enabled);
  };

  const checkSpeed = () => {
    const moving = Math.abs(pointer.lastDeltaX) + Math.abs(pointer.lastDeltaY) * 0.001 > 0.2;
    setDragging(pointer.active && moving);
  };

  const handleGalleryDelta = (delta: number) => {
    if (!scroll.active) return false;
    if (nextTransitioning || prevTransitioning) return false;
    if (Math.abs(delta) < 0.01) return false;
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
          limit,
          step,
          offset: 0,
        },
        activeHook,
        targetHook,
        sceneRotation,
        zoom: sceneZoom,
      }),
    );
  };

  const previewWork = (enabled: boolean) => {
    if (document.documentElement.classList.contains("is-work-gallery-leaving")) return;
    setWorkPreviewing(enabled);
    getWebgl()?.setPreviewMode?.(enabled);
  };

  const enterWorkGallery = () => {
    scroll.active = true;
    getWebgl()?.restoreGalleryState?.(scroll.progress, sceneRotation, sceneZoom);
    getWebgl()?.setGalleryProgress?.(scroll.progress, scroll.velocity, 1 / 60);
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
    const onCardMouseEnter = () => {
      if (window.matchMedia("(max-width: 999px)").matches) return;
      scrollToIndex(index);
    };
    const onCardFocusIn = () => scrollToIndex(index);
    const workLink = card.querySelector<HTMLElement>(".ui-work-a");
    const onWorkLinkClick = (event: MouseEvent) => {
      event.preventDefault();
      if (performance.now() - lastTouchSelect < 500) return;
      scrollToIndex(index);
    };
    const onWorkLinkTouchStart = (event: TouchEvent) => {
      if (!window.matchMedia("(max-width: 999px)").matches) return;
      event.preventDefault();
      lastTouchSelect = performance.now();
      scrollToIndex(index);
    };
    const cta = card.querySelector<HTMLElement>(".ui-work-cta");
    const onCtaClick = (event: MouseEvent) => {
      event.preventDefault();
      if (performance.now() - lastTouchSelect < 500) return;
      scrollToIndex(index);
      navigateWithWorkSceneOut((event.currentTarget as HTMLAnchorElement).href, getWebgl());
    };
    const onCtaMouseEnter = () => previewWork(true);
    const onCtaMouseLeave = () => previewWork(false);
    const onCtaFocusIn = () => {
      scrollToIndex(index);
      previewWork(true);
    };
    const onCtaFocusOut = () => previewWork(false);
    const cleanupCtaMagnet = cta ? initCtaMagnet(cta) : undefined;

    card.addEventListener("mouseenter", onCardMouseEnter);
    card.addEventListener("focusin", onCardFocusIn);
    workLink?.addEventListener("click", onWorkLinkClick);
    workLink?.addEventListener("touchstart", onWorkLinkTouchStart);
    cta?.addEventListener("click", onCtaClick);
    cta?.addEventListener("mouseenter", onCtaMouseEnter);
    cta?.addEventListener("mouseleave", onCtaMouseLeave);
    cta?.addEventListener("focusin", onCtaFocusIn);
    cta?.addEventListener("focusout", onCtaFocusOut);
    cleanupCallbacks.push(() => {
      card.removeEventListener("mouseenter", onCardMouseEnter);
      card.removeEventListener("focusin", onCardFocusIn);
      workLink?.removeEventListener("click", onWorkLinkClick);
      workLink?.removeEventListener("touchstart", onWorkLinkTouchStart);
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
      if (index >= 0) scrollToIndex(index);
    };
    const onProgressClick = () => {
      if (performance.now() - lastTouchSelect < 500) return;
      selectProgressItem();
    };
    const onProgressTouchStart = (event: TouchEvent) => {
      if (!window.matchMedia("(max-width: 999px)").matches) return;
      event.preventDefault();
      lastTouchSelect = performance.now();
      selectProgressItem();
    };
    item.addEventListener("click", onProgressClick);
    item.addEventListener("touchstart", onProgressTouchStart);
    cleanupCallbacks.push(() => {
      item.removeEventListener("click", onProgressClick);
      item.removeEventListener("touchstart", onProgressTouchStart);
    });
  });

  const onWheel = (event: WheelEvent) => {
    if (!document.body.classList.contains("is-home")) return;
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!handleGalleryDelta(delta)) return;
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!document.body.classList.contains("is-home")) return;
    if (!scroll.active) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next();
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") prev();
  };

  const onMouseDown = (event: MouseEvent) => {
    if (!document.body.classList.contains("is-home")) return;
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
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!document.body.classList.contains("is-home") || !pointer.active) return;
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
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!document.body.classList.contains("is-home")) return;
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

  const onTouchEnd = (event: TouchEvent) => {
    pointer.active = false;
    pointer.lastDeltaX = 0;
    pointer.lastDeltaY = 0;
    handleGalleryDelta(0);
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseup", onPointerEnd);
  window.addEventListener("blur", onBlur);
  window.addEventListener("touchstart", onTouchStart, { passive: false });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: false });
  cleanupCallbacks.push(() => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onPointerEnd);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  });

  const tick = (now: number) => {
    const delta = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    scroll.velocity = scroll.target - scroll.animated;
    checkSpeed();
    if (snap) scroll.diff = lerp(scroll.diff, 0, 5, delta);
    const targetPlusDiff = scroll.target + scroll.diff;
    scroll.remainder = scroll.target - (scroll.target % limit);
    scroll.animated = lerp(scroll.animated, targetPlusDiff, 5, delta);
    scroll.current = wrap(scroll.animated, limit);
    scroll.progress = scroll.current / limit;

    if (!isTransitioning && scroll.active) {
      let index = Math.round(Math.abs((scroll.current % limit) / step));
      if (scroll.current > limit - step / 2) index = 0;
      activeHook = index * step + scroll.remainder;
      if (cardsArray[index] && index !== activeIndex) {
        activateIndex(index);
        targetHook = index * step + scroll.remainder;
      }
    }
    if (scroll.active) getWebgl()?.setGalleryProgress?.(scroll.progress, scroll.velocity, delta);
    const rollTarget = Math.max(-4, Math.min(4, scroll.velocity * -0.015));
    const zoomTarget = Math.max(0, Math.min(1, Math.abs(scroll.velocity * 0.0015)));
    sceneRotation = lerp(sceneRotation, rollTarget, 5, delta);
    sceneZoom = lerp(sceneZoom, zoomTarget, 5, delta);
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
      if (cta) ctaTimelines.get(cta)?.kill();
    });
    setDragging(false);
    cleanupCallbacks.splice(0).forEach((cleanup) => cleanup());
  };

  activateIndex(activeIndex, false);
  raf = requestAnimationFrame(tick);
  const onPageHide = () => saveWorkState();
  const onBeforeUnload = () => cleanupWorkGallery();
  window.addEventListener("pagehide", onPageHide, { once: true });
  window.addEventListener("beforeunload", onBeforeUnload, { once: true });
  cleanupCallbacks.push(() => {
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("beforeunload", onBeforeUnload);
  });
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
}

function initProjectMedia() {
  const videos = document.querySelectorAll<HTMLVideoElement>(".media-block video");
  if (!videos.length) return;

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

  resize();
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", () => {
    resize();
    update();
  });
  window.addEventListener("pagehide", () => apply(currentPayload), { once: true });
}

function initProjectLeave(getWebgl: () => WebGLLike | undefined) {
  const project = document.querySelector<HTMLElement>("[data-webgl-project]");
  if (!project) return;

  project.querySelectorAll<HTMLAnchorElement>("a[href]:not([target]):not([href^='#']):not([data-router-ignore])").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.href === window.location.href) return;
      event.preventDefault();
      getWebgl()?.projectLeave?.();
      window.setTimeout(() => {
        window.location.href = target.href;
      }, 500);
    });
  });
}

function shouldInitWebGL(root: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(min-width: 760px)").matches) return false;
  const probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  return true;
}

async function initWebGL() {
  const root = document.querySelector<HTMLElement>("[data-webgl-root]");
  if (!root || !shouldInitWebGL(root)) return undefined;
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

  initPreloader();
  void import("./audio").then(({ initAudio }) => {
    initAudio();
    if (homeGalleryEntered) window.dispatchEvent(new CustomEvent("rd:home-gallery-in"));
  });
  void import("./motion").then(({ initMotion }) => initMotion());
  void initWebGL().then((instance) => {
    webgl = instance;
    const active = document.querySelector<HTMLElement>("[data-project-card].is-active");
    const project = document.querySelector<HTMLElement>("[data-webgl-project]");
    const payload = projectPayloadFromElement(active ?? project);
    applyActiveColor(payload.color);
    webgl?.setProject(payload);
    if (document.querySelector("[data-view='home']")) {
      webgl?.setCameraControllerSettings?.({ x: 0, y: 0, z: 0 }, { x: 1, y: 0.5 }, 20);
      webgl?.animateWorkMouseIn?.();
      webgl?.showScene?.();
      homeGalleryEntered = true;
      window.dispatchEvent(new CustomEvent("rd:home-gallery-in"));
    }
  });

  initMenu();
  initSoundToggle();
  initButtons();
  initWorkPreview(() => webgl);
  initProjectMedia();
  initProjectNextState(() => webgl);
  initProjectLeave(() => webgl);
  initScrollState();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

import gsap from "gsap";

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
    contrast?: string;
    mouseLightness?: string;
    spotlight?: string;
  }): void;
  setActiveSlug?(slug: string): void;
  setGalleryProgress?(progress: number, velocity?: number): void;
  setPreviewMode?(enabled: boolean): void;
  hideWorkScene?(): void;
  mediaAnimateIn?(): void;
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

function initCtaMagnet(cta: HTMLElement) {
  const button = cta.querySelector<HTMLElement>(".c-button");
  if (!button || window.matchMedia("(max-width: 999px)").matches) return;

  const state = { x: 0, y: 0, xLerp: 0, yLerp: 0 };
  const render = () => {
    state.xLerp += (state.x - state.xLerp) * 0.12;
    state.yLerp += (state.y - state.yLerp) * 0.12;
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

  cta.addEventListener("pointerenter", () => {
    gsap.ticker.remove(render);
    gsap.ticker.add(render);
  });
  cta.addEventListener("pointermove", move);
  cta.addEventListener("pointerleave", reset);
  cta.addEventListener("focusout", reset);
  window.addEventListener("beforeunload", () => gsap.ticker.remove(render), { once: true });
}

function navigateWithWorkSceneOut(url: string, webgl?: WebGLLike) {
  webgl?.hideWorkScene?.();
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
  const scroll = {
    virtual: cardsArray.length * 100000,
    target: cardsArray.length * 100000,
    animated: cardsArray.length * 100000,
    diff: 0,
    current: 0,
    progress: 0,
    remainder: 0,
    velocity: 0,
    active: true,
  };
  try {
    const restored = JSON.parse(sessionStorage.getItem(stateKey) ?? "null") as
      | {
          slug?: string;
          index?: number;
          scroll?: Partial<typeof scroll>;
        }
      | null;
    const restoredIndex = cardsArray.findIndex((card) => card.dataset.slug === restored?.slug);
    if (restored && restoredIndex >= 0) {
      activeIndex = restoredIndex;
      Object.assign(scroll, restored.scroll);
    }
  } catch {
    sessionStorage.removeItem(stateKey);
  }
  let isTransitioning = false;
  let nextTransitioning = false;
  let prevTransitioning = false;
  let draggingTimeout = 0;
  let lastFrame = performance.now();
  let raf = 0;
  let scrollToAnimation: ReturnType<typeof gsap.to> | undefined;
  const ctaTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
  const touch = {
    x: 0,
    y: 0,
    moved: false,
  };
  let lastTouchSelect = 0;

  const wrap = (value: number, max: number) => ((value % max) + max) % max;
  const lerp = (current: number, target: number, factor: number, delta: number) =>
    current + (target - current) * Math.min(1, factor * delta);

  const setIndexState = (index: number) => {
    activeIndex = index < 0 ? totalItems : index > totalItems ? 0 : index;
  };

  const activateIndex = (index: number, emitScene = true) => {
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
    const payload = projectPayloadFromElement(card);
    applyActiveColor(payload.color);
    window.dispatchEvent(new CustomEvent("rd:project-active", { detail: { slug: card.dataset.slug, payload } }));
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
    isTransitioning = true;
    const targetHook = finalScrollPosition(index);
    window.dispatchEvent(new CustomEvent("rd:nav-click", { detail: { slug: cardsArray[index]?.dataset.slug } }));
    scrollTo(targetHook);
    activateIndex(index);
    window.setTimeout(() => {
      isTransitioning = false;
    }, 1200);
  };

  const next = () => {
    if (nextTransitioning || prevTransitioning) return;
    nextTransitioning = true;
    markDragging();
    scrollTo(scroll.virtual + step);
    window.setTimeout(() => {
      nextTransitioning = false;
    }, 800);
  };

  const prev = () => {
    if (nextTransitioning || prevTransitioning) return;
    prevTransitioning = true;
    markDragging();
    scrollTo(scroll.virtual - step);
    window.setTimeout(() => {
      prevTransitioning = false;
    }, 800);
  };

  const setDragging = (enabled: boolean) => {
    document.querySelector<HTMLElement>("[data-view='home']")?.classList.toggle("is-dragging", enabled);
  };

  const markDragging = () => {
    setDragging(true);
    window.clearTimeout(draggingTimeout);
    draggingTimeout = window.setTimeout(() => setDragging(false), 800);
  };

  const handleGalleryDelta = (delta: number) => {
    if (Math.abs(delta) < 0.01) return false;
    markDragging();
    scroll.diff += delta;
    if (delta > 15) next();
    if (delta < -15) prev();
    return true;
  };

  const saveWorkState = () => {
    const card = cardsArray[activeIndex];
    if (!card) return;
    sessionStorage.setItem(
      stateKey,
      JSON.stringify({
        slug: card.dataset.slug,
        index: activeIndex,
        scroll: {
          virtual: scroll.virtual,
          target: scroll.target,
          animated: scroll.animated,
          current: scroll.current,
          progress: scroll.progress,
          remainder: scroll.remainder,
        },
      }),
    );
  };

  cardsArray.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      if (window.matchMedia("(max-width: 999px)").matches) return;
      scrollToIndex(index);
    });
    card.addEventListener("focusin", () => scrollToIndex(index));
    const workLink = card.querySelector<HTMLElement>(".ui-work-a");
    workLink?.addEventListener("click", (event) => {
      event.preventDefault();
      if (performance.now() - lastTouchSelect < 500) return;
      scrollToIndex(index);
    });
    workLink?.addEventListener("touchstart", (event) => {
      if (!window.matchMedia("(max-width: 999px)").matches) return;
      event.preventDefault();
      lastTouchSelect = performance.now();
      scrollToIndex(index);
    });
    const cta = card.querySelector<HTMLElement>(".ui-work-cta");
    if (cta) initCtaMagnet(cta);
    cta?.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToIndex(index);
      navigateWithWorkSceneOut((event.currentTarget as HTMLAnchorElement).href, getWebgl());
    });
    cta?.addEventListener("mouseenter", () => {
      setWorkPreviewing(true);
      getWebgl()?.setPreviewMode?.(true);
    });
    cta?.addEventListener("mouseleave", () => {
      setWorkPreviewing(false);
      getWebgl()?.setPreviewMode?.(false);
    });
    cta?.addEventListener("focusin", () => {
      scrollToIndex(index);
      setWorkPreviewing(true);
      getWebgl()?.setPreviewMode?.(true);
    });
    cta?.addEventListener("focusout", () => {
      setWorkPreviewing(false);
      getWebgl()?.setPreviewMode?.(false);
    });
  });

  progressArray.forEach((item) => {
    const selectProgressItem = () => {
      const slug = item.dataset.slug ?? item.dataset.progressSlug;
      const index = cardsArray.findIndex((candidate) => candidate.dataset.slug === slug);
      if (index >= 0) scrollToIndex(index);
    };
    item.addEventListener("click", () => {
      if (performance.now() - lastTouchSelect < 500) return;
      selectProgressItem();
    });
    item.addEventListener("touchstart", (event) => {
      if (!window.matchMedia("(max-width: 999px)").matches) return;
      event.preventDefault();
      lastTouchSelect = performance.now();
      selectProgressItem();
    });
  });

  window.addEventListener("wheel", (event) => {
    if (!document.body.classList.contains("is-home")) return;
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!handleGalleryDelta(delta)) return;
    event.preventDefault();
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("is-home")) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next();
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") prev();
  });

  window.addEventListener("touchstart", (event) => {
    const point = event.touches[0];
    touch.x = point?.clientX ?? 0;
    touch.y = point?.clientY ?? 0;
    touch.moved = false;
  }, { passive: true });
  window.addEventListener("touchmove", (event) => {
    if (!document.body.classList.contains("is-home")) return;
    const point = event.touches[0];
    if (!point) return;
    const deltaX = -(point.clientX - touch.x);
    const deltaY = -(point.clientY - touch.y);
    touch.x = point.clientX;
    touch.y = point.clientY;
    const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    touch.moved = handleGalleryDelta(delta) || touch.moved;
  }, { passive: true });
  window.addEventListener("touchend", (event) => {
    if (!window.matchMedia("(max-width: 999px)").matches) return;
    if (touch.moved) return;
    const end = event.changedTouches[0]?.clientX ?? touch.x;
    const delta = end - touch.x;
    if (Math.abs(delta) < 42) return;
    handleGalleryDelta(-delta);
  }, { passive: true });

  const tick = (now: number) => {
    const delta = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    scroll.velocity = scroll.target - scroll.animated;
    scroll.diff = lerp(scroll.diff, 0, 5, delta);
    const targetPlusDiff = scroll.target + scroll.diff;
    scroll.remainder = scroll.target - (scroll.target % limit);
    scroll.animated = lerp(scroll.animated, targetPlusDiff, 5, delta);
    scroll.current = wrap(scroll.animated, limit);
    scroll.progress = scroll.current / limit;

    if (!isTransitioning && scroll.active) {
      let index = Math.round(Math.abs((scroll.current % limit) / step));
      if (scroll.current > limit - step / 2) index = 0;
      if (cardsArray[index] && index !== activeIndex) {
        activateIndex(index);
      }
    }
    getWebgl()?.setGalleryProgress?.(scroll.progress, scroll.velocity);
    raf = requestAnimationFrame(tick);
  };

  activateIndex(activeIndex);
  raf = requestAnimationFrame(tick);
  window.addEventListener("pagehide", saveWorkState);
  window.addEventListener("beforeunload", () => {
    saveWorkState();
    window.clearTimeout(draggingTimeout);
    cancelAnimationFrame(raf);
  }, { once: true });
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

  initPreloader();
  void import("./audio").then(({ initAudio }) => initAudio());
  void import("./motion").then(({ initMotion }) => initMotion());
  void initWebGL().then((instance) => {
    webgl = instance;
    const active = document.querySelector<HTMLElement>("[data-project-card].is-active");
    const project = document.querySelector<HTMLElement>("[data-webgl-project]");
    const payload = projectPayloadFromElement(active ?? project);
    applyActiveColor(payload.color);
    webgl?.setProject(payload);
  });

  initMenu();
  initSoundToggle();
  initButtons();
  initWorkPreview(() => webgl);
  initProjectMedia();
  initScrollState();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

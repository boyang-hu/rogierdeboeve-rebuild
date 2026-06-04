type WebGLLike = {
  setProject(payload: { color?: string }): void;
};

function dispatchSoundMode(enabled: boolean) {
  window.dispatchEvent(new CustomEvent("rd:sound-mode", { detail: { enabled } }));
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
    window.setTimeout(() => reveal(false), 150);
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
  const nav = document.querySelector(".ui-nav-mobile");
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const close = () => {
    nav?.classList.remove("is-active");
    document.body.classList.remove("is-menu-open");
    toggle?.setAttribute("aria-expanded", "false");
  };

  toggle?.addEventListener("click", () => {
    const active = nav?.classList.toggle("is-active") ?? false;
    document.body.classList.toggle("is-menu-open", active);
    toggle.setAttribute("aria-expanded", String(active));
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initWorkPreview(getWebgl: () => WebGLLike | undefined) {
  const preview = document.querySelector<HTMLImageElement>("[data-work-preview]");
  const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
  const progressItems = document.querySelectorAll<HTMLElement>("[data-progress-slug]");
  let activeIndex = Math.max(0, Array.from(cards).findIndex((card) => card.classList.contains("is-active")));
  if (!cards.length) return;

  const activate = (card: HTMLElement) => {
    activeIndex = Array.from(cards).indexOf(card);
    cards.forEach((item) => item.classList.remove("is-active"));
    progressItems.forEach((item) => item.classList.toggle("is-active", item.dataset.progressSlug === card.dataset.slug));
    card.classList.add("is-active");
    const thumb = card.dataset.thumb;
    if (preview && thumb && preview.src !== new URL(thumb, location.href).href) {
      preview.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.03)" },
        ],
        { duration: 220, easing: "ease" },
      ).onfinish = () => {
        preview.src = thumb;
        preview.animate(
          [
            { opacity: 0, transform: "scale(1.02)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      };
    }
    getWebgl()?.setProject({ color: card.dataset.color });
  };

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => activate(card));
    card.addEventListener("focusin", () => activate(card));
  });

  progressItems.forEach((item) => {
    item.addEventListener("click", () => {
      const card = Array.from(cards).find((candidate) => candidate.dataset.slug === item.dataset.progressSlug);
      if (card) activate(card);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!window.matchMedia("(max-width: 999px)").matches) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + direction + cards.length) % cards.length;
    activate(cards[next]);
  });

  let touchStart = 0;
  window.addEventListener("touchstart", (event) => {
    touchStart = event.touches[0]?.clientX ?? 0;
  }, { passive: true });
  window.addEventListener("touchend", (event) => {
    if (!window.matchMedia("(max-width: 999px)").matches) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart;
    const delta = end - touchStart;
    if (Math.abs(delta) < 42) return;
    const next = (activeIndex + (delta < 0 ? 1 : -1) + cards.length) % cards.length;
    activate(cards[next]);
  }, { passive: true });
}

function initScrollState() {
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    document.documentElement.classList.toggle("is-scrolled", window.scrollY > 24);
    document.documentElement.style.setProperty("--scroll-progress", String(progress));
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
  const { WebGLBackdrop } = await import("./webgl");
  return new WebGLBackdrop(root);
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
    webgl?.setProject({ color: active?.dataset.color });
  });

  initMenu();
  initSoundToggle();
  initWorkPreview(() => webgl);
  initProjectMedia();
  initScrollState();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

type WebGLLike = {
  setProject(payload: { color?: string }): void;
};

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
  if (!preview || !cards.length) return;

  const activate = (card: HTMLElement) => {
    cards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    const thumb = card.dataset.thumb;
    if (thumb && preview.src !== new URL(thumb, location.href).href) {
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

  void import("./audio").then(({ initAudio }) => initAudio());
  void import("./motion").then(({ initMotion }) => initMotion());
  void initWebGL().then((instance) => {
    webgl = instance;
    const active = document.querySelector<HTMLElement>("[data-project-card].is-active");
    webgl?.setProject({ color: active?.dataset.color });
  });

  initMenu();
  initWorkPreview(() => webgl);
  initProjectMedia();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

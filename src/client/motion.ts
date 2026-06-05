import gsap from "gsap";
import Lenis from "lenis";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initLenis() {
  if (prefersReducedMotion()) return;

  const lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function initIntroAnimations() {
  if (prefersReducedMotion()) return;

  const chromeTargets = gsap.utils.toArray<HTMLElement>(".ui-header-primary, .ui-header-secondary, .ui-nav, .ui-title, .ui-footer");
  const contentTargets = gsap.utils.toArray<HTMLElement>(".ui-about-intro > *, .c-list-section, .ui-project-content-header > *");

  if (chromeTargets.length) {
    gsap.fromTo(
      chromeTargets,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "expo.out" },
    );
  }

  if (contentTargets.length) {
    gsap.fromTo(
      contentTargets,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.15, stagger: 0.045, ease: "expo.out", delay: 0.2 },
    );
  }

  const workLinks = gsap.utils.toArray<HTMLElement>(".ui-work-a");
  if (workLinks.length && window.matchMedia("(min-width: 1000px)").matches) {
    gsap.fromTo(
      workLinks,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.15,
        stagger: 0.045,
        ease: "expo.out",
        delay: 0.2,
        clearProps: "transform,opacity",
      },
    );
  }
}

function initMediaReveals() {
  const blocks = document.querySelectorAll<HTMLElement>("[data-mobile-media]");
  if (!blocks.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    blocks.forEach((block) => block.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const block = entry.target as HTMLElement;
      block.classList.add("is-revealed");
      gsap.fromTo(
        block,
        { autoAlpha: 0, y: 44 },
        { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" },
      );
      observer.unobserve(block);
    });
  }, { rootMargin: "0px 0px -14% 0px", threshold: 0.12 });

  blocks.forEach((block) => observer.observe(block));
}

export function initMotion() {
  initLenis();
  initIntroAnimations();
  initMediaReveals();
}

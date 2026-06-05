import gsap from "gsap";
import Lenis from "lenis";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initLenis() {
  if (prefersReducedMotion()) return () => {};

  const lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
  };
}

function initIntroAnimations() {
  if (prefersReducedMotion()) return;

  const chromeTargets = gsap.utils.toArray<HTMLElement>(".ui-header-primary, .ui-header-secondary");
  const contentTargets = gsap.utils.toArray<HTMLElement>(".ui-about-intro > *, .c-list-section");
  const navInnerTargets = gsap.utils.toArray<HTMLElement>(".ui-nav-a-inner");
  const headerDescriptionTargets = gsap.utils.toArray<HTMLElement>(".ui-header-description .ui-header-part-inner");
  const headerAvailabilityTargets = gsap.utils.toArray<HTMLElement>(".ui-header-availability .ui-header-part-inner");
  const titleTargets = gsap.utils.toArray<HTMLElement>(".ui-title-inner");
  const footerSocialTargets = gsap.utils.toArray<HTMLElement>(".social-a > span");
  const footerContactTargets = gsap.utils.toArray<HTMLElement>(".ui-footer-contact a > span");

  if (chromeTargets.length) {
    gsap.fromTo(
      chromeTargets,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "expo.out" },
    );
  }

  if (navInnerTargets.length) {
    gsap.fromTo(
      navInnerTargets,
      { y: "102%", opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, stagger: 0.01, ease: "expo.out", clearProps: "transform,opacity" },
    );
  }

  if (contentTargets.length) {
    gsap.fromTo(
      contentTargets,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.15, stagger: 0.045, ease: "expo.out", delay: 0.2 },
    );
  }

  if (headerDescriptionTargets.length) {
    gsap.fromTo(
      headerDescriptionTargets,
      { y: "130%", opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: "expo.out", clearProps: "transform,opacity" },
    );
  }

  if (headerAvailabilityTargets.length) {
    gsap.fromTo(
      headerAvailabilityTargets,
      { y: "130%", opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: "expo.out", clearProps: "transform,opacity" },
    );
  }

  if (titleTargets.length) {
    gsap.fromTo(
      titleTargets,
      { y: "102%" },
      { y: 0, duration: 1.8, stagger: 0.01, ease: "expo.out", clearProps: "transform" },
    );
  }

  if (footerSocialTargets.length) {
    gsap.fromTo(
      footerSocialTargets,
      { y: "102%" },
      { y: 0, duration: 1.8, stagger: 0.06, ease: "expo.out", delay: 0.4, clearProps: "transform" },
    );
  }

  if (footerContactTargets.length) {
    gsap.fromTo(
      footerContactTargets,
      { y: "102%" },
      { y: 0, duration: 1.8, stagger: 0.06, ease: "expo.out", delay: 0.5, clearProps: "transform" },
    );
  }

  const workLinks = gsap.utils.toArray<HTMLElement>(".ui-work-a > span");
  if (workLinks.length && window.matchMedia("(min-width: 1000px)").matches) {
    gsap.fromTo(
      workLinks,
      { y: "102%", opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.8,
        stagger: 0.03,
        ease: "expo.out",
        delay: 0,
        clearProps: "transform,opacity",
      },
    );
  }
}

function initProjectHeaderAnimation() {
  const header = document.querySelector<HTMLElement>(".ui-project-content-header");
  if (!header || prefersReducedMotion() || !window.matchMedia("(min-width: 1000px)").matches) return;

  const textLines = gsap.utils.toArray<HTMLElement>(".ui-project-text .line-inner", header);
  const titleSpans = gsap.utils.toArray<HTMLElement>(".ts-2 > span", header);
  const infoItems = gsap.utils.toArray<HTMLElement>(".ui-project-info-items", header);
  const links = gsap.utils.toArray<HTMLElement>(".ui-project-links", header);
  const infoItemSpans = gsap.utils.toArray<HTMLElement>(".ui-project-info-item span", header);

  if (textLines.length) {
    gsap.fromTo(textLines, { y: "70%", opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, stagger: 0.03, ease: "expo.out" });
  }

  if (titleSpans.length) {
    gsap.fromTo(titleSpans, { y: "70%", opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, stagger: 0.03, ease: "expo.out" });
  }

  if (infoItems.length) {
    gsap.fromTo(infoItems, { y: "70%", opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, ease: "expo.out" });
  }

  if (links.length) {
    gsap.fromTo(links, { y: "70%", opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, ease: "expo.out" });
  }

  infoItemSpans.forEach((span, index) => {
    gsap.fromTo(span, { y: "102%", opacity: 0 }, { y: 0, opacity: 1, delay: 0.1 * index, duration: 1.8, ease: "expo.out" });
  });
}

function initFooterContactLabel() {
  const contact = document.querySelector<HTMLElement>(".ui-footer-contact a > span");
  if (!contact) return () => {};

  const update = () => {
    contact.textContent = window.matchMedia("(min-width: 1000px)").matches ? "hello@rogierdeboeve.com" : "E-mail";
  };

  const timer = window.setTimeout(update, 200);
  window.addEventListener("resize", update, { passive: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("resize", update);
  };
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
        { autoAlpha: 1, y: 0, duration: 1.6, ease: "expo.out" },
      );
      observer.unobserve(block);
    });
  }, { rootMargin: "0px 0px -14% 0px", threshold: 0.12 });

  blocks.forEach((block) => observer.observe(block));
}

export function initMotion() {
  const cleanupLenis = initLenis();
  const cleanupFooter = initFooterContactLabel();
  initIntroAnimations();
  initProjectHeaderAnimation();
  initMediaReveals();
  return () => {
    cleanupLenis();
    cleanupFooter();
  };
}

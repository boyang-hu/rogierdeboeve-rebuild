import gsap from "gsap";
import Lenis from "lenis";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function dispatchPageScroll(scroll: number, velocity: number) {
  window.dispatchEvent(new CustomEvent("rd:page-scroll", {
    detail: { scroll, velocity },
  }));
}

function initLenis() {
  if (prefersReducedMotion()) {
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const scroll = window.scrollY;
      dispatchPageScroll(scroll, scroll - lastScroll);
      lastScroll = scroll;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    dispatchPageScroll(lastScroll, 0);
    return () => window.removeEventListener("scroll", onScroll);
  }

  const lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    dispatchPageScroll(lenis.scroll, lenis.velocity);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
  };
}

function initIntroAnimations() {
  const chromeTargets = gsap.utils.toArray<HTMLElement>(".ui-header-primary, .ui-header-secondary");
  const contentTargets = gsap.utils.toArray<HTMLElement>(".ui-about-intro > *, .c-list-section");
  const navInnerTargets = gsap.utils.toArray<HTMLElement>(".ui-nav-a-inner");
  const navLinkTargets = gsap.utils.toArray<HTMLElement>(".ui-nav-a");
  const headerDescriptionTargets = gsap.utils.toArray<HTMLElement>(".ui-header-description .ui-header-part-inner");
  const headerAvailabilityTargets = gsap.utils.toArray<HTMLElement>(".ui-header-availability .ui-header-part-inner");
  const titleTargets = gsap.utils.toArray<HTMLElement>(".ui-title-inner");
  const footerSocialTargets = gsap.utils.toArray<HTMLElement>(".social-a > span");
  const footerContactTargets = gsap.utils.toArray<HTMLElement>(".ui-footer-contact a > span");
  const tweens: gsap.core.Tween[] = [];

  if (prefersReducedMotion()) {
    navLinkTargets.forEach((link) => {
      link.style.pointerEvents = "auto";
    });
    navInnerTargets.forEach((target) => {
      target.style.opacity = "1";
      target.style.transform = "translate3d(0, 0, 0)";
    });
    return () => {
      navLinkTargets.forEach((link) => {
        link.style.pointerEvents = "";
      });
      navInnerTargets.forEach((target) => {
        target.style.opacity = "";
        target.style.transform = "";
      });
    };
  }

  if (chromeTargets.length) {
    tweens.push(gsap.fromTo(
      chromeTargets,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "expo.out" },
    ));
  }

  if (navInnerTargets.length) {
    navLinkTargets.forEach((link) => {
      link.style.pointerEvents = "none";
    });
    tweens.push(gsap.to(
      navInnerTargets,
      {
        y: 0,
        opacity: 1,
        duration: 1.8,
        stagger: 0.01,
        ease: "expo.out",
        onStart: () => {
          navLinkTargets.forEach((link) => {
            link.style.pointerEvents = "all";
          });
        },
      },
    ));
  }

  if (contentTargets.length) {
    tweens.push(gsap.fromTo(
      contentTargets,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.15, stagger: 0.045, ease: "expo.out", delay: 0.2 },
    ));
  }

  if (headerDescriptionTargets.length) {
    tweens.push(gsap.fromTo(
      headerDescriptionTargets,
      { y: "130%", opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: "expo.out" },
    ));
  }

  if (headerAvailabilityTargets.length) {
    tweens.push(gsap.fromTo(
      headerAvailabilityTargets,
      { y: "130%", opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: "expo.out" },
    ));
  }

  if (titleTargets.length) {
    tweens.push(gsap.fromTo(
      titleTargets,
      { y: "102%" },
      { y: 0, duration: 1.8, stagger: 0.01, ease: "expo.out" },
    ));
  }

  if (footerSocialTargets.length) {
    tweens.push(gsap.fromTo(
      footerSocialTargets,
      { y: "102%" },
      { y: 0, duration: 1.8, stagger: 0.06, ease: "expo.out", delay: 0.4 },
    ));
  }

  if (footerContactTargets.length) {
    tweens.push(gsap.fromTo(
      footerContactTargets,
      { y: "102%" },
      { y: 0, duration: 1.8, stagger: 0.06, ease: "expo.out", delay: 0.5 },
    ));
  }

  const workLinks = gsap.utils.toArray<HTMLElement>(".ui-work-a > span");
  if (workLinks.length && window.matchMedia("(min-width: 1000px)").matches) {
    tweens.push(gsap.fromTo(
      workLinks,
      { y: "102%", opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.8,
        stagger: 0.03,
        ease: "expo.out",
        delay: 0,
        clearProps: "opacity",
      },
    ));
  }

  return () => {
    tweens.forEach((tween) => tween.kill());
    navLinkTargets.forEach((link) => {
      link.style.pointerEvents = "";
    });
  };
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

export function initMotion() {
  const cleanupLenis = initLenis();
  const cleanupFooter = initFooterContactLabel();
  const cleanupIntro = initIntroAnimations();
  initProjectHeaderAnimation();
  return () => {
    cleanupIntro();
    cleanupLenis();
    cleanupFooter();
  };
}

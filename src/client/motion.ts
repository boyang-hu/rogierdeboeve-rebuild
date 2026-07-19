import gsap from "gsap";
import Lenis from "lenis";

type PageScrollDetail = {
  scroll: number;
  animatedScroll: number;
  velocity: number;
  limit: number;
  dimensions: {
    scrollHeight: number;
  };
};

type PageScrollController = {
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
  getState: () => PageScrollDetail;
  start?: () => void;
  stop?: () => void;
};

declare global {
  interface Window {
    __rogierPageScroll?: PageScrollController;
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nativePageScrollState(velocity = 0): PageScrollDetail {
  const scroll = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const limit = Math.max(0, scrollHeight - window.innerHeight);
  return {
    scroll,
    animatedScroll: scroll,
    velocity,
    limit,
    dimensions: {
      scrollHeight,
    },
  };
}

function dispatchPageScroll(detail: PageScrollDetail) {
  window.dispatchEvent(new CustomEvent("rd:page-scroll", {
    detail,
  }));
}

function sourceOwnsPageScroll() {
  const view = document.querySelector<HTMLElement>("[data-view]");
  return view?.dataset.view === "about" || view?.dataset.view === "project";
}

function resetPageScroll() {
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
}

function initLenis() {
  if (!sourceOwnsPageScroll()) return () => {};

  resetPageScroll();

  if (prefersReducedMotion()) {
    let lastScroll = window.scrollY;
    const controller: PageScrollController = {
      scrollTo: (target, options) => {
        if (options?.immediate) window.scrollTo(0, target);
        else window.scrollTo({ top: target, behavior: "smooth" });
      },
      getState: () => nativePageScrollState(),
      start: () => {
        document.documentElement.style.overflow = "";
      },
      stop: () => {
        document.documentElement.style.overflow = "hidden";
      },
    };
    window.__rogierPageScroll = controller;
    const onScroll = () => {
      const scroll = window.scrollY;
      dispatchPageScroll(nativePageScrollState(scroll - lastScroll));
      lastScroll = scroll;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    dispatchPageScroll(nativePageScrollState(0));
    return () => {
      if (window.__rogierPageScroll === controller) delete window.__rogierPageScroll;
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("is-scrolled");
    };
  }

  const lenis = new Lenis();

  const lenisState = (): PageScrollDetail => ({
    scroll: lenis.scroll,
    animatedScroll: lenis.animatedScroll,
    velocity: lenis.velocity,
    limit: lenis.limit,
    dimensions: {
      scrollHeight: lenis.dimensions.scrollHeight,
    },
  });
  const controller: PageScrollController = {
    scrollTo: (target, options) => lenis.scrollTo(target, options),
    getState: lenisState,
    start: () => lenis.start(),
    stop: () => lenis.stop(),
  };
  window.__rogierPageScroll = controller;

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    dispatchPageScroll(lenisState());
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
  return () => {
    if (window.__rogierPageScroll === controller) delete window.__rogierPageScroll;
    cancelAnimationFrame(rafId);
    lenis.destroy();
    document.documentElement.classList.remove("is-scrolled");
  };
}

function splitParagraphIntoSourceLines(paragraph: HTMLElement) {
  const text = paragraph.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return;

  const words = text.split(" ");
  paragraph.textContent = "";

  const measureSpans = words.map((word, index) => {
    const span = document.createElement("span");
    span.textContent = index === words.length - 1 ? word : `${word} `;
    paragraph.append(span);
    return span;
  });

  const lines: string[][] = [];
  let previousTop: number | null = null;
  measureSpans.forEach((span, index) => {
    const top = Math.round(span.offsetTop);
    if (previousTop === null || Math.abs(top - previousTop) > 1) {
      lines.push([]);
      previousTop = top;
    }
    lines[lines.length - 1].push(words[index]);
  });

  paragraph.replaceChildren();
  lines.forEach((lineWords) => {
    const line = document.createElement("div");
    line.className = "line";
    const inner = document.createElement("div");
    inner.className = "line-inner";
    inner.textContent = lineWords.join(" ");
    line.append(inner);
    paragraph.append(line);
  });
}

function initAboutSplitArticles() {
  const articles = gsap.utils.toArray<HTMLElement>(".ui-about [data-split-articles]");
  const paragraphs = articles.flatMap((article) => gsap.utils.toArray<HTMLElement>("p", article));
  if (!paragraphs.length) return () => {};

  const cache = paragraphs.map((paragraph) => ({
    paragraph,
    html: paragraph.innerHTML,
  }));
  let resizeTimer = 0;

  const split = () => {
    cache.forEach(({ paragraph, html }) => {
      paragraph.innerHTML = html;
      splitParagraphIntoSourceLines(paragraph);
    });
  };
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(split, 100);
  };

  split();
  window.addEventListener("resize", onResize, { passive: true });
  return () => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    cache.forEach(({ paragraph, html }) => {
      paragraph.innerHTML = html;
    });
  };
}

function initIntroAnimations(restoreHeaderChrome: boolean) {
  const headerVersionTarget = document.querySelector<HTMLElement>(".ui-header-version > a");
  const headerNameTargets = gsap.utils.toArray<HTMLElement>(".ui-header-name .ui-header-part-inner");
  const navInnerTargets = gsap.utils.toArray<HTMLElement>(".ui-nav-a-inner");
  const navLinkTargets = gsap.utils.toArray<HTMLElement>(".ui-nav-a");
  const headerDescriptionTargets = gsap.utils.toArray<HTMLElement>(".ui-header-description .ui-header-part-inner");
  const headerAvailabilityTargets = gsap.utils.toArray<HTMLElement>(".ui-header-availability .ui-header-part-inner");
  const titleTargets = gsap.utils.toArray<HTMLElement>(".ui-title-inner");
  const footerSocialTargets = gsap.utils.toArray<HTMLElement>(".social-a > span");
  const footerContactTargets = gsap.utils.toArray<HTMLElement>(".ui-footer-contact a > span");
  const aboutIntroTitleTargets = gsap.utils.toArray<HTMLElement>(".ui-about-intro .ts-1 .line-inner");
  const aboutIntroTextTargets = gsap.utils.toArray<HTMLElement>(".ui-about-intro .ts-p");
  const tweens: gsap.core.Tween[] = [];

  if (prefersReducedMotion()) {
    navLinkTargets.forEach((link) => {
      link.style.pointerEvents = "auto";
    });
    navInnerTargets.forEach((target) => {
      target.style.opacity = "1";
      target.style.transform = "translate3d(0, 0, 0)";
    });
    [...(headerVersionTarget ? [headerVersionTarget] : []), ...headerNameTargets, ...titleTargets, ...footerSocialTargets, ...footerContactTargets, ...aboutIntroTitleTargets].forEach((target) => {
      target.style.opacity = "1";
      target.style.transform = "translate3d(0, 0, 0)";
    });
    aboutIntroTextTargets.forEach((paragraph) => {
      paragraph.querySelectorAll<HTMLElement>(".line-inner").forEach((target) => {
        target.style.opacity = "1";
        target.style.transform = "translate3d(0, 0, 0)";
      });
    });
    return () => {
      navLinkTargets.forEach((link) => {
        link.style.pointerEvents = "";
      });
      navInnerTargets.forEach((target) => {
        target.style.opacity = "";
        target.style.transform = "";
      });
      [...(headerVersionTarget ? [headerVersionTarget] : []), ...headerNameTargets, ...titleTargets, ...footerSocialTargets, ...footerContactTargets, ...aboutIntroTitleTargets].forEach((target) => {
        target.style.opacity = "";
        target.style.transform = "";
      });
    };
  }

  if (restoreHeaderChrome) {
    if (headerVersionTarget) gsap.set(headerVersionTarget, { y: 0 });
    if (headerNameTargets.length) gsap.set(headerNameTargets, { y: 0, opacity: 1 });
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

  if (aboutIntroTitleTargets.length) {
    tweens.push(gsap.fromTo(
      aboutIntroTitleTargets,
      { opacity: 0, y: "80%" },
      { opacity: 1, y: 0, duration: 1.8, stagger: 0.05, ease: "expo.out" },
    ));
  }

  aboutIntroTextTargets.forEach((paragraph, index) => {
    const lines = gsap.utils.toArray<HTMLElement>(".line-inner", paragraph);
    if (!lines.length) return;
    tweens.push(gsap.fromTo(
      lines,
      { y: "80%", opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, delay: 0.3 + index * 0.1, stagger: 0.05, ease: "expo.out" },
    ));
  });

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
  const cleanupSplitArticles = initAboutSplitArticles();
  const pendingPreloaderEnter = Boolean(document.querySelector(".preloader"))
    && !document.body.classList.contains("has-entered");
  let cleanupIntro: (() => void) | undefined;
  const startIntro = () => {
    cleanupIntro = initIntroAnimations(!pendingPreloaderEnter);
    initProjectHeaderAnimation();
  };
  if (pendingPreloaderEnter) window.addEventListener("rd:animate-in", startIntro, { once: true });
  else startIntro();
  return () => {
    window.removeEventListener("rd:animate-in", startIntro);
    cleanupIntro?.();
    cleanupSplitArticles();
    cleanupLenis();
    cleanupFooter();
  };
}

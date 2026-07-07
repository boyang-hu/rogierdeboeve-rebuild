import gsap from "gsap";
import { Howl } from "howler";

let ambient: Howl | null = null;
let click: Howl | null = null;
let drones: Howl | null = null;
let hover: Howl | null = null;
let plucks: Howl | null = null;
let softWoosh: Howl | null = null;
let woosh: Howl | null = null;
let enabled = false;
let intensity = 0;
let initialized = false;
let soundsInitialized = false;
let soundToggle: HTMLElement | null = null;
let soundToggleRects: NodeListOf<SVGRectElement> | [] = [];
let homeGalleryPlucksPlayed = false;
const boundSoundItems = new WeakSet<HTMLElement>();

function initSounds() {
  if (soundsInitialized) return;
  soundsInitialized = true;
  drones = new Howl({
    src: ["/audio/drones.webm", "/audio/drones.ogg", "/audio/drones.mp3"],
    volume: 0,
    loop: true,
  });
  ambient = new Howl({
    src: ["/audio/ambient.webm", "/audio/ambient.ogg", "/audio/ambient-2.mp3"],
    volume: 0,
    loop: true,
  });
  hover = new Howl({
    src: ["/audio/eerie.webm", "/audio/eerie.ogg", "/audio/eerie.mp3"],
    volume: 0.65,
    rate: 0.25,
  });
  click = new Howl({
    src: ["/audio/eerie.webm", "/audio/eerie.ogg", "/audio/eerie.mp3"],
    volume: 0.15,
    rate: 0.75,
  });
  woosh = new Howl({
    src: ["/audio/woosh.webm", "/audio/woosh.ogg", "/audio/woosh.mp3"],
    volume: 0.25,
    rate: 1.8,
  });
  plucks = new Howl({
    src: ["/audio/plucks.webm", "/audio/plucks.ogg", "/audio/plucks.mp3"],
    volume: 0.25,
  });
  softWoosh = new Howl({
    src: ["/audio/soft-woosh.webm", "/audio/soft-woosh.ogg", "/audio/soft-woosh.mp3"],
    volume: 0.25,
    rate: 1.5,
  });
}

function playAmbient() {
  ambient?.play();
  drones?.play();
  ambient?.fade(0, 0.2, 5000);
  drones?.fade(0, 0.1, 5000);
}

function stopAmbient() {
  ambient?.fade(ambient.volume(), 0, 500);
  drones?.fade(drones.volume(), 0, 500);
}

function startAnimateSoundButton() {
  gsap.to({ value: intensity }, {
    value: 1,
    duration: 1,
    onUpdate() {
      intensity = this.targets()[0].value;
    },
  });
  soundToggle?.classList.add("is-active");
}

function stopAnimateSoundButton() {
  gsap.to({ value: intensity }, {
    value: 0,
    duration: 1,
    onUpdate() {
      intensity = this.targets()[0].value;
    },
  });
  soundToggle?.classList.remove("is-active");
}

function setSoundMode(nextEnabled: boolean) {
  if (!soundsInitialized) initSounds();
  enabled = nextEnabled;
  if (enabled) {
    playAmbient();
    startAnimateSoundButton();
    return;
  }
  stopAmbient();
  stopAnimateSoundButton();
}

function toggleSoundMode() {
  setSoundMode(!enabled);
}

function showSoundButton() {
  if (!soundToggle) return;
  soundToggle.style.pointerEvents = "auto";
  gsap.to(soundToggle, { opacity: 1, duration: 0.5, ease: "none" });
}

function playHover() {
  if (!enabled) return;
  hover?.play();
  hover?.fade(0.6, 0, 1000);
}

function playClick() {
  if (!enabled) return;
  click?.play();
}

function bindSoundItems(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-sound-click]").forEach((element) => {
    if (boundSoundItems.has(element)) return;
    boundSoundItems.add(element);
    element.addEventListener("click", playClick);
    element.addEventListener("mouseenter", playHover);
  });
}

function animateSoundRects(time: number) {
  if (intensity === 0) return;
  soundToggleRects.forEach((rect, index) => {
    const offset = Math.cos(time * 3 + index * 0.5) * 2.5 * intensity;
    rect.style.transform = `translateY(${offset}px)`;
  });
}

export function initAudio() {
  if (initialized) {
    bindSoundItems();
    return;
  }
  initialized = true;
  soundToggle = document.querySelector(".ui-sound-toggle");
  soundToggleRects = soundToggle?.querySelectorAll<SVGRectElement>(".ui-sound-toggle-rects > rect") ?? [];
  bindSoundItems();
  gsap.ticker.add(animateSoundRects);
  document.addEventListener("visibilitychange", () => {
    if (!enabled) return;
    if (document.hidden) stopAmbient();
    else playAmbient();
  });
  soundToggle?.addEventListener("click", toggleSoundMode);
  window.addEventListener("rd:sound-init", initSounds);
  window.addEventListener("rd:sound-show-button", showSoundButton);
  window.addEventListener("rd:sound-mode", (event) => {
    const mode = (event as CustomEvent<{ enabled: boolean }>).detail.enabled;
    setSoundMode(mode);
  });
  window.addEventListener("rd:sound-click", playClick);
  window.addEventListener("rd:sound-hover", playHover);
  window.addEventListener("rd:bind-sound-items", (event) => {
    homeGalleryPlucksPlayed = false;
    bindSoundItems((event as CustomEvent<{ root?: ParentNode }>).detail?.root ?? document);
  });
  window.addEventListener("rd:soft-woosh", () => {
    if (enabled) softWoosh?.play();
  });
  window.addEventListener("rd:woosh", () => {
    if (enabled) woosh?.play();
  });
  window.addEventListener("rd:plucks", () => {
    if (enabled) plucks?.play();
  });
  window.addEventListener("rd:home-gallery-in", () => {
    if (homeGalleryPlucksPlayed) return;
    homeGalleryPlucksPlayed = true;
    window.dispatchEvent(new CustomEvent("rd:plucks"));
  });
}

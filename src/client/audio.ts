import { Howl, Howler } from "howler";

let unlocked = false;
let ambient: Howl | null = null;
let click: Howl | null = null;
let hover: Howl | null = null;
let plucks: Howl | null = null;
let softWoosh: Howl | null = null;
let enabled = true;

export function initAudio() {
  click = new Howl({
    src: ["/audio/eerie.webm", "/audio/eerie.ogg", "/audio/eerie.mp3"],
    volume: 0.15,
    rate: 0.75,
  });
  hover = new Howl({
    src: ["/audio/eerie.webm", "/audio/eerie.ogg", "/audio/eerie.mp3"],
    volume: 0.65,
    rate: 0.25,
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
  ambient = new Howl({
    src: ["/audio/ambient.webm", "/audio/ambient.ogg", "/audio/ambient-2.mp3"],
    volume: 0,
    loop: true,
  });

  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    Howler.volume(enabled ? 1 : 0);
    if (enabled) {
      ambient?.play();
      ambient?.fade(0, 0.18, 2400);
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("rd:sound-mode", (event) => {
    const mode = (event as CustomEvent<{ enabled: boolean }>).detail.enabled;
    enabled = mode;
    Howler.volume(enabled ? 1 : 0);
    if (!enabled) {
      ambient?.fade(ambient?.volume() ?? 0, 0, 350);
      return;
    }
    if (unlocked && ambient && !ambient.playing()) ambient.play();
    ambient?.fade(ambient?.volume() ?? 0, 0.18, 900);
  });
  window.addEventListener("rd:soft-woosh", () => {
    if (enabled) softWoosh?.play();
  });
  window.addEventListener("rd:plucks", () => {
    if (enabled) plucks?.play();
  });

  document.querySelectorAll<HTMLElement>("[data-sound]").forEach((element) => {
    element.addEventListener("mouseenter", () => enabled && hover?.play());
    element.addEventListener("click", () => enabled && click?.play());
  });
}

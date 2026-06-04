# Rogier de Boeve Rebuild

Modern Astro rebuild of `https://rogierdeboeve.com/`, using the mirrored media assets in `public/`.

## Stack

- Astro static output
- TypeScript
- Three.js for the background 3D layer
- GSAP + Lenis for motion and smooth scrolling
- Howler for hover, click, and ambient audio

## Run locally

```sh
npm install
npm start
```

Open `http://localhost:5173/`.

## Refresh the mirror

```sh
npm run mirror
```

The source app lives in `src/`. Media assets are stored in `public/`, and the original mirrored HTML/bundle backup is in `legacy-mirror/`.

Set `PORT=3000` or another port before `npm start` if `5173` is already in use.

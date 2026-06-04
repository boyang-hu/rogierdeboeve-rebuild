self.addEventListener('message', e => {
  const src = e.data;
  fetch(src, { mode: 'cors' })
      .then(response => response.blob())
      .then(blob => createImageBitmap(blob, { imageOrientation: 'flipY' }))
      .then(bitmap => {
          self.postMessage({ src, bitmap }, [bitmap]);
      });
});
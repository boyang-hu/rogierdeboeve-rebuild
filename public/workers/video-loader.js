self.addEventListener('message', e => {
  const src = e.data;
  fetch(src, { mode: 'cors' })
      .then(response => response.blob())
      .then(blob => {
          // Create a URL for the blob
          const videoURL = URL.createObjectURL(blob);

          // Post the URL back to the main thread
          self.postMessage({ src, videoURL });
      })
      .catch(err => {
          // Handle any errors
          console.error('Error fetching and processing the video:', err);
      });
});
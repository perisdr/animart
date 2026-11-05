'use strict';
// Start in the head so the selected preview loads before the gallery renders.
window.animartFeatured = (() => {
  const sizes = '(max-width: 767px) 100vw, (max-width: 991px) calc(100vw - 48px), 70vw';
  let request;

  function randomIndex(length) {
    if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
      return Math.floor(Math.random() * length);
    }
    const value = new Uint32Array(1);
    // Discard the incomplete final bucket to avoid modulo bias.
    const limit = Math.floor(0x100000000 / length) * length;
    do {
      window.crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % length;
  }

  const srcset = record => `${encodeURI(record.preview)} 640w, ${encodeURI(record.webImage.medium.path)} ${record.webImage.medium.width}w, ${encodeURI(record.webImage.large.path)} ${record.webImage.large.width}w`;

  function load() {
    if (!request) {
      request = fetch('data/wallpapers.json').then(response => {
        if (!response.ok) throw Error('Catalogue unavailable');
        return response.json();
      }).then(records => {
        if (!Array.isArray(records) || !records.length) throw Error('Catalogue empty');
        const featured = records[randomIndex(records.length)];
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'image';
        preload.type = 'image/webp';
        preload.setAttribute('imagesrcset', srcset(featured));
        preload.setAttribute('imagesizes', sizes);
        preload.setAttribute('fetchpriority', 'high');
        document.head.append(preload);
        return {records, featured};
      }).catch(error => {
        request = null; // Allow the existing Retry control to fetch again.
        throw error;
      });
    }
    return request;
  }

  // The gallery owns error reporting; handle an early rejection until it attaches.
  load().catch(() => {});
  return {load, sizes, srcset};
})();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/biblia-pwa/service_worker.js", { scope: '/' })
    .then(registration => {
        console.log('Service worker registered:', registration);
      })
    .catch(error => {
        console.error('Service worker registration failed:', error);
      });
}
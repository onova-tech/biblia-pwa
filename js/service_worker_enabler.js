function createUpdateBanner() {
  if (document.getElementById('update-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <span>Nova versão disponível!</span>
    <button id="update-btn">Atualizar</button>
  `;
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #26a69a;
    color: white;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
  `;
  
  const btn = banner.querySelector('#update-btn');
  btn.style.cssText = `
    background: white;
    color: #26a69a;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px;
  `;
  
  btn.addEventListener('click', () => {
    window.location.reload();
  });
  
  document.body.appendChild(banner);
  console.log('Update banner shown');
}

function checkForUpdates(registration) {
  if (!registration) return;
  
  if (registration.waiting) {
    createUpdateBanner();
    return;
  }
  
  if (registration.installing) {
    registration.installing.addEventListener('statechange', () => {
      if (registration.installing.state === 'installed' && navigator.serviceWorker.controller) {
        createUpdateBanner();
      }
    });
  }
  
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        createUpdateBanner();
      }
    });
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/biblia-pwa/service_worker.js', { scope: '/biblia-pwa/' })
    .then(registration => {
      console.log('Service worker registered:', registration);
      checkForUpdates(registration);
      
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    })
    .catch(error => {
      console.error('Service worker registration failed:', error);
    });
}

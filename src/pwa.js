// PWA Service Worker Registration and Management
let deferredPrompt;
let isInstalled = false;

// Check if app is already installed
function checkIfInstalled() {
  // Check if running in standalone mode (installed PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled = true;
    return true;
  }
  
  // Check if running in iOS Safari standalone mode
  if (window.navigator.standalone === true) {
    isInstalled = true;
    return true;
  }
  
  return false;
}

// Register service worker
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './'
      });
      
      console.log('FitFlow PWA: Service Worker registered successfully:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, show update notification
            showUpdateNotification();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('FitFlow PWA: Service Worker registration failed:', error);
    }
  }
}

// Show update notification
function showUpdateNotification() {
  if (confirm('A new version of FitFlow is available. Would you like to update now?')) {
    window.location.reload();
  }
}

// Handle install prompt
export function setupInstallPrompt() {
  // Check if already installed
  if (checkIfInstalled()) {
    console.log('FitFlow PWA: App is already installed');
    return;
  }
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('FitFlow PWA: Install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button/banner
    showInstallBanner();
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('FitFlow PWA: App was installed successfully');
    hideInstallBanner();
    deferredPrompt = null;
    isInstalled = true;
    
    // Track installation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed'
      });
    }
  });
}

// Show install banner
function showInstallBanner() {
  // Create install banner if it doesn't exist
  let banner = document.getElementById('pwa-install-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #4f46e5;
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">📱 Install FitFlow</div>
          <div style="font-size: 14px; opacity: 0.9;">Add to your home screen for the best experience</div>
        </div>
        <div>
          <button id="pwa-install-btn" style="
            background: white;
            color: #4f46e5;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            margin-right: 8px;
            cursor: pointer;
          ">Install</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
          ">✕</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', installApp);
    document.getElementById('pwa-dismiss-btn').addEventListener('click', hideInstallBanner);
  }
  
  banner.style.display = 'block';
}

// Hide install banner
function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Install the app
export async function installApp() {
  if (!deferredPrompt) {
    // For iOS Safari, show manual install instructions
    if (isIOSSafari()) {
      showIOSInstallInstructions();
      return;
    }
    
    console.log('FitFlow PWA: No install prompt available');
    return;
  }
  
  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log('FitFlow PWA: User choice:', outcome);
    
    if (outcome === 'accepted') {
      console.log('FitFlow PWA: User accepted the install prompt');
    } else {
      console.log('FitFlow PWA: User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    hideInstallBanner();
  } catch (error) {
    console.error('FitFlow PWA: Install failed:', error);
  }
}

// Check if running on iOS Safari
function isIOSSafari() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
  return isIOS && isSafari;
}

// Show iOS install instructions
function showIOSInstallInstructions() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 320px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="margin: 0 0 16px 0; color: #333;">Install FitFlow</h3>
        <p style="margin: 0 0 20px 0; color: #666; line-height: 1.4;">
          To install FitFlow on your iPhone:
        </p>
        <div style="text-align: left; margin: 0 0 20px 0;">
          <div style="margin: 8px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">1.</span>
            <span>Tap the Share button</span>
            <span style="margin-left: 8px; font-size: 18px;">⬆️</span>
          </div>
          <div style="margin: 8px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">2.</span>
            <span>Scroll down and tap "Add to Home Screen"</span>
            <span style="margin-left: 8px; font-size: 18px;">📱</span>
          </div>
          <div style="margin: 8px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">3.</span>
            <span>Tap "Add" to confirm</span>
            <span style="margin-left: 8px; font-size: 18px;">✅</span>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        ">Got it!</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Enable offline functionality
export function enableOfflineSupport() {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('FitFlow PWA: Back online');
    showConnectionStatus('online');
    
    // Sync any pending data
    syncPendingData();
  });
  
  window.addEventListener('offline', () => {
    console.log('FitFlow PWA: Gone offline');
    showConnectionStatus('offline');
  });
}

// Show connection status
function showConnectionStatus(status) {
  // Remove existing status
  const existing = document.getElementById('connection-status');
  if (existing) existing.remove();
  
  const statusBar = document.createElement('div');
  statusBar.id = 'connection-status';
  statusBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 8px;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    transition: transform 0.3s ease;
    ${status === 'online' 
      ? 'background: #10b981; color: white;' 
      : 'background: #ef4444; color: white;'
    }
  `;
  
  statusBar.textContent = status === 'online' 
    ? '✅ Back online - Data syncing...' 
    : '⚠️ You\'re offline - Limited functionality';
  
  document.body.appendChild(statusBar);
  
  // Auto-hide after 3 seconds for online status
  if (status === 'online') {
    setTimeout(() => {
      if (statusBar.parentNode) {
        statusBar.style.transform = 'translateY(-100%)';
        setTimeout(() => statusBar.remove(), 300);
      }
    }, 3000);
  }
}

// Sync pending data when back online
async function syncPendingData() {
  try {
    const pendingWorkouts = JSON.parse(localStorage.getItem('pendingWorkouts') || '[]');
    
    if (pendingWorkouts.length > 0) {
      console.log('FitFlow PWA: Syncing pending workouts...');
      
      for (const workout of pendingWorkouts) {
        try {
          // Attempt to sync workout data
          await fetch('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
          });
        } catch (error) {
          console.log('Failed to sync workout:', error);
          break; // Stop syncing if network fails
        }
      }
      
      // Clear synced data
      localStorage.removeItem('pendingWorkouts');
      console.log('FitFlow PWA: Sync completed');
    }
  } catch (error) {
    console.error('FitFlow PWA: Sync failed:', error);
  }
}

// Initialize PWA features
export function initializePWA() {
  console.log('FitFlow PWA: Initializing...');
  
  // Register service worker
  registerSW();
  
  // Setup install prompt
  setupInstallPrompt();
  
  // Enable offline support
  enableOfflineSupport();
  
  // Check if already installed
  isInstalled = checkIfInstalled();
  
  console.log('FitFlow PWA: Initialization complete');
}
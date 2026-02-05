import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount React first
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize PWA features AFTER React mounts (non-blocking)
if (typeof window !== 'undefined') {
  import('./pwa.js').then(({ initializePWA }) => {
    initializePWA()
  }).catch(err => {
    console.warn('PWA initialization failed (non-critical):', err)
  })
}

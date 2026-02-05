// Minimal version for testing - bypasses PWA
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('FitFlow: Starting app...')
console.log('FitFlow: Root element:', document.getElementById('root'))

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('FitFlow: App rendered successfully!')
} catch (error) {
  console.error('FitFlow: Failed to render app:', error)
  // Show error on screen
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error Loading FitFlow</h1>
      <p style="color: red;">${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
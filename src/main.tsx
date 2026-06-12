import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './components/App'
import { loadVoices } from './lib/speak'
import './styles.css'

// Warm the voice list early (Chrome populates it asynchronously).
void loadVoices()

// Auto-update the service worker when a new deploy is available.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './components/App'
import { loadVoices } from './lib/speak'
import { swSetUpdate } from './lib/sw'
import './styles.css'

// Warm the voice list early (Chrome populates it asynchronously).
void loadVoices()

// New deploys wait for the user instead of reloading mid-lesson (lib/sw.ts).
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    swSetUpdate(updateSW)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

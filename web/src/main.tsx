import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Global styles (Tailwind)
import './tailwind.css'

const rootEl = document.getElementById('root') as HTMLElement
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

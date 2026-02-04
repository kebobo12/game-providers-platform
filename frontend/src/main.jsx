import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize theme before React renders to prevent flicker
const storedTheme = localStorage.getItem('gp-theme')
if (storedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

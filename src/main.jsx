// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// --- axios defaults (important) ---
axios.defaults.withCredentials = true
axios.defaults.baseURL = '/' // dev: use Vite proxy; prod: set real baseURL via env if needed
// -----------------------------------

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)

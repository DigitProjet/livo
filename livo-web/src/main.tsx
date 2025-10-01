import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/global.css'
import { HelmetProvider } from 'react-helmet-async'
const helmetContext = {}

ReactDOM.createRoot(document.getElementById('root')!).render(
    
<HelmetProvider context={helmetContext}>
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
</HelmetProvider>
)
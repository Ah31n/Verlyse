import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ReadingModeProvider } from './components/ui/ReadingMode'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReadingModeProvider><App /></ReadingModeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

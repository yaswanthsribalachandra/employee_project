import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  return (
    <div className="App">
      <img src={heroImg} alt="Hero" />
      <h1>Welcome to Vite + React</h1>
      <div className="logos">
        <img src={reactLogo} alt="React Logo" />
        <img src={viteLogo} alt="Vite Logo" />
      </div>
    </div>
  )
}

export default App

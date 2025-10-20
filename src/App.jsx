import React, { useEffect } from 'react'

function Greeting() {
  return (
    <div className="greeting-banner" id="greetingBanner">
      <span className="greeting-text">Chúc mừng 20/10</span>
      <span className="greeting-subtext">nói ít hiểu nhiều !!</span>
      <div className="greeting-sparkles"></div>
    </div>
  )
}

function PetalsContainer() {
  useEffect(() => {
    // Minimal hook to re-use existing petal spawner if present in window
    if (window.__initPetals) window.__initPetals()
  }, [])

  return <div className="petals-container" id="petals"></div>
}

export default function App() {
  useEffect(() => {
    document.body.classList.remove('not-loaded')
    // move static flowers markup into the live DOM so CSS selectors still work
    const staticFlowers = document.getElementById('_static_flowers')
    const root = document.getElementById('root')
    if (staticFlowers && root) {
      const frag = document.createRange().createContextualFragment(staticFlowers.innerHTML)
      root.appendChild(frag)
      // create petals container if not already present
      if (!document.getElementById('petals')) {
        const pc = document.createElement('div')
        pc.className = 'petals-container'
        pc.id = 'petals'
        document.body.appendChild(pc)
      }
      // call the petal initialization if available
      if (window.__initPetals) window.__initPetals()
    }
  }, [])

  return (
    <>
    <Greeting />
    <PetalsContainer />
    </>
  )
}

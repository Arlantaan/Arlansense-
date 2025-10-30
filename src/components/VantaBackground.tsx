import { useEffect, useRef } from 'react'

// Global type declaration
declare global {
  interface Window {
    VANTA: any
  }
}

interface VantaBackgroundProps {
  effect: 'WAVES' | 'FOG' | 'BIRDS' | 'NET' | 'DOTS' | 'RINGS'
  children: React.ReactNode
  className?: string
}

const VantaBackground: React.FC<VantaBackgroundProps> = ({ 
  effect, 
  children, 
  className = '' 
}) => {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    if (!vantaRef.current) return

    // Load Vanta.js from CDN
    const loadVanta = () => {
      // Check if VANTA is already loaded
      if (window.VANTA) {
        initVanta()
        return
      }

      // Load Three.js first
      const threeScript = document.createElement('script')
      threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
      threeScript.onload = () => {
        // Then load Vanta.js
        const vantaScript = document.createElement('script')
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js'
        vantaScript.onload = () => {
          initVanta()
        }
        document.head.appendChild(vantaScript)
      }
      document.head.appendChild(threeScript)
    }

    const initVanta = () => {
      if (!window.VANTA || !vantaRef.current) return

      // Configure the effect with darker golden colors
      const config: any = {
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x8b7355,  // Darker gold
        color2: 0x6b5b47,  // Even darker gold
        backgroundColor: 0x0f0f0f,  // Very dark background
        shininess: 60.00,
        waveHeight: 18.00,
        waveSpeed: 0.5,
        zoom: 0.8
      }

      vantaEffect.current = window.VANTA.WAVES(config)
    }

    loadVanta()

    // Cleanup on unmount
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
      }
    }
  }, [effect])

  return (
    <>
      <div ref={vantaRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className={className}>{children}</div>
    </>
  )
}

export default VantaBackground

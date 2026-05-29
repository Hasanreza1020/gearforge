'use client'

import { useEffect, useRef } from 'react'

interface ParticleEffectProps {
  trigger: boolean
  onComplete?: () => void
  color?: string
}

export default function ParticleEffect({ trigger, onComplete, color = '#00F5FF' }: ParticleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trigger || !containerRef.current) return

    const container = containerRef.current
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div')
      const angle = (i / 12) * 2 * Math.PI
      const distance = 40 + Math.random() * 30
      const size = 3 + Math.random() * 4

      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 6px ${color};
        animation: particle-burst 0.6s ease-out forwards;
        --dx: ${Math.cos(angle) * distance}px;
        --dy: ${Math.sin(angle) * distance}px;
      `
      container.appendChild(p)
      particles.push(p)
    }

    const timeout = setTimeout(() => {
      particles.forEach((p) => p.remove())
      onComplete?.()
    }, 700)

    return () => {
      clearTimeout(timeout)
      particles.forEach((p) => p.remove())
    }
  }, [trigger, color, onComplete])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 50 }}
    />
  )
}

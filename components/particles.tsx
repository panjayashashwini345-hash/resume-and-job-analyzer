"use client"

import { useEffect, useState } from "react"

export function Particles({ count = 24 }: { count?: number }) {
  const [particles, setParticles] = useState<
    { left: number; size: number; duration: number; delay: number }[]
  >([])

  useEffect(() => {
    setParticles(
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        duration: 12 + Math.random() * 18,
        delay: -Math.random() * 20,
      })),
    )
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

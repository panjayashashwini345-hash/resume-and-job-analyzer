"use client"

import { useEffect, useState } from "react"

interface Props {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  showPercent?: boolean
  duration?: number
}

export function ScoreRing({
  value,
  size = 220,
  strokeWidth = 14,
  label = "Match Score",
  showPercent = true,
  duration = 1400,
}: Props) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const start = performance.now()
    let raf: number
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimated(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  const offset = circumference - (animated / 100) * circumference
  const color =
    value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#f43f5e"

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-${size})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercent && (
          <div
            className="font-display font-bold tracking-tight"
            style={{ fontSize: size * 0.26, lineHeight: 1, color }}
          >
            {Math.round(animated)}
            <span className="text-foreground/60" style={{ fontSize: size * 0.12 }}>
              %
            </span>
          </div>
        )}
        {label && (
          <div
            className="text-muted-foreground mt-1"
            style={{ fontSize: size * 0.07 }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

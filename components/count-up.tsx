"use client"

import { useEffect, useState } from "react"

interface Props {
  value: number
  duration?: number
  className?: string
  suffix?: string
}

export function CountUp({ value, duration = 1200, className, suffix = "" }: Props) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let raf: number
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <span className={className}>
      {Math.round(v)}
      {suffix}
    </span>
  )
}

"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

type Filter = "All" | "HIGH" | "MED" | "LOW"

const COLOR: Record<"HIGH" | "MED" | "LOW", string> = {
  HIGH: "from-rose-500 to-rose-600",
  MED: "from-amber-500 to-amber-600",
  LOW: "from-emerald-500 to-emerald-600",
}
const TONE: Record<"HIGH" | "MED" | "LOW", string> = {
  HIGH: "text-rose-400",
  MED: "text-amber-400",
  LOW: "text-emerald-400",
}

export function ImprovementsTab() {
  const data = useAppStore((s) => s.analysisData)!
  const [filter, setFilter] = useState<Filter>("All")

  const counts = useMemo(() => {
    const c = { HIGH: 0, MED: 0, LOW: 0 }
    data.improvements.forEach((i) => (c[i.priority] = (c[i.priority] || 0) + 1))
    return c
  }, [data])

  const sorted = useMemo(() => {
    const order = { HIGH: 0, MED: 1, LOW: 2 }
    return [...data.improvements].sort(
      (a, b) => order[a.priority] - order[b.priority],
    )
  }, [data])

  const visible =
    filter === "All" ? sorted : sorted.filter((i) => i.priority === filter)

  const filters: { id: Filter; n: number }[] = [
    { id: "All", n: data.improvements.length },
    { id: "HIGH", n: counts.HIGH },
    { id: "MED", n: counts.MED },
    { id: "LOW", n: counts.LOW },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.id}
            variant={filter === f.id ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilter(f.id)}
            className={
              filter === f.id
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0"
                : ""
            }
          >
            {f.id}
            <motion.span
              key={f.n}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-2 rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] font-bold"
            >
              {f.n}
            </motion.span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((imp, i) => (
          <motion.div
            key={`${imp.title}-${i}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl glass p-5 pl-6"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${COLOR[imp.priority]}`}
            />
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${TONE[imp.priority]}`}
            >
              {imp.priority}
            </p>
            <h4 className="font-display font-semibold mt-1">{imp.title}</h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {imp.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

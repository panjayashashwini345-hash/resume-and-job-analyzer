"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react"

export function PrepPlanTab() {
  const data = useAppStore((s) => s.analysisData)!
  const [completed, setCompleted] = useState<Record<number, boolean>>({})

  function toggle(week: number) {
    setCompleted((c) => ({ ...c, [week]: !c[week] }))
  }

  const doneCount = Object.values(completed).filter(Boolean).length
  const total = data.prepPlan.length

  const [readyDate, setReadyDate] = useState<string>("")
  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + (data.totalPrepWeeks || total) * 7)
    setReadyDate(
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    )
  }, [data.totalPrepWeeks, total])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl glass p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Estimated ready date
            </p>
            <p className="font-display text-lg font-semibold">{readyDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">
            <span className="font-display font-bold text-lg text-foreground">
              {doneCount}
            </span>
            <span className="text-muted-foreground"> of {total} weeks completed</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-4 min-w-max">
          {data.prepPlan.map((wk, i) => {
            const done = !!completed[wk.week]
            const isCurrent = i === doneCount && !done
            return (
              <motion.button
                type="button"
                key={wk.week}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => toggle(wk.week)}
                className={`relative w-72 shrink-0 rounded-2xl border p-5 text-left transition-all ${
                  done
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : isCurrent
                      ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                      : "border-border bg-card/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {wk.week}
                    </span>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Week {wk.week}
                    </p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <h4 className="font-display font-semibold leading-snug mb-3">
                  {wk.focus}
                </h4>
                <ul className="space-y-1.5">
                  {wk.tasks?.map((t, j) => (
                    <li
                      key={j}
                      className="text-sm text-muted-foreground flex gap-2 leading-relaxed"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

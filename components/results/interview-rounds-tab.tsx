"use client"

import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export function InterviewRoundsTab() {
  const data = useAppStore((s) => s.analysisData)
  if (!data) return null

  return (
    <div className="relative">
      <div className="absolute left-4 md:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-accent to-primary/30" />
      <div className="space-y-6">
        {data.interviewRounds.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="relative pl-12 md:pl-16"
          >
            <div className="absolute left-0 md:left-1.5 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 font-display font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              {i + 1}
            </div>
            <div className="rounded-2xl glass p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-semibold">
                  {r.round}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary border-primary/30"
                >
                  {r.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {r.tips}
              </p>
              {r.keyTopics?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.keyTopics.map((t, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-muted/60 border border-border/60 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

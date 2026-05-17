"use client"

import { useAppStore } from "@/lib/store"
import { ScoreRing } from "./score-ring"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  X,
  CircleAlert,
} from "lucide-react"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

const PRIORITY_META = {
  HIGH: { Icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  MED: { Icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  LOW: { Icon: Info, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
}

export function SkillMatchTab() {
  const data = useAppStore((s) => s.analysisData)
  if (!data) return null

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero score */}
      <motion.div
        variants={item}
        className="rounded-2xl glass p-8 flex flex-col md:flex-row items-center gap-8"
      >
        <ScoreRing value={data.overallScore} size={220} label="Overall Match" />
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-display text-2xl font-bold">
            {data.candidateName} for {data.jobTitle}
          </h3>
          <p className="text-muted-foreground mt-1">{data.company}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90">
            {data.summary}
          </p>
        </div>
      </motion.div>

      {/* Sub-scores */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { label: "Technical", value: data.technicalScore },
          { label: "Experience", value: data.experienceScore },
          { label: "Soft Skills", value: data.softSkillsScore },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl glass p-6 flex flex-col items-center"
          >
            <ScoreRing
              value={s.value}
              size={140}
              strokeWidth={10}
              label={s.label}
            />
          </div>
        ))}
      </motion.div>

      {/* Skills */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <SkillsCard
          title="Matched Skills"
          skills={data.matchedSkills}
          tone="success"
        />
        <SkillsCard
          title="Missing Skills"
          skills={data.missingSkills}
          tone="danger"
        />
      </motion.div>

      {data.partialSkills.length > 0 && (
        <motion.div variants={item}>
          <SkillsCard
            title="Partial Match"
            skills={data.partialSkills}
            tone="warning"
          />
        </motion.div>
      )}

      {/* Resume issues */}
      {data.resumeIssues.length > 0 && (
        <motion.div variants={item} className="rounded-2xl glass p-6">
          <h3 className="font-display text-lg font-semibold mb-4">
            Resume Issues
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {data.resumeIssues.map((issue, i) => {
              const meta = PRIORITY_META[issue.priority] ?? PRIORITY_META.LOW
              return (
                <AccordionItem
                  key={i}
                  value={`i-${i}`}
                  className={`border ${meta.border} rounded-xl mb-2 px-4 ${meta.bg}`}
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
                      >
                        <meta.Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}
                        >
                          {issue.priority}
                        </span>
                        <p className="font-medium">{issue.title}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pl-10 pb-4">
                    {issue.description}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </motion.div>
      )}
    </motion.div>
  )
}

function SkillsCard({
  title,
  skills,
  tone,
}: {
  title: string
  skills: string[]
  tone: "success" | "danger" | "warning"
}) {
  const map = {
    success: { Icon: Check, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    danger: { Icon: X, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    warning: { Icon: CircleAlert, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  }[tone]
  return (
    <div className="rounded-2xl glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">{title}</h3>
        <span
          className={`rounded-full ${map.bg} ${map.color} text-xs font-semibold px-2.5 py-1`}
        >
          {skills.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">— None —</p>
        )}
        {skills.map((s, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`inline-flex items-center gap-1.5 rounded-full ${map.bg} ${map.color} border ${map.border} px-3 py-1 text-xs font-medium`}
          >
            <map.Icon className="h-3 w-3" />
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

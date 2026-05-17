"use client"

import { ResumeUpload } from "./resume-upload"
import { JobDetails } from "./job-details"
import { PracticeModeSelect } from "./practice-mode-select"
import { AnalyzeButton } from "./analyze-button"
import { motion } from "framer-motion"

export function InputPanel() {
  return (
    <section
      id="analyzer"
      className="relative mx-auto max-w-6xl px-6 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl glass-strong p-6 md:p-8 space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResumeUpload />
          <JobDetails />
        </div>
        <div className="border-t border-border/50 pt-8">
          <PracticeModeSelect />
        </div>
        <div className="border-t border-border/50 pt-6">
          <AnalyzeButton />
        </div>
      </motion.div>
    </section>
  )
}

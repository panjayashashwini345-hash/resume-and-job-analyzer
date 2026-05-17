"use client"

import { motion } from "framer-motion"
import { ChevronDown, Sparkles } from "lucide-react"
import { Particles } from "./particles"

const headline = "Know Your Fit Before the Interview"

export function Hero() {
  const words = headline.split(" ")
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="gradient-mesh absolute inset-0" aria-hidden />
      <Particles count={28} />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Powered by GPT-4o · Client-side only
        </motion.div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className={
                w === "Fit"
                  ? "gradient-text inline-block mr-3"
                  : "inline-block mr-3"
              }
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground text-pretty leading-relaxed"
        >
          AI-powered resume analysis, skill gap detection, mock interviews &amp;
          personalized prep plans — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="#analyzer"
            aria-label="Scroll to analyzer"
            className="group flex h-12 w-12 items-center justify-center rounded-full glass hover:border-primary/50 transition-colors"
          >
            <ChevronDown className="h-5 w-5 text-primary animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

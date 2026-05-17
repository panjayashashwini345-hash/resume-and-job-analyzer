"use client"

import { useRef, useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ResumeUpload() {
  const {
    resumeFile,
    resumeText,
    setResumeFile,
    setResumeText,
  } = useAppStore()
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10 MB)")
      return
    }
    setParsing(true)
    setResumeFile(file)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/parse-pdf", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Parse failed")
      setResumeText(data.text)
      toast.success("Resume parsed successfully")
    } catch (e: any) {
      toast.error(e?.message || "Failed to parse PDF")
      setResumeFile(null)
    } finally {
      setParsing(false)
    }
  }

  function remove() {
    setResumeFile(null)
    setResumeText("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Resume
      </h3>

      <AnimatePresence mode="wait">
        {!resumeFile ? (
          <motion.label
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files?.[0]
              if (file) handleFile(file)
            }}
            className={`relative block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <p className="font-medium">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse — PDF only, up to 10 MB
                </p>
              </div>
            </div>
          </motion.label>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl glass p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {parsing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">
                  {resumeFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(resumeFile.size / 1024).toFixed(1)} KB ·{" "}
                  {parsing ? "parsing…" : "parsed"}
                </p>
              </div>
              {!parsing && resumeText && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={remove}
                aria-label="Remove resume"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {resumeText && (
              <div className="mt-3 border-t border-border/50 pt-3">
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPreview ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  {showPreview ? "Hide" : "Show"} extracted text
                </button>
                <AnimatePresence>
                  {showPreview && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 text-xs text-muted-foreground/80 leading-relaxed line-clamp-4"
                    >
                      {resumeText.slice(0, 400)}…
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

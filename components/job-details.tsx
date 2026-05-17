"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Briefcase, Link2, FileText, Loader2, Eye, EyeOff, Lock, KeyRound } from "lucide-react"
import { toast } from "sonner"

export function JobDetails() {
  const { jobUrl, jobText, apiKey, setJobUrl, setJobText, setApiKey } =
    useAppStore()
  const [scraping, setScraping] = useState(false)
  const [showKey, setShowKey] = useState(false)

  async function scrape() {
    if (!jobUrl.trim()) {
      toast.error("Enter a job URL first")
      return
    }
    setScraping(true)
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Scrape failed")
      setJobText(data.text)
      toast.success("Job description scraped — review on the Paste tab")
    } catch (e: any) {
      toast.error(e?.message || "Failed to scrape — paste manually")
    } finally {
      setScraping(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-accent" />
        Job Details
      </h3>

      <Tabs defaultValue="link" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/40">
          <TabsTrigger value="link">
            <Link2 className="h-3.5 w-3.5 mr-2" /> Link
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="h-3.5 w-3.5 mr-2" /> Paste Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-3 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://linkedin.com/jobs/view/…"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="bg-muted/30 border-border/50"
            />
            <Button onClick={scrape} disabled={scraping} variant="secondary">
              {scraping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Scrape"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Works with LinkedIn, Indeed, Naukri, Glassdoor. If blocked, paste
            manually.
          </p>
          {jobText && (
            <div className="rounded-lg glass p-3 text-xs text-muted-foreground line-clamp-3">
              <span className="font-medium text-foreground">Preview:</span>{" "}
              {jobText.slice(0, 240)}…
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <Textarea
            placeholder="Paste the full job description here…"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            className="min-h-[180px] bg-muted/30 border-border/50 resize-y"
          />
        </TabsContent>
      </Tabs>

      <div className="pt-2">
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          OpenAI API Key
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showKey ? "text" : "password"}
            placeholder="sk-…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pl-9 pr-10 bg-muted/30 border-border/50 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? "Hide key" : "Show key"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Used client-side only — never stored or sent to our servers.
        </p>
      </div>
    </div>
  )
}

"use client"

import { jsPDF } from "jspdf"
import type { AnalysisData } from "./store"

const COLORS = {
  bg: [10, 10, 15] as [number, number, number],
  card: [17, 17, 24] as [number, number, number],
  text: [248, 250, 252] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  primary: [99, 102, 241] as [number, number, number],
  accent: [6, 182, 212] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [244, 63, 94] as [number, number, number],
  border: [42, 42, 56] as [number, number, number],
}

function setFill(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2])
}
function setText(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2])
}
function setDraw(doc: jsPDF, c: [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2])
}

function fillBackground(doc: jsPDF) {
  setFill(doc, COLORS.bg)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F")
}

function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 4,
) {
  setFill(doc, COLORS.card)
  setDraw(doc, COLORS.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, w, h, radius, radius, "FD")
}

function drawHeader(doc: jsPDF, title: string, page: number, total: number) {
  setText(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.text("FitScope Report", 15, 12)
  doc.text(`Page ${page} of ${total}`, doc.internal.pageSize.getWidth() - 15, 12, {
    align: "right",
  })
  setText(doc, COLORS.text)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 15, 22)
  setDraw(doc, COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(15, 26, doc.internal.pageSize.getWidth() - 15, 26)
}

function drawProgressBar(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  value: number,
  color: [number, number, number],
) {
  setFill(doc, COLORS.border)
  doc.roundedRect(x, y, w, 4, 2, 2, "F")
  setFill(doc, color)
  doc.roundedRect(x, y, (w * value) / 100, 4, 2, 2, "F")
}

function drawPill(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  bgColor: [number, number, number],
  textColor: [number, number, number],
): number {
  doc.setFontSize(8)
  const w = doc.getTextWidth(text) + 6
  setFill(doc, bgColor)
  doc.roundedRect(x, y - 3, w, 5, 2.5, 2.5, "F")
  setText(doc, textColor)
  doc.text(text, x + 3, y)
  return w
}

function scoreColor(value: number): [number, number, number] {
  if (value >= 75) return COLORS.success
  if (value >= 50) return COLORS.warning
  return COLORS.danger
}

export async function generatePdfReport(data: AnalysisData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  doc.setFont("helvetica")
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const TOTAL = 6

  // PAGE 1: Cover
  fillBackground(doc)

  // Top accent bar
  setFill(doc, COLORS.primary)
  doc.rect(0, 0, pageW, 3, "F")

  // Branding
  setText(doc, COLORS.primary)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("FITSCOPE", 15, 20)
  setText(doc, COLORS.muted)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("AI Resume & Job Fit Analyzer", 15, 25)

  // Date
  setText(doc, COLORS.muted)
  doc.setFontSize(9)
  doc.text(
    new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageW - 15,
    20,
    { align: "right" },
  )

  // Title
  setText(doc, COLORS.text)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  const titleY = 60
  doc.text("Job Fit Report", 15, titleY)

  // Candidate / Company
  setText(doc, COLORS.muted)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("Candidate", 15, titleY + 15)
  setText(doc, COLORS.text)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(data.candidateName, 15, titleY + 23)

  setText(doc, COLORS.muted)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("Role", 15, titleY + 36)
  setText(doc, COLORS.text)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(data.jobTitle, 15, titleY + 44)
  setText(doc, COLORS.accent)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`@ ${data.company}`, 15, titleY + 51)

  // Verdict badge
  const verdictColor =
    data.verdict === "Strong Fit"
      ? COLORS.success
      : data.verdict === "Good Fit"
        ? COLORS.accent
        : data.verdict === "Partial Fit"
          ? COLORS.warning
          : COLORS.danger
  setFill(doc, verdictColor)
  doc.roundedRect(15, titleY + 60, 60, 12, 2, 2, "F")
  setText(doc, [255, 255, 255])
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(data.verdict.toUpperCase(), 45, titleY + 68, { align: "center" })

  // Big score circle (right side)
  const cx = pageW - 50
  const cy = titleY + 35
  const r = 28
  setDraw(doc, COLORS.border)
  doc.setLineWidth(4)
  doc.circle(cx, cy, r, "S")
  setDraw(doc, scoreColor(data.overallScore))
  doc.setLineWidth(4)
  // Approximation: arc via circle (full) — jsPDF doesn't support partial arcs cleanly,
  // so render fill ring proportionally with overlapping shorter line approach.
  const segments = 64
  const fullSegs = Math.round((data.overallScore / 100) * segments)
  for (let i = 0; i < fullSegs; i++) {
    const a1 = (i / segments) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2
    doc.line(
      cx + Math.cos(a1) * r,
      cy + Math.sin(a1) * r,
      cx + Math.cos(a2) * r,
      cy + Math.sin(a2) * r,
    )
  }
  setText(doc, COLORS.text)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.overallScore}`, cx, cy + 2, { align: "center" })
  setText(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("OVERALL", cx, cy + 9, { align: "center" })

  // Footer summary
  drawCard(doc, 15, pageH - 50, pageW - 30, 30)
  setText(doc, COLORS.muted)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("EXECUTIVE SUMMARY", 20, pageH - 42)
  setText(doc, COLORS.text)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  const summaryLines = doc.splitTextToSize(data.summary, pageW - 40)
  doc.text(summaryLines.slice(0, 4), 20, pageH - 36)

  // PAGE 2: Skill Match
  doc.addPage()
  fillBackground(doc)
  drawHeader(doc, "Skill Match Analysis", 2, TOTAL)

  let y = 35
  // Score breakdown bars
  setText(doc, COLORS.text)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Score Breakdown", 15, y)
  y += 8
  const scores = [
    { label: "Technical", v: data.technicalScore },
    { label: "Experience", v: data.experienceScore },
    { label: "Soft Skills", v: data.softSkillsScore },
    { label: "Overall", v: data.overallScore },
  ]
  for (const s of scores) {
    setText(doc, COLORS.muted)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(s.label, 15, y)
    setText(doc, COLORS.text)
    doc.setFont("helvetica", "bold")
    doc.text(`${s.v}%`, pageW - 15, y, { align: "right" })
    drawProgressBar(doc, 15, y + 1.5, pageW - 30, s.v, scoreColor(s.v))
    y += 9
  }

  y += 4
  // Matched skills
  setText(doc, COLORS.success)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(`Matched Skills (${data.matchedSkills.length})`, 15, y)
  y += 5
  let px = 15
  for (const s of data.matchedSkills) {
    if (px > pageW - 50) {
      px = 15
      y += 7
    }
    const w = drawPill(doc, px, y, s, [16, 185, 129, 40] as any, [16, 185, 129])
    setFill(doc, [16, 185, 129])
    doc.setFillColor(16, 185, 129, 0.15 as any)
    px += w + 2
  }
  y += 10

  // Missing skills
  setText(doc, COLORS.danger)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(`Missing Skills (${data.missingSkills.length})`, 15, y)
  y += 5
  px = 15
  for (const s of data.missingSkills) {
    if (px > pageW - 50) {
      px = 15
      y += 7
    }
    const w = drawPill(doc, px, y, s, [244, 63, 94, 40] as any, COLORS.danger)
    px += w + 2
  }
  y += 12

  // Resume issues
  if (data.resumeIssues.length && y < pageH - 40) {
    setText(doc, COLORS.text)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Resume Issues", 15, y)
    y += 6
    for (const iss of data.resumeIssues.slice(0, 5)) {
      if (y > pageH - 25) break
      const c =
        iss.priority === "HIGH"
          ? COLORS.danger
          : iss.priority === "MED"
            ? COLORS.warning
            : COLORS.success
      drawPill(doc, 15, y, iss.priority, c, [255, 255, 255])
      setText(doc, COLORS.text)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text(iss.title, 35, y)
      y += 4
      setText(doc, COLORS.muted)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      const lines = doc.splitTextToSize(iss.description, pageW - 50)
      doc.text(lines.slice(0, 2), 35, y)
      y += lines.slice(0, 2).length * 4 + 4
    }
  }

  // PAGE 3: Interview Rounds
  doc.addPage()
  fillBackground(doc)
  drawHeader(doc, "Interview Rounds", 3, TOTAL)
  y = 35
  for (let i = 0; i < data.interviewRounds.length; i++) {
    const r = data.interviewRounds[i]
    if (y > pageH - 40) break
    setFill(doc, COLORS.primary)
    doc.circle(20, y + 2, 4, "F")
    setText(doc, [255, 255, 255])
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text(`${i + 1}`, 20, y + 3.2, { align: "center" })

    setText(doc, COLORS.text)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(r.round, 30, y + 3)
    setText(doc, COLORS.accent)
    doc.setFontSize(8)
    doc.text(`[${r.type}]`, 30 + doc.getTextWidth(r.round) + 3, y + 3)

    y += 8
    setText(doc, COLORS.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(r.tips, pageW - 45)
    doc.text(lines.slice(0, 3), 30, y)
    y += lines.slice(0, 3).length * 4 + 2

    if (r.keyTopics?.length) {
      let tx = 30
      for (const t of r.keyTopics) {
        if (tx > pageW - 50) {
          tx = 30
          y += 6
        }
        const w = drawPill(doc, tx, y, t, COLORS.border, COLORS.muted)
        tx += w + 2
      }
      y += 6
    }
    y += 5
  }

  // PAGE 4: Improvements
  doc.addPage()
  fillBackground(doc)
  drawHeader(doc, "Improvements", 4, TOTAL)
  y = 35
  const order = { HIGH: 0, MED: 1, LOW: 2 }
  const sorted = [...data.improvements].sort(
    (a, b) => order[a.priority] - order[b.priority],
  )
  for (const imp of sorted) {
    if (y > pageH - 30) break
    const c =
      imp.priority === "HIGH"
        ? COLORS.danger
        : imp.priority === "MED"
          ? COLORS.warning
          : COLORS.success
    drawPill(doc, 15, y, imp.priority, c, [255, 255, 255])
    setText(doc, COLORS.text)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(imp.title, 35, y)
    y += 5
    setText(doc, COLORS.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(imp.description, pageW - 50)
    doc.text(lines.slice(0, 3), 35, y)
    y += lines.slice(0, 3).length * 4 + 5
  }

  // PAGE 5: Prep Plan
  doc.addPage()
  fillBackground(doc)
  drawHeader(doc, "Prep Plan", 5, TOTAL)
  y = 35
  setText(doc, COLORS.muted)
  doc.setFontSize(9)
  doc.text(`Total: ${data.totalPrepWeeks} weeks`, 15, y)
  y += 8
  for (const wk of data.prepPlan) {
    if (y > pageH - 30) break
    setFill(doc, COLORS.primary)
    doc.roundedRect(15, y - 4, 18, 7, 1.5, 1.5, "F")
    setText(doc, [255, 255, 255])
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text(`WEEK ${wk.week}`, 24, y, { align: "center" })

    setText(doc, COLORS.text)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(wk.focus, 38, y)
    y += 6
    setText(doc, COLORS.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    for (const t of wk.tasks || []) {
      if (y > pageH - 20) break
      const lines = doc.splitTextToSize(`• ${t}`, pageW - 50)
      doc.text(lines, 38, y)
      y += lines.length * 4
    }
    y += 4
  }

  // PAGE 6: Summary
  doc.addPage()
  fillBackground(doc)
  drawHeader(doc, "Summary & Next Steps", 6, TOTAL)
  y = 35

  // Verdict block
  drawCard(doc, 15, y, pageW - 30, 28)
  setText(doc, verdictColor)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(data.verdict, 20, y + 12)
  setText(doc, COLORS.muted)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  const reasonLines = doc.splitTextToSize(data.verdictReason, pageW - 40)
  doc.text(reasonLines.slice(0, 3), 20, y + 19)
  y += 35

  // Key metrics grid
  const stats = [
    { label: "OVERALL", value: `${data.overallScore}%`, color: scoreColor(data.overallScore) },
    { label: "MATCHED", value: `${data.matchedSkills.length}`, color: COLORS.success },
    { label: "GAP", value: `${data.missingSkills.length}`, color: COLORS.danger },
    { label: "WEEKS", value: `${data.totalPrepWeeks}`, color: COLORS.primary },
  ]
  const sw = (pageW - 30 - 6) / 4
  for (let i = 0; i < stats.length; i++) {
    const sx = 15 + i * (sw + 2)
    drawCard(doc, sx, y, sw, 22)
    setText(doc, stats[i].color)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text(stats[i].value, sx + sw / 2, y + 12, { align: "center" })
    setText(doc, COLORS.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.text(stats[i].label, sx + sw / 2, y + 18, { align: "center" })
  }
  y += 28

  // AI Assessment
  drawCard(doc, 15, y, pageW - 30, 30)
  setFill(doc, COLORS.primary)
  doc.rect(15, y, 1.5, 30, "F")
  setText(doc, COLORS.primary)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text("AI ASSESSMENT", 20, y + 6)
  setText(doc, COLORS.text)
  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  const sumLines = doc.splitTextToSize(`"${data.summary}"`, pageW - 40)
  doc.text(sumLines.slice(0, 5), 20, y + 12)
  y += 35

  // Top 3 actions
  setText(doc, COLORS.text)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Top 3 Priority Actions", 15, y)
  y += 6
  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    if (y > pageH - 20) break
    const imp = sorted[i]
    setFill(doc, COLORS.danger)
    doc.circle(19, y + 1, 3, "F")
    setText(doc, [255, 255, 255])
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text(`${i + 1}`, 19, y + 2, { align: "center" })
    setText(doc, COLORS.text)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(imp.title, 26, y + 2)
    y += 6
    setText(doc, COLORS.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const dl = doc.splitTextToSize(imp.description, pageW - 45)
    doc.text(dl.slice(0, 2), 26, y)
    y += dl.slice(0, 2).length * 4 + 3
  }

  // Save
  const safeName = (s: string) =>
    s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "report"
  const filename = `${safeName(data.candidateName)}_${safeName(data.company)}_FitReport.pdf`
  doc.save(filename)
}

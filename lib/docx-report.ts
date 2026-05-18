"use client"

import type { AnalysisData } from "@/lib/store"
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
} from "docx"

export async function generateDocxReport(data: AnalysisData) {
  const h1 = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text, bold: true })],
      spacing: { before: 320, after: 120 },
    })
  const h2 = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text, bold: true })],
      spacing: { before: 240, after: 80 },
    })
  const p = (text: string, opts: { bold?: boolean; italic?: boolean } = {}) =>
    new Paragraph({
      children: [new TextRun({ text, ...opts })],
      spacing: { after: 80 },
    })
  const bullet = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text })],
      spacing: { after: 40 },
    })

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Ace Prep AI", bold: true, size: 40 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Resume & Job Fit Report",
          italics: true,
          size: 24,
        }),
      ],
      spacing: { after: 240 },
    }),
    p(`Candidate: ${data.candidateName}`, { bold: true }),
    p(`Role: ${data.jobTitle} @ ${data.company}`),
    p(`Verdict: ${data.verdict} (${data.overallScore}%)`, { bold: true }),
    p(data.verdictReason, { italic: true }),

    h1("Key Takeaways"),
    p(data.summary),

    h1("Scores"),
    bullet(`Overall: ${data.overallScore}%`),
    bullet(`Technical: ${data.technicalScore}%`),
    bullet(`Experience: ${data.experienceScore}%`),
    bullet(`Soft Skills: ${data.softSkillsScore}%`),

    h1("Skills Analysis"),
    h2("Matched Skills"),
    ...(data.matchedSkills.length
      ? data.matchedSkills.map(bullet)
      : [p("None")]),
    h2("Partial Skills"),
    ...(data.partialSkills.length
      ? data.partialSkills.map(bullet)
      : [p("None")]),
    h2("Missing Skills (Gaps)"),
    ...(data.missingSkills.length
      ? data.missingSkills.map(bullet)
      : [p("None")]),

    h1("Resume Issues"),
    ...(data.resumeIssues.length
      ? data.resumeIssues.flatMap((it) => [
          p(`[${it.priority}] ${it.title}`, { bold: true }),
          p(it.description),
        ])
      : [p("No major issues detected.")]),

    h1("Interview Rounds"),
    ...data.interviewRounds.flatMap((r, i) => [
      h2(`${i + 1}. ${r.round} — ${r.type}`),
      p(r.tips),
      ...(r.keyTopics.length
        ? [p("Key topics:", { bold: true }), ...r.keyTopics.map(bullet)]
        : []),
    ]),

    h1("Recommendations"),
    ...data.improvements.flatMap((imp) => [
      p(`[${imp.priority}] ${imp.title}`, { bold: true }),
      p(imp.description),
    ]),

    h1(`Prep Plan (${data.totalPrepWeeks} weeks)`),
    ...data.prepPlan.flatMap((w) => [
      h2(`Week ${w.week}: ${w.focus}`),
      ...w.tasks.map(bullet),
    ]),
  ]

  const doc = new Document({
    creator: "Ace Prep AI",
    title: "Resume & Job Fit Report",
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ace-prep-report-${data.candidateName.replace(/\s+/g, "-").toLowerCase()}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

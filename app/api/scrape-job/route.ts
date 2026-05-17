import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export const runtime = "nodejs"
export const maxDuration = 30

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

const SELECTORS = [
  // LinkedIn
  ".description__text",
  ".show-more-less-html__markup",
  ".jobs-description__container",
  // Indeed
  "#jobDescriptionText",
  ".jobsearch-JobComponent-description",
  // Glassdoor
  ".jobDescriptionContent",
  ".desc",
  // Naukri
  ".job-desc",
  ".styles_JDC__dang-inner-html__h0K4t",
  ".dang-inner-html",
  // Generic
  '[class*="job-description"]',
  '[class*="JobDescription"]',
  '[data-testid*="description"]',
  "article",
  "main",
]

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 })
    }

    let target: URL
    try {
      target = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    })

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch (${res.status}). Many job sites block scraping — please paste the description manually.`,
        },
        { status: 422 },
      )
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    // Remove noise
    $("script, style, noscript, iframe, nav, footer, header").remove()

    let best = ""
    for (const sel of SELECTORS) {
      const el = $(sel).first()
      if (el.length) {
        const t = cleanText(el.text())
        if (t.length > best.length) best = t
        if (best.length > 600) break
      }
    }

    if (best.length < 200) {
      // Fallback: largest <div> by text length
      let max = ""
      $("div").each((_, el) => {
        const t = cleanText($(el).text())
        if (t.length > max.length && t.length < 20000) max = t
      })
      if (max.length > best.length) best = max
    }

    if (best.length < 100) {
      return NextResponse.json(
        {
          error:
            "Could not extract job description. Site may require login. Please paste the description manually.",
        },
        { status: 422 },
      )
    }

    // Cap to avoid massive payloads
    const text = best.slice(0, 12000)
    return NextResponse.json({ text })
  } catch (err: any) {
    console.error("[v0] scrape-job error:", err)
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to scrape job. Please paste the description manually.",
      },
      { status: 500 },
    )
  }
}

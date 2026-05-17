import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)

    const { extractText, getDocumentProxy } = await import("unpdf")
    const pdf = await getDocumentProxy(uint8)
    const { text, totalPages } = await extractText(pdf, { mergePages: true })

    const cleaned = (typeof text === "string" ? text : (text as string[]).join("\n")).trim()

    if (!cleaned) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The PDF may be image-only." },
        { status: 422 },
      )
    }

    return NextResponse.json({ text: cleaned, pages: totalPages ?? 0 })
  } catch (err: any) {
    console.error("[v0] parse-pdf error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to parse PDF" },
      { status: 500 },
    )
  }
}

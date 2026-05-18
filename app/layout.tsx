import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })

export const metadata: Metadata = {
  title: "Ace Prep AI — Crack every interview. Powered by AI.",
  description:
    "AI-powered resume analysis, skill gap detection, mock interviews & personalized prep plans — all in one place.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${syne.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster theme="dark" position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}

import type React from "react"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

export const metadata = {
  title: "SoundWave - Sui Blockchain Entertainment Marketplace",
  description:
    "Buy, sell, and stream music and movies on the Sui blockchain. Book artists, purchase tickets, and earn royalties.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          {children}
          <FloatingThemeToggle />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

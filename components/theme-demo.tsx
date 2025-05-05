"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { Moon, Sun, Laptop } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeDemo() {
  const { theme } = useTheme()
  const [showInfo, setShowInfo] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Choose Your Experience</h3>
            <p className="text-muted-foreground mb-4">
              Switch between light and dark themes to customize your SoundWave experience.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <ThemeToggle variant="outline" size="default" />
              <Button variant="outline" onClick={() => setShowInfo(!showInfo)}>
                {showInfo ? "Hide Info" : "Learn More"}
              </Button>
            </div>

            {showInfo && (
              <motion.div
                className="mt-4 text-sm text-muted-foreground"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p>SoundWave offers three theme options:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light: Bright and clear for daytime use
                  </li>
                  <li className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark: Easy on the eyes for nighttime browsing
                  </li>
                  <li className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" /> System: Automatically matches your device settings
                  </li>
                </ul>
              </motion.div>
            )}
          </div>

          <div className="relative">
            <div className="w-full max-w-[300px] aspect-[4/3] bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden border">
              <div className="absolute inset-0 flex items-center justify-center">
                {theme === "dark" ? (
                  <Moon className="h-16 w-16 text-primary animate-pulse" />
                ) : (
                  <Sun className="h-16 w-16 text-primary animate-pulse" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlayCircle, Ticket, Music, Film, Sparkles } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export function HeroSection() {
  const [connected, setConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = async () => {
    setIsLoading(true)
    // In a real implementation, this would connect to the Sui wallet
    console.log("Connecting to Sui wallet...")
    setTimeout(() => {
      setConnected(true)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background with gradient overlay */}
      <div className="absolute inset-0 hero-gradient"></div>

      {/* Floating musical notes and film elements (decorative) */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/20"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0.1,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, "-100%"],
              opacity: [null, 0.2, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {i % 3 === 0 ? (
              <Music size={i % 2 === 0 ? 48 : 32} />
            ) : i % 3 === 1 ? (
              <Film size={i % 2 === 0 ? 48 : 32} />
            ) : (
              <Ticket size={i % 2 === 0 ? 48 : 32} />
            )}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center md:text-left md:mx-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              The Future of Entertainment on{" "}
              <span className="text-sui inline-block relative">
                Sui
                <motion.span
                  className="absolute -top-6 -right-6 text-sui-light"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.span>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Buy, sell, and stream music and movies on the blockchain. Book artists, purchase tickets, and earn
              royalties through smart contracts.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4 justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {!connected ? (
              <Button size="lg" onClick={connectWallet} disabled={isLoading} className="px-8">
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent"></span>
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            ) : (
              <Button size="lg" className="px-8" asChild>
                <Link href="/marketplace">Explore Marketplace</Link>
              </Button>
            )}

            <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm border-white/20" asChild>
              <Link href="/stream">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Streaming
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3 pt-12 justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
              <Music className="h-4 w-4 text-sui" />
              <span className="text-sm">Buy & Sell Songs</span>
            </div>
            <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
              <Film className="h-4 w-4 text-sui" />
              <span className="text-sm">Stream Movies</span>
            </div>
            <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
              <Ticket className="h-4 w-4 text-sui" />
              <span className="text-sm">NFT Tickets</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative element - floating platform mockup */}
      <motion.div
        className="hidden lg:block absolute right-10 bottom-0 transform translate-y-1/4 z-20"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="relative">
          <div className="w-[400px] h-[300px] rounded-lg shadow-2xl overflow-hidden border-4 border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-sui/30 to-primary/20 backdrop-blur-sm"></div>
            <div className="absolute inset-0 p-4 flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="h-6 w-48 mx-auto bg-white/10 rounded-full"></div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Music className="h-16 w-16 mx-auto text-sui animate-pulse-light" />
                  <div className="h-2 w-32 bg-white/20 rounded-full mt-4 mx-auto"></div>
                  <div className="h-2 w-24 bg-white/10 rounded-full mt-2 mx-auto"></div>
                  <div className="flex justify-center mt-6 gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="h-3 w-3 border-t-2 border-l-2 border-white -rotate-45 translate-x-px"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-sui flex items-center justify-center">
                      <div className="h-3 w-3 bg-white rounded-sm"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="h-3 w-3 border-t-2 border-r-2 border-white rotate-45 -translate-x-px"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full">
                <div className="h-full w-1/3 bg-sui rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Reflection effect */}
          <div className="w-[400px] h-[100px] mt-1 rounded-b-lg bg-gradient-to-b from-white/10 to-transparent transform scale-y-[-0.3] opacity-30 blur-sm"></div>
        </div>
      </motion.div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Music, Film, Ticket, Search, Menu, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { SuiIcon } from "@/components/sui-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavbarAuth } from "@/components/navbar-auth"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearchOnMobile, setShowSearchOnMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const navItems = [
    { name: "Music", href: "/marketplace", icon: Music },
    { name: "Movies", href: "/movies", icon: Film },
    { name: "NFTs", href: "/nfts", icon: BookOpen },
    { name: "Tickets", href: "/tickets", icon: Ticket },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <nav className="flex flex-col gap-6 mt-8">
                <Link href="/" className="text-lg font-bold flex items-center gap-2">
                  <SuiIcon className="h-6 w-6" />
                  <span>SoundWave</span>
                </Link>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search..." className="w-full pl-8" />
                </div>

                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                      pathname === item.href ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <SuiIcon className="h-7 w-7" />
            <span className="font-bold text-xl tracking-tight">SoundWave</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <div className="hidden sm:flex relative w-40 lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8 bg-background/80 backdrop-blur-sm border-muted"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setShowSearchOnMobile(!showSearchOnMobile)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <ThemeToggle className="hidden md:flex" />

          <NavbarAuth />
        </div>
      </div>
    </header>
  )
}

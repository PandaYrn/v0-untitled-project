import Link from "next/link"
import { SuiIcon } from "@/components/sui-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Twitter, DiscIcon as Discord, Github, Send, Mail, Heart } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="border-t mt-auto pt-12 pb-6 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SuiIcon className="h-8 w-8" />
              <span className="font-bold text-xl">SoundWave</span>
            </div>
            <p className="text-muted-foreground">
              Revolutionizing entertainment through blockchain technology. Buy, sell, and stream with true ownership and
              fair royalties.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/50">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/50">
                <Discord className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/50">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <nav className="space-y-2.5 text-muted-foreground">
              <Link href="/marketplace" className="block hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link href="/stream" className="block hover:text-primary transition-colors">
                Streaming
              </Link>
              <Link href="/nfts" className="block hover:text-primary transition-colors">
                NFT Collections
              </Link>
              <Link href="/tickets" className="block hover:text-primary transition-colors">
                Concert Tickets
              </Link>
              <Link href="/booking" className="block hover:text-primary transition-colors">
                Artist Booking
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resources</h3>
            <nav className="space-y-2.5 text-muted-foreground">
              <Link href="/how-it-works" className="block hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/royalties" className="block hover:text-primary transition-colors">
                Royalty System
              </Link>
              <Link href="/for-artists" className="block hover:text-primary transition-colors">
                For Artists
              </Link>
              <Link href="/help" className="block hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link href="/terms" className="block hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Newsletter</h3>
            <p className="text-muted-foreground">Subscribe to get updates on new features and releases.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input type="email" placeholder="Your email" className="pl-10" />
              </div>
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">By subscribing, you agree to our Privacy Policy.</div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1 mb-4 sm:mb-0">
            <span>© {new Date().getFullYear()} SoundWave. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>on</span>
            <SuiIcon className="h-4 w-4 mx-1" />
            <span>Sui Blockchain</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

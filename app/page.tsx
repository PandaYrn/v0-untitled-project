import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeaturedContent } from "@/components/featured-content"
import { CategorySection } from "@/components/category-section"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap, ShieldCheck, Users, Wallet } from "lucide-react"
import { SuiIcon } from "@/components/sui-icon"
import { ThemeDemo } from "@/components/theme-demo"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />

      <div className="container mx-auto px-4 py-12 space-y-24">
        <FeaturedContent title="Top Trending" description="The most popular content on SoundWave this week" />

        <div className="relative py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-sui/10 via-background to-sui/10 rounded-xl -z-10"></div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SoundWave?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our blockchain-based platform revolutionizes how artists and fans interact, bringing transparency and
              fairness to the entertainment industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-sui/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-sui" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Ownership</h3>
                <p className="text-muted-foreground">
                  True ownership of digital assets verified on the Sui blockchain.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-sui/20 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-sui" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fair Royalties</h3>
                <p className="text-muted-foreground">Transparent royalty distribution directly to creators.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-sui/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-sui" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fast Transactions</h3>
                <p className="text-muted-foreground">Lightning-fast transactions powered by Sui's infrastructure.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-sui/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-sui" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Focused</h3>
                <p className="text-muted-foreground">Built by and for the entertainment community.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <ThemeDemo />

        <CategorySection title="New Releases" category="new" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden bg-gradient-to-br from-sui/20 to-primary/5 backdrop-blur-sm border-none shadow-lg">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-sui/20 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-sui" />
              </div>
              <h2 className="text-2xl font-bold">Book Your Favorite Artists</h2>
              <p className="text-muted-foreground">
                Connect directly with artists for your events and receive blockchain-verified confirmations. Secure
                agreements with smart contracts.
              </p>
              <Button asChild className="mt-4">
                <Link href="/booking" className="group">
                  Explore Booking
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-sui/20 to-primary/5 backdrop-blur-sm border-none shadow-lg">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-sui/20 flex items-center justify-center mb-2">
                <Wallet className="h-6 w-6 text-sui" />
              </div>
              <h2 className="text-2xl font-bold">Concert Tickets</h2>
              <p className="text-muted-foreground">
                Purchase NFT tickets for upcoming concerts with resale protection and exclusive perks. Verify
                authenticity instantly.
              </p>
              <Button asChild className="mt-4">
                <Link href="/tickets" className="group">
                  View Events
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <CategorySection title="Featured NFTs" category="nft" />

        <div className="text-center py-8 space-y-6">
          <div className="inline-block">
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-sui/20 text-sui font-medium text-sm">
              <SuiIcon className="h-4 w-4" />
              Powered by Sui Blockchain
            </div>
          </div>

          <h2 className="text-3xl font-bold">Ready to dive into the future of entertainment?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join SoundWave today and experience the revolution in music and movies on the blockchain.
          </p>

          <Button size="lg" className="mt-4">
            <Link href="/marketplace">Explore Marketplace</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ContentCard } from "@/components/content/content-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plus, Filter, ArrowUpDown } from "lucide-react"

export default async function MarketplacePage() {
  const supabase = createServerSupabaseClient()

  // Fetch content with creator profiles
  const { data: content } = await supabase
    .from("content")
    .select(`
      *,
      profiles:creator_id(*)
    `)
    .order("created_at", { ascending: false })

  // Group content by type
  const musicContent = content?.filter((item) => item.content_type === "music") || []
  const movieContent = content?.filter((item) => item.content_type === "movie") || []
  const nftContent = content?.filter((item) => item.is_nft) || []

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground">Discover, buy, and collect digital assets on the Sui blockchain</p>
          </div>

          <Button asChild>
            <Link href="/content/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload Content
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort: Recent
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {content?.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}

              {content?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No content available yet</p>
                  <Button asChild>
                    <Link href="/content/upload">Upload Content</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {musicContent.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}

              {musicContent.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No music content available yet</p>
                  <Button asChild>
                    <Link href="/content/upload">Upload Music</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="movies" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movieContent.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}

              {movieContent.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No movie content available yet</p>
                  <Button asChild>
                    <Link href="/content/upload">Upload Movie</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nftContent.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}

              {nftContent.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No NFT content available yet</p>
                  <Button asChild>
                    <Link href="/content/upload">Create NFT</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { SuiIcon } from "@/components/sui-icon"
import { Music, Film, Ticket, Wallet } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select().eq("id", user.id).single()

  // Fetch user content
  const { data: userContent } = await supabase
    .from("content")
    .select()
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user purchases
  const { data: userPurchases } = await supabase
    .from("purchases")
    .select(`
      *,
      content(*)
    `)
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false })

  // Fetch user NFTs
  const { data: userNfts } = await supabase.from("nfts").select().eq("owner_id", user.id)

  // Fetch user tickets
  const { data: userTickets } = await supabase
    .from("tickets")
    .select(`
      *,
      event:event_id(*),
      ticket_type:ticket_type_id(*)
    `)
    .eq("owner_id", user.id)

  // Fetch user bookings
  const { data: userBookings } = await supabase
    .from("bookings")
    .select()
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user royalties
  const { data: userRoyalties } = await supabase
    .from("royalty_payments")
    .select(`
      *,
      content:content_id(*)
    `)
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalContent = userContent?.length || 0
  const totalPurchases = userPurchases?.length || 0
  const totalNfts = userNfts?.length || 0
  const totalTickets = userTickets?.length || 0
  const totalRoyalties = userRoyalties?.reduce((sum, royalty) => sum + Number.parseFloat(royalty.amount), 0) || 0

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {profile?.full_name || profile?.username || user.email}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Content</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold">{totalContent}</div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Music className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Purchases</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Film className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NFTs</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold">{totalNfts}</div>
            <div className="p-2 bg-primary/10 rounded-full">
              <SuiIcon className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold">{totalTickets}</div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Royalties</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold flex items-center">
              <SuiIcon className="h-4 w-4 mr-1" />
              {totalRoyalties.toFixed(2)}
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardTabs
        userContent={userContent}
        userPurchases={userPurchases}
        userNfts={userNfts}
        userTickets={userTickets}
        userBookings={userBookings}
        userRoyalties={userRoyalties}
      />
    </div>
  )
}

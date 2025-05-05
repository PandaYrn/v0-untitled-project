"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SuiIcon } from "@/components/sui-icon"
import { ArrowUpRight, Download, RefreshCw } from "lucide-react"

export default function RoyaltiesPage() {
  const [timeframe, setTimeframe] = useState("month")

  // This would come from blockchain/API in a real implementation
  const royaltyTransactions = [
    {
      id: "tx1",
      date: "2025-03-28",
      asset: "Harmony in Chaos",
      type: "Stream",
      amount: "0.01",
      from: "0x7a4d...3f9c",
    },
    {
      id: "tx2",
      date: "2025-03-27",
      asset: "Harmony in Chaos",
      type: "Sale",
      amount: "0.15",
      from: "0x3b2e...8a7d",
    },
    {
      id: "tx3",
      date: "2025-03-25",
      asset: "Chain Reaction",
      type: "Stream",
      amount: "0.005",
      from: "0x9c1f...2b4e",
    },
    {
      id: "tx4",
      date: "2025-03-22",
      asset: "Metaverse Melodies",
      type: "NFT Royalty",
      amount: "0.25",
      from: "0x5e8f...1c7a",
    },
    {
      id: "tx5",
      date: "2025-03-20",
      asset: "Blockchain Beats",
      type: "Stream",
      amount: "0.008",
      from: "0x2d7b...4f5e",
    },
  ]

  const stats = {
    totalEarned: "1.423",
    thisMonth: "0.423",
    pendingPayout: "0.15",
    streams: "145",
    sales: "3",
    nftRoyalties: "1",
  }

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Royalties Dashboard</h1>
          <p className="text-muted-foreground">Track and manage your earnings from music, movies, and NFTs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <SuiIcon className="h-5 w-5" />
                <span className="text-2xl font-bold">{stats.totalEarned}</span>
                <span className="text-sm">SUI</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <SuiIcon className="h-5 w-5" />
                <span className="text-2xl font-bold">{stats.thisMonth}</span>
                <span className="text-sm">SUI</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <SuiIcon className="h-5 w-5" />
                <span className="text-2xl font-bold">{stats.pendingPayout}</span>
                <span className="text-sm">SUI</span>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Withdraw
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Transparent on-chain royalty payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {royaltyTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>{tx.asset}</TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <SuiIcon className="h-3 w-3" />
                          <span>{tx.amount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{tx.from}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>View your content performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="streams">Streams</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-muted-foreground text-sm">Streams</div>
                      <div className="text-xl font-bold">{stats.streams}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Sales</div>
                      <div className="text-xl font-bold">{stats.sales}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">NFT Royalties</div>
                      <div className="text-xl font-bold">{stats.nftRoyalties}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Top Earning Content</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Harmony in Chaos</span>
                        <span>0.16 SUI</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Metaverse Melodies</span>
                        <span>0.25 SUI</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Blockchain Beats</span>
                        <span>0.008 SUI</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="streams" className="pt-4">
                  <div className="space-y-2">
                    <div>Coming soon: detailed stream analytics with demographic data and platform breakdowns.</div>
                  </div>
                </TabsContent>

                <TabsContent value="sales" className="pt-4">
                  <div className="space-y-2">
                    <div>Coming soon: detailed sales analytics with geographic data and buyer analytics.</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}

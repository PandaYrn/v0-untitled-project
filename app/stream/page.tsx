"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Heart,
  ChevronDown,
  Shuffle,
  Repeat,
  VolumeX,
  ListMusic,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function StreamingPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTab, setCurrentTab] = useState("music")
  const [progress, setProgress] = useState(33)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const previousVolume = useRef(volume)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // This would come from blockchain/API in a real implementation
  const musicItems = [
    {
      id: "1",
      title: "Harmony in Chaos",
      artist: "Aurora Nights",
      cover: "/placeholder.svg?height=400&width=400",
      duration: "3:45",
    },
    {
      id: "5",
      title: "Metaverse Melodies",
      artist: "Virtual Virtuosos",
      cover: "/placeholder.svg?height=400&width=400",
      duration: "4:12",
    },
    {
      id: "6",
      title: "Chain Reaction",
      artist: "Block Producers",
      cover: "/placeholder.svg?height=400&width=400",
      duration: "3:21",
    },
  ]

  const movieItems = [
    {
      id: "2",
      title: "Digital Dreams",
      artist: "Pixel Productions",
      cover: "/placeholder.svg?height=400&width=400",
      duration: "1:45:30",
    },
    {
      id: "4",
      title: "Web3 Wonders",
      artist: "DeFi Directors",
      cover: "/placeholder.svg?height=400&width=400",
      duration: "2:15:15",
    },
  ]

  // For demo purposes, we'll just toggle play state
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (value[0] === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
      previousVolume.current = value[0]
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current)
      setIsMuted(false)
    } else {
      previousVolume.current = volume
      setVolume(0)
      setIsMuted(true)
    }
  }

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Streaming</h1>
          <p className="text-muted-foreground">Stream your purchased music and movies directly from the blockchain</p>
        </div>

        <Tabs defaultValue="music" onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
          </TabsList>

          <TabsContent value="music" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                        <Image
                          src="/placeholder.svg?height=250&width=250"
                          alt="Now Playing"
                          width={250}
                          height={250}
                          className="rounded-xl mx-auto md:mx-0"
                        />

                        <div className="flex flex-col justify-between">
                          <div>
                            <h2 className="text-2xl font-bold">Harmony in Chaos</h2>
                            <p className="text-muted-foreground">Aurora Nights</p>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Slider
                                defaultValue={[progress]}
                                max={100}
                                step={1}
                                onValueChange={(value) => setProgress(value[0])}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1:15</span>
                                <span>3:45</span>
                              </div>
                            </div>

                            <div className="flex justify-center md:justify-start items-center gap-2">
                              <Button variant="outline" size="icon" className="rounded-full">
                                <Shuffle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-full">
                                <SkipBack className="h-4 w-4" />
                              </Button>
                              <Button size="icon" className="rounded-full h-12 w-12" onClick={togglePlay}>
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-full">
                                <SkipForward className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-full">
                                <Repeat className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={toggleMute}>
                                {isMuted ? (
                                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Slider
                                defaultValue={[volume]}
                                max={100}
                                step={1}
                                className="w-24"
                                onValueChange={handleVolumeChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Your Music Library</CardTitle>
                      <Button variant="outline" size="sm">
                        <ListMusic className="h-4 w-4 mr-2" />
                        Playlists
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {musicItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-2 rounded-md ${index === 0 ? "bg-secondary/50" : "hover:bg-secondary/20"}`}
                        >
                          <div className="relative flex-shrink-0">
                            <Image
                              src={item.cover || "/placeholder.svg"}
                              alt={item.title}
                              width={60}
                              height={60}
                              className="rounded-md"
                            />
                            {index === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                <Pause className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.artist}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">{item.duration}</div>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recently Added</CardTitle>
                  <CardDescription>Your latest purchases and NFTs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {musicItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Image
                          src={item.cover || "/placeholder.svg"}
                          alt={item.title}
                          width={50}
                          height={50}
                          className="rounded-md"
                        />
                        <div>
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="movies" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video w-full bg-black">
                    <Image
                      src="/placeholder.svg?height=500&width=800"
                      alt="Movie Player"
                      width={800}
                      height={500}
                      className="w-full h-full object-contain"
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="icon" className="rounded-full h-16 w-16 bg-primary/80 hover:bg-primary">
                        <Play className="h-8 w-8 ml-0.5" />
                      </Button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h2 className="text-white text-2xl font-bold">Digital Dreams</h2>
                      <p className="text-white/80">Pixel Productions</p>

                      <div className="mt-4 space-y-2">
                        <Slider defaultValue={[0]} max={100} step={1} />
                        <div className="flex justify-between text-xs text-white/80">
                          <span>0:00</span>
                          <span>1:45:30</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white">
                            <Play className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white">
                            <SkipForward className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white">
                            <Volume2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <Button variant="ghost" size="icon" className="text-white">
                          <Maximize className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Movie Library</CardTitle>
                  <CardDescription>Your purchased and rented movies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movieItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-2 rounded-md ${index === 0 ? "bg-secondary/50" : "hover:bg-secondary/20"}`}
                      >
                        <Image
                          src={item.cover || "/placeholder.svg"}
                          alt={item.title}
                          width={80}
                          height={45}
                          className="rounded-md object-cover aspect-video"
                        />
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.artist}</p>
                          <p className="text-xs text-muted-foreground">{item.duration}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Browse More
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

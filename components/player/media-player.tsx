"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Music,
  Repeat,
  Shuffle,
} from "lucide-react"
import Image from "next/image"

export interface MediaPlayerProps {
  type: "audio" | "video"
  src: string
  title: string
  artist?: string
  coverUrl?: string
  onEnded?: () => void
  autoplay?: boolean
}

export function MediaPlayer({ type, src, title, artist, coverUrl, onEnded, autoplay = false }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousVolume = useRef(volume)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedMetadata = () => setDuration(media.duration)
    const handleTimeUpdate = () => setCurrentTime(media.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }
    const handleError = () => {
      setError("Failed to load media")
      setIsLoading(false)
    }

    media.addEventListener("loadstart", handleLoadStart)
    media.addEventListener("canplay", handleCanPlay)
    media.addEventListener("loadedmetadata", handleLoadedMetadata)
    media.addEventListener("timeupdate", handleTimeUpdate)
    media.addEventListener("ended", handleEnded)
    media.addEventListener("error", handleError)

    return () => {
      media.removeEventListener("loadstart", handleLoadStart)
      media.removeEventListener("canplay", handleCanPlay)
      media.removeEventListener("loadedmetadata", handleLoadedMetadata)
      media.removeEventListener("timeupdate", handleTimeUpdate)
      media.removeEventListener("ended", handleEnded)
      media.removeEventListener("error", handleError)
    }
  }, [onEnded])

  useEffect(() => {
    if (autoplay) {
      play()
    }
  }, [autoplay])

  const play = () => {
    if (mediaRef.current) {
      mediaRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setError("Playback failed: " + err.message)
          setIsPlaying(false)
        })
    }
  }

  const pause = () => {
    if (mediaRef.current) {
      mediaRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (mediaRef.current) {
      mediaRef.current.volume = newVolume / 100
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
      previousVolume.current = newVolume
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current)
      if (mediaRef.current) {
        mediaRef.current.volume = previousVolume.current / 100
      }
      setIsMuted(false)
    } else {
      previousVolume.current = volume
      setVolume(0)
      if (mediaRef.current) {
        mediaRef.current.volume = 0
      }
      setIsMuted(true)
    }
  }

  const handleSeek = (value: number[]) => {
    const seekTime = value[0]
    setCurrentTime(seekTime)
    if (mediaRef.current) {
      mediaRef.current.currentTime = seekTime
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch((err) => {
          setError("Fullscreen failed: " + err.message)
        })
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className={`p-0 ${type === "video" ? "bg-black" : ""}`}>
        <div ref={containerRef} className={`relative ${type === "video" ? "w-full aspect-video" : "p-6"}`}>
          {type === "audio" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                <div className="relative h-[250px] w-full md:w-[250px] rounded-xl overflow-hidden bg-muted">
                  {coverUrl ? (
                    <Image src={coverUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Music className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    {artist && <p className="text-muted-foreground">{artist}</p>}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        disabled={isLoading || !!error}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex justify-center md:justify-start items-center gap-2">
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Shuffle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="rounded-full h-12 w-12"
                        onClick={togglePlay}
                        disabled={isLoading || !!error}
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Repeat className="h-4 w-4" />
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
                      <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
                    </div>
                  </div>
                </div>
              </div>

              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={src}
                className="hidden"
                preload="metadata"
              />
            </>
          ) : (
            <>
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={src}
                className="w-full h-full object-contain"
                preload="metadata"
                onClick={togglePlay}
              />

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="bg-background p-4 rounded-md">
                    <p className="text-destructive">{error}</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h2 className="text-white text-xl font-bold">{title}</h2>
                {artist && <p className="text-white/80">{artist}</p>}

                <div className="mt-4 space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    disabled={isLoading || !!error}
                  />
                  <div className="flex justify-between text-xs text-white/80">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white"
                      onClick={togglePlay}
                      disabled={isLoading || !!error}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <div className="hidden sm:block">
                      <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

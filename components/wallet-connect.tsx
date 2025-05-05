"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SuiIcon } from "@/components/sui-icon"
import { Wallet, ArrowRight } from "lucide-react"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
}

export function WalletConnect({
  onConnect,
  buttonVariant = "default",
  buttonSize = "default",
  buttonText = "Connect Wallet",
  className,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)

    // Simulate connection delay
    setTimeout(() => {
      // Mock address - in a real implementation, this would come from the wallet
      const mockAddress =
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")

      if (onConnect) {
        onConnect(mockAddress)
      }

      setIsConnecting(false)
      setOpen(false)
    }, 1500)
  }

  const wallets = [
    { name: "Sui Wallet", icon: <SuiIcon className="h-6 w-6" /> },
    { name: "Ethos Wallet", icon: <Wallet className="h-6 w-6 text-purple-500" /> },
    { name: "Suiet Wallet", icon: <Wallet className="h-6 w-6 text-green-500" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to access the SoundWave platform and start buying, selling, and streaming content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full justify-between h-14"
              disabled={isConnecting}
              onClick={() => handleConnect(wallet.name)}
            >
              <div className="flex items-center gap-3">
                {wallet.icon}
                <span>{wallet.name}</span>
              </div>
              {isConnecting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          ))}
        </div>
        <div className="text-xs text-center text-muted-foreground">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}

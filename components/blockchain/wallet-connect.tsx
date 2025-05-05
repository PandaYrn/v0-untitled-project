"use client"

import { useState, useEffect } from "react"
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
import { Wallet, ArrowRight, Loader2 } from "lucide-react"
import { getSuiClient } from "@/lib/blockchain/sui-client"
import { getBrowserSupabaseClient } from "@/lib/supabase/client"

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
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const suiClient = getSuiClient()
  const supabase = getBrowserSupabaseClient()

  useEffect(() => {
    // Check if wallet is already connected
    const address = suiClient.getWallet()
    if (address) {
      setWalletAddress(address)
    }
  }, [])

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)

    try {
      // Connect to wallet
      const address = await suiClient.connect()
      setWalletAddress(address)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Store wallet address in blockchain_transactions table
        await supabase.from("blockchain_transactions").insert({
          user_id: user.id,
          transaction_hash: "wallet_connect_" + Date.now(),
          transaction_type: "wallet_connect",
          status: "confirmed",
          metadata: { wallet_address: address, wallet_type: walletType },
        })
      }

      if (onConnect) {
        onConnect(address)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
      setOpen(false)
    }
  }

  const handleDisconnect = () => {
    suiClient.disconnect()
    setWalletAddress(null)
  }

  const wallets = [
    { name: "Sui Wallet", icon: <SuiIcon className="h-6 w-6" /> },
    { name: "Ethos Wallet", icon: <Wallet className="h-6 w-6 text-purple-500" /> },
    { name: "Suiet Wallet", icon: <Wallet className="h-6 w-6 text-green-500" /> },
  ]

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground hidden md:block">
          {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect} className={className}>
          Disconnect
        </Button>
      </div>
    )
  }

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
              {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
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

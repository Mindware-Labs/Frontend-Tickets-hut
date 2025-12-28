"use client"

import { Button } from "@/components/ui/button"
import { LifeBuoy, Mail, Instagram } from "lucide-react"

export default function SupportPage() {
  const gmailEmail = "labsmindware@gmail.com"
  const subject = "Support"
  const body = "Hello, I need assistance with..."
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(gmailEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  const instagramUrl = "https://www.instagram.com/labsmindware/"

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">
          If you need help, send a message to our support team. We will get back to you as soon as possible.
        </p>
      </div>

      {/* Tarjeta para soporte por Gmail */}
      <div className="glass-card p-6 rounded-xl border border-border/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Contact Support</h2>
            <p className="text-sm text-muted-foreground">
              The button opens Gmail with a prefilled email so you can send your request quickly.
            </p>
          </div>
        </div>

        <Button asChild>
          <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
            <Mail className="mr-2 h-4 w-4" />
            Open support email in Gmail
          </a>
        </Button>
      </div>

      {/* Tarjeta para soporte por Instagram */}
      <div className="glass-card p-6 rounded-xl border border-border/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full text-primary">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Contact us</h2>
            <p className="text-sm text-muted-foreground">
              Send us a direct message on Instagram for quick assistance and updates.
            </p>
          </div>
        </div>
 
        <Button variant="outline" className="bg-primary/10 text-primary dark:hover:bg-primary/20 " asChild>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <Instagram className="mr-2 h-4 w-4" />
            Open Instagram
          </a>
        </Button>
      </div>
    </div>
  )
}
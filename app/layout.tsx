import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth"
import { ShopsInitializer } from "@/components/shops-initializer"
import { ConfigInitializer } from "@/components/config-initializer"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PAKO24",
  description: "Dërgesa të shpejta nga dyqanet ndërkombëtare",
  generator: 'v0.dev',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sq">
      <body className={inter.className}>
        <AuthProvider>
          <ShopsInitializer />
          <ConfigInitializer />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'

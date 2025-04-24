"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to orders page
    router.replace("/admin/orders")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Ridrejtimi në faqen e porosive...</p>
    </div>
  )
}

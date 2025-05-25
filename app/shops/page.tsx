"use client"

import Layout from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { ShopList } from "@/components/shop-list"
import { useEffect, useState } from "react"

export default function ShopsPage() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])
  
  return (
    <Layout>
      <div className={`${isMobile ? 'w-full px-0' : 'max-w-4xl mx-auto px-4'}`}>
        <Card className={`bg-white shadow-md w-full ${isMobile ? "h-[calc(100vh-120px)] rounded-none border-x-0" : ""}`}>
          <CardContent className={`${isMobile ? 'p-2' : 'p-4'} h-full`}>
            <ShopList />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

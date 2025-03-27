"use client"

import Layout from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { ShopList } from "@/components/shop-list"

export default function ShopsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-gradient bg-gradient-to-r from-primary to-secondary">
          Dyqanet Online
        </h1>

        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <ShopList />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


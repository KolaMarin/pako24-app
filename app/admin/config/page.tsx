"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Mail, Phone, MapPin, PoundSterling, Euro, Package, TruckIcon } from "lucide-react"

interface AppConfig {
  id: string
  key: string
  value: string
  description: string | null
}

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configs, setConfigs] = useState<AppConfig[]>([])
  
  // App Information
  const [appEmail, setAppEmail] = useState("")
  const [appPhone, setAppPhone] = useState("")
  const [appAddress, setAppAddress] = useState("")
  
  // Exchange Rates
  const [poundToEuroRate, setPoundToEuroRate] = useState("1.15")
  
  // Shipping Costs
  const [standardShippingCost, setStandardShippingCost] = useState("10")
  const [extraKgCost, setExtraKgCost] = useState("2.5")

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/configs")
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)
        
        // Set values from fetched configs
        data.forEach((config: AppConfig) => {
          switch (config.key) {
            case "app.email":
              setAppEmail(config.value)
              break
            case "app.phone":
              setAppPhone(config.value)
              break
            case "app.address":
              setAppAddress(config.value)
              break
            case "exchange.gbp_to_eur":
              setPoundToEuroRate(config.value)
              break
            case "shipping.standard_cost":
              setStandardShippingCost(config.value)
              break
            case "shipping.extra_kg_cost":
              setExtraKgCost(config.value)
              break
          }
        })
      } else {
        throw new Error("Failed to fetch configurations")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Marrja e konfigurimeve dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (key: string, value: string, description: string) => {
    try {
      const existingConfig = configs.find(config => config.key === key)
      
      if (existingConfig) {
        // Update existing config
        const response = await fetch(`/api/admin/configs/${existingConfig.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        })
        
        if (response.ok) {
          const updatedConfig = await response.json()
          setConfigs(configs.map(config => 
            config.id === updatedConfig.id ? updatedConfig : config
          ))
        } else {
          throw new Error(`Failed to update ${key}`)
        }
      } else {
        // Create new config
        const response = await fetch("/api/admin/configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, description }),
        })
        
        if (response.ok) {
          const newConfig = await response.json()
          setConfigs([...configs, newConfig])
        } else {
          throw new Error(`Failed to create ${key}`)
        }
      }
    } catch (error) {
      throw error
    }
  }

  const handleSaveAppInfo = async () => {
    try {
      setSaving(true)
      
      await Promise.all([
        saveConfig("app.email", appEmail, "Application email address"),
        saveConfig("app.phone", appPhone, "Application phone number"),
        saveConfig("app.address", appAddress, "Application physical address"),
      ])
      
      toast({
        title: "Sukses",
        description: "Informacionet e aplikacionit u ruajtën me sukses.",
      })
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Ruajtja e informacioneve dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveExchangeRates = async () => {
    try {
      setSaving(true)
      
      await saveConfig(
        "exchange.gbp_to_eur", 
        poundToEuroRate, 
        "Exchange rate from GBP to EUR"
      )
      
      toast({
        title: "Sukses",
        description: "Kursi i këmbimit u ruajt me sukses.",
      })
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Ruajtja e kursit të këmbimit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveShippingCosts = async () => {
    try {
      setSaving(true)
      
      await Promise.all([
        saveConfig(
          "shipping.standard_cost", 
          standardShippingCost, 
          "Standard shipping cost in EUR"
        ),
        saveConfig(
          "shipping.extra_kg_cost", 
          extraKgCost, 
          "Cost per extra kg in EUR"
        ),
      ])
      
      toast({
        title: "Sukses",
        description: "Kostot e transportit u ruajtën me sukses.",
      })
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Ruajtja e kostove të transportit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Konfigurimet</CardTitle>
            <CardDescription>
              Menaxhoni konfigurimet e aplikacionit
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="app-info" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="app-info">Informacionet</TabsTrigger>
            <TabsTrigger value="exchange-rates">Kursi i Këmbimit</TabsTrigger>
            <TabsTrigger value="shipping-costs">Kostot e Transportit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app-info">
            <Card>
              <CardHeader>
                <CardTitle>Informacionet e Aplikacionit</CardTitle>
                <CardDescription>
                  Vendosni informacionet e kontaktit dhe adresën e biznesit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="app-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="app-email"
                      type="email"
                      value={appEmail}
                      onChange={(e) => setAppEmail(e.target.value)}
                      className="pl-8"
                      placeholder="info@example.com"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="app-phone">Numri i Telefonit</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="app-phone"
                      type="tel"
                      value={appPhone}
                      onChange={(e) => setAppPhone(e.target.value)}
                      className="pl-8"
                      placeholder="+355 69 123 4567"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="app-address">Adresa</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="app-address"
                      value={appAddress}
                      onChange={(e) => setAppAddress(e.target.value)}
                      className="pl-8 min-h-[100px]"
                      placeholder="Rruga, Qyteti, Kodi Postar, Shteti"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAppInfo} disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="exchange-rates">
            <Card>
              <CardHeader>
                <CardTitle>Kursi i Këmbimit</CardTitle>
                <CardDescription>
                  Vendosni kursin e këmbimit midis monedhave
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="gbp-to-eur">Kursi GBP në EUR</Label>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <PoundSterling className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">→</span>
                      <Euro className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="gbp-to-eur"
                      type="number"
                      step="0.01"
                      min="0"
                      value={poundToEuroRate}
                      onChange={(e) => setPoundToEuroRate(e.target.value)}
                      className="pl-16"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shembull: Nëse kursi është 1.15, atëherë 1 GBP = 1.15 EUR
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveExchangeRates} disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping-costs">
            <Card>
              <CardHeader>
                <CardTitle>Kostot e Transportit</CardTitle>
                <CardDescription>
                  Vendosni kostot standarde të transportit dhe tarifat shtesë
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="standard-shipping">Kosto Standarde e Transportit (EUR)</Label>
                  <div className="relative">
                    <TruckIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="standard-shipping"
                      type="number"
                      step="0.01"
                      min="0"
                      value={standardShippingCost}
                      onChange={(e) => setStandardShippingCost(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kosto bazë e transportit për çdo porosi
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="extra-kg-cost">Kosto për Kilogram Shtesë (EUR)</Label>
                  <div className="relative">
                    <Package className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="extra-kg-cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={extraKgCost}
                      onChange={(e) => setExtraKgCost(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kosto shtesë për çdo kilogram mbi peshën standarde
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveShippingCosts} disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

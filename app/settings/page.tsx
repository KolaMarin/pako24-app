"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Save } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, updateUser, updatePassword } = useAuth()
  const [email, setEmail] = useState(user?.email || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [location, setLocation] = useState(user?.location || "")
  const [oldPassword, setOldPassword] = useState("********")
  const [newPassword, setNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/")
    }

    if (user) {
      setEmail(user.email || "")
      setPhoneNumber(user.phoneNumber || "")
      setLocation(user.location || "")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUser({ email, phoneNumber, location })
      if (oldPassword !== "********" && newPassword) {
        const success = await updatePassword(oldPassword, newPassword)
        if (!success) {
          throw new Error("Fjalëkalimi i vjetër është i pasaktë.")
        }
      }
      toast({
        title: "Sukses",
        description: "Të dhënat tuaja u përditësuan me sukses.",
      })
      setOldPassword("********")
      setNewPassword("")
    } catch (error) {
      toast({
        title: "Gabim",
        description:
          error instanceof Error ? error.message : "Përditësimi i të dhënave dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user is not logged in, don't render anything (redirect happens in useEffect)
  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">Cilësimet</h1>
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">Të Dhënat e Përdoruesit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Numri i WhatsApp
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Vendndodhja
                </label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                  Fjalëkalimi i Vjetër
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => {
                      // Only update if the user is actually typing a new password
                      if (e.target.value !== "********") {
                        setOldPassword(e.target.value)
                      }
                    }}
                    onFocus={() => {
                      if (oldPassword === "********") {
                        setOldPassword("")
                      }
                    }}
                    onBlur={() => {
                      if (oldPassword === "") {
                        setOldPassword("********")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Fjalëkalimi i Ri
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white mt-6"
              >
                {isSubmitting ? (
                  "Duke ruajtur..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Ruaj Ndryshimet
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Save, Lock, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, updateUser, updatePassword, logout } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // User info form state
  const [email, setEmail] = useState(user?.email || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [location, setLocation] = useState(user?.location || "")
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)
  
  // Password form state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    // Only update settings if user is logged in

    if (user) {
      setEmail(user.email || "")
      setPhoneNumber(user.phoneNumber || "")
      setLocation(user.location || "")
    }
  }, [user, router])

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingInfo(true)

    try {
      await updateUser({ email, phoneNumber, location })
      toast({
        title: "Sukses",
        description: "Të dhënat tuaja u përditësuan me sukses.",
      })
    } catch (error) {
      toast({
        title: "Gabim",
        description:
          error instanceof Error ? error.message : "Përditësimi i të dhënave dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingInfo(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("Fjalëkalimet e reja nuk përputhen.")
      return
    }
    
    // Validate password is not empty
    if (!newPassword) {
      setPasswordError("Ju lutemi vendosni një fjalëkalim të ri.")
      return
    }
    
    setIsSubmittingPassword(true)

    try {
      if (!oldPassword) {
        throw new Error("Për të ndryshuar fjalëkalimin, duhet të vendosni fjalëkalimin e vjetër.")
      }
      
      const success = await updatePassword(oldPassword, newPassword)
      if (!success) {
        throw new Error("Fjalëkalimi i vjetër është i pasaktë.")
      }
      
      toast({
        title: "Sukses",
        description: "Fjalëkalimi juaj u ndryshua me sukses.",
      })
      
      // Reset password fields
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Ndryshimi i fjalëkalimit dështoi.")
      toast({
        title: "Gabim",
        description: error instanceof Error ? error.message : "Ndryshimi i fjalëkalimit dështoi.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4">
          {/* Removed title for logged out users */}
          <div className="flex items-center justify-center py-10">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center p-6">
                <p className="text-center mb-4 text-gray-700">
                  Ju duhet të identifikoheni për të parë cilësimet tuaja
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Identifikohu
                </Button>
                
                {/* Login Modal */}
                <AuthModal
                  open={showAuthModal}
                  onOpenChange={setShowAuthModal}
                  defaultTab="login"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">Cilësimet</h1>
        
        {/* Section 1: User Information */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">Të Dhënat e Përdoruesit</h2>
            <form onSubmit={handleUserInfoSubmit} className="space-y-4">
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
              <Button
                type="submit"
                disabled={isSubmittingInfo}
                className="w-full bg-primary hover:bg-primary/90 text-white mt-6"
              >
                {isSubmittingInfo ? (
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
        
        {/* Section 2: Password Change */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">Ndryshimi i Fjalëkalimit</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                  Fjalëkalimi i Vjetër
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
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
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Përsëritja e Fjalëkalimit të Ri
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {passwordError && (
                <div className="text-red-500 text-sm mt-2">{passwordError}</div>
              )}
              
              <Button
                type="submit"
                disabled={isSubmittingPassword}
                className="w-full bg-primary hover:bg-primary/90 text-white mt-6"
              >
                {isSubmittingPassword ? (
                  "Duke ndryshuar..."
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Ndysho Fjalëkalimin
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Section 3: Logout Button for Mobile Users */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">Opsionet e Përdoruesit</h2>
            <Button 
              onClick={() => logout()}
              variant="outline" 
              className="w-full border-2 hover:bg-red-50 hover:text-red-700 text-red-600"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Dil nga llogaria
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

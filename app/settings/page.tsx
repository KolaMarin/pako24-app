"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { OnboardingModal } from "@/components/onboarding-modal"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Save, Lock, LogOut, HelpCircle, Mail, Phone, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useConfigStore } from "@/lib/config-store"

export default function SettingsPage() {
  const { user, updateUser, updatePassword, logout } = useAuth()
  const { configs } = useConfigStore()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  
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
          <div className="flex items-center justify-center py-10">
            <Card className="max-w-md w-full border-2 border-blue-100 shadow-xl rounded-xl">
              <CardContent className="flex flex-col items-center p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Cilësimet e Llogarisë</h2>
                <p className="text-center mb-6 text-gray-600">
                  Identifikohuni për të menaxhuar cilësimet e llogarisë tuaja dhe për të personalizuar përvojën tuaj.
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Identifikohu
                </Button>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Nuk keni llogari? <button onClick={() => {setShowAuthModal(true); setAuthModalTab('register')}} className="text-blue-600 hover:underline">Regjistrohu këtu</button>
                </p>
                
                <AuthModal
                  open={showAuthModal}
                  onOpenChange={setShowAuthModal}
                  defaultTab={authModalTab}
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
      <div className="max-w-md mx-auto px-3 space-y-4 pb-20">
        {/* How it works button */}
        <Button
          onClick={() => setShowOnboardingModal(true)}
          variant="outline"
          className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-lg shadow-sm h-11 text-sm"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Si funksionon?
        </Button>

        {/* User Information */}
        <Card className="bg-white border-2 border-gray-100 shadow-lg rounded-lg">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-primary">Të Dhënat e Përdoruesit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <form onSubmit={handleUserInfoSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg h-10 px-3 text-sm transition-all duration-200"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700">
                  Numri i WhatsApp
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg h-10 px-3 text-sm transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="location" className="block text-xs font-medium text-gray-700">
                  Vendndodhja
                </label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg h-10 px-3 text-sm transition-all duration-200"
                  required 
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmittingInfo}
                className="w-full bg-primary hover:bg-primary/90 text-white mt-4 rounded-lg shadow-sm h-10 text-sm transition-all duration-200"
              >
                {isSubmittingInfo ? (
                  "Duke ruajtur..."
                ) : (
                  <>
                    <Save className="mr-2 h-3 w-3" />
                    Ruaj Ndryshimet
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Password Change */}
        <Card className="bg-white border-2 border-gray-100 shadow-lg rounded-lg">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-primary">Ndryshimi i Fjalëkalimit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="oldPassword" className="block text-xs font-medium text-gray-700">
                  Fjalëkalimi i Vjetër
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg h-10 px-3 pr-10 text-sm transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-md h-8 w-8"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700">
                  Fjalëkalimi i Ri
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg h-10 px-3 pr-10 text-sm transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-md h-8 w-8"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
                  Përsëritja e Fjalëkalimit të Ri
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg h-10 px-3 pr-10 text-sm transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-md h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              {passwordError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 text-xs p-3 rounded-lg mt-2">
                  {passwordError}
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isSubmittingPassword}
                className="w-full bg-primary hover:bg-primary/90 text-white mt-4 rounded-lg shadow-sm h-10 text-sm transition-all duration-200"
              >
                {isSubmittingPassword ? (
                  "Duke ndryshuar..."
                ) : (
                  <>
                    <Lock className="mr-2 h-3 w-3" />
                    Ndrysho Fjalëkalimin
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 shadow-lg rounded-lg">
          <CardHeader className="pb-3 border-b border-blue-100">
            <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
              Kontakto PAKO24
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-white/80 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
                <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-700 font-semibold break-all">{configs.COMPANY_EMAIL}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/80 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
                <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-700 font-semibold">{configs.COMPANY_PHONE}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* User Options */}
        <Card className="bg-white border-2 border-gray-100 shadow-lg rounded-lg mb-20">
          <CardContent className="p-4 pt-4">
            <Button 
              onClick={() => logout()}
              variant="outline" 
              className="w-full border-2 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-red-600 rounded-lg shadow-sm h-10 text-sm transition-all duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Dil nga llogaria
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        open={showOnboardingModal} 
        onOpenChange={setShowOnboardingModal} 
      />
    </Layout>
  )
}

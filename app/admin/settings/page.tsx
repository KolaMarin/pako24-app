"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AdminUser {
  id: string
  email: string
  role: string
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  
  // Profile settings
  const [email, setEmail] = useState("")
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Form errors
  const [emailError, setEmailError] = useState("")
  const [currentPasswordError, setCurrentPasswordError] = useState("")
  const [newPasswordError, setNewPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  
  const router = useRouter()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/me")
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data)
        setEmail(data.email)
      } else {
        throw new Error("Failed to fetch user data")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Marrja e të dhënave të përdoruesit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email-i është i detyrueshëm")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email-i nuk është i vlefshëm")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePasswordChange = () => {
    let isValid = true
    
    if (!currentPassword) {
      setCurrentPasswordError("Fjalëkalimi aktual është i detyrueshëm")
      isValid = false
    } else {
      setCurrentPasswordError("")
    }
    
    if (newPassword && newPassword.length < 8) {
      setNewPasswordError("Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere")
      isValid = false
    } else {
      setNewPasswordError("")
    }
    
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Fjalëkalimet nuk përputhen")
      isValid = false
    } else {
      setConfirmPasswordError("")
    }
    
    return isValid
  }

  const handleUpdateProfile = async () => {
    if (!validateEmail()) return
    
    try {
      setSaving(true)
      
      const response = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        setCurrentUser(updatedUser)
        toast({
          title: "Sukses",
          description: "Profili u përditësua me sukses.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Gabim",
          description: errorData.message || "Përditësimi i profilit dështoi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Përditësimi i profilit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) return
    
    try {
      setSaving(true)
      
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
      
      if (response.ok) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast({
          title: "Sukses",
          description: "Fjalëkalimi u ndryshua me sukses.",
        })
      } else {
        const errorData = await response.json()
        if (errorData.code === "INVALID_CREDENTIALS") {
          setCurrentPasswordError("Fjalëkalimi aktual nuk është i saktë")
        } else {
          toast({
            title: "Gabim",
            description: errorData.message || "Ndryshimi i fjalëkalimit dështoi.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Ndryshimi i fjalëkalimit dështoi. Ju lutemi provoni përsëri.",
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
            <CardTitle>Cilësimet e Përdoruesit</CardTitle>
            <CardDescription>
              Menaxhoni të dhënat tuaja personale dhe sigurinë
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="profile">Profili</TabsTrigger>
            <TabsTrigger value="security">Siguria</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informacionet e Profilit</CardTitle>
                <CardDescription>
                  Përditësoni të dhënat tuaja personale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser && (
                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertTitle>Roli juaj: {currentUser.role}</AlertTitle>
                    <AlertDescription>
                      ID: {currentUser.id}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-8"
                      placeholder="email@example.com"
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateProfile} disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Ndryshimi i Fjalëkalimit</CardTitle>
                <CardDescription>
                  Përditësoni fjalëkalimin tuaj për të rritur sigurinë
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Fjalëkalimi Aktual</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {currentPasswordError && (
                    <p className="text-sm text-red-500">{currentPasswordError}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Fjalëkalimi i Ri</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {newPasswordError && (
                    <p className="text-sm text-red-500">{newPasswordError}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Konfirmo Fjalëkalimin</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-red-500">{confirmPasswordError}</p>
                  )}
                </div>
                
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Kujdes</AlertTitle>
                  <AlertDescription>
                    Pas ndryshimit të fjalëkalimit, do të duhet të identifikoheni përsëri.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={handleChangePassword} disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ndrysho Fjalëkalimin"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

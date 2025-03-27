"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "admin") {
      // In a real application, you would set a secure session or token here
      localStorage.setItem("adminAuthenticated", "true")
      router.push("/admin/dashboard")
    } else {
      toast({
        title: "Gabim",
        description: "Emri i përdoruesit ose fjalëkalimi është i pasaktë.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Hyr në panelin e administratorit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Emri i përdoruesit"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Fjalëkalimi"
              required
            />
            <Button type="submit" className="w-full">
              Hyr
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


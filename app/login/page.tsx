"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerLocation, setRegisterLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register } = useAuth()

  // Check if we should show registration form by default
  useEffect(() => {
    const shouldRegister = searchParams.get("register") === "true"
    if (shouldRegister) {
      setIsRegistering(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        // Check if there's a pending order
        const pendingOrder = localStorage.getItem("pendingOrder")
        if (pendingOrder && searchParams.get("pendingOrder") === "true") {
          // Submit the pending order
          await submitPendingOrder(pendingOrder)
          // Clear the pending order
          localStorage.removeItem("pendingOrder")
          router.push("/orders")
        } else {
          router.push("/")
        }
      } else {
        setError("Email-i ose fjalëkalimi është i pasaktë.")
      }
    } catch (error) {
      setError("Ndodhi një gabim. Ju lutemi provoni përsëri.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const success = await register(registerEmail, registerPhoneNumber, registerPassword, registerLocation)
      if (success) {
        // Check if there's a pending order
        const pendingOrder = localStorage.getItem("pendingOrder")
        if (pendingOrder && searchParams.get("pendingOrder") === "true") {
          // Submit the pending order
          await submitPendingOrder(pendingOrder)
          // Clear the pending order
          localStorage.removeItem("pendingOrder")

          toast({
            title: "Sukses",
            description: "Regjistrimi dhe porosia u kryen me sukses!",
          })

          router.push("/orders")
        } else {
          toast({
            title: "Sukses",
            description: "Regjistrimi u krye me sukses!",
          })
          router.push("/")
        }
      } else {
        setError("Regjistrimi dështoi. Ju lutemi provoni përsëri.")
      }
    } catch (error) {
      setError("Ndodhi një gabim. Ju lutemi provoni përsëri.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to submit the pending order
  const submitPendingOrder = async (pendingOrderJson: string) => {
    try {
      const orderData = JSON.parse(pendingOrderJson)
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Porosia juaj u dërgua me sukses. Do t'ju kontaktojmë së shpejti.",
        })
        return true
      } else {
        throw new Error("Dërgimi i porosisë dështoi")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Dërgimi i porosisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <Layout>
      <h1 className="text-4xl font-bold mb-8 text-indigo-800">
        {isRegistering ? "Regjistrohu në GlobalShopper" : "Hyr në GlobalShopper"}
      </h1>

      {searchParams.get("pendingOrder") === "true" && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-indigo-800">
          <h2 className="font-semibold text-lg mb-2">Porosia juaj është gati!</h2>
          <p>
            {isRegistering
              ? "Ju lutemi regjistrohuni për të përfunduar porosinë tuaj."
              : "Ju lutemi identifikohuni për të përfunduar porosinë tuaj."}
          </p>
        </div>
      )}

      <Card className="bg-white shadow-lg max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-indigo-700">{isRegistering ? "Regjistrohu" : "Hyr"}</CardTitle>
          <CardDescription>
            {isRegistering
              ? "Krijo një llogari të re për të përdorur GlobalShopper"
              : "Vendosni të dhënat tuaja për të hyrë në llogarinë tuaj"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <Input
                value={registerPhoneNumber}
                onChange={(e) => setRegisterPhoneNumber(e.target.value)}
                placeholder="Numri i telefonit"
                required
              />
              <Input
                value={registerLocation}
                onChange={(e) => setRegisterLocation(e.target.value)}
                placeholder="Vendndodhja"
                required
              />
              <Input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Fjalëkalimi"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? searchParams.get("pendingOrder") === "true"
                    ? "Duke regjistruar dhe dërguar porosinë..."
                    : "Duke regjistruar..."
                  : searchParams.get("pendingOrder") === "true"
                    ? "Regjistrohu dhe dërgo porosinë"
                    : "Regjistrohu"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Fjalëkalimi"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? searchParams.get("pendingOrder") === "true"
                    ? "Duke identifikuar dhe dërguar porosinë..."
                    : "Duke identifikuar..."
                  : searchParams.get("pendingOrder") === "true"
                    ? "Identifikohu dhe dërgo porosinë"
                    : "Hyr"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              {isRegistering ? "Keni një llogari? Hyni" : "Nuk keni llogari? Regjistrohuni"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}


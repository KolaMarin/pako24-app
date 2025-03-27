"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Shield, Smartphone, Mail } from "lucide-react"

export function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [method, setMethod] = useState<"sms" | "email">("sms")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const sendVerificationCode = async () => {
    // In a real implementation, this would call your API to send a verification code

    // Mock implementation
    toast({
      title: "Kodi u dërgua",
      description: `Kodi i verifikimit u dërgua në ${method === "sms" ? phoneNumber : email}`,
    })

    setCodeSent(true)
  }

  const verifyCode = async () => {
    setIsVerifying(true)

    try {
      // In a real implementation, this would call your API to verify the code

      // Mock implementation - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful verification
      setIs2FAEnabled(true)
      setCodeSent(false)
      setVerificationCode("")

      toast({
        title: "Sukses",
        description: "Verifikimi me dy faktorë u aktivizua me sukses",
      })
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Kodi i verifikimit është i pasaktë. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const disable2FA = async () => {
    // In a real implementation, this would call your API to disable 2FA

    // Mock implementation
    setIs2FAEnabled(false)

    toast({
      title: "Çaktivizuar",
      description: "Verifikimi me dy faktorë u çaktivizua",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          Verifikimi me Dy Faktorë
        </CardTitle>
        <CardDescription>Shtoni një shtresë shtesë sigurie për llogarinë tuaj</CardDescription>
      </CardHeader>
      <CardContent>
        {is2FAEnabled ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Verifikimi me dy faktorë është aktiv</p>
              <p className="text-sm text-green-700 mt-1">
                Llogaria juaj është e mbrojtur me një shtresë shtesë sigurie.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Metoda e verifikimit</p>
                <p className="text-sm text-gray-500">
                  {method === "sms" ? (
                    <span className="flex items-center gap-1 mt-1">
                      <Smartphone className="h-4 w-4" />
                      SMS në {phoneNumber}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 mt-1">
                      <Mail className="h-4 w-4" />
                      Email në {email}
                    </span>
                  )}
                </p>
              </div>
              <Button variant="outline" onClick={disable2FA}>
                Çaktivizo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch id="2fa-toggle" checked={codeSent} onCheckedChange={sendVerificationCode} />
              <Label htmlFor="2fa-toggle">Aktivizo verifikimin me dy faktorë</Label>
            </div>

            {codeSent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Metoda e verifikimit</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={method === "sms" ? "default" : "outline"}
                      onClick={() => setMethod("sms")}
                      className="justify-start"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                    <Button
                      type="button"
                      variant={method === "email" ? "default" : "outline"}
                      onClick={() => setMethod("email")}
                      className="justify-start"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                {method === "sms" ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numri i telefonit</Label>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+355 69 123 4567"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresa e emailit</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="code">Kodi i verifikimit</Label>
                    <Button variant="link" className="p-0 h-auto text-xs" onClick={sendVerificationCode}>
                      Dërgo kodin përsëri
                    </Button>
                  </div>
                  <Input
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                  />
                </div>

                <Button onClick={verifyCode} disabled={!verificationCode || isVerifying} className="w-full">
                  {isVerifying ? "Duke verifikuar..." : "Verifiko dhe Aktivizo"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreditCard, Banknote, Wallet } from "lucide-react"
import Image from "next/image"

interface PaymentMethodsProps {
  amount: number
  currency: string
  onPaymentComplete: (paymentId: string) => void
}

export function PaymentMethods({ amount, currency, onPaymentComplete }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // In a real implementation, this would integrate with a payment gateway
      // like Stripe, PayPal, or a local payment processor

      // Mock successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock payment ID
      const paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`

      onPaymentComplete(paymentId)
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metoda e Pagesës</CardTitle>
        <CardDescription>Zgjidhni si dëshironi të paguani</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-4">
          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
              <CreditCard className="h-5 w-5 mr-3 text-indigo-600" />
              <span>Kartë Krediti / Debiti</span>
            </Label>
            <div className="flex space-x-1">
              <Image src="/visa.svg" alt="Visa" width={32} height={20} />
              <Image src="/mastercard.svg" alt="Mastercard" width={32} height={20} />
            </div>
          </div>

          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
              <Banknote className="h-5 w-5 mr-3 text-green-600" />
              <span>Para në Dorëzim</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank" className="flex items-center cursor-pointer flex-1">
              <Wallet className="h-5 w-5 mr-3 text-blue-600" />
              <span>Transfertë Bankare</span>
            </Label>
          </div>
        </RadioGroup>

        {selectedMethod === "card" && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Numri i Kartës</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Data e Skadimit</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-semibold">
          Total: {currency}
          {amount.toFixed(2)}
        </div>
        <Button onClick={handlePayment} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
          {isProcessing ? "Duke procesuar..." : "Paguaj Tani"}
        </Button>
      </CardFooter>
    </Card>
  )
}


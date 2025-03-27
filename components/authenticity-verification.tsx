"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertTriangle, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function AuthenticityVerification() {
  const [serialNumber, setSerialNumber] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<"authentic" | "fake" | null>(null)
  const [productDetails, setProductDetails] = useState<{
    name: string
    brand: string
    manufactureDate: string
    retailer: string
  } | null>(null)

  const verifyProduct = async () => {
    if (!serialNumber.trim()) {
      toast({
        title: "Gabim",
        description: "Ju lutemi vendosni numrin serial të produktit",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)
    setProductDetails(null)

    try {
      // In a real implementation, this would call your API to verify the product

      // Mock implementation - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate verification result (in a real app, this would come from the API)
      if (serialNumber.startsWith("AUTH")) {
        setVerificationResult("authentic")
        setProductDetails({
          name: "Nike Air Max 270",
          brand: "Nike",
          manufactureDate: "2023-05-15",
          retailer: "FootLocker UK",
        })
      } else {
        setVerificationResult("fake")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Verifikimi dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verifiko Autenticitetin e Produktit</CardTitle>
        <CardDescription>
          Sigurohuni që produkti juaj është origjinal dhe i blerë nga burime të autorizuara
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Vendosni numrin serial të produktit"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
          <Button onClick={verifyProduct} disabled={isVerifying}>
            {isVerifying ? (
              "Duke verifikuar..."
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Verifiko
              </>
            )}
          </Button>
        </div>

        {verificationResult === "authentic" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-800">Produkt Origjinal</h3>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Ky produkt është origjinal dhe i blerë nga një burim i autorizuar.
            </p>

            {productDetails && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Detajet e Produktit</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div>Produkti:</div>
                  <div>{productDetails.name}</div>
                  <div>Marka:</div>
                  <div>{productDetails.brand}</div>
                  <div>Data e prodhimit:</div>
                  <div>{new Date(productDetails.manufactureDate).toLocaleDateString()}</div>
                  <div>Shitësi:</div>
                  <div>{productDetails.retailer}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {verificationResult === "fake" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-medium text-red-800">Kujdes: Produkt Jo-Origjinal</h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Ky numër serial nuk përputhet me asnjë produkt origjinal në sistemin tonë. Produkti mund të jetë
              falsifikim ose i blerë nga një burim i paautorizuar.
            </p>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Raporto Shitësin
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Shënim: Verifikimi i autenticitetit është i disponueshëm vetëm për produkte të caktuara nga marka të
          zgjedhura. Numri serial zakonisht gjendet në etiketën e produktit ose në ambalazh.
        </p>
      </CardContent>
    </Card>
  )
}


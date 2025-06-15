"use client"

import React, { useState, useEffect } from "react"
import { Globe, ShoppingBag, ShoppingCart, Package, Truck, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnboardingStore } from "@/lib/onboarding-store"
import { useShopsStore } from "@/lib/shops-store"
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { currentStep, setCurrentStep } = useOnboardingStore()

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {currentStep === 1 && <OnboardingStep1 onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 2 && <OnboardingStep2 onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />}
    </div>
  )
}

function OnboardingStep1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { shops, fetchShops } = useShopsStore()

  useEffect(() => {
    if (shops.length === 0) {
      fetchShops()
    }
  }, [shops.length, fetchShops])

  // Predefined brand logos to match the exact design
  const brandLogos = [
    { name: "ZARA", text: "ZARA", logoUrl: null },
    { name: "BOTTEGA VENETA", text: "BOTTEGA\nVENETA", logoUrl: null },
    { name: "FERRAGAMO", text: "FERRAGAMO", logoUrl: null },
    { name: "LUXURY", text: "L", logoUrl: null, isBlack: true },
    { name: "CHANEL", text: "CC", logoUrl: null },
    { name: "AMAZON", text: "amazon", logoUrl: null, isAmazon: true },
    { name: "MASSIMO DUTTI", text: "Massimo Dutti", logoUrl: null },
    { name: "PRADA", text: "PRADA", logoUrl: null }
  ]

  // Try to get actual logos from shops data if available
  const getBrandLogo = (brandName: string) => {
    const shop = shops.find((shop: any) => 
      shop.name.toLowerCase().includes(brandName.toLowerCase().split(' ')[0])
    )
    return shop?.logoUrl || null
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center px-4 py-6 max-w-md mx-auto">
      {/* Icon */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Globe className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-3 text-center">
        Porosit nga Çdo Dyqan në Botë
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-base mb-6 leading-relaxed text-center px-2">
        Qasje në market dhe dyqanet më të mira ndërkombëtare të dorëzuara në pragun tuaj
      </p>

      {/* Customer Count */}
      <div className="flex items-center justify-center gap-3 mb-8 bg-green-50 px-4 py-3 rounded-lg">
        <div className="flex -space-x-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
              <User className="w-3 h-3 text-gray-600" />
            </div>
          ))}
        </div>
        <span className="text-green-700 font-medium text-sm">+2.5K klientë të kënaqur</span>
      </div>

      {/* Brand Logos Grid */}
      <div className="grid grid-cols-4 gap-3 mb-8 w-full max-w-sm">
        {brandLogos.map((brand, index) => {
          const logoUrl = getBrandLogo(brand.name)
          return (
            <div key={index} className={`rounded-lg shadow-sm p-3 flex items-center justify-center h-16 ${brand.isBlack ? 'bg-black' : 'bg-white'}`}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${brand.name} logo`} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
              ) : null}
              <div className={logoUrl ? "hidden" : "block"}>
                <span className={`font-medium text-xs text-center leading-tight ${
                  brand.isBlack ? 'text-white' : 
                  brand.isAmazon ? 'text-orange-400' : 
                  brand.name === 'CHANEL' ? 'text-black font-bold text-lg' :
                  'text-black'
                }`}>
                  {brand.text === 'BOTTEGA\nVENETA' ? (
                    <div className="text-center">
                      <div>BOTTEGA</div>
                      <div>VENETA</div>
                    </div>
                  ) : brand.text}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mb-8">
        <div className="w-3 h-3 bg-blue-600 rounded-full" />
        <div className="w-3 h-3 bg-gray-300 rounded-full" />
      </div>

      {/* Continue Button */}
      <Button 
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium rounded-lg mb-4"
      >
        Vazhdo →
      </Button>

      {/* Skip */}
      <button 
        onClick={onSkip}
        className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
      >
        Kalo
      </button>
    </div>
  )
}

function OnboardingStep2({ onNext, onBack, onSkip }: { onNext: () => void; onBack: () => void; onSkip: () => void }) {
  return (
    <div className="h-screen flex flex-col justify-center items-center px-6 py-4 max-w-md mx-auto relative">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
      >
        ← Prapa
      </button>

      {/* Icon */}
      <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
        <ShoppingBag className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3 text-center">
        Proces i Thjeshtë me 3 Hapa
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-5 leading-relaxed text-center">
        Porosit, Gjurmo, Merr - Është kaq e thjeshtë
      </p>

      {/* Steps */}
      <div className="w-full space-y-3 md:space-y-4 mb-4 md:mb-5">
        {/* Step 1 */}
        <div className="flex items-start gap-3 text-left">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm md:text-base">1</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              <h3 className="font-bold text-gray-900 text-xs md:text-sm">Shto Produktet</h3>
            </div>
            <p className="text-gray-600 text-xs leading-tight">
              Vendos linkun e produktit nga dyqani online që dëshiron
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 text-left">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm md:text-base">2</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              <h3 className="font-bold text-gray-900 text-xs md:text-sm">Konfirmo Porosinë</h3>
            </div>
            <p className="text-gray-600 text-xs leading-tight">
              Rishiko detajet dhe konfirmo porosinë tënde
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3 text-left">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm md:text-base">3</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              <h3 className="font-bold text-gray-900 text-xs md:text-sm">Merr Pakon Tënde</h3>
            </div>
            <p className="text-gray-600 text-xs leading-tight">
              Ne e dërgojmë pakon direkt te dera jote
            </p>
          </div>
        </div>
      </div>

      {/* Guarantee */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4 md:mb-5 w-full">
        <div className="text-center">
          <h4 className="font-bold text-blue-900 mb-1 text-xs md:text-sm">100% Garanci Kënaqësie</h4>
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mb-4 md:mb-5">
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-300 rounded-full" />
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-600 rounded-full" />
      </div>

      {/* Start Button */}
      <Button 
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-4 text-sm md:text-base font-bold rounded-lg mb-2 md:mb-3"
      >
        FILLO TANI
      </Button>

      {/* Bottom text */}
      <p className="text-gray-500 text-xs text-center">
        Kliko për të filluar përdorimin e aplikacionit
      </p>
    </div>
  )
}

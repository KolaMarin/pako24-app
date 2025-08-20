"use client"

import React, { useState, useEffect } from "react"
import { Globe, ShoppingBag, ShoppingCart, Package, Truck, Star, User, Sparkles, Shield, Clock, ArrowRight, Store } from "lucide-react"
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
    <div className="min-h-[85vh] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
      {/* Background decorative elements - reduced for compactness */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-orange-300 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-yellow-200 rounded-full blur-md animate-pulse delay-500"></div>
      </div>
      
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

  // Predefined brand logos with enhanced styling
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
    <div className="flex flex-col justify-between items-center px-3 py-2 max-w-sm mx-auto relative z-10 min-h-[85vh]">
      {/* Main content area - more compact */}
      <div className="flex flex-col justify-center items-center w-full space-y-2">
        {/* Compact animated icon */}
        <div className="relative mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center shadow-xl border border-white/50 backdrop-blur-sm">
            <Globe className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-2 h-2 text-white" />
          </div>
        </div>

        {/* Compact title */}
        <h1 className="text-lg font-bold text-white mb-1 text-center leading-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Porosit nga Çdo Dyqan
          </span>
          <br />
          <span className="text-orange-300 text-base">në Botë</span>
        </h1>

        {/* Compact subtitle */}
        <p className="text-blue-100 text-xs mb-2 leading-relaxed text-center px-2 font-medium">
          Qasje në market dhe dyqanet më të mira ndërkombëtare
        </p>

        {/* Compact customer count */}
        <div className="flex items-center justify-center gap-2 mb-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-green-400/30 shadow-lg">
          <div className="flex -space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gradient-to-br from-white to-green-100 rounded-full border border-white flex items-center justify-center shadow-sm">
                <User className="w-2 h-2 text-green-600" />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-green-300 font-bold text-xs">+2.5K</span>
            <span className="text-green-200 text-xs">klientë</span>
          </div>
        </div>

        {/* Compact brand logos grid */}
        <div className="grid grid-cols-4 gap-1.5 mb-2 w-full max-w-xs">
          {shops.slice(0, 8).map((shop, index) => (
            <div 
              key={shop.id} 
              className="rounded-md shadow-md transition-all duration-300 flex items-center justify-center h-10 w-full backdrop-blur-sm border border-white/20 bg-white/90 overflow-hidden"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {shop.logoUrl ? (
                <img 
                  src={shop.logoUrl} 
                  alt={`${shop.name} logo`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`${shop.logoUrl ? "hidden" : "flex"} items-center justify-center w-full h-full`}>
                <Store className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section - compact */}
      <div className="flex flex-col items-center w-full space-y-2">
        {/* Compact progress dots */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm animate-pulse" />
          <div className="w-2 h-2 bg-white/40 rounded-full" />
        </div>

        {/* Compact continue button */}
        <Button 
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 text-sm font-bold rounded-lg shadow-xl hover:shadow-orange-500/25 transition-all duration-300 border border-orange-400/50"
        >
          <span className="flex items-center justify-center gap-1">
            Vazhdo <ArrowRight className="w-3 h-3" />
          </span>
        </Button>

        {/* Compact skip button */}
        <button 
          onClick={onSkip}
          className="text-white/80 hover:text-white transition-colors text-xs font-medium pb-1"
        >
          Kalo
        </button>
      </div>
    </div>
  )
}

function OnboardingStep2({ onNext, onBack, onSkip }: { onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const steps = [
    {
      icon: ShoppingCart,
      title: "Shto Produktet",
      description: "Vendos linkun e produktit nga dyqani online që dëshiron",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Package,
      title: "Konfirmo Porosinë",
      description: "Rishiko detajet dhe konfirmo porosinë tënde",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Truck,
      title: "Merr Pakon Tënde",
      description: "Ne e dërgojmë pakon direkt te dera jote",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    }
  ]

  return (
    <div className="flex flex-col px-3 py-1 max-w-sm mx-auto relative z-10 min-h-[85vh]">
      {/* Compact Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-2 left-3 text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1 font-medium z-20"
      >
        ← Prapa
      </button>

      {/* Main content area - ultra compact */}
      <div className="flex flex-col justify-center items-center w-full pt-6 space-y-1.5">
        {/* Ultra compact icon */}
        <div className="relative mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-white to-orange-50 rounded-full flex items-center justify-center shadow-xl border border-white/50 backdrop-blur-sm">
            <ShoppingBag className="w-5 h-5 text-orange-600 animate-bounce" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Clock className="w-1.5 h-1.5 text-white" />
          </div>
        </div>

        {/* Ultra compact title */}
        <h1 className="text-base font-bold text-white mb-1 text-center leading-tight">
          <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
            Proces i Thjeshtë
          </span>
          <br />
          <span className="text-orange-300 text-sm">me 3 Hapa</span>
        </h1>

        {/* Ultra compact subtitle */}
        <p className="text-blue-100 text-xs mb-1 text-center font-medium">
          Porosit, Gjurmo, Merr
        </p>

        {/* Ultra compact steps */}
        <div className="w-full space-y-1 mb-1">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div 
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-md p-2 border border-white/20 shadow-md"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`w-6 h-6 bg-gradient-to-r ${step.color} rounded-md flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-white font-bold text-xs">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <IconComponent className="w-2.5 h-2.5 text-orange-300" />
                    <h3 className="font-bold text-white text-xs">{step.title}</h3>
                  </div>
                  <p className="text-blue-100 text-xs leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ultra compact guarantee section */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-md p-2 mb-1 w-full border border-green-400/30 shadow-md">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Shield className="w-2.5 h-2.5 text-green-300" />
              <h4 className="font-bold text-green-300 text-xs">100% Garanci</h4>
            </div>
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - ultra compact */}
      <div className="flex flex-col items-center w-full space-y-1.5 pb-1 mt-auto">
        {/* Compact progress dots */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-white/40 rounded-full" />
          <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm animate-pulse" />
        </div>

        {/* Compact start button */}
        <Button 
          onClick={onNext}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 text-sm font-bold rounded-lg shadow-xl hover:shadow-green-500/25 transition-all duration-300 border border-green-400/50"
        >
          <span className="flex items-center justify-center gap-1">
            FILLO TANI <ArrowRight className="w-3 h-3" />
          </span>
        </Button>

        {/* Compact skip button */}
        <button 
          onClick={onSkip}
          className="text-white/80 hover:text-white transition-colors text-xs font-medium"
        >
          Kalo
        </button>
      </div>
    </div>
  )
}

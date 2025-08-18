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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-orange-300 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200 rounded-full blur-md animate-pulse delay-500"></div>
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
    <div className="h-screen flex flex-col justify-between items-center px-4 py-4 max-w-md mx-auto relative z-10 overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        {/* Animated icon with gradient background */}
        <div className="relative mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
            <Globe className="w-8 h-8 md:w-10 md:h-10 text-blue-600 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        {/* Enhanced title with gradient text */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center leading-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Porosit nga Çdo Dyqan
          </span>
          <br />
          <span className="text-orange-300 text-xl md:text-2xl">në Botë</span>
        </h1>

        {/* Enhanced subtitle */}
        <p className="text-blue-100 text-sm md:text-base mb-4 leading-relaxed text-center px-2 font-medium">
          Qasje në market dhe dyqanet më të mira ndërkombëtare të dorëzuara në pragun tuaj
        </p>

        {/* Enhanced customer count with better styling */}
        <div className="flex items-center justify-center gap-3 mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-green-400/30 shadow-lg">
          <div className="flex -space-x-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gradient-to-br from-white to-green-100 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <User className="w-3 h-3 text-green-600" />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-green-300 font-bold text-base">+2.5K</span>
            <span className="text-green-200 text-xs">klientë të kënaqur</span>
          </div>
        </div>

        {/* Enhanced brand logos grid with consistent sizing */}
        <div className="grid grid-cols-4 gap-2 mb-4 w-full max-w-xs">
          {shops.slice(0, 8).map((shop, index) => (
            <div 
              key={shop.id} 
              className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center h-14 w-full backdrop-blur-sm border border-white/20 bg-white/90 overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`
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
                <Store className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section with progress and buttons */}
      <div className="flex flex-col items-center w-full space-y-3">
        {/* Enhanced progress dots */}
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-md animate-pulse" />
          <div className="w-3 h-3 bg-white/40 rounded-full" />
        </div>

        {/* Enhanced continue button */}
        <Button 
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-base font-bold rounded-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 border-2 border-orange-400/50"
        >
          <span className="flex items-center justify-center gap-2">
            Vazhdo <ArrowRight className="w-4 h-4" />
          </span>
        </Button>

        {/* Enhanced skip button */}
        <button 
          onClick={onSkip}
          className="text-white/80 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform transition-transform pb-2"
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
    <div className="h-screen flex flex-col px-4 py-2 max-w-md mx-auto relative z-10 overflow-hidden">
      {/* Enhanced Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-3 left-4 text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1 font-medium hover:scale-105 transform transition-transform z-20"
      >
        ← Prapa
      </button>

      {/* Main content area - optimized for mobile height */}
      <div className="flex-1 flex flex-col justify-center items-center w-full pt-8">
        {/* Compact icon */}
        <div className="relative mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-white to-orange-50 rounded-full flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
            <ShoppingBag className="w-7 h-7 text-orange-600 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Clock className="w-2 h-2 text-white" />
          </div>
        </div>

        {/* Compact title */}
        <h1 className="text-xl font-bold text-white mb-2 text-center leading-tight">
          <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
            Proces i Thjeshtë
          </span>
          <br />
          <span className="text-orange-300 text-lg">me 3 Hapa</span>
        </h1>

        {/* Compact subtitle */}
        <p className="text-blue-100 text-sm mb-3 text-center font-medium">
          Porosit, Gjurmo, Merr - Është kaq e thjeshtë
        </p>

        {/* Compact steps */}
        <div className="w-full space-y-2 mb-3">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div 
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300"
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-white font-bold text-xs">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <IconComponent className="w-3 h-3 text-orange-300" />
                    <h3 className="font-bold text-white text-sm">{step.title}</h3>
                  </div>
                  <p className="text-blue-100 text-xs leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Compact guarantee section */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-2.5 mb-3 w-full border border-green-400/30 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-3 h-3 text-green-300" />
              <h4 className="font-bold text-green-300 text-xs">100% Garanci Kënaqësie</h4>
            </div>
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - compact */}
      <div className="flex flex-col items-center w-full space-y-2 pb-2">
        {/* Progress dots */}
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 bg-white/40 rounded-full" />
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-md animate-pulse" />
        </div>

        {/* Start button */}
        <Button 
          onClick={onNext}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 text-base font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 border-2 border-green-400/50"
        >
          <span className="flex items-center justify-center gap-2">
            FILLO TANI <ArrowRight className="w-4 h-4" />
          </span>
        </Button>

        {/* Skip button */}
        <button 
          onClick={onSkip}
          className="text-white/80 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform transition-transform pb-1"
        >
          Kalo
        </button>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { Globe, ShoppingBag, ShoppingCart, Package, Truck, Star, User, Sparkles, Shield, Clock, ArrowRight, Store, CheckCircle, TrendingUp, Award, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnboardingStore } from "@/lib/onboarding-store"
import { useShopsStore } from "@/lib/shops-store"
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  onComplete: () => void
}
const brandLogos = [
  { 
    name: "ZARA", 
    text: "ZARA", 
    logoUrl: "https://logo.clearbit.com/zara.com" 
  },
  { 
    name: "BOTTEGA VENETA", 
    text: "BOTTEGA\nVENETA", 
    logoUrl: "https://logo.clearbit.com/bottegaveneta.com"
  },
  { 
    name: "FERRAGAMO", 
    text: "FERRAGAMO", 
    logoUrl: "https://logo.clearbit.com/ferragamo.com"
  },
  { 
    name: "LOUIS VUITTON", 
    text: "LV", 
    logoUrl: "https://logo.clearbit.com/louisvuitton.com"
  },
  { 
    name: "CHANEL", 
    text: "CC", 
    logoUrl: "https://logo.clearbit.com/chanel.com"
  },
  { 
    name: "AMAZON", 
    text: "amazon", 
    logoUrl: "https://logo.clearbit.com/amazon.com"
  },
  { 
    name: "MASSIMO DUTTI", 
    text: "Massimo Dutti", 
    logoUrl: "https://logo.clearbit.com/massimodutti.com"
  },
  { 
    name: "PRADA", 
    text: "PRADA", 
    logoUrl: "https://logo.clearbit.com/prada.com"
  }
]

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
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-50/30 via-transparent to-transparent"></div>
      
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-indigo-100/25 to-purple-100/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-tr from-orange-100/25 to-pink-100/25 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>

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

  return (
    <div className="flex flex-col items-center px-4 py-5 max-w-sm mx-auto relative z-10 sm:max-w-md">
      {/* Header section */}
      <div className="flex flex-col items-center w-full space-y-3">
        {/* Premium animated icon */}
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Globe className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-2.5 h-2.5 text-white animate-spin" />
          </div>
        </div>

        {/* Premium title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Blini nga
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Çdo Dyqan</span>
            <br />
            <span className="text-lg sm:text-xl text-gray-700">Ndërkombëtar</span>
          </h1>
        </div>

        {/* Social proof */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full border-2 border-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">2,500+</div>
              <div className="text-xs text-gray-600">Klientë të kënaqur</div>
            </div>
          </div>
        </div>

        {/* Featured brands */}
        <div className="w-full">
          <h3 className="text-center text-xs font-semibold text-gray-700 mb-2">
            Markat më të kërkuara
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            {brandLogos.slice(0, 8).map((brand, index) => (
              <div
                key={brand.name}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md border border-gray-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-full h-10 bg-white rounded-md flex items-center justify-center p-1 overflow-hidden">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className={cn(
                        "w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      )}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                      loading="lazy"
                    />
                  ) : null}
                  <div className={cn(
                    "text-center font-bold text-[7px] leading-tight",
                    brand.logoUrl ? "hidden" : ""
                  )}>
                    {brand.text.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center w-full mt-5 space-y-3">
        {/* Progress indicator */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/50"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>

        {/* Continue button */}
        <Button
          onClick={onNext}
          className="w-full max-w-[280px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            Filloni <ArrowRight className="w-4 h-4" />
          </span>
        </Button>

        {/* Skip link */}
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

function OnboardingStep2({ onNext, onBack, onSkip }: { onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const steps = [
    {
      icon: ShoppingCart,
      title: "Shtoni Produkte",
      description: "Hidhni lidhjet e produkteve nga çdo dyqan online",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      accentColor: "text-indigo-600"
    },
    {
      icon: Package,
      title: "Shqyrtoni & Konfirmoni",
      description: "Kontrolloni detajet dhe konfirmoni porosinë tuaj",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      accentColor: "text-purple-600"
    },
    {
      icon: Truck,
      title: "Merrni Dërgesat",
      description: "Merrni pakon tuaj të dërguar deri në derë",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      accentColor: "text-green-600"
    }
  ]

  return (
    <div className="flex flex-col items-center px-4 py-5 max-w-sm mx-auto relative z-10 sm:max-w-md">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-3 left-3 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium z-20 text-sm"
      >
        <ArrowRight className="w-3 h-3 rotate-180" />
        Mbrapa
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center w-full space-y-3 pt-8">
        {/* Icon */}
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Proces i Thjeshtë në 3 Hapa
          </h1>
        </div>

        {/* Steps */}
        <div className="w-full space-y-2">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-md border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <IconComponent className={`w-3.5 h-3.5 ${step.accentColor}`} />
                      <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-xs leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center w-full space-y-3 mt-4">
        {/* Progress indicator */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/50"></div>
        </div>

        {/* Start button */}
        <Button
          onClick={onNext}
          className="w-full max-w-[280px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-1.5">
            Filloni Blerjen <ArrowRight className="w-4 h-4" />
          </span>
        </Button>

        {/* Skip link */}
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

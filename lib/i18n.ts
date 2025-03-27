"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

// Define available languages
export const languages = {
  sq: { name: "Shqip", flag: "🇦🇱" },
  en: { name: "English", flag: "🇬🇧" },
  it: { name: "Italiano", flag: "🇮🇹" },
  de: { name: "Deutsch", flag: "🇩🇪" },
}

export type Language = keyof typeof languages

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  sq: {
    // Albanian translations
    home: "Kryefaqja",
    orders: "Porositë e Mia",
    settings: "Cilësimet",
    login: "Hyr",
    logout: "Dil",
    register: "Regjistrohu",
    add_to_cart: "Shto në Shportë",
    checkout: "Paguaj",
    product_details: "Detajet e Produktit",
    quantity: "Sasia",
    size: "Madhësia",
    color: "Ngjyra",
    price: "Çmimi",
    total: "Totali",
    submit_order: "Dërgo Porosinë",
    order_success: "Porosia juaj u dërgua me sukses",
    order_error: "Dërgimi i porosisë dështoi",
    // Add more translations as needed
  },
  en: {
    // English translations
    home: "Home",
    orders: "My Orders",
    settings: "Settings",
    login: "Login",
    logout: "Logout",
    register: "Register",
    add_to_cart: "Add to Cart",
    checkout: "Checkout",
    product_details: "Product Details",
    quantity: "Quantity",
    size: "Size",
    color: "Color",
    price: "Price",
    total: "Total",
    submit_order: "Submit Order",
    order_success: "Your order was submitted successfully",
    order_error: "Order submission failed",
    // Add more translations as needed
  },
  it: {
    // Italian translations
    home: "Home",
    orders: "I Miei Ordini",
    settings: "Impostazioni",
    login: "Accedi",
    logout: "Esci",
    register: "Registrati",
    add_to_cart: "Aggiungi al Carrello",
    checkout: "Checkout",
    product_details: "Dettagli Prodotto",
    quantity: "Quantità",
    size: "Taglia",
    color: "Colore",
    price: "Prezzo",
    total: "Totale",
    submit_order: "Invia Ordine",
    order_success: "Il tuo ordine è stato inviato con successo",
    order_error: "Invio dell'ordine fallito",
    // Add more translations as needed
  },
  de: {
    // German translations
    home: "Startseite",
    orders: "Meine Bestellungen",
    settings: "Einstellungen",
    login: "Anmelden",
    logout: "Abmelden",
    register: "Registrieren",
    add_to_cart: "In den Warenkorb",
    checkout: "Zur Kasse",
    product_details: "Produktdetails",
    quantity: "Menge",
    size: "Größe",
    color: "Farbe",
    price: "Preis",
    total: "Gesamt",
    submit_order: "Bestellung abschicken",
    order_success: "Ihre Bestellung wurde erfolgreich übermittelt",
    order_error: "Bestellübermittlung fehlgeschlagen",
    // Add more translations as needed
  },
}

// Create context
type I18nContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("sq")

  useEffect(() => {
    // Try to get language from localStorage or browser settings
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && languages[savedLanguage]) {
      setLanguage(savedLanguage)
    } else {
      // Default to browser language if supported, otherwise use Albanian
      const browserLang = navigator.language.split("-")[0] as Language
      if (languages[browserLang]) {
        setLanguage(browserLang)
      }
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>{children}</I18nContext.Provider>
}

// Hook for using translations
export function useTranslation() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return context
}


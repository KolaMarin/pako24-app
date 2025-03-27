"use client"

import { useSearchParams } from "next/navigation"
import { ReactNode, Suspense } from "react"

// This component safely wraps useSearchParams in a Suspense boundary
export function SearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SearchParamsConsumer>{children}</SearchParamsConsumer>
    </Suspense>
  )
}

// This component actually consumes the search params
function SearchParamsConsumer({ children }: { children: ReactNode }) {
  // This will trigger the useSearchParams() hook in a component wrapped in Suspense
  const searchParams = useSearchParams()
  
  // Make searchParams available via context if needed
  // For now, we're just ensuring it's properly wrapped in Suspense
  
  return <>{children}</>
}

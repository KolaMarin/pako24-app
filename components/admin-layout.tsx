import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react" // Added import for React

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = () => {
    // In a real application, you would clear the admin session here
    localStorage.removeItem("adminAuthenticated")
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/admin/dashboard" className="flex-shrink-0 flex items-center">
                Admin Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <Button onClick={handleLogout}>Dil</Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}


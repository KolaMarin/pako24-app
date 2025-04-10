import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Verifies if the current request is from an authenticated admin user
 * @param request The Next.js request object
 * @returns The admin user object if authenticated, null otherwise
 */
export async function verifyAdminAuth(request?: NextRequest): Promise<{
  id: string;
  email: string;
  role: string;
} | null> {
  try {
    // Get the request object from the arguments or from the global context
    const req = request || (global as any).request

    // Check for admin session cookie
    const adminSession = req?.cookies.get("admin_session")?.value
    
    if (!adminSession) {
      return null
    }
    
    // In a real application, you would validate the session token
    // For this implementation, we'll just check if an admin with this session exists
    
    // Find the admin user by session
    // Note: In a real app, you would have a sessions table and proper validation
    const admin = await prisma.admin.findFirst({
      // This is a simplified example - in a real app, you'd have proper session handling
      where: {
        // Assuming the session cookie contains the admin ID for simplicity
        id: adminSession
      }
    })
    
    if (!admin) {
      return null
    }
    
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role
    }
  } catch (error) {
    console.error("Admin auth verification error:", error)
    return null
  }
}

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  email: string
  phoneNumber: string
  location: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, phoneNumber: string, password: string, location: string) => Promise<boolean>
  updateUser: (userData: { email: string; phoneNumber: string; location: string }) => Promise<void>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/check-auth')
        const data = await response.json()
        
        if (data && data.email) {
          setUser({
            email: data.email,
            phoneNumber: data.phoneNumber || '',
            location: data.location || ''
          })
        }
      } catch (error) {
        console.error('Failed to check authentication:', error)
      }
    }
    
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser({
          email: userData.email,
          phoneNumber: userData.phoneNumber || '',
          location: userData.location || ''
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const register = async (email: string, phoneNumber: string, password: string, location: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber, password, location })
      })
      
      if (response.ok) {
        const userData = await response.json()
        if (userData.success) {
          setUser({
            email: userData.user.email,
            phoneNumber: userData.user.phoneNumber || '',
            location: userData.user.location || ''
          })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const updateUser = async (userData: { email: string; phoneNumber: string; location: string }) => {
    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        setUser((prevUser) => prevUser ? { ...prevUser, ...userData } : null)
      } else {
        throw new Error('Failed to update user')
      }
    } catch (error) {
      console.error('Update user failed:', error)
      throw error
    }
  }

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      
      return response.ok
    } catch (error) {
      console.error('Update password failed:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

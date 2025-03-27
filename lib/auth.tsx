"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { store } from "./store"

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (store.validateUser(email, password)) {
      const user = store.getUserByEmail(email)
      if (user) {
        const userData = { email: user.email, phoneNumber: user.phoneNumber, location: user.location }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return true
      }
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const register = async (email: string, phoneNumber: string, password: string, location: string) => {
    const newUser = store.addUser({ email, phoneNumber, password, location })
    const userData = { email: newUser.email, phoneNumber: newUser.phoneNumber, location: newUser.location }
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    return true
  }

  const updateUser = async (userData: { email: string; phoneNumber: string; location: string }) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }))
    localStorage.setItem("user", JSON.stringify({ ...user, ...userData }))
  }

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    if (user?.email) {
      return store.updateUserPassword(user.email, oldPassword, newPassword)
    }
    return false
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


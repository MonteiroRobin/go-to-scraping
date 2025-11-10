"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INTERNAL_USER = {
  id: "internal-001",
  email: "contact@go-to-agency.com",
  password: "GTA2024!Scraper",
  name: "Go To Agency",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount (client-side only)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === INTERNAL_USER.email && password === INTERNAL_USER.password) {
      const userWithoutPassword = {
        id: INTERNAL_USER.id,
        email: INTERNAL_USER.email,
        name: INTERNAL_USER.name,
      }
      setUser(userWithoutPassword)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      }
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

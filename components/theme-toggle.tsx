"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
      className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </Button>
  )
}

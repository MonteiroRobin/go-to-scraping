"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-border z-50">
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

export function ReadingProgress({ target }: { target: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector(target)
      if (!element) return

      const rect = element.getBoundingClientRect()
      const elementHeight = element.scrollHeight
      const viewportHeight = window.innerHeight

      const scrolled = Math.max(0, -rect.top)
      const total = elementHeight - viewportHeight
      const percentage = Math.min(100, Math.max(0, (scrolled / total) * 100))

      setProgress(percentage)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [target])

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 h-48 w-1 bg-border rounded-full overflow-hidden hidden lg:block">
      <div
        className="w-full bg-primary transition-all duration-150"
        style={{ height: `${progress}%` }}
      />
    </div>
  )
}

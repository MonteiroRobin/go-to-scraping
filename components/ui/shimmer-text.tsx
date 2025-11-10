"use client"

import { cn } from "@/lib/utils"

interface ShimmerTextProps {
  children: React.ReactNode
  className?: string
  shimmerClassName?: string
}

export function ShimmerText({ children, className, shimmerClassName }: ShimmerTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block bg-gradient-to-r from-primary via-primary/60 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer",
        className
      )}
    >
      {children}
    </span>
  )
}

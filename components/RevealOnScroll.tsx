"use client"

import { useEffect, useRef, useState } from "react"

interface RevealOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
}

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  direction = 'up'
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)'

    switch (direction) {
      case 'up': return 'translate(0, 50px)'
      case 'down': return 'translate(0, -50px)'
      case 'left': return 'translate(50px, 0)'
      case 'right': return 'translate(-50px, 0)'
      case 'fade': return 'translate(0, 0)'
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
      }}
    >
      {children}
    </div>
  )
}

export function StaggeredReveal({
  children,
  className = "",
  staggerDelay = 100
}: {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}) {
  return (
    <div className={className}>
      {Array.isArray(children) && children.map((child, index) => (
        <RevealOnScroll key={index} delay={index * staggerDelay}>
          {child}
        </RevealOnScroll>
      ))}
    </div>
  )
}

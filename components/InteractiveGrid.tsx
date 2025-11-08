"use client"

import { useState } from "react"

export function InteractiveGrid() {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)

  const cells = Array.from({ length: 100 }, (_, i) => i)

  return (
    <div className="absolute inset-0 -z-10 opacity-10 overflow-hidden pointer-events-none">
      <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
        {cells.map((cell) => (
          <div
            key={cell}
            className="border border-foreground/10 transition-all duration-500"
            style={{
              backgroundColor: hoveredCell === cell ? "currentColor" : "transparent",
              opacity: hoveredCell !== null && Math.abs(hoveredCell - cell) < 12 ? 0.3 : 0.05,
            }}
            onMouseEnter={() => setHoveredCell(cell)}
          />
        ))}
      </div>
    </div>
  )
}

export function FloatingDots() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
  }))

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-1 h-1 bg-primary rounded-full opacity-20"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animation: `float ${dot.duration}s ease-in-out infinite`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -20px); }
          50% { transform: translate(-20px, 20px); }
          75% { transform: translate(30px, 10px); }
        }
      `}</style>
    </div>
  )
}

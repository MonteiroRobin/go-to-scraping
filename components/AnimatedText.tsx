"use client"

import { useEffect, useState } from "react"

export function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const words = text.split(" ")

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-2">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="inline-block transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${(wordIndex * 50) + (charIndex * 30)}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-0 left-0 -z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-150"
        style={{
          color: "#00ff00",
          transform: "translate(-2px, -2px)",
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 -z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-150"
        style={{
          color: "#ff00ff",
          transform: "translate(2px, 2px)",
        }}
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  )
}

export function TypewriterText({
  text,
  className = "",
  speed = 50
}: {
  text: string
  className?: string
  speed?: number
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

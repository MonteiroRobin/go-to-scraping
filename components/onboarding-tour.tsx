"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TourStep {
  target: string
  title: string
  content: string
  position?: "top" | "bottom" | "left" | "right"
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "#city-input",
    title: "1. Recherchez une ville",
    content: "Tapez le nom d'une ville française. L'autocomplétion vous aidera à trouver la bonne localisation.",
    position: "bottom"
  },
  {
    target: "#map-zone-button",
    title: "2. Ou dessinez une zone personnalisée",
    content: "Cliquez sur 'Sélectionner zone', puis dessinez un rectangle sur la carte pour cibler une zone précise.",
    position: "bottom"
  },
  {
    target: "#results-section",
    title: "3. Consultez vos résultats",
    content: "Les commerces trouvés s'affichent ici avec leurs coordonnées. Vous pouvez les exporter en CSV ou les copier.",
    position: "top"
  },
  {
    target: "#history-button",
    title: "4. Accédez à votre historique",
    content: "Toutes vos recherches sont sauvegardées ici. Vous pouvez les réexécuter ou les exporter.",
    position: "bottom"
  }
]

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboarding")
    if (!hasSeenTour) {
      setTimeout(() => setIsActive(true), 1000)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep]
      const element = document.querySelector(step.target)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [currentStep, isActive])

  if (!isActive) return null

  const currentTourStep = TOUR_STEPS[currentStep]
  const isLastStep = currentStep === TOUR_STEPS.length - 1

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    setIsActive(false)
  }

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    setIsActive(false)
  }

  const getTooltipPosition = () => {
    if (!targetRect) return {}

    const position = currentTourStep.position || "bottom"
    const padding = 16

    switch (position) {
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)"
        }
      case "top":
        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)"
        }
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + padding,
          transform: "translateY(-50%)"
        }
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: "translateY(-50%)"
        }
      default:
        return {}
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Highlight */}
      {targetRect && (
        <div
          className="fixed z-[101] pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)",
            borderRadius: "12px",
            transition: "all 0.3s ease"
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="fixed z-[102] w-[90vw] max-w-md p-6 shadow-2xl border-2 border-blue-500"
        style={getTooltipPosition()}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{currentTourStep.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentTourStep.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="hover:bg-muted"
              aria-label="Fermer le tutoriel"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-500" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Passer
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center text-xs text-muted-foreground">
            Étape {currentStep + 1} sur {TOUR_STEPS.length}
          </div>
        </div>
      </Card>
    </>
  )
}

export function ResetOnboardingButton() {
  const handleReset = () => {
    localStorage.removeItem("hasSeenOnboarding")
    window.location.reload()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReset}>
      Revoir le tutoriel
    </Button>
  )
}

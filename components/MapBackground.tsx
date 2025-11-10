"use client"

import { useEffect, useRef } from "react"

export function MapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener("resize", updateSize)

    // Generate realistic street map
    const streets: {
      x1: number
      y1: number
      x2: number
      y2: number
      width: number
      type: "main" | "secondary"
    }[] = []

    // Main streets (vertical)
    for (let x = 100; x < canvas.width; x += 200) {
      streets.push({
        x1: x,
        y1: 0,
        x2: x + (Math.random() - 0.5) * 50,
        y2: canvas.height,
        width: Math.random() * 3 + 4,
        type: "main",
      })
    }

    // Main streets (horizontal)
    for (let y = 100; y < canvas.height; y += 200) {
      streets.push({
        x1: 0,
        y1: y,
        x2: canvas.width,
        y2: y + (Math.random() - 0.5) * 50,
        width: Math.random() * 3 + 4,
        type: "main",
      })
    }

    // Secondary streets
    for (let i = 0; i < 30; i++) {
      const isVertical = Math.random() > 0.5
      if (isVertical) {
        const x = Math.random() * canvas.width
        streets.push({
          x1: x,
          y1: Math.random() * canvas.height * 0.3,
          x2: x + (Math.random() - 0.5) * 30,
          y2: Math.random() * canvas.height * 0.3 + canvas.height * 0.4,
          width: Math.random() * 2 + 1.5,
          type: "secondary",
        })
      } else {
        const y = Math.random() * canvas.height
        streets.push({
          x1: Math.random() * canvas.width * 0.3,
          y1: y,
          x2: Math.random() * canvas.width * 0.3 + canvas.width * 0.4,
          y2: y + (Math.random() - 0.5) * 30,
          width: Math.random() * 2 + 1.5,
          type: "secondary",
        })
      }
    }

    // Buildings (blocks between streets)
    const buildings: { x: number; y: number; w: number; h: number }[] = []
    for (let i = 0; i < 50; i++) {
      buildings.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: Math.random() * 80 + 40,
        h: Math.random() * 80 + 40,
      })
    }

    // Map markers (pins)
    const markers: { x: number; y: number; size: number; pulse: number }[] = []
    for (let i = 0; i < 30; i++) {
      markers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    // Fishing hook (hameçon) configuration
    const hooks: {
      x: number
      y: number
      targetX: number
      targetY: number
      caught: boolean
      markerIndex: number
    }[] = []

    // Create 5 fishing hooks
    for (let i = 0; i < 5; i++) {
      const markerIndex = Math.floor(Math.random() * markers.length)
      hooks.push({
        x: Math.random() * canvas.width,
        y: -50,
        targetX: markers[markerIndex].x,
        targetY: markers[markerIndex].y,
        caught: false,
        markerIndex,
      })
    }

    let animationFrame: number
    let time = 0

    const animate = () => {
      if (!ctx) return
      time += 0.01

      // Clear canvas with map background color
      ctx.fillStyle = "#f5f5f5"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw buildings (quartiers) - lignes plus fines
      buildings.forEach((building) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.04)"
        ctx.fillRect(building.x, building.y, building.w, building.h)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"
        ctx.lineWidth = 0.5
        ctx.strokeRect(building.x, building.y, building.w, building.h)
      })

      // Draw streets - lignes noires plus fines
      streets.forEach((street) => {
        // Street base - noir fin
        ctx.strokeStyle =
          street.type === "main" ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.08)"
        ctx.lineWidth = street.type === "main" ? street.width * 0.5 : street.width * 0.4
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(street.x1, street.y1)
        ctx.lineTo(street.x2, street.y2)
        ctx.stroke()

        // Street center line - encore plus fine
        if (street.type === "main") {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.05)"
          ctx.lineWidth = 0.3
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.moveTo(street.x1, street.y1)
          ctx.lineTo(street.x2, street.y2)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

      // Draw markers (location pins) - plus gros et plus visibles
      markers.forEach((marker, index) => {
        const isCaught = hooks.some((h) => h.caught && h.markerIndex === index)

        if (!isCaught) {
          const pulse = Math.sin(marker.pulse + time * 2) * 0.3 + 0.7
          const size = marker.size * 3 // 3x plus gros

          // Pin base (shadow)
          ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.6})`
          ctx.beginPath()
          ctx.arc(marker.x, marker.y, size, 0, Math.PI * 2)
          ctx.fill()

          // Pin head
          ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.9})` // Rouge visible
          ctx.beginPath()
          ctx.arc(marker.x, marker.y - size, size * 1.2, 0, Math.PI * 2)
          ctx.fill()

          // Pin outline
          ctx.strokeStyle = `rgba(220, 38, 38, ${pulse})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })

      // Animate and draw fishing hooks
      hooks.forEach((hook) => {
        if (!hook.caught) {
          // Move hook towards target
          const dx = hook.targetX - hook.x
          const dy = hook.targetY - hook.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 2) {
            hook.x += dx * 0.02
            hook.y += dy * 0.02
          } else {
            hook.caught = true
          }
        } else {
          // Pull up the caught marker
          hook.y -= 1
          if (hook.y < -100) {
            // Reset hook
            hook.caught = false
            hook.x = Math.random() * canvas.width
            hook.y = -50
            hook.markerIndex = Math.floor(Math.random() * markers.length)
            hook.targetX = markers[hook.markerIndex].x
            hook.targetY = markers[hook.markerIndex].y
          }
        }

        // Draw fishing line - plus épaisse et visible
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(hook.x, 0)
        ctx.lineTo(hook.x, hook.y)
        ctx.stroke()

        // Draw SVG hook shape (hameçon)
        ctx.save()
        ctx.translate(hook.x, hook.y)
        ctx.scale(0.02, 0.02) // Scale SVG (original is 2048x2048)

        // SVG path from hamecon-edited.svg (black hook without white background)
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"

        const hookPath = new Path2D("M 1197.16 208.414 C 1217.27 207.183 1243.58 206.243 1263.36 208.666 C 1467.06 233.616 1569.52 469.599 1449.51 635.472 C 1415.42 682.595 1354.37 729.015 1296.92 738.07 C 1295.01 757.252 1295.81 790.322 1295.8 810.171 L 1295.8 934.129 L 1295.83 1332.59 L 1295.84 1422.08 C 1295.85 1468.93 1297.1 1505.23 1286.38 1551.5 C 1270.86 1619.39 1236.73 1681.61 1187.83 1731.19 C 1118.11 1801.86 1022.82 1841.42 923.548 1840.92 C 907.359 1840.9 883.63 1840.23 867.774 1838.04 C 787.921 1826.37 713.917 1789.39 656.636 1732.55 C 593.8 1668.88 555.252 1585.22 547.69 1496.09 C 545.655 1473.59 546.045 1448.7 546.06 1426.02 L 546.064 1339.95 L 546.166 1099.5 C 546.059 1063.98 544.45 1027.44 549.943 992.453 C 557.853 1012.14 570.569 1027.73 582.515 1045.4 L 619.047 1100.29 L 761.034 1313.34 C 777.936 1338.89 804.681 1372.56 812.826 1400.15 C 798.652 1397.56 773.637 1397.99 758.841 1397.99 L 685.311 1398.08 C 681.923 1422.43 683.323 1441.18 682.828 1464.37 C 679.459 1622.09 837.277 1745.93 989.094 1696.9 C 1032 1683.04 1066.08 1664.01 1096.94 1630.44 C 1128.16 1595.95 1149.15 1553.44 1157.56 1507.69 C 1163.73 1473.48 1162 1424.76 1161.97 1388.99 L 1161.94 1228.21 L 1161.96 926.283 C 1161.96 864.968 1163.1 800.707 1160.73 739.694 C 1124.76 733.266 1077.1 703.815 1050.03 681.039 C 937.359 586.243 926.875 406.698 1024.86 297.6 C 1067.55 250.06 1131.91 213.051 1197.16 208.414 z")

        ctx.translate(-1024, -1024) // Center the hook
        ctx.fill(hookPath)

        ctx.restore()

        // If caught, draw the marker being pulled - rouge et visible
        if (hook.caught) {
          const marker = markers[hook.markerIndex]
          const size = marker.size * 4

          // Glow effect
          ctx.fillStyle = "rgba(239, 68, 68, 0.3)"
          ctx.beginPath()
          ctx.arc(hook.x, hook.y + 20, size * 2, 0, Math.PI * 2)
          ctx.fill()

          // Marker caught
          ctx.fillStyle = "rgba(239, 68, 68, 0.9)"
          ctx.beginPath()
          ctx.arc(hook.x, hook.y + 20, size, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = "rgba(220, 38, 38, 1)"
          ctx.lineWidth = 3
          ctx.stroke()
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    />
  )
}

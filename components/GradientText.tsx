"use client"

export function GradientText({
  children,
  className = "",
  animated = true
}: {
  children: React.ReactNode
  className?: string
  animated?: boolean
}) {
  return (
    <span
      className={`bg-gradient-to-r from-foreground via-foreground/60 to-foreground bg-clip-text text-transparent ${
        animated ? 'animate-gradient bg-[length:200%_auto]' : ''
      } ${className}`}
    >
      {children}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </span>
  )
}

export function ShimmerText({
  children,
  className = ""
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
        style={{
          backgroundSize: '200% 100%',
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </span>
  )
}

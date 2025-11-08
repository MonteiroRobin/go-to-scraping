export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-label="Illustration représentant le scraping de données"
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#grid)" />

      {/* Map pins (commerces) */}
      <g className="animate-pulse">
        <circle cx="200" cy="200" r="6" fill="currentColor" opacity="0.3"/>
        <circle cx="350" cy="180" r="6" fill="currentColor" opacity="0.3"/>
        <circle cx="450" cy="250" r="6" fill="currentColor" opacity="0.3"/>
        <circle cx="300" cy="320" r="6" fill="currentColor" opacity="0.3"/>
        <circle cx="550" cy="300" r="6" fill="currentColor" opacity="0.3"/>
      </g>

      {/* Data flow lines */}
      <g className="animate-pulse" style={{animationDelay: '0.5s'}}>
        <path d="M200 200 Q 250 150 400 150" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeDasharray="5,5"/>
        <path d="M350 180 Q 400 160 400 150" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeDasharray="5,5"/>
        <path d="M450 250 Q 430 200 400 150" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeDasharray="5,5"/>
      </g>

      {/* Central data hub */}
      <circle cx="400" cy="150" r="40" fill="currentColor" opacity="0.1"/>
      <circle cx="400" cy="150" r="30" fill="currentColor" opacity="0.15"/>
      <circle cx="400" cy="150" r="20" fill="currentColor" opacity="0.2"/>

      {/* Export arrows */}
      <g className="animate-pulse" style={{animationDelay: '1s'}}>
        <path d="M440 150 L 600 150" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
        <path d="M590 140 L 600 150 L 590 160" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
      </g>

      {/* Document representation */}
      <rect x="620" y="120" width="120" height="60" rx="8" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <line x1="640" y1="140" x2="720" y2="140" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <line x1="640" y1="155" x2="720" y2="155" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <line x1="640" y1="170" x2="680" y2="170" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
    </svg>
  )
}

export function DataFlowAnimation() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-label="Animation de flux de données"
    >
      {/* Animated data points */}
      <circle cx="50" cy="150" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '2s'}} />
      <circle cx="100" cy="130" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '2.5s', animationDelay: '0.3s'}} />
      <circle cx="150" cy="170" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '3s', animationDelay: '0.6s'}} />
      <circle cx="200" cy="140" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '2.2s', animationDelay: '0.9s'}} />
      <circle cx="250" cy="160" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '2.8s', animationDelay: '1.2s'}} />
      <circle cx="300" cy="145" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '3.2s', animationDelay: '1.5s'}} />
      <circle cx="350" cy="155" r="4" fill="currentColor" className="animate-ping" style={{animationDuration: '2.5s', animationDelay: '1.8s'}} />

      {/* Flow line */}
      <path
        d="M 0 150 Q 50 130 100 130 T 200 140 T 300 145 T 400 155"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.2"
        strokeDasharray="5,5"
      />
    </svg>
  )
}

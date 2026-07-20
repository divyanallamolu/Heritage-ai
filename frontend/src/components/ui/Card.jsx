export function Card({ children, className = "", hover = true }) {
  const baseClasses = "rounded-3xl border bg-white/90 shadow-md transition-all duration-300"
  const hoverClasses = hover ? "hover:shadow-xl hover:scale-[1.01]" : ""
  const paddingClasses = "p-6 md:p-8"
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  )
}

export function CompactCard({ children, className = "", hover = true }) {
  const baseClasses = "rounded-2xl border bg-white/90 shadow-sm transition-all duration-300"
  const hoverClasses = hover ? "hover:shadow-md hover:scale-[1.01]" : ""
  const paddingClasses = "p-5"
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  )
}

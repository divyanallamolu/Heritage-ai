export function Section({ children, className = "", py = "desktop" }) {
  const paddingClasses = py === "desktop" ? "py-20 md:py-20" : "py-14 md:py-20"
  
  return (
    <section className={`${paddingClasses} ${className}`}>
      {children}
    </section>
  )
}

export function SpacedSection({ children, className = "" }) {
  return (
    <section className="py-14 md:py-20 space-y-16 {className}">
      {children}
    </section>
  )
}

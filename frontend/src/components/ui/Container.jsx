export function Container({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-6 md:px-10 lg:px-16 ${className}`}>
      {children}
    </div>
  )
}

export function WideContainer({ children, className = "" }) {
  return (
    <div className={`max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 ${className}`}>
      {children}
    </div>
  )
}

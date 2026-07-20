export function Button({ children, variant = "primary", className = "", ...props }) {
  const baseClasses = "rounded-xl h-12 px-6 font-semibold shadow transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95"
  
  const variants = {
    primary: "bg-[#2f5233] hover:bg-[#203923] text-white border border-[#d4af37]/20",
    secondary: "bg-white hover:bg-[#faf7f0] text-gray-700 border border-[#e5ddc8]",
    outline: "bg-transparent hover:bg-[#faf7f0] text-[#2f5233] border border-[#2f5233]",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
  }
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function SmallButton({ children, variant = "primary", className = "", ...props }) {
  const baseClasses = "rounded-lg h-10 px-4 font-semibold shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 text-xs"
  
  const variants = {
    primary: "bg-[#2f5233] hover:bg-[#203923] text-white border border-[#d4af37]/20",
    secondary: "bg-white hover:bg-[#faf7f0] text-gray-700 border border-[#e5ddc8]",
    outline: "bg-transparent hover:bg-[#faf7f0] text-[#2f5233] border border-[#2f5233]",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
  }
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

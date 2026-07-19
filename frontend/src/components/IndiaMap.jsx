import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { indiaMapPaths } from "./indiaMapPaths"

function IndiaMap({ activeState, onStateClick, stateCounts = {} }) {
  const [hoveredState, setHoveredState] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 15,
      })
    }
  }

  return (
    <div className="relative w-full bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[500px]">
      
      {/* Card Header */}
      <div>
        <h3 className="text-sm font-bold text-[#2f5233] flex items-center justify-between">
          <span className="flex items-center gap-1">📍 Interactive Heritage Map</span>
          {activeState && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStateClick(null)
              }}
              className="text-[10px] bg-[#8a9a5b]/15 hover:bg-[#8a9a5b]/30 text-[#2f5233] py-0.5 px-2 rounded-lg font-bold transition cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </h3>
        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
          Click states to filter analytics by location
        </p>
      </div>

      {/* Map Graphic Container (Vertically & Horizontally Centered, No empty stretch) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-[380px] flex items-center justify-center overflow-hidden mt-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 569 779"
          className="h-full select-none max-w-full"
        >
          <g>
            {indiaMapPaths.map((state) => {
              const count = stateCounts[state.name] || 0
              const isActive = activeState?.toLowerCase() === state.name.toLowerCase()
              const hasStories = count > 0

              // Dynamic coloring based on state
              let fillColor = "#ecebe5" // Default empty
              if (isActive) {
                fillColor = "#d4af37" // Active selection (Gold)
              } else if (hasStories) {
                fillColor = "#8a9a5b" // Has stories (Sage Green)
              }

              return (
                <motion.path
                  key={state.id}
                  d={state.d}
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 1.8 : 0.7}
                  strokeLinejoin="round"
                  style={{ cursor: "pointer" }}
                  whileHover={{
                    fill: isActive ? "#d4af37" : hasStories ? "#2f5233" : "#c4c2b7",
                    stroke: "#d4af37",
                    strokeWidth: 1.5,
                    transition: { duration: 0.15 },
                  }}
                  onMouseEnter={() =>
                    setHoveredState({
                      name: state.name,
                      count,
                    })
                  }
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onStateClick(state.name)}
                />
              )
            })}
          </g>
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredState && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: "absolute",
                left: tooltipPos.x,
                top: tooltipPos.y,
                pointerEvents: "none",
              }}
              className="z-30 bg-[#2f5233] text-white py-1.5 px-2.5 rounded-lg shadow-lg text-[10px] font-bold border border-[#d4af37]/35 flex flex-col min-w-[110px]"
            >
              <span className="text-[#faf7f0]">{hoveredState.name}</span>
              <span className="text-[#dfb15b] mt-0.5">
                {hoveredState.count} {hoveredState.count === 1 ? "Story" : "Stories"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Block */}
      <div className="flex gap-4 justify-center text-[9px] text-gray-400 font-extrabold uppercase border-t border-[#e5ddc8]/30 pt-2.5 mt-1.5">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-[#ecebe5] inline-block" />
          <span>Empty</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-[#8a9a5b] inline-block" />
          <span>Stories</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-[#d4af37] inline-block" />
          <span>Filter</span>
        </div>
      </div>

    </div>
  )
}

export default IndiaMap

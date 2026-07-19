import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Volume2, Sparkle, BarChart3, Database, Mic } from "lucide-react"
import { CENTRAL_STORIES } from "../data/stories"
import { getInitials } from "../utils/helpers"

function HeroSection() {
  // Dynamically calculate statistics from central stories dataset
  const totalStoriesCount = CENTRAL_STORIES.length
  const languagesCount = new Set(CENTRAL_STORIES.map((s) => s.language).filter(Boolean)).size
  const statesCount = new Set(CENTRAL_STORIES.map((s) => s.state).filter(Boolean)).size

  // Load the first story dynamically for the interactive preview card
  const previewStory = CENTRAL_STORIES[0] || {
    elder_name: "Lakshmi Devi",
    age: 82,
    state: "Andhra Pradesh",
    category: "Handicrafts",
    transcript: "A single saree takes three weeks of devotion. When spinning, every thread carries the folklore of our ancestors..."
  }

  return (
    <section className="mt-0 mb-20 border-b border-[#e5ddc8]/40 bg-gradient-to-b from-[#faf7f0] to-[#f0ead9]/40 lg:mb-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:gap-16 lg:px-8 lg:py-24">
        
        {/* Left Column (45% Width) */}
        <div className="flex w-full flex-col justify-center space-y-7 text-left lg:w-[46%]">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-[#2f5233]/8 border border-[#2f5233]/20 px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold text-[#2f5233] uppercase tracking-widest w-fit shadow-sm"
          >
            <Sparkles size={11} className="text-[#d4af37]" />
            <span>Preserving Oral History with AI</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="max-w-[650px] text-4xl font-black leading-[1.08] tracking-[-0.035em] text-[#2f5233] sm:text-5xl xl:text-[3.75rem]"
          >
            Every Elder has a Story.
            <br />
            Keep Their <span className="text-[#d4af37] relative inline-block">Wisdom<span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#d4af37]/30 rounded" /></span> Alive.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl text-sm font-light leading-7 text-gray-600 sm:text-[15px]"
          >
            HeritageAI transforms spoken memories into a searchable, interactive digital archive. Document traditions, dialects, and recipes before they disappear.
          </motion.p>

          {/* Large CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center"
          >
            <Link
              to="/interview"
              className="group flex min-h-14 w-full items-center justify-center gap-2.5 rounded-lg border border-[#d4af37]/30 bg-[#2f5233] px-7 py-4 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_12px_24px_rgba(47,82,51,0.24)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#203f29] hover:shadow-[0_18px_30px_rgba(47,82,51,0.32)] active:translate-y-0 active:scale-[0.98] sm:w-auto"
            >
              <Mic size={16} className="text-[#dfb15b] transition-transform duration-200 group-hover:rotate-[-8deg]" />
              Start Recording
            </Link>
            <Link
              to="/library"
              className="flex min-h-14 w-full items-center justify-center rounded-lg border border-[#2f5233]/35 bg-white/70 px-7 py-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2f5233] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#2f5233] hover:bg-white hover:shadow-md active:translate-y-0 active:scale-[0.98] sm:w-auto"
            >
              Browse Library
            </Link>
          </motion.div>

          {/* Dynamic Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid max-w-xl grid-cols-3 gap-3 pt-6 sm:gap-4"
          >
            {[
              { label: "Stories Preserved", value: `${totalStoriesCount}+` },
              { label: "Folk Languages", value: `${languagesCount}+` },
              { label: "States Covered", value: `${statesCount}+` }
            ].map((indicator) => (
              <div key={indicator.label} className="min-w-0 rounded-xl border border-[#e5ddc8]/70 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-xl font-black tracking-tight text-[#2f5233]">{indicator.value}</p>
                <p className="mt-0.5 text-[8px] font-bold uppercase leading-tight tracking-[0.09em] text-gray-400 sm:text-[9px]">{indicator.label}</p>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Right Column (55% Width) */}
        <div className="relative flex h-[440px] w-full flex-1 items-center justify-center overflow-hidden rounded-3xl border border-[#e5ddc8]/70 bg-[#f2edd9]/60 shadow-[0_24px_60px_rgba(47,82,51,0.14)] sm:h-[520px] lg:h-[560px] lg:w-[54%]">
          
          {/* Dashboard grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_28px]" />
          
          {/* Subtle radial visual glows */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#8a9a5b]/15 rounded-full filter blur-3xl opacity-80 pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] bg-[#d4af37]/10 rounded-full filter blur-3xl opacity-80 pointer-events-none" />

          {/* Decorative traditional heritage graphic */}
          <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none flex items-center justify-center">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#2f5233]">
              <circle cx="50" cy="50" r="45" />
              <circle cx="50" cy="50" r="35" />
              <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" />
            </svg>
          </div>

          {/* Background Connection Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-35 z-0 pointer-events-none text-[#8a9a5b]">
            <path
              d="M 80 180 Q 200 140 220 240"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <path
              d="M 480 380 Q 380 320 280 280"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <path
              d="M 220 430 Q 250 350 240 280"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Card A: Dynamic Large Central Heritage Story Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, 6, 0] }}
            transition={{
              scale: { duration: 0.6, delay: 0.1 },
              opacity: { duration: 0.6, delay: 0.1 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
            }}
            className="absolute z-20 w-[calc(100%-3rem)] max-w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#e5ddc8] bg-white/95 p-6 shadow-2xl backdrop-blur left-1/2 top-1/2 animate-float"
          >
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#2f5233] to-[#8a9a5b] flex items-center justify-center text-white text-base font-black shadow-inner flex-shrink-0">
                {getInitials(previewStory.elder_name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-extrabold uppercase">
                  <span className="flex items-center gap-0.5">📍 {previewStory.state}</span>
                  <span className="bg-[#f0ead9] text-[#2f5233] px-2 py-0.5 rounded border border-[#e5ddc8]/30 font-extrabold">{previewStory.category}</span>
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm leading-tight mt-1">{previewStory.elder_name} &bull; Age {previewStory.age}</h4>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-light italic mt-4 leading-relaxed border-l-2 border-[#d4af37]/45 pl-3">
              "{previewStory.transcript.substring(0, 110)}..."
            </p>

            {/* Simulated wave audio track */}
            <div className="flex items-center gap-2.5 pt-4">
              <span className="p-1.5 rounded-lg bg-[#2f5233]/10 text-[#2f5233] shadow-sm">
                <Volume2 size={13} />
              </span>
              <div className="flex-1 flex gap-0.5 h-4 items-end">
                {[2, 4, 3, 5, 2, 4, 6, 2, 4, 3, 5, 2, 4, 3, 5, 2, 4, 3, 5].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h * 16}%` }}
                    className="bg-[#8a9a5b] w-[3px] rounded-full animate-pulse"
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-gray-400 font-bold">04:12</span>
            </div>
          </motion.div>

          {/* Card B: Floating Archives Stats Card (Top Left) */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute top-8 left-4 z-10 hidden w-44 rounded-2xl border border-[#e5ddc8]/80 bg-white/90 p-6 shadow-xl backdrop-blur sm:block"
          >
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                <Database size={10} className="text-[#8a9a5b]" /> Vault Sync
              </span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-gray-900">{totalStoriesCount}</span>
              <span className="text-[8px] text-[#2f5233] bg-[#8a9a5b]/15 px-1.5 py-0.5 rounded font-bold uppercase">Safe</span>
            </div>
            <p className="text-[8px] text-gray-400 mt-1 font-medium">Stories archived cross-state</p>
          </motion.div>

          {/* Card C: AI Processing Status Toast (Top Right) */}
          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.3 }}
            className="absolute top-12 right-4 z-10 hidden w-48 rounded-2xl border border-[#e5ddc8]/80 bg-white/90 p-6 text-[10px] shadow-xl backdrop-blur sm:block"
          >
            <div className="flex items-center gap-1.5 text-[#2f5233] font-bold">
              <Sparkles size={11} className="text-[#d4af37]" />
              <span>Translation Engine</span>
            </div>
            <div className="mt-2 text-gray-500 leading-normal space-y-1.5">
              <p>🗣️ Dialect: <strong>{previewStory.language}</strong></p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="h-full bg-[#8a9a5b]"
                />
              </div>
              <p className="text-[8px] text-[#2f5233] font-extrabold flex items-center gap-0.5">
                ● Transcribing audio...
              </p>
            </div>
          </motion.div>

          {/* Card D: Premium Graph Widget (Bottom Left) */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 0.1 }}
            className="absolute bottom-6 left-6 z-10 hidden w-44 rounded-2xl border border-[#e5ddc8]/80 bg-white/90 p-6 shadow-xl backdrop-blur sm:block"
          >
            <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase">
              <span>Categories</span>
              <BarChart3 size={11} className="text-[#8a9a5b]" />
            </div>
            <div className="mt-2 space-y-1 text-[9px] text-gray-600 font-medium">
              <div className="flex justify-between items-center">
                <span>Handicrafts</span>
                <span className="text-[#2f5233]">34%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Folk Medicine</span>
                <span className="text-[#2f5233]">28%</span>
              </div>
            </div>
          </motion.div>

          {/* Card E: AI Processing / RAG Response Card (Bottom Right) */}
          <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{ repeat: Infinity, duration: 5.8, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-6 right-6 z-10 hidden w-52 rounded-2xl border border-[#d4af37]/35 bg-[#2f5233] p-6 text-white shadow-xl sm:block"
          >
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#dfb15b] font-bold">
              <Sparkle size={11} className="text-[#dfb15b]" />
              <span>AI Preserver Agent</span>
            </div>
            <p className="text-[10px] text-gray-200 font-light mt-1.5 leading-relaxed">
              "Identified bone-healing forest remedies from Nallamala..."
            </p>
            <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2 text-[8px] text-gray-300">
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">● Context Matched</span>
              <span>12ms</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}

export default HeroSection

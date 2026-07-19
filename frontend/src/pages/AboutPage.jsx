import { motion } from "framer-motion"
import { Sprout, Eye, Award, Code, ShieldCheck, Mail } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

// Social Icons as clean SVGs
const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const features = [
  {
    title: "Preserve Oral History",
    desc: "Capture raw spoken narratives from community elders, preserving rare local dialects and vernacular terms that standard text systems miss.",
    icon: <ScrollIcon className="text-[#2f5233]" size={24} />
  },
  {
    title: "AI Transcription & Translation",
    desc: "Utilize advanced Gemini AI translation models to convert regional Indian speech patterns into high-accuracy translations and syntheses.",
    icon: <Code className="text-[#8a9a5b]" size={24} />
  },
  {
    title: "Searchable Heritage Archive",
    desc: "Instantly index transcriptions of indigenous remedies, handloom design instructions, folk recipes, and music into a searchable database.",
    icon: <DatabaseIcon className="text-emerald-700" size={24} />
  },
  {
    title: "Cultural Knowledge for Future Generations",
    desc: "Generate clean summaries and cultural tags that allow students, researchers, and families to explore their heritage vault interactively.",
    icon: <Award className="text-[#d4af37]" size={24} />
  }
]

function ScrollIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function DatabaseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  )
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf7f0] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* 1. Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#faf7f0] to-[#f0ead9]/30 border-b border-[#e5ddc8]/40 pt-28 pb-20 text-center w-full">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          <div className="max-w-[1400px] mx-auto px-6 md:px-20 space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-6xl font-black text-[#2f5233] tracking-tight"
            >
              About HeritageAI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-base md:text-lg font-bold text-[#8a9a5b] tracking-wide max-w-xl mx-auto"
            >
              Preserving Cultural Wisdom Through Intelligent Synthesis
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-xs sm:text-sm text-gray-500 font-light max-w-2xl mx-auto leading-relaxed"
            >
              HeritageAI is an interactive archiving platform that digitizes dying local knowledge—ranging from traditional farming and handloom crafts to forest remedies and oral folklore. We utilize large language models to transcribe regional audio, summarize recipes, and secure family recollections forever.
            </motion.p>
          </div>
        </section>

        {/* Main Content Layout Container */}
        <main className="max-w-[1400px] mx-auto px-6 md:px-20 py-16 space-y-28">

          {/* 2. Mission & 3. Vision Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#e5ddc8]/60 flex flex-col justify-between hover:shadow-md transition duration-200 group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-[#2f5233]/8 flex items-center justify-center text-[#2f5233] shadow-inner group-hover:scale-105 transition-transform duration-200">
                  <Sprout size={28} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#2f5233] tracking-tight">Our Mission</h2>
                <p className="text-xs md:text-sm text-gray-600 font-light leading-relaxed">
                  To provide communities with intuitive audio tools that record, translate, and digitize elder memories. We convert spoken folklore and dying techniques in agriculture, handicrafts, and medicines into permanent, searchable archives so cultural heritage is never lost when a generation passes.
                </p>
              </div>
              <div className="border-t border-[#e5ddc8]/30 pt-4 mt-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                Preserving Oral Memory
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#e5ddc8]/60 flex flex-col justify-between hover:shadow-md transition duration-200 group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-[#2f5233]/8 flex items-center justify-center text-[#2f5233] shadow-inner group-hover:scale-105 transition-transform duration-200">
                  <Eye size={28} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#2f5233] tracking-tight">Our Vision</h2>
                <p className="text-xs md:text-sm text-gray-600 font-light leading-relaxed">
                  A future where every elder's knowledge is digitally preserved, mapped, and structured. By bridging the generational divide, we connect historical sustainable methods in organic farming, handloom crafts, and forest cures with modern researchers to inform sustainable innovation.
                </p>
              </div>
              <div className="border-t border-[#e5ddc8]/30 pt-4 mt-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                Bridging Generations
              </div>
            </motion.div>
          </section>

          {/* 4. Why HeritageAI Matters */}
          <section className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f5233] tracking-tight">Why HeritageAI Matters</h2>
              <p className="text-xs text-gray-500 font-light">Key capabilities driving our cultural archiving pipeline</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white border border-[#e5ddc8]/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#8a9a5b]/40 transition flex flex-col justify-between min-h-[220px]"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shadow-inner">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug">{feature.title}</h3>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 5. Meet the Developer (Highlighted center section) */}
          <section className="py-12 flex flex-col items-center justify-center w-full">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f5233] tracking-tight">Meet the Developer</h2>
              <p className="text-xs text-gray-500 font-light font-mono uppercase tracking-widest">Project Architect</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white/60 backdrop-blur-md border border-[#e5ddc8] rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl w-full flex flex-col items-center text-center space-y-6 hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle gold decoration pattern on corner */}
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#d4af37]/25 rounded-tr-3xl m-2" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#d4af37]/25 rounded-bl-3xl m-2" />

              {/* Large Circular Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-gradient-to-br from-[#2f5233] to-[#8a9a5b] flex items-center justify-center shadow-lg border-4 border-white relative z-10">
                  <img
                    src="/divya.jpg"
                    alt="Nallamolu Divya Sri"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                    className="w-full h-full object-cover"
                  />
                  {/* Fallback Monogram */}
                  <span className="absolute z-0 text-white text-5xl font-black opacity-10 select-none">DS</span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 w-7 h-7 bg-[#2f5233] border-2 border-white rounded-full flex items-center justify-center text-white shadow-md z-20">
                  <ShieldCheck size={14} className="text-[#dfb15b]" />
                </div>
              </div>

              {/* Developer Details */}
              <div className="space-y-4 w-full z-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Nallamolu Divya Sri</h3>
                  
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs font-extrabold text-[#2f5233] uppercase tracking-wider">
                      AI & Full Stack Developer
                    </p>
                    <p className="text-xs text-gray-500 font-light">
                      Computer Science & Design
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      MVGR College of Engineering
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-md mx-auto pt-3 border-t border-[#e5ddc8]/40">
                  "Passionate about preserving India's cultural heritage using Artificial Intelligence."
                </p>

                {/* Social Connects */}
                <div className="flex justify-center gap-4 pt-4 border-t border-[#e5ddc8]/25">
                  <a
                    href="mailto:divyanallamolu896@gmail.com"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e5ddc8] bg-white text-xs font-bold text-gray-700 hover:bg-[#faf7f0] hover:text-[#2f5233] transition shadow-sm active:scale-95"
                  >
                    <MailIcon className="text-[#2f5233]" /> Email
                  </a>
                  <a
                    href="https://github.com/divyanallamolu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e5ddc8] bg-white text-xs font-bold text-gray-700 hover:bg-[#faf7f0] hover:text-[#2f5233] transition shadow-sm cursor-pointer active:scale-95"
                  >
                    <GithubIcon className="text-gray-700" /> GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/divyanallamolu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e5ddc8] bg-white text-xs font-bold text-gray-700 hover:bg-[#faf7f0] hover:text-[#2f5233] transition shadow-sm cursor-pointer active:scale-95"
                  >
                    <LinkedinIcon className="text-[#0077b5]" /> LinkedIn
                  </a>
                </div>

              </div>

            </motion.div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default AboutPage
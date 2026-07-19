import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import Footer from "../components/Footer"

const steps = [
  { number: "01", title: "Record Memory", description: "Record an elder's narrative using voice or text inputs." },
  { number: "02", title: "AI Organization", description: "AI processes, summarizes, transcribes, and extracts cultural tags." },
  { number: "03", title: "Explore & Share", description: "Read details, search regional dialects, and preserve stories forever." },
]

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flow-root bg-[#faf7f0] text-gray-800">
        <HeroSection />

        <section className="my-20 lg:my-24">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center space-y-3 lg:mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#2f5233] tracking-tight">Preservation Lifecycle</h2>
              <p className="text-sm text-gray-500 font-light max-w-xl mx-auto">A thoughtful workflow for documenting and carrying forward living heritage.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((step, index) => (
                <motion.div key={step.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -4, transition: { duration: 0.18 } }} className="relative space-y-4 rounded-2xl border border-[#e5ddc8]/70 bg-white p-7 text-center shadow-[0_10px_30px_rgba(47,82,51,0.06)] transition-shadow hover:shadow-[0_18px_36px_rgba(47,82,51,0.12)] sm:p-8">
                  <span className="block font-mono text-5xl font-black text-[#d4af37]/35">{step.number}</span>
                  <h3 className="text-lg font-bold text-[#2f5233]">{step.title}</h3>
                  <p className="text-xs font-light leading-relaxed text-gray-600 md:text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="my-20 lg:my-24">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-full rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#2f5233] to-[#1b4332] px-6 py-14 text-center shadow-xl sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Help Preserve Culture for Generations</h2>
              <p className="mx-auto mt-6 max-w-xl text-xs font-light leading-relaxed text-gray-200 sm:text-sm">Wisdom disappears when an elder passes. Join us in recording family histories, traditions, folklore, and local dialects.</p>
              <div className="mt-8 flex justify-center">
                <Link to="/interview" className="rounded-lg border border-white bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[#2f5233] shadow-sm transition-all duration-200 hover:bg-[#faf7f0] hover:shadow-lg active:scale-[0.98]">Start First Interview</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default HomePage

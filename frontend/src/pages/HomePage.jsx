import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import Footer from "../components/Footer"
import { Container, WideContainer } from "../components/ui/Container"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"

const steps = [
  { number: "01", title: "Record Memory", description: "Record an elder's narrative using voice or text inputs." },
  { number: "02", title: "AI Organization", description: "AI processes, summarizes, transcribes, and extracts cultural tags." },
  { number: "03", title: "Explore & Share", description: "Read details, search regional dialects, and preserve stories forever." },
]

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#faf7f0] text-gray-800">
        <HeroSection />

        <section className="py-14 md:py-20">
          <Container>
            <div className="mb-12 text-center space-y-3 lg:mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-[#2f5233] tracking-tight">Preservation Lifecycle</h2>
              <p className="text-base text-gray-600 font-light max-w-xl mx-auto leading-relaxed">A thoughtful workflow for documenting and carrying forward living heritage.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <motion.div key={step.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -4, transition: { duration: 0.18 } }} className="relative space-y-4 rounded-3xl border border-[#e5ddc8]/70 bg-white/90 p-6 md:p-8 text-center shadow-md hover:shadow-xl transition-all duration-300">
                  <span className="block font-mono text-5xl font-black text-[#d4af37]/35">{step.number}</span>
                  <h3 className="text-xl font-bold text-[#2f5233]">{step.title}</h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14 md:py-20">
          <Container>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-full rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#2f5233] to-[#1b4332] px-6 md:px-10 lg:px-16 py-14 md:py-20 text-center shadow-xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Help Preserve Culture for Generations</h2>
              <p className="mx-auto mt-6 max-w-xl text-sm md:text-base text-gray-200 font-light leading-relaxed">Wisdom disappears when an elder passes. Join us in recording family histories, traditions, folklore, and local dialects.</p>
              <div className="mt-8 flex justify-center">
                <Link to="/interview" className="rounded-xl h-12 px-6 font-semibold border border-white bg-white text-[#2f5233] shadow hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300">Start First Interview</Link>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default HomePage

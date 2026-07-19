import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import Navbar from "../components/Navbar"
import { loginUser } from "../services/api"
import { useAuth } from "../context/AuthContext"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await loginUser(email, password)
      login(data.access_token, data.user)
      navigate("/profile")
    } catch (err) {
      setError(err.message || "Wrong email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0]">
      <Navbar />

      <section className="px-6 py-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#e5ddc8] p-8 md:p-10"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[#2f5233] text-center">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600 text-center">
            Log in to continue preserving heritage.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e5ddc8] focus:outline-none focus:ring-2 focus:ring-[#8a9a5b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e5ddc8] focus:outline-none focus:ring-2 focus:ring-[#8a9a5b]"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2f5233] text-white py-3.5 rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-[#203923] hover:shadow-md transition-all duration-200 disabled:opacity-60 border border-[#d4af37]/20 shadow-sm cursor-pointer"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#2f5233] font-medium hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  )
}

export default Login
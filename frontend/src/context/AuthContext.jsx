import { createContext, useContext, useState, useEffect } from "react"
import { fetchCurrentUser } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await fetchCurrentUser(storedToken)
        setUser(userData)
        setToken(storedToken)
      } catch (err) {
        // token invalid/expired — clear it
        localStorage.removeItem("token")
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
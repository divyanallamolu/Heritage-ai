import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function ProtectedRoute({ children }) {
  const { user, token, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
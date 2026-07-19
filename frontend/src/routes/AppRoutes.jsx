import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/HomePage"
import InterviewPage from "../pages/InterviewPage"
import HeritageLibraryPage from "../pages/HeritageLibraryPage"
import HeritageAnalytics from "../pages/HeritageAnalytics"
import AIChatPage from "../pages/AIChatPage"
import AboutPage from "../pages/AboutPage"
import Login from "../pages/Login"
import Register from "../pages/Register"
import UserProfile from "../pages/UserProfile"
import ProtectedRoute from "./ProtectedRoute"
import NotFoundPage from "../pages/NotFoundPage"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/library" element={<HeritageLibraryPage />} />
      <Route path="/analytics" element={<HeritageAnalytics />} />
      <Route path="/chat" element={<AIChatPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-interviews"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
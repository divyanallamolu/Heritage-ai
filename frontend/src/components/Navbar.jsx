import { useState, useEffect, useRef } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Bell, User, Heart, Settings, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { getInitials } from "../utils/helpers"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false) // Mobile menu
  const [isProfileOpen, setIsProfileOpen] = useState(false) // Profile dropdown
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false) // Notification dropdown
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const bellRef = useRef(null)

  // Local state for profile details (updates dynamically via profileUpdate event)
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem("profile_pic") || "")
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("profile_display_name") || user?.name || "Elder Custodian")
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("profile_username") || (user?.name ? "@" + user.name.toLowerCase().replace(/\s+/g, "") : "@caretaker")
  })

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfilePic(localStorage.getItem("profile_pic") || "")
      setDisplayName(localStorage.getItem("profile_display_name") || user?.name || "Elder Custodian")
      setUsername(localStorage.getItem("profile_username") || (user?.name ? "@" + user.name.toLowerCase().replace(/\s+/g, "") : "@caretaker"))
    }

    window.addEventListener("profileUpdate", handleProfileUpdate)
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate)
  }, [user])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    setIsProfileOpen(false)
    navigate("/login")
  }

  // Base Links (Profile is handled separately via avatar dropdown)
  const commonLinks = [
    { name: "Home", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Analytics", path: "/analytics" },
    { name: "AI Chat", path: "/chat" },
    { name: "About", path: "/about" }
  ]

  const loggedOutExtraLinks = [
    { name: "Login", path: "/login" },
    { name: "Register", path: "/register" }
  ]

  const navLinks = user ? commonLinks : [...commonLinks, ...loggedOutExtraLinks]

  return (
    <nav className="sticky top-0 z-50 bg-[#faf7f0]/95 backdrop-blur-md border-b border-[#e5ddc8] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-black text-[#2f5233] tracking-tight">
          Heritage<span className="text-[#d4af37]">AI</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative font-bold text-xs tracking-wider uppercase transition-colors duration-150 ${
                  isActive
                    ? "text-[#2f5233] border-b-2 border-[#d4af37]"
                    : "text-gray-500 hover:text-[#2f5233]"
                } pb-1 px-0.5`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Action Controls & Dropdowns (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              {/* Notification Icon */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg text-gray-500 hover:text-[#2f5233] hover:bg-gray-100 transition-colors duration-150 relative cursor-pointer"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white border border-[#e5ddc8] rounded-2xl shadow-xl py-4 px-4 text-xs z-50"
                    >
                      <h4 className="font-bold text-[#2f5233] border-b border-[#e5ddc8] pb-2 mb-2">Notifications</h4>
                      <p className="text-gray-500 font-light leading-relaxed">
                        No new updates today. Your secure elder archive is fully synced and preserved.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Instagram-style Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#2f5233] to-[#8a9a5b] flex items-center justify-center text-white text-xs font-black shadow-inner border border-[#e5ddc8]/80 hover:border-[#8a9a5b] transition">
                    {profilePic ? (
                      <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(displayName)
                    )}
                  </div>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-[#e5ddc8] rounded-2xl shadow-xl py-2 z-50 text-xs text-gray-700"
                    >
                      {/* Dropdown Header Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900 truncate">{displayName}</p>
                        <p className="text-[10px] font-mono text-gray-400 truncate">{username}</p>
                      </div>

                      {/* Dropdown Options */}
                      <div className="py-1">
                        <Link
                          to="/profile?tab=posts"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          <User size={14} className="text-gray-400" /> My Profile
                        </Link>
                        <Link
                          to="/profile?tab=saved"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          <Heart size={14} className="text-gray-400" /> Saved Stories
                        </Link>
                        <Link
                          to="/profile?tab=settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          <Settings size={14} className="text-gray-400" /> Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 font-bold cursor-pointer"
                        >
                          <LogOut size={14} /> Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link
              to="/interview"
              className="bg-[#2f5233] hover:bg-[#203923] text-white px-5 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase shadow-sm transition-all duration-200 border border-[#d4af37]/20"
            >
              Start Interview
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <Link to="/profile?tab=posts" className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#2f5233] to-[#8a9a5b] flex items-center justify-center text-white text-xs font-black shadow-inner border border-[#e5ddc8]">
              {profilePic ? (
                <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(displayName)
              )}
            </Link>
          )}

          <button onClick={() => setIsOpen(!isOpen)} className="text-[#2f5233] focus:outline-none cursor-pointer">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-[#faf7f0] border-t border-[#e5ddc8]"
          >
            <div className="flex flex-col gap-3 px-6 py-6 text-xs font-bold">
              {commonLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `font-bold text-xs uppercase tracking-wider py-1.5 ${
                      isActive ? "text-[#2f5233] border-l-2 border-[#d4af37] pl-2.5" : "text-gray-500 pl-2.5"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {user ? (
                <>
                  <div className="border-t border-[#e5ddc8]/60 my-2 pt-3 pl-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">My Profile Account</p>
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/profile?tab=posts"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-600 hover:text-[#2f5233] py-1 pl-1 flex items-center gap-1.5"
                      >
                        <User size={13} /> Posts
                      </Link>
                      <Link
                        to="/profile?tab=saved"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-600 hover:text-[#2f5233] py-1 pl-1 flex items-center gap-1.5"
                      >
                        <Heart size={13} /> Saved Stories
                      </Link>
                      <Link
                        to="/profile?tab=settings"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-600 hover:text-[#2f5233] py-1 pl-1 flex items-center gap-1.5"
                      >
                        <Settings size={13} /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-red-500 font-bold text-left py-1 pl-1 flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut size={13} /> Log Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 pl-2.5 py-1.5 uppercase"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 pl-2.5 py-1.5 uppercase"
                  >
                    Register
                  </NavLink>
                </>
              )}

              <Link
                to="/interview"
                onClick={() => setIsOpen(false)}
                className="bg-[#2f5233] text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-center mt-2 border border-[#d4af37]/20 shadow-sm"
              >
                Start Interview
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
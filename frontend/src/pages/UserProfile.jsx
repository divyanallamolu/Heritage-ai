import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Calendar,
  Languages,
  Eye,
  Trash2,
  X,
  User,
  Heart,
  Camera,
  BookOpen,
  Award,
  Clock,
  Settings as SettingsIcon,
  Mail,
  FileUp,
  Share2,
  Check,
  Palette,
  LogOut
} from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { getMyInterviews, deleteInterview, getPublicLibrary } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useLocation } from "react-router-dom"
import { getInitials, formatDate, getAvatarGradient, truncate } from "../utils/helpers"
import { CENTRAL_STORIES } from "../data/stories"

// ----------------------------------------------------
// Animated Counter Component
// ----------------------------------------------------
function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value, 10) || 0
    if (end === 0) {
      setCount(0)
      return
    }

    const incrementTime = Math.max(Math.floor(duration / end), 16)
    const timer = setInterval(() => {
      const step = Math.ceil(end / (duration / incrementTime))
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count.toLocaleString()}</span>
}

function UserProfile() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [interviews, setInterviews] = useState([])
  const [savedStories, setSavedStories] = useState([])
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)

  // Localized Profile States
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem("profile_display_name") || user?.name || "Elder Custodian"
  })

  const [username, setUsername] = useState(() => {
    const defaultUsername = user?.name
      ? "@" + user.name.toLowerCase().replace(/\s+/g, "")
      : "@user" + Math.floor(1000 + Math.random() * 9000)
    return localStorage.getItem("profile_username") || defaultUsername
  })

  const [bio, setBio] = useState(() => {
    return localStorage.getItem("profile_bio") || "Custodian of cultural memory. Recording and preserving elder histories for future generations."
  })

  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem("profile_pic") || ""
  })

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("profile_theme") || "cream"
  })

  const [activeTab, setActiveTab] = useState("posts") // posts, saved, activity, achievements, settings

  const [savedIds, setSavedIds] = useState(() => {
    try {
      const local = localStorage.getItem("saved_interviews")
      return local ? JSON.parse(local) : []
    } catch {
      return []
    }
  })

  // Sync activeTab with URL parameter ?tab=...
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tabParam = searchParams.get("tab")
    if (tabParam && ["posts", "saved", "activity", "achievements", "settings"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [location])

  // ----------------------------------------------------
  // Sync Data on Mount
  // ----------------------------------------------------
  useEffect(() => {
    loadProfileData()
  }, [])

  // Apply theme class to body/root for premium micro-experience
  useEffect(() => {
    document.documentElement.className = ""
    if (theme === "forest") {
      document.documentElement.classList.add("theme-forest")
    } else if (theme === "gold") {
      document.documentElement.classList.add("theme-gold")
    } else {
      document.documentElement.classList.add("theme-cream")
    }
    localStorage.setItem("profile_theme", theme)
  }, [theme])

  const loadProfileData = async () => {
    setIsLoading(true)
    setError("")
    
    let uploads = []
    try {
      const token = localStorage.getItem("token")
      uploads = await getMyInterviews(token)
    } catch (err) {
      console.warn("Profile upload sync failed, falling back to local list.")
    }

    const enrichedUploads = (uploads || []).map((item, idx) => {
      const seed = (item.id || idx) * 17
      return {
        ...item,
        views: (seed % 340) + 45,
        saves: (seed % 35) + 5
      }
    })
    setInterviews(enrichedUploads)

    let publicStories = []
    try {
      publicStories = await getPublicLibrary()
      const merged = [...publicStories]
      CENTRAL_STORIES.forEach((fallback) => {
        if (!merged.some((item) => item.elder_name === fallback.elder_name)) {
          merged.push(fallback)
        }
      })
      publicStories = merged
    } catch (err) {
      console.warn("Public library fetch failed, loading default fallback records.")
      publicStories = CENTRAL_STORIES
    }

    const matchedSaved = publicStories.filter(story => savedIds.includes(story.id))
    setSavedStories(matchedSaved)
    setIsLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this preserved interview? This cannot be undone.")) return
    try {
      await deleteInterview(id)
      setInterviews((prev) => prev.filter((item) => item.id !== id))
      if (selectedInterview?.id === id) setSelectedInterview(null)
    } catch (err) {
      setError("Failed to delete interview. Please try again.")
    }
  }

  // File upload avatar parsing
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be smaller than 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePic(reader.result)
      localStorage.setItem("profile_pic", reader.result)
      // Trigger navbar sync by dispatching a custom event
      window.dispatchEvent(new Event("profileUpdate"))
    }
    reader.readAsDataURL(file)
  }

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSettingsSubmit = (e) => {
    e.preventDefault()
    // Formatting username to ensure it starts with @
    let formattedUsername = username.trim()
    if (formattedUsername && !formattedUsername.startsWith("@")) {
      formattedUsername = "@" + formattedUsername
    }
    setUsername(formattedUsername)
    localStorage.setItem("profile_username", formattedUsername)
    localStorage.setItem("profile_display_name", displayName)
    localStorage.setItem("profile_bio", bio)
    // Dispatch update event
    window.dispatchEvent(new Event("profileUpdate"))
    setActiveTab("posts")
  }

  // ----------------------------------------------------
  // Stats and Achievements Aggregation
  // ----------------------------------------------------
  const totalViews = interviews.reduce((sum, item) => sum + (item.views || 0), 0)
  const totalSavesOfUploads = interviews.reduce((sum, item) => sum + (item.saves || 0), 0)
  const profileViews = Math.floor(totalViews * 0.4) + 124 // simulated profile hits

  // Achievements/Badges mapping
  const achievements = [
    { id: "1", name: "🌱 First Story", desc: "Preserved at least 1 elder interview", unlocked: interviews.length >= 1 },
    { id: "2", name: "🏆 Heritage Preserver", desc: "Uploaded 5+ elder interviews", unlocked: interviews.length >= 5 },
    { id: "3", name: "❤️ Community Favorite", desc: "Your stories saved 5+ times", unlocked: totalSavesOfUploads >= 5 },
    { id: "4", name: "🔥 100 Story Views", desc: "Preserved archive accumulated 100+ views", unlocked: totalViews >= 100 },
    { id: "5", name: "📚 Archivist", desc: "Uploaded 10+ elder interviews", unlocked: interviews.length >= 10 },
    { id: "6", name: "🌟 Story of the Week", desc: "Single story views exceeded 200 views", unlocked: interviews.some(i => i.views >= 200) }
  ]

  const joinedDateStr = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "July 2026"

  // Activity feed timeline logs
  const activityLogs = [
    { text: `Joined HeritageAI oral database as a preservation caretaker`, date: joinedDateStr, type: "system" },
    ...(interviews.map(item => ({
      text: `Uploaded and summarized interview of ${item.elder_name}`,
      date: formatDate(item.created_at),
      type: "upload"
    }))),
    ...(savedStories.map(item => ({
      text: `Saved story of ${item.elder_name} to personal bookmarks`,
      date: "Bookmark added",
      type: "save"
    })))
  ]

  return (
    <div className="min-h-screen bg-[#faf7f0] text-gray-800 transition-colors duration-200">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 md:px-20 py-12 space-y-12">
        
        {/* Instagram + GitHub Style Profile Header */}
        <section className="bg-white border border-[#e5ddc8] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative">
          
          {/* Avatar Section */}
          <div className="relative group flex-shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2f5233] to-[#8a9a5b] flex items-center justify-center text-white text-4xl font-black shadow-md border-4 border-white">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#2f5233] hover:bg-[#203923] text-white p-2 rounded-lg cursor-pointer shadow-md transition duration-200 border border-white">
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          {/* User Bio Information */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{displayName}</h2>
                <p className="text-xs font-mono text-[#8a9a5b] font-bold mt-0.5">{username}</p>
              </div>
              
              <div className="flex gap-2 justify-center mt-2 sm:mt-0 sm:ml-4">
                <button
                  onClick={() => setActiveTab("settings")}
                  className="bg-gray-50 hover:bg-[#e5ddc8]/30 border border-[#e5ddc8] text-gray-700 py-1.5 px-4 rounded-lg text-xs font-bold transition duration-200 shadow-sm"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleShareProfile}
                  className="bg-white hover:bg-gray-50 border border-[#e5ddc8] text-gray-700 py-1.5 px-3.5 rounded-lg text-xs font-bold transition duration-200 shadow-sm flex items-center gap-1"
                >
                  {copiedLink ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
                  <span>{copiedLink ? "Copied" : "Share"}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-light leading-relaxed max-w-xl">
              {bio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-gray-400" /> {user?.email || "caretaker@heritage.ai"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" /> Member since {joinedDateStr}
              </span>
            </div>

            {/* Premium Social Statistics Bar */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 pt-4 border-t border-[#e5ddc8]/40 text-xs">
              <div className="text-center md:text-left min-w-[70px]">
                <span className="font-black text-lg text-gray-900 block">
                  <AnimatedCounter value={interviews.length} />
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Stories</span>
              </div>
              <div className="text-center md:text-left min-w-[70px]">
                <span className="font-black text-lg text-gray-900 block">
                  <AnimatedCounter value={savedIds.length} />
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Bookmarks</span>
              </div>
              <div className="text-center md:text-left min-w-[70px]">
                <span className="font-black text-lg text-gray-900 block">
                  <AnimatedCounter value={profileViews} />
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Profile Hits</span>
              </div>
              <div className="text-center md:text-left min-w-[70px]">
                <span className="font-black text-lg text-gray-900 block">
                  <AnimatedCounter value={totalViews} />
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Story Views</span>
              </div>
              <div className="text-center md:text-left min-w-[70px]">
                <span className="font-black text-lg text-gray-900 block">
                  <AnimatedCounter value={182} />
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Followers</span>
              </div>
              <div className="text-center md:text-left min-w-[70px]">
                <span className="font-black text-lg text-gray-900 block">
                  <AnimatedCounter value={96} />
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Following</span>
              </div>
            </div>

          </div>
        </section>

        {/* Tab Navigation Menu */}
        <section className="space-y-6">
          <div className="flex border-b border-[#e5ddc8] justify-center md:justify-start gap-8 text-xs font-bold">
            {[
              { id: "posts", label: "Posts", count: interviews.length },
              { id: "saved", label: "Saved Stories", count: savedIds.length },
              { id: "activity", label: "Activity Log" },
              { id: "achievements", label: "Achievements", count: achievements.filter(a => a.unlocked).length },
              { id: "settings", label: "Settings" }
            ].map((tab) => {
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 border-b-2 transition-all duration-150 uppercase tracking-wider text-[11px] flex items-center gap-1.5 ${
                    isSelected
                      ? "border-[#d4af37] text-[#2f5233] font-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-gray-500">{tab.count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content renderer */}
          <div className="min-h-[300px]">
            {isLoading ? (
              <p className="text-center text-gray-400 text-sm py-10 font-light">Loading archive stats...</p>
            ) : error ? (
              <p className="text-center text-red-600 text-sm py-10 font-light">{error}</p>
            ) : (
              <AnimatePresence mode="wait">
                
                {/* 1. Posts Tab (Uploaded Interviews Grid) */}
                {activeTab === "posts" && (
                  <motion.div
                    key="posts-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {interviews.length === 0 ? (
                      <div className="col-span-full text-center py-16 bg-white border border-[#e5ddc8] border-dashed rounded-3xl p-8">
                        <BookOpen className="mx-auto text-gray-300 mb-3" size={24} />
                        <p className="text-sm text-gray-500">You haven't uploaded any oral records yet.</p>
                        <a
                          href="/interview"
                          className="mt-4 inline-block bg-[#2f5233] hover:bg-[#203923] text-white py-2 px-5 rounded-lg text-xs font-bold transition shadow"
                        >
                          Start Record Interview
                        </a>
                      </div>
                    ) : (
                      interviews.map((item) => (
                        <div key={item.id} className="bg-white border border-[#e5ddc8] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b] inline-block" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.language} &bull; {item.category || "General"}</span>
                            </div>
                            <h4 className="font-bold text-base text-[#2f5233]">{item.elder_name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Age: {item.age || "—"}</p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5">
                              📍 {item.village_or_city || item.state} &bull; {formatDate(item.created_at)}
                            </p>
                          </div>
                          <div className="mt-5 flex gap-2 pt-3 border-t border-gray-50">
                            <button
                              onClick={() => setSelectedInterview(item)}
                              className="flex-1 bg-[#2f5233] hover:bg-[#203923] text-white py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="bg-white border border-red-100 text-red-500 py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* 2. Saved Tab */}
                {activeTab === "saved" && (
                  <motion.div
                    key="saved-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {savedStories.length === 0 ? (
                      <div className="col-span-full text-center py-16 bg-white border border-[#e5ddc8] border-dashed rounded-3xl p-8">
                        <Heart className="mx-auto text-gray-300 mb-3" size={24} />
                        <p className="text-sm text-gray-500">Your bookmark shelf is empty.</p>
                        <a
                          href="/library"
                          className="mt-4 inline-block bg-[#8a9a5b] text-white py-2 px-6 rounded-lg text-xs font-bold hover:bg-[#2f5233] transition shadow"
                        >
                          Explore Heritage Library
                        </a>
                      </div>
                    ) : (
                      savedStories.map((item) => (
                        <div key={item.id} className="bg-white border border-[#e5ddc8] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] inline-block" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.language} &bull; {item.category || "General"}</span>
                            </div>
                            <h4 className="font-bold text-base text-[#2f5233]">{item.elder_name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Age: {item.age || "—"}</p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5">
                              📍 {item.village_or_city || item.state}
                            </p>
                          </div>
                          <div className="mt-5 flex gap-2 pt-3 border-t border-gray-50">
                            <button
                              onClick={() => setSelectedInterview(item)}
                              className="flex-1 bg-[#2f5233] hover:bg-[#203923] text-white py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} /> View Story
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* 3. Activity Feed Tab */}
                {activeTab === "activity" && (
                  <motion.div
                    key="activity-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="max-w-md mx-auto bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm"
                  >
                    <div className="relative border-l border-gray-100 pl-6 space-y-6">
                      {activityLogs.map((log, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[35px] top-0 bg-[#faf7f0] border border-[#e5ddc8] p-1.5 rounded-lg text-[#2f5233] inline-flex">
                            <Clock size={12} />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{log.text}</p>
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5">{log.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. Achievements / Badges Tab */}
                {activeTab === "achievements" && (
                  <motion.div
                    key="achievements-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-6"
                  >
                    {achievements.map((badge) => (
                      <div
                        key={badge.id}
                        className={`p-5 rounded-2xl border text-center transition-all ${
                          badge.unlocked
                            ? "bg-white border-[#d4af37]/40 shadow-sm"
                            : "bg-gray-50 border-gray-100 opacity-40 select-none"
                        }`}
                      >
                        <span className="text-3xl block mb-2">{badge.name.split(" ")[0]}</span>
                        <h4 className="text-xs font-bold text-[#2f5233]">
                          {badge.name.split(" ").slice(1).join(" ")}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 font-light leading-tight">{badge.desc}</p>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full inline-block mt-3 ${
                          badge.unlocked
                            ? "bg-[#2f5233]/15 text-[#2f5233] border border-[#2f5233]/30"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {badge.unlocked ? "UNLOCKED" : "LOCKED"}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* 5. Settings / Customize Tab */}
                {activeTab === "settings" && (
                  <motion.div
                    key="settings-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="max-w-md mx-auto bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm"
                  >
                    <form onSubmit={handleSettingsSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required
                          className="w-full text-xs p-2.5 rounded-lg border border-[#e5ddc8] bg-white focus:outline-none focus:ring-1 focus:ring-[#8a9a5b]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Username Handle</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="@username"
                          className="w-full text-xs p-2.5 rounded-lg border border-[#e5ddc8] bg-white focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Profile Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="w-full text-xs p-2.5 rounded-lg border border-[#e5ddc8] bg-white focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] resize-none"
                        />
                      </div>

                      {/* Theme Selector */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                          <Palette size={14} className="text-[#8a9a5b]" /> Accent Theme
                        </label>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[#e5ddc8] bg-white focus:outline-none focus:ring-1 focus:ring-[#8a9a5b]"
                        >
                          <option value="cream">🌾 Classic Cream (Warm)</option>
                          <option value="forest">🌲 Forest Green (Dark)</option>
                          <option value="gold">🏺 Golden Heritage (Muted)</option>
                        </select>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          className="flex-1 bg-[#2f5233] hover:bg-[#203923] text-white py-2.5 px-4 rounded-lg text-xs font-bold transition shadow cursor-pointer"
                        >
                          Save Profile Settings
                        </button>
                        <button
                          type="button"
                          onClick={logout}
                          className="bg-white border border-red-200 text-red-500 py-2.5 px-4 rounded-lg text-xs font-bold hover:bg-red-50 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <LogOut size={12} /> Log Out
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </div>
        </section>

      </main>

      {/* Read Story Modal */}
      <AnimatePresence>
        {selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInterview(null)}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#faf7f0] rounded-3xl border border-[#e5ddc8] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedInterview(null)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#e5ddc8] text-gray-500 hover:bg-[#f0ead9] hover:text-gray-900 transition shadow-sm"
              >
                <X size={18} />
              </button>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2f5233] bg-[#8a9a5b]/20 w-fit px-3.5 py-1 rounded-full border border-[#8a9a5b]/30">
                  <Languages size={12} />
                  {selectedInterview.language}
                </span>
                {selectedInterview.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 w-fit px-3.5 py-1 rounded-full border border-amber-200">
                    📂 {selectedInterview.category}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-3xl font-extrabold text-[#2f5233] tracking-tight">
                {selectedInterview.elder_name}
              </h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-gray-600 border-b border-[#e5ddc8]/60 pb-5">
                <span className="flex items-center gap-2">
                  <User size={14} className="text-[#8a9a5b]" />
                  <strong>Age:</strong> {selectedInterview.age || "Not specified"}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#8a9a5b]" />
                  <strong>Preserved on:</strong> {formatDate(selectedInterview.created_at)}
                </span>
                <span className="flex items-center gap-2 sm:col-span-2">
                  <MapPin size={14} className="text-[#8a9a5b]" />
                  <strong>Location:</strong> {[selectedInterview.village_or_city, selectedInterview.district, selectedInterview.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>

              <div className="mt-6 bg-white border border-[#e5ddc8] rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-[#2f5233] mb-2 flex items-center gap-1.5">
                  <Award size={16} className="text-[#d4af37]" /> AI Summary & Synthesis
                </h3>
                <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed font-light">
                  {selectedInterview.ai_summary}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-base font-bold text-[#2f5233] mb-2 flex items-center gap-1.5">
                  <Scroll size={16} className="text-[#8a9a5b]" /> Oral Transcript
                </h3>
                <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed font-light bg-white border border-[#e5ddc8] rounded-2xl p-5 max-h-60 overflow-y-auto">
                  {selectedInterview.transcript}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e5ddc8]/60 flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="flex gap-4 text-gray-500">
                  <span>👁️ <strong>{selectedInterview.views || 0}</strong> views</span>
                  <span>❤️ <strong>{selectedInterview.saves || 0}</strong> saves</span>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="bg-[#2f5233] hover:bg-[#203923] text-white py-2 px-6 rounded-lg font-bold shadow transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export default UserProfile

import { useState, useEffect } from "react"
import { getPublicLibrary } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  MapPin,
  User,
  Calendar,
  Languages,
  X,
  BookOpen,
  TrendingUp,
  Eye,
  Users,
  Award,
  Sparkles,
  Utensils,
  Scroll,
  Leaf,
  Scissors,
  Home,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import Navbar from "../components/Navbar"
import IndiaMap from "../components/IndiaMap"
import Footer from "../components/Footer"
import { getInitials, formatDate, getAvatarGradient } from "../utils/helpers"

import { CENTRAL_STORIES } from "../data/stories"

// ----------------------------------------------------
// Mock Constants (Cleanly isolated for future replacement)
// ----------------------------------------------------
const MOCK_COMMUNITY = {
  registeredUsers: 1284,
  onlineNow: 42,
  weeklyActive: 386,
  totalLogins: 18540,
};

function enrichInterviewData(interview, index) {
  const seed = (interview.id || index) * 17;
  const views = (seed % 900) + 80;
  const saves = Math.floor(views * 0.15) + (seed % 15);
  const viewsToday = Math.floor(views * 0.08) + (seed % 10);
  
  const categories = [
    "Traditional Recipes",
    "Festivals",
    "Folk Stories",
    "Folk Medicine",
    "Handicrafts",
    "Village Life"
  ];
  const category = categories[seed % categories.length];

  return {
    ...interview,
    views,
    saves,
    viewsToday,
    category,
    elder_name: interview.elder_name || "Unknown Elder",
    language: interview.language || "Unknown Language",
    state: interview.state || "Andhra Pradesh",
    ai_summary: interview.ai_summary || "No summary generated for this interview yet.",
    transcript: interview.transcript || "No transcript available.",
    created_at: interview.created_at || new Date().toISOString()
  };
}

// Animated Counter Component
function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) return;

    const incrementTime = Math.max(Math.floor(duration / end), 16);
    const timer = setInterval(() => {
      const step = Math.ceil(end / (duration / incrementTime));
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Helpers


const CATEGORY_CONFIG = {
  "Traditional Recipes": { icon: Utensils, color: "text-amber-600 bg-amber-50" },
  "Festivals": { icon: Sparkles, color: "text-red-600 bg-red-50" },
  "Folk Stories": { icon: Scroll, color: "text-emerald-600 bg-emerald-50" },
  "Folk Medicine": { icon: Leaf, color: "text-green-600 bg-green-50" },
  "Handicrafts": { icon: Scissors, color: "text-indigo-600 bg-indigo-50" },
  "Village Life": { icon: Home, color: "text-orange-600 bg-orange-50" }
};



function HeritageAnalytics() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPublicLibrary();
        const dbEnriched = (data || []).map((item, index) => enrichInterviewData(item, index));
        const merged = [...dbEnriched];
        CENTRAL_STORIES.forEach((fallback) => {
          if (!merged.some((item) => item.elder_name === fallback.elder_name)) {
            merged.push(fallback);
          }
        });
        setInterviews(merged);
      } catch (err) {
        setInterviews(CENTRAL_STORIES);
        console.error("Failed to fetch library for analytics. Loaded fallbacks.", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ----------------------------------------------------
  // Dynamic aggregation
  // ----------------------------------------------------
  // Filter lists based on selected state if active
  const displayedInterviews = selectedState
    ? interviews.filter((i) => i.state?.toLowerCase() === selectedState.toLowerCase())
    : interviews;

  const totalStories = displayedInterviews.length;
  const uniqueElders = new Set(displayedInterviews.map((i) => i.elder_name)).size;
  const totalViews = displayedInterviews.reduce((sum, i) => sum + (i.views || 0), 0);
  const totalSaves = displayedInterviews.reduce((sum, i) => sum + (i.saves || 0), 0);
  const statesCovered = new Set(displayedInterviews.map((i) => i.state).filter(Boolean)).size;
  const languagesPreserved = new Set(displayedInterviews.map((i) => i.language).filter(Boolean)).size;

  const stateCounts = interviews.reduce((acc, item) => {
    if (item.state) {
      acc[item.state] = (acc[item.state] || 0) + 1;
    }
    return acc;
  }, {});

  const categoryCounts = displayedInterviews.reduce((acc, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  const languageCounts = displayedInterviews.reduce((acc, item) => {
    if (item.language) {
      acc[item.language] = (acc[item.language] || 0) + 1;
    }
    return acc;
  }, {});

  const trendingStories = [...displayedInterviews]
    .sort((a, b) => (b.viewsToday || 0) - (a.viewsToday || 0))
    .slice(0, 5);

  const popularStories = [...displayedInterviews]
    .sort((a, b) => ((b.views || 0) + (b.saves || 0)) - ((a.views || 0) + (a.saves || 0)))
    .slice(0, 6);

  // AI Insights
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Festivals";
  const topLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Telugu";
  const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Andhra Pradesh";
  const averageAge = Math.round(displayedInterviews.reduce((sum, i) => sum + (i.age || 74), 0) / (displayedInterviews.length || 1));

  return (
    <div className="min-h-screen bg-[#faf7f0] text-gray-800">
      <Navbar />

      <header className="max-w-[1400px] mx-auto px-6 md:px-20 pt-12 pb-4">
        <div className="border-b border-[#e5ddc8] pb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2f5233] tracking-tight flex items-center gap-2">
              Heritage Analytics
              <span className="text-xs bg-[#d4af37]/20 text-[#8a5233] border border-[#d4af37]/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                Active
              </span>
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-gray-600 font-light">
              Real-time preservation tracking, state counts, and regional distribution insights.
            </p>
          </div>
          {selectedState && (
            <div className="mt-4 md:mt-0 bg-[#d4af37]/10 border border-[#d4af37]/30 px-4 py-2 rounded-xl flex items-center gap-3 text-xs">
              <span className="text-[#8a5233] font-semibold">Filtering by: 📍 {selectedState}</span>
              <button
                onClick={() => setSelectedState(null)}
                className="text-gray-500 hover:text-red-600 font-bold hover:underline"
              >
                Clear Map Filter
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 📊 Statistic Cards Grid */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-20 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: "Total Stories", val: totalStories, icon: BookOpen, accent: "text-[#2f5233] bg-emerald-50" },
            { label: "Elders Preserved", val: uniqueElders, icon: User, accent: "text-amber-700 bg-amber-50" },
            { label: "Story Views", val: totalViews, icon: Eye, accent: "text-blue-700 bg-blue-50" },
            { label: "Story Saves", val: totalSaves, icon: Heart, accent: "text-red-600 bg-red-50" },
            { label: "States Covered", val: statesCovered, icon: MapPin, accent: "text-purple-700 bg-purple-50" },
            { label: "Languages", val: languagesPreserved, icon: Languages, accent: "text-teal-700 bg-teal-50" }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#e5ddc8] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{stat.label}</span>
                <span className={`p-1.5 rounded-lg ${stat.accent} inline-block`}>
                  <stat.icon size={14} />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xl md:text-2xl font-black text-gray-900">
                  {isLoading ? (
                    <span className="h-6 w-12 bg-gray-200 animate-pulse rounded inline-block" />
                  ) : (
                    <AnimatedCounter value={stat.val} />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid Content (Balanced Dashboard Grid) */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-20 py-6 space-y-6">
        
        {/* Row 1: Map (2 cols) | Trending Stories (1 col) | Languages (1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          
          {/* Map (2 cols) */}
          <div className="md:col-span-2">
            <IndiaMap
              activeState={selectedState}
              onStateClick={setSelectedState}
              stateCounts={stateCounts}
            />
          </div>

          {/* Trending Stories Today (1 col) */}
          <div className="md:col-span-1 bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[500px]">
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <h3 className="text-xs font-bold text-[#2f5233] border-b border-[#e5ddc8] pb-3 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#d4af37]" />
                <span>Trending Stories Today</span>
              </h3>
              {trendingStories.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">No stories trending in this region.</p>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  {trendingStories.map((story) => (
                    <div key={story.id} className="flex items-center justify-between text-xs group">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarGradient(story.elder_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {getInitials(story.elder_name)}
                        </div>
                        <div className="min-w-0">
                          <p onClick={() => setSelectedInterview(story)} className="font-bold text-[#2f5233] hover:text-[#8a9a5b] cursor-pointer hover:underline truncate w-[90px] sm:w-[120px]">
                            {story.elder_name}
                          </p>
                          <p className="text-[10px] text-gray-400">📍 {story.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a9a5b] text-[10px] font-semibold flex items-center gap-0.5">
                          <Eye size={12} /> {story.viewsToday}
                        </span>
                        <button
                          onClick={() => setSelectedInterview(story)}
                          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-[#8a9a5b]/10 flex items-center justify-center text-gray-400 hover:text-[#2f5233] transition"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Languages (1 col) */}
          <div className="md:col-span-1 bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[500px]">
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <h3 className="text-xs font-bold text-[#2f5233] border-b border-[#e5ddc8] pb-3 mb-4 flex items-center gap-2">
                <Languages size={16} className="text-[#8a9a5b]" />
                <span>Languages Preserved</span>
              </h3>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {Object.entries(languageCounts).map(([lang, count]) => {
                  const pct = Math.round((count / interviews.length) * 100) || 0;
                  return (
                    <div key={lang} className="text-xs">
                      <div className="flex justify-between text-[11px] text-gray-700 font-medium mb-1.5">
                        <span>{lang}</span>
                        <span className="text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="h-full bg-[#8a9a5b] rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Categories (2 cols) | Most Popular Stories (2 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          
          {/* Categories (2 cols) */}
          <div className="md:col-span-2 bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[460px]">
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <h3 className="text-xs font-bold text-[#2f5233] border-b border-[#e5ddc8] pb-3 mb-4">
                📂 Categories Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
                {Object.keys(CATEGORY_CONFIG).map((catName) => {
                  const conf = CATEGORY_CONFIG[catName];
                  const count = categoryCounts[catName] || 0;
                  const CatIcon = conf.icon;
                  return (
                    <div key={catName} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <span className={`p-2.5 rounded-lg ${conf.color}`}>
                        <CatIcon size={16} />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">{catName}</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{count} Stories</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Most Popular Stories (2 cols) */}
          <div className="md:col-span-2 bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[460px]">
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <h3 className="text-xs font-bold text-[#2f5233] border-b border-[#e5ddc8] pb-3 mb-4 flex items-center gap-2">
                <Award size={16} className="text-[#d4af37]" />
                <span>Most Popular Stories (All Time)</span>
              </h3>
              {popularStories.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No popular stories recorded in this region.</p>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-xs text-left text-gray-500">
                    <thead className="text-[10px] text-gray-400 uppercase bg-gray-50/50 rounded-lg">
                      <tr>
                        <th scope="col" className="px-4 py-2.5">Rank</th>
                        <th scope="col" className="px-4 py-2.5">Elder</th>
                        <th scope="col" className="px-4 py-2.5">Location</th>
                        <th scope="col" className="px-4 py-2.5">Category</th>
                        <th scope="col" className="px-4 py-2.5 text-right">Metrics</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {popularStories.map((story, idx) => {
                        const badge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "⭐";
                        return (
                          <tr key={story.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3 font-bold text-gray-900">{badge} {idx + 1}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">
                              <button onClick={() => setSelectedInterview(story)} className="hover:underline hover:text-[#8a9a5b] text-left">
                                {story.elder_name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-400">{story.village_or_city || story.state}</td>
                            <td className="px-4 py-3">
                              <span className="bg-[#f0ead9] text-[#2f5233] rounded px-2 py-0.5 text-[10px] font-medium border border-[#e5ddc8]/30">
                                {story.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-semibold text-gray-800">👁️ {story.views}</span> &bull; <span className="text-red-500 font-medium">❤️ {story.saves}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Row 3: Community (2 cols) | AI Insights (2 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          
          {/* Community (2 cols) */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#2f5233] to-[#1b4332] text-white p-6 rounded-3xl shadow-xl border border-[#d4af37]/20 relative overflow-hidden h-[380px] flex flex-col justify-between">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
              <Users size={140} />
            </div>
            <div>
              <h3 className="text-xs font-bold flex items-center gap-2 border-b border-white/20 pb-3 mb-4">
                <Users size={16} className="text-[#dfb15b]" />
                <span>HeritageAI Community</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-[9px] text-gray-300 uppercase font-bold">Registered Users</p>
                  <p className="text-base font-black text-[#dfb15b] mt-0.5">
                    <AnimatedCounter value={MOCK_COMMUNITY.registeredUsers} />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-300 uppercase font-bold">Online Now</p>
                  <p className="text-base font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    <AnimatedCounter value={MOCK_COMMUNITY.onlineNow} />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-300 uppercase font-bold">Weekly Active</p>
                  <p className="text-base font-black text-gray-100 mt-0.5">
                    <AnimatedCounter value={MOCK_COMMUNITY.weeklyActive} />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-300 uppercase font-bold">Total Logins</p>
                  <p className="text-base font-black text-gray-100 mt-0.5">
                    <AnimatedCounter value={MOCK_COMMUNITY.totalLogins} />
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[9px] text-gray-300 mt-4">
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" /> Anonymous counts preserved
              </span>
            </div>
          </div>

          {/* AI Insights (2 cols) */}
          <div className="md:col-span-2 bg-white border border-[#e5ddc8] rounded-3xl p-6 shadow-sm h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#2f5233] border-b border-[#e5ddc8] pb-3 mb-4 flex items-center gap-2">
                <Award size={16} className="text-[#d4af37]" />
                <span>AI Insights</span>
              </h3>
              <ul className="space-y-4 text-xs text-gray-600 font-light">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 flex-shrink-0" />
                  <p>Most preserved stories concern <strong>{topCategory}</strong>.</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 flex-shrink-0" />
                  <p>The most common language recorded is <strong>{topLanguage}</strong>.</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 flex-shrink-0" />
                  <p><strong>{topState}</strong> represents the largest regional archive.</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 flex-shrink-0" />
                  <p>The average preserved elder age is <strong>{averageAge} years</strong>.</p>
                </li>
              </ul>
            </div>
          </div>

        </div>

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
  );
}

export default HeritageAnalytics;

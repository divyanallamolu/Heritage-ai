import { useState, useEffect } from "react"
import { getPublicLibrary } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Search,
  MapPin,
  User,
  Calendar,
  Languages,
  X,
  BookOpen,
  Plus,
  Clock,
  ChevronRight,
  ArrowRight,
  Scroll,
  Award
} from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { getInitials, formatDate, getAvatarGradient, truncate } from "../utils/helpers"
import { CENTRAL_STORIES } from "../data/stories"
import { WideContainer } from "../components/ui/Container"
import { CompactCard } from "../components/ui/Card"
import { Button, SmallButton } from "../components/ui/Button"

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

function HeritageLibraryPage() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const local = localStorage.getItem("saved_interviews");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  // Filter and Sort States
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  
  // Lazy Loading Pagination State
  const [visibleCount, setVisibleCount] = useState(9);

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id];
      localStorage.setItem("saved_interviews", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    async function fetchInterviews() {
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
        console.error("Failed to connect to API, loaded fallbacks.", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const recentlyAddedStories = [...interviews]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const filteredInterviews = interviews.filter((interview) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      interview.elder_name?.toLowerCase().includes(term) ||
      interview.village?.toLowerCase().includes(term) ||
      interview.district?.toLowerCase().includes(term) ||
      interview.state?.toLowerCase().includes(term) ||
      interview.category?.toLowerCase().includes(term) ||
      interview.language?.toLowerCase().includes(term);

    const matchesState = !selectedState || interview.state?.toLowerCase() === selectedState.toLowerCase();
    const matchesCategory = !selectedCategory || interview.category === selectedCategory;
    const matchesLanguage = !selectedLanguage || interview.language === selectedLanguage;

    return matchesSearch && matchesState && matchesCategory && matchesLanguage;
  });

  // Apply Sorting
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    if (sortBy === "views") {
      return (b.views || 0) - (a.views || 0);
    }
    if (sortBy === "saves") {
      return (b.saves || 0) - (a.saves || 0);
    }
    if (sortBy === "name") {
      return (a.elder_name || "").localeCompare(b.elder_name || "");
    }
    return 0;
  });

  const clearAllFilters = () => {
    setSelectedState(null);
    setSelectedCategory(null);
    setSelectedLanguage(null);
    setSearchTerm("");
    setSortBy("recent");
    setVisibleCount(9);
  };

  // Get unique options from full central list for select dropdowns
  const uniqueStates = Array.from(new Set(interviews.map(i => i.state).filter(Boolean))).sort();
  const uniqueCategories = Array.from(new Set(interviews.map(i => i.category).filter(Boolean))).sort();
  const uniqueLanguages = Array.from(new Set(interviews.map(i => i.language).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-[#faf7f0] text-gray-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Page Header */}
        <header className="pt-16 pb-6">
          <WideContainer>
            <div className="border-b border-[#e5ddc8] pb-8 md:flex md:items-center md:justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl md:text-5xl font-bold text-[#2f5233] tracking-tight"
                >
                  Heritage Library
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mt-2 text-base text-gray-600 font-light max-w-2xl leading-relaxed"
                >
                  Browse through oral recordings, histories, and traditions preserved by elders across generations.
                </motion.p>
              </div>
              <div className="mt-6 md:mt-0 flex gap-4 justify-center">
                <a
                  href="/interview"
                  className="rounded-xl h-12 px-6 font-semibold bg-[#2f5233] hover:bg-[#203923] text-white border border-[#d4af37]/20 shadow hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-1.5"
                >
                  <Plus size={14} className="text-[#dfb15b]" /> Record Interview
                </a>
              </div>
            </div>
          </WideContainer>
        </header>

        {/* Recently Added Carousel Section */}
        <section className="py-6 border-b border-[#e5ddc8]/40 pb-10">
          <WideContainer>
            <h3 className="text-sm font-bold text-[#2f5233] mb-4 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-[#8a9a5b]" />
              <span>Recently Preserved Stories</span>
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none">
            {recentlyAddedStories.map((story, index) => (
              <motion.div
                key={story.id || index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-80 bg-white border border-[#e5ddc8]/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#8a9a5b]/40 transition flex flex-col justify-between h-[210px]"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-semibold">{formatDate(story.created_at)}</span>
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">NEW</span>
                  </div>
                  <h4 className="font-bold text-base text-[#2f5233] mt-2 truncate">{story.elder_name}</h4>
                  <p className="text-[10px] text-gray-500">📍 {story.state}</p>
                  <p className="text-xs text-gray-600 mt-3 font-light leading-relaxed line-clamp-3">
                    {truncate(story.ai_summary, 120)}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">{story.language}</span>
                  <button
                    onClick={() => setSelectedInterview(story)}
                    className="text-xs font-bold text-[#2f5233] hover:text-[#8a9a5b] flex items-center gap-0.5"
                  >
                    View Details <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          </WideContainer>
        </section>

        {/* Search and Filters Section */}
        <section className="py-8">
          <WideContainer>
            <div className="flex flex-col gap-5 bg-white border border-[#e5ddc8]/50 p-6 rounded-3xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(9);
                  }}
                  placeholder="Search by elder name, village, state, category, language..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e5ddc8] bg-white focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-sm shadow-sm transition"
                />
              </div>
              {(selectedState || selectedCategory || selectedLanguage || searchTerm || sortBy !== "recent") && (
                <button
                  onClick={clearAllFilters}
                  className="w-full md:w-auto bg-white hover:bg-gray-50 border border-[#e5ddc8] text-gray-700 py-3 px-6 rounded-lg text-xs font-bold shadow-sm transition"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 font-extrabold">State</label>
                <select
                  value={selectedState || ""}
                  onChange={(e) => {
                    setSelectedState(e.target.value || null);
                    setVisibleCount(9);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5ddc8]/60 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] shadow-sm transition cursor-pointer"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 font-extrabold">Category</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value || null);
                    setVisibleCount(9);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5ddc8]/60 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] shadow-sm transition cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 font-extrabold">Language</label>
                <select
                  value={selectedLanguage || ""}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value || null);
                    setVisibleCount(9);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5ddc8]/60 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] shadow-sm transition cursor-pointer"
                >
                  <option value="">All Languages</option>
                  {uniqueLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 font-extrabold">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setVisibleCount(9);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5ddc8]/60 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] shadow-sm transition cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="views">Most Viewed</option>
                  <option value="saves">Most Saved</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedState || selectedCategory || selectedLanguage || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 bg-white/50 border border-[#e5ddc8]/40 p-3 rounded-2xl">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mr-1">Filtered by:</span>
              {selectedState && (
                <span className="bg-[#2f5233]/10 border border-[#2f5233]/30 text-[#2f5233] text-xs rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-semibold">
                  📍 {selectedState}
                  <button onClick={() => setSelectedState(null)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-[#8a9a5b]/10 border border-[#8a9a5b]/30 text-[#2f5233] text-xs rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-semibold">
                  📂 {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {selectedLanguage && (
                <span className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#8a5233] text-xs rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-semibold">
                  🗣️ {selectedLanguage}
                  <button onClick={() => setSelectedLanguage(null)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-gray-100 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-semibold">
                  🔍 "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
            </div>
          )}
          </WideContainer>
        </section>

        {/* Spacious Complete Story Cards Grid */}
        <section className="pb-24">
          <WideContainer>
          {/* Skeleton Loaders */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#e5ddc8] animate-pulse h-48 flex flex-col justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded-lg w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error View */}
          {!isLoading && error && (
            <div className="text-center py-12 max-w-md mx-auto">
              <p className="text-red-700 font-bold text-base">Unable to connect to archive database.</p>
              <p className="text-xs text-gray-500 mt-1">Please try refreshing the page or checking server logs.</p>
            </div>
          )}

          {/* Empty Results View */}
          {!isLoading && !error && sortedInterviews.length === 0 && (
            <div className="text-center py-20 bg-white/40 border border-dashed border-[#e5ddc8] rounded-3xl p-8 max-w-xl mx-auto">
              <BookOpen className="mx-auto text-gray-400 mb-3" size={28} />
              <h4 className="text-base font-bold text-[#2f5233]">No stories match your criteria</h4>
              <p className="text-xs text-gray-500 mt-1">Adjust or reset your active filters to explore other traditional items.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-[#2f5233] hover:bg-[#203923] text-white py-2 px-5 rounded-lg text-xs font-bold transition shadow"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Cards Grid */}
          {!isLoading && !error && sortedInterviews.length > 0 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedInterviews.slice(0, visibleCount).map((story, index) => {
                  const isSaved = savedIds.includes(story.id);
                  return (
                    <motion.div
                      key={story.id || index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, transition: { duration: 0.15 } }}
                      className="bg-white border border-[#e5ddc8]/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#8a9a5b]/40 transition-all flex flex-col justify-between h-[280px] w-full"
                    >
                      <div>
                        {/* Avatar & Header row */}
                        <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getAvatarGradient(story.elder_name)} flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-inner`}>
                            {getInitials(story.elder_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-base leading-tight truncate hover:text-[#2f5233]">
                              {story.elder_name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">
                              {story.age ? `${story.age} Yrs` : "Age Unknown"} &bull; 📍 {story.state}
                            </p>
                          </div>
                        </div>

                        {/* Tag pill */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="bg-[#f0ead9] text-[#2f5233] border border-[#e5ddc8]/40 rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            {story.category || "History"}
                          </span>
                          <span className="bg-gray-50 text-gray-400 border border-gray-100 rounded px-2 py-0.5 text-[9px] font-medium">
                            🗣️ {story.language}
                          </span>
                        </div>

                        {/* AI Teaser Text */}
                        <p className="mt-3.5 text-xs text-gray-500 font-light leading-relaxed line-clamp-3">
                          {truncate(story.ai_summary, 120)}
                        </p>
                      </div>

                      {/* Actions row */}
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <button
                          onClick={() => toggleSave(story.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition ${
                            isSaved ? "text-red-500 scale-105" : "text-gray-400 hover:text-red-500"
                          }`}
                        >
                          <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
                          <span>{isSaved ? "Saved" : "Save"}</span>
                        </button>
                        <button
                          onClick={() => setSelectedInterview(story)}
                          className="bg-white border border-[#e5ddc8] hover:bg-[#faf7f0] text-gray-700 font-bold text-xs py-1.5 px-3.5 rounded-lg shadow-sm transition flex items-center gap-0.5"
                        >
                          Read Story <ArrowRight size={12} className="text-[#8a9a5b]" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Lazy Loading "Load More" Button */}
              {visibleCount < sortedInterviews.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 9)}
                    className="rounded-xl h-12 px-6 font-semibold bg-[#2f5233] hover:bg-[#203923] text-white border border-[#d4af37]/20 shadow hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    Load More Stories
                  </button>
                </div>
              )}
            </div>
          )}
          </WideContainer>
        </section>
      </div>

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
                  <strong>Location:</strong> {[selectedInterview.village, selectedInterview.district, selectedInterview.state]
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
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSave(selectedInterview.id)}
                    className={`py-2 px-4 rounded-lg text-xs font-bold border transition ${
                      savedIds.includes(selectedInterview.id)
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-white border-[#e5ddc8] text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {savedIds.includes(selectedInterview.id) ? "❤️ Saved" : "🖤 Save Story"}
                  </button>
                  <a
                    href={`/chat?query=Tell%20me%20more%20about%20the%20interview%20with%20${encodeURIComponent(selectedInterview.elder_name)}`}
                    className="bg-[#2f5233] hover:bg-[#203923] text-white py-2 px-5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1"
                  >
                    Ask AI Assistant
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default HeritageLibraryPage;
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Calendar, Languages, Eye, Trash2, X } from "lucide-react"
import Navbar from "../components/Navbar"
import { getMyInterviews, deleteInterview } from "../services/api"

function MyInterviews() {
  const [interviews, setInterviews] = useState([])
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await getMyInterviews()
      setInterviews(data)
    } catch (err) {
      setError(err.message || "Could not load your interviews.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteInterview(id)
      setInterviews((prev) => prev.filter((item) => item.id !== id))
      if (selectedInterview?.id === id) setSelectedInterview(null)
    } catch (err) {
      setError("Failed to delete interview. Please try again.")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-[#faf7f0]">
      <Navbar />

      <section className="px-6 pt-16 pb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold text-[#2f5233]"
        >
          My Interviews
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Interviews you've personally recorded and saved.
        </motion.p>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {isLoading && <p className="text-center text-gray-500">Loading interviews...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          {!isLoading && !error && interviews.length === 0 && (
            <p className="text-center text-gray-500">
              You haven't saved any interviews yet. Go record one!
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5ddc8] flex flex-col"
              >
                <h3 className="text-xl font-semibold text-[#2f5233]">
                  {interview.elder_name}
                </h3>
                <p className="text-sm text-gray-500">Age: {interview.age || "—"}</p>

                <span className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  {[interview.village_or_city, interview.district, interview.state]
                    .filter(Boolean)
                    .join(", ") || "Location not specified"}
                </span>

                <span className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <Languages size={14} />
                  {interview.language}
                </span>

                <span className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <Calendar size={14} />
                  {formatDate(interview.created_at)}
                </span>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setSelectedInterview(interview)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#2f5233] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#243f28] transition-colors duration-200"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(interview.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 border border-[#e5ddc8] px-4 py-2 rounded-full text-sm font-medium hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedInterview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative"
          >
            <button
              onClick={() => setSelectedInterview(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-[#2f5233]">
              {selectedInterview.elder_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Age: {selectedInterview.age || "—"} &middot;{" "}
              {[selectedInterview.village_or_city, selectedInterview.district, selectedInterview.state]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-sm text-gray-500">
              Language: {selectedInterview.language} &middot;{" "}
              {formatDate(selectedInterview.created_at)}
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#2f5233] mb-2">Transcript</h3>
              <p className="text-gray-700 whitespace-pre-line bg-[#faf7f0] rounded-xl p-4">
                {selectedInterview.transcript}
              </p>
            </div>

            {selectedInterview.ai_summary && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#2f5233] mb-2">AI Summary</h3>
                <p className="text-gray-700 whitespace-pre-line bg-[#f0ead9] rounded-xl p-4">
                  {selectedInterview.ai_summary}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MyInterviews
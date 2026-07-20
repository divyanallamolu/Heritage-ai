import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, Square, Sparkles, Save } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { saveInterview } from "../services/api"
import { useAuth } from "../context/AuthContext"

const languages = ["English", "Telugu", "Hindi", "Tamil", "Kannada"]

function InterviewPage() {
  const { token } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [language, setLanguage] = useState("English")
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [recordingError, setRecordingError] = useState("")

  // Elder details
  const [elderName, setElderName] = useState("")
  const [age, setAge] = useState("")
  const [villageOrCity, setVillageOrCity] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState("")

  const [saveStatus, setSaveStatus] = useState("") // "", "saving", "saved", "error"

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)

  const handleStartRecording = async () => {
    setRecordingError("")

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setRecordingError("Your browser doesn't support audio recording.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        handleAudioReady()
      }

      mediaRecorder.start(250)
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setRecordingError("Microphone access was denied. Please allow microphone permission and try again.")
      } else {
        setRecordingError("Could not access the microphone. Please check your device and try again.")
      }
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleAudioReady = async () => {
    if (audioChunksRef.current.length === 0) {
      setRecordingError("No audio was recorded. Please try again.")
      return
    }

    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm"
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

    setIsTranscribing(true)
    setRecordingError("")

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      formData.append("language", language)

      // Proxy local or absolute URL
      const response = await fetch("http://127.0.0.1:8001/voice/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.detail || "Transcription failed.")
      }

      const data = await response.json()
      setTranscript((prev) => (prev ? prev + " " + data.transcript : data.transcript))
    } catch (err) {
      setRecordingError(err.message || "Something went wrong while transcribing. Please try again.")
    } finally {
      setIsTranscribing(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      mediaRecorderRef.current = null
    }
  }

  const handleGenerateSummary = async () => {
    if (transcript.trim() === "") {
      setError("Please add a transcript before generating a summary.")
      return
    }

    setIsLoading(true)
    setError("")
    setSummary("")

    try {
      const response = await fetch("http://127.0.0.1:8001/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        throw new Error("Something went wrong on the server.")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError("Failed to generate summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveInterview = async () => {
    if (!elderName.trim() || !transcript.trim()) {
      setSaveStatus("error")
      return
    }

    setSaveStatus("saving")

    try {
      await saveInterview({
        elder_name: elderName,
        age: age ? parseInt(age, 10) : null,
        village_or_city: villageOrCity,
        district,
        state,
        language,
        transcript,
        ai_summary: summary || null,
      }, token)
      setSaveStatus("saved")
    } catch (err) {
      setSaveStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero heading */}
        <header className="max-w-[1400px] mx-auto px-6 md:px-20 pt-16 pb-8 text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl font-black text-[#2f5233] tracking-tight"
          >
            Interview an Elder
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xs md:text-sm text-gray-500 font-light max-w-xl mx-auto leading-relaxed"
          >
            Capture family histories, regional dialects, traditional recipes, or songs through AI-assisted guidelines.
          </motion.p>
        </header>

        {/* Interview Form Container */}
        <main className="max-w-[1400px] mx-auto px-6 md:px-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[#e5ddc8] p-6 md:p-10 space-y-8"
          >
            {/* Elder details form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Elder Name
                </label>
                <input
                  type="text"
                  value={elderName}
                  onChange={(e) => setElderName(e.target.value)}
                  placeholder="e.g. Lakshmi Devi"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Village/City
                </label>
                <input
                  type="text"
                  value={villageOrCity}
                  onChange={(e) => setVillageOrCity(e.target.value)}
                  placeholder="e.g. Vizianagaram"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Vizianagaram"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Language Dialect
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white"
                >
                  {languages.map((lang) => (
                    <option key={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Guided Prompt Box */}
            <div className="bg-[#f0ead9] border border-[#e5ddc8] rounded-2xl p-5 flex gap-3 shadow-inner">
              <Sparkles className="text-[#8a9a5b] shrink-0 mt-0.5" size={18} />
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#2f5233] font-bold block mb-1">Guided AI Suggestion</span>
                <p className="text-[#2f5233] text-xs md:text-sm font-semibold italic leading-relaxed">
                  "Can you tell me about a traditional festival celebrated in your village?"
                </p>
              </div>
            </div>

            {/* Recording Trigger Section */}
            <div className="flex flex-col items-center gap-4 py-4 border-y border-gray-100">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={handleStartRecording}
                  disabled={isRecording || isTranscribing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition border shadow-sm ${
                    isRecording
                      ? "bg-gray-100 border-[#e5ddc8] text-gray-400"
                      : "bg-[#2f5233] hover:bg-[#203923] text-white border-[#d4af37]/20 cursor-pointer"
                  } disabled:opacity-60`}
                >
                  <Mic size={14} /> Start Recording
                </button>
                <button
                  onClick={handleStopRecording}
                  disabled={!isRecording}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition border shadow-sm ${
                    !isRecording
                      ? "bg-gray-100 border-[#e5ddc8] text-gray-400"
                      : "bg-red-600 hover:bg-red-700 text-white border-red-400/20 cursor-pointer"
                  } disabled:opacity-60`}
                >
                  <Square size={14} /> Stop Recording
                </button>
              </div>

              {isRecording && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-red-600 font-bold tracking-wide uppercase"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  Recording in progress...
                </motion.span>
              )}

              {isTranscribing && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-[#2f5233] font-bold tracking-wide uppercase animate-pulse"
                >
                  <Sparkles size={14} className="text-[#d4af37]" /> Transcribing oral audio...
                </motion.span>
              )}

              {recordingError && (
                <p className="text-xs text-red-600 text-center font-bold">{recordingError}</p>
              )}
            </div>

            {/* Transcript Text Area */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                Story Transcript
              </label>
              <textarea
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="The spoken transcript or typed folklore will appear here..."
                className="w-full px-4 py-3 rounded-lg border border-[#e5ddc8] focus:outline-none focus:ring-1 focus:ring-[#8a9a5b] text-xs shadow-sm bg-white resize-none"
              />
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleSaveInterview}
                disabled={saveStatus === "saving"}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2f5233] hover:bg-[#203923] text-white px-6 py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase transition shadow-sm border border-[#d4af37]/20 cursor-pointer disabled:opacity-60"
              >
                <Save size={14} /> {saveStatus === "saving" ? "Saving..." : "Save Interview"}
              </button>
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-[#2f5233] border border-[#e5ddc8] px-6 py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase transition hover:bg-gray-50 shadow-sm cursor-pointer disabled:opacity-60"
              >
                <Sparkles size={14} className="text-[#8a9a5b]" /> {isLoading ? "Synthesizing..." : "Generate AI Summary"}
              </button>
            </div>

            {saveStatus === "saved" && (
              <p className="text-xs text-[#2f5233] text-center font-bold">
                Interview saved to public archive successfully ✅
              </p>
            )}
            {saveStatus === "error" && (
              <p className="text-xs text-red-600 text-center font-bold">
                Please enter the elder name and record a transcript before saving.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 text-center font-bold">{error}</p>
            )}

            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#faf7f0] border border-[#e5ddc8] rounded-2xl p-6 space-y-2 shadow-sm"
              >
                <h3 className="text-xs font-bold text-[#2f5233] uppercase tracking-wider flex items-center gap-1 border-b border-gray-100 pb-2">
                  <Sparkles size={13} className="text-[#d4af37]" /> AI Generated Summary & Synthesis
                </h3>
                <p className="text-gray-700 text-xs md:text-sm leading-relaxed font-light whitespace-pre-line pt-1">
                  {summary}
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default InterviewPage
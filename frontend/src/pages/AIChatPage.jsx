import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, User, HelpCircle } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { sendChatMessage } from "../services/api"
import { Container } from "../components/ui/Container"

const initialMessages = [
  {
    sender: "ai",
    text: "Welcome to the Heritage AI Assistant. I have indexed all oral transcripts, Summaries, and Dialects from the public library archive. Ask me anything about the stories or folk recipes preserved in our database.",
  },
]

const suggestions = [
  { label: "🌾 Tell me about traditional farming", query: "Tell me about traditional farming and underground grain storage pits (Hagevu)." },
  { label: "🍲 Explain this recipe", query: "Explain traditional millet recipes and millet beer (Chi) preparation." },
  { label: "🎉 Festivals of Andhra Pradesh", query: "What are the traditional festivals of Andhra Pradesh and their historical folk lore?" },
  { label: "🏺 Folk medicine", query: "Tell me about traditional folk medicine remedies from the Nallamala forest." },
  { label: "🎵 Traditional music", query: "Explain the Kamaicha and Baul music traditions in Rajasthan and Bengal." }
]

function AIChatPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = async (messageText) => {
    const textToSend = messageText || input
    if (!textToSend || textToSend.trim() === "" || isLoading) return

    const userMessage = { sender: "user", text: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const data = await sendChatMessage(userMessage.text)
      setMessages((prev) => [...prev, { sender: "ai", text: data.answer }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "I'm having trouble connecting to the Heritage knowledge vault. Please check your connection." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Header Block (ChatGPT Style) */}
        <header className="pt-12 pb-4 text-center space-y-3">
          <Container>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-[#2f5233] tracking-tight flex items-center justify-center gap-2"
            >
              <Sparkles className="text-[#d4af37]" size={28} /> AI Heritage Assistant
            </motion.h1>
            <p className="text-base text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
              Ask questions about India's cultural traditions, elders, recipes, festivals, crafts, languages, and oral history.
            </p>
          </Container>
        </header>

        {/* Centered Conversation Viewport */}
        <main className="flex-1 flex flex-col justify-between pb-8">
          <Container>
          
          {/* Message Feed */}
          <div className="flex-1 space-y-6 py-6 overflow-y-auto min-h-[300px]">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-4 items-start ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  message.sender === "user" ? "bg-[#8a9a5b] text-white" : "bg-[#2f5233] text-white"
                }`}>
                  {message.sender === "user" ? <User size={16} /> : <Sparkles size={16} className="text-[#dfb15b]" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === "user"
                      ? "bg-[#2f5233] text-white rounded-tr-none font-medium"
                      : "bg-white text-gray-700 rounded-tl-none border border-[#e5ddc8]/55 font-light"
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}

            {/* Loading / Writing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-9 h-9 rounded-lg bg-[#2f5233] flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={16} className="text-[#dfb15b]" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-[#e5ddc8]/55 text-gray-400 rounded-tl-none text-xs flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="font-light ml-1">Consulting oral records...</span>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          </Container>

          {/* Premium Suggestion Cards (Shown when only welcome message exists) */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-4 pt-4 border-t border-[#e5ddc8]/30 mb-8"
            >
              <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold flex items-center gap-1">
                <HelpCircle size={13} className="text-[#8a9a5b]" /> Suggested Prompts
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item.query)}
                    className="bg-white border border-[#e5ddc8]/60 hover:border-[#8a9a5b]/60 hover:bg-[#faf7f0] rounded-xl p-3.5 text-left transition duration-150 cursor-pointer shadow-sm text-xs font-semibold text-[#2f5233] leading-snug active:scale-98"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Premium Prompt Input Area */}
          <div className="sticky bottom-0 bg-[#faf7f0]/85 backdrop-blur-md pt-2 pb-4">
            <Container>
              <div className="bg-white border border-[#e5ddc8] rounded-xl shadow-md p-3.5 flex items-end gap-3 transition focus-within:ring-2 focus-within:ring-[#8a9a5b] focus-within:border-[#8a9a5b]">
              
              {/* Auto-growing Textarea */}
              <textarea
                ref={textareaRef}
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about traditional farming, folk recipes, or local architecture..."
                disabled={isLoading}
                className="flex-1 bg-transparent resize-none focus:outline-none text-xs sm:text-sm text-gray-700 max-h-36 min-h-[24px] py-1 font-light leading-relaxed disabled:opacity-60"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-lg bg-[#2f5233] hover:bg-[#203923] text-white flex items-center justify-center hover:shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-[#d4af37]/20"
              >
                <Send size={15} />
              </button>

              </div>
            </Container>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  )

  function handleSuggestionClick(query) {
    setInput(query)
    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
  }
}

export default AIChatPage
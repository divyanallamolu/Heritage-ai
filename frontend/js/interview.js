/**
 * HeritageAI Interview Page Controller
 * Handles Voice Recording, Deepgram STT, Groq Voice Assistant, ElevenLabs TTS, Gemini Summary, and Saving.
 */
import { generateSummary, saveInterview, transcribeVoiceAudio } from "./api.js";
import { isLoggedIn } from "./auth.js";

let mediaRecorder = null;
let audioChunks = [];
let voiceSocket = null;

document.addEventListener("DOMContentLoaded", () => {
  setupInterviewPage();
});

function setupInterviewPage() {
  const recordBtn = document.getElementById("record-btn");
  const stopBtn = document.getElementById("stop-btn");
  const recordStatus = document.getElementById("record-status");
  const recordError = document.getElementById("record-error");
  const transcriptTextarea = document.getElementById("transcript-input");

  const generateSummaryBtn = document.getElementById("generate-summary-btn");
  const summaryTextarea = document.getElementById("summary-output");
  const summaryError = document.getElementById("summary-error");

  const saveInterviewBtn = document.getElementById("save-interview-btn");
  const saveStatus = document.getElementById("save-status");

  // WebSocket Live Voice setup
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsHost = window.location.origin.includes(":5173") || window.location.origin.includes(":3000")
    ? "127.0.0.1:8000"
    : window.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/voice`;

  function initWebSocket() {
    try {
      voiceSocket = new WebSocket(wsUrl);
      voiceSocket.onopen = () => console.log("🟢 Live Voice WebSocket connected");
      voiceSocket.onmessage = (event) => handleSocketMessage(event);
      voiceSocket.onerror = (err) => console.warn("WebSocket warning:", err);
    } catch (err) {
      console.warn("WebSocket initialization warning:", err);
    }
  }

  function handleSocketMessage(event) {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "transcript" && msg.text) {
        if (transcriptTextarea) {
          transcriptTextarea.value = transcriptTextarea.value
            ? `${transcriptTextarea.value} ${msg.text}`
            : msg.text;
        }
      } else if (msg.type === "assistant" && msg.text) {
        console.log("Groq Voice AI Response:", msg.text);
      } else if (msg.type === "audio_chunk" && msg.data) {
        playAudioChunk(msg.data);
      }
    } catch (e) {}
  }

  function playAudioChunk(base64Audio) {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.play().catch(() => {});
    } catch (e) {}
  }

  initWebSocket();

  // Microphone Recording logic
  if (recordBtn && stopBtn) {
    recordBtn.addEventListener("click", async () => {
      if (recordError) recordError.style.display = "none";
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        if (recordError) {
          recordError.textContent = "Your browser does not support audio recording.";
          recordError.style.display = "block";
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);

            // Send base64 chunk to WebSocket if connected
            if (voiceSocket && voiceSocket.readyState === WebSocket.OPEN) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Data = reader.result.split(",")[1];
                const lang = document.getElementById("language-select")?.value || "English";
                voiceSocket.send(JSON.stringify({
                  type: "audio_base64",
                  data: base64Data,
                  language: lang
                }));
              };
              reader.readAsDataURL(event.data);
            }
          }
        };

        mediaRecorder.onstop = async () => {
          if (audioChunks.length === 0) return;
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

          if (recordStatus) recordStatus.textContent = "Transcribing with Deepgram...";
          try {
            const lang = document.getElementById("language-select")?.value || "English";
            const result = await transcribeVoiceAudio(audioBlob, lang);
            if (result && result.transcript && transcriptTextarea) {
              transcriptTextarea.value = transcriptTextarea.value
                ? `${transcriptTextarea.value} ${result.transcript}`
                : result.transcript;
            }
          } catch (err) {
            console.warn("HTTP Transcription fallback note:", err.message);
          } finally {
            if (recordStatus) recordStatus.textContent = "Recording saved. Review transcript below.";
            stream.getTracks().forEach(t => t.stop());
          }
        };

        mediaRecorder.start(500); // 500ms chunk intervals
        recordBtn.style.display = "none";
        stopBtn.style.display = "inline-flex";
        if (recordStatus) recordStatus.textContent = "🔴 Recording elder story... Speak clearly.";
      } catch (err) {
        if (recordError) {
          recordError.textContent = "Microphone access denied. Please grant permission in your browser.";
          recordError.style.display = "block";
        }
      }
    });

    stopBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      stopBtn.style.display = "none";
      recordBtn.style.display = "inline-flex";
    });
  }

  // Summary Generation using Gemini
  if (generateSummaryBtn) {
    generateSummaryBtn.addEventListener("click", async () => {
      const transcript = transcriptTextarea?.value || "";
      if (!transcript.trim()) {
        if (summaryError) {
          summaryError.textContent = "Please add or record a transcript before generating a summary.";
          summaryError.style.display = "block";
        }
        return;
      }

      if (summaryError) summaryError.style.display = "none";
      generateSummaryBtn.disabled = true;
      generateSummaryBtn.textContent = "Consulting Gemini AI...";

      try {
        const res = await generateSummary(transcript);
        if (summaryTextarea) summaryTextarea.value = res.summary || "No summary generated.";
      } catch (err) {
        if (summaryError) {
          summaryError.textContent = "Failed to generate summary with Gemini. Please try again.";
          summaryError.style.display = "block";
        }
      } finally {
        generateSummaryBtn.disabled = false;
        generateSummaryBtn.textContent = "✨ Generate AI Summary";
      }
    });
  }

  // Save Interview
  if (saveInterviewBtn) {
    saveInterviewBtn.addEventListener("click", async () => {
      if (!isLoggedIn()) {
        alert("Please log in or register an account to save interviews to your profile.");
        window.location.href = "login.html";
        return;
      }

      const elderName = document.getElementById("elder-name")?.value || "";
      const ageStr = document.getElementById("age-input")?.value || "";
      const village = document.getElementById("village-input")?.value || "";
      const district = document.getElementById("district-input")?.value || "";
      const state = document.getElementById("state-input")?.value || "";
      const language = document.getElementById("language-select")?.value || "English";
      const transcript = transcriptTextarea?.value || "";
      const summary = summaryTextarea?.value || "";

      if (!elderName.trim() || !transcript.trim()) {
        if (saveStatus) {
          saveStatus.textContent = "⚠️ Please enter the elder's name and a transcript before saving.";
          saveStatus.style.color = "#dc2626";
        }
        return;
      }

      saveInterviewBtn.disabled = true;
      if (saveStatus) {
        saveStatus.textContent = "Saving interview to SQLite database...";
        saveStatus.style.color = "var(--heritage-green-600)";
      }

      try {
        await saveInterview({
          elder_name: elderName,
          age: ageStr ? parseInt(ageStr, 10) : null,
          village_or_city: village,
          district: district,
          state: state,
          language: language,
          transcript: transcript,
          ai_summary: summary
        });

        if (saveStatus) {
          saveStatus.textContent = "✅ Interview successfully preserved! View in My Profile or Heritage Library.";
          saveStatus.style.color = "#16a34a";
        }
      } catch (err) {
        if (saveStatus) {
          saveStatus.textContent = `❌ Save failed: ${err.message}`;
          saveStatus.style.color = "#dc2626";
        }
      } finally {
        saveInterviewBtn.disabled = false;
      }
    });
  }
}

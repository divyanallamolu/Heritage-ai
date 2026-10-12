/**
 * HeritageAI Interview Page Controller
 * Handles Voice Recording, Deepgram STT, Groq Voice Assistant, ElevenLabs TTS, Gemini Summary, and Saving.
 */
import { generateSummary, saveInterview, transcribeVoiceAudio, getWebSocketUrl } from "./api.js?v=2";
import { isLoggedIn } from "./auth.js";

let mediaRecorder = null;
let audioChunks = [];
let voiceSocket = null;
let activeMediaStream = null;
let committedTranscript = "";
let interimTranscript = "";
let receivedWsTranscript = false;

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

  function updateTranscriptDisplay() {
    if (!transcriptTextarea) return;
    const combined = interimTranscript
      ? (committedTranscript ? `${committedTranscript} ${interimTranscript}` : interimTranscript)
      : committedTranscript;
    transcriptTextarea.value = combined;
    transcriptTextarea.scrollTop = transcriptTextarea.scrollHeight;
  }

  function cleanupLiveSession() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }
    mediaRecorder = null;

    if (activeMediaStream) {
      try {
        activeMediaStream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      activeMediaStream = null;
    }

    if (voiceSocket) {
      try {
        voiceSocket.onopen = null;
        voiceSocket.onmessage = null;
        voiceSocket.onerror = null;
        voiceSocket.onclose = null;
        if (voiceSocket.readyState === WebSocket.OPEN || voiceSocket.readyState === WebSocket.CONNECTING) {
          voiceSocket.close();
        }
      } catch (e) {}
      voiceSocket = null;
    }
  }

  // Microphone Recording & Live WebSocket Streaming logic
  if (recordBtn && stopBtn) {
    recordBtn.addEventListener("click", async () => {
      if (recordError) recordError.style.display = "none";
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
        if (recordError) {
          recordError.textContent = "Your browser does not support audio recording.";
          recordError.style.display = "block";
        }
        if (recordStatus) recordStatus.textContent = "Error: Audio recording unsupported.";
        return;
      }

      cleanupLiveSession();

      // Preserve existing transcript text as base
      committedTranscript = transcriptTextarea?.value ? transcriptTextarea.value.trim() : "";
      interimTranscript = "";
      receivedWsTranscript = false;
      audioChunks = [];

      if (recordStatus) recordStatus.textContent = "Connecting to microphone & live transcriber...";

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        activeMediaStream = stream;
      } catch (err) {
        console.error("Microphone access error:", err);
        if (recordError) {
          recordError.textContent = "Microphone access denied. Please grant microphone permission in your browser.";
          recordError.style.display = "block";
        }
        if (recordStatus) recordStatus.textContent = "Error: Microphone permission denied.";
        return;
      }

      // Determine audio mimeType
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      }

      const lang = document.getElementById("language-select")?.value || "English";
      const wsUrl = `${getWebSocketUrl()}?language=${encodeURIComponent(lang)}`;

      let recorderStarted = false;

      function startRecorder() {
        if (recorderStarted || !activeMediaStream) return;
        recorderStarted = true;
        try {
          mediaRecorder = mimeType
            ? new MediaRecorder(activeMediaStream, { mimeType })
            : new MediaRecorder(activeMediaStream);

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              audioChunks.push(event.data);

              // Stream binary chunk to WebSocket if connected
              if (voiceSocket && voiceSocket.readyState === WebSocket.OPEN) {
                try {
                  voiceSocket.send(event.data);
                } catch (sendErr) {
                  console.warn("WebSocket audio chunk send failed:", sendErr);
                }
              }
            }
          };

          mediaRecorder.onstop = async () => {
            if (audioChunks.length === 0) return;
            const audioBlob = new Blob(audioChunks, { type: mimeType || "audio/webm" });

            // If WebSocket streaming did not produce a transcript, use HTTP fallback
            if (!receivedWsTranscript) {
              if (recordStatus) recordStatus.textContent = "Transcribing with Deepgram via HTTP fallback...";
              try {
                const result = await transcribeVoiceAudio(audioBlob, lang);
                if (result && result.transcript && transcriptTextarea) {
                  const newText = result.transcript.trim();
                  if (newText) {
                    committedTranscript = committedTranscript
                      ? `${committedTranscript} ${newText}`
                      : newText;
                    interimTranscript = "";
                    updateTranscriptDisplay();
                  }
                }
                if (recordStatus) recordStatus.textContent = "Recording stopped. Review transcript below.";
              } catch (httpErr) {
                console.warn("HTTP Transcription fallback error:", httpErr.message);
                if (recordError) {
                  recordError.textContent = `Transcription failed: ${httpErr.message}`;
                  recordError.style.display = "block";
                }
                if (recordStatus) recordStatus.textContent = "Transcription error occurred.";
              }
            } else {
              if (recordStatus) recordStatus.textContent = "Recording stopped. Review transcript below.";
            }

            cleanupLiveSession();
          };

          // 250ms chunk interval for low latency live streaming
          mediaRecorder.start(250);
          recordBtn.style.display = "none";
          stopBtn.style.display = "inline-flex";
          if (recordStatus) recordStatus.textContent = "🎙️ Listening / Transcribing live... Speak clearly.";
        } catch (recErr) {
          console.error("MediaRecorder start error:", recErr);
          if (recordError) {
            recordError.textContent = `Could not start recorder: ${recErr.message}`;
            recordError.style.display = "block";
          }
          if (recordStatus) recordStatus.textContent = "Error starting audio recorder.";
        }
      }

      // Initialize live WebSocket
      try {
        voiceSocket = new WebSocket(wsUrl);

        voiceSocket.onopen = () => {
          console.log("🟢 Live Voice WebSocket connected to", wsUrl);
          try {
            voiceSocket.send(
              JSON.stringify({
                type: "start",
                language: lang,
                mimeType: mimeType,
              })
            );
          } catch (e) {}
          startRecorder();
        };

        voiceSocket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === "ready") {
              startRecorder();
            } else if (msg.type === "transcript") {
              const text = (msg.text || "").trim();
              if (text) {
                receivedWsTranscript = true;
                if (msg.is_final) {
                  // Segment is finalized: commit it
                  committedTranscript = committedTranscript
                    ? `${committedTranscript} ${text}`
                    : text;
                  interimTranscript = "";
                } else {
                  // Segment is interim: update temporary text
                  interimTranscript = text;
                }
                updateTranscriptDisplay();
              }
            } else if (msg.type === "session_ended") {
              if (recordStatus) recordStatus.textContent = "Recording stopped. Review transcript below.";
            } else if (msg.type === "error") {
              const errMsg = msg.message || msg.text || "Deepgram streaming error.";
              console.warn("WebSocket server error:", errMsg);
              if (recordError) {
                recordError.textContent = `Server: ${errMsg}`;
                recordError.style.display = "block";
              }
              if (recordStatus && !receivedWsTranscript) {
                recordStatus.textContent = "Live transcription error (will transcribe via HTTP on stop).";
              }
            }
          } catch (e) {}
        };

        voiceSocket.onerror = (err) => {
          console.warn("WebSocket warning (will use HTTP fallback on stop):", err);
          if (recordStatus && !receivedWsTranscript) {
            recordStatus.textContent = "Streaming warning (will use HTTP fallback on stop).";
          }
          // Start recording locally even if WebSocket encounters error
          startRecorder();
        };

        voiceSocket.onclose = () => {
          console.log("WebSocket disconnected.");
        };
      } catch (wsInitErr) {
        console.warn("WebSocket init error (recording locally with HTTP fallback):", wsInitErr);
        startRecorder();
      }
    });

    stopBtn.addEventListener("click", () => {
      stopBtn.style.display = "none";
      recordBtn.style.display = "inline-flex";

      if (recordStatus) recordStatus.textContent = "Finalizing transcript...";

      // Flush WebSocket stream
      if (voiceSocket && voiceSocket.readyState === WebSocket.OPEN) {
        try {
          voiceSocket.send(JSON.stringify({ type: "stop" }));
        } catch (e) {}
      }

      // Stop mediaRecorder to trigger onstop
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      } else {
        cleanupLiveSession();
      }
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

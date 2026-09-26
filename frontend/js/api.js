/**
 * Centralized API Module for HeritageAI
 * All communication with backend endpoints goes through this file.
 */

const API_BASE_URL = (window.location.origin && window.location.protocol.startsWith("http"))
  ? window.location.origin
  : `${window.location.protocol === "file:" ? "http:" : window.location.protocol}//${window.location.hostname || "localhost"}:5500`;

/**
 * Generic fetch wrapper with automatic Authorization header injection
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("heritageai_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || `API request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// Authentication API calls
export async function registerUser(name, email, password) {
  return await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email, password) {
  return await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return await apiRequest("/auth/me");
}

// Interview & Library API calls
export async function getPublicLibrary() {
  return await apiRequest("/library");
}

export async function getMyInterviews() {
  return await apiRequest("/interviews");
}

export async function saveInterview(interviewData) {
  return await apiRequest("/interviews", {
    method: "POST",
    body: JSON.stringify(interviewData),
  });
}

export async function deleteInterview(id) {
  return await apiRequest(`/interviews/${id}`, {
    method: "DELETE",
  });
}

// AI Services (Summary & Chat)
export async function generateSummary(transcript) {
  return await apiRequest("/summary", {
    method: "POST",
    body: JSON.stringify({ transcript }),
  });
}

export async function sendChatMessage(message) {
  return await apiRequest("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// Direct Voice Upload fallback (HTTP)
export async function transcribeVoiceAudio(audioBlob, language = "English") {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("language", language);

  const token = localStorage.getItem("heritageai_token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || "Transcription failed.");
  }
  return data;
}

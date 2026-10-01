/**
 * Centralized API Module for HeritageAI
 * All communication with backend endpoints goes through this file.
 */

export function getApiBaseUrl() {
  if (window.HERITAGE_API_BASE && !window.HERITAGE_API_BASE.includes(":5500")) {
    return window.HERITAGE_API_BASE;
  }
  const stored = localStorage.getItem("heritageai_api_url");
  if (stored && !stored.includes(":5500") && stored !== window.location.origin) {
    return stored;
  }
  if (stored) {
    localStorage.removeItem("heritageai_api_url");
  }

  const hostname = window.location.hostname || "localhost";
  const isProd = hostname.includes("onrender.com") || window.location.protocol === "https:";
  if (isProd) {
    return "https://heritage-ai-2.onrender.com";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${hostname}:8000`;
}

export const API_BASE_URL = getApiBaseUrl();

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

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new Error("Unable to connect to the server. Please make sure the backend is running.");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    if (typeof data?.detail === "string") {
      errorMsg = data.detail;
    } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
      errorMsg = data.detail.map(err => err.msg || JSON.stringify(err)).join(", ");
    }
    throw new Error(errorMsg);
  }

  if (data === null || typeof data !== "object") {
    throw new Error(`API endpoint '${endpoint}' returned a non-JSON response.`);
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

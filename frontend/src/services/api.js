const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

async function parseErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data?.detail) {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      return JSON.stringify(data.detail);
    }
    if (data?.message) {
      return data.message;
    }
  } catch {
    // fall back to plain text if the response is not JSON
  }

  try {
    const text = await response.text();
    if (text) {
      return text;
    }
  } catch {
    // ignore text parsing errors
  }

  return fallbackMessage;
}

// Handle 401 errors by clearing token and redirecting to login
function handleAuthError() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export async function sendChatMessage(message) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message.");
  }

  return response.json();
}

export async function registerUser(name, email, password) {
  const url = `${API_URL}/auth/register`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to register user.");
    throw new Error(message);
  }

  return response.json();
}

export async function loginUser(email, password) {
  const url = `${API_URL}/auth/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to log in.");
    throw new Error(message);
  }

  return response.json();
}

export async function fetchCurrentUser(token) {
  const url = `${API_URL}/auth/me`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to fetch current user.");
    throw new Error(message);
  }

  return response.json();
}

export async function logoutUser() {
  return { success: true };
}

export async function testBackend() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function saveInterview(interviewData, token) {
  const response = await fetch(`${API_URL}/interviews`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(interviewData),
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to save interview.");
  }

  return response.json();
}

export async function getPublicLibrary() {
  const response = await fetch(`${API_URL}/library`);

  if (!response.ok) {
    throw new Error("Failed to fetch public interviews.");
  }

  return response.json();
}

export async function getAllInterviews() {
  const response = await fetch(`${API_URL}/interviews`);

  if (!response.ok) {
    throw new Error("Failed to fetch interviews.");
  }

  return response.json();
}

export async function getMyInterviews(token) {
  const response = await fetch(`${API_URL}/interviews`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch your interviews.");
  }

  return response.json();
}

export async function getInterviewById(id, token) {
  const response = await fetch(`${API_URL}/interviews/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch interview.");
  }

  return response.json();
}

export async function deleteInterview(id, token) {
  const response = await fetch(`${API_URL}/interviews/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to delete interview.");
  }

  return response.json();
}

export function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

export function formatDate(dateString) {
  if (!dateString) return "Date not available";
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return "Date not available";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const avatarGradients = [
  "from-[#2f5233] to-[#8a9a5b]",
  "from-[#8a5233] to-[#c9a15a]",
  "from-[#5c4a2f] to-[#a68a5b]"
];

export function getAvatarGradient(name) {
  const sum = [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarGradients[sum % avatarGradients.length];
}

export function truncate(text, maxLength = 160) {
  if (!text) return "No summary generated for this interview yet.";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

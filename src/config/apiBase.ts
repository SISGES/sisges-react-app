export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const trimmed = raw?.trim();
  if (trimmed) return trimmed.replace(/\/$/, "");
  return "http://localhost:8080/api";
}

export function getBackendOrigin(): string {
  const base = getApiBaseUrl();
  if (base.startsWith("/")) {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }
  return base.replace(/\/api\/?$/, "");
}

export function getWebSocketUrl(): string {
  const origin = getBackendOrigin();
  const protocol = origin.startsWith("https") ? "wss" : "ws";
  const hostPort = origin.replace(/^https?:\/\//, "");
  return `${protocol}://${hostPort}/ws`;
}

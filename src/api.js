const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Cannot connect to the server. Check that the backend is running and VITE_API_URL is correct.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the HTTP status message when the server did not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  listItems: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q?.trim()) params.set("q", filters.q.trim());
    if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
    if (filters.category && filters.category !== "ALL") params.set("category", filters.category);
    const query = params.toString();
    return request(`/items${query ? `?${query}` : ""}`);
  },
  createItem: (data) => request("/items", { method: "POST", body: JSON.stringify(data) }),
  createClaim: (itemId, data) => request(`/items/${itemId}/claims`, { method: "POST", body: JSON.stringify(data) }),
  health: () => request("/health")
};
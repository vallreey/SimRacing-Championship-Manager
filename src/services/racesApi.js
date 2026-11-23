const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Request gagal (${response.status}).`;
    throw new Error(message);
  }

  return data;
}

export function getRaces() {
  return request("/races");
}

export function createRace(race) {
  return request("/races", {
    method: "POST",
    body: JSON.stringify(race),
  });
}

export function updateRace(id, race) {
  return request(`/races/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(race),
  });
}

export function deleteRace(id) {
  return request(`/races/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

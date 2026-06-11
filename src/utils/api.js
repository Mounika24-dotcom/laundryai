const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const api = {
  // Auth
  signup: (user) => request("/api/signup", { method: "POST", body: JSON.stringify(user) }),
  login: (creds) => request("/api/login", { method: "POST", body: JSON.stringify(creds) }),

  // Machines
  getMachines: () => request("/api/machines"),

  // Reservations
  createReservation: (res) => request("/api/reservations", { method: "POST", body: JSON.stringify(res) }),
  getUserReservations: (userId) => request(`/api/reservations/${userId}`),
  cancelReservation: (id) => request(`/api/reservations/${id}`, { method: "DELETE" }),

  // Notifications
  getNotifications: (userId) => request(`/api/notifications/${userId}`),
  markRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),

  // Payments
  processPayment: (payment) => request("/api/payments", { method: "POST", body: JSON.stringify(payment) }),
};

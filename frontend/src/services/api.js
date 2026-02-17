// services/api.js

const API_URL = "http://localhost:5520/api";

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, message: data.error || "Erreur" };
    }

    return data;
  } catch (error) {
    if (!error.status) {
      throw { status: 0, message: "Serveur inaccessible" };
    }
    throw error;
  }
}

export const authService = {
  register: (userData) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (email, password) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => fetchAPI("/auth/me"),
};

export const reservationService = {
  // Récupérer les réservations de la semaine
  getWeekReservations: () => fetchAPI("/reservations"),

  // Récupérer les réservations d'un utilisateur
  getUserReservations: (userId) => fetchAPI(`/reservations/user/${userId}`),

  // Récupérer une réservation
  getReservation: (id) => fetchAPI(`/reservations/${id}`),

  // Créer une réservation
  createReservation: (reservationData) =>
    fetchAPI("/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData),
    }),

  // Modifier une réservation
  updateReservation: (id, reservationData) =>
    fetchAPI(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    }),

  // Supprimer une réservation
  deleteReservation: (id) =>
    fetchAPI(`/reservations/${id}`, {
      method: "DELETE",
    }),
};

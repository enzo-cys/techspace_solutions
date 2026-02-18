/**
 * Service API centralisé
 * Gère toutes les requêtes HTTP vers le backend avec support des cookies JWT
 * 
 * Important: credentials: "include" envoie automatiquement les cookies avec chaque requête
 * Le backend configure les cookies httpOnly pour la sécurité (protection XSS)
 */

const API_URL = "http://localhost:5520/api";

/**
 * Helper de requête générique avec gestion d'erreurs centralisée
 * @param {string} endpoint - URL relative (ex: "/auth/login")
 * @param {Object} options - Options de fetch (method, body, headers, etc)
 * @returns {Promise<Object>} Réponse parsée en JSON
 * @throws {Object} Erreur avec {status, message}
 */
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Important: envoie les cookies automatiquement
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
  // Crée un nouveau compte utilisateur
  // Le backend envoie automatiquement le JWT en cookie
  register: (userData) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Connecte un utilisateur existant
  // Le backend envoie automatiquement le JWT en cookie
  login: (email, password) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Récupère le profil de l'utilisateur actuellement connecté
  // Utilise le JWT depuis les cookies
  getProfile: () => fetchAPI("/auth/me"),
};

export const reservationService = {
  // Récupère les réservations de la SEMAINE courante (lun-ven)
  getWeekReservations: () => fetchAPI("/reservations"),

  // Récupère toutes les réservations d'un utilisateur spécifique
  getUserReservations: (userId) => fetchAPI(`/reservations/user/${userId}`),

  // Récupère UNE réservation par ID
  getReservation: (id) => fetchAPI(`/reservations/${id}`),

  // Crée une nouvelle réservation
  // Validation: horaires (8h-18h début, jusqu'à 19h fin), durée >= 1h, lun-ven
  createReservation: (reservationData) =>
    fetchAPI("/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData),
    }),

  // Modifie une réservation existante (titre, horaires)
  // Seul le propriétaire peut modifier
  updateReservation: (id, reservationData) =>
    fetchAPI(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    }),

  // Supprime une réservation
  // Le propriétaire OU n'importe qui peut supprimer les réservations d'un compte anonymisé
  deleteReservation: (id) =>
    fetchAPI(`/reservations/${id}`, {
      method: "DELETE",
    }),
};

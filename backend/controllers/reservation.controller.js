// controllers/reservation.controller.js
import Reservation from "../models/reservation.model.js";

// GET /api/reservations - Toutes les réservations de la semaine
export const getWeekReservations = async (req, res) => {
  try {
    // Récupère le lundi de la semaine en cours
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const dateStr = monday.toISOString().split("T")[0];
    const reservations = await Reservation.findByWeek(dateStr);

    res.json({ reservations });
  } catch (error) {
    console.error("Erreur récupération réservations:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /api/reservations/user/:userId - Réservations d'un utilisateur
export const getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;

    const reservations = await Reservation.findByUserId(userId);
    res.json({ reservations });
  } catch (error) {
    console.error("Erreur récupération réservations utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /api/reservations/:id - Récupérer UNE réservation
export const getReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    res.json({ reservation });
  } catch (error) {
    console.error("Erreur récupération réservation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/reservations - Créer une réservation
export const createReservation = async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;
    const userId = req.user.id;

    // Validations
    if (!title || !start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "Titre, date début et date fin requis" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const now = new Date();

    // Vérifier que les dates ne sont pas dans le passé
    if (startDate < now) {
      return res
        .status(400)
        .json({ error: "Impossible de réserver dans le passé" });
    }

    // Vérifier la durée minimale (1 heure)
    const durationMs = endDate - startDate;
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours < 1) {
      return res.status(400).json({ error: "Durée minimale: 1 heure" });
    }

    // Vérifier les horaires (8h-19h)
    if (startDate.getHours() < 8 || endDate.getHours() > 19) {
      return res
        .status(400)
        .json({ error: "Horaires entre 8h et 19h uniquement" });
    }

    // Vérifier lundi-vendredi
    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res
        .status(400)
        .json({ error: "Réservation lundi-vendredi uniquement" });
    }

    // Vérifier les conflits
    const hasConflict = await Reservation.hasConflict(startDate, endDate);
    if (hasConflict) {
      return res.status(409).json({ error: "Créneau déjà réservé" });
    }

    // Créer la réservation
    const reservation = await Reservation.create({
      title,
      startDate,
      endDate,
      userId,
    });

    res.status(201).json({
      message: "Réservation créée avec succès",
      reservation,
    });
  } catch (error) {
    console.error("Erreur création réservation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /api/reservations/:id - Modifier une réservation
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_date, end_date } = req.body;
    const userId = req.user.id;

    // Vérifier que c'est le propriétaire
    const isOwner = await Reservation.isOwner(id, userId);
    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Vous ne pouvez modifier que vos réservations" });
    }

    // Validations similaires à la création
    if (!title || !start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "Titre, date début et date fin requis" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const now = new Date();

    if (startDate < now) {
      return res
        .status(400)
        .json({ error: "Impossible de réserver dans le passé" });
    }

    const durationMs = endDate - startDate;
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours < 1) {
      return res.status(400).json({ error: "Durée minimale: 1 heure" });
    }

    if (startDate.getHours() < 8 || endDate.getHours() > 19) {
      return res
        .status(400)
        .json({ error: "Horaires entre 8h et 19h uniquement" });
    }

    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res
        .status(400)
        .json({ error: "Réservation lundi-vendredi uniquement" });
    }

    // Vérifier les conflits (sauf cette réservation)
    const hasConflict = await Reservation.hasConflict(startDate, endDate, id);
    if (hasConflict) {
      return res.status(409).json({ error: "Créneau déjà réservé" });
    }

    // Mettre à jour
    const reservation = await Reservation.update(id, {
      title,
      startDate,
      endDate,
    });

    res.json({
      message: "Réservation mise à jour avec succès",
      reservation,
    });
  } catch (error) {
    console.error("Erreur modification réservation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/reservations/:id - Supprimer une réservation
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que c'est le propriétaire
    const isOwner = await Reservation.isOwner(id, userId);
    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Vous ne pouvez supprimer que vos réservations" });
    }

    const deleted = await Reservation.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    res.json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression réservation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

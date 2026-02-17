// routes/reservation.routes.js
import { Router } from "express";
import {
  getWeekReservations,
  getUserReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation,
} from "../controllers/reservation.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// Toutes les routes de réservations nécessitent l'authentification
router.use(authMiddleware);

// GET - Réservations de la semaine en cours
router.get("/", getWeekReservations);

// GET - Réservations d'un utilisateur
router.get("/user/:userId", getUserReservations);

// GET - Récupérer une réservation spécifique
router.get("/:id", getReservation);

// POST - Créer une réservation
router.post("/", createReservation);

// PUT - Modifier une réservation
router.put("/:id", updateReservation);

// DELETE - Supprimer une réservation
router.delete("/:id", deleteReservation);

export default router;

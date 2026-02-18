// models/reservation.model.js
import { query } from "../config/db.js";

/**
 * Modèle Reservation
 * Gère toutes les opérations sur les réservations en base de données
 * Chaque réservation est liée à un utilisateur et s'étend sur une plage horaire
 */
const Reservation = {
  /**
   * Récupère TOUTES les réservations avec informations utilisateur complètes
   * @returns {Promise<Array>} Liste des réservations avec user info
   */
  async findAll() {
    const sql = `
      SELECT r.*, u.name, u.lastname, u.email 
      FROM reservations r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.start_date ASC
    `;
    return await query(sql);
  },

  /**
   * Récupère UNE réservation par ID avec infos utilisateur
   * @param {number} id - ID de la réservation
   * @returns {Promise<Object|null>} Réservation avec user info ou null
   */
  async findById(id) {
    const sql = `
      SELECT r.*, u.name, u.lastname, u.email 
      FROM reservations r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  /**
   * Récupère toutes les réservations d'un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Réservations de cet utilisateur
   */
  async findByUserId(userId) {
    const sql = `
      SELECT r.*, u.name, u.lastname, u.email 
      FROM reservations r 
      JOIN users u ON r.user_id = u.id
      WHERE user_id = ? 
      ORDER BY start_date ASC
    `;
    return await query(sql, [userId]);
  },

  /**
   * Récupère les réservations d'une SEMAINE (lun-ven uniquement, 8h-18h)
   * @param {string} startOfWeek - Date du lundi (format YYYY-MM-DD)
   * @returns {Promise<Array>} Réservations de cette semaine
   */
  async findByWeek(startOfWeek) {
    const sql = `
      SELECT r.*, u.name, u.lastname, u.email 
      FROM reservations r 
      JOIN users u ON r.user_id = u.id 
      WHERE DATE(r.start_date) >= ? 
      AND DATE(r.start_date) < DATE_ADD(?, INTERVAL 5 DAY)
      AND DAYOFWEEK(r.start_date) BETWEEN 2 AND 6
      ORDER BY r.start_date ASC
    `;
    return await query(sql, [startOfWeek, startOfWeek]);
  },

  /**
   * Vérifie s'il y a un CONFLIT DE RÉSERVATION (deux réservations qui se chevauchent)
   * Condition: start_date < ? AND end_date > ? (vérification du chevauchement)
   * @param {Date} startDate - Heure de début souhaitée
   * @param {Date} endDate - Heure de fin souhaitée
   * @param {number} excludeId - ID de réservation à exclure (pour les modifications)
   * @returns {Promise<boolean>} True si conflit existe
   */
  async hasConflict(startDate, endDate, excludeId = null) {
    let sql = `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE (start_date < ? AND end_date > ?)
    `;
    const params = [endDate, startDate];

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    const results = await query(sql, params);
    return results[0].count > 0;
  },

  /**
   * Crée une nouvelle réservation en base de données
   * @param {Object} params - {title, startDate, endDate, userId}
   * @returns {Promise<Object>} Réservation créée avec son ID
   */
  async create({ title, startDate, endDate, userId }) {
    const sql = `
      INSERT INTO reservations (title, start_date, end_date, user_id)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [title, startDate, endDate, userId]);
    return {
      id: result.insertId,
      title,
      start_date: startDate,
      end_date: endDate,
      user_id: userId,
    };
  },

  /**
   * Met à jour une réservation existante et retourne les données complètes
   * @param {number} id - ID de la réservation
   * @param {Object} params - {title, startDate, endDate}
   * @returns {Promise<Object>} Réservation mise à jour avec user info
   */
  async update(id, { title, startDate, endDate }) {
    const sql = `
      UPDATE reservations 
      SET title = ?, start_date = ?, end_date = ? 
      WHERE id = ?
    `;
    await query(sql, [title, startDate, endDate, id]);
    return await Reservation.findById(id);
  },

  /**
   * Supprime une réservation de la base de données
   * @param {number} id - ID de la réservation
   * @returns {Promise<boolean>} True si suppression réussie
   */
  async delete(id) {
    const sql = "DELETE FROM reservations WHERE id = ?";
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Vérifie si un utilisateur est le propriétaire d'une réservation
   * Utilisé pour autoriser la modification/suppression (ownership check)
   * @param {number} reservationId - ID de la réservation
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<boolean>} True si propriétaire
   */
  async isOwner(reservationId, userId) {
    const sql = "SELECT user_id FROM reservations WHERE id = ?";
    const results = await query(sql, [reservationId]);
    if (results.length === 0) return false;
    return results[0].user_id === userId;
  },
};

export default Reservation;

// models/reservation.model.js
import { query } from "../config/db.js";

const Reservation = {
  // Trouver toutes les réservations
  async findAll() {
    const sql = `
      SELECT r.*, u.name, u.lastname, u.email 
      FROM reservations r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.start_date ASC
    `;
    return await query(sql);
  },

  // Trouver par ID
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

  // Trouver les réservations par ID utilisateur
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

  // Trouver les réservations d'une semaine (lun-ven, horaires 8h-19h)
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

  // Vérifier s'il y a un conflit de réservation
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

  // Créer une réservation
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

  // Mettre à jour une réservation
  async update(id, { title, startDate, endDate }) {
    const sql = `
      UPDATE reservations 
      SET title = ?, start_date = ?, end_date = ? 
      WHERE id = ?
    `;
    await query(sql, [title, startDate, endDate, id]);
    return await Reservation.findById(id);
  },

  // Supprimer une réservation
  async delete(id) {
    const sql = "DELETE FROM reservations WHERE id = ?";
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  // Vérifier si l'utilisateur est le propriétaire de la réservation
  async isOwner(reservationId, userId) {
    const sql = "SELECT user_id FROM reservations WHERE id = ?";
    const results = await query(sql, [reservationId]);
    if (results.length === 0) return false;
    return results[0].user_id === userId;
  },
};

export default Reservation;

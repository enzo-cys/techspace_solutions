// models/user.model.js
import { query } from "../config/db.js"; // Extension .js obligatoire ! ⬅️
import bcrypt from "bcrypt";
const User = {
  // Trouver par email

  async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const results = await query(sql, [email.toLowerCase()]);
    return results[0] || null;
  },

  // Trouver par ID (sans le password)
  async findById(id) {
    const sql =
      "SELECT id, email, name, lastname, created_at FROM users WHERE id = ?";
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Créer un utilisateur
  async create({ email, password, name, lastname }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
INSERT INTO users (email, password, name, lastname)
VALUES (?, ?, ?, ?)
`;
    const result = await query(sql, [
      email.toLowerCase(),
      hashedPassword,
      name,
      lastname,
    ]);
    return { id: result.insertId, email, name, lastname };
  },

  // Vérifier le mot de passe
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

export default User;

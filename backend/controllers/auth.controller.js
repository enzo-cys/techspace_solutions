// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { query } from "../config/db.js";
import bcrypt from "bcrypt";

// Génère un token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, name, lastname } = req.body;

    if (!email || !password || !name || !lastname) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const user = await User.create({ email, password, name, lastname });
    const token = generateToken(user);

    // Envoyer le JWT en cookie (httpOnly + secure en production)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
      },
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(password, user.password))) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = generateToken(user);

    // Envoyer le JWT en cookie (httpOnly + secure en production)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
      },
    });
  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /api/auth/me
export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/anonymize - Anonymiser le compte (RGPD)
export const anonymize = async (req, res) => {
  try {
    const userId = req.user.id;

    // Anonymiser les données personnelles
    const anonymizedName = `Anonyme-${userId}`;
    const anonymizedEmail = `anonyme-${userId}@anonymized.local`;

    // Générer un password inaccessible pour que l'utilisateur ne puisse pas se reconnecter
    const inaccessiblePassword = await bcrypt.hash(
      `deleted-${userId}-${Date.now()}`,
      10,
    );

    const sql = `
      UPDATE users 
      SET name = ?, lastname = ?, email = ?, password = ? 
      WHERE id = ?
    `;
    await query(sql, [
      anonymizedName,
      "X",
      anonymizedEmail,
      inaccessiblePassword,
      userId,
    ]);

    // Invalider le JWT en supprimant le cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et que l'utilisateur n'a pas été supprimé/anonymisé
 * 
 * Flux:
 * 1. Lire le token depuis les cookies (priorité) ou Authorization header
 * 2. Vérifier la signature JWT
 * 3. Vérifier que l'utilisateur existe toujours en DB
 * 4. Vérifier que le compte n'a pas été anonymisé (email pattern)
 * 5. Attacher req.user et passer au prochain handler
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Lire le token depuis les cookies (priorité) ou Authorization header
    // Les cookies sont préférés car httpOnly (protection XSS)
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier que l'utilisateur n'a pas été supprimé/anonymisé
    if (user.email.startsWith("anonyme-")) {
      return res.status(401).json({ error: "Compte supprimé" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expiré" });
    }
    return res.status(401).json({ error: "Token invalide" });
  }
};

export default authMiddleware;

/**
 * Context d'authentification globale de l'application
 * Gère l'authentification via JWT stocké en cookies httpOnly
 * 
 * Flux:
 * - Au mount: vérifie si l'utilisateur est connecté via GET /api/auth/me
 * - Les cookies sont automatiquement envoyés par le navigateur (credentials: include)
 * - Pas besoin de localStorage
 * - logout() supprime le cookie manuellement
 */
import { createContext, useState, useEffect } from "react";
import { authService } from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authChecking = async () => {
      // Les cookies sont envoyés automatiquement avec credentials: true
      // Pas besoin de vérifier localStorage
      try {
        const data = await authService.getProfile();
        setUser(data.user);
      } catch (error) {
        console.log("Non authentifié");
      } finally {
        setLoading(false);
      }
    };
    authChecking();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    // Le JWT est automatiquement en cookie (backend le gère)
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    // Le JWT est automatiquement en cookie (backend le gère)
    setUser(data.user);
    return data;
  };

  const logout = () => {
    // Supprimer le cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Vérifications
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="TechSpace" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Inscription</h1>
          <p className="text-gray-400">Créez votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                placeholder="Jean"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Nom
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                placeholder="Dupont"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 px-6 rounded transition mt-6"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
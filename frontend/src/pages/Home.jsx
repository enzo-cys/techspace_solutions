// pages/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img src="/logo.png" alt="TechSpace" className="h-24 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-white mb-6">
            TechSpace Solutions
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            Système de réservation de salle de réunion
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Gérez facilement les réservations de votre salle de réunion.
            Planning en temps réel, réservations simples et efficaces.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 mb-16">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded transition"
            >
              Accéder au Planning
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded transition"
              >
                Commencer
              </Link>
              <Link
                to="/login"
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg px-8 py-4 rounded transition border border-zinc-700"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>


      </div>
    </div>
  );
}

export default Home;
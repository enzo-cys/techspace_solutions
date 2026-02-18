// components/Header.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="TechSpace" className="h-16" />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-gray-300 hover:text-white transition"
              }
            >
              Accueil
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-red-500 font-semibold"
                    : "text-gray-300 hover:text-white transition"
                }
              >
                Planning
              </NavLink>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition"
                >
                  {user?.name} {user?.lastname}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

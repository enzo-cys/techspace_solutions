// components/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <Link to="/">Starter Kit</Link>

      <nav>
        <NavLink to="/">Accueil</NavLink>
        {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
      </nav>

      <div>
        {isAuthenticated ? (
          <>
            <span>{user?.firstname}</span>
            <button onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">S'inscrire</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

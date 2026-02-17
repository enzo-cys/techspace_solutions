import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Bienvenue sur le Starter Kit</h1>

      <p>Template moderne React + Node.js + MySQL</p>

      <div>
        {isAuthenticated ? (
          <Link to="/dashboard">Accéder au Dashboard</Link>
        ) : (
          <>
            <Link to="/register">Commencer</Link>

            <Link to="/login">Se connecter</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
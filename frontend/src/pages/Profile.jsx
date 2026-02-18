// pages/Profile.jsx
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible. Vous ne pourrez plus vous connecter.")) {
      try {
        const response = await fetch("http://localhost:5520/api/auth/anonymize", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert("Compte supprimé avec succès");
        logout();
        navigate("/login");
      } catch (err) {
        alert("Erreur: " + err.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Mon Profil</h1>

        {/* Carte profil */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Prénom</label>
              <p className="text-white text-lg">{user?.name}</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Nom</label>
              <p className="text-white text-lg">{user?.lastname}</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <p className="text-white text-lg">{user?.email}</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Membre depuis</label>
              <p className="text-white text-lg">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded transition"
          >
            Se déconnecter
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded transition"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

/**
 * Page Dashboard - Calendrier de réservation de salle
 * 
 * Affiche un calendrier hebdomadaire (lun-ven) avec créneaux horaires (8h-18h)
 * Permet de créer, modifier et supprimer des réservations
 * 
 * Logique:
 * - Au Load: récupère les réservations de la semaine courante
 * - Click sur créneau libre: modal de création
 * - Click sur créneau réservé (mine ou anonyme): modal d'édition
 * - Les horaires vont de 8h à 18h (affiché), fin possible jusqu'à 19h
 * - Validation: durée >= 1h, lun-ven uniquement, pas dans le passé
 */
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { reservationService } from "../services/api.js";

function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [title, setTitle] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStartHour, setEditStartHour] = useState("");
  const [editEndHour, setEditEndHour] = useState("");
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h à 18h
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getWeekReservations();
      setReservations(data.reservations || []);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  };

  const getDateForDay = (dayIndex) => {
    const monday = getMonday();
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    return date;
  };

  // Obtenir un identifiant unique pour une date (YYYY-MM-DD)
  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSlotClick = (dayIndex, hour) => {
    const date = getDateForDay(dayIndex);
    const now = new Date();
    
    // Créer la date/heure du slot
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);

    // Vérifier si c'est dans le passé
    if (slotDate < now) {
      return;
    }

    // Vérifier si déjà réservé (utiliser la même logique que isSlotReserved)
    const existing = isSlotReserved(dayIndex, hour);

    if (existing) {
      // Vérifier si c'est ma réservation ou une réservation anonyme
      const isMine = existing.user_id === user.id;
      const isAnonymous = existing.email && existing.email.startsWith("anonyme-");
      
      if (isMine || isAnonymous) {
        const startD = new Date(existing.start_date);
        const endD = new Date(existing.end_date);
        
        setEditingReservation(existing);
        setEditTitle(existing.title);
        setEditStartHour(startD.getHours());
        setEditEndHour(endD.getHours());
        setShowEditModal(true);
      }
      // Sinon, on ne peut rien faire (réservation d'un autre utilisateur)
    } else {
      // Ouvrir le modal de création
      setSelectedSlot({ dayIndex, hour, date: slotDate });
      setShowModal(true);
      setTitle("");
      setStartHour(hour);
      setEndHour(hour + 1);
      setError("");
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      const startDate = new Date(selectedSlot.date);
      startDate.setHours(startHour, 0, 0, 0);

      const endDate = new Date(selectedSlot.date);
      endDate.setHours(endHour, 0, 0, 0);

      if (endDate <= startDate) {
        setError("L'heure de fin doit être après l'heure de début");
        return;
      }

      await reservationService.createReservation({
        title,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      setShowModal(false);
      fetchReservations();
    } catch (err) {
      setError(err.message || "Erreur lors de la réservation");
    }
  };

  const handleDeleteReservation = async (id) => {
    try {
      await reservationService.deleteReservation(id);
      setShowEditModal(false);
      fetchReservations();
    } catch (err) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    if (!editingReservation) return;

    try {
      const startDate = new Date(editingReservation.start_date);
      startDate.setHours(editStartHour, 0, 0, 0);

      const endDate = new Date(editingReservation.start_date);
      endDate.setHours(editEndHour, 0, 0, 0);

      if (endDate <= startDate) {
        setEditError("L'heure de fin doit être après l'heure de début");
        return;
      }

      await reservationService.updateReservation(editingReservation.id, {
        title: editTitle,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      setShowEditModal(false);
      fetchReservations();
    } catch (err) {
      setEditError(err.message || "Erreur lors de la modification");
    }
  };

  const isSlotReserved = (dayIndex, hour) => {
    const date = getDateForDay(dayIndex);
    const dateKey = getDateKey(date);
    
    return reservations.find(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      const reservationDateKey = getDateKey(start);
      
      // Vérifier si le créneau (hour à hour+1) est occupé par cette réservation
      return (
        reservationDateKey === dateKey &&
        start.getHours() <= hour &&
        end.getHours() > hour
      );
    });
  };

  const isPast = (dayIndex, hour) => {
    const date = getDateForDay(dayIndex);
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    return slotDate < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Planning de réservation
          </h1>
          <p className="text-gray-400">
            Bienvenue {user?.name} {user?.lastname} - Cliquez sur un créneau pour réserver
          </p>
        </div>

        {/* Calendrier */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-white font-semibold sticky left-0 bg-zinc-900">
                  Heure
                </th>
                {days.map((day, idx) => {
                  const date = getDateForDay(idx);
                  return (
                    <th key={day} className="px-4 py-3 text-center text-white font-semibold min-w-35">
                      <div>{day}</div>
                      <div className="text-sm text-gray-400 font-normal">
                        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => (
                <tr key={hour} className="border-b border-zinc-800">
                  <td className="px-4 py-3 text-white font-medium sticky left-0 bg-zinc-900">
                    {hour}h - {hour + 1}h
                  </td>
                  {days.map((_, dayIdx) => {
                    const reserved = isSlotReserved(dayIdx, hour);
                    const past = isPast(dayIdx, hour);
                    const isMine = reserved && reserved.user_id === user.id;

                    return (
                      <td
                        key={dayIdx}
                        onClick={() => !past && handleSlotClick(dayIdx, hour)}
                        className={`px-2 py-2 text-center cursor-pointer transition ${
                          past
                            ? "bg-zinc-800 cursor-not-allowed"
                            : reserved
                            ? isMine
                              ? "bg-red-900/40 hover:bg-red-900/60 border-2 border-red-500"
                              : "bg-zinc-700 cursor-not-allowed"
                            : "bg-zinc-900 hover:bg-zinc-800"
                        }`}
                      >
                        {reserved && (
                          <div className="text-xs">
                            <div className={`font-semibold ${isMine ? 'text-red-400' : 'text-gray-400'}`}>
                              {reserved.title}
                            </div>
                            <div className="text-gray-500 text-[10px]">
                              {reserved.name} {reserved.lastname}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="mt-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-900 border border-zinc-700"></div>
            <span className="text-gray-400">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-900/40 border-2 border-red-500"></div>
            <span className="text-gray-400">Mes réservations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-700"></div>
            <span className="text-gray-400">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-800"></div>
            <span className="text-gray-400">Passé</span>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-8 max-w-md w-full border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4">
              Nouvelle réservation
            </h2>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Objet de la réunion
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 22))}
                  required
                  maxLength="22"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                  placeholder="Réunion d'équipe"
                />
                <div className="text-xs text-gray-400 mt-1">{title.length}/22 caractères</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Heure de début
                  </label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                  >
                    {Array.from({ length: 11 }, (_, i) => i + 8).map(h => (
                      <option key={h} value={h}>{h}h</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Heure de fin
                  </label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(h => (
                      <option key={h} value={h}>{h}h</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-zinc-800 p-4 rounded">
                <p className="text-gray-400 text-sm">
                  <span className="font-semibold text-white">Date:</span>{" "}
                  {selectedSlot?.date.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  <span className="font-semibold text-white">Horaire:</span>{" "}
                  {startHour}h - {endHour}h
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
                >
                  Réserver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de réservation */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-8 max-w-md w-full border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingReservation.user_id === user.id ? "Modifier ma réservation" : "Supprimer cette réservation"}
            </h2>

            {(editingReservation.email && editingReservation.email.startsWith("anonyme-")) && editingReservation.user_id !== user.id && (
              <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded mb-4">
                Cette réservation a été créée par un compte anonymisé. Vous pouvez uniquement la supprimer.
              </div>
            )}

            {editError && (
              <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateReservation} className="space-y-4">
              {editingReservation.user_id === user.id && (
                <>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Objet de la réunion
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value.slice(0, 22))}
                      required
                      maxLength="22"
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                      placeholder="Réunion d'équipe"
                    />
                    <div className="text-xs text-gray-400 mt-1">{editTitle.length}/22 caractères</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Heure de début
                      </label>
                      <select
                        value={editStartHour}
                        onChange={(e) => setEditStartHour(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                      >
                        {Array.from({ length: 11 }, (_, i) => i + 8).map(h => (
                          <option key={h} value={h}>{h}h</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Heure de fin
                      </label>
                      <select
                        value={editEndHour}
                        onChange={(e) => setEditEndHour(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 8).map(h => (
                          <option key={h} value={h}>{h}h</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-zinc-800 p-4 rounded">
                <p className="text-gray-400 text-sm">
                  <span className="font-semibold text-white">Date:</span>{" "}
                  {new Date(editingReservation.start_date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  <span className="font-semibold text-white">Horaire:</span>{" "}
                  {editingReservation.user_id === user.id ? `${editStartHour}h - ${editEndHour}h` : `${new Date(editingReservation.start_date).getHours()}h - ${new Date(editingReservation.end_date).getHours()}h`}
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
                      handleDeleteReservation(editingReservation.id);
                    }
                  }}
                  className="flex-1 bg-red-900 hover:bg-red-950 text-red-300 font-semibold py-3 rounded transition border border-red-500/30"
                >
                  Supprimer
                </button>
                {editingReservation.user_id === user.id && (
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
# 📋 TechSpace Solutions - Système de Réservation de Salle

Un système moderne et efficace de gestion de réservation de salle de réunion avec interface web intuitive et backend sécurisé.

---

## Caractéristiques principales

- ✅ **Authentification sécurisée** : JWT dans cookies httpOnly (protection XSS)
- 📅 **Calendrier interactif** : Affichage hebdomadaire (lun-ven, 8h-19h)
- 🔄 **Réservations flexibles** : Création, modification, suppression
- 👤 **Gestion de profil** : Consultation et modification des informations
- 🗑️ **Suppression de compte** : Conformité RGPD avec anonymisation complète
- 🔒 **Sécurité renforcée** : Double protection JWT + vérification anonymisation

---

## Technologies utilisées

### Backend
- **Node.js** (ES Modules)
- **Express.js** : Framework web
- **MySQL2** : Base de données
- **bcrypt** : Hash sécurisé des mots de passe
- **JWT (jsonwebtoken)** : Authentification sans session
- **dotenv** : Gestion des variables d'environnement
- **CORS** : Autorisation cross-origin avec credentials

### Frontend
- **React 18+** : Bibliothèque UI
- **Vite** : Build tool ultra-rapide
- **React Router** : Routage client-side
- **Tailwind CSS** : Styling utility-first
- **Fetch API** : Requêtes HTTP

### DevOps
- **Laragon** : Serveur local (Apache, MySQL, Node.js)
- **Git** : Versioning

---

## Structure du projet

```
techspace_solutions/
├── frontend/                          # Application React
│   ├── public/
│   ├── src/
│   │   ├── assets/                   # Images, fonts
│   │   ├── components/               # Composants réutilisables
│   │   │   ├── Header.jsx            # Navigation principale
│   │   │   ├── Footer.jsx            # Pied de page
│   │   │   └── PrivateRoute.jsx      # Protection des routes authentifiées
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Gestion globale auth (JWT cookies)
│   │   ├── hooks/
│   │   │   └── useAuth.js            # Hook d'accès au contexte Auth
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx        # Avec Header + Footer
│   │   │   └── AuthLayout.jsx        # Plein écran (login/register)
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Accueil
│   │   │   ├── Login.jsx             # Connexion
│   │   │   ├── Register.jsx          # Inscription
│   │   │   ├── Dashboard.jsx         # Calendrier (cœur du système)
│   │   │   └── Profile.jsx           # Profil utilisateur + suppression compte
│   │   ├── services/
│   │   │   └── api.js                # Client API centralisé
│   │   ├── App.jsx                   # Root + routage
│   │   ├── main.jsx                  # Point d'entrée
│   │   └── index.css                 # Styles globaux
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── backend/                           # API Express
│   ├── config/
│   │   └── db.js                     # Connexion MySQL + wrapper query()
│   ├── controllers/
│   │   ├── auth.controller.js        # Endpoints auth (register, login, anonymize)
│   │   └── reservation.controller.js # Endpoints réservations (CRUD)
│   ├── middlewares/
│   │   └── auth.middleware.js        # Vérification JWT + anonymisation
│   ├── models/
│   │   ├── user.model.js             # Opérations DB utilisateurs
│   │   └── reservation.model.js      # Opérations DB réservations
│   ├── routes/
│   │   ├── auth.routes.js            # Routes /api/auth/*
│   │   └── reservation.routes.js     # Routes /api/reservations/*
│   ├── server.js                     # Configuration Express
│   ├── package.json
│   └── shema.sql                     # Schéma base de données
```

---

## Schéma de la base de données

### Table `users` (Utilisateurs)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,                -- Prénom
    lastname VARCHAR(100) NOT NULL,            -- Nom
    email VARCHAR(255) NOT NULL UNIQUE,        -- Email unique
    password VARCHAR(255) NOT NULL,            -- Hash bcrypt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Exemple d'anonymisation :**
- Avant : `email = "jean.dupont@company.com"`
- Après : `email = "anonyme-42@anonymized.local"` (id = 42)
- Password : Hash complètement différent (inaccessible)

### Table `reservations` (Réservations)
```sql
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,               -- Titre de la réunion
    start_date DATETIME NOT NULL,              -- Date/heure début
    end_date DATETIME NOT NULL,                -- Date/heure fin
    user_id INT NOT NULL,                      -- Référence utilisateur
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Règles métier :**
- Start hour : 8h à 18h
- End hour : jusqu'à 19h
- Durée minimale : 1 heure
- Jours : lundi à vendredi uniquement
- Pas de chevauchements

### Diagramme Entité-Relation
```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)             │
│ name                │◄─────┐
│ lastname            │       │ 1:N
│ email               │       │
│ password            │       │
│ created_at          │       │
└─────────────────────┘       │
                              │
                         ┌────┴──────────────┐
                         │  reservations    │
                         ├──────────────────┤
                         │ id (PK)          │
                         │ title            │
                         │ start_date       │
                         │ end_date         │
                         │ user_id (FK)     │
                         │ created_at       │
                         └──────────────────┘
```

---

## Installation et démarrage

### Prérequis
- Node.js v18+ 
- MySQL Server
- Npm/Pnpm

### Étape 1 : Configuration base de données
```bash
# Dans MySQL (terminal ou phpMyAdmin)
# Exécuter le contenu de backend/shema.sql

mysql -u root -p < backend/shema.sql
```

### Étape 2 : Installation dépendances

**Backend :**
```bash
cd backend
npm install
```

**Frontend :**
```bash
cd frontend
npm install
```

### Étape 3 : Configuration variables d'environnement

**backend/.env :**
```env
PORT=5520
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=reservation_salle
JWT_SECRET=your_secret_key_here
```

**frontend/.env :**
```env
VITE_API_URL=http://localhost:5520/api
```

### Étape 4 : Démarrage

**Backend (Terminal 1) :**
```bash
cd backend
npm start
# Serveur sur http://localhost:5520
```

**Frontend (Terminal 2) :**
```bash
cd frontend
npm run dev
# App sur http://localhost:5521
```

---

## Guide d'utilisation

### Pour les utilisateurs

1. **Créer un compte**
   - Cliquer "S'inscrire"
   - Remplir : Prénom, Nom, Email, Mot de passe (min 6 caractères)
   - JWT automatiquement sauvegardé en cookie

2. **Accéder au planning**
   - Après connexion, "Planning" visible dans le menu
   - Voir la semaine en cours (lun-ven)
   - Créneaux : 8h à 18h affichés

3. **Créer une réservation**
   - Cliquer sur un créneau libre
   - Remplir : titre, heure début/fin
   - Validation automatique

4. **Modifier une réservation**
   - Cliquer sur sa propre réservation
   - Modifier titre/horaires

5. **Supprimer une réservation**
   - Cliquer sur sa réservation
   - Bouton "Supprimer"
   - **Important** : Peut aussi supprimer réservations "Anonyme"

6. **Supprimer son compte (RGPD)**
   - Aller à "Profil"
   - Cliquer "Supprimer mon compte"
   - ⚠️ Non réversible
   - Compte anonymisé, email inaccessible

### Pour les développeurs

#### Flux d'authentification
```
1. User POST /api/auth/register ou /api/auth/login
2. Backend hash password, génère JWT
3. JWT stocké en cookie httpOnly (secure, sameSite)
4. Frontend reçoit user objet
5. AuthContext store user en state
6. Requêtes suivantes : cookies envoyés auto (credentials: include)
7. Middleware vérifie JWT et user status
```

#### Flux d'anonymisation (RGPD)
```
1. User POST /api/auth/anonymize
2. Backend : 
   - Email → "anonyme-{id}@anonymized.local"
   - Password → hash inaccessible
   - Cookie cleared
3. Middleware détecte email pattern lors prochaines tentatives
4. Réservations restent visibles comme "Anonyme"
5. Tous les users peuvent les supprimer
```

---

## Sécurité mise en œuvre

| Mesure | Détails |
|--------|---------|
| **JWT httpOnly** | Cookie inaccessible au JavaScript (XSS protection) |
| **Bcrypt** | Hash sécurisé mots de passe (+ salt aléatoire) |
| **CORS credentials** | Cookies envoyés uniquement au front autorisé |
| **Double protection JWT** | Cookie + middleware vérifie compte non-anonymisé |
| **SameSite Cookie** | Protection CSRF |
| **Authorization checks** | Ownership vérifié avant edit/delete |

---

## Points clés du code

### Date handling (timezone-safe)
```javascript
// ❌ JAMAIS faire : new Date().toISOString().split('T')[0]
// ✅ FAIRE :
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

### Slot reservation spanning
```javascript
// Check si l'heure est DANS la réservation (début ET fin)
const isSlotReserved = (dayIndex, hour) => {
  return reservations.some(r => {
    const rStart = new Date(r.start_date);
    const rEnd = new Date(r.end_date);
    const slotDateTime = getDateForDay(dayIndex);
    slotDateTime.setHours(hour);
    
    return slotDateTime >= rStart && slotDateTime < rEnd;
  });
};
```

### API client centralisé
```javascript
// Tous les appels passent par fetchAPI avec credentials
const fetchAPI = async (endpoint, options = {}) => {
  return fetch(`http://localhost:5520/api${endpoint}`, {
    credentials: 'include', // 👈 AUTO-SEND COOKIES
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
};
```

---

## Endpoints API

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter |
| GET | `/auth/me` | Profil actuel |
| POST | `/auth/anonymize` | Supprimer compte (RGPD) |

### Réservations
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/reservations` | Semaine actuelle |
| GET | `/reservations/:id` | Une réservation |
| GET | `/reservations/user/:userId` | Réservations utilisateur |
| POST | `/reservations` | Créer réservation |
| PUT | `/reservations/:id` | Modifier réservation |
| DELETE | `/reservations/:id` | Supprimer réservation |

---

## Troubleshooting

| Problème | Solution |
|----------|----------|
| "CORS error" | Vérifier `origin` dans backend CORS |
| "JWT expiré" | Actualiser page (re-login implicite) |
| "Réservations ne s'affichent pas" | Vérifier fuseau horaire (getDateKey) |
| "Cookies non envoyés" | Vérifier `credentials: 'include'` en fetch |
| "Compte anonyme reste visible" | Comportement normal (RGPD) |

---

## License

Enzo cys - Projet TechSpace Solutions

---

**Dernière mise à jour** : Février 2026

// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";

import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  const { loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement...</p>
        </div>
      </div>
    );

  return (
    <Routes>
      {/* Routes AVEC Header + Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Routes SANS Header (plein écran) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
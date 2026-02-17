import { useAuth } from "../hooks/useAuth.js";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Bienvenue {user?.firstname} !</h1>
      <p>Email : {user?.email}</p>
    </div>
  );
}

export default Dashboard;
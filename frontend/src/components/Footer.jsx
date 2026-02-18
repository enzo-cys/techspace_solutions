// components/Footer.jsx

function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-center text-gray-400">
          TechSpace Solutions - © {new Date().getFullYear()} - Système de réservation de salle
        </p>
      </div>
    </footer>
  );
}

export default Footer;
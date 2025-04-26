import { FaUserCircle, FaCalendarAlt, FaEnvelope, FaTrophy, FaChartBar } from "react-icons/fa";

const ProfileInfo = () => {
  const user = {
    country: "Kazakhstan",
    registeredAt: "2024-12-01",
    email: "neonking@poker.kz",
    totalGames: 132,
    totalWins: 48,
    winRate: 36.36,
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: "16px",
      padding: "24px",
      color: "#fff",
      boxShadow: "0 0 20px rgba(255,46,99,0.2)"
    }}>
      <h3 style={{ color: "#ffc107", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <FaUserCircle /> Личная информация
      </h3>
      <ul style={{ listStyle: "none", padding: 0, lineHeight: "1.8" }}>
        <li>🌍 <strong>Страна:</strong> {user.country}</li>
        <li><FaCalendarAlt /> <strong>Зарегистрирован:</strong> {user.registeredAt}</li>
        <li><FaEnvelope /> <strong>Email:</strong> {user.email}</li>
        <li><FaTrophy /> <strong>Побед:</strong> {user.totalWins}</li>
        <li><FaChartBar /> <strong>Win rate:</strong> {user.winRate}%</li>
      </ul>
    </div>
  );
};

export default ProfileInfo;

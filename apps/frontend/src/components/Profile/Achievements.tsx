import { FaBolt, FaGem, FaMedal } from "react-icons/fa";

const achievements = [
  { icon: <FaBolt />, label: "First Win" },
  { icon: <FaMedal />, label: "10 Games Played" },
  { icon: <FaGem />, label: "High Roller" },
];

const Achievements = () => {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: "16px",
      padding: "24px",
      color: "#fff",
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      justifyContent: "center",
      boxShadow: "0 0 20px rgba(0, 212, 255, 0.2)"
    }}>
      {achievements.map((ach, i) => (
        <div key={i} style={{
          padding: "16px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 0 15px rgba(255, 46, 99, 0.25)",
          textAlign: "center",
          minWidth: "100px"
        }}>
          <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{ach.icon}</div>
          <div style={{ fontSize: "0.9rem" }}>{ach.label}</div>
        </div>
      ))}
    </div>
  );
};

export default Achievements;

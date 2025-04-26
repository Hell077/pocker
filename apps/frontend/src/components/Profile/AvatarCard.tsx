import { FaCrown } from "react-icons/fa";

const AvatarCard = () => {
  const user = {
    username: "NeonKing",
    id: "5089d344-4486-4a87-ac44-92903788f3c4",
    balance: 12450,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=NeonKing"
  };

  return (
    <div style={{
      padding: "20px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "16px",
      textAlign: "center",
      color: "#fff",
      boxShadow: "0 0 20px rgba(255,46,99,0.3)"
    }}>
      <img src={user.avatar} alt="avatar" style={{
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        border: "3px solid #ff2e63"
      }} />
      <h2 style={{ margin: "12px 0", fontSize: "1.4rem", color: "#ff2e63" }}>
        <FaCrown /> {user.username}
      </h2>
      <p>ID: {user.id}</p>
      <p>💰 {user.balance} chips</p>
    </div>
  );
};

export default AvatarCard;

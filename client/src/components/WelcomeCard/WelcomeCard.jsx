import "./WelcomeCard.css";
import { FiPlus } from "react-icons/fi";

function WelcomeCard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <section className="welcome-card">

      <div className="welcome-left">

        <h1>
          Welcome Back,
          <span> {user?.name || "User"} 👋</span>
        </h1>

        <p>
          Your passwords are securely encrypted and protected.
          Manage everything from one place with confidence.
        </p>

        <button className="add-password-btn">
          <FiPlus />
          Add Password
        </button>

      </div>

      <div className="welcome-right">

        {/* Walking Girl Animation will come here */}

      </div>

    </section>
  );
}

export default WelcomeCard;
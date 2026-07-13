import './Hero.css';
import { FiShield, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import walkingGirl from '../../assets/walking-girl.webm';

function Hero({ securityScore = 92, onAddPasswordClick }) {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning ☀️' : hour < 18 ? 'Good Afternoon 👋' : 'Good Evening 🌙';

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <section className="hero-card">
      {/* LEFT — Walking Girl */}
      <div className="hero-visual">
        <div className="hero-blob" />
        <video
          src={walkingGirl}
          autoPlay
          muted
          loop
          playsInline
          className="hero-video"
        />
      </div>

      {/* RIGHT — Text Content */}
      <div className="hero-content">
        <p className="hero-greeting">{greeting}</p>

        <h1 className="hero-title">
          Welcome back,{' '}
          <span className="hero-name">{user?.name || 'User'}</span>
        </h1>

        <p className="hero-subtitle">
          Your vault is protected with military-grade encryption.
        </p>

        <div className="security-badge">
          <FiShield size={14} />
          <span>{securityScore}% Protected</span>
        </div>

        <div className="hero-actions">
          <button className="btn-primary" onClick={onAddPasswordClick}>
            <FiPlus size={16} />
            Add Password
          </button>
          <button className="btn-secondary" onClick={() => navigate('/generator')}>
            🎲 Generate Password
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;

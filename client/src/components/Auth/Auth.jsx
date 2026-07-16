import { useState } from "react";
import "./auth.css";
// import walkingGirl from "../../assets/walking-girl.webm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

function Auth() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="auth-page">
      <div className={`container ${isActive ? "active" : ""}`}>

        {/* Register Form */}
        <RegisterForm />

        {/* Login Form */}
        <LoginForm />
          
            {/* {!isActive && (
  <div className="girl-animation">
    <video
      autoPlay
      muted
      loop
      playsInline
      className="girl-video"
    >
      <source src={walkingGirl} type="video/webm" />
    </video>
  </div>
)} */}



        {/* Overlay */}
        <div className="toggle-container">

          <div className="toggle">

            {/* Left Panel */}
            <div className="toggle-panel toggle-left">

              <h1>Welcome Back!</h1>

              <p>
                Enter your details to access your Password Vault.
              </p>

              <button
                type="button"
                onClick={() => setIsActive(false)}
              >
                Sign In
              </button>

            </div>

            {/* Right Panel */}
            <div className="toggle-panel toggle-right">

              <h1>Hello Friend!</h1>

              <p>
                Create your account and keep every password safe.
              </p>

              <button
                type="button"
                onClick={() => setIsActive(true)}
              >
                Sign Up
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Auth;
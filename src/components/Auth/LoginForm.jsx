import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);

      // Save JWT Token
      localStorage.setItem("token", res.data.token);

      // Save Logged-in User
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      console.log("Login Successful:", res.data);

      // Redirect to Dashboard
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container login-container">
      <form onSubmit={handleSubmit}>

        <h1>Sign In</h1>

        <div className="social-icons">
          <a href="#">G</a>
          <a href="#">f</a>
          <a href="#">in</a>
        </div>

        <span>or use your email account</span>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <a href="#" className="forgot">
          Forgot Password?
        </a>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

      </form>
    </div>
  );
}

export default LoginForm;
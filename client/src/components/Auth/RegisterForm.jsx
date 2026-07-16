import { useState } from "react";
import API from "../../services/api";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    masterPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const res = await API.post("/auth/register", formData);

    alert(res.data.message);

  } catch (err) {

    alert(err.response?.data?.message || "Registration Failed");

  }
};

  return (
    <div className="form-container register-container">
      <form onSubmit={handleSubmit}>
        <h1>Create Account</h1>

        <div className="social-icons">
          <a href="#">G</a>
          <a href="#">f</a>
          <a href="#">in</a>
        </div>

        <span>or use your email for registration</span>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="masterPassword"
          placeholder="Master Password"
          value={formData.masterPassword}
          onChange={handleChange}
        />

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default RegisterForm;

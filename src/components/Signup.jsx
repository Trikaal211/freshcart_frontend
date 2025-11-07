import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (profileImage) data.append("profileImage", profileImage);

      const res = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/users/signup",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.message);
      setTimeout(() => navigate("/user"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="signup-form" encType="multipart/form-data">
        <input type="text" name="firstName" placeholder="First Name"
          value={formData.firstName} onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name"
          value={formData.lastName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email Address"
          value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password"
          value={formData.password} onChange={handleChange} required />
        
        {/* Image Upload */}
        <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} />

        <button type="submit">Sign Up</button>
      </form>

      {message && <p className="signup-message">{message}</p>}
    </div>
  );
};

export default Signup;

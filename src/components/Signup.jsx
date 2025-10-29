import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/users/signup", formData);
      setMessage(res.data.message);
      console.log(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={{
      width: "400px",
      margin: "50px auto",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "10px"
    }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        /><br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />

        <button type="submit">Sign Up</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Signup;

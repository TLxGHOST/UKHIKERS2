import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      // 🔐 SAVE TOKEN HERE
      localStorage.setItem("adminToken", res.data.token);

      // 🚀 redirect
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;

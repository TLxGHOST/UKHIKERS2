import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("adminToken", data.token);

        navigate("/admin");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1d26] text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[#1a2c35] p-10 rounded-xl w-[350px]"
      >
        <h2 className="text-2xl mb-6 font-bold text-center">Admin Login</h2>

        <input
          className="w-full mb-4 p-2 text-black rounded"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 p-2 text-black rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

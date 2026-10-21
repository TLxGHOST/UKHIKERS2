import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mountain } from "lucide-react";
import api from "../api/axios";
import "../styles/account.css";

export default function AccountAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === "/register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await api.post(isRegister ? "/users/register" : "/users/login", {
        ...(isRegister ? { name } : {}),
        email,
        password,
      });
      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerUser", JSON.stringify(response.data.user));
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "We couldn’t complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="account-page">
      <Link to="/" className="account-back"><ArrowLeft size={16} /> Back to UK Hikers</Link>
      <section className="account-panel">
        <div className="account-brand"><span><Mountain size={24} /></span><div>UK HIKERS<small>YOUR ADVENTURES, ALL IN ONE PLACE</small></div></div>
        <p className="account-eyebrow">{isRegister ? "START YOUR NEXT CHAPTER" : "WELCOME BACK"}</p>
        <h1>{isRegister ? "Make it yours." : "Good to have you back."}</h1>
        <p className="account-intro">{isRegister ? "Create an account to keep your favourite treks and preferences with you." : "Sign in to find your saved treks and personal preferences."}</p>
        <form className="account-form" onSubmit={submit}>
          {isRegister && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required placeholder="Your full name" /></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label>
          <label>Password<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={isRegister ? 8 : undefined} maxLength={128} required placeholder={isRegister ? "At least 8 characters" : "Your password"} /></label>
          {error && <p className="account-error" role="alert">{error}</p>}
          <button className="account-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
        </form>
        <div className="account-switch">{isRegister ? "Already have an account?" : "New to UK Hikers?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></div>
        <p className="account-google-note">Google Sign-In will be enabled after OAuth credentials are configured.</p>
      </section>
    </main>
  );
}

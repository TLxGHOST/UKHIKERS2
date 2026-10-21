import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, LogOut, Mountain, SlidersHorizontal, Trash2 } from "lucide-react";
import api from "../api/axios";
import "../styles/account.css";

const LEVELS = ["easy", "moderate", "difficult"];

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [interestsText, setInterestsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const signOut = useCallback(() => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadAccount = useCallback(async () => {
    try {
      const { data } = await api.get("/users/me");
      setUser(data.user);
      setSelected(data.user.preferences?.preferredDifficulties || []);
      setInterestsText((data.user.preferences?.interests || []).join(", "));
      localStorage.setItem("customerUser", JSON.stringify(data.user));
    } catch (err) {
      if (err.response?.status === 401) signOut();
      else setError(err.response?.data?.message || "Unable to load your account.");
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => { void loadAccount(); }, [loadAccount]);

  const toggleLevel = (level) => setSelected((current) => current.includes(level) ? current.filter((item) => item !== level) : [...current, level]);

  const savePreferences = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const interests = interestsText.split(",").map((item) => item.trim()).filter(Boolean);
      const { data } = await api.put("/users/preferences", { preferredDifficulties: selected, interests });
      setUser((current) => ({ ...current, ...data.user }));
      setMessage("Your preferences have been saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const removeTrek = async (id) => {
    try {
      await api.delete(`/users/wishlist/${id}`);
      setUser((current) => ({ ...current, wishlist: current.wishlist.filter((trek) => (trek._id || trek) !== id) }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update your wishlist.");
    }
  };

  if (loading) return <main className="account-dashboard"><div className="account-loading">Loading your account…</div></main>;
  if (!localStorage.getItem("customerToken")) return null;

  return (
    <main className="account-dashboard">
      <header className="account-dashboard__header">
        <Link to="/" className="account-brand"><span><Mountain size={22} /></span><div>UK HIKERS<small>YOUR OUTDOORS, YOUR WAY</small></div></Link>
        <button className="account-signout" onClick={signOut}><LogOut size={16} /> Sign out</button>
      </header>
      <section className="account-welcome">
        <p className="account-eyebrow">YOUR PERSONAL TRAIL SPACE</p>
        <h1>Hello, {user?.name?.split(" ")[0] || "hiker"}.</h1>
        <p>Keep the treks you love close and shape recommendations around your kind of adventure.</p>
      </section>
      {error && <p className="account-alert account-alert--error" role="alert">{error}</p>}
      {message && <p className="account-alert" role="status">{message}</p>}
      <div className="account-dashboard__grid">
        <section className="account-section">
          <div className="account-section__heading"><Heart size={19} /><div><h2>Your wishlist</h2><p>{user?.wishlist?.length || 0} saved {(user?.wishlist?.length || 0) === 1 ? "trek" : "treks"}</p></div></div>
          {!user?.wishlist?.length ? <div className="account-empty"><Heart size={27} /><h3>Your next favourite trek starts here.</h3><p>Save treks from the Explore page and they’ll show up here.</p><Link to="/equipment" className="account-inline-link">Explore treks <ArrowRight size={15} /></Link></div> :
            <div className="account-wishlist">{user.wishlist.map((trek) => {
              if (!trek || typeof trek !== "object" || !trek._id) return null;
              const image = trek.imageUrl?.startsWith("http") ? trek.imageUrl : trek.imageUrl ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}/${trek.imageUrl.replace(/^\//, "")}` : "";
              return <article className="account-trek" key={trek._id}>{image ? <img src={image} alt="" /> : <div className="account-trek__placeholder"><Mountain /></div>}<div className="account-trek__info"><h3>{trek.title}</h3><p>{[trek.location, trek.duration, trek.difficulty].filter(Boolean).join(" · ")}</p>{typeof trek.price === "number" && <strong>₹{trek.price.toLocaleString("en-IN")}</strong>}</div><button aria-label={`Remove ${trek.title} from wishlist`} onClick={() => removeTrek(trek._id)}><Trash2 size={17} /></button></article>;
            })}</div>}
        </section>
        <section className="account-section">
          <div className="account-section__heading"><SlidersHorizontal size={19} /><div><h2>Your preferences</h2><p>Help us tailor your trail inspiration.</p></div></div>
          <form className="account-preferences" onSubmit={savePreferences}>
            <fieldset><legend>Preferred difficulty</legend><div className="account-levels">{LEVELS.map((level) => <label key={level} className={selected.includes(level) ? "is-selected" : ""}><input type="checkbox" checked={selected.includes(level)} onChange={() => toggleLevel(level)} />{level[0].toUpperCase() + level.slice(1)}</label>)}</div></fieldset>
            <label className="account-interest-label">Interests <span>Separate with commas</span><textarea rows={3} value={interestsText} onChange={(event) => setInterestsText(event.target.value)} placeholder="Mountain views, wildlife, photography" /></label>
            <button type="submit" className="account-submit" disabled={saving}>{saving ? "Saving…" : "Save preferences"} <ArrowRight size={16} /></button>
          </form>
        </section>
      </div>
    </main>
  );
}

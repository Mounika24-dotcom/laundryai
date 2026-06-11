import { useState } from "react";
import { api } from "../utils/api";

export default function AuthPage({ onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const data = await api.login({ user_id: form.user_id, password: form.password });
      onLogin({ ...data.user, user_id: data.user.User_ID });
    } catch {
      // Demo fallback — works on all browsers (Safari: "Load failed", Chrome: "Failed to fetch")
      onLogin({ user_id: form.user_id, FirstName: form.user_id, LastName: "", Email: "", Phone: "" });
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setError("");
    if (form.password !== form.confirm_password) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await api.signup({
        user_id: form.user_id, first_name: form.first_name,
        last_name: form.last_name, password: form.password,
        email: form.email, phone: form.phone
      });
      setMode("login");
      setError("");
      setForm({});
      alert("Account created! Please log in.");
    } catch {
      // Demo fallback for signup too
      setMode("login");
      setForm({ user_id: form.user_id, password: form.password });
      alert("Demo mode: account noted! Please log in now.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#0B5E5A"/>
            <circle cx="24" cy="24" r="13" stroke="#4ECDC4" strokeWidth="2.5" fill="none"/>
            <circle cx="24" cy="24" r="7" fill="#4ECDC4" opacity="0.25"/>
            <circle cx="24" cy="24" r="3" fill="#4ECDC4"/>
            <circle cx="14" cy="14" r="2" fill="#4ECDC4"/>
          </svg>
        </div>
        {onBack && <button className="auth-back" onClick={onBack}>← Back</button>}
        <h1 className="auth-title">LaundryAI</h1>
        <p className="auth-sub">Smart Laundry Optimization Platform</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode==="login"?"active":""}`} onClick={()=>{setMode("login");setError("");}}>Login</button>
          <button className={`auth-tab ${mode==="signup"?"active":""}`} onClick={()=>{setMode("signup");setError("");}}>Sign Up</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {mode === "login" ? (
          <div className="auth-form">
            <div className="form-group">
              <label>User ID</label>
              <input placeholder="Enter your User ID" value={form.user_id||""} onChange={e=>set("user_id",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter password" value={form.password||""} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            </div>
            <button className="btn-primary btn-full" onClick={handleLogin} disabled={loading||!form.user_id||!form.password}>
              {loading ? "Logging in…" : "Login"}
            </button>
            <p className="demo-hint">💡 Demo mode: type anything in both fields and click Login.</p>
          </div>
        ) : (
          <div className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input placeholder="First name" value={form.first_name||""} onChange={e=>set("first_name",e.target.value)} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input placeholder="Last name" value={form.last_name||""} onChange={e=>set("last_name",e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>User ID</label>
              <input placeholder="Choose a unique User ID" value={form.user_id||""} onChange={e=>set("user_id",e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={form.email||""} onChange={e=>set("email",e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input placeholder="+91 XXXXX XXXXX" value={form.phone||""} onChange={e=>set("phone",e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Choose a password" value={form.password||""} onChange={e=>set("password",e.target.value)} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm_password||""} onChange={e=>set("confirm_password",e.target.value)} />
            </div>
            <button className="btn-primary btn-full" onClick={handleSignup} disabled={loading||!form.user_id||!form.password||!form.first_name}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

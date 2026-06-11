export default function LandingPage({ onGetStarted }) {
  const features = [
    { icon: "🟢", title: "Real-time Status", desc: "See every machine's status instantly — Available, In Use, Reserved, or Done." },
    { icon: "📅", title: "Smart Booking", desc: "Reserve a machine in advance. No more walking to check or waiting in line." },
    { icon: "✨", title: "AI Advisor", desc: "Claude AI analyzes usage patterns and tells you the perfect time to do laundry." },
    { icon: "⚠️", title: "Penalty System", desc: "Automated penalties for delayed collection keep machines free for everyone." },
    { icon: "🔔", title: "Notifications", desc: "Get alerted the moment your cycle finishes. Never leave wet clothes behind." },
    { icon: "📊", title: "Admin Analytics", desc: "Building managers get utilization dashboards and revenue insights at scale." },
  ];

  const stats = [
    { value: "73%", label: "Reduction in machine idle time" },
    { value: "4.8×", label: "Faster machine turnover" },
    { value: "100%", label: "Conflict-free scheduling" },
  ];

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0B5E5A"/>
            <circle cx="16" cy="16" r="9" stroke="#4ECDC4" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="5" fill="#4ECDC4" opacity="0.3"/>
            <circle cx="16" cy="16" r="2" fill="#4ECDC4"/>
            <circle cx="9" cy="9" r="1.5" fill="#4ECDC4"/>
          </svg>
          <span>LaundryAI</span>
        </div>
        <button className="btn-primary btn-sm" onClick={onGetStarted}>Get Started →</button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">🏆 OSC AI Build 1.0 · Future of Productivity</div>
        <h1 className="hero-title">
          Your shared laundry room,<br />
          <span className="hero-accent">finally intelligent.</span>
        </h1>
        <p className="hero-sub">
          LaundryAI uses real-time monitoring and Claude AI to eliminate laundry conflicts in apartments, dorms, and co-living spaces — saving residents time and building managers headaches.
        </p>
        <div className="hero-actions">
          <button className="btn-primary btn-lg" onClick={onGetStarted}>Try the Demo →</button>
          <a className="btn-ghost btn-lg" href="https://github.com" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>

        {/* Hero visual — machine status mockup */}
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hc-header">
              <span className="hc-dot" style={{background:"#0B5E5A"}} /> M-01 · Washer
              <span className="hc-badge available">Available</span>
            </div>
          </div>
          <div className="hero-card hc-active">
            <div className="hc-header">
              <span className="hc-dot spin" style={{background:"#F59E0B"}} /> M-02 · Washer
              <span className="hc-badge inuse">In Use · 18 min</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="hc-header">
              <span className="hc-dot" style={{background:"#6366F1"}} /> M-03 · Dryer
              <span className="hc-badge reserved">Reserved · 3 PM</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="hc-header">
              <span className="hc-dot" style={{background:"#EF4444"}} /> M-04 · Dryer
              <span className="hc-badge done">Done — Collect Now!</span>
            </div>
          </div>
          <div className="hero-ai-bubble">
            <span>✨</span>
            <span>Best time to wash today: <strong>1–3 PM</strong> (only 30% utilization)</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        {stats.map((s) => (
          <div className="landing-stat" key={s.label}>
            <div className="ls-value">{s.value}</div>
            <div className="ls-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Everything a smart laundry room needs</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="fc-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scale section */}
      <section className="scale-section">
        <h2 className="section-title">Built to scale</h2>
        <p className="scale-sub">From a single apartment block to a national property management chain — LaundryAI's architecture grows with you.</p>
        <div className="scale-tiers">
          <div className="tier-card">
            <div className="tier-icon">🏠</div>
            <h3>Single Building</h3>
            <p>8–20 machines, one laundry room. Residents self-serve via the web app.</p>
          </div>
          <div className="tier-card tier-featured">
            <div className="tier-badge">Scalable</div>
            <div className="tier-icon">🏢</div>
            <h3>Multi-Building</h3>
            <p>Multiple properties under one dashboard. Centralized admin, per-building machine groups.</p>
          </div>
          <div className="tier-card">
            <div className="tier-icon">🌐</div>
            <h3>Platform</h3>
            <p>White-label SaaS for property managers. IoT-ready for smart machine integration.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to see it in action?</h2>
        <p>No setup needed — the demo runs entirely in your browser.</p>
        <button className="btn-primary btn-lg" onClick={onGetStarted}>Launch Demo →</button>
      </section>

      <footer className="landing-footer">
        Built for OSC AI Build 1.0 · June 2026 · Mounika Yegireddi
      </footer>
    </div>
  );
}

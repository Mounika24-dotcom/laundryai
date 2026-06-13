export default function Header({ activeTab, setActiveTab, machines, userName, onLogout, useDemo }) {
  const available = machines.filter((m) => m.status === "available").length;
  const inUse = machines.filter((m) => m.status === "in_use").length;
  const done = machines.filter((m) => m.status === "done").length;

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand">
          <div className="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0B5E5A"/>
              <circle cx="16" cy="16" r="9" stroke="#4ECDC4" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="16" r="5" fill="#4ECDC4" opacity="0.3"/>
              <circle cx="16" cy="16" r="2" fill="#4ECDC4"/>
              <circle cx="9" cy="9" r="1.5" fill="#4ECDC4"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-name">LaundryAI</h1>
            <span className="brand-tagline">Smart Laundry Optimization</span>
          </div>
        </div>
        <div className="header-status-pills">
          <span className="pill pill-available">{available} Free</span>
          <span className="pill pill-inuse">{inUse} In Use</span>
          {done > 0 && <span className="pill pill-done">{done} Done!</span>}
          {useDemo && <span className="pill pill-demo">Demo Mode</span>}
        </div>
        <div className="header-right">
          {userName && <div className="user-badge">👤 {userName}</div>}
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </div>
      <nav className="nav-tabs">
        {[
          { id: "dashboard", label: "🏠 Machines" },
          { id: "ai", label: "✨ AI Advisor" },
          { id: "wolfram", label: "📐 Wolfram" },
          { id: "history", label: "📋 My History" },
          { id: "admin", label: "📊 Admin" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

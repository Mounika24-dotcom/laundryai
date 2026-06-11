import { useState } from "react";

const UTILIZATION = [
  { day: "Mon", washers: 72, dryers: 58 },
  { day: "Tue", washers: 65, dryers: 50 },
  { day: "Wed", washers: 80, dryers: 71 },
  { day: "Thu", washers: 55, dryers: 45 },
  { day: "Fri", washers: 90, dryers: 82 },
  { day: "Sat", washers: 95, dryers: 89 },
  { day: "Sun", washers: 88, dryers: 80 },
];

const BUILDINGS = [
  { name: "Sunrise Apartments", machines: 8, active: 5, revenue: 4200, penalties: 320, efficiency: 87 },
  { name: "Green Park Residency", machines: 12, active: 9, revenue: 6800, penalties: 210, efficiency: 91 },
  { name: "CMU Student Housing", machines: 20, active: 14, revenue: 11200, penalties: 890, efficiency: 78 },
];

const RECENT_ALERTS = [
  { type: "penalty", msg: "M-05 · Ananya did not collect for 22 min → ₹25 penalty applied", time: "2 min ago" },
  { type: "info",    msg: "M-02 · Maintenance overdue. Last service: 47 days ago", time: "1 hr ago" },
  { type: "success", msg: "Peak hours alert sent to 34 residents (5–7 PM warning)", time: "3 hr ago" },
  { type: "info",    msg: "M-07 · Cycle completed. Machine available now.", time: "4 hr ago" },
];

export default function AdminDashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState(0);
  const b = BUILDINGS[selectedBuilding];
  const maxUtil = 95;

  const kpis = [
    { label: "Total Revenue (Month)", value: "₹22,200", delta: "+12%", up: true },
    { label: "Total Machines", value: "40", delta: "3 buildings", up: true },
    { label: "Avg Efficiency", value: "85%", delta: "+4% vs last month", up: true },
    { label: "Penalty Revenue", value: "₹1,420", delta: "34 incidents", up: false },
  ];

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>📊 Admin Dashboard</h2>
        <p>Building manager view — utilization, revenue, and alerts across all properties</p>
      </div>

      {/* KPI row */}
      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-delta ${k.up ? "up" : "down"}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Weekly utilization chart */}
      <div className="ai-card">
        <h3>Weekly Machine Utilization</h3>
        <div className="grouped-bar-chart">
          {UTILIZATION.map((d) => (
            <div className="gbc-col" key={d.day}>
              <div className="gbc-bars">
                <div className="gbc-bar washer" style={{ height: `${(d.washers / maxUtil) * 100}%` }} title={`Washers: ${d.washers}%`} />
                <div className="gbc-bar dryer"  style={{ height: `${(d.dryers  / maxUtil) * 100}%` }} title={`Dryers: ${d.dryers}%`} />
              </div>
              <div className="gbc-label">{d.day}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="cl-item"><span className="cl-dot" style={{background:"#0B5E5A"}} /> Washers</span>
          <span className="cl-item"><span className="cl-dot" style={{background:"#4ECDC4"}} /> Dryers</span>
        </div>
      </div>

      {/* Building selector */}
      <div className="ai-card">
        <div className="ai-card-header">
          <h3>Per-Building Breakdown</h3>
          <div style={{display:"flex", gap:8}}>
            {BUILDINGS.map((b, i) => (
              <button key={b.name} className={`btn-sm ${selectedBuilding===i ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSelectedBuilding(i)}>
                {b.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="building-stats">
          <div className="bstat"><span>{b.machines}</span><label>Total Machines</label></div>
          <div className="bstat"><span>{b.active}</span><label>Active Now</label></div>
          <div className="bstat"><span>₹{b.revenue.toLocaleString()}</span><label>Monthly Revenue</label></div>
          <div className="bstat"><span>₹{b.penalties}</span><label>Penalty Revenue</label></div>
          <div className="bstat"><span>{b.efficiency}%</span><label>Efficiency Score</label></div>
        </div>
        <div className="efficiency-bar-wrap">
          <div className="efficiency-label">Efficiency Score</div>
          <div className="eff-track">
            <div className="eff-fill" style={{
              width: `${b.efficiency}%`,
              background: b.efficiency > 85 ? "#0B5E5A" : b.efficiency > 70 ? "#F59E0B" : "#EF4444"
            }} />
          </div>
          <span className="eff-pct">{b.efficiency}%</span>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="ai-card">
        <h3>Recent Alerts & Events</h3>
        <div className="alerts-list">
          {RECENT_ALERTS.map((a, i) => (
            <div className={`alert-row alert-${a.type}`} key={i}>
              <span className="alert-dot" />
              <span className="alert-msg">{a.msg}</span>
              <span className="alert-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scale note */}
      <div className="scale-note">
        <span>🌐</span>
        <div>
          <strong>Designed for Scale</strong>
          <p>LaundryAI's multi-tenant architecture supports unlimited buildings under a single admin account. Add a new building in seconds — machines, residents, and billing are isolated per property while analytics roll up centrally.</p>
        </div>
      </div>
    </div>
  );
}

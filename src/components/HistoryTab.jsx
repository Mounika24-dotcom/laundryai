import { useState, useEffect } from "react";
import { api } from "../utils/api";

const DEMO_HISTORY = [
  { Reservation_ID: 1, Date: "2026-06-10", Machine_ID: 1, Status: "Completed", Starting_time: "09:15:00", Ending_time: "10:00:00", paid_amount: 2.00 },
  { Reservation_ID: 2, Date: "2026-06-09", Machine_ID: 3, Status: "Completed", Starting_time: "19:30:00", Ending_time: "20:30:00", paid_amount: 2.00 },
  { Reservation_ID: 3, Date: "2026-06-08", Machine_ID: 6, Status: "Completed", Starting_time: "11:00:00", Ending_time: "11:45:00", paid_amount: 2.00 },
];

export default function HistoryTab({ userName, userId, useDemo }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (useDemo) { setHistory(DEMO_HISTORY); setLoading(false); return; }
    api.getUserReservations(userId)
      .then(setHistory)
      .catch(() => setHistory(DEMO_HISTORY))
      .finally(() => setLoading(false));
  }, [userId, useDemo]);

  const totalSessions = history.length;
  const totalMinutes = history.reduce((acc, r) => {
    if (r.Starting_time && r.Ending_time) {
      const [sh, sm] = r.Starting_time.split(":").map(Number);
      const [eh, em] = r.Ending_time.split(":").map(Number);
      return acc + (eh * 60 + em) - (sh * 60 + sm);
    }
    return acc + 45;
  }, 0);
  const penalties = history.filter(r => r.Penalty_amount > 0).length;

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Your Laundry History</h2>
        <p>Recent sessions for {userName}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{totalMinutes >= 60 ? `${(totalMinutes/60).toFixed(1)}h` : `${totalMinutes}m`}</div>
          <div className="stat-label">Laundry Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: penalties > 0 ? "var(--red)" : "var(--teal)" }}>{penalties}</div>
          <div className="stat-label">Penalty Points</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-msg">Loading history…</div>
      ) : (
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-state">No reservations yet. Book your first machine!</div>
          ) : history.map((r) => (
            <div className="history-card" key={r.Reservation_ID}>
              <div className={`history-dot ${r.Status === "Completed" ? "completed" : r.Status === "Cancelled" ? "cancelled" : "active"}`} />
              <div className="history-details">
                <span className="history-machine">Machine {r.Machine_ID}</span>
                <span className="history-date">
                  {r.Date} {r.Starting_time && `· ${formatTime(r.Starting_time)} – ${formatTime(r.Ending_time)}`}
                </span>
              </div>
              <div className="history-meta">
                {r.paid_amount && <span className="history-amount">${Number(r.paid_amount).toFixed(2)}</span>}
                <span className={`badge badge-${(r.Status||"active").toLowerCase()}`}>{r.Status || "Active"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

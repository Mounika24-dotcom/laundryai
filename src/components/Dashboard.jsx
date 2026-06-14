import { useState, useEffect } from "react";
import { getStatusLabel, getStatusColor, generateMachines } from "../utils/machines";
import { api } from "../utils/api";

export default function Dashboard({ machines: propMachines, userName, onSelect, onCancel, onMachinesLoaded }) {
  const [machines, setMachines] = useState(propMachines);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch machine data from API on mount and every 30s
  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync with parent prop changes (bookings, cancellations)
  useEffect(() => {
    setMachines(propMachines);
  }, [propMachines]);

  const fetchMachines = async () => {
    try {
      const data = await api.getMachines();
      if (data && data.machines) {
        setMachines(data.machines);
        if (onMachinesLoaded) onMachinesLoaded(data.machines);
        setFetchError(null);
      }
    } catch {
      // Backend not available — use prop data (demo mode)
      setFetchError("demo");
    } finally {
      setLoading(false);
      setLastFetched(new Date().toLocaleTimeString());
    }
  };

  const floors = [...new Set(machines.map((m) => m.floor))];
  const available = machines.filter(m => m.status === "available").length;
  const inUse = machines.filter(m => m.status === "in_use").length;
  const reserved = machines.filter(m => m.status === "reserved").length;
  const done = machines.filter(m => m.status === "done").length;

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Fetching machine status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {/* Stats summary bar */}
      <div className="dashboard-stats">
        <div className="ds-card ds-available">
          <div className="ds-num">{available}</div>
          <div className="ds-label">Available</div>
        </div>
        <div className="ds-card ds-inuse">
          <div className="ds-num">{inUse}</div>
          <div className="ds-label">In Use</div>
        </div>
        <div className="ds-card ds-reserved">
          <div className="ds-num">{reserved}</div>
          <div className="ds-label">Reserved</div>
        </div>
        <div className="ds-card ds-done">
          <div className="ds-num">{done}</div>
          <div className="ds-label">Collect Now</div>
        </div>
      </div>

      {/* API status indicator */}
      <div className="api-status-bar">
        <span className={`api-dot ${fetchError ? "demo" : "live"}`} />
        <span className="api-label">
          {fetchError === "demo"
            ? "Demo mode — showing sample data"
            : `Live data via GET /api/machines`}
        </span>
        {lastFetched && (
          <span className="api-time">Last updated: {lastFetched}</span>
        )}
        <button className="btn-refresh" onClick={fetchMachines} title="Refresh">⟳ Refresh</button>
      </div>

      {/* Machine floors */}
      {floors.map((floor) => (
        <div key={floor} className="floor-section">
          <div className="floor-label">{floor}</div>
          <div className="machines-grid">
            {machines
              .filter((m) => m.floor === floor)
              .map((machine) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  userName={userName}
                  onSelect={onSelect}
                  onCancel={onCancel}
                />
              ))}
          </div>
        </div>
      ))}

      <Legend />
    </div>
  );
}

function MachineCard({ machine, userName, onSelect, onCancel }) {
  const { id, type, status, bookedBy, timeRemaining, reservedFor } = machine;
  const statusColor = getStatusColor(status);
  const isMyMachine = bookedBy === userName;
  const canBook = status === "available";
  const isSpinning = status === "in_use";

  // Progress percentage for in-use machines
  const maxTime = 60;
  const progressPct = status === "in_use" && timeRemaining != null
    ? Math.max(0, Math.min(100, ((maxTime - timeRemaining) / maxTime) * 100))
    : 0;

  return (
    <div className={`machine-card ${status} ${isMyMachine ? "my-machine" : ""}`}>
      {isMyMachine && <div className="my-badge">Yours</div>}

      {/* Status indicator strip */}
      <div className="card-status-strip" style={{ background: statusColor }} />

      {/* Machine visual */}
      <div className="machine-door-wrap">
        <div className={`machine-door ${isSpinning ? "spinning" : ""}`} style={{ borderColor: statusColor }}>
          <div className="door-inner" style={{ background: statusColor + "18" }}>
            <div className="door-center" style={{ background: statusColor }}>
              {status === "available" && <span>✓</span>}
              {status === "in_use"    && <span>↻</span>}
              {status === "reserved" && <span>⏰</span>}
              {status === "done"     && <span>!</span>}
            </div>
          </div>
        </div>
        {/* Circular progress ring for in-use */}
        {status === "in_use" && (
          <svg className="progress-ring" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
            <circle cx="40" cy="40" r="36" fill="none" stroke={statusColor} strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPct / 100)}`}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.5s" }}
            />
          </svg>
        )}
      </div>

      <div className="machine-info">
        <div className="machine-id">{id}</div>
        <div className="machine-type">{type}</div>
        <div className="machine-status-badge" style={{ color: statusColor, borderColor: statusColor + "44", background: statusColor + "11" }}>
          {getStatusLabel(status)}
        </div>

        {status === "in_use" && timeRemaining != null && (
          <div className="time-remaining">
            <div className="time-bar-wrap">
              <div className="time-bar" style={{ width: `${progressPct}%`, background: statusColor }} />
            </div>
            <span>{timeRemaining} min left</span>
          </div>
        )}

        {status === "reserved" && reservedFor && (
          <div className="reserved-info">Slot: {reservedFor}</div>
        )}

        {status === "done" && bookedBy && (
          <div className="done-warning">⚠ {bookedBy}: collect within 15 min</div>
        )}

        {bookedBy && !isMyMachine && (
          <div className="booked-by">by {bookedBy}</div>
        )}
      </div>

      <div className="machine-actions">
        {canBook && (
          <button className="btn-book" onClick={() => onSelect(machine)}>
            Book Now
          </button>
        )}
        {isMyMachine && (status === "reserved" || status === "in_use") && (
          <button className="btn-cancel-sm" onClick={() => onCancel(id)}>
            Cancel
          </button>
        )}
        {status === "done" && isMyMachine && (
          <button className="btn-collect" onClick={() => onCancel(id)}>
            Mark Collected ✓
          </button>
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { color: "#0B5E5A", label: "Available" },
    { color: "#F59E0B", label: "In Use" },
    { color: "#6366F1", label: "Reserved" },
    { color: "#EF4444", label: "Done — Collect" },
  ];
  return (
    <div className="legend">
      {items.map((i) => (
        <span key={i.label} className="legend-item">
          <span className="legend-dot" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

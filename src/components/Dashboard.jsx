import { getStatusLabel, getStatusColor } from "../utils/machines";

export default function Dashboard({ machines, userName, onSelect, onCancel }) {
  const floors = [...new Set(machines.map((m) => m.floor))];

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Machine Status</h2>
        <p>Real-time availability across all floors</p>
      </div>

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

  return (
    <div className={`machine-card ${status} ${isMyMachine ? "my-machine" : ""}`}>
      {isMyMachine && <div className="my-badge">Yours</div>}

      {/* Washing machine door visual */}
      <div className="machine-door-wrap">
        <div className={`machine-door ${isSpinning ? "spinning" : ""}`} style={{ borderColor: statusColor }}>
          <div className="door-inner" style={{ background: statusColor + "22" }}>
            <div className="door-center" style={{ background: statusColor }}>
              {status === "available" && <span>✓</span>}
              {status === "in_use" && <span>↻</span>}
              {status === "reserved" && <span>🔒</span>}
              {status === "done" && <span>!</span>}
            </div>
          </div>
        </div>
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
              <div className="time-bar" style={{ width: `${Math.min(100, (timeRemaining / 60) * 100)}%`, background: statusColor }} />
            </div>
            <span>{timeRemaining} min left</span>
          </div>
        )}

        {status === "reserved" && reservedFor && (
          <div className="reserved-info">Reserved: {reservedFor}</div>
        )}

        {status === "done" && bookedBy && (
          <div className="done-warning">⚠️ {bookedBy}: collect now to avoid penalty</div>
        )}
      </div>

      <div className="machine-actions">
        {canBook && (
          <button className="btn-primary btn-sm" onClick={() => onSelect(machine)}>
            Book
          </button>
        )}
        {isMyMachine && (status === "reserved" || status === "in_use") && (
          <button className="btn-ghost btn-sm" onClick={() => onCancel(id)}>
            Cancel
          </button>
        )}
        {status === "done" && isMyMachine && (
          <button className="btn-success btn-sm" onClick={() => onCancel(id)}>
            Mark Collected
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

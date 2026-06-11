import { useState } from "react";

const DURATIONS = [
  { label: "Quick Wash (30 min)", value: 30 },
  { label: "Standard (45 min)", value: 45 },
  { label: "Deep Clean (60 min)", value: 60 },
];

const TIME_SLOTS = ["Now", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

export default function BookingModal({ machine, userName, onBook, onClose }) {
  const [duration, setDuration] = useState(45);
  const [timeSlot, setTimeSlot] = useState("Now");

  const handleBook = () => {
    onBook(machine.id, {
      startNow: timeSlot === "Now",
      time: timeSlot,
      duration,
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Book {machine.id}</h3>
            <span className="modal-sub">{machine.type} · {machine.floor}</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Resident Name</label>
            <div className="readonly-field">{userName}</div>
          </div>

          <div className="form-group">
            <label>Wash Duration</label>
            <div className="option-group">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  className={`option-btn ${duration === d.value ? "selected" : ""}`}
                  onClick={() => setDuration(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <div className="time-grid">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  className={`time-btn ${timeSlot === t ? "selected" : ""}`}
                  onClick={() => setTimeSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="booking-summary">
            <div className="summary-row">
              <span>Machine</span><strong>{machine.id} ({machine.type})</strong>
            </div>
            <div className="summary-row">
              <span>Booked by</span><strong>{userName}</strong>
            </div>
            <div className="summary-row">
              <span>Time</span><strong>{timeSlot === "Now" ? "Starts immediately" : timeSlot}</strong>
            </div>
            <div className="summary-row">
              <span>Duration</span><strong>{duration} minutes</strong>
            </div>
            <div className="penalty-note">
              ⚠️ Laundry not collected within 15 min of completion will incur a penalty point.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleBook}>
            {timeSlot === "Now" ? "Start Now" : `Reserve for ${timeSlot}`}
          </button>
        </div>
      </div>
    </div>
  );
}

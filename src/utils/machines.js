export function generateMachines() {
  return [
    { id: "M-01", floor: "Floor 1", type: "Washer", status: "in_use", bookedBy: "Priya", timeRemaining: 18, bookedSlot: null, reservedFor: null },
    { id: "M-02", floor: "Floor 1", type: "Washer", status: "available", bookedBy: null, timeRemaining: null, bookedSlot: null, reservedFor: null },
    { id: "M-03", floor: "Floor 1", type: "Dryer",  status: "reserved", bookedBy: "Rahul", timeRemaining: null, bookedSlot: null, reservedFor: "3:00 PM" },
    { id: "M-04", floor: "Floor 1", type: "Dryer",  status: "available", bookedBy: null, timeRemaining: null, bookedSlot: null, reservedFor: null },
    { id: "M-05", floor: "Floor 2", type: "Washer", status: "done",  bookedBy: "Ananya", timeRemaining: 0, bookedSlot: null, reservedFor: null },
    { id: "M-06", floor: "Floor 2", type: "Washer", status: "available", bookedBy: null, timeRemaining: null, bookedSlot: null, reservedFor: null },
    { id: "M-07", floor: "Floor 2", type: "Dryer",  status: "in_use", bookedBy: "Kiran", timeRemaining: 34, bookedSlot: null, reservedFor: null },
    { id: "M-08", floor: "Floor 2", type: "Dryer",  status: "available", bookedBy: null, timeRemaining: null, bookedSlot: null, reservedFor: null },
  ];
}

export function simulateTick(machines) {
  const finished = [];
  const updated = machines.map((m) => {
    if (m.status === "in_use" && m.timeRemaining !== null) {
      const newTime = m.timeRemaining - 1;
      if (newTime <= 0) {
        finished.push(m);
        return { ...m, status: "done", timeRemaining: 0 };
      }
      return { ...m, timeRemaining: newTime };
    }
    return m;
  });
  return { updated, finished };
}

export function getStatusLabel(status) {
  return {
    available: "Available",
    in_use: "In Use",
    reserved: "Reserved",
    done: "Done — Collect Now",
  }[status] || status;
}

export function getStatusColor(status) {
  return {
    available: "#0B5E5A",
    in_use: "#F59E0B",
    reserved: "#6366F1",
    done: "#EF4444",
  }[status] || "#888";
}

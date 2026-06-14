import { useState, useEffect, useCallback } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import BookingModal from "./components/BookingModal";
import AIAdvisor from "./components/AIAdvisor";
import WolframAnalytics from "./components/WolframAnalytics";
import AdminDashboard from "./components/AdminDashboard";
import Header from "./components/Header";
import HistoryTab from "./components/HistoryTab";
import NotificationToast from "./components/NotificationToast";
import { generateMachines, simulateTick } from "./utils/machines";
import { api } from "./utils/api";

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | app
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("laundryai_user")); } catch { return null; }
  });
  const [machines, setMachines] = useState(generateMachines());
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [useDemo] = useState(true);

  // If user is already logged in, skip to app
  useEffect(() => {
    if (user) setScreen("app");
  }, []);

  const addNotification = useCallback((msg, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  // Simulate machine ticks in demo mode
  useEffect(() => {
    if (screen !== "app") return;
    const interval = setInterval(() => {
      setMachines((prev) => {
        const { updated, finished } = simulateTick(prev);
        finished.forEach((m) =>
          addNotification(`🔔 ${m.id} is done! ${m.bookedBy ? `@${m.bookedBy}, collect your laundry.` : ""}`, "success")
        );
        return updated;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [screen, addNotification]);

  const handleBook = (machineId, slot) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? { ...m, status: slot.startNow ? "in_use" : "reserved",
              bookedBy: user?.FirstName || user?.user_id || "You",
              timeRemaining: slot.startNow ? slot.duration : null,
              reservedFor: slot.startNow ? null : slot.time }
          : m
      )
    );
    addNotification(`✅ ${machineId} ${slot.startNow ? "started!" : `reserved for ${slot.time}!`}`, "success");
    setSelectedMachine(null);
  };

  const handleCancel = (machineId) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? { ...m, status: "available", bookedBy: null, timeRemaining: null, reservedFor: null }
          : m
      )
    );
    addNotification(`❌ Booking for ${machineId} cancelled.`, "info");
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("laundryai_user", JSON.stringify(userData));
    setScreen("app");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("laundryai_user");
    setMachines(generateMachines());
    setScreen("landing");
    setActiveTab("dashboard");
  };

  if (screen === "landing") return <LandingPage onGetStarted={() => setScreen("auth")} />;
  if (screen === "auth")    return <AuthPage onLogin={handleLogin} onBack={() => setScreen("landing")} />;

  const userName = user?.FirstName || user?.user_id || "Resident";

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        machines={machines}
        userName={userName}
        onLogout={handleLogout}
        useDemo={useDemo}
      />
      <main className="main-content">
        {activeTab === "dashboard" && (
          <Dashboard machines={machines} userName={userName} onSelect={setSelectedMachine} onCancel={handleCancel} />
        )}
        {activeTab === "ai"      && <AIAdvisor machines={machines} userName={userName} />}
        {activeTab === "history" && <HistoryTab userName={userName} userId={user?.user_id} useDemo={useDemo} />}
        {activeTab === "wolfram"  && <WolframAnalytics machines={machines} />}
        {activeTab === "admin"   && <AdminDashboard />}
      </main>

      {selectedMachine && (
        <BookingModal machine={selectedMachine} userName={userName} onBook={handleBook} onClose={() => setSelectedMachine(null)} />
      )}

      <div className="toast-container">
        {notifications.map((n) => <NotificationToast key={n.id} notification={n} />)}
      </div>
    </div>
  );
}

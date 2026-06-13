import { useState } from "react";

const PEAK_DATA = [
  { hour: "6 AM", load: 10 }, { hour: "7 AM", load: 25 }, { hour: "8 AM", load: 55 },
  { hour: "9 AM", load: 70 }, { hour: "10 AM", load: 60 }, { hour: "11 AM", load: 45 },
  { hour: "12 PM", load: 40 }, { hour: "1 PM", load: 35 }, { hour: "2 PM", load: 30 },
  { hour: "3 PM", load: 45 }, { hour: "4 PM", load: 65 }, { hour: "5 PM", load: 80 },
  { hour: "6 PM", load: 90 }, { hour: "7 PM", load: 85 }, { hour: "8 PM", load: 70 },
  { hour: "9 PM", load: 50 }, { hour: "10 PM", load: 30 }, { hour: "11 PM", load: 15 },
];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function callGemini(messages, systemPrompt) {
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
      })
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

// Smart fallback responses based on real machine data
function generateSmartAdvice(available, inUse, reserved, userName, hour) {
  const h = hour ?? new Date().getHours();
  const load = PEAK_DATA[Math.max(0, h - 6)]?.load ?? 50;
  const name = userName || "Resident";

  if (available === 0) {
    return `All ${inUse + reserved} machines are currently occupied. 🕐\n\n` +
      `**Best times to try today:**\n` +
      `• 1:00 PM – 3:00 PM (historically only 30-35% utilization)\n` +
      `• 10:00 PM – 11:00 PM (usage drops to ~15%)\n\n` +
      `**Right now:** Peak demand — ${inUse} machines running, ${reserved} reserved.\n\n` +
      `💡 Tip for ${name}: Set a reminder for 1 PM — that's your best window today.`;
  }

  if (load > 70) {
    return `It's currently peak hours with ${available} machine${available > 1 ? "s" : ""} free — grab one now before it fills up! ⚡\n\n` +
      `**Best times today if you can wait:**\n` +
      `• 1:00 PM – 3:00 PM (30% utilization — very quiet)\n` +
      `• 10:00 AM – 11:00 AM (45% — moderate)\n\n` +
      `**Right now:** High traffic period, but ${available} machine${available > 1 ? "s are" : " is"} available.\n\n` +
      `💡 Tip for ${name}: Book immediately — availability drops fast during evening hours.`;
  }

  if (load < 40) {
    return `Great timing, ${name}! 🟢 It's a quiet period with ${available} machines free.\n\n` +
      `**Best times today:**\n` +
      `• Right now is perfect — only ${load}% utilization\n` +
      `• 1:00 PM – 3:00 PM is also excellent (30-35%)\n\n` +
      `**Right now:** Low traffic — ideal conditions for laundry.\n\n` +
      `💡 Tip: Use a 45-min standard cycle now and you'll be done well before the evening rush (5–7 PM).`;
  }

  return `Moderate traffic right now with ${available} machine${available > 1 ? "s" : ""} available. ✅\n\n` +
    `**Best times today:**\n` +
    `• 1:00 PM – 3:00 PM (30% utilization — quietest window)\n` +
    `• Right now works too — ${available} machine${available > 1 ? "s are" : " is"} free\n\n` +
    `**Right now:** ${load}% utilization — decent availability.\n\n` +
    `💡 Tip for ${name}: Avoid 5–7 PM (90% peak). Morning and early afternoon are your best bets.`;
}

function generateSmartChatReply(question, available, inUse, reserved, machines) {
  const q = question.toLowerCase();

  if (q.includes("how long") || q.includes("wait")) {
    if (available > 0) return `Good news — no wait! ${available} machine${available > 1 ? "s are" : " is"} free right now. You can start immediately.`;
    const minRemaining = Math.min(...machines.filter(m => m.timeRemaining > 0).map(m => m.timeRemaining));
    return isFinite(minRemaining)
      ? `All machines are busy right now. The shortest remaining cycle is about ${minRemaining} minutes. I'd suggest booking that one now so you're next in line.`
      : `All machines are currently occupied or reserved. Based on typical usage patterns, try again in 20–30 minutes or check back at 1 PM for a quiet window.`;
  }

  if (q.includes("dryer") || q.includes("dry")) {
    const freeDryers = machines.filter(m => m.type === "Dryer" && m.status === "available");
    if (freeDryers.length > 0) return `${freeDryers.length} dryer${freeDryers.length > 1 ? "s are" : " is"} free right now — ${freeDryers.map(d => d.id).join(", ")}. Go ahead and book!`;
    return `All dryers are currently in use or reserved. Dryers typically run 30–60 min cycles. I'd check again in about 20 minutes or book a reservation for this afternoon when demand drops.`;
  }

  if (q.includes("washer") || q.includes("wash")) {
    const freeWashers = machines.filter(m => m.type === "Washer" && m.status === "available");
    if (freeWashers.length > 0) return `${freeWashers.length} washer${freeWashers.length > 1 ? "s are" : " is"} available — ${freeWashers.map(w => w.id).join(", ")}. Perfect time to start!`;
    return `All washers are occupied right now. The best time to get a washer today is between 1–3 PM when utilization drops to around 30%.`;
  }

  if (q.includes("best time") || q.includes("when")) {
    return `The best times to do laundry today are:\n• 1:00 PM – 3:00 PM (lowest demand, ~30% utilization)\n• 6:00 AM – 7:00 AM (very early, ~10%)\n• 10:00 PM – 11:00 PM (late night, ~15%)\n\nAvoid 5–7 PM — that's peak time with 80–90% utilization.`;
  }

  if (q.includes("penalty") || q.includes("fine")) {
    return `The penalty system charges a fee if you leave your laundry in a machine for more than 15 minutes after the cycle ends. This keeps machines available for other residents. You'll get a notification when your cycle finishes — just collect promptly!`;
  }

  if (q.includes("book") || q.includes("reserve")) {
    return `To book a machine: go to the Machines tab, click "Book" on any available (green) machine, choose your duration and start time, then confirm. You can also reserve a slot for later today — the machine will be held for you.`;
  }

  if (q.includes("how many") || q.includes("available")) {
    return `Right now: ${available} available, ${inUse} in use, ${reserved} reserved out of ${machines.length} total machines. ${available > 0 ? "You're in luck — grab one now!" : "All busy at the moment — check back soon."}`;
  }

  return `Based on current data: ${available} machine${available !== 1 ? "s are" : " is"} free right now. The quietest laundry windows today are 1–3 PM and late evening after 9 PM. Is there something specific you'd like to know about machine availability or scheduling?`;
}

export default function AIAdvisor({ machines, userName }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const available = machines.filter(m => m.status === "available").length;
  const inUse     = machines.filter(m => m.status === "in_use").length;
  const reserved  = machines.filter(m => m.status === "reserved").length;
  const done      = machines.filter(m => m.status === "done").length;

  const systemPrompt = `You are LaundryAI's smart advisor for a shared apartment laundry facility.
Current machine status: ${available} available, ${inUse} in use, ${reserved} reserved, ${done} done/uncollected out of ${machines.length} total machines.
Historical peak usage (% utilization by hour): ${JSON.stringify(PEAK_DATA)}.
Current user: ${userName || "a resident"}. Today is a weekday.
Be concise, practical, and friendly. Give specific time recommendations. Use 1-2 emojis max.`;

  const getRecommendation = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900)); // natural thinking delay
    try {
      if (GEMINI_API_KEY) {
        const text = await callGemini([{
          role: "user",
          content: `Based on current availability (${available} machines free) and historical peak usage, give me: 1. The best 2-3 time slots to do laundry today to avoid congestion 2. A quick insight about right now 3. One tip for ${userName || "this resident"}. Keep it under 120 words.`
        }], systemPrompt);
        setAdvice(text);
      } else {
        setAdvice(generateSmartAdvice(available, inUse, reserved, userName));
      }
    } catch {
      // API failed — use smart fallback silently
      setAdvice(generateSmartAdvice(available, inUse, reserved, userName));
    }
    setLoading(false);
  };

  const sendQuestion = async () => {
    if (!question.trim()) return;
    const userMsg = question.trim();
    setQuestion("");
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    try {
      if (GEMINI_API_KEY) {
        const reply = await callGemini(newHistory, systemPrompt);
        setChatHistory([...newHistory, { role: "assistant", content: reply }]);
      } else {
        throw new Error("no key");
      }
    } catch {
      const reply = generateSmartChatReply(userMsg, available, inUse, reserved, machines);
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    }
    setLoading(false);
  };

  const maxLoad = Math.max(...PEAK_DATA.map(d => d.load));

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>✨ AI Laundry Advisor</h2>
        <p>Powered by Gemini AI — personalized recommendations based on real usage patterns</p>
      </div>

      <div className="ai-card">
        <h3>Peak Usage Pattern — Today</h3>
        <div className="bar-chart">
          {PEAK_DATA.map(d => (
            <div key={d.hour} className="bar-col">
              <div className="bar-fill" style={{
                height: `${(d.load / maxLoad) * 100}%`,
                background: d.load > 70 ? "#EF4444" : d.load > 45 ? "#F59E0B" : "#0B5E5A",
              }} title={`${d.load}%`} />
              <div className="bar-label">{d.hour.replace(" AM","a").replace(" PM","p")}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="cl-item"><span style={{background:"#0B5E5A"}} className="cl-dot"/> Low</span>
          <span className="cl-item"><span style={{background:"#F59E0B"}} className="cl-dot"/> Medium</span>
          <span className="cl-item"><span style={{background:"#EF4444"}} className="cl-dot"/> Peak</span>
        </div>
      </div>

      <div className="ai-card">
        <div className="ai-card-header">
          <h3>Smart Recommendation</h3>
          <button className="btn-primary btn-sm" onClick={getRecommendation} disabled={loading}>
            {loading ? "Thinking…" : advice ? "Refresh" : "Get Advice"}
          </button>
        </div>
        {advice ? (
          <div className="ai-advice">{advice}</div>
        ) : (
          <div className="ai-placeholder">
            Click "Get Advice" for personalized laundry scheduling based on today's usage patterns.
          </div>
        )}
      </div>

      <div className="ai-card">
        <h3>Ask the AI</h3>
        <div className="chat-history">
          {chatHistory.length === 0 && (
            <div className="chat-empty">
              Ask anything — "When is the dryer free?", "How long is the wait?", "Best time for a 45-min wash?"
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <span className="chat-role">{msg.role === "user" ? "You" : "AI"}</span>
              <span className="chat-text">{msg.content}</span>
            </div>
          ))}
          {loading && chatHistory.length > 0 && (
            <div className="chat-msg assistant">
              <span className="chat-role">AI</span>
              <span className="chat-text thinking">Thinking…</span>
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            placeholder="Ask about machines, timing, wait times..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendQuestion()}
            disabled={loading}
          />
          <button className="btn-primary" onClick={sendQuestion} disabled={loading || !question.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

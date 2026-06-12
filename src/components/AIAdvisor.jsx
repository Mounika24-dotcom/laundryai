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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
    if (!GEMINI_API_KEY) {
      setAdvice("⚠️ AI Advisor needs an API key configured. Please set VITE_GEMINI_API_KEY in your environment.");
      return;
    }
    setLoading(true);
    try {
      const text = await callGemini([{
        role: "user",
        content: `Based on current availability (${available} machines free) and historical peak usage, give me:
1. The best 2-3 time slots to do laundry today to avoid congestion
2. A quick insight about right now
3. One tip for ${userName || "this resident"}
Keep it under 120 words.`
      }], systemPrompt);
      setAdvice(text);
    } catch (e) {
      setAdvice(`Unable to connect to AI advisor: ${e.message}`);
    }
    setLoading(false);
  };

  const sendQuestion = async () => {
    if (!question.trim() || !GEMINI_API_KEY) return;
    const userMsg = question.trim();
    setQuestion("");
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);
    setLoading(true);
    try {
      const reply = await callGemini(newHistory, systemPrompt);
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatHistory([...newHistory, { role: "assistant", content: `Error: ${e.message}` }]);
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

      {/* Peak usage chart */}
      <div className="ai-card">
        <h3>Peak Usage Pattern — Today</h3>
        <div className="bar-chart">
          {PEAK_DATA.map(d => (
            <div key={d.hour} className="bar-col">
              <div
                className="bar-fill"
                style={{
                  height: `${(d.load / maxLoad) * 100}%`,
                  background: d.load > 70 ? "#EF4444" : d.load > 45 ? "#F59E0B" : "#0B5E5A",
                }}
                title={`${d.load}%`}
              />
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

      {/* Smart recommendation */}
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

      {/* Chat */}
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

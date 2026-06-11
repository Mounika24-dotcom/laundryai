# 🫧 LaundryAI — Smart Laundry Optimization Platform

> **OSC AI Build 1.0 · Theme: Future of Productivity**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-teal?style=for-the-badge)](https://laundryai.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🧩 Problem Statement

Shared laundry facilities in apartments, dormitories, and hostels are a daily source of frustration:

- Users must **physically walk to check** if machines are available
- Clothes are **left inside machines** after cycles finish, blocking others
- **No scheduling system** leads to conflicts and long queues
- **No visibility** into machine status without being present

This leads to poor machine utilization, wasted time, and friction among residents.

---

## 💡 Our Solution

**LaundryAI** is an intelligent, AI-powered platform that transforms shared laundry rooms into organized, efficient, and user-friendly systems.

| Feature | Description |
|---|---|
| 🟢 **Real-time Machine Status** | Live dashboard showing Available / In Use / Reserved / Done for every machine |
| 📅 **Smart Reservation System** | Book a time slot in advance; prevent machine hogging |
| ✨ **AI Laundry Advisor** | Claude AI analyzes historical usage patterns and recommends the best time to do laundry |
| 🔔 **Automated Notifications** | Alerts when your laundry cycle is done |
| ⚠️ **Penalty System** | Discourages delayed laundry removal with a fair penalty structure |
| 💳 **Payment Integration** | In-app payment for laundry sessions |

---

## 🤖 AI Feature

The **AI Laundry Advisor** uses **Anthropic's Claude API** to:

1. Analyze historical peak usage data (by hour of day)
2. Factor in current machine availability and day of week
3. Recommend **personalized optimal time slots** for each resident
4. Answer natural language questions like *"When is the dryer free?"* or *"What's the wait time right now?"*

This goes beyond rule-based logic — the AI considers patterns, current load, and resident-specific history to give genuinely useful advice.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + Vite — fast, component-based UI
- **CSS custom properties** — design system with teal/mint palette
- Deployed on **Vercel**

### Backend
- **Python FastAPI** — REST API with async support
- **MySQL** — relational database for users, reservations, payments, penalties
- Deployed on **Render / Railway**

### AI
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) — conversational AI advisor
- Real-time peak usage analysis + natural language Q&A

### Dev Tools
- Git + GitHub for version control
- `.env` for configuration management

---

## 🗃️ Database Schema

```
User ──< Reservation ──< Laundry_Timeslot
              │
              ├──< Payment
              └── Machine_ID → Laundry_Machine

Notification (linked to User)
Penalty (linked to User)
```

**5 core tables:** `User`, `Laundry_Machine`, `Reservation`, `Laundry_Timeslot`, `Payment`  
**2 support tables:** `Notification`, `Penalty`

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8.0+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/laundryai.git
cd laundryai
```

### 2. Set up the database

```bash
mysql -u root -p < backend/schema.sql
```

### 3. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Configure frontend

```bash
cd ..
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

### 5. Open in browser

```
http://localhost:5173
```

> **No backend?** The app runs in **Demo Mode** automatically — all features work with simulated data. Enter any username to explore.

---

## 🚀 Deployment

**Frontend → Vercel:**
```bash
npm run build
# Connect GitHub repo to Vercel, set VITE_API_URL env var
```

**Backend → Render:**
```
Build command: pip install -r requirements.txt
Start command: uvicorn main:app --host 0.0.0.0 --port 10000
```

---

## 🏆 Impact & Value

- **Residents** save time — no more walking to check machines
- **Building managers** get usage analytics and reduce conflicts
- **AI recommendations** reduce peak-hour congestion by suggesting off-peak slots
- **Penalty system** improves machine turnover and fairness
- Scalable to any shared facility: dorms, apartments, co-working spaces

---

## 🔭 Future Scope

- **IoT Integration** — connect to smart washing machines for automatic status detection
- **Mobile App** — React Native app for push notifications
- **Energy Optimization** — AI suggests laundry times during low electricity demand periods
- **Predictive Maintenance** — detect abnormal usage patterns before breakdowns
- **Smart Building Integration** — plug into apartment management systems

---

## 👩‍💻 Team

| Name | Role |
|---|---|
| **Mounika Yegireddi** | Full Stack Developer · AI Integration · Database Design |

- M.S. Data Science, Central Michigan University
- Background: Data Engineering, Python, SQL, React

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built for OSC AI Build 1.0 · June 2026*

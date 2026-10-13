import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "casaquest-state-v1";

const TASKS = [
  { id: "kitchen", name: "Recoger la cocina", points: 1, icon: "🍽️", category: "Diarias" },
  { id: "dishwasher", name: "Poner / vaciar lavavajillas", points: 1, icon: "🫧", category: "Diarias" },
  { id: "trash", name: "Sacar la basura", points: 1, icon: "🗑️", category: "Diarias" },
  { id: "bed", name: "Hacer la cama", points: 1, icon: "🛏️", category: "Diarias" },
  { id: "laundry", name: "Hacer una colada", points: 2, icon: "🧺", category: "Casa" },
  { id: "sweep", name: "Barrer", points: 2, icon: "🧹", category: "Casa" },
  { id: "cook", name: "Cocinar", points: 3, icon: "🍳", category: "Casa" },
  { id: "mop", name: "Fregar el suelo", points: 3, icon: "🪣", category: "Casa" },
  { id: "bathroom", name: "Limpiar el baño", points: 4, icon: "🚿", category: "Casa" },
  { id: "vacuum", name: "Aspirar toda la casa", points: 4, icon: "🧹", category: "Casa" },
  { id: "deep", name: "Limpieza profunda", points: 8, icon: "⚔️", category: "Épicas" }
];

const REWARDS = [
  { id: "tiktok", name: "20 min de TikTok", cost: 5, icon: "📱", type: "personal" },
  { id: "gaming", name: "30 min de videojuego", cost: 5, icon: "🎮", type: "personal" },
  { id: "sleep", name: "Dormir hasta tarde", cost: 10, icon: "😴", type: "personal" },
  { id: "movie", name: "Elegir la película", cost: 15, icon: "🎬", type: "personal" },
  { id: "delivery", name: "Pedir comida", cost: 20, icon: "🍕", type: "common" },
  { id: "cinema", name: "Ir al cine", cost: 30, icon: "🍿", type: "common" },
  { id: "geek", name: "Compra friki ≤ 30 €", cost: 75, icon: "🧙‍♂️", type: "personal" }
];

const INITIAL_LOG = [
  { id: 1, user: "brais", task: "Recoger la cocina", points: 1, when: "Hoy, 12:42" },
  { id: 2, user: "noa", task: "Aspirar toda la casa", points: 4, when: "Hoy, 11:16" },
  { id: 3, user: "brais", task: "Hacer una colada", points: 2, when: "Ayer, 20:05" }
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function App() {
  const [state, setState] = useState(() => loadState() || {
    users: { brais: null, noa: null },
    common: 18,
    log: INITIAL_LOG
  });
  const [activeUser, setActiveUser] = useState("brais");
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (state.users.brais && state.users.noa) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (!state.users.brais || !state.users.noa) {
      Promise.all([
        fetch(`${import.meta.env.BASE_URL}data/brais.json`).then(r => r.json()),
        fetch(`${import.meta.env.BASE_URL}data/noa.json`).then(r => r.json())
      ]).then(([brais, noa]) => {
        setState(s => s.users.brais ? s : ({ ...s, users: { brais, noa } }));
      }).catch(() => {});
    }
  }, []);

  const user = state.users[activeUser];
  const other = state.users[activeUser === "brais" ? "noa" : "brais"];

  const totalPoints = (state.users.brais?.points || 0) + (state.users.noa?.points || 0) + state.common;
  const progress = Math.min(100, totalPoints);
  const weeklyGoal = 100;
  const level = user?.level || 1;
  const nextLevel = level * 10 + 10;
  const levelProgress = Math.min(100, ((user?.xp || 0) % 10) * 10);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function completeTask(task) {
    if (!user) return;
    const updatedUser = {
      ...user,
      points: user.points + task.points,
      xp: user.xp + task.points,
      level: Math.floor((user.xp + task.points) / 10) + 1
    };
    const entry = {
      id: Date.now(),
      user: activeUser,
      task: task.name,
      points: task.points,
      when: "Ahora"
    };
    setState(s => ({
      ...s,
      users: { ...s.users, [activeUser]: updatedUser },
      log: [entry, ...s.log].slice(0, 30)
    }));
    notify(`+${task.points} 🪙 ${task.name}`);
  }

  function redeem(reward) {
    if (!user) return;
    if (reward.type === "common") {
      if (state.common < reward.cost) return notify("Todavía no hay suficientes puntos comunes.");
      setState(s => ({ ...s, common: s.common - reward.cost }));
      notify(`🎁 Canjeado: ${reward.name}`);
      return;
    }
    if (user.points < reward.cost) return notify("Te faltan puntos.");
    setState(s => ({
      ...s,
      users: { ...s.users, [activeUser]: { ...user, points: user.points - reward.cost } }
    }));
    notify(`🎁 Canjeado: ${reward.name}`);
  }

  function exportJson() {
    const data = state.users[activeUser];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeUser}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exportado ${activeUser}.json`);
  }

  if (!user) return <div className="loading">Cargando CasaQuest…</div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">🏠</div>
          <div>
            <strong>CasaQuest</strong>
            <span>La casa también puede ser un juego.</span>
          </div>
        </div>
        <div className="user-switch">
          <button className={activeUser === "brais" ? "active" : ""} onClick={() => setActiveUser("brais")}>🧙 Brais</button>
          <button className={activeUser === "noa" ? "active" : ""} onClick={() => setActiveUser("noa")}>🧝 Noa</button>
        </div>
      </header>

      <main>
        {tab === "home" && (
          <>
            <section className="hero-grid">
              <div className="hero-card">
                <div className="eyebrow">TU CUENTA</div>
                <div className="hero-user"><span>{user.emoji}</span><div><h1>{user.name}</h1><p>Nivel {level} · Domador del caos doméstico</p></div></div>
                <div className="xp"><div className="xp-row"><span>XP hacia nivel {level + 1}</span><b>{user.xp % 10}/10</b></div><div className="progress"><i style={{width: `${levelProgress}%`}} /></div></div>
                <div className="coin-big">🪙 <strong>{user.points}</strong><span>puntos personales</span></div>
              </div>
              <div className="common-card">
                <div className="eyebrow">BOTE COMÚN</div>
                <div className="common-number">{state.common} <small>🪙</small></div>
                <p>Para recompensas que disfrutáis juntos.</p>
                <div className="goal"><div className="goal-row"><span>Objetivo semanal</span><b>{totalPoints}/{weeklyGoal}</b></div><div className="progress"><i style={{width: `${Math.min(100, progress)}%`}} /></div></div>
                <div className="mini-people"><span>🧙 {state.users.brais?.points || 0}</span><span>🧝 {state.users.noa?.points || 0}</span><span>🤝 {state.common}</span></div>
              </div>
            </section>

            <section className="section">
              <div className="section-title"><div><span className="eyebrow">MISIÓN DEL DÍA</span><h2>Elige una tarea y reclama tu loot</h2></div><button className="ghost" onClick={() => notify("🎲 Misión aleatoria próximamente")}>🎲 Aleatoria</button></div>
              <div className="task-grid">
                {TASKS.map(t => <button className="task-card" key={t.id} onClick={() => completeTask(t)}><span className="task-icon">{t.icon}</span><span className="task-name">{t.name}</span><span className="task-points">+{t.points} 🪙</span></button>)}
              </div>
            </section>

            <section className="section">
              <div className="section-title"><div><span className="eyebrow">TIENDA</span><h2>Canjea tus puntos</h2></div><button className="ghost" onClick={() => setTab("shop")}>Ver todo →</button></div>
              <div className="reward-grid">
                {REWARDS.slice(0, 4).map(r => <RewardCard key={r.id} reward={r} user={user} common={state.common} onRedeem={redeem}/>)}
              </div>
            </section>

            <section className="section">
              <div className="section-title"><div><span className="eyebrow">ACTIVIDAD</span><h2>Últimas aventuras</h2></div><button className="ghost" onClick={() => setTab("history")}>Historial →</button></div>
              <Activity log={state.log.slice(0, 5)} />
            </section>
          </>
        )}

        {tab === "shop" && <section className="page"><div className="page-head"><span className="eyebrow">TIENDA</span><h1>La recompensa es parte de la misión.</h1><p>Los premios personales salen de tus puntos. Los de pareja salen del bote común.</p></div><div className="reward-grid">{REWARDS.map(r => <RewardCard key={r.id} reward={r} user={user} common={state.common} onRedeem={redeem}/>)}</div></section>}

        {tab === "history" && <section className="page"><div className="page-head"><span className="eyebrow">HISTORIAL</span><h1>Quién está salvando la casa.</h1><p>Un registro sencillo de las hazañas domésticas.</p></div><Activity log={state.log} /></section>}

        {tab === "settings" && <section className="page"><div className="page-head"><span className="eyebrow">DATOS</span><h1>Tu partida, tus datos.</h1><p>La versión de GitHub Pages funciona sin servidor. Los cambios de esta partida se guardan en este navegador.</p></div><div className="settings-card"><h3>Exportar {activeUser}.json</h3><p>Descarga el estado actual de este jugador para guardarlo o versionarlo en Git.</p><button className="primary" onClick={exportJson}>↓ Exportar JSON</button></div><div className="warning"><b>Importante para el despliegue</b><br/>GitHub Pages sirve archivos estáticos: no puede escribir directamente estos JSON desde el navegador. Por eso esta primera versión usa los JSON como estado inicial y localStorage para guardar los cambios. Si queréis que ambos móviles compartan puntos en tiempo real, la siguiente evolución debería usar Supabase o Firebase.</div></section>}
      </main>

      <nav className="bottom-nav">
        <button className={tab === "home" ? "selected" : ""} onClick={() => setTab("home")}>⌂<span>Casa</span></button>
        <button className={tab === "shop" ? "selected" : ""} onClick={() => setTab("shop")}>🛍<span>Tienda</span></button>
        <button className={tab === "history" ? "selected" : ""} onClick={() => setTab("history")}>📜<span>Historial</span></button>
        <button className={tab === "settings" ? "selected" : ""} onClick={() => setTab("settings")}>⚙<span>Datos</span></button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function RewardCard({ reward, user, common, onRedeem }) {
  const balance = reward.type === "common" ? common : user.points;
  const enough = balance >= reward.cost;
  return <div className="reward-card"><div className="reward-top"><span className="reward-icon">{reward.icon}</span><span className={`pill ${reward.type}`}>{reward.type === "common" ? "Pareja" : "Personal"}</span></div><h3>{reward.name}</h3><div className="reward-bottom"><b>{reward.cost} 🪙</b><button disabled={!enough} onClick={() => onRedeem(reward)}>{enough ? "Canjear" : "Faltan puntos"}</button></div></div>
}

function Activity({ log }) {
  return <div className="activity">{log.map(item => <div className="activity-row" key={item.id}><span className="activity-avatar">{item.user === "brais" ? "🧙" : "🧝"}</span><div><b>{item.user === "brais" ? "Brais" : "Noa"}</b> completó <strong>{item.task}</strong><small>{item.when}</small></div><em>+{item.points}</em></div>)}</div>
}

createRoot(document.getElementById("root")).render(<App />);
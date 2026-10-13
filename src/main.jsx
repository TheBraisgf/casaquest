import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { cloudEnabled, supabase } from './lib/supabase';

const KEY = 'casaquest-state-v2';
const USERS = {
  brais: { id:'brais', name:'Brais', emoji:'🧙', title:'Domador del caos', avatar:'🧔🏻' },
  noa: { id:'noa', name:'Noa', emoji:'🧝', title:'Guardiana del orden', avatar:'👩🏻' }
};
const TASKS = [
  ['kitchen','Recoger la cocina',1,'🍽️','Cocina'],['dishwasher','Poner / vaciar lavavajillas',1,'🫧','Cocina'],['counter','Limpiar encimera',2,'🧽','Cocina'],
  ['bed','Hacer la cama',1,'🛏️','Dormitorio'],['trash','Sacar la basura',1,'🗑️','Casa'],['laundry','Hacer una colada',2,'🧺','Ropa'],
  ['dry','Tender / recoger ropa',2,'👕','Ropa'],['sweep','Barrer',2,'🧹','Salón'],['vacuum','Aspirar',3,'🌀','Salón'],
  ['sofa','Ordenar el sofá',1,'🛋️','Salón'],['cook','Cocinar',3,'🍳','Cocina'],['mop','Fregar el suelo',3,'🪣','Casa'],
  ['bathroom','Limpiar el baño',4,'🚿','Baño'],['towels','Cambiar toallas',2,'🧻','Baño'],['deep','Limpieza profunda',8,'⚔️','Épica']
].map(([id,name,points,icon,category])=>({id,name,points,icon,category}));
const REWARDS = [
  ['tiktok','20 min de TikTok',5,'📱','personal'],['gaming','30 min de videojuego',5,'🎮','personal'],['movie','Elegir qué vemos',5,'🍿','personal'],
  ['couch','1 hora sin tareas',5,'🛋️','personal'],['sleep','Dormir hasta tarde',10,'😴','personal'],['delivery','Pedir comida',10,'🍕','common'],
  ['cinema','Ir al cine',30,'🎬','common'],['hobby','2 h de hobby',20,'🎧','personal'],['geek','Compra friki ≤ 30 €',75,'🧙‍♂️','personal'],
  ['date','Cita sorpresa',40,'❤️','common']
].map(([id,name,cost,icon,type])=>({id,name,cost,icon,type}));
const INITIAL = { users:{brais:{...USERS.brais,points:12,xp:42,level:4,streak:6},noa:{...USERS.noa,points:9,xp:35,level:4,streak:4}}, common:18, weeklyGoal:100, log:[
  {id:1,user:'brais',text:'Recoger la cocina',points:1,time:'Hoy · 18:42',icon:'🍽️'},
  {id:2,user:'noa',text:'Aspirar toda la casa',points:3,time:'Hoy · 17:16',icon:'🌀'},
  {id:3,user:'brais',text:'Hacer una colada',points:2,time:'Ayer · 20:05',icon:'🧺'},
  {id:4,user:'noa',text:'Limpiar el baño',points:4,time:'Ayer · 19:22',icon:'🚿'}
]};

function readLocal(){ try { return JSON.parse(localStorage.getItem(KEY)) || INITIAL } catch { return INITIAL } }
function writeLocal(s){ localStorage.setItem(KEY,JSON.stringify(s)); }
function App(){
  const [state,setState]=useState(readLocal); const [active,setActive]=useState('brais'); const [tab,setTab]=useState('home'); const [filter,setFilter]=useState('Todas'); const [toast,setToast]=useState('');
  const user=state.users[active];
  const categories=['Todas',...new Set(TASKS.map(t=>t.category))];
  const visibleTasks=TASKS.filter(t=>filter==='Todas'||t.category===filter);
  const total=state.users.brais.points+state.users.noa.points+state.common;
  const weekly=Math.min(100,Math.round(total/state.weeklyGoal*100));
  useEffect(()=>writeLocal(state),[state]);
  function notify(x){setToast(x);setTimeout(()=>setToast(''),2200)}
  function taskDone(t){
    setState(s=>({...s,users:{...s.users,[active]:{...s.users[active],points:s.users[active].points+t.points,xp:s.users[active].xp+t.points,level:Math.floor((s.users[active].xp+t.points)/10)+1}},log:[{id:Date.now(),user:active,text:t.name,points:t.points,time:'Ahora',icon:t.icon},...s.log].slice(0,40)}));
    notify(`+${t.points} 🪙 ${t.name}`);
  }
  function redeem(r){
    const wallet=r.type==='common'?state.common:user.points;
    if(wallet<r.cost) return notify(`Te faltan ${r.cost-wallet} 🪙`);
    setState(s=>r.type==='common'?({...s,common:s.common-r.cost}):({...s,users:{...s.users,[active]:{...s.users[active],points:s.users[active].points-r.cost}}}));
    notify(`🎁 ${r.name} desbloqueado`);
  }
  function reset(){if(confirm('¿Reiniciar la partida local?')){setState(INITIAL);notify('Partida reiniciada')}}
  return <div className="shell">
    <header className="top"><button className="brand" onClick={()=>setTab('home')}><span className="brandIcon">⌂</span><span><b>CasaQuest</b><small>La casa también puede ser un juego.</small></span></button>
      <div className="cloud"><span className={cloudEnabled?'online':'offline'}></span>{cloudEnabled?'Nube conectada':'Modo local'}</div>
      <div className="switch">{Object.values(USERS).map(u=><button key={u.id} className={active===u.id?'on':''} onClick={()=>setActive(u.id)}>{u.emoji} {u.name}</button>)}</div>
    </header>
    <main>
      {tab==='home'&&<>
        <section className="hero"><div><div className="kicker">BUENAS, {user.name.toUpperCase()}</div><h1>Que la casa esté limpia.<br/><span>Que además sea divertido.</span></h1><p>Haz una misión, consigue monedas y gástalas sin culpa. Fácil, rápido y para dos.</p><div className="heroActions"><button className="primary" onClick={()=>document.getElementById('tasks').scrollIntoView({behavior:'smooth'})}>⚔️ Hacer una misión</button><button className="secondary" onClick={()=>setTab('shop')}>🛍️ Ver recompensas</button></div></div><div className="heroArt"><div className="house">🏠</div><div className="spark s1">✦</div><div className="spark s2">✦</div><div className="cat">🐈‍⬛</div></div></section>
        <section className="stats"><div className="profile"><div className="avatar">{user.avatar}</div><div><b>{user.name}</b><span>Nivel {user.level} · {user.title}</span><div className="bar"><i style={{width:`${(user.xp%10)*10}%`}}/></div></div><strong>{user.points}<small>🪙</small></strong></div><div className="profile"><div className="avatar">{state.users[active==='brais'?'noa':'brais'].avatar}</div><div><b>{state.users[active==='brais'?'noa':'brais'].name}</b><span>{state.users[active==='brais'?'noa':'brais'].points} 🪙 disponibles</span><div className="bar"><i style={{width:`${(state.users[active==='brais'?'noa':'brais'].xp%10)*10}%`}}/></div></div><strong>{state.users[active==='brais'?'noa':'brais'].level}<small> LVL</small></strong></div><div className="common"><span>BOTE COMÚN</span><b>{state.common} 🪙</b><div className="bar"><i style={{width:`${Math.min(100,state.common*3)}%`}}/></div><small>Para planes juntos</small></div></section>
        <section className="goal"><div><span className="kicker">OBJETIVO DE LA SEMANA</span><h2>100 monedas entre los dos</h2><p>{total} / {state.weeklyGoal} 🪙 · {weekly}% completado</p></div><div className="ring" style={{'--p':`${weekly}%`}}><b>{weekly}%</b></div></section>
        <section className="section" id="tasks"><div className="sectionHead"><div><span className="kicker">MISIONES</span><h2>¿Qué toca conquistar?</h2></div><div className="chips">{categories.map(c=><button key={c} className={filter===c?'sel':''} onClick={()=>setFilter(c)}>{c}</button>)}</div></div><div className="tasks">{visibleTasks.map(t=><button className="task" key={t.id} onClick={()=>taskDone(t)}><span className="taskIcon">{t.icon}</span><span><b>{t.name}</b><small>{t.category}</small></span><em>+{t.points}<small>🪙</small></em></button>)}</div></section>
        <section className="section"><div className="sectionHead"><div><span className="kicker">TIENDA</span><h2>Tu esfuerzo, tu recompensa.</h2></div><button className="link" onClick={()=>setTab('shop')}>Ver tienda →</button></div><div className="rewards">{REWARDS.slice(0,4).map(r=><Reward key={r.id} r={r} user={user} common={state.common} onRedeem={redeem}/>)}</div></section>
        <section className="section"><div className="sectionHead"><div><span className="kicker">ACTIVIDAD</span><h2>Últimas hazañas</h2></div><button className="link" onClick={()=>setTab('history')}>Ver historial →</button></div><Activity log={state.log.slice(0,5)}/></section>
      </>}
      {tab==='shop'&&<Page title="La recompensa es parte de la misión." kicker="TIENDA" subtitle="Hay premios personales y premios para compartir. Vosotros decidís cuánto vale cada capricho."><div className="rewards big">{REWARDS.map(r=><Reward key={r.id} r={r} user={user} common={state.common} onRedeem={redeem}/>)}</div></Page>}
      {tab==='history'&&<Page title="El registro de vuestra aventura." kicker="HISTORIAL" subtitle="Cada tarea suma. Cada moneda cuenta."><Activity log={state.log}/></Page>}
      {tab==='stats'&&<Page title="Cómo va vuestra partida." kicker="ESTADÍSTICAS" subtitle="Pequeños números para ver grandes hábitos."><div className="statGrid"><Stat n={state.log.length} label="misiones registradas" icon="⚔️"/><Stat n={state.users.brais.points+state.users.noa.points} label="monedas personales" icon="🪙"/><Stat n={Math.max(state.users.brais.streak,state.users.noa.streak)} label="mejor racha" icon="🔥"/><Stat n={state.common} label="en el bote común" icon="🤝"/></div><div className="chart"><h3>Actividad reciente</h3><div className="bars">{[18,34,25,48,31,54,42].map((h,i)=><div key={i}><i style={{height:`${h}%`}}/><small>{['L','M','X','J','V','S','D'][i]}</small></div>)}</div></div></Page>}
      {tab==='profile'&&<Page title={`Perfil de ${user.name}.`} kicker="PERFIL" subtitle="Configura tu personaje y cuida vuestra partida."><div className="profileBig"><div className="avatar xl">{user.avatar}</div><div><h2>{user.name}</h2><p>{user.title} · Nivel {user.level}</p><div className="bigCoins">{user.points} 🪙</div></div></div><div className="settings"><button onClick={()=>notify('🎲 Avatar aleatorio próximamente')}>🎲 Cambiar avatar</button><button onClick={reset}>↺ Reiniciar datos locales</button><p>{cloudEnabled?'La nube está configurada.':'Esta instalación funciona en modo local. Añade las variables de Supabase en GitHub Actions para activar sincronización.'}</p></div></Page>}
    </main>
    <nav className="nav">{[['home','⌂','Inicio'],['tasks','✓','Tareas'],['shop','▣','Tienda'],['history','≡','Historial'],['stats','◔','Stats'],['profile',user.avatar,'Perfil']].map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>id==='tasks'?document.getElementById('tasks')?.scrollIntoView({behavior:'smooth'}):setTab(id)}><b>{icon}</b><span>{label}</span></button>)}</nav>
    {toast&&<div className="toast">{toast}</div>}
  </div>
}
function Page({title,kicker,subtitle,children}){return <section className="page"><div className="pageTitle"><span className="kicker">{kicker}</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</section>}
function Reward({r,user,common,onRedeem}){const balance=r.type==='common'?common:user.points;const ok=balance>=r.cost;return <article className="reward"><div className="rewardIcon">{r.icon}</div><span className={r.type==='common'?'tag commonTag':'tag'}>{r.type==='common'?'PARA DOS':'PERSONAL'}</span><h3>{r.name}</h3><footer><b>{r.cost} 🪙</b><button disabled={!ok} onClick={()=>onRedeem(r)}>{ok?'Canjear':'Faltan '+(r.cost-balance)}</button></footer></article>}
function Activity({log}){return <div className="activity">{log.map(x=><div className="activityRow" key={x.id}><span>{x.icon}</span><div><b>{USERS[x.user].name}</b> completó <strong>{x.text}</strong><small>{x.time}</small></div><em>+{x.points}</em></div>)}</div>}
function Stat({n,label,icon}){return <div className="stat"><span>{icon}</span><b>{n}</b><small>{label}</small></div>}
createRoot(document.getElementById('root')).render(<App/>);

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, Component } from "react";
import ReactDOM from "react-dom";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, CalendarDays, CheckSquare, BookOpen, Clock,
  Newspaper, Sparkles, Bell, ChevronRight, Plus,
  Timer, Users, Share2, Tag, Flame, Coffee, Dumbbell,
  Briefcase, GraduationCap, Heart, Star, ArrowRight, Zap, Menu, X,
  DollarSign, PiggyBank, BarChart2, Sun, Moon, Settings, Check,
  Link, FileText, Award, Wallet, ArrowUpRight, ArrowDownRight,
  SplitSquareHorizontal, Loader2, Pencil, Trash2, GripVertical, Palette,
  TrendingUp, Play, Pause, RotateCcw, SkipForward, Activity, Target,
  WatchIcon, Focus, LayoutGrid, Move, Camera, Mail, Send, Save, Download, MessageSquare, Search, Copy
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";

// ─── TOAST SYSTEM ────────────────────────────────────────────────────────────
// Usage: toast.success("msg") | toast.error("msg") | toast.info("msg") | toast.warning("msg")
// confirmModal("¿Seguro?", "Descripción", onConfirm, { danger: true })
// Safe for React 18 concurrent mode: uses a stable ref instead of module-level mutation.

const ToastCtx   = createContext(null);
const ConfirmCtx = createContext(null);

export const toast = {
  _push(type, msg) {
    if (!toast._set) return;
    const id = Date.now() + Math.random();
    toast._set(prev => [...prev, { id, type, msg }]);
    setTimeout(() => toast._set(prev => prev.filter(t => t.id !== id)), 3800);
  },
  success(msg) { this._push("success", msg); },
  error(msg)   { this._push("error",   msg); },
  info(msg)    { this._push("info",    msg); },
  warning(msg) { this._push("warning", msg); },
  _set: null,
};

export function confirmModal(title, desc, onConfirm, opts = {}) {
  if (!confirmModal._set) return;
  confirmModal._set({ title, desc, onConfirm, danger: opts.danger ?? false, promptLabel: opts.promptLabel ?? null, promptExpected: opts.promptExpected ?? null });
}
confirmModal._set = null;

const TOAST_STYLES = {
  success: { border: "rgba(52,211,153,.4)",  bg: "rgba(52,211,153,.12)",  icon: "✅", color: "#34d399" },
  error:   { border: "rgba(248,113,113,.4)", bg: "rgba(248,113,113,.12)", icon: "❌", color: "#f87171" },
  info:    { border: "rgba(129,140,248,.4)", bg: "rgba(129,140,248,.12)", icon: "ℹ️", color: "#818cf8" },
  warning: { border: "rgba(245,158,11,.4)",  bg: "rgba(245,158,11,.12)",  icon: "⚠️", color: "#f59e0b" },
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  // Register setter once using a ref trick — safe for concurrent mode
  const setRef = useRef(setToasts);
  useEffect(() => {
    toast._set = setRef.current;
    return () => { toast._set = null; };
  }, []);







  return (
    <div style={{ position:"fixed", bottom:80, right:20, zIndex:9999, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => {
        const s = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        return (
          <div key={t.id} style={{
            background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12,
            padding: "11px 16px", display: "flex", alignItems: "center", gap: 10,
            fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#e2e8f0",
            boxShadow: "0 8px 32px rgba(0,0,0,.35)", backdropFilter: "blur(12px)",
            animation: "toastIn .25s cubic-bezier(.16,1,.3,1) both",
            maxWidth: 320, pointerEvents: "auto",
            fontWeight: 500, lineHeight: 1.4,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
            <span style={{ flex: 1 }}>{t.msg}</span>
          </div>
        );
      })}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);}}`}</style>
    </div>
  );
}

// ─── CalMiniCal & CalEventModal — top-level components ───
function CalMiniCal({calSelDay,setCalSelDay,setCalMonth,setCalYear,liveToday,myEv,user,t}) {
  const [mY,setMY] = useState(new Date(calSelDay+"T12:00").getFullYear());
  const [mM,setMM] = useState(new Date(calSelDay+"T12:00").getMonth());
  const fd = new Date(mY,mM,1).getDay();
  const dim = new Date(mY,mM+1,0).getDate();
  const mCells = Array.from({length:fd},()=>null).concat(Array.from({length:dim},(_,i)=>i+1));
  while(mCells.length%7!==0) mCells.push(null);
  return (
    <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:14,padding:"12px 14px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
        <button onClick={()=>{let m=mM-1,y=mY;if(m<0){m=11;y--;}setMM(m);setMY(y);}} style={{ background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:14,padding:"0 4px" }}>‹</button>
        <span style={{ fontSize:11,fontWeight:700,color:t.text }}>{["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][mM]} {mY}</span>
        <button onClick={()=>{let m=mM+1,y=mY;if(m>11){m=0;y++;}setMM(m);setMY(y);}} style={{ background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:14,padding:"0 4px" }}>›</button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1 }}>
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(w=><div key={w} style={{ textAlign:"center",fontSize:8,color:t.textFaint,fontWeight:700,padding:"2px 0" }}>{w.slice(0,1)}</div>)}
        {mCells.map((d,i)=>{
          const ds=d?`${mY}-${String(mM+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`:null;
          const isToday=ds===liveToday, isSel=ds===calSelDay, hasEv=d&&myEv.filter(e=>e.date===ds).length>0;
          return (
            <div key={i} onClick={()=>ds&&(setCalSelDay(ds),setCalMonth(mM),setCalYear(mY))}
              style={{ textAlign:"center",padding:"3px 1px",borderRadius:5,cursor:d?"pointer":"default",background:isSel?user.accent:isToday?user.accent+"25":"transparent",position:"relative" }}>
              <span style={{ fontSize:9.5,fontWeight:isSel||isToday?700:400,color:isSel?"#07070f":isToday?user.accent:d?t.text:t.borderSub }}>{d||""}</span>
              {hasEv&&!isSel&&<div style={{ width:3,height:3,borderRadius:"50%",background:user.accent,position:"absolute",bottom:1,left:"50%",transform:"translateX(-50%)" }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY_EV = {title:"",date:"",time:"",time_end:"",type:"clase",visibility:"private",description:"",recurrence:"none",recurrence_end:"",recurrence_days:"",recurrence_count:null,recurrence_interval:1,reminder_min:null};

// ─── Custom Date Picker ───────────────────────────────────────────────────────
function DatePicker({ value, onChange, t, user, label="FECHA" }) {
  const [open, setOpen] = useState(false);
  const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const DAYS   = ["D","L","M","X","J","V","S"];
  const today  = new Date();
  const parsed = value ? new Date(value+"T12:00") : today;
  const [vY, setVY] = useState(parsed.getFullYear());
  const [vM, setVM] = useState(parsed.getMonth());

  const firstDow = new Date(vY, vM, 1).getDay();
  const daysInM  = new Date(vY, vM+1, 0).getDate();
  const cells    = Array.from({length:firstDow},()=>null).concat(Array.from({length:daysInM},(_,i)=>i+1));
  while(cells.length%7!==0) cells.push(null);

  const fmt = (ds) => ds ? new Date(ds+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"}) : "Seleccionar…";

  const select = (d) => {
    const ds = `${vY}-${String(vM+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    onChange(ds);
    setOpen(false);
  };

  return (
    <div style={{ position:"relative" }}>
      <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:4 }}>{label}</div>
      <button type="button" onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%",padding:"8px 12px",background:t.input,border:`1px solid ${open?user.accent:t.inputBdr}`,borderRadius:9,color:value?t.text:t.textFaint,fontSize:12,textAlign:"left",cursor:"pointer",transition:"border-color .15s",display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:13,opacity:.5 }}>📅</span>{fmt(value)}
      </button>
      {open&&(
        <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:3000,background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:16,padding:"14px 16px",boxShadow:"0 16px 48px rgba(0,0,0,.4)",minWidth:260 }}>
          {/* Month nav */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
            <button onClick={()=>{let m=vM-1,y=vY;if(m<0){m=11;y--;}setVY(y);setVM(m);}} style={{ background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16,padding:"2px 8px" }}>‹</button>
            <span style={{ fontSize:13,fontWeight:700,color:t.text }}>{MONTHS[vM]} {vY}</span>
            <button onClick={()=>{let m=vM+1,y=vY;if(m>11){m=0;y++;}setVY(y);setVM(m);}} style={{ background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16,padding:"2px 8px" }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4 }}>
            {DAYS.map(d=><div key={d} style={{ textAlign:"center",fontSize:9,fontWeight:700,color:t.textFaint,padding:"2px 0" }}>{d}</div>)}
          </div>
          {/* Cells */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
            {cells.map((d,i)=>{
              const ds = d ? `${vY}-${String(vM+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : null;
              const isSel = ds===value;
              const isToday = ds===today.toISOString().slice(0,10);
              return (
                <button key={i} type="button"
                  onClick={()=>d&&select(d)}
                  style={{ width:"100%",aspectRatio:"1",borderRadius:8,border:"none",background:isSel?user.accent:isToday?user.accent+"22":"transparent",color:isSel?"#07070f":isToday?user.accent:d?t.text:t.textGhost,fontSize:12,fontWeight:isSel||isToday?700:400,cursor:d?"pointer":"default",transition:"background .1s" }}>
                  {d||""}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Custom Time Picker ───────────────────────────────────────────────────────
function TimePicker({ value, onChange, t, user, label="HORA" }) {
  const [open, setOpen] = useState(false);
  const [selH, setSelH] = useState(value ? Number(value.split(":")[0]) : 8);
  const [selM, setSelM] = useState(value ? Number(value.split(":")[1]) : 0);

  const fmt12 = (h,m) => {
    const period = h>=12?"pm":"am";
    const h12 = h%12||12;
    return `${h12}:${String(m).padStart(2,"0")} ${period}`;
  };
  const apply = (h,m) => {
    onChange(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  };
  const HOURS   = Array.from({length:24},(_,i)=>i);
  const MINUTES = [0,5,10,15,20,25,30,35,40,45,50,55];

  return (
    <div style={{ position:"relative" }}>
      <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:4 }}>{label}</div>
      <button type="button" onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%",padding:"8px 12px",background:t.input,border:`1px solid ${open?user.accent:t.inputBdr}`,borderRadius:9,color:value?t.text:t.textFaint,fontSize:12,textAlign:"left",cursor:"pointer",transition:"border-color .15s",display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:13,opacity:.5 }}>🕐</span>{value ? fmt12(Number(value.split(":")[0]),Number(value.split(":")[1])) : "Sin hora"}
      </button>
      {open&&(
        <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:3000,background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:16,padding:"14px",boxShadow:"0 16px 48px rgba(0,0,0,.4)",width:200 }}>
          <div style={{ display:"flex",gap:8 }}>
            {/* Hours */}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9,fontWeight:700,color:t.textFaint,marginBottom:6,textAlign:"center" }}>HORA</div>
              <div style={{ maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:2 }}>
                {HOURS.map(h=>(
                  <button key={h} type="button"
                    onClick={()=>{setSelH(h);apply(h,selM);}}
                    style={{ padding:"4px 0",borderRadius:7,border:"none",background:selH===h?user.accent:t.input,color:selH===h?"#07070f":t.text,fontSize:12,fontWeight:selH===h?700:400,cursor:"pointer",transition:"background .1s" }}>
                    {String(h).padStart(2,"0")}
                  </button>
                ))}
              </div>
            </div>
            {/* Minutes */}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9,fontWeight:700,color:t.textFaint,marginBottom:6,textAlign:"center" }}>MIN</div>
              <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
                {MINUTES.map(m=>(
                  <button key={m} type="button"
                    onClick={()=>{setSelM(m);apply(selH,m);}}
                    style={{ padding:"4px 0",borderRadius:7,border:"none",background:selM===m?user.accent:t.input,color:selM===m?"#07070f":t.text,fontSize:12,fontWeight:selM===m?700:400,cursor:"pointer",transition:"background .1s" }}>
                    {String(m).padStart(2,"0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={()=>setOpen(false)}
            style={{ width:"100%",marginTop:10,padding:"6px",borderRadius:9,background:user.accent,border:"none",color:"#07070f",fontSize:12,fontWeight:700,cursor:"pointer" }}>
            Listo
          </button>
        </div>
      )}
    </div>
  );
}

function CalEventModal({eventModal,setEventModal,saveEventModal,deleteEvent,deleteEventOccurrence,deleteEventFromDate,cats,t,user,saving,coupleEnabled,partner,inputStyle,people=[]}) {
  const [ev, setEv] = useState(EMPTY_EV);
  const [deleteMode, setDeleteMode] = useState(null);
  const [saveMode,   setSaveMode]   = useState(null); // null | "this" | "following" | "all"

  useEffect(() => {
    if (eventModal?.ev) {
      setEv({...EMPTY_EV, ...eventModal.ev});
    } else if (eventModal) {
      setEv(EMPTY_EV);
    }
    setDeleteMode(null);
    setSaveMode(null);
  }, [eventModal]);

  if (!eventModal) return null;

  const isNew = eventModal.mode === "new";
  const isRecurring = ev.recurrence && ev.recurrence !== "none";

  // Add time to HH:MM, returns new HH:MM string
  const addMinutes = (hhmm, mins) => {
    const [h,m] = hhmm.split(":").map(Number);
    const total = h*60 + m + mins;
    const nh = Math.floor(total/60) % 24;
    const nm = total % 60;
    return `${String(nh).padStart(2,"0")}:${String(nm).padStart(2,"0")}`;
  };

  const durationMin = (start, end) => {
    if(!start||!end) return null;
    const [sh,sm]=start.split(":").map(Number), [eh,em]=end.split(":").map(Number);
    const diff = (eh*60+em) - (sh*60+sm);
    return diff > 0 ? diff : null;
  };

  // When start time changes: shift end time to preserve duration (or default 1h if no end)
  const onTimeChange = (newTime) => {
    if (!newTime) { setEv(p=>({...p,time:newTime})); return; }
    setEv(p => {
      if (p.time_end && p.time) {
        // Preserve duration
        const dur = durationMin(p.time, p.time_end);
        const newEnd = dur ? addMinutes(newTime, dur) : addMinutes(newTime, 60);
        return {...p, time: newTime, time_end: newEnd};
      } else {
        // Default 1h duration
        return {...p, time: newTime, time_end: addMinutes(newTime, 60)};
      }
    });
  };


  const RECURRENCE_OPTS = [["none","Sin repetición"],["daily","Todos los días"],["weekly","Cada semana"],["monthly","Todos los meses"],["weekdays","Días hábiles (lun–vie)"],["custom","Personalizado..."]];
  const REMINDER_OPTS   = [[null,"Sin recordatorio"],[10,"10 min antes"],[30,"30 min antes"],[60,"1 hora antes"],[1440,"1 día antes"]];

  const getRecurrenceLabel = () => {
    const r = ev.recurrence;
    if (!r || r === "none") return "Sin repetición";
    if (r === "daily") return "Todos los días";
    if (r === "weekdays") return "Días hábiles (lun–vie)";
    if (r === "weekly") {
      const dayNames = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
      const days = ev.recurrence_days ? ev.recurrence_days.split(",").filter(Boolean).map(d=>dayNames[Number(d)]).join(", ") : "";
      const end = ev.recurrence_end ? ` hasta el ${new Date(ev.recurrence_end+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"})}` : "";
      return days ? `Cada semana: ${days}${end}` : `Cada semana${end}`;
    }
    if (r === "monthly") {
      const end = ev.recurrence_end ? ` hasta ${new Date(ev.recurrence_end+"T12:00").toLocaleDateString("es-PE",{month:"short",year:"numeric"})}` : "";
      return `Todos los meses${end}`;
    }
    if (r === "custom") {
      const unit = ev._customUnit || "week";
      const n = ev.recurrence_interval || 1;
      const dayNames = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
      const days = ev.recurrence_days ? ev.recurrence_days.split(",").filter(Boolean).map(d=>dayNames[Number(d)]).join(", ") : "";
      const unitLabel = unit==="day"?`día${n>1?"s":""}`:unit==="week"?`semana${n>1?"s":""}`:(`mes${n>1?"es":""}`);
      const end = ev.recurrence_end ? ` · hasta ${new Date(ev.recurrence_end+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"})}` : ev.recurrence_count ? ` · ${ev.recurrence_count} veces` : "";
      return `Cada ${n} ${unitLabel}${days ? ": "+days : ""}${end}`;
    }
    return r;
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={()=>{setEventModal(null);setDeleteMode(null);}}>

      {/* ── Guardar evento recurrente sub-modal ── */}
      {saveMode!==null&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:2100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={e=>e.stopPropagation()}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:20,width:"min(400px,94vw)",padding:"32px 32px 24px",boxShadow:"0 32px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize:19,fontWeight:800,color:t.text,marginBottom:24 }}>Editar el evento recurrente</div>
            {[
              ["this",     "Este evento"],
              ["following","Este y los eventos siguientes"],
              ["all",      "Todos los eventos"],
            ].map(([val,label])=>(
              <div key={val} onClick={()=>setSaveMode(val)}
                style={{ display:"flex",alignItems:"center",gap:14,padding:"10px 4px",cursor:"pointer" }}>
                <div style={{ width:20,height:20,borderRadius:"50%",border:`2px solid ${saveMode===val?user.accent:t.inputBdr}`,background:saveMode===val?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s" }}>
                  {saveMode===val&&<div style={{ width:7,height:7,borderRadius:"50%",background:"#07070f" }}/>}
                </div>
                <span style={{ fontSize:14,color:t.text }}>{label}</span>
              </div>
            ))}
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:24 }}>
              <button onClick={()=>setSaveMode(null)}
                style={{ background:"none",border:"none",color:user.accent,fontSize:13,fontWeight:700,cursor:"pointer",padding:"8px 16px",borderRadius:99 }}>
                Cancelar
              </button>
              <button onClick={async()=>{
                await saveEventModal({...ev,_clickedDate:eventModal._clickedDate||ev.date}, saveMode);
                setSaveMode(null);
              }}
                style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:99,padding:"10px 28px",fontSize:13,fontWeight:800,cursor:"pointer" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Borrar evento recurrente sub-modal ── */}
      {deleteMode!==null&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:2100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={e=>e.stopPropagation()}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:20,width:"min(400px,94vw)",padding:"32px 32px 24px",boxShadow:"0 32px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize:19,fontWeight:800,color:t.text,marginBottom:24 }}>Borrar el evento recurrente</div>

            {[
              ["this",     "Este evento"],
              ["following","Este y los eventos siguientes"],
              ["all",      "Todos los eventos"],
            ].map(([val,label])=>(
              <div key={val} onClick={()=>setDeleteMode(val)}
                style={{ display:"flex",alignItems:"center",gap:14,padding:"10px 4px",cursor:"pointer" }}>
                <div style={{ width:20,height:20,borderRadius:"50%",border:`2px solid ${deleteMode===val?user.accent:t.inputBdr}`,background:deleteMode===val?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s" }}>
                  {deleteMode===val&&<div style={{ width:7,height:7,borderRadius:"50%",background:"#07070f" }}/>}
                </div>
                <span style={{ fontSize:14,color:t.text }}>{label}</span>
              </div>
            ))}

            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:24 }}>
              <button onClick={()=>setDeleteMode(null)}
                style={{ background:"none",border:"none",color:user.accent,fontSize:13,fontWeight:700,cursor:"pointer",padding:"8px 16px",borderRadius:99 }}>
                Cancelar
              </button>
              <button onClick={async()=>{
                if(deleteMode==="this") {
                  await deleteEventOccurrence(ev.id, eventModal._clickedDate||ev.date);
                } else if(deleteMode==="following") {
                  await deleteEventFromDate(ev.id, eventModal._clickedDate||ev.date);
                } else {
                  await deleteEvent(ev.id);
                }
                setDeleteMode(null);
                setEventModal(null);
              }}
                style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:99,padding:"10px 28px",fontSize:13,fontWeight:800,cursor:"pointer" }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recurrencia personalizada sub-modal ── */}
      {ev._customOpen&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={e=>e.stopPropagation()}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:20,width:"min(400px,94vw)",padding:"28px 28px 24px",boxShadow:"0 32px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize:17,fontWeight:800,color:t.text,marginBottom:22 }}>Recurrencia personalizada</div>

            {/* Repetir cada N unidad */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:8 }}>REPETIR CADA</div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <input type="number" min="1" max="30"
                  value={ev.recurrence_interval||1}
                  onChange={e=>setEv(p=>({...p,recurrence_interval:Math.max(1,Number(e.target.value))}))}
                  style={{ ...inputStyle,width:72,textAlign:"center",fontSize:15,fontWeight:700 }}/>
                <select value={ev._customUnit||"week"} onChange={e=>setEv(p=>({...p,_customUnit:e.target.value}))} style={{ ...inputStyle,flex:1 }}>
                  <option value="day">día(s)</option>
                  <option value="week">semana(s)</option>
                  <option value="month">mes(es)</option>
                </select>
              </div>
            </div>

            {/* Días de la semana (solo si unit=week) */}
            {(ev._customUnit||"week")==="week"&&(
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:10 }}>REPETIR EL</div>
                <div style={{ display:"flex",gap:6 }}>
                  {["D","L","M","X","J","V","S"].map((d,i)=>{
                    const selDays = (ev.recurrence_days||"").split(",").filter(Boolean).map(Number);
                    const sel = selDays.includes(i);
                    return (
                      <button key={i} onClick={()=>{
                        const next = sel ? selDays.filter(x=>x!==i) : [...selDays,i].sort((a,b)=>a-b);
                        setEv(p=>({...p,recurrence_days:next.join(",")}));
                      }}
                        style={{ width:36,height:36,borderRadius:"50%",border:`1.5px solid ${sel?user.accent:t.inputBdr}`,background:sel?user.accent:"transparent",color:sel?"#07070f":t.textMuted,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",flexShrink:0 }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finaliza */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:12 }}>FINALIZA</div>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {/* Nunca */}
                <div onClick={()=>setEv(p=>({...p,_endMode:"never",recurrence_end:"",recurrence_count:null}))}
                  style={{ display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
                  <div style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${(!ev._endMode||ev._endMode==="never")?user.accent:t.inputBdr}`,background:(!ev._endMode||ev._endMode==="never")?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    {(!ev._endMode||ev._endMode==="never")&&<div style={{ width:6,height:6,borderRadius:"50%",background:"#07070f" }}/>}
                  </div>
                  <span style={{ fontSize:13,color:t.text }}>Nunca</span>
                </div>
                {/* El [fecha] */}
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div onClick={()=>setEv(p=>({...p,_endMode:"date",recurrence_count:null}))}
                    style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${ev._endMode==="date"?user.accent:t.inputBdr}`,background:ev._endMode==="date"?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer" }}>
                    {ev._endMode==="date"&&<div style={{ width:6,height:6,borderRadius:"50%",background:"#07070f" }}/>}
                  </div>
                  <span style={{ fontSize:13,color:t.text,minWidth:20 }}>El</span>
                  <input type="date" value={ev.recurrence_end||""}
                    onChange={e=>setEv(p=>({...p,_endMode:"date",recurrence_end:e.target.value,recurrence_count:null}))}
                    style={{ ...inputStyle,flex:1 }}/>
                </div>
                {/* Después de N ocurrencias */}
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div onClick={()=>setEv(p=>({...p,_endMode:"count",recurrence_end:""}))}
                    style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${ev._endMode==="count"?user.accent:t.inputBdr}`,background:ev._endMode==="count"?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer" }}>
                    {ev._endMode==="count"&&<div style={{ width:6,height:6,borderRadius:"50%",background:"#07070f" }}/>}
                  </div>
                  <span style={{ fontSize:13,color:t.text,whiteSpace:"nowrap" }}>Después de</span>
                  <input type="number" min="1" max="999" value={ev.recurrence_count||""}
                    onChange={e=>setEv(p=>({...p,_endMode:"count",recurrence_count:Number(e.target.value)||null,recurrence_end:""}))}
                    style={{ ...inputStyle,width:72,textAlign:"center" }}/>
                  <span style={{ fontSize:13,color:t.textMuted,whiteSpace:"nowrap" }}>ocurrencias</span>
                </div>
              </div>
            </div>

            {/* Footer del sub-modal */}
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <button onClick={()=>setEv(p=>({...p,_customOpen:false,recurrence:p.recurrence==="custom"?p.recurrence:"none"}))}
                style={{ background:"none",border:"none",color:user.accent,fontSize:13,fontWeight:700,cursor:"pointer",padding:"8px 16px",borderRadius:99 }}>
                Cancelar
              </button>
              <button onClick={()=>setEv(p=>({...p,_customOpen:false,recurrence:"custom"}))}
                style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:99,padding:"10px 28px",fontSize:13,fontWeight:800,cursor:"pointer" }}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:20,width:"min(520px,96vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.4)" }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"20px 24px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:(cats&&cats[ev.type]&&cats[ev.type].dot)||"#94a3b8" }}/>
            <span style={{ fontSize:14,fontWeight:800,color:t.text }}>{isNew?"Nuevo evento":"Editar evento"}</span>
          </div>
          <button onClick={()=>setEventModal(null)} style={{ background:"none",border:"none",color:t.textFaint,cursor:"pointer",fontSize:20,lineHeight:1 }}>×</button>
        </div>

        {/* Fields */}
        <div style={{ padding:"18px 24px",display:"flex",flexDirection:"column",gap:14 }}>
          <input autoFocus value={ev.title||""} onChange={e=>setEv(p=>({...p,title:e.target.value}))}
            placeholder="Título del evento" style={{ ...inputStyle,fontSize:15,fontWeight:600,padding:"10px 14px" }}/>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
            <DatePicker value={ev.date||""} onChange={d=>setEv(p=>({...p,date:d}))} t={t} user={user} label="FECHA"/>
            <TimePicker value={ev.time||""} onChange={v=>onTimeChange(v)} t={t} user={user} label="INICIO"/>
            <div>
              <TimePicker value={ev.time_end||""} onChange={v=>setEv(p=>({...p,time_end:v}))} t={t} user={user} label="FIN"/>
              {durationMin(ev.time,ev.time_end)&&<div style={{ fontSize:9,color:t.textFaint,marginTop:2 }}>{durationMin(ev.time,ev.time_end)} min</div>}
            </div>
          </div>

          <div>
            <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:6 }}>CATEGORÍA</div>
            <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
              {cats&&Object.entries(cats).map(([k,c])=>(
                <button key={k} onClick={()=>setEv(p=>({...p,type:k}))}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 13px",borderRadius:99,background:ev.type===k?(c.dot||"#94a3b8")+"25":t.input,border:`1.5px solid ${ev.type===k?(c.dot||"#94a3b8")+"80":t.inputBdr}`,color:ev.type===k?(c.dot||"#94a3b8"):t.textMuted,fontSize:11,fontWeight:ev.type===k?700:400,cursor:"pointer" }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:c.dot||"#94a3b8" }}/>{c.label||k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:4 }}>DESCRIPCIÓN / NOTAS</div>
            <textarea value={ev.description||""} onChange={e=>setEv(p=>({...p,description:e.target.value}))}
              placeholder="Notas, ubicación, detalles…" rows={3}
              style={{ ...inputStyle,width:"100%",resize:"vertical",fontFamily:"inherit",lineHeight:1.5 }}/>
          </div>

          {/* Recurrencia */}
          <div>
            <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:6 }}>REPETICIÓN</div>
            <select
              value={ev.recurrence==="custom"?"custom":(ev.recurrence||"none")}
              onChange={e=>{
                const val=e.target.value;
                if(val==="custom"){
                  setEv(p=>({...p,recurrence:"custom",_customOpen:true,_customUnit:p._customUnit||"week",recurrence_interval:p.recurrence_interval||1}));
                } else {
                  setEv(p=>({...p,recurrence:val,recurrence_days:"",recurrence_count:null,_customOpen:false}));
                }
              }}
              style={{ ...inputStyle,width:"100%" }}>
              {RECURRENCE_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
            {ev.recurrence!=="none"&&ev.recurrence!=="custom"&&(
              <div style={{ marginTop:8,display:"flex",flexDirection:"column",gap:6 }}>
                <div style={{ fontSize:10,color:t.textFaint,fontWeight:600 }}>FINALIZA</div>
                <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                  <button onClick={()=>setEv(p=>({...p,_endMode:"never",recurrence_end:"",recurrence_count:null}))}
                    style={{ padding:"5px 12px",borderRadius:99,border:`1px solid ${(!ev._endMode||ev._endMode==="never")?user.accent:t.inputBdr}`,background:(!ev._endMode||ev._endMode==="never")?user.accent+"18":"transparent",color:(!ev._endMode||ev._endMode==="never")?user.accent:t.textMuted,fontSize:11,fontWeight:600,cursor:"pointer" }}>Nunca</button>
                  <button onClick={()=>setEv(p=>({...p,_endMode:"date"}))}
                    style={{ padding:"5px 12px",borderRadius:99,border:`1px solid ${ev._endMode==="date"?user.accent:t.inputBdr}`,background:ev._endMode==="date"?user.accent+"18":"transparent",color:ev._endMode==="date"?user.accent:t.textMuted,fontSize:11,fontWeight:600,cursor:"pointer" }}>El día</button>
                  <button onClick={()=>setEv(p=>({...p,_endMode:"count"}))}
                    style={{ padding:"5px 12px",borderRadius:99,border:`1px solid ${ev._endMode==="count"?user.accent:t.inputBdr}`,background:ev._endMode==="count"?user.accent+"18":"transparent",color:ev._endMode==="count"?user.accent:t.textMuted,fontSize:11,fontWeight:600,cursor:"pointer" }}>N veces</button>
                </div>
                {ev._endMode==="date"&&<input type="date" value={ev.recurrence_end||""} onChange={e=>setEv(p=>({...p,recurrence_end:e.target.value}))} style={{ ...inputStyle }}/>}
                {ev._endMode==="count"&&<div style={{ display:"flex",alignItems:"center",gap:8 }}><input type="number" min="1" value={ev.recurrence_count||""} onChange={e=>setEv(p=>({...p,recurrence_count:Number(e.target.value)||null}))} style={{ ...inputStyle,width:80 }}/><span style={{ fontSize:12,color:t.textMuted }}>ocurrencias</span></div>}
              </div>
            )}
            {ev.recurrence==="custom"&&(
              <div style={{ marginTop:6,display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:11,color:user.accent }}>🔁 {getRecurrenceLabel()}</span>
                <button onClick={()=>setEv(p=>({...p,_customOpen:true}))} style={{ background:"none",border:"none",color:user.accent,fontSize:11,cursor:"pointer",textDecoration:"underline",padding:0 }}>Editar</button>
              </div>
            )}
          </div>

          {/* Recordatorio */}
          <div>
            <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:4 }}>RECORDATORIO</div>
            <select value={ev.reminder_min??""} onChange={e=>setEv(p=>({...p,reminder_min:e.target.value===""?null:Number(e.target.value)}))} style={{ ...inputStyle,width:"100%" }}>
              {REMINDER_OPTS.map(([v,l])=><option key={String(v)} value={v??""}>{l}</option>)}
            </select>
          </div>

          {/* Visibilidad */}
          <div>
            <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.5,marginBottom:6 }}>VISIBILIDAD</div>
            <VisibilityPicker value={ev.visibility||"private"} onChange={(v,sw)=>setEv(p=>({...p,visibility:v,shared:v!=="private",sharedWith:sw||[]}))} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={people} sharedWith={ev.sharedWith||[]}/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px 20px",borderTop:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            {!isNew&&ev.id&&<button
              onClick={()=>{
                if(ev.recurrence&&ev.recurrence!=="none") {
                  setDeleteMode("this"); // default selection
                } else {
                  deleteEvent(ev.id).then(()=>setEventModal(null));
                }
              }}
              style={{ background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",color:"#f87171",padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
              <Trash2 size={12}/> Eliminar
            </button>}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            {/* Duplicar — solo visible al editar un evento existente */}
            {!isNew&&ev.id&&(
              <button
                title="Duplicar evento"
                onClick={()=>{
                  // Open modal as new event with same data, stripping id and recurrence
                  setEventModal({
                    mode:"new",
                    ev:{...ev, id:undefined, recurrence:"none", recurrence_end:"", recurrence_days:"", recurrence_count:null, recurrence_interval:1, _customOpen:false, _clickedDate:undefined}
                  });
                }}
                style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,padding:"9px 14px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"border-color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=user.accent+"60"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=t.inputBdr}>
                <Copy size={12}/> Duplicar
              </button>
            )}
            <button onClick={()=>setEventModal(null)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 18px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancelar</button>
            <button onClick={()=>{
                if(!ev.title?.trim()||!ev.date) return;
                if(ev.id && isRecurring) {
                  setSaveMode("all"); // default selection
                } else {
                  saveEventModal(ev, "all");
                }
              }} disabled={saving||!ev.title?.trim()||!ev.date}
              style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 22px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",opacity:(saving||!ev.title?.trim()||!ev.date)?0.6:1,display:"flex",alignItems:"center",gap:6 }}>
              {saving?<><Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/> Guardando…</>:"Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



function ConfirmModalContainer() {
  const [modal, setModal] = useState(null);
  const [promptVal, setPromptVal] = useState("");
  const setRef = useRef(setModal);
  useEffect(() => {
    confirmModal._set = (m) => { setRef.current(m); setPromptVal(""); };
    return () => { confirmModal._set = null; };
  }, []);
  if (!modal) return null;
  const canConfirm = modal.promptExpected ? promptVal === modal.promptExpected : true;
  // Sanitize desc: allow only basic safe tags, no scripts
  const safeDesc = (modal.desc || "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "");
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
      onClick={() => setModal(null)}>
      <div style={{ background:"#0d0d1a",border:`1px solid ${modal.danger?"rgba(248,113,113,.35)":"rgba(255,255,255,.08)"}`,borderRadius:20,padding:"28px 28px 24px",width:"100%",maxWidth:380,boxShadow:"0 28px 70px rgba(0,0,0,.5)",fontFamily:"'Outfit',sans-serif" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:16,fontWeight:800,color:"#e2e8f0",marginBottom:10 }}>{modal.title}</div>
        {modal.desc && <div style={{ fontSize:13,color:"#94a3b8",lineHeight:1.6,marginBottom:modal.promptLabel?16:24 }} dangerouslySetInnerHTML={{ __html: safeDesc }}/>}
        {modal.promptLabel && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11,color:"#64748b",marginBottom:6,fontWeight:600 }}>{modal.promptLabel}</div>
            <input autoFocus value={promptVal} onChange={e=>setPromptVal(e.target.value)}
              style={{ width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }}/>
          </div>
        )}
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={() => setModal(null)}
            style={{ background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94a3b8",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={() => { if (!canConfirm) return; modal.onConfirm(); setModal(null); }} disabled={!canConfirm}
            style={{ background:modal.danger?"rgba(248,113,113,.15)":"rgba(52,211,153,.15)",border:`1px solid ${modal.danger?"rgba(248,113,113,.4)":"rgba(52,211,153,.4)"}`,color:modal.danger?"#f87171":"#34d399",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:canConfirm?"pointer":"not-allowed",fontFamily:"inherit",opacity:canConfirm?1:.5,transition:"opacity .2s" }}>
            {modal.danger?"Sí, eliminar":"Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── THEME ───────────────────────────────────────────────────────────────────
const DARK = {
  bg:         "#07070f",
  bgCard:     "rgba(255,255,255,.024)",
  bgCardHov:  "rgba(255,255,255,.05)",
  border:     "rgba(255,255,255,.055)",
  borderSub:  "rgba(255,255,255,.04)",
  sidebar:    "rgba(255,255,255,.018)",
  sidebarBdr: "rgba(255,255,255,.055)",
  text:       "#e2e8f0",
  textSub:    "#94a3b8",
  textMuted:  "#475569",
  textFaint:  "#334155",
  textGhost:  "#1e2d3d",
  input:      "rgba(255,255,255,.05)",
  inputBdr:   "rgba(255,255,255,.08)",
  modalBg:    "#0d0d1a",
  scrollThumb:"#1a1a2e",
  navHov:     "rgba(255,255,255,.05)",
};
const LIGHT = {
  bg:         "#f1f5f9",
  bgCard:     "#ffffff",
  bgCardHov:  "#f8fafc",
  border:     "rgba(0,0,0,.08)",
  borderSub:  "rgba(0,0,0,.05)",
  sidebar:    "#ffffff",
  sidebarBdr: "rgba(0,0,0,.08)",
  text:       "#0f172a",
  textSub:    "#475569",
  textMuted:  "#64748b",
  textFaint:  "#94a3b8",
  textGhost:  "#cbd5e1",
  input:      "#f8fafc",
  inputBdr:   "rgba(0,0,0,.1)",
  modalBg:    "#ffffff",
  scrollThumb:"#cbd5e1",
  navHov:     "rgba(0,0,0,.04)",
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ACCENT_PALETTE = ["#34d399","#818cf8","#f59e0b","#f87171","#3b82f6","#a855f7","#fb923c","#ec4899"];

// planner blocks now come from supabase
const DAYS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const HOURS = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];

// BLOCK_C removed — now using dynamic plannerCats
const EVT_C = {
  clase:    { dot:"#3b82f6", bg:"rgba(59,130,246,.08)",  label:"Clase"    },
  reunion:  { dot:"#a855f7", bg:"rgba(168,85,247,.08)",  label:"Reunión"  },
  entrega:  { dot:"#ef4444", bg:"rgba(239,68,68,.08)",   label:"Entrega"  },
  personal: { dot:"#34d399", bg:"rgba(52,211,153,.08)",  label:"Personal" },
  examen:   { dot:"#f59e0b", bg:"rgba(245,158,11,.08)",  label:"Examen"   },
};
const TASK_CATS = {
  universidad: { color:"#3b82f6", label:"Universidad", Ic:"GraduationCap" },
  trabajo:     { color:"#a855f7", label:"Trabajo",     Ic:"Briefcase"     },
  personal:    { color:"#34d399", label:"Personal",    Ic:"Heart"         },
  salud:       { color:"#f87171", label:"Salud",       Ic:"Heart"         },
  reup:        { color:"#f59e0b", label:"REUP",        Ic:"Zap"           },
};
const PRIO_C = { alta:"#f87171", media:"#fb923c", baja:"#4ade80" };
const CYCLE  = { pendiente:"en progreso","en progreso":"completada", completada:"pendiente" };
const NOTE_C = {
  idea:    { color:"#f59e0b", Ic:Zap,      label:"Idea"     },
  journal: { color:"#818cf8", Ic:BookOpen, label:"Journal"  },
  objetivo:{ color:"#34d399", Ic:Star,     label:"Objetivo" },
};
const FIN_CATS = {
  trabajo:   { color:"#34d399", label:"Trabajo"    },
  vivienda:  { color:"#3b82f6", label:"Vivienda"   },
  comida:    { color:"#f59e0b", label:"Comida"      },
  ocio:      { color:"#a855f7", label:"Ocio"        },
  transporte:{ color:"#fb923c", label:"Transporte"  },
  otro:      { color:"#64748b", label:"Otro"        },
};
const NAV = [
  { id:"dashboard", Ic:LayoutDashboard, label:"Dashboard"  },
  { id:"habitos",   Ic:Flame,           label:"Hábitos"    },
  { id:"tasks",     Ic:CheckSquare,     label:"Tasks"      },
  { id:"planner",   Ic:Clock,           label:"Planner"    },
  { id:"calendar",  Ic:CalendarDays,    label:"Calendario" },
  { id:"notas",     Ic:BookOpen,        label:"Notas"      },
  { id:"academico", Ic:GraduationCap,   label:"Académico"  },
  { id:"finanzas",  Ic:Wallet,          label:"Finanzas"   },
  { id:"metas",     Ic:Zap,             label:"Metas"      },
  { id:"focus",     Ic:Target,          label:"Focus"      },
  { id:"social",    Ic:Users,           label:"Social"     },
  { id:"pareja",    Ic:Heart,           label:"Nosotros"   },
  { id:"settings",  Ic:Settings,        label:"Settings"   },
];

const XP_PER_TASK   = 20;
const XP_PER_HABIT  = 10;
const XP_PER_LEVEL  = 200;
const BADGES_DEF = [
  { id:"first_task",   icon:"✅", name:"Primera tarea",     desc:"Completaste tu primera tarea",        xp:0  },
  { id:"streak_3",     icon:"🔥", name:"3 días seguidos",   desc:"Hábitos 3 días consecutivos",         xp:0  },
  { id:"streak_7",     icon:"💫", name:"Semana perfecta",   desc:"Hábitos 7 días consecutivos",         xp:0  },
  { id:"streak_30",    icon:"🏆", name:"Mes de fuego",      desc:"Hábitos 30 días consecutivos",        xp:0  },
  { id:"tasks_10",     icon:"⚡", name:"Máquina",           desc:"10 tareas completadas",               xp:0  },
  { id:"tasks_50",     icon:"🚀", name:"Imparable",         desc:"50 tareas completadas",               xp:0  },
  { id:"level_5",      icon:"🎯", name:"Nivel 5",           desc:"Alcanzaste el nivel 5",               xp:0  },
  { id:"level_10",     icon:"👑", name:"Nivel 10",          desc:"Alcanzaste el nivel 10",              xp:0  },
];

const fmt   = d => new Date(d+"T12:00").toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"});
const money = n => new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN",maximumFractionDigits:2}).format(n);

// Siempre usa hora de Lima (UTC-5) para calcular "hoy"
const nowLima  = () => new Date(new Date().toLocaleString("en-US", { timeZone:"America/Lima" }));
const getToday = () => nowLima().toISOString().slice(0,10);
// Static snapshot used only for initial renders — always prefer getToday() in effects/actions
const today    = getToday();

// Hook: returns a live "today" string that auto-refreshes at midnight
function useToday() {
  const [todayStr, setTodayStr] = useState(getToday);
  useEffect(() => {
    const tick = () => {
      const next = getToday();
      setTodayStr(prev => prev !== next ? next : prev);
    };
    // Check every minute; if day changed, update
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, []);
  return todayStr;
}

const initials = name => name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

// ─── PARTICLES ───────────────────────────────────────────────────────────────
function Particles({ accent, dark }) {
  const ref = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    if (!dark) { cancelAnimationFrame(animRef.current); return; }
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth, H = canvas.height = canvas.offsetHeight;
    const hex2rgb = h => `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;
    const rgb = hex2rgb(accent);
    const dots = Array.from({length:38},()=>({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+0.4, vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, o:Math.random()*.35+.08 }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      dots.forEach(d=>{ d.x+=d.vx; d.y+=d.vy; if(d.x<0)d.x=W; if(d.x>W)d.x=0; if(d.y<0)d.y=H; if(d.y>H)d.y=0; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fillStyle=`rgba(${rgb},${d.o})`; ctx.fill(); });
      for(let i=0;i<dots.length;i++) for(let j=i+1;j<dots.length;j++){ const dx=dots[i].x-dots[j].x,dy=dots[i].y-dots[j].y,dist=Math.sqrt(dx*dx+dy*dy); if(dist<90){ ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y); ctx.strokeStyle=`rgba(${rgb},${.07*(1-dist/90)})`; ctx.lineWidth=.5; ctx.stroke(); } }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
    window.addEventListener("resize",onResize);
    return ()=>{ cancelAnimationFrame(animRef.current); window.removeEventListener("resize",onResize); };
  },[accent, dark]);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,display:dark?"block":"none" }}/>;
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
function Badge({ color, children, sm }) {
  return <span style={{ display:"inline-flex",alignItems:"center",background:color+"15",color,border:`1px solid ${color}35`,padding:sm?"1px 6px":"2px 7px",borderRadius:5,fontSize:sm?9:9.5,fontWeight:600,letterSpacing:.3,whiteSpace:"nowrap",lineHeight:1 }}>{children}</span>;
}

// ─── SHARED BADGE ────────────────────────────────────────────────────────────
function SharedByBadge({ author, t }) {
  if (!author) return null;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:author.accent+"18",border:`1px solid ${author.accent}35`,borderRadius:99,padding:"2px 7px 2px 4px",fontSize:9,fontWeight:700,color:author.accent,whiteSpace:"nowrap" }}>
      <span style={{ width:14,height:14,borderRadius:5,background:author.accent+"30",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:7.5,fontWeight:800 }}>{author.initials}</span>
      {author.name}
    </span>
  );
}
// value: "private" | "partner" | "friends"
// sharedWith: array of uid strings (subset of people)
// onChange(value, sharedWith)
function VisibilityPicker({ value = "private", onChange, sharedWith = [], t, coupleEnabled, couplePartnerName, people = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const friends = people.filter(p => p.id !== undefined); // all connectable people

  const OPTS = [
    { v:"private", icon:"🔒", label:"Solo yo",   color:t.textMuted,   bg:t.input,                    border:t.inputBdr },
    { v:"partner", icon:"❤️", label:couplePartnerName?couplePartnerName.split(" ")[0]:"Pareja",
                               color:"#f472b6",  bg:"rgba(244,114,182,.12)", border:"rgba(244,114,182,.4)", hidden:!coupleEnabled },
    { v:"friends", icon:"👥", label:"Personas",  color:"#818cf8",     bg:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.4)" },
  ].filter(o => !o.hidden);

  const current = OPTS.find(o => o.v === value) || OPTS[0];

  // Label for friends: show names if specific people selected
  const friendsLabel = sharedWith.length > 0
    ? sharedWith.map(id => friends.find(f => String(f.id)===String(id))?.name?.split(" ")[0] || "?").join(", ")
    : friends.length > 0 ? "Elegir personas…" : "Personas";

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      {/* Main button row */}
      <div style={{ display:"flex", gap:3 }}>
        {OPTS.map(o => (
          <button key={o.v}
            onClick={() => {
              if (o.v === "friends") {
                onChange("friends", sharedWith);
                setOpen(v => !v);
              } else {
                setOpen(false);
                onChange(o.v, []);
              }
            }}
            style={{ display:"flex",alignItems:"center",gap:5,background:value===o.v?o.bg:t.input,border:`1px solid ${value===o.v?o.border:t.inputBdr}`,borderRadius:8,padding:"6px 11px",color:value===o.v?o.color:t.textMuted,fontSize:11,fontWeight:value===o.v?700:400,cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap" }}>
            <span style={{fontSize:12}}>{o.icon}</span>
            {o.v === "friends" && value === "friends" ? friendsLabel : o.label}
          </button>
        ))}
      </div>

      {/* People dropdown */}
      {open && value === "friends" && (
        <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:500,background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:12,padding:"8px",minWidth:200,boxShadow:"0 8px 32px rgba(0,0,0,.3)",maxHeight:220,overflowY:"auto" }}>
          {friends.length === 0
            ? <div style={{ fontSize:11,color:t.textFaint,padding:"6px 8px" }}>Sin conexiones aún</div>
            : friends.map(p => {
                const sel = sharedWith.map(String).includes(String(p.id));
                return (
                  <div key={p.id}
                    onClick={() => {
                      const next = sel
                        ? sharedWith.filter(id => String(id) !== String(p.id))
                        : [...sharedWith, p.id];
                      onChange("friends", next);
                    }}
                    style={{ display:"flex",alignItems:"center",gap:9,padding:"7px 9px",borderRadius:8,cursor:"pointer",background:sel?"#818cf840":"transparent",transition:"background .12s" }}
                    onMouseEnter={e=>!sel&&(e.currentTarget.style.background=t.input)}
                    onMouseLeave={e=>!sel&&(e.currentTarget.style.background="transparent")}>
                    {p.avatar
                      ? <img src={p.avatar} style={{ width:24,height:24,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
                      : <div style={{ width:24,height:24,borderRadius:"50%",background:(p.accent||"#818cf8")+"22",border:`1px solid ${p.accent||"#818cf8"}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:p.accent||"#818cf8",flexShrink:0 }}>{p.initials||"?"}</div>}
                    <span style={{ fontSize:12,color:t.text,flex:1 }}>{p.name}</span>
                    {sel && <Check size={12} color="#818cf8"/>}
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}

// Legacy alias — used in places where we pass `shared` bool
function SharedToggle({ value, onChange, t, coupleEnabled, couplePartnerName, people }) {
  const vis = value ? "friends" : "private";
  return <VisibilityPicker value={vis} onChange={v => onChange(v !== "private")} t={t} coupleEnabled={coupleEnabled} couplePartnerName={couplePartnerName} people={people||[]}/>;
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function Stat({ Ic, label, value, color, sub, delay=0, prefix="", suffix="", t }) {
  const [hov,setHov]=useState(false);
  const [vis,setVis]=useState(false);
  const [cnt,setCnt]=useState(0);
  useEffect(()=>{ const tm=setTimeout(()=>setVis(true),delay); return()=>clearTimeout(tm); },[delay]);
  useEffect(()=>{ if(!vis||!value)return; let s=0; const step=Math.ceil(value/18); const iv=setInterval(()=>{ s+=step; if(s>=value){setCnt(value);clearInterval(iv);}else setCnt(s); },40); return()=>clearInterval(iv); },[vis,value]);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:t.bgCard,border:`1px solid ${hov?color+"55":t.border}`,borderRadius:16,padding:"18px 20px",transition:"all .25s cubic-bezier(.4,0,.2,1)",transform:vis?(hov?"translateY(-4px) scale(1.01)":"translateY(0)"):"translateY(12px)",opacity:vis?1:0,cursor:"default",position:"relative",overflow:"hidden",boxShadow:hov?"0 8px 30px rgba(0,0,0,.08)":"none" }}>
      {hov&&<div style={{ position:"absolute",inset:0,background:`radial-gradient(circle at 70% 30%,${color}08,transparent 65%)`,pointerEvents:"none",borderRadius:16 }}/>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
        <div style={{ background:color+"18",borderRadius:10,padding:8,transition:"transform .2s",transform:hov?"rotate(-8deg) scale(1.1)":"none" }}><Ic size={15} color={color}/></div>
        <span style={{ fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,color }}>{prefix}{cnt}{suffix}</span>
      </div>
      <div style={{ fontSize:12,color:t.textSub,fontWeight:500 }}>{label}</div>
      {sub&&<div style={{ fontSize:10,color:t.textMuted,marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─── LOADING SCREEN ──────────────────────────────────────────────────────────
function LoadingScreen({ accent }) {
  const a = accent || "#34d399";
  const [progress, setProgress] = useState(0);
  const [phase,    setPhase]    = useState(0); // 0=connecting, 1=loading, 2=almost
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const dotsRef   = useRef([]);

  // Progress bar animation
  useEffect(() => {
    const targets = [0, 35, 70, 92];
    const delays  = [0, 300, 700, 1200];
    delays.forEach((d, i) => {
      setTimeout(() => { setPhase(i); setProgress(targets[i]); }, d);
    });
    // creep up slowly after 92
    const iv = setInterval(() => setProgress(p => p < 96 ? p + 0.4 : p), 80);
    return () => clearInterval(iv);
  }, []);

  // Particles canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const hex2rgb = h => `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;
    const rgb = hex2rgb(a);
    dotsRef.current = Array.from({length: 55}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      o: Math.random() * .4 + .05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dots = dotsRef.current;
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${d.o})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++)
        for (let j = i+1; j < dots.length; j++) {
          const dx = dots[i].x-dots[j].x, dy = dots[i].y-dots[j].y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 110) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${rgb},${.09*(1-dist/110)})`; ctx.lineWidth = .6; ctx.stroke();
          }
        }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [a]);

  const msgs = ["Conectando…", "Cargando datos…", "Sincronizando…", "¡Casi listo!"];

  return (
    <div style={{ position:"fixed",inset:0,background:"#07070f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",overflow:"hidden",zIndex:999 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');
        @keyframes splashPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.06);opacity:.85;}}
        @keyframes splashFadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .splash-logo{animation:splashPulse 2.4s ease-in-out infinite;}
        .splash-in{animation:splashFadeUp .6s cubic-bezier(.16,1,.3,1) both;}
        .splash-in-1{animation:splashFadeUp .6s .15s cubic-bezier(.16,1,.3,1) both;}
        .splash-in-2{animation:splashFadeUp .6s .3s cubic-bezier(.16,1,.3,1) both;}
      `}</style>

      {/* Particles */}
      <canvas ref={canvasRef} style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }}/>

      {/* Glow blobs */}
      <div style={{ position:"absolute",top:"15%",left:"20%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${a}12 0%,transparent 65%)`,pointerEvents:"none",filter:"blur(2px)" }}/>
      <div style={{ position:"absolute",bottom:"10%",right:"15%",width:380,height:380,borderRadius:"50%",background:`radial-gradient(circle,#818cf810 0%,transparent 65%)`,pointerEvents:"none" }}/>

      {/* Content */}
      <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0 }}>

        {/* Logo icon */}
        <div className="splash-logo" style={{ width:72,height:72,borderRadius:22,background:`linear-gradient(135deg,${a}22,${a}08)`,border:`1.5px solid ${a}40`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,boxShadow:`0 0 40px ${a}25,0 0 80px ${a}10` }}>
          <span style={{ fontSize:32 }}>⚡</span>
        </div>

        {/* Brand name */}
        <div className="splash-in" style={{ fontSize:36,fontWeight:900,color:"#fff",letterSpacing:"-1.5px",marginBottom:6 }}>
          2do<span style={{ color:a }}>.</span>cerebro
        </div>

        {/* Tagline */}
        <div className="splash-in-1" style={{ fontSize:13,color:"#475569",fontWeight:500,marginBottom:40,letterSpacing:.2 }}>
          Tu sistema de productividad personal
        </div>

        {/* Progress bar */}
        <div className="splash-in-2" style={{ width:220,display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
          <div style={{ width:"100%",height:3,background:"rgba(255,255,255,.07)",borderRadius:99,overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${a}88,${a})`,borderRadius:99,transition:"width .4s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 10px ${a}60` }}/>
          </div>
          <div style={{ fontSize:11,color:"#334155",fontWeight:500,letterSpacing:.3,minHeight:16,transition:"opacity .3s" }}>
            {msgs[phase]}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE MODAL ───────────────────────────────────────────────────────────
function ProfileModal({ user, users, onSave, onClose, t }) {
  const [name,       setName]       = useState(user.name);
  const [accent,     setAccent]     = useState(user.accent);
  const [email,      setEmail]      = useState(user.email || "");
  const [avatarUrl,  setAvatarUrl]  = useState(user.avatar || "");
  const [uploading,  setUploading]  = useState(false);
  const [saved,      setSaved]      = useState(false);
  const fileRef = useRef();

  const preview = avatarUrl || null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/user_${user.id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Error al subir la foto: " + err.message);
    }
    setUploading(false);
  };

  const save = () => {
    if (!name.trim()) return;
    onSave({
      ...user,
      name:      name.trim(),
      initials:  initials(name),
      accent,
      accentDim: accent + "18",
      email:     email.trim(),
      avatar:    avatarUrl,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const otherUsers = users.filter(u => u.id !== user.id);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:22,padding:"28px 28px 24px",width:"100%",maxWidth:400,boxShadow:"0 28px 70px rgba(0,0,0,.4)",maxHeight:"90vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
          <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:800,color:t.text }}>Perfil</div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:t.textMuted,padding:4,display:"flex",cursor:"pointer" }}><X size={16}/></button>
        </div>

        {/* Avatar */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,gap:10 }}>
          <div style={{ position:"relative",cursor:"pointer" }} onClick={()=>fileRef.current?.click()}>
            {preview ? (
              <img src={preview} alt="avatar"
                style={{ width:80,height:80,borderRadius:22,objectFit:"cover",border:`3px solid ${accent}60`,display:"block" }}
                onError={()=>setAvatarUrl("")}/>
            ) : (
              <div style={{ width:80,height:80,borderRadius:22,background:accent+"22",border:`3px solid ${accent}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:accent }}>
                {initials(name||"?")}
              </div>
            )}
            <div style={{ position:"absolute",inset:0,borderRadius:22,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .2s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0}>
              {uploading
                ? <Loader2 size={20} color="#fff" style={{ animation:"spin 1s linear infinite" }}/>
                : <Camera size={20} color="#fff"/>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>fileRef.current?.click()} style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:8,padding:"5px 12px",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
              {uploading?<Loader2 size={11} style={{ animation:"spin 1s linear infinite" }}/>:<Camera size={11}/>}
              {uploading?"Subiendo...":"Cambiar foto"}
            </button>
            {avatarUrl&&<button onClick={()=>setAvatarUrl("")} style={{ background:"none",border:`1px solid ${t.inputBdr}`,color:"#f87171",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer" }}>Quitar</button>}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10.5,color:t.textMuted,marginBottom:6,fontWeight:700,letterSpacing:.5 }}>NOMBRE</div>
          <input value={name} onChange={e=>setName(e.target.value)}
            style={{ width:"100%",background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:10,padding:"10px 14px",color:t.text,fontSize:14,fontFamily:"inherit" }}/>
        </div>

        {/* Email */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10.5,color:t.textMuted,marginBottom:6,fontWeight:700,letterSpacing:.5 }}>EMAIL (reporte diario)</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="tucorreo@ejemplo.com"
            style={{ width:"100%",background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:10,padding:"10px 14px",color:t.text,fontSize:13,fontFamily:"inherit" }}/>
          <div style={{ fontSize:10,color:t.textFaint,marginTop:5 }}>El reporte diario se enviará a este correo cada mañana.</div>
        </div>

        {/* Accent color */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10.5,color:t.textMuted,marginBottom:10,fontWeight:700,letterSpacing:.5 }}>COLOR DE ACENTO</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:10 }}>
            {ACCENT_PALETTE.map(c=>(
              <button key={c} onClick={()=>setAccent(c)} style={{ width:34,height:34,borderRadius:10,background:c,border:`2.5px solid ${accent===c?"#fff":"transparent"}`,outline:accent===c?`2.5px solid ${c}`:"none",outlineOffset:2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s" }}>
                {accent===c&&<Check size={14} color="#fff"/>}
              </button>
            ))}
            {/* Custom color picker */}
            <label style={{ width:34,height:34,borderRadius:10,background:t.input,border:`1.5px dashed ${t.inputBdr}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",overflow:"hidden" }} title="Color personalizado">
              <span style={{ fontSize:16 }}>🎨</span>
              <input type="color" value={accent} onChange={e=>setAccent(e.target.value)}
                style={{ position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%" }}/>
            </label>
          </div>
          {/* Live preview */}
          <div style={{ background:accent+"12",border:`1px solid ${accent}30`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:28,height:28,borderRadius:9,background:accent+"22",border:`2px solid ${accent}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:accent }}>
              {initials(name||"?")}
            </div>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:accent }}>{name||"Tu nombre"}</div>
              <div style={{ fontSize:10,color:t.textFaint }}>Vista previa del acento</div>
            </div>
            <div style={{ marginLeft:"auto",background:accent,color:"#07070f",borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700 }}>botón</div>
          </div>
        </div>

        {/* Other users quick-switch */}
        {otherUsers.length>0&&(
          <div style={{ marginBottom:20,paddingTop:16,borderTop:`1px solid ${t.border}` }}>
            <div style={{ fontSize:10.5,color:t.textMuted,marginBottom:8,fontWeight:700,letterSpacing:.5 }}>CAMBIAR A</div>
            <div style={{ display:"flex",gap:8 }}>
              {otherUsers.map(u=>(
                <button key={u.id} onClick={()=>{ onClose(); }} style={{ flex:1,display:"flex",alignItems:"center",gap:8,background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:11,padding:"8px 12px",cursor:"pointer" }}>
                  {u.avatar?(
                    <img src={u.avatar} style={{ width:28,height:28,borderRadius:8,objectFit:"cover" }}/>
                  ):(
                    <div style={{ width:28,height:28,borderRadius:8,background:u.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:u.accent }}>{u.initials}</div>
                  )}
                  <span style={{ fontSize:12,color:t.text,fontWeight:500 }}>{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        <button onClick={save} style={{ width:"100%",background:saved?"#34d399":accent,color:"#07070f",border:"none",padding:"12px",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",transition:"background .3s",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
          {saved?<><Check size={15}/> Guardado</>:<>Guardar cambios</>}
        </button>
      </div>
    </div>
  );
}


// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
function renderMarkdown(md = "") {
  if (!md) return "";
  const escape = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const lines = md.split("\n");
  let html = "";
  let inUl = false, inOl = false, inCode = false, codeLines = [];

  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  const inline = s => s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // fenced code block
    if (raw.startsWith("```")) {
      if (!inCode) { inCode = true; codeLines = []; closeList(); continue; }
      else { inCode = false; html += `<pre><code>${escape(codeLines.join("\n"))}</code></pre>`; codeLines = []; continue; }
    }
    if (inCode) { codeLines.push(raw); continue; }

    const line = escape(raw);

    // headings
    if (/^#{6}\s/.test(raw)) { closeList(); html += `<h6>${inline(line.replace(/^#{6}\s/,""))}</h6>`; continue; }
    if (/^#{5}\s/.test(raw)) { closeList(); html += `<h5>${inline(line.replace(/^#{5}\s/,""))}</h5>`; continue; }
    if (/^#{4}\s/.test(raw)) { closeList(); html += `<h4>${inline(line.replace(/^#{4}\s/,""))}</h4>`; continue; }
    if (/^#{3}\s/.test(raw)) { closeList(); html += `<h3>${inline(line.replace(/^#{3}\s/,""))}</h3>`; continue; }
    if (/^#{2}\s/.test(raw)) { closeList(); html += `<h2>${inline(line.replace(/^#{2}\s/,""))}</h2>`; continue; }
    if (/^#{1}\s/.test(raw)) { closeList(); html += `<h1>${inline(line.replace(/^#{1}\s/,""))}</h1>`; continue; }

    // hr
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(raw.trim())) { closeList(); html += "<hr/>"; continue; }

    // blockquote
    if (/^>\s/.test(raw)) { closeList(); html += `<blockquote>${inline(line.replace(/^>\s/,""))}</blockquote>`; continue; }

    // checkbox
    if (/^- \[x\] /i.test(raw)) {
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += `<li class="task done">✅ ${inline(line.replace(/^- \[x\] /i,""))}</li>`; continue;
    }
    if (/^- \[ \] /i.test(raw)) {
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += `<li class="task">⬜ ${inline(line.replace(/^- \[ \] /i,""))}</li>`; continue;
    }

    // unordered list
    if (/^[-*+]\s/.test(raw)) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += `<li>${inline(line.replace(/^[-*+]\s/,""))}</li>`; continue;
    }

    // ordered list
    if (/^\d+\.\s/.test(raw)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += "<ol>"; inOl = true; }
      html += `<li>${inline(line.replace(/^\d+\.\s/,""))}</li>`; continue;
    }

    closeList();

    // blank line
    if (!raw.trim()) { html += "<br/>"; continue; }

    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}

// ─── NOTE EDITOR (fullscreen split) ──────────────────────────────────────────
function NoteEditor({ note, onSave, onDelete, onClose, accent, t }) {
  const [title,   setTitle]   = useState(note.title || "");
  const [body,    setBody]    = useState(note.body  || "");
  const [type,    setType]    = useState(note.type  || "idea");
  const [saved,   setSaved]   = useState(false);
  const [dirty,   setDirty]   = useState(false);
  const editorRef = useRef();
  const bodyRef   = useRef(body);
  const isNew     = !note.body && !note.title; // brand new empty note

  const NOTE_C_LOCAL = {
    idea:     { label:"💡 Idea",      color:"#f59e0b" },
    journal:  { label:"📓 Journal",   color:"#818cf8" },
    objetivo: { label:"🎯 Objetivo",  color:"#34d399" },
  };
  const noteColor = NOTE_C_LOCAL[type]?.color || accent;

  const save = async () => {
    await onSave({ ...note, title, body: bodyRef.current, type });
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 1400);
  };

  const handleClose = () => {
    if (dirty && (bodyRef.current.trim() || title.trim())) {
      confirmModal(
        "¿Salir sin guardar?",
        "Los cambios de esta nota se perderán.",
        () => onClose(),
        { danger: false }
      );
      return;
    }
    onClose();
  };

  // On mount: render initial content, focus, place cursor at end
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = body ? renderMarkdown(body) : "";
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    const raw = el.innerText || "";
    bodyRef.current = raw;
    setBody(raw);
    setDirty(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setDirty(true);
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "b") { e.preventDefault(); document.execCommand("bold"); }
    if ((e.metaKey || e.ctrlKey) && e.key === "i") { e.preventDefault(); document.execCommand("italic"); }
    if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "  "); }
  };

  const fmt = (cmd, val) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); };

  const TOOLBAR = [
    { label:"H1", title:"Título 1",  action:()=>{ editorRef.current?.focus(); document.execCommand("formatBlock",false,"h1"); } },
    { label:"H2", title:"Título 2",  action:()=>{ editorRef.current?.focus(); document.execCommand("formatBlock",false,"h2"); } },
    { label:"H3", title:"Título 3",  action:()=>{ editorRef.current?.focus(); document.execCommand("formatBlock",false,"h3"); } },
    { label:"B",  title:"Negrita",   action:()=>fmt("bold"),               style:{ fontWeight:800 } },
    { label:"I",  title:"Itálica",   action:()=>fmt("italic"),             style:{ fontStyle:"italic" } },
    { label:"U",  title:"Subrayado", action:()=>fmt("underline"),          style:{ textDecoration:"underline" } },
    { label:"S",  title:"Tachado",   action:()=>fmt("strikeThrough"),      style:{ textDecoration:"line-through" } },
    { label:"•",  title:"Lista",     action:()=>fmt("insertUnorderedList"),style:{ fontSize:15 } },
    { label:"1.", title:"Lista num.",action:()=>fmt("insertOrderedList") },
    { label:"—",  title:"Separador", action:()=>{ editorRef.current?.focus(); document.execCommand("insertHorizontalRule"); } },
    { label:">",  title:"Cita",      action:()=>{ editorRef.current?.focus(); document.execCommand("formatBlock",false,"blockquote"); }, style:{ fontStyle:"italic" } },
  ];

  return (
    <div style={{ position:"fixed",inset:0,background:t.bg,zIndex:250,display:"flex",flexDirection:"column" }}>
      {/* Top bar */}
      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:`1px solid ${t.border}`,background:t.bgCard,flexShrink:0 }}>
        <button onClick={handleClose} style={{ background:"none",border:"none",color:t.textMuted,padding:4,display:"flex",cursor:"pointer" }}><X size={18}/></button>
        <select value={type} onChange={e=>{setType(e.target.value);setDirty(true);}} style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:noteColor,borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer" }}>
          {Object.entries(NOTE_C_LOCAL).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <input value={title} onChange={handleTitleChange} placeholder="Título de la nota..."
          style={{ flex:1,background:"none",border:"none",fontSize:16,fontWeight:700,color:t.text,outline:"none",fontFamily:"inherit" }}/>
        {dirty&&<span style={{ fontSize:10,color:t.textFaint,whiteSpace:"nowrap" }}>Sin guardar</span>}
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={save} style={{ background:saved?"#34d399":accent,color:"#07070f",border:"none",padding:"7px 16px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"background .3s" }}>
            {saved?<><Check size={13}/> Guardado</>:<><Save size={13}/> Guardar</>}
          </button>
          {!note._draft && (
            <button onClick={()=>{ confirmModal("¿Eliminar nota?", "Esta acción no se puede deshacer.", ()=>{ onDelete(note.id); onClose(); }, { danger: true }); }} style={{ background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",color:"#f87171",padding:"7px 10px",borderRadius:9,cursor:"pointer",display:"flex" }}><Trash2 size={14}/></button>
          )}
        </div>
      </div>

      {/* Formatting toolbar */}
      <div style={{ display:"flex",alignItems:"center",gap:2,padding:"5px 16px",borderBottom:`1px solid ${t.border}`,background:t.bgCard,flexShrink:0,overflowX:"auto" }}>
        {TOOLBAR.map((btn,i)=>(
          <button key={i} title={btn.title} onMouseDown={e=>{e.preventDefault();btn.action();}}
            style={{ background:"none",border:"1px solid transparent",color:t.textMuted,borderRadius:6,padding:"4px 9px",fontSize:12,cursor:"pointer",flexShrink:0,...(btn.style||{}) }}>
            {btn.label}
          </button>
        ))}
        <div style={{ flex:1 }}/>
        <span style={{ fontSize:10,color:t.textFaint,whiteSpace:"nowrap" }}>{body.split(/\s+/).filter(Boolean).length} palabras</span>
      </div>

      {/* WYSIWYG editor */}
      <div style={{ flex:1,overflowY:"auto",padding:"32px max(32px, calc(50% - 380px))",boxSizing:"border-box" }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder="Empieza a escribir tu nota..."
          spellCheck
          style={{
            minHeight:"60vh",
            outline:"none",
            color:t.text,
            fontSize:15,
            lineHeight:1.85,
            fontFamily:"inherit",
          }}
          className="md-preview wysiwyg-editor"
        />
      </div>
    </div>
  );
}


// ─── SUBTASK COMPONENTS ──────────────────────────────────────────────────────
function SubtaskRow({ s, taskId, accent, onToggle, onUpdate, onDelete, t }) {
  const [editing, setEditing] = useState(false);
  const [title,   setTitle]   = useState(s.title);
  const commit = () => { setEditing(false); if(title.trim()&&title!==s.title) onUpdate(taskId,s.id,title.trim()); else setTitle(s.title); };
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 4px",borderRadius:8,marginBottom:2 }}>
      <button onClick={()=>onToggle(taskId,s.id,!s.done)} style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${s.done?accent:"#475569"}`,background:s.done?accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .18s" }}>
        {s.done&&<span style={{ fontSize:8,color:"#07070f",fontWeight:900 }}>✓</span>}
      </button>
      {editing ? (
        <input autoFocus value={title} onChange={e=>setTitle(e.target.value)}
          onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);setTitle(s.title);}}}
          style={{ flex:1,background:"rgba(255,255,255,.06)",border:`1px solid ${accent}50`,borderRadius:6,padding:"3px 8px",color:t.text,fontSize:12,outline:"none",fontFamily:"inherit" }}/>
      ) : (
        <span onDoubleClick={()=>setEditing(true)} style={{ flex:1,fontSize:12,color:s.done?t.textFaint:t.text,textDecoration:s.done?"line-through":"none",cursor:"text",lineHeight:1.4 }}>{s.title}</span>
      )}
      <button onClick={()=>setEditing(true)} style={{ background:"none",border:"none",color:t.textFaint,padding:2,cursor:"pointer",display:"flex",opacity:.5 }}><Pencil size={9}/></button>
      <button onClick={()=>onDelete(taskId,s.id)} style={{ background:"none",border:"none",color:"#f87171",padding:2,cursor:"pointer",display:"flex",opacity:.5 }}><Trash2 size={9}/></button>
    </div>
  );
}

function SubtaskAddRow({ taskId, accent, onAdd, t, inputStyle }) {
  const [title, setTitle] = useState("");
  const submit = () => { if(title.trim()){ onAdd(taskId,title); setTitle(""); } };
  return (
    <div style={{ display:"flex",gap:6,marginTop:6 }}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="+ Nueva subtarea..."
        onKeyDown={e=>{ if(e.key==="Enter") submit(); }}
        style={{ flex:1,...inputStyle,padding:"5px 10px",fontSize:11,border:`1px dashed ${accent}40` }}/>
      <button onClick={submit} style={{ background:accent,color:"#07070f",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer" }}>+</button>
    </div>
  );
}

// ─── ACADEMIC SHEET — sub-components defined at top level so React never
// recreates them on keystroke (avoids focus loss / input reset bugs) ──────────

function AcadAddRowForm({ color, inputStyle, t, form, setForm, onSave, onCancel, isLeaf }) {
  return (
    <div className="slide-down" style={{ background:color+"08",border:`1px dashed ${color}50`,borderRadius:9,padding:"10px 12px",marginBottom:8 }}>
      <div style={{ fontSize:9,fontWeight:700,color,letterSpacing:.5,marginBottom:8 }}>
        {isLeaf ? "NUEVA EVALUACIÓN" : "NUEVO GRUPO DE EVALUACIONES"}
      </div>
      <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center" }}>
        <input
          autoFocus
          value={form.name}
          onChange={e => setForm(p => ({...p, name:e.target.value}))}
          placeholder={isLeaf ? "Ej: PC1, Examen Parcial..." : "Ej: Prácticas Calificadas, Exámenes..."}
          style={{ flex:1,minWidth:160,...inputStyle,padding:"6px 9px",fontSize:12 }}
        />
        <input
          type="number" min="0" max="100"
          value={form.weight}
          onChange={e => setForm(p => ({...p, weight:e.target.value}))}
          placeholder="Peso%"
          style={{ width:72,...inputStyle,padding:"6px 8px",fontSize:12 }}
        />
        {!isLeaf && (
          <input
            value={form.subFormula}
            onChange={e => setForm(p => ({...p, subFormula:e.target.value}))}
            placeholder="Fórmula interna (opcional, ej: (PC1+PC2)/2)"
            style={{ flex:2,minWidth:180,...inputStyle,padding:"6px 9px",fontSize:11,fontFamily:"monospace" }}
          />
        )}
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(p => ({...p, date:e.target.value}))}
          style={{...inputStyle,padding:"6px 7px",fontSize:11}}
        />
        <label style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:t.textMuted,cursor:"pointer",whiteSpace:"nowrap" }}>
          <input type="checkbox" checked={form.round} onChange={e => setForm(p => ({...p, round:e.target.checked}))}/>
          ⌈⌉ Redondear
        </label>
      </div>
      <div style={{ display:"flex",gap:7,marginTop:8 }}>
        <button onClick={onSave} style={{ background:color,color:"#07070f",border:"none",padding:"6px 16px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer" }}>+ Agregar</button>
        <button onClick={onCancel} style={{ background:"none",border:"none",color:t.textMuted,padding:"6px 8px",fontSize:11,cursor:"pointer" }}>Cancelar</button>
      </div>
    </div>
  );
}

function AcadLeafRow({ node, courseId, isOwn, updateEvalNode, deleteEvalNode, inputStyle, t, indent }) {
  const indentPx = 16 + (indent||0) * 14;
  const s = node.score !== null && node.score !== undefined ? Number(node.score) : null;
  const sc = s === null ? t.textMuted : s >= 14 ? "#34d399" : s >= 11 ? "#fb923c" : "#f87171";
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState({ name: node.name, weight: node.weight||"", date: node.date||"", round: !!node.round });

  const saveEdit = async () => {
    await updateEvalNode(courseId, node.id, { name: ef.name.trim()||node.name, weight: Number(ef.weight)||0, date: ef.date||null, round: !!ef.round });
    setEditing(false);
  };

  if (editing && isOwn) return (
    <div style={{ display:"flex",alignItems:"center",gap:6,padding:`7px 10px 7px ${indentPx}px`,borderRadius:8,background:t.input,marginBottom:2,flexWrap:"wrap" }}>
      <input value={ef.name} onChange={e=>setEf(p=>({...p,name:e.target.value}))} placeholder="Nombre" style={{ ...inputStyle,flex:1,minWidth:80,fontSize:12 }}/>
      <input type="number" min="0" max="100" value={ef.weight} onChange={e=>setEf(p=>({...p,weight:e.target.value}))} placeholder="Peso%" style={{ ...inputStyle,width:65,fontSize:12 }}/>
      <input type="date" value={ef.date} onChange={e=>setEf(p=>({...p,date:e.target.value}))} style={{ ...inputStyle,width:130,fontSize:12 }}/>
      <label style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:t.textMuted,cursor:"pointer",whiteSpace:"nowrap" }}>
        <input type="checkbox" checked={ef.round} onChange={e=>setEf(p=>({...p,round:e.target.checked}))}/> ⌈⌉
      </label>
      <button onClick={saveEdit} style={{ background:"#34d399",color:"#07070f",border:"none",padding:"5px 11px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>✓</button>
      <button onClick={()=>setEditing(false)} style={{ background:"none",border:"none",color:t.textMuted,fontSize:13,cursor:"pointer" }}>✕</button>
    </div>
  );

  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,padding:`7px 10px 7px ${indentPx}px`,borderRadius:8,background:s!==null?sc+"08":"transparent",marginBottom:2 }}>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:5,flexWrap:"wrap" }}>
          <span style={{ fontSize:12.5,color:t.text,fontWeight:450 }}>{node.name}</span>
          <span style={{ fontSize:8.5,color:t.textFaint,background:t.input,borderRadius:4,padding:"1px 5px",fontFamily:"monospace",border:`1px solid ${t.inputBdr}`,flexShrink:0 }}>{node.var_name}</span>
          {node.date && <span style={{ fontSize:9,color:t.textFaint }}>{node.date.slice(5)}</span>}
        </div>
      </div>
      {node.weight > 0 && (
        <span style={{ fontSize:10,color:t.textFaint,background:t.input,borderRadius:99,padding:"2px 8px",border:`1px solid ${t.inputBdr}`,whiteSpace:"nowrap",flexShrink:0 }}>{node.weight}%</span>
      )}
      {node.round && <span title="Se redondea" style={{ fontSize:10,color:"#818cf8",flexShrink:0 }}>⌈⌉</span>}
      <input
        type="number" min="0" max="20" step="0.5"
        value={s ?? ""}
        placeholder="—"
        disabled={!isOwn}
        onChange={e => updateEvalNode(courseId, node.id, { score: e.target.value === "" ? null : Number(e.target.value) })}
        style={{ width:58,textAlign:"center",...inputStyle,padding:"5px 4px",fontSize:15,fontWeight:800,color:sc,background:s!==null?sc+"15":t.input,border:`1px solid ${s!==null?sc+"50":t.inputBdr}`,flexShrink:0 }}
      />
      {isOwn && (
        <div style={{ display:"flex",gap:2,flexShrink:0 }}>
          <button onClick={()=>setEditing(true)} style={{ background:"none",border:"none",color:t.textFaint,padding:"2px 3px",cursor:"pointer",display:"flex",opacity:.6 }}>
            <Pencil size={10}/>
          </button>
          <button onClick={() => deleteEvalNode(courseId, node.id)} style={{ background:"none",border:"none",color:"#f87171",padding:"2px 3px",cursor:"pointer",display:"flex",opacity:.4 }}>
            <Trash2 size={10}/>
          </button>
        </div>
      )}
    </div>
  );
}

function AcadGroupBlock({ node, nodes, courseId, color, isOwn, computeNode, updateEvalNode, deleteEvalNode, inputStyle, t, addingTo, setAddingTo, addForm, setAddForm, onAddSave }) {
  const [collapsed, setCollapsed] = useState(false);
  const children = nodes.filter(n => n.parent_id === node.id && !n.modifier);
  const s = computeNode(node, nodes);
  const sc = s === null ? t.textMuted : s >= 14 ? "#34d399" : s >= 11 ? "#fb923c" : "#f87171";
  const hasSubFormula = !!node.child_formula;
  const isAddingHere = addingTo === node.id;

  const [directMode, setDirectMode] = useState(children.length === 0 && node.score !== null && node.score !== undefined);
  const [directVal,  setDirectVal]  = useState(node.score !== null && node.score !== undefined ? String(node.score) : "");
  const [savingDirect, setSavingDirect] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [editGForm, setEditGForm] = useState({ name: node.name, weight: node.weight||"", round: !!node.round });

  const saveDirectScore = async () => {
    setSavingDirect(true);
    const v = directVal === "" ? null : Math.max(0, Math.min(20, Number(directVal)));
    await updateEvalNode(courseId, node.id, { score: v });
    setSavingDirect(false);
  };

  const saveGroupEdit = async () => {
    await updateEvalNode(courseId, node.id, { name: editGForm.name.trim()||node.name, weight: Number(editGForm.weight)||0, round: !!editGForm.round });
    setEditingGroup(false);
  };

  const showDirect = directMode && children.length === 0;

  return (
    <div style={{ marginBottom:8,border:`1px solid ${s!==null?sc+"30":t.border}`,borderLeft:`3px solid ${color}`,borderRadius:10,overflow:"hidden",background:t.bgCard }}>
      <div onClick={() => setCollapsed(v => !v)} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",cursor:"pointer",background:s!==null?sc+"06":"transparent" }}>
        <ChevronRight size={12} color={t.textMuted} style={{ transform:collapsed?"none":"rotate(90deg)",transition:"transform .2s",flexShrink:0 }}/>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
            <span style={{ fontSize:13,color:t.text,fontWeight:700 }}>{node.name}</span>
            <span style={{ fontSize:8.5,color:t.textFaint,background:t.input,borderRadius:4,padding:"1px 5px",fontFamily:"monospace",border:`1px solid ${t.inputBdr}` }}>{node.var_name}</span>
            {node.round && <span style={{ fontSize:9,color:"#818cf8" }}>⌈⌉ parcial</span>}
            {hasSubFormula && <span style={{ fontSize:9,color:"#f59e0b",background:"#f59e0b18",borderRadius:4,padding:"1px 5px",fontFamily:"monospace" }}>ƒ {node.child_formula}</span>}
            {showDirect && <span style={{ fontSize:9,color:"#a78bfa",background:"#a78bfa18",borderRadius:4,padding:"1px 6px" }}>nota directa</span>}
          </div>
          <div style={{ fontSize:10,color:t.textFaint,marginTop:1 }}>
            {showDirect ? "Evaluación única" : `${children.length} evaluación${children.length!==1?"es":""}`}
            {node.weight > 0 && <span> · {node.weight}% del total</span>}
          </div>
        </div>
        <div style={{ background:s!==null?sc+"18":t.input,border:`1px solid ${s!==null?sc+"40":t.inputBdr}`,borderRadius:8,padding:"5px 12px",textAlign:"center",flexShrink:0 }}>
          <div style={{ fontSize:8.5,color:s!==null?sc:t.textFaint,fontWeight:700,letterSpacing:.3 }}>NOTA</div>
          <div style={{ fontSize:20,fontWeight:900,color:s!==null?sc:t.textFaint,lineHeight:1 }}>{s!==null?s.toFixed(1):"—"}</div>
        </div>
        {isOwn && (
          <div style={{ display:"flex",gap:2,flexShrink:0 }} onClick={e => e.stopPropagation()}>
            {children.length === 0 && (
              <button
                title={directMode ? "Cambiar a sub-evaluaciones" : "Ingresar nota directa"}
                onClick={() => setDirectMode(v => !v)}
                style={{ background:directMode?`#a78bfa18`:color+"18",border:`1px solid ${directMode?"#a78bfa40":color+"30"}`,color:directMode?"#a78bfa":color,borderRadius:6,padding:"3px 7px",fontSize:10,cursor:"pointer" }}>
                {directMode ? "📋" : "✏️"}
              </button>
            )}
            {/* Edit group name/weight */}
            <button
              title="Editar grupo"
              onClick={() => setEditingGroup(true)}
              style={{ background:color+"18",border:`1px solid ${color}30`,color,borderRadius:6,padding:"3px 7px",fontSize:10,cursor:"pointer" }}>
              <Pencil size={10}/>
            </button>
            {!directMode && (
              <button onClick={() => { setAddingTo(node.id); setAddForm({name:"",weight:"",round:false,subFormula:"",date:""}); }}
                style={{ background:color+"18",border:`1px solid ${color}30`,color,borderRadius:6,padding:"3px 7px",fontSize:10,cursor:"pointer" }}><Plus size={10}/></button>
            )}
            <button onClick={() => deleteEvalNode(courseId, node.id)}
              style={{ background:"none",border:"none",color:"#f87171",padding:"3px 4px",cursor:"pointer",opacity:.4 }}><Trash2 size={10}/></button>
          </div>
        )}
      </div>
      {!collapsed && (
        <div style={{ padding:"4px 12px 10px" }}>
          {/* Inline group edit form */}
          {editingGroup && isOwn && (
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 0 10px",flexWrap:"wrap" }}>
              <input value={editGForm.name} onChange={e=>setEditGForm(p=>({...p,name:e.target.value}))}
                placeholder="Nombre" style={{ ...inputStyle,flex:1,minWidth:100,fontSize:12 }}/>
              <input type="number" min="0" max="100" value={editGForm.weight} onChange={e=>setEditGForm(p=>({...p,weight:e.target.value}))}
                placeholder="Peso%" style={{ ...inputStyle,width:72,fontSize:12 }}/>
              <label style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:t.textMuted,cursor:"pointer" }}>
                <input type="checkbox" checked={editGForm.round} onChange={e=>setEditGForm(p=>({...p,round:e.target.checked}))}/> Redondear
              </label>
              <button onClick={saveGroupEdit} style={{ background:color,color:"#07070f",border:"none",padding:"5px 13px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>Guardar</button>
              <button onClick={()=>setEditingGroup(false)} style={{ background:"none",border:"none",color:t.textMuted,fontSize:11,cursor:"pointer" }}>Cancelar</button>
            </div>
          )}
          {/* Direct score input */}
          {showDirect && isOwn && (
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 0" }}>
              <input
                type="number" min="0" max="20" step="0.5"
                value={directVal}
                onChange={e => setDirectVal(e.target.value)}
                onBlur={saveDirectScore}
                onKeyDown={e => e.key==="Enter" && saveDirectScore()}
                placeholder="0 – 20"
                style={{ ...inputStyle, width:90, textAlign:"center", fontSize:15, fontWeight:700 }}/>
              <span style={{ fontSize:11,color:t.textFaint }}>/20</span>
              {savingDirect && <span style={{ fontSize:10,color:t.textFaint }}>guardando…</span>}
            </div>
          )}
          {showDirect && !isOwn && (
            <div style={{ fontSize:18,fontWeight:700,color:s!==null?sc:t.textFaint,padding:"6px 0" }}>
              {s !== null ? `${s.toFixed(1)} / 20` : "Sin nota"}
            </div>
          )}

          {/* Sub-evaluations */}
          {!showDirect && children.map(leaf => (
            <AcadLeafRow key={leaf.id} node={leaf} courseId={courseId} isOwn={isOwn}
              updateEvalNode={updateEvalNode} deleteEvalNode={deleteEvalNode}
              inputStyle={inputStyle} t={t} indent={1}/>
          ))}
          {!showDirect && isAddingHere && (
            <AcadAddRowForm color={color} inputStyle={inputStyle} t={t}
              form={addForm} setForm={setAddForm} onSave={onAddSave}
              onCancel={() => setAddingTo(null)} isLeaf={true}/>
          )}
          {!showDirect && isOwn && !isAddingHere && (
            <button onClick={() => { setAddingTo(node.id); setAddForm({name:"",weight:"",round:false,subFormula:"",date:""}); }}
              style={{ background:"none",border:`1px dashed ${color}40`,color,borderRadius:7,padding:"5px 12px",fontSize:10.5,width:"100%",marginTop:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
              <Plus size={9}/> Agregar evaluación
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AcadFormulaEditor({ color, course, topLevel, nodes, computeNode, inputStyle, t, isOwn, onFormulaChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(course.formula_text || "");
  const formulaText           = course.formula_text || "";

  // Auto-generate formula from root nodes with weights
  const autoGenerateFormula = () => {
    const weighted = topLevel.filter(n => n.weight > 0);
    const totalW   = weighted.reduce((a, n) => a + Number(n.weight), 0);
    if (!weighted.length) {
      // Simple average
      return topLevel.map(n => n.var_name).join(" + ") + (topLevel.length > 1 ? ` / ${topLevel.length}` : "");
    }
    if (Math.abs(totalW - 100) < 0.01) {
      // Weights already sum to 100 → divide each by 100
      return weighted.map(n => `${n.var_name} * ${(Number(n.weight)/100).toFixed(2)}`).join(" + ");
    }
    // Normalize weights
    return weighted.map(n => `${n.var_name} * ${(Number(n.weight)/totalW).toFixed(4)}`).join(" + ");
  };

  const isAutoFormula = formulaText && formulaText === autoGenerateFormula();

  const evalFml = (fml) => {
    const vars = {};
    topLevel.forEach(n => { const s = computeNode(n, nodes); if (s !== null) vars[n.var_name] = s; });
    nodes.filter(n => n.type === "leaf").forEach(n => { const s = computeNode(n, nodes); if (s !== null && !vars[n.var_name]) vars[n.var_name] = s; });
    if (!Object.keys(vars).length) return null;
    try {
      const expr = (fml||"").replace(/[A-Za-z_][A-Za-z0-9_]*/g, m => vars[m] !== undefined ? vars[m] : "0");
      const r = Function('"use strict"; return (' + expr + ')')();
      if (isNaN(r) || !isFinite(r)) return null;
      let final = Math.max(0, Math.min(20, r));
      if (course.round_final) final = Math.round(final * 2) / 2;
      return final;
    } catch { return null; }
  };

  const draftGrade = editing ? evalFml(draft) : null;
  const allVars = [
    ...topLevel.map(n => ({ var_name:n.var_name, score:computeNode(n,nodes) })),
    ...nodes.filter(n=>n.type==="leaf").filter(lv=>!topLevel.find(v=>v.var_name===lv.var_name)).map(n=>({ var_name:n.var_name, score:computeNode(n,nodes) })),
  ];
  const sc = (g) => g === null ? "#64748b" : g >= 14 ? "#34d399" : g >= 11 ? "#fb923c" : "#f87171";

  const save = async () => { await onFormulaChange(draft); setEditing(false); };

  // Auto-save generated formula on first render if no formula set yet
  useEffect(() => {
    if (!course.formula_text && topLevel.length > 0 && isOwn) {
      const auto = autoGenerateFormula();
      if (auto) onFormulaChange(auto);
    }
  }, [topLevel.length]);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
        <span style={{ fontSize:11,color:t.textMuted,fontWeight:600,whiteSpace:"nowrap" }}>Fórmula:</span>
        {!editing && (
          <span style={{ flex:1,fontSize:12,fontFamily:"monospace",color:formulaText?color:t.textFaint,background:t.input,borderRadius:7,padding:"4px 10px",border:`1px solid ${t.inputBdr}`,minHeight:28,display:"flex",alignItems:"center",gap:6 }}>
            {formulaText || <span style={{fontStyle:"italic"}}>sin fórmula</span>}
            {isAutoFormula && <span style={{ fontSize:9,color:t.textFaint,background:t.bgCard,borderRadius:4,padding:"1px 6px",border:`1px solid ${t.border}`,fontFamily:"sans-serif",whiteSpace:"nowrap" }}>auto</span>}
          </span>
        )}
        {isOwn && !editing && (
          <div style={{ display:"flex",gap:5 }}>
            <button onClick={() => { const auto = autoGenerateFormula(); setDraft(auto); onFormulaChange(auto); }}
              title="Regenerar fórmula automáticamente desde los pesos"
              style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap" }}>
              ↻
            </button>
            <button onClick={() => { setDraft(formulaText); setEditing(true); }}
              style={{ background:color+"18",border:`1px solid ${color}40`,color,borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" }}>
              ✏️ Editar
            </button>
          </div>
        )}
      </div>
      {editing && (
        <div className="slide-down" style={{ marginTop:10 }}>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:9.5,color:t.textMuted,marginBottom:5,fontWeight:600 }}>VARIABLES — click para insertar:</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {allVars.map(v => (
                <button key={v.var_name}
                  onClick={() => setDraft(p => p + (p && !p.endsWith(" ") ? " " : "") + v.var_name)}
                  style={{ background:v.score!==null?color+"18":t.input,border:`1px solid ${v.score!==null?color+"50":t.inputBdr}`,borderRadius:6,padding:"3px 8px",fontSize:10.5,cursor:"pointer",fontFamily:"monospace",color:v.score!==null?color:t.textMuted,display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{fontWeight:700}}>{v.var_name}</span>
                  {v.score!==null && <span style={{fontSize:9,opacity:.7}}>={v.score.toFixed(1)}</span>}
                </button>
              ))}
              {["+","-","*","/","(",")","0.3","0.4","0.5","0.6","0.7","0.2"].map(op => (
                <button key={op} onClick={() => setDraft(p => p + " " + op)}
                  style={{ background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"monospace",color:t.textSub }}>
                  {op}
                </button>
              ))}
            </div>
          </div>
          {/* Auto-generate shortcut */}
          {topLevel.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <button onClick={() => setDraft(autoGenerateFormula())}
                style={{ background:`${color}12`,border:`1px solid ${color}30`,color,borderRadius:7,padding:"5px 12px",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                ✨ Usar pesos automáticos ({topLevel.filter(n=>n.weight>0).map(n=>`${n.var_name}×${n.weight}%`).join(", ") || "promedio simple"})
              </button>
            </div>
          )}
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ej: PC*0.3 + EP*0.3 + EF*0.4"
            style={{ width:"100%",...inputStyle,padding:"9px 12px",fontSize:13,fontFamily:"monospace",marginBottom:8,boxSizing:"border-box" }}
          />
          <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:draftGrade!==null?(draftGrade>=10.5?"rgba(52,211,153,.07)":"rgba(248,113,113,.07)"):t.input,border:`1px solid ${draftGrade!==null?(draftGrade>=10.5?"rgba(52,211,153,.3)":"rgba(248,113,113,.3)"):t.border}`,borderRadius:10,marginBottom:10 }}>
            <div>
              <div style={{ fontSize:8.5,color:t.textFaint,letterSpacing:.5,marginBottom:2 }}>VISTA PREVIA</div>
              <div style={{ fontSize:28,fontWeight:900,color:sc(draftGrade),lineHeight:1 }}>{draftGrade!==null?draftGrade.toFixed(2):"—"}</div>
            </div>
            {draftGrade!==null && (
              <div style={{ fontSize:12,fontWeight:700,color:draftGrade>=10.5?"#34d399":"#f87171" }}>
                {draftGrade>=10.5?"✅ Aprueba":"❌ Desaprueba"}
                <div style={{ fontSize:10,fontWeight:400,color:t.textFaint,marginTop:2 }}>
                  {draftGrade>=10.5?`${(draftGrade-10.5).toFixed(2)} pts de margen`:`faltan ${(10.5-draftGrade).toFixed(2)} pts`}
                </div>
              </div>
            )}
            {course.round_final && <span style={{ marginLeft:"auto",fontSize:10,color:"#818cf8",background:"rgba(129,140,248,.12)",borderRadius:5,padding:"2px 8px" }}>⌈⌉ nota final redondeada</span>}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={save} style={{ background:color,color:"#07070f",border:"none",borderRadius:8,padding:"7px 18px",fontSize:12,fontWeight:700,cursor:"pointer" }}>Guardar fórmula</button>
            <button onClick={() => setEditing(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:8,padding:"7px 12px",fontSize:12,cursor:"pointer" }}>Cancelar</button>
            <button onClick={() => setDraft("")} style={{ background:"none",border:"none",color:"#f87171",fontSize:11,cursor:"pointer",marginLeft:"auto",opacity:.6 }}>Limpiar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AcademicSheet({ course, nodes, computeNode, updateEvalNode, deleteEvalNode, saveEvalNode, inputStyle, t, isOwn, onFormulaChange }) {
  const color = course.color;
  const [addingTo, setAddingTo] = useState(null); // null | "root" | "root-leaf" | groupId
  const [addForm, setAddForm]   = useState({ name:"", weight:"", round:false, subFormula:"", date:"" });

  const mkVar = (name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.slice(0,5).toUpperCase().replace(/[^A-Z0-9]/g,"");
    return words.map(w => w[0]||"").join("").toUpperCase().slice(0,7);
  };

  const roots        = nodes.filter(n => !n.parent_id);
  const orphanLeaves = roots.filter(n => n.type === "leaf");
  const groups       = roots.filter(n => n.type !== "leaf");

  const finalGrade = (() => {
    const fml = course.formula_text || "";
    if (!fml.trim()) return null;
    const vars = {};
    roots.forEach(n => { const s = computeNode(n, nodes); if (s !== null) vars[n.var_name] = s; });
    nodes.filter(n=>n.type==="leaf").forEach(n => { const s = computeNode(n, nodes); if (s !== null && !vars[n.var_name]) vars[n.var_name] = s; });
    if (!Object.keys(vars).length) return null;
    try {
      const expr = fml.replace(/[A-Za-z_][A-Za-z0-9_]*/g, m => vars[m] !== undefined ? vars[m] : "0");
      const r = Function('"use strict"; return (' + expr + ')')();
      if (isNaN(r) || !isFinite(r)) return null;
      let final = Math.max(0, Math.min(20, r));
      if (course.round_final) final = Math.round(final * 2) / 2;
      return final;
    } catch { return null; }
  })();

  const sc = (g) => g === null ? "#64748b" : g >= 14 ? "#34d399" : g >= 11 ? "#fb923c" : "#f87171";

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    const isGroup  = addingTo === "root";
    const parentId = (isGroup || addingTo === "root-leaf") ? null : addingTo;
    await saveEvalNode(course.id, parentId, {
      name:          addForm.name.trim(),
      var:           mkVar(addForm.name.trim()),
      type:          isGroup ? "group" : "leaf",
      weight:        Number(addForm.weight) || 0,
      round:         addForm.round,
      child_formula: addForm.subFormula || null,
      date:          addForm.date || null,
    });
    setAddForm({ name:"", weight:"", round:false, subFormula:"", date:"" });
    setAddingTo(null);
  };

  return (
    <div>
      {/* ── Promedio final + fórmula ── */}
      <div style={{ padding:"12px 16px",background:finalGrade!==null?(finalGrade>=10.5?"rgba(52,211,153,.05)":"rgba(248,113,113,.05)"):t.input,border:`1px solid ${finalGrade!==null?(finalGrade>=10.5?"rgba(52,211,153,.25)":"rgba(248,113,113,.25)"):t.border}`,borderRadius:12,marginBottom:14 }}>
        <div style={{ display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:8.5,color:t.textFaint,letterSpacing:.5,marginBottom:2 }}>PROMEDIO FINAL</div>
            <div style={{ fontSize:32,fontWeight:900,lineHeight:1,color:sc(finalGrade) }}>
              {finalGrade!==null?finalGrade.toFixed(2):"—"}
            </div>
          </div>
          {finalGrade!==null && (
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:13,fontWeight:700,color:finalGrade>=10.5?"#34d399":"#f87171" }}>{finalGrade>=10.5?"✅ Aprueba":"❌ Desaprueba"}</div>
              <div style={{ fontSize:10.5,color:t.textFaint }}>{finalGrade>=10.5?`${(finalGrade-10.5).toFixed(2)} pts de margen`:`faltan ${(10.5-finalGrade).toFixed(2)} pts`}</div>
            </div>
          )}
          <div style={{ flex:1,minWidth:200 }}>
            <AcadFormulaEditor color={color} course={course} topLevel={roots} nodes={nodes}
              computeNode={computeNode} inputStyle={inputStyle} t={t}
              isOwn={isOwn} onFormulaChange={onFormulaChange}/>
          </div>
        </div>
      </div>

      {/* ── Lista vacía ── */}
      {roots.length === 0 && !addingTo && (
        <div style={{ textAlign:"center",padding:"28px 0",color:t.textFaint,fontSize:13 }}>
          Sin evaluaciones. Empieza agregando un grupo (ej: "Prácticas") o una nota suelta.
        </div>
      )}

      {/* ── Grupos ── */}
      {groups.map(n => (
        <AcadGroupBlock key={n.id} node={n} nodes={nodes} courseId={course.id} color={color}
          isOwn={isOwn} computeNode={computeNode}
          updateEvalNode={updateEvalNode} deleteEvalNode={deleteEvalNode}
          inputStyle={inputStyle} t={t}
          addingTo={addingTo} setAddingTo={setAddingTo}
          addForm={addForm} setAddForm={setAddForm} onAddSave={handleAdd}/>
      ))}

      {/* ── Notas sueltas ── */}
      {orphanLeaves.map(n => (
        <AcadLeafRow key={n.id} node={n} courseId={course.id} isOwn={isOwn}
          updateEvalNode={updateEvalNode} deleteEvalNode={deleteEvalNode}
          inputStyle={inputStyle} t={t}/>
      ))}

      {/* ── Forms de agregar en el root ── */}
      {isOwn && addingTo === "root" && (
        <AcadAddRowForm color={color} inputStyle={inputStyle} t={t}
          form={addForm} setForm={setAddForm} onSave={handleAdd}
          onCancel={() => setAddingTo(null)} isLeaf={false}/>
      )}
      {isOwn && addingTo === "root-leaf" && (
        <AcadAddRowForm color={color} inputStyle={inputStyle} t={t}
          form={addForm} setForm={setAddForm} onSave={handleAdd}
          onCancel={() => setAddingTo(null)} isLeaf={true}/>
      )}

      {/* ── Botones ── */}
      {isOwn && !addingTo && (
        <div style={{ display:"flex",gap:8,marginTop:8,flexWrap:"wrap" }}>
          <button onClick={() => { setAddingTo("root"); setAddForm({name:"",weight:"",round:false,subFormula:"",date:""}); }}
            style={{ background:color+"18",border:`1px solid ${color}40`,color,borderRadius:9,padding:"7px 15px",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
            <Plus size={11}/> Grupo de evaluaciones
          </button>
          <button onClick={() => { setAddingTo("root-leaf"); setAddForm({name:"",weight:"",round:false,subFormula:"",date:""}); }}
            style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textSub,borderRadius:9,padding:"7px 15px",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
            <Plus size={11}/> Nota suelta
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Legacy stubs (kept for computeNode/computeCourseAvg compatibility) ──────
function EvalAddForm({ courseId, parentId, color, allNodes, autoVar, saveEvalNode, setEvalAddParent, inputStyle, t }) {
  const [f, setF] = useState({name:"",var:"",type:"leaf",round:false,modifier:false,modifierOp:"+",modifierTarget:"",weight:0,date:"",childFormula:""});
  const updateName = (n) => setF(p=>({...p,name:n,var:autoVar(n)}));
  return (
    <div className="slide-down" style={{ marginLeft:parentId?18:0,background:`${color}08`,border:`1px dashed ${color}50`,borderRadius:10,padding:"10px 12px",marginBottom:8 }}>
      <div style={{ fontSize:9.5,fontWeight:700,color,letterSpacing:.5,marginBottom:8 }}>NUEVA EVALUACIÓN{parentId?" (sub)":""}</div>
      <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:7 }}>
        <input value={f.name} onChange={e=>updateName(e.target.value)} placeholder="Nombre (ej: Nota de Trabajos)" style={{ flex:1,minWidth:150,...inputStyle,padding:"5px 9px",fontSize:11 }} autoFocus/>
        <input value={f.var} onChange={e=>setF(p=>({...p,var:e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g,"")}))} placeholder="VAR" title="Variable para la fórmula" style={{ width:70,...inputStyle,padding:"5px 7px",fontSize:11,fontFamily:"monospace" }}/>
        <select value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))} style={{...inputStyle,padding:"5px 8px",fontSize:11}}>
          <option value="leaf">Hoja — nota directa</option>
          <option value="weighted">Ponderado por hijos</option>
          <option value="formula">Fórmula propia</option>
        </select>
        <input type="number" value={f.weight} onChange={e=>setF(p=>({...p,weight:e.target.value}))} placeholder="Peso %" title="Peso en el padre" style={{ width:70,...inputStyle,padding:"5px 7px",fontSize:11 }}/>
      </div>
      <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:7 }}>
        <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.textMuted,cursor:"pointer" }}><input type="checkbox" checked={f.round} onChange={e=>setF(p=>({...p,round:e.target.checked}))}/> Redondear (0.5 → 1)</label>
        <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.textMuted,cursor:"pointer" }}><input type="checkbox" checked={f.modifier} onChange={e=>setF(p=>({...p,modifier:e.target.checked}))}/> Es modificador</label>
        {f.modifier&&<>
          <select value={f.modifierOp} onChange={e=>setF(p=>({...p,modifierOp:e.target.value}))} style={{...inputStyle,padding:"4px 6px",fontSize:11,width:60}}>
            <option value="+">+</option><option value="-">−</option><option value="*">×</option>
          </select>
          <input value={f.modifierTarget} onChange={e=>setF(p=>({...p,modifierTarget:e.target.value.toUpperCase()}))} placeholder="VAR objetivo (vacío=padre)" style={{ width:150,...inputStyle,padding:"4px 7px",fontSize:11,fontFamily:"monospace" }}/>
        </>}
        <input type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))} title="Fecha → se agrega al calendario" style={{...inputStyle,padding:"4px 7px",fontSize:11}}/>
      </div>
      {f.type==="formula"&&(
        <div style={{ marginBottom:7 }}>
          <div style={{ fontSize:9.5,color:t.textMuted,marginBottom:4 }}>Fórmula interna — usará los VARs de los hijos que agregues después</div>
          <input value={f.childFormula} onChange={e=>setF(p=>({...p,childFormula:e.target.value}))} placeholder="ej: (PC1+PC2+PC3)/3*0.6 + EXP*0.4" style={{ width:"100%",...inputStyle,padding:"5px 9px",fontSize:11,fontFamily:"monospace" }}/>
        </div>
      )}
      <div style={{ display:"flex",gap:7 }}>
        <button onClick={()=>saveEvalNode(courseId,parentId||null,{...f,child_formula:f.childFormula})} style={{ background:color,color:"#07070f",border:"none",padding:"5px 14px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer" }}>+ Agregar</button>
        <button onClick={()=>setEvalAddParent(null)} style={{ background:"none",border:"none",color:t.textMuted,padding:5,fontSize:11,cursor:"pointer" }}>Cancelar</button>
      </div>
    </div>
  );
}

function EvalNode({ node, allNodes, courseId, color, depth=0, computeNode, updateEvalNode, deleteEvalNode, saveEvalNode, evalEditNode, setEvalEditNode, evalAddParent, setEvalAddParent, autoVar, inputStyle, t }) {
  const children = allNodes.filter(n=>n.parent_id===node.id);
  const score = computeNode(node, allNodes);
  const isEditing = evalEditNode?.id === node.id;
  const isAddingChild = evalAddParent === node.id;
  const scoreColor = score===null?"#64748b":score>=14?"#34d399":score>=11?"#fb923c":"#f87171";
  const indent = Math.min(depth * 14, 42); // cap indent on mobile
  const sharedProps = { computeNode, updateEvalNode, deleteEvalNode, saveEvalNode, evalEditNode, setEvalEditNode, evalAddParent, setEvalAddParent, autoVar, inputStyle, t };

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 10px",marginLeft:indent,background:depth===0?`${color}0a`:"transparent",borderLeft:depth>0?`2px solid ${color}20`:"none",borderRadius:depth===0?10:0,marginBottom:3,flexWrap:"nowrap",minWidth:0 }}>
        <div style={{ width:7,height:7,minWidth:7,borderRadius:"50%",background:node.modifier?"#f59e0b":node.type==="leaf"?color:node.type==="weighted"?"#818cf8":"#34d399",flexShrink:0 }}/>
        <div style={{ flex:1,minWidth:0,overflow:"hidden" }}>
          <div style={{ display:"flex",alignItems:"center",gap:5,flexWrap:"wrap" }}>
            <span style={{ fontSize:12,color:t.text,fontWeight:depth===0?600:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:160 }}>{node.name}</span>
            <span style={{ fontSize:8.5,color:t.textFaint,background:t.input,borderRadius:4,padding:"1px 4px",fontFamily:"monospace",border:`1px solid ${t.inputBdr}`,flexShrink:0 }}>{node.var_name}</span>
            {node.round&&<span style={{ fontSize:8,color:"#818cf8",background:"rgba(129,140,248,.1)",borderRadius:4,padding:"1px 4px",flexShrink:0 }}>⌈⌉</span>}
            {node.date&&<span style={{ fontSize:8.5,color:t.textFaint,flexShrink:0 }}>{node.date.slice(5)}</span>}
          </div>
          {node.type!=="leaf"&&Number(node.weight)>0&&<div style={{ fontSize:9,color:t.textFaint,marginTop:1 }}>{node.weight}% · {children.length} sub</div>}
        </div>
        {node.type==="leaf"?(
          <input type="number" min="0" max="20" step="0.5"
            value={node.score??""} placeholder="—"
            onChange={e=>updateEvalNode(courseId,node.id,{score:e.target.value===""?null:Number(e.target.value)})}
            style={{ width:48,minWidth:48,textAlign:"center",...inputStyle,padding:"4px 4px",fontSize:14,fontWeight:700,color:scoreColor,background:score!==null?scoreColor+"12":t.input,border:`1px solid ${score!==null?scoreColor+"40":t.inputBdr}` }}/>
        ):(
          <div style={{ minWidth:40,textAlign:"right",fontSize:14,fontWeight:800,color:scoreColor,flexShrink:0 }}>{score!==null?score.toFixed(1):"—"}</div>
        )}
        <div style={{ display:"flex",gap:1,flexShrink:0 }}>
          <button onClick={()=>setEvalAddParent(node.id)} title="Agregar sub" style={{ background:"none",border:"none",color:t.textFaint,padding:"3px 4px",cursor:"pointer",display:"flex",opacity:.6 }}><Plus size={11}/></button>
          <button onClick={()=>setEvalEditNode(isEditing?null:{...node})} style={{ background:"none",border:"none",color:t.textFaint,padding:"3px 4px",cursor:"pointer",display:"flex",opacity:.6 }}><Pencil size={10}/></button>
          <button onClick={()=>deleteEvalNode(courseId,node.id)} style={{ background:"none",border:"none",color:"#f87171",padding:"3px 4px",cursor:"pointer",display:"flex",opacity:.5 }}><Trash2 size={10}/></button>
        </div>
      </div>

      {isEditing&&(
        <div className="slide-down" style={{ marginLeft:indent+10,background:t.input,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 12px",marginBottom:6 }}>
          <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:7 }}>
            <input value={evalEditNode.name} onChange={e=>setEvalEditNode(p=>({...p,name:e.target.value}))} placeholder="Nombre" style={{ flex:1,minWidth:120,...inputStyle,padding:"6px 9px",fontSize:12 }}/>
            <input value={evalEditNode.var_name||""} onChange={e=>setEvalEditNode(p=>({...p,var_name:e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g,"")}))} placeholder="VAR" style={{ width:65,...inputStyle,padding:"6px 7px",fontSize:11,fontFamily:"monospace" }}/>
            <select value={evalEditNode.type} onChange={e=>setEvalEditNode(p=>({...p,type:e.target.value}))} style={{...inputStyle,padding:"6px 8px",fontSize:11,flex:1,minWidth:120}}>
              <option value="leaf">Hoja (nota directa)</option>
              <option value="weighted">Ponderado</option>
              <option value="formula">Fórmula propia</option>
            </select>
            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
              <span style={{ fontSize:10,color:t.textMuted,whiteSpace:"nowrap" }}>Peso %</span>
              <input type="number" value={evalEditNode.weight||0} onChange={e=>setEvalEditNode(p=>({...p,weight:e.target.value}))} style={{ width:55,...inputStyle,padding:"6px 6px",fontSize:11 }}/>
            </div>
          </div>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:7 }}>
            <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.textMuted,cursor:"pointer" }}><input type="checkbox" checked={!!evalEditNode.round} onChange={e=>setEvalEditNode(p=>({...p,round:e.target.checked}))}/> Redondear</label>
            <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.textMuted,cursor:"pointer" }}><input type="checkbox" checked={!!evalEditNode.modifier} onChange={e=>setEvalEditNode(p=>({...p,modifier:e.target.checked}))}/> Es modificador</label>
            {evalEditNode.modifier&&<>
              <select value={evalEditNode.modifier_op||"+"} onChange={e=>setEvalEditNode(p=>({...p,modifier_op:e.target.value}))} style={{...inputStyle,padding:"4px 6px",fontSize:11,width:60}}>
                <option value="+">+</option><option value="-">−</option><option value="*">×</option>
              </select>
              <input value={evalEditNode.modifier_target||""} onChange={e=>setEvalEditNode(p=>({...p,modifier_target:e.target.value.toUpperCase()}))} placeholder="Objetivo VAR" style={{ width:130,...inputStyle,padding:"4px 7px",fontSize:11,fontFamily:"monospace" }}/>
            </>}
            <input type="date" value={evalEditNode.date||""} onChange={e=>setEvalEditNode(p=>({...p,date:e.target.value}))} style={{...inputStyle,padding:"5px 7px",fontSize:11}}/>
          </div>
          {evalEditNode.type==="formula"&&(
            <div style={{ marginBottom:7 }}>
              <div style={{ fontSize:9.5,color:t.textFaint,marginBottom:4 }}>Fórmula interna (usa VARs de los hijos)</div>
              <input value={evalEditNode.child_formula||""} onChange={e=>setEvalEditNode(p=>({...p,child_formula:e.target.value}))} placeholder="ej: (PC1+PC2+PC3)/3" style={{ width:"100%",...inputStyle,padding:"6px 9px",fontSize:11,fontFamily:"monospace" }}/>
            </div>
          )}
          <div style={{ display:"flex",gap:7 }}>
            <button onClick={async()=>{await updateEvalNode(courseId,evalEditNode.id,{name:evalEditNode.name,var_name:evalEditNode.var_name,type:evalEditNode.type,round:!!evalEditNode.round,weight:Number(evalEditNode.weight)||0,modifier:!!evalEditNode.modifier,modifier_op:evalEditNode.modifier_op||null,modifier_target:evalEditNode.modifier_target||null,date:evalEditNode.date||null,child_formula:evalEditNode.child_formula||null});setEvalEditNode(null);}} style={{ background:color,color:"#07070f",border:"none",padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer" }}>Guardar</button>
            <button onClick={()=>setEvalEditNode(null)} style={{ background:"none",border:"none",color:t.textMuted,padding:5,fontSize:12,cursor:"pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {isAddingChild&&(
        <EvalAddForm courseId={courseId} parentId={node.id} color={color} allNodes={allNodes} autoVar={autoVar} saveEvalNode={saveEvalNode} setEvalAddParent={setEvalAddParent} inputStyle={inputStyle} t={t}/>
      )}

      {children.map(child=>(
        <EvalNode key={child.id} node={child} allNodes={allNodes} courseId={courseId} color={color} depth={depth+1} {...sharedProps}/>
      ))}
    </div>
  );
}

function FormulaBuilder({ courseId, color, nodes, formulaBlocks, saveFormulaBlocks, computeNode, inputStyle, t }) {
  const roots = nodes.filter(n=>!n.parent_id&&!n.modifier);
  const blocks = formulaBlocks || [];
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const OPERATORS = ["+","-","*","/","(",")",
    "0.1","0.15","0.2","0.25","0.3","0.35","0.4","0.45","0.5","0.6","0.7","0.8","0.9",
    "2","3","4","5","10"];

  const addBlock = (type, value) => saveFormulaBlocks([...blocks,{id:Date.now()+"_"+Math.random(),type,value}]);
  const removeBlock = (idx) => saveFormulaBlocks(blocks.filter((_,i)=>i!==idx));
  const moveBlock = (from, to) => {
    const arr=[...blocks]; const [item]=arr.splice(from,1); arr.splice(to,0,item);
    saveFormulaBlocks(arr);
  };

  const vars = {};
  roots.forEach(r=>{const s=computeNode(r,nodes);if(s!==null)vars[r.var_name]=s;});

  let preview=null;
  if(blocks.length){
    try{
      const expr=blocks.map(b=>b.type==="var"?(vars[b.value]!==undefined?String(vars[b.value]):"0"):b.value).join(" ");
      const r=Function('"use strict"; return ('+expr+')')();
      preview=isNaN(r)?null:Math.max(0,Math.min(20,r));
    }catch{}
  }

  if(roots.length===0) return <p style={{ fontSize:12,color:t.textFaint }}>Primero agrega evaluaciones principales en la pestaña "Evaluaciones".</p>;

  return (
    <div>
      <div style={{ fontSize:9.5,color:t.textFaint,letterSpacing:.6,fontWeight:700,marginBottom:8 }}>EVALUACIONES PRINCIPALES (variables)</div>
      <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:14 }}>
        {roots.map(r=>{
          const s=computeNode(r,nodes);
          const sc=s===null?"#64748b":s>=14?"#34d399":s>=11?"#fb923c":"#f87171";
          return (
            <button key={r.id} onClick={()=>addBlock("var",r.var_name)} style={{ background:color+"15",border:`1px solid ${color}40`,color,borderRadius:9,padding:"5px 13px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
              {r.var_name}
              {s!==null&&<span style={{ fontSize:10,color:sc,fontWeight:800,background:sc+"18",borderRadius:5,padding:"0 5px" }}>{s.toFixed(2)}</span>}
            </button>
          );
        })}
        <div style={{ width:1,background:t.border,margin:"0 4px",alignSelf:"stretch" }}/>
        <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
          {OPERATORS.map(op=>(
            <button key={op} onClick={()=>addBlock("op",op)} style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:8,padding:"5px 10px",fontSize:12,fontFamily:"monospace",fontWeight:600,cursor:"pointer" }}>{op}</button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:9.5,color:t.textFaint,letterSpacing:.6,fontWeight:700,marginBottom:8 }}>CONSTRUCTOR (arrastra los bloques para reordenar · ✕ para borrar)</div>
      <div onDragOver={e=>e.preventDefault()} style={{ minHeight:54,background:t.input,border:`1.5px ${blocks.length?"solid":"dashed"} ${blocks.length?color+"50":t.inputBdr}`,borderRadius:12,padding:"10px 12px",display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginBottom:14,transition:"border-color .2s" }}>
        {blocks.length===0&&<span style={{ fontSize:12,color:t.textFaint }}>← Click en las variables y operadores para armar la fórmula</span>}
        {blocks.map((b,i)=>(
          <div key={b.id} draggable
            onDragStart={()=>setDragIdx(i)}
            onDragOver={e=>{e.preventDefault();setDragOver(i);}}
            onDrop={()=>{if(dragIdx!==null&&dragIdx!==i)moveBlock(dragIdx,i);setDragIdx(null);setDragOver(null);}}
            onDragEnd={()=>{setDragIdx(null);setDragOver(null);}}
            style={{ display:"flex",alignItems:"center",gap:4,background:b.type==="var"?color+"22":t.bgCard,border:`1.5px solid ${b.type==="var"?color+"60":t.border}`,borderRadius:8,padding:"5px 11px",cursor:"grab",opacity:dragIdx===i?.35:1,outline:dragOver===i?`2px solid ${color}`:"none",userSelect:"none" }}>
            <span style={{ fontSize:13,fontWeight:b.type==="var"?700:500,color:b.type==="var"?color:t.text,fontFamily:b.type==="op"?"monospace":"inherit" }}>{b.value}</span>
            <button onClick={()=>removeBlock(i)} style={{ background:"none",border:"none",color:t.textFaint,padding:"0 0 0 2px",cursor:"pointer",display:"flex",lineHeight:1 }}><X size={9}/></button>
          </div>
        ))}
      </div>

      {blocks.length>0&&(
        <div style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:preview!==null?(preview>=10.5?"rgba(52,211,153,.07)":"rgba(248,113,113,.07)"):t.input,border:`1px solid ${preview!==null?(preview>=10.5?"rgba(52,211,153,.3)":"rgba(248,113,113,.3)"):t.border}`,borderRadius:12 }}>
          <div>
            <div style={{ fontSize:9,color:t.textFaint,marginBottom:2 }}>NOTA FINAL</div>
            <div style={{ fontSize:26,fontWeight:900,color:preview===null?"#64748b":preview>=14?"#34d399":preview>=11?"#fb923c":"#f87171",lineHeight:1 }}>{preview!==null?preview.toFixed(2):"—"}</div>
          </div>
          {preview!==null&&<div style={{ fontSize:12,color:preview>=10.5?"#34d399":"#f87171",fontWeight:700 }}>
            {preview>=10.5?"✅ Aprueba":"❌ Desaprueba"}<br/>
            <span style={{ fontWeight:400,color:t.textFaint,fontSize:10 }}>{preview>=10.5?`${(preview-10.5).toFixed(2)} pts de margen`:`faltan ${(10.5-preview).toFixed(2)} pts`}</span>
          </div>}
          <button onClick={()=>saveFormulaBlocks([])} style={{ marginLeft:"auto",background:"none",border:"none",color:"#f87171",fontSize:11,cursor:"pointer",opacity:.7 }}>Limpiar</button>
        </div>
      )}
    </div>
  );
}

function NotasTab({ courseId, color, nodes, computeNode, updateEvalNode, inputStyle, t }) {
  const leaves = nodes.filter(n=>n.type==="leaf");
  if(!leaves.length) return <p style={{ fontSize:12,color:t.textFaint,padding:"8px 0" }}>No hay evaluaciones hoja aún. Agrégalas en "Evaluaciones".</p>;

  const getParentLabel = (node) => {
    const parts=[];
    let cur=nodes.find(n=>n.id===node.parent_id);
    while(cur){parts.unshift(cur.name);cur=nodes.find(n=>n.id===cur.parent_id);}
    return parts.join(" › ");
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      {leaves.map(leaf=>{
        const sNum=leaf.score!==null&&leaf.score!==undefined?Number(leaf.score):null;
        const sc=sNum===null?"#64748b":sNum>=14?"#34d399":sNum>=11?"#fb923c":"#f87171";
        const parentLabel=getParentLabel(leaf);
        return (
          <div key={leaf.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:t.bgCard,border:`1px solid ${sNum!==null?sc+"30":t.border}`,borderRadius:11 }}>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:12.5,color:t.text,fontWeight:500 }}>{leaf.name}{leaf.round&&<span style={{ fontSize:9,color:"#818cf8",marginLeft:6 }}>⌈⌉</span>}</div>
              {parentLabel&&<div style={{ fontSize:10,color:t.textFaint,marginTop:1 }}>{parentLabel}</div>}
              {leaf.date&&<div style={{ fontSize:9.5,color:t.textFaint }}>{leaf.date}</div>}
            </div>
            {Number(leaf.weight)>0&&<span style={{ fontSize:9.5,color:t.textFaint,background:t.input,borderRadius:99,padding:"2px 7px",border:`1px solid ${t.inputBdr}` }}>{leaf.weight}%</span>}
            <input type="number" min="0" max="20" step="0.5"
              value={sNum??""} placeholder="—"
              onChange={e=>updateEvalNode(courseId,leaf.id,{score:e.target.value===""?null:Number(e.target.value)})}
              style={{ width:62,textAlign:"center",...inputStyle,padding:"4px 6px",fontSize:15,fontWeight:800,color:sc,background:sNum!==null?sc+"12":t.input,border:`1px solid ${sNum!==null?sc+"40":t.inputBdr}` }}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── FRIEND REQUESTS CARD ────────────────────────────────────────────────────
function FriendRequestsCard({ user, profiles, t, inputStyle, accent, reloadProfiles }) {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null); // {found, profile}
  const [searching, setSearching]   = useState(false);
  const [requests,  setRequests]    = useState([]);  // pending incoming
  const [sent,      setSent]        = useState([]);  // sent by me
  const [friends,   setFriends]     = useState([]);  // accepted
  const [msg,       setMsg]         = useState("");

  const cardInner = {
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 14, padding: "14px 16px",
  };

  useEffect(() => { loadAll(); }, [user.id]);

  const loadAll = async () => {
    const { data: inc } = await supabase.from("friend_requests")
      .select("*, sender:profiles!friend_requests_from_uid_fkey(id,name,initials,accent,avatar)")
      .eq("to_uid", user.id).eq("status", "pending");
    const { data: out } = await supabase.from("friend_requests")
      .select("*, receiver:profiles!friend_requests_to_uid_fkey(id,name,initials,accent,avatar)")
      .eq("from_uid", user.id).eq("status", "pending");
    const { data: acc } = await supabase.from("friend_requests")
      .select("*, sender:profiles!friend_requests_from_uid_fkey(id,name,initials,accent,avatar), receiver:profiles!friend_requests_to_uid_fkey(id,name,initials,accent,avatar)")
      .or(`from_uid.eq.${user.id},to_uid.eq.${user.id}`).eq("status", "accepted");
    setRequests(inc || []);
    setSent(out || []);
    setFriends((acc || []).map(r => r.from_uid === user.id ? r.receiver : r.sender).filter(Boolean));
  };

  const searchUser = async () => {
    if (!searchEmail.trim() || searching) return;
    setSearching(true); setSearchResult(null); setMsg("");
    try {
      const { data, error } = await supabase.from("profiles").select("*")
        .ilike("email", searchEmail.trim()).neq("id", user.id).limit(1);
      if (error) throw error;
      if (data?.length) setSearchResult({ found: true, profile: data[0] });
      else setSearchResult({ found: false });
    } catch(e) {
      setMsg("Error al buscar: " + e.message);
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (toProfile) => {
    // Check not already sent or friends
    const alreadySent = sent.some(r => r.to_uid === toProfile.id);
    const alreadyFriend = friends.some(f => f.id === toProfile.id);
    const alreadyIncoming = requests.some(r => r.from_uid === toProfile.id);
    if (alreadySent)    return setMsg("Ya le enviaste una solicitud.");
    if (alreadyFriend)  return setMsg("Ya son amigos.");
    if (alreadyIncoming) return setMsg("Esa persona ya te envió una solicitud. ¡Acéptala abajo!");
    const { error } = await supabase.from("friend_requests")
      .insert({ from_uid: user.id, to_uid: toProfile.id, status: "pending" });
    if (error) setMsg("Error: " + error.message);
    else { setMsg(`✅ Solicitud enviada a ${toProfile.name}`); setSearchEmail(""); setSearchResult(null); loadAll(); }
  };

  const respond = async (reqId, accept) => {
    await supabase.from("friend_requests").update({ status: accept ? "accepted" : "rejected" }).eq("id", reqId);
    loadAll();
    if (accept && reloadProfiles) reloadProfiles();
  };

  const removeFriend = async (friendId) => {
    confirmModal(
      "¿Eliminar conexión?",
      "Dejarán de ver el contenido compartido entre ustedes.",
      async () => {
        await supabase.from("friend_requests")
          .delete()
          .or(`and(from_uid.eq.${user.id},to_uid.eq.${friendId}),and(from_uid.eq.${friendId},to_uid.eq.${user.id})`);
        loadAll();
      },
      { danger: true }
    );
  };

  const AvatarChip = ({ p }) => (
    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
      {p.avatar
        ? <img src={p.avatar} style={{ width:28,height:28,borderRadius:8,objectFit:"cover",border:`1.5px solid ${p.accent}55`,flexShrink:0 }}/>
        : <div style={{ width:28,height:28,borderRadius:8,background:p.accent+"22",border:`1.5px solid ${p.accent}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9.5,fontWeight:700,color:p.accent,flexShrink:0 }}>{p.initials}</div>}
      <div>
        <div style={{ fontSize:12,fontWeight:600,color:t.text }}>{p.name}</div>
        <div style={{ fontSize:10,color:t.textMuted }}>{p.email}</div>
      </div>
    </div>
  );

  return (
    <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:18, padding:"18px 20px" }}>
      <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:16 }}>🔗 CONEXIONES</div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:6 }}>AGREGAR POR EMAIL</div>
        <div style={{ display:"flex",gap:8 }}>
          <input value={searchEmail} onChange={e=>setSearchEmail(e.target.value)}
            placeholder="email@ejemplo.com" type="email"
            onKeyDown={e=>e.key==="Enter"&&searchUser()}
            style={{ flex:1,...inputStyle }}/>
          <button onClick={searchUser} disabled={searching}
            style={{ background:accent,color:"#07070f",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0 }}>
            {searching?"...":"Buscar"}
          </button>
        </div>
        {msg && <div style={{ fontSize:11,color:msg.startsWith("✅")?accent:"#f87171",marginTop:6 }}>{msg}</div>}
        {searchResult && (
          <div style={{ ...cardInner, marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            {searchResult.found
              ? <><AvatarChip p={searchResult.profile}/>
                  <button onClick={()=>sendRequest(searchResult.profile)}
                    style={{ background:accent,color:"#07070f",border:"none",borderRadius:9,padding:"7px 14px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0 }}>
                    Conectar
                  </button></>
              : <span style={{ fontSize:12,color:t.textMuted }}>No se encontró ningún usuario con ese email.</span>}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {requests.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:8 }}>SOLICITUDES RECIBIDAS</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {requests.map(r => (
              <div key={r.id} style={{ ...cardInner, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                <AvatarChip p={r.sender}/>
                <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                  <button onClick={()=>respond(r.id, true)}
                    style={{ background:accent,color:"#07070f",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer" }}>
                    Aceptar
                  </button>
                  <button onClick={()=>respond(r.id, false)}
                    style={{ background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer" }}>
                    Ignorar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent pending */}
      {sent.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:8 }}>ENVIADAS (pendientes)</div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {sent.map(r => (
              <div key={r.id} style={{ ...cardInner, display:"flex", alignItems:"center", justifyContent:"space-between", opacity:.7 }}>
                <AvatarChip p={r.receiver}/>
                <span style={{ fontSize:10,color:t.textFaint }}>Pendiente…</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      {friends.length > 0 ? (
        <div>
          <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:8 }}>CONECTADOS</div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {friends.map(f => (
              <div key={f.id} style={{ ...cardInner, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <AvatarChip p={f}/>
                <button onClick={()=>removeFriend(f.id)}
                  style={{ background:"none",border:"none",color:t.textFaint,cursor:"pointer",fontSize:10,padding:4 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize:11,color:t.textFaint,textAlign:"center",padding:"12px 0" }}>
          Sin conexiones todavía. Busca a alguien por email para conectarte.
        </div>
      )}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }) {
  const [mode,       setMode]       = useState("login");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [name,       setName]       = useState("");
  const [accent,     setAccent]     = useState("#34d399");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [info,       setInfo]       = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-cycle feature cards
  useEffect(() => {
    const iv = setInterval(() => setActiveFeature(i => (i + 1) % FEATURES.length), 3200);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = async () => {
    setError(""); setInfo("");
    if (!email.trim()) return setError("Ingresa tu email.");
    if (mode !== "forgot" && !password) return setError("Ingresa una contraseña.");
    if (mode === "register" && !name.trim()) return setError("Ingresa tu nombre.");
    if (mode === "register" && password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (e) throw e;
      } else if (mode === "register") {
        const { error: e } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { name: name.trim(), accent } },
        });
        if (e) throw e;
        setInfo("¡Cuenta creada! Revisa tu email para confirmar.");
        setMode("login");
      } else if (mode === "forgot") {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
        if (e) throw e;
        setInfo("Te enviamos un link para restablecer tu contraseña.");
        setMode("login");
      }
    } catch (e) {
      const msgs = {
        "Invalid login credentials": "Email o contraseña incorrectos.",
        "Email not confirmed":       "Confirma tu email antes de entrar.",
        "User already registered":   "Ya existe una cuenta con ese email.",
      };
      setError(msgs[e.message] || e.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin, queryParams: { access_type:"offline", prompt:"consent" } },
    });
    if (e) {
      setError(e.message?.includes("not enabled") || e.message?.includes("Unsupported provider")
        ? "Google no está activado aún. Actívalo en Supabase → Authentication → Providers → Google."
        : e.message);
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon:"✅", color:"#34d399", title:"Tareas inteligentes",    desc:"Prioridades, categorías, subtareas y fecha límite. Nunca pierdas el hilo." },
    { icon:"🔥", color:"#fb923c", title:"Hábitos con racha",      desc:"Registra hábitos diarios y ve crecer tu racha. Cada día cuenta." },
    { icon:"🎓", color:"#818cf8", title:"Módulo académico",       desc:"Cursos, grupos de evaluaciones y fórmula de promedio personalizada." },
    { icon:"💰", color:"#f59e0b", title:"Control de finanzas",    desc:"Ingresos, gastos por categoría y balance mensual de un vistazo." },
    { icon:"📅", color:"#38bdf8", title:"Planner & Calendario",   desc:"Planifica tu semana con bloques de tiempo y eventos sincronizados." },
    { icon:"⚔️", color:"#f87171", title:"Retos con amigos",       desc:"Compite con tus amigos por metas semanales y gana XP." },
  ];

  const inp = {
    width:"100%", background:"rgba(255,255,255,.055)", border:"1px solid rgba(255,255,255,.09)",
    borderRadius:12, padding:"12px 16px", color:"#e2e8f0", fontSize:14,
    fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box", transition:"border-color .2s",
  };

  return (
    <div style={{ position:"fixed",inset:0,fontFamily:"'Outfit',sans-serif",display:"flex",overflow:"hidden",background:"#07070f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes liFadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes liSlideIn{from{opacity:0;transform:translateX(-18px);}to{opacity:1;transform:translateX(0);}}
        @keyframes floatBg{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
        @keyframes featureIn{from{opacity:0;transform:translateY(10px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        .li-up{animation:liFadeUp .55s cubic-bezier(.16,1,.3,1) both;}
        .li-up-1{animation:liFadeUp .55s .08s cubic-bezier(.16,1,.3,1) both;}
        .li-up-2{animation:liFadeUp .55s .16s cubic-bezier(.16,1,.3,1) both;}
        .li-up-3{animation:liFadeUp .55s .24s cubic-bezier(.16,1,.3,1) both;}
        .li-up-4{animation:liFadeUp .55s .32s cubic-bezier(.16,1,.3,1) both;}
        .li-slide{animation:liSlideIn .5s cubic-bezier(.16,1,.3,1) both;}
        .feat-card-active{animation:featureIn .4s cubic-bezier(.16,1,.3,1) both;}
        .li-inp:focus{border-color:${accent}!important;box-shadow:0 0 0 3px ${accent}18;}
        .li-google:hover{background:rgba(255,255,255,.12)!important;}
        .feat-dot{transition:all .3s;cursor:pointer;}
        @media(max-width:860px){.li-left{display:none!important;}.li-right{max-width:100%!important;width:100%!important;}}
        *{box-sizing:border-box;}
      `}</style>

      {/* Particles background */}
      <Particles accent={accent} dark={true}/>

      {/* ── LEFT PANEL — Feature Showcase ── */}
      <div className="li-left" style={{ flex:1,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",padding:"40px 48px",justifyContent:"space-between" }}>

        {/* Gradient blobs */}
        <div style={{ position:"absolute",top:-100,left:-100,width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${accent}14 0%,transparent 60%)`,pointerEvents:"none",animation:"floatBg 9s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",bottom:-80,right:-60,width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,#818cf812 0%,transparent 60%)`,pointerEvents:"none",animation:"floatBg 12s ease-in-out infinite reverse" }}/>

        {/* Brand */}
        <div className="li-slide" style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${accent},${accent}88)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 18px ${accent}50` }}>
            <span style={{ fontSize:17,filter:"brightness(0) invert(1)" }}>⚡</span>
          </div>
          <div style={{ fontSize:19,fontWeight:800,color:"#fff",letterSpacing:"-.5px" }}>
            2do<span style={{ color:accent }}>.</span>cerebro
          </div>
        </div>

        {/* Hero headline */}
        <div style={{ position:"relative",zIndex:1 }}>
          <div className="li-up" style={{ fontSize:"clamp(30px,3.2vw,46px)",fontWeight:900,color:"#fff",lineHeight:1.12,letterSpacing:"-1.5px",marginBottom:16 }}>
            Todo lo que necesitas<br/>
            para <span style={{ color:accent }}>rendir al máximo</span><br/>
            <span style={{ color:"#334155" }}>en un solo lugar.</span>
          </div>
          <p className="li-up-1" style={{ fontSize:14,color:"#64748b",lineHeight:1.75,maxWidth:380,marginBottom:36 }}>
            Diseñado para estudiantes universitarios que quieren controlar su tiempo, sus notas y su energía — sin complicaciones.
          </p>

          {/* Feature cards grid */}
          <div className="li-up-2" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:520 }}>
            {FEATURES.map((f, i) => {
              const isActive = activeFeature === i;
              return (
                <div key={i} onClick={() => setActiveFeature(i)}
                  className={isActive ? "feat-card-active" : ""}
                  style={{ background:isActive?`${f.color}12`:"rgba(255,255,255,.025)", border:`1px solid ${isActive?f.color+"40":"rgba(255,255,255,.06)"}`, borderRadius:14, padding:"14px 16px", cursor:"pointer", transition:"all .3s cubic-bezier(.4,0,.2,1)", transform:isActive?"translateY(-2px)":"none", boxShadow:isActive?`0 8px 24px ${f.color}18`:"none" }}>
                  <div style={{ fontSize:20, marginBottom:7 }}>{f.icon}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:isActive?f.color:"#64748b", marginBottom:4, letterSpacing:.2 }}>{f.title}</div>
                  <div style={{ fontSize:10, color:isActive?"#94a3b8":"#334155", lineHeight:1.5, transition:"color .3s" }}>{f.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div style={{ display:"flex",gap:6,marginTop:16 }}>
            {FEATURES.map((_,i) => (
              <div key={i} className="feat-dot" onClick={() => setActiveFeature(i)}
                style={{ width:activeFeature===i?20:5,height:5,borderRadius:99,background:activeFeature===i?accent:"rgba(255,255,255,.12)" }}/>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="li-up-3" style={{ position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:18 }}>
          <p style={{ fontSize:11,color:"#1e293b",fontStyle:"italic" }}>
            "La productividad no es hacer más — es hacer lo correcto."
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Auth form ── */}
      <div className="li-right" style={{ width:460,flexShrink:0,background:"rgba(7,7,15,.95)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 40px",overflowY:"auto",borderLeft:"1px solid rgba(255,255,255,.05)",position:"relative",zIndex:2 }}>
        <div style={{ width:"100%",maxWidth:340 }}>

          {/* Header */}
          <div className="li-up" style={{ marginBottom:28,textAlign:"center" }}>
            <div style={{ width:48,height:48,borderRadius:15,background:`linear-gradient(135deg,${accent}22,${accent}08)`,border:`1px solid ${accent}30`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:20 }}>⚡</div>
            <div style={{ fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-1px",marginBottom:5 }}>
              {mode==="login"?"Bienvenido":mode==="register"?"Crea tu cuenta":"Recuperar acceso"}
            </div>
            <div style={{ fontSize:12,color:"#475569",fontWeight:500 }}>
              {mode==="login"?"Inicia sesión para continuar":mode==="register"?"Empieza gratis hoy":"Te enviamos un link de recuperación"}
            </div>
          </div>

          {/* Google */}
          {mode !== "forgot" && (
            <div className="li-up-1">
              <button onClick={handleGoogle} disabled={loading} className="li-google"
                style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",color:"#e2e8f0",borderRadius:12,padding:"12px",fontSize:13,fontWeight:500,cursor:"pointer",marginBottom:18,transition:"background .2s" }}>
                <svg width="17" height="17" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continuar con Google
              </button>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
                <div style={{ flex:1,height:"1px",background:"rgba(255,255,255,.07)" }}/>
                <span style={{ fontSize:10,color:"#334155",fontWeight:600,letterSpacing:.8 }}>O CON EMAIL</span>
                <div style={{ flex:1,height:"1px",background:"rgba(255,255,255,.07)" }}/>
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="li-up-2" style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {mode === "register" && (
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre completo"
                className="li-inp" style={inp} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
            )}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"
              type="email" className="li-inp" style={inp} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
            {mode !== "forgot" && (
              <div style={{ position:"relative" }}>
                <input value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Contraseña" type={showPw?"text":"password"}
                  className="li-inp" style={{ ...inp,paddingRight:44 }}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
                <button onClick={()=>setShowPw(s=>!s)}
                  style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#475569",cursor:"pointer",padding:2,fontSize:13 }}>
                  {showPw?"🙈":"👁"}
                </button>
              </div>
            )}
            {mode === "register" && (
              <div style={{ paddingTop:2 }}>
                <div style={{ fontSize:10,color:"#475569",marginBottom:8,fontWeight:600,letterSpacing:.6 }}>TU COLOR DE ACENTO</div>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                  {ACCENT_PALETTE.map(c=>(
                    <button key={c} onClick={()=>setAccent(c)}
                      style={{ width:28,height:28,borderRadius:8,background:c,border:`2.5px solid ${c===accent?"#fff":"transparent"}`,cursor:"pointer",transition:"all .15s",boxShadow:c===accent?`0 0 10px ${c}80`:"none" }}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback */}
          {error && <div className="li-up" style={{ background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",borderRadius:10,padding:"11px 14px",fontSize:12,color:"#f87171",marginTop:12,lineHeight:1.6 }}>{error}</div>}
          {info  && <div className="li-up" style={{ background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.25)",borderRadius:10,padding:"11px 14px",fontSize:12,color:"#34d399",marginTop:12 }}>{info}</div>}

          {/* Submit */}
          <div className="li-up-3">
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:"100%",background:`linear-gradient(135deg,${accent},${accent}cc)`,color:"#07070f",border:"none",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:loading?"wait":"pointer",marginTop:14,opacity:loading?.7:1,transition:"all .2s",boxShadow:`0 4px 20px ${accent}35`,letterSpacing:"-.2px" }}>
              {loading?"Cargando…":mode==="login"?"Entrar →":mode==="register"?"Crear cuenta →":"Enviar link →"}
            </button>
          </div>

          {/* Mode switchers */}
          <div className="li-up-4" style={{ display:"flex",justifyContent:"center",gap:20,marginTop:18,flexWrap:"wrap" }}>
            {mode !== "login" && (
              <button onClick={()=>{setMode("login");setError("");setInfo("");}}
                style={{ background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,fontWeight:500 }}>
                ← Ya tengo cuenta
              </button>
            )}
            {mode !== "register" && (
              <button onClick={()=>{setMode("register");setError("");setInfo("");}}
                style={{ background:"none",border:"none",color:accent,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                Crear cuenta gratis
              </button>
            )}
            {mode === "login" && (
              <button onClick={()=>{setMode("forgot");setError("");setInfo("");}}
                style={{ background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:12 }}>
                Olvidé mi contraseña
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
function SkeletonLine({ w="100%", h=12, r=6, mb=0 }) {
  return <div style={{ width:w,height:h,borderRadius:r,background:"var(--sk-bg)",marginBottom:mb,flexShrink:0 }} className="sk"/>;
}
function SkeletonCard({ rows=3, t }) {
  return (
    <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px 18px",marginBottom:10 }}>
      <div style={{ display:"flex",gap:10,marginBottom:12,alignItems:"center" }}>
        <div style={{ width:32,height:32,borderRadius:9,background:"var(--sk-bg)",flexShrink:0 }} className="sk"/>
        <div style={{ flex:1 }}>
          <SkeletonLine w="60%" h={12} r={5} mb={6}/>
          <SkeletonLine w="35%" h={9} r={4}/>
        </div>
      </div>
      {Array.from({length:rows}).map((_,i)=>(
        <SkeletonLine key={i} w={i===rows-1?"55%":"100%"} h={10} r={4} mb={i<rows-1?8:0}/>
      ))}
    </div>
  );
}
function SkeletonTab({ t, count=3 }) {
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><SkeletonLine w={140} h={22} r={7} mb={8}/><SkeletonLine w={90} h={11} r={4}/></div>
        <div style={{ width:100,height:34,borderRadius:10,background:"var(--sk-bg)" }} className="sk"/>
      </div>
      {Array.from({length:count}).map((_,i)=><SkeletonCard key={i} t={t} rows={2+(i%2)}/>)}
    </div>
  );
}

// ─── HELP TIP ─────────────────────────────────────────────────────────────────
// Contextual tutorial tooltip — attach anywhere with <HelpTip id="tasks" t={t}/>
const HELP_CONTENT = {
  tasks:    { title:"Tareas", steps:["Crea una tarea con el botón '+' arriba a la derecha.","Asígnale prioridad (alta/media/baja), categoría y fecha límite.","Haz click en el círculo para cambiarla de estado: pendiente → en progreso → completada.","Usa el filtro de estado o categoría para encontrarlas rápido."] },
  habitos:  { title:"Hábitos", steps:["Crea un hábito nuevo con el botón '+'.","Cada día, marca el check para registrar que lo cumpliste.","La racha 🔥 se acumula por días consecutivos completados.","Los hábitos de cantidad (ej: 8 vasos de agua) te piden ingresar el valor del día."] },
  notas:    { title:"Notas", steps:["Crea notas de tipo Idea 💡, Journal 📖 u Objetivo 🎯.","Escribe en el editor de texto enriquecido. Puedes usar negritas, listas, etc.","Las notas marcadas como compartidas son visibles para tus amigos.","Usa la búsqueda global (lupa en la cabecera) para encontrar notas por contenido."] },
  finanzas: { title:"Finanzas", steps:["Registra ingresos (+) y gastos (−) con su categoría.","El panel superior muestra tu balance: ingresos − gastos del mes.","El gráfico de dona muestra en qué categorías gastas más.","Puedes filtrar por mes para ver el historial."] },
  academico:{ title:"Académico", steps:["Crea un curso con el botón 'Nuevo curso'. Asígnale créditos y color.","Dentro del curso, crea grupos de evaluaciones (ej: 'Prácticas', 'Exámenes').","Agrega evaluaciones individuales dentro de cada grupo e ingresa las notas.","Define la fórmula del promedio final (ej: PC*0.3 + EF*0.4) con el editor de fórmula.","El promedio ponderado de todos tus cursos se muestra en el dashboard."] },
  metas:    { title:"Metas y retos", steps:["Las metas semanales se reinician cada lunes automáticamente.","El progreso se calcula solo según lo que registras en la app (tareas, hábitos, etc.).","Los retos son competencias 1v1 con un amigo conectado. Lanza un reto con '+ Reto'.","Cuando alguien alcanza la meta del reto, aparece el botón 'Cerrar reto' para declarar ganador."] },
  planner:  { title:"Planner semanal", steps:["Arrastra el bloque de tiempo que quieras para crear un evento.","Los eventos de tipo 'Examen' se sincronizan con el módulo Académico.","Haz click en un evento existente para editarlo o eliminarlo.","Puedes filtrar por categoría usando los chips de colores arriba."] },
  focus:    { title:"Modo Focus", steps:["El temporizador Pomodoro usa ciclos de 25 min trabajo / 5 min descanso.","Escribe en qué estás trabajando para mantener el foco.","Después de 4 rondas se sugiere un descanso largo de 15 min.","Selecciona una estación de música lo-fi para acompañar tu sesión."] },
  feed:     { title:"Feed de actividad", steps:["El feed muestra tu actividad reciente y la de tus amigos conectados.","El comparativo XP te enfrenta con tu compañero en tiempo real.","Las metas compartidas aparecen aquí con su progreso de ambos."] },
};

function HelpTip({ id, t, accent }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const info = HELP_CONTENT[id];
  if (!info) return null;

  const openPopover = () => {
    if (open) { setOpen(false); return; }
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    // Place below the button, aligned to the left of it — but clamp to viewport
    const popW = 290;
    const left = Math.min(r.left, window.innerWidth - popW - 12);
    setPos({ top: r.bottom + 8, left: Math.max(12, left) });
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  return (
    <div style={{ position:"relative",display:"inline-flex",alignItems:"center",flexShrink:0 }}>
      <button
        ref={btnRef}
        onClick={openPopover}
        title={"Tutorial: " + info.title}
        style={{ background:open?accent+"22":"none",border:`1px solid ${open?accent+"60":t.inputBdr}`,borderRadius:99,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:open?accent:t.textFaint,fontSize:11,fontWeight:800,transition:"all .15s",flexShrink:0 }}>
        ?
      </button>
      {open && typeof document !== "undefined" && ReactDOM.createPortal(
        <div
          ref={popRef}
          style={{ position:"fixed",top:pos.top,left:pos.left,zIndex:10001,width:290,background:t.bgCard,border:`1px solid ${accent}40`,borderRadius:14,padding:"14px 16px",boxShadow:`0 8px 32px rgba(0,0,0,.35)`,animation:"slideDown .2s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
            <div style={{ fontSize:11,fontWeight:800,color:accent,letterSpacing:.4 }}>📖 {info.title.toUpperCase()}</div>
            <button onClick={() => setOpen(false)} style={{ background:"none",border:"none",color:t.textFaint,cursor:"pointer",padding:"0 2px",lineHeight:1,fontSize:16 }}>×</button>
          </div>
          <ol style={{ margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:7 }}>
            {info.steps.map((step, i) => (
              <li key={i} style={{ fontSize:11.5,color:t.textMuted,lineHeight:1.55 }}>{step}</li>
            ))}
          </ol>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── ONBOARDING BANNER ───────────────────────────────────────────────────────
// Shows only on first use (< 3 items total). Disappears permanently once dismissed.
function OnboardingBanner({ user, t, accent, tasks, habits, notes, events, onNavigate }) {
  const key = `onboarding_done_${user.id}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(key) === "1");

  const hasData = tasks.length + habits.length + notes.length + events.length >= 3;

  const dismiss = () => {
    localStorage.setItem(key, "1");
    setDismissed(true);
  };

  if (dismissed || hasData) return null;

  const steps = [
    { icon:"🔥", title:"Crea un hábito", desc:"Construye rutinas con streaks diarios.", tab:"habitos",  done: habits.length > 0  },
    { icon:"✅", title:"Agrega una tarea", desc:"Con prioridad, categoría y fecha límite.", tab:"tasks", done: tasks.length > 0  },
    { icon:"📅", title:"Agrega un evento", desc:"Examen, entrega, reunión — lo que sea.", tab:"calendar", done: events.length > 0  },
    { icon:"📝", title:"Escribe una nota", desc:"Ideas, journal o metas de la semana.", tab:"notas",    done: notes.length > 0  },
  ];
  const done = steps.filter(s=>s.done).length;

  return (
    <div style={{ background:`linear-gradient(135deg,${accent}12,${accent}06)`,border:`1px solid ${accent}30`,borderRadius:18,padding:"20px 22px",marginBottom:24,position:"relative" }}>
      <button onClick={dismiss} style={{ position:"absolute",top:14,right:14,background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16,lineHeight:1 }}>×</button>

      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
        <div style={{ fontSize:20 }}>👋</div>
        <div style={{ fontSize:15,fontWeight:800,color:t.text }}>¡Bienvenido a 2do.cerebro, {user.name.split(" ")[0]}!</div>
      </div>
      <div style={{ fontSize:12.5,color:t.textMuted,marginBottom:16 }}>
        Completa estos primeros pasos para sacarle el jugo a la app.
      </div>

      {/* Progress bar */}
      <div style={{ height:4,background:t.border,borderRadius:99,marginBottom:16,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${(done/steps.length)*100}%`,background:accent,borderRadius:99,transition:"width .4s cubic-bezier(.4,0,.2,1)" }}/>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8 }}>
        {steps.map(s => (
          <button key={s.tab} onClick={()=>{ if(!s.done) onNavigate(s.tab); }}
            style={{ display:"flex",alignItems:"flex-start",gap:10,background:s.done?accent+"18":t.bgCard,border:`1px solid ${s.done?accent+"50":t.border}`,borderRadius:12,padding:"11px 13px",cursor:s.done?"default":"pointer",textAlign:"left",transition:"all .18s" }}>
            <span style={{ fontSize:18,flexShrink:0,opacity:s.done?.6:1 }}>{s.done?"✅":s.icon}</span>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:s.done?accent:t.text,textDecoration:s.done?"line-through":"none" }}>{s.title}</div>
              {!s.done&&<div style={{ fontSize:10.5,color:t.textMuted,marginTop:2,lineHeight:1.4 }}>{s.desc}</div>}
            </div>
          </button>
        ))}
      </div>

      {done === steps.length && (
        <div style={{ marginTop:14,textAlign:"center",fontSize:13,fontWeight:700,color:accent }}>
          🎉 ¡Completaste el setup! Ya estás listo.{" "}
          <button onClick={dismiss} style={{ background:"none",border:"none",color:accent,textDecoration:"underline",cursor:"pointer",fontSize:13,fontWeight:700 }}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

// ─── FEEDBACK BUTTON ─────────────────────────────────────────────────────────
function FeedbackButton({ user, t, accent }) {
  const [open,    setOpen]    = useState(false);
  const [msg,     setMsg]     = useState("");
  const [type,    setType]    = useState("bug");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const send = async () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    try {
      await supabase.from("feedback").insert({
        uid:        user.id,
        user_name:  user.name,
        user_email: user.email,
        type,
        message:    msg.trim(),
        app_version:"1.0-beta",
        created_at: new Date().toISOString(),
      });
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setMsg(""); setType("bug"); }, 1800);
    } catch(e) {
      toast.error("No se pudo enviar. Inténtalo de nuevo.");
    } finally { setSending(false); }
  };

  const TYPES = [
    { id:"bug",      label:"🐛 Bug",        desc:"Algo no funciona" },
    { id:"mejora",   label:"💡 Mejora",     desc:"Tengo una idea"   },
    { id:"pregunta", label:"❓ Pregunta",   desc:"Tengo una duda"   },
    { id:"otro",     label:"💬 Otro",       desc:""                 },
  ];

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        title="Enviar feedback"
        style={{
          position:"fixed", bottom:20, right:20, zIndex:300,
          width:38, height:38, borderRadius:"50%",
          background:accent+"22", border:`1px solid ${accent}50`,
          color:accent, display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", boxShadow:`0 4px 18px ${accent}30`,
          transition:"transform .18s, box-shadow .18s",
          fontSize:16,
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.12)"; e.currentTarget.style.boxShadow=`0 6px 24px ${accent}50`; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow=`0 4px 18px ${accent}30`; }}
      >
        💬
      </button>

      {/* Modal */}
      {open && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:8500,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px" }}
          onClick={() => setOpen(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:20,padding:"24px 22px 20px",width:"100%",maxWidth:420,boxShadow:"0 24px 60px rgba(0,0,0,.5)",fontFamily:"'Outfit',sans-serif",animation:"popIn .28s cubic-bezier(.34,1.56,.64,1) both" }}>

            {sent ? (
              <div style={{ textAlign:"center",padding:"24px 0" }}>
                <div style={{ fontSize:36,marginBottom:8 }}>🎉</div>
                <div style={{ fontSize:15,fontWeight:700,color:t.text }}>¡Gracias por tu feedback!</div>
                <div style={{ fontSize:12,color:t.textMuted,marginTop:4 }}>Lo revisaremos pronto.</div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:t.text }}>💬 Enviar feedback</div>
                  <button onClick={()=>setOpen(false)} style={{ background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:18,lineHeight:1 }}>×</button>
                </div>

                {/* Type selector */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14 }}>
                  {TYPES.map(tp => (
                    <button key={tp.id} onClick={()=>setType(tp.id)}
                      style={{ background:type===tp.id?accent+"18":t.input,border:`1px solid ${type===tp.id?accent+"60":t.inputBdr}`,borderRadius:9,padding:"7px 10px",fontSize:11,fontWeight:600,color:type===tp.id?accent:t.textMuted,cursor:"pointer",textAlign:"left",transition:"all .15s" }}>
                      {tp.label}
                      {tp.desc&&<div style={{ fontSize:9.5,fontWeight:400,opacity:.7,marginTop:1 }}>{tp.desc}</div>}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <textarea
                  autoFocus
                  value={msg}
                  onChange={e=>setMsg(e.target.value)}
                  placeholder={type==="bug"?"Describe qué pasó y cómo reproducirlo...":type==="mejora"?"¿Qué mejorarías o agregarías?":"Escribe tu mensaje..."}
                  rows={4}
                  style={{ width:"100%",background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:10,padding:"10px 13px",color:t.text,fontSize:13,fontFamily:"'Outfit',sans-serif",resize:"vertical",boxSizing:"border-box",marginBottom:12,lineHeight:1.5 }}
                />

                <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                  <button onClick={()=>setOpen(false)}
                    style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={send} disabled={!msg.trim()||sending}
                    style={{ background:accent,color:"#07070f",border:"none",borderRadius:9,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:msg.trim()&&!sending?"pointer":"not-allowed",opacity:msg.trim()&&!sending?1:.5,display:"flex",alignItems:"center",gap:6,transition:"opacity .2s" }}>
                    {sending?<><Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>Enviando...</>:"Enviar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
// Catches render crashes per-tab so the whole app never goes white.

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      const accent = this.props.accent || "#34d399";
      const t      = this.props.t || DARK;
      return (
        <div style={{ padding:"40px 32px", fontFamily:"'Outfit',sans-serif", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
          <div style={{ fontSize:17, fontWeight:700, color:t.text, marginBottom:8 }}>
            Algo salió mal en esta sección
          </div>
          <div style={{ fontSize:13, color:t.textMuted, marginBottom:24, maxWidth:360, margin:"0 auto 24px" }}>
            {this.state.error?.message || "Error inesperado"}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ background:accent, color:"#07070f", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── auth session ──
  const [session,  setSession]  = useState(undefined); // undefined=loading, null=no auth, obj=authed
  const [profile,  setProfile]  = useState(null);       // current user's profile row
  const [profiles, setProfiles] = useState([]);         // all profiles (for shared items)

  // Bootstrap auth: check session on mount + subscribe to changes
  useEffect(() => {
    // First check if there's a session already (handles page reload after OAuth redirect)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setSession(s ?? null);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // When session changes, load profile
  useEffect(() => {
    if (!session) { setProfile(null); setProfiles([]); return; }
    const loadProfile = async () => {
      let { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      // If profile doesn't exist yet (trigger may have been slow), create it manually
      if (!data) {
        const meta = session.user.user_metadata || {};
        const name = meta.name || meta.full_name || session.user.email?.split("@")[0] || "Usuario";
        const newProfile = {
          id:       session.user.id,
          name,
          initials: name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
          accent:   meta.accent || "#34d399",
          email:    session.user.email,
          avatar:   meta.avatar_url || "",
        };
        const { data: created } = await supabase.from("profiles").upsert(newProfile).select().single();
        data = created || newProfile;
      }
      if (data) setProfile({ ...data, accentDim: (data.accent||"#34d399") + "18" });
    };
    const loadProfiles = async (myId) => {
      // Only load my own profile + accepted friends (not every user in the DB)
      const { data: friendRows } = await supabase
        .from("friend_requests")
        .select("from_uid, to_uid")
        .or(`from_uid.eq.${myId},to_uid.eq.${myId}`)
        .eq("status", "accepted");
      const friendIds = (friendRows||[]).map(r => r.from_uid === myId ? r.to_uid : r.from_uid);
      // Always include self
      const allIds = [myId, ...friendIds];
      const { data } = await supabase.from("profiles").select("*").in("id", allIds);
      if (data) setProfiles(data.map(p => ({ ...p, accentDim: (p.accent||"#34d399") + "18" })));
    };
    loadProfile();
    // We wait for profile to be ready then load friends
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user?.id) loadProfiles(s.user.id);
    });
  }, [session?.user?.id]); // only re-run when user ID actually changes

  // ── if session is loading, show spinner ──
  if (session === undefined) return <LoadingScreen accent="#34d399"/>;

  // ── session exists but profile still loading → spinner (not login) ──
  if (session && !profile) return <LoadingScreen accent="#34d399"/>;

  // ── if not logged in, show login screen ──
  if (!session) return <LoginScreen/>;

  // ── reload friends list (called after accepting a friend request) ──
  const reloadFriendProfiles = async (myId) => {
    const { data: friendRows } = await supabase
      .from("friend_requests")
      .select("from_uid, to_uid")
      .or(`from_uid.eq.${myId},to_uid.eq.${myId}`)
      .eq("status", "accepted");
    const friendIds = (friendRows||[]).map(r => r.from_uid === myId ? r.to_uid : r.from_uid);
    const allIds = [myId, ...friendIds];
    const { data } = await supabase.from("profiles").select("*").in("id", allIds);
    if (data) setProfiles(data.map(p => ({ ...p, accentDim: (p.accent||"#34d399") + "18" })));
  };

  // ── logged in: render the full app ──
  return <AppInner session={session} profile={profile} profiles={profiles} setProfile={setProfile} setProfiles={setProfiles} reloadProfiles={()=>reloadFriendProfiles(session.user.id)}/>;
}

// ─── APP INNER (rendered only when authenticated) ─────────────────────────────
function AppInner({ session, profile, profiles, setProfile, setProfiles, reloadProfiles }) {
  // ── The "user" object matches the old shape exactly ──
  const user = profile;
  // ── "users" = all profiles (for shared items, assigned tasks, etc.) ──
  const users = profiles;

  // ── live "today" — auto-refreshes at midnight so the app never shows stale dates ──
  const liveToday = useToday();

  // ── theme ──
  const [dark,  setDark]  = useState(() => localStorage.getItem("theme") !== "light");
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("fontSize")||14));
  const t = dark ? DARK : LIGHT;
  const toggleTheme = () => setDark(d => { localStorage.setItem("theme", d?"light":"dark"); return !d; });

  const updateUser = async (updated) => {
    const patch = { name: updated.name, initials: updated.initials, accent: updated.accent, email: updated.email, avatar: updated.avatar };
    await supabase.from("profiles").update(patch).eq("id", updated.id);
    setProfile({ ...updated, accentDim: updated.accent + "18" });
    setProfiles(prev => prev.map(p => p.id === updated.id ? { ...updated, accentDim: updated.accent + "18" } : p));
  };

  const logout = async () => {
    confirmModal("¿Cerrar sesión?", "Tu sesión será cerrada en este dispositivo.", async () => {
      await supabase.auth.signOut();
    });
  };

  const [switchFlash, setSwitchFlash] = useState(false);

  // ── habits & gamification ──
  const [habits,      setHabits]      = useState([]);
  const [habitLogs,   setHabitLogs]   = useState([]);
  const [userStats,   setUserStats]   = useState({});  // uid -> stats row
  const [habitForm,   setHabitForm]   = useState(false);
  const [habitDate,   setHabitDate]   = useState(liveToday);
  const [newHabit,    setNewHabit]    = useState({ name:"", icon:"⚡", color:"#3b82f6", target_type:"check", target_value:1, target_unit:"", xp_value:10, visibility:"private" });
  const [badgePopup,    setBadgePopup]    = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [addRow, setAddRow] = useState({active:false, title:"", deadline:"", priority:"media", category:"personal", course_id:""});
  const [colWidths, setColWidths] = useState(() => { try { return JSON.parse(localStorage.getItem("taskColWidths")||"null")||{title:280,area:120,course:160,date:130,prio:90}; } catch{return {title:280,area:120,course:160,date:130,prio:90};} });
  const [taskSort,  setTaskSort]  = useState({col:"date", dir:"asc"});
  const [taskColFilters, setTaskColFilters] = useState({title:"",area:"",course:"",date:"",prio:""});
  const [taskDeleteId, setTaskDeleteId] = useState(null); // id to confirm delete
  const [colResizing, setColResizing] = useState(null); // {col, startX, startW}
  const [userDropdown,  setUserDropdown]  = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQ,       setSearchQ]       = useState("");
  const [searchDetail,  setSearchDetail]  = useState(null); // { result, item } — detail modal
  const [highlightId,   setHighlightId]   = useState(null); // { id, type } — tab highlight

  const [tab,           setTab]           = useState("dashboard");
  const [slim,          setSlim]          = useState(false);
  // nav order (draggable sidebar)
  const [navOrder, setNavOrder] = useState(() => {
    try { const s=localStorage.getItem("navOrder"); return s?JSON.parse(s):null; } catch{return null;}
  });
  const [navDragging, setNavDragging] = useState(null);
  const [navDragOver, setNavDragOver] = useState(null);
  const [navEditMode, setNavEditMode] = useState(false);
  // mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // widget layout (draggable dashboard)
  const [widgetOrder,   setWidgetOrder]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("widgetOrder")||"null") || ["stats","habits","clock","agenda","urgentes","upcoming","mycharts","metas","xp"]; }
    catch { return ["stats","habits","clock","agenda","urgentes","upcoming","mycharts","metas","xp"]; }
  });
  const [editLayout,        setEditLayout]        = useState(false);
  const [showHabitsRanking, setShowHabitsRanking] = useState(false);
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);
  // focus / pomodoro
  const [focusTask,     setFocusTask]     = useState("");
  const [focusMode,     setFocusMode]     = useState("work"); // work | break | longbreak
  const [focusRunning,  setFocusRunning]  = useState(false);
  const [focusSecs,     setFocusSecs]     = useState(25*60);
  const [focusRound,    setFocusRound]    = useState(0);
  const [focusStation,  setFocusStation]  = useState(null); // lofi music
  const focusRef = useRef(null);
  // clock widget
  const [clock,         setClock]         = useState(nowLima());
  const [weather,       setWeather]       = useState(null); // { temp, desc, icon }
  const [loading,      setLoading]      = useState(true);
  const [profileOpen,  setProfileOpen]  = useState(false);

  // ── report config (per user, persisted in localStorage) ──
  const defaultReportCfg = () => ({
    enabled: true,
    days: [1,2,3,4,5,6,0],   // all days (0=Sun)
    email: "",                // empty = use user.email
    sections: { tasks:true, habits:true, events:true, academic:true, finance:false },
  });
  const [reportCfg, setReportCfg] = useState(() => {
    try {
      const raw = localStorage.getItem("reportCfg");
      return raw ? JSON.parse(raw) : {};   // keyed by user.id
    } catch { return {}; }
  });
  const getUserReportCfg = (uid) => ({ ...defaultReportCfg(), ...(reportCfg[uid]||{}) });
  const saveReportCfg = async (uid, patch) => {
    const next = { ...reportCfg, [uid]: { ...getUserReportCfg(uid), ...patch } };
    setReportCfg(next);
    localStorage.setItem("reportCfg", JSON.stringify(next));
    const merged = next[uid];
    await supabase.from("report_config").upsert({ uid, ...merged }, { onConflict: "uid" });
  };

  // ── weekly goals ──
  const [goals,    setGoals]    = useState([]);
  const [goalForm, setGoalForm] = useState(false);
  const [metasSubTab, setMetasSubTab] = useState("metas"); // "metas" | "retos"
  const [newGoal,  setNewGoal]  = useState({ title:"", type:"tasks", target:5, visibility:"private" });

  // Get current week range (Mon–Sun)
  const getWeekRange = () => {
    const now = nowLima();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(now); mon.setDate(now.getDate() + diff); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: mon.toISOString().slice(0,10), end: sun.toISOString().slice(0,10) };
  };
  const weekRange = getWeekRange();

  // Auto-compute progress for each goal type
  const computeGoalProgress = (goal) => {
    const { start, end } = weekRange;
    switch (goal.type) {
      case "tasks": {
        const completed = tasks.filter(t =>
          (t.uid === goal.uid || goal.shared) &&
          t.status === "completada" &&
          (t.deadline >= start && t.deadline <= end)
        ).length;
        return Math.min(completed, goal.target);
      }
      case "habits": {
        const myHabits = habits.filter(h => h.uid === goal.uid || goal.shared);
        const doneLogs = habitLogs.filter(l =>
          l.date >= start && l.date <= end &&
          myHabits.some(h => h.id === l.habit_id)
        ).length;
        return Math.min(doneLogs, goal.target);
      }
      case "xp": {
        // Count XP earned this week from habit + task logs in the week range
        const myHabitsXp = habits.filter(h=>h.uid===goal.uid);
        const habitXp = habitLogs.filter(l=>
          l.uid===goal.uid && l.date>=start && l.date<=end &&
          myHabitsXp.some(h=>h.id===l.habit_id)
        ).reduce((a,l)=>{
          const h = myHabitsXp.find(x=>x.id===l.habit_id);
          if (!h) return a;
          if (h.target_type==="check") return a+(h.xp_value||10);
          const pct = Math.min(1, Number(l.value)/(h.target_value||1));
          return a + Math.round((h.xp_value||10)*pct);
        },0);
        const taskXp = tasks.filter(t=>
          t.uid===goal.uid && t.status==="completada" &&
          (t.updated_at||t.created_at||"").slice(0,10)>=start &&
          (t.updated_at||t.created_at||"t").slice(0,10)<=end
        ).length * XP_PER_TASK;
        return Math.min(habitXp + taskXp, goal.target);
      }
      case "study": {
        // Sum planner blocks of type "estudio" this week (duration in hours)
        const studyMins = plannerBlocks.filter(b =>
          b.uid === goal.uid &&
          b.date >= start && b.date <= end &&
          b.cat === "estudio"
        ).reduce((acc, b) => acc + ((b.end_hour - b.start_hour) * 60), 0);
        return Math.min(Math.round(studyMins / 60 * 10) / 10, goal.target);
      }
      default: return 0;
    }
  };

  const GOAL_TYPES = {
    tasks:  { label:"Tareas completadas", icon:"✅", unit:"tareas",  color:"#34d399" },
    habits: { label:"Hábitos cumplidos",  icon:"🔥", unit:"registros", color:"#f59e0b" },
    study:  { label:"Horas de estudio",   icon:"📚", unit:"horas",   color:"#3b82f6" },
    xp:     { label:"XP ganado",          icon:"⚡", unit:"XP",      color:"#a855f7" },
  };

  const loadGoals = async () => {
    const { data } = await supabase.from("weekly_goals").select("*").order("created_at");
    setGoals(data || []);
  };
  const saveGoal = async () => {
    if (!newGoal.title.trim()) return;
    const { data } = await supabase.from("weekly_goals").insert({
      uid: user.id, title: newGoal.title, type: newGoal.type,
      target: Number(newGoal.target), shared: newGoal.shared,
      week_start: weekRange.start,
    }).select().single();
    if (data) setGoals([...goals, data]);
    setNewGoal({ title:"", type:"tasks", target:5, visibility:"private" });
    setGoalForm(false);
  };
  const deleteGoal = async (id) => {
    await supabase.from("weekly_goals").delete().eq("id", id);
    setGoals(goals.filter(g => g.id !== id));
  };

  // ── challenges (retos) ──
  const [challenges,    setChallenges]    = useState([]);
  const [challengeForm, setChallengeForm] = useState(false);
  const [newChallenge,  setNewChallenge]  = useState({ title:"", type:"tasks", target:10, days:7, xp_reward:50 });

  // ── SOCIAL: groups, chat, streaks ────────────────────────────────────────────
  const [groups,          setGroups]          = useState([]);
  const [groupMembers,    setGroupMembers]     = useState([]);   // all members across groups
  const [groupMessages,   setGroupMessages]    = useState({});   // groupId -> msg[]
  const [groupStreakDays, setGroupStreakDays]   = useState([]);   // all streak day rows
  const [activeGroupId,   setActiveGroupId]    = useState(null);
  const [socialSubTab,    setSocialSubTab]      = useState("grupos");
  const [groupForm,       setGroupForm]         = useState(false);
  const [newGroup,        setNewGroup]          = useState({ name:"", description:"", avatar_emoji:"👥" });
  const [chatInput,       setChatInput]         = useState("");
  const [msgLoading,      setMsgLoading]        = useState(false);
  const [pendingInvites,  setPendingInvites]    = useState([]);
  const chatBottomRef = useRef(null);
  const swRegRef      = useRef(null);

  // ── COUPLE MODE ───────────────────────────────────────────────────────────────
  const [coupleMode, setCoupleMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`coupleMode_${user?.id}`) || "{}"); } catch { return {}; }
  });
  // coupleMode shape: { enabled: bool, partnerId: uid|null, tabName: string, since: date }
  const coupleEnabled  = coupleMode.enabled && coupleMode.partnerId;
  const partner        = coupleEnabled ? users.find(u => u.id === coupleMode.partnerId) : null;
  const coupleTabName  = coupleMode.tabName || "Nosotros";

  const saveCoupleMode = (patch) => {
    const next = { ...coupleMode, ...patch };
    setCoupleMode(next);
    localStorage.setItem(`coupleMode_${user?.id}`, JSON.stringify(next));
  };

  // ── Couple shared data (loaded when couple mode active) ───────────────────────
  const [coupleJournal,   setCoupleJournal]   = useState([]); // shared journal entries
  const [coupleTasks,     setCoupleTasks]     = useState([]); // shared couple tasks
  const [coupleGoals,     setCoupleGoals]     = useState([]); // long-term couple goals
  const [coupleMoods,     setCoupleMoods]     = useState([]); // daily mood entries
  const [coupleSubTab,    setCoupleSubTab]    = useState("tablero");
  const [newCoupleTask,   setNewCoupleTask]   = useState({ title:"", note:"" });
  const [newCoupleGoal,   setNewCoupleGoal]   = useState({ title:"", emoji:"🎯", target_date:"", note:"" });
  const [newMoodEntry,    setNewMoodEntry]    = useState({ mood:3, note:"" });
  const [newJournalEntry, setNewJournalEntry] = useState({ title:"", body:"", private:false });
  const [coupleTaskForm,  setCoupleTaskForm]  = useState(false);
  const [coupleGoalForm,  setCoupleGoalForm]  = useState(false);
  const [journalForm,     setJournalForm]     = useState(false);
  const [moodLogged,      setMoodLogged]      = useState(false);

  const loadCoupleData = async () => {
    if (!coupleEnabled || !partner) return;
    const pairIds = [user.id, partner.id].sort();
    const pairKey = pairIds.join("_");

    // Shared tasks (couple_tasks table, keyed by pair)
    const { data: tasks_ } = await supabase
      .from("couple_tasks")
      .select("*, creator:profiles!couple_tasks_creator_uid_fkey(id,name,initials,accent,avatar)")
      .eq("pair_key", pairKey)
      .order("created_at", { ascending: false });
    setCoupleTasks(tasks_ || []);

    // Long-term goals
    const { data: goals_ } = await supabase
      .from("couple_goals")
      .select("*")
      .eq("pair_key", pairKey)
      .order("created_at", { ascending: false });
    setCoupleGoals(goals_ || []);

    // Mood entries (last 30 days)
    const since = new Date(nowLima()); since.setDate(since.getDate() - 30);
    const { data: moods_ } = await supabase
      .from("couple_moods")
      .select("*, author:profiles!couple_moods_uid_fkey(id,name,initials,accent,avatar)")
      .eq("pair_key", pairKey)
      .gte("date", since.toISOString().slice(0,10))
      .order("date", { ascending: false });
    setCoupleMoods(moods_ || []);
    setMoodLogged(moods_?.some(m => m.uid === user.id && m.date === liveToday) || false);

    // Journal entries (shared + own private)
    const { data: journal_ } = await supabase
      .from("couple_journal")
      .select("*, author:profiles!couple_journal_uid_fkey(id,name,initials,accent,avatar)")
      .eq("pair_key", pairKey)
      .or(`private.eq.false,uid.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(30);
    setCoupleJournal(journal_ || []);
  };

  useEffect(() => { if (coupleEnabled) loadCoupleData(); }, [coupleEnabled, partner?.id]);

  // ── Couple actions ────────────────────────────────────────────────────────────
  const pairKey = () => [user.id, partner?.id].filter(Boolean).sort().join("_");

  const addCoupleTask = async () => {
    if (!newCoupleTask.title.trim()) return;
    const { data } = await supabase.from("couple_tasks")
      .insert({ pair_key: pairKey(), title: newCoupleTask.title.trim(), note: newCoupleTask.note.trim(), creator_uid: user.id, done: false })
      .select("*, creator:profiles!couple_tasks_creator_uid_fkey(id,name,initials,accent,avatar)").single();
    if (data) setCoupleTasks(p => [data, ...p]);
    setNewCoupleTask({ title:"", note:"" });
    setCoupleTaskForm(false);
  };

  const toggleCoupleTask = async (id, done) => {
    await supabase.from("couple_tasks").update({ done: !done }).eq("id", id);
    setCoupleTasks(p => p.map(t => t.id === id ? { ...t, done: !done } : t));
  };

  const deleteCoupleTask = async (id) => {
    await supabase.from("couple_tasks").delete().eq("id", id);
    setCoupleTasks(p => p.filter(t => t.id !== id));
  };

  const addCoupleGoal = async () => {
    if (!newCoupleGoal.title.trim()) return;
    const { data } = await supabase.from("couple_goals")
      .insert({ pair_key: pairKey(), ...newCoupleGoal, creator_uid: user.id, done: false })
      .select().single();
    if (data) setCoupleGoals(p => [data, ...p]);
    setNewCoupleGoal({ title:"", emoji:"🎯", target_date:"", note:"" });
    setCoupleGoalForm(false);
  };

  const toggleCoupleGoal = async (id, done) => {
    await supabase.from("couple_goals").update({ done: !done }).eq("id", id);
    setCoupleGoals(p => p.map(g => g.id === id ? { ...g, done: !done } : g));
  };

  const logMood = async () => {
    if (moodLogged) return;
    const { data } = await supabase.from("couple_moods")
      .upsert({ pair_key: pairKey(), uid: user.id, date: liveToday, mood: newMoodEntry.mood, note: newMoodEntry.note.trim() }, { onConflict:"pair_key,uid,date" })
      .select("*, author:profiles!couple_moods_uid_fkey(id,name,initials,accent,avatar)").single();
    if (data) {
      setCoupleMoods(p => [data, ...p.filter(m => !(m.uid === user.id && m.date === liveToday))]);
      setMoodLogged(true);
      toast.success("Estado de ánimo registrado 💙");
    }
  };

  const addJournalEntry = async () => {
    if (!newJournalEntry.body.trim()) return;
    const { data } = await supabase.from("couple_journal")
      .insert({ pair_key: pairKey(), uid: user.id, title: newJournalEntry.title.trim(), body: newJournalEntry.body.trim(), private: newJournalEntry.private })
      .select("*, author:profiles!couple_journal_uid_fkey(id,name,initials,accent,avatar)").single();
    if (data) setCoupleJournal(p => [data, ...p]);
    setNewJournalEntry({ title:"", body:"", private:false });
    setJournalForm(false);
    toast.success(newJournalEntry.private ? "Entrada privada guardada 🔒" : "Entrada compartida ❤️");
  };
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js")
      .then(reg => {
        swRegRef.current = reg;
        // Listen for messages from SW (notification clicks)
        navigator.serviceWorker.addEventListener("message", (e) => {
          if (e.data?.type === "NOTIFICATION_CLICK") {
            const url = e.data.url || "/";
            if (url.includes("social")) setTab?.("social");
          }
        });
      })
      .catch(() => {}); // Silently fail if sw.js not deployed yet
  }, []);

  // ── Web Push subscription ─────────────────────────────────────────────────────
  const subscribeToPush = async () => {
    if (!("Notification" in window)) { toast.error("Tu navegador no soporta notificaciones."); return; }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { toast.error("Permiso denegado."); return; }
    try {
      const reg = swRegRef.current || await navigator.serviceWorker.ready;
      // VAPID public key — replace with your own from: npx web-push generate-vapid-keys
      const VAPID_PUBLIC = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZJlcW7HxeBlm5G2vNRkTGQtToI";
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC,
      });
      const subJson = sub.toJSON();
      await supabase.from("push_subscriptions").upsert({
        uid: user.id,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth:   subJson.keys?.auth,
      }, { onConflict: "uid,endpoint" });
      setPushEnabled(true);
      localStorage.setItem("pushEnabled", "true");
      toast.success("🔔 Notificaciones push activadas");
    } catch (e) {
      // Fallback to basic Notification API
      new Notification("2do.cerebro 🧠", { body: "¡Notificaciones activadas!", icon: "/favicon.ico" });
      setPushEnabled(true);
      localStorage.setItem("pushEnabled", "true");
    }
  };

  // ── Send a local push (when app is open) ─────────────────────────────────────
  const localPush = (title, body, tag = "default") => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico", tag });
    }
  };

  // ── Load groups + members + my pending invites ────────────────────────────────
  const loadGroups = async () => {
    const uid = user.id;
    // My active memberships
    const { data: memberRows } = await supabase
      .from("group_members")
      .select("*, group:groups(*)")
      .eq("uid", uid)
      .eq("status", "active");
    const myGroups = (memberRows || []).map(r => r.group).filter(Boolean);
    setGroups(myGroups);

    // All members of my groups
    if (myGroups.length > 0) {
      const gids = myGroups.map(g => g.id);
      const { data: allMembers } = await supabase
        .from("group_members")
        .select("*, profile:profiles(id,name,initials,accent,avatar)")
        .in("group_id", gids)
        .eq("status", "active");
      setGroupMembers(allMembers || []);

      // Streak days (last 60 days)
      const since = new Date(nowLima()); since.setDate(since.getDate() - 60);
      const { data: streakRows } = await supabase
        .from("group_streak_days")
        .select("*")
        .in("group_id", gids)
        .gte("date", since.toISOString().slice(0,10));
      setGroupStreakDays(streakRows || []);
    }

    // Pending invites TO me
    const { data: invites } = await supabase
      .from("group_members")
      .select("*, group:groups(*), inviter:profiles!group_members_invited_by_fkey(name,accent)")
      .eq("uid", uid)
      .eq("status", "pending");
    setPendingInvites(invites || []);
  };

  // ── Load messages for a specific group ───────────────────────────────────────
  const loadMessages = async (groupId) => {
    setMsgLoading(true);
    const { data } = await supabase
      .from("group_messages")
      .select("*, sender:profiles(id,name,initials,accent,avatar)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(100);
    setGroupMessages(prev => ({ ...prev, [groupId]: data || [] }));
    setMsgLoading(false);
  };

  // ── Create group ─────────────────────────────────────────────────────────────
  const createGroup = async () => {
    if (!newGroup.name.trim()) return;
    const { data: grp, error } = await supabase
      .from("groups")
      .insert({ name: newGroup.name.trim(), description: newGroup.description.trim(), avatar_emoji: newGroup.avatar_emoji, owner_uid: user.id })
      .select().single();
    if (error) { toast.error(error.message); return; }
    // Add creator as active member
    await supabase.from("group_members").insert({ group_id: grp.id, uid: user.id, role:"owner", status:"active", invited_by: user.id });
    setNewGroup({ name:"", description:"", avatar_emoji:"👥" });
    setGroupForm(false);
    await loadGroups();
    setActiveGroupId(grp.id);
    toast.success(`Grupo "${grp.name}" creado ✅`);
  };

  // ── Invite friend to group ────────────────────────────────────────────────────
  const inviteToGroup = async (groupId, friendId) => {
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId, uid: friendId, role:"member", status:"pending", invited_by: user.id
    });
    if (error) toast.error(error.message);
    else { toast.success("Invitación enviada ✅"); await loadGroups(); }
  };

  // ── Accept/decline invite ─────────────────────────────────────────────────────
  const acceptInvite = async (memberId, groupId) => {
    await supabase.from("group_members").update({ status:"active" }).eq("id", memberId);
    await loadGroups();
    await loadMessages(groupId);
    setActiveGroupId(groupId);
    toast.success("¡Te uniste al grupo! 🎉");
  };
  const declineInvite = async (memberId) => {
    await supabase.from("group_members").delete().eq("id", memberId);
    setPendingInvites(prev => prev.filter(i => i.id !== memberId));
  };

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = async (groupId) => {
    const text = chatInput.trim();
    if (!text || !groupId) return;
    setChatInput("");
    const { data } = await supabase.from("group_messages")
      .insert({ group_id: groupId, sender_uid: user.id, text })
      .select("*, sender:profiles(id,name,initials,accent,avatar)").single();
    if (data) {
      setGroupMessages(prev => ({ ...prev, [groupId]: [...(prev[groupId]||[]), data] }));
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    }
  };

  // ── Check in to group streak (mark today as done) ─────────────────────────────
  const checkInGroupStreak = async (groupId) => {
    const date = liveToday;
    const { error } = await supabase.from("group_streak_days")
      .upsert({ group_id: groupId, uid: user.id, date }, { onConflict:"group_id,uid,date" });
    if (!error) {
      setGroupStreakDays(prev => {
        const exists = prev.some(r => r.group_id === groupId && r.uid === user.id && r.date === date);
        return exists ? prev : [...prev, { group_id: groupId, uid: user.id, date }];
      });
      // Check if all members checked in today → notify!
      const gMembers = groupMembers.filter(m => m.group_id === groupId);
      const todayCheckIns = groupStreakDays.filter(r => r.group_id === groupId && r.date === date);
      if (todayCheckIns.length + 1 >= gMembers.length) {
        localPush("🔥 ¡Racha grupal!", "¡Todo el grupo completó el día de hoy!");
      }
    }
  };

  // ── Compute group streak (consecutive days all members checked in) ─────────────
  const computeGroupStreak = (groupId) => {
    const members = groupMembers.filter(m => m.group_id === groupId);
    if (!members.length) return 0;
    const memberIds = members.map(m => m.uid);
    let streak = 0;
    const date = new Date(nowLima());
    for (let i = 0; i < 365; i++) {
      const dateStr = date.toISOString().slice(0,10);
      const checkIns = groupStreakDays.filter(r => r.group_id === groupId && r.date === dateStr);
      const allCheckedIn = memberIds.every(uid => checkIns.some(r => r.uid === uid));
      if (!allCheckedIn) { if (i === 0) { date.setDate(date.getDate() - 1); continue; } break; }
      streak++;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  };

  // ── Realtime: group messages ──────────────────────────────────────────────────
  useEffect(() => {
    if (!groups.length) return;
    const channels = [];
    groups.forEach(g => {
      const ch = supabase.channel(`chat-${g.id}`)
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "group_messages",
          filter: `group_id=eq.${g.id}`
        }, async (payload) => {
          // Fetch sender profile for the new message
          const { data: msg } = await supabase
            .from("group_messages")
            .select("*, sender:profiles(id,name,initials,accent,avatar)")
            .eq("id", payload.new.id).single();
          if (msg) {
            setGroupMessages(prev => {
              const existing = prev[g.id] || [];
              if (existing.some(m => m.id === msg.id)) return prev;
              // Notify if not our own message and app in bg
              if (msg.sender_uid !== user.id) {
                localPush(`💬 ${msg.sender?.name || "Alguien"}`, msg.text, `chat-${g.id}`);
              }
              return { ...prev, [g.id]: [...existing, msg] };
            });
            setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
          }
        })
        .subscribe();
      channels.push(ch);
    });
    return () => channels.forEach(ch => supabase.removeChannel(ch));
  }, [groups.map(g=>g.id).join(","), user.id]);

  // ── Realtime: group member changes ───────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("group-members-rt")
      .on("postgres_changes", { event:"*", schema:"public", table:"group_members", filter:`uid=eq.${user.id}` },
        () => loadGroups())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user.id]);

  // Load groups on mount + when activeGroupId changes for chat
  useEffect(() => { loadGroups(); }, []);
  useEffect(() => {
    if (activeGroupId && !groupMessages[activeGroupId]) loadMessages(activeGroupId);
  }, [activeGroupId]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [groupMessages, activeGroupId]);

  // Auto check-in to group streak when user completes a habit today
  const checkedInGroups = useRef(new Set());
  useEffect(() => {
    const todayLogs = habitLogs.filter(l => l.date === liveToday && l.uid === user.id);
    if (!todayLogs.length || !groups.length) return;
    groups.forEach(g => {
      if (!checkedInGroups.current.has(g.id)) {
        checkedInGroups.current.add(g.id);
        checkInGroupStreak(g.id);
      }
    });
  }, [habitLogs.length, groups.length]);

  const CHALLENGE_TYPES = {
    tasks:  { label:"Completar tareas",   icon:"✅", unit:"tareas",   color:"#34d399", desc:"en los próximos días" },
    habits: { label:"Racha de hábitos",   icon:"🔥", unit:"días",     color:"#f59e0b", desc:"días seguidos sin fallar" },
    xp:     { label:"Acumular XP",        icon:"⚡", unit:"XP",       color:"#a855f7", desc:"XP ganado en el período" },
  };

  const computeChallengeProgress = (ch) => {
    const start = ch.created_at?.slice(0,10) || liveToday;
    const end   = ch.ends_at || liveToday;
    switch (ch.type) {
      case "tasks": {
        return tasks.filter(t =>
          t.uid === ch.challenger_uid &&
          t.status === "completada" &&
          t.updated_at?.slice(0,10) >= start &&
          t.updated_at?.slice(0,10) <= end
        ).length;
      }
      case "habits": {
        return getStreak(ch.challenger_uid);
      }
      case "xp": {
        const startXp = ch.start_xp || 0;
        const curXp   = userStats[ch.challenger_uid]?.xp || 0;
        return Math.max(0, curXp - startXp);
      }
      default: return 0;
    }
  };

  const loadChallenges = async () => {
    const { data } = await supabase.from("challenges").select("*").order("created_at", { ascending: false });
    setChallenges(data || []);
  };

  const createChallenge = async () => {
    if (!newChallenge.title.trim()) return;
    const otherUser = users.find(u => u.id !== user.id);
    const endsAt = nowLima();
    endsAt.setDate(endsAt.getDate() + Number(newChallenge.days));
    const row = {
      title:           newChallenge.title,
      type:            newChallenge.type,
      target:          Number(newChallenge.target),
      days:            Number(newChallenge.days),
      xp_reward:       Number(newChallenge.xp_reward),
      challenger_uid:  user.id,
      challenged_uid:  otherUser?.id,
      status:          "pending",   // pending | active | completed | cancelled
      ends_at:         endsAt.toISOString().slice(0,10),
      start_xp:        userStats[user.id]?.xp || 0,
    };
    const { data } = await supabase.from("challenges").insert(row).select().single();
    if (data) {
      setChallenges(prev => [data, ...prev]);
      await logActivity("challenge_created", `Retó a ${otherUser?.name}: ${newChallenge.title}`);
    }
    setNewChallenge({ title:"", type:"tasks", target:10, days:7, xp_reward:50 });
    setChallengeForm(false);
  };

  const acceptChallenge = async (ch) => {
    await supabase.from("challenges").update({ status:"active" }).eq("id", ch.id);
    setChallenges(prev => prev.map(c => c.id===ch.id ? {...c, status:"active"} : c));
    await logActivity("challenge_accepted", ch.title);
  };

  const resolveChallenge = async (ch, winnerId) => {
    await supabase.from("challenges").update({ status:"completed", winner_uid: winnerId }).eq("id", ch.id);
    setChallenges(prev => prev.map(c => c.id===ch.id ? {...c, status:"completed", winner_uid:winnerId} : c));
    const winner = users.find(u => u.id === winnerId);
    await awardXP(winnerId, ch.xp_reward, {});
    await logActivity("challenge_won", `${winner?.name} ganó "${ch.title}" (+${ch.xp_reward} XP)`);
  };

  const cancelChallenge = async (id) => {
    await supabase.from("challenges").update({ status:"cancelled" }).eq("id", id);
    setChallenges(prev => prev.map(c => c.id===id ? {...c, status:"cancelled"} : c));
  };
  const [feedEvents, setFeedEvents] = useState([]);

  const FEED_ICONS = {
    task_done:          { icon:"✅", color:"#34d399", label:"completó una tarea" },
    habit_done:         { icon:"🔥", color:"#f59e0b", label:"completó un hábito" },
    goal_done:          { icon:"🏆", color:"#a855f7", label:"cumplió una meta" },
    level_up:           { icon:"⚡", color:"#818cf8", label:"subió de nivel" },
    badge_earned:       { icon:"🎖️", color:"#ec4899", label:"ganó un badge" },
    challenge_created:  { icon:"⚔️", color:"#f87171", label:"lanzó un reto" },
    challenge_accepted: { icon:"🤝", color:"#34d399", label:"aceptó un reto" },
    challenge_won:      { icon:"🥇", color:"#f59e0b", label:"ganó un reto" },
    task_assigned:      { icon:"📌", color:"#f87171", label:"asignó una tarea" },
  };

  const logActivity = async (type, detail) => {
    const { data } = await supabase.from("activity_feed").insert({
      uid: user.id, type, detail, created_at: new Date().toISOString()
    }).select().single();
    if (data) setFeedEvents(prev => [data, ...prev].slice(0, 100));
  };

  const loadFeed = async () => {
    const { data } = await supabase.from("activity_feed")
      .select("*").order("created_at", { ascending: false }).limit(80);
    setFeedEvents(data || []);
  };

  // ── planner state ──
  const [plannerBlocks, setPlannerBlocks] = useState([]);
  const [plannerCats,   setPlannerCats]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("plannerCats")) || {
      estudio:   { label:"Estudio",   color:"#3b82f6", Ic:"GraduationCap" },
      trabajo:   { label:"Trabajo",   color:"#a855f7", Ic:"Briefcase"     },
      ejercicio: { label:"Ejercicio", color:"#34d399", Ic:"Dumbbell"      },
      libre:     { label:"Libre",     color:"#fb923c", Ic:"Coffee"        },
      personal:  { label:"Personal",  color:"#ec4899", Ic:"Heart"         },
    }; } catch { return {}; }
  });
  const [blockForm,     setBlockForm]    = useState(false);
  const [editBlock,     setEditBlock]    = useState(null);
  const [newBlock,      setNewBlock]     = useState({ title:"", day:0, start_hour:8, duration:1, type:"estudio" });
  const [catForm,       setCatForm]      = useState(false);
  const [newCat,        setNewCat]       = useState({ key:"", label:"", color:"#64748b" });
  const [dragging,      setDragging]     = useState(null);
  const [dragOver,      setDragOver]     = useState(null);

  // ── data ──
  const [tasks,        setTasks]        = useState([]);
  const [events,       setEvents]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts,        setDebts]        = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [notes,        setNotes]        = useState([]);
  const [taskCats,     setTaskCats]     = useState([]);

  // ── calendar confirm ──
  const [calConfirm,   setCalConfirm]   = useState(null); // { taskData } | null

  // ── forms ──
  const [form,   setForm]  = useState(false);
  const [taskView, setTaskView] = useState("table"); // "table" | "list"
  const [nt,     setNt]    = useState({ title:"",deadline:"",priority:"media",visibility:"private",category:"personal",course_id:"",assigned_to:null });
  const [editTask, setEditTask] = useState(null);
  const [subtasks,     setSubtasks]     = useState({});   // task_id -> subtask[]
  const [expandedTask, setExpandedTask] = useState(null); // task_id with inline open
  const [fForm,  setFForm] = useState(false);
  const [nTx,    setNTx]   = useState({ description:"",amount:"",type:"gasto",cat:"comida",visibility:"private",date:liveToday });
  const [editTx, setEditTx] = useState(null);
  // finanzas custom categories stored in localStorage
  const [finCats, setFinCats] = useState(()=>{
    try { const s=localStorage.getItem("finCats"); return s?JSON.parse(s):FIN_CATS; } catch{ return FIN_CATS; }
  });
  const [finCatForm, setFinCatForm] = useState(false);
  const [newFinCat, setNewFinCat] = useState({ key:"", label:"", color:"#a855f7" });
  const saveFinCats = (updated) => { setFinCats(updated); localStorage.setItem("finCats", JSON.stringify(updated)); };
  const addFinCat = () => {
    if(!newFinCat.key.trim()||!newFinCat.label.trim()) return;
    const key = newFinCat.key.trim().toLowerCase().replace(/\s+/g,"_");
    const updated = { ...finCats, [key]:{ label:newFinCat.label.trim(), color:newFinCat.color } };
    saveFinCats(updated);
    setNewFinCat({ key:"", label:"", color:"#a855f7" });
  };
  const delFinCat = (key) => {
    if(["otro"].includes(key)) return; // keep "otro" always
    const updated = Object.fromEntries(Object.entries(finCats).filter(([k])=>k!==key));
    saveFinCats(updated);
  };
  // finanzas filter month
  const [finMonth, setFinMonth] = useState(()=>{ const d=nowLima(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  // notas
  const [noteForm,  setNoteForm]  = useState(false);
  const [nNote,     setNNote]     = useState({ title:"",body:"",type:"idea" });
  const [editNote,  setEditNote]  = useState(null);
  const [eForm,  setEForm] = useState(false);
  const [nEv,    setNEv]   = useState({ title:"",date:"",time:"",time_end:"",type:"clase",visibility:"private",description:"",recurrence:"none",recurrence_end:"",reminder_min:null });
  // calendar grid state
  const [calYear,  setCalYear]  = useState(()=>nowLima().getFullYear());
  const [calMonth, setCalMonth] = useState(()=>nowLima().getMonth());
  const [calView,  setCalView]  = useState("month"); // "month" | "week" | "day" | "agenda"
  const [calSelDay, setCalSelDay] = useState(today);
  const [quickAddDay, setQuickAddDay] = useState(null); // date string for inline quick-add in month view
  const [eventModal, setEventModal] = useState(null);   // null | { mode:"new"|"edit", ev:{} }
  const [evtCats,  setEvtCats]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("evtCats")||"null") || {...EVT_C}; }
    catch { return {...EVT_C}; }
  });
  const [evtCatEdit, setEvtCatEdit] = useState(false);
  const [focusCustomMins, setFocusCustomMins] = useState(45);
  const [editEvent, setEditEvent] = useState(null); // event object being edited
  const [nf,     setNf]    = useState("todos");
  const [taskCatFilter,   setTaskCatFilter]   = useState("todos");
  const [taskCatFormOpen, setTaskCatFormOpen] = useState(false);
  const [newTaskCat,      setNewTaskCat]      = useState({ key:"", label:"", color:"#64748b" });
  const [editGrade,    setEditGrade]    = useState(null);
  const [activeCourse,   setActiveCourse]   = useState(null);  // courseId currently open
  const [acadTab,        setAcadTab]        = useState({});    // courseId -> "evals"|"formula"|"notas"|"materiales"
  // course form
  const [courseForm,     setCourseForm]     = useState(false);
  const [editCourse,     setEditCourse]     = useState(null);
  const [newCourse,      setNewCourse]      = useState({ name:"", credits:3, color:"#3b82f6", visibility:"private" });
  // materials
  const [matForm,        setMatForm]        = useState(null);
  const [newMat,         setNewMat]         = useState({ name:"", url:"" });
  // new evaluation tree system
  const [courseEvalTree, setCourseEvalTree] = useState({}); // courseId -> EvalNode[]
  const [evalLoaded,     setEvalLoaded]     = useState({}); // courseId -> boolean
  // legacy (kept for notifications compatibility)
  const [evaluations,    setEvaluations]    = useState([]);
  const [formulaMode,    setFormulaMode]    = useState({});
  // formula builder state per course
  const [formulaBlocks,  setFormulaBlocks]  = useState({}); // courseId -> Block[]
  const [formulaDrag,    setFormulaDrag]    = useState(null);
  // eval tree editing
  const [evalEditNode,   setEvalEditNode]   = useState(null); // node being edited
  const [evalAddParent,  setEvalAddParent]  = useState(null); // parentId or "root:courseId"
  const [evalAddForm,    setEvalAddForm]    = useState({ name:"", var:"", type:"leaf", round:false, modifier:false, modifierOp:"+", modifierTarget:"", weight:0, date:"" });

  // ── load ──
  useEffect(() => { loadAll(); }, []);

  // ── Realtime: keep data in sync when other devices/users make changes ──
  useEffect(() => {
    const uid = user.id;
    // Subscribe to all tables we care about; on any change, reload the affected slice
    const channels = [];

    const sub = (name, table, filter, refresh) => {
      const ch = supabase.channel(`rt-${name}`)
        .on("postgres_changes", { event:"*", schema:"public", table, filter }, refresh)
        .subscribe();
      channels.push(ch);
    };

    // Own data — filter by uid
    sub("tasks",      "tasks",       `uid=eq.${uid}`,  () => loadAll());
    sub("habits",     "habits",      `uid=eq.${uid}`,  () => loadAll());
    sub("habit_logs", "habit_logs",  `uid=eq.${uid}`,  () => loadAll());
    sub("events",     "events",      `uid=eq.${uid}`,  () => loadAll());
    sub("notes",      "notes",       `uid=eq.${uid}`,  () => loadAll());
    sub("transactions","transactions",`uid=eq.${uid}`, () => loadAll());
    sub("courses",    "courses",     `uid=eq.${uid}`,  () => loadAll());
    sub("goals",      "weekly_goals",`uid=eq.${uid}`,  () => loadAll());
    sub("feed",       "activity_feed",`uid=eq.${uid}`, () => loadAll());
    sub("stats",      "user_stats",  `uid=eq.${uid}`,  () => loadAll());
    // Friend requests directed to me
    sub("freq",       "friend_requests", `to_uid=eq.${uid}`, () => loadAll());

    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── push notifications (basic Notification API — SW handles web push) ──
  const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem("pushEnabled") === "true");

  const requestPushPermission = async () => {
    await subscribeToPush();
  };

  const disablePush = () => {
    setPushEnabled(false);
    localStorage.setItem("pushEnabled", "false");
  };

  // ── export utilities ──
  const exportAcademicPDF = () => {
    const rows = myCourses.map(c => {
      const avg = computeCourseAvg(c.id);
      const avgNum = avg ? Number(avg) : null;
      const color = avgNum === null ? "#64748b" : avgNum >= 14 ? "#16a34a" : avgNum >= 11 ? "#ea580c" : "#dc2626";
      const nodes = courseEvalTree[c.id] || [];
      const leaves = nodes.filter(n => n.type === "leaf");
      const evalRows = leaves.map(n =>
        "<tr><td style=\"padding:5px 10px;color:#475569;font-size:12px;\">" + n.name +
        "</td><td style=\"padding:5px 10px;font-weight:600;color:" + (n.score!==null?color:"#94a3b8") +
        ";font-size:12px;\">" + (n.score !== null && n.score !== undefined ? n.score : "—") + "</td></tr>"
      ).join("");
      const tableHtml = leaves.length > 0
        ? "<table style=\"width:100%;border-collapse:collapse;\">" + evalRows + "</table>"
        : "<div style='padding:10px 16px;color:#94a3b8;font-size:12px;'>Sin evaluaciones registradas</div>";
      const avgBox = "<div style=\"text-align:center;background:" + color + "18;border:1px solid " + color + "40;border-radius:10px;padding:6px 14px;\"><div style=\"font-size:9px;font-weight:700;color:" + color + ";letter-spacing:1px;\">PROMEDIO</div><div style=\"font-size:22px;font-weight:900;color:" + color + ";\">" + (avg || "—") + "</div></div>";
      return "<div style=\"margin-bottom:18px;border:1px solid #e2e8f0;border-top:3px solid " + c.color + ";border-radius:12px;overflow:hidden;\">" +
        "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;\">" +
        "<div><div style=\"font-size:15px;font-weight:700;color:#0f172a;\">" + c.name + "</div><div style=\"font-size:11px;color:#64748b;\">" + c.credits + " créditos</div></div>" +
        avgBox + "</div>" + tableHtml + "</div>";
    }).join("");
    const globalAvg = calcAvg(myCourses);
    const globalBox = globalAvg
      ? "<div style=\"text-align:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:10px 20px;\"><div style=\"font-size:10px;font-weight:700;color:#16a34a;letter-spacing:1px;\">PROMEDIO GLOBAL</div><div style=\"font-size:28px;font-weight:900;color:#16a34a;\">" + globalAvg + "</div></div>"
      : "";
    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>Reporte Académico · " + user.name + "</title>" +
      "<style>@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head>" +
      "<body style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;padding:32px 24px;color:#0f172a;\">" +
      "<div style=\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;\">" +
      "<div><div style=\"font-size:22px;font-weight:900;color:#0f172a;\">Reporte Académico</div><div style=\"font-size:13px;color:#64748b;margin-top:4px;\">" + user.name + " · " + liveToday + "</div></div>" +
      globalBox + "</div>" + rows + "</body></html>";
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  };

  const exportTasksCSV = () => {
    const header = "id,título,prioridad,estado,fecha_límite,categoría";
    const rows = myT.map(t => `${t.id},"${t.title}",${t.priority},${t.status},${t.deadline||""},${t.category||""}`);
    const blob = new Blob([[header,...rows].join("\n")], { type:"text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `tareas_${user.name.toLowerCase()}_${liveToday}.csv`;
    a.click();
  };

  const exportFinanceCSV = () => {
    const header = "fecha,descripción,tipo,monto,categoría";
    const rows = myTx.map(tx => `${tx.date||""},"${tx.description||""}",${tx.type},${tx.amount},${tx.cat||""}`);
    const blob = new Blob([[header,...rows].join("\n")], { type:"text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `finanzas_${user.name.toLowerCase()}_${liveToday}.csv`;
    a.click();
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const uid = user.id;
      // Friend IDs for shared content (derived from already-loaded profiles)
      const fIds = profiles.filter(p => p.id !== uid).map(p => p.id);
      // Build an OR filter for "mine OR shared-from-friend"
      // If no friends yet, just filter by own uid
      const ownOrShared = fIds.length > 0
        ? `uid.eq.${uid},and(shared.eq.true,uid.in.(${fIds.join(",")}))`
        : `uid.eq.${uid}`;

      const [
        { data: tasksData },  { data: eventsData },
        { data: txData },     { data: debtsData },
        { data: coursesData },{ data: notesData },
        { data: plannerData },{ data: taskCatsData },
        { data: evaluationsData }, { data: habitsData },
        { data: habitLogsData }, { data: statsData }, { data: reportConfigData },
        { data: goalsData },
        { data: feedData },
        { data: challengesData },
      ] = await Promise.all([
        // Tasks: mine OR assigned to me OR shared from friends
        fIds.length > 0
          ? supabase.from("tasks").select("*")
              .or(`uid.eq.${uid},assigned_to.eq.${uid},and(shared.eq.true,uid.in.(${fIds.join(",")}))`)
              .order("created_at",{ascending:false})
          : supabase.from("tasks").select("*")
              .or(`uid.eq.${uid},assigned_to.eq.${uid}`)
              .order("created_at",{ascending:false}),
        supabase.from("events").select("*").or(ownOrShared).order("date"),
        supabase.from("transactions").select("*").or(ownOrShared).order("date",{ascending:false}),
        supabase.from("debts").select("*").or(`from_uid.eq.${uid},to_uid.eq.${uid}`),
        supabase.from("courses").select("*, grades(*), course_materials(*)").or(ownOrShared).order("id"),
        supabase.from("notes").select("*").or(ownOrShared).order("created_at",{ascending:false}),
        supabase.from("planner_blocks").select("*").eq("uid", uid).order("start_hour"),
        supabase.from("task_categories").select("*").eq("uid", uid).order("created_at"),
        supabase.from("evaluations").select("*").eq("uid", uid).order("created_at"),
        supabase.from("habits").select("*").or(ownOrShared).order("created_at"),
        // Habit logs: mine + friends' (needed for shared habit display & streak)
        fIds.length > 0
          ? supabase.from("habit_logs").select("*")
              .in("uid", [uid, ...fIds])
              .order("date",{ascending:false})
              .limit(2000)
          : supabase.from("habit_logs").select("*")
              .eq("uid", uid)
              .order("date",{ascending:false})
              .limit(2000),
        // user_stats: mine + friends (for ranking widget)
        fIds.length > 0
          ? supabase.from("user_stats").select("*").in("uid", [uid, ...fIds])
          : supabase.from("user_stats").select("*").eq("uid", uid),
        supabase.from("report_config").select("*").eq("uid", uid),
        supabase.from("weekly_goals").select("*").or(ownOrShared).order("created_at"),
        // Feed: mine + friends, last 60 entries
        fIds.length > 0
          ? supabase.from("activity_feed").select("*")
              .in("uid", [uid, ...fIds])
              .order("created_at",{ascending:false}).limit(60)
          : supabase.from("activity_feed").select("*")
              .eq("uid", uid)
              .order("created_at",{ascending:false}).limit(60),
        // Challenges: where I'm involved
        fIds.length > 0
          ? supabase.from("challenges").select("*")
              .or(`challenger_uid.eq.${uid},challenged_uid.eq.${uid}`)
              .order("created_at",{ascending:false})
          : supabase.from("challenges").select("*")
              .or(`challenger_uid.eq.${uid},challenged_uid.eq.${uid}`)
              .order("created_at",{ascending:false}),
      ]);
      setTasks(tasksData||[]); setEvents(eventsData||[]); setTransactions(txData||[]);
      setDebts(debtsData||[]); setCourses(coursesData||[]); setNotes(notesData||[]);
      setPlannerBlocks(plannerData||[]); setTaskCats(taskCatsData||[]);
      setEvaluations(evaluationsData||[]); setHabits(habitsData||[]);
      setHabitLogs(habitLogsData||[]);
      setGoals(goalsData||[]);
      setFeedEvents(feedData||[]);
      setChallenges(challengesData||[]);
      const statsMap = {};
      (statsData||[]).forEach(s => statsMap[s.uid]=s);
      setUserStats(statsMap);
      // Merge remote report config into local (remote wins)
      if (reportConfigData?.length) {
        setReportCfg(prev => {
          const merged = { ...prev };
          reportConfigData.forEach(r => { merged[r.uid] = { ...defaultReportCfg(), ...r }; });
          localStorage.setItem("reportCfg", JSON.stringify(merged));
          return merged;
        });
      }
    } catch(e) {
      console.error("loadAll error:", e);
      toast.error("Error al cargar datos. Revisa tu conexión.");
    }
    setLoading(false);
  };

  // ── derived ──
  // "users" = me + accepted friends (already filtered in App loader)
  // friendIds = set of IDs we can see shared content from
  const friendIds = new Set(users.filter(u => u.id !== user.id).map(u => u.id));
  const isFriendContent = (item) => friendIds.has(item.uid);

  // Visibility-aware content filter:
  // - My own items: always visible
  // - Other's items with visibility "friends": visible if they're a friend
  // - Other's items with visibility "partner": visible only if I am their partner
  const isVisibleToMe = (item) => {
    if (item.uid === user.id) return true;
    if (!isFriendContent(item)) return false;
    const vis = item.visibility || (item.shared ? "friends" : "private");
    if (vis === "private") return false;
    if (vis === "partner") {
      // Their coupleMode partnerId should be my id
      // We can't read their localStorage, but we can check: if coupleEnabled and their uid = my partner, show it
      return coupleEnabled && item.uid === coupleMode.partnerId;
    }
    return true; // "friends"
  };

  const otherUser = users.find(u => u.id !== user.id);
  const myT      = tasks.filter(t => isVisibleToMe(t) || Number(t.assigned_to)===user.id);
  const myEv     = events.filter(e => isVisibleToMe(e));
  const todE     = myEv.filter(e => e.date===liveToday);
  const pend     = myT.filter(t => t.status!=="completada");
  const myCourses= courses.filter(c => isVisibleToMe(c));
  const evDates  = [...new Set(myEv.map(e=>e.date))].sort();
  const myTx     = transactions.filter(tx => isVisibleToMe(tx));
  const myTxMonth= myTx.filter(tx => (tx.date||"").startsWith(finMonth));
  const ingresos = myTxMonth.filter(tx=>tx.type==="ingreso").reduce((a,tx)=>a+Number(tx.amount),0);
  const gastos   = myTxMonth.filter(tx=>tx.type==="gasto").reduce((a,tx)=>a+Number(tx.amount),0);
  const balance  = ingresos-gastos;
  const gastosByCat = Object.entries(finCats).map(([cat,c])=>({ name:c.label, value:myTxMonth.filter(tx=>tx.type==="gasto"&&tx.cat===cat).reduce((a,tx)=>a+Number(tx.amount),0), color:c.color })).filter(d=>d.value>0);
  const barData = Array.from({length:6},(_,i)=>{
    const d = nowLima(); d.setDate(1); d.setMonth(d.getMonth()-5+i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const mes = d.toLocaleDateString("es-PE",{month:"short"});
    const monthTx = myTx.filter(tx=>(tx.date||"").startsWith(key));
    return { mes, ingresos:monthTx.filter(tx=>tx.type==="ingreso").reduce((a,tx)=>a+Number(tx.amount),0), gastos:monthTx.filter(tx=>tx.type==="gasto").reduce((a,tx)=>a+Number(tx.amount),0) };
  });
  const myNotes  = notes.filter(n=>(isVisibleToMe(n))&&(nf==="todos"||n.type===nf));

  // helper: get author user object for a shared item
  const authorOf = (item) => item.uid===user.id ? null : users.find(u=>u.id===item.uid);

  // ── search results ──
  const searchResults = searchQ.trim().length < 2 ? [] : (() => {
    const q = searchQ.toLowerCase();
    const results = [];
    myT.forEach(item => { if (item.title?.toLowerCase().includes(q)) results.push({ type:"task",   icon:"✅", label:item.title, sub:item.status, id:item.id, go:"tasks", item }); });
    myEv.forEach(item => { if (item.title?.toLowerCase().includes(q)) results.push({ type:"event",  icon:"📅", label:item.title, sub:item.date,   id:item.id, go:"calendar", item }); });
    notes.filter(n=>isVisibleToMe(n)).forEach(item => { if (item.title?.toLowerCase().includes(q)||item.body?.toLowerCase().includes(q)) results.push({ type:"note", icon:"📝", label:item.title||"Sin título", sub:item.type, id:item.id, go:"notas", item }); });
    myCourses.forEach(item => { if (item.name?.toLowerCase().includes(q)) results.push({ type:"course", icon:"🎓", label:item.name, sub:`${item.credits} créditos`, id:item.id, go:"academico", item }); });
    Object.values(courseEvalTree).flat().filter(n=>n.type==="leaf"&&n.uid===user.id).forEach(item => { if (item.name?.toLowerCase().includes(q)) { const c=myCourses.find(x=>x.id===item.course_id); results.push({ type:"eval", icon:"📋", label:item.name, sub:c?c.name:"Evaluación", id:item.id, go:"academico", item, courseId:item.course_id }); }});
    transactions.filter(tx=>isVisibleToMe(tx)).forEach(item => { if (item.description?.toLowerCase().includes(q)) results.push({ type:"tx", icon:item.type==="ingreso"?"💰":"💸", label:item.description, sub:`S/ ${item.amount} · ${item.date}`, id:item.id, go:"finanzas", item }); });
    habits.filter(h=>isVisibleToMe(h)).forEach(item => { if (item.name?.toLowerCase().includes(q)) results.push({ type:"habit", icon:item.icon||"⚡", label:item.name, sub:`${item.xp_value} XP`, id:item.id, go:"habitos", item }); });
    goals.filter(g=>isVisibleToMe(g)).forEach(item => { if (item.title?.toLowerCase().includes(q)) results.push({ type:"goal", icon:"🎯", label:item.title, sub:item.type, id:item.id, go:"metas", item }); });
    return results.slice(0, 40);
  })();

  // ── notifications (tasks due today/overdue + upcoming evals) ──
  const notifications = (() => {
    const notifs = [];
    const in2 = nowLima(); in2.setDate(in2.getDate()+2);
    const in2s = in2.toISOString().slice(0,10);
    myT.filter(t=>t.status!=="completada"&&t.deadline&&t.deadline<=liveToday).forEach(t =>
      notifs.push({ id:`task-${t.id}`, icon:"🔴", label:t.deadline===liveToday?`Vence hoy: ${t.title}`:`Vencida: ${t.title}`, urgent:true })
    );
    myT.filter(t=>t.status!=="completada"&&t.deadline&&t.deadline>liveToday&&t.deadline<=in2s).forEach(t =>
      notifs.push({ id:`task-due-${t.id}`, icon:"🟠", label:`Vence pronto: ${t.title}`, urgent:false })
    );
    // Tasks assigned TO me by the other user
    tasks.filter(t=>Number(t.assigned_to)===user.id&&t.status!=="completada").forEach(t => {
      const assignedBy = users.find(u=>u.id===t.uid);
      notifs.push({ id:`assigned-${t.id}`, icon:"📌", label:`${assignedBy?.name||"Alguien"} te asignó: ${t.title}`, urgent:false });
    });
    evaluations.filter(e=>{ const c=myCourses.find(x=>x.id===e.course_id&&x.uid===user.id); return c&&e.date&&e.date<=in2s&&e.date>=liveToday&&e.pending; }).forEach(e => {
      const c = myCourses.find(x=>x.id===e.course_id);
      notifs.push({ id:`eval-${e.id}`, icon:"📝", label:`${e.date===liveToday?"Hoy":"Pronto"}: ${c?.name} — ${e.name}`, urgent:e.date===liveToday });
    });
    return notifs.slice(0, 10);
  })();

  // Send local push for urgent notifications (runs when notifications list changes)
  useEffect(() => {
    if (!pushEnabled || Notification.permission !== "granted") return;
    const urgent = notifications.filter(n => n.urgent);
    if (urgent.length > 0) {
      const stored = localStorage.getItem("lastPushDate");
      if (stored === liveToday) return; // only once per day
      localStorage.setItem("lastPushDate", liveToday);
      urgent.slice(0, 3).forEach((n, i) => {
        setTimeout(() => {
          new Notification(`2do.cerebro · ${n.icon}`, { body: n.label, icon: "/favicon.ico" });
        }, i * 800);
      });
    }
  }, [notifications.length, pushEnabled]);

  // Push when a challenge is accepted/received
  useEffect(() => {
    if (!pushEnabled || Notification.permission !== "granted") return;
    const pending = challenges.filter(c => c.status === "pending" && c.challenged_uid === user.id);
    if (pending.length > 0) {
      const key = `pushCh_${pending[0].id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        new Notification("⚔️ ¡Nuevo reto!", { body: `Te desafiaron: ${pending[0].title}`, icon: "/favicon.ico" });
      }
    }
  }, [challenges.length, pushEnabled]);



  // ── actions ──
  const cycleTask = async (id, cur) => {
    const task = tasks.find(t=>t.id===id);
    const isAssigned = task && Number(task.assigned_to)===user.id;
    const isCreator  = task && task.uid===user.id;

    if (isAssigned && !isCreator) {
      // Assigned (not created by me): track my own completion in localStorage
      // Don't change the shared DB status — each user has their own check
      const key = `task_done_${id}_${user.id}`;
      const myDone = localStorage.getItem(key) === "1";
      if (myDone) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, "1");
        const totalDone = tasks.filter(t=>t.uid===user.id&&t.status==="completada").length + 1;
        const streak = getStreak(user.id);
        await awardXP(user.id, XP_PER_TASK, {tasksCompleted:totalDone, streak});
        await logActivity("task_done", task.title || "Tarea");
      }
      // Force re-render by touching state
      setTasks(prev=>[...prev]);
      return;
    }

    const ns=CYCLE[cur];
    setTasks(tasks.map(t=>t.id===id?{...t,status:ns}:t));
    await supabase.from("tasks").update({status:ns}).eq("id",id);
    if (ns==="completada") {
      const totalDone = tasks.filter(t=>t.uid===user.id&&t.status==="completada").length + 1;
      const streak = getStreak(user.id);
      await awardXP(user.id, XP_PER_TASK, {tasksCompleted:totalDone, streak});
      await logActivity("task_done", task?.title || "Tarea");
    }
  };
  // ── saving state (prevents double-submit) ──
  const [saving, setSaving] = useState(false);

  const saveTask = async () => {
    if(!nt.title.trim()||saving)return;
    setSaving(true);
    try {
      const assignedTo = nt.assigned_to ? Number(nt.assigned_to) : null;
      const {data,error}=await supabase.from("tasks").insert({title:nt.title,deadline:nt.deadline||null,priority:nt.priority,status:"pendiente",uid:user.id,shared:nt.visibility!=="private"||!!assignedTo,visibility:nt.visibility||"private",category:nt.category,course_id:nt.category==="universidad"&&nt.course_id?Number(nt.course_id):null,assigned_to:assignedTo}).select().single();
      if(error) throw error;
      if(data){
        setTasks([data,...tasks]);
        // Tasks appear on calendar via tasksFor() — no separate event needed
        if(assignedTo) {
          const assignee = users.find(u=>u.id===assignedTo);
          await logActivity("task_assigned", `Asignó "${nt.title}" a ${assignee?.name}`);
          if(pushEnabled && Notification.permission==="granted") {
            new Notification(`📌 Nueva tarea asignada`, { body:`${user.name} te asignó: ${nt.title}`, icon:"/favicon.ico" });
          }
          const notifKey = `assigned_task_${data.id}`;
          localStorage.setItem(notifKey, JSON.stringify({ from: user.name, title: nt.title, id: data.id }));
        }
      }
      setNt({title:"",deadline:"",priority:"media",visibility:"private",category:"personal",course_id:"",assigned_to:null});setForm(false);
    } catch(e) {
      toast.error("Error al guardar tarea: " + e.message);
    } finally { setSaving(false); }
  };

  // confirmAddToCalendar removed — calendar events created directly in saveTask

  const saveTaskCat = async () => {
    if(!newTaskCat.key.trim()||!newTaskCat.label.trim())return;
    const row = { uid:user.id, key:newTaskCat.key.toLowerCase().replace(/\s+/g,"_"), label:newTaskCat.label, color:newTaskCat.color };
    const {data} = await supabase.from("task_categories").insert(row).select().single();
    if(data) setTaskCats([...taskCats, data]);
    setNewTaskCat({key:"",label:"",color:"#64748b"}); setTaskCatFormOpen(false);
  };

  const deleteTaskCat = async (id) => {
    await supabase.from("task_categories").delete().eq("id",id);
    setTaskCats(taskCats.filter(c=>c.id!==id));
  };
  const updateTask = async () => {
    if(!editTask||!editTask.title.trim())return;
    const upd = {title:editTask.title,deadline:editTask.deadline||null,priority:editTask.priority,category:editTask.category,course_id:editTask.category==="universidad"&&editTask.course_id?Number(editTask.course_id):null,shared:editTask.shared,visibility:editTask.visibility||"private"};
    const {error} = await supabase.from("tasks").update(upd).eq("id",editTask.id);
    if(error) { toast.error("Error al actualizar tarea."); return; }
    setTasks(tasks.map(t=>t.id===editTask.id?{...t,...upd}:t));
    setEditTask(null);
  };
  const deleteTask = async (id) => {
    const {error} = await supabase.from("tasks").delete().eq("id",id);
    if(error) { toast.error("Error al eliminar tarea."); return; }
    setTasks(tasks.filter(t=>t.id!==id));
  };

  // ── subtasks ──
  const loadSubtasks = async (taskId) => {
    if (subtasks[taskId]) return; // already loaded
    const { data } = await supabase.from("subtasks").select("*").eq("task_id", taskId).order("position");
    setSubtasks(prev => ({ ...prev, [taskId]: data || [] }));
  };
  const addSubtask = async (taskId, title) => {
    if (!title.trim()) return;
    const pos = (subtasks[taskId]||[]).length;
    const { data } = await supabase.from("subtasks").insert({ task_id:taskId, title:title.trim(), done:false, position:pos }).select().single();
    if (data) setSubtasks(prev => ({ ...prev, [taskId]: [...(prev[taskId]||[]), data] }));
  };
  const toggleSubtask = async (taskId, subId, done) => {
    await supabase.from("subtasks").update({ done }).eq("id", subId);
    setSubtasks(prev => ({ ...prev, [taskId]: (prev[taskId]||[]).map(s => s.id===subId ? {...s,done} : s) }));
  };
  const updateSubtaskTitle = async (taskId, subId, title) => {
    await supabase.from("subtasks").update({ title }).eq("id", subId);
    setSubtasks(prev => ({ ...prev, [taskId]: (prev[taskId]||[]).map(s => s.id===subId ? {...s,title} : s) }));
  };
  const deleteSubtask = async (taskId, subId) => {
    await supabase.from("subtasks").delete().eq("id", subId);
    setSubtasks(prev => ({ ...prev, [taskId]: (prev[taskId]||[]).filter(s => s.id!==subId) }));
  };
  const getSubtaskProgress = (taskId) => {
    const subs = subtasks[taskId];
    if (!subs || !subs.length) return null;
    const done = subs.filter(s=>s.done).length;
    return { done, total: subs.length, pct: Math.round((done/subs.length)*100) };
  };
  const saveTx = async () => {
    if(!nTx.description.trim()||!nTx.amount||saving)return;
    setSaving(true);
    try {
      const {data,error}=await supabase.from("transactions").insert({description:nTx.description,amount:Number(nTx.amount),type:nTx.type,cat:nTx.cat,date:nTx.date||liveToday,uid:user.id,shared:nTx.visibility!=="private",visibility:nTx.visibility||"private"}).select().single();
      if(error) throw error;
      if(data)setTransactions([data,...transactions]);
      setNTx({description:"",amount:"",type:"gasto",cat:"comida",visibility:"private",date:liveToday});setFForm(false);
    } catch(e) {
      toast.error("Error al guardar transacción: " + e.message);
    } finally { setSaving(false); }
  };
  const updateTx = async () => {
    if(!editTx)return;
    const upd={description:editTx.description,amount:Number(editTx.amount),type:editTx.type,cat:editTx.cat,date:editTx.date,shared:editTx.visibility!=="private",visibility:editTx.visibility||"private"};
    const {error} = await supabase.from("transactions").update(upd).eq("id",editTx.id);
    if(error) { toast.error("Error al actualizar."); return; }
    setTransactions(transactions.map(t=>t.id===editTx.id?{...t,...upd}:t));
    setEditTx(null);
  };
  const deleteTx = async (id) => {
    await supabase.from("transactions").delete().eq("id",id);
    setTransactions(transactions.filter(t=>t.id!==id));
  };
  const saveNote = async () => {
    if(!nNote.title.trim()||saving)return;
    setSaving(true);
    try {
      const {data,error}=await supabase.from("notes").insert({title:nNote.title,body:nNote.body,type:nNote.type,date:liveToday,uid:user.id}).select().single();
      if(error) throw error;
      if(data)setNotes([data,...notes]);
      setNNote({title:"",body:"",type:"idea"});setNoteForm(false);
    } catch(e) {
      toast.error("Error al guardar nota: " + e.message);
    } finally { setSaving(false); }
  };
  const updateNote = async () => {
    if(!editNote)return;
    const upd={title:editNote.title,body:editNote.body,type:editNote.type};
    const {error} = await supabase.from("notes").update(upd).eq("id",editNote.id);
    if(error) { toast.error("Error al actualizar nota."); return; }
    setNotes(notes.map(n=>n.id===editNote.id?{...n,...upd}:n));
    setEditNote(null);
  };
  const deleteNote = async (id) => {
    await supabase.from("notes").delete().eq("id",id);
    setNotes(notes.filter(n=>n.id!==id));
  };
  const saveEvent = async () => {
    if(!nEv.title.trim()||!nEv.date||saving)return;
    setSaving(true);
    try {
      const row = { title:nEv.title, date:nEv.date, time:nEv.time||null, time_end:nEv.time_end||null, type:nEv.type, uid:user.id, shared:nEv.visibility!=="private", visibility:nEv.visibility||"private", description:nEv.description||null, recurrence:nEv.recurrence||"none", recurrence_end:nEv.recurrence_end||null, reminder_min:nEv.reminder_min??null };
      const {data,error}=await supabase.from("events").insert(row).select().single();
      if(error) throw error;
      if(data) setEvents([...events,data].sort((a,b)=>a.date.localeCompare(b.date)));
      setNEv({title:"",date:"",time:"",time_end:"",type:"clase",visibility:"private",description:"",recurrence:"none",recurrence_end:"",reminder_min:null});
      setEForm(false);
    } catch(e) { toast.error("Error al guardar evento: "+e.message); }
    finally { setSaving(false); }
  };

  const saveEventModal = async (ev, scope="all") => {
    if(!ev.title?.trim()||!ev.date) return;
    setSaving(true);
    try {
      const row = { title:ev.title, date:ev.date, time:ev.time||null, time_end:ev.time_end||null, type:ev.type||"clase", uid:user.id, shared:(ev.visibility||"private")!=="private", visibility:ev.visibility||"private", description:ev.description||null, recurrence:ev.recurrence||"none", recurrence_end:ev.recurrence_end||null, recurrence_days:ev.recurrence_days||null, recurrence_count:ev.recurrence_count||null, recurrence_interval:ev.recurrence_interval||1, reminder_min:ev.reminder_min??null };
      if(ev.id && scope==="all") {
        // Edit all occurrences — update origin directly
        await supabase.from("events").update(row).eq("id",ev.id);
        setEvents(events.map(e=>e.id===ev.id?{...e,...row,id:ev.id}:e).sort((a,b)=>a.date.localeCompare(b.date)));
      } else if(ev.id && scope==="this") {
        // Edit only this occurrence — add exception to origin, create one-off copy
        const exceptions = JSON.parse(events.find(e=>e.id===ev.id)?.recurrence_exceptions||"[]");
        const clickedDate = ev._clickedDate || ev.date;
        if(!exceptions.includes(clickedDate)) exceptions.push(clickedDate);
        await supabase.from("events").update({recurrence_exceptions:JSON.stringify(exceptions)}).eq("id",ev.id);
        // Insert one-off copy without recurrence
        const copy = {...row, recurrence:"none", recurrence_end:null, recurrence_days:null, recurrence_count:null, recurrence_interval:1, date:clickedDate};
        delete copy.id;
        const {data} = await supabase.from("events").insert(copy).select().single();
        const updOrigin = events.map(e=>e.id===ev.id?{...e,recurrence_exceptions:JSON.stringify(exceptions)}:e);
        setEvents(data ? [...updOrigin,data].sort((a,b)=>a.date.localeCompare(b.date)) : updOrigin);
      } else if(ev.id && scope==="following") {
        // Edit this and following — shorten original, create new recurring from this date
        const clickedDate = ev._clickedDate || ev.date;
        const prevDay = new Date(clickedDate+"T12:00"); prevDay.setDate(prevDay.getDate()-1);
        const newEnd = prevDay.toISOString().slice(0,10);
        await supabase.from("events").update({recurrence_end:newEnd}).eq("id",ev.id);
        const {data} = await supabase.from("events").insert({...row,date:clickedDate}).select().single();
        const updOrigin = events.map(e=>e.id===ev.id?{...e,recurrence_end:newEnd}:e);
        setEvents(data ? [...updOrigin,data].sort((a,b)=>a.date.localeCompare(b.date)) : updOrigin);
      } else {
        // New event
        const {data,error}=await supabase.from("events").insert(row).select().single();
        if(error) throw error;
        if(data) setEvents([...events,data].sort((a,b)=>a.date.localeCompare(b.date)));
      }
      setEventModal(null); setQuickAddDay(null);
    } catch(e) { toast.error("Error al guardar evento: "+e.message); }
    finally { setSaving(false); }
  };

  const updateEvent = async () => {
    if(!editEvent||!editEvent.title.trim()||!editEvent.date)return;
    const row = { title:editEvent.title, date:editEvent.date, time:editEvent.time||null, time_end:editEvent.time_end||null, type:editEvent.type, shared:(editEvent.visibility||"private")!=="private", visibility:editEvent.visibility||"private", description:editEvent.description||null, recurrence:editEvent.recurrence||"none", recurrence_end:editEvent.recurrence_end||null, reminder_min:editEvent.reminder_min??null };
    await supabase.from("events").update(row).eq("id",editEvent.id);
    setEvents(events.map(e=>e.id===editEvent.id?{...e,...row}:e).sort((a,b)=>a.date.localeCompare(b.date)));
    setEditEvent(null);
  };

  const moveEvent = async (evId, newDate) => {
    await supabase.from("events").update({date:newDate}).eq("id",evId);
    setEvents(events.map(e=>e.id===evId?{...e,date:newDate}:e).sort((a,b)=>a.date.localeCompare(b.date)));
  };
  const deleteEvent = async (id) => {
    await supabase.from("events").delete().eq("id",id);
    setEvents(events.filter(e=>e.id!==id));
  };
  // Delete only one occurrence (add to exceptions list)
  const deleteEventOccurrence = async (id, dateStr) => {
    const ev = events.find(e=>e.id===id);
    if(!ev) return;
    const exceptions = JSON.parse(ev.recurrence_exceptions||"[]");
    if(!exceptions.includes(dateStr)) exceptions.push(dateStr);
    await supabase.from("events").update({recurrence_exceptions:JSON.stringify(exceptions)}).eq("id",id);
    setEvents(events.map(e=>e.id===id?{...e,recurrence_exceptions:JSON.stringify(exceptions)}:e));
  };
  // Delete this and all following occurrences (shorten recurrence_end)
  const deleteEventFromDate = async (id, dateStr) => {
    const prev = new Date(dateStr+"T12:00"); prev.setDate(prev.getDate()-1);
    const newEnd = prev.toISOString().slice(0,10);
    await supabase.from("events").update({recurrence_end:newEnd}).eq("id",id);
    setEvents(events.map(e=>e.id===id?{...e,recurrence_end:newEnd}:e));
  };
  const saveGrade = async () => {
    if(!editGrade)return;
    await supabase.from("grades").update({score:Number(editGrade.score),pending:false}).eq("id",editGrade.gradeId);
    setCourses(courses.map(c=>c.id===editGrade.courseId?{...c,grades:c.grades.map(g=>g.id===editGrade.gradeId?{...g,score:Number(editGrade.score),pending:false}:g)}:c));
    setEditGrade(null);
  };
  const toggleDebt = async (id,settled) => {
    await supabase.from("debts").update({settled:!settled}).eq("id",id);
    setDebts(debts.map(d=>d.id===id?{...d,settled:!settled}:d));
  };

  // ── gamification helpers ──
  const getStreak = (uid) => {
    const myLogs = habitLogs.filter(l=>l.uid===uid);
    const myHabits = habits.filter(h=>h.uid===uid);
    if (!myHabits.length) return 0;
    const totalPossibleXP = myHabits.reduce((a,h)=>a+(h.xp_value||10),0);
    const threshold = totalPossibleXP * 0.75;

    const dayReached = (ds) => {
      const dayXP = myHabits.reduce((a,h)=>{
        const log = myLogs.find(l=>l.habit_id===h.id&&l.date===ds);
        if (!log) return a;
        if (h.target_type==="check") return a+(h.xp_value||10);
        const pct = Math.min(1, Number(log.value)/(h.target_value||1));
        return a + Math.round((h.xp_value||10)*pct);
      },0);
      return dayXP >= threshold;
    };

    // Count from yesterday backwards; if today already reached, include it too
    let streak = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1); // start at yesterday

    if (dayReached(today)) streak = 1; // today already qualifies

    while (streak <= 365) {
      const ds = d.toISOString().slice(0,10);
      if (!dayReached(ds)) break;
      streak++;
      d.setDate(d.getDate()-1);
    }
    return streak;
  };

  const awardXP = async (uid, amount, checkBadges={}) => {
    const cur = userStats[uid] || { uid, xp:0, level:1, badges:[] };
    const newXp = (cur.xp||0) + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    const curBadges = Array.isArray(cur.badges) ? cur.badges : [];
    const earnedBadges = [...curBadges];
    const newBadgesToShow = [];

    // check badge conditions
    if (checkBadges.tasksCompleted >= 1  && !earnedBadges.includes("first_task"))  { earnedBadges.push("first_task");  newBadgesToShow.push("first_task"); }
    if (checkBadges.tasksCompleted >= 10 && !earnedBadges.includes("tasks_10"))    { earnedBadges.push("tasks_10");    newBadgesToShow.push("tasks_10"); }
    if (checkBadges.tasksCompleted >= 50 && !earnedBadges.includes("tasks_50"))    { earnedBadges.push("tasks_50");    newBadgesToShow.push("tasks_50"); }
    if (checkBadges.streak >= 3  && !earnedBadges.includes("streak_3"))            { earnedBadges.push("streak_3");    newBadgesToShow.push("streak_3"); }
    if (checkBadges.streak >= 7  && !earnedBadges.includes("streak_7"))            { earnedBadges.push("streak_7");    newBadgesToShow.push("streak_7"); }
    if (checkBadges.streak >= 30 && !earnedBadges.includes("streak_30"))           { earnedBadges.push("streak_30");   newBadgesToShow.push("streak_30"); }
    if (newLevel >= 5  && !earnedBadges.includes("level_5"))                        { earnedBadges.push("level_5");     newBadgesToShow.push("level_5"); }
    if (newLevel >= 10 && !earnedBadges.includes("level_10"))                       { earnedBadges.push("level_10");    newBadgesToShow.push("level_10"); }

    const upd = { uid, xp:newXp, level:newLevel, badges:earnedBadges, last_active:liveToday };
    await supabase.from("user_stats").upsert(upd, {onConflict:"uid"});
    setUserStats(prev => ({...prev, [uid]: {...(prev[uid]||{}), ...upd}}));
    if (newBadgesToShow.length) {
      setBadgePopup(BADGES_DEF.find(b=>b.id===newBadgesToShow[0]));
      for (const bid of newBadgesToShow) {
        const bdef = BADGES_DEF.find(b=>b.id===bid);
        await logActivity("badge_earned", bdef?.label || bid);
      }
    }
    if (newLevel > (cur.level||1)) await logActivity("level_up", `Nivel ${newLevel}`);
  };

  // ── habit actions ──
  const saveHabit = async () => {
    if (!newHabit.name.trim()||saving) return;
    setSaving(true);
    try {
      const row = { uid:user.id, name:newHabit.name, icon:newHabit.icon, color:newHabit.color, target_type:newHabit.target_type, target_value:Number(newHabit.target_value)||1, target_unit:newHabit.target_unit, xp_value:Number(newHabit.xp_value)||10, shared:newHabit.visibility!=="private",visibility:newHabit.visibility||"private" };
      const {data,error} = await supabase.from("habits").insert(row).select().single();
      if(error) throw error;
      if (data) setHabits([...habits, data]);
      setNewHabit({name:"",icon:"⚡",color:"#3b82f6",target_type:"check",target_value:1,target_unit:"",xp_value:10,visibility:"private"});
      setHabitForm(false);
    } catch(e) {
      toast.error("Error al guardar hábito: " + e.message);
    } finally { setSaving(false); }
  };

  const deleteHabit = async (id) => {
    await supabase.from("habits").delete().eq("id",id);
    setHabits(habits.filter(h=>h.id!==id));
    setHabitLogs(habitLogs.filter(l=>l.habit_id!==id));
  };

  const logHabit = async (habit, value=1, date=habitDate) => {
    const existing = habitLogs.find(l=>l.habit_id===habit.id&&l.date===date&&l.uid===user.id);
    if (habit.target_type==="check") {
      if (existing) {
        // Toggle off
        const {error} = await supabase.from("habit_logs").delete().eq("id",existing.id);
        if (error) { console.error("habit_logs delete error:", error); return; }
        setHabitLogs(prev=>prev.filter(l=>l.id!==existing.id));
        return;
      }
      // Toggle on — upsert to avoid duplicate key errors
      const row = { habit_id:habit.id, uid:user.id, date, value:1 };
      const {data, error} = await supabase.from("habit_logs").upsert(row, {onConflict:"habit_id,uid,date"}).select().single();
      if (error) { console.error("habit_logs upsert error:", error); return; }
      if (data) {
        setHabitLogs(prev=>{
          const without = prev.filter(l=>!(l.habit_id===habit.id&&l.date===date&&l.uid===user.id));
          return [...without, data];
        });
        if (date===liveToday) {
        }
      }
    } else {
      // Quantity habit: validate value > 0 before logging
      if (!value || Number(value) <= 0) return;
      const row = { habit_id:habit.id, uid:user.id, date, value: Number(value) };
      const {data, error} = await supabase.from("habit_logs").upsert(row, {onConflict:"habit_id,uid,date"}).select().single();
      if (error) { console.error("habit_logs upsert error:", error); return; }
      if (data) {
        setHabitLogs(prev=>{
          const without = prev.filter(l=>!(l.habit_id===habit.id&&l.date===date&&l.uid===user.id));
          return [...without, data];
        });
        const pct = Math.min(1, value/(habit.target_value||1));
        const xp = Math.round((habit.xp_value||10)*pct);
        if (xp>0 && date===liveToday) {
          const streak = getStreak(user.id);
          const tasksCompleted = tasks.filter(t=>t.uid===user.id&&t.status==="completada").length;
          await awardXP(user.id, xp, {streak, tasksCompleted});
        }
      }
    }
  };

  const resetXP = async () => {
    confirmModal(
      "⚠️ Reiniciar XP",
      "¿Seguro? Todos tus puntos XP y nivel volverán a cero. <strong style='color:#f87171'>Esta acción no se puede deshacer.</strong>",
      async () => {
        const upd = { xp:0, level:1, badges:[] };
        await supabase.from("user_stats").update(upd).eq("uid", user.id);
        setUserStats(prev => ({...prev, [user.id]: {...(prev[user.id]||{}), ...upd}}));
        toast.success("XP reiniciado.");
      },
      { danger: true }
    );
  };

  // ── academic actions ──
  const saveCourse = async () => {
    if (!newCourse.name.trim()) return;
    const row = {
      name:       newCourse.name,
      credits:    Number(newCourse.credits),
      color:      newCourse.color,
      formula:    null,
      round_final: !!newCourse.round_final,
      uid:        user.id,
      shared:     !!newCourse.shared,
    };
    if (editCourse) {
      const {error} = await supabase.from("courses").update(row).eq("id", editCourse);
      if (error) { console.error("saveCourse update error:", error); toast.error("Error al actualizar: " + error.message); return; }
      setCourses(courses.map(c => c.id===editCourse ? {...c,...row} : c));
    } else {
      const {data, error} = await supabase.from("courses").insert(row).select("*, grades(*), course_materials(*)").single();
      if (error) { console.error("saveCourse insert error:", error); toast.error("Error al guardar: " + error.message); return; }
      if (data) setCourses([...courses, data]);
    }
    setNewCourse({name:"",credits:3,color:"#3b82f6",round_final:false,visibility:"private"});
    setCourseForm(false);
    setEditCourse(null);
  };

  const deleteCourse = (id) => {
    const course = courses.find(c => c.id === id);
    confirmModal(
      "Eliminar curso",
      `¿Eliminar <strong>${course?.name || "este curso"}</strong>? Se borrarán todas sus evaluaciones y materiales. Esta acción no se puede deshacer.`,
      async () => {
        await supabase.from("courses").delete().eq("id", id);
        setCourses(courses.filter(c => c.id !== id));
        setEvaluations(evaluations.filter(e => e.course_id !== id));
        setCourseEvalTree(prev => { const n={...prev}; delete n[id]; return n; });
        toast.success("Curso eliminado.");
      },
      { danger: true }
    );
  };

  // ── EVAL TREE SYSTEM ──

  // Load tree for a course (from course_evals table, or fall back to evaluations)
  const loadEvalTree = async (courseId) => {
    if (evalLoaded[courseId]) return;
    const {data} = await supabase.from("course_evals").select("*").eq("course_id", courseId).order("position");
    const nodes = data || [];
    // Build formula blocks from saved formula string on course
    const course = courses.find(c=>c.id===courseId);
    if (course?.formula && !formulaBlocks[courseId]) {
      // parse saved formula blocks
      try {
        const saved = JSON.parse(course.formula);
        if (Array.isArray(saved)) setFormulaBlocks(prev=>({...prev,[courseId]:saved}));
      } catch {}
    }
    setCourseEvalTree(prev=>({...prev,[courseId]:nodes}));
    setEvalLoaded(prev=>({...prev,[courseId]:true}));
  };

  // Auto-generate var name from node name
  const autoVar = (name) => {
    if (!name) return "";
    // Take initials of words, uppercase, max 6 chars
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.slice(0,4).toUpperCase().replace(/[^A-Z0-9]/g,"");
    return words.map(w=>w[0]||"").join("").toUpperCase().slice(0,6);
  };

  // Save a new eval node to DB
  const saveEvalNode = async (courseId, parentId, form) => {
    const nodes = courseEvalTree[courseId] || [];
    const siblings = nodes.filter(n=>n.parent_id===(parentId||null));
    const row = {
      course_id: courseId,
      parent_id: parentId || null,
      name:       form.name,
      var_name:   form.var || autoVar(form.name),
      type:       form.type,         // "leaf"|"weighted"|"formula"
      round:      form.round,
      weight:     Number(form.weight)||0,
      modifier:   form.modifier,
      modifier_op: form.modifier ? form.modifierOp : null,
      modifier_target: form.modifier && form.modifierTarget ? form.modifierTarget : null,
      date:       form.date || null,
      score:      null,
      position:   siblings.length,
    };
    const {data} = await supabase.from("course_evals").insert(row).select().single();
    if (data) {
      setCourseEvalTree(prev=>({...prev,[courseId]:[...(prev[courseId]||[]),data]}));
      // If has date, add to calendar
      if (form.date) {
        const course = courses.find(c=>c.id===courseId);
        const evRow = { title:`📚 ${course?.name||""} — ${form.name}`, date:form.date, time:"", type:"examen", uid:user.id, shared:false };
        const {data:evData} = await supabase.from("events").insert(evRow).select().single();
        if (evData) setEvents(prev=>[...prev,evData].sort((a,b)=>a.date.localeCompare(b.date)));
      }
    }
    setEvalAddParent(null);
    setEvalAddForm({name:"",var:"",type:"leaf",round:false,modifier:false,modifierOp:"+",modifierTarget:"",weight:0,date:""});
  };

  // Update eval node (score or full edit)
  const updateEvalNode = async (courseId, nodeId, updates) => {
    await supabase.from("course_evals").update(updates).eq("id", nodeId);
    setCourseEvalTree(prev=>({...prev,[courseId]:(prev[courseId]||[]).map(n=>n.id===nodeId?{...n,...updates}:n)}));
  };

  // Delete eval node and all descendants
  const deleteEvalNode = async (courseId, nodeId) => {
    // Collect all descendants
    const nodes = courseEvalTree[courseId] || [];
    const toDelete = [nodeId];
    const collect = (pid) => { nodes.filter(n=>n.parent_id===pid).forEach(n=>{toDelete.push(n.id);collect(n.id);}); };
    collect(nodeId);
    await supabase.from("course_evals").delete().in("id", toDelete);
    setCourseEvalTree(prev=>({...prev,[courseId]:(prev[courseId]||[]).filter(n=>!toDelete.includes(n.id))}));
  };

  // Compute score of a node (recursive) — supports leaf | weighted | group | formula
  const computeNode = (node, allNodes) => {
    const children = allNodes.filter(n=>n.parent_id===node.id);
    const regularChildren = children.filter(n=>!n.modifier);
    const modifiers = children.filter(n=>n.modifier);

    let score = null;

    if (node.type === "leaf") {
      score = node.score !== null && node.score !== undefined ? Number(node.score) : null;
    } else if (node.type === "weighted" || node.type === "group") {
      // Direct score on the group itself (no children, nota directa mode)
      if (regularChildren.length === 0 && node.score !== null && node.score !== undefined) {
        score = Number(node.score);
      } else if (node.child_formula && node.child_formula.trim()) {
        // If has explicit child_formula, use it
        const vars = {};
        regularChildren.forEach(c => { const s = computeNode(c, allNodes); if (s !== null) vars[c.var_name] = s; });
        if (!Object.keys(vars).length) return null;
        try {
          const expr = node.child_formula.replace(/[A-Za-z_][A-Za-z0-9_]*/g, m => vars[m] !== undefined ? vars[m] : "0");
          const r = Function('"use strict"; return (' + expr + ')')();
          score = isNaN(r) ? null : r;
        } catch { score = null; }
      } else {
        // Default: weighted average of children (by weight%, or simple avg if no weights)
        const computed = regularChildren.map(c=>({...c, _score: computeNode(c, allNodes)})).filter(c=>c._score!==null);
        if (!computed.length) return null;
        const totalW = computed.reduce((a,c)=>a+Number(c.weight),0);
        if (!totalW) score = computed.reduce((a,c)=>a+c._score,0)/computed.length;
        else score = computed.reduce((a,c)=>a+c._score*(Number(c.weight)/totalW)*100,0)/100;
      }
    } else if (node.type === "formula") {
      const vars = {};
      regularChildren.forEach(c=>{ const s=computeNode(c,allNodes); if(s!==null) vars[c.var_name]=s; });
      if (!Object.keys(vars).length) return null;
      try {
        const expr = (node.child_formula||"").replace(/[A-Za-z_][A-Za-z0-9_]*/g, m=>vars[m]!==undefined?vars[m]:0);
        const result = Function('"use strict"; return ('+expr+')')();
        score = isNaN(result) ? null : result;
      } catch { score = null; }
    }

    if (score === null) return null;
    if (node.round) score = Math.round(score * 2) / 2;

    modifiers.forEach(mod => {
      const modScore = computeNode(mod, allNodes);
      if (modScore === null) return;
      if (!mod.modifier_target) {
        if (mod.modifier_op==="+") score += modScore;
        else if (mod.modifier_op==="-") score -= modScore;
        else if (mod.modifier_op==="*") score *= modScore;
      }
    });

    return Math.max(0, Math.min(20, score));
  };

  // Compute root-level average using course.formula_text (new) or formula_blocks (legacy)
  const computeCourseAvg = (courseId) => {
    const nodes = courseEvalTree[courseId] || [];
    const roots = nodes.filter(n=>!n.parent_id);
    if (!roots.length) return null;

    const course = courses.find(c=>c.id===courseId);

    // Build vars map from root nodes
    const vars = {};
    roots.forEach(r => {
      const s = computeNode(r, nodes);
      if (s !== null) vars[r.var_name] = s;
    });
    // Also expose all leaf vars globally (for direct leaf references in formula)
    nodes.filter(n=>n.type==="leaf").forEach(n => {
      const s = computeNode(n, nodes);
      if (s !== null && !vars[n.var_name]) vars[n.var_name] = s;
    });

    // NEW: use course.formula_text if present
    const formulaText = course?.formula_text;
    if (formulaText && formulaText.trim()) {
      if (!Object.keys(vars).length) return null;
      try {
        const expr = formulaText.replace(/[A-Za-z_][A-Za-z0-9_]*/g, m => vars[m] !== undefined ? vars[m] : "0");
        const result = Function('"use strict"; return (' + expr + ')')();
        if (isNaN(result)) return null;
        let final = Math.max(0, Math.min(20, result));
        if (course?.round_final) final = Math.round(final * 2) / 2;
        return final.toFixed(2);
      } catch { return null; }
    }

    // FALLBACK: auto-generate from root weights (ignores legacy formula_blocks)
    if (!roots.length || !Object.keys(vars).length) return null;
    const weighted = roots.filter(r => Number(r.weight) > 0 && vars[r.var_name] !== undefined);
    let result;
    if (weighted.length) {
      const totalW = weighted.reduce((a, r) => a + Number(r.weight), 0);
      result = weighted.reduce((a, r) => a + vars[r.var_name] * (Number(r.weight) / totalW), 0);
    } else {
      // No weights at all — simple average of all roots with scores
      const withScores = roots.filter(r => vars[r.var_name] !== undefined);
      if (!withScores.length) return null;
      result = withScores.reduce((a, r) => a + vars[r.var_name], 0) / withScores.length;
    }
    if (isNaN(result)) return null;
    let final = Math.max(0, Math.min(20, result));
    if (course?.round_final) final = Math.round(final * 2) / 2;
    return final.toFixed(2);
  };

  // Save formula blocks to course.formula as JSON (legacy)
  const saveFormulaBlocks = async (courseId, blocks) => {
    setFormulaBlocks(prev=>({...prev,[courseId]:blocks}));
    await supabase.from("courses").update({formula:JSON.stringify(blocks)}).eq("id",courseId);
  };

  // Save new text formula to course.formula_text
  const saveFormulaText = async (courseId, text) => {
    await supabase.from("courses").update({ formula_text: text }).eq("id", courseId);
    setCourses(prev => prev.map(c => c.id===courseId ? {...c, formula_text: text} : c));
  };

  // Legacy compat
  const saveEval = async () => {};
  const deleteEval = async (id) => {
    await supabase.from("evaluations").delete().eq("id", id);
    setEvaluations(evaluations.filter(e => e.id !== id));
  };
  const updateEvalScore = async (id, score) => {
    await supabase.from("evaluations").update({score:Number(score),pending:false}).eq("id",id);
    setEvaluations(evaluations.map(e => e.id===id ? {...e,score:Number(score),pending:false} : e));
  };

  const calcCourseAvg = (courseId) => computeCourseAvg(courseId);
  const calcAvg = (list) => {
    let tc=0,tp=0;
    list.forEach(c=>{
      const avg = computeCourseAvg(c.id);
      if (!avg) return;
      tp += Number(avg) * Number(c.credits); tc += Number(c.credits);
    });
    return tc>0?(tp/tc).toFixed(2):"—";
  };

  // ── AI PANEL ─────────────────────────────────────────────────────────────────
  const saveMaterial = async (courseId) => {
    if (!newMat.name.trim() || !newMat.url.trim()) return;
    const {data} = await supabase.from("course_materials").insert({course_id:courseId, name:newMat.name, url:newMat.url}).select().single();
    if (data) setCourses(courses.map(c => c.id===courseId ? {...c, course_materials:[...(c.course_materials||[]),data]} : c));
    setNewMat({name:"",url:""}); setMatForm(null);
  };

  const deleteMaterial = async (courseId, matId) => {
    await supabase.from("course_materials").delete().eq("id", matId);
    setCourses(courses.map(c => c.id===courseId ? {...c, course_materials:(c.course_materials||[]).filter(m=>m.id!==matId)} : c));
  };

  // ── planner actions ──
  const getCatStyle = (type) => {
    const cat = plannerCats[type];
    if (!cat) return { bg:"rgba(100,116,139,.13)", border:"rgba(100,116,139,.5)", text:"#94a3b8" };
    const hex = cat.color;
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return { bg:`rgba(${r},${g},${b},.13)`, border:`rgba(${r},${g},${b},.5)`, text:hex };
  };

  const saveBlock = async () => {
    if (!newBlock.title.trim()) return;
    const row = { uid:user.id, title:newBlock.title, day:Number(newBlock.day), start_hour:Number(newBlock.start_hour), duration:Number(newBlock.duration), type:newBlock.type };
    if (editBlock) {
      await supabase.from("planner_blocks").update(row).eq("id", editBlock);
      setPlannerBlocks(plannerBlocks.map(b => b.id===editBlock ? {...b,...row} : b));
    } else {
      const {data} = await supabase.from("planner_blocks").insert(row).select().single();
      if (data) setPlannerBlocks([...plannerBlocks, data]);
    }
    setNewBlock({title:"",day:0,start_hour:8,duration:1,type:"estudio"});
    setBlockForm(false); setEditBlock(null);
  };

  const deleteBlock = async (id) => {
    await supabase.from("planner_blocks").delete().eq("id", id);
    setPlannerBlocks(plannerBlocks.filter(b => b.id !== id));
  };

  const saveCat = () => {
    if (!newCat.key.trim() || !newCat.label.trim()) return;
    const updated = {...plannerCats, [newCat.key.toLowerCase()]: { label:newCat.label, color:newCat.color }};
    setPlannerCats(updated);
    localStorage.setItem("plannerCats", JSON.stringify(updated));
    setNewCat({key:"",label:"",color:"#64748b"}); setCatForm(false);
  };

  const deleteCat = (key) => {
    const updated = {...plannerCats};
    delete updated[key];
    setPlannerCats(updated);
    localStorage.setItem("plannerCats", JSON.stringify(updated));
  };

  const handleDragStart = (e, block) => {
    setDragging(block);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, day, hour) => {
    e.preventDefault();
    if (!dragging) return;
    const updated = {...dragging, day, start_hour:hour};
    await supabase.from("planner_blocks").update({day, start_hour:hour}).eq("id", dragging.id);
    setPlannerBlocks(plannerBlocks.map(b => b.id===dragging.id ? updated : b));
    setDragging(null); setDragOver(null);
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); setSearchOpen(s=>!s); }
      if (e.key==="Escape") { setSearchOpen(false); setSearchQ(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // clock tick + reminder check
  useEffect(() => {
    const tick = () => {
      setClock(nowLima());
      // Check reminders every minute
      const now = nowLima();
      const nowMin = now.getHours()*60 + now.getMinutes();
      const todayStr = now.toISOString().slice(0,10);
      events.filter(e=>e.uid===user.id&&e.date===todayStr&&e.reminder_min!==null&&e.time).forEach(e=>{
        const [h,m] = e.time.split(":").map(Number);
        const evMin = h*60+m;
        const diff = evMin - nowMin;
        if(diff===e.reminder_min) {
          const key = `reminded_${e.id}_${todayStr}`;
          if(!localStorage.getItem(key)) {
            localStorage.setItem(key,"1");
            localPush?.(`⏰ ${e.title}`, diff===0?"¡Ahora!":`En ${diff} min`, "reminder");
          }
        }
      });
    };
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [events]);

  // weather — Lima, Perú (Open-Meteo, no API key needed)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-12.0464&longitude=-77.0428&current=temperature_2m,weathercode&timezone=America%2FLima");
        const d = await r.json();
        const code = d.current?.weathercode ?? 0;
        const temp = Math.round(d.current?.temperature_2m ?? 0);
        const WX = {
          0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️",
          45:"🌫️", 48:"🌫️",
          51:"🌦️", 53:"🌦️", 55:"🌧️",
          61:"🌧️", 63:"🌧️", 65:"🌧️",
          71:"❄️", 73:"❄️", 75:"❄️",
          80:"🌦️", 81:"🌦️", 82:"⛈️",
          95:"⛈️", 96:"⛈️", 99:"⛈️",
        };
        setWeather({ temp, icon: WX[code] ?? "🌡️" });
      } catch { /* silently fail */ }
    };
    fetchWeather();
    const iv = setInterval(fetchWeather, 15 * 60 * 1000); // refresh every 15 min
    return () => clearInterval(iv);
  }, []);

  // focus timer
  useEffect(() => {
    if (focusRunning) {
      focusRef.current = setInterval(() => {
        setFocusSecs(s => {
          if (s <= 1) {
            clearInterval(focusRef.current);
            setFocusRunning(false);
            const nextRound = focusRound + 1;
            setFocusRound(nextRound);
            if (focusMode === "work" || focusMode === "custom") {
              const isLong = nextRound % 4 === 0;
              setFocusMode(isLong ? "longbreak" : "break");
              setFocusSecs(isLong ? 15*60 : 5*60);
            } else {
              setFocusMode("work");
              setFocusSecs(25*60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(focusRef.current);
    }
    return () => clearInterval(focusRef.current);
  }, [focusRunning, focusMode]);

  const orderedNav = (() => {
    // Build effective NAV: hide pareja tab if couple mode off, use custom name
    const effectiveNAV = NAV
      .filter(n => n.id !== "pareja" || coupleEnabled)
      .map(n => n.id === "pareja" ? { ...n, label: coupleTabName } : n);
    if (!navOrder) return effectiveNAV;
    const map = Object.fromEntries(effectiveNAV.map(n=>[n.id,n]));
    return navOrder.map(id=>map[id]).filter(Boolean).concat(effectiveNAV.filter(n=>!navOrder.includes(n.id)));
  })();

  const onNavDragStart = (id) => setNavDragging(id);
  const onNavDragOver  = (id) => setNavDragOver(id);
  const onNavDrop      = (id) => {
    if (!navDragging||navDragging===id){setNavDragging(null);setNavDragOver(null);return;}
    const arr = orderedNav.map(n=>n.id);
    const from=arr.indexOf(navDragging), to=arr.indexOf(id);
    arr.splice(from,1); arr.splice(to,0,navDragging);
    setNavOrder(arr);
    localStorage.setItem("navOrder",JSON.stringify(arr));
    setNavDragging(null);setNavDragOver(null);
  };

  const focusReset = () => {
    setFocusRunning(false);
    setFocusSecs(focusMode==="work"?25*60:focusMode==="break"?5*60:15*60);
  };
  const focusSkip = () => {
    setFocusRunning(false);
    if (focusMode==="work") { setFocusMode("break"); setFocusSecs(5*60); }
    else { setFocusMode("work"); setFocusSecs(25*60); }
  };
  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const focusPct = focusMode==="work" ? (1-focusSecs/(25*60))*100 : focusMode==="break" ? (1-focusSecs/(5*60))*100 : focusMode==="longbreak" ? (1-focusSecs/(15*60))*100 : (1-focusSecs/(focusCustomMins*60))*100;

  // widget drag handlers
  const onWidgetDragStart = (id) => setDraggingWidget(id);
  const onWidgetDragOver  = (id) => setDragOverWidget(id);
  const onWidgetDrop      = (id) => {
    if (!draggingWidget || draggingWidget===id) { setDraggingWidget(null); setDragOverWidget(null); return; }
    const arr = [...widgetOrder];
    const from = arr.indexOf(draggingWidget), to = arr.indexOf(id);
    arr.splice(from,1); arr.splice(to,0,draggingWidget);
    setWidgetOrder(arr);
    localStorage.setItem("widgetOrder", JSON.stringify(arr));
    setDraggingWidget(null); setDragOverWidget(null);
  };

  if(loading) return <LoadingScreen accent={user.accent}/>;

  // ── helpers ──
  const inputStyle = { background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:10,padding:"9px 13px",color:t.text,fontSize:13,fontFamily:"'Outfit',sans-serif",transition:"border-color .15s" };
  const cardStyle  = (extra={}) => ({ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:16, padding:"18px 20px", ...extra });
  const h1Style    = { fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,color:t.text,letterSpacing:"-0.4px" };
  const subStyle   = { fontSize:12.5,color:t.textMuted,marginTop:4,fontWeight:400,lineHeight:1.5 };
  const secLabel   = { fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.8,textTransform:"uppercase" };

  return (
    <div style={{ display:"flex",height:"100vh",width:"100vw",background:t.bg,color:t.text,fontFamily:"'Outfit','Segoe UI',sans-serif",overflow:"hidden",position:"relative",transition:"background .3s,color .3s",fontSize:`${fontSize}px` }}>
      {/* Account switch flash */}
      {switchFlash&&<div style={{ position:"fixed",inset:0,zIndex:9999,background:user.accent,opacity:.18,pointerEvents:"none",animation:"switchFlash .5s ease-out forwards" }}/>}
      <Particles accent={user.accent} dark={dark}/>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}
        @keyframes switchFlash { 0%{opacity:.18} 40%{opacity:.18} 100%{opacity:0} }
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
        @keyframes skShine{0%{transform:translateX(-100%);}100%{transform:translateX(200%);}}
        @keyframes popIn{0%{transform:scale(.88) translateY(6px);opacity:0;}60%{transform:scale(1.02);}100%{transform:scale(1) translateY(0);opacity:1;}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shimmer{0%,100%{opacity:.6;}50%{opacity:1;}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.6;}100%{transform:scale(1.5);opacity:0;}}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:99px;}
        input,select,textarea{font-family:'Outfit',sans-serif;outline:none;color-scheme:${dark?"dark":"light"};}
        button{font-family:'Outfit',sans-serif;cursor:pointer;}
        .sk-shine{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(128,128,128,.08),transparent);animation:skShine 1.6s infinite;}
        --sk-bg:${dark?"rgba(255,255,255,.06)":"rgba(0,0,0,.07)"};
        .sk{background:var(--sk-bg);position:relative;overflow:hidden;}
        .sk::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,${dark?"rgba(255,255,255,.06)":"rgba(255,255,255,.5)"} 50%,transparent 100%);animation:skShine 1.4s infinite;}
        .fu{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both;}
        .fu-1{animation:fadeUp .4s .06s cubic-bezier(.16,1,.3,1) both;}
        .fu-2{animation:fadeUp .4s .12s cubic-bezier(.16,1,.3,1) both;}
        .fu-3{animation:fadeUp .4s .18s cubic-bezier(.16,1,.3,1) both;}
        .nav-i{transition:all .16s cubic-bezier(.4,0,.2,1);cursor:pointer;border-radius:10px;}
        .nav-i:hover{background:${t.navHov}!important;}
        .tr{cursor:pointer;transition:background .15s,transform .12s;}
        .tr:hover{background:${t.bgCardHov}!important;transform:translateX(2px);}
        .ch{transition:all .16s;cursor:pointer;}
        .ch:hover{opacity:.78;}
        .ch2{transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,border-color .22s;}
        .ch2:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.13);}
        .btn{transition:all .14s cubic-bezier(.4,0,.2,1);}
        .btn:hover{filter:brightness(1.1);transform:scale(.98);}
        .btn:active{transform:scale(.94);}
        .nr{transition:background .15s,transform .12s;border-radius:10px;}
        .nr:hover{background:${t.bgCardHov}!important;transform:translateX(2px);}
        .pop-in{animation:popIn .32s cubic-bezier(.34,1.56,.64,1) both;}
        .slide-down{animation:slideDown .22s cubic-bezier(.16,1,.3,1) both;}
        .card-hover{transition:all .22s cubic-bezier(.4,0,.2,1);}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.1);}
        /* ── Markdown preview ── */
        .md-preview{color:${t.text};font-size:14px;line-height:1.8;font-family:'Outfit',sans-serif;}
        .md-preview h1{font-size:22px;font-weight:800;margin:0 0 12px;color:${t.text};}
        .md-preview h2{font-size:18px;font-weight:700;margin:18px 0 10px;color:${t.text};}
        .md-preview h3{font-size:15px;font-weight:600;margin:14px 0 8px;color:${t.textSub};}
        .md-preview p{margin:0 0 10px;}
        .md-preview strong{font-weight:700;color:${t.text};}
        .md-preview em{font-style:italic;color:${t.textSub};}
        .md-preview del{text-decoration:line-through;color:${t.textFaint};}
        .md-preview ul,.md-preview ol{padding-left:20px;margin:0 0 10px;}
        .md-preview li{margin-bottom:4px;}
        .md-preview li.task{list-style:none;margin-left:-16px;}
        .md-preview code{background:${t.input};border:1px solid ${t.border};border-radius:5px;padding:1px 6px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#f59e0b;}
        .md-preview pre{background:${t.input};border:1px solid ${t.border};border-radius:10px;padding:14px 16px;overflow-x:auto;margin:0 0 12px;}
        .md-preview pre code{background:none;border:none;padding:0;font-size:12px;color:${t.textSub};}
        .md-preview blockquote{border-left:3px solid ${user?.accent||"#34d399"}40;padding:4px 14px;margin:0 0 10px;color:${t.textMuted};font-style:italic;}
        .md-preview hr{border:none;border-top:1px solid ${t.border};margin:16px 0;}
        .md-preview a{color:${user?.accent||"#34d399"};text-decoration:underline;}
        /* ── WYSIWYG editor ── */
        .wysiwyg-editor{caret-color:${user?.accent||"#34d399"};}
        .wysiwyg-editor:empty:before{content:attr(data-placeholder);color:${t.textFaint};font-style:italic;pointer-events:none;}
        .wysiwyg-editor h1{font-size:26px;font-weight:800;margin:0 0 14px;color:${t.text};line-height:1.25;}
        .wysiwyg-editor h2{font-size:20px;font-weight:700;margin:20px 0 10px;color:${t.text};}
        .wysiwyg-editor h3{font-size:16px;font-weight:600;margin:16px 0 8px;color:${t.textSub};}
        .wysiwyg-editor blockquote{border-left:3px solid ${t.border};padding:6px 16px;margin:12px 0;color:${t.textMuted};font-style:italic;background:${t.input};border-radius:0 8px 8px 0;}
        .wysiwyg-editor ul,.wysiwyg-editor ol{padding-left:22px;margin:0 0 10px;}
        .wysiwyg-editor li{margin-bottom:5px;}
        .wysiwyg-editor hr{border:none;border-top:1px solid ${t.border};margin:18px 0;}
        .wysiwyg-editor strong{font-weight:700;}
        .wysiwyg-editor em{font-style:italic;color:${t.textSub};}
        .wysiwyg-editor u{text-decoration:underline;text-underline-offset:3px;}
        .wysiwyg-editor strike,.wysiwyg-editor s{text-decoration:line-through;color:${t.textFaint};}
        .wysiwyg-editor a{color:${user?.accent||"#34d399"};}
        @media(max-width:768px){
          .sidebar-full{display:none!important;}
          .mobile-nav{display:flex!important;}
          .main-pad{padding:16px 14px 90px!important;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .two-col{grid-template-columns:1fr!important;}
          .mobile-hide{display:none!important;}
          h1{font-size:20px!important;}
        }
        .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:${dark?"rgba(7,7,15,.97)":t.sidebar};backdrop-filter:blur(24px);border-top:1px solid ${t.sidebarBdr};padding:6px 0 max(16px,env(safe-area-inset-bottom));z-index:100;justify-content:space-around;overflow-x:auto;}
        .search-result:hover{background:${t.bgCardHov}!important;}
        .streak-ring{position:relative;display:inline-flex;align-items:center;justify-content:center;}
        .streak-ring::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:2px solid #f59e0b;animation:pulse-ring 2s cubic-bezier(.4,0,.6,1) infinite;}
      `}</style>

      {/* ── SEARCH MODAL ── */}
      {/* ══ CALENDAR EVENT MODAL ══ */}
      {eventModal&&<CalEventModal
        eventModal={eventModal} setEventModal={setEventModal}
        saveEventModal={saveEventModal} deleteEvent={deleteEvent}
        deleteEventOccurrence={deleteEventOccurrence} deleteEventFromDate={deleteEventFromDate}
        cats={evtCats} t={t} user={user} saving={saving}
        coupleEnabled={coupleEnabled} partner={partner}
        inputStyle={inputStyle} people={users.filter(u=>u.id!==user.id)}
      />}

      {/* ══ SEARCH MODAL ══ */}
      {searchOpen&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:3000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:72 }} onClick={()=>{setSearchOpen(false);setSearchQ("");}}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:18,width:"min(580px,94vw)",boxShadow:"0 24px 60px rgba(0,0,0,.4)",overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
            {/* Input */}
            <div style={{ display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <Search size={15} color={user.accent}/>
              <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="Buscar tareas, notas, hábitos, cursos, transacciones…"
                style={{ flex:1,background:"none",border:"none",color:t.text,fontSize:14,outline:"none",fontFamily:"inherit" }}/>
              {searchQ&&<button onClick={()=>setSearchQ("")} style={{ background:"none",border:"none",color:t.textFaint,padding:2,display:"flex",cursor:"pointer" }}><X size={14}/></button>}
              <kbd style={{ background:t.input,border:`1px solid ${t.border}`,borderRadius:5,padding:"2px 7px",fontSize:10,color:t.textFaint }}>ESC</kbd>
            </div>

            {/* Type filter chips */}
            {searchQ.length>=2&&searchResults.length>0&&(()=>{
              const types = [...new Set(searchResults.map(r=>r.type))];
              const TYPE_LABELS = { task:"Tareas",event:"Eventos",note:"Notas",course:"Cursos",eval:"Evaluaciones",tx:"Finanzas",habit:"Hábitos",goal:"Metas" };
              return (
                <div style={{ display:"flex",gap:6,padding:"8px 16px",borderBottom:`1px solid ${t.borderSub}`,flexWrap:"wrap" }}>
                  {types.map(tp=>(
                    <span key={tp} style={{ fontSize:10,fontWeight:600,color:user.accent,background:user.accent+"18",borderRadius:99,padding:"2px 9px",border:`1px solid ${user.accent}30` }}>
                      {TYPE_LABELS[tp]||tp}
                    </span>
                  ))}
                  <span style={{ fontSize:10,color:t.textFaint,marginLeft:"auto",alignSelf:"center" }}>{searchResults.length} resultado{searchResults.length!==1?"s":""}</span>
                </div>
              );
            })()}

            {/* Results */}
            {searchQ.length>=2&&(
              <div style={{ maxHeight:400,overflowY:"auto" }}>
                {searchResults.length===0
                  ? <div style={{ padding:"32px",textAlign:"center",color:t.textFaint,fontSize:13 }}>Sin resultados para "<b>{searchQ}</b>"</div>
                  : searchResults.map((r,i)=>(
                    <div key={r.id+r.type+i} onClick={()=>setSearchDetail(r)}
                      style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 18px",borderBottom:`1px solid ${t.borderSub}`,cursor:"pointer",transition:"background .1s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=t.input}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{ width:34,height:34,borderRadius:10,background:user.accent+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{r.icon}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                          {/* Highlight matching text */}
                          {(()=>{
                            const idx = r.label.toLowerCase().indexOf(searchQ.toLowerCase());
                            if (idx===-1) return r.label;
                            return <>{r.label.slice(0,idx)}<mark style={{ background:user.accent+"40",color:t.text,borderRadius:2,padding:"0 1px" }}>{r.label.slice(idx,idx+searchQ.length)}</mark>{r.label.slice(idx+searchQ.length)}</>;
                          })()}
                        </div>
                        <div style={{ fontSize:10.5,color:t.textMuted,marginTop:1,textTransform:"capitalize" }}>{r.sub}</div>
                      </div>
                      <div style={{ fontSize:9,color:t.textFaint,background:t.input,borderRadius:5,padding:"2px 7px",border:`1px solid ${t.border}`,whiteSpace:"nowrap",flexShrink:0 }}>
                        {({task:"Tasks",event:"Calendario",note:"Notas",course:"Académico",eval:"Académico",tx:"Finanzas",habit:"Hábitos",goal:"Metas"})[r.type]||r.go}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Quick nav when no query */}
            {searchQ.length<2&&(
              <div style={{ padding:"18px" }}>
                <div style={{ fontSize:10,color:t.textFaint,letterSpacing:.8,fontWeight:700,marginBottom:10 }}>ACCESOS RÁPIDOS</div>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                  {[["dashboard","🏠"],["habitos","🔥"],["tasks","✅"],["calendar","📅"],["finanzas","💰"],["academico","🎓"],["notas","📝"]].map(([s,ic])=>(
                    <button key={s} onClick={()=>{setTab(s);setSearchOpen(false);}}
                      style={{ background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"6px 14px",fontSize:12,color:t.textMuted,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                      <span>{ic}</span><span style={{ textTransform:"capitalize" }}>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SEARCH DETAIL MODAL ══ */}
      {searchDetail&&(()=>{
        const r = searchDetail;
        const item = r.item || {};
        const TAB_LABEL = {task:"Tasks",event:"Calendario",note:"Notas",course:"Académico",eval:"Académico",tx:"Finanzas",habit:"Hábitos",goal:"Metas"};

        const navigateAndHighlight = () => {
          setTab(r.go);
          setHighlightId({ id: r.id, type: r.type });
          setTimeout(() => {
            const el = document.getElementById(`item-${r.type}-${r.id}`);
            if (el) { el.scrollIntoView({ behavior:"smooth", block:"center" }); }
          }, 300);
          setTimeout(() => setHighlightId(null), 2500);
          setSearchDetail(null);
          setSearchOpen(false);
          setSearchQ("");
        };

        // Build detail rows per type
        const details = [];
        if (r.type==="task") {
          details.push(["Estado", item.status||"—"], ["Prioridad", item.priority||"—"], ["Fecha límite", item.deadline||"Sin fecha"], ["Categoría", item.category||"—"]);
        } else if (r.type==="event") {
          details.push(["Fecha", item.date||"—"], ["Hora", item.time||"Todo el día"], ["Tipo", item.type||"—"]);
        } else if (r.type==="note") {
          details.push(["Tipo", item.type||"—"], ["Creada", item.created_at?.slice(0,10)||"—"]);
        } else if (r.type==="course") {
          details.push(["Créditos", item.credits||"—"], ["Promedio", computeCourseAvg?.(item.id)||"—"]);
        } else if (r.type==="eval") {
          details.push(["Nota", item.score!==null&&item.score!==undefined?item.score:"Sin nota"], ["Fecha", item.date||"—"], ["Peso", item.weight?`${item.weight}%`:"—"]);
        } else if (r.type==="tx") {
          details.push(["Monto", `S/ ${item.amount}`], ["Tipo", item.type||"—"], ["Categoría", item.cat||"—"], ["Fecha", item.date||"—"]);
        } else if (r.type==="habit") {
          details.push(["XP", `${item.xp_value||0} XP`], ["Meta diaria", `${item.target_value||1} ${item.target_unit||""}`], ["Tipo", item.target_type||"—"]);
        } else if (r.type==="goal") {
          details.push(["Tipo", item.type||"—"], ["Meta", item.target||"—"], ["Semana", item.week_start||"—"]);
        }

        return (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:3100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={()=>setSearchDetail(null)}>
            <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:20,width:"min(460px,94vw)",boxShadow:"0 32px 80px rgba(0,0,0,.45)",overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div style={{ padding:"20px 22px 16px",borderBottom:`1px solid ${t.border}` }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:13,background:user.accent+"18",border:`1px solid ${user.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{r.icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:15,fontWeight:800,color:t.text,lineHeight:1.3 }}>{r.label}</div>
                    <div style={{ fontSize:11,color:t.textMuted,marginTop:3,display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ background:user.accent+"18",color:user.accent,borderRadius:99,padding:"1px 8px",fontWeight:600,fontSize:10 }}>{TAB_LABEL[r.type]||r.go}</span>
                      <span>{r.sub}</span>
                    </div>
                  </div>
                  <button onClick={()=>setSearchDetail(null)} style={{ background:"none",border:"none",color:t.textFaint,cursor:"pointer",fontSize:18,lineHeight:1,flexShrink:0 }}>×</button>
                </div>
              </div>

              {/* Detail rows */}
              <div style={{ padding:"14px 22px" }}>
                {details.map(([k,v])=>(
                  <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${t.borderSub}` }}>
                    <span style={{ fontSize:11,color:t.textFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:.4 }}>{k}</span>
                    <span style={{ fontSize:12,color:t.text,fontWeight:500,textAlign:"right",maxWidth:"60%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textTransform:"capitalize" }}>{String(v)}</span>
                  </div>
                ))}
                {/* Note body preview */}
                {r.type==="note"&&item.body&&(
                  <div style={{ marginTop:10,padding:"10px 12px",background:t.input,borderRadius:10,fontSize:12,color:t.textMuted,lineHeight:1.6,maxHeight:120,overflowY:"auto" }}>
                    {item.body.slice(0,400)}{item.body.length>400?"…":""}
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div style={{ padding:"14px 22px 20px",display:"flex",gap:8,justifyContent:"flex-end",borderTop:`1px solid ${t.border}` }}>
                <button onClick={()=>setSearchDetail(null)}
                  style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                  Cerrar
                </button>
                <button onClick={navigateAndHighlight}
                  style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:10,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                  Ir a {TAB_LABEL[r.type]||r.go} <ChevronRight size={13}/>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── BADGE POPUP ── */}
      {badgePopup&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setBadgePopup(null)}>
          <div className="pop-in" style={{ background:t.modalBg,border:`2px solid ${user.accent}60`,borderRadius:24,padding:"36px 40px",textAlign:"center",maxWidth:300,boxShadow:`0 0 60px ${user.accent}30` }}>
            <div style={{ fontSize:56,marginBottom:12 }}>{badgePopup.icon}</div>
            <div style={{ fontSize:11,color:user.accent,fontWeight:700,letterSpacing:1,marginBottom:6 }}>¡LOGRO DESBLOQUEADO!</div>
            <div style={{ fontSize:20,fontWeight:800,color:t.text,marginBottom:8 }}>{badgePopup.name}</div>
            <div style={{ fontSize:13,color:t.textMuted,lineHeight:1.6,marginBottom:20 }}>{badgePopup.desc}</div>
            <button onClick={()=>setBadgePopup(null)} style={{ background:user.accent,color:"#07070f",border:"none",padding:"10px 28px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>¡Genial!</button>
          </div>
        </div>
      )}

      {/* ── PROFILE MODAL ── */}
      {profileOpen&&<ProfileModal user={user} users={users} onSave={updateUser} onClose={()=>setProfileOpen(false)} t={t}/>}

      {/* ── EDIT TX MODAL ── */}
      {editTx&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setEditTx(null)}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:18,padding:"24px 28px",width:360,boxShadow:"0 24px 60px rgba(0,0,0,.3)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <span style={{ fontSize:14,fontWeight:700,color:t.text }}>Editar movimiento</span>
              <button onClick={()=>setEditTx(null)} style={{ background:"none",border:"none",color:t.textMuted,padding:2,display:"flex" }}><X size={15}/></button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <input value={editTx.description} onChange={e=>setEditTx({...editTx,description:e.target.value})} style={{ ...inputStyle,width:"100%" }}/>
              <div style={{ display:"flex",gap:8 }}>
                <input type="number" value={editTx.amount} onChange={e=>setEditTx({...editTx,amount:e.target.value})} style={{ ...inputStyle,flex:1 }}/>
                <input type="date" value={editTx.date||""} onChange={e=>setEditTx({...editTx,date:e.target.value})} style={{ ...inputStyle,flex:1 }}/>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <select value={editTx.type} onChange={e=>setEditTx({...editTx,type:e.target.value})} style={{ ...inputStyle,flex:1 }}><option value="ingreso">💰 Ingreso</option><option value="gasto">💸 Gasto</option></select>
                <select value={editTx.cat} onChange={e=>setEditTx({...editTx,cat:e.target.value})} style={{ ...inputStyle,flex:1 }}>{Object.entries(finCats).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
              </div>
              <VisibilityPicker value={editTx.visibility||"private"} onChange={v=>setEditTx({...editTx,visibility:v,shared:v!=="private"})} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={users.filter(u=>u.id!==user.id)}/>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:18 }}>
              <button className="btn" onClick={updateTx} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"10px",borderRadius:10,fontSize:13,fontWeight:700 }}>Guardar</button>
              <button onClick={()=>{deleteTx(editTx.id);setEditTx(null);}} style={{ background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",padding:"10px 16px",borderRadius:10,fontSize:13,cursor:"pointer" }}><Trash2 size={14}/></button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT NOTE MODAL ── */}
      {editNote&&(
        <NoteEditor
          note={editNote}
          onSave={async (updated) => {
            if (updated._draft) {
              // New note — insert to DB now
              const row = { title:updated.title||"Sin título", body:updated.body, type:updated.type, date:liveToday, uid:user.id };
              const {data} = await supabase.from("notes").insert(row).select().single();
              if (data) {
                setNotes(prev => [data, ...prev]);
                setEditNote({...data}); // replace draft with real note (has id now)
              }
            } else {
              // Existing note — update
              const upd = { title:updated.title, body:updated.body, type:updated.type };
              await supabase.from("notes").update(upd).eq("id", updated.id);
              setNotes(notes.map(n => n.id===updated.id ? {...n,...upd} : n));
            }
          }}
          onDelete={(id) => {
            if (id) { deleteNote(id); }
            setEditNote(null);
          }}
          onClose={() => setEditNote(null)}
          accent={user.accent}
          t={t}
        />
      )}

      {/* ── EDIT TASK MODAL ── */}
      {editTask&&(()=>{
        const customCatsM = taskCats.filter(c=>c.uid===user.id);
        const allCatsM = { ...TASK_CATS, ...Object.fromEntries(customCatsM.map(c=>[c.key,{color:c.color,label:c.label}])) };
        return (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setEditTask(null)}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:18,padding:"24px 28px",width:420,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.3)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <span style={{ fontSize:14,fontWeight:700,color:t.text }}>Editar tarea</span>
              <button onClick={()=>setEditTask(null)} style={{ background:"none",border:"none",color:t.textMuted,padding:2,display:"flex" }}><X size={15}/></button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <input value={editTask.title} onChange={e=>setEditTask({...editTask,title:e.target.value})} style={{ ...inputStyle,width:"100%" }}/>
              <div style={{ display:"flex",gap:8 }}>
                <input type="date" value={editTask.deadline||""} onChange={e=>setEditTask({...editTask,deadline:e.target.value})} style={{ ...inputStyle,flex:1 }}/>
                <select value={editTask.priority} onChange={e=>setEditTask({...editTask,priority:e.target.value})} style={{ ...inputStyle,flex:1 }}>
                  <option value="alta">🔴 Alta</option><option value="media">🟠 Media</option><option value="baja">🟢 Baja</option>
                </select>
              </div>
              <select value={editTask.category||"personal"} onChange={e=>setEditTask({...editTask,category:e.target.value,course_id:""})} style={{ ...inputStyle,width:"100%" }}>
                {Object.entries(allCatsM).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              {editTask.category==="universidad"&&(
                <select value={editTask.course_id||""} onChange={e=>setEditTask({...editTask,course_id:e.target.value})} style={{ ...inputStyle,width:"100%" }}>
                  <option value="">Sin curso</option>
                  {myCourses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <VisibilityPicker value={editTask.visibility||"private"} onChange={v=>setEditTask({...editTask,visibility:v,shared:v!=="private"})} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={users.filter(u=>u.id!==user.id)}/>
            </div>

            {/* Subtasks section in modal */}
            <div style={{ marginTop:18,paddingTop:16,borderTop:`1px solid ${t.border}` }}>
              <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.5,marginBottom:10,display:"flex",alignItems:"center",gap:6 }}>
                <CheckSquare size={11}/> SUBTAREAS
                {(()=>{ const p=getSubtaskProgress(editTask.id); return p ? <span style={{ color:p.pct===100?user.accent:t.textFaint,fontWeight:600 }}>· {p.done}/{p.total} ({p.pct}%)</span> : null; })()}
              </div>
              {(()=>{
                const subs = subtasks[editTask.id] || [];
                const p = getSubtaskProgress(editTask.id);
                return (
                  <>
                    {p && (
                      <div style={{ height:4,background:t.border,borderRadius:99,marginBottom:10,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${p.pct}%`,background:p.pct===100?user.accent:PRIO_C[editTask.priority]||user.accent,borderRadius:99,transition:"width .3s" }}/>
                      </div>
                    )}
                    {subs.map(s=>(
                      <SubtaskRow key={s.id} s={s} taskId={editTask.id} accent={user.accent}
                        onToggle={toggleSubtask} onUpdate={updateSubtaskTitle} onDelete={deleteSubtask} t={t}/>
                    ))}
                    <SubtaskAddRow taskId={editTask.id} accent={user.accent} onAdd={addSubtask} t={t} inputStyle={inputStyle}/>
                  </>
                );
              })()}
            </div>

            <div style={{ display:"flex",gap:8,marginTop:18 }}>
              <button className="btn" onClick={updateTask} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"10px",borderRadius:10,fontSize:13,fontWeight:700 }}>Guardar</button>
              <button onClick={()=>{deleteTask(editTask.id);setEditTask(null);}} style={{ background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",padding:"10px 16px",borderRadius:10,fontSize:13,cursor:"pointer" }}><Trash2 size={14}/></button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── CALENDAR CONFIRM MODAL ── */}
      
      {editGrade&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setEditGrade(null)}>
          <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:18,padding:"24px 28px",width:300,boxShadow:"0 24px 60px rgba(0,0,0,.3)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15,fontWeight:700,color:t.text,marginBottom:16 }}>Ingresar nota</div>
            <input type="number" min="0" max="20" step="0.1" value={editGrade.score} onChange={e=>setEditGrade({...editGrade,score:e.target.value})} style={{ width:"100%",...inputStyle,fontSize:20,marginBottom:14,textAlign:"center" }}/>
            <div style={{ display:"flex",gap:8 }}>
              <button className="btn" onClick={saveGrade} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"10px",borderRadius:10,fontSize:13,fontWeight:700 }}>Guardar</button>
              <button onClick={()=>setEditGrade(null)} style={{ flex:1,background:t.input,border:`1px solid ${t.border}`,color:t.textSub,padding:"10px",borderRadius:10,fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="sidebar-full" style={{ width:slim?60:216,transition:"width .26s cubic-bezier(.4,0,.2,1)",background:t.sidebar,borderRight:`1px solid ${t.sidebarBdr}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",zIndex:10,position:"relative",boxShadow:dark?"4px 0 24px rgba(0,0,0,.12)":"2px 0 16px rgba(0,0,0,.05)" }}>

        {/* Logo + collapse */}
        {slim ? (
          <div style={{ padding:"10px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:6,borderBottom:`1px solid ${t.borderSub}` }}>
            <div style={{ width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${user.accent},${user.accent}99)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 10px ${user.accent}45` }}>
              <span style={{ fontSize:14,filter:"brightness(0) invert(1)" }}>⚡</span>
            </div>
            <button onClick={()=>setSlim(false)} title="Expandir menú"
              style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:7,width:36 }}>
              <ChevronRight size={13}/>
            </button>
          </div>
        ) : (
          <div style={{ padding:"16px 14px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${t.borderSub}` }}>
            <div style={{ width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${user.accent},${user.accent}99)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 10px ${user.accent}45` }}>
              <span style={{ fontSize:14,filter:"brightness(0) invert(1)" }}>⚡</span>
            </div>
            <div style={{ flex:1,overflow:"hidden" }}>
              <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:14.5,fontWeight:800,color:t.text,letterSpacing:"-0.4px",whiteSpace:"nowrap" }}>2do<span style={{ color:user.accent }}>.</span>cerebro</div>
              <div style={{ fontSize:9,color:t.textFaint,letterSpacing:.6,fontWeight:500,marginTop:1 }}>productivity suite</div>
            </div>
            <div style={{ display:"flex",gap:2,marginLeft:"auto",flexShrink:0 }}>
              <div style={{ position:"relative" }}>
                <button onClick={()=>setTab("_notifs")} title="Notificaciones" style={{ background:"none",border:"none",color:t.textFaint,padding:"5px",display:"flex",cursor:"pointer",borderRadius:7 }}><Bell size={13}/></button>
                {notifications.length>0&&<div style={{ position:"absolute",top:3,right:3,width:6,height:6,borderRadius:"50%",background:"#f87171",border:`1.5px solid ${t.bg}` }}/>}
              </div>
              <button onClick={()=>setSlim(true)} title="Contraer menú" style={{ background:"none",border:"none",color:t.textGhost,padding:"5px",display:"flex",cursor:"pointer",borderRadius:7 }}><Menu size={13}/></button>
            </div>
          </div>
        )}

        {/* Search bar — fixed in sidebar */}
        {!slim&&(
          <div style={{ padding:"8px 10px",borderBottom:`1px solid ${t.borderSub}` }}>
            <button onClick={()=>setSearchOpen(true)}
              style={{ width:"100%",display:"flex",alignItems:"center",gap:8,background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:10,padding:"7px 11px",cursor:"pointer",transition:"border-color .15s" }}>
              <Search size={12} color={t.textFaint}/>
              <span style={{ flex:1,textAlign:"left",fontSize:12,color:t.textGhost }}>Buscar…</span>
              <kbd style={{ fontSize:9,color:t.textFaint,background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:4,padding:"1px 5px",lineHeight:1.6,whiteSpace:"nowrap" }}>⌘K</kbd>
            </button>
          </div>
        )}
        {slim&&(
          <div style={{ padding:"6px 10px",borderBottom:`1px solid ${t.borderSub}`,display:"flex",justifyContent:"center" }}>
            <button onClick={()=>setSearchOpen(true)} title="Buscar (Ctrl+K)" style={{ background:t.input,border:`1px solid ${t.inputBdr}`,borderRadius:8,width:36,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
              <Search size={13} color={t.textFaint}/>
            </button>
          </div>
        )}

        {/* User profile + logout */}
        <div style={{ padding:"10px 10px",borderBottom:`1px solid ${t.borderSub}`,position:"relative" }}>
          <div onClick={()=>setUserDropdown(!userDropdown)} className="ch" style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:10,background:user.accent+"12",border:`1px solid ${user.accent}28`,cursor:"pointer" }}>
            {user.avatar
              ? <img src={user.avatar} style={{ width:26,height:26,borderRadius:8,objectFit:"cover",border:`1.5px solid ${user.accent}55`,flexShrink:0 }}/>
              : <div style={{ width:26,height:26,borderRadius:8,background:user.accent+"22",border:`1.5px solid ${user.accent}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:user.accent,flexShrink:0 }}>{user.initials}</div>}
            {!slim&&<>
              <span style={{ flex:1,fontSize:12,color:t.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</span>
              <div style={{ width:5,height:5,borderRadius:"50%",background:"#34d399",flexShrink:0 }}/>
            </>}
          </div>
          {userDropdown&&!slim&&(
            <div className="slide-down" style={{ position:"absolute",top:"100%",left:10,right:10,background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:12,padding:"6px",zIndex:50,boxShadow:"0 12px 40px rgba(0,0,0,.25)" }}>
              {/* Current user XP */}
              {(()=>{
                const uStats = userStats[user.id]||{xp:0,level:1};
                const xpInLevel = (uStats.xp||0) % XP_PER_LEVEL;
                return (
                  <div style={{ padding:"8px 10px 10px",marginBottom:4,borderBottom:`1px solid ${t.border}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                      <span style={{ fontSize:11,color:t.textMuted,fontWeight:500 }}>Nivel {uStats.level||1}</span>
                      <span style={{ fontSize:10,color:user.accent,fontWeight:700 }}>{uStats.xp||0} XP</span>
                    </div>
                    <div style={{ height:3,background:t.border,borderRadius:99 }}>
                      <div style={{ height:"100%",background:user.accent,borderRadius:99,width:`${(xpInLevel/XP_PER_LEVEL)*100}%`,transition:"width .4s" }}/>
                    </div>
                  </div>
                );
              })()}
              {/* Friends online */}
              {users.filter(u=>u.id!==user.id).map(u=>{
                const uStats = userStats[u.id]||{xp:0,level:1};
                return (
                  <div key={u.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:8,marginBottom:2,opacity:.72 }}>
                    {u.avatar
                      ? <img src={u.avatar} style={{ width:20,height:20,borderRadius:6,objectFit:"cover",flexShrink:0 }}/>
                      : <div style={{ width:20,height:20,borderRadius:6,background:u.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7.5,fontWeight:700,color:u.accent,flexShrink:0 }}>{u.initials}</div>}
                    <span style={{ fontSize:11,color:t.textMuted,fontWeight:500,flex:1 }}>{u.name}</span>
                    <span style={{ fontSize:9.5,color:t.textFaint }}>Nv.{uStats.level||1}</span>
                  </div>
                );
              })}
              {/* Actions */}
              <div style={{ borderTop:`1px solid ${t.border}`,paddingTop:5,marginTop:4,display:"flex",flexDirection:"column",gap:1 }}>
                <button onClick={()=>{setProfileOpen(true);setUserDropdown(false);}} className="ch" style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"none",border:"none",color:t.textSub,fontSize:12,cursor:"pointer",textAlign:"left" }}>
                  <Settings size={12}/> Mi perfil
                </button>
                <button onClick={()=>{logout();setUserDropdown(false);}} className="ch" style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"none",border:"none",color:"#f87171",fontSize:12,cursor:"pointer",textAlign:"left" }}>
                  <X size={12}/> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1,padding:"8px 8px",overflowY:"auto" }}>
          {!slim&&(
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,paddingLeft:6,paddingRight:4 }}>
              <span style={{ fontSize:8,color:t.textGhost,letterSpacing:.9,fontWeight:700 }}>MÓDULOS</span>
              <button onClick={()=>setNavEditMode(v=>!v)} title="Reordenar" style={{ background:navEditMode?user.accent+"22":"none",border:"none",color:navEditMode?user.accent:t.textGhost,padding:"2px 6px",borderRadius:5,fontSize:9,fontWeight:600,cursor:"pointer",transition:"all .15s" }}>{navEditMode?"✓ listo":"⠿ orden"}</button>
            </div>
          )}
          {orderedNav.map(({id,Ic,label})=>(
            <div key={id}
              draggable={navEditMode&&!slim}
              onDragStart={()=>onNavDragStart(id)}
              onDragOver={e=>{e.preventDefault();onNavDragOver(id);}}
              onDrop={()=>onNavDrop(id)}
              className="nav-i"
              onClick={()=>{if(!navEditMode)setTab(id);}}
              style={{ display:"flex",alignItems:"center",gap:9,padding:"7px 10px",marginBottom:1,background:tab===id?`${user.accent}14`:navDragOver===id&&navEditMode?`${user.accent}08`:"transparent",borderRadius:9,color:tab===id?user.accent:t.textMuted,transition:"all .16s",cursor:navEditMode?"grab":tab===id?"default":"pointer",opacity:navDragging===id?.45:1,outline:navDragOver===id&&navEditMode?`1px dashed ${user.accent}50`:"none" }}>
              {navEditMode&&!slim&&<GripVertical size={10} color={t.textGhost} style={{flexShrink:0}}/>}
              <Ic size={14} strokeWidth={tab===id?2.4:1.9} style={{flexShrink:0}}/>
              {!slim&&<span style={{ fontSize:12,fontWeight:tab===id?600:400,flex:1 }}>{label}</span>}
              {!slim&&tab===id&&!navEditMode&&<div style={{ width:4,height:4,borderRadius:"50%",background:user.accent,opacity:.8 }}/>}
            </div>
          ))}
        </nav>

        {/* Theme toggle + report */}
        <div style={{ padding:"10px 10px 14px",borderTop:`1px solid ${t.borderSub}` }}>
          <button onClick={toggleTheme} className="nav-i" style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",width:"100%",background:"none",border:"none",color:t.textMuted,marginBottom:slim?0:8 }}>
            {dark?<Sun size={15}/>:<Moon size={15}/>}
            {!slim&&<span style={{ fontSize:12.5 }}>{dark?"Modo claro":"Modo oscuro"}</span>}
          </button>
          {!slim&&(()=>{
            const cfg = getUserReportCfg(user.id);
            const emailTarget = cfg.email || user.email;
            return (
              <div onClick={()=>setTab("settings")} style={{ padding:"11px 13px",background:cfg.enabled?"rgba(59,130,246,.07)":t.input,borderRadius:12,border:`1px solid ${cfg.enabled?"rgba(59,130,246,.18)":t.border}`,cursor:"pointer",transition:"all .2s" }}>
                <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:4 }}>
                  <Bell size={10} color={cfg.enabled?"#3b82f6":t.textFaint}/>
                  <span style={{ fontSize:8.5,color:cfg.enabled?"#3b82f6":t.textFaint,letterSpacing:1,fontWeight:700 }}>REPORTE DIARIO</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:cfg.enabled?"#34d399":"#64748b",flexShrink:0 }}/>
                  <div style={{ fontSize:10,color:t.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {cfg.enabled ? (emailTarget ? `→ ${emailTarget.split("@")[0]}` : "Sin email") : "Desactivado"}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-pad fu" style={{ flex:1,overflow:"auto",padding:"26px 30px",position:"relative" }}>
        <ErrorBoundary accent={user.accent} t={t}>

        {/* ══ NOTIFICACIONES ══ */}
        {tab==="_notifs"&&(
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div><h1 style={h1Style}>Notificaciones</h1><p style={subStyle}>{notifications.length} alertas activas</p></div>
              <button onClick={()=>setTab("dashboard")} style={{ background:t.bgCard,border:`1px solid ${t.border}`,color:t.textMuted,padding:"8px 14px",borderRadius:10,fontSize:12,cursor:"pointer" }}>← Volver</button>
            </div>
            {notifications.length===0?(
              <div style={{ textAlign:"center",padding:"60px 20px" }}>
                <div style={{ fontSize:48,marginBottom:12 }}>✨</div>
                <div style={{ fontSize:16,fontWeight:600,color:t.text,marginBottom:6 }}>Todo al día</div>
                <div style={{ fontSize:13,color:t.textMuted }}>No hay tareas vencidas ni entregas próximas</div>
              </div>
            ):(
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {notifications.map((n,i)=>(
                  <div key={n.id} className="pop-in" style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:n.urgent?"rgba(248,113,113,.06)":t.bgCard,border:`1px solid ${n.urgent?"rgba(248,113,113,.25)":t.border}`,borderRadius:14,animationDelay:`${i*50}ms` }}>
                    <span style={{ fontSize:20,flexShrink:0 }}>{n.icon}</span>
                    <span style={{ flex:1,fontSize:13,color:t.text,fontWeight:n.urgent?600:400 }}>{n.label}</span>
                    {n.urgent&&<span style={{ fontSize:10,fontWeight:700,color:"#f87171",background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",borderRadius:99,padding:"2px 9px" }}>URGENTE</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={4}/>;

          const uStats     = userStats[user.id]||{xp:0,level:1,badges:[]};
          const streak     = getStreak(user.id);
          const xpInLevel  = (uStats.xp||0) % XP_PER_LEVEL;
          const xpPct      = Math.round((xpInLevel/XP_PER_LEVEL)*100);
          const myHabits   = habits.filter(h=>h.uid===user.id);
          const habDoneToday = myHabits.filter(h=>habitLogs.some(l=>l.habit_id===h.id&&l.date===liveToday&&l.uid===user.id));
          const habPct     = myHabits.length ? Math.round((habDoneToday.length/myHabits.length)*100) : 0;

          // Upcoming (next 7 days)
          const in7 = new Date(nowLima()); in7.setDate(in7.getDate()+7);
          const upcomingTasks = myT.filter(tx=>tx.deadline&&tx.status!=="completada"&&tx.deadline>=liveToday&&tx.deadline<=in7.toISOString().slice(0,10)).sort((a,b)=>a.deadline.localeCompare(b.deadline));
          const upcomingEvals = (()=>{
            const allNodes = Object.values(courseEvalTree).flat();
            return allNodes.filter(n=>n.type==="leaf"&&n.date&&n.date>=liveToday&&n.date<=in7.toISOString().slice(0,10)&&n.uid===user.id).sort((a,b)=>a.date.localeCompare(b.date));
          })();
          const upcomingAll = [...upcomingTasks.map(x=>({...x,_kind:"task"})), ...upcomingEvals.map(x=>({...x,_kind:"eval",deadline:x.date}))].sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,6);

          // Academic summaries
          const criticalCourses = myCourses.map(c=>({ c, avg: computeCourseAvg(c.id) }))
            .filter(({avg})=>avg!==null)
            .sort((a,b)=>Number(a.avg)-Number(b.avg))
            .slice(0,4);

          // Feed/activity
          const otherUser   = users.find(u=>u.id!==user.id);
          const otherStats  = userStats[otherUser?.id]||{xp:0,level:1,badges:[]};
          const otherStreak = otherUser ? getStreak(otherUser.id) : 0;
          const timeline    = [...feedEvents].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,30);
          const sharedGoalsThisWeek = goals.filter(g=>g.shared&&isVisibleToMe(g)&&g.week_start===weekRange.start);

          // Couple mood
          const todayMyMood    = coupleEnabled ? coupleMoods.find(m=>m.uid===user.id&&m.date===liveToday) : null;
          const todayTheirMood = coupleEnabled ? coupleMoods.find(m=>m.uid===partner?.id&&m.date===liveToday) : null;
          const MOOD_LABELS    = ["😔","😕","😐","😊","🥰"];

          const timeAgo = (ts) => {
            const diff = (Date.now()-new Date(ts))/1000;
            if (diff<60)    return "ahora";
            if (diff<3600)  return `${Math.floor(diff/60)}m`;
            if (diff<86400) return `${Math.floor(diff/3600)}h`;
            return `${Math.floor(diff/86400)}d`;
          };

          const hour = nowLima().getHours();
          const greeting = hour<12 ? "Buenos días" : hour<19 ? "Buenas tardes" : "Buenas noches";
          const greetEmoji = hour<12 ? "🌅" : hour<19 ? "☀️" : "🌙";

          const sc = (g) => g===null?"#64748b":Number(g)>=14?"#34d399":Number(g)>=11?"#fb923c":"#f87171";

          return (
          <div className="fu" style={{ display:"flex",flexDirection:"column",gap:18 }}>

            {/* ── HERO HEADER ─────────────────────────────────────────────── */}
            <div style={{ background:`linear-gradient(135deg,${user.accent}15,${user.accent}05)`,border:`1px solid ${user.accent}20`,borderRadius:20,padding:"20px 22px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12 }}>
                <div>
                  <div style={{ fontSize:11,color:user.accent,fontWeight:700,letterSpacing:.5,marginBottom:4 }}>
                    {greetEmoji} {greeting.toUpperCase()}
                  </div>
                  <h1 style={{ fontFamily:"'Outfit',sans-serif",fontSize:26,fontWeight:900,color:t.text,lineHeight:1.1,margin:0 }}>
                    {user.name?.split(" ")[0]}
                  </h1>
                  <div style={{ fontSize:12,color:t.textMuted,marginTop:5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                    <CalendarDays size={11} color={t.textFaint}/>
                    {nowLima().toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"})}
                    {streak>0&&<><span style={{ opacity:.4 }}>·</span><span style={{ color:"#f59e0b",fontWeight:600 }}>🔥 {streak} días</span></>}
                    {pend.length>0&&<><span style={{ opacity:.4 }}>·</span><span style={{ color:user.accent,fontWeight:600 }}>{pend.length} pendientes</span></>}
                  </div>
                </div>

                {/* XP ring summary */}
                <div style={{ display:"flex",alignItems:"center",gap:14,flexShrink:0 }}>
                  {/* Clock + weather */}
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Outfit',monospace",fontSize:28,fontWeight:900,color:user.accent,letterSpacing:-1,lineHeight:1 }}>
                      {clock.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                    <div style={{ fontSize:11,color:t.textMuted,marginTop:2,display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end" }}>
                      {weather ? <><span>{weather.icon}</span><span>{weather.temp}°C</span><span style={{ opacity:.4 }}>·</span></> : null}
                      <span>Lima 🇵🇪</span>
                    </div>
                  </div>
                  {coupleEnabled&&partner&&(todayMyMood||todayTheirMood)&&(
                    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20 }}>{todayMyMood?MOOD_LABELS[todayMyMood.mood-1]:"—"}</div>
                        <div style={{ fontSize:9,color:t.textFaint }}>tú</div>
                      </div>
                      <div style={{ fontSize:14,color:t.textFaint }}>·</div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20 }}>{todayTheirMood?MOOD_LABELS[todayTheirMood.mood-1]:"—"}</div>
                        <div style={{ fontSize:9,color:t.textFaint }}>{partner.name?.split(" ")[0]}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:9,color:user.accent,fontWeight:700,letterSpacing:.5,marginBottom:3 }}>NV. {uStats.level}</div>
                    <div style={{ position:"relative",width:52,height:52 }}>
                      <svg viewBox="0 0 52 52" style={{ transform:"rotate(-90deg)",width:52,height:52 }}>
                        <circle cx="26" cy="26" r="22" fill="none" stroke={user.accent+"25"} strokeWidth="4"/>
                        <circle cx="26" cy="26" r="22" fill="none" stroke={user.accent} strokeWidth="4"
                          strokeDasharray={`${2*Math.PI*22}`}
                          strokeDashoffset={`${2*Math.PI*22*(1-xpPct/100)}`}
                          strokeLinecap="round" style={{ transition:"stroke-dashoffset .6s" }}/>
                      </svg>
                      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                        <div style={{ fontSize:10,fontWeight:800,color:user.accent,lineHeight:1 }}>{uStats.xp||0}</div>
                        <div style={{ fontSize:7,color:t.textFaint }}>XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick-action row: Hábitos de hoy */}
              {myHabits.length>0&&(
                <div style={{ marginTop:16,paddingTop:14,borderTop:`1px solid ${user.accent}20` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                    <span style={{ fontSize:10,fontWeight:700,color:user.accent,letterSpacing:.5 }}>HÁBITOS HOY · {habDoneToday.length}/{myHabits.length}</span>
                    <span style={{ fontSize:11,fontWeight:700,color:habPct===100?"#34d399":user.accent }}>{habPct}%</span>
                  </div>
                  <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:8 }}>
                    {myHabits.map(h=>{ const done=habDoneToday.some(d=>d.id===h.id); return (
                      <button key={h.id} onClick={()=>logHabit(h)}
                        style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:99,background:done?h.color+"25":t.input,border:`1.5px solid ${done?h.color+"60":t.inputBdr}`,color:done?h.color:t.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .2s" }}>
                        <span>{h.icon}</span><span>{h.name}</span>{done&&<Check size={9}/>}
                      </button>
                    ); })}
                  </div>
                  <div style={{ height:3,background:user.accent+"20",borderRadius:99 }}>
                    <div style={{ height:"100%",background:habPct===100?"#34d399":user.accent,borderRadius:99,width:`${habPct}%`,transition:"width .6s cubic-bezier(.4,0,.2,1)" }}/>
                  </div>
                </div>
              )}
            </div>

            <OnboardingBanner user={user} t={t} accent={user.accent}
              tasks={tasks.filter(x=>x.uid===user.id)} habits={habits.filter(x=>x.uid===user.id)}
              notes={notes.filter(x=>x.uid===user.id)} events={events.filter(x=>x.uid===user.id)}
              onNavigate={setTab}/>

            {/* ── ROW 1: Hoy + Racha/XP ───────────────────────────────────── */}
            <div style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14 }} className="two-col">

              {/* Agenda de hoy */}
              <div style={cardStyle()}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}><CalendarDays size={13} color={user.accent}/><span style={secLabel}>HOY</span></div>
                  <button onClick={()=>setTab("calendar")} style={{ background:"none",border:"none",color:t.textMuted,fontSize:10.5,display:"flex",alignItems:"center",gap:3,cursor:"pointer" }}>calendar <ChevronRight size={10}/></button>
                </div>
                {todE.length===0&&pend.filter(t=>!t.deadline||t.deadline===liveToday).length===0
                  ? <p style={{ color:t.textFaint,fontSize:13,padding:"8px 0",textAlign:"center" }}>Día libre ✨</p>
                  : <>
                    {todE.slice(0,3).map((e,i)=>{ const c=EVT_C[e.type]||EVT_C.personal; return (
                      <div key={e.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:c.bg,borderRadius:11,border:`1px solid ${c.dot}20`,marginBottom:5 }}>
                        <div style={{ width:28,height:28,borderRadius:8,background:c.dot+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Clock size={12} color={c.dot}/></div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:12,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.title}</div>
                          <div style={{ fontSize:10,color:t.textMuted }}>{e.time||"Todo el día"}</div>
                        </div>
                      </div>
                    ); })}
                    {myT.filter(tx=>tx.priority==="alta"&&tx.status!=="completada").slice(0,2).map(tx=>(
                      <div key={tx.id} onClick={()=>cycleTask(tx.id,tx.status)}
                        style={{ display:"flex",alignItems:"center",gap:9,padding:"7px 10px",borderRadius:10,background:t.input,border:"1px solid rgba(248,113,113,.2)",marginBottom:5,cursor:"pointer" }}>
                        <div style={{ width:14,height:14,borderRadius:4,border:`2px solid #f87171`,flexShrink:0 }}/>
                        <span style={{ flex:1,fontSize:12,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.title}</span>
                        <span style={{ fontSize:9,color:"#f87171",fontWeight:700,background:"rgba(248,113,113,.12)",borderRadius:5,padding:"1px 6px" }}>ALTA</span>
                      </div>
                    ))}
                  </>}
              </div>

              {/* Racha + XP + Foco rápido */}
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div style={{ background:`linear-gradient(135deg,#f59e0b18,#f59e0b06)`,border:"1px solid #f59e0b30",borderRadius:16,padding:"14px 16px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:9,color:"#f59e0b",fontWeight:700,letterSpacing:.5,marginBottom:3 }}>RACHA</div>
                      <div style={{ fontSize:32,fontWeight:900,color:"#f59e0b",lineHeight:1 }}>🔥 {streak}</div>
                      <div style={{ fontSize:10,color:t.textMuted }}>días consecutivos</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9,color:user.accent,fontWeight:700,letterSpacing:.5,marginBottom:3 }}>XP</div>
                      <div style={{ fontSize:22,fontWeight:800,color:user.accent,lineHeight:1 }}>{uStats.xp||0}</div>
                      <div style={{ fontSize:9,color:t.textFaint }}>Nv. {uStats.level}</div>
                    </div>
                  </div>
                  <div style={{ height:3,background:t.border,borderRadius:99 }}>
                    <div style={{ height:"100%",background:user.accent,borderRadius:99,width:`${xpPct}%`,transition:"width .5s" }}/>
                  </div>
                  <div style={{ fontSize:9,color:t.textFaint,marginTop:3 }}>{xpInLevel}/{XP_PER_LEVEL} XP → Nv.{(uStats.level||1)+1}</div>
                </div>

                {/* Foco rápido */}
                <button onClick={()=>setTab("focus")}
                  style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:14,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .15s" }}>
                  <div style={{ width:34,height:34,borderRadius:10,background:user.accent+"18",border:`1px solid ${user.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Timer size={16} color={user.accent}/>
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:12,fontWeight:700,color:t.text }}>Iniciar Pomodoro</div>
                    <div style={{ fontSize:10,color:t.textMuted }}>25 min de foco</div>
                  </div>
                  <ChevronRight size={14} color={t.textFaint} style={{ marginLeft:"auto" }}/>
                </button>
              </div>
            </div>

            {/* ── ROW 2: Próximas entregas + Académico ────────────────────── */}
            {(upcomingAll.length>0||criticalCourses.length>0)&&(
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="two-col">

                {/* Próximas entregas */}
                {upcomingAll.length>0&&(
                  <div style={cardStyle()}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}><Timer size={13} color="#a855f7"/><span style={secLabel}>PRÓXIMOS 7 DÍAS</span></div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                      {upcomingAll.map((item,i)=>{
                        const daysLeft = Math.ceil((new Date(item.deadline+"T12:00")-new Date())/(1000*60*60*24));
                        const col = daysLeft<=1?"#f87171":daysLeft<=3?"#fb923c":"#a855f7";
                        const course = item._kind==="eval"?myCourses.find(c=>c.id===item.course_id):null;
                        return (
                          <div key={item.id+item._kind} style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:col+"0d",borderRadius:10,border:`1px solid ${col}20` }}>
                            <span style={{ fontSize:14,flexShrink:0 }}>{item._kind==="eval"?"📝":"📌"}</span>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:12,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.title||item.name}</div>
                              {course&&<div style={{ fontSize:9,color:t.textFaint }}>{course.name}</div>}
                            </div>
                            <span style={{ fontSize:10,fontWeight:700,color:col,whiteSpace:"nowrap",flexShrink:0 }}>{daysLeft===0?"hoy":daysLeft===1?"mañana":`${daysLeft}d`}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Promedios académicos */}
                {criticalCourses.length>0&&(
                  <div style={cardStyle()}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}><GraduationCap size={13} color="#f59e0b"/><span style={secLabel}>ACADÉMICO</span></div>
                      <button onClick={()=>setTab("academico")} style={{ background:"none",border:"none",color:t.textMuted,fontSize:10.5,display:"flex",alignItems:"center",gap:3,cursor:"pointer" }}>ver <ChevronRight size={10}/></button>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                      {criticalCourses.map(({c,avg})=>(
                        <div key={c.id} style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:4,height:36,borderRadius:99,background:c.color,flexShrink:0 }}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:12,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.name}</div>
                            <div style={{ height:3,background:t.border,borderRadius:99,marginTop:4 }}>
                              <div style={{ height:"100%",width:`${Math.min(100,(Number(avg)/20)*100)}%`,background:sc(avg),borderRadius:99,transition:"width .5s" }}/>
                            </div>
                          </div>
                          <div style={{ fontSize:17,fontWeight:900,color:sc(avg),flexShrink:0,minWidth:36,textAlign:"right" }}>{Number(avg).toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ROW 3: Estado de ánimo de pareja (si activo) ────────────── */}
            {coupleEnabled&&partner&&(
              <div style={{ background:`linear-gradient(135deg,#f472b60a,${t.bgCard})`,border:"1px solid #f472b625",borderRadius:16,padding:"14px 18px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:13 }}>❤️</span>
                    <span style={{ fontSize:10,fontWeight:700,color:"#f472b6",letterSpacing:.5 }}>{coupleTabName.toUpperCase()} · HOY</span>
                  </div>
                  <button onClick={()=>setTab("pareja")} style={{ background:"none",border:"none",color:t.textMuted,fontSize:10.5,display:"flex",alignItems:"center",gap:3,cursor:"pointer" }}>ver <ChevronRight size={10}/></button>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  {[{u:user,mood:todayMyMood,label:"Tú"},{u:partner,mood:todayTheirMood,label:partner.name?.split(" ")[0]}].map(({u:u2,mood,label})=>(
                    <div key={u2.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:t.input,borderRadius:12 }}>
                      {u2.avatar?<img src={u2.avatar} style={{ width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
                        :<div style={{ width:32,height:32,borderRadius:"50%",background:u2.id===user.id?user.accent:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#07070f",flexShrink:0 }}>{u2.initials}</div>}
                      <div>
                        <div style={{ fontSize:10,color:t.textMuted,fontWeight:600 }}>{label}</div>
                        <div style={{ fontSize:22,lineHeight:1.2 }}>{mood?MOOD_LABELS[mood.mood-1]:"—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!todayMyMood&&(
                  <button onClick={()=>{setTab("pareja");setCoupleSubTab("animo");}}
                    style={{ width:"100%",marginTop:10,background:"#f472b612",border:"1px dashed #f472b640",color:"#f472b6",borderRadius:9,padding:"7px",fontSize:11,fontWeight:600,cursor:"pointer" }}>
                    + Registrar mi ánimo de hoy
                  </button>
                )}
              </div>
            )}

            {/* ── ROW 4: Finanzas ────────────────────────────────────────── */}
            <div style={cardStyle()}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}><Wallet size={13} color="#34d399"/><span style={secLabel}>FINANZAS · {new Date(finMonth+"-15").toLocaleDateString("es-PE",{month:"long"}).toUpperCase()}</span></div>
                <button onClick={()=>setTab("finanzas")} style={{ background:"none",border:"none",color:t.textMuted,fontSize:10.5,display:"flex",alignItems:"center",gap:3,cursor:"pointer" }}>ver todo <ChevronRight size={10}/></button>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[
                  { label:"Ingresos", val:`S/ ${Math.round(ingresos)}`, color:"#34d399", bg:"rgba(52,211,153,.08)", border:"rgba(52,211,153,.2)" },
                  { label:"Gastos",   val:`S/ ${Math.round(gastos)}`,   color:"#f87171", bg:"rgba(248,113,113,.08)", border:"rgba(248,113,113,.2)" },
                  { label:"Balance",  val:`${balance>=0?"+":""}S/ ${Math.abs(Math.round(balance))}`, color:balance>=0?"#34d399":"#f87171", bg:balance>=0?"rgba(52,211,153,.06)":"rgba(248,113,113,.06)", border:balance>=0?"rgba(52,211,153,.2)":"rgba(248,113,113,.2)" },
                ].map(({label,val,color,bg,border})=>(
                  <div key={label} style={{ background:bg,border:`1px solid ${border}`,borderRadius:11,padding:"10px 12px" }}>
                    <div style={{ fontSize:9,color,fontWeight:700,letterSpacing:.5,marginBottom:3 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize:15,fontWeight:800,color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ROW 5: Feed ─────────────────────────────────────────────── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="two-col">

              {/* Head-to-head */}
              {otherUser&&(
                <div style={cardStyle()}>
                  <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:14 }}>⚔️ HEAD TO HEAD</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:14 }}>
                    <div style={{ textAlign:"center" }}>
                      {user.avatar?<img src={user.avatar} style={{ width:40,height:40,borderRadius:12,objectFit:"cover",margin:"0 auto 6px",display:"block",border:`2px solid ${user.accent}50` }}/>
                        :<div style={{ width:40,height:40,borderRadius:12,background:user.accent+"22",border:`2px solid ${user.accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:user.accent,margin:"0 auto 6px" }}>{user.initials}</div>}
                      <div style={{ fontSize:11,fontWeight:700,color:t.text }}>{user.name?.split(" ")[0]}</div>
                      <div style={{ fontSize:10,color:user.accent }}>Nv.{uStats.level}</div>
                    </div>
                    <div style={{ fontSize:14,fontWeight:900,color:t.textFaint }}>VS</div>
                    <div style={{ textAlign:"center" }}>
                      {otherUser.avatar?<img src={otherUser.avatar} style={{ width:40,height:40,borderRadius:12,objectFit:"cover",margin:"0 auto 6px",display:"block",border:`2px solid ${otherUser.accent}50` }}/>
                        :<div style={{ width:40,height:40,borderRadius:12,background:otherUser.accent+"22",border:`2px solid ${otherUser.accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:otherUser.accent,margin:"0 auto 6px" }}>{otherUser.initials}</div>}
                      <div style={{ fontSize:11,fontWeight:700,color:t.text }}>{otherUser.name?.split(" ")[0]}</div>
                      <div style={{ fontSize:10,color:otherUser.accent }}>Nv.{otherStats.level}</div>
                    </div>
                  </div>
                  {[
                    { label:"XP", me:uStats.xp||0, other:otherStats.xp||0, fmt:v=>`${v}` },
                    { label:"Racha", me:streak, other:otherStreak, fmt:v=>`🔥${v}d` },
                    { label:"Tareas ✓", me:tasks.filter(t=>t.uid===user.id&&t.status==="completada").length, other:tasks.filter(t=>t.uid===otherUser.id&&t.status==="completada").length, fmt:v=>`${v}` },
                  ].map(({label,me,other,fmt})=>{
                    const total=me+other; const myPct=total>0?Math.round((me/total)*100):50;
                    return (
                      <div key={label} style={{ marginBottom:9 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                          <span style={{ fontSize:10,fontWeight:700,color:me>=other?user.accent:t.textMuted }}>{fmt(me)}</span>
                          <span style={{ fontSize:9,color:t.textFaint }}>{label}</span>
                          <span style={{ fontSize:10,fontWeight:700,color:other>me?otherUser.accent:t.textMuted }}>{fmt(other)}</span>
                        </div>
                        <div style={{ height:4,background:t.border,borderRadius:99,overflow:"hidden",display:"flex" }}>
                          <div style={{ width:`${myPct}%`,background:user.accent,transition:"width .5s",borderRadius:"99px 0 0 99px" }}/>
                          <div style={{ flex:1,background:otherUser.accent,borderRadius:"0 99px 99px 0" }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activity timeline */}
              <div style={cardStyle()}>
                <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12 }}>📋 ACTIVIDAD RECIENTE</div>
                {timeline.length===0
                  ? <div style={{ color:t.textFaint,fontSize:12,padding:"16px 0",textAlign:"center" }}>Sin actividad aún.</div>
                  : <div style={{ display:"flex",flexDirection:"column",gap:1,maxHeight:260,overflowY:"auto" }}>
                      {timeline.map((ev,i)=>{
                        const author=users.find(u=>u.id===ev.uid);
                        const fi=FEED_ICONS[ev.type]||{icon:"•",color:t.textMuted,label:ev.type};
                        return (
                          <div key={ev.id||i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:9,background:i%2===0?t.input:"transparent" }}>
                            <span style={{ fontSize:14,flexShrink:0 }}>{fi.icon}</span>
                            <div style={{ flex:1,minWidth:0 }}>
                              <span style={{ fontSize:11,fontWeight:700,color:author?.accent||fi.color }}>{author?.name?.split(" ")[0]||"?"} </span>
                              <span style={{ fontSize:11,color:t.textMuted }}>{fi.label}</span>
                              {ev.detail&&<div style={{ fontSize:10,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.detail}</div>}
                            </div>
                            <span style={{ fontSize:9,color:t.textFaint,flexShrink:0 }}>{timeAgo(ev.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>}
              </div>
            </div>

            {/* ── Metas compartidas (si hay) ──────────────────────────────── */}
            {sharedGoalsThisWeek.length>0&&(
              <div style={cardStyle()}>
                <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12 }}>🎯 METAS COMPARTIDAS ESTA SEMANA</div>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {sharedGoalsThisWeek.map(g=>{
                    const prog=computeGoalProgress(g); const pct=Math.min(100,Math.round((prog/g.target)*100));
                    const gt=GOAL_TYPES[g.type]||GOAL_TYPES.tasks; const author=users.find(u=>u.id===g.uid);
                    return (
                      <div key={g.id}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                          <span style={{ fontSize:12,color:t.text }}>{gt.icon} {g.title}</span>
                          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                            {author&&<span style={{ fontSize:9,color:author.accent,fontWeight:700 }}>{author.name?.split(" ")[0]}</span>}
                            <span style={{ fontSize:11,fontWeight:700,color:pct===100?gt.color:t.textMuted }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ height:4,background:t.border,borderRadius:99,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${pct}%`,background:gt.color,borderRadius:99,transition:"width .5s" }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
          );
        })()}


        {/* ══ HÁBITOS ══ */}
        {tab==="habitos"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={3}/>;
          const myHabits = habits.filter(h=>isVisibleToMe(h));
          const myOwnHabits = habits.filter(h=>h.uid===user.id);
          const uStats = userStats[user.id]||{xp:0,level:1,badges:[]};
          const xpInLevel = (uStats.xp||0) % XP_PER_LEVEL;
          const streak = getStreak(user.id);
          const earnedBadges = (Array.isArray(uStats.badges)?uStats.badges:[]).map(id=>BADGES_DEF.find(b=>b.id===id)).filter(Boolean);
          const unlockedBadges = new Set(Array.isArray(uStats.badges)?uStats.badges:[]);
          const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().slice(0,10); });
          const totalPossibleXP = myOwnHabits.reduce((a,h)=>a+(h.xp_value||10),0);
          const todayEarnedXP = myOwnHabits.reduce((a,h)=>{
            const log = habitLogs.find(l=>l.habit_id===h.id&&l.date===habitDate&&l.uid===user.id);
            if (!log) return a;
            if (h.target_type==="check") return a+(h.xp_value||10);
            return a+Math.round((h.xp_value||10)*Math.min(1,Number(log.value)/(h.target_value||1)));
          },0);
          const dayPct = totalPossibleXP>0 ? Math.round((todayEarnedXP/totalPossibleXP)*100) : 0;
          const streakQualifies = dayPct>=75;

          return (
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
              <div><div style={{ display:"flex",alignItems:"center",gap:8 }}><h1 style={h1Style}>Hábitos</h1><HelpTip id="habitos" t={t} accent={user.accent}/></div><p style={subStyle}>{myOwnHabits.length} hábitos propios · racha: {streak} días 🔥</p></div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={resetXP} style={{ background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",padding:"8px 14px",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}><RotateCcw size={11}/> Reset XP</button>
                <button className="btn" onClick={()=>setHabitForm(!habitForm)} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><Plus size={13}/> Nuevo hábito</button>
              </div>
            </div>

            {/* XP / Level bar */}
            <div style={{ ...cardStyle(),marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ background:user.accent+"22",border:`1.5px solid ${user.accent}55`,borderRadius:12,padding:"6px 14px",display:"flex",alignItems:"center",gap:6 }}>
                    <Zap size={13} color={user.accent}/>
                    <span style={{ fontSize:13,fontWeight:800,color:user.accent }}>Nivel {uStats.level||1}</span>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                    <Flame size={14} color="#f59e0b"/>
                    <span style={{ fontSize:14,fontWeight:700,color:"#f59e0b" }}>{streak} días</span>
                    <span style={{ fontSize:10,color:t.textMuted }}>racha</span>
                  </div>
                </div>
                <span style={{ fontSize:13,fontWeight:700,color:user.accent }}>{uStats.xp||0} XP total</span>
              </div>
              <div style={{ height:8,background:t.border,borderRadius:99,marginBottom:4 }}>
                <div style={{ height:"100%",background:`linear-gradient(90deg,${user.accent},${user.accent}aa)`,borderRadius:99,width:`${(xpInLevel/XP_PER_LEVEL)*100}%`,transition:"width .6s cubic-bezier(.4,0,.2,1)" }}/>
              </div>
              <div style={{ fontSize:10,color:t.textMuted }}>{xpInLevel} / {XP_PER_LEVEL} XP para nivel {(uStats.level||1)+1}</div>
            </div>

            {/* New habit form */}
            {habitForm&&(
              <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:16 }}>
                <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.5,marginBottom:10 }}>NUEVO HÁBITO</div>
                <div style={{ display:"flex",gap:9,alignItems:"center",flexWrap:"wrap",marginBottom:10 }}>
                  <input value={newHabit.icon} onChange={e=>setNewHabit({...newHabit,icon:e.target.value})} style={{ width:52,textAlign:"center",fontSize:20,...inputStyle }}/>
                  <input value={newHabit.name} onChange={e=>setNewHabit({...newHabit,name:e.target.value})} placeholder="Nombre del hábito" style={{ flex:1,minWidth:150,...inputStyle }}/>
                  <select value={newHabit.target_type} onChange={e=>setNewHabit({...newHabit,target_type:e.target.value})} style={inputStyle}>
                    <option value="check">✓ Check diario</option>
                    <option value="quantity"># Cantidad</option>
                  </select>
                  {newHabit.target_type==="quantity"&&<>
                    <input type="number" value={newHabit.target_value} onChange={e=>setNewHabit({...newHabit,target_value:e.target.value})} placeholder="Meta" style={{ width:80,...inputStyle }}/>
                    <input value={newHabit.target_unit} onChange={e=>setNewHabit({...newHabit,target_unit:e.target.value})} placeholder="unidad (ej: vasos)" style={{ width:120,...inputStyle }}/>
                  </>}
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:11,color:t.textMuted }}>XP:</span>
                    <input type="number" value={newHabit.xp_value} onChange={e=>setNewHabit({...newHabit,xp_value:e.target.value})} style={{ width:64,...inputStyle }} min="1" max="100"/>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:11,color:t.textMuted }}>Color:</span>
                    <input type="color" value={newHabit.color} onChange={e=>setNewHabit({...newHabit,color:e.target.value})} style={{ width:36,height:32,border:`1px solid ${t.inputBdr}`,borderRadius:8,background:t.input,cursor:"pointer",padding:2 }}/>
                  </div>
                  <VisibilityPicker value={newHabit.visibility||"private"} onChange={v=>setNewHabit({...newHabit,visibility:v,shared:v!=="private"})} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={users.filter(u=>u.id!==user.id)}/>
                  <button className="btn" onClick={saveHabit} disabled={saving} style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 17px",borderRadius:9,fontSize:12,fontWeight:700,opacity:saving?0.6:1,display:"flex",alignItems:"center",gap:6 }}>{saving?<><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>Guardando...</>:"Guardar"}</button>
                  <button onClick={()=>setHabitForm(false)} style={{ background:"none",border:"none",color:t.textMuted,padding:5 }}><X size={15}/></button>
                </div>
                {newHabit.target_type==="quantity"&&<div style={{ fontSize:10,color:t.textFaint,marginTop:4 }}>
                  💡 Los XP se otorgan proporcionalmente: {Math.round((newHabit.xp_value||10)*0.25)} XP al 25%, {Math.round((newHabit.xp_value||10)*0.5)} XP al 50%, {newHabit.xp_value||10} XP al completar la meta.
                </div>}
              </div>
            )}

            {/* Date picker */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
              <span style={{ fontSize:11,fontWeight:700,color:t.textFaint,letterSpacing:.7 }}>REGISTRANDO PARA:</span>
              <input type="date" value={habitDate} max={liveToday} onChange={e=>setHabitDate(e.target.value)} style={{ ...inputStyle,fontSize:12,padding:"5px 10px" }}/>
              {habitDate!==liveToday&&<button onClick={()=>setHabitDate(liveToday)} style={{ background:user.accent+"22",border:`1px solid ${user.accent}40`,color:user.accent,borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer" }}>Hoy</button>}
              {habitDate!==liveToday&&<span style={{ fontSize:11,color:"#f59e0b" }}>📅 Registrando ayer</span>}
            </div>

            {/* Progress bar for selected day */}
            {totalPossibleXP>0&&(
              <div style={{ ...cardStyle(),marginBottom:16,padding:"12px 16px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                  <span style={{ fontSize:11,color:t.textMuted,fontWeight:600 }}>{todayEarnedXP} / {totalPossibleXP} XP del día · {dayPct}%</span>
                  <span style={{ fontSize:11,fontWeight:700,color:streakQualifies?"#34d399":"#f59e0b" }}>{streakQualifies?"✓ Racha activa":"≥75% para racha"}</span>
                </div>
                <div style={{ height:6,background:t.border,borderRadius:99 }}>
                  <div style={{ height:"100%",background:dayPct>=75?`linear-gradient(90deg,${user.accent},#34d399)`:`linear-gradient(90deg,${user.accent},${user.accent}88)`,borderRadius:99,width:`${dayPct}%`,transition:"width .5s" }}/>
                </div>
              </div>
            )}

            {/* Habits grid */}
            <div style={{ marginBottom:20 }}>
              {myHabits.length===0&&<p style={{ color:t.textFaint,fontSize:13,padding:"16px 0" }}>No hay hábitos aún. ¡Agrega el primero! 💪</p>}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12 }}>
                {myHabits.map((h,i)=>{
                  const logEntry = habitLogs.find(l=>l.habit_id===h.id&&l.date===habitDate&&l.uid===user.id);
                  const isOwn = h.uid===user.id;
                  const isShared = !!h.shared;
                  const canLog = isOwn || isShared;
                  // Per-habit streak
                  const getHabitStreak = (habitId) => {
                    let s = 0, d = new Date();
                    while (s <= 365) {
                      const ds = d.toISOString().slice(0,10);
                      const log = habitLogs.find(l=>l.habit_id===habitId&&l.date===ds&&l.uid===user.id);
                      const done2 = h.target_type==="check" ? !!log : log && Number(log.value)>=(h.target_value||1);
                      if (!done2) { if (ds===liveToday) { d.setDate(d.getDate()-1); continue; } break; }
                      s++; d.setDate(d.getDate()-1);
                    }
                    return s;
                  };
                  const habitStreak = getHabitStreak(h.id);
                  // For shared habits: show other user's status too
                  const otherUserId = users.find(u=>u.id!==user.id)?.id;
                  const otherLog = isShared && otherUserId
                    ? habitLogs.find(l=>l.habit_id===h.id&&l.date===habitDate&&l.uid===otherUserId)
                    : null;
                  let done = false, progress = 0;
                  if (h.target_type==="check") { done=!!logEntry; }
                  else { progress=logEntry?Math.min(1,Number(logEntry.value)/(h.target_value||1)):0; done=progress>=1; }
                  const xpEarned = h.target_type==="check"?(done?h.xp_value||10:0):Math.round((h.xp_value||10)*progress);
                  const hAuthor = authorOf(h);

                  return (
                    <div key={h.id} id={`item-habit-${h.id}`} className="pop-in card-hover" style={{ background:done?h.color+"18":t.bgCard,border:`1px solid ${highlightId?.id===h.id&&highlightId?.type==="habit"?user.accent:done?h.color+"50":t.border}`,borderRadius:16,padding:"15px 17px",animationDelay:`${i*60}ms`,transition:"all .2s",boxShadow:highlightId?.id===h.id&&highlightId?.type==="habit"?`0 0 0 3px ${user.accent}40`:"none" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                          <span style={{ fontSize:22 }}>{h.icon}</span>
                          <div>
                            <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                              <div style={{ fontSize:13.5,fontWeight:600,color:t.text }}>{h.name}</div>
                              {!isOwn&&<SharedByBadge author={authorOf(h)} t={t}/>}
                              {isOwn&&isShared&&<Badge color="#818cf8" sm>compartido</Badge>}
                              {isShared&&otherLog&&<span style={{ fontSize:9,background:"#34d39918",border:"1px solid #34d39940",borderRadius:99,padding:"1px 6px",color:"#34d399",fontWeight:700 }}>✓ {users.find(u=>u.id===otherUserId)?.name}</span>}
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:2 }}>
                              <span style={{ fontSize:10,color:t.textMuted }}>
                                {h.target_type==="check"?"Check diario":`Meta: ${h.target_value} ${h.target_unit}`}
                              </span>
                              <span style={{ fontSize:10,color:done?h.color:t.textFaint,fontWeight:600 }}>+{xpEarned}/{h.xp_value||10} XP</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                          {habitStreak > 0 && (
                            <div style={{ display:"flex",alignItems:"center",gap:3,background:"#f59e0b18",border:"1px solid #f59e0b30",borderRadius:99,padding:"2px 8px" }}>
                              <span style={{ fontSize:10 }}>🔥</span>
                              <span style={{ fontSize:11,fontWeight:700,color:"#f59e0b" }}>{habitStreak}</span>
                            </div>
                          )}
                          {isOwn&&<button onClick={()=>deleteHabit(h.id)} style={{ background:"none",border:"none",color:t.textFaint,padding:2,display:"flex",opacity:.4 }}><Trash2 size={11}/></button>}
                        </div>
                      </div>

                      {h.target_type==="check" ? (
                        <button onClick={()=>canLog&&logHabit(h,1,habitDate)} disabled={!canLog} style={{ width:"100%",background:done?h.color:t.input,border:`1.5px solid ${done?h.color:t.inputBdr}`,color:done?"#07070f":t.textMuted,borderRadius:10,padding:"8px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s",cursor:canLog?"pointer":"default",opacity:canLog?1:.6 }}>
                          {done?<><Check size={13}/> Completado</>:<><Plus size={13}/> Marcar hecho</>}
                        </button>
                      ) : (
                        <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                            <input
                              id={`hab-qty-${h.id}`}
                              type="number"
                              placeholder={`0 de ${h.target_value} ${h.target_unit}`}
                              defaultValue={logEntry?.value||""}
                              key={`${h.id}-${habitDate}`}
                              style={{ flex:1,...inputStyle,padding:"7px 10px",fontSize:12 }}
                              disabled={!canLog}
                            />
                            {canLog&&<button onClick={()=>{
                              const inp=document.getElementById(`hab-qty-${h.id}`);
                              if(inp&&inp.value) logHabit(h,Number(inp.value),habitDate);
                            }} style={{ background:done?h.color:user.accent,color:"#07070f",border:"none",borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer" }}>{done?"✓":"OK"}</button>}
                          </div>
                          {progress>0&&(
                            <div style={{ height:4,background:t.border,borderRadius:99 }}>
                              <div style={{ height:"100%",background:h.color,borderRadius:99,width:`${progress*100}%`,transition:"width .4s" }}/>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 7-day mini heatmap */}
                      <div style={{ display:"flex",gap:4,marginTop:10 }}>
                        {last7.map(d=>{
                          const log2 = habitLogs.find(l=>l.habit_id===h.id&&l.date===d&&l.uid===user.id);
                          const pct2 = !log2?0:h.target_type==="check"?1:Math.min(1,Number(log2.value)/(h.target_value||1));
                          return <div key={d} title={d} style={{ flex:1,height:6,borderRadius:3,background:pct2>0?h.color+(pct2>=1?"":"88"):t.border,border:d===liveToday?`1px solid ${h.color}`:"none",transition:"background .2s" }}/>;
                        })}
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                        <span style={{ fontSize:8.5,color:t.textFaint }}>{new Date(last7[0]+"T12:00").toLocaleDateString("es-PE",{weekday:"short"})}</span>
                        <span style={{ fontSize:8.5,color:t.textFaint }}>Hoy</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div style={{ fontSize:11,fontWeight:700,color:t.textFaint,letterSpacing:.7,marginBottom:12 }}>LOGROS</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10 }}>
              {BADGES_DEF.map(b=>{
                const unlocked = unlockedBadges.has(b.id);
                return (
                  <div key={b.id} style={{ background:unlocked?user.accent+"12":t.bgCard,border:`1px solid ${unlocked?user.accent+"40":t.border}`,borderRadius:14,padding:"13px 15px",opacity:unlocked?1:.45,transition:"all .2s" }}>
                    <div style={{ fontSize:24,marginBottom:6 }}>{b.icon}</div>
                    <div style={{ fontSize:12,fontWeight:700,color:unlocked?t.text:t.textMuted }}>{b.name}</div>
                    <div style={{ fontSize:10,color:t.textFaint,marginTop:3,lineHeight:1.5 }}>{b.desc}</div>
                    {unlocked&&<div style={{ fontSize:9,color:user.accent,marginTop:6,fontWeight:600 }}>✓ Desbloqueado</div>}
                  </div>
                );
              })}
            </div>

            {/* Ranking */}
            <button onClick={()=>setShowHabitsRanking(v=>!v)} style={{ display:"flex",alignItems:"center",gap:7,background:"none",border:`1px solid ${t.border}`,borderRadius:10,padding:"7px 14px",cursor:"pointer",margin:"20px 0 0",color:t.textFaint,fontSize:11,fontWeight:600 }}>
              <Star size={11} color={t.textFaint}/>
              RANKING
              <ChevronRight size={11} style={{ marginLeft:"auto",transform:showHabitsRanking?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s" }}/>
            </button>
            {showHabitsRanking&&(
            <div className="slide-down" style={{ ...cardStyle(),marginTop:10 }}>
              {[...users].sort((a,b)=>(userStats[b.id]?.xp||0)-(userStats[a.id]?.xp||0)).map((u,i)=>{
                const us = userStats[u.id]||{xp:0,level:1,badges:[]};
                const uStreak = getStreak(u.id);
                return (
                  <div key={u.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:u.id===user.id?u.accent+"10":"transparent",borderRadius:12,marginBottom:6,border:`1px solid ${u.id===user.id?u.accent+"30":"transparent"}` }}>
                    <span style={{ fontSize:18,width:24 }}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                    <div style={{ width:34,height:34,borderRadius:11,background:u.accent+"22",border:`2px solid ${u.accent}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:u.accent }}>{u.initials}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:t.text }}>{u.name}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:3 }}>
                        <span style={{ fontSize:10,color:t.textMuted }}>Nv. {us.level}</span>
                        <span style={{ fontSize:10,color:"#f59e0b" }}>🔥 {uStreak}d</span>
                        <span style={{ fontSize:10,color:t.textMuted }}>{(Array.isArray(us.badges)?us.badges:[]).length} logros</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:16,fontWeight:800,color:u.accent }}>{us.xp||0}</div>
                      <div style={{ fontSize:9,color:t.textMuted }}>XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
          );
        })()}

        {/* ══ PLANNER ══ */}
        {tab==="planner"&&(
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
              <div><h1 style={h1Style}>Planner semanal</h1><p style={subStyle}>Semana de {user.name} · arrastra para mover bloques</p></div>
              <div style={{ display:"flex",gap:8 }}>
                <button className="btn" onClick={()=>setCatForm(!catForm)} style={{ background:t.bgCard,border:`1px solid ${t.border}`,color:t.textMuted,padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6 }}><Palette size={13}/> Categorías</button>
                <button className="btn" onClick={()=>{setBlockForm(!blockForm);setEditBlock(null);setNewBlock({title:"",day:0,start_hour:8,duration:1,type:Object.keys(plannerCats)[0]||"estudio"});}} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><Plus size={13}/> Nuevo bloque</button>
              </div>
            </div>

            {/* Category manager */}
            {catForm&&(
              <div className="slide-down" style={{ ...cardStyle(),marginBottom:16 }}>
                <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.5,marginBottom:12 }}>GESTIONAR CATEGORÍAS</div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:14 }}>
                  {Object.entries(plannerCats).map(([key,cat])=>(
                    <div key={key} style={{ display:"flex",alignItems:"center",gap:6,background:cat.color+"18",border:`1px solid ${cat.color}40`,borderRadius:99,padding:"4px 12px" }}>
                      <div style={{ width:7,height:7,borderRadius:"50%",background:cat.color }}/>
                      <span style={{ fontSize:11,color:cat.color,fontWeight:600 }}>{cat.label}</span>
                      <button onClick={()=>deleteCat(key)} style={{ background:"none",border:"none",color:cat.color,padding:0,display:"flex",marginLeft:2,opacity:.6 }}><X size={10}/></button>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                  <input value={newCat.key} onChange={e=>setNewCat({...newCat,key:e.target.value})} placeholder="clave (ej: salud)" style={{ width:120,...inputStyle }}/>
                  <input value={newCat.label} onChange={e=>setNewCat({...newCat,label:e.target.value})} placeholder="nombre visible" style={{ width:140,...inputStyle }}/>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:11,color:t.textMuted }}>Color:</span>
                    <input type="color" value={newCat.color} onChange={e=>setNewCat({...newCat,color:e.target.value})} style={{ width:36,height:32,border:`1px solid ${t.inputBdr}`,borderRadius:8,background:t.input,cursor:"pointer",padding:2 }}/>
                  </div>
                  <button className="btn" onClick={saveCat} style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 16px",borderRadius:9,fontSize:12,fontWeight:700 }}>Agregar</button>
                  <button onClick={()=>setCatForm(false)} style={{ background:"none",border:"none",color:t.textMuted,padding:5 }}><X size={15}/></button>
                </div>
              </div>
            )}

            {/* Block form */}
            {blockForm&&(
              <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:16 }}>
                <div style={{ display:"flex",gap:9,alignItems:"center",flexWrap:"wrap" }}>
                  <input value={newBlock.title} onChange={e=>setNewBlock({...newBlock,title:e.target.value})} placeholder="Título del bloque" style={{ flex:1,minWidth:160,...inputStyle }}/>
                  <select value={newBlock.day} onChange={e=>setNewBlock({...newBlock,day:Number(e.target.value)})} style={inputStyle}>
                    {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
                  </select>
                  <select value={newBlock.start_hour} onChange={e=>setNewBlock({...newBlock,start_hour:Number(e.target.value)})} style={inputStyle}>
                    {HOURS.map(h=><option key={h} value={h}>{h}:00</option>)}
                  </select>
                  <select value={newBlock.duration} onChange={e=>setNewBlock({...newBlock,duration:Number(e.target.value)})} style={inputStyle}>
                    {[1,2,3,4].map(d=><option key={d} value={d}>{d}h</option>)}
                  </select>
                  <select value={newBlock.type} onChange={e=>setNewBlock({...newBlock,type:e.target.value})} style={inputStyle}>
                    {Object.entries(plannerCats).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button className="btn" onClick={saveBlock} style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 17px",borderRadius:9,fontSize:12,fontWeight:700 }}>{editBlock?"Actualizar":"Guardar"}</button>
                  <button onClick={()=>{setBlockForm(false);setEditBlock(null);}} style={{ background:"none",border:"none",color:t.textMuted,padding:5 }}><X size={15}/></button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
              {Object.entries(plannerCats).map(([type,cat])=>{
                const cs = getCatStyle(type);
                return (<div key={type} style={{ display:"flex",alignItems:"center",gap:5,background:cs.bg,border:`1px solid ${cs.border}`,borderRadius:99,padding:"4px 11px" }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:cs.text }}/>
                  <span style={{ fontSize:10,color:cs.text,fontWeight:500 }}>{cat.label}</span>
                </div>);
              })}
            </div>

            {/* Grid */}
            <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:18,overflow:"hidden" }}>
              <div style={{ display:"grid",gridTemplateColumns:"44px repeat(7,1fr)",borderBottom:`1px solid ${t.borderSub}` }}>
                <div style={{ borderRight:`1px solid ${t.borderSub}` }}/>
                {DAYS.map((d,i)=>(<div key={d} style={{ padding:"11px 7px",textAlign:"center",borderRight:`1px solid ${t.borderSub}` }}><div style={{ fontSize:10.5,fontWeight:600,color:i<5?t.textMuted:t.textFaint,letterSpacing:.5 }}>{d}</div></div>))}
              </div>
              {HOURS.map(h=>(
                <div key={h} style={{ display:"grid",gridTemplateColumns:"44px repeat(7,1fr)",borderBottom:`1px solid ${t.borderSub}`,minHeight:48 }}>
                  <div style={{ padding:"5px 7px 0",fontSize:9,color:t.textFaint,textAlign:"right",borderRight:`1px solid ${t.borderSub}` }}>{h}:00</div>
                  {DAYS.map((_,di)=>{
                    const myBlocks = plannerBlocks.filter(b=>b.uid===user.id&&b.day===di&&b.start_hour===h);
                    const isOver = dragOver && dragOver.day===di && dragOver.hour===h;
                    return (
                      <div key={di}
                        onDragOver={e=>{e.preventDefault();setDragOver({day:di,hour:h});}}
                        onDragLeave={()=>setDragOver(null)}
                        onDrop={e=>handleDrop(e,di,h)}
                        style={{ borderRight:`1px solid ${t.borderSub}`,padding:"3px 4px",background:isOver?user.accent+"10":"transparent",transition:"background .15s" }}>
                        {myBlocks.map(b=>{
                          const cs=getCatStyle(b.type);
                          return (
                            <div key={b.id} draggable
                              onDragStart={e=>handleDragStart(e,b)}
                              onDragEnd={()=>{setDragging(null);setDragOver(null);}}
                              style={{ background:cs.bg,border:`1px solid ${cs.border}`,borderRadius:8,padding:"5px 8px",height:`${b.duration*48-6}px`,minHeight:38,display:"flex",alignItems:"center",gap:4,cursor:"grab",position:"relative",group:"block" }}>
                              <GripVertical size={8} color={cs.text} style={{ opacity:.5,flexShrink:0 }}/>
                              <span style={{ fontSize:10,color:cs.text,fontWeight:500,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.title}</span>
                              <div style={{ display:"flex",gap:2,flexShrink:0 }}>
                                <button onClick={()=>{setEditBlock(b.id);setNewBlock({title:b.title,day:b.day,start_hour:b.start_hour,duration:b.duration,type:b.type});setBlockForm(true);}} style={{ background:"none",border:"none",color:cs.text,padding:1,display:"flex",opacity:.7,cursor:"pointer" }}><Pencil size={8}/></button>
                                <button onClick={()=>deleteBlock(b.id)} style={{ background:"none",border:"none",color:cs.text,padding:1,display:"flex",opacity:.7,cursor:"pointer" }}><Trash2 size={8}/></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {plannerBlocks.filter(b=>b.uid===user.id).length===0&&(
              <p style={{ color:t.textFaint,fontSize:13,padding:"16px 4px" }}>No hay bloques aún. ¡Agrega el primero con el botón de arriba! 📅</p>
            )}
          </div>
        )}

        {tab==="calendar"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={4}/>;

          const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
          const WDAYS_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
          const HOURS = Array.from({length:24},(_,i)=>i);
          const cats = evtCats;

          // ── helpers ─────────────────────────────────────────
          const getWeekDates = (ds) => {
            const d = new Date(ds+"T12:00"), day = d.getDay();
            const mon = new Date(d); mon.setDate(d.getDate()-(day===0?6:day-1));
            return Array.from({length:7},(_,i)=>{ const x=new Date(mon); x.setDate(mon.getDate()+i); return x.toISOString().slice(0,10); });
          };
          const weekDates = getWeekDates(calSelDay);
          const firstDay  = new Date(calYear, calMonth, 1).getDay();
          const daysInMo  = new Date(calYear, calMonth+1, 0).getDate();
          const cells     = Array.from({length:firstDay},()=>null).concat(Array.from({length:daysInMo},(_,i)=>i+1));
          while(cells.length%7!==0) cells.push(null);
          const dsOf  = (d) => `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

          // ── Recurrence expansion ─────────────────────────────
          // Returns true if a recurring event from `origin` occurs on date `ds`
          const recurrsOn = (e, ds) => {
            if (!e.recurrence || e.recurrence === "none") return e.date === ds;
            if (ds < e.date) return false; // before start

            // Check end conditions
            if (e.recurrence_end && ds > e.recurrence_end) return false;

            const origin = new Date(e.date + "T12:00");
            const target = new Date(ds + "T12:00");
            const diffMs = target - origin;
            const diffDays = Math.round(diffMs / 86400000);

            const r = e.recurrence;
            const interval = e.recurrence_interval || 1;

            if (r === "daily") {
              if (diffDays % interval !== 0) return false;
            } else if (r === "weekdays") {
              const dow = target.getDay();
              if (dow === 0 || dow === 6) return false;
            } else if (r === "weekly") {
              // Check it's the right day-of-week
              const targetDow = target.getDay();
              // If recurrence_days set, must match one of them; else same dow as origin
              if (e.recurrence_days) {
                const allowedDays = e.recurrence_days.split(",").filter(Boolean).map(Number);
                if (!allowedDays.includes(targetDow)) return false;
              } else {
                if (targetDow !== origin.getDay()) return false;
              }
              // Check it's the right week (every N weeks from origin's Monday)
              const originMon = new Date(origin); originMon.setDate(origin.getDate() - (origin.getDay()===0?6:origin.getDay()-1));
              const targetMon = new Date(target); targetMon.setDate(target.getDate() - (target.getDay()===0?6:target.getDay()-1));
              const weeksDiff = Math.round((targetMon - originMon) / (7*86400000));
              if (weeksDiff % interval !== 0) return false;
            } else if (r === "monthly") {
              if (target.getDate() !== origin.getDate()) return false;
              const monthsDiff = (target.getFullYear()-origin.getFullYear())*12 + target.getMonth()-origin.getMonth();
              if (monthsDiff % interval !== 0) return false;
            } else if (r === "custom") {
              const unit = e._customUnit || "week";
              if (unit === "day") {
                if (diffDays % interval !== 0) return false;
              } else if (unit === "week") {
                const targetDow = target.getDay();
                if (e.recurrence_days) {
                  const allowedDays = e.recurrence_days.split(",").filter(Boolean).map(Number);
                  if (!allowedDays.includes(targetDow)) return false;
                } else {
                  if (targetDow !== origin.getDay()) return false;
                }
                const originMon = new Date(origin); originMon.setDate(origin.getDate() - (origin.getDay()===0?6:origin.getDay()-1));
                const targetMon = new Date(target); targetMon.setDate(target.getDate() - (target.getDay()===0?6:target.getDay()-1));
                const weeksDiff = Math.round((targetMon - originMon) / (7*86400000));
                if (weeksDiff % interval !== 0) return false;
              } else if (unit === "month") {
                if (target.getDate() !== origin.getDate()) return false;
                const monthsDiff = (target.getFullYear()-origin.getFullYear())*12 + target.getMonth()-origin.getMonth();
                if (monthsDiff % interval !== 0) return false;
              }
            }

            // Check recurrence_count (N occurrences max)
            if (e.recurrence_count) {
              // Count how many times this event has occurred up to ds (inclusive)
              let count = 0;
              const cur = new Date(e.date + "T12:00");
              const end = new Date(ds + "T12:00");
              while (cur <= end) {
                const curDs = cur.toISOString().slice(0,10);
                if (recurrsOnSimple(e, curDs, origin)) count++;
                cur.setDate(cur.getDate() + 1);
                if (count > e.recurrence_count) return false;
              }
              if (count > e.recurrence_count) return false;
            }

            return true;
          };

          // Simplified check without count (avoids infinite recursion)
          const recurrsOnSimple = (e, ds, origin) => {
            if (ds < e.date) return false;
            if (e.recurrence_end && ds > e.recurrence_end) return false;
            const target = new Date(ds + "T12:00");
            const diffDays = Math.round((target - origin) / 86400000);
            const r = e.recurrence; const interval = e.recurrence_interval || 1;
            if (r==="daily") return diffDays % interval === 0;
            if (r==="weekdays") { const d=target.getDay(); return d!==0&&d!==6; }
            if (r==="weekly"||r==="custom") {
              const unit = e._customUnit||"week";
              if (r==="custom"&&unit==="day") return diffDays % interval === 0;
              if (r==="custom"&&unit==="month") { return target.getDate()===origin.getDate()&&((target.getFullYear()-origin.getFullYear())*12+target.getMonth()-origin.getMonth())%interval===0; }
              const dow = target.getDay();
              const allowed = e.recurrence_days ? e.recurrence_days.split(",").filter(Boolean).map(Number) : [origin.getDay()];
              if (!allowed.includes(dow)) return false;
              const oMon = new Date(origin); oMon.setDate(origin.getDate()-(origin.getDay()===0?6:origin.getDay()-1));
              const tMon = new Date(target); tMon.setDate(target.getDate()-(target.getDay()===0?6:target.getDay()-1));
              return Math.round((tMon-oMon)/(7*86400000)) % interval === 0;
            }
            if (r==="monthly") return target.getDate()===origin.getDate()&&((target.getFullYear()-origin.getFullYear())*12+target.getMonth()-origin.getMonth())%interval===0;
            return false;
          };

          // evFor: returns all events (including recurring) that occur on a given date
          const evFor = (ds) => {
            return myEv.filter(e => {
              if (!e.recurrence || e.recurrence === "none") return e.date === ds;
              // Skip excepted dates
              const exceptions = JSON.parse(e.recurrence_exceptions||"[]");
              if (exceptions.includes(ds)) return false;
              return recurrsOn(e, ds);
            }).map(e => ({...e, date: ds})); // normalize date to the queried day
          };
          // tasks with deadline shown on calendar
          const tasksFor = (ds) => myT.filter(tx=>tx.deadline===ds&&tx.status!=="completada");

          const prevMonth = () => { let m=calMonth-1,y=calYear; if(m<0){m=11;y--;} setCalMonth(m);setCalYear(y); };
          const nextMonth = () => { let m=calMonth+1,y=calYear; if(m>11){m=0;y++;} setCalMonth(m);setCalYear(y); };
          const prevWeek  = () => { const d=new Date(calSelDay+"T12:00"); d.setDate(d.getDate()-7); setCalSelDay(d.toISOString().slice(0,10)); };
          const nextWeek  = () => { const d=new Date(calSelDay+"T12:00"); d.setDate(d.getDate()+7); setCalSelDay(d.toISOString().slice(0,10)); };
          const prevDay   = () => { const d=new Date(calSelDay+"T12:00"); d.setDate(d.getDate()-1); setCalSelDay(d.toISOString().slice(0,10)); };
          const nextDay   = () => { const d=new Date(calSelDay+"T12:00"); d.setDate(d.getDate()+1); setCalSelDay(d.toISOString().slice(0,10)); };

          // duration helper: HH:MM difference in fractional hours
          const durationH = (start, end) => {
            if(!start||!end) return 1;
            const [sh,sm]=start.split(":").map(Number), [eh,em]=end.split(":").map(Number);
            return Math.max(0.5, (eh*60+em-sh*60-sm)/60);
          };

          // Pixel layout constants — must match the row height used in JSX
          const ROW_H = 56; // px per hour
          const toMin = (hhmm) => { const [h,m]=hhmm.split(":").map(Number); return h*60+m; };
          // Convert a time string to top-offset in px within its starting hour row
          const timeToTop = (hhmm) => {
            if(!hhmm) return 0;
            const mins = toMin(hhmm) % 60; // minutes past the hour
            return (mins / 60) * ROW_H;
          };
          // Duration in px
          const durToPx = (start, end) => {
            if(!start||!end) return ROW_H; // default 1h
            const diff = toMin(end) - toMin(start);
            return Math.max(20, (diff / 60) * ROW_H);
          };

          return (
          <div className="fu">
            {/* ── Header ── */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <button onClick={calView==="month"?prevMonth:calView==="week"?prevWeek:prevDay}
                  style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:8,padding:"5px 10px",fontSize:14,cursor:"pointer" }}>‹</button>
                <span style={{ fontSize:15,fontWeight:800,color:t.text,minWidth:160,textAlign:"center" }}>
                  {calView==="month"&&`${MONTHS_ES[calMonth]} ${calYear}`}
                  {calView==="week"&&`${new Date(weekDates[0]+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short"})} – ${new Date(weekDates[6]+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short"})}`}
                  {calView==="day"&&new Date(calSelDay+"T12:00").toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"})}
                  {calView==="agenda"&&"Próximos 30 días"}
                </span>
                <button onClick={calView==="month"?nextMonth:calView==="week"?nextWeek:nextDay}
                  style={{ background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:8,padding:"5px 10px",fontSize:14,cursor:"pointer" }}>›</button>
                <button onClick={()=>{setCalSelDay(liveToday);setCalMonth(nowLima().getMonth());setCalYear(nowLima().getFullYear());}}
                  style={{ background:"none",border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer" }}>Hoy</button>
              </div>
              <div style={{ display:"flex",gap:7,alignItems:"center" }}>
                {["month","week","day","agenda"].map(v=>(
                  <button key={v} onClick={()=>setCalView(v)}
                    style={{ background:calView===v?user.accent+"20":"none",border:`1px solid ${calView===v?user.accent+"50":t.inputBdr}`,color:calView===v?user.accent:t.textMuted,borderRadius:8,padding:"5px 13px",fontSize:11,fontWeight:calView===v?700:400,cursor:"pointer" }}>
                    {v==="month"?"Mes":v==="week"?"Semana":v==="day"?"Día":"Agenda"}
                  </button>
                ))}
                <button onClick={()=>setEvtCatEdit(true)} style={{ background:"none",border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer" }}>🏷️</button>
                <button onClick={()=>setEventModal({mode:"new",ev:{title:"",date:calSelDay,time:"",time_end:"",type:"clase",visibility:"private",description:"",recurrence:"none",recurrence_end:"",reminder_min:null}})}
                  style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:9,padding:"7px 16px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                  <Plus size={13}/> Nuevo evento
                </button>
              </div>
            </div>

            {/* Category editor modal */}
            {evtCatEdit&&(
              <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setEvtCatEdit(false)}>
                <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:18,padding:"24px 28px",width:400,maxHeight:"80vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.3)" }} onClick={e=>e.stopPropagation()}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                    <span style={{ fontSize:14,fontWeight:700,color:t.text }}>Editar categorías</span>
                    <button onClick={()=>setEvtCatEdit(false)} style={{ background:"none",border:"none",color:t.textMuted,padding:2,display:"flex" }}><X size={15}/></button>
                  </div>
                  {Object.entries(cats).map(([k,v])=>(
                    <div key={k} style={{ display:"flex",alignItems:"center",gap:9,marginBottom:10 }}>
                      <div style={{ width:10,height:10,borderRadius:"50%",background:v.dot,flexShrink:0 }}/>
                      <input value={v.label} onChange={e=>{const u={...cats,[k]:{...v,label:e.target.value}};setEvtCats(u);localStorage.setItem("evtCats",JSON.stringify(u));}} style={{ flex:1,...inputStyle,fontSize:12,padding:"6px 10px" }}/>
                      <input type="color" value={v.dot} onChange={e=>{const u={...cats,[k]:{...v,dot:e.target.value,bg:`${e.target.value}14`}};setEvtCats(u);localStorage.setItem("evtCats",JSON.stringify(u));}} style={{ width:32,height:28,border:`1px solid ${t.inputBdr}`,borderRadius:7,cursor:"pointer",padding:2,background:t.input }}/>
                    </div>
                  ))}
                  <button onClick={()=>{const u={...cats,[`cat_${Date.now()}`]:{dot:"#94a3b8",bg:"rgba(148,163,184,.08)",label:"Nueva categoría"}};setEvtCats(u);localStorage.setItem("evtCats",JSON.stringify(u));}}
                    style={{ width:"100%",marginTop:6,background:t.input,border:`1px solid ${t.inputBdr}`,color:t.textMuted,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                    <Plus size={12}/> Agregar categoría
                  </button>
                  <button onClick={()=>setEvtCatEdit(false)} style={{ width:"100%",marginTop:8,background:user.accent,color:"#07070f",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer" }}>Listo</button>
                </div>
              </div>
            )}

            {/* ── MONTH VIEW ── */}
            {calView==="month"&&(
              <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:18,overflow:"hidden" }}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid ${t.borderSub}` }}>
                  {WDAYS_SHORT.map((d,i)=>(
                    <div key={d} style={{ padding:"10px 0",textAlign:"center",borderRight:i<6?`1px solid ${t.borderSub}`:"none" }}>
                      <span style={{ fontSize:10,fontWeight:700,color:i===0||i===6?t.textFaint:t.textMuted,letterSpacing:.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
                {Array.from({length:cells.length/7},(_,wi)=>(
                  <div key={wi} style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:wi<cells.length/7-1?`1px solid ${t.borderSub}`:"none" }}>
                    {cells.slice(wi*7,wi*7+7).map((d,di)=>{
                      const ds=d?dsOf(d):null;
                      const isToday=ds===liveToday, isSel=ds===calSelDay;
                      const dayEvs=d?evFor(ds):[], dayTasks=d?tasksFor(ds):[];
                      const isQuick=quickAddDay===ds;
                      return (
                        <div key={di}
                          onDragOver={e=>{e.preventDefault();e.currentTarget.style.background=user.accent+"15";}}
                          onDragLeave={e=>{e.currentTarget.style.background="";}}
                          onDrop={e=>{e.currentTarget.style.background="";const id=e.dataTransfer.getData("evtId");if(id&&ds)moveEvent(Number(id),ds);}}
                          onClick={()=>{ if(d){ if(ds===quickAddDay)setQuickAddDay(null); else setQuickAddDay(ds); setCalSelDay(ds); }}}
                          style={{ minHeight:96,borderRight:di<6?`1px solid ${t.borderSub}`:"none",padding:"5px 5px 4px",background:isSel?user.accent+"08":d?"transparent":t.borderSub+"10",cursor:d?"pointer":"default",transition:"background .15s" }}>
                          {d&&(
                            <>
                              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2 }}>
                                <div style={{ width:22,height:22,borderRadius:7,background:isToday?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                  <span style={{ fontSize:11,fontWeight:isToday?800:500,color:isToday?"#07070f":di===0||di===6?t.textFaint:t.text }}>{d}</span>
                                </div>
                                {(dayEvs.length+dayTasks.length)>0&&<span style={{ fontSize:8,color:t.textFaint }}>{dayEvs.length+dayTasks.length}</span>}
                              </div>
                              {/* Quick-add input */}
                              {isQuick&&(
                                <div onClick={e=>e.stopPropagation()} style={{ marginBottom:3 }}>
                                  <input autoFocus placeholder="Nombre…"
                                    style={{ ...inputStyle,width:"100%",fontSize:10,padding:"3px 6px",borderRadius:5 }}
                                    onKeyDown={e=>{
                                      if(e.key==="Enter"&&e.target.value.trim()){
                                        saveEventModal({title:e.target.value.trim(),date:ds,time:"",time_end:"",type:"clase",visibility:"private",description:"",recurrence:"none",reminder_min:null});
                                        setQuickAddDay(null);
                                      }
                                      if(e.key==="Escape") setQuickAddDay(null);
                                    }}/>
                                  <div style={{ fontSize:8,color:t.textFaint,marginTop:1 }}>Enter para guardar · Esc cancelar</div>
                                </div>
                              )}
                              <div style={{ display:"flex",flexDirection:"column",gap:1 }}>
                                {/* Tasks with deadline — slim colored chips */}
                                {dayTasks.slice(0,2).map(tx=>(
                                  <div key={"t"+tx.id} onClick={e=>{e.stopPropagation();setEditTask({...tx});}}
                                    style={{ borderRadius:3,padding:"2px 5px",display:"flex",alignItems:"center",gap:3,cursor:"pointer",background:"rgba(248,113,113,.12)" }}>
                                    <div style={{ width:5,height:5,borderRadius:"50%",background:"#f87171",flexShrink:0 }}/>
                                    <span style={{ fontSize:8.5,color:"#f87171",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>{tx.title}</span>
                                  </div>
                                ))}
                                {/* Events — Google Calendar style pill */}
                                {dayEvs.slice(0,3-Math.min(2,dayTasks.length)).map(ev=>{
                                  const c=cats[ev.type]||{dot:"#94a3b8"};
                                  return (
                                    <div key={ev.id} draggable
                                      onDragStart={e=>{e.stopPropagation();e.dataTransfer.setData("evtId",String(ev.id));}}
                                      onClick={e=>{e.stopPropagation();setEventModal({mode:"edit",ev:{...ev},_clickedDate:ev.date});}}
                                      style={{ background:c.dot+"20",borderRadius:3,padding:"2px 5px",cursor:"grab",display:"flex",alignItems:"center",gap:3 }}>
                                      <div style={{ width:5,height:5,borderRadius:"50%",background:c.dot,flexShrink:0 }}/>
                                      <span style={{ fontSize:8.5,color:dark?c.dot:c.dot,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>
                                        {ev.time&&<span style={{ opacity:.75,fontWeight:400 }}>{ev.time.slice(0,5)} </span>}{ev.title}
                                      </span>
                                    </div>
                                  );
                                })}
                                {(dayEvs.length+dayTasks.length)>3&&<span style={{ fontSize:8,color:t.textFaint,paddingLeft:3 }}>+{dayEvs.length+dayTasks.length-3} más</span>}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* ── WEEK VIEW ── */}
            {calView==="week"&&(
              <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:18,overflow:"hidden" }}>
                <div style={{ display:"grid",gridTemplateColumns:"52px repeat(7,1fr)",borderBottom:`1px solid ${t.borderSub}` }}>
                  <div style={{ borderRight:`1px solid ${t.borderSub}` }}/>
                  {weekDates.map((ds)=>{
                    const d=new Date(ds+"T12:00"), isToday=ds===liveToday;
                    const hasTasks=tasksFor(ds).length>0;
                    return (
                      <div key={ds} onClick={()=>{setCalSelDay(ds);setCalView("day");}} style={{ padding:"8px 4px",textAlign:"center",borderLeft:`1px solid ${t.borderSub}`,cursor:"pointer" }}>
                        <div style={{ fontSize:9,fontWeight:600,color:isToday?user.accent:t.textFaint,letterSpacing:.5,textTransform:"uppercase" }}>{WDAYS_SHORT[d.getDay()]}</div>
                        <div style={{ width:30,height:30,borderRadius:"50%",background:isToday?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",margin:"2px auto 0",transition:"background .15s" }}>
                          <span style={{ fontSize:14,fontWeight:isToday?800:500,color:isToday?"#07070f":t.text }}>{d.getDate()}</span>
                        </div>
                        {hasTasks&&<div style={{ width:4,height:4,borderRadius:"50%",background:"#f87171",margin:"2px auto 0" }}/>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ maxHeight:520,overflowY:"auto" }} ref={el=>{ if(el&&el.scrollTop===0) el.scrollTop=ROW_H*6; }}>
                  {/* Grid: time column + 7 day columns, each ROW_H px per hour */}
                  <div style={{ display:"grid",gridTemplateColumns:`52px repeat(7,1fr)`,position:"relative" }}>
                    {/* Time labels + horizontal grid lines */}
                    {HOURS.map(h=>(
                      <React.Fragment key={h}>
                        {/* Time label — Google Calendar style: "7 AM" at top-right, offset up by half */}
                        <div style={{ height:ROW_H,borderBottom:`1px solid ${t.borderSub}30`,padding:"0 8px 0 0",fontSize:9,color:t.textFaint,textAlign:"right",borderRight:`1px solid ${t.borderSub}40`,flexShrink:0,position:"relative" }}>
                          {h>0&&<span style={{ position:"absolute",top:-6,right:6,fontSize:9,color:t.textFaint,whiteSpace:"nowrap" }}>
                            {h<12?`${h} AM`:h===12?"12 PM":`${h-12} PM`}
                          </span>}
                        </div>
                        {weekDates.map(ds=>(
                          <div key={ds} style={{ height:ROW_H,borderBottom:`1px solid ${t.borderSub}30`,borderLeft:`1px solid ${t.borderSub}40`,position:"relative" }}>
                            {/* Half-hour dotted line */}
                            <div style={{ position:"absolute",top:"50%",left:0,right:0,height:1,borderTop:`1px dashed ${t.borderSub}40`,pointerEvents:"none" }}/>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                    {/* Absolute event blocks per day */}
                    {weekDates.map((ds,colIdx)=>(
                      <React.Fragment key={ds}>
                        {evFor(ds).filter(e=>e.time).map(ev=>{
                          const c=cats[ev.type]||{dot:"#94a3b8"};
                          const startMin = toMin(ev.time);
                          const top = (startMin / 60) * ROW_H;
                          const height = durToPx(ev.time, ev.time_end);
                          const short = height < 28;
                          // Google Calendar uses solid light fill + colored border
                          const bgColor = dark ? c.dot+"30" : c.dot+"20";
                          const textColor = dark ? c.dot : c.dot;
                          return (
                            <div key={ev.id}
                              draggable
                              onDragStart={e=>{e.stopPropagation();e.dataTransfer.setData("evtId",String(ev.id));}}
                              onClick={()=>setEventModal({mode:"edit",ev:{...ev},_clickedDate:ev.date})}
                              style={{
                                position:"absolute",
                                top:`${top}px`,
                                height:`${height-2}px`,
                                left:`calc((100% - 52px) / 7 * ${colIdx} + 52px + 2px)`,
                                width:`calc((100% - 52px) / 7 - 4px)`,
                                background:bgColor,
                                borderLeft:`3px solid ${c.dot}`,
                                borderRadius:"0 4px 4px 0",
                                padding:short?"1px 5px":"3px 6px",
                                cursor:"pointer",
                                overflow:"hidden",
                                zIndex:1,
                                boxSizing:"border-box",
                                transition:"filter .15s",
                              }}
                              onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
                              onMouseLeave={e=>e.currentTarget.style.filter="none"}>
                              <div style={{ fontSize:9.5,color:textColor,fontWeight:600,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                                {ev.title}
                              </div>
                              {!short&&<div style={{ fontSize:8,color:textColor,opacity:.75,whiteSpace:"nowrap" }}>
                                {ev.time.slice(0,5)}{ev.time_end&&` – ${ev.time_end.slice(0,5)}`}
                              </div>}
                            </div>
                          );
                        })}
                        {/* All-day / no-time events */}
                        {evFor(ds).filter(e=>!e.time).map((ev,i)=>{
                          const c=cats[ev.type]||{dot:"#94a3b8"};
                          return (
                            <div key={ev.id}
                              onClick={()=>setEventModal({mode:"edit",ev:{...ev},_clickedDate:ev.date})}
                              style={{
                                position:"absolute",
                                top:`${i*18}px`,
                                height:"16px",
                                left:`calc((100% - 52px) / 7 * ${colIdx} + 52px + 2px)`,
                                width:`calc((100% - 52px) / 7 - 4px)`,
                                background:c.dot+"25",
                                borderLeft:`3px solid ${c.dot}`,
                                borderRadius:"0 3px 3px 0",
                                padding:"1px 4px",
                                cursor:"pointer",
                                overflow:"hidden",
                                zIndex:1,
                                boxSizing:"border-box",
                                fontSize:8.5,
                                color:c.dot,
                                fontWeight:500,
                              }}>
                              {ev.title}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── DAY VIEW ── */}
            {calView==="day"&&(
              <div style={{ display:"grid",gridTemplateColumns:"1fr 260px",gap:14 }}>
                {/* Time grid */}
                <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:18,overflow:"hidden" }}>
                  <div style={{ padding:"13px 18px",borderBottom:`1px solid ${t.borderSub}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <span style={{ fontSize:13,fontWeight:700,color:t.text }}>{new Date(calSelDay+"T12:00").toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"})}</span>
                    <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                      {tasksFor(calSelDay).length>0&&<span style={{ fontSize:10,color:"#f87171",fontWeight:600 }}>{tasksFor(calSelDay).length} entrega{tasksFor(calSelDay).length!==1?"s":""} 📌</span>}
                      <span style={{ fontSize:10,color:t.textMuted }}>{evFor(calSelDay).length} eventos</span>
                    </div>
                  </div>
                  {/* Tasks due today */}
                  {tasksFor(calSelDay).length>0&&(
                    <div style={{ padding:"8px 14px 0",display:"flex",flexDirection:"column",gap:4 }}>
                      {tasksFor(calSelDay).map(tx=>(
                        <div key={tx.id} onClick={()=>{setTab("tasks");setHighlightId({id:tx.id,type:"task"});}}
                          style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.2)",borderRadius:9,cursor:"pointer" }}>
                          <span style={{ fontSize:12 }}>📌</span>
                          <span style={{ fontSize:12,color:t.text,fontWeight:500,flex:1 }}>{tx.title}</span>
                          <span style={{ fontSize:10,color:"#f87171",fontWeight:600 }}>Vence hoy</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ maxHeight:560,overflowY:"auto" }} ref={el=>{ if(el&&el.scrollTop===0) el.scrollTop=ROW_H*6; }}>
                    {/* Absolutely positioned events over hour grid */}
                    <div style={{ position:"relative",display:"grid",gridTemplateColumns:"54px 1fr" }}>
                      {/* Hour labels + grid lines */}
                      {HOURS.map(h=>{
                        const isNowH=h===nowLima().getHours()&&calSelDay===liveToday;
                        return (
                          <React.Fragment key={h}>
                            <div style={{ height:ROW_H,borderBottom:`1px solid ${t.borderSub}22`,padding:"4px 8px 0",fontSize:9.5,color:isNowH?user.accent:t.textFaint,textAlign:"right",borderRight:`1px solid ${t.borderSub}`,fontWeight:isNowH?700:400,background:isNowH?user.accent+"06":"transparent" }}>
                              {h>0?`${String(h).padStart(2,"0")}:00`:""}
                            </div>
                            <div style={{ height:ROW_H,borderBottom:`1px solid ${t.borderSub}22`,background:isNowH?user.accent+"04":"transparent" }}/>
                          </React.Fragment>
                        );
                      })}
                      {/* Current time indicator */}
                      {calSelDay===liveToday&&(()=>{
                        const now=nowLima();
                        const topPx=(now.getHours()*60+now.getMinutes())/60*ROW_H;
                        return (
                          <div style={{ position:"absolute",top:`${topPx}px`,left:54,right:0,height:2,background:user.accent,zIndex:5,pointerEvents:"none" }}>
                            <div style={{ width:8,height:8,borderRadius:"50%",background:user.accent,position:"absolute",left:-4,top:-3 }}/>
                          </div>
                        );
                      })()}
                      {/* Absolutely positioned event blocks */}
                      {evFor(calSelDay).filter(e=>e.time).map(ev=>{
                        const c=cats[ev.type]||{dot:"#94a3b8"};
                        const top = (toMin(ev.time)/60)*ROW_H;
                        const height = durToPx(ev.time, ev.time_end);
                        const short = height < 36;
                        return (
                          <div key={ev.id} onClick={()=>setEventModal({mode:"edit",ev:{...ev},_clickedDate:ev.date})}
                            style={{ position:"absolute",top:`${top}px`,left:"calc(54px + 4px)",right:4,height:`${height-2}px`,background:c.dot+"22",borderLeft:`3px solid ${c.dot}`,borderRadius:"0 6px 6px 0",padding:short?"3px 10px":"6px 12px",cursor:"pointer",overflow:"hidden",zIndex:2,boxSizing:"border-box",transition:"background .15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background=c.dot+"35"}
                            onMouseLeave={e=>e.currentTarget.style.background=c.dot+"22"}>
                            <div style={{ fontSize:12.5,color:t.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.title}</div>
                            {!short&&<div style={{ fontSize:10,color:t.textMuted,marginTop:1,display:"flex",gap:6,alignItems:"center" }}>
                              <span>{ev.time.slice(0,5)}{ev.time_end&&` – ${ev.time_end.slice(0,5)}`}</span>
                              {ev.reminder_min!==null&&<span style={{fontSize:9,color:c.dot,background:c.dot+"18",borderRadius:3,padding:"1px 5px"}}>rec</span>}
                              {ev.recurrence&&ev.recurrence!=="none"&&<span style={{fontSize:9,color:c.dot,background:c.dot+"18",borderRadius:3,padding:"1px 5px"}}>rep</span>}
                            </div>}
                            {ev.description&&height>70&&<div style={{ fontSize:10,color:t.textFaint,marginTop:3,lineHeight:1.4,overflow:"hidden" }}>{ev.description.slice(0,100)}</div>}
                            <div style={{ position:"absolute",top:short?3:6,right:8,fontSize:9,color:c.dot,background:c.dot+"18",borderRadius:99,padding:"1px 6px",fontWeight:600 }}>{(cats[ev.type]||{label:"?"}).label}</div>
                          </div>
                        );
                      })}
                      {/* All-day events (no time) */}
                      {evFor(calSelDay).filter(e=>!e.time).map((ev,i)=>{
                        const c=cats[ev.type]||{dot:"#94a3b8"};
                        return (
                          <div key={ev.id} onClick={()=>setEventModal({mode:"edit",ev:{...ev},_clickedDate:ev.date})}
                            style={{ position:"absolute",top:`${i*22}px`,left:"calc(54px + 4px)",right:4,height:20,background:c.dot+"22",borderLeft:`3px solid ${c.dot}`,borderRadius:"0 4px 4px 0",padding:"2px 8px",cursor:"pointer",overflow:"hidden",zIndex:2,fontSize:10.5,color:t.text,fontWeight:500 }}>
                            {ev.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Sidebar: mini-cal + upcoming */}
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <CalMiniCal calSelDay={calSelDay} setCalSelDay={setCalSelDay} setCalMonth={setCalMonth} setCalYear={setCalYear} liveToday={liveToday} myEv={myEv} user={user} t={t}/>
                  <div style={cardStyle()}>
                    <div style={{ fontSize:10,fontWeight:700,color:t.textFaint,letterSpacing:.5,marginBottom:10 }}>PRÓXIMOS EVENTOS</div>
                    {myEv.filter(e=>e.date>=calSelDay).slice(0,6).map(e=>{
                      const c=cats[e.type]||{dot:"#94a3b8"};
                      const isHl=highlightId?.id===e.id&&highlightId?.type==="event";
                      return (
                        <div key={e.id} id={`item-event-${e.id}`} onClick={()=>setEventModal({mode:"edit",ev:{...e},_clickedDate:e.date})}
                          style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:9,cursor:"pointer",marginBottom:3,border:`1px solid ${isHl?user.accent:"transparent"}`,boxShadow:isHl?`0 0 0 3px ${user.accent}40`:"none",transition:"all .3s" }} className="ch2">
                          <div style={{ width:7,height:7,borderRadius:"50%",background:c.dot,flexShrink:0 }}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:11.5,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.title}</div>
                            <div style={{ fontSize:9.5,color:t.textMuted }}>{e.date}{e.time&&` · ${e.time.slice(0,5)}`}</div>
                          </div>
                          {e.reminder_min!==null&&<span style={{ fontSize:10 }}>🔔</span>}
                          {e.recurrence!=="none"&&<span style={{ fontSize:10 }}>🔁</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── AGENDA VIEW ── */}
            {calView==="agenda"&&(()=>{
              const days=Array.from({length:60},(_,i)=>{ const d=new Date(nowLima()); d.setDate(d.getDate()+i); return d.toISOString().slice(0,10); });
              // Include all future tasks too, even past 60 days
              const allTaskDays = [...new Set(myT.filter(tx=>tx.deadline&&tx.deadline>=liveToday&&tx.status!=="completada").map(tx=>tx.deadline))];
              const allDays = [...new Set([...days, ...allTaskDays])].sort();
              const agendaDays = allDays.filter(ds=>evFor(ds).length>0||tasksFor(ds).length>0);

              return (
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {agendaDays.length===0&&(
                    <div style={{ color:t.textFaint,textAlign:"center",padding:"48px 0",fontSize:14 }}>
                      Sin eventos ni tareas próximas ✨
                    </div>
                  )}
                  {agendaDays.map(ds=>{
                    const d=new Date(ds+"T12:00");
                    const isToday=ds===liveToday;
                    const dayEvs=evFor(ds).sort((a,b)=>(a.time||"00:00").localeCompare(b.time||"00:00"));
                    const dayTasks=tasksFor(ds);

                    // Merge events and tasks into a single sorted list
                    const items = [
                      ...dayTasks.map(tx=>({_kind:"task", _time:"00:00", ...tx})),
                      ...dayEvs.map(ev=>({_kind:"event", _time:ev.time||"00:00", ...ev})),
                    ].sort((a,b)=>a._time.localeCompare(b._time));

                    return (
                      <div key={ds} style={{ display:"flex",gap:14,paddingBottom:4 }}>
                        {/* Date column */}
                        <div style={{ width:56,flexShrink:0,paddingTop:10,textAlign:"center" }}>
                          <div style={{ fontSize:9,color:isToday?user.accent:t.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase" }}>{WDAYS_SHORT[d.getDay()]}</div>
                          <div style={{ width:34,height:34,borderRadius:10,background:isToday?user.accent:"transparent",border:isToday?"none":`1px solid ${t.borderSub}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"3px auto 0" }}>
                            <span style={{ fontSize:15,fontWeight:isToday?800:600,color:isToday?"#07070f":t.text }}>{d.getDate()}</span>
                          </div>
                          <div style={{ fontSize:8,color:t.textFaint,marginTop:2 }}>{MONTHS_ES[d.getMonth()].slice(0,3)}</div>
                        </div>

                        {/* Items column */}
                        <div style={{ flex:1,display:"flex",flexDirection:"column",gap:4,paddingTop:8 }}>
                          {items.map((item,ii)=>{
                            if(item._kind==="task") {
                              const tx=item;
                              const overdue=tx.deadline<liveToday;
                              const cat=TASK_CATS[tx.category]||{color:"#64748b",label:tx.category||"—"};
                              return (
                                <div key={"t"+tx.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"rgba(248,113,113,.06)",border:`1px solid ${overdue?"rgba(248,113,113,.35)":"rgba(248,113,113,.15)"}`,borderLeft:"3px solid #f87171",borderRadius:"0 11px 11px 0",cursor:"pointer" }}
                                  onClick={()=>setEditTask({...tx})}>
                                  {/* Done toggle */}
                                  <div onClick={e=>{e.stopPropagation();cycleTask(tx.id,tx.status);}}
                                    style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${tx.status==="completada"?user.accent:"#f87171"}`,background:tx.status==="completada"?user.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s" }}>
                                    {tx.status==="completada"&&<span style={{ fontSize:9,color:"#07070f",fontWeight:900 }}>✓</span>}
                                  </div>
                                  <div style={{ flex:1,minWidth:0 }}>
                                    <div style={{ fontSize:12.5,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:tx.status==="completada"?"line-through":"none" }}>{tx.title}</div>
                                    <div style={{ fontSize:10,color:"#f87171",display:"flex",gap:6,marginTop:1 }}>
                                      <span>📌 Tarea</span>
                                      {overdue&&<span style={{ fontWeight:700 }}>⚠️ Vencida</span>}
                                    </div>
                                  </div>
                                  <div style={{ display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
                                    <span style={{ fontSize:10,color:PRIO_C[tx.priority]||"#64748b",background:(PRIO_C[tx.priority]||"#64748b")+"18",borderRadius:99,padding:"2px 7px",fontWeight:600 }}>{tx.priority}</span>
                                    <span style={{ fontSize:10,color:cat.color,background:cat.color+"18",borderRadius:99,padding:"2px 7px",fontWeight:600 }}>{cat.label}</span>
                                  </div>
                                </div>
                              );
                            } else {
                              const ev=item;
                              const c=cats[ev.type]||{dot:"#94a3b8",bg:"rgba(148,163,184,.08)"};
                              return (
                                <div key={"e"+ev.id+ii} onClick={()=>setEventModal({mode:"edit",ev:{...ev},_clickedDate:ev.date})}
                                  style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:c.bg||c.dot+"08",border:`1px solid ${c.dot}30`,borderLeft:`3px solid ${c.dot}`,borderRadius:"0 11px 11px 0",cursor:"pointer" }}>
                                  <div style={{ flex:1,minWidth:0 }}>
                                    <div style={{ fontSize:12.5,color:t.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.title}</div>
                                    <div style={{ fontSize:10,color:t.textMuted,marginTop:2,display:"flex",gap:8 }}>
                                      {ev.time?<span>{ev.time.slice(0,5)}{ev.time_end&&` → ${ev.time_end.slice(0,5)}`}</span>:<span>Todo el día</span>}
                                      {ev.description&&<span style={{ color:t.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200 }}>{ev.description.slice(0,50)}</span>}
                                    </div>
                                  </div>
                                  <div style={{ display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
                                    {ev.reminder_min!==null&&<span style={{fontSize:9,color:t.textFaint,background:t.borderSub,borderRadius:3,padding:"1px 4px",marginLeft:2}}>rec</span>}
                                    {ev.recurrence&&ev.recurrence!=="none"&&<span style={{fontSize:9,color:t.textFaint,background:t.borderSub,borderRadius:3,padding:"1px 4px",marginLeft:2}}>rep</span>}
                                    <Badge color={c.dot} sm>{(cats[ev.type]||{label:"?"}).label}</Badge>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Legend */}
            <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginTop:14 }}>
              {Object.entries(cats).map(([type,c])=>(<div key={type} style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:6,height:6,borderRadius:"50%",background:c.dot }}/><span style={{ fontSize:10,color:t.textMuted }}>{c.label}</span></div>))}
              <span style={{ fontSize:10,color:t.textFaint,marginLeft:4 }}>· 📌 tarea con fecha límite</span>
            </div>
          </div>
          );
        })()}


        {/* ══ TASKS ══ */}
        {tab==="tasks"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={4}/>;
          const customCats = taskCats.filter(c=>c.uid===user.id);
          const allCats = {
            ...TASK_CATS,
            ...Object.fromEntries(customCats.map(c=>[c.key,{color:c.color,label:c.label,_id:c.id}]))
          };

          // Inline add state
          // (addRow state lives at component level to avoid hook-in-IIFE error)

          const filtered = myT.filter(tx => taskCatFilter==="todos" || tx.category===taskCatFilter);
          const active   = filtered.filter(tx => tx.status !== "completada").sort((a,b)=>{
            if (a.deadline&&b.deadline) return a.deadline.localeCompare(b.deadline);
            if (a.deadline) return -1; if (b.deadline) return 1;
            return 0;
          });
          const completed = filtered.filter(tx => tx.status === "completada");

          const PRIO_OPTS = [{v:"alta",label:"Alta",color:"#f87171"},{v:"media",label:"Media",color:"#fb923c"},{v:"baja",label:"Baja",color:"#34d399"}];

          const saveInlineTask = async () => {
            if (!addRow.title.trim()) return;
            const row = { title:addRow.title.trim(), deadline:addRow.deadline||null, priority:addRow.priority, status:"pendiente", uid:user.id, shared:false, visibility:"private", category:addRow.category, course_id:addRow.category==="universidad"&&addRow.course_id?Number(addRow.course_id):null };
            const {data,error} = await supabase.from("tasks").insert(row).select().single();
            if (!error && data) {
              setTasks(prev => [...prev, data]);
              // Tasks appear on calendar via tasksFor() — no separate event needed
            }
            setAddRow({active:false, title:"", deadline:"", priority:"media", category:"personal", course_id:""});
          };

          // Build gridTemplateColumns from colWidths
          const mkGrid = () => `${colWidths.title}px ${colWidths.area}px ${colWidths.course}px ${colWidths.date}px ${colWidths.prio}px 52px 40px`;

          // Sort + filter active tasks
          const COL_KEYS = ["title","area","course","date","prio"];

          const applySort = (arr) => {
            const {col,dir} = taskSort;
            return [...arr].sort((a,b)=>{
              let va, vb;
              if(col==="title")  { va=a.title||"";         vb=b.title||""; }
              else if(col==="area")   { va=a.category||"";      vb=b.category||""; }
              else if(col==="course") { const ca=myCourses.find(c=>c.id===a.course_id); const cb=myCourses.find(c=>c.id===b.course_id); va=ca?.name||""; vb=cb?.name||""; }
              else if(col==="date")   { va=a.deadline||"9999";   vb=b.deadline||"9999"; }
              else if(col==="prio")   { const po={alta:0,media:1,baja:2}; va=po[a.priority]??1; vb=po[b.priority]??1; }
              if(va<vb) return dir==="asc"?-1:1;
              if(va>vb) return dir==="asc"?1:-1;
              return 0;
            });
          };

          const applyColFilters = (arr) => arr.filter(tx=>{
            const {title,area,course,date,prio} = taskColFilters;
            if(title  && !tx.title?.toLowerCase().includes(title.toLowerCase())) return false;
            if(area   && tx.category!==area) return false;
            if(course && !myCourses.find(c=>c.id===tx.course_id)?.name?.toLowerCase().includes(course.toLowerCase())) return false;
            if(date   && (!tx.deadline||!tx.deadline.includes(date))) return false;
            if(prio   && tx.priority!==prio) return false;
            return true;
          });

          const tableActive    = applySort(applyColFilters(active));
          const tableCompleted = applySort(applyColFilters(completed));

          const hasColFilters = Object.values(taskColFilters).some(v=>v);

          // Column resize handler
          const startResize = (e, col) => {
            e.preventDefault();
            const startX = e.clientX;
            const startW = colWidths[col];
            const onMove = (me) => {
              const newW = Math.max(60, startW + me.clientX - startX);
              const updated = {...colWidths, [col]:newW};
              setColWidths(updated);
              localStorage.setItem("taskColWidths", JSON.stringify(updated));
            };
            const onUp = () => { document.removeEventListener("mousemove",onMove); document.removeEventListener("mouseup",onUp); };
            document.addEventListener("mousemove",onMove);
            document.addEventListener("mouseup",onUp);
          };

          const sortIcon = (col) => taskSort.col===col ? (taskSort.dir==="asc"?"↑":"↓") : "";
          const toggleSort = (col) => setTaskSort(s => s.col===col ? {...s,dir:s.dir==="asc"?"desc":"asc"} : {col,dir:"asc"});

          const COL_DEFS = [
            {key:"title",  label:"Tarea",       icon:"Aa"},
            {key:"area",   label:"Área",         icon:"⊙"},
            {key:"course", label:"Curso",        icon:"↗"},
            {key:"date",   label:"Fecha límite", icon:"🗓"},
            {key:"prio",   label:"Prioridad",    icon:"⊙"},
          ];

          return (
          <div className="fu">
            {/* Delete confirm dialog */}
            {taskDeleteId&&(
              <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setTaskDeleteId(null)}>
                <div className="slide-down" style={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:16,padding:"24px 28px",width:320,boxShadow:"0 24px 60px rgba(0,0,0,.35)" }} onClick={e=>e.stopPropagation()}>
                  <div style={{ fontSize:15,fontWeight:700,color:t.text,marginBottom:8 }}>¿Eliminar tarea?</div>
                  <div style={{ fontSize:12,color:t.textMuted,marginBottom:20 }}>Esta acción no se puede deshacer.</div>
                  <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                    <button onClick={()=>setTaskDeleteId(null)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"8px 16px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancelar</button>
                    <button onClick={async()=>{await deleteTask(taskDeleteId);setTaskDeleteId(null);}} style={{ background:"rgba(248,113,113,.15)",border:"1px solid rgba(248,113,113,.4)",color:"#f87171",padding:"8px 16px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Eliminar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <h1 style={h1Style}>Tasks</h1>
                <HelpTip id="tasks" t={t} accent={user.accent}/>
                <div style={{ display:"flex",gap:4,marginLeft:4 }}>
                  {[["table","☰ Tabla"],["list","≡ Lista"]].map(([v,label])=>(
                    <button key={v} onClick={()=>setTaskView(v)}
                      style={{ padding:"4px 10px",borderRadius:7,border:`1px solid ${taskView===v?user.accent+"50":t.inputBdr}`,background:taskView===v?user.accent+"15":"none",color:taskView===v?user.accent:t.textMuted,fontSize:11,fontWeight:taskView===v?700:400,cursor:"pointer" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {hasColFilters&&(
                  <button onClick={()=>setTaskColFilters({title:"",area:"",course:"",date:"",prio:""})}
                    style={{ fontSize:10,color:"#f87171",background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",borderRadius:6,padding:"2px 8px",cursor:"pointer" }}>
                    ✕ Quitar filtros
                  </button>
                )}
              </div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {["todos",...Object.keys(allCats)].map(f=>{
                  const cfg = f==="todos"?{color:"#64748b",label:"Todas"}:allCats[f];
                  return (
                    <button key={f} onClick={()=>setTaskCatFilter(f)}
                      style={{ padding:"5px 12px",borderRadius:99,border:`1px solid ${taskCatFilter===f?cfg.color+"50":t.border}`,background:taskCatFilter===f?cfg.color+"18":"transparent",color:taskCatFilter===f?cfg.color:t.textMuted,fontSize:11,fontWeight:taskCatFilter===f?600:400,cursor:"pointer" }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TABLE VIEW ── */}
            {taskView==="table"&&(
              <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:16,overflowX:"auto" }}>
                <div style={{ minWidth:700 }}>

                  {/* Column filter row */}
                  <div style={{ display:"grid",gridTemplateColumns:mkGrid(),borderBottom:`2px solid ${user.accent}30`,background:dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)" }}>
                    {/* Title filter */}
                    <div style={{ padding:"5px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                      <input value={taskColFilters.title} onChange={e=>setTaskColFilters(p=>({...p,title:e.target.value}))}
                        placeholder="🔍 Filtrar tarea…" style={{ ...inputStyle,width:"100%",padding:"4px 8px",fontSize:10.5,border:`1px solid ${taskColFilters.title?user.accent:t.inputBdr}`,background:taskColFilters.title?user.accent+"10":t.input }} />
                    </div>
                    {/* Area filter */}
                    <div style={{ padding:"4px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                      <select value={taskColFilters.area} onChange={e=>setTaskColFilters(p=>({...p,area:e.target.value}))}
                        style={{ ...inputStyle,width:"100%",padding:"3px 7px",fontSize:10,border:`1px solid ${taskColFilters.area?user.accent+"60":t.inputBdr}` }}>
                        <option value="">Todas</option>
                        {Object.entries(allCats).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    {/* Course filter */}
                    <div style={{ padding:"4px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                      <input value={taskColFilters.course} onChange={e=>setTaskColFilters(p=>({...p,course:e.target.value}))}
                        placeholder="Filtrar curso…" style={{ ...inputStyle,width:"100%",padding:"3px 7px",fontSize:10,border:`1px solid ${taskColFilters.course?user.accent+"60":t.inputBdr}` }}/>
                    </div>
                    {/* Date filter */}
                    <div style={{ padding:"4px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                      <input value={taskColFilters.date} onChange={e=>setTaskColFilters(p=>({...p,date:e.target.value}))}
                        placeholder="aaaa-mm" style={{ ...inputStyle,width:"100%",padding:"3px 7px",fontSize:10,border:`1px solid ${taskColFilters.date?user.accent+"60":t.inputBdr}` }}/>
                    </div>
                    {/* Priority filter */}
                    <div style={{ padding:"4px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                      <select value={taskColFilters.prio} onChange={e=>setTaskColFilters(p=>({...p,prio:e.target.value}))}
                        style={{ ...inputStyle,width:"100%",padding:"3px 7px",fontSize:10,border:`1px solid ${taskColFilters.prio?user.accent+"60":t.inputBdr}` }}>
                        <option value="">Todas</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                    <div style={{ borderRight:`1px solid ${t.borderSub}` }}/>
                    <div/>
                  </div>


                  {/* Column headers */}
                  <div style={{ display:"grid",gridTemplateColumns:mkGrid(),borderBottom:`2px solid ${t.border}`,background:t.input,position:"sticky",top:0,zIndex:10 }}>
                    {COL_DEFS.map((cd,i)=>(
                      <div key={cd.key} style={{ display:"flex",alignItems:"center",borderRight:`1px solid ${t.borderSub}`,position:"relative",userSelect:"none" }}>
                        <div onClick={()=>toggleSort(cd.key)}
                          style={{ flex:1,padding:"8px 10px",fontSize:11,fontWeight:600,color:taskSort.col===cd.key?user.accent:t.textMuted,display:"flex",alignItems:"center",gap:5,cursor:"pointer" }}>
                          <span style={{ opacity:.5,fontSize:10 }}>{cd.icon}</span>
                          {cd.label}
                          {sortIcon(cd.key)&&<span style={{ color:user.accent,fontSize:10 }}>{sortIcon(cd.key)}</span>}
                        </div>
                        {/* Resize handle */}
                        <div onMouseDown={e=>startResize(e,cd.key)}
                          style={{ width:4,height:"100%",cursor:"col-resize",position:"absolute",right:0,top:0,opacity:0 }}
                          onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                          onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
                          <div style={{ width:2,height:"100%",background:user.accent,margin:"0 auto" }}/>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding:"8px 10px",fontSize:11,fontWeight:600,color:t.textMuted,borderRight:`1px solid ${t.borderSub}`,textAlign:"center" }}>✓</div>
                    <div style={{ padding:"8px 10px" }}/>
                  </div>

                  {tableActive.length===0&&!addRow.active&&(
                    <div style={{ padding:"28px",textAlign:"center",color:t.textFaint,fontSize:13 }}>
                      {hasColFilters?"No hay tareas que coincidan con los filtros.":"No hay tareas activas. Haz click en + para añadir."}
                    </div>
                  )}
                  {tableActive.map((tx,i)=>{
                    const cat  = allCats[tx.category]||TASK_CATS.personal;
                    const course = tx.course_id ? myCourses.find(c=>c.id===tx.course_id) : null;
                    const isHL = highlightId?.id===tx.id&&highlightId?.type==="task";
                    const overdue = tx.deadline && tx.deadline < liveToday;
                    return (
                      <div key={tx.id} id={`item-task-${tx.id}`}
                        style={{ display:"grid",gridTemplateColumns:mkGrid(),borderBottom:`1px solid ${t.borderSub}`,background:isHL?user.accent+"08":i%2===0?"transparent":t.input+"40",transition:"background .15s",boxShadow:isHL?`inset 0 0 0 2px ${user.accent}40`:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.background=user.accent+"08"}
                        onMouseLeave={e=>e.currentTarget.style.background=isHL?user.accent+"08":i%2===0?"transparent":t.input+"40"}>

                        {/* Title */}
                        <div onClick={()=>setEditTask({...tx})}
                          style={{ padding:"8px 10px",display:"flex",alignItems:"center",gap:7,cursor:"pointer",borderRight:`1px solid ${t.borderSub}`,minWidth:0,overflow:"hidden" }}>
                          <span style={{ fontSize:12,opacity:.35,flexShrink:0 }}>🗒</span>
                          <span style={{ fontSize:12.5,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.title}</span>
                        </div>

                        {/* Area */}
                        <div style={{ padding:"8px 10px",display:"flex",alignItems:"center",borderRight:`1px solid ${t.borderSub}`,overflow:"hidden" }}>
                          <span style={{ fontSize:11,fontWeight:600,color:cat.color,background:cat.color+"18",borderRadius:99,padding:"2px 9px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{cat.label}</span>
                        </div>

                        {/* Course */}
                        <div style={{ padding:"8px 10px",display:"flex",alignItems:"center",borderRight:`1px solid ${t.borderSub}`,overflow:"hidden" }}>
                          {course
                            ? <span style={{ fontSize:11,color:"#3b82f6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>⊕ {course.name}</span>
                            : <span style={{ fontSize:11,color:t.textGhost }}>—</span>}
                        </div>

                        {/* Date */}
                        <div style={{ padding:"8px 10px",display:"flex",alignItems:"center",borderRight:`1px solid ${t.borderSub}` }}>
                          {tx.deadline
                            ? <span style={{ fontSize:11,color:overdue?"#f87171":t.textMuted,fontWeight:overdue?700:400,whiteSpace:"nowrap" }}>
                                {new Date(tx.deadline+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"})}
                                {overdue&&" ⚠️"}
                              </span>
                            : <span style={{ fontSize:11,color:t.textGhost }}>—</span>}
                        </div>

                        {/* Priority */}
                        <div style={{ padding:"8px 10px",display:"flex",alignItems:"center",borderRight:`1px solid ${t.borderSub}` }}>
                          <span style={{ fontSize:11,fontWeight:600,color:PRIO_C[tx.priority],background:PRIO_C[tx.priority]+"18",borderRadius:99,padding:"2px 9px" }}>
                            {tx.priority.charAt(0).toUpperCase()+tx.priority.slice(1)}
                          </span>
                        </div>

                        {/* Done */}
                        <div style={{ padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${t.borderSub}` }}>
                          <div onClick={()=>cycleTask(tx.id,tx.status)}
                            style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${tx.status==="completada"?user.accent:t.inputBdr}`,background:tx.status==="completada"?user.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s" }}>
                            {tx.status==="completada"&&<span style={{ fontSize:9,color:"#07070f",fontWeight:900 }}>✓</span>}
                          </div>
                        </div>

                        {/* Delete */}
                        <div style={{ padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <button onClick={()=>setTaskDeleteId(tx.id)}
                            style={{ background:"none",border:"none",color:"#f87171",padding:3,cursor:"pointer",opacity:0,transition:"opacity .15s",display:"flex" }}
                            onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Inline add row */}
                  {addRow.active&&(
                    <div style={{ display:"grid",gridTemplateColumns:mkGrid(),borderBottom:`1px solid ${t.border}`,background:user.accent+"06",borderTop:`1px solid ${user.accent}30` }}>
                      <div style={{ padding:"5px 7px",borderRight:`1px solid ${t.borderSub}`,display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:12,opacity:.3,flexShrink:0 }}>🗒</span>
                        <input autoFocus value={addRow.title} onChange={e=>setAddRow(p=>({...p,title:e.target.value}))}
                          onKeyDown={e=>{ if(e.key==="Enter") saveInlineTask(); if(e.key==="Escape") setAddRow(p=>({...p,active:false})); }}
                          placeholder="Nombre de la tarea…"
                          style={{ ...inputStyle,flex:1,minWidth:0,padding:"3px 7px",fontSize:12,border:"none",background:"transparent",outline:"none" }}/>
                      </div>
                      <div style={{ padding:"5px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                        <select value={addRow.category} onChange={e=>setAddRow(p=>({...p,category:e.target.value,course_id:""}))}
                          style={{ ...inputStyle,width:"100%",fontSize:11,padding:"3px 6px" }}>
                          {Object.entries(allCats).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div style={{ padding:"5px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                        {addRow.category==="universidad"
                          ? <select value={addRow.course_id} onChange={e=>setAddRow(p=>({...p,course_id:e.target.value}))}
                              style={{ ...inputStyle,width:"100%",fontSize:11,padding:"3px 6px" }}>
                              <option value="">Sin curso</option>
                              {myCourses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          : <span style={{ fontSize:11,color:t.textGhost,padding:"4px 8px",display:"block" }}>—</span>}
                      </div>
                      <div style={{ padding:"5px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                        <input type="date" value={addRow.deadline} onChange={e=>setAddRow(p=>({...p,deadline:e.target.value}))}
                          style={{ ...inputStyle,width:"100%",fontSize:11,padding:"3px 6px" }}/>
                      </div>
                      <div style={{ padding:"5px 6px",borderRight:`1px solid ${t.borderSub}` }}>
                        <select value={addRow.priority} onChange={e=>setAddRow(p=>({...p,priority:e.target.value}))}
                          style={{ ...inputStyle,width:"100%",fontSize:11,padding:"3px 6px" }}>
                          {PRIO_OPTS.map(o=><option key={o.v} value={o.v}>{o.label}</option>)}
                        </select>
                      </div>
                      <div style={{ padding:"5px 8px",display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${t.borderSub}` }}>
                        <button onClick={saveInlineTask} style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer" }}>✓</button>
                      </div>
                      <div style={{ padding:"5px 6px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <button onClick={()=>setAddRow(p=>({...p,active:false}))} style={{ background:"none",border:"none",color:t.textFaint,cursor:"pointer",fontSize:14 }}>✕</button>
                      </div>
                    </div>
                  )}

                  {/* Add row button */}
                  <div>
                    <button onClick={()=>setAddRow(p=>({...p,active:true}))}
                      style={{ width:"100%",padding:"8px 14px",background:"none",border:"none",color:t.textFaint,fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=t.input}
                      onMouseLeave={e=>e.currentTarget.style.background="none"}>
                      <Plus size={13}/> Nueva tarea
                    </button>
                  </div>

                  {/* Completed section */}
                  {completed.length>0&&(
                    <div style={{ borderTop:`2px solid ${t.border}` }}>
                      <button onClick={()=>setShowCompleted(s=>!s)}
                        style={{ width:"100%",padding:"8px 14px",background:t.input,border:"none",color:t.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                        <Check size={12} color={user.accent}/>
                        <span style={{ flex:1,textAlign:"left" }}>Completadas · <span style={{ color:user.accent }}>{tableCompleted.length}{tableCompleted.length!==completed.length?` (${completed.length} total)`:""}</span></span>
                        <ChevronRight size={12} style={{ transform:showCompleted?"rotate(90deg)":"none",transition:"transform .2s" }}/>
                      </button>
                      {showCompleted&&tableCompleted.map((tx,i)=>{
                        const cat=allCats[tx.category]||TASK_CATS.personal;
                        const course=tx.course_id?myCourses.find(c=>c.id===tx.course_id):null;
                        return (
                          <div key={tx.id}
                            style={{ display:"grid",gridTemplateColumns:mkGrid(),borderBottom:`1px solid ${t.borderSub}`,opacity:.55 }}
                            onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="0.55"}>
                            <div onClick={()=>setEditTask({...tx})} style={{ padding:"7px 10px",display:"flex",alignItems:"center",gap:7,cursor:"pointer",borderRight:`1px solid ${t.borderSub}`,minWidth:0,overflow:"hidden" }}>
                              <span style={{ fontSize:12,opacity:.3,flexShrink:0 }}>🗒</span>
                              <span style={{ fontSize:12.5,color:t.textMuted,textDecoration:"line-through",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.title}</span>
                            </div>
                            <div style={{ padding:"7px 10px",borderRight:`1px solid ${t.borderSub}` }}><span style={{ fontSize:11,color:cat.color,background:cat.color+"18",borderRadius:99,padding:"2px 9px" }}>{cat.label}</span></div>
                            <div style={{ padding:"7px 10px",borderRight:`1px solid ${t.borderSub}`,fontSize:11,color:t.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{course?.name||"—"}</div>
                            <div style={{ padding:"7px 10px",borderRight:`1px solid ${t.borderSub}`,fontSize:11,color:t.textMuted,whiteSpace:"nowrap" }}>{tx.deadline?new Date(tx.deadline+"T12:00").toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"}):"—"}</div>
                            <div style={{ padding:"7px 10px",borderRight:`1px solid ${t.borderSub}`,fontSize:11,color:PRIO_C[tx.priority] }}>{tx.priority.charAt(0).toUpperCase()+tx.priority.slice(1)}</div>
                            <div style={{ padding:"7px 10px",display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${t.borderSub}` }}>
                              <div onClick={()=>cycleTask(tx.id,tx.status)} style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${user.accent}`,background:user.accent,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                                <span style={{ fontSize:9,color:"#07070f",fontWeight:900 }}>✓</span>
                              </div>
                            </div>
                            <div style={{ padding:"7px 6px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                              <button onClick={()=>setTaskDeleteId(tx.id)} style={{ background:"none",border:"none",color:"#f87171",padding:3,cursor:"pointer",display:"flex",opacity:.5 }}><Trash2 size={11}/></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── LIST VIEW (original) ── */}
            {taskView==="list"&&(()=>{
              const renderTask = (tx, i) => {
                const isAssignedToMe = Number(tx.assigned_to)===user.id && tx.uid!==user.id;
                const myLocalDone = isAssignedToMe ? localStorage.getItem(`task_done_${tx.id}_${user.id}`) === "1" : false;
                const done = isAssignedToMe ? myLocalDone : tx.status==="completada";
                const prog = !done && tx.status==="en progreso";
                const cat = allCats[tx.category] || TASK_CATS.personal;
                const course = tx.course_id ? myCourses.find(c=>c.id===tx.course_id) : null;
                const isExpanded = expandedTask === tx.id;
                const subs = subtasks[tx.id] || [];
                const progress = getSubtaskProgress(tx.id);
                return (
                  <div key={tx.id} id={`item-task-${tx.id}`}>
                    <div className="tr pop-in" style={{ background:t.bgCard,borderRadius:isExpanded?"12px 12px 0 0":12,border:`1px solid ${highlightId?.id===tx.id&&highlightId?.type==="task"?user.accent:done?t.borderSub:PRIO_C[tx.priority]+"25"}`,opacity:done?.5:1,transition:"opacity .25s,border-color .15s",animationDelay:`${i*55}ms`,boxShadow:highlightId?.id===tx.id&&highlightId?.type==="task"?`0 0 0 3px ${user.accent}40`:"none" }}>
                      <div onClick={()=>cycleTask(tx.id,tx.status)} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 15px",cursor:"pointer" }}>
                        <div style={{ width:19,height:19,borderRadius:6,border:`2px solid ${done?user.accent:PRIO_C[tx.priority]}`,background:done?user.accent:prog?PRIO_C[tx.priority]+"20":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .25s" }}>
                          {done&&<span style={{ fontSize:9.5,color:"#07070f",fontWeight:900 }}>✓</span>}
                          {prog&&<div style={{ width:6,height:6,borderRadius:"50%",background:PRIO_C[tx.priority] }}/>}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,color:done?t.textMuted:t.text,textDecoration:done?"line-through":"none",fontWeight:done?400:500 }}>{tx.title}</div>
                          <div style={{ fontSize:10,color:t.textMuted,marginTop:2,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                            {tx.deadline&&<><Timer size={8}/>{tx.deadline}</>}
                          </div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
                          {course&&<Badge color="#3b82f6" sm>{course.name}</Badge>}
                          <Badge color={cat.color} sm>{cat.label}</Badge>
                          <button onClick={e=>{e.stopPropagation();setEditTask({...tx});loadSubtasks(tx.id);}} style={{ background:"none",border:"none",color:t.textFaint,padding:3,display:"flex",opacity:.6,cursor:"pointer" }}><Pencil size={11}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              };
              return (
                <>
                  <div style={{ marginBottom:12 }}>
                    <button onClick={()=>setForm(!form)} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}><Plus size={13}/> Nueva tarea</button>
                  </div>
                  {form&&(
                    <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:20 }}>
                      <div style={{ display:"flex",gap:9,alignItems:"center",flexWrap:"wrap" }}>
                        <input value={nt.title} onChange={e=>setNt({...nt,title:e.target.value})} onKeyDown={e=>e.key==="Enter"&&saveTask()} placeholder="¿Qué tienes que hacer?" style={{ flex:1,minWidth:180,...inputStyle }}/>
                        <input type="date" value={nt.deadline} onChange={e=>setNt({...nt,deadline:e.target.value})} style={inputStyle}/>
                        <select value={nt.priority} onChange={e=>setNt({...nt,priority:e.target.value})} style={inputStyle}>
                          <option value="alta">🔴 Alta</option><option value="media">🟠 Media</option><option value="baja">🟢 Baja</option>
                        </select>
                        <select value={nt.category} onChange={e=>setNt({...nt,category:e.target.value,course_id:""})} style={inputStyle}>
                          {Object.entries(allCats).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                        </select>
                        {nt.category==="universidad"&&(
                          <select value={nt.course_id} onChange={e=>setNt({...nt,course_id:e.target.value})} style={inputStyle}>
                            <option value="">Sin curso</option>
                            {myCourses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        )}
                        <button onClick={saveTask} disabled={saving} style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 17px",borderRadius:9,fontSize:12,fontWeight:700,opacity:saving?0.6:1,display:"flex",alignItems:"center",gap:6 }}>{saving?<><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>Guardando...</>:"Guardar"}</button>
                        <button onClick={()=>setForm(false)} style={{ background:"none",border:"none",color:t.textMuted,padding:5 }}><X size={15}/></button>
                      </div>
                    </div>
                  )}
                  {active.length===0&&<p style={{ color:t.textFaint,fontSize:13,padding:"20px 0" }}>No hay tareas activas ✅</p>}
                  <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                    {active.map((tx,i)=>renderTask(tx,i))}
                  </div>
                  {completed.length>0&&(
                    <div style={{ marginTop:8 }}>
                      <button onClick={()=>setShowCompleted(s=>!s)} style={{ display:"flex",alignItems:"center",gap:8,background:"none",border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 14px",color:t.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",width:"100%",marginBottom:showCompleted?12:0 }}>
                        <Check size={13} color={user.accent}/><span style={{ flex:1,textAlign:"left" }}>Completadas · <span style={{ color:user.accent }}>{completed.length}</span></span>
                        <ChevronRight size={13} style={{ transform:showCompleted?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s" }}/>
                      </button>
                      {showCompleted&&<div className="slide-down" style={{ display:"flex",flexDirection:"column",gap:5 }}>{completed.map((tx,i)=>renderTask(tx,i))}</div>}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          );
        })()}

        {/* ══ NOTAS ══ */}
        {tab==="notas"&&(loading ? <SkeletonTab t={t} count={3}/> :
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18 }}>
              <div><h1 style={h1Style}>Notas personales</h1><p style={subStyle}>Ideas, reflexiones y objetivos</p></div>
              <button className="btn" onClick={()=>{
                // Open editor with in-memory draft — only saved to DB when user clicks Guardar
                setEditNote({ _draft: true, title:"", body:"", type:"idea", date:liveToday, uid:user.id });
              }} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><Plus size={13}/> Nueva nota</button>
            </div>

            {/* Filter */}
            <div style={{ display:"flex",gap:7,marginBottom:20 }}>
              {["todos","idea","journal","objetivo"].map(f=>{ const cfg=f==="todos"?{color:"#64748b",Ic:Tag}:NOTE_C[f]; const FIc=cfg.Ic; return (
                <button key={f} className="ch btn" onClick={()=>setNf(f)} style={{ display:"flex",alignItems:"center",gap:5,background:nf===f?cfg.color+"18":t.bgCard,border:`1px solid ${nf===f?cfg.color+"50":t.border}`,color:nf===f?cfg.color:t.textMuted,padding:"5px 14px",borderRadius:99,fontSize:11,fontWeight:nf===f?600:400 }}>
                  <FIc size={10}/><span style={{ textTransform:"capitalize" }}>{f}</span>
                </button>
              ); })}
            </div>

            {myNotes.length===0&&<p style={{ color:t.textFaint,fontSize:13,padding:"20px 0" }}>No hay notas todavía. ¡Crea la primera!</p>}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:14 }}>
              {myNotes.map((n,i)=>{ const cfg=NOTE_C[n.type]||NOTE_C.idea, NIc=cfg.Ic; const isOwn=n.uid===user.id;
                const previewHtml = renderMarkdown((n.body||"").split("\n").slice(0,6).join("\n"));
                return (
                <div key={n.id} id={`item-note-${n.id}`} className="ch2 pop-in" onClick={()=>isOwn&&setEditNote({...n})} style={{ background:t.bgCard,border:`1px solid ${highlightId?.id===n.id&&highlightId?.type==="note"?user.accent:t.border}`,borderTop:`2.5px solid ${cfg.color}`,borderRadius:18,padding:"17px 19px",animationDelay:`${i*70}ms`,cursor:isOwn?"pointer":"default",boxShadow:highlightId?.id===n.id&&highlightId?.type==="note"?`0 0 0 3px ${user.accent}40`:"none",transition:"box-shadow .3s,border-color .3s" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:5,background:cfg.color+"18",borderRadius:99,padding:"3px 10px" }}><NIc size={10} color={cfg.color}/><span style={{ fontSize:9,color:cfg.color,fontWeight:700,letterSpacing:.5,textTransform:"uppercase" }}>{cfg.label}</span></div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      {n.shared&&n.uid!==user.id?<SharedByBadge author={authorOf(n)} t={t}/>:n.shared?<Share2 size={9} color={t.textFaint}/>:null}
                      <span style={{ fontSize:10,color:t.textFaint }}>{n.date}</span>
                      {n.uid===user.id&&<Pencil size={10} color={t.textFaint}/>}
                    </div>
                  </div>
                  <div style={{ fontSize:14,color:t.text,fontWeight:600,marginBottom:8,lineHeight:1.3 }}>{n.title}</div>
                  {n.body&&<div className="md-preview" dangerouslySetInnerHTML={{__html:previewHtml}} style={{ fontSize:12,color:t.textMuted,lineHeight:1.7,maxHeight:90,overflow:"hidden",maskImage:"linear-gradient(to bottom,black 60%,transparent 100%)" }}/>}
                  {n.body && <div style={{ marginTop:6,fontSize:10,color:t.textFaint,display:"flex",alignItems:"center",gap:4 }}>
                    <FileText size={9}/> {n.body.split(/\s+/).filter(Boolean).length} palabras
                  </div>}
                </div>
              ); })}
            </div>
          </div>
        )}

        {/* ══ FINANZAS ══ */}
        {tab==="finanzas"&&(loading ? <SkeletonTab t={t} count={3}/> :
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
              <div>
                <h1 style={h1Style}>Finanzas</h1>
                {/* Month navigator */}
                <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6 }}>
                  <button onClick={()=>{ const [y,m]=finMonth.split("-").map(Number); const d=new Date(y,m-2,1); setFinMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); }} style={{ background:t.bgCard,border:`1px solid ${t.border}`,color:t.textSub,borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>‹</button>
                  <span style={{ fontSize:12,color:t.textMuted,fontWeight:600 }}>{new Date(finMonth+"-15").toLocaleDateString("es-PE",{month:"long",year:"numeric"})}</span>
                  <button onClick={()=>{ const [y,m]=finMonth.split("-").map(Number); const d=new Date(y,m,1); setFinMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); }} style={{ background:t.bgCard,border:`1px solid ${t.border}`,color:t.textSub,borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>›</button>
                  <button onClick={()=>{ const d=new Date(); setFinMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); }} style={{ background:t.input,border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:6,padding:"1px 8px",fontSize:10,fontWeight:600,cursor:"pointer" }}>Hoy</button>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                <button className="btn" onClick={()=>setFForm(!fForm)} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><Plus size={13}/> Registrar</button>
                <button onClick={()=>setFinCatForm(!finCatForm)} style={{ background:t.bgCard,border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:10,padding:"8px 13px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}><Settings size={12}/> Categorías</button>
              </div>
            </div>
            {finCatForm&&(
              <div className="slide-down" style={{ ...cardStyle(),marginBottom:16,border:`1px solid ${t.border}` }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}><Settings size={12} color={t.textSub}/><span style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.5 }}>CATEGORÍAS PERSONALIZADAS</span></div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:14 }}>
                  {Object.entries(finCats).map(([k,v])=>(
                    <div key={k} style={{ display:"flex",alignItems:"center",gap:5,background:v.color+"18",border:`1px solid ${v.color}40`,borderRadius:99,padding:"3px 10px" }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:v.color }}/>
                      <span style={{ fontSize:11,color:v.color,fontWeight:600 }}>{v.label}</span>
                      {k!=="otro"&&<button onClick={()=>delFinCat(k)} style={{ background:"none",border:"none",color:v.color,padding:"0 0 0 2px",cursor:"pointer",opacity:.6,display:"flex",lineHeight:1 }}><X size={10}/></button>}
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                  <input value={newFinCat.key} onChange={e=>setNewFinCat({...newFinCat,key:e.target.value})} placeholder="id (ej: salud)" style={{ width:100,...inputStyle,fontSize:11 }}/>
                  <input value={newFinCat.label} onChange={e=>setNewFinCat({...newFinCat,label:e.target.value})} placeholder="Nombre" style={{ flex:1,minWidth:100,...inputStyle,fontSize:11 }}/>
                  <input type="color" value={newFinCat.color} onChange={e=>setNewFinCat({...newFinCat,color:e.target.value})} style={{ width:36,height:32,border:`1px solid ${t.inputBdr}`,borderRadius:8,background:t.input,cursor:"pointer",padding:2 }}/>
                  <button onClick={addFinCat} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 14px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer" }}>Agregar</button>
                </div>
              </div>
            )}
            {fForm&&(
              <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:20 }}>
                <div style={{ display:"flex",gap:9,alignItems:"center",flexWrap:"wrap" }}>
                  <input value={nTx.description} onChange={e=>setNTx({...nTx,description:e.target.value})} placeholder="Descripción" style={{ flex:1,minWidth:150,...inputStyle }}/>
                  <input type="number" value={nTx.amount} onChange={e=>setNTx({...nTx,amount:e.target.value})} placeholder="Monto S/" style={{ width:120,...inputStyle }}/>
                  <input type="date" value={nTx.date} onChange={e=>setNTx({...nTx,date:e.target.value})} style={inputStyle}/>
                  <select value={nTx.type} onChange={e=>setNTx({...nTx,type:e.target.value})} style={inputStyle}><option value="ingreso">💰 Ingreso</option><option value="gasto">💸 Gasto</option></select>
                  <select value={nTx.cat} onChange={e=>setNTx({...nTx,cat:e.target.value})} style={inputStyle}>{Object.entries(finCats).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
                  <VisibilityPicker value={nTx.visibility||"private"} onChange={v=>setNTx({...nTx,visibility:v,shared:v!=="private"})} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={users.filter(u=>u.id!==user.id)}/>
                  <button className="btn" onClick={saveTx} disabled={saving} style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 17px",borderRadius:9,fontSize:12,fontWeight:700,opacity:saving?0.6:1,display:"flex",alignItems:"center",gap:6 }}>{saving?<><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>Guardando...</>:"Guardar"}</button>
                  <button onClick={()=>setFForm(false)} style={{ background:"none",border:"none",color:t.textMuted,padding:5 }}><X size={15}/></button>
                </div>
              </div>
            )}
            <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:20 }}>
              <Stat Ic={ArrowUpRight}   label="Ingresos" value={Math.round(ingresos)} prefix="S/ " color="#34d399" sub="este mes" delay={0}   t={t}/>
              <Stat Ic={ArrowDownRight} label="Gastos"   value={Math.round(gastos)}   prefix="S/ " color="#f87171" sub="este mes" delay={80}  t={t}/>
              <Stat Ic={Wallet}         label="Balance"  value={Math.abs(Math.round(balance))} prefix={balance>=0?"S/ ":"−S/ "} color={balance>=0?"#34d399":"#f87171"} sub={balance>=0?"superávit":"déficit"} delay={160} t={t}/>
            </div>
            <div className="two-col" style={{ display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16,marginBottom:16 }}>
              <div style={cardStyle()}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:16 }}><BarChart2 size={13} color={t.textSub}/><span style={secLabel}>INGRESOS VS GASTOS (6 meses)</span></div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} barSize={10}>
                    <XAxis dataKey="mes" tick={{ fill:t.textMuted,fontSize:10 }} axisLine={false} tickLine={false}/>
                    <YAxis hide/>
                    <Tooltip contentStyle={{ background:t.modalBg,border:`1px solid ${t.border}`,borderRadius:10,fontSize:11,color:t.text }} formatter={v=>money(v)}/>
                    <Bar dataKey="ingresos" fill="#34d399" opacity={0.8} radius={[4,4,0,0]}/>
                    <Bar dataKey="gastos"   fill="#f87171" opacity={0.8} radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={cardStyle()}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:14 }}><PiggyBank size={13} color={t.textSub}/><span style={secLabel}>GASTOS POR CATEGORÍA</span></div>
                {gastosByCat.length===0?<p style={{ color:t.textFaint,fontSize:12 }}>Sin gastos registrados aún.</p>:(
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <ResponsiveContainer width={100} height={100}>
                      <PieChart><Pie data={gastosByCat} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={0}>{gastosByCat.map((entry,i)=><Cell key={i} fill={entry.color} opacity={0.85}/>)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex:1 }}>
                      {gastosByCat.map(d=>(<div key={d.name} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:5 }}><div style={{ width:7,height:7,borderRadius:"50%",background:d.color,flexShrink:0 }}/><span style={{ fontSize:10.5,color:t.textSub,flex:1 }}>{d.name}</span><span style={{ fontSize:10,color:t.textMuted }}>S/ {d.value.toFixed(0)}</span></div>))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="two-col" style={{ display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16 }}>
              <div style={cardStyle()}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:14 }}><DollarSign size={13} color={t.textSub}/><span style={secLabel}>MOVIMIENTOS · {new Date(finMonth+"-15").toLocaleDateString("es-PE",{month:"long"})}</span></div>
                {myTxMonth.length===0&&<p style={{ color:t.textFaint,fontSize:12 }}>Sin movimientos este mes.</p>}
                <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:280,overflowY:"auto" }}>
                  {myTxMonth.map((tx,i)=>{ const c=finCats[tx.cat]||finCats.otro||{color:"#64748b",label:tx.cat}; const isIng=tx.type==="ingreso"; return (
                    <div key={tx.id} id={`item-tx-${tx.id}`} className="tr pop-in" style={{ display:"flex",alignItems:"center",gap:11,padding:"9px 12px",borderRadius:11,animationDelay:`${i*40}ms`,border:`1px solid ${highlightId?.id===tx.id&&highlightId?.type==="tx"?user.accent:"transparent"}`,boxShadow:highlightId?.id===tx.id&&highlightId?.type==="tx"?`0 0 0 3px ${user.accent}40`:"none",transition:"box-shadow .3s,border-color .3s" }}>
                      <div style={{ width:30,height:30,borderRadius:9,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {isIng?<ArrowUpRight size={13} color="#34d399"/>:<ArrowDownRight size={13} color="#f87171"/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12.5,color:t.text,fontWeight:500 }}>{tx.description}</div>
                        <div style={{ fontSize:10,color:t.textMuted,marginTop:1,display:"flex",alignItems:"center",gap:5 }}><span style={{ color:c.color }}>{c.label}</span>{tx.date&&<> · {tx.date}</>}{tx.shared&&<><Share2 size={8}/> compartido</>}</div>
                      </div>
                      <span style={{ fontSize:13,fontWeight:700,color:isIng?"#34d399":"#f87171" }}>{isIng?"+":"-"}{money(tx.amount)}</span>
                      <button onClick={e=>{e.stopPropagation();setEditTx({...tx});}} style={{ background:"none",border:"none",color:t.textFaint,padding:3,display:"flex",opacity:.6 }}><Pencil size={11}/></button>
                    </div>
                  ); })}
                </div>
              </div>
              <div style={cardStyle()}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:14 }}><SplitSquareHorizontal size={13} color={t.textSub}/><span style={secLabel}>DEUDAS / SPLIT</span></div>
                {debts.length===0&&<p style={{ color:t.textFaint,fontSize:12 }}>Sin deudas pendientes 🎉</p>}
                {debts.map(d=>{ const from=users.find(u=>u.id===d.from_uid), to=users.find(u=>u.id===d.to_uid); if(!from||!to) return null; return (
                  <div key={d.id} style={{ background:d.settled?t.input:"rgba(248,113,113,.05)",borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${d.settled?t.border:"rgba(248,113,113,.2)"}` }}>
                    <div style={{ fontSize:12,color:t.text,marginBottom:6 }}>{d.description}</div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                        <div style={{ width:18,height:18,borderRadius:6,background:from.accent+"25",border:`1px solid ${from.accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:from.accent }}>{from.initials}</div>
                        <span style={{ fontSize:10,color:t.textFaint }}>→</span>
                        <div style={{ width:18,height:18,borderRadius:6,background:to.accent+"25",border:`1px solid ${to.accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:to.accent }}>{to.initials}</div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <span style={{ fontSize:13,fontWeight:700,color:d.settled?t.textMuted:"#f87171" }}>{money(d.amount)}</span>
                        <button onClick={()=>toggleDebt(d.id,d.settled)} style={{ fontSize:9.5,padding:"2px 8px",borderRadius:99,background:d.settled?"rgba(52,211,153,.15)":t.input,color:d.settled?"#34d399":t.textMuted,border:`1px solid ${d.settled?"#34d39940":t.border}`,fontWeight:600,lineHeight:1.6 }}>{d.settled?"✓ saldado":"saldar"}</button>
                      </div>
                    </div>
                  </div>
                ); })}
              </div>
            </div>
          </div>
        )}

        {/* ══ ACADÉMICO ══ */}
        {tab==="academico"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={3}/>;
          const getCourseTab = (cid) => acadTab[cid] || "evals";
          const setCourseTab = (cid, tid) => setAcadTab(prev=>({...prev,[cid]:tid}));

          return (
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><h1 style={h1Style}>Académico</h1><HelpTip id="academico" t={t} accent={user.accent}/></div>
                <p style={subStyle}>{myCourses.filter(c=>c.uid===user.id).length} cursos · Promedio ponderado: <span style={{color:user.accent,fontWeight:700}}>{calcAvg(myCourses)||"—"}</span></p>
              </div>
              <button className="btn" onClick={()=>{setCourseForm(!courseForm);setEditCourse(null);setNewCourse({name:"",credits:3,color:"#3b82f6",round_final:false,visibility:"private"});}} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><Plus size={13}/> Nuevo curso</button>
            </div>

            {courseForm&&(
              <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:20 }}>
                <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.5,marginBottom:12 }}>{editCourse?"EDITAR CURSO":"NUEVO CURSO"}</div>
                <div style={{ display:"flex",gap:9,alignItems:"center",flexWrap:"wrap" }}>
                  <input value={newCourse.name} onChange={e=>setNewCourse({...newCourse,name:e.target.value})} placeholder="Nombre del curso" style={{ flex:1,minWidth:180,...inputStyle }}/>
                  <input type="number" value={newCourse.credits} onChange={e=>setNewCourse({...newCourse,credits:e.target.value})} placeholder="Créditos" style={{ width:90,...inputStyle }}/>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:11,color:t.textMuted }}>Color:</span>
                    <input type="color" value={newCourse.color} onChange={e=>setNewCourse({...newCourse,color:e.target.value})} style={{ width:36,height:32,border:`1px solid ${t.inputBdr}`,borderRadius:8,background:t.input,cursor:"pointer",padding:2 }}/>
                  </div>
                  <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.textMuted,cursor:"pointer" }}>
                    <input type="checkbox" checked={!!newCourse.round_final} onChange={e=>setNewCourse({...newCourse,round_final:e.target.checked})}/> Redondear nota final
                  </label>
                  <VisibilityPicker value={newCourse.visibility||"private"} onChange={v=>setNewCourse({...newCourse,visibility:v,shared:v!=="private"})} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={users.filter(u=>u.id!==user.id)}/>
                  <button className="btn" onClick={saveCourse} style={{ background:user.accent,color:"#07070f",border:"none",padding:"9px 17px",borderRadius:9,fontSize:12,fontWeight:700 }}>{editCourse?"Actualizar":"Guardar"}</button>
                  <button onClick={()=>{setCourseForm(false);setEditCourse(null);}} style={{ background:"none",border:"none",color:t.textMuted,padding:5 }}><X size={15}/></button>
                </div>
              </div>
            )}

            {myCourses.length===0&&<p style={{ color:t.textFaint,fontSize:13,padding:"20px 0" }}>Sin cursos aún. ¡Agrega el primero! 🎓</p>}

            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {myCourses.map((c,ci)=>{
                const isOpen = activeCourse===c.id;
                const isOwn = c.uid===user.id;
                const courseAuthor = authorOf(c);
                const avg = computeCourseAvg(c.id);
                const avgNum = avg?Number(avg):null;
                const avgColor = avgNum===null?"#64748b":avgNum>=14?"#34d399":avgNum>=11?"#fb923c":"#f87171";
                const ctab = getCourseTab(c.id);
                const nodes = courseEvalTree[c.id] || [];
                const leaves = nodes.filter(n=>n.type==="leaf");
                const scored = leaves.filter(n=>n.score!==null&&n.score!==undefined);
                const sharedNodeProps = { computeNode, updateEvalNode, deleteEvalNode, saveEvalNode, evalEditNode, setEvalEditNode, evalAddParent, setEvalAddParent, autoVar, inputStyle, t };

                return (
                  <div key={c.id} className="pop-in" style={{ background:t.bgCard,border:`1px solid ${isOpen?c.color+"60":t.border}`,borderTop:`3px solid ${c.color}`,borderRadius:18,animationDelay:`${ci*50}ms`,transition:"border-color .2s",overflow:"hidden" }}>
                    {/* Header */}
                    <div style={{ padding:"15px 20px",display:"flex",alignItems:"center",gap:12,cursor:"pointer" }} onClick={()=>{const nxt=isOpen?null:c.id;setActiveCourse(nxt);if(nxt)loadEvalTree(nxt);}}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:2,flexWrap:"wrap" }}>
                          <span style={{ fontSize:14,color:t.text,fontWeight:700 }}>{c.name}</span>
                          {!isOwn&&<SharedByBadge author={courseAuthor} t={t}/>}
                          {isOwn&&c.shared&&<Badge color="#818cf8" sm>compartido</Badge>}
                          {c.round_final&&<span style={{ fontSize:9,color:"#818cf8",background:"rgba(129,140,248,.1)",borderRadius:5,padding:"1px 6px" }}>⌈⌉ final</span>}
                        </div>
                        <div style={{ fontSize:10.5,color:t.textMuted,display:"flex",gap:8 }}>
                          <span>{c.credits} créditos</span>
                          {leaves.length>0&&<span>{scored.length}/{leaves.length} notas</span>}
                        </div>
                      </div>
                      <div style={{ background:avgColor+"18",border:`1px solid ${avgColor}40`,borderRadius:10,padding:"6px 14px",textAlign:"center",flexShrink:0 }}>
                        <div style={{ fontSize:8.5,color:avgColor,fontWeight:700,letterSpacing:.5 }}>PROM</div>
                        <div style={{ fontSize:22,fontWeight:800,color:avgColor,lineHeight:1.1 }}>{avg||"—"}</div>
                        {avg&&<div style={{ fontSize:9,color:Number(avg)>=10.5?"#34d399":"#f87171",marginTop:1 }}>{Number(avg)>=10.5?"✅":"❌"}</div>}
                      </div>
                      {isOwn&&<div style={{ display:"flex",gap:3,flexShrink:0 }}>
                        <button onClick={e=>{e.stopPropagation();setEditCourse(c.id);setNewCourse({name:c.name,credits:c.credits,color:c.color,round_final:!!c.round_final,shared:!!c.shared});setCourseForm(true);}} style={{ background:"none",border:"none",color:t.textFaint,padding:4,display:"flex",borderRadius:7 }}><Pencil size={11}/></button>
                        <button onClick={e=>{e.stopPropagation();deleteCourse(c.id);}} style={{ background:"none",border:"none",color:"#f87171",padding:4,display:"flex",opacity:.6,borderRadius:7 }}><Trash2 size={11}/></button>
                      </div>}
                      <ChevronRight size={14} color={t.textFaint} style={{ transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0 }}/>
                    </div>

                    {isOpen&&(
                      <div className="slide-down" style={{ borderTop:`1px solid ${t.borderSub}`,padding:"16px 20px" }}>
                        {/* Materials tab still accessible as a small link */}
                        <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:12 }}>
                          <button onClick={()=>setCourseTab(c.id, getCourseTab(c.id)==="materiales"?"evals":"materiales")}
                            style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:8,padding:"4px 12px",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                            <FileText size={10}/> {getCourseTab(c.id)==="materiales"?"← Evaluaciones":"📁 Materiales"}
                          </button>
                        </div>

                        {getCourseTab(c.id) === "materiales" ? (
                          <div>
                            {(c.course_materials||[]).map(m=>(
                              <div key={m.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:t.input,borderRadius:9,marginBottom:5 }}>
                                <FileText size={11} color={t.textMuted}/>
                                <a href={m.url} target="_blank" rel="noreferrer" style={{ flex:1,fontSize:12,color:t.textSub,textDecoration:"none" }}>{m.name}</a>
                                <Link size={9} color={t.textFaint}/>
                                {isOwn&&<button onClick={()=>deleteMaterial(c.id,m.id)} style={{ background:"none",border:"none",color:t.textFaint,padding:2,display:"flex",opacity:.5 }}><X size={10}/></button>}
                              </div>
                            ))}
                            {isOwn&&(matForm===c.id?(
                              <div style={{ display:"flex",gap:7,marginTop:8,flexWrap:"wrap" }}>
                                <input value={newMat.name} onChange={e=>setNewMat({...newMat,name:e.target.value})} placeholder="Nombre" style={{ flex:1,minWidth:100,...inputStyle,padding:"6px 10px",fontSize:11 }}/>
                                <input value={newMat.url} onChange={e=>setNewMat({...newMat,url:e.target.value})} placeholder="https://..." style={{ flex:2,minWidth:140,...inputStyle,padding:"6px 10px",fontSize:11 }}/>
                                <button className="btn" onClick={()=>saveMaterial(c.id)} style={{ background:c.color,color:"#07070f",border:"none",padding:"6px 14px",borderRadius:8,fontSize:11,fontWeight:700 }}>+</button>
                                <button onClick={()=>setMatForm(null)} style={{ background:"none",border:"none",color:t.textMuted,padding:2 }}><X size={12}/></button>
                              </div>
                            ):(
                              <button onClick={()=>setMatForm(c.id)} style={{ background:"none",border:`1px dashed ${t.border}`,color:t.textFaint,borderRadius:9,padding:"7px 14px",fontSize:11,width:"100%",marginTop:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}><Plus size={10}/> Agregar material</button>
                            ))}
                          </div>
                        ) : (
                          <AcademicSheet
                            course={c}
                            nodes={nodes}
                            computeNode={computeNode}
                            updateEvalNode={updateEvalNode}
                            deleteEvalNode={deleteEvalNode}
                            saveEvalNode={saveEvalNode}
                            inputStyle={inputStyle}
                            t={t}
                            isOwn={isOwn}
                            onFormulaChange={(text) => saveFormulaText(c.id, text)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          );
        })()}


        {/* ══ FOCUS / POMODORO ══ */}
        {tab==="focus"&&(()=>{
          const MODES = {
            work:      { label:"Trabajo",         color:user.accent, secs:25*60   },
            break:     { label:"Descanso",         color:"#34d399",   secs:5*60    },
            longbreak: { label:"Descanso largo",   color:"#818cf8",   secs:15*60   },
            custom:    { label:"Personalizado",    color:"#f59e0b",   secs:focusCustomMins*60 },
          };
          const mode = MODES[focusMode];
          const r=80, circ=2*Math.PI*r;
          const dashOffset = circ*(1-focusPct/100);
          return (
          <div className="fu">
            <div style={{ marginBottom:24 }}><div style={{ display:"flex",alignItems:"center",gap:8 }}><h1 style={h1Style}>Modo Focus</h1><HelpTip id="focus" t={t} accent={user.accent}/></div><p style={subStyle}>Pomodoro · concentración profunda</p></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:20 }} className="two-col">
              <div style={{ ...cardStyle(),display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 28px" }}>
                <div style={{ display:"flex",gap:8,marginBottom:28,flexWrap:"wrap",justifyContent:"center" }}>
                  {Object.entries(MODES).map(([k,v])=>(
                    <button key={k} onClick={()=>{setFocusMode(k);setFocusRunning(false);setFocusSecs(k==="custom"?focusCustomMins*60:v.secs);}} style={{ background:focusMode===k?v.color+"22":"none",border:`1px solid ${focusMode===k?v.color+"60":t.border}`,color:focusMode===k?v.color:t.textMuted,borderRadius:99,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer" }}>{v.label}</button>
                  ))}
                </div>
                {focusMode==="custom"&&(
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,justifyContent:"center" }}>
                    <span style={{ fontSize:12,color:t.textMuted }}>Duración:</span>
                    <input type="number" value={focusCustomMins} min="1" max="180"
                      onChange={e=>{const v=Math.max(1,Number(e.target.value));setFocusCustomMins(v);if(!focusRunning)setFocusSecs(v*60);}}
                      style={{ width:70,...inputStyle,textAlign:"center",fontWeight:700 }}/>
                    <span style={{ fontSize:12,color:t.textMuted }}>minutos</span>
                  </div>
                )}
                <div style={{ position:"relative",marginBottom:24 }}>
                  <svg width={200} height={200} style={{ transform:"rotate(-90deg)" }}>
                    <circle cx={100} cy={100} r={r} fill="none" stroke={t.border} strokeWidth={8}/>
                    <circle cx={100} cy={100} r={r} fill="none" stroke={mode.color} strokeWidth={8} strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={dashOffset} style={{ transition:"stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)" }}/>
                  </svg>
                  <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ fontFamily:"'Outfit',monospace",fontSize:42,fontWeight:800,color:mode.color,letterSpacing:-2 }}>{fmtTime(focusSecs)}</div>
                    <div style={{ fontSize:11,color:t.textMuted,marginTop:2 }}>{mode.label}</div>
                  </div>
                </div>
                <input value={focusTask} onChange={e=>setFocusTask(e.target.value)} placeholder="¿En qué estás trabajando?" style={{ ...inputStyle,width:"100%",marginBottom:16,textAlign:"center",fontSize:13 }}/>
                <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                  <button onClick={focusReset} style={{ background:t.input,border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:10,padding:"9px 14px",cursor:"pointer",display:"flex",alignItems:"center" }}><RotateCcw size={14}/></button>
                  <button onClick={()=>setFocusRunning(v=>!v)} style={{ background:mode.color,color:"#07070f",border:"none",borderRadius:14,padding:"12px 32px",fontSize:15,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:8,minWidth:130,justifyContent:"center" }}>
                    {focusRunning?<><Pause size={16}/>Pausar</>:<><Play size={16}/>Iniciar</>}
                  </button>
                  <button onClick={focusSkip} style={{ background:t.input,border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:10,padding:"9px 14px",cursor:"pointer",display:"flex",alignItems:"center" }}><SkipForward size={14}/></button>
                </div>
                <div style={{ fontSize:11,color:t.textMuted,marginTop:16 }}>Ronda #{focusRound+1} · {focusRound} completadas</div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                <div style={cardStyle()}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}><Target size={13} color={user.accent}/><span style={secLabel}>TAREAS PENDIENTES</span></div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:280,overflowY:"auto" }}>
                    {pend.slice(0,8).map(tx=>(
                      <div key={tx.id} onClick={()=>setFocusTask(tx.title)} className="tr" style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:10,cursor:"pointer" }}>
                        <div style={{ width:8,height:8,borderRadius:"50%",flexShrink:0,background:tx.priority==="alta"?"#f87171":tx.priority==="media"?"#fb923c":"#64748b" }}/>
                        <span style={{ flex:1,fontSize:12.5,color:t.text }}>{tx.title}</span>
                        {tx.deadline&&<span style={{ fontSize:9.5,color:t.textFaint }}>{tx.deadline.slice(5)}</span>}
                      </div>
                    ))}
                    {pend.length===0&&<p style={{ color:t.textGhost,fontSize:13 }}>Todo completado 🎉</p>}
                  </div>
                </div>
                <div style={{ ...cardStyle(),background:`linear-gradient(135deg,${user.accent}0a,transparent)`,border:`1px solid ${user.accent}20` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}><Zap size={13} color={user.accent}/><span style={secLabel}>TIPS POMODORO</span></div>
                  {["25 min de trabajo, 5 min de descanso","Silencia el teléfono durante el bloque","Después de 4 rondas, tómate 15-20 min","Anota distracciones en lugar de seguirlas"].map((tip,i)=>(
                    <div key={i} style={{ display:"flex",gap:8,marginBottom:7,fontSize:12,color:t.textMuted }}>
                      <span style={{ color:user.accent,fontWeight:700 }}>{i+1}.</span>{tip}
                    </div>
                  ))}
                </div>
                {/* ── Lo-Fi Music ── */}
                {(()=>{
                  const STATIONS = [
                    { id:"lofi-girl",    label:"Lo-Fi Girl",     yt:"jfKfPfyJRdk", emoji:"☕", genre:"Lo-Fi" },
                    { id:"jazz",         label:"Jazz Café",       yt:"neV3EPgvZ3g", emoji:"🎷", genre:"Jazz" },
                    { id:"synthwave",    label:"Synthwave",       yt:"4xDzrJKXOOY", emoji:"🌆", genre:"Electronic" },
                    { id:"dark-ambience",label:"Dark Ambience",   yt:"S_MOd40zlYU", emoji:"🌑", genre:"Ambient" },
                    { id:"nature",       label:"Rain & Naturaleza",yt:"nDq6TstdEi8", emoji:"🌧️", genre:"Naturaleza" },
                    { id:"classical",    label:"Música Clásica",  yt:"DWcJFNfaw9c", emoji:"🎻", genre:"Clásica" },
                    { id:"piano",        label:"Piano Relajante", yt:"UfcAVejslrU", emoji:"🎹", genre:"Clásica" },
                    { id:"deepfocus",    label:"Deep Focus",      yt:"sMbzL-zHgP4", emoji:"🧠", genre:"Ambient" },
                    { id:"chillhop",     label:"Chillhop",        yt:"7NOSDKb0HlU", emoji:"🐻", genre:"Lo-Fi" },
                    { id:"orchestra",    label:"Orquesta Épica",  yt:"W4jGPbI_Az4", emoji:"🎼", genre:"Clásica" },
                  ];
                  const active = STATIONS.find(s=>s.id===focusStation);
                  return (
                  <div style={{ ...cardStyle(),border:`1px solid ${t.border}` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
                      <span style={{ fontSize:13 }}>🎵</span>
                      <span style={secLabel}>MÚSICA LO-FI</span>
                      {active&&<span style={{ marginLeft:"auto",fontSize:9,color:"#34d399",display:"flex",alignItems:"center",gap:4 }}><span style={{ width:5,height:5,borderRadius:"50%",background:"#34d399",display:"inline-block" }}/> Sonando</span>}
                    </div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:active?12:0 }}>
                      {STATIONS.map(s=>(
                        <button key={s.id} onClick={()=>setFocusStation(focusStation===s.id?null:s.id)}
                          style={{ background:focusStation===s.id?user.accent+"22":"none",border:`1px solid ${focusStation===s.id?user.accent+"60":t.border}`,color:focusStation===s.id?user.accent:t.textMuted,borderRadius:99,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}
                          title={s.genre}>
                          {s.emoji} {s.label}
                        </button>
                      ))}
                    </div>
                    {active&&(
                      <>
                        <div style={{ display:"flex",alignItems:"center",gap:8,background:t.input,borderRadius:10,padding:"8px 12px" }}>
                          <span style={{ fontSize:16 }}>{active.emoji}</span>
                          <div>
                            <div style={{ fontSize:12,fontWeight:600,color:t.text }}>{active.label}</div>
                            <div style={{ fontSize:10,color:t.textFaint }}>Lo-Fi · Reproducción continua</div>
                          </div>
                          <button onClick={()=>setFocusStation(null)} style={{ marginLeft:"auto",background:"none",border:"none",color:t.textFaint,cursor:"pointer",display:"flex" }}><X size={13}/></button>
                        </div>
                        <iframe key={active.yt} width="1" height="1" style={{ position:"absolute",opacity:0,pointerEvents:"none" }}
                          src={"https://www.youtube-nocookie.com/embed/"+active.yt+"?autoplay=1&loop=1&playlist="+active.yt+"&controls=0"}
                          allow="autoplay" title={active.label}/>
                      </>
                    )}
                  </div>
                  );
                })()}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ══ METAS Y RETOS ══ */}
        {tab==="metas"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={3}/>;
          const myGoals       = goals.filter(g => g.uid===user.id);
          const sharedGoals   = goals.filter(g => g.shared && isVisibleToMe(g));
          const otherUser     = users.find(u=>u.id!==user.id);
          const activeCh      = challenges.filter(c=>c.status==="active");
          const pendingCh     = challenges.filter(c=>c.status==="pending");
          const completedCh   = challenges.filter(c=>c.status==="completed").slice(0,5);
          const allCh         = [...activeCh,...pendingCh,...completedCh];


          return (
          <div className="fu">
            {/* ── Header ── */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><h1 style={h1Style}>Metas y retos</h1><HelpTip id="metas" t={t} accent={user.accent}/></div>
                <p style={subStyle}>{weekRange.start} → {weekRange.end}</p>
              </div>
              {metasSubTab==="metas"
                ? <button onClick={()=>setGoalForm(v=>!v)} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}><Plus size={13}/> Nueva meta</button>
                : <button onClick={()=>setChallengeForm(v=>!v)} style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}><Plus size={13}/> Nuevo reto</button>
              }
            </div>

            {/* ── Internal tab selector ── */}
            <div style={{ display:"flex",gap:2,background:t.input,borderRadius:11,padding:3,marginBottom:20,width:"fit-content" }}>
              {[["metas","🎯 Metas semanales"],["retos","⚔️ Retos"]].map(([id,label])=>(
                <button key={id} onClick={()=>setMetasSubTab(id)}
                  style={{ background:metasSubTab===id?t.bgCard:"none",border:metasSubTab===id?`1px solid ${t.border}`:"1px solid transparent",color:metasSubTab===id?t.text:t.textMuted,borderRadius:9,padding:"6px 18px",fontSize:12,fontWeight:metasSubTab===id?700:400,cursor:"pointer",transition:"all .15s" }}>
                  {label}
                  {id==="retos"&&allCh.filter(ch=>ch.status==="pending"&&ch.challenged_uid===user.id).length>0&&(
                    <span style={{ background:"#f87171",color:"#fff",borderRadius:99,fontSize:9,fontWeight:800,padding:"1px 5px",marginLeft:5 }}>
                      {allCh.filter(ch=>ch.status==="pending"&&ch.challenged_uid===user.id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ════════ METAS ════════ */}
            {metasSubTab==="metas"&&(<>

              {goalForm&&(
                <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:20 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:t.textSub,marginBottom:12 }}>NUEVA META SEMANAL</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    <input value={newGoal.title} onChange={e=>setNewGoal({...newGoal,title:e.target.value})}
                      placeholder="Nombre de la meta (ej: Completar 10 tareas)" style={{ ...inputStyle,width:"100%" }}/>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                      <select value={newGoal.type} onChange={e=>setNewGoal({...newGoal,type:e.target.value})} style={{ ...inputStyle,flex:1 }}>
                        {Object.entries(GOAL_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                      </select>
                      <div style={{ display:"flex",alignItems:"center",gap:6,flex:1 }}>
                        <span style={{ fontSize:11,color:t.textMuted,whiteSpace:"nowrap" }}>Meta:</span>
                        <input type="number" min="1" value={newGoal.target} onChange={e=>setNewGoal({...newGoal,target:e.target.value})} style={{ ...inputStyle,width:80 }}/>
                        <span style={{ fontSize:11,color:t.textMuted }}>{GOAL_TYPES[newGoal.type]?.unit}</span>
                      </div>
                      <VisibilityPicker value={newGoal.visibility||"private"} onChange={v=>setNewGoal({...newGoal,visibility:v,shared:v!=="private"})} t={t} coupleEnabled={coupleEnabled} couplePartnerName={partner?.name} people={users.filter(u=>u.id!==user.id)}/>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={saveGoal} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"9px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Guardar</button>
                      <button onClick={()=>setGoalForm(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 14px",borderRadius:9,fontSize:12,cursor:"pointer" }}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12 }}>MIS METAS</div>
                {myGoals.length===0
                  ? <p style={{ color:t.textFaint,fontSize:13 }}>Sin metas esta semana. ¡Agrega una!</p>
                  : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      {myGoals.map(g=>{
                        const progress=computeGoalProgress(g); const pct=g.target>0?Math.min(100,Math.round((progress/g.target)*100)):0;
                        const gt=GOAL_TYPES[g.type]||GOAL_TYPES.tasks; const done=pct>=100;
                        return (
                          <div key={g.id} style={{ background:t.bgCard,border:`1px solid ${done?gt.color+"50":t.border}`,borderRadius:16,padding:"16px 18px",position:"relative",overflow:"hidden" }}>
                            {done&&<div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${gt.color},${gt.color}88)` }}/>}
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                                <span style={{ fontSize:18 }}>{gt.icon}</span>
                                <div>
                                  <div style={{ fontSize:13,fontWeight:600,color:t.text }}>{g.title}</div>
                                  <div style={{ fontSize:10,color:t.textMuted,marginTop:1 }}>{gt.label}</div>
                                </div>
                              </div>
                              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                                {g.shared&&<Share2 size={9} color={t.textFaint}/>}
                                <button onClick={()=>deleteGoal(g.id)} style={{ background:"none",border:"none",color:t.textFaint,padding:2,cursor:"pointer",opacity:.5 }}><Trash2 size={11}/></button>
                              </div>
                            </div>
                            <div style={{ height:6,background:t.border,borderRadius:99,overflow:"hidden",marginBottom:6 }}>
                              <div style={{ height:"100%",width:`${pct}%`,background:done?gt.color:`${gt.color}99`,borderRadius:99,transition:"width .5s cubic-bezier(.4,0,.2,1)" }}/>
                            </div>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                              <span style={{ fontSize:11,color:done?gt.color:t.textMuted,fontWeight:done?700:400 }}>{done?"✅ ¡Meta cumplida!":`${progress} / ${g.target} ${gt.unit}`}</span>
                              <span style={{ fontSize:13,fontWeight:800,color:done?gt.color:t.textSub }}>{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
              </div>

              {sharedGoals.length>0&&(
                <div>
                  <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12 }}>METAS COMPARTIDAS</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    {sharedGoals.map(g=>{
                      const progress=computeGoalProgress(g); const pct=g.target>0?Math.min(100,Math.round((progress/g.target)*100)):0;
                      const gt=GOAL_TYPES[g.type]||GOAL_TYPES.tasks; const done=pct>=100;
                      const author=users.find(u=>u.id===g.uid);
                      return (
                        <div key={g.id} style={{ background:t.bgCard,border:`1px solid ${done?gt.color+"50":t.border}`,borderRadius:16,padding:"16px 18px",position:"relative",overflow:"hidden" }}>
                          {done&&<div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${gt.color},${gt.color}88)` }}/>}
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                              <span style={{ fontSize:18 }}>{gt.icon}</span>
                              <div>
                                <div style={{ fontSize:13,fontWeight:600,color:t.text }}>{g.title}</div>
                                <div style={{ fontSize:10,color:t.textMuted,marginTop:1 }}>{gt.label}</div>
                              </div>
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                              {author&&<div style={{ fontSize:9,color:author.accent,background:author.accent+"18",border:`1px solid ${author.accent}30`,borderRadius:99,padding:"2px 8px",fontWeight:700 }}>{author.name}</div>}
                              <Share2 size={9} color={t.textFaint}/>
                            </div>
                          </div>
                          <div style={{ height:6,background:t.border,borderRadius:99,overflow:"hidden",marginBottom:6 }}>
                            <div style={{ height:"100%",width:`${pct}%`,background:done?gt.color:`${gt.color}99`,borderRadius:99,transition:"width .5s" }}/>
                          </div>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                            <span style={{ fontSize:11,color:done?gt.color:t.textMuted,fontWeight:done?700:400 }}>{done?"✅ ¡Meta cumplida!":`${progress} / ${g.target} ${gt.unit}`}</span>
                            <span style={{ fontSize:13,fontWeight:800,color:done?gt.color:t.textSub }}>{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>)}

            {/* ════════ RETOS ════════ */}
            {metasSubTab==="retos"&&(()=>{
              return (
              <div>
                {challengeForm&&(
                  <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:16 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:t.textSub,marginBottom:12 }}>NUEVO RETO PARA {otherUser?.name?.toUpperCase()}</div>
                    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      <input value={newChallenge.title} onChange={e=>setNewChallenge({...newChallenge,title:e.target.value})}
                        placeholder={`Reto a ${otherUser?.name||"tu amigo"} (ej: Quién completa más tareas esta semana)`}
                        style={{ ...inputStyle,width:"100%" }}/>
                      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                        <select value={newChallenge.type} onChange={e=>setNewChallenge({...newChallenge,type:e.target.value})} style={{ ...inputStyle,flex:1 }}>
                          {Object.entries(CHALLENGE_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                        </select>
                        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <span style={{ fontSize:11,color:t.textMuted,whiteSpace:"nowrap" }}>Meta:</span>
                          <input type="number" min="1" value={newChallenge.target} onChange={e=>setNewChallenge({...newChallenge,target:e.target.value})} style={{ ...inputStyle,width:72 }}/>
                          <span style={{ fontSize:11,color:t.textMuted }}>{CHALLENGE_TYPES[newChallenge.type]?.unit}</span>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <span style={{ fontSize:11,color:t.textMuted,whiteSpace:"nowrap" }}>Días:</span>
                          <input type="number" min="1" max="30" value={newChallenge.days} onChange={e=>setNewChallenge({...newChallenge,days:e.target.value})} style={{ ...inputStyle,width:60 }}/>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <span style={{ fontSize:11,color:"#f59e0b",whiteSpace:"nowrap" }}>⚡ XP:</span>
                          <input type="number" min="10" step="10" value={newChallenge.xp_reward} onChange={e=>setNewChallenge({...newChallenge,xp_reward:e.target.value})} style={{ ...inputStyle,width:70 }}/>
                        </div>
                      </div>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={createChallenge} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"9px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>⚔️ Lanzar reto</button>
                        <button onClick={()=>setChallengeForm(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 14px",borderRadius:9,fontSize:12,cursor:"pointer" }}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                )}

                {allCh.filter(ch=>ch.status!=="completed").length===0&&completedCh.length===0
                  ? <p style={{ color:t.textFaint,fontSize:13,padding:"20px 0" }}>Sin retos activos.{otherUser?` ¡Reta a ${otherUser.name}!`:""}</p>
                  : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      {[...activeCh,...pendingCh].map(ch=>{
                        const ct=CHALLENGE_TYPES[ch.type]||CHALLENGE_TYPES.tasks;
                        const isChallenger=ch.challenger_uid===user.id;
                        const opponent=users.find(u=>u.id===(isChallenger?ch.challenged_uid:ch.challenger_uid));
                        const myProgress=computeChallengeProgress({...ch,challenger_uid:user.id});
                        const theirProgress=computeChallengeProgress({...ch,challenger_uid:opponent?.id});
                        const daysLeft=Math.max(0,Math.ceil((new Date(ch.ends_at+"T23:59")-new Date())/(1000*60*60*24)));
                        const myPct=ch.target>0?Math.min(100,Math.round((myProgress/ch.target)*100)):0;
                        const theirPct=ch.target>0?Math.min(100,Math.round((theirProgress/ch.target)*100)):0;
                        return (
                          <div key={ch.id} style={{ background:t.bgCard,border:`1px solid ${ct.color+"30"}`,borderTop:`3px solid ${ct.color}`,borderRadius:16,padding:"16px 18px" }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                              <div>
                                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                                  <span style={{ fontSize:16 }}>{ct.icon}</span>
                                  <span style={{ fontSize:13,fontWeight:700,color:t.text }}>{ch.title}</span>
                                  <span style={{ fontSize:9,background:ch.status==="active"?ct.color+"20":"rgba(248,113,113,.15)",color:ch.status==="active"?ct.color:"#f87171",border:`1px solid ${ch.status==="active"?ct.color+"40":"rgba(248,113,113,.3)"}`,borderRadius:99,padding:"2px 8px",fontWeight:700 }}>
                                    {ch.status==="active"?"ACTIVO":"PENDIENTE"}
                                  </span>
                                </div>
                                <div style={{ fontSize:11,color:t.textMuted }}>{ct.label} · meta: {ch.target} {ct.unit}</div>
                              </div>
                              <div style={{ textAlign:"right",flexShrink:0 }}>
                                <div style={{ fontSize:12,fontWeight:700,color:"#f59e0b" }}>+{ch.xp_reward} XP</div>
                                {ch.status==="active"&&<div style={{ fontSize:10,color:t.textFaint }}>{daysLeft}d restantes</div>}
                              </div>
                            </div>
                            {ch.status==="active"&&(
                              <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:12 }}>
                                {[{u:user,p:myProgress,pct:myPct},{u:opponent,p:theirProgress,pct:theirPct}].map(({u:u2,p,pct})=>u2&&(
                                  <div key={u2.id}>
                                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                                      <span style={{ fontSize:11,color:u2.id===user.id?t.text:t.textMuted,fontWeight:u2.id===user.id?700:400 }}>{u2.name}</span>
                                      <span style={{ fontSize:11,fontWeight:700,color:pct>=100?ct.color:u2.accent }}>{p} / {ch.target} {ct.unit}</span>
                                    </div>
                                    <div style={{ height:5,background:t.border,borderRadius:99,overflow:"hidden" }}>
                                      <div style={{ height:"100%",width:`${pct}%`,background:pct>=100?ct.color:u2.accent,borderRadius:99,transition:"width .5s" }}/>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                              {ch.status==="pending"&&ch.challenged_uid===user.id&&(
                                <button onClick={()=>acceptChallenge(ch)} style={{ background:ct.color,color:"#07070f",border:"none",padding:"7px 16px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer" }}>🤝 Aceptar reto</button>
                              )}
                              {ch.status==="active"&&(myProgress>=ch.target||theirProgress>=ch.target)&&(
                                <button onClick={()=>resolveChallenge(ch,myProgress>=ch.target?user.id:opponent?.id)} style={{ background:"#f59e0b",color:"#07070f",border:"none",padding:"7px 16px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer" }}>🏁 Cerrar reto</button>
                              )}
                              {(ch.status==="pending"||ch.status==="active")&&ch.challenger_uid===user.id&&(
                                <button onClick={()=>cancelChallenge(ch.id)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textFaint,padding:"7px 14px",borderRadius:9,fontSize:11,cursor:"pointer" }}>Cancelar</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>}

                {completedCh.length>0&&(
                  <div style={{ marginTop:20 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:10 }}>HISTORIAL</div>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {completedCh.map(ch=>{
                        const ct=CHALLENGE_TYPES[ch.type]||CHALLENGE_TYPES.tasks;
                        const winner=ch.winner_uid?users.find(u=>u.id===ch.winner_uid):null;
                        return (
                          <div key={ch.id} style={{ background:t.bgCard,border:`1px solid rgba(245,158,11,.3)`,borderTop:`3px solid #f59e0b`,borderRadius:14,padding:"12px 16px" }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                                <span style={{ fontSize:14 }}>{ct.icon}</span>
                                <span style={{ fontSize:12,fontWeight:700,color:t.text }}>{ch.title}</span>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                {winner&&<div style={{ fontSize:11,color:"#f59e0b",fontWeight:700 }}>🥇 {winner.name}</div>}
                                <div style={{ fontSize:10,color:t.textFaint }}>+{ch.xp_reward} XP</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

          </div>
          );
        })()}

        {/* ══ SOCIAL ══ */}
        {tab==="social"&&(()=>{
          if (loading) return <SkeletonTab t={t} count={3}/>;

          const activeGroup = groups.find(g => g.id === activeGroupId);
          const myGroupMemberships = groupMembers.filter(m => m.uid === user.id);
          const friends = users.filter(u => u.id !== user.id); // connected profiles

          const EMOJIS = ["👥","🔥","⚡","🎯","🏆","📚","💪","🎉","🌟","🚀","🤝","🧠","📖","🎓","💬","❤️","🌈","☕"];

          // ── Group streak card ──────────────────────────────────────────────
          const GroupStreakCard = ({ g }) => {
            const members   = groupMembers.filter(m => m.group_id === g.id);
            const streak    = computeGroupStreak(g.id);
            const todayCheckIns = groupStreakDays.filter(r => r.group_id === g.id && r.date === liveToday);
            const iCheckedIn = todayCheckIns.some(r => r.uid === user.id);
            const allIn      = members.length > 0 && todayCheckIns.length >= members.length;

            return (
              <div style={{ background:t.bgCard,border:`1px solid ${allIn?"#f59e0b40":t.border}`,borderRadius:14,padding:"14px 16px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:20 }}>{g.avatar_emoji||"👥"}</span>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:t.text }}>{g.name}</div>
                      <div style={{ fontSize:10,color:t.textMuted }}>{members.length} miembros</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22,fontWeight:900,color:streak>0?"#f59e0b":t.textFaint }}>🔥 {streak}</div>
                    <div style={{ fontSize:9,color:t.textFaint,fontWeight:600 }}>días seguidos</div>
                  </div>
                </div>

                {/* Member check-in status */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:10 }}>
                  {members.map(m => {
                    const profile = m.profile || users.find(u => u.id === m.uid);
                    const checked = todayCheckIns.some(r => r.uid === m.uid);
                    return (
                      <div key={m.uid} style={{ display:"flex",alignItems:"center",gap:4,background:checked?"#34d39918":t.input,border:`1px solid ${checked?"#34d39940":t.border}`,borderRadius:99,padding:"3px 8px" }}>
                        <div style={{ width:6,height:6,borderRadius:"50%",background:checked?"#34d399":"#475569",flexShrink:0 }}/>
                        <span style={{ fontSize:10,color:checked?"#34d399":t.textMuted,fontWeight:600 }}>{profile?.name?.split(" ")[0]||"?"}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Check-in button */}
                {!iCheckedIn ? (
                  <button onClick={()=>checkInGroupStreak(g.id)}
                    style={{ width:"100%",background:`linear-gradient(135deg,#f59e0b,#f59e0bcc)`,color:"#07070f",border:"none",borderRadius:9,padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                    ✅ Marcar mi día de hoy
                  </button>
                ) : (
                  <div style={{ textAlign:"center",fontSize:12,color:"#34d399",fontWeight:600,padding:"6px 0" }}>
                    {allIn ? "🏆 ¡Todo el grupo completó hoy!" : "✅ Ya marcaste tu día — esperando al resto…"}
                  </div>
                )}
              </div>
            );
          };

          return (
          <div className="fu">
            {/* Header */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <h1 style={h1Style}>Social</h1>
                  <HelpTip id="feed" t={t} accent={user.accent}/>
                </div>
                <p style={subStyle}>Grupos, chat y rachas compartidas</p>
              </div>
              {socialSubTab==="grupos"&&(
                <button onClick={()=>setGroupForm(v=>!v)}
                  style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}>
                  <Plus size={13}/> Nuevo grupo
                </button>
              )}
            </div>

            {/* Pending invites banner */}
            {pendingInvites.length > 0 && (
              <div style={{ background:"rgba(129,140,248,.1)",border:"1px solid rgba(129,140,248,.3)",borderRadius:12,padding:"12px 16px",marginBottom:16 }}>
                <div style={{ fontSize:11,fontWeight:700,color:"#818cf8",marginBottom:8 }}>📬 INVITACIONES PENDIENTES</div>
                {pendingInvites.map(inv=>(
                  <div key={inv.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:`1px solid rgba(129,140,248,.15)` }}>
                    <div>
                      <span style={{ fontSize:13,color:t.text,fontWeight:600 }}>{inv.group?.avatar_emoji} {inv.group?.name}</span>
                      <span style={{ fontSize:11,color:t.textMuted }}> · invitado por {inv.inviter?.name||"alguien"}</span>
                    </div>
                    <div style={{ display:"flex",gap:7 }}>
                      <button onClick={()=>acceptInvite(inv.id, inv.group_id)}
                        style={{ background:"#818cf8",color:"#07070f",border:"none",padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>Unirme</button>
                      <button onClick={()=>declineInvite(inv.id)}
                        style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"5px 10px",borderRadius:7,fontSize:11,cursor:"pointer" }}>Ignorar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Modo pareja ── */}
            <div style={{ ...cardStyle(), marginBottom:20, border: coupleEnabled ? `1px solid #f472b640` : `1px solid ${t.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ fontSize:22 }}>❤️</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:t.text }}>Modo pareja</div>
                    <div style={{ fontSize:11,color:t.textMuted }}>
                      {coupleEnabled ? `Activado con ${partner?.name||"tu pareja"}` : "Desactivado — actívalo para compartir más"}
                    </div>
                  </div>
                </div>
                <button onClick={()=>saveCoupleMode({ enabled: !coupleMode.enabled })}
                  style={{ background:coupleEnabled?"#f472b620":t.input, border:`1px solid ${coupleEnabled?"#f472b650":t.border}`, color:coupleEnabled?"#f472b6":t.textMuted, borderRadius:99, padding:"6px 16px", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>
                  {coupleEnabled ? "Activado ✓" : "Activar"}
                </button>
              </div>

              {/* Partner selector + tab name — shown when toggled on */}
              {coupleMode.enabled && (
                <div className="slide-down" style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:10 }}>
                  {/* Partner picker */}
                  <div>
                    <div style={{ fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:7 }}>¿QUIÉN ES TU PAREJA?</div>
                    {users.filter(u=>u.id!==user.id).length === 0 ? (
                      <div style={{ fontSize:12,color:t.textFaint }}>No tienes amigos conectados todavía. Primero conecta con alguien en la sección de amigos.</div>
                    ) : (
                      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                        {users.filter(u=>u.id!==user.id).map(u=>(
                          <button key={u.id} onClick={()=>saveCoupleMode({ partnerId: u.id, since: coupleMode.since || liveToday })}
                            style={{ display:"flex",alignItems:"center",gap:7, background:coupleMode.partnerId===u.id?`#f472b618`:t.input, border:`1.5px solid ${coupleMode.partnerId===u.id?"#f472b660":t.border}`, borderRadius:10, padding:"7px 12px", cursor:"pointer", transition:"all .15s" }}>
                            {u.avatar
                              ? <img src={u.avatar} style={{ width:24,height:24,borderRadius:"50%",objectFit:"cover" }}/>
                              : <div style={{ width:24,height:24,borderRadius:"50%",background:u.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#07070f" }}>{u.initials}</div>}
                            <span style={{ fontSize:12,fontWeight:600,color:coupleMode.partnerId===u.id?"#f472b6":t.text }}>{u.name}</span>
                            {coupleMode.partnerId===u.id&&<span style={{ fontSize:12 }}>❤️</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tab name */}
                  <div>
                    <div style={{ fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:7 }}>NOMBRE DEL TAB</div>
                    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                      <input
                        defaultValue={coupleTabName}
                        onBlur={e=>saveCoupleMode({ tabName: e.target.value.trim() || "Nosotros" })}
                        placeholder="Nosotros"
                        style={{ ...inputStyle, width:160 }}/>
                      <span style={{ fontSize:11,color:t.textFaint }}>→ aparece en el menú</span>
                    </div>
                  </div>

                  {/* Since date */}
                  <div>
                    <div style={{ fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:7 }}>JUNTOS DESDE</div>
                    <input type="date" defaultValue={coupleMode.since||liveToday}
                      onBlur={e=>saveCoupleMode({ since: e.target.value })}
                      style={{ ...inputStyle, width:160 }}/>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-tab pills */}
            <div style={{ display:"flex",gap:2,background:t.input,borderRadius:11,padding:3,marginBottom:20,width:"fit-content" }}>
              {[["grupos","👥 Grupos"],["racha","🔥 Racha grupal"],["chat","💬 Chat"]].map(([id,label])=>(
                <button key={id} onClick={()=>setSocialSubTab(id)}
                  style={{ background:socialSubTab===id?t.bgCard:"none",border:socialSubTab===id?`1px solid ${t.border}`:"1px solid transparent",color:socialSubTab===id?t.text:t.textMuted,borderRadius:9,padding:"6px 16px",fontSize:12,fontWeight:socialSubTab===id?700:400,cursor:"pointer",transition:"all .15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ════ GRUPOS ════ */}
            {socialSubTab==="grupos"&&(<>

              {/* Create group form */}
              {groupForm&&(
                <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:20 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:t.textSub,marginBottom:12 }}>NUEVO GRUPO</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    {/* Emoji picker */}
                    <div>
                      <div style={{ fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:7 }}>EMOJI DEL GRUPO</div>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        {EMOJIS.map(e=>(
                          <button key={e} onClick={()=>setNewGroup(g=>({...g,avatar_emoji:e}))}
                            style={{ width:34,height:34,borderRadius:9,fontSize:16,background:newGroup.avatar_emoji===e?user.accent+"22":t.input,border:`1.5px solid ${newGroup.avatar_emoji===e?user.accent+"80":t.border}`,cursor:"pointer" }}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input value={newGroup.name} onChange={e=>setNewGroup(g=>({...g,name:e.target.value}))}
                      placeholder="Nombre del grupo (ej: Grupo de Estudio UP)" style={{ ...inputStyle,width:"100%" }}/>
                    <input value={newGroup.description} onChange={e=>setNewGroup(g=>({...g,description:e.target.value}))}
                      placeholder="Descripción (opcional)" style={{ ...inputStyle,width:"100%" }}/>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={createGroup} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"9px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Crear grupo</button>
                      <button onClick={()=>setGroupForm(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 14px",borderRadius:9,fontSize:12,cursor:"pointer" }}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              {groups.length === 0 ? (
                <div style={{ textAlign:"center",padding:"40px 0",color:t.textFaint }}>
                  <div style={{ fontSize:36,marginBottom:12 }}>👥</div>
                  <div style={{ fontSize:14,fontWeight:600,color:t.textMuted,marginBottom:6 }}>Sin grupos todavía</div>
                  <div style={{ fontSize:12,color:t.textFaint }}>Crea un grupo e invita a tus amigos para empezar.</div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  {groups.map(g => {
                    const members = groupMembers.filter(m => m.group_id === g.id);
                    const isOwner = g.owner_uid === user.id;
                    const unread  = (groupMessages[g.id]||[]).filter(m => m.sender_uid !== user.id).length;
                    // Friends not yet in this group
                    const memberIds = members.map(m => m.uid);
                    const invitableFriends = friends.filter(f => !memberIds.includes(f.id));

                    return (
                      <div key={g.id} style={{ background:t.bgCard,border:`1px solid ${activeGroupId===g.id?user.accent+"50":t.border}`,borderRadius:16,overflow:"hidden" }}>
                        {/* Group header */}
                        <div style={{ padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}
                            onClick={()=>{ setActiveGroupId(g.id===activeGroupId?null:g.id); if(g.id!==activeGroupId) loadMessages(g.id); }}>
                            <div style={{ width:42,height:42,borderRadius:13,background:user.accent+"18",border:`1.5px solid ${user.accent+"30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>
                              {g.avatar_emoji||"👥"}
                            </div>
                            <div>
                              <div style={{ fontSize:14,fontWeight:700,color:t.text }}>{g.name}</div>
                              <div style={{ fontSize:11,color:t.textMuted }}>{members.length} miembro{members.length!==1?"s":""}{g.description?` · ${g.description}`:""}</div>
                            </div>
                          </div>
                          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                            {unread>0&&<span style={{ background:"#f87171",color:"#fff",borderRadius:99,fontSize:9,fontWeight:800,padding:"2px 6px" }}>{unread}</span>}
                            <button onClick={()=>{ setSocialSubTab("chat"); setActiveGroupId(g.id); loadMessages(g.id); }}
                              style={{ background:t.input,border:`1px solid ${t.border}`,color:t.textMuted,borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                              <MessageSquare size={11}/> Chat
                            </button>
                          </div>
                        </div>

                        {/* Members row */}
                        <div style={{ paddingInline:16,paddingBottom:12,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                          {members.map(m=>{
                            const p = m.profile || users.find(u=>u.id===m.uid);
                            return p ? (
                              <div key={m.uid} style={{ display:"flex",alignItems:"center",gap:5,background:p.accent+"12",border:`1px solid ${p.accent+"30"}`,borderRadius:99,padding:"3px 9px 3px 4px" }}>
                                {p.avatar
                                  ? <img src={p.avatar} style={{ width:18,height:18,borderRadius:"50%",objectFit:"cover" }}/>
                                  : <div style={{ width:18,height:18,borderRadius:"50%",background:p.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#07070f" }}>{p.initials}</div>}
                                <span style={{ fontSize:11,color:p.accent,fontWeight:600 }}>{p.name?.split(" ")[0]}</span>
                                {m.uid===g.owner_uid&&<span style={{ fontSize:8,color:p.accent,opacity:.7 }}>👑</span>}
                              </div>
                            ) : null;
                          })}
                          {/* Invite button */}
                          {isOwner && invitableFriends.length > 0 && members.length < 6 && (
                            <div style={{ position:"relative" }}>
                              <button
                                onClick={e=>{
                                  const el = e.currentTarget.nextSibling;
                                  el.style.display = el.style.display==="none"||!el.style.display ? "block" : "none";
                                }}
                                style={{ background:"none",border:`1px dashed ${t.inputBdr}`,color:t.textMuted,borderRadius:99,padding:"3px 9px",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
                                <Plus size={10}/> Invitar
                              </button>
                              <div style={{ display:"none",position:"absolute",top:28,left:0,zIndex:50,background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:10,padding:8,minWidth:160,boxShadow:"0 8px 24px rgba(0,0,0,.2)" }}>
                                {invitableFriends.map(f=>(
                                  <button key={f.id} onClick={()=>inviteToGroup(g.id, f.id)}
                                    style={{ display:"flex",alignItems:"center",gap:8,width:"100%",background:"none",border:"none",color:t.text,padding:"6px 8px",borderRadius:7,fontSize:12,cursor:"pointer",textAlign:"left" }}>
                                    <div style={{ width:22,height:22,borderRadius:"50%",background:f.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#07070f",flexShrink:0 }}>{f.initials}</div>
                                    {f.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>)}

            {/* ════ RACHA GRUPAL ════ */}
            {socialSubTab==="racha"&&(<>
              {groups.length === 0 ? (
                <div style={{ textAlign:"center",padding:"40px 0",color:t.textFaint }}>
                  <div style={{ fontSize:36,marginBottom:12 }}>🔥</div>
                  <div style={{ fontSize:14,fontWeight:600,color:t.textMuted,marginBottom:6 }}>Crea un grupo primero</div>
                  <div style={{ fontSize:12,color:t.textFaint }}>La racha grupal requiere al menos un grupo activo.</div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  {/* How it works blurb */}
                  <div style={{ background:`${user.accent}10`,border:`1px solid ${user.accent}25`,borderRadius:12,padding:"10px 14px",fontSize:12,color:t.textMuted,lineHeight:1.6 }}>
                    🔥 <strong style={{ color:t.text }}>¿Cómo funciona?</strong> La racha grupal avanza cuando <em>todos</em> los miembros marcan su día. Si uno falla, la racha se rompe. El check-in también se activa automáticamente al completar un hábito.
                  </div>
                  {groups.map(g => <GroupStreakCard key={g.id} g={g}/>)}
                </div>
              )}
            </>)}

            {/* ════ CHAT ════ */}
            {socialSubTab==="chat"&&(<>
              {groups.length === 0 ? (
                <div style={{ textAlign:"center",padding:"40px 0",color:t.textFaint }}>
                  <div style={{ fontSize:36,marginBottom:12 }}>💬</div>
                  <div style={{ fontSize:14,fontWeight:600,color:t.textMuted }}>Crea un grupo para chatear</div>
                </div>
              ) : (<>
                {/* Group selector */}
                <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
                  {groups.map(g=>(
                    <button key={g.id} onClick={()=>{ setActiveGroupId(g.id); loadMessages(g.id); }}
                      style={{ background:activeGroupId===g.id?user.accent+"18":t.input,border:`1px solid ${activeGroupId===g.id?user.accent+"50":t.border}`,color:activeGroupId===g.id?user.accent:t.textMuted,borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:activeGroupId===g.id?700:400,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:6 }}>
                      <span>{g.avatar_emoji}</span>{g.name}
                    </button>
                  ))}
                </div>

                {activeGroupId ? (
                  <div style={{ display:"flex",flexDirection:"column",height:"calc(100vh - 280px)",minHeight:360 }}>
                    {/* Messages area */}
                    <div style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:2,paddingBottom:8 }}>
                      {msgLoading ? (
                        <div style={{ display:"flex",justifyContent:"center",padding:24 }}>
                          <Loader2 size={20} color={user.accent} style={{ animation:"spin 1s linear infinite" }}/>
                        </div>
                      ) : (groupMessages[activeGroupId]||[]).length === 0 ? (
                        <div style={{ textAlign:"center",padding:"30px 0",color:t.textFaint,fontSize:13 }}>
                          Sin mensajes todavía. ¡Di hola! 👋
                        </div>
                      ) : (
                        (groupMessages[activeGroupId]||[]).map((msg, i) => {
                          const isMe = msg.sender_uid === user.id;
                          const sender = msg.sender || users.find(u=>u.id===msg.sender_uid);
                          const prev = (groupMessages[activeGroupId]||[])[i-1];
                          const showAvatar = !isMe && (prev?.sender_uid !== msg.sender_uid);
                          const time = new Date(msg.created_at);
                          const timeStr = time.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"});
                          return (
                            <div key={msg.id} style={{ display:"flex",flexDirection:isMe?"row-reverse":"row",alignItems:"flex-end",gap:8,padding:"2px 0",marginTop:showAvatar?10:0 }}>
                              {/* Avatar */}
                              {!isMe && (
                                <div style={{ width:28,height:28,borderRadius:"50%",flexShrink:0,visibility:showAvatar?"visible":"hidden" }}>
                                  {sender?.avatar
                                    ? <img src={sender.avatar} style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover" }}/>
                                    : <div style={{ width:28,height:28,borderRadius:"50%",background:sender?.accent||"#818cf8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#07070f" }}>{sender?.initials||"?"}</div>}
                                </div>
                              )}
                              <div style={{ maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",gap:2 }}>
                                {showAvatar&&!isMe&&<span style={{ fontSize:10,color:sender?.accent||t.textMuted,fontWeight:700,paddingLeft:4 }}>{sender?.name||"?"}</span>}
                                <div style={{ background:isMe?user.accent:"rgba(255,255,255,.07)",color:isMe?"#07070f":t.text,borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"9px 13px",fontSize:13,lineHeight:1.5,wordBreak:"break-word" }}>
                                  {msg.text}
                                </div>
                                <span style={{ fontSize:9,color:t.textFaint,paddingInline:4 }}>{timeStr}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef}/>
                    </div>

                    {/* Input bar */}
                    <div style={{ display:"flex",gap:8,alignItems:"center",paddingTop:12,borderTop:`1px solid ${t.border}` }}>
                      <input
                        value={chatInput}
                        onChange={e=>setChatInput(e.target.value)}
                        onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(activeGroupId); } }}
                        placeholder="Escribe un mensaje…"
                        style={{ flex:1,...inputStyle }}/>
                      <button
                        onClick={()=>sendMessage(activeGroupId)}
                        disabled={!chatInput.trim()}
                        style={{ background:user.accent,color:"#07070f",border:"none",borderRadius:10,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:chatInput.trim()?"pointer":"not-allowed",opacity:chatInput.trim()?1:.5,flexShrink:0,transition:"opacity .15s" }}>
                        <Send size={16}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign:"center",padding:"30px 0",color:t.textFaint,fontSize:13 }}>
                    Selecciona un grupo para ver el chat.
                  </div>
                )}
              </>)}
            </>)}

          </div>
          );
        })()}

        {/* ══ PAREJA / NOSOTROS ══ */}
        {tab==="pareja"&&(()=>{
          if (!coupleEnabled || !partner) return (
            <div className="fu" style={{ textAlign:"center",padding:"60px 0" }}>
              <div style={{ fontSize:40,marginBottom:16 }}>❤️</div>
              <div style={{ fontSize:16,fontWeight:700,color:t.text,marginBottom:8 }}>Modo pareja no activado</div>
              <div style={{ fontSize:13,color:t.textMuted,marginBottom:20 }}>Ve a Social → Modo pareja para activarlo.</div>
              <button onClick={()=>setTab("social")}
                style={{ background:user.accent,color:"#07070f",border:"none",padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
                Ir a Social
              </button>
            </div>
          );

          const MOOD_LABELS = ["😔","😕","😐","😊","🥰"];
          const todayMyMood    = coupleMoods.find(m=>m.uid===user.id&&m.date===liveToday);
          const todayTheirMood = coupleMoods.find(m=>m.uid===partner.id&&m.date===liveToday);

          // Days together
          const daysTogether = coupleMode.since
            ? Math.max(0, Math.floor((Date.now()-new Date(coupleMode.since))/(1000*60*60*24)))
            : null;

          const pendingTasks = coupleTasks.filter(t=>!t.done);
          const doneTasks    = coupleTasks.filter(t=>t.done);

          return (
          <div className="fu">
            {/* Header */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
                <h1 style={h1Style}>{coupleTabName}</h1>
                <span style={{ fontSize:20 }}>❤️</span>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                {/* My avatar */}
                {user.avatar
                  ? <img src={user.avatar} style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover",border:`2px solid ${user.accent}` }}/>
                  : <div style={{ width:28,height:28,borderRadius:"50%",background:user.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#07070f" }}>{user.initials}</div>}
                <span style={{ fontSize:12,color:t.textMuted }}>+</span>
                {partner.avatar
                  ? <img src={partner.avatar} style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover",border:`2px solid #f472b6` }}/>
                  : <div style={{ width:28,height:28,borderRadius:"50%",background:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#07070f" }}>{partner.initials}</div>}
                <span style={{ fontSize:12,color:t.textMuted,fontWeight:500 }}>{user.name?.split(" ")[0]} & {partner.name?.split(" ")[0]}</span>
                {daysTogether!==null&&<span style={{ fontSize:11,color:"#f472b6",fontWeight:700,background:"#f472b615",border:"1px solid #f472b630",borderRadius:99,padding:"2px 10px" }}>❤️ {daysTogether} días juntos</span>}
              </div>
            </div>

            {/* Sub-tabs */}
            <div style={{ display:"flex",gap:2,background:t.input,borderRadius:11,padding:3,marginBottom:20,overflowX:"auto" }}>
              {[["tablero","🏠 Tablero"],["tareas","✅ Pendientes"],["metas","🎯 Metas"],["animo","😊 Ánimo"],["diario","📖 Diario"]].map(([id,label])=>(
                <button key={id} onClick={()=>setCoupleSubTab(id)}
                  style={{ background:coupleSubTab===id?t.bgCard:"none",border:coupleSubTab===id?`1px solid ${t.border}`:"1px solid transparent",color:coupleSubTab===id?t.text:t.textMuted,borderRadius:9,padding:"6px 14px",fontSize:12,fontWeight:coupleSubTab===id?700:400,cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── TABLERO ── */}
            {coupleSubTab==="tablero"&&(
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {/* Mood snapshot */}
                <div style={{ ...cardStyle(),background:`linear-gradient(135deg,#f472b608,${t.bgCard})` }}>
                  <div style={{ fontSize:10,fontWeight:700,color:"#f472b6",letterSpacing:.6,marginBottom:14 }}>😊 ESTADO DE HOY</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[{u:user,mood:todayMyMood},{u:partner,mood:todayTheirMood}].map(({u:u2,mood})=>(
                      <div key={u2.id} style={{ textAlign:"center",padding:"12px 8px",background:t.input,borderRadius:12 }}>
                        {u2.avatar?<img src={u2.avatar} style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",margin:"0 auto 8px",display:"block" }}/>
                          :<div style={{ width:36,height:36,borderRadius:"50%",background:u2.id===user.id?user.accent:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#07070f",margin:"0 auto 8px" }}>{u2.initials}</div>}
                        <div style={{ fontSize:11,fontWeight:600,color:t.text,marginBottom:4 }}>{u2.name?.split(" ")[0]}</div>
                        <div style={{ fontSize:28 }}>{mood ? MOOD_LABELS[mood.mood-1] : "—"}</div>
                        {mood?.note&&<div style={{ fontSize:10,color:t.textMuted,marginTop:4,fontStyle:"italic" }}>"{mood.note}"</div>}
                      </div>
                    ))}
                  </div>
                  {!todayMyMood&&(
                    <button onClick={()=>setCoupleSubTab("animo")}
                      style={{ width:"100%",marginTop:12,background:"#f472b618",border:"1px dashed #f472b640",color:"#f472b6",borderRadius:9,padding:"8px",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                      + Registrar mi ánimo de hoy
                    </button>
                  )}
                </div>

                {/* Pending tasks snapshot */}
                <div style={cardStyle()}>
                  <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12,display:"flex",justifyContent:"space-between" }}>
                    <span>✅ PENDIENTES</span>
                    <button onClick={()=>setCoupleSubTab("tareas")} style={{ background:"none",border:"none",color:t.textFaint,fontSize:10,cursor:"pointer" }}>Ver todos →</button>
                  </div>
                  {pendingTasks.length===0
                    ? <div style={{ fontSize:12,color:t.textFaint }}>¡Sin pendientes! 🎉</div>
                    : pendingTasks.slice(0,3).map(task=>(
                        <div key={task.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${t.border}` }}>
                          <button onClick={()=>toggleCoupleTask(task.id,task.done)} style={{ width:16,height:16,borderRadius:4,border:`2px solid ${t.border}`,background:"none",cursor:"pointer",flexShrink:0 }}/>
                          <span style={{ fontSize:12,color:t.text }}>{task.title}</span>
                        </div>
                      ))}
                </div>

                {/* Goals snapshot */}
                <div style={cardStyle()}>
                  <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12,display:"flex",justifyContent:"space-between" }}>
                    <span>🎯 METAS DE PAREJA</span>
                    <button onClick={()=>setCoupleSubTab("metas")} style={{ background:"none",border:"none",color:t.textFaint,fontSize:10,cursor:"pointer" }}>Ver todas →</button>
                  </div>
                  {coupleGoals.filter(g=>!g.done).length===0
                    ? <div style={{ fontSize:12,color:t.textFaint }}>Sin metas todavía. ¡Agrega una!</div>
                    : coupleGoals.filter(g=>!g.done).slice(0,3).map(g=>(
                        <div key={g.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0" }}>
                          <span style={{ fontSize:16 }}>{g.emoji||"🎯"}</span>
                          <div>
                            <div style={{ fontSize:12,color:t.text,fontWeight:500 }}>{g.title}</div>
                            {g.target_date&&<div style={{ fontSize:10,color:t.textFaint }}>📅 {g.target_date}</div>}
                          </div>
                        </div>
                      ))}
                </div>

                {/* Last journal */}
                {coupleJournal[0]&&(
                  <div style={cardStyle()}>
                    <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:10,display:"flex",justifyContent:"space-between" }}>
                      <span>📖 ÚLTIMA ENTRADA</span>
                      <button onClick={()=>setCoupleSubTab("diario")} style={{ background:"none",border:"none",color:t.textFaint,fontSize:10,cursor:"pointer" }}>Ver diario →</button>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                      <div style={{ width:22,height:22,borderRadius:"50%",background:coupleJournal[0].author?.id===user.id?user.accent:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#07070f" }}>{coupleJournal[0].author?.initials||"?"}</div>
                      <span style={{ fontSize:11,color:t.textMuted }}>{coupleJournal[0].author?.name?.split(" ")[0]} · {coupleJournal[0].created_at?.slice(0,10)}</span>
                      {coupleJournal[0].private&&<span style={{ fontSize:9,color:t.textFaint }}>🔒</span>}
                    </div>
                    {coupleJournal[0].title&&<div style={{ fontSize:13,fontWeight:600,color:t.text,marginBottom:4 }}>{coupleJournal[0].title}</div>}
                    <div style={{ fontSize:12,color:t.textMuted,lineHeight:1.6,maxHeight:60,overflow:"hidden",maskImage:"linear-gradient(to bottom,black 60%,transparent 100%)" }}>{coupleJournal[0].body}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAREAS ── */}
            {coupleSubTab==="tareas"&&(
              <div>
                <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:14 }}>
                  <button onClick={()=>setCoupleTaskForm(v=>!v)}
                    style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                    <Plus size={13}/> Nueva tarea
                  </button>
                </div>
                {coupleTaskForm&&(
                  <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:16 }}>
                    <input value={newCoupleTask.title} onChange={e=>setNewCoupleTask(v=>({...v,title:e.target.value}))}
                      placeholder="¿Qué hay que hacer?" style={{ ...inputStyle,width:"100%",marginBottom:8 }}/>
                    <input value={newCoupleTask.note} onChange={e=>setNewCoupleTask(v=>({...v,note:e.target.value}))}
                      placeholder="Nota (opcional)" style={{ ...inputStyle,width:"100%",marginBottom:10 }}/>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={addCoupleTask} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"9px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Agregar</button>
                      <button onClick={()=>setCoupleTaskForm(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 14px",borderRadius:9,fontSize:12,cursor:"pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}
                {pendingTasks.length===0&&doneTasks.length===0
                  ? <div style={{ textAlign:"center",padding:"30px 0",color:t.textFaint,fontSize:13 }}>Sin tareas todavía. ¡Agrega la primera!</div>
                  : <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                      {[...pendingTasks,...doneTasks].map(task=>{
                        const creator = task.creator||users.find(u=>u.id===task.creator_uid);
                        return (
                          <div key={task.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:t.bgCard,border:`1px solid ${task.done?"transparent":t.border}`,borderRadius:12,opacity:task.done?.6:1,transition:"opacity .2s" }}>
                            <button onClick={()=>toggleCoupleTask(task.id,task.done)}
                              style={{ width:20,height:20,borderRadius:6,border:`2px solid ${task.done?"#34d399":t.border}`,background:task.done?"#34d399":"none",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                              {task.done&&<Check size={11} color="#07070f"/>}
                            </button>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:13,color:t.text,fontWeight:500,textDecoration:task.done?"line-through":"none" }}>{task.title}</div>
                              {task.note&&<div style={{ fontSize:11,color:t.textMuted }}>{task.note}</div>}
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                              {creator&&<div style={{ width:18,height:18,borderRadius:"50%",background:creator.id===user.id?user.accent:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#07070f" }}>{creator.initials}</div>}
                              <button onClick={()=>deleteCoupleTask(task.id)} style={{ background:"none",border:"none",color:t.textFaint,cursor:"pointer",opacity:.5,padding:2 }}><Trash2 size={11}/></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
              </div>
            )}

            {/* ── METAS ── */}
            {coupleSubTab==="metas"&&(
              <div>
                <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:14 }}>
                  <button onClick={()=>setCoupleGoalForm(v=>!v)}
                    style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                    <Plus size={13}/> Nueva meta
                  </button>
                </div>
                {coupleGoalForm&&(
                  <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:16 }}>
                    <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                      <input value={newCoupleGoal.emoji} onChange={e=>setNewCoupleGoal(v=>({...v,emoji:e.target.value}))}
                        style={{ ...inputStyle,width:52,textAlign:"center",fontSize:20 }}/>
                      <input value={newCoupleGoal.title} onChange={e=>setNewCoupleGoal(v=>({...v,title:e.target.value}))}
                        placeholder="¿Cuál es la meta?" style={{ ...inputStyle,flex:1 }}/>
                    </div>
                    <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:10,color:t.textMuted,marginBottom:5 }}>FECHA OBJETIVO</div>
                        <input type="date" value={newCoupleGoal.target_date} onChange={e=>setNewCoupleGoal(v=>({...v,target_date:e.target.value}))}
                          style={{ ...inputStyle,width:"100%" }}/>
                      </div>
                    </div>
                    <input value={newCoupleGoal.note} onChange={e=>setNewCoupleGoal(v=>({...v,note:e.target.value}))}
                      placeholder="Nota (opcional)" style={{ ...inputStyle,width:"100%",marginBottom:10 }}/>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={addCoupleGoal} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"9px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Guardar</button>
                      <button onClick={()=>setCoupleGoalForm(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 14px",borderRadius:9,fontSize:12,cursor:"pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}
                {coupleGoals.length===0
                  ? <div style={{ textAlign:"center",padding:"30px 0",color:t.textFaint,fontSize:13 }}>Sin metas todavía. ¡Agrega la primera!</div>
                  : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      {coupleGoals.map(g=>(
                        <div key={g.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:t.bgCard,border:`1px solid ${g.done?"#34d39930":t.border}`,borderRadius:14,opacity:g.done?.65:1 }}>
                          <span style={{ fontSize:22,flexShrink:0 }}>{g.emoji||"🎯"}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13,fontWeight:600,color:t.text,textDecoration:g.done?"line-through":"none" }}>{g.title}</div>
                            {g.target_date&&<div style={{ fontSize:10,color:t.textFaint,marginTop:2 }}>📅 {g.target_date}</div>}
                            {g.note&&<div style={{ fontSize:11,color:t.textMuted,marginTop:2 }}>{g.note}</div>}
                          </div>
                          <button onClick={()=>toggleCoupleGoal(g.id,g.done)}
                            style={{ width:24,height:24,borderRadius:7,border:`2px solid ${g.done?"#34d399":t.border}`,background:g.done?"#34d399":"none",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                            {g.done&&<Check size={13} color="#07070f"/>}
                          </button>
                        </div>
                      ))}
                    </div>}
              </div>
            )}

            {/* ── ÁNIMO ── */}
            {coupleSubTab==="animo"&&(
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {/* Log today's mood */}
                {!moodLogged ? (
                  <div style={{ ...cardStyle(),border:`1px solid #f472b630` }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#f472b6",marginBottom:14 }}>¿CÓMO ESTÁS HOY?</div>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}>
                      {MOOD_LABELS.map((emoji,i)=>(
                        <button key={i} onClick={()=>setNewMoodEntry(v=>({...v,mood:i+1}))}
                          style={{ fontSize:newMoodEntry.mood===i+1?32:24,background:newMoodEntry.mood===i+1?"#f472b618":"none",border:`1.5px solid ${newMoodEntry.mood===i+1?"#f472b660":"transparent"}`,borderRadius:12,width:52,height:52,cursor:"pointer",transition:"all .15s" }}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <input value={newMoodEntry.note} onChange={e=>setNewMoodEntry(v=>({...v,note:e.target.value}))}
                      placeholder="¿Algo que quieras compartir? (opcional)" style={{ ...inputStyle,width:"100%",marginBottom:10 }}/>
                    <button onClick={logMood}
                      style={{ width:"100%",background:"#f472b6",color:"#07070f",border:"none",padding:"10px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
                      Registrar ánimo
                    </button>
                  </div>
                ) : (
                  <div style={{ background:"#f472b610",border:"1px solid #f472b630",borderRadius:12,padding:"12px 16px",fontSize:13,color:"#f472b6",fontWeight:600,textAlign:"center" }}>
                    ✅ Ya registraste tu ánimo de hoy
                  </div>
                )}

                {/* Mood history */}
                <div style={cardStyle()}>
                  <div style={{ fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:12 }}>HISTORIAL</div>
                  {coupleMoods.length === 0
                    ? <div style={{ fontSize:12,color:t.textFaint }}>Sin registros todavía.</div>
                    : (()=>{
                        // Group by date
                        const byDate = {};
                        coupleMoods.forEach(m=>{ if(!byDate[m.date])byDate[m.date]=[]; byDate[m.date].push(m); });
                        return Object.entries(byDate).slice(0,14).map(([date,entries])=>(
                          <div key={date} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${t.border}` }}>
                            <span style={{ fontSize:11,color:t.textFaint,width:80,flexShrink:0 }}>{date}</span>
                            <div style={{ display:"flex",gap:12,flex:1 }}>
                              {entries.map(m=>(
                                <div key={m.uid} style={{ display:"flex",alignItems:"center",gap:6 }}>
                                  <div style={{ width:18,height:18,borderRadius:"50%",background:m.uid===user.id?user.accent:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#07070f",flexShrink:0 }}>{m.author?.initials||"?"}</div>
                                  <span style={{ fontSize:18 }}>{MOOD_LABELS[(m.mood||3)-1]}</span>
                                  {m.note&&<span style={{ fontSize:11,color:t.textMuted,fontStyle:"italic" }}>"{m.note}"</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                </div>
              </div>
            )}

            {/* ── DIARIO ── */}
            {coupleSubTab==="diario"&&(
              <div>
                <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:14 }}>
                  <button onClick={()=>setJournalForm(v=>!v)}
                    style={{ background:user.accent,color:"#07070f",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                    <Plus size={13}/> Nueva entrada
                  </button>
                </div>
                {journalForm&&(
                  <div className="slide-down" style={{ ...cardStyle(),border:`1px solid ${user.accent}30`,marginBottom:16 }}>
                    <input value={newJournalEntry.title} onChange={e=>setNewJournalEntry(v=>({...v,title:e.target.value}))}
                      placeholder="Título (opcional)" style={{ ...inputStyle,width:"100%",marginBottom:8 }}/>
                    <textarea value={newJournalEntry.body} onChange={e=>setNewJournalEntry(v=>({...v,body:e.target.value}))}
                      placeholder="Escribe lo que sientes…" rows={5}
                      style={{ ...inputStyle,width:"100%",resize:"vertical",marginBottom:10,lineHeight:1.6 }}/>
                    <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:10 }}>
                      <button onClick={()=>setNewJournalEntry(v=>({...v,private:!v.private}))}
                        style={{ background:newJournalEntry.private?"rgba(248,113,113,.15)":t.input,border:`1px solid ${newJournalEntry.private?"rgba(248,113,113,.4)":t.border}`,color:newJournalEntry.private?"#f87171":t.textMuted,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer" }}>
                        {newJournalEntry.private?"🔒 Solo yo":"👥 Compartida"}
                      </button>
                      <span style={{ fontSize:11,color:t.textFaint }}>{newJournalEntry.private?"Solo tú la verás":"Tu pareja también la verá"}</span>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={addJournalEntry} style={{ flex:1,background:user.accent,color:"#07070f",border:"none",padding:"9px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Guardar</button>
                      <button onClick={()=>setJournalForm(false)} style={{ background:"none",border:`1px solid ${t.border}`,color:t.textMuted,padding:"9px 14px",borderRadius:9,fontSize:12,cursor:"pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}
                {coupleJournal.length===0
                  ? <div style={{ textAlign:"center",padding:"30px 0",color:t.textFaint,fontSize:13 }}>Sin entradas todavía. ¡Escribe la primera!</div>
                  : <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                      {coupleJournal.map(entry=>{
                        const isMe = entry.uid===user.id;
                        const author = entry.author||users.find(u=>u.id===entry.uid);
                        return (
                          <div key={entry.id} style={{ background:t.bgCard,border:`1px solid ${isMe?user.accent+"30":"#f472b630"}`,borderLeft:`3px solid ${isMe?user.accent:"#f472b6"}`,borderRadius:14,padding:"14px 16px" }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                                <div style={{ width:22,height:22,borderRadius:"50%",background:isMe?user.accent:"#f472b6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#07070f" }}>{author?.initials||"?"}</div>
                                <span style={{ fontSize:12,fontWeight:700,color:isMe?user.accent:"#f472b6" }}>{author?.name?.split(" ")[0]||"?"}</span>
                                {entry.private&&<span style={{ fontSize:10,color:t.textFaint }}>🔒</span>}
                              </div>
                              <span style={{ fontSize:10,color:t.textFaint }}>{entry.created_at?.slice(0,10)}</span>
                            </div>
                            {entry.title&&<div style={{ fontSize:14,fontWeight:700,color:t.text,marginBottom:6 }}>{entry.title}</div>}
                            <div style={{ fontSize:13,color:t.textMuted,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{entry.body}</div>
                          </div>
                        );
                      })}
                    </div>}
              </div>
            )}

          </div>
          );
        })()}

        {/* ══ SETTINGS ══ */}
        {tab==="settings"&&(()=>{
          const cfg = getUserReportCfg(user.id);
          const DAY_LABELS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
          const SECTION_LABELS = {
            tasks:    { label:"Tareas",     icon:"✅" },
            habits:   { label:"Hábitos",    icon:"🔥" },
            events:   { label:"Eventos",    icon:"📅" },
            academic: { label:"Académico",  icon:"🎓" },
            finance:  { label:"Finanzas",   icon:"💰" },
          };

          // Avatar upload handler (inline for settings page)
          const handleAvatarFile = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const ext = file.name.split(".").pop();
              const path = `avatars/user_${user.id}_${Date.now()}.${ext}`;
              const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert:true });
              if (upErr) throw upErr;
              const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
              updateUser({ ...user, avatar: urlData.publicUrl });
            } catch(err) { toast.error("Error al subir foto: " + err.message); }
          };

          return (
          <div className="fu">
            <h1 style={h1Style}>Settings</h1>
            <p style={{ ...subStyle, marginBottom:28 }}>Perfil y preferencias del reporte diario</p>

            <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:600 }}>

              {/* ── APARIENCIA ── */}
              <div style={cardStyle()}>
                <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:16 }}>🎨 APARIENCIA</div>

                {/* Font size */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:10 }}>TAMAÑO DE LETRA</div>
                  <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                    {[{v:12,label:"Pequeño"},{v:14,label:"Normal"},{v:16,label:"Grande"},{v:18,label:"Muy grande"}].map(opt=>(
                      <button key={opt.v} onClick={()=>{ setFontSize(opt.v); localStorage.setItem("fontSize",opt.v); }}
                        style={{ padding:"7px 16px",borderRadius:10,border:`1px solid ${fontSize===opt.v?user.accent+"60":t.inputBdr}`,background:fontSize===opt.v?user.accent+"18":"transparent",color:fontSize===opt.v?user.accent:t.textMuted,fontSize:opt.v-2,fontWeight:fontSize===opt.v?700:400,cursor:"pointer",transition:"all .15s" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop:10,padding:"10px 14px",background:t.input,borderRadius:10,fontSize:fontSize,color:t.text }}>
                    Vista previa — así se verá el texto en la app.
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:10 }}>TEMA</div>
                  <button onClick={toggleTheme}
                    style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderRadius:10,border:`1px solid ${t.inputBdr}`,background:t.input,color:t.text,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                    {dark ? <Sun size={14}/> : <Moon size={14}/>}
                    {dark ? "Cambiar a claro" : "Cambiar a oscuro"}
                  </button>
                </div>
              </div>

              {/* ── PERFIL ── */}
              <div style={cardStyle()}>
                <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.6,marginBottom:18 }}>👤 PERFIL</div>

                {/* Avatar */}
                <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
                  <label style={{ cursor:"pointer",position:"relative",flexShrink:0 }}>
                    {user.avatar
                      ? <img src={user.avatar} style={{ width:64,height:64,borderRadius:18,objectFit:"cover",border:`3px solid ${user.accent}60`,display:"block" }}/>
                      : <div style={{ width:64,height:64,borderRadius:18,background:user.accent+"22",border:`3px solid ${user.accent}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:user.accent }}>{user.initials}</div>}
                    <div style={{ position:"absolute",bottom:-4,right:-4,width:20,height:20,borderRadius:"50%",background:user.accent,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${t.bgCard}` }}>
                      <Camera size={10} color="#07070f"/>
                    </div>
                    <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarFile}/>
                  </label>
                  <div>
                    <div style={{ fontSize:15,fontWeight:700,color:t.text }}>{user.name}</div>
                    <div style={{ fontSize:11,color:t.textMuted,marginTop:2 }}>{user.email||"Sin email configurado"}</div>
                    {user.avatar&&<button onClick={()=>updateUser({...user,avatar:""})} style={{ background:"none",border:"none",color:"#f87171",fontSize:10,padding:0,marginTop:4,cursor:"pointer" }}>Quitar foto</button>}
                  </div>
                </div>

                {/* Name */}
                <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:14 }}>
                  <div style={{ flex:1,minWidth:150 }}>
                    <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:5 }}>NOMBRE</div>
                    <input
                      defaultValue={user.name}
                      onBlur={e=>{ if(e.target.value.trim()) updateUser({...user,name:e.target.value.trim(),initials:initials(e.target.value)}); }}
                      style={{ width:"100%",...inputStyle }}/>
                  </div>
                  <div style={{ flex:1,minWidth:200 }}>
                    <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:5 }}>EMAIL PERSONAL</div>
                    <input type="email"
                      defaultValue={user.email||""}
                      placeholder="tucorreo@ejemplo.com"
                      onBlur={e=>updateUser({...user,email:e.target.value.trim()})}
                      style={{ width:"100%",...inputStyle }}/>
                  </div>
                </div>

                {/* Accent */}
                <div>
                  <div style={{ fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:.5,marginBottom:8 }}>COLOR DE ACENTO</div>
                  <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center" }}>
                    {ACCENT_PALETTE.map(c=>(
                      <button key={c} onClick={()=>updateUser({...user,accent:c,accentDim:c+"18"})} style={{ width:32,height:32,borderRadius:10,background:c,border:`2.5px solid ${user.accent===c?"#fff":"transparent"}`,outline:user.accent===c?`2.5px solid ${c}`:"none",outlineOffset:2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s" }}>
                        {user.accent===c&&<Check size={13} color="#fff"/>}
                      </button>
                    ))}
                    <label style={{ width:32,height:32,borderRadius:10,background:t.input,border:`1.5px dashed ${t.inputBdr}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",overflow:"hidden" }} title="Color personalizado">
                      <span style={{ fontSize:15 }}>🎨</span>
                      <input type="color" value={user.accent} onChange={e=>updateUser({...user,accent:e.target.value,accentDim:e.target.value+"18"})}
                        style={{ position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%" }}/>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── REPORTE DIARIO ── */}
              <div style={{ ...cardStyle(), position:"relative", overflow:"hidden" }}>
                {/* Coming-soon overlay */}
                <div style={{ position:"absolute",inset:0,background:t.bgCard+"cc",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,backdropFilter:"blur(2px)",borderRadius:"inherit" }}>
                  <span style={{ fontSize:22 }}>🚧</span>
                  <div style={{ fontSize:13,fontWeight:800,color:t.text }}>Próximamente</div>
                  <div style={{ fontSize:11,color:t.textMuted,textAlign:"center",maxWidth:200,lineHeight:1.5 }}>El reporte diario por correo aún no está disponible. Lo estamos construyendo.</div>
                </div>
                <div style={{ opacity:.3,pointerEvents:"none" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:t.textSub,letterSpacing:.6 }}>📧 REPORTE DIARIO</div>
                  <button style={{ display:"flex",alignItems:"center",gap:7,background:"none",border:`1px solid ${t.inputBdr}`,borderRadius:20,padding:"5px 12px",cursor:"default" }}>
                    <div style={{ width:28,height:16,borderRadius:99,background:t.border,position:"relative" }}>
                      <div style={{ position:"absolute",top:2,left:2,width:12,height:12,borderRadius:"50%",background:"#fff" }}/>
                    </div>
                    <span style={{ fontSize:11,fontWeight:600,color:t.textMuted }}>Inactivo</span>
                  </button>
                </div>
                <div style={{ fontSize:10,color:t.textMuted,padding:"8px 0" }}>Configura el correo, días y secciones del reporte automático.</div>
                </div>
              </div>

              {/* ── CONEXIONES ── */}
              <FriendRequestsCard user={user} profiles={profiles} t={t} inputStyle={inputStyle} accent={user.accent} reloadProfiles={reloadProfiles}/>

              {/* ── NOTIFICACIONES PUSH ── */}
              <div style={cardStyle()}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:28,height:28,borderRadius:9,background:"rgba(129,140,248,.15)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bell size={13} color="#818cf8"/></div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:t.text }}>Notificaciones push</div>
                      <div style={{ fontSize:10.5,color:t.textMuted }}>Alertas de tareas urgentes y retos</div>
                    </div>
                  </div>
                  {pushEnabled
                    ? <button onClick={disablePush} style={{ background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",padding:"6px 14px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer" }}>Desactivar</button>
                    : <button onClick={requestPushPermission} style={{ background:user.accent,color:"#07070f",border:"none",padding:"6px 16px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer" }}>Activar</button>}
                </div>
                {pushEnabled&&(
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {[{icon:"🔴",label:"Tareas vencidas"},{icon:"⚔️",label:"Retos nuevos"},{icon:"🎖️",label:"Badges ganados"}].map((item,i)=>(
                      <span key={i} style={{ fontSize:10,color:t.textMuted,background:t.input,border:`1px solid ${t.border}`,borderRadius:99,padding:"3px 10px" }}>{item.icon} {item.label}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── EXPORTAR DATOS ── */}
              <div style={cardStyle()}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                  <div style={{ width:28,height:28,borderRadius:9,background:"rgba(52,211,153,.15)",display:"flex",alignItems:"center",justifyContent:"center" }}><Download size={13} color="#34d399"/></div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:t.text }}>Exportar datos</div>
                    <div style={{ fontSize:10.5,color:t.textMuted }}>Descarga tus datos en cualquier momento</div>
                  </div>
                </div>
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  <button onClick={exportAcademicPDF} style={{ display:"flex",alignItems:"center",gap:6,background:t.input,border:`1px solid ${t.border}`,color:t.textSub,padding:"8px 14px",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer" }}>
                    <GraduationCap size={12}/> Reporte académico (PDF)
                  </button>
                  <button onClick={exportTasksCSV} style={{ display:"flex",alignItems:"center",gap:6,background:t.input,border:`1px solid ${t.border}`,color:t.textSub,padding:"8px 14px",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer" }}>
                    <CheckSquare size={12}/> Tareas (.csv)
                  </button>
                  <button onClick={exportFinanceCSV} style={{ display:"flex",alignItems:"center",gap:6,background:t.input,border:`1px solid ${t.border}`,color:t.textSub,padding:"8px 14px",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer" }}>
                    <Wallet size={12}/> Finanzas (.csv)
                  </button>
                </div>
              </div>

              {/* ── ZONA DE PELIGRO ── */}
              <div style={{ ...cardStyle(), border:"1px solid rgba(248,113,113,.25)", background:dark?"rgba(248,113,113,.04)":"rgba(248,113,113,.03)" }}>
                <div style={{ fontSize:10.5,fontWeight:700,color:"#f87171",letterSpacing:.7,marginBottom:14 }}>⚠️ ZONA DE PELIGRO</div>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
                  <div style={{ flex:1,minWidth:200 }}>
                    <div style={{ fontSize:13.5,fontWeight:700,color:t.text,marginBottom:4 }}>Eliminar mi cuenta</div>
                    <div style={{ fontSize:11.5,color:t.textMuted,lineHeight:1.6 }}>
                      Elimina permanentemente tu cuenta y todos tus datos: tareas, hábitos, notas, finanzas, historial. Esta acción <strong style={{color:"#f87171"}}>no se puede deshacer</strong>.
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      confirmModal(
                        "Eliminar cuenta permanentemente",
                        `Esto borrará <strong>TODOS</strong> tus datos: tareas, hábitos, notas, finanzas, historial. <strong style="color:#f87171">Esta acción no se puede deshacer.</strong><br/><br/>Escribe <strong>ELIMINAR</strong> para confirmar.`,
                        async () => {
                          try {
                            const { data: { session } } = await supabase.auth.getSession();
                            const res = await fetch(
                              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
                              {
                                method: "POST",
                                headers: {
                                  "Authorization": `Bearer ${session.access_token}`,
                                  "Content-Type": "application/json",
                                },
                              }
                            );
                            const json = await res.json();
                            if (!res.ok) throw new Error(json.error || "Error desconocido");
                            await supabase.auth.signOut();
                          } catch(err) {
                            toast.error("Error al eliminar cuenta: " + err.message);
                          }
                        },
                        { danger: true, promptLabel: 'Escribe "ELIMINAR" para confirmar', promptExpected: "ELIMINAR" }
                      );
                    }}
                    style={{ background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",color:"#f87171",borderRadius:10,padding:"10px 20px",fontSize:12.5,fontWeight:700,cursor:"pointer",flexShrink:0,transition:"all .2s",whiteSpace:"nowrap" }}>
                    Eliminar cuenta
                  </button>
                </div>
              </div>

            </div>
          </div>
          );
        })()}

        </ErrorBoundary>
      </main>

      {/* ── MOBILE NAV ── */}
      <nav className="mobile-nav">
        {/* Main 5 tabs */}
        {orderedNav.slice(0,5).map(({id,Ic,label})=>(
          <button key={id} onClick={()=>{setTab(id);setMobileMenuOpen(false);}} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",color:tab===id?user.accent:t.textMuted,padding:"4px 8px",transition:"color .18s",flexShrink:0,cursor:"pointer" }}>
            <Ic size={18} strokeWidth={tab===id?2.3:1.8}/>
            <span style={{ fontSize:9,fontWeight:tab===id?700:400,whiteSpace:"nowrap" }}>{label}</span>
          </button>
        ))}
        {/* More button */}
        <button onClick={()=>setMobileMenuOpen(v=>!v)} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",color:mobileMenuOpen?user.accent:t.textMuted,padding:"4px 8px",flexShrink:0,cursor:"pointer",position:"relative" }}>
          <Menu size={18} strokeWidth={mobileMenuOpen?2.3:1.8}/>
          <span style={{ fontSize:9,fontWeight:400,whiteSpace:"nowrap" }}>Más</span>
          {notifications.length>0&&<div style={{ position:"absolute",top:2,right:6,width:7,height:7,borderRadius:"50%",background:"#f87171",border:`1.5px solid ${t.bg}` }}/>}
        </button>
      </nav>

      {/* ── MOBILE SLIDE-UP MENU ── */}
      {mobileMenuOpen&&(
        <div style={{ position:"fixed",inset:0,zIndex:200 }} onClick={()=>setMobileMenuOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",bottom:0,left:0,right:0,background:dark?"rgba(7,7,15,.98)":t.sidebar,borderTop:`1px solid ${t.sidebarBdr}`,borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",zIndex:201,backdropFilter:"blur(24px)",boxShadow:"0 -8px 40px rgba(0,0,0,.25)" }}>

            {/* Handle */}
            <div style={{ width:36,height:4,borderRadius:99,background:t.border,margin:"0 auto 18px" }}/>

            {/* User + actions row */}
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:18,padding:"12px 14px",background:user.accent+"10",border:`1px solid ${user.accent}25`,borderRadius:14 }}>
              <div style={{ position:"relative",flexShrink:0 }} onClick={()=>{setMobileMenuOpen(false);setProfileOpen(true);}}>
                {user.avatar
                  ? <img src={user.avatar} style={{ width:36,height:36,borderRadius:12,objectFit:"cover",border:`2px solid ${user.accent}55`,cursor:"pointer" }}/>
                  : <div style={{ width:36,height:36,borderRadius:12,background:user.accent+"22",border:`2px solid ${user.accent}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:user.accent,cursor:"pointer" }}>{user.initials}</div>}
                <div style={{ position:"absolute",bottom:-3,right:-3,width:14,height:14,borderRadius:"50%",background:t.bgCard,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Pencil size={7} color={t.textMuted}/></div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:t.text }}>{user.name}</div>
                <div style={{ fontSize:10,color:t.textMuted }}>Nv. {(userStats[user.id]||{level:1}).level} · {(userStats[user.id]||{xp:0}).xp} XP</div>
              </div>
              {/* Logout */}
              <button onClick={()=>{logout();setMobileMenuOpen(false);}} style={{ background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",borderRadius:10,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#f87171",fontSize:11,fontWeight:600 }}>
                <X size={12}/> Salir
              </button>
            </div>

            {/* Quick actions */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:18 }}>
              {[
                { label:"Buscar",     icon:"🔍", action:()=>{setSearchOpen(true);setMobileMenuOpen(false);}      },
                { label:"Alertas",    icon:null,  IsIcon:Bell,  action:()=>{setTab("_notifs");setMobileMenuOpen(false);}, badge:notifications.length>0 },
                { label:dark?"Claro":"Oscuro", icon:null, IsIcon:dark?Sun:Moon, action:toggleTheme              },
                { label:"Orden nav",  icon:"⠿",   action:()=>{setNavEditMode(v=>!v);setMobileMenuOpen(false);}  },
              ].map((it,i)=>(
                <button key={i} onClick={it.action} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",position:"relative" }}>
                  {it.badge&&<div style={{ position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:"#f87171" }}/>}
                  {it.icon?<span style={{ fontSize:18 }}>{it.icon}</span>:<it.IsIcon size={18} color={t.textMuted}/>}
                  <span style={{ fontSize:10,color:t.textMuted,fontWeight:500 }}>{it.label}</span>
                </button>
              ))}
            </div>

            {/* Full nav grid - with drag to reorder */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <div style={{ fontSize:9.5,color:t.textFaint,fontWeight:700,letterSpacing:.7 }}>TODAS LAS SECCIONES</div>
              <button onClick={()=>setNavEditMode(v=>!v)} style={{ background:navEditMode?user.accent+"22":"none",border:`1px solid ${navEditMode?user.accent+"50":t.border}`,color:navEditMode?user.accent:t.textFaint,borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:700,cursor:"pointer" }}>
                {navEditMode?"✓ Listo":"⠿ Reordenar"}
              </button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
              {orderedNav.map(({id,Ic,label})=>(
                <div key={id}
                  draggable={navEditMode}
                  onDragStart={()=>onNavDragStart(id)}
                  onDragOver={e=>{e.preventDefault();onNavDragOver(id);}}
                  onDrop={()=>{onNavDrop(id);}}
                  style={{ position:"relative",opacity:navDragging===id?.5:1,outline:navDragOver===id&&navEditMode?`2px dashed ${user.accent}60`:"none",borderRadius:12,transition:"opacity .15s,outline .1s" }}>
                  <button onClick={()=>{if(!navEditMode){setTab(id);setMobileMenuOpen(false);}}} style={{ width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:tab===id?user.accent+"18":t.bgCard,border:`1px solid ${tab===id?user.accent+"40":t.border}`,borderRadius:12,padding:"10px 6px",cursor:navEditMode?"grab":"pointer" }}>
                    <Ic size={16} color={tab===id?user.accent:t.textMuted} strokeWidth={tab===id?2.3:1.8}/>
                    <span style={{ fontSize:9.5,color:tab===id?user.accent:t.textMuted,fontWeight:tab===id?700:400,textAlign:"center" }}>{label}</span>
                  </button>
                  {navEditMode&&<div style={{ position:"absolute",top:3,right:3,width:14,height:14,borderRadius:"50%",background:user.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}><GripVertical size={8} color={user.accent}/></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ── FEEDBACK + TOAST + CONFIRM SYSTEM ── */}
      <FeedbackButton user={user} t={t} accent={user.accent}/>
      <ToastContainer/>
      <ConfirmModalContainer/>
    </div>
  );
}

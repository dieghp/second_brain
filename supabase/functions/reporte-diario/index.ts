import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = "re_MFyVtrBz_2cMAVoCuBtxkRsVErhcBCZC2";
const SUPABASE_URL   = "https://atseawguswjlybqlfoqj.supabase.co";
const SUPABASE_KEY   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0c2Vhd2d1c3dqbHlicWxmb3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxNzUxNywiZXhwIjoyMDg4NDkzNTE3fQ.mKIThcEFmdU5mxKHT_LwICOP4WIbWg7-hb1aP-eC6sQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USERS = [
  { id: 1, name: "Diego", email: "dhuertas241105@gmail.com" },
  { id: 2, name: "Lucho", email: "lacarbonell0306@gmail.com" },
];

const money = (n: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);

// Calcula racha consecutiva de días con todos los hábitos completados
function calcStreak(habits: any[], logs: any[], uid: number): number {
  if (!habits.length) return 0;
  let streak = 0;
  const d = new Date();
  const today = d.toISOString().slice(0, 10);

  for (let i = 0; i < 365; i++) {
    const ds = d.toISOString().slice(0, 10);
    const allDone = habits.every(h =>
      logs.some(l => l.habit_id === h.id && l.date === ds && l.uid === uid)
    );
    if (!allDone) {
      if (ds === today) { d.setDate(d.getDate() - 1); continue; }
      break;
    }
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

async function buildReport(uid: number, name: string, sections = { tasks:true, habits:true, events:true, academic:true, finance:false }) {
  const today = new Date().toISOString().slice(0, 10);
  const in7   = new Date(); in7.setDate(in7.getDate() + 7);
  const in7s  = in7.toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7); // YYYY-MM

  const [
    { data: tasks },
    { data: events },
    { data: txs },
    { data: courses },
    { data: evaluations },
    { data: habits },
    { data: habitLogs },
    { data: statsRows },
  ] = await Promise.all([
    supabase.from("tasks").select("*").or(`uid.eq.${uid},shared.eq.true`).neq("status", "completada"),
    supabase.from("events").select("*").eq("date", today).or(`uid.eq.${uid},shared.eq.true`),
    supabase.from("transactions").select("*").or(`uid.eq.${uid},shared.eq.true`),
    supabase.from("courses").select("*, course_materials(*)").or(`uid.eq.${uid},shared.eq.true`),
    supabase.from("evaluations").select("*").eq("pending", true),
    supabase.from("habits").select("*").eq("uid", uid),
    supabase.from("habit_logs").select("*").eq("uid", uid),
    supabase.from("user_stats").select("*").eq("uid", uid),
  ]);

  // ── Finanzas (solo del mes actual con fecha real) ──
  const monthTx  = txs?.filter(t => (t.date || "").startsWith(monthKey)) || [];
  const ingresos = monthTx.filter(t => t.type === "ingreso").reduce((a, t) => a + Number(t.amount), 0);
  const gastos   = monthTx.filter(t => t.type === "gasto").reduce((a, t) => a + Number(t.amount), 0);
  const balance  = ingresos - gastos;
  const lastTxs  = [...(txs || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3);

  // ── Tasks ──
  const alta   = tasks?.filter(t => t.priority === "alta") || [];
  const allPend = tasks?.length || 0;

  // ── Hábitos hoy ──
  const myHabits     = habits || [];
  const doneToday    = myHabits.filter(h => (habitLogs || []).some(l => l.habit_id === h.id && l.date === today));
  const habPct       = myHabits.length ? Math.round((doneToday.length / myHabits.length) * 100) : null;
  const streak       = calcStreak(myHabits, habitLogs || [], uid);
  const stats        = statsRows?.[0] || { xp: 0, level: 1 };
  const xpInLevel    = (stats.xp || 0) % 200;

  // ── Próximas entregas (tasks + evaluaciones, 7 días) ──
  const upcomingTasks = (tasks || [])
    .filter(t => t.deadline && t.deadline >= today && t.deadline <= in7s)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const myCourseIds = (courses || []).filter(c => c.uid === uid).map(c => c.id);
  const upcomingEvals = (evaluations || [])
    .filter(e => myCourseIds.includes(e.course_id) && e.date && e.date >= today && e.date <= in7s)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = [
    ...upcomingTasks.map(t => ({ label: t.title, date: t.deadline, icon: "📌" })),
    ...upcomingEvals.map(e => {
      const c = (courses || []).find(x => x.id === e.course_id);
      return { label: `${c?.name || "Curso"} — ${e.name}`, date: e.date, icon: "📝" };
    }),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  // ── Computed values for template ──
  const streakEmoji = streak >= 30 ? "🏆" : streak >= 7 ? "💫" : streak >= 3 ? "🔥" : "⚡";
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Buenos días" : greetingHour < 19 ? "Buenas tardes" : "Buenas noches";
  const motivationalMsg = allPend === 0 ? "¡Todo al día! Sigue así 💪" : alta.length > 3 ? `Tienes ${alta.length} tareas urgentes. ¡Vamos! 🔥` : "Un día más para avanzar. Tú puedes ✨";
  const accent = uid === 1 ? "#34d399" : "#818cf8";
  const accentDim = uid === 1 ? "rgba(52,211,153," : "rgba(129,140,248,";
  const dateStr = new Date().toLocaleDateString("es-PE", { weekday:"long", day:"numeric", month:"long" });
  const xpPct = Math.round((xpInLevel / 200) * 100);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Reporte · 2do.cerebro</title>
</head>
<body style="margin:0;padding:0;background:#060610;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<div style="max-width:600px;margin:0 auto;padding:28px 16px 40px;">

  <!-- ══ HEADER ══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#0d0d1f 0%,#13132b 60%,#0d1526 100%);border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.06);margin-bottom:14px;">
    <tr>
      <td style="padding:0;">
        <!-- Accent top strip -->
        <div style="height:3px;background:linear-gradient(90deg,${accent},${accentDim}.4) 60%,transparent);"></div>
        <!-- Brand row -->
        <div style="padding:22px 28px 0;display:flex;align-items:center;justify-content:space-between;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <div style="font-size:22px;font-weight:900;color:#f1f5f9;letter-spacing:-.5px;">2do<span style="color:${accent}">.</span>cerebro</div>
              <div style="font-size:10px;color:#475569;letter-spacing:1.5px;margin-top:2px;text-transform:uppercase;">Sistema Personal · Lima 🇵🇪</div>
            </td>
            <td align="right">
              <div style="display:inline-block;background:${accentDim}.1);border:1px solid ${accentDim}.25);border-radius:14px;padding:10px 18px;text-align:center;">
                <div style="font-size:8px;color:${accent};font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">RACHA</div>
                <div style="font-size:30px;font-weight:900;color:#f1f5f9;line-height:1.1;">${streak}<span style="font-size:16px;"> ${streakEmoji}</span></div>
                <div style="font-size:9px;color:#475569;">días</div>
              </div>
            </td>
          </tr></table>
        </div>
        <!-- Greeting -->
        <div style="padding:20px 28px 0;">
          <div style="font-size:28px;font-weight:800;color:#f8fafc;letter-spacing:-.5px;">${greeting}, ${name} 👋</div>
          <div style="font-size:13px;color:#64748b;margin-top:4px;text-transform:capitalize;">${dateStr}</div>
          <div style="display:inline-block;margin-top:10px;background:${accentDim}.08);border:1px solid ${accentDim}.2);border-radius:99px;padding:5px 14px;font-size:12px;color:${accent};font-weight:600;">${motivationalMsg}</div>
        </div>
        <!-- XP bar -->
        <div style="padding:20px 28px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="64" valign="middle">
              <div style="width:56px;height:56px;background:${accentDim}.12);border:1.5px solid ${accentDim}.3);border-radius:16px;text-align:center;padding-top:8px;">
                <div style="font-size:8px;color:${accent};font-weight:800;letter-spacing:1px;">NIV</div>
                <div style="font-size:26px;font-weight:900;color:${accent};line-height:1;">${stats.level||1}</div>
              </div>
            </td>
            <td style="padding-left:14px;" valign="middle">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#475569;margin-bottom:7px;">
                <span style="color:#94a3b8;font-weight:600;">${stats.xp||0} XP total</span>
                <span style="color:#475569;">${200 - xpInLevel} XP → nivel ${(stats.level||1)+1}</span>
              </div>
              <div style="height:7px;background:rgba(255,255,255,.05);border-radius:99px;overflow:hidden;">
                <div style="height:100%;width:${xpPct}%;background:linear-gradient(90deg,${accent},${accentDim}.6));border-radius:99px;"></div>
              </div>
              <div style="font-size:10px;color:#334155;margin-top:5px;">${xpInLevel} / 200 XP en nivel actual</div>
            </td>
          </tr></table>
        </div>
      </td>
    </tr>
  </table>

  <!-- ══ QUICK STATS 3-COL ══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
    <td width="33%" style="padding-right:6px;">
      <div style="background:#0d0d1f;border:1px solid rgba(248,113,113,.2);border-top:2px solid #f87171;border-radius:16px;padding:16px 12px;text-align:center;">
        <div style="font-size:26px;margin-bottom:6px;">🚨</div>
        <div style="font-size:24px;font-weight:900;color:#f87171;">${alta.length}</div>
        <div style="font-size:10px;color:#475569;margin-top:3px;font-weight:600;letter-spacing:.5px;">URGENTES</div>
      </div>
    </td>
    <td width="33%" style="padding:0 3px;">
      <div style="background:#0d0d1f;border:1px solid rgba(129,140,248,.2);border-top:2px solid #818cf8;border-radius:16px;padding:16px 12px;text-align:center;">
        <div style="font-size:26px;margin-bottom:6px;">📅</div>
        <div style="font-size:24px;font-weight:900;color:#818cf8;">${events?.length||0}</div>
        <div style="font-size:10px;color:#475569;margin-top:3px;font-weight:600;letter-spacing:.5px;">EVENTOS HOY</div>
      </div>
    </td>
    <td width="33%" style="padding-left:6px;">
      <div style="background:#0d0d1f;border:1px solid ${accentDim}.2);border-top:2px solid ${accent};border-radius:16px;padding:16px 12px;text-align:center;">
        <div style="font-size:26px;margin-bottom:6px;">🔥</div>
        <div style="font-size:24px;font-weight:900;color:${habPct===100?"#34d399":"#f59e0b"};">${habPct??0}%</div>
        <div style="font-size:10px;color:#475569;margin-top:3px;font-weight:600;letter-spacing:.5px;">HÁBITOS</div>
      </div>
    </td>
  </tr></table>

  ${sections.habits && myHabits.length ? `
  <!-- ══ HÁBITOS ══ -->
  <div style="background:#0d0d1f;border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:22px 24px;margin-bottom:14px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:30px;height:30px;background:rgba(245,158,11,.12);border-radius:10px;text-align:center;line-height:30px;font-size:15px;">🔥</div>
        <span style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Hábitos de hoy</span>
      </div></td>
      ${habPct!==null?`<td align="right"><span style="font-size:12px;font-weight:700;color:${habPct===100?"#34d399":"#f59e0b"};background:${habPct===100?"rgba(52,211,153,.1)":"rgba(245,158,11,.1)"};border:1px solid ${habPct===100?"rgba(52,211,153,.25)":"rgba(245,158,11,.25)"};border-radius:99px;padding:4px 12px;">${doneToday.length}/${myHabits.length} · ${habPct}%</span></td>`:""}
    </tr></table>
    <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px;">
      ${myHabits.map(h => {
        const done = doneToday.some(d => d.id === h.id);
        return `<span style="display:inline-block;background:${done ? h.color+"1a" : "rgba(255,255,255,.03)"};border:1px solid ${done ? h.color+"50" : "rgba(255,255,255,.07)"};border-radius:99px;padding:5px 14px;font-size:12px;color:${done ? h.color : "#475569"};font-weight:${done ? 700 : 400};">${h.icon} ${h.name}${done ? " ✓" : ""}</span>`;
      }).join(" ")}
    </div>
    ${habPct!==null ? `<div style="margin-top:14px;height:6px;background:rgba(255,255,255,.05);border-radius:99px;overflow:hidden;"><div style="height:100%;width:${habPct}%;background:linear-gradient(90deg,${habPct===100?"#34d399,#6ee7b7":"#f59e0b,#fbbf24"});border-radius:99px;"></div></div>` : ""}
  </div>` : ""}

  ${sections.events ? `
  <!-- ══ AGENDA ══ -->
  <div style="background:#0d0d1f;border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:22px 24px;margin-bottom:14px;">
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
      <div style="width:30px;height:30px;background:rgba(129,140,248,.12);border-radius:10px;text-align:center;line-height:30px;font-size:15px;">📅</div>
      <span style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Agenda de hoy</span>
    </div>
    ${events?.length ? events.map(e => `
    <div style="display:flex;gap:12px;padding:11px 14px;background:rgba(129,140,248,.05);border:1px solid rgba(129,140,248,.1);border-radius:13px;margin-bottom:8px;align-items:center;">
      <div style="width:38px;height:38px;min-width:38px;background:rgba(129,140,248,.15);border-radius:11px;text-align:center;line-height:38px;font-size:14px;font-weight:700;color:#818cf8;">${e.time ? (e.time.split(":")[0]||"?") : "📅"}</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:#e2e8f0;">${e.title}</div>
        ${e.time ? `<div style="font-size:11px;color:#475569;margin-top:2px;">⏰ ${e.time}</div>` : ""}
      </div>
    </div>`).join("") :
    `<div style="text-align:center;padding:14px 0;color:#334155;font-size:13px;">Día libre hoy ✨</div>`}
  </div>` : ""}

  ${sections.tasks ? `
  <!-- ══ TAREAS URGENTES ══ -->
  <div style="background:#0d0d1f;border:1px solid rgba(248,113,113,.12);border-radius:20px;padding:22px 24px;margin-bottom:14px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:30px;height:30px;background:rgba(248,113,113,.12);border-radius:10px;text-align:center;line-height:30px;font-size:15px;">🚨</div>
        <span style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Tareas prioritarias</span>
      </div></td>
      ${alta.length ? `<td align="right"><span style="font-size:11px;font-weight:700;color:#f87171;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.2);border-radius:99px;padding:3px 10px;">${alta.length} pendientes</span></td>` : ""}
    </tr></table>
    <div style="margin-top:14px;">
    ${alta.length ? alta.slice(0, 5).map(t => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(248,113,113,.04);border:1px solid rgba(248,113,113,.1);border-radius:12px;margin-bottom:7px;">
      <div style="width:7px;height:7px;min-width:7px;background:#f87171;border-radius:50%;"></div>
      <div style="flex:1;">
        <div style="font-size:13px;color:#e2e8f0;font-weight:500;">${t.title}</div>
        ${t.deadline ? `<div style="font-size:11px;color:#f87171;margin-top:2px;font-weight:600;">Vence ${t.deadline}</div>` : ""}
      </div>
    </div>`).join("") :
    `<div style="text-align:center;padding:14px 0;color:#334155;font-size:13px;">Sin urgentes ✅ ¡Al día!</div>`}
    </div>
  </div>` : ""}

  ${upcoming.length ? `
  <!-- ══ PRÓXIMAS ENTREGAS ══ -->
  <div style="background:#0d0d1f;border:1px solid rgba(168,85,247,.12);border-radius:20px;padding:22px 24px;margin-bottom:14px;">
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
      <div style="width:30px;height:30px;background:rgba(168,85,247,.12);border-radius:10px;text-align:center;line-height:30px;font-size:15px;">📆</div>
      <span style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Próximos 7 días</span>
    </div>
    ${upcoming.map(u => {
      const daysLeft = Math.ceil((new Date(u.date + "T12:00").getTime() - new Date().getTime()) / (1000*60*60*24));
      const uc = daysLeft <= 1 ? "#ef4444" : daysLeft <= 3 ? "#f97316" : "#a855f7";
      const ub = daysLeft <= 1 ? "rgba(239,68,68,.07)" : daysLeft <= 3 ? "rgba(249,115,22,.07)" : "rgba(168,85,247,.07)";
      const label = daysLeft === 0 ? "HOY" : daysLeft === 1 ? "Mañana" : `En ${daysLeft}d`;
      return `<div style="display:flex;align-items:center;gap:11px;padding:10px 14px;background:${ub};border:1px solid ${uc}22;border-radius:12px;margin-bottom:7px;">
        <span style="font-size:16px;">${u.icon}</span>
        <div style="flex:1;">
          <div style="font-size:13px;color:#e2e8f0;font-weight:500;">${u.label}</div>
          <div style="font-size:11px;color:${uc};margin-top:2px;font-weight:700;">${label} · ${u.date}</div>
        </div>
      </div>`;
    }).join("")}
  </div>` : ""}

  ${sections.finance ? `
  <!-- ══ FINANZAS ══ -->
  <div style="background:#0d0d1f;border:1px solid rgba(52,211,153,.1);border-radius:20px;padding:22px 24px;margin-bottom:14px;">
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
      <div style="width:30px;height:30px;background:rgba(52,211,153,.12);border-radius:10px;text-align:center;line-height:30px;font-size:15px;">💰</div>
      <span style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Finanzas del mes</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="33%" style="padding-right:5px;"><div style="background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.18);border-radius:14px;padding:14px;text-align:center;">
        <div style="font-size:9px;color:#4ade80;font-weight:800;letter-spacing:1px;margin-bottom:4px;">INGRESOS</div>
        <div style="font-size:15px;font-weight:800;color:#4ade80;">${money(ingresos)}</div>
      </div></td>
      <td width="33%" style="padding:0 2.5px;"><div style="background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.18);border-radius:14px;padding:14px;text-align:center;">
        <div style="font-size:9px;color:#f87171;font-weight:800;letter-spacing:1px;margin-bottom:4px;">GASTOS</div>
        <div style="font-size:15px;font-weight:800;color:#f87171;">${money(gastos)}</div>
      </div></td>
      <td width="33%" style="padding-left:5px;"><div style="background:${balance>=0?"rgba(74,222,128,.07)":"rgba(248,113,113,.07)"};border:1px solid ${balance>=0?"rgba(74,222,128,.18)":"rgba(248,113,113,.18)"};border-radius:14px;padding:14px;text-align:center;">
        <div style="font-size:9px;color:${balance>=0?"#4ade80":"#f87171"};font-weight:800;letter-spacing:1px;margin-bottom:4px;">BALANCE</div>
        <div style="font-size:15px;font-weight:800;color:${balance>=0?"#4ade80":"#f87171"};">${money(balance)}</div>
      </div></td>
    </tr></table>
    ${lastTxs.length ? `<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.05);padding-top:12px;">${lastTxs.map(tx => {
      const isIng = tx.type === "ingreso";
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:6px;height:6px;border-radius:50%;background:${isIng?"#4ade80":"#f87171"};"></div>
          <span style="font-size:12px;color:#64748b;">${tx.description}</span>
        </div>
        <span style="font-size:13px;font-weight:700;color:${isIng?"#4ade80":"#f87171"};">${isIng?"+":"-"}${money(tx.amount)}</span>
      </div>`;
    }).join("")}</div>` : ""}
  </div>` : ""}

  <!-- ══ FOOTER ══ -->
  <div style="text-align:center;padding:24px 0 8px;">
    <div style="display:inline-block;width:36px;height:36px;background:${accentDim}.12);border:1px solid ${accentDim}.25);border-radius:12px;line-height:36px;font-size:18px;margin-bottom:12px;">🧠</div>
    <div style="font-size:17px;font-weight:900;color:#e2e8f0;letter-spacing:-.3px;">2do<span style="color:${accent}">.</span>cerebro</div>
    <div style="font-size:11px;color:#1e293b;margin-top:6px;line-height:1.7;">Generado automáticamente para ${name}<br/>Lima, Perú · Sistema Personal</div>
  </div>

</div>
</body>
</html>`;


Deno.serve(async (req) => {
  // force=1 via query param, header, or body
  const url = new URL(req.url);
  let force = url.searchParams.get("force") === "1";
  if (!force) force = req.headers.get("x-force") === "1";
  if (!force) {
    try {
      const body = await req.json();
      if (body?.force) force = true;
    } catch {}
  }

  const nowPE = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
  const todayDow   = nowPE.getDay();
  const currentHour = nowPE.getHours();
  const today = nowPE.toISOString().slice(0, 10);

  const results: string[] = [];

  for (const u of USERS) {
    // Load this user's report config from a Supabase settings table, or use defaults
    const { data: cfgRow } = await supabase
      .from("report_config")
      .select("*")
      .eq("uid", u.id)
      .single();

    const cfg = {
      enabled:  cfgRow?.enabled  ?? true,
      days:     cfgRow?.days     ?? [0,1,2,3,4,5,6],
      email:    cfgRow?.email    || u.email,
      sections: cfgRow?.sections ?? { tasks:true, habits:true, events:true, academic:true, finance:false },
    };

    if (!cfg.enabled) { results.push(`${u.name}: disabled`); continue; }
    if (!cfg.days.includes(todayDow)) { results.push(`${u.name}: not today (dow=${todayDow})`); continue; }

    // Find the first urgent item today: events with time OR tasks due today
    // Determine target send hour = 1h before first item, min 6am fallback
    const { data: todayEvents } = await supabase
      .from("events")
      .select("*")
      .eq("date", today)
      .or(`uid.eq.${u.id},shared.eq.true`)
      .not("time", "is", null)
      .neq("time", "")
      .order("time");

    const { data: urgentTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("deadline", today)
      .neq("status", "completada")
      .or(`uid.eq.${u.id},shared.eq.true`);

    // Parse earliest hour from events
    let earliestHour = 7; // fallback
    if (todayEvents && todayEvents.length > 0) {
      const firstTime = todayEvents[0].time; // "HH:MM" format
      const h = parseInt(firstTime.split(":")[0]);
      if (!isNaN(h)) earliestHour = Math.max(6, h - 1);
    } else if (urgentTasks && urgentTasks.length > 0) {
      // tasks due today with no time → send at 6am
      earliestHour = 6;
    }

    const sendHour = earliestHour;

    // Only send if current hour matches send hour (cron runs every hour)
    if (!force && currentHour !== sendHour) {
      results.push(`${u.name}: not time yet (now=${currentHour}, send=${sendHour})`);
      continue;
    }

    // Check we haven't already sent today (idempotency) — skip if force
    if (!force) {
      const { data: sent } = await supabase
        .from("report_sent_log")
        .select("id")
        .eq("uid", u.id)
        .eq("date", today)
        .single();
      if (sent) { results.push(`${u.name}: already sent today`); continue; }
    }

    const html = await buildReport(u.id, u.name, cfg.sections);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "2do.cerebro <onboarding@resend.dev>",
        to: cfg.email,
        subject: `☀️ Tu reporte del ${nowPE.toLocaleDateString("es-PE", { day:"numeric", month:"long" })}`,
        html,
      }),
    });

    if (res.ok) {
      // Log that we sent today
      await supabase.from("report_sent_log").insert({ uid: u.id, date: today });
      results.push(`${u.name}: sent to ${cfg.email}`);
    } else {
      const err = await res.text();
      results.push(`${u.name}: error ${err}`);
    }
  }

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

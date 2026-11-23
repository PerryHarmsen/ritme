'use strict';
/* =========================================================
   Ritme — gewoontes, taken, agenda, 60-dagen-uitdaging, coach
   Alles staat lokaal op je toestel (localStorage).
   ========================================================= */

const OPSLAG = 'ritme-v1';
const KLEUREN = ['#C6FF3D', '#FF7A1A', '#4DA3FF', '#B57BFF', '#FF4D8D', '#2EE6C5', '#FFC83D'];
const WD = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const WD_LANG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const WEEKORDE = [1, 2, 3, 4, 5, 6, 0];
const MOODS = ['😩', '😕', '😐', '🙂', '🤩'];
const TITELS = ['Starter', 'Opstarter', 'Volhouder', 'Doorzetter', 'Machine', 'Onbreekbaar', 'Legende'];
const SJABLONEN = [
  { naam: '2 liter water', emoji: '💧' }, { naam: '30 min bewegen', emoji: '🏃' },
  { naam: '20 min lezen', emoji: '📚' }, { naam: '1 uur coderen', emoji: '💻' },
  { naam: '10 min mediteren', emoji: '🧘' }, { naam: 'Geen scherm na 22:30', emoji: '📵' },
  { naam: 'Om 23:30 in bed', emoji: '😴' }, { naam: 'Gezond ontbijt', emoji: '🥣' },
  { naam: 'Kamer opruimen', emoji: '🧹' }, { naam: 'Dagplanning maken', emoji: '🗒️' }
];

/* ---------- Kleine hulpjes ---------- */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const vandaag = () => ymd(new Date());
const verschil = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nuHM = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
function maandagVan(dag) { const d = parse(dag); return addDays(dag, -((d.getDay() + 6) % 7)); }
function dagLabel(dag, kort) {
  const t = vandaag(), v = verschil(t, dag);
  if (v === 0) return 'Vandaag';
  if (v === 1) return 'Morgen';
  if (v === -1) return 'Gisteren';
  const d = parse(dag);
  return kort ? `${WD[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()].slice(0, 3)}` : `${WD_LANG[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()]}`;
}

/* ---------- Iconen ---------- */
const PADEN = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  skip: '<path d="M4 15a7 7 0 0 1 13-4"/><path d="M18 5v6h-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.2-5.6-3.6-7.5-.4 2-1.6 3.2-2.9 3.6C12.9 7.5 11.2 4.3 8.5 2.5 8.7 6 5 8.6 5 14.5 5 19 8 22 12 22z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${PADEN[n]}</svg>`;
function ring(pct, size, dikte, kleur) {
  const r = (size - dikte) / 2, c = 2 * Math.PI * r, p = pct == null ? 0 : Math.max(0, Math.min(1, pct));
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${dikte}"/>` +
    (p > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${kleur || 'var(--accent)'}" stroke-width="${dikte}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dashoffset .5s"/>` : '') + '</svg>';
}

/* ---------- Opslag ---------- */
function nieuweState() {
  return {
    versie: 1, gewoontes: [], log: {}, taken: [], dagboek: {}, uitdaging: null, geschiedenis: [],
    coach: [], gemeld: {}, lv: 1, inst: { ai: 'lokaal', meldingen: false, avond: '21:00' }
  };
}
function laad() {
  try {
    const s = JSON.parse(localStorage.getItem(OPSLAG));
    if (s && s.versie) { const st = Object.assign(nieuweState(), s); st.inst = Object.assign(nieuweState().inst, s.inst); return st; }
  } catch (e) { /* lege start */ }
  return nieuweState();
}
let state = laad();
function bewaar() { try { localStorage.setItem(OPSLAG, JSON.stringify(state)); } catch (e) { toast('Opslaan mislukt'); } }

const ui = { tab: 'vandaag', dag: vandaag(), maand: vandaag().slice(0, 7), agendaDag: vandaag(), coachBezig: false };

/* =========================================================
   Logica
   ========================================================= */
const actieveGewoontes = () => state.gewoontes.filter(h => !h.archief);
const gewoonte = id => state.gewoontes.find(h => h.id === id);
function gepland(h, dag) { return !h.archief && dag >= h.aangemaakt && h.dagen.includes(parse(dag).getDay()); }
// klaar | skip | gemist | open | null (niet gepland)
function status(h, dag) {
  const s = state.log[dag]?.[h.id];
  if (s) return s;
  if (!gepland(h, dag)) return null;
  return dag < vandaag() ? 'gemist' : 'open';
}
function zet(h, dag, s) {
  state.log[dag] = state.log[dag] || {};
  if (s) state.log[dag][h.id] = s; else delete state.log[dag][h.id];
  if (!Object.keys(state.log[dag]).length) delete state.log[dag];
}
function dagVoortgang(dag) {
  const hs = actieveGewoontes().filter(h => gepland(h, dag));
  let klaar = 0, skip = 0, mis = 0;
  hs.forEach(h => { const s = status(h, dag); if (s === 'klaar') klaar++; else if (s === 'skip') skip++; else if (s === 'gemist') mis++; });
  const totaal = hs.length - skip;
  return { klaar, skip, mis, totaal, aantal: hs.length, open: totaal - klaar - mis, pct: totaal ? klaar / totaal : null };
}
const perfect = v => v.totaal > 0 && v.klaar === v.totaal;

// Streak: gemist breekt, overslaan en niet-geplande dagen tellen niet mee maar breken ook niet.
function streak(h) {
  let d = vandaag(), n = 0;
  for (let i = 0; i < 1500 && d >= h.aangemaakt; i++, d = addDays(d, -1)) {
    const s = status(h, d);
    if (s === 'klaar') n++;
    else if (s === 'gemist') break;
  }
  return n;
}
function besteStreak(h) {
  let d = h.aangemaakt, n = 0, best = 0; const t = vandaag();
  for (let i = 0; i < 1500 && d <= t; i++, d = addDays(d, 1)) {
    const s = status(h, d);
    if (s === 'klaar') best = Math.max(best, ++n);
    else if (s === 'gemist') n = 0;
  }
  return best;
}
function score(h, dagen) {
  let k = 0, tot = 0; const t = vandaag();
  for (let i = 0; i < dagen; i++) {
    const d = addDays(t, -i), s = status(h, d);
    if (s === 'klaar') { k++; tot++; } else if (s === 'gemist') tot++;
  }
  return tot ? k / tot : null;
}

/* Taken */
function takenVoorDag(dag) {
  const t = vandaag();
  return state.taken.filter(k =>
    k.datum === dag ||
    (dag === t && k.datum && k.datum < t && !k.klaar) ||
    (k.klaar && k.klaarOp === dag && k.datum !== dag && !(dag === t && k.datum > t))
  ).sort((a, b) => (a.klaar - b.klaar) || ((a.datum || '') < (b.datum || '') ? -1 : (a.datum || '') > (b.datum || '') ? 1 : 0) || ((b.prio || 0) - (a.prio || 0)) || ((a.tijd || '99') < (b.tijd || '99') ? -1 : 1));
}

/* XP en levels — altijd berekend uit je echte data */
function xpTotaal() {
  let xp = 0;
  for (const dag in state.log) {
    let k = 0;
    for (const id in state.log[dag]) if (state.log[dag][id] === 'klaar' && gewoonte(id)) { xp += 10; k++; }
    if (k && perfect(dagVoortgang(dag))) xp += 25;
  }
  state.taken.forEach(t => { if (t.klaar) xp += 5; });
  state.geschiedenis.forEach(g => { if (g.voltooid) xp += 500; });
  return xp;
}
function level(xp) {
  let lv = 1, nodig = 100, rest = xp;
  while (rest >= nodig) { rest -= nodig; lv++; nodig = Math.round(nodig * 1.25); }
  return { lv, rest, nodig, titel: TITELS[Math.min(Math.floor((lv - 1) / 3), TITELS.length - 1)] };
}
function checkLevelUp() {
  const l = level(xpTotaal());
  if (l.lv > state.lv) { state.lv = l.lv; bewaar(); setTimeout(() => { confetti(70); toast(`⚡ Level ${l.lv} — ${l.titel}!`); }, 250); }
  else if (l.lv < state.lv) { state.lv = l.lv; bewaar(); }
}

/* Uitdaging: elke dag moeten alle uitdagings-gewoontes klaar zijn.
   Overslaan of missen kost een joker. Geen jokers meer + nog een misser = uitdaging gebroken. */
function uitdagingStatus() {
  const u = state.uitdaging; if (!u) return null;
  const t = vandaag();
  const hs = u.gewoontes.map(gewoonte).filter(Boolean);
  let jokers = u.jokers, gebroken = null, gehaald = 0;
  const dagen = [];
  for (let i = 0; i < u.duur; i++) {
    const dag = addDays(u.start, i);
    let st;
    if (gebroken != null) st = dag > t ? 'toekomst' : 'na';
    else if (dag > t) st = 'toekomst';
    else {
      const ss = hs.map(h => state.log[dag]?.[h.id] || (dag < t ? 'gemist' : 'open'));
      if (ss.every(s => s === 'klaar')) st = 'ok';
      else if (dag === t && ss.includes('open') && !ss.includes('gemist')) st = 'bezig';
      else if (jokers > 0) { jokers--; st = 'joker'; }
      else { st = 'mis'; gebroken = i; }
    }
    if (st === 'ok' || st === 'joker') gehaald++;
    dagen.push({ dag, st });
  }
  const dagNr = Math.min(Math.max(verschil(u.start, t) + 1, 0), u.duur);
  const voltooid = gebroken == null && verschil(u.start, t) >= u.duur - 1 && dagen[u.duur - 1].st !== 'bezig' && dagen[u.duur - 1].st !== 'toekomst';
  return { u, hs, dagen, jokersOver: jokers, gebroken, gehaald, dagNr, voltooid, gestart: t >= u.start };
}

/* =========================================================
   Weergave
   ========================================================= */
function render() {
  renderTop();
  const v = $('#view');
  v.innerHTML = { vandaag: viewVandaag, agenda: viewAgenda, uitdaging: viewUitdaging, stats: viewStats, coach: viewCoach, logboek: viewLogboek }[ui.tab]();
  v.classList.remove('view-in'); void v.offsetWidth; v.classList.add('view-in');
  renderNav();
}
function renderTop() {
  const l = level(xpTotaal());
  $('#top').innerHTML = `
    <div class="logo"><i></i>RITME</div>
    <button class="lvl" data-act="tab" data-tab="stats" title="${l.titel}: ${l.rest}/${l.nodig} XP naar level ${l.lv + 1}">
      <b>LV ${l.lv}</b><span class="xpbar"><span style="width:${(l.rest / l.nodig) * 100}%"></span></span><small>${l.titel}</small>
    </button>
    <button class="ibtn" data-act="tab" data-tab="logboek" title="Logboek">${ic('book')}</button>
    <button class="ibtn" data-act="instellingen" title="Instellingen">${ic('gear')}</button>`;
}
function renderNav() {
  const tabs = [['vandaag', 'sun', 'Vandaag'], ['agenda', 'cal', 'Agenda'], ['uitdaging', 'flame', 'Uitdaging'], ['stats', 'chart', 'Stats'], ['coach', 'bolt', 'Coach']];
  $('#nav').innerHTML = `<div class="bar">${tabs.map(([k, i, n]) => `<button class="${ui.tab === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${ic(i)}${n}</button>`).join('')}</div>`;
}

/* ---------- Vandaag ---------- */
function motivatie(v, dag) {
  const t = vandaag(), uur = new Date().getHours();
  if (!v.aantal) return 'Geen gewoontes gepland. Voeg er een toe en begin je reeks.';
  if (dag < t) return perfect(v) ? 'Deze dag was perfect. 💪' : `${v.klaar} van ${v.totaal} gehaald op deze dag.`;
  if (dag > t) return 'Vooruit plannen. Rustdag nodig? Sla nu al over.';
  if (perfect(v)) return 'Perfecte dag. Niemand houdt je tegen. 🔥';
  if (v.klaar === 0 && uur < 12) return 'Nieuwe dag, schone lei. Pak de eerste meteen.';
  if (uur >= 20) return `Nog ${v.open} te gaan. Juist nu niet opgeven.`;
  if (v.pct >= .5) return `Over de helft. Nog ${v.open} en je dag is perfect.`;
  return `${v.open} gewoontes wachten op je. Eén tegelijk.`;
}
function viewVandaag() {
  const t = vandaag(), dag = ui.dag;
  const v = dagVoortgang(dag);
  const hs = actieveGewoontes().filter(h => gepland(h, dag));
  const taken = takenVoorDag(dag);
  const open = taken.filter(k => !k.klaar), klaar = taken.filter(k => k.klaar);
  const maxStreak = Math.max(0, ...actieveGewoontes().map(streak));
  const us = uitdagingStatus();

  // Datumstrook
  const ma = maandagVan(dag);
  const strip = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(ma, i), dv = d <= t ? dagVoortgang(d) : null;
    return `<button class="dag ${d === t ? 'vandaag' : ''} ${d === dag ? 'sel' : ''}" data-act="kiesdag" data-dag="${d}">
      <small>${WD[parse(d).getDay()]}</small><span class="n">${dv ? ring(dv.pct, 30, 3, perfect(dv) ? 'var(--accent)' : 'var(--fire)') : ''}${parse(d).getDate()}</span></button>`;
  }).join('');

  const gisteren = addDays(t, -1);
  const habHtml = hs.length ? hs.map(h => habRij(h, dag, dag === t && status(h, gisteren) === 'gemist')).join('') :
    actieveGewoontes().length ? `<div class="leeg">Geen gewoontes gepland op ${dagLabel(dag).toLowerCase()}.</div>` : starterKaart();

  const log = state.dagboek[dag] || {};
  return `
  <div class="strip"><button class="nav" data-act="week" data-n="-7">${ic('left')}</button><div class="days">${strip}</div><button class="nav" data-act="week" data-n="7">${ic('right')}</button></div>
  ${dag !== t ? `<div class="terug"><span>Je bekijkt ${dagLabel(dag)}</span><button class="btn sm" data-act="kiesdag" data-dag="${t}">Naar vandaag</button></div>` : ''}
  <div class="card hero" style="margin-top:12px">
    <div class="big">${ring(v.pct, 96, 10, perfect(v) ? 'var(--accent)' : 'var(--fire)')}<div class="pct"><div>${v.pct == null ? '–' : Math.round(v.pct * 100) + '%'}<small>${v.totaal ? v.klaar + '/' + v.totaal : ''}</small></div></div></div>
    <div class="grow">
      <h1>${dagLabel(dag)}</h1>
      <p>${motivatie(v, dag)}</p>
      <div class="stats">
        <span style="color:var(--fire)">${ic('flame')}${maxStreak} beste reeks</span>
        ${us && us.gestart && us.gebroken == null && !us.voltooid ? `<span style="color:var(--gold)">${ic('trophy')}dag ${us.dagNr}/${us.u.duur}</span>` : ''}
        ${open.length ? `<span class="muted">${open.length} ${open.length === 1 ? 'taak' : 'taken'} open</span>` : ''}
      </div>
    </div>
  </div>

  <div class="sec"><h2>Gewoontes</h2><span class="cnt">${v.klaar}/${v.totaal}</span><button class="btn sm r" data-act="nieuwegewoonte">${ic('plus')}Nieuw</button></div>
  ${habHtml}

  <div class="sec"><h2>Taken</h2><span class="cnt">${open.length} open</span><button class="btn sm r" data-act="nieuwetaak">${ic('plus')}Uitgebreid</button></div>
  <form class="add" data-form="snel"><input name="titel" placeholder="Taak voor ${dagLabel(dag).toLowerCase()}…" autocomplete="off" maxlength="140"><button class="btn pri">${ic('plus')}</button></form>
  ${open.map(k => taakRij(k, dag)).join('') || `<div class="leeg">${klaar.length ? 'Alles af. Sterk bezig. ✅' : 'Nog geen taken voor deze dag.'}</div>`}
  ${klaar.length ? `<details class="klaarlijst"><summary>✓ ${klaar.length} afgerond</summary>${klaar.map(k => taakRij(k, dag)).join('')}</details>` : ''}
  ${dag === t ? zonderDatum() : ''}

  <div class="sec"><h2>Logboek</h2><span class="cnt">${dagLabel(dag)}</span></div>
  <div class="card">
    <div class="moods">${MOODS.map((m, i) => `<button class="${log.stemming === i + 1 ? 'on' : ''}" data-act="mood" data-v="${i + 1}" title="Stemming ${i + 1}/5">${m}</button>`).join('')}</div>
    <textarea data-inp="dagboek" placeholder="Hoe ging het? Wat ging goed, wat niet, wat neem je mee naar morgen?">${esc(log.tekst || '')}</textarea>
  </div>`;
}
function starterKaart() {
  return `<div class="card"><h3 style="font-size:17px">Start je eerste reeks</h3><p class="muted" style="margin:6px 0 12px;font-size:13.5px">Tik op een voorbeeld om het meteen toe te voegen, of maak je eigen gewoonte.</p>
    <div class="chips">${SJABLONEN.map((s, i) => `<button class="chip" data-act="sjabloon" data-i="${i}">${s.emoji} ${esc(s.naam)}</button>`).join('')}</div></div>`;
}
function habRij(h, dag, gisterenGemist) {
  const s = status(h, dag), t = vandaag(), toekomst = dag > t, st = streak(h);
  return `<div class="hab st-${s}" style="--c:${h.kleur}">
    <div class="hab-emo">${esc(h.emoji)}</div>
    <div class="hab-main" data-act="bewerkgewoonte" data-id="${h.id}">
      <div class="hab-naam">${esc(h.naam)}</div>
      <div class="hab-meta">
        ${st ? `<span class="fl">${ic('flame')}${st}</span>` : '<span class="dim">nog geen reeks</span>'}
        ${h.herinnering ? `<span>⏰ ${h.herinnering}</span>` : ''}
        ${s === 'skip' ? '<span class="tag gold">overgeslagen · morgen weer</span>' : ''}
        ${s === 'gemist' ? '<span class="tag red">gemist</span>' : ''}
        ${gisterenGemist && s === 'open' ? '<span class="tag red">gisteren gemist</span>' : ''}
      </div>
    </div>
    <div class="hab-acts">
      <button class="sk" data-act="hab" data-s="skip" data-id="${h.id}" title="Overslaan (breekt je reeks niet)">${ic('skip')}</button>
      <button class="mi" data-act="hab" data-s="gemist" data-id="${h.id}" title="Gemist" ${toekomst ? 'disabled' : ''}>${ic('x')}</button>
      <button class="big" data-act="hab" data-s="klaar" data-id="${h.id}" title="Afvinken" ${toekomst ? 'disabled' : ''}>${ic('check')}</button>
    </div>
  </div>`;
}
function taakRij(k, dag) {
  const t = vandaag(), teLaat = !k.klaar && k.datum && k.datum < t;
  const meta = [
    teLaat ? `<span class="tag red">${verschil(k.datum, t)} ${verschil(k.datum, t) === 1 ? 'dag' : 'dagen'} te laat</span>` : '',
    k.tijd ? `<span>⏰ ${k.tijd}</span>` : '',
    k.prio === 2 ? '<span class="tag red">belangrijk</span>' : k.prio === 1 ? '<span class="tag gold">prio</span>' : '',
    k.verschoven >= 3 ? `<span class="tag fire">${k.verschoven}× verschoven</span>` : k.verschoven ? `<span>${k.verschoven}× verschoven</span>` : '',
    k.datum && k.datum !== dag && !teLaat ? `<span>${dagLabel(k.datum, true)}</span>` : '',
    k.notitie ? '<span>📝</span>' : ''
  ].join('');
  return `<div class="task ${k.klaar ? 'klaar' : ''} ${teLaat ? 'te-laat' : ''} p${k.prio || 0}">
    <button class="chk" data-act="taak" data-id="${k.id}" title="Afvinken">${ic('check')}</button>
    <div class="task-main" data-act="bewerktaak" data-id="${k.id}"><div class="t-titel">${esc(k.titel)}</div><div class="t-meta">${meta}</div></div>
    ${!k.klaar ? `<button class="skipb" data-act="taakskip" data-id="${k.id}" title="Overslaan: naar de volgende dag">${ic('skip')}</button>` : ''}
  </div>`;
}
function zonderDatum() {
  const z = state.taken.filter(k => !k.datum && !k.klaar);
  if (!z.length) return '';
  return `<details class="klaarlijst"><summary>📥 ${z.length} zonder datum</summary>${z.map(k => taakRij(k, null)).join('')}</details>`;
}

/* ---------- Agenda ---------- */
function viewAgenda() {
  const t = vandaag();
  const [y, m] = ui.maand.split('-').map(Number);
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const aantal = new Date(y, m, 0).getDate();
  const us = uitdagingStatus();
  const chalStart = us ? us.u.start : null, chalEind = us ? addDays(us.u.start, us.u.duur - 1) : null;
  let cellen = WEEKORDE.map(d => `<div class="wd">${WD[d]}</div>`).join('');
  for (let i = 0; i < offset; i++) cellen += '<div class="cel leeg"></div>';
  for (let d = 1; d <= aantal; d++) {
    const dag = ymd(new Date(y, m - 1, d));
    const v = dag <= t ? dagVoortgang(dag) : null;
    const tk = state.taken.filter(k => k.datum === dag);
    const dots = tk.slice(0, 4).map(k => `<i class="${k.klaar ? 'k' : dag < t ? 'r' : ''}"></i>`).join('');
    const cls = [v && perfect(v) ? 'perfect' : v && v.pct != null ? 'heat' : '', dag === t ? 'vandaag' : '', dag === ui.agendaDag ? 'sel' : '', chalStart && dag >= chalStart && dag <= chalEind ? 'chal' : ''].join(' ');
    cellen += `<button class="cel ${cls}" style="--h:${v && v.pct != null ? v.pct : 0}" data-act="agendadag" data-dag="${dag}">${d}<span class="dots">${dots}</span></button>`;
  }

  // Gekozen dag
  const ad = ui.agendaDag, av = ad <= t ? dagVoortgang(ad) : null;
  const ahs = actieveGewoontes().filter(h => gepland(h, ad));
  const atk = state.taken.filter(k => k.datum === ad);
  const alog = state.dagboek[ad];
  const detail = `<div class="card dagdetail" style="margin-top:14px">
    <div class="row"><h2 class="grow">${dagLabel(ad)}</h2>${av && av.pct != null ? `<span class="tag ${perfect(av) ? 'lime' : ''}">${Math.round(av.pct * 100)}%</span>` : ''}</div>
    ${ahs.length ? `<div class="mini-hab">${ahs.map(h => { const s = status(h, ad); return `<span class="${s}">${esc(h.emoji)} ${esc(h.naam)}${s === 'klaar' ? ' ✓' : s === 'skip' ? ' ↷' : s === 'gemist' ? ' ✕' : ''}</span>`; }).join('')}</div>` : ''}
    ${atk.map(k => taakRij(k, ad)).join('') || '<div class="muted" style="font-size:13.5px;margin:8px 0">Geen taken op deze dag.</div>'}
    ${alog && (alog.tekst || alog.stemming) ? `<p class="muted" style="font-size:13.5px;margin:10px 0 0">${alog.stemming ? MOODS[alog.stemming - 1] + ' ' : ''}${esc((alog.tekst || '').slice(0, 160))}</p>` : ''}
    <form class="add" data-form="agendataak" style="margin:12px 0 0"><input name="titel" placeholder="Taak toevoegen op ${dagLabel(ad, true).toLowerCase()}…" autocomplete="off" maxlength="140"><button class="btn pri">${ic('plus')}</button></form>
    <button class="btn sm full" style="margin-top:8px" data-act="opendag" data-dag="${ad}">Open deze dag om af te vinken</button>
  </div>`;

  // Binnenkort
  const komend = state.taken.filter(k => !k.klaar && k.datum && k.datum > t && k.datum <= addDays(t, 30)).sort((a, b) => a.datum < b.datum ? -1 : 1);
  const teLaat = state.taken.filter(k => !k.klaar && k.datum && k.datum < t);
  let groepen = '', huidig = '';
  komend.forEach(k => { if (k.datum !== huidig) { huidig = k.datum; groepen += `<div class="groep">${dagLabel(k.datum)}</div>`; } groepen += taakRij(k, k.datum); });

  return `
  <div class="maandkop"><button class="ibtn" data-act="maand" data-n="-1">${ic('left')}</button><h1>${MAANDEN[m - 1]} ${y}</h1><button class="ibtn" data-act="maand" data-n="1">${ic('right')}</button></div>
  <div class="cal">${cellen}</div>
  <div class="legenda"><span><i style="background:var(--accent)"></i>perfect</span><span><i style="background:color-mix(in srgb,var(--accent) 22%,var(--surface))"></i>deels</span><span><i style="background:var(--blue);border-radius:50%"></i>taak</span><span><i style="background:var(--fire);border-radius:50%"></i>uitdaging</span></div>
  ${detail}
  ${teLaat.length ? `<div class="sec"><h2>Achterstallig</h2><span class="cnt">${teLaat.length}</span></div>${teLaat.map(k => taakRij(k, t)).join('')}` : ''}
  <div class="sec"><h2>Komende 30 dagen</h2><span class="cnt">${komend.length}</span></div>
  ${groepen || '<div class="leeg">Niets gepland. Tik op een dag in de kalender om iets toe te voegen.</div>'}`;
}

/* ---------- Uitdaging ---------- */
function viewUitdaging() {
  const us = uitdagingStatus();
  const hist = state.geschiedenis.length ? `<div class="sec"><h2>Eerdere pogingen</h2></div><div class="card">${state.geschiedenis.slice().reverse().map(g => `<div class="lijst-item"><span style="font-size:20px">${g.voltooid ? '🏆' : '💥'}</span><div class="grow"><b>${g.duur} dagen</b> <span class="muted">· gestart ${dagLabel(g.start, true)}</span><div class="muted" style="font-size:12.5px">${g.voltooid ? 'Voltooid!' : `Gebroken na ${g.gehaald} dagen`}</div></div></div>`).join('')}</div>` : '';
  if (!us) {
    const best = state.geschiedenis.reduce((m, g) => Math.max(m, g.gehaald), 0);
    return `<div class="card chal-hero" style="margin-top:8px">
      <div class="lbl">De uitdaging</div>
      <div class="dagnr" style="margin:10px 0">60<small> dagen</small></div>
      <p class="muted" style="max-width:340px;margin:0 auto 18px">Kies je gewoontes. Haal ze <b style="color:var(--text)">elke dag</b>. Mis je te vaak, dan begin je opnieuw. Klaar om te kijken waar je echt van gemaakt bent?</p>
      <button class="btn pri" data-act="startuitdaging">${ic('flame')}Start een uitdaging</button>
      ${best ? `<p class="dim" style="font-size:12.5px;margin:14px 0 0">Je record tot nu toe: ${best} dagen</p>` : ''}
    </div>
    <div class="card"><h3 style="font-size:15px;margin-bottom:8px">Zo werkt het</h3><ul class="regels">
      <li>Elke dag moeten <b>al</b> je uitdagings-gewoontes afgevinkt zijn.</li>
      <li>Een dag overslaan of missen kost een <b style="color:var(--gold)">joker</b>.</li>
      <li>Jokers op en nog een misser? Uitdaging gebroken: opnieuw beginnen.</li>
      <li>Hard-modus: geen jokers. Eén fout en het is voorbij.</li>
      <li>Voltooid = <b style="color:var(--accent)">+500 XP</b> en een trofee.</li></ul></div>${hist}`;
  }
  const { u, hs, dagen, jokersOver, gebroken, gehaald, dagNr, voltooid, gestart } = us;
  const pct = gehaald / u.duur;
  let kop;
  if (voltooid) kop = `<div class="lbl" style="color:var(--accent)">Voltooid</div><div class="dagnr" style="margin:8px 0">🏆</div><h2>${u.duur} dagen. Je hebt het geflikt.</h2><p class="muted">Dit was geen geluk, dit was discipline.</p><button class="btn pri" style="margin-top:12px" data-act="afronduitdaging">Trofee claimen (+500 XP)</button>`;
  else if (gebroken != null) kop = `<div class="lbl" style="color:var(--red)">Gebroken op dag ${gebroken + 1}</div><div class="dagnr" style="margin:8px 0">💥</div><h2>${gehaald} dagen volgehouden.</h2><p class="muted">Vallen mag. Blijven liggen niet. Wat ging er mis op dag ${gebroken + 1}?</p><button class="btn pri" style="margin-top:12px" data-act="herstartuitdaging">${ic('flame')}Opnieuw beginnen</button>`;
  else if (!gestart) kop = `<div class="lbl">Start ${dagLabel(u.start).toLowerCase()}</div><div class="dagnr" style="margin:8px 0">0<small>/${u.duur}</small></div><p class="muted">Rust nog even uit. Morgen begint het echte werk.</p>`;
  else kop = `<div class="lbl">${u.jokers === 0 ? 'Hard-modus' : 'Uitdaging'} · ${u.duur} dagen</div><div class="dagnr" style="margin:8px 0">${dagNr}<small>/${u.duur}</small></div>
    <p class="muted" style="margin:0">${dagen[dagNr - 1]?.st === 'ok' ? 'Vandaag binnen. Morgen weer. ✅' : 'Vandaag nog niet binnen. Ga.'}</p>`;
  return `<div class="card chal-hero" style="margin-top:8px">${kop}
    <div class="pbar"><span style="width:${pct * 100}%"></span></div>
    <div class="row" style="justify-content:space-between;font-size:12.5px"><span class="muted">${gehaald} gehaald</span><span class="muted">${u.duur - gehaald} te gaan</span></div>
    <div class="chal-stats"><div><b style="color:var(--accent)">${gehaald}</b><small>gehaald</small></div><div><b style="color:var(--gold)">${jokersOver}/${u.jokers}</b><small>jokers over</small></div><div><b style="color:var(--fire)">${Math.round(pct * 100)}%</b><small>voortgang</small></div></div>
  </div>
  <div class="card"><div class="grid60" style="${u.duur > 60 ? 'grid-template-columns:repeat(10,1fr)' : ''}">${dagen.map((d, i) => `<div class="${d.st}" title="Dag ${i + 1} · ${dagLabel(d.dag, true)}">${i + 1}</div>`).join('')}</div>
    <div class="legenda"><span><i style="background:var(--accent)"></i>gehaald</span><span><i style="background:var(--gold)"></i>joker</span><span><i style="background:var(--red)"></i>gemist</span><span><i style="border:2px solid var(--fire)"></i>vandaag</span></div></div>
  <div class="sec"><h2>Jouw uitdagings-gewoontes</h2></div>
  ${hs.map(h => habRij(h, vandaag(), false)).join('') || '<div class="leeg">De gekozen gewoontes bestaan niet meer.</div>'}
  <button class="btn sm red" style="margin-top:10px" data-act="stopuitdaging">Uitdaging stoppen</button>
  ${hist}`;
}

/* ---------- Statistiek ---------- */
function viewStats() {
  const t = vandaag(), l = level(xpTotaal()), hs = actieveGewoontes();
  let perfecteDagen = 0, somPct = 0, n = 0;
  for (let i = 0; i < 30; i++) { const v = dagVoortgang(addDays(t, -i)); if (v.pct != null) { somPct += v.pct; n++; } if (perfect(v)) perfecteDagen++; }
  const record = Math.max(0, ...hs.map(besteStreak));
  const bars = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(t, i - 13), v = dagVoortgang(d), p = v.pct ?? 0;
    return `<div class="b ${d === t ? 'nu' : ''}"><em>${Math.round(p * 100)}%</em><span class="${p < .2 ? 'laag' : p < 1 ? 'mid' : ''}" style="height:${Math.max(p * 100, 3)}%"></span><small>${WD[parse(d).getDay()].slice(0, 2)}</small></div>`;
  }).join('');
  // Per weekdag (laatste 8 weken)
  const wk = {}; WEEKORDE.forEach(w => wk[w] = { k: 0, t: 0 });
  for (let i = 0; i < 56; i++) { const d = addDays(t, -i), v = dagVoortgang(d); wk[parse(d).getDay()].k += v.klaar; wk[parse(d).getDay()].t += v.totaal; }
  const wbars = WEEKORDE.map(w => { const p = wk[w].t ? wk[w].k / wk[w].t : 0; return `<div class="b"><em>${Math.round(p * 100)}%</em><span class="${p < .5 ? 'laag' : p < .8 ? 'mid' : ''}" style="height:${Math.max(p * 100, 3)}%"></span><small>${WD[w]}</small></div>`; }).join('');
  // Taken
  const weekStart = maandagVan(t);
  const takenWeek = state.taken.filter(k => k.klaar && k.klaarOp >= weekStart).length;
  const achter = state.taken.filter(k => !k.klaar && k.datum && k.datum < t).length;
  const meestVerschoven = state.taken.filter(k => !k.klaar && k.verschoven >= 2).sort((a, b) => b.verschoven - a.verschoven).slice(0, 3);

  const habKaarten = hs.map(h => {
    const cells = [];
    const start = addDays(maandagVan(t), -77);
    for (let i = 0; i < 84; i++) { const d = addDays(start, i); const s = d > t ? 'x' : (status(h, d) || ''); cells.push(`<i class="${s}" title="${dagLabel(d, true)}"></i>`); }
    const sc = score(h, 30);
    return `<div class="card" style="--c:${h.kleur}"><div class="habstat"><div class="hab-emo">${esc(h.emoji)}</div><div class="grow">
      <b>${esc(h.naam)}</b>
      <div class="nums"><span><b style="color:var(--fire)">${streak(h)}</b>reeks</span><span><b>${besteStreak(h)}</b>record</span><span><b>${sc == null ? '–' : Math.round(sc * 100) + '%'}</b>30 dagen</span></div>
      <div class="heat">${cells.join('')}</div></div></div></div>`;
  }).join('');

  return `
  <div class="tiles" style="margin-top:8px">
    <div class="tile"><b class="acc">LV ${l.lv}</b><small>${l.titel} · ${xpTotaal()} XP totaal</small></div>
    <div class="tile"><b class="fire">${record}</b><small>langste reeks ooit</small></div>
    <div class="tile"><b>${n ? Math.round(somPct / n * 100) : 0}%</b><small>gemiddeld, 30 dagen</small></div>
    <div class="tile"><b>${perfecteDagen}</b><small>perfecte dagen, 30 dagen</small></div>
  </div>
  <div class="card"><div class="row" style="margin-bottom:12px"><b class="grow">Laatste 14 dagen</b><span class="dim" style="font-size:12px">% gewoontes gehaald</span></div><div class="bars">${bars}</div></div>
  <div class="card"><div class="row" style="margin-bottom:12px"><b class="grow">Per weekdag</b><span class="dim" style="font-size:12px">laatste 8 weken</span></div><div class="bars" style="height:90px">${wbars}</div></div>
  <div class="tiles">
    <div class="tile"><b>${takenWeek}</b><small>taken af deze week</small></div>
    <div class="tile"><b style="color:${achter ? 'var(--red)' : 'var(--text)'}">${achter}</b><small>taken achterstallig</small></div>
  </div>
  ${meestVerschoven.length ? `<div class="card"><b>Vaakst doorgeschoven</b><p class="muted" style="font-size:13px;margin:4px 0 8px">Tip: maak deze taken kleiner of plan er een vast tijdstip voor.</p>${meestVerschoven.map(k => `<div class="lijst-item"><span class="tag fire">${k.verschoven}×</span><span class="grow">${esc(k.titel)}</span></div>`).join('')}</div>` : ''}
  <div class="sec"><h2>Per gewoonte</h2><span class="cnt">12 weken</span></div>
  ${habKaarten || '<div class="leeg">Nog geen gewoontes.</div>'}`;
}

/* ---------- Logboek ---------- */
function viewLogboek() {
  const t = vandaag();
  const dagen = new Set([...Object.keys(state.dagboek), ...Object.keys(state.log)]);
  state.taken.forEach(k => { if (k.klaar && k.klaarOp) dagen.add(k.klaarOp); });
  const lijst = [...dagen].filter(d => d <= t).sort().reverse().slice(0, 60);
  return `<div class="sec" style="margin-top:12px"><h2>Logboek</h2><span class="cnt">wat je deed, per dag</span></div>
  ${lijst.map(d => {
    const v = dagVoortgang(d), lg = state.dagboek[d] || {};
    const tk = state.taken.filter(k => k.klaar && k.klaarOp === d);
    const hs = actieveGewoontes().filter(h => state.log[d]?.[h.id]);
    return `<div class="logitem" style="border-color:${perfect(v) ? 'var(--accent)' : v.pct != null && v.pct >= .5 ? 'var(--fire)' : 'var(--line)'}">
      <h3>${lg.stemming ? MOODS[lg.stemming - 1] : ''} <span style="text-transform:capitalize">${dagLabel(d)}</span>${perfect(v) ? '<span class="tag lime">perfect</span>' : ''}</h3>
      <div class="mini-hab">${hs.map(h => `<span class="${state.log[d][h.id]}">${esc(h.emoji)} ${esc(h.naam)}</span>`).join('')}${tk.map(k => `<span class="klaar">✓ ${esc(k.titel)}</span>`).join('')}</div>
      ${lg.tekst ? `<p>${esc(lg.tekst)}</p>` : ''}
      <button class="btn sm" data-act="opendag" data-dag="${d}">Bekijk / schrijf</button>
    </div>`;
  }).join('') || '<div class="leeg">Nog niets in je logboek. Vink iets af of schrijf iets bij Vandaag.</div>'}`;
}

/* ---------- Coach ---------- */
function inzichten() {
  const t = vandaag(), hs = actieveGewoontes(), uit = [];
  if (!hs.length) return [{ i: '👋', t: 'Begin klein', p: 'Kies 2 of 3 gewoontes. Meer is de snelste weg naar opgeven.' }];
  const scores = hs.map(h => ({ h, s: score(h, 14) })).filter(x => x.s != null).sort((a, b) => a.s - b.s);
  if (scores.length && scores[0].s < .6) uit.push({ i: '🎯', t: `${scores[0].h.naam} loopt achter`, p: `${Math.round(scores[0].s * 100)}% in 2 weken. Maak hem kleiner (de helft is ook goed) of koppel hem aan iets wat je al doet.` });
  if (scores.length && scores[scores.length - 1].s >= .85) uit.push({ i: '💪', t: `${scores[scores.length - 1].h.naam} zit erin`, p: `${Math.round(scores[scores.length - 1].s * 100)}% in 2 weken. Tijd om hem iets zwaarder te maken?` });
  const wk = {}; for (let i = 0; i < 28; i++) { const d = addDays(t, -i), v = dagVoortgang(d), w = parse(d).getDay(); wk[w] = wk[w] || { k: 0, t: 0 }; wk[w].k += v.klaar; wk[w].t += v.totaal; }
  const zwak = Object.entries(wk).filter(([, x]) => x.t >= 3).map(([w, x]) => [w, x.k / x.t]).sort((a, b) => a[1] - b[1])[0];
  if (zwak && zwak[1] < .6) uit.push({ i: '📅', t: `Je ${WD_LANG[zwak[0]]} is zwak`, p: `Maar ${Math.round(zwak[1] * 100)}% gehaald op ${WD_LANG[zwak[0]]}en. Plan die dag van tevoren of maak hem bewust lichter.` });
  const uur = new Date().getHours();
  const risico = hs.filter(h => status(h, t) === 'open' && streak(h) >= 3);
  if (risico.length && uur >= 17) uit.push({ i: '🔥', t: 'Reeks in gevaar', p: `${risico.map(h => h.naam).join(', ')} — nog niet gedaan vandaag. Niet je reeks laten vallen.` });
  const vers = state.taken.filter(k => !k.klaar && k.verschoven >= 3);
  if (vers.length) uit.push({ i: '🧱', t: 'Je schuift taken voor je uit', p: `"${vers[0].titel}" al ${vers[0].verschoven}× verschoven. Wat is de eerste stap van 5 minuten?` });
  const moods = Object.entries(state.dagboek).filter(([d, x]) => x.stemming && d >= addDays(t, -14));
  if (moods.length >= 4) {
    const goed = moods.filter(([, x]) => x.stemming >= 4).map(([d]) => dagVoortgang(d).pct ?? 0), slecht = moods.filter(([, x]) => x.stemming <= 2).map(([d]) => dagVoortgang(d).pct ?? 0);
    const gem = a => a.reduce((s, x) => s + x, 0) / a.length;
    if (goed.length && slecht.length && gem(goed) - gem(slecht) > .2) uit.push({ i: '🧠', t: 'Gewoontes = betere dagen', p: `Op goede dagen haalde je ${Math.round(gem(goed) * 100)}%, op slechte ${Math.round(gem(slecht) * 100)}%. Je gewoontes werken.` });
  }
  if (!uit.length) uit.push({ i: '✨', t: 'Lekker bezig', p: 'Nog niet genoeg data voor patronen. Blijf een week afvinken, dan zie je hier wat opvalt.' });
  return uit.slice(0, 4);
}
function profielVoorAI() {
  const t = vandaag(), hs = actieveGewoontes();
  const r = [`Datum: ${dagLabel(t)} (${t}), tijd ${nuHM()}.`, `Level ${level(xpTotaal()).lv}, ${xpTotaal()} XP.`];
  hs.forEach(h => { const s = score(h, 14); r.push(`- ${h.naam}: reeks ${streak(h)}, record ${besteStreak(h)}, 14 dagen ${s == null ? 'n.v.t.' : Math.round(s * 100) + '%'}, vandaag ${status(h, t) || 'niet gepland'}, dagen ${h.dagen.map(d => WD[d]).join('/')}`); });
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = addDays(t, -i), v = dagVoortgang(d); return `${WD[parse(d).getDay()]} ${v.pct == null ? '–' : Math.round(v.pct * 100) + '%'}`; }).reverse();
  r.push('Laatste 7 dagen: ' + last7.join(', '));
  const open = state.taken.filter(k => !k.klaar && k.datum && k.datum <= addDays(t, 7));
  r.push(`Open taken (t/m 7 dagen): ${open.length}` + (open.length ? ' — ' + open.slice(0, 10).map(k => `${k.titel} (${k.datum}${k.verschoven ? ', ' + k.verschoven + '× verschoven' : ''})`).join('; ') : ''));
  const us = uitdagingStatus();
  if (us) r.push(`Uitdaging: ${us.u.duur} dagen, dag ${us.dagNr}, ${us.gehaald} gehaald, jokers over ${us.jokersOver}${us.gebroken != null ? ', GEBROKEN' : ''}.`);
  const notities = Object.entries(state.dagboek).filter(([d]) => d >= addDays(t, -5)).map(([d, x]) => `${d}: ${x.stemming ? 'stemming ' + x.stemming + '/5. ' : ''}${(x.tekst || '').slice(0, 200)}`);
  if (notities.length) r.push('Logboek recent:\n' + notities.join('\n'));
  return r.join('\n');
}
function mdLite(s) {
  const e = esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const blokken = e.split(/\n{2,}/);
  return blokken.map(b => {
    const regels = b.split('\n');
    if (regels.every(r => /^\s*([-*•]|\d+\.)\s/.test(r))) return '<ul>' + regels.map(r => '<li>' + r.replace(/^\s*([-*•]|\d+\.)\s/, '') + '</li>').join('') + '</ul>';
    return '<p>' + regels.join('<br>') + '</p>';
  }).join('');
}
function viewCoach() {
  const ins = inzichten();
  const snel = ['Geef me een eerlijke weekreview', 'Waarom haak ik steeds af?', 'Plan morgen met mij', 'Daag me uit voor deze week'];
  return `<div class="sec" style="margin-top:12px"><h2>Wat opvalt</h2><span class="cnt">werkt altijd, ook offline</span></div>
  ${ins.map(x => `<div class="card inzicht"><div class="ico">${x.i}</div><div><h3>${esc(x.t)}</h3><p>${esc(x.p)}</p></div></div>`).join('')}
  ${!['localhost', '127.0.0.1'].includes(location.hostname) ? '<p class="uitleg" style="margin:18px 2px -8px">💡 AI-chat werkt alleen op je laptop (Start Ritme.cmd). Je gegevens staan per toestel.</p>' : ''}
  <div class="sec"><h2>Coach</h2><span class="cnt">${state.inst.ai === 'cloud' ? 'cloud (Claude Haiku)' : 'lokaal (Ollama)'}</span>${state.coach.length ? '<button class="btn sm r" data-act="wiscoach">Wissen</button>' : ''}</div>
  <div class="card">
    <div class="chat" id="chat">${state.coach.length ? state.coach.map(m => `<div class="msg ${m.rol}">${m.rol === 'ai' ? mdLite(m.tekst) : esc(m.tekst)}</div>`).join('') : '<div class="msg ai"><p>Ik ken je gewoontes, reeksen, taken en logboek. Vraag me wat je wilt — ik ben eerlijk, ook als het tegenvalt.</p></div>'}${ui.coachBezig ? '<div class="msg ai denk">Coach denkt na…</div>' : ''}</div>
    <div class="chips" style="margin-top:12px">${snel.map(s => `<button class="chip" data-act="coachsnel" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <form class="chatform" data-form="coach"><input name="q" placeholder="Vraag je coach…" autocomplete="off" ${ui.coachBezig ? 'disabled' : ''}><button class="btn pri" ${ui.coachBezig ? 'disabled' : ''}>${ic('send')}</button></form>
  </div>`;
}
async function vraagCoach(q) {
  if (!q || ui.coachBezig) return;
  state.coach.push({ rol: 'user', tekst: q });
  ui.coachBezig = true; bewaar(); render(); scrollChat();
  const sys = `Je bent de coach in Ritme, een app voor gewoontes en taken. Je praat met een HBO ICT-student. Stijl: eerlijk, direct en uitdagend, maar warm. Gewoon Nederlands, kort (max ±130 woorden), concreet, eindig met 1–3 acties. Gebruik de data hieronder; verzin geen cijfers. Geen medische of financiële adviezen.\n\nDATA VAN DE GEBRUIKER:\n${profielVoorAI()}`;
  const geschiedenis = state.coach.slice(-10).map(m => ({ role: m.rol === 'user' ? 'user' : 'assistant', content: m.tekst }));
  const messages = [{ role: 'system', content: sys }, ...geschiedenis];
  let antwoord;
  try {
    if (location.protocol === 'file:') throw new Error('file');
    const r = state.inst.ai === 'cloud'
      ? await fetch('/api/cloud', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) })
      : await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'qwen3.5:4b', messages, stream: false, think: false, keep_alive: -1, options: { num_ctx: 16384, temperature: .5 } }) });
    const tekst = (await r.text()).trim().split('\n').pop();
    const j = JSON.parse(tekst);
    if (j.error) throw new Error(j.error);
    antwoord = (j.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim() || 'Ik kreeg een leeg antwoord. Probeer het nog eens.';
  } catch (e) {
    const lokaal = ['localhost', '127.0.0.1'].includes(location.hostname);
    antwoord = !lokaal
      ? 'De AI-chat werkt (nog) alleen op je laptop via **Start Ritme.cmd**. De inzichten hierboven werken wel altijd, ook op je telefoon.'
      : e.message === 'file' || e instanceof TypeError || e instanceof SyntaxError
        ? 'Ik kan de AI niet bereiken. Start de app via **Start Ritme.cmd** op je laptop (en zorg dat Ollama draait). De inzichten hierboven werken wel altijd.'
        : 'Er ging iets mis: ' + e.message;
  }
  state.coach.push({ rol: 'ai', tekst: antwoord });
  state.coach = state.coach.slice(-40);
  ui.coachBezig = false; bewaar();
  if (ui.tab === 'coach') { render(); scrollChat(); }
}
function scrollChat() { const c = $('#chat'); if (c) c.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

/* =========================================================
   Sheets (formulieren)
   ========================================================= */
function openSheet(html, mount) {
  const s = $('#sheet');
  s.innerHTML = `<div class="sheet-bg" data-act="sluit"></div><div class="sheet-pan">${html}</div>`;
  s.classList.add('open');
  mount && mount(s.querySelector('.sheet-pan'));
}
function sluitSheet() { const s = $('#sheet'); s.classList.remove('open'); s.innerHTML = ''; }

function gewoonteForm(h, sjabloon) {
  const nieuw = !h;
  h = h || { naam: sjabloon?.naam || '', emoji: sjabloon?.emoji || '✨', kleur: KLEUREN[state.gewoontes.length % KLEUREN.length], dagen: [0, 1, 2, 3, 4, 5, 6], herinnering: '' };
  openSheet(`<h2>${nieuw ? 'Nieuwe gewoonte' : 'Gewoonte bewerken'}</h2>
  <form id="hform">
    <label class="veld"><span>Naam</span><div class="emo-in"><input name="emoji" value="${esc(h.emoji)}" maxlength="4" aria-label="Emoji"><input name="naam" value="${esc(h.naam)}" placeholder="Bijv. 20 min lezen" required maxlength="60"></div></label>
    ${nieuw ? `<div class="chips" style="margin:-2px 0 14px">${SJABLONEN.slice(0, 6).map((s, i) => `<button type="button" class="chip" data-vul="${i}">${s.emoji} ${esc(s.naam)}</button>`).join('')}</div>` : ''}
    <div class="veld"><span>Kleur</span><div class="kleuren">${KLEUREN.map(k => `<label style="--k:${k}"><input type="radio" name="kleur" value="${k}" ${k === h.kleur ? 'checked' : ''}></label>`).join('')}</div></div>
    <div class="veld"><span>Op welke dagen?</span><div class="wdsel">${WEEKORDE.map(d => `<label><input type="checkbox" name="dag" value="${d}" ${h.dagen.includes(d) ? 'checked' : ''}>${WD[d]}</label>`).join('')}</div></div>
    <label class="veld"><span>Herinnering (optioneel)</span><input type="time" name="herinnering" value="${h.herinnering || ''}"></label>
    <div class="knoppen">${!nieuw ? '<button type="button" class="btn red" data-act="verwijdergewoonte">Verwijderen</button>' : ''}<button class="btn pri">${nieuw ? 'Toevoegen' : 'Opslaan'}</button></div>
  </form>`, pan => {
    const f = pan.querySelector('#hform');
    pan.querySelectorAll('[data-vul]').forEach(b => b.onclick = () => { const s = SJABLONEN[b.dataset.vul]; f.naam.value = s.naam; f.emoji.value = s.emoji; });
    pan.querySelector('[data-act=verwijdergewoonte]')?.addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm(`"${h.naam}" verwijderen? Je geschiedenis van deze gewoonte verdwijnt ook.`)) return;
      state.gewoontes = state.gewoontes.filter(x => x.id !== h.id);
      for (const d in state.log) { delete state.log[d][h.id]; if (!Object.keys(state.log[d]).length) delete state.log[d]; }
      if (state.uitdaging) state.uitdaging.gewoontes = state.uitdaging.gewoontes.filter(id => id !== h.id);
      bewaar(); sluitSheet(); render(); toast('Gewoonte verwijderd');
    });
    f.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(f);
      const dagen = fd.getAll('dag').map(Number);
      if (!dagen.length) return toast('Kies minstens één dag');
      const data = { naam: fd.get('naam').trim(), emoji: fd.get('emoji').trim() || '✨', kleur: fd.get('kleur') || KLEUREN[0], dagen, herinnering: fd.get('herinnering') || '' };
      if (nieuw) state.gewoontes.push({ id: uid(), aangemaakt: vandaag(), archief: false, ...data });
      else Object.assign(h, data);
      bewaar(); sluitSheet(); render(); toast(nieuw ? 'Gewoonte toegevoegd. Reeks start nu. 🔥' : 'Opgeslagen');
      if (data.herinnering && !state.inst.meldingen) setTimeout(() => toast('Zet meldingen aan in ⚙️ voor herinneringen'), 1800);
    };
  });
}

function taakForm(k, datum) {
  const nieuw = !k;
  k = k || { titel: '', datum: datum === undefined ? ui.dag : datum, tijd: '', prio: 0, notitie: '' };
  openSheet(`<h2>${nieuw ? 'Nieuwe taak' : 'Taak bewerken'}</h2>
  <form id="tform">
    <label class="veld"><span>Wat moet er gebeuren?</span><input name="titel" value="${esc(k.titel)}" required maxlength="140" placeholder="Bijv. Portfolio-opdracht inleveren"></label>
    <div class="velden2"><label class="veld"><span>Datum</span><input type="date" name="datum" value="${k.datum || ''}"></label><label class="veld"><span>Tijd</span><input type="time" name="tijd" value="${k.tijd || ''}"></label></div>
    <div class="chips" style="margin:-4px 0 14px">
      <button type="button" class="chip" data-dat="${vandaag()}">Vandaag</button><button type="button" class="chip" data-dat="${addDays(vandaag(), 1)}">Morgen</button>
      <button type="button" class="chip" data-dat="${addDays(maandagVan(vandaag()), 7)}">Volgende week</button><button type="button" class="chip" data-dat="">Geen datum</button></div>
    <div class="veld"><span>Prioriteit</span><div class="chips">${['Normaal', 'Prio', 'Belangrijk'].map((p, i) => `<label class="chip ${(k.prio || 0) === i ? 'on' : ''}"><input type="radio" name="prio" value="${i}" ${(k.prio || 0) === i ? 'checked' : ''} hidden>${p}</label>`).join('')}</div></div>
    <label class="veld"><span>Notitie</span><textarea name="notitie" placeholder="Details, links, eerste stap…">${esc(k.notitie || '')}</textarea></label>
    ${!nieuw && k.verschoven ? `<p class="uitleg">Deze taak is ${k.verschoven}× doorgeschoven.</p>` : ''}
    <div class="knoppen">${!nieuw ? '<button type="button" class="btn red" data-x="del">Verwijderen</button>' : ''}<button class="btn pri">${nieuw ? 'Toevoegen' : 'Opslaan'}</button></div>
  </form>`, pan => {
    const f = pan.querySelector('#tform');
    pan.querySelectorAll('[data-dat]').forEach(b => b.onclick = () => { f.datum.value = b.dataset.dat; });
    pan.querySelectorAll('input[name=prio]').forEach(r => r.onchange = () => pan.querySelectorAll('input[name=prio]').forEach(x => x.parentElement.classList.toggle('on', x.checked)));
    pan.querySelector('[data-x=del]')?.addEventListener('click', () => { state.taken = state.taken.filter(x => x.id !== k.id); bewaar(); sluitSheet(); render(); toast('Taak verwijderd'); });
    f.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(f);
      const data = { titel: fd.get('titel').trim(), datum: fd.get('datum') || null, tijd: fd.get('tijd') || '', prio: Number(fd.get('prio') || 0), notitie: fd.get('notitie').trim() };
      if (nieuw) state.taken.push({ id: uid(), klaar: false, klaarOp: null, verschoven: 0, aangemaakt: vandaag(), ...data });
      else Object.assign(k, data);
      bewaar(); sluitSheet(); render(); toast(nieuw ? 'Taak toegevoegd' : 'Opgeslagen');
    };
    if (nieuw) setTimeout(() => f.titel.focus(), 250);
  });
}

function uitdagingForm() {
  const hs = actieveGewoontes();
  if (!hs.length) { toast('Maak eerst een gewoonte aan'); return gewoonteForm(); }
  openSheet(`<h2>Nieuwe uitdaging</h2>
  <form id="uform">
    <div class="veld"><span>Hoe lang?</span><div class="chips">${[21, 30, 60, 75, 90].map(d => `<label class="chip ${d === 60 ? 'on' : ''}"><input type="radio" name="duur" value="${d}" ${d === 60 ? 'checked' : ''} hidden>${d} dagen</label>`).join('')}</div></div>
    <div class="veld"><span>Welke gewoontes? (elke dag verplicht)</span><div class="keuze">${hs.map((h, i) => `<label><input type="checkbox" name="g" value="${h.id}" ${i < 3 ? 'checked' : ''}><span>${esc(h.emoji)} <span class="t">${esc(h.naam)}</span></span></label>`).join('')}</div></div>
    <div class="veld"><span>Moeilijkheid</span><div class="keuze">
      <label><input type="radio" name="jokers" value="3" checked><span><span class="t">Normaal — 3 jokers</span><small>3 dagen mogen misgaan.</small></span></label>
      <label><input type="radio" name="jokers" value="1"><span><span class="t">Zwaar — 1 joker</span><small>Eén slechte dag, meer niet.</small></span></label>
      <label><input type="radio" name="jokers" value="0"><span><span class="t">🔥 Hard-modus — 0 jokers</span><small>Eén fout en je begint opnieuw.</small></span></label></div></div>
    <div class="veld"><span>Start</span><div class="chips"><label class="chip on"><input type="radio" name="start" value="${vandaag()}" checked hidden>Vandaag</label><label class="chip"><input type="radio" name="start" value="${addDays(vandaag(), 1)}" hidden>Morgen</label></div></div>
    <div class="knoppen"><button class="btn pri">${ic('flame')}Ik ga ervoor</button></div>
  </form>`, pan => {
    const f = pan.querySelector('#uform');
    pan.querySelectorAll('.chips input[type=radio]').forEach(r => r.onchange = () => pan.querySelectorAll(`input[name=${r.name}]`).forEach(x => x.parentElement.classList.toggle('on', x.checked)));
    f.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(f), g = fd.getAll('g');
      if (!g.length) return toast('Kies minstens één gewoonte');
      // Uitdagings-gewoontes moeten elke dag gepland zijn
      g.forEach(id => { const h = gewoonte(id); if (h.dagen.length < 7) h.dagen = [0, 1, 2, 3, 4, 5, 6]; });
      state.uitdaging = { start: fd.get('start'), duur: Number(fd.get('duur')), gewoontes: g, jokers: Number(fd.get('jokers')) };
      bewaar(); sluitSheet(); render(); confetti(40); toast('Uitdaging gestart. Geen excuses. 🔥');
    };
  });
}

function instellingenForm() {
  const hs = state.gewoontes;
  const permissie = 'Notification' in window ? Notification.permission : 'niet';
  openSheet(`<h2>Instellingen</h2>
  <h3>Gewoontes</h3>
  ${hs.map((h, i) => `<div class="lijst-item"><span style="font-size:20px">${esc(h.emoji)}</span><span class="grow" style="${h.archief ? 'opacity:.5' : ''}">${esc(h.naam)}${h.archief ? ' <span class="tag">gepauzeerd</span>' : ''}</span>
    <button class="ibtn" data-x="op" data-i="${i}" title="Omhoog" ${i === 0 ? 'disabled' : ''}>${ic('left', '').replace('viewBox', 'style="transform:rotate(90deg)" viewBox')}</button>
    <button class="btn sm" data-x="pauze" data-i="${i}">${h.archief ? 'Hervat' : 'Pauze'}</button>
    <button class="btn sm" data-x="bewerk" data-i="${i}">Bewerk</button></div>`).join('') || '<p class="muted">Nog geen gewoontes.</p>'}
  <button class="btn sm" style="margin-top:8px" data-x="nieuw">${ic('plus')}Nieuwe gewoonte</button>

  <h3>Herinneringen</h3>
  <div class="schakel"><div><b>Meldingen</b><p class="uitleg">${permissie === 'denied' ? 'Geblokkeerd in je browser. Zet ze aan via het slotje naast de adresbalk.' : permissie === 'niet' ? 'Deze browser ondersteunt geen meldingen.' : 'Herinneringen per gewoonte, taken met een tijd en een avondcheck.'}</p></div><input type="checkbox" data-x="meld" ${state.inst.meldingen && permissie === 'granted' ? 'checked' : ''}></div>
  <label class="veld"><span>Avondcheck (als er nog iets open staat)</span><input type="time" data-x="avond" value="${state.inst.avond}"></label>
  <p class="uitleg">Let op: in een web-app komen herinneringen alleen als Ritme open staat (of op de achtergrond in je browser). Echte meldingen die altijd komen, krijg je zodra we de app voor de Play Store inpakken.</p>

  <h3>AI-coach</h3>
  <div class="keuze">
    <label><input type="radio" name="ai" value="lokaal" ${state.inst.ai === 'lokaal' ? 'checked' : ''}><span><span class="t">Lokaal (Ollama, qwen3.5:4b)</span><small>Gratis en privé. Blijft op je laptop.</small></span></label>
    <label><input type="radio" name="ai" value="cloud" ${state.inst.ai === 'cloud' ? 'checked' : ''}><span><span class="t">Cloud (Claude Haiku via OpenRouter)</span><small>Slimmer en sneller. Kost een paar cent; je samenvatting gaat naar OpenRouter.</small></span></label>
  </div>

  <h3>Back-up</h3>
  <p class="uitleg" style="margin-bottom:8px">Alles staat alleen op dit toestel. Maak af en toe een back-up.</p>
  <div class="knoppen" style="margin-top:0"><button class="btn" data-x="export">Exporteren</button><button class="btn" data-x="import">Importeren</button></div>
  <input type="file" accept="application/json" data-x="bestand" hidden>
  <button class="btn sm red" style="margin-top:14px" data-x="reset">Alles wissen</button>`, pan => {
    pan.addEventListener('click', e => {
      const b = e.target.closest('[data-x]'); if (!b) return;
      const x = b.dataset.x, i = Number(b.dataset.i);
      if (x === 'op' && i > 0) { [hs[i - 1], hs[i]] = [hs[i], hs[i - 1]]; bewaar(); render(); instellingenForm(); }
      if (x === 'pauze') { hs[i].archief = !hs[i].archief; bewaar(); render(); instellingenForm(); }
      if (x === 'bewerk') gewoonteForm(hs[i]);
      if (x === 'nieuw') gewoonteForm();
      if (x === 'export') exporteer();
      if (x === 'import') pan.querySelector('[data-x=bestand]').click();
      if (x === 'reset' && confirm('Echt ALLES wissen? Gewoontes, taken, logboek en uitdaging. Dit kan niet ongedaan worden.')) { state = nieuweState(); bewaar(); sluitSheet(); render(); toast('Alles gewist'); }
    });
    pan.querySelector('[data-x=meld]').onchange = async e => {
      if (e.target.checked) {
        if (!('Notification' in window)) { e.target.checked = false; return toast('Geen meldingen in deze browser'); }
        const p = await Notification.requestPermission();
        state.inst.meldingen = p === 'granted'; e.target.checked = state.inst.meldingen;
        if (p === 'granted') meld('Ritme', 'Meldingen staan aan. Ik hou je scherp. 🔥', 'test');
        else toast('Meldingen niet toegestaan');
      } else state.inst.meldingen = false;
      bewaar();
    };
    pan.querySelector('[data-x=avond]').onchange = e => { state.inst.avond = e.target.value || '21:00'; bewaar(); };
    pan.querySelectorAll('input[name=ai]').forEach(r => r.onchange = () => { state.inst.ai = r.value; bewaar(); render(); });
    pan.querySelector('[data-x=bestand]').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const s = JSON.parse(rd.result);
          if (!s.versie || !Array.isArray(s.gewoontes)) throw 0;
          if (!confirm('Back-up importeren? Je huidige gegevens worden vervangen.')) return;
          state = Object.assign(nieuweState(), s); state.inst = Object.assign(nieuweState().inst, s.inst);
          bewaar(); sluitSheet(); render(); toast('Back-up geïmporteerd');
        } catch (err) { toast('Dit is geen geldige Ritme-back-up'); }
      };
      rd.readAsText(file);
    };
  });
}
function exporteer() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `ritme-backup-${vandaag()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* =========================================================
   Acties
   ========================================================= */
const acties = {
  tab: el => { ui.tab = el.dataset.tab; if (ui.tab === 'vandaag') ui.dag = ui.dag || vandaag(); render(); window.scrollTo({ top: 0 }); if (ui.tab === 'coach') scrollChat(); },
  kiesdag: el => { ui.dag = el.dataset.dag; render(); },
  week: el => { ui.dag = addDays(ui.dag, Number(el.dataset.n)); render(); },
  opendag: el => { ui.dag = el.dataset.dag; ui.tab = 'vandaag'; render(); window.scrollTo({ top: 0 }); },
  maand: el => { const [y, m] = ui.maand.split('-').map(Number); const d = new Date(y, m - 1 + Number(el.dataset.n), 1); ui.maand = ymd(d).slice(0, 7); render(); },
  agendadag: el => { ui.agendaDag = el.dataset.dag; render(); document.querySelector('.dagdetail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); },
  hab: el => {
    const h = gewoonte(el.dataset.id), s = el.dataset.s;
    const dag = ui.tab === 'uitdaging' ? vandaag() : ui.dag;
    const was = state.log[dag]?.[h.id];
    const voor = dagVoortgang(dag);
    zet(h, dag, was === s ? null : s);
    bewaar();
    const na = dagVoortgang(dag);
    if (s === 'klaar' && was !== 'klaar') {
      if (!perfect(voor) && perfect(na)) { confetti(90); toast('🔥 Perfecte dag! +25 XP bonus'); }
      else { const st = streak(h); toast(st > 1 && st % 7 === 0 ? `🔥 ${st} dagen op rij! Week vol!` : `+10 XP · ${h.naam}${st > 1 ? ` · reeks ${st}` : ''}`); }
      if (navigator.vibrate) navigator.vibrate(18);
    } else if (s === 'skip' && was !== 'skip') toast('Overgeslagen. Reeks blijft staan, morgen weer.');
    else if (s === 'gemist' && was !== 'gemist') toast('Gemist. Morgen staat hij er gewoon weer.');
    render(); checkLevelUp();
  },
  taak: el => {
    const k = state.taken.find(x => x.id === el.dataset.id);
    k.klaar = !k.klaar; k.klaarOp = k.klaar ? vandaag() : null;
    bewaar(); render();
    if (k.klaar) { toast('+5 XP · taak af'); if (navigator.vibrate) navigator.vibrate(12); }
    checkLevelUp();
  },
  taakskip: el => {
    const k = state.taken.find(x => x.id === el.dataset.id);
    const basis = k.datum && k.datum >= vandaag() ? k.datum : vandaag();
    k.datum = addDays(basis, 1); k.verschoven = (k.verschoven || 0) + 1;
    bewaar(); render();
    toast(k.verschoven >= 3 ? `Al ${k.verschoven}× verschoven… maak hem kleiner?` : `Doorgeschoven naar ${dagLabel(k.datum).toLowerCase()}`);
  },
  bewerktaak: el => taakForm(state.taken.find(x => x.id === el.dataset.id)),
  nieuwetaak: () => taakForm(null, ui.dag),
  bewerkgewoonte: el => gewoonteForm(gewoonte(el.dataset.id)),
  nieuwegewoonte: () => gewoonteForm(),
  sjabloon: el => {
    const s = SJABLONEN[el.dataset.i];
    state.gewoontes.push({ id: uid(), naam: s.naam, emoji: s.emoji, kleur: KLEUREN[state.gewoontes.length % KLEUREN.length], dagen: [0, 1, 2, 3, 4, 5, 6], herinnering: '', aangemaakt: vandaag(), archief: false });
    bewaar(); render(); toast(`${s.emoji} ${s.naam} toegevoegd`);
  },
  mood: el => { const d = ui.dag; state.dagboek[d] = state.dagboek[d] || {}; const v = Number(el.dataset.v); state.dagboek[d].stemming = state.dagboek[d].stemming === v ? null : v; bewaar(); render(); },
  instellingen: () => instellingenForm(),
  sluit: () => sluitSheet(),
  startuitdaging: () => uitdagingForm(),
  stopuitdaging: () => { if (!confirm('Uitdaging stoppen? Je voortgang wordt bewaard bij "eerdere pogingen".')) return; const us = uitdagingStatus(); state.geschiedenis.push({ start: us.u.start, duur: us.u.duur, gehaald: us.gehaald, voltooid: false }); state.uitdaging = null; bewaar(); render(); },
  herstartuitdaging: () => { const us = uitdagingStatus(); state.geschiedenis.push({ start: us.u.start, duur: us.u.duur, gehaald: us.gehaald, voltooid: false }); state.uitdaging = { ...us.u, start: vandaag() }; bewaar(); render(); toast('Dag 1. Nu écht. 🔥'); },
  afronduitdaging: () => { const us = uitdagingStatus(); state.geschiedenis.push({ start: us.u.start, duur: us.u.duur, gehaald: us.gehaald, voltooid: true }); state.uitdaging = null; bewaar(); render(); confetti(150); toast('🏆 Uitdaging voltooid! +500 XP'); checkLevelUp(); },
  coachsnel: el => vraagCoach(el.dataset.q),
  wiscoach: () => { state.coach = []; bewaar(); render(); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  if (el.closest('.sheet-pan') && !['sluit'].includes(el.dataset.act) && el.dataset.act !== 'verwijdergewoonte') return;
  acties[el.dataset.act]?.(el, e);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  const v = f.elements[0].value.trim(); if (!v) return;
  if (f.dataset.form === 'snel' || f.dataset.form === 'agendataak') {
    const datum = f.dataset.form === 'snel' ? ui.dag : ui.agendaDag;
    state.taken.push({ id: uid(), titel: v, datum, tijd: '', prio: 0, notitie: '', klaar: false, klaarOp: null, verschoven: 0, aangemaakt: vandaag() });
    bewaar(); render(); toast('Taak toegevoegd');
    document.querySelector(`[data-form=${f.dataset.form}] input`)?.focus();
  }
  if (f.dataset.form === 'coach') vraagCoach(v);
});
let dagboekTimer;
document.addEventListener('input', e => {
  if (e.target.dataset.inp === 'dagboek') {
    const d = ui.dag, v = e.target.value;
    clearTimeout(dagboekTimer);
    dagboekTimer = setTimeout(() => { state.dagboek[d] = state.dagboek[d] || {}; state.dagboek[d].tekst = v; bewaar(); }, 400);
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') sluitSheet(); });

/* ---------- Toast & confetti ---------- */
let toastTimer;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }
function confetti(n = 60) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti'), kl = ['#C6FF3D', '#FF7A1A', '#FFC83D', '#4DA3FF', '#FF4D8D'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    const hoek = Math.random() * Math.PI * 2, afst = 120 + Math.random() * 280;
    s.style.cssText = `background:${kl[i % kl.length]};--x:${Math.cos(hoek) * afst}px;--y:${Math.sin(hoek) * afst + 200}px;--r:${Math.random() * 720 - 360}deg;animation-delay:${Math.random() * .12}s`;
    c.appendChild(s);
  }
  setTimeout(() => { c.innerHTML = ''; }, 1600);
}

/* ---------- Herinneringen ---------- */
async function meld(titel, tekst, tag) {
  if (!state.inst.meldingen || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) reg.showNotification(titel, { body: tekst, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' });
    else new Notification(titel, { body: tekst, tag, icon: 'icons/icon-192.png' });
  } catch (e) { /* geen meldingen mogelijk */ }
}
function checkHerinneringen() {
  const t = vandaag(), hm = nuHM();
  let veranderd = false;
  const eenmaal = (sleutel, fn) => { if (!state.gemeld[sleutel]) { state.gemeld[sleutel] = 1; veranderd = true; fn(); } };
  actieveGewoontes().forEach(h => {
    if (h.herinnering && hm >= h.herinnering && gepland(h, t) && status(h, t) === 'open') {
      const st = streak(h);
      eenmaal(t + h.id, () => meld(`${h.emoji} ${h.naam}`, st ? `Reeks van ${st}. Hou hem in leven.` : 'Tijd om te beginnen.', h.id));
    }
  });
  state.taken.forEach(k => {
    if (!k.klaar && k.datum === t && k.tijd && hm >= k.tijd) eenmaal(t + k.id, () => meld('⏰ ' + k.titel, 'Staat nu gepland.', k.id));
  });
  const v = dagVoortgang(t);
  if (hm >= state.inst.avond && v.open > 0) eenmaal(t + 'avond', () => meld('Ritme — avondcheck', `Nog ${v.open} ${v.open === 1 ? 'gewoonte' : 'gewoontes'} open. Maak je dag af.`, 'avond'));
  for (const k in state.gemeld) if (!k.startsWith(t)) { delete state.gemeld[k]; veranderd = true; }
  if (veranderd) bewaar();
}

/* ---------- Start ---------- */
let laatsteDag = vandaag();
setInterval(() => {
  if (vandaag() !== laatsteDag) { if (ui.dag === laatsteDag) ui.dag = vandaag(); laatsteDag = vandaag(); render(); }
  checkHerinneringen();
}, 30000);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
state.lv = Math.max(state.lv || 1, 1);
render();
checkHerinneringen();

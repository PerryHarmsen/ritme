'use strict';
/* =========================================================
   Ritme — gewoontes, taken, agenda, 60-dagen-uitdaging, coach
   Alles staat lokaal op je toestel (localStorage).
   ========================================================= */

const OPSLAG = 'ritme-v1';
const KLEUREN = ['#9D84FF', '#5BA8FF', '#FF8FC8', '#4FD8C4', '#FFB36B', '#C77DFF', '#7FD4FF'];
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
    coach: [], gemeld: {}, lv: 1, tellers: {}, focus: null, focusLog: [], reviews: {}, bijgewerkt: 0,
    inst: { ai: 'lokaal', meldingen: false, avond: '21:00' }
  };
}
function vanJSON(s) { const st = Object.assign(nieuweState(), s); st.inst = Object.assign(nieuweState().inst, s.inst); return st; }
function laad() {
  try { const s = JSON.parse(localStorage.getItem(OPSLAG)); if (s && s.versie) return vanJSON(s); } catch (e) { /* lege start */ }
  return nieuweState();
}
let state = laad();
// stempel=false: alleen lokaal opslaan (bijv. na ophalen van de sync), niet als "nieuwe wijziging" tellen
function bewaar(stempel = true) {
  if (stempel) state.bijgewerkt = Date.now();
  try { localStorage.setItem(OPSLAG, JSON.stringify(state)); } catch (e) { toast('Opslaan mislukt'); }
  if (stempel) planSync();
}
// Dingen die alleen op dit toestel horen (sleutels), nooit in de sync
function lokaal(k, v) {
  try { if (v === undefined) return JSON.parse(localStorage.getItem('ritme-' + k)) || {}; localStorage.setItem('ritme-' + k, JSON.stringify(v)); } catch (e) { return {}; }
}

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
  let klaar = 0, vol = 0, skip = 0, mis = 0;
  hs.forEach(h => { const s = status(h, dag); if (gedaan(s)) { klaar++; if (s === 'klaar') vol++; } else if (s === 'skip') skip++; else if (s === 'gemist') mis++; });
  const totaal = hs.length - skip;
  return { klaar, vol, skip, mis, totaal, aantal: hs.length, open: totaal - klaar - mis, pct: totaal ? klaar / totaal : null };
}
// Perfect = alles volledig gedaan (de minimale versie telt wel voor je reeks, niet voor "perfect")
const perfect = v => v.totaal > 0 && v.vol === v.totaal;
function gedaan(s) { return s === 'klaar' || s === 'mini'; }
const teller = (h, dag) => state.tellers[dag]?.[h.id] || 0;

// Streak: gemist breekt, overslaan en niet-geplande dagen tellen niet mee maar breken ook niet.
function streak(h) {
  let d = vandaag(), n = 0;
  for (let i = 0; i < 1500 && d >= h.aangemaakt; i++, d = addDays(d, -1)) {
    const s = status(h, d);
    if (gedaan(s)) n++;
    else if (s === 'gemist') break;
  }
  return n;
}
function besteStreak(h) {
  let d = h.aangemaakt, n = 0, best = 0; const t = vandaag();
  for (let i = 0; i < 1500 && d <= t; i++, d = addDays(d, 1)) {
    const s = status(h, d);
    if (gedaan(s)) best = Math.max(best, ++n);
    else if (s === 'gemist') n = 0;
  }
  return best;
}
function score(h, dagen, eind = vandaag()) {
  let k = 0, tot = 0;
  for (let i = 0; i < dagen; i++) {
    const d = addDays(eind, -i), s = status(h, d);
    if (gedaan(s)) { k++; tot++; } else if (s === 'gemist') tot++;
  }
  return tot ? k / tot : null;
}
const HERHAAL = { dag: ['dag', 'dagen'], week: ['week', 'weken'], maand: ['maand', 'maanden'], jaar: ['jaar', 'jaar'] };
function herhaalLabel(hr) {
  if (!hr) return '';
  if (hr.type === 'werkdagen') return 'elke werkdag';
  const n = hr.n || 1;
  return n === 1 ? `elke ${HERHAAL[hr.type][0]}`.replace('elke jaar', 'elk jaar') : `elke ${n} ${HERHAAL[hr.type][1]}`;
}
function volgendeDatum(datum, hr) {
  const n = hr.n || 1;
  const dagNr = parse(datum || vandaag()).getDate(); // "elke maand op de 31e" blijft de laatste dag, ook na februari
  const stap = d => {
    if (hr.type === 'dag') return addDays(d, n);
    if (hr.type === 'week') return addDays(d, 7 * n);
    if (hr.type === 'werkdagen') { do { d = addDays(d, 1); } while ([0, 6].includes(parse(d).getDay())); return d; }
    const x = parse(d);
    if (hr.type === 'jaar') return ymd(new Date(x.getFullYear() + n, x.getMonth(), x.getDate()));
    const y = new Date(x.getFullYear(), x.getMonth() + n, 1);
    y.setDate(Math.min(dagNr, new Date(y.getFullYear(), y.getMonth() + 1, 0).getDate()));
    return ymd(y);
  };
  let d = stap(datum || vandaag());
  for (let i = 0; i < 500 && d <= vandaag(); i++) d = stap(d); // te laat afgevinkt? dan de eerstvolgende na vandaag
  return d;
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
    for (const id in state.log[dag]) {
      if (!gewoonte(id)) continue;
      if (state.log[dag][id] === 'klaar') { xp += 10; k++; } else if (state.log[dag][id] === 'mini') xp += 4;
    }
    if (k && perfect(dagVoortgang(dag))) xp += 25;
  }
  state.taken.forEach(t => { if (t.klaar) xp += 5; });
  state.focusLog.forEach(f => { xp += Math.floor(f.min / 5) * 2; });
  xp += Object.keys(state.reviews).length * 30;
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
      if (ss.every(gedaan)) st = 'ok';
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
  v.innerHTML = { vandaag: viewVandaag, agenda: viewAgenda, uitdaging: viewUitdaging, stats: viewStats, coach: viewCoach, logboek: viewLogboek, review: viewReview }[ui.tab]();
  renderFocus();
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
  const actief = ui.tab === 'review' ? 'stats' : ui.tab;
  $('#nav').innerHTML = `<div class="bar">${tabs.map(([k, i, n]) => `<button class="${actief === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${ic(i)}${n}</button>`).join('')}</div>`;
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
      <small>${WD[parse(d).getDay()]}</small><span class="n">${dv ? ring(dv.pct, 30, 3, perfect(dv) ? 'url(#rgP)' : 'url(#rgB)') : ''}${parse(d).getDate()}</span></button>`;
  }).join('');

  const gisteren = addDays(t, -1);
  const habHtml = hs.length ? hs.map(h => habRij(h, dag, dag === t && status(h, gisteren) === 'gemist')).join('') :
    actieveGewoontes().length ? `<div class="leeg">Geen gewoontes gepland op ${dagLabel(dag).toLowerCase()}.</div>` : starterKaart();

  const log = state.dagboek[dag] || {};
  return `
  <div class="strip"><button class="nav" data-act="week" data-n="-7">${ic('left')}</button><div class="days">${strip}</div><button class="nav" data-act="week" data-n="7">${ic('right')}</button></div>
  ${dag !== t ? `<div class="terug"><span>Je bekijkt ${dagLabel(dag)}</span><button class="btn sm" data-act="kiesdag" data-dag="${t}">Naar vandaag</button></div>` : ''}
  <div class="card hero" style="margin-top:12px">
    <div class="big">${ring(v.pct, 96, 10, perfect(v) ? 'url(#rgP)' : 'url(#rgB)')}<div class="pct"><div>${v.pct == null ? '–' : Math.round(v.pct * 100) + '%'}<small>${v.totaal ? v.klaar + '/' + v.totaal : ''}</small></div></div></div>
    <div class="grow">
      <h1>${dagLabel(dag)}</h1>
      <p>${motivatie(v, dag)}</p>
      ${weekFocus() && dag === t ? `<p class="weekfocus">🎯 ${esc(weekFocus())}</p>` : ''}
      <div class="stats">
        <span style="color:var(--fire)">${ic('flame')}${maxStreak} beste reeks</span>
        ${us && us.gestart && us.gebroken == null && !us.voltooid ? `<span style="color:var(--gold)">${ic('trophy')}dag ${us.dagNr}/${us.u.duur}</span>` : ''}
        ${open.length ? `<span class="muted">${open.length} ${open.length === 1 ? 'taak' : 'taken'} open</span>` : ''}
      </div>
    </div>
  </div>
  ${reviewKaart(dag)}

  <div class="sec"><h2>Gewoontes</h2><span class="cnt">${v.klaar}/${v.totaal}</span><button class="btn sm r" data-act="nieuwegewoonte">${ic('plus')}Nieuw</button></div>
  ${habHtml}

  <div class="sec"><h2>Taken</h2><span class="cnt">${open.length} open</span><button class="btn sm r" data-act="nieuwetaak">${ic('plus')}Uitgebreid</button></div>
  <form class="add" data-form="snel"><input name="titel" placeholder="Taak… bijv. morgen 10 uur tandarts bellen" autocomplete="off" maxlength="140"><button class="btn pri">${ic('plus')}</button></form><div class="hint"></div>
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
  const n = teller(h, dag), metDoel = h.doel > 1 && s === 'open' && !toekomst;
  return `<div class="hab st-${s}" style="--c:${h.kleur}">
    <div class="hab-emo">${esc(h.emoji)}</div>
    <div class="hab-main" data-act="habdetail" data-id="${h.id}" data-dag="${dag}">
      <div class="hab-naam">${esc(h.naam)}</div>
      <div class="hab-meta">
        ${st ? `<span class="fl">${ic('flame')}${st}</span>` : '<span class="dim">nog geen reeks</span>'}
        ${h.doel > 1 ? `<span>${n}/${h.doel} ${esc(h.eenheid || '')}</span>` : ''}
        ${h.herinnering ? `<span>⏰ ${h.herinnering}</span>` : ''}
        ${s === 'mini' ? `<span class="tag lime">minimaal · reeks gered</span>` : ''}
        ${s === 'skip' ? '<span class="tag gold">overgeslagen · morgen weer</span>' : ''}
        ${s === 'gemist' ? '<span class="tag red">gemist</span>' : ''}
        ${gisterenGemist && s === 'open' ? '<span class="tag red">gisteren gemist</span>' : ''}
      </div>
    </div>
    <div class="hab-acts">
      <button class="sk" data-act="hab" data-s="skip" data-id="${h.id}" title="Overslaan (breekt je reeks niet)">${ic('skip')}</button>
      <button class="mi" data-act="hab" data-s="gemist" data-id="${h.id}" title="Gemist" ${toekomst ? 'disabled' : ''}>${ic('x')}</button>
      ${metDoel
        ? `<button class="big teller" data-act="habplus" data-id="${h.id}" title="+1 ${esc(h.eenheid || '')}" style="--p:${n / h.doel}"><span>${n}/${h.doel}</span></button>`
        : `<button class="big" data-act="hab" data-s="klaar" data-id="${h.id}" title="Afvinken" ${toekomst ? 'disabled' : ''}>${s === 'mini' ? '½' : ic('check')}</button>`}
    </div>
  </div>`;
}
function reviewWeek() { const t = vandaag(); return parse(t).getDay() === 0 ? maandagVan(t) : addDays(maandagVan(t), -7); }
function weekFocus() { return state.reviews[addDays(maandagVan(vandaag()), -7)]?.focus || ''; }
function reviewKaart(dag) {
  const t = vandaag(), wd = parse(t).getDay();
  if (dag !== t || ![0, 1].includes(wd) || state.reviews[reviewWeek()] || !actieveGewoontes().length) return '';
  return `<button class="card reviewkaart" data-act="tab" data-tab="review"><span style="font-size:26px">🗓️</span><span class="grow"><b>Tijd voor je weekreview</b><small>3 minuten terugkijken, 1 focus kiezen. +30 XP</small></span>${ic('right')}</button>`;
}
function taakRij(k, dag) {
  const t = vandaag(), teLaat = !k.klaar && k.datum && k.datum < t;
  const meta = [
    teLaat ? `<span class="tag red">${verschil(k.datum, t)} ${verschil(k.datum, t) === 1 ? 'dag' : 'dagen'} te laat</span>` : '',
    k.tijd ? `<span>⏰ ${k.tijd}</span>` : '',
    k.prio === 2 ? '<span class="tag red">belangrijk</span>' : k.prio === 1 ? '<span class="tag gold">prio</span>' : '',
    k.verschoven >= 3 ? `<span class="tag fire">${k.verschoven}× verschoven</span>` : k.verschoven ? `<span>${k.verschoven}× verschoven</span>` : '',
    k.datum && k.datum !== dag && !teLaat ? `<span>${dagLabel(k.datum, true)}</span>` : '',
    k.herhaal ? `<span>🔁 ${herhaalLabel(k.herhaal)}</span>` : '',
    k.subtaken?.length ? `<span>☑ ${k.subtaken.filter(s => s.klaar).length}/${k.subtaken.length}</span>` : '',
    k.lijst ? `<span class="tag">${esc(k.lijst)}</span>` : '',
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
    ${ahs.length ? `<div class="mini-hab">${ahs.map(h => { const s = status(h, ad); return `<span class="${s}">${esc(h.emoji)} ${esc(h.naam)}${s === 'klaar' ? ' ✓' : s === 'mini' ? ' ½' : s === 'skip' ? ' ↷' : s === 'gemist' ? ' ✕' : ''}</span>`; }).join('')}</div>` : ''}
    ${atk.map(k => taakRij(k, ad)).join('') || '<div class="muted" style="font-size:13.5px;margin:8px 0">Geen taken op deze dag.</div>'}
    ${alog && (alog.tekst || alog.stemming) ? `<p class="muted" style="font-size:13.5px;margin:10px 0 0">${alog.stemming ? MOODS[alog.stemming - 1] + ' ' : ''}${esc((alog.tekst || '').slice(0, 160))}</p>` : ''}
    <form class="add" data-form="agendataak" style="margin:12px 0 0"><input name="titel" placeholder="Taak toevoegen op ${dagLabel(ad, true).toLowerCase()}…" autocomplete="off" maxlength="140"><button class="btn pri">${ic('plus')}</button></form><div class="hint"></div>
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
    <div class="tile"><b style="color:var(--blue)">${state.focusLog.filter(f => f.dag >= weekStart).reduce((s, f) => s + f.min, 0)}</b><small>focusminuten deze week</small></div>
    <div class="tile"><b>${Object.keys(state.reviews).length}</b><small>weekreviews gedaan</small></div>
  </div>
  <button class="btn full" style="margin-bottom:14px" data-act="tab" data-tab="review">🗓️ Weekreview ${state.reviews[reviewWeek()] ? 'bekijken' : 'doen'}</button>
  ${meestVerschoven.length ? `<div class="card"><b>Vaakst doorgeschoven</b><p class="muted" style="font-size:13px;margin:4px 0 8px">Tip: maak deze taken kleiner of plan er een vast tijdstip voor.</p>${meestVerschoven.map(k => `<div class="lijst-item"><span class="tag fire">${k.verschoven}×</span><span class="grow">${esc(k.titel)}</span></div>`).join('')}</div>` : ''}
  <div class="sec"><h2>Per gewoonte</h2><span class="cnt">12 weken</span></div>
  ${habKaarten || '<div class="leeg">Nog geen gewoontes.</div>'}`;
}

/* ---------- Weekreview ---------- */
function viewReview() {
  const ws = reviewWeek(), we = addDays(ws, 6), t = vandaag();
  const dagen = Array.from({ length: 7 }, (_, i) => addDays(ws, i)).filter(d => d <= t);
  let som = 0, n = 0, perf = 0;
  dagen.forEach(d => { const v = dagVoortgang(d); if (v.pct != null) { som += v.pct; n++; } if (perfect(v)) perf++; });
  const hs = actieveGewoontes().map(h => ({ h, s: score(h, dagen.length, dagen[dagen.length - 1] || ws) })).filter(x => x.s != null).sort((a, b) => b.s - a.s);
  const taken = state.taken.filter(k => k.klaar && k.klaarOp >= ws && k.klaarOp <= we).length;
  const focus = state.focusLog.filter(f => f.dag >= ws && f.dag <= we).reduce((s, f) => s + f.min, 0);
  const moods = dagen.map(d => state.dagboek[d]?.stemming).filter(Boolean);
  const r = state.reviews[ws] || {};
  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(ws, i), v = d <= t ? dagVoortgang(d) : null, p = v?.pct ?? 0;
    return `<div class="b"><em>${v ? Math.round(p * 100) + '%' : ''}</em><span class="${p < .2 ? 'laag' : p < 1 ? 'mid' : ''}" style="height:${Math.max(p * 100, 3)}%"></span><small>${WD[parse(d).getDay()]}</small></div>`;
  }).join('');
  const oud = Object.entries(state.reviews).filter(([w]) => w !== ws).sort().reverse().slice(0, 8);
  return `<div class="sec" style="margin-top:12px"><button class="btn sm" data-act="tab" data-tab="stats">${ic('left')}Stats</button><h2 class="r">Weekreview</h2></div>
  <div class="card chal-hero" style="padding:18px">
    <div class="lbl">Week ${dagLabel(ws, true)} – ${dagLabel(we, true)}</div>
    <div class="dagnr" style="margin:8px 0;font-size:54px">${n ? Math.round(som / n * 100) : 0}<small>%</small></div>
    <p class="muted" style="margin:0">${n && som / n >= .85 ? 'Sterke week. Dit is wie je bent.' : n && som / n >= .6 ? 'Degelijk. Waar zit de laatste 20%?' : 'Zwaardere week. Eerlijk kijken = beter worden.'}</p>
    <div class="chal-stats"><div><b style="color:var(--accent)">${perf}</b><small>perfecte dagen</small></div><div><b>${taken}</b><small>taken af</small></div><div><b style="color:var(--blue)">${focus}</b><small>focusmin.</small></div></div>
  </div>
  <div class="card"><div class="bars" style="height:90px">${bars}</div></div>
  ${hs.length ? `<div class="card">
    <div class="lijst-item"><span style="font-size:20px">🏆</span><span class="grow"><b>Beste:</b> ${esc(hs[0].h.emoji)} ${esc(hs[0].h.naam)}</span><span class="tag lime">${Math.round(hs[0].s * 100)}%</span></div>
    ${hs.length > 1 ? `<div class="lijst-item"><span style="font-size:20px">🎯</span><span class="grow"><b>Zwakste:</b> ${esc(hs.at(-1).h.emoji)} ${esc(hs.at(-1).h.naam)}</span><span class="tag ${hs.at(-1).s < .6 ? 'red' : ''}">${Math.round(hs.at(-1).s * 100)}%</span></div>` : ''}
    ${moods.length ? `<div class="lijst-item"><span style="font-size:20px">${MOODS[Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) - 1]}</span><span class="grow"><b>Gemiddelde stemming</b></span><span class="tag">${(moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)}/5</span></div>` : ''}
  </div>` : ''}
  <form class="card" data-form="review">
    <label class="veld"><span>Wat ging goed?</span><textarea name="goed" placeholder="Waar ben je trots op?">${esc(r.goed || '')}</textarea></label>
    <label class="veld"><span>Wat ging mis, en waarom?</span><textarea name="mis" placeholder="Eerlijk zijn. Wat hield je tegen?">${esc(r.mis || '')}</textarea></label>
    <label class="veld"><span>Mijn ene focus voor volgende week</span><input name="focus" value="${esc(r.focus || '')}" maxlength="90" placeholder="Bijv. elke dag om 20:00 coderen, geen excuses"></label>
    <div class="knoppen"><button type="button" class="btn" data-act="reviewcoach">${ic('bolt')}Bespreek met coach</button><button class="btn pri">${r.focus ? 'Bijwerken' : 'Opslaan (+30 XP)'}</button></div>
  </form>
  ${oud.length ? `<div class="sec"><h2>Eerdere weken</h2></div>${oud.map(([w, x]) => `<div class="logitem"><h3>Week van ${dagLabel(w, true)}</h3>${x.focus ? `<p><b>🎯 ${esc(x.focus)}</b></p>` : ''}${x.goed ? `<p class="muted">✅ ${esc(x.goed)}</p>` : ''}${x.mis ? `<p class="muted">⚠️ ${esc(x.mis)}</p>` : ''}</div>`).join('')}` : ''}`;
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
  const fm = state.focusLog.filter(f => f.dag >= addDays(t, -6)).reduce((s, f) => s + f.min, 0);
  r.push(`Focusminuten laatste 7 dagen: ${fm}.`);
  if (weekFocus()) r.push(`Eigen focus voor deze week (uit weekreview): ${weekFocus()}`);
  const rv = state.reviews[reviewWeek()];
  if (rv) r.push(`Weekreview: goed = ${rv.goed || '-'}; mis = ${rv.mis || '-'}; focus volgende week = ${rv.focus || '-'}`);
  hs.filter(h => h.mini).forEach(h => r.push(`Minimale versie van ${h.naam}: ${h.mini}`));
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
  const snel = ['🧠 Hoofd leegmaken', '📋 Plak uit ChatGPT', 'Plan morgen met mij', 'Geef me een eerlijke weekreview', 'Waarom haak ik steeds af?'];
  const spraak = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  return `<div class="sec" style="margin-top:12px"><h2>Wat opvalt</h2><span class="cnt">werkt altijd, ook offline</span></div>
  ${ins.map(x => `<div class="card inzicht"><div class="ico">${x.i}</div><div><h3>${esc(x.t)}</h3><p>${esc(x.p)}</p></div></div>`).join('')}
  <div class="sec"><h2>Coach</h2><span class="cnt">${!['localhost', '127.0.0.1'].includes(location.hostname) ? (lokaal('geheim').openrouter ? 'Claude Haiku (eigen sleutel)' : 'geen sleutel — zie ⚙️') : state.inst.ai === 'cloud' ? 'cloud (Claude Haiku)' : 'lokaal (Ollama)'}</span>${state.coach.length ? '<button class="btn sm r" data-act="wiscoach">Wissen</button>' : ''}</div>
  <div class="card">
    <div class="chat" id="chat">${state.coach.length ? state.coach.map((m, i) => `<div class="msg ${m.rol}">${m.rol === 'ai' ? mdLite(m.tekst) : esc(m.tekst)}</div>${m.rol === 'ai' ? actieKaart(m, i) : ''}`).join('') : '<div class="msg ai"><p>Ik ken je gewoontes, reeksen, taken en logboek. Vraag me wat je wilt — ik ben eerlijk, ook als het tegenvalt.</p><p><b>Tip:</b> vertel me gewoon alles wat je moet doen (typen, praten 🎤 of plakken uit ChatGPT). Ik maak er taken van met datum en al — jij kiest wat erin komt.</p></div>'}${ui.coachBezig ? '<div class="msg ai denk">Coach denkt na…</div>' : ''}</div>
    <div class="chips" style="margin-top:12px">${snel.map(s => `<button class="chip" data-act="coachsnel" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <form class="chatform" data-form="coach"><textarea name="q" rows="1" placeholder="Vraag je coach, of vertel wat je moet doen…" ${ui.coachBezig ? 'disabled' : ''}></textarea>
      ${spraak ? `<button type="button" class="btn mic" data-act="mic" title="Inspreken">🎤</button>` : ''}<button class="btn pri" ${ui.coachBezig ? 'disabled' : ''}>${ic('send')}</button></form>
  </div>`;
}
/* ---------- Datums uit gewone tekst halen ("morgen 10 uur tandarts", "24e pakket bestellen") ---------- */
const DAGNAMEN = { zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4, vrijdag: 5, zaterdag: 6 };
const MAANDNR = { jan: 0, januari: 0, feb: 1, februari: 1, mrt: 2, maart: 2, apr: 3, april: 3, mei: 4, jun: 5, juni: 5, jul: 6, juli: 6, aug: 7, augustus: 7, sep: 8, sept: 8, september: 8, okt: 9, oktober: 9, nov: 10, november: 10, dec: 11, december: 11 };
const WD_RE = 'maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag';
const MAAND_RE = 'januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|sept|jan|feb|mrt|apr|jun|jul|aug|sep|okt|nov|dec';
function datumUit(dag, maand, jaar) {
  const nu = parse(vandaag());
  const y = jaar ? (String(jaar).length === 2 ? 2000 + Number(jaar) : Number(jaar)) : nu.getFullYear();
  const mm = maand ?? nu.getMonth();
  if (dag < 1 || dag > 31 || mm < 0 || mm > 11) return null;
  let d = new Date(y, mm, dag);
  if (d.getMonth() !== mm) return null;
  if (!jaar && ymd(d) < vandaag()) d = maand == null ? new Date(y, mm + 1, dag) : new Date(y + 1, mm, dag); // al geweest → volgende keer
  return ymd(d);
}
function tijdUit(h, min, gok) {
  if (gok && h >= 1 && h <= 7) h += 12;   // "om 5 uur" bedoelt bijna altijd 17:00
  if (h < 0 || h > 23 || min < 0 || min > 59) return '';
  return pad(h) + ':' + pad(min);
}
function leesDatum(invoer, basis) {
  const t = vandaag();
  let s = ' ' + invoer.replace(/\s+/g, ' ') + ' ', datum = null, tijd = '', herhaal = null, prio = 0, m;
  const middag = /avond|middag|'s avonds|'s middags|\bpm\b/i.test(invoer); // "vanavond om 8" = 20:00
  const weg = re => { const x = s.match(re); if (x) s = s.replace(x[0], ' '); return x; };
  const volgendeWd = wd => { let d = addDays(t, 1); while (parse(d).getDay() !== wd) d = addDays(d, 1); return d; };
  // Herhaling
  if ((m = weg(new RegExp(`\\s(?:elke|iedere)\\s+(${WD_RE})\\s`, 'i')))) { const wd = DAGNAMEN[m[1].toLowerCase()]; herhaal = { type: 'week', n: 1 }; datum = parse(t).getDay() === wd ? t : volgendeWd(wd); }
  else if (weg(/\s(?:(?:elke|iedere)\s+werkdag|doordeweeks)\s/i)) herhaal = { type: 'werkdagen', n: 1 };
  else if (weg(/\s(?:(?:elke|iedere)\s+dag|dagelijks)\s/i)) herhaal = { type: 'dag', n: 1 };
  else if (weg(/\s(?:(?:elke|iedere)\s+week|wekelijks)\s/i)) herhaal = { type: 'week', n: 1 };
  else if (weg(/\s(?:(?:elke|iedere)\s+maand|maandelijks)\s/i)) herhaal = { type: 'maand', n: 1 };
  else if (weg(/\s(?:(?:elk|ieder)\s+jaar|jaarlijks)\s/i)) herhaal = { type: 'jaar', n: 1 };
  // Datum
  if (!datum) {
    if (weg(/\s(?:vandaag|vanavond|vanmiddag|vanochtend)\s/i)) datum = t;
    else if (weg(/\sovermorgen\s/i)) datum = addDays(t, 2);
    else if (weg(/\smorgen(?:ochtend|middag|avond|vroeg)?\s/i)) datum = addDays(t, 1);
    else if ((m = weg(/\sover\s+(\d{1,2}|een|twee|drie|vier)\s+(dag|dagen|week|weken)\s/i))) { const n = { een: 1, twee: 2, drie: 3, vier: 4 }[m[1].toLowerCase()] || Number(m[1]); datum = addDays(t, /we/i.test(m[2]) ? 7 * n : n); }
    else if ((m = weg(new RegExp(`\\s(?:op\\s+)?(volgende\\s+week\\s+|volgende\\s+|aanstaande\\s+|komende\\s+)?(${WD_RE})\\s`, 'i')))) {
      datum = volgendeWd(DAGNAMEN[m[2].toLowerCase()]);
      if (m[1] && /volgende/i.test(m[1]) && datum < addDays(maandagVan(t), 7)) datum = addDays(datum, 7);
    }
    else if (weg(/\svolgende\s+week\s/i)) datum = addDays(maandagVan(t), 7);
    else if ((m = weg(new RegExp(`\\s(?:op\\s+)?(?:de\\s+)?(\\d{1,2})(?:e|ste|de)?\\s+(${MAAND_RE})\\.?\\s`, 'i')))) datum = datumUit(Number(m[1]), MAANDNR[m[2].toLowerCase()]);
    else if ((m = weg(/\s(?:op\s+)?(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?\s/))) datum = datumUit(Number(m[1]), Number(m[2]) - 1, m[3]);
    else if ((m = weg(/\s(?:op\s+)?(?:de\s+)?(\d{1,2})(?:e|ste|de)\s/i))) datum = datumUit(Number(m[1]));
  }
  // Tijd
  if ((m = weg(/\s(?:om\s+)?(\d{1,2})[:.](\d{2})(?:\s*uur)?\s/i))) tijd = tijdUit(+m[1], +m[2], false);
  else if ((m = weg(/\som\s+half\s+(\d{1,2})\s/i))) tijd = tijdUit(+m[1] - 1, 30, true);
  else if ((m = weg(/\s(?:om\s+)?(\d{1,2})\s*(?:uur|u)\s/i)) || (m = weg(/\som\s+(\d{1,2})\s/i))) tijd = tijdUit(+m[1], 0, true);
  if (tijd && middag && Number(tijd.slice(0, 2)) < 12) tijd = pad(Number(tijd.slice(0, 2)) + 12) + tijd.slice(2);
  s = s.replace(/\s's\s+(?:avonds|middags|ochtends)\s/i, ' ');
  // Prioriteit: ! = belangrijk, !! = dringend
  if (/!!/.test(s) || /\s(?:dringend|urgent)\s/i.test(s)) prio = 2; else if (/!/.test(s)) prio = 1;
  s = s.replace(/!+/g, ' ');
  let titel = s.replace(/\s+/g, ' ').trim()
    .replace(/^(?:ik\s+)?(?:moet|wil|ga|moeten)\s+(?:ik\s+)?/i, '').replace(/^(?:nog|even|ook)\s+/i, '')
    .replace(/\s+(?:om|op|de|voor|en|nog)$/i, '').replace(/^[,.:;\-\s]+|[,.:;\-\s]+$/g, '').trim();
  if (!titel) titel = invoer.trim();
  titel = titel.charAt(0).toUpperCase() + titel.slice(1);
  const datumGevonden = !!datum;
  if (herhaal && !datum) datum = t;
  return { titel, datum: datum || basis, tijd, herhaal, prio, gevonden: datumGevonden || !!tijd || !!herhaal || prio > 0, datumGevonden };
}
function datumHint(p) {
  if (!p.gevonden) return '';
  return `${p.datumGevonden || p.herhaal ? '📅 ' + dagLabel(p.datum) : ''}${p.tijd ? ' · ⏰ ' + p.tijd : ''}${p.herhaal ? ' · 🔁 ' + herhaalLabel(p.herhaal) : ''}${p.prio === 2 ? ' · 🔴 dringend' : p.prio === 1 ? ' · 🟡 belangrijk' : ''} → <b>${esc(p.titel)}</b>`;
}

/* ---------- Coach → taken en gewoontes ("hoofd leegmaken") ---------- */
const HERHAAL_TYPES = ['dag', 'werkdagen', 'week', 'maand', 'jaar'];
function actieInstructie() {
  const t = vandaag();
  const dagen = Array.from({ length: 14 }, (_, i) => { const d = addDays(t, i); return `${WD_LANG[parse(d).getDay()]} = ${d}`; }).join(', ');
  return `\n\nTAKEN HERKENNEN: Noemt de gebruiker dingen die hij moet of wil doen (ook in een lange tekst, ingesproken tekst of een geplakt ChatGPT-gesprek), of vraagt hij je iets te plannen? Zet dan HELEMAAL ONDERAAN je antwoord precies één blok:
\`\`\`acties
{"taken":[{"titel":"Portfolio inleveren","datum":"2026-01-30","tijd":"17:00","prio":2,"herhaal":null,"subtaken":["Bronnen checken"]}],"gewoontes":[{"naam":"20 min lezen","emoji":"📚","mini":"1 bladzijde"}]}
\`\`\`
Regels:
- titel: kort en concreet, begin met een werkwoord. Eén taak per ding; geen dubbele.
- datum: JJJJ-MM-DD of null als er geen dag genoemd is. Vandaag is ${WD_LANG[parse(t).getDay()]} ${t}. Komende dagen: ${dagen}. "Volgende week" zonder dag = maandag van volgende week. Alleen een dagnummer ("de 24e") = eerstvolgende datum met dat nummer (deze maand, of volgende maand als die al geweest is).
- tijd: "UU:MM" of "" als er geen tijd genoemd is.
- prio: 0 normaal, 1 belangrijk, 2 deadline/dringend.
- herhaal: null, of {"type":"dag|werkdagen|week|maand|jaar","n":1} als het terugkomt ("elke vrijdag" = week met de datum van de eerstvolgende vrijdag).
- subtaken: alleen als een taak duidelijk uit stappen bestaat.
- gewoontes: alleen voor iets dat de gebruiker (bijna) dagelijks wil gaan doen voor zichzelf; met een kleine "mini"-versie.
- Alleen NIEUWE dingen uit het LAATSTE bericht van de gebruiker. Wat al in de open taken (zie data) of in eerdere berichten staat, zet je NIET opnieuw klaar.
- In je gewone tekst NIET de JSON herhalen; zeg kort wat je hebt klaargezet en geef 1 tip (bijv. wat het eerst moet). Geen taken genoemd? Dan geen blok.`;
}
function haalActies(tekst) {
  const m = tekst.match(/```(?:acties|json)?\s*(\{[\s\S]*?\})\s*```/);
  if (!m) return { tekst, acties: null };
  let a = null;
  try {
    const j = JSON.parse(m[1]);
    a = {
      taken: (j.taken || []).filter(x => x && x.titel).slice(0, 40).map(x => ({
        titel: String(x.titel).slice(0, 140),
        datum: /^\d{4}-\d{2}-\d{2}$/.test(x.datum) ? x.datum : null,
        tijd: /^\d{2}:\d{2}$/.test(x.tijd) ? x.tijd : '',
        prio: [0, 1, 2].includes(Number(x.prio)) ? Number(x.prio) : 0,
        herhaal: x.herhaal && HERHAAL_TYPES.includes(x.herhaal.type) ? { type: x.herhaal.type, n: Math.max(1, Number(x.herhaal.n) || 1) } : null,
        subtaken: Array.isArray(x.subtaken) ? x.subtaken.filter(s => typeof s === 'string' && s.trim()).slice(0, 20) : []
      })),
      gewoontes: (j.gewoontes || []).filter(x => x && x.naam).slice(0, 5).map(x => ({ naam: String(x.naam).slice(0, 60), emoji: String(x.emoji || '✨').slice(0, 4), mini: String(x.mini || '').slice(0, 60) }))
    };
    if (!a.taken.length && !a.gewoontes.length) a = null;
  } catch (e) { a = null; }
  const rest = tekst.replace(m[0], '').trim();
  return { tekst: rest || (a ? 'Ik heb dit voor je klaargezet:' : tekst), acties: a };
}
function actieKaart(m, i) {
  const a = m.acties; if (!a) return '';
  if (m.toegevoegd != null) return `<div class="actiekaart klaar">✅ ${m.toegevoegd} ${m.toegevoegd === 1 ? 'ding' : 'dingen'} in Ritme gezet</div>`;
  // Staat iets al (bijna) zo in je open taken of gewoontes? Dan standaard uitgevinkt.
  const norm = s => s.toLowerCase().replace(/[^a-z0-9à-ü]+/g, ' ').trim();
  const bestaandT = new Set(state.taken.filter(k => !k.klaar).map(k => norm(k.titel)));
  const bestaandG = new Set(actieveGewoontes().map(h => norm(h.naam)));
  const items = [
    ...a.taken.map((k, j) => ({ v: 't' + j, al: bestaandT.has(norm(k.titel)), html: `<b>📌 ${esc(k.titel)}</b><small>${bestaandT.has(norm(k.titel)) ? '⚠️ staat al in je lijst · ' : ''}${[k.datum ? dagLabel(k.datum, true) : 'geen datum', k.tijd, k.prio === 2 ? '🔴 deadline' : k.prio === 1 ? '🟡 belangrijk' : '', k.herhaal ? '🔁 ' + herhaalLabel(k.herhaal) : '', k.subtaken.length ? `☑ ${k.subtaken.length} subtaken` : ''].filter(Boolean).join(' · ')}</small>` })),
    ...a.gewoontes.map((h, j) => ({ v: 'g' + j, al: bestaandG.has(norm(h.naam)), html: `<b>${esc(h.emoji)} Nieuwe gewoonte: ${esc(h.naam)}</b><small>${bestaandG.has(norm(h.naam)) ? '⚠️ heb je al · ' : ''}elke dag${h.mini ? ' · minimaal: ' + esc(h.mini) : ''}</small>` }))
  ];
  return `<div class="actiekaart" data-i="${i}">
    ${items.map(x => `<label><input type="checkbox" value="${x.v}" ${x.al ? '' : 'checked'}><span>${x.html}</span></label>`).join('')}
    <button class="btn pri full" data-act="coachtoevoegen" data-i="${i}">${ic('plus')}Zet in Ritme</button>
    <p class="uitleg" style="margin:6px 0 0;text-align:center">Vink uit wat niet klopt. Daarna kun je alles nog aanpassen.</p></div>`;
}
// Inspreken: tekst komt in het invoerveld, jij verstuurt zelf
let herkenner = null;
function spreek(knop) {
  const veld = document.querySelector('[data-form=coach] textarea');
  if (herkenner) { herkenner.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast('Inspreken werkt niet in deze browser');
  const r = new SR();
  r.lang = 'nl-NL'; r.continuous = true; r.interimResults = true;
  const basis = veld.value ? veld.value.trim() + ' ' : '';
  r.onresult = e => { veld.value = basis + [...e.results].map(x => x[0].transcript).join(' '); veld.rows = Math.min(8, Math.max(2, Math.ceil(veld.value.length / 38))); };
  r.onerror = e => { if (e.error === 'not-allowed') toast('Geef de app toegang tot je microfoon'); };
  r.onend = () => { herkenner = null; knop.classList.remove('opname'); knop.textContent = '🎤'; };
  herkenner = r; r.start();
  knop.classList.add('opname'); knop.textContent = '⏹';
  toast('Praat maar… tik ⏹ als je klaar bent');
}

async function vraagCoach(q) {
  if (!q || ui.coachBezig) return;
  state.coach.push({ rol: 'user', tekst: q });
  ui.coachBezig = true; bewaar(); render(); scrollChat();
  const sys = `Je bent de coach in Ritme, een app voor gewoontes en taken. Je praat met een HBO ICT-student. Stijl: eerlijk, direct en uitdagend, maar warm. Gewoon Nederlands, kort (max ±130 woorden), concreet, eindig met 1–3 acties. Gebruik de data hieronder; verzin geen cijfers. Geen medische of financiële adviezen.\n\nDATA VAN DE GEBRUIKER:\n${profielVoorAI()}` + actieInstructie();
  const geschiedenis = state.coach.slice(-10).map(m => ({ role: m.rol === 'user' ? 'user' : 'assistant', content: m.tekst }));
  const messages = [{ role: 'system', content: sys }, ...geschiedenis];
  let antwoord;
  const opLaptop = ['localhost', '127.0.0.1'].includes(location.hostname);
  const sleutel = lokaal('geheim').openrouter;
  try {
    if (!opLaptop && sleutel) {
      // Op je telefoon: rechtstreeks naar OpenRouter met je eigen sleutel (die alleen op dit toestel staat)
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + sleutel, 'Content-Type': 'application/json', 'X-Title': 'Ritme' },
        body: JSON.stringify({ model: 'anthropic/claude-haiku-5.5', temperature: .4, max_tokens: 1800, messages })
      });
      const j = await r.json();
      if (!j.choices) throw new Error(j.error?.message || 'OpenRouter gaf geen antwoord');
      antwoord = j.choices[0].message.content || 'Leeg antwoord. Probeer het nog eens.';
    } else {
    if (location.protocol === 'file:') throw new Error('file');
    const r = state.inst.ai === 'cloud'
      ? await fetch('/api/cloud', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) })
      : await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'qwen3.5:4b', messages, stream: false, think: false, keep_alive: -1, options: { num_ctx: 16384, temperature: .5 } }) });
    const tekst = (await r.text()).trim().split('\n').pop();
    const j = JSON.parse(tekst);
    if (j.error) throw new Error(j.error);
    antwoord = (j.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim() || 'Ik kreeg een leeg antwoord. Probeer het nog eens.';
    }
  } catch (e) {
    antwoord = !opLaptop
      ? (sleutel ? 'Er ging iets mis met de AI: ' + e.message : 'Op je telefoon heb ik een eigen OpenRouter-sleutel nodig. Vul die in bij ⚙️ → AI-coach. De inzichten hierboven werken wel altijd.')
      : e.message === 'file' || e instanceof TypeError || e instanceof SyntaxError
        ? 'Ik kan de AI niet bereiken. Start de app via **Start Ritme.cmd** op je laptop (en zorg dat Ollama draait). De inzichten hierboven werken wel altijd.'
        : 'Er ging iets mis: ' + e.message;
  }
  const { tekst: schoon, acties } = haalActies(antwoord);
  state.coach.push({ rol: 'ai', tekst: schoon, acties });
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
    <label class="veld"><span>Minimale versie — voor slechte dagen</span><input name="mini" value="${esc(h.mini || '')}" maxlength="60" placeholder="Bijv. 1 bladzijde, 1 rondje om het blok"></label>
    <p class="uitleg" style="margin:-6px 0 12px">Redt je reeks op een zware dag (+4 XP in plaats van +10). Telt niet voor een perfecte dag.</p>
    <div class="velden2"><label class="veld"><span>Doel per dag (aantal)</span><input type="number" name="doel" min="1" max="99" value="${h.doel || 1}"></label><label class="veld"><span>Eenheid</span><input name="eenheid" value="${esc(h.eenheid || '')}" maxlength="15" placeholder="glazen, km…"></label></div>
    <div class="velden2"><label class="veld"><span>Herinnering</span><input type="time" name="herinnering" value="${h.herinnering || ''}"></label><label class="veld"><span>Timer (minuten)</span><input type="number" name="minuten" min="0" max="240" value="${h.minuten || ''}" placeholder="bijv. 30"></label></div>
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
      const data = {
        naam: fd.get('naam').trim(), emoji: fd.get('emoji').trim() || '✨', kleur: fd.get('kleur') || KLEUREN[0], dagen, herinnering: fd.get('herinnering') || '',
        mini: fd.get('mini').trim(), doel: Math.max(1, Number(fd.get('doel')) || 1), eenheid: fd.get('eenheid').trim(), minuten: Number(fd.get('minuten')) || 0
      };
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
    <div class="velden2"><label class="veld"><span>Herhalen</span><select name="herhaal">
      ${[['', 'Niet'], ['dag', 'Elke dag'], ['werkdagen', 'Elke werkdag'], ['week', 'Elke week'], ['maand', 'Elke maand'], ['jaar', 'Elk jaar']].map(([v, l]) => `<option value="${v}" ${(k.herhaal?.type || '') === v ? 'selected' : ''}>${l}</option>`).join('')}
    </select></label><label class="veld"><span>Om de</span><input type="number" name="herhaaln" min="1" max="12" value="${k.herhaal?.n || 1}"></label></div>
    <div class="veld"><span>Subtaken</span><div id="subs"></div><div class="add" style="margin:6px 0 0"><input id="subnieuw" placeholder="Subtaak toevoegen…" maxlength="100"><button type="button" class="btn" id="subplus">${ic('plus')}</button></div></div>
    <label class="veld"><span>Notitie</span><textarea name="notitie" placeholder="Details, links, eerste stap…">${esc(k.notitie || '')}</textarea></label>
    ${k.lijst ? `<p class="uitleg">Lijst: ${esc(k.lijst)}</p>` : ''}
    ${!nieuw && k.verschoven ? `<p class="uitleg">Deze taak is ${k.verschoven}× doorgeschoven.</p>` : ''}
    ${!nieuw && !k.klaar ? `<button type="button" class="btn full" style="margin-top:12px" data-x="focus">🎯 Focus-sessie op deze taak</button>` : ''}
    <div class="knoppen">${!nieuw ? '<button type="button" class="btn red" data-x="del">Verwijderen</button>' : ''}<button class="btn pri">${nieuw ? 'Toevoegen' : 'Opslaan'}</button></div>
  </form>`, pan => {
    const f = pan.querySelector('#tform');
    let subs = (k.subtaken || []).map(s => ({ ...s }));
    const tekenSubs = () => {
      pan.querySelector('#subs').innerHTML = subs.map((s, i) => `<div class="sub"><input type="checkbox" data-i="${i}" ${s.klaar ? 'checked' : ''}><span class="grow ${s.klaar ? 'af' : ''}">${esc(s.titel)}</span><button type="button" class="ibtn" data-del="${i}" title="Weg">${ic('x')}</button></div>`).join('');
    };
    const subsBewaren = () => { if (!nieuw) { k.subtaken = subs.map(s => ({ ...s })); bewaar(); render(); } };
    tekenSubs();
    pan.querySelector('#subs').addEventListener('change', e => { const s = subs[e.target.dataset.i]; if (s) { s.klaar = e.target.checked; tekenSubs(); subsBewaren(); } });
    pan.querySelector('#subs').addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (b) { subs.splice(Number(b.dataset.del), 1); tekenSubs(); subsBewaren(); } });
    const voegSubToe = () => { const inp = pan.querySelector('#subnieuw'); const v = inp.value.trim(); if (!v) return; subs.push({ id: uid(), titel: v, klaar: false }); inp.value = ''; tekenSubs(); subsBewaren(); inp.focus(); };
    pan.querySelector('#subplus').onclick = voegSubToe;
    pan.querySelector('#subnieuw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); voegSubToe(); } });
    pan.querySelector('[data-x=focus]')?.addEventListener('click', () => focusKiezen(k.titel, { taakId: k.id }, 25));
    pan.querySelectorAll('[data-dat]').forEach(b => b.onclick = () => { f.datum.value = b.dataset.dat; });
    pan.querySelectorAll('input[name=prio]').forEach(r => r.onchange = () => pan.querySelectorAll('input[name=prio]').forEach(x => x.parentElement.classList.toggle('on', x.checked)));
    pan.querySelector('[data-x=del]')?.addEventListener('click', () => { const terug = snapshot(); state.taken = state.taken.filter(x => x.id !== k.id); bewaar(); sluitSheet(); render(); toast('Taak verwijderd', terug); });
    f.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(f);
      const hr = fd.get('herhaal');
      const data = {
        titel: fd.get('titel').trim(), datum: fd.get('datum') || null, tijd: fd.get('tijd') || '', prio: Number(fd.get('prio') || 0), notitie: fd.get('notitie').trim(),
        herhaal: hr ? { type: hr, n: Math.max(1, Number(fd.get('herhaaln')) || 1) } : null, subtaken: subs
      };
      if (data.herhaal && !data.datum) data.datum = vandaag();
      if (nieuw) state.taken.push({ id: uid(), klaar: false, klaarOp: null, verschoven: 0, aangemaakt: vandaag(), ...data });
      else Object.assign(k, data);
      bewaar(); sluitSheet(); render(); toast(nieuw ? 'Taak toegevoegd' : 'Opgeslagen');
    };
    if (nieuw) setTimeout(() => f.titel.focus(), 250);
  });
}

/* ---------- Gewoonte-detail (tik op een gewoonte) ---------- */
function habSheet(h, dag) {
  const t = vandaag(), toekomst = dag > t, s = status(h, dag), n = teller(h, dag), sc = score(h, 30);
  const knop = (x, icoon, titel, sub, aan) => `<button type="button" class="actie ${aan ? 'on' : ''}" data-x="${x}"><span class="ai">${icoon}</span><span class="grow"><b>${titel}</b>${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  openSheet(`<h2>${esc(h.emoji)} ${esc(h.naam)}</h2>
    <p class="muted" style="margin:-8px 0 14px;font-size:13.5px">${dagLabel(dag)} · 🔥 ${streak(h)} reeks · record ${besteStreak(h)} · ${sc == null ? '–' : Math.round(sc * 100) + '%'} in 30 dagen</p>
    ${h.doel > 1 && !toekomst ? `<div class="stepper"><button type="button" class="btn" data-x="min">−</button><div><b>${n}</b><span class="muted">/${h.doel}</span><small>${esc(h.eenheid || '')}</small></div><button type="button" class="btn pri" data-x="plus">+</button></div>` : ''}
    <div class="acties">
      ${!toekomst ? knop('klaar', '✓', 'Helemaal gedaan', '+10 XP', s === 'klaar') : ''}
      ${!toekomst && h.mini ? knop('mini', '½', 'Minimale versie: ' + esc(h.mini), 'Reeks gered · +4 XP', s === 'mini') : ''}
      ${knop('skip', '↷', 'Overslaan', 'Reeks blijft staan, morgen weer', s === 'skip')}
      ${!toekomst ? knop('gemist', '✕', 'Gemist', 'Reeks breekt, gewoonte blijft in je lijst', s === 'gemist') : ''}
      ${state.log[dag]?.[h.id] ? knop('leeg', '⟲', 'Leegmaken', 'Terug naar open', false) : ''}
    </div>
    ${dag === t && !gedaan(s) ? `<button type="button" class="btn full" style="margin-top:12px" data-x="timer">🎯 Start timer${h.minuten ? ` (${h.minuten} min)` : ''}</button>` : ''}
    ${!h.mini ? '<p class="uitleg" style="margin-top:12px">Tip: geef deze gewoonte een minimale versie voor slechte dagen (via Bewerken).</p>' : ''}
    <div class="knoppen"><button type="button" class="btn" data-x="bewerk">Bewerken</button><button type="button" class="btn" data-act="sluit">Sluiten</button></div>`, pan => {
    pan.addEventListener('click', e => {
      const b = e.target.closest('[data-x]'); if (!b) return;
      const x = b.dataset.x;
      if (['klaar', 'mini', 'skip', 'gemist'].includes(x)) { sluitSheet(); habActie(h, dag, x); }
      if (x === 'leeg') { const terug = snapshot(); zet(h, dag, null); if (state.tellers[dag]) delete state.tellers[dag][h.id]; bewaar(); sluitSheet(); render(); toast('Leeggemaakt', terug); }
      if (x === 'plus' || x === 'min') { telBij(h, dag, x === 'plus' ? 1 : -1); habSheet(h, dag); }
      if (x === 'timer') focusKiezen(h.naam, { habId: h.id }, h.minuten || 25);
      if (x === 'bewerk') gewoonteForm(h);
    });
  });
}
// Eén plek voor afvinken / minimaal / overslaan / gemist (met ongedaan maken)
function habActie(h, dag, s, terug) {
  terug = terug || snapshot();
  const was = state.log[dag]?.[h.id];
  const voor = dagVoortgang(dag);
  const nieuw = was === s ? null : s;
  zet(h, dag, nieuw);
  if (h.doel > 1 && was === 'klaar' && nieuw !== 'klaar') { state.tellers[dag] = state.tellers[dag] || {}; state.tellers[dag][h.id] = Math.min(teller(h, dag), h.doel - 1); }
  if (h.doel > 1 && nieuw === 'klaar') { state.tellers[dag] = state.tellers[dag] || {}; state.tellers[dag][h.id] = h.doel; }
  bewaar();
  const na = dagVoortgang(dag);
  let msg = 'Teruggezet naar open';
  if (nieuw === 'klaar') {
    if (!perfect(voor) && perfect(na)) { confetti(90); msg = '🔥 Perfecte dag! +25 XP bonus'; }
    else { const st = streak(h); msg = st > 1 && st % 7 === 0 ? `🔥 ${st} dagen op rij! Week vol!` : `+10 XP · ${h.naam}${st > 1 ? ` · reeks ${st}` : ''}`; }
    if (navigator.vibrate) navigator.vibrate(18);
  } else if (nieuw === 'mini') msg = `½ Minimaal gedaan. Reeks gered (${streak(h)}). +4 XP`;
  else if (nieuw === 'skip') msg = 'Overgeslagen. Reeks blijft, morgen weer.';
  else if (nieuw === 'gemist') msg = 'Gemist. Morgen staat hij er gewoon weer.';
  render(); toast(msg, terug); checkLevelUp();
}
function telBij(h, dag, d) {
  const terug = snapshot();
  state.tellers[dag] = state.tellers[dag] || {};
  const n = Math.max(0, Math.min(h.doel, teller(h, dag) + d));
  state.tellers[dag][h.id] = n;
  const s = state.log[dag]?.[h.id];
  if (n >= h.doel && s !== 'klaar') return habActie(h, dag, 'klaar', terug);
  if (n < h.doel && s === 'klaar') zet(h, dag, null);
  bewaar(); render(); toast(`${h.emoji} ${n}/${h.doel} ${h.eenheid || ''}`, terug);
}

/* ---------- Focustimer ---------- */
function focusKiezen(label, ref, standaard) {
  const opties = [...new Set([15, 25, 45, 60, standaard])].sort((a, b) => a - b);
  openSheet(`<h2>🎯 Focus</h2><p class="muted" style="margin:-8px 0 14px">${esc(label)}</p>
    <div class="chips">${opties.map(m => `<button type="button" class="chip ${m === standaard ? 'on' : ''}" data-m="${m}">${m} min</button>`).join('')}</div>
    <p class="uitleg" style="margin-top:12px">Telefoon op stil, één ding tegelijk. ${ref.habId ? 'Loopt de timer af, dan wordt de gewoonte vanzelf afgevinkt.' : 'Elke 5 minuten focus = +2 XP.'}</p>
    <div class="knoppen"><button type="button" class="btn pri" data-start>▶ Start</button></div>`, pan => {
    let m = standaard;
    pan.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { m = Number(b.dataset.m); pan.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); });
    pan.querySelector('[data-start]').onclick = () => { sluitSheet(); startFocus(m, label, ref); };
  });
}
function startFocus(min, label, ref) {
  state.focus = { id: uid(), label, duur: min, eind: Date.now() + min * 60000, rest: null, ...ref };
  bewaar(); renderFocus(); toast(`🎯 ${min} min focus. Gaan.`);
}
function focusRest(f) { return f.rest != null ? f.rest : Math.max(0, f.eind - Date.now()); }
function renderFocus() {
  const el = $('#focus'), f = state.focus;
  document.body.classList.toggle('focus-aan', !!f);
  if (!f) { el.innerHTML = ''; el.dataset.k = ''; return; }
  const ms = focusRest(f), sleutel = f.id + (f.rest != null ? 'p' : '');
  if (el.dataset.k !== sleutel) {
    el.dataset.k = sleutel;
    el.innerHTML = `<div class="fpan"><div class="fbar"><span></span></div><div class="row"><span style="font-size:20px">🎯</span><div class="grow"><b class="ftijd"></b><small>${esc(f.label)}</small></div>
      <button class="btn sm" data-act="focuspauze">${f.rest != null ? '▶ Verder' : '❚❚ Pauze'}</button><button class="btn sm" data-act="focusstop">Stop</button></div></div>`;
  }
  el.querySelector('.ftijd').textContent = `${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)}`;
  el.querySelector('.fbar span').style.width = (100 * (1 - ms / (f.duur * 60000))) + '%';
  if (f.rest == null && ms <= 0) focusKlaar();
}
function focusKlaar(minuten) {
  const f = state.focus; if (!f) return;
  state.focus = null;
  const min = minuten ?? f.duur;
  state.focusLog.push({ dag: vandaag(), min, label: f.label });
  state.focusLog = state.focusLog.slice(-600);
  let extra = '';
  if (f.habId && minuten == null) { const h = gewoonte(f.habId); if (h && !gedaan(status(h, vandaag()))) { zet(h, vandaag(), 'klaar'); extra = ` · ${h.naam} afgevinkt`; } }
  bewaar(); render();
  if (minuten == null) { piep(); meld('🎯 Focus klaar', `${min} min: ${f.label}`, 'focus'); confetti(40); }
  toast(`🎯 ${min} min focus erop${extra}`); checkLevelUp();
}
function piep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, .22, .44].forEach((t, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = i === 2 ? 1046 : 784; g.gain.setValueAtTime(.18, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t + .18); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .2); });
  } catch (e) { /* geen geluid */ }
  if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
}

/* ---------- Import uit TickTick (CSV-back-up) ---------- */
function parseCSV(text) {
  const rijen = []; let rij = [], veld = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { veld += '"'; i++; } else q = false; } else veld += c; }
    else if (c === '"') q = true;
    else if (c === ',') { rij.push(veld); veld = ''; }
    else if (c === '\n') { rij.push(veld); rijen.push(rij); rij = []; veld = ''; }
    else if (c !== '\r') veld += c;
  }
  if (veld || rij.length) { rij.push(veld); rijen.push(rij); }
  return rijen;
}
function rruleNaarHerhaal(s) {
  if (!s) return null;
  const m = k => (s.match(new RegExp(k + '=([^;]+)')) || [])[1];
  const f = m('FREQ'), n = Number(m('INTERVAL')) || 1, by = m('BYDAY');
  if (f === 'DAILY') return { type: 'dag', n };
  if (f === 'WEEKLY') return by && by.split(',').sort().join() === 'FR,MO,TH,TU,WE' ? { type: 'werkdagen', n: 1 } : { type: 'week', n };
  if (f === 'MONTHLY') return { type: 'maand', n };
  if (f === 'YEARLY') return { type: 'jaar', n };
  return null;
}
function leesTickTick(text) {
  const rijen = parseCSV(text.replace(/^﻿/, ''));
  const hi = rijen.findIndex(r => r.includes('Title') && r.includes('Status'));
  if (hi < 0) throw new Error('Geen TickTick-kolommen gevonden');
  const H = rijen[hi], perId = {}, alle = [];
  rijen.slice(hi + 1).forEach(r => {
    if (r.length < 5) return;
    const g = n => { const i = H.indexOf(n); return i < 0 ? '' : (r[i] || '').trim(); };
    if (g('Status') !== '0') return;                     // alleen open taken
    if (g('Kind').toUpperCase() === 'NOTE') return;
    const titel = g('Title'); if (!titel) return;
    let datum = null, tijd = '';
    const ruw = g('Due Date') || g('Start Date');
    if (ruw) {
      const d = new Date(ruw.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
      if (!isNaN(d)) { datum = ymd(d); if (g('Is All Day').toLowerCase() !== 'true') tijd = pad(d.getHours()) + ':' + pad(d.getMinutes()); }
    }
    const pr = Number(g('Priority')) || 0;
    let notitie = g('Content'), subtaken = [];
    if (g('Is Check list') === 'Y') {
      subtaken = notitie.split('\n').map(x => x.trim()).filter(Boolean).map(x => ({ id: uid(), titel: x.replace(/^[▫▪]\s*/, ''), klaar: x.startsWith('▪') }));
      notitie = '';
    }
    const taak = {
      id: uid(), titel, datum, tijd: tijd === '00:00' ? '' : tijd, prio: pr >= 5 ? 2 : pr >= 3 ? 1 : 0, notitie: notitie.slice(0, 2000),
      lijst: g('List Name'), herhaal: rruleNaarHerhaal(g('Repeat')), subtaken, klaar: false, klaarOp: null, verschoven: 0, aangemaakt: vandaag(), bron: 'ticktick'
    };
    if (taak.herhaal && !taak.datum) taak.datum = vandaag();
    const tid = g('taskId'), pid = g('parentId');
    if (tid) perId[tid] = taak;
    if (pid) taak._ouder = pid;
    alle.push(taak);
  });
  // Subtaken (taken met een ouder) onder hun ouder hangen
  return alle.filter(t => {
    if (t._ouder && perId[t._ouder]) { perId[t._ouder].subtaken.push({ id: uid(), titel: t.titel, klaar: false }); return false; }
    delete t._ouder; return true;
  });
}
function tickTickForm(taken) {
  const bestaand = new Set(state.taken.map(k => k.titel + '|' + k.datum));
  const nieuw = taken.filter(k => !bestaand.has(k.titel + '|' + k.datum));
  const lijsten = {}; nieuw.forEach(k => { lijsten[k.lijst || 'Inbox'] = (lijsten[k.lijst || 'Inbox'] || 0) + 1; });
  openSheet(`<h2>Import uit TickTick</h2>
    <p class="muted" style="margin:-6px 0 12px">${nieuw.length} open taken gevonden${taken.length > nieuw.length ? ` (${taken.length - nieuw.length} heb je al)` : ''}. Kies welke lijsten je wilt overnemen:</p>
    <div class="keuze">${Object.entries(lijsten).map(([l, n]) => `<label><input type="checkbox" value="${esc(l)}" checked><span><span class="t">${esc(l)}</span><small>${n} taken</small></span></label>`).join('') || '<p class="muted">Niets nieuws om te importeren.</p>'}</div>
    <p class="uitleg" style="margin-top:10px">Herhalende taken, subtaken, prioriteit en datums gaan mee. Afgeronde taken niet.</p>
    <div class="knoppen"><button type="button" class="btn" data-act="sluit">Annuleren</button><button type="button" class="btn pri" data-go ${nieuw.length ? '' : 'disabled'}>Importeren</button></div>`, pan => {
    pan.querySelector('[data-go]').onclick = () => {
      const gekozen = new Set([...pan.querySelectorAll('.keuze input:checked')].map(i => i.value));
      const erin = nieuw.filter(k => gekozen.has(k.lijst || 'Inbox'));
      const terug = snapshot();
      state.taken.push(...erin); bewaar(); sluitSheet(); render();
      toast(`📥 ${erin.length} taken uit TickTick geïmporteerd`, terug);
    };
  });
}

/* ---------- Sync via een privé GitHub-repo ---------- */
const enc = s => btoa(unescape(encodeURIComponent(s)));
const dec = s => decodeURIComponent(escape(atob(s.replace(/\s/g, ''))));
async function ghApi(cfg, opts = {}) {
  return fetch(`https://api.github.com/repos/${cfg.repo}/contents/ritme.json`, {
    ...opts, cache: 'no-store',
    headers: { 'Authorization': 'Bearer ' + cfg.token, 'Accept': 'application/vnd.github+json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) }
  });
}
let syncTimer, syncBezig = false;
function planSync() { if (!lokaal('sync').token) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNu(true), 3000); }
async function syncNu(stil) {
  const c = lokaal('sync');
  if (!c.token || !c.repo || syncBezig || !navigator.onLine) return;
  syncBezig = true;
  try {
    const r = await ghApi(c);
    let remote = null, sha = null;
    if (r.status === 200) { const j = await r.json(); sha = j.sha; remote = JSON.parse(dec(j.content)); }
    else if (r.status === 401) throw new Error('sleutel ongeldig of verlopen');
    else if (r.status === 403 || r.status === 404 && !(await fetch(`https://api.github.com/repos/${c.repo}`, { headers: { 'Authorization': 'Bearer ' + c.token } })).ok) throw new Error('geen toegang tot ' + c.repo);
    else if (r.status !== 404) throw new Error('GitHub ' + r.status);
    const lokaalT = state.bijgewerkt || 0, remoteT = remote?.bijgewerkt || 0;
    if (remote && remoteT > lokaalT) {
      // Andere telefoon/laptop is nieuwer: ophalen. Had je hier óók iets veranderd? Dan bewaren we jouw versie als reservekopie.
      if (lokaalT > (c.laatst || 0)) try { localStorage.setItem('ritme-reserve', JSON.stringify(state)); } catch (e) { /* vol */ }
      const focus = state.focus, gemeld = state.gemeld;
      state = vanJSON(remote); state.focus = focus; state.gemeld = gemeld;
      bewaar(false); render();
      if (!stil) toast('⬇️ Nieuwste gegevens opgehaald');
    } else if (!remote || lokaalT > remoteT) {
      const kopie = { ...state, focus: null, gemeld: {} };
      const p = await ghApi(c, { method: 'PUT', body: JSON.stringify({ message: 'Ritme sync', content: enc(JSON.stringify(kopie)), ...(sha ? { sha } : {}) }) });
      if (p.status === 409 || p.status === 422) { syncBezig = false; return syncNu(stil); }
      if (!p.ok) throw new Error('opslaan mislukt (' + p.status + ')');
      if (!stil) toast('⬆️ Gesynchroniseerd');
    } else if (!stil) toast('✅ Alles is al gelijk');
    Object.assign(c, { laatst: Math.max(lokaalT, remoteT), wanneer: Date.now(), fout: null });
  } catch (e) {
    c.fout = e.message;
    if (!stil) toast('Sync mislukt: ' + e.message);
  }
  lokaal('sync', c);
  syncBezig = false;
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
  <label class="veld" style="margin-top:12px"><span>OpenRouter-sleutel (voor de coach op je telefoon)</span><input type="password" data-x="orkey" placeholder="${lokaal('geheim').openrouter ? '•••••••• (ingesteld)' : 'sk-or-…'}" autocomplete="off"></label>
  <p class="uitleg">Alleen nodig op je telefoon. Blijft op dit toestel en gaat nooit mee in de sync. Tip: maak op openrouter.ai een aparte sleutel met een limiet van bijv. $2.</p>

  <h3>Synchroniseren</h3>
  ${(() => { const c = lokaal('sync'); return c.token ? `
    <p style="margin:0 0 8px">🔗 Gekoppeld aan <b>${esc(c.repo)}</b></p>
    <p class="uitleg" style="margin-bottom:8px">${c.fout ? `<span style="color:var(--red)">Laatste poging mislukt: ${esc(c.fout)}</span>` : c.wanneer ? 'Laatst gesynchroniseerd: ' + new Date(c.wanneer).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }) : 'Nog niet gesynchroniseerd.'}</p>
    <div class="knoppen" style="margin-top:0"><button class="btn" data-x="syncnu">Nu synchroniseren</button><button class="btn red" data-x="ontkoppel">Ontkoppelen</button></div>` : `
    <p class="uitleg" style="margin-bottom:8px">Zelfde gegevens op je telefoon én laptop, via een privé GitHub-repo. Gratis, en alleen jij kunt erbij.</p>
    <label class="veld"><span>Repo</span><input data-x="repo" value="PerryHarmsen/ritme-data"></label>
    <label class="veld"><span>GitHub-sleutel (fine-grained token)</span><input type="password" data-x="token" placeholder="github_pat_…" autocomplete="off"></label>
    <button class="btn pri full" data-x="koppel">Koppelen</button>`; })()}

  <h3>Importeren uit TickTick</h3>
  <p class="uitleg" style="margin-bottom:8px">In TickTick: Instellingen → Account → Back-up genereren. Kies hier dat CSV-bestand.</p>
  <button class="btn full" data-x="ticktick">📥 TickTick-back-up kiezen</button>
  <input type="file" accept=".csv,text/csv" data-x="tickbestand" hidden>

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
      if (x === 'ticktick') pan.querySelector('[data-x=tickbestand]').click();
      if (x === 'syncnu') syncNu(false).then(() => { if ($('#sheet').classList.contains('open')) instellingenForm(); });
      if (x === 'ontkoppel' && confirm('Sync ontkoppelen op dit toestel? Je gegevens blijven gewoon staan.')) { lokaal('sync', {}); instellingenForm(); }
      if (x === 'koppel') {
        const repo = pan.querySelector('[data-x=repo]').value.trim(), token = pan.querySelector('[data-x=token]').value.trim();
        if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !token) return toast('Vul repo en sleutel in');
        lokaal('sync', { repo, token, laatst: 0 });
        toast('Koppelen…');
        syncNu(false).then(() => instellingenForm());
      }
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
    pan.querySelector('[data-x=orkey]').onchange = e => { const g = lokaal('geheim'); g.openrouter = e.target.value.trim() || undefined; lokaal('geheim', g); e.target.value = ''; e.target.placeholder = g.openrouter ? '•••••••• (ingesteld)' : 'sk-or-…'; toast(g.openrouter ? 'Sleutel bewaard op dit toestel' : 'Sleutel verwijderd'); };
    pan.querySelector('[data-x=tickbestand]').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => { try { tickTickForm(leesTickTick(rd.result)); } catch (err) { toast('Dit lijkt geen TickTick-back-up: ' + err.message); } };
      rd.readAsText(file);
    };
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
  hab: el => habActie(gewoonte(el.dataset.id), ui.tab === 'uitdaging' ? vandaag() : ui.dag, el.dataset.s),
  habplus: el => telBij(gewoonte(el.dataset.id), ui.tab === 'uitdaging' ? vandaag() : ui.dag, 1),
  habdetail: el => habSheet(gewoonte(el.dataset.id), el.dataset.dag || vandaag()),
  taak: el => {
    const terug = snapshot();
    const k = state.taken.find(x => x.id === el.dataset.id);
    k.klaar = !k.klaar; k.klaarOp = k.klaar ? vandaag() : null;
    let msg = k.klaar ? '+5 XP · taak af' : 'Weer open gezet';
    if (k.klaar && k.herhaal && !k.volgendeId) {
      // Herhalende taak: meteen de volgende klaarzetten
      const volgende = { ...JSON.parse(JSON.stringify(k)), id: uid(), klaar: false, klaarOp: null, verschoven: 0, volgendeId: null, datum: volgendeDatum(k.datum, k.herhaal) };
      volgende.subtaken = (volgende.subtaken || []).map(s => ({ ...s, id: uid(), klaar: false }));
      k.volgendeId = volgende.id; state.taken.push(volgende);
      msg = `+5 XP · 🔁 volgende: ${dagLabel(volgende.datum).toLowerCase()}`;
    } else if (!k.klaar && k.volgendeId) {
      state.taken = state.taken.filter(x => !(x.id === k.volgendeId && !x.klaar)); k.volgendeId = null;
    }
    bewaar(); render(); toast(msg, terug);
    if (k.klaar && navigator.vibrate) navigator.vibrate(12);
    checkLevelUp();
  },
  taakskip: el => {
    const terug = snapshot();
    const k = state.taken.find(x => x.id === el.dataset.id);
    const basis = k.datum && k.datum >= vandaag() ? k.datum : vandaag();
    k.datum = addDays(basis, 1); k.verschoven = (k.verschoven || 0) + 1;
    bewaar(); render();
    toast(k.verschoven >= 3 ? `Al ${k.verschoven}× verschoven… maak hem kleiner?` : `Doorgeschoven naar ${dagLabel(k.datum).toLowerCase()}`, terug);
  },
  bewerktaak: el => taakForm(state.taken.find(x => x.id === el.dataset.id)),
  nieuwetaak: () => taakForm(null, ui.dag),
  focuspauze: () => {
    const f = state.focus; if (!f) return;
    if (f.rest != null) { f.eind = Date.now() + f.rest; f.rest = null; } else f.rest = focusRest(f);
    bewaar(); renderFocus();
  },
  focusstop: () => {
    const f = state.focus; if (!f) return;
    const min = Math.floor((f.duur * 60000 - focusRest(f)) / 60000);
    if (min >= 5) { if (confirm(`Focus stoppen? ${min} minuten tellen mee.`)) focusKlaar(min); }
    else if (confirm('Focus stoppen?')) { state.focus = null; bewaar(); render(); }
  },
  reviewcoach: () => {
    const f = document.querySelector('[data-form=review]');
    const s = f ? `Wat ging goed: ${f.goed.value || '-'}. Wat ging mis: ${f.mis.value || '-'}. Mijn focus: ${f.focus.value || '-'}.` : '';
    ui.tab = 'coach'; vraagCoach('Bespreek mijn week eerlijk met me. ' + s + ' Wat is jouw advies voor volgende week?');
  },
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
  coachsnel: async el => {
    const q = el.dataset.q, veld = document.querySelector('[data-form=coach] textarea');
    if (q.startsWith('🧠')) { veld.placeholder = 'Gooi alles eruit: school, werk, thuis, afspraken, deadlines… Ik maak er taken van.'; veld.rows = 5; veld.focus(); return; }
    if (q.startsWith('📋')) {
      let tekst = '';
      try { tekst = await navigator.clipboard.readText(); } catch (e) { /* geen toegang */ }
      if (!tekst.trim()) { veld.placeholder = 'Plak hier (lang indrukken → Plakken) het stuk uit ChatGPT en tik op verzenden.'; veld.rows = 5; veld.focus(); return; }
      return vraagCoach('Hier is een stuk uit mijn gesprek met ChatGPT. Haal eruit wat ik moet doen en zet het klaar:\n\n' + tekst.slice(0, 8000));
    }
    vraagCoach(q);
  },
  mic: el => spreek(el),
  coachtoevoegen: el => {
    const i = Number(el.dataset.i), m = state.coach[i]; if (!m?.acties) return;
    const gekozen = new Set([...document.querySelectorAll(`.actiekaart[data-i="${i}"] input:checked`)].map(x => x.value));
    if (!gekozen.size) return toast('Niets aangevinkt');
    const terug = snapshot();
    let n = 0;
    m.acties.taken.forEach((k, j) => {
      if (!gekozen.has('t' + j)) return;
      state.taken.push({ id: uid(), titel: k.titel, datum: k.datum || (k.herhaal ? vandaag() : null), tijd: k.tijd, prio: k.prio, notitie: '', herhaal: k.herhaal, subtaken: k.subtaken.map(s => ({ id: uid(), titel: s, klaar: false })), klaar: false, klaarOp: null, verschoven: 0, aangemaakt: vandaag(), bron: 'coach' });
      n++;
    });
    m.acties.gewoontes.forEach((h, j) => {
      if (!gekozen.has('g' + j)) return;
      state.gewoontes.push({ id: uid(), naam: h.naam, emoji: h.emoji, mini: h.mini, kleur: KLEUREN[state.gewoontes.length % KLEUREN.length], dagen: [0, 1, 2, 3, 4, 5, 6], herinnering: '', doel: 1, eenheid: '', minuten: 0, aangemaakt: vandaag(), archief: false });
      n++;
    });
    m.toegevoegd = n;
    bewaar(); render(); toast(`✅ ${n} ${n === 1 ? 'ding' : 'dingen'} in Ritme gezet`, terug);
  },
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
  if (f.dataset.form === 'review') {
    const nieuw = !state.reviews[reviewWeek()];
    state.reviews[reviewWeek()] = { goed: f.goed.value.trim(), mis: f.mis.value.trim(), focus: f.focus.value.trim(), datum: vandaag() };
    bewaar(); ui.tab = 'vandaag'; ui.dag = vandaag(); render(); window.scrollTo({ top: 0 });
    if (nieuw) { confetti(50); toast('🗓️ Weekreview klaar. +30 XP'); } else toast('Weekreview bijgewerkt');
    return checkLevelUp();
  }
  const v = f.elements[0].value.trim(); if (!v) return;
  if (f.dataset.form === 'snel' || f.dataset.form === 'agendataak') {
    const p = leesDatum(v, f.dataset.form === 'snel' ? ui.dag : ui.agendaDag);
    state.taken.push({ id: uid(), titel: p.titel, datum: p.datum, tijd: p.tijd, prio: p.prio, herhaal: p.herhaal, subtaken: [], notitie: '', klaar: false, klaarOp: null, verschoven: 0, aangemaakt: vandaag() });
    bewaar(); render();
    toast(p.datumGevonden && p.datum !== (f.dataset.form === 'snel' ? ui.dag : ui.agendaDag) ? `📅 Gepland op ${dagLabel(p.datum).toLowerCase()}${p.tijd ? ' om ' + p.tijd : ''}` : 'Taak toegevoegd');
    document.querySelector(`[data-form=${f.dataset.form}] input`)?.focus();
  }
  if (f.dataset.form === 'coach') vraagCoach(v);
});
let dagboekTimer;
document.addEventListener('input', e => {
  const sf = e.target.closest('[data-form=snel],[data-form=agendataak]');
  if (sf) {
    const hint = sf.nextElementSibling?.classList.contains('hint') ? sf.nextElementSibling : null;
    if (hint) hint.innerHTML = e.target.value.trim() ? datumHint(leesDatum(e.target.value, sf.dataset.form === 'snel' ? ui.dag : ui.agendaDag)) : '';
  }
  if (e.target.dataset.inp === 'dagboek') {
    const d = ui.dag, v = e.target.value;
    clearTimeout(dagboekTimer);
    dagboekTimer = setTimeout(() => { state.dagboek[d] = state.dagboek[d] || {}; state.dagboek[d].tekst = v; bewaar(); }, 400);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') sluitSheet();
  // Op de laptop: Enter = versturen, Shift+Enter = nieuwe regel
  if (e.key === 'Enter' && !e.shiftKey && e.target.name === 'q' && !matchMedia('(pointer: coarse)').matches) { e.preventDefault(); e.target.form.requestSubmit(); }
});

/* ---------- Toast & confetti ---------- */
let toastTimer, undoFn = null;
// toast(tekst, terug): met een "Ongedaan"-knop als je een terugzet-functie meegeeft
function toast(t, terug) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(t)}</span>${terug ? '<button class="undo">Ongedaan</button>' : ''}`;
  undoFn = terug || null;
  el.classList.toggle('klikbaar', !!terug);
  el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show', 'klikbaar'); undoFn = null; }, terug ? 4500 : 2200);
}
function snapshot() {
  const s = JSON.stringify(state);
  return () => { const focus = state.focus; state = vanJSON(JSON.parse(s)); state.focus = focus; bewaar(); render(); toast('↩️ Teruggezet'); };
}
$('#toast').addEventListener('click', e => { if (e.target.closest('.undo') && undoFn) { const f = undoFn; undoFn = null; f(); } });
function confetti(n = 60) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti'), kl = ['#A47BFF', '#6E7BFF', '#4F9DFF', '#FF8FC8', '#FFCB66'];
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
setInterval(() => { if (state.focus) renderFocus(); }, 1000);
// Sync: bij openen, bij terugkomen in de app en elke 2 minuten
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { syncNu(true); renderFocus(); } });
window.addEventListener('online', () => syncNu(true));
setInterval(() => syncNu(true), 120000);
setTimeout(() => syncNu(true), 800);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
state.lv = Math.max(state.lv || 1, 1);
render();
checkHerinneringen();

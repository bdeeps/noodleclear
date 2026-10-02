// Shared parts for NoodleClear: the food science behind noodles (what the dough is made of, how
// starch gelatinises, how a strand cooks from the outside in, how an instant noodle is steamed,
// fried or air-dried and then takes water back), colours, chart boards, a glass pot on a gas
// stove, noodle strands and blocks, and a magnified "slice of one strand" that chapters reuse.
// Scenes are built in scene units: +x to the right, +y up. The model sits on the left (x = MX),
// boards and the slice sit on the right, and the readout covers the upper left.
//
// Sources for the numbers (typical values are marked typical in the text):
//  [Hou]  Gary G. Hou (ed.), Asian Noodles: Science, Technology, and Processing (Wiley, 2010):
//         dough water 30–38% of flour weight, salt 1–3%, kansui (sodium and potassium carbonate)
//         about 0.5–1.5%; sheeting in steps of 20–40%; the wave made by a slower conveyor after
//         the slitter; steaming at 100 °C for 1–5 min; frying at 140–160 °C for 1–2 min, which
//         takes moisture from 30–50% to 2–5% and leaves 15–20% oil; hot-air drying at 70–90 °C
//         for 30–40 min, to 8–12% moisture and under 3% fat. (Figures as summarised in
//         Wikipedia, "Instant noodles", which cites Hou and Gulia, Dhaka and Khatkar 2014,
//         Crit. Rev. Food Sci. Nutr. 54:1386.)
//  [W22]  Wang and others, "Effect of frying process on nutritional property, physicochemical
//         quality, and in vitro digestibility of commercial instant noodles", Front. Nutr. 2022
//         (PMC8891372): fat 12.9–17.5% in fried against 1.95–2.72% in non-fried blocks; cooking
//         time 159–238 s fried against 261–382 s non-fried; a honeycomb of pores in fried strands.
//  [CX]   Codex Standard for Instant Noodles, CXS 249-2006: moisture at most 10% (fried) and
//         14% (non-fried); acid value at most 2 mg KOH per g of oil. FSSAI's standard for instant
//         noodles: at most 10% (fried) and 13% (non-fried), as reported by Consumer Voice.
//  [St]   Starch: wheat granules 2–55 µm in two sizes, rice about 2–8 µm (Wikipedia, "Starch");
//         mung bean 8–33 µm with about 34% amylose (Foods 2020, PMC7278614). Gelatinisation:
//         wheat about 51–60 °C, rice 68–78 °C, mung bean 65–75 °C (typical DSC ranges).
//  [Pa]   Pasta: 25–30 kg of water per 100 kg of semolina, extruded at 40–45 °C, dried from
//         about 31% to about 12% moisture (Wikipedia, "Pasta processing").
//  [US]   USDA FoodData Central (SR Legacy), "Soup, ramen noodle, any flavor, dry": per 100 g
//         440 kcal, 17.6 g fat, 60.3 g carbohydrate, 10.2 g protein, 1,855 mg sodium.
//  [WHO]  WHO guideline: adults should eat less than 2,000 mg of sodium (5 g of salt) a day.
import { THREE, M, box, beam, clamp, smooth, lerp, canvasTexture } from './kit.js';

export const TAU = Math.PI * 2;
export const MX = -1.7;          // where the model stands
const RS = 1.3;                   // boards are drawn a little larger than their nominal size

export const COL = {
  water: '#6fb6ff', starch: '#f4f1e8', gluten: '#ffb547', oil: '#ffc94d', heat: '#ff7a59', steam: '#dfe8f5',
  ok: '#5ce1a9', bad: '#ff7a59', text: '#e8eef8', lilac: '#c49bff', kansui: '#ffe14d', salt: '#c49bff', other: '#8ea0b8',
};
export const hex = (c) => new THREE.Color(c).getHex();
export const link = (slug, name, hash = '') => `<a href="https://glassbox.how/${slug}/${hash ? '#' + hash : ''}">${name}</a>`;
export const fmtMin = (sec) => (sec >= 60 ? `${Math.floor(sec / 60)} min ${String(Math.round(sec % 60)).padStart(2, '0')} s` : `${Math.round(sec)} s`);

// ---------------------------------------------------------------- what a noodle is made of
// Flour: grams in 100 g (typical). Recipe: grams added to 100 g of flour (typical) [Hou][Pa].
// gel: the range over which the starch gelatinises [St]. gran: granule sizes in µm [St].
export const KINDS = {
  wheat: {
    name: 'Wheat noodle', flour: 'Refined wheat flour (maida)', starch: 72, protein: 10.5, moist: 13, other: 4.5, water: 34, salt: 2,
    gluten: 1, gel: [51, 60], gran: '2–55 µm, two sizes', col: '#f1e3bd', set: 'Boiled, or steamed then fried or dried',
    eg: 'Hakka noodles, udon, ramen, instant noodles',
  },
  durum: {
    name: 'Durum pasta', flour: 'Durum wheat semolina', starch: 70, protein: 13, moist: 13, other: 4, water: 28, salt: 0,
    gluten: 1.25, gel: [51, 60], gran: '2–55 µm, two sizes', col: '#f0cf7a', set: 'Dried slowly to about 12% moisture, boiled at home',
    eg: 'Spaghetti, penne, macaroni',
  },
  rice: {
    name: 'Rice noodle', flour: 'Rice flour', starch: 79, protein: 7, moist: 12, other: 2, water: 150, salt: 1,
    gluten: 0, gel: [68, 78], gran: 'about 2–8 µm', col: '#f6f5ee', set: 'Steamed: cooked starch is the glue',
    eg: 'Idiyappam, sevai, rice vermicelli, pho',
  },
  glass: {
    name: 'Glass noodle', flour: 'Mung bean starch', starch: 86, protein: 0.3, moist: 13, other: 0.7, water: 80, salt: 0,
    gluten: 0, gel: [65, 75], gran: '8–33 µm', col: '#dfeef5', set: 'Pressed into boiling water, chilled, dried',
    eg: 'Glass noodles, falooda sev (corn or arrowroot starch)',
  },
};
// The dough as percentages, from the recipe. kansui in g per 100 g of flour.
export function doughOf(kind, kansui = 0) {
  const k = KINDS[kind], ks = kind === 'wheat' ? kansui : 0, tot = 100 + k.water + k.salt + ks;
  return { water: ((k.moist + k.water) / tot) * 100, starch: (k.starch / tot) * 100, protein: (k.protein / tot) * 100, salt: ((k.salt + ks) / tot) * 100, other: (k.other / tot) * 100 };
}
// Dough pH with kansui: plain wheat dough is about 6; alkaline noodles run at pH 9–11 [Hou].
// A smooth guide between those anchors, not a titration.
export const pHOf = (kansui) => 6 + 4.6 * (1 - Math.exp(-kansui / 0.45));

// ---------------------------------------------------------------- shaping
// Sheeting: each pass through a pair of rolls takes about 30% off (20–40% is usual) [Hou].
export const SLAB = 10, PASS = 0.7;
export const sheetT = (passes) => SLAB * Math.pow(PASS, passes);
// Hand-pulling: a 30 mm rope of dough, folded to 0.7 m. Each pull doubles the strands and halves
// each strand's cross-section, because the dough's volume cannot change.
export const ROPE = 30, SPAN = 0.7;
export const pullN = (n) => Math.pow(2, n);
export const pullD = (n) => ROPE / Math.pow(2, n / 2);
// A press: dough leaves the die faster than the piston moves, by the ratio of the areas.
export const BARREL = 60;
export const pressGain = (hole, holes) => (BARREL * BARREL) / (holes * hole * hole);

// ---------------------------------------------------------------- cooking a dry strand
// Water soaks in from the surface and the starch gelatinises behind it. The wet front goes as the
// square root of time (diffusion): depth² = KD × t. KD is set so a 1.8 mm dried spaghetti loses
// its last white core at 11 minutes, which matches packet times; that is an effective diffusion
// constant of about 3 × 10⁻¹⁰ m²/s, the order measured for water in cooking pasta. A guide.
export const KD = (0.9 * 0.9) / 11;          // mm² per minute
export const ALPHA = 0.14;                    // thermal diffusivity of dough, mm²/s (close to water's)
export function cookOf(thick, tMin, waterL = 1, salt = 10) {
  const r = thick / 2, depth = Math.sqrt(KD * Math.max(0, tMin)), core = Math.max(0, r - depth) / r, done = (r * r) / KD;
  const gel = 1 - core * core, over = Math.max(0, tMin / done - 1);
  const loss = 6 * Math.sqrt(Math.min(2.5, tMin / done));          // % of the dry weight; 4–8% at done is typical
  const weight = 100 * (1 + 1.3 * gel + 0.5 * Math.min(1, over));  // cooked pasta is about 2.3 times its dry weight
  // Boiling-point rise: ΔT = i · Kb · m, with Kb = 0.512 K kg/mol, NaCl 58.44 g/mol, i ≈ 1.9.
  const dTb = 1.9 * 0.512 * (salt / 58.44);
  const state = core > 0.6 ? 'Hard: mostly raw inside' : core > 0.25 ? 'Chalky: a thick white core' : core > 0.04 ? 'Al dente: a thin firm core' : over < 0.25 ? 'Cooked through' : 'Overcooked: soft and sticky';
  return { r, depth, core, done, gel, over, loss, weight, dTb, state, starchGL: loss / waterL, heatS: (r * r) / ALPHA, alDente: (0.75 * r) * (0.75 * r) / KD };
}

// ---------------------------------------------------------------- the instant noodle line
// A guide model pinned to the typical figures in [Hou] and [W22]:
//  steaming: share of starch gelatinised = 1 − exp(−t / 1.1 min) (about 84% at 2 min);
//  frying: water (dry basis) falls exponentially towards 1.5%, faster in hotter oil, tuned to
//   reach about 3% moisture in 75 s at 150 °C; oil moves into the pores the steam leaves, about
//   0.42 g of oil per gram of water lost, a little more in cooler oil and in less-cooked starch;
//  air-drying at 80 °C: towards 8% moisture with a time constant of 12 min (about 10% at 35 min);
//  pores: the space the water leaves. Frying sets the structure before it can shrink (about 80%
//   kept); slow drying lets the strand shrink (about 25% kept);
//  time to soften in boiling water: tuned to the measured 159–238 s (fried) and 261–382 s
//   (non-fried) in [W22].
export const M0 = 34;                               // % moisture of the steamed strand (30–50% in [Hou])
const X0 = M0 / (100 - M0), wb = (X) => (X / (1 + X)) * 100;
export const gelOf = (steamMin) => 1 - Math.exp(-steamMin / 1.1);
export function lineOf(s, frySecOverride = null) {
  const G = gelOf(s.steam), fry = s.method === 'fry';
  let X, oil = 0, keep;
  if (fry) {
    const t = frySecOverride ?? s.frySec, k = 0.0375 * Math.max(0, s.fryT - 100) / 50;
    X = 0.015 + (X0 - 0.015) * Math.exp(-k * t);
    oil = 100 * (X0 - X) * 0.42 * (1 + (150 - s.fryT) / 200) * (1.25 - 0.3 * G) + 1;   // g per 100 g of dry flour solids
    keep = 0.8;
  } else {
    const t = frySecOverride ?? s.airMin;
    X = 0.087 + (X0 - 0.087) * Math.exp(-t / 12);
    oil = 1.5; keep = 0.25;
  }
  const total = 100 + 100 * X + oil, moisture = (100 * X / total) * 100, fat = (oil / total) * 100;
  const pores = keep * ((X0 - X) / (X0 + 1 / 1.5)) ;   // share of the strand's volume (solids at 1.5 g/cm³)
  const reh = 120 + 280 * clamp(1 - pores / 0.36, 0, 1) + 200 * (1 - G) + (moisture > 12 ? 60 : 0);
  const burnt = fry && s.fryT > 165 && s.frySec > 100;
  const limit = fry ? 10 : 14;
  return { G, fry, X, moisture, fat, pores, reh, burnt, limit, ok: moisture <= limit, wbOf: wb };
}
// One block: how much strand is in it. A 70 g block; the raw strand is about 1.25 g/cm³.
export function strandMetres(r, cutMm = 1.2, thickMm = 1.0, block = 70) {
  const solids = block * (1 - r.moisture / 100 - r.fat / 100), raw = solids / (1 - M0 / 100);
  return raw / 1.25 / (cutMm * thickMm * 0.01) / 100;
}
// Rehydration: share of the dry pores refilled, an exponential that reaches 95% at the "ready"
// time. Cooler water is slower (a guide: about 3% per °C).
export const PACK = {
  fried: { name: 'Fried block', ready: 175, fat: 17.6, carb: 60.3, protein: 10.2 },     // [US]
  air: { name: 'Air-dried block', ready: 330, fat: 2.5, carb: 75, protein: 10.5 },      // [W22], typical
};
export const readyAt = (type, T) => PACK[type].ready * Math.exp(0.03 * (100 - T));
export const softOf = (type, T, tSec) => 1 - Math.exp((-3 * tSec) / readyAt(type, T));
// A typical 70 g pack. Energy from the Atwater factors (4, 4 and 9 kcal per gram). Sodium with the
// whole tastemaker: about 1,200 mg, between one label's 868 mg per 70 g and the USDA generic
// 1,855 mg per 100 g; about a quarter of it is assumed to be in the block itself (salt in the dough).
export const DAY = { kcal: 2000, fat: 67, sodium: 2000 };     // FSSAI label basis; sodium also [WHO]
export function packOf(type, sachet = 1, grams = 70) {
  const p = PACK[type], f = grams / 100;
  return { kcal: f * (p.fat * 9 + p.carb * 4 + p.protein * 4), fat: f * p.fat, carb: f * p.carb, protein: f * p.protein, sodium: 300 + 900 * sachet };
}

// ---------------------------------------------------------------- noodles of the world
// ing: 0 wheat, 1 wheat + alkali, 2 durum wheat, 3 rice, 4 pure starch.  how: 0 rolled and cut,
// 1 pressed or extruded, 2 pulled by hand.
export const INGS = ['Wheat', 'Wheat + alkali', 'Durum wheat', 'Rice', 'Pure starch'];
export const HOWS = ['Rolled and cut', 'Pressed through a die', 'Pulled by hand'];
export const WORLD = [
  { n: 'Hakka noodles', where: 'India (Kolkata Chinese)', ing: 0, how: 0, set: 'Boiled, then stir-fried', col: '#ecd9a6', r: 0.07, k: 13, note: 'Indo-Chinese street food: boiled wheat noodles tossed in a very hot wok.' },
  { n: 'Udon', where: 'Japan', ing: 0, how: 0, set: 'Boiled', col: '#f6efdc', r: 0.14, k: 8, note: 'Thick, soft wheat noodles made with just flour, water and salt.' },
  { n: 'Seviyan', where: 'India', ing: 0, how: 1, set: 'Dried, roasted, then simmered', col: '#e6c88a', r: 0.035, k: 22, note: 'Fine wheat vermicelli, roasted in ghee for kheer or upma.' },
  { n: 'Ramen', where: 'Japan, from China', ing: 1, how: 0, set: 'Boiled', col: '#f0d264', r: 0.065, k: 14, note: 'Kansui makes it yellow, firm and springy in hot broth.' },
  { n: 'Instant noodles', where: 'Japan, 1958; now everywhere', ing: 1, how: 0, set: 'Steamed, then fried or air-dried', col: '#f2d98a', r: 0.05, k: 0, block: 1, note: 'Cooked in the factory, so at home it only needs water back.' },
  { n: 'Lamian', where: 'China (Lanzhou)', ing: 1, how: 2, set: 'Boiled at once', col: '#f1e2b4', r: 0.06, k: 14, note: 'Stretched and folded by hand: each pull doubles the strands.' },
  { n: 'Spaghetti', where: 'Italy', ing: 2, how: 1, set: 'Dried slowly, boiled at home', col: '#f0cf7a', r: 0.06, k: 0, straight: 1, note: 'Semolina dough forced through a die, then dried for hours.' },
  { n: 'Idiyappam', where: 'South India, Sri Lanka', ing: 3, how: 1, set: 'Pressed, then steamed', col: '#fbfaf4', r: 0.035, k: 24, flat: 0.45, note: 'Rice flour dough pressed into nests and steamed. Also called string hoppers.' },
  { n: 'Sevai', where: 'South India', ing: 3, how: 1, set: 'Steamed dough, pressed', col: '#f7f5ea', r: 0.04, k: 22, note: 'Rice is cooked first, then pressed into strands: santhakai, shavige.' },
  { n: 'Flat rice noodles', where: 'Vietnam, Thailand, China', ing: 3, how: 0, set: 'Batter steamed in sheets, cut', col: '#f8f6ee', r: 0.11, k: 10, flat: 0.3, note: 'Pho and kway teow: a rice batter is steamed into a sheet and sliced.' },
  { n: 'Glass noodles', where: 'China, Korea, South-east Asia', ing: 4, how: 1, set: 'Pressed into boiling water, dried', col: '#d4e8f2', r: 0.045, k: 18, clear: 0.55, note: 'Mung bean or sweet potato starch: a clear gel with no protein net.' },
  { n: 'Falooda sev', where: 'India, from Persia', ing: 4, how: 1, set: 'Cooked paste pressed into iced water', col: '#eef4f6', r: 0.04, k: 20, clear: 0.7, note: 'Corn or arrowroot starch strands, served cold with kulfi and rose syrup.' },
];

// ---------------------------------------------------------------- boards (live charts in 3D)
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); m.scale.setScalar(RS); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', logY = false }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = logY
    ? (y) => y0 - ((Math.log10(Math.max(y, 1e-30)) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin))) * (y0 - y1)
    : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function legend(g, items, x = 24, y = 50, font = 18) {
  g.font = `bold ${font}px sans-serif`;
  for (const [n, c] of items) { g.fillStyle = c; g.fillRect(x, y, 16, 16); g.fillStyle = COL.text; g.fillText(n, x + 22, y + 15); x += 36 + g.measureText(n).width; }
}
export function dashH(g, X0, X1, y, text = '', col = 'rgba(255,255,255,.5)') {
  g.strokeStyle = col; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); g.setLineDash([]);
  if (text) { g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(text, X1 - g.measureText(text).width - 4, y - 8); }
}
// Horizontal bars with labels: rows [{ label, value, color, text }].
export function bars(g, rows, { x = 20, y = 64, w = 600, rowH = 52, labelW = 230, unit = (v) => v, max = null } = {}) {
  const mx = max ?? Math.max(1e-9, ...rows.map((r) => Math.abs(r.value))) * 1.15, span = w - labelW - 20;
  rows.forEach((r, i) => {
    const yy = y + i * rowH, L = Math.min(span, (Math.abs(r.value) / mx) * span);
    g.font = 'bold 19px sans-serif'; g.fillStyle = r.color; g.fillText(r.label, x, yy + 24);
    g.globalAlpha = 0.85; g.fillRect(x + labelW, yy + 6, Math.max(2, L), rowH - 18); g.globalAlpha = 1;
    g.font = '18px sans-serif'; g.fillStyle = '#fff'; const t = r.text ?? unit(r.value), tw = g.measureText(t).width;
    g.fillText(t, x + labelW + L + 8 + tw > w ? x + labelW + L - tw - 8 : x + labelW + L + 8, yy + 25);
  });
}
export function wrap(g, text, x, y, maxW, lh) {
  let ln = '';
  for (const word of text.split(' ')) { if (g.measureText(ln + word).width > maxW && ln) { g.fillText(ln.trim(), x, y); y += lh; ln = ''; } ln += word + ' '; }
  g.fillText(ln.trim(), x, y); return y + lh;
}

export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------------------------------------------------------------- 3D pieces
// Glowing dots, one instanced mesh, each with its own colour.
export function dots(n, r, color = 0xffffff, seg = 8, lit = false) {
  const mat = lit ? new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }) : new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D(), col = new THREE.Color(color);
  for (let i = 0; i < n; i++) { mesh.setColorAt(i, col); o.position.set(0, -99, 0); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); }
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.tint = (i, c) => mesh.setColorAt(i, c);
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  return mesh;
}
// Little puffs that drift from a source: step(dt, rate, at, vel, life).
export function puffs(parent, n, r, color, rnd) {
  const d = dots(n, r, color); parent.add(d);
  const P = Array.from({ length: n }, () => ({ life: 0, max: 1, p: [0, -99, 0], v: [0, 0, 0] }));
  let acc = 0;
  return {
    mesh: d,
    step(dt, rate, at, vel, life = 1.2, shrink = true) {
      acc += rate * dt;
      for (let i = 0; i < n; i++) {
        const q = P[i];
        if (q.life <= 0 && acc >= 1) { acc -= 1; q.life = q.max = life * (0.75 + 0.5 * rnd()); q.p = at(); q.v = vel(q.p); }
        if (q.life > 0) { q.life -= dt; q.p[0] += q.v[0] * dt; q.p[1] += q.v[1] * dt; q.p[2] += q.v[2] * dt; }
        const k = q.life / q.max;
        d.place(i, q.p[0], q.p[1], q.p[2], q.life > 0 ? (shrink ? 0.35 + 0.65 * k : 1) : 0.0001);
      }
      if (acc > 20) acc = 20;
      d.done();
    },
  };
}
// A see-through glass box from (x0,y0) to (x1,y1), depth d, with bright edges.
export function chamber(parent, x0, x1, y0, y1, d, { color = 0xcfe8ff, opacity = 0.08, edge = 0x9fb4c8 } = {}) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, d), M.clear(color, opacity)); glass.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); g.add(glass);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: 0.7 }));
  e.position.copy(glass.position); g.add(e);
  parent.add(g); g.glass = glass; g.edges = e;
  return g;
}
export function cyl(r0, r1, h, mat, seg = 40, open = false) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg, 1, open), mat); m.castShadow = true; m.receiveShadow = true; return m; }

// A wavy tube along X: the crimped strand of an instant noodle.
export function waveGeo(L, A, lam, r, seg = 60, Ay = 0) {
  const pts = [];
  for (let i = 0; i <= seg; i++) { const x = -L / 2 + (L * i) / seg; pts.push(new THREE.Vector3(x, Ay * Math.sin((TAU * x) / lam + 0.6), A * Math.sin((TAU * x) / lam))); }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg * 2, r, 6, false);
}
// A brick of wavy strands: a generic instant noodle block, no brand.
export function makeBlock(parent, { w = 2.4, d = 1.6, h = 0.5, rows = 9, layers = 3, r = 0.045, color = 0xf2d98a } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
  const mesh = new THREE.InstancedMesh(waveGeo(w, d / rows / 1.6, w / 5, r, 48, r * 0.9), mat, rows * layers);
  mesh.castShadow = true;
  const o = new THREE.Object3D();
  for (let l = 0, i = 0; l < layers; l++) for (let k = 0; k < rows; k++, i++) {
    o.position.set(0, (l - (layers - 1) / 2) * (h / layers), ((k + 0.5) / rows - 0.5) * d + (l % 2 ? d / rows / 2 : 0) * 0.6);
    o.rotation.set(0, (k + l) % 2 ? Math.PI : 0, 0); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix);
  }
  const g = new THREE.Group(); g.add(mesh); parent.add(g);
  return { g, mesh, mat };
}
// A loose tangle of closed strands inside a cylinder of radius R, between y0 and y1.
export function makeTangle(parent, { n = 12, R = 1.4, y0 = 0, y1 = 1, r = 0.06, seed = 3, color = 0xf1e3bd, flat = 1, opacity = 1 } = {}) {
  const rnd = rng(seed), g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, transparent: opacity < 1, opacity });
  for (let j = 0; j < n; j++) {
    const pts = [], a0 = rnd() * TAU, cx = (rnd() - 0.5) * R * 0.5, cz = (rnd() - 0.5) * R * 0.5, yb = y0 + (y1 - y0) * rnd();
    for (let k = 0; k < 9; k++) { const a = a0 + (k / 9) * TAU, rad = R * (0.3 + 0.55 * rnd()); pts.push(new THREE.Vector3(clamp(cx + rad * Math.cos(a), -R, R) * 0.95, clamp(yb + (rnd() - 0.5) * (y1 - y0) * 0.7, y0, y1), clamp(cz + rad * Math.sin(a), -R, R) * 0.95)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 90, r, 6, true), mat);
    m.castShadow = true; g.add(m);
  }
  g.scale.y = flat;
  parent.add(g);
  return { g, mat };
}

// ---------------------------------------------------------------- the pot
// A glass pot on one burner of a gas stove: water, bubbles, steam. set({...}) then step(dt).
export function makePot(parent, { x = MX, R = 1.75, H = 2.1, seed = 7, nB = 60 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, 0); parent.add(g);
  const rnd = rng(seed), by = 0.98, flames = [];
  const body = box(R * 2.3, 0.2, R * 2.3, M.metal(0x7d8591, { roughness: 0.45 })); body.position.y = 0.1; g.add(body);
  const cup = cyl(0.62, 0.72, 0.3, M.metal(0xc9a45a, { roughness: 0.4 }), 32); cup.position.y = 0.35; g.add(cup);
  const cap = cyl(0.5, 0.5, 0.08, M.matte(0x22252b), 32); cap.position.y = 0.54; g.add(cap);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.785, c = Math.cos(a), s = Math.sin(a);
    g.add(beam([c * R * 1.05, 0.2, s * R * 1.05], [c * R * 0.95, by - 0.08, s * R * 0.95], 0.05, M.matte(0x1c1f25)));
    g.add(beam([c * R * 0.95, by - 0.08, s * R * 0.95], [c * 0.8, by - 0.08, s * 0.8], 0.05, M.matte(0x1c1f25)));
  }
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x4f9dff, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false });
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * TAU, f = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.42, 8), flameMat);
    f.geometry.translate(0, 0.21, 0); f.position.set(Math.cos(a) * 0.66, 0.5, Math.sin(a) * 0.66); f.rotation.set(Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55);
    g.add(f); flames.push(f);
  }
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true), M.clear(0xdff2ff, 0.16)); wall.position.y = by + H / 2 - 0.04; g.add(wall);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.035, 8, 64), M.metal(0xc3c9d3)); rim.rotation.x = Math.PI / 2; rim.position.y = by + H - 0.04; g.add(rim);
  const base = cyl(R, R, 0.08, M.metal(0xaab1bd, { roughness: 0.4 }), 64); base.position.y = by - 0.04; g.add(base);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x6fb6ff, roughness: 0.08, transparent: true, opacity: 0.3, depthWrite: false });
  const wgeo = new THREE.CylinderGeometry(R - 0.05, R - 0.05, 1, 56); wgeo.translate(0, 0.5, 0);
  const water = new THREE.Mesh(wgeo, waterMat); water.position.y = by; g.add(water);
  const inner = new THREE.Group(); inner.position.y = by; g.add(inner);      // things that sit in the water
  const bub = dots(nB, 0.06, 0xe6f8ff); g.add(bub);
  const B = Array.from({ length: nB }, () => ({ on: false, r: 0, phi: 0, y: 0, v: 1, j: rnd() }));
  const steam = puffs(g, 50, 0.075, 0xdfe8f5, rnd);
  const st = { level: 0.7, boil: 0, flame: 0.5, color: 0x6fb6ff, opacity: 0.3, steam: 0 };
  let acc = 0, tt = 0;
  const api = {
    g, by, R, H, st, inner,
    surfaceY: () => by + Math.max(0.001, st.level) * (H - 0.12),
    set(o) { Object.assign(st, o); return api; },
    step(dt) {
      tt += dt;
      const wy = api.surfaceY();
      flames.forEach((f, i) => { f.visible = st.flame > 0.02; f.scale.set(1, (0.35 + 1.25 * st.flame) * (0.85 + 0.3 * Math.sin(tt * 23 + i * 1.7)), 1); });
      water.scale.y = Math.max(0.001, wy - by + st.boil * 0.02 * Math.sin(tt * 17));
      waterMat.color.set(st.color); waterMat.opacity = st.opacity;
      acc += dt * st.boil * 70;
      B.forEach((b, i) => {
        if (!b.on && acc >= 1) { acc -= 1; b.on = true; b.r = R * 0.84 * Math.sqrt(rnd()); b.phi = rnd() * TAU; b.y = by + 0.06; b.v = 1.3 + 1.5 * rnd(); }
        if (b.on) { b.y += dt * b.v; if (b.y > wy) b.on = false; }
        bub.place(i, b.r * Math.cos(b.phi), b.y, b.r * Math.sin(b.phi), b.on ? 0.7 + 1.2 * clamp((b.y - by) / Math.max(0.2, wy - by), 0, 1) * (0.6 + 0.8 * b.j) : 0.0001);
      });
      if (acc > 30) acc = 30;
      bub.done();
      steam.step(dt, st.steam * 36, () => { const a = rnd() * TAU, r = R * 0.8 * Math.sqrt(rnd()); return [r * Math.cos(a), wy + 0.1, r * Math.sin(a)]; }, () => [(rnd() - 0.5) * 0.25, 0.55 + rnd() * 0.5, (rnd() - 0.5) * 0.25], 1.7);
    },
  };
  return api;
}

// ---------------------------------------------------------------- a slice of one strand, magnified
// A disc standing up to face the viewer: starch granules (cream dots) and pores (dark dots).
// Chapters decide how each one looks: gran.place / pores.place with the points in G and P.
// It is a cartoon: a real 1 mm strand is dozens of granules across.
export function makeSlice(parent, { pos = [5.6, 2.7, 0], R = 1.2, n = 150, nP = 110, seed = 3, caption = '' } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); parent.add(g);
  const rnd = rng(seed), disc = new THREE.Group(); g.add(disc);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(R * 3.7, R * 3.1), new THREE.MeshBasicMaterial({ color: 0x0b0e15, transparent: true, opacity: 0.9, toneMapped: false })); plate.position.set(0, -0.22 * R, -0.06); g.add(plate);
  const back = new THREE.Mesh(new THREE.CircleGeometry(R, 56), new THREE.MeshBasicMaterial({ color: 0xe9d9ae, toneMapped: false })); disc.add(back);
  const ring = new THREE.Mesh(new THREE.RingGeometry(R, R * 1.035, 56), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.7 })); ring.position.z = 0.005; disc.add(ring);
  const core = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.9 })); core.position.z = 0.01; core.visible = false; disc.add(core);
  const spot = (count) => Array.from({ length: count }, (_, i) => { const rho = Math.sqrt((i + 0.5) / count), a = i * 2.39996 + rnd() * 0.5; return { x: R * 0.94 * rho * Math.cos(a), y: R * 0.94 * rho * Math.sin(a), rho, j: rnd() }; });
  const G = spot(n), P = spot(nP);
  const gran = dots(n, R * 0.05, 0xfffdf4, 8); gran.position.z = 0.05; disc.add(gran);
  const pores = dots(nP, R * 0.045, 0x1a1208, 8); pores.position.z = 0.07; disc.add(pores);
  const cap = canvasTexture(620, 64, (c, w, h, text = caption) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(232,238,248,.92)'; c.font = '26px sans-serif'; c.fillText(text, (w - c.measureText(text).width) / 2, 42); });
  const capM = new THREE.Mesh(new THREE.PlaneGeometry(R * 3.6, R * 3.6 * (64 / 620)), new THREE.MeshBasicMaterial({ map: cap.tex, transparent: true, toneMapped: false })); capM.position.set(0, -1.53 * R, 0); g.add(capM);
  let capNow = caption;
  return { g, disc, back, ring, core, gran, pores, G, P, R, setCap(t) { if (t !== capNow) { capNow = t; cap.redraw(t); } } };
}

// ---------------------------------------------------------------- layout: desktop, phone, reel
// True while the Glassbox studio records the reel.
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone the readout would cover the model, so it keeps its headline and first three rows.
let narrowNow = false;
export function slimmed(inst) {
  const full = inst.readout;
  if (full) inst.readout = (s) => { const html = full(s); if (!narrowNow) return html; let n = 0; return html.replace(/<small>[\s\S]*?<\/small>/g, '').replace(/<div class="row">[\s\S]*?<\/div>/g, (m) => (++n > 3 ? '' : m)); };
  return inst;
}
// On a phone-width stage: hide minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.16 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  narrowNow = narrow;
  return narrow;
}
// Boards sit to the right of the model on screen. In a tall or square reel they stack above the
// model instead, and the camera is set so that the model and both boards fill the frame.
export const VIEW = { pos: [1.9, 5.4, 11.6], target: [1.9, 4.6, 0] };
const WIDE = { pos: [1.9, 5.0, 13.4], target: [1.9, 4.6, 0] };
let viewKey = '';
export function resetLayout() { viewKey = ''; }
export function layout(stage, objs, { top = 9.9, gap = 3.05 } = {}) {
  const r = inReel(), a = stage.camera.aspect, wide = a > 1.3, stack = r && !wide;
  objs.forEach((o, i) => {
    if (!o.userData.homeP) o.userData.homeP = o.position.clone();
    if (stack) o.position.set(MX, top - i * gap, 0); else o.position.copy(o.userData.homeP);
  });
  if (r) {
    const key = (wide ? 'w' : 's') + a.toFixed(2);
    if (key !== viewKey) {
      viewKey = key; stage.controls.autoRotate = false;
      if (wide) stage.setView(WIDE.pos, WIDE.target, 0.01);
      else {
        const halfH = Math.max(6.75, 3.8 / a), dist = halfH / Math.tan((21 * Math.PI) / 180), k = Math.min(2.5, Math.max(1, 1.45 / Math.max(0.3, a)));
        stage.setView([MX, 5.2, dist / k], [MX, 4.95, 0], 0.01);
      }
    }
  }
  return stack;
}

export { THREE, M, clamp, lerp, smooth, box, beam };

// Chapter 2: three ways to make a strand. Roll the dough thin and slit it; force it through the
// holes of a die (a sev or idiyappam press, a pasta extruder); or pull it by hand, folding and
// stretching so the strands double each time (lamian).
// Every number here is geometry, because dough keeps its volume:
//  sheeting: about 30% off the thickness per pass (20–40% is usual; Hou, Asian Noodles), so the
//   sheet gets longer by the same factor;
//  pressing: the strand leaves the die faster than the piston moves by the ratio of the areas
//   (a 60 mm barrel is a typical home press);
//  pulling: n pulls give 2^n strands, and each strand's diameter falls by √2 per pull. The
//   starting rope (30 mm thick, 0.7 m long, about half a kilogram) is a typical size.
// A human hair is about 0.07 mm across (typical).
import { THREE, M, box } from '../kit.js';
import { sheetT, SLAB, pullN, pullD, ROPE, SPAN, pressGain, BARREL, COL, MX, VIEW, board, panelBg, title, axes, line, dot, cyl, makeTangle, rng, layout, resetLayout, fitNarrow, slimmed, clamp, link, TAU } from '../noodle.js';

const DOUGH = 0xf1e3bd;
const fmtLen = (m) => (m >= 1000 ? (m / 1000).toFixed(1) + ' km' : m >= 10 ? Math.round(m) + ' m' : m.toFixed(1) + ' m');
const fmtMm = (d) => (d >= 10 ? d.toFixed(0) : d >= 1 ? d.toFixed(1) : d.toFixed(2)) + ' mm';

export default {
  id: 'shape',
  short: 'Cut, press, pull',
  title: 'Three ways to make a strand',
  subtitle: 'Roll and slit, press through a die, or pull by hand: twelve pulls turn one rope into 4,096 strands.',
  view: VIEW,
  learn: `<p>Dough is a lump. A noodle is a long thread. There are three main ways to get from one to the other, and all of them obey one rule: <b>dough keeps its volume</b>. Make it thinner and it must get longer.</p>
    <p><b>Roll and cut.</b> The dough goes through pairs of rollers, each a little closer than the last, until a thick slab becomes a thin sheet. Grooved <b>slitter</b> rolls then slice the sheet into strands. Hakka noodles, ramen, udon and instant noodles are all made this way. Rolling in one direction also lines the gluten up along the strand.</p>
    <p><b>Press.</b> A piston or screw forces dough through small holes in a <b>die</b>. This is your sev press and idiyappam press at home, and the giant extruder in a pasta factory. Because the holes are tiny next to the barrel, the strands shoot out many times faster than the piston moves. Doughs with no gluten, like rice, are usually pressed, because they cannot be stretched.</p>
    <p><b>Pull.</b> The <b>lamian</b> maker stretches a rope of dough to arm's length, folds it in half, and stretches again. Every pull <b>doubles</b> the strands: 2, 4, 8, 16. Seven pulls give 128 strands. Twelve give 4,096, each finer than a pencil lead. Only a soft, well-rested wheat dough can do this.</p>
    <p>Why rest the dough? Freshly kneaded gluten is tense and springs back. Given half an hour, the net relaxes and the water spreads evenly, so the dough stretches without tearing. ${link('breadclear', 'BreadClear')} has more on gluten.</p>
    <p class="tip"><b>Try it:</b> choose <b>Hand-pull</b> and add pulls one at a time. Watch the strand count double while each strand's thickness falls by the square root of two.</p>`,
  terms: [
    { t: 'Sheeting', d: 'Passing dough between rollers again and again to make a thin, even sheet.' },
    { t: 'Slitter', d: 'A pair of grooved rollers that slices a dough sheet into strands.' },
    { t: 'Die', d: 'A plate with shaped holes. Dough forced through it takes the shape of the hole.' },
    { t: 'Extrusion', d: 'Shaping something by pushing it through a die. Spaghetti, sev and idiyappam are extruded.' },
    { t: 'Lamian', d: 'Chinese hand-pulled noodles, made by stretching and folding a rope of dough.' },
  ],
  defaults: { mode: 'pull', pulls: 5, passes: 5, cut: 1.5, hole: 1.0, holes: 19 },
  controls: [
    { key: 'mode', type: 'seg', label: 'Method', options: [{ v: 'cut', label: 'Roll and cut' }, { v: 'press', label: 'Press' }, { v: 'pull', label: 'Hand-pull' }] },
    { key: 'pulls', type: 'range', label: 'Hand-pull: number of pulls', min: 0, max: 12, step: 1, ends: ['0', '12'], fmt: (v) => `${Math.round(v)} pulls · ${pullN(Math.round(v)).toLocaleString('en-IN')} strands` },
    { key: 'passes', type: 'range', label: 'Roll: passes through the rollers', min: 1, max: 8, step: 1, ends: ['1', '8'], fmt: (v) => `${v} · ${fmtMm(sheetT(v))} thick` },
    { key: 'cut', type: 'range', label: 'Roll: slitter width', min: 0.8, max: 5, step: 0.1, ends: ['0.8 mm', '5 mm'], fmt: (v) => v.toFixed(1) + ' mm' },
    { key: 'hole', type: 'range', label: 'Press: hole size', min: 0.6, max: 3, step: 0.1, ends: ['0.6 mm', '3 mm'], fmt: (v) => v.toFixed(1) + ' mm' },
    { key: 'holes', type: 'range', label: 'Press: holes in the die', min: 1, max: 37, step: 1, ends: ['1', '37'], fmt: (v) => String(v) },
  ],
  quiz: [
    { q: 'A lamian maker pulls and folds the dough 10 times. How many strands?', options: ['20', '100', '1,024', '10,000'], answer: 2, why: 'Each pull doubles the count: 2 multiplied by itself 10 times is 1,024.' },
    { q: 'A roller squeezes a dough sheet to half its thickness, at the same width. What happens to its length?', options: ['It halves', 'It stays the same', 'It doubles', 'It depends on the flour'], answer: 2, why: 'Dough keeps its volume. Half as thick at the same width means twice as long.' },
    { q: 'Why are rice noodles such as idiyappam pressed through a die rather than pulled?', options: ['Rice dough has no gluten, so it cannot stretch', 'Rice is too expensive to pull', 'Pulling makes rice sour', 'Dies are always faster'], answer: 0, why: 'Pulling needs a stretchy gluten net. Rice has none, so its dough is pushed into shape instead.' },
  ],
  reel: [
    { ms: 5800, caption: 'Hand-pulled lamian doubles with every fold. Twelve pulls turn one rope into 4,096 strands.', set: { mode: 'pull' }, anim: { pulls: [0, 12] }, spin: 0 },
    { ms: 5200, caption: 'Rice dough cannot stretch, so idiyappam and sevai are pressed through a die. So is spaghetti.', set: { mode: 'press', hole: 1 }, anim: { holes: [1, 37] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    resetLayout();
    const root = new THREE.Group(); stage.root.add(root);
    const dough = new THREE.MeshStandardMaterial({ color: DOUGH, roughness: 0.7 });
    const steel = M.metal(0xc3c9d3, { roughness: 0.3 });

    // ---------------- hand-pull
    const gPull = new THREE.Group(); gPull.position.set(MX, 0, 0); root.add(gPull);
    const W = 1.75, SAG = 2.2, YH = 3.7;
    const hands = [-1, 1].map((sg) => { const h = box(0.5, 0.8, 1.5, M.plastic(0xe0a37e, { roughness: 0.8 })); h.position.set(sg * (W + 0.2), YH, 0); gPull.add(h); return h; });
    const table = box(4.4, 0.16, 2.6, M.matte(0x3a2f26)); table.position.set(0, 0.6, 0); gPull.add(table);
    let strands = null, strandN = -1;
    const o3 = new THREE.Object3D(), rs = rng(4), FAN = Array.from({ length: 128 }, () => [(rs() - 0.5) * 1.1, (rs() - 0.5) * 0.9, 0.85 + 0.3 * rs()]);
    function buildStrands(n) {
      if (strands) { gPull.remove(strands); strands.geometry.dispose(); }
      const count = Math.min(128, pullN(n)), r = Math.max(0.012, 0.2 / Math.pow(2, n / 2)), pts = [];
      for (let i = 0; i <= 24; i++) { const u = -1 + (2 * i) / 24; pts.push(new THREE.Vector3(u * W, -SAG * (1 - u * u), 0)); }
      strands = new THREE.InstancedMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 6, false), dough, count);
      for (let i = 0; i < count; i++) {
        const f = count === 1 ? [0, 0, 1] : FAN[i];
        o3.position.set(0, YH, f[0] * Math.min(1, count / 8)); o3.rotation.set(f[1] * Math.min(1, count / 6), 0, 0); o3.scale.set(1, 1, 1); o3.updateMatrix(); strands.setMatrixAt(i, o3.matrix);
      }
      strands.castShadow = true; strands.frustumCulled = false; gPull.add(strands); strandN = n;
    }

    // ---------------- roll and cut
    const gCut = new THREE.Group(); gCut.position.set(MX, 0, 0); root.add(gCut);
    const bench = box(6.4, 0.16, 2.6, M.matte(0x30343c)); bench.position.set(0, 1.5, 0); gCut.add(bench);
    [-2.8, 2.8].forEach((x) => { const l = box(0.2, 1.5, 2.2, M.matte(0x22252b)); l.position.set(x, 0.75, 0); gCut.add(l); });
    const YS = 2.6, sheetIn = box(1.5, 1, 1.8, dough), sheetOut = box(1.9, 1, 1.8, dough); sheetIn.position.set(-2.25, YS, 0); sheetOut.position.set(-0.55, YS, 0); gCut.add(sheetIn, sheetOut);
    const rolls = [1, -1].map((sg) => { const c = cyl(0.42, 0.42, 2.1, steel, 32); c.rotation.x = Math.PI / 2; c.userData.sg = sg; gCut.add(c); return c; });
    const stripe = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 128; const g = c.getContext('2d'); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#7f8793' : '#d9dee6'; g.fillRect(0, i * 8, 8, 8); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const slitMat = new THREE.MeshStandardMaterial({ map: stripe, metalness: 0.7, roughness: 0.35 });
    const slits = [1, -1].map((sg) => { const c = cyl(0.3, 0.3, 2.1, slitMat, 32); c.rotation.x = Math.PI / 2; c.position.set(0.55, YS + sg * 0.33, 0); c.userData.sg = sg; gCut.add(c); return c; });
    const cutS = new THREE.InstancedMesh(new THREE.BoxGeometry(2.3, 1, 1), dough, 40); cutS.castShadow = true; cutS.frustumCulled = false; gCut.add(cutS);
    [[-1.2, 'roll'], [0.55, 'slit']].forEach(([x]) => { [-1.15, 1.15].forEach((z) => { const p = box(0.16, 1.9, 0.1, M.matte(0x22252b)); p.position.set(x, 2.5, z); gCut.add(p); }); });
    const labRoll = stage.label('Rollers', [-1.2, 3.75, 0], gCut), labSlit = stage.label('Slitter', [0.55, 3.45, 0], gCut);

    // ---------------- press
    const gPress = new THREE.Group(); gPress.position.set(MX, 0, 0); root.add(gPress);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.2, 48, 1, true), M.clear(0xdff2ff, 0.2)); barrel.position.y = 3.9; gPress.add(barrel);
    const die = cyl(0.9, 0.9, 0.1, M.metal(0xd8b24a, { roughness: 0.35 }), 48); die.position.y = 2.78; gPress.add(die);
    const piston = cyl(0.8, 0.8, 0.14, steel, 40); gPress.add(piston);
    const stem = cyl(0.09, 0.09, 1.3, steel, 12); gPress.add(stem);
    const bar = cyl(0.07, 0.07, 2.2, steel, 12); bar.rotation.z = Math.PI / 2; gPress.add(bar);
    const dgeo = new THREE.CylinderGeometry(0.78, 0.78, 1, 40); dgeo.translate(0, 0.5, 0);
    const doughIn = new THREE.Mesh(dgeo, dough); doughIn.position.y = 2.84; gPress.add(doughIn);
    const plate = cyl(1.9, 1.7, 0.1, steel, 48); plate.position.y = 0.55; gPress.add(plate);
    const nest = makeTangle(gPress, { n: 9, R: 1.3, y0: 0, y1: 0.28, r: 0.035, seed: 8, color: 0xfbfaf4 }); nest.g.position.y = 0.66;
    const HP = [[0, 0]]; [[6, 0.24], [12, 0.47], [18, 0.7]].forEach(([n, r]) => { for (let i = 0; i < n; i++) HP.push([r * Math.cos((i / n) * TAU), r * Math.sin((i / n) * TAU)]); });
    const sgeo = new THREE.CylinderGeometry(1, 1, 1, 8); sgeo.translate(0, -0.5, 0);
    const press = new THREE.InstancedMesh(sgeo, new THREE.MeshStandardMaterial({ color: 0xfbfaf4, roughness: 0.6 }), 37); press.frustumCulled = false; gPress.add(press);
    const labDie = stage.label('Die', [1.45, 2.78, 0], gPress);

    let S = s0, key = '', tt = 0;
    const bd = board(root, 3.9, 2.25, 632, 364, (g, w, h) => {
      panelBg(g, w, h);
      if (S.mode === 'pull') {
        const n = Math.round(S.pulls);
        title(g, 'Strands', 'doubling with every pull');
        const { X, Y } = axes(g, w, h, { x0: 92, y1: 64, y0: h - 48, xMax: 12, yMin: 1, yMax: 4096, logY: true, xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [1, 8, 64, 512, 4096], yFmt: (v) => v.toLocaleString('en-IN'), xLabel: '' });
        const pts = []; for (let i = 0; i <= 12; i++) pts.push([i, pullN(i)]);
        line(g, pts, X, Y, COL.gluten, 5); pts.forEach(([x, y]) => { g.fillStyle = COL.gluten; g.beginPath(); g.arc(X(x), Y(y), 5, 0, TAU); g.fill(); });
        dot(g, X(n), Y(pullN(n)), COL.ok, 11);
        g.font = 'bold 22px sans-serif'; g.fillStyle = '#fff'; g.fillText(`2^${n} = ${pullN(n).toLocaleString('en-IN')}`, 120, 96);
      } else if (S.mode === 'cut') {
        title(g, 'Sheet thickness', 'about 30% off per pass');
        const { X, Y } = axes(g, w, h, { x0: 84, y1: 64, y0: h - 48, xMax: 8, yMax: 10, xTicks: [0, 2, 4, 6, 8], yTicks: [0, 2.5, 5, 7.5, 10], yFmt: (v) => v + ' mm' });
        const pts = []; for (let i = 0; i <= 8; i++) pts.push([i, sheetT(i)]);
        line(g, pts, X, Y, COL.gluten, 5); dot(g, X(S.passes), Y(sheetT(S.passes)), COL.ok, 11);
        g.font = 'bold 22px sans-serif'; g.fillStyle = '#fff'; g.fillText(`${fmtMm(sheetT(S.passes))} thick, ${(SLAB / sheetT(S.passes)).toFixed(1)}× longer`, 250, 110);
      } else {
        title(g, 'The die, from below', `${Math.round(S.holes)} holes of ${S.hole.toFixed(1)} mm in a ${BARREL} mm barrel`);
        const cx = 190, cy = 205, Rp = 130;
        g.fillStyle = '#d8b24a'; g.beginPath(); g.arc(cx, cy, Rp, 0, TAU); g.fill();
        g.fillStyle = '#0c0e14'; HP.slice(0, Math.round(S.holes)).forEach(([x, y]) => { g.beginPath(); g.arc(cx + (x / 0.85) * Rp, cy + (y / 0.85) * Rp, Math.max(1.6, (S.hole / BARREL) * Rp), 0, TAU); g.fill(); });
        g.font = 'bold 44px sans-serif'; g.fillStyle = COL.ok; g.fillText(Math.round(pressGain(S.hole, Math.round(S.holes))) + '×', 370, 180);
        g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText('faster than the piston:', 370, 215); g.fillText('barrel area ÷ hole area', 370, 240);
      }
    }, [5.6, 5.75, 0]);
    const sizeNow = () => (S.mode === 'pull' ? [pullD(Math.round(S.pulls)), pullD(Math.round(S.pulls)), true] : S.mode === 'cut' ? [S.cut, sheetT(S.passes), false] : [S.hole, S.hole, true]);
    const bd2 = board(root, 3.9, 2.25, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'One strand, end on', 'to scale');
      const [a, b, round] = sizeNow(), big = Math.max(a, b), span = big > 12 ? 40 : big > 4 ? 15 : 5, px = 380 / span, cx = 300, cy = 185;
      g.fillStyle = '#f1e3bd';
      if (round) { g.beginPath(); g.arc(cx, cy, Math.max(1.5, (a * px) / 2), 0, TAU); g.fill(); } else g.fillRect(cx - (a * px) / 2, cy - (b * px) / 2, a * px, Math.max(2, b * px));
      g.fillStyle = '#c49bff'; g.beginPath(); g.arc(cx + 215, cy, Math.max(1.2, (0.07 * px) / 2), 0, TAU); g.fill();
      g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText('a hair, 0.07 mm', cx + 160, cy + 40);
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(110, 318); g.lineTo(110 + span * px, 318); g.stroke();
      for (let i = 0; i <= span; i += span / 5) { g.beginPath(); g.moveTo(110 + i * px, 310); g.lineTo(110 + i * px, 326); g.stroke(); }
      g.fillStyle = '#fff'; g.font = '18px sans-serif'; g.fillText(span + ' mm', 110 + span * px + 10, 324);
      g.font = 'bold 22px sans-serif'; g.fillText(round ? `${fmtMm(a)} across` : `${fmtMm(a)} × ${fmtMm(b)}`, 24, 84);
    }, [5.6, 2.6, 0]);

    return slimmed({
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        fitNarrow(stage, [labRoll, labSlit, labDie]); const stack = layout(stage, [bd.mesh, bd2.mesh]), K = stack ? 1.5 : 1;
        gPull.scale.setScalar(stack ? 1.3 : 1); gPress.scale.setScalar(K * 0.95); gCut.scale.setScalar(K * 0.8); gCut.position.y = 0.9 * K; gCut.rotation.y = -0.45;
        const n = Math.round(clamp(s.pulls, 0, 12));
        gPull.visible = s.mode === 'pull'; gCut.visible = s.mode === 'cut'; gPress.visible = s.mode === 'press';
        labRoll.visible = labSlit.visible = gCut.visible && labRoll.visible; labDie.visible = gPress.visible && labDie.visible;
        const k = `${s.mode}|${n}|${s.passes}|${s.cut}|${s.hole}|${Math.round(s.holes)}`;
        if (k !== key) { key = k; bd.redraw(); bd2.redraw(); }
        if (s.mode === 'pull') {
          if (n !== strandN) buildStrands(n);
          const st = 1 + 0.035 * Math.sin(tt * 2.2);
          strands.scale.set(st, 1, 1); hands.forEach((h, i) => { h.position.x = (i ? 1 : -1) * (W * st + 0.2); });
        } else if (s.mode === 'cut') {
          const tIn = 0.05 + sheetT(Math.max(0, s.passes - 1)) * 0.032, tOut = 0.05 + sheetT(s.passes) * 0.032;
          sheetIn.scale.y = tIn; sheetOut.scale.y = tOut;
          rolls.forEach((r) => { r.position.set(-1.2, YS + r.userData.sg * (0.42 + tOut / 2), 0); r.rotation.y += -r.userData.sg * dt * 2.2; });
          slits.forEach((r) => { r.rotation.y += -r.userData.sg * dt * 3; });
          const cnt = clamp(Math.round(30 / s.cut), 6, 38), pitch = 1.8 / cnt;
          for (let i = 0; i < 40; i++) {
            const a = 0.06 + 0.5 * ((i * 7) % cnt) / cnt; o3.position.set(0.6 + 1.15 * Math.cos(a), YS - 1.15 * Math.sin(a), (i + 0.5) * pitch - 0.9); o3.rotation.set(0, 0, -a); o3.scale.set(1, i < cnt ? tOut : 0.0001, i < cnt ? pitch * 0.62 : 0.0001); o3.updateMatrix(); cutS.setMatrixAt(i, o3.matrix);
          }
          cutS.instanceMatrix.needsUpdate = true;
        } else {
          const u = (tt * 0.16) % 1, top = 4.9 - 1.75 * u;
          piston.position.y = top; stem.position.y = top + 0.7; bar.position.y = top + 1.35; doughIn.scale.y = Math.max(0.02, top - 0.07 - 2.84);
          const nh = Math.round(clamp(s.holes, 1, 37)), r = 0.012 + s.hole * 0.022;
          for (let i = 0; i < 37; i++) {
            const [x, z] = HP[i], wob = 0.05 * Math.sin(tt * 3 + i * 1.3);
            o3.position.set(x + wob * 0.2, 2.74, z); o3.rotation.set(0, 0, wob * 0.25); o3.scale.set(i < nh ? r : 0.0001, 2.05, i < nh ? r : 0.0001); o3.updateMatrix(); press.setMatrixAt(i, o3.matrix);
          }
          press.instanceMatrix.needsUpdate = true;
          nest.g.rotation.y += dt * 0.5;
        }
      },
      readout: (s) => {
        if (s.mode === 'pull') {
          const n = Math.round(s.pulls), d = pullD(n);
          return `<div class="big">${pullN(n).toLocaleString('en-IN')} strands after ${n} pull${n === 1 ? '' : 's'}</div>
            <div class="row"><span>Each strand</span><b>${fmtMm(d)} across</b></div>
            <div class="row"><span>All the strands end to end</span><b>${fmtLen(SPAN * pullN(n))}</b></div>
            <div class="row"><span>Next pull</span><b>${pullN(n + 1).toLocaleString('en-IN')} strands, ${fmtMm(pullD(n + 1))}</b></div>
            <small>${n === 0 ? `One rope, ${ROPE} mm thick and ${SPAN} m long.` : n < 6 ? 'Thick, chewy noodles.' : n < 9 ? 'The usual range for a bowl of lamian.' : d > 0.07 ? 'Dragon-beard territory: very few cooks can do this.' : 'Finer than a hair.'} Only ${Math.min(128, pullN(n))} strands are drawn. Volume is conserved, so thickness falls by √2 per pull.</small>`;
        }
        if (s.mode === 'cut') {
          const t = sheetT(s.passes);
          return `<div class="big">${fmtMm(t)} sheet, cut ${s.cut.toFixed(1)} mm wide</div>
            <div class="row"><span>Slab at the start</span><b>${SLAB} mm</b></div>
            <div class="row"><span>The sheet is now</span><b>${(SLAB / t).toFixed(1)}× longer</b></div>
            <div class="row"><span>Strands from a 30 cm wide sheet</span><b>${Math.round(300 / s.cut)}</b></div>
            <small>${t > 3 ? 'Still too thick for most noodles.' : t > 1.3 ? 'Good for hakka noodles and udon.' : 'About right for ramen and instant noodles.'} Each pass takes about 30% off (20 to 40% is usual). Fewer strands are drawn than a real slitter cuts.</small>`;
        }
        const gain = pressGain(s.hole, Math.round(s.holes));
        return `<div class="big">${Math.round(s.holes)} strand${s.holes > 1 ? 's' : ''}, ${s.hole.toFixed(1)} mm thick</div>
          <div class="row"><span>Strand speed against piston speed</span><b>${Math.round(gain)}×</b></div>
          <div class="row"><span>Piston moving 1 mm a second</span><b>strand at ${gain >= 100 ? (gain / 10).toFixed(0) + ' cm/s' : gain.toFixed(0) + ' mm/s'}</b></div>
          <div class="row"><span>Barrel</span><b>${BARREL} mm across (typical)</b></div>
          <small>The same dough must pass through a much smaller area, so it speeds up by the ratio of the areas. Smaller or fewer holes also need a much harder push.</small>`;
      },
    });
  },
};

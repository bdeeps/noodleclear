// Chapter 4: the instant noodle line. Slit strands fall onto a slower belt and pile into waves,
// are steamed (which cooks the starch), cut into portions, and then dried fast: either flash-fried
// in oil or blown with hot air. The simulator computes the share of starch gelatinised, the
// moisture, the oil taken up, the pores left behind and the time the block will need in hot water.
// Typical figures (Hou, Asian Noodles; Gulia, Dhaka and Khatkar 2014, as summarised in Wikipedia
// "Instant noodles"): steam 1–5 min at 100 °C; fry 1–2 min at 140–160 °C, moisture from 30–50%
// down to 2–5%, 15–20% oil; hot air 70–90 °C for 30–40 min, 8–12% moisture, under 3% fat.
// Measured blocks (Wang et al. 2022, PMC8891372): fat 12.9–17.5% fried, 1.95–2.72% non-fried;
// cooking time 159–238 s fried, 261–382 s non-fried; honeycomb pores in fried strands.
// Limits: Codex CXS 249-2006, moisture at most 10% (fried), 14% (non-fried).
// The formulas in noodle.js are a guide pinned to those figures, not a plant's control model.
import { THREE, M, box } from '../kit.js';
import { lineOf, gelOf, strandMetres, M0, COL, MX, VIEW, board, panelBg, title, axes, line, dot, dashH, legend, cyl, chamber, puffs, waveGeo, makeBlock, makeSlice, rng, layout, resetLayout, fitNarrow, slimmed, fmtMin, clamp, lerp, link, TAU } from '../noodle.js';

const X0 = 0.8, X1 = 8.0, TA = 1.6, TB = 5.2, NB = 8;

export default {
  id: 'factory',
  short: 'The instant line',
  title: 'The instant noodle line',
  subtitle: 'Wave, steam, cut, then flash-fry at about 150 °C: water flashes to steam and leaves the strand full of pores.',
  view: VIEW,
  learn: `<p>An instant noodle is a noodle that has <b>already been cooked</b>, then dried so fast that it stays full of holes. The line does it in four steps.</p>
    <p><b>The wave.</b> A thin sheet of alkaline wheat dough is slit into strands, which drop onto a belt moving <b>slower</b> than the slitter. With nowhere to go, the strands buckle into waves. The waves keep strands from lying flat against each other, so steam, oil and later your hot water can get between them. They also pack several times more noodle into the same length.</p>
    <p><b>Steam.</b> A minute or more at 100 °C <b>gelatinises</b> the starch: this is the real cooking. Under-steamed noodles taste floury and take longer in the bowl.</p>
    <p><b>Cut and mould</b> into single portions.</p>
    <p><b>Dry.</b> Most blocks are <b>flash-fried</b>: about 140 to 160 °C oil for one to two minutes. The water inside is far above its boiling point, so it <b>flashes to steam</b> and bursts out, leaving a sponge of tiny <b>pores</b>. Moisture falls from over 30% to a few per cent, which is why the block keeps for months without a fridge. But oil moves into some of those pores: a fried block is about <b>15 to 20% fat</b>. The other way is <b>hot air</b> at 70 to 90 °C for half an hour or more. That gives a block with under 3% fat, but slow drying lets the strand shrink, so it has fewer pores and takes longer to cook.</p>
    <p>Frying physics is the same as in ${link('samosaclear', 'SamosaClear')}, and hot-air drying is cousin to ${link('airfryerclear', 'AirFryerClear')}.</p>
    <p class="tip"><b>Try it:</b> fry for only 30 seconds and see the moisture miss the limit. Then switch to hot air and compare the oil, the pores and the time in the bowl.</p>`,
  terms: [
    { t: 'Flash-frying', d: 'A short dip in very hot oil. Water in the food boils off in seconds and leaves pores behind.' },
    { t: 'Pregelatinised', d: 'Starch that was cooked at the factory, so it only needs water back, not cooking.' },
    { t: 'Moisture content', d: 'The share of a food that is water. Below about 10%, microbes cannot grow in a noodle block.' },
    { t: 'Oil uptake', d: 'The oil that moves into the pores as steam leaves. More water lost means more oil in.' },
    { t: 'Porosity', d: 'The share of a solid that is empty space. Pores are the paths water uses to get back in.' },
  ],
  defaults: { method: 'fry', steam: 2, fryT: 150, frySec: 75, airMin: 35, wave: 4, focus: 'all' },
  controls: [
    { key: 'method', type: 'seg', label: 'Drying', options: [{ v: 'fry', label: 'Flash-fry' }, { v: 'air', label: 'Hot air (80 °C)' }] },
    { key: 'steam', type: 'range', label: 'Steaming time', min: 0.3, max: 5, step: 0.1, ends: ['20 s', '5 min'], fmt: (v) => `${v.toFixed(1)} min · ${Math.round(gelOf(v) * 100)}% cooked` },
    { key: 'fryT', type: 'range', label: 'Fry: oil temperature', min: 110, max: 180, step: 1, ends: ['110 °C', '180 °C'], fmt: (v) => v + ' °C' },
    { key: 'frySec', type: 'range', label: 'Fry: time in the oil', min: 10, max: 180, step: 1, ends: ['10 s', '3 min'], fmt: (v) => Math.round(v) + ' s' },
    { key: 'airMin', type: 'range', label: 'Hot air: time in the dryer', min: 5, max: 60, step: 1, ends: ['5 min', '60 min'], fmt: (v) => v + ' min' },
    { key: 'wave', type: 'range', label: 'Slitter speed against belt speed', min: 1, max: 6, step: 0.1, ends: ['same', '6× faster'], fmt: (v) => (v < 1.05 ? 'straight strands' : v.toFixed(1) + '× · wavy') },
  ],
  quiz: [
    { q: 'Why do instant noodles come out of the slitter wavy?', options: ['A wavy knife cuts them', 'They land on a belt that moves slower than they arrive, so they buckle', 'Frying curls them', 'They are twisted by hand'], answer: 1, why: 'The strands pile up on the slower belt. The waves stop them sticking and let steam, oil and water through.' },
    { q: 'What does flash-frying do to the water in a steamed noodle?', options: ['Locks it in', 'Turns it to ice', 'Flashes it to steam, which escapes and leaves pores', 'Nothing'], answer: 2, why: 'Oil at about 150 °C is far above water\'s boiling point. The steam bursts out and leaves a sponge of pores.' },
    { q: 'An air-dried block has much less fat than a fried one. What is the trade-off?', options: ['It has fewer pores, so it takes longer to cook', 'It cannot be eaten', 'It has no starch', 'It needs a fridge'], answer: 0, why: 'Slow drying lets the strand shrink, so fewer pores are left for water to rush back into.' },
  ],
  reel: [
    { ms: 5600, caption: 'Instant noodles land on a slower belt, so the strands pile into waves. Then steam cooks the starch.', set: { method: 'fry', steam: 2, fryT: 150, frySec: 75, focus: 'wave' }, anim: { wave: [1, 5] }, spin: 0 },
    { ms: 6000, caption: 'Then about 150 °C oil for a minute. Water flashes to steam and leaves the strand full of pores.', set: { method: 'fry', steam: 2, fryT: 150, wave: 4, focus: 'fry' }, anim: { frySec: [5, 80] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    resetLayout();
    const root = new THREE.Group(); stage.root.add(root);
    const G = new THREE.Group(); root.add(G);
    const rnd = rng(31), steel = M.metal(0xb9c0cb, { roughness: 0.35 }), dark = M.matte(0x23262d), dough = new THREE.MeshStandardMaterial({ color: 0xf1e3bd, roughness: 0.7 });
    const beltM = M.matte(0x3b4250);
    const belt = (x0, x1, y = 1.0) => { const b = box(x1 - x0, 0.08, 1.3, beltM); b.position.set((x0 + x1) / 2, y, 0); G.add(b); [x0 + 0.15, x1 - 0.15].forEach((x) => { const l = box(0.1, y, 1.1, dark); l.position.set(x, y / 2, 0); G.add(l); }); return b; };
    belt(-3.3, 1.35); belt(5.45, X1);
    const beltAir = belt(1.35, 5.45);
    // slitter and the sheet coming in
    const sheet = box(0.9, 0.04, 1.1, dough); sheet.position.set(-4.0, 1.55, 0); G.add(sheet);
    const rolls = [1, -1].map((sg) => { const c = cyl(0.26, 0.26, 1.3, steel, 28); c.rotation.x = Math.PI / 2; c.position.set(-3.5, 1.55 + sg * 0.27, 0); c.userData.sg = sg; G.add(c); return c; });
    [-0.7, 0.7].forEach((z) => { const p = box(0.14, 1.9, 0.08, dark); p.position.set(-3.5, 0.95, z); G.add(p); });
    // the wavy mat on the slow belt
    let mat = null, matKey = '';
    const o3 = new THREE.Object3D();
    function buildMat(R) {
      if (mat) { G.remove(mat); mat.geometry.dispose(); }
      const A = 0.045 * Math.pow(Math.max(0, R - 1), 0.75), lam = 0.5 / (1 + 0.12 * (R - 1));
      mat = new THREE.InstancedMesh(waveGeo(4.1, A * 0.5, lam, 0.028, 150, A), dough, 9);
      for (let i = 0; i < 9; i++) { o3.position.set(-1.25, 1.09 + A, (i - 4) * 0.12); o3.rotation.set(0, 0, 0); o3.updateMatrix(); mat.setMatrixAt(i, o3.matrix); }
      mat.frustumCulled = false; mat.castShadow = true; mat.userData.lam = lam; G.add(mat);
    }
    // steamer
    chamber(G, -2.6, 0.0, 1.06, 2.15, 1.5, { color: 0xdfe8f5, opacity: 0.1 });
    const steam = puffs(G, 40, 0.07, 0xdfe8f5, rnd);
    // cutter
    const blade = box(0.05, 0.5, 1.2, steel); G.add(blade);
    [-0.68, 0.68].forEach((z) => { const p = box(0.1, 2.2, 0.08, dark); p.position.set(0.55, 1.1, z); G.add(p); });
    const head = box(0.3, 0.16, 1.5, dark); head.position.set(0.55, 2.2, 0); G.add(head);
    // fryer tank and air tunnel
    const tank = chamber(G, 1.45, 5.35, 0.3, 1.2, 1.5, { color: 0xffb21f, opacity: 0.4, edge: 0xffd98a });
    const tankBase = box(4.1, 0.3, 1.6, dark); tankBase.position.set(3.4, 0.15, 0); G.add(tankBase);
    const tunnel = chamber(G, 1.45, 5.35, 1.06, 2.15, 1.5, { color: 0xff7a59, opacity: 0.12, edge: 0xffb199 });
    const bub = puffs(G, 60, 0.045, 0xfff3c4, rnd), hot = puffs(G, 30, 0.05, 0xff9d7a, rnd);
    // blocks
    const blocks = Array.from({ length: NB }, (_, i) => { const b = makeBlock(G, { w: 0.62, d: 0.9, h: 0.2, rows: 5, layers: 2, r: 0.032 }); b.u = i / NB; return b; });
    const cPale = new THREE.Color('#f3ead0'), cGold = new THREE.Color('#e9b955'), cAir = new THREE.Color('#ead9a8'), cBurnt = new THREE.Color('#7d4f1e'), tc = new THREE.Color();
    const lab = [
      stage.label('Slow belt: <b>the wave</b>', [-2.4, 2.85, 0], G), stage.label('Steamer · 100 °C', [-1.3, 2.4, 0], G),
      stage.label('Cutter', [0.55, 2.6, 0], G), stage.label('', [3.4, 2.4, 0], G, 'hot'), stage.label('Cool and pack', [6.8, 1.9, 0], G),
    ];
    const sl = makeSlice(root, { pos: [5.6, 4.9, 0], R: 1.0, n: 120, nP: 130, seed: 14, caption: 'One strand after drying' });
    let S = s0, key = '', tt = 0;
    const bd = board(root, 3.9, 2.25, 632, 364, (g, w, h) => {
      const fry = S.method === 'fry', tMax = fry ? 180 : 60, r = lineOf(S), tNow = fry ? S.frySec : S.airMin;
      panelBg(g, w, h); title(g, fry ? `In the fryer at ${S.fryT} °C` : 'In the hot-air dryer at 80 °C');
      legend(g, [['Moisture', COL.water], ['Oil', COL.oil]], 24, 48, 17);
      const { X, Y } = axes(g, w, h, { x0: 70, y1: 80, y0: h - 46, xMax: tMax, yMax: 36, xTicks: fry ? [0, 30, 60, 90, 120, 150, 180] : [0, 10, 20, 30, 40, 50, 60], yTicks: [0, 10, 20, 30], xFmt: (v) => v + (fry ? ' s' : ' min'), yFmt: (v) => v + '%' });
      dashH(g, X(0), X(tMax), Y(r.limit), `Codex limit: ${r.limit}% moisture`, 'rgba(255,255,255,.5)');
      const pm = [], po = []; for (let i = 0; i <= 60; i++) { const t = (tMax * i) / 60, q = lineOf(S, t); pm.push([t, q.moisture]); po.push([t, q.fat]); }
      line(g, pm, X, Y, COL.water, 5); line(g, po, X, Y, COL.oil, 5);
      dot(g, X(tNow), Y(r.moisture), r.ok ? COL.ok : COL.bad, 10); dot(g, X(tNow), Y(r.fat), COL.oil, 8);
    }, [5.6, 7.85, 0]);

    return slimmed({
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        const narrow = fitNarrow(stage, [lab[0], lab[2], lab[4]]);
        bd.mesh.userData.homeP?.set(narrow ? 5.75 : 5.6, narrow ? 7.45 : 7.85, 0); sl.g.userData.homeP?.set(narrow ? 5.75 : 5.6, narrow ? 4.5 : 4.9, 0);
        const stack = layout(stage, [bd.mesh, sl.g]);
        if (stack) { const fx = s.focus === 'wave' ? -1.75 : s.focus === 'fry' ? 3.4 : 1.9, k = s.focus === 'all' ? 0.58 : 1.5; G.scale.setScalar(k); G.position.set(MX - fx * k, s.focus === 'all' ? 1.6 : 0.5, 0); }
        else { G.scale.setScalar(0.94); G.position.set(0.35, 0, 0); }
        const r = lineOf(s), fry = r.fry;
        const mk = s.wave.toFixed(1); if (mk !== matKey) { matKey = mk; buildMat(s.wave); }
        mat.position.x = (tt * 0.25) % mat.userData.lam;
        rolls.forEach((c) => { c.rotation.y += -c.userData.sg * dt * 3; });
        steam.step(dt, 16, () => [-2.5 + rnd() * 2.4, 1.2, (rnd() - 0.5) * 1.2], () => [(rnd() - 0.5) * 0.2, 0.45 + rnd() * 0.3, 0], 1.6);
        blade.position.set(0.55, 1.55 + 0.4 * Math.abs(Math.sin(tt * 2.2)), 0);
        tank.visible = tankBase.visible = fry; tunnel.visible = beltAir.visible = !fry;
        lab[3].element.innerHTML = fry ? `Fryer · <b>${s.fryT} °C</b> · ${Math.round(s.frySec)} s` : `Hot-air dryer · <b>80 °C</b> · ${s.airMin} min`;
        lab[3].element.style.setProperty('--c', fry ? COL.oil : COL.heat);
        // blocks ride through the dryer; colour follows moisture
        const tTot = fry ? s.frySec : s.airMin;
        blocks.forEach((b) => {
          b.u = (b.u + dt * 0.035) % 1;
          const x = X0 + (X1 - X0) * b.u, f = clamp((x - TA) / (TB - TA), 0, 1), dip = fry ? Math.min(1, Math.min(x - (TA - 0.25), TB + 0.25 - x) / 0.3) : 0;
          b.g.position.set(x, 1.16 - 0.5 * clamp(dip, 0, 1), 0);
          const q = lineOf(s, f * tTot), dry = clamp(1 - (q.moisture - 2) / (M0 - 2), 0, 1);
          tc.copy(cPale).lerp(fry ? cGold : cAir, dry); if (r.burnt && f > 0.6) tc.lerp(cBurnt, (f - 0.6) * 1.6);
          b.mat.color.copy(tc); b.wet = fry && dip > 0.8 ? clamp((q.moisture - r.moisture) / M0, 0, 1) : 0;
        });
        const inTank = blocks.filter((b) => b.wet > 0.02);
        bub.step(dt, fry ? 10 + inTank.length * 14 : 0, () => { const b = inTank[Math.floor(rnd() * inTank.length)] || blocks[0]; return [b.g.position.x + (rnd() - 0.5) * 0.6, 0.75, (rnd() - 0.5) * 0.8]; }, () => [0, 0.5 + rnd() * 0.5, 0], 0.7);
        hot.step(dt, fry ? 0 : 12, () => [1.6 + rnd() * 3.6, 2.05, (rnd() - 0.5) * 1.0], () => [0, -0.6, 0], 1.1);
        // the slice: pores where the water was, an oily skin if fried
        const share = clamp(r.pores / 0.36, 0, 1);
        sl.back.material.color.copy(cPale).lerp(fry ? cGold : cAir, clamp(1 - (r.moisture - 2) / 30, 0, 1));
        sl.ring.material.color.set(fry ? COL.oil : '#ffffff'); sl.ring.scale.setScalar(fry ? 1 + 0.05 * clamp(r.fat / 18, 0, 1) : 1);
        sl.P.forEach((p, i) => { sl.pores.place(i, p.x, p.y, 0, p.j < share ? 0.9 + 0.9 * p.j : 0.0001); });
        sl.pores.done();
        sl.G.forEach((p, i) => { const ck = p.j < r.G; sl.gran.place(i, p.x, p.y, 0, ck ? 0.0001 : 0.9); });
        sl.gran.done();
        sl.setCap(`After drying: ${Math.round(r.pores * 100)}% pores${r.G < 0.75 ? ', raw starch left' : ''}`);
        const k = `${s.method}|${s.steam}|${s.fryT}|${Math.round(s.frySec)}|${s.airMin}`; if (k !== key) { key = k; bd.redraw(); }
      },
      readout: (s) => {
        const r = lineOf(s), len = strandMetres(r);
        const verdict = !r.ok ? 'Too wet to keep' : r.G < 0.7 ? 'Dry, but under-steamed' : r.burnt ? 'Over-fried: dark and bitter' : r.fry ? 'A good fried block' : 'A good air-dried block';
        const tip = !r.ok ? `Above the ${r.limit}% limit the block can spoil on the shelf. Dry it longer${r.fry ? ' or hotter' : ''}.` : r.G < 0.7 ? 'Much of the starch is still raw: floury taste and a longer wait in the bowl.' : r.burnt ? 'Too hot for too long: the surface browns and the oil breaks down faster.' : r.fry ? 'Dry enough to keep for months, and porous enough to cook in minutes.' : 'Very little fat, but fewer pores: it needs longer in the bowl.';
        return `<div class="big">${verdict}</div>
          <div class="row"><span>Starch cooked by the steam</span><b>${Math.round(r.G * 100)}%</b></div>
          <div class="row"><span>Moisture (was ${M0}%)</span><b class="${r.ok ? 'ok' : 'no'}">${r.moisture.toFixed(1)}%</b></div>
          <div class="row"><span>Fat in the block</span><b style="color:${COL.oil}">${r.fat.toFixed(1)}%</b></div>
          <div class="row"><span>Pores</span><b>${Math.round(r.pores * 100)}% of the strand</b></div>
          <div class="row"><span>Time to soften in boiling water</span><b>about ${fmtMin(r.reh)}</b></div>
          <div class="row"><span>Strand in one 70 g block</span><b>about ${Math.round(len)} m</b></div>
          <small>${tip} A guide model fitted to typical published figures.</small>`;
      },
    });
  },
};

// Chapter 3: in the pot. A dried strand cooks from the outside in. Heat gets to the centre in
// seconds; water takes minutes, and starch cannot gelatinise without it. The white core that is
// left in the middle is "al dente".
// Model (see noodle.js): the wet front moves as √time, set so 1.8 mm dried spaghetti is cooked
//  through at 11 minutes (an effective water diffusivity near 3 × 10⁻¹⁰ m²/s: a guide).
//  Heat: time ≈ radius² / thermal diffusivity (0.14 mm²/s, close to water's).
//  Cooking loss: 4–8% of the dry weight is typical for good pasta; cooked pasta weighs about
//  2.3 times its dry weight (typical).
//  Salt: boiling-point rise ΔT = i·Kb·m with Kb = 0.512 K kg/mol. 10 g a litre gives 0.17 °C.
// Wheat starch gelatinises over about 51–60 °C [St]. Altitude and boiling: see BoilClear.
import { THREE } from '../kit.js';
import { cookOf, COL, MX, VIEW, board, panelBg, title, axes, line, dot, makePot, makeTangle, makeSlice, layout, resetLayout, fitNarrow, slimmed, clamp, lerp, link } from '../noodle.js';

export default {
  id: 'pot',
  short: 'In the pot',
  title: 'Cooking from the outside in',
  subtitle: 'Water creeps into the strand and the starch swells behind it. Al dente is a thin core the water has not reached.',
  view: VIEW,
  learn: `<p>Drop dried noodles into boiling water and two things race for the centre of each strand: <b>heat</b> and <b>water</b>.</p>
    <p>Heat wins easily. A strand is so thin that its middle is hot within seconds. But hot, dry starch does nothing. A starch granule needs water <b>and</b> heat, above about 60 °C for wheat, to <b>gelatinise</b>: it drinks water, swells to several times its size and goes from hard and chalky to soft and glassy.</p>
    <p>Water has to soak in from the surface, and that is slow. So the strand cooks in a ring that grows inward. Bite a strand early and you see a white dot in the middle: starch that is hot but still dry. <b>Al dente</b>, "to the tooth", means stopping while a thin firm core is left. Because water soaks in as the square root of time, a strand <b>twice as thick takes four times as long</b>.</p>
    <p>The water goes <b>cloudy</b> because swollen granules at the surface leak starch, mostly amylose. That loose starch is also why noodles <b>stick</b>: in the first minute or two the surfaces are glue. Plenty of water and a stir fix it. Rinsing cooked noodles washes the glue off, which is right for a cold salad or hakka noodles headed for the wok, and wrong for a sauce that needs to cling.</p>
    <p>And the <b>salt</b>? It is for taste. It raises the boiling point by a fraction of a degree, far too little to matter. For how boiling itself works, and why it is slower in the hills, see ${link('boilclear', 'BoilClear')}.</p>
    <p class="tip"><b>Try it:</b> run the time forward and stop when the white core is thin. Then double the thickness and see how long the same point takes.</p>`,
  terms: [
    { t: 'Gelatinisation', d: 'Starch granules absorbing hot water and swelling until their hard structure is lost.' },
    { t: 'Al dente', d: 'Cooked until only a thin, firm core is left in the middle of the strand.' },
    { t: 'Diffusion', d: 'Slow spreading, here of water into the strand. Distance grows with the square root of time.' },
    { t: 'Cooking loss', d: 'The starch and other solids that leak from the noodle into the water, a few per cent of its weight.' },
    { t: 'Boiling-point elevation', d: 'Dissolved salt makes water boil slightly hotter: about 0.17 °C for 10 g a litre.' },
  ],
  defaults: { thick: 1.8, t: 4, salt: 10, water: 1 },
  controls: [
    { key: 't', type: 'range', label: 'Time in boiling water', min: 0, max: 20, step: 0.1, ends: ['0', '20 min'], fmt: (v) => v.toFixed(1) + ' min' },
    { key: 'thick', type: 'range', label: 'Strand thickness (dried)', min: 0.8, max: 2.6, step: 0.1, ends: ['0.8 mm', '2.6 mm'], fmt: (v) => v.toFixed(1) + ' mm' },
    { key: 'water', type: 'range', label: 'Water for 100 g of noodles', min: 0.3, max: 2, step: 0.1, ends: ['0.3 L', '2 L'], fmt: (v) => v.toFixed(1) + ' L' },
    { key: 'salt', type: 'range', label: 'Salt in the water', min: 0, max: 30, step: 1, ends: ['none', '30 g/L'], fmt: (v) => v + ' g per litre' },
  ],
  quiz: [
    { q: 'What is the white dot in the middle of an undercooked strand?', options: ['Salt', 'Starch that water has not reached yet', 'Gluten', 'Air'], answer: 1, why: 'The core is hot, but starch cannot gelatinise without water, and water is still soaking in.' },
    { q: 'A 1 mm noodle cooks in 3 minutes. Roughly how long for a 2 mm noodle of the same dough?', options: ['3 minutes', '6 minutes', '12 minutes', '30 minutes'], answer: 2, why: 'Water soaks in as the square root of time, so twice the thickness takes about four times as long.' },
    { q: 'Why does the cooking water turn cloudy?', options: ['Salt reacts with the pot', 'Starch leaks from the surface of the noodles', 'The noodles release air', 'Gluten dissolves completely'], answer: 1, why: 'Swollen surface granules leak starch, mostly amylose, into the water.' },
  ],
  reel: [
    { ms: 5800, caption: 'In the pot, water creeps inward and starch granules swell. Al dente is a thin core still waiting.', set: { thick: 1.8, salt: 10, water: 1 }, anim: { t: [0, 9.5] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    resetLayout();
    const root = new THREE.Group(); stage.root.add(root);
    const pot = makePot(root, { x: MX, R: 1.75, H: 2.1, seed: 5 });
    const tangle = makeTangle(pot.inner, { n: 13, R: 1.45, y0: 0.15, y1: 1.15, r: 0.05, seed: 6, color: 0xf0cf7a });
    const sl = makeSlice(root, { pos: [5.6, 2.75, 0], R: 1.15, n: 170, nP: 1, seed: 9, caption: 'One strand, cut across' });
    sl.pores.visible = false; sl.core.visible = true;
    const tLab = stage.label('', [MX, 3.85, 0], root, 'hot');
    const cRaw = new THREE.Color('#fffdf2'), cGel = new THREE.Color('#e2c574'), cDry = new THREE.Color('#f0cf7a'), cWet = new THREE.Color('#f7e7b0'), cW = new THREE.Color(), tc = new THREE.Color();
    let S = s0, key = '';
    const bd = board(root, 3.9, 2.25, 632, 364, (g, w, h) => {
      const r = cookOf(S.thick, S.t, S.water, S.salt), tMax = 20;
      panelBg(g, w, h); title(g, 'The uncooked core', `${S.thick.toFixed(1)} mm strand`);
      const { X, Y } = axes(g, w, h, { x0: 74, y1: 64, y0: h - 48, xMax: tMax, yMax: 100, xTicks: [0, 5, 10, 15, 20], yTicks: [0, 25, 50, 75, 100], xFmt: (v) => v + ' min', yFmt: (v) => v + '%' });
      g.fillStyle = 'rgba(92,225,169,.16)'; g.fillRect(X(0), Y(25), X(tMax) - X(0), Y(4) - Y(25));
      g.font = '17px sans-serif'; g.fillStyle = COL.ok; g.fillText('al dente', X(tMax) - 70, Y(25) - 6);
      const pts = []; for (let t = 0; t <= tMax; t += 0.25) pts.push([t, cookOf(S.thick, t).core * 100]);
      line(g, pts, X, Y, COL.starch, 5);
      const p2 = []; for (let t = 0; t <= tMax; t += 0.25) p2.push([t, cookOf(S.thick * 2, t).core * 100]);
      line(g, p2, X, Y, 'rgba(255,255,255,.35)', 3, [7, 6]);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('twice as thick', X(13.2), Y(cookOf(S.thick * 2, 12).core * 100) - 10);
      dot(g, X(S.t), Y(r.core * 100), r.core > 0.25 ? '#fff' : r.over > 0.25 ? COL.bad : COL.ok, 10);
    }, [5.6, 5.75, 0]);

    return slimmed({
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        fitNarrow(stage, []); pot.g.scale.setScalar(layout(stage, [bd.mesh, sl.g]) ? 1.45 : 1);
        const r = cookOf(s.thick, s.t, s.water, s.salt), cloud = clamp(r.starchGL / 12, 0, 1);
        cW.set('#6fb6ff').lerp(tc.set('#e9e6d6'), cloud);
        pot.set({ level: 0.72, boil: 0.8, flame: 0.8, steam: 0.7, color: cW.getHex(), opacity: lerp(0.3, 0.72, cloud) }).step(dt);
        tangle.mat.color.copy(cDry).lerp(cWet, r.gel);
        tangle.g.rotation.y += dt * 0.35; tangle.g.scale.setScalar(1 + 0.12 * r.gel); tangle.g.scale.y = 1 + 0.12 * r.gel;
        tangle.g.position.y = 0.04 * Math.sin(performance.now() / 300);
        // the slice: a gelatinised ring growing inwards, a white core shrinking
        const sw = 1 + 0.22 * r.gel + 0.08 * Math.min(1, r.over);
        sl.disc.scale.setScalar(sw); sl.back.material.color.copy(cGel);
        sl.core.scale.setScalar(Math.max(0.001, r.core)); sl.core.material.color.set('#fbf3d6');
        sl.G.forEach((p, i) => {
          const wet = p.rho > r.core + 0.02;
          sl.gran.place(i, p.x, p.y, 0, wet ? 1.55 + 0.4 * p.j : 0.8);
          sl.gran.tint(i, wet ? tc.copy(cGel).lerp(cRaw, 0.25) : cRaw);
        });
        sl.gran.done();
        sl.setCap(r.core > 0.04 ? 'One strand: swollen ring, dry white core' : 'One strand: gelatinised right through');
        tLab.element.innerHTML = `${(100 + r.dTb).toFixed(1)} °C · ${r.state.split(':')[0]}`;
        tLab.element.style.setProperty('--c', r.core > 0.25 ? '#fff' : r.over > 0.25 ? COL.bad : COL.ok);
        const k = `${s.thick}|${s.t.toFixed(2)}|${s.water}|${s.salt}`; if (k !== key) { key = k; bd.redraw(); }
      },
      readout: (s) => {
        const r = cookOf(s.thick, s.t, s.water, s.salt);
        const tip = s.water < 0.6 ? 'Very little water: it turns starchy fast and the strands are likely to stick.' : r.core > 0.25 ? 'The centre is hot but dry. Give the water time to reach it.' : r.core > 0.04 ? 'A thin firm core: this is al dente.' : r.over < 0.25 ? 'Soft all the way through.' : 'The surface is breaking down and leaking starch: soft and sticky.';
        return `<div class="big">${r.state}</div>
          <div class="row"><span>White core</span><b>${(r.core * 100).toFixed(0)}% of the width</b></div>
          <div class="row"><span>Al dente at · cooked through at</span><b>${r.alDente.toFixed(1)} · ${r.done.toFixed(1)} min</b></div>
          <div class="row"><span>Heat reaches the centre in</span><b>about ${r.heatS < 10 ? r.heatS.toFixed(1) : r.heatS.toFixed(0)} s</b></div>
          <div class="row"><span>100 g of dry noodles now weighs</span><b>${Math.round(r.weight)} g</b></div>
          <div class="row"><span>Starch in the water</span><b style="color:${r.starchGL > 9 ? COL.bad : '#fff'}">${r.starchGL.toFixed(1)} g per litre</b></div>
          <div class="row"><span>Salt raises the boiling point by</span><b>${r.dTb.toFixed(2)} °C</b></div>
          <small>${tip} The wet front follows a diffusion law fitted to packet times: a guide. Sea level; dried durum strand.</small>`;
      },
    });
  },
};

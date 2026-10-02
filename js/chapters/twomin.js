// Chapter 5: two minutes. The block is already cooked, so "cooking" it is only putting the water
// back, and the pores left by frying are the way in. Then the tastemaker, and what is in the pack.
// Rehydration: an exponential that reaches 95% at the "ready" time; ready times sit inside the
// measured ranges of Wang et al. 2022 (PMC8891372): 159–238 s for fried blocks, 261–382 s for
// non-fried. Cooler water is slower (a guide, about 3% per °C).
// Nutrition: per 100 g of fried block, USDA FoodData Central "Soup, ramen noodle, any flavor,
// dry": 440 kcal, 17.6 g fat, 60.3 g carbohydrate, 10.2 g protein; air-dried block typical
// (2.5 g fat). Energy by Atwater factors. Sodium with the whole sachet: about 1,200 mg for a
// 70 g pack (typical; labels range from about 870 mg to over 1,300 mg). Daily reference values:
// 2,000 kcal, 67 g fat and 2,000 mg sodium (the basis FSSAI labels use; WHO: under 2,000 mg
// of sodium a day).
// MSG: JECFA (the FAO/WHO expert committee) set an ADI "not specified" for glutamates in 1987.
// FSSAI permits it in seasonings with a label statement, and by its order of 31 March 2016 a pack
// may not claim "No added MSG", since glutamate also occurs naturally in the ingredients.
import { THREE } from '../kit.js';
import { PACK, readyAt, softOf, packOf, DAY, COL, MX, VIEW, board, panelBg, title, axes, line, dot, dashH, legend, bars, makePot, makeBlock, makeSlice, layout, resetLayout, fitNarrow, slimmed, fmtMin, clamp, lerp, link } from '../noodle.js';

export default {
  id: 'twomin',
  short: 'Two minutes',
  title: 'Why two minutes?',
  subtitle: 'The block was cooked at the factory. Hot water only has to get back in, and the pores are open doors.',
  view: VIEW,
  learn: `<p>Compare this with the pot in chapter 3. There, water had to soak slowly into a solid strand, and the starch still had to cook. Here both jobs were done at the factory. The starch is <b>already gelatinised</b>, and frying left the strand riddled with <b>pores</b>. Hot water runs straight into them and the strand softens from every side at once.</p>
    <p>That is the whole secret of "two minutes". In lab tests, fried blocks take roughly <b>two and a half to four minutes</b> to soften fully, and air-dried blocks, with fewer pores, about <b>four to six</b>. Thinner strands and a rolling boil are how a pack gets close to two. Water that is only warm is much slower, which is why cup noodles ask for water straight off the boil and a closed lid.</p>
    <p>The <b>tastemaker</b> sachet is mostly <b>salt</b>, with dried spices (onion, garlic, chilli, turmeric, coriander), sugar, a little starch to thicken, and often <b>flavour enhancers</b>. The best known is <b>MSG</b>, monosodium glutamate: the same glutamate that makes tomatoes, cheese and soy sauce taste savoury. The FAO/WHO expert committee, JECFA, has set no numerical limit on its daily intake ("ADI not specified"). In India, FSSAI allows it in seasonings but requires it on the label, and a pack may not claim "No added MSG".</p>
    <p>Stated plainly: a typical 70 g fried block with its sachet is about <b>300 kcal</b>, mostly refined wheat flour, with about <b>12 g of fat</b> and well over <b>half a day's sodium</b>. It has little protein or fibre. Using less of the sachet cuts the sodium, and adding vegetables or an egg adds what the block lacks.</p>
    <p class="tip"><b>Try it:</b> run the time forward and watch the pores fill from the outside in. Then switch to the air-dried block, or drop the water to 70 °C.</p>`,
  terms: [
    { t: 'Rehydration', d: 'Putting water back into a dried food.' },
    { t: 'Pores', d: 'Tiny holes left where water flashed to steam in the fryer. They let hot water in fast.' },
    { t: 'Tastemaker', d: 'The seasoning sachet: mostly salt, with spices, sugar and flavour enhancers.' },
    { t: 'MSG', d: 'Monosodium glutamate, a flavour enhancer. Glutamate is also found naturally in tomatoes and cheese.' },
    { t: 'Sodium', d: 'The part of salt that health guidance counts. WHO advises adults to stay under 2,000 mg a day.' },
  ],
  defaults: { type: 'fried', T: 100, t: 60, sachet: 1, show: 'soft' },
  controls: [
    { key: 'type', type: 'seg', label: 'Block', options: [{ v: 'fried', label: 'Fried' }, { v: 'air', label: 'Air-dried' }] },
    { key: 't', type: 'range', label: 'Time in the water', min: 0, max: 420, step: 5, ends: ['0', '7 min'], fmt: (v) => fmtMin(v) },
    { key: 'T', type: 'range', label: 'Water temperature', min: 60, max: 100, step: 1, ends: ['60 °C', 'boiling'], fmt: (v) => v + ' °C' },
    { key: 'sachet', type: 'range', label: 'How much of the tastemaker', min: 0, max: 1, step: 0.05, ends: ['none', 'all of it'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'show', type: 'seg', label: 'Chart', options: [{ v: 'soft', label: 'Softening' }, { v: 'pack', label: 'What is in the pack' }] },
  ],
  quiz: [
    { q: 'Why does an instant noodle block soften in a few minutes when dried spaghetti takes ten?', options: ['It is made of rice', 'It was already cooked, and its pores let water straight in', 'It has more salt', 'It is thicker'], answer: 1, why: 'The starch was gelatinised by steam at the factory, and frying left pores for the water to rush into.' },
    { q: 'What is most of the tastemaker sachet, by weight?', options: ['Salt', 'Protein', 'Fibre', 'Oil'], answer: 0, why: 'Salt is the main ingredient, which is why one pack carries well over half a day\'s sodium.' },
    { q: 'What is JECFA\'s position on MSG?', options: ['It is banned', 'It set an acceptable daily intake of "not specified", meaning no numerical limit was needed', 'It allows 1 mg a day', 'It has never evaluated it'], answer: 1, why: 'The FAO/WHO expert committee evaluated glutamates in 1987 and did not set a numerical limit. Labels must still declare it.' },
  ],
  reel: [
    { ms: 5800, caption: 'At home, hot water rushes back into those pores. That is why the block is ready in minutes.', set: { type: 'fried', T: 100, sachet: 1, show: 'soft' }, anim: { t: [0, 180] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    resetLayout();
    const root = new THREE.Group(); stage.root.add(root);
    const pot = makePot(root, { x: MX, R: 1.75, H: 1.5, seed: 12 });
    const blk = makeBlock(pot.inner, { w: 2.2, d: 1.7, h: 0.5, rows: 9, layers: 3, r: 0.05 });
    const sl = makeSlice(root, { pos: [5.6, 2.75, 0], R: 1.15, n: 1, nP: 150, seed: 21, caption: 'One strand: water filling the pores' });
    sl.gran.visible = false;
    const tLab = stage.label('', [MX, 3.35, 0], root, 'hot');
    const cDry = new THREE.Color('#e9b955'), cAir = new THREE.Color('#ead9a8'), cSoft = new THREE.Color('#f7e7b0'), cBroth = new THREE.Color('#d98a2b'), cW = new THREE.Color('#6fb6ff'), tc = new THREE.Color(), cPore = new THREE.Color('#1a1208'), cFull = new THREE.Color('#58a9ff');
    let S = s0, key = '';
    const bd = board(root, 3.9, 2.25, 632, 364, (g, w, h) => {
      panelBg(g, w, h);
      if (S.show === 'pack') {
        const p = packOf(S.type, S.sachet);
        title(g, 'One 70 g pack', 'share of a day\'s reference');
        bars(g, [
          { label: 'Energy', value: (p.kcal / DAY.kcal) * 100, color: COL.gluten, text: `${Math.round(p.kcal)} kcal · ${Math.round((p.kcal / DAY.kcal) * 100)}%` },
          { label: 'Fat', value: (p.fat / DAY.fat) * 100, color: COL.oil, text: `${p.fat.toFixed(1)} g · ${Math.round((p.fat / DAY.fat) * 100)}%` },
          { label: 'Sodium', value: (p.sodium / DAY.sodium) * 100, color: COL.salt, text: `${Math.round(p.sodium / 10) * 10} mg · ${Math.round((p.sodium / DAY.sodium) * 100)}%` },
          { label: 'Protein', value: (p.protein / 50) * 100, color: COL.ok, text: `${p.protein.toFixed(1)} g` },
        ], { y: 70, w: 600, rowH: 62, labelW: 120, max: 100 });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)'; g.fillText('Bars run to 100% of 2,000 kcal, 67 g fat, 2,000 mg sodium. Typical values.', 20, 344);
        return;
      }
      title(g, 'How soft is it?', `water at ${S.T} °C`);
      legend(g, [['Fried', COL.oil], ['Air-dried', COL.water]], 24, 48, 17);
      const { X, Y } = axes(g, w, h, { x0: 74, y1: 80, y0: h - 46, xMax: 7, yMax: 100, xTicks: [0, 1, 2, 3, 4, 5, 6, 7], yTicks: [0, 25, 50, 75, 100], xFmt: (v) => v + ' min', yFmt: (v) => v + '%' });
      dashH(g, X(0), X(7), Y(95), 'ready', 'rgba(255,255,255,.45)');
      for (const [ty, col] of [['fried', COL.oil], ['air', COL.water]]) { const pts = []; for (let t = 0; t <= 420; t += 6) pts.push([t / 60, softOf(ty, S.T, t) * 100]); line(g, pts, X, Y, col, ty === S.type ? 6 : 3); }
      dot(g, X(Math.min(7, S.t / 60)), Y(softOf(S.type, S.T, S.t) * 100), COL.ok, 10);
    }, [5.6, 5.75, 0]);

    return slimmed({
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        fitNarrow(stage, []); pot.g.scale.setScalar(layout(stage, [bd.mesh, sl.g]) ? 1.5 : 1);
        const f = softOf(s.type, s.T, s.t), boil = s.T >= 99 ? 0.7 : 0, broth = clamp(s.sachet, 0, 1) * clamp(s.t / 40, 0, 1);
        tc.copy(cW).lerp(cBroth, broth * 0.75);
        pot.set({ level: 0.62, boil, flame: s.T >= 99 ? 0.7 : 0.15, steam: clamp((s.T - 55) / 45, 0, 1) * 0.6, color: tc.getHex(), opacity: lerp(0.32, 0.6, broth) }).step(dt);
        blk.mat.color.copy(s.type === 'fried' ? cDry : cAir).lerp(cSoft, f);
        blk.g.scale.set(1 + 0.16 * f, 1 - 0.25 * f, 1 + 0.2 * f);
        blk.g.position.y = 0.42 + 0.03 * Math.sin(performance.now() / 350) * (boil ? 1 : 0.2);
        blk.g.rotation.y = 0.25;
        // the slice: pores fill from the rim inwards
        const nPores = s.type === 'fried' ? 1 : 0.3, front = 1 - f;
        sl.back.material.color.copy(s.type === 'fried' ? cDry : cAir).lerp(cSoft, f); sl.disc.scale.setScalar(1 + 0.15 * f);
        sl.ring.material.color.set(COL.water);
        sl.P.forEach((p, i) => { const on = p.j < nPores, full = p.rho > front; sl.pores.place(i, p.x, p.y, 0, on ? 1.0 + 0.8 * p.j : 0.0001); sl.pores.tint(i, full ? cFull : cPore); });
        sl.pores.done();
        sl.setCap(f > 0.95 ? 'One strand: every pore full, soft through' : s.type === 'fried' ? 'One strand: water filling the pores' : 'Air-dried: fewer pores, a slower way in');
        tLab.element.innerHTML = `${s.T} °C · <b>${Math.round(f * 100)}%</b> soft`;
        tLab.element.style.setProperty('--c', f > 0.95 ? COL.ok : '#fff');
        const k = `${s.type}|${s.T}|${Math.round(s.t)}|${s.sachet}|${s.show}`; if (k !== key) { key = k; bd.redraw(); }
      },
      readout: (s) => {
        const f = softOf(s.type, s.T, s.t), ready = readyAt(s.type, s.T), p = packOf(s.type, s.sachet);
        const state = f < 0.4 ? 'Still a hard block' : f < 0.8 ? 'Softening' : f < 0.95 ? 'Nearly there' : s.t > ready * 1.8 ? 'Soft and going soggy' : 'Ready';
        return `<div class="big">${state} · ${Math.round(f * 100)}%</div>
          <div class="row"><span>Ready after about</span><b>${fmtMin(ready)}</b></div>
          <div class="row"><span>Energy in a 70 g pack</span><b>${Math.round(p.kcal)} kcal</b></div>
          <div class="row"><span>Sodium</span><b style="color:${p.sodium > 1000 ? COL.bad : '#fff'}">${Math.round(p.sodium / 10) * 10} mg · ${Math.round((p.sodium / DAY.sodium) * 100)}% of a day</b></div>
          <div class="row"><span>Fat · carbohydrate · protein</span><b>${p.fat.toFixed(0)} · ${p.carb.toFixed(0)} · ${p.protein.toFixed(0)} g</b></div>
          <small>${s.T < 85 ? 'Cooler water is much slower: keep it near boiling and cover it. ' : ''}${PACK[s.type].name}. Times follow lab measurements of commercial blocks; nutrition is typical, so read your own pack.</small>`;
      },
    });
  },
};

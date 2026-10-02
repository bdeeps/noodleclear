// Chapter 1: what is in a noodle. One strand, hugely magnified and cut open: starch granules held
// in a net. In wheat and durum noodles the net is gluten. In rice noodles the granules have been
// steamed until they swell and glue themselves together. In glass noodles the granules are gone:
// the strand is a clear starch gel.
// Dough recipes and flour compositions are typical values (see noodle.js: Hou, Asian Noodles;
// Wikipedia "Pasta processing"). Granule sizes and gelatinisation ranges: see [St] in noodle.js.
// Kansui: sodium and potassium carbonates. The yellow comes from flavones in the flour that are
// colourless in neutral dough and turn yellow in alkali (Wikipedia, "Kansui"; McGee, On Food and
// Cooking). The pH curve is a guide between plain dough (about 6) and alkaline noodles (9–11).
import { THREE } from '../kit.js';
import { KINDS, doughOf, pHOf, COL, MX, VIEW, board, panelBg, title, bars, dots, rng, layout, resetLayout, fitNarrow, slimmed, clamp, lerp, link, TAU } from '../noodle.js';

const N = 240, L = 5.0, R = 1.25, Y = 2.5;

export default {
  id: 'noodle',
  short: 'Inside a noodle',
  title: 'What is in a noodle?',
  subtitle: 'Starch granules held in a net: gluten in wheat noodles, cooked starch itself in rice and glass noodles.',
  view: VIEW,
  learn: `<p>Every noodle is the same idea: <b>starch</b> and water, pressed into a long shape and then <b>set</b> so it holds together. What changes is the thing that does the holding.</p>
    <p>Flour is mostly <b>starch granules</b>: hard, tiny grains packed with two kinds of starch molecule, <b>amylose</b> and <b>amylopectin</b>. Wheat granules come in two sizes, up to about 55 micrometres. Rice granules are much smaller.</p>
    <p>In <b>wheat noodles</b> the glue is <b>gluten</b>. Wet wheat proteins link into a stretchy net that wraps the granules, so the dough can be rolled, cut and pulled. ${link('breadclear', 'BreadClear')} tells the full gluten story. <b>Durum</b> semolina has more protein and makes the stiff dough of pasta.</p>
    <p>Many Asian wheat noodles add <b>kansui</b>: alkaline salts, sodium and potassium carbonate. Alkali tightens the dough so the noodle is firmer and springier, gives ramen its smell, and turns colourless pigments in the flour <b>yellow</b>. No egg is needed.</p>
    <p><b>Rice</b> has no gluten. So idiyappam and sevai use heat: steaming makes the granules swell and leak sticky starch, and the starch itself becomes the glue. <b>Glass noodles</b> go all the way. They are pure mung bean starch, cooked to a clear gel, with no protein and no granules left.</p>
    <p class="tip"><b>Try it:</b> slide <b>Look inside</b> to the right, then switch between wheat, rice and glass. Add kansui to the wheat noodle and watch the colour and the pH.</p>`,
  terms: [
    { t: 'Starch granule', d: 'A tiny hard grain in which a plant stores starch. Flour is mostly these.' },
    { t: 'Gluten', d: 'The stretchy net that wheat proteins form when wet and kneaded. It holds wheat noodles together.' },
    { t: 'Amylose', d: 'The straight-chain starch molecule. It leaks out of hot granules and sets into a firm gel.' },
    { t: 'Kansui', d: 'Alkaline salts (sodium and potassium carbonate) that make ramen-type noodles yellow, firm and springy.' },
    { t: 'Gelatinisation', d: 'Starch granules soaking up hot water, swelling and losing their hard structure.' },
  ],
  defaults: { kind: 'wheat', look: 0.25, kansui: 0 },
  controls: [
    { key: 'kind', type: 'seg', label: 'Noodle', options: [{ v: 'wheat', label: 'Wheat' }, { v: 'durum', label: 'Durum pasta' }, { v: 'rice', label: 'Rice' }, { v: 'glass', label: 'Glass' }] },
    { key: 'look', type: 'range', label: 'Look inside', min: 0, max: 1, step: 0.01, ends: ['whole strand', 'X-ray'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'kansui', type: 'range', label: 'Kansui in 100 g of flour (wheat only)', min: 0, max: 1.5, step: 0.05, ends: ['none', '1.5 g'], fmt: (v, s) => (s.kind === 'wheat' ? `${v.toFixed(2)} g · pH ${pHOf(v).toFixed(1)}` : 'not used'), hint: 'About 0.5 to 1.5 g is typical for ramen-type noodles.' },
  ],
  quiz: [
    { q: 'What holds a wheat noodle together?', options: ['A net of gluten proteins around the starch granules', 'Sugar', 'Oil', 'Salt crystals'], answer: 0, why: 'Wet wheat proteins link into gluten, a stretchy net that wraps the starch granules.' },
    { q: 'Rice has no gluten. What holds idiyappam or sevai together?', options: ['Added egg', 'Starch that has been steamed until it swells and turns sticky', 'Kansui', 'Nothing, they fall apart'], answer: 1, why: 'Heat and water gelatinise the starch. The swollen, leaky granules glue themselves to each other.' },
    { q: 'Why are ramen-type noodles yellow, even without egg?', options: ['Turmeric is always added', 'They are fried', 'Alkaline kansui turns pigments in the flour yellow', 'Yellow wheat is used'], answer: 2, why: 'Flavones in wheat flour are colourless in ordinary dough and turn yellow at high pH.' },
  ],
  reel: [
    { ms: 5600, caption: 'A noodle is starch granules held in a net of protein, shaped and then set by heat.', set: { kind: 'wheat', kansui: 0 }, anim: { look: [0, 1] }, spin: 0 },
    { ms: 5200, caption: 'Alkaline salts called kansui turn a wheat noodle yellow, firm and springy. No egg needed.', set: { kind: 'wheat', look: 0.35 }, anim: { kansui: [0, 1.5] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    resetLayout();
    const root = new THREE.Group(); stage.root.add(root);
    const g = new THREE.Group(); g.position.set(MX, Y, 0); g.rotation.set(0, -0.5, 0.1); root.add(g);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1e3bd, roughness: 0.6, transparent: true, opacity: 1 });
    const skinG = new THREE.CylinderGeometry(R, R, L, 48, 1, true); skinG.rotateZ(Math.PI / 2);
    const skin = new THREE.Mesh(skinG, skinMat); skin.castShadow = true; g.add(skin);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xf1e3bd, roughness: 0.75, transparent: true, opacity: 1, side: THREE.DoubleSide });
    const faceL = new THREE.Mesh(new THREE.CircleGeometry(R, 48), faceMat); faceL.rotation.y = -Math.PI / 2; faceL.position.x = -L / 2; g.add(faceL);
    const gelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, transparent: true, opacity: 0.15, depthWrite: false });
    const gelG = new THREE.CylinderGeometry(R * 0.97, R * 0.97, L * 0.99, 40); gelG.rotateZ(Math.PI / 2);
    const gel = new THREE.Mesh(gelG, gelMat); g.add(gel);
    // granules: fixed places, sizes set per kind
    const rnd = rng(11), gran = dots(N, 1, 0xfffdf4, 10, true); g.add(gran);
    const P = Array.from({ length: N }, (_, i) => { const a = rnd() * TAU, rr = R * 0.88 * Math.sqrt(rnd()); return { x: (rnd() - 0.5) * (L - 0.3), y: rr * Math.cos(a), z: rr * Math.sin(a), j: rnd(), big: i % 4 === 0 }; });
    // the net: short links between nearby points
    const segs = [];
    const nodes = Array.from({ length: 150 }, () => { const a = rnd() * TAU, rr = R * 0.92 * Math.sqrt(rnd()); return [(rnd() - 0.5) * L, rr * Math.cos(a), rr * Math.sin(a)]; });
    nodes.forEach((A, i) => nodes.forEach((B, k) => { if (k > i && Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]) < 0.62) segs.push(...A, ...B); }));
    const netG = new THREE.BufferGeometry(); netG.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    const netMat = new THREE.LineBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0, toneMapped: false });
    g.add(new THREE.LineSegments(netG, netMat));
    const labG = stage.label('', [-1.2, 1.9, 0], g), labN = stage.label('', [1.5, -1.75, 0], g, 'hot');
    labN.element.style.setProperty('--c', COL.gluten);

    let S = s0, key = '', lookNow = s0.look;
    const cA = new THREE.Color(), cB = new THREE.Color(COL.kansui), tc = new THREE.Color();
    const bd = board(root, 3.9, 2.25, 632, 364, (c, w, h) => {
      const k = KINDS[S.kind], d = doughOf(S.kind, S.kansui);
      panelBg(c, w, h); title(c, 'In 100 g of dough', k.name.toLowerCase());
      bars(c, [
        { label: 'Water', value: d.water, color: COL.water }, { label: 'Starch', value: d.starch, color: COL.starch },
        { label: 'Protein', value: d.protein, color: COL.gluten }, { label: 'Salts', value: d.salt, color: COL.salt }, { label: 'Fibre, fat, minerals', value: d.other, color: COL.other },
      ], { y: 62, w: 600, rowH: 56, labelW: 210, max: 70, unit: (v) => v.toFixed(v < 3 ? 1 : 0) + ' g' });
    }, [5.6, 5.75, 0]);
    const SZ = [['Wheat: large', 30, 'wheat'], ['Wheat: small', 6, 'wheat'], ['Rice', 5, 'rice'], ['Mung bean', 20, 'glass']];
    const bd2 = board(root, 3.9, 2.25, 632, 364, (c, w, h) => {
      panelBg(c, w, h); title(c, 'Starch granules, to scale', 'micrometres (µm)');
      const px = 3.2; let x = 70;
      SZ.forEach(([n, d, kd]) => {
        const on = kd === S.kind || (S.kind === 'durum' && kd === 'wheat'), r = (d * px) / 2;
        c.fillStyle = on ? COL.starch : 'rgba(244,241,232,.3)'; c.beginPath(); c.arc(x + 48, 170, r, 0, TAU); c.fill();
        c.font = 'bold 18px sans-serif'; c.fillStyle = on ? '#fff' : 'rgba(255,255,255,.5)'; c.fillText(n, x + 48 - c.measureText(n).width / 2, 262);
        c.font = '17px sans-serif'; const t = `about ${d} µm`; c.fillText(t, x + 48 - c.measureText(t).width / 2, 286);
        x += 140;
      });
      c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 84); c.lineTo(40 + 50 * px, 84); c.stroke();
      c.font = '17px sans-serif'; c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText('50 µm: about a fine human hair', 40 + 50 * px + 12, 90);
      c.fillText('A 1.5 mm noodle is about 50 large wheat granules across.', 24, 334);
    }, [5.6, 2.6, 0]);

    return slimmed({
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        fitNarrow(stage, [labG]); const stack = layout(stage, [bd.mesh, bd2.mesh]);
        g.scale.setScalar(stack ? 1.22 : 1); g.position.y = stack ? 2.7 : Y;
        const k = KINDS[s.kind], ks = s.kind === 'wheat' ? s.kansui : 0;
        lookNow += (s.look - lookNow) * (1 - Math.exp(-8 * dt));
        cA.set(k.col).lerp(cB, clamp(ks / 1.5, 0, 1) * 0.75);
        const glass = s.kind === 'glass', rice = s.kind === 'rice';
        skinMat.color.copy(cA); faceMat.color.copy(cA);
        skinMat.opacity = lerp(glass ? 0.6 : 1, 0.1, lookNow); skinMat.depthWrite = skinMat.opacity > 0.9;
        faceMat.opacity = lerp(glass ? 0.6 : 1, 0.06, lookNow);
        gelMat.color.copy(cA); gelMat.opacity = (rice ? 0.3 : glass ? 0.4 : 0.1) * lookNow;
        netMat.color.set(k.gluten ? COL.gluten : glass ? '#9fd4ff' : '#ffffff');
        netMat.opacity = lookNow * (k.gluten ? 0.5 + 0.4 * (k.gluten - 1) + 0.2 * clamp(ks, 0, 1) : glass ? 0.55 : 0.2);
        const kk = `${s.kind}|${ks.toFixed(2)}`;
        if (kk !== key) {
          key = kk; bd.redraw(); bd2.redraw();
          P.forEach((p, i) => {
            const sc = glass ? 0.0001 : rice ? 0.085 + 0.03 * p.j : p.big ? 0.15 + 0.05 * p.j : 0.055 + 0.03 * p.j;
            gran.place(i, p.x, p.y, p.z, sc); gran.tint(i, tc.set(rice ? '#ffffff' : '#fff6e0').lerp(cA, 0.45));
          });
          gran.done();
        }
        g.rotation.y = -0.5 + 0.06 * Math.sin(performance.now() / 2600);
        labG.element.innerHTML = glass ? 'No granules left: a clear starch gel' : rice ? 'Rice starch granules, swollen and stuck together' : 'Starch granules';
        labN.element.innerHTML = k.gluten ? 'Gluten net' : glass ? 'Amylose gel' : 'Leaked starch: the glue';
        labN.element.style.setProperty('--c', k.gluten ? COL.gluten : '#9fd4ff');
        labG.element.style.opacity = labN.element.style.opacity = clamp(lookNow * 3, 0, 1);
      },
      readout: (s) => {
        const k = KINDS[s.kind], d = doughOf(s.kind, s.kansui), ks = s.kind === 'wheat' ? s.kansui : 0;
        return `<div class="big">${k.name}${ks > 0.2 ? ' with kansui' : ''}</div>
          <div class="row"><span>Made from</span><b>${k.flour}</b></div>
          <div class="row"><span>What holds it together</span><b style="color:${k.gluten ? COL.gluten : COL.water}">${k.gluten ? 'Gluten net' : s.kind === 'rice' ? 'Sticky cooked starch' : 'Starch gel'}</b></div>
          <div class="row"><span>Protein in the flour</span><b>${k.protein}%</b></div>
          <div class="row"><span>Starch gelatinises at about</span><b>${k.gel[0]}–${k.gel[1]} °C</b></div>
          ${s.kind === 'wheat' ? `<div class="row"><span>Dough pH</span><b style="color:${ks > 0.2 ? COL.kansui : '#fff'}">${pHOf(ks).toFixed(1)}${ks > 0.2 ? ' · yellow, springy' : ' · pale'}</b></div>` : ''}
          <div class="row"><span>How it is set</span><b>${k.set}</b></div>
          <small>${k.eg}. Recipes and compositions are typical; the pH curve is a guide.</small>`;
      },
    });
  },
};

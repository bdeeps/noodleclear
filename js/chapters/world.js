// Chapter 6: a world of noodles, sorted by two questions. What is it made of (wheat, wheat with
// alkali, durum wheat, rice, pure starch)? And how is the strand formed (rolled and cut, pressed
// through a die, pulled by hand)? Twelve noodles on one map.
// Sources for the entries: Hou (ed.), Asian Noodles (2010); McGee, On Food and Cooking (2004);
// K. T. Achaya, Indian Food: A Historical Companion (1994) for idiyappam, sevai and falooda;
// Wikipedia articles on each noodle for the everyday descriptions.
import { THREE, M } from '../kit.js';
import { WORLD, INGS, HOWS, COL, MX, VIEW, board, panelBg, title, wrap, cyl, makeTangle, makeBlock, layout, resetLayout, fitNarrow, slimmed, clamp, link, TAU } from '../noodle.js';

const pickOf = (s) => WORLD[clamp(Math.round(s.pick), 0, WORLD.length - 1)];

export default {
  id: 'world',
  short: 'A world of noodles',
  title: 'A world of noodles',
  subtitle: 'Wheat, rice or pure starch; cut, pressed or pulled. Two choices explain almost every noodle on Earth.',
  view: VIEW,
  learn: `<p>Now you can read any noodle. Ask two questions: <b>what is it made of</b>, and <b>how was the strand formed</b>?</p>
    <p><b>Wheat</b> has gluten, so it can be rolled thin and cut, like <b>hakka noodles</b> and <b>udon</b>, or even pulled by hand, like <b>lamian</b>. Add alkali and you get the yellow spring of <b>ramen</b> and of <b>instant noodles</b>. <b>Durum</b> wheat makes a dough too stiff to pull, so <b>spaghetti</b> is forced through a die and dried slowly.</p>
    <p><b>Rice</b> has no gluten, so heat does the gluing. <b>Idiyappam</b> is pressed first and steamed after. <b>Sevai</b> is cooked first and pressed after. <b>Flat rice noodles</b> are a batter steamed into a sheet and sliced. <b>Pure starch</b> goes one step further: <b>glass noodles</b> and <b>falooda sev</b> are a cooked starch paste pressed into water, clear because there is no protein to scatter light.</p>
    <p>India has all of these. Kolkata's Chinese community gave the country hakka noodles and Indo-Chinese cooking. The south has pressed rice noodles in every state. Falooda came with Persian sweets. And instant noodles, launched in the 1980s, are now a habit: India is one of the largest instant noodle markets in the world.</p>
    <p>A noodle is not far from its cousins either. The same wheat and gluten make ${link('breadclear', 'bread')} and ${link('pizzaclear', 'pizza')}, and the same rice and steam make ${link('idliclear', 'idli')}.</p>
    <p class="tip"><b>Try it:</b> slide through the twelve noodles and watch the dot move on the map. Which cells are empty, and why can nobody pull a rice noodle?</p>`,
  terms: [
    { t: 'Hakka noodles', d: 'Indo-Chinese stir-fried wheat noodles, named after the Hakka Chinese community of Kolkata.' },
    { t: 'Idiyappam', d: 'Rice flour dough pressed into thin strands and steamed. Also called string hoppers.' },
    { t: 'Sevai', d: 'South Indian rice noodles pressed from dough that has already been cooked.' },
    { t: 'Falooda sev', d: 'Clear strands of cooked corn or arrowroot starch, served cold in the dessert falooda.' },
    { t: 'Durum', d: 'A hard wheat whose coarse flour, semolina, makes firm dried pasta.' },
  ],
  defaults: { pick: 0 },
  controls: [
    { key: 'pick', type: 'range', label: 'Noodle', min: 0, max: WORLD.length - 1, step: 1, ends: [WORLD[0].n, WORLD[WORLD.length - 1].n], fmt: (v) => WORLD[Math.round(v)].n },
  ],
  quiz: [
    { q: 'Idiyappam and sevai are both pressed rice noodles. What is the difference?', options: ['Idiyappam is pressed then steamed; sevai is cooked then pressed', 'Sevai contains wheat', 'Idiyappam is fried', 'There is none'], answer: 0, why: 'Both rely on steamed starch as the glue. They just do the two steps in opposite order.' },
    { q: 'Why are glass noodles see-through?', options: ['They are made of sugar', 'They are pure cooked starch gel, with no protein or granules to scatter light', 'They are very thin', 'They contain oil'], answer: 1, why: 'A smooth starch gel lets light pass. Protein and intact granules are what make other noodles opaque.' },
    { q: 'Why is spaghetti extruded rather than hand-pulled?', options: ['Italians have no tables', 'Durum semolina dough is too stiff and low in water to stretch', 'It contains rice', 'Pulling would make it yellow'], answer: 1, why: 'Pasta dough has only about 30% water and strong gluten. It is pushed through a die under high pressure.' },
  ],
  reel: [
    { ms: 6000, caption: 'Wheat, rice or pure starch; cut, pressed or pulled. Two choices give the world its noodles.', anim: { pick: [0, 11] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    resetLayout();
    const root = new THREE.Group(); stage.root.add(root);
    const g = new THREE.Group(); g.position.set(MX, 0, 0); root.add(g);
    const top = cyl(2.2, 2.2, 0.14, M.matte(0x3a2f26), 64); top.position.y = 1.0; g.add(top);
    const leg = cyl(0.35, 0.5, 0.95, M.matte(0x2a211b), 24); leg.position.y = 0.48; g.add(leg);
    const plate = cyl(1.95, 1.6, 0.16, M.plastic(0x2f6650, { roughness: 0.45 }), 64); plate.position.y = 1.16; g.add(plate);
    const holder = new THREE.Group(); holder.position.y = 1.3; g.add(holder);
    const lab = stage.label('', [0, 3.6, 0], g, 'hot');
    let S = s0, cur = -1;
    function show(i) {
      cur = i;
      [...holder.children].forEach((c) => { holder.remove(c); c.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); }); });
      const n = WORLD[i], col = new THREE.Color(n.col).getHex();
      if (n.block) { const b = makeBlock(holder, { w: 2.5, d: 1.9, h: 0.6, rows: 10, layers: 3, r: 0.055, color: col }); b.g.position.y = 0.4; }
      else if (n.straight) {
        const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }), geo = new THREE.CylinderGeometry(n.r, n.r, 3.5, 8); geo.rotateZ(Math.PI / 2);
        const m = new THREE.InstancedMesh(geo, mat, 46), o = new THREE.Object3D();
        for (let k = 0, q = 0; k < 46; k++) { const row = k < 16 ? 0 : k < 30 ? 1 : k < 40 ? 2 : 3, inRow = [16, 14, 10, 6][row], idx = k - [0, 16, 30, 40][row]; o.position.set(0, n.r + row * n.r * 1.75, (idx - (inRow - 1) / 2) * n.r * 2.05); o.rotation.set(0, (Math.sin(k * 7.1) * 0.03), 0); o.updateMatrix(); m.setMatrixAt(q++, o.matrix); }
        m.castShadow = true; holder.add(m);
      } else {
        const t = makeTangle(holder, { n: n.k, R: 1.4, y0: n.r, y1: n.r + 0.75 * (n.flat ? 0.6 : 1), r: n.r, seed: 40 + i, color: col, opacity: n.clear ?? 1 });
        if (n.flat) t.g.children.forEach((m) => { m.scale.y = n.flat; });
        if (n.clear) { t.mat.roughness = 0.1; t.mat.depthWrite = false; }
      }
    }
    const bd = board(root, 3.9, 2.25, 632, 364, (c, w, h) => {
      const sel = pickOf(S);
      panelBg(c, w, h); title(c, 'The noodle map', 'made of what, shaped how');
      const x0 = 150, y0 = 96, cw = (w - x0 - 14) / 5, chh = 70;
      c.font = 'bold 17px sans-serif';
      INGS.forEach((n, i) => { c.fillStyle = i === sel.ing ? '#fff' : 'rgba(255,255,255,.6)'; const two = n === 'Wheat + alkali' ? ['Wheat', '+ alkali'] : n.includes(' ') ? n.split(' ') : ['', n]; two.forEach((t, q) => c.fillText(t, x0 + i * cw + (cw - c.measureText(t).width) / 2, y0 - 28 + q * 19)); });
      HOWS.forEach((n, j) => { c.fillStyle = j === sel.how ? '#fff' : 'rgba(255,255,255,.6)'; const parts = n.split(' '); c.fillText(parts.slice(0, 2).join(' '), 14, y0 + j * chh + 32); c.fillText(parts.slice(2).join(' '), 14, y0 + j * chh + 52); });
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
        const on = i === sel.ing && j === sel.how;
        c.fillStyle = on ? 'rgba(92,225,169,.2)' : 'rgba(255,255,255,.05)'; c.fillRect(x0 + i * cw + 3, y0 + j * chh + 3, cw - 6, chh - 6);
        const items = WORLD.filter((n) => n.ing === i && n.how === j);
        items.forEach((n, k) => {
          const px = x0 + i * cw + 16 + (k % 3) * ((cw - 32) / 2), py = y0 + j * chh + 26 + Math.floor(k / 3) * 26;
          c.fillStyle = n.col; c.beginPath(); c.arc(px, py, n === sel ? 12 : 8, 0, TAU); c.fill();
          if (n === sel) { c.strokeStyle = COL.ok; c.lineWidth = 4; c.stroke(); }
        });
        if (!items.length) { c.fillStyle = 'rgba(255,255,255,.25)'; c.font = '14px sans-serif'; c.fillText(i >= 3 && j === 2 ? 'no gluten' : '', x0 + i * cw + 16, y0 + j * chh + 44); c.font = 'bold 17px sans-serif'; }
      }
      c.font = 'bold 21px sans-serif'; c.fillStyle = COL.ok; c.fillText(sel.n, 20, 344); const tw = c.measureText(sel.n).width;
      c.font = '17px sans-serif'; c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText(`${INGS[sel.ing]} · ${HOWS[sel.how].toLowerCase()}`, 34 + tw, 344);
    }, [5.6, 5.75, 0]);
    const bd2 = board(root, 3.9, 2.25, 632, 364, (c, w, h) => {
      const n = pickOf(S);
      panelBg(c, w, h); title(c, n.n, n.where);
      const steps = [['Made of', INGS[n.ing]], ['Shaped', HOWS[n.how]], ['Set', n.set]];
      steps.forEach(([a, b], i) => {
        const y = 62 + i * 68;
        c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(20, y, w - 40, 58);
        c.fillStyle = [COL.gluten, COL.water, COL.heat][i]; c.fillRect(20, y, 8, 58);
        c.font = 'bold 21px sans-serif'; c.fillText(a, 42, y + 36);
        c.fillStyle = '#fff'; c.font = '23px sans-serif'; wrap(c, b, 150, b.length > 34 ? y + 25 : y + 36, w - 180, 25);
      });
      c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '21px sans-serif'; wrap(c, n.note, 22, 294, w - 44, 26);
    }, [5.6, 2.6, 0]);

    return slimmed({
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        fitNarrow(stage, []); g.scale.setScalar(layout(stage, [bd.mesh, bd2.mesh]) ? 1.5 : 1);
        const i = clamp(Math.round(s.pick), 0, WORLD.length - 1);
        if (i !== cur) { show(i); bd.redraw(); bd2.redraw(); lab.element.innerHTML = `<b>${WORLD[i].n}</b> · ${WORLD[i].where}`; lab.element.style.setProperty('--c', '#fff'); }
        holder.rotation.y += dt * 0.25;
      },
      readout: (s) => {
        const n = pickOf(s);
        return `<div class="big">${n.n}</div>
          <div class="row"><span>From</span><b>${n.where}</b></div>
          <div class="row"><span>Made of</span><b>${INGS[n.ing]}</b></div>
          <div class="row"><span>Strand formed by</span><b>${HOWS[n.how].toLowerCase()}</b></div>
          <div class="row"><span>Set by</span><b>${n.set}</b></div>
          <div class="row"><span>Gluten net</span><b>${n.ing <= 2 ? 'yes' : 'no: starch is the glue'}</b></div>
          <small>${n.note}</small>`;
      },
    });
  },
};

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  heliocentric, orbitPath, moonGeocentric, jdFromDate, dateFromJd,
  findMoonPhaseAny, findSeason, findOpposition,
} from './astro.js';
import { FACTS } from './facts.js';

// ---------------------------------------------------------------------------
// Mittakaavat: koot ja etäisyydet on puristettu potenssifunktiolla, jotta
// kaikki mahtuu samaan näkymään mutta kokoerot säilyvät havainnollisina.
// ---------------------------------------------------------------------------
const DEG = Math.PI / 180;
const SIZE_EXP = 0.6;   // säde ∝ (todellinen säde)^0.6
const DIST_EXP = 0.55;  // etäisyys ∝ AU^0.55
const DIST_K = 34;

const scaleRadius = (earthRadii) => 1.6 * Math.pow(earthRadii, SIZE_EXP);
const scaleDist = (au) => DIST_K * Math.pow(au, DIST_EXP);

const SUN_RADIUS = 7; // ei mittakaavassa, kuten sovittu

const PLANETS = [
  { key: 'mercury', name: 'Merkurius', earthRadii: 0.383, texture: '2k_mercury.jpg', tilt: 0.03, dayHours: 1407.6,
    info: { radius: '2 439,7 km', dist: '57,9 milj. km (0,39 AU)', period: '88 vrk', day: '58,6 vrk', moons: '0' } },
  { key: 'venus', name: 'Venus', earthRadii: 0.949, texture: '2k_venus_surface.jpg', tilt: 177.4, dayHours: -5832.5,
    info: { radius: '6 051,8 km', dist: '108,2 milj. km (0,72 AU)', period: '224,7 vrk', day: '243 vrk (takaperoinen)', moons: '0' } },
  { key: 'earth', name: 'Maa', earthRadii: 1, texture: '2k_earth_daymap.jpg', tilt: 23.4, dayHours: 23.93,
    info: { radius: '6 371 km', dist: '149,6 milj. km (1,00 AU)', period: '365,25 vrk', day: '23 h 56 min', moons: '1 (Kuu)' } },
  { key: 'mars', name: 'Mars', earthRadii: 0.532, texture: '2k_mars.jpg', tilt: 25.2, dayHours: 24.62,
    info: { radius: '3 389,5 km', dist: '227,9 milj. km (1,52 AU)', period: '687 vrk', day: '24 h 37 min', moons: '2' } },
  { key: 'jupiter', name: 'Jupiter', earthRadii: 10.97, texture: '2k_jupiter.jpg', tilt: 3.1, dayHours: 9.93,
    info: { radius: '69 911 km', dist: '778,5 milj. km (5,20 AU)', period: '11,86 v', day: '9 h 56 min', moons: '95' } },
  { key: 'saturn', name: 'Saturnus', earthRadii: 9.14, texture: '2k_saturn.jpg', tilt: 26.7, dayHours: 10.55, ring: true,
    info: { radius: '58 232 km', dist: '1 433,5 milj. km (9,54 AU)', period: '29,45 v', day: '10 h 33 min', moons: '146' } },
  { key: 'uranus', name: 'Uranus', earthRadii: 3.98, texture: '2k_uranus.jpg', tilt: 97.8, dayHours: -17.24,
    info: { radius: '25 362 km', dist: '2 872,5 milj. km (19,2 AU)', period: '84 v', day: '17 h 14 min (takaperoinen)', moons: '28' } },
  { key: 'neptune', name: 'Neptunus', earthRadii: 3.86, texture: '2k_neptune.jpg', tilt: 28.3, dayHours: 16.11,
    info: { radius: '24 622 km', dist: '4 495,1 milj. km (30,1 AU)', period: '164,8 v', day: '16 h 6 min', moons: '16' } },
];

const SUN_INFO = { radius: '696 340 km', dist: '—', period: '—', day: '25–35 vrk', moons: '—' };
// Kuulle oma etäisyysotsikko: se kiertää Maata, ei Aurinkoa
const MOON_INFO = {
  radius: '1 737,4 km', distLabel: 'Etäisyys Maasta', dist: '384 400 km',
  period: '27,3 vrk', day: '27,3 vrk (sidottu pyöriminen)', moons: '—',
};

// Ekliptikakoordinaatit (AU) → näkymän koordinaatit
function toScene(p, out) {
  const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  const s = r > 1e-9 ? scaleDist(r) / r : 0;
  out.set(p.x * s, p.z * s, -p.y * s);
  return out;
}

// --- Perusnäkymä -----------------------------------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 5000);
camera.position.set(0, 130, 260);

const app = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
app.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.id = 'labels';
app.appendChild(labelRenderer.domElement);

// Kontrollit kiinnitetään koko säiliöön eikä pelkkään canvakseen, jotta
// rullaus toimii myös nimilappujen päällä. Laput pysäyttävät oman
// pointerdown-tapahtumansa, joten niiden klikkaus ei käännä kameraa.
const controls = new OrbitControls(camera, app);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.3;
controls.maxDistance = 1500;

scene.add(new THREE.AmbientLight(0xffffff, 0.18));
const sunLight = new THREE.PointLight(0xfff2d8, 2.6, 0, 0);
scene.add(sunLight);

const texLoader = new THREE.TextureLoader();
function loadTex(file) {
  const t = texLoader.load('textures/' + file);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Tähtitaivas. Tekstuuri venytetään koko taivaalle, joten se tarvitsee
// selvästi planeettoja suuremman tarkkuuden. Vanhemmilla laitteilla, jotka
// eivät tue 4096 pikselin tekstuureja, käytetään pienempää versiota.
{
  const maxTex = renderer.capabilities.maxTextureSize;
  const starTex = loadTex(maxTex >= 4096 ? '4k_stars_milky_way.jpg' : '2k_stars_milky_way.jpg');
  starTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(2000, 64, 32),
    new THREE.MeshBasicMaterial({ map: starTex, side: THREE.BackSide })
  );
  sky.material.color.setScalar(0.55); // himmennetään taustaa hieman
  scene.add(sky);
}

// --- Aurinko ---------------------------------------------------------------
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS, 48, 32),
  new THREE.MeshBasicMaterial({ map: loadTex('2k_sun.jpg') })
);
sunMesh.userData = {
  name: 'Aurinko', info: SUN_INFO, viewRadius: SUN_RADIUS,
  facts: FACTS.sun, factIndex: 0,
};
scene.add(sunMesh);

const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: makeGlowTexture(), color: 0xffcc66, transparent: true, opacity: 0.55, depthWrite: false,
}));
sunGlow.scale.setScalar(SUN_RADIUS * 5);
scene.add(sunGlow);

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.25, 'rgba(255,200,100,0.45)');
  grad.addColorStop(1, 'rgba(255,160,40,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// --- Planeetat -------------------------------------------------------------
const jdNow = jdFromDate(new Date());
const pickables = [sunMesh];
const bodies = []; // { def, group, mesh, spinAxis }

function makeLabel(text, cls, onClick) {
  const div = document.createElement('div');
  div.className = 'label ' + (cls || '');
  div.textContent = text;
  div.addEventListener('pointerdown', (e) => { e.stopPropagation(); onClick(); });
  return new CSS2DObject(div);
}


for (const def of PLANETS) {
  const group = new THREE.Group();          // sijoitetaan radalle
  const spinAxis = new THREE.Group();       // akselin kallistus + pyörähdys
  if (def.key === 'earth') {
    // Pohjoisnapa kallistuu kohti kesäpäivänseisauksen suuntaa (ekliptikan
    // pituus 90°), jotta vuodenajat osuvat oikein päin.
    spinAxis.rotation.x = -def.tilt * DEG;
  } else {
    spinAxis.rotation.z = -def.tilt * DEG;
  }
  group.add(spinAxis);

  const radius = scaleRadius(def.earthRadii);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 32),
    new THREE.MeshStandardMaterial({ map: loadTex(def.texture), roughness: 1, metalness: 0 })
  );
  // viewRadius = mitä kameran pitää mahduttaa kuvaan (renkaat mukaan lukien)
  mesh.userData = {
    name: def.name, info: def.info, body: def.key,
    facts: FACTS[def.key], factIndex: 0,
    viewRadius: def.ring ? radius * 2.4 : radius,
  };
  spinAxis.add(mesh);
  pickables.push(mesh);

  if (def.ring) {
    const inner = radius * 1.25, outer = radius * 2.3;
    const geo = new THREE.RingGeometry(inner, outer, 128);
    // Renkaan tekstuuri on säteittäinen kaistale: u = etäisyys renkaan poikki
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    const ringTex = texLoader.load('textures/2k_saturn_ring_alpha.png');
    ringTex.colorSpace = THREE.SRGBColorSpace;
    const ring = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: ringTex, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    }));
    ring.rotation.x = -Math.PI / 2;
    spinAxis.add(ring);
  }

  const label = makeLabel(def.name, '', () => selectBody(mesh));
  label.position.set(0, radius + 2.2, 0);
  group.add(label);

  // Kiertorata
  const pts = orbitPath(def.key, jdNow, 360).map((p) => toScene(p, new THREE.Vector3()));
  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x8899bb, transparent: true, opacity: 0.35 })
  );
  scene.add(orbit);

  scene.add(group);
  bodies.push({ def, group, mesh, spinAxis });
}

const sunLabel = makeLabel('Aurinko', 'sun', () => selectBody(sunMesh));
sunLabel.position.set(0, SUN_RADIUS + 3, 0);
sunMesh.add(sunLabel);

// --- Kuu -------------------------------------------------------------------
const earthBody = bodies.find((b) => b.def.key === 'earth');
const earthRadius = scaleRadius(1);
const MOON_DIST = earthRadius * 3.2;
const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(scaleRadius(0.2727), 32, 20),
  new THREE.MeshStandardMaterial({ map: loadTex('2k_moon.jpg'), roughness: 1 })
);
moonMesh.userData = {
  name: 'Kuu', info: MOON_INFO, viewRadius: scaleRadius(0.2727),
  facts: FACTS.moon, factIndex: 0,
};
earthBody.group.add(moonMesh);
pickables.push(moonMesh);

const moonLabel = makeLabel('Kuu', 'moon', () => selectBody(moonMesh));
moonLabel.position.set(0, scaleRadius(0.2727) + 1.4, 0);
moonMesh.add(moonLabel);

{ // Kuun radan viiva Maan ympärille
  const pts = [];
  for (let i = 0; i <= 90; i++) {
    const a = (i / 90) * 2 * Math.PI;
    pts.push(new THREE.Vector3(Math.cos(a) * MOON_DIST, 0, Math.sin(a) * MOON_DIST));
  }
  earthBody.group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x8899bb, transparent: true, opacity: 0.25 })
  ));
}

// --- Ajan hallinta ---------------------------------------------------------
const SPEED_STEPS = [
  { label: '−1 v/s', mult: -31557600 },
  { label: '−30 pv/s', mult: -2592000 },
  { label: '−7 pv/s', mult: -604800 },
  { label: '−1 pv/s', mult: -86400 },
  { label: '−1 h/s', mult: -3600 },
  { label: '1×', mult: 1 },
  { label: '+1 h/s', mult: 3600 },
  { label: '+1 pv/s', mult: 86400 },
  { label: '+7 pv/s', mult: 604800 },
  { label: '+30 pv/s', mult: 2592000 },
  { label: '+1 v/s', mult: 31557600 },
];
let speedIndex = 5;
let simTime = Date.now();
let trackNow = true; // seurataanko todellista kellonaikaa
let timeAnim = null;  // käynnissä oleva kelaus toiseen ajanhetkeen
let paused = false;   // onko ajan kulku pysäytetty

const timebar = document.getElementById('timebar');
const slider = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');
const dateInput = document.getElementById('dateInput');
const clockEl = document.getElementById('clock');

const playBtn = document.getElementById('playBtn');

function updateSpeedLabel() {
  if (timeAnim) speedLabel.textContent = 'Kelataan…';
  else if (paused) speedLabel.textContent = 'Pysäytetty';
  else speedLabel.textContent =
    trackNow && SPEED_STEPS[speedIndex].mult === 1 ? 'Reaaliaika' : SPEED_STEPS[speedIndex].label;

  playBtn.textContent = paused ? '▶' : '⏸';
  const title = paused ? 'Jatka ajan kulkua' : 'Pysäytä ajan kulku';
  playBtn.title = title;
  playBtn.setAttribute('aria-label', title);
}

playBtn.addEventListener('click', () => {
  paused = !paused;
  // Pysäytys lukitsee juuri tämän hetken, joten reaaliajan seuranta katkeaa
  if (paused) trackNow = false;
  updateSpeedLabel();
});

// Kelaa ajan nykyhetkestä kohteeseen pehmeästi kiihtyen ja hidastuen.
// Kesto kasvaa hypyn pituuden mukaan, mutta pysyy 1,8–3,0 sekunnissa.
function reelTo(targetMs, thenTrackNow = false) {
  const days = Math.abs(targetMs - simTime) / 86400000;
  timeAnim = {
    t0: performance.now(),
    dur: Math.min(3000, Math.max(1800, 1600 + days * 12)),
    from: simTime,
    to: targetMs,
    thenTrackNow,
  };
  trackNow = false;
  speedIndex = 5;
  slider.value = 5;
  updateSpeedLabel();
}

slider.addEventListener('input', () => {
  timeAnim = null; // käyttäjän oma säätö keskeyttää kelauksen
  paused = false;  // nopeuden valinta tarkoittaa, että aikaa halutaan liikuttaa
  speedIndex = +slider.value;
  if (SPEED_STEPS[speedIndex].mult !== 1) trackNow = false;
  updateSpeedLabel();
});
document.getElementById('nowBtn').addEventListener('click', () => {
  paused = false;
  reelTo(Date.now(), true);
});
dateInput.addEventListener('change', () => {
  const t = new Date(dateInput.value).getTime();
  if (isNaN(t)) return;
  reelTo(t);
});
updateSpeedLabel();

const dateFmt = new Intl.DateTimeFormat('fi-FI', {
  day: 'numeric', month: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

// --- Tapahtumahypyt --------------------------------------------------------
const eventInfo = document.getElementById('eventInfo');
const eventFmt = new Intl.DateTimeFormat('fi-FI', {
  weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const EVENT_FINDERS = {
  moonphase: findMoonPhaseAny,
  season: findSeason,
  opposition: findOpposition,
};

// Näytetty tapahtuma: { ms } — teksti häipyy, kun ajassa on siirrytty
// tätä kauemmas tapahtuman hetkestä.
let activeEvent = null;
const EVENT_INFO_WINDOW = 12 * 3600 * 1000;

function showEventInfo(text, ms) {
  eventInfo.textContent = text;
  eventInfo.classList.add('visible');
  activeEvent = { ms };
}

function jumpToEvent(kind, dir) {
  // Kesken kelauksen haku alkaa kohdehetkestä, jotta peräkkäiset
  // painallukset etenevät tapahtumasta seuraavaan eivätkä jää paikalleen.
  const originMs = timeAnim ? timeAnim.to : simTime;
  const found = EVENT_FINDERS[kind](jdFromDate(new Date(originMs)), dir);
  if (!found) {
    showEventInfo('Tapahtumaa ei löytynyt hakuväliltä.', simTime);
    return;
  }
  const targetMs = dateFromJd(found.jd).getTime();
  simTime = originMs; // kelaus jatkuu edellisestä kohteesta
  reelTo(targetMs);
  showEventInfo(`${found.name} · ${eventFmt.format(dateFromJd(found.jd))}`, targetMs);
}

for (const btn of document.querySelectorAll('[data-ev]')) {
  btn.addEventListener('click', () => jumpToEvent(btn.dataset.ev, +btn.dataset.dir));
}

// Tapahtumaosion haitari (oletuksena kiinni)
const eventsSection = document.getElementById('eventsSection');
const eventsToggle = document.getElementById('eventsToggle');
eventsToggle.addEventListener('click', () => {
  const open = eventsSection.classList.toggle('open');
  eventsToggle.setAttribute('aria-expanded', String(open));
});

// --- Valinta, tietopaneeli ja kameran kohdistus ----------------------------
const panel = document.getElementById('panel');
const infoPanel = document.getElementById('infoPanel');
const infoBtn = document.getElementById('infoBtn');

// Sivupaneelit ovat samassa kohdassa, joten vain toinen voi olla auki
const sidePanelOpen = () => panel.classList.contains('open') || infoPanel.classList.contains('open');

// Info-nappi piiloon aina kun paneeli peittäisi sen
function syncInfoBtn() {
  infoBtn.classList.toggle('hidden', sidePanelOpen());
  infoBtn.setAttribute('aria-expanded', String(infoPanel.classList.contains('open')));
}

function setInfoOpen(open) {
  infoPanel.classList.toggle('open', open);
  if (open) panel.classList.remove('open');
  syncInfoBtn();
}
infoBtn.addEventListener('click', () => setInfoOpen(!infoPanel.classList.contains('open')));
document.getElementById('infoClose').addEventListener('click', () => setInfoOpen(false));
const overviewBtn = document.getElementById('overviewBtn');
const innerBtn = document.getElementById('innerBtn');
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Yleisnäkymät: kamera samaan suuntaan, etäisyys lasketaan kuvakulmasta.
// fill kertoo, kuinka suuren osan kuvan puolikkaasta leveydestä rata täyttää:
// yli 1 = rata ulottuu reunan yli, alle 1 = mahtuu kokonaan näkyviin.
const VIEW_DIR = new THREE.Vector3(0, 0.4472, 0.8944);
const VIEW_PRESETS = {
  all: { au: 30.1, fill: 1.55 },   // Neptunus reunan tuntumassa, kuten ennen
  inner: { au: 1.52, fill: 0.72 }, // Marsin rata kokonaan kuvassa
};
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0);

function presetPos(preset, out) {
  const p = VIEW_PRESETS[preset];
  const halfFovH = Math.atan(Math.tan((camera.fov / 2) * DEG) * camera.aspect);
  const dist = scaleDist(p.au) / (Math.tan(halfFovH) * p.fill);
  return out.copy(VIEW_DIR).multiplyScalar(dist);
}
// Kuinka suuren osan ruudun korkeudesta kohde täyttää zoomattuna.
// Pienempi arvo = kamera jää kauemmas ja kohteen ympärille jää tilaa.
const FILL = 0.40;
const PANEL_W = 300; // vastaa CSS:n paneelin leveyttä

let focusObj = null;      // seurattava mesh, null = yleisnäkymä
let viewPreset = 'all';   // kumpi yleisnäkymä on valittuna
let camAnim = null;       // { t0, dur, fromPos, fromTarget }
// Käyttäjän panoroima siirtymä kohteesta. Ilman tätä seuranta vetäisi
// katsepisteen joka ruudunpäivityksellä takaisin planeettaan.
const panOffset = new THREE.Vector3();

function distanceFor(radius) {
  return radius / Math.tan(FILL * (camera.fov / 2) * DEG);
}

function startCamAnim(dur = 1100) {
  camAnim = {
    t0: performance.now(), dur,
    fromPos: camera.position.clone(),
    fromTarget: controls.target.clone(),
  };
}

// Painike himmenee, kun sen näkymä on jo valittuna
function updateViewButtons() {
  overviewBtn.disabled = !focusObj && viewPreset === 'all';
  innerBtn.disabled = !focusObj && viewPreset === 'inner';
}

function setFocus(mesh, preset) {
  focusObj = mesh;
  if (!mesh && preset) viewPreset = preset;
  updateViewButtons();
  panOffset.set(0, 0, 0); // uusi kohde keskitetään: klikkaus myös keskittää uudelleen
  startCamAnim();
}

function selectBody(mesh) {
  const d = mesh.userData;
  document.getElementById('panelName').textContent = d.name;

  // Faktoja kierrätetään: joka tutkimiskerralla näytetään seuraava
  document.getElementById('panelDesc').textContent = d.facts[d.factIndex];
  document.getElementById('factCount').textContent = `Fakta ${d.factIndex + 1}/${d.facts.length}`;
  d.factIndex = (d.factIndex + 1) % d.facts.length;

  document.getElementById('panelData').innerHTML = `
    <dt>Säde</dt><dd>${d.info.radius}</dd>
    <dt>${d.info.distLabel || 'Etäisyys Auringosta'}</dt><dd>${d.info.dist}</dd>
    <dt>Kiertoaika</dt><dd>${d.info.period}</dd>
    <dt>Pyörähdysaika</dt><dd>${d.info.day}</dd>
    <dt>Kuita</dt><dd>${d.info.moons}</dd>`;
  setInfoOpen(false); // planeettatiedot korvaavat mallin tiedot
  panel.classList.add('open');
  syncInfoBtn();
  setFocus(mesh);
}

function showPreset(preset) {
  panel.classList.remove('open');
  syncInfoBtn();
  setFocus(null, preset);
}

document.getElementById('panelClose').addEventListener('click', () => {
  // Paneeli pois, mutta kohde säilyy — kuva rajataan uudelleen keskelle
  panel.classList.remove('open');
  syncInfoBtn();
  if (focusObj) startCamAnim(500);
});
overviewBtn.addEventListener('click', () => showPreset('all'));
innerBtn.addEventListener('click', () => showPreset('inner'));
updateViewButtons();
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Esc sulkee ensin auki olevan tietopaneelin, vasta sitten palaa yleisnäkymään
  if (infoPanel.classList.contains('open')) setInfoOpen(false);
  else showPreset('all');
});

// Kuuntelijat samaan elementtiin kuin OrbitControls: se kaappaa osoittimen
// (setPointerCapture) pointerdownissa, jolloin pointerup ohjautuu tähän
// elementtiin eikä canvakseen. Canvakselle kiinnitettynä klikkaus jäisi
// kokonaan havaitsematta.
let downXY = null;
app.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; });
app.addEventListener('pointerup', (e) => {
  if (!downXY) return;
  const moved = Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]);
  downXY = null;
  if (moved > 5) return; // raahaus, ei klikkaus
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickables, false)[0];
  if (hit) selectBody(hit.object);
});

// --- Animaatio -------------------------------------------------------------
const tmp = new THREE.Vector3();
const goalTarget = new THREE.Vector3();
const goalPos = new THREE.Vector3();
const camRight = new THREE.Vector3();
const camUp = new THREE.Vector3();
const camDir = new THREE.Vector3();
let lastReal = performance.now();

const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

// Mihin kameran ja katsepisteen pitäisi asettua juuri nyt.
// Katsepistettä siirretään sivuun ja alas niin, että kohde asettuu
// käyttöliittymäpaneelien väliin jäävän vapaan alueen keskelle.
function computeGoal(useCurrentDistance) {
  if (!focusObj) {
    goalTarget.copy(OVERVIEW_TARGET);
    presetPos(viewPreset, goalPos);
    return;
  }
  focusObj.getWorldPosition(goalTarget);
  const dist = distanceFor(focusObj.userData.viewRadius);

  if (innerWidth > 640) {
    const d = useCurrentDistance ? camera.position.distanceTo(controls.target) : dist;
    const worldPerPx = 2 * Math.tan((camera.fov / 2) * DEG) * d / innerHeight;

    // Vaakasuunta: väistetään oikean laidan tietopaneelia
    if (sidePanelOpen()) {
      camRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
      goalTarget.addScaledVector(camRight, (PANEL_W / 2) * worldPerPx);
    }
    // Pystysuunta: väistetään vasemman alalaidan aikapalkkia
    const barTop = timebar.getBoundingClientRect().top;
    const liftPx = Math.min((innerHeight - barTop) / 2, innerHeight * 0.22);
    camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    goalTarget.addScaledVector(camUp, -liftPx * worldPerPx);
  }

  camDir.copy(camera.position).sub(controls.target);
  if (camDir.lengthSq() < 1e-8) camDir.set(0, 0.4, 1);
  goalPos.copy(goalTarget).addScaledVector(camDir.normalize(), dist);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dtReal = (now - lastReal) / 1000;
  lastReal = now;

  const mult = SPEED_STEPS[speedIndex].mult;
  if (timeAnim) {
    // Kelaus kohdehetkeen: aika kiihtyy ja hidastuu pehmeästi
    const k = Math.min(1, (now - timeAnim.t0) / timeAnim.dur);
    simTime = timeAnim.from + (timeAnim.to - timeAnim.from) * easeInOut(k);
    if (k >= 1) {
      simTime = timeAnim.to;
      trackNow = timeAnim.thenTrackNow;
      timeAnim = null;
      updateSpeedLabel();
    }
  } else if (paused) {
    // aika ei etene
  } else if (trackNow && mult === 1) {
    simTime = Date.now(); // ei kertymävirhettä reaaliajassa
  } else {
    simTime += dtReal * mult * 1000;
  }

  // Tapahtumateksti häivytetään, kun ollaan siirrytty pois sen hetkestä.
  // Kelauksen aikana teksti pysyy näkyvissä, jotta kohde näkyy jo matkalla.
  if (activeEvent) {
    const reelingToIt = timeAnim && timeAnim.to === activeEvent.ms;
    if (!reelingToIt && Math.abs(simTime - activeEvent.ms) > EVENT_INFO_WINDOW) {
      eventInfo.classList.remove('visible');
      activeEvent = null;
    }
  }
  const simDate = new Date(simTime);
  const jd = jdFromDate(simDate);
  clockEl.textContent = dateFmt.format(simDate);

  // Planeettojen sijainnit
  for (const b of bodies) {
    const helio = heliocentric(b.def.key, jd);
    toScene(helio, tmp);
    b.group.position.copy(tmp);
    if (b.def.key === 'earth') {
      // Maan pyörähdysvaihe kalibroidaan todelliseen aurinkoaikaan:
      // aliaurinkopiste on pituuspiirillä 15°·(12 − UTC-tunnit).
      // Tekstuurin keskikohta (u=0,5) on Greenwichin pituuspiiri.
      const lambda = Math.atan2(helio.y, helio.x);
      const hUtc = (((simTime / 3600000) % 24) + 24) % 24;
      const subsolarLon = (12 - hUtc) * 15 * DEG;
      b.mesh.rotation.y = Math.PI + lambda - subsolarLon;
    } else {
      // Muille planeetoille vain oikea pyörähdysnopeus (vaihe mielivaltainen)
      const spin = (simTime / 3600000 / b.def.dayHours) * 2 * Math.PI;
      b.mesh.rotation.y = spin % (2 * Math.PI);
    }
  }
  sunMesh.rotation.y = (simTime / 3600000 / 609.12) * 2 * Math.PI;

  // Kuu: todellinen suunta Maasta katsottuna, etäisyys havainnollistettu
  const m = moonGeocentric(jd);
  const lon = m.lon * DEG, lat = m.lat * DEG;
  moonMesh.position.set(
    Math.cos(lat) * Math.cos(lon) * MOON_DIST,
    Math.sin(lat) * MOON_DIST,
    -Math.cos(lat) * Math.sin(lon) * MOON_DIST
  );
  // Sidottu pyöriminen: sama puoli kohti Maata
  moonMesh.rotation.y = lon + Math.PI;

  // Kamera: siirtymäanimaatio tai kohteen seuranta
  if (camAnim) {
    computeGoal(false);
    const k = easeInOut(Math.min(1, (now - camAnim.t0) / camAnim.dur));
    controls.target.lerpVectors(camAnim.fromTarget, goalTarget, k);
    camera.position.lerpVectors(camAnim.fromPos, goalPos, k);
    controls.enabled = false;
    if (k >= 1) camAnim = null;
  } else {
    controls.enabled = true;
    if (focusObj) {
      // Seurataan kohdetta säilyttäen käyttäjän oma kuvakulma, zoom ja panorointi
      computeGoal(true);
      goalTarget.add(panOffset);
      tmp.copy(goalTarget).sub(controls.target);
      camera.position.add(tmp);
      controls.target.copy(goalTarget);
    }
  }

  // Auringon hehku himmenee lähietäisyydellä, ettei se peitä pintaa
  const sunDist = camera.position.distanceTo(sunMesh.position);
  sunGlow.material.opacity = THREE.MathUtils.clamp((sunDist - SUN_RADIUS * 2) / 100, 0.06, 0.55);

  controls.update();

  // update() on juuri toteuttanut mahdollisen panoroinnin siirtämällä
  // katsepistettä. Otetaan siirtymä talteen, jotta seuranta ei kumoa sitä.
  if (focusObj && !camAnim) panOffset.add(tmp.copy(controls.target).sub(goalTarget));
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});

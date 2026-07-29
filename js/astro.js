// Planeettojen sijaintien laskenta.
// Perustuu JPL:n "Approximate Positions of the Planets" -rataelementteihin
// (Taulukko 1, voimassa 1800–2050 jKr). Tulokset heliosentrisinä
// ekliptikakoordinaatteina (J2000), yksikkönä AU.

const DEG = Math.PI / 180;

// [a (AU), e, I (°), L (°), varpi (°), Omega (°)] ja muutosnopeudet /vuosisata
const ELEMENTS = {
  mercury: {
    base: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
    rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  },
  venus: {
    base: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
    rate: [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  },
  earth: {
    base: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
    rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  },
  mars: {
    base: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  },
  jupiter: {
    base: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  },
  saturn: {
    base: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate: [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  },
  uranus: {
    base: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
    rate: [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
  },
  neptune: {
    base: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
    rate: [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
  },
};

export function jdFromDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function dateFromJd(jd) {
  return new Date((jd - 2440587.5) * 86400000);
}

function solveKepler(M, e) {
  // M radiaaneina; Newtonin iteraatio
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

function orbitalToEcliptic(xp, yp, omega, I, Omega) {
  const cw = Math.cos(omega), sw = Math.sin(omega);
  const cO = Math.cos(Omega), sO = Math.sin(Omega);
  const ci = Math.cos(I), si = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    y: (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    z: (sw * si) * xp + (cw * si) * yp,
  };
}

function elementsAt(name, jd) {
  const T = (jd - 2451545.0) / 36525;
  const el = ELEMENTS[name];
  const [a, e, I, L, varpi, Omega] = el.base.map((v, i) => v + el.rate[i] * T);
  return { a, e, I: I * DEG, L, varpi, Omega: Omega * DEG, omega: (varpi - Omega + 360) * DEG };
}

// Heliosentrinen sijainti (AU, ekliptika J2000)
export function heliocentric(name, jd) {
  const el = elementsAt(name, jd);
  let M = ((el.L - el.varpi) % 360) * DEG;
  const E = solveKepler(M, el.e);
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  return orbitalToEcliptic(xp, yp, el.omega, el.I, el.Omega);
}

// Koko kiertorata pisteinä (suljettu ellipsi hetken jd elementeillä)
export function orbitPath(name, jd, segments = 256) {
  const el = elementsAt(name, jd);
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * 2 * Math.PI;
    const xp = el.a * (Math.cos(E) - el.e);
    const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    pts.push(orbitalToEcliptic(xp, yp, el.omega, el.I, el.Omega));
  }
  return pts;
}

// Kuun geosentrinen ekliptikaalinen pituus/leveys (asteina).
// Paul Schlyterin yksinkertaistettu teoria tärkeimmillä häiriötermeillä
// (tarkkuus n. 0,5°, riittää visualisointiin).
export function moonGeocentric(jd) {
  const d = jd - 2451543.5;

  const N = (125.1228 - 0.0529538083 * d) * DEG; // nousevan solmun pituus
  const i = 5.1454 * DEG;                        // inklinaatio
  const w = (318.0634 + 0.1643573223 * d) * DEG; // perigeumin argumentti
  const e = 0.054900;
  const M = ((115.3654 + 13.0649929509 * d) % 360) * DEG;

  const E = solveKepler(M, e);
  const xp = Math.cos(E) - e;
  const yp = Math.sqrt(1 - e * e) * Math.sin(E);

  const v = Math.atan2(yp, xp); // todellinen anomalia
  const r = Math.sqrt(xp * xp + yp * yp); // etäisyys (Maan säteinä, a=1)

  // Ekliptikakoordinaatit
  const xe = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const ye = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  const ze = r * Math.sin(v + w) * Math.sin(i);

  let lon = Math.atan2(ye, xe) / DEG;
  let lat = Math.atan2(ze, Math.sqrt(xe * xe + ye * ye)) / DEG;

  // Auringon keskianomalia ja pituus häiriötermejä varten
  const Ms = ((356.0470 + 0.9856002585 * d) % 360) * DEG;
  const ws = (282.9404 + 4.70935e-5 * d) * DEG;
  const Ls = Ms + ws;              // Auringon keskipituus
  const Lm = M + w + N;            // Kuun keskipituus
  const D = Lm - Ls;               // keskielongaatio
  const F = Lm - N;                // leveysargumentti

  // Suurimmat häiriötermit (asteina)
  lon += -1.274 * Math.sin(M - 2 * D)      // evektio
       + 0.658 * Math.sin(2 * D)           // variaatio
       - 0.186 * Math.sin(Ms)              // vuotuinen epätasaisuus
       - 0.059 * Math.sin(2 * M - 2 * D)
       - 0.057 * Math.sin(M - 2 * D + Ms)
       + 0.053 * Math.sin(M + 2 * D)
       + 0.046 * Math.sin(2 * D - Ms)
       + 0.041 * Math.sin(M - Ms)
       - 0.035 * Math.sin(D)
       - 0.031 * Math.sin(M + Ms);
  lat += -0.173 * Math.sin(F - 2 * D)
       - 0.055 * Math.sin(M - F - 2 * D)
       - 0.046 * Math.sin(M + F - 2 * D)
       + 0.033 * Math.sin(F + 2 * D);

  return { lon: ((lon % 360) + 360) % 360, lat, rEarthRadii: r * 60.2666 };
}

// ---------------------------------------------------------------------------
// Tapahtumahaku: milloin jokin kulma saavuttaa tietyn arvon
// ---------------------------------------------------------------------------

// Auringon näennäinen (geosentrinen) ekliptikaalinen pituus asteina
export function sunGeocentricLon(jd) {
  const e = heliocentric('earth', jd);
  return ((Math.atan2(e.y, e.x) / DEG + 180) % 360 + 360) % 360;
}

// Planeetan geosentrinen ekliptikaalinen pituus asteina
export function planetGeocentricLon(name, jd) {
  const p = heliocentric(name, jd);
  const e = heliocentric('earth', jd);
  return ((Math.atan2(p.y - e.y, p.x - e.x) / DEG) % 360 + 360) % 360;
}

// Auringon näennäinen pituus hetken oman kevätpäiväntasauspisteen suhteen.
// Rataelementit ovat J2000-epookissa, joten mukaan tarvitaan prekessio
// (yleinen prekessio pituudessa) ja valon aberraatio. Ilman näitä
// päiväntasaukset osuisivat n. 9 tuntia myöhään 2020-luvulla.
export function sunApparentLon(jd) {
  const T = (jd - 2451545.0) / 36525;
  const precession = 1.3969713 * T + 0.0003086 * T * T;
  const aberration = -0.005691;
  return ((sunGeocentricLon(jd) + precession + aberration) % 360 + 360) % 360;
}

// Kulmaero välillä (−180, 180]
function angDiff(a, b) {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

// Etsii hetken, jolloin fn(jd) saavuttaa arvon target. Kulkee ajassa
// suuntaan dir (+1 eteen, −1 taakse), askeltaa karkeasti ja tarkentaa
// puolitushaulla. Palauttaa juliaanisen päivän tai null.
function findEvent(fn, target, startJd, dir, stepDays, maxDays) {
  const sign = dir < 0 ? -1 : 1;
  const step = Math.abs(stepDays) * sign;
  let t0 = startJd + sign * 0.02; // ohitetaan hetki, jossa jo ollaan
  let g0 = angDiff(fn(t0), target);

  const steps = Math.ceil(Math.abs(maxDays) / Math.abs(stepDays));
  for (let i = 0; i < steps; i++) {
    const t1 = t0 + step;
    const g1 = angDiff(fn(t1), target);
    // Merkin vaihtuminen lähellä nollaa = ohitettiin tavoitekulma.
    // |g| < 90 sulkee pois ±180 kohdalla tapahtuvan kierähdyksen.
    if (Math.abs(g0) < 90 && Math.abs(g1) < 90 && (g0 < 0) !== (g1 < 0)) {
      let a = t0, b = t1, ga = g0;
      for (let k = 0; k < 50; k++) {
        const m = (a + b) / 2;
        const gm = angDiff(fn(m), target);
        if ((gm < 0) === (ga < 0)) { a = m; ga = gm; } else { b = m; }
      }
      return (a + b) / 2;
    }
    t0 = t1;
    g0 = g1;
  }
  return null;
}

const moonElongation = (jd) => moonGeocentric(jd).lon - sunGeocentricLon(jd);

// phase: 0 = uusikuu, 180 = täysikuu
export function findMoonPhase(jd, dir, phase) {
  const t = findEvent(moonElongation, phase, jd, dir, 1, 45);
  return t === null ? null : { jd: t, name: phase === 0 ? 'Uusikuu' : 'Täysikuu' };
}

// Lähin täysikuu tai uusikuu haettuun suuntaan (kumpi tulee ensin)
export function findMoonPhaseAny(jd, dir) {
  let best = null;
  for (const phase of [0, 180]) {
    const r = findMoonPhase(jd, dir, phase);
    if (r && (!best || Math.abs(r.jd - jd) < Math.abs(best.jd - jd))) best = r;
  }
  return best;
}

const SEASON_NAMES = [
  'Kevätpäiväntasaus', 'Kesäpäivänseisaus', 'Syyspäiväntasaus', 'Talvipäivänseisaus',
];

// Lähin päiväntasaus tai -seisaus haettuun suuntaan
export function findSeason(jd, dir) {
  let best = null;
  for (let i = 0; i < 4; i++) {
    const t = findEvent(sunApparentLon, i * 90, jd, dir, 2, 400);
    if (t === null) continue;
    if (!best || Math.abs(t - jd) < Math.abs(best.jd - jd)) {
      best = { jd: t, name: SEASON_NAMES[i] };
    }
  }
  return best;
}

const OPPOSITION_PLANETS = [['mars', 'Mars'], ['jupiter', 'Jupiter'], ['saturn', 'Saturnus']];

// Lähin ulkoplaneetan oppositio (planeetta vastakkain Auringon kanssa)
export function findOpposition(jd, dir) {
  let best = null;
  for (const [key, label] of OPPOSITION_PLANETS) {
    const t = findEvent((x) => planetGeocentricLon(key, x) - sunGeocentricLon(x), 180, jd, dir, 4, 1000);
    if (t === null) continue;
    if (!best || Math.abs(t - jd) < Math.abs(best.jd - jd)) {
      best = { jd: t, name: label + ' oppositiossa', body: key };
    }
  }
  return best;
}

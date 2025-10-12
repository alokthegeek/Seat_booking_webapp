import { pricingRules as R } from './pricingRules.js';

export function zoneFor(label) {
  // Horizontal bands by ROW letter: A–B FRONT, C–E STANDARD, F PREMIUM, G–H RECLINER
  const ch = String(label || '').charAt(0).toUpperCase();
  const row = ch ? (ch.charCodeAt(0) - 65) : 0; // A=0
  if (row <= 1) return 'FRONT';
  if (row <= 4) return 'STANDARD';
  if (row <= 5) return 'PREMIUM';
  return 'RECLINER';
}

export function computePrice({ movie, seatLabels, occupiedCount, totalSeats, when = new Date() }) {
  const labels = Array.isArray(seatLabels) ? seatLabels : [];
  const base = R.base[movie] ?? 5;
  let mult = 1;

  // time
  for (const r of R.time) if (r.when(when)) mult *= r.factor;

  // demand band
  const ratio = (occupiedCount + labels.length) / Math.max(1, totalSeats || 1);
  const band = R.demandBands.find(b => ratio >= b.ge);
  if (band) mult *= band.factor;

  // zone multiplier (geometric mean)
  const zMult = labels.length
    ? Math.pow(labels
        .map(l => R.zones[zoneFor(l)] ?? 1)
        .reduce((a,b)=>a*b, 1), 1 / labels.length)
    : 1;
  mult *= zMult;

  const unclampedPerSeat = +(base * mult).toFixed(2);
  const perSeat = Math.min(R.cap.max, Math.max(R.cap.min, unclampedPerSeat));
  const total = +(perSeat * labels.length).toFixed(2);

  return { perSeat, total, breakdown: { base, ratio, zMult } };
}

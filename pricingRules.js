export const pricingRules = {
  base: { Flash: 7, Spiderman: 5, Batman: 4 },

  // Horizontal bands by row; recliners = back rows
  zones: { FRONT: 0.9, STANDARD: 1.0, PREMIUM: 1.2, RECLINER: 1.5 },

  // Time-of-day / weekday rules
  time: [
    { label: "Weekend", when: d => [0,6].includes(d.getDay()), factor: 1.10 },
    { label: "PrimeTime", when: d => d.getHours() >= 18 && d.getHours() <= 22, factor: 1.08 },
  ],

  // Demand bands by occupancy ratio (occupied + currently selected)
  demandBands: [
    { ge: 0.70, factor: 1.10, label: "High demand" },
    { ge: 0.50, factor: 1.05, label: "Medium demand" }
  ],

  // Safety rails
  cap: { min: 3, max: 25 }
};

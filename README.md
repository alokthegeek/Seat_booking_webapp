# Seat_booking_webapp

Interactive movie seat selection built with HTML/CSS/JS (no framework).

Live: https://seat-booking-webapp.vercel.app/
Code: https://github.com/alokthegeek/Seat_booking_webapp

Features
	•	Seat grid with Available / Selected / Occupied states
	•	Movie selector → price updates
	•	Live seat count and total
	•	Proceed (marks seats occupied) & Cancel (clears)

Stack

HTML, CSS, Vanilla JS • Deployed on Vercel

How It Works
	•	DOM-driven seat map; click toggles selected
	•	Summary recalculates from a single selected-seats array
	•	Proceed → convert selected → occupied

Next Up (roadmap)
	•	Seat labels (A1…), localStorage restore
	•	No single-seat gap rule
	•	Dynamic pricing by occupancy
	•	Shareable URL state + copy link
	•	a11y (focus/ARIA) & small Jest tests

## Dynamic Pricing Engine
Pricing now flows through a rule-driven engine that combines movie base fares, seat-zone multipliers, time-of-day or weekday factors, and demand bands without touching the DOM. The module performs pure computation so UI layers simply feed it context and render the results. Whenever seats, movie selection, or showtime change, the interface recomputes instantly using the same rules.

```js
import { computePrice } from './pricingEngine.js';

const quote = computePrice({ movie, seatLabels, occupiedCount, totalSeats, when });
```

- Caps enforce a $3–$25 window no matter the inputs.
- Fallback logic restores the previous flat pricing if the module cannot be loaded.
- LocalStorage persistence for seats and occupied states remains unchanged.

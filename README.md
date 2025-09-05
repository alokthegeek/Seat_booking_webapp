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

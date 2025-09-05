//Create you project here from scratch
const moviesList = [
    { movieName: "Flash", price: 7 },
    { movieName: "Spiderman", price: 5 },
    { movieName: "Batman", price: 4 },
];
// Use moviesList array for displaing the Name in the dropdown menu
const dropDown = document.querySelector("#selectMovie");
let p = 7;
for (let i = 0; i < moviesList.length; i++) {
    const movie = moviesList[i];
    const opt = document.createElement("option");
    opt.textContent = movie.movieName + ` $` + movie.price;
    // store raw values so parsing isn't weird
    opt.dataset.name = movie.movieName;
    opt.dataset.price = movie.price;
    dropDown.add(opt);
}

// one listener (not per option)
dropDown.addEventListener("change", (event) => {
    const sel = event.target.selectedOptions[0]; // the chosen <option>
    const movName = document.querySelector("#movieName");
    const movPrice = document.querySelector("#moviePrice");
    const totalPEl = document.querySelector("#totalPrice");

    // update movie name/price
    movName.textContent = sel.dataset.name || "Flash";
    movPrice.textContent = "$" + (sel.dataset.price || 7);

    // keep current seat total consistent with new price
    p = Number(sel.dataset.price || 7);
    totalPEl.textContent = '$' + (p * arraySeats.length);

    // persist movie selection
    try {
        localStorage.setItem('selectedMovieIndex', String(dropDown.selectedIndex));
    } catch (_) { }
});

//default case
{
    const movName = document.querySelector("#movieName");
    movName.textContent = "Flash";
    const movPrice = document.querySelector("#moviePrice");
    movPrice.textContent = "$7";
    const totalP = document.querySelector("#totalPrice");
    totalP.textContent = "$0";
}

// for the seats:
// First, assign seat labels like A1, A2... per row
const rows = document.querySelectorAll('#seatCont .row');
rows.forEach((row, rIndex) => {
    const letter = String.fromCharCode('A'.charCodeAt(0) + rIndex);
    const seatsInRow = row.querySelectorAll('.seat');
    seatsInRow.forEach((s, i) => {
        const label = `${letter}${i + 1}`;
        s.dataset.label = label;
        s.setAttribute('aria-label', `${label} seat`);
        s.setAttribute('role', 'button');
    });
});

//Add eventLister to each unoccupied seat
const seat = document.querySelectorAll("#seatCont .seat");
// const occupied = document.querySelectorAll(".seat.occupied"); // not used

const holder = document.querySelector("#selectedSeatsHolder");
const numSeats = document.querySelector("#numberOfSeat");

const countSeat = 0;
let arraySeats = []; // array of selected seat labels
const totalP = document.querySelector("#totalPrice");

// Helper: refresh focusability and aria-disabled based on occupancy
function refreshSeatA11y() {
    seat.forEach(s => {
        if (s.classList.contains('occupied')) {
            s.setAttribute('aria-disabled', 'true');
            s.tabIndex = -1;
        } else {
            s.setAttribute('aria-disabled', 'false');
            s.tabIndex = 0;
        }
    });
}
// Make seats focusable immediately
refreshSeatA11y();

// Restore persisted selections and movie
(function restoreState() {
    // Apply occupied seats from storage
    try {
        const occupied = JSON.parse(localStorage.getItem('occupiedSeats') || '[]');
        if (Array.isArray(occupied) && occupied.length) {
            seat.forEach(s => {
                if (occupied.includes(s.dataset.label)) {
                    s.classList.add('occupied');
                }
            });
        }
    } catch (_) { }
    try {
        const savedMovieIndex = localStorage.getItem('selectedMovieIndex');
        if (savedMovieIndex !== null && dropDown.options[Number(savedMovieIndex)]) {
            dropDown.selectedIndex = Number(savedMovieIndex);
        }
    } catch (_) { }

    // Set movie name/price and p based on current dropdown selection
    const sel = dropDown.selectedOptions[0];
    const movName = document.querySelector("#movieName");
    const movPrice = document.querySelector("#moviePrice");
    p = Number(sel?.dataset?.price || 7);
    movName.textContent = sel?.dataset?.name || "Flash";
    movPrice.textContent = "$" + p;

    // Restore selected seats
    try {
        const stored = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
        if (Array.isArray(stored) && stored.length) {
            const fragment = document.createDocumentFragment();
            seat.forEach(s => {
                const lbl = s.dataset.label;
                if (lbl && stored.includes(lbl) && !s.classList.contains('occupied')) {
                    s.classList.add('selected');
                    const el = document.createElement('div');
                    el.className = 'selectedSeat';
                    el.dataset.seatLabel = lbl;
                    el.textContent = lbl;
                    fragment.appendChild(el);
                }
            });
            if (fragment.childNodes.length) {
                holder.appendChild(fragment);
                const noSel = holder.querySelector('.noSelected');
                if (noSel) noSel.remove();
            }
            arraySeats = stored.filter(Boolean).filter(lbl => {
                // drop any that became occupied since last time
                const el = document.querySelector(`#seatCont .seat[data-label="${lbl}"]`);
                return el && !el.classList.contains('occupied');
            });
            numSeats.textContent = arraySeats.length;
            totalP.textContent = '$' + (p * arraySeats.length);
        }
    } catch (_) { }
    refreshSeatA11y();
})();

// Proceed button enable/disable based on selection
const proceedBtn = document.querySelector("#proceedBtn");
function updateProceedState() {
    if (proceedBtn) {
        const count = arraySeats.length;
        proceedBtn.disabled = count === 0;
        const base = 'Continue';
        proceedBtn.textContent = count ? `${base} (${count})` : base;
    }
}
// set initial state (after possible restore)
updateProceedState();

// Theme toggle: persist and override system preference
(function initThemeToggle() {
    const toggle = document.querySelector('#themeToggle');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            if (toggle) toggle.checked = true;
        } else {
            // treat anything else as light
            document.body.setAttribute('data-theme', 'light');
            if (toggle) toggle.checked = false;
        }
    }

    // Apply saved choice or default to light
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
            applyTheme(saved);
        } else {
            applyTheme('light');
        }
    } catch (_) { applyTheme('light'); }

    if (toggle) {
        toggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            applyTheme(theme);
            try { localStorage.setItem('theme', theme); } catch (_) { }
        });
    }
})();

for (let i = 0; i < seat.length; i++) {
    seat[i].addEventListener("click", (event) => {
        if (!(event.target.classList.contains("selected"))) {
            if (!(event.target.classList.contains("occupied"))) {
                const label = event.target.dataset.label || "SEAT";
                const seatToAdd = document.createElement("div");
                seatToAdd.textContent = label;
                seatToAdd.className = "selectedSeat";
                seatToAdd.dataset.seatLabel = label;

                event.target.classList.add("selected");
                arraySeats.push(label);
                numSeats.textContent = arraySeats.length;
                totalP.textContent = '$' + (p * arraySeats.length);

                holder.append(seatToAdd);
                const noSel = holder.querySelector('.noSelected');
                if (noSel) noSel.remove();

                // persist selection
                try { localStorage.setItem('selectedSeats', JSON.stringify(arraySeats)); } catch (_) { }
                updateProceedState();
            }
        } else {
            event.target.classList.remove('selected');
            const lbl = event.target.dataset.label;
            arraySeats = arraySeats.filter(l => l !== lbl);
            numSeats.textContent = arraySeats.length;

            const label = event.target.dataset.label;
            if (label) {
                const toRemove = holder.querySelector(`.selectedSeat[data-seat-label="${label}"]`);
                if (toRemove) toRemove.remove();
            }
            if (arraySeats.length == 0) {
                const msg = document.createElement('span');
                msg.className = 'noSelected';
                msg.textContent = 'No Seat Selected';
                holder.append(msg);
            }
            totalP.textContent = '$' + (p * arraySeats.length);

            // persist selection
            try { localStorage.setItem('selectedSeats', JSON.stringify(arraySeats)); } catch (_) { }
            updateProceedState();
        }
    });

    // Keyboard support: Enter/Space toggles seat like click
    seat[i].addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
            e.preventDefault();
            seat[i].click();
        }
    });
}

// Set current date in the UI
(function setCurrentDate() {
    const dateEl = document.querySelector('.date');
    if (!dateEl) return;
    const d = new Date();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = String(d.getDate());
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    dateEl.textContent = `${day} ${month}, ${year}`;
})();

//Add eventLsiter to continue Button
const contBtn = document.querySelector("#proceedBtn");
contBtn.addEventListener("click", (event) => {
    const numOfSeats = document.querySelector("#numberOfSeat").innerHTML;
    if (numOfSeats == '0') {
        alert("Oops no seat Selected");
        return;
    }

    // snapshot booking details before mutating UI
    const bookedSeats = [...arraySeats];
    const sel = dropDown.selectedOptions[0];
    const bookedMovie = sel?.dataset?.name || 'Flash';
    const bookedPrice = p * bookedSeats.length;

    // mark all selected seats in the seat area as occupied (ignore legend icons)
    const selSeatsAll = document.querySelectorAll("#seatCont .seat.selected");
    selSeatsAll.forEach(s => {
        s.classList.add("occupied");
        s.classList.remove("selected");
    });
    refreshSeatA11y();

    // reset totals and UI
    arraySeats.length = 0;
    numSeats.textContent = 0;
    const price = document.querySelector("#totalPrice");
    price.textContent = "$0";
    holder.innerHTML = '<span class="noSelected">No Seat Selected</span>';

    // clear persisted selection since it's now booked
    try { localStorage.setItem('selectedSeats', '[]'); } catch (_) { }
    // persist occupied seats
    try {
        const prev = JSON.parse(localStorage.getItem('occupiedSeats') || '[]');
        const next = Array.from(new Set([...(Array.isArray(prev) ? prev : []), ...bookedSeats]));
        localStorage.setItem('occupiedSeats', JSON.stringify(next));
    } catch (_) { }
    updateProceedState();

    // Build and show success modal (uses existing CSS)
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = 'successModal';

    const top = document.createElement('div');
    top.className = 'modalTop';
    // simple check mark SVG
    top.innerHTML = '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="lightgreen"/><path d="M7 12.5l3 3 7-7" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const center = document.createElement('div');
    center.className = 'modalCenter';
    const h1 = document.createElement('h1');
    h1.textContent = 'Booking Confirmed';
    const pEl = document.createElement('p');
    const seatsText = bookedSeats.length ? bookedSeats.join(', ') : '—';
    pEl.textContent = `Movie: ${bookedMovie} • Seats: ${seatsText} • Total: $${bookedPrice}`;
    center.append(h1, pEl);

    const bottom = document.createElement('div');
    bottom.className = 'modalBottom';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Done';
    bottom.append(closeBtn);

    modal.append(top, center, bottom);

    // attach and activate
    document.body.append(overlay, modal);
    document.body.classList.add('modal-active');

    function closeModal() {
        modal.remove();
        overlay.remove();
        document.body.classList.remove('modal-active');
    }

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Close on Escape
    function onEsc(ev) { if (ev.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onEsc); } }
    document.addEventListener('keydown', onEsc);
});

//Add eventListerner to Cancel Button
const cancelBtn = document.querySelector("#cancelBtn");
cancelBtn.addEventListener("click", (event) => {
    // Only clear selected seats inside the seat container; keep legend icons intact
    const selSeatsAll = document.querySelectorAll("#seatCont .seat.selected");
    selSeatsAll.forEach(s => s.classList.remove("selected"));

    arraySeats.length = 0;
    numSeats.textContent = 0;

    const price = document.querySelector("#totalPrice");
    price.textContent = "$0";

    holder.innerHTML = '<span class="noSelected">No Seat Selected</span>';
    // (leaving movie selection as-is on cancel, your default block already set initial)

    // clear persisted selection on cancel
    try { localStorage.setItem('selectedSeats', '[]'); } catch (_) { }
    updateProceedState();
    refreshSeatA11y();
});

// Click on a selected seat chip to deselect that seat
holder.addEventListener('click', (e) => {
    const chip = e.target.closest('.selectedSeat');
    if (!chip) return;
    const label = chip.dataset.seatLabel;
    const seatEl = document.querySelector(`#seatCont .seat[data-label="${label}"]`);
    if (seatEl && seatEl.classList.contains('selected')) {
        seatEl.click();
    }
});

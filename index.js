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
    if (totalPEl) {
        totalPEl.textContent = '$' + (p * arraySeats.length);
    }

    // persist movie selection
    try {
        localStorage.setItem('selectedMovieIndex', String(dropDown.selectedIndex));
    } catch (_) { }
    updateTotalsAndSummary();
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

// Ensure seats carry labels and rows get zone classes
applyRowZonesAndLabels();

//Add eventLister to each unoccupied seat
const seat = document.querySelectorAll("#seatCont .seat");
// const occupied = document.querySelectorAll(".seat.occupied"); // not used

const holder = document.querySelector("#selectedSeatsHolder");
const numSeats = document.querySelector("#numberOfSeat");

const countSeat = 0;
let arraySeats = []; // array of selected seat labels
const totalP = document.querySelector("#totalPrice");
const showtimeInput = document.querySelector("#showtime");
const hasPricing = !!(window.pricing && typeof window.pricing.computePrice === 'function');

// Determine zone from first seat's row letter (A..H). Falls back to pricing.zoneFor.
function zoneForLabel(lbl) {
    return __rowZoneForLabel(lbl);
}

// Apply zones per row (horizontal bands) and ensure seats are labeled.
function applyRowZonesAndLabels() {
    try { forceRowBasedLabelsAndZones(); } catch (_) { }
    try {
        const hooks = window.__applyRowZonesHookList;
        if (Array.isArray(hooks)) {
            hooks.forEach(fn => {
                if (typeof fn === 'function' && fn !== forceRowBasedLabelsAndZones) fn();
            });
        }
    } catch (_) { }
}

// --- De-dupe & sync helpers (central source of truth = DOM .seat.selected) ---
function syncArrayFromDOM() {
    const labels = [...document.querySelectorAll('#seatCont .seat.selected')]
        .map(s => s.dataset.label).filter(Boolean);
    arraySeats = Array.from(new Set(labels));
    try { localStorage.setItem('selectedSeats', JSON.stringify(arraySeats)); } catch (_) { }
    if (numSeats) numSeats.textContent = arraySeats.length;
    try { window.arraySeats = arraySeats.slice(); } catch (_) { }
}
function renderSelectedChips() {
    if (!holder) return;
    holder.innerHTML = '';
    if (!arraySeats.length) {
        const span = document.createElement('span');
        span.className = 'noSelected';
        span.textContent = 'No Seat Selected';
        holder.appendChild(span);
        return;
    }
    const frag = document.createDocumentFragment();
    arraySeats.forEach(lbl => {
        const chip = document.createElement('div');
        chip.className = 'selectedSeat';
        chip.dataset.seatLabel = lbl;
        chip.textContent = lbl;
        const close = document.createElement('span');
        close.className = 'closeBtn';
        close.textContent = '×';
        chip.appendChild(close);
        frag.appendChild(chip);
    });
    holder.appendChild(frag);
}
function updateTotalsAndSummary() {
    let handled = false;
    try {
        if (typeof recalcDynamicPricing === 'function') {
            recalcDynamicPricing();
            handled = true;
        }
    } catch (_) { handled = false; }
    if (!handled && totalP) {
        const base = Number.isFinite(Number(p)) ? Number(p) : 0;
        totalP.textContent = '$' + (base * arraySeats.length).toFixed(2);
    }
    try { if (typeof syncSummaryUI === 'function') syncSummaryUI(); } catch (_) { }
    try { if (typeof window.__clarifyLivePricingUpdate === 'function') window.__clarifyLivePricingUpdate(); } catch (_) { }
}

// ---- Summary sync (reads existing DOM; no renames required)
function fmtCurrency(n) {
    const x = Number(n ?? 0);
    return (isNaN(x) ? '$0.00' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(x));
}
function getSeatCount() {
    // Prefer live DOM; fallback to arraySeats if present
    const live = document.querySelectorAll('#seatCont .seat.selected').length;
    if (live) return live;
    try { if (Array.isArray(arraySeats)) return arraySeats.length; } catch (_) { }
    return 0;
}
function syncSummaryUI() {
    const sumTickets = document.getElementById('sumTickets');
    const sumPerSeat = document.getElementById('sumPerSeat');
    const sumTotal = document.getElementById('sumTotal');
    const breakdown = document.getElementById('priceBreakdown');
    if (!sumTickets || !sumPerSeat || !sumTotal) return; // summary not present

    const count = getSeatCount();
    // Read per-seat from #moviePrice; fallback to p variable or derive from total
    const mpEl = document.querySelector('#moviePrice');
    let per = 0;
    if (mpEl && mpEl.textContent) {
        per = parseFloat(mpEl.textContent.replace(/[^0-9.]/g, ''));
    } else if (typeof p === 'number') {
        per = p;
    }
    // Total from #totalPrice; fallback compute
    const tEl = document.querySelector('#totalPrice');
    let tot = 0;
    if (tEl && tEl.textContent) {
        tot = parseFloat(tEl.textContent.replace(/[^0-9.]/g, ''));
    } else {
        tot = +(per * count).toFixed(2);
    }
    // Movie label
    const sel = document.querySelector('#selectMovie');
    const mov = sel?.selectedOptions?.[0]?.dataset?.name || document.querySelector('#movieName')?.textContent || '';

    sumTickets.textContent = String(count);
    sumPerSeat.textContent = fmtCurrency(per || 0);
    sumTotal.textContent = fmtCurrency(tot || 0);
    if (breakdown) {
        breakdown.textContent = count
            ? `${count} × ${fmtCurrency(per || 0)}${mov ? ` (${mov})` : ''}`
            : 'Select seats to see total';
    }
    // Label pluralization
    const lbl = document.getElementById('sumLabelTickets');
    if (lbl) lbl.textContent = count === 1 ? 'Ticket' : 'Tickets';
}

// Initial sync after DOM is ready
document.addEventListener('DOMContentLoaded', syncSummaryUI);
document.addEventListener('DOMContentLoaded', applyRowZonesAndLabels);

// Re-sync on common interactions (no-op if elements missing)
const seatCont = document.querySelector('#seatCont');
if (seatCont) seatCont.addEventListener('click', () => setTimeout(syncSummaryUI, 0));
const dd = document.querySelector('#selectMovie');
if (dd) dd.addEventListener('change', () => setTimeout(syncSummaryUI, 0));
const showtime = document.querySelector('#showtime');
if (showtime) showtime.addEventListener('change', syncSummaryUI);

// Also observe #totalPrice for any text mutations (covers your existing flows)
(function observeTotals() {
    const target = document.querySelector('#totalPrice');
    if (!target || !('MutationObserver' in window)) return;
    const mo = new MutationObserver(() => syncSummaryUI());
    mo.observe(target, { childList: true, characterData: true, subtree: true });
})();

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

function recalcDynamicPricing() {
    const moviePriceEl = document.querySelector("#moviePrice");
    if (!dropDown || !moviePriceEl || !totalP) return;

    const movNameEl = document.querySelector("#movieName");
    const sel = dropDown.selectedOptions[0];
    const movieName = sel?.dataset?.name || movNameEl?.textContent?.trim() || "Flash";
    const baseFromDataset = Number(sel?.dataset?.price);
    const fallbackBase = Number.isFinite(baseFromDataset) ? baseFromDataset : (Number.isFinite(p) ? p : 7);

    const seatNodes = document.querySelectorAll('#seatCont .seat');
    const occupiedCount = document.querySelectorAll('#seatCont .seat.occupied').length;
    const totalSeats = seatNodes.length || 1;
    const count = arraySeats.length;

    let when = new Date();
    if (showtimeInput?.value) {
        const parsed = new Date(showtimeInput.value);
        if (!Number.isNaN(parsed.getTime())) {
            when = parsed;
        }
    }

    let perSeat = fallbackBase;
    let total = fallbackBase * count;

    const pricingApi =
        (hasPricing && window.pricing) ||
        (window.pricing && typeof window.pricing.computePrice === 'function' ? window.pricing : null);

    if (pricingApi) {
        try {
            const result = pricingApi.computePrice({
                movie: movieName,
                seatLabels: arraySeats,
                occupiedCount,
                totalSeats,
                when
            });
            if (result && typeof result.perSeat === 'number' && Number.isFinite(result.perSeat)) {
                perSeat = result.perSeat;
            }
            if (result && typeof result.total === 'number' && Number.isFinite(result.total)) {
                total = result.total;
            } else {
                total = perSeat * count;
            }
        } catch (_) {
            perSeat = fallbackBase;
            total = fallbackBase * count;
        }
    }

    if (pricingApi?.rules?.cap) {
        const cap = pricingApi.rules.cap;
        if (typeof cap.min === 'number') perSeat = Math.max(cap.min, perSeat);
        if (typeof cap.max === 'number') perSeat = Math.min(cap.max, perSeat);
        total = perSeat * count;
    }

    const perSeatFixed = Number(perSeat || 0).toFixed(2);
    const totalFixed = Number(total || 0).toFixed(2);

    moviePriceEl.textContent = "$" + perSeatFixed;
    totalP.textContent = "$" + totalFixed;

    const breakdownEl = document.querySelector("#priceBreakdown");
    if (breakdownEl) {
        breakdownEl.textContent = `${count} × $${perSeatFixed} (${movieName})`;
    }

    p = Number(perSeatFixed);
}

if (showtimeInput) {
    showtimeInput.addEventListener('change', recalcDynamicPricing);
}
window.addEventListener('load', recalcDynamicPricing);

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
            seat.forEach(s => {
                const lbl = s.dataset.label;
                if (lbl && stored.includes(lbl) && !s.classList.contains('occupied')) {
                    s.classList.add('selected');
                }
            });
        }
    } catch (_) { }
    syncArrayFromDOM();
    renderSelectedChips();
    updateTotalsAndSummary();
    refreshSeatA11y();
    applyRowZonesAndLabels();
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
        const el = event.currentTarget || event.target.closest('.seat');
        if (!el || el.classList.contains('occupied')) return;
        el.classList.toggle('selected');
        syncArrayFromDOM();
        renderSelectedChips();
        updateTotalsAndSummary();
        updateProceedState();
        refreshSeatA11y();
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

    // reset totals and UI via helpers
    syncArrayFromDOM();
    renderSelectedChips();
    const price = document.querySelector("#totalPrice");
    if (price) price.textContent = "$0";

    // clear persisted selection since it's now booked
    try { localStorage.setItem('selectedSeats', '[]'); } catch (_) { }
    // persist occupied seats
    try {
        const prev = JSON.parse(localStorage.getItem('occupiedSeats') || '[]');
        const next = Array.from(new Set([...(Array.isArray(prev) ? prev : []), ...bookedSeats]));
        localStorage.setItem('occupiedSeats', JSON.stringify(next));
    } catch (_) { }
    updateProceedState();
    updateTotalsAndSummary();

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

    syncArrayFromDOM();
    renderSelectedChips();

    const price = document.querySelector("#totalPrice");
    if (price) price.textContent = "$0";
    // (leaving movie selection as-is on cancel, your default block already set initial)

    // clear persisted selection on cancel
    try { localStorage.setItem('selectedSeats', '[]'); } catch (_) { }
    updateProceedState();
    refreshSeatA11y();
    updateTotalsAndSummary();
});

// Click on a selected seat chip to deselect that seat
holder.addEventListener('click', (e) => {
    const chip = e.target.closest('.selectedSeat');
    if (!chip) return;
    const label = chip.dataset.seatLabel;
    const seatEl = document.querySelector(`#seatCont .seat[data-label="${label}"]`);
    if (seatEl) {
        seatEl.classList.remove('selected');
    }
    syncArrayFromDOM();
    renderSelectedChips();
    updateTotalsAndSummary();
    updateProceedState();
    refreshSeatA11y();
});

// Delegated seat click fallback (idempotent)
(function ensureSeatClicksWork() {
    if (window.__USE_DELEGATED_SEAT_HANDLER !== true) return;
    const cont = document.querySelector('#seatCont');
    if (!cont) return;
    cont.addEventListener('click', (e) => {
        const el = e.target.closest('.seat');
        if (!el || el.classList.contains('occupied')) return;
        el.classList.toggle('selected');
        syncArrayFromDOM();
        renderSelectedChips();
        updateTotalsAndSummary();
        updateProceedState();
        refreshSeatA11y();
        try { window.arraySeats = arraySeats.slice(); } catch (_) { }
    }, { capture: false });
})();

// Prefill showtime if empty: next 19:00
(function defaultShowtime() {
    const el = document.getElementById('showtime');
    if (!el || el.value) return;
    const now = new Date();
    const when = new Date(now);
    when.setHours(19, 0, 0, 0);
    if (when <= now) when.setDate(when.getDate() + 1);
    const pad = n => String(n).padStart(2, '0');
    el.value = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}T${pad(when.getHours())}:${pad(when.getMinutes())}`;
})();

// Mirror human-friendly date under existing date label if present
(function mirrorDate() {
    const el = document.getElementById('showtime');
    const dateBlock = document.querySelector('#dateHuman'); // create lazily
    if (!el) return;
    function render() {
        const v = el.value ? new Date(el.value) : new Date();
        const pretty = v.toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        let holder = document.querySelector('#dateHuman');
        if (!holder) {
            holder = document.createElement('div'); holder.id = 'dateHuman';
            holder.style.opacity = .8; holder.style.marginTop = '6px'; holder.style.fontSize = '.95rem';
            const anchor = document.querySelector('#moviePrice') || document.querySelector('#movieName') || el;
            anchor.parentElement.insertBefore(holder, anchor.nextSibling);
        }
        holder.textContent = `Showtime: ${pretty}`;
    }
    el.addEventListener('change', render); render();
})();

// --- Enforce "use now" for pricing; keep idempotent
(function enforceNowShowtime() {
    if (window.__enforceNowShowtime) return;
    window.__enforceNowShowtime = true;

    // Always use current time
    window.currentShowtime = function () { return new Date(); };

    // Make any existing #showtime input inert & hidden
    try {
        const el = document.getElementById('showtime');
        if (el) {
            el.value = '';
            el.setAttribute('hidden', '');
            el.setAttribute('aria-hidden', 'true');
            el.disabled = true;
            el.style.display = 'none';
            // Remove previous listeners if any
            el.replaceWith(el.cloneNode(true));
        }
    } catch (_) { }

    // If a dynamic pricing engine exists, force when=now
    try {
        const p = window.pricing;
        if (p && typeof p.computePrice === 'function' && !p.__wrappedForNow) {
            const orig = p.computePrice;
            p.computePrice = function (args = {}) {
                // Always override with current time
                return orig({ ...(args || {}), when: new Date() });
            };
            p.__wrappedForNow = true;
        }
    } catch (_) { }

    // One-time refresh
    try { if (typeof recalcDynamicPricing === 'function') recalcDynamicPricing(); } catch (_) { }
    try { if (typeof syncSummaryUI === 'function') syncSummaryUI(); } catch (_) { }
})();

// --- Remove stray "Showtime" label (we use current time implicitly)
(function removeStrayShowtimeLabel() {
    function hideText(host) {
        if (!host) return;
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        const re = /\bShowtime\b/i;
        let n;
        while ((n = walker.nextNode())) {
            const txt = (n.nodeValue || '').trim();
            if (re.test(txt)) {
                const span = document.createElement('span');
                span.hidden = true; span.style.display = 'none';
                n.parentNode.replaceChild(span, n);
            }
        }
    }
    const select = document.getElementById('selectMovie');
    const scope = (select && select.closest('.selectMovie')) || document.body;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => hideText(scope));
    } else {
        hideText(scope);
    }
})();

// --- Clarify pricing is live/now when no seats are selected
(function clarifyLivePricing() {
    const holder = document.getElementById('priceBreakdown');
    if (!holder) return;
    const update = () => {
        const count = document.querySelectorAll('#seatCont .seat.selected').length;
        const message = (window.naming && window.naming.ui && window.naming.ui.livePricingNow) || 'Live pricing (now)';
        if (count === 0) holder.textContent = message;
    };
    window.__clarifyLivePricingUpdate = update;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', update);
    } else {
        update();
    }
    try {
        const tEl = document.querySelector('#totalPrice');
        if (tEl && 'MutationObserver' in window) {
            new MutationObserver(update).observe(tEl, { childList: true, characterData: true, subtree: true });
        }
    } catch (_) { }
    try {
        const seatContainer = document.getElementById('seatCont');
        if (seatContainer) seatContainer.addEventListener('click', () => setTimeout(update, 0));
    } catch (_) { }
})();

// ===== ROW-BASED LABELS + MIGRATION =====
function __computeRowLetter(rIndex) { return String.fromCharCode(65 + rIndex); }
function __rowZoneForLabel(lbl) {
    try { if (window.pricing?.zoneFor) return window.pricing.zoneFor(lbl); } catch (_) { }
    const ch = String(lbl || '').charAt(0).toUpperCase();
    const row = ch ? (ch.charCodeAt(0) - 65) : 0;
    if (row <= 1) return 'FRONT';
    if (row <= 4) return 'STANDARD';
    if (row <= 5) return 'PREMIUM';
    return 'RECLINER';
}
function forceRowBasedLabelsAndZones() {
    if (window.__ROW_BASED_APPLIED) return;
    const mapOldNew = new Map();
    const rows = document.querySelectorAll('#seatCont .row');
    rows.forEach((rowEl, rIndex) => {
        const letter = __computeRowLetter(rIndex);
        const seats = rowEl.querySelectorAll('.seat');
        seats.forEach((seatEl, i) => {
            const previous = seatEl.dataset.label || '';
            const current = `${letter}${i + 1}`;
            if (previous && previous !== current) mapOldNew.set(previous, current);
            seatEl.dataset.label = current;
            seatEl.setAttribute('aria-label', `${current} seat`);
            seatEl.setAttribute('role', 'button');
            seatEl.title = `${current}`;
        });
        const zoneKey = __rowZoneForLabel(`${letter}1`);
        rowEl.classList.remove('zone-front', 'zone-standard', 'zone-premium', 'zone-recliner');
        rowEl.classList.add(
            zoneKey === 'FRONT' ? 'zone-front' :
                zoneKey === 'PREMIUM' ? 'zone-premium' :
                    zoneKey === 'RECLINER' ? 'zone-recliner' : 'zone-standard'
        );
        rowEl.dataset.bandKey = zoneKey;
        rowEl.dataset.bandLabel = zoneKey;
    });

    const migrate = (list) => {
        if (!Array.isArray(list)) return [];
        return Array.from(new Set(list.map(item => mapOldNew.get(item) || item)));
    };

    arraySeats = migrate(arraySeats);
    try { window.arraySeats = arraySeats.slice(); } catch (_) { }
    try {
        const stored = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
        localStorage.setItem('selectedSeats', JSON.stringify(migrate(stored)));
    } catch (_) { }
    try {
        const occupied = JSON.parse(localStorage.getItem('occupiedSeats') || '[]');
        localStorage.setItem('occupiedSeats', JSON.stringify(migrate(occupied)));
    } catch (_) { }

    if (numSeats) numSeats.textContent = arraySeats.length;
    try { renderSelectedChips(); } catch (_) { }
    try { updateTotalsAndSummary(); } catch (_) { }
    window.__ROW_BASED_APPLIED = true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceRowBasedLabelsAndZones);
} else {
    try { forceRowBasedLabelsAndZones(); } catch (_) { }
}

try {
    const hookList = window.__applyRowZonesHookList = window.__applyRowZonesHookList || [];
    if (!hookList.includes(forceRowBasedLabelsAndZones)) hookList.push(forceRowBasedLabelsAndZones);
} catch (_) { }

// ===== Rebuild hall DOM from scratch (rows → seats) =====
(function () {
    if (window.__HALL_V2_INIT) return;
    window.__HALL_V2_INIT = true;

    function __rowLetter(i) { return String.fromCharCode(65 + i); } // A=0
    function __zoneForRowLetter(letter) {
        const row = (letter?.toUpperCase().charCodeAt(0) ?? 65) - 65;
        if (row <= 1) return 'FRONT';
        if (row <= 4) return 'STANDARD';
        if (row <= 5) return 'PREMIUM';
        return 'RECLINER';
    }
    function __bandLabel(key) {
        const map = window.naming?.seatBands;
        if (map && map[key]) return map[key].label || map[key].short || key;
        return ({ FRONT: 'Front', STANDARD: 'Standard', PREMIUM: 'Premium', RECLINER: 'Recliner' })[key] || key;
    }

    function buildHallFromConfig() {
        const cont = document.getElementById('seatCont');
        if (!cont) return null;
        if (cont.__built) return cont;
        const rows = parseInt(cont.dataset.rows || '8', 10) || 8;
        const cols = parseInt(cont.dataset.cols || '8', 10) || 8;
        cont.innerHTML = '';
        for (let r = 0; r < rows; r++) {
            const letter = __rowLetter(r);
            const rowEl = document.createElement('div');
            rowEl.className = 'row';
            const zone = __zoneForRowLetter(letter);
            rowEl.classList.add(
                zone === 'FRONT' ? 'zone-front' :
                    zone === 'PREMIUM' ? 'zone-premium' :
                        zone === 'RECLINER' ? 'zone-recliner' : 'zone-standard'
            );
            rowEl.dataset.bandLabel = __bandLabel(zone);
            rowEl.setAttribute('role', 'row');
            for (let c = 1; c <= cols; c++) {
                const seat = document.createElement('div');
                seat.className = 'seat';
                const label = `${letter}${c}`;
                seat.dataset.label = label;
                seat.setAttribute('aria-label', `${label} seat`);
                seat.setAttribute('role', 'button');
                seat.tabIndex = 0;
                seat.textContent = label;
                rowEl.appendChild(seat);
            }
            cont.appendChild(rowEl);
        }
        cont.__built = true;
        return cont;
    }

    function migrateStoredLabels() {
        const cont = document.getElementById('seatCont');
        if (!cont) return;
        const rows = parseInt(cont.dataset.rows || '8', 10) || 8;
        const cols = parseInt(cont.dataset.cols || '8', 10) || 8;
        const valid = new Set();
        for (let r = 0; r < rows; r++) {
            const letter = __rowLetter(r);
            for (let c = 1; c <= cols; c++) valid.add(`${letter}${c}`);
        }
        const sanitize = list => Array.from(new Set((Array.isArray(list) ? list : []).filter(x => valid.has(x))));
        try {
            const selected = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
            localStorage.setItem('selectedSeats', JSON.stringify(sanitize(selected)));
        } catch (_) { }
        try {
            const occupied = JSON.parse(localStorage.getItem('occupiedSeats') || '[]');
            localStorage.setItem('occupiedSeats', JSON.stringify(sanitize(occupied)));
        } catch (_) { }
    }

    function restoreSeats() {
        const cont = document.getElementById('seatCont');
        if (!cont) return;
        let selected = [];
        let occupied = [];
        try { selected = JSON.parse(localStorage.getItem('selectedSeats') || '[]'); } catch (_) { }
        try { occupied = JSON.parse(localStorage.getItem('occupiedSeats') || '[]'); } catch (_) { }
        cont.querySelectorAll('.seat').forEach(s => s.classList.remove('selected', 'occupied'));
        selected.forEach(lbl => cont.querySelector(`.seat[data-label="${lbl}"]`)?.classList.add('selected'));
        occupied.forEach(lbl => cont.querySelector(`.seat[data-label="${lbl}"]`)?.classList.add('occupied'));
        try {
            arraySeats = selected.slice();
            window.arraySeats = selected.slice();
        } catch (_) { }
        try { syncArrayFromDOM(); } catch (_) { }
        if (typeof renderSelectedChips === 'function') {
            try { renderSelectedChips(); } catch (_) { }
        }
        try { updateProceedState(); } catch (_) { }
    }

    function overrideRefreshSeatA11y() {
        function refreshDynamic() {
            const seats = document.querySelectorAll('#seatCont .seat');
            seats.forEach(s => {
                if (s.classList.contains('occupied')) {
                    s.setAttribute('aria-disabled', 'true');
                    s.tabIndex = -1;
                } else {
                    s.setAttribute('aria-disabled', 'false');
                    s.tabIndex = 0;
                }
            });
        }
        window.refreshSeatA11y = refreshDynamic;
        refreshDynamic();
    }

    function wireSeatHandlers() {
        const cont = document.getElementById('seatCont');
        if (!cont || cont.__wired) return;
        cont.__wired = true;
        cont.addEventListener('click', (e) => {
            const el = e.target.closest('.seat');
            if (!el || el.classList.contains('occupied')) return;
            el.classList.toggle('selected');
            try { syncArrayFromDOM(); } catch (_) { }
            if (typeof renderSelectedChips === 'function') {
                try { renderSelectedChips(); } catch (_) { }
            }
            try { updateTotalsAndSummary(); } catch (_) { }
            try { updateProceedState(); } catch (_) { }
            try { refreshSeatA11y(); } catch (_) { }
        }, { capture: false });

        cont.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                const el = e.target.closest('.seat');
                if (el) {
                    e.preventDefault();
                    el.click();
                }
            }
        });
    }

    function initHall() {
        const cont = document.getElementById('seatCont');
        if (!cont) return;
        buildHallFromConfig();
        migrateStoredLabels();
        restoreSeats();
        wireSeatHandlers();
        overrideRefreshSeatA11y();
        try { window.__ROW_BASED_APPLIED = false; } catch (_) { }
        try { forceRowBasedLabelsAndZones(); } catch (_) { }
        try { updateTotalsAndSummary(); } catch (_) { }
        try { applyRowZonesAndLabels(); } catch (_) { }
        try { applyNaming(); } catch (_) { }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHall);
    } else {
        initHall();
    }

})();

// ===== Branding / Naming Injection =====
function getZoneLabel(zoneKey) {
    const z = (window.naming && window.naming.seatBands && window.naming.seatBands[zoneKey]) || null;
    return (z && (z.label || z.short)) || zoneKey || "Seat";
}
function zoneKeyForLabel(lbl) {
    return __rowZoneForLabel(lbl);
}
function applyNaming() {
    const ui = (window.naming && window.naming.ui) || {};
    const ticketsLbl = document.getElementById('sumLabelTickets');
    if (ticketsLbl && ui.tickets) ticketsLbl.textContent = ui.tickets;
    const perStrong = document.getElementById('sumPerSeat');
    if (perStrong && ui.pricePerSeat) {
        const span = perStrong.previousElementSibling;
        if (span && span.tagName === 'SPAN') span.textContent = ui.pricePerSeat;
    }
    const totalStrong = document.getElementById('sumTotal');
    if (totalStrong && ui.total) {
        const span = totalStrong.previousElementSibling;
        if (span && span.tagName === 'SPAN') span.textContent = ui.total;
    }
    const selMovieP = document.querySelector('.selectMovie p');
    if (selMovieP && ui.selectMovie) selMovieP.textContent = ui.selectMovie;
    const textSwap = (needle, replacement) => {
        if (!needle || !replacement) return;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n; const re = new RegExp('^\\s*' + needle.replace(/([.*+?^${}()|[\\]\\])/g, '\\$1') + '\\s*$', 'i');
        while ((n = walker.nextNode())) {
            if (re.test(n.nodeValue || '')) n.nodeValue = replacement;
        }
    };
    textSwap('MOVIE NAME', ui.movieNameLabel || 'Feature');
    textSwap('MOVIE PRICE', ui.moviePriceLabel || 'Base fare');
    textSwap('DATE', ui.dateLabel || 'Show date');
    textSwap('SELECTED SEATS', ui.selectedSeats || 'Your picks');
    textSwap('NO SEAT SELECTED', ui.noneSelected || 'No seats yet');
    const darkLabel = document.querySelector('label[for="themeToggle"] span, #themeToggle ~ span');
    if (darkLabel && ui.darkMode) darkLabel.textContent = ui.darkMode;
    const reclinerLegend = document.querySelector('.legendContainer .seat.legend.recliner');
    if (reclinerLegend) {
        const small = reclinerLegend.parentElement?.querySelector('small');
        if (small) small.textContent = getZoneLabel('RECLINER');
    }
    document.querySelectorAll('#seatCont .row').forEach(rowEl => {
        const key = rowEl.dataset.bandKey || (rowEl.classList.contains('zone-recliner') ? 'RECLINER' : rowEl.classList.contains('zone-premium') ? 'PREMIUM' : rowEl.classList.contains('zone-front') ? 'FRONT' : 'STANDARD');
        rowEl.dataset.bandKey = key;
        rowEl.dataset.bandLabel = getZoneLabel(key);
    });
    document.querySelectorAll('#seatCont .seat').forEach(seat => {
        const lbl = seat.dataset.label;
        if (!lbl) return;
        const zoneKey = zoneKeyForLabel(lbl);
        const zx = getZoneLabel(zoneKey);
        seat.title = `${lbl} — ${zx}`;
        seat.setAttribute('aria-label', `${lbl} ${zx.toLowerCase()} seat`);
    });
    try { if (typeof window.__clarifyLivePricingUpdate === 'function') window.__clarifyLivePricingUpdate(); } catch (_) { }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyNaming);
} else {
    try { applyNaming(); } catch (_) { }
}
try {
    const list = window.__applyRowZonesHookList = window.__applyRowZonesHookList || [];
    if (!list.includes(applyNaming)) list.push(applyNaming);
} catch (_) { }

// ===== Layout guard: rows must be horizontal =====
(function layoutGuard() {
    function check() {
        const rows = document.querySelectorAll('#seatCont .row');
        if (!rows.length) return;
        const seats = rows[0].querySelectorAll('.seat');
        if (seats.length < 2) return;
        const a = seats[0].getBoundingClientRect();
        const b = seats[1].getBoundingClientRect();
        const horizontal = Math.abs(b.left - a.left) > Math.abs(b.top - a.top);
        if (!horizontal) {
            console.warn('[Hall] Layout flipped to vertical — applying inline emergency fix.');
            const sc = document.getElementById('seatCont');
            if (sc) { sc.style.display = 'flex'; sc.style.flexDirection = 'column'; sc.style.alignItems = 'center'; }
            rows.forEach(r => {
                r.style.display = 'flex';
                r.style.flexDirection = 'row';
                r.style.flexWrap = 'nowrap';
                r.style.justifyContent = 'center';
            });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
    else check();
    window.addEventListener('resize', () => { try { check(); } catch (_) { } });
})();

// ===== A11y state & tooltip consistency for seats =====
(function enhanceSeatA11y() {
    const cont = document.getElementById('seatCont'); if (!cont) return;
    function update(el) {
        const pressed = el.classList.contains('selected') ? 'true' : 'false';
        el.setAttribute('aria-pressed', pressed);
        const lbl = el.dataset.label || '';
        let band = '';
        try {
            if (window.pricing?.zoneFor) {
                const z = window.pricing.zoneFor(lbl);
                const human = window.naming?.seatBands?.[z]?.label || z || '';
                band = human ? ` — ${human}` : '';
            }
        } catch (_) { }
        el.title = lbl + band;
    }
    cont.querySelectorAll('.seat').forEach(update);
    cont.addEventListener('click', e => { const s = e.target.closest('.seat'); if (s) update(s); }, { capture: false });
    cont.addEventListener('keydown', e => {
        if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('.seat')) {
            setTimeout(() => { try { update(e.target.closest('.seat')); } catch (_) { } }, 0);
        }
    });
})();

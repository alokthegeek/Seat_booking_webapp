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
//Add eventLister to each unoccupied seat
const seat = document.querySelectorAll("#seatCont .seat");
// const occupied = document.querySelectorAll(".seat.occupied"); // not used

const holder = document.querySelector("#selectedSeatsHolder");
const numSeats = document.querySelector("#numberOfSeat");

const countSeat = 0;
const arraySeats = []; // array to store selected seats
const totalP = document.querySelector("#totalPrice");
const span = holder.querySelector("span");

for (let i = 0; i < seat.length; i++) {
    seat[i].addEventListener("click", (event) => {
        if (!(event.target.classList.contains("selected"))) {
            if (!(event.target.classList.contains("occupied"))) {
                let seatToAdd = document.createElement("div");
                seatToAdd.textContent = "SEAT";
                seatToAdd.classList.add("appendSeat");

                event.target.classList.add("selected");
                arraySeats.push(event.target);
                numSeats.textContent = arraySeats.length;
                totalP.textContent = '$' + (p * arraySeats.length);

                holder.append(seatToAdd);
                if (span && span.parentNode === holder) { holder.removeChild(span); }
            }
        } else {
            event.target.classList.remove('selected');
            // keep count simple (we only use length)
            if (arraySeats.length) arraySeats.pop();
            numSeats.textContent = arraySeats.length;

            let removeSeatAppend = document.querySelectorAll(".appendSeat");
            if (removeSeatAppend.length) removeSeatAppend[0].remove();
            if (arraySeats.length == 0) {
                holder.append(span);
            }
            totalP.textContent = '$' + (p * arraySeats.length);
        }
    });
}

//Add eventLsiter to continue Button
const contBtn = document.querySelector("#proceedBtn");
contBtn.addEventListener("click", (event) => {
    const numOfSeats = document.querySelector("#numberOfSeat").innerHTML;
    if (numOfSeats == '0') {
        alert("Oops no seat Selected");
        return;
    } else {
        alert("Yayy! Your Seats have been booked");
    }

    // mark all selected as occupied
    const selSeatsAll = document.querySelectorAll(".selected");
    selSeatsAll.forEach(s => {
        s.classList.add("occupied");
        s.classList.remove("selected");
    });

    // reset totals and UI
    arraySeats.length = 0;
    numSeats.textContent = 0;
    const price = document.querySelector("#totalPrice");
    price.textContent = "$0";
    holder.innerHTML = '<span class="noSelected">No Seat Selected</span>';
});

//Add eventListerner to Cancel Button
const cancelBtn = document.querySelector("#cancelBtn");
cancelBtn.addEventListener("click", (event) => {
    const selSeatsAll = document.querySelectorAll(".selected");
    selSeatsAll.forEach(s => s.classList.remove("selected"));

    arraySeats.length = 0;
    numSeats.textContent = 0;

    const price = document.querySelector("#totalPrice");
    price.textContent = "$0";

    holder.innerHTML = '<span class="noSelected">No Seat Selected</span>';
    // (leaving movie selection as-is on cancel, your default block already set initial)
});

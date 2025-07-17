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

    dropDown.addEventListener("change", (event) => {
        const movName = document.querySelector("#movieName");
        movName.textContent = event.target.value.split(" ")[0];

        const movPrice = document.querySelector("#moviePrice");
        movPrice.textContent = event.target.value.split(" ")[1];

        const totalP = document.querySelector("#totalPrice");
        totalP.textContent = event.target.value.split(" ")[1];

        p = totalP.innerHTML[1];
    });
    dropDown.add(opt);
};

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
const occupied = document.querySelectorAll(".seat.occupied");


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
                totalP.textContent = '$' + p * arraySeats.length;

                holder.append(seatToAdd);
                // toBeRemoved.remove();
                if (span) { holder.removeChild(span); }
            }
        }
        else if (event.target.classList.contains("selected")) {
            event.target.classList.remove('selected');
            arraySeats.pop();
            numSeats.textContent = arraySeats.length;

            let removeSeatAppend = document.querySelectorAll(".appendSeat");
            removeSeatAppend[0].remove();
            if (arraySeats.length == 0) {
                holder.append(span);
            }
            totalP.textContent = '$' + p * arraySeats.length;
        }
        // totalP.textContent = '$' + p * arraySeats.length ;
    });
}

/*for (let i = 0; i < seat.length; i++) {
  seat[i].addEventListener("click", (event) => {
  if (event.target.classList.contains("selected")) {
    event.target.classList.remove('selected');
    countSeat--;
    seatSelected[0].remove();
  }
  else if (!(event.target.classList.contains("occupied"))) {
    event.target.classList.add("selected");
    const var1 = document.createElement("div");
    var1.textContent = "SEAT";
    holder.append(var1);
    seatSelected.push(var1);
    countSeat++;
    }
    numSeats.textContent = countSeat;
  });
}*/


//Add eventLsiter to continue Button
const contBtn = document.querySelector("#proceedBtn");
contBtn.addEventListener("click", (event) => {
    const numOfSeats = document.querySelector("#numberOfSeat").innerHTML;
    if (numOfSeats == '0') {
        alert("Oops no seat Selected");
    } else {
        alert("Yayy! Your Seats have been booked");
    }
    const selSeats = document.querySelector(".selected");
    selSeats.classList.add("occupied");
    selSeats.classList.remove("selected");

    const price = document.querySelector("#totalPrice");
    price.innerHTML = "$ 0";

    //Update the seatHolderSection to its default value which is a span with textContent "No seat Selected".

});
//Add eventListerner to Cancel Button

const cancelBtn = document.querySelector("#cancelBtn");
cancelBtn.addEventListener("click", (event) => {
    const selSeats = document.querySelector(".selected");
    selSeats.classList.remove("selected");
    const price = document.querySelector("#totalPrice");
    price.innerHTML = "$ 0";

    {
        const movName = document.querySelector("#movieName");
        movName.textContent = "Flash";
        const movPrice = document.querySelector("#moviePrice");
        movPrice.textContent = "$7";
        const totalP = document.querySelector("#totalPrice");
        totalP.textContent = "$0";
    }
});

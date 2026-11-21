/* =====================================================================
   customer-booking.js  -  Seat selection and booking (booking.html)
   ---------------------------------------------------------------------
   CREATE        : confirmBooking() push()es a new booking object
   Unique 1      : Interactive seat map
                     green = available, red = booked, blue = selected
   The page address is  booking.html?id=E-101
   ===================================================================== */

// The customer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentCustomerId = "U-003";

let currentEvent = null;      // the event being booked
let selectedSeats = [];       // seats the customer clicked, e.g. ["A1", "A2"]

const bookingFields = ["holderName", "holderPhone"];


/* =====================================================================
   UNIQUE FEATURE 1: INTERACTIVE SEAT SELECTION
   Every seat is a button made with createElement. Its class decides
   the colour in customer.css (available / booked / selected).
   ===================================================================== */
function renderSeatMap() {
  let bookedSeats = getBookedSeats(currentEvent.id);
  let map = document.getElementById("seatMap");
  map.innerHTML = "";

  for (let r = 0; r < currentEvent.rows; r++) {
    let rowDiv = document.createElement("div");
    rowDiv.className = "seat-row";

    let label = document.createElement("span");
    label.className = "row-letter";
    label.innerHTML = rowLetter(r);
    rowDiv.appendChild(label);

    for (let s = 1; s <= currentEvent.seatsPerRow; s++) {
      let seatId = rowLetter(r) + s;
      let seat = document.createElement("button");
      seat.type = "button";
      seat.innerHTML = s;
      seat.title = "Seat " + seatId;

      if (bookedSeats.indexOf(seatId) !== -1) {
        seat.className = "seat booked";
        seat.disabled = true;                 // a booked seat cannot be clicked
      } else if (selectedSeats.indexOf(seatId) !== -1) {
        seat.className = "seat selected";
        seat.setAttribute("onclick", "toggleSeat('" + seatId + "')");
      } else {
        seat.className = "seat available";
        seat.setAttribute("onclick", "toggleSeat('" + seatId + "')");
      }

      rowDiv.appendChild(seat);
    }

    map.appendChild(rowDiv);
  }
}

// Click on a seat: select it, or un-select it if it was already selected
function toggleSeat(seatId) {
  let position = selectedSeats.indexOf(seatId);
  clearError("seats");

  if (position === -1) {
    if (selectedSeats.length >= bookingRules.maxSeats) {
      showError("seats", "You can select at most " + bookingRules.maxSeats + " seats.");
      return;
    }
    selectedSeats.push(seatId);
  } else {
    selectedSeats = removeAt(selectedSeats, position);
  }

  renderSeatMap();
  renderSummary();
}

function clearSelection() {
  selectedSeats = [];
  clearError("seats");
  renderSeatMap();
  renderSummary();
}

// The box with the chosen seats and the total price
function renderSummary() {
  let box = document.getElementById("bookingSummary");

  if (selectedSeats.length === 0) {
    box.innerHTML = "Click the green seats to choose them.";
    return;
  }

  let total = selectedSeats.length * currentEvent.price;
  box.innerHTML = "<p>Seats: <strong>" + selectedSeats.join(", ") + "</strong></p>" +
                  "<p>" + selectedSeats.length + " x " + currentEvent.price + " Tk</p>" +
                  "<p>Total: <span class='big'>" + total + " Tk</span></p>";
}


/* =====================================================================
   CREATE: CONFIRM THE BOOKING
   ===================================================================== */
function confirmBooking() {
  let name = document.getElementById("holderName").value.trim();
  let phone = document.getElementById("holderPhone").value.trim();

  let isValid = true;
  clearErrors(bookingFields);
  clearError("seats");
  hideMessage("bookingMessage");

  if (selectedSeats.length === 0) {
    showError("seats", "Please select at least one seat.");
    isValid = false;
  }

  if (name.length < 3) {
    showError("holderName", "Name must be at least 3 characters.");
    isValid = false;
  }

  if (isDigitsOnly(phone) === false || phone.length !== 11 || phone.slice(0, 2) !== "01") {
    showError("holderPhone", "Phone must be 11 digits and start with 01.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // Check again that nobody took these seats a moment ago
  let bookedSeats = getBookedSeats(currentEvent.id);
  for (const seatId of selectedSeats) {
    if (bookedSeats.indexOf(seatId) !== -1) {
      showError("seats", "Seat " + seatId + " was just booked. Please choose another seat.");
      selectedSeats = removeAt(selectedSeats, selectedSeats.indexOf(seatId));
      renderSeatMap();
      renderSummary();
      return false;
    }
  }

  let newBooking = { id: nextId("BK", bookings), customerId: currentCustomerId, eventId: currentEvent.id,
                     title: currentEvent.title, seats: selectedSeats.slice(), holderName: name, phone: phone,
                     total: selectedSeats.length * currentEvent.price, bookedOn: todayString(), status: "Confirmed" };
  bookings.push(newBooking);
  saveData();
  console.log("New booking:", newBooking);

  showMessage("bookingMessage", "Booking <strong>" + newBooking.id + "</strong> is confirmed for seat(s) " +
              newBooking.seats.join(", ") + ". <a href='my-tickets.html'>See your digital ticket</a>.", "success");

  selectedSeats = [];
  document.getElementById("bookingForm").reset();
  renderSeatMap();
  renderSummary();
  return false;
}


// Puts the name and phone of the logged-in customer into the form
function fillFromAccount() {
  let index = findIndexById(users, currentCustomerId);
  if (index !== -1) {
    document.getElementById("holderName").value = users[index].name;
    document.getElementById("holderPhone").value = users[index].phone;
  }
}


/* =====================================================================
   START
   ===================================================================== */
function startBooking() {
  let index = findIndexById(events, getQueryValue("id"));

  if (index === -1) {
    document.getElementById("bookingSection").style.display = "none";
    showMessage("bookingMessage", "Please choose an event first. <a href='events.html'>See all events</a>.", "error");
    return;
  }

  currentEvent = events[index];

  if (isPastEvent(currentEvent)) {
    document.getElementById("bookingSection").style.display = "none";
    showMessage("bookingMessage", "<strong>" + currentEvent.title + "</strong> is finished. <a href='events.html'>See other events</a>.", "error");
    return;
  }

  document.getElementById("bookingSection").style.display = "block";   // .page-section is hidden in the CSS
  document.getElementById("bookingTitle").innerHTML = "Book: " + currentEvent.title;
  document.getElementById("bookingInfo").innerHTML = currentEvent.date + " &middot; " + currentEvent.time + " &middot; " +
    currentEvent.venue + ", " + currentEvent.city + " &middot; " + currentEvent.price + " Tk per seat";
  document.getElementById("maxSeatsText").innerHTML = bookingRules.maxSeats;

  renderSeatMap();
  renderSummary();
}

startBooking();

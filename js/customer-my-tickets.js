/* =====================================================================
   customer-my-tickets.js  -  My bookings and digital tickets (my-tickets.html)
   ---------------------------------------------------------------------
   CRUD + Search : the customer's bookings array
     Create  -> customer-booking.js (a new booking is made on booking.html)
     Read    -> renderTickets()
     Search  -> renderTickets() with the search box
     Update  -> editTicket() + saveTicket()  (holder name, phone and seats)
                The seats are changed on a seat map (renderEditSeatMap, toggleEditSeat)
     Delete  -> deleteTicket()  (cancel a booking, the seats become free)
   Unique 2      : Digital ticket with a QR code (buildQrCode)
   customer-qrcode.js is a small library that draws the QR code.
   ===================================================================== */

// The customer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentCustomerId = "U-003";

let editTicketIndex = -1;
let editSeats = [];             // the seats selected while editing, e.g. ["A1", "A2"]

const ticketFields = ["ticketName", "ticketPhone", "editSeats"];


/* =====================================================================
   UNIQUE FEATURE 2: QR CODE
   The text inside the QR code has the booking id, the event id,
   the seats and the holder name.
   ===================================================================== */
function buildQrCode(booking) {
  let text = "EVENTNEST|" + booking.id + "|" + booking.eventId + "|" + booking.seats.join(",") + "|" + booking.holderName;
  let qr = qrcode(0, "M");      // type 0 = the library chooses the size
  qr.addData(text);
  qr.make();
  return qr.createImgTag(4, 8);   // an <img> tag: 4 pixels per square, 8 squares of margin
}


/* =====================================================================
   READ + SEARCH (only this customer's bookings)
   ===================================================================== */
function renderTickets() {
  let keyword = document.getElementById("ticketSearch").value;

  let html = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    let isMine = (booking.customerId === currentCustomerId);   // only this customer's bookings
    if (isMine) {
      mine++;
    }

    let matchesKeyword = containsText(booking.title, keyword) || containsText(booking.id, keyword) ||
                         containsText(booking.holderName, keyword) || containsText(booking.seats.join(" "), keyword);

    if (isMine && matchesKeyword) {
      let event = events[findIndexById(events, booking.eventId)];
      let finished = isPastEvent(event);

      let actions = "";
      let ticketClass = "ticket";
      let statusBadge = "<span class='badge green'>" + booking.status + "</span>";
      if (finished) {
        ticketClass = "ticket finished";
        statusBadge = "<span class='badge grey'>Event finished</span>";
      } else {
        actions = "<button type='button' class='btn btn-small' onclick='editTicket(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteTicket(" + i + ")'>Cancel</button>";
      }

      html += "<div class='" + ticketClass + "'>" +
                "<div class='ticket-main'>" +
                  statusBadge + " <span class='badge blue'>" + event.category + "</span>" +
                  "<h3>" + event.title + "</h3>" +
                  "<table class='ticket-info'>" +
                    "<tr><td>Date:</td><td>" + event.date + " &middot; " + event.time + "</td></tr>" +
                    "<tr><td>Venue:</td><td>" + event.venue + ", " + event.city + "</td></tr>" +
                    "<tr><td>Seat(s):</td><td><span class='ticket-seats'>" + booking.seats.join(", ") + "</span></td></tr>" +
                    "<tr><td>Holder:</td><td>" + booking.holderName + " (" + booking.phone + ")</td></tr>" +
                    "<tr><td>Booking:</td><td>" + booking.id + " &middot; booked on " + booking.bookedOn + "</td></tr>" +
                    "<tr><td>Total:</td><td>" + booking.total + " Tk</td></tr>" +
                  "</table>" +
                  "<div class='ticket-actions'>" + actions + "</div>" +
                "</div>" +
                "<div class='ticket-qr'>" +
                  buildQrCode(booking) +
                  "<p class='hint'>Scan at the entrance</p>" +
                "</div>" +
              "</div>";
      shown++;
    }
  }

  if (shown === 0) {
    html = "<p class='empty-row'>No tickets match your search.</p>";
  }

  document.getElementById("ticketList").innerHTML = html;
  document.getElementById("ticketCount").innerHTML = "Showing " + shown + " of " + mine + " tickets";
}


/* =====================================================================
   UPDATE
   ===================================================================== */

// UPDATE step 1: copy the booking into the form and show the seat map
function editTicket(index) {
  let booking = bookings[index];
  editTicketIndex = index;
  editSeats = booking.seats.slice();          // a copy, so the booking changes only when Update is clicked

  document.getElementById("ticketName").value = booking.holderName;
  document.getElementById("ticketPhone").value = booking.phone;
  document.getElementById("ticketFormInfo").innerHTML = booking.id + " &middot; " + booking.title;
  document.getElementById("maxSeatsText").innerHTML = bookingRules.maxSeats;
  document.getElementById("editCard").style.display = "block";

  clearErrors(ticketFields);
  hideMessage("ticketMessage");
  renderEditSeatMap();
  renderEditSummary();
  document.getElementById("editCard").scrollIntoView();
}


// The seat map of the event being edited.
// The seats of this booking are NOT red for the customer: they can keep them or give them up.
function renderEditSeatMap() {
  let booking = bookings[editTicketIndex];
  let event = events[findIndexById(events, booking.eventId)];
  let bookedSeats = getBookedSeats(event.id);
  let map = document.getElementById("editSeatMap");
  map.innerHTML = "";

  for (let r = 0; r < event.rows; r++) {
    let rowDiv = document.createElement("div");
    rowDiv.className = "seat-row";

    let label = document.createElement("span");
    label.className = "row-letter";
    label.innerHTML = rowLetter(r);
    rowDiv.appendChild(label);

    for (let s = 1; s <= event.seatsPerRow; s++) {
      let seatId = rowLetter(r) + s;
      let seat = document.createElement("button");
      seat.type = "button";
      seat.innerHTML = s;
      seat.title = "Seat " + seatId;

      let bookedByOther = (bookedSeats.indexOf(seatId) !== -1 && booking.seats.indexOf(seatId) === -1);

      if (bookedByOther) {
        seat.className = "seat booked";
        seat.disabled = true;
      } else if (editSeats.indexOf(seatId) !== -1) {
        seat.className = "seat selected";
        seat.setAttribute("onclick", "toggleEditSeat('" + seatId + "')");
      } else {
        seat.className = "seat available";
        seat.setAttribute("onclick", "toggleEditSeat('" + seatId + "')");
      }

      rowDiv.appendChild(seat);
    }

    map.appendChild(rowDiv);
  }
}

// Click on a seat: select it, or un-select it if it was already selected
function toggleEditSeat(seatId) {
  let position = editSeats.indexOf(seatId);
  clearError("editSeats");

  if (position === -1) {
    if (editSeats.length >= bookingRules.maxSeats) {
      showError("editSeats", "You can select at most " + bookingRules.maxSeats + " seats.");
      return;
    }
    editSeats.push(seatId);
  } else {
    editSeats = removeAt(editSeats, position);
  }

  renderEditSeatMap();
  renderEditSummary();
}

// The box with the chosen seats and the new total price
function renderEditSummary() {
  let booking = bookings[editTicketIndex];
  let event = events[findIndexById(events, booking.eventId)];
  let box = document.getElementById("ticketSummary");

  if (editSeats.length === 0) {
    box.innerHTML = "Click the green seats to choose them.";
    return;
  }

  box.innerHTML = "<p>Seats: <strong>" + editSeats.join(", ") + "</strong></p>" +
                  "<p>" + editSeats.length + " x " + event.price + " Tk</p>" +
                  "<p>Total: <span class='big'>" + (editSeats.length * event.price) + " Tk</span></p>";
}

// UPDATE step 2: validate and change the properties of the object
function saveTicket() {
  if (editTicketIndex === -1) {
    showMessage("ticketMessage", "Click Edit on a ticket first.", "error");
    return false;
  }

  let name = document.getElementById("ticketName").value.trim();
  let phone = document.getElementById("ticketPhone").value.trim();

  let isValid = true;
  clearErrors(ticketFields);

  if (name.length < 3) {
    showError("ticketName", "Name must be at least 3 characters.");
    isValid = false;
  }

  if (isDigitsOnly(phone) === false || phone.length !== 11 || phone.slice(0, 2) !== "01") {
    showError("ticketPhone", "Phone must be 11 digits and start with 01.");
    isValid = false;
  }

  if (editSeats.length === 0) {
    showError("editSeats", "Please select at least one seat.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let booking = bookings[editTicketIndex];
  let event = events[findIndexById(events, booking.eventId)];
  booking.holderName = name;
  booking.phone = phone;
  booking.seats = editSeats.slice();
  booking.total = editSeats.length * event.price;
  saveData();

  showMessage("ticketMessage", "Ticket " + booking.id + " was updated. Your seat(s): <strong>" + booking.seats.join(", ") + "</strong>.", "success");
  resetTicketForm();
  renderTickets();
  return false;
}


/* =====================================================================
   DELETE (cancel a booking: its seats become green again)
   ===================================================================== */
function deleteTicket(index) {
  let booking = bookings[index];
  bookings = removeAt(bookings, index);
  saveData();

  showMessage("ticketMessage", "Booking " + booking.id + " for <strong>" + booking.title + "</strong> was cancelled.", "info");
  resetTicketForm();
  renderTickets();
}


function resetTicketForm() {
  editTicketIndex = -1;
  editSeats = [];
  document.getElementById("ticketForm").reset();
  clearErrors(ticketFields);
  document.getElementById("editCard").style.display = "none";
}


/* =====================================================================
   START
   ===================================================================== */
renderTickets();

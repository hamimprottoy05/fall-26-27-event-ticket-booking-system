
const currentOrganizerId = "U-002";
const currentOrganization = getOrganizationName(currentOrganizerId);



function fillCheckinEvents() {
  let select = document.getElementById("checkinEvent");
  let today = todayString();
  let chosen = "";

  for (const event of getOrganizerEvents(currentOrganization)) {
    let option = document.createElement("option");
    option.value = event.id;
    option.innerHTML = event.title + " (" + event.date + ")";
    select.appendChild(option);

    if (event.date === today && chosen === "") {
      chosen = event.id;
    }
  }
  select.value = chosen;
}



function renderCheckin() {
  let eventId = document.getElementById("checkinEvent").value;
  let area = document.getElementById("checkinArea");
  clearError("checkinEvent");
  hideMessage("checkinMessage");

  if (eventId === "") {
    area.style.display = "none";
    document.getElementById("checkinEventNote").innerHTML = "Choose an event to start checking guests in.";
    return;
  }

  let event = events[findIndexById(events, eventId)];
  area.style.display = "block";

  
  let note = "";
  if (event.date === todayString()) {
    note = "This event is today.";
  } else if (isPastEvent(event)) {
    note = "This event was on " + event.date + ".";
  } else {
    note = "This event is on " + event.date + ", not today.";
  }
  document.getElementById("checkinEventNote").innerHTML = note;


  let expected = expectedGuests(eventId);
  let checked = checkedInGuests(eventId);
  let percent = 0;
  if (expected > 0) {
    percent = Math.round(checked / expected * 100);
  }

  document.getElementById("statChecked").innerHTML = checked;
  document.getElementById("statExpected").innerHTML = expected;
  document.getElementById("statWaiting").innerHTML = expected - checked;

  let bar = document.getElementById("checkinBar");
  bar.style.width = percent + "%";
  bar.innerHTML = percent > 8 ? percent + "%" : "";
  document.getElementById("checkinBarText").innerHTML = checked + " of " + expected + " guests have arrived (" + percent + "%).";

  
  let rows = "";
  let list = getEventBookings(eventId);
  for (const booking of list) {
    let entry = "";
    let action = "<span class='hint'>-</span>";

    if (booking.status !== "Approved") {
      entry = "<span class='badge " + bookingStatusColor(booking.status) + "'>" + booking.status + " - not allowed</span>";
    } else if (booking.checkedIn === true) {
      entry = "<span class='badge green'>Checked In</span><br><span class='hint'>" + booking.checkedInAt + "</span>";
      action = "<button type='button' class='btn btn-small btn-secondary' onclick='undoCheckIn(\"" + booking.id + "\")'>Undo</button>";
    } else {
      entry = "<span class='badge orange'>Waiting</span>";
      action = "<button type='button' class='btn btn-small btn-success' onclick='quickCheckIn(\"" + booking.id + "\")'>Check In</button>";
    }

    rows += "<tr>" +
              "<td>" + booking.id + "</td>" +
              "<td>" + booking.holderName + "<br><span class='hint'>" + booking.phone + "</span></td>" +
              "<td>" + booking.seats.join(", ") + "</td>" +
              "<td>" + entry + "</td>" +
              "<td>" + action + "</td>" +
            "</tr>";
  }
  if (rows === "") {
    rows = "<tr><td colspan='5' class='empty-row'>This event has no bookings yet.</td></tr>";
  }
  document.getElementById("checkinTableBody").innerHTML = rows;
}



function checkInGuest() {
  let eventId = document.getElementById("checkinEvent").value;
  let idText = document.getElementById("checkinBookingId").value.trim().toUpperCase();

  clearErrors(["checkinEvent", "checkinBookingId"]);
  hideMessage("checkinMessage");

 
  let isValid = true;
  if (eventId === "") {
    showError("checkinEvent", "Please choose the event first.");
    isValid = false;
  }

  if (idText === "") {
    showError("checkinBookingId", "Please type the booking id.");
    isValid = false;
  } else if (idText.length !== 6 || idText.slice(0, 3) !== "BK-" || isDigitsOnly(idText.slice(3)) === false) {
    showError("checkinBookingId", "A booking id looks like BK-001.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  doCheckIn(idText, eventId);
  document.getElementById("checkinBookingId").value = "";
  document.getElementById("checkinBookingId").focus();
  return false;
}


function quickCheckIn(bookingId) {
  doCheckIn(bookingId, document.getElementById("checkinEvent").value);
}


function doCheckIn(bookingId, eventId) {
  let index = findIndexById(bookings, bookingId);

  if (index === -1) {
    showMessage("checkinMessage", "Booking <strong>" + escapeHtml(bookingId) + "</strong> was not found.", "error");
    return;
  }

  let booking = bookings[index];
  let event = events[findIndexById(events, booking.eventId)];

  if (event === undefined || event.organizer !== currentOrganization) {
    showMessage("checkinMessage", "Booking <strong>" + booking.id + "</strong> is not for one of your events.", "error");
  } else if (booking.eventId !== eventId) {
    showMessage("checkinMessage", "Booking <strong>" + booking.id + "</strong> is for <strong>" + event.title + "</strong>, not for the event you chose.", "error");
  } else if (booking.status === "Pending") {
    showMessage("checkinMessage", "Booking <strong>" + booking.id + "</strong> is still Pending. Approve it first on the Bookings page.", "error");
  } else if (booking.status === "Cancelled") {
    showMessage("checkinMessage", "Booking <strong>" + booking.id + "</strong> was cancelled. Entry is not allowed.", "error");
  } else if (booking.checkedIn === true) {
    showMessage("checkinMessage", "Booking <strong>" + booking.id + "</strong> was already checked in at " + booking.checkedInAt + ".", "info");
  } else {
    booking.checkedIn = true;
    booking.checkedInAt = nowString();
    saveData();
    renderCheckin();
    showMessage("checkinMessage", "Welcome, <strong>" + booking.holderName + "</strong>! Booking " + booking.id +
                " (" + booking.seats.join(", ") + ") is now Checked In.", "success");
  }
}

function undoCheckIn(bookingId) {
  let booking = bookings[findIndexById(bookings, bookingId)];
  booking.checkedIn = false;
  booking.checkedInAt = "";
  saveData();
  renderCheckin();
  showMessage("checkinMessage", "Check-in of <strong>" + booking.id + "</strong> was undone.", "info");
}



fillCheckinEvents();
renderCheckin();

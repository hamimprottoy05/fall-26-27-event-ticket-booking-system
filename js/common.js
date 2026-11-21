



function showSection(sectionId) {
  for (let i = 0; i < sections.length; i++) {
    let section = document.getElementById(sections[i]);
    let navButton = document.getElementById("nav-" + sections[i]);

    if (sections[i] === sectionId) {
      section.style.display = "block";
      navButton.className = "active";
    } else {
      section.style.display = "none";
      navButton.className = "";
    }
  }
}



function showError(fieldId, message) {
  document.getElementById(fieldId + "Error").innerHTML = message;

  
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "2px solid red";
  }
}

function clearError(fieldId) {
  document.getElementById(fieldId + "Error").innerHTML = "";

  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "";   
  }
}


function clearErrors(fieldIds) {
  for (let i = 0; i < fieldIds.length; i++) {
    clearError(fieldIds[i]);
  }
}



function showMessage(boxId, text, type) {
  let box = document.getElementById(boxId);
  box.innerHTML = text;
  box.className = "message " + type;
  box.style.display = "block";
}

function hideMessage(boxId) {
  document.getElementById(boxId).style.display = "none";
}



function isEmpty(value) {
  return value.trim() === "";
}


function isValidEmail(email) {
  let atPosition = email.indexOf("@");
  let dotPosition = email.indexOf(".", atPosition);

  if (atPosition < 1) {
    return false;                       
  }
  if (dotPosition < atPosition + 2) {
    return false;                       
  }
  if (dotPosition === email.length - 1) {
    return false;                       
  }
  return true;
}


function isDigitsOnly(text) {
  if (text.length === 0) {
    return false;
  }
  let digits = "0123456789";
  for (let i = 0; i < text.length; i++) {
    if (digits.indexOf(text[i]) === -1) {
      return false;
    }
  }
  return true;
}


function getRadioValue(groupName) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}


function setRadioValue(groupName, value) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === value);
  }
}



function containsText(text, keyword) {
  return String(text).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
}



function findIndexById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return -1;
}


function removeAt(list, index) {
  return list.slice(0, index).concat(list.slice(index + 1));
}


function nextId(prefix, list) {
  let biggest = 0;
  let digits = 3;
  for (let i = 0; i < list.length; i++) {
    let numberText = list[i].id.slice(prefix.length + 1);   // "U-007" -> "007"
    digits = numberText.length;
    if (Number(numberText) > biggest) {
      biggest = Number(numberText);
    }
  }

  // Add zeros at the front until the number has enough digits: 8 -> "008"
  let newNumber = String(biggest + 1);
  while (newNumber.length < digits) {
    newNumber = "0" + newNumber;
  }
  return prefix + "-" + newNumber;
}





function todayString() {
  let now = new Date();
  let month = now.getMonth() + 1;          
  let day = now.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return now.getFullYear() + "-" + month + "-" + day;
}


function addDays(dateText, days) {
  let date = new Date(dateText + "T00:00");   // T00:00 = midnight, local time
  date.setDate(date.getDate() + days);
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return date.getFullYear() + "-" + month + "-" + day;
}


function daysBetween(firstDate, secondDate) {
  let oneDay = 1000 * 60 * 60 * 24;          // milliseconds in one day
  let difference = new Date(secondDate + "T00:00") - new Date(firstDate + "T00:00");
  return Math.round(difference / oneDay);
}

// The current date and time as "YYYY-MM-DD HH:MM" (for the activity log)
function nowString() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  return todayString() + " " + hours + ":" + minutes;
}


function saveData() {
  localStorage.setItem("eventnestOrgUsers", JSON.stringify(users));
  localStorage.setItem("eventnestOrgEvents", JSON.stringify(events));
  localStorage.setItem("eventnestOrgBookings", JSON.stringify(bookings));
}


function getQueryValue(name) {
  let query = window.location.search.slice(1);          // remove the "?"
  let pairs = query.split("&");
  for (let i = 0; i < pairs.length; i++) {
    let parts = pairs[i].split("=");
    if (parts[0] === name && parts.length > 1) {
      return decodeURIComponent(parts[1].replace("+", " "));
    }
  }
  return "";
}



function getBookedSeats(eventId) {
  let booked = [];
  for (const booking of bookings) {
    if (booking.eventId === eventId && booking.status !== "Cancelled") {
      booked = booked.concat(booking.seats);
    }
  }
  return booked;
}

// Number of seats in the hall = rows x seats in each row
function totalSeats(event) {
  return event.rows * event.seatsPerRow;
}

function seatsLeft(event) {
  return totalSeats(event) - getBookedSeats(event.id).length;
}

// The letter of a row: 0 -> "A", 1 -> "B" ...
function rowLetter(rowNumber) {
  return "ABCDEFGHIJ".charAt(rowNumber);
}

// All the bookings of one event (used by the Organizer pages)
function getEventBookings(eventId) {
  let list = [];
  for (const booking of bookings) {
    if (booking.eventId === eventId) {
      list.push(booking);
    }
  }
  return list;
}

// The organization name of an organizer user ("" if the user is not found)
function getOrganizationName(userId) {
  let index = findIndexById(users, userId);
  if (index === -1) {
    return "";
  }
  return users[index].organization;
}

// The badge colour of a booking status
function bookingStatusColor(status) {
  switch (status) {
    case "Approved":
      return "green";
    case "Cancelled":
      return "red";
    default:
      return "orange";      // Pending
  }
}

// true when the event date is before today
function isPastEvent(event) {
  return daysBetween(todayString(), event.date) < 0;
}



function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}


function getOrganizerEvents(organization) {
  let list = [];
  for (const event of events) {
    if (event.organizer === organization) {
      list.push(event);
    }
  }
  return list;
}


function expectedGuests(eventId) {
  let total = 0;
  for (const booking of getEventBookings(eventId)) {
    if (booking.status === "Approved") {
      total += booking.seats.length;
    }
  }
  return total;
}

// Seats (guests) of the Approved bookings that are already checked in
function checkedInGuests(eventId) {
  let total = 0;
  for (const booking of getEventBookings(eventId)) {
    if (booking.status === "Approved" && booking.checkedIn === true) {
      total += booking.seats.length;
    }
  }
  return total;
}


function approvedRevenue(eventId) {
  let total = 0;
  for (const booking of getEventBookings(eventId)) {
    if (booking.status === "Approved") {
      total += booking.total;
    }
  }
  return total;
}


function targetPercent(event) {
  let target = Number(event.revenueTarget);
  if (isNaN(target) || target <= 0) {
    return 0;
  }
  let revenue = Number(approvedRevenue(event.id));
  return Math.round((revenue / target) * 100);
}


function isFrontRowBooking(booking) {
  if (booking.status === "Cancelled") {
    return false;
  }
  for (const seat of booking.seats) {
    if (seat.charAt(0).toUpperCase() === "A") {
      return true;
    }
  }
  return false;
}

function hasSplitSeats(booking) {
  if (booking.status === "Cancelled" || booking.seats.length < 2) {
    return false;
  }
  let row = booking.seats[0].charAt(0).toUpperCase();
  let numbers = [];
  for (const seat of booking.seats) {
    if (seat.charAt(0).toUpperCase() !== row) {
      return true;
    }
    numbers.push(Number(seat.slice(1)));
  }
  numbers.sort(function(a, b) { return a - b; });
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] - numbers[i - 1] !== 1) {
      return true;
    }
  }
  return false;
}

function getConflictingSeats(booking) {
  if (booking.status === "Cancelled") {
    return [];
  }
  let conflicts = [];
  for (const other of bookings) {
    if (other.id !== booking.id && other.eventId === booking.eventId && other.status !== "Cancelled") {
      for (const seat of booking.seats) {
        if (other.seats.indexOf(seat) !== -1 && conflicts.indexOf(seat) === -1) {
          conflicts.push(seat);
        }
      }
    }
  }
  return conflicts;
}

function bookingSeatFlags(booking) {
  let html = "";
  let conflicts = getConflictingSeats(booking);
  if (conflicts.length > 0) {
    html += "<span class='badge red' title='Overlapping seat(s): " + conflicts.join(", ") + "'>Seat Clash (" + conflicts.join(", ") + ")</span> ";
  }
  if (isFrontRowBooking(booking)) {
    html += "<span class='badge blue'>Front Row</span> ";
  }
  if (hasSplitSeats(booking)) {
    html += "<span class='badge orange'>Split Seats</span>";
  }
  if (html === "") {
    return "<span class='hint'>Standard</span>";
  }
  return html;
}

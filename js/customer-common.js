/* =====================================================================
   customer-common.js  -  Helper functions shared by every page
   ---------------------------------------------------------------------
   Loaded after customer-data.js and before each page's own script:
     <script src="js/customer-data.js"></script>
     <script src="js/customer-common.js"></script>
     <script src="js/customer-events.js"></script>
   An external .js file contains only JavaScript, no <script> tags.
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. SHOW ONE SECTION AT A TIME
   Each dashboard page declares an array called "sections" with the ids
   of its sections. Clicking a menu button calls showSection("id").
   We change the CSS with the DOM:  element.style.display = "block"
   --------------------------------------------------------------------- */
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


/* ---------------------------------------------------------------------
   2. SHOWING AND CLEARING ERRORS
   Every field has a <span class="error" id="fieldIdError"></span>
   next to it. We write the message with innerHTML and colour the
   field's border red with element.style (Lab 04, Task 1).
   --------------------------------------------------------------------- */
function showError(fieldId, message) {
  document.getElementById(fieldId + "Error").innerHTML = message;

  // Radio-button groups have no single element with this id, so check first
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "2px solid red";
  }
}

function clearError(fieldId) {
  document.getElementById(fieldId + "Error").innerHTML = "";

  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "";   // "" gives the border back to the CSS file
  }
}

// Clears the errors of many fields at once; fieldIds is an array
function clearErrors(fieldIds) {
  for (let i = 0; i < fieldIds.length; i++) {
    clearError(fieldIds[i]);
  }
}


/* ---------------------------------------------------------------------
   3. MESSAGE BOXES
   type is "success", "error" or "info" (these are CSS classes)
   --------------------------------------------------------------------- */
function showMessage(boxId, text, type) {
  let box = document.getElementById(boxId);
  box.innerHTML = text;
  box.className = "message " + type;
  box.style.display = "block";
}

function hideMessage(boxId) {
  document.getElementById(boxId).style.display = "none";
}


/* ---------------------------------------------------------------------
   4. SMALL VALIDATION HELPERS
   Each returns true or false, so they can be used inside if ( ... )
   --------------------------------------------------------------------- */

// true when the user typed nothing (or only spaces)
function isEmpty(value) {
  return value.trim() === "";
}

// A simple e-mail check: something@something.something
function isValidEmail(email) {
  let atPosition = email.indexOf("@");
  let dotPosition = email.indexOf(".", atPosition);

  if (atPosition < 1) {
    return false;                       // no @, or @ is the first character
  }
  if (dotPosition < atPosition + 2) {
    return false;                       // no dot after the @
  }
  if (dotPosition === email.length - 1) {
    return false;                       // the dot is the last character
  }
  return true;
}

// true when every character of text is a digit 0-9
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

// Returns the value of the ticked radio button in a group, or "" if none
// (Lecture 01: document.getElementsByName("Gender"))
function getRadioValue(groupName) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}

// Ticks the radio button whose value matches (used when editing a record)
function setRadioValue(groupName, value) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === value);
  }
}


/* ---------------------------------------------------------------------
   5. SEARCH HELPER
   true when "text" contains "keyword", ignoring upper/lower case.
   Uses the string methods toLowerCase() and indexOf() from Lecture 03.
   --------------------------------------------------------------------- */
function containsText(text, keyword) {
  return String(text).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
}


/* ---------------------------------------------------------------------
   6. ARRAY HELPERS
   --------------------------------------------------------------------- */

// Finds the position (index) of the object whose id matches, or -1
function findIndexById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Returns a NEW array without the element at "index".
// slice() copies part of an array and concat() joins two arrays (Lecture 05).
function removeAt(list, index) {
  return list.slice(0, index).concat(list.slice(index + 1));
}

// Makes the next id, e.g. nextId("B", books) gives "B-111"
// and nextId("U", users) gives "U-008" (same number of digits as the others).
// It looks for the biggest number already used and adds 1.
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


/* ---------------------------------------------------------------------
   7. DATE HELPERS
   Dates are kept as text "YYYY-MM-DD", like <input type="date"> gives.
   Date is a built-in JavaScript object; here we only use it to count days.
   --------------------------------------------------------------------- */

// Today's date as "YYYY-MM-DD"
function todayString() {
  let now = new Date();
  let month = now.getMonth() + 1;          // months count from 0
  let day = now.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return now.getFullYear() + "-" + month + "-" + day;
}

// Adds "days" to a date text and returns the new date text
function addDays(dateText, days) {
  let date = new Date(dateText + "T00:00");   // T00:00 = midnight, local time
  date.setDate(date.getDate() + days);
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return date.getFullYear() + "-" + month + "-" + day;
}

// Number of days from firstDate to secondDate (negative if secondDate is earlier)
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

/* ---------------------------------------------------------------------
   8. SAVE DATA AND READ THE ADDRESS (URL)
   --------------------------------------------------------------------- */

// Writes the arrays into localStorage so the next page can read them
// (the arrays are loaded again at the end of customer-data.js)
function saveData() {
  localStorage.setItem("eventnestUsers", JSON.stringify(users));
  localStorage.setItem("eventnestBookings", JSON.stringify(bookings));
  localStorage.setItem("eventnestFavorites", JSON.stringify(favoriteEvents));
}

// Reads a value from the address of the page.
// getQueryValue("id") on  booking.html?id=E-101  gives "E-101" ("" if missing)
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


/* ---------------------------------------------------------------------
   9. EVENT AND SEAT HELPERS
   --------------------------------------------------------------------- */

// All the seats of an event that are already booked, e.g. ["A1", "A2", "B5"]
function getBookedSeats(eventId) {
  let booked = [];
  for (const booking of bookings) {
    if (booking.eventId === eventId) {
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

// true when the event date is before today
function isPastEvent(event) {
  return daysBetween(todayString(), event.date) < 0;
}

// true when this customer clicked the heart of this event
function isFavorite(customerId, eventId) {
  for (const favorite of favoriteEvents) {
    if (favorite.customerId === customerId && favorite.eventId === eventId) {
      return true;
    }
  }
  return false;
}


/* ---------------------------------------------------------------------
   10. EVENT CARD (used by events.html)
   withHeart is true on events.html, where a customer can click the heart.
   currentCustomerId is declared in the page's own script when needed.
   --------------------------------------------------------------------- */
function buildEventCard(event, withHeart) {
  let past = isPastEvent(event);
  let left = seatsLeft(event);

  // A heart button: filled and red when it is a favourite, empty when not
  let heart = "";
  if (withHeart) {
    if (isFavorite(currentCustomerId, event.id)) {
      heart = "<button type='button' class='heart-btn liked' title='Remove from favourites' onclick=\"toggleFavorite('" + event.id + "')\">&#9829;</button>";
    } else {
      heart = "<button type='button' class='heart-btn' title='Add to favourites' onclick=\"toggleFavorite('" + event.id + "')\">&#9825;</button>";
    }
  }

  // Status text: finished, sold out or seats left
  let status;
  if (past) {
    status = "<span class='badge grey'>Finished</span>";
  } else if (left === 0) {
    status = "<span class='badge red'>Sold out</span>";
  } else {
    status = "<span class='badge green'>" + left + " seats left</span>";
  }

  let bookButton = "";
  if (past === false && left > 0) {
    bookButton = "<a href='booking.html?id=" + event.id + "' class='btn btn-small'>Book Now</a>";
  }

  return "<div class='event-card'>" +
           "<div class='event-top " + event.category.toLowerCase() + "'>" +
             "<strong>" + event.category + "</strong>" + heart +
           "</div>" +
           "<div class='event-body'>" +
             "<h3>" + event.title + "</h3>" +
             "<p class='hint'>" + event.date + " &middot; " + event.time + "</p>" +
             "<p>" + event.venue + ", " + event.city + "</p>" +
             "<p><span class='event-price'>" + event.price + " Tk</span> " + status + "</p>" +
             bookButton +
           "</div>" +
         "</div>";
}

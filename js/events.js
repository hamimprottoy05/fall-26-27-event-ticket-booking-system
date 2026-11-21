
const currentOrganizerId = "U-002";
const currentOrganization = getOrganizationName(currentOrganizerId);

let editEventIndex = -1;          

const eventFields = ["eventTitle", "eventCategory", "eventDate", "eventTime", "eventVenue",
                     "eventCity", "eventPrice", "eventRows", "eventSeatsPerRow", "eventDescription"];



function toAmPm(time24) {
  let hours = Number(time24.slice(0, 2));
  let minutes = time24.slice(3, 5);
  let suffix = (hours >= 12) ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  return hours + ":" + minutes + " " + suffix;
}


function to24Hour(timeText) {
  let parts = timeText.split(" ");
  let clock = parts[0].split(":");
  let hours = Number(clock[0]);

  if (parts[1] === "PM" && hours < 12) {
    hours = hours + 12;
  }
  if (parts[1] === "AM" && hours === 12) {
    hours = 0;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  return hours + ":" + clock[1];
}


function seatOutsideLayout(seatId, rows, seatsPerRow) {
  let rowNumber = "ABCDEFGHIJ".indexOf(seatId.charAt(0));    // "C" -> 2
  let seatNumber = Number(seatId.slice(1));                  // "C4" -> 4
  return rowNumber >= rows || seatNumber > seatsPerRow;
}


function eventUsedByOther(title, date) {
  for (let i = 0; i < events.length; i++) {
    if (i !== editEventIndex && events[i].organizer === currentOrganization &&
        events[i].title.toLowerCase() === title.toLowerCase() && events[i].date === date) {
      return true;
    }
  }
  return false;
}


function countDescriptionCharacters() {
  let length = document.getElementById("eventDescription").value.length;
  let counter = document.getElementById("descriptionCounter");
  counter.innerHTML = length + " / 200";
  counter.style.color = length > 200 ? "#C62828" : "";
}



function renderEvents() {
  let keyword = document.getElementById("eventSearch").value;
  let category = document.getElementById("eventCategoryFilter").value;
  let status = document.getElementById("eventStatusFilter").value;

  let rows = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let isMine = (event.organizer === currentOrganization);   
    if (isMine) {
      mine++;
    }

    let finished = isPastEvent(event);
    let matchesKeyword = containsText(event.title, keyword) || containsText(event.venue, keyword) ||
                         containsText(event.city, keyword) || containsText(event.id, keyword);
    let matchesCategory = (category === "All" || event.category === category);
    let matchesStatus = (status === "All") ||
                        (status === "Upcoming" && finished === false) ||
                        (status === "Finished" && finished === true);

    if (isMine && matchesKeyword && matchesCategory && matchesStatus) {
      
      let seatColor = "green";
      if (finished) {
        seatColor = "grey";
      }

      
      let actions = "<button type='button' class='btn btn-small btn-danger' onclick='deleteEvent(" + i + ")'>Delete</button>";
      if (finished === false) {
        actions = "<button type='button' class='btn btn-small' onclick='editEvent(" + i + ")'>Edit</button>" + actions;
      }

      rows += "<tr>" +
                "<td>" + event.id + "</td>" +
                "<td><strong><a href='event-details.html?id=" + event.id + "'>" + event.title + "</a></strong><br>" +
                  "<span class='badge blue'>" + event.category + "</span></td>" +
                "<td>" + event.date + "<br><span class='hint'>" + event.time + "</span></td>" +
                "<td>" + event.venue + "<br><span class='hint'>" + event.city + "</span></td>" +
                "<td>" + event.price + " Tk</td>" +
                "<td><span class='badge " + seatColor + "'>" + totalSeats(event) + " seats</span></td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No events match your search.</td></tr>";
  }

  document.getElementById("eventTableBody").innerHTML = rows;
  document.getElementById("eventCount").innerHTML = "Showing " + shown + " of " + mine + " events";
}



function saveEvent() {
  let title = document.getElementById("eventTitle").value.trim();
  let category = document.getElementById("eventCategory").value;
  let date = document.getElementById("eventDate").value;
  let time = document.getElementById("eventTime").value;
  let venue = document.getElementById("eventVenue").value.trim();
  let city = document.getElementById("eventCity").value;
  let priceText = document.getElementById("eventPrice").value;
  let rowsText = document.getElementById("eventRows").value;
  let seatsText = document.getElementById("eventSeatsPerRow").value;
  let description = document.getElementById("eventDescription").value.trim();

  let price = Number(priceText);
  let rowCount = Number(rowsText);
  let seatsPerRow = Number(seatsText);

  
  let isValid = true;
  clearErrors(eventFields);

  if (title.length < 3) {
    showError("eventTitle", "Title must be at least 3 characters.");
    isValid = false;
  } else if (title.length > 60) {
    showError("eventTitle", "Title must be 60 characters or less.");
    isValid = false;
  } else if (date !== "" && eventUsedByOther(title, date)) {
    showError("eventTitle", "You already have an event with this title on this date.");
    isValid = false;
  }

  if (category === "") {
    showError("eventCategory", "Please choose a category.");
    isValid = false;
  }

  if (date === "") {
    showError("eventDate", "Please choose the date.");
    isValid = false;
  } else if (date < todayString()) {
    showError("eventDate", "The date cannot be in the past.");
    isValid = false;
  }

  if (time === "") {
    showError("eventTime", "Please choose the time.");
    isValid = false;
  }

  if (venue.length < 3) {
    showError("eventVenue", "Venue must be at least 3 characters.");
    isValid = false;
  }

  if (city === "") {
    showError("eventCity", "Please choose a city.");
    isValid = false;
  }

  if (priceText === "" || price < 50 || price > 10000) {
    showError("eventPrice", "Price must be between 50 and 10000 Tk.");
    isValid = false;
  }

  if (rowsText === "" || rowCount < 1 || rowCount > 10) {
    showError("eventRows", "Rows must be between 1 and 10.");
    isValid = false;
  }

  if (seatsText === "" || seatsPerRow < 1 || seatsPerRow > 20) {
    showError("eventSeatsPerRow", "Seats per row must be between 1 and 20.");
    isValid = false;
  }

  
  if (isValid && editEventIndex !== -1) {
    let bookedSeats = getBookedSeats(events[editEventIndex].id);
    for (const seatId of bookedSeats) {
      if (seatOutsideLayout(seatId, rowCount, seatsPerRow)) {
        showError("eventRows", "Seat " + seatId + " is already booked, so the hall cannot be this small.");
        isValid = false;
        break;
      }
    }
  }

  if (description.length < 10) {
    showError("eventDescription", "Please write at least 10 characters.");
    isValid = false;
  } else if (description.length > 200) {
    showError("eventDescription", "Please keep it under 200 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

 
  if (editEventIndex === -1) {
    
    let newEvent = { id: nextId("E", events), title: title, category: category, date: date, time: toAmPm(time),
                     venue: venue, city: city, price: price, rows: rowCount, seatsPerRow: seatsPerRow,
                     organizer: currentOrganization, description: description };
    events.push(newEvent);
    showMessage("eventMessage", "<strong>" + title + "</strong> was created with id " + newEvent.id + ".", "success");
  } else {
    
    let event = events[editEventIndex];
    event.title = title;
    event.category = category;
    event.date = date;
    event.time = toAmPm(time);
    event.venue = venue;
    event.city = city;
    event.price = price;
    event.rows = rowCount;
    event.seatsPerRow = seatsPerRow;
    event.description = description;

    
    for (const booking of getEventBookings(event.id)) {
      booking.title = title;
    }
    showMessage("eventMessage", "<strong>" + title + "</strong> was updated.", "success");
  }

  saveData();
  resetEventForm();
  renderEvents();
  return false;
}



function editEvent(index) {
  let event = events[index];
  editEventIndex = index;

  document.getElementById("eventTitle").value = event.title;
  document.getElementById("eventCategory").value = event.category;
  document.getElementById("eventDate").value = event.date;
  document.getElementById("eventTime").value = to24Hour(event.time);
  document.getElementById("eventVenue").value = event.venue;
  document.getElementById("eventCity").value = event.city;
  document.getElementById("eventPrice").value = event.price;
  document.getElementById("eventRows").value = event.rows;
  document.getElementById("eventSeatsPerRow").value = event.seatsPerRow;
  document.getElementById("eventDescription").value = event.description;
  countDescriptionCharacters();

  document.getElementById("eventFormTitle").innerHTML = "Edit Event " + event.id;
  document.getElementById("eventSaveButton").value = "Update Event";
  hideMessage("eventMessage");
}



function deleteEvent(index) {
  let event = events[index];

  if (getEventBookings(event.id).length > 0) {
    showMessage("eventMessage", "<strong>" + event.title + "</strong> cannot be deleted: it already has bookings.", "error");
    return;
  }

  if (confirm("Delete the event \"" + event.title + "\"?") === false) {
    return;
  }

  events = removeAt(events, index);
  saveData();
  showMessage("eventMessage", "<strong>" + event.title + "</strong> was deleted.", "info");
  resetEventForm();
  renderEvents();
}


function resetEventForm() {
  editEventIndex = -1;
  document.getElementById("eventForm").reset();
  clearErrors(eventFields);
  countDescriptionCharacters();
  document.getElementById("eventFormTitle").innerHTML = "Create New Event";
  document.getElementById("eventSaveButton").value = "Create Event";
}



let startSearch = getQueryValue("search");
let startCategory = getQueryValue("category");
if (startSearch !== "") {
  document.getElementById("eventSearch").value = startSearch;
}
if (startCategory !== "") {
  document.getElementById("eventCategoryFilter").value = startCategory;
}

document.getElementById("eventsSection").style.display = "block";   
renderEvents();

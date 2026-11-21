
const currentOrganizerId = "U-002";
const currentOrganization = getOrganizationName(currentOrganizerId);



function fillEventFilter() {
  let select = document.getElementById("bookingEventFilter");

  for (const event of events) {
    if (event.organizer === currentOrganization) {
      let option = document.createElement("option");
      option.value = event.id;
      option.innerHTML = event.title + " (" + event.date + ")";
      select.appendChild(option);
    }
  }
}



function renderBookings() {
  let keyword = document.getElementById("bookingSearch").value;
  let eventFilter = document.getElementById("bookingEventFilter").value;
  let statusFilter = document.getElementById("bookingStatusFilter").value;
  let flagFilter = document.getElementById("bookingFlagFilter").value;

  let rows = "";
  let shown = 0;
  let mine = 0;
  let frontRowCount = 0;
  let splitSeatCount = 0;
  let clashCount = 0;

  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    let event = events[findIndexById(events, booking.eventId)];
    let isMine = (event !== undefined && event.organizer === currentOrganization);   
    if (isMine) {
      mine++;
    }

    
    let frontRow = isMine && isFrontRowBooking(booking);
    let splitSeats = isMine && hasSplitSeats(booking);
    let clashes = isMine ? getConflictingSeats(booking) : [];
    let hasClash = clashes.length > 0;

    if (frontRow) {
      frontRowCount++;
    }
    if (splitSeats) {
      splitSeatCount++;
    }
    if (hasClash) {
      clashCount++;
    }

    let matchesFlag = (flagFilter === "All") ||
                      (flagFilter === "FrontRow" && frontRow) ||
                      (flagFilter === "SplitSeats" && splitSeats) ||
                      (flagFilter === "SeatClash" && hasClash);

    let matchesKeyword = isMine && (containsText(booking.id, keyword) || containsText(event.title, keyword) ||
                         containsText(booking.holderName, keyword) || containsText(booking.seats.join(" "), keyword));
    let matchesEvent = (eventFilter === "All" || booking.eventId === eventFilter);
    let matchesStatus = (statusFilter === "All" || booking.status === statusFilter);

    if (isMine && matchesKeyword && matchesEvent && matchesStatus && matchesFlag) {
     
      let actions = "<span class='hint'>No action</span>";
      if (isPastEvent(event) === false) {
        actions = "";
        if (booking.status === "Pending") {
          actions += "<button type='button' class='btn btn-small btn-success' onclick='approveBooking(" + i + ")'>Approve</button>";
        }
        if (booking.status !== "Cancelled") {
          actions += "<button type='button' class='btn btn-small btn-danger' onclick='cancelBooking(" + i + ")'>Cancel</button>";
        }
        if (actions === "") {
          actions = "<span class='hint'>No action</span>";
        }
      }

      rows += "<tr>" +
                "<td>" + booking.id + "</td>" +
                "<td><strong>" + event.title + "</strong><br><span class='hint'>" + event.date + "</span></td>" +
                "<td>" + booking.holderName + "<br><span class='hint'>" + booking.phone + "</span></td>" +
                "<td>" + booking.seats.join(", ") + "</td>" +
                "<td>" + booking.total + " Tk</td>" +
                "<td>" + booking.bookedOn + "</td>" +
                "<td>" + bookingSeatFlags(booking) + "</td>" +
                "<td><span class='badge " + bookingStatusColor(booking.status) + "'>" + booking.status + "</span></td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='9' class='empty-row'>No bookings match your search.</td></tr>";
  }

  document.getElementById("bookingTableBody").innerHTML = rows;
  document.getElementById("bookingCount").innerHTML = "Showing " + shown + " of " + mine + " bookings";
  document.getElementById("statFrontRow").innerHTML = frontRowCount;
  document.getElementById("statSplitSeats").innerHTML = splitSeatCount;
  document.getElementById("statSeatClash").innerHTML = clashCount;
}



function approveBooking(index) {
  let booking = bookings[index];
  let clashes = getConflictingSeats(booking);
  if (clashes.length > 0) {
    showMessage("bookingMessage", "Cannot approve booking <strong>" + booking.id + "</strong> because seat(s) <strong>" +
                clashes.join(", ") + "</strong> clash with another active booking. Cancel the conflicting booking first.", "error");
    return;
  }

  booking.status = "Approved";
  saveData();

  showMessage("bookingMessage", "Booking <strong>" + booking.id + "</strong> of " + booking.holderName + " was approved.", "success");
  renderBookings();
}

function cancelBooking(index) {
  let booking = bookings[index];
  booking.status = "Cancelled";          
  saveData();

  showMessage("bookingMessage", "Booking <strong>" + booking.id + "</strong> of " + booking.holderName +
              " was cancelled. Seat(s) " + booking.seats.join(", ") + " are free again.", "info");
  renderBookings();
}



fillEventFilter();
renderBookings();

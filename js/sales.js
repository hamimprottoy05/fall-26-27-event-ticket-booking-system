/* =====================================================================
   sales.js  -  Ticket sales and revenue (sales.html)
   ---------------------------------------------------------------------
   Sales report : tickets sold = the seats of every Approved booking
                  revenue      = the total of every Approved booking
   Unique 2     : Revenue Target Progress Bar
     saveTarget()          : the organizer sets the income target of an event
     removeTarget()        : clears the target
     renderTargetProgress(): a progress bar of Approved revenue / target
   ===================================================================== */

// The organizer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentOrganizerId = "U-002";
const currentOrganization = getOrganizationName(currentOrganizerId);


/* =====================================================================
   UNIQUE 2: REVENUE TARGET PROGRESS BAR
   ===================================================================== */

// Fills the drop-down with this organizer's events (createElement)
function fillTargetEvents() {
  let select = document.getElementById("targetEvent");
  for (const event of getOrganizerEvents(currentOrganization)) {
    let option = document.createElement("option");
    option.value = event.id;
    option.innerHTML = event.title + " (" + event.date + ")";
    select.appendChild(option);
  }
}

// When an event is chosen, show its current target in the box
function showCurrentTarget() {
  let eventId = document.getElementById("targetEvent").value;
  clearErrors(["targetEvent", "targetAmount"]);
  hideMessage("targetMessage");

  let amountBox = document.getElementById("targetAmount");
  let hint = document.getElementById("targetHint");
  if (eventId === "") {
    amountBox.value = "";
    hint.innerHTML = "";
    return;
  }

  let event = events[findIndexById(events, eventId)];
  if (event.revenueTarget > 0) {
    amountBox.value = event.revenueTarget;
    hint.innerHTML = "Current target: " + event.revenueTarget + " Tk";
  } else {
    amountBox.value = "";
    hint.innerHTML = "No target set yet.";
  }
}

function saveTarget() {
  let eventId = document.getElementById("targetEvent").value;
  let amountText = document.getElementById("targetAmount").value;
  let amount = Number(amountText);

  clearErrors(["targetEvent", "targetAmount"]);
  hideMessage("targetMessage");

  // ----- Validation -----
  let isValid = true;
  if (eventId === "") {
    showError("targetEvent", "Please choose an event.");
    isValid = false;
  }
  if (amountText === "") {
    showError("targetAmount", "Please type the target amount.");
    isValid = false;
  } else if (amount < 100 || amount > 10000000) {
    showError("targetAmount", "Target must be between 100 and 10000000 Tk.");
    isValid = false;
  } else if (amount !== Math.floor(amount)) {
    showError("targetAmount", "Please use a whole number (no decimals).");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  let event = events[findIndexById(events, eventId)];
  event.revenueTarget = amount;
  saveData();

  showCurrentTarget();                 // refreshes the box (it also hides old messages)
  showMessage("targetMessage", "Target of <strong>" + event.title + "</strong> is now <strong>" + amount + " Tk</strong>.", "success");
  generateSalesReport();
  return false;
}

function removeTarget() {
  let eventId = document.getElementById("targetEvent").value;
  clearErrors(["targetEvent", "targetAmount"]);

  if (eventId === "") {
    showError("targetEvent", "Please choose an event.");
    return;
  }

  let event = events[findIndexById(events, eventId)];
  if (!(event.revenueTarget > 0)) {
    showMessage("targetMessage", "<strong>" + event.title + "</strong> has no target to remove.", "info");
    return;
  }

  event.revenueTarget = 0;
  saveData();
  showCurrentTarget();
  showMessage("targetMessage", "The target of <strong>" + event.title + "</strong> was removed.", "info");
  generateSalesReport();
}

// One progress bar for every event of this organizer
function renderTargetProgress() {
  let html = "";

  for (const event of getOrganizerEvents(currentOrganization)) {
    let revenue = Number(approvedRevenue(event.id));
    let target = Number(event.revenueTarget);
    let line = "";

    if (target > 0) {
      let percent = targetPercent(event);
      let width = percent > 100 ? 100 : percent;       // the bar never goes outside its box
      let color = percent >= 100 ? "#2E7D32" : "#663399";
      let status = percent >= 100 ? "<span class='badge green'>Target reached</span>"
                                  : "<span class='hint'>" + (target - revenue) + " Tk to go</span>";

      line = "<div class='progress-track'>" +
               "<div class='progress-fill' style='width:" + width + "%; background-color:" + color + "'>" + percent + "%</div>" +
             "</div>" +
             "<p class='hint'>" + revenue + " Tk of " + event.revenueTarget + " Tk &middot; " + status + "</p>";
    } else {
      line = "<p class='hint'>No target set. Revenue so far: " + revenue + " Tk. Choose this event above to set one.</p>";
    }

    html += "<div class='target-item'><strong>" + event.title + "</strong> <span class='hint'>" + event.id + " &middot; " + event.date + "</span>" + line + "</div>";
  }

  if (html === "") {
    html = "<p class='empty-row'>You have no events yet.</p>";
  }
  document.getElementById("targetProgressList").innerHTML = html;
}


function generateSalesReport() {
  let eventCount = 0;
  let totalTickets = 0;
  let totalRevenue = 0;
  let rows = "";

  for (const event of events) {
    if (event.organizer === currentOrganization) {
      eventCount++;

      // Count this event's bookings by status
      let sold = 0;
      let revenue = 0;

      for (const booking of getEventBookings(event.id)) {
        if (booking.status === "Approved") {
          sold += booking.seats.length;
          revenue += booking.total;
        }
      }

      totalTickets += sold;
      totalRevenue += revenue;

      // Percentage of the seats that are sold
      let percent = Math.round(sold / totalSeats(event) * 100);

      rows += "<tr>" +
                "<td><strong>" + event.title + "</strong><br><span class='hint'>" + event.id + "</span></td>" +
                "<td>" + event.date + "</td>" +
                "<td>" + event.price + " Tk</td>" +
                "<td><span class='badge green'>" + sold + "</span></td>" +
                "<td>" + sold + " / " + totalSeats(event) + " (" + percent + "%)</td>" +
                "<td><strong>" + revenue + " Tk</strong></td>" +
              "</tr>";
    }
  }

  if (rows === "") {
    rows = "<tr><td colspan='6' class='empty-row'>You have no events yet.</td></tr>";
  } else {
    // A last row with the totals
    rows += "<tr>" +
              "<td colspan='3'><strong>Total</strong></td>" +
              "<td><strong>" + totalTickets + "</strong></td>" +
              "<td></td>" +
              "<td><strong>" + totalRevenue + " Tk</strong></td>" +
            "</tr>";
  }

  document.getElementById("statEvents").innerHTML = eventCount;
  document.getElementById("statTickets").innerHTML = totalTickets;
  document.getElementById("statRevenue").innerHTML = totalRevenue;
  document.getElementById("salesTableBody").innerHTML = rows;
  renderTargetProgress();
}

fillTargetEvents();
generateSalesReport();

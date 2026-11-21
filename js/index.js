/* =====================================================================
   home.js  -  The home page (index.html)
   ---------------------------------------------------------------------
   Shows the events in a table. It reads the search box (eventSearch)
   and the category list (eventCategory) and fills the table (eventBody).
   The refund rules are written from the same ticketPolicy object the
   admin changes.
   ===================================================================== */

// The ids of the navigation links (nav-home, nav-events ...)
const navNames = ["home", "events", "who", "how", "refunds", "contact"];

// The link that was clicked gets the "active" class (the underline); the others lose it
function setActiveNav(name) {
  for (let i = 0; i < navNames.length; i++) {
    let link = document.getElementById("nav-" + navNames[i]);
    if (navNames[i] === name) {
      link.className = "active";
    } else {
      link.className = "";
    }
  }
}


function renderEventList() {
  let keyword = document.getElementById("eventSearch").value;
  let category = document.getElementById("eventCategory").value;

  let rows = "";
  let shown = 0;

  for (const event of events) {
    let matchesKeyword = containsText(event.title, keyword) || containsText(event.venue, keyword) ||
                         containsText(event.organizerName, keyword);
    let matchesCategory = (category === "All" || event.category === category);

    if (matchesKeyword && matchesCategory) {
      let left = event.capacity - event.sold;
      let tickets;
      if (left > 0) {
        tickets = "<span class='badge green'>" + left + " left</span>";
      } else {
        tickets = "<span class='badge red'>Sold out</span>";
      }

      rows += "<tr>" +
                "<td><strong>" + event.title + "</strong><br><span class='hint'>by " + event.organizerName + "</span></td>" +
                "<td>" + event.category + "</td>" +
                "<td>" + event.date + "<br><span class='hint'>" + event.time + "</span></td>" +
                "<td>" + event.venue + "</td>" +
                "<td>" + money(event.price) + "</td>" +
                "<td>" + tickets + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No events match your search.</td></tr>";
  }

  document.getElementById("eventBody").innerHTML = rows;
  document.getElementById("eventCount").innerHTML = shown + " event(s) found";
}


// The refund rules, written from the ticketPolicy object
function renderRefundPolicy() {
  document.getElementById("refundList").innerHTML =
    "<li>Cancel <strong>" + ticketPolicy.fullRefundDays + " or more days</strong> before the event: full refund (the " +
      ticketPolicy.serviceFeePercent + "% service fee is kept).</li>" +
    "<li>Cancel <strong>" + ticketPolicy.partialRefundDays + " to " + (ticketPolicy.fullRefundDays - 1) +
      " days</strong> before: " + ticketPolicy.partialRefundPercent + "% of the refundable amount.</li>" +
    "<li>Cancel later than that: no refund.</li>" +
    "<li>Booking closes " + ticketPolicy.closeHours + " hour(s) before the event starts.</li>";
}

// Draw everything when the page first opens
renderEventList();
renderRefundPolicy();
applySiteName();

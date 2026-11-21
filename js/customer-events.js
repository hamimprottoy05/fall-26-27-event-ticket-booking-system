/* =====================================================================
   customer-events.js  -  Browse events and favourites (events.html)
   ---------------------------------------------------------------------
   Read + Search : renderEvents()
   Unique 3      : Favourite events (heart button) with toggleFavorite()
                   and renderFavorites()
   ===================================================================== */

const sections = ["allSection", "favSection"];

// The customer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentCustomerId = "U-003";


/* =====================================================================
   READ + SEARCH
   The search box and the category list both call this function.
   ===================================================================== */
function renderEvents() {
  let keyword = document.getElementById("eventSearch").value;
  let category = document.getElementById("eventCategory").value;

  let html = "";
  let shown = 0;

  for (const event of events) {
    let matchesKeyword = containsText(event.title, keyword) || containsText(event.venue, keyword) ||
                         containsText(event.city, keyword);
    let matchesCategory = (category === "All" || event.category === category);

    if (matchesKeyword && matchesCategory) {
      html += buildEventCard(event, true);
      shown++;
    }
  }

  if (shown === 0) {
    html = "<p class='empty-row'>No events match your search.</p>";
  }

  document.getElementById("eventGrid").innerHTML = html;
  document.getElementById("eventCount").innerHTML = shown + " event(s) found";
}


/* =====================================================================
   UNIQUE FEATURE 3: FAVOURITE EVENTS
   Clicking the heart adds the event to favoriteEvents (push) or
   removes it (removeAt). saveData() keeps it for the next visit.
   ===================================================================== */
function toggleFavorite(eventId) {
  let position = -1;

  for (let i = 0; i < favoriteEvents.length; i++) {
    if (favoriteEvents[i].customerId === currentCustomerId && favoriteEvents[i].eventId === eventId) {
      position = i;
    }
  }

  if (position === -1) {
    favoriteEvents.push({ customerId: currentCustomerId, eventId: eventId });
  } else {
    favoriteEvents = removeAt(favoriteEvents, position);
  }

  saveData();
  console.log("Favourites:", favoriteEvents);
  renderEvents();
  renderFavorites();
}

function renderFavorites() {
  let html = "";
  let count = 0;

  for (const event of events) {
    if (isFavorite(currentCustomerId, event.id)) {
      html += buildEventCard(event, true);
      count++;
    }
  }

  if (count === 0) {
    html = "<p class='empty-row'>You have no favourite events yet. Click the heart on an event to save it here.</p>";
    document.getElementById("favSummary").innerHTML = "Events you save with the heart button appear here.";
  } else {
    document.getElementById("favSummary").innerHTML = "You have " + count + " favourite event(s).";
  }

  document.getElementById("favGrid").innerHTML = html;
}


/* =====================================================================
   START
   ===================================================================== */
renderEvents();
renderFavorites();
showSection("allSection");

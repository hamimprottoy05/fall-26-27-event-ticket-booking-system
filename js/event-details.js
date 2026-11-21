


const currentOrganizerId = "U-002";
const currentOrganization = getOrganizationName(currentOrganizerId);

function showEventDetails() {
  let index = findIndexById(events, getQueryValue("id"));

  if (index === -1 || events[index].organizer !== currentOrganization) {
    document.getElementById("detailSection").style.display = "none";
    showMessage("detailMessage", "This event was not found in your events. <a href='events.html'>See my events</a>.", "error");
    return;
  }

  let event = events[index];

  document.getElementById("detailSection").style.display = "block";   
  document.getElementById("detailCategory").innerHTML = event.category;
  document.getElementById("detailTitle").innerHTML = event.title;
  document.getElementById("detailDescription").innerHTML = event.description;
  document.getElementById("detailId").innerHTML = event.id;
  document.getElementById("detailDate").innerHTML = event.date;
  document.getElementById("detailTime").innerHTML = event.time;
  document.getElementById("detailVenue").innerHTML = event.venue + ", " + event.city;
  document.getElementById("detailLayout").innerHTML = event.rows + " rows x " + event.seatsPerRow + " seats";
  document.getElementById("detailPrice").innerHTML = event.price + " Tk";
  document.getElementById("detailSeats").innerHTML = "Hall capacity: " + totalSeats(event) + " seats.";
}

showEventDetails();

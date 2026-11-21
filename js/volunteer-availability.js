/* =====================================================================
   volunteer-availability.js  -  Availability (availability.html)
   ---------------------------------------------------------------------
   CRUD : the volunteer's availabilities array
     Create  -> saveAvailability()   (a new record is push()ed)
     Read    -> renderAvailability()
     Update  -> editAvailability() + saveAvailability()
     Delete  -> deleteAvailability()
   The dates of a record are chosen one by one with addDate() / removeDate().
   ===================================================================== */

// The volunteer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentVolunteerId = "U-006";

let editAvailabilityIndex = -1;   // -1 = adding a new record, otherwise the position of the record being edited
let selectedDates = [];           // the dates chosen in the form, e.g. ["2026-11-27", "2026-11-28"]

const availabilityFields = ["dates", "slots"];


/* =====================================================================
   DATES OF THE FORM
   ===================================================================== */

// Shows the chosen dates as small chips with a x button
function renderDates() {
  let html = "";
  for (let i = 0; i < selectedDates.length; i++) {
    html += "<span class='chip'>" + selectedDates[i] +
            "<button type='button' title='Remove this date' onclick='removeDate(" + i + ")'>&times;</button></span>";
  }
  document.getElementById("dateChips").innerHTML = html;
}

function addDate() {
  let date = document.getElementById("dateInput").value;
  clearError("dates");

  if (date === "") {
    showError("dates", "Pick a date first.");
    return;
  }
  if (daysBetween(todayString(), date) < 0) {
    showError("dates", "You cannot choose a date in the past.");
    return;
  }
  if (selectedDates.indexOf(date) !== -1) {
    showError("dates", "This date is already added.");
    return;
  }

  selectedDates.push(date);
  selectedDates.sort();                       // keep the dates in order
  document.getElementById("dateInput").value = "";
  renderDates();
}

function removeDate(index) {
  selectedDates = removeAt(selectedDates, index);
  renderDates();
}

// Collects the values of every ticked checkbox in a group into an array
function getCheckedValues(groupName) {
  let boxes = document.getElementsByName(groupName);
  let selected = [];
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      selected.push(boxes[i].value);
    }
  }
  return selected;
}


/* =====================================================================
   READ (only this volunteer's records, newest first)
   ===================================================================== */
function renderAvailability() {
  let html = "";
  let count = 0;

  for (let i = availabilities.length - 1; i >= 0; i--) {
    let record = availabilities[i];

    if (record.volunteerId === currentVolunteerId) {
      let badgeColor = "green";
      if (record.status === "Unavailable") {
        badgeColor = "red";
      }

      html += "<div class='record'>" +
                "<div class='record-top'>" +
                  "<span class='badge " + badgeColor + "'>" + record.status + "</span>" +
                  "<span class='hint'>" + record.id + " &middot; updated " + record.updatedAt + "</span>" +
                "</div>" +
                "<p><strong>Dates:</strong> " + record.dates.join(", ") + "</p>";

      if (record.slots.length > 0) {
        html += "<p><strong>Time slots:</strong> " + record.slots.join(", ") + "</p>";
      }
      if (record.note !== "") {
        html += "<p><strong>Note:</strong> " + esc(record.note) + "</p>";
      }

      html += "<button type='button' class='btn btn-small' onclick='editAvailability(" + i + ")'>Edit</button>" +
              "<button type='button' class='btn btn-small btn-danger' onclick='deleteAvailability(" + i + ")'>Delete</button>" +
              "</div>";
      count++;
    }
  }

  if (count === 0) {
    html = "<p class='empty-row'>No availability saved yet. Fill in the form to add one.</p>";
  }

  document.getElementById("availabilityList").innerHTML = html;
  document.getElementById("availabilityCount").innerHTML = count + " record(s)";
}


/* =====================================================================
   CREATE + UPDATE (both use the same form)
   ===================================================================== */

// UPDATE step 1: copy the record into the form
function editAvailability(index) {
  let record = availabilities[index];
  editAvailabilityIndex = index;
  selectedDates = record.dates.slice();       // a copy, so the record changes only when Update is clicked

  setRadioValue("availStatus", record.status);
  let boxes = document.getElementsByName("slot");
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].checked = (record.slots.indexOf(boxes[i].value) !== -1);
  }
  document.getElementById("availNote").value = record.note;

  document.getElementById("availabilityFormTitle").innerHTML = "Edit Availability " + record.id;
  document.getElementById("availabilitySaveButton").value = "Update Availability";
  document.getElementById("availabilityCancelButton").innerHTML = "Cancel Edit";

  clearErrors(availabilityFields);
  hideMessage("availabilityMessage");
  renderDates();
  document.getElementById("availabilityForm").scrollIntoView();
}

// CREATE / UPDATE step 2: validate, then push() a new object or change the old one
function saveAvailability() {
  let status = getRadioValue("availStatus");
  let slots = getCheckedValues("slot");
  let note = document.getElementById("availNote").value.trim();

  let isValid = true;
  clearErrors(availabilityFields);

  if (selectedDates.length === 0) {
    showError("dates", "Add at least one date.");
    isValid = false;
  }

  // Time slots are needed only when the volunteer is available
  if (status === "Available" && slots.length === 0) {
    showError("slots", "Choose at least one time slot.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (status === "Unavailable") {
    slots = [];
  }

  if (editAvailabilityIndex === -1) {
    // ----- CREATE: build the new record object -----
    let newRecord = {
      id: nextId("A", availabilities),
      volunteerId: currentVolunteerId,
      status: status,
      dates: selectedDates.slice(),
      slots: slots,
      note: note,
      updatedAt: nowString()
    };
    availabilities.push(newRecord);
    saveData();
    console.log("New availability:", newRecord);

    showMessage("availabilityMessage", "Availability " + newRecord.id + " was saved.", "success");
  } else {
    // ----- UPDATE: change the properties of the object -----
    let record = availabilities[editAvailabilityIndex];
    record.status = status;
    record.dates = selectedDates.slice();
    record.slots = slots;
    record.note = note;
    record.updatedAt = nowString();
    saveData();

    showMessage("availabilityMessage", "Availability " + record.id + " was updated.", "success");
  }

  resetAvailabilityForm();
  renderAvailability();
  return false;
}


/* =====================================================================
   DELETE
   ===================================================================== */
function deleteAvailability(index) {
  let record = availabilities[index];

  if (confirm("Delete availability " + record.id + "?") === false) {
    return;
  }

  availabilities = removeAt(availabilities, index);
  saveData();

  showMessage("availabilityMessage", "Availability " + record.id + " was deleted.", "info");
  resetAvailabilityForm();
  renderAvailability();
}


// Empties the form and goes back to "add a new record" mode
function resetAvailabilityForm() {
  editAvailabilityIndex = -1;
  selectedDates = [];
  document.getElementById("availabilityForm").reset();
  clearErrors(availabilityFields);

  document.getElementById("availabilityFormTitle").innerHTML = "Set Availability";
  document.getElementById("availabilitySaveButton").value = "Save Availability";
  document.getElementById("availabilityCancelButton").innerHTML = "Clear Form";
  renderDates();
}


/* =====================================================================
   START
   ===================================================================== */
renderDates();
renderAvailability();

/* =====================================================================
   admin.js  -  Everything the Admin can do (admin.html)
   ---------------------------------------------------------------------
   Unique 1      : Dashboard statistics with bar charts (the work of every user type)
   CRUD + Search : Manage Users (users array), same as the library project
   Unique 2      : Ticket & Refund Policy (like "Library Rules")
   Unique 3      : Maintenance Control (a switch and the visitor's view)
   Settings      : Website name and contact details (a normal admin page)

   The forms on this page never go to another page: each onsubmit
   handler does its work with JavaScript and returns false.
   ===================================================================== */

// The ids of the sections on this page (used by showSection in common.js)
const sections = ["statsSection", "usersSection", "policySection", "maintenanceSection", "settingsSection"];

// -1 means "adding a new user"; any other number is the index being edited
let editUserIndex = -1;

// Copies of the starting values, used by the "Restore Defaults" buttons
const defaultSettings = {
  siteName: "EventNest",
  tagline: "Discover events. Book tickets. Enjoy the moment.",
  supportEmail: "support@eventnest.com",
  supportPhone: "01711000000",
  currency: "Tk"
};

const defaultPolicy = { fullRefundDays: 7, partialRefundDays: 3, partialRefundPercent: 50,
                        serviceFeePercent: 5, maxTickets: 5, closeHours: 2 };


/* =====================================================================
   UNIQUE FEATURE 1: DASHBOARD STATISTICS WITH BAR CHARTS
   Organizers create events and choose revenue targets. Customers buy tickets.
   The dashboard adds up the most important numbers with loops.
   ===================================================================== */

// The money an organizer has earned: loop over the events of that organizer
function organizerRevenue(organizerId) {
  let revenue = 0;
  for (const event of events) {
    if (event.organizerId === organizerId) {
      revenue += event.sold * event.price;
    }
  }
  return revenue;
}


function generateReport() {
  let pendingUsers = 0;
  let roleCounts = { Admin: 0, Organizer: 0, Customer: 0, Volunteer: 0 };   // an object used as counters

  // Organizers who chose a revenue target: names[i], reached[i] go together
  let organizerNames = [];
  let organizerReached = [];     // percent of the revenue target reached
  let totalTarget = 0;
  let targetRevenue = 0;         // revenue of the organizers who chose a target

  for (const user of users) {
    roleCounts[user.role]++;       // bracket notation: roleCounts["Customer"]++
    if (user.status === "Pending") {
      pendingUsers++;
    }

    // Only organizers who chose a revenue target are counted
    if (user.role === "Organizer" && user.revenueTarget !== undefined) {
      let revenue = organizerRevenue(user.id);
      organizerNames.push(user.name);
      organizerReached.push(Math.round(revenue / user.revenueTarget * 100));
      totalTarget += user.revenueTarget;
      targetRevenue += revenue;
    }
  }

  // Tickets and money of all events
  let totalSold = 0;
  let totalRevenue = 0;
  for (const event of events) {
    totalSold += event.sold;
    totalRevenue += event.sold * event.price;
  }

  let targetPercent = 0;
  if (totalTarget > 0) {
    targetPercent = Math.round(targetRevenue / totalTarget * 100);
  }

  // ----- Show the numbers with innerHTML -----
  document.getElementById("statUsers").innerHTML = users.length;
  document.getElementById("statPendingUsers").innerHTML = pendingUsers;
  document.getElementById("statEvents").innerHTML = events.length;
  document.getElementById("statTickets").innerHTML = totalSold;
  document.getElementById("statRevenue").innerHTML = money(totalRevenue);
  document.getElementById("statTarget").innerHTML = targetPercent + "%";

  // A number that needs action is shown in red (element.style)
  if (pendingUsers > 0) {
    document.getElementById("statPendingUsers").style.color = "#C62828";
  } else {
    document.getElementById("statPendingUsers").style.color = "";
  }

  // ----- Bar charts -----
  let roleNames = ["Admin", "Organizer", "Customer", "Volunteer"];
  let roleTotals = [roleCounts.Admin, roleCounts.Organizer, roleCounts.Customer, roleCounts.Volunteer];

  drawBarChart("roleChart", roleNames, roleTotals, "");
  drawBarChart("targetChart", organizerNames, organizerReached, "%");
}


// Draws simple horizontal bars. names[i] is the label of the bar with value counts[i].
// The longest bar fills the whole track; the others are a percentage of it (inline style width).
function drawBarChart(chartId, names, counts, suffix) {
  // Find the biggest value with a loop
  let biggest = 0;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > biggest) {
      biggest = counts[i];
    }
  }

  let html = "";
  for (let i = 0; i < names.length; i++) {
    let percent = 0;
    if (biggest > 0) {
      percent = Math.round(counts[i] / biggest * 100);
    }
    html += "<div class='bar-row'>" +
              "<div class='bar-label'>" + names[i] + "</div>" +
              "<div class='bar-track'><div class='bar-fill' style='width:" + percent + "%'></div></div>" +
              "<div class='bar-value'>" + counts[i] + suffix + "</div>" +
            "</div>";
  }

  if (names.length === 0) {
    html = "<p class='empty-row'>No data yet.</p>";
  }
  document.getElementById(chartId).innerHTML = html;
}


/* =====================================================================
   MANAGE USERS: CREATE, READ, UPDATE, DELETE, SEARCH
   ===================================================================== */

// READ + SEARCH: draw the table rows with a loop and innerHTML
function renderUsers() {
  let keyword = document.getElementById("userSearch").value;
  let roleFilter = document.getElementById("userRoleFilter").value;
  let statusFilter = document.getElementById("userStatusFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];

    // SEARCH: skip users that do not match the keyword or the filters
    let matchesKeyword = containsText(user.name, keyword) || containsText(user.username, keyword) ||
                         containsText(user.email, keyword) || containsText(user.id, keyword);
    let matchesRole = (roleFilter === "All" || user.role === roleFilter);
    let matchesStatus = (statusFilter === "All" || user.status === statusFilter);

    if (matchesKeyword && matchesRole && matchesStatus) {
      // A colour for each status, and an Approve button for pending accounts
      let statusColor;
      let approveButton = "";
      switch (user.status) {
        case "Active":
          statusColor = "green";
          break;
        case "Pending":
          statusColor = "orange";
          approveButton = "<button type='button' class='btn btn-small btn-success' onclick='approveUser(" + i + ")'>Approve</button>";
          break;
        default:
          statusColor = "red";
      }

      rows += "<tr>" +
                "<td>" + user.id + "</td>" +
                "<td><strong>" + user.name + "</strong><br><span class='hint'>" + user.email + "</span></td>" +
                "<td>" + user.username + "</td>" +
                "<td><span class='badge " + user.role.toLowerCase() + "'>" + user.role + "</span></td>" +
                "<td><span class='badge " + statusColor + "'>" + user.status + "</span></td>" +
                "<td>" +
                  approveButton +
                  "<button type='button' class='btn btn-small' onclick='editUser(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteUser(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No users match your search.</td></tr>";
  }

  document.getElementById("userTableBody").innerHTML = rows;
  document.getElementById("userCount").innerHTML = "Showing " + shown + " of " + users.length + " users";
}


// CREATE or UPDATE: runs when the user form is submitted
function saveUser() {
  let name = document.getElementById("userName").value.trim();
  let username = document.getElementById("userUsername").value.trim();
  let email = document.getElementById("userEmail").value.trim();
  let password = document.getElementById("userPassword").value;
  let role = document.getElementById("userRole").value;
  let status = getRadioValue("userStatus");

  // ----- Validation -----
  let isValid = true;
  clearErrors(["userName", "userUsername", "userEmail", "userPassword", "userRole"]);

  if (name.length < 3) {
    showError("userName", "Name must be at least 3 characters.");
    isValid = false;
  }

  if (username.length < 4) {
    showError("userUsername", "Username must be at least 4 characters.");
    isValid = false;
  } else if (usernameUsedByOther(username)) {
    showError("userUsername", "Another user already has this username.");
    isValid = false;
  }

  if (isValidEmail(email) === false) {
    showError("userEmail", "Please enter a valid email address.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("userPassword", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (role === "") {
    showError("userRole", "Please choose a role.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // ----- Save -----
  if (editUserIndex === -1) {
    // CREATE: build a new object and push() it to the end of the array
    let newUser = { id: nextId("U", users), name: name, username: username, email: email,
                    password: password, role: role, status: status };
    users.push(newUser);
    showMessage("userMessage", "User <strong>" + name + "</strong> was added with id " + newUser.id + ".", "success");
  } else {
    // UPDATE: change the properties of the object that is being edited
    let user = users[editUserIndex];
    user.name = name;
    user.username = username;
    user.email = email;
    user.password = password;
    user.role = role;
    user.status = status;
    showMessage("userMessage", "User <strong>" + name + "</strong> was updated.", "success");
  }

  resetUserForm();
  renderUsers();
  generateReport();
  return false;   // never leave the page
}


// true if the username belongs to a DIFFERENT user than the one being edited
function usernameUsedByOther(username) {
  for (let i = 0; i < users.length; i++) {
    if (i !== editUserIndex && users[i].username.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}


// UPDATE step 1: copy the user's values into the form
function editUser(index) {
  let user = users[index];
  editUserIndex = index;

  document.getElementById("userName").value = user.name;
  document.getElementById("userUsername").value = user.username;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userPassword").value = user.password;
  document.getElementById("userRole").value = user.role;
  setRadioValue("userStatus", user.status);

  document.getElementById("userFormTitle").innerHTML = "Edit User " + user.id;
  document.getElementById("userSaveButton").value = "Update User";
  hideMessage("userMessage");
}


// DELETE: remove the user from the array
function deleteUser(index) {
  let user = users[index];

  // The admin who is logged in cannot delete their own account
  if (user.id === "U-001") {
    showMessage("userMessage", "You cannot delete your own admin account.", "error");
    return;
  }

  users = removeAt(users, index);
  showMessage("userMessage", "User <strong>" + user.name + "</strong> was deleted.", "info");

  resetUserForm();
  renderUsers();
  generateReport();
}


// Approve a pending registration (e.g. a new organizer): status becomes Active
function approveUser(index) {
  let user = users[index];
  user.status = "Active";
  showMessage("userMessage", "<strong>" + user.name + "</strong> was approved and can now log in.", "success");
  renderUsers();
  generateReport();
}


// Clears the form and goes back to "Add" mode
function resetUserForm() {
  editUserIndex = -1;
  document.getElementById("userForm").reset();
  clearErrors(["userName", "userUsername", "userEmail", "userPassword", "userRole"]);
  document.getElementById("userFormTitle").innerHTML = "Add New User";
  document.getElementById("userSaveButton").value = "Add User";
}


/* =====================================================================
   UNIQUE FEATURE 2: TICKET & REFUND POLICY
   ===================================================================== */

// How much money goes back to the customer?
// The service fee is never refunded. After that, the days left before the event decide.
function calcRefund(price, daysBefore, fullDays, partialDays, partialPercent, feePercent) {
  let fee = Math.round(price * feePercent / 100);
  let refundable = price - fee;

  if (daysBefore >= fullDays) {
    return refundable;                                        // full refund
  } else if (daysBefore >= partialDays) {
    return Math.round(refundable * partialPercent / 100);     // partial refund
  } else {
    return 0;                                                 // too late
  }
}


// Fills the form and the "Policy in use now" table from the ticketPolicy object
function loadPolicy() {
  document.getElementById("polFullDays").value = ticketPolicy.fullRefundDays;
  document.getElementById("polPartialDays").value = ticketPolicy.partialRefundDays;
  document.getElementById("polPartialPercent").value = ticketPolicy.partialRefundPercent;
  document.getElementById("polFee").value = ticketPolicy.serviceFeePercent;
  document.getElementById("polMaxTickets").value = ticketPolicy.maxTickets;
  document.getElementById("polCloseHours").value = ticketPolicy.closeHours;

  document.getElementById("currentPolicyBody").innerHTML =
    "<tr><td>Full refund</td><td><strong>" + ticketPolicy.fullRefundDays + " or more days before the event</strong></td></tr>" +
    "<tr><td>Partial refund</td><td><strong>" + ticketPolicy.partialRefundPercent + "% from " + ticketPolicy.partialRefundDays + " days before</strong></td></tr>" +
    "<tr><td>Service fee (not refunded)</td><td><strong>" + ticketPolicy.serviceFeePercent + "%</strong></td></tr>" +
    "<tr><td>Max tickets per booking</td><td><strong>" + ticketPolicy.maxTickets + "</strong></td></tr>" +
    "<tr><td>Booking closes</td><td><strong>" + ticketPolicy.closeHours + " hour(s) before the event</strong></td></tr>";

  previewPolicy();
}


// Live preview while the admin types (onkeyup / onchange events)
function previewPolicy() {
  let price = Number(document.getElementById("polExamplePrice").value);
  let fullDays = Number(document.getElementById("polFullDays").value);
  let partialDays = Number(document.getElementById("polPartialDays").value);
  let percent = Number(document.getElementById("polPartialPercent").value);
  let fee = Number(document.getElementById("polFee").value);

  // Three example cancellations: early, in the middle and late
  let lateDays = partialDays - 1;
  if (lateDays < 0) {
    lateDays = 0;
  }
  let dayList = [fullDays, partialDays, lateDays];

  let html = "<p>A <strong>" + money(price) + "</strong> ticket keeps <strong>" +
             money(Math.round(price * fee / 100)) + "</strong> as service fee.</p><ul class='read-list'>";
  for (let i = 0; i < dayList.length; i++) {
    let refund = calcRefund(price, dayList[i], fullDays, partialDays, percent, fee);
    html += "<li>Cancel <strong>" + dayList[i] + "</strong> day(s) before the event: refund <strong>" + money(refund) + "</strong></li>";
  }
  html += "</ul>";

  document.getElementById("policyPreview").innerHTML = html;
}


function savePolicy() {
  let fieldIds = ["polFullDays", "polPartialDays", "polPartialPercent", "polFee", "polMaxTickets", "polCloseHours"];
  clearErrors(fieldIds);

  // Run every check (so every error is shown), then combine the results
  let ok1 = checkRange("polFullDays", 1, 60);
  let ok2 = checkRange("polPartialDays", 0, 30);
  let ok3 = checkRange("polPartialPercent", 1, 99);
  let ok4 = checkRange("polFee", 0, 20);
  let ok5 = checkRange("polMaxTickets", 1, 10);
  let ok6 = checkRange("polCloseHours", 0, 48);

  if (!(ok1 && ok2 && ok3 && ok4 && ok5 && ok6)) {
    showMessage("policyMessage", "Some values are out of range.", "error");
    return false;
  }

  // The partial-refund window must be shorter than the full-refund window
  if (Number(document.getElementById("polPartialDays").value) >= Number(document.getElementById("polFullDays").value)) {
    showError("polPartialDays", "Must be less than the full refund days.");
    showMessage("policyMessage", "The partial refund must start later than the full refund.", "error");
    return false;
  }

  ticketPolicy.fullRefundDays = Number(document.getElementById("polFullDays").value);
  ticketPolicy.partialRefundDays = Number(document.getElementById("polPartialDays").value);
  ticketPolicy.partialRefundPercent = Number(document.getElementById("polPartialPercent").value);
  ticketPolicy.serviceFeePercent = Number(document.getElementById("polFee").value);
  ticketPolicy.maxTickets = Number(document.getElementById("polMaxTickets").value);
  ticketPolicy.closeHours = Number(document.getElementById("polCloseHours").value);

  showMessage("policyMessage", "Ticket and refund policy saved.", "success");
  loadPolicy();
  return false;
}


function restoreDefaultPolicy() {
  ticketPolicy.fullRefundDays = defaultPolicy.fullRefundDays;
  ticketPolicy.partialRefundDays = defaultPolicy.partialRefundDays;
  ticketPolicy.partialRefundPercent = defaultPolicy.partialRefundPercent;
  ticketPolicy.serviceFeePercent = defaultPolicy.serviceFeePercent;
  ticketPolicy.maxTickets = defaultPolicy.maxTickets;
  ticketPolicy.closeHours = defaultPolicy.closeHours;

  clearErrors(["polFullDays", "polPartialDays", "polPartialPercent", "polFee", "polMaxTickets", "polCloseHours"]);
  showMessage("policyMessage", "Default policy restored.", "info");
  loadPolicy();
}


// Checks one number field is between min and max; shows an error if not
function checkRange(fieldId, min, max) {
  let text = document.getElementById(fieldId).value;
  let number = Number(text);

  if (text === "" || number < min || number > max) {
    showError(fieldId, "Enter a number from " + min + " to " + max + ".");
    return false;
  }
  return true;
}


/* =====================================================================
   UNIQUE FEATURE 3: MAINTENANCE CONTROL
   One variable (maintenance.isOn) decides what visitors see.
   ===================================================================== */

// The box a visitor sees: the maintenance screen, or the normal website
function maintenanceScreen(message, backTime) {
  let back = "";
  if (backTime !== "") {
    back = "<p>We will be back at <strong>" + backTime + "</strong></p>";
  }
  return "<div class='visitor-screen maintenance'><h3>&#128736; Under maintenance</h3><p>" + message + "</p>" + back + "</div>";
}


// Draws everything on the Maintenance page and the red banner
function renderMaintenance() {
  // Dashboard box: shows if the server is live or under maintenance
  let maintBox = document.getElementById("statMaintenance");
  maintBox.innerHTML = maintenance.isOn ? "ON" : "LIVE";
  maintBox.style.color = maintenance.isOn ? "#C62828" : "#2E7D32";

  if (maintenance.isOn) {
    document.getElementById("maintStatus").innerHTML = "<span class='badge red'>Maintenance is ON</span>";
    document.getElementById("maintInfo").innerHTML = "Turned ON at " + maintenance.startedAt + ". Only admins can get in.";
    document.getElementById("maintButton").innerHTML = "Turn OFF maintenance";
    document.getElementById("maintButton").className = "btn btn-success";
    document.getElementById("visitorNow").innerHTML = maintenanceScreen(maintenance.message, maintenance.backTime);
    showMessage("maintBanner", "Maintenance mode is ON. " + maintenance.message + " Visitors cannot use the website.", "error");
  } else {
    document.getElementById("maintStatus").innerHTML = "<span class='badge green'>Website is LIVE</span>";
    document.getElementById("maintInfo").innerHTML = "Last maintenance: " + daysBetween(maintenance.lastDate, todayString()) +
                                                      " day(s) ago (" + maintenance.lastDate + ").";
    document.getElementById("maintButton").innerHTML = "Turn ON maintenance";
    document.getElementById("maintButton").className = "btn btn-danger";
    document.getElementById("visitorNow").innerHTML =
      "<div class='visitor-screen live'><h3>&#10003; " + siteSettings.siteName + " is live</h3><p>" + siteSettings.tagline + "</p></div>";
    hideMessage("maintBanner");
  }
  previewMaintenance();
}


// Live preview while the admin types (onkeyup events)
function previewMaintenance() {
  let message = document.getElementById("maintMessage").value.trim();
  let backTime = document.getElementById("maintBack").value.trim();

  document.getElementById("maintPreview").innerHTML = maintenanceScreen(message, backTime);

  // While maintenance is ON, what the admin types is what visitors see
  if (maintenance.isOn) {
    maintenance.message = message;
    maintenance.backTime = backTime;
    document.getElementById("visitorNow").innerHTML = maintenanceScreen(message, backTime);
  }
}


// The quick buttons: 30 min, 1 hour, 3 hours
function setBackIn(minutes) {
  document.getElementById("maintBack").value = timeAfterMinutes(minutes);
  previewMaintenance();
}


// The big switch
function toggleMaintenance() {
  clearErrors(["maintMessage", "maintBack"]);

  if (maintenance.isOn) {
    // Turn OFF
    maintenance.isOn = false;
    maintenance.lastDate = todayString();
    showMessage("maintMessageBox", "Maintenance is OFF. The website is live again.", "success");
  } else {
    // Turn ON: check the message first
    let message = document.getElementById("maintMessage").value.trim();
    let backTime = document.getElementById("maintBack").value.trim();
    let isValid = true;

    if (message.length < 10) {
      showError("maintMessage", "Please write a message of at least 10 characters.");
      isValid = false;
    }
    if (isEmpty(backTime)) {
      showError("maintBack", "Please enter a time (or use the quick buttons).");
      isValid = false;
    }
    if (isValid === false) {
      return;
    }

    maintenance.isOn = true;
    maintenance.message = message;
    maintenance.backTime = backTime;
    maintenance.startedAt = timeAfterMinutes(0);
    showMessage("maintMessageBox", "Maintenance is ON. Visitors now see the maintenance screen.", "info");
  }

  renderMaintenance();
  generateReport();
}


/* =====================================================================
   SETTINGS (a normal admin page)
   ===================================================================== */

// Fills the form and the "Settings in use now" table from the siteSettings object
function loadSettings() {
  document.getElementById("setSiteName").value = siteSettings.siteName;
  document.getElementById("setTagline").value = siteSettings.tagline;
  document.getElementById("setEmail").value = siteSettings.supportEmail;
  document.getElementById("setPhone").value = siteSettings.supportPhone;
  document.getElementById("setCurrency").value = siteSettings.currency;

  document.getElementById("currentSettingsBody").innerHTML =
    "<tr><td>Website name</td><td><strong>" + siteSettings.siteName + "</strong></td></tr>" +
    "<tr><td>Tagline</td><td><strong>" + siteSettings.tagline + "</strong></td></tr>" +
    "<tr><td>Support email</td><td><strong>" + siteSettings.supportEmail + "</strong></td></tr>" +
    "<tr><td>Support phone</td><td><strong>" + siteSettings.supportPhone + "</strong></td></tr>" +
    "<tr><td>Currency</td><td><strong>" + siteSettings.currency + "</strong></td></tr>";
}


function saveSettings() {
  let siteName = document.getElementById("setSiteName").value.trim();
  let tagline = document.getElementById("setTagline").value.trim();
  let email = document.getElementById("setEmail").value.trim();
  let phone = document.getElementById("setPhone").value.trim();
  let currency = document.getElementById("setCurrency").value.trim();

  clearErrors(["setSiteName", "setTagline", "setEmail", "setPhone", "setCurrency"]);
  let isValid = true;

  if (siteName.length < 3 || siteName.length > 30) {
    showError("setSiteName", "The name must be 3 to 30 characters.");
    isValid = false;
  }
  if (tagline.length < 5) {
    showError("setTagline", "Please write a tagline of at least 5 characters.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("setEmail", "Please enter a valid email address.");
    isValid = false;
  }
  if (isDigitsOnly(phone) === false || phone.length !== 11) {
    showError("setPhone", "Phone must be exactly 11 digits.");
    isValid = false;
  }
  if (currency.length < 1 || currency.length > 4) {
    showError("setCurrency", "Currency must be 1 to 4 characters.");
    isValid = false;
  }

  if (isValid === false) {
    showMessage("settingsMessage", "Please fix the errors and try again.", "error");
    return false;
  }

  siteSettings.siteName = siteName;
  siteSettings.tagline = tagline;
  siteSettings.supportEmail = email;
  siteSettings.supportPhone = phone;
  siteSettings.currency = currency;

  applySiteName();        // the new name appears in the header and footer
  loadSettings();
  generateReport();           // the currency changes everywhere
  loadPolicy();
  renderMaintenance();
  showMessage("settingsMessage", "Settings saved. The website is now called <strong>" + siteSettings.siteName + "</strong>.", "success");
  return false;
}


function restoreDefaultSettings() {
  siteSettings.siteName = defaultSettings.siteName;
  siteSettings.tagline = defaultSettings.tagline;
  siteSettings.supportEmail = defaultSettings.supportEmail;
  siteSettings.supportPhone = defaultSettings.supportPhone;
  siteSettings.currency = defaultSettings.currency;

  clearErrors(["setSiteName", "setTagline", "setEmail", "setPhone", "setCurrency"]);
  applySiteName();
  loadSettings();
  generateReport();
  loadPolicy();
  renderMaintenance();
  showMessage("settingsMessage", "Default settings restored.", "info");
}


/* =====================================================================
   START: runs once when the page has loaded (scripts are at the end of <body>)
   The Dashboard opens first.
   ===================================================================== */
applySiteName();
generateReport();
renderUsers();
loadPolicy();
loadSettings();

// The maintenance form starts with the saved message
document.getElementById("maintMessage").value = maintenance.message;
document.getElementById("maintBack").value = maintenance.backTime;
renderMaintenance();

showSection("statsSection");

// Each time the admin opens the Dashboard, show fresh numbers
document.getElementById("nav-statsSection").addEventListener("click", generateReport);

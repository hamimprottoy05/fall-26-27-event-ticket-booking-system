/* =====================================================================
   login.js  -  One login form for ALL users (login.html)
   ---------------------------------------------------------------------
   We find the account in the users array, check its status, and then
   a switch statement on the account's role picks the dashboard page.
   ===================================================================== */

function validateLogin() {
  // 1. Read what the user typed (.value)
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value;

  let isValid = true;
  clearLoginErrors();

  // 2. Check the fields
  if (isEmpty(username)) {
    showError("username", "Please enter your username or email.");
    isValid = false;
  }

  if (isEmpty(password)) {
    showError("password", "Please enter your password.");
    isValid = false;
  } else if (password.length < 8) {
    showError("password", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // 3. Find the account: the username OR the email can be used
  let foundUser = null;
  for (const user of users) {
    let sameName = user.username.toLowerCase() === username.toLowerCase();
    let sameEmail = user.email.toLowerCase() === username.toLowerCase();
    if (sameName || sameEmail) {
      foundUser = user;
    }
  }

  if (foundUser === null || foundUser.password !== password) {
    showMessage("loginMessage", "Wrong username or password. Please try again.", "error");
    return false;
  }

  // 4. Only Active accounts may log in
  if (foundUser.status === "Pending") {
    showMessage("loginMessage", "Hello " + foundUser.name + ", your " + foundUser.role.toLowerCase() +
                " account is waiting for an admin to approve it. Please try again later.", "info");
    return false;
  }
  if (foundUser.status === "Blocked") {
    showMessage("loginMessage", "This account is blocked. Please contact the admin.", "error");
    return false;
  }

  // 5. Open the right dashboard for this role
  let form = document.getElementById("loginForm");
  switch (foundUser.role) {
    case "Admin":
      form.action = "admin.html";
      break;
    default:
      // The other dashboards are not part of this admin build
      showMessage("loginMessage", "Welcome " + foundUser.name + "! The " + foundUser.role.toLowerCase() +
                  " dashboard is not built yet.", "info");
      return false;
  }

  console.log("Login OK: " + foundUser.name + " (" + foundUser.role + ") -> " + form.action);
  return true;
}


function clearLoginErrors() {
  clearErrors(["username", "password"]);
  hideMessage("loginMessage");
}


// "Show password": switch the input type between password and text
function togglePassword() {
  let passwordInput = document.getElementById("password");
  if (document.getElementById("showPassword").checked) {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}


applySiteName();

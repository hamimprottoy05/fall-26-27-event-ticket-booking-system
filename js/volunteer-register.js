/* =====================================================================
   volunteer-register.js  -  Volunteer registration form (register.html)
   ---------------------------------------------------------------------
   1. validateRegister() checks every field and shows the errors in red.
   2. If everything is valid, a new user object is push()ed into the
      users array (and saved with saveData()).
   ===================================================================== */

// Every field that can show an error
const registerFields = ["fullName", "email", "phone", "studentId", "department",
                        "skills", "password", "confirmPassword"];


/* ---------------------------------------------------------------------
   VALIDATION
   --------------------------------------------------------------------- */
function validateRegister() {
  let isValid = true;
  clearAllRegisterErrors();

  let fullName = document.getElementById("fullName").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let studentId = document.getElementById("studentId").value.trim();
  let department = document.getElementById("department").value;
  let skills = document.getElementById("skills").value.trim();
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (fullName.length < 3) {
    showError("fullName", "Full name must be at least 3 characters.");
    isValid = false;
  }

  if (isEmpty(email)) {
    showError("email", "Email is required.");
    isValid = false;
  } else if (isValidEmail(email) === false) {
    showError("email", "Please enter a valid email address.");
    isValid = false;
  } else if (isTaken("email", email)) {
    showError("email", "An account with this email already exists.");
    isValid = false;
  }

  if (isDigitsOnly(phone) === false || phone.length !== 11 || phone.slice(0, 2) !== "01") {
    showError("phone", "Phone must be 11 digits and start with 01.");
    isValid = false;
  }

  if (isValidStudentId(studentId) === false) {
    showError("studentId", "Use the format 23-51234-1.");
    isValid = false;
  }

  if (department === "") {
    showError("department", "Please select your department.");
    isValid = false;
  }

  if (skills.length < 5) {
    showError("skills", "Write at least one skill or interest.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("password", "Password must be at least 8 characters.");
    isValid = false;
  } else if (hasDigit(password) === false) {
    showError("password", "Password must contain at least one digit.");
    isValid = false;
  }

  if (confirmPassword === "" || confirmPassword !== password) {
    showError("confirmPassword", "Password and Confirm Password must match.");
    isValid = false;
  }

  if (isValid === false) {
    showMessage("registerMessage", "Please fix the fields marked in red.", "error");
    return false;
  }

  // ----- Everything is valid: build the new user object -----
  let newUser = {
    id: nextId("U", users),
    name: fullName,
    email: email,
    phone: phone,
    studentId: studentId,
    department: department,
    skills: skills,
    password: password,
    role: "Volunteer",
    status: "Active"
  };

  users.push(newUser);
  saveData();
  console.log("New user:", newUser);

  showMessage("registerMessage", "Welcome, <strong>" + esc(newUser.name) + "</strong>! Your volunteer account was created (user id " +
              newUser.id + "). <a href='tasks.html'>Go to My Tasks</a>.", "success");

  // Empty the form
  document.getElementById("registerForm").reset();
  clearAllRegisterErrors();
  return false;   // stay on this page so the message can be read
}


/* ---------------------------------------------------------------------
   SMALL HELPERS
   --------------------------------------------------------------------- */

// true if any user already has this value in this property, e.g. isTaken("email", "a@b.com")
// Bracket notation user[property] reads a property whose name is in a variable.
function isTaken(property, value) {
  for (const user of users) {
    if (user[property] !== undefined && String(user[property]).toLowerCase() === value.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function hasDigit(text) {
  let digits = "0123456789";
  for (let i = 0; i < text.length; i++) {
    if (digits.indexOf(text[i]) !== -1) {
      return true;
    }
  }
  return false;
}

// A student id looks like 23-51234-1: three parts of 2, 5 and 1 digits
function isValidStudentId(text) {
  let parts = text.split("-");
  if (parts.length !== 3) {
    return false;
  }
  if (parts[0].length !== 2 || parts[1].length !== 5 || parts[2].length !== 1) {
    return false;
  }
  return isDigitsOnly(parts[0]) && isDigitsOnly(parts[1]) && isDigitsOnly(parts[2]);
}

function clearAllRegisterErrors() {
  clearErrors(registerFields);
}

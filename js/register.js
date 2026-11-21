
const registerFields = ["fullName", "email", "phone", "gender", "dob", "organization", "organizerType",
                        "experience", "newUsername", "newPassword", "confirmPassword"];


/* VALIDATION */
function validateRegister() {
  let isValid = true;
  clearAllRegisterErrors();

  let fullName = document.getElementById("fullName").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let dob = document.getElementById("dob").value;
  let organization = document.getElementById("organization").value.trim();
  let organizerType = document.getElementById("organizerType").value;
  let experienceText = document.getElementById("experience").value;
  let experience = Number(experienceText);
  let username = document.getElementById("newUsername").value.trim();
  let password = document.getElementById("newPassword").value;
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

  if (getRadioValue("gender") === "") {
    showError("gender", "Please select an option.");
    isValid = false;
  }

  
  if (dob === "") {
    showError("dob", "Date of birth is required.");
    isValid = false;
  } else if (daysBetween(dob, todayString()) / 365 < 18) {
    showError("dob", "An organizer must be at least 18 years old.");
    isValid = false;
  }

  if (organization.length < 3) {
    showError("organization", "Organization name must be at least 3 characters.");
    isValid = false;
  } else if (isTaken("organization", organization)) {
    showError("organization", "This organization is already registered.");
    isValid = false;
  }

  if (organizerType === "") {
    showError("organizerType", "Please select the organizer type.");
    isValid = false;
  }

  if (experienceText === "" || experience < 0 || experience > 40) {
    showError("experience", "Enter a number from 0 to 40.");
    isValid = false;
  }

  if (username.length < 4) {
    showError("newUsername", "Username must be at least 4 characters.");
    isValid = false;
  } else if (username.indexOf(" ") !== -1) {
    showError("newUsername", "Username cannot contain spaces.");
    isValid = false;
  } else if (isTaken("username", username)) {
    showError("newUsername", "This username is already taken.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("newPassword", "Password must be at least 8 characters.");
    isValid = false;
  } else if (hasDigit(password) === false) {
    showError("newPassword", "Password must contain at least one digit.");
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

  
  let newUser = {
    id: nextId("U", users),
    name: fullName,
    username: username,
    password: password,
    email: email,
    phone: phone,
    gender: getRadioValue("gender"),
    dob: dob,
    role: "Organizer",
    status: "Pending",                       
    organization: organization,
    organizerType: organizerType,
    experience: experience,
    eventTypes: getCheckedValues("eventType")
  };

  users.push(newUser);
  saveData();
  console.log("New user:", newUser);

  showMessage("registerMessage", "Welcome, <strong>" + newUser.name + "</strong>! Your organizer account was created (user id " +
              newUser.id + "). An admin will check your details; you can log in after approval. " +
              "<a href='events.html'>Go to My Events</a>.", "success");

  
  document.getElementById("registerForm").reset();
  resetRegisterForm();
  return false;  
}


/* 
   SMALL HELPERS
    */


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


function showPasswordStrength() {
  let password = document.getElementById("newPassword").value;
  let text = document.getElementById("strengthText");
  let score = 0;

  if (password.length >= 8) { score++; }
  if (password.length >= 12) { score++; }
  if (hasDigit(password)) { score++; }
  if (password.toLowerCase() !== password) { score++; }   

  if (password === "") {
    text.innerHTML = "";
  } else if (score <= 1) {
    text.innerHTML = "Strength: weak";
    text.style.color = "#C62828";
  } else if (score <= 2) {
    text.innerHTML = "Strength: fair";
    text.style.color = "#EF6C00";
  } else {
    text.innerHTML = "Strength: strong";
    text.style.color = "#2E7D32";
  }
}


function toggleRegisterButton() {
  document.getElementById("registerButton").disabled = !document.getElementById("terms").checked;
}

function clearAllRegisterErrors() {
  clearErrors(registerFields);
}

function resetRegisterForm() {
  clearAllRegisterErrors();
  document.getElementById("registerButton").disabled = true;
  document.getElementById("strengthText").innerHTML = "";
}

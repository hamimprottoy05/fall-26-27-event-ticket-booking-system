/* =====================================================================
   volunteer-feedback.js  -  Feedback and rating (feedback.html)
   ---------------------------------------------------------------------
   Submit only (Create): submitFeedback() checks the fields and saves the
   new feedback. renderFeedback() only shows what was submitted. There is
   no Edit and no Delete, so a submitted feedback cannot be changed or
   removed by the volunteer.
   The star rating is chosen with setRating() and drawn by paintStars().
   ===================================================================== */

// The volunteer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentVolunteerId = "U-006";

let rating = 0;                 // the stars chosen in the form (0 = none yet)

const feedbackFields = ["feedbackEvent", "rating", "feedbackComment"];


/* =====================================================================
   STAR RATING
   ===================================================================== */

// Click on a star: remember the number and colour the stars
function setRating(number) {
  rating = number;
  clearError("rating");
  paintStars();
}

// The first "rating" stars get the class "on" (gold), the others stay grey
function paintStars() {
  let stars = document.getElementsByClassName("star-btn");
  for (let i = 0; i < stars.length; i++) {
    if (i < rating) {
      stars[i].className = "star-btn on";
    } else {
      stars[i].className = "star-btn";
    }
  }
}

// The stars of a submitted feedback, e.g. 4 gives 4 gold stars and 1 grey star
function starsText(number) {
  let html = "<span class='stars-static'>";
  for (let i = 1; i <= 5; i++) {
    if (i <= number) {
      html += "&#9733;";
    } else {
      html += "<span class='off'>&#9733;</span>";
    }
  }
  return html + "</span>";
}

// Live counter under the comment box (onkeyup)
function showCharCount() {
  document.getElementById("charCount").innerHTML = document.getElementById("feedbackComment").value.length;
}


/* =====================================================================
   READ (only this volunteer's feedback, newest first, no buttons)
   ===================================================================== */
function renderFeedback() {
  let html = "";
  let count = 0;

  for (let i = feedbacks.length - 1; i >= 0; i--) {
    let feedback = feedbacks[i];

    if (feedback.volunteerId === currentVolunteerId) {
      html += "<div class='record'>" +
                "<div class='record-top'>" +
                  "<strong>" + getEventTitle(feedback.eventId) + "</strong>" +
                  starsText(feedback.rating) +
                "</div>" +
                "<p>" + esc(feedback.comment) + "</p>" +
                "<p class='hint'>" + feedback.id + " &middot; submitted " + feedback.submittedAt + "</p>" +
              "</div>";
      count++;
    }
  }

  if (count === 0) {
    html = "<p class='empty-row'>You have not submitted any feedback yet.</p>";
  }

  document.getElementById("feedbackList").innerHTML = html;
  document.getElementById("feedbackCount").innerHTML = count + " feedback(s)";
}


/* =====================================================================
   SUBMIT
   ===================================================================== */
function submitFeedback() {
  let eventId = document.getElementById("feedbackEvent").value;
  let comment = document.getElementById("feedbackComment").value.trim();

  let isValid = true;
  clearErrors(feedbackFields);

  if (eventId === "") {
    showError("feedbackEvent", "Please select an event.");
    isValid = false;
  } else if (alreadyGaveFeedback(eventId)) {
    showError("feedbackEvent", "You already gave feedback for this event.");
    isValid = false;
  }

  if (rating < 1) {
    showError("rating", "Please give a star rating.");
    isValid = false;
  }

  if (comment.length < 10) {
    showError("feedbackComment", "Comment must be at least 10 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // ----- CREATE: build the new feedback object and save it -----
  let newFeedback = {
    id: nextId("F", feedbacks),
    volunteerId: currentVolunteerId,
    eventId: eventId,
    rating: rating,
    comment: comment,
    submittedAt: nowString()
  };
  feedbacks.push(newFeedback);
  saveData();
  console.log("New feedback:", newFeedback);

  showMessage("feedbackMessage", "Thank you! Your " + rating + "-star feedback for <strong>" +
              getEventTitle(eventId) + "</strong> was submitted (" + newFeedback.id + ").", "success");

  resetFeedbackForm();
  renderFeedback();
  return false;   // stay on this page so the message can be read
}

// true when this volunteer already wrote feedback for this event
function alreadyGaveFeedback(eventId) {
  for (const feedback of feedbacks) {
    if (feedback.volunteerId === currentVolunteerId && feedback.eventId === eventId) {
      return true;
    }
  }
  return false;
}


// Empties the form
function resetFeedbackForm() {
  rating = 0;
  document.getElementById("feedbackForm").reset();
  clearErrors(feedbackFields);
  paintStars();
  showCharCount();
}


/* =====================================================================
   START
   ===================================================================== */
fillEventSelect("feedbackEvent");
renderFeedback();

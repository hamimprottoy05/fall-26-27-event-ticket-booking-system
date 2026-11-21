/* =====================================================================
   volunteer-data.js  -  Sample data for the Volunteer part
   ---------------------------------------------------------------------
   Every list is an ARRAY OF OBJECTS (Lecture 05: "Arrays of objects").
   Each object groups related values as  name: value  pairs.

   IMPORTANT (frontend only):
   The volunteer's tasks, availability and feedback are kept in the browser
   with localStorage (see saveData() in volunteer-common.js and loadSavedData() at
   the bottom of this file), so they are still there after a page reload.
   When the backend (PHP + MySQL) is built later, these arrays will be
   replaced by data that comes from the database.
   ===================================================================== */


// ---------- Users of the system (used by Register) ----------
//   status: "Active"  = can log in
let users = [
  { id: "U-006", name: "Tanvir Ahmed", email: "tanvir@mail.com", phone: "01711000006", studentId: "23-51234-1",
    department: "Computer Science & Engineering", skills: "Crowd management, first aid, communication",
    password: "volunteer123", role: "Volunteer", status: "Active" }
];


// ---------- Events (created by organizers, volunteers work at them) ----------
// Dates are written as "YYYY-MM-DD", the same format an <input type="date"> gives.
let events = [
  { id: "E-100", title: "Winter Jazz Night",         date: "2026-10-25", time: "7:00 PM",  venue: "Army Stadium Hall",            city: "Dhaka" },
  { id: "E-101", title: "Dhaka Rock Fest 2026",      date: "2026-11-20", time: "6:00 PM",  venue: "Bangabandhu Convention Hall",  city: "Dhaka" },
  { id: "E-102", title: "Tech Summit Bangladesh",    date: "2026-11-27", time: "9:30 AM",  venue: "ICCB Main Auditorium",         city: "Dhaka" },
  { id: "E-103", title: "Cricket Premier Final",     date: "2026-12-02", time: "2:00 PM",  venue: "Sher-e-Bangla Stadium",        city: "Dhaka" },
  { id: "E-104", title: "The Last Letter (Drama)",   date: "2026-12-05", time: "6:30 PM",  venue: "Shilpakala Academy",           city: "Dhaka" },
  { id: "E-105", title: "Photography Masterclass",   date: "2026-12-08", time: "10:00 AM", venue: "Creative Hub",                 city: "Chattogram" },
  { id: "E-106", title: "Sylhet Folk Music Evening", date: "2026-12-12", time: "5:30 PM",  venue: "Rose View Open Hall",          city: "Sylhet" },
  { id: "E-107", title: "Startup Pitch Day",         date: "2026-12-15", time: "11:00 AM", venue: "BUET Auditorium",              city: "Dhaka" },
  { id: "E-108", title: "Football Charity Match",    date: "2026-12-20", time: "4:00 PM",  venue: "Bangabandhu National Stadium", city: "Dhaka" },
  { id: "E-109", title: "Pottery for Beginners",     date: "2026-12-22", time: "3:00 PM",  venue: "Art Corner Studio",            city: "Rajshahi" }
];


// ---------- Tasks (used by My Tasks) ----------
// assignedBy is "Admin", "Organizer" or "Myself" (a task the volunteer added).
// status is one of: Pending, Accepted, In Progress, Completed, Rejected
let tasks = [
  { id: "T-001", volunteerId: "U-006", title: "Registration Desk Support",  eventId: "E-102", assignedBy: "Organizer", assignedDate: "2026-11-18", deadline: "2026-11-27", status: "Pending",
    description: "Check attendee tickets at the main gate, hand out badges and guide people to the correct hall." },
  { id: "T-002", volunteerId: "U-006", title: "Stage Setup Assistance",     eventId: "E-104", assignedBy: "Admin",     assignedDate: "2026-11-19", deadline: "2026-12-05", status: "Pending",
    description: "Help the technical crew place chairs, banners and cables on stage before the programme starts." },
  { id: "T-003", volunteerId: "U-006", title: "Guest Welcome and Guidance", eventId: "E-102", assignedBy: "Organizer", assignedDate: "2026-11-16", deadline: "2026-11-26", status: "Accepted",
    description: "Welcome VIP guests, escort them to the reserved seats and answer their questions." },
  { id: "T-004", volunteerId: "U-006", title: "Crowd Management",           eventId: "E-103", assignedBy: "Admin",     assignedDate: "2026-11-15", deadline: "2026-12-02", status: "In Progress",
    description: "Stand at the assigned checkpoint, keep the queue in order and report any problem to the organizer." },
  { id: "T-005", volunteerId: "U-006", title: "Ticket Scanning",            eventId: "E-100", assignedBy: "Organizer", assignedDate: "2026-10-15", deadline: "2026-10-25", status: "Completed",
    description: "Scan QR codes at Entry Gate 2 using the organizer's mobile scanner." },
  { id: "T-006", volunteerId: "U-006", title: "Backstage Coordination",     eventId: "E-101", assignedBy: "Admin",     assignedDate: "2026-11-10", deadline: "2026-11-20", status: "Completed",
    description: "Carry messages between the stage manager and the artists' waiting room." },
  { id: "T-007", volunteerId: "U-006", title: "Information Booth",          eventId: "E-107", assignedBy: "Organizer", assignedDate: "2026-11-20", deadline: "2026-12-15", status: "Pending",
    description: "Answer visitor questions about the schedule, stalls and parking at the information booth." },
  { id: "T-008", volunteerId: "U-006", title: "Refreshment Distribution",   eventId: "E-108", assignedBy: "Admin",     assignedDate: "2026-11-20", deadline: "2026-12-20", status: "Pending",
    description: "Distribute water and snacks to the performers and the volunteer team." }
];


// ---------- Availability (used by Availability) ----------
// dates and slots are arrays. A volunteer who is "Unavailable" has an empty slots array.
let availabilities = [
  { id: "A-001", volunteerId: "U-006", status: "Available",   dates: ["2026-11-27", "2026-11-28"], slots: ["Morning (8 AM - 12 PM)", "Afternoon (12 PM - 4 PM)"],
    note: "Free after my class ends", updatedAt: "2026-11-19 10:30" },
  { id: "A-002", volunteerId: "U-006", status: "Unavailable", dates: ["2026-12-03"], slots: [],
    note: "Final exam", updatedAt: "2026-11-20 09:15" }
];


// ---------- Feedback (used by Feedback) ----------
// A volunteer can only submit feedback (it cannot be edited or deleted later).
// rating is a number from 1 to 5. A volunteer can give one feedback for each event.
let feedbacks = [
  { id: "F-001", volunteerId: "U-006", eventId: "E-100", rating: 5, comment: "Well organised event. The team leader gave clear instructions and everyone was friendly.", submittedAt: "2026-10-26 18:20" },
  { id: "F-002", volunteerId: "U-006", eventId: "E-101", rating: 4, comment: "Great crowd and a lot of fun, but we needed more volunteers at the entry gate.", submittedAt: "2026-11-21 08:05" }
];


// ---------- Load what the volunteer saved earlier ----------
// localStorage keeps text, so the arrays were written with JSON.stringify()
// and are read back with JSON.parse().
function loadSavedData() {
  let savedUsers = localStorage.getItem("eventnestVolunteers");
  let savedTasks = localStorage.getItem("eventnestTasks");
  let savedAvailability = localStorage.getItem("eventnestAvailability");
  let savedFeedback = localStorage.getItem("eventnestFeedback");

  if (savedUsers !== null) {
    users = JSON.parse(savedUsers);
  }
  if (savedTasks !== null) {
    tasks = JSON.parse(savedTasks);
  }
  if (savedAvailability !== null) {
    availabilities = JSON.parse(savedAvailability);
  }
  if (savedFeedback !== null) {
    feedbacks = JSON.parse(savedFeedback);
  }
}

loadSavedData();

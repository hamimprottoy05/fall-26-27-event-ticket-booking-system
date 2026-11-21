/* =====================================================================
   data.js  -  Sample data for the whole system
   ---------------------------------------------------------------------
   Every list is an ARRAY OF OBJECTS (Lecture 05: "Arrays of objects").
   Each object groups related values as  name: value  pairs.

   IMPORTANT (frontend only):
   The Organizer pages work with several pages (events -> bookings ->
   sales), so users, events and bookings are also kept
   in the browser with localStorage (see saveData() in common.js and
   loadSavedData() at the bottom of this file).
   When the backend (PHP + MySQL) is built later, these arrays will be
   replaced by data that comes from the database.
   ===================================================================== */


// ---------- Users of the system (used by Register) ----------
//   status: "Active"  = can log in
//           "Pending" = registered, waiting for an admin to approve (organizers)
//   Every type of user has a few extra properties (organizers: organization, organizerType, ...)
let users = [
  { id: "U-002", name: "Sabbir Ahmed",  username: "organizer", password: "organizer123", email: "sabbir@soundwave.com", phone: "01711000002", role: "Organizer", status: "Active",
    organization: "Sound Wave Events", organizerType: "Company", experience: 6, eventTypes: ["Concert", "Theatre"] },
  { id: "U-006", name: "Tanvir Hossain", username: "tanvir",    password: "tanvir1234",   email: "tanvir@techbd.com",    phone: "01711000006", role: "Organizer", status: "Active",
    organization: "TechBD Community", organizerType: "Club", experience: 4, eventTypes: ["Conference", "Workshop"] },
  { id: "U-007", name: "Mehrin Chowdhury", username: "mehrin",  password: "mehrin1234",   email: "mehrin@lenslovers.com", phone: "01711000007", role: "Organizer", status: "Pending",
    organization: "Lens Lovers", organizerType: "Club", experience: 2, eventTypes: ["Workshop"] },

  { id: "U-003", name: "Ayesha Rahman", username: "customer", password: "customer123", email: "ayesha@mail.com", phone: "01711000003", role: "Customer", status: "Active",
    city: "Dhaka", interests: ["Concert", "Theatre"] },
  { id: "U-004", name: "Karim Hasan",   username: "karim",    password: "karim1234",   email: "karim@mail.com",  phone: "01711000004", role: "Customer", status: "Active",
    city: "Chattogram", interests: ["Sports"] },
  { id: "U-005", name: "Nadia Islam",   username: "nadia",    password: "nadia1234",   email: "nadia@mail.com",  phone: "01711000005", role: "Customer", status: "Active",
    city: "Sylhet", interests: ["Workshop", "Conference"] }
];


// ---------- Events (created by organizers, seen by customers) ----------
// The hall has "rows" rows (A, B, C ...) with "seatsPerRow" seats in each row.
// Dates are written as "YYYY-MM-DD", the same format an <input type="date"> gives.
//   revenueTarget (optional, Unique 2): the income goal in Tk the organizer sets on the Sales page.
//                 0 or missing = no target set yet.
let events = [
  { id: "E-100", title: "Winter Jazz Night",         category: "Concert",    date: "2026-10-25", time: "7:00 PM", venue: "Army Stadium Hall",           city: "Dhaka",      price: 800,  rows: 6, seatsPerRow: 8,  organizer: "Sound Wave Events",
    revenueTarget: 3000,
    description: "An evening of live jazz with local and guest artists." },
  { id: "E-101", title: "Dhaka Rock Fest 2026",      category: "Concert",    date: "2026-11-20", time: "6:00 PM", venue: "Bangabandhu Convention Hall", city: "Dhaka",      price: 1200, rows: 8, seatsPerRow: 10, organizer: "Sound Wave Events",
    revenueTarget: 10000,
    description: "The biggest rock night of the year with five bands on one stage." },
  { id: "E-102", title: "Tech Summit Bangladesh",    category: "Conference", date: "2026-11-27", time: "9:30 AM", venue: "ICCB Main Auditorium",        city: "Dhaka",      price: 1500, rows: 8, seatsPerRow: 10, organizer: "TechBD Community",
    description: "Talks and panels on software, AI and startups from industry leaders." },
  { id: "E-103", title: "Cricket Premier Final",     category: "Sports",     date: "2026-12-02", time: "2:00 PM", venue: "Sher-e-Bangla Stadium",       city: "Dhaka",      price: 600,  rows: 8, seatsPerRow: 10, organizer: "BD Cricket Club",
    description: "Watch the two best teams of the season fight for the trophy." },
  { id: "E-104", title: "The Last Letter (Drama)",   category: "Theatre",    date: "2026-12-05", time: "6:30 PM", venue: "Shilpakala Academy",          city: "Dhaka",      price: 500,  rows: 6, seatsPerRow: 8,  organizer: "Nagorik Natyangan",
    description: "A touching stage drama about family, memory and letters never sent." },
  { id: "E-105", title: "Photography Masterclass",   category: "Workshop",   date: "2026-12-08", time: "10:00 AM", venue: "Creative Hub",               city: "Chattogram", price: 900,  rows: 5, seatsPerRow: 6,  organizer: "Lens Lovers",
    description: "A hands-on workshop on composition, light and editing for beginners." },
  { id: "E-106", title: "Sylhet Folk Music Evening", category: "Concert",    date: "2026-12-12", time: "5:30 PM", venue: "Rose View Open Hall",         city: "Sylhet",     price: 400,  rows: 6, seatsPerRow: 8,  organizer: "Surma Cultural Club",
    description: "Baul and folk songs from the hills and haors of Sylhet." },
  { id: "E-107", title: "Startup Pitch Day",         category: "Conference", date: "2026-12-15", time: "11:00 AM", venue: "BUET Auditorium",            city: "Dhaka",      price: 700,  rows: 6, seatsPerRow: 8,  organizer: "TechBD Community",
    description: "Ten young startups pitch to investors. Meet founders and investors." },
  { id: "E-108", title: "Football Charity Match",    category: "Sports",     date: "2026-12-20", time: "4:00 PM", venue: "Bangabandhu National Stadium", city: "Dhaka",     price: 300,  rows: 8, seatsPerRow: 10, organizer: "BD Cricket Club",
    description: "A friendly match between celebrity teams. All income goes to charity." },
  { id: "E-109", title: "Pottery for Beginners",     category: "Workshop",   date: "2026-12-22", time: "3:00 PM", venue: "Art Corner Studio",           city: "Rajshahi",   price: 650,  rows: 4, seatsPerRow: 6,  organizer: "Lens Lovers",
    description: "Make your own clay pot in a relaxed two-hour workshop." }
];


// ---------- Bookings made by customers (used by Booking and My Tickets) ----------
// seats is an array like ["A1", "A2"]. A seat that appears in any booking is "booked" (red),
// except in a Cancelled booking: its seats become free (green) again.
//   status: "Pending"   = the customer booked, the organizer has not decided yet
//           "Approved"  = the organizer approved it (counted in tickets sold and revenue)
//           "Cancelled" = the organizer cancelled it
//   checkedIn (optional, Unique 1): true after the organizer checks the guest in at the door.
//   checkedInAt (optional): the date and time of the check-in, e.g. "2026-11-20 18:05".
//   A booking without these properties is simply "not checked in".
let bookings = [
  { id: "BK-001", customerId: "U-003", eventId: "E-101", title: "Dhaka Rock Fest 2026",   seats: ["A1", "A2"],            holderName: "Ayesha Rahman", phone: "01711000003", total: 2400, bookedOn: "2026-10-28", status: "Approved" },
  { id: "BK-002", customerId: "U-003", eventId: "E-104", title: "The Last Letter (Drama)", seats: ["C4"],                  holderName: "Ayesha Rahman", phone: "01711000003", total: 500,  bookedOn: "2026-11-01", status: "Approved" },
  { id: "BK-003", customerId: "U-003", eventId: "E-100", title: "Winter Jazz Night",       seats: ["B5", "B6"],            holderName: "Ayesha Rahman", phone: "01711000003", total: 1600, bookedOn: "2026-10-10", status: "Approved" },
  { id: "BK-004", customerId: "U-004", eventId: "E-101", title: "Dhaka Rock Fest 2026",   seats: ["A3", "A4", "B1", "B2", "B3"], holderName: "Karim Hasan", phone: "01711000004", total: 6000, bookedOn: "2026-10-30", status: "Pending" },
  { id: "BK-005", customerId: "U-005", eventId: "E-102", title: "Tech Summit Bangladesh",  seats: ["D5", "D6", "D7"],      holderName: "Nadia Islam",   phone: "01711000005", total: 4500, bookedOn: "2026-11-02", status: "Approved" },
  { id: "BK-006", customerId: "U-004", eventId: "E-103", title: "Cricket Premier Final",   seats: ["E1", "E2", "E3", "E4"], holderName: "Karim Hasan",  phone: "01711000004", total: 2400, bookedOn: "2026-11-03", status: "Pending" }
];


// ---------- Load what the customer saved earlier ----------
// localStorage keeps text, so the arrays were written with JSON.stringify()
// and are read back with JSON.parse().
function loadSavedData() {
  let savedUsers = localStorage.getItem("eventnestOrgUsers");
  let savedEvents = localStorage.getItem("eventnestOrgEvents");
  let savedBookings = localStorage.getItem("eventnestOrgBookings");

  if (savedUsers !== null) {
    users = JSON.parse(savedUsers);
  }
  if (savedEvents !== null) {
    events = JSON.parse(savedEvents);
  }
  if (savedBookings !== null) {
    bookings = JSON.parse(savedBookings);
  }
}

loadSavedData();

/* =====================================================================
   data.js  -  Sample data for the whole system
   ---------------------------------------------------------------------
   Every list is an ARRAY OF OBJECTS (same idea as the library project).
   This data lives in the browser's memory. When you reload a page or
   move to another page, it starts again from these values.
   When the PHP + MySQL backend is built later, these arrays will be
   replaced by data from the database.

   Who creates what data:
     Organizers create EVENTS, check customers in (checkedIn) and choose a REVENUE TARGET.
     Customers buy TICKETS (sold).
     The Admin only watches all of this on the Dashboard and manages the accounts and the rules.
   ===================================================================== */


// ---------- Users of the system (used by Login, Register and Admin) ----------
// Roles: Admin, Organizer, Customer, Volunteer
// status: "Active"  = can log in
//         "Pending" = registered, waiting for the admin to approve (organizers)
//         "Blocked" = stopped by an admin
// Organizers also have: organization, licenseNo (from the registration form)
//         and revenueTarget (the money target they chose for themselves)
let users = [
  { id: "U-001", name: "Site Admin",     username: "admin",     password: "admin1234",   email: "admin@eventnest.com",   role: "Admin",     status: "Active" },

  { id: "U-002", name: "Sadia Akter",    username: "sadia",     password: "sadia1234",   email: "sadia@dhakalive.com",   role: "Organizer", status: "Active",
    organization: "Dhaka Live Entertainment", licenseNo: "TL-2024-0456", revenueTarget: 600000 },
  { id: "U-003", name: "Mitu Sarker",    username: "mitu",      password: "mitu12345",   email: "mitu@techspark.com",    role: "Organizer", status: "Active",
    organization: "TechSpark BD",            licenseNo: "TL-2023-1180", revenueTarget: 500000 },
  { id: "U-004", name: "Jamal Uddin",    username: "jamal",     password: "jamal1234",   email: "jamal@greenfest.com",   role: "Organizer", status: "Active",
    organization: "Green Fest Agency",       licenseNo: "TL-2026-0092", revenueTarget: 200000 },
  { id: "U-005", name: "Tareq Aziz",     username: "tareq",     password: "tareq1234",   email: "tareq@citysports.com",  role: "Organizer", status: "Pending",
    organization: "City Sports Club",        licenseNo: "TL-2026-0105" },
  { id: "U-006", name: "Habib Khan",     username: "habib",     password: "habib1234",   email: "habib@partyzone.com",   role: "Organizer", status: "Blocked",
    organization: "Party Zone",              licenseNo: "NOT-PROVIDED" },

  { id: "U-007", name: "Rahim Uddin",    username: "customer",  password: "customer123", email: "rahim@mail.com",        role: "Customer",  status: "Active" },
  { id: "U-008", name: "Karim Hasan",    username: "karim",     password: "karim1234",   email: "karim@mail.com",        role: "Customer",  status: "Active" },
  { id: "U-009", name: "Nadia Rahman",   username: "nadia",     password: "nadia1234",   email: "nadia@mail.com",        role: "Customer",  status: "Active" },
  { id: "U-010", name: "Tanvir Ahmed",   username: "tanvir",    password: "tanvir123",   email: "tanvir@mail.com",       role: "Customer",  status: "Blocked" },

  { id: "U-011", name: "Farhana Kabir",  username: "volunteer",     password: "volunteer1234",   email: "farhana@eventnest.com", role: "Volunteer",     status: "Active" }
];


// ---------- Event categories (used by the filters and the charts) ----------
const eventCategories = ["Music", "Tech", "Sports", "Education", "Food", "Art"];


// ---------- Events created by organizers ----------
// sold      = tickets bought by customers, capacity = total seats
// checkedIn = customers already checked in at the gate (0 for events that have not started)
let events = [
  { id: "E-101", title: "Dhaka Rock Night",                 category: "Music",     organizerId: "U-002", organizerName: "Sadia Akter", date: "2026-11-28", time: "18:00", venue: "Army Stadium, Dhaka",        price: 800,  capacity: 500,  sold: 430, checkedIn: 0 },
  { id: "E-102", title: "TechSummit Bangladesh 2026",       category: "Tech",      organizerId: "U-003", organizerName: "Mitu Sarker", date: "2026-12-05", time: "10:00", venue: "ICCB, Agargaon",             price: 1500, capacity: 300,  sold: 300, checkedIn: 0 },
  { id: "E-103", title: "Web Development Bootcamp",         category: "Education", organizerId: "U-003", organizerName: "Mitu Sarker", date: "2026-11-20", time: "09:30", venue: "AIUB Auditorium, Kuril",     price: 500,  capacity: 60,   sold: 22,  checkedIn: 18 },
  { id: "E-104", title: "Dhaka Street Food Festival",       category: "Food",      organizerId: "U-004", organizerName: "Jamal Uddin", date: "2026-12-12", time: "12:00", venue: "Hatirjheel Amphitheatre",    price: 200,  capacity: 1000, sold: 120, checkedIn: 0 },
  { id: "E-105", title: "Inter-University Cricket Cup",     category: "Sports",    organizerId: "U-004", organizerName: "Jamal Uddin", date: "2026-12-18", time: "09:00", venue: "BKSP Ground, Savar",         price: 300,  capacity: 800,  sold: 260, checkedIn: 0 },
  { id: "E-106", title: "Classical Music Evening",          category: "Music",     organizerId: "U-002", organizerName: "Sadia Akter", date: "2026-11-15", time: "19:00", venue: "Shilpakala Academy",         price: 600,  capacity: 200,  sold: 95,  checkedIn: 88 },
  { id: "E-110", title: "Dhaka Winter Marathon",            category: "Sports",    organizerId: "U-002", organizerName: "Sadia Akter", date: "2026-12-30", time: "06:00", venue: "Hatirjheel Lake Road",       price: 250,  capacity: 600,  sold: 410, checkedIn: 0 }
];


// ---------- Ticket and refund policy (set by Admin in "Ticket & Refund Policy") ----------
// A single object, like libraryRules in the library project.
let ticketPolicy = {
  fullRefundDays: 7,        // cancel at least 7 days before the event: full refund (minus the service fee)
  partialRefundDays: 3,     // cancel at least 3 days before: only a part is refunded
  partialRefundPercent: 50, // ... this percent of the refundable amount
  serviceFeePercent: 5,     // the service fee is never refunded
  maxTickets: 5,            // most tickets one customer can buy in one booking
  closeHours: 2             // booking closes this many hours before the event starts
};


// ---------- Maintenance mode (set by Admin in "Maintenance Control") ----------
// isOn = true  -> visitors see the maintenance message instead of the website
let maintenance = {
  isOn: false,
  message: "We are making EventNest better. Please come back soon!",
  backTime: "",
  startedAt: "",             // the time the admin turned it ON
  lastDate: "2026-11-18"     // the day of the last maintenance
};


// ---------- Website settings (changed by the Admin in Settings) ----------
// A single object: its properties are read with dot notation, e.g. siteSettings.siteName
let siteSettings = {
  siteName: "EventNest",
  tagline: "Discover events. Book tickets. Enjoy the moment.",
  supportEmail: "support@eventnest.com",
  supportPhone: "01711000000",
  currency: "Tk"
};

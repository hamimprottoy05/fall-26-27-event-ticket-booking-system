# EventNest — Event and Ticket Booking System (Organizer part, Frontend Version)

CSC 3215 Web Technologies project. HTML + one external CSS + external JavaScript files.
Open `events.html` in Chrome or Firefox (no installation needed).
This folder works on its own: it does not need the customer files.

| Page | What it does |
|---|---|
| `register.html` | Organizer registration (starts as Pending until an admin approves) |
| `events.html` | **CRUD + Search**: Create, Read, Update, Delete and Search my events |
| `event-details.html` | Read: information of one of my events (date, venue, layout, price) |
| `bookings.html` | Booking list (search, approve, cancel) + **Unique 3: Seating Priority & Conflict Radar** |
| `checkin.html` | **Unique 1: Door Check-in Mode** (type a booking id -> "Checked In", live count of guests) |
| `sales.html` | Sales report + **Unique 2: Revenue Target Progress Bar** (set a target per event, see approved revenue vs target) |

## The 3 unique features (they do not overlap)
1. **Door Check-in Mode** - on the event day the organizer types the booking id, the guest becomes "Checked In" and a live counter shows how many guests arrived. Only Approved bookings can enter.
2. **Revenue Target Progress Bar** - the organizer sets an income target for each event; a progress bar shows how close the Approved revenue is (green when reached).
3. **Seating Priority & Conflict Radar** - automatic: flags Front-Row (Row A) bookings, Split Seats (non-adjacent seats in one booking), and Seat Clashes (prevents approving overlapping seats on the same event).

Booking status: `Pending` -> `Approved` or `Cancelled`. Only approved bookings count as sold tickets and revenue.

```
css/organizer.css, css/organizer-register.css     js/data.js     js/common.js     js/organizer-*.js (one for each page, including checkin.js)
```
Data is saved in localStorage (keys start with `eventnestOrg`).

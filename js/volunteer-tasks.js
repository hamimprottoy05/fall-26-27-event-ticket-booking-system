/* =====================================================================
   volunteer-tasks.js  -  My Tasks (tasks.html)
   ---------------------------------------------------------------------
   CRUD + Search : the volunteer's tasks array
     Create  -> showAddTaskForm() + saveTask()   (a new task is push()ed)
     Read    -> renderTasks()
     Search  -> renderTasks() with the search box and the status list
     Update  -> editTask() + saveTask()          (also used to change the status)
     Delete  -> deleteTask()
   ===================================================================== */

// The volunteer who is logged in. With the PHP backend this will come
// from the session ($_SESSION) instead of being written here.
const currentVolunteerId = "U-006";

let editTaskIndex = -1;         // -1 = adding a new task, otherwise the position of the task being edited

const taskFields = ["taskTitle", "taskEvent", "taskDeadline", "taskDescription"];


// The badge colour of each status (the colours are CSS classes in volunteer.css)
function statusColor(status) {
  if (status === "Completed") {
    return "green";
  } else if (status === "Rejected") {
    return "red";
  } else if (status === "Accepted") {
    return "blue";
  } else if (status === "In Progress") {
    return "purple";
  }
  return "orange";              // Pending
}


/* =====================================================================
   READ + SEARCH (only this volunteer's tasks)
   ===================================================================== */
function renderTasks() {
  let keyword = document.getElementById("taskSearch").value;
  let status = document.getElementById("taskFilter").value;

  let html = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    let isMine = (task.volunteerId === currentVolunteerId);   // only this volunteer's tasks
    if (isMine) {
      mine++;
    }

    let matchesKeyword = containsText(task.title, keyword) || containsText(getEventTitle(task.eventId), keyword);
    let matchesStatus = (status === "All" || task.status === status);

    if (isMine && matchesKeyword && matchesStatus) {
      // A task is overdue when its deadline has passed and it is not finished
      let overdue = "";
      if (task.status !== "Completed" && task.status !== "Rejected" && daysBetween(todayString(), task.deadline) < 0) {
        overdue = " <span class='badge red'>Overdue</span>";
      }

      html += "<tr>" +
                "<td>" + task.id + "</td>" +
                "<td><strong>" + esc(task.title) + "</strong><p class='hint'>" + esc(task.description) + "</p></td>" +
                "<td>" + getEventTitle(task.eventId) + "</td>" +
                "<td>" + task.assignedBy + "<p class='hint'>" + task.assignedDate + "</p></td>" +
                "<td>" + task.deadline + overdue + "</td>" +
                "<td><span class='badge " + statusColor(task.status) + "'>" + task.status + "</span></td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editTask(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteTask(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    html = "<tr><td colspan='7' class='empty-row'>No tasks found.</td></tr>";
  }

  document.getElementById("taskBody").innerHTML = html;
  document.getElementById("taskCount").innerHTML = "Showing " + shown + " of " + mine + " tasks";
  renderProgress();
}


// The progress bar: completed tasks / all tasks (rejected tasks are not counted)
function renderProgress() {
  let active = 0;
  let done = 0;
  let rejected = 0;

  for (const task of tasks) {
    if (task.volunteerId === currentVolunteerId) {
      if (task.status === "Rejected") {
        rejected++;
      } else {
        active++;
        if (task.status === "Completed") {
          done++;
        }
      }
    }
  }

  let percent = 0;
  if (active > 0) {
    percent = Math.round(done / active * 100);
  }

  let bar = document.getElementById("progressBar");
  bar.style.width = percent + "%";          // style.width makes the bar grow
  bar.innerHTML = percent + "%";
  document.getElementById("progressText").innerHTML =
    done + " of " + active + " tasks completed (" + rejected + " rejected task(s) not counted).";
}


/* =====================================================================
   CREATE + UPDATE (both use the same form)
   ===================================================================== */

// CREATE step 1: show an empty form
function showAddTaskForm() {
  editTaskIndex = -1;
  document.getElementById("taskForm").reset();
  clearErrors(taskFields);
  hideMessage("taskMessage");

  document.getElementById("taskFormTitle").innerHTML = "Add New Task";
  document.getElementById("taskSaveButton").value = "Add Task";
  document.getElementById("taskCard").style.display = "block";
  document.getElementById("taskCard").scrollIntoView();
}

// UPDATE step 1: copy the task into the form
function editTask(index) {
  let task = tasks[index];
  editTaskIndex = index;

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskEvent").value = task.eventId;
  document.getElementById("taskDeadline").value = task.deadline;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskDescription").value = task.description;

  document.getElementById("taskFormTitle").innerHTML = "Edit Task " + task.id;
  document.getElementById("taskSaveButton").value = "Update Task";
  document.getElementById("taskCard").style.display = "block";

  clearErrors(taskFields);
  hideMessage("taskMessage");
  document.getElementById("taskCard").scrollIntoView();
}

// CREATE step 2 / UPDATE step 2: validate, then push() a new object or change the old one
function saveTask() {
  let title = document.getElementById("taskTitle").value.trim();
  let eventId = document.getElementById("taskEvent").value;
  let deadline = document.getElementById("taskDeadline").value;
  let status = document.getElementById("taskStatus").value;
  let description = document.getElementById("taskDescription").value.trim();

  let isValid = true;
  clearErrors(taskFields);

  if (title.length < 3) {
    showError("taskTitle", "Task name must be at least 3 characters.");
    isValid = false;
  }

  if (eventId === "") {
    showError("taskEvent", "Please select an event.");
    isValid = false;
  }

  if (deadline === "") {
    showError("taskDeadline", "Deadline is required.");
    isValid = false;
  } else if (editTaskIndex === -1 && daysBetween(todayString(), deadline) < 0) {
    showError("taskDeadline", "A new task cannot have a deadline in the past.");
    isValid = false;
  }

  if (description.length < 10) {
    showError("taskDescription", "Description must be at least 10 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editTaskIndex === -1) {
    // ----- CREATE: build the new task object -----
    let newTask = {
      id: nextId("T", tasks),
      volunteerId: currentVolunteerId,
      title: title,
      eventId: eventId,
      description: description,
      assignedBy: "Myself",
      assignedDate: todayString(),
      deadline: deadline,
      status: status
    };
    tasks.push(newTask);
    saveData();
    console.log("New task:", newTask);

    showMessage("taskMessage", "Task " + newTask.id + " <strong>" + esc(newTask.title) + "</strong> was added.", "success");
  } else {
    // ----- UPDATE: change the properties of the object -----
    let task = tasks[editTaskIndex];
    task.title = title;
    task.eventId = eventId;
    task.deadline = deadline;
    task.status = status;
    task.description = description;
    saveData();

    showMessage("taskMessage", "Task " + task.id + " was updated.", "success");
  }

  resetTaskForm();
  renderTasks();
  return false;
}


/* =====================================================================
   DELETE
   ===================================================================== */
function deleteTask(index) {
  let task = tasks[index];

  if (confirm("Delete task " + task.id + "?") === false) {
    return;
  }

  tasks = removeAt(tasks, index);
  saveData();

  showMessage("taskMessage", "Task " + task.id + " <strong>" + esc(task.title) + "</strong> was deleted.", "info");
  resetTaskForm();
  renderTasks();
}


function resetTaskForm() {
  editTaskIndex = -1;
  document.getElementById("taskForm").reset();
  clearErrors(taskFields);
  document.getElementById("taskCard").style.display = "none";
}


/* =====================================================================
   START
   ===================================================================== */
fillEventSelect("taskEvent");
renderTasks();

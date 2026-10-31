const STORAGE_KEY = "study-planner-tasks";

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const subjectInput = document.querySelector("#task-subject");
const errorMessage = document.querySelector("#form-error");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const taskFilter = document.querySelector("#task-filter");

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    const tasks = JSON.parse(savedTasks);
    if (!Array.isArray(tasks)) {
      throw new Error("Saved study tasks are not a list.");
    }

    return tasks.filter((task) =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.subject === "string" &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    console.error("Could not load saved study tasks.", error);
    window.alert("Saved tasks could not be read. Your browser may have blocked local storage.");
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save study tasks.", error);
    window.alert("Your changes could not be saved in this browser.");
  }
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-complete" : ""}`;

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.type = "button";
  toggleButton.setAttribute("aria-label", task.completed ? "Mark task incomplete" : "Mark task complete");
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  toggleButton.textContent = task.completed ? "✓" : "";
  toggleButton.addEventListener("click", () => {
    tasks = tasks.map((currentTask) =>
      currentTask.id === task.id ? { ...currentTask, completed: !currentTask.completed } : currentTask
    );
    saveTasks();
    renderTasks();
  });

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const subject = document.createElement("p");
  subject.className = "task-subject";
  subject.textContent = task.subject || "No subject added";

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
    saveTasks();
    renderTasks();
  });

  content.append(title, subject);
  item.append(toggleButton, content, deleteButton);
  return item;
}

function renderTasks() {
  const filter = taskFilter.value;
  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  taskCount.textContent = String(tasks.length);
  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;

  if (tasks.length === 0) {
    emptyTitle.textContent = "Your list is clear";
    emptyCopy.textContent = "Add your first study task to get started.";
  } else if (filter === "active") {
    emptyTitle.textContent = "All caught up";
    emptyCopy.textContent = "You have no tasks left to do.";
  } else if (filter === "completed") {
    emptyTitle.textContent = "Nothing completed yet";
    emptyCopy.textContent = "Finished tasks will show up here.";
  } else {
    emptyTitle.textContent = "No tasks to show";
    emptyCopy.textContent = "Add a task or choose a different filter.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();

  if (!title) {
    errorMessage.hidden = false;
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    subject: subjectInput.value.trim(),
    completed: false
  });
  saveTasks();
  form.reset();
  errorMessage.hidden = true;
  titleInput.removeAttribute("aria-invalid");
  taskFilter.value = "all";
  renderTasks();
  titleInput.focus();
});

titleInput.addEventListener("input", () => {
  if (titleInput.value.trim()) {
    errorMessage.hidden = true;
    titleInput.removeAttribute("aria-invalid");
  }
});

taskFilter.addEventListener("change", renderTasks);

renderTasks();
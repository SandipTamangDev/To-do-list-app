// To-Do List App with Focus Mode, Daily Limit, and Auto Reset by Date
// (Bugfix applied: unlock next task correctly by removing inactive-task class)

// DOM elements
const addBtn = document.getElementById('add');
const taskList = document.getElementById('task-list');
const input = document.querySelector('.container input');
const confirmBtn = document.getElementById('confirm');

const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupOk = document.getElementById('popup-ok');

let colorStage = 0;
let totalCompletedToday = 0;

// --- Create Completed Section ---
let completedSection = document.createElement('ul');
completedSection.id = 'completed-list';
completedSection.style.marginTop = '20px';
completedSection.style.listStyle = 'none';
completedSection.style.maxWidth = '500px';
completedSection.style.width = '100%';
completedSection.style.color = '#9f9f9f';
completedSection.style.padding = '0';
completedSection.innerHTML = "<h3 style='text-align:center; color:#00ff88;'>Completed Tasks</h3>";
document.querySelector('.container').appendChild(completedSection);

// Task class
class Task {
  constructor(text, completed = false) {
    this.text = text;
    this.completed = completed;
  }
}

// --- STORAGE HELPERS ---
function saveState() {
  const activeTasks = Array.from(taskList.children).map(li => {
    const span = li.querySelector('span');
    const checkbox = li.querySelector('input[type="checkbox"]');
    return new Task(span.textContent, checkbox.checked);
  });

  const completedTasks = Array.from(completedSection.querySelectorAll('li'))
    .filter(li => !li.querySelector('h3'))
    .map(li => li.textContent);

  const today = new Date().toDateString();

  const state = {
    activeTasks,
    completedTasks,
    colorStage,
    totalCompletedToday,
    date: today
  };
  localStorage.setItem('todoAppState', JSON.stringify(state));
}

function loadState() {
  const state = JSON.parse(localStorage.getItem('todoAppState'));
  const today = new Date().toDateString();

  if (!state) return;

  // Auto reset if day changed
  if (state.date !== today) {
    localStorage.removeItem('todoAppState');
    colorStage = 0;
    totalCompletedToday = 0;
    updateBackgroundColor();
    return;
  }

  colorStage = state.colorStage || 0;
  totalCompletedToday = state.totalCompletedToday || 0;
  updateBackgroundColor();

  if (state.activeTasks && state.activeTasks.length > 0) {
    state.activeTasks.forEach(t => createTaskElement(t.text, t.completed));
  }

  if (state.completedTasks && state.completedTasks.length > 0) {
    state.completedTasks.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      li.style.textDecoration = 'line-through';
      li.style.opacity = '0.7';
      completedSection.appendChild(li);
    });
  }

  // Lock if daily limit reached
  if (totalCompletedToday >= 9) lockForToday();

  updateArrowVisibility();
}

// --- CREATE TASK ELEMENT ---
function createTaskElement(taskText, completed = false) {
  const li = document.createElement('li');
  li.classList.add('task-item');

  // Left
  const leftContainer = document.createElement('div');
  leftContainer.classList.add('task-left');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed;

  const span = document.createElement('span');
  span.textContent = taskText;
  if (completed) span.classList.add('completed');

  // Only attempt progression when in focus mode (confirmStep >= 2)
  checkbox.addEventListener('change', () => {
    span.classList.toggle('completed');
    if (confirmStep >= 2) {
      handleFocusProgress();
    } else {
      // if not in focus mode, just save state (regular toggle)
      saveState();
    }
  });

  leftContainer.append(checkbox, span);

  // Buttons
  const btnContainer = document.createElement('div');
  btnContainer.classList.add('task-buttons');

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => {
    li.remove();
    updateArrowVisibility();
    saveState();
  });

  const upBtn = document.createElement('button');
  upBtn.textContent = '↑';
  upBtn.addEventListener('click', () => {
    const prev = li.previousElementSibling;
    if (prev) taskList.insertBefore(li, prev);
    updateArrowVisibility();
    saveState();
  });

  const downBtn = document.createElement('button');
  downBtn.textContent = '↓';
  downBtn.addEventListener('click', () => {
    const next = li.nextElementSibling;
    if (next) taskList.insertBefore(next, li);
    updateArrowVisibility();
    saveState();
  });

  btnContainer.append(delBtn, upBtn, downBtn);
  li.append(leftContainer, btnContainer);
  taskList.appendChild(li);

  updateArrowVisibility();
  saveState();
}

// --- ARROW VISIBILITY ---
function updateArrowVisibility() {
  const items = Array.from(taskList.children);
  items.forEach((li, index) => {
    const buttons = li.querySelectorAll('.task-buttons button');
    const upBtn = buttons[1];
    const downBtn = buttons[2];

    if (upBtn && downBtn) {
      upBtn.style.visibility = 'visible';
      downBtn.style.visibility = 'visible';
      if (index === 0) upBtn.style.visibility = 'hidden';
      if (index === items.length - 1) downBtn.style.visibility = 'hidden';
    }
  });
}

// --- ADD TASK ---
function addTask() {
  const taskText = input.value.trim();
  if (!taskText) return;

  // if (taskList.children.length >= 3) {
  //   popupMessage.textContent = "Add only three tasks at a time!";
  //   popup.style.visibility = 'visible';
  //   return;
  // }

  createTaskElement(taskText);
  input.value = '';
  saveState();
}

// --- FOCUS MODE ---
let confirmStep = 0;

confirmBtn.addEventListener('click', () => {
  const tasks = Array.from(taskList.children);

  if (tasks.length < 3) {
    popupMessage.textContent = "Please add three tasks before confirming.";
    popup.style.visibility = 'visible';
    confirmStep = 0;
    return;
  }

  if (confirmStep === 0) {
    popupMessage.textContent = "Are you sure these are your 3 tasks for now?";
    popup.style.visibility = 'visible';
    confirmStep = 1;
    return;
  }

  if (confirmStep === 1) {
    input.disabled = true;
    addBtn.disabled = true;
    input.placeholder = "Locked — focus on your first task.";

    tasks.forEach((li, index) => {
      const checkbox = li.querySelector('input[type="checkbox"]');
      const btnContainer = li.querySelector('.task-buttons');
      if (btnContainer) btnContainer.style.display = 'none';

      if (index === 0) {
        li.classList.add('active-task');
        li.classList.remove('inactive-task');
        checkbox.disabled = false;
      } else {
        li.classList.add('inactive-task');
        li.classList.remove('active-task');
        checkbox.disabled = true;
      }
    });

    popupMessage.textContent = "Start with your first task — one at a time!";
    popup.style.visibility = 'visible';
    confirmStep = 2;
  }
});

// --- HANDLE TASK PROGRESSION ---
function handleFocusProgress() {
  // Only run when in focus mode
  if (confirmStep < 2) return;

  const tasks = Array.from(taskList.children);
  const activeIndex = tasks.findIndex(li => li.classList.contains('active-task'));
  if (activeIndex === -1) return;

  const activeTask = tasks[activeIndex];
  const checkbox = activeTask.querySelector('input[type="checkbox"]');

  // Make sure it's checked (user completed)
  if (!checkbox.checked) return;

  const text = activeTask.querySelector('span').textContent;
  totalCompletedToday++;

  // Move to completed
  const completedItem = document.createElement('li');
  completedItem.textContent = text;
  completedItem.style.textDecoration = 'line-through';
  completedItem.style.opacity = '0.7';
  completedSection.appendChild(completedItem);

  // Remove active task from list
  activeTask.remove();
  saveState();

  // Unlock next task (if any) AND remove its inactive-task class so it becomes interactable
  const nextTask = taskList.children[0];
  if (nextTask) {
    const nextCheckbox = nextTask.querySelector('input[type="checkbox"]');
    nextTask.classList.add('active-task');
    nextTask.classList.remove('inactive-task'); // <-- critical fix
    nextCheckbox.disabled = false;
  } else {
    if (totalCompletedToday >= 9) {
      showLimitPopup();
    } else {
      triggerNewRound();
    }
  }

  updateArrowVisibility();
}

// --- NEW ROUND ---
function triggerNewRound() {
  colorStage++;
  updateBackgroundColor();

  popupMessage.textContent = "🎉 All tasks completed! Do you want to do more?";
  popup.style.visibility = 'visible';

  // use onclick to ensure only this behavior while pop is visible
  popupOk.onclick = () => {
    popup.style.visibility = 'hidden';
    startNewTaskRound();
  };

  saveState();
}

// --- DAILY LIMIT REACHED ---
function showLimitPopup() {
  lockForToday();
  popupMessage.textContent = "😎 That's enough for today — go rest or do something fun!";
  popup.style.visibility = 'visible';
  saveState();
}

function lockForToday() {
  input.disabled = true;
  addBtn.disabled = true;
  confirmBtn.disabled = true;
  input.placeholder = "Rest day — new round unlocks tomorrow 🌅";
}

// --- NEW ROUND SETUP ---
function startNewTaskRound() {
  input.disabled = false;
  addBtn.disabled = false;
  confirmBtn.disabled = false;
  input.placeholder = "Add your task .....";
  confirmStep = 0;
  taskList.innerHTML = "";
  saveState();
  updateArrowVisibility();
}

// --- BACKGROUND COLOR STAGE ---
function updateBackgroundColor() {
  const body = document.body;
  const colors = [
    "linear-gradient(135deg, #333, #444)",
    "linear-gradient(135deg, #2b5876, #4e4376)",
    "linear-gradient(135deg, #283E51, #485563)",
    "linear-gradient(135deg, #373B44, #4286f4)",
    "linear-gradient(135deg, #0F2027, #203A43, #2C5364)",
    "linear-gradient(135deg, #1f4037, #99f2c8)"
  ];
  body.style.background = colors[Math.min(colorStage, colors.length - 1)];
  body.style.transition = "background 1s ease";
}

// --- POPUP OK ---
popupOk.addEventListener('click', () => {
  popup.style.visibility = 'hidden';
  if (confirmStep === 1) confirmBtn.click();
});

// --- KEYBOARD ---
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === 'Escape') {
    if (popup.style.visibility === 'visible') {
      popupOk.click();
    } else {
      addTask();
    }
  }
});

addBtn.addEventListener('click', addTask);

// --- INITIAL LOAD ---
loadState();

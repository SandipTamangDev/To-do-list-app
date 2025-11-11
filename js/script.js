// Refactored To-Do List App JS

// DOM elements
const addBtn = document.getElementById('add');
const taskList = document.getElementById('task-list');
const input = document.querySelector('.container input');
const confirmBtn = document.getElementById('confirm');

const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupOk = document.getElementById('popup-ok');

// Task Class
class Task {
    constructor(text, completed = false) {
    this.text = text;
    this.completed = completed;
}
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => createTaskElement(task.text, task.completed));
}

// Save tasks to localStorage
function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => {
    const span = li.querySelector('span');
    const checkbox = li.querySelector('input[type="checkbox"]');
    return new Task(span.textContent, checkbox.checked);
});
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Create task element
function createTaskElement(taskText, completed = false) {
const li = document.createElement('li');
li.classList.add('task-item');

// Left container
const leftContainer = document.createElement('div');
leftContainer.classList.add('task-left');

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = completed;

const span = document.createElement('span');
span.textContent = taskText;
if (completed) span.classList.add('completed');

checkbox.addEventListener('change', () => {
    span.classList.toggle('completed');
    saveTasks();
});

leftContainer.append(checkbox, span);

// Buttons container
const btnContainer = document.createElement('div');
btnContainer.classList.add('task-buttons');

const delBtn = document.createElement('button');
delBtn.textContent = 'Delete';
delBtn.addEventListener('click', () => {
    li.remove();
    saveTasks();
});

const upBtn = document.createElement('button');
upBtn.textContent = '↑';
upBtn.addEventListener('click', () => {
    const prev = li.previousElementSibling;
    if (prev) taskList.insertBefore(li, prev);
    saveTasks();
});

const downBtn = document.createElement('button');
downBtn.textContent = '↓';
downBtn.addEventListener('click', () => {
    const next = li.nextElementSibling;
    if (next) taskList.insertBefore(next, li);
    saveTasks();
});

btnContainer.append(delBtn, upBtn, downBtn);

li.append(leftContainer, btnContainer);
taskList.appendChild(li);

}

// Add new task
function addTask() {
const taskText = input.value.trim();
if (!taskText) return;

if (taskList.children.length >= 3) {
    const messages = [
        "Choose only three tasks that matter the most today!",
        "Make it three so you won't regret doing nothing later!",
        "Focus on these three—are you ready to complete them?",
        "Less is more: pick three and give them your best shot!",
        "Three tasks today = a productive, regret-free day!",
        "Prioritize your day: finish these three and win!"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    popupMessage.textContent = randomMessage;
    popup.style.visibility = 'visible';
    return;
}

createTaskElement(taskText);
input.value = '';
saveTasks();

}

// Event listeners
input.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key ==='Escape') {
        if (popup.style.visibility === 'visible') {
            popupOk.click();
        } else {
            addTask();
        }
    }
});

addBtn.addEventListener('click', addTask);
popupOk.addEventListener('click', () => { popup.style.visibility = 'hidden'; });

let confirmStep = 0; // 0 = first confirmation, 1 = final lock-in

confirmBtn.addEventListener('click', () => {
    const tasks = Array.from(taskList.children);

    // Require exactly 3 tasks before allowing confirmation
    if (tasks.length < 3) {
        popupMessage.textContent = "Please add three tasks and prioritize them before moving forward.";
        popup.style.visibility = 'visible';
        confirmStep = 0; // reset just in case
        return;
    }

    // FIRST click → Ask for confirmation
    if (confirmStep === 0) {
        popupMessage.textContent = "Are you sure these are your 3 prioritized tasks for today?";
        popup.style.visibility = 'visible';
        confirmStep = 1;
        return;
    }

    // SECOND click (after OK) → Lock focus mode
    if (confirmStep === 1) {
        input.disabled = true;
        addBtn.disabled = true;
        input.placeholder = "Locked — focus on your first task.";

        tasks.forEach((li, index) => {
            const buttons = li.querySelectorAll('button');
            const checkbox = li.querySelector('input[type=\"checkbox\"]');
            const btnContainer = li.querySelector('.task-buttons');

            if (index === 0) {
                li.classList.add('active-task');
                li.classList.remove('inactive-task');
                checkbox.disabled = false;
                if (btnContainer) btnContainer.style.display = 'none';
            } else {
                li.classList.add('inactive-task');
                li.classList.remove('active-task');
                checkbox.disabled = true;
                if (btnContainer) btnContainer.style.display = 'none';
            }
        });

        popupMessage.textContent = "Start with your first task — one at a time!";
        popup.style.visibility = 'visible';
        confirmStep = 2; // prevent further confirmations
    }
});

// Popup OK handler — advances confirmation step if needed
popupOk.addEventListener('click', () => {
    popup.style.visibility = 'hidden';

    // If user just confirmed step 1, trigger the lock-in logic
    if (confirmStep === 1) {
        confirmBtn.click();
    }
});






// Initial load
loadTasks();

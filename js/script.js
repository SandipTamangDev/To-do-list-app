const add = document.getElementById('add');
const taskList = document.getElementById('task-list');
const input = document.querySelector('.container input');
const next = document.getElementById('next');

const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupOk = document.getElementById('popup-ok');

function addTask() {
    const taskText = input.value.trim();
    if (taskText === "") return;

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

        // Show popup
        popupMessage.textContent = randomMessage;
        popup.style.visibility = 'visible';
        return;
    }

    const li = document.createElement('li');
    li.textContent = taskText;
    taskList.appendChild(li);

    input.value = '';
}

add.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (popup.style.visibility === 'visible') {
            popupOk.click(); // trigger OK if popup is visible
        } else {
            addTask(); // otherwise add task
        }
    }
});

next.addEventListener('click', () => {
    window.location.href = 'priority.html';
});

// Close popup on OK click
popupOk.addEventListener('click', () => {
    popup.style.visibility = 'hidden';
});

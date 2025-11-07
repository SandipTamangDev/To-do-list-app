const add = document.getElementById('add');
const taskList = document.getElementById('task-list');
const input = document.querySelector('.container input')

function addTask () {
    const taskText = input.value.trim();
    if (taskText === "") {
        return;
    }

    if (taskList.children.length >= 3) {
        const messages = [
            "Choose only three tasks that matter the most today!",
            "Make it three so you won't regret doing nothing later!",
            "Focus on these three—are you ready to complete them?",
            "Less is more: pick three and give them your best shot!",
            "Three tasks today = a productive, regret-free day!",
            "Prioritize your day: finish these three and win!"
        ];


        const randomMessage = messages[Math.floor(Math.random()* messages.length)];
        alert(randomMessage);
        return;
    }

    const li = document.createElement('li');
    li.textContent = taskText;

    taskList.appendChild(li);

    input.value = '';
}

add.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});




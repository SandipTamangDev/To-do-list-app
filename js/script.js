const button = document.getElementById('button');
const taskList = document.getElementById('task-list');
const input = document.querySelector('.container input')

button.addEventListener('click', () =>{
    const taskText = input.value.trim();
    if (taskText === "") {
        return;
    }

    const li = document.createElement('li');
    li.textContent = taskText;

    taskList.appendChild(li);

    input.value = '';
    
});
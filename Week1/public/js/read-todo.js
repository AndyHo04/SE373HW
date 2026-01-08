fetch('/todo').then(response => response.json()).then(data => {
    const todoList = document.querySelector('.container');
    let htmloutput = '';

    data.forEach(item => {
        htmloutput += `<div class="todo-item">
            <h2>Todo ID: ${item.id}</h2>
            <h3>${item.title}</h3>
            <p>Completed Status: ${item.completed ? 'True' : 'False'}</p>
        </div>`;
    });
    
    todoList.innerHTML += htmloutput;
});
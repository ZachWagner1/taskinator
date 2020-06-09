var buttonEl = document.querySelector("#save-task");
var tasksToDoEl = document.querySelector("#tasks-to-do");


var createTaskHandler = function() {
    //create new item
    var listItemEl = document.createElement("li");
    //style the item
    listItemEl.className = "task-item";
    //add the text
    listItemEl.textContent = "this is a new task."
    //append element to task list
    tasksToDoEl.appendChild(listItemEl);
}
buttonEl.addEventListener("click", createTaskHandler);
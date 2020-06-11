var pageContentEl = document.querySelector('#page-content');
var formEl = document.querySelector('#task-form');
var tasksToDoEl = document.querySelector('#tasks-to-do');
var tasksInProgressEl = document.querySelector('#tasks-in-progress');
var tasksCompletedEl = document.querySelector('#tasks-completed');
var taskIdCounter = 0;
var tasks = [];

// FUNCTION TO INTITIATE ROUTINE TO DYNAMICALLY CREATE/UPDATE TASK ITEM WHEN FORM TO ADD TASK IS SUBMITTED
var taskFormHandler = function(event) {
  // prevent page reload on form submit
	event.preventDefault();

  // cache name of task from user's text input
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  // cache task type from user's selected option
	var taskTypeInput = document.querySelector("select[name='task-type']").value;

  // make sure user does not submit form with empty field/s
	// check if input values are empty strings 
	if (!taskNameInput || !taskTypeInput) {
    // if so alert message
    alert('You need to fill out the task form!');
    // stop function and wait for valid form submission
		return false;
	}

  // clear form inputs
	formEl.reset();

  // if form has data-task-id attribute, that means it has been given the attr by the editTask() function, therefore it is a flag to say the form is in an editing state.  the task id value held in the data-task-id attribute will be needed to keep track of which task is being edited.  the form is the parent container so that's why we keep the flag on it.
	var isEdit = formEl.hasAttribute('data-task-id');

	// has data attribute, so get task id from data-task-id attribute and call function to complete edit process
	if (isEdit) {
		var taskId = formEl.getAttribute('data-task-id');
		completeEditTask(taskNameInput, taskTypeInput, taskId);
	} else {
		// no data attribute, so create object as normal and pass to createTaskEl function

		// package up data as an object
		var taskDataObj = {
			name   : taskNameInput,
			type   : taskTypeInput,
			status : 'to do'
		};
		// send it as argument to createTaskEl
		createTaskEl(taskDataObj);
	}
};


// CALLBACK FUNCTION TO DYNAMICALLY BUILD HTML TO DISPLAY TASK USING DATA PASSED AS ARGUMENT FROM CALLING FUNCTION
var createTaskEl = function(taskDataObj) {
	// create list item to hold entire task
  var listItemEl = document.createElement('li');
  // give list item a class for styling
	listItemEl.className = 'task-item';

	// add task id to task as a custom attribute.  taskIdCounter is initialized in global scope and at the end of this function will be incremented to ensure that each task will get a unique id
  listItemEl.setAttribute('data-task-id', taskIdCounter);
  // add draggable attribute to task for drag functionality
	listItemEl.setAttribute('draggable', 'true');

	// create div to hold task info and add to list item (the task)
	var taskInfoEl = document.createElement('div');
	// give it a class name
	taskInfoEl.className = 'task-info';
	// add HTML content to div with innerHTML.  an h3 will display the task name ('Walk Dog', 'Clean house', etc).  the type chosen in the form will be displayed in a span.  the dynamic values from the object are concatenated with HTML markup within strings
	taskInfoEl.innerHTML =
		"<h3 class='task-name'>" +
		taskDataObj.name +
		"</h3><span class='task-type'>" +
		taskDataObj.type +
		'</span>';
  // add task-info div to task li
	listItemEl.appendChild(taskInfoEl);

  // call createTaskActions function with the counter as an argument so the id can be added as a data-task-id attribute.  cache the returned HTML in a variable so it can be appended.
  var taskActionsEl = createTaskActions(taskIdCounter);
  // append task-actions div to task li
	listItemEl.appendChild(taskActionsEl);

  // check status so tasks loaded from localStorage will be put into the correct column
  
  // for new tasks 'to do' is the default
	if (taskDataObj.status === 'to do') {
    // look within the task li for a select element with a name attribute of 'status-change' and set it's selectedIndex property to correspond to the first option, so it displays 'To Do'.  
    listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
    // place this task in the 'To Do' column
		tasksToDoEl.appendChild(listItemEl);
	} else if (taskDataObj.status === 'in progress') {
		listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
		tasksInProgressEl.appendChild(listItemEl);
	} else if (taskDataObj.status === 'completed') {
		listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
		tasksCompletedEl.appendChild(listItemEl);
	}

  // once we've created task li, create a new id property inline on the task object and assign it the current value of the counter.  we will need this later to keep track of our tasks when we dynamically populate the UI on page load based on data from localStorage
  taskDataObj.id = taskIdCounter;
  // add this task object to tasks array
  tasks.push(taskDataObj);
  // since we've created a new task, save it to localStorage
	saveTasks();

	// increase task counter so next task will have a unique id
	taskIdCounter++;
};

// CALLBACK FUNCTION TO CREATE TASK ACTIONS DIV
// called from createTaskEl.  responsible for creating div (actionContainerEl) to hold task-action buttons and select input, which are appended to actionContainerEl.  actionContainerEl is then returned back to createTaskEl where it is appended to the task li.  the function receives the counter variable as an argument which it sets as the value to a data-task-id attribute on each sub-element so they are all identified and kept track of
var createTaskActions = function(taskId) {
  // create parent div
  var actionContainerEl = document.createElement('div');
  // add class for styling
	actionContainerEl.className = 'task-actions';

  // create edit button
  var editButtonEl = document.createElement('button');
  // specify button text
  editButtonEl.textContent = 'Edit';
  // add classes for styling
  editButtonEl.className = 'btn edit-btn';
  // add id attribute
	editButtonEl.setAttribute('data-task-id', taskId);
  // append button to parent div
	actionContainerEl.appendChild(editButtonEl);

	// create delete button
  var deleteButtonEl = document.createElement('button');
  // specify button text
  deleteButtonEl.textContent = 'Delete';
  // add classes for styling
  deleteButtonEl.className = 'btn delete-btn';
  // add id attribute
	deleteButtonEl.setAttribute('data-task-id', taskId);
  // append button to parent div
	actionContainerEl.appendChild(deleteButtonEl);

	// create select input
  var statusSelectEl = document.createElement('select');
  // add classes for styling
  statusSelectEl.className = 'select-status';
  // add name attribute to differentiate this select input from the one in the form so it can be found in createTaskEl to determine which column to place it's associated task in
  statusSelectEl.setAttribute('name', 'status-change');
  // add id attribute
	statusSelectEl.setAttribute('data-task-id', taskId);

  // we will loop over an array to dynamically add options to our select input
	var statusChoices = [ 'To Do', 'In Progress', 'Completed' ];

  // loop for the number of times as there are elements in the array
	for (var i = 0; i < statusChoices.length; i++) {
		// create option element
    var statusOptionEl = document.createElement('option');
    // assign the value at current array index to be the text content of the option created by current iteration
    statusOptionEl.textContent = statusChoices[i];
    // assign the value at current array index to be the value of the option's value attribute
		statusOptionEl.setAttribute('value', statusChoices[i]);

		// append to select
		statusSelectEl.appendChild(statusOptionEl);
	}

  // append select input to parent div
	actionContainerEl.appendChild(statusSelectEl);

  // return task-actions div to calling function (createTaskEl) 
	return actionContainerEl;
};

// HERE IS THE DOM STRUCTURE THAT IS GENERATED BY CREATETASKEL() AND CREATETASKACTIONS()
                  // finished task
                  // createTaskEl(taskDataObj)
                  // <li class="task-item" data-task-id="0" draggable="true">
                  //   <div class="task-info">
                  //     <h3 class="task-name">test</h3>
                  //     <span class="task-type">Print</span>
                  //   </div>
                  //   // createTaskActions(taskId)
                  //   <div class="task-actions">
                  //     <button class="btn edit-btn" data-task-id="0">Edit</button>
                  //     <button class="btn delete-btn" data-task-id="0">Delete</button>
                  //     <select class="select-status" name="status-change" data-task-id="0">
                  //       <option value="To Do">To Do</option>
                  //       <option value="In Progress">In Progress</option>
                  //       <option value="Completed">Completed</option>
                  //     </select>
                  //   </div>
                  // </li>


// FUNCTION TO HANDLE CLICK EVENTS ON TASK ACTION BUTTONS.  IT'S JOB IS TO IDENTIFY IF THE EDIT OR DELETE BUTTON WAS CLICKED AND OUTSOURCE THE WORK TO EDIT OR DELETE SUB-FUNCTION.  IT PASSES ALONG THE ID OF THE ELEMENT WHICH FIRED THE EVENT SO THE SUB-FUNCTIONS KNOW WHICH TASK TO EDIT OR DELETE
// take in event object as argument 
var taskButtonHandler = function(event) {
	// get target element from event so we know which element fired the event
	var targetEl = event.target;

	// if the edit button was clicked, the target element will have the class .edit-btn
	if (targetEl.matches('.edit-btn')) {
		// get the element's task id which was set in createTaskActions
    var taskId = targetEl.getAttribute('data-task-id');
    // call edit function, passing in id so it knows which task to edit
		editTask(taskId);
	}
	// if the delete button was clicked
	if (targetEl.matches('.delete-btn')) {
		// get the element's task id
    var taskId = targetEl.getAttribute('data-task-id');
    // call delete function
		deleteTask(taskId);
	}
};

// FUNCTION CALLED BY TASKBUTTONHANDLER TO EDIT/UPDATE TASK. IT RECEIVES THE ID OF THE TASK AS AN ARGUMENT SO IT KNOWS WHICH TASK TO EDIT.  THIS FUNCTION POPULATES THE FORM FIELDS WITH THE DATA OF THE TASK TO BE EDITED AND CHANGES THE TEXT OF THE FORM BUTTON TO 'SAVE' FROM 'ADD'.  TO COMPLETE THE EDITING PROCESS, THE SAME LISTENER IS WAITING ON THE FORM BUTTON WHICH WILL FIRE THE TASKFORMHANDLER() WHICH HAS A CONDITIONAL CHECK TO SEE IF THERE IS A DATA-TASK-ID ATTRIBUTE WHICH IS A FLAG TO SAY THAT THE FORM IS IN THE EDIT STATE SO THAT FUNCTION WILL CALL THE COMPLETEEDITTASK() FUNCTION, PASSING ALONG ALL THE DATA FROM THE FORM (WHICH WE ARE POPULATING IN THIS FUNCTION) AND THE ID THAT WAS SET WHEN THE BUTTON WAS DYNAMICALLY GENERATED IN CREATETASKACTIONS()
var editTask = function(taskId) {
  // set id attribute on form as flag for editing state and so form knows which task to edit/update
	formEl.setAttribute('data-task-id', taskId);

	// get and cache task list item element to be edited.  we're looking for the task element that has a class of .task-item and a data-task-id attribute with the value of the id passed in as an argument
	var taskSelected = document.querySelector(
		".task-item[data-task-id='" + taskId + "']"
	);

	// get and cache content from task li's name and type
	var taskName = taskSelected.querySelector('h3.task-name').textContent;

	var taskType = taskSelected.querySelector('span.task-type').textContent;

  // here we are populating the form inputs with data from the task li element we want to update/  when the completeEditTask gets called from taskFormHandler(), it will receive the data it needs from the form fields that we are populating here in this function
  // find the input element with the name attribute of 'task-name' and set it's value to display the same thing that is in the task's li h3.task-name.  NOTE...the name attribute was used on the input in the HTML instead of class or id because it is the most appropriate choice.  it is okay that we used the same value later as a class name for dynamically generated elements for styling purposes...there is no conflict.
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;
  // update the display text of the form button so user understands we are in editing mode
	document.querySelector('#save-task').textContent = 'Save Task';
};

// FUNCTION CALLED FROM TASKFORMHANDLER() BASED ON ISEDIT CONDITION.  IT'S FIRST 2 ARGUMENTS ARE COLLECTED FROM THE FORM FIELDS WHICH WE POPULATED IN EDITTASK().  THE TASKID IS COMING FROM THE EVENT.TARGET IN TASKBUTTONHANDLER WHERE IT WAS PASSED TO EDITTASK() WHERE IT WAS SET AS AN ATTRIBUTE ON THE FORM ITSELF SO WE COULD HAVE ACCESS TO IT HERE
var completeEditTask = function(taskName, taskType, taskId) {
	// find the matching task list item based on it's id
	var taskSelected = document.querySelector(
		".task-item[data-task-id='" + taskId + "']"
	);

	// set new values in task li from updated form fields which came through as arguments from the calling function taskFormHandler().
	taskSelected.querySelector('h3.task-name').textContent = taskName;
	taskSelected.querySelector('span.task-type').textContent = taskType;

  // now we need to update the data in localStorage so the task will reload correctly with the new data
	// loop through tasks array to find the correct task and update the associated task object with the new content
	for (var i = 0; i < tasks.length; i++) {
    // attribute values are always strings so we need to parse it into a number to find the right task in our array
		if (tasks[i].id === parseInt(taskId)) {
      // update relevant properties of the object at the matching array index
			tasks[i].name = taskName;
			tasks[i].type = taskType;
		}
	}

  // update localStorage with new array data
	saveTasks();

  // remove attribute from form so it will no longer be in editing state
  formEl.removeAttribute('data-task-id');
  // change button text back to Add
  document.querySelector('#save-task').textContent = 'Add Task';
};


// FUNCTION TO MOVE TASK TO APPROPRIATE UL COLUMN BASED ON IT'S SELECT OPTION VALUE.  THIS HANDLES ANY CHANGE EVENT FIRED ON THE MAIN#PAGE-CONTENT OR IT'S CHILDREN (BECAUSE OF EVENT PROPAGATION/BUBBLING)
var taskStatusChangeHandler = function(event) {
	// get and cache the task item's id from it's select element that fired the event
	var taskId = event.target.getAttribute('data-task-id');

	// get and cache the currently selected option's value and convert to lowercase to future proof against adding additional options with perhaps different case convention. 
	var statusValue = event.target.value.toLowerCase();

	// find and cache the parent task item element based on the id which will correspond to it's child select elements id
	var taskSelected = document.querySelector(
		".task-item[data-task-id='" + taskId + "']"
	);

  // append the task to appropriate column based on value of select element
	if (statusValue === 'to do') {
		tasksToDoEl.appendChild(taskSelected);
	} else if (statusValue === 'in progress') {
		tasksInProgressEl.appendChild(taskSelected);
	} else if (statusValue === 'completed') {
		tasksCompletedEl.appendChild(taskSelected);
	}

  // update task's status in tasks array for localStorage
  // loop over task array
	for (var i = 0; i < tasks.length; i++) {
    // find matching id (parse to number)
		if (tasks[i].id === parseInt(taskId)) {
      // update status property of object in array
			tasks[i].status = statusValue;
		}
  }
  // save changes to localStorage
	saveTasks();
};

// FUNCTION CALLED FROM TASKBUTTONHANDLER IF TASK ACTION BUTTON THAT WAS CLICKED WAS THE DELETE BUTTON. RECEIVES THE ID RETRIEVED FROM THE DATA-TASK-ID ATTRIBUTE ON THE BUTTON ELEMENT WHICH FIRED THE EVENT
var deleteTask = function(taskId) {
  // find and cache the task item that has the data-task-id that corresponds to same attribute on child button element
	var taskSelected = document.querySelector(
		".task-item[data-task-id='" + taskId + "']"
  );

  // remove the task from the DOM
  // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
  taskSelected.remove();
  
	// we're not just updating an object property on an array element, we need to completely remove the element from the array.  a good way to do this is to create a new array that filters out the deleted array and holds an updated list of tasks
	var updatedTaskArr = [];

	// loop through current tasks
	for (var i = 0; i < tasks.length; i++) {
		// if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
		if (tasks[i].id !== parseInt(taskId)) {
			updatedTaskArr.push(tasks[i]);
		}
	}
	// reassign tasks array to be the same as updatedTasksArr
	tasks = updatedTaskArr;

  // save new array to localStorage
	saveTasks();
};

// THESE FUNCTIONS IMPLEMENT THE DRAG AND DROP FUNCTIONALITY

// basic working of drag behavior
    // drag and drop events are both of the same type DragEvent, so they both have access to the data held in the dataTransfer property
    // on 'dragstart', record reference to dragged element in the event.dataTransfer property with setData()
    // when item is dropped, use that reference to locate element in DOM, using getData() so we can remove it from current place in DOM and append it to it's final DOM location
    // the 'dragover' event lets us define a drop zone...where draggable elements can be dropped
    

// THIS FUNCTION IS FIRED BY AN ELEMENT THAT HAS THE DRAGGABLE='TRUE' ATTRIBUTE.  WHEN THE MOUSE BUTTON IS CLICKED AND HELD OVER ONE OF THESE ELEMENTS, AND THE CURSOR IS MOVED, THE BEGINNING OF THE DRAGGING BEHAVIOR (DRAGSTART) IS FIRED AND THIS HANDLER IS CALLED.  IT STORES THE ID OF THE DRAGGED ELEMENT SO IT CAN BE REFERENCED LATER IN THE DROPTASKHANDLER() FUNCTION
var dragTaskHandler = function(event) {
  // get id of dragged element
  var taskId = event.target.getAttribute('data-task-id');
  // event.dataTransfer object holds data related to drag event so it can be retrieved by the drop event.  it takes 2 arguments...the data's format and the data's value
	event.dataTransfer.setData('text/plain', taskId);
};

// THIS FUNCTION DEFINES THE PARENT TASK-LIST UL OF ANY ELEMENT THAT IS DRAGGED OVER AS A DROP ZONE, ALLOWING THE DRAGGABLE ELEMENT TO BE DROPPED IN THIS AREA BY PREVENTING THE EVENT'S DEFAULT BEHAVIOR OF NOT ALLOWING ELEMENTS TO BE DROPPED ONTO ONE ANOTHER
var dropZoneDragHandler = function(event) {
  // limit our drop zone to ul's.  get and cache the task-list ul that is dragged over, or is the nearest ancestor of whichever child element that is dragged over using .closest()
  //https://developer.mozilla.org/en-US/docs/Web/API/Element/closest 
  var taskListEl = event.target.closest('.task-list');
  // if .closest returns an element (!null)
	if (taskListEl) {
    // allow elements to be dropped on one another
    event.preventDefault();
    // style droppable element
		taskListEl.setAttribute(
			'style',
			'background: rgba(68, 233, 255, 0.7); border-style: dashed;'
		);
	}
};

// FUNCTION FIRED BY DROP EVENT...WHEN THE MOUSE BUTTON IS RELEASED OVER A DROPPABLE AREA
var dropTaskHandler = function(event) {
  // get and cache id of dragged element from event.dataTransfer object
  var id = event.dataTransfer.getData('text/plain');
  // get and cache dragged element based on the retrieved id. querySelector returns the first match it finds which will be the parent task-item li
  var draggableElement = document.querySelector("[data-task-id='" + id + "']");
  // get and cache the parent ul.task-list of the element that was dropped on (that fired the event)
  var dropZoneEl = event.target.closest('.task-list');
  // get id of ul that is the drop zone (#tasks-to-do, #tasks-in-progress, #tasks-completed)
	var statusType = dropZoneEl.id;
 
  // find and cache select element inside the task-item li
  var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
   // set status of task based on dropZone id using selectedIndex to display correct option
	if (statusType === 'tasks-to-do') {
		statusSelectEl.selectedIndex = 0;
	} else if (statusType === 'tasks-in-progress') {
		statusSelectEl.selectedIndex = 1;
	} else if (statusType === 'tasks-completed') {
		statusSelectEl.selectedIndex = 2;
	}

  // remove the styling that was applied to drop zone in dragover event
	dropZoneEl.removeAttribute('style');

  // append dragged element to the ul that is the drop zone so it's in the correct column
	dropZoneEl.appendChild(draggableElement);

	// loop through tasks array to find and update the updated task's status.  as above
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id === parseInt(id)) {
      // update status of moved task in the tasks array 
			tasks[i].status = statusSelectEl.value.toLowerCase();
		}
	}

  // save updated array to localStorage
	saveTasks();
};

// THIS FUNCTION REMOVES THE STYLING ON DROP ZONES WHICH ARE NOT DROPPED UPON, ONCE THE DRAGGABLE ELEMENT LEAVES THIS AREA SO THE USER KNOWS THE ELEMENT IS NO LONGER ABOVE A DROPPABLE AREA.  FIRED BY DRAGLEAVE EVENT
var dragLeaveHandler = function(event) {
  // find and cache parent ul of drop zone
  var taskListEl = event.target.closest('.task-list');
  // if .closest does not return null
	if (taskListEl) {
    // remove the style
		taskListEl.removeAttribute('style');
	}
};

// THIS FUNCTION STORES TASKS ARRAY TO LOCAL STORAGE SO DATA PERSISTS AND PAGE CAN BE POPULATED WITH TASKS FROM PREVIOUS BROWSING SESSIONS
var saveTasks = function() {
  // tasks is an array and localStorage only stores strings so we must JSON.stringify it
	localStorage.setItem('tasks', JSON.stringify(tasks));
};

// THIS FUNCTION RETRIEVES TASKS DATA FROM LOCAL STORAGE AND POPULATES UI WITH TASKS FROM PREVIOUS BROWSING SESSIONS
var loadTasks = function() {
	// Get task items from localStorage
  var savedTasks = localStorage.getItem('tasks');
  // if there is nothing in localStorage, leave function
	if (!savedTasks) {
		return false;
	}

	// Convert tasks from stringified format back into array of objects
	savedTasks = JSON.parse(savedTasks);

	// Iterate through savedTasks array and pass each object to createTaskEl to create task elements on page from array data
	for (var i = 0; i < savedTasks.length; i++) {
		// pass each object into the createTaskEl() function
		createTaskEl(savedTasks[i]);
	}
};

formEl.addEventListener('submit', taskFormHandler);
pageContentEl.addEventListener('click', taskButtonHandler);
pageContentEl.addEventListener('change', taskStatusChangeHandler);
pageContentEl.addEventListener('dragstart', dragTaskHandler);
pageContentEl.addEventListener('dragover', dropZoneDragHandler);
pageContentEl.addEventListener('drop', dropTaskHandler);
pageContentEl.addEventListener('dragleave', dragLeaveHandler);

loadTasks();
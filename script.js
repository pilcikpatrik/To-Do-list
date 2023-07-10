// Vybereme HTML elementy z dokumentu
const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

// Definujeme klíče pro lokalní úložiště
const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListsId'

// Načteme seznamy a vybraný seznam z lokálního úložiště
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY) || '[]')
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

// Listener pro kliknutí na seznam
listsContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId
        saveAndRender()  // Uložíme a znovu vykreslíme stav
    }
})

// Listener pro kliknutí na úlohu
tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id === selectedListId)
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id )
        selectedTask.complete = e.target.checked
        save() // Uložíme stav
        renderTaskCount(selectedList) // Vykreslíme počet úloh
    }
})

// Listener pro odstranění dokončených úloh
clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()  // Uložíme a znovu vykreslíme stav
})

// Listener pro odstranění seznamu
deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()  // Uložíme a znovu vykreslíme stav
})

// Listener pro přidání nového seznamu
newListForm.addEventListener ('submit', e => {
    e.preventDefault()  // Zabráníme odeslání formuláře
    const listName = newListInput.value
    if (listName == null || listName === '') return
    const list = createList(listName)
    newListInput.value = null
    lists.push(list)
    saveAndRender()  // Uložíme a znovu vykreslíme stav
})

// Listener pro přidání nové úlohy
newTaskForm.addEventListener ('submit', e => {
    e.preventDefault()  // Zabráníme odeslání formuláře
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(task)
    saveAndRender()  // Uložíme a znovu vykreslíme stav
})

// Funkce pro vytvoření nového seznamu
function createList(name) {
   return { id: Date.now().toString(), name: name, tasks: [] } 
}

// Funkce pro vytvoření nové úlohy
function createTask (name) {
    return { id: Date.now().toString(), name: name, complete: false } 
}

// Funkce pro uložení a vykreslení stavu
function saveAndRender () {
    save()
    render()
}

// Funkce pro uložení stavu do lokálního úložiště
function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

// Hlavní vykreslovací funkce
function render () {
    clearElement(listsContainer)  // Vyčistíme kontejner
    renderLists()  // Vykreslíme seznamy
    const selectedList = lists.find(list => list.id === selectedListId)
    if (selectedListId == null) {
        listDisplayContainer.style.display = 'none'
    } else {
        listDisplayContainer.style.display = ''
        listTitleElement.innerText = selectedList.name
        renderTaskCount(selectedList)
        clearElement(tasksContainer)  // Vyčistíme kontejner
        renderTasks(selectedList)  // Vykreslíme úlohy
    }
}

// Funkce pro vykreslení úloh
function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.complete
        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

// Funkce pro vykreslení počtu úloh
function renderTaskCount(selectedList) {
    const incompleteTasksCount = selectedList.tasks.filter(task => !task.complete).length
    const taskString = incompleteTasksCount === 1 ? "task" : "tasks"
    listCountElement.innerText = `${incompleteTasksCount} ${taskString} remaining`
}

// Funkce pro vykreslení seznamů
function renderLists () {
    clearElement(listsContainer)  // Vyčistíme kontejner
    lists.forEach(list => {
        const listElement = document.createElement('li')
        listElement.dataset.listId = list.id
        listElement.classList.add('list-name')
        listElement.innerText = list.name
        if (list.id === selectedListId) {
            listElement.classList.add('active-list')
        } 
        listsContainer.appendChild(listElement)
    });
}

// Funkce pro vyčištění HTML elementu
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

// První vykreslení při načtení stránky
render()

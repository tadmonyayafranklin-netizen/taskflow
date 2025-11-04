document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoPriority = document.getElementById('todo-priority');
    const todoCategory = document.getElementById('todo-category');
    const todoList = document.getElementById('todo-list');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const totalTasksSpan = document.querySelector('.total-tasks');
    const completedTasksSpan = document.querySelector('.completed-tasks');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    let searchTerm = '';

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    todoDate.min = today;

    // Initial render
    renderTodos();
    updateStats();

    // Add new todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const todoText = todoInput.value.trim();
        if (todoText) {
            const todo = {
                id: Date.now(),
                text: todoText,
                date: todoDate.value,
                priority: todoPriority.value,
                category: todoCategory.value,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            todos.unshift(todo); // Add to beginning of array
            saveTodos();
            renderTodos();
            updateStats();
            
            // Reset form
            todoForm.reset();
            todoDate.value = ''; // Clear date explicitly
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderTodos();
    });

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // Clear completed todos
    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    });

    // Toggle todo completion
    todoList.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (todoItem && !e.target.matches('.delete-btn')) {
            const todoId = Number(todoItem.dataset.id);
            toggleTodo(todoId);
        }
    });

    // Delete todo
    todoList.addEventListener('click', (e) => {
        if (e.target.matches('.delete-btn')) {
            const todoItem = e.target.closest('.todo-item');
            const todoId = Number(todoItem.dataset.id);
            deleteTodo(todoId);
        }
    });

    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
        updateStats();
    }

    function deleteTodo(id) {
        const todoEl = document.querySelector(`[data-id="${id}"]`);
        todoEl.style.animation = 'slideOut 0.3s ease forwards';
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
            updateStats();
        }, 300);
    }

    function updateStats() {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        
        totalTasksSpan.textContent = `Total: ${total}`;
        completedTasksSpan.textContent = `Completed: ${completed}`;
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function getFilteredTodos() {
        let filtered = [...todos];
        
        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(searchTerm) ||
                todo.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply filter
        switch(currentFilter) {
            case 'active':
                return filtered.filter(todo => !todo.completed);
            case 'completed':
                return filtered.filter(todo => todo.completed);
            default:
                return filtered;
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function renderTodos() {
        const filteredTodos = getFilteredTodos();
        todoList.innerHTML = '';
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            const dueDate = formatDate(todo.date);
            const isOverdue = !todo.completed && new Date(todo.date) < new Date(today);
            
            li.innerHTML = `
                <div class="todo-content">
                    <span class="priority-indicator priority-${todo.priority}"></span>
                    <div>
                        <div class="todo-text">${todo.text}</div>
                        <div class="todo-details">
                            <span class="category-tag">${todo.category}</span>
                            <span class="due-date ${isOverdue ? 'overdue' : ''}">${dueDate}</span>
                        </div>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            todoList.appendChild(li);
        });

        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No tasks found';
            todoList.appendChild(emptyMessage);
        }
    }
});
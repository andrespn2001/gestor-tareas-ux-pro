// ==========================================
// SIMULACIÓN DEL SERVIDOR
// ==========================================
let db = JSON.parse(localStorage.getItem('db-pro-max')) || [];
let colaOffline = []; 
const offlineSwitch = document.getElementById('offlineSwitch');

function isOnline() { return !offlineSwitch.checked; }

function guardarDB() { localStorage.setItem('db-pro-max', JSON.stringify(db)); }

const mockSupabase = {
    select: () => new Promise(resolve => setTimeout(() => resolve({ data: [...db] }), 600)),
    insert: (task) => new Promise((resolve, reject) => {
        if (!isOnline()) return reject(new Error("Offline"));
        setTimeout(() => {
            const newTask = { id: Date.now(), ...task };
            db.unshift(newTask); guardarDB(); resolve({ data: [newTask] });
        }, 500);
    }),
    update: (id, changes) => new Promise((resolve, reject) => {
        if (!isOnline()) return reject(new Error("Offline"));
        setTimeout(() => {
            db = db.map(t => t.id === id ? { ...t, ...changes } : t); guardarDB();
            resolve({ data: db.filter(t => t.id === id) });
        }, 400);
    }),
    delete: (id) => new Promise((resolve, reject) => {
        if (!isOnline()) return reject(new Error("Offline"));
        setTimeout(() => { db = db.filter(t => t.id !== id); guardarDB(); resolve({}); }, 400);
    })
};

// ==========================================
// SISTEMA DE TOASTS
// ==========================================
function toast(msg, tipo = 'info') {
    const div = document.createElement('div');
    div.className = `notification ${tipo}`;
    div.textContent = msg;
    document.getElementById('notifications').appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ==========================================
// LÓGICA DE LA APP
// ==========================================
let tasks = [];
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');

function actualizarContador() {
    const pendientes = tasks.filter(t => !t.completed).length;
    document.getElementById('contador').textContent = pendientes;
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        if (task.completed) li.classList.add('completed');
        li.innerHTML = `
            <div class="task-info" onclick="toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
        `;
        taskList.appendChild(li);
    });
    actualizarContador(); 
}

async function cargarTareas() {
    try {
        const { data } = await mockSupabase.select();
        tasks = data;
        renderTasks();
    } catch (e) { toast('Error al cargar', 'error'); }
}

async function recargarForzado(btn) {
    btn.classList.add('loading');
    await cargarTareas();
    btn.classList.remove('loading');
    toast('Datos actualizados desde el servidor', 'success');
}

async function addTask() {
    const text = taskInput.value.trim();
    if (!text) return toast('Escribe algo', 'error');

    if (!isOnline()) {
        colaOffline.push({ tipo: 'add', text });
        tasks.unshift({ id: Date.now(), text, completed: false, isLocal: true });
        renderTasks();
        taskInput.value = '';
        toast('Guardado offline. Sincronizando al conectar...', 'info');
        return;
    }

    addButton.classList.add('loading');
    try {
        const { data } = await mockSupabase.insert({ text, completed: false });
        tasks.unshift(data[0]);
        renderTasks();
        taskInput.value = '';
    } catch (e) { toast('Error al añadir', 'error'); } 
    finally { addButton.classList.remove('loading'); }
}

async function toggleTask(id) {
    const t = tasks.find(x => x.id === id);
    t.completed = !t.completed;
    renderTasks(); 

    if (isOnline()) await mockSupabase.update(id, { completed: t.completed });
}

async function deleteTask(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) li.classList.add('removing'); 
    
    setTimeout(async () => {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
        if (isOnline()) await mockSupabase.delete(id);
    }, 300); 
}

offlineSwitch.addEventListener('change', async () => {
    if (isOnline() && colaOffline.length > 0) {
        toast(`Sincronizando ${colaOffline.length} tareas...`, 'info');
        for (let accion of colaOffline) {
            if (accion.tipo === 'add') {
                await mockSupabase.insert({ text: accion.text, completed: false });
            }
        }
        colaOffline = [];
        await cargarTareas();
        toast('¡Todo sincronizado!', 'success');
    } else if (!isOnline()) {
        toast('Modo Offline activado', 'error');
    }
});

cargarTareas();

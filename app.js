// ==========================================
// 1. CONFIGURACIÓN (SIN CLAVES, SIN ERRORES)
// ==========================================
const input = document.getElementById('input-tarea');
const categoria = document.getElementById('input-categoria');
const lista = document.getElementById('lista-tareas');
const contador = document.getElementById('contador');
const notificacion = document.getElementById('notificaciones');

let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];

// ==========================================
// 2. FUNCIONES BÁSICAS
// ==========================================
function guardar() {
    localStorage.setItem('misTareas', JSON.stringify(tareas));
}

function aviso(msg) {
    notificacion.textContent = msg;
    notificacion.style.display = 'block';
    setTimeout(() => notificacion.style.display = 'none', 4000);
}

function dibujar() {
    lista.innerHTML = '';
    let pendientes = 0;
    
    tareas.forEach((t, index) => {
        if (!t.completada) pendientes++;
        const li = document.createElement('li');
        if (t.completada) li.className = 'completada';
        li.innerHTML = `
            <div onclick="cambiarEstado(${index})" style="flex:1; cursor:pointer;">${t.texto} <span class="tag">${t.categoria}</span></div>
            <button onclick="borrar(${index})" style="background:none; border:none; color:white; cursor:pointer;">🗑</button>
        `;
        lista.appendChild(li);
    });
    contador.textContent = `${pendientes} tareas pendientes`;
}

// ==========================================
// 3. FUNCIONES CRUD
// ==========================================
function añadirTarea() {
    if (input.value.trim() === '') return aviso('Escribe algo primero');
    tareas.push({ texto: input.value, categoria: categoria.value, completada: false });
    input.value = '';
    guardar();
    dibujar();
    aviso('Tarea añadida ✅');
}

function cambiarEstado(index) {
    tareas[index].completada = !tareas[index].completada;
    guardar();
    dibujar();
}

function borrar(index) {
    tareas.splice(index, 1);
    guardar();
    dibujar();
}

function exportarCSV() {
    if (tareas.length === 0) return aviso('No hay tareas');
    let csv = "Tarea,Categoria,Completada\n";
    tareas.forEach(t => {
        csv += `"${t.texto}",${t.categoria},${t.completada ? 'Si' : 'No'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mis_tareas.csv';
    a.click();
    aviso('CSV descargado 📥');
}

// ==========================================
// 4. INTELIGENCIA ARTIFICIAL (MOTOR LOCAL)
// ==========================================
function usarIA() {
    if (input.value.trim() === '') return aviso('Escribe la tarea para usar la IA');
    
    aviso('🤖 Analizando texto...');
    
    // Simulamos un pequeño tiempo de espera para que parezca real
    setTimeout(() => {
        const texto = input.value.toLowerCase();
        
        // Palabras clave para cada categoría
        const clavesTrabajo = ['reunión', 'jefe', 'proyecto', 'email', 'informe', 'trabajo', 'cliente', 'oficina'];
        const clavesEstudio = ['estudiar', 'examen', 'leer', 'curso', 'aprender', 'deberes', 'libro', 'clase'];
        
        if (clavesTrabajo.some(palabra => texto.includes(palabra))) {
            categoria.value = 'Trabajo';
        } else if (clavesEstudio.some(palabra => texto.includes(palabra))) {
            categoria.value = 'Estudio';
        } else {
            categoria.value = 'Personal'; // Por defecto
        }
        
        aviso(`🪄 IA aplicada: ${categoria.value}`);
    }, 800);
}

// ==========================================
// 5. EVENTOS E INICIO
// ==========================================
document.getElementById('btn-añadir').addEventListener('click', añadirTarea);
document.getElementById('btn-ia').addEventListener('click', usarIA);
document.getElementById('btn-csv').addEventListener('click', exportarCSV);

input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') añadirTarea();
});

dibujar();

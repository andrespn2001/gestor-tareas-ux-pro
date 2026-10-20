// ==========================================
// 1. CONFIGURACIÓN
// ==========================================
const input = document.getElementById('input-tarea');
const categoria = document.getElementById('input-categoria');
const lista = document.getElementById('lista-tareas');
const contador = document.getElementById('contador');
const notificacion = document.getElementById('notificaciones');

let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];

// ==========================================
// 2. FUNCIONES BÁSICAS (UI)
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
// 3. FUNCIONES PRINCIPALES (CRUD)
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
// 4. INTELIGENCIA ARTIFICIAL (SIMULACIÓN INTELIGENTE)
// ==========================================
async function usarIA() {
    if (input.value.trim() === '') return aviso('Escribe la tarea para usar la IA');
    
    aviso('🤖 La IA está pensando...');
    
    // Simulamos un pequeño tiempo de espera de red (como si llamara a Google)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lógica inteligente de clasificación por palabras clave
    const texto = input.value.toLowerCase();
    
    if (texto.includes('comprar') || texto.includes('casa') || texto.includes('supermercado') || texto.includes('médico') || texto.includes('cumple') || texto.includes('comer')) {
        categoria.value = 'Personal';
    } else if (texto.includes('reunión') || texto.includes('jefe') || texto.includes('proyecto') || texto.includes('email') || texto.includes('informe') || texto.includes('trabajo')) {
        categoria.value = 'Trabajo';
    } else if (texto.includes('estudiar') || texto.includes('examen') || texto.includes('leer') || texto.includes('curso') || texto.includes('aprender') || texto.includes('tarea')) {
        categoria.value = 'Estudio';
    } else {
        // Si no reconoce nada, usa la categoría que esté puesta
        categoria.value = categoria.value;
    }
    
    aviso(`🪄 IA aplicada: ${categoria.value}`);
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

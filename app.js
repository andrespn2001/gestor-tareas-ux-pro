// ==========================================
// 1. CONFIGURACIÓN (CON SDK OFICIAL)
// ==========================================
// ⚠️ PEGA TU CLAVE AQUÍ (la que empieza por AQ.)
const API_KEY = 'AQ.Ab8RN6LhDK7U4SdOqUhbqeu_k8UOFi_LNob-HknDH2BVkPTz4w'; 

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
// 4. INTELIGENCIA ARTIFICIAL (CON SDK OFICIAL)
// ==========================================
async function usarIA() {
    if (input.value.trim() === '') return aviso('Escribe la tarea para usar la IA');
    
    aviso('🤖 La IA está pensando...');
    
    try {
        // Importamos la librería oficial de Google
        const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
        
        // Creamos el cliente con tu clave AQ.
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Pedimos la clasificación
        const prompt = `Clasifica esta tarea en solo una palabra: "Trabajo", "Personal" o "Estudio". Tarea: "${input.value}"`;
        const result = await model.generateContent(prompt);
        const respuesta = result.response.text().trim();
        
        // Asignamos la categoría
        if (respuesta.includes('Trabajo')) categoria.value = 'Trabajo';
        else if (respuesta.includes('Estudio')) categoria.value = 'Estudio';
        else categoria.value = 'Personal';
        
        aviso(`🪄 IA aplicada: ${categoria.value}`);
    } catch (error) {
        console.error("Error de la IA:", error);
        aviso(`❌ Error: ${error.message}`);
    }
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

// --- CONFIGURACIÓN ---
// Ya no pegamos la clave aquí para evitar bloqueos de seguridad de GitHub
const API_KEY = localStorage.getItem('miClaveGemini'); 

// --- ELEMENTOS DEL HTML ---
const input = document.getElementById('input-tarea');
const categoria = document.getElementById('input-categoria');
const lista = document.getElementById('lista-tareas');
const contador = document.getElementById('contador');
const notificacion = document.getElementById('notificaciones');

let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];

// --- FUNCIONES BÁSICAS ---
function guardar() {
    localStorage.setItem('misTareas', JSON.stringify(tareas));
}

function aviso(msg) {
    notificacion.textContent = msg;
    notificacion.style.display = 'block';
    setTimeout(() => notificacion.style.display = 'none', 3000);
}

function dibujar() {
    lista.innerHTML = '';
    let pendientes = 0;
    
    tareas.forEach((t, index) => {
        if (!t.completada) pendientes++;
        const li = document.createElement('li');
        if (t.completada) li.className = 'completada';
        li.innerHTML = `
            <div onclick="cambiarEstado(${index})">${t.texto} <span class="tag">${t.categoria}</span></div>
            <button onclick="borrar(${index})">🗑</button>
        `;
        lista.appendChild(li);
    });
    contador.textContent = `${pendientes} tareas pendientes`;
}

// --- FUNCIONES PRINCIPALES ---
function añadirTarea() {
    if (input.value.trim() === '') return aviso('Escribe algo primero');
    
    tareas.push({
        texto: input.value,
        categoria: categoria.value,
        completada: false
    });
    
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

// --- FUNCIÓN DE INTELIGENCIA ARTIFICIAL (GEMINI) ---
async function usarIA() {
    // Si no hay clave guardada, se la pedimos al usuario
    let clave = localStorage.getItem('miClaveGemini');
    if (!clave) {
        clave = prompt("🤖 Para usar la IA, pega aquí tu clave de Google Gemini (la copiaste de AI Studio):");
        if (clave) {
            localStorage.setItem('miClaveGemini', clave);
            aviso('✅ Clave guardada con éxito');
        } else {
            return aviso('❌ No se puede usar la IA sin clave');
        }
    }

    if (input.value.trim() === '') return aviso('Escribe la tarea para usar la IA');
    aviso('🤖 La IA está pensando...');
    
    try {
        const promptText = `Clasifica esta tarea en solo una palabra: "Trabajo", "Personal" o "Estudio". Tarea: "${input.value}"`;
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clave}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        
        const data = await res.json();
        
        if(!data.candidates) throw new Error("Clave incorrecta");

        const respuesta = data.candidates[0].content.parts[0].text.trim();
        
        if (respuesta.includes('Trabajo')) categoria.value = 'Trabajo';
        else if (respuesta.includes('Estudio')) categoria.value = 'Estudio';
        else categoria.value = 'Personal';
        
        aviso(`🪄 IA aplicada: ${categoria.value}`);
    } catch (error) {
        aviso('❌ Error con la IA. Revisa tu clave.');
    }
}

// --- CONECTAR BOTONES ---
document.getElementById('btn-añadir').addEventListener('click', añadirTarea);
document.getElementById('btn-ia').addEventListener('click', usarIA);
document.getElementById('btn-csv').addEventListener('click', exportarCSV);

// --- INICIO ---
dibujar();

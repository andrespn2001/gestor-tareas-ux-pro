const API_KEY = localStorage.getItem('miClaveGemini'); 

const input = document.getElementById('input-tarea');
const categoria = document.getElementById('input-categoria');
const lista = document.getElementById('lista-tareas');
const contador = document.getElementById('contador');
const notificacion = document.getElementById('notificaciones');

let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];

function guardar() { localStorage.setItem('misTareas', JSON.stringify(tareas)); }

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
            <div onclick="cambiarEstado(${index})">${t.texto} <span class="tag">${t.categoria}</span></div>
            <button onclick="borrar(${index})">🗑</button>
        `;
        lista.appendChild(li);
    });
    contador.textContent = `${pendientes} tareas pendientes`;
}

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

async function usarIA() {
    let clave = localStorage.getItem('miClaveGemini');
    if (!clave) {
        clave = prompt("🤖 Pega aquí tu clave de Google Gemini:");
        if (clave) localStorage.setItem('miClaveGemini', clave);
        else return aviso('❌ Necesitas una clave para usar la IA');
    }

    if (input.value.trim() === '') return aviso('Escribe la tarea para usar la IA');
    aviso('🤖 Pensando...');
    
    try {
        const promptText = `Clasifica esta tarea en solo una palabra: "Trabajo", "Personal" o "Estudio". Tarea: "${input.value}"`;
        
        // Usamos el modelo 1.5-flash que es el estándar estable
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${clave}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        
        const data = await res.json();
        
        // Si Google nos da un error, lo mostramos en pantalla
        if(data.error) {
            throw new Error(data.error.message);
        }

        const respuesta = data.candidates[0].content.parts[0].text.trim();
        
        if (respuesta.includes('Trabajo')) categoria.value = 'Trabajo';
        else if (respuesta.includes('Estudio')) categoria.value = 'Estudio';
        else categoria.value = 'Personal';
        
        aviso(`🪄 IA aplicada: ${categoria.value}`);
    } catch (error) {
        // Aquí mostramos el error exacto para saber qué pasa
        aviso(`❌ Error: ${error.message}`);
    }
}

document.getElementById('btn-añadir').addEventListener('click', añadirTarea);
document.getElementById('btn-ia').addEventListener('click', usarIA);
document.getElementById('btn-csv').addEventListener('click', exportarCSV);

dibujar();

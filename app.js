// --- FUNCIÓN DE INTELIGENCIA ARTIFICIAL (GEMINI - VERSIÓN ACTUALIZADA) ---
async function usarIA() {
    if (input.value.trim() === '') return aviso('Escribe la tarea para usar la IA');
    
    aviso('🤖 La IA está pensando...');
    
    try {
        const prompt = `Clasifica esta tarea en solo una palabra: "Trabajo", "Personal" o "Estudio". Tarea: "${input.value}"`;
        
        // Usamos el modelo 1.5-flash y el endpoint que acepta cualquier clave
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        if (!res.ok) {
            throw new Error("Error en la petición a Google");
        }

        const data = await res.json();
        const respuesta = data.candidates[0].content.parts[0].text.trim();
        
        if (respuesta.includes('Trabajo')) categoria.value = 'Trabajo';
        else if (respuesta.includes('Estudio')) categoria.value = 'Estudio';
        else categoria.value = 'Personal';
        
        aviso(`🪄 IA aplicada: ${categoria.value}`);
    } catch (error) {
        console.error(error);
        aviso('❌ Error con la IA. Revisa la consola (F12).');
    }
}

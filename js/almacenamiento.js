// Guardado del progreso en el navegador (localStorage), migración desde la
// versión anterior de la página, y exportar / importar a un archivo.

const CLAVE = 'pefce.v2';
const ESTADOS_VALIDOS = ['pendiente', 'cursada', 'aprobada'];

const datosVacios = () => ({
    version: 2,
    carrera: null,
    tema: null, // 'claro' | 'oscuro' | null (= seguir al sistema)
    tutorialOculto: false,
    progreso: {}, // { [carreraId]: { [materiaId]: { estado, nota? } } }
});

function leerLocal(clave) {
    try {
        return localStorage.getItem(clave);
    } catch {
        return null;
    }
}

function escribirLocal(clave, valor) {
    try {
        localStorage.setItem(clave, valor);
        return true;
    } catch {
        return false;
    }
}

// La versión anterior guardaba clases CSS ("final-aprobado", "cursada-aprobada"...)
// en claves "<carrera>-states". Las convertimos al formato nuevo sin borrarlas.
const ESTADO_ANTERIOR = {
    'final-aprobado': 'aprobada',
    'ingreso-aprobado': 'aprobada',
    'cursada-aprobada': 'cursada',
};

function migrarDesdeVersionAnterior(carreraIds) {
    const datos = datosVacios();
    let encontrado = false;

    for (const id of carreraIds) {
        const crudo = leerLocal(`${id}-states`);
        if (!crudo) continue;
        try {
            const estados = JSON.parse(crudo);
            const progreso = {};
            for (const [materiaId, clase] of Object.entries(estados)) {
                const estado = ESTADO_ANTERIOR[clase];
                if (estado) progreso[materiaId] = { estado };
            }
            datos.progreso[id] = progreso;
            encontrado = true;
        } catch {
            /* dato corrupto: se ignora */
        }
    }

    const ultima = leerLocal('lastCareer');
    if (ultima && carreraIds.includes(ultima)) {
        datos.carrera = ultima;
        encontrado = true;
    }
    const oscuro = leerLocal('darkMode');
    if (oscuro !== null) {
        datos.tema = oscuro === 'true' ? 'oscuro' : 'claro';
        encontrado = true;
    }
    if (leerLocal('noShowTutorial') === 'true') {
        datos.tutorialOculto = true;
        encontrado = true;
    }
    return encontrado ? datos : null;
}

export function cargar(carreraIds) {
    const crudo = leerLocal(CLAVE);
    if (crudo) {
        try {
            return sanear(JSON.parse(crudo));
        } catch {
            /* continuar con datos nuevos */
        }
    }
    const migrado = migrarDesdeVersionAnterior(carreraIds);
    const datos = migrado || datosVacios();
    if (migrado) guardar(datos);
    return datos;
}

export function guardar(datos) {
    return escribirLocal(CLAVE, JSON.stringify(datos));
}

// Asegura que los datos tengan la forma correcta (útil al importar archivos)
export function sanear(entrada) {
    const datos = datosVacios();
    if (!entrada || typeof entrada !== 'object') return datos;
    if (typeof entrada.carrera === 'string') datos.carrera = entrada.carrera;
    if (entrada.tema === 'claro' || entrada.tema === 'oscuro') datos.tema = entrada.tema;
    datos.tutorialOculto = entrada.tutorialOculto === true;

    const progreso = entrada.progreso && typeof entrada.progreso === 'object' ? entrada.progreso : {};
    for (const [carreraId, materias] of Object.entries(progreso)) {
        if (!materias || typeof materias !== 'object') continue;
        const limpio = {};
        for (const [materiaId, valor] of Object.entries(materias)) {
            if (!valor || !ESTADOS_VALIDOS.includes(valor.estado) || valor.estado === 'pendiente') continue;
            const item = { estado: valor.estado };
            if (typeof valor.nota === 'number' && valor.nota >= 0 && valor.nota <= 10) item.nota = valor.nota;
            limpio[materiaId] = item;
        }
        datos.progreso[carreraId] = limpio;
    }
    return datos;
}

export function exportarArchivo(datos) {
    const contenido = JSON.stringify(
        { app: 'plan-de-estudios-fce', exportado: new Date().toISOString(), ...datos },
        null,
        2
    );
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-progreso-plan-de-estudios-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importarArchivo(archivo) {
    const texto = await archivo.text();
    const json = JSON.parse(texto); // lanza error si no es JSON
    if (!json || typeof json !== 'object' || !json.progreso) {
        throw new Error('El archivo no parece ser un progreso exportado desde esta página.');
    }
    return sanear(json);
}

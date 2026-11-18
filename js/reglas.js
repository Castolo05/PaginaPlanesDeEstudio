// Lógica académica pura: no toca el DOM ni el almacenamiento.
// Todas las funciones reciben la carrera, las reglas y el progreso del alumno.
//
// Estados posibles de una materia:
//   'pendiente' -> sin cursar (o sin ingreso)
//   'cursada'   -> cursada aprobada, final pendiente
//   'aprobada'  -> final aprobado (o ingreso / taller aprobado)

export const ESTADOS = ['pendiente', 'cursada', 'aprobada'];

const NOMBRE_ANIO = ['1er', '2do', '3er', '4to', '5to', '6to'];
export const nombreAnio = (n) => `${NOMBRE_ANIO[n - 1] || `${n}º`} año`;

export function estadoDe(progreso, id) {
    return progreso[id]?.estado || 'pendiente';
}

const tieneCursada = (progreso, id) => estadoDe(progreso, id) !== 'pendiente';
const estaAprobada = (progreso, id) => estadoDe(progreso, id) === 'aprobada';

// Qué estados admite cada tipo de materia
export function estadosPermitidos(materia) {
    return materia.tipo === 'materia' || materia.tipo === 'practica'
        ? ['pendiente', 'cursada', 'aprobada']
        : ['pendiente', 'aprobada']; // ingreso y talleres: aprobado o no
}

// Ids de las correlativas. "todas" = todas las demás materias de la carrera.
export function correlativasDe(carrera, materia) {
    if (materia.correlativas === 'todas') {
        return carrera.materias.filter((m) => m.id !== materia.id).map((m) => m.id);
    }
    return materia.correlativas;
}

export function materiasQueHabilita(carrera, materia) {
    return carrera.materias.filter(
        (m) => m.id !== materia.id && correlativasDe(carrera, m).includes(materia.id)
    );
}

// Cuenta de finales que valen para el requisito de 3er año
export function contarFinales(carrera, progreso, regla) {
    let materias = 0;
    let talleres = 0;
    for (const m of carrera.materias) {
        if (!estaAprobada(progreso, m.id)) continue;
        if (m.tipo === 'materia') materias++;
        else if (m.tipo === 'taller') talleres++;
    }
    const talleresComputables = Math.min(talleres, regla?.maxTalleres ?? 0);
    return { materias, talleres, total: materias + talleresComputables };
}

function aniosCompletos(carrera, progreso, hastaAnio) {
    return carrera.materias
        .filter((m) => m.anio <= hastaAnio)
        .every((m) => estaAprobada(progreso, m.id));
}

// Requisitos de año (12 finales para 3ro, años completos para 5to) que no se cumplen
export function requisitosDeAnioFaltantes(carrera, reglas, progreso, materia) {
    const faltantes = [];
    const rf = reglas?.finalesParaAnio;
    if (rf && materia.anio >= rf.desdeAnio && rf.aplicaA.includes(materia.tipo)) {
        const { total } = contarFinales(carrera, progreso, rf);
        if (total < rf.finales) {
            faltantes.push(
                `Tener ${rf.finales} finales aprobados (hasta ${rf.maxTalleres} pueden ser talleres). Llevás ${total}.`
            );
        }
    }
    const ra = reglas?.aniosCompletosParaAnio;
    if (ra && materia.anio >= ra.desdeAnio && !aniosCompletos(carrera, progreso, ra.aniosCompletos)) {
        faltantes.push(`Tener completos los primeros ${ra.aniosCompletos} años (incluidos talleres).`);
    }
    return faltantes;
}

// Análisis completo de una materia: si se puede cursar, rendir y qué le falta.
export function analizarMateria(carrera, reglas, progreso, materia) {
    const corr = correlativasDe(carrera, materia);
    const porId = (id) => carrera.materias.find((m) => m.id === id);

    // "todas" exige finales aprobados incluso para cursar (como en la versión anterior)
    const exigeFinalParaCursar = materia.correlativas === 'todas';
    const faltanParaCursar = corr
        .filter((id) => (exigeFinalParaCursar ? !estaAprobada(progreso, id) : !tieneCursada(progreso, id)))
        .map(porId)
        .filter(Boolean);
    const faltanParaFinal = corr
        .filter((id) => !estaAprobada(progreso, id))
        .map(porId)
        .filter(Boolean);
    const requisitos = requisitosDeAnioFaltantes(carrera, reglas, progreso, materia);

    const habilitada = faltanParaCursar.length === 0 && requisitos.length === 0;
    const puedeAprobar = habilitada && faltanParaFinal.length === 0;
    const estado = estadoDe(progreso, materia.id);

    // Conflicto: el alumno marcó un estado que hoy no cumple las condiciones
    // (por ejemplo, desmarcó una correlativa). No se borra nada: solo se avisa.
    const conflicto =
        (estado === 'cursada' && !habilitada) || (estado === 'aprobada' && !puedeAprobar);

    return { estado, habilitada, puedeAprobar, conflicto, faltanParaCursar, faltanParaFinal, requisitos };
}

export function analizarCarrera(carrera, reglas, progreso) {
    const resultado = {};
    for (const m of carrera.materias) {
        resultado[m.id] = analizarMateria(carrera, reglas, progreso, m);
    }
    return resultado;
}

// Valida un cambio de estado. Devuelve null si es válido o un mensaje de error.
export function validarCambio(carrera, reglas, progreso, materia, nuevoEstado) {
    if (!estadosPermitidos(materia).includes(nuevoEstado)) {
        return 'Ese estado no aplica a esta materia.';
    }
    if (nuevoEstado === 'pendiente') return null;
    const a = analizarMateria(carrera, reglas, progreso, materia);
    if (!a.habilitada) {
        return 'Todavía no podés cursar esta materia: ' + describirFaltantes(a.faltanParaCursar, a.requisitos);
    }
    if (nuevoEstado === 'aprobada' && !a.puedeAprobar) {
        return 'No podés rendir este final: ' + describirFaltantes(a.faltanParaFinal, [], 'final de');
    }
    return null;
}

export function describirFaltantes(materias, requisitos = [], prefijo = '') {
    const partes = [];
    if (materias.length) {
        const nombres = materias.map((m) => m.nombre);
        partes.push(`${prefijo ? prefijo + ' ' : ''}${nombres.join(', ')}`.trim());
    }
    partes.push(...requisitos);
    return partes.join('. ') + '.';
}

// Progreso global de la carrera
export function calcularResumen(carrera, reglas, progreso) {
    const computables = carrera.materias.filter((m) => m.tipo !== 'ingreso');
    const aprobadas = computables.filter((m) => estaAprobada(progreso, m.id)).length;
    const cursadas = computables.filter((m) => estadoDe(progreso, m.id) === 'cursada').length;

    const notas = carrera.materias
        .filter((m) => estaAprobada(progreso, m.id))
        .map((m) => progreso[m.id]?.nota)
        .filter((n) => typeof n === 'number' && n >= 0 && n <= 10);
    const promedio = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

    const rf = reglas?.finalesParaAnio;
    const finales = contarFinales(carrera, progreso, rf);
    const tercerAnio = rf
        ? { requeridos: rf.finales, actuales: Math.min(finales.total, rf.finales), cumple: finales.total >= rf.finales, desdeAnio: rf.desdeAnio }
        : null;

    return {
        total: computables.length,
        aprobadas,
        cursadas,
        porcentaje: computables.length ? Math.round((aprobadas / computables.length) * 100) : 0,
        promedio,
        cantidadNotas: notas.length,
        tercerAnio,
    };
}

// Normaliza una nota ingresada por el alumno. Devuelve número válido o null.
export function normalizarNota(valor) {
    if (valor === '' || valor === null || valor === undefined) return null;
    const n = Number(String(valor).replace(',', '.'));
    if (!Number.isFinite(n) || n < 0 || n > 10) return null;
    return Math.round(n * 100) / 100;
}

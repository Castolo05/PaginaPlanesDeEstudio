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
    // Sin punto final duplicado cuando una parte ya termina en punto
    return partes.map((p) => p.replace(/\.+$/, '')).join('. ') + '.';
}

// Requisitos de año (para el ícono "?" del título de cada año) y si se cumplen
export function requisitosDelAnio(carrera, reglas, progreso, anio) {
    const lista = [];
    const rf = reglas?.finalesParaAnio;
    if (rf && anio >= rf.desdeAnio) {
        const { total } = contarFinales(carrera, progreso, rf);
        lista.push({
            texto: `Para cursar las materias de ${nombreAnio(rf.desdeAnio)} en adelante se necesitan ${rf.finales} finales aprobados (hasta ${rf.maxTalleres} pueden ser talleres). El curso de ingreso no cuenta y los talleres no tienen este requisito.`,
            cumple: total >= rf.finales,
            estado: total >= rf.finales ? 'Cumplido.' : `Llevás ${total} de ${rf.finales}.`,
        });
    }
    const ra = reglas?.aniosCompletosParaAnio;
    if (ra && anio >= ra.desdeAnio) {
        const faltan = carrera.materias.filter((m) => m.anio <= ra.aniosCompletos && !estaAprobada(progreso, m.id)).length;
        lista.push({
            texto: `Para cursar ${nombreAnio(ra.desdeAnio)} se necesitan completos los primeros ${ra.aniosCompletos} años, incluidos los talleres.`,
            cumple: faltan === 0,
            estado: faltan === 0 ? 'Cumplido.' : `Te ${faltan === 1 ? 'falta 1 materia' : `faltan ${faltan} materias`} de esos años.`,
        });
    }
    return lista;
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

// Todas las materias que dependen (directa o indirectamente) de una materia
export function dependientesDe(carrera, materia) {
    const resultado = new Map();
    const pendientes = [materia];
    while (pendientes.length) {
        const actual = pendientes.shift();
        for (const m of materiasQueHabilita(carrera, actual)) {
            if (!resultado.has(m.id)) {
                resultado.set(m.id, m);
                pendientes.push(m);
            }
        }
    }
    return [...resultado.values()];
}

// Después de cambiar una materia, desmarca en cadena las materias que dependen
// de ella y ya no cumplen sus correlativas. Cada una baja solo lo necesario:
// un final aprobado pasa a "cursada" si las correlativas siguen cursadas, o a
// "pendiente" si tampoco alcanza para cursarla. Las notas de los finales que se
// desmarcan se borran. Los requisitos de año (12 finales, años completos) no
// desmarcan nada: esas materias quedan marcadas para revisar.
// Devuelve un progreso nuevo (no modifica el recibido) y la lista de cambios.
export function aplicarCascada(carrera, reglas, progreso, materiaCambiada) {
    const nuevo = {};
    for (const [id, v] of Object.entries(progreso)) nuevo[id] = { ...v };
    const afectadas = dependientesDe(carrera, materiaCambiada);
    const cambios = [];

    let huboCambios = true;
    while (huboCambios) {
        huboCambios = false;
        for (const m of afectadas) {
            const estado = estadoDe(nuevo, m.id);
            if (estado === 'pendiente') continue;
            const a = analizarMateria(carrera, reglas, nuevo, m);
            let destino = estado;
            if (a.faltanParaCursar.length) destino = 'pendiente';
            else if (estado === 'aprobada' && a.faltanParaFinal.length) {
                destino = estadosPermitidos(m).includes('cursada') ? 'cursada' : 'pendiente';
            }
            if (destino === estado) continue;

            const previo = cambios.find((c) => c.materia.id === m.id);
            if (previo) previo.a = destino;
            else cambios.push({ materia: m, de: estado, a: destino });
            if (destino === 'pendiente') delete nuevo[m.id];
            else nuevo[m.id] = { estado: destino }; // al dejar de estar aprobada pierde la nota
            huboCambios = true;
        }
    }
    return { progreso: nuevo, cambios };
}

// Materias compartidas entre carreras: mismo código y mismo nombre.
// (Hay códigos repetidos con distinto nombre, por ejemplo talleres optativos:
// esos no se consideran la misma materia.)
const RANGO_ESTADO = { pendiente: 0, cursada: 1, aprobada: 2 };

// Copia el avance de una carrera a las demás para las materias compartidas.
// Solo suma: si en la otra carrera la materia ya está igual o más avanzada,
// no se toca, y nunca se desmarca nada. La nota de un final aprobado se copia.
// Devuelve un progreso nuevo por carrera y la lista de cambios por carrera.
export function compartirEntreCarreras(plan, progresoPorCarrera, carreraOrigenId) {
    const origen = plan.carreras.find((c) => c.id === carreraOrigenId);
    const progresoOrigen = progresoPorCarrera[carreraOrigenId] || {};
    const nuevo = {};
    for (const [id, p] of Object.entries(progresoPorCarrera)) {
        nuevo[id] = {};
        for (const [mid, v] of Object.entries(p)) nuevo[id][mid] = { ...v };
    }
    const cambios = []; // { carrera, materias: [materia] }

    for (const destino of plan.carreras) {
        if (destino.id === carreraOrigenId) continue;
        const progDestino = (nuevo[destino.id] ||= {});
        const actualizadas = [];
        for (const m of origen.materias) {
            const v = progresoOrigen[m.id];
            if (!v || v.estado === 'pendiente') continue;
            const igual = destino.materias.find((d) => d.id === m.id && d.nombre === m.nombre);
            if (!igual || !estadosPermitidos(igual).includes(v.estado)) continue;

            const previo = progDestino[m.id];
            const rangoPrevio = RANGO_ESTADO[previo?.estado || 'pendiente'];
            let cambio = false;
            if (RANGO_ESTADO[v.estado] > rangoPrevio) {
                progDestino[m.id] = { estado: v.estado };
                cambio = true;
            }
            if (v.estado === 'aprobada' && typeof v.nota === 'number' && progDestino[m.id].nota !== v.nota) {
                progDestino[m.id].nota = v.nota;
                cambio = true;
            }
            if (cambio) actualizadas.push(igual);
        }
        if (actualizadas.length) cambios.push({ carrera: destino, materias: actualizadas });
    }
    return { progreso: nuevo, cambios };
}

// La misma materia en todas las carreras que la tienen (mismo código y nombre),
// incluida la carrera de origen.
export function equivalentes(plan, carreraId, materiaId) {
    const origen = plan.carreras.find((c) => c.id === carreraId);
    const materia = origen?.materias.find((m) => m.id === materiaId);
    if (!materia) return [];
    const lista = [];
    for (const c of plan.carreras) {
        const igual = c.materias.find((m) => m.id === materia.id && m.nombre === materia.nombre);
        if (igual) lista.push({ carrera: c, materia: igual });
    }
    return lista;
}

// Aplica el nuevo valor de una materia ({ estado, nota? } o null = sin cursar)
// en todas las carreras que la tienen y, en cada una, desmarca en cadena las
// materias que dependían de ella. Devuelve un progreso nuevo por carrera y las
// materias desmarcadas por la cadena (con su carrera).
export function aplicarCambioEnTodas(plan, progresoPorCarrera, carreraId, materiaId, nuevoValor) {
    const nuevo = {};
    for (const [id, p] of Object.entries(progresoPorCarrera)) {
        nuevo[id] = {};
        for (const [mid, v] of Object.entries(p)) nuevo[id][mid] = { ...v };
    }
    const cambios = [];
    for (const { carrera, materia } of equivalentes(plan, carreraId, materiaId)) {
        const prog = (nuevo[carrera.id] ||= {});
        if (!nuevoValor || nuevoValor.estado === 'pendiente') delete prog[materia.id];
        else if (estadosPermitidos(materia).includes(nuevoValor.estado)) prog[materia.id] = { ...nuevoValor };
        else continue;
        const r = aplicarCascada(carrera, plan.reglas, prog, materia);
        nuevo[carrera.id] = r.progreso;
        for (const c of r.cambios) cambios.push({ ...c, carrera });
    }
    return { progreso: nuevo, cambios };
}

// Pone al día las carreras entre sí: cada materia compartida toma el estado más
// avanzado que tenga en cualquiera de las carreras (solo suma). Se usa al abrir
// la página, por si hay datos guardados antes de que existiera la sincronización.
export function unificarCarreras(plan, progresoPorCarrera) {
    let actual = progresoPorCarrera;
    let total = 0;
    for (const c of plan.carreras) {
        const r = compartirEntreCarreras(plan, actual, c.id);
        actual = r.progreso;
        total += r.cambios.reduce((n, x) => n + x.materias.length, 0);
    }
    return { progreso: actual, cambios: total };
}

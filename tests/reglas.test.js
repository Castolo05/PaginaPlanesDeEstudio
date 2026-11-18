// Tests de las reglas académicas y de los datos. Ejecutar con: npm test
// (o directamente: node --test tests/*.test.js). No requiere instalar nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    analizarMateria, validarCambio, calcularResumen, contarFinales, correlativasDe, normalizarNota,
    aplicarCascada, requisitosDelAnio, describirFaltantes, compartirEntreCarreras,
    aplicarCambioEnTodas, unificarCarreras,
} from '../js/reglas.js';
import { sanear } from '../js/almacenamiento.js';

const plan = JSON.parse(readFileSync(new URL('../careers.json', import.meta.url), 'utf8'));
const carrera = (id) => plan.carreras.find((c) => c.id === id);
const materia = (c, id) => c.materias.find((m) => m.id === id);
const gt = carrera('gestion-tecnologica');

test('careers.json: ids únicos y correlativas existentes en todas las carreras', () => {
    for (const c of plan.carreras) {
        const ids = c.materias.map((m) => m.id);
        assert.equal(new Set(ids).size, ids.length, `ids repetidos en ${c.id}`);
        for (const m of c.materias) {
            assert.ok(['ingreso', 'materia', 'taller', 'practica'].includes(m.tipo), `${m.id} tipo inválido`);
            if (m.correlativas === 'todas') continue;
            for (const corr of m.correlativas) {
                assert.ok(ids.includes(corr), `${c.id}: ${m.id} tiene correlativa inexistente ${corr}`);
                assert.notEqual(corr, m.id, `${m.id} es correlativa de sí misma`);
            }
        }
    }
});

test('sin ingreso, las materias que lo piden están bloqueadas', () => {
    const a = analizarMateria(gt, plan.reglas, {}, materia(gt, 'L0002'));
    assert.equal(a.habilitada, false);
    assert.equal(a.faltanParaCursar[0].id, 'L0000');
});

test('con la cursada de la correlativa se puede cursar, pero no aprobar el final', () => {
    const p = { L0000: { estado: 'aprobada' }, L0002: { estado: 'cursada' } };
    const mat2 = materia(gt, 'L0009');
    const a = analizarMateria(gt, plan.reglas, p, mat2);
    assert.equal(a.habilitada, true);
    assert.equal(a.puedeAprobar, false);
    assert.equal(validarCambio(gt, plan.reglas, p, mat2, 'cursada'), null);
    assert.match(validarCambio(gt, plan.reglas, p, mat2, 'aprobada'), /final/);
});

test('datos con una correlativa faltante (por ejemplo importados) se marcan como conflicto', () => {
    const p = { L0002: { estado: 'cursada' } }; // falta el ingreso
    const a = analizarMateria(gt, plan.reglas, p, materia(gt, 'L0002'));
    assert.equal(a.estado, 'cursada');
    assert.equal(a.conflicto, true);
});

test('talleres e ingreso solo admiten pendiente/aprobada', () => {
    assert.match(validarCambio(gt, plan.reglas, {}, materia(gt, 'LT001'), 'cursada'), /no aplica/);
    assert.equal(validarCambio(gt, plan.reglas, {}, materia(gt, 'LT001'), 'aprobada'), null);
    assert.equal(validarCambio(gt, plan.reglas, {}, materia(gt, 'L0000'), 'aprobada'), null);
});

// Aprueba todas las materias de 1er y 2do año de una carrera
function aprobarPrimerosAnios(c, filtro = () => true) {
    const p = {};
    for (const m of c.materias) if (m.anio <= 2 && filtro(m)) p[m.id] = { estado: 'aprobada' };
    return p;
}

test('3er año: el ingreso no cuenta como final y se necesitan 12', () => {
    const regla = plan.reglas.finalesParaAnio;
    // ingreso + 11 materias -> no alcanza
    const materias = gt.materias.filter((m) => m.tipo === 'materia' && m.anio <= 2).slice(0, 11);
    const p = { L0000: { estado: 'aprobada' } };
    for (const m of materias) p[m.id] = { estado: 'aprobada' };
    assert.equal(contarFinales(gt, p, regla).total, 11);
    const terceroSinCorrelativas = materia(gt, 'L0015'); // Matemática Financiera: pide L0002 y L0007
    let a = analizarMateria(gt, plan.reglas, p, terceroSinCorrelativas);
    assert.equal(a.requisitos.length, 1);
    // + 1 taller -> 12
    p.LT001 = { estado: 'aprobada' };
    a = analizarMateria(gt, plan.reglas, p, terceroSinCorrelativas);
    assert.equal(a.requisitos.length, 0);
});

test('3er año: como máximo 3 talleres cuentan', () => {
    const regla = plan.reglas.finalesParaAnio;
    const p = { LT001: { estado: 'aprobada' }, LT002: { estado: 'aprobada' }, LT003: { estado: 'aprobada' }, LT004: { estado: 'aprobada' } };
    assert.equal(contarFinales(gt, p, regla).total, 3);
});

test('3er año: los talleres no están sujetos a la regla de 12 finales', () => {
    const p = { LT004: { estado: 'aprobada' } };
    const a = analizarMateria(gt, plan.reglas, p, materia(gt, 'LT005')); // Idioma II, 3er año
    assert.equal(a.habilitada, true);
});

test('5to año: exige 1ro y 2do completos', () => {
    const ee = carrera('economia-empresarial');
    const quinto = ee.materias.find((m) => m.anio === 5 && m.tipo === 'materia');
    const casiTodo = aprobarPrimerosAnios(ee, (m) => m.id !== 'LT002');
    const faltante = analizarMateria(ee, plan.reglas, casiTodo, quinto).requisitos;
    assert.ok(faltante.some((r) => r.includes('primeros 2 años')));
    const todo = aprobarPrimerosAnios(ee);
    const req = analizarMateria(ee, plan.reglas, todo, quinto).requisitos;
    assert.ok(!req.some((r) => r.includes('primeros 2 años')));
});

test('"todas" = todas las demás materias de la carrera', () => {
    const tfg = materia(gt, 'LT011');
    const corr = correlativasDe(gt, tfg);
    assert.equal(corr.length, gt.materias.length - 1);
    assert.ok(!corr.includes('LT011'));
});

test('resumen: porcentaje sin contar el ingreso y promedio con notas cargadas', () => {
    const p = { L0000: { estado: 'aprobada' }, L0002: { estado: 'aprobada', nota: 8 }, L0001: { estado: 'aprobada', nota: 6 }, L0003: { estado: 'cursada' } };
    const r = calcularResumen(gt, plan.reglas, p);
    assert.equal(r.total, gt.materias.length - 1);
    assert.equal(r.aprobadas, 2);
    assert.equal(r.cursadas, 1);
    assert.equal(r.promedio, 7);
});

test('notas: acepta coma decimal y rechaza fuera de rango', () => {
    assert.equal(normalizarNota('7,5'), 7.5);
    assert.equal(normalizarNota('10'), 10);
    assert.equal(normalizarNota('11'), null);
    assert.equal(normalizarNota('abc'), null);
    assert.equal(normalizarNota(''), null);
});

test('importar: descarta estados y notas inválidos', () => {
    const d = sanear({ progreso: { x: { A: { estado: 'aprobada', nota: 99 }, B: { estado: 'raro' }, C: { estado: 'cursada' } } } });
    assert.deepEqual(d.progreso.x, { A: { estado: 'aprobada' }, C: { estado: 'cursada' } });
});

test('cascada: desmarcar un final desmarca en cadena lo que depende de él', () => {
    // Ingreso -> Matemática I -> Matemática II
    const p = {
        L0000: { estado: 'aprobada', nota: 9 },
        L0002: { estado: 'aprobada', nota: 8 },
        L0009: { estado: 'aprobada', nota: 7 },
        L0006: { estado: 'aprobada', nota: 6 }, // no depende del ingreso
    };
    delete p.L0000; // el alumno desmarca el ingreso
    const { progreso, cambios } = aplicarCascada(gt, plan.reglas, p, materia(gt, 'L0000'));
    assert.equal(progreso.L0002, undefined);
    assert.equal(progreso.L0009, undefined);
    assert.deepEqual(progreso.L0006, { estado: 'aprobada', nota: 6 });
    assert.deepEqual(cambios.map((c) => c.materia.id).sort(), ['L0002', 'L0009']);
    assert.equal(p.L0002.estado, 'aprobada', 'no debe modificar el progreso recibido');
});

test('cascada: si la correlativa queda cursada, el final aprobado baja a cursada', () => {
    const p = { L0000: { estado: 'aprobada' }, L0002: { estado: 'cursada' }, L0009: { estado: 'aprobada', nota: 7 } };
    const { progreso, cambios } = aplicarCascada(gt, plan.reglas, p, materia(gt, 'L0002'));
    assert.deepEqual(progreso.L0009, { estado: 'cursada' });
    assert.deepEqual(cambios.map((c) => [c.materia.id, c.de, c.a]), [['L0009', 'aprobada', 'cursada']]);
});

test('cascada: una cursada que sigue habilitada no cambia', () => {
    const p = { L0000: { estado: 'aprobada' }, L0002: { estado: 'cursada' }, L0009: { estado: 'cursada' } };
    const { cambios } = aplicarCascada(gt, plan.reglas, p, materia(gt, 'L0002'));
    assert.equal(cambios.length, 0);
});

test('nota: el ingreso y los talleres también suman al promedio', () => {
    const p = { L0000: { estado: 'aprobada', nota: 10 }, LT001: { estado: 'aprobada', nota: 6 } };
    assert.equal(calcularResumen(gt, plan.reglas, p).promedio, 8);
});

test('requisitos del año: 1ro y 2do no tienen; 3ro muestra cuántos finales lleva', () => {
    assert.equal(requisitosDelAnio(gt, plan.reglas, {}, 2).length, 0);
    const p = { L0002: { estado: 'aprobada' }, L0001: { estado: 'aprobada' }, L0000: { estado: 'aprobada' } };
    const r = requisitosDelAnio(gt, plan.reglas, p, 3);
    assert.equal(r.length, 1);
    assert.equal(r[0].estado, 'Llevás 2 de 12.');
    assert.equal(r[0].cumple, false);
});

test('requisitos del año: 5to suma el de años completos', () => {
    const ee = carrera('economia-empresarial');
    const r = requisitosDelAnio(ee, plan.reglas, {}, 5);
    assert.equal(r.length, 2);
    assert.match(r[1].estado, /^Te faltan \d+ materias de esos años\.$/);
});

test('describirFaltantes no duplica el punto final', () => {
    assert.equal(describirFaltantes([], ['Llevás 10.']), 'Llevás 10.');
    assert.equal(describirFaltantes([{ nombre: 'Matemática I' }], ['Requisito.']), 'Matemática I. Requisito.');
});

test('compartir: las materias aprobadas pasan a las demás carreras con su nota', () => {
    const datos = { administracion: { L0000: { estado: 'aprobada' }, L0001: { estado: 'aprobada', nota: 9 }, L0002: { estado: 'cursada' } } };
    const { progreso, cambios } = compartirEntreCarreras(plan, datos, 'administracion');
    for (const id of ['gestion-tecnologica', 'contador-publico', 'economia-empresarial']) {
        assert.deepEqual(progreso[id].L0001, { estado: 'aprobada', nota: 9 }, id);
        assert.deepEqual(progreso[id].L0002, { estado: 'cursada' }, id);
    }
    assert.equal(cambios.length, 3);
    assert.equal(datos['contador-publico'], undefined, 'no debe modificar los datos recibidos');
});

test('compartir: solo suma, nunca baja ni borra lo de otra carrera', () => {
    const datos = {
        administracion: { L0002: { estado: 'cursada' } },
        'contador-publico': { L0002: { estado: 'aprobada', nota: 7 }, L0003: { estado: 'aprobada' } },
    };
    const { progreso } = compartirEntreCarreras(plan, datos, 'administracion');
    assert.deepEqual(progreso['contador-publico'].L0002, { estado: 'aprobada', nota: 7 });
    assert.deepEqual(progreso['contador-publico'].L0003, { estado: 'aprobada' });
});

test('compartir: mismo código con distinto nombre no se considera la misma materia', () => {
    const conLT006 = plan.carreras.filter((c) => c.materias.some((m) => m.id === 'LT006'));
    const nombres = new Set(conLT006.map((c) => c.materias.find((m) => m.id === 'LT006').nombre));
    assert.ok(nombres.size > 1, 'el dato de prueba debe seguir existiendo');
    const origen = conLT006[0];
    const nombreOrigen = origen.materias.find((m) => m.id === 'LT006').nombre;
    const { progreso } = compartirEntreCarreras(plan, { [origen.id]: { LT006: { estado: 'aprobada' } } }, origen.id);
    for (const c of conLT006.slice(1)) {
        const igual = c.materias.find((m) => m.id === 'LT006').nombre === nombreOrigen;
        assert.equal(Boolean(progreso[c.id]?.LT006), igual, c.id);
    }
});

test('sincronizar: aprobar una materia la aprueba en todas las carreras que la tienen', () => {
    const { progreso } = aplicarCambioEnTodas(plan, {}, 'administracion', 'L0000', { estado: 'aprobada', nota: 9 });
    for (const c of plan.carreras) assert.deepEqual(progreso[c.id].L0000, { estado: 'aprobada', nota: 9 }, c.id);
});

test('sincronizar: desmarcar desmarca en todas las carreras y en cadena en cada una', () => {
    const datos = {};
    for (const c of plan.carreras) datos[c.id] = { L0000: { estado: 'aprobada' }, L0002: { estado: 'aprobada', nota: 8 } };
    const { progreso, cambios } = aplicarCambioEnTodas(plan, datos, 'contador-publico', 'L0000', null);
    for (const c of plan.carreras) {
        assert.equal(progreso[c.id].L0000, undefined, c.id);
        assert.equal(progreso[c.id].L0002, undefined, c.id);
    }
    assert.equal(cambios.length, plan.carreras.length);
    assert.ok(datos.administracion.L0000, 'no debe modificar los datos recibidos');
});

test('sincronizar: al abrir, las carreras se ponen al día con lo más avanzado', () => {
    const datos = { 'gestion-tecnologica': { L0000: { estado: 'aprobada' } }, administracion: { L0002: { estado: 'cursada' } } };
    const { progreso, cambios } = unificarCarreras(plan, datos);
    for (const c of plan.carreras) {
        assert.equal(progreso[c.id].L0000.estado, 'aprobada', c.id);
        assert.equal(progreso[c.id].L0002.estado, 'cursada', c.id);
    }
    assert.ok(cambios > 0);
    assert.equal(unificarCarreras(plan, progreso).cambios, 0, 'una segunda pasada no cambia nada');
});

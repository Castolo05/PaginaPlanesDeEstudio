import config from './config.js';
import * as reglasMod from './reglas.js';
import * as almacen from './almacenamiento.js';

const {
    analizarCarrera, validarCambio, estadosPermitidos, calcularResumen, correlativasDe,
    materiasQueHabilita, normalizarNota, nombreAnio, describirFaltantes,
} = reglasMod;

// ---------- Estado de la aplicación ----------
let plan = null;        // contenido de careers.json
let datos = null;       // datos guardados del alumno
let carrera = null;     // carrera seleccionada
let analisis = {};      // resultado de analizarCarrera
const abiertas = new Set(); // materias con el detalle desplegado

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const progresoActual = () => (datos.progreso[carrera.id] ||= {});

const ETIQUETA_ESTADO = {
    pendiente: { materia: 'Sin cursar', practica: 'Sin cursar', taller: 'Sin aprobar', ingreso: 'Sin ingreso' },
    cursada: { materia: 'Cursada aprobada', practica: 'Cursada aprobada' },
    aprobada: { materia: 'Final aprobado', practica: 'Aprobada', taller: 'Aprobado', ingreso: 'Ingreso aprobado' },
};
export const etiquetaEstado = (estado, tipo) => ETIQUETA_ESTADO[estado][tipo] || ETIQUETA_ESTADO[estado].materia;

// ---------- Utilidades de interfaz ----------
function el(tag, attrs = {}, ...hijos) {
    const nodo = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v === false || v === null || v === undefined) continue;
        if (k === 'class') nodo.className = v;
        else if (k === 'text') nodo.textContent = v;
        else if (k.startsWith('on')) nodo.addEventListener(k.slice(2), v);
        else nodo.setAttribute(k, v === true ? '' : v);
    }
    for (const h of hijos.flat()) if (h !== null && h !== undefined && h !== false) nodo.append(h);
    return nodo;
}

function aviso(mensaje, tipo = 'info') {
    const caja = $('#avisos');
    const nodo = el('div', { class: `aviso aviso-${tipo}`, text: mensaje });
    caja.append(nodo);
    setTimeout(() => nodo.classList.add('saliendo'), 4200);
    setTimeout(() => nodo.remove(), 4600);
}

function confirmar(texto) {
    const dlg = $('#dialogo-confirmar');
    $('#confirmar-texto').textContent = texto;
    dlg.returnValue = '';
    dlg.showModal();
    return new Promise((resolver) => {
        dlg.addEventListener('close', () => resolver(dlg.returnValue === 'si'), { once: true });
    });
}

let temporizadorGuardado;
function guardar() {
    const ok = almacen.guardar(datos);
    const indicador = $('#estado-guardado');
    if (!ok) {
        indicador.textContent = '';
        aviso('No se pudo guardar: tu navegador bloquea el almacenamiento local. Exportá tu progreso para no perderlo.', 'error');
        return;
    }
    indicador.textContent = '✓ Guardado';
    clearTimeout(temporizadorGuardado);
    temporizadorGuardado = setTimeout(() => (indicador.textContent = ''), 2000);
}

// ---------- Configuración visual ----------
function aplicarConfig() {
    const t = config.titulo;
    const h1 = $('#titulo');
    if (config.logoEncabezado) {
        h1.replaceChildren(el('img', { src: config.logoEncabezado.src, alt: config.logoEncabezado.alt, class: 'logo-encabezado' }));
    } else {
        $('.t-largo', h1).textContent = t.largo;
        $('.t-medio', h1).textContent = t.medio;
        $('.t-corto', h1).textContent = t.corto;
    }
    document.title = t.largo;
    const anio = new Date().getFullYear();
    const rango = config.anioInicio && config.anioInicio < anio ? `${config.anioInicio}–${anio}` : `${anio}`;
    $('#pie-texto').textContent = `Copyright © ${rango} ${config.pie}`;
    if (config.notaTutorial) $('#nota-tutorial').textContent = config.notaTutorial;
    for (const [variable, valor] of Object.entries(config.colores || {})) {
        document.documentElement.style.setProperty(variable, valor);
    }
}

// ---------- Tema claro / oscuro ----------
const prefiereOscuro = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const temaEfectivo = () => datos.tema || (prefiereOscuro() ? 'oscuro' : 'claro');

function aplicarTema() {
    const tema = temaEfectivo();
    if (datos.tema) document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
    else delete document.documentElement.dataset.theme;
    const boton = $('#btn-tema');
    const oscuro = tema === 'oscuro';
    $('img', boton).src = oscuro ? 'media/modo_claro.png' : 'media/modo_oscuro.png';
    boton.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    const color = getComputedStyle(document.documentElement).getPropertyValue('--marca').trim();
    $('meta[name="theme-color"]').setAttribute('content', color || '#003366');
}

function alternarTema() {
    datos.tema = temaEfectivo() === 'oscuro' ? 'claro' : 'oscuro';
    aplicarTema();
    guardar();
}

// ---------- Carreras ----------
function renderCarreras() {
    const lista = $('#lista-carreras');
    lista.replaceChildren(
        ...plan.carreras.map((c) =>
            el('button', {
                type: 'button',
                class: 'carrera-boton',
                id: `btn-${c.id}`,
                'aria-pressed': 'false',
                onclick: () => seleccionarCarrera(c.id, true),
            },
            c.titulo.startsWith('Licenciatura en ')
                ? [el('span', { class: 'carrera-prefijo', text: 'Licenciatura en' }), el('span', { text: c.tituloCorto })]
                : el('span', { text: c.titulo }))
        )
    );
}

function seleccionarCarrera(id, porUsuario = false) {
    const elegida = plan.carreras.find((c) => c.id === id) || plan.carreras[0];
    carrera = elegida;
    datos.carrera = elegida.id;
    abiertas.clear();
    if (porUsuario) guardar();
    for (const b of document.querySelectorAll('.carrera-boton')) {
        const activa = b.id === `btn-${elegida.id}`;
        b.classList.toggle('activa', activa);
        b.setAttribute('aria-pressed', String(activa));
        if (activa && porUsuario) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    $('#resumen').hidden = false;
    $('#leyenda').hidden = false;
    renderPlan();
}

// ---------- Plan de estudios ----------
function coincideFiltro(materia) {
    const filtro = $('#filtro').value;
    const a = analisis[materia.id];
    switch (filtro) {
        case 'disponibles':
            return a.habilitada && a.estado !== 'aprobada' && !a.conflicto;
        case 'final':
            return a.estado === 'cursada';
        case 'aprobadas':
            return a.estado === 'aprobada';
        default:
            return true;
    }
}

function renderPlan() {
    analisis = analizarCarrera(carrera, plan.reglas, progresoActual());
    const contenedor = $('#plan');
    const anios = Math.max(...carrera.materias.map((m) => m.anio));
    contenedor.style.setProperty('--anios', anios);

    const columnas = [];
    for (let anio = 1; anio <= anios; anio++) {
        const materias = carrera.materias.filter((m) => m.anio === anio);
        const visibles = materias.filter(coincideFiltro);
        const aprobadas = materias.filter((m) => analisis[m.id].estado === 'aprobada').length;
        columnas.push(
            el('section', { class: 'anio', 'aria-labelledby': `anio-${anio}` },
                el('h2', { class: 'anio-titulo', id: `anio-${anio}` },
                    el('span', { text: nombreAnio(anio).replace(/^./, (l) => l.toUpperCase()) }),
                    el('span', { class: 'anio-contador', text: `${aprobadas}/${materias.length}`, title: 'Aprobadas en este año' })),
                visibles.length
                    ? el('div', { class: 'anio-materias' }, visibles.map(renderMateria))
                    : el('p', { class: 'anio-vacio', text: 'Nada para mostrar en este año.' }))
        );
    }
    contenedor.replaceChildren(...columnas);
    renderResumen();
}

function renderMateria(materia) {
    const a = analisis[materia.id];
    const abierta = abiertas.has(materia.id);
    const nota = progresoActual()[materia.id]?.nota;
    const clases = ['materia', `estado-${a.estado}`];
    if (!a.habilitada && a.estado === 'pendiente') clases.push('bloqueada');
    if (a.conflicto) clases.push('conflicto');
    if (abierta) clases.push('abierta');

    let indicador = null;
    if (a.conflicto) indicador = el('span', { class: 'indicador indicador-conflicto', text: '⚠ Revisar' });
    else if (a.estado === 'aprobada') indicador = el('span', { class: 'indicador', text: typeof nota === 'number' ? `✓ ${formatearNota(nota)}` : '✓' });
    else if (a.estado === 'cursada') indicador = el('span', { class: 'indicador', text: 'Cursada' });
    else if (!a.habilitada) indicador = el('span', { class: 'indicador indicador-candado', text: '🔒', 'aria-hidden': 'true' });

    const idDetalle = `detalle-${materia.id}`;
    const etiquetaAccesible = `${materia.nombre}. ${etiquetaEstado(a.estado, materia.tipo)}${a.conflicto ? '. Revisar: falta una correlativa' : ''}${!a.habilitada && a.estado === 'pendiente' ? '. Bloqueada' : ''}`;

    const tarjeta = el('article', {
        class: clases.join(' '),
        'data-id': materia.id,
        onmouseenter: () => resaltar(materia),
        onmouseleave: quitarResaltado,
    },
        el('button', {
            type: 'button',
            class: 'materia-cabecera',
            'aria-expanded': String(abierta),
            'aria-controls': idDetalle,
            'aria-label': etiquetaAccesible,
            'data-foco': `cab-${materia.id}`,
            onclick: () => alternarDetalle(materia),
            onfocus: () => resaltar(materia),
            onblur: quitarResaltado,
        },
            materia.cuatrimestre ? el('span', { class: 'chip-cuatri', text: `${materia.cuatrimestre}C`, title: `${materia.cuatrimestre}º cuatrimestre` }) : null,
            materia.tipo === 'taller' ? el('span', { class: 'chip-cuatri chip-tipo', text: 'Taller' }) : null,
            el('span', { class: 'materia-nombre', text: materia.nombre }),
            indicador),
        abierta ? renderDetalle(materia, idDetalle) : el('div', { id: idDetalle, hidden: true })
    );
    return tarjeta;
}

function renderDetalle(materia, idDetalle) {
    const a = analisis[materia.id];
    const correlativas = correlativasDe(carrera, materia);
    const habilita = materiasQueHabilita(carrera, materia);
    const nombre = (id) => carrera.materias.find((m) => m.id === id)?.nombre || id;
    const estadoCorto = (id) => {
        const e = analisis[id]?.estado;
        return e === 'aprobada' ? ' ✓' : e === 'cursada' ? ' (cursada)' : '';
    };

    const avisos = [];
    if (a.conflicto) {
        const faltan = a.estado === 'aprobada' && a.habilitada ? a.faltanParaFinal : a.faltanParaCursar;
        avisos.push(el('p', { class: 'detalle-aviso detalle-aviso-conflicto' },
            el('strong', { text: 'Revisar: ' }),
            `marcaste esta materia como “${etiquetaEstado(a.estado, materia.tipo).toLowerCase()}”, pero falta: ${describirFaltantes(faltan, a.habilitada ? [] : a.requisitos)}`));
    } else if (!a.habilitada) {
        avisos.push(el('p', { class: 'detalle-aviso' },
            el('strong', { text: 'Para cursarla falta: ' }), describirFaltantes(a.faltanParaCursar, a.requisitos)));
    } else if (a.estado === 'cursada' && !a.puedeAprobar) {
        avisos.push(el('p', { class: 'detalle-aviso' },
            el('strong', { text: 'Para rendir el final falta: ' }), describirFaltantes(a.faltanParaFinal, [], 'final de')));
    }

    const listaCorrelativas = materia.correlativas === 'todas'
        ? [el('li', { text: 'Todas las demás materias del plan (con final aprobado)' })]
        : correlativas.length
            ? correlativas.map((id) => el('li', { text: nombre(id) + estadoCorto(id) }))
            : [el('li', { text: 'Ninguna' })];
    const listaHabilita = habilita.length
        ? habilita.map((m) => el('li', { text: m.nombre }))
        : [el('li', { text: 'Ninguna' })];

    const botones = estadosPermitidos(materia).map((estado) => {
        const activo = a.estado === estado;
        const bloqueado = !activo && validarCambio(carrera, plan.reglas, progresoActual(), materia, estado);
        return el('button', {
            type: 'button',
            class: `estado-boton estado-boton-${estado}`,
            'aria-pressed': String(activo),
            'aria-disabled': bloqueado ? 'true' : null,
            title: bloqueado || null,
            'data-foco': `estado-${materia.id}-${estado}`,
            onclick: () => cambiarEstado(materia, estado),
        }, etiquetaEstado(estado, materia.tipo));
    });

    let campoNota = null;
    if (a.estado === 'aprobada' && materia.tipo !== 'ingreso') {
        const nota = progresoActual()[materia.id]?.nota;
        campoNota = el('label', { class: 'campo-nota' },
            el('span', { text: 'Nota' }),
            el('input', {
                // type="text" para aceptar coma decimal ("7,5"); el teclado del celular sigue siendo numérico
                type: 'text', inputmode: 'decimal', autocomplete: 'off', maxlength: '5',
                'aria-label': `Nota del final de ${materia.nombre} (0 a 10)`,
                placeholder: '—', value: typeof nota === 'number' ? formatearNota(nota) : '',
                'data-foco': `nota-${materia.id}`,
                onchange: (e) => cambiarNota(materia, e.target.value),
            }));
    }

    return el('div', { class: 'materia-detalle', id: idDetalle },
        avisos,
        el('h3', { text: 'Correlativas necesarias' }),
        el('ul', { class: 'lista-correlativas' }, listaCorrelativas),
        el('h3', { text: 'Es correlativa de' }),
        el('ul', { class: 'lista-correlativas' }, listaHabilita),
        el('div', { class: 'estado-opciones', role: 'group', 'aria-label': `Estado de ${materia.nombre}` }, botones),
        campoNota);
}

const formatearNota = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '').replace('.', ','));

// Vuelve a dibujar sin perder el foco del teclado
function redibujar() {
    const foco = document.activeElement?.dataset?.foco;
    renderPlan();
    if (foco) document.querySelector(`[data-foco="${foco}"]`)?.focus({ preventScroll: true });
}

function alternarDetalle(materia) {
    if (abiertas.has(materia.id)) abiertas.delete(materia.id);
    else abiertas.add(materia.id);
    redibujar();
    resaltar(materia);
}

function cambiarEstado(materia, estado) {
    const progreso = progresoActual();
    const actual = progreso[materia.id]?.estado || 'pendiente';
    if (actual === estado) return;
    const error = validarCambio(carrera, plan.reglas, progreso, materia, estado);
    if (error) {
        aviso(error, 'error');
        return;
    }
    if (estado === 'pendiente') delete progreso[materia.id];
    else progreso[materia.id] = { ...progreso[materia.id], estado };
    if (estado !== 'aprobada' && progreso[materia.id]) delete progreso[materia.id].nota;

    guardar();
    redibujar();

    const conflictos = Object.values(analisis).filter((x) => x.conflicto).length;
    if (estado !== 'aprobada' && conflictos) {
        aviso(`${conflictos === 1 ? 'Hay 1 materia' : `Hay ${conflictos} materias`} para revisar (marcadas con ⚠). No se borró nada.`, 'advertencia');
    }
}

function cambiarNota(materia, valor) {
    const progreso = progresoActual();
    if (!progreso[materia.id]) return;
    const nota = normalizarNota(valor);
    if (valor !== '' && nota === null) {
        aviso('La nota tiene que ser un número entre 0 y 10.', 'error');
        redibujar();
        return;
    }
    if (nota === null) delete progreso[materia.id].nota;
    else progreso[materia.id].nota = nota;
    guardar();
    redibujar();
}

// Resalta correlativas (lo que pide) y lo que habilita la materia
function resaltar(materia) {
    quitarResaltado();
    const plano = $('#plan');
    plano.classList.add('resaltando');
    document.querySelector(`.materia[data-id="${materia.id}"]`)?.classList.add('foco');
    for (const id of correlativasDe(carrera, materia)) {
        document.querySelector(`.materia[data-id="${id}"]`)?.classList.add('resalta-requisito');
    }
    for (const m of materiasQueHabilita(carrera, materia)) {
        document.querySelector(`.materia[data-id="${m.id}"]`)?.classList.add('resalta-habilita');
    }
}

function quitarResaltado() {
    $('#plan').classList.remove('resaltando');
    for (const n of document.querySelectorAll('.foco, .resalta-requisito, .resalta-habilita')) {
        n.classList.remove('foco', 'resalta-requisito', 'resalta-habilita');
    }
}

// ---------- Resumen ----------
function renderResumen() {
    const r = calcularResumen(carrera, plan.reglas, progresoActual());
    $('#resumen-porcentaje').textContent = `${r.porcentaje}%`;
    $('#resumen-detalle').textContent = `${r.aprobadas} de ${r.total} materias aprobadas`;
    $('#resumen-relleno').style.width = `${r.porcentaje}%`;
    $('#resumen-barra').setAttribute('aria-valuenow', String(r.porcentaje));
    $('#resumen-promedio').textContent = r.promedio === null ? '—' : formatearNota(Math.round(r.promedio * 100) / 100);
    $('#resumen-promedio').title = r.cantidadNotas ? `Sobre ${r.cantidadNotas} nota(s) cargada(s)` : 'Cargá la nota de tus finales para calcularlo';
    $('#resumen-cursadas').textContent = String(r.cursadas);
    const caja = $('#resumen-tercero-caja');
    if (r.tercerAnio) {
        caja.hidden = false;
        $('#resumen-tercero-titulo').textContent = `Finales para ${nombreAnio(r.tercerAnio.desdeAnio)}`;
        $('#resumen-tercero').textContent = r.tercerAnio.cumple ? '✓ Cumplido' : `${r.tercerAnio.actuales}/${r.tercerAnio.requeridos}`;
    } else {
        caja.hidden = true;
    }
}

// ---------- Diálogos ----------
function prepararDialogos() {
    for (const dlg of document.querySelectorAll('dialog.dialogo')) {
        // Cerrar tocando fuera del contenido
        dlg.addEventListener('click', (e) => {
            if (e.target === dlg) dlg.close();
        });
        for (const b of dlg.querySelectorAll('[data-cerrar]')) b.addEventListener('click', () => dlg.close());
    }
    $('#btn-ayuda').addEventListener('click', () => $('#dialogo-faq').showModal());
    $('#btn-enlaces').addEventListener('click', () => $('#dialogo-enlaces').showModal());

    // Pestañas de enlaces (con flechas del teclado)
    const tabs = [...document.querySelectorAll('#dialogo-enlaces [role="tab"]')];
    const activar = (tab) => {
        for (const t of tabs) {
            const sel = t === tab;
            t.setAttribute('aria-selected', String(sel));
            t.tabIndex = sel ? 0 : -1;
            document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
        }
        tab.focus();
    };
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activar(tab));
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                activar(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]);
            }
        });
    });
}

// ---------- Tutorial ----------
let pasoActual = 1;
const TOTAL_PASOS = 4;

function mostrarPaso(n) {
    pasoActual = Math.min(Math.max(n, 1), TOTAL_PASOS);
    for (const s of document.querySelectorAll('#dialogo-tutorial .paso')) {
        s.hidden = Number(s.dataset.paso) !== pasoActual;
    }
    $('#tutorial-anterior').style.visibility = pasoActual === 1 ? 'hidden' : 'visible';
    $('#tutorial-siguiente').style.visibility = pasoActual === TOTAL_PASOS ? 'hidden' : 'visible';
    [...$('#tutorial-puntos').children].forEach((p, i) => p.classList.toggle('activo', i + 1 === pasoActual));
    const video = $('#dialogo-tutorial video');
    if (pasoActual === 3) {
        video.currentTime = 0;
        video.play().catch(() => {});
    } else {
        video.pause();
    }
}

function abrirTutorial() {
    $('#tutorial-no-mostrar').checked = datos.tutorialOculto;
    mostrarPaso(1);
    $('#dialogo-tutorial').showModal();
}

function prepararTutorial() {
    $('#tutorial-anterior').addEventListener('click', () => mostrarPaso(pasoActual - 1));
    $('#tutorial-siguiente').addEventListener('click', () => mostrarPaso(pasoActual + 1));
    $('#dialogo-tutorial').addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === 'ArrowRight') mostrarPaso(pasoActual + 1);
        if (e.key === 'ArrowLeft') mostrarPaso(pasoActual - 1);
    });
    $('#dialogo-tutorial').addEventListener('close', () => {
        $('#dialogo-tutorial video').pause();
        const oculto = $('#tutorial-no-mostrar').checked;
        if (oculto !== datos.tutorialOculto) {
            datos.tutorialOculto = oculto;
            guardar();
        }
    });
    $('#btn-tutorial').addEventListener('click', () => {
        $('#menu-mas').open = false;
        abrirTutorial();
    });
}

// ---------- Herramientas ----------
function prepararHerramientas() {
    $('#btn-tema').addEventListener('click', alternarTema);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!datos.tema) aplicarTema();
    });

    $('#filtro').addEventListener('change', () => {
        renderPlan();
    });

    $('#btn-pdf').addEventListener('click', async () => {
        const boton = $('#btn-pdf');
        boton.disabled = true;
        boton.textContent = 'Generando…';
        try {
            const { descargarPDF } = await import('./pdf.js');
            await descargarPDF({ carrera, reglas: plan.reglas, progreso: progresoActual(), config });
        } catch (e) {
            console.error(e);
            aviso('No se pudo generar el PDF. Revisá tu conexión e intentá de nuevo.', 'error');
        } finally {
            boton.disabled = false;
            boton.textContent = 'Descargar PDF';
        }
    });

    $('#btn-exportar').addEventListener('click', () => {
        $('#menu-mas').open = false;
        almacen.exportarArchivo(datos);
        aviso('Progreso exportado. Guardá el archivo para importarlo en otro dispositivo.');
    });

    $('#btn-importar').addEventListener('click', () => {
        $('#menu-mas').open = false;
        $('#input-importar').click();
    });
    $('#input-importar').addEventListener('change', async (e) => {
        const archivo = e.target.files[0];
        e.target.value = '';
        if (!archivo) return;
        try {
            const importado = await almacen.importarArchivo(archivo);
            const ok = await confirmar('¿Reemplazar tu progreso actual por el del archivo? Esta acción no se puede deshacer.');
            if (!ok) return;
            datos = { ...importado, tema: datos.tema, tutorialOculto: datos.tutorialOculto };
            guardar();
            seleccionarCarrera(datos.carrera || carrera.id);
            aviso('Progreso importado correctamente.');
        } catch (err) {
            aviso(err instanceof SyntaxError ? 'El archivo no es válido.' : err.message, 'error');
        }
    });

    $('#btn-reiniciar').addEventListener('click', async () => {
        $('#menu-mas').open = false;
        const ok = await confirmar(`¿Borrar todo tu progreso de ${carrera.titulo}? Esta acción no se puede deshacer.`);
        if (!ok) return;
        datos.progreso[carrera.id] = {};
        guardar();
        abiertas.clear();
        renderPlan();
        aviso('Progreso reiniciado.');
    });

    // Cerrar el menú "Más opciones" al tocar fuera o con Escape
    document.addEventListener('click', (e) => {
        const menu = $('#menu-mas');
        if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') $('#menu-mas').open = false;
    });
}

// ---------- Inicio ----------
async function cargarPlan() {
    const respuesta = await fetch('careers.json', { cache: 'no-cache' });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return respuesta.json();
}

function mostrarErrorCarga() {
    $('#plan').replaceChildren(
        el('div', { class: 'plan-mensaje' },
            el('p', { text: 'No se pudo cargar el plan de estudios.' }),
            location.protocol === 'file:'
                ? el('p', { text: 'Abriste el archivo directamente. Usá un servidor local (ver README).' })
                : null,
            el('button', { type: 'button', class: 'boton boton-primario', text: 'Reintentar', onclick: iniciar }))
    );
}

async function iniciar() {
    try {
        plan = await cargarPlan();
    } catch (e) {
        console.error(e);
        mostrarErrorCarga();
        return;
    }
    datos = almacen.cargar(plan.carreras.map((c) => c.id));
    aplicarTema();
    renderCarreras();
    seleccionarCarrera(datos.carrera || plan.carreras[0].id);
    if (!datos.tutorialOculto) abrirTutorial();
}

aplicarConfig();
prepararDialogos();
prepararTutorial();
// Hasta que carguen los datos, el tema se toma de lo que fijó el script del <head>
datos = { tema: null, tutorialOculto: true, progreso: {} };
prepararHerramientas();
iniciar();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

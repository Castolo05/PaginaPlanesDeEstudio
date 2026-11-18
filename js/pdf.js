// Genera el PDF del plan con el estado y las notas del alumno.
// jsPDF se carga recién cuando se pide el PDF, para que la página abra más rápido.
import { analizarCarrera, calcularResumen, nombreAnio } from './reglas.js?v=2.1.4';

function cargarScript(src) {
    return new Promise((resolver, rechazar) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolver();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolver;
        s.onerror = () => rechazar(new Error(`No se pudo cargar ${src}`));
        document.head.append(s);
    });
}

async function cargarJsPDF() {
    if (!window.jspdf) await cargarScript('LibreriasJS/jspdf.umd.min.js');
    await cargarScript('LibreriasJS/jspdf.plugin.autotable.js');
    return window.jspdf.jsPDF;
}

const VERDE = [200, 236, 192];
const AZUL = [205, 222, 252];
const NARANJA = [253, 226, 179];

function textoEstado(materia, estado) {
    if (estado === 'aprobada') {
        if (materia.tipo === 'ingreso') return 'Ingreso aprobado';
        if (materia.tipo === 'taller') return 'Aprobado';
        return 'Final aprobado';
    }
    if (estado === 'cursada') return 'Cursada aprobada';
    return '';
}

const formatoNota = (n) => (typeof n === 'number' ? String(n).replace('.', ',') : '');

export async function descargarPDF({ carrera, reglas, progreso, config }) {
    const jsPDF = await cargarJsPDF();
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();
    const analisis = analizarCarrera(carrera, reglas, progreso);
    const resumen = calcularResumen(carrera, reglas, progreso);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(carrera.titulo, ancho / 2, 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(config.subtituloPDF, ancho / 2, 22, { align: 'center' });

    const promedio = resumen.promedio === null ? '—' : resumen.promedio.toFixed(2).replace('.', ',');
    doc.setFontSize(9);
    doc.text(
        `Avance: ${resumen.aprobadas}/${resumen.total} materias (${resumen.porcentaje}%)   ·   Cursadas sin final: ${resumen.cursadas}   ·   Promedio: ${promedio}`,
        ancho / 2, 29, { align: 'center' }
    );

    const filas = [];
    const anios = Math.max(...carrera.materias.map((m) => m.anio));
    for (let anio = 1; anio <= anios; anio++) {
        const materias = carrera.materias.filter((m) => m.anio === anio);
        if (!materias.length) continue;
        const titulo = nombreAnio(anio).replace(/^./, (l) => l.toUpperCase());
        filas.push([{ content: titulo, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [225, 225, 225], halign: 'center' } }]);
        for (const m of materias) {
            const a = analisis[m.id];
            const nombre = (m.cuatrimestre ? `${m.cuatrimestre}C - ` : '') + m.nombre;
            let texto = textoEstado(m, a.estado);
            let color = a.estado === 'aprobada' ? VERDE : a.estado === 'cursada' ? AZUL : null;
            if (a.conflicto) {
                texto += ' (revisar)';
                color = NARANJA;
            }
            filas.push([
                { content: nombre },
                { content: texto, styles: color ? { fillColor: color } : {} },
                { content: a.estado === 'aprobada' ? formatoNota(progreso[m.id]?.nota) : '', styles: { halign: 'center' } },
            ]);
        }
    }

    doc.autoTable({
        startY: 34,
        head: [['Materia', 'Estado', 'Nota']],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8, cellPadding: 2, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 50, halign: 'center' }, 2: { cellWidth: 20 } },
        margin: { left: 20, right: 20, bottom: 14 },
    });

    const total = doc.internal.getNumberOfPages();
    const hoy = new Date().toLocaleDateString('es-AR');
    const anio = new Date().getFullYear();
    const rango = config.anioInicio && config.anioInicio < anio ? `${config.anioInicio}–${anio}` : `${anio}`;
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(170, 170, 170);
        doc.text(`Copyright © ${rango} ${config.pie}`, ancho / 2, alto - 5, { align: 'center' });
        doc.setFontSize(7);
        doc.text(`Generado: ${hoy}`, 15, alto - 5);
        doc.text(`Página ${i} de ${total}`, ancho - 15, alto - 5, { align: 'right' });
    }

    doc.save(`Plan_${carrera.id}.pdf`);
}

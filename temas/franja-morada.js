// Configuración de la versión de Franja Morada Económicas.
// Para usarla: copiar este archivo sobre js/config.js y agregar las imágenes
// media/morada-blanco.png (logo) y media/leon.png (marca de agua).
// Así las dos versiones comparten el mismo código.

export default {
    // Título de la pestaña del navegador (el encabezado muestra el logo)
    titulo: {
        largo: 'Planes de Estudio - Facultad de Ciencias Económicas',
        medio: 'Planes de Estudio - FCE',
        corto: 'PDE - FCE',
    },
    logoEncabezado: { src: 'media/morada-blanco.png', alt: 'CECE Franja Morada' },
    subtituloPDF: 'FRANJA MORADA ECONÓMICAS - GESTIÓN 25/26',
    notaTutorial: 'Difundido gracias a Franja Morada Económicas.',
    pie: 'PEFCE - FGL',
    anioInicio: 2024,
    marcaDeAgua: { src: 'media/leon.png', opacidad: 0.12 },
    colores: {
        '--marca': '#680148',
        '--marca-2': '#520d3c',
        '--acento': '#fbb03b',
        '--acento-texto': '#520d3c',
        '--carrera-activa-fondo': '#fbb03b',
        '--carrera-activa-texto': '#3d0830',
    },
};

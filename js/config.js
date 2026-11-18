// Personalización de la página (textos, logo y colores).
// Para crear otra versión (por ejemplo la de Franja Morada) basta con cambiar
// este archivo: ver el ejemplo en temas/franja-morada.js.
//
// Es un script común (no un módulo) que se carga al principio de index.html, para
// que los colores y el logo se apliquen antes de que se vea la página.

window.CONFIG_PLAN = {
    // Título del encabezado según el ancho de pantalla
    titulo: {
        largo: 'Planes de Estudio - Facultad de Ciencias Económicas',
        medio: 'Planes de Estudio - FCE',
        corto: 'PDE - FCE',
    },
    // Imagen que reemplaza al título en el encabezado (null = usar el texto)
    logoEncabezado: null,
    // Texto bajo el título en el PDF
    subtituloPDF: 'Plan de estudios interactivo FCE',
    // Línea extra en el tutorial (null = nada)
    notaTutorial: null,
    // Pie de página
    pie: 'PEFCE - FGL',
    anioInicio: 2024,
    // Imagen de fondo tenue, por ejemplo { src: 'media/leon.png', opacidad: 0.2 } (null = sin imagen)
    marcaDeAgua: null,
    // Colores (cualquier variable de css/styles.css se puede sobrescribir, además de
    // --carrera-activa-fondo y --carrera-activa-texto para el botón de la carrera elegida)
    colores: {},
};

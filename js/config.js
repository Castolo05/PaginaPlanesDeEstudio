// Personalización de la página (textos, logo y colores).
// Para crear otra versión (por ejemplo la de Franja Morada) basta con cambiar
// este archivo: ver el ejemplo en temas/franja-morada.js.

export default {
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
    // Colores (cualquier variable de css/styles.css se puede sobrescribir)
    colores: {},
};

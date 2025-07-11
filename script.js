// Variables globales para el tutorial
let currentTab = 1;
const totalTabs = 4;

// Función para comprobar si es la primera visita
function checkFirstVisit() {
    // Verificar si el usuario ha elegido no mostrar el tutorial
    const noShowTutorial = localStorage.getItem('noShowTutorial');
    
    // Si no existe la preferencia o es falsa, mostrar el tutorial
    if (!noShowTutorial) {
        showTutorial();
    }
}

// Función para mostrar el tutorial
function showTutorial() {
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
        tutorialModal.style.display = 'flex';
        resetTutorial();
    }
}

// Función para cerrar el tutorial
function closeTutorial() {
    const tutorialModal = document.getElementById('tutorialModal');
    const noShowAgain = document.getElementById('noShowAgain');
    
    // Si el checkbox está marcado, guardar preferencia en localStorage
    if (noShowAgain && noShowAgain.checked) {
        localStorage.setItem('noShowTutorial', 'true');
    }
    
    if (tutorialModal) {
        tutorialModal.style.display = 'none';
    }
}

// Función para cambiar de pestaña en el tutorial
function changeTutorialTab(direction) {
    // Ocultar la pestaña actual
    document.getElementById(`tab${currentTab}`).style.display = 'none';
    
    // Calcular la nueva pestaña
    currentTab += direction;
    
    // Asegurarse de que no se salga del rango
    if (currentTab < 1) currentTab = 1;
    if (currentTab > totalTabs) currentTab = totalTabs;
    
    // Mostrar la nueva pestaña
    document.getElementById(`tab${currentTab}`).style.display = 'block';
    
    // Actualizar estado de los botones de navegación
    updateNavigationButtons();
    
    // Si es la pestaña del video (tab3), iniciar la reproducción
    if (currentTab === 3) {
        playTutorialVideo();
    }
}

// Función para actualizar el estado de los botones de navegación
function updateNavigationButtons() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    // Deshabilitar botón anterior en la primera pestaña
    if (prevButton) {
        prevButton.style.visibility = currentTab === 1 ? 'hidden' : 'visible';
    }
    
    // Deshabilitar botón siguiente en la última pestaña
    if (nextButton) {
        nextButton.style.visibility = currentTab === totalTabs ? 'hidden' : 'visible';
    }
}

// Función para reproducir el video del tutorial
function playTutorialVideo() {
    const video = document.querySelector('#tab3 video');
    if (video) {
        // Reiniciar el video si ya estaba reproduciendo
        video.currentTime = 0;
        
        // Reproducir el video
        video.play().catch(e => {
            console.log('Error al reproducir el video:', e);
            // Algunos navegadores requieren interacción del usuario para reproducir videos
            // Mostrar un mensaje alternativo o una imagen estática
        });
    }
}

// Función para restablecer el tutorial a su estado inicial
function resetTutorial() {
    // Ocultar todas las pestañas
    for (let i = 1; i <= totalTabs; i++) {
        const tab = document.getElementById(`tab${i}`);
        if (tab) {
            tab.style.display = 'none';
        }
    }
    
    // Mostrar la primera pestaña
    currentTab = 1;
    const firstTab = document.getElementById(`tab${currentTab}`);
    if (firstTab) {
        firstTab.style.display = 'block';
    }
    
    // Actualizar estado de los botones de navegación
    updateNavigationButtons();
}

// Inicializar tutorial cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Preparar los estilos iniciales de las pestañas
    for (let i = 1; i <= totalTabs; i++) {
        const tab = document.getElementById(`tab${i}`);
        if (tab) {
            tab.style.display = 'none';
        }
    }
    
    // Verificar primera visita
    checkFirstVisit();
});

// Asegurarse de que las funciones sean accesibles globalmente
window.showTutorial = showTutorial;
window.closeTutorial = closeTutorial;
window.changeTutorialTab = changeTutorialTab;


document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (prefersDarkMode) {
        // Iniciar en modo oscuro si es la preferencia guardada
        document.querySelector('link[rel="stylesheet"]').setAttribute('href', 'styles_oscuro.css');
        darkModeToggle.setAttribute('src', 'media/modo_claro.png');
        darkModeToggle.setAttribute('alt', 'Cambiar a modo claro');
    }
});

let careers = {};  // Se inicializa vacío para cargar desde JSON
let currentCareer = '';
let openCourses = [];

// Función para cargar datos desde JSON
function loadCareerData() {
    return fetch('careers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo JSON');
            }
            return response.json();
        })
        .then(data => {
            careers = data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadCareer(careerName) {
    currentCareer = careerName;
    localStorage.setItem('lastCareer', careerName);
    const yearSections = document.getElementById('year-sections');
    yearSections.innerHTML = '';

    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${careerName}`).classList.add('active');

    const yearNames = ['1er', '2do', '3er', '4to', '5to'];
    const maxYear = Math.max(...careers[careerName].map(course => course.year));

    for (let year = 1; year <= maxYear; year++) {
        const yearSection = document.createElement('div');
        yearSection.className = 'year-section';
        yearSection.innerHTML = `<div class="year-title">${yearNames[year - 1]} Año</div>`;
    
        const allCourses = careers[careerName].filter(c => c.year === year);
    
        if (year >= 3) {
            // Para años 3 y superiores, separar por cuatrimestres
            const courseGridA = document.createElement('div');
            const courseGridB = document.createElement('div');
            const courseGridOther = document.createElement('div');
            courseGridA.className = 'course-grid';
            courseGridB.className = 'course-grid';
            courseGridOther.className = 'course-grid';
        
            const mixA = allCourses.filter(c => c.mix === 'A').sort((a, b) => a.name.localeCompare(b.name));
            const mixB = allCourses.filter(c => c.mix === 'B').sort((a, b) => a.name.localeCompare(b.name));
            const others = allCourses.filter(c => c.mix !== 'A' && c.mix !== 'B');
        
            mixA.forEach(course => courseGridA.appendChild(createCourseDiv(course)));
            mixB.forEach(course => courseGridB.appendChild(createCourseDiv(course)));
            others.forEach(course => courseGridOther.appendChild(createCourseDiv(course)));
        
            if (courseGridA.children.length) yearSection.appendChild(courseGridA);
            if (courseGridB.children.length) yearSection.appendChild(courseGridB);
            if (courseGridOther.children.length) yearSection.appendChild(courseGridOther);
        } else {
            // Para años 1 y 2, mostrar todos los cursos juntos
            const combinedGrid = document.createElement('div');
            combinedGrid.className = 'course-grid';
            allCourses.forEach(course => combinedGrid.appendChild(createCourseDiv(course)));
            yearSection.appendChild(combinedGrid);
        }
    
        yearSections.appendChild(yearSection);
    }
    
    loadSavedState();
    updateCourseAvailability();
}


// Llama a loadCareerData antes de cargar cualquier carrera
loadCareerData().then(() => {
    const lastCareer = localStorage.getItem('lastCareer') || 'gestion-tecnologica';
    loadCareer(lastCareer);
});
    loadSavedState();
    updateCourseAvailability();


function toggleCourseDetails(courseDiv) {
    if (courseDiv.classList.contains('active')) {
        courseDiv.classList.remove('active');
        openCourses = openCourses.filter(c => c !== courseDiv);
    } else {
        if (openCourses.length >= 3) {
            openCourses[0].classList.remove('active');
            openCourses.shift();
        }
        courseDiv.classList.add('active');
        openCourses.push(courseDiv);
    }

    const details = courseDiv.querySelector('.details');
    if (details) {
        details.style.backgroundColor = getComputedStyle(courseDiv).backgroundColor;
    }
}

function changeStatus(courseId, status) {
    const courseDiv = document.getElementById(`course-${courseId}`);
    const course = careers[currentCareer].find(c => c.id === courseId);

    if ((status === 'final-aprobado' || status === 'ingreso-aprobado') && !allCorrelativesApproved(course)) {
        alert('No se puede aprobar. Todas las correlativas deben estar aprobadas.');
        return;
    }

    courseDiv.className = `course ${status}`;
    updateCourseAvailability();
    updateCorrelativeStatus(courseId, status);

    const details = courseDiv.querySelector('.details');
    if (details && courseDiv.classList.contains('active')) {
        details.style.backgroundColor = getComputedStyle(courseDiv).backgroundColor;
    }
}

function areAllPreviousCoursesApproved(course) {
    return careers[currentCareer]
        .filter(c => c.year < course.year || (c.year === course.year && c.id < course.id))
        .every(c => {
            const courseDiv = document.getElementById(`course-${c.id}`);
            return courseDiv.classList.contains('final-aprobado') || 
                   courseDiv.classList.contains('ingreso-aprobado') || 
                   courseDiv.classList.contains('cursada-aprobada');
        });
}

function allCorrelativesApproved(course) {
    if (course.correlatives.includes('all')) {
        return areAllPreviousCoursesApproved(course);
    }
    return course.correlatives.every(corrId => {
        const corrDiv = document.getElementById(`course-${corrId}`);
        return corrDiv.classList.contains('final-aprobado') || 
               corrDiv.classList.contains('ingreso-aprobado') || 
               corrDiv.classList.contains('cursada-aprobada');
    });
}

function updateCorrelativeStatus(courseId, status) {
    const course = careers[currentCareer].find(c => c.id === courseId);
    careers[currentCareer].filter(c => c.correlatives.includes(courseId)).forEach(correlative => {
        const correlativeDiv = document.getElementById(`course-${correlative.id}`);
        if (status === 'sin-cursada' || status === 'sin-ingreso') {
            correlativeDiv.classList.remove('final-aprobado', 'ingreso-aprobado', 'cursada-aprobada');
            correlativeDiv.classList.add('sin-cursada');
            updateCorrelativeStatus(correlative.id, 'sin-cursada');
        }
    });
}

function updateCourseAvailability() {
    const approvedCourses = getApprovedCourses();
    const thirdYearAndAboveEnabled = checkThirdYearAndAboveEnabled(approvedCourses);
    const firstTwoYearsCompleted = checkFirstTwoYearsCompleted();

    careers[currentCareer].forEach(course => {
        const courseDiv = document.getElementById(`course-${course.id}`);
        let allCorrelativesApproved;
        
        if (course.correlatives.includes('all')) {
            allCorrelativesApproved = areAllPreviousCoursesApproved(course);
        } else {
            allCorrelativesApproved = course.correlatives.every(corrId => {
                const corrDiv = document.getElementById(`course-${corrId}`);
                return corrDiv.classList.contains('final-aprobado') || 
                       corrDiv.classList.contains('cursada-aprobada') || 
                       corrDiv.classList.contains('ingreso-aprobado');
            });
        }

        const isThirdYearOrAbove = course.year >= 3;
        const isFifthYear = course.year === 5;
        const isMateria = course.mix !== 'T' && course.mix !== 'I';

        if (!allCorrelativesApproved || 
            (isThirdYearOrAbove && isMateria && !thirdYearAndAboveEnabled) ||
            (isFifthYear && !firstTwoYearsCompleted)) {
            courseDiv.classList.add('disabled');
        } else {
            courseDiv.classList.remove('disabled');
        }

        const statusButtons = courseDiv.querySelector('.status-buttons');
        if (!allCorrelativesApproved || 
            (isThirdYearOrAbove && isMateria && !thirdYearAndAboveEnabled) ||
            (isFifthYear && !firstTwoYearsCompleted)) {
            statusButtons.style.display = 'none';
        } else {
            statusButtons.style.display = 'block';
        }
    });
}

function checkFirstTwoYearsCompleted() {
    return careers[currentCareer]
        .filter(course => course.year <= 2)
        .every(course => {
            const courseDiv = document.getElementById(`course-${course.id}`);
            return courseDiv.classList.contains('final-aprobado') || 
                   courseDiv.classList.contains('ingreso-aprobado') ||
                   (course.mix === 'T' && courseDiv.classList.contains('cursada-aprobada'));
        });
}

function getApprovedCourses() {
    const approvedCourses = {
        materia: 0,
        taller: 0
    };

    careers[currentCareer].forEach(course => {
        const courseDiv = document.getElementById(`course-${course.id}`);
        // Se cuenta como aprobada si tiene 'final-aprobado' o 'ingreso-aprobado'
        if (courseDiv.classList.contains('final-aprobado') || courseDiv.classList.contains('ingreso-aprobado')) {
            if (course.mix === 'T') {
                approvedCourses.taller++;
            } else if (course.mix !== 'I') {
                approvedCourses.materia++;
            }
        }
    });

    return approvedCourses;
}


function checkThirdYearAndAboveEnabled(approvedCourses) {
    return (
        (approvedCourses.materia >= 12) ||
        (approvedCourses.materia >= 11 && approvedCourses.taller >= 1) ||
        (approvedCourses.materia >= 10 && approvedCourses.taller >= 2) ||
        (approvedCourses.materia >= 9 && approvedCourses.taller >= 3)
    );
}

function openModal() {
    document.getElementById('contactModal').style.display = 'block';
    document.body.classList.add('blur');
}

function closeModal() {
    document.getElementById('contactModal').style.display = 'none';
    document.body.classList.remove('blur');
}

window.onclick = function(event) {
    if (event.target == document.getElementById('contactModal')) {
        closeModal();
    }
}

function saveChanges() {
    const courseStates = {};
    careers[currentCareer].forEach(course => {
        const courseDiv = document.getElementById(`course-${course.id}`);
        courseStates[course.id] = courseDiv.className.split(' ')[1];
    });
    localStorage.setItem(`${currentCareer}-states`, JSON.stringify(courseStates));
    alert('Cambios guardados correctamente');
}

function loadSavedState() {
    const savedStates = localStorage.getItem(`${currentCareer}-states`);
    if (savedStates) {
        const courseStates = JSON.parse(savedStates);
        Object.keys(courseStates).forEach(courseId => {
            const courseDiv = document.getElementById(`course-${courseId}`);
            if (courseDiv) {
                courseDiv.className = `course ${courseStates[courseId]}`;
            }
        });
    }
}

// Funciones para el tutorial


// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year-sections').innerHTML = '<p>Seleccione una carrera para ver su plan de estudios.</p>';

    const lastCareer = localStorage.getItem('lastCareer');
    if (lastCareer) {
        loadCareer(lastCareer);
    }

    if (localStorage.getItem("tutorialShown") !== "true") {
        showTutorial();
    }
});

// Manejador de eventos para el botón de cerrar tutorial
document.getElementById('closeTutorialButton').addEventListener('click', closeTutorial);

// Manejadores de eventos para los botones de navegación del tutorial
document.getElementById('prevButton').addEventListener('click', () => changeTutorialTab(-1));
document.getElementById('nextButton').addEventListener('click', () => changeTutorialTab(1));

function toggleFAQ() {
    var modal = document.getElementById("faqModal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
}

function toggleAnswer(id) {
    var answer = document.getElementById("answer" + id);
    var allAnswers = document.getElementsByClassName("faq-answer");
    
    for (var i = 0; i < allAnswers.length; i++) {
        if (allAnswers[i] !== answer) {
            allAnswers[i].style.display = "none";
        }
    }
    
    answer.style.display = answer.style.display === "block" ? "none" : "block";
}



  function toggleLinksModal() {
    var modal = document.getElementById("linksModal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  }
  
  function openTab(evt, tabName) {
    var i, tabContent, tabButtons;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
      tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }
  
  // Modificar la función window.onclick para incluir el nuevo modal
  window.onclick = function(event) {
    var faqModal = document.getElementById("faqModal");
    var linksModal = document.getElementById("linksModal");
    if (event.target == faqModal) {
      faqModal.style.display = "none";
    }
    if (event.target == linksModal) {
      linksModal.style.display = "none";
    }
  }






function changeStatus(courseId, status) {
    const courseDiv = document.getElementById(`course-${courseId}`);
    const course = careers[currentCareer].find(c => c.id === courseId);

    if ((status === 'final-aprobado' || status === 'ingreso-aprobado') && !allCorrelativesApproved(course)) {
        alert('No puedes dar este final, debés finales de materia/s correlativas a esta.');
        return;
    }

    courseDiv.className = `course ${status}`;
    updateCourseAvailability();
    updateCorrelativeStatus(courseId, status);

    const details = courseDiv.querySelector('.details');
    if (details && courseDiv.classList.contains('active')) {
        details.style.backgroundColor = getComputedStyle(courseDiv).backgroundColor;
    }
}

function allCorrelativesApproved(course) {
    if (course.correlatives.includes('all')) {
        return areAllPreviousCoursesApproved(course);
    }
    return course.correlatives.every(corrId => {
        const corrDiv = document.getElementById(`course-${corrId}`);
        return corrDiv.classList.contains('final-aprobado') || 
               corrDiv.classList.contains('ingreso-aprobado');
    });
}

function areAllPreviousCoursesApproved(course) {
    return careers[currentCareer]
        .filter(c => c.year < course.year || (c.year === course.year && c.id < course.id))
        .every(c => {
            const courseDiv = document.getElementById(`course-${c.id}`);
            return courseDiv.classList.contains('final-aprobado') || 
                   courseDiv.classList.contains('ingreso-aprobado');
        });
}

function updateCorrelativeStatus(courseId, status) {
    const course = careers[currentCareer].find(c => c.id === courseId);
    careers[currentCareer].filter(c => c.correlatives.includes(courseId)).forEach(correlative => {
        const correlativeDiv = document.getElementById(`course-${correlative.id}`);
        if (status === 'sin-cursada' || status === 'sin-ingreso') {
            correlativeDiv.classList.remove('final-aprobado', 'ingreso-aprobado', 'cursada-aprobada');
            correlativeDiv.classList.add('sin-cursada');
            updateCorrelativeStatus(correlative.id, 'sin-cursada');
        }
    });
}
function createCourseDiv(course) {
    const courseDiv = document.createElement('div');
    courseDiv.className = 'course sin-cursada';
    courseDiv.id = `course-${course.id}`;

    let statusButtons = `
        <button class="status-button final-aprobado" onclick="changeStatus('${course.id}', 'final-aprobado')">Final Aprobado</button>
        <button class="status-button cursada-aprobada" onclick="changeStatus('${course.id}', 'cursada-aprobada')">Cursada Aprobada</button>
        <button class="status-button sin-cursada" onclick="changeStatus('${course.id}', 'sin-cursada')">Sin Cursada</button>
    `;

    if (course.id === 'L0000') {
        statusButtons = `
            <button class="status-button final-aprobado" onclick="changeStatus('${course.id}', 'ingreso-aprobado')">Ingreso Aprobado</button>
            <button class="status-button sin-cursada" onclick="changeStatus('${course.id}', 'sin-ingreso')">Sin Ingreso</button>
        `;
    } else if (course.mix === 'T') {
        statusButtons = `
            <button class="status-button final-aprobado" onclick="changeStatus('${course.id}', 'final-aprobado')">Final Aprobado</button>
            <button class="status-button sin-cursada" onclick="changeStatus('${course.id}', 'sin-cursada')">Sin Cursada</button>
        `;
    }

    const correlativas = course.correlatives.includes('all')
        ? '<li>Todas las materias anteriores</li>'
        : (course.correlatives.length
            ? course.correlatives.map(corrId => `<li>- ${careers[currentCareer].find(c => c.id === corrId).name}</li>`).join('')
            : '<li>Ninguna</li>');

    const isCorrelativeFor = careers[currentCareer].filter(c => c.correlatives.includes(course.id));
    const correlativaPara = isCorrelativeFor.length
        ? isCorrelativeFor.map(c => `<li>- ${c.name}</li>`).join('')
        : '<li>Ninguna</li>';

    courseDiv.innerHTML = `
        <h2>${course.name}</h2>
        <div class="details">
            <h3>Correlativas necesarias:</h3>
            <ul class="correlatives">${correlativas}</ul>
            <h3>Es correlativa para:</h3>
            <ul class="is-correlative-for">${correlativaPara}</ul>
            <div class="status-buttons">${statusButtons}</div>
        </div>
    `;

    courseDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('status-button')) toggleCourseDetails(courseDiv);
    });

    return courseDiv;
}
// Inserta esta función dentro de script.js
function createCourseDiv(course) {
    const courseDiv = document.createElement('div');
    courseDiv.className = 'course sin-cursada';
    courseDiv.id = `course-${course.id}`;

    let statusButtons = `
        <button class="status-button final-aprobado" onclick="changeStatus('${course.id}', 'final-aprobado')">Final Aprobado</button>
        <button class="status-button cursada-aprobada" onclick="changeStatus('${course.id}', 'cursada-aprobada')">Cursada Aprobada</button>
        <button class="status-button sin-cursada" onclick="changeStatus('${course.id}', 'sin-cursada')">Sin Cursada</button>
    `;

    if (course.id === 'L0000') {
        statusButtons = `
            <button class="status-button final-aprobado" onclick="changeStatus('${course.id}', 'ingreso-aprobado')">Ingreso Aprobado</button>
            <button class="status-button sin-cursada" onclick="changeStatus('${course.id}', 'sin-ingreso')">Sin Ingreso</button>
        `;
    } else if (course.mix === 'T') {
        statusButtons = `
            <button class="status-button final-aprobado" onclick="changeStatus('${course.id}', 'final-aprobado')">Final Aprobado</button>
            <button class="status-button sin-cursada" onclick="changeStatus('${course.id}', 'sin-cursada')">Sin Cursada</button>
        `;
    }

    const correlativas = course.correlatives.includes('all')
        ? '<li>Todas las materias anteriores</li>'
        : (course.correlatives.length
            ? course.correlatives.map(corrId => `<li>- ${careers[currentCareer].find(c => c.id === corrId).name}</li>`).join('')
            : '<li>Ninguna</li>');

    const isCorrelativeFor = careers[currentCareer].filter(c => c.correlatives.includes(course.id));
    const correlativaPara = isCorrelativeFor.length
        ? isCorrelativeFor.map(c => `<li>- ${c.name}</li>`).join('')
        : '<li>Ninguna</li>';

    let mixLabel = '';
    if (course.year >= 3) {
        if (course.mix === 'A') {
            mixLabel = '<span class="cuatri cuatri-a">1C - </span>';
        } else if (course.mix === 'B') {
            mixLabel = '<span class="cuatri cuatri-b">2C - </span>';
        }
    }

    courseDiv.innerHTML = `
        <h2>${mixLabel}${course.name}</h2>
        <div class="details">
            <h3>Correlativas necesarias:</h3>
            <ul class="correlatives">${correlativas}</ul>
            <h3>Es correlativa para:</h3>
            <ul class="is-correlative-for">${correlativaPara}</ul>
            <div class="status-buttons">${statusButtons}</div>
        </div>
    `;

    courseDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('status-button')) toggleCourseDetails(courseDiv);
    });

    return courseDiv;
}

// Función para alternar entre modo oscuro y claro
function toggleDarkMode() {
    const currentStylesheet = document.querySelector('link[rel="stylesheet"]');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Verifica qué modo está activo actualmente
    const isDarkMode = currentStylesheet.getAttribute('href') === 'styles_oscuro.css';
    
    if (isDarkMode) {
        // Cambiar a modo claro
        currentStylesheet.setAttribute('href', 'styles.css');
        darkModeToggle.setAttribute('src', 'media/modo_oscuro.png');
        darkModeToggle.setAttribute('alt', 'Cambiar a modo oscuro');
        // Guardar preferencia en localStorage
        localStorage.setItem('darkMode', 'false');
    } else {
        // Cambiar a modo oscuro
        currentStylesheet.setAttribute('href', 'styles_oscuro.css');
        darkModeToggle.setAttribute('src', 'media/modo_claro.png');
        darkModeToggle.setAttribute('alt', 'Cambiar a modo claro');
        // Guardar preferencia en localStorage
        localStorage.setItem('darkMode', 'true');
    }
}

// Función para descargar el plan de estudios como PDF
function downloadPlanPDF() {
    const { jsPDF } = window.jspdf;
    
    // Crear nuevo documento PDF con márgenes reducidos
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        margins: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        }
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Configurar estilos para el título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16); // Título más grande
    
    // Añadir título de la carrera
    const careerTitle = getCareerTitle(currentCareer);
    doc.text(careerTitle, pageWidth / 2, 15, { align: 'center' });
    
    // Subtítulo actualizado
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Plan de estudios interactivo FCE", pageWidth / 2, 22, { align: 'center' });
    
    // Variables para control de posición
    let yPosition = 30;
    const yearNames = ['1er', '2do', '3er', '4to', '5to'];
    
    // Crear un arreglo para almacenar todas las materias organizadas por año
    let allTableData = [];
    
    // Iterar por cada año para recolectar los datos
    for (let year = 1; year <= 5; year++) {
        // Verificar si hay materias en este año
        const yearCourses = careers[currentCareer].filter(c => c.year === year);
        if (yearCourses.length === 0) continue;
        
        // Añadir encabezado del año a la tabla
        allTableData.push([{content: `${yearNames[year-1]} Año`, colSpan: 3, styles: {fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center'}}]);
        
        // Ordenar materias como en el sitio web
        const sortedCourses = [...yearCourses];
        if (year >= 3) {
            // Para años 3 y superiores, agrupar por cuatrimestre
            const mixA = yearCourses.filter(c => c.mix === 'A');
            const mixB = yearCourses.filter(c => c.mix === 'B');
            const others = yearCourses.filter(c => c.mix !== 'A' && c.mix !== 'B');
            sortedCourses.length = 0;
            sortedCourses.push(...mixA, ...mixB, ...others);
        }
        
        // Procesar cada materia
        for (const course of sortedCourses) {
            let courseName = course.name;
            if (year >= 3) {
                if (course.mix === 'A') {
                    courseName = "1C - " + courseName;
                } else if (course.mix === 'B') {
                    courseName = "2C - " + courseName;
                }
            }
            
            // Obtener estado de la materia
            const courseDiv = document.getElementById(`course-${course.id}`);
            let status = courseDiv.className.split(' ')[1];
            let displayStatus = "";
            let cellColor = null;
            
            // Manejar el caso especial de "Introducción a la Vida Universitaria"
            // O cualquier materia con ID L0000 (curso de ingreso)
            if (course.id === 'L0000' || course.name.includes("Introducción a la Vida Universitaria")) {
                if (status === 'final-aprobado' || status === 'ingreso-aprobado') {
                    displayStatus = "Ingreso Aprobado";
                    cellColor = [144, 238, 144]; // Verde claro
                }
            } else {
                // Para el resto de materias
                switch (status) {
                    case 'final-aprobado':
                        displayStatus = "Final Aprobado";
                        cellColor = [144, 238, 144]; // Verde claro
                        fontStyle = 'bold';
                        break;
                    case 'ingreso-aprobado':
                        displayStatus = "Ingreso Aprobado";
                        cellColor = [144, 238, 144]; // Verde claro
                        fontStyle = 'bold';
                        break;
                    case 'cursada-aprobada':
                        displayStatus = "Cursada Aprobada";
                        cellColor = [173, 216, 230]; // Azul claro
                        fontStyle = 'bold';
                        break;
                    case 'sin-cursada':
                    case 'sin-ingreso':
                        displayStatus = ""; // Sin texto para materias sin cursada
                        cellColor = null; // Color blanco por defecto
                        fontStyle = 'bold';
                        break;
                    default:
                        displayStatus = "";
                        cellColor = null;
                }
            }
            
            // Añadir a la tabla con estilo condicional
            allTableData.push([
                {content: courseName, styles: {}},
                {content: displayStatus, styles: cellColor ? {fillColor: cellColor} : {}},
                {content: "", styles: {}}
            ]);
        }
    }

    // Crear la tabla con todos los datos
    doc.autoTable({
        startY: yPosition,
        head: [['Materia', 'Estado', 'Nota']],
        body: allTableData,
        theme: 'grid',
        headStyles: {
            fillColor: [66, 66, 66],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 50, halign: 'center' },
            2: { cellWidth: 20 } // Columna Nota más angosta
        },
        margin: { left: 20, right: 20 } // Ajustados márgenes para centrar mejor
    });
    
    // Añadir marca de agua de copyright
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Marca de agua de copyright
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200); // Color muy claro para simular marca de agua
        doc.text("Copyright © 2024 PEFCE - FGL", pageWidth / 2, 
            doc.internal.pageSize.getHeight() - 5, { align: 'center' });
        
        // Fecha de generación (discreta en la esquina)
        const today = new Date();
        doc.setFontSize(7);
        doc.text(`Generado: ${today.toLocaleDateString()}`, 15, doc.internal.pageSize.getHeight() - 5);
    }
    
    // Guardar el PDF
    doc.save(`Plan_${currentCareer}.pdf`);
}

// Función auxiliar para obtener el título de la carrera
function getCareerTitle(careerName) {
    const titles = {
        'gestion-tecnologica': 'Licenciatura en Gestión Tecnológica',
        'economia-empresarial': 'Licenciatura en Economía Empresarial',
        'contador-publico': 'Contador Público',
        'administracion': 'Licenciatura en Administración'
    };
    return titles[careerName] || 'Plan de Estudios';
}

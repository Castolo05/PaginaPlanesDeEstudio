// Añadir este código al inicio del archivo script.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es la primera visita comprobando localStorage
    if (!localStorage.getItem('tutorialShown')) {
        // Es la primera visita, mostrar el tutorial
        showTutorial();
    }
});

let currentTab = 1;
const totalTabs = 4; // Asegúrate de que este número coincida con el total de tabs que tienes

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es la primera visita
    if (!localStorage.getItem('tutorialShown')) {
        // Es la primera visita, mostrar el tutorial
        showTutorial();
    }
    
    // Configurar los event listeners para los botones de navegación
    document.getElementById('prevButton').addEventListener('click', function() {
        changeTutorialTab(-1);
    });
    
    document.getElementById('nextButton').addEventListener('click', function() {
        changeTutorialTab(1);
    });
});

function showTutorial() {
    document.getElementById("tutorialModal").style.display = "flex";
    document.body.classList.add('blur');
    document.body.style.overflow = 'hidden';
    
    // Restablecer a la primera pestaña
    currentTab = 1;
    showTutorialTab(currentTab);
}

function showTutorialTab(tabNumber) {
    // Validar que el número de tab es válido
    if (tabNumber < 1 || tabNumber > totalTabs) return;
    
    // Actualizar la variable global
    currentTab = tabNumber;
    
    // Ocultar todas las pestañas y pausar videos
    const tabs = document.querySelectorAll('.tutorial-tab');
    tabs.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
        const video = tab.querySelector('video');
        if (video) {
            video.pause();
        }
    });
    
    // Mostrar la pestaña actual
    const currentTabElement = document.getElementById(`tab${tabNumber}`);
    if (currentTabElement) {
        currentTabElement.style.display = 'flex';
        currentTabElement.classList.add('active');
        
        // Reproducir video si existe en esta pestaña
        const currentVideo = currentTabElement.querySelector('video');
        if (currentVideo) {
            currentVideo.load(); // Asegurarse de que el video se cargue correctamente
            currentVideo.play().catch(e => console.log("Error reproduciendo video:", e));
        }
    }
    
    // Actualizar visibilidad de botones
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    prevButton.disabled = (tabNumber === 1);
    nextButton.disabled = (tabNumber === totalTabs);
    
    // Asegurarse de que los botones estén visibles siempre (excepto cuando están deshabilitados)
    prevButton.style.display = 'block';
    nextButton.style.display = 'block';
}

function changeTutorialTab(direction) {
    const newTab = currentTab + direction;
    if (newTab >= 1 && newTab <= totalTabs) {
        showTutorialTab(newTab);
    }
}

function closeTutorial() {
    // Pausar cualquier video que esté reproduciéndose
    const videos = document.querySelectorAll('.tutorial-tab video');
    videos.forEach(video => {
        if (video) video.pause();
    });
    
    document.getElementById("tutorialModal").style.display = "none";
    document.body.classList.remove('blur');
    document.body.style.overflow = 'auto';
    
    if (document.getElementById("noShowAgain").checked) {
        localStorage.setItem("tutorialShown", "true");
    }
}

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

// Verificar la preferencia guardada al cargar la página
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

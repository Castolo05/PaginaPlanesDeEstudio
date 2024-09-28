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
        yearSection.innerHTML = `<div class="year-title">${yearNames[year-1]} Año</div><div class="course-grid"></div>`;
        const courseGrid = yearSection.querySelector('.course-grid');

        careers[careerName].filter(course => course.year === year).forEach(course => {
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

            courseDiv.innerHTML = `
                <h2>${course.name}</h2>
                <div class="details">
                    <h3>Correlativas necesarias:</h3>
                    <ul class="correlatives">
                        ${course.correlatives.includes('all') ? '<li>Todas las materias anteriores</li>' : 
                          (course.correlatives.length ? course.correlatives.map(corrId => `<li>- ${careers[currentCareer].find(c => c.id === corrId).name}</li>`).join('') : '<li>Ninguna</li>')}
                    </ul>
                    <h3>Es correlativa para:</h3>
                    <ul class="is-correlative-for">
                        ${careers[currentCareer].filter(c => c.correlatives.includes(course.id)).length ? careers[currentCareer].filter(c => c.correlatives.includes(course.id)).map(c => `<li>- ${c.name}</li>`).join('') : '<li>Ninguna</li>'}
                    </ul>
                    <div class="status-buttons">
                        ${statusButtons}
                    </div>
                </div>
            `;
            courseGrid.appendChild(courseDiv);

            courseDiv.addEventListener('click', (e) => {
                if (!e.target.classList.contains('status-button')) {
                    toggleCourseDetails(courseDiv);
                }
            });
        });

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
        if (courseDiv.classList.contains('final-aprobado')) {
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
let currentTab = 1;

function showTutorial() {
    document.getElementById("tutorialModal").style.display = "flex";
    document.body.classList.add('blur');
    document.body.style.overflow = 'hidden';
    showTutorialTab(1);
}

function showTutorialTab(tabNumber) {
    const tabs = document.querySelectorAll('.tutorial-tab');
    tabs.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
        const video = tab.querySelector('video');
        if (video) {
            video.pause();
        }
    });
    const currentTabElement = document.getElementById(`tab${tabNumber}`);
    currentTabElement.style.display = 'flex';
    currentTabElement.classList.add('active');

    const currentVideo = currentTabElement.querySelector('video');
    if (currentVideo) {
        currentVideo.play();
    }

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    prevButton.style.display = tabNumber === 1 ? 'none' : 'block';
    nextButton.style.display = tabNumber === tabs.length ? 'none' : 'block';
}

function changeTutorialTab(direction) {
    currentTab += direction;
    showTutorialTab(currentTab);
}

function closeTutorial() {
    document.getElementById("tutorialModal").style.display = "none";
    document.body.classList.remove('blur');
    document.body.style.overflow = 'auto';
    if (document.getElementById("noShowAgain").checked) {
        localStorage.setItem("tutorialShown", "true");
    }
}

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
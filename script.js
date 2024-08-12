const careers = {
            'gestion-tecnologica': [
                { id: 0, name: 'Introducción a las Ciencias Económicas', correlatives: [], year: 1, mix: 'I' },
                { id: 1, name: 'Contabilidad Básica', correlatives: [0], year: 1, mix: 'A' },
                { id: 2, name: 'Matemática I', correlatives: [0], year: 1, mix: 'A' },
                { id: 3, name: 'Administración', correlatives: [0], year: 1, mix: 'A' },
                { id: 4, name: 'Introducción a la Economía', correlatives: [0], year: 1, mix: 'B' },
                { id: 5, name: 'Instituciones al Derecho Público', correlatives: [], year: 1, mix: 'B' },
                { id: 6, name: 'Estadística', correlatives: [0], year: 1, mix: 'B' },
                { id: 7, name: 'Historia Económica', correlatives: [], year: 1, mix: 'B' },
                { id: 8, name: 'Matemática II', correlatives: [2], year: 2, mix: 'A' },
                { id: 9, name: 'Sistema de Información Gerencial', correlatives: [1, 3], year: 2, mix: 'A' },
                { id: 10, name: 'Filosofía y Lógica', correlatives: [0], year: 2, mix: 'A' },
                { id: 11, name: 'Análisis Microeconómico', correlatives: [4], year: 2, mix: 'B' },
                { id: 12, name: 'Derecho Empresario I', correlatives: [0], year: 2, mix: 'B' },
                { id: 13, name: 'Técnicas Cuantitativas', correlatives: [6], year: 2, mix: 'B' },
                { id: 14, name: 'Sistemas Administrativos', correlatives: [0], year: 2, mix: 'B' },
                { id: 15, name: 'Matemática Financiera', correlatives: [2, 6], year: 3, mix: 'A' },
                { id: 16, name: 'Análisis e Interpretación de Estados Contables', correlatives: [1, 9], year: 3, mix: 'A' },
                { id: 17, name: 'Análisis y Diseño de Sistemas I', correlatives: [9, 14], year: 3, mix: 'A' },
                { id: 18, name: 'Innovación y Diseño', correlatives: [3], year: 3, mix: 'A' },
                { id: 19, name: 'Análisis Macroeconómico', correlatives: [4], year: 3, mix: 'B' },
                { id: 20, name: 'Derecho Aplicado a la Tecnología y a la Información', correlatives: [12], year: 3, mix: 'B' },
                { id: 21, name: 'Dirección y Gestión del Talento', correlatives: [3], year: 3, mix: 'B' },
                { id: 22, name: 'Gobernanza de Tecnología de Información', correlatives: [3], year: 3, mix: 'B' },
                { id: 23, name: 'Emprendedorismo Tecnológico', correlatives: [3], year: 3, mix: 'B' },
                { id: 24, name: 'Finanzas Corporativas', correlatives: [15], year: 4, mix: 'A' },
                { id: 25, name: 'Efectos de la Tributación en los Negocios Tecnológicos', correlatives: [5, 16], year: 4, mix: 'A' },
                { id: 26, name: 'Análisis y Diseño de Sistemas II', correlatives: [17], year: 4, mix: 'A' },
                { id: 27, name: 'Marketing Digital, Social Media & E-Commerce', correlatives: [6, 11], year: 4, mix: 'A' },
                { id: 28, name: 'Seguridad de la Información y Auditoría de Sistemas', correlatives: [9, 14, 16], year: 4, mix: 'A' },
                { id: 29, name: 'Economía Digital', correlatives: [11, 19], year: 4, mix: 'B' },
                { id: 30, name: 'Transformación Digital', correlatives: [17, 22], year: 4, mix: 'B' },
                { id: 31, name: 'Herramientas de Inteligencia Empresarial', correlatives: [13, 26], year: 4, mix: 'B' },
                { id: 32, name: 'Dirección Estratégica y Modelos de Negocios', correlatives: [18, 23], year: 4, mix: 'B' },
                { id: 33, name: 'Tendencias Tecnológicas', correlatives: [18, 23], year: 4, mix: 'B' },
                { id: 34, name: 'Taller de Desarrollo de Habilidades I', correlatives: [], year: 1, mix: 'T' },
                { id: 35, name: 'Taller de Desarrollo de Habilidades II', correlatives: [], year: 1, mix: 'T' },
                { id: 36, name: 'Taller de Manejo de Herramientas Informáticas', correlatives: [], year: 2, mix: 'T' },
                { id: 37, name: 'Taller de Idiomas I', correlatives: [], year: 2, mix: 'T' },
                { id: 38, name: 'Taller de Idioma II', correlatives: [37], year: 3, mix: 'T' },
                { id: 39, name: 'Taller de Trabajo Final de Graduación', correlatives: [], year: 4, mix: 'T' },
                { id: 41, name: 'Espacio de Práctica Profesional Supervisada', correlatives: [14, 16], year: 4, mix: 'P' },
                { id: 42, name: 'Taller de Idiomas (Examen Internacional)', correlatives: [], year: 3, mix: 'T' }
            ],
            'economia-empresarial': [
                { id: 0, name: 'Introducción a las Ciencias Económicas', correlatives: [], year: 1, mix: 'I' },
                { id: 1, name: 'Contabilidad Básica', correlatives: [0], year: 1, mix: 'A' },
                { id: 2, name: 'Matemática I', correlatives: [0], year: 1, mix: 'A' },
                { id: 3, name: 'Administración', correlatives: [0], year: 1, mix: 'A' },
                { id: 4, name: 'Introducción a la Economía', correlatives: [0], year: 1, mix: 'B' },
                { id: 5, name: 'Instituciones al Derecho Público', correlatives: [], year: 1, mix: 'B' },
                { id: 6, name: 'Estadística', correlatives: [0], year: 1, mix: 'B' },
                { id: 7, name: 'Historia Económica', correlatives: [], year: 1, mix: 'B' },
                { id: 8, name: 'Matemática II', correlatives: [2], year: 2, mix: 'A' },
                { id: 9, name: 'Sistema de Información Gerencial', correlatives: [1, 3], year: 2, mix: 'A' },
                { id: 10, name: 'Filosofía y Lógica', correlatives: [0], year: 2, mix: 'A' },
                { id: 11, name: 'Análisis Microeconómico', correlatives: [4], year: 2, mix: 'B' },
                { id: 12, name: 'Derecho Empresario I', correlatives: [0], year: 2, mix: 'B' },
                { id: 13, name: 'Técnicas Cuantitativas', correlatives: [6], year: 2, mix: 'B' },
                { id: 14, name: 'Sistemas Administrativos', correlatives: [0], year: 2, mix: 'B' },
                { id: 15, name: 'Matemática Financiera', correlatives: [2, 6], year: 3, mix: 'A' },               
                { id: 16, name: 'Administración Pública', correlatives: [1, 3, 5], year: 3, mix: 'A' },
                { id: 17, name: 'Análisis e Interpretación de Estados Contables', correlatives: [1, 9], year: 3, mix: 'A' },
                { id: 18, name: 'Organización Industrial', correlatives: [11], year: 3, mix: 'A' },
                { id: 19, name: 'Econometría y Modelización', correlatives: [13], year: 3, mix: 'B' },
                { id: 20, name: 'Análisis Macroeconómico', correlatives: [4], year: 3, mix: 'B' },
                { id: 21, name: 'Derecho Empresario II', correlatives: [12], year: 3, mix: 'B' },
                { id: 22, name: 'Logística y Organización Productiva', correlatives: [3, 13], year: 3, mix: 'B' },
                { id: 23, name: 'Finanzas Corporativas', correlatives: [6, 15], year: 4, mix: 'A' },
                { id: 24, name: 'Innovación y Desarrollo Regional', correlatives: [11, 20], year: 4, mix: 'A' },
                { id: 25, name: 'Introducción al Análisis de Datos y DataMining', correlatives: [19], year: 4, mix: 'A' },
                { id: 26, name: 'Tecnologías de Información', correlatives: [9, 14], year: 4, mix: 'A' },
                { id: 27, name: 'Derecho Financiero y de Mercado de Capitales', correlatives: [21], year: 4, mix: 'B' },
                { id: 28, name: 'Finanzas de Activos y Mercados Financieros', correlatives: [15], year: 4, mix: 'B' },
                { id: 29, name: 'Introducción a la Tributación', correlatives: [5, 17], year: 4, mix: 'B' },
                { id: 30, name: 'Costos para la Toma de Decisiones', correlatives: [17], year: 4, mix: 'B' },
                { id: 31, name: 'Política Económica', correlatives: [11, 20], year: 5, mix: 'A' },
                { id: 32, name: 'Metodología de la Investigación', correlatives: [7], year: 5, mix: 'A' },
                { id: 33, name: 'Economía Gerencial', correlatives: [13, 23, 30], year: 5, mix: 'A' },
                { id: 34, name: 'Práctica Profesional', correlatives: [19], year: 5, mix: 'A' },
                { id: 35, name: 'Taller de Desarrollo de Habilidades I', correlatives: [], year: 1, mix: 'T' },
                { id: 36, name: 'Taller de Desarrollo de Habilidades II', correlatives: [], year: 1, mix: 'T' },
                { id: 37, name: 'Taller de Manejo de Herramientas Informáticas', correlatives: [], year: 2, mix: 'T' },
                { id: 38, name: 'Taller de Idiomas I', correlatives: [], year: 2, mix: 'T' },
                { id: 39, name: 'Taller de Idioma II', correlatives: [38], year: 3, mix: 'T' },
                { id: 40, name: 'Taller de Práctica de Sistemas Contables', correlatives: [1], year: 3, mix: 'T' },
                { id: 41, name: 'Espacio de Práctica Profesional Supervisada', correlatives: [], year: 4, mix: 'P' }
            ],
            'contador-publico': [
                { id: 0, name: 'Introducción a las Ciencias Económicas', correlatives: [], year: 1, mix: 'I' },
                { id: 1, name: 'Contabilidad Básica', correlatives: [0], year: 1, mix: 'A' },
                { id: 2, name: 'Matemática I', correlatives: [0], year: 1, mix: 'A' },
                { id: 3, name: 'Administración', correlatives: [0], year: 1, mix: 'A' },
                { id: 4, name: 'Introducción a la Economía', correlatives: [0], year: 1, mix: 'B' },
                { id: 5, name: 'Instituciones al Derecho Público', correlatives: [], year: 1, mix: 'B' },
                { id: 6, name: 'Estadística', correlatives: [0], year: 1, mix: 'B' },
                { id: 7, name: 'Historia Económica', correlatives: [], year: 1, mix: 'B' },
                { id: 8, name: 'Matemática II', correlatives: [2], year: 2, mix: 'A' },
                { id: 9, name: 'Sistema de Información Gerencial', correlatives: [1, 3], year: 2, mix: 'A' },
                { id: 10, name: 'Filosofía y Lógica', correlatives: [0], year: 2, mix: 'A' },
                { id: 11, name: 'Contabilidad Intermedia', correlatives: [1], year: 2, mix: 'A' },
                { id: 12, name: 'Análisis Microeconómico', correlatives: [4], year: 2, mix: 'B' },
                { id: 13, name: 'Derecho Empresario I', correlatives: [0], year: 2, mix: 'B' },
                { id: 14, name: 'Técnicas Cuantitativas', correlatives: [6], year: 2, mix: 'B' },
                { id: 15, name: 'Sistemas Administrativos', correlatives: [0], year: 2, mix: 'B' },
                { id: 16, name: 'Matemática Financiera', correlatives: [2, 6], year: 3, mix: 'A' },
                { id: 17, name: 'Administración Pública', correlatives: [1, 3, 5], year: 3, mix: 'A' },
                { id: 18, name: 'Tecnologías de la Información', correlatives: [9, 15], year: 3, mix: 'A' },
                { id: 19, name: 'Costos', correlatives: [1, 15], year: 3, mix: 'A' },
                { id: 20, name: 'Análisis Macroeconómico', correlatives: [4], year: 3, mix: 'B' },
                { id: 21, name: 'Estados Contables', correlatives: [11], year: 3, mix: 'B' },
                { id: 22, name: 'Derecho Empresario II', correlatives: [13], year: 3, mix: 'B' },
                { id: 23, name: 'Finanzas Corporativas', correlatives: [6, 16], year: 4, mix: 'A' },
                { id: 24, name: 'Gestión de Costos', correlatives: [19], year: 4, mix: 'A' },
                { id: 25, name: 'Impuestos I', correlatives: [5], year: 4, mix: 'A' },
                { id: 26, name: 'Contabilidad Superior', correlatives: [11], year: 4, mix: 'A' },
                { id: 27, name: 'Auditoria I', correlatives: [13, 15, 21], year: 4, mix: 'B' },
                { id: 28, name: 'Legislación Laboral', correlatives: [5], year: 4, mix: 'B' },
                { id: 29, name: 'Concursos y Quiebras', correlatives: [22], year: 4, mix: 'B' },
                { id: 30, name: 'Finanzas de Activos y Mercados Financieros', correlatives: [16], year: 4, mix: 'B' },
                { id: 31, name: 'Auditoria II', correlatives: [27], year: 5, mix: 'A' },
                { id: 32, name: 'Impuestos II', correlatives: [25], year: 5, mix: 'A' },
                { id: 33, name: 'Práctica Profesional', correlatives: [27], year: 5, mix: 'A' },
                { id: 34, name: 'Metodología de la Investigación', correlatives: [10], year: 5, mix: 'A' },
                { id: 35, name: 'Taller de Desarrollo de Habilidades I', correlatives: [], year: 1, mix: 'T' },
                { id: 36, name: 'Taller de Desarrollo de Habilidades II', correlatives: [], year: 1, mix: 'T' },
                { id: 37, name: 'Taller de Manejo de Herramientas Informáticas', correlatives: [], year: 2, mix: 'T' },
                { id: 38, name: 'Taller de Idiomas I', correlatives: [], year: 2, mix: 'T' },
                { id: 39, name: 'Taller de Idioma II', correlatives: [38], year: 3, mix: 'T' },
                { id: 40, name: 'Taller de Práctica de Sistemas Contables', correlatives: [1], year: 3, mix: 'T' },
                { id: 41, name: 'Espacio de Práctica Profesional Supervisada', correlatives: [15, 21], year: 4, mix: 'P' },
                { id: 42, name: 'Taller de Idiomas (Examen Internacional)', correlatives: [], year: 3, mix: 'T' }
            ],
            'administracion': [
                { id: 0, name: 'Introducción a las Ciencias Económicas', correlatives: [], year: 1, mix: 'I' },
                { id: 1, name: 'Contabilidad Básica', correlatives: [0], year: 1, mix: 'A' },
                { id: 2, name: 'Matemática I', correlatives: [0], year: 1, mix: 'A' },
                { id: 3, name: 'Administración', correlatives: [0], year: 1, mix: 'A' },
                { id: 4, name: 'Introducción a la Economía', correlatives: [0], year: 1, mix: 'B' },
                { id: 5, name: 'Instituciones al Derecho Público', correlatives: [], year: 1, mix: 'B' },
                { id: 6, name: 'Estadística', correlatives: [0], year: 1, mix: 'B' },
                { id: 7, name: 'Historia Económica', correlatives: [], year: 1, mix: 'B' },
                { id: 8, name: 'Matemática II', correlatives: [2], year: 2, mix: 'A' },
                { id: 9, name: 'Sistema de Información Gerencial', correlatives: [1, 3], year: 2, mix: 'A' },
                { id: 10, name: 'Filosofía y Lógica', correlatives: [0], year: 2, mix: 'A' },
                { id: 11, name: 'Comportamiento Organizacional', correlatives: [3], year: 2, mix: 'A' },
                { id: 12, name: 'Análisis Microeconómico', correlatives: [4], year: 2, mix: 'B' },
                { id: 13, name: 'Derecho Empresario I', correlatives: [0], year: 2, mix: 'B' },
                { id: 14, name: 'Técnicas Cuantitativas', correlatives: [6], year: 2, mix: 'B' },
                { id: 15, name: 'Sistemas Administrativos', correlatives: [0], year: 2, mix: 'B' },
                { id: 16, name: 'Matemática Financiera', correlatives: [2, 6], year: 3, mix: 'A' },
                { id: 17, name: 'Administración Pública', correlatives: [1, 3, 5], year: 3, mix: 'A' },
                { id: 18, name: 'Análisis e Interpretación de Estados Contables', correlatives: [1, 9], year: 3, mix: 'A' },
                { id: 19, name: 'Recursos Humanos', correlatives: [11], year: 3, mix: 'A' },
                { id: 20, name: 'Análisis Macroeconómico', correlatives: [4], year: 3, mix: 'B' },
                { id: 21, name: 'Marketing', correlatives: [3, 6], year: 3, mix: 'B' },
                { id: 22, name: 'Derecho Empresario II', correlatives: [13], year: 3, mix: 'B' },
                { id: 23, name: 'Logística y Organización Productiva', correlatives: [3, 14], year: 3, mix: 'B' },
                { id: 24, name: 'Finanzas Corporativas', correlatives: [6, 16], year: 4, mix: 'A' },
                { id: 25, name: 'Innovación y Desarrollo Regional', correlatives: [12, 15, 18], year: 4, mix: 'A' },
                { id: 26, name: 'Derecho Empresario III', correlatives: [13], year: 4, mix: 'A' },
                { id: 27, name: 'Dirección Estratégica I', correlatives: [9, 11], year: 4, mix: 'A' },
                { id: 28, name: 'Gestión Comercial', correlatives: [21], year: 4, mix: 'B' },
                { id: 29, name: 'Emprendedorismo y Empresas Familiares', correlatives: [11], year: 4, mix: 'B' },
                { id: 30, name: 'Introducción a la Tributación', correlatives: [5, 18], year: 4, mix: 'B' },
                { id: 31, name: 'Costos para la Toma de Decisiones', correlatives: [18], year: 4, mix: 'B' },
                { id: 32, name: 'Dirección Estratégica II', correlatives: [27], year: 5, mix: 'A' },
                { id: 33, name: 'Metodología de la Investigación', correlatives: [10, 27], year: 5, mix: 'A' },
                { id: 34, name: 'Tecnología de Información', correlatives: [9, 15], year: 5, mix: 'A' },
                { id: 35, name: 'Práctica Profesional', correlatives: [27], year: 5, mix: 'A' },
                { id: 36, name: 'Taller de Desarrollo de Habilidades I', correlatives: [], year: 1, mix: 'T' },
                { id: 37, name: 'Taller de Desarrollo de Habilidades II', correlatives: [], year: 1, mix: 'T' },
                { id: 38, name: 'Taller de Manejo de Herramientas Informáticas', correlatives: [], year: 2, mix: 'T' },
                { id: 39, name: 'Taller de Idiomas I', correlatives: [], year: 2, mix: 'T' },
                { id: 40, name: 'Taller de Idioma II', correlatives: [39], year: 3, mix: 'T' },
                { id: 41, name: 'Taller de Práctica de Sistemas Contables', correlatives: [1], year: 3, mix: 'T' },
                { id: 42, name: 'Espacio de Práctica Profesional Supervisada', correlatives: [15, 18], year: 4, mix: 'P' }
            ]
        };

        let currentCareer = '';
let openCourses = [];

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
                <button class="status-button final-aprobado" onclick="changeStatus(${course.id}, 'final-aprobado')">Final Aprobado</button>
                <button class="status-button cursada-aprobada" onclick="changeStatus(${course.id}, 'cursada-aprobada')">Cursada Aprobada</button>
                <button class="status-button sin-cursada" onclick="changeStatus(${course.id}, 'sin-cursada')">Sin Cursada</button>
            `;

            if (course.id === 0) {
                statusButtons = `
                    <button class="status-button final-aprobado" onclick="changeStatus(${course.id}, 'ingreso-aprobado')">Ingreso Aprobado</button>
                    <button class="status-button sin-cursada" onclick="changeStatus(${course.id}, 'sin-ingreso')">Sin Ingreso</button>
                `;
            } else if (course.mix === 'T') {
                statusButtons = `
                    <button class="status-button final-aprobado" onclick="changeStatus(${course.id}, 'final-aprobado')">Final Aprobado</button>
                    <button class="status-button sin-cursada" onclick="changeStatus(${course.id}, 'sin-cursada')">Sin Cursada</button>
                `;
            }

            courseDiv.innerHTML = `
                <h2>${course.name}</h2>
                <div class="details">
                    <h3>Correlativas necesarias:</h3>
                    <ul class="correlatives">
                        ${course.correlatives.length ? course.correlatives.map(corrId => `<li>- ${careers[currentCareer].find(c => c.id === corrId).name}</li>`).join('') : '<li>Ninguna</li>'}
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

function allCorrelativesApproved(course) {
    return course.correlatives.every(corrId => {
        const corrDiv = document.getElementById(`course-${corrId}`);
        return corrDiv.classList.contains('final-aprobado') || corrDiv.classList.contains('ingreso-aprobado') || corrDiv.classList.contains('cursada-aprobada');
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

    careers[currentCareer].forEach(course => {
        const courseDiv = document.getElementById(`course-${course.id}`);
        const allCorrelativesApproved = course.correlatives.every(corrId => {
            const corrDiv = document.getElementById(`course-${corrId}`);
            return corrDiv.classList.contains('final-aprobado') || corrDiv.classList.contains('cursada-aprobada') || corrDiv.classList.contains('ingreso-aprobado');
        });

        const isThirdYearOrAbove = course.year >= 3;
        const isMateria = course.mix !== 'T' && course.mix !== 'I';

        if (!allCorrelativesApproved || (isThirdYearOrAbove && isMateria && !thirdYearAndAboveEnabled)) {
            courseDiv.classList.add('disabled');
        } else {
            courseDiv.classList.remove('disabled');
        }

        const statusButtons = courseDiv.querySelector('.status-buttons');
        if (!allCorrelativesApproved || (isThirdYearOrAbove && isMateria && !thirdYearAndAboveEnabled)) {
            statusButtons.style.display = 'none';
        } else {
            statusButtons.style.display = 'block';
        }
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year-sections').innerHTML = '<p>Seleccione una carrera para ver su plan de estudios.</p>';
    
    const lastCareer = localStorage.getItem('lastCareer');
    if (lastCareer) {
        loadCareer(lastCareer);
    }
});

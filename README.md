# Plan de estudios interactivo — FCE (UNICEN)

Página web para que los estudiantes de la Facultad de Ciencias Económicas sigan su
avance en la carrera: marcan el estado de cada materia y la página habilita
automáticamente las que pueden cursar según las correlatividades.

## Funciones

- 4 carreras: Gestión Tecnológica, Economía Empresarial, Contador Público y Administración.
- Estados por materia: sin cursar, cursada aprobada, final aprobado (talleres e ingreso: aprobado o no).
- Reglas de correlatividad, de 12 finales para cursar 3er año y de años completos para 5to.
- **Guardado automático** en el navegador.
- Las materias compartidas entre carreras (mismo código y nombre) se mantienen sincronizadas: aprobar, desmarcar o cambiar la nota se aplica en todas las carreras.
- Al desmarcar una materia se desmarcan en cadena las que la tienen como correlativa, en todas las carreras (con opción de deshacer).
- Si una materia deja de cumplir un requisito de año (12 finales, años completos), se marca con **Revisar**.
- Nota de cada final, taller e ingreso, con promedio general junto a "Descargar PDF"; el PDF incluye estado, notas, avance y promedio.
- Al pasar el mouse o tocar una materia se resaltan sus correlativas (azul) y las materias que habilita (verde).
- Exportar e importar el progreso (archivo `.json`) desde el ícono de ayuda, para pasarlo a otro dispositivo.
- Modo claro / oscuro (respeta la preferencia del sistema).
- Funciona sin conexión y se puede instalar en el celular (PWA).
- Accesible con teclado y lector de pantalla.

## Estructura

```
index.html              Página
css/styles.css          Estilos (claro y oscuro en un solo archivo, con variables)
careers.json            Datos de las carreras, materias, correlativas y reglas
js/config.js            Textos, logo y colores de la versión (ver "Otras versiones")
js/app.js               Interfaz
js/reglas.js            Lógica de correlatividades (sin DOM, testeada)
js/almacenamiento.js    Guardado, migración de la versión anterior, exportar/importar
js/pdf.js               Generación del PDF (carga jsPDF solo cuando se usa)
sw.js                   Service worker (modo sin conexión)
temas/                  Configuraciones alternativas (ej.: Franja Morada)
tests/                  Tests de reglas y de datos
LibreriasJS/            jsPDF + AutoTable
```

## Probar localmente

La página usa módulos de JavaScript y carga `careers.json`, así que **no funciona
abriendo `index.html` con doble clic**: hace falta un servidor local.

```bash
python3 -m http.server 8000
```

y abrir <http://localhost:8000>.

Tests (requieren Node 18 o superior, sin instalar dependencias):

```bash
npm test
```

## Editar materias o correlativas

Todo está en `careers.json`. Cada materia tiene esta forma:

```json
{"id": "L0009", "nombre": "Matemática II", "anio": 2, "cuatrimestre": 1, "tipo": "materia", "correlativas": ["L0002"]}
```

- `tipo`: `materia`, `taller`, `practica` o `ingreso`.
- `cuatrimestre`: `1`, `2` o `null`.
- `correlativas`: lista de ids, o `"todas"` (todas las demás materias de la carrera).
- **No cambiar los `id` de materias existentes**: el progreso guardado de los alumnos depende de ellos.
- Las reglas de 3er y 5to año están en `reglas`, al principio del archivo.

Después de editar, ejecutar `npm test`: verifica que no haya ids repetidos ni correlativas inexistentes.
Al publicar cambios en el código o los estilos, subir el número de versión (`?v=2.2.3`)
en `index.html`, en los `import` de `js/app.js` y `js/pdf.js`, y la `VERSION` de `sw.js`.
Así los navegadores no mezclan archivos viejos con nuevos. Si se agregan o quitan archivos,
actualizar también la lista de `sw.js`.

## Otras versiones (por ejemplo, Franja Morada)

El mismo código sirve para versiones con otra marca. Solo hay que reemplazar
`js/config.js` por la configuración deseada (ver `temas/franja-morada.js`) y
agregar las imágenes que use. Así un arreglo en el código se hace una sola vez.

## Privacidad

Los datos se guardan únicamente en el `localStorage` del navegador de cada alumno.
La página no envía datos a ningún servidor.

// Conexión con HTML
const form = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const studentNameInput = document.getElementById('studentNameInput');
const subjectInput = document.getElementById('subjectInput');
const salida = document.getElementById('output');
const addNoteManuallyButton = document.getElementById('addNoteManually');
const searchInput = document.getElementById('searchInput');
const clearSearchButton = document.getElementById('clearSearch');
const toggleThemeButton = document.getElementById('toggleTheme');
const messageContainer = document.getElementById('message');
const editForm = document.getElementById('editForm');
const editStudentInput = document.getElementById('editStudentInput');
const editSubjectInput = document.getElementById('editSubjectInput');
const editNoteInput = document.getElementById('editNoteInput');
const saveEditButton = document.getElementById('saveEdit');
const cancelEditButton = document.getElementById('cancelEdit');

// Lista para guardar las notas
let notas = [];
let notaEditando = null; // Índice de la nota que se está editando

// Mostrar mensajes con SweetAlert2
function mostrarMensaje(mensaje, tipo = "success") {
    Swal.fire({
        icon: tipo,
        text: mensaje,
        showConfirmButton: false,
        timer: 2000 // Cierra automáticamente después de 2 segundos
    });
}

// Cargar notas desde JSON local al iniciar
function cargarNotas() {
    fetch('notas.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo JSON');
            }
            return response.json();
        })
        .then(data => {
            notas = data;
            guardarNotas(); // Guardar en localStorage y sessionStorage
            mostrarNotas(); // Mostrar las notas en el DOM
        })
        .catch(error => {
            console.error('Error al cargar las notas:', error);
        });
}

// Guardar notas en localStorage y sessionStorage
function guardarNotas() {
    localStorage.setItem('notas', JSON.stringify(notas));
    sessionStorage.setItem('notas', JSON.stringify(notas));
}

// Mostrar las notas en la página
function mostrarNotas(filterText = "") {
    salida.innerHTML = ""; // Limpia la salida
    notas
        .filter(nota =>
            nota.texto.toLowerCase().includes(filterText.toLowerCase()) ||
            (nota.alumno && nota.alumno.toLowerCase().includes(filterText.toLowerCase())) ||
            (nota.asignatura && nota.asignatura.toLowerCase().includes(filterText.toLowerCase()))
        )
        .forEach((nota, index) => {
            salida.innerHTML += `
                <div class="note">
                    ${nota.alumno ? `<p><strong>Alumno:</strong> ${nota.alumno}</p>` : ''}
                    ${nota.asignatura ? `<p><strong>Asignatura:</strong> ${nota.asignatura}</p>` : ''}
                    <p><strong>Nota ${index + 1}:</strong> ${nota.texto}</p>
                    <p><em>Fecha:</em> ${nota.fecha}</p>
                    <button onclick="editarNota(${index})" class="edit-button">Editar</button>
                    <button onclick="eliminarNota(${index})">Eliminar</button>
                </div>`;
        });
}

// Eliminar una nota
function eliminarNota(index) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            notas.splice(index, 1); // Elimina la nota del array
            guardarNotas(); // Actualiza localStorage y sessionStorage
            mostrarNotas(); // Actualiza la vista
            mostrarMensaje("Nota eliminada correctamente.", "success");
        }
    });
}

// Mostrar formulario de edición
function mostrarFormularioEdicion(index) {
    notaEditando = index;
    const nota = notas[index];
    editStudentInput.value = nota.alumno || "";
    editSubjectInput.value = nota.asignatura || "";
    editNoteInput.value = nota.texto;
    editForm.style.display = "block";
}

// Guardar cambios al editar una nota
saveEditButton.addEventListener('click', () => {
    if (notaEditando !== null) {
        const nuevaNota = editNoteInput.value.trim();
        const nuevoAlumno = editStudentInput.value.trim();
        const nuevaAsignatura = editSubjectInput.value.trim();
        if (nuevaNota) {
            notas[notaEditando].texto = nuevaNota;
            notas[notaEditando].alumno = nuevoAlumno || null;
            notas[notaEditando].asignatura = nuevaAsignatura || null;
            notas[notaEditando].fecha = new Date().toLocaleString();
            guardarNotas();
            mostrarNotas();
            mostrarMensaje("Nota editada correctamente.", "success");
            editForm.style.display = "none";
        } else {
            mostrarMensaje("No puedes dejar la nota vacía.", "error");
        }
    }
});

// Cancelar edición
cancelEditButton.addEventListener('click', () => {
    editForm.style.display = "none";
    notaEditando = null;
});

// Editar una nota
function editarNota(index) {
    mostrarFormularioEdicion(index);
}

// Validar si una nota es duplicada
function esNotaDuplicada(texto, alumno, asignatura) {
    return notas.some(nota =>
        nota.texto === texto &&
        nota.alumno === (alumno || null) &&
        nota.asignatura === (asignatura || null)
    );
}

// Agregar una nueva nota desde el formulario
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que se recargue la página
    const texto = noteInput.value.trim();
    const alumno = studentNameInput.value.trim();
    const asignatura = subjectInput.value.trim();
    if (texto) {
        if (esNotaDuplicada(texto, alumno, asignatura)) {
            mostrarMensaje("Esta nota ya existe.", "error");
            return;
        }
        const nuevaNota = {
            texto: texto,
            alumno: alumno || null,
            asignatura: asignatura || null,
            fecha: new Date().toLocaleString(),
        };
        notas.push(nuevaNota); // Guardar la nota en el array
        guardarNotas();
        mostrarNotas();
        noteInput.value = ""; // Limpiar el campo de texto
        studentNameInput.value = ""; // Limpiar el campo del alumno
        subjectInput.value = ""; // Limpiar el campo de la asignatura
        mostrarMensaje("Nota agregada correctamente.", "success");
    } else {
        mostrarMensaje("No puedes agregar una nota vacía.", "error");
    }
});

// Agregar notas manualmente
addNoteManuallyButton.addEventListener('click', () => {
    const notaManual = prompt("Escribe tu nota manualmente:");
    if (notaManual && notaManual.trim()) {
        const nuevaNota = {
            texto: notaManual.trim(),
            alumno: null,
            asignatura: null,
            fecha: new Date().toLocaleString(),
        };
        notas.push(nuevaNota); // Guardar la nota en el array
        guardarNotas(); // Actualiza localStorage y sessionStorage
        mostrarNotas(); // Mostrar las notas actualizadas
        mostrarMensaje("Nota agregada manualmente.", "success");
    } else {
        mostrarMensaje("No puedes agregar una nota vacía.", "error");
    }
});

// Función debounce para mejorar el rendimiento de la búsqueda
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Buscar notas con debounce
searchInput.addEventListener('input', debounce(() => {
    mostrarNotas(searchInput.value);
}, 300));

// Limpiar búsqueda
clearSearchButton.addEventListener('click', () => {
    searchInput.value = "";
    mostrarNotas();
});

// Cambiar entre tema claro y oscuro
toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        toggleThemeButton.textContent = "Tema Claro";
    } else {
        toggleThemeButton.textContent = "Tema Oscuro";
    }
});

// Cargar notas al iniciar la página
window.onload = cargarNotas;
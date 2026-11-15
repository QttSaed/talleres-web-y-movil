// =====================================================
// Configuración del formulario y uso del evento "submit"
// =====================================================
document.getElementById("formulario").addEventListener("submit", function (event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const edad = Number(document.getElementById("edad").value);
  const carrera = document.getElementById("carrera").value;

  // Validación: edad mayor que 0
  if (edad <= 0 || isNaN(edad)) {
    document.getElementById("resultado-formulario").textContent =
      "Error: La edad debe ser un número mayor que 0.";
    return;
  }

  document.getElementById("resultado-formulario").textContent =
    "Nombre: " + nombre +
    " | Correo: " + email +
    " | Edad: " + edad +
    " | Carrera: " + carrera;
});

// =====================================================
// 2. Utilizar LocalStorage para almacenar información
// =====================================================
function guardarLocal() {
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nombre || !email) {
    document.getElementById("resultado-local").textContent =
      "Por favor completa el nombre y el correo antes de guardar.";
    return;
  }

  localStorage.setItem("nombreUsuario", nombre);
  localStorage.setItem("emailUsuario", email);

  document.getElementById("resultado-local").textContent =
    "Datos guardados correctamente en LocalStorage.";
}

function leerLocal() {
  const nombre = localStorage.getItem("nombreUsuario");
  const email = localStorage.getItem("emailUsuario");

  if (!nombre && !email) {
    document.getElementById("resultado-local").textContent =
      "No hay ningún dato guardado en LocalStorage.";
  } else {
    document.getElementById("resultado-local").textContent =
      "Nombre: " + (nombre || "No guardado") + " | Email: " + (email || "No guardado");
  }
}

function borrarLocal() {
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("emailUsuario");
  document.getElementById("resultado-local").textContent =
    "Datos eliminados de LocalStorage.";
}

// =====================================================
// 3. Utilizar sessionStorage para almacenar información
// =====================================================
function guardarSesion() {
  const carrera = document.getElementById("carrera").value;
  sessionStorage.setItem("carreraSeleccionada", carrera);
  document.getElementById("resultado-sesion").textContent =
    "Carrera guardada en la sesión: " + carrera;
}

function leerSesion() {
  const carrera = sessionStorage.getItem("carreraSeleccionada");

  if (carrera === null) {
    document.getElementById("resultado-sesion").textContent =
      "No hay ninguna carrera guardada en la sesión actual.";
  } else {
    document.getElementById("resultado-sesion").textContent =
      "Carrera guardada: " + carrera;
  }
}

function borrarSesion() {
  sessionStorage.removeItem("carreraSeleccionada");
  document.getElementById("resultado-sesion").textContent =
    "Carrera eliminada de la sesión.";
}

// =====================================================
// 4. Formulario + JSON
// =====================================================
function guardarFormulario() {
  const edadValor = Number(document.getElementById("edad").value);

  const datos = {
    nombre: document.getElementById("nombre").value.trim(),
    email: document.getElementById("email").value.trim(),
    edad: !isNaN(edadValor) && edadValor > 0 ? edadValor : document.getElementById("edad").value,
    carrera: document.getElementById("carrera").value
  };

  localStorage.setItem("datosFormulario", JSON.stringify(datos));
  document.getElementById("resultado-guardado").textContent =
    "Formulario completo guardado como objeto JSON en LocalStorage.";
}

function recuperarFormulario() {
  const datosGuardados = localStorage.getItem("datosFormulario");

  if (datosGuardados === null) {
    document.getElementById("resultado-guardado").textContent =
      "No existen datos guardados previamente.";
    return;
  }

  const datos = JSON.parse(datosGuardados);

  document.getElementById("nombre").value = datos.nombre || "";
  document.getElementById("email").value = datos.email || "";
  document.getElementById("edad").value = datos.edad || "";
  document.getElementById("carrera").value = datos.carrera || "ici";

  document.getElementById("resultado-guardado").textContent =
    "Datos recuperados con éxito y cargados en el formulario.";
}

function limpiarFormularioGuardado() {
  localStorage.removeItem("datosFormulario");
  document.getElementById("resultado-guardado").textContent =
    "Datos del formulario guardado eliminados.";
}

// =====================================================
// 5. Desafío: Agenda de Contactos con LocalStorage
// =====================================================
function obtenerContactos() {
  const guardados = localStorage.getItem("agendaContactos");
  return guardados ? JSON.parse(guardados) : [];
}

function guardarContactos(contactos) {
  localStorage.setItem("agendaContactos", JSON.stringify(contactos));
}

function agregarContacto(e) {
  if (e) e.preventDefault();

  const nombreContacto = document.getElementById("contacto-nombre").value.trim();
  const emailContacto = document.getElementById("contacto-email").value.trim();

  if (!nombreContacto || !emailContacto) {
    alert("Debes ingresar nombre y correo para el contacto.");
    return;
  }

  const contactos = obtenerContactos();
  contactos.push({ nombre: nombreContacto, email: emailContacto });
  guardarContactos(contactos);

  document.getElementById("contacto-nombre").value = "";
  document.getElementById("contacto-email").value = "";

  renderizarContactos();
}

function eliminarContacto(indice) {
  const contactos = obtenerContactos();
  contactos.splice(indice, 1);
  guardarContactos(contactos);
  renderizarContactos();
}

function renderizarContactos() {
  const lista = document.getElementById("lista-contactos");
  if (!lista) return;

  const contactos = obtenerContactos();
  lista.innerHTML = "";

  if (contactos.length === 0) {
    lista.innerHTML = "<li>No hay contactos registrados aún.</li>";
    return;
  }

  contactos.forEach((contacto, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${contacto.nombre}</strong> (${contacto.email})</span>
      <button class="btn-peligro" style="padding: 4px 8px; font-size: 0.8rem;" onclick="eliminarContacto(${idx})">Eliminar</button>`;
    lista.appendChild(li);
  });
}

// Renderizar contactos al cargar la página
document.addEventListener("DOMContentLoaded", renderizarContactos);

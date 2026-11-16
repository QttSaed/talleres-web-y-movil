// Taller 3: JavaScript + APIs
// Consumo de la API JSONPlaceholder mediante Fetch

const btnCargar = document.getElementById("btn-cargar");
const estadoMensaje = document.getElementById("estado");
const contenedorPosts = document.getElementById("lista-posts");

const URL_API = "https://jsonplaceholder.typicode.com/posts";

async function obtenerPublicaciones() {
  estadoMensaje.textContent = "Cargando publicaciones...";
  contenedorPosts.innerHTML = "";

  try {
    const respuesta = await fetch(URL_API);

    if (!respuesta.ok) {
      throw new Error(`Error en la consulta: ${respuesta.status}`);
    }

    const publicaciones = await respuesta.json();

    renderizarPublicaciones(publicaciones);
    estadoMensaje.textContent = "Publicaciones cargadas correctamente.";
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    estadoMensaje.textContent = "Ocurrió un error al cargar los datos.";
  }
}

function renderizarPublicaciones(lista) {
  contenedorPosts.innerHTML = "";

  lista.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("post");

    const encabezado = document.createElement("h3");
    encabezado.textContent = item.title;

    const descripcion = document.createElement("p");
    descripcion.textContent = item.body;

    tarjeta.appendChild(encabezado);
    tarjeta.appendChild(descripcion);

    contenedorPosts.appendChild(tarjeta);
  });
}

if (btnCargar) {
  btnCargar.addEventListener("click", obtenerPublicaciones);
}

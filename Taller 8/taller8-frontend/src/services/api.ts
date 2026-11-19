// Taller 8: CRUD completo
// Funciones de comunicación con la API de publicaciones

export interface Publicacion {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface DatosPublicacion {
  userId: number;
  title: string;
  body: string;
}

export const API_URL = "http://localhost:3000";

const procesarRespuesta = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }
  const texto = await response.text();
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    datos = null;
  }
  if (!response.ok) {
    throw new Error(datos?.error ?? `El servidor respondió con el código ${response.status}`);
  }
  return datos;
};

// 7: GET /api/posts (con filtro opcional de userId)
export const obtenerPublicaciones = async (userId?: number): Promise<Publicacion[]> => {
  const url = userId ? `${API_URL}/api/posts?userId=${userId}` : `${API_URL}/api/posts`;
  const response = await fetch(url);
  return procesarRespuesta(response);
};

// POST /api/posts
export const crearPublicacion = async (datos: DatosPublicacion): Promise<Publicacion> => {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  return procesarRespuesta(response);
};

// 8: PUT /api/posts/:id
export const actualizarPublicacion = async (id: number, datos: DatosPublicacion): Promise<Publicacion> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  return procesarRespuesta(response);
};

// 9: DELETE /api/posts/:id
export const eliminarPublicacion = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "DELETE"
  });
  await procesarRespuesta(response);
};

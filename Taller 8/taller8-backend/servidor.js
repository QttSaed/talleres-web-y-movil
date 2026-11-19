// Taller 8: CRUD completo + middlewares + express.Router

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const postsRouter = require("./routes/posts");

const app = express();

// 3: Registrar morgan para registrar peticiones en consola
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Hola desde mi primer servidor con Express!");
});

app.get("/saludo/:nombre", (req, res) => {
  res.send(`¡Hola, ${req.params.nombre}!`);
});

// 6: Montar el router de publicaciones en "/api/posts"
app.use("/api/posts", postsRouter);

// 4: Middleware con nombre para rutas no encontradas
const endpointDesconocido = (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
};

app.use(endpointDesconocido);

// 5: Middleware manejador de errores centralizado (4 parámetros)
const manejadorErrores = (error, req, res, next) => {
  console.error(error.message);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }

  res.status(500).json({ error: "Error interno del servidor" });
};

app.use(manejadorErrores);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Rutas de los usuarios. Se montan en servidor.js en "/api/usuarios".

const express = require("express");
// 3: Importar bcryptjs.
const bcrypt = require("bcryptjs");
const usuarios = require("../datos/usuarios");
// 5: Importar el middleware verificarToken.
const verificarToken = require("../middleware/auth");

const router = express.Router();

// 3: Crear la ruta POST "/" que registre un nuevo usuario.
router.post("/", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Debes enviar username y password" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  const yaExiste = usuarios.some((u) => u.username === username);
  if (yaExiste) {
    return res.status(409).json({ error: "El nombre de usuario ya existe" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const nuevoUsuario = {
    id: usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
    username,
    passwordHash
  };

  usuarios.push(nuevoUsuario);
  res.status(201).json({ id: nuevoUsuario.id, username: nuevoUsuario.username });
});

// 5: Crear la ruta protegida GET "/yo" que responda con los datos del usuario del token.
router.get("/yo", verificarToken, (req, res) => {
  const usuario = usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json({ id: usuario.id, username: usuario.username });
});

// Desafío 2: Ruta protegida para actualizar la contraseña del usuario autenticado.
router.put("/yo/password", verificarToken, async (req, res) => {
  const { passwordActual, passwordNueva } = req.body || {};

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: "Debes enviar passwordActual y passwordNueva" });
  }

  if (passwordNueva.length < 8) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
  }

  const usuario = usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const claveCorrecta = await bcrypt.compare(passwordActual, usuario.passwordHash);
  if (!claveCorrecta) {
    return res.status(401).json({ error: "Contraseña actual incorrecta" });
  }

  usuario.passwordHash = await bcrypt.hash(passwordNueva, 10);
  res.json({ mensaje: "Contraseña actualizada exitosamente" });
});

module.exports = router;

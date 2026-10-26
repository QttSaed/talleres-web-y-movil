// Ruta de inicio de sesión. Se monta en servidor.js en "/api/login".

const express = require("express");
// 4: Importar bcryptjs y jsonwebtoken.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarios = require("../datos/usuarios");

const router = express.Router();

// 4: Crear la ruta POST "/" que verifique las credenciales y responda con un token.
router.post("/", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Debes enviar username y password" });
  }

  const cuenta = usuarios.find((u) => u.username === username);
  const passwordValida = cuenta && cuenta.passwordHash
    ? await bcrypt.compare(password, cuenta.passwordHash)
    : false;

  if (!passwordValida) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = jwt.sign(
    { id: cuenta.id, username: cuenta.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRA || "1h" }
  );

  res.json({ token, id: cuenta.id, username: cuenta.username });
});

module.exports = router;

// Middleware de autenticación.

// 5: Importar jsonwebtoken.
const jwt = require("jsonwebtoken");

// 5: Crear el middleware verificarToken.
const verificarToken = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  next();
};

// 5: Exportar el middleware.
module.exports = verificarToken;

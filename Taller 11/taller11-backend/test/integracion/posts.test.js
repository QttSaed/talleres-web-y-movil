// Pruebas de integración de las rutas /api/posts

const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../../app");

// Inicia sesión y devuelve el token (igual que la petición «Login» de Postman).
const iniciarSesion = async (username, password) => {
  const respuesta = await request(app).post("/api/login").send({ username, password });
  assert.equal(respuesta.status, 200);
  return respuesta.body.token;
};

describe("GET /api/posts", () => {
  test("responde 200 con las 5 publicaciones iniciales", async () => {
    const respuesta = await request(app).get("/api/posts");
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.length, 5);
  });

  test("filtra por usuario con ?userId=2", async () => {
    const respuesta = await request(app).get("/api/posts?userId=2");
    assert.equal(respuesta.status, 200);
    assert.deepEqual(respuesta.body.map((p) => p.id), [3, 4]);
    assert.ok(respuesta.body.every((p) => p.userId === 2));
  });

  test("responde 404 si la publicación no existe", async () => {
    await request(app).get("/api/posts/9999").expect(404);
  });
});

describe("POST /api/posts", () => {
  test("responde 401 sin token", async () => {
    await request(app).post("/api/posts").send({ title: "Título de prueba", body: "Contenido" }).expect(401);
  });

  test("crea la publicación con el autor del token, no del body", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const entrada = { title: "Publicación creada en prueba", body: "Contenido de prueba" };
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...entrada, userId: 99 })
      .expect(201);

    assert.equal(respuesta.body.title, entrada.title);
    assert.equal(respuesta.body.body, entrada.body);
    assert.equal(respuesta.body.userId, 1);
    assert.ok(Number.isInteger(respuesta.body.id));
  });

  test("responde 400 si falta el title", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "Sin título" })
      .expect(400, { error: "Debes enviar title y body" });
  });

  test("responde 400 si el JSON está mal escrito", async () => {
    await request(app)
      .post("/api/posts")
      .set("Content-Type", "application/json")
      .send('{ "title": "Invalido", }')
      .expect(400, { error: "El cuerpo de la petición no es un JSON válido" });
  });
});

describe("PUT y DELETE /api/posts/:id", () => {
  test("responde 403 si ana edita una publicación de carla", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    await request(app)
      .put("/api/posts/5")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Intento de edición no permitida", body: "Texto nuevo" })
      .expect(403);
  });

  test("el autor puede eliminar su propia publicación", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const creada = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Publicación para borrar", body: "Se eliminará enseguida" })
      .expect(201);

    const ruta = `/api/posts/${creada.body.id}`;
    await request(app).delete(ruta).set("Authorization", `Bearer ${token}`).expect(204);
    await request(app).get(ruta).expect(404);
  });
});

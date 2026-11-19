// Pruebas de integración del inicio de sesión (contraseña y GitHub)

const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const request = require("supertest");
const app = require("../../app");

describe("POST /api/login", () => {
  test("responde 200 con un token si las credenciales son correctas", async () => {
    const respuesta = await request(app).post("/api/login").send({ username: "ana", password: "ana-12345" });
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.username, "ana");
    assert.ok(respuesta.body.token);
  });

  test("responde 401 si la contraseña es incorrecta", async () => {
    await request(app)
      .post("/api/login")
      .send({ username: "ana", password: "clave-invalida" })
      .expect(401, { error: "Usuario o contraseña incorrectos" });
  });
});

describe("GET /api/usuarios/yo", () => {
  test("responde 401 sin token", async () => {
    await request(app).get("/api/usuarios/yo").expect(401);
  });

  test("responde 401 con un token alterado", async () => {
    const inicio = await request(app)
      .post("/api/login")
      .send({ username: "ana", password: "ana-12345" })
      .expect(200);

    const [header, payload, signature] = inicio.body.token.split(".");
    const signatureModificada = (signature[0] === "A" ? "B" : "A") + signature.slice(1);
    await request(app)
      .get("/api/usuarios/yo")
      .set("Authorization", `Bearer ${header}.${payload}.${signatureModificada}`)
      .expect(401, { error: "Token inválido" });
  });
});

describe("Inicio de sesión con GitHub", () => {
  test("la URL de autorización incluye client_id, state y PKCE", async () => {
    const respuesta = await request(app).get("/api/auth/github/url").expect(200);
    const parsed = new URL(respuesta.body.url);
    assert.equal(parsed.origin, "https://github.com");
    assert.equal(parsed.pathname, "/login/oauth/authorize");
    assert.equal(parsed.searchParams.get("client_id"), process.env.GITHUB_CLIENT_ID);
    assert.equal(parsed.searchParams.get("redirect_uri"), process.env.GITHUB_REDIRECT_URI);
    assert.match(parsed.searchParams.get("state"), /^[0-9a-f]{32}$/);
    assert.match(parsed.searchParams.get("code_challenge"), /^[A-Za-z0-9_-]{43}$/);
    assert.equal(parsed.searchParams.get("code_challenge_method"), "S256");
  });

  test("responde 400 si el state no fue generado por el servidor", async () => {
    const respuesta = await request(app)
      .post("/api/auth/github")
      .send({ code: "codigo-ejemplo", state: "estado-falso-no-registrado" })
      .expect(400);
    assert.match(respuesta.body.error, /state no es válido/);
  });

  // Desafío 2: Probar el intercambio con GitHub sin GitHub
  test("intercambia un código válido con GitHub simulado y emite una sesión", async (t) => {
    const authUrl = await request(app).get("/api/auth/github/url").expect(200);
    const params = new URL(authUrl.body.url).searchParams;

    const mockFetch = t.mock.method(globalThis, "fetch", async (url) => {
      if (url === "https://github.com/login/oauth/access_token") {
        return Response.json({ access_token: "gh-token-mock-1234" });
      }
      assert.equal(url, "https://api.github.com/user");
      return Response.json({ id: 583231, login: "ana" });
    });

    const resultado = await request(app)
      .post("/api/auth/github")
      .send({ code: "codigo-github-valido", state: params.get("state") })
      .expect(200);

    assert.equal(resultado.body.username, "ana-github");
    assert.ok(Number.isInteger(resultado.body.id));
    assert.ok(resultado.body.token);
    assert.equal(mockFetch.mock.callCount(), 2);

    const [, paramsIntercambio] = mockFetch.mock.calls[0].arguments;
    assert.equal(paramsIntercambio.method, "POST");
    assert.equal(paramsIntercambio.body.get("code"), "codigo-github-valido");

    const challengeCalculado = createHash("sha256")
      .update(paramsIntercambio.body.get("code_verifier"))
      .digest("base64url");
    assert.equal(challengeCalculado, params.get("code_challenge"));

    const [, paramsPerfil] = mockFetch.mock.calls[1].arguments;
    assert.equal(paramsPerfil.headers.Authorization, "Bearer gh-token-mock-1234");

    await request(app)
      .get("/api/usuarios/yo")
      .set("Authorization", `Bearer ${resultado.body.token}`)
      .expect(200, { id: resultado.body.id, username: "ana-github" });
  });
});

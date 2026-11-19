// Pruebas unitarias de src/services/api.ts
// fetch se reemplaza por una función simulada (vi.fn), así no se necesita el servidor.

import { afterEach, describe, expect, test, vi } from "vitest";
import { ErrorApi, crearPublicacion, eliminarPublicacion, encabezadosConToken, obtenerPublicaciones } from "./api";
import { guardarSesion } from "./sesion";

// Crea una respuesta HTTP con un cuerpo JSON, como la que enviaría nuestro servidor.
const respuestaJson = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("encabezadosConToken", () => {
  test("no agrega Authorization si no hay sesión", () => {
    expect(encabezadosConToken()).toEqual({});
  });

  test("agrega Authorization con el token de la sesión", () => {
    guardarSesion({ token: "token-auth-test", id: 1, username: "ana" });
    expect(encabezadosConToken()).toEqual({ Authorization: "Bearer token-auth-test" });
  });
});

describe("obtenerPublicaciones", () => {
  test("agrega ?userId= a la URL al filtrar por usuario", async () => {
    const fetchSimulado = vi.fn().mockResolvedValue(respuestaJson(200, []));
    vi.stubGlobal("fetch", fetchSimulado);

    await expect(obtenerPublicaciones(2)).resolves.toEqual([]);
    expect(fetchSimulado).toHaveBeenCalledWith("http://localhost:3000/api/posts?userId=2");
  });
});

describe("crearPublicacion", () => {
  test("envía un POST con el token de la sesión", async () => {
    guardarSesion({ token: "token-auth-test", id: 1, username: "ana" });
    const nueva = { title: "Nuevo título", body: "Texto de la publicación" };
    const resultado = { ...nueva, id: 8, userId: 1 };
    const fetchSimulado = vi.fn().mockResolvedValue(respuestaJson(201, resultado));
    vi.stubGlobal("fetch", fetchSimulado);

    await expect(crearPublicacion(nueva)).resolves.toEqual(resultado);
    expect(fetchSimulado).toHaveBeenCalledWith("http://localhost:3000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer token-auth-test" },
      body: JSON.stringify(nueva)
    });
  });

  test("lanza un ErrorApi con el mensaje del servidor si responde 400", async () => {
    const errorMsg = "Debes enviar title y body";
    const fetchSimulado = vi.fn().mockResolvedValue(respuestaJson(400, { error: errorMsg }));
    vi.stubGlobal("fetch", fetchSimulado);

    const promesa = crearPublicacion({ title: "", body: "" });
    await expect(promesa).rejects.toBeInstanceOf(ErrorApi);
    await expect(promesa).rejects.toMatchObject({ status: 400, message: errorMsg });
  });
});

describe("eliminarPublicacion", () => {
  test("acepta una respuesta 204 sin contenido", async () => {
    const fetchSimulado = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchSimulado);

    await expect(eliminarPublicacion(8)).resolves.toBeUndefined();
    expect(fetchSimulado).toHaveBeenCalledWith("http://localhost:3000/api/posts/8", {
      method: "DELETE",
      headers: {}
    });
  });
});

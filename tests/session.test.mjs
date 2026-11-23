import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { createServer } from "vite";

let server, auth, saved;

before(async () => {
  server = await createServer({
    configFile: false,
    appType: "custom",
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  });
  auth = await server.ssrLoadModule("/src/services/authService.ts");
});
after(() => server?.close());

beforeEach((t) => {
  saved = new Map();
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: (key) => saved.delete(key),
    },
  });
  t.after(() => {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  });
});

function storeSession(exp) {
  const token = `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
  saved.set("token", token);
  saved.set("user", JSON.stringify({ id: 4, name: "Ana", role: "TEACHER" }));
  return token;
}

test("an expired session is cleared before contacting the server", async (t) => {
  storeSession(Math.floor(Date.now() / 1000) - 1);
  const fetch = t.mock.method(globalThis, "fetch");
  assert.equal(auth.isAuthenticated(), false);
  assert.equal(saved.size, 0);
  assert.equal(await auth.validateToken(), false);
  assert.equal(fetch.mock.callCount(), 0);
});

test("session restoration accepts the API's empty success response", async (t) => {
  const token = storeSession(Math.floor(Date.now() / 1000) + 3600);
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.ok(url.endsWith("/auth/validate"));
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    return new Response(null, { status: 200 });
  });
  assert.equal(await auth.validateToken(), true);
  assert.equal(auth.getCurrentUser().id, 4);
});

test("the legacy invalid-login response is surfaced without storing credentials", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(
      {
        status: 401,
        code: "AUTH_INVALID_CREDENTIALS",
        message: "E-mail ou senha inválidos",
      },
      { status: 200 },
    ),
  );
  await assert.rejects(
    auth.login({ email: "a@example.test", password: "incorrect" }),
    {
      code: "AUTH_INVALID_CREDENTIALS",
      status: 401,
    },
  );
  assert.equal(saved.size, 0);
});

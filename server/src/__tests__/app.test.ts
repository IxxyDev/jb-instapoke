import { buildApp } from "../app.js";
import type { FastifyInstance } from "fastify";

let apps: FastifyInstance[] = [];

afterEach(async () => {
  await Promise.all(apps.map((app) => app.close()));
  apps = [];
});

describe("buildApp", () => {
  it("should start and stop cleanly", async () => {
    const app = await createApp();

    await app.listen({ port: 0 });

    const address = app.server.address();
    expect(address).not.toBeNull();
  });

  it("should fail with clear error on port conflict", async () => {
    const app1 = await createApp();
    const app2 = await createApp();

    await app1.listen({ port: 0 });
    const address = app1.server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    await expect(app2.listen({ port })).rejects.toThrow();
  });

  it("GET /api/health should return ok", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("should enable CORS", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/health",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "GET",
      },
    });

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });
});

async function createApp() {
  const app = await buildApp();
  apps.push(app);
  return app;
}

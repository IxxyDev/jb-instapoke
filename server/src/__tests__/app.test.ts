import type { Pokemon } from "@instapoke/shared";
import type { FastifyInstance } from "fastify";
import { PokemonStore } from "../store/pokemon-store.js";
import { buildApp } from "../app.js";

function makePokemon(overrides: Partial<Pokemon> & { id: number }): Pokemon {
  return {
    name: `pokemon-${overrides.id}`,
    displayName: `Pokemon ${overrides.id}`,
    spriteUrl: `https://example.com/${overrides.id}.png`,
    types: ["normal"],
    abilities: [],
    generation: 1,
    genus: "",
    description: "",
    stats: {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    },
    color: "white",
    height: 0,
    weight: 0,
    ...overrides,
  };
}

const testData: Pokemon[] = [
  makePokemon({ id: 1, name: "bulbasaur", types: ["grass", "poison"] }),
  makePokemon({ id: 4, name: "charmander", types: ["fire"] }),
  makePokemon({ id: 7, name: "squirtle", types: ["water"] }),
];

function createStore() {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  const store = new PokemonStore(testData);
  vi.restoreAllMocks();
  return store;
}

let apps: FastifyInstance[] = [];

afterEach(async () => {
  await Promise.all(apps.map((app) => app.close()));
  apps = [];
});

async function createApp() {
  const app = await buildApp({ store: createStore(), logger: false });
  apps.push(app);
  return app;
}

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

    expect(response.statusCode).toEqual(200);
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

    expect(response.headers["access-control-allow-origin"]).toEqual(
      "http://localhost:5173",
    );
  });
});

describe("API routes", () => {
  it("GET /api/feed should return paginated pokemon", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/feed",
    });

    expect(response.statusCode).toEqual(200);
    const body = response.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.total).toEqual(3);
  });

  it("GET /api/feed should support filtering by tag", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/feed?tags=fire",
    });

    const body = response.json();
    expect(body.data.length).toEqual(1);
    expect(body.data[0].name).toEqual("charmander");
  });

  it("GET /api/feed should support search query", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/feed?q=squir",
    });

    const body = response.json();
    expect(body.data.length).toEqual(1);
    expect(body.data[0].name).toEqual("squirtle");
  });

  it("GET /api/tags should return types and generations", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/tags",
    });

    expect(response.statusCode).toEqual(200);
    const body = response.json();
    expect(body.types).toBeInstanceOf(Array);
    expect(body.generations).toBeInstanceOf(Array);
  });

  it("GET /api/pokemon/:id should return pokemon", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/pokemon/1",
    });

    expect(response.statusCode).toEqual(200);
    expect(response.json().name).toEqual("bulbasaur");
  });

  it("GET /api/pokemon/:id should 404 for non-existent", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/pokemon/999",
    });

    expect(response.statusCode).toEqual(404);
    expect(response.json()).toEqual({ error: "Pokemon not found" });
  });
});

describe("validation", () => {
  it("GET /api/feed?limit=abc should return 400", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/feed?limit=abc",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.json().error).toEqual("limit must be an integer");
  });

  it("GET /api/feed?limit=1.5 should return 400", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/feed?limit=1.5",
    });

    expect(response.statusCode).toEqual(400);
  });

  it("GET /api/feed?generation=abc should return 400", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/feed?generation=abc",
    });

    expect(response.statusCode).toEqual(400);
  });

  it("GET /api/pokemon/abc should return 400", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/pokemon/abc",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.json().error).toEqual("id must be a positive integer");
  });

  it("GET /api/pokemon/-1 should return 400", async () => {
    const app = await createApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/pokemon/-1",
    });

    expect(response.statusCode).toEqual(400);
  });
});

export interface paths {
  "/api/feed": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          /** @description Search query (max 100 chars) */
          q?: string;
          /** @description Comma-separated type names (or repeated query params) */
          tags?: string | string[];
          /** @description Comma-separated generation numbers (or repeated query params) */
          generation?: string | string[];
          /** @description Page size (1-50) */
          limit?: string;
          cursor?: string;
          direction?: "forward" | "backward";
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["def-1"];
          };
        };
        /** @description Default Response */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["def-3"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/tags": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["def-2"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/pokemon/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description Pokemon ID (positive integer) */
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["def-3"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** Pokemon */
    "def-0": {
      id: number;
      name: string;
      displayName: string;
      spriteUrl: string;
      types: string[];
      abilities: string[];
      generation: number;
      genus: string;
      description: string;
      stats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
      };
      color: string;
      height: number;
      weight: number;
    };
    /** PaginatedResponse */
    "def-1": {
      data: {
        id: number;
        name: string;
        displayName: string;
        spriteUrl: string;
        types: string[];
        abilities: string[];
        generation: number;
        genus: string;
        description: string;
        stats: {
          hp: number;
          attack: number;
          defense: number;
          specialAttack: number;
          specialDefense: number;
          speed: number;
        };
        color: string;
        height: number;
        weight: number;
      }[];
      pagination: {
        nextCursor: string | null;
        previousCursor: string | null;
        hasMore: boolean;
        hasPrevious: boolean;
        total: number;
      };
    };
    /** TagsResponse */
    "def-2": {
      types: {
        name: string;
        count: number;
        label?: string;
      }[];
      generations: {
        name: string;
        count: number;
        label?: string;
      }[];
    };
    /** ErrorResponse */
    "def-3": {
      error: string;
    };
    /** FeedQuery */
    "def-4": {
      /** @description Search query (max 100 chars) */
      q?: string;
      /** @description Comma-separated type names (or repeated query params) */
      tags?: string | string[];
      /** @description Comma-separated generation numbers (or repeated query params) */
      generation?: string | string[];
      /** @description Page size (1-50) */
      limit?: string;
      cursor?: string;
      /** @enum {string} */
      direction?: "forward" | "backward";
    };
    /** PokemonId */
    "def-5": {
      /** @description Pokemon ID (positive integer) */
      id: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;

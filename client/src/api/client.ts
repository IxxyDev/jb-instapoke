import type {
  FeedQuery,
  PaginatedResponse,
  Pokemon,
  TagsResponse,
} from "@instapoke/shared";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  path: string,
  params?: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, { signal });
  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // response body is not JSON, keep generic message
    }
    throw new ApiError(res.status, message);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError(res.status, "Invalid JSON response from server");
  }
}

export function fetchFeed(
  query: FeedQuery,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Pokemon>> {
  const params: Record<string, string> = {};
  if (query.cursor) params["cursor"] = query.cursor;
  if (query.direction) params["direction"] = query.direction;
  if (query.limit) params["limit"] = String(query.limit);
  if (query.tags?.length) params["tags"] = query.tags.join(",");
  if (query.generation?.length)
    params["generation"] = query.generation.join(",");
  if (query.q) params["q"] = query.q;

  return fetchApi<PaginatedResponse<Pokemon>>("/api/feed", params, signal);
}

export function fetchTags(signal?: AbortSignal): Promise<TagsResponse> {
  return fetchApi<TagsResponse>("/api/tags", undefined, signal);
}

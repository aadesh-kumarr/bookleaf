type JsonRequestInit = Omit<RequestInit, "body"> & {
  json?: unknown;
};

type ApiErrorPayload = {
  error?: { message?: string };
};

class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/** Sends browser JSON requests and converts non-success responses into typed errors. */
export async function requestJson<T>(
  input: RequestInfo | URL,
  { json, headers: initialHeaders, ...init }: JsonRequestInit = {},
): Promise<T> {
  const headers = new Headers(initialHeaders);
  if (json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  const body = (await response.json().catch(() => null)) as
    | (ApiErrorPayload & T)
    | null;

  if (!response.ok) {
    throw new ApiClientError(
      body?.error?.message ?? "The request could not be completed.",
      response.status,
    );
  }

  return body as T;
}

/** Extracts a safe user-facing message from API client failures. */
export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

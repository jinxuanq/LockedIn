interface ApiPayload<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ClientApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json()) as ApiPayload<T>;
  if (!response.ok || !payload.data) {
    throw new ClientApiError(
      payload.error?.message || "Something went wrong.",
      response.status,
      payload.error?.code || "REQUEST_ERROR",
      payload.error?.details,
    );
  }
  return payload.data;
}

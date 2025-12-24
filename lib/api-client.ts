const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function fetchFromBackend(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${BACKEND_API_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";
  let parsedBody: any = rawText || null;
  if (rawText && contentType.includes("application/json")) {
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      parsedBody = rawText;
    }
  }

  if (!response.ok) {
    const errorData = parsedBody ?? {};
    if (process.env.NODE_ENV === "development") {
      console.error(`Backend Error: ${response.status}`, errorData);
    }
    const message =
      typeof errorData === "string"
        ? errorData
        : errorData.message || `API Error: ${response.status}`;
    const err = new Error(
      message
    ) as Error & { status?: number; body?: any };
    err.status = response.status;
    err.body = errorData;
    throw err;
  }

  return parsedBody;
}

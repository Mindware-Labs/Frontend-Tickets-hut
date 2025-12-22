const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function fetchFromBackend(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${BACKEND_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Backend Error: ${response.status}`, errorData);
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

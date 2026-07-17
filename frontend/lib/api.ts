const BASE_URL = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:8000'
      : '')
  : 'http://127.0.0.1:8000';

function getHeaders(token?: string, isMultipart = false) {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string) {
  const isMultipart = options.body instanceof FormData;
  const headers = {
    ...getHeaders(token, isMultipart),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errData = await response.json();
      errorMessage = errData.detail || errorMessage;
    } catch {
      // JSON parsing failed, use statusText
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

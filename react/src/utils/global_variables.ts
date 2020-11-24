export const API_URL = '/api/v1';

export async function apiFetch<T>(url: string): Promise<T> {
  return fetch(`${API_URL}/${url}`).then((res) => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return res.json();
  });
}

export async function apiPost<T>(
  url: string,
  body: string | FormData | URLSearchParams
): Promise<T> {
  return fetch(`${API_URL}/${url}`, { method: 'POST', body }).then((res) => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return res.json();
  });
}

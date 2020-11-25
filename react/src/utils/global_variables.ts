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
  body: string | FormData | URLSearchParams,
  headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
): Promise<T> {
  if (typeof body === 'string') {
    const params = new URLSearchParams();
    params.append('code', body);
    body = params;
  }

  return fetch(`${API_URL}/${url}`, { method: 'POST', body, headers }).then(
    (res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    }
  );
}

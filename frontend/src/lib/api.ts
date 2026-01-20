import { browser } from '$app/environment';

const API_URL = 'http://localhost:3000/api';

function getToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('token');
}

async function request<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const token = getToken();
	
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...options.headers
	};

	if (token) {
		(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
		throw new Error(error.error || 'Erro na requisição');
	}

	return response.json();
}

export const api = {
	get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
	
	post: <T>(endpoint: string, data: unknown) => 
		request<T>(endpoint, { 
			method: 'POST', 
			body: JSON.stringify(data) 
		}),
	
	put: <T>(endpoint: string, data: unknown) => 
		request<T>(endpoint, { 
			method: 'PUT', 
			body: JSON.stringify(data) 
		}),
	
	delete: <T>(endpoint: string) => 
		request<T>(endpoint, { method: 'DELETE' }),

	upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
		const token = getToken();
		const headers: HeadersInit = {};
		
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_URL}${endpoint}`, {
			method: 'POST',
			headers,
			body: formData
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
			throw new Error(error.error || 'Erro no upload');
		}

		return response.json();
	}
};

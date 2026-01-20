import { browser } from '$app/environment';

export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'funcionario';
	modules: string[];
	status: 'ativo' | 'inativo';
}

export interface Permissions {
	fotografico: boolean;
	spda: boolean;
	rdo: boolean;
	tecnico: boolean;
	gastos: boolean;
	banco_dados: boolean;
	gerenciar_usuarios: boolean;
}

const API_URL = 'http://localhost:3000/api';

function createAuthStore() {
	let user = $state<User | null>(null);
	let token = $state<string | null>(null);
	let loading = $state(false);
	let initialized = $state(false);

	// Initialize from localStorage on browser
	if (browser) {
		console.log('[Auth Store] Initializing from localStorage');
		const storedToken = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');
		console.log('[Auth Store] Stored token:', !!storedToken);
		console.log('[Auth Store] Stored user:', !!storedUser);
		
		if (storedToken && storedUser) {
			token = storedToken;
			try {
				const parsedUser = JSON.parse(storedUser);
				user = parsedUser;
				console.log('[Auth Store] Loaded user:', parsedUser.name, 'Role:', parsedUser.role);
			} catch {
				console.error('[Auth Store] Failed to parse stored user');
				user = null;
				localStorage.removeItem('user');
				localStorage.removeItem('token');
			}
		}
		initialized = true;
		console.log('[Auth Store] Initialization complete');
	}

	function login(userData: User, authToken: string) {
		user = userData;
		token = authToken;
		if (browser) {
			localStorage.setItem('token', authToken);
			localStorage.setItem('user', JSON.stringify(userData));
		}
	}

	function logout() {
		user = null;
		token = null;
		if (browser) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	}

	async function checkAuth(): Promise<boolean> {
		console.log('[Auth Store] checkAuth called');
		console.log('[Auth Store] Current token:', token ? 'exists' : 'null');
		console.log('[Auth Store] Current user:', user?.name || 'null');
		
		if (!token) {
			console.log('[Auth Store] No token, returning false');
			initialized = true;
			return false;
		}

		loading = true;
		try {
			console.log('[Auth Store] Fetching /auth/me...');
			const response = await fetch(`${API_URL}/auth/me`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			console.log('[Auth Store] Response status:', response.status);

			if (!response.ok) {
				console.log('[Auth Store] Response not ok, clearing auth');
				logout();
				return false;
			}

			const userData = await response.json();
			console.log('[Auth Store] User data received:', userData.name, 'Role:', userData.role);
			user = userData;
			if (browser) {
				localStorage.setItem('user', JSON.stringify(userData));
			}
			return true;
		} catch (error) {
			console.error('[Auth Store] Fetch error:', error);
			// If we have cached user data, keep it and return true
			if (user && token) {
				console.warn('[Auth Store] Backend unreachable, using cached data');
				return true;
			}
			logout();
			return false;
		} finally {
			loading = false;
			initialized = true;
		}
	}

	function hasModule(moduleName: string): boolean {
		if (!user) return false;
		if (user.role === 'admin') return true;
		return user.modules.includes(moduleName);
	}

	function getPermissions(): Permissions {
		return {
			fotografico: hasModule('fotografico'),
			spda: hasModule('spda'),
			rdo: hasModule('rdo'),
			tecnico: hasModule('tecnico'),
			gastos: hasModule('gastos'),
			banco_dados: hasModule('banco_dados'),
			gerenciar_usuarios: hasModule('gerenciar_usuarios')
		};
	}

	function getAvailableModules(): string[] {
		if (!user) return [];
		if (user.role === 'admin') {
			return ['fotografico', 'spda', 'rdo', 'tecnico', 'gastos', 'banco_dados', 'gerenciar_usuarios'];
		}
		return user.modules;
	}

	return {
		get user() { return user; },
		get token() { return token; },
		get loading() { return loading; },
		get initialized() { return initialized; },
		get isAuthenticated() { return !!user && !!token; },
		get isAdmin() { return user?.role === 'admin'; },
		get permissions() { return getPermissions(); },
		get availableModules() { return getAvailableModules(); },
		login,
		logout,
		checkAuth,
		hasModule
	};
}

export const auth = createAuthStore();

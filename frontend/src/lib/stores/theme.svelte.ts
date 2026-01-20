import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	let theme = $state<Theme>('dark');
	let initialized = $state(false);

	// Initialize from localStorage on browser
	if (browser) {
		const stored = localStorage.getItem('theme') as Theme | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initialTheme = stored || (prefersDark ? 'dark' : 'light');
		theme = initialTheme;
		applyTheme(initialTheme);
		initialized = true;

		// Listen for system theme changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (!localStorage.getItem('theme')) {
				const newTheme = e.matches ? 'dark' : 'light';
				setTheme(newTheme);
			}
		});
	}

	function applyTheme(newTheme: Theme) {
		if (!browser) return;
		
		const root = document.documentElement;
		
		// Remove both classes first
		root.classList.remove('dark', 'light');
		
		// Add the new theme class
		root.classList.add(newTheme);
		
		// Also set data attribute for additional CSS targeting
		root.setAttribute('data-theme', newTheme);
		
		console.log('[Theme] Applied theme:', newTheme);
		console.log('[Theme] HTML classes:', root.className);
		console.log('[Theme] Data-theme:', root.getAttribute('data-theme'));
		
		// Force a repaint to ensure CSS variables are applied
		void root.offsetHeight;
		
		// Update meta theme-color for mobile browsers
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#111827' : '#ffffff');
		}
	}

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem('theme', newTheme);
			applyTheme(newTheme);
		}
	}

	function toggleTheme() {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		console.log('[Theme Store] Toggling theme from', theme, 'to', newTheme);
		setTheme(newTheme);
	}

	return {
		get theme() { return theme; },
		get isDark() { return theme === 'dark'; },
		get isLight() { return theme === 'light'; },
		get initialized() { return initialized; },
		setTheme,
		toggleTheme
	};
}

export const themeStore = createThemeStore();

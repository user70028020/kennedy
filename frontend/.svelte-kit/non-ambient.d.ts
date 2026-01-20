
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/auditoria" | "/admin/backups" | "/admin/colaboradores" | "/admin/database" | "/admin/lixeira" | "/admin/mesclar" | "/admin/os" | "/admin/relatorios" | "/admin/templates" | "/admin/usuarios" | "/login" | "/relatorios" | "/relatorios/fotografico" | "/relatorios/gastos" | "/relatorios/rdo" | "/relatorios/spda" | "/relatorios/tecnico";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/admin": Record<string, never>;
			"/admin/auditoria": Record<string, never>;
			"/admin/backups": Record<string, never>;
			"/admin/colaboradores": Record<string, never>;
			"/admin/database": Record<string, never>;
			"/admin/lixeira": Record<string, never>;
			"/admin/mesclar": Record<string, never>;
			"/admin/os": Record<string, never>;
			"/admin/relatorios": Record<string, never>;
			"/admin/templates": Record<string, never>;
			"/admin/usuarios": Record<string, never>;
			"/login": Record<string, never>;
			"/relatorios": Record<string, never>;
			"/relatorios/fotografico": Record<string, never>;
			"/relatorios/gastos": Record<string, never>;
			"/relatorios/rdo": Record<string, never>;
			"/relatorios/spda": Record<string, never>;
			"/relatorios/tecnico": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/auditoria" | "/admin/auditoria/" | "/admin/backups" | "/admin/backups/" | "/admin/colaboradores" | "/admin/colaboradores/" | "/admin/database" | "/admin/database/" | "/admin/lixeira" | "/admin/lixeira/" | "/admin/mesclar" | "/admin/mesclar/" | "/admin/os" | "/admin/os/" | "/admin/relatorios" | "/admin/relatorios/" | "/admin/templates" | "/admin/templates/" | "/admin/usuarios" | "/admin/usuarios/" | "/login" | "/login/" | "/relatorios" | "/relatorios/" | "/relatorios/fotografico" | "/relatorios/fotografico/" | "/relatorios/gastos" | "/relatorios/gastos/" | "/relatorios/rdo" | "/relatorios/rdo/" | "/relatorios/spda" | "/relatorios/spda/" | "/relatorios/tecnico" | "/relatorios/tecnico/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/assinatura-sergio-lima-new.png" | "/clear-localhost-cache.html" | "/logoclaro.png" | "/logoescuro.png" | "/theme-test.html" | string & {};
	}
}
<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { auth } from '$lib/stores/auth.svelte';
	import { ThemeToggle } from '$lib/components/ui';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { fadeIn, staggerIn } from '$lib/utils/animations';

	interface MenuItem {
		id: string;
		label: string;
		href: string;
		icon: string;
		module?: string;
	}

	const menuItems: MenuItem[] = [
		{ id: 'usuarios', label: 'Gerenciar Usuários', href: '/admin/usuarios', icon: 'users', module: 'gerenciar_usuarios' },
		{ id: 'os', label: 'Ordens de Serviço', href: '/admin/os', icon: 'folder', module: 'banco_dados' },
		{ id: 'colaboradores', label: 'Colaboradores', href: '/admin/colaboradores', icon: 'people', module: 'banco_dados' },
		{ id: 'templates', label: 'Templates', href: '/admin/templates', icon: 'document', module: 'banco_dados' },
		{ id: 'relatorios', label: 'Banco de Relatórios', href: '/admin/relatorios', icon: 'archive', module: 'banco_dados' },
		{ id: 'mesclar', label: 'Mesclar Relatórios', href: '/admin/mesclar', icon: 'merge', module: 'banco_dados' },
		{ id: 'auditoria', label: 'Auditoria', href: '/admin/auditoria', icon: 'shield', module: 'banco_dados' },
		{ id: 'lixeira', label: 'Lixeira', href: '/admin/lixeira', icon: 'trash', module: 'banco_dados' },
		{ id: 'backups', label: 'Backups', href: '/admin/backups', icon: 'backup', module: 'banco_dados' }
	];

	let sidebarElement: HTMLElement;
	let menuElements: HTMLElement[] = [];
	let animationsInitialized = $state(false);

	// Svelte 5: usar $effect em vez de onMount
	$effect(() => {
		if (browser && !animationsInitialized && sidebarElement) {
			animationsInitialized = true;
			fadeIn(sidebarElement, { duration: 0.3 });
			// Stagger animate menu items
			setTimeout(() => {
				if (menuElements.length > 0) {
					staggerIn(menuElements, { duration: 0.3, stagger: 0.05 });
				}
			}, 200);
		}
	});

	function getVisibleItems(): MenuItem[] {
		return menuItems.filter(item => !item.module || auth.hasModule(item.module));
	}

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	function handleLogout() {
		auth.logout();
		window.location.href = '/login';
	}
</script>

<aside 
	bind:this={sidebarElement}
	class="w-64 h-screen flex flex-col transition-colors duration-300 sticky top-0"
	style="background-color: var(--bg-secondary); border-right: 1px solid var(--border-color);"
>
	<div class="p-4 flex items-center justify-center" style="border-bottom: 1px solid var(--border-color);">
		{#if themeStore.isDark}
			<img src="/logoescuro.png" alt="SERCAMP" class="h-10 w-auto" />
		{:else}
			<img src="/logoclaro.png" alt="SERCAMP" class="h-10 w-auto" />
		{/if}
	</div>

	<!-- Botão Voltar ao Dashboard -->
	<div class="px-4 pt-4">
		<a
			href="/relatorios/fotografico"
			class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
			style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Voltar ao Dashboard
		</a>
	</div>

	<nav class="flex-1 p-4 overflow-y-auto">
		<ul class="space-y-1">
			{#each getVisibleItems() as item, i}
				<li bind:this={menuElements[i]} style="opacity: 1;">
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 {isActive(item.href)
							? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
							: 'hover:scale-[1.02]'}"
						style={!isActive(item.href) ? `color: var(--text-secondary); background-color: transparent;` : ''}
						onmouseenter={(e) => { if (!isActive(item.href)) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
						onmouseleave={(e) => { if (!isActive(item.href)) e.currentTarget.style.backgroundColor = 'transparent'; }}
					>
						{#if item.icon === 'users'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						{:else if item.icon === 'folder'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
							</svg>
						{:else if item.icon === 'people'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						{:else if item.icon === 'document'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						{:else if item.icon === 'archive'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
							</svg>
						{:else if item.icon === 'merge'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
							</svg>
						{:else if item.icon === 'shield'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						{:else if item.icon === 'trash'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						{:else if item.icon === 'backup'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
						{/if}
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="p-4 mt-auto" style="border-top: 1px solid var(--border-color);">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-3 min-w-0">
				<div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25 flex-shrink-0">
					<span class="text-white font-medium">
						{auth.user?.name?.charAt(0).toUpperCase() || 'A'}
					</span>
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium truncate" style="color: var(--text-primary);">{auth.user?.name || 'Admin'}</p>
					<p class="text-xs" style="color: var(--text-muted);">Administrador</p>
				</div>
			</div>
			<ThemeToggle />
		</div>
		<button
			onclick={handleLogout}
			class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02]"
			style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
			</svg>
			Sair
		</button>
	</div>
</aside>

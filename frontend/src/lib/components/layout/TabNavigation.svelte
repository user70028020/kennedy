<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth.svelte';

	interface Tab {
		id: string;
		label: string;
		shortLabel: string;
		href: string;
		module: string;
		icon: string;
	}

	const tabs: Tab[] = [
		{ id: 'fotografico', label: 'Relatório Fotográfico', shortLabel: 'Fotográfico', href: '/relatorios/fotografico', module: 'fotografico', icon: 'camera' },
		{ id: 'spda', label: 'SPDA', shortLabel: 'SPDA', href: '/relatorios/spda', module: 'spda', icon: 'lightning' },
		{ id: 'rdo', label: 'RDO de Montagem', shortLabel: 'RDO', href: '/relatorios/rdo', module: 'rdo', icon: 'wrench' },
		{ id: 'tecnico', label: 'Relatório Técnico', shortLabel: 'Técnico', href: '/relatorios/tecnico', module: 'tecnico', icon: 'document' },
		{ id: 'gastos', label: 'Relatório de Gastos', shortLabel: 'Gastos', href: '/relatorios/gastos', module: 'gastos', icon: 'currency' }
	];

	function getVisibleTabs(): Tab[] {
		return tabs.filter(tab => auth.hasModule(tab.module));
	}

	function isActive(href: string): boolean {
		return $page.url.pathname.startsWith(href);
	}
</script>

<nav class="px-4 py-3 border-b" style="background-color: var(--bg-card); border-color: var(--border-color);">
	<div class="max-w-7xl mx-auto">
		<div class="flex justify-center">
			<div class="inline-flex p-1 rounded-2xl gap-1" style="background-color: var(--bg-secondary);">
				{#each getVisibleTabs() as tab}
					<a
						href={tab.href}
						class="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 {isActive(tab.href) 
							? 'shadow-lg' 
							: 'hover:bg-opacity-50'}"
						style={isActive(tab.href) 
							? 'background-color: var(--bg-card); color: var(--text-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.1);' 
							: 'color: var(--text-muted); background-color: transparent;'}
					>
						<!-- Icon -->
						<span class="transition-transform duration-300 {isActive(tab.href) ? 'scale-110' : 'group-hover:scale-110'}">
							{#if tab.icon === 'camera'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							{:else if tab.icon === 'lightning'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							{:else if tab.icon === 'wrench'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								</svg>
							{:else if tab.icon === 'document'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							{:else if tab.icon === 'currency'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							{/if}
						</span>
						
						<!-- Label -->
						<span class="hidden sm:inline">{tab.label}</span>
						<span class="sm:hidden">{tab.shortLabel}</span>
						
						<!-- Active indicator -->
						{#if isActive(tab.href)}
							<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</div>
</nav>

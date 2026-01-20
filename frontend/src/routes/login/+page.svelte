<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast.svelte';
	import { ThemeToggle } from '$lib/components/ui';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const response = await fetch('http://localhost:3000/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Erro ao fazer login');
			}

			const data = await response.json();
			
			// Use auth store to save login state
			auth.login(data.user, data.token);
			
			toast.success(`Bem-vindo, ${data.user.name}!`);
			
			// Todos vão para relatórios (admin tem botão para acessar painel admin)
			goto('/relatorios');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao fazer login';
			toast.error(error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300" style="background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);">
	<!-- Background decoration -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
	</div>

	<!-- Theme toggle in corner -->
	<div class="absolute top-4 right-4">
		<ThemeToggle />
	</div>

	<div class="max-w-md w-full relative z-10">
		<div class="text-center mb-8 animate-fade-in">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
				<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold" style="color: var(--text-primary);">SERCAMP</h1>
			<p class="mt-2" style="color: var(--text-muted);">Sistema de Relatórios Técnicos</p>
		</div>

		<form onsubmit={handleLogin} class="rounded-2xl p-8 shadow-2xl backdrop-blur-sm animate-scale-in transition-colors duration-300" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
			<h2 class="text-xl font-semibold mb-6" style="color: var(--text-primary);">Entrar na sua conta</h2>

			{#if error}
				<div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 animate-shake">
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					{error}
				</div>
			{/if}

			<div class="mb-4">
				<label for="email" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
					Email
				</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg class="w-5 h-5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
						</svg>
					</div>
					<input
						type="email"
						id="email"
						bind:value={email}
						autocomplete="email"
						required
						class="w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 admin-input"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
						placeholder="seu@email.com"
					/>
				</div>
			</div>

			<div class="mb-6">
				<label for="password" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
					Senha
				</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg class="w-5 h-5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<input
						type="password"
						id="password"
						bind:value={password}
						autocomplete="current-password"
						required
						class="w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 admin-input"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
						placeholder="••••••••"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 btn-press"
			>
				{#if loading}
					<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Entrando...
				{:else}
					Entrar
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				{/if}
			</button>
		</form>

		<p class="text-center text-sm mt-6" style="color: var(--text-muted);">
			© 2026 SERCAMP - Todos os direitos reservados
		</p>
	</div>
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}
	
	.animate-shake {
		animation: shake 0.3s ease-in-out;
	}

	.admin-input:focus {
		outline: none;
		border-color: var(--color-primary) !important;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	.admin-input::placeholder {
		color: var(--text-muted);
	}
</style>

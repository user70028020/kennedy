<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let redirected = $state(false);

	// Redirect to OS page since database is now split into separate pages
	$effect(() => {
		if (browser && !redirected) {
			redirected = true;
			goto('/admin/os');
		}
	});
</script>

<div class="bg-gray-800 rounded-lg p-6">
	<div class="flex items-center justify-center py-12">
		<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
	</div>
</div>

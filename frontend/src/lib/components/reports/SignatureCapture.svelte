<script lang="ts">
	interface Props {
		label?: string;
		width?: number;
		height?: number;
		value?: string;
		onchange?: (signatureData: string) => void;
	}

	let { 
		label = 'Assinatura', 
		width = 400, 
		height = 200, 
		value = $bindable(''),
		onchange 
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let isDrawing = false;
	let lastX = 0;
	let lastY = 0;
	let hasSignature = $state(false);

	$effect(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				
				// If there's an existing value, load it
				if (value) {
					loadSignature(value);
				}
			}
		}
	});

	function loadSignature(dataUrl: string) {
		if (!ctx || !dataUrl) return;
		
		const img = new Image();
		img.onload = () => {
			ctx!.clearRect(0, 0, canvas.width, canvas.height);
			ctx!.drawImage(img, 0, 0);
			hasSignature = true;
		};
		img.src = dataUrl;
	}

	function getCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		if ('touches' in event) {
			const touch = event.touches[0];
			return {
				x: (touch.clientX - rect.left) * scaleX,
				y: (touch.clientY - rect.top) * scaleY
			};
		} else {
			return {
				x: (event.clientX - rect.left) * scaleX,
				y: (event.clientY - rect.top) * scaleY
			};
		}
	}

	function startDrawing(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		isDrawing = true;
		const coords = getCoordinates(event);
		lastX = coords.x;
		lastY = coords.y;
	}

	function draw(event: MouseEvent | TouchEvent) {
		if (!isDrawing || !ctx) return;
		event.preventDefault();

		const coords = getCoordinates(event);

		ctx.beginPath();
		ctx.moveTo(lastX, lastY);
		ctx.lineTo(coords.x, coords.y);
		ctx.stroke();

		lastX = coords.x;
		lastY = coords.y;
		hasSignature = true;
	}

	function stopDrawing() {
		if (isDrawing && hasSignature) {
			isDrawing = false;
			exportSignature();
		}
		isDrawing = false;
	}

	function clearSignature() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		hasSignature = false;
		value = '';
		onchange?.('');
	}

	function exportSignature() {
		if (!canvas || !hasSignature) return;
		const dataUrl = canvas.toDataURL('image/png');
		value = dataUrl;
		onchange?.(dataUrl);
	}

	function confirmSignature() {
		exportSignature();
	}
</script>

<div class="space-y-3">
	<span class="modern-label">{label}</span>
	
	<div class="relative">
		<canvas
			bind:this={canvas}
			{width}
			{height}
			class="w-full rounded-xl cursor-crosshair touch-none"
			style="max-width: {width}px; aspect-ratio: {width}/{height}; background-color: var(--bg-tertiary); border: 2px solid var(--border-color);"
			onmousedown={startDrawing}
			onmousemove={draw}
			onmouseup={stopDrawing}
			onmouseleave={stopDrawing}
			ontouchstart={startDrawing}
			ontouchmove={draw}
			ontouchend={stopDrawing}
		></canvas>
		
		{#if !hasSignature}
			<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
				<span class="text-sm" style="color: var(--text-muted);">Assine aqui</span>
			</div>
		{/if}
	</div>

	<div class="flex gap-3">
		<button
			type="button"
			onclick={clearSignature}
			class="btn-modern btn-modern-secondary"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
			</svg>
			Limpar
		</button>

		<button
			type="button"
			onclick={confirmSignature}
			disabled={!hasSignature}
			class="btn-modern btn-modern-success"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>
			Confirmar
		</button>
	</div>

	{#if value}
		<p class="text-xs flex items-center gap-1" style="color: var(--color-success);">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>
			Assinatura capturada
		</p>
	{/if}
</div>

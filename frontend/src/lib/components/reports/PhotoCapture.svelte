<script lang="ts">
	export interface Photo {
		id: string;
		data: string; // base64
		name: string;
		description?: string;
	}

	interface Props {
		photos?: Photo[];
		maxPhotos?: number;
		onchange?: (photos: Photo[]) => void;
	}

	let { photos = $bindable([]), maxPhotos = 20, onchange }: Props = $props();

	let fileInput: HTMLInputElement;
	let cameraInput: HTMLInputElement;
	let dragOver = $state(false);

	function generateId(): string {
		return `photo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (!files || files.length === 0) return;
		await processFiles(Array.from(files));
		target.value = '';
	}

	async function processFiles(files: File[]) {
		const remainingSlots = maxPhotos - photos.length;
		const filesToProcess = files.slice(0, remainingSlots);

		for (const file of filesToProcess) {
			if (!file.type.startsWith('image/')) continue;

			try {
				const base64 = await fileToBase64(file);
				const newPhoto: Photo = {
					id: generateId(),
					data: base64,
					name: file.name,
					description: ''
				};

				photos = [...photos, newPhoto];
			} catch (error) {
				console.error('Error reading file:', error);
			}
		}

		onchange?.(photos);
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				resolve(result);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	function removePhoto(photoId: string) {
		photos = photos.filter((p) => p.id !== photoId);
		onchange?.(photos);
	}

	function updatePhotoName(photoId: string, newName: string) {
		photos = photos.map((p) => (p.id === photoId ? { ...p, name: newName } : p));
		onchange?.(photos);
	}

	function updatePhotoDescription(photoId: string, newDescription: string) {
		photos = photos.map((p) => (p.id === photoId ? { ...p, description: newDescription } : p));
		onchange?.(photos);
	}

	function openFileDialog() {
		fileInput.click();
	}

	function openCameraDialog() {
		cameraInput.click();
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			await processFiles(Array.from(files));
		}
	}

	const canAddMore = $derived(photos.length < maxPhotos);
	const progressPercent = $derived((photos.length / maxPhotos) * 100);
</script>

<div class="space-y-4">
	<!-- Upload Controls -->
	<div class="flex flex-wrap items-center gap-3">
		<button
			type="button"
			onclick={openFileDialog}
			disabled={!canAddMore}
			class="btn-modern btn-modern-primary"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
			<span>Selecionar Fotos</span>
		</button>

		<button
			type="button"
			onclick={openCameraDialog}
			disabled={!canAddMore}
			class="btn-modern btn-modern-success"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			<span>Usar Câmera</span>
		</button>

		<!-- Progress indicator -->
		<div class="flex items-center gap-3 ml-auto">
			<div class="flex items-center gap-2">
				<div class="w-32 h-2 rounded-full overflow-hidden" style="background-color: var(--bg-tertiary);">
					<div 
						class="h-full rounded-full transition-all duration-300"
						style="width: {progressPercent}%; background: var(--gradient-primary);"
					></div>
				</div>
				<span class="text-sm font-medium" style="color: var(--text-secondary);">
					{photos.length}/{maxPhotos}
				</span>
			</div>
		</div>
	</div>

	<!-- Hidden file inputs -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		onchange={handleFileSelect}
		class="hidden"
	/>

	<input
		bind:this={cameraInput}
		type="file"
		accept="image/*"
		capture="environment"
		onchange={handleFileSelect}
		class="hidden"
	/>

	<!-- Photo Grid or Drop Zone -->
	{#if photos.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each photos as photo, index (photo.id)}
				<div 
					class="rounded-xl overflow-hidden transition-all duration-300 animate-in"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); animation-delay: {index * 0.05}s;"
				>
					<!-- Photo Preview -->
					<div class="relative aspect-video overflow-hidden" style="background-color: var(--bg-tertiary);">
						<img src={photo.data} alt={photo.name} class="w-full h-full object-contain" />
						
						<!-- Overlay with actions -->
						<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
							<span class="text-white text-xs font-medium truncate max-w-[70%]">{photo.name}</span>
							<button
								type="button"
								onclick={() => removePhoto(photo.id)}
								class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
								title="Remover foto"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>

						<!-- Photo number badge -->
						<div class="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style="background: var(--gradient-primary);">
							{index + 1}
						</div>
					</div>

					<!-- Photo Info -->
					<div class="p-3 space-y-2">
						<input
							type="text"
							value={photo.name}
							oninput={(e) => updatePhotoName(photo.id, e.currentTarget.value)}
							class="modern-input text-sm py-2"
							placeholder="Nome da foto"
						/>

						<textarea
							value={photo.description || ''}
							oninput={(e) => updatePhotoDescription(photo.id, e.currentTarget.value)}
							rows="2"
							class="modern-textarea text-sm py-2"
							placeholder="Descrição (opcional)"
						></textarea>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty State / Drop Zone -->
		<div 
			class="relative rounded-xl border-2 border-dashed transition-all duration-300 {dragOver ? 'scale-[1.02]' : ''}"
			style="border-color: {dragOver ? 'var(--color-primary)' : 'var(--border-color)'}; background-color: {dragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)'};"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<div class="flex flex-col items-center justify-center py-12 px-4">
				<div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style="background-color: var(--bg-tertiary);">
					<svg class="w-8 h-8" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<p class="text-base font-medium mb-1" style="color: var(--text-primary);">
					{dragOver ? 'Solte as fotos aqui' : 'Nenhuma foto adicionada'}
				</p>
				<p class="text-sm" style="color: var(--text-muted);">
					Arraste e solte ou use os botões acima
				</p>
			</div>
		</div>
	{/if}
</div>

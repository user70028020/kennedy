import { y as attr_style, w as ensure_array_like, x as attr_class, F as bind_props, z as stringify } from "./index2.js";
import { a as attr } from "./attributes.js";
import { e as escape_html } from "./escaping.js";
function PhotoCapture($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { photos = [], maxPhotos = 20, onchange } = $$props;
    const canAddMore = photos.length < maxPhotos;
    const progressPercent = photos.length / maxPhotos * 100;
    $$renderer2.push(`<div class="space-y-4"><div class="flex flex-wrap items-center gap-3"><button type="button"${attr("disabled", !canAddMore, true)} class="btn-modern btn-modern-primary"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> <span>Selecionar Fotos</span></button> <button type="button"${attr("disabled", !canAddMore, true)} class="btn-modern btn-modern-success"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span>Usar Câmera</span></button> <div class="flex items-center gap-3 ml-auto"><div class="flex items-center gap-2"><div class="w-32 h-2 rounded-full overflow-hidden" style="background-color: var(--bg-tertiary);"><div class="h-full rounded-full transition-all duration-300"${attr_style(`width: ${stringify(progressPercent)}%; background: var(--gradient-primary);`)}></div></div> <span class="text-sm font-medium" style="color: var(--text-secondary);">${escape_html(photos.length)}/${escape_html(maxPhotos)}</span></div></div></div> <input type="file" accept="image/*" multiple class="hidden"/> <input type="file" accept="image/*" capture="environment" class="hidden"/> `);
    if (photos.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
      const each_array = ensure_array_like(photos);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let photo = each_array[index];
        $$renderer2.push(`<div class="rounded-xl overflow-hidden transition-all duration-300 animate-in"${attr_style(`background-color: var(--bg-secondary); border: 1px solid var(--border-color); animation-delay: ${stringify(index * 0.05)}s;`)}><div class="relative aspect-video overflow-hidden" style="background-color: var(--bg-tertiary);"><img${attr("src", photo.data)}${attr("alt", photo.name)} class="w-full h-full object-contain"/> <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3"><span class="text-white text-xs font-medium truncate max-w-[70%]">${escape_html(photo.name)}</span> <button type="button" class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg" title="Remover foto"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div> <div class="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style="background: var(--gradient-primary);">${escape_html(index + 1)}</div></div> <div class="p-3 space-y-2"><input type="text"${attr("value", photo.name)} class="modern-input text-sm py-2" placeholder="Nome da foto"/> <textarea rows="2" class="modern-textarea text-sm py-2" placeholder="Descrição (opcional)">`);
        const $$body = escape_html(photo.description || "");
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attr_class(`relative rounded-xl border-2 border-dashed transition-all duration-300 ${stringify("")}`)}${attr_style(`border-color: ${stringify("var(--border-color)")}; background-color: ${stringify("var(--bg-secondary)")};`)}><div class="flex flex-col items-center justify-center py-12 px-4"><div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style="background-color: var(--bg-tertiary);"><svg class="w-8 h-8" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div> <p class="text-base font-medium mb-1" style="color: var(--text-primary);">${escape_html("Nenhuma foto adicionada")}</p> <p class="text-sm" style="color: var(--text-muted);">Arraste e solte ou use os botões acima</p></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { photos });
  });
}
export {
  PhotoCapture as P
};

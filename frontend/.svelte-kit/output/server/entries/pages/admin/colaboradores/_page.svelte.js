import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let colaboradores = [];
    let searchTerm = "";
    function getTotalOS() {
      return colaboradores.reduce((sum, c) => sum + c.osCount, 0);
    }
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><h1 class="text-2xl font-bold" style="color: var(--text-primary);">Colaboradores</h1> <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:scale-[1.02]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Novo Colaborador</button></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="rounded-lg p-4 card"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div> <div><p class="text-sm" style="color: var(--text-muted);">Total de Colaboradores</p> <p class="text-2xl font-bold" style="color: var(--text-primary);">${escape_html(colaboradores.length)}</p></div></div></div> <div class="rounded-lg p-4 card"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg></div> <div><p class="text-sm" style="color: var(--text-muted);">Total de OS Participadas</p> <p class="text-2xl font-bold" style="color: var(--text-primary);">${escape_html(getTotalOS())}</p></div></div></div> <div class="rounded-lg p-4 card"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div> <div><p class="text-sm" style="color: var(--text-muted);">Média OS/Colaborador</p> <p class="text-2xl font-bold" style="color: var(--text-primary);">${escape_html(colaboradores.length > 0 ? (getTotalOS() / colaboradores.length).toFixed(1) : "0")}</p></div></div></div></div> <div class="rounded-lg p-4 card"><div class="flex gap-4"><div class="flex-1"><input type="text"${attr("value", searchTerm)} placeholder="Buscar por nome, documento, função ou email..." class="w-full px-3 py-2 rounded-lg input"/></div> <button class="px-4 py-2 rounded-lg btn-secondary">Limpar</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="rounded-lg overflow-hidden table-container">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="spinner"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

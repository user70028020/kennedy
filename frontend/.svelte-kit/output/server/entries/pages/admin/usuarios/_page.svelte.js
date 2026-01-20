function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold" style="color: var(--text-primary);">Gerenciar Usuários</h1> <p class="mt-1" style="color: var(--text-muted);">Crie, edite e gerencie os usuários do sistema</p></div> <div class="flex gap-3"><button class="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Limpar Sistema</button> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Novo Usuário</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="rounded-lg overflow-hidden transition-colors duration-300" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-8 text-center"><div class="relative inline-block"><div class="w-10 h-10 border-4 border-blue-500/30 rounded-full"></div> <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div></div> <p class="mt-4" style="color: var(--text-muted);">Carregando usuários...</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

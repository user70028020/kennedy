function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-theme-primary">💾 Backups</h1> <p class="text-theme-muted mt-1">Gerencie backups do sistema</p></div> <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"><span>➕</span> Criar Backup</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

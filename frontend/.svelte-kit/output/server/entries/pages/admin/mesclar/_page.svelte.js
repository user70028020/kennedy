import { a as attr } from "../../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedReportIds = [];
    ({
      data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><h1 class="text-2xl font-bold text-theme-primary">Mesclar Relatórios</h1> <button${attr("disabled", selectedReportIds.length === 0 || true, true)} class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>`);
    }
    $$renderer2.push(`<!--]--> Gerar Documento Mesclado</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};

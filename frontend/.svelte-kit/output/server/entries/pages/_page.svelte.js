import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="min-h-screen bg-gray-900 flex items-center justify-center"><div class="flex flex-col items-center gap-4"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> <p class="text-gray-400">Carregando...</p></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

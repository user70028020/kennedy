import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
/* empty css                                                         */
/* empty css                                                   */
/* empty css                                                              */
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="min-h-screen flex items-center justify-center" style="background-color: var(--bg-primary);"><div class="flex flex-col items-center gap-4"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> <p class="text-theme-muted">Carregando...</p></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _layout as default
};

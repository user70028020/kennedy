import { B as BROWSER } from "../../../chunks/false.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
/* empty css                                                         */
/* empty css                                                   */
const browser = BROWSER;
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    console.log("[Admin Layout] Script loaded, browser:", browser);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="min-h-screen flex items-center justify-center" style="background-color: var(--bg-primary);"><div class="flex flex-col items-center gap-4"><div class="relative"><div class="w-12 h-12 border-4 border-blue-500/30 rounded-full"></div> <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div></div> <p class="text-theme-secondary">Verificando autenticação...</p></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _layout as default
};

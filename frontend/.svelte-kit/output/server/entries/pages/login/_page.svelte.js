import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { x as attr_class, y as attr_style, z as stringify } from "../../../chunks/index2.js";
/* empty css                                                         */
function ThemeToggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<button${attr_class(`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${stringify("bg-gray-700")}`)}${attr_style(`background-color: ${stringify("#374151")};`)} aria-label="Alternar tema" title="Alternar entre tema claro e escuro"><span${attr_class(`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${stringify(
      "translate-x-0 bg-gray-900"
    )}`)}${attr_style(`background-color: ${stringify("#111827")};`)}>`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></span></button>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    let password = "";
    let loading = false;
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300 svelte-1x05zx6" style="background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);"><div class="absolute inset-0 overflow-hidden pointer-events-none svelte-1x05zx6"><div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl svelte-1x05zx6"></div> <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl svelte-1x05zx6"></div></div> <div class="absolute top-4 right-4 svelte-1x05zx6">`);
    ThemeToggle($$renderer2);
    $$renderer2.push(`<!----></div> <div class="max-w-md w-full relative z-10 svelte-1x05zx6"><div class="text-center mb-8 animate-fade-in svelte-1x05zx6"><div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30 svelte-1x05zx6"><svg class="w-8 h-8 text-white svelte-1x05zx6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" class="svelte-1x05zx6"></path></svg></div> <h1 class="text-3xl font-bold svelte-1x05zx6" style="color: var(--text-primary);">SERCAMP</h1> <p class="mt-2 svelte-1x05zx6" style="color: var(--text-muted);">Sistema de Relatórios Técnicos</p></div> <form class="rounded-2xl p-8 shadow-2xl backdrop-blur-sm animate-scale-in transition-colors duration-300 svelte-1x05zx6" style="background-color: var(--bg-card); border: 1px solid var(--border-color);"><h2 class="text-xl font-semibold mb-6 svelte-1x05zx6" style="color: var(--text-primary);">Entrar na sua conta</h2> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="mb-4 svelte-1x05zx6"><label for="email" class="block text-sm font-medium mb-2 svelte-1x05zx6" style="color: var(--text-secondary);">Email</label> <div class="relative svelte-1x05zx6"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none svelte-1x05zx6"><svg class="w-5 h-5 svelte-1x05zx6" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" class="svelte-1x05zx6"></path></svg></div> <input type="email" id="email"${attr("value", email)} autocomplete="email" required class="w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 admin-input svelte-1x05zx6" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="seu@email.com"/></div></div> <div class="mb-6 svelte-1x05zx6"><label for="password" class="block text-sm font-medium mb-2 svelte-1x05zx6" style="color: var(--text-secondary);">Senha</label> <div class="relative svelte-1x05zx6"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none svelte-1x05zx6"><svg class="w-5 h-5 svelte-1x05zx6" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" class="svelte-1x05zx6"></path></svg></div> <input type="password" id="password"${attr("value", password)} autocomplete="current-password" required class="w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 admin-input svelte-1x05zx6" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="••••••••"/></div></div> <button type="submit"${attr("disabled", loading, true)} class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 btn-press svelte-1x05zx6">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`Entrar <svg class="w-5 h-5 svelte-1x05zx6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" class="svelte-1x05zx6"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></button></form> <p class="text-center text-sm mt-6 svelte-1x05zx6" style="color: var(--text-muted);">© 2026 SERCAMP - Todos os direitos reservados</p></div></div>`);
  });
}
export {
  _page as default
};

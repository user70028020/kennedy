import { x as attr_class, y as attr_style, w as ensure_array_like, z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let items = [];
    let filterType = "all";
    const typeLabels = {
      user: "Usuário",
      service_order: "Ordem de Serviço",
      report: "Relatório",
      template: "Template",
      colaborador: "Colaborador"
    };
    const typeIcons = {
      user: "👤",
      service_order: "📋",
      report: "📄",
      template: "📝",
      colaborador: "👷"
    };
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-theme-primary">🗑️ Lixeira</h1> <p class="text-theme-muted mt-1">Itens excluídos podem ser restaurados ou removidos permanentemente</p></div> `);
    if (items.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"><span>🗑️</span> Esvaziar Lixeira</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex gap-2 flex-wrap"><button${attr_class(`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${stringify("bg-blue-600 text-white")}`)}${attr_style("")}>Todos (${escape_html(items.length)})</button> <!--[-->`);
    const each_array = ensure_array_like(Object.entries(typeLabels));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [type, label] = each_array[$$index];
      const count = items.filter((i) => i.type === type).length;
      if (count > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button${attr_class(`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${stringify(filterType === type ? "bg-blue-600 text-white" : "")}`)}${attr_style(filterType !== type ? `background-color: var(--bg-tertiary); color: var(--text-secondary);` : "")}>${escape_html(typeIcons[type])} ${escape_html(label)} (${escape_html(count)})</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
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

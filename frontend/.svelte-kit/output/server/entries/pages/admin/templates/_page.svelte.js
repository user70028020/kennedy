import { w as ensure_array_like, x as attr_class, z as stringify } from "../../../../chunks/index2.js";
import { a as api, s as staggerIn } from "../../../../chunks/api.js";
import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let templates = [];
    let loading = true;
    let error = "";
    let gridItems = [];
    let searchTerm = "";
    let typeFilter = "";
    let categoryFilter = "";
    const equipmentCategories = [
      "Transformador",
      "Transformador para Instrumentos",
      "Disjuntor",
      "Para-raios",
      "Relé de Proteção",
      "Chave Seccionadora",
      "Chave Religadora",
      "Painel Religador",
      "Retificador de Bateria",
      "Banco de Capacitores",
      "Cabos",
      "SPDA",
      "Fotográfico",
      "RDO",
      "Gastos"
    ];
    const mergeCategories = ["Relatório Consolidado", "Relatório Final", "Outros"];
    async function loadTemplates() {
      loading = true;
      error = "";
      try {
        const params = new URLSearchParams();
        if (searchTerm) ;
        if (typeFilter) ;
        if (categoryFilter) ;
        const queryString = params.toString();
        const endpoint = `/admin/templates${queryString ? `?${queryString}` : ""}`;
        templates = await api.get(endpoint);
        setTimeout(
          () => {
            if (gridItems.length > 0) {
              staggerIn(gridItems.filter(Boolean), { duration: 0.3, stagger: 0.05 });
            }
          },
          100
        );
      } catch (err) {
        error = err instanceof Error ? err.message : "Erro ao carregar templates";
      } finally {
        loading = false;
      }
    }
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("pt-BR");
    }
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    function getTypeLabel(type) {
      return type === "equipment" ? "Equipamento" : "Mesclagem";
    }
    function getTypeColor(type) {
      return type === "equipment" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400";
    }
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><h1 class="text-2xl font-bold text-theme-primary">Templates</h1> <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Novo Template</button></div> <div class="rounded-lg p-4 border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);"><div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label for="search" class="block text-sm font-medium mb-1 text-theme-secondary">Buscar</label> <input id="search" type="text"${attr("value", searchTerm)} placeholder="Nome, arquivo..." class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div><label for="type" class="block text-sm font-medium mb-1 text-theme-secondary">Tipo</label> `);
    $$renderer2.select(
      {
        id: "type",
        value: typeFilter,
        onchange: loadTemplates,
        class: "w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos`);
        });
        $$renderer3.option({ value: "equipment" }, ($$renderer4) => {
          $$renderer4.push(`Equipamento`);
        });
        $$renderer3.option({ value: "merge" }, ($$renderer4) => {
          $$renderer4.push(`Mesclagem`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label for="category" class="block text-sm font-medium mb-1 text-theme-secondary">Categoria</label> `);
    $$renderer2.select(
      {
        id: "category",
        value: categoryFilter,
        onchange: loadTemplates,
        class: "w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todas`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like([...equipmentCategories, ...mergeCategories]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let cat = each_array[$$index];
          $$renderer3.option({ value: cat }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(cat)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="flex items-end"><button class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Limpar Filtros</button></div></div></div> `);
    if (error) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg animate-fade-in">${escape_html(error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="rounded-lg overflow-hidden border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">`);
    if (loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (templates.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="text-center py-12 text-theme-muted"><svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p>Nenhum template encontrado</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"><!--[-->`);
        const each_array_1 = ensure_array_like(templates);
        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
          let template = each_array_1[i];
          $$renderer2.push(`<div class="rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg card-hover" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); opacity: 0;"><div class="flex items-start justify-between mb-3"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div> <div><h3 class="font-medium text-theme-primary">${escape_html(template.name)}</h3> <p class="text-sm text-theme-muted">${escape_html(template.fileName)}</p></div></div> <span${attr_class(`px-2 py-1 rounded-full text-xs font-medium ${stringify(getTypeColor(template.type))}`)}>${escape_html(getTypeLabel(template.type))}</span></div> <div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-theme-muted">Categoria:</span> <span class="text-theme-secondary">${escape_html(template.category)}</span></div> <div class="flex justify-between"><span class="text-theme-muted">Tamanho:</span> <span class="text-theme-secondary">${escape_html(formatFileSize(template.fileSize))}</span></div> <div class="flex justify-between"><span class="text-theme-muted">Atualizado:</span> <span class="text-theme-secondary">${escape_html(formatDate(template.updatedAt))}</span></div></div> <div class="flex items-center justify-end gap-2 mt-4 pt-3" style="border-top: 1px solid var(--border-color);"><button class="p-2 text-theme-muted hover:text-green-400 transition-colors duration-200" title="Download"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button> <button class="p-2 text-theme-muted hover:text-blue-400 transition-colors duration-200" title="Editar"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button> <button class="p-2 text-theme-muted hover:text-red-400 transition-colors duration-200" title="Excluir"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
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

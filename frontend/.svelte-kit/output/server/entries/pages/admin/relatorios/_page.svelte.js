import { w as ensure_array_like, x as attr_class, z as stringify } from "../../../../chunks/index2.js";
import { a as api, s as staggerIn } from "../../../../chunks/api.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
import { a as attr } from "../../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let reports = [];
    let total = 0;
    let loading = true;
    let error = "";
    let deleting = null;
    let tableRows = [];
    let searchTerm = "";
    let typeFilter = "";
    let startDate = "";
    let endDate = "";
    let currentPage = 1;
    let pageSize = 20;
    const reportTypes = [
      { value: "fotografico", label: "Fotográfico" },
      { value: "tecnico", label: "Técnico" },
      { value: "spda", label: "SPDA" },
      { value: "rdo", label: "RDO de Montagem" },
      { value: "gastos", label: "Gastos" },
      { value: "mesclado", label: "Mesclado" }
    ];
    async function loadReports() {
      loading = true;
      error = "";
      try {
        const params = new URLSearchParams();
        if (searchTerm) ;
        if (typeFilter) ;
        if (startDate) ;
        if (endDate) ;
        params.append("limit", pageSize.toString());
        params.append("offset", ((currentPage - 1) * pageSize).toString());
        const response = await api.get(`/reports${params.toString() ? `?${params}` : ""}`);
        reports = response.reports;
        total = response.total;
        setTimeout(
          () => {
            if (tableRows.length > 0) staggerIn(tableRows.filter(Boolean), { duration: 0.2, stagger: 0.03 });
          },
          100
        );
      } catch (err) {
        error = err instanceof Error ? err.message : "Erro ao carregar relatórios";
      } finally {
        loading = false;
      }
    }
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    function getTypeLabel(type) {
      return reportTypes.find((t) => t.value === type)?.label || type;
    }
    function getTypeColor(type) {
      const colors = {
        fotografico: "bg-green-500/20 text-green-400",
        tecnico: "bg-blue-500/20 text-blue-400",
        spda: "bg-yellow-500/20 text-yellow-400",
        rdo: "bg-purple-500/20 text-purple-400",
        gastos: "bg-orange-500/20 text-orange-400",
        mesclado: "bg-pink-500/20 text-pink-400"
      };
      return colors[type] || "bg-gray-500/20 text-gray-400";
    }
    function getTemplateLabel(template) {
      const labels = {
        nx_energy: "NX Energy",
        sercamp: "SERCAMP",
        merge: "Mesclagem"
      };
      return labels[template] || template;
    }
    function handleFilterChange() {
      currentPage = 1;
      loadReports();
    }
    function getTotalPages() {
      return Math.ceil(total / pageSize);
    }
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><h1 class="text-2xl font-bold text-theme-primary">Banco de Relatórios</h1> <div class="text-theme-muted text-sm">${escape_html(total)} relatório${escape_html(total !== 1 ? "s" : "")} encontrado${escape_html(total !== 1 ? "s" : "")}</div></div> <div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);"><div class="grid grid-cols-1 md:grid-cols-5 gap-4"><div><label for="search" class="block text-sm font-medium text-theme-secondary mb-1">Buscar</label> <input id="search" type="text"${attr("value", searchTerm)} placeholder="OS, cliente, arquivo..." class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div><label for="type" class="block text-sm font-medium text-theme-secondary mb-1">Tipo</label> `);
    $$renderer2.select(
      {
        id: "type",
        value: typeFilter,
        onchange: handleFilterChange,
        class: "w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(reportTypes);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let type = each_array[$$index];
          $$renderer3.option({ value: type.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(type.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div><label for="startDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Início</label> <input id="startDate" type="date"${attr("value", startDate)} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div><label for="endDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Fim</label> <input id="endDate" type="date"${attr("value", endDate)} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div class="flex items-end"><button class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Limpar Filtros</button></div></div></div> `);
    if (error) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg animate-fade-in">${escape_html(error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="rounded-lg overflow-hidden border" style="background-color: var(--bg-card); border-color: var(--border-color);">`);
    if (loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (reports.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="text-center py-12 text-theme-muted"><svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p>Nenhum relatório encontrado</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="overflow-x-auto"><table class="w-full"><thead style="background-color: var(--bg-tertiary);"><tr><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Tipo</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">OS</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Cliente</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Arquivo</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Template</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Tamanho</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Gerado por</th><th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Data</th><th class="px-4 py-3 text-right text-sm font-medium text-theme-secondary">Ações</th></tr></thead><tbody class="divide-y" style="border-color: var(--border-color);"><!--[-->`);
        const each_array_1 = ensure_array_like(reports);
        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
          let report = each_array_1[i];
          $$renderer2.push(`<tr class="transition-colors duration-200 hover:bg-theme-hover" style="opacity: 0;"><td class="px-4 py-3"><span${attr_class(`px-2 py-1 rounded-full text-xs font-medium ${stringify(getTypeColor(report.type))}`)}>${escape_html(getTypeLabel(report.type))}</span></td><td class="px-4 py-3 text-theme-primary font-medium">${escape_html(report.osNumber)}</td><td class="px-4 py-3 text-theme-secondary">${escape_html(report.clientName)}</td><td class="px-4 py-3 text-theme-secondary text-sm truncate max-w-[200px]"${attr("title", report.fileName)}>${escape_html(report.fileName)}</td><td class="px-4 py-3 text-theme-muted text-sm">${escape_html(getTemplateLabel(report.template))}</td><td class="px-4 py-3 text-theme-muted text-sm">${escape_html(formatFileSize(report.fileSize))}</td><td class="px-4 py-3 text-theme-muted text-sm">${escape_html(report.generatedBy?.name || "N/A")}</td><td class="px-4 py-3 text-theme-muted text-sm">${escape_html(formatDate(report.createdAt))}</td><td class="px-4 py-3"><div class="flex items-center justify-end gap-2"><button class="p-2 text-theme-muted hover:text-green-400 transition-colors" title="Download"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button> <button${attr("disabled", deleting === report.id, true)} class="p-2 text-theme-muted hover:text-red-400 transition-colors disabled:opacity-50" title="Excluir">`);
          if (deleting === report.id) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`);
          }
          $$renderer2.push(`<!--]--></button></div></td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div> `);
        if (getTotalPages() > 1) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center justify-between px-4 py-3" style="border-top: 1px solid var(--border-color);"><div class="text-sm text-theme-muted">Mostrando ${escape_html((currentPage - 1) * pageSize + 1)} a ${escape_html(Math.min(currentPage * pageSize, total))} de ${escape_html(total)}</div> <div class="flex items-center gap-2"><button${attr("disabled", currentPage === 1, true)} class="px-3 py-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Anterior</button> <span class="text-theme-muted">Página ${escape_html(currentPage)} de ${escape_html(getTotalPages())}</span> <button${attr("disabled", currentPage >= getTotalPages(), true)} class="px-3 py-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Próxima</button></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};

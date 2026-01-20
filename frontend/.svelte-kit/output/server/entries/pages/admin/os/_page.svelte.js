import { w as ensure_array_like, x as attr_class, z as stringify } from "../../../../chunks/index2.js";
import { a as api, s as staggerIn } from "../../../../chunks/api.js";
import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let serviceOrders = [];
    let loading = true;
    let error = "";
    let searchTerm = "";
    let statusFilter = "";
    let equipmentFilter = "";
    let tableRows = [];
    const equipmentTypes = [
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
      "SPDA"
    ];
    async function loadServiceOrders() {
      loading = true;
      error = "";
      try {
        const params = new URLSearchParams();
        if (searchTerm) ;
        if (statusFilter) ;
        if (equipmentFilter) ;
        const queryString = params.toString();
        serviceOrders = await api.get(`/admin/service-orders${queryString ? `?${queryString}` : ""}`);
        setTimeout(
          () => {
            if (tableRows.length > 0) staggerIn(tableRows.filter(Boolean), { duration: 0.3, stagger: 0.05 });
          },
          100
        );
      } catch (err) {
        error = err instanceof Error ? err.message : "Erro ao carregar ordens de serviço";
      } finally {
        loading = false;
      }
    }
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("pt-BR");
    }
    function getStatusColor(status) {
      return status === "ativa" ? "bg-green-500/20 text-green-400" : status === "concluida" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400";
    }
    function getStatusLabel(status) {
      return status === "ativa" ? "Ativa" : status === "concluida" ? "Concluída" : "Cancelada";
    }
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div class="flex items-center justify-between"><h1 class="text-2xl font-bold" style="color: var(--text-primary);">Ordens de Serviço</h1> <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:scale-[1.02]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Nova OS</button></div> <div class="rounded-lg p-4 transition-colors" style="background-color: var(--bg-card); border: 1px solid var(--border-color);"><div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Buscar</label> <input type="text"${attr("value", searchTerm)} placeholder="OS, cliente, líder..." class="w-full px-3 py-2 rounded-lg transition-colors admin-input svelte-9irudb" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div><label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Status</label> `);
    $$renderer2.select(
      {
        value: statusFilter,
        onchange: loadServiceOrders,
        class: "w-full px-3 py-2 rounded-lg transition-colors admin-input",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos`);
        });
        $$renderer3.option({ value: "ativa" }, ($$renderer4) => {
          $$renderer4.push(`Ativa`);
        });
        $$renderer3.option({ value: "concluida" }, ($$renderer4) => {
          $$renderer4.push(`Concluída`);
        });
        $$renderer3.option({ value: "cancelada" }, ($$renderer4) => {
          $$renderer4.push(`Cancelada`);
        });
      },
      "svelte-9irudb"
    );
    $$renderer2.push(`</div> <div><label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Equipamento</label> `);
    $$renderer2.select(
      {
        value: equipmentFilter,
        onchange: loadServiceOrders,
        class: "w-full px-3 py-2 rounded-lg transition-colors admin-input",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(equipmentTypes);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let type = each_array[$$index];
          $$renderer3.option({ value: type }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(type)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-9irudb"
    );
    $$renderer2.push(`</div> <div class="flex items-end"><button class="px-4 py-2 rounded-lg transition-all duration-200" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Limpar Filtros</button></div></div></div> `);
    if (error) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${escape_html(error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="rounded-lg overflow-hidden transition-colors" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">`);
    if (loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="relative"><div class="w-10 h-10 border-4 border-blue-500/30 rounded-full"></div><div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (serviceOrders.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="text-center py-12" style="color: var(--text-muted);"><svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg> <p>Nenhuma ordem de serviço encontrada</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="overflow-x-auto"><table class="w-full"><thead style="background-color: var(--bg-tertiary);"><tr><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">OS</th><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Cliente</th><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Equipamento</th><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Líder</th><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Período</th><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Status</th><th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Relatórios</th><th class="px-4 py-3 text-right text-sm font-medium" style="color: var(--text-secondary);">Ações</th></tr></thead><tbody><!--[-->`);
        const each_array_1 = ensure_array_like(serviceOrders);
        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
          let os = each_array_1[i];
          $$renderer2.push(`<tr class="transition-colors duration-200 admin-table-row svelte-9irudb" style="opacity: 0; border-bottom: 1px solid var(--border-color);"><td class="px-4 py-3 font-medium" style="color: var(--text-primary);">${escape_html(os.osNumber)}</td><td class="px-4 py-3" style="color: var(--text-secondary);">${escape_html(os.clientName)}</td><td class="px-4 py-3" style="color: var(--text-secondary);">${escape_html(os.equipmentType)}</td><td class="px-4 py-3" style="color: var(--text-secondary);">${escape_html(os.teamLeader)}</td><td class="px-4 py-3 text-sm" style="color: var(--text-secondary);">${escape_html(formatDate(os.periodStart))} - ${escape_html(formatDate(os.periodEnd))}</td><td class="px-4 py-3"><span${attr_class(`px-2 py-1 rounded-full text-xs font-medium ${stringify(getStatusColor(os.status))}`, "svelte-9irudb")}>${escape_html(getStatusLabel(os.status))}</span></td><td class="px-4 py-3" style="color: var(--text-secondary);">${escape_html(os._count?.reports || 0)}</td><td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-2"><button class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-blue-400" title="Editar"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button> <button class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-red-400" title="Excluir"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
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

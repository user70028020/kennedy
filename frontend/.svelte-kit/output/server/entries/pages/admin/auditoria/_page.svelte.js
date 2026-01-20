import { w as ensure_array_like } from "../../../../chunks/index2.js";
import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let total = 0;
    let users = [];
    let filterStartDate = "";
    let filterEndDate = "";
    let filterUserId = "";
    let filterAction = "";
    let filterResourceType = "";
    let currentPage = 1;
    let pageSize = 20;
    let totalPages = Math.ceil(total / pageSize);
    $$renderer2.push(`<div class="space-y-6" style="opacity: 0;"><div><h1 class="text-2xl font-bold text-theme-primary">Auditoria e Segurança</h1> <p class="text-theme-muted mt-1">Visualize todas as ações realizadas no sistema</p></div> <div class="rounded-lg p-4 border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"><div><label for="startDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Início</label> <input type="date" id="startDate"${attr("value", filterStartDate)} class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div><label for="endDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Fim</label> <input type="date" id="endDate"${attr("value", filterEndDate)} class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"/></div> <div><label for="userId" class="block text-sm font-medium text-theme-secondary mb-1">Usuário</label> `);
    $$renderer2.select(
      {
        id: "userId",
        value: filterUserId,
        class: "w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(users);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let user = each_array[$$index];
          $$renderer3.option({ value: user.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(user.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div><label for="action" class="block text-sm font-medium text-theme-secondary mb-1">Ação</label> `);
    $$renderer2.select(
      {
        id: "action",
        value: filterAction,
        class: "w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todas`);
        });
        $$renderer3.option({ value: "login" }, ($$renderer4) => {
          $$renderer4.push(`Login`);
        });
        $$renderer3.option({ value: "logout" }, ($$renderer4) => {
          $$renderer4.push(`Logout`);
        });
        $$renderer3.option({ value: "create" }, ($$renderer4) => {
          $$renderer4.push(`Criar`);
        });
        $$renderer3.option({ value: "update" }, ($$renderer4) => {
          $$renderer4.push(`Atualizar`);
        });
        $$renderer3.option({ value: "delete" }, ($$renderer4) => {
          $$renderer4.push(`Excluir`);
        });
        $$renderer3.option({ value: "download" }, ($$renderer4) => {
          $$renderer4.push(`Download`);
        });
        $$renderer3.option({ value: "generate" }, ($$renderer4) => {
          $$renderer4.push(`Gerar`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label for="resourceType" class="block text-sm font-medium text-theme-secondary mb-1">Tipo de Recurso</label> `);
    $$renderer2.select(
      {
        id: "resourceType",
        value: filterResourceType,
        class: "w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        style: "background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos`);
        });
        $$renderer3.option({ value: "user" }, ($$renderer4) => {
          $$renderer4.push(`Usuário`);
        });
        $$renderer3.option({ value: "report" }, ($$renderer4) => {
          $$renderer4.push(`Relatório`);
        });
        $$renderer3.option({ value: "template" }, ($$renderer4) => {
          $$renderer4.push(`Template`);
        });
        $$renderer3.option({ value: "service_order" }, ($$renderer4) => {
          $$renderer4.push(`Ordem de Serviço`);
        });
        $$renderer3.option({ value: "merge" }, ($$renderer4) => {
          $$renderer4.push(`Mesclagem`);
        });
      }
    );
    $$renderer2.push(`</div></div> <div class="flex justify-end gap-3 mt-4"><button class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Limpar Filtros</button> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Filtrar</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center justify-between text-sm text-theme-muted"><span>Total de registros: ${escape_html(total)}</span> <span>Página ${escape_html(currentPage)} de ${escape_html(totalPages || 1)}</span></div> <div class="rounded-lg overflow-hidden border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-8 text-center"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div> <p class="text-theme-muted">Carregando logs...</p></div>`);
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

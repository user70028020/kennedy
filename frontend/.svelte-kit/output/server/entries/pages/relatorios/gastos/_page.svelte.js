import { w as ensure_array_like, z as stringify } from "../../../../chunks/index2.js";
import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const EXPENSE_CATEGORIES = [
      { id: "alimentacao", name: "Alimentação" },
      { id: "hospedagem", name: "Hospedagem" },
      { id: "transporte", name: "Transporte" },
      { id: "combustivel", name: "Combustível" },
      { id: "pedagio", name: "Pedágio" },
      { id: "estacionamento", name: "Estacionamento" },
      { id: "material", name: "Material" },
      { id: "ferramenta", name: "Ferramenta" },
      { id: "outros", name: "Outros" }
    ];
    let template = "nx_energy";
    let osNumber = "";
    let clientName = "";
    let reportDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let responsible = "";
    let location = "";
    let periodoInicio = "";
    let periodoFim = "";
    let expenses = [createEmptyExpense()];
    let observations = "";
    let loading = false;
    let searchingOS = false;
    createEmptyExpense();
    function generateId() {
      return `expense_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    function createEmptyExpense() {
      return {
        id: generateId(),
        descricao: "",
        categoria: "alimentacao",
        valor: 0,
        data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        comprovante: null
      };
    }
    const totalGastos = () => {
      return expenses.reduce((sum, exp) => sum + (exp.valor || 0), 0);
    };
    function formatCurrency(value) {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    }
    function updateExpense(id, field, value) {
      expenses = expenses.map((e) => e.id === id ? { ...e, [field]: value } : e);
    }
    $$renderer2.push(`<div class="max-w-5xl mx-auto animate-in"><div class="modern-card"><div class="modern-card-header"><div class="modern-card-title"><div class="modern-card-title-icon" style="background: var(--gradient-success);"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div> Relatório de Gastos</div> <div class="text-sm" style="color: var(--text-muted);">Prestação de Contas</div></div> <form class="space-y-8"><section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Template</h3> <div class="radio-group"><label class="radio-label"><input type="radio"${attr("checked", template === "nx_energy", true)} value="nx_energy" class="modern-radio"/> <span style="color: var(--text-primary);">NX Energy</span></label> <label class="radio-label"><input type="radio"${attr("checked", template === "sercamp", true)} value="sercamp" class="modern-radio"/> <span style="color: var(--text-primary);">SERCAMP</span></label></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Informações Gerais</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-5"><div class="form-group"><label for="osNumber" class="modern-label modern-label-required">Número da OS</label> <div class="flex gap-2"><input id="osNumber" type="text"${attr("value", osNumber)} required class="modern-input flex-1" placeholder="Ex: OS-2024-001"/> <button type="button"${attr("disabled", searchingOS, true)} class="btn-modern btn-modern-secondary px-3" title="Buscar OS">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></button></div></div> <div class="form-group"><label for="clientName" class="modern-label modern-label-required">Cliente</label> <input id="clientName" type="text"${attr("value", clientName)} required class="modern-input" placeholder="Nome do cliente"/></div> <div class="form-group"><label for="reportDate" class="modern-label">Data do Relatório</label> <input id="reportDate" type="date"${attr("value", reportDate)} class="modern-input"/></div> <div class="form-group"><label for="responsible" class="modern-label">Responsável</label> <input id="responsible" type="text"${attr("value", responsible)} class="modern-input" placeholder="Nome do responsável"/></div> <div class="form-group"><label for="location" class="modern-label">Local</label> <input id="location" type="text"${attr("value", location)} class="modern-input" placeholder="Local do serviço"/></div> <div class="form-group"><label for="periodoInicio" class="modern-label">Período Início</label> <input id="periodoInicio" type="date"${attr("value", periodoInicio)} class="modern-input"/></div> <div class="form-group"><label for="periodoFim" class="modern-label">Período Fim</label> <input id="periodoFim" type="date"${attr("value", periodoFim)} class="modern-input"/></div></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Prestação de Contas</h3> <div class="space-y-4"><!--[-->`);
    const each_array = ensure_array_like(expenses);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let expense = each_array[$$index_1];
      $$renderer2.push(`<div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"><div class="flex justify-between items-start mb-4"><span class="text-sm font-semibold" style="color: var(--text-secondary);">Item de Gasto</span> `);
      if (expenses.length > 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button type="button" class="p-1.5 rounded-lg transition-colors" style="color: var(--color-danger);" title="Remover item"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"><div class="form-group md:col-span-2"><label${attr("for", `expense-desc-${stringify(expense.id)}`)} class="modern-label modern-label-required">Descrição</label> <input${attr("id", `expense-desc-${stringify(expense.id)}`)} type="text"${attr("value", expense.descricao)} class="modern-input" placeholder="Descrição do gasto"/></div> <div class="form-group"><label${attr("for", `expense-cat-${stringify(expense.id)}`)} class="modern-label">Categoria</label> `);
      $$renderer2.select(
        {
          id: `expense-cat-${stringify(expense.id)}`,
          value: expense.categoria,
          onchange: (e) => updateExpense(expense.id, "categoria", e.currentTarget.value),
          class: "modern-select"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(EXPENSE_CATEGORIES);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let cat = each_array_1[$$index];
            $$renderer3.option({ value: cat.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(cat.name)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <div class="form-group"><label${attr("for", `expense-valor-${stringify(expense.id)}`)} class="modern-label modern-label-required">Valor (R$)</label> <input${attr("id", `expense-valor-${stringify(expense.id)}`)} type="number" step="0.01" min="0"${attr("value", expense.valor)} class="modern-input" placeholder="0,00"/></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="form-group"><label${attr("for", `expense-data-${stringify(expense.id)}`)} class="modern-label">Data do Gasto</label> <input${attr("id", `expense-data-${stringify(expense.id)}`)} type="date"${attr("value", expense.data)} class="modern-input"/></div> <div class="form-group"><span class="modern-label">Comprovante/Nota Fiscal</span> <div class="flex items-center gap-2">`);
      if (expense.comprovante) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex items-center gap-2 flex-1 p-2 rounded-lg" style="background-color: var(--bg-tertiary);"><img${attr("src", expense.comprovante.data)} alt="Comprovante" class="w-10 h-10 object-cover rounded-lg"/> <span class="text-sm truncate flex-1" style="color: var(--text-secondary);">${escape_html(expense.comprovante.name)}</span> <button type="button" class="p-1.5 rounded-lg transition-colors" style="color: var(--color-danger);" title="Remover comprovante"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<label class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200" style="background-color: var(--bg-tertiary); border: 2px dashed var(--border-color); color: var(--text-muted);"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> <span class="text-sm">Anexar comprovante</span> <input type="file" accept="image/*" class="hidden"/></label>`);
      }
      $$renderer2.push(`<!--]--></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="w-full py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" style="border: 2px dashed var(--border-color); color: var(--text-muted); background-color: transparent;"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Adicionar Item de Gasto</button></div> <div class="mt-6 p-4 rounded-xl flex justify-between items-center" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.3);"><span class="text-lg font-medium" style="color: var(--text-secondary);">Total de Gastos:</span> <span class="text-2xl font-bold" style="color: var(--color-success);">${escape_html(formatCurrency(totalGastos()))}</span></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Observações</h3> <textarea rows="4" class="modern-textarea" placeholder="Observações gerais sobre os gastos...">`);
    const $$body = escape_html(observations);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex flex-col sm:flex-row gap-3 pt-4"><button type="submit"${attr("disabled", loading, true)} class="btn-modern btn-modern-primary flex-1 py-3.5">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> <span>Gerar Relatório de Gastos</span>`);
    }
    $$renderer2.push(`<!--]--></button> <button type="button"${attr("disabled", loading, true)} class="btn-modern btn-modern-secondary py-3.5 sm:w-auto"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> <span>Limpar</span></button></div></form></div></div>`);
  });
}
export {
  _page as default
};

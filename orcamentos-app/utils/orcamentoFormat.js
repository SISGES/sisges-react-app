/** Utilitários de orçamento — nome explícito para evitar conflito com outros `format` no Snack. */

export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function calcularTotalOrcamento(orcamento) {
  const itens = orcamento?.itens ?? [];
  const subtotal = itens.reduce(
    (acc, i) => acc + (i.quantidade ?? 0) * (i.precoUnitario ?? 0),
    0
  );
  const desconto = orcamento?.percentualDesconto
    ? subtotal * (orcamento.percentualDesconto / 100)
    : 0;
  return { subtotal, desconto, total: subtotal - desconto };
}

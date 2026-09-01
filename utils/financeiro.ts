export function getStatusCobranca(cobranca: {
  status?: string;
  vencimento?: string | null;
}): { texto: string; cor: string } {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeString = hoje.toISOString().slice(0, 10);

  if (cobranca.status === 'pago') {
    return { texto: 'Pago', cor: '#22c55e' };
  }

  if (cobranca.vencimento && cobranca.vencimento < hojeString) {
    return { texto: 'Atrasado', cor: '#ef4444' };
  }

  if (cobranca.vencimento && cobranca.vencimento === hojeString) {
    return { texto: 'Vence hoje', cor: '#eab308' };
  }

  return { texto: 'Pendente', cor: '#eab308' };
}

export type Cobranca = {
  id: string;

  alunoId: string;
  nomeAluno: string;

  valor: number;

  mes: number;
  ano: number;

  status: "pendente" | "pago" | "atrasado";

  dataVencimento: string;
  dataPagamento?: string;

  criadoEm: string;
};

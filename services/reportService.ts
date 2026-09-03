import { Aluno, Cobranca } from "@/components/context/DojoContext";

export interface Pagamento {
  data: string;
  aluno: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
}

export interface ResumoPeriodo {
  total: number;
  quantidade: number;
  pagamentos: Pagamento[];
}

export interface ResumoMensal {
  mes: string;
  total: number;
  quantidade: number;
}

export interface ResumoAnual {
  ano: string;
  total: number;
  quantidade: number;
  porMes: ResumoMensal[];
  pagamentos: Pagamento[];
}

export interface Option {
  value: string;
  label: string;
}

function competenciaDe(data: string | undefined | null): string | null {
  if (!data || typeof data !== "string") return null;
  const partes = data.split("-");
  if (partes.length < 2) return null;
  return `${partes[0]}-${partes[1]}`;
}

function extrairAno(data: string | undefined | null): string | null {
  if (!data || typeof data !== "string") return null;
  const partes = data.split("-");
  if (partes.length < 1) return null;
  return partes[0];
}

export function formatarData(data: string | undefined): string {
  if (!data) return "";
  const partes = data.split("T")[0].split("-");
  if (partes.length < 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function formatarValor(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function formatarMesLabel(mes: string): string {
  const partes = mes.split("-");
  const mesNum = parseInt(partes[1], 10);
  const ano = partes[0];
  return `${NOMES_MESES[mesNum - 1]} ${ano}`;
}

function cobrancaParaPagamento(cobranca: Cobranca, aluno: Aluno): Pagamento {
  return {
    data: cobranca.pagoEm || "",
    aluno: aluno.nome,
    descricao: cobranca.descricao || "Mensalidade",
    valor: cobranca.valor || 0,
    formaPagamento: cobranca.formaPagamento || "Não informado",
  };
}

export function generateMonthOptions(): Option[] {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const opcoes: Option[] = [];

  for (let i = 0; i < 24; i++) {
    const d = new Date(anoAtual, mesAtual - i, 1);
    const ano = d.getFullYear();
    const mes = d.getMonth() + 1;
    const value = `${ano}-${String(mes).padStart(2, "0")}`;
    const label = `${String(mes).padStart(2, "0")}/${ano}`;
    opcoes.push({ value, label });
  }

  return opcoes;
}

export function generateYearOptions(): Option[] {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const opcoes: Option[] = [];

  for (let i = 0; i < 5; i++) {
    const ano = anoAtual - i;
    opcoes.push({ value: String(ano), label: String(ano) });
  }

  return opcoes;
}

export function filtrarPagamentos(alunos: Aluno[]): Pagamento[] {
  const pagamentos: Pagamento[] = [];

  for (const aluno of alunos) {
    for (const cobranca of aluno.cobrancas) {
      if (cobranca.status === "pago" && cobranca.pagoEm) {
        pagamentos.push(cobrancaParaPagamento(cobranca, aluno));
      }
    }
  }

  return pagamentos.sort((a, b) => b.data.localeCompare(a.data));
}

export function filtrarPorMes(pagamentos: Pagamento[], competencia: string): Pagamento[] {
  return pagamentos.filter((p) => competenciaDe(p.data) === competencia);
}

export function filtrarPorAno(pagamentos: Pagamento[], ano: string): Pagamento[] {
  return pagamentos.filter((p) => extrairAno(p.data) === ano);
}

export function calcularResumo(pagamentos: Pagamento[]): ResumoPeriodo {
  const total = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  return {
    total,
    quantidade: pagamentos.length,
    pagamentos,
  };
}

export function calcularResumoAnual(pagamentos: Pagamento[], ano: string): ResumoAnual {
  const porMes: ResumoMensal[] = [];

  for (let mes = 1; mes <= 12; mes++) {
    const mesStr = `${ano}-${String(mes).padStart(2, "0")}`;
    const pagamentosMes = filtrarPorMes(pagamentos, mesStr);
    if (pagamentosMes.length > 0) {
      const total = pagamentosMes.reduce((sum, p) => sum + p.valor, 0);
      porMes.push({
        mes: mesStr,
        total,
        quantidade: pagamentosMes.length,
      });
    }
  }

  const total = pagamentos.reduce((sum, p) => sum + p.valor, 0);

  return {
    ano,
    total,
    quantidade: pagamentos.length,
    porMes,
    pagamentos,
  };
}

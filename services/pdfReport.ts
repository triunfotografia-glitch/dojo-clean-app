import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Aluno } from "@/components/context/DojoContext";
import {
  Pagamento,
  ResumoPeriodo,
  ResumoAnual,
  Option,
  calcularResumo,
  calcularResumoAnual,
  filtrarPagamentos,
  filtrarPorAno,
  filtrarPorMes,
  formatarData,
  formatarMesLabel,
  formatarValor,
  generateMonthOptions,
  generateYearOptions,
} from "@/services/reportService";

const PRIMARY = "#D90429";
const BACKGROUND = "#FFFFFF";
const CARD = "#F8F9FA";
const BORDER = "#E0E0E0";
const TEXT = "#333333";
const MUTED = "#888888";
const SUCCESS = "#16A34A";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function headerHtml(titulo: string, subtitulo: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page { margin: 20mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; color: ${TEXT}; background: ${BACKGROUND}; }
    .header { text-align: center; border-bottom: 3px solid ${PRIMARY}; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { color: ${PRIMARY}; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 2px; }
    .header h2 { color: ${MUTED}; font-size: 13px; margin: 6px 0 0; text-transform: uppercase; }
    .periodo { text-align: center; color: ${MUTED}; font-size: 15px; margin-bottom: 20px; font-weight: 600; }
    .summary { display: flex; justify-content: space-around; margin: 20px 0; gap: 12px; }
    .summary-item { flex: 1; text-align: center; background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px 12px; }
    .summary-item .label { font-size: 12px; color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-item .value { font-size: 22px; font-weight: 700; margin-top: 6px; color: ${PRIMARY}; }
    .summary-item .value-success { color: ${SUCCESS}; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: ${PRIMARY}; color: white; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 14px; border-bottom: 1px solid ${BORDER}; font-size: 11px; }
    tr:hover td { background: ${CARD}; }
    .total-row td { font-weight: 700; background: ${CARD}; }
    .total-label { color: ${PRIMARY}; }
    .total-value { text-align: right; color: ${PRIMARY}; }
    .footer { text-align: center; margin-top: 30px; color: ${MUTED}; font-size: 10px; border-top: 1px solid ${BORDER}; padding-top: 12px; }
    .page-break { page-break-before: always; }
    .section-title { color: ${PRIMARY}; font-size: 16px; font-weight: 700; margin: 24px 0 12px; border-bottom: 1px solid ${BORDER}; padding-bottom: 6px; }
    .month-row td { font-weight: 500; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MEU DOJO</h1>
    <h2>Relatório de Recebimentos</h2>
  </div>
  <div class="periodo">${titulo}</div>
  <div class="periodo">${subtitulo}</div>
`;
}

function footerHtml(): string {
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  return `
  <div class="footer">
    Relatório gerado em ${dataAtual} &middot; MEU DOJO
  </div>
</body>
</html>
`;
}

function generateMonthlyHtml(resumo: ResumoPeriodo, competencia: string, label: string): string {
  const header = headerHtml(
    "Relatório Mensal de Recebimentos",
    `Referência: ${label}`
  );

  const rows = resumo.pagamentos
    .map(
      (p) => `
      <tr>
        <td>${formatarData(p.data)}</td>
        <td>${escapeHtml(p.aluno)}</td>
        <td>${escapeHtml(p.descricao)}</td>
        <td>${escapeHtml(p.formaPagamento)}</td>
        <td style="text-align: right;">${formatarValor(p.valor)}</td>
      </tr>`
    )
    .join("");

  const hasRows = resumo.pagamentos.length > 0;

  return `
${header}
  <div class="summary">
    <div class="summary-item">
      <div class="label">Total Recebido</div>
      <div class="value">${formatarValor(resumo.total)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Pagamentos</div>
      <div class="value value-success">${resumo.quantidade}</div>
    </div>
  </div>

  ${hasRows ? `
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Aluno</th>
        <th>Descrição</th>
        <th>Forma</th>
        <th style="text-align: right;">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="4" class="total-label">TOTAL DO MÊS</td>
        <td class="total-value">${formatarValor(resumo.total)}</td>
      </tr>
    </tbody>
  </table>
  ` : `
  <p style="color: ${MUTED}; text-align: center; margin-top: 40px; font-size: 14px;">
    Nenhum pagamento registrado para este período.
  </p>
  `}

${footerHtml()}
`;
}

function generateAnnualHtml(resumoAnual: ResumoAnual): string {
  const header = headerHtml(
    "Relatório Anual de Recebimentos",
    `Referência: ${resumoAnual.ano}`
  );

  const monthRows = resumoAnual.porMes
    .map((m) => {
      const label = formatarMesLabel(m.mes);
      const mesNum = m.mes.split("-")[1];
      const mesCurto = `${String(mesNum).padStart(2, "0")}/${m.mes.split("-")[0]}`;
      return `
      <tr class="month-row">
        <td>${mesCurto}</td>
        <td>${m.quantidade}</td>
        <td style="text-align: right;">${formatarValor(m.total)}</td>
      </tr>`;
    })
    .join("");

  const detailRows = resumoAnual.pagamentos
    .map(
      (p) => `
      <tr>
        <td>${formatarData(p.data)}</td>
        <td>${escapeHtml(p.aluno)}</td>
        <td>${escapeHtml(p.descricao)}</td>
        <td>${escapeHtml(p.formaPagamento)}</td>
        <td style="text-align: right;">${formatarValor(p.valor)}</td>
      </tr>`
    )
    .join("");

  const hasMonthData = resumoAnual.porMes.length > 0;
  const hasDetailData = resumoAnual.pagamentos.length > 0;

  return `
${header}
  <div class="summary">
    <div class="summary-item">
      <div class="label">Total Recebido no Ano</div>
      <div class="value">${formatarValor(resumoAnual.total)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Pagamentos</div>
      <div class="value value-success">${resumoAnual.quantidade}</div>
    </div>
  </div>

  ${hasMonthData ? `
  <div class="section-title">Resumo por Mês</div>
  <table>
    <thead>
      <tr>
        <th>Mês</th>
        <th style="text-align: center;">Qtd.</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${monthRows}
      <tr class="total-row">
        <td colspan="2" class="total-label">TOTAL ANUAL</td>
        <td class="total-value">${formatarValor(resumoAnual.total)}</td>
      </tr>
    </tbody>
  </table>
  ` : `
  <p style="color: ${MUTED}; text-align: center; margin-top: 40px; font-size: 14px;">
    Nenhum pagamento registrado para este ano.
  </p>
  `}

  ${hasDetailData ? `
  <div class="section-title">Detalhamento de Pagamentos</div>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Aluno</th>
        <th>Descrição</th>
        <th>Forma</th>
        <th style="text-align: right;">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${detailRows}
    </tbody>
  </table>
  ` : ""}

${footerHtml()}
`;
}

async function gerarPdf(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

async function compartilharPdf(uri: string, filename: string): Promise<void> {
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: filename,
    UTI: "public.pdf",
  });
}

export async function gerarRelatorioMensal(
  alunos: Aluno[],
  competencia: string
): Promise<{ total: number; quantidade: number }> {
  const label = formatarMesLabel(competencia);

  const pagamentos = filtrarPagamentos(alunos);
  const pagamentosFiltrados = filtrarPorMes(pagamentos, competencia);
  const resumo = calcularResumo(pagamentosFiltrados);

  const html = generateMonthlyHtml(resumo, competencia, label);
  const filename = `receitas-${competencia}.pdf`;
  const uri = await gerarPdf(html);
  await compartilharPdf(uri, filename);

  return { total: resumo.total, quantidade: resumo.quantidade };
}

export async function gerarRelatorioAnual(
  alunos: Aluno[],
  ano: string
): Promise<{ total: number; quantidade: number }> {
  const pagamentos = filtrarPagamentos(alunos);
  const pagamentosFiltrados = filtrarPorAno(pagamentos, ano);
  const resumoAnual = calcularResumoAnual(pagamentosFiltrados, ano);

  const html = generateAnnualHtml(resumoAnual);
  const filename = `receitas-${ano}.pdf`;
  const uri = await gerarPdf(html);
  await compartilharPdf(uri, filename);

  return { total: resumoAnual.total, quantidade: resumoAnual.quantidade };
}

export {
  generateMonthOptions as getMonthOptions,
  generateYearOptions as getYearOptions,
};
export type { Option };

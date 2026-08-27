import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CAMPEONATOS_FILE = path.join(__dirname, '..', 'data', 'campeonatos.json');

function loadCampeonatos() {
  try {
    const raw = fs.readFileSync(CAMPEONATOS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao carregar campeonatos:', error);
    return [];
  }
}

function normalizarEvento(evento) {
  return {
    id: String(evento.id || evento.nome + evento.dataInicio),
    nome: String(evento.nome || ''),
    dataInicio: String(evento.dataInicio || ''),
    dataFim: String(evento.dataFim || evento.dataInicio || ''),
    cidade: String(evento.cidade || ''),
    estado: String(evento.estado || '').toUpperCase(),
    local: String(evento.local || ''),
    organizacao: String(evento.organizacao || ''),
    url: String(evento.url || ''),
    fonte: String(evento.fonte || ''),
  };
}

function isJiuJitsu(nome) {
  const lower = nome.toLowerCase();
  return (
    lower.includes('jiu-jitsu') ||
    lower.includes('jiu jitsu') ||
    lower.includes('bjj') ||
    lower.includes('jiujitsu')
  );
}

function isFuture(dataInicio) {
  if (!dataInicio) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const eventoDate = new Date(dataInicio + 'T00:00:00');
  return eventoDate >= hoje;
}

const CIDADES_EXCLUIDAS = new Set([
  'SÃO JOSÉ DOS CAMPOS',
  'SOROCABA',
  'CAMPINAS',
  'CAJAMAR',
  'SANTOS',
]);

const CIDADES_PERMITIDAS = new Set([
  'SÃO PAULO',
  'SANTO ANDRÉ',
  'SÃO BERNARDO DO CAMPO',
  'SÃO CAETANO DO SUL',
  'DIADEMA',
  'JUNDIAÍ',
  'BARUERI',
  'OSASCO',
  'GUARULHOS',
  'MOGI DAS CRUZES',
  'COTIA',
  'TABOÃO DA SERRA',
  'CARAPICUÍBA',
  'EMBU DAS ARTES',
  'FERRAZ DE VASCONCELOS',
  'FRANCISCO MORATO',
  'FRANCO DA ROCHA',
  'GUARAREMA',
  'ITAQUECERICA DA SERRA',
  'ITAPEVI',
  'JANDIRA',
  'MAIRIPORÃ',
  'MAUÁ',
  'POÁ',
  'RIBEIRÃO PIRES',
  'RIO GRANDE DA SERRA',
  'SANTA ISABEL',
  'SANTANA DE PARNAÍBA',
  'SÃO LOURENÇO DA SERRA',
  'SUZANO',
  'VARGEM GRANDE PAULISTA',
  'VÁRZEA PAULISTA',
  'VINHEDO',
  'VOTORANTIM',
]);

function isCidadePermitida(cidade) {
  const upper = String(cidade || '').toUpperCase().trim();
  if (CIDADES_EXCLUIDAS.has(upper)) return false;
  if (CIDADES_PERMITIDAS.has(upper)) return true;
  return false;
}

function dedupEventos(eventos) {
  const seen = new Set();
  return eventos.filter((evento) => {
    const key = evento.url || `${evento.nome}-${evento.dataInicio}-${evento.cidade}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getProximosCampeonatos() {
  const rawEventos = loadCampeonatos();

  const normalizados = rawEventos
    .map(normalizarEvento)
    .filter((evento) => evento.estado === 'SP')
    .filter((evento) => isJiuJitsu(evento.nome))
    .filter((evento) => isFuture(evento.dataInicio))
    .filter((evento) => isCidadePermitida(evento.cidade))
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));

  const dedup = dedupEventos(normalizados);

  return dedup.slice(0, 3);
}

import { COLORS } from '@/components/Colors';
import { Aluno, Cobranca, useDojo } from '@/components/context/DojoContext';
import { enviarCobrancasWhatsApp } from '@/components/whatsapp';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

function competenciaAtual() {
  return new Date().toISOString().slice(0, 7);
}

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data: string) {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function getStatusAluno(aluno: Aluno): { texto: string, cor: string } {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const hojeString = hoje.toISOString().slice(0, 10);

  const cobrancasAtrasadas = aluno.cobrancas.find(c => c.status !== 'pago' && c.vencimento < hojeString);
  if (cobrancasAtrasadas) {
    return { texto: 'Atrasado', cor: '#ef4444' };
  }

  const cobrancaVenceHoje = aluno.cobrancas.find(c => c.status !== 'pago' && c.vencimento === hojeString);
  if (cobrancaVenceHoje) {
    return { texto: 'Vence hoje', cor: '#eab308' };
  }

  return { texto: 'Em dia', cor: '#22c55e' };
}

export default function Financeiro() {
  const { alunos, executarCobrancasAutomaticas, registrarPagamento } = useDojo();
  const [competencia, setCompetencia] = useState(competenciaAtual());
  const [mensagemPadrao, setMensagemPadrao] = useState(
    'Olá {{nome}}, sua mensalidade no valor de R$ {{valor}} vence em {{data}}.'
  );
  const [mostrarEditorMensagem, setMostrarEditorMensagem] = useState(false);

  const resumo = useMemo(() => {
    const cobrancas = alunos.flatMap((aluno) => aluno.cobrancas.map((cobranca) => ({ ...cobranca, aluno })));
    const recebidos = cobrancas.filter((cobranca) => cobranca.pagoEm?.startsWith(competencia)).reduce((total, cobranca) => total + cobranca.valor, 0);
    const pendentes = cobrancas.filter((cobranca) => !cobranca.pagoEm);
    const emAberto = pendentes.reduce((total, cobranca) => total + cobranca.valor, 0);
    const atrasadas = pendentes.filter((cobranca) => new Date(cobranca.vencimento) < new Date(new Date().setHours(0, 0, 0, 0)));
    return { recebidos, emAberto, atrasadas, pendentes };
  }, [alunos, competencia]);

  function confirmarGeracao() {
    Alert.alert(
      'Gerar mensalidades',
      `Deseja executar a rotina de cobranças automáticas? O sistema irá gerar mensalidades para alunos ativos cuja data de próxima cobrança já passou.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
  text: 'Gerar agora',
  onPress: async () => {
    const quantidade =
      await executarCobrancasAutomaticas();

    if (quantidade > 0) {
      Alert.alert(
        'Mensalidades geradas',
        `${quantidade} cobrança(s) criada(s) com sucesso.`
      );
    } else {
      Alert.alert(
        'Nenhuma cobrança gerada',
        'Todos os alunos ativos estão com as cobranças em dia.'
      );
    }
  },
},
      ],
    );
  }

  function enviarPendentesWhatsApp() {
    if (resumo.pendentes.length === 0) {
      Alert.alert('Nenhuma cobrança pendente', 'Não há cobranças pendentes para enviar no momento.');
      return;
    }

    enviarCobrancasWhatsApp(
      resumo.pendentes.map((cobranca) => ({
        nome: cobranca.aluno.nome,
        telefone: cobranca.aluno.telefone,
        valor: moeda(cobranca.valor),
        data: formatarData(cobranca.vencimento),
      })),
      mensagemPadrao
    );
  }

  function confirmarPagamento(aluno: Aluno, cobranca: Cobranca) {
    Alert.alert(
      'Confirmar pagamento',
      `Registrar ${moeda(cobranca.valor)} como pago para ${aluno.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            registrarPagamento(
              aluno.id,
              cobranca.id,
              new Date().toISOString().slice(0, 10),
              'Manual'
            );
          },
        },
      ]
    );
  }

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Financeiro</Text>
    <Text style={styles.subtitle}>Resumo de {competencia}</Text>

    <View style={styles.grid}>
      <View style={styles.card}><Text style={styles.label}>Recebido no mês</Text><Text style={styles.received}>{moeda(resumo.recebidos)}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Em aberto</Text><Text style={styles.value}>{moeda(resumo.emAberto)}</Text></View>
      <View style={[styles.card, resumo.atrasadas.length > 0 && styles.overdueCard]}><Text style={styles.label}>Em atraso</Text><Text style={styles.overdue}>{resumo.atrasadas.length} cobrança(s)</Text></View>
      <View style={styles.card}><Text style={styles.label}>Pendentes</Text><Text style={styles.value}>{resumo.pendentes.length} cobrança(s)</Text></View>
    </View>

    <View style={styles.generationContainer}>
      <Pressable style={styles.generateButton} onPress={confirmarGeracao}>
        <Text style={styles.buttonText}>Executar Cobranças Automáticas</Text>
      </Pressable>
      <Pressable style={[styles.generateButton, styles.whatsappButton]} onPress={enviarPendentesWhatsApp}>
        <Text style={styles.buttonText}>Enviar pendentes por WhatsApp</Text>
      </Pressable>
      <Pressable style={[styles.generateButton, styles.configButton]} onPress={() => setMostrarEditorMensagem(!mostrarEditorMensagem)}>
        <Text style={styles.buttonText}>
          {mostrarEditorMensagem ? 'Fechar configuração' : 'Configurar mensagem de envio'}
        </Text>
      </Pressable>
      {mostrarEditorMensagem ? (
        <View style={styles.messageEditor}>
          <Text style={styles.label}>Modelo de mensagem</Text>
          <Text style={styles.helper}>
            {'Use {{nome}}, {{valor}} e {{data}} para personalizar cada cobrança.'}
          </Text>
          <TextInput
            style={styles.messageInput}
            multiline
            numberOfLines={4}
            value={mensagemPadrao}
            onChangeText={setMensagemPadrao}
          />
        </View>
      ) : null}
      <Text style={styles.helper}>A geração usa o valor e o dia de vencimento definidos no cadastro de cada aluno, sem duplicar cobranças do mesmo mês.</Text>
    </View>

    <Text style={styles.sectionTitle}>Situação dos Alunos</Text>
    {alunos.filter(a => a.ativo).length === 0 ? (
      <Text style={styles.empty}>Nenhum aluno ativo cadastrado.</Text>
    ) : (
      alunos.filter(a => a.ativo).sort((a, b) => a.nome.localeCompare(b.nome)).map((aluno) => {
        const status = getStatusAluno(aluno);
        const cobrancaPendente = aluno.cobrancas.find(c => c.status === 'pendente' || c.status === 'atrasado');
        return (
        <Pressable key={aluno.id} style={styles.studentCard} onPress={() => router.push({ pathname: '/aluno/financeiro/[id]', params: { id: aluno.id } })}>
          <View style={{ flex: 1 }}>
            <View style={styles.statusContainer}><View style={[styles.statusIndicator, { backgroundColor: status.cor }]} /><Text style={[styles.statusText, { color: status.cor }]}>{status.texto}</Text></View>
            <Text style={styles.studentName} numberOfLines={1}>{aluno.nome}</Text>
            <Text style={styles.studentInfo}>Próxima cobrança: {formatarData(aluno.proximaCobranca)}</Text>
          </View>
          {cobrancaPendente && (<Pressable style={styles.payButton} onPress={() => confirmarPagamento(aluno, cobrancaPendente)}><Text style={styles.payButtonText}>Registrar Pagamento</Text></Pressable>)}
        </Pressable>
        )
      })
    )}
  </ScrollView>;
}


const styles = StyleSheet.create({

  container:{
    backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70
  },
  title: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: COLORS.muted, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, padding: 15, width: '48%' },
  overdueCard: { borderColor: '#E5484D' },
  label: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  value: { color: COLORS.white, fontSize: 19, fontWeight: 'bold', marginTop: 8 },
  received: { color: '#37D67A', fontSize: 19, fontWeight: 'bold', marginTop: 8 },
  overdue: { color: '#FF6B6B', fontSize: 19, fontWeight: 'bold', marginTop: 8 },
  generationContainer: { marginTop: 22 },
  input: { backgroundColor: COLORS.card, color: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, padding: 15, marginBottom: 10 },
  generateButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 14, padding: 16 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  whatsappButton: { marginTop: 10, backgroundColor: '#128C7E' },
  configButton: { marginTop: 10, backgroundColor: '#2563EB' },
  messageEditor: { marginTop: 15, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 15, padding: 15 },
  messageInput: { backgroundColor: COLORS.background, color: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginTop: 10, textAlignVertical: 'top' },
  helper: { color: COLORS.muted, lineHeight: 20, marginTop: 12, fontSize: 12 },
  sectionTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginTop: 30, marginBottom: 12 },
  empty: { color: COLORS.muted },
  studentCard: { alignItems: 'center', backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 13, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 15, gap: 10 },
  studentName: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  studentInfo: { color: COLORS.textSecondary, marginTop: 5 },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  payButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
});
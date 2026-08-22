import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { StatusPresenca, usePresencas } from '@/components/context/PresencaContext';
import { useTreinos } from '@/components/context/TreinoContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const hoje = new Date().toISOString().slice(0, 10);
const opcoes: { status: StatusPresenca; texto: string }[] = [
  { status: 'presente', texto: 'Presente' },
  { status: 'falta', texto: 'Falta' },
  { status: 'justificado', texto: 'Justificado' },
];

function normalizarData(data: string): string {
  if (!data) return '';

  const valor = String(data).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const date = new Date(valor);

  if (isNaN(date.getTime())) {
    return valor;
  }

  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export default function PresencaTreino() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { treinos } = useTreinos();
  const { turmas } = useTurmas();
  const { alunos } = useDojo();
  const { presencas, registrarPresenca, editarPresenca, excluirPresenca, carregarPresencasPorTreino } = usePresencas();
  const treino = treinos.find((item) => item.id === id);
  const turma = turmas.find((item) => item.id === treino?.turmaId || item.nome.trim().toLowerCase() === treino?.turma.trim().toLowerCase());
  const alunosDaTurma = alunos.filter((aluno) => {
    const associadoNaTurma = turma?.alunoIds.includes(aluno.id);
    const turmaDoAluno = aluno.turma.trim().toLowerCase() === treino?.turma.trim().toLowerCase();
    return aluno.ativo && (associadoNaTurma || turmaDoAluno);
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const totalAlunos = alunosDaTurma.length;
  const presentes = presencas.filter((item) => normalizarData(item.data) === hoje && item.status === 'presente').length;
  const faltas = presencas.filter((item) => normalizarData(item.data) === hoje && item.status === 'falta').length;
  const justificados = presencas.filter((item) => normalizarData(item.data) === hoje && item.status === 'justificado').length;
  const frequencia = totalAlunos > 0 ? Math.round((presentes / totalAlunos) * 100) : 0;

  useEffect(() => {
    const treinoAtual = treino;

    if (!treinoAtual?.id) return;

    async function carregar() {
      setCarregando(true);
      await carregarPresencasPorTreino(treinoAtual!.id, hoje);
      setCarregando(false);
    }

    void carregar();
  }, [treino?.id]);

  async function marcar(alunoId: string, status: StatusPresenca) {
    if (!treino || salvando) return;

    setSalvando(true);

    try {
      const existente = presencas.find(
        (item) => item.treinoId === treino.id && item.alunoId === alunoId && normalizarData(item.data) === hoje
      );

      if (existente) {
        await editarPresenca(existente.id, { status });
      } else {
        await registrarPresenca({ treinoId: treino.id, alunoId, data: hoje, status });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a presença. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover(alunoId: string) {
    if (!treino || salvando) return;

    const existente = presencas.find(
      (item) => item.treinoId === treino.id && item.alunoId === alunoId && normalizarData(item.data) === hoje
    );

    if (!existente) return;

    setSalvando(true);

    try {
      await excluirPresenca(existente.id);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível remover a presença. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  if (!treino) {
    return <View style={styles.container}><Text style={styles.title}>Treino não encontrado</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chamada</Text>
      <Text style={styles.training}>{treino.nome}</Text>
      <Text style={styles.info}>{treino.dia} • {treino.horario} • {hoje.split('-').reverse().join('/')}</Text>
      <Text style={styles.info}>Turma: {treino.turma || 'Não definida'}</Text>
      {!turma ? <Text style={styles.warning}>Associe uma turma cadastrada ao treino para fazer a chamada.</Text> : null}
      {turma && alunosDaTurma.length === 0 ? <Text style={styles.warning}>Esta turma ainda não possui alunos ativos.</Text> : null}
      {carregando ? <Text style={styles.warning}>Carregando presenças...</Text> : null}
      {!carregando && turma && alunosDaTurma.length > 0 ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalAlunos}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{presentes}</Text>
              <Text style={styles.summaryLabel}>Presentes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>{faltas}</Text>
              <Text style={styles.summaryLabel}>Faltas</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#FF9800' }]}>{justificados}</Text>
              <Text style={styles.summaryLabel}>Justificados</Text>
            </View>
          </View>
          <View style={styles.frequencyRow}>
            <Text style={styles.frequencyLabel}>Frequência da aula:</Text>
            <Text style={[styles.frequencyValue, frequencia >= 70 ? { color: '#4CAF50' } : { color: '#F44336' }]}>{frequencia}%</Text>
          </View>
        </View>
      ) : null}
      {alunosDaTurma.map((aluno) => {
        const atual = presencas.find((item) => item.treinoId === treino.id && item.alunoId === aluno.id && normalizarData(item.data) === hoje);
        return (
          <View key={aluno.id} style={styles.card}>
            <Text style={styles.name}>{aluno.nome}</Text>
            <View style={styles.options}>
              {opcoes.map((opcao) => (
                <Pressable key={opcao.status} style={[styles.option, atual?.status === opcao.status && styles[opcao.status]]} onPress={() => marcar(aluno.id, opcao.status)}>
                  <Text style={styles.optionText}>{opcao.texto}</Text>
                </Pressable>
              ))}
            </View>
            {atual ? <Pressable style={styles.removeButton} onPress={() => remover(aluno.id)}><Text style={styles.removeText}>Remover</Text></Pressable> : null}
          </View>
        );
      })}
      {alunosDaTurma.length > 0 ? <Pressable style={styles.finishButton} onPress={() => Alert.alert('Chamada salva', 'As marcações foram salvas automaticamente.')}><Text style={styles.finishText}>Concluir chamada</Text></Pressable> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70 },
  title: { color: COLORS.white, fontSize: 30, fontWeight: 'bold' },
  training: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold', marginTop: 18 },
  info: { color: COLORS.textSecondary, marginTop: 6 },
  warning: { color: '#FFB74D', marginTop: 25 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 16 },
  name: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  options: { flexDirection: 'row', gap: 8, marginTop: 14 },
  option: { alignItems: 'center', backgroundColor: COLORS.background, borderColor: COLORS.border, borderRadius: 10, borderWidth: 1, flex: 1, padding: 10 },
  presente: { backgroundColor: '#1B5E20', borderColor: '#2E7D32' },
  falta: { backgroundColor: '#7F1D1D', borderColor: '#E53935' },
  justificado: { backgroundColor: '#6A4F00', borderColor: '#FFB300' },
  optionText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  finishButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 14, marginVertical: 30, padding: 16 },
  finishText: { color: COLORS.white, fontWeight: 'bold' },
  removeButton: { alignItems: 'center', marginTop: 10, padding: 8 },
  removeText: { color: '#FF6B6B', fontSize: 12, fontWeight: 'bold' },
  summaryCard: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  frequencyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  frequencyLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold' },
  frequencyValue: { fontSize: 18, fontWeight: 'bold' },
});

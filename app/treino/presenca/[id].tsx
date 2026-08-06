import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { StatusPresenca, usePresencas } from '@/components/context/PresencaContext';
import { useTreinos } from '@/components/context/TreinoContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const hoje = new Date().toISOString().slice(0, 10);
const opcoes: { status: StatusPresenca; texto: string }[] = [
  { status: 'presente', texto: 'Presente' },
  { status: 'falta', texto: 'Falta' },
  { status: 'justificado', texto: 'Justificado' },
];

export default function PresencaTreino() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { treinos } = useTreinos();
  const { turmas } = useTurmas();
  const { alunos } = useDojo();
  const { presencas, registrarPresenca } = usePresencas();
  const treino = treinos.find((item) => item.id === id);
  const turma = turmas.find((item) => item.id === treino?.turmaId || item.nome.trim().toLowerCase() === treino?.turma.trim().toLowerCase());
  const alunosDaTurma = alunos.filter((aluno) => {
    const associadoNaTurma = turma?.alunoIds.includes(aluno.id);
    const turmaDoAluno = aluno.turma.trim().toLowerCase() === treino?.turma.trim().toLowerCase();
    return aluno.ativo && (associadoNaTurma || turmaDoAluno);
  });

  function marcar(alunoId: string, status: StatusPresenca) {
    if (!treino) return;
    registrarPresenca({ treinoId: treino.id, alunoId, data: hoje, status });
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
      {alunosDaTurma.map((aluno) => {
        const atual = presencas.find((item) => item.treinoId === treino.id && item.alunoId === aluno.id && item.data === hoje)?.status;
        return (
          <View key={aluno.id} style={styles.card}>
            <Text style={styles.name}>{aluno.nome}</Text>
            <View style={styles.options}>
              {opcoes.map((opcao) => (
                <Pressable key={opcao.status} style={[styles.option, atual === opcao.status && styles[opcao.status]]} onPress={() => marcar(aluno.id, opcao.status)}>
                  <Text style={styles.optionText}>{opcao.texto}</Text>
                </Pressable>
              ))}
            </View>
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
});

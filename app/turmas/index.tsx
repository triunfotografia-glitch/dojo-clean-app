import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Turmas() {
  const { turmas, excluirTurma } = useTurmas();
  const { professores } = useProfessores();
  const { alunos } = useDojo();

  function excluir(id: string, nome: string) {
    Alert.alert(
      'Excluir turma',
      `Deseja excluir a turma ${nome}? Os alunos não serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirTurma(id);
            } catch (error) {
              console.error(
                'Erro ao excluir turma:',
                error
              );

              Alert.alert(
                'Erro',
                'Não foi possível excluir a turma. Tente novamente.'
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turmas</Text>
      <Pressable style={styles.createButton} onPress={() => router.push({ pathname: '/turma/nova' })}>
        <Text style={styles.buttonText}>+ Nova turma</Text>
      </Pressable>
      <FlatList
        data={turmas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma turma cadastrada.</Text>}
        renderItem={({ item }) => {
          const professor = professores.find((p) => p.id === item.professorId);
          const quantidade = alunos.filter((aluno) => item.alunoIds.includes(aluno.id)).length;
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.nome}</Text>
              <Text style={styles.info}>Professor: {professor?.nome || 'Não definido'}</Text>
              <Text style={styles.info}>{quantidade} aluno(s) associado(s)</Text>
              <Pressable
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: '/turma/nova',
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.editText}>Editar turma</Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={() => excluir(item.id, item.nome)}>
                <Text style={styles.deleteText}>Excluir turma</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1, padding: 25, paddingTop: 70 },
  title: { color: COLORS.white, fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  createButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 15, marginBottom: 20, padding: 16 },
  buttonText: { color: COLORS.white, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 18 },
  name: { color: COLORS.white, fontSize: 19, fontWeight: 'bold' },
  info: { color: COLORS.textSecondary, marginTop: 7 },
  editButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10, marginTop: 16, padding: 11 },
  editText: { color: COLORS.white, fontWeight: 'bold' },  deleteButton: { alignItems: 'center', borderColor: '#E53935', borderRadius: 10, borderWidth: 1, marginTop: 16, padding: 11 },
  deleteText: { color: '#FF6B6B', fontWeight: 'bold' },
  empty: { color: COLORS.muted, marginTop: 30, textAlign: 'center' },
});

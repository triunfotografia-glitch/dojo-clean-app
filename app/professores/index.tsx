import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Professores() {
  const { professores, excluirProfessor } = useProfessores();
  const { alunos, editarAluno } = useDojo();

  function confirmarExclusao(id: string, nome: string) {
    const professor = professores.find((p) => p.nome === nome);
    const alunosVinculados = professor
      ? alunos.filter((aluno) => aluno.professorId === professor.id)
      : [];

    if (alunosVinculados.length > 0) {
      const quantidade = alunosVinculados.length;
      const textoAlunos = quantidade === 1 ? '1 aluno está vinculado' : `${quantidade} alunos estão vinculados`;

      Alert.alert(
        'Professor vinculado a alunos',
        `${textoAlunos} a ${nome}. Ao excluir, eles ficarão sem professor responsável.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir e desvincular',
            style: 'destructive',
            onPress: () => {
              alunosVinculados.forEach((aluno) => {
                editarAluno({ ...aluno, professorId: undefined });
              });
              excluirProfessor(id);
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      'Excluir professor',
      `Deseja excluir o cadastro de ${nome}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirProfessor(id),
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Professores</Text>
      <Pressable style={styles.button} onPress={() => router.push('/professor/novo')}>
        <Text style={styles.buttonText}>+ Novo professor</Text>
      </Pressable>
      <FlatList
        data={professores}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum professor cadastrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.nome}</Text>
            <Text style={styles.info}>{item.faixa || 'Faixa não informada'}</Text>
            {item.especialidade ? <Text style={styles.info}>{item.especialidade}</Text> : null}
            {item.alunoId ? <Text style={styles.linkedStudent}>Também é aluno cadastrado</Text> : null}
            <Text style={item.ativo ? styles.active : styles.inactive}>
              {item.ativo ? 'ATIVO' : 'INATIVO'}
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: '/professor/editar/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => confirmarExclusao(item.id, item.nome)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1, padding: 25, paddingTop: 70 },
  title: { color: COLORS.white, fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  button: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 15, marginBottom: 20, padding: 16 },
  buttonText: { color: COLORS.white, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 18 },
  name: { color: COLORS.white, fontSize: 19, fontWeight: 'bold' },
  info: { color: COLORS.textSecondary, marginTop: 5 },
  active: { color: '#00C853', fontWeight: 'bold', marginTop: 12 },
  inactive: { color: COLORS.muted, fontWeight: 'bold', marginTop: 12 },
  linkedStudent: { color: COLORS.primary, fontWeight: 'bold', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  editButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10, flex: 1, padding: 12 },
  editButtonText: { color: COLORS.white, fontWeight: 'bold' },
  deleteButton: { alignItems: 'center', borderColor: '#E53935', borderRadius: 10, borderWidth: 1, flex: 1, padding: 12 },
  deleteButtonText: { color: '#FF6B6B', fontWeight: 'bold' },
  empty: { color: COLORS.muted, marginTop: 30, textAlign: 'center' },
});

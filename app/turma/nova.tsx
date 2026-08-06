import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function NovaTurma() {
  const { professores } = useProfessores();
  const { alunos } = useDojo();
  const { adicionarTurma } = useTurmas();
  const [nome, setNome] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [alunoIds, setAlunoIds] = useState<string[]>([]);

  function alternarAluno(id: string) {
    setAlunoIds((lista) => lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id]);
  }

  function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome da turma.');
      return;
    }
    adicionarTurma({ id: Date.now().toString(), nome: nome.trim(), professorId, alunoIds });
    Alert.alert('Sucesso', 'Turma cadastrada!');
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nova turma</Text>
      <TextInput style={styles.input} placeholder="Nome da turma (ex.: Kids)" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} />
      <Text style={styles.section}>Professor responsável</Text>
      <View style={styles.options}>
        <Pressable style={[styles.option, !professorId && styles.selected]} onPress={() => setProfessorId('')}><Text style={styles.optionText}>Definir depois</Text></Pressable>
        {professores.filter((professor) => professor.ativo).map((professor) => (
          <Pressable key={professor.id} style={[styles.option, professorId === professor.id && styles.selected]} onPress={() => setProfessorId(professor.id)}><Text style={styles.optionText}>{professor.nome}</Text></Pressable>
        ))}
      </View>
      <Text style={styles.section}>Alunos da turma</Text>
      {alunos.length === 0 ? <Text style={styles.helper}>Nenhum aluno cadastrado.</Text> : (
        <View style={styles.options}>
          {alunos.filter((aluno) => aluno.ativo).map((aluno) => (
            <Pressable key={aluno.id} style={[styles.option, alunoIds.includes(aluno.id) && styles.selected]} onPress={() => alternarAluno(aluno.id)}><Text style={styles.optionText}>{aluno.nome}</Text></Pressable>
          ))}
        </View>
      )}
      <Pressable style={styles.saveButton} onPress={salvar}><Text style={styles.buttonText}>Salvar turma</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70 },
  title: { color: COLORS.white, fontSize: 30, fontWeight: 'bold', marginBottom: 25 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, color: COLORS.white, marginBottom: 20, padding: 15 },
  section: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 12, borderWidth: 1, padding: 12 },
  selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { color: COLORS.white },
  helper: { color: COLORS.muted },
  saveButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 15, marginTop: 30, padding: 17 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

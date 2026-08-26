import { COLORS } from '@/components/Colors';
import { useProfessores } from '@/components/context/ProfessorContext';
import { Treino, useTreinos } from '@/components/context/TreinoContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Treinos() {
  const { treinos, adicionarTreino, excluirTreino } = useTreinos();
  const { professores } = useProfessores();
  const { turmas } = useTurmas();
  const [nome, setNome] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [horario, setHorario] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');

  const turmaSelecionada = turmas.find((item) => item.id === turmaId);

  function alternarDia(dia: string) {
    setDiasSelecionados((lista) => lista.includes(dia) ? lista.filter((item) => item !== dia) : [...lista, dia]);
  }

  function selecionarTurma(id: string) {
    const turma = turmas.find((item) => item.id === id);
    setTurmaId(id);
    if (turma?.professorId) setProfessorId(turma.professorId);
  }

  async function salvar() {
    if (!nome.trim() || diasSelecionados.length === 0 || !horario.trim()) {
      Alert.alert('Atenção', 'Informe nome, pelo menos um dia e o horário do treino.');
      return;
    }
    const professor = professores.find((item) => item.id === professorId);
    const baseId = Date.now();
    try {
      for (const [indice, dia] of diasSelecionados.entries()) {
      const treino: Treino = { id: `${baseId}-${indice}`, nome: nome.trim(), dia, horario: horario.trim(), turma: turmaSelecionada?.nome || '', professor: professor?.nome || '', turmaId: turmaId || undefined, professorId: professorId || undefined };
        await adicionarTreino(treino);
      }
      Alert.alert('Sucesso', `${diasSelecionados.length} treino(s) cadastrado(s)!`);
      setNome(''); setDiasSelecionados([]); setHorario(''); setTurmaId(''); setProfessorId('');
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o treino. Tente novamente.');
    }
  }

  function confirmarExclusao(id: string) {
    Alert.alert('Excluir treino', 'Deseja excluir este treino?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => excluir(id) }]);
  }

  async function excluir(id: string) {
    try {
      await excluirTreino(id);
    } catch (error) {
      console.error('Erro ao excluir treino:', error);
      Alert.alert('Erro', 'Não foi possível excluir o treino. Tente novamente.');
    }
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={treinos}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.empty}>Nenhum treino cadastrado.</Text>}
      ListHeaderComponent={<>
      <Text style={styles.title}>Treinos</Text>
      <TextInput style={styles.input} placeholder="Nome do treino" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} />
      <Text style={styles.label}>Dias da semana</Text>
      <View style={styles.options}>{dias.map((item) => <Pressable key={item} style={[styles.option, diasSelecionados.includes(item) && styles.selected]} onPress={() => alternarDia(item)}><Text style={styles.optionText}>{item}</Text></Pressable>)}</View>
      <TextInput style={styles.input} placeholder="Horário (ex.: 19:00)" placeholderTextColor={COLORS.muted} value={horario} onChangeText={setHorario} />
      <Text style={styles.label}>Turma</Text>
      <View style={styles.options}>{turmas.map((item) => <Pressable key={item.id} style={[styles.option, turmaId === item.id && styles.selected]} onPress={() => selecionarTurma(item.id)}><Text style={styles.optionText}>{item.nome}</Text></Pressable>)}</View>
      <Text style={styles.label}>Professor</Text>
      <View style={styles.options}>{professores.filter((item) => item.ativo).map((item) => <Pressable key={item.id} style={[styles.option, professorId === item.id && styles.selected]} onPress={() => setProfessorId(item.id)}><Text style={styles.optionText}>{item.nome}</Text></Pressable>)}</View>
      <Pressable style={styles.button} onPress={salvar}><Text style={styles.buttonText}>Salvar treino</Text></Pressable>
      </>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Pressable onPress={() => router.push({ pathname: '/treino/presenca/[id]', params: { id: item.id } })}>
            <Text style={styles.name}>{item.nome}</Text><Text style={styles.info}>{item.dia} • {item.horario}</Text>
            {item.turma ? <Text style={styles.info}>Turma: {item.turma}</Text> : null}{item.professor ? <Text style={styles.info}>Professor: {item.professor}</Text> : null}
          </Pressable>
          <View style={styles.actions}><Pressable style={styles.editButton} onPress={() => router.push({ pathname: '/treino/editar/[id]', params: { id: item.id } })}><Text style={styles.editText}>Editar</Text></Pressable><Pressable style={styles.presencaButton} onPress={() => router.push({ pathname: '/treino/presenca/[id]', params: { id: item.id } })}><Text style={styles.presencaText}>Presença</Text></Pressable><Pressable style={styles.deleteButton} onPress={() => confirmarExclusao(item.id)}><Text style={styles.deleteText}>Apagar</Text></Pressable></View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70 }, title: { color: COLORS.white, fontSize: 32, fontWeight: 'bold', marginBottom: 20 }, input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 14, borderWidth: 1, color: COLORS.white, marginBottom: 12, padding: 14 }, label: { color: COLORS.white, fontWeight: 'bold', marginBottom: 8 }, options: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }, option: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 14, borderWidth: 1, marginBottom: 8, marginRight: 8, padding: 10 }, selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary }, optionText: { color: COLORS.white }, button: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 14, marginBottom: 20, padding: 15 }, buttonText: { color: COLORS.white, fontWeight: 'bold' }, card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, marginBottom: 10, padding: 15 }, name: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }, info: { color: COLORS.textSecondary, marginTop: 5 }, actions: { flexDirection: 'row', gap: 10, marginTop: 15 },   editButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10, flex: 1, padding: 10 }, editText: { color: COLORS.white, fontWeight: 'bold' }, presencaButton: { alignItems: 'center', backgroundColor: '#1B5E20', borderColor: '#2E7D32', borderRadius: 10, borderWidth: 1, flex: 1, padding: 10 }, presencaText: { color: '#FFFFFF', fontWeight: 'bold' }, deleteButton: { alignItems: 'center', borderColor: '#E53935', borderRadius: 10, borderWidth: 1, flex: 1, padding: 10 }, deleteText: { color: '#FF6B6B', fontWeight: 'bold' }, empty: { color: COLORS.muted, marginTop: 25, textAlign: 'center' },
});

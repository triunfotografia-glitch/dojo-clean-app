import { COLORS } from '@/components/Colors';
import { useProfessores } from '@/components/context/ProfessorContext';
import { useTreinos } from '@/components/context/TreinoContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function EditarTreino() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { buscarTreino, editarTreino } = useTreinos();
  const { turmas } = useTurmas();
  const { professores } = useProfessores();
  const treino = id ? buscarTreino(id) : undefined;
  const [nome, setNome] = useState(''); const [dia, setDia] = useState(''); const [horario, setHorario] = useState(''); const [turmaId, setTurmaId] = useState(''); const [professorId, setProfessorId] = useState('');

  useEffect(() => {
    if (!treino) return;
    setNome(treino.nome); setDia(treino.dia); setHorario(treino.horario);
    setTurmaId(treino.turmaId || turmas.find((item) => item.nome.toLowerCase() === treino.turma.toLowerCase())?.id || '');
    setProfessorId(treino.professorId || professores.find((item) => item.nome === treino.professor)?.id || '');
  }, [treino, turmas, professores]);

  function selecionarTurma(idTurma: string) {
    const turma = turmas.find((item) => item.id === idTurma);
    setTurmaId(idTurma);
    if (turma?.professorId) setProfessorId(turma.professorId);
  }

  function salvar() {
    if (!treino || !nome.trim() || !dia || !horario.trim()) { Alert.alert('Atenção', 'Informe nome, dia e horário do treino.'); return; }
    const turma = turmas.find((item) => item.id === turmaId);
    const professor = professores.find((item) => item.id === professorId);
    editarTreino({ ...treino, nome: nome.trim(), dia, horario: horario.trim(), turma: turma?.nome || treino.turma, professor: professor?.nome || treino.professor, turmaId: turmaId || undefined, professorId: professorId || undefined });
    Alert.alert('Sucesso', 'Treino atualizado!'); router.back();
  }

  if (!treino) return <View style={styles.container}><Text style={styles.title}>Treino não encontrado</Text></View>;
  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>Editar treino</Text><TextInput style={styles.input} placeholder="Nome do treino" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} /><Text style={styles.label}>Dia</Text><View style={styles.options}>{dias.map((item) => <Pressable key={item} style={[styles.option, dia === item && styles.selected]} onPress={() => setDia(item)}><Text style={styles.optionText}>{item}</Text></Pressable>)}</View><TextInput style={styles.input} placeholder="Horário" placeholderTextColor={COLORS.muted} value={horario} onChangeText={setHorario} /><Text style={styles.label}>Turma</Text><View style={styles.options}>{turmas.map((item) => <Pressable key={item.id} style={[styles.option, turmaId === item.id && styles.selected]} onPress={() => selecionarTurma(item.id)}><Text style={styles.optionText}>{item.nome}</Text></Pressable>)}</View><Text style={styles.label}>Professor</Text><View style={styles.options}>{professores.filter((item) => item.ativo).map((item) => <Pressable key={item.id} style={[styles.option, professorId === item.id && styles.selected]} onPress={() => setProfessorId(item.id)}><Text style={styles.optionText}>{item.nome}</Text></Pressable>)}</View><Pressable style={styles.saveButton} onPress={salvar}><Text style={styles.saveText}>Salvar alterações</Text></Pressable></ScrollView>;
}

const styles = StyleSheet.create({ container: { backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70 }, title: { color: COLORS.white, fontSize: 30, fontWeight: 'bold', marginBottom: 25 }, input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 14, borderWidth: 1, color: COLORS.white, marginBottom: 15, padding: 14 }, label: { color: COLORS.white, fontWeight: 'bold', marginBottom: 8 }, options: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }, option: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 14, borderWidth: 1, marginBottom: 8, marginRight: 8, padding: 10 }, selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary }, optionText: { color: COLORS.white }, saveButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 14, marginTop: 15, padding: 16 }, saveText: { color: COLORS.white, fontWeight: 'bold' } });

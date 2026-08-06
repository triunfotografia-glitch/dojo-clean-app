import { COLORS } from '@/components/Colors';
import { Graduacao, useDojo } from '@/components/context/DojoContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

export default function NovaGraduacao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { buscarAluno, editarAluno } = useDojo();
  const aluno = buscarAluno(id);
  const [faixa, setFaixa] = useState('');
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));
  const [professor, setProfessor] = useState('');
  const [observacao, setObservacao] = useState('');

  if (!aluno) return null;
  const alunoAtual = aluno;

  function salvar() {
    if (!faixa.trim() || !data.trim()) { Alert.alert('Atenção', 'Informe a faixa e a data.'); return; }
    const graduacao: Graduacao = { id: Date.now().toString(), faixa: faixa.trim(), data: data.trim(), professor: professor.trim(), observacao: observacao.trim() };
    editarAluno({
      ...alunoAtual,
      faixa: graduacao.faixa,
      historicoGraduacao: [...(alunoAtual.historicoGraduacao || []), graduacao],
    });
    router.back();
  }

  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>Nova graduação</Text><TextInput style={styles.input} placeholder="Nova faixa" placeholderTextColor={COLORS.muted} value={faixa} onChangeText={setFaixa} /><TextInput style={styles.input} placeholder="Data (dd/mm/aaaa)" placeholderTextColor={COLORS.muted} value={data} onChangeText={setData} /><TextInput style={styles.input} placeholder="Professor (opcional)" placeholderTextColor={COLORS.muted} value={professor} onChangeText={setProfessor} /><TextInput style={[styles.input, styles.textArea]} placeholder="Observação (opcional)" placeholderTextColor={COLORS.muted} value={observacao} onChangeText={setObservacao} multiline /><Pressable style={styles.button} onPress={salvar}><Text style={styles.buttonText}>Salvar graduação</Text></Pressable></ScrollView>;
}
const styles = StyleSheet.create({ container: { backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70 }, title: { color: COLORS.white, fontSize: 30, fontWeight: 'bold', marginBottom: 25 }, input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, color: COLORS.white, marginBottom: 15, padding: 15 }, textArea: { height: 100, textAlignVertical: 'top' }, button: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 15, padding: 17 }, buttonText: { color: COLORS.white, fontWeight: 'bold' } });

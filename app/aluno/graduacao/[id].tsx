import { COLORS } from '@/components/Colors';
import { Graduacao, useDojo } from '@/components/context/DojoContext';
import { postGraduacao } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

function converterDataParaISO(dataPtBR: string): string {
  const partes = dataPtBR.split('/');
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    if (ano.length === 4 && /^\d+$/.test(dia) && /^\d+$/.test(mes)) {
      return `${ano}-${mes}-${dia}`;
    }
  }
  return dataPtBR;
}

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

  async function salvar() {
    if (!faixa.trim() || !data.trim()) { Alert.alert('Atenção', 'Informe a faixa e a data.'); return; }

    const dataEnviada = converterDataParaISO(data.trim());

    try {

      const criada = await postGraduacao({
        aluno_id: Number(aluno!.id),
        faixa: faixa.trim(),
        data: dataEnviada,
        professor: professor.trim() || '',
        observacao: observacao.trim() || '',
      } as any);

      const novaGraduacao: Graduacao = {
        id: String(criada.id),
        faixa: criada.faixa,
        data: criada.data,
        professor: criada.professor || '',
        observacao: criada.observacao || '',
      };

      await editarAluno({
        ...alunoAtual,
        faixa: novaGraduacao.faixa,
        historicoGraduacao: [
          ...(alunoAtual.historicoGraduacao || []),
          novaGraduacao,
        ],
      });

      router.back();

    } catch (error) {

      console.error(error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar a graduação. Tente novamente.'
      );

    }
  }

  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>Nova graduação</Text><TextInput style={styles.input} placeholder="Nova faixa" placeholderTextColor={COLORS.muted} value={faixa} onChangeText={setFaixa} /><TextInput style={styles.input} placeholder="Data (dd/mm/aaaa)" placeholderTextColor={COLORS.muted} value={data} onChangeText={setData} /><TextInput style={styles.input} placeholder="Professor (opcional)" placeholderTextColor={COLORS.muted} value={professor} onChangeText={setProfessor} /><TextInput style={[styles.input, styles.textArea]} placeholder="Observação (opcional)" placeholderTextColor={COLORS.muted} value={observacao} onChangeText={setObservacao} multiline /><Pressable style={styles.button} onPress={salvar}><Text style={styles.buttonText}>Salvar graduação</Text></Pressable></ScrollView>;
}
const styles = StyleSheet.create({ container: { backgroundColor: COLORS.background, flexGrow: 1, padding: 25, paddingTop: 70 }, title: { color: COLORS.white, fontSize: 30, fontWeight: 'bold', marginBottom: 25 }, input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, color: COLORS.white, marginBottom: 15, padding: 15 }, textArea: { height: 100, textAlignVertical: 'top' }, button: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 15, padding: 17 }, buttonText: { color: COLORS.white, fontWeight: 'bold' } });

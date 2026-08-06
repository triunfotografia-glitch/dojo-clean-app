import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function EditarProfessor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { buscarProfessor, editarProfessor } = useProfessores();
  const { alunos } = useDojo();
  const professor = id ? buscarProfessor(id) : undefined;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [faixa, setFaixa] = useState('');
  const [graus, setGraus] = useState(0);
  const [especialidade, setEspecialidade] = useState('');
  const [ativo, setAtivo] = useState(false);
  const [alunoId, setAlunoId] = useState('');

  const faixas = [
    "Branca", "Cinza", "Amarela", "Laranja", "Verde",
    "Azul", "Roxa", "Marrom", "Preta", "Coral", "Vermelha"
  ];

  const niveisGrau = faixa === 'Preta' ? 7 : 4;

  // Reseta os graus se a faixa for trocada e os graus forem maiores que o permitido
  useEffect(() => {
    if (faixa !== 'Preta' && graus > 4) setGraus(0);
  }, [faixa]);

  useEffect(() => {
    if (professor) {
      setNome(professor.nome);
      setTelefone(professor.telefone || '');
      setEmail(professor.email);
      setFaixa(professor.faixa);
      setGraus(professor.graus || 0);
      setEspecialidade(professor.especialidade);
      setAtivo(professor.ativo);
      setAlunoId(professor.alunoId || '');
    }
  }, [professor]);

  function salvar() {
    if (!professor || !nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do professor.');
      return;
    }

    // Lógica de vinculação automática
    const nomeProfessor = nome.trim().toLowerCase();
    const emailProfessor = email.trim().toLowerCase();
    const alunoVinculado = alunos.find(
      (aluno) =>
        aluno.nome.toLowerCase() === nomeProfessor ||
        (emailProfessor && aluno.email && aluno.email.toLowerCase() === emailProfessor)
    );

    const nomeAtualizado = nome.trim();
    editarProfessor({
      id: professor.id,
      nome: nomeAtualizado,
      telefone: telefone.trim(),
      email: email.trim().toLowerCase(),
      faixa: faixa.trim(),
      graus: graus,
      especialidade: especialidade.trim(),
      ativo,
      alunoId: alunoVinculado?.id,
    });

    Alert.alert('Sucesso', `Professor atualizado!${alunoVinculado ? `\nVinculado automaticamente ao aluno ${alunoVinculado.nome}.` : ''}`);
    router.back();
  }

  if (!professor) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Professor não encontrado</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar professor</Text>
      <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
      <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={COLORS.muted} keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Especialidade (opcional)" placeholderTextColor={COLORS.muted} value={especialidade} onChangeText={setEspecialidade} />

      <Text style={styles.label}>Faixa atual</Text>
      <View style={styles.statusOptions}>
        {faixas.map(item => (
          <Pressable
            key={item}
            style={[styles.option, faixa === item && styles.optionActive]}
            onPress={() => setFaixa(item)}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Graus</Text>
      <View style={styles.statusOptions}>
        {Array.from({ length: niveisGrau }, (_, i) => i + 1).map(item => (
          <Pressable key={item} onPress={() => setGraus(item)}>
            <Text style={[styles.grau, item <= graus && styles.grauActive]}>●</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Status do cadastro</Text>
      <View style={styles.statusOptions}>
        <Pressable style={[styles.statusButton, ativo && styles.statusButtonActive]} onPress={() => setAtivo(true)}>
          <Text style={styles.buttonText}>Ativo</Text>
        </Pressable>
        <Pressable style={[styles.statusButton, !ativo && styles.statusButtonActive]} onPress={() => setAtivo(false)}>
          <Text style={styles.buttonText}>Inativo</Text>
        </Pressable>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>ℹ️ Se um aluno com o mesmo nome ou e-mail já existir, o cadastro de professor será vinculado a ele automaticamente.</Text>
      </View>

      <Pressable style={styles.saveButton} onPress={salvar}><Text style={styles.buttonText}>Salvar alterações</Text></Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 25, paddingTop: 70 },
  title: { color: COLORS.white, fontSize: 30, fontWeight: 'bold', marginBottom: 25 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, color: COLORS.white, marginBottom: 15, padding: 15 },
  label: { color: COLORS.white, marginBottom: 10, marginTop: 10 },
  helperText: { color: COLORS.muted, marginBottom: 15 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusButton: { alignItems: 'center', backgroundColor: COLORS.card, borderColor: COLORS.border, borderRadius: 12, borderWidth: 1, flex: 1, padding: 14 },
  statusButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  option: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 12, borderRadius: 12, marginRight: 10, marginBottom: 10 },
  optionActive: { backgroundColor: COLORS.primary },
  grau: { fontSize: 35, color: "#555", marginRight: 10 },
  grauActive: { color: COLORS.primary },
  infoBox: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    color: COLORS.muted,
    lineHeight: 20,
  },
  saveButton: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 15, marginTop: 25, padding: 17 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

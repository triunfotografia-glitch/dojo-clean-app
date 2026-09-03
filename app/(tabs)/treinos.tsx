import { COLORS } from "@/components/Colors";
import { CompactSelector } from "@/components/CompactSelector";
import { useProfessores } from "@/components/context/ProfessorContext";
import { Treino, useTreinos } from "@/components/context/TreinoContext";
import { useTurmas } from "@/components/context/TurmaContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";

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
    try {
      for (const dia of diasSelecionados) {
        const treino = {
          nome: nome.trim(),
          dia,
          horario: horario.trim(),
          turma: turmaSelecionada?.nome || '',
          professor: professor?.nome || '',
          turmaId: turmaId || undefined,
          professorId: professorId || undefined,
        } as Omit<Treino, 'id'>;
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
    <View style={styles.backgroundContainer}>
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient
            id="gradient-bg"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#000000"
            />
            <Stop
              offset="100%"
              stopColor="#121212"
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#gradient-bg)"
        />
      </Svg>

      <FlatList
        contentContainerStyle={styles.content}
        data={treinos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum treino cadastrado.</Text>}
        ListHeaderComponent={<>
        <Text style={styles.title}>Treinos</Text>
        <View style={styles.titleDivider} />
        <TextInput style={styles.input} placeholder="Nome do treino" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} />
      <CompactSelector
        label="Dias da semana"
        value={diasSelecionados}
        options={dias}
        onChange={setDiasSelecionados}
        placeholder="Selecionar dias"
        multiple
      />
      <TextInput style={styles.input} placeholder="Horário (ex.: 19:00)" placeholderTextColor={COLORS.muted} value={horario} onChangeText={setHorario} />
      <CompactSelector
        label="Turma"
        value={turmaId}
        options={turmas.map((item) => ({
          value: item.id?.toString() || item.nome,
          label: item.nome,
        }))}
        onChange={(id) => selecionarTurma(id)}
        placeholder="Selecionar turma"
      />
      <CompactSelector
        label="Professor"
        value={professorId}
        options={professores
          .filter((item) => item.ativo)
          .map((item) => ({
            value: item.id?.toString() || item.nome,
            label: item.nome,
          }))}
        onChange={setProfessorId}
        placeholder="Selecionar professor"
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    backgroundColor: "transparent",
    flexGrow: 1,
    padding: 25,
    paddingTop: 32,
  },

  title: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },

  titleDivider: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    alignSelf: "flex-start",
    marginBottom: 16,
  },

  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    color: COLORS.white,
    marginBottom: 12,
    padding: 14,
  },

  button: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    marginBottom: 20,
    padding: 15,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },

  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  info: {
    color: COLORS.muted,
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  editButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flex: 1,
    padding: 10,
  },

  editText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  presencaButton: {
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderColor: COLORS.successBorder,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },

  presencaText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  deleteButton: {
    alignItems: "center",
    borderColor: COLORS.danger,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },

  deleteText: {
    color: COLORS.dangerText,
    fontWeight: "bold",
  },

  empty: {
    color: COLORS.muted,
    marginTop: 25,
    textAlign: "center",
  },
});

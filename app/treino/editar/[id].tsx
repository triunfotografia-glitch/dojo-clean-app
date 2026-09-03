import { COLORS } from "@/components/Colors";
import { CompactSelector } from "@/components/CompactSelector";
import { useProfessores } from "@/components/context/ProfessorContext";
import { useTreinos } from "@/components/context/TreinoContext";
import { useTurmas } from "@/components/context/TurmaContext";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function EditarTreino() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { buscarTreino, editarTreino } = useTreinos();
  const { turmas } = useTurmas();
  const { professores } = useProfessores();
  const treino = id ? buscarTreino(id) : undefined;
  const [nome, setNome] = useState('');
  const [dia, setDia] = useState('');
  const [horario, setHorario] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const inicializadoRef = useRef(false);

  useEffect(() => {
    if (!treino) return;
    setNome(treino.nome);
    setDia(treino.dia);
    setHorario(treino.horario);
  }, [treino?.id]);

  useEffect(() => {
    inicializadoRef.current = false;
  }, [treino?.id]);

  useEffect(() => {
    if (!treino) return;
    if (inicializadoRef.current) return;
    inicializadoRef.current = true;
    setTurmaId(treino.turmaId || turmas.find((item) => item.nome.toLowerCase() === treino.turma.toLowerCase())?.id || '');
    setProfessorId(treino.professorId || professores.find((item) => item.nome === treino.professor)?.id || '');
  }, [treino?.id, turmas, professores]);

  function selecionarTurma(idTurma: string) {
    const turma = turmas.find((item) => item.id === idTurma);
    setTurmaId(idTurma);
    if (turma?.professorId) setProfessorId(turma.professorId);
  }

  async function salvar() {
    if (!treino || !nome.trim() || !dia || !horario.trim()) {
      Alert.alert('Atenção', 'Informe nome, dia e horário do treino.');
      return;
    }
    const turma = turmas.find((item) => item.id === turmaId);
    const professor = professores.find((item) => item.id === professorId);
    try {
      await editarTreino({
        ...treino,
        nome: nome.trim(),
        dia,
        horario: horario.trim(),
        turma: turma?.nome || treino.turma,
        professor: professor?.nome || treino.professor,
        turmaId: turmaId || undefined,
        professorId: professorId || undefined,
      });
      Alert.alert(
        'Sucesso',
        'Treino atualizado!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao editar treino:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o treino. Tente novamente.');
    }
  }

  if (!treino) {
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
        <View style={styles.container}>
          <Text style={styles.title}>Treino não encontrado</Text>
        </View>
      </View>
    );
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

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar treino</Text>
        <View style={styles.titleDivider} />
      <TextInput
        style={styles.input}
        placeholder="Nome do treino"
        placeholderTextColor={COLORS.muted}
        value={nome}
        onChangeText={setNome}
      />
      <CompactSelector
        label="Dia"
        value={dia}
        options={dias}
        onChange={setDia}
        placeholder="Selecionar dia"
      />
      <TextInput
        style={styles.input}
        placeholder="Horário"
        placeholderTextColor={COLORS.muted}
        value={horario}
        onChangeText={setHorario}
      />
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
        options={professores.filter((item) => item.ativo).map((item) => ({
          value: item.id?.toString() || item.nome,
          label: item.nome,
        }))}
        onChange={setProfessorId}
        placeholder="Selecionar professor"
      />
      <Pressable
        style={styles.presencaButton}
        onPress={() =>
          router.push({
            pathname: '/treino/presenca/[id]',
            params: { id: treino.id },
          })
        }
      >
        <Text style={styles.presencaText}>Presença</Text>
      </Pressable>
      <Pressable style={styles.saveButton} onPress={salvar}>
        <Text style={styles.saveText}>Salvar alterações</Text>
      </Pressable>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
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
    marginBottom: 15,
    padding: 14,
  },

  presencaButton: {
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderColor: COLORS.successBorder,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 15,
    padding: 16,
  },

  presencaText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    marginTop: 15,
    padding: 16,
  },

  saveText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});

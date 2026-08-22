import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { useTurmas } from '@/components/context/TurmaContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function NovaTurma() {
  const { professores } = useProfessores();
  const { alunos } = useDojo();

  const {
    turmas,
    adicionarTurma,
    atualizarTurma,
  } = useTurmas();

  const { id } = useLocalSearchParams<{ id?: string }>();

  const turmaId = Array.isArray(id) ? id[0] : id;
  const modoEdicao = Boolean(turmaId);

  const [nome, setNome] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [alunoIds, setAlunoIds] = useState<string[]>([]);

  useEffect(() => {
    if (!turmaId) return;

    const turma = turmas.find(
      (item) => String(item.id) === String(turmaId)
    );

    if (!turma) return;

    setNome(turma.nome);
    setProfessorId(turma.professorId || '');
    setAlunoIds(turma.alunoIds || []);
  }, [turmaId, turmas]);

  function alternarAluno(id: string) {
    setAlunoIds((lista) =>
      lista.includes(id)
        ? lista.filter((item) => item !== id)
        : [...lista, id]
    );
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert(
        'Atenção',
        'Informe o nome da turma.'
      );
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        professorId,
        alunoIds,
      };

      if (modoEdicao && turmaId) {
        await atualizarTurma(turmaId, dados);

        Alert.alert(
          'Sucesso',
          'Turma atualizada com sucesso!'
        );
      } else {
        await adicionarTurma(dados);

        Alert.alert(
          'Sucesso',
          'Turma cadastrada!'
        );
      }

      router.back();
    } catch (error) {
      console.error(
        modoEdicao
          ? 'Erro ao atualizar turma:'
          : 'Erro ao cadastrar turma:',
        error
      );

      Alert.alert(
        'Erro',
        modoEdicao
          ? 'Não foi possível atualizar a turma. Tente novamente.'
          : 'Não foi possível cadastrar a turma. Tente novamente.'
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {modoEdicao ? 'Editar turma' : 'Nova turma'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da turma (ex.: Kids)"
        placeholderTextColor={COLORS.muted}
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.section}>
        Professor responsável
      </Text>

      <View style={styles.options}>
        <Pressable
          style={[
            styles.option,
            !professorId && styles.selected,
          ]}
          onPress={() => setProfessorId('')}
        >
          <Text style={styles.optionText}>
            Definir depois
          </Text>
        </Pressable>

        {professores
          .filter((professor) => professor.ativo)
          .map((professor) => (
            <Pressable
              key={professor.id}
              style={[
                styles.option,
                professorId === professor.id &&
                  styles.selected,
              ]}
              onPress={() =>
                setProfessorId(professor.id)
              }
            >
              <Text style={styles.optionText}>
                {professor.nome}
              </Text>
            </Pressable>
          ))}
      </View>

      <Text style={styles.section}>
        Alunos da turma
      </Text>

      {alunos.length === 0 ? (
        <Text style={styles.helper}>
          Nenhum aluno cadastrado.
        </Text>
      ) : (
        <View style={styles.options}>
          {alunos
            .filter((aluno) => aluno.ativo)
            .map((aluno) => (
              <Pressable
                key={aluno.id}
                style={[
                  styles.option,
                  alunoIds.includes(aluno.id) &&
                    styles.selected,
                ]}
                onPress={() =>
                  alternarAluno(aluno.id)
                }
              >
                <Text style={styles.optionText}>
                  {aluno.nome}
                </Text>
              </Pressable>
            ))}
        </View>
      )}

      <Pressable
        style={styles.saveButton}
        onPress={salvar}
      >
        <Text style={styles.buttonText}>
          {modoEdicao
            ? 'Atualizar turma'
            : 'Salvar turma'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: 25,
    paddingTop: 70,
  },

  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 15,
    borderWidth: 1,
    color: COLORS.white,
    marginBottom: 20,
    padding: 15,
  },

  section: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  option: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },

  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  optionText: {
    color: COLORS.white,
  },

  helper: {
    color: COLORS.muted,
  },

  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginTop: 30,
    padding: 17,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
import { COLORS } from '@/components/Colors';
import {
  Graduacao,
  useDojo,
} from '@/components/context/DojoContext';
import { postGraduacao } from '@/services/api';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const FAIXAS = [
  'Branca',
  'Cinza com Branca',
  'Cinza',
  'Cinza com Preta',
  'Amarela com Branca',
  'Amarela',
  'Amarela com Preta',
  'Laranja com Branca',
  'Laranja',
  'Laranja com Preta',
  'Verde com Branca',
  'Verde',
  'Verde com Preta',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta',
  'Coral',
  'Vermelha',
];

export default function NovaGraduacao() {
  const { alunos } = useDojo();

  const [alunoId, setAlunoId] =
    useState('');
  const [faixa, setFaixa] = useState('');
  const [data, setData] = useState('');
  const [professor, setProfessor] = useState(
    'Não informado'
  );
  const [observacao, setObservacao] =
    useState('');
  const [salvando, setSalvando] =
    useState(false);

  const alunosAtivos =
    alunos.filter((aluno) => aluno.ativo);

  async function salvar() {
    if (!alunoId) {
      Alert.alert(
        'Atenção',
        'Selecione um aluno.'
      );
      return;
    }

    if (!faixa.trim()) {
      Alert.alert(
        'Atenção',
        'Informe a faixa.'
      );
      return;
    }

    if (!data.trim()) {
      Alert.alert(
        'Atenção',
        'Informe a data.'
      );
      return;
    }

    try {
      setSalvando(true);

      await postGraduacao({
        alunoId: Number(alunoId),
        faixa: faixa.trim(),
        data: data.trim(),
        professor: professor.trim(),
        observacao: observacao.trim() || undefined,
      } as Omit<Graduacao, 'id'>);

      Alert.alert(
        'Sucesso',
        'Graduação registrada!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        'Erro ao salvar graduação:',
        error
      );

      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar a graduação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>
          Nova graduação
        </Text>

        <Text style={styles.section}>
          Aluno
        </Text>

        {alunosAtivos.length === 0 ? (
          <Text style={styles.helper}>
            Nenhum aluno cadastrado.
          </Text>
        ) : (
          <View style={styles.options}>
            {alunosAtivos.map((aluno) => (
              <Pressable
                key={aluno.id}
                style={[
                  styles.option,
                  alunoId === aluno.id &&
                    styles.selected,
                ]}
                onPress={() =>
                  setAlunoId(aluno.id)
                }
              >
                <Text style={styles.optionText}>
                  {aluno.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.section}>
          Faixa
        </Text>

        <View style={styles.options}>
          {FAIXAS.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.option,
                faixa === item &&
                  styles.selected,
              ]}
              onPress={() => setFaixa(item)}
            >
              <Text style={styles.optionText}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>
          Data
        </Text>

        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={COLORS.muted}
          value={data}
          onChangeText={setData}
          autoCapitalize="none"
        />

        <Text style={styles.section}>
          Professor
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do professor"
          placeholderTextColor={COLORS.muted}
          value={professor}
          onChangeText={setProfessor}
        />

        <Text style={styles.section}>
          Observação
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Opcional"
          placeholderTextColor={COLORS.muted}
          value={observacao}
          onChangeText={setObservacao}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[
            styles.button,
            salvando && styles.buttonDisabled,
          ]}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.buttonText}>
            {salvando
              ? 'Salvando...'
              : 'Salvar graduação'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 25,
    paddingTop: 70,
  },

  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  section: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },

  helper: {
    color: COLORS.muted,
    marginBottom: 10,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
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

  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.white,
    marginBottom: 12,
    padding: 14,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  button: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginTop: 20,
    padding: 16,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

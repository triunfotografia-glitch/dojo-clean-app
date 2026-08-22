import { COLORS } from "@/components/Colors";
import { Aluno, Graduacao, useDojo } from "@/components/context/DojoContext";
import { useProfessores } from "@/components/context/ProfessorContext";
import { postGraduacao } from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function EditarAluno() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { buscarAluno, editarAluno } = useDojo();
  const { professores } = useProfessores();

  const alunoOriginal = id ? buscarAluno(id) : undefined;

  // Estado local para gerenciar o formulário e as edições
  const [alunoEditavel, setAlunoEditavel] = useState<Aluno | null>(null);
  const [dataGraduacaoInput, setDataGraduacaoInput] = useState(''); // Novo estado para o input da data

  const faixas = [
    "Branca",
    "Cinza com Branca",
    "Cinza",
    "Cinza com Preta",
    "Amarela com Branca",
    "Amarela",
    "Amarela com Preta",
    "Laranja com Branca",
    "Laranja",
    "Laranja com Preta",
    "Verde com Branca",
    "Verde",
    "Verde com Preta",
    "Azul",
    "Roxa",
    "Marrom",
    "Preta",
    "Coral",
    "Vermelha",
  ];

  const turmas = ["Infantil", "Juvenil", "Adulto Manhã", "Adulto Noite"];

  const mensalidades = ["Em dia", "Atrasada", "Isento"];

  useEffect(() => {
    // Inicializa o estado de edição quando o aluno original é carregado
    if (alunoOriginal) {
      setAlunoEditavel(alunoOriginal);
      const ultimaGraduacao = alunoOriginal.historicoGraduacao?.slice(-1)[0]?.data || '';
      setDataGraduacaoInput(ultimaGraduacao);
    }
  }, [alunoOriginal]);

  // Função para atualizar campos do formulário de forma segura
  const setValor = (campo: keyof Aluno, valor: any) => {
    if (alunoEditavel) {
      setAlunoEditavel({ ...alunoEditavel, [campo]: valor });
    }
  };

  if (!alunoOriginal) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aluno não encontrado</Text>
      </View>
    );
  }
  
  async function selecionarFoto() {
    try {
      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert("Permissão necessária", "Autorize o acesso às fotos.");
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });

      if (!resultado.canceled) {
        setValor('foto', resultado.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar a foto.");
    }
  }

  function formatarDataParaApi(data: string): string | null {
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return data;
    }

    const partes = data.split('.');
    if (partes.length !== 3) return null;

    const [dia, mes, ano] = partes;
    if (!dia || !mes || !ano || !/^\d{2}$/.test(dia) || !/^\d{2}$/.test(mes) || !/^\d{4}$/.test(ano)) {
      return null;
    }

    return `${ano}-${mes}-${dia}`;
  }

  async function salvarAlteracoes() {
    if (!alunoEditavel) {
      return;
    }

    const alunoParaSalvar = { ...alunoEditavel };
    const ultimaGraduacaoHistorico = alunoParaSalvar.historicoGraduacao?.slice(-1)[0];

    if (dataGraduacaoInput && dataGraduacaoInput !== ultimaGraduacaoHistorico?.data) {
      const dataFormatada = formatarDataParaApi(dataGraduacaoInput);

      if (!dataFormatada) {
        Alert.alert(
          'Data inválida',
          'Informe a data no formato dd.mm.aaaa.'
        );
        return;
      }

      try {

        const criada = await postGraduacao({
          aluno_id: Number(alunoEditavel.id),
          faixa: alunoEditavel.faixa,
          data: dataFormatada,
          professor: "Não informado",
          observacao: "Graduação atualizada via edição",
        });

        const novaGraduacao: Graduacao = {
          id: String(criada.id),
          faixa: criada.faixa,
          data: criada.data,
          professor: criada.professor || '',
          observacao: criada.observacao || '',
        };

        alunoParaSalvar.historicoGraduacao = [
          ...(alunoParaSalvar.historicoGraduacao || []),
          novaGraduacao,
        ];

      } catch (error) {

        console.error(error);

        Alert.alert(
          'Erro',
          'Não foi possível salvar a graduação. Tente novamente.'
        );

        return;

      }
    }

    editarAluno(alunoParaSalvar);
    Alert.alert("Sucesso", "Aluno atualizado!");
    router.back();
  }

  // Garante que o componente não renderize se o estado de edição não estiver pronto
  if (!alunoEditavel) return null;


  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Editar aluno</Text>

      <Text style={styles.section}>Dados pessoais</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        placeholderTextColor={COLORS.muted}
        value={alunoEditavel.nome}
        onChangeText={(v) => setValor('nome', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        placeholderTextColor={COLORS.muted}
        keyboardType="phone-pad"
        value={alunoEditavel.telefone}
        onChangeText={(v) => setValor('telefone', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={COLORS.muted}
        value={alunoEditavel.email}
        onChangeText={(v) => setValor('email', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Data nascimento"
        placeholderTextColor={COLORS.muted}
        value={alunoEditavel.dataNascimento}
        onChangeText={(v) => setValor('dataNascimento', v)}
      />

      <Text style={styles.section}>Foto do aluno</Text>

      <Pressable style={styles.photoButton} onPress={selecionarFoto}>
        <Text style={styles.buttonText}>
          {alunoEditavel.foto ? "Trocar foto" : "Adicionar foto"}
        </Text>
      </Pressable>

      {alunoEditavel.foto !== "" && (
        <Image source={{ uri: alunoEditavel.foto }} style={styles.photo} />
      )}

      <Text style={styles.section}>Graduação</Text>

      <Text style={styles.label}>Faixa atual</Text>

      <View style={styles.row}>
        {faixas.map((item) => (
          <Pressable
            key={item}
            style={[styles.option, alunoEditavel.faixa === item && styles.optionActive]}
            onPress={() => setValor('faixa', item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Graus</Text>

      <View style={styles.row}>
        {[1, 2, 3, 4].map((item) => (
          <Pressable key={item} onPress={() => setValor('graus', item)}>
            <Text style={[styles.grau, item <= alunoEditavel.graus && styles.grauActive]}>
              ●
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Data da Graduação (dd/mm/aaaa)"
        placeholderTextColor={COLORS.muted}
        value={dataGraduacaoInput}
        onChangeText={setDataGraduacaoInput}
        keyboardType="numeric"
      />

      <Text style={styles.section}>Academia</Text>

      <Text style={styles.label}>Turma</Text>

      <View style={styles.row}>
        {turmas.map((item) => (
          <Pressable
            key={item}
            style={[styles.option, alunoEditavel.turma === item && styles.optionActive]}
            onPress={() => setValor('turma', item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Professor responsável</Text>
      {professores.filter((item) => item.ativo).length === 0 ? (
        <Text style={styles.helperText}>
          Cadastre um professor antes de vinculá-lo a um aluno.
        </Text>
      ) : (
        <View style={styles.row}>
          {professores
            .filter((item) => item.ativo)
            .map((item) => (
              <Pressable
                key={item.id}
                style={[styles.option, alunoEditavel.professorId === item.id && styles.optionActive]}
                onPress={() => setValor('professorId', item.id)}
              >
                <Text style={styles.optionText}>{item.nome}</Text>
              </Pressable>
            ))}
        </View>
      )}

      <Text style={styles.section}>Financeiro</Text>

      <TextInput
        style={styles.input}
        placeholder="Valor mensalidade"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        value={alunoEditavel.valorMensalidade}
        onChangeText={(v) => setValor('valorMensalidade', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Dia do vencimento (ex: 10)"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        value={alunoEditavel.diaVencimento.toString()}
        onChangeText={(v) => setValor('diaVencimento', Number(v))}
      />

      <View style={styles.row}>
        {mensalidades.map((item) => (
          <Pressable
            key={item}
            style={[styles.option, alunoEditavel.mensalidade === item && styles.optionActive]}
            onPress={() => setValor('mensalidade', item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        placeholder="Observações"
        placeholderTextColor={COLORS.muted}
        value={alunoEditavel.observacao}
        onChangeText={(v) => setValor('observacao', v)}
      />

      <Pressable style={styles.button} onPress={salvarAlteracoes}>
        <Text style={styles.buttonText}>Salvar alterações</Text>
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
  container: { padding: 25, paddingTop: 70 },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 25,
  },
  section: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
  },
  label: {
    color: COLORS.white,
    marginBottom: 10,
  },
  helperText: {
    color: COLORS.muted,
    marginBottom: 15,
  },
  input: {
    // ... (estilos existentes)
    backgroundColor: COLORS.card,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  option: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  optionActive: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.white,
  },
  grau: {
    color: "#555",
    fontSize: 35,
    marginRight: 10,
  },
  grauActive: {
    color: COLORS.primary,
  },
  photoButton: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 50,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

import { COLORS } from "@/components/Colors";
import { useDojo } from "@/components/context/DojoContext";
import { useProfessores } from "@/components/context/ProfessorContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";

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

export default function NovoAluno() {

  const { adicionarAluno } = useDojo();
  const { professores } = useProfessores();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");

  const [foto, setFoto] = useState("");

  const [faixa, setFaixa] = useState("");
  const [graus, setGraus] = useState(0);
  const [dataGraduacao, setDataGraduacao] = useState("");

  const [turma, setTurma] = useState("");
  const [professorId, setProfessorId] = useState("");

  const [mensalidade, setMensalidade] = useState("Em dia");
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [diaVencimento, setDiaVencimento] = useState("");

  const [observacao, setObservacao] = useState("");

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
    "Azul", "Roxa", "Marrom", "Preta", "Coral", "Vermelha"
  ];

  const turmas = [
    "Infantil","Juvenil","Adulto Manhã","Adulto Noite"
  ];

  const mensalidades = [
    "Em dia","Atrasada","Isento"
  ];

  async function selecionarFoto() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert("Permissão necessária","Autorize o acesso às fotos.");
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (!resultado.canceled) {
        const imagem = resultado.assets[0].uri;
        setFoto(imagem); // 🔥 agora usamos direto
      }

    } catch (error) {
      Alert.alert("Erro","Não foi possível selecionar a foto.");
    }
  }

  async function salvarAluno() {

    if (!nome || !faixa) {
      Alert.alert("Atenção","Informe nome e faixa do aluno.");
      return;
    }
  
    const id = Date.now().toString();
  
    try {
      await adicionarAluno({
        id: id,
        foto,
        nome,
        telefone,
        email,
        dataNascimento,
        senha: senha.trim(),
        faixa,
        graus,
        turma,
        professorId,
        dataEntrada: new Date().toISOString(),
        ativo: true,
        mensalidade,
        historicoGraduacao: dataGraduacao ? [{ id: Date.now().toString(), faixa: faixa, data: dataGraduacao, professor: "Não informado", observacao: "Graduação inicial" }] : [],
        valorMensalidade,
        diaVencimento: Number(diaVencimento) || 10,
        proximaCobranca: new Date().toISOString().slice(0, 10),
        cobrancas: [],
        observacao,
        criadoEm: new Date().toISOString(),
      });
  
      Alert.alert("Sucesso","Aluno cadastrado!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      Alert.alert("Erro","Não foi possível cadastrar o aluno. Tente novamente.");
    }
  }



  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Cadastro de aluno</Text>

      <Text style={styles.section}>Dados pessoais</Text>

      <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
      <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={COLORS.muted} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha de acesso (opcional)" placeholderTextColor={COLORS.muted} value={senha} onChangeText={setSenha} secureTextEntry />
      <TextInput style={styles.input} placeholder="Data nascimento" placeholderTextColor={COLORS.muted} value={dataNascimento} onChangeText={setDataNascimento} />

      <Text style={styles.section}>Foto do aluno</Text>

      <Pressable style={styles.photoButton} onPress={selecionarFoto}>
        <Text style={styles.buttonText}>
          {foto ? "Alterar foto" : "Adicionar foto"}
        </Text>
      </Pressable>

      {foto !== "" && (
        <Image source={{ uri: foto }} style={styles.photo} />
      )}

      <Text style={styles.section}>Graduação</Text>

      <Text style={styles.label}>Faixa atual</Text>
      <View style={styles.row}>
        {faixas.map(item => (
          <Pressable
            key={item}
            style={[styles.option, faixa === item && styles.optionActive]}
            onPress={() => setFaixa(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Graus</Text>
      <View style={styles.row}>
        {[1,2,3,4].map(item => (
          <Pressable key={item} onPress={() => setGraus(item)}>
            <Text style={[styles.grau, item <= graus && styles.grauActive]}>
              ●
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Data da Última Graduação (dd/mm/aaaa)"
        placeholderTextColor={COLORS.muted}
        value={dataGraduacao}
        onChangeText={setDataGraduacao}
        keyboardType="numeric"
      />

      <Text style={styles.section}>Academia</Text>

      <Text style={styles.label}>Turma</Text>
      <View style={styles.row}>
        {turmas.map(item => (
          <Pressable
            key={item}
            style={[styles.option, turma === item && styles.optionActive]}
            onPress={() => setTurma(item)}
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
                style={[styles.option, professorId === item.id && styles.optionActive]}
                onPress={() => setProfessorId(item.id)}
              >
                <Text style={styles.optionText}>{item.nome}</Text>
              </Pressable>
            ))}
        </View>
      )}

      <Text style={styles.section}>Financeiro</Text>

      <TextInput style={styles.input} placeholder="Valor mensalidade" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={valorMensalidade} onChangeText={setValorMensalidade} />
      <TextInput style={styles.input} placeholder="Dia do vencimento (ex: 10)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={diaVencimento} onChangeText={setDiaVencimento} />

      <View style={styles.row}>
        {mensalidades.map(item => (
          <Pressable
            key={item}
            style={[styles.option, mensalidade === item && styles.optionActive]}
            onPress={() => setMensalidade(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Observações</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        placeholder="Informações adicionais"
        placeholderTextColor={COLORS.muted}
        value={observacao}
        onChangeText={setObservacao}
      />

      <Pressable style={styles.button} onPress={salvarAluno}>
        <Text style={styles.buttonText}>Salvar aluno</Text>
      </Pressable>

    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },
  container:{ padding:25, paddingTop:70 },
  title:{ color:COLORS.white, fontSize:32, fontWeight:"bold", marginBottom:25 },
  section:{ color:COLORS.primary, fontSize:18, fontWeight:"bold", marginTop:20, marginBottom:15 },
  label:{ color:COLORS.white, marginBottom:10 },
  helperText:{ color:COLORS.muted, marginBottom:15 },
  input:{ backgroundColor:COLORS.card, color:COLORS.white, borderWidth:1, borderColor:COLORS.border, borderRadius:15, padding:15, marginBottom:15 },
  card: { backgroundColor: COLORS.card, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, marginTop: 20 },
  textArea:{ height:100, textAlignVertical:"top" },
  row:{ flexDirection:"row", flexWrap:"wrap" },
  option:{ backgroundColor:COLORS.card, borderWidth:1, borderColor:COLORS.border, padding:12, borderRadius:12, marginRight:10, marginBottom:10 },
  optionActive:{ backgroundColor:COLORS.primary },
  optionText:{ color:COLORS.white },
  grau:{ fontSize:35, color:"#555", marginRight:10 },
  grauActive:{ color:COLORS.primary },
  photoButton:{ backgroundColor:COLORS.card, padding:18, borderRadius:15, alignItems:"center", borderWidth:1, borderColor:COLORS.border },
  photo:{ width:130, height:130, borderRadius:65, alignSelf:"center", marginTop:20 },
  button:{ backgroundColor:COLORS.primary, padding:18, borderRadius:15, alignItems:"center", marginTop:30, marginBottom:50 },
  buttonText:{ color:COLORS.white, fontWeight:"bold", fontSize:16 },
});

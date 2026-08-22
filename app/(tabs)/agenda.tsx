import { COLORS } from "@/components/Colors";
import { promptText } from "@/components/Prompt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Anotacao {
  id: string;
  texto: string;
}

interface Aviso {
  id: string;
  texto: string;
}

const ANOTACOES_STORAGE_KEY = "@dojo_anotacoes_agenda";
const AVISOS_STORAGE_KEY = "@dojo_avisos_agenda";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [novoAviso, setNovoAviso] = useState("");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    async function carregarDados() {
      // Carrega anotações e avisos
      const [dadosAnotacoes, dadosAvisos] = await Promise.all([
        AsyncStorage.getItem(ANOTACOES_STORAGE_KEY),
        AsyncStorage.getItem(AVISOS_STORAGE_KEY),
      ]);

      if (dadosAnotacoes) setAnotacoes(JSON.parse(dadosAnotacoes));
      if (dadosAvisos) setAvisos(JSON.parse(dadosAvisos));

      // Lógica para resetar avisos no domingo
      const ultimoReset = await AsyncStorage.getItem("@dojo_avisos_ultimo_reset");
      const hoje = new Date();
      const diaDaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda...

      // Se hoje for domingo e o reset ainda não ocorreu hoje
      if (diaDaSemana === 0 && ultimoReset !== hoje.toISOString().slice(0, 10)) {
        Alert.alert(
          "Limpeza Semanal",
          "Os avisos da semana foram limpos automaticamente."
        );
        setAvisos([]); // Limpa os avisos
        // Marca que o reset de hoje foi feito
        await AsyncStorage.setItem(
          "@dojo_avisos_ultimo_reset",
          hoje.toISOString().slice(0, 10)
        );
      } else if (diaDaSemana !== 0 && ultimoReset === null) {
        // Garante que a chave de reset seja criada na primeira vez fora de um domingo
        await AsyncStorage.setItem("@dojo_avisos_ultimo_reset", "init");
      }

      setCarregado(true);
    }
    void carregarDados();

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = currentDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Salvar dados no AsyncStorage sempre que forem alterados
  useEffect(() => {
    if (carregado) {
      void AsyncStorage.setItem(
        ANOTACOES_STORAGE_KEY,
        JSON.stringify(anotacoes)
      );
      void AsyncStorage.setItem(AVISOS_STORAGE_KEY, JSON.stringify(avisos));
    }
  }, [anotacoes, avisos, carregado]);

  function adicionarAnotacao() {
    if (novaAnotacao.trim() === "") {
      Alert.alert("Atenção", "A anotação não pode estar vazia.");
      return;
    }
    const anotacao: Anotacao = {
      id: Date.now().toString(),
      texto: novaAnotacao.trim(),
    };
    setAnotacoes((prev) => [anotacao, ...prev]);
    setNovaAnotacao("");
  }

  function removerAnotacao(id: string) {
    Alert.alert("Remover Anotação", "Deseja realmente remover esta anotação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setAnotacoes((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  }

  function adicionarOuEditarAviso() {
    if (novoAviso.trim() === "") {
      Alert.alert("Atenção", "O aviso não pode estar vazio.");
      return;
    }
    // Simples adição por enquanto. A edição pode ser um próximo passo.
    const aviso: Aviso = {
      id: Date.now().toString(),
      texto: novoAviso.trim(),
    };
    setAvisos((prev) => [aviso, ...prev]);
    setNovoAviso("");
  }

  function removerAviso(id: string) {
    Alert.alert("Remover Aviso", "Deseja realmente remover este aviso?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setAvisos((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  }

  function editarAviso(aviso: Aviso) {
    promptText(
      "Editar Aviso",
      "Altere o texto do aviso:",
      (textoEditado) => {
        if (textoEditado && textoEditado.trim() !== "") {
          setAvisos((prev) => prev.map((a) => a.id === aviso.id ? { ...a, texto: textoEditado.trim() } : a));
        }
      },
      "plain-text",
      aviso.texto
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agenda</Text>

      <View style={styles.header}>
        <Text style={styles.time}>{formattedTime}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* AVISOS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Avisos Importantes</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite um novo aviso..."
            placeholderTextColor={COLORS.muted}
            value={novoAviso}
            onChangeText={setNovoAviso}
          />
          <Pressable style={styles.addButton} onPress={adicionarOuEditarAviso}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        {avisos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum aviso para a semana.</Text>
        ) : (
          avisos.map((aviso) => (
            <View key={aviso.id} style={styles.itemContainer}>
              <Text style={styles.cardText}>• {aviso.texto}</Text>
              <View style={styles.actionsContainer}>
                <Pressable onPress={() => editarAviso(aviso)}><Text style={styles.editButtonText}>✎</Text></Pressable>
                <Pressable onPress={() => removerAviso(aviso.id)}><Text style={styles.removeButtonText}>✕</Text></Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* VISITAS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Anotações Gerais</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma nova anotação..."
            placeholderTextColor={COLORS.muted}
            value={novaAnotacao}
            onChangeText={setNovaAnotacao}
          />
          <Pressable style={styles.addButton} onPress={adicionarAnotacao}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        {anotacoes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma anotação ainda.</Text>
        ) : (
          anotacoes.map((anotacao) => (
            <View key={anotacao.id} style={styles.itemContainer}>
              <Text style={styles.cardText}>• {anotacao.texto}</Text>
              <View style={styles.actionsContainer}>
                <Pressable onPress={() => removerAnotacao(anotacao.id)}><Text style={styles.removeButtonText}>✕</Text></Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 25,
    paddingTop: 70,
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
  },
  time: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  date: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: 8,
    textTransform: "capitalize",
  },
  subtitle: { color: COLORS.muted, fontSize: 16, marginTop: 6, marginBottom: 25 },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.white,
    padding: 14,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginLeft: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  removeButtonText: {
    color: COLORS.danger,
    fontSize: 22,
    fontWeight: "bold",
    paddingLeft: 15,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 10,
  },
});
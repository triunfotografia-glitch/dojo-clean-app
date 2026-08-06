import { COLORS } from '@/components/Colors';
import { promptText } from '@/components/Prompt';
import { useDojo } from '@/components/context/DojoContext';
import { usePresencas } from '@/components/context/PresencaContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { useTreinos } from '@/components/context/TreinoContext';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function PerfilAluno() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userLogado, buscarAluno, editarAluno, removerAluno } = useDojo();
  const { presencas } = usePresencas();
  const { professores } = useProfessores();
  const { treinos } = useTreinos();

  const aluno =
    id === "temp_aluno"
      ? {
          id: "temp_aluno",
          nome: "Aluno",
          email: "aluno@temp.com",
          telefone: "(00) 00000-0000",
          senha: "123",
          foto: "",
          dataNascimento: "01/01/2000",
          faixa: "Branca",
          graus: 1,
          historicoGraduacao: [
            {
              id: "grad-temp",
              faixa: "Branca",
              data: "01/01/2024",
              professor: "Admin",
              observacao: "Graduação de demonstração",
            },
          ],
          turma: "Adulto Noite",
          professorId: undefined,
          dataEntrada: new Date().toISOString(),
          ativo: true,
          mensalidade: "Em dia",
          valorMensalidade: "R$ 150,00",
          diaVencimento: 10,
          proximaCobranca: new Date().toISOString().slice(0, 10),
          cobrancas: [],
          observacao: "Aluno de demonstração.",
          criadoEm: new Date().toISOString(),
        }
      : buscarAluno(id);

  if (!aluno) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Aluno não encontrado</Text>
      </View>
    );
  }

  const professor = professores.find(p => p.id === aluno.professorId);

  const ultimaGraduacao = aluno.historicoGraduacao?.slice(-1)[0]?.data;

  const informacoes = [
    ['Telefone', aluno.telefone],
    ['E-mail', aluno.email],
    ['Nascimento', aluno.dataNascimento],
    ['Turma', aluno.turma],
    ['Professor', professor?.nome],
    ['Mensalidade', aluno.mensalidade],
    ['Valor', aluno.valorMensalidade],
    [
      'Vencimento',
      aluno.diaVencimento
        ? `Todo dia ${aluno.diaVencimento}`
        : 'Não informado',
    ],
  ].filter(([, valor]) => Boolean(valor));

  const historicoPresenca = presencas
    .filter((item) => item.alunoId === aluno.id)
    .sort((a, b) => b.data.localeCompare(a.data));

  const presentes = historicoPresenca.filter((i) => i.status === 'presente').length;
  const faltas = historicoPresenca.filter((i) => i.status === 'falta').length;
  const justificados = historicoPresenca.filter((i) => i.status === 'justificado').length;

  const frequencia = historicoPresenca.length
    ? Math.round((presentes / historicoPresenca.length) * 100)
    : 0;

  const cobrancasPendentes = aluno.cobrancas.filter((c) => !c.pagoEm);
  const hoje = new Date().toISOString().slice(0, 10);
  const cobrancasAtrasadas = cobrancasPendentes.filter((c) => c.vencimento < hoje);

  const isAdmin = userLogado?.tipo === 'professor';

  function handleAlterarSenha() {
    promptText(
      "Alterar Senha",
      "Digite a nova senha:",
      (novaSenha) => {
        if (novaSenha === null) return; // Cancelado

        if (novaSenha.trim().length < 4) {
          Alert.alert("Senha muito curta", "A senha deve ter no mínimo 4 caracteres.");
          return;
        }

        promptText(
          "Confirme a Senha",
          "Digite a nova senha novamente:",
          (confirmacaoSenha) => {
            if (novaSenha.trim() !== confirmacaoSenha?.trim()) {
              Alert.alert("Erro", "As senhas não coincidem. Tente novamente.");
              return;
            }

            editarAluno({ ...aluno!, senha: novaSenha.trim() });
            Alert.alert("Sucesso!", "Sua senha foi alterada.");
          },
          "secure-text"
        );
      },
      "secure-text"
    );
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir aluno',
      `Deseja excluir ${aluno!.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removerAluno(aluno!.id);
            router.back();
          }
        }
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {aluno.foto ? (
          <Image source={{ uri: aluno.foto }} style={styles.photo} />
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoText}>Sem foto</Text>
          </View>
        )}

        <Text style={styles.title}>{aluno.nome}</Text>
        <Text style={styles.subtitle}>
          {aluno.faixa} • {aluno.graus || 0} grau(s)
        </Text>
        <Text style={styles.status}>
          {aluno.ativo ? 'ATIVO' : 'INATIVO'}
        </Text>
      </View>

      <View style={styles.card}>
        {informacoes.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
        {ultimaGraduacao && (
          <View style={styles.row}>
            <Text style={styles.label}>Última Graduação</Text>
            <Text style={styles.value}>{ultimaGraduacao}</Text>
          </View>
        )}
      </View>

      {/* FREQUÊNCIA */}
      <Text style={styles.sectionTitle}>Frequência nos Treinos</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Frequência geral</Text>
          <Text style={styles.value}>{frequencia}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Presenças</Text>
          <Text style={styles.value}>{presentes}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Faltas</Text>
          <Text style={styles.value}>{faltas}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Faltas Justificadas</Text>
          <Text style={styles.value}>{justificados}</Text>
        </View>
      </View>


      {/* FINANCEIRO */}
      <Text style={styles.sectionTitle}>Financeiro</Text>

      <View style={[
        styles.financeCard,
        cobrancasAtrasadas.length > 0 && styles.financeOverdue
      ]}>
        <Text style={styles.financeTitle}>
          {cobrancasAtrasadas.length > 0
            ? 'INADIMPLENTE'
            : cobrancasPendentes.length > 0
              ? 'PENDENTE'
              : 'OK'}
        </Text>

        <Text style={styles.financeText}>
          {cobrancasPendentes.length} pendente(s) • {cobrancasAtrasadas.length} atrasada(s)
        </Text>
      </View>

      <Pressable
        style={styles.financeButton}
        onPress={() =>
          router.push({
            pathname: '/aluno/financeiro/[id]',
            params: { id: aluno.id },
          })
        }
      >
        <Text style={styles.buttonText}>Ver cobranças</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push(`/aluno/editar/${aluno.id}`)}>
        <Text style={styles.buttonText}>Editar</Text>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={confirmarExclusao}>
        <Text style={styles.buttonText}>Excluir</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: 20,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  noPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noPhotoText: {
    color: COLORS.muted,
  },

  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },

  subtitle: {
    color: COLORS.textSecondary,
  },

  status: {
    color: COLORS.primary,
    marginTop: 6,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
  },

  row: {
    marginBottom: 12,
  },

  label: {
    color: COLORS.muted,
  },

  value: {
    color: COLORS.white,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 20,
  },

  financeCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  financeOverdue: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },

  financeTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

  financeText: {
    color: COLORS.textSecondary,
  },

  financeButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    marginTop: 10,
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
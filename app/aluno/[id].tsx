import { COLORS } from '@/components/Colors';
import {
  Aluno,
  Cobranca,
  useDojo,
} from '@/components/context/DojoContext';
import { usePresencas } from '@/components/context/PresencaContext';
import { useProfessores } from '@/components/context/ProfessorContext';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ============================================================
// ALUNO TEMPORÁRIO
// ============================================================

const ALUNO_TEMPORARIO: Aluno = {
  id: 'temp_aluno',
  nome: 'Aluno',
  email: 'aluno@temp.com',
  telefone: '(00) 00000-0000',
  foto: '',
  dataNascimento: '01/01/2000',
  faixa: 'Branca',
  graus: 1,

  historicoGraduacao: [
    {
      id: 'grad-temp',
      faixa: 'Branca',
      data: '01/01/2024',
      professor: 'Admin',
      observacao: 'Graduação de demonstração',
    },
  ],

  turma: 'Adulto Noite',
  professorId: undefined,
  dataEntrada: new Date().toISOString(),

  ativo: true,

  mensalidade: 'Em dia',
  valorMensalidade: 'R$ 150,00',
  diaVencimento: 10,

  proximaCobranca: new Date().toISOString().slice(0, 10),

  cobrancas: [],

  observacao: 'Aluno de demonstração.',
  criadoEm: new Date().toISOString(),
};

// ============================================================
// TELA
// ============================================================

export default function PerfilAluno() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const alunoId =
    Array.isArray(id) ? id[0] : id;

  const {
    alunos,
    editarAluno,
    removerAluno,
  } = useDojo();

  const { presencas } =
    usePresencas();

  const { professores } =
    useProfessores();

  // ==========================================================
  // BUSCAR ALUNO
  // ==========================================================

  const alunoEncontrado: Aluno | undefined =
    alunoId === 'temp_aluno'
      ? ALUNO_TEMPORARIO
      : alunoId
        ? alunos.find(
            (item) =>
              String(item.id) ===
              String(alunoId)
          )
        : undefined;

  // ==========================================================
  // ALUNO NÃO ENCONTRADO
  // ==========================================================

  if (!alunoEncontrado) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>
          Aluno não encontrado
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  // Depois desta validação o TypeScript entende
  // que aluno é definitivamente um Aluno.
  const aluno: Aluno = alunoEncontrado;

  // ==========================================================
  // PROFESSOR
  // ==========================================================

  const professor =
    professores.find(
      (item) =>
        String(item.id) ===
        String(aluno.professorId)
    );

  // ==========================================================
  // GRADUAÇÃO
  // ==========================================================

  const ultimaGraduacao =
    aluno.historicoGraduacao?.slice(-1)[0]?.data;

  // ==========================================================
  // INFORMAÇÕES
  // ==========================================================

  const informacoes: Array<{
    label: string;
    value: string | number;
  }> = [
    {
      label: 'Telefone',
      value: aluno.telefone,
    },

    {
      label: 'E-mail',
      value: aluno.email,
    },

    {
      label: 'Nascimento',
      value: aluno.dataNascimento,
    },

    {
      label: 'Turma',
      value: aluno.turma,
    },

    ...(professor?.nome
      ? [
          {
            label: 'Professor',
            value: professor.nome,
          },
        ]
      : []),

    {
      label: 'Mensalidade',
      value: aluno.mensalidade,
    },

    {
      label: 'Valor',
      value: aluno.valorMensalidade,
    },

    {
      label: 'Vencimento',
      value: aluno.diaVencimento
        ? `Todo dia ${aluno.diaVencimento}`
        : 'Não informado',
    },
  ].filter(
    (item) =>
      item.value !== undefined &&
      item.value !== null &&
      String(item.value).trim() !== ''
  );

  // ==========================================================
  // FREQUÊNCIA
  // ==========================================================

  const historicoPresenca =
    presencas
      .filter(
        (item) =>
          String(item.alunoId) ===
          String(aluno.id)
      )
      .sort((a, b) =>
        b.data.localeCompare(a.data)
      );

  const presentes =
    historicoPresenca.filter(
      (item) =>
        item.status === 'presente'
    ).length;

  const faltas =
    historicoPresenca.filter(
      (item) =>
        item.status === 'falta'
    ).length;

  const justificados =
    historicoPresenca.filter(
      (item) =>
        item.status === 'justificado'
    ).length;

  const frequencia =
    historicoPresenca.length > 0
      ? Math.round(
          (presentes /
            historicoPresenca.length) *
            100
        )
      : 0;

  // ==========================================================
  // FINANCEIRO
  // ==========================================================

  const cobrancas: Cobranca[] =
    Array.isArray(aluno.cobrancas)
      ? aluno.cobrancas
      : [];

  const cobrancasPendentes =
    cobrancas.filter(
      (c: Cobranca) =>
        !c.pagoEm
    );

  const hoje =
    new Date()
      .toISOString()
      .slice(0, 10);

  const cobrancasAtrasadas =
    cobrancasPendentes.filter(
      (c: Cobranca) =>
        c.vencimento < hoje
    );

  // ==========================================================
  // EXCLUIR ALUNO
  // ==========================================================

  function confirmarExclusao() {
    Alert.alert(
      'Excluir aluno',
      `Deseja excluir ${aluno.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },

        {
          text: 'Excluir',
          style: 'destructive',

          onPress: () => {
            removerAluno(
              String(aluno.id)
            );

            router.back();
          },
        },
      ]
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* CABEÇALHO */}

      <View style={styles.header}>
        {aluno.foto ? (
          <Image
            source={{
              uri: aluno.foto,
            }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.noPhoto}>
            <Text
              style={
                styles.noPhotoText
              }
            >
              Sem foto
            </Text>
          </View>
        )}

        <Text style={styles.title}>
          {aluno.nome}
        </Text>

        <Text style={styles.subtitle}>
          {aluno.faixa} •{' '}
          {aluno.graus || 0} grau(s)
        </Text>

        <Text style={styles.status}>
          {aluno.ativo
            ? 'ATIVO'
            : 'INATIVO'}
        </Text>
      </View>

      {/* INFORMAÇÕES */}

      <View style={styles.card}>
        {informacoes.map(
          ({ label, value }) => (
            <View
              key={label}
              style={styles.row}
            >
              <Text
                style={styles.label}
              >
                {label}
              </Text>

              <Text
                style={styles.value}
              >
                {String(value)}
              </Text>
            </View>
          )
        )}

        {ultimaGraduacao && (
          <View style={styles.row}>
            <Text
              style={styles.label}
            >
              Última Graduação
            </Text>

            <Text
              style={styles.value}
            >
              {ultimaGraduacao}
            </Text>
          </View>
        )}
      </View>

      {/* FREQUÊNCIA */}

      <Text
        style={styles.sectionTitle}
      >
        Frequência nos Treinos
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text
            style={styles.label}
          >
            Frequência geral
          </Text>

          <Text
            style={styles.value}
          >
            {frequencia}%
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={styles.label}
          >
            Presenças
          </Text>

          <Text
            style={styles.value}
          >
            {presentes}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={styles.label}
          >
            Faltas
          </Text>

          <Text
            style={styles.value}
          >
            {faltas}
          </Text>
        </View>

        <View style={styles.rowLast}>
          <Text
            style={styles.label}
          >
            Faltas Justificadas
          </Text>

          <Text
            style={styles.value}
          >
            {justificados}
          </Text>
        </View>
      </View>

      {/* FINANCEIRO */}

      <Text
        style={styles.sectionTitle}
      >
        Financeiro
      </Text>

      <View
        style={[
          styles.financeCard,
          cobrancasAtrasadas.length >
            0 &&
            styles.financeOverdue,
        ]}
      >
        <Text
          style={styles.financeTitle}
        >
          {cobrancasAtrasadas.length >
          0
            ? 'INADIMPLENTE'
            : cobrancasPendentes.length >
                0
              ? 'PENDENTE'
              : 'OK'}
        </Text>

        <Text
          style={styles.financeText}
        >
          {cobrancasPendentes.length}{' '}
          pendente(s) •{' '}
          {cobrancasAtrasadas.length}{' '}
          atrasada(s)
        </Text>
      </View>

      {/* COBRANÇAS */}

      <Pressable
        style={
          styles.financeButton
        }
        onPress={() =>
          router.push({
            pathname:
              '/aluno/financeiro/[id]',
            params: {
              id: String(aluno.id),
            },
          })
        }
      >
        <Text
          style={
            styles.financeButtonText
          }
        >
          Ver cobranças
        </Text>
      </Pressable>

      {/* EDITAR */}

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push({
            pathname:
              '/aluno/editar/[id]',
            params: {
              id: String(aluno.id),
            },
          })
        }
      >
        <Text
          style={styles.buttonText}
        >
          Editar
        </Text>
      </Pressable>

      {/* EXCLUIR */}

      <Pressable
        style={
          styles.deleteButton
        }
        onPress={
          confirmarExclusao
        }
      >
        <Text
          style={styles.buttonText}
        >
          Excluir
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor:
      COLORS.background,
  },

  centered: {
    flex: 1,
    justifyContent:
      'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor:
      COLORS.background,
  },

  header: {
    alignItems: 'center',
    marginBottom: 18,
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
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      COLORS.card,
  },

  noPhotoText: {
    color: COLORS.muted,
  },

  title: {
    marginTop: 10,
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
  },

  status: {
    marginTop: 6,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor:
      COLORS.card,
  },

  row: {
    marginBottom: 12,
  },

  rowLast: {
    marginBottom: 0,
  },

  label: {
    marginBottom: 3,
    color: COLORS.muted,
  },

  value: {
    color: COLORS.white,
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  financeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor:
      COLORS.card,
  },

  financeOverdue: {
    borderWidth: 1,
    borderColor:
      COLORS.danger,
  },

  financeTitle: {
    marginBottom: 5,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  financeText: {
    color:
      COLORS.textSecondary,
  },

  financeButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      COLORS.primary,
  },

  financeButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  button: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor:
      COLORS.primary,
  },

  deleteButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor:
      COLORS.danger,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
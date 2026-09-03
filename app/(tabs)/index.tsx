import { COLORS } from "@/components/Colors";
import { useDojo } from "@/components/context/DojoContext";
import { useProfessores } from "@/components/context/ProfessorContext";
import { useTreinos } from "@/components/context/TreinoContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";

export default function Index() {
  const { alunos, userLogado } = useDojo();
  const { professores } = useProfessores();
  const { treinos } = useTreinos();

  const [listaAlunosVisivel, setListaAlunosVisivel] =
    useState(true);

  const totalAlunos = alunos.filter(
    (aluno) => aluno.ativo
  ).length;

  const totalProfessores = professores.filter(
    (professor) => professor.ativo
  ).length;

  const hoje = new Date()
    .toISOString()
    .slice(0, 10);

  // ==============================
  // MENSALIDADES ATRASADAS
  // ==============================

  const mensalidadesAtrasadas = alunos.filter(
    (aluno) => {
      const cobrancas = Array.isArray(
        aluno.cobrancas
      )
        ? aluno.cobrancas
        : [];

      return cobrancas.some(
        (cobranca) =>
          !cobranca.pagoEm &&
          cobranca.vencimento < hoje
      );
    }
  );

  // ==============================
  // GRADUAÇÕES
  // ==============================

  const totalGraduacoes = alunos.reduce(
    (total, aluno) =>
      total +
      (Array.isArray(
        aluno.historicoGraduacao
      )
        ? aluno.historicoGraduacao.length
        : 0),
    0
  );

  const diasSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  const diaHoje = diasSemana[new Date().getDay()];

  const treinosHoje = treinos.filter(
    (treino) => treino.dia === diaHoje
  ).length;

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

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
      >
      {/* CABEÇALHO */}

      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            MEU DOJO
          </Text>

          <View style={styles.logoDivider} />

          <Text style={styles.subtitle}>
            Gestão da Academia
          </Text>
        </View>

        {userLogado && (
          <View style={styles.userBox}>
            <Text style={styles.userName}>
              {userLogado.nome}
            </Text>

            <Text style={styles.userRole}>
              Professor
            </Text>
          </View>
        )}
      </View>

      {/* INDICADORES */}

      <View style={styles.grid}>
        <View style={styles.card}>
          <Ionicons name="people-outline" size={18} color={COLORS.textSecondary} style={styles.cardIcon} />
          <Text style={styles.title}>
            Alunos ativos
          </Text>

          <Text style={styles.number}>
            {totalAlunos}
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="school-outline" size={18} color={COLORS.textSecondary} style={styles.cardIcon} />
          <Text style={styles.title}>
            Professores
          </Text>

          <Text style={styles.number}>
            {totalProfessores}
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} style={styles.cardIcon} />
          <Text style={styles.title}>
            Treinos hoje
          </Text>

          <Text style={styles.number}>
            {treinosHoje}
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="trophy-outline" size={18} color={COLORS.textSecondary} style={styles.cardIcon} />
          <Text style={styles.title}>
            Graduações
          </Text>

          <Text style={styles.number}>
            {totalGraduacoes}
          </Text>
        </View>
      </View>

      {/* ALERTA FINANCEIRO */}

      {mensalidadesAtrasadas.length > 0 && (
        <View style={styles.financeAlert}>
          <Text
            style={
              styles.financeAlertTitle
            }
          >
            Mensalidades em atraso
          </Text>

          <Text
            style={
              styles.financeAlertText
            }
          >
            {mensalidadesAtrasadas.length}{" "}
            aluno(s) com cobrança vencida.
          </Text>
        </View>
      )}

      {/* BOTÕES */}

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.push("/financeiro")
        }
      >
        <Text style={styles.buttonText}>
          Ver painel financeiro
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push("/professores")
        }
      >
        <Text style={styles.buttonText}>
          Gerenciar professores
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push("/turmas")
        }
      >
        <Text style={styles.buttonText}>
          Gerenciar turmas
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push("/agenda")
        }
      >
        <Text style={styles.buttonText}>
          Ver agenda semanal
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push("/graduacoes")
        }
      >
        <Text style={styles.buttonText}>
          Gerenciar graduações
        </Text>
      </Pressable>

      {/* ALUNOS */}

      <View style={styles.listaContainer}>
        <View style={styles.listaHeader}>
          <Text style={styles.listaTitulo}>
            Alunos cadastrados
          </Text>

          <Pressable
            onPress={() =>
              setListaAlunosVisivel(
                !listaAlunosVisivel
              )
            }
          >
            <Text
              style={
                styles.toggleButton
              }
            >
              {listaAlunosVisivel
                ? "Minimizar"
                : "Mostrar"}
            </Text>
          </Pressable>
        </View>

        {listaAlunosVisivel &&
          (alunos.length === 0 ? (
            <Text style={styles.vazio}>
              Nenhum aluno cadastrado
            </Text>
          ) : (
            alunos.map((aluno) => (
              <View
                key={aluno.id}
                style={styles.alunoCard}
              >
                <Text
                  style={
                    styles.alunoNome
                  }
                >
                  {aluno.nome}
                </Text>

                <Text
                  style={
                    styles.alunoInfo
                  }
                >
                  Faixa: {aluno.faixa}
                </Text>
              </View>
            ))
          ))}
      </View>

      {/* RODAPÉ */}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>
          Academia preparada
        </Text>

        <Text style={styles.footerText}>
          Cadastre alunos e professores para
          iniciar a gestão do MEU DOJO.
        </Text>
      </View>
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
    flex: 1,
    backgroundColor: "transparent",
  },

  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 32,
    paddingBottom: 48,
  },

   header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  logo: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 2,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 0,
  },

  logoDivider: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    alignSelf: "flex-start",
    marginBottom: 2,
  },

  userBox: {
    alignItems: "flex-end",
  },

  userName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  userRole: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
  },

  card: {
    backgroundColor: COLORS.card,
    width: "48%",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    marginBottom: 14,
  },

  cardIcon: {
    marginBottom: 8,
  },

  title: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  number: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },

  financeAlert: {
    backgroundColor: "#7F1D1D",
    borderRadius: 15,
    padding: 16,
    marginTop: 8,
  },

  financeAlertTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  financeAlertText: {
    color: COLORS.textSecondary,
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor:
      COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    padding: 18,
    marginTop: 16,
  },

  secondaryButton: {
    backgroundColor:
      COLORS.card,
    borderColor:
      COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    padding: 18,
    marginTop: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },

  listaContainer: {
    marginTop: 28,
  },

  listaHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  listaTitulo: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
  },

  toggleButton: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  vazio: {
    color: COLORS.muted,
  },

  alunoCard: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    marginBottom: 10,
  },

  alunoNome: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },

  alunoInfo: {
    color: COLORS.muted,
    marginTop: 4,
  },

  footerCard: {
    marginTop: 28,
    backgroundColor:
      COLORS.card,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },

  footerTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
  },

  footerText: {
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 20,
  },
});
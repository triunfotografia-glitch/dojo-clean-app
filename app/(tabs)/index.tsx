import { COLORS } from "@/components/Colors";
import { useDojo } from "@/components/context/DojoContext";
import { useProfessores } from "@/components/context/ProfessorContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const { alunos, userLogado } = useDojo();
  const { professores } = useProfessores();

  const [listaAlunosVisivel, setListaAlunosVisivel] =
    useState(true);

  const totalAlunos = alunos.length;

  const totalProfessores = professores.length;

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

  const treinosHoje = 0;

  return (
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
            DOJO LB
          </Text>

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
          <Text style={styles.title}>
            Alunos ativos
          </Text>

          <Text style={styles.number}>
            {totalAlunos}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Professores
          </Text>

          <Text style={styles.number}>
            {totalProfessores}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Treinos hoje
          </Text>

          <Text style={styles.number}>
            {treinosHoje}
          </Text>
        </View>

        <View style={styles.card}>
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
          iniciar a gestão do DOJO LB.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 2,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 4,
  },

  userBox: {
    alignItems: "flex-end",
  },

  userName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  userRole: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 4,
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
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  title: {
    color: COLORS.muted,
    fontSize: 14,
  },

  number: {
    color: COLORS.text,
    fontSize: 38,
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
    borderRadius: 15,
    alignItems: "center",
    padding: 16,
    marginTop: 18,
  },

  secondaryButton: {
    borderColor:
      COLORS.primary,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    padding: 16,
    marginTop: 12,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  listaContainer: {
    marginTop: 35,
  },

  listaHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  listaTitulo: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  toggleButton: {
    color: COLORS.primary,
    fontWeight: "bold",
  },

  vazio: {
    color: COLORS.muted,
  },

  alunoCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  alunoNome: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  alunoInfo: {
    color: COLORS.muted,
    marginTop: 6,
  },

  footerCard: {
    marginTop: 35,
    backgroundColor:
      COLORS.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  footerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  footerText: {
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 20,
  },
});
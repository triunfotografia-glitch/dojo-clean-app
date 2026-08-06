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
  const { alunos } = useDojo();
  const { professores } = useProfessores();

  const [listaAlunosVisivel, setListaAlunosVisivel] = useState(true);

  const totalAlunos = alunos.length;
  const totalProfessores = professores.length;
  const hoje = new Date().toISOString().slice(0, 10);
  const mensalidadesAtrasadas = alunos.filter((aluno) =>
    aluno.cobrancas.some((cobranca) => !cobranca.pagoEm && cobranca.vencimento < hoje),
  );
  // Calcula o total de graduações somando o tamanho do histórico de cada aluno
  const totalGraduacoes = alunos.reduce((total, aluno) => total + (aluno.historicoGraduacao?.length || 0), 0);
  const treinosHoje = 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      <Text style={styles.logo}>
        DOJO LB
      </Text>

      <Text style={styles.subtitle}>
        Gestão da Academia
      </Text>

      {/* GRID */}
      <View style={styles.grid}>

        <View style={styles.card}>
          <Text style={styles.title}>Alunos ativos</Text>
          <Text style={styles.number}>{totalAlunos}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Professores</Text>
          <Text style={styles.number}>{totalProfessores}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Treinos hoje</Text>
          <Text style={styles.number}>{treinosHoje}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Graduações</Text>
          <Text style={styles.number}>{totalGraduacoes}</Text>
        </View>

      </View>

      {mensalidadesAtrasadas.length > 0 ? (
        <View style={styles.financeAlert}>
          <Text style={styles.financeAlertTitle}>Mensalidades em atraso</Text>
          <Text style={styles.financeAlertText}>
            {mensalidadesAtrasadas.length} aluno(s) com cobrança vencida.
          </Text>
        </View>
      ) : null}

      <Pressable
        style={styles.financeButton}
        onPress={() => router.push('/financeiro')}
      >
        <Text style={styles.professoresButtonText}>Ver painel financeiro</Text>
      </Pressable>

      <Pressable
        style={styles.professoresButton}
        onPress={() => router.push({ pathname: '/professores' })}
      >
        <Text style={styles.professoresButtonText}>Gerenciar professores</Text>
      </Pressable>

      <Pressable
        style={styles.professoresButton}
        onPress={() => router.push({ pathname: '/turmas' })}
      >
        <Text style={styles.professoresButtonText}>Gerenciar turmas</Text>
      </Pressable>

      <Pressable
        style={styles.professoresButton}
        onPress={() => router.push({ pathname: '/agenda' })}
      >
        <Text style={styles.professoresButtonText}>Ver agenda semanal</Text>
      </Pressable>

      {/* LISTA DE ALUNOS */}
      <View style={styles.listaContainer}>
        <View style={styles.listaHeader}>
          <Text style={styles.listaTitulo}>
            Alunos cadastrados
          </Text>
          <Pressable onPress={() => setListaAlunosVisivel(!listaAlunosVisivel)}>
            <Text style={styles.toggleButton}>
              {listaAlunosVisivel ? "Minimizar" : "Mostrar"}
            </Text>
          </Pressable>
        </View>

        {listaAlunosVisivel && (
          <>
            {alunos.length === 0 ? (
              <Text style={styles.vazio}>
                Nenhum aluno cadastrado
              </Text>
            ) : (
              alunos.map((aluno) => (
                <View key={aluno.id} style={styles.alunoCard}>
                  <Text style={styles.alunoNome}>
                    {aluno.nome}
                  </Text>
                  <Text style={styles.alunoInfo}>
                    Faixa: {aluno.faixa}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>
          Academia preparada
        </Text>

        <Text style={styles.footerText}>
          Cadastre alunos e professores para iniciar a gestão do DOJO LB.
        </Text>
      </View>

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

  logo: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 2,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: 5,
    marginBottom: 35,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: COLORS.card,
    width: "48%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15, // 🔥 substitui o gap
  },

  title: {
    color: COLORS.muted,
    fontSize: 14,
  },

  number: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 12,
  },

  listaContainer: {
    marginTop: 30,
  },

  listaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  alunoNome: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  alunoInfo: {
    color: COLORS.muted,
    marginTop: 5,
  },

  footerCard: {
    marginTop: 30,
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  professoresButton: {
    alignItems: "center",
    borderColor: COLORS.primary,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 10,
    padding: 15,
  },
  financeButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginTop: 18,
    padding: 15,
  },
  professoresButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  financeAlert: {
    backgroundColor: "#7F1D1D",
    borderRadius: 15,
    marginTop: 10,
    padding: 16,
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

  footerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  footerText: {
    color: COLORS.muted,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  contentContainer: {
    paddingBottom: 120,
  },
});

import { COLORS } from '@/components/Colors';
import {
  Graduacao,
  useDojo,
} from '@/components/context/DojoContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  deleteGraduacao,
  getGraduacoes,
} from '@/services/api';

export default function Graduacoes() {
  const [graduacoes, setGraduacoes] =
    useState<Graduacao[]>([]);
  const [carregando, setCarregando] =
    useState(true);
  const [erro, setErro] =
    useState<string | null>(null);

  const { alunos } = useDojo();

  async function carregar() {
    try {
      setCarregando(true);
      setErro(null);

      const dados =
        await getGraduacoes();

      setGraduacoes(dados || []);
    } catch (error) {
      console.error(
        'Erro ao carregar graduações:',
        error
      );

      setErro(
        'Não foi possível carregar as graduações.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  function buscarNomeAluno(
    graduacao: Graduacao
  ): string {
    const alunoId =
      graduacao.alunoId;

    if (!alunoId) {
      return 'Aluno não identificado';
    }

    const aluno =
      alunos.find((item) =>
        String(item.id) === String(alunoId)
      );

    return aluno?.nome || 'Aluno não encontrado';
  }

  function confirmarExclusao(
    graduacao: Graduacao
  ) {
    Alert.alert(
      'Excluir graduação',
      `Deseja excluir a graduação de ${buscarNomeAluno(graduacao)} na faixa ${graduacao.faixa}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGraduacao(
                String(graduacao.id)
              );

              setGraduacoes((lista) =>
                lista.filter(
                  (item) =>
                    String(item.id) !==
                    String(graduacao.id)
                )
              );

              Alert.alert(
                'Sucesso',
                'Graduação excluída.'
              );
            } catch (error) {
              console.error(
                'Erro ao excluir graduação:',
                error
              );

              Alert.alert(
                'Erro',
                error instanceof Error
                  ? error.message
                  : 'Não foi possível excluir a graduação.'
              );
            }
          },
        },
      ]
    );
  }

  function renderItem({
    item,
  }: {
    item: Graduacao;
  }) {
    const nomeAluno =
      buscarNomeAluno(item);

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.alunoNome}>
              {nomeAluno}
            </Text>

            <Text style={styles.faixa}>
              {item.faixa}
            </Text>

            {item.data ? (
              <Text style={styles.data}>
                {item.data}
              </Text>
            ) : null}

            {item.observacao ? (
              <Text style={styles.observacao}>
                {item.observacao}
              </Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.editButton,
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    '/graduacoes/editar/[id]',
                  params: {
                    id: String(item.id),
                  },
                })
              }
            >
              <Text style={styles.actionText}>
                Editar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.deleteButton,
              ]}
              onPress={() =>
                confirmarExclusao(item)
              }
            >
              <Text style={styles.actionText}>
                Excluir
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loading}>
          Carregando graduações...
        </Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {erro}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={carregar}
        >
          <Text style={styles.retryText}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Graduações
      </Text>

      <Pressable
        style={styles.createButton}
        onPress={() =>
          router.push('/graduacoes/novo')
        }
      >
        <Text style={styles.createButtonText}>
          + Nova graduação
        </Text>
      </Pressable>

      <FlatList
        data={graduacoes}
        keyExtractor={(item) =>
          String(item.id)
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Nenhuma graduação cadastrada.
            </Text>
          </View>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: 25,
    paddingTop: 70,
  },

  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  createButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginBottom: 20,
    padding: 16,
  },

  createButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerInfo: {
    flex: 1,
  },

  alunoNome: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  faixa: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  data: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },

  observacao: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },

  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  editButton: {
    backgroundColor: COLORS.primary,
  },

  deleteButton: {
    borderColor: '#E53935',
    borderWidth: 1,
  },

  actionText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 25,
  },

  loading: {
    color: COLORS.muted,
    fontSize: 16,
  },

  error: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 16,
    textAlign: 'center',
  },
});

import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { usePix } from '@/components/context/PixContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Perfil() {

  const {
    chavePix,
    nomeRecebedor,
    cidadeRecebedor,
    salvarConfiguracaoPix,
    chavesPix,
    carregarTodasChavesPix,
    salvarChavePix,
    editarChavePix,
    excluirChavePix,
  } = usePix();

  const { userLogado, logout } = useDojo();


  const [chave, setChave] = useState('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');

  const [modalChaveAberta, setModalChaveAberta] =
    useState(false);
  const [editandoChaveId, setEditandoChaveId] =
    useState<string | null>(null);
  const [novaIdentificacao, setNovaIdentificacao] =
    useState('');
  const [novaChavePix, setNovaChavePix] = useState('');
  const [novoTipo, setNovoTipo] = useState('aleatoria');
  const [novaDescricao, setNovaDescricao] =
    useState('');


  useEffect(() => {

    setChave(chavePix);
    setNome(nomeRecebedor);
    setCidade(cidadeRecebedor);

  }, [
    chavePix,
    nomeRecebedor,
    cidadeRecebedor
  ]);


  useEffect(() => {
    if (
      userLogado?.administrador === true
    ) {
      carregarTodasChavesPix();
    }
  }, [
    userLogado?.administrador,
    carregarTodasChavesPix
  ]);

  useEffect(() => {
  }, [userLogado]);


  async function salvar() {

    if (!chave.trim()) {

      Alert.alert(
        'Chave PIX obrigatória',
        'Informe uma chave PIX para receber pagamentos.'
      );

      return;

    }

    try {

      await salvarConfiguracaoPix(
        chave,
        nome || 'DOJO LB',
        cidade || 'SAO PAULO'
      );

      Alert.alert(
        'PIX configurado',
        'Agora os alunos poderão gerar pagamentos PIX pelo financeiro.'
      );

    } catch (error) {

      console.error(error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar a configuração PIX.'
      );

    }

  }

  function abrirModalNovaChave() {
    setEditandoChaveId(null);
    setNovaIdentificacao('');
    setNovaChavePix('');
    setNovoTipo('aleatoria');
    setNovaDescricao('');
    setModalChaveAberta(true);
  }

  function abrirModalEditarChave(
    chavePix: any
  ) {
    setEditandoChaveId(chavePix.id);
    setNovaIdentificacao(
      chavePix.nome_identificacao || ''
    );
    setNovaChavePix(chavePix.chave_pix || '');
    setNovoTipo(chavePix.tipo || 'aleatoria');
    setNovaDescricao(chavePix.descricao || '');
    setModalChaveAberta(true);
  }

  function fecharModalChave() {
    setModalChaveAberta(false);
    setEditandoChaveId(null);
    setNovaIdentificacao('');
    setNovaChavePix('');
    setNovoTipo('aleatoria');
    setNovaDescricao('');
  }

  async function salvarChave() {
    if (
      !novaIdentificacao.trim() ||
      !novaChavePix.trim()
    ) {
      Alert.alert(
        'Campos obrigatórios',
        'Informe a identificação e a chave PIX.'
      );
      return;
    }

    try {
      if (editandoChaveId) {
        await editarChavePix(
          editandoChaveId,
          {
            nome_identificacao:
              novaIdentificacao.trim(),
            chave_pix: novaChavePix.trim(),
            tipo: novoTipo,
            descricao: novaDescricao.trim(),
          }
        );

        Alert.alert(
          'Sucesso',
          'Chave PIX atualizada.'
        );
      } else {
        await salvarChavePix({
          nome_identificacao:
            novaIdentificacao.trim(),
          chave_pix: novaChavePix.trim(),
          tipo: novoTipo,
          descricao: novaDescricao.trim(),
          ativo: true,
        });

        Alert.alert(
          'Sucesso',
          'Chave PIX cadastrada.'
        );
      }

      fecharModalChave();
      if (userLogado?.administrador === true) {
        await carregarTodasChavesPix();
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar a chave PIX."
      );
    }
  }

  async function confirmarExclusaoChave(
    id: string
  ) {
    Alert.alert(
      'Excluir chave PIX',
      'Tem certeza que deseja excluir esta chave?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirChavePix(id);
              Alert.alert(
                "Sucesso",
                "Chave PIX excluída."
              );
              await carregarTodasChavesPix();
            } catch (error) {
              console.error(error);
              Alert.alert(
                "Erro",
                "Não foi possível excluir a chave PIX."
              );
            }
          },
        },
      ]
    );
  }

  async function alternarStatusChave(
    chavePix: any
  ) {
    try {
      await editarChavePix(chavePix.id, {
        ativo: !chavePix.ativo,
      });
      await carregarTodasChavesPix();
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Não foi possível alterar o status da chave PIX."
      );
    }
  }

  function handleLogout() {
    Alert.alert(
      "Sair do Aplicativo",
      "Você tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  }


  return (
    <>
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Perfil da academia
      </Text>


      <Text style={styles.subtitle}>
        Configure os dados de recebimento.
      </Text>



      <View style={styles.card}>


        <Text style={styles.section}>
          Configuração PIX
        </Text>


        <Text style={styles.help}>
          Informe a chave PIX que receberá as mensalidades dos alunos.
        </Text>



        <TextInput
          style={styles.input}
          value={chave}
          onChangeText={setChave}
          placeholder="Chave PIX"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
        />


        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do recebedor"
          placeholderTextColor={COLORS.muted}
        />


        <TextInput
          style={styles.input}
          value={cidade}
          onChangeText={setCidade}
          placeholder="Cidade"
          placeholderTextColor={COLORS.muted}
        />



        <Pressable
          style={styles.button}
          onPress={salvar}
        >

          <Text style={styles.buttonText}>
            Salvar PIX
          </Text>

        </Pressable>



      </View>

      {/* Card visível apenas para o administrador principal */}
      {userLogado?.tipo === 'professor' && userLogado?.administrador === true && (
        <View style={styles.card}>
          <Text style={styles.section}>
            Gerenciar Acessos
          </Text>
          <Text style={styles.help}>
            Crie e edite os logins de professores.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/acessos')}
          >
            <Text style={styles.buttonText}>Gerenciar Acessos</Text>
          </Pressable>
        </View>
      )}

      {/* Card de gerenciamento de chaves PIX - apenas admin */}
      {userLogado?.tipo === 'professor' && userLogado?.administrador === true && (
        <View style={styles.card}>
          <Text style={styles.section}>
            Gerenciar Chaves PIX
          </Text>
          <Text style={styles.help}>
            Cadastre e gerencie as chaves PIX que os professores poderão selecionar ao enviar cobranças.
          </Text>

          {chavesPix.map((chavePix) => (
            <View
              key={chavePix.id}
              style={styles.chaveItem}
            >
              <View style={styles.chaveInfo}>
                <Text style={styles.chaveNome}>
                  {chavePix.nome_identificacao}
                </Text>
                <Text style={styles.chaveDetalhe}>
                  {chavePix.tipo.toUpperCase()} • {chavePix.chave_pix}
                </Text>
                {chavePix.descricao ? (
                  <Text style={styles.chaveDescricao}>
                    {chavePix.descricao}
                  </Text>
                ) : null}
                <Text
                  style={[
                    styles.chaveStatus,
                    chavePix.ativo
                      ? styles.ativo
                      : styles.inativo,
                  ]}
                >
                  {chavePix.ativo ? 'ATIVA' : 'INATIVA'}
                </Text>
              </View>
              <View style={styles.chaveAcoes}>
                <Pressable
                  style={[
                    styles.chaveBotao,
                    styles.chaveBotaoEditar,
                  ]}
                  onPress={() =>
                    abrirModalEditarChave(
                      chavePix
                    )
                  }
                >
                  <Text style={styles.chaveBotaoTexto}>
                    Editar
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chaveBotao,
                    chavePix.ativo
                      ? styles.chaveBotaoDesativar
                      : styles.chaveBotaoAtivar,
                  ]}
                  onPress={() =>
                    alternarStatusChave(
                      chavePix
                    )
                  }
                >
                  <Text style={styles.chaveBotaoTexto}>
                    {chavePix.ativo
                      ? 'Desativar'
                      : 'Ativar'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chaveBotao,
                    styles.chaveBotaoExcluir,
                  ]}
                  onPress={() =>
                    confirmarExclusaoChave(
                      chavePix.id
                    )
                  }
                >
                  <Text style={styles.chaveBotaoTexto}>
                    Excluir
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            style={[
              styles.button,
              { marginTop: 12 },
            ]}
            onPress={abrirModalNovaChave}
          >
            <Text style={styles.buttonText}>
              + Adicionar chave PIX
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sair (Logout)</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>

    <Modal
      visible={modalChaveAberta}
      animationType="slide"
      transparent={true}
      onRequestClose={fecharModalChave}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editandoChaveId
              ? 'Editar chave PIX'
              : 'Nova chave PIX'}
          </Text>

          <TextInput
            style={styles.input}
            value={novaIdentificacao}
            onChangeText={setNovaIdentificacao}
            placeholder="Identificação (ex: PIX Gabriel)"
            placeholderTextColor={COLORS.muted}
          />

          <TextInput
            style={styles.input}
            value={novaChavePix}
            onChangeText={setNovaChavePix}
            placeholder="Chave PIX"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={novoTipo}
            onChangeText={setNovoTipo}
            placeholder="Tipo (cpf, cnpj, telefone, email, aleatoria)"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={novaDescricao}
            onChangeText={setNovaDescricao}
            placeholder="Descrição (opcional)"
            placeholderTextColor={COLORS.muted}
          />

          <View style={styles.modalActions}>
            <Pressable
              style={[
                styles.button,
                { flex: 1, marginRight: 8 },
              ]}
              onPress={salvarChave}
            >
              <Text style={styles.buttonText}>
                Salvar
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                {
                  flex: 1,
                  marginLeft: 8,
                  backgroundColor: COLORS.muted,
                },
              ]}
              onPress={fecharModalChave}
            >
              <Text style={styles.buttonText}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

    </>
  );

}


const styles = StyleSheet.create({

  container:{
    padding:25,
    paddingTop:70,
  },

  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },


  title:{
    color:COLORS.white,
    fontSize:32,
    fontWeight:'bold',
  },


  subtitle:{
    color:COLORS.muted,
    marginTop:8,
  },


  card:{
    backgroundColor:COLORS.card,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:18,
    padding:18,
    marginTop:30,
  },


  section:{
    color:COLORS.white,
    fontSize:20,
    fontWeight:'bold',
  },


  help:{
    color:COLORS.textSecondary,
    marginTop:8,
    marginBottom:18,
  },


  input:{
    backgroundColor:COLORS.background,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:12,
    padding:14,
    color:COLORS.white,
    marginBottom:12,
  },


  button:{
    backgroundColor:COLORS.primary,
    borderRadius:12,
    padding:15,
    alignItems:'center',
    marginTop:8,
  },


  buttonText:{
    color:COLORS.white,
    fontWeight:'bold',
  },

  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  logoutButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  chaveItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  chaveInfo: {
    marginBottom: 10,
  },

  chaveNome: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  chaveDetalhe: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  chaveDescricao: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },

  chaveStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6,
    textTransform: 'uppercase',
  },

  ativo: {
    color: '#4CAF50',
  },

  inativo: {
    color: '#F44336',
  },

  chaveAcoes: {
    flexDirection: 'row',
    gap: 8,
  },

  chaveBotao: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },

  chaveBotaoEditar: {
    backgroundColor: COLORS.primary,
  },

  chaveBotaoDesativar: {
    backgroundColor: '#F44336',
  },

  chaveBotaoAtivar: {
    backgroundColor: '#4CAF50',
  },

  chaveBotaoExcluir: {
    backgroundColor: '#B71C1C',
  },

  chaveBotaoTexto: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 420,
  },

  modalTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },

});

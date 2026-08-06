import { COLORS } from '@/components/Colors';
import { Cobranca, useDojo } from '@/components/context/DojoContext';
import { usePix } from '@/components/context/PixContext';
import { enviarCobrancaWhatsApp } from '@/components/whatsapp';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Svg, { Rect } from 'react-native-svg';

const QrCore = require('qrcode/lib/core/qrcode');


function hoje() {
  return new Date().toISOString().slice(0, 10);
}


function paraData(data: string) {
  const partes = data.split('-').map(Number);

  if (partes.length !== 3) return null;

  const [ano, mes, dia] = partes;

  return new Date(ano, mes - 1, dia);
}

const getStatusInfo = (cobranca: Cobranca) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (cobranca.status === 'pago') {
    return { text: 'PAGO', color: '#22c55e' }; // verde
  }

  if ((paraData(cobranca.vencimento)?.getTime() || 0) < hoje.getTime()) {
    return { text: 'ATRASADO', color: '#ef4444' }; // vermelho
  }

  return { text: 'PENDENTE', color: '#eab308' }; // amarelo
};


function formatarData(data?: string) {

  if (!data) return '';

  const convertido = paraData(data);

  return convertido
    ? convertido.toLocaleDateString('pt-BR')
    : data;
}


function formatarValor(valor:number){

  return valor.toLocaleString(
    'pt-BR',
    {
      style:'currency',
      currency:'BRL',
    }
  );
}


function parseValor(valor:string){

  return Number(
    valor
      .replace(/\s/g,'')
      .replace('R$','')
      .replace(/\./g,'')
      .replace(',','.')
  );

}

function campo(id: string, valor: string) {
  return id + valor.length.toString().padStart(2, '0') + valor;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function textoPix(texto: string, limite: number) {
  return (
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9 ]/g, '')
      .toUpperCase()
      .slice(0, limite) || 'DOJO LB'
  );
}

function gerarPixCopiaECola(
  chave: string,
  nome: string,
  cidade: string,
  valor: number,
  descricao: string
) {

  const chavePix = chave.trim();

  console.log("CHAVE PIX GERADA:", chavePix);
console.log("NOME:", nome);
console.log("CIDADE:", cidade);


  const merchantAccount =
    campo(
      '00',
      'BR.GOV.BCB.PIX'
    ) +
    campo(
      '01',
      chavePix
    );


  const adicional =
    campo(
      '05',
      textoPix(descricao, 25)
    );


  const payloadSemCRC =
    campo(
      '00',
      '01'
    ) +

    campo(
      '26',
      merchantAccount
    ) +

    campo(
      '52',
      '0000'
    ) +

    campo(
      '53',
      '986'
    ) +

    campo(
      '54',
      valor.toFixed(2)
    ) +

    campo(
      '58',
      'BR'
    ) +

    campo(
      '59',
      textoPix(nome, 25)
    ) +

    campo(
      '60',
      textoPix(cidade, 15)
    ) +

    campo(
      '62',
      adicional
    ) +

    '6304';


  return (
    payloadSemCRC +
    crc16(payloadSemCRC)
  );

}

function PixQrCode({ value }: { value: string }) {
  const matriz = useMemo(
    () => QrCore.create(value, { errorCorrectionLevel: 'M' }).modules,
    [value]
  );

  const modulos = Array.from(matriz.data) as number[];

  return (
    <Svg width={220} height={220} viewBox={`0 0 ${matriz.size} ${matriz.size}`}>
      <Rect width={matriz.size} height={matriz.size} fill="#FFFFFF" />
      {modulos.map((item, index) =>
        item ? (
          <Rect
            key={index}
            x={index % matriz.size}
            y={Math.floor(index / matriz.size)}
            width={1}
            height={1}
            fill="#000000"
          />
        ) : null
      )}
    </Svg>
  );
}

export default function FinanceiroAluno(){

  const { id } =
    useLocalSearchParams<{id:string}>();


  const {
    buscarAluno,
    adicionarCobranca,
    registrarPagamento,
    removerCobranca,
    marcarCobrancaComoPaga
  } = useDojo();


  const {
    chavePix,
    nomeRecebedor,
    cidadeRecebedor,
    pixConfigurado
  } = usePix();



  const alunoEncontrado = buscarAluno(id);

  if (!alunoEncontrado) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Aluno não encontrado</Text>
      </View>
    );
  }

  const aluno = alunoEncontrado;


  const [descricao,setDescricao] =
    useState('Mensalidade');


  const [valor,setValor] =
    useState(
      aluno.valorMensalidade || ''
    );


  const [vencimento,setVencimento] =
    useState(hoje());


  const [cobrancaPix,setCobrancaPix] =
    useState<Cobranca|null>(null);



  const hojeDate =
    new Date(
      new Date()
      .setHours(0,0,0,0)
    );



  const cobrancas =
    useMemo(

      ()=>[...aluno.cobrancas]
        .sort(
          (a,b)=>
            b.vencimento.localeCompare(
              a.vencimento
            )
        ),

      [aluno.cobrancas]

    );



  const pendentes =
    cobrancas.filter(
      c=>c.status !== 'pago'
    );



  const atrasadas =
    pendentes.filter(c=>{

      const data =
        paraData(c.vencimento);

      return data
        ? data < hojeDate
        : false;

    });



  const emAberto =
    pendentes.reduce(
      (total,c)=>
        total + c.valor,
      0
    );



  function adicionar(){

    const valorNumerico =
      parseValor(valor);



    if(
      !descricao.trim() ||
      !valorNumerico ||
      valorNumerico <= 0 ||
      !paraData(vencimento)
    ){

      Alert.alert(
        'Dados incompletos',
        'Informe descrição, valor e vencimento corretamente.'
      );

      return;

    }



    const novaCobranca:Cobranca={

      id:Date.now().toString(),

      descricao:
        descricao.trim(),

      valor:
        valorNumerico,

      vencimento,

      status:
        'pendente',

    };



    adicionarCobranca(
      aluno.id,
      novaCobranca
    );



    setDescricao('Mensalidade');

    setValor(
      aluno.valorMensalidade || ''
    );

    setVencimento(
      hoje()
    );

  }



  function abrirPix(
    cobranca:Cobranca
  ){

    if(!pixConfigurado){

      Alert.alert(
        'PIX não configurado',
        'Cadastre uma chave PIX em Perfil > Configuração PIX.'
      );

      return;

    }


    setCobrancaPix(cobranca);

  }



  async function copiarPix(
    // A cobrança não é mais necessária, vamos copiar a chave estática
  ){

    await Clipboard.setStringAsync(
      chavePix
    );


    Alert.alert(
      'Chave PIX copiada',
      'Use a chave no aplicativo do seu banco para fazer o pagamento.'
    );

  }



  function confirmarPagamento(
    cobranca:Cobranca
  ){

    Alert.alert(
      'Confirmar pagamento',
      `Registrar ${formatarValor(cobranca.valor)} como pago?`,
      [

        {
          text:'Cancelar',
          style:'cancel'
        },

        {
          text:'Confirmar',

          onPress:()=>{

            registrarPagamento(
              aluno.id,
              cobranca.id,
              hoje(),
              'PIX'
            );

          }

        }

      ]
    );

  }

  function confirmarRemocao(cobranca: Cobranca) {
    Alert.alert(
      'Remover cobrança',
      `Deseja remover a cobrança "${cobranca.descricao}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removerCobranca(aluno.id, cobranca.id);
            Alert.alert('Sucesso', 'A cobrança foi removida.');
          },
        },
      ]
    );
  }

   return (
    <ScrollView
      contentContainerStyle={styles.container}
    >

      <Pressable
        onPress={() => router.back()}
      >
        <Text style={styles.back}>
          ‹ Voltar
        </Text>
      </Pressable>


      <Text style={styles.title}>
        Financeiro
      </Text>


      <Text style={styles.subtitle}>
        {aluno.nome}
      </Text>

      {pendentes.length > 0 && (
        <Pressable
          style={[styles.primaryButton, { marginBottom: 16 }]}
          onPress={() =>
            enviarCobrancaWhatsApp(
              aluno.telefone,
              aluno.nome,
              pendentes[0].valor.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              formatarData(pendentes[0].vencimento)
            )
          }
        >
          <Text style={styles.buttonText}>Enviar cobrança via WhatsApp</Text>
        </Pressable>
      )}

      <View style={styles.summary}>
        <View>

          <Text style={styles.label}>
            Em aberto
          </Text>

          <Text style={styles.value}>
            {formatarValor(emAberto)}
          </Text>

        </View>



        <View>

          <Text style={styles.label}>
            Atrasadas
          </Text>


          <Text
            style={[
              styles.value,
              atrasadas.length > 0 &&
              styles.danger
            ]}
          >
            {atrasadas.length}
          </Text>

        </View>

      </View>




      <Text style={styles.sectionTitle}>
        Nova cobrança
      </Text>



      <View style={styles.card}>


        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição"
          placeholderTextColor={COLORS.muted}
        />


        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder="Valor"
          placeholderTextColor={COLORS.muted}
        />


        <TextInput
          style={styles.input}
          value={vencimento}
          onChangeText={setVencimento}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={COLORS.muted}
        />



        <Pressable
          style={styles.primaryButton}
          onPress={adicionar}
        >

          <Text style={styles.buttonText}>
            Adicionar cobrança
          </Text>

        </Pressable>


      </View>





      <Text style={styles.sectionTitle}>
        Histórico
      </Text>




      {
        cobrancas.length === 0 ?

        (

          <Text style={styles.empty}>
            Nenhuma cobrança registrada.
          </Text>

        )

        :

        (

          cobrancas.map((cobranca)=>{


            const vencida =
              cobranca.status !== 'pago' &&
              (
                paraData(cobranca.vencimento)
                ?.getTime()
                ||
                Infinity
              )
              <
              hojeDate.getTime();



            const statusInfo = getStatusInfo(cobranca);

            return (
              <View key={cobranca.id} style={styles.chargeCard}>
                <Text style={styles.chargeTitle}>{cobranca.descricao}</Text>
                <Text style={styles.chargeValue}>{formatarValor(cobranca.valor)}</Text>
                <Text style={styles.chargeDate}>
                  Vencimento: {formatarData(cobranca.vencimento)}
                </Text>
                <Text style={[styles.status, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
                <View style={styles.actions}>
                  {statusInfo.text !== 'PAGO' && (
                    <>
                      <Pressable
                        style={styles.btnPix}
                        onPress={() => abrirPix(cobranca)}
                      >
                        <Text style={styles.btnText}>📋 PIX</Text>
                      </Pressable>
                      <Pressable
                        style={styles.btnPago}
                        onPress={() => {
                          Alert.alert(
                            'Marcar como pago?',
                            `Confirma o pagamento de ${formatarValor(
                              cobranca.valor
                            )}?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: 'Confirmar',
                                onPress: () =>
                                  marcarCobrancaComoPaga(aluno.id, cobranca.id),
                              },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.btnText}>✔ Pago</Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable
                    style={styles.btnExcluir}
                    onPress={() => confirmarRemocao(cobranca)}
                  >
                    <Text style={styles.btnText}>🗑</Text>
                  </Pressable>
                </View>
              </View>
            );

          })

        )

      }





      {
        cobrancaPix &&

        (

          <View style={styles.pixCard}>

            <Text style={styles.pixTitle}>
              Pagamento via PIX
            </Text>

            <Text style={styles.pixSubtitle}>
              Copie a chave e use no app do seu banco para pagar o valor de {formatarValor(cobrancaPix.valor)}.
            </Text>

            <TextInput
              style={[styles.input, { marginTop: 20, textAlign: 'center' }]}
              value={chavePix}
              editable={false}
            />

            <Pressable
              style={styles.primaryButton}
              onPress={copiarPix}
            >

              <Text style={styles.buttonText}>
                Copiar a chave PIX
              </Text>

            </Pressable>




            <Pressable
              style={styles.closeButton}
              onPress={() =>
                setCobrancaPix(null)
              }
            >

              <Text style={styles.closeText}>
                Fechar
              </Text>

            </Pressable>



          </View>

        )

      }



    </ScrollView>
  );

}

const styles = StyleSheet.create({

  container:{
    backgroundColor:COLORS.background,
    flexGrow:1,
    padding:25,
    paddingTop:60,
  },


  centered:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:COLORS.background,
  },


  back:{
    color:COLORS.textSecondary,
    fontSize:16,
    marginBottom:20,
  },


  title:{
    color:COLORS.white,
    fontSize:32,
    fontWeight:'bold',
  },


  subtitle:{
    color:COLORS.muted,
    fontSize:16,
    marginTop:6,
  },


  summary:{
    backgroundColor:COLORS.card,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:16,
    padding:18,
    marginTop:25,
    flexDirection:'row',
    justifyContent:'space-between',
  },


  label:{
    color:COLORS.muted,
    fontSize:13,
  },


  value:{
    color:COLORS.white,
    fontSize:22,
    fontWeight:'bold',
    marginTop:5,
  },


  danger:{
    color:'#FF6B6B',
  },


  sectionTitle:{
    color:COLORS.white,
    fontSize:20,
    fontWeight:'bold',
    marginTop:30,
    marginBottom:12,
  },


  card:{
    backgroundColor:COLORS.card,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:16,
    padding:16,
  },


  input:{
    backgroundColor:COLORS.background,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:12,
    color:COLORS.white,
    padding:14,
    marginBottom:12,
  },


  primaryButton:{
    backgroundColor:COLORS.primary,
    borderRadius:12,
    padding:15,
    alignItems:'center',
  },


  buttonText:{
    color:COLORS.white,
    fontWeight:'bold',
  },


  empty:{
    color:COLORS.muted,
  },


  chargeCard:{
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth:1,
    borderColor: "#222",
  },


  chargeTitle:{
    color:COLORS.white,
    fontSize:16,
    fontWeight:'bold',
  },
  
  chargeValue: {
    color: "#22c55e",
    fontSize: 20,
    marginTop: 6,
  },
  
  chargeDate: {
    color: "#aaa",
    marginTop: 4,
  },
  
  status: {
    marginTop: 6,
    fontWeight: "bold",
  },
  
  actions: {
    flexDirection: "row",
    // justifyContent: "space-between", // The user example doesn't have this, let's make it more flexible
    gap: 8,
    marginTop: 12,
  },
  
  btnPix: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  
  btnPago: {
    backgroundColor: "#16a34a",
    padding: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  
  btnExcluir: {
    backgroundColor: "#b91c1c",
    padding: 8,
    borderRadius: 8,
  },
  
  btnText: {
    color: "#fff",
    fontWeight: 'bold',
  },


  pixCard:{
    backgroundColor:COLORS.card,
    borderColor:'#0D9488',
    borderWidth:1,
    borderRadius:16,
    padding:18,
    marginTop:20,
  },


  pixTitle:{
    color:COLORS.white,
    fontSize:20,
    fontWeight:'bold',
    textAlign:'center',
  },


  pixSubtitle:{
    color:COLORS.textSecondary,
    textAlign:'center',
    marginTop:8,
  },


  qr:{
    backgroundColor:'#fff',
    alignItems:'center',
    borderRadius:12,
    padding:15,
    marginVertical:20,
  },


  closeButton:{
    alignItems:'center',
    padding:12,
    marginTop:10,
  },


  closeText:{
    color:COLORS.textSecondary,
    fontWeight:'bold',
  },

});
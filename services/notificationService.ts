import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type NotificationTipo =
  | 'mensalidade_vencendo'
  | 'mensalidade_vencida'
  | 'pagamento_confirmado';

export interface NotificationMeta {
  tipo: NotificationTipo;
  cobrancaId: string;
}

const CHANNEL_ID = 'meu-dojo-notificacoes';
const NOTIFICACAO_VENCIDA_STORAGE = '@dojo_notificacao_vencida';

export async function configurarCanalAndroid() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'MEU DOJO',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
      vibrationPattern: null,
      enableVibrate: false,
    });
  }
}

export async function solicitarPermissaoNotificacao() {
  if (Platform.OS === 'android') {
    await configurarCanalAndroid();
  }

  const { status: statusExistente } =
    await Notifications.getPermissionsAsync();

  if (statusExistente === 'granted') {
    return true;
  }

  if (statusExistente === 'denied') {
    return false;
  }

  const { status } =
    await Notifications.requestPermissionsAsync();

  return status === 'granted';
}

export function construirConteudoNotificacao(
  titulo: string,
  corpo: string,
  meta: NotificationMeta
) {
  return {
    title: titulo,
    body: corpo,
    data: meta as unknown as Record<string, unknown>,
    channelId: CHANNEL_ID,
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
  };
}

export async function agendarNotificacao(
  trigger: Notifications.NotificationTriggerInput,
  conteudo: ReturnType<typeof construirConteudoNotificacao>
) {
  await Notifications.scheduleNotificationAsync({
    content: conteudo,
    trigger,
  });
}

export async function notificarImediatamente(
  conteudo: ReturnType<typeof construirConteudoNotificacao>
) {
  await Notifications.scheduleNotificationAsync({
    content: conteudo,
    trigger: null,
  });
}

export async function cancelarNotificacoesPorCobranca(
  cobrancaId: string
) {
  const agendadas =
    await Notifications.getAllScheduledNotificationsAsync();

  const idsParaCancelar = agendadas
    .filter((n) => {
      const data = n.content.data as Record<string, unknown> | undefined;
      return data?.cobrancaId === cobrancaId;
    })
    .map((n) => n.identifier);

  await Promise.all(
    idsParaCancelar.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  );
}

export async function existeNotificacaoAgendada(
  cobrancaId: string,
  tipo: NotificationTipo
) {
  const agendadas =
    await Notifications.getAllScheduledNotificationsAsync();

  return agendadas.some((n) => {
    const data = n.content.data as Record<string, unknown> | undefined;
    return data?.cobrancaId === cobrancaId && data?.tipo === tipo;
  });
}

export async function marcarNotificacaoVencidaEnviada(
  cobrancaId: string
) {
  const existentes =
    await AsyncStorage.getItem(NOTIFICACAO_VENCIDA_STORAGE);

  const mapa = existentes ? JSON.parse(existentes) : {};

  mapa[cobrancaId] = true;

  await AsyncStorage.setItem(
    NOTIFICACAO_VENCIDA_STORAGE,
    JSON.stringify(mapa)
  );
}

export async function foiNotificacaoVencidaEnviada(
  cobrancaId: string
) {
  const existentes =
    await AsyncStorage.getItem(NOTIFICACAO_VENCIDA_STORAGE);

  if (!existentes) {
    return false;
  }

  const mapa = JSON.parse(existentes);

  return !!mapa[cobrancaId];
}

export async function removerMarcacaoNotificacaoVencida(
  cobrancaId: string
) {
  const existentes =
    await AsyncStorage.getItem(NOTIFICACAO_VENCIDA_STORAGE);

  if (!existentes) {
    return;
  }

  const mapa = JSON.parse(existentes);

  delete mapa[cobrancaId];

  await AsyncStorage.setItem(
    NOTIFICACAO_VENCIDA_STORAGE,
    JSON.stringify(mapa)
  );
}

export async function listarNotificacoesAgendadas() {
  return Notifications.getAllScheduledNotificationsAsync();
}

import twilio from 'twilio';

function getEnv(name, fallback) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    return fallback;
  }
  return value.trim();
}

const accountSid = getEnv('TWILIO_ACCOUNT_SID', '');
const authToken = getEnv('TWILIO_AUTH_TOKEN', '');
const fromNumber = getEnv('TWILIO_WHATSAPP_FROM', '');

let client = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export function isWhatsAppConfigured() {
  return Boolean(client && fromNumber);
}

export async function sendOtpWhatsApp({ to, codigo }) {
  if (!isWhatsAppConfigured()) {
    throw new Error('WhatsApp não configurado.');
  }

  const body =
    `DOJO LB JIU-JITSU: seu código para redefinir a senha é ${codigo}.` +
    ` Este código expira em 10 minutos.` +
    ` Se você não solicitou esta alteração, ignore esta mensagem.`;

  const result = await client.messages.create({
    from: fromNumber,
    to,
    body,
  });

  return result;
}

export function enviarCobrancaWhatsApp(telefone, nome, valor, vencimento, chavePixInfo = '') {
  const mensagem =
    `Olá ${nome}, sua mensalidade é de R$ ${valor}` +
    (vencimento
      ? ` e vence em ${vencimento}`
      : '') +
    chavePixInfo;
  return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
}

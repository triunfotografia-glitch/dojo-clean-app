import nodemailer from 'nodemailer';

function getEnv(name, fallback) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    return fallback;
  }
  return value.trim();
}

const transporter = nodemailer.createTransport({
  host: getEnv('EMAIL_HOST', ''),
  port: Number(getEnv('EMAIL_PORT', '587')),
  secure: String(getEnv('EMAIL_SECURE', 'false')).toLowerCase() === 'true',
  auth: {
    user: getEnv('EMAIL_USER', ''),
    pass: getEnv('EMAIL_PASS', ''),
  },
});

export function isEmailConfigured() {
  return Boolean(
    getEnv('EMAIL_HOST', '') &&
      getEnv('EMAIL_USER', '') &&
      getEnv('EMAIL_PASS', '')
  );
}

export async function sendPasswordResetEmail({ to, nome, token, frontendUrl }) {
  if (!isEmailConfigured()) {
    throw new Error('Configuração de e-mail ausente.');
  }

  const link = `${frontendUrl.replace(/\/$/, '')}/redefinir-senha?token=${encodeURIComponent(token)}`;

  const text =
    `Olá ${nome},\n\n` +
    `Você solicitou a recuperação de senha do DOJO LB.\n\n` +
    `Acesse o link abaixo para redefinir sua senha:\n\n` +
    `${link}\n\n` +
    `Este link é válido por 15 minutos.\n\n` +
    `Se você não solicitou esta alteração, ignore este e-mail.`;

  const html =
    `<p>Olá <strong>${nome}</strong>,</p>` +
    `<p>Você solicitou a recuperação de senha do <strong>DOJO LB</strong>.</p>` +
    `<p>Acesse o link abaixo para redefinir sua senha:</p>` +
    `<p><a href="${link}">${link}</a></p>` +
    `<p>Este link é válido por <strong>15 minutos</strong>.</p>` +
    `<p>Se você não solicitou esta alteração, ignore este e-mail.</p>`;

  const mailOptions = {
    from: getEnv('EMAIL_FROM', getEnv('EMAIL_USER', 'no-reply@dojolb.local')),
    to,
    subject: 'Recuperação de senha — DOJO LB',
    text,
    html,
  };

  console.log('[EMAIL DEBUG] Recuperação de senha:', {
    emailUser: process.env.EMAIL_USER || '(não configurado)',
    emailFrom: process.env.EMAIL_FROM || '(não configurado)',
    fromFinal: mailOptions.from,
    to: mailOptions.to,
  });

  await transporter.sendMail(mailOptions);
}

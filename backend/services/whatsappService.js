export function enviarCobrancaWhatsApp(telefone, nome, valor, vencimento = '', chavePixInfo = '') {
  let mensagem = `Olá ${nome}, sua mensalidade é de R$ ${valor}`;

  if (vencimento) {
    mensagem += `\nVencimento: ${vencimento}`;
  }

  if (chavePixInfo) {
    mensagem += chavePixInfo;
  }

  return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
}

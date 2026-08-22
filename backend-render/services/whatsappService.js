export function enviarCobrancaWhatsApp(telefone, nome, valor) {
  const mensagem = `Olá ${nome}, sua mensalidade é de R$ ${valor}`;
  return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
}

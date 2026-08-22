import { Alert, Linking } from "react-native";

export function enviarCobrancaWhatsApp(
  telefone: string,
  nome: string,
  valor: string,
  data: string
) {
  const numero = telefone.replace(/\D/g, "");
  const numeroFormatado = numero.startsWith("55") ? numero.slice(2) : numero;

  if (!numeroFormatado) {
    Alert.alert(
      "Telefone inválido",
      "Informe um número de telefone válido para enviar a cobrança."
    );
    return;
  }

  const mensagem = `Olá ${nome}, sua mensalidade no valor de R$ ${valor} vence em ${data}.`;
  const url = `https://wa.me/55${numeroFormatado}?text=${encodeURIComponent(mensagem)}`;

  void Linking.openURL(url).catch(() => {
    Alert.alert(
      "Não foi possível abrir o WhatsApp",
      "Verifique se o aplicativo está instalado ou tente novamente mais tarde."
    );
  });
}

export function enviarCobrancasWhatsApp(
  cobrancas: Array<{ nome: string; telefone: string; valor: string; data: string }>,
  template?: string
) {
  if (cobrancas.length === 0) {
    Alert.alert("Nenhuma cobrança selecionada", "Não há cobranças pendentes para enviar.");
    return;
  }

  const mensagem = template
    ? cobrancas
        .map((item) =>
          template
            .replace(/{{nome}}/g, item.nome)
            .replace(/{{valor}}/g, item.valor)
            .replace(/{{data}}/g, item.data)
        )
        .join("\n\n")
    : `Cobranças pendentes:\n\n${cobrancas
        .map((item, index) =>
          `${index + 1}. ${item.nome} — R$ ${item.valor} — vence em ${item.data}`
        )
        .join("\n")}
\nEnvie esta lista aos alunos ou use o recurso de lista de transmissão do WhatsApp.`;

  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  void Linking.openURL(url).catch(() => {
    Alert.alert(
      "Não foi possível abrir o WhatsApp",
      "Verifique se o aplicativo está instalado ou tente novamente mais tarde."
    );
  });
}

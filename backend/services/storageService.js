const alunos = [];
const cobrancas = [];

export function getAlunos() {
  return alunos;
}

export function addAluno(aluno) {
  const novoAluno = {
    id: aluno.id || Date.now().toString(),
    ...aluno,
  };

  alunos.push(novoAluno);
  return novoAluno;
}

export function getCobrancas() {
  return cobrancas;
}

export function addCobranca(cobranca) {
  const novaCobranca = {
    id: cobranca.id || Date.now().toString(),
    ...cobranca,
  };

  cobrancas.push(novaCobranca);
  return novaCobranca;
}

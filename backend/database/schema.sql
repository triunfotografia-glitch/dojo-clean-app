-- PostgreSQL schema for backend storage

create table if not exists alunos (
  id serial primary key,
  nome text not null,
  telefone text,
  email text,
  created_at timestamp default now()
);

create table if not exists cobrancas (
  id serial primary key,
  nome text,
  telefone text,
  descricao text not null,
  valor numeric not null,
  vencimento date,
  pago boolean default false,
  created_at timestamp default now()
);

create table if not exists professores (
  id serial primary key,
  nome text,
  email text,
  senha text,
  telefone text,
  faixa text,
  graus integer,
  especialidade text,
  ativo boolean,
  criadoEm timestamp default now()
);

create table if not exists turmas (
  id serial primary key,
  nome text,
  professor text,
  alunos jsonb,
  criadoEm timestamp default now()
);

create table if not exists treinos (
  id serial primary key,
  nome text,
  dia text,
  horario text,
  turma text,
  professor text,
  criadoEm timestamp default now()
);

create table if not exists presencas (
  id serial primary key,
  alunoId text,
  treinoId text,
  data text,
  status text,
  criadoEm timestamp default now()
);

create table if not exists graduacoes (
  id serial primary key,
  alunoId text,
  faixa text,
  data text,
  professor text,
  observacao text,
  criadoEm timestamp default now()
);

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

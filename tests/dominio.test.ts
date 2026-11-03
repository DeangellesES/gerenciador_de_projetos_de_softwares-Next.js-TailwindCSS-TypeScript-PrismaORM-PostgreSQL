import test from "node:test";
import assert from "node:assert/strict";
import {
  buscarProjetos,
  ehStatusProjeto,
  formatarData,
  gerarSlug,
  normalizar,
  paraData,
  paraTextoData,
  type Projeto,
} from "../src/lib/projetos";
import {
  agruparPorColuna,
  calcularProgresso,
  ehColunaKanban,
  normalizarTarefa,
  type Tarefa,
} from "../src/lib/kanban";

function criarProjeto(parcial: Partial<Projeto>): Projeto {
  return {
    id: "projeto",
    nome: "Projeto",
    descricao: "Descrição",
    status: "ativo",
    stack: [],
    progresso: 0,
    prazo: null,
    criadoEm: new Date("2026-01-01T00:00:00.000Z"),
    atualizadoEm: new Date("2026-01-01T00:00:00.000Z"),
    ...parcial,
  };
}

function criarTarefa(parcial: Partial<Tarefa>): Tarefa {
  return {
    id: "tarefa",
    titulo: "Tarefa",
    descricao: null,
    coluna: "to",
    ordem: 0,
    projetoId: "projeto",
    criadoEm: new Date("2026-01-01T00:00:00.000Z"),
    atualizadoEm: new Date("2026-01-01T00:00:00.000Z"),
    ...parcial,
  };
}

test("normalizar remove acentos, caixa e espaços", () => {
  assert.equal(normalizar("  Gestão Ágil  "), "gestao agil");
});

test("gerarSlug produz identificadores estáveis", () => {
  assert.equal(gerarSlug("Meu Projeto Novo!"), "meu-projeto-novo");
  assert.equal(gerarSlug("!!!"), "projeto");
});

test("buscarProjetos considera nome, descrição e stack", () => {
  const projetos = [
    criarProjeto({ id: "a", nome: "API de Tarefas", stack: ["Node.js"] }),
    criarProjeto({
      id: "b",
      nome: "Portfólio",
      descricao: "Site com Next.js",
      status: "concluido",
    }),
  ];

  assert.deepEqual(
    buscarProjetos(projetos, "node").map((projeto) => projeto.id),
    ["a"],
  );
  assert.deepEqual(
    buscarProjetos(projetos, "next").map((projeto) => projeto.id),
    ["b"],
  );
  assert.deepEqual(
    buscarProjetos(projetos, "API tarefas").map((projeto) => projeto.id),
    ["a"],
  );
  assert.equal(buscarProjetos(projetos, "   ").length, 2);
});

test("ehStatusProjeto valida os status conhecidos", () => {
  assert.equal(ehStatusProjeto("ativo"), true);
  assert.equal(ehStatusProjeto("arquivado"), false);
  assert.equal(ehStatusProjeto(null), false);
});

test("formatarData e paraTextoData lidam com datas e valores inválidos", () => {
  const data = new Date("2026-10-15T00:00:00.000Z");

  assert.equal(paraTextoData(data), "2026-10-15");
  assert.equal(paraTextoData(null), "");
  assert.equal(paraData("2026-10-15")?.toISOString(), data.toISOString());
  assert.equal(paraData("invalida"), null);
  assert.notEqual(formatarData(data), "—");
  assert.equal(formatarData("invalida"), "—");
});

test("calcularProgresso pondera as colunas e trata lista vazia", () => {
  assert.equal(calcularProgresso([]), 0);
  assert.equal(calcularProgresso([{ coluna: "to" }]), 0);
  assert.equal(calcularProgresso([{ coluna: "doing" }]), 50);
  assert.equal(calcularProgresso([{ coluna: "done" }]), 100);
  assert.equal(
    calcularProgresso([{ coluna: "to" }, { coluna: "done" }]),
    50,
  );
});

test("ehColunaKanban valida as colunas conhecidas", () => {
  assert.equal(ehColunaKanban("doing"), true);
  assert.equal(ehColunaKanban("review"), false);
});

test("agruparPorColuna separa e ordena as tarefas", () => {
  const grupos = agruparPorColuna([
    criarTarefa({ id: "b", coluna: "doing", ordem: 1 }),
    criarTarefa({ id: "a", coluna: "doing", ordem: 0 }),
    criarTarefa({ id: "c", coluna: "done", ordem: 0 }),
  ]);

  assert.deepEqual(
    grupos.doing.map((tarefa) => tarefa.id),
    ["a", "b"],
  );
  assert.deepEqual(
    grupos.done.map((tarefa) => tarefa.id),
    ["c"],
  );
  assert.deepEqual(grupos.to, []);
});

test("normalizarTarefa converte datas serializadas em Date", () => {
  const tarefa = normalizarTarefa({
    ...criarTarefa({}),
    criadoEm: "2026-01-01T00:00:00.000Z",
    atualizadoEm: "2026-01-02T00:00:00.000Z",
  });

  assert.ok(tarefa.criadoEm instanceof Date);
  assert.ok(tarefa.atualizadoEm instanceof Date);
  assert.equal(tarefa.criadoEm.toISOString(), "2026-01-01T00:00:00.000Z");
});

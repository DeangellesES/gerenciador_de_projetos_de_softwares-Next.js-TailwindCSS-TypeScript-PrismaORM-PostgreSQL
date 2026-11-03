import {
  ehColunaKanban,
  type ColunaKanban,
  type DadosTarefa,
} from "@/lib/kanban";
import {
  ehObjeto,
  validarInteiroNaoNegativo,
  validarTexto,
  type Resultado,
  type Validacao,
} from "@/lib/validacao";

const LIMITE_TITULO = 200;
const LIMITE_DESCRICAO = 600;

export type DadosValidadosTarefa = Partial<DadosTarefa> & { ordem?: number };

function validarDescricao(valor: unknown): Validacao<string | null> {
  if (valor === null || valor === undefined || valor === "") {
    return { ok: true, valor: null };
  }

  if (typeof valor !== "string") {
    return { ok: false, erro: "A descrição da tarefa é inválida." };
  }

  const texto = valor.trim();

  if (texto.length > LIMITE_DESCRICAO) {
    return {
      ok: false,
      erro: `A descrição deve ter no máximo ${LIMITE_DESCRICAO} caracteres.`,
    };
  }

  return { ok: true, valor: texto || null };
}

function validarColuna(valor: unknown): Validacao<ColunaKanban> {
  if (!ehColunaKanban(valor)) {
    return { ok: false, erro: "Coluna inválida. Use to, doing ou done." };
  }

  return { ok: true, valor };
}

export function validarTarefa(corpo: unknown): Resultado<DadosTarefa> {
  if (!ehObjeto(corpo)) {
    return { ok: false, erro: "Corpo da requisição inválido." };
  }

  const titulo = validarTexto(corpo.titulo, "o título da tarefa", LIMITE_TITULO);
  if (!titulo.ok) return titulo;

  const descricao = validarDescricao(corpo.descricao);
  if (!descricao.ok) return descricao;

  const coluna = validarColuna(corpo.coluna ?? "to");
  if (!coluna.ok) return coluna;

  return {
    ok: true,
    dados: {
      titulo: titulo.valor,
      descricao: descricao.valor,
      coluna: coluna.valor,
    },
  };
}

export function validarAtualizacaoTarefa(
  corpo: unknown,
): Resultado<DadosValidadosTarefa> {
  if (!ehObjeto(corpo)) {
    return { ok: false, erro: "Corpo da requisição inválido." };
  }

  const dados: DadosValidadosTarefa = {};

  if ("titulo" in corpo) {
    const titulo = validarTexto(
      corpo.titulo,
      "o título da tarefa",
      LIMITE_TITULO,
    );
    if (!titulo.ok) return titulo;
    dados.titulo = titulo.valor;
  }

  if ("descricao" in corpo) {
    const descricao = validarDescricao(corpo.descricao);
    if (!descricao.ok) return descricao;
    dados.descricao = descricao.valor;
  }

  if ("coluna" in corpo) {
    const coluna = validarColuna(corpo.coluna);
    if (!coluna.ok) return coluna;
    dados.coluna = coluna.valor;
  }

  if ("ordem" in corpo) {
    const ordem = validarInteiroNaoNegativo(corpo.ordem);
    if (!ordem.ok) return ordem;
    dados.ordem = ordem.valor;
  }

  if (Object.keys(dados).length === 0) {
    return { ok: false, erro: "Nenhum campo válido para atualizar." };
  }

  return { ok: true, dados };
}

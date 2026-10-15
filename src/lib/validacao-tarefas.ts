import {
  ehColunaKanban,
  type ColunaKanban,
  type DadosTarefa,
} from "@/lib/kanban";

const LIMITE_TITULO = 200;
const LIMITE_DESCRICAO = 600;

export type ResultadoValidacaoTarefa =
  | { ok: true; dados: Partial<DadosTarefa> & { ordem?: number } }
  | { ok: false; erro: string };

function validarTitulo(valor: unknown): { ok: true; valor: string } | { ok: false; erro: string } {
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (!texto) {
    return { ok: false, erro: "Informe o título da tarefa." };
  }

  if (texto.length > LIMITE_TITULO) {
    return {
      ok: false,
      erro: `O título deve ter no máximo ${LIMITE_TITULO} caracteres.`,
    };
  }

  return { ok: true, valor: texto };
}

function validarDescricao(
  valor: unknown,
): { ok: true; valor: string | null } | { ok: false; erro: string } {
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

function validarColuna(
  valor: unknown,
): { ok: true; valor: ColunaKanban } | { ok: false; erro: string } {
  if (!ehColunaKanban(valor)) {
    return { ok: false, erro: "Coluna inválida. Use to, doing ou done." };
  }

  return { ok: true, valor };
}

function validarOrdem(valor: unknown): { ok: true; valor: number } | { ok: false; erro: string } {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < 0) {
    return { ok: false, erro: "A posição da tarefa é inválida." };
  }

  return { ok: true, valor: numero };
}

export function validarTarefa(
  corpo: unknown,
): { ok: true; dados: DadosTarefa } | { ok: false; erro: string } {
  if (typeof corpo !== "object" || corpo === null) {
    return { ok: false, erro: "Corpo da requisição inválido." };
  }

  const entrada = corpo as Record<string, unknown>;

  const titulo = validarTitulo(entrada.titulo);
  if (!titulo.ok) return titulo;

  const descricao = validarDescricao(entrada.descricao);
  if (!descricao.ok) return descricao;

  const coluna = validarColuna(entrada.coluna ?? "to");
  if (!coluna.ok) return coluna;

  return {
    ok: true,
    dados: { titulo: titulo.valor, descricao: descricao.valor, coluna: coluna.valor },
  };
}

export function validarAtualizacaoTarefa(corpo: unknown): ResultadoValidacaoTarefa {
  if (typeof corpo !== "object" || corpo === null) {
    return { ok: false, erro: "Corpo da requisição inválido." };
  }

  const entrada = corpo as Record<string, unknown>;
  const dados: Partial<DadosTarefa> & { ordem?: number } = {};

  if ("titulo" in entrada) {
    const titulo = validarTitulo(entrada.titulo);
    if (!titulo.ok) return titulo;
    dados.titulo = titulo.valor;
  }

  if ("descricao" in entrada) {
    const descricao = validarDescricao(entrada.descricao);
    if (!descricao.ok) return descricao;
    dados.descricao = descricao.valor;
  }

  if ("coluna" in entrada) {
    const coluna = validarColuna(entrada.coluna);
    if (!coluna.ok) return coluna;
    dados.coluna = coluna.valor;
  }

  if ("ordem" in entrada) {
    const ordem = validarOrdem(entrada.ordem);
    if (!ordem.ok) return ordem;
    dados.ordem = ordem.valor;
  }

  return { ok: true, dados };
}

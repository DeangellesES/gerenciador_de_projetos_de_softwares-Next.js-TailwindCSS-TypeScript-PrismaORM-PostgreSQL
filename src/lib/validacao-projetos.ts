import {
  ehStatusProjeto,
  paraData,
  type DadosProjeto,
  type StatusProjeto,
} from "@/lib/projetos";

type Validacao<T> = { ok: true; valor: T } | { ok: false; erro: string };

export type ResultadoValidacao =
  | { ok: true; dados: Partial<DadosProjeto> }
  | { ok: false; erro: string };

const LIMITE_NOME = 120;
const LIMITE_DESCRICAO = 600;

function validarTexto(
  valor: unknown,
  rotulo: string,
  limite: number,
): Validacao<string> {
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (!texto) {
    return { ok: false, erro: `Informe ${rotulo}.` };
  }

  if (texto.length > limite) {
    return { ok: false, erro: `O ${rotulo} deve ter no máximo ${limite} caracteres.` };
  }

  return { ok: true, valor: texto };
}

function validarStatus(valor: unknown): Validacao<StatusProjeto> {
  if (!ehStatusProjeto(valor)) {
    return {
      ok: false,
      erro: "Status inválido. Use ativo, iniciando, finalizando, concluido ou ideia.",
    };
  }

  return { ok: true, valor };
}

function validarProgresso(valor: unknown): Validacao<number | null> {
  if (valor === null || valor === undefined || valor === "") {
    return { ok: true, valor: null };
  }

  const progresso = Number(valor);

  if (!Number.isInteger(progresso) || progresso < 0 || progresso > 100) {
    return { ok: false, erro: "O progresso deve ser um número inteiro entre 0 e 100." };
  }

  return { ok: true, valor: progresso };
}

function validarStack(valor: unknown): Validacao<string[]> {
  if (valor === null || valor === undefined) {
    return { ok: true, valor: [] };
  }

  if (!Array.isArray(valor) || valor.some((item) => typeof item !== "string")) {
    return { ok: false, erro: "A stack deve ser uma lista de tecnologias." };
  }

  return {
    ok: true,
    valor: [...new Set(valor.map((item) => item.trim()).filter(Boolean))],
  };
}

function validarPrazo(valor: unknown): Validacao<Date | null> {
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (!texto) {
    return { ok: true, valor: null };
  }

  const data = paraData(texto);

  if (!data) {
    return { ok: false, erro: "Informe um prazo válido no formato AAAA-MM-DD." };
  }

  return { ok: true, valor: data };
}

export function validarProjeto(
  corpo: unknown,
): { ok: true; dados: DadosProjeto } | { ok: false; erro: string } {
  const resultado = validar(corpo, false);

  return resultado.ok
    ? { ok: true, dados: resultado.dados as DadosProjeto }
    : resultado;
}

export function validarAtualizacao(
  corpo: unknown,
): ResultadoValidacao {
  return validar(corpo, true);
}

function validar(corpo: unknown, parcial: boolean): ResultadoValidacao {
  if (typeof corpo !== "object" || corpo === null) {
    return { ok: false, erro: "Corpo da requisição inválido." };
  }

  const entrada = corpo as Record<string, unknown>;
  const dados: Partial<DadosProjeto> = {};

  if (!parcial || "nome" in entrada) {
    const resultado = validarTexto(entrada.nome, "nome do projeto", LIMITE_NOME);
    if (!resultado.ok) return resultado;
    dados.nome = resultado.valor;
  }

  if (!parcial || "descricao" in entrada) {
    const resultado = validarTexto(entrada.descricao, "descrição do projeto", LIMITE_DESCRICAO);
    if (!resultado.ok) return resultado;
    dados.descricao = resultado.valor;
  }

  if (!parcial || "status" in entrada) {
    const resultado = validarStatus(entrada.status);
    if (!resultado.ok) return resultado;
    dados.status = resultado.valor;
  }

  if (!parcial || "stack" in entrada) {
    const resultado = validarStack(entrada.stack);
    if (!resultado.ok) return resultado;
    dados.stack = resultado.valor;
  }

  if (!parcial || "progresso" in entrada) {
    const resultado = validarProgresso(entrada.progresso);
    if (!resultado.ok) return resultado;
    dados.progresso = resultado.valor;
  }

  if (!parcial || "prazo" in entrada) {
    const resultado = validarPrazo(entrada.prazo);
    if (!resultado.ok) return resultado;
    dados.prazo = resultado.valor;
  }

  return { ok: true, dados };
}

import {
  ehStatusProjeto,
  type DadosProjeto,
  type StatusProjeto,
} from "@/lib/projetos";
import {
  ehObjeto,
  validarDataIso,
  validarTexto,
  type Resultado,
  type Validacao,
} from "@/lib/validacao";

const LIMITE_NOME = 120;
const LIMITE_DESCRICAO = 600;

function validarStatus(valor: unknown): Validacao<StatusProjeto> {
  if (!ehStatusProjeto(valor)) {
    return {
      ok: false,
      erro: "Status inválido. Use ativo, iniciando, finalizando, concluido ou ideia.",
    };
  }

  return { ok: true, valor };
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

function validarCampos(
  corpo: unknown,
  parcial: boolean,
): Resultado<Partial<DadosProjeto>> {
  if (!ehObjeto(corpo)) {
    return { ok: false, erro: "Corpo da requisição inválido." };
  }

  const dados: Partial<DadosProjeto> = {};

  if (!parcial || "nome" in corpo) {
    const resultado = validarTexto(corpo.nome, "o nome do projeto", LIMITE_NOME);
    if (!resultado.ok) return resultado;
    dados.nome = resultado.valor;
  }

  if (!parcial || "descricao" in corpo) {
    const resultado = validarTexto(
      corpo.descricao,
      "a descrição do projeto",
      LIMITE_DESCRICAO,
    );
    if (!resultado.ok) return resultado;
    dados.descricao = resultado.valor;
  }

  if (!parcial || "status" in corpo) {
    const resultado = validarStatus(corpo.status);
    if (!resultado.ok) return resultado;
    dados.status = resultado.valor;
  }

  if (!parcial || "stack" in corpo) {
    const resultado = validarStack(corpo.stack);
    if (!resultado.ok) return resultado;
    dados.stack = resultado.valor;
  }

  if (!parcial || "prazo" in corpo) {
    const resultado = validarDataIso(corpo.prazo);
    if (!resultado.ok) return resultado;
    dados.prazo = resultado.valor;
  }

  if (parcial && Object.keys(dados).length === 0) {
    return { ok: false, erro: "Nenhum campo válido para atualizar." };
  }

  return { ok: true, dados };
}

export function validarProjeto(corpo: unknown): Resultado<DadosProjeto> {
  const resultado = validarCampos(corpo, false);

  if (!resultado.ok) {
    return resultado;
  }

  const { nome, descricao, status, stack, prazo } = resultado.dados;

  if (
    nome === undefined ||
    descricao === undefined ||
    status === undefined ||
    stack === undefined ||
    prazo === undefined
  ) {
    return { ok: false, erro: "Dados do projeto incompletos." };
  }

  return { ok: true, dados: { nome, descricao, status, stack, prazo } };
}

export function validarAtualizacao(
  corpo: unknown,
): Resultado<Partial<DadosProjeto>> {
  return validarCampos(corpo, true);
}

export type Validacao<T> =
  | { ok: true; valor: T }
  | { ok: false; erro: string };

export type Resultado<T> =
  | { ok: true; dados: T }
  | { ok: false; erro: string };

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function validarTexto(
  valor: unknown,
  rotulo: string,
  limite: number,
): Validacao<string> {
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (!texto) {
    return { ok: false, erro: `Informe ${rotulo}.` };
  }

  if (texto.length > limite) {
    return {
      ok: false,
      erro: `Limite de ${limite} caracteres para ${rotulo}.`,
    };
  }

  return { ok: true, valor: texto };
}

export function validarDataIso(valor: unknown): Validacao<Date | null> {
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (!texto) {
    return { ok: true, valor: null };
  }

  if (!FORMATO_DATA.test(texto)) {
    return { ok: false, erro: "Informe um prazo válido no formato AAAA-MM-DD." };
  }

  const data = new Date(`${texto}T00:00:00.000Z`);

  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto) {
    return { ok: false, erro: "Informe um prazo válido no formato AAAA-MM-DD." };
  }

  return { ok: true, valor: data };
}

export function validarInteiroNaoNegativo(valor: unknown): Validacao<number> {
  if (valor === null || valor === undefined || valor === "") {
    return { ok: false, erro: "A posição da tarefa é inválida." };
  }

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < 0) {
    return { ok: false, erro: "A posição da tarefa é inválida." };
  }

  return { ok: true, valor: numero };
}

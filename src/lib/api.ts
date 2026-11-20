import { NextResponse, type NextRequest } from "next/server";
import { consultarLimite } from "@/lib/limite-taxa";
import { respostaDeErro } from "@/lib/resposta-erro";
import {
  metodoModificaEstado,
  origemPermitida,
} from "@/lib/seguranca";
import { exigirUsuarioNaApi, type Usuario } from "@/lib/sessao";

export type ContextoRota<Parametros> = { params: Promise<Parametros> };
export const LIMITE_CORPO_JSON = 256 * 1024;

type Entrada<Contexto> = {
  usuario: Usuario;
  contexto: Contexto;
};

type Manipulador<Contexto> = (
  request: NextRequest,
  entrada: Entrada<Contexto>,
) => Promise<NextResponse> | NextResponse;

export function rotaAutenticada<Contexto = unknown>(
  manipulador: Manipulador<Contexto>,
) {
  return async (
    request: NextRequest,
    contexto: Contexto,
  ): Promise<NextResponse> => {
    const sessao = await exigirUsuarioNaApi();

    if (!sessao.ok) {
      return sessao.resposta;
    }

    if (metodoModificaEstado(request.method) && !origemPermitida(request)) {
      return NextResponse.json(
        { erro: "Origem da requisição não permitida." },
        { status: 403 },
      );
    }

    const limite = consultarLimite(
      `api:${request.method}`,
      `${sessao.usuario.id}:${new URL(request.url).pathname}`,
      300,
      60_000,
    );

    if (!limite.permitido) {
      return NextResponse.json(
        { erro: "Muitas requisições. Tente novamente mais tarde." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limite.retryAfterMs / 1000)),
          },
        },
      );
    }

    try {
      return await manipulador(request, {
        usuario: sessao.usuario,
        contexto,
      });
    } catch (erro) {
      return respostaDeErro(erro);
    }
  };
}

export async function lerCorpoJson(
  request: NextRequest,
  limite = LIMITE_CORPO_JSON,
): Promise<unknown> {
  const tamanhoDeclarado = Number(request.headers.get("content-length"));

  if (Number.isFinite(tamanhoDeclarado) && tamanhoDeclarado > limite) {
    return null;
  }

  const leitor = request.body?.getReader();

  if (!leitor) {
    return null;
  }

  const partes: Buffer[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await leitor.read();

      if (done) {
        break;
      }

      total += value.byteLength;

      if (total > limite) {
        await leitor.cancel();
        return null;
      }

      partes.push(Buffer.from(value));
    }
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.concat(partes).toString("utf8"));
  } catch {
    return null;
  }
}

export function respostaErro(mensagem: string, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

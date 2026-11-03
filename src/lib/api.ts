import { NextResponse, type NextRequest } from "next/server";
import { respostaDeErro } from "@/lib/resposta-erro";
import { exigirUsuarioNaApi, type Usuario } from "@/lib/sessao";

export type ContextoRota<Parametros> = { params: Promise<Parametros> };

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

export function lerCorpoJson(request: NextRequest): Promise<unknown> {
  return request.json().catch(() => null);
}

export function respostaErro(mensagem: string, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

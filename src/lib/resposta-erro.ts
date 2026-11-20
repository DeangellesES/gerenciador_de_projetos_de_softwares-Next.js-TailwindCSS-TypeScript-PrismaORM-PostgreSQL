import { NextResponse } from "next/server";

export function respostaDeErro(
  erro: unknown,
  mensagem = "Erro interno ao processar a solicitação.",
) {
  console.error("[api] falha ao processar a requisição", {
    nome: erro instanceof Error ? erro.name : "Erro",
    codigo: (erro as { code?: unknown }).code,
  });

  return NextResponse.json({ erro: mensagem }, { status: 500 });
}

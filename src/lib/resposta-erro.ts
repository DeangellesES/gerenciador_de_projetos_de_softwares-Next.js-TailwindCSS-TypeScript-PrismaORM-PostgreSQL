import { NextResponse } from "next/server";

export function respostaDeErro(
  erro: unknown,
  mensagem = "Erro interno ao processar a solicitação.",
) {
  console.error("[api] erro ao executar a requisição:", erro);

  return NextResponse.json({ erro: mensagem }, { status: 500 });
}

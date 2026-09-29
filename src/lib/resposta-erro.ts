import { NextResponse } from "next/server";

export function respostaDeErro(erro: unknown) {
  console.error("[api] erro ao executar a requisição:", erro);

  return NextResponse.json(
    { erro: "Erro interno ao acessar o banco de dados." },
    { status: 500 },
  );
}

import { NextResponse } from "next/server";
import {
  lerCorpoJson,
  respostaErro,
  rotaAutenticada,
} from "@/lib/api";
import { revalidarProjetos } from "@/lib/paginas";
import { ehStatusProjeto } from "@/lib/projetos";
import { criarProjeto, listarProjetos } from "@/lib/repositorio-projetos";
import { validarProjeto } from "@/lib/validacao-projetos";

const STATUS_INVALIDO =
  "Status inválido. Use ativo, iniciando, finalizando, concluido ou ideia.";

export const GET = rotaAutenticada(async (request, { usuario }) => {
  const parametros = request.nextUrl.searchParams;
  const status = parametros.get("status");
  const busca = parametros.get("q");

  if (status && !ehStatusProjeto(status)) {
    return respostaErro(STATUS_INVALIDO);
  }

  const projetos = await listarProjetos(usuario.id, {
    status: ehStatusProjeto(status) ? status : undefined,
    busca: busca?.trim() || undefined,
  });

  return NextResponse.json(projetos);
});

export const POST = rotaAutenticada(async (request, { usuario }) => {
  const validacao = validarProjeto(await lerCorpoJson(request));

  if (!validacao.ok) {
    return respostaErro(validacao.erro);
  }

  const projeto = await criarProjeto(usuario.id, validacao.dados);
  revalidarProjetos();

  return NextResponse.json(projeto, { status: 201 });
});

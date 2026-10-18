import { NextResponse, type NextRequest } from "next/server";
import { criarProjeto, listarProjetos } from "@/lib/repositorio-projetos";
import { ehStatusProjeto } from "@/lib/projetos";
import { validarProjeto } from "@/lib/validacao-projetos";
import { respostaDeErro } from "@/lib/resposta-erro";
import { revalidarProjetos } from "@/lib/paginas";
import { exigirUsuarioNaApi } from "@/lib/sessao";

export async function GET(request: NextRequest) {
  const sessao = await exigirUsuarioNaApi();

  if (!sessao.ok) {
    return sessao.resposta;
  }

  const parametros = request.nextUrl.searchParams;
  const status = parametros.get("status");
  const busca = parametros.get("q");

  if (status && !ehStatusProjeto(status)) {
    return NextResponse.json(
      { erro: "Status inválido. Use ativo, iniciando, finalizando, concluido ou ideia." },
      { status: 400 },
    );
  }

  try {
    const projetos = await listarProjetos(sessao.usuario.id, {
      status: ehStatusProjeto(status) ? status : undefined,
      busca: busca?.trim() || undefined,
    });

    return NextResponse.json(projetos);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

export async function POST(request: NextRequest) {
  const sessao = await exigirUsuarioNaApi();

  if (!sessao.ok) {
    return sessao.resposta;
  }

  const corpo = await request.json().catch(() => null);
  const validacao = validarProjeto(corpo);

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  try {
    const projeto = await criarProjeto(sessao.usuario.id, validacao.dados);
    revalidarProjetos();

    return NextResponse.json(projeto, { status: 201 });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

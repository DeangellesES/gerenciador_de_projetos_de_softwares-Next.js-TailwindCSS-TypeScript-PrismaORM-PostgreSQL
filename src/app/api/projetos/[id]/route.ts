import { NextResponse, type NextRequest } from "next/server";
import {
  atualizarProjeto,
  buscarProjetoPorId,
  removerProjeto,
} from "@/lib/repositorio-projetos";
import { validarAtualizacao } from "@/lib/validacao-projetos";
import { respostaDeErro } from "@/lib/resposta-erro";
import { revalidarProjetos } from "@/lib/paginas";
import { exigirUsuarioNaApi } from "@/lib/sessao";

type Contexto = {
  params: Promise<{ id: string }>;
};

const NAO_ENCONTRADO = { erro: "Projeto não encontrado." };

export async function GET(_request: NextRequest, { params }: Contexto) {
  const sessao = await exigirUsuarioNaApi();

  if (!sessao.ok) {
    return sessao.resposta;
  }

  const { id } = await params;

  try {
    const projeto = await buscarProjetoPorId(sessao.usuario.id, id);

    if (!projeto) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    return NextResponse.json(projeto);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

export async function PATCH(request: NextRequest, { params }: Contexto) {
  const sessao = await exigirUsuarioNaApi();

  if (!sessao.ok) {
    return sessao.resposta;
  }

  const { id } = await params;
  const corpo = await request.json().catch(() => null);
  const validacao = validarAtualizacao(corpo);

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  try {
    const projeto = await atualizarProjeto(
      sessao.usuario.id,
      id,
      validacao.dados,
    );

    if (!projeto) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    revalidarProjetos(id);

    return NextResponse.json(projeto);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

export async function DELETE(_request: NextRequest, { params }: Contexto) {
  const sessao = await exigirUsuarioNaApi();

  if (!sessao.ok) {
    return sessao.resposta;
  }

  const { id } = await params;

  try {
    const removido = await removerProjeto(sessao.usuario.id, id);

    if (!removido) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    revalidarProjetos(id);

    return NextResponse.json(removido);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

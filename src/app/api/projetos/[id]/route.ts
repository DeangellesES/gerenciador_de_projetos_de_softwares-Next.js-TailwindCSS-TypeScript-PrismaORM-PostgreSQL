import { NextResponse, type NextRequest } from "next/server";
import {
  atualizarProjeto,
  buscarProjetoPorId,
  removerProjeto,
} from "@/lib/repositorio-projetos";
import { validarAtualizacao } from "@/lib/validacao-projetos";
import { respostaDeErro } from "@/lib/resposta-erro";
import { revalidarProjetos } from "@/lib/paginas";

type Contexto = {
  params: Promise<{ id: string }>;
};

const NAO_ENCONTRADO = { erro: "Projeto não encontrado." };

export async function GET(_request: NextRequest, { params }: Contexto) {
  const { id } = await params;

  try {
    const projeto = await buscarProjetoPorId(id);

    if (!projeto) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    return NextResponse.json(projeto);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

export async function PATCH(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const corpo = await request.json().catch(() => null);
  const validacao = validarAtualizacao(corpo);

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  try {
    const projeto = await atualizarProjeto(id, validacao.dados);

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
  const { id } = await params;

  try {
    const existente = await buscarProjetoPorId(id);

    if (!existente) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    const removido = await removerProjeto(id);
    revalidarProjetos(id);

    return NextResponse.json(removido);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

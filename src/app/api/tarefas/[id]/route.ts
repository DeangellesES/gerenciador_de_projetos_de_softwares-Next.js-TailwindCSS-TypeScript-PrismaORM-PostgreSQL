import { NextResponse, type NextRequest } from "next/server";
import {
  atualizarTarefa,
  removerTarefa,
} from "@/lib/repositorio-tarefas";
import { validarAtualizacaoTarefa } from "@/lib/validacao-tarefas";
import { respostaDeErro } from "@/lib/resposta-erro";
import { revalidarProjetos } from "@/lib/paginas";
import { exigirUsuarioNaApi } from "@/lib/sessao";

type Contexto = {
  params: Promise<{ id: string }>;
};

const NAO_ENCONTRADA = { erro: "Tarefa não encontrada." };

export async function PATCH(request: NextRequest, { params }: Contexto) {
  const sessao = await exigirUsuarioNaApi();

  if (!sessao.ok) {
    return sessao.resposta;
  }

  const { id } = await params;
  const corpo = await request.json().catch(() => null);
  const validacao = validarAtualizacaoTarefa(corpo);

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  try {
    const tarefa = await atualizarTarefa(
      sessao.usuario.id,
      id,
      validacao.dados,
    );

    if (!tarefa) {
      return NextResponse.json(NAO_ENCONTRADA, { status: 404 });
    }

    revalidarProjetos(tarefa.projetoId);

    return NextResponse.json(tarefa);
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
    const removida = await removerTarefa(sessao.usuario.id, id);

    if (!removida) {
      return NextResponse.json(NAO_ENCONTRADA, { status: 404 });
    }

    revalidarProjetos(removida.projetoId);

    return NextResponse.json(removida);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

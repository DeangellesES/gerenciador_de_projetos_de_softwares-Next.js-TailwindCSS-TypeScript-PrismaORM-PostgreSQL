import { NextResponse, type NextRequest } from "next/server";
import { buscarProjetoPorId } from "@/lib/repositorio-projetos";
import { criarTarefa, listarTarefas } from "@/lib/repositorio-tarefas";
import { validarTarefa } from "@/lib/validacao-tarefas";
import { respostaDeErro } from "@/lib/resposta-erro";
import { revalidarProjetos } from "@/lib/paginas";

type Contexto = {
  params: Promise<{ id: string }>;
};

const PROJETO_NAO_ENCONTRADO = { erro: "Projeto não encontrado." };

export async function GET(_request: NextRequest, { params }: Contexto) {
  const { id } = await params;

  try {
    const projeto = await buscarProjetoPorId(id);

    if (!projeto) {
      return NextResponse.json(PROJETO_NAO_ENCONTRADO, { status: 404 });
    }

    return NextResponse.json(await listarTarefas(id));
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

export async function POST(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const corpo = await request.json().catch(() => null);
  const validacao = validarTarefa(corpo);

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  try {
    const projeto = await buscarProjetoPorId(id);

    if (!projeto) {
      return NextResponse.json(PROJETO_NAO_ENCONTRADO, { status: 404 });
    }

    const tarefa = await criarTarefa(id, validacao.dados);
    revalidarProjetos(id);

    return NextResponse.json(tarefa, { status: 201 });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

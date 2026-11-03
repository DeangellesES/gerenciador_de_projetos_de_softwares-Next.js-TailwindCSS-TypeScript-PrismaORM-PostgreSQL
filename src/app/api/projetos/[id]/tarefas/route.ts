import { NextResponse } from "next/server";
import {
  lerCorpoJson,
  respostaErro,
  rotaAutenticada,
  type ContextoRota,
} from "@/lib/api";
import { revalidarProjetos } from "@/lib/paginas";
import { buscarProjetoPorId } from "@/lib/repositorio-projetos";
import { criarTarefa, listarTarefas } from "@/lib/repositorio-tarefas";
import { validarTarefa } from "@/lib/validacao-tarefas";

type Contexto = ContextoRota<{ id: string }>;

const PROJETO_NAO_ENCONTRADO = { erro: "Projeto não encontrado." };

export const GET = rotaAutenticada<Contexto>(
  async (_request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const projeto = await buscarProjetoPorId(usuario.id, id);

    if (!projeto) {
      return NextResponse.json(PROJETO_NAO_ENCONTRADO, { status: 404 });
    }

    return NextResponse.json(await listarTarefas(id));
  },
);

export const POST = rotaAutenticada<Contexto>(
  async (request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const validacao = validarTarefa(await lerCorpoJson(request));

    if (!validacao.ok) {
      return respostaErro(validacao.erro);
    }

    const projeto = await buscarProjetoPorId(usuario.id, id);

    if (!projeto) {
      return NextResponse.json(PROJETO_NAO_ENCONTRADO, { status: 404 });
    }

    const tarefa = await criarTarefa(id, validacao.dados);
    revalidarProjetos(id);

    return NextResponse.json(tarefa, { status: 201 });
  },
);

import { NextResponse } from "next/server";
import {
  lerCorpoJson,
  respostaErro,
  rotaAutenticada,
  type ContextoRota,
} from "@/lib/api";
import { revalidarProjetos } from "@/lib/paginas";
import { atualizarTarefa, removerTarefa } from "@/lib/repositorio-tarefas";
import { validarAtualizacaoTarefa } from "@/lib/validacao-tarefas";

type Contexto = ContextoRota<{ id: string }>;

const NAO_ENCONTRADA = { erro: "Tarefa não encontrada." };

export const PATCH = rotaAutenticada<Contexto>(
  async (request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const validacao = validarAtualizacaoTarefa(await lerCorpoJson(request));

    if (!validacao.ok) {
      return respostaErro(validacao.erro);
    }

    const tarefa = await atualizarTarefa(usuario.id, id, validacao.dados);

    if (!tarefa) {
      return NextResponse.json(NAO_ENCONTRADA, { status: 404 });
    }

    revalidarProjetos(tarefa.projetoId);

    return NextResponse.json(tarefa);
  },
);

export const DELETE = rotaAutenticada<Contexto>(
  async (_request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const removida = await removerTarefa(usuario.id, id);

    if (!removida) {
      return NextResponse.json(NAO_ENCONTRADA, { status: 404 });
    }

    revalidarProjetos(removida.projetoId);

    return NextResponse.json(removida);
  },
);

import { NextResponse } from "next/server";
import {
  lerCorpoJson,
  respostaErro,
  rotaAutenticada,
  type ContextoRota,
} from "@/lib/api";
import { revalidarProjetos } from "@/lib/paginas";
import {
  atualizarProjeto,
  buscarProjetoPorId,
  removerProjeto,
} from "@/lib/repositorio-projetos";
import { validarAtualizacao } from "@/lib/validacao-projetos";

type Contexto = ContextoRota<{ id: string }>;

const NAO_ENCONTRADO = { erro: "Projeto não encontrado." };

export const GET = rotaAutenticada<Contexto>(
  async (_request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const projeto = await buscarProjetoPorId(usuario.id, id);

    if (!projeto) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    return NextResponse.json(projeto);
  },
);

export const PATCH = rotaAutenticada<Contexto>(
  async (request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const validacao = validarAtualizacao(await lerCorpoJson(request));

    if (!validacao.ok) {
      return respostaErro(validacao.erro);
    }

    const projeto = await atualizarProjeto(usuario.id, id, validacao.dados);

    if (!projeto) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    revalidarProjetos(id);

    return NextResponse.json(projeto);
  },
);

export const DELETE = rotaAutenticada<Contexto>(
  async (_request, { usuario, contexto }) => {
    const { id } = await contexto.params;
    const removido = await removerProjeto(usuario.id, id);

    if (!removido) {
      return NextResponse.json(NAO_ENCONTRADO, { status: 404 });
    }

    revalidarProjetos(id);

    return NextResponse.json(removido);
  },
);

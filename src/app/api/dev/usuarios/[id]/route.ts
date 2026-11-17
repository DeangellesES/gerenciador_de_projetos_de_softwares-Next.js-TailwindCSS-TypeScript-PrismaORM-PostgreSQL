import { NextResponse, type NextRequest } from "next/server";
import { lerCorpoJson, respostaErro } from "@/lib/api";
import { getPrisma } from "@/lib/db";
import {
  autorizarDev,
  CamposUsuario,
  filtroPorIdentificador,
  validarAtualizacao,
} from "@/lib/dev-api";
import { respostaDeErro } from "@/lib/resposta-erro";

type Contexto = { params: Promise<{ id: string }> };

function buscarUsuario(identificador: string) {
  return getPrisma().user.findFirst({
    where: filtroPorIdentificador(identificador),
    select: CamposUsuario,
  });
}

export async function GET(request: NextRequest, contexto: Contexto) {
  const negado = autorizarDev(request);

  if (negado) {
    return negado;
  }

  const { id } = await contexto.params;

  try {
    const usuario = await buscarUsuario(id);

    if (!usuario) {
      return respostaErro("Usuário não encontrado.", 404);
    }

    return NextResponse.json({ usuario });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

export async function PUT(request: NextRequest, contexto: Contexto) {
  const negado = autorizarDev(request);

  if (negado) {
    return negado;
  }

  const { id } = await contexto.params;
  const validacao = validarAtualizacao(await lerCorpoJson(request));

  if (!validacao.ok) {
    return respostaErro(validacao.erro);
  }

  try {
    const encontrado = await buscarUsuario(id);

    if (!encontrado) {
      return respostaErro("Usuário não encontrado.", 404);
    }

    const usuario = await getPrisma().user.update({
      where: { id: encontrado.id },
      data: validacao.dados,
      select: CamposUsuario,
    });

    return NextResponse.json({ usuario });
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") {
      return respostaErro("Já existe um usuário com esse e-mail.", 409);
    }

    return respostaDeErro(erro);
  }
}

export async function DELETE(request: NextRequest, contexto: Contexto) {
  const negado = autorizarDev(request);

  if (negado) {
    return negado;
  }

  const { id } = await contexto.params;

  try {
    const encontrado = await buscarUsuario(id);

    if (!encontrado) {
      return respostaErro("Usuário não encontrado.", 404);
    }

    const usuario = await getPrisma().user.delete({
      where: { id: encontrado.id },
      select: CamposUsuario,
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Usuário excluído.",
      usuario,
    });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

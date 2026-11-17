import { NextResponse, type NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { autorizarDev, CamposUsuario } from "@/lib/dev-api";
import { respostaDeErro } from "@/lib/resposta-erro";

export async function GET(request: NextRequest) {
  const negado = autorizarDev(request);

  if (negado) {
    return negado;
  }

  const email = request.nextUrl.searchParams.get("email")?.trim();

  try {
    const usuarios = await getPrisma().user.findMany({
      where: email
        ? { email: { equals: email, mode: "insensitive" } }
        : undefined,
      select: {
        ...CamposUsuario,
        _count: {
          select: { projetos: true, sessions: true, accounts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ usuarios });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}

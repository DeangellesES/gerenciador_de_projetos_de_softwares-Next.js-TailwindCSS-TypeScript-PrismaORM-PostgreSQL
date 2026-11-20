import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import {
  loginBloqueado,
  registrarFalhaLogin,
  registrarSucessoLogin,
} from "@/lib/limite-login";
import { ipDeCabecalhos } from "@/lib/seguranca";
import { senhaEhForte } from "@/lib/validacao";

const manipuladores = toNextJsHandler(auth);

export const GET = manipuladores.GET;

async function lerCorpoSeguro(request: Request) {
  try {
    const corpo: unknown = await request.clone().json();

    return corpo && typeof corpo === "object" && !Array.isArray(corpo)
      ? (corpo as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function textoCampo(corpo: Record<string, unknown> | null, campo: string) {
  const valor = corpo?.[campo];

  return typeof valor === "string" ? valor : "";
}

export async function POST(request: Request) {
  const caminho = new URL(request.url).pathname;

  if (caminho.endsWith("/sign-up/email")) {
    const corpo = await lerCorpoSeguro(request);

    if (!senhaEhForte(corpo?.password)) {
      return NextResponse.json(
        {
          message:
            "A senha deve ter ao menos 12 caracteres, incluindo letras e números.",
        },
        { status: 400 },
      );
    }
  }

  if (caminho.endsWith("/sign-in/email")) {
    const corpo = await lerCorpoSeguro(request);
    const email = textoCampo(corpo, "email");
    const ip = ipDeCabecalhos(request.headers);

    if (email && loginBloqueado(email, ip)) {
      return NextResponse.json(
        { message: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    const resposta = await manipuladores.POST(request);

    if (resposta.status === 200) {
      registrarSucessoLogin(email, ip);
    } else if (resposta.status === 401 && email) {
      registrarFalhaLogin(email, ip);
    }

    return resposta;
  }

  return manipuladores.POST(request);
}

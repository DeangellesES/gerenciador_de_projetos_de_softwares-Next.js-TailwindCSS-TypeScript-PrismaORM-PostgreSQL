import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth, type Sessao } from "@/lib/auth";

export type Usuario = Sessao["user"];

export async function getSessionUsuario(): Promise<Usuario | null> {
  const sessao = await auth.api.getSession({ headers: await headers() });

  return sessao?.user ?? null;
}

export async function exigirUsuarioNaPagina(): Promise<Usuario> {
  const usuario = await getSessionUsuario();

  if (!usuario) {
    redirect("/login");
  }

  return usuario;
}

export async function exigirUsuarioNaApi(): Promise<
  | { ok: true; usuario: Usuario }
  | { ok: false; resposta: NextResponse }
> {
  const usuario = await getSessionUsuario();

  if (!usuario) {
    return {
      ok: false,
      resposta: NextResponse.json(
        { erro: "Não autenticado. Faça login para continuar." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, usuario };
}

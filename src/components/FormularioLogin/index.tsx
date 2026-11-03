"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BOTAO_PRIMARIO, CAMPOS } from "@/components/ui/estilos";
import { authClient } from "@/lib/auth-client";

function mensagemDeErro(erro: { status?: number; message?: string } | null) {
  if (erro?.status === 401) {
    return "E-mail ou senha inválidos.";
  }

  return erro?.message || "Não foi possível entrar. Tente novamente.";
}

export default function FormularioLogin() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const dados = new FormData(evento.currentTarget);
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");

    const { error } = await authClient.signIn.email({ email, password: senha });

    if (error) {
      setErro(mensagemDeErro(error));
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={enviar}
      className="bg-[#131B2E] border border-white/10 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-white text-xl font-bold">Entrar</h1>
        <p className="text-[#94A3B8] text-sm">
          Acesse sua conta para ver seus projetos.
        </p>
      </header>

      <label className="flex flex-col gap-1 text-sm text-white">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="voce@exemplo.com"
          className={CAMPOS}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-white">
        Senha
        <input
          type="password"
          name="senha"
          required
          autoComplete="current-password"
          placeholder="Sua senha"
          className={CAMPOS}
        />
      </label>

      {erro ? <p className="text-sm text-red-300">{erro}</p> : null}

      <button type="submit" disabled={enviando} className={BOTAO_PRIMARIO}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-sm text-[#94A3B8] text-center">
        Não tem uma conta?{" "}
        <Link href="/cadastro" className="text-[#7DD3FC] hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

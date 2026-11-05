"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BOTAO_PRIMARIO, CAMPOS } from "@/components/ui/estilos";
import { authClient } from "@/lib/auth-client";

function mensagemDeErro(erro: { status?: number; message?: string } | null) {
  if (erro?.status === 422) {
    return "Este e-mail já está cadastrado.";
  }

  return erro?.message || "Não foi possível criar a conta. Tente novamente.";
}

export default function FormularioCadastro() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") ?? "");
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");

    const { error } = await authClient.signUp.email({
      name: nome,
      email,
      password: senha,
      fetchOptions: { body: { rememberMe: false } },
    });

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
        <h1 className="text-white text-xl font-bold">Criar conta</h1>
        <p className="text-[#94A3B8] text-sm">
          Cadastre-se para organizar seus próprios projetos.
        </p>
      </header>

      <label className="flex flex-col gap-1 text-sm text-white">
        Nome
        <input
          name="nome"
          required
          maxLength={80}
          autoComplete="name"
          placeholder="Seu nome"
          className={CAMPOS}
        />
      </label>

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
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          className={CAMPOS}
        />
      </label>

      {erro ? <p className="text-sm text-red-300">{erro}</p> : null}

      <button type="submit" disabled={enviando} className={BOTAO_PRIMARIO}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-sm text-[#94A3B8] text-center">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-[#7DD3FC] hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

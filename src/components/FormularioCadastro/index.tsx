"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BOTAO_PRIMARIO, CAMPOS } from "@/components/ui/estilos";
import { authClient } from "@/lib/auth-client";
import BotaoGoogle from "@/components/BotaoGoogle";

function mensagemDeErro(erro: { status?: number } | null) {
  if (erro?.status === 429) {
    return "Muitas tentativas. Tente novamente mais tarde.";
  }

  if (erro?.status === 400) {
    return "Revise os dados informados.";
  }

  return "Não foi possível criar a conta. Tente novamente.";
}

export default function FormularioCadastro({
  googleHabilitado = false,
  verificacaoObrigatoria = false,
}: {
  googleHabilitado?: boolean;
  verificacaoObrigatoria?: boolean;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    setMensagem(null);

    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") ?? "");
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");

    const { error } = await authClient.signUp.email({
      name: nome,
      email,
      password: senha,
      callbackURL: "/login",
      fetchOptions: { body: { rememberMe: false } },
    });

    if (error) {
      setErro(mensagemDeErro(error));
      setEnviando(false);
      return;
    }

    if (verificacaoObrigatoria) {
      setMensagem(
        "Conta criada. Enviamos um e-mail de verificação; confirme seu endereço para entrar.",
      );
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={enviar}
      className="bg-superficie border border-borda rounded-xl p-6 w-full max-w-sm flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-texto text-xl font-bold">Criar conta</h1>
        <p className="text-texto-secundario text-sm">
          Cadastre-se para organizar seus próprios projetos.
        </p>
      </header>

      <label className="flex flex-col gap-1 text-sm text-texto">
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

      <label className="flex flex-col gap-1 text-sm text-texto">
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

      <label className="flex flex-col gap-1 text-sm text-texto">
        Senha
        <input
          type="password"
          name="senha"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Mínimo de 12 caracteres"
          className={CAMPOS}
        />
        <span className="text-xs text-texto-secundario">
          Use ao menos 12 caracteres, com letras e números.
        </span>
      </label>

      {erro ? <p className="text-sm text-perigo">{erro}</p> : null}
      {mensagem ? (
        <p className="text-sm text-destaque">{mensagem}</p>
      ) : null}

      <button type="submit" disabled={enviando} className={BOTAO_PRIMARIO}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>

      <BotaoGoogle googleHabilitado={googleHabilitado} />

      <p className="text-sm text-texto-secundario text-center">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-destaque hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

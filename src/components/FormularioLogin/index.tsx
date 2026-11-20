"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BOTAO_PRIMARIO, CAMPOS } from "@/components/ui/estilos";
import { authClient } from "@/lib/auth-client";
import BotaoGoogle from "@/components/BotaoGoogle";

function mensagemDeErro(erro: { status?: number } | null) {
  if (erro?.status === 401) {
    return "E-mail ou senha inválidos.";
  }

  if (erro?.status === 403) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (erro?.status === 429) {
    return "Muitas tentativas. Tente novamente mais tarde.";
  }

  return "Não foi possível entrar. Tente novamente.";
}

export default function FormularioLogin({
  googleHabilitado = false,
  verificacaoEmailHabilitada = false,
}: {
  googleHabilitado?: boolean;
  verificacaoEmailHabilitada?: boolean;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [verificacaoPendente, setVerificacaoPendente] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    setMensagem(null);
    setVerificacaoPendente(false);

    const dados = new FormData(evento.currentTarget);
    const emailInformado = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");

    setEmail(emailInformado);

    const { error } = await authClient.signIn.email({
      email: emailInformado,
      password: senha,
      rememberMe: false,
    });

    if (error) {
      setErro(mensagemDeErro(error));
      setVerificacaoPendente(
        verificacaoEmailHabilitada && error.status === 403,
      );
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function reenviarVerificacao() {
    setEnviando(true);
    setErro(null);
    setMensagem(null);

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/login",
    });

    setMensagem(
      error
        ? "Não foi possível reenviar o e-mail. Tente novamente."
        : "E-mail de verificação enviado.",
    );
    setEnviando(false);
  }

  return (
    <form
      onSubmit={enviar}
      className="bg-superficie border border-borda rounded-xl p-6 w-full max-w-sm flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-texto text-xl font-bold">Entrar</h1>
        <p className="text-texto-secundario text-sm">
          Acesse sua conta para ver seus projetos.
        </p>
      </header>

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
          autoComplete="current-password"
          placeholder="Sua senha"
          className={CAMPOS}
        />
      </label>

      {erro ? <p className="text-sm text-perigo">{erro}</p> : null}
      {mensagem ? (
        <p className="text-sm text-destaque">{mensagem}</p>
      ) : null}

      {verificacaoPendente ? (
        <button
          type="button"
          onClick={reenviarVerificacao}
          disabled={enviando}
          className="text-sm text-destaque hover:underline"
        >
          Reenviar e-mail de verificação
        </button>
      ) : null}

      <button type="submit" disabled={enviando} className={BOTAO_PRIMARIO}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <BotaoGoogle googleHabilitado={googleHabilitado} />

      <p className="text-sm text-texto-secundario text-center">
        Não tem uma conta?{" "}
        <Link href="/cadastro" className="text-destaque hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

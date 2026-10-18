import type { ReactNode } from "react";
import LadoDireito from "@/components/Direita";
import LadoEsquerdo from "@/components/Esquerda";
import { exigirUsuarioNaPagina } from "@/lib/sessao";

export const dynamic = "force-dynamic";

export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await exigirUsuarioNaPagina();

  return (
    <div className="flex">
      <LadoEsquerdo usuario={{ nome: usuario.name, email: usuario.email }} />
      <LadoDireito>{children}</LadoDireito>
    </div>
  );
}

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { FolderCode } from "lucide-react";
import { getSessionUsuario } from "@/lib/sessao";
import BotaoTema from "@/components/BotaoTema";

export const dynamic = "force-dynamic";

export default async function AutenticacaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await getSessionUsuario();

  if (usuario) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen bg-fundo flex flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="absolute top-4 right-4">
        <BotaoTema />
      </div>
      <div className="flex items-center gap-3 text-texto font-bold text-xl">
        <FolderCode size={40} className="text-destaque" />
        Gerenciador de Projetos
      </div>
      {children}
    </div>
  );
}

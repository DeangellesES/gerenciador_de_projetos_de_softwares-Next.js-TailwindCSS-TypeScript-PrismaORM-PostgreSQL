import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { FolderCode } from "lucide-react";
import { getSessionUsuario } from "@/lib/sessao";

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
    <div className="min-h-screen bg-[#080F21] flex flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex items-center gap-3 text-white font-bold text-xl">
        <FolderCode size={40} className="text-[#7DD3FC]" />
        Gerenciador de Projetos
      </div>
      {children}
    </div>
  );
}

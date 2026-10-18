import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SquareKanban } from "lucide-react";
import QuadroKanban from "@/components/QuadroKanban";
import { buscarProjetoPorId } from "@/lib/repositorio-projetos";
import { listarTarefas } from "@/lib/repositorio-tarefas";
import { exigirUsuarioNaPagina, getSessionUsuario } from "@/lib/sessao";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const usuario = await getSessionUsuario();
  const projeto = usuario ? await buscarProjetoPorId(usuario.id, id) : null;

  return { title: projeto ? `Kanban · ${projeto.nome}` : "Projeto não encontrado" };
}

export default async function PaginaKanban({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await exigirUsuarioNaPagina();
  const projeto = await buscarProjetoPorId(usuario.id, id);

  if (!projeto) {
    notFound();
  }

  const tarefas = await listarTarefas(id);

  return (
    <div className="px-10 py-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <Link
          href="/projetos"
          className="text-sm text-[#94A3B8] hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para Meus Projetos
        </Link>

        <Link
          href={`/projetos/${projeto.id}`}
          className="text-sm text-sky-300 hover:text-sky-200 transition-colors"
        >
          Ver detalhes do projeto
        </Link>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <SquareKanban size={24} className="text-[#7DD3FC]" />
          Kanban
        </h1>
        <p className="text-[#94A3B8] text-sm">
          Organize o desenvolvimento de{" "}
          <span className="text-white font-medium">{projeto.nome}</span>: o que
          precisa ser feito, o que está em andamento e o que já foi concluído.
        </p>
      </header>

      <QuadroKanban projetoId={projeto.id} tarefasIniciais={tarefas} />
    </div>
  );
}

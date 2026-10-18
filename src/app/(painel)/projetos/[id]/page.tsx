import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import AcoesProjeto from "@/components/AcoesProjeto";
import { buscarProjetoPorId } from "@/lib/repositorio-projetos";
import { ROTULOS_STATUS, formatarData } from "@/lib/projetos";
import { exigirUsuarioNaPagina, getSessionUsuario } from "@/lib/sessao";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const usuario = await getSessionUsuario();
  const projeto = usuario ? await buscarProjetoPorId(usuario.id, id) : null;

  return { title: projeto ? projeto.nome : "Projeto não encontrado" };
}

export default async function PaginaProjeto({
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

  return (
    <div className="px-10 py-8 flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/projetos"
          className="text-sm text-[#94A3B8] hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para Meus Projetos
        </Link>

        <AcoesProjeto projeto={projeto} />
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-white text-2xl font-bold">{projeto.nome}</h1>
        <span className="text-xs text-[#D1D5DB] bg-white/5 border border-white/10 rounded-full px-3 py-1 self-start">
          {ROTULOS_STATUS[projeto.status]}
        </span>
        <p className="text-[#94A3B8] text-sm mt-1">{projeto.descricao}</p>
      </header>

      {projeto.status !== "ideia" ? (
        <section className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-[#94A3B8]">
            <span>Progresso</span>
            <span>{projeto.progresso ?? 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400"
              style={{ width: `${projeto.progresso ?? 0}%` }}
            />
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold">Tecnologias</h2>
        <div className="flex flex-wrap gap-2">
          {projeto.stack.map((tecnologia) => (
            <span
              key={tecnologia}
              className="text-xs text-[#D1D5DB] bg-white/5 border border-white/10 rounded-md px-2 py-1"
            >
              {tecnologia}
            </span>
          ))}
        </div>
      </section>

      {projeto.prazo ? (
        <section className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <CalendarDays size={16} />
          Prazo: {formatarData(projeto.prazo)}
        </section>
      ) : null}
    </div>
  );
}

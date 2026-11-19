import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import AcoesProjeto from "@/components/AcoesProjeto";
import MaisDetalhes from "@/components/MaisDetalhes";
import { buscarProjetoPorId } from "@/lib/repositorio-projetos";
import {
  ROTULOS_STATUS,
  ROTULO_VOLTAR_POR_STATUS,
  ROTA_POR_STATUS,
  formatarData,
} from "@/lib/projetos";
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
          href={ROTA_POR_STATUS[projeto.status]}
          className="text-sm text-texto-secundario hover:text-texto flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} />
          {ROTULO_VOLTAR_POR_STATUS[projeto.status]}
        </Link>

        <AcoesProjeto projeto={projeto} />
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-texto text-2xl font-bold">{projeto.nome}</h1>
        <span className="text-xs text-texto-suave bg-realce border border-borda rounded-full px-3 py-1 self-start">
          {ROTULOS_STATUS[projeto.status]}
        </span>
        <p className="text-texto-secundario text-sm mt-1">{projeto.descricao}</p>
      </header>

      {projeto.status !== "ideia" ? (
        <section className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-texto-secundario">
            <span>Progresso</span>
            <span>{projeto.progresso ?? 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-borda overflow-hidden">
            <div
              className="h-full rounded-full bg-status-ativo"
              style={{ width: `${projeto.progresso ?? 0}%` }}
            />
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-texto font-semibold">Tecnologias</h2>
        <div className="flex flex-wrap gap-2">
          {projeto.stack.map((tecnologia) => (
            <span
              key={tecnologia}
              className="text-xs text-texto-suave bg-realce border border-borda rounded-md px-2 py-1"
            >
              {tecnologia}
            </span>
          ))}
        </div>
      </section>

      <MaisDetalhes projeto={projeto} />

      {projeto.prazo ? (
        <section className="flex items-center gap-2 text-sm text-texto-secundario">
          <CalendarDays size={16} />
          Prazo: {formatarData(projeto.prazo)}
        </section>
      ) : null}
    </div>
  );
}

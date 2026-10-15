import { revalidatePath } from "next/cache";

const PAGINAS = ["/", "/projetos", "/projetos-concluidos", "/ideias-futuras"] as const;

export function revalidarProjetos(id?: string) {
  if (id) {
    revalidatePath(`/projetos/${id}`);
    revalidatePath(`/projetos/${id}/kanban`);
  }

  for (const pagina of PAGINAS) {
    revalidatePath(pagina);
  }
}

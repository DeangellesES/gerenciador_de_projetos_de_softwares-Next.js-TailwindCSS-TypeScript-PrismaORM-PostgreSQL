import type { Metadata } from "next";
import FormularioCadastro from "@/components/FormularioCadastro";
import { googleHabilitado } from "@/lib/auth";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaCadastro() {
  return <FormularioCadastro googleHabilitado={googleHabilitado} />;
}

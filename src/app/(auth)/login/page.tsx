import type { Metadata } from "next";
import FormularioLogin from "@/components/FormularioLogin";
import { googleHabilitado } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  return <FormularioLogin googleHabilitado={googleHabilitado} />;
}

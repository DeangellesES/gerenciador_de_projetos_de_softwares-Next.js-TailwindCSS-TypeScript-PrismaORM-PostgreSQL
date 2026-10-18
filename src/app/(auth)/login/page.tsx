import type { Metadata } from "next";
import FormularioLogin from "@/components/FormularioLogin";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  return <FormularioLogin />;
}

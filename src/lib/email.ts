import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const remetente = process.env.EMAIL_FROM?.trim();

export const emailHabilitado = Boolean(resendApiKey && remetente);

type DadosCadastro = {
  nome?: string | null;
  email: string;
};
 
const ENTIDADES_HTML: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escaparHtml(valor: string) {
  return valor.replace(/[&<>"']/g, (caractere) => ENTIDADES_HTML[caractere]);
}

function montarMensagem({ nome, email }: DadosCadastro) {
  const primeiroNome = nome?.trim().split(/\s+/)[0] || "Olá";

  const assunto = "Cadastro realizado com sucesso";

  const texto = [
    `Olá, ${primeiroNome}!`,
    "",
    "Seu cadastro no Gerenciador de Projetos foi realizado com sucesso.",
    `A conta ${email} já está pronta para uso.`,
    "",
    "Acesse o painel para criar seus projetos e acompanhar suas tarefas.",
    "",
    "Se você não realizou esse cadastro, ignore esta mensagem.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1F2937; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Cadastro realizado com sucesso</h2>
      <p>Olá, ${escaparHtml(primeiroNome)}!</p>
      <p>Seu cadastro no <strong>Gerenciador de Projetos</strong> foi realizado com sucesso.</p>
      <p>A conta <strong>${escaparHtml(email)}</strong> já está pronta para uso.</p>
      <p>Acesse o painel para criar seus projetos e acompanhar suas tarefas.</p>
      <p style="color: #64748B; font-size: 13px;">Se você não realizou esse cadastro, ignore esta mensagem.</p>
    </div>
  `.trim();

  return { assunto, texto, html };
}

export async function enviarEmailCadastro(dados: DadosCadastro) {
  if (!emailHabilitado) {
    console.warn(
      "[email] envio desativado: configure RESEND_API_KEY e EMAIL_FROM para enviar o e-mail de cadastro.",
    );
    return;
  }

  const resend = new Resend(resendApiKey);
  const { assunto, texto, html } = montarMensagem(dados);

  const { error } = await resend.emails.send({
    from: remetente!,
    to: dados.email,
    subject: assunto,
    text: texto,
    html,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail de cadastro: ${error.message}`);
  }
}

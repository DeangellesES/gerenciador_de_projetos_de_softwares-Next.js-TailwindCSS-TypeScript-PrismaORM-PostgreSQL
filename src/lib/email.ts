import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const remetente = process.env.EMAIL_FROM?.trim();

export const emailHabilitado = Boolean(resendApiKey && remetente);

type DadosCadastro = {
  nome?: string | null;
  email: string;
};

type DadosVerificacao = DadosCadastro & {
  url: string;
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

function montarMensagem({
  nome,
  email,
}: DadosCadastro, verificacaoPendente: boolean) {
  const primeiroNome = nome?.trim().split(/\s+/)[0] || "Olá";

  const assunto = "Cadastro realizado com sucesso";
  const statusConta = verificacaoPendente
    ? "Antes de acessar, confirme seu e-mail usando o link enviado separadamente."
    : `A conta ${email} já está pronta para uso.`;

  const texto = [
    `Olá, ${primeiroNome}!`,
    "",
    "Seu cadastro no Gerenciador de Projetos foi realizado com sucesso.",
    statusConta,
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
      <p>${escaparHtml(statusConta)}</p>
      <p>Acesse o painel para criar seus projetos e acompanhar suas tarefas.</p>
      <p style="color: #64748B; font-size: 13px;">Se você não realizou esse cadastro, ignore esta mensagem.</p>
    </div>
  `.trim();

  return { assunto, texto, html };
}

function montarMensagemVerificacao({ nome, email, url }: DadosVerificacao) {
  const primeiroNome = nome?.trim().split(/\s+/)[0] || "Olá";

  const texto = [
    `Olá, ${primeiroNome}!`,
    "",
    `Confirme o e-mail ${email} da sua conta no Gerenciador de Projetos.`,
    "",
    `Acesse este link para confirmar: ${url}`,
    "",
    "O link expira em 30 minutos. Se você não solicitou esta confirmação, ignore esta mensagem.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1F2937; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Confirme seu e-mail</h2>
      <p>Olá, ${escaparHtml(primeiroNome)}!</p>
      <p>Confirme o e-mail <strong>${escaparHtml(email)}</strong> da sua conta no Gerenciador de Projetos.</p>
      <p><a href="${escaparHtml(url)}">Confirmar e-mail</a></p>
      <p style="color: #64748B; font-size: 13px;">O link expira em 30 minutos. Se você não solicitou esta confirmação, ignore esta mensagem.</p>
    </div>
  `.trim();

  return { assunto: "Confirme seu e-mail", texto, html };
}

async function enviarEmail(
  destinatario: string,
  mensagem: { assunto: string; texto: string; html: string },
) {
  if (!emailHabilitado) {
    console.warn(
      "[email] envio desativado: configure RESEND_API_KEY e EMAIL_FROM para enviar e-mails.",
    );
    return;
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: remetente!,
    to: destinatario,
    subject: mensagem.assunto,
    text: mensagem.texto,
    html: mensagem.html,
  });

  if (error) {
    throw new Error("Falha ao enviar e-mail.");
  }
}

export async function enviarEmailCadastro(
  dados: DadosCadastro,
  verificacaoPendente = false,
) {
  await enviarEmail(
    dados.email,
    montarMensagem(dados, verificacaoPendente),
  );
}

export async function enviarEmailVerificacao(dados: DadosVerificacao) {
  await enviarEmail(dados.email, montarMensagemVerificacao(dados));
}

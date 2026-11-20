import test from "node:test";
import assert from "node:assert/strict";
import {
  consultarLimite,
  consumirLimite,
  reiniciarLimite,
  zerarLimites,
} from "../src/lib/limite-taxa";
import {
  ehObjeto,
  senhaEhForte,
  validarInteiroNaoNegativo,
} from "../src/lib/validacao";
import { validarProjeto } from "../src/lib/validacao-projetos";

function projetoValido(detalhes: string[], stack: string[]) {
  return {
    nome: "Projeto",
    descricao: "Descrição",
    status: "ativo",
    stack,
    detalhes,
    prazo: null,
  };
}

test("senhaEhForte exige tamanho, letras e números", () => {
  assert.equal(senhaEhForte("abc123456789"), true);
  assert.equal(senhaEhForte("abcdefghijk"), false);
  assert.equal(senhaEhForte("123456789012"), false);
  assert.equal(senhaEhForte("abc1234567"), false);
  assert.equal(senhaEhForte(123456789012), false);
});

test("ehObjeto rejeita arrays", () => {
  assert.equal(ehObjeto({ nome: "Projeto" }), true);
  assert.equal(ehObjeto([]), false);
  assert.equal(ehObjeto(null), false);
});

test("validarInteiroNaoNegativo limita a ordem", () => {
  assert.equal(validarInteiroNaoNegativo(0).ok, true);
  assert.equal(validarInteiroNaoNegativo(100_000).ok, true);
  assert.equal(validarInteiroNaoNegativo(100_001).ok, false);
  assert.equal(validarInteiroNaoNegativo(-1).ok, false);
});

test("limitador bloqueia após o máximo e libera após a janela", () => {
  zerarLimites();

  const agora = 1_000_000;
  const janela = 60_000;

  assert.equal(
    consumirLimite("teste", "chave", 3, janela, agora).permitido,
    true,
  );
  assert.equal(
    consumirLimite("teste", "chave", 3, janela, agora + 1).permitido,
    true,
  );
  assert.equal(
    consumirLimite("teste", "chave", 3, janela, agora + 2).permitido,
    true,
  );
  assert.equal(
    consumirLimite("teste", "chave", 3, janela, agora + 3).permitido,
    false,
  );
  assert.equal(
    consultarLimite("teste", "chave", 3, janela, agora + 4).permitido,
    false,
  );
  assert.equal(
    consultarLimite("teste", "chave", 3, janela, agora + janela).permitido,
    true,
  );
});

test("reiniciarLimite libera a chave", () => {
  zerarLimites();

  const agora = 2_000_000;

  consumirLimite("teste", "chave", 1, 60_000, agora);
  assert.equal(
    consultarLimite("teste", "chave", 1, 60_000, agora).permitido,
    false,
  );

  reiniciarLimite("teste", "chave");
  assert.equal(
    consultarLimite("teste", "chave", 1, 60_000, agora).permitido,
    true,
  );
});

test("validarProjeto impõe limites de listas sem bloquear uso normal", () => {
  const detalhes = Array.from({ length: 100 }, (_, i) => `Detalhe ${i + 1}`);
  const stack = Array.from({ length: 100 }, (_, i) => `Tecnologia ${i + 1}`);

  assert.equal(validarProjeto(projetoValido(detalhes, stack)).ok, true);

  const muitosDetalhes = validarProjeto(
    projetoValido([...detalhes, "Detalhe extra"], stack),
  );
  assert.equal(muitosDetalhes.ok, false);

  const muitaStack = validarProjeto(
    projetoValido(detalhes, [...stack, "Tecnologia extra"]),
  );
  assert.equal(muitaStack.ok, false);
});

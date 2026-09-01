const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const data = require("./data.js");
const {
  DIMENSIONS,
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(value = "moderadamente") {
  return Object.fromEntries(
    data.questions.map((question) => [question.id, value])
  );
}

test("mantém 210 itens em sequência, com os códigos do protocolo", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 210);
  assert.equal(data.questions[0].number, 1);
  assert.equal(data.questions.at(-1).number, 210);
  assert.equal(new Set(data.questions.map((question) => question.id)).size, 210);
  assert.equal(new Set(data.questions.map((question) => question.code)).size, 210);
  assert.equal(data.questions[0].code, "A018");
  assert.equal(data.questions[30].code, "B111");
  assert.equal(data.questions[61].code, "i304");
  assert.equal(data.questions.at(-1).code, "i679");
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [1, 2, 3, 4]
  );
});

test("não exibe pontuações numéricas nas alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[1-4]\s*[-–—:]/);
  });
});

test("mantém o código separado do texto das perguntas", () => {
  data.questions.forEach((question) => {
    assert.match(question.code, /^(?:A|B|i)\d{3}$/);
    assert.doesNotMatch(question.text, /^(?:A|B|i)\d{3}\b/);
  });
  assert.match(data.questions[0].text, /tomem decisões importantes/i);
  assert.equal(data.questions.at(-1).text, "Minto sem remorso.");
});

test("mapeia as 12 dimensões somente para códigos existentes", () => {
  const formCodes = new Set(data.questions.map((question) => question.code));

  assert.equal(Object.keys(DIMENSIONS).length, 12);
  Object.values(DIMENSIONS).forEach((codes) => {
    assert.equal(new Set(codes).size, codes.length);
    codes.forEach((code) => assert.equal(formCodes.has(code), true, code));
  });
});

test("exibe o código do protocolo no marcador visual", () => {
  const scriptSource = fs.readFileSync(path.join(__dirname, "script.js"), "utf8");

  assert.match(scriptSource, /itemCode\.textContent = question\.code/);
  assert.doesNotMatch(scriptSource, /itemNumber\.textContent = String\(question\.number\)/);
});

test("divide o preenchimento em 11 blocos de até 20 itens", () => {
  assert.equal(data.itemsPerPage, 20);
  assert.equal(Math.ceil(data.questions.length / data.itemsPerPage), 11);
});

test("envia perguntas e respostas textuais e as 12 dimensões em results_meta", () => {
  const scored = scoreResponses(data, completeResponses());
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.complete, true);
  assert.equal(results.length, 210);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Moderadamente");
  });
  assert.deepEqual(resultsMeta, {
    dependencia: 54,
    agressividade: 48,
    instabilidade_de_humor: 48,
    excentricidade: 54,
    necessidade_de_atencao: 39,
    desconfianca: 54,
    grandiosidade: 54,
    isolamento: 54,
    evitacao_a_criticas: 54,
    autossacrificio: 54,
    conscienciosidade: 69,
    inconsequencia: 54
  });
});

test("soma cada dimensão pelos códigos, independentemente da posição do item", () => {
  const responses = completeResponses("nada");
  const itemByCode = Object.fromEntries(
    data.questions.map((question) => [question.code, question.id])
  );

  DIMENSIONS.dependencia.forEach((code) => {
    responses[itemByCode[code]] = "muito";
  });

  const resultsMeta = buildResultsMetaPayload(scoreResponses(data, responses));

  assert.equal(resultsMeta.dependencia, DIMENSIONS.dependencia.length * 4);
  assert.equal(resultsMeta.agressividade, DIMENSIONS.agressividade.length);
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "nada" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 209);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

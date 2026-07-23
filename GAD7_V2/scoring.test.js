const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém exatamente sete itens e quatro alternativas válidas", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 7);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [0, 1, 2, 3]
  );
});

test("não inclui valores numéricos nos textos exibidos das alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[0-3]\s*[-–—:]/);
  });
});

test("calcula a pontuação bruta total entre zero e vinte e um", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [question.id, "nenhuma_vez"])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [question.id, "quase_todos"])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 21);
});

test("envia somente pergunta e resposta em results e somente o total em results_meta", () => {
  const values = [
    "nenhuma_vez",
    "varios_dias",
    "mais_da_metade",
    "quase_todos",
    "varios_dias",
    "mais_da_metade",
    "quase_todos"
  ];
  const responses = Object.fromEntries(
    data.questions.map((question, index) => [question.id, values[index]])
  );

  const scored = scoreResponses(data, responses);
  assert.equal(scored.complete, true);
  assert.equal(scored.totalScore, 12);

  const results = buildResultsPayload(scored);
  assert.equal(results.length, 7);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(typeof row.pergunta, "string");
    assert.equal(typeof row.resposta, "string");
  });

  const resultsMeta = buildResultsMetaPayload(scored);
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 12
  });
});

test("impede a criação do payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "varios_dias"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 6);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

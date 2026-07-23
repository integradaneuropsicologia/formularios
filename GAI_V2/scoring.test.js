const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém exatamente vinte itens e a correção dicotômica definida", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 20);
  assert.deepEqual(
    Object.fromEntries(data.responses.map((option) => [option.value, option.score])),
    {
      concordo: 1,
      discordo: 0
    }
  );
});

test("não inclui valores numéricos nos textos exibidos das alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[01]\s*[-–—:]/);
  });
});

test("calcula a pontuação bruta total entre zero e vinte", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [question.id, "discordo"])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [question.id, "concordo"])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 20);
});

test("soma um ponto para Concordo e zero para Discordo", () => {
  const responses = Object.fromEntries(
    data.questions.map((question, index) => [
      question.id,
      index < 8 ? "concordo" : "discordo"
    ])
  );

  const scored = scoreResponses(data, responses);
  assert.equal(scored.complete, true);
  assert.equal(scored.totalScore, 8);
});

test("envia somente pergunta e resposta em results e somente o total em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question, index) => [
      question.id,
      index % 2 === 0 ? "concordo" : "discordo"
    ])
  );

  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(results.length, 20);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.match(row.resposta, /^(Concordo|Discordo)$/);
  });
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 10
  });
});

test("impede a criação do payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "concordo"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 19);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

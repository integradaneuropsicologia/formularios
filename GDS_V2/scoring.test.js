const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  EXPECTED_REVERSED_ITEMS,
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém quinze itens, duas alternativas e os cinco itens invertidos do PDF", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 15);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [1, 0]
  );
  assert.deepEqual(EXPECTED_REVERSED_ITEMS, [1, 8, 13, 14, 15]);
  assert.deepEqual(
    data.questions
      .filter((question) => question.reverse)
      .map((question) => Number(question.id.replace("item_", ""))),
    EXPECTED_REVERSED_ITEMS
  );
});

test("exibe somente Sim e Não sem valores numéricos", () => {
  assert.deepEqual(
    data.responses.map((option) => option.label),
    ["Sim", "Não"]
  );
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /\d/);
  });
});

test("inverte somente os itens cuja resposta Não está em negrito", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "sim"])
  );
  const scored = scoreResponses(data, responses);

  assert.equal(scored.rows[0].correctedScore, 0);
  assert.equal(scored.rows[1].correctedScore, 1);
  assert.equal(scored.rows[7].correctedScore, 0);
  assert.equal(scored.rows[8].correctedScore, 1);
  assert.equal(scored.totalScore, 10);
});

test("calcula pontuação mínima zero e máxima quinze", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "sim" : "nao"
    ])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "nao" : "sim"
    ])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 15);
});

test("envia somente pergunta e resposta em results e somente o total em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "sim"])
  );
  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.totalScore, 10);
  assert.equal(results.length, 15);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Sim");
  });
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 10
  });
});

test("impede a criação do payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "sim"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 14);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

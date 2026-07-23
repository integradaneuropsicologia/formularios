const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  SCORED_ITEM_IDS,
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém nove itens pontuados e uma pergunta funcional", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 10);
  assert.deepEqual(SCORED_ITEM_IDS, [
    "item_1",
    "item_2",
    "item_3",
    "item_4",
    "item_5",
    "item_6",
    "item_7",
    "item_8",
    "item_9"
  ]);
  assert.equal(data.questions[9].scored, false);
  assert.equal(data.questions[9].responseGroup, "impact");
});

test("mantém as quatro pontuações de frequência e alternativas funcionais sem pontuação", () => {
  assert.deepEqual(
    data.responseGroups.frequency.map((option) => option.score),
    [0, 1, 2, 3]
  );
  assert.deepEqual(
    data.responseGroups.impact.map((option) => option.score),
    [undefined, undefined, undefined, undefined]
  );
});

test("não inclui valores numéricos nos textos exibidos das alternativas", () => {
  Object.values(data.responseGroups).flat().forEach((option) => {
    assert.doesNotMatch(option.label, /\d/);
  });
});

test("soma diretamente as respostas dos nove itens", () => {
  const scored = scoreResponses(data, {
    item_1: "nenhuma_vez",
    item_2: "varios_dias",
    item_3: "mais_da_metade",
    item_4: "quase_todos"
  });

  assert.deepEqual(
    scored.rows.slice(0, 4).map((row) => row.itemScore),
    [0, 1, 2, 3]
  );
  assert.equal(scored.totalScore, 6);
});

test("não inclui a pergunta funcional na pontuação bruta", () => {
  const scored = scoreResponses(data, {
    item_1: "varios_dias",
    item_10: "extrema_dificuldade"
  });

  assert.equal(scored.rows[9].itemScore, null);
  assert.equal(scored.totalScore, 1);
});

test("calcula pontuação mínima zero e máxima vinte e sete", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.scored ? "nenhuma_vez" : "nenhuma_dificuldade"
    ])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.scored ? "quase_todos" : "extrema_dificuldade"
    ])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 27);
});

test("envia todas as perguntas e respostas, mas somente o total em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.scored ? "varios_dias" : "alguma_dificuldade"
    ])
  );
  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.totalScore, 9);
  assert.equal(results.length, 10);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
  });
  assert.equal(results[0].resposta, "Vários dias");
  assert.equal(results[9].resposta, "Alguma dificuldade");
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 9
  });
});

test("impede a criação do payload enquanto houver pergunta sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "nenhuma_vez"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 9);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

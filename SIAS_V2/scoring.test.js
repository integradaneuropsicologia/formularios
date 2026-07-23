const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  REVERSED_ITEM_IDS,
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém os 20 itens e o crivo reverso documentado", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 20);
  assert.deepEqual(REVERSED_ITEM_IDS, ["item_5", "item_9", "item_11"]);
  assert.equal(data.questions[19].id, "item_20");
  assert.notEqual(data.questions[19].reverse, true);
});

test("mantém as cinco pontuações sem números nos textos exibidos", () => {
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [0, 1, 2, 3, 4]
  );
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /\d/);
  });
});

test("soma diretamente os itens não invertidos", () => {
  const scored = scoreResponses(data, {
    item_1: "nada",
    item_2: "muito_pouco",
    item_3: "moderadamente",
    item_4: "muito",
    item_20: "extremamente"
  });

  assert.deepEqual(
    [0, 1, 2, 3, 19].map((index) => scored.rows[index].itemScore),
    [0, 1, 2, 3, 4]
  );
  assert.equal(scored.totalScore, 10);
});

test("inverte exclusivamente os itens 5, 9 e 11", () => {
  const scored = scoreResponses(data, {
    item_5: "nada",
    item_9: "muito_pouco",
    item_11: "extremamente",
    item_20: "muito_pouco"
  });

  assert.equal(scored.rows[4].itemScore, 4);
  assert.equal(scored.rows[8].itemScore, 3);
  assert.equal(scored.rows[10].itemScore, 0);
  assert.equal(scored.rows[19].itemScore, 1);
  assert.equal(scored.totalScore, 8);
});

test("calcula pontuação mínima zero e máxima oitenta", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "extremamente" : "nada"
    ])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "nada" : "extremamente"
    ])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 80);
});

test("envia perguntas e respostas e somente o total em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "muito_pouco"])
  );
  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.totalScore, 26);
  assert.equal(results.length, 20);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
  });
  assert.equal(results[0].resposta, "Muito pouco característico de mim");
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 26
  });
});

test("impede a criação do payload enquanto houver pergunta sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "nada"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 19);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

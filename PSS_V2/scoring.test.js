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

test("mantém dez itens, cinco alternativas e os quatro itens invertidos", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 10);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [0, 1, 2, 3, 4]
  );
  assert.deepEqual(EXPECTED_REVERSED_ITEMS, [4, 5, 7, 8]);
  assert.deepEqual(
    data.questions
      .filter((question) => question.reverse)
      .map((question) => Number(question.id.replace("item_", ""))),
    EXPECTED_REVERSED_ITEMS
  );
});

test("não inclui os valores numéricos nos textos das alternativas", () => {
  assert.deepEqual(
    data.responses.map((option) => option.label),
    ["Nunca", "Quase nunca", "Às vezes", "Frequentemente", "Muito frequentemente"]
  );
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /\d/);
  });
});

test("aplica a sequência reversa completa aos itens 4, 5, 7 e 8", () => {
  const expectedScores = [4, 3, 2, 1, 0];

  data.responses.forEach((option, index) => {
    const scored = scoreResponses(data, {
      item_4: option.value
    });
    assert.equal(scored.rows[3].correctedScore, expectedScores[index]);
  });
});

test("não inverte os seis itens negativos", () => {
  const scored = scoreResponses(data, {
    item_1: "nunca",
    item_2: "quase_nunca",
    item_3: "as_vezes",
    item_6: "frequentemente",
    item_9: "muito_frequentemente"
  });

  assert.deepEqual(
    [0, 1, 2, 5, 8].map((index) => scored.rows[index].correctedScore),
    [0, 1, 2, 3, 4]
  );
});

test("calcula pontuação mínima zero e máxima quarenta", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "muito_frequentemente" : "nunca"
    ])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "nunca" : "muito_frequentemente"
    ])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 40);
});

test("envia somente pergunta e resposta em results e somente o total em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "as_vezes"])
  );
  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.totalScore, 20);
  assert.equal(results.length, 10);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Às vezes");
  });
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 20
  });
});

test("impede a criação do payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "nunca"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 9);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

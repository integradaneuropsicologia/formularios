const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  SUBSCALES,
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(value = "aplicou_pouco") {
  return Object.fromEntries(
    data.questions.map((question) => [question.id, value])
  );
}

test("mantém 21 itens, quatro alternativas e a pontuação de 0 a 3", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 21);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [0, 1, 2, 3]
  );
});

test("não exibe valores numéricos nas alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[0-3]\s*[-–—:]/);
  });
});

test("usa os agrupamentos corretos e cobre cada item uma única vez", () => {
  assert.deepEqual(SUBSCALES.depressao, [3, 5, 10, 13, 16, 17, 21]);
  assert.deepEqual(SUBSCALES.ansiedade, [2, 4, 7, 9, 15, 19, 20]);
  assert.deepEqual(SUBSCALES.estresse, [1, 6, 8, 11, 12, 14, 18]);

  const allItems = Object.values(SUBSCALES).flat().sort((a, b) => a - b);
  assert.deepEqual(allItems, Array.from({ length: 21 }, (_, index) => index + 1));
});

test("calcula mínimo zero e máximo 21 em cada escala", () => {
  const minimum = scoreResponses(data, completeResponses("nao_se_aplicou"));
  const maximum = scoreResponses(data, completeResponses("aplicou_muito"));

  assert.deepEqual(minimum.subscaleScores, {
    depressao: 0,
    ansiedade: 0,
    estresse: 0
  });
  assert.deepEqual(maximum.subscaleScores, {
    depressao: 21,
    ansiedade: 21,
    estresse: 21
  });
});

test("calcula separadamente os itens de cada escala", () => {
  const scored = scoreResponses(data, {
    item_3: "aplicou_pouco",
    item_5: "aplicou_consideravelmente",
    item_10: "aplicou_muito",
    item_2: "aplicou_muito",
    item_4: "aplicou_pouco",
    item_1: "aplicou_consideravelmente"
  });

  assert.deepEqual(scored.subscaleScores, {
    depressao: 6,
    ansiedade: 4,
    estresse: 2
  });
});

test("envia pergunta e resposta em results e três números em results_meta", () => {
  const scored = scoreResponses(data, completeResponses("aplicou_consideravelmente"));
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(results.length, 21);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(
      row.resposta,
      "Aplicou-se em um grau considerável, ou por uma boa parte do tempo"
    );
  });
  assert.deepEqual(resultsMeta, {
    escala_depressao: 14,
    escala_ansiedade: 14,
    escala_estresse: 14
  });
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "nao_se_aplicou" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 20);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

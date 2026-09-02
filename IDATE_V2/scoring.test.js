const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  EXPECTED_REVERSED_ITEMS,
  TRAIT_ABSENT_ITEMS,
  TRAIT_PRESENT_ITEMS,
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém vinte itens, quatro alternativas e os nove itens invertidos", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 20);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [1, 2, 3, 4]
  );
  assert.deepEqual(EXPECTED_REVERSED_ITEMS, [1, 3, 6, 7, 10, 13, 14, 16, 19]);
  assert.deepEqual(
    data.questions
      .filter((question) => question.reverse)
      .map((question) => Number(question.id.replace("item_", ""))),
    EXPECTED_REVERSED_ITEMS
  );
});

test("os dois domínios cobrem os vinte itens uma única vez", () => {
  const domainItems = [...TRAIT_PRESENT_ITEMS, ...TRAIT_ABSENT_ITEMS];

  assert.deepEqual(TRAIT_PRESENT_ITEMS, [2, 4, 5, 8, 9, 11, 12, 15, 17, 18, 20]);
  assert.deepEqual(TRAIT_ABSENT_ITEMS, [1, 3, 6, 7, 10, 13, 14, 16, 19]);
  assert.equal(domainItems.length, 20);
  assert.equal(new Set(domainItems).size, 20);
});

test("não inclui valores numéricos nos textos exibidos das alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[1-4]\s*[-–—:]/);
  });
});

test("inverte somente os itens positivos", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "quase_nunca"])
  );
  const scored = scoreResponses(data, responses);

  assert.equal(scored.rows[0].correctedScore, 4);
  assert.equal(scored.rows[1].correctedScore, 1);
  assert.equal(scored.rows[2].correctedScore, 4);
  assert.equal(scored.rows[5].correctedScore, 4);
  assert.equal(scored.rows[7].correctedScore, 1);
  assert.equal(scored.totalScore, 47);
  assert.equal(scored.traitPresentScore, 11);
  assert.equal(scored.traitAbsentScore, 36);
});

test("calcula a pontuação mínima de vinte e máxima de oitenta", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "quase_sempre" : "quase_nunca"
    ])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.reverse ? "quase_nunca" : "quase_sempre"
    ])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 20);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 80);
});

test("envia pergunta e resposta e os domínios e totais em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "as_vezes"])
  );
  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.totalScore, 49);
  assert.equal(results.length, 20);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Às vezes");
  });
  assert.deepEqual(resultsMeta, {
    pontuacao_bruta_total: 49,
    ansiedade_traco_presente: 22,
    ansiedade_traco_ausente_bem_estar_emocional: 27,
    score_total: 49
  });
  assert.equal(
    resultsMeta.ansiedade_traco_presente +
      resultsMeta.ansiedade_traco_ausente_bem_estar_emocional,
    resultsMeta.score_total
  );
});

test("impede a criação do payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "quase_nunca"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 19);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

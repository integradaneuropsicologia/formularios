const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  COMPOSITE_SCALES,
  ITEM_GROUPS,
  REVERSED_ITEMS,
  buildResultsMetaPayload,
  buildResultsPayload,
  correctedItemScore,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(value = "principalmente_verdadeiro") {
  return Object.fromEntries(
    data.questions.map((question) => [question.id, value])
  );
}

test("mantém 344 itens em sequência e quatro alternativas", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 344);
  assert.equal(data.questions[0].number, 1);
  assert.equal(data.questions.at(-1).number, 344);
  assert.equal(new Set(data.questions.map((question) => question.id)).size, 344);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [0, 1, 2, 3]
  );
});

test("não exibe pontuações numéricas nas alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[0-3]\s*[-–—:]/);
  });
});

test("mantém todos os itens em português claro", () => {
  const combined = data.questions.map((question) => question.text).join(" ");
  assert.doesNotMatch(combined, /\b(?:soy|muy|he tenido|algunas|demás|arriesgado|cierto)\b/i);
  assert.match(data.questions[139].text, /suicídio/i);
  assert.match(data.questions[339].text, /suicidar/i);
});

test("associa os 344 itens uma única vez aos 42 grupos de pontuação", () => {
  const assignedItems = Object.values(ITEM_GROUPS).flat();

  assert.equal(Object.keys(ITEM_GROUPS).length, 42);
  assert.equal(assignedItems.length, 344);
  assert.equal(new Set(assignedItems).size, 344);
  assert.deepEqual(
    [...assignedItems].sort((a, b) => a - b),
    Array.from({ length: 344 }, (_, index) => index + 1)
  );
  assert.equal(Object.keys(COMPOSITE_SCALES).length, 10);
});

test("inverte somente os itens configurados", () => {
  assert.equal(REVERSED_ITEMS.length, 98);
  assert.equal(new Set(REVERSED_ITEMS).size, 98);
  assert.equal(correctedItemScore(1, 0), 3);
  assert.equal(correctedItemScore(1, 3), 0);
  assert.equal(correctedItemScore(3, 0), 0);
  assert.equal(correctedItemScore(3, 3), 3);
  assert.equal(REVERSED_ITEMS.includes(343), true);
  assert.equal(REVERSED_ITEMS.includes(344), false);
});

test("divide o preenchimento em 18 blocos de até 20 itens", () => {
  assert.equal(data.itemsPerPage, 20);
  assert.equal(Math.ceil(data.questions.length / data.itemsPerPage), 18);
});

test("envia perguntas e respostas textuais e 52 pontuações em results_meta", () => {
  const scored = scoreResponses(data, completeResponses());
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.complete, true);
  assert.equal(results.length, 344);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Principalmente verdadeiro");
  });
  assert.equal(Object.keys(resultsMeta).length, 52);

  const reversedItems = new Set(REVERSED_ITEMS);

  Object.entries(ITEM_GROUPS).forEach(([group, items]) => {
    const expected = items.reduce(
      (total, item) => total + (reversedItems.has(item) ? 1 : 2),
      0
    );
    assert.equal(resultsMeta[group], expected, group);
  });

  Object.entries(COMPOSITE_SCALES).forEach(([scale, groups]) => {
    const expected = groups.reduce((total, group) => total + resultsMeta[group], 0);
    assert.equal(resultsMeta[scale], expected, scale);
  });

  assert.equal(resultsMeta.queixas_somaticas_total, 43);
  assert.equal(resultsMeta.caracteristicas_borderline_total, 43);
  assert.equal(resultsMeta.agressividade_total, 29);
  assert.equal(Object.hasOwn(resultsMeta, "validade_inconsistencia"), false);
});

test("calcula as somas pelos números dos itens e pelos pontos de 0 a 3", () => {
  const reversedItems = new Set(REVERSED_ITEMS);
  const responses = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      reversedItems.has(question.number) ? "muito_verdadeiro" : "totalmente_falso"
    ])
  );

  ITEM_GROUPS.ansiedade_cognitiva.forEach((item) => {
    responses[`item_${item}`] = reversedItems.has(item)
      ? "totalmente_falso"
      : "muito_verdadeiro";
  });

  const resultsMeta = buildResultsMetaPayload(scoreResponses(data, responses));

  assert.equal(resultsMeta.ansiedade_cognitiva, 24);
  assert.equal(resultsMeta.ansiedade_afetiva, 0);
  assert.equal(resultsMeta.ansiedade_total, 24);
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "totalmente_falso" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 343);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

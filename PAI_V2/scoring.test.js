const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
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

test("divide o preenchimento em 18 blocos de até 20 itens", () => {
  assert.equal(data.itemsPerPage, 20);
  assert.equal(Math.ceil(data.questions.length / data.itemsPerPage), 18);
});

test("envia perguntas e respostas textuais em results e results_meta vazio", () => {
  const scored = scoreResponses(data, completeResponses());
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.complete, true);
  assert.equal(results.length, 344);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Principalmente verdadeiro");
  });
  assert.deepEqual(resultsMeta, {});
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "totalmente_falso" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 343);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

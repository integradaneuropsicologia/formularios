const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(value = "moderadamente") {
  return Object.fromEntries(
    data.questions.map((question) => [question.id, value])
  );
}

test("mantém 210 itens em sequência e quatro alternativas", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 210);
  assert.equal(data.questions[0].number, 1);
  assert.equal(data.questions.at(-1).number, 210);
  assert.equal(new Set(data.questions.map((question) => question.id)).size, 210);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [1, 2, 3, 4]
  );
});

test("não exibe pontuações numéricas nas alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[1-4]\s*[-–—:]/);
  });
});

test("remove todos os códigos técnicos das perguntas", () => {
  data.questions.forEach((question) => {
    assert.doesNotMatch(question.text, /^(?:A|B|i)\d{3}\b/);
  });
  assert.match(data.questions[0].text, /tomem decisões importantes/i);
  assert.equal(data.questions.at(-1).text, "Minto sem remorso.");
});

test("divide o preenchimento em 11 blocos de até 20 itens", () => {
  assert.equal(data.itemsPerPage, 20);
  assert.equal(Math.ceil(data.questions.length / data.itemsPerPage), 11);
});

test("envia perguntas e respostas textuais em results e results_meta vazio", () => {
  const scored = scoreResponses(data, completeResponses());
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(scored.complete, true);
  assert.equal(results.length, 210);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Moderadamente");
  });
  assert.deepEqual(resultsMeta, {});
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "nada" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 209);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

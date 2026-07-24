const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  classifySeverity,
  scoreResponses,
  validateData
} = require("./scoring.js");

test("mantém exatamente dez itens com cinco alternativas de zero a quatro", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 10);

  data.questions.forEach((question) => {
    assert.equal(question.options.length, 5);
    assert.deepEqual(
      question.options.map((option) => option.score),
      [0, 1, 2, 3, 4]
    );
  });
});

test("mantém cinco itens de obsessões e cinco de compulsões", () => {
  assert.deepEqual(
    data.questions.slice(0, 5).map((question) => question.section),
    Array(5).fill("obsessoes")
  );
  assert.deepEqual(
    data.questions.slice(5).map((question) => question.section),
    Array(5).fill("compulsoes")
  );
});

test("não inclui valores numéricos nos textos exibidos das alternativas", () => {
  data.questions.forEach((question) => {
    question.options.forEach((option) => {
      assert.doesNotMatch(option.label, /^\s*\d/);
      assert.doesNotMatch(option.label, /\b[0-4]\s*[-–—:]/);
    });
  });
});

test("calcula pontuação bruta mínima zero e máxima quarenta", () => {
  const minimumResponses = Object.fromEntries(
    data.questions.map((question) => [question.id, "score_0"])
  );
  const maximumResponses = Object.fromEntries(
    data.questions.map((question) => [question.id, "score_4"])
  );

  assert.equal(scoreResponses(data, minimumResponses).totalScore, 0);
  assert.equal(scoreResponses(data, maximumResponses).totalScore, 40);
});

test("classifica todas as faixas de severidade nos limites corretos", () => {
  assert.equal(classifySeverity(0), "Subclínica");
  assert.equal(classifySeverity(7), "Subclínica");
  assert.equal(classifySeverity(8), "Leve");
  assert.equal(classifySeverity(15), "Leve");
  assert.equal(classifySeverity(16), "Moderada");
  assert.equal(classifySeverity(23), "Moderada");
  assert.equal(classifySeverity(24), "Grave");
  assert.equal(classifySeverity(31), "Grave");
  assert.equal(classifySeverity(32), "Extrema");
  assert.equal(classifySeverity(40), "Extrema");
  assert.throws(() => classifySeverity(-1), /entre 0 e 40/);
  assert.throws(() => classifySeverity(41), /entre 0 e 40/);
});

test("envia somente pergunta e resposta em results e total e severidade em results_meta", () => {
  const values = [
    "score_0",
    "score_1",
    "score_2",
    "score_3",
    "score_4",
    "score_0",
    "score_1",
    "score_2",
    "score_3",
    "score_4"
  ];
  const responses = Object.fromEntries(
    data.questions.map((question, index) => [question.id, values[index]])
  );

  const scored = scoreResponses(data, responses);
  assert.equal(scored.complete, true);
  assert.equal(scored.totalScore, 20);
  assert.equal(scored.severity, "Moderada");

  const results = buildResultsPayload(scored);
  assert.equal(results.length, 10);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(typeof row.pergunta, "string");
    assert.equal(typeof row.resposta, "string");
  });

  assert.deepEqual(buildResultsMetaPayload(scored), {
    pontuacao_bruta_total: 20,
    severidade: "Moderada"
  });
});

test("impede a criação do payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, {
    item_1: "score_2"
  });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 9);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

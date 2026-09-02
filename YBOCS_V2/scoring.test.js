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

test("envia pergunta e resposta em results e os subtotais, total e severidade em results_meta", () => {
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
  assert.equal(scored.obsessionsScore, 10);
  assert.equal(scored.compulsionsScore, 10);
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
    obsessoes: 10,
    compulsoes: 10,
    total_y_bocs: 20,
    pontuacao_bruta_total: 20,
    severidade: "Moderada"
  });
});

test("separa corretamente os itens 1 a 5 dos itens 6 a 10", () => {
  const responses = Object.fromEntries(
    data.questions.map((question, index) => [
      question.id,
      index < 5 ? "score_1" : "score_3"
    ])
  );

  const scored = scoreResponses(data, responses);
  assert.equal(scored.obsessionsScore, 5);
  assert.equal(scored.compulsionsScore, 15);
  assert.equal(scored.totalScore, 20);
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

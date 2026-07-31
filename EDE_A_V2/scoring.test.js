const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  FACTORS,
  INVERTED_ITEMS,
  buildResultsMetaPayload,
  buildResultsPayload,
  correctedItemScore,
  scoreResponses,
  validateData
} = require("./scoring.js");

function responseValueForScore(score) {
  return data.responses.find((option) => option.score === score).value;
}

function responsesForCorrectedScore(score) {
  return Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      responseValueForScore(INVERTED_ITEMS.includes(question.number) ? 4 - score : score)
    ])
  );
}

test("mantém 15 itens, cinco alternativas e a pontuação de 0 a 4", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 15);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [0, 1, 2, 3, 4]
  );
});

test("preserva o texto dos 15 itens do instrumento", () => {
  assert.deepEqual(data.questions.map((question) => question.text), [
    "Tento pensar em coisas boas.",
    "Maltrato outras pessoas.",
    "Acho que sou uma pessoa ruim.",
    "Fico com medo disso não passar.",
    "Tento me animar.",
    "Grito/berro.",
    "Acho que eu não tenho valor.",
    "Não consigo entender por que estou assim.",
    "Penso que isso vai passar.",
    "Acho que sou pior do que os outros.",
    "Não consigo pensar direito.",
    "Procuro relaxar.",
    "Culpo os outros por coisas que eles não têm culpa.",
    "Acho que sou incompetente.",
    "Não sei o que fazer."
  ]);
});

test("não exibe valores numéricos nas alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[0-4]\s*[-–—:]/);
  });
});

test("inverte somente os itens 1, 5, 9 e 12", () => {
  assert.deepEqual(INVERTED_ITEMS, [1, 5, 9, 12]);
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((score) => correctedItemScore(1, score)),
    [4, 3, 2, 1, 0]
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((score) => correctedItemScore(2, score)),
    [0, 1, 2, 3, 4]
  );
});

test("usa os quatro agrupamentos corretos e cobre cada item uma vez", () => {
  assert.deepEqual(FACTORS.estrategias_adequadas_de_enfrentamento, [1, 5, 9, 12]);
  assert.deepEqual(FACTORS.externalizacao_da_agressividade, [2, 6, 13]);
  assert.deepEqual(FACTORS.pessimismo, [3, 7, 10, 14]);
  assert.deepEqual(FACTORS.paralisacao, [4, 8, 11, 15]);

  const allItems = Object.values(FACTORS).flat().sort((a, b) => a - b);
  assert.deepEqual(allItems, Array.from({ length: 15 }, (_, index) => index + 1));
});

test("calcula os mínimos e máximos possíveis de cada fator", () => {
  const minimum = scoreResponses(data, responsesForCorrectedScore(0));
  const maximum = scoreResponses(data, responsesForCorrectedScore(4));

  assert.deepEqual(minimum.factorScores, {
    estrategias_adequadas_de_enfrentamento: 0,
    externalizacao_da_agressividade: 0,
    pessimismo: 0,
    paralisacao: 0
  });
  assert.deepEqual(maximum.factorScores, {
    estrategias_adequadas_de_enfrentamento: 16,
    externalizacao_da_agressividade: 12,
    pessimismo: 16,
    paralisacao: 16
  });
});

test("envia pergunta e resposta em results e quatro números em results_meta", () => {
  const scored = scoreResponses(data, responsesForCorrectedScore(2));
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(results.length, 15);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Mais ou menos");
  });
  assert.deepEqual(resultsMeta, {
    fator_1_estrategias_adequadas_de_enfrentamento: 8,
    fator_2_externalizacao_da_agressividade: 6,
    fator_3_pessimismo: 8,
    fator_4_paralisacao: 8
  });
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "nenhuma_das_vezes" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 14);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

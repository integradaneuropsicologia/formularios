const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const dataB = require("../ESAVI_B_V2/data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  classifyFactor,
  scoreResponses,
  validateData
} = require("./scoring.js");

function responsesForExtreme(maximum) {
  const reverseItems = new Set([2, 14]);
  return Object.fromEntries(data.questions.map((question) => [
    question.id,
    reverseItems.has(question.number)
      ? (maximum ? "nunca" : "sempre")
      : (maximum ? "sempre" : "nunca")
  ]));
}

test("mantém 31 itens, cinco alternativas e quatro fatores na Forma A", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.questions.length, 31);
  assert.deepEqual(
    data.responses.map((option) => option.score),
    [1, 2, 3, 4, 5]
  );
  assert.deepEqual(
    data.factors.map((factor) => factor.itemNumbers.length),
    [12, 8, 5, 6]
  );
  assert.deepEqual(data.factors[2].reverseItemNumbers, [2, 14]);
});

test("as formas A e B contêm os mesmos textos em ordens diferentes", () => {
  const textsA = data.questions.map((question) => question.text);
  const textsB = dataB.questions.map((question) => question.text);

  assert.deepEqual([...textsA].sort(), [...textsB].sort());
  assert.notDeepEqual(textsA, textsB);
});

test("não exibe pontuações numéricas nas alternativas", () => {
  data.responses.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*\d/);
    assert.doesNotMatch(option.label, /\b[1-5]\s*[-–—:]/);
  });
});

test("calcula corretamente os mínimos e máximos dos quatro fatores", () => {
  const minimum = scoreResponses(data, responsesForExtreme(false));
  const maximum = scoreResponses(data, responsesForExtreme(true));

  assert.deepEqual(minimum.factors.map((factor) => factor.rawScore), [12, 8, 5, 6]);
  assert.deepEqual(maximum.factors.map((factor) => factor.rawScore), [60, 40, 25, 30]);
  assert.ok(minimum.factors.every((factor) => factor.classification === "Extremo inferior"));
  assert.ok(maximum.factors.every((factor) => factor.classification === "Extremo superior"));
});

test("aplica exatamente os limites da Tabela 18", () => {
  const limits = {
    F1: [[14, "Extremo inferior"], [15, "Baixo"], [21, "Médio"], [31, "Alto"], [38, "Extremo superior"]],
    F2: [[22, "Extremo inferior"], [23, "Baixo"], [29, "Médio"], [37, "Alto"], [40, "Extremo superior"]],
    F3: [[9, "Extremo inferior"], [10, "Baixo"], [14, "Médio"], [20, "Alto"], [23, "Extremo superior"]],
    F4: [[10, "Extremo inferior"], [11, "Baixo"], [14, "Médio"], [20, "Alto"], [23, "Extremo superior"]]
  };

  Object.entries(limits).forEach(([factor, cases]) => {
    cases.forEach(([score, expected]) => {
      assert.equal(classifyFactor(factor, score).classification, expected);
    });
  });
});

test("envia perguntas e respostas em results e os quatro fatores em results_meta", () => {
  const responses = Object.fromEntries(
    data.questions.map((question) => [question.id, "as_vezes"])
  );
  const scored = scoreResponses(data, responses);
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(results.length, 31);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(row.resposta, "Às vezes");
  });

  assert.equal(Object.keys(resultsMeta).length, 4);
  Object.values(resultsMeta).forEach((factor) => {
    assert.deepEqual(Object.keys(factor).sort(), [
      "classificacao",
      "fator",
      "interpretacao",
      "percentil",
      "pontos_brutos",
      "score_total"
    ]);
    assert.equal(factor.score_total, factor.pontos_brutos);
    assert.ok(factor.percentil);
    assert.ok(factor.classificacao);
    assert.ok(factor.interpretacao);
  });
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "nunca" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 30);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

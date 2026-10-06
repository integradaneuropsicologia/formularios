const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const dataA = require("../ESAVI_A_V2/data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  classifyFactor,
  scoreResponses,
  validateData
} = require("./scoring.js");

function responsesForExtreme(maximum) {
  const reverseItems = new Set([19, 31]);
  return Object.fromEntries(data.questions.map((question) => [
    question.id,
    reverseItems.has(question.number)
      ? (maximum ? "nunca" : "sempre")
      : (maximum ? "sempre" : "nunca")
  ]));
}

test("mantém 31 itens, cinco alternativas e quatro fatores na Forma B", () => {
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
  assert.deepEqual(data.factors[2].reverseItemNumbers, [19, 31]);
});

test("as formas A e B contêm os mesmos textos em ordens diferentes", () => {
  const textsA = dataA.questions.map((question) => question.text);
  const textsB = data.questions.map((question) => question.text);

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

test("envia perguntas e respostas em results e só o score total dos quatro fatores em results_meta", () => {
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

  assert.deepEqual(resultsMeta.map(({ order, key, label }) => ({ order, key, label })), [
    { order: 1, key: "fator_1_falta_de_concentracao_e_persistencia_score_total", label: "Fator 1 falta de concentração e persistência > Score total" },
    { order: 2, key: "fator_2_controle_cognitivo_score_total", label: "Fator 2 controle cognitivo > Score total" },
    { order: 3, key: "fator_3_planejamento_futuro_score_total", label: "Fator 3 planejamento futuro > Score total" },
    { order: 4, key: "fator_4_audacia_e_temeridade_score_total", label: "Fator 4 audácia e temeridade > Score total" }
  ]);
  resultsMeta.forEach((item, index) => {
    assert.deepEqual(Object.keys(item), ["order", "key", "label", "value"]);
    assert.equal(item.value, scored.factors[index].scoreTotal);
  });
});

test("impede o payload enquanto houver item sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "nunca" });

  assert.equal(scored.complete, false);
  assert.equal(scored.unansweredCount, 30);
  assert.throws(() => buildResultsPayload(scored), /Todos os itens/);
  assert.throws(() => buildResultsMetaPayload(scored), /Todos os itens/);
});

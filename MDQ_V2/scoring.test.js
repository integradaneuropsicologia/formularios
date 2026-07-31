const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  getRequiredIds,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(symptomValue = "nao") {
  const responses = {
    [data.impact.id]: data.impact.options[0].value
  };

  data.symptoms.forEach((item) => {
    responses[item.id] = symptomValue;
  });

  if (symptomValue === "sim") {
    responses[data.samePeriod.id] = "sim";
  }

  return responses;
}

test("mantém os 13 itens pontuados e as alternativas Sim e Não", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.symptoms.length, 13);
  assert.deepEqual(data.symptomOptions, [
    { value: "sim", label: "Sim", score: 1 },
    { value: "nao", label: "Não", score: 0 }
  ]);
});

test("preserva a sequência e os temas centrais dos itens", () => {
  assert.match(data.symptoms[0].text, /tão bem ou tão para cima/i);
  assert.match(data.symptoms[3].text, /menos sono/i);
  assert.match(data.symptoms[12].text, /gastava dinheiro sem controle/i);

  data.symptoms.forEach((item, index) => {
    assert.equal(item.number, index + 1);
    assert.equal(item.id, `item_${index + 1}`);
  });
});

test("não exibe valores numéricos nas alternativas", () => {
  [
    data.symptomOptions,
    data.samePeriod.options,
    data.impact.options
  ].flat().forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*[0-9]+\s*[-–—:]/);
  });
});

test("calcula a pontuação total de zero a 13", () => {
  const minimum = scoreResponses(data, completeResponses("nao"));
  const maximum = scoreResponses(data, completeResponses("sim"));

  assert.equal(minimum.totalBruto, 0);
  assert.equal(maximum.totalBruto, 13);
  assert.equal(minimum.complete, true);
  assert.equal(maximum.complete, true);
});

test("soma somente os itens respondidos com Sim", () => {
  const responses = completeResponses("nao");
  [1, 4, 7, 10, 13].forEach((number) => {
    responses[`item_${number}`] = "sim";
  });
  responses[data.samePeriod.id] = "nao";

  assert.equal(scoreResponses(data, responses).totalBruto, 5);
});

test("exige a pergunta sobre o mesmo período somente após dois ou mais Sim", () => {
  const none = completeResponses("nao");
  const one = completeResponses("nao");
  one.item_1 = "sim";
  const two = completeResponses("nao");
  two.item_1 = "sim";
  two.item_2 = "sim";

  assert.equal(getRequiredIds(data, none).length, 14);
  assert.equal(scoreResponses(data, none).rows[13].resposta, "Não se aplica");
  assert.equal(getRequiredIds(data, one).length, 14);
  assert.equal(scoreResponses(data, one).complete, true);
  assert.equal(getRequiredIds(data, two).length, 15);
  assert.deepEqual(scoreResponses(data, two).missingIds, [data.samePeriod.id]);

  two[data.samePeriod.id] = "sim";
  assert.equal(scoreResponses(data, two).complete, true);
});

test("as perguntas complementares não alteram a pontuação total", () => {
  const first = completeResponses("sim");
  const second = completeResponses("sim");
  second[data.samePeriod.id] = "nao";
  second[data.impact.id] = data.impact.options[3].value;

  assert.equal(scoreResponses(data, first).totalBruto, 13);
  assert.equal(scoreResponses(data, second).totalBruto, 13);
});

test("envia perguntas e respostas em results e somente o total em results_meta", () => {
  const scored = scoreResponses(data, completeResponses("sim"));
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(results.length, 15);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(typeof row.pergunta, "string");
    assert.equal(typeof row.resposta, "string");
  });
  assert.deepEqual(resultsMeta, { mdq_total: 13 });
});

test("impede o payload enquanto houver pergunta obrigatória sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "sim" });
  assert.equal(scored.complete, false);
  assert.throws(() => buildResultsPayload(scored), /obrigatórias/);
  assert.throws(() => buildResultsMetaPayload(scored), /obrigatórias/);
});

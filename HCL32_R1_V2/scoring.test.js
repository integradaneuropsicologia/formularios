const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  getFixedRequiredIds,
  normalizeDays,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(symptomValue = "nao", recentValue = "nao") {
  const responses = {
    [data.currentState.id]: data.currentState.options[0].value,
    [data.usualPattern.id]: data.usualPattern.options[0].value,
    [data.reactions.id]: data.reactions.options[0].value,
    [data.duration.id]: data.duration.options[0].value,
    [data.recentHighs.id]: recentValue
  };

  data.symptoms.forEach((item) => {
    responses[item.id] = symptomValue;
  });
  data.impactDomains.forEach((domain) => {
    responses[domain.id] = data.impactOptions[0].value;
  });

  if (recentValue === "sim") {
    responses[data.daysInHighs.id] = "12";
  }

  return responses;
}

test("mantém os 32 itens pontuados e as alternativas Sim e Não", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.symptoms.length, 32);
  assert.deepEqual(data.symptomOptions, [
    { value: "sim", label: "Sim", score: 1 },
    { value: "nao", label: "Não", score: 0 }
  ]);
});

test("preserva os textos e a sequência dos itens", () => {
  assert.equal(data.symptoms[0].text, "Eu precisava de menos sono.");
  assert.equal(data.symptoms[15].text, "Eu estava mais interessado em sexo e/ou tinha desejo sexual aumentado.");
  assert.equal(data.symptoms[31].text, "Eu usava mais drogas (sedativos, ansiolíticos, estimulantes, entre outros).");
  data.symptoms.forEach((item, index) => {
    assert.equal(item.number, index + 1);
    assert.equal(item.id, `item_${index + 1}`);
  });
});

test("não exibe valores numéricos nas alternativas", () => {
  const optionGroups = [
    data.currentState.options,
    data.usualPattern.options,
    data.symptomOptions,
    data.impactOptions,
    data.reactions.options,
    data.recentHighs.options
  ];

  optionGroups.flat().forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*[0-9]+\s*[-–—:]/);
  });

  assert.deepEqual(
    data.duration.options.map((option) => option.label),
    ["1 dia", "2 - 3 dias", "4 - 7 dias", "Mais de 1 semana", "Mais de 1 mês", "Não posso julgar/não sei"]
  );
});

test("calcula total bruto de zero a 32", () => {
  const minimum = scoreResponses(data, completeResponses("nao"));
  const maximum = scoreResponses(data, completeResponses("sim"));

  assert.equal(minimum.totalBruto, 0);
  assert.equal(maximum.totalBruto, 32);
  assert.equal(minimum.complete, true);
  assert.equal(maximum.complete, true);
});

test("soma somente os itens respondidos com Sim", () => {
  const responses = completeResponses("nao");
  [1, 4, 9, 18, 32].forEach((number) => {
    responses[`item_${number}`] = "sim";
  });

  const scored = scoreResponses(data, responses);
  assert.equal(scored.totalBruto, 5);
});

test("respostas complementares não alteram a pontuação bruta", () => {
  const first = completeResponses("sim");
  const second = completeResponses("sim");
  second[data.currentState.id] = data.currentState.options[6].value;
  second[data.usualPattern.id] = data.usualPattern.options[3].value;
  second[data.reactions.id] = data.reactions.options[4].value;
  second[data.duration.id] = data.duration.options[5].value;

  assert.equal(scoreResponses(data, first).totalBruto, 32);
  assert.equal(scoreResponses(data, second).totalBruto, 32);
});

test("exige o número de dias somente quando houve altos no último ano", () => {
  const noHighs = scoreResponses(data, completeResponses("nao", "nao"));
  const yesWithoutDays = completeResponses("nao", "sim");
  delete yesWithoutDays[data.daysInHighs.id];
  const missingDays = scoreResponses(data, yesWithoutDays);
  const withDays = scoreResponses(data, completeResponses("nao", "sim"));

  assert.equal(getFixedRequiredIds(data).length, 41);
  assert.equal(noHighs.requiredCount, 41);
  assert.equal(noHighs.rows.at(-1).resposta, "Não se aplica");
  assert.equal(missingDays.requiredCount, 42);
  assert.deepEqual(missingDays.missingIds, [data.daysInHighs.id]);
  assert.equal(withDays.complete, true);
  assert.equal(withDays.rows.at(-1).resposta, "12");
});

test("aceita apenas dias inteiros entre 1 e 365", () => {
  assert.equal(normalizeDays("1"), 1);
  assert.equal(normalizeDays("365"), 365);
  assert.equal(normalizeDays("0"), null);
  assert.equal(normalizeDays("366"), null);
  assert.equal(normalizeDays("2.5"), null);
  assert.equal(normalizeDays(""), null);
});

test("envia perguntas e respostas em results e somente o total em results_meta", () => {
  const scored = scoreResponses(data, completeResponses("sim", "sim"));
  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);

  assert.equal(results.length, 42);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(typeof row.pergunta, "string");
    assert.equal(typeof row.resposta, "string");
  });
  assert.deepEqual(resultsMeta, { hcl32_total_bruto: 32 });
});

test("impede o payload enquanto houver pergunta obrigatória sem resposta", () => {
  const scored = scoreResponses(data, { item_1: "sim" });
  assert.equal(scored.complete, false);
  assert.throws(() => buildResultsPayload(scored), /obrigatórias/);
  assert.throws(() => buildResultsMetaPayload(scored), /obrigatórias/);
});

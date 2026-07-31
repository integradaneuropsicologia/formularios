const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  getAllItems,
  getRequiredIds,
  scoreResponses,
  validateData
} = require("./scoring.js");

function completeResponses(value = "nao") {
  return Object.fromEntries(getAllItems(data).map((item) => [item.id, value]));
}

test("mantém os três quadros e os 53 sintomas do ISSL", () => {
  assert.doesNotThrow(() => validateData(data));
  assert.deepEqual(data.sections.map((section) => section.items.length), [15, 15, 23]);
  assert.equal(getAllItems(data).length, 53);
  assert.equal(getRequiredIds(data).length, 53);
});

test("preserva os textos e os períodos de aplicação", () => {
  assert.equal(data.sections[0].items[0].text, "Mãos e pés frios");
  assert.equal(data.sections[0].items[14].text, "Vontade súbita de iniciar novos projetos");
  assert.equal(data.sections[1].items[9].text, "Tontura ou sensação de estar flutuando");
  assert.equal(data.sections[2].items[22].text, "Perda do senso de humor");
  assert.deepEqual(
    data.sections.map((section) => section.title),
    ["Últimas 24 horas", "Última semana", "Último mês"]
  );
});

test("usa Sim e Não sem exibir os valores numéricos", () => {
  assert.deepEqual(data.responseOptions, [
    { value: "sim", label: "Sim", score: 1 },
    { value: "nao", label: "Não", score: 0 }
  ]);
  data.responseOptions.forEach((option) => {
    assert.doesNotMatch(option.label, /^\s*[0-9]+\s*[-–—:]/);
  });

  const html = fs.readFileSync(new URL("./index.html", `file://${__dirname}/`), "utf8");
  assert.doesNotMatch(html, /scale-guide|Sim\s*=\s*1|Não\s*=\s*0/i);
});

test("calcula os limites brutos de zero a 53", () => {
  const minimum = scoreResponses(data, completeResponses("nao"));
  const maximum = scoreResponses(data, completeResponses("sim"));

  assert.equal(minimum.totalBruto, 0);
  assert.equal(maximum.totalBruto, 53);
  assert.deepEqual(maximum.sectionScores, [
    { id: "quadro_1", fisicosBruto: 12, psicologicosBruto: 3, totalBruto: 15 },
    { id: "quadro_2", fisicosBruto: 10, psicologicosBruto: 5, totalBruto: 15 },
    { id: "quadro_3", fisicosBruto: 12, psicologicosBruto: 11, totalBruto: 23 }
  ]);
});

test("separa corretamente sintomas físicos e psicológicos por quadro", () => {
  const responses = completeResponses("nao");
  [
    "quadro_1_item_1",
    "quadro_1_item_13",
    "quadro_2_item_10",
    "quadro_2_item_15",
    "quadro_3_item_12",
    "quadro_3_item_23"
  ].forEach((id) => {
    responses[id] = "sim";
  });

  const scored = scoreResponses(data, responses);
  assert.equal(scored.totalBruto, 6);
  scored.sectionScores.forEach((section) => {
    assert.equal(section.fisicosBruto, 1);
    assert.equal(section.psicologicosBruto, 1);
    assert.equal(section.totalBruto, 2);
  });
});

test("envia as 53 perguntas e respostas em results", () => {
  const scored = scoreResponses(data, completeResponses("sim"));
  const results = buildResultsPayload(scored);

  assert.equal(results.length, 53);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(typeof row.pergunta, "string");
    assert.equal(row.resposta, "Sim");
  });
  assert.equal(results[0].pergunta, "Nas últimas 24 horas: Mãos e pés frios");
  assert.equal(results[52].pergunta, "No último mês: Perda do senso de humor");
});

test("envia somente os escores brutos em results_meta", () => {
  const scored = scoreResponses(data, completeResponses("sim"));
  assert.deepEqual(buildResultsMetaPayload(scored), {
    issl_total_bruto: 53,
    quadro_1_fisicos_bruto: 12,
    quadro_1_psicologicos_bruto: 3,
    quadro_1_total_bruto: 15,
    quadro_2_fisicos_bruto: 10,
    quadro_2_psicologicos_bruto: 5,
    quadro_2_total_bruto: 15,
    quadro_3_fisicos_bruto: 12,
    quadro_3_psicologicos_bruto: 11,
    quadro_3_total_bruto: 23
  });
});

test("impede o payload enquanto houver sintoma sem resposta", () => {
  const responses = completeResponses("nao");
  delete responses.quadro_2_item_4;
  const scored = scoreResponses(data, responses);

  assert.equal(scored.complete, false);
  assert.deepEqual(scored.missingIds, ["quadro_2_item_4"]);
  assert.throws(() => buildResultsPayload(scored), /obrigatórias/);
  assert.throws(() => buildResultsMetaPayload(scored), /obrigatórias/);
});

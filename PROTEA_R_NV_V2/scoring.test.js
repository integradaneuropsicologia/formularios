"use strict";

const assert = require("node:assert/strict");
const data = require("./data.js");
const scoring = require("./scoring.js");

function createCompleteResponses() {
  const responses = scoring.createInitialResponses(data);

  responses.sessions.forEach((session, index) => {
    session.date = `2026-07-${String(index + 1).padStart(2, "0")}`;
    session.time = `0${index + 8}:00`;
    session.evaluator = `Avaliador ${index + 1}`;
  });

  data.questions.forEach((question) => {
    responses.items[question.id].sessions.forEach((observation) => {
      observation.quality = "A";
      observation.frequency = scoring.requiresFrequency(question, "A") ? "2" : "";
    });
    responses.items[question.id].compiled.quality = "A";
    responses.items[question.id].compiled.frequency =
      scoring.requiresFrequency(question, "A") ? "2" : "";
    responses.items[question.id].examples = `Exemplo do item ${question.number}`;
  });

  responses.summary = "Síntese profissional.";
  return responses;
}

scoring.validateData(data);

{
  const responses = createCompleteResponses();
  const scored = scoring.scoreResponses(data, responses);

  assert.equal(scored.complete, true);
  assert.equal(scored.criticalTotalScore, 0);
  assert.equal(scored.criticalPartialScore, 0);
  assert.equal(scored.criticalItems.length, 5);
  assert.equal(scored.classification.key, "sem_risco");
  assert.ok(
    scored.criticalItems.every(
      (item) => item.criterion.key === "criterio_sem_risco"
    )
  );

  const results = scoring.buildResultsPayload(data, scored);
  assert.equal(results.length, 25);
  assert.deepEqual(Object.keys(results[0]), ["pergunta", "resposta"]);
  assert.match(results[3].resposta, /Codificação compilada: A -/);
  assert.match(results.at(-4).resposta, /Sem risco para TEA/);
  assert.match(results.at(-1).resposta, /percentil não calculado/i);

  const meta = scoring.buildResultsMetaPayload(scored);
  assert.equal(meta.pontuacao_qualidade_total, 0);
  assert.equal(meta.pontuacao_maxima, 15);
  assert.equal(meta.calculo_completo, true);
  assert.equal(meta.classificacao, "Sem risco para TEA");
  assert.equal(meta.percentil, null);
  assert.equal(meta.percentil_disponivel_no_manual, false);
  assert.equal(meta.conclusao, "Sem risco para TEA");
  assert.deepEqual(meta.escores_qualidade_itens_criticos, {
    IAC: 0,
    RAC: 0,
    IM: 0,
    BS: 0,
    MRC: 0
  });
  assert.equal(
    meta.subtotais_itens_criticos_por_area.comportamentos_sociocomunicativos.pontuacao,
    0
  );
}

{
  const responses = createCompleteResponses();
  const changes = [
    ["item_1", "B", "2"],
    ["item_2", "C", "3"],
    ["item_3", "D", ""],
    ["item_13", "B", "1"],
    ["item_16", "D", "3"]
  ];

  changes.forEach(([itemId, quality, frequency]) => {
    responses.items[itemId].compiled = { quality, frequency };
  });

  const scored = scoring.scoreResponses(data, responses);
  assert.equal(scored.complete, true);
  assert.equal(scored.criticalTotalScore, 10);
  assert.equal(scored.classification.key, "com_risco");
  assert.equal(
    scored.criticalAreaScores.comportamentos_sociocomunicativos.pontuacao,
    6
  );
  assert.equal(scored.criticalAreaScores.qualidade_da_brincadeira.pontuacao, 1);
  assert.equal(
    scored.criticalAreaScores.movimentos_repetitivos_e_estereotipados.pontuacao,
    3
  );
  assert.deepEqual(
    scored.criticalItems.map((item) => item.frequency),
    [2, 3, null, 1, 3]
  );
}

{
  const responses = createCompleteResponses();
  responses.items.item_1.compiled = { quality: "B", frequency: "2" };
  const scored = scoring.scoreResponses(data, responses);

  assert.equal(scored.criticalTotalScore, 1);
  assert.equal(scored.classification.key, "risco_relativo");
}

{
  const responses = createCompleteResponses();
  responses.items.item_1.compiled = { quality: "C", frequency: "1" };
  responses.items.item_2.compiled = { quality: "C", frequency: "3" };
  responses.items.item_3.compiled = { quality: "A", frequency: "2" };
  responses.items.item_13.compiled = { quality: "D", frequency: "" };
  responses.items.item_16.compiled = { quality: "A", frequency: "" };
  const criteria = Object.fromEntries(
    scoring.scoreResponses(data, responses).criticalItems.map(
      (item) => [item.code, item.criterion.key]
    )
  );

  assert.deepEqual(criteria, {
    IAC: "criterio_de_risco",
    RAC: "criterio_intermediario",
    IM: "criterio_sem_risco",
    BS: "criterio_de_risco",
    MRC: "criterio_sem_risco"
  });
}

{
  const responses = createCompleteResponses();
  responses.items.item_9.compiled = { quality: "D", frequency: "" };
  responses.items.item_10.compiled = { quality: "A", frequency: "1" };

  const scored = scoring.scoreResponses(data, responses);
  assert.equal(scored.complete, false);
  assert.ok(
    scored.issues.some(
      (issue) => issue.itemId === "item_10" && issue.scope === "compiled"
    )
  );

  responses.items.item_10.compiled = { quality: "E", frequency: "" };
  assert.equal(scoring.scoreResponses(data, responses).complete, true);
}

{
  const responses = createCompleteResponses();
  responses.items.item_1.compiled = { quality: "E", frequency: "" };
  const scored = scoring.scoreResponses(data, responses);

  assert.equal(scored.complete, true);
  assert.equal(scored.criticalScoreComplete, false);
  assert.equal(scored.criticalTotalScore, null);
  assert.equal(scored.classification.key, "nao_calculavel");

  const meta = scoring.buildResultsMetaPayload(scored);
  assert.equal(meta.classificacao, "Classificação não calculável");
  assert.equal(meta.calculo_completo, false);
}

{
  const responses = createCompleteResponses();
  responses.sessions[1].evaluator = "";
  const scored = scoring.scoreResponses(data, responses);

  assert.equal(scored.complete, false);
  assert.ok(scored.issues.some((issue) => issue.type === "session"));
}

console.log("PROTEA scoring tests: OK");

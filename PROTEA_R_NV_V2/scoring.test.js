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
      observation.frequency = scoring.requiresFrequency(question, "A") ? "1" : "";
    });
    responses.items[question.id].compiled.quality = "A";
    responses.items[question.id].compiled.frequency =
      scoring.requiresFrequency(question, "A") ? "1" : "";
    responses.items[question.id].examples = `Exemplo do item ${question.number}`;
  });

  responses.summary = "Síntese profissional.";
  responses.conclusion = "sem_risco";
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

  const results = scoring.buildResultsPayload(data, scored);
  assert.equal(results.length, 22);
  assert.deepEqual(Object.keys(results[0]), ["pergunta", "resposta"]);
  assert.match(results[3].resposta, /Codificação compilada: A -/);

  const meta = scoring.buildResultsMetaPayload(scored);
  assert.equal(meta.pontuacao_qualidade_total, 0);
  assert.equal(meta.calculo_completo, true);
  assert.equal(meta.conclusao, "Sem risco para TEA");
  assert.deepEqual(meta.escores_qualidade_itens_criticos, {
    IAC: 0,
    RAC: 0,
    IM: 0,
    BS: 0,
    MRC: 0
  });
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
  assert.deepEqual(
    scored.criticalItems.map((item) => item.frequency),
    [2, 3, null, 1, 3]
  );
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
}

{
  const responses = createCompleteResponses();
  responses.sessions[1].evaluator = "";
  const scored = scoring.scoreResponses(data, responses);

  assert.equal(scored.complete, false);
  assert.ok(scored.issues.some((issue) => issue.type === "session"));
}

console.log("PROTEA scoring tests: OK");

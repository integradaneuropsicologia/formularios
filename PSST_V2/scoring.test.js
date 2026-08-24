"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("./data.js");
const scoring = require("./scoring.js");

function createBaseResponses(temporal = "sim") {
  return Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      question.group === "temporal" ? temporal : "nada"
    ])
  );
}

test("mantém 14 sintomas, 4 sintomas centrais e 5 áreas de prejuízo", () => {
  assert.doesNotThrow(() => scoring.validateData(data));
  assert.equal(data.questions.filter((question) => question.group === "symptom").length, 14);
  assert.deepEqual(
    data.questions.filter((question) => question.core).map((question) => question.id),
    ["sintoma_1", "sintoma_2", "sintoma_3", "sintoma_4"]
  );
  assert.equal(data.questions.filter((question) => question.group === "impairment").length, 5);
});

test("não exibe valores numéricos nas alternativas", () => {
  const labels = data.responseSets.severity.map((option) => option.label);
  assert.deepEqual(labels, ["Nada", "Leve", "Moderado", "Grave"]);
  assert.equal(labels.some((label) => /^\d/.test(label)), false);
});

test("classifica TDPM provável somente com todos os três critérios", () => {
  const responses = createBaseResponses();
  responses.sintoma_1 = "grave";
  responses.sintoma_2 = "moderado";
  responses.sintoma_3 = "moderado";
  responses.sintoma_4 = "moderado";
  responses.sintoma_5 = "moderado";
  responses.prejuizo_a = "grave";

  const result = scoring.scoreResponses(data, responses);
  assert.equal(result.classification, scoring.CLASSIFICATIONS.PROBABLE_PMDD);
  assert.equal(result.symptomModerateSevereCount, 5);
  assert.equal(result.coreSevereCount, 1);
  assert.equal(result.impairmentSevereCount, 1);
  assert.equal(result.meetsProbablePmdd, true);
});

test("classifica SPM moderada a grave quando não há gravidade suficiente para TDPM", () => {
  const responses = createBaseResponses();
  [1, 2, 3, 4, 5].forEach((item) => {
    responses[`sintoma_${item}`] = "moderado";
  });
  responses.prejuizo_a = "moderado";

  const result = scoring.scoreResponses(data, responses);
  assert.equal(result.classification, scoring.CLASSIFICATIONS.MODERATE_SEVERE_PMS);
  assert.equal(result.meetsProbablePmdd, false);
  assert.equal(result.meetsModerateSeverePms, true);
});

test("exige pelo menos cinco sintomas moderados ou graves", () => {
  const responses = createBaseResponses();
  responses.sintoma_1 = "grave";
  responses.sintoma_2 = "moderado";
  responses.sintoma_3 = "moderado";
  responses.sintoma_4 = "moderado";
  responses.prejuizo_a = "grave";

  const result = scoring.scoreResponses(data, responses);
  assert.equal(result.symptomModerateSevereCount, 4);
  assert.equal(result.classification, scoring.CLASSIFICATIONS.NONE_OR_MILD_PMS);
});

test("não aplica triagem positiva quando o padrão temporal não é confirmado", () => {
  const responses = createBaseResponses("nao");
  [1, 2, 3, 4, 5].forEach((item) => {
    responses[`sintoma_${item}`] = "grave";
  });
  responses.prejuizo_a = "grave";

  const result = scoring.scoreResponses(data, responses);
  assert.equal(result.classification, scoring.CLASSIFICATIONS.TEMPORAL_NOT_CONFIRMED);
  assert.equal(result.meetsProbablePmdd, false);
});

test("gera perguntas e respostas em results e indicadores em results_meta", () => {
  const result = scoring.scoreResponses(data, createBaseResponses());
  const results = scoring.buildResultsPayload(result);
  const meta = scoring.buildResultsMetaPayload(result);

  assert.equal(results.length, 20);
  assert.deepEqual(Object.keys(results[0]), ["pergunta", "resposta"]);
  assert.equal(meta.classificacao_psst, scoring.CLASSIFICATIONS.NONE_OR_MILD_PMS);
  assert.equal(meta.sintomas_moderados_ou_graves, 0);
  assert.equal(Object.hasOwn(meta, "pontuacao_total"), false);
});

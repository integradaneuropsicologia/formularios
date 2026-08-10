const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const scoring = require("./scoring.js");

function completeRequiredResponses() {
  const responses = {};

  scoring.getAllFields(data).forEach((field) => {
    if (field.id === "parentesco") responses[field.id] = "mae";
    else if (field.id === "frequencia_convivencia") responses[field.id] = "diariamente";
    else if (field.id === "tempo_acompanhamento") responses[field.id] = "Desde o nascimento";
    else if (field.required && field.type === "single") {
      responses[field.id] = field.options[0].value;
    }
  });

  return responses;
}

test("contém os 54 itens numerados do anexo", () => {
  scoring.validateData(data);
  const numbered = scoring.getAllFields(data)
    .filter((field) => Number.isInteger(field.number))
    .map((field) => field.number)
    .sort((a, b) => a - b);

  assert.deepEqual(numbered, Array.from({ length: 54 }, (_, index) => index + 1));
});

test("não exibe valores numéricos nas alternativas", () => {
  const optionLabels = scoring.getAllFields(data)
    .flatMap((field) => field.options || [])
    .map((option) => option.label);

  optionLabels.forEach((label) => {
    assert.doesNotMatch(label, /^\s*[0-4]\s+[-–]\s+/);
  });
});

test("exige identificação e todos os itens objetivos de 1 a 48", () => {
  const evaluated = scoring.evaluateResponses(data, completeRequiredResponses());

  assert.equal(evaluated.complete, true);
  assert.equal(evaluated.requiredCount, 51);
  assert.equal(evaluated.answeredRequiredCount, 51);
});

test("envia somente pergunta e resposta em results e mantém results_meta vazio", () => {
  const responses = {
    ...completeRequiredResponses(),
    exemplos_aprendizagem: "Aprendeu as letras espontaneamente.",
    habilidades_especificas: ["memoria", "raciocinio_logico"],
    item_49: "A rapidez para aprender."
  };
  const evaluated = scoring.evaluateResponses(data, responses);
  const results = scoring.buildResultsPayload(evaluated);
  const resultsMeta = scoring.buildResultsMetaPayload(evaluated);

  assert.ok(results.length > 51);
  results.forEach((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["pergunta", "resposta"]);
    assert.equal(typeof row.pergunta, "string");
    assert.equal(typeof row.resposta, "string");
  });
  assert.deepEqual(resultsMeta, {});
  assert.equal(
    results.find((row) => row.pergunta === "Habilidades especialmente desenvolvidas percebidas")?.resposta,
    "Memória; Raciocínio lógico"
  );
});

test("exige detalhamento quando a opção Outro é selecionada", () => {
  const responses = completeRequiredResponses();
  responses.parentesco = "outro";

  const evaluated = scoring.evaluateResponses(data, responses);
  assert.equal(evaluated.complete, false);
  assert.deepEqual(evaluated.missingIds, ["parentesco_outro"]);
  assert.throws(
    () => scoring.buildResultsPayload(evaluated),
    /perguntas obrigatórias/
  );
});

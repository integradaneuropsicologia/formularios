"use strict";

const assert = require("node:assert/strict");
const scoring = require("./scoring.js");

assert.deepEqual(
  scoring.MINIMUM_MOVES,
  [3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 9]
);
assert.equal(scoring.MAX_SCORE, 57);

assert.equal(scoring.getNormForAge(10).label, "10–15 anos");
assert.equal(scoring.getNormForAge(15).label, "10–15 anos");
assert.equal(scoring.getNormForAge(16).label, "16–18 anos");
assert.equal(scoring.getNormForAge(29).label, "25–29 anos");
assert.equal(scoring.getNormForAge(59).label, "30–59 anos");
assert.equal(scoring.getNormForAge(9), null);
assert.equal(scoring.getNormForAge(60), null);
assert.equal(
  scoring.calculateAgeYears("2000-07-23", new Date(2026, 6, 23)),
  26
);
assert.equal(
  scoring.calculateAgeYears("2000-07-24", new Date(2026, 6, 23)),
  25
);
assert.equal(scoring.calculateAgeYears("2000-02-30", new Date(2026, 6, 23)), null);
assert.equal(
  scoring.isCorrectSolution({ goalReached: true, moves: 7, problemIndex: 18 }),
  false
);
assert.equal(
  scoring.isCorrectSolution({ goalReached: true, moves: 9, problemIndex: 18 }),
  true
);
assert.equal(
  scoring.isCorrectSolution({ goalReached: false, moves: 9, problemIndex: 18 }),
  false
);

const preserved = scoring.buildInterpretation({
  totalScore: 48.2,
  age: 20,
  itemResults: []
});
assert.equal(preserved.zScore, 0);
assert.equal(preserved.normativeClassification, "Dentro do esperado");
assert.equal(preserved.performanceStatus, "Desempenho preservado");

const reduced = scoring.buildInterpretation({
  totalScore: 35,
  age: 20,
  itemResults: []
});
assert.equal(reduced.zScore, -2.2);
assert.equal(reduced.normativeClassification, "Abaixo do esperado");
assert.equal(reduced.performanceStatus, "Desempenho reduzido");

const noNorm = scoring.buildInterpretation({
  totalScore: 40,
  age: 60,
  itemResults: []
});
assert.equal(noNorm.normativeClassification, "Sem classificação normativa");
assert.equal(noNorm.performanceStatus, "Não classificado");

const missingAge = scoring.buildInterpretation({
  totalScore: 40,
  age: null,
  itemResults: []
});
assert.equal(missingAge.ageYears, null);
assert.equal(missingAge.ageRange, null);

const attemptSummary = scoring.summarizeAttempts([
  {
    concluido: true,
    tentativas_usadas: 1,
    tentativas: [
      { resultado: "concluída", tempo_planejamento_segundos: 2 }
    ]
  },
  {
    concluido: true,
    tentativas_usadas: 2,
    tentativas: [
      {
        resultado: "limite de movimentos excedido",
        tempo_planejamento_segundos: 4,
        configuracao_final: [["red"], ["blue"], ["green"]]
      },
      { resultado: "concluída", tempo_planejamento_segundos: 6 }
    ]
  },
  {
    concluido: false,
    tentativas_usadas: 3,
    tentativas: [
      {
        resultado: "limite de movimentos excedido",
        tempo_planejamento_segundos: 8,
        configuracao_final: [["blue"], ["red"], ["green"]]
      },
      {
        resultado: "limite de movimentos excedido",
        tempo_planejamento_segundos: 10,
        configuracao_final: [["blue"], ["red"], ["green"]]
      },
      {
        resultado: "limite de movimentos excedido",
        tempo_planejamento_segundos: 12,
        configuracao_final: [["green"], ["red"], ["blue"]]
      }
    ]
  }
]);

assert.deepEqual(attemptSummary, {
  firstAttemptHits: 1,
  secondAttemptHits: 1,
  thirdAttemptHits: 0,
  failuresAfterThreeAttempts: 1,
  solvedAfterInitialError: 1,
  unsuccessfulAttempts: 4,
  itemsWithRepeatedErrors: 1,
  meanPlanningTimeSeconds: 7
});

const resultsMeta = scoring.buildResultsMetaPayload({
  totalScore: 35,
  ageYears: 20,
  itemResults: [
    {
      item: 1,
      concluido: true,
      tentativas_usadas: 1,
      tentativas: [
        { resultado: "concluída", tempo_planejamento_segundos: 2 }
      ]
    }
  ]
});
const resultsMetaByKey = Object.fromEntries(resultsMeta.map(entry => [entry.key, entry.value]));

assert.equal(resultsMeta.length, 27);
assert.equal(new Set(resultsMeta.map(entry => entry.key)).size, resultsMeta.length);
assert.deepEqual(resultsMeta.map(entry => entry.order), Array.from({ length: 27 }, (_, index) => index + 1));
assert.doesNotThrow(() => JSON.stringify(resultsMeta));
assert.equal(resultsMetaByKey.pontuacao_maxima, 57);
assert.deepEqual(resultsMetaByKey.movimentos_minimos_por_problema, scoring.MINIMUM_MOVES);
assert.equal(resultsMetaByKey.faixa_etaria_normativa, "19–21 anos");
assert.equal(resultsMetaByKey.escore_z, -2.2);
assert.equal(resultsMetaByKey.classificacao_normativa, "Abaixo do esperado");
assert.equal(resultsMetaByKey.status_desempenho, "Desempenho reduzido");
assert.match(resultsMetaByKey.interpretacao_principal, /fragilidade em planejamento executivo/);
assert.equal(resultsMetaByKey.acertos_primeira_tentativa, 1);

console.log("TOL scoring tests passed.");

(function initializePhq9Scoring(globalScope) {
  "use strict";

  const SCORED_ITEM_IDS = [
    "item_1",
    "item_2",
    "item_3",
    "item_4",
    "item_5",
    "item_6",
    "item_7",
    "item_8",
    "item_9"
  ];

  function getResponseOptions(data, question) {
    return data?.responseGroups?.[question?.responseGroup] || [];
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 10) {
      throw new Error("O PHQ-9 deve conter 9 itens pontuados e 1 pergunta funcional.");
    }

    const scoredItemIds = data.questions
      .filter((question) => question.scored)
      .map((question) => question.id);

    if (JSON.stringify(scoredItemIds) !== JSON.stringify(SCORED_ITEM_IDS)) {
      throw new Error("A lista de itens pontuados do PHQ-9 está incorreta.");
    }

    const frequencyOptions = data.responseGroups?.frequency;
    const impactOptions = data.responseGroups?.impact;

    if (!Array.isArray(frequencyOptions) || frequencyOptions.length !== 4) {
      throw new Error("O PHQ-9 deve conter exatamente 4 alternativas de frequência.");
    }

    if (!Array.isArray(impactOptions) || impactOptions.length !== 4) {
      throw new Error("A pergunta funcional deve conter exatamente 4 alternativas.");
    }

    const scores = frequencyOptions.map((option) => Number(option.score));
    if (
      scores.some((score) => !Number.isInteger(score) || score < 0 || score > 3) ||
      new Set(scores).size !== 4
    ) {
      throw new Error("As alternativas pontuadas do PHQ-9 devem representar os valores de 0 a 3.");
    }

    const functionalQuestion = data.questions[9];
    if (
      functionalQuestion.id !== "item_10" ||
      functionalQuestion.scored !== false ||
      functionalQuestion.responseGroup !== "impact"
    ) {
      throw new Error("A pergunta funcional do PHQ-9 está configurada incorretamente.");
    }
  }

  function getResponseOption(data, question, value) {
    return getResponseOptions(data, question)
      .find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let totalScore = 0;
    let answeredCount = 0;

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, question, responses[question.id]);
      const itemScore = option && question.scored ? Number(option.score) : null;

      if (option) {
        answeredCount += 1;
        if (question.scored) {
          totalScore += itemScore;
        }
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null,
        itemScore,
        scored: question.scored
      };
    });

    return {
      rows,
      totalScore,
      answeredCount,
      unansweredCount: data.questions.length - answeredCount,
      complete: answeredCount === data.questions.length
    };
  }

  function requireComplete(scored) {
    if (!scored?.complete) {
      throw new Error("Todos os itens devem ser respondidos antes do envio.");
    }
  }

  function buildResultsPayload(scored) {
    requireComplete(scored);
    return scored.rows.map((row) => ({
      pergunta: row.pergunta,
      resposta: row.resposta
    }));
  }

  function buildResultsMetaPayload(scored) {
    requireComplete(scored);
    return {
      pontuacao_bruta_total: scored.totalScore
    };
  }

  const api = Object.freeze({
    SCORED_ITEM_IDS,
    buildResultsMetaPayload,
    buildResultsPayload,
    getResponseOption,
    getResponseOptions,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.PHQ9Scoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

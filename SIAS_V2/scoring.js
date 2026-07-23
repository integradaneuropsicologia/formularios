(function initializeSiasScoring(globalScope) {
  "use strict";

  const REVERSED_ITEM_IDS = Object.freeze(["item_5", "item_9", "item_11"]);

  function getResponseOptions(data) {
    return Array.isArray(data?.responses) ? data.responses : [];
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 20) {
      throw new Error("O SIAS deve conter exatamente 20 itens.");
    }

    const expectedIds = Array.from({ length: 20 }, (_, index) => `item_${index + 1}`);
    const questionIds = data.questions.map((question) => question.id);
    if (JSON.stringify(questionIds) !== JSON.stringify(expectedIds)) {
      throw new Error("A sequência de itens do SIAS está incorreta.");
    }

    const reversedIds = data.questions
      .filter((question) => question.reverse === true)
      .map((question) => question.id);
    if (JSON.stringify(reversedIds) !== JSON.stringify(REVERSED_ITEM_IDS)) {
      throw new Error("Os itens reversos do SIAS devem ser 5, 9 e 11.");
    }

    const responses = getResponseOptions(data);
    if (responses.length !== 5) {
      throw new Error("O SIAS deve conter exatamente 5 alternativas.");
    }

    const scores = responses.map((option) => Number(option.score));
    if (
      scores.some((score) => !Number.isInteger(score) || score < 0 || score > 4) ||
      new Set(scores).size !== 5
    ) {
      throw new Error("As alternativas do SIAS devem representar os valores de 0 a 4.");
    }
  }

  function getResponseOption(data, value) {
    return getResponseOptions(data).find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let totalScore = 0;
    let answeredCount = 0;

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      const directScore = option ? Number(option.score) : null;
      const itemScore = directScore === null
        ? null
        : question.reverse
          ? 4 - directScore
          : directScore;

      if (option) {
        answeredCount += 1;
        totalScore += itemScore;
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null,
        itemScore,
        reverse: question.reverse === true
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
    REVERSED_ITEM_IDS,
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
    globalScope.SIASScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializeGad7Scoring(globalScope) {
  "use strict";

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 7) {
      throw new Error("O GAD-7 deve conter exatamente 7 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 4) {
      throw new Error("O GAD-7 deve conter exatamente 4 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (
      scores.some((score) => !Number.isInteger(score) || score < 0 || score > 3) ||
      new Set(scores).size !== 4
    ) {
      throw new Error("As alternativas do GAD-7 devem representar os valores de 0 a 3.");
    }
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let totalScore = 0;
    let answeredCount = 0;

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);

      if (option) {
        answeredCount += 1;
        totalScore += Number(option.score);
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null
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
    buildResultsMetaPayload,
    buildResultsPayload,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.GAD7Scoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

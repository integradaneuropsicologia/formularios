(function initializeYbocsScoring(globalScope) {
  "use strict";

  const SEVERITY_RANGES = Object.freeze([
    Object.freeze({ min: 0, max: 7, label: "Subclínica" }),
    Object.freeze({ min: 8, max: 15, label: "Leve" }),
    Object.freeze({ min: 16, max: 23, label: "Moderada" }),
    Object.freeze({ min: 24, max: 31, label: "Grave" }),
    Object.freeze({ min: 32, max: 40, label: "Extrema" })
  ]);

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 10) {
      throw new Error("A Y-BOCS deve conter exatamente 10 itens.");
    }

    const expectedIds = Array.from({ length: 10 }, (_, index) => `item_${index + 1}`);
    const actualIds = data.questions.map((question) => question.id);
    if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
      throw new Error("A sequência de itens da Y-BOCS está incorreta.");
    }

    data.questions.forEach((question, index) => {
      const expectedSection = index < 5 ? "obsessoes" : "compulsoes";
      if (question.section !== expectedSection) {
        throw new Error(`A seção do item ${index + 1} está incorreta.`);
      }

      if (!Array.isArray(question.options) || question.options.length !== 5) {
        throw new Error(`O item ${index + 1} deve conter exatamente 5 alternativas.`);
      }

      const scores = question.options.map((option) => Number(option.score));
      if (
        scores.some((score) => !Number.isInteger(score) || score < 0 || score > 4) ||
        new Set(scores).size !== 5
      ) {
        throw new Error(`As alternativas do item ${index + 1} devem representar os valores de 0 a 4.`);
      }
    });
  }

  function getResponseOption(question, value) {
    return question?.options?.find((option) => option.value === value) || null;
  }

  function classifySeverity(totalScore) {
    const numericScore = Number(totalScore);
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 40) {
      throw new Error("A pontuação total da Y-BOCS deve estar entre 0 e 40.");
    }

    return SEVERITY_RANGES.find(
      (range) => numericScore >= range.min && numericScore <= range.max
    ).label;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let totalScore = 0;
    let answeredCount = 0;

    const rows = data.questions.map((question) => {
      const option = getResponseOption(question, responses[question.id]);

      if (option) {
        answeredCount += 1;
        totalScore += Number(option.score);
      }

      return {
        pergunta: `${question.title}. ${question.text}`,
        resposta: option?.label || null
      };
    });

    return {
      rows,
      totalScore,
      severity: classifySeverity(totalScore),
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
      pontuacao_bruta_total: scored.totalScore,
      severidade: scored.severity
    };
  }

  const api = Object.freeze({
    SEVERITY_RANGES,
    buildResultsMetaPayload,
    buildResultsPayload,
    classifySeverity,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.YBOCSScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

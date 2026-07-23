(function initializeGdsScoring(globalScope) {
  "use strict";

  const EXPECTED_REVERSED_ITEMS = [1, 8, 13, 14, 15];

  function itemNumber(question) {
    return Number(String(question?.id || "").replace("item_", ""));
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 15) {
      throw new Error("A GDS-15 deve conter exatamente 15 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 2) {
      throw new Error("A GDS-15 deve conter exatamente as alternativas Sim e Não.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (
      scores.some((score) => !Number.isInteger(score) || score < 0 || score > 1) ||
      new Set(scores).size !== 2
    ) {
      throw new Error("As alternativas da GDS-15 devem representar internamente os valores 0 e 1.");
    }

    const reversedItems = data.questions
      .filter((question) => question.reverse)
      .map(itemNumber);

    if (JSON.stringify(reversedItems) !== JSON.stringify(EXPECTED_REVERSED_ITEMS)) {
      throw new Error("A lista de itens invertidos da GDS-15 está incorreta.");
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
      const rawScore = option ? Number(option.score) : null;
      const correctedScore = rawScore === null
        ? null
        : question.reverse
          ? 1 - rawScore
          : rawScore;

      if (option) {
        answeredCount += 1;
        totalScore += correctedScore;
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null,
        correctedScore
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
    EXPECTED_REVERSED_ITEMS,
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
    globalScope.GDSScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

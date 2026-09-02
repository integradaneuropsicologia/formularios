(function initializeIdateScoring(globalScope) {
  "use strict";

  const EXPECTED_REVERSED_ITEMS = [1, 3, 6, 7, 10, 13, 14, 16, 19];
  const TRAIT_PRESENT_ITEMS = [2, 4, 5, 8, 9, 11, 12, 15, 17, 18, 20];
  const TRAIT_ABSENT_ITEMS = [1, 3, 6, 7, 10, 13, 14, 16, 19];

  function itemNumber(question) {
    return Number(String(question?.id || "").replace("item_", ""));
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 20) {
      throw new Error("O IDATE-Traço deve conter exatamente 20 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 4) {
      throw new Error("O IDATE-Traço deve conter exatamente 4 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (
      scores.some((score) => !Number.isInteger(score) || score < 1 || score > 4) ||
      new Set(scores).size !== 4
    ) {
      throw new Error("As alternativas do IDATE-Traço devem representar os valores de 1 a 4.");
    }

    const reversedItems = data.questions
      .filter((question) => question.reverse)
      .map(itemNumber);

    if (JSON.stringify(reversedItems) !== JSON.stringify(EXPECTED_REVERSED_ITEMS)) {
      throw new Error("A lista de itens invertidos do IDATE-Traço está incorreta.");
    }

    const domainItems = [...TRAIT_PRESENT_ITEMS, ...TRAIT_ABSENT_ITEMS];
    if (
      domainItems.length !== data.questions.length ||
      new Set(domainItems).size !== data.questions.length ||
      domainItems.some((item) => item < 1 || item > data.questions.length)
    ) {
      throw new Error("Os domínios do IDATE-Traço devem cobrir os 20 itens uma única vez.");
    }
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let totalScore = 0;
    let answeredCount = 0;
    const itemScores = {};

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      const rawScore = option ? Number(option.score) : null;
      const correctedScore = rawScore === null
        ? null
        : question.reverse
          ? 5 - rawScore
          : rawScore;

      if (option) {
        answeredCount += 1;
        totalScore += correctedScore;
        itemScores[itemNumber(question)] = correctedScore;
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null,
        correctedScore
      };
    });

    const traitPresentScore = TRAIT_PRESENT_ITEMS.reduce(
      (total, item) => total + (itemScores[item] ?? 0),
      0
    );
    const traitAbsentScore = TRAIT_ABSENT_ITEMS.reduce(
      (total, item) => total + (itemScores[item] ?? 0),
      0
    );

    return {
      rows,
      itemScores,
      traitPresentScore,
      traitAbsentScore,
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
      pontuacao_bruta_total: scored.totalScore,
      ansiedade_traco_presente: scored.traitPresentScore,
      ansiedade_traco_ausente_bem_estar_emocional: scored.traitAbsentScore,
      score_total: scored.totalScore
    };
  }

  const api = Object.freeze({
    EXPECTED_REVERSED_ITEMS,
    TRAIT_ABSENT_ITEMS,
    TRAIT_PRESENT_ITEMS,
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
    globalScope.IDATEScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializeDass21Scoring(globalScope) {
  "use strict";

  const SUBSCALES = Object.freeze({
    depressao: Object.freeze([3, 5, 10, 13, 16, 17, 21]),
    ansiedade: Object.freeze([2, 4, 7, 9, 15, 19, 20]),
    estresse: Object.freeze([1, 6, 8, 11, 12, 14, 18])
  });

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 21) {
      throw new Error("A DASS-21 deve conter exatamente 21 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 4) {
      throw new Error("A DASS-21 deve conter exatamente 4 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (scores.join(",") !== "0,1,2,3") {
      throw new Error("As alternativas da DASS-21 devem representar internamente os valores de 0 a 3.");
    }

    data.questions.forEach((question, index) => {
      if (question.id !== `item_${index + 1}` || question.number !== index + 1) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!String(question.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });

    const groupedItems = Object.values(SUBSCALES).flat().sort((a, b) => a - b);
    if (
      groupedItems.length !== 21 ||
      groupedItems.some((item, index) => item !== index + 1)
    ) {
      throw new Error("Os agrupamentos das escalas da DASS-21 estão incorretos.");
    }
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let answeredCount = 0;
    const itemScores = {};

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      const score = option ? Number(option.score) : null;

      if (option) {
        answeredCount += 1;
        itemScores[question.number] = score;
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null
      };
    });

    const subscaleScores = Object.fromEntries(
      Object.entries(SUBSCALES).map(([subscale, items]) => [
        subscale,
        items.reduce((total, item) => total + (itemScores[item] ?? 0), 0)
      ])
    );

    return {
      rows,
      subscaleScores,
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
      escala_depressao: scored.subscaleScores.depressao,
      escala_ansiedade: scored.subscaleScores.ansiedade,
      escala_estresse: scored.subscaleScores.estresse
    };
  }

  const api = Object.freeze({
    SUBSCALES,
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
    globalScope.DASS21Scoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

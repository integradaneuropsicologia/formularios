(function initializeIdcp2Scoring(globalScope) {
  "use strict";

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 210) {
      throw new Error("O IDCP-2 deve conter exatamente 210 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 4) {
      throw new Error("O IDCP-2 deve conter exatamente 4 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (scores.join(",") !== "1,2,3,4") {
      throw new Error("As alternativas do IDCP-2 devem valer de 1 a 4.");
    }

    data.questions.forEach((question, index) => {
      if (question.number !== index + 1 || question.id !== `item_${index + 1}`) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!String(question.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);
    let answeredCount = 0;

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      if (option) answeredCount += 1;

      return {
        pergunta: question.text,
        resposta: option?.label || null
      };
    });

    return {
      rows,
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
    return {};
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
    globalScope.IDCP2Scoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

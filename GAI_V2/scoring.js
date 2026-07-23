(function initializeGaiScoring(globalScope) {
  "use strict";

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 20) {
      throw new Error("O GAI deve conter exatamente 20 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 2) {
      throw new Error("O GAI deve conter exatamente 2 alternativas.");
    }

    const scoreByValue = Object.fromEntries(
      data.responses.map((option) => [option.value, Number(option.score)])
    );

    if (scoreByValue.concordo !== 1 || scoreByValue.discordo !== 0) {
      throw new Error("A correção do GAI deve usar Concordo = 1 e Discordo = 0.");
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
    globalScope.GAIScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

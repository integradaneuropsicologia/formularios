(function initializeEdeaScoring(globalScope) {
  "use strict";

  const INVERTED_ITEMS = Object.freeze([1, 5, 9, 12]);
  const invertedItemSet = new Set(INVERTED_ITEMS);

  const FACTORS = Object.freeze({
    estrategias_adequadas_de_enfrentamento: Object.freeze([1, 5, 9, 12]),
    externalizacao_da_agressividade: Object.freeze([2, 6, 13]),
    pessimismo: Object.freeze([3, 7, 10, 14]),
    paralisacao: Object.freeze([4, 8, 11, 15])
  });

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 15) {
      throw new Error("A EDE-A deve conter exatamente 15 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 5) {
      throw new Error("A EDE-A deve conter exatamente 5 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (scores.join(",") !== "0,1,2,3,4") {
      throw new Error("As alternativas da EDE-A devem representar internamente os valores de 0 a 4.");
    }

    data.questions.forEach((question, index) => {
      if (question.id !== `item_${index + 1}` || question.number !== index + 1) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!String(question.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });

    const groupedItems = Object.values(FACTORS).flat().sort((a, b) => a - b);
    if (
      groupedItems.length !== 15 ||
      groupedItems.some((item, index) => item !== index + 1)
    ) {
      throw new Error("Os agrupamentos dos fatores da EDE-A estão incorretos.");
    }
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function correctedItemScore(itemNumber, rawScore) {
    if (!Number.isFinite(rawScore)) return null;
    return invertedItemSet.has(itemNumber) ? 4 - rawScore : rawScore;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let answeredCount = 0;
    const itemScores = {};

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);

      if (option) {
        answeredCount += 1;
        itemScores[question.number] = correctedItemScore(
          question.number,
          Number(option.score)
        );
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null
      };
    });

    const factorScores = Object.fromEntries(
      Object.entries(FACTORS).map(([factor, items]) => [
        factor,
        items.reduce((total, item) => total + (itemScores[item] ?? 0), 0)
      ])
    );

    return {
      rows,
      factorScores,
      itemScores,
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
      fator_1_estrategias_adequadas_de_enfrentamento:
        scored.factorScores.estrategias_adequadas_de_enfrentamento,
      fator_2_externalizacao_da_agressividade:
        scored.factorScores.externalizacao_da_agressividade,
      fator_3_pessimismo: scored.factorScores.pessimismo,
      fator_4_paralisacao: scored.factorScores.paralisacao
    };
  }

  const api = Object.freeze({
    FACTORS,
    INVERTED_ITEMS,
    buildResultsMetaPayload,
    buildResultsPayload,
    correctedItemScore,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.EDEAScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

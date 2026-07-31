(function initializeMdqScoring(globalScope) {
  "use strict";

  function validateOptions(options, expectedLength, label) {
    if (!Array.isArray(options) || options.length !== expectedLength) {
      throw new Error(`${label} deve conter exatamente ${expectedLength} alternativas.`);
    }

    options.forEach((option) => {
      if (!String(option.value || "").trim() || !String(option.label || "").trim()) {
        throw new Error(`${label} contém uma alternativa inválida.`);
      }
    });
  }

  function validateData(data) {
    if (!data || data.formCode !== "MDQ_V2") {
      throw new Error("Os dados do MDQ não foram carregados corretamente.");
    }

    if (!Array.isArray(data.symptoms) || data.symptoms.length !== 13) {
      throw new Error("O MDQ deve conter exatamente 13 itens pontuados.");
    }

    data.symptoms.forEach((item, index) => {
      if (item.id !== `item_${index + 1}` || item.number !== index + 1) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!String(item.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });

    validateOptions(data.symptomOptions, 2, "Os itens pontuados");
    validateOptions(data.samePeriod?.options, 2, "A pergunta sobre o mesmo período");
    validateOptions(data.impact?.options, 4, "A pergunta sobre prejuízo");

    if (
      data.symptomOptions[0].value !== "sim" ||
      Number(data.symptomOptions[0].score) !== 1 ||
      data.symptomOptions[1].value !== "nao" ||
      Number(data.symptomOptions[1].score) !== 0
    ) {
      throw new Error("Os itens pontuados devem usar Sim = 1 e Não = 0.");
    }
  }

  function findOption(options, value) {
    return options.find((option) => option.value === value) || null;
  }

  function scoreSymptomResponses(data, responses) {
    return data.symptoms.reduce((total, item) => {
      const option = findOption(data.symptomOptions, responses[item.id]);
      return total + (option ? Number(option.score) : 0);
    }, 0);
  }

  function getRequiredIds(data, responses = {}) {
    const totalBruto = scoreSymptomResponses(data, responses);
    const ids = [
      ...data.symptoms.map((item) => item.id),
      data.impact.id
    ];

    if (totalBruto > 1) {
      ids.push(data.samePeriod.id);
    }

    return ids;
  }

  function hasValidResponse(data, id, value) {
    if (id === data.impact.id) {
      return Boolean(findOption(data.impact.options, value));
    }

    if (id === data.samePeriod.id) {
      return Boolean(findOption(data.samePeriod.options, value));
    }

    return Boolean(findOption(data.symptomOptions, value));
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    const rows = [];
    const totalBruto = scoreSymptomResponses(data, responses);
    const needsSamePeriod = totalBruto > 1;
    const requiredIds = getRequiredIds(data, responses);
    const missingIds = requiredIds.filter((id) => !hasValidResponse(data, id, responses[id]));

    data.symptoms.forEach((item) => {
      const option = findOption(data.symptomOptions, responses[item.id]);
      rows.push({
        pergunta: item.text,
        resposta: option?.label || null
      });
    });

    const samePeriodOption = findOption(
      data.samePeriod.options,
      responses[data.samePeriod.id]
    );
    rows.push({
      pergunta: data.samePeriod.text,
      resposta: needsSamePeriod ? samePeriodOption?.label || null : "Não se aplica"
    });

    const impactOption = findOption(data.impact.options, responses[data.impact.id]);
    rows.push({
      pergunta: data.impact.text,
      resposta: impactOption?.label || null
    });

    return {
      rows,
      totalBruto,
      needsSamePeriod,
      requiredIds,
      missingIds,
      requiredCount: requiredIds.length,
      answeredCount: requiredIds.length - missingIds.length,
      unansweredCount: missingIds.length,
      complete: missingIds.length === 0
    };
  }

  function requireComplete(scored) {
    if (!scored?.complete) {
      throw new Error("Todas as perguntas obrigatórias devem ser respondidas antes do envio.");
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
      mdq_total: scored.totalBruto
    };
  }

  const api = Object.freeze({
    buildResultsMetaPayload,
    buildResultsPayload,
    findOption,
    getRequiredIds,
    scoreResponses,
    scoreSymptomResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.MDQScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

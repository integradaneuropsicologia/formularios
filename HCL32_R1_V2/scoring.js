(function initializeHcl32R1Scoring(globalScope) {
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
    if (!data || data.formCode !== "HCL32_R1_V2") {
      throw new Error("Os dados da HCL-32-R1 não foram carregados corretamente.");
    }

    if (!Array.isArray(data.symptoms) || data.symptoms.length !== 32) {
      throw new Error("A HCL-32-R1 deve conter exatamente 32 itens pontuados.");
    }

    data.symptoms.forEach((item, index) => {
      if (item.id !== `item_${index + 1}` || item.number !== index + 1) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!String(item.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });

    validateOptions(data.currentState?.options, 7, "A pergunta sobre o estado atual");
    validateOptions(data.usualPattern?.options, 4, "A pergunta sobre o padrão habitual");
    validateOptions(data.symptomOptions, 2, "Os itens pontuados");
    validateOptions(data.impactOptions, 4, "A pergunta sobre impactos");
    validateOptions(data.reactions?.options, 5, "A pergunta sobre reações");
    validateOptions(data.duration?.options, 6, "A pergunta sobre duração");
    validateOptions(data.recentHighs?.options, 2, "A pergunta sobre os últimos 12 meses");

    if (
      data.symptomOptions[0].value !== "sim" ||
      Number(data.symptomOptions[0].score) !== 1 ||
      data.symptomOptions[1].value !== "nao" ||
      Number(data.symptomOptions[1].score) !== 0
    ) {
      throw new Error("Os itens pontuados devem usar Sim = 1 e Não = 0.");
    }

    if (!Array.isArray(data.impactDomains) || data.impactDomains.length !== 4) {
      throw new Error("A pergunta sobre impactos deve conter quatro áreas.");
    }
  }

  function findOption(options, value) {
    return options.find((option) => option.value === value) || null;
  }

  function normalizeDays(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 365 ? number : null;
  }

  function getFixedRequiredIds(data) {
    return [
      data.currentState.id,
      data.usualPattern.id,
      ...data.symptoms.map((item) => item.id),
      ...data.impactDomains.map((domain) => domain.id),
      data.reactions.id,
      data.duration.id,
      data.recentHighs.id
    ];
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    const rows = [];
    const requiredIds = getFixedRequiredIds(data);
    const recentOption = findOption(
      data.recentHighs.options,
      responses[data.recentHighs.id]
    );
    const needsDays = recentOption?.value === "sim";

    if (needsDays) {
      requiredIds.push(data.daysInHighs.id);
    }

    const missingIds = requiredIds.filter((id) => {
      if (id === data.daysInHighs.id) {
        return normalizeDays(responses[id]) === null;
      }
      return !String(responses[id] || "").trim();
    });

    const currentOption = findOption(
      data.currentState.options,
      responses[data.currentState.id]
    );
    rows.push({
      pergunta: data.currentState.text,
      resposta: currentOption?.label || null
    });

    const usualOption = findOption(
      data.usualPattern.options,
      responses[data.usualPattern.id]
    );
    rows.push({
      pergunta: `${data.usualPattern.text} ${data.usualPattern.detail}`,
      resposta: usualOption?.label || null
    });

    let totalBruto = 0;
    data.symptoms.forEach((item) => {
      const option = findOption(data.symptomOptions, responses[item.id]);
      if (option) totalBruto += Number(option.score);

      rows.push({
        pergunta: item.text,
        resposta: option?.label || null
      });
    });

    data.impactDomains.forEach((domain) => {
      const option = findOption(data.impactOptions, responses[domain.id]);
      rows.push({
        pergunta: `O impacto de seus altos em sua vida - ${domain.text}`,
        resposta: option?.label || null
      });
    });

    const reactionOption = findOption(
      data.reactions.options,
      responses[data.reactions.id]
    );
    rows.push({
      pergunta: `${data.reactions.text} ${data.reactions.detail}`,
      resposta: reactionOption?.label || null
    });

    const durationOption = findOption(
      data.duration.options,
      responses[data.duration.id]
    );
    rows.push({
      pergunta: data.duration.text,
      resposta: durationOption?.label || null
    });

    rows.push({
      pergunta: data.recentHighs.text,
      resposta: recentOption?.label || null
    });

    const days = normalizeDays(responses[data.daysInHighs.id]);
    rows.push({
      pergunta: data.daysInHighs.text,
      resposta: needsDays ? (days === null ? null : String(days)) : "Não se aplica"
    });

    return {
      rows,
      totalBruto,
      needsDays,
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
      hcl32_total_bruto: scored.totalBruto
    };
  }

  const api = Object.freeze({
    buildResultsMetaPayload,
    buildResultsPayload,
    findOption,
    getFixedRequiredIds,
    normalizeDays,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.HCL32R1Scoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializePsstScoring(globalScope) {
  "use strict";

  const CLASSIFICATIONS = Object.freeze({
    TEMPORAL_NOT_CONFIRMED: "Padrão temporal pré-menstrual não confirmado",
    PROBABLE_PMDD: "Compatível com TDPM provável",
    MODERATE_SEVERE_PMS: "Compatível com SPM moderada a grave",
    NONE_OR_MILD_PMS: "Sem SPM/TPM ou SPM/TPM leve"
  });

  const INTERPRETATIONS = Object.freeze({
    [CLASSIFICATIONS.TEMPORAL_NOT_CONFIRMED]:
      "As respostas não confirmam que os sintomas ocorram especificamente no período pré-menstrual e melhorem após o início do sangramento. O algoritmo de triagem não deve ser interpretado como positivo sem esse padrão temporal.",
    [CLASSIFICATIONS.PROBABLE_PMDD]:
      "A combinação de sintomas afetivos centrais, demais sintomas e prejuízo funcional é compatível com triagem positiva para TDPM provável. O resultado não confirma diagnóstico e deve ser integrado à avaliação clínica e ao registro prospectivo por pelo menos dois ciclos sintomáticos consecutivos.",
    [CLASSIFICATIONS.MODERATE_SEVERE_PMS]:
      "A combinação de sintomas e prejuízo funcional é compatível com síndrome pré-menstrual moderada a grave, sem atingir todos os critérios de gravidade da triagem para TDPM provável. Recomenda-se avaliação clínica e acompanhamento prospectivo dos sintomas.",
    [CLASSIFICATIONS.NONE_OR_MILD_PMS]:
      "As respostas não alcançam os critérios combinados para TDPM provável ou síndrome pré-menstrual moderada a grave. O PSST não diferencia de forma conclusiva ausência de sintomas e sintomas leves."
  });

  function getQuestionOptions(data, question) {
    return data?.responseSets?.[question?.responseSet] || [];
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 20) {
      throw new Error("O PSST deve conter a pergunta temporal, 14 sintomas e 5 áreas de prejuízo.");
    }

    const temporal = data.questions.filter((question) => question.group === "temporal");
    const symptoms = data.questions.filter((question) => question.group === "symptom");
    const impairments = data.questions.filter((question) => question.group === "impairment");
    const coreSymptoms = symptoms.filter((question) => question.core);

    if (temporal.length !== 1 || symptoms.length !== 14 || impairments.length !== 5) {
      throw new Error("A distribuição dos itens do PSST está incorreta.");
    }

    if (coreSymptoms.length !== 4 || coreSymptoms.some((question, index) => question.id !== `sintoma_${index + 1}`)) {
      throw new Error("Os sintomas afetivos centrais devem ser os itens 1 a 4.");
    }

    const severityScores = data.responseSets?.severity?.map((option) => Number(option.score));
    if (
      !Array.isArray(severityScores) ||
      severityScores.length !== 4 ||
      JSON.stringify(severityScores) !== JSON.stringify([0, 1, 2, 3])
    ) {
      throw new Error("As intensidades do PSST devem representar os valores de 0 a 3.");
    }

    data.questions.forEach((question) => {
      const options = getQuestionOptions(data, question);
      if (!question.id || !question.text || !Array.isArray(options) || options.length < 2) {
        throw new Error(`A configuração do item ${question.id || "sem identificação"} está incompleta.`);
      }
    });
  }

  function getResponseOption(data, question, value) {
    return getQuestionOptions(data, question).find((option) => option.value === value) || null;
  }

  function classifyPsst({
    temporalConfirmed,
    coreSevereCount,
    coreModerateSevereCount,
    symptomModerateSevereCount,
    impairmentSevereCount,
    impairmentModerateSevereCount
  }) {
    const meetsProbablePmdd =
      temporalConfirmed &&
      coreSevereCount >= 1 &&
      symptomModerateSevereCount >= 5 &&
      impairmentSevereCount >= 1;

    const meetsModerateSeverePms =
      temporalConfirmed &&
      coreModerateSevereCount >= 1 &&
      symptomModerateSevereCount >= 5 &&
      impairmentModerateSevereCount >= 1;

    let classification = CLASSIFICATIONS.NONE_OR_MILD_PMS;
    if (!temporalConfirmed) {
      classification = CLASSIFICATIONS.TEMPORAL_NOT_CONFIRMED;
    } else if (meetsProbablePmdd) {
      classification = CLASSIFICATIONS.PROBABLE_PMDD;
    } else if (meetsModerateSeverePms) {
      classification = CLASSIFICATIONS.MODERATE_SEVERE_PMS;
    }

    return {
      classification,
      interpretation: INTERPRETATIONS[classification],
      meetsProbablePmdd,
      meetsModerateSeverePms
    };
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    let answeredCount = 0;
    const scoredRows = data.questions.map((question) => {
      const option = getResponseOption(data, question, responses[question.id]);
      if (option) answeredCount += 1;

      return {
        id: question.id,
        group: question.group,
        core: Boolean(question.core),
        pergunta: question.text,
        resposta: option?.label || null,
        score: Number.isFinite(Number(option?.score)) ? Number(option.score) : null,
        value: option?.value || null
      };
    });

    const symptomRows = scoredRows.filter((row) => row.group === "symptom");
    const coreRows = symptomRows.filter((row) => row.core);
    const impairmentRows = scoredRows.filter((row) => row.group === "impairment");
    const temporalConfirmed = scoredRows.find((row) => row.group === "temporal")?.value === "sim";
    const symptomModerateSevereCount = symptomRows.filter((row) => row.score >= 2).length;
    const coreSevereCount = coreRows.filter((row) => row.score === 3).length;
    const coreModerateSevereCount = coreRows.filter((row) => row.score >= 2).length;
    const impairmentSevereCount = impairmentRows.filter((row) => row.score === 3).length;
    const impairmentModerateSevereCount = impairmentRows.filter((row) => row.score >= 2).length;
    const classification = classifyPsst({
      temporalConfirmed,
      coreSevereCount,
      coreModerateSevereCount,
      symptomModerateSevereCount,
      impairmentSevereCount,
      impairmentModerateSevereCount
    });

    return {
      rows: scoredRows,
      answeredCount,
      unansweredCount: data.questions.length - answeredCount,
      complete: answeredCount === data.questions.length,
      temporalConfirmed,
      symptomModerateSevereCount,
      coreSevereCount,
      coreModerateSevereCount,
      impairmentSevereCount,
      impairmentModerateSevereCount,
      ...classification
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
      classificacao_psst: scored.classification,
      interpretacao: scored.interpretation,
      padrao_temporal_confirmado: scored.temporalConfirmed,
      sintomas_moderados_ou_graves: scored.symptomModerateSevereCount,
      sintomas_centrais_graves: scored.coreSevereCount,
      sintomas_centrais_moderados_ou_graves: scored.coreModerateSevereCount,
      prejuizos_funcionais_graves: scored.impairmentSevereCount,
      prejuizos_funcionais_moderados_ou_graves: scored.impairmentModerateSevereCount,
      criterio_tdpm_provavel_atendido: scored.meetsProbablePmdd,
      criterio_spm_moderada_grave_atendido: scored.meetsModerateSeverePms,
      observacao: "Resultado de triagem. Não confirma diagnóstico isoladamente."
    };
  }

  const api = Object.freeze({
    CLASSIFICATIONS,
    buildResultsMetaPayload,
    buildResultsPayload,
    classifyPsst,
    getQuestionOptions,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.PSSTScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

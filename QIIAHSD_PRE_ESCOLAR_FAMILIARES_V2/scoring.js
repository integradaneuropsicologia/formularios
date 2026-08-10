(function initializeQiiAhsdPreEscolarFamiliaresScoring(globalScope) {
  "use strict";

  function getAllFields(data) {
    const fields = [...(data.respondentFields || [])];

    (data.sections || []).forEach((section) => {
      fields.push(...(section.questions || []), ...(section.supplementary || []));
    });

    fields.push(...(data.skillsSection?.fields || []));
    fields.push(...(data.comparisonSection?.questions || []));
    fields.push(...(data.qualitativeSection?.questions || []));
    return fields;
  }

  function validateData(data) {
    if (!data || data.formCode !== "QIIAHSD_PRE_ESCOLAR_FAMILIARES_V2") {
      throw new Error("Código do formulário complementar inválido.");
    }

    const fields = getAllFields(data);
    const ids = fields.map((field) => field.id);
    if (new Set(ids).size !== ids.length) {
      throw new Error("Existem campos duplicados no formulário.");
    }

    const numbered = fields
      .filter((field) => Number.isInteger(field.number))
      .map((field) => field.number)
      .sort((a, b) => a - b);
    const expected = Array.from({ length: 54 }, (_, index) => index + 1);

    if (JSON.stringify(numbered) !== JSON.stringify(expected)) {
      throw new Error("O formulário deve conter os itens numerados de 1 a 54.");
    }

    const requiredScaleItems = numbered.filter((number) => number <= 48);
    if (requiredScaleItems.length !== 48) {
      throw new Error("Os itens objetivos de 1 a 48 estão incompletos.");
    }
  }

  function findField(data, fieldId) {
    return getAllFields(data).find((field) => field.id === fieldId) || null;
  }

  function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return String(value ?? "").trim() !== "";
  }

  function conditionMatches(condition, responses) {
    if (!condition) return false;
    const sourceValue = responses[condition.fieldId];

    if (Object.prototype.hasOwnProperty.call(condition, "equals")) {
      return sourceValue === condition.equals;
    }

    if (Object.prototype.hasOwnProperty.call(condition, "includes")) {
      return Array.isArray(sourceValue) && sourceValue.includes(condition.includes);
    }

    return false;
  }

  function isRequired(field, responses) {
    return Boolean(field.required || conditionMatches(field.requiredWhen, responses));
  }

  function getOptionLabel(field, value) {
    const option = (field.options || []).find((entry) => entry.value === value);
    return option?.label || String(value ?? "").trim();
  }

  function formatResponse(field, value) {
    if (field.type === "multiple") {
      return (Array.isArray(value) ? value : [])
        .map((entry) => getOptionLabel(field, entry))
        .filter(Boolean)
        .join("; ");
    }

    if (field.type === "single") {
      return getOptionLabel(field, value);
    }

    return String(value ?? "").trim();
  }

  function evaluateResponses(data, responses = {}) {
    validateData(data);

    const fields = getAllFields(data);
    const requiredFields = fields.filter((field) => isRequired(field, responses));
    const missingIds = requiredFields
      .filter((field) => !hasValue(responses[field.id]))
      .map((field) => field.id);

    const rows = fields
      .filter((field) => hasValue(responses[field.id]))
      .map((field) => ({
        pergunta: field.label,
        resposta: formatResponse(field, responses[field.id])
      }));

    return {
      rows,
      missingIds,
      complete: missingIds.length === 0,
      requiredCount: requiredFields.length,
      answeredRequiredCount: requiredFields.length - missingIds.length
    };
  }

  function requireComplete(evaluated) {
    if (!evaluated?.complete) {
      throw new Error("Todas as perguntas obrigatórias devem ser respondidas antes do envio.");
    }
  }

  function buildResultsPayload(evaluated) {
    requireComplete(evaluated);
    return evaluated.rows.map((row) => ({
      pergunta: row.pergunta,
      resposta: row.resposta
    }));
  }

  function buildResultsMetaPayload(evaluated) {
    requireComplete(evaluated);
    return {};
  }

  const api = Object.freeze({
    buildResultsMetaPayload,
    buildResultsPayload,
    conditionMatches,
    evaluateResponses,
    findField,
    formatResponse,
    getAllFields,
    hasValue,
    isRequired,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.QIIAHSDPreEscolarFamiliaresScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

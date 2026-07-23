(function initializeIdadiScoring(globalScope) {
  "use strict";

  function parseIsoDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || "").trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return { year, month, day };
  }

  function normalizeReferenceDate(referenceDate) {
    if (referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())) {
      return {
        year: referenceDate.getFullYear(),
        month: referenceDate.getMonth() + 1,
        day: referenceDate.getDate()
      };
    }

    return parseIsoDate(referenceDate);
  }

  function calculateCompletedMonths(birthDate, referenceDate = new Date()) {
    const birth = parseIsoDate(birthDate);
    const reference = normalizeReferenceDate(referenceDate);
    if (!birth || !reference) return null;

    let months = (reference.year - birth.year) * 12 + (reference.month - birth.month);
    if (reference.day < birth.day) months -= 1;

    return months >= 0 ? months : null;
  }

  function getRangeForAge(data, domainCode, ageMonths) {
    const ranges = data?.ranges?.[domainCode] || [];
    return ranges.find(
      (range) => ageMonths >= range.minMonths && ageMonths <= range.maxMonths
    ) || null;
  }

  function getQuestionnaire(data, ageMonths) {
    const numericAge = Number(ageMonths);
    const minAge = Number(data?.supportedAge?.minMonths);
    const maxAge = Number(data?.supportedAge?.maxMonths);

    if (!Number.isInteger(numericAge) || numericAge < minAge || numericAge > maxAge) {
      throw new RangeError(`A idade deve estar entre ${minAge} e ${maxAge} meses completos.`);
    }

    const domains = data.domains.flatMap((domain) => {
      const range = getRangeForAge(data, domain.code, numericAge);
      if (!range) return [];

      const questions = [];
      for (let index = range.start; index <= range.end; index += 1) {
        const code = `${domain.code}${index}`;
        const text = data.items?.[domain.code]?.[code];
        if (!text) {
          throw new Error(`Item ausente na definição do IDADI: ${code}.`);
        }

        questions.push({
          code,
          domainCode: domain.code,
          domain: domain.label,
          text
        });
      }

      return [{
        ...domain,
        range: { ...range },
        questions
      }];
    });

    return {
      ageMonths: numericAge,
      booklet: numericAge <= 35 ? "4 a 35 meses" : "36 a 72 meses",
      domains,
      totalQuestions: domains.reduce((total, domain) => total + domain.questions.length, 0)
    };
  }

  function getResponseOption(data, value) {
    return (data.responses || []).find((option) => option.value === value) || null;
  }

  function scoreQuestionnaire(data, questionnaire, responses = {}, comments = {}) {
    const rows = [];
    const domainResults = [];

    questionnaire.domains.forEach((domain) => {
      let rawScore = 0;
      let answeredCount = 0;
      let observedCount = 0;
      let notObservedCount = 0;

      domain.questions.forEach((question) => {
        const option = getResponseOption(data, responses[question.code]);
        const comment = String(comments[question.code] || "").trim();

        if (option) {
          answeredCount += 1;
          if (Number.isFinite(option.score)) {
            observedCount += 1;
            rawScore += Number(option.score);
          } else {
            notObservedCount += 1;
          }
        }

        rows.push({
          codigo_item: question.code,
          dominio_codigo: question.domainCode,
          dominio: question.domain,
          pergunta: question.text,
          resposta: option?.label || null,
          pontuacao: Number.isFinite(option?.score) ? Number(option.score) : null,
          comentario: comment || (option?.value === "nao_observado" ? "Não observado" : null)
        });
      });

      domainResults.push({
        codigo: domain.code,
        dominio: domain.label,
        faixa_meses: `${domain.range.minMonths}-${domain.range.maxMonths}`,
        primeiro_item: `${domain.code}${domain.range.start}`,
        ultimo_item: `${domain.code}${domain.range.end}`,
        pontuacao_bruta: rawScore,
        pontuacao_maxima_protocolo: domain.questions.length * 2,
        pontuacao_maxima_observada: observedCount * 2,
        itens_apresentados: domain.questions.length,
        itens_marcados: answeredCount,
        itens_pontuados: observedCount,
        itens_nao_observados: notObservedCount,
        itens_sem_resposta: domain.questions.length - answeredCount
      });
    });

    const summary = {
      rows,
      domainResults,
      answeredCount: domainResults.reduce((total, domain) => total + domain.itens_marcados, 0),
      observedCount: domainResults.reduce((total, domain) => total + domain.itens_pontuados, 0),
      notObservedCount: domainResults.reduce(
        (total, domain) => total + domain.itens_nao_observados,
        0
      ),
      unansweredCount: domainResults.reduce(
        (total, domain) => total + domain.itens_sem_resposta,
        0
      )
    };

    summary.complete = summary.unansweredCount === 0;
    return summary;
  }

  function buildResultsPayload(scored) {
    return scored.rows.map((row) => ({ ...row }));
  }

  function buildResultsMetaPayload({
    data,
    questionnaire,
    scored,
    referenceDate = new Date()
  }) {
    const date = referenceDate instanceof Date
      ? referenceDate.toISOString()
      : String(referenceDate);

    return {
      instrumento: "IDADI",
      formulario: data.formCode,
      versao_estrutura: data.schemaVersion,
      caderno: questionnaire.booklet,
      idade_meses: questionnaire.ageMonths,
      data_aplicacao: date,
      escala_pontuacao: {
        Sim: 2,
        "Às vezes": 1,
        "Ainda não": 0,
        "Não observado": null
      },
      total_itens_apresentados: questionnaire.totalQuestions,
      total_itens_marcados: scored.answeredCount,
      total_itens_pontuados: scored.observedCount,
      total_itens_nao_observados: scored.notObservedCount,
      preenchimento_completo: scored.complete,
      pontuacoes_brutas: Object.fromEntries(
        scored.domainResults.map((domain) => [domain.dominio, domain.pontuacao_bruta])
      ),
      resultados_por_dominio: scored.domainResults.map((domain) => ({ ...domain })),
      tipo_resultado: "Pontuação bruta por domínio"
    };
  }

  const api = Object.freeze({
    buildResultsMetaPayload,
    buildResultsPayload,
    calculateCompletedMonths,
    getQuestionnaire,
    getRangeForAge,
    getResponseOption,
    parseIsoDate,
    scoreQuestionnaire
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.IDADIScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

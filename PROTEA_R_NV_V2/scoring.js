(function initializeProteaScoring(globalScope) {
  "use strict";

  const QUALITY_SCORES = Object.freeze({
    A: 0,
    B: 1,
    C: 2,
    D: 3
  });

  const CRITICAL_ITEM_NUMBERS = Object.freeze([1, 2, 3, 13, 16]);

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 17) {
      throw new Error("O PROTEA-R-NV deve conter exatamente 17 itens.");
    }

    if (Number(data.sessionCount) !== 3) {
      throw new Error("O PROTEA-R-NV deve registrar exatamente três sessões.");
    }

    data.questions.forEach((question, index) => {
      const expectedNumber = index + 1;
      if (question.number !== expectedNumber || question.id !== `item_${expectedNumber}`) {
        throw new Error(`A sequência do item ${expectedNumber} está incorreta.`);
      }

      if (!Array.isArray(question.options) || question.options.length !== 5) {
        throw new Error(`O item ${expectedNumber} deve conter as alternativas A, B, C, D e E.`);
      }

      const optionCodes = question.options.map((option) => option.code);
      if (optionCodes.join(",") !== "A,B,C,D,E") {
        throw new Error(`As alternativas do item ${expectedNumber} estão fora de ordem.`);
      }

      const frequencyCodes = question.frequencyCodes || [];
      if (
        !Array.isArray(frequencyCodes) ||
        frequencyCodes.some((code) => !optionCodes.includes(code))
      ) {
        throw new Error(`A regra de frequência do item ${expectedNumber} é inválida.`);
      }

      if (question.dependency) {
        const parent = data.questions.find(
          (candidate) => candidate.id === question.dependency.parentId
        );
        if (!parent || parent.number >= question.number) {
          throw new Error(`A dependência do item ${expectedNumber} é inválida.`);
        }
      }
    });

    const criticalNumbers = data.questions
      .filter((question) => question.critical)
      .map((question) => question.number);

    if (criticalNumbers.join(",") !== CRITICAL_ITEM_NUMBERS.join(",")) {
      throw new Error("Os itens críticos do PROTEA-R-NV estão incorretos.");
    }

    const sectionCounts = data.sections.map((section) => (
      data.questions.filter((question) => question.section === section.id).length
    ));

    if (sectionCounts.join(",") !== "8,6,3") {
      throw new Error("A distribuição dos itens entre as três áreas está incorreta.");
    }
  }

  function emptyObservation() {
    return { quality: "", frequency: "" };
  }

  function createInitialResponses(data) {
    validateData(data);

    return {
      sessions: Array.from({ length: data.sessionCount }, () => ({
        date: "",
        time: "",
        evaluator: ""
      })),
      items: Object.fromEntries(
        data.questions.map((question) => [
          question.id,
          {
            sessions: Array.from({ length: data.sessionCount }, emptyObservation),
            compiled: emptyObservation(),
            examples: ""
          }
        ])
      ),
      summary: "",
      conclusion: ""
    };
  }

  function normalizeResponses(data, source = {}) {
    const normalized = createInitialResponses(data);

    normalized.sessions = normalized.sessions.map((session, index) => ({
      date: String(source.sessions?.[index]?.date || ""),
      time: String(source.sessions?.[index]?.time || ""),
      evaluator: String(source.sessions?.[index]?.evaluator || "")
    }));

    data.questions.forEach((question) => {
      const sourceItem = source.items?.[question.id] || {};
      const targetItem = normalized.items[question.id];

      targetItem.sessions = targetItem.sessions.map((observation, index) => ({
        quality: String(sourceItem.sessions?.[index]?.quality || "").toUpperCase(),
        frequency: String(sourceItem.sessions?.[index]?.frequency || "")
      }));

      targetItem.compiled = {
        quality: String(sourceItem.compiled?.quality || "").toUpperCase(),
        frequency: String(sourceItem.compiled?.frequency || "")
      };
      targetItem.examples = String(sourceItem.examples || "");
    });

    normalized.summary = String(source.summary || "");
    normalized.conclusion = String(source.conclusion || "");
    return normalized;
  }

  function getQuestion(data, itemId) {
    return data.questions.find((question) => question.id === itemId) || null;
  }

  function getOption(question, code) {
    return question?.options?.find((option) => option.code === code) || null;
  }

  function requiresFrequency(question, qualityCode) {
    return Boolean(qualityCode && question?.frequencyCodes?.includes(qualityCode));
  }

  function getObservation(responses, itemId, scope, sessionIndex = null) {
    const item = responses.items?.[itemId];
    if (!item) return emptyObservation();
    return scope === "compiled"
      ? item.compiled || emptyObservation()
      : item.sessions?.[sessionIndex] || emptyObservation();
  }

  function getDependencyState(data, question, responses, scope, sessionIndex = null) {
    if (!question.dependency) return "applicable";

    const parentObservation = getObservation(
      responses,
      question.dependency.parentId,
      scope,
      sessionIndex
    );

    if (!parentObservation.quality) return "waiting";

    return question.dependency.allowedCodes.includes(parentObservation.quality)
      ? "applicable"
      : "not_applicable";
  }

  function qualityScore(code) {
    return Object.prototype.hasOwnProperty.call(QUALITY_SCORES, code)
      ? QUALITY_SCORES[code]
      : null;
  }

  function formatFrequency(data, value) {
    const numeric = Number(value);
    const label = data.frequencyLabels?.[numeric];
    return label ? `${label} (${numeric})` : "Não informada";
  }

  function formatObservation(data, question, observation) {
    const option = getOption(question, observation.quality);
    if (!option) return "Não informado";

    const parts = [`${option.code} - ${option.label}`];
    if (requiresFrequency(question, option.code)) {
      parts.push(`Frequência: ${formatFrequency(data, observation.frequency)}`);
    }
    return parts.join(" | ");
  }

  function scoreResponses(data, sourceResponses = {}) {
    validateData(data);
    const responses = normalizeResponses(data, sourceResponses);
    const issues = [];
    let requiredCount = 0;
    let answeredCount = 0;

    function requireValue(value, issue) {
      requiredCount += 1;
      if (String(value || "").trim()) {
        answeredCount += 1;
      } else {
        issues.push(issue);
      }
    }

    responses.sessions.forEach((session, index) => {
      requireValue(session.date, {
        type: "session",
        sessionIndex: index,
        field: "date",
        message: `Informe a data da ${index + 1}ª sessão.`
      });
      requireValue(session.evaluator, {
        type: "session",
        sessionIndex: index,
        field: "evaluator",
        message: `Informe o avaliador da ${index + 1}ª sessão.`
      });
    });

    data.questions.forEach((question) => {
      const scopes = [
        ...Array.from({ length: data.sessionCount }, (_, sessionIndex) => ({
          scope: "session",
          sessionIndex,
          label: `${sessionIndex + 1}ª sessão`
        })),
        { scope: "compiled", sessionIndex: null, label: "codificação compilada" }
      ];

      scopes.forEach(({ scope, sessionIndex, label }) => {
        const observation = getObservation(
          responses,
          question.id,
          scope,
          sessionIndex
        );
        const dependencyState = getDependencyState(
          data,
          question,
          responses,
          scope,
          sessionIndex
        );
        const option = getOption(question, observation.quality);

        requireValue(observation.quality, {
          type: "item",
          itemId: question.id,
          scope,
          sessionIndex,
          field: "quality",
          message: `Informe a qualidade do item ${question.number} na ${label}.`
        });

        if (observation.quality && !option) {
          issues.push({
            type: "item",
            itemId: question.id,
            scope,
            sessionIndex,
            field: "quality",
            message: `A qualidade informada no item ${question.number} é inválida.`
          });
        }

        if (dependencyState === "not_applicable" && observation.quality !== "E") {
          issues.push({
            type: "item",
            itemId: question.id,
            scope,
            sessionIndex,
            field: "quality",
            message: `O item ${question.number} deve ser marcado como E na ${label}.`
          });
        }

        if (option && requiresFrequency(question, option.code)) {
          requireValue(observation.frequency, {
            type: "item",
            itemId: question.id,
            scope,
            sessionIndex,
            field: "frequency",
            message: `Informe a frequência do item ${question.number} na ${label}.`
          });

          if (
            observation.frequency &&
            !["1", "2", "3"].includes(String(observation.frequency))
          ) {
            issues.push({
              type: "item",
              itemId: question.id,
              scope,
              sessionIndex,
              field: "frequency",
              message: `A frequência informada no item ${question.number} é inválida.`
            });
          }
        }
      });
    });

    requireValue(responses.conclusion, {
      type: "conclusion",
      field: "conclusion",
      message: "Selecione a conclusão definida pelo profissional."
    });

    const conclusion = data.conclusions.find(
      (candidate) => candidate.value === responses.conclusion
    ) || null;

    if (responses.conclusion && !conclusion) {
      issues.push({
        type: "conclusion",
        field: "conclusion",
        message: "A conclusão selecionada é inválida."
      });
    }

    const criticalItems = data.questions
      .filter((question) => question.critical)
      .map((question) => {
        const observation = responses.items[question.id].compiled;
        return {
          id: question.id,
          code: question.code,
          title: question.title,
          quality: observation.quality || null,
          qualityScore: qualityScore(observation.quality),
          frequency: requiresFrequency(question, observation.quality)
            ? Number(observation.frequency) || null
            : null
        };
      });

    const criticalScoreComplete = criticalItems.every(
      (item) => item.qualityScore !== null
    );
    const criticalPartialScore = criticalItems.reduce(
      (total, item) => total + (item.qualityScore ?? 0),
      0
    );

    return {
      responses,
      issues,
      requiredCount,
      answeredCount,
      unansweredCount: Math.max(requiredCount - answeredCount, 0),
      complete: issues.length === 0,
      criticalItems,
      criticalScoreComplete,
      criticalPartialScore,
      criticalTotalScore: criticalScoreComplete ? criticalPartialScore : null,
      conclusion
    };
  }

  function requireComplete(scored) {
    if (!scored?.complete) {
      throw new Error("Todos os campos obrigatórios devem ser preenchidos antes do envio.");
    }
  }

  function formatDate(dateValue) {
    const parts = String(dateValue || "").split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateValue;
  }

  function buildResultsPayload(data, scored) {
    requireComplete(scored);
    const results = [];

    scored.responses.sessions.forEach((session, index) => {
      const details = [
        `Data: ${formatDate(session.date)}`,
        session.time ? `Horário: ${session.time}` : null,
        `Avaliador: ${session.evaluator}`
      ].filter(Boolean);

      results.push({
        pergunta: `${index + 1}ª sessão de observação`,
        resposta: details.join(" | ")
      });
    });

    data.questions.forEach((question) => {
      const itemResponse = scored.responses.items[question.id];
      const lines = itemResponse.sessions.map(
        (observation, index) => (
          `${index + 1}ª sessão: ${formatObservation(data, question, observation)}`
        )
      );

      lines.push(
        `Codificação compilada: ${formatObservation(data, question, itemResponse.compiled)}`
      );

      if (itemResponse.examples.trim()) {
        lines.push(`Exemplos de comportamentos: ${itemResponse.examples.trim()}`);
      }

      results.push({
        pergunta: `${question.number}. ${question.title} (${question.code})`,
        resposta: lines.join("\n")
      });
    });

    results.push({
      pergunta: "Potencialidades e limitações observadas",
      resposta: scored.responses.summary.trim() || "Não informado"
    });
    results.push({
      pergunta: "Conclusão profissional",
      resposta: scored.conclusion.label
    });

    return results;
  }

  function buildResultsMetaPayload(scored) {
    requireComplete(scored);

    return {
      instrumento: "PROTEA-R-NV",
      respondente: "Profissional",
      faixa_etaria_referencia: "24 a 60 meses",
      escores_qualidade_itens_criticos: Object.fromEntries(
        scored.criticalItems.map((item) => [item.code, item.qualityScore])
      ),
      frequencias_itens_criticos: Object.fromEntries(
        scored.criticalItems.map((item) => [item.code, item.frequency])
      ),
      pontuacao_qualidade_total: scored.criticalTotalScore,
      pontuacao_qualidade_parcial: scored.criticalPartialScore,
      calculo_completo: scored.criticalScoreComplete,
      conclusao: scored.conclusion.label
    };
  }

  const api = Object.freeze({
    CRITICAL_ITEM_NUMBERS,
    QUALITY_SCORES,
    buildResultsMetaPayload,
    buildResultsPayload,
    createInitialResponses,
    formatObservation,
    getDependencyState,
    getObservation,
    getOption,
    normalizeResponses,
    qualityScore,
    requiresFrequency,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.PROTEAScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

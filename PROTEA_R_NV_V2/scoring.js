(function initializeProteaScoring(globalScope) {
  "use strict";

  const QUALITY_SCORES = Object.freeze({
    A: 0,
    B: 1,
    C: 2,
    D: 3
  });

  const CRITICAL_ITEM_NUMBERS = Object.freeze([1, 2, 3, 13, 16]);

  const CRITICAL_AREA_DEFINITIONS = Object.freeze([
    Object.freeze({
      key: "comportamentos_sociocomunicativos",
      label: "Comportamentos sociocomunicativos",
      itemCodes: Object.freeze(["IAC", "RAC", "IM"]),
      maximum: 9
    }),
    Object.freeze({
      key: "qualidade_da_brincadeira",
      label: "Qualidade da brincadeira",
      itemCodes: Object.freeze(["BS"]),
      maximum: 3
    }),
    Object.freeze({
      key: "movimentos_repetitivos_e_estereotipados",
      label: "Movimentos repetitivos e estereotipados do corpo",
      itemCodes: Object.freeze(["MRC"]),
      maximum: 3
    })
  ]);

  const CLASSIFICATIONS = Object.freeze({
    com_risco: Object.freeze({
      key: "com_risco",
      label: "Com risco para TEA",
      range: "9 a 15 pontos",
      interpretation:
        "A pontuação dos cinco itens críticos situa o protocolo na faixa com risco para TEA. O resultado indica sinais de alerta e deve ser integrado à anamnese, aos demais instrumentos e ao julgamento clínico; isoladamente, não estabelece diagnóstico."
    }),
    risco_relativo: Object.freeze({
      key: "risco_relativo",
      label: "Com risco relativo para TEA",
      range: "1 a 8 pontos",
      interpretation:
        "A pontuação dos cinco itens críticos situa o protocolo na faixa de risco relativo para TEA. Conforme o manual, a suspeita pode ser mantida, mas a conclusão requer informações adicionais e, quando indicado, reavaliação em intervalo de pelo menos seis meses."
    }),
    sem_risco: Object.freeze({
      key: "sem_risco",
      label: "Sem risco para TEA",
      range: "0 ponto",
      interpretation:
        "A soma dos cinco itens críticos é zero e situa o protocolo na faixa sem risco pelos critérios do PROTEA-R-NV. O resultado deve ser integrado às demais fontes da avaliação e não exclui sinais clínicos identificados por outros procedimentos."
    }),
    nao_calculavel: Object.freeze({
      key: "nao_calculavel",
      label: "Classificação não calculável",
      range: "Não aplicável",
      interpretation:
        "Não é possível calcular a classificação porque ao menos um item crítico foi codificado como E - Não se aplica. O manual orienta que o risco não seja calculado quando o comportamento crítico não pôde ser avaliado."
    })
  });

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

  function frequencyLabel(data, value) {
    return data.frequencyLabels?.[Number(value)] || null;
  }

  function classifyCriticalTotal(total, scoreComplete) {
    if (!scoreComplete || total === null) {
      return CLASSIFICATIONS.nao_calculavel;
    }
    if (total === 0) return CLASSIFICATIONS.sem_risco;
    if (total <= 8) return CLASSIFICATIONS.risco_relativo;
    return CLASSIFICATIONS.com_risco;
  }

  function classifyCriticalItem(item) {
    if (!item.quality) {
      return {
        key: "aguardando_codificacao",
        label: "Aguardando codificação compilada"
      };
    }

    if (item.qualityScore === null) {
      return {
        key: "nao_avaliavel",
        label: "Não avaliável (código E)"
      };
    }

    const frequency = Number(item.frequency) || null;
    const positiveItem = ["IAC", "RAC", "IM", "BS"].includes(item.code);
    let riskCriterion = false;
    let noRiskCriterion = false;

    if (positiveItem) {
      if (item.quality === "D") {
        riskCriterion = true;
      } else if (item.quality === "C") {
        riskCriterion = item.code === "IAC"
          ? frequency === 1
          : [1, 2].includes(frequency);
      }
      noRiskCriterion = item.quality === "A" && [2, 3].includes(frequency);
    } else if (item.code === "MRC") {
      riskCriterion = ["B", "C", "D"].includes(item.quality);
      noRiskCriterion = item.quality === "A";
    }

    if (riskCriterion) {
      return {
        key: "criterio_de_risco",
        label: "Preenche o critério específico de risco da Tabela 5.6"
      };
    }
    if (noRiskCriterion) {
      return {
        key: "criterio_sem_risco",
        label: "Preenche o critério específico sem risco da Tabela 5.6"
      };
    }
    return {
      key: "criterio_intermediario",
      label: "Não preenche isoladamente os critérios específicos de risco ou sem risco da Tabela 5.6"
    };
  }

  function buildCriticalAreaScores(criticalItems) {
    return Object.fromEntries(
      CRITICAL_AREA_DEFINITIONS.map((area) => {
        const items = criticalItems.filter((item) => area.itemCodes.includes(item.code));
        const complete = items.every((item) => item.qualityScore !== null);
        const partialScore = items.reduce(
          (total, item) => total + (item.qualityScore ?? 0),
          0
        );
        return [area.key, {
          label: area.label,
          itens: [...area.itemCodes],
          pontuacao: complete ? partialScore : null,
          pontuacao_parcial: partialScore,
          pontuacao_maxima: area.maximum,
          calculo_completo: complete
        }];
      })
    );
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

    const criticalItems = data.questions
      .filter((question) => question.critical)
      .map((question) => {
        const observation = responses.items[question.id].compiled;
        const item = {
          id: question.id,
          code: question.code,
          title: question.title,
          quality: observation.quality || null,
          qualityScore: qualityScore(observation.quality),
          frequency: requiresFrequency(question, observation.quality)
            ? Number(observation.frequency) || null
            : null,
          frequencyLabel: requiresFrequency(question, observation.quality)
            ? frequencyLabel(data, observation.frequency)
            : null
        };
        return { ...item, criterion: classifyCriticalItem(item) };
      });

    const criticalScoreComplete = criticalItems.every(
      (item) => item.qualityScore !== null
    );
    const criticalPartialScore = criticalItems.reduce(
      (total, item) => total + (item.qualityScore ?? 0),
      0
    );
    const criticalTotalScore = criticalScoreComplete ? criticalPartialScore : null;
    const classification = classifyCriticalTotal(
      criticalTotalScore,
      criticalScoreComplete
    );
    const criticalAreaScores = buildCriticalAreaScores(criticalItems);

    return {
      responses,
      issues,
      requiredCount,
      answeredCount,
      unansweredCount: Math.max(requiredCount - answeredCount, 0),
      complete: issues.length === 0,
      criticalItems,
      criticalAreaScores,
      criticalScoreComplete,
      criticalPartialScore,
      criticalTotalScore,
      classification,
      conclusion: classification
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
    const criticalCriteria = scored.criticalItems.map((item) => {
      const frequency = item.frequencyLabel
        ? `${item.frequencyLabel} (${item.frequency})`
        : "Não pontuada";
      return `${item.code}: qualidade ${item.quality || "não informada"}; escore ${item.qualityScore ?? "não calculável"}; frequência ${frequency}; ${item.criterion.label}.`;
    });

    results.push({
      pergunta: "Resultado normativo dos itens críticos",
      resposta: scored.criticalScoreComplete
        ? `Pontuação total: ${scored.criticalTotalScore} de 15 | Classificação: ${scored.classification.label} | Faixa: ${scored.classification.range}`
        : `Pontuação parcial: ${scored.criticalPartialScore} de 15 | ${scored.classification.label}`
    });
    results.push({
      pergunta: "Critérios dos itens críticos - Tabela 5.6",
      resposta: criticalCriteria.join("\n")
    });
    results.push({
      pergunta: "Interpretação normativa",
      resposta: scored.classification.interpretation
    });
    results.push({
      pergunta: "Percentil",
      resposta: "Não disponibilizado pelo manual PROTEA-R; percentil não calculado."
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
      criterios_itens_criticos_tabela_5_6: Object.fromEntries(
        scored.criticalItems.map((item) => [item.code, {
          qualidade: item.quality,
          escore_convertido: item.qualityScore,
          frequencia: item.frequency,
          frequencia_label: item.frequencyLabel,
          criterio: item.criterion.key,
          descricao: item.criterion.label
        }])
      ),
      subtotais_itens_criticos_por_area: scored.criticalAreaScores,
      pontuacao_qualidade_total: scored.criticalTotalScore,
      pontuacao_qualidade_parcial: scored.criticalPartialScore,
      pontuacao_maxima: 15,
      calculo_completo: scored.criticalScoreComplete,
      classificacao: scored.classification.label,
      faixa_classificacao: scored.classification.range,
      interpretacao: scored.classification.interpretation,
      percentil: null,
      percentil_disponivel_no_manual: false,
      nota_percentil: "O manual PROTEA-R não apresenta tabela normativa para conversão do escore individual em percentil.",
      referencia_correcao: "Tabela 5.6 do Manual PROTEA-R",
      nota_tecnica: "O resultado identifica sinais de alerta e deve ser integrado às demais informações da avaliação; não constitui diagnóstico isolado.",
      conclusao: scored.classification.label
    };
  }

  const api = Object.freeze({
    CRITICAL_ITEM_NUMBERS,
    CLASSIFICATIONS,
    QUALITY_SCORES,
    buildResultsMetaPayload,
    buildResultsPayload,
    createInitialResponses,
    classifyCriticalItem,
    classifyCriticalTotal,
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

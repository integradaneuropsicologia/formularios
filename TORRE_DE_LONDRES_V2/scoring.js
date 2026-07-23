(function initializeTolScoring(globalScope) {
  "use strict";

  const MINIMUM_MOVES = Object.freeze([
    3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 9
  ]);
  const MAX_ATTEMPTS = 3;
  const MAX_SCORE = MINIMUM_MOVES.length * MAX_ATTEMPTS;

  const AGE_NORMS = Object.freeze([
    Object.freeze({ minAge: 10, maxAge: 15, label: "10–15 anos", n: 167, mean: 44.7, standardDeviation: 6.89 }),
    Object.freeze({ minAge: 16, maxAge: 18, label: "16–18 anos", n: 138, mean: 47.3, standardDeviation: 5.85 }),
    Object.freeze({ minAge: 19, maxAge: 21, label: "19–21 anos", n: 158, mean: 48.2, standardDeviation: 6.01 }),
    Object.freeze({ minAge: 22, maxAge: 24, label: "22–24 anos", n: 103, mean: 47.6, standardDeviation: 6.86 }),
    Object.freeze({ minAge: 25, maxAge: 29, label: "25–29 anos", n: 133, mean: 47.7, standardDeviation: 6.21 }),
    Object.freeze({ minAge: 30, maxAge: 59, label: "30–59 anos", n: 92, mean: 42.4, standardDeviation: 8.23 })
  ]);

  const PRESERVED_INTERPRETATION =
    "O desempenho na TOL-BR situou-se em faixa compatível com o esperado para a idade, sugerindo preservação da capacidade de planejamento, antecipação de etapas, monitoramento da estratégia e resolução de problemas estruturados.";

  const REDUCED_INTERPRETATION =
    "O desempenho na TOL-BR situou-se abaixo do esperado para a idade, sugerindo fragilidade em planejamento executivo. Esse padrão pode envolver dificuldade em antecipar passos, organizar uma sequência eficiente de ações, monitorar erros e ajustar estratégias durante a resolução de problemas.";

  function roundTo(value, decimals = 2) {
    if (!Number.isFinite(value)) return null;
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function getNormForAge(age) {
    if (age === null || age === undefined || age === "") return null;
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge)) return null;
    return AGE_NORMS.find(norm => numericAge >= norm.minAge && numericAge <= norm.maxAge) || null;
  }

  function calculateAgeYears(rawBirthDate, referenceDate = new Date()) {
    const match = String(rawBirthDate || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;

    const birthYear = Number(match[1]);
    const birthMonth = Number(match[2]);
    const birthDay = Number(match[3]);
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

    if (
      birthDate.getFullYear() !== birthYear ||
      birthDate.getMonth() !== birthMonth - 1 ||
      birthDate.getDate() !== birthDay ||
      birthDate > referenceDate
    ) {
      return null;
    }

    let age = referenceDate.getFullYear() - birthYear;
    const monthDifference = referenceDate.getMonth() - (birthMonth - 1);

    if (monthDifference < 0 || (monthDifference === 0 && referenceDate.getDate() < birthDay)) {
      age -= 1;
    }

    return age;
  }

  function calculateZScore(totalScore, norm) {
    if (!norm || !Number.isFinite(Number(totalScore)) || !norm.standardDeviation) return null;
    return roundTo((Number(totalScore) - norm.mean) / norm.standardDeviation, 2);
  }

  function isCorrectSolution({ goalReached, moves, problemIndex }) {
    const expectedMoves = MINIMUM_MOVES[problemIndex];
    return Boolean(goalReached) &&
      Number.isFinite(expectedMoves) &&
      Number(moves) === expectedMoves;
  }

  function classifyZScore(zScore) {
    if (!Number.isFinite(zScore)) {
      return {
        normativeClassification: "Sem classificação normativa",
        performanceStatus: "Não classificado"
      };
    }

    if (zScore < -1) {
      return {
        normativeClassification: "Abaixo do esperado",
        performanceStatus: "Desempenho reduzido"
      };
    }

    if (zScore > 1) {
      return {
        normativeClassification: "Acima do esperado",
        performanceStatus: "Desempenho preservado"
      };
    }

    return {
      normativeClassification: "Dentro do esperado",
      performanceStatus: "Desempenho preservado"
    };
  }

  function hasRepeatedFailedConfiguration(item) {
    const failedConfigurations = (item.tentativas || [])
      .filter(attempt => attempt.resultado !== "concluída" && attempt.configuracao_final)
      .map(attempt => JSON.stringify(attempt.configuracao_final));

    return failedConfigurations.length > new Set(failedConfigurations).size;
  }

  function summarizeAttempts(itemResults) {
    const items = Array.isArray(itemResults) ? itemResults : [];
    const allAttempts = items.flatMap(item => Array.isArray(item.tentativas) ? item.tentativas : []);
    const planningTimes = allAttempts
      .map(attempt => Number(attempt.tempo_planejamento_segundos))
      .filter(Number.isFinite);

    return {
      firstAttemptHits: items.filter(item => item.concluido && item.tentativas_usadas === 1).length,
      secondAttemptHits: items.filter(item => item.concluido && item.tentativas_usadas === 2).length,
      thirdAttemptHits: items.filter(item => item.concluido && item.tentativas_usadas === 3).length,
      failuresAfterThreeAttempts: items.filter(item => !item.concluido).length,
      solvedAfterInitialError: items.filter(item => item.concluido && item.tentativas_usadas > 1).length,
      unsuccessfulAttempts: allAttempts.filter(attempt => attempt.resultado !== "concluída").length,
      itemsWithRepeatedErrors: items.filter(hasRepeatedFailedConfiguration).length,
      meanPlanningTimeSeconds: planningTimes.length
        ? roundTo(planningTimes.reduce((total, value) => total + value, 0) / planningTimes.length, 1)
        : null
    };
  }

  function buildAttemptProfile(summary) {
    const laterHits = summary.secondAttemptHits + summary.thirdAttemptHits;
    const inefficientOutcomes = laterHits + summary.failuresAfterThreeAttempts;
    let profile = "Perfil misto";
    let profileInterpretation =
      "O protocolo apresentou combinação de soluções imediatas e soluções após ajustes, devendo ser integrado aos demais indicadores de funções executivas.";

    if (summary.firstAttemptHits > inefficientOutcomes) {
      profile = "Predomínio de planejamento eficiente";
      profileInterpretation =
        "O predomínio de acertos na 1ª tentativa indica planejamento mais eficiente e melhor antecipação da solução.";
    } else if (inefficientOutcomes > summary.firstAttemptHits) {
      profile = "Perfil por tentativa e erro";
      profileInterpretation =
        "A necessidade predominante de múltiplas tentativas para resolver os problemas sugere planejamento inicial pouco eficiente, com ajuste progressivo da estratégia após o erro. Esse padrão deve ser integrado a outros indicadores de funções executivas.";
    }

    const observations = [];

    if (summary.secondAttemptHits || summary.thirdAttemptHits) {
      observations.push(
        `Houve ${laterHits} acerto(s) apenas na 2ª ou 3ª tentativa, sugerindo maior dependência de tentativa e erro ou ajuste progressivo da estratégia.`
      );
    }

    if (summary.solvedAfterInitialError) {
      observations.push(
        `${summary.solvedAfterInitialError} problema(s) foi(ram) resolvido(s) após erro inicial, indicando capacidade de corrigir a estratégia e monitorar o desempenho.`
      );
    }

    if (summary.failuresAfterThreeAttempts) {
      observations.push(
        `${summary.failuresAfterThreeAttempts} problema(s) permaneceu(ram) sem solução após três tentativas, o que pode indicar dificuldade mais importante de resolução, sobretudo em itens de maior demanda.`
      );
    }

    if (summary.unsuccessfulAttempts) {
      observations.push(
        `${summary.unsuccessfulAttempts} tentativa(s) atingiu(ram) o limite mínimo esperado sem solução, sugerindo menor eficiência estratégica ou dificuldade de monitorar a sequência de ações.`
      );
    }

    if (summary.itemsWithRepeatedErrors) {
      observations.push(
        `Em ${summary.itemsWithRepeatedErrors} problema(s), a mesma configuração incorreta foi repetida, indicador compatível com rigidez, dificuldade de aprendizagem pela tentativa ou baixa monitoração.`
      );
    }

    return {
      profile,
      profileInterpretation,
      observations
    };
  }

  function buildInterpretation({ totalScore, age, itemResults }) {
    const hasValidAge = age !== null &&
      age !== undefined &&
      age !== "" &&
      Number.isFinite(Number(age));
    const norm = getNormForAge(age);
    const zScore = calculateZScore(totalScore, norm);
    const classification = classifyZScore(zScore);
    const attemptSummary = summarizeAttempts(itemResults);
    const attemptProfile = buildAttemptProfile(attemptSummary);

    let mainInterpretation =
      "Não há referência normativa fornecida para a idade informada. A pontuação bruta e o padrão de tentativas devem ser interpretados pelo profissional responsável.";

    if (classification.performanceStatus === "Desempenho reduzido") {
      mainInterpretation = REDUCED_INTERPRETATION;
    } else if (classification.performanceStatus === "Desempenho preservado") {
      mainInterpretation = PRESERVED_INTERPRETATION;
      if (classification.normativeClassification === "Acima do esperado") {
        mainInterpretation +=
          " A pontuação total alta sugere melhor eficiência de planejamento, maior capacidade de resolver problemas com economia de movimentos e menor necessidade de tentativas.";
      }
    }

    return {
      ageYears: hasValidAge ? Number(age) : null,
      ageRange: norm?.label || null,
      normativeSampleSize: norm?.n || null,
      normativeMean: norm?.mean || null,
      normativeStandardDeviation: norm?.standardDeviation || null,
      zScore,
      normativeClassification: classification.normativeClassification,
      performanceStatus: classification.performanceStatus,
      classificationCriterion:
        "Classificação descritiva por escore z: abaixo do esperado quando z < -1, dentro do esperado quando -1 ≤ z ≤ 1 e acima do esperado quando z > 1.",
      mainInterpretation,
      attemptSummary,
      executionProfile: attemptProfile.profile,
      attemptInterpretation: attemptProfile.profileInterpretation,
      qualitativeObservations: attemptProfile.observations
    };
  }

  function buildResultsMetaPayload({ totalScore, ageYears, itemResults }) {
    const interpretation = buildInterpretation({
      totalScore,
      age: ageYears,
      itemResults
    });
    const attemptSummary = interpretation.attemptSummary;
    const qualitativeObservations = interpretation.qualitativeObservations.length
      ? interpretation.qualitativeObservations.join(" ")
      : "Não foram identificados indicadores qualitativos adicionais pelo padrão de tentativas.";

    return [
      { key: "pontuacao_maxima", label: "Pontuação máxima", order: 1, value: MAX_SCORE },
      { key: "problemas_total", label: "Total de problemas", order: 2, value: MINIMUM_MOVES.length },
      {
        key: "movimentos_minimos_por_problema",
        label: "Movimentos mínimos esperados por problema",
        order: 3,
        value: [...MINIMUM_MOVES]
      },
      {
        key: "regra_pontuacao",
        label: "Regra de pontuação",
        order: 4,
        value: "Acerto na 1ª tentativa: 3 pontos; 2ª tentativa: 2 pontos; 3ª tentativa: 1 ponto; sem acerto após três tentativas: 0 ponto."
      },
      { key: "idade_anos", label: "Idade na data da aplicação", order: 5, value: interpretation.ageYears ?? "Não disponível" },
      { key: "faixa_etaria_normativa", label: "Faixa etária normativa", order: 6, value: interpretation.ageRange ?? "Não aplicável" },
      { key: "amostra_normativa_n", label: "N da amostra normativa", order: 7, value: interpretation.normativeSampleSize ?? "Não aplicável" },
      { key: "media_normativa", label: "Média normativa", order: 8, value: interpretation.normativeMean ?? "Não aplicável" },
      { key: "desvio_padrao_normativo", label: "Desvio-padrão normativo", order: 9, value: interpretation.normativeStandardDeviation ?? "Não aplicável" },
      { key: "escore_z", label: "Escore z", order: 10, value: interpretation.zScore ?? "Não aplicável" },
      { key: "classificacao_normativa", label: "Classificação normativa", order: 11, value: interpretation.normativeClassification },
      { key: "status_desempenho", label: "Status do desempenho", order: 12, value: interpretation.performanceStatus },
      { key: "interpretacao_principal", label: "Interpretação clínica principal", order: 13, value: interpretation.mainInterpretation },
      { key: "perfil_execucao", label: "Perfil de execução", order: 14, value: interpretation.executionProfile },
      { key: "interpretacao_tentativas", label: "Interpretação do padrão de tentativas", order: 15, value: interpretation.attemptInterpretation },
      { key: "observacoes_qualitativas", label: "Observações qualitativas", order: 16, value: qualitativeObservations },
      { key: "acertos_primeira_tentativa", label: "Acertos na 1ª tentativa", order: 17, value: attemptSummary.firstAttemptHits },
      { key: "acertos_segunda_tentativa", label: "Acertos na 2ª tentativa", order: 18, value: attemptSummary.secondAttemptHits },
      { key: "acertos_terceira_tentativa", label: "Acertos na 3ª tentativa", order: 19, value: attemptSummary.thirdAttemptHits },
      { key: "erros_apos_tres_tentativas", label: "Erros após três tentativas", order: 20, value: attemptSummary.failuresAfterThreeAttempts },
      { key: "problemas_corrigidos_apos_erro", label: "Problemas resolvidos após erro inicial", order: 21, value: attemptSummary.solvedAfterInitialError },
      { key: "tentativas_sem_solucao_no_limite", label: "Tentativas sem solução no limite mínimo", order: 22, value: attemptSummary.unsuccessfulAttempts },
      { key: "problemas_com_erro_repetido", label: "Problemas com repetição da mesma configuração incorreta", order: 23, value: attemptSummary.itemsWithRepeatedErrors },
      {
        key: "tempo_medio_planejamento_segundos",
        label: "Tempo médio antes do primeiro movimento",
        order: 24,
        value: attemptSummary.meanPlanningTimeSeconds ?? "Não disponível"
      },
      {
        key: "interpretacao_temporal",
        label: "Nota sobre perfil temporal",
        order: 25,
        value: "O tempo antes do primeiro movimento foi registrado, mas os perfis impulsivo e lento/cauteloso não foram classificados automaticamente porque não foram fornecidos pontos de corte temporais."
      },
      { key: "criterio_classificacao", label: "Critério da classificação normativa", order: 26, value: interpretation.classificationCriterion },
      {
        key: "desempenho_por_problema",
        label: "Desempenho por problema",
        order: 27,
        value: (Array.isArray(itemResults) ? itemResults : []).map(item => ({ ...item }))
      }
    ];
  }

  const api = Object.freeze({
    AGE_NORMS,
    MAX_ATTEMPTS,
    MAX_SCORE,
    MINIMUM_MOVES,
    buildResultsMetaPayload,
    buildInterpretation,
    calculateAgeYears,
    calculateZScore,
    classifyZScore,
    getNormForAge,
    isCorrectSolution,
    summarizeAttempts
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.TOLScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

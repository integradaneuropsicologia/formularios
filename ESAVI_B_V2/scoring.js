(function initializeEsaviBScoring(globalScope) {
  "use strict";

  const NORMS = Object.freeze({
    F1: [
      { max: 14, percentile: "Até o percentil 20", classification: "Extremo inferior" },
      { max: 20, percentile: "Percentis 21 a 40", classification: "Baixo" },
      { max: 30, percentile: "Percentis 41 a 60", classification: "Médio" },
      { max: 37, percentile: "Percentis 61 a 80", classification: "Alto" },
      { max: Infinity, percentile: "A partir do percentil 81", classification: "Extremo superior" }
    ],
    F2: [
      { max: 22, percentile: "Até o percentil 20", classification: "Extremo inferior" },
      { max: 28, percentile: "Percentis 21 a 40", classification: "Baixo" },
      { max: 36, percentile: "Percentis 41 a 60", classification: "Médio" },
      { max: 39, percentile: "Percentis 61 a 80", classification: "Alto" },
      { max: Infinity, percentile: "A partir do percentil 81", classification: "Extremo superior" }
    ],
    F3: [
      { max: 9, percentile: "Até o percentil 20", classification: "Extremo inferior" },
      { max: 13, percentile: "Percentis 21 a 40", classification: "Baixo" },
      { max: 19, percentile: "Percentis 41 a 60", classification: "Médio" },
      { max: 22, percentile: "Percentis 61 a 80", classification: "Alto" },
      { max: Infinity, percentile: "A partir do percentil 81", classification: "Extremo superior" }
    ],
    F4: [
      { max: 10, percentile: "Até o percentil 20", classification: "Extremo inferior" },
      { max: 13, percentile: "Percentis 21 a 40", classification: "Baixo" },
      { max: 19, percentile: "Percentis 41 a 60", classification: "Médio" },
      { max: 22, percentile: "Percentis 61 a 80", classification: "Alto" },
      { max: Infinity, percentile: "A partir do percentil 81", classification: "Extremo superior" }
    ]
  });

  const INTERPRETATIONS = Object.freeze({
    F1: {
      "Extremo inferior": "Indica concentração e persistência muito elevadas. A meticulosidade excessiva pode, em algumas situações, dificultar a conclusão das tarefas.",
      "Baixo": "Indica boa capacidade de concentração, manutenção do foco, constância e conclusão das tarefas.",
      "Médio": "Indica funcionamento dentro da faixa média quanto à concentração, persistência e continuidade das tarefas.",
      "Alto": "Indica maior dificuldade para manter o foco, persistir e concluir tarefas, com tendência à dispersão e à distração.",
      "Extremo superior": "Indica dificuldade acentuada para manter o foco e concluir tarefas, com baixa persistência e risco de comprometer a finalização das atividades."
    },
    F2: {
      "Extremo inferior": "Indica tendência acentuada a agir de modo precipitado, com pouco planejamento, análise prévia e cuidado na tomada de decisões.",
      "Baixo": "Indica menor tendência a refletir, planejar e avaliar cuidadosamente as situações antes de agir.",
      "Médio": "Indica funcionamento dentro da faixa média quanto à reflexão, ao planejamento e à avaliação das ações.",
      "Alto": "Indica cautela, cuidado e tendência a refletir antes de agir, decidir ou expressar opiniões.",
      "Extremo superior": "Indica cautela e planejamento muito elevados, que podem dificultar ou retardar a tomada de decisões."
    },
    F3: {
      "Extremo inferior": "Indica pouca consideração pelo futuro e pelas consequências das ações presentes, com planejamento futuro muito reduzido.",
      "Baixo": "Indica menor preocupação em projetar ações e considerar consequências futuras.",
      "Médio": "Indica funcionamento dentro da faixa média quanto ao planejamento futuro e à antecipação de consequências.",
      "Alto": "Indica tendência a planejar ações e considerar as consequências futuras das decisões presentes.",
      "Extremo superior": "Indica preocupação muito elevada com o futuro, podendo haver maior atenção ao que poderá acontecer do que ao momento presente."
    },
    F4: {
      "Extremo inferior": "Indica cautela muito elevada diante de riscos, que pode dificultar ações rápidas quando elas são necessárias.",
      "Baixo": "Indica postura precavida e cautelosa, com atenção aos riscos para si e para outras pessoas.",
      "Médio": "Indica funcionamento dentro da faixa média quanto à busca de novidades, ousadia e exposição a riscos.",
      "Alto": "Indica maior ousadia e busca de riscos, com possibilidade de menor consideração pelas consequências.",
      "Extremo superior": "Indica tendência acentuada a assumir riscos e agir de forma temerária, podendo expor a si ou outras pessoas a consequências negativas."
    }
  });

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 31) {
      throw new Error("A EsAvI deve conter exatamente 31 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 5) {
      throw new Error("A EsAvI deve conter exatamente 5 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (scores.join(",") !== "1,2,3,4,5") {
      throw new Error("As alternativas da EsAvI devem valer de 1 a 5.");
    }

    if (!Array.isArray(data.factors) || data.factors.length !== 4) {
      throw new Error("A EsAvI deve conter exatamente 4 fatores.");
    }

    const itemNumbers = data.factors.flatMap((factor) => factor.itemNumbers);
    const expected = Array.from({ length: 31 }, (_, index) => index + 1);
    const unique = [...new Set(itemNumbers)].sort((a, b) => a - b);

    if (itemNumbers.length !== 31 || unique.join(",") !== expected.join(",")) {
      throw new Error("Cada item da EsAvI deve pertencer a exatamente um fator.");
    }

    data.factors.forEach((factor) => {
      factor.reverseItemNumbers.forEach((itemNumber) => {
        if (!factor.itemNumbers.includes(itemNumber)) {
          throw new Error(`O item invertido ${itemNumber} não pertence ao ${factor.code}.`);
        }
      });
    });
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function classifyFactor(code, score) {
    const band = NORMS[code]?.find((entry) => score <= entry.max);
    if (!band) {
      throw new Error(`Não foi possível classificar o fator ${code}.`);
    }

    return {
      percentile: band.percentile,
      classification: band.classification,
      interpretation: INTERPRETATIONS[code][band.classification]
    };
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    const answerScores = new Map();
    let answeredCount = 0;

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      if (option) {
        answeredCount += 1;
        answerScores.set(question.number, Number(option.score));
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null
      };
    });

    const factors = data.factors.map((factor) => {
      const reverseItems = new Set(factor.reverseItemNumbers);
      const rawScore = factor.itemNumbers.reduce((total, itemNumber) => {
        const score = answerScores.get(itemNumber);
        if (!Number.isFinite(score)) return total;
        return total + (reverseItems.has(itemNumber) ? 6 - score : score);
      }, 0);
      const result = classifyFactor(factor.code, rawScore);

      return {
        code: factor.code,
        name: factor.name,
        rawScore,
        scoreTotal: rawScore,
        percentile: result.percentile,
        classification: result.classification,
        interpretation: result.interpretation
      };
    });

    return {
      rows,
      factors,
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

  function slugFactor(factor) {
    return `fator_${factor.code.slice(1)}_${factor.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")}`;
  }

  function buildResultsMetaPayload(scored) {
    requireComplete(scored);

    return Object.fromEntries(scored.factors.map((factor) => [
      slugFactor(factor),
      {
        fator: `Fator ${factor.code.slice(1)} - ${factor.name}`,
        pontos_brutos: factor.rawScore,
        score_total: factor.scoreTotal,
        percentil: factor.percentile,
        classificacao: factor.classification,
        interpretacao: factor.interpretation
      }
    ]));
  }

  const api = Object.freeze({
    buildResultsMetaPayload,
    buildResultsPayload,
    classifyFactor,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.ESAVIBScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializeIdcp2Scoring(globalScope) {
  "use strict";

  const DIMENSIONS = Object.freeze({
    dependencia: [
      "A018", "A021", "A070", "B178", "i402", "i403", "i406", "i407", "i408",
      "i416", "i417", "i418", "i419", "i420", "i425", "i426", "i435", "i436"
    ],
    agressividade: [
      "A014", "A052", "A067", "A107", "B159", "B172", "B176", "B212", "B215",
      "i504", "i506", "i507", "i508", "i516", "i517", "i520"
    ],
    instabilidade_de_humor: [
      "A064", "A095", "B120", "B151", "B171", "B173", "i560", "i561", "i562",
      "i565", "i566", "i567", "i571", "i579", "i581", "i586"
    ],
    excentricidade: [
      "A028", "A031", "A032", "A082", "B137", "B138", "B190", "B191", "B193",
      "i488", "i625", "i626", "i627", "i629", "i630", "i634", "i638", "i639"
    ],
    necessidade_de_atencao: [
      "B147", "B198", "B199", "i334", "i335", "i341", "i342", "i348", "i349",
      "i351", "i359", "i362", "i364"
    ],
    desconfianca: [
      "A101", "A102", "A103", "B154", "B195", "B211", "i525", "i530", "i537",
      "i539", "i540", "i541", "i542", "i546", "i549", "i551", "i552", "i553"
    ],
    grandiosidade: [
      "A059", "A062", "A096", "B115", "i341", "i587", "i592", "i594", "i596",
      "i597", "i598", "i605", "i606", "i607", "i610", "i611", "i612", "i616"
    ],
    isolamento: [
      "A058", "A077", "A099", "B111", "B133", "B207", "i437", "i438", "i439",
      "i441", "i444", "i445", "i446", "i449", "i456", "i457", "i458", "i459"
    ],
    evitacao_a_criticas: [
      "A034", "A083", "i466", "i468", "i469", "i470", "i471", "i477", "i481",
      "i483", "i486", "i487", "i488", "i489", "i494", "i496", "i499", "i503"
    ],
    autossacrificio: [
      "A069", "B125", "B149", "B204", "i366", "i367", "i369", "i372", "i373",
      "i374", "i375", "i376", "i377", "i380", "i385", "i387", "i394", "i396"
    ],
    conscienciosidade: [
      "A001", "A003", "A055", "A056", "A104", "B131", "B165", "i304", "i305",
      "i306", "i313", "i314", "i315", "i317", "i318", "i319", "i321", "i322",
      "i323", "i328", "i329", "i331", "i332"
    ],
    inconsequencia: [
      "B117", "i643", "i644", "i645", "i648", "i650", "i658", "i659", "i660",
      "i662", "i663", "i664", "i670", "i671", "i672", "i674", "i676", "i679"
    ]
  });

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 210) {
      throw new Error("O IDCP-2 deve conter exatamente 210 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 4) {
      throw new Error("O IDCP-2 deve conter exatamente 4 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (scores.join(",") !== "1,2,3,4") {
      throw new Error("As alternativas do IDCP-2 devem valer de 1 a 4.");
    }

    const itemCodes = new Set();

    data.questions.forEach((question, index) => {
      if (question.number !== index + 1 || question.id !== `item_${index + 1}`) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!/^(?:A|B|i)\d{3}$/.test(question.code || "")) {
        throw new Error(`Código inválido no item ${index + 1}.`);
      }

      if (itemCodes.has(question.code)) {
        throw new Error(`Código repetido no item ${index + 1}.`);
      }
      itemCodes.add(question.code);

      if (!String(question.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });

    Object.entries(DIMENSIONS).forEach(([dimension, codes]) => {
      if (new Set(codes).size !== codes.length) {
        throw new Error(`A dimensão ${dimension} contém códigos repetidos.`);
      }

      codes.forEach((code) => {
        if (!itemCodes.has(code)) {
          throw new Error(`O código ${code} da dimensão ${dimension} não existe no formulário.`);
        }
      });
    });
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);
    let answeredCount = 0;
    const itemScores = {};

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      if (option) {
        answeredCount += 1;
        itemScores[question.code] = Number(option.score);
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null
      };
    });

    const dimensionScores = Object.fromEntries(
      Object.entries(DIMENSIONS).map(([dimension, codes]) => [
        dimension,
        codes.reduce((total, code) => total + (itemScores[code] ?? 0), 0)
      ])
    );

    return {
      rows,
      dimensionScores,
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
    return { ...scored.dimensionScores };
  }

  const api = Object.freeze({
    DIMENSIONS,
    buildResultsMetaPayload,
    buildResultsPayload,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.IDCP2Scoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializePaiScoring(globalScope) {
  "use strict";

  const ITEM_GROUPS = Object.freeze({
    validade_infrequencia: [40, 80, 120, 160, 200, 240, 280, 320],
    validade_impressao_negativa: [9, 49, 89, 129, 169, 209, 249, 289, 329],
    validade_impressao_positiva: [24, 64, 104, 144, 184, 224, 264, 304, 344],

    queixas_somaticas_conversao: [3, 43, 83, 123, 163, 203, 243, 283],
    queixas_somaticas_somatizacao: [32, 72, 112, 152, 192, 232, 272, 312],
    queixas_somaticas_preocupacoes_saude: [12, 52, 92, 132, 172, 212, 252, 292],

    ansiedade_cognitiva: [25, 65, 105, 145, 185, 225, 265, 305],
    ansiedade_afetiva: [4, 44, 84, 124, 164, 204, 244, 284],
    ansiedade_fisiologica: [33, 73, 113, 153, 193, 233, 273, 313],

    transtornos_ansiedade_obsessivo_compulsivo: [5, 45, 85, 125, 165, 205, 245, 285],
    transtornos_ansiedade_fobias: [26, 66, 106, 146, 186, 226, 266, 306],
    transtornos_ansiedade_estresse_traumatico: [34, 74, 114, 154, 194, 234, 274, 314],

    depressao_cognitiva: [27, 67, 107, 147, 187, 227, 267, 307],
    depressao_afetiva: [6, 46, 86, 126, 166, 206, 246, 286],
    depressao_fisiologica: [35, 75, 115, 155, 195, 235, 275, 315],

    mania_nivel_atividade: [7, 47, 87, 127, 167, 207, 247, 287],
    mania_grandiosidade: [28, 68, 108, 148, 188, 228, 268, 308],
    mania_irritabilidade: [36, 76, 116, 156, 196, 236, 316, 332],

    paranoia_hipervigilancia: [8, 48, 88, 128, 168, 208, 248, 288],
    paranoia_perseguicao: [29, 69, 109, 149, 189, 229, 269, 309],
    paranoia_ressentimento: [37, 77, 117, 157, 197, 237, 276, 277],

    esquizofrenia_experiencias_psicoticas: [10, 50, 90, 130, 170, 210, 250, 290],
    esquizofrenia_isolamento_social: [30, 70, 110, 150, 190, 230, 270, 310],
    esquizofrenia_transtorno_pensamento: [38, 78, 118, 158, 198, 238, 278, 318],

    borderline_instabilidade_afetiva: [14, 54, 94, 134, 174, 214],
    borderline_problemas_identidade: [17, 57, 97, 137, 177, 217],
    borderline_relacoes_problematicas: [19, 59, 99, 139, 179, 231],
    borderline_autoagressao_impulsividade: [143, 183, 223, 263, 303, 343],

    antissociais_condutas_antissociais: [11, 31, 51, 91, 131, 211, 251, 291],
    antissociais_egocentrismo: [71, 111, 151, 171, 191, 271, 311, 317],
    antissociais_busca_sensacoes: [39, 79, 119, 159, 199, 239, 279, 319],

    problemas_alcool: [15, 55, 95, 135, 175, 215, 254, 255, 294, 295, 334, 335],
    problemas_drogas: [22, 23, 62, 63, 102, 103, 142, 182, 222, 262, 302, 342],

    agressividade_atitude_agressiva: [258, 259, 298, 299, 338, 339],
    agressividade_verbal: [18, 58, 98, 138, 178, 218],
    agressividade_fisica: [21, 61, 101, 141, 181, 221],
    ideacao_suicida: [20, 60, 100, 140, 180, 220, 260, 261, 300, 301, 340, 341],
    estresse: [321, 322, 323, 324, 325, 326, 327, 328],
    falta_suporte_social: [1, 41, 81, 121, 161, 201, 241, 281],
    rejeicao_resistencia_tratamento: [2, 42, 82, 122, 162, 202, 242, 282],

    dominancia: [16, 56, 96, 136, 176, 216, 256, 257, 296, 297, 336, 337],
    calor_amabilidade_interpessoal: [13, 53, 93, 133, 173, 213, 219, 253, 293, 330, 331, 333]
  });

  const COMPOSITE_SCALES = Object.freeze({
    queixas_somaticas_total: [
      "queixas_somaticas_conversao",
      "queixas_somaticas_somatizacao",
      "queixas_somaticas_preocupacoes_saude"
    ],
    ansiedade_total: ["ansiedade_cognitiva", "ansiedade_afetiva", "ansiedade_fisiologica"],
    transtornos_relacionados_ansiedade_total: [
      "transtornos_ansiedade_obsessivo_compulsivo",
      "transtornos_ansiedade_fobias",
      "transtornos_ansiedade_estresse_traumatico"
    ],
    depressao_total: ["depressao_cognitiva", "depressao_afetiva", "depressao_fisiologica"],
    mania_total: ["mania_nivel_atividade", "mania_grandiosidade", "mania_irritabilidade"],
    paranoia_total: ["paranoia_hipervigilancia", "paranoia_perseguicao", "paranoia_ressentimento"],
    esquizofrenia_total: [
      "esquizofrenia_experiencias_psicoticas",
      "esquizofrenia_isolamento_social",
      "esquizofrenia_transtorno_pensamento"
    ],
    caracteristicas_borderline_total: [
      "borderline_instabilidade_afetiva",
      "borderline_problemas_identidade",
      "borderline_relacoes_problematicas",
      "borderline_autoagressao_impulsividade"
    ],
    caracteristicas_antissociais_total: [
      "antissociais_condutas_antissociais",
      "antissociais_egocentrismo",
      "antissociais_busca_sensacoes"
    ],
    agressividade_total: [
      "agressividade_atitude_agressiva",
      "agressividade_verbal",
      "agressividade_fisica"
    ]
  });

  const REVERSED_ITEMS = Object.freeze([
    1, 2, 8, 11, 18, 24, 32, 37, 41, 42, 63, 64, 75, 77, 80, 81, 82, 88,
    94, 103, 104, 109, 112, 115, 121, 122, 124, 125, 128, 136, 139, 142, 144,
    146, 152, 160, 161, 162, 164, 172, 173, 174, 178, 184, 185, 186, 190, 193,
    197, 201, 211, 213, 216, 217, 218, 221, 224, 225, 226, 227, 229, 230, 235,
    237, 240, 242, 244, 246, 252, 257, 259, 264, 267, 270, 277, 287, 290, 291,
    294, 295, 298, 299, 301, 304, 306, 307, 308, 310, 313, 318, 319, 320, 326,
    334, 336, 341, 342, 343
  ]);

  function validateData(data) {
    if (!data || !Array.isArray(data.questions) || data.questions.length !== 344) {
      throw new Error("O PAI deve conter exatamente 344 itens.");
    }

    if (!Array.isArray(data.responses) || data.responses.length !== 4) {
      throw new Error("O PAI deve conter exatamente 4 alternativas.");
    }

    const scores = data.responses.map((option) => Number(option.score));
    if (scores.join(",") !== "0,1,2,3") {
      throw new Error("As alternativas do PAI devem valer de 0 a 3.");
    }

    data.questions.forEach((question, index) => {
      if (question.number !== index + 1 || question.id !== `item_${index + 1}`) {
        throw new Error(`Sequência inválida no item ${index + 1}.`);
      }

      if (!String(question.text || "").trim()) {
        throw new Error(`O item ${index + 1} está sem texto.`);
      }
    });

    const assignedItems = new Set();
    Object.entries(ITEM_GROUPS).forEach(([group, items]) => {
      if (new Set(items).size !== items.length) {
        throw new Error(`O grupo ${group} contém itens repetidos.`);
      }

      items.forEach((item) => {
        if (!Number.isInteger(item) || item < 1 || item > data.questions.length) {
          throw new Error(`O item ${item} do grupo ${group} é inválido.`);
        }

        if (assignedItems.has(item)) {
          throw new Error(`O item ${item} foi associado a mais de um grupo de pontuação.`);
        }
        assignedItems.add(item);
      });
    });

    if (assignedItems.size !== data.questions.length) {
      const missingItems = data.questions
        .map((question) => question.number)
        .filter((item) => !assignedItems.has(item));
      throw new Error(`Há itens sem grupo de pontuação: ${missingItems.join(", ")}.`);
    }

    Object.entries(COMPOSITE_SCALES).forEach(([scale, groups]) => {
      groups.forEach((group) => {
        if (!ITEM_GROUPS[group]) {
          throw new Error(`O grupo ${group} da escala ${scale} não existe.`);
        }
      });
    });

    if (new Set(REVERSED_ITEMS).size !== REVERSED_ITEMS.length) {
      throw new Error("A lista de itens invertidos contém repetições.");
    }

    REVERSED_ITEMS.forEach((item) => {
      if (!Number.isInteger(item) || item < 1 || item > data.questions.length) {
        throw new Error(`O item invertido ${item} é inválido.`);
      }
    });
  }

  function getResponseOption(data, value) {
    return data.responses.find((option) => option.value === value) || null;
  }

  function correctedItemScore(item, score) {
    const numericScore = Number(score);
    return REVERSED_ITEMS.includes(item) ? 3 - numericScore : numericScore;
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);
    let answeredCount = 0;
    const itemScores = {};

    const rows = data.questions.map((question) => {
      const option = getResponseOption(data, responses[question.id]);
      if (option) {
        answeredCount += 1;
        itemScores[question.number] = correctedItemScore(question.number, option.score);
      }

      return {
        pergunta: question.text,
        resposta: option?.label || null
      };
    });

    const groupScores = Object.fromEntries(
      Object.entries(ITEM_GROUPS).map(([group, items]) => [
        group,
        items.reduce((total, item) => total + (itemScores[item] ?? 0), 0)
      ])
    );

    const compositeScores = Object.fromEntries(
      Object.entries(COMPOSITE_SCALES).map(([scale, groups]) => [
        scale,
        groups.reduce((total, group) => total + groupScores[group], 0)
      ])
    );

    return {
      rows,
      itemScores,
      groupScores,
      compositeScores,
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
    return {
      ...scored.groupScores,
      ...scored.compositeScores
    };
  }

  const api = Object.freeze({
    COMPOSITE_SCALES,
    ITEM_GROUPS,
    REVERSED_ITEMS,
    buildResultsMetaPayload,
    buildResultsPayload,
    correctedItemScore,
    getResponseOption,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.PAIScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

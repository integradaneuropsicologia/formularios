(function initializeIsslScoring(globalScope) {
  "use strict";

  const EXPECTED_SECTION_LENGTHS = [15, 15, 23];
  const EXPECTED_TYPE_LENGTHS = [
    { fisico: 12, psicologico: 3 },
    { fisico: 10, psicologico: 5 },
    { fisico: 12, psicologico: 11 }
  ];

  function validateData(data) {
    if (!data || data.formCode !== "ISSL_V2") {
      throw new Error("Os dados do ISSL não foram carregados corretamente.");
    }

    if (!Array.isArray(data.sections) || data.sections.length !== 3) {
      throw new Error("O ISSL deve conter exatamente três quadros.");
    }

    if (!Array.isArray(data.responseOptions) || data.responseOptions.length !== 2) {
      throw new Error("O ISSL deve usar exatamente duas alternativas.");
    }

    if (
      data.responseOptions[0]?.value !== "sim" ||
      Number(data.responseOptions[0]?.score) !== 1 ||
      data.responseOptions[1]?.value !== "nao" ||
      Number(data.responseOptions[1]?.score) !== 0
    ) {
      throw new Error("As alternativas do ISSL devem usar Sim = 1 e Não = 0.");
    }

    data.sections.forEach((section, sectionIndex) => {
      const expectedLength = EXPECTED_SECTION_LENGTHS[sectionIndex];
      if (section.id !== `quadro_${sectionIndex + 1}` || section.number !== sectionIndex + 1) {
        throw new Error(`Identificação inválida no quadro ${sectionIndex + 1}.`);
      }

      if (!Array.isArray(section.items) || section.items.length !== expectedLength) {
        throw new Error(`O quadro ${sectionIndex + 1} deve conter ${expectedLength} itens.`);
      }

      const typeCounts = { fisico: 0, psicologico: 0 };
      section.items.forEach((item, itemIndex) => {
        if (
          item.id !== `${section.id}_item_${itemIndex + 1}` ||
          item.number !== itemIndex + 1 ||
          !String(item.text || "").trim()
        ) {
          throw new Error(`Item inválido no quadro ${sectionIndex + 1}, posição ${itemIndex + 1}.`);
        }

        if (!Object.hasOwn(typeCounts, item.type)) {
          throw new Error(`Tipo inválido no item ${item.id}.`);
        }
        typeCounts[item.type] += 1;
      });

      const expectedTypes = EXPECTED_TYPE_LENGTHS[sectionIndex];
      if (
        typeCounts.fisico !== expectedTypes.fisico ||
        typeCounts.psicologico !== expectedTypes.psicologico
      ) {
        throw new Error(`Distribuição física/psicológica inválida no quadro ${sectionIndex + 1}.`);
      }
    });
  }

  function findOption(options, value) {
    return options.find((option) => option.value === value) || null;
  }

  function getAllItems(data) {
    return data.sections.flatMap((section) => section.items);
  }

  function getRequiredIds(data) {
    return getAllItems(data).map((item) => item.id);
  }

  function scoreResponses(data, responses = {}) {
    validateData(data);

    const rows = [];
    const requiredIds = getRequiredIds(data);
    const missingIds = requiredIds.filter((id) => !findOption(data.responseOptions, responses[id]));
    let totalBruto = 0;

    const sectionScores = data.sections.map((section) => {
      const score = {
        id: section.id,
        fisicosBruto: 0,
        psicologicosBruto: 0,
        totalBruto: 0
      };

      section.items.forEach((item) => {
        const option = findOption(data.responseOptions, responses[item.id]);
        const itemScore = option ? Number(option.score) : 0;

        if (item.type === "fisico") {
          score.fisicosBruto += itemScore;
        } else {
          score.psicologicosBruto += itemScore;
        }

        score.totalBruto += itemScore;
        totalBruto += itemScore;
        rows.push({
          pergunta: `${section.questionPrefix}: ${item.text}`,
          resposta: option?.label || null
        });
      });

      return score;
    });

    return {
      rows,
      sectionScores,
      totalBruto,
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
    const [quadro1, quadro2, quadro3] = scored.sectionScores;

    return {
      issl_total_bruto: scored.totalBruto,
      quadro_1_fisicos_bruto: quadro1.fisicosBruto,
      quadro_1_psicologicos_bruto: quadro1.psicologicosBruto,
      quadro_1_total_bruto: quadro1.totalBruto,
      quadro_2_fisicos_bruto: quadro2.fisicosBruto,
      quadro_2_psicologicos_bruto: quadro2.psicologicosBruto,
      quadro_2_total_bruto: quadro2.totalBruto,
      quadro_3_fisicos_bruto: quadro3.fisicosBruto,
      quadro_3_psicologicos_bruto: quadro3.psicologicosBruto,
      quadro_3_total_bruto: quadro3.totalBruto
    };
  }

  const api = Object.freeze({
    buildResultsMetaPayload,
    buildResultsPayload,
    findOption,
    getAllItems,
    getRequiredIds,
    scoreResponses,
    validateData
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.ISSLScoring = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

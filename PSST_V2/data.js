(function initializePsstData(globalScope) {
  "use strict";

  const data = {
    formCode: "PSST_V2",
    formName: "PSST - Instrumento de Triagem de Sintomas Pré-Menstruais",
    title: "Instrumento de Triagem de Sintomas Pré-Menstruais",
    shortTitle: "PSST",
    sections: [
      {
        id: "temporalidade",
        eyebrow: "Antes de começar",
        title: "Padrão temporal",
        description: "Confirme quando os sintomas costumam ocorrer."
      },
      {
        id: "sintomas",
        eyebrow: "Parte 1",
        title: "Sintomas pré-menstruais",
        description: "Classifique a intensidade de cada sintoma."
      },
      {
        id: "prejuizo",
        eyebrow: "Parte 2",
        title: "Interferência no funcionamento",
        description: "Considere o impacto dos sintomas durante o período pré-menstrual."
      }
    ],
    responseSets: {
      temporal: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" }
      ],
      severity: [
        { value: "nada", label: "Nada", score: 0 },
        { value: "leve", label: "Leve", score: 1 },
        { value: "moderado", label: "Moderado", score: 2 },
        { value: "grave", label: "Grave", score: 3 }
      ]
    },
    questions: [
      {
        id: "padrao_temporal",
        section: "temporalidade",
        displayNumber: "T",
        responseSet: "temporal",
        group: "temporal",
        text: "Você apresenta algum dos sintomas abaixo na semana anterior à menstruação, com melhora ou desaparecimento poucos dias após o início do sangramento?"
      },
      {
        id: "sintoma_1",
        section: "sintomas",
        displayNumber: "1",
        responseSet: "severity",
        group: "symptom",
        core: true,
        text: "Na semana anterior à menstruação, você apresenta raiva ou irritabilidade?"
      },
      {
        id: "sintoma_2",
        section: "sintomas",
        displayNumber: "2",
        responseSet: "severity",
        group: "symptom",
        core: true,
        text: "Você apresenta ansiedade, tensão ou sensação de estar no limite?"
      },
      {
        id: "sintoma_3",
        section: "sintomas",
        displayNumber: "3",
        responseSet: "severity",
        group: "symptom",
        core: true,
        text: "Você apresenta choro fácil, mudanças repentinas de humor ou maior sensibilidade à rejeição?"
      },
      {
        id: "sintoma_4",
        section: "sintomas",
        displayNumber: "4",
        responseSet: "severity",
        group: "symptom",
        core: true,
        text: "Você apresenta humor deprimido, tristeza intensa ou sentimento de desesperança?"
      },
      {
        id: "sintoma_5",
        section: "sintomas",
        displayNumber: "5",
        responseSet: "severity",
        group: "symptom",
        text: "Você percebe diminuição do interesse pelas atividades de trabalho ou estudo?"
      },
      {
        id: "sintoma_6",
        section: "sintomas",
        displayNumber: "6",
        responseSet: "severity",
        group: "symptom",
        text: "Você percebe diminuição do interesse pelas atividades domésticas?"
      },
      {
        id: "sintoma_7",
        section: "sintomas",
        displayNumber: "7",
        responseSet: "severity",
        group: "symptom",
        text: "Você percebe diminuição do interesse por atividades sociais, amigos ou lazer?"
      },
      {
        id: "sintoma_8",
        section: "sintomas",
        displayNumber: "8",
        responseSet: "severity",
        group: "symptom",
        text: "Você apresenta dificuldade de concentração?"
      },
      {
        id: "sintoma_9",
        section: "sintomas",
        displayNumber: "9",
        responseSet: "severity",
        group: "symptom",
        text: "Você apresenta fadiga, cansaço acentuado ou falta de energia?"
      },
      {
        id: "sintoma_10",
        section: "sintomas",
        displayNumber: "10",
        responseSet: "severity",
        group: "symptom",
        text: "Você apresenta aumento do apetite, alimentação excessiva ou desejos específicos por alimentos?"
      },
      {
        id: "sintoma_11",
        section: "sintomas",
        displayNumber: "11",
        responseSet: "severity",
        group: "symptom",
        text: "Você apresenta insônia ou dificuldade para dormir?"
      },
      {
        id: "sintoma_12",
        section: "sintomas",
        displayNumber: "12",
        responseSet: "severity",
        group: "symptom",
        text: "Você apresenta hipersonia ou necessidade de dormir mais que o habitual?"
      },
      {
        id: "sintoma_13",
        section: "sintomas",
        displayNumber: "13",
        responseSet: "severity",
        group: "symptom",
        text: "Você se sente sobrecarregada ou sem controle sobre si mesma e sobre as situações?"
      },
      {
        id: "sintoma_14",
        section: "sintomas",
        displayNumber: "14",
        responseSet: "severity",
        group: "symptom",
        text: "Você apresenta sintomas físicos, como sensibilidade ou inchaço nas mamas, dor de cabeça, dores musculares ou articulares, inchaço abdominal ou ganho de peso?"
      },
      {
        id: "prejuizo_a",
        section: "prejuizo",
        displayNumber: "A",
        responseSet: "severity",
        group: "impairment",
        text: "Em que intensidade esses sintomas interferem na sua eficiência ou produtividade no trabalho ou estudo?"
      },
      {
        id: "prejuizo_b",
        section: "prejuizo",
        displayNumber: "B",
        responseSet: "severity",
        group: "impairment",
        text: "Em que intensidade esses sintomas interferem no relacionamento com colegas de trabalho ou estudo?"
      },
      {
        id: "prejuizo_c",
        section: "prejuizo",
        displayNumber: "C",
        responseSet: "severity",
        group: "impairment",
        text: "Em que intensidade esses sintomas interferem no relacionamento com familiares?"
      },
      {
        id: "prejuizo_d",
        section: "prejuizo",
        displayNumber: "D",
        responseSet: "severity",
        group: "impairment",
        text: "Em que intensidade esses sintomas interferem nas atividades sociais e de lazer?"
      },
      {
        id: "prejuizo_e",
        section: "prejuizo",
        displayNumber: "E",
        responseSet: "severity",
        group: "impairment",
        text: "Em que intensidade esses sintomas interferem nas responsabilidades domésticas?"
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.PSSTData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

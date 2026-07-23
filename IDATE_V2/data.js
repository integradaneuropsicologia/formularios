(function initializeIdateData(globalScope) {
  "use strict";

  const data = {
    formCode: "IDATE_V2",
    formName: "IDATE - Inventário de Ansiedade Traço",
    title: "Inventário de Ansiedade Traço",
    shortTitle: "IDATE",
    prompt: "Assinale a alternativa que melhor indica como você geralmente se sente.",
    questions: [
      {
        id: "item_1",
        text: "Sinto-me bem",
        reverse: true
      },
      {
        id: "item_2",
        text: "Canso-me facilmente",
        reverse: false
      },
      {
        id: "item_3",
        text: "Tenho vontade de chorar",
        reverse: false
      },
      {
        id: "item_4",
        text: "Gostaria de poder ser tão feliz quanto os outros parecem ser",
        reverse: false
      },
      {
        id: "item_5",
        text: "Perco oportunidades porque não consigo tomar decisões rapidamente",
        reverse: false
      },
      {
        id: "item_6",
        text: "Sinto-me descansado",
        reverse: true
      },
      {
        id: "item_7",
        text: "Sou calmo, ponderado e senhor de mim mesmo",
        reverse: true
      },
      {
        id: "item_8",
        text: "Sinto que as dificuldades estão se acumulando de tal forma que não consigo resolvê-las",
        reverse: false
      },
      {
        id: "item_9",
        text: "Preocupo-me demais com coisas sem importância",
        reverse: false
      },
      {
        id: "item_10",
        text: "Sou feliz",
        reverse: true
      },
      {
        id: "item_11",
        text: "Deixo-me afetar muito pelas coisas",
        reverse: false
      },
      {
        id: "item_12",
        text: "Não tenho muita confiança em mim mesmo",
        reverse: false
      },
      {
        id: "item_13",
        text: "Sinto-me seguro",
        reverse: true
      },
      {
        id: "item_14",
        text: "Evito ter que enfrentar crises ou problemas",
        reverse: false
      },
      {
        id: "item_15",
        text: "Sinto-me deprimido",
        reverse: false
      },
      {
        id: "item_16",
        text: "Estou satisfeito",
        reverse: true
      },
      {
        id: "item_17",
        text: "Às vezes, ideias sem importância me entrar na cabeça e ficam me preocupando",
        reverse: false
      },
      {
        id: "item_18",
        text: "Levo os desapontamentos tão a sério que não consigo tirá-los da cabeça",
        reverse: false
      },
      {
        id: "item_19",
        text: "Sou uma pessoa estável",
        reverse: true
      },
      {
        id: "item_20",
        text: "Fico tenso e perturbado quando penso em meus problemas do momento",
        reverse: false
      }
    ],
    responses: [
      {
        value: "quase_nunca",
        label: "Quase nunca",
        score: 1
      },
      {
        value: "as_vezes",
        label: "Às vezes",
        score: 2
      },
      {
        value: "frequentemente",
        label: "Frequentemente",
        score: 3
      },
      {
        value: "quase_sempre",
        label: "Quase sempre",
        score: 4
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.IDATEData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

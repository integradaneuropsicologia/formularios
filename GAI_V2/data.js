(function initializeGaiData(globalScope) {
  "use strict";

  const data = {
    formCode: "GAI_V2",
    formName: "GAI - Inventário de Ansiedade Geriátrica",
    title: "Inventário de Ansiedade Geriátrica",
    shortTitle: "GAI",
    prompt: "Leia cada afirmação e escolha a alternativa que melhor descreve como você se sente.",
    questions: [
      {
        id: "item_1",
        text: "Ando preocupado(a) a maior parte do tempo"
      },
      {
        id: "item_2",
        text: "Tenho dificuldades em tomar decisões"
      },
      {
        id: "item_3",
        text: "Sinto-me agitado(a) muitas vezes"
      },
      {
        id: "item_4",
        text: "Tenho dificuldade em relaxar"
      },
      {
        id: "item_5",
        text: "Muitas vezes não consigo apreciar as coisas por causa das minhas preocupações"
      },
      {
        id: "item_6",
        text: "Coisas sem importância preocupam-me bastante"
      },
      {
        id: "item_7",
        text: "Sinto muitas vezes um nervoso miudinho no estômago"
      },
      {
        id: "item_8",
        text: "Vejo-me como uma pessoa preocupada"
      },
      {
        id: "item_9",
        text: "Não consigo deixar de me preocupar, mesmo com coisas menores"
      },
      {
        id: "item_10",
        text: "Frequentemente sinto-me nervoso(a)"
      },
      {
        id: "item_11",
        text: "Os meus próprios pensamentos põem-me ansioso(a) muitas vezes"
      },
      {
        id: "item_12",
        text: "Fico com o estômago às voltas devido à minha preocupação constante"
      },
      {
        id: "item_13",
        text: "Considero-me uma pessoa nervosa"
      },
      {
        id: "item_14",
        text: "Estou sempre à espera que aconteça o pior"
      },
      {
        id: "item_15",
        text: "Muitas vezes sinto-me agitado(a) interiormente"
      },
      {
        id: "item_16",
        text: "Acho que as minhas preocupações interferem com a minha vida"
      },
      {
        id: "item_17",
        text: "Muitas vezes, as minhas preocupações dominam-me"
      },
      {
        id: "item_18",
        text: "Por vezes sinto um nó grande no estômago"
      },
      {
        id: "item_19",
        text: "Deixo de participar nas coisas por me preocupar demasiado"
      },
      {
        id: "item_20",
        text: "Sinto-me aflito(a) muitas vezes"
      }
    ],
    responses: [
      {
        value: "concordo",
        label: "Concordo",
        score: 1
      },
      {
        value: "discordo",
        label: "Discordo",
        score: 0
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.GAIData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

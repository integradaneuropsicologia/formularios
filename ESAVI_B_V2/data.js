(function initializeEsaviBData(globalScope) {
  "use strict";

  const questions = [
    "Perco a concentração facilmente.",
    "Meu pensamento é disperso.",
    "Penso em como estará minha vida daqui a 5 anos.",
    "Planejo minhas ações cuidadosamente.",
    "Fico entediado com facilidade.",
    "Fico nervoso quando tenho que realizar várias atividades ao mesmo tempo.",
    "Penso antes de falar.",
    "Tenho dificuldade em terminar o que começo.",
    "Em salas de espera fico irritado.",
    "Sou uma pessoa ousada.",
    "Sou cauteloso nas minhas atividades.",
    "Em conversas com amigos, penso antes de expressar minhas opiniões.",
    "Defino minhas estratégias antes de agir.",
    "Procuro avaliar os riscos antes de agir.",
    "Perco o interesse rapidamente quando começo uma atividade.",
    "Gosto de atividades que envolvam riscos.",
    "Gosto de prever o que irá acontecer em minha vida.",
    "Sou uma pessoa ansiosa.",
    "Acredito que viver o presente é mais importante do que planejar o futuro.",
    "Tenho dificuldade em cumprir as tarefas da vida cotidiana.",
    "Penso mais no futuro do que no presente.",
    "Ajo de forma imediata para conseguir o que quero.",
    "Procuro programar o que tenho a fazer no dia.",
    "Tenho dificuldade em manter a atenção por períodos longos.",
    "Gosto de assumir riscos, mesmo sem obter benefícios com isso.",
    "Durante minhas atividades, me distraio com facilidade.",
    "Realizo minhas vontades, independente de qualquer coisa.",
    "Gosto de buscar sensações novas.",
    "Fico irritado quando tenho que esperar por algo.",
    "Antes de tomar uma decisão, analiso a situação cuidadosamente.",
    "Prefiro viver o presente a pensar no futuro."
  ].map((text, index) => ({
    id: `item_${index + 1}`,
    number: index + 1,
    text
  }));

  const data = {
    formCode: "ESAVI_B_V2",
    formName: "EsAvI-B - Escala de Avaliação da Impulsividade",
    title: "Escala de Avaliação da Impulsividade",
    shortTitle: "EsAvI-B",
    form: "B",
    prompt: "Leia cada afirmação e indique com que frequência ela descreve você.",
    questions,
    responses: [
      { value: "nunca", label: "Nunca", score: 1 },
      { value: "poucas_vezes", label: "Poucas vezes", score: 2 },
      { value: "as_vezes", label: "Às vezes", score: 3 },
      { value: "muitas_vezes", label: "Muitas vezes", score: 4 },
      { value: "sempre", label: "Sempre", score: 5 }
    ],
    factors: [
      {
        code: "F1",
        name: "Falta de concentração e persistência",
        itemNumbers: [1, 2, 5, 6, 8, 9, 15, 18, 20, 24, 26, 29],
        reverseItemNumbers: []
      },
      {
        code: "F2",
        name: "Controle cognitivo",
        itemNumbers: [4, 7, 11, 12, 13, 14, 23, 30],
        reverseItemNumbers: []
      },
      {
        code: "F3",
        name: "Planejamento futuro",
        itemNumbers: [3, 17, 19, 21, 31],
        reverseItemNumbers: [19, 31]
      },
      {
        code: "F4",
        name: "Audácia e temeridade",
        itemNumbers: [10, 16, 22, 25, 27, 28],
        reverseItemNumbers: []
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.ESAVIBData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

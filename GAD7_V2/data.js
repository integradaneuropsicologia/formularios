(function initializeGad7Data(globalScope) {
  "use strict";

  const data = {
    formCode: "GAD7_V2",
    formName: "GAD-7 - Escala de Ansiedade Generalizada",
    title: "Escala de Ansiedade Generalizada",
    shortTitle: "GAD-7",
    timeframe: "Nas últimas duas semanas",
    prompt: "Com que frequência você foi incomodado(a) pelos problemas abaixo?",
    questions: [
      {
        id: "item_1",
        text: "Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)"
      },
      {
        id: "item_2",
        text: "Não ser capaz de impedir ou de controlar as preocupações"
      },
      {
        id: "item_3",
        text: "Preocupar-se muito com diversas coisas"
      },
      {
        id: "item_4",
        text: "Dificuldade para relaxar"
      },
      {
        id: "item_5",
        text: "Ficar tão agitado(a) que se torna difícil permanecer sentado(a)"
      },
      {
        id: "item_6",
        text: "Ficar facilmente aborrecido(a) ou irritado(a)"
      },
      {
        id: "item_7",
        text: "Sentir medo como se algo horrível fosse acontecer"
      }
    ],
    responses: [
      {
        value: "nenhuma_vez",
        label: "Nenhuma vez",
        score: 0
      },
      {
        value: "varios_dias",
        label: "Vários dias",
        score: 1
      },
      {
        value: "mais_da_metade",
        label: "Mais da metade dos dias",
        score: 2
      },
      {
        value: "quase_todos",
        label: "Quase todos os dias",
        score: 3
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.GAD7Data = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

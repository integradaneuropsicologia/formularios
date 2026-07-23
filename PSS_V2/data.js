(function initializePssData(globalScope) {
  "use strict";

  const data = {
    formCode: "PSS_V2",
    formName: "PSS-10 - Escala de Estresse Percebido",
    title: "Escala de Estresse Percebido",
    shortTitle: "PSS-10",
    prompt: "Considere o último mês e escolha a alternativa que melhor representa a frequência de cada situação.",
    questions: [
      {
        id: "item_1",
        text: "No mês passado, com que frequência você ficou chateado(a) por causa de algo que aconteceu inesperadamente?",
        reverse: false
      },
      {
        id: "item_2",
        text: "No mês passado, com que frequência você sentiu que não foi capaz de controlar as coisas importantes em sua vida?",
        reverse: false
      },
      {
        id: "item_3",
        text: "No mês passado, com que frequência você se sentiu nervoso(a) e estressado(a)?",
        reverse: false
      },
      {
        id: "item_4",
        text: "No mês passado, com que frequência você se sentiu confiante quanto à sua capacidade de lidar com seus problemas pessoais?",
        reverse: true
      },
      {
        id: "item_5",
        text: "No mês passado, com que frequência você sentiu que as coisas estavam acontecendo de acordo com a sua vontade?",
        reverse: true
      },
      {
        id: "item_6",
        text: "No mês passado, com que frequência você achou que não conseguiria lidar com todas as coisas que tinha para fazer?",
        reverse: false
      },
      {
        id: "item_7",
        text: "No mês passado, com que frequência você conseguiu controlar as irritações em sua vida?",
        reverse: true
      },
      {
        id: "item_8",
        text: "No mês passado, com que frequência você sentiu que estava no controle das coisas?",
        reverse: true
      },
      {
        id: "item_9",
        text: "No mês passado, com que frequência você ficou irritado(a) por causa de coisas que estavam fora de seu controle?",
        reverse: false
      },
      {
        id: "item_10",
        text: "No mês passado, com que frequência você sentiu que as dificuldades estavam se acumulando tanto que não conseguiria superá-las?",
        reverse: false
      }
    ],
    responses: [
      {
        value: "nunca",
        label: "Nunca",
        score: 0
      },
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
        value: "muito_frequentemente",
        label: "Muito frequentemente",
        score: 4
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.PSSData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

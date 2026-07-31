(function initializeEdeaData(globalScope) {
  "use strict";

  const rawQuestions = [
    "Tento pensar em coisas boas.",
    "Maltrato outras pessoas.",
    "Acho que sou uma pessoa ruim.",
    "Fico com medo disso não passar.",
    "Tento me animar.",
    "Grito/berro.",
    "Acho que eu não tenho valor.",
    "Não consigo entender por que estou assim.",
    "Penso que isso vai passar.",
    "Acho que sou pior do que os outros.",
    "Não consigo pensar direito.",
    "Procuro relaxar.",
    "Culpo os outros por coisas que eles não têm culpa.",
    "Acho que sou incompetente.",
    "Não sei o que fazer."
  ];

  const questions = rawQuestions.map((text, index) => ({
    id: `item_${index + 1}`,
    number: index + 1,
    text
  }));

  const data = {
    formCode: "EDE_A_V2",
    formName: "EDE-A - Escala de Desregulação Emocional - Versão Adultos",
    title: "Escala de Desregulação Emocional",
    shortTitle: "EDE-A",
    prompt: "Quando estou triste eu...",
    questions,
    responses: [
      {
        value: "nenhuma_das_vezes",
        label: "Nenhuma das vezes / Nada",
        score: 0
      },
      {
        value: "um_pouco",
        label: "Um pouco",
        score: 1
      },
      {
        value: "mais_ou_menos",
        label: "Mais ou menos",
        score: 2
      },
      {
        value: "muito",
        label: "Muito",
        score: 3
      },
      {
        value: "sempre",
        label: "Sempre",
        score: 4
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.EDEAData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializeMdqData(globalScope) {
  "use strict";

  const symptomTexts = [
    "Você se sentia tão bem ou tão para cima que outras pessoas pensavam que você não estava no seu jeito normal, ou isso chegou a lhe causar problemas?",
    "Você ficava tão irritado(a) que gritava com as pessoas ou começava brigas ou discussões sem motivo justificado?",
    "Você se sentia muito mais autoconfiante que o normal?",
    "Você precisava de muito menos sono que o normal e não sentia falta dele?",
    "Você falava muito mais ou bem mais rápido que o normal?",
    "Seus pensamentos passavam muito rapidamente e você não conseguia acalmar a mente?",
    "Você se distraía com tanta facilidade com as coisas ao redor que tinha dificuldade para se concentrar ou continuar uma atividade?",
    "Você se sentia com muito mais energia que o normal?",
    "Você ficava muito mais ativo(a) ou fazia muito mais coisas que normalmente?",
    "Você ficava muito mais sociável ou expansivo(a), por exemplo, telefonando para amigos no meio da noite?",
    "Você ficava muito mais interessado(a) em sexo que o normal?",
    "Você fazia coisas incomuns para você, que outras pessoas consideravam exageradas, arriscadas ou imprudentes?",
    "Você gastava dinheiro sem controle, causando problemas para você ou para sua família?"
  ];

  const data = {
    formCode: "MDQ_V2",
    formName: "MDQ - Questionário de Transtorno do Humor",
    title: "Questionário de Transtorno do Humor",
    shortTitle: "MDQ",
    symptomStem: "Já ocorreu algum período em sua vida em que seu jeito de ser mudou? Nesse período...",
    symptoms: symptomTexts.map((text, index) => ({
      id: `item_${index + 1}`,
      number: index + 1,
      text
    })),
    symptomOptions: [
      { value: "sim", label: "Sim", score: 1 },
      { value: "nao", label: "Não", score: 0 }
    ],
    samePeriod: {
      id: "mesmo_periodo",
      text: "Se você respondeu Sim a mais de uma das perguntas anteriores, várias dessas situações aconteceram durante o mesmo período de tempo?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" }
      ]
    },
    impact: {
      id: "grau_prejuizo",
      text: "Quanto essas situações afetaram sua vida, como no trabalho, na família, nas finanças, em questões legais ou em discussões e brigas?",
      detail: "Assinale apenas uma resposta.",
      options: [
        { value: "nenhum", label: "Nenhum problema" },
        { value: "pequenos", label: "Pequenos problemas" },
        { value: "moderados", label: "Problemas moderados" },
        { value: "serios", label: "Problemas sérios" }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.MDQData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

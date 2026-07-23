(function initializePhq9Data(globalScope) {
  "use strict";

  const data = {
    formCode: "PHQ9_V2",
    formName: "PHQ-9 - Questionário sobre a Saúde do Paciente",
    title: "Questionário sobre a Saúde do Paciente",
    shortTitle: "PHQ-9",
    prompt: "Considere as últimas duas semanas e escolha a frequência com que cada problema incomodou você.",
    questions: [
      {
        id: "item_1",
        text: "Pouco interesse ou pouco prazer em fazer as coisas",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_2",
        text: "Sentir-se para baixo, deprimido(a) ou sem perspectiva",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_3",
        text: "Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_4",
        text: "Sentir-se cansado(a) ou com pouca energia",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_5",
        text: "Falta de apetite ou comer demais",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_6",
        text: "Sentir-se mal consigo mesmo(a), achar que você é um fracasso ou que decepcionou sua família ou você mesmo(a)",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_7",
        text: "Dificuldade para se concentrar nas coisas, como ler o jornal ou assistir à televisão",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_8",
        text: "Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem. Ou o oposto: estar tão agitado(a) ou inquieto(a) que você se movimenta muito mais do que de costume",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_9",
        text: "Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)",
        responseGroup: "frequency",
        scored: true
      },
      {
        id: "item_10",
        text: "Se você assinalou qualquer um dos problemas, qual foi a dificuldade causada para realizar seu trabalho, cuidar das coisas em casa ou se relacionar com outras pessoas?",
        responseGroup: "impact",
        scored: false
      }
    ],
    responseGroups: {
      frequency: [
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
      ],
      impact: [
        {
          value: "nenhuma_dificuldade",
          label: "Nenhuma dificuldade"
        },
        {
          value: "alguma_dificuldade",
          label: "Alguma dificuldade"
        },
        {
          value: "muita_dificuldade",
          label: "Muita dificuldade"
        },
        {
          value: "extrema_dificuldade",
          label: "Extrema dificuldade"
        }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.PHQ9Data = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

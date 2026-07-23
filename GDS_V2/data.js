(function initializeGdsData(globalScope) {
  "use strict";

  const data = {
    formCode: "GDS_V2",
    formName: "GDS-15 - Escala de Depressão Geriátrica",
    title: "Escala de Depressão Geriátrica",
    shortTitle: "GDS-15",
    prompt: "Responda Sim ou Não a cada pergunta, considerando como você tem se sentido.",
    questions: [
      {
        id: "item_1",
        text: "O/A Sr(a) está basicamente satisfeito com sua vida?",
        reverse: true
      },
      {
        id: "item_2",
        text: "O/A Sr(a) se aborrece com frequência?",
        reverse: false
      },
      {
        id: "item_3",
        text: "O/A Sr(a) se sente um inútil nas atuais circunstâncias?",
        reverse: false
      },
      {
        id: "item_4",
        text: "O/A Sr(a) prefere ficar em casa a sair e fazer coisas novas?",
        reverse: false
      },
      {
        id: "item_5",
        text: "O/A Sr(a) sente que sua situação não tem saída?",
        reverse: false
      },
      {
        id: "item_6",
        text: "O/A Sr(a) teme que algo de ruim pode lhe acontecer?",
        reverse: false
      },
      {
        id: "item_7",
        text: "O/A Sr(a) sente que sua situação é sem esperança?",
        reverse: false
      },
      {
        id: "item_8",
        text: "O/A Sr(a) acha maravilhoso estar vivo?",
        reverse: true
      },
      {
        id: "item_9",
        text: "O/A Sr(a) sente que sua vida está vazia?",
        reverse: false
      },
      {
        id: "item_10",
        text: "O/A Sr(a) acha que a maioria das pessoas está em situação melhor?",
        reverse: false
      },
      {
        id: "item_11",
        text: "O/A Sr(a) sente que tem mais problemas de memória que a maioria?",
        reverse: false
      },
      {
        id: "item_12",
        text: "O/A Sr(a) deixou muitos de seus interesses e atividades?",
        reverse: false
      },
      {
        id: "item_13",
        text: "O/A Sr(a) se sente de bom humor a maior parte do tempo?",
        reverse: true
      },
      {
        id: "item_14",
        text: "O/A Sr(a) se sente cheio(a) de energia?",
        reverse: true
      },
      {
        id: "item_15",
        text: "O/A Sr(a) se sente feliz a maior parte do tempo?",
        reverse: true
      }
    ],
    responses: [
      {
        value: "sim",
        label: "Sim",
        score: 1
      },
      {
        value: "nao",
        label: "Não",
        score: 0
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.GDSData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

(function initializeDass21Data(globalScope) {
  "use strict";

  const rawQuestions = [
    "Achei difícil me acalmar.",
    "Senti minha boca seca.",
    "Não consegui vivenciar nenhum sentimento positivo.",
    "Tive dificuldade em respirar em alguns momentos (por exemplo, respiração ofegante ou falta de ar, sem ter feito nenhum esforço físico).",
    "Achei difícil ter iniciativa para fazer as coisas.",
    "Tive a tendência de reagir de forma exagerada às situações.",
    "Senti tremores (por exemplo, nas mãos).",
    "Senti que estava sempre nervoso.",
    "Preocupei-me com situações em que eu pudesse entrar em pânico e parecesse ridículo(a).",
    "Senti que não tinha nada a desejar.",
    "Senti-me agitado.",
    "Achei difícil relaxar.",
    "Senti-me depressivo(a) e sem ânimo.",
    "Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo.",
    "Senti que ia entrar em pânico.",
    "Não consegui me entusiasmar com nada.",
    "Senti que não tinha valor como pessoa.",
    "Senti que estava um pouco emotivo/sensível demais.",
    "Sabia que meu coração estava alterado mesmo não tendo feito nenhum esforço físico (por exemplo, aumento da frequência cardíaca ou disritmia cardíaca).",
    "Senti medo sem motivo.",
    "Senti que a vida não tinha sentido."
  ];

  const questions = rawQuestions.map((text, index) => ({
    id: `item_${index + 1}`,
    number: index + 1,
    text
  }));

  const data = {
    formCode: "DASS21_V2",
    formName: "DASS-21 - Escala de Depressão, Ansiedade e Estresse",
    title: "Escala de Depressão, Ansiedade e Estresse",
    shortTitle: "DASS-21",
    prompt: "Indique o quanto cada frase se aplicou a você durante a última semana.",
    questions,
    responses: [
      {
        value: "nao_se_aplicou",
        label: "Não se aplicou de maneira alguma",
        score: 0
      },
      {
        value: "aplicou_pouco",
        label: "Aplicou-se em algum grau ou por pouco tempo",
        score: 1
      },
      {
        value: "aplicou_consideravelmente",
        label: "Aplicou-se em um grau considerável, ou por uma boa parte do tempo",
        score: 2
      },
      {
        value: "aplicou_muito",
        label: "Aplicou-se muito, ou na maioria do tempo",
        score: 3
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.DASS21Data = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

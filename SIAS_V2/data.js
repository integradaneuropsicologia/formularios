(function initializeSiasData(globalScope) {
  "use strict";

  const data = {
    formCode: "SIAS_V2",
    formName: "SIAS - Escala de Ansiedade na Interação Social",
    title: "Escala de Ansiedade na Interação Social",
    shortTitle: "SIAS",
    prompt: "Indique o quanto cada frase é característica de como você se sente.",
    questions: [
      {
        id: "item_1",
        text: "Fico nervoso(a) se tiver que falar com alguém que tem autoridade, como professor ou chefe."
      },
      {
        id: "item_2",
        text: "Tenho dificuldade para manter contato visual com as outras pessoas."
      },
      {
        id: "item_3",
        text: "Fico tenso(a) se tenho que falar sobre mim ou sobre meus sentimentos."
      },
      {
        id: "item_4",
        text: "Acho difícil ficar confortável com as pessoas com quem trabalho."
      },
      {
        id: "item_5",
        text: "Acho fácil fazer amigos da minha idade.",
        reverse: true
      },
      {
        id: "item_6",
        text: "Fico tenso(a) se encontro um conhecido na rua."
      },
      {
        id: "item_7",
        text: "Quando estou socializando, sinto-me desconfortável."
      },
      {
        id: "item_8",
        text: "Fico tenso(a) se estou na companhia de apenas uma pessoa."
      },
      {
        id: "item_9",
        text: "Sou uma pessoa sociável.",
        reverse: true
      },
      {
        id: "item_10",
        text: "Tenho dificuldade para falar com outras pessoas."
      },
      {
        id: "item_11",
        text: "Tenho facilidade para pensar em assuntos para conversar.",
        reverse: true
      },
      {
        id: "item_12",
        text: "Preocupo-me em parecer desajeitado(a) quando falo."
      },
      {
        id: "item_13",
        text: "Acho difícil discordar do ponto de vista de outra pessoa."
      },
      {
        id: "item_14",
        text: "Tenho dificuldade para falar com pessoas atraentes do sexo oposto."
      },
      {
        id: "item_15",
        text: "Preocupo-me em não saber o que dizer em situações sociais."
      },
      {
        id: "item_16",
        text: "Fico nervoso(a) ao socializar com pessoas que não conheço bem."
      },
      {
        id: "item_17",
        text: "Sinto que vou dizer algo constrangedor quando vou falar."
      },
      {
        id: "item_18",
        text: "Quando socializo em um grupo, preocupo-me em ser ignorado(a)."
      },
      {
        id: "item_19",
        text: "Sinto-me tenso(a) ao socializar em um grupo."
      },
      {
        id: "item_20",
        text: "Sinto-me inseguro(a) ao cumprimentar alguém que conheço apenas superficialmente."
      }
    ],
    responses: [
      {
        value: "nada",
        label: "Nada característico de mim",
        score: 0
      },
      {
        value: "muito_pouco",
        label: "Muito pouco característico de mim",
        score: 1
      },
      {
        value: "moderadamente",
        label: "Moderadamente característico de mim",
        score: 2
      },
      {
        value: "muito",
        label: "Muito característico de mim",
        score: 3
      },
      {
        value: "extremamente",
        label: "Extremamente característico de mim",
        score: 4
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.SIASData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

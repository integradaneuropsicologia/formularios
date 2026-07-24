(function initializeYbocsData(globalScope) {
  "use strict";

  const data = {
    formCode: "YBOCS_V2",
    formName: "Y-BOCS - Escala Yale-Brown de Sintomas Obsessivo-Compulsivos",
    title: "Escala Yale-Brown de Sintomas Obsessivo-Compulsivos",
    shortTitle: "Y-BOCS",
    instructions:
      "Identifique, junto com seu terapeuta, uma ou mais obsessões que mais incomodam e uma ou mais compulsões que mais prejudicam. Responda aos itens considerando esses sintomas principais.",
    sections: [
      {
        id: "obsessoes",
        title: "Obsessões",
        description: "Itens 1 a 5"
      },
      {
        id: "compulsoes",
        title: "Compulsões (rituais)",
        description: "Itens 6 a 10"
      }
    ],
    questions: [
      {
        id: "item_1",
        section: "obsessoes",
        title: "Tempo ocupado pelos pensamentos obsessivos (ou obsessões)",
        text: "Quanto de seu tempo é ocupado por pensamentos obsessivos?",
        options: [
          {
            value: "score_0",
            label: "Nenhuma",
            score: 0
          },
          {
            value: "score_1",
            label: "Leve: menos de uma hora por dia ou intrusões (invasões de sua mente) ocasionais",
            score: 1
          },
          {
            value: "score_2",
            label: "Moderado: uma a três horas por dia ou intrusões frequentes",
            score: 2
          },
          {
            value: "score_3",
            label: "Grave: mais de três horas até oito horas por dia ou intrusões muito frequentes",
            score: 3
          },
          {
            value: "score_4",
            label: "Muito grave: mais de oito horas por dia ou intrusões quase constantes",
            score: 4
          }
        ]
      },
      {
        id: "item_2",
        section: "obsessoes",
        title: "Interferência gerada pelos pensamentos obsessivos",
        text: "Até que ponto seus pensamentos obsessivos interferem em sua vida social ou profissional?",
        options: [
          {
            value: "score_0",
            label: "Nenhuma interferência",
            score: 0
          },
          {
            value: "score_1",
            label: "Leve: leve interferência nas atividades sociais ou ocupacionais, mas o desempenho global não está comprometido",
            score: 1
          },
          {
            value: "score_2",
            label: "Moderada: clara interferência no desempenho social ou ocupacional, mas conseguindo ainda desempenhar",
            score: 2
          },
          {
            value: "score_3",
            label: "Grave: provoca comprometimento considerável no desempenho social ou ocupacional",
            score: 3
          },
          {
            value: "score_4",
            label: "Muito grave: incapacitante",
            score: 4
          }
        ]
      },
      {
        id: "item_3",
        section: "obsessoes",
        title: "Sofrimento relacionado aos pensamentos obsessivos",
        text: "Até que ponto os seus pensamentos obsessivos o perturbam ou provocam mal-estar?",
        options: [
          {
            value: "score_0",
            label: "Nenhuma perturbação",
            score: 0
          },
          {
            value: "score_1",
            label: "Leve: pouca perturbação",
            score: 1
          },
          {
            value: "score_2",
            label: "Moderada: perturbador, mas ainda controlável",
            score: 2
          },
          {
            value: "score_3",
            label: "Grave: muito perturbador",
            score: 3
          },
          {
            value: "score_4",
            label: "Muito grave: mal-estar quase constante e incapacitante",
            score: 4
          }
        ]
      },
      {
        id: "item_4",
        section: "obsessoes",
        title: "Resistência às obsessões",
        text: "Até que ponto você se esforça para resistir aos pensamentos obsessivos? Com que frequência tenta não ligar ou distrair a atenção desses pensamentos quando invadem sua mente?",
        options: [
          {
            value: "score_0",
            label: "Sempre faz esforço para resistir, ou tem sintomas mínimos que não necessitam de resistência ativa",
            score: 0
          },
          {
            value: "score_1",
            label: "Tenta resistir na maior parte das vezes",
            score: 1
          },
          {
            value: "score_2",
            label: "Faz algum esforço para resistir",
            score: 2
          },
          {
            value: "score_3",
            label: "Cede a todas as obsessões sem tentar controlá-las, ainda que faça algum esforço para afastá-las",
            score: 3
          },
          {
            value: "score_4",
            label: "Cede completamente a todas as obsessões de modo voluntário",
            score: 4
          }
        ]
      },
      {
        id: "item_5",
        section: "obsessoes",
        title: "Grau de controle sobre os pensamentos obsessivos",
        text: "Até que ponto você consegue controlar seus pensamentos obsessivos? É habitualmente bem-sucedido quando tenta afastar a atenção dos pensamentos obsessivos ou interrompê-los? Consegue afastá-los?",
        options: [
          {
            value: "score_0",
            label: "Controle total",
            score: 0
          },
          {
            value: "score_1",
            label: "Bom controle: habitualmente capaz de interromper ou afastar as obsessões com algum esforço e concentração",
            score: 1
          },
          {
            value: "score_2",
            label: "Controle moderado: algumas vezes é capaz de interromper ou afastar as obsessões",
            score: 2
          },
          {
            value: "score_3",
            label: "Controle leve: raramente bem-sucedido; quando tenta interromper ou afastar as obsessões, consegue somente desviar a atenção com dificuldade",
            score: 3
          },
          {
            value: "score_4",
            label: "Nenhum controle: as obsessões são experimentadas como completamente involuntárias; raras vezes é capaz, mesmo que de forma momentânea, de modificar seus pensamentos obsessivos",
            score: 4
          }
        ]
      },
      {
        id: "item_6",
        section: "compulsoes",
        title: "Tempo gasto com comportamentos compulsivos (compulsões ou rituais)",
        text: "Quanto tempo você gasta executando rituais? Se compararmos com o tempo habitual que a maioria das pessoas necessita, quanto tempo a mais você usa para executar suas atividades rotineiras devido aos seus rituais?",
        options: [
          {
            value: "score_0",
            label: "Nenhum",
            score: 0
          },
          {
            value: "score_1",
            label: "Leve: passa menos de uma hora por dia realizando compulsões, ou ocorrência ocasional de comportamentos compulsivos",
            score: 1
          },
          {
            value: "score_2",
            label: "Moderado: passa uma a três horas por dia realizando compulsões, ou execução frequente de comportamentos compulsivos",
            score: 2
          },
          {
            value: "score_3",
            label: "Grave: passa de três a oito horas por dia realizando compulsões, ou execução muito frequente de comportamentos compulsivos",
            score: 3
          },
          {
            value: "score_4",
            label: "Muito grave: passa mais de oito horas por dia realizando compulsões, ou execução quase constante de comportamentos compulsivos muito numerosos para contar",
            score: 4
          }
        ]
      },
      {
        id: "item_7",
        section: "compulsoes",
        title: "Interferência provocada pelos comportamentos compulsivos",
        text: "Até que ponto suas compulsões interferem em sua vida social ou em suas atividades profissionais? Existe alguma atividade que você deixa de fazer em razão das compulsões?",
        options: [
          {
            value: "score_0",
            label: "Nenhuma interferência",
            score: 0
          },
          {
            value: "score_1",
            label: "Leve: leve interferência nas atividades sociais ou ocupacionais, mas o desempenho global não está comprometido",
            score: 1
          },
          {
            value: "score_2",
            label: "Moderada: clara interferência no desempenho social ou ocupacional, mas conseguindo ainda desempenhar",
            score: 2
          },
          {
            value: "score_3",
            label: "Grave: comprometimento considerável do desempenho social ou ocupacional",
            score: 3
          },
          {
            value: "score_4",
            label: "Muito grave: incapacitante",
            score: 4
          }
        ]
      },
      {
        id: "item_8",
        section: "compulsoes",
        title: "Desconforto relacionado ao comportamento compulsivo",
        text: "Como você se sentiria se fosse impedido de realizar suas compulsões? Até que ponto ficaria ansioso?",
        options: [
          {
            value: "score_0",
            label: "Nenhum desconforto",
            score: 0
          },
          {
            value: "score_1",
            label: "Leve: ligeiramente ansioso se as compulsões fossem interrompidas ou ligeiramente ansioso durante a sua execução",
            score: 1
          },
          {
            value: "score_2",
            label: "Moderado: a ansiedade subiria para um nível controlável se as compulsões fossem interrompidas, ou ligeiramente ansioso durante a sua execução",
            score: 2
          },
          {
            value: "score_3",
            label: "Grave: aumento acentuado e muito perturbador da ansiedade se as compulsões fossem interrompidas ou aumento acentuado e muito perturbador durante a sua execução",
            score: 3
          },
          {
            value: "score_4",
            label: "Muito grave: ansiedade incapacitante com qualquer intervenção que possa modificar as compulsões ou ansiedade incapacitante durante a execução das compulsões",
            score: 4
          }
        ]
      },
      {
        id: "item_9",
        section: "compulsoes",
        title: "Resistência às compulsões",
        text: "Até que ponto você se esforça para resistir às compulsões?",
        options: [
          {
            value: "score_0",
            label: "Sempre faz esforço para resistir, ou tem sintomas mínimos que não necessitam de resistência ativa",
            score: 0
          },
          {
            value: "score_1",
            label: "Tenta resistir na maioria das vezes",
            score: 1
          },
          {
            value: "score_2",
            label: "Faz algum esforço para resistir",
            score: 2
          },
          {
            value: "score_3",
            label: "Cede a quase todas as compulsões sem tentar controlá-las, ainda que as faça com alguma relutância",
            score: 3
          },
          {
            value: "score_4",
            label: "Cede completamente a todas as compulsões de modo voluntário",
            score: 4
          }
        ]
      },
      {
        id: "item_10",
        section: "compulsoes",
        title: "Grau de controle sobre as compulsões",
        text: "Com que pressão você se sente obrigado a executar as compulsões? Até que ponto consegue controlá-las?",
        options: [
          {
            value: "score_0",
            label: "Controle total",
            score: 0
          },
          {
            value: "score_1",
            label: "Bom controle: sente-se pressionado a executar as compulsões, mas tem algum controle voluntário",
            score: 1
          },
          {
            value: "score_2",
            label: "Controle moderado: sente-se fortemente pressionado a executar as compulsões e somente consegue controlá-las com dificuldade",
            score: 2
          },
          {
            value: "score_3",
            label: "Controle leve: pressão forte para executar as compulsões; o comportamento compulsivo tem de ser executado até o fim, e somente com dificuldade consegue retardar a realização das compulsões",
            score: 3
          },
          {
            value: "score_4",
            label: "Nenhum controle: sente-se completamente dominado pela pressão para executar as compulsões; tal pressão é sentida como fora do controle voluntário. Raramente se sente capaz de retardar a execução de compulsões",
            score: 4
          }
        ]
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.YBOCSData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

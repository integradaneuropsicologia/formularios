(function initializeHcl32R1Data(globalScope) {
  "use strict";

  const symptomTexts = [
    "Eu precisava de menos sono.",
    "Eu me sentia com mais energia e mais ativo.",
    "Eu estava mais autoconfiante.",
    "Eu apreciava mais meu trabalho.",
    "Eu estava mais sociável (fazia mais ligações telefônicas, saía mais).",
    "Eu queria viajar ou viajava mais.",
    "Eu tinha tendência a dirigir mais rápido ou me arriscar mais, enquanto dirigia.",
    "Eu gastava mais ou gastava dinheiro demais.",
    "Eu me arriscava mais, em minha vida diária (em meu trabalho e/ou em outras atividades).",
    "Eu estava fisicamente mais ativo (esporte e afins).",
    "Eu planejava mais atividades e projetos.",
    "Eu tinha mais ideias, eu estava mais criativo.",
    "Eu ficava menos tímido ou inibido.",
    "Eu usava roupas/maquiagens mais coloridas e extravagantes.",
    "Eu queria encontrar ou, de fato, encontrava mais pessoas.",
    "Eu estava mais interessado em sexo e/ou tinha desejo sexual aumentado.",
    "Eu paquerava mais e/ou estava sexualmente mais ativo.",
    "Eu falava mais.",
    "Eu pensava mais rápido.",
    "Eu fazia mais piadas ou trocadilhos quando falava.",
    "Eu me distraía com mais facilidade.",
    "Eu me envolvia em muitas coisas novas.",
    "Meus pensamentos pulavam de assunto rapidamente.",
    "Eu fazia coisas mais rapidamente e/ou com mais facilidade.",
    "Eu ficava mais impaciente e/ou ficava irritado mais facilmente.",
    "Eu podia ser cansativo ou irritante para os outros.",
    "Eu me envolvia em mais discussões e disputas.",
    "Meu humor estava melhor, mais otimista.",
    "Eu bebia mais café.",
    "Eu fumava mais cigarros.",
    "Eu bebia mais álcool.",
    "Eu usava mais drogas (sedativos, ansiolíticos, estimulantes, entre outros)."
  ];

  const data = {
    formCode: "HCL32_R1_V2",
    formName: "HCL-32-R1 - Escala de Autoavaliação de Hipomania",
    title: "Escala de Autoavaliação de Hipomania",
    shortTitle: "HCL-32-R1",
    currentState: {
      id: "estado_hoje",
      text: "Antes de tudo, como você está se sentindo hoje comparado ao seu estado habitual?",
      options: [
        { value: "muito_pior", label: "Muito pior que o habitual" },
        { value: "pior", label: "Pior que o habitual" },
        { value: "um_pouco_pior", label: "Um pouco pior que o habitual" },
        { value: "igual", label: "Nem melhor, nem pior que o habitual" },
        { value: "um_pouco_melhor", label: "Um pouco melhor que o habitual" },
        { value: "melhor", label: "Melhor que o habitual" },
        { value: "muito_melhor", label: "Muito melhor que o habitual" }
      ]
    },
    usualPattern: {
      id: "padrao_habitual",
      text: "Como você é normalmente, comparado a outras pessoas?",
      detail: "Comparando com outras pessoas, meu nível de atividade, energia e humor...",
      options: [
        { value: "estavel", label: "Sempre é mais para estável e equilibrado" },
        { value: "mais_elevado", label: "Geralmente é mais elevado" },
        { value: "menos_elevado", label: "Geralmente é menos elevado" },
        { value: "altos_e_baixos", label: "Repetidamente exibe períodos de altos e baixos" }
      ]
    },
    symptoms: symptomTexts.map((text, index) => ({
      id: `item_${index + 1}`,
      number: index + 1,
      text
    })),
    symptomOptions: [
      { value: "sim", label: "Sim", score: 1 },
      { value: "nao", label: "Não", score: 0 }
    ],
    impactDomains: [
      { id: "impacto_vida_familiar", text: "Vida familiar" },
      { id: "impacto_vida_social", text: "Vida social" },
      { id: "impacto_trabalho", text: "Trabalho" },
      { id: "impacto_lazer", text: "Lazer" }
    ],
    impactOptions: [
      { value: "positivo_e_negativo", label: "Positivo e negativo" },
      { value: "positivo", label: "Positivo" },
      { value: "negativo", label: "Negativo" },
      { value: "nenhum_impacto", label: "Nenhum impacto" }
    ],
    reactions: {
      id: "reacao_pessoas",
      text: "Quais foram as reações e os comentários das pessoas sobre seus altos?",
      detail: "Como as pessoas próximas a você reagiram a seus altos ou o que comentaram?",
      options: [
        { value: "positivamente", label: "Positivamente (encorajando ou apoiando)" },
        { value: "neutros", label: "Neutros" },
        { value: "negativamente", label: "Negativamente (preocupadas, aborrecidas, irritadas, críticas)" },
        { value: "positiva_e_negativamente", label: "Positivamente e negativamente" },
        { value: "nenhuma_reacao", label: "Nenhuma reação" }
      ]
    },
    duration: {
      id: "duracao_altos",
      text: "Via de regra, qual foi a duração de seus altos (em média)?",
      options: [
        { value: "um_dia", label: "1 dia" },
        { value: "dois_tres_dias", label: "2 - 3 dias" },
        { value: "quatro_sete_dias", label: "4 - 7 dias" },
        { value: "mais_uma_semana", label: "Mais de 1 semana" },
        { value: "mais_um_mes", label: "Mais de 1 mês" },
        { value: "nao_sei", label: "Não posso julgar/não sei" }
      ]
    },
    recentHighs: {
      id: "altos_ultimos_12_meses",
      text: "Você sentiu tais altos nos últimos 12 meses?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" }
      ]
    },
    daysInHighs: {
      id: "dias_altos_ultimos_12_meses",
      text: "Estime quantos dias você passou nesses altos durante os últimos 12 meses."
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.HCL32R1Data = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

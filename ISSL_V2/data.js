(function initializeIsslData(globalScope) {
  "use strict";

  const responseOptions = [
    { value: "sim", label: "Sim", score: 1 },
    { value: "nao", label: "Não", score: 0 }
  ];

  const sections = [
    {
      id: "quadro_1",
      number: 1,
      title: "Últimas 24 horas",
      instruction: "Indique os sintomas que você experimentou nas últimas 24 horas.",
      questionPrefix: "Nas últimas 24 horas",
      items: [
        { text: "Mãos e pés frios", type: "fisico" },
        { text: "Boca seca", type: "fisico" },
        { text: "Nó no estômago", type: "fisico" },
        { text: "Aumento de sudorese", type: "fisico" },
        { text: "Tensão muscular", type: "fisico" },
        { text: "Aperto da mandíbula ou ranger os dentes", type: "fisico" },
        { text: "Diarreia passageira", type: "fisico" },
        { text: "Insônia", type: "fisico" },
        { text: "Taquicardia", type: "fisico" },
        { text: "Hiperventilação", type: "fisico" },
        { text: "Hipertensão arterial súbita e passageira", type: "fisico" },
        { text: "Mudança de apetite", type: "fisico" },
        { text: "Aumento súbito de motivação", type: "psicologico" },
        { text: "Entusiasmo súbito", type: "psicologico" },
        { text: "Vontade súbita de iniciar novos projetos", type: "psicologico" }
      ]
    },
    {
      id: "quadro_2",
      number: 2,
      title: "Última semana",
      instruction: "Indique os sintomas que você experimentou na última semana.",
      questionPrefix: "Na última semana",
      items: [
        { text: "Problemas com a memória", type: "fisico" },
        { text: "Mal-estar generalizado, sem causa específica", type: "fisico" },
        { text: "Formigamento das extremidades", type: "fisico" },
        { text: "Sensação de desgaste físico constante", type: "fisico" },
        { text: "Mudança de apetite", type: "fisico" },
        { text: "Aparecimento de problemas dermatológicos", type: "fisico" },
        { text: "Hipertensão arterial", type: "fisico" },
        { text: "Cansaço constante", type: "fisico" },
        { text: "Aparecimento de úlcera", type: "fisico" },
        { text: "Tontura ou sensação de estar flutuando", type: "fisico" },
        { text: "Sensibilidade emotiva excessiva", type: "psicologico" },
        { text: "Dúvida quanto a si próprio", type: "psicologico" },
        { text: "Pensar constantemente em um só assunto", type: "psicologico" },
        { text: "Irritabilidade excessiva", type: "psicologico" },
        { text: "Diminuição da libido", type: "psicologico" }
      ]
    },
    {
      id: "quadro_3",
      number: 3,
      title: "Último mês",
      instruction: "Indique os sintomas que você experimentou no último mês.",
      questionPrefix: "No último mês",
      items: [
        { text: "Diarreia frequente", type: "fisico" },
        { text: "Dificuldades sexuais", type: "fisico" },
        { text: "Insônia", type: "fisico" },
        { text: "Náusea", type: "fisico" },
        { text: "Tiques", type: "fisico" },
        { text: "Hipertensão arterial continuada", type: "fisico" },
        { text: "Problemas dermatológicos prolongados", type: "fisico" },
        { text: "Mudança extrema de apetite", type: "fisico" },
        { text: "Excesso de gases", type: "fisico" },
        { text: "Tontura frequente", type: "fisico" },
        { text: "Úlcera", type: "fisico" },
        { text: "Enfarte", type: "fisico" },
        { text: "Impossibilidade de trabalhar", type: "psicologico" },
        { text: "Pesadelos", type: "psicologico" },
        { text: "Sensação de incompetência em todas as áreas", type: "psicologico" },
        { text: "Vontade de fugir de tudo", type: "psicologico" },
        { text: "Apatia, depressão ou raiva prolongada", type: "psicologico" },
        { text: "Cansaço excessivo", type: "psicologico" },
        { text: "Pensar ou falar constantemente em um só assunto", type: "psicologico" },
        { text: "Irritabilidade sem causa aparente", type: "psicologico" },
        { text: "Angústia ou ansiedade diária", type: "psicologico" },
        { text: "Hipersensibilidade emotiva", type: "psicologico" },
        { text: "Perda do senso de humor", type: "psicologico" }
      ]
    }
  ].map((section) => ({
    ...section,
    items: section.items.map((item, index) => ({
      ...item,
      id: `${section.id}_item_${index + 1}`,
      number: index + 1
    }))
  }));

  const data = {
    formCode: "ISSL_V2",
    formName: "ISSL - Inventário de Sintomas de Stress para Adultos de Lipp",
    title: "Inventário de Sintomas de Stress para Adultos de Lipp",
    shortTitle: "ISSL",
    responseOptions,
    sections
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.ISSLData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

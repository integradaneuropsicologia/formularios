(function initializeProteaData(globalScope) {
  "use strict";

  const data = {
    formCode: "PROTEA_R_NV_V2",
    formName: "PROTEA-R-NV - Protocolo de Avaliação Comportamental",
    title: "Protocolo de Avaliação Comportamental para Crianças com Suspeita de TEA",
    shortTitle: "PROTEA-R-NV",
    respondent: "Profissional",
    ageRange: "24 a 60 meses",
    sessionCount: 3,
    frequencyLabels: {
      1: "Baixa",
      2: "Média",
      3: "Alta"
    },
    conclusions: [
      { value: "com_risco", label: "Com risco para TEA" },
      { value: "risco_relativo", label: "Com risco relativo para TEA" },
      { value: "sem_risco", label: "Sem risco para TEA" }
    ],
    sections: [
      {
        id: "sociocomunicativos",
        title: "Área I - Comportamentos sociocomunicativos",
        description: "Itens 1 a 8"
      },
      {
        id: "brincadeira",
        title: "Área II - Qualidade da brincadeira",
        description: "Itens 9 a 14"
      },
      {
        id: "repetitivos",
        title: "Área III - Movimentos repetitivos e estereotipados do corpo",
        description: "Itens 15 a 17"
      }
    ],
    questions: [
      {
        id: "item_1",
        number: 1,
        code: "IAC",
        section: "sociocomunicativos",
        title: "Iniciativa de Atenção Compartilhada",
        critical: true,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Dirige o foco de atenção do adulto (espontaneamente mostra ou dá brinquedos para o adulto), coordenando gestos (apontar) com contato visual e expressões afetivas, em várias situações."
          },
          {
            code: "B",
            label: "Dirige o foco de atenção do adulto (espontaneamente mostra ou dá brinquedos para o adulto), coordenando gestos (apontar) com contato visual e expressões afetivas, porém em situações restritas ou repetitivas."
          },
          {
            code: "C",
            label: "Dirige o foco de atenção do adulto (espontaneamente mostra ou dá brinquedos para o adulto), mas não coordena gestos (apontar) com contato visual e expressões afetivas ou os gestos não são convencionais (olha e se interessa pelo objeto, mas aponta para o chão)."
          },
          {
            code: "D",
            label: "Não se observou iniciativa de atenção compartilhada (apenas responde, mas não inicia)."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_2",
        number: 2,
        code: "RAC",
        section: "sociocomunicativos",
        title: "Resposta de Atenção Compartilhada",
        critical: true,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Segue o mesmo foco de atenção do adulto (pega brinquedos oferecidos, olha para onde o adulto aponta, responde com gestos à solicitação do adulto, troca turnos), coordenando contato visual, gestos e expressões afetivas, em várias situações."
          },
          {
            code: "B",
            label: "Segue o mesmo foco de atenção do adulto (pega brinquedos oferecidos, olha para onde o adulto aponta, responde com gestos à solicitação do adulto, troca turnos), coordenando contato visual, gestos e expressões afetivas, porém em situações restritas e/ou repetitivas e após muita insistência."
          },
          {
            code: "C",
            label: "Segue o mesmo foco de atenção do adulto (olha o adulto manipular/acionar os brinquedos), mas não coordena contato visual, gestos e expressões afetivas (não troca turnos); o interesse da criança está mais no objeto."
          },
          {
            code: "D",
            label: "Não se observou comportamento de resposta de atenção compartilhada."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_3",
        number: 3,
        code: "IM",
        section: "sociocomunicativos",
        title: "Imitação",
        critical: true,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Reproduz intencionalmente gestos, expressões faciais e/ou ações demonstradas pelo adulto em situações variadas e alterna turnos."
          },
          {
            code: "B",
            label: "Reproduz intencionalmente gestos, expressões faciais e/ou ações demonstradas pelo adulto e alterna turnos, porém em situações restritas (ex.: mecânicos, musicais)."
          },
          {
            code: "C",
            label: "Reproduz gestos e/ou atividades demonstrados pelo adulto, mas tende a ser repetitiva e não parece ser intencional (o interesse da criança está nas propriedades sensoriais do objeto e ela tende a não alternar turnos)."
          },
          { code: "D", label: "Não se observou o comportamento de imitação." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_4",
        number: 4,
        code: "ES",
        section: "sociocomunicativos",
        title: "Engajamento Social",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Espontaneamente convida o adulto (olha, aproxima-se) para brincadeiras que não envolvem objetos (cantar, dançar, brincar de pega-pega ou esconde-esconde; fazer cócegas)."
          },
          {
            code: "B",
            label: "Não convida o adulto espontaneamente, mas aceita as brincadeiras sem objetos que este lhe propõe (cantar, dançar, brincar de pega-pega ou esconde-esconde; fazer cócegas) de forma espontânea/flexível."
          },
          {
            code: "C",
            label: "Não convida o adulto espontaneamente, mas aceita as brincadeiras sem objetos que este lhe propõe (cantar, dançar, brincar de pega-pega ou esconde-esconde; fazer cócegas), porém de forma rígida."
          },
          { code: "D", label: "Não se observou comportamento de engajamento social." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_5",
        number: 5,
        code: "SOR",
        section: "sociocomunicativos",
        title: "Sorriso",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Sorriso dirigido espontaneamente ao adulto (deve ser acompanhado por contato visual, gesto ou verbalização para o adulto) e adequado ao contexto social."
          },
          {
            code: "B",
            label: "Sorriso em resposta ao sorriso do adulto (pode não haver contato visual, gestos ou verbalizações), mas é adequado ao contexto social."
          },
          { code: "C", label: "Direção do sorriso difusa ou sem motivo aparente." },
          { code: "D", label: "Não se observou sorriso." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_6",
        number: 6,
        code: "CFA",
        section: "sociocomunicativos",
        title: "Busca e Resposta ao Contato Físico Afetivo",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Busca contato físico ou proximidade física do adulto de forma espontânea."
          },
          {
            code: "B",
            label: "Não busca espontaneamente, mas aceita o contato físico iniciado pelo adulto."
          },
          {
            code: "C",
            label: "Busca contato físico, porém de forma atípica (interesse sensorial)."
          },
          {
            code: "D",
            label: "Não se observaram comportamentos de busca ou resposta ao contato físico."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_7",
        number: 7,
        code: "BA",
        section: "sociocomunicativos",
        title: "Busca de Assistência",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Busca assistência do adulto, coordenando contato visual e gestos (apontar) e/ou vocalizações."
          },
          {
            code: "B",
            label: "Busca assistência do adulto, mas não coordena contato visual e gestos (apontar) e/ou vocalizações (aponta sem fazer contato visual)."
          },
          {
            code: "C",
            label: "Busca assistência do adulto, mas não usa gestos nem contato visual (pega a mão do adulto e a coloca sobre o objeto para abrir tampas ou acionar um brinquedo; escala o corpo do adulto para alcançar um objeto)."
          },
          { code: "D", label: "Não se observou o comportamento de busca de assistência." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_8",
        number: 8,
        code: "P/R",
        section: "sociocomunicativos",
        title: "Protesto/Retraimento",
        critical: false,
        frequencyCodes: ["B", "C", "D"],
        options: [
          { code: "A", label: "Não se observou protesto/retraimento." },
          {
            code: "B",
            label: "Tenta evitar a interação com o adulto de forma branda (dá as costas ou afasta a mão do adulto)."
          },
          {
            code: "C",
            label: "Tenta evitar a interação de forma ativa (afasta-se, encolhe-se em um canto)."
          },
          {
            code: "D",
            label: "Tenta evitar a interação com o adulto de forma intensa (afasta-se e grita ou agita-se)."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_9",
        number: 9,
        code: "EXB",
        section: "brincadeira",
        title: "Exploração dos Brinquedos",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Explora muitos brinquedos (mais da metade do conjunto de brinquedos disponíveis em cada um dos dois contextos)."
          },
          {
            code: "B",
            label: "Explora poucos brinquedos (menos da metade do conjunto de brinquedos disponíveis em cada um dos dois contextos)."
          },
          {
            code: "C",
            label: "Explora pouquíssimos brinquedos (menos de 1/3 dos brinquedos disponíveis em cada um dos dois contextos ou apenas um dos contextos)."
          },
          {
            code: "D",
            label: "Não apresenta exploração (locomove-se pela sala sem se interessar pelos brinquedos, embora possa tentar abrir portas de armários, caixas e potes); pisa sobre os brinquedos como se não os visse."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_10",
        number: 10,
        code: "FEX",
        section: "brincadeira",
        title: "Forma de Exploração",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        dependency: {
          parentId: "item_9",
          allowedCodes: ["A", "B", "C"],
          note: "Aplicável somente quando o item 9 estiver codificado como A, B ou C."
        },
        options: [
          {
            code: "A",
            label: "Explora os brinquedos de formas variadas (bate, rola, sacode etc.) e adequadas ao contexto, sem ocorrência de explorações atípicas."
          },
          {
            code: "B",
            label: "Explora os brinquedos de formas variadas (bate, rola, sacode etc.), embora ocorram também algumas explorações atípicas (interesse pelo cheiro, movimento ou partes isoladas de objetos) e/ou repetitivas (alinhar, girar objetos sem função aparente)."
          },
          {
            code: "C",
            label: "Explora os brinquedos de forma muito breve (toca nos objetos apenas para colocá-los na boca ou jogá-los no chão) ou atípica (interesse pelo cheiro, movimento ou partes isoladas de objetos) e/ou repetitivas (alinhar, girar objetos sem função aparente)."
          },
          { code: "D", label: "Não apresenta comportamento de exploração de objetos." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_11",
        number: 11,
        code: "CV",
        section: "brincadeira",
        title: "Coordenação Visuomotora",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Segura os brinquedos firmemente, coordenando o olhar com a manipulação."
          },
          {
            code: "B",
            label: "Segura os brinquedos firmemente, porém sem coordenação com o olhar."
          },
          {
            code: "C",
            label: "Não segura os brinquedos firmemente, embora possa explorá-los visualmente."
          },
          {
            code: "D",
            label: "Não segura os brinquedos firmemente nem coordena o olhar com a manipulação."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_12",
        number: 12,
        code: "BF",
        section: "brincadeira",
        title: "Brincadeira Funcional",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Opera muitos brinquedos (mais da metade em cada um dos dois contextos) de acordo com sua função (aperta/gira botões, teclas; abre/fecha tampas; coloca/retira objetos de uma caixa; alinha/empilha/encaixa objetos com uma finalidade), de forma adequada."
          },
          {
            code: "B",
            label: "Opera poucos brinquedos (menos de 1/3 em cada um dos dois contextos ou apenas um contexto) de acordo com sua função (aperta/gira botões, teclas; abre/fecha tampas; coloca/retira objetos de uma caixa; alinha/empilha/encaixa objetos com uma finalidade), de forma adequada."
          },
          {
            code: "C",
            label: "Opera os brinquedos de forma parcial (inicia, mas não completa a ação), independentemente da quantidade de brinquedos disponíveis."
          },
          { code: "D", label: "Não apresenta brincadeira funcional." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_13",
        number: 13,
        code: "BS",
        section: "brincadeira",
        title: "Brincadeira Simbólica",
        critical: true,
        frequencyCodes: ["A", "B", "C"],
        options: [
          {
            code: "A",
            label: "Faz de conta que um brinquedo é outro objeto (blocos de madeira como comidinhas) ou cria propriedades para os brinquedos (esfria o chá que está quente, faz de conta que põe açúcar no chá, faz barulho de motor ao empurrar um carrinho), de forma espontânea, utilizando diferentes brinquedos."
          },
          {
            code: "B",
            label: "Faz de conta que um brinquedo é outro objeto (blocos de madeira como comidinhas, esfria o chá que está quente, põe açúcar no chá, faz barulho de motor ao empurrar um carrinho), mas apenas com poucos brinquedos e de forma pouco espontânea."
          },
          {
            code: "C",
            label: "Apresenta indícios de brincadeira simbólica, sendo essa atividade observada apenas no contexto da reprodução do que o adulto faz, de forma limitada e/ou rígida."
          },
          { code: "D", label: "Não apresenta brincadeira simbólica." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_14",
        number: 14,
        code: "SBS",
        section: "brincadeira",
        title: "Sequência da Brincadeira Simbólica",
        critical: false,
        frequencyCodes: ["A", "B", "C"],
        dependency: {
          parentId: "item_13",
          allowedCodes: ["A", "B", "C"],
          note: "Aplicável somente quando o item 13 estiver codificado como A, B ou C."
        },
        options: [
          {
            code: "A",
            label: "Sequência estruturada com evolução natural, ocorrendo início, meio e fim, embora nem sempre em ordem linear (médico examina o paciente, chama ambulância, opera o paciente); brincadeira flui de forma associativa e espontânea."
          },
          {
            code: "B",
            label: "Episódios relativamente isolados, mas com certa associação, embora não tão elaborados para serem classificados na pontuação A (coloca a colher no prato/xícara e mexe, fazendo de conta que esfria o alimento)."
          },
          {
            code: "C",
            label: "Sequência difícil de ser identificada; episódios sem conexão entre si."
          },
          { code: "D", label: "Não apresenta sequência de brincadeira simbólica." },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_15",
        number: 15,
        code: "MRM",
        section: "repetitivos",
        title: "Movimentos Repetitivos das Mãos",
        critical: false,
        frequencyCodes: ["B", "C", "D"],
        options: [
          { code: "A", label: "Não apresenta movimentos repetitivos das mãos." },
          {
            code: "B",
            label: "Movimentos repetitivos de baixa intensidade (pode ser facilmente distraído para outro estímulo)."
          },
          {
            code: "C",
            label: "Movimentos repetitivos de alta intensidade (ignora ou resiste - agita-se/chora/grita - às tentativas do adulto de interromper o comportamento), apenas em situações específicas (ex.: entrada na sala; troca de atividades)."
          },
          {
            code: "D",
            label: "Movimentos repetitivos de alta intensidade (ignora ou resiste - agita-se/chora/grita - às tentativas do adulto de interromper o comportamento), em várias situações."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_16",
        number: 16,
        code: "MRC",
        section: "repetitivos",
        title: "Movimentos Repetitivos de Outras Partes do Corpo",
        critical: true,
        frequencyCodes: ["B", "C", "D"],
        options: [
          {
            code: "A",
            label: "Não apresenta movimentos repetitivos de outras partes do corpo."
          },
          {
            code: "B",
            label: "Movimentos repetitivos de baixa intensidade (pode ser facilmente distraído para outro estímulo)."
          },
          {
            code: "C",
            label: "Movimentos repetitivos de alta intensidade (ignora ou resiste - agita-se/chora/grita - às tentativas do adulto de interromper o comportamento), apenas em situações específicas (ex.: entrada na sala, troca de atividades)."
          },
          {
            code: "D",
            label: "Movimentos repetitivos de alta intensidade (ignora ou resiste - agita-se/chora/grita - às tentativas do adulto de interromper o comportamento), em várias situações."
          },
          { code: "E", label: "Não se aplica." }
        ]
      },
      {
        id: "item_17",
        number: 17,
        code: "CA",
        section: "repetitivos",
        title: "Comportamentos Autolesivos",
        critical: false,
        frequencyCodes: ["B", "C", "D"],
        options: [
          { code: "A", label: "Não apresenta comportamentos autolesivos." },
          {
            code: "B",
            label: "Comportamentos autolesivos de baixa intensidade (o adulto consegue distrair a criança)."
          },
          {
            code: "C",
            label: "Comportamentos autolesivos de alta intensidade (ignora ou resiste às tentativas do adulto de interromper o comportamento), porém restritos a situações específicas (entrada na sala, troca de atividades)."
          },
          {
            code: "D",
            label: "Comportamentos autolesivos intensos (ignora ou resiste às tentativas do adulto de interromper o comportamento) em várias situações."
          },
          { code: "E", label: "Não se aplica." }
        ]
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.PROTEAData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

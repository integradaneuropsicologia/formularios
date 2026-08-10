(function initializeQiiAhsdPreEscolarFamiliaresData(globalScope) {
  "use strict";

  const frequencyOptions = Object.freeze([
    { value: "nunca", label: "Nunca ou não observado" },
    { value: "raramente", label: "Raramente" },
    { value: "as_vezes", label: "Às vezes" },
    { value: "frequentemente", label: "Frequentemente" },
    {
      value: "muito_frequentemente",
      label: "Muito frequentemente / característica marcante"
    },
    {
      value: "nao_observado",
      label: "Não tive oportunidade de observar"
    }
  ]);

  const comparisonOptions = Object.freeze([
    { value: "abaixo", label: "Abaixo do esperado" },
    { value: "semelhante", label: "Semelhante" },
    { value: "um_pouco_acima", label: "Um pouco acima" },
    { value: "muito_acima", label: "Muito acima" },
    { value: "nao_consigo_comparar", label: "Não consigo comparar" }
  ]);

  const relationshipOptions = Object.freeze([
    { value: "mae", label: "Mãe" },
    { value: "pai", label: "Pai" },
    { value: "avo_feminino", label: "Avó" },
    { value: "avo_masculino", label: "Avô" },
    { value: "outro", label: "Outro" }
  ]);

  const coexistenceOptions = Object.freeze([
    { value: "diariamente", label: "Diariamente" },
    { value: "quatro_seis_dias", label: "4–6 dias por semana" },
    { value: "dois_tres_dias", label: "2–3 dias por semana" },
    { value: "um_dia", label: "1 dia por semana" },
    { value: "menos_um_dia", label: "Menos de 1 dia por semana" }
  ]);

  const skillsOptions = Object.freeze([
    { value: "linguagem_vocabulario", label: "Linguagem / vocabulário" },
    { value: "leitura", label: "Leitura" },
    { value: "escrita", label: "Escrita" },
    { value: "matematica_numeros", label: "Matemática / números" },
    { value: "memoria", label: "Memória" },
    { value: "raciocinio_logico", label: "Raciocínio lógico" },
    { value: "ciencias_natureza", label: "Ciências / natureza" },
    { value: "tecnologia", label: "Tecnologia" },
    { value: "musica", label: "Música" },
    { value: "desenho_artes", label: "Desenho / artes visuais" },
    {
      value: "construcao_espacial",
      label: "Construção / habilidades espaciais"
    },
    { value: "movimento_esporte", label: "Movimento / esporte" },
    {
      value: "comunicacao_argumentacao",
      label: "Comunicação / argumentação"
    },
    { value: "lideranca", label: "Liderança" },
    {
      value: "imaginacao_historias",
      label: "Imaginação / criação de histórias"
    },
    { value: "outra", label: "Outra" }
  ]);

  const learningOptions = Object.freeze([
    { value: "sozinha", label: "Principalmente sozinha" },
    { value: "familiares", label: "Com ajuda de familiares" },
    {
      value: "videos_livros_jogos",
      label: "Por meio de vídeos, livros ou jogos"
    },
    { value: "aulas_especificas", label: "Em aulas específicas" },
    { value: "outras_formas", label: "De outras formas" }
  ]);

  const frequencyQuestion = (number, text) => ({
    id: `item_${number}`,
    number,
    label: text,
    type: "single",
    options: frequencyOptions,
    required: true
  });

  const comparisonQuestion = (number, text) => ({
    id: `item_${number}`,
    number,
    label: text,
    type: "single",
    options: comparisonOptions,
    required: true
  });

  const textField = (id, label, type = "textarea") => ({
    id,
    label,
    type,
    required: false
  });

  const sections = [
    {
      id: "aprendizagem_raciocinio",
      index: "A",
      title: "Aprendizagem e raciocínio",
      questions: [
        frequencyQuestion(1, "Aprende informações ou habilidades novas com poucas explicações ou demonstrações."),
        frequencyQuestion(2, "Lembra-se de acontecimentos, informações ou detalhes por períodos surpreendentemente longos."),
        frequencyQuestion(3, "Percebe relações entre fatos ou ideias que outras crianças de idade semelhante geralmente não percebem."),
        frequencyQuestion(4, "Encontra soluções para problemas cotidianos sem precisar da ajuda de um adulto."),
        frequencyQuestion(5, "Compreende explicações ou conceitos considerados complexos para sua idade."),
        frequencyQuestion(6, "Aplica algo que aprendeu em uma situação nova ou diferente."),
        frequencyQuestion(7, "Percebe padrões, sequências, categorias ou regularidades espontaneamente."),
        frequencyQuestion(8, "Surpreende os adultos pela rapidez com que compreende determinadas situações.")
      ],
      supplementary: [
        textField("exemplos_aprendizagem", "Exemplos observados")
      ]
    },
    {
      id: "linguagem_comunicacao",
      index: "B",
      title: "Linguagem e comunicação",
      questions: [
        frequencyQuestion(9, "Utiliza vocabulário considerado avançado ou pouco habitual para sua idade."),
        frequencyQuestion(10, "Expressa pensamentos ou explicações com nível de detalhe incomum para sua idade."),
        frequencyQuestion(11, "Faz perguntas complexas sobre como ou por que as coisas acontecem."),
        frequencyQuestion(12, "Demonstra compreender duplo sentido, humor, metáforas ou relações de significado precocemente."),
        frequencyQuestion(13, "Conta histórias, acontecimentos ou explicações com sequência e riqueza de detalhes.")
      ],
      supplementary: [
        textField(
          "exemplos_linguagem",
          "Exemplos de palavras, perguntas ou falas que chamaram atenção"
        )
      ]
    },
    {
      id: "curiosidade_interesses",
      index: "C",
      title: "Curiosidade e interesses",
      questions: [
        frequencyQuestion(14, "Demonstra curiosidade intensa sobre determinados assuntos."),
        frequencyQuestion(15, "Faz muitas perguntas até compreender profundamente um assunto."),
        frequencyQuestion(16, "Procura espontaneamente novas informações sobre temas que despertam seu interesse."),
        frequencyQuestion(17, "Apresenta interesses considerados incomuns ou avançados para sua idade."),
        frequencyQuestion(18, "Consegue conversar longamente e com muitos detalhes sobre determinados temas."),
        frequencyQuestion(19, "Demonstra conhecimento surpreendentemente aprofundado em alguma área específica.")
      ],
      supplementary: [
        textField("interesse_1", "Primeiro maior interesse da criança", "text"),
        textField("interesse_2", "Segundo maior interesse da criança", "text"),
        textField("interesse_3", "Terceiro maior interesse da criança", "text"),
        textField(
          "conhecimento_interesses",
          "O que ela sabe ou faz nesses assuntos que chama sua atenção?"
        )
      ]
    },
    {
      id: "criatividade_imaginacao",
      index: "D",
      title: "Criatividade e imaginação",
      questions: [
        frequencyQuestion(20, "Inventa histórias, brincadeiras, personagens ou situações originais."),
        frequencyQuestion(21, "Encontra maneiras diferentes ou pouco convencionais de utilizar brinquedos ou objetos."),
        frequencyQuestion(22, "Apresenta várias soluções ou ideias para um mesmo problema."),
        frequencyQuestion(23, "Modifica regras ou cria novas maneiras de realizar uma brincadeira."),
        frequencyQuestion(24, "Produz desenhos, construções, histórias ou brincadeiras com nível incomum de elaboração."),
        frequencyQuestion(25, "Faz associações ou comentários inesperados e originais.")
      ],
      supplementary: [
        textField(
          "exemplo_criatividade",
          "Exemplo de algo especialmente criativo que a criança já fez"
        )
      ]
    },
    {
      id: "persistencia_envolvimento",
      index: "E",
      title: "Persistência e envolvimento com a tarefa",
      questions: [
        frequencyQuestion(26, "Mantém atenção por bastante tempo quando uma atividade realmente lhe interessa."),
        frequencyQuestion(27, "Persiste em uma atividade difícil mesmo depois de encontrar obstáculos."),
        frequencyQuestion(28, "Tenta diferentes estratégias quando a primeira tentativa não funciona."),
        frequencyQuestion(29, "Demonstra necessidade de terminar determinadas atividades ou projetos que iniciou."),
        frequencyQuestion(30, "Pode permanecer profundamente envolvida em uma atividade de interesse, parecendo ignorar o que acontece ao redor."),
        frequencyQuestion(31, "Procura realizar algumas tarefas de forma independente, sem ajuda do adulto.")
      ],
      supplementary: [
        textField(
          "atividades_concentracao",
          "Em quais atividades apresenta maior concentração?"
        ),
        textField(
          "tempo_concentracao",
          "Aproximadamente quanto tempo consegue permanecer espontaneamente nessas atividades?",
          "text"
        )
      ]
    },
    {
      id: "precocidade",
      index: "F",
      title: "Precocidade",
      questions: [
        frequencyQuestion(32, "Apresentou alguma habilidade significativamente antes do esperado para sua idade."),
        frequencyQuestion(33, "Aprendeu espontaneamente letras, números, palavras, músicas, símbolos ou outras informações sem ensino sistemático."),
        frequencyQuestion(34, "Demonstrou interesse precoce por leitura, escrita, números, mapas, calendários, horários, natureza, ciência ou outros sistemas de conhecimento."),
        frequencyQuestion(35, "Adultos que convivem com a criança frequentemente comentam que ela parece ‘mais velha’ em determinadas formas de pensar ou conversar.")
      ],
      supplementary: [
        textField(
          "aprendizagem_precoce",
          "Houve alguma aprendizagem precoce? Descreva e informe aproximadamente com que idade ocorreu."
        )
      ]
    },
    {
      id: "aspectos_sociais_emocionais",
      index: "G",
      title: "Aspectos sociais e emocionais",
      questions: [
        frequencyQuestion(36, "Demonstra preocupação com questões de justiça, regras ou situações que considera injustas."),
        frequencyQuestion(37, "Demonstra sensibilidade intensa diante das emoções de outras pessoas."),
        frequencyQuestion(38, "Prefere, em algumas situações, conversar ou brincar com crianças mais velhas ou adultos."),
        frequencyQuestion(39, "Procura organizar ou propor as regras das brincadeiras quando está com outras crianças."),
        frequencyQuestion(40, "Argumenta ou apresenta justificativas elaboradas quando discorda de um adulto."),
        frequencyQuestion(41, "Demonstra emoções ou preocupações que parecem complexas para sua idade.")
      ],
      supplementary: [
        textField(
          "relacionamento_mesma_idade",
          "Como costuma se relacionar com crianças da mesma idade?"
        ),
        textField(
          "relacionamento_mais_velhos",
          "E com crianças mais velhas ou adultos?"
        )
      ]
    }
  ];

  const respondentFields = [
    {
      id: "parentesco",
      label: "Parentesco",
      type: "single",
      options: relationshipOptions,
      required: true
    },
    {
      id: "parentesco_outro",
      label: "Informe o parentesco",
      type: "text",
      required: false,
      requiredWhen: { fieldId: "parentesco", equals: "outro" }
    },
    {
      id: "frequencia_convivencia",
      label: "Com que frequência convive com a criança?",
      type: "single",
      options: coexistenceOptions,
      required: true
    },
    {
      id: "tempo_acompanhamento",
      label: "Há quanto tempo acompanha de perto o desenvolvimento da criança?",
      type: "text",
      required: true
    }
  ];

  const skillsFields = [
    {
      id: "habilidades_especificas",
      label: "Habilidades especialmente desenvolvidas percebidas",
      type: "multiple",
      options: skillsOptions,
      required: false
    },
    {
      id: "habilidade_outra",
      label: "Outra habilidade especialmente desenvolvida",
      type: "text",
      required: false,
      requiredWhen: { fieldId: "habilidades_especificas", includes: "outra" }
    },
    textField("area_maior_destaque", "Qual dessas áreas mais se destaca?", "text"),
    textField("descricao_area_destaque", "O que a criança faz nessa área?"),
    textField("idade_habilidade", "Desde que idade você percebe essa habilidade?", "text"),
    {
      id: "forma_aprendizagem",
      label: "Como ela aprendeu?",
      type: "multiple",
      options: learningOptions,
      required: false
    },
    {
      id: "forma_aprendizagem_outra",
      label: "Descreva as outras formas de aprendizagem",
      type: "text",
      required: false,
      requiredWhen: {
        fieldId: "forma_aprendizagem",
        includes: "outras_formas"
      }
    }
  ];

  const comparisonQuestions = [
    comparisonQuestion(42, "Velocidade para aprender"),
    comparisonQuestion(43, "Vocabulário e capacidade de conversar"),
    comparisonQuestion(44, "Memória"),
    comparisonQuestion(45, "Curiosidade"),
    comparisonQuestion(46, "Criatividade"),
    comparisonQuestion(47, "Profundidade dos interesses"),
    comparisonQuestion(48, "Capacidade de raciocínio e resolução de problemas")
  ];

  const qualitativeQuestions = [
    {
      id: "item_49",
      number: 49,
      label: "O que mais chama sua atenção no desenvolvimento dessa criança?",
      type: "textarea",
      required: false
    },
    {
      id: "item_50",
      number: 50,
      label: "Conte uma situação em que ela surpreendeu você pelo que sabia, falou ou fez.",
      type: "textarea",
      required: false
    },
    {
      id: "item_51",
      number: 51,
      label: "Há alguma habilidade que ela tenha aprendido praticamente sozinha?",
      type: "textarea",
      required: false
    },
    {
      id: "item_52",
      number: 52,
      label: "Existe algum assunto sobre o qual ela saiba muito mais do que você esperaria para uma criança de 4 anos?",
      type: "textarea",
      required: false
    },
    {
      id: "item_53",
      number: 53,
      label: "Existe algum comportamento ou dificuldade que preocupe você?",
      type: "textarea",
      required: false
    },
    {
      id: "item_54",
      number: 54,
      label: "Existe alguma característica importante sobre a criança que não foi perguntada neste questionário?",
      type: "textarea",
      required: false
    }
  ];

  const data = Object.freeze({
    formCode: "QIIAHSD_PRE_ESCOLAR_FAMILIARES_V2",
    formName: "Questionário Complementar de Indicadores de Altas Habilidades/Superdotação - Pré-escolar - Familiares",
    title: "Questionário complementar de indicadores de altas habilidades/superdotação",
    shortTitle: "QIIAHSD Pré-escolar",
    audience: "Crianças pré-escolares - versão para familiares",
    instructions: [
      "Responda pensando em como a criança geralmente se comporta, principalmente quando está envolvida em atividades de seu interesse.",
      "Considere comportamentos espontâneos, sem que um adulto precise ensinar, insistir ou estimular continuamente. Sempre que possível, compare com outras crianças da mesma idade que você conhece."
    ],
    respondentFields,
    sections,
    skillsSection: {
      id: "habilidades_especificas",
      index: "H",
      title: "Habilidades específicas",
      description: "Assinale todas as habilidades especialmente desenvolvidas que você percebe.",
      fields: skillsFields
    },
    comparisonSection: {
      id: "comparacao_mesma_idade",
      index: "I",
      title: "Comparação com crianças da mesma idade",
      description: "Pense em outras crianças de aproximadamente 4 anos que você conhece.",
      questions: comparisonQuestions
    },
    qualitativeSection: {
      id: "informacoes_qualitativas",
      index: "J",
      title: "Informações qualitativas",
      description: "Use estes campos para registrar exemplos e observações importantes.",
      questions: qualitativeQuestions
    }
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.QIIAHSDPreEscolarFamiliaresData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

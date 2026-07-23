(function initializeIdadiData(globalScope) {
  "use strict";

  const data = {
  "formCode": "IDADI_V2",
  "formName": "IDADI - Inventário Dimensional de Avaliação do Desenvolvimento Infantil",
  "schemaVersion": 1,
  "supportedAge": {
    "minMonths": 4,
    "maxMonths": 72
  },
  "responses": [
    {
      "value": "sim",
      "label": "Sim",
      "score": 2
    },
    {
      "value": "as_vezes",
      "label": "Às vezes",
      "score": 1
    },
    {
      "value": "ainda_nao",
      "label": "Ainda não",
      "score": 0
    },
    {
      "value": "nao_observado",
      "label": "Não observado",
      "score": null
    }
  ],
  "domains": [
    {
      "code": "C",
      "label": "Cognitivo",
      "shortLabel": "Cognitivo"
    },
    {
      "code": "SE",
      "label": "Socioemocional",
      "shortLabel": "Socioemocional"
    },
    {
      "code": "CLR",
      "label": "Comunicação e Linguagem Receptiva",
      "shortLabel": "Linguagem receptiva"
    },
    {
      "code": "CLE",
      "label": "Comunicação e Linguagem Expressiva",
      "shortLabel": "Linguagem expressiva"
    },
    {
      "code": "MA",
      "label": "Motricidade Ampla",
      "shortLabel": "Motricidade ampla"
    },
    {
      "code": "MF",
      "label": "Motricidade Fina",
      "shortLabel": "Motricidade fina"
    },
    {
      "code": "CA",
      "label": "Comportamento Adaptativo",
      "shortLabel": "Comportamento adaptativo"
    }
  ],
  "ranges": {
    "C": [
      {
        "minMonths": 4,
        "maxMonths": 5,
        "start": 1,
        "end": 22
      },
      {
        "minMonths": 6,
        "maxMonths": 8,
        "start": 7,
        "end": 27
      },
      {
        "minMonths": 9,
        "maxMonths": 11,
        "start": 12,
        "end": 35
      },
      {
        "minMonths": 12,
        "maxMonths": 14,
        "start": 20,
        "end": 40
      },
      {
        "minMonths": 15,
        "maxMonths": 17,
        "start": 20,
        "end": 49
      },
      {
        "minMonths": 18,
        "maxMonths": 23,
        "start": 20,
        "end": 58
      },
      {
        "minMonths": 24,
        "maxMonths": 26,
        "start": 22,
        "end": 63
      },
      {
        "minMonths": 27,
        "maxMonths": 29,
        "start": 24,
        "end": 65
      },
      {
        "minMonths": 30,
        "maxMonths": 35,
        "start": 26,
        "end": 67
      },
      {
        "minMonths": 36,
        "maxMonths": 41,
        "start": 35,
        "end": 71
      },
      {
        "minMonths": 42,
        "maxMonths": 47,
        "start": 35,
        "end": 74
      },
      {
        "minMonths": 48,
        "maxMonths": 53,
        "start": 40,
        "end": 80
      },
      {
        "minMonths": 54,
        "maxMonths": 59,
        "start": 41,
        "end": 85
      },
      {
        "minMonths": 60,
        "maxMonths": 65,
        "start": 51,
        "end": 87
      },
      {
        "minMonths": 66,
        "maxMonths": 72,
        "start": 51,
        "end": 90
      }
    ],
    "SE": [
      {
        "minMonths": 4,
        "maxMonths": 5,
        "start": 1,
        "end": 26
      },
      {
        "minMonths": 6,
        "maxMonths": 8,
        "start": 2,
        "end": 29
      },
      {
        "minMonths": 9,
        "maxMonths": 11,
        "start": 4,
        "end": 36
      },
      {
        "minMonths": 12,
        "maxMonths": 14,
        "start": 7,
        "end": 42
      },
      {
        "minMonths": 15,
        "maxMonths": 17,
        "start": 18,
        "end": 51
      },
      {
        "minMonths": 18,
        "maxMonths": 23,
        "start": 20,
        "end": 64
      },
      {
        "minMonths": 24,
        "maxMonths": 29,
        "start": 21,
        "end": 72
      },
      {
        "minMonths": 30,
        "maxMonths": 35,
        "start": 24,
        "end": 72
      },
      {
        "minMonths": 36,
        "maxMonths": 47,
        "start": 28,
        "end": 74
      },
      {
        "minMonths": 48,
        "maxMonths": 59,
        "start": 42,
        "end": 74
      },
      {
        "minMonths": 60,
        "maxMonths": 72,
        "start": 43,
        "end": 74
      }
    ],
    "CLR": [
      {
        "minMonths": 4,
        "maxMonths": 5,
        "start": 1,
        "end": 6
      },
      {
        "minMonths": 6,
        "maxMonths": 8,
        "start": 1,
        "end": 9
      },
      {
        "minMonths": 9,
        "maxMonths": 11,
        "start": 1,
        "end": 11
      },
      {
        "minMonths": 12,
        "maxMonths": 14,
        "start": 4,
        "end": 19
      },
      {
        "minMonths": 15,
        "maxMonths": 17,
        "start": 4,
        "end": 25
      },
      {
        "minMonths": 18,
        "maxMonths": 20,
        "start": 6,
        "end": 34
      },
      {
        "minMonths": 21,
        "maxMonths": 29,
        "start": 6,
        "end": 37
      },
      {
        "minMonths": 30,
        "maxMonths": 35,
        "start": 8,
        "end": 39
      },
      {
        "minMonths": 36,
        "maxMonths": 47,
        "start": 13,
        "end": 41
      },
      {
        "minMonths": 48,
        "maxMonths": 59,
        "start": 18,
        "end": 41
      },
      {
        "minMonths": 60,
        "maxMonths": 72,
        "start": 28,
        "end": 41
      }
    ],
    "CLE": [
      {
        "minMonths": 4,
        "maxMonths": 8,
        "start": 1,
        "end": 6
      },
      {
        "minMonths": 9,
        "maxMonths": 11,
        "start": 2,
        "end": 8
      },
      {
        "minMonths": 12,
        "maxMonths": 17,
        "start": 4,
        "end": 20
      },
      {
        "minMonths": 18,
        "maxMonths": 20,
        "start": 4,
        "end": 26
      },
      {
        "minMonths": 21,
        "maxMonths": 23,
        "start": 4,
        "end": 38
      },
      {
        "minMonths": 24,
        "maxMonths": 26,
        "start": 6,
        "end": 44
      },
      {
        "minMonths": 27,
        "maxMonths": 35,
        "start": 7,
        "end": 50
      },
      {
        "minMonths": 36,
        "maxMonths": 47,
        "start": 11,
        "end": 50
      },
      {
        "minMonths": 48,
        "maxMonths": 59,
        "start": 20,
        "end": 50
      },
      {
        "minMonths": 60,
        "maxMonths": 72,
        "start": 39,
        "end": 50
      }
    ],
    "MA": [
      {
        "minMonths": 4,
        "maxMonths": 5,
        "start": 1,
        "end": 17
      },
      {
        "minMonths": 6,
        "maxMonths": 8,
        "start": 2,
        "end": 21
      },
      {
        "minMonths": 9,
        "maxMonths": 11,
        "start": 6,
        "end": 25
      },
      {
        "minMonths": 12,
        "maxMonths": 14,
        "start": 19,
        "end": 34
      },
      {
        "minMonths": 15,
        "maxMonths": 20,
        "start": 22,
        "end": 45
      },
      {
        "minMonths": 21,
        "maxMonths": 23,
        "start": 25,
        "end": 49
      },
      {
        "minMonths": 24,
        "maxMonths": 26,
        "start": 27,
        "end": 52
      },
      {
        "minMonths": 27,
        "maxMonths": 29,
        "start": 27,
        "end": 57
      },
      {
        "minMonths": 30,
        "maxMonths": 32,
        "start": 30,
        "end": 57
      },
      {
        "minMonths": 33,
        "maxMonths": 35,
        "start": 32,
        "end": 57
      },
      {
        "minMonths": 36,
        "maxMonths": 47,
        "start": 34,
        "end": 60
      },
      {
        "minMonths": 48,
        "maxMonths": 59,
        "start": 38,
        "end": 61
      },
      {
        "minMonths": 60,
        "maxMonths": 72,
        "start": 47,
        "end": 61
      }
    ],
    "MF": [
      {
        "minMonths": 4,
        "maxMonths": 5,
        "start": 1,
        "end": 10
      },
      {
        "minMonths": 6,
        "maxMonths": 8,
        "start": 4,
        "end": 15
      },
      {
        "minMonths": 9,
        "maxMonths": 11,
        "start": 5,
        "end": 17
      },
      {
        "minMonths": 12,
        "maxMonths": 14,
        "start": 9,
        "end": 23
      },
      {
        "minMonths": 15,
        "maxMonths": 17,
        "start": 10,
        "end": 26
      },
      {
        "minMonths": 18,
        "maxMonths": 23,
        "start": 10,
        "end": 27
      },
      {
        "minMonths": 24,
        "maxMonths": 29,
        "start": 11,
        "end": 30
      },
      {
        "minMonths": 30,
        "maxMonths": 32,
        "start": 13,
        "end": 33
      },
      {
        "minMonths": 33,
        "maxMonths": 35,
        "start": 18,
        "end": 33
      },
      {
        "minMonths": 36,
        "maxMonths": 41,
        "start": 22,
        "end": 38
      },
      {
        "minMonths": 42,
        "maxMonths": 47,
        "start": 22,
        "end": 40
      },
      {
        "minMonths": 48,
        "maxMonths": 53,
        "start": 22,
        "end": 41
      },
      {
        "minMonths": 54,
        "maxMonths": 59,
        "start": 24,
        "end": 41
      },
      {
        "minMonths": 60,
        "maxMonths": 72,
        "start": 28,
        "end": 41
      }
    ],
    "CA": [
      {
        "minMonths": 6,
        "maxMonths": 11,
        "start": 1,
        "end": 11
      },
      {
        "minMonths": 12,
        "maxMonths": 17,
        "start": 1,
        "end": 19
      },
      {
        "minMonths": 18,
        "maxMonths": 23,
        "start": 5,
        "end": 26
      },
      {
        "minMonths": 24,
        "maxMonths": 26,
        "start": 8,
        "end": 44
      },
      {
        "minMonths": 27,
        "maxMonths": 29,
        "start": 10,
        "end": 44
      },
      {
        "minMonths": 30,
        "maxMonths": 32,
        "start": 11,
        "end": 44
      },
      {
        "minMonths": 33,
        "maxMonths": 35,
        "start": 14,
        "end": 44
      },
      {
        "minMonths": 36,
        "maxMonths": 47,
        "start": 14,
        "end": 56
      },
      {
        "minMonths": 48,
        "maxMonths": 53,
        "start": 19,
        "end": 75
      },
      {
        "minMonths": 54,
        "maxMonths": 59,
        "start": 19,
        "end": 78
      },
      {
        "minMonths": 60,
        "maxMonths": 72,
        "start": 23,
        "end": 78
      }
    ]
  },
  "items": {
    "C": {
      "C1": "Olha para objetos que estão próximos.",
      "C2": "Segue com os olhos objetos movimentados à sua frente.",
      "C3": "Reconhece você (ex.: demonstra satisfação ao te ver).",
      "C4": "Explora a própria mão (ex.: põe na boca).",
      "C5": "Olha ou vira o rosto em direção a um som.",
      "C6": "Olha para um brinquedo que foi colocado na mão dele.",
      "C7": "Reage (dando sorrisos, gritinhos) a uma brincadeira de esconder e mostrar o rosto.",
      "C8": "Leva objetos à boca.",
      "C9": "Manipula objetos (ex.: sacode, põe na boca ou movimenta).",
      "C10": "Olha demoradamente para a própria imagem na frente do espelho.",
      "C11": "Estende os braços em direção a um brinquedo colocado na frente dele.",
      "C12": "Busca com insistência por um objeto de interesse (ex.: move-se para pegá-lo).",
      "C13": "Bate um brinquedo no chão ou na mesa.",
      "C14": "Passa o brinquedo de uma mão para outra.",
      "C15": "Procura por um objeto que deixou cair.",
      "C16": "Pega dois brinquedos pequenos, um em cada mão, e os segura.",
      "C17": "Joga várias vezes o brinquedo no chão para que você pegue e entregue a ele de volta (como forma de brincadeira).",
      "C18": "Pega dois brinquedos, um em cada mão, e bate um no outro.",
      "C19": "Tira objetos de dentro de um recipiente (ex.: brinquedos de dentro de uma caixa).",
      "C20": "Depois de ver você esconder um brinquedo pequeno debaixo de um papel ou pano, ele procura esse brinquedo.",
      "C21": "Aperta um brinquedo de borracha para fazer barulho (ex.: pato, urso).",
      "C22": "Imita gestos que você faz (ex.: piscar os olhos, puxar a orelha).",
      "C23": "Quando está de pé, empurra uma cadeira, um carrinho ou outro brinquedo.",
      "C24": "Sabe onde os brinquedos ficam guardados na casa.",
      "C25": "Reconhece a própria imagem no espelho (ex.: você pergunta: \"Onde está o nenê?\" e ele aponta a própria imagem).",
      "C26": "Brinca juntando dois objetos que geralmente são usados juntos (ex.: mexe uma colher numa xícara, tenta colocar a tampa em uma garrafa).",
      "C27": "Vira um objeto para o lado certo para usá-lo (ex.: uma colher virada ao contrário, um lápis que estava com a ponta para cima).",
      "C28": "Risca um papel com lápis ou giz de cera depois de ver você riscar.",
      "C29": "Depois que a criança faz um desenho, mesmo que seja um simples rabisco, ela conta a você o que desenhou.",
      "C30": "Empilha três blocos ou brinquedos (ex.: cubos de plástico ou madeira, carrinhos, dados).",
      "C31": "Tenta pegar um brinquedo ou objeto fora do alcance usando um outro objeto (como lápis, vareta) depois de você ter mostrado como fazer.",
      "C32": "Risca um papel com lápis ou giz de cera por iniciativa própria.",
      "C33": "Se você organiza objetos em fileira, a criança é capaz de imitar enfileirando ao menos dois objetos.",
      "C34": "Usa uma cadeira, banco ou caixa para pegar objetos que estão longe do alcance.",
      "C35": "Faz de conta que um objeto é outra coisa (ex.: usa um controle remoto como telefone, uma caixa como carrinho).",
      "C36": "Tira a tampa de uma garrafa (não precisa ser de rosca).",
      "C37": "Empilha muitos blocos ou brinquedos (dez ou mais).",
      "C38": "Compreende o que \"um\" quer dizer (ex.: entrega a você apenas um objeto quando você pede \"um\").",
      "C39": "Brinca de ler livros (ex.: finge estar lendo).",
      "C40": "Brinca de faz de conta com bonecos com um adulto.",
      "C41": "Aponta ou diz o \"maior\" entre dois objetos quando é pedido.",
      "C42": "Presta atenção em uma história curta que é lida para ele.",
      "C43": "Canta uma canção simples (não precisa ser completa).",
      "C44": "Repete dois números na ordem correta (ex.: o adulto diz: \"7-3\" e a criança repete: \"7-3\").",
      "C45": "Brinca de faz de conta sem brinquedos (ex.: finge que está dirigindo, comendo, cozinhando).",
      "C46": "Conta corretamente três ou mais objetos.",
      "C47": "Diz corretamente o nome de três cores.",
      "C48": "Sabe que moedas e notas (ou cédulas) são dinheiro.",
      "C49": "Faz de conta que é outra pessoa ou outra coisa.",
      "C50": "Usa objetos imaginários na brincadeira (ex.: põe a mão próxima do rosto e finge estar falando ao telefone; canta com a mão perto da boca, como se ela fosse um microfone).",
      "C51": "Segue as regras de jogos simples (ex.: baralho, dominó, memória).",
      "C52": "Compara duas coisas em relação ao tamanho (ex.: diz: \"Este é maior\", \"Mais grande\", \"Mais alto\").",
      "C53": "Compara duas coisas em relação ao peso (ex.: diz: \"Este é mais pesado\", \"Mais gordo\").",
      "C54": "Conta corretamente de 1 a 10.",
      "C55": "Sabe de memória quantos dedos tem em cada mão.",
      "C56": "Pergunta o que os sinais querem dizer (ex.: sinais de trânsito, marcas de produtos).",
      "C57": "Repete na ordem correta três números (ex.: o adulto diz: \"5-8-3\" e a criança repete: \"5-8-3\").",
      "C58": "Sabe agrupar objetos pela cor (ex.: junta todos os brinquedos vermelhos).",
      "C59": "Separa objetos pelo tamanho (ex.: separa os pequenos dos grandes).",
      "C60": "Conta corretamente cinco objetos.",
      "C61": "Diz corretamente o nome de cinco cores.",
      "C62": "Diz todas as letras do alfabeto em ordem, sem ajuda.",
      "C63": "Conta corretamente dez objetos.",
      "C64": "Sabe qual é a mão esquerda e a mão direita.",
      "C65": "Escreve cinco ou mais letras ou números.",
      "C66": "Escreve corretamente o primeiro nome (ou pelo menos quatro letras do nome).",
      "C67": "Reconhece e dá nome a pelo menos cinco letras do alfabeto (não precisa ser em ordem alfabética).",
      "C68": "Conta corretamente de 1 a 15.",
      "C69": "Faz comparações usando opostos (ex.: \"A mãe é grande, a menina é pequena\").",
      "C70": "Diz corretamente o nome de pelo menos quatro letras do próprio nome (não precisa ser na ordem).",
      "C71": "Conta corretamente de 1 a 30.",
      "C72": "Copia algumas palavras.",
      "C73": "Sabe de memória o número de dedos que tem nas duas mãos juntas (sem contar nos dedos).",
      "C74": "Diz o nome de pelo menos seis dos sete dias da semana.",
      "C75": "Sabe a diferença entre manhã e tarde.",
      "C76": "Escreve corretamente os números de 1 a 9.",
      "C77": "Responde corretamente a contas de soma (ex.: \"Quanto é 2 + 2? 1 + 4? 3 + 6?\").",
      "C78": "Responde corretamente a contas de subtração (ex.: \"Quanto é 4 - 2? 6 - 3?\").",
      "C79": "Diz a hora a partir da leitura de um relógio digital (sem ponteiros) em horas e minutos.",
      "C80": "Reconhece e dá nome a todas as letras do alfabeto (ex.: se você mostra a letra J, ele diz: \"Jota\").",
      "C81": "Lê algumas palavras simples em um livro (sem auxílio de figuras).",
      "C82": "Lê em voz alta quatro ou mais palavras.",
      "C83": "Escreve corretamente nome e sobrenome.",
      "C84": "Tenta ler as palavras separando-as em partes (ex.: sa-pa-to).",
      "C85": "Conta de trás para frente de 10 até 1.",
      "C86": "Diz corretamente o nome de todos os dias da semana.",
      "C87": "Sabe o que é direita e esquerda.",
      "C88": "Diz corretamente qual dia da semana é hoje.",
      "C89": "Diz o dia e o mês do próprio aniversário quando perguntam.",
      "C90": "Conta de trás para frente de 20 até 1."
    },
    "SE": {
      "SE1": "Parece gostar que você dance ou se movimente com ele nos braços (ex.: se acalma ou sorri).",
      "SE2": "Responde rapidamente quando você o toca (ex.: olha, se vira ou sorri).",
      "SE3": "Olha ou vira o rosto em direção à voz de pessoas com quem tem contato.",
      "SE4": "Sorri quando vê você ou o cuidador principal.",
      "SE5": "Quando ele está chorando você consegue acalmá-lo.",
      "SE6": "Quando você brinca ou fala com ele, ele responde com sons ou expressões faciais (ex.: gritinhos, sorrisos ou caretas).",
      "SE7": "Fica tranquilo diante da maior parte dos sons ou barulhos familiares.",
      "SE8": "Acalma-se, parando de chorar, ao ouvir a sua voz.",
      "SE9": "Fica relaxado quando é segurado no colo (ex.: se aconchega).",
      "SE10": "Dá gritinhos ou gargalhadas quando está feliz ou muito satisfeito.",
      "SE11": "Quando você sorri, ele sorri de volta.",
      "SE12": "Demonstra ficar feliz quando vê você retornando (ex.: sorri ou faz sons).",
      "SE13": "Distrai-se sozinho com os próprios brinquedos.",
      "SE14": "Atende rapidamente quando você o chama.",
      "SE15": "Quando você tira e coloca um pano no rosto, ele sorri ou demonstra satisfação.",
      "SE16": "Presta atenção nas conversas das pessoas (ex.: olha para as pessoas que estão falando).",
      "SE17": "Fica tranquilo ao tocar ou ser tocado por coisas de diferentes texturas (ex.: lisa, rugosa, macia, áspera).",
      "SE18": "Procura você quando está em um grupo de pessoas com quem tem pouco contato.",
      "SE19": "Levanta os braços quando quer ser pego no colo.",
      "SE20": "Protesta (chora ou fica agitado) quando um brinquedo que gosta é retirado das mãos dele, mas em seguida consegue se acalmar.",
      "SE21": "Tenta falar quando as pessoas falam ou brincam com ele.",
      "SE22": "Interage com uma criança ou adulto envolvendo contato físico (ex.: dar as mãos em brincadeira de roda).",
      "SE23": "Abre os braços para abraçar quando você faz o mesmo.",
      "SE24": "Imita palavras e gestos enquanto brinca com você.",
      "SE25": "Abraça e beija os pais ou outras pessoas de quem gosta.",
      "SE26": "Aponta para um objeto e olha para você para indicar o que quer.",
      "SE27": "Fala algumas palavras ou mostra objetos para indicar o que gosta ou não gosta (ex.: diz: \"Não quero\", \"Dá\" ou mostra uma comida que quer).",
      "SE28": "Brinca com outras crianças quando convidado.",
      "SE29": "Normalmente obedece a um adulto.",
      "SE30": "Imita ações de adultos (ex.: faz de conta que está varrendo, dirigindo).",
      "SE31": "Quando está em um lugar novo, se afasta um pouco de você se for incentivado.",
      "SE32": "Chama você para olhar quando ele está fazendo algo.",
      "SE33": "Pede ajuda aos outros quando necessário.",
      "SE34": "Corre em direção aos familiares e amigos próximos para cumprimentá-los.",
      "SE35": "Deixa outras crianças brincarem com os brinquedos dele.",
      "SE36": "Aceita esperar por pouco tempo.",
      "SE37": "Procura fazer amizade com outras crianças de sua idade.",
      "SE38": "Convida outras crianças para brincar.",
      "SE39": "Faz perguntas buscando comunicar o que quer fazer (ex.: \"Mamãe, sair?\", \"Jogar bola?\").",
      "SE40": "Segue as instruções de um adulto quando está fazendo atividades em um grupo de crianças.",
      "SE41": "Usa palavras para fazer pedidos a outras crianças.",
      "SE42": "Brinca de faz de conta com adultos.",
      "SE43": "Demonstra entender que os outros estão tristes ou chateados (ex.: fica perto ou consola).",
      "SE44": "Colabora com as outras crianças para construírem coisas juntas (ex.: torre com blocos, casinha na areia).",
      "SE45": "Comporta-se bem em atividades de grupo (ex.: espera sua vez, ajuda, compartilha coisas, ouve).",
      "SE46": "Responde da maneira esperada quando é apresentado a outras pessoas (ex.: diz: \"Oi\" ou \"Olá\").",
      "SE47": "Brinca de faz de conta com outras crianças.",
      "SE48": "Cumprimenta outras crianças por iniciativa própria (ex.: diz: \"Oi\", \"Ei\" ou \"Olá\").",
      "SE49": "Tenta ajudar com as tarefas de casa (não precisa fazer corretamente).",
      "SE50": "Tem um amigo preferido para brincar.",
      "SE51": "Indica direções para outras crianças (ex.: aponta e diz: \"Por ali\").",
      "SE52": "Fala sobre os sentimentos das outras pessoas (ex.: diz: \"Papai está bravo\", \"Mamãe está alegre\").",
      "SE53": "Fala positivamente sobre ele mesmo (ex.: \"Eu sou grande\", \"Eu sou legal\").",
      "SE54": "Evita empurrar ou bater em outra criança quando está irritado ou chateado.",
      "SE55": "Pede desculpas quando percebe que fez algo errado.",
      "SE56": "Faz comentários sobre outras crianças ou pessoas (ex.: diz que um coleguinha é legal ou chato).",
      "SE57": "Consegue responder a perguntas sobre o porquê de algo (ex.: se você pergunta por que ele quer comer, ele responde: \"Porque estou com fome\").",
      "SE58": "Conversa (responde e faz perguntas) com outras pessoas sobre um mesmo assunto por alguns minutos.",
      "SE59": "Oferece ajuda aos outros.",
      "SE60": "Brinca de jogos com regras, como esconde-esconde ou amarelinha com as outras crianças.",
      "SE61": "Aceita (não perde o controle) quando você o corrige por mal comportamento.",
      "SE62": "Diz como se sente (ex.: fala se está feliz, triste, com medo ou com raiva).",
      "SE63": "Agradece espontaneamente quando ganha um presente ou recebe um elogio (ex.: diz: \"Obrigado!\").",
      "SE64": "Fala sobre como está se sentindo para explicar os próprios comportamentos (ex.: a mãe pergunta: \"Por que você está chorando?\", ele responde: \"Porque estou triste\").",
      "SE65": "Demonstra preocupação (ex.: pergunta se está tudo bem quando percebe que alguém está triste).",
      "SE66": "Brinca de faz de conta com amigos montando uma história que faz sentido.",
      "SE67": "Dá justificativas por não ter feito algo (ex.: \"Não guardei os brinquedos porque estava cansado\").",
      "SE68": "Pede ajuda, informações ou explicações para outras crianças.",
      "SE69": "Protege ou tenta proteger as crianças mais novas.",
      "SE70": "Tenta ser o líder com crianças mais novas (ex.: orienta e ajuda).",
      "SE71": "Sai do caminho de outra pessoa se percebe que está atrapalhando.",
      "SE72": "Entende (não se irrita ou não briga) quando um amigo prefere brincar com uma outra criança.",
      "SE73": "Consegue abrir mão das próprias vontades em benefício do grupo (ex.: aceita a vontade da maioria na escolha de um jogo ou brincadeira).",
      "SE74": "Evita dizer algo que pode envergonhar ou magoar os outros."
    },
    "CLR": {
      "CLR1": "Sorri quando ouve a sua voz.",
      "CLR2": "Responde ao ser chamado pelo nome (ex.: olha na direção de quem chama).",
      "CLR3": "Imita alguns sons que você faz.",
      "CLR4": "Olha para onde você aponta (ex.: para um brinquedo que você quer mostrar).",
      "CLR5": "Demonstra entender o significado de \"sim\".",
      "CLR6": "Obedece a ordens que requerem uma ação e um objeto (ex.: se você diz: \"Pegue a bola\" ele pega).",
      "CLR7": "Entende um pedido para uma atividade de rotina (ex.: \"Venha comer\").",
      "CLR8": "Entende o que um adulto está dizendo para fazer.",
      "CLR9": "Demonstra entender o significado do \"não\" (ex.: se você diz que não tem uma comida, ele pede outra).",
      "CLR10": "Quando perguntado, mostra corretamente pelo menos uma parte do corpo (ex.: \"Cadê a boca, mão, nariz?\").",
      "CLR11": "Entende o significado de \"abrir\" e \"fechar\".",
      "CLR12": "Responde a perguntas como: \"Como o cachorro faz?\", \"Como o gato faz?\" (ex.: diz: \"Au, au\", \"Miau\").",
      "CLR13": "Sabe o que significa \"ligar\" e \"desligar\".",
      "CLR14": "Segue duas instruções relacionadas (ex.: \"Vá para o seu quarto e traga a bola\").",
      "CLR15": "Entende palavras que descrevem ações (ex.: trabalhando, dormindo, comendo).",
      "CLR16": "Quando perguntado, mostra corretamente pelo menos oito partes do corpo (ex.: cabeça, olhos, nariz, orelha, boca, barriga, mãos, braços, pernas, pés).",
      "CLR17": "Demonstra compreender histórias lidas para ele de livros com figuras (ex.: aponta as figuras da parte que é lida).",
      "CLR18": "Compreende frases no tempo passado (ex.: \"O desenho da TV terminou\").",
      "CLR19": "Entende o significado de \"para cima\" e \"para baixo\".",
      "CLR20": "Sabe o que a palavra \"mais\" significa (ex.: diz onde tem mais brinquedos).",
      "CLR21": "Segue duas instruções não relacionadas (ex.: \"Guarde o brinquedo e venha almoçar\").",
      "CLR22": "Entende o significado de palavras que indicam localização, como \"em\", \"em cima\", \"embaixo\" e \"ao lado\" (ex.: \"Coloque o controle da TV ao lado do vaso\").",
      "CLR23": "Entende corretamente as palavras \"meu\" e \"seu\" ou \"teu\".",
      "CLR24": "Identifica categorias de objetos (ex.: sabe que banana, laranja e uva são frutas; que cavalo, cachorro e elefante são animais).",
      "CLR25": "Responde corretamente quantos anos tem (diz ou mostra nos dedos).",
      "CLR26": "Responde corretamente a perguntas sobre para que servem os objetos (ex.: \"Para que serve uma colher? Um carrinho?\").",
      "CLR27": "Sabe o que a palavra \"menos\" significa (ex.: diz quem tem menos comida).",
      "CLR28": "Segue ordens na forma \"se/então\" (ex.: \"Se acabou de brincar, então guarde o brinquedo\").",
      "CLR29": "Entende uma história contada por você por pelo menos cinco minutos (ex.: pergunta detalhes da história ou conta para outra pessoa).",
      "CLR30": "Entende a diferença entre eu, você/tu, ele, nós, eles.",
      "CLR31": "Demonstra compreender histórias contadas para ele (ex.: faz perguntas sobre detalhes da história).",
      "CLR32": "Sabe o que significa \"o menor\" (diz corretamente qual é o menor entre dois objetos).",
      "CLR33": "Entende corretamente expressões como \"o maior\", \"o mais forte\" e \"o mais bonito\".",
      "CLR34": "Entende corretamente as palavras \"deles/delas\" e \"nossos\".",
      "CLR35": "Entende corretamente as palavras \"igual\" e \"diferente\".",
      "CLR36": "Entende corretamente as palavras \"fácil\" e \"difícil\".",
      "CLR37": "Entende corretamente quando as pessoas dizem \"antes\" ou \"depois\".",
      "CLR38": "Segue três instruções não relacionadas (ex.: \"Guarde o brinquedo, desligue a TV e vá escovar os dentes\").",
      "CLR39": "Sabe o que \"a maioria\" significa (ex.: \"A maioria dos brinquedos é carrinho\").",
      "CLR40": "Entende o significado das palavras \"hoje\", \"ontem\" e \"amanhã\".",
      "CLR41": "Conversa com as pessoas respeitando a vez de falar e ouvir."
    },
    "CLE": {
      "CLE1": "Sorri e faz sons demonstrando que está feliz.",
      "CLE2": "Faz sons como \"Uuhh\", \"Gahh\" e \"Ahh\".",
      "CLE3": "Balbucia (faz sons) de forma espontânea (ex.: \"Bu bu bu\", \"Da da da\").",
      "CLE4": "Diz \"Mamã\" ou \"Papá\" ou palavra semelhante.",
      "CLE5": "Usa gestos para se expressar (ex.: dá tchau, manda beijos).",
      "CLE6": "Balança a cabeça para responder \"não\" a questões simples.",
      "CLE7": "Pede \"mais\" ou \"outro\" (ex.: \"Mais água\" ou \"Outro pão\").",
      "CLE8": "Repete palavras que os outros dizem.",
      "CLE9": "Fala uma frase com duas palavras (ex.: \"Mamã, dá!\").",
      "CLE10": "Chama a atenção de outras pessoas (ex.: diz: \"Olha\", chamando para ver um brinquedo).",
      "CLE11": "Diz o nome das pessoas (ex.: da mãe, do pai, de familiares e amigos próximos).",
      "CLE12": "Diz corretamente o nome de alguns objetos ou figuras quando olha livros ou revistas.",
      "CLE13": "Diz a palavra \"não\" de forma correta em frases (ex.: \"Não quero\").",
      "CLE14": "Usa palavras acompanhadas de gestos (ex.: diz: \"Quero ir no carro\", enquanto aponta o carro).",
      "CLE15": "Faz perguntas para pedir o que quer (ex.: \"Mamãe, sair?\", \"Jogar bola?\").",
      "CLE16": "Diz \"meu\" ou \"minha\" para falar das próprias coisas.",
      "CLE17": "Diz o nome de pelo menos cinco partes do corpo quando pedido (ex.: olhos, nariz, boca, mãos ou pés).",
      "CLE18": "Diz o nome de objetos de forma clara (qualquer pessoa entende).",
      "CLE19": "Canta uma canção simples (qualquer pessoa entende).",
      "CLE20": "Diz o que prefere quando precisa fazer uma escolha entre duas ou mais opções.",
      "CLE21": "Usa \"um\", \"uma\", \"o\", \"a\" para acompanhar outras palavras (ex.: \"Uma bola\", \"O papai\").",
      "CLE22": "Responde corretamente a questões sobre \"onde\" e \"o que\" (ex.: \"Onde você foi?\", \"O que você está fazendo?\").",
      "CLE23": "Diz o que está acontecendo em imagens ou fotos.",
      "CLE24": "Faz perguntas que começam com \"o que\" ou \"onde\".",
      "CLE25": "Diz \"por favor\" e \"obrigado\".",
      "CLE26": "Fala sobre coisas que estão acontecendo naquele momento (ex.: \"Mamãe está trabalhando\", \"Eu estou brincando\").",
      "CLE27": "Diz pelo menos três das seguintes palavras: \"eu\", \"você\", \"tu\", \"ele\", \"ela\", \"nós\", \"eles\", \"elas\".",
      "CLE28": "Faz comentários sobre situações, objetos ou pessoas (ex.: \"Que bonito!\", \"Que legal!\").",
      "CLE29": "Diz a palavra \"você\" (ocê, cê) ou \"tu\" em frases.",
      "CLE30": "Descreve objetos ou brinquedos (ex.: \"O carrinho tem rodinhas\", \"A boneca é bonita\").",
      "CLE31": "Fala com as palavras na ordem correta na frase (ex.: \"Eu joguei bola\", \"Papai foi para o trabalho\").",
      "CLE32": "Fala tantas palavras que é difícil contar.",
      "CLE33": "Usa as palavras \"eu\", \"mim\" e \"meu\" corretamente.",
      "CLE34": "Fala sobre coisas que já aconteceram (ex.: \"Eu fui\", \"Eu comi\").",
      "CLE35": "Fala sobre um mesmo assunto por mais de três minutos.",
      "CLE36": "Fala de forma clara e compreensível (todas as pessoas entendem o que ele fala).",
      "CLE37": "Fala frases de seis palavras ou mais.",
      "CLE38": "Conta sobre as atividades preferidas dele.",
      "CLE39": "Conta uma história que ouviu.",
      "CLE40": "Faz perguntas com várias palavras (ex.: \"Mamãe, você pode comprar um brinquedo para mim?\").",
      "CLE41": "Dá explicações para as coisas usando a palavra \"porque...\" (ex.: \"O gato comeu porque está com fome\").",
      "CLE42": "Sabe falar palavras no plural incluindo a letra \"s\" (ex.: pés, roupas, brinquedos).",
      "CLE43": "Inicia conversações em um grupo de pessoas (\"puxa\" assunto).",
      "CLE44": "Diz o próprio nome e sobrenome quando perguntam.",
      "CLE45": "Pergunta o que as palavras querem dizer quando não sabe alguma coisa (ex.: \"O que é girafa?\").",
      "CLE46": "Fala sobre coisas que poderão acontecer (ex.: \"Se eu não guardar o brinquedo mamãe vai ficar braba\").",
      "CLE47": "Junta duas frases com as palavras \"e\", \"ou\" ou \"mas\" (ex.: \"Eu gosto de maçã, mas não gosto de banana\", \"Eu vou brincar e depois tomar banho\").",
      "CLE48": "Conta com detalhes várias coisas que aconteceram em um dia (ex.: sobre um passeio de domingo ou um dia na escolinha).",
      "CLE49": "Usa corretamente as palavras \"nós\", \"eles\", \"elas\" em frases.",
      "CLE50": "Diz corretamente \"atrás\" ou \"entre\" em uma frase (ex.: \"A janela fica atrás da mesa\", \"A bola está entre o sofá e a mesa\")."
    },
    "MA": {
      "MA1": "Deitado de barriga para cima, vira a cabeça de um lado para o outro.",
      "MA2": "Ao ser segurado no colo, sustenta a cabeça firmemente.",
      "MA3": "Quando está deitado de bruços (barriga para baixo), levanta a cabeça e a vira para os lados.",
      "MA4": "Deitado de bruços (barriga para baixo), levanta e sustenta a cabeça.",
      "MA5": "Fica sentado com apoio por pelo menos um minuto (ex.: encostado em um travesseiro ou almofada).",
      "MA6": "Balança brinquedos ou outros objetos fazendo movimento com os braços.",
      "MA7": "Quando está deitado de lado, rola para ficar de barriga para cima.",
      "MA8": "Quando está deitado, segura os dedos ou as mãos do adulto e se impulsiona (se puxa) para levantar.",
      "MA9": "A partir da posição deitado de barriga para cima, rola para o lado.",
      "MA10": "Quando está deitado, alcança e segura o pé com as mãos.",
      "MA11": "Deitado de bruços (barriga para baixo), levanta o peito e se sustenta com os braços.",
      "MA12": "Quando está deitado de bruços (barriga para baixo), faz movimentos como se fosse arrastar ou engatinhar.",
      "MA13": "Senta-se sem apoio por pelo menos meio minuto.",
      "MA14": "Rola da posição de bruços (barriga para baixo) para a posição de barriga para cima.",
      "MA15": "Fica sentado sem apoiaras mãos por vários minutos.",
      "MA16": "Consegue se sustentar de pé quando você segura as duas mãos dele para que ele se equilibre.",
      "MA17": "Arrasta o corpo no chão para se movimentara uma distância curta.",
      "MA18": "Quando está deitado, move-se para a posição sentado, mesmo sem muito equilíbrio.",
      "MA19": "Move-se da posição sentado para a posição de engatinhar (mãos e joelhos no chão).",
      "MA20": "Quando está sentado, levanta-se para ficar de pé.",
      "MA21": "Engatinha apoiando as mãos e joelhos (ou mãos e pés), sem encostar a barriga no chão.",
      "MA22": "Abaixa-se, sem cair, para pegar um objeto (pode ser com apoio).",
      "MA23": "Dá vários passos para frente sendo segurado por apenas uma das mãos.",
      "MA24": "Anda apoiando-se em móveis com apenas uma das mãos.",
      "MA25": "Levanta sozinho e fica de pé sem apoio.",
      "MA26": "Rola uma bola para outra pessoa.",
      "MA27": "Fica apoiado na ponta dos pés para alcançar objetos.",
      "MA28": "Tenta chutar uma bola.",
      "MA29": "Lança a bola para frente (ex.: como para jogar boliche).",
      "MA30": "Abaixa-se para pegar um objeto no chão e fica de pé novamente sem apoio.",
      "MA31": "Caminha sem ajuda.",
      "MA32": "Sobe e desce da cama, do sofá ou de uma cadeira de adulto.",
      "MA33": "Corre pequenas distâncias, mesmo com pouco equilíbrio.",
      "MA34": "Corre bem sem cair.",
      "MA35": "Chuta uma bola sem tropeçar.",
      "MA36": "Desce escadas colocando os dois pés em cada degrau, com apoio (ex.: segurando o corrimão).",
      "MA37": "Usa uma cadeira, banco ou caixa para pegar objetos que estão longe do alcance.",
      "MA38": "Anda para trás (pelo menos dois passos).",
      "MA39": "Corre bem, fazendo curvas e parando quando necessário.",
      "MA40": "Sobe escadas sozinho colocando um pé em cada degrau, com apoio (ex.: segurando o corrimão).",
      "MA41": "Lança uma bolinha para frente pelo alto (com a mão, a criança arremessa acima do nível do ombro).",
      "MA42": "Sabe andar na ponta dos pés.",
      "MA43": "Consegue ir correndo e chutar uma bola.",
      "MA44": "Pula levantando os dois pés do chão ao mesmo tempo.",
      "MA45": "Pula de cima de um móvel ou banco.",
      "MA46": "Pula sobre objetos ou obstáculos no chão.",
      "MA47": "Desce escadas sozinho colocando um pé em cada degrau, com apoio (ex.: segurando o corrimão).",
      "MA48": "Desce escadas colocando um pé em cada degrau, sem apoio.",
      "MA49": "Sobe escadas sozinho colocando um pé em cada degrau, sem apoio.",
      "MA50": "Pedala um triciclo (motoca, velotrol ou velocípede).",
      "MA51": "Equilibra-se em um pé só sem apoio.",
      "MA52": "Pula com um pé só pelo menos duas vezes, sem apoio.",
      "MA53": "Se balança sozinho no balanço.",
      "MA54": "Sabe dar cambalhotas.",
      "MA55": "Sabe andar de bicicleta com apoio de rodinhas.",
      "MA56": "Quica (ou rebate) uma bola no chão várias vezes.",
      "MA57": "Joga uma bola para cima e a pega antes de cair.",
      "MA58": "Consegue pegar uma bola que foi lançada no ar.",
      "MA59": "Sabe pular como na amarelinha (pula com um pé só e depois com os dois pés, trocando várias vezes).",
      "MA60": "Sabe descer escadas correndo.",
      "MA61": "Sabe pular corda."
    },
    "MF": {
      "MF1": "Leva o punho ou a mão à boca.",
      "MF2": "Fica com as mãos abertas ou semiabertas quando está acordado (ao invés de mantê-las bem fechadas como quando era recém-nascido).",
      "MF3": "Consegue unir as mãos.",
      "MF4": "Agarra pequenos objetos com as mãos.",
      "MF5": "Usa as duas mãos ao mesmo tempo para agarrar um objeto ou brinquedo grande.",
      "MF6": "Consegue alcançar objetos próximos, como um brinquedo.",
      "MF7": "Quando está sentado, tenta pegar um brinquedo que está próximo, mesmo que suas mãos não possam alcançá-lo.",
      "MF8": "Passa objetos de uma mão para a outra.",
      "MF9": "Pega dois brinquedos pequenos, um em cada mão, e os segura.",
      "MF10": "Pega pequenos pedaços de comida com os dedos e mãos.",
      "MF11": "Pega um pedaço de comida da mesa sem apoiar o braço.",
      "MF12": "Vira páginas de um livro sem ajuda (pode ser várias de uma vez).",
      "MF13": "Ajuda um adulto a virar as páginas de um livro.",
      "MF14": "Coloca um pequeno objeto dentro de outro (ex.: moedas em um cofre).",
      "MF15": "Aponta para algo com o dedo indicador.",
      "MF16": "Liga e desliga interruptores de luz (tomadas).",
      "MF17": "Consegue pegar um barbante ou linha usando o polegar e um outro dedo.",
      "MF18": "Faz riscos sem forma definida com lápis ou giz de cera.",
      "MF19": "Coloca lado a lado blocos ou objetos sobre uma superfície (ex.: mesa, chão).",
      "MF20": "Empilha três ou mais blocos ou brinquedos (ex.: cubos de plástico ou madeira, carrinhos, dados).",
      "MF21": "Sopra velas (ex.: no bolo de aniversário).",
      "MF22": "Abre porta usando a maçaneta.",
      "MF23": "Ao olhar um livro, consegue virar uma página por vez, sem ajuda.",
      "MF24": "Abre e fecha a tampa de enroscar de um pote.",
      "MF25": "Encaixa peças de um quebra-cabeça simples.",
      "MF26": "Copia um círculo (não precisa ser perfeito).",
      "MF27": "Dobra um papel em pelo menos duas partes.",
      "MF28": "Usa o lápis na posição de pinça (usando o polegar e indicador, como um adulto).",
      "MF29": "Corta com uma tesoura.",
      "MF30": "Desabotoa um ou mais botões.",
      "MF31": "Desenha linhas retas em um pedaço de papel.",
      "MF32": "Enfia um barbante em pequenos objetos que tenham um furo no meio (ex.: bolinhas com furo ou canudos).",
      "MF33": "Desenha figuras que podem ser reconhecidas por outra pessoa (a criança não diz o que é).",
      "MF34": "Colore dentro das linhas de um desenho.",
      "MF35": "Copia corretamente um sinal de mais \"+\".",
      "MF36": "Apaga com uma borracha sem rasgar o papel.",
      "MF37": "Abotoa um ou mais botões.",
      "MF38": "Usa uma tesoura para cortar em linha reta.",
      "MF39": "Usa uma tesoura para cortar formas curvas.",
      "MF40": "Copia um quadrado com quatro cantos bem desenhados.",
      "MF41": "Recorta corretamente figuras com uma tesoura (sem cortar a figura)."
    },
    "CA": {
      "CA1": "Mastiga a comida.",
      "CA2": "Sabe pegar sozinho uma caneca e levar até a boca (não precisa beber o que tem nela).",
      "CA3": "Come sozinho um biscoito.",
      "CA4": "Pega uma colher ou um garfo pelo cabo.",
      "CA5": "Tira as próprias meias quando quer.",
      "CA6": "Tira os próprios calçados quando quer.",
      "CA7": "Indica quando realmente não quer ou não gosta de alguma coisa (ex.: diz: \"Não\" ou balança negativamente a cabeça/dedo).",
      "CA8": "Ajuda a se vestir (ex.: empurra o braço pela manga da camiseta, levanta o pé para vestir a calça).",
      "CA9": "Olha fotos em álbuns, livros ou revistas.",
      "CA10": "Presta atenção em uma história curta que é lida para ele.",
      "CA11": "Brinca com outras crianças quando convidado.",
      "CA12": "Sabe onde suas coisas estão guardadas na casa.",
      "CA13": "Escolhe o que quer comer quando são oferecidas opções.",
      "CA14": "Sobe em uma cadeira, banco ou caixa para pegar algo que está longe do alcance.",
      "CA15": "Quando está em um lugar novo, se afasta um pouco de você se for incentivado.",
      "CA16": "Joga o lixo na lixeira dentro de casa.",
      "CA17": "Usa um recipiente, como um balde, para carregar coisas de um lugar para outro.",
      "CA18": "Come sozinho com uma colher, sujando-se pouco.",
      "CA19": "Faz favores simples quando solicitado (ex.: pegar uma toalha).",
      "CA20": "Segue regras simples dadas pelos adultos (ex.: para não bater em outra criança; não mexer em coisas de outras pessoas).",
      "CA21": "Pede para ir a lugares dos quais gosta (ex.: parque, lanchonete).",
      "CA22": "Vai à casa de outras pessoas para brincar (pode estar acompanhado de um adulto).",
      "CA23": "Usa guardanapo ou pano para limpar a boca.",
      "CA24": "Ajuda a guardar brinquedos, jogos ou outros itens.",
      "CA25": "Limpa coisas derramadas usando um pano ou esponja.",
      "CA26": "Come ou bebe sozinho sem precisar de muito incentivo.",
      "CA27": "Convida outras crianças para brincarem juntos.",
      "CA28": "Faz o que é pedido logo depois de ser solicitado (ex.: se vestir, fechar uma porta).",
      "CA29": "Come com um garfo sem ajuda.",
      "CA30": "Coloca os calçados (mesmo que nos pés errados).",
      "CA31": "Espera por sua vez em jogos ou brincadeiras.",
      "CA32": "Consegue tirar um casaco ou camisa desabotoados sem auxílio.",
      "CA33": "Na hora de dormir, vai para a cama sem reclamar ou reclamando pouco.",
      "CA34": "Oferece ajuda para você ou outras pessoas (ex.: para carregar as compras, em alguma tarefa da casa).",
      "CA35": "Lava e seca as próprias mãos.",
      "CA36": "Escova os próprios dentes fazendo pouca bagunça quando supervisionado por um adulto.",
      "CA37": "Senta-se no vaso sanitário sem ser segurado.",
      "CA38": "Avisa para os cuidadores quando precisa ir ao banheiro.",
      "CA39": "Tenta defender pessoas ou animais em perigo.",
      "CA40": "Consegue passar o dia sem fazer xixi nas calças.",
      "CA41": "Consegue dormir sem fazer xixi na cama.",
      "CA42": "Veste sozinho roupas largas ou com elástico.",
      "CA43": "Põe os calçados nos pés certos sem auxílio (não precisa amarrar cadarço ou prender fivela).",
      "CA44": "Se preocupa quando derrama alguma coisa.",
      "CA45": "Entende que tem que pagar por um produto de uma loja antes de levar para casa.",
      "CA46": "Pede permissão ao adulto quando necessário (ex.: \"Posso brincar lá fora?\").",
      "CA47": "Bate na porta ou aperta a campainha antes de entrar na casa de outra pessoa.",
      "CA48": "Tenta pegar um brinquedo ou objeto fora do alcance usando um outro objeto (como lápis, vareta) depois de você ter mostrado como fazer.",
      "CA49": "Pega o próprio lanche no armário ou na geladeira.",
      "CA50": "Avisa sobre situações de perigo (ex.: avisa que um carro está se aproximando e pode atropelar, para ter cuidado com um buraco na rua).",
      "CA51": "Fica algumas horas na casa de conhecidos sem a presença do cuidador principal.",
      "CA52": "Faz tarefas difíceis sem desistir facilmente (ex.: guardar muitos brinquedos).",
      "CA53": "Lava-se sozinho durante o banho, precisando, às vezes, de ajuda.",
      "CA54": "Sabe ligar aparelhos e tomadas de forma segura (ex.: TV, carregador do celular).",
      "CA55": "Reconhece placas e símbolos comuns (ex.: banheiro, saída).",
      "CA56": "Veste e tira as próprias roupas sem ajuda (inclui roupas com botões e zíperes ou fechos).",
      "CA57": "Respeita o patrimônio público (ex.: joga o lixo na lixeira; não estraga as propriedades).",
      "CA58": "Risca um papel com lápis ou giz de cera por iniciativa própria.",
      "CA59": "Risca um papel com lápis ou giz de cera depois de ver você riscar.",
      "CA60": "Evita pegar produtos de uma loja ou supermercado sem permissão.",
      "CA61": "Escolhe a roupa de acordo com o clima (ex.: escolhe um casaco quando está frio).",
      "CA62": "Assoa o nariz sem auxílio.",
      "CA63": "Toma banho no chuveiro sem ajuda.",
      "CA64": "Atravessa a rua com cuidado (ex.: olha para os lados antes de atravessar ou dá a mão ao adulto).",
      "CA65": "Propõe maneiras de resolver conflitos com os outros (ex.: combina a vez de cada criança em um jogo).",
      "CA66": "Consegue arrumar a mesa para uma refeição (ex.: coloca os talheres, copos e pratos).",
      "CA67": "Vai ao banheiro sem ajuda (se limpa, dá descarga e lava as mãos).",
      "CA68": "Consegue ir sozinho para a casa de vizinhos (quando tem permissão).",
      "CA69": "Serve a comida tirando de um recipiente para outro com talheres (ex.: tira comida da panela com colher e coloca no prato).",
      "CA70": "Usa faca de mesa ou espátula para passar manteiga ou geleia no pão.",
      "CA71": "Evita falar alto em lugares públicos.",
      "CA72": "Segue uma rotina sem precisar ser lembrado (ex.: escovar os dentes antes de dormir).",
      "CA73": "Lava o próprio cabelo sem ajuda.",
      "CA74": "Usa dois talheres ao mesmo tempo (ex.: colher e garfo; faca e garfo).",
      "CA75": "Cuida dos próprios ferimentos leves (ex.: arranhões ou pequenos cortes).",
      "CA76": "Sabe pedir ajuda, se necessário, em situações de emergência (ex.: sabe chamar um vizinho; telefonar para familiares ou amigos).",
      "CA77": "Consegue comprar sozinho algo para comer (faz o pedido, dá o dinheiro e espera pela comida e pelo troco).",
      "CA78": "Arruma a própria cama quando é pedido (pode necessitar de ajuda)."
    }
  }
};

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.IDADIData = data;
  }
})(typeof window !== "undefined" ? window : globalThis);

"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.TOLAccess || !window.TOLScoring) {
  throw new Error("Os módulos da Torre de Londres não foram carregados.");
}

const {
  FORM_CODE: TEST_CODE_FIXO,
  buildPatientAreaUrl,
  fetchPatientAccess,
  submitPatientResponse
} = window.TOLAccess;

const {
  MAX_ATTEMPTS,
  MAX_SCORE,
  MINIMUM_MOVES,
  buildResultsMetaPayload: buildScoringResultsMetaPayload,
  calculateAgeYears,
  isCorrectSolution
} = window.TOLScoring;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLORS = {
  red: "vermelha",
  green: "verde",
  blue: "azul"
};

const PEG_CAPACITIES = [3, 2, 1];
const INITIAL_STATE = [["green", "red"], ["blue"], []];
const TUTORIAL_DEMO_STATE = [[], ["blue", "green"], ["red"]];
const TUTORIAL_GOAL_STATE = [["green"], ["blue", "red"], []];

// Estados em ordem da base para o topo de cada pino.
const TASK_TARGETS = [
  [["green"], ["red", "blue"], []],
  [["red"], ["blue"], ["green"]],
  [["blue"], ["red", "green"], []],
  [[], ["red", "blue"], ["green"]],
  [["blue", "green"], ["red"], []],
  [["red", "blue", "green"], [], []],
  [["red", "blue"], ["green"], []],
  [["red", "green", "blue"], [], []],
  [["blue"], ["red"], ["green"]],
  [["red", "green"], [], ["blue"]],
  [["blue", "green", "red"], [], []],
  [["red"], ["green"], ["blue"]],
  [["blue", "red"], [], ["green"]],
  [["blue", "green"], [], ["red"]],
  [["blue", "red"], ["green"], []],
  [["blue", "red", "green"], [], []],
  [["blue"], ["green"], ["red"]],
  [["blue"], ["green", "red"], []],
  [[], ["green", "red"], ["blue"]]
];

const TUTORIAL_SLIDES = [
  {
    text: "A base possui três pinos de tamanhos diferentes e três bolas do mesmo tamanho. Mova uma bola de cada vez.",
    state: INITIAL_STATE,
    showGoal: false,
    button: "Continuar"
  },
  {
    text: "Para retirar uma bola de um pino, clique sobre a bola que está no topo.",
    state: INITIAL_STATE,
    showGoal: false,
    selectedPeg: 0,
    button: "Continuar"
  },
  {
    text: "Durante o teste, a imagem de objetivo mostrará onde cada bola deve ficar.",
    state: TUTORIAL_DEMO_STATE,
    showGoal: true,
    button: "Continuar"
  },
  {
    text: "Sua tarefa será mover as bolas até que o seu tabuleiro fique igual ao objetivo.",
    state: TUTORIAL_DEMO_STATE,
    showGoal: true,
    button: "Continuar"
  },
  {
    text: "Faça isso com o mínimo de movimentos possível. Antes de começar, planeje toda a sequência.",
    state: TUTORIAL_DEMO_STATE,
    showGoal: true,
    button: "Continuar"
  },
  {
    text: "Quando estiver pronto, inicie a primeira tarefa.",
    state: TUTORIAL_DEMO_STATE,
    showGoal: true,
    button: "Iniciar tarefa"
  }
];

const state = {
  patient: null,
  tutorialIndex: 0,
  taskIndex: 0,
  attempt: 1,
  moves: 0,
  board: cloneBoard(INITIAL_STATE),
  selectedPeg: null,
  score: 0,
  solved: 0,
  itemResults: [],
  attemptResults: [],
  currentMoveSequence: [],
  testStartedAt: null,
  attemptStartedAt: null,
  firstMoveAt: null,
  sending: false,
  finished: false
};

const tasks = TASK_TARGETS.map((target, index) => ({
  number: index + 1,
  target: cloneBoard(target),
  moveLimit: MINIMUM_MOVES[index]
}));

if (tasks.length !== MINIMUM_MOVES.length) {
  throw new Error("A quantidade de problemas não corresponde à tabela de correção.");
}

function $(selector) {
  return document.querySelector(selector);
}

function cloneBoard(board) {
  return board.map(peg => [...peg]);
}

function boardKey(board) {
  return JSON.stringify(board);
}

function sameBoard(first, second) {
  return boardKey(first) === boardKey(second);
}

function createBoardElement(boardState, options = {}) {
  const {
    interactive = false,
    selectedPeg = null,
    onBallClick = null,
    onPegClick = null
  } = options;

  const fragment = document.createDocumentFragment();
  const deck = document.createElement("div");
  deck.className = "board-deck";
  deck.setAttribute("aria-hidden", "true");
  fragment.appendChild(deck);

  PEG_CAPACITIES.forEach((capacity, pegIndex) => {
    const slot = document.createElement(interactive ? "button" : "div");
    slot.className = "tower-slot";
    slot.dataset.capacity = String(capacity);
    slot.dataset.peg = String(pegIndex);

    if (interactive) {
      slot.type = "button";
      const topColor = boardState[pegIndex].at(-1);
      const label = selectedPeg === null
        ? topColor
          ? `Selecionar bola ${COLORS[topColor]} no pino ${pegIndex + 1}`
          : `Pino ${pegIndex + 1} vazio`
        : selectedPeg === pegIndex
          ? `Cancelar seleção no pino ${pegIndex + 1}`
          : `Mover bola selecionada para o pino ${pegIndex + 1}`;
      slot.setAttribute("aria-label", label);
      slot.setAttribute("aria-pressed", selectedPeg === pegIndex ? "true" : "false");
      if (selectedPeg !== null && selectedPeg !== pegIndex && boardState[pegIndex].length < capacity) {
        slot.classList.add("destination-ready");
      }
      slot.addEventListener("click", () => {
        if (selectedPeg === null) {
          onBallClick?.(pegIndex);
        } else {
          onPegClick?.(pegIndex);
        }
      });
    } else {
      slot.setAttribute("aria-hidden", "true");
    }

    const peg = document.createElement("span");
    peg.className = "peg";
    slot.appendChild(peg);

    const balls = boardState[pegIndex] || [];
    balls.forEach((color, level) => {
      const isTop = level === balls.length - 1;
      const ball = document.createElement("span");
      ball.className = `ball ball--${color}`;
      ball.style.setProperty("--level", String(level));
      ball.setAttribute("aria-hidden", "true");

      if (selectedPeg === pegIndex && isTop) {
        ball.classList.add("selected");
      }

      slot.appendChild(ball);
    });

    fragment.appendChild(slot);
  });

  return fragment;
}

function renderBoard(container, boardState, options = {}) {
  container.innerHTML = "";
  container.dataset.interactive = options.interactive ? "true" : "false";
  container.appendChild(createBoardElement(boardState, options));
}

function renderTutorial() {
  const slide = TUTORIAL_SLIDES[state.tutorialIndex];
  $("#tutorialText").textContent = slide.text;
  $("#tutorialButtonText").textContent = slide.button;
  $("#tutorialObjectiveWrap").classList.toggle("hidden", !slide.showGoal);

  renderBoard($("#tutorialBoard"), slide.state, {
    selectedPeg: slide.selectedPeg ?? null
  });

  if (slide.showGoal) {
    renderBoard($("#tutorialObjective"), TUTORIAL_GOAL_STATE);
  }

  const steps = $("#tutorialSteps");
  steps.innerHTML = "";
  TUTORIAL_SLIDES.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = `step-dot${index === state.tutorialIndex ? " active" : ""}`;
    steps.appendChild(dot);
  });
}

function advanceTutorial() {
  if (state.tutorialIndex < TUTORIAL_SLIDES.length - 1) {
    state.tutorialIndex += 1;
    renderTutorial();
    return;
  }

  startTest();
}

function startTest() {
  state.testStartedAt = Date.now();
  $("#tutorialScreen").classList.add("hidden");
  $("#gameScreen").classList.remove("hidden");
  startTask(0);
}

function startTask(index) {
  state.taskIndex = index;
  state.attempt = 1;
  state.attemptResults = [];
  resetAttempt();
}

function resetAttempt() {
  state.board = cloneBoard(INITIAL_STATE);
  state.moves = 0;
  state.selectedPeg = null;
  state.currentMoveSequence = [];
  state.attemptStartedAt = Date.now();
  state.firstMoveAt = null;
  setFeedback("Selecione uma bola e depois o pino de destino.");
  renderGame();
}

function renderGame() {
  const task = tasks[state.taskIndex];
  $("#taskTitle").textContent = `Tarefa ${task.number}`;
  $("#taskProgress").textContent = `${task.number} de ${tasks.length}`;
  $("#movesMetric").textContent = `${state.moves} / ${task.moveLimit}`;
  $("#attemptMetric").textContent = `${state.attempt} / ${MAX_ATTEMPTS}`;
  $("#progressBar").style.width = `${((state.taskIndex + 1) / tasks.length) * 100}%`;

  renderBoard($("#userBoard"), state.board, {
    interactive: true,
    selectedPeg: state.selectedPeg,
    onBallClick: selectBall,
    onPegClick: moveSelectedBall
  });
  renderBoard($("#goalBoard"), task.target);
}

function selectBall(pegIndex) {
  if (!state.board[pegIndex].length) return;

  if (state.selectedPeg !== null && state.selectedPeg !== pegIndex) {
    moveSelectedBall(pegIndex);
    return;
  }

  if (state.selectedPeg === pegIndex) {
    state.selectedPeg = null;
    setFeedback("Seleção cancelada.");
  } else {
    state.selectedPeg = pegIndex;
    const color = state.board[pegIndex].at(-1);
    setFeedback(`Bola ${COLORS[color]} selecionada. Escolha o pino de destino.`, "selected");
  }

  renderGame();
}

function moveSelectedBall(destinationPeg) {
  if (state.selectedPeg === null) {
    setFeedback("Primeiro selecione uma bola.", "error");
    return;
  }

  const sourcePeg = state.selectedPeg;
  if (sourcePeg === destinationPeg) {
    state.selectedPeg = null;
    setFeedback("Seleção cancelada.");
    renderGame();
    return;
  }

  if (state.board[destinationPeg].length >= PEG_CAPACITIES[destinationPeg]) {
    setFeedback("Esse pino já atingiu sua capacidade.", "error");
    return;
  }

  if (state.moves === 0) {
    state.firstMoveAt = Date.now();
  }

  const color = state.board[sourcePeg].pop();
  state.board[destinationPeg].push(color);
  state.selectedPeg = null;
  state.moves += 1;
  state.currentMoveSequence.push({
    movimento: state.moves,
    cor: color,
    origem: sourcePeg + 1,
    destino: destinationPeg + 1
  });
  renderGame();

  const task = tasks[state.taskIndex];
  const goalReached = sameBoard(state.board, task.target);

  if (isCorrectSolution({
    goalReached,
    moves: state.moves,
    problemIndex: state.taskIndex
  })) {
    setFeedback("Objetivo alcançado.", "selected");
    completeCurrentTask();
    return;
  }

  if (goalReached && state.moves < task.moveLimit) {
    setFeedback(
      `A configuração foi montada em ${state.moves} movimento(s). A correção deste problema requer ${task.moveLimit}; continue planejando.`,
      "selected"
    );
    return;
  }

  if (state.moves >= task.moveLimit) {
    setFeedback("Limite de movimentos atingido.", "error");
    failCurrentAttempt();
    return;
  }

  setFeedback("Movimento registrado. Continue planejando a sequência.");
}

function elapsedSeconds(startedAt) {
  if (!startedAt) return 0;
  return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
}

function recordAttempt(outcome) {
  state.attemptResults.push({
    tentativa: state.attempt,
    movimentos: state.moves,
    movimentos_minimos_esperados: tasks[state.taskIndex].moveLimit,
    tempo_planejamento_segundos: state.firstMoveAt
      ? Math.max(0, Math.round((state.firstMoveAt - state.attemptStartedAt) / 1000))
      : elapsedSeconds(state.attemptStartedAt),
    tempo_segundos: elapsedSeconds(state.attemptStartedAt),
    resultado: outcome,
    configuracao_final: cloneBoard(state.board),
    sequencia_movimentos: state.currentMoveSequence.map(move => ({ ...move }))
  });
}

function completeCurrentTask() {
  recordAttempt("concluída");
  const points = MAX_ATTEMPTS - state.attempt + 1;
  state.score += points;
  state.solved += 1;
  state.itemResults.push({
    item: state.taskIndex + 1,
    concluido: true,
    correto_no_minimo_esperado: true,
    pontuacao: points,
    limite_movimentos: tasks[state.taskIndex].moveLimit,
    movimentos_minimos_esperados: tasks[state.taskIndex].moveLimit,
    tentativas_usadas: state.attempt,
    movimentos_na_tentativa_final: state.moves,
    tempo_total_segundos: state.attemptResults.reduce((total, item) => total + item.tempo_segundos, 0),
    tentativas: state.attemptResults.map(item => ({ ...item }))
  });

  showDialog({
    eyebrow: `Tarefa ${state.taskIndex + 1} de ${tasks.length}`,
    title: "Objetivo alcançado",
    text: `Você concluiu em ${state.moves} movimento${state.moves === 1 ? "" : "s"}.`,
    button: state.taskIndex === tasks.length - 1 ? "Finalizar" : "Próxima tarefa",
    onConfirm: advanceAfterTask
  });
}

function failCurrentAttempt() {
  recordAttempt("limite de movimentos excedido");

  if (state.attempt < MAX_ATTEMPTS) {
    showDialog({
      eyebrow: `Tarefa ${state.taskIndex + 1} de ${tasks.length}`,
      title: "Número de movimentos excedido",
      text: "Planeje novamente antes de refazer a tarefa.",
      button: "Tentar novamente",
      onConfirm: () => {
        state.attempt += 1;
        resetAttempt();
      }
    });
    return;
  }

  state.itemResults.push({
    item: state.taskIndex + 1,
    concluido: false,
    correto_no_minimo_esperado: false,
    pontuacao: 0,
    limite_movimentos: tasks[state.taskIndex].moveLimit,
    movimentos_minimos_esperados: tasks[state.taskIndex].moveLimit,
    tentativas_usadas: MAX_ATTEMPTS,
    movimentos_na_tentativa_final: state.moves,
    tempo_total_segundos: state.attemptResults.reduce((total, item) => total + item.tempo_segundos, 0),
    tentativas: state.attemptResults.map(item => ({ ...item }))
  });

  showDialog({
    eyebrow: `Tarefa ${state.taskIndex + 1} de ${tasks.length}`,
    title: "Limite de tentativas atingido",
    text: "Esta tarefa será encerrada e o teste continuará no próximo objetivo.",
    button: state.taskIndex === tasks.length - 1 ? "Finalizar" : "Próxima tarefa",
    onConfirm: advanceAfterTask
  });
}

function advanceAfterTask() {
  if (state.taskIndex < tasks.length - 1) {
    startTask(state.taskIndex + 1);
    return;
  }

  finishTest();
}

function setFeedback(message, tone = "neutral") {
  const element = $("#gameFeedback");
  element.textContent = message;
  element.dataset.tone = tone;
}

function showDialog({ eyebrow, title, text, button, onConfirm }) {
  $("#dialogEyebrow").textContent = eyebrow;
  $("#dialogTitle").textContent = title;
  $("#dialogText").textContent = text;
  $("#dialogButtonText").textContent = button;
  $("#dialogBackdrop").classList.remove("hidden");
  $("#dialogButton").onclick = () => {
    $("#dialogBackdrop").classList.add("hidden");
    onConfirm();
  };
  $("#dialogButton").focus();
}

function finishTest() {
  if (state.finished) return;
  state.finished = true;
  $("#gameScreen").classList.add("hidden");
  $("#finalScreen").classList.remove("hidden");
  $("#finalScore").textContent = `${state.score} / ${MAX_SCORE}`;
  $("#finalSolved").textContent = `${state.solved} / ${tasks.length}`;
  $("#finalSummary").textContent = "O desempenho bruto foi concluído e será disponibilizado ao profissional responsável.";
  submitResults();
}

function redirectToAreaPaciente() {
  window.location.replace(buildPatientAreaUrl(window.location.search));
}

function isLocalDemo() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  return localHosts.has(window.location.hostname) &&
    new URLSearchParams(window.location.search).get("demo") === "1";
}

function showAppError(message) {
  $("#loadingScreen").classList.add("hidden");
  $("#tutorialScreen").classList.add("hidden");
  $("#gameScreen").classList.add("hidden");
  $("#finalScreen").classList.add("hidden");
  $("#errorText").textContent = message;
  $("#errorScreen").classList.remove("hidden");
}

async function validateAccess() {
  if (isLocalDemo()) {
    return {
      cpf: "00000000000",
      nome: "Modo de demonstração",
      data_nascimento: "2000-01-01",
      tests_liberados: { [TEST_CODE_FIXO]: true },
      tests_feitos: {}
    };
  }

  const data = await fetchPatientAccess(supabaseClient, window.location.search);
  if (data.already_done) {
    redirectToAreaPaciente();
    return null;
  }

  return data;
}

function buildResultsPayload() {
  const totalMoves = state.itemResults.reduce((total, item) => {
    return total + item.tentativas.reduce((subtotal, attempt) => subtotal + attempt.movimentos, 0);
  }, 0);

  return [
    { key: "pontuacao_total", label: "Pontuação total", order: 1, value: state.score },
    { key: "problemas_resolvidos", label: "Problemas resolvidos", order: 2, value: state.solved },
    { key: "movimentos_totais", label: "Movimentos totais", order: 3, value: totalMoves },
    { key: "tempo_total_segundos", label: "Tempo total em segundos", order: 4, value: elapsedSeconds(state.testStartedAt) }
  ];
}

function buildResultsMetaPayload() {
  return buildScoringResultsMetaPayload({
    totalScore: state.score,
    ageYears: calculateAgeYears(state.patient?.data_nascimento),
    itemResults: state.itemResults
  });
}

async function submitResults() {
  if (state.sending || isLocalDemo()) {
    if (isLocalDemo()) $("#sendStatus").textContent = "Demonstração local concluída. Nenhum dado foi enviado.";
    return;
  }

  state.sending = true;
  $("#retrySendButton").classList.add("hidden");
  $("#sendStatus").dataset.tone = "neutral";
  $("#sendStatus").textContent = "Salvando resultado...";

  try {
    if (!state.patient) throw new Error("Sessão do teste inválida.");

    await submitPatientResponse(supabaseClient, {
      search: window.location.search,
      results: buildResultsPayload(),
      resultsMeta: buildResultsMetaPayload()
    });

    $("#sendStatus").textContent = "Resultado enviado com sucesso. Redirecionando...";
    setTimeout(redirectToAreaPaciente, 1200);
  } catch (error) {
    console.error(error);
    state.sending = false;
    $("#sendStatus").dataset.tone = "error";
    $("#sendStatus").textContent = error.message || "Falha ao enviar o resultado.";
    $("#retrySendButton").classList.remove("hidden");
  }
}

async function boot() {
  try {
    const patient = await validateAccess();
    if (!patient) return;

    state.patient = patient;
    const patientName = patient.nome ? `Paciente: ${patient.nome}` : "";
    $("#tutorialPatientName").textContent = patientName;
    $("#gamePatientName").textContent = patient.nome || "";
    $("#loadingScreen").classList.add("hidden");
    $("#tutorialScreen").classList.remove("hidden");
    renderTutorial();
  } catch (error) {
    console.error(error);
    showAppError(error.message || "Não foi possível abrir o teste.");
  }
}

$("#tutorialNextButton").addEventListener("click", advanceTutorial);
$("#retrySendButton").addEventListener("click", submitResults);

boot();

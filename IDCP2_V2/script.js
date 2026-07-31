"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.IDCP2Data || !window.IDCP2Access || !window.IDCP2Scoring) {
  throw new Error("Não foi possível carregar os módulos do IDCP-2.");
}

const data = window.IDCP2Data;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  getToken,
  submitPatientResponse
} = window.IDCP2Access;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = window.IDCP2Scoring;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const pageCount = Math.ceil(data.questions.length / data.itemsPerPage);

const state = {
  patient: null,
  responses: {},
  currentPage: 0,
  sending: false,
  demo: false
};

const $ = (selector) => document.querySelector(selector);

function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

function showOnly(screen) {
  ["#loadingScreen", "#errorScreen", "#formScreen", "#successScreen"].forEach((selector) => {
    const element = $(selector);
    if (element === screen) {
      show(element);
    } else {
      hide(element);
    }
  });
}

function isLocalDemo() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  const params = new URLSearchParams(window.location.search);
  return localHosts.has(window.location.hostname) && params.get("demo") === "1";
}

function getPatientName(patient) {
  return String(
    patient?.nome ||
    patient?.name ||
    patient?.patient_name ||
    ""
  ).trim();
}

function hashDraftIdentity(value) {
  let hash = 2166136261;
  for (const character of String(value || "demo")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function getDraftKey() {
  const identity = getToken(window.location.search) || "demo";
  return `idcp2_v2_session_${hashDraftIdentity(identity)}`;
}

function loadDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(getDraftKey()) || "null");
    const validValues = new Set(data.responses.map((option) => option.value));

    if (saved?.responses && typeof saved.responses === "object") {
      state.responses = Object.fromEntries(
        Object.entries(saved.responses).filter(([questionId, value]) => (
          /^item_\d+$/.test(questionId) && validValues.has(value)
        ))
      );
    }

    if (Number.isInteger(saved?.currentPage)) {
      state.currentPage = Math.min(Math.max(saved.currentPage, 0), pageCount - 1);
    }
  } catch {
    state.responses = {};
    state.currentPage = 0;
  }
}

function saveDraft() {
  try {
    sessionStorage.setItem(getDraftKey(), JSON.stringify({
      responses: state.responses,
      currentPage: state.currentPage
    }));
  } catch {
    // O preenchimento continua normalmente se o navegador bloquear o armazenamento da sessão.
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(getDraftKey());
  } catch {
    // Nenhuma ação adicional é necessária.
  }
}

function redirectToPatientArea() {
  if (state.demo) {
    window.location.reload();
    return;
  }

  window.location.assign(buildPatientAreaUrl(window.location.search));
}

function showError(message) {
  $("#errorText").textContent = message;
  $("#errorBackLink").href = buildPatientAreaUrl(window.location.search);
  showOnly($("#errorScreen"));
}

async function validateAccess() {
  if (state.demo) {
    return {
      nome: "Modo de demonstração",
      form_code: data.formCode,
      already_done: false
    };
  }

  const patient = await fetchPatientAccess(supabaseClient, window.location.search);
  if (patient.already_done) {
    redirectToPatientArea();
    return null;
  }

  return patient;
}

function currentPageQuestions() {
  const start = state.currentPage * data.itemsPerPage;
  return data.questions.slice(start, start + data.itemsPerPage);
}

function createResponseOption(question, option) {
  const label = document.createElement("label");
  label.className = "response-option";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = question.id;
  input.value = option.value;
  input.checked = state.responses[question.id] === option.value;

  const control = document.createElement("span");
  control.className = "response-option__control";
  control.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "response-option__label";
  text.textContent = option.label;

  input.addEventListener("change", () => {
    state.responses[question.id] = option.value;
    label.closest(".question-item").classList.remove("question-item--missing");
    updateProgress();
    saveDraft();
    $("#pageStatus").textContent = "";
    $("#formStatus").textContent = "";
  });

  label.append(input, control, text);
  return label;
}

function renderQuestions() {
  const list = $("#questionList");
  list.replaceChildren();

  currentPageQuestions().forEach((question) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question-item";
    fieldset.dataset.questionId = question.id;

    const legend = document.createElement("legend");
    const itemNumber = document.createElement("span");
    itemNumber.className = "question-number";
    itemNumber.textContent = String(question.number);

    const itemText = document.createElement("span");
    itemText.className = "question-text";
    itemText.textContent = question.text;

    legend.append(itemNumber, itemText);

    const options = document.createElement("div");
    options.className = "response-options";
    options.setAttribute("aria-label", `Alternativas do item ${question.number}`);

    data.responses.forEach((option) => {
      options.append(createResponseOption(question, option));
    });

    fieldset.append(legend, options);
    list.append(fieldset);
  });

  updateBlockNavigation();
}

function updateProgress() {
  const scored = scoreResponses(data, state.responses);
  const total = data.questions.length;
  const percent = (scored.answeredCount / total) * 100;

  $("#progressText").textContent = `${scored.answeredCount} de ${total} respondidos`;
  $("#progressBar").style.width = `${percent}%`;
  $("#progressTrack").setAttribute("aria-valuenow", String(scored.answeredCount));
  $("#completionText").textContent = scored.complete
    ? "Todos os itens foram respondidos"
    : `Faltam ${scored.unansweredCount} ${scored.unansweredCount === 1 ? "item" : "itens"}`;

  return scored;
}

function updateBlockNavigation() {
  const start = state.currentPage * data.itemsPerPage + 1;
  const end = Math.min(start + data.itemsPerPage - 1, data.questions.length);
  const isLastPage = state.currentPage === pageCount - 1;

  $("#blockText").textContent = `Bloco ${state.currentPage + 1} de ${pageCount}`;
  $("#blockRange").textContent = `Itens ${start} a ${end}`;
  $("#previousButton").disabled = state.currentPage === 0;
  $("#nextButton").classList.toggle("hidden", isLastPage);
  $("#submitRegion").classList.toggle("hidden", !isLastPage);
  $("#pageStatus").textContent = "";
}

function markMissingQuestions(questions) {
  let firstMissing = null;

  questions.forEach((question) => {
    const fieldset = document.querySelector(`[data-question-id="${question.id}"]`);
    if (!fieldset) return;

    const missing = !state.responses[question.id];
    fieldset.classList.toggle("question-item--missing", missing);
    if (missing && !firstMissing) firstMissing = fieldset;
  });

  if (firstMissing) {
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    firstMissing.querySelector("input")?.focus({ preventScroll: true });
  }

  return Boolean(firstMissing);
}

function currentPageIsComplete() {
  return currentPageQuestions().every((question) => state.responses[question.id]);
}

function moveToPage(page) {
  state.currentPage = Math.min(Math.max(page, 0), pageCount - 1);
  renderQuestions();
  updateProgress();
  saveDraft();
  $("#blockText").scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleNextPage() {
  if (!currentPageIsComplete()) {
    $("#pageStatus").textContent = "Responda a todos os itens deste bloco para continuar.";
    markMissingQuestions(currentPageQuestions());
    return;
  }

  moveToPage(state.currentPage + 1);
}

function handlePreviousPage() {
  moveToPage(state.currentPage - 1);
}

function setSending(sending) {
  state.sending = sending;
  const button = $("#submitButton");
  button.disabled = sending;
  button.textContent = sending ? "Enviando..." : "Enviar respostas";
}

function renderSuccess() {
  showOnly($("#successScreen"));

  if (state.demo) {
    $("#successText").textContent = "Demonstração concluída. Nenhum dado foi enviado à Supabase.";
    $("#successStatus").textContent = "As 210 perguntas e respostas estão prontas para envio em results.";
    $("#successBackButton").textContent = "Preencher novamente";
    return;
  }

  $("#successStatus").textContent = "Você será direcionado(a) à área do paciente em alguns segundos.";
  window.setTimeout(redirectToPatientArea, 3500);
}

function showFirstMissingQuestion() {
  const missingIndex = data.questions.findIndex((question) => !state.responses[question.id]);
  if (missingIndex < 0) return;

  state.currentPage = Math.floor(missingIndex / data.itemsPerPage);
  renderQuestions();
  updateProgress();
  markMissingQuestions(currentPageQuestions());
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.sending) return;

  const scored = updateProgress();
  if (!scored.complete) {
    $("#formStatus").textContent = "Ainda há itens sem resposta. Você será levado(a) ao primeiro deles.";
    showFirstMissingQuestion();
    return;
  }

  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);
  setSending(true);
  $("#formStatus").textContent = "";

  try {
    if (state.demo) {
      window.__IDCP2_DEMO_SUBMISSION__ = {
        results,
        results_meta: resultsMeta
      };
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    } else {
      await submitPatientResponse(supabaseClient, {
        search: window.location.search,
        results,
        resultsMeta
      });
    }

    clearDraft();
    renderSuccess();
  } catch (error) {
    $("#formStatus").textContent = error.message || "Não foi possível enviar as respostas.";
    setSending(false);
  }
}

async function boot() {
  try {
    validateData(data);
    state.demo = isLocalDemo();
    const patient = await validateAccess();
    if (!patient) return;

    state.patient = patient;
    loadDraft();
    $("#patientName").textContent = getPatientName(patient) || "Identificação validada";
    renderQuestions();
    updateProgress();
    showOnly($("#formScreen"));
  } catch (error) {
    showError(error.message || "Não foi possível abrir o formulário.");
  }
}

$("#questionnaire").addEventListener("submit", handleSubmit);
$("#previousButton").addEventListener("click", handlePreviousPage);
$("#nextButton").addEventListener("click", handleNextPage);
$("#successBackButton").addEventListener("click", redirectToPatientArea);

boot();

"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.PHQ9Data || !window.PHQ9Access || !window.PHQ9Scoring) {
  throw new Error("Não foi possível carregar os módulos do PHQ-9.");
}

const data = window.PHQ9Data;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  submitPatientResponse
} = window.PHQ9Access;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  getResponseOptions,
  scoreResponses,
  validateData
} = window.PHQ9Scoring;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state = {
  patient: null,
  responses: {},
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
    $("#formStatus").textContent = "";
  });

  label.append(input, control, text);
  return label;
}

function renderQuestions() {
  const list = $("#questionList");
  list.replaceChildren();

  data.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question-item";
    fieldset.dataset.questionId = question.id;

    const legend = document.createElement("legend");
    const itemNumber = document.createElement("span");
    itemNumber.className = "question-number";
    itemNumber.textContent = String(index + 1);

    const itemText = document.createElement("span");
    itemText.className = "question-text";
    itemText.textContent = question.text;

    legend.append(itemNumber, itemText);

    const options = document.createElement("div");
    options.className = "response-options";
    options.setAttribute("aria-label", `Alternativas do item ${index + 1}`);

    getResponseOptions(data, question).forEach((option) => {
      options.append(createResponseOption(question, option));
    });

    fieldset.append(legend, options);
    list.append(fieldset);
  });
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

function markMissingQuestions() {
  let firstMissing = null;

  data.questions.forEach((question) => {
    const fieldset = document.querySelector(`[data-question-id="${question.id}"]`);
    const missing = !state.responses[question.id];
    fieldset.classList.toggle("question-item--missing", missing);

    if (missing && !firstMissing) {
      firstMissing = fieldset;
    }
  });

  if (firstMissing) {
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    firstMissing.querySelector("input")?.focus({ preventScroll: true });
  }
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
    $("#successStatus").textContent = "O payload de demonstração está disponível para validação técnica.";
    $("#successBackButton").textContent = "Preencher novamente";
    return;
  }

  $("#successStatus").textContent = "Você será direcionado(a) à área do paciente em alguns segundos.";
  window.setTimeout(redirectToPatientArea, 3500);
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.sending) return;

  const scored = updateProgress();
  if (!scored.complete) {
    $("#formStatus").textContent = "Responda aos itens destacados antes de enviar.";
    markMissingQuestions();
    return;
  }

  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);
  setSending(true);
  $("#formStatus").textContent = "";

  try {
    if (state.demo) {
      window.__PHQ9_DEMO_SUBMISSION__ = {
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
    $("#patientName").textContent = getPatientName(patient) || "Identificação validada";
    renderQuestions();
    updateProgress();
    showOnly($("#formScreen"));
  } catch (error) {
    showError(error.message || "Não foi possível abrir o formulário.");
  }
}

$("#questionnaire").addEventListener("submit", handleSubmit);
$("#successBackButton").addEventListener("click", redirectToPatientArea);

boot();

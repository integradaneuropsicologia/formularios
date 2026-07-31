"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.MDQData || !window.MDQAccess || !window.MDQScoring) {
  throw new Error("Não foi possível carregar os módulos do MDQ.");
}

const data = window.MDQData;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  submitPatientResponse
} = window.MDQAccess;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  scoreResponses,
  validateData
} = window.MDQScoring;

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

function clearMissingState(questionId) {
  document
    .querySelector(`[data-question-id="${questionId}"]`)
    ?.classList.remove("question-item--missing");
  $("#formStatus").textContent = "";
}

function createChoiceOption(questionId, option, onChange) {
  const label = document.createElement("label");
  label.className = "response-option";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = questionId;
  input.value = option.value;
  input.checked = state.responses[questionId] === option.value;

  const control = document.createElement("span");
  control.className = "response-option__control";
  control.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "response-option__label";
  text.textContent = option.label;

  input.addEventListener("change", () => {
    state.responses[questionId] = option.value;
    clearMissingState(questionId);
    onChange?.();
    updateProgress();
  });

  label.append(input, control, text);
  return label;
}

function createChoiceQuestion({
  id,
  text,
  detail = "",
  options,
  number = null,
  wide = false,
  onChange = null
}) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = `question-item${wide ? " question-item--wide" : ""}`;
  fieldset.dataset.questionId = id;

  const legend = document.createElement("legend");
  if (number !== null) {
    const itemNumber = document.createElement("span");
    itemNumber.className = "question-number";
    itemNumber.textContent = String(number);
    legend.append(itemNumber);
  }

  const itemText = document.createElement("span");
  itemText.className = "question-text";
  itemText.textContent = text;
  legend.append(itemText);
  fieldset.append(legend);

  if (detail) {
    const detailText = document.createElement("p");
    detailText.className = "question-detail";
    detailText.textContent = detail;
    fieldset.append(detailText);
  }

  const choices = document.createElement("div");
  choices.className = `response-options${options.length === 2 ? " response-options--binary" : ""}`;
  choices.setAttribute("aria-label", `Alternativas: ${text}`);
  options.forEach((option) => choices.append(createChoiceOption(id, option, onChange)));
  fieldset.append(choices);

  return fieldset;
}

function toggleSamePeriodQuestion() {
  const fieldset = $("#samePeriodQuestion");
  if (!fieldset) return;

  const needsSamePeriod = scoreResponses(data, state.responses).needsSamePeriod;
  fieldset.classList.toggle("hidden", !needsSamePeriod);

  if (!needsSamePeriod) {
    delete state.responses[data.samePeriod.id];
    fieldset.classList.remove("question-item--missing");
    fieldset.querySelectorAll("input").forEach((input) => {
      input.checked = false;
    });
  }
}

function renderQuestions() {
  const symptoms = $("#symptomQuestions");
  symptoms.replaceChildren();
  data.symptoms.forEach((item) => {
    symptoms.append(createChoiceQuestion({
      ...item,
      options: data.symptomOptions,
      number: item.number,
      onChange: toggleSamePeriodQuestion
    }));
  });

  const samePeriodQuestion = createChoiceQuestion({
    ...data.samePeriod,
    wide: true
  });
  samePeriodQuestion.id = "samePeriodQuestion";
  samePeriodQuestion.classList.add("hidden");

  const followup = $("#followupQuestions");
  followup.replaceChildren(
    samePeriodQuestion,
    createChoiceQuestion({ ...data.impact, wide: true })
  );
  toggleSamePeriodQuestion();
}

function updateProgress() {
  const scored = scoreResponses(data, state.responses);
  const percent = (scored.answeredCount / scored.requiredCount) * 100;

  $("#progressText").textContent = `${scored.answeredCount} de ${scored.requiredCount} respondidos`;
  $("#progressBar").style.width = `${percent}%`;
  $("#progressTrack").setAttribute("aria-valuemax", String(scored.requiredCount));
  $("#progressTrack").setAttribute("aria-valuenow", String(scored.answeredCount));
  $("#completionText").textContent = scored.complete
    ? "Todas as perguntas obrigatórias foram respondidas"
    : `Faltam ${scored.unansweredCount} ${scored.unansweredCount === 1 ? "resposta" : "respostas"}`;

  return scored;
}

function markMissingQuestions(scored) {
  let firstMissing = null;

  document.querySelectorAll(".question-item--missing").forEach((item) => {
    item.classList.remove("question-item--missing");
  });

  scored.missingIds.forEach((id) => {
    const fieldset = document.querySelector(`[data-question-id="${id}"]`);
    if (!fieldset) return;
    fieldset.classList.add("question-item--missing");
    if (!firstMissing) firstMissing = fieldset;
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
    $("#formStatus").textContent = "Responda às perguntas destacadas antes de enviar.";
    markMissingQuestions(scored);
    return;
  }

  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload(scored);
  setSending(true);
  $("#formStatus").textContent = "";

  try {
    if (state.demo) {
      window.__MDQ_V2_DEMO_SUBMISSION__ = {
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

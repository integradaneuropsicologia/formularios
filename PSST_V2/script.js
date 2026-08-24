"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.PSSTData || !window.PSSTAccess || !window.PSSTScoring) {
  throw new Error("Não foi possível carregar os módulos do PSST.");
}

const data = window.PSSTData;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  submitPatientResponse
} = window.PSSTAccess;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  getQuestionOptions,
  scoreResponses,
  validateData
} = window.PSSTScoring;

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
    if (element === screen) show(element);
    else hide(element);
  });
}

function isLocalDemo() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  const params = new URLSearchParams(window.location.search);
  return localHosts.has(window.location.hostname) && params.get("demo") === "1";
}

function getPatientName(patient) {
  return String(patient?.nome || patient?.name || patient?.patient_name || "").trim();
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

function createSectionHeading(section) {
  const heading = document.createElement("section");
  heading.className = "question-section";
  heading.innerHTML = `
    <div>
      <p class="question-section__eyebrow">${section.eyebrow}</p>
      <h2>${section.title}</h2>
      <p>${section.description}</p>
    </div>
  `;
  return heading;
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

function createOpenResponse(question) {
  const wrapper = document.createElement("div");
  wrapper.className = "open-response";

  const textarea = document.createElement("textarea");
  textarea.name = question.id;
  textarea.rows = 4;
  textarea.maxLength = 1500;
  textarea.placeholder = question.placeholder || "Digite sua resposta.";
  textarea.value = state.responses[question.id] || "";
  textarea.setAttribute("aria-label", `Resposta da pergunta ${question.displayNumber}`);

  textarea.addEventListener("input", () => {
    state.responses[question.id] = textarea.value;
    if (textarea.value.trim()) {
      wrapper.closest(".question-item").classList.remove("question-item--missing");
    }
    updateProgress();
    $("#formStatus").textContent = "";
  });

  wrapper.append(textarea);
  return wrapper;
}

function renderQuestions() {
  const list = $("#questionList");
  const sections = new Map(data.sections.map((section) => [section.id, section]));
  let activeSection = null;
  list.replaceChildren();

  data.questions.forEach((question) => {
    if (question.section !== activeSection) {
      activeSection = question.section;
      list.append(createSectionHeading(sections.get(activeSection)));
    }

    const fieldset = document.createElement("div");
    fieldset.className = "question-item";
    fieldset.dataset.questionId = question.id;
    fieldset.setAttribute("role", "group");
    fieldset.setAttribute("aria-labelledby", `${question.id}-label`);

    const legend = document.createElement("div");
    legend.className = "question-heading";
    const itemNumber = document.createElement("span");
    itemNumber.className = "question-number";
    itemNumber.textContent = question.displayNumber;

    const itemText = document.createElement("span");
    itemText.className = "question-text";
    itemText.id = `${question.id}-label`;
    itemText.textContent = question.text;
    legend.append(itemNumber, itemText);

    const responseControl = question.type === "textarea"
      ? createOpenResponse(question)
      : (() => {
          const options = document.createElement("div");
          options.className = "response-options";
          options.setAttribute("aria-label", `Alternativas do item ${question.displayNumber}`);
          getQuestionOptions(data, question).forEach((option) => {
            options.append(createResponseOption(question, option));
          });
          return options;
        })();

    fieldset.append(legend, responseControl);
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
    const missing = !String(state.responses[question.id] || "").trim();
    fieldset.classList.toggle("question-item--missing", missing);
    if (missing && !firstMissing) firstMissing = fieldset;
  });

  if (firstMissing) {
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    firstMissing.querySelector("input, textarea")?.focus({ preventScroll: true });
  }
}

function setSending(sending) {
  state.sending = sending;
  const button = $("#submitButton");
  button.disabled = sending;
  button.textContent = sending ? "Enviando..." : "Enviar respostas";
}

function renderSuccess(scored) {
  showOnly($("#successScreen"));

  if (state.demo) {
    $("#successText").textContent = `Demonstração concluída: ${scored.classification}.`;
    $("#successStatus").textContent = "Nenhum dado foi enviado à Supabase.";
    $("#successBackButton").textContent = "Preencher novamente";
    return;
  }

  $("#successStatus").textContent = "Você será direcionada à área do paciente em alguns segundos.";
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
      window.__PSST_DEMO_SUBMISSION__ = { results, results_meta: resultsMeta };
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    } else {
      await submitPatientResponse(supabaseClient, {
        search: window.location.search,
        results,
        resultsMeta
      });
    }

    renderSuccess(scored);
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

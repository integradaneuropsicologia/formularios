"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (
  !window.QIIAHSDPreEscolarFamiliaresData ||
  !window.QIIAHSDPreEscolarFamiliaresAccess ||
  !window.QIIAHSDPreEscolarFamiliaresScoring
) {
  throw new Error("Não foi possível carregar os módulos do QIIAHSD Pré-escolar.");
}

const data = window.QIIAHSDPreEscolarFamiliaresData;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  submitPatientResponse
} = window.QIIAHSDPreEscolarFamiliaresAccess;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  conditionMatches,
  evaluateResponses,
  getAllFields,
  isRequired,
  validateData
} = window.QIIAHSDPreEscolarFamiliaresScoring;

const supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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
      nome: "Criança em demonstração",
      form_code: data.formCode,
      already_done: false
    };
  }

  if (!supabaseClient) {
    throw new Error("Não foi possível conectar ao serviço de envio.");
  }

  const patient = await fetchPatientAccess(supabaseClient, window.location.search);
  if (patient.already_done) {
    redirectToPatientArea();
    return null;
  }
  return patient;
}

function createSectionShell(index, title, description = "") {
  const section = document.createElement("section");
  section.className = "questionnaire-section";

  const heading = document.createElement("div");
  heading.className = "section-heading";

  const badge = document.createElement("span");
  badge.className = "section-index";
  badge.textContent = index;

  const copy = document.createElement("div");
  const headingTitle = document.createElement("h2");
  headingTitle.textContent = title;
  copy.append(headingTitle);

  if (description) {
    const paragraph = document.createElement("p");
    paragraph.textContent = description;
    copy.append(paragraph);
  }

  heading.append(badge, copy);
  section.append(heading);
  return section;
}

function createFieldLabel(field) {
  const fragment = document.createDocumentFragment();
  const text = document.createElement("span");
  text.textContent = field.label;
  fragment.append(text);

  if (field.required || field.requiredWhen) {
    const required = document.createElement("span");
    required.className = "required-mark";
    required.textContent = " *";
    required.setAttribute("aria-hidden", "true");
    fragment.append(required);
  } else {
    const optional = document.createElement("span");
    optional.className = "optional-note";
    optional.textContent = " (opcional)";
    fragment.append(optional);
  }

  return fragment;
}

function clearMissing(fieldId) {
  const wrapper = document.querySelector(`[data-field-id="${CSS.escape(fieldId)}"]`);
  wrapper?.classList.remove("question-item--missing", "field-item--missing");
}

function afterResponseChange(fieldId) {
  clearMissing(fieldId);
  syncConditionalFields();
  updateProgress();
  $("#formStatus").textContent = "";
}

function createResponseOption(field, option, multiple) {
  const label = document.createElement("label");
  label.className = `response-option${multiple ? " response-option--checkbox" : ""}`;

  const input = document.createElement("input");
  input.type = multiple ? "checkbox" : "radio";
  input.name = field.id;
  input.value = option.value;
  input.checked = multiple
    ? Array.isArray(state.responses[field.id]) && state.responses[field.id].includes(option.value)
    : state.responses[field.id] === option.value;

  const control = document.createElement("span");
  control.className = "response-option__control";
  control.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "response-option__label";
  text.textContent = option.label;

  input.addEventListener("change", () => {
    if (multiple) {
      const current = new Set(Array.isArray(state.responses[field.id]) ? state.responses[field.id] : []);
      if (input.checked) current.add(option.value);
      else current.delete(option.value);

      if (current.size) state.responses[field.id] = [...current];
      else delete state.responses[field.id];
    } else {
      state.responses[field.id] = option.value;
    }

    afterResponseChange(field.id);
  });

  label.append(input, control, text);
  return label;
}

function createChoiceField(field) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "question-item";
  if (field.type === "multiple") fieldset.classList.add("field-item--wide");
  fieldset.dataset.fieldId = field.id;

  const legend = document.createElement("legend");
  if (Number.isInteger(field.number)) {
    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = String(field.number);
    legend.append(number);
  }

  const text = document.createElement("span");
  text.className = "question-text";
  text.append(createFieldLabel(field));
  legend.append(text);

  const options = document.createElement("div");
  options.className = "response-options";
  options.setAttribute("aria-label", `Alternativas para ${field.label}`);
  const multiple = field.type === "multiple";

  (field.options || []).forEach((option) => {
    options.append(createResponseOption(field, option, multiple));
  });

  fieldset.append(legend, options);
  return fieldset;
}

function createTextField(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-item";
  if (field.type === "textarea") wrapper.classList.add("field-item--wide");
  wrapper.dataset.fieldId = field.id;

  const label = document.createElement("label");
  label.htmlFor = field.id;

  if (Number.isInteger(field.number)) {
    label.className = "numbered-field-label";

    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = String(field.number);

    const text = document.createElement("span");
    text.className = "question-text";
    text.append(createFieldLabel(field));
    label.append(number, text);
  } else {
    label.append(createFieldLabel(field));
  }

  const control = document.createElement(field.type === "textarea" ? "textarea" : "input");
  if (field.type !== "textarea") control.type = "text";
  control.className = "text-control";
  control.id = field.id;
  control.name = field.id;
  control.value = String(state.responses[field.id] || "");
  control.autocomplete = "off";

  control.addEventListener("input", () => {
    const value = control.value.trim();
    if (value) state.responses[field.id] = control.value;
    else delete state.responses[field.id];
    afterResponseChange(field.id);
  });

  wrapper.append(label, control);
  return wrapper;
}

function createField(field) {
  return field.type === "single" || field.type === "multiple"
    ? createChoiceField(field)
    : createTextField(field);
}

function appendFields(section, fields, className = "field-list") {
  if (!fields?.length) return;
  const list = document.createElement("div");
  list.className = className;
  fields.forEach((field) => list.append(createField(field)));
  section.append(list);
}

function renderSections() {
  const root = $("#formSections");
  root.replaceChildren();

  const respondent = createSectionShell(
    "R",
    "Sobre quem está respondendo",
    "Pais, avós e outros cuidadores podem preencher este questionário."
  );
  appendFields(respondent, data.respondentFields);
  root.append(respondent);

  data.sections.forEach((sectionData) => {
    const section = createSectionShell(sectionData.index, sectionData.title);
    appendFields(section, sectionData.questions, "question-list");
    appendFields(section, sectionData.supplementary);
    root.append(section);
  });

  const skills = createSectionShell(
    data.skillsSection.index,
    data.skillsSection.title,
    data.skillsSection.description
  );
  appendFields(skills, data.skillsSection.fields);
  root.append(skills);

  const comparison = createSectionShell(
    data.comparisonSection.index,
    data.comparisonSection.title,
    data.comparisonSection.description
  );
  appendFields(comparison, data.comparisonSection.questions, "question-list");
  root.append(comparison);

  const qualitative = createSectionShell(
    data.qualitativeSection.index,
    data.qualitativeSection.title,
    data.qualitativeSection.description
  );
  appendFields(qualitative, data.qualitativeSection.questions);
  root.append(qualitative);
}

function syncConditionalFields() {
  getAllFields(data)
    .filter((field) => field.requiredWhen)
    .forEach((field) => {
      const wrapper = document.querySelector(`[data-field-id="${CSS.escape(field.id)}"]`);
      if (!wrapper) return;

      const visible = conditionMatches(field.requiredWhen, state.responses);
      wrapper.classList.toggle("conditional-field--hidden", !visible);
      wrapper.querySelectorAll("input, textarea").forEach((control) => {
        control.disabled = !visible;
      });

      if (!visible) {
        delete state.responses[field.id];
        clearMissing(field.id);
      }
    });
}

function updateProgress() {
  const evaluated = evaluateResponses(data, state.responses);
  const total = evaluated.requiredCount;
  const percent = total ? (evaluated.answeredRequiredCount / total) * 100 : 0;

  $("#progressText").textContent = `${evaluated.answeredRequiredCount} de ${total} respondidas`;
  $("#progressBar").style.width = `${percent}%`;
  $("#progressTrack").setAttribute("aria-valuemax", String(total));
  $("#progressTrack").setAttribute("aria-valuenow", String(evaluated.answeredRequiredCount));

  $("#completionText").textContent = evaluated.complete
    ? "Todas as perguntas obrigatórias foram respondidas"
    : `Faltam ${evaluated.missingIds.length} ${evaluated.missingIds.length === 1 ? "resposta obrigatória" : "respostas obrigatórias"}`;

  return evaluated;
}

function markMissingFields(evaluated) {
  let firstMissing = null;

  getAllFields(data).forEach((field) => {
    const wrapper = document.querySelector(`[data-field-id="${CSS.escape(field.id)}"]`);
    if (!wrapper) return;

    const missing = evaluated.missingIds.includes(field.id);
    wrapper.classList.toggle("question-item--missing", missing && wrapper.matches("fieldset"));
    wrapper.classList.toggle("field-item--missing", missing && !wrapper.matches("fieldset"));

    if (missing && !firstMissing) firstMissing = wrapper;
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

  const evaluated = updateProgress();
  if (!evaluated.complete) {
    $("#formStatus").textContent = "Responda às perguntas obrigatórias destacadas.";
    markMissingFields(evaluated);
    return;
  }

  const results = buildResultsPayload(evaluated);
  const resultsMeta = buildResultsMetaPayload(evaluated);
  setSending(true);
  $("#formStatus").textContent = "";

  try {
    if (state.demo) {
      window.__QIIAHSD_PRE_ESCOLAR_FAMILIARES_DEMO_SUBMISSION__ = {
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
    $("#audienceText").textContent = data.audience;

    const instructions = $("#instructions");
    data.instructions.forEach((instruction) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = instruction;
      instructions.append(paragraph);
    });

    renderSections();
    syncConditionalFields();
    updateProgress();
    showOnly($("#formScreen"));
  } catch (error) {
    showError(error.message || "Não foi possível abrir o formulário.");
  }
}

$("#questionnaire").addEventListener("submit", handleSubmit);
$("#successBackButton").addEventListener("click", redirectToPatientArea);

boot();

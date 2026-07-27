"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.PROTEAData || !window.PROTEAAccess || !window.PROTEAScoring) {
  throw new Error("Não foi possível carregar os módulos do PROTEA-R-NV.");
}

const data = window.PROTEAData;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  getToken,
  submitPatientResponse
} = window.PROTEAAccess;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  createInitialResponses,
  getDependencyState,
  requiresFrequency,
  scoreResponses,
  validateData
} = window.PROTEAScoring;

const $ = (selector) => document.querySelector(selector);

function isLocalDemo() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  const params = new URLSearchParams(window.location.search);
  return localHosts.has(window.location.hostname) && params.get("demo") === "1";
}

const state = {
  patient: null,
  responses: createInitialResponses(data),
  sending: false,
  demo: isLocalDemo(),
  supabaseClient: null
};

const draftKey = `${data.formCode}:${getToken(window.location.search) || "demo"}`;

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

  if (!window.supabase?.createClient) {
    throw new Error("Não foi possível iniciar a conexão segura com o formulário.");
  }

  state.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const patient = await fetchPatientAccess(state.supabaseClient, window.location.search);

  if (patient.already_done) {
    redirectToPatientArea();
    return null;
  }

  return patient;
}

function saveDraft() {
  try {
    window.sessionStorage.setItem(draftKey, JSON.stringify(state.responses));
  } catch (error) {
    console.warn("Não foi possível salvar o rascunho desta aba.", error);
  }
}

function restoreDraft() {
  try {
    const raw = window.sessionStorage.getItem(draftKey);
    if (!raw) return;
    state.responses = JSON.parse(raw);
  } catch (error) {
    console.warn("Não foi possível restaurar o rascunho desta aba.", error);
    state.responses = createInitialResponses(data);
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(draftKey);
  } catch (error) {
    console.warn("Não foi possível remover o rascunho desta aba.", error);
  }
}

function createField(labelText, type, value, attributes = {}) {
  const label = document.createElement("label");
  label.className = "field";

  const labelCopy = document.createElement("span");
  labelCopy.textContent = labelText;

  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  Object.entries(attributes).forEach(([key, attributeValue]) => {
    input.dataset[key] = attributeValue;
  });

  label.append(labelCopy, input);
  return label;
}

function renderSessionDetails() {
  const host = $("#sessionDetails");
  host.replaceChildren();

  state.responses.sessions.forEach((session, index) => {
    const card = document.createElement("section");
    card.className = "session-card";
    card.dataset.sessionCard = String(index);

    const title = document.createElement("h3");
    title.textContent = `${index + 1}ª sessão`;

    const fields = document.createElement("div");
    fields.className = "session-card__fields";
    fields.append(
      createField("Data", "date", session.date, {
        sessionIndex: String(index),
        field: "date"
      }),
      createField("Horário", "time", session.time, {
        sessionIndex: String(index),
        field: "time"
      }),
      createField("Avaliador", "text", session.evaluator, {
        sessionIndex: String(index),
        field: "evaluator"
      })
    );

    card.append(title, fields);
    host.append(card);
  });
}

function createSectionHeader(section) {
  const header = document.createElement("section");
  header.className = "question-section";
  header.setAttribute("aria-labelledby", `section-${section.id}`);

  const copy = document.createElement("div");
  const eyebrow = document.createElement("span");
  eyebrow.className = "question-section__eyebrow";
  eyebrow.textContent = section.description;

  const title = document.createElement("h2");
  title.id = `section-${section.id}`;
  title.textContent = section.title;

  copy.append(eyebrow, title);
  header.append(copy);
  return header;
}

function createQualityReference(question) {
  const reference = document.createElement("div");
  reference.className = "quality-reference";

  question.options.forEach((option) => {
    const row = document.createElement("div");
    row.className = "quality-reference__row";

    const code = document.createElement("strong");
    code.textContent = option.code;

    const label = document.createElement("span");
    label.textContent = option.label;

    row.append(code, label);
    reference.append(row);
  });

  return reference;
}

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function createObservationCell(question, scope, sessionIndex = null) {
  const observation = scope === "compiled"
    ? state.responses.items[question.id].compiled
    : state.responses.items[question.id].sessions[sessionIndex];
  const cell = document.createElement("section");
  cell.className = scope === "compiled"
    ? "observation-cell observation-cell--compiled"
    : "observation-cell";
  cell.dataset.itemId = question.id;
  cell.dataset.scope = scope;
  if (sessionIndex !== null) {
    cell.dataset.sessionIndex = String(sessionIndex);
  }

  const heading = document.createElement("h4");
  heading.textContent = scope === "compiled"
    ? "Codificação compilada"
    : `${sessionIndex + 1}ª sessão`;

  const qualityField = document.createElement("label");
  qualityField.className = "field field--compact";
  const qualityLabel = document.createElement("span");
  qualityLabel.textContent = "Qualidade";
  const qualitySelect = document.createElement("select");
  qualitySelect.dataset.role = "quality";
  qualitySelect.dataset.itemId = question.id;
  qualitySelect.dataset.scope = scope;
  if (sessionIndex !== null) {
    qualitySelect.dataset.sessionIndex = String(sessionIndex);
  }
  qualitySelect.append(createSelectOption("", "Selecione"));
  question.options.forEach((option) => {
    qualitySelect.append(createSelectOption(option.code, option.code));
  });
  qualitySelect.value = observation.quality;
  qualityField.append(qualityLabel, qualitySelect);

  const frequencyField = document.createElement("label");
  frequencyField.className = "field field--compact frequency-field";
  const frequencyLabel = document.createElement("span");
  frequencyLabel.textContent = "Frequência";
  const frequencySelect = document.createElement("select");
  frequencySelect.dataset.role = "frequency";
  frequencySelect.dataset.itemId = question.id;
  frequencySelect.dataset.scope = scope;
  if (sessionIndex !== null) {
    frequencySelect.dataset.sessionIndex = String(sessionIndex);
  }
  frequencySelect.append(
    createSelectOption("", "Selecione"),
    createSelectOption("1", "Baixa"),
    createSelectOption("2", "Média"),
    createSelectOption("3", "Alta")
  );
  frequencySelect.value = observation.frequency;
  frequencyField.append(frequencyLabel, frequencySelect);

  const dependencyStatus = document.createElement("p");
  dependencyStatus.className = "dependency-status";
  dependencyStatus.dataset.role = "dependency-status";

  cell.append(heading, qualityField, frequencyField, dependencyStatus);
  return cell;
}

function createQuestion(question) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = question.critical
    ? "question-item question-item--critical"
    : "question-item";
  fieldset.dataset.questionId = question.id;

  const legend = document.createElement("legend");
  const number = document.createElement("span");
  number.className = "question-number";
  number.textContent = String(question.number);

  const titleWrap = document.createElement("span");
  titleWrap.className = "question-title-wrap";
  const title = document.createElement("span");
  title.className = "question-title";
  title.textContent = `${question.title} (${question.code})`;
  titleWrap.append(title);

  if (question.critical) {
    const badge = document.createElement("span");
    badge.className = "critical-badge";
    badge.textContent = "Item crítico";
    titleWrap.append(badge);
  }

  legend.append(number, titleWrap);

  if (question.dependency) {
    const note = document.createElement("p");
    note.className = "dependency-note";
    note.textContent = question.dependency.note;
    fieldset.append(legend, note);
  } else {
    fieldset.append(legend);
  }

  fieldset.append(createQualityReference(question));

  const observationGrid = document.createElement("div");
  observationGrid.className = "observation-grid";
  for (let index = 0; index < data.sessionCount; index += 1) {
    observationGrid.append(createObservationCell(question, "session", index));
  }
  observationGrid.append(createObservationCell(question, "compiled"));
  fieldset.append(observationGrid);

  const examplesLabel = document.createElement("label");
  examplesLabel.className = "field field--wide examples-field";
  const examplesCopy = document.createElement("span");
  examplesCopy.textContent = "Exemplos de comportamentos";
  const examples = document.createElement("textarea");
  examples.rows = 3;
  examples.placeholder = "Descreva episódios representativos, quando pertinente.";
  examples.dataset.role = "examples";
  examples.dataset.itemId = question.id;
  examples.value = state.responses.items[question.id].examples;
  examplesLabel.append(examplesCopy, examples);
  fieldset.append(examplesLabel);

  return fieldset;
}

function renderQuestions() {
  const list = $("#questionList");
  list.replaceChildren();
  let activeSection = null;

  data.questions.forEach((question) => {
    if (question.section !== activeSection) {
      activeSection = question.section;
      const section = data.sections.find((candidate) => candidate.id === activeSection);
      list.append(createSectionHeader(section));
    }
    list.append(createQuestion(question));
  });
}

function renderConclusionOptions() {
  const host = $("#conclusionOptions");
  host.replaceChildren();

  data.conclusions.forEach((conclusion) => {
    const label = document.createElement("label");
    label.className = "conclusion-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "conclusion";
    input.value = conclusion.value;
    input.checked = state.responses.conclusion === conclusion.value;

    const text = document.createElement("span");
    text.textContent = conclusion.label;

    label.append(input, text);
    host.append(label);
  });
}

function getObservationState(itemId, scope, sessionIndex) {
  const item = state.responses.items[itemId];
  return scope === "compiled"
    ? item.compiled
    : item.sessions[sessionIndex];
}

function observationSelector(itemId, scope, sessionIndex) {
  const sessionPart = sessionIndex === null
    ? ""
    : `[data-session-index="${sessionIndex}"]`;
  return `.observation-cell[data-item-id="${itemId}"][data-scope="${scope}"]${sessionPart}`;
}

function syncObservationControl(question, scope, sessionIndex = null) {
  const observation = getObservationState(question.id, scope, sessionIndex);
  const cell = document.querySelector(
    observationSelector(question.id, scope, sessionIndex)
  );
  if (!cell) return;

  const qualitySelect = cell.querySelector('[data-role="quality"]');
  const frequencySelect = cell.querySelector('[data-role="frequency"]');
  const frequencyField = frequencySelect.closest(".frequency-field");
  const dependencyStatus = cell.querySelector('[data-role="dependency-status"]');
  const dependencyState = getDependencyState(
    data,
    question,
    state.responses,
    scope,
    sessionIndex
  );

  if (dependencyState === "waiting") {
    observation.quality = "";
    observation.frequency = "";
    qualitySelect.disabled = true;
    dependencyStatus.textContent = `Preencha primeiro o item ${question.dependency.parentId.replace("item_", "")}.`;
  } else if (dependencyState === "not_applicable") {
    observation.quality = "E";
    observation.frequency = "";
    qualitySelect.disabled = true;
    dependencyStatus.textContent = "Marcado automaticamente como E - Não se aplica.";
  } else {
    qualitySelect.disabled = false;
    dependencyStatus.textContent = "";
  }

  qualitySelect.value = observation.quality;

  const frequencyRequired = requiresFrequency(question, observation.quality);
  if (!frequencyRequired) {
    observation.frequency = "";
  }

  frequencyField.classList.toggle("hidden", !frequencyRequired);
  frequencySelect.disabled = !frequencyRequired || dependencyState !== "applicable";
  frequencySelect.value = observation.frequency;
}

function syncAllObservationControls() {
  data.questions.forEach((question) => {
    for (let index = 0; index < data.sessionCount; index += 1) {
      syncObservationControl(question, "session", index);
    }
    syncObservationControl(question, "compiled", null);
  });
}

function updateProgress() {
  const scored = scoreResponses(data, state.responses);
  const percent = scored.requiredCount
    ? (scored.answeredCount / scored.requiredCount) * 100
    : 0;

  $("#progressText").textContent =
    `${scored.answeredCount} de ${scored.requiredCount} campos obrigatórios preenchidos`;
  $("#progressBar").style.width = `${percent}%`;
  $("#progressTrack").setAttribute("aria-valuemax", String(scored.requiredCount));
  $("#progressTrack").setAttribute("aria-valuenow", String(scored.answeredCount));

  $("#completionText").textContent = scored.complete
    ? "Avaliação pronta para envio"
    : `Faltam ${scored.unansweredCount} ${scored.unansweredCount === 1 ? "campo" : "campos"}`;

  $("#scorePreview").textContent = scored.criticalScoreComplete
    ? `Escore de qualidade dos itens críticos: ${scored.criticalTotalScore} de 15`
    : `Escore crítico parcial: ${scored.criticalPartialScore}. O total exige códigos A-D nos cinco itens críticos.`;

  return scored;
}

function clearValidationMarks() {
  document.querySelectorAll(".field--error, .question-item--missing, .conclusion-fieldset--missing")
    .forEach((element) => {
      element.classList.remove(
        "field--error",
        "question-item--missing",
        "conclusion-fieldset--missing"
      );
    });
}

function markIssues(issues) {
  clearValidationMarks();
  let firstTarget = null;

  issues.forEach((issue) => {
    let target = null;

    if (issue.type === "session") {
      target = document.querySelector(
        `[data-session-card="${issue.sessionIndex}"] [data-field="${issue.field}"]`
      );
      target?.closest(".field")?.classList.add("field--error");
    } else if (issue.type === "item") {
      const question = document.querySelector(
        `[data-question-id="${issue.itemId}"]`
      );
      question?.classList.add("question-item--missing");

      const selector = [
        `[data-role="${issue.field}"]`,
        `[data-item-id="${issue.itemId}"]`,
        `[data-scope="${issue.scope}"]`,
        issue.sessionIndex === null
          ? ""
          : `[data-session-index="${issue.sessionIndex}"]`
      ].join("");
      target = document.querySelector(selector);
      target?.closest(".field")?.classList.add("field--error");
    } else if (issue.type === "conclusion") {
      target = $("#conclusionFieldset");
      target.classList.add("conclusion-fieldset--missing");
    }

    if (!firstTarget && target) {
      firstTarget = target;
    }
  });

  if (firstTarget) {
    firstTarget.scrollIntoView({ behavior: "smooth", block: "center" });
    firstTarget.focus?.({ preventScroll: true });
  }
}

function setSending(sending) {
  state.sending = sending;
  $("#submitButton").disabled = sending;
  $("#clearDraftButton").disabled = sending;
  $("#submitButton").textContent = sending ? "Enviando..." : "Enviar avaliação";
}

function renderSuccess() {
  showOnly($("#successScreen"));

  if (state.demo) {
    $("#successText").textContent = "Demonstração concluída. Nenhum dado foi enviado à Supabase.";
    $("#successStatus").textContent = "O payload está disponível para validação técnica nesta página.";
    $("#successBackButton").textContent = "Preencher novamente";
    return;
  }

  $("#successStatus").textContent = "Você será direcionado(a) à Área do Paciente em alguns segundos.";
  window.setTimeout(redirectToPatientArea, 3500);
}

function renderAllInputs() {
  renderSessionDetails();
  renderQuestions();
  renderConclusionOptions();
  $("#globalSummary").value = state.responses.summary;
  syncAllObservationControls();
  updateProgress();
}

function handleSessionInput(event) {
  const input = event.target.closest("[data-session-index][data-field]");
  if (!input) return;

  const sessionIndex = Number(input.dataset.sessionIndex);
  const field = input.dataset.field;
  state.responses.sessions[sessionIndex][field] = input.value;
  input.closest(".field")?.classList.remove("field--error");
  saveDraft();
  updateProgress();
}

function handleQuestionChange(event) {
  const select = event.target.closest("select[data-role]");
  if (!select) return;

  const itemId = select.dataset.itemId;
  const scope = select.dataset.scope;
  const sessionIndex = scope === "compiled"
    ? null
    : Number(select.dataset.sessionIndex);
  const observation = getObservationState(itemId, scope, sessionIndex);

  if (select.dataset.role === "quality") {
    observation.quality = select.value;
    if (!requiresFrequency(
      data.questions.find((question) => question.id === itemId),
      observation.quality
    )) {
      observation.frequency = "";
    }
  } else {
    observation.frequency = select.value;
  }

  select.closest(".field")?.classList.remove("field--error");
  select.closest(".question-item")?.classList.remove("question-item--missing");
  syncAllObservationControls();
  saveDraft();
  updateProgress();
  $("#formStatus").textContent = "";
}

function handleQuestionInput(event) {
  const examples = event.target.closest('textarea[data-role="examples"]');
  if (!examples) return;

  state.responses.items[examples.dataset.itemId].examples = examples.value;
  saveDraft();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.sending) return;

  syncAllObservationControls();
  const scored = updateProgress();

  if (!scored.complete) {
    $("#formStatus").textContent =
      scored.issues[0]?.message || "Complete os campos destacados antes de enviar.";
    markIssues(scored.issues);
    return;
  }

  const results = buildResultsPayload(data, scored);
  const resultsMeta = buildResultsMetaPayload(scored);
  setSending(true);
  $("#formStatus").textContent = "";

  try {
    if (state.demo) {
      window.__PROTEA_DEMO_SUBMISSION__ = {
        results,
        results_meta: resultsMeta
      };
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    } else {
      await submitPatientResponse(state.supabaseClient, {
        search: window.location.search,
        results,
        resultsMeta
      });
    }

    clearDraft();
    renderSuccess();
  } catch (error) {
    $("#formStatus").textContent =
      error.message || "Não foi possível enviar a avaliação.";
    setSending(false);
  }
}

function handleClearDraft() {
  const confirmed = window.confirm(
    "Deseja limpar todas as respostas preenchidas nesta aba?"
  );
  if (!confirmed) return;

  state.responses = createInitialResponses(data);
  clearDraft();
  clearValidationMarks();
  $("#formStatus").textContent = "";
  renderAllInputs();
}

async function boot() {
  try {
    validateData(data);
    const patient = await validateAccess();
    if (!patient) return;

    state.patient = patient;
    restoreDraft();
    state.responses = window.PROTEAScoring.normalizeResponses(data, state.responses);
    $("#patientName").textContent =
      getPatientName(patient) || "Identificação validada";
    renderAllInputs();
    showOnly($("#formScreen"));
  } catch (error) {
    showError(error.message || "Não foi possível abrir o formulário.");
  }
}

$("#sessionDetails").addEventListener("input", handleSessionInput);
$("#questionList").addEventListener("change", handleQuestionChange);
$("#questionList").addEventListener("input", handleQuestionInput);
$("#globalSummary").addEventListener("input", (event) => {
  state.responses.summary = event.target.value;
  saveDraft();
});
$("#conclusionOptions").addEventListener("change", (event) => {
  const input = event.target.closest('input[name="conclusion"]');
  if (!input) return;
  state.responses.conclusion = input.value;
  $("#conclusionFieldset").classList.remove("conclusion-fieldset--missing");
  saveDraft();
  updateProgress();
});
$("#questionnaire").addEventListener("submit", handleSubmit);
$("#clearDraftButton").addEventListener("click", handleClearDraft);
$("#successBackButton").addEventListener("click", redirectToPatientArea);

boot();

"use strict";

const SUPABASE_URL = "https://ydypdeafbcdcamwigjuq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lg9teAniku65cd2dnZJvIQ_Zii0XneZ";

if (!window.IDADIData || !window.IDADIAccess || !window.IDADIScoring) {
  throw new Error("Os módulos do IDADI não foram carregados.");
}

const data = window.IDADIData;
const {
  buildPatientAreaUrl,
  fetchPatientAccess,
  getToken,
  submitPatientResponse
} = window.IDADIAccess;
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  calculateCompletedMonths,
  getQuestionnaire,
  scoreQuestionnaire
} = window.IDADIScoring;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state = {
  patient: null,
  ageMonths: null,
  questionnaire: null,
  currentDomainIndex: 0,
  responses: {},
  comments: {},
  sending: false,
  demo: false,
  draftLoaded: false
};

const $ = (selector) => document.querySelector(selector);

function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

function isLocalDemo() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  const params = new URLSearchParams(window.location.search);
  return localHosts.has(window.location.hostname) && params.get("demo") === "1";
}

function getPatientName(patient) {
  return String(patient?.nome || patient?.name || patient?.patient_name || "").trim();
}

function getPatientBirthDate(patient) {
  return String(
    patient?.data_nascimento ||
    patient?.birth_date ||
    patient?.nascimento ||
    ""
  ).trim();
}

function formatAge(ageMonths) {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  const monthText = `${ageMonths} ${ageMonths === 1 ? "mês" : "meses"}`;

  if (years === 0) return monthText;

  const yearText = `${years} ${years === 1 ? "ano" : "anos"}`;
  if (months === 0) return `${monthText} (${yearText})`;

  return `${monthText} (${yearText} e ${months} ${months === 1 ? "mês" : "meses"})`;
}

function stableHash(value) {
  let hash = 2166136261;
  const input = String(value || "");

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function getDraftKey() {
  const token = getToken(window.location.search) || "demo";
  return `${data.formCode}:draft:${stableHash(token)}`;
}

function saveDraft() {
  if (!state.questionnaire || state.sending) return;

  try {
    localStorage.setItem(getDraftKey(), JSON.stringify({
      ageMonths: state.ageMonths,
      currentDomainIndex: state.currentDomainIndex,
      responses: state.responses,
      comments: state.comments
    }));
  } catch (error) {
    console.warn("Não foi possível salvar o rascunho local.", error);
  }
}

function loadDraft() {
  if (state.draftLoaded) return;
  state.draftLoaded = true;

  try {
    const parsed = JSON.parse(localStorage.getItem(getDraftKey()) || "null");
    if (!parsed || Number(parsed.ageMonths) !== state.ageMonths) return;

    state.responses = parsed.responses && typeof parsed.responses === "object"
      ? parsed.responses
      : {};
    state.comments = parsed.comments && typeof parsed.comments === "object"
      ? parsed.comments
      : {};
    state.currentDomainIndex = Number.isInteger(parsed.currentDomainIndex)
      ? parsed.currentDomainIndex
      : 0;
  } catch (error) {
    console.warn("Não foi possível restaurar o rascunho local.", error);
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(getDraftKey());
  } catch (error) {
    console.warn("Não foi possível remover o rascunho local.", error);
  }
}

function redirectToPatientArea() {
  window.location.replace(buildPatientAreaUrl(window.location.search));
}

function showError(message) {
  hide($("#loadingScreen"));
  hide($("#introScreen"));
  hide($("#formScreen"));
  $("#errorText").textContent = message;
  $("#errorBackLink").href = buildPatientAreaUrl(window.location.search);
  show($("#errorScreen"));
}

async function validateAccess() {
  if (state.demo) {
    return {
      nome: "Modo de demonstração",
      data_nascimento: "2023-07-23",
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

function getDemoAge() {
  const params = new URLSearchParams(window.location.search);
  const requested = Number(params.get("age"));
  return Number.isInteger(requested) && requested >= 4 && requested <= 72 ? requested : 36;
}

function configureQuestionnaire(ageMonths, { clearAnswers = false } = {}) {
  if (clearAnswers) {
    state.responses = {};
    state.comments = {};
    state.currentDomainIndex = 0;
    state.draftLoaded = true;
    clearDraft();
  }

  state.ageMonths = ageMonths;
  state.questionnaire = getQuestionnaire(data, ageMonths);
  state.currentDomainIndex = Math.min(
    state.currentDomainIndex,
    state.questionnaire.domains.length - 1
  );
}

function populateDemoAgeSelect() {
  const select = $("#demoAgeSelect");
  select.replaceChildren();

  for (let age = data.supportedAge.minMonths; age <= data.supportedAge.maxMonths; age += 1) {
    const option = document.createElement("option");
    option.value = String(age);
    option.textContent = `${age} meses`;
    option.selected = age === state.ageMonths;
    select.append(option);
  }
}

function renderIntro() {
  const patientName = getPatientName(state.patient);
  $("#introPatientName").textContent = patientName ? `Paciente: ${patientName}` : "";
  $("#ageSummary").textContent = formatAge(state.ageMonths);

  if (state.demo) {
    populateDemoAgeSelect();
    show($("#demoAgeField"));
  }
}

function getAnsweredCount(domain) {
  return domain.questions.reduce(
    (total, question) => total + (state.responses[question.code] ? 1 : 0),
    0
  );
}

function getTotalAnsweredCount() {
  return state.questionnaire.domains.reduce(
    (total, domain) => total + getAnsweredCount(domain),
    0
  );
}

function updateProgress() {
  const answered = getTotalAnsweredCount();
  const total = state.questionnaire.totalQuestions;
  const percent = total ? (answered / total) * 100 : 0;
  $("#globalProgressText").textContent = `${answered} de ${total}`;
  $("#globalProgressBar").style.width = `${percent}%`;

  const domain = state.questionnaire.domains[state.currentDomainIndex];
  const domainAnswered = getAnsweredCount(domain);
  $("#domainProgress").textContent = `${domainAnswered} de ${domain.questions.length}`;

  document.querySelectorAll(".domain-tab").forEach((tab, index) => {
    const tabDomain = state.questionnaire.domains[index];
    const complete = getAnsweredCount(tabDomain) === tabDomain.questions.length;
    tab.classList.toggle("is-complete", complete);
    tab.classList.toggle("is-active", index === state.currentDomainIndex);
    tab.setAttribute("aria-current", index === state.currentDomainIndex ? "step" : "false");
    const counter = tab.querySelector(".domain-tab__count");
    counter.textContent = complete
      ? "Concluído"
      : `${getAnsweredCount(tabDomain)}/${tabDomain.questions.length}`;
  });
}

function renderDomainTabs() {
  const tabs = $("#domainTabs");
  tabs.replaceChildren();

  state.questionnaire.domains.forEach((domain, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "domain-tab";
    button.dataset.index = String(index);

    const label = document.createElement("span");
    label.className = "domain-tab__label";
    label.textContent = domain.shortLabel;

    const count = document.createElement("span");
    count.className = "domain-tab__count";

    button.append(label, count);
    button.addEventListener("click", () => goToDomain(index));
    tabs.append(button);
  });
}

function createResponseOption(question, option) {
  const label = document.createElement("label");
  label.className = "response-option";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = `response-${question.code}`;
  input.value = option.value;
  input.checked = state.responses[question.code] === option.value;

  const text = document.createElement("span");
  text.textContent = option.label;
  label.append(input, text);

  input.addEventListener("change", () => {
    state.responses[question.code] = option.value;
    label.closest(".question-item").classList.add("is-answered");

    if (option.value === "nao_observado") {
      label.closest(".question-item").querySelector("details").open = true;
    }

    $("#domainStatus").textContent = "";
    updateProgress();
    saveDraft();
  });

  return label;
}

function createQuestionItem(question) {
  const article = document.createElement("article");
  article.className = "question-item";
  article.id = `question-${question.code}`;
  article.dataset.code = question.code;
  article.classList.toggle("is-answered", Boolean(state.responses[question.code]));

  const heading = document.createElement("div");
  heading.className = "question-heading";

  const code = document.createElement("span");
  code.className = "question-code";
  code.textContent = question.code;

  const text = document.createElement("p");
  text.textContent = question.text;
  heading.append(code, text);

  const fieldset = document.createElement("fieldset");
  fieldset.className = "response-options";

  const legend = document.createElement("legend");
  legend.className = "sr-only";
  legend.textContent = `Resposta para ${question.code}`;
  fieldset.append(legend);
  data.responses.forEach((option) => fieldset.append(createResponseOption(question, option)));

  const details = document.createElement("details");
  details.className = "comment-details";
  details.open = Boolean(state.comments[question.code]) ||
    state.responses[question.code] === "nao_observado";

  const summary = document.createElement("summary");
  summary.textContent = "Comentário opcional";

  const textarea = document.createElement("textarea");
  textarea.rows = 2;
  textarea.maxLength = 600;
  textarea.value = state.comments[question.code] || "";
  textarea.setAttribute("aria-label", `Comentário do item ${question.code}`);
  textarea.placeholder = "Registre uma observação, se necessário.";
  textarea.addEventListener("input", () => {
    state.comments[question.code] = textarea.value;
    saveDraft();
  });

  details.append(summary, textarea);
  article.append(heading, fieldset, details);
  return article;
}

function renderCurrentDomain() {
  const domain = state.questionnaire.domains[state.currentDomainIndex];
  $("#domainTitle").textContent = domain.label;
  $("#domainRange").textContent =
    `Itens ${domain.code}${domain.range.start} a ${domain.code}${domain.range.end}`;
  $("#domainStatus").textContent = "";

  const list = $("#questionList");
  list.replaceChildren(...domain.questions.map(createQuestionItem));

  $("#previousButton").disabled = state.currentDomainIndex === 0;
  const isLast = state.currentDomainIndex === state.questionnaire.domains.length - 1;
  $("#nextButtonText").textContent = isLast ? "Enviar respostas" : "Próximo domínio";

  updateProgress();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function goToDomain(index) {
  if (index < 0 || index >= state.questionnaire.domains.length || state.sending) return;
  state.currentDomainIndex = index;
  renderCurrentDomain();
  saveDraft();
}

function focusFirstUnanswered(domain) {
  const question = domain.questions.find((item) => !state.responses[item.code]);
  if (!question) return;

  const element = document.getElementById(`question-${question.code}`);
  element?.classList.add("needs-answer");
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => element?.classList.remove("needs-answer"), 1800);
}

function validateCurrentDomain() {
  const domain = state.questionnaire.domains[state.currentDomainIndex];
  const answered = getAnsweredCount(domain);

  if (answered === domain.questions.length) return true;

  $("#domainStatus").textContent =
    `Faltam ${domain.questions.length - answered} itens neste domínio.`;
  focusFirstUnanswered(domain);
  return false;
}

async function submitForm() {
  if (state.sending || !validateCurrentDomain()) return;

  const scored = scoreQuestionnaire(
    data,
    state.questionnaire,
    state.responses,
    state.comments
  );

  if (!scored.complete) {
    const firstIncomplete = state.questionnaire.domains.findIndex(
      (domain) => getAnsweredCount(domain) < domain.questions.length
    );
    goToDomain(firstIncomplete);
    validateCurrentDomain();
    return;
  }

  state.sending = true;
  $("#nextButton").disabled = true;
  $("#previousButton").disabled = true;
  $("#domainStatus").dataset.tone = "neutral";
  $("#domainStatus").textContent = "Enviando respostas...";

  const results = buildResultsPayload(scored);
  const resultsMeta = buildResultsMetaPayload({ scored });

  try {
    if (state.demo) {
      window.__IDADI_DEMO_SUBMISSION__ = { results, results_meta: resultsMeta };
      await new Promise((resolve) => setTimeout(resolve, 350));
    } else {
      await submitPatientResponse(supabaseClient, {
        search: window.location.search,
        results,
        resultsMeta
      });
    }

    clearDraft();
    renderSuccess(resultsMeta);
  } catch (error) {
    console.error(error);
    state.sending = false;
    $("#nextButton").disabled = false;
    $("#previousButton").disabled = state.currentDomainIndex === 0;
    $("#domainStatus").dataset.tone = "error";
    $("#domainStatus").textContent = error.message || "Não foi possível enviar as respostas.";
  }
}

function renderSuccess(resultsMeta) {
  hide($("#formScreen"));
  show($("#successScreen"));

  if (state.demo) {
    $("#successText").textContent = "Demonstração concluída. Nenhum dado foi enviado à Supabase.";
    const results = $("#demoResults");
    results.replaceChildren();
    show(results);

    Object.entries(resultsMeta.pontuacoes_brutas).forEach(([domain, score]) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = domain;
      value.textContent = String(score);
      row.append(label, value);
      results.append(row);
    });

    $("#successStatus").textContent = "Os dados simulados também estão disponíveis no console do navegador.";
    show($("#successBackButton"));
    state.sending = false;
    return;
  }

  $("#successStatus").textContent = "Redirecionando para a área do paciente...";
  setTimeout(redirectToPatientArea, 1800);
}

function startForm() {
  hide($("#introScreen"));
  show($("#formScreen"));

  const patientName = getPatientName(state.patient);
  $("#formPatientName").textContent = patientName;
  $("#formAge").textContent = formatAge(state.ageMonths);
  renderDomainTabs();
  renderCurrentDomain();
}

async function boot() {
  try {
    state.demo = isLocalDemo();
    const patient = await validateAccess();
    if (!patient) return;

    state.patient = patient;
    const ageMonths = state.demo
      ? getDemoAge()
      : calculateCompletedMonths(getPatientBirthDate(patient));

    if (!Number.isInteger(ageMonths)) {
      throw new Error("A data de nascimento do paciente não está disponível ou é inválida.");
    }

    configureQuestionnaire(ageMonths);
    loadDraft();
    renderIntro();

    hide($("#loadingScreen"));
    show($("#introScreen"));
  } catch (error) {
    console.error(error);

    if (error instanceof RangeError) {
      showError("Este instrumento é aplicável a crianças de 4 a 72 meses completos.");
      return;
    }

    showError(error.message || "Não foi possível abrir o formulário.");
  }
}

$("#startButton").addEventListener("click", startForm);
$("#previousButton").addEventListener("click", () => goToDomain(state.currentDomainIndex - 1));
$("#nextButton").addEventListener("click", () => {
  if (!validateCurrentDomain()) return;

  if (state.currentDomainIndex === state.questionnaire.domains.length - 1) {
    submitForm();
  } else {
    goToDomain(state.currentDomainIndex + 1);
  }
});
$("#successBackButton").addEventListener("click", redirectToPatientArea);
$("#demoAgeSelect").addEventListener("change", (event) => {
  const age = Number(event.target.value);
  configureQuestionnaire(age, { clearAnswers: true });
  $("#ageSummary").textContent = formatAge(age);
});

window.IDADI_FORM_DEFINITION = data;
boot();

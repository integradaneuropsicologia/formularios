(function initializeGaiAccess(globalScope) {
  "use strict";

  const FORM_CODE = "GAI_V2";
  const FORM_NAME = "GAI - Inventário de Ansiedade Geriátrica";
  const PATIENT_AREA_URL = "https://integradaneuropsicologia.github.io/area-do-paciente-v2/";

  function getSearchParams(search) {
    return new URLSearchParams(String(search || "").replace(/^\?/, ""));
  }

  function getToken(search) {
    const params = getSearchParams(search);
    return String(params.get("token") || params.get("t") || "").trim();
  }

  function getFormCode(search) {
    const params = getSearchParams(search);
    return String(params.get("form") || params.get("code") || FORM_CODE).trim().toUpperCase();
  }

  function validateRequest(search) {
    const token = getToken(search);
    const formCode = getFormCode(search);

    if (!token) {
      throw new Error("Link inválido ou expirado. Abra o formulário pela Área do Paciente.");
    }

    if (formCode !== FORM_CODE) {
      throw new Error("O link recebido pertence a outro formulário.");
    }

    return { token, formCode };
  }

  function normalizedErrorMessage(error) {
    return String(error?.message || error || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function mapAccessError(error) {
    const message = normalizedErrorMessage(error);

    if (message.includes("nao liberado")) {
      return "Este formulário não está liberado para este paciente.";
    }

    if (message.includes("invalido") || message.includes("expirado")) {
      return "Link inválido ou expirado. Abra o formulário novamente pela Área do Paciente.";
    }

    if (message.includes("avaliacao nao encontrada")) {
      return "A avaliação vinculada a este link não está mais disponível.";
    }

    if (message.includes("paciente nao encontrado")) {
      return "Paciente não encontrado para este link.";
    }

    return "Não foi possível validar a liberação do formulário. Tente novamente em instantes.";
  }

  function mapSubmissionError(error) {
    const message = normalizedErrorMessage(error);

    if (
      message.includes("ja preenchido") ||
      message.includes("duplicate") ||
      message.includes("unique")
    ) {
      return "Este formulário já foi preenchido.";
    }

    if (message.includes("nao liberado")) {
      return "Este formulário não está mais liberado para este paciente.";
    }

    if (message.includes("invalido") || message.includes("expirado")) {
      return "O link expirou antes do envio. Abra novamente pela Área do Paciente.";
    }

    return "Não foi possível salvar as respostas. Tente novamente.";
  }

  function firstRow(data) {
    return Array.isArray(data) ? data[0] || null : data || null;
  }

  async function fetchPatientAccess(client, search) {
    const { token, formCode } = validateRequest(search);
    const { data, error } = await client.rpc("get_public_patient_form_access", {
      p_token: token,
      p_form_code: formCode
    });

    if (error) {
      throw new Error(mapAccessError(error));
    }

    const access = firstRow(data);
    if (!access) {
      throw new Error("Paciente não encontrado para este link.");
    }

    if (String(access.form_code || "").trim().toUpperCase() !== FORM_CODE) {
      throw new Error("A liberação recebida pertence a outro formulário.");
    }

    return access;
  }

  async function submitPatientResponse(client, { search, results, resultsMeta }) {
    const { token, formCode } = validateRequest(search);
    const { data, error } = await client.rpc("submit_public_patient_form_response", {
      p_token: token,
      p_form_code: formCode,
      p_form_name: FORM_NAME,
      p_results: results,
      p_results_meta: resultsMeta
    });

    if (error) {
      throw new Error(mapSubmissionError(error));
    }

    const submission = firstRow(data);
    if (!submission?.ok) {
      throw new Error("O banco não confirmou o salvamento das respostas.");
    }

    return submission;
  }

  function buildPatientAreaUrl(search) {
    const url = new URL(PATIENT_AREA_URL);
    const token = getToken(search);

    if (token) {
      url.searchParams.set("token", token);
    }

    return url.toString();
  }

  const api = Object.freeze({
    FORM_CODE,
    FORM_NAME,
    PATIENT_AREA_URL,
    buildPatientAreaUrl,
    fetchPatientAccess,
    getFormCode,
    getToken,
    mapAccessError,
    mapSubmissionError,
    submitPatientResponse,
    validateRequest
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.GAIAccess = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

"use strict";

const assert = require("node:assert/strict");
const access = require("./access.js");

async function run() {
assert.equal(access.FORM_CODE, "TORRE_DE_LONDRES_V2");
assert.equal(access.FORM_NAME, "Torre de Londres (TOL-BR)");
assert.equal(
  access.getToken("?token=abc%20123&form=TORRE_DE_LONDRES_V2"),
  "abc 123"
);
assert.equal(
  access.getFormCode("?token=abc&form=torre_de_londres_v2"),
  "TORRE_DE_LONDRES_V2"
);
assert.throws(
  () => access.validateRequest("?token=abc&form=OUTRO_FORMULARIO"),
  /outro formulário/
);
assert.equal(
  access.buildPatientAreaUrl("?token=abc%2F123&form=TORRE_DE_LONDRES_V2"),
  "https://integradaneuropsicologia.github.io/area-do-paciente-v2/?token=abc%2F123"
);
assert.equal(
  access.mapAccessError({ message: "Formulario nao liberado para este paciente." }),
  "Este formulário não está liberado para este paciente."
);
assert.equal(
  access.mapSubmissionError({ message: "Formulario ja preenchido." }),
  "Este formulário já foi preenchido."
);

const accessCalls = [];
const accessClient = {
  async rpc(name, args) {
    accessCalls.push({ name, args });
    return {
      data: [{
        cpf: "00000000000",
        form_code: "TORRE_DE_LONDRES_V2",
        already_done: false,
        evaluation_id: "11111111-1111-1111-1111-111111111111"
      }],
      error: null
    };
  }
};

const patientAccess = await access.fetchPatientAccess(
  accessClient,
  "?token=token-valido&form=TORRE_DE_LONDRES_V2"
);
assert.equal(patientAccess.already_done, false);
assert.equal(patientAccess.evaluation_id, "11111111-1111-1111-1111-111111111111");
assert.deepEqual(accessCalls, [{
  name: "get_public_patient_form_access",
  args: {
    p_token: "token-valido",
    p_form_code: "TORRE_DE_LONDRES_V2"
  }
}]);

const submissionCalls = [];
const submissionClient = {
  async rpc(name, args) {
    submissionCalls.push({ name, args });
    return {
      data: [{
        ok: true,
        response_id: "22222222-2222-2222-2222-222222222222",
        cpf: "00000000000",
        form_code: "TORRE_DE_LONDRES_V2"
      }],
      error: null
    };
  }
};
const results = [{ key: "pontuacao_total", value: 57 }];
const resultsMeta = [{ key: "classificacao_normativa", value: "Acima do esperado" }];
const submission = await access.submitPatientResponse(submissionClient, {
  search: "?token=token-valido&form=TORRE_DE_LONDRES_V2",
  results,
  resultsMeta
});

assert.equal(submission.ok, true);
assert.deepEqual(submissionCalls, [{
  name: "submit_public_patient_form_response",
  args: {
    p_token: "token-valido",
    p_form_code: "TORRE_DE_LONDRES_V2",
    p_form_name: "Torre de Londres (TOL-BR)",
    p_results: results,
    p_results_meta: resultsMeta
  }
}]);

console.log("TOL access tests passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

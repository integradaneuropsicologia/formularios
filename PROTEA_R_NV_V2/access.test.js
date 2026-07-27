"use strict";

const assert = require("node:assert/strict");
const access = require("./access.js");

{
  assert.deepEqual(
    access.validateRequest("?token=abc123&form=PROTEA_R_NV_V2"),
    { token: "abc123", formCode: "PROTEA_R_NV_V2" }
  );
  assert.throws(
    () => access.validateRequest("?form=PROTEA_R_NV_V2"),
    /Link inválido/
  );
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
}

(async () => {
  const calls = [];
  const client = {
    async rpc(name, params) {
      calls.push({ name, params });

      if (name === "get_public_patient_form_access") {
        return {
          data: [{
            form_code: "PROTEA_R_NV_V2",
            nome: "Paciente Teste",
            already_done: false
          }],
          error: null
        };
      }

      return {
        data: [{ ok: true }],
        error: null
      };
    }
  };

  const search = "?token=token-valido&form=PROTEA_R_NV_V2";
  const patient = await access.fetchPatientAccess(client, search);
  assert.equal(patient.nome, "Paciente Teste");

  await access.submitPatientResponse(client, {
    search,
    results: [{ pergunta: "Item", resposta: "A" }],
    resultsMeta: { pontuacao_qualidade_total: 0 }
  });

  assert.deepEqual(calls[0], {
    name: "get_public_patient_form_access",
    params: {
      p_token: "token-valido",
      p_form_code: "PROTEA_R_NV_V2"
    }
  });

  assert.equal(calls[1].name, "submit_public_patient_form_response");
  assert.equal(calls[1].params.p_form_code, "PROTEA_R_NV_V2");
  assert.equal(
    calls[1].params.p_form_name,
    "PROTEA-R-NV - Protocolo de Avaliação Comportamental"
  );
  assert.deepEqual(calls[1].params.p_results, [
    { pergunta: "Item", resposta: "A" }
  ]);
  assert.deepEqual(calls[1].params.p_results_meta, {
    pontuacao_qualidade_total: 0
  });

  console.log("PROTEA access tests: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

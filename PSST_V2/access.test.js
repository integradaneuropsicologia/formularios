"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const access = require("./access.js");

test("aceita token e código PSST_V2", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc123&form=PSST_V2"),
    { token: "abc123", formCode: "PSST_V2" }
  );
});

test("recusa link sem token ou pertencente a outro formulário", () => {
  assert.throws(() => access.validateRequest("?form=PSST_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc123&form=OUTRO_V2"),
    /outro formulário/
  );
});

test("envia payload pelo RPC público esperado", async () => {
  const calls = [];
  const client = {
    async rpc(name, params) {
      calls.push({ name, params });
      return { data: [{ ok: true }], error: null };
    }
  };

  await access.submitPatientResponse(client, {
    search: "?token=abc123&form=PSST_V2",
    results: [{ pergunta: "Pergunta", resposta: "Nada" }],
    resultsMeta: { classificacao_psst: "Sem SPM/TPM ou SPM/TPM leve" }
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].params.p_form_code, "PSST_V2");
  assert.equal(calls[0].params.p_form_name, access.FORM_NAME);
});

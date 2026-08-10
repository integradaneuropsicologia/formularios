const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

const FORM_CODE = "QIIAHSD_PRE_ESCOLAR_FAMILIARES_V2";

test("valida token e código fixo do formulário", () => {
  assert.deepEqual(
    access.validateRequest(`?token=abc&form=${FORM_CODE}`),
    { token: "abc", formCode: FORM_CODE }
  );
  assert.throws(() => access.validateRequest(`?form=${FORM_CODE}`), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
});

test("consulta a liberação pública pelo RPC esperado", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{ form_code: FORM_CODE, nome: "Paciente", already_done: false }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    `?token=token-valido&form=${FORM_CODE}`
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: { p_token: "token-valido", p_form_code: FORM_CODE }
  }]);
});

test("envia apenas results de pergunta/resposta e results_meta vazio", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{ pergunta: "Parentesco", resposta: "Mãe" }];

  await access.submitPatientResponse(client, {
    search: `?token=token-valido&form=${FORM_CODE}`,
    results,
    resultsMeta: {}
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, FORM_CODE);
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, {});
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl(`?token=abc&form=${FORM_CODE}`));
  assert.equal(url.searchParams.get("token"), "abc");
});

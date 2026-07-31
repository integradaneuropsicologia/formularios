const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo da HCL-32-R1", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=HCL32_R1_V2"),
    { token: "abc", formCode: "HCL32_R1_V2" }
  );
  assert.throws(() => access.validateRequest("?form=HCL32_R1_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
});

test("consulta a liberação pública da HCL-32-R1", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{
          form_code: "HCL32_R1_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=HCL32_R1_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "HCL32_R1_V2"
    }
  }]);
});

test("envia perguntas, respostas e a soma bruta pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{
    pergunta: "Eu precisava de menos sono.",
    resposta: "Sim"
  }];
  const resultsMeta = { hcl32_total_bruto: 18 };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=HCL32_R1_V2",
    results,
    resultsMeta
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "HCL32_R1_V2");
  assert.equal(
    calls[0].payload.p_form_name,
    "HCL-32-R1 - Escala de Autoavaliação de Hipomania"
  );
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, resultsMeta);
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=HCL32_R1_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

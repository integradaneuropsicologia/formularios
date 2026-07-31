const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo do ISSL", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=ISSL_V2"),
    { token: "abc", formCode: "ISSL_V2" }
  );
  assert.throws(() => access.validateRequest("?form=ISSL_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
});

test("consulta a liberação pública do ISSL", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{
          form_code: "ISSL_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=ISSL_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "ISSL_V2"
    }
  }]);
});

test("envia perguntas, respostas e escores brutos pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{
    pergunta: "Nas últimas 24 horas: Mãos e pés frios",
    resposta: "Sim"
  }];
  const resultsMeta = {
    issl_total_bruto: 12,
    quadro_1_total_bruto: 4,
    quadro_2_total_bruto: 3,
    quadro_3_total_bruto: 5
  };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=ISSL_V2",
    results,
    resultsMeta
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "ISSL_V2");
  assert.equal(
    calls[0].payload.p_form_name,
    "ISSL - Inventário de Sintomas de Stress para Adultos de Lipp"
  );
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, resultsMeta);
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=ISSL_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo do DASS-21", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=DASS21_V2"),
    { token: "abc", formCode: "DASS21_V2" }
  );
  assert.throws(() => access.validateRequest("?form=DASS21_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
});

test("consulta a liberação pública do DASS-21", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{
          form_code: "DASS21_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=DASS21_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "DASS21_V2"
    }
  }]);
});

test("envia perguntas, respostas e as três escalas pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{
    pergunta: "Achei difícil me acalmar.",
    resposta: "Aplicou-se em algum grau ou por pouco tempo"
  }];
  const resultsMeta = {
    escala_depressao: 4,
    escala_ansiedade: 5,
    escala_estresse: 6
  };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=DASS21_V2",
    results,
    resultsMeta
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "DASS21_V2");
  assert.equal(
    calls[0].payload.p_form_name,
    "DASS-21 - Escala de Depressão, Ansiedade e Estresse"
  );
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, resultsMeta);
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=DASS21_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

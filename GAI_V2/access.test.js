const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo do formulário", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=GAI_V2"),
    { token: "abc", formCode: "GAI_V2" }
  );
  assert.throws(() => access.validateRequest("?form=GAI_V2"), /Link inválido/);
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
        data: [{
          form_code: "GAI_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=GAI_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "GAI_V2"
    }
  }]);
});

test("envia o payload estrito pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=GAI_V2",
    results: [{
      pergunta: "Tenho dificuldade em relaxar",
      resposta: "Concordo"
    }],
    resultsMeta: {
      pontuacao_bruta_total: 1
    }
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "GAI_V2");
  assert.equal(calls[0].payload.p_form_name, "GAI - Inventário de Ansiedade Geriátrica");
  assert.deepEqual(calls[0].payload.p_results, [{
    pergunta: "Tenho dificuldade em relaxar",
    resposta: "Concordo"
  }]);
  assert.deepEqual(calls[0].payload.p_results_meta, {
    pontuacao_bruta_total: 1
  });
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=GAI_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

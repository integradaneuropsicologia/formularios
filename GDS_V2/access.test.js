const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo do formulário", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=GDS_V2"),
    { token: "abc", formCode: "GDS_V2" }
  );
  assert.throws(() => access.validateRequest("?form=GDS_V2"), /Link inválido/);
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
          form_code: "GDS_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=GDS_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "GDS_V2"
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
    search: "?token=token-valido&form=GDS_V2",
    results: [{
      pergunta: "O/A Sr(a) está basicamente satisfeito com sua vida?",
      resposta: "Não"
    }],
    resultsMeta: {
      pontuacao_bruta_total: 1
    }
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "GDS_V2");
  assert.equal(calls[0].payload.p_form_name, "GDS-15 - Escala de Depressão Geriátrica");
  assert.deepEqual(calls[0].payload.p_results, [{
    pergunta: "O/A Sr(a) está basicamente satisfeito com sua vida?",
    resposta: "Não"
  }]);
  assert.deepEqual(calls[0].payload.p_results_meta, {
    pontuacao_bruta_total: 1
  });
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=GDS_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

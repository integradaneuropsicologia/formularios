const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo do MDQ", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=MDQ_V2"),
    { token: "abc", formCode: "MDQ_V2" }
  );
  assert.throws(() => access.validateRequest("?form=MDQ_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
});

test("consulta a liberação pública do MDQ", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{ form_code: "MDQ_V2", nome: "Paciente", already_done: false }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=MDQ_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "MDQ_V2"
    }
  }]);
});

test("envia perguntas, respostas e total pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{ pergunta: "Pergunta", resposta: "Sim" }];
  const resultsMeta = { mdq_total: 8 };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=MDQ_V2",
    results,
    resultsMeta
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "MDQ_V2");
  assert.equal(
    calls[0].payload.p_form_name,
    "MDQ - Questionário de Transtorno do Humor"
  );
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, resultsMeta);
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=MDQ_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

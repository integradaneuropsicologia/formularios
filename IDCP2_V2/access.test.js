const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo do IDCP-2", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=IDCP2_V2"),
    { token: "abc", formCode: "IDCP2_V2" }
  );
  assert.throws(() => access.validateRequest("?form=IDCP2_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=BDI_V2"),
    /outro formulário/
  );
});

test("consulta a liberação pública do IDCP-2", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{
          form_code: "IDCP2_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=IDCP2_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "IDCP2_V2"
    }
  }]);
});

test("envia results e as dimensões em results_meta pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{ pergunta: "Tenho conflitos internos.", resposta: "Um pouco verdadeiro" }];
  const resultsMeta = {
    dependencia: 38,
    agressividade: 31,
    instabilidade_de_humor: 29,
    excentricidade: 34,
    necessidade_de_atencao: 25,
    desconfianca: 30,
    grandiosidade: 28,
    isolamento: 35,
    evitacao_a_criticas: 33,
    autossacrificio: 32,
    conscienciosidade: 47,
    inconsequencia: 27
  };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=IDCP2_V2",
    results,
    resultsMeta
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "IDCP2_V2");
  assert.equal(
    calls[0].payload.p_form_name,
    "IDCP-2 - Inventário Dimensional Clínico da Personalidade"
  );
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, resultsMeta);
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=IDCP2_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

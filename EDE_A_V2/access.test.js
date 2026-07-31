const test = require("node:test");
const assert = require("node:assert/strict");

const access = require("./access.js");

test("valida token e código fixo da EDE-A", () => {
  assert.deepEqual(
    access.validateRequest("?token=abc&form=EDE_A_V2"),
    { token: "abc", formCode: "EDE_A_V2" }
  );
  assert.throws(() => access.validateRequest("?form=EDE_A_V2"), /Link inválido/);
  assert.throws(
    () => access.validateRequest("?token=abc&form=OUTRO"),
    /outro formulário/
  );
});

test("consulta a liberação pública da EDE-A", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return {
        data: [{
          form_code: "EDE_A_V2",
          nome: "Paciente",
          already_done: false
        }],
        error: null
      };
    }
  };

  const result = await access.fetchPatientAccess(
    client,
    "?token=token-valido&form=EDE_A_V2"
  );

  assert.equal(result.nome, "Paciente");
  assert.deepEqual(calls, [{
    name: "get_public_patient_form_access",
    payload: {
      p_token: "token-valido",
      p_form_code: "EDE_A_V2"
    }
  }]);
});

test("envia perguntas, respostas e os quatro fatores pelo RPC público", async () => {
  const calls = [];
  const client = {
    async rpc(name, payload) {
      calls.push({ name, payload });
      return { data: [{ ok: true }], error: null };
    }
  };
  const results = [{
    pergunta: "Tento pensar em coisas boas.",
    resposta: "Um pouco"
  }];
  const resultsMeta = {
    fator_1_estrategias_adequadas_de_enfrentamento: 8,
    fator_2_externalizacao_da_agressividade: 6,
    fator_3_pessimismo: 8,
    fator_4_paralisacao: 8
  };

  await access.submitPatientResponse(client, {
    search: "?token=token-valido&form=EDE_A_V2",
    results,
    resultsMeta
  });

  assert.equal(calls[0].name, "submit_public_patient_form_response");
  assert.equal(calls[0].payload.p_form_code, "EDE_A_V2");
  assert.equal(
    calls[0].payload.p_form_name,
    "EDE-A - Escala de Desregulação Emocional - Versão Adultos"
  );
  assert.deepEqual(calls[0].payload.p_results, results);
  assert.deepEqual(calls[0].payload.p_results_meta, resultsMeta);
});

test("retorna à área do paciente preservando o token", () => {
  const url = new URL(access.buildPatientAreaUrl("?token=abc&form=EDE_A_V2"));
  assert.equal(url.searchParams.get("token"), "abc");
});

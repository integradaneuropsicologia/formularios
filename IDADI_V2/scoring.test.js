const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./data.js");
const {
  buildResultsMetaPayload,
  buildResultsPayload,
  calculateCompletedMonths,
  getQuestionnaire,
  scoreQuestionnaire
} = require("./scoring.js");

test("calcula meses completos sem depender do fuso horário", () => {
  assert.equal(calculateCompletedMonths("2023-01-20", "2026-07-19"), 41);
  assert.equal(calculateCompletedMonths("2023-01-20", "2026-07-20"), 42);
  assert.equal(calculateCompletedMonths("2023-01-20T00:00:00Z", "2026-07-20"), 42);
  assert.equal(calculateCompletedMonths("data-invalida", "2026-07-20"), null);
});

test("todos os meses de 4 a 72 geram somente itens existentes", () => {
  for (let age = 4; age <= 72; age += 1) {
    const questionnaire = getQuestionnaire(data, age);
    assert.ok(questionnaire.totalQuestions > 0, `sem itens para ${age} meses`);

    questionnaire.domains.forEach((domain) => {
      domain.questions.forEach((question) => {
        assert.equal(typeof question.text, "string");
        assert.ok(question.text.length > 3, question.code);
      });
    });
  }
});

test("aplica corretamente as faixas nos limites dos dois cadernos", () => {
  const age35 = getQuestionnaire(data, 35);
  assert.deepEqual(
    age35.domains.find((domain) => domain.code === "C").questions.map((item) => item.code),
    Array.from({ length: 42 }, (_, index) => `C${index + 26}`)
  );

  const age36 = getQuestionnaire(data, 36);
  const cognitive = age36.domains.find((domain) => domain.code === "C");
  assert.equal(cognitive.questions[0].code, "C35");
  assert.equal(cognitive.questions.at(-1).code, "C71");

  const age72 = getQuestionnaire(data, 72);
  assert.equal(age72.domains.length, 7);
  assert.equal(age72.domains.find((domain) => domain.code === "C").questions.at(-1).code, "C90");
  assert.equal(age72.domains.find((domain) => domain.code === "CA").questions.at(-1).code, "CA78");
});

test("comportamento adaptativo começa aos 6 meses", () => {
  assert.equal(getQuestionnaire(data, 5).domains.some((domain) => domain.code === "CA"), false);
  assert.equal(getQuestionnaire(data, 6).domains.some((domain) => domain.code === "CA"), true);
});

test("pontua respostas por domínio e preserva não observado", () => {
  const questionnaire = getQuestionnaire(data, 4);
  const responses = {};
  const comments = {};

  questionnaire.domains.forEach((domain) => {
    domain.questions.forEach((question, index) => {
      responses[question.code] = index === 0 ? "nao_observado" : "sim";
    });
    comments[domain.questions[0].code] = "Ainda não foi possível observar.";
  });

  const scored = scoreQuestionnaire(data, questionnaire, responses, comments);
  assert.equal(scored.complete, true);
  assert.equal(scored.notObservedCount, questionnaire.domains.length);

  scored.domainResults.forEach((domain) => {
    assert.equal(domain.pontuacao_bruta, (domain.itens_apresentados - 1) * 2);
    assert.equal(domain.itens_nao_observados, 1);
  });

  const results = buildResultsPayload(scored);
  assert.equal(results.length, questionnaire.totalQuestions);
  assert.ok(results.some((row) => row.resposta === "Não observado" && row.pontuacao === null));

  const meta = buildResultsMetaPayload({
    data,
    questionnaire,
    scored,
    referenceDate: "2026-07-23T12:00:00.000Z"
  });
  assert.equal(meta.idade_meses, 4);
  assert.equal(meta.preenchimento_completo, true);
  assert.equal(Object.keys(meta.pontuacoes_brutas).length, questionnaire.domains.length);
});

test("rejeita idade fora da faixa de aplicação", () => {
  assert.throws(() => getQuestionnaire(data, 3), RangeError);
  assert.throws(() => getQuestionnaire(data, 73), RangeError);
});

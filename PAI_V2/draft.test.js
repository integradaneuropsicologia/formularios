"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  DRAFT_TTL_MS,
  getDraftKey,
  getLegacyDraftKey,
  readDraft,
  removeDraft,
  writeDraft
} = require("./draft.js");

function createStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

test("separa o rascunho por token sem armazenar o token na chave", () => {
  const token = "token-sensivel-de-teste";
  const key = getDraftKey(token);

  assert.match(key, /^pai_v2_draft_[a-z0-9]+$/);
  assert.equal(key.includes(token), false);
  assert.notEqual(key, getDraftKey("outro-token"));
  assert.match(getLegacyDraftKey(token), /^pai_v2_session_[a-z0-9]+$/);
});

test("salva e recupera respostas válidas e a página atual", () => {
  const storage = createStorage();
  const key = getDraftKey("token");
  const savedAt = writeDraft(storage, key, {
    responses: { item_1: "v", item_2: "f", invasor: "v" },
    currentPage: 3
  }, 1_000);
  const draft = readDraft(storage, key, {
    validQuestionIds: ["item_1", "item_2"],
    validValues: ["v", "f"],
    pageCount: 18,
    now: 2_000
  });

  assert.equal(savedAt, 1_000);
  assert.deepEqual(draft, {
    responses: { item_1: "v", item_2: "f" },
    currentPage: 3,
    savedAt: 1_000
  });
});

test("remove rascunhos vencidos", () => {
  const storage = createStorage();
  const key = getDraftKey("token");
  writeDraft(storage, key, { responses: { item_1: "v" }, currentPage: 0 }, 1_000);

  const draft = readDraft(storage, key, {
    validQuestionIds: ["item_1"],
    validValues: ["v"],
    pageCount: 18,
    now: 1_000 + DRAFT_TTL_MS + 1
  });

  assert.equal(draft, null);
  assert.equal(storage.getItem(key), null);
});

test("remove o rascunho após o envio final", () => {
  const storage = createStorage();
  const key = getDraftKey("token");
  writeDraft(storage, key, { responses: {}, currentPage: 0 }, 1_000);

  assert.equal(removeDraft(storage, key), true);
  assert.equal(storage.getItem(key), null);
});

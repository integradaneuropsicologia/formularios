"use strict";

(function exposeDraft(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.PAIDraft = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createDraftApi() {
  const DRAFT_VERSION = 1;
  const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  function hashIdentity(value) {
    let hash = 2166136261;

    for (const character of String(value || "demo")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
  }

  function getDraftKey(identity) {
    return `pai_v2_draft_${hashIdentity(identity)}`;
  }

  function getLegacyDraftKey(identity) {
    return `pai_v2_session_${hashIdentity(identity)}`;
  }

  function removeDraft(storage, key) {
    try {
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function readDraft(storage, key, options = {}) {
    let raw;

    try {
      raw = storage.getItem(key);
    } catch {
      return null;
    }

    if (!raw) return null;

    try {
      const saved = JSON.parse(raw);
      const now = Number.isFinite(options.now) ? options.now : Date.now();
      const ttlMs = Number.isFinite(options.ttlMs) ? options.ttlMs : DRAFT_TTL_MS;
      const parsedSavedAt = Number(saved?.savedAt);
      const savedAt = Number.isFinite(parsedSavedAt) ? parsedSavedAt : now;

      if (!saved || typeof saved.responses !== "object" || now - savedAt > ttlMs) {
        removeDraft(storage, key);
        return null;
      }

      const validQuestionIds = new Set(options.validQuestionIds || []);
      const validValues = new Set(options.validValues || []);
      const responses = Object.fromEntries(
        Object.entries(saved.responses).filter(([questionId, value]) => (
          validQuestionIds.has(questionId) && validValues.has(value)
        ))
      );
      const pageCount = Math.max(Number(options.pageCount) || 1, 1);
      const currentPage = Number.isInteger(saved.currentPage)
        ? Math.min(Math.max(saved.currentPage, 0), pageCount - 1)
        : 0;

      return { responses, currentPage, savedAt };
    } catch {
      removeDraft(storage, key);
      return null;
    }
  }

  function writeDraft(storage, key, draft, now = Date.now()) {
    const savedAt = Number.isFinite(now) ? now : Date.now();

    try {
      storage.setItem(key, JSON.stringify({
        version: DRAFT_VERSION,
        savedAt,
        responses: draft.responses,
        currentPage: draft.currentPage
      }));
      return savedAt;
    } catch {
      return null;
    }
  }

  return {
    DRAFT_TTL_MS,
    getDraftKey,
    getLegacyDraftKey,
    readDraft,
    removeDraft,
    writeDraft
  };
});

"use strict";

/* ===========================
 * CONFIG
 * =========================== */
const SHEETDB_BASE = "https://sheetdb.io/api/v1/8pmdh33s9fvy8";
const SHEETS = { TESTS: "Tests", PATIENTS: "Patients", TOKENS: "LinkTokens" };

/* Fallbacks se a aba Tests não trouxer URL */
const BASE_TEST_URL = "https://integradaneuropsicologia.github.io/formularios";
const BASE_FORM_URL = "https://integradaneuropsicologia.github.io/formularios/share";

/* Mapa opcional para sobrescrever URLs por código */
const TEST_URLS = {
  BAI: "https://integradaneuropsicologia.github.io/formulariodeansiedade/",
  SRS2_AUTORRELATO: "https://integradaneuropsicologia.github.io/srs2/",
  SRS2_HETERORRELATO: "https://integradaneuropsicologia.github.io/SRS2_HETERORRELATO/"
};

const SHARE_URLS = {
  // "SRS2": "https://.../srs2-share.html"
};

/* Links de preencher levam token; links de segunda fonte não */
const APPEND_TOKEN_PARAM = true;
const DEFAULT_TARGETS = ["pais", "professores", "segunda_fonte", "heterorrelato"];

const TEST_PREFIX = ""; // se tiver prefixo nas colunas na aba Patients
const DONE_SUFFIX = "_FEITO";

/* ===========================
 * HELPERS DOM / GERAIS
 * =========================== */

const $ = (s) => document.querySelector(s);
const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);
const onlyDigits = (s) => (s || "").replace(/\D+/g, "");
const qs = (k) => new URLSearchParams(location.search).get(k) || "";

function setMsg(text = "", type = "ok") {
  const b = $("#msg");
  if (!b) return;
  b.textContent = text;
  let cls = "msg ";
  if (!text) {
    cls += "hidden";
  } else if (type === "ok") {
    cls += "okbox";
  } else if (type === "warn") {
    cls += "warnbox";
  } else {
    cls += "errbox";
  }
  b.className = cls;
}

async function sheetSearch(sheet, params) {
  const usp = new URLSearchParams(params);
  const url = `${SHEETDB_BASE}/search?sheet=${encodeURIComponent(
    sheet
  )}&${usp.toString()}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Falha ao buscar em " + sheet);
  return r.json();
}

function maskCPF(cpf) {
  const d = onlyDigits(cpf || "");
  if (d.length !== 11) return cpf || "";
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function fmtDateISO(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function buildUrl(base, params) {
  try {
    const u = new URL(base, location.href);
    Object.entries(params || {}).forEach(([k, v]) =>
      u.searchParams.set(k, v)
    );
    return u.toString();
  } catch {
    const q = Object.entries(params || {})
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
      )
      .join("&");
    return base + (base.includes("?") ? "&" : "?") + q;
  }
}

/* ===========================
 * TEMA (LIGHT/DARK)
 * =========================== */

(function initTheme() {
  const body = document.body;
  const btn = $("#themeToggle");

  function applyTheme(theme) {
    body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("integrada-paciente-theme", theme);
    } catch (e) {}
    if (btn) {
      btn.textContent =
        theme === "light" ? "☀️ Modo claro" : "🌙 Modo escuro";
    }
  }

  let saved = null;
  try {
    saved = localStorage.getItem("integrada-paciente-theme");
  } catch (e) {}

  if (saved === "light" || saved === "dark") applyTheme(saved);
  else applyTheme("dark");

  if (btn) {
    btn.addEventListener("click", () => {
      const current =
        body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(current);
    });
  }
})();

/* ===========================
 * ESTADO
 * =========================== */

let TOKEN = "";
let patient = null;
let testsCatalog = []; // { code, label, order, shareable, targets, form_url, share_url }

/* ===========================
 * BOOT VIA TOKEN
 * =========================== */

(async function boot() {
  try {
    TOKEN = qs("token");
    if (!TOKEN) {
      setMsg(
        "Link inválido (sem token). Solicite um novo link ao consultório.",
        "err"
      );
      return;
    }

    // 1) Token -> validar e pegar CPF
    const trows = await sheetSearch(SHEETS.TOKENS, { token: TOKEN });
    if (!trows || !trows.length)
      throw new Error("Token inválido ou expirado.");

    const t = trows[0];
    if (String(t.disabled || "não").toLowerCase() === "sim")
      throw new Error("Token desativado. Peça um novo link.");
    if (t.expires_at && new Date(t.expires_at) < new Date())
      throw new Error("Token expirado. Peça um novo link.");

    const cpf = onlyDigits(t.cpf || "");
    if (!cpf) throw new Error("Token sem CPF vinculado.");

    // 2) Paciente
    const prows = await sheetSearch(SHEETS.PATIENTS, { cpf });
    if (!prows || !prows.length)
      throw new Error("Paciente não encontrado.");
    patient = prows[0];

    // 3) Catálogo de testes
    await loadTests();

    // 4) Render
    $("#pacNomeSpan").textContent = patient.nome || "Paciente";
    renderPatientInfo();
    renderTests();

    $("#viewApp").classList.remove("hidden");
    $("#btnSair").classList.remove("hidden");
    setMsg("");
  } catch (e) {
    console.error(e);
    setMsg(
      e.message ||
        "Falha ao abrir sua área. Tente novamente mais tarde.",
      "err"
    );
  }
})();

/* ===========================
 * SAIR
 * =========================== */

$("#btnSair")?.addEventListener("click", () => {
  history.replaceState({}, "", location.pathname);
  location.reload();
});

/* ===========================
 * INFO DO PACIENTE
 * =========================== */

function renderPatientInfo() {
  const g = $("#pacInfo");
  if (!g || !patient) return;
  g.innerHTML = "";

  const info = [
    ["Nome", patient.nome || "-"],
    ["CPF", maskCPF(patient.cpf)],
    ["Nascimento", fmtDateISO(patient.data_nascimento)],
    ["E-mail", patient.email || "-"],
    ["WhatsApp", patient.whatsapp || "-"]
  ];

  for (const [k, v] of info) {
    const it = el("div", { className: "info" });
    it.innerHTML = `<b>${k}</b><div>${v || "-"}</div>`;
    g.appendChild(it);
  }
}

/* ===========================
 * TESTES
 * =========================== */

$("#btnAtualizar")?.addEventListener("click", async () => {
  if (!patient) return;
  try {
    const prows = await sheetSearch(SHEETS.PATIENTS, { cpf: patient.cpf });
    if (prows && prows.length) patient = prows[0];
    await loadTests(true);
    renderTests();
    setMsg("Atualizado.", "ok");
    setTimeout(() => setMsg(""), 900);
  } catch (e) {
    console.error(e);
  }
});

async function loadTests(skipFetch) {
  if (!skipFetch) {
    const rows = await sheetSearch(SHEETS.TESTS, { active: "sim" });

    testsCatalog = (rows || [])
      .map((r) => {
        const code = (r.code || "").trim();
        if (!code) return null;
        const label = (r.label || code).trim();
        const order = Number(r.order || 9999);
        const shareable =
          String(r.shareable || "não")
            .trim()
            .toLowerCase() === "sim";
        const targetsArr = String(r.targets || "")
          .split(/[;,]+/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const form_url = (r.form_url || "").trim();
        const share_url = (r.share_url || "").trim();
        return {
          code,
          label,
          order,
          shareable,
          targets:
            shareable && targetsArr.length
              ? targetsArr
              : shareable
              ? DEFAULT_TARGETS
              : [],
          form_url,
          share_url
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.order - b.order || a.label.localeCompare(b.label)
      );
  }

  const allowed = testsCatalog.filter((t) => isAllowed(t));
  const cJa = allowed.filter((t) => statusOf(t) === "ja").length;
  const cOk = allowed.filter((t) => statusOf(t) === "preenchido").length;

  const resume = $("#resume");
  if (resume) {
    resume.textContent = `Liberados: ${allowed.length} • Em aberto: ${cJa} • Preenchidos: ${cOk}`;
  }
}

function colFor(t) {
  return TEST_PREFIX ? TEST_PREFIX + t.code : t.code;
}

function doneColFor(t) {
  return colFor(t) + DONE_SUFFIX;
}

function isAllowed(t) {
  return (
    patient &&
    String(patient[colFor(t)] || "")
      .toLowerCase() === "sim"
  );
}

function statusOf(t) {
  if (!isAllowed(t)) return "oculto";
  const done =
    String(patient[doneColFor(t)] || "")
      .toLowerCase() === "sim";
  return done ? "preenchido" : "ja";
}

/* URL para preencher (com token) */
function resolveFillUrl(t) {
  const base =
    t.form_url ||
    TEST_URLS[t.code] ||
    `${BASE_TEST_URL}/${encodeURIComponent(
      String(t.code || "").toLowerCase()
    )}.html`;

  return APPEND_TOKEN_PARAM
    ? buildUrl(base, { token: TOKEN })
    : base;
}

/* URL de segunda fonte (sem token) */
function resolveShareUrl(t, target) {
  const base =
    t.share_url ||
    SHARE_URLS[t.code] ||
    `${BASE_FORM_URL}/${encodeURIComponent(
      String(t.code || "").toLowerCase()
    )}.html`;

  return buildUrl(base, {
    cpf: onlyDigits(patient.cpf || ""),
    source: target
  });
}

/* Render dos cards */
function renderTests() {
  const grid = $("#testsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!patient) {
    grid.innerHTML =
      "<p class='muted'>Nenhum dado carregado.</p>";
    return;
  }

  const list = testsCatalog.filter((t) => isAllowed(t));
  if (!list.length) {
    grid.innerHTML =
      "<p class='muted'>Você ainda não possui testes liberados.</p>";
    return;
  }

  for (const t of list) {
    const st = statusOf(t); // "preenchido" | "ja"

    const card = el("div", { className: "test" });
    const head = el("div", { className: "test-head" });

    const titleWrap = el("div", { style: "min-width:0" });
    const code = el("div", {
      className: "test-title",
      textContent: t.code
    });
    const label = el("div", {
      className: "test-label",
      textContent: t.label
    });
    titleWrap.appendChild(code);
    titleWrap.appendChild(label);

    const tag = el("span", {
      className:
        "tag " + (st === "preenchido" ? "preenchido" : "ja"),
      textContent:
        st === "preenchido"
          ? "Preenchido"
          : t.shareable
          ? "Aguardando envio"
          : "Pendente!"
    });

    head.appendChild(titleWrap);
    head.appendChild(tag);
    card.appendChild(head);

    const actions = el("div", { className: "toolbar" });

    if (t.shareable) {
      // TESTE COMPARTILHÁVEL
      if (st === "preenchido") {
        actions.appendChild(
          el("button", {
            className: "btn sec",
            textContent: "Preenchido",
            disabled: true
          })
        );
      } else {
        const btnShare = el("button", {
          className: "btn ok",
          textContent: "Enviar link"
        });

        btnShare.addEventListener("click", async () => {
          // usa o MESMO link de preenchimento (com token)
          const shareUrl = resolveFillUrl(t);

          try {
            await navigator.clipboard.writeText(shareUrl);
            setMsg(
              `Link copiado. Aguardando preenchimento de "${t.label}".`,
              "warn"
            );
            tag.textContent = "Aguardando preenchimento";
            tag.className = "tag aguardando";
            setTimeout(() => setMsg(""), 3500);
          } catch (e) {
            alert(shareUrl);
          }
        });

        actions.appendChild(btnShare);
      }
    } else {
      // TESTE NORMAL (não compartilhável)
      if (st === "preenchido") {
        actions.appendChild(
          el("button", {
            className: "btn sec",
            textContent: "Preenchido",
            disabled: true
          })
        );
      } else {
        const btnPre = el("button", {
          className: "btn ok",
          textContent: "Preencher"
        });
        btnPre.addEventListener("click", () => {
          window.open(resolveFillUrl(t), "_blank");
        });
        actions.appendChild(btnPre);
      }
    }

    card.appendChild(actions);
    grid.appendChild(card);
  }
}

/* Opcional: diálogo pra escolher target (se quiser voltar a usar) */
async function chooseTarget(targets) {
  if (!targets || !targets.length) return null;
  const label =
    "Para quem é esse link?\n" +
    targets.map((t, i) => `${i + 1}) ${t}`).join("\n") +
    "\n\nDigite o número:";
  const ans = prompt(label);
  if (!ans) return null;
  const idx = parseInt(ans, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= targets.length) return null;
  return targets[idx];
}

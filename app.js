"use strict";

/* ===========================
 * CONFIG
 * =========================== */
const SHEETDB_BASE = "https://sheetdb.io/api/v1/8pmdh33s9fvy8";
const SHEETS = { TESTS: "Tests", PATIENTS: "Patients", TOKENS: "LinkTokens" };

const BASE_TEST_URL = "https://integradaneuropsicologia.github.io/formularios";
const BASE_FORM_URL = "https://integradaneuropsicologia.github.io/formularios/share";

const TEST_URLS = {
  BAI: "https://integradaneuropsicologia.github.io/formulariodeansiedade/",
  SRS2_AUTORRELATO: "https://integradaneuropsicologia.github.io/srs2/",
  SRS2_HETERORRELATO: "https://integradaneuropsicologia.github.io/SRS2_HETERORRELATO/"
};

const SHARE_URLS = {
  // "SRS2": "..."
};

const APPEND_TOKEN_PARAM = true;
const DEFAULT_TARGETS = ["pais", "professores", "segunda_fonte", "heterorrelato"];
const TEST_PREFIX = "";
const DONE_SUFFIX = "_FEITO";

/* Respondentes disponíveis */
const RESPONDENTS = [
  { cls: "paciente",     label: "Paciente",          desc: "Paciente quem deve responder." },
  { cls: "pais",         label: "Pais/Cuidadores",   desc: "Pais/responsáveis é quem devem responder." },
  { cls: "professores",  label: "Professores",       desc: "Professores/pedagogos quem devem responder." },
  { cls: "familiares",   label: "Familiares/Amigos", desc: "Familiares/amigos que o paciente escolher." },
  { cls: "profissional", label: "Profissional",      desc: "Preenchimento reservado ao profissional que está avaliando." }
];

/* ===========================
 * HELPERS
 * =========================== */

const $ = (s) => document.querySelector(s);
const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);
const onlyDigits = (s) => (s || "").replace(/\D+/g, "");
const qs = (k) => new URLSearchParams(location.search).get(k) || "";

function setMsg(text = "", type = "ok") {
  const b = $("#msg");
  if (!b) return;
  if (!text) {
    b.className = "msg hidden";
    b.textContent = "";
    return;
  }
  const cls =
    type === "ok"
      ? "msg okbox"
      : type === "warn"
      ? "msg warnbox"
      : "msg errbox";
  b.className = cls;
  b.textContent = text;
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
 * TEMA (CLARO/ESCURO)
 * =========================== */

(function initTheme() {
  const body = document.body;
  const btn = $("#themeToggle");

  function applyTheme(theme) {
    body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("integrada-area-paciente-theme", theme);
    } catch (e) {}
    if (btn) {
      btn.textContent =
        theme === "dark" ? "🌙 Modo escuro" : "☀️ Modo claro";
    }
  }

  let saved = null;
  try {
    saved = localStorage.getItem("integrada-area-paciente-theme");
  } catch (e) {}

  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
  } else {
    applyTheme("light"); // padrão inicial pedido
  }

  if (btn) {
    btn.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
      applyTheme(current);
    });
  }
})();

/* ===========================
 * ESTADO
 * =========================== */

let TOKEN = "";
let patient = null;
let testsCatalog = []; // {code,label,order,shareable,targets,form_url,share_url,source}
let currentSource = null;
let currentSourceLabel = "—";

/* ===========================
 * NORMALIZAÇÃO DE SOURCE
 * =========================== */

function normalizeSource(raw) {
  const s = (raw || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

  // Paciente
  if (/\b(pac(iente)?|autorrelato)\b/.test(s))
    return { cls: "paciente", label: "Paciente" };

  // Pais / Cuidadores
  if (/\b(pais|pai|mae|mae|cuidador(a)?|responsavel)\b/.test(s))
    return { cls: "pais", label: "Pais/Cuidadores" };

  // Profissional (checar antes de professores)
  if (
    /\b(profiss(ional)?|avaliador(a)?|psico(logo|loga)?|neuropsico(logo|loga)?|terapeuta)\b/.test(
      s
    )
  )
    return { cls: "profissional", label: "Profissional" };

  // Professores / Escola
  if (/\b(professor(es)?|docente(s)?|escola)\b/.test(s))
    return { cls: "professores", label: "Professores" };

  // Familiares / Amigos
  if (/\b(familia(res)?|amig(o|a|os|as))\b/.test(s))
    return { cls: "familiares", label: "Familiares/Amigos" };

  // Fallback
  return { cls: "profissional", label: raw || "Profissional" };
}

/* ===========================
 * URLS TESTES
 * =========================== */

function colFor(t) {
  return TEST_PREFIX ? TEST_PREFIX + t.code : t.code;
}

function doneColFor(t) {
  return colFor(t) + DONE_SUFFIX;
}

function isAllowed(t) {
  return (
    patient &&
    String(patient[colFor(t)] || "").toLowerCase() === "sim"
  );
}

function statusOf(t) {
  if (!isAllowed(t)) return "oculto";
  const done =
    String(patient[doneColFor(t)] || "").toLowerCase() === "sim";
  return done ? "preenchido" : "ja";
}

/* URL principal (preencher) */
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

/* URL de segunda fonte (se usar) */
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

    // Token → valida e pega CPF
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

    // Paciente
    const prows = await sheetSearch(SHEETS.PATIENTS, { cpf });
    if (!prows || !prows.length)
      throw new Error("Paciente não encontrado.");

    patient = prows[0];

    // Catálogo de testes
    await loadTests();

    // Render inicial
    $("#pacNomeSpan").textContent = patient.nome || "Paciente";
    renderPatientInfo();
    renderRespondentCards();
    toggleSections(false);

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
 * LOGOUT
 * =========================== */

$("#btnSair")?.addEventListener("click", () => {
  history.replaceState({}, "", location.pathname);
  location.reload();
});

/* ===========================
 * INFO PACIENTE
 * =========================== */

function renderPatientInfo() {
  const g = $("#pacInfo");
  if (!g || !patient) return;
  g.innerHTML = "";

  const info = [
    ["Nome", patient.nome || "-"],
    ["Nascimento", fmtDateISO(patient.data_nascimento || "")]
  ];

  for (const [k, v] of info) {
    const it = el("div", { className: "info" });
    it.innerHTML = `<b>${k}</b><div>${v || "-"}</div>`;
    g.appendChild(it);
  }
}

/* ===========================
 * LOAD TESTS
 * =========================== */

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
        const source = (r.source || "paciente").trim();

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
          share_url,
          source
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

/* ===========================
 * ATUALIZAR
 * =========================== */

$("#btnAtualizar")?.addEventListener("click", async () => {
  if (!patient) return;
  try {
    const prows = await sheetSearch(SHEETS.PATIENTS, { cpf: patient.cpf });
    if (prows && prows.length) patient = prows[0];

    await loadTests(true);
    renderRespondentCards();
    renderTests();

    setMsg("Atualizado.", "ok");
    setTimeout(() => setMsg(""), 900);
  } catch (e) {
    console.error(e);
  }
});

/* ===========================
 * SEÇÕES RESPONDENTES / TESTES
 * =========================== */

function toggleSections(showTests) {
  const secResp = $("#respondentsSection");
  const secTests = $("#testsSection");
  if (!secResp || !secTests) return;

  if (showTests) {
    secResp.classList.add("hidden");
    secTests.classList.remove("hidden");
  } else {
    secResp.classList.remove("hidden");
    secTests.classList.add("hidden");
  }
}

function openForSource(cls, label) {
  currentSource = cls;
  currentSourceLabel = label;
  $("#selResp").textContent = label;
  toggleSections(true);
  renderTests();
}

function backToRespondents() {
  currentSource = null;
  currentSourceLabel = "—";
  toggleSections(false);
}

$("#btnTrocarResp")?.addEventListener("click", backToRespondents);

/* ===========================
 * CARDS DE RESPONDENTES
 * =========================== */

function renderRespondentCards() {
  const grid = $("#sourcesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const allowed = testsCatalog.filter((t) => isAllowed(t));

  const counts = {
    paciente: { total: 0, done: 0 },
    pais: { total: 0, done: 0 },
    professores: { total: 0, done: 0 },
    familiares: { total: 0, done: 0 },
    profissional: { total: 0, done: 0 }
  };

  for (const t of allowed) {
    const norm = normalizeSource(t.source).cls;
    if (!counts[norm]) continue;
    counts[norm].total += 1;
    if (statusOf(t) === "preenchido") {
      counts[norm].done += 1;
    }
  }

  for (const r of RESPONDENTS) {
    const data = counts[r.cls] || { total: 0, done: 0 };
    if (data.total === 0) continue;

    const finishedAll =
      data.total > 0 && data.done === data.total;

    const card = el("div", {
      className: `resp-card src-${r.cls}`
    });
    const title = el("div", {
      className: "title",
      textContent: r.label
    });
    const desc = el("div", {
      className: "desc",
      textContent: r.desc
    });
    const count = el("div", {
      className: "count",
      textContent: `Disponíveis: ${data.total} • Respondidos: ${data.done}`
    });

    const btn = el("button", {
      className: `resp-btn ${r.cls}`,
      textContent: finishedAll
        ? "Formulários preenchidos"
        : "Abrir formulários",
      disabled: finishedAll
    });

    if (!finishedAll) {
      btn.addEventListener("click", () =>
        openForSource(r.cls, r.label)
      );
    }

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(count);
    card.appendChild(btn);
    grid.appendChild(card);
  }
}

/* ===========================
 * LISTA DE TESTES POR RESPONDENTE
 * =========================== */

function renderTests() {
  const grid = $("#testsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!patient) {
    grid.innerHTML =
      "<p class='muted'>Nenhum dado carregado.</p>";
    return;
  }

  if (!currentSource) return;

  const list = testsCatalog.filter((t) => {
    if (!isAllowed(t)) return false;
    const src = normalizeSource(t.source).cls;
    return src === currentSource;
  });

  if (!list.length) {
    grid.innerHTML =
      "<p class='muted'>Não há formulários para este respondente.</p>";
    return;
  }

  for (const t of list) {
    const st = statusOf(t);
    const src = normalizeSource(t.source);

    const card = el("div", {
      className: `test src-${src.cls}`
    });

    const head = el("div", { className: "test-head" });
    const titleWrap = el("div", { style: "min-width:0" });

    const title = el("div", {
      className: "test-title",
      textContent: t.label
    });
    const code = el("div", {
      className: "test-code",
      textContent: t.code
    });

    titleWrap.appendChild(title);
    titleWrap.appendChild(code);

    const srcChip = el("span", {
      className: `srcchip ${src.cls}`,
      textContent: src.label
    });

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
    head.appendChild(srcChip);
    head.appendChild(tag);
    card.appendChild(head);

    const actions = el("div", { className: "toolbar" });

    if (t.shareable) {
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
          className: `btn btn-src-${src.cls}`,
          textContent: "Enviar link"
        });
        btnShare.addEventListener("click", async () => {
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
          className: `btn btn-src-${src.cls}`,
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

/* ===========================
 * OPCIONAL: ESCOLHER TARGET
 * (mantido se quiser customizar depois)
 * =========================== */
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

/* ==========================================================================
   MAIN — Shoyaib Hasan
   Shared logic for every page:
     1. helpers
     2. header + footer (built once from data.js, so they never drift apart)
     3. card / row renderers
     4. page sections (home, projects, journal, detail pages)
     5. live GitHub repository feed
     6. boot
   ========================================================================== */
(() => {
  "use strict";

  const data = window.PORTFOLIO || { site: {}, skills: [], projects: [], posts: [] };
  const { site, skills, projects, posts } = data;

  /* ---------- 1. Helpers ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /** Escape text before it is placed inside an HTML string. */
  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const projectUrl = (id) => `project.html?id=${encodeURIComponent(id)}`;
  const postUrl = (id) => `post.html?id=${encodeURIComponent(id)}`;
  const githubUrl = `https://github.com/${site.github}`;
  const newestFirst = (a, b) => b.date.localeCompare(a.date);
  const queryId = () => new URLSearchParams(location.search).get("id");

  const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const readingTime = (paragraphs = []) =>
    Math.max(1, Math.round(paragraphs.join(" ").split(/\s+/).length / 200));

  /* ---------- 2. Header + footer ---------- */
  const NAV_LINKS = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "about", label: "About", href: "index.html#about" },
    { key: "projects", label: "Projects", href: "projects.html" },
    { key: "journal", label: "Journal", href: "journal.html" },
  ];

  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const current = document.body.dataset.nav;

    const links = NAV_LINKS.map(
      (l) => `<a href="${l.href}"${l.key === current ? ' aria-current="page"' : ""}>${l.label}</a>`
    ).join("");

    host.innerHTML = `
      <div class="wrap site-header__inner">
        <a class="brand" href="index.html" aria-label="${esc(site.author)} — home">
          <span class="brand__mark">SH</span>
          <span class="brand__name">${esc(site.author)}</span>
        </a>
        <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-nav">
          <i></i><i></i>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          ${links}
          <a class="site-nav__cta" href="index.html#contact">Contact</a>
        </nav>
      </div>`;

    const toggle = $(".menu-toggle", host);
    const nav = $(".site-nav", host);
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => e.target.closest("a") && setOpen(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
  }

  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.innerHTML = `
      <div class="wrap site-footer__inner">
        <span>© ${new Date().getFullYear()} ${esc(site.author)}</span>
        <div class="site-footer__links">
          <a href="${githubUrl}" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="projects.html">Projects</a>
          <a href="journal.html">Journal</a>
        </div>
        <span>${esc(site.legacy)}</span>
      </div>`;
  }

  /* ---------- 3. Renderers ---------- */
  const tagList = (items = []) =>
    `<div class="tags">${items.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`;

  const projectCard = (p) => `
    <article class="project-card" data-category="${esc(p.category)}">
      <a class="project-card__image" href="${projectUrl(p.id)}" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.image)}" alt="" loading="lazy">
      </a>
      <div class="project-card__body">
        <div class="project-card__meta">
          <b>${esc(p.category)}</b>
          <span><i class="led" data-status="${esc(p.status)}"></i>${esc(p.status)} · ${esc(p.year)}</span>
        </div>
        <h3><a href="${projectUrl(p.id)}">${esc(p.title)}</a></h3>
        <p>${esc(p.summary)}</p>
        ${tagList(p.stack?.slice(0, 3))}
        <a class="link-arrow" href="${projectUrl(p.id)}">View project <span>↗</span></a>
      </div>
    </article>`;

  const postRow = (p) => `
    <article class="post-row">
      <div class="post-row__date">${formatDate(p.date)}<span>${esc(p.category)}</span></div>
      <div>
        <h3><a href="${postUrl(p.id)}">${esc(p.title)}</a></h3>
        <p>${esc(p.excerpt)}</p>
        <a class="link-arrow" href="${postUrl(p.id)}">Read entry <span>↗</span></a>
      </div>
      <span class="post-row__arrow" aria-hidden="true">↗</span>
    </article>`;

  const skillCard = (s) => `
    <article class="module">
      <span class="module__led"><i class="led"></i>loaded</span>
      <div class="module__icon" aria-hidden="true">${esc(s.icon)}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
      ${tagList(s.tags)}
    </article>`;

  /* ---------- 4. Page sections ---------- */
  const fill = (selector, html) => {
    const el = $(selector);
    if (el) el.innerHTML = html;
    return el;
  };

  function renderHome() {
    fill("#skills-grid", skills.map(skillCard).join(""));
    fill("#featured-projects", projects.slice(0, 3).map(projectCard).join(""));
    const latest = [...posts].sort(newestFirst)[0];
    fill("#latest-post", latest ? postRow(latest) : "<p>No journal entries yet.</p>");

    const mail = $("#contact-mail");
    if (mail) mail.href = `mailto:${site.email}`;
    const mailText = $("#contact-mail-text");
    if (mailText) {
      mailText.textContent = site.email;
      mailText.href = `mailto:${site.email}`;
    }
    $$("[data-github]").forEach((a) => (a.href = githubUrl));
  }

  function renderProjectsPage() {
    const grid = fill("#all-projects", projects.map(projectCard).join("") || "<p>No projects published yet.</p>");
    const filters = $("#project-filters");
    if (!grid || !filters) return;

    const count = $("#project-count");
    const updateCount = () => {
      const visible = $$(".project-card", grid).filter((c) => !c.hidden).length;
      if (count) count.textContent = `${visible} ${visible === 1 ? "project" : "projects"} shown`;
    };

    filters.addEventListener("click", (e) => {
      const button = e.target.closest("[data-filter]");
      if (!button) return;
      $$("button", filters).forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      $$(".project-card", grid).forEach((card) => {
        card.hidden = button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter;
      });
      updateCount();
    });
    updateCount();
  }

  function renderJournalPage() {
    fill("#all-posts", [...posts].sort(newestFirst).map(postRow).join("") || "<p>No journal entries yet.</p>");
  }

  function renderProjectDetail() {
    const host = $("#project-detail");
    if (!host) return;
    const p = projects.find((x) => x.id === queryId());
    document.title = p ? `${p.title} — ${site.author}` : `Project not found — ${site.author}`;

    if (!p) {
      host.innerHTML = `<h1>Project not found</h1><p class="detail__lead">Check the link, or browse the full archive.</p>
        <a class="link-arrow" href="projects.html">Back to projects <span>↗</span></a>`;
      return;
    }

    const links = (p.links || [])
      .map((l) => `<a class="btn btn--primary" href="${esc(l.url)}" target="_blank" rel="noreferrer">${esc(l.label)} <span>↗</span></a>`)
      .join("");
    const paragraphs = (Array.isArray(p.description) ? p.description : String(p.description || "").split("\n"))
      .map((t) => `<p>${esc(t)}</p>`)
      .join("");

    host.innerHTML = `
      <a class="back-link" href="projects.html">← All projects</a>
      <header class="detail__hero">
        <p class="kicker">${esc(p.category)}</p>
        <h1>${esc(p.title)}</h1>
        <p class="detail__lead">${esc(p.summary)}</p>
      </header>
      <img class="detail__image" src="${esc(p.image)}" alt="${esc(p.title)} illustration">
      <div class="detail__grid">
        <dl class="spec">
          <div><dt>Category</dt><dd>${esc(p.category)}</dd></div>
          <div><dt>Status</dt><dd><i class="led"></i>${esc(p.status)}</dd></div>
          <div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
          <div><dt>Stack</dt><dd>${tagList(p.stack)}</dd></div>
        </dl>
        <div class="detail__text">
          <h2>Overview</h2>
          ${paragraphs}
          <div class="detail__actions">${links}</div>
        </div>
      </div>`;
  }

  function renderPostDetail() {
    const host = $("#post-detail");
    if (!host) return;
    const p = posts.find((x) => x.id === queryId());
    document.title = p ? `${p.title} — ${site.author}` : `Entry not found — ${site.author}`;

    if (!p) {
      host.innerHTML = `<h1>Entry not found</h1><p class="article__intro">Check the link, or browse the journal.</p>
        <a class="link-arrow" href="journal.html">Back to journal <span>↗</span></a>`;
      return;
    }

    host.innerHTML = `
      <a class="back-link" href="journal.html">← Journal</a>
      <article class="article">
        <header>
          <p class="kicker">${esc(p.category)}</p>
          <h1>${esc(p.title)}</h1>
          <p class="article__byline">${esc(site.author)} · ${formatDate(p.date)} · ${readingTime(p.content)} min read</p>
        </header>
        <p class="article__intro">${esc(p.excerpt)}</p>
        ${(p.content || []).map((t) => `<p>${esc(t)}</p>`).join("")}
      </article>`;

    const bar = $("#read-progress");
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- 5. Live GitHub repository feed (projects page) ---------- */
  async function renderGithubFeed() {
    const host = $("#github-feed");
    if (!host) return;

    const fallback = `<p class="feed__note">Couldn’t reach GitHub right now. See everything on
      <a href="${githubUrl}" target="_blank" rel="noreferrer">github.com/${esc(site.github)} ↗</a></p>`;

    try {
      const response = await fetch(`https://api.github.com/users/${site.github}/repos?sort=updated&per_page=12`);
      if (!response.ok) throw new Error(response.status);
      const repos = (await response.json()).filter((r) => !r.fork).slice(0, 6);
      if (!repos.length) throw new Error("no repos");

      host.innerHTML = repos
        .map(
          (r) => `
        <a class="repo" href="${esc(r.html_url)}" target="_blank" rel="noreferrer">
          <span class="repo__name">${esc(r.name)}</span>
          <span class="repo__desc">${esc(r.description || "No description yet.")}</span>
          <span class="repo__meta">
            ${r.language ? `<b>${esc(r.language)}</b>` : ""}
            <span>★ ${r.stargazers_count}</span>
            <span>updated ${formatDate(r.pushed_at.slice(0, 10))}</span>
          </span>
        </a>`
        )
        .join("");
    } catch {
      host.innerHTML = fallback;
    }
  }

  /* ---------- 6. Boot ---------- */
  function boot() {
    renderHeader();
    renderFooter();

    const renderers = {
      home: renderHome,
      projects: renderProjectsPage,
      journal: renderJournalPage,
      project: renderProjectDetail,
      post: renderPostDetail,
    };
    renderers[document.body.dataset.page]?.();
    renderGithubFeed();

    // Reveal hero content on the next frame (one orchestrated entrance)
    requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

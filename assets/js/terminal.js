/* ==========================================================================
   TERMINAL — Shoyaib Hasan (home page)
   A simulated shell: it types a short boot sequence, then lets visitors run
   commands (type `help`). Nothing here touches a real system.
   Click or press a key during the boot sequence to skip the typing.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.getElementById("terminal");
  if (!root || !window.PORTFOLIO) return;

  const { site, skills, projects, posts } = window.PORTFOLIO;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const output = root.querySelector(".term__output");
  const body = root.querySelector(".term__body");
  const form = root.querySelector(".term__form");
  const input = root.querySelector(".term__input");

  const PROMPT = `admin@${site.handle}:~$`;
  const history = [];
  let historyIndex = 0;
  let skipTyping = false;

  /* ---------- Small helpers ---------- */
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, skipTyping || reduceMotion ? 0 : ms));
  const scrollToEnd = () => { body.scrollTop = body.scrollHeight; };
  const dim = (t) => `<span class="t-dim">${esc(t)}</span>`;
  const ok = (t) => `<span class="t-ok">${esc(t)}</span>`;
  const link = (href, label, external = false) =>
    `<a href="${esc(href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${esc(label)}</a>`;

  function addLine(html, className = "") {
    const line = document.createElement("div");
    line.className = `term__line ${className}`.trim();
    line.innerHTML = html;
    output.appendChild(line);
    scrollToEnd();
    return line;
  }

  /** Prints "$ command" one character at a time (or instantly when skipped). */
  async function typeCommand(text) {
    const line = addLine(`<span class="t-prompt">${PROMPT}</span> <span class="t-typed"></span>`);
    const target = line.querySelector(".t-typed");
    for (const char of text) {
      target.textContent += char;
      await wait(34);
    }
    await wait(180);
  }

  /* ---------- Commands ---------- */
  const PAGES = {
    home: "index.html",
    about: "index.html#about",
    projects: "projects.html",
    journal: "journal.html",
    contact: "index.html#contact",
  };

  const FILES = {
    "focus.txt": () => ["cybersecurity · robotics · embedded systems · software"],
    "about.md": () => [
      `${esc(site.author)} — studying Information &amp; Communication Engineering at ${esc(site.university)}.`,
      "Turns ideas into working prototypes: electronics builds, software experiments, security labs.",
    ],
    "contact.txt": () => [`email   ${esc(site.email)}`, `github  github.com/${esc(site.github)}`],
  };

  const COMMANDS = {
    help: () => [
      `${ok("available commands")}`,
      `  <b>whoami</b>      who is behind this site`,
      `  <b>skills</b>      the toolkit`,
      `  <b>projects</b>    selected builds`,
      `  <b>journal</b>     latest notes`,
      `  <b>contact</b>     ways to reach me`,
      `  <b>github</b>      open the GitHub profile`,
      `  <b>ls</b> · <b>cat</b> &lt;file&gt;   look around`,
      `  <b>goto</b> &lt;page&gt;   home · about · projects · journal · contact`,
      `  <b>clear</b>       wipe the screen`,
    ],

    whoami: () => [
      `${esc(site.author)} — ${esc(site.role)}`,
      dim(`${site.university} · ${site.location}`),
    ],

    skills: () =>
      skills.map((s) => `${ok("[ok]")} <b>${esc(s.title)}</b> ${dim("→ " + s.tags.join(", "))}`),

    projects: () => [
      ...projects.map((p) => `${ok("[" + p.status.toLowerCase() + "]")} ${link(`project.html?id=${p.id}`, p.title)}`),
      dim("tip: goto projects opens the full archive"),
    ],

    journal: () => [
      ...[...posts]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => `${dim(p.date)} ${link(`post.html?id=${p.id}`, p.title)}`),
      dim("tip: goto journal opens every entry"),
    ],

    contact: () => [
      `email   ${link(`mailto:${site.email}`, site.email)}`,
      `github  ${link(`https://github.com/${site.github}`, `github.com/${site.github}`, true)}`,
    ],

    github: () => {
      setTimeout(() => window.open(`https://github.com/${site.github}`, "_blank", "noopener"), 400);
      return [`opening github.com/${esc(site.github)} …`];
    },

    ls: () => [`about.md  focus.txt  contact.txt  ${ok("projects/")}  ${ok("journal/")}`],

    cat: ([file]) => {
      if (!file) return ["usage: cat &lt;file&gt;   try: cat about.md"];
      return has(FILES, file) ? FILES[file]() : [`cat: ${esc(file)}: no such file`];
    },

    goto: ([page]) => {
      const target = has(PAGES, page) ? PAGES[page] : null;
      if (!target) return ["usage: goto &lt;page&gt;   home · about · projects · journal · contact"];
      setTimeout(() => (location.href = target), 450);
      return [`navigating to ${esc(page)} …`];
    },

    date: () => [new Date().toString()],
    sudo: () => [`<span class="t-err">guest is not in the sudoers file. This incident will be reported.</span>`],
    clear: () => { output.innerHTML = ""; return []; },
  };

  /* ---------- Running commands ---------- */
  function run(raw) {
    const text = raw.trim();
    addLine(`<span class="t-prompt">${PROMPT}</span> ${esc(text)}`);
    if (!text) return;

    history.push(text);
    historyIndex = history.length;

    const [name, ...args] = text.split(/\s+/);
    const key = name.toLowerCase();
    const command = has(COMMANDS, key) ? COMMANDS[key] : null;
    if (!command) {
      addLine(`<span class="t-err">command not found: ${esc(name)}</span> ${dim("— type help")}`);
      return;
    }
    command(args).forEach((line) => addLine(line));
  }

  /* ---------- Input handling ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const typed = input.value.toLowerCase();
      const match = typed && Object.keys(COMMANDS).find((c) => c.startsWith(typed));
      if (match) input.value = match;
    }
  });

  body.addEventListener("click", () => {
    if (!getSelection().toString()) input.focus({ preventScroll: true });
  });

  root.querySelectorAll("[data-cmd]").forEach((chip) =>
    chip.addEventListener("click", () => {
      if (form.hidden) return;
      run(chip.dataset.cmd);
    })
  );

  /* ---------- Boot sequence ---------- */
  async function boot() {
    const skip = () => { skipTyping = true; };
    root.addEventListener("pointerdown", skip, { once: true });
    document.addEventListener("keydown", skip, { once: true });
    output.setAttribute("aria-busy", "true");

    await wait(500);
    await typeCommand(`ssh guest@${site.handle}${site.brandSuffix}`);
    addLine(`${dim("establishing secure channel…")} ${ok("[ ok ]")}`);
    await wait(350);

    await typeCommand("whoami");
    addLine(`${esc(site.author)} — ${esc(site.role)}`);
    await wait(250);

    await typeCommand("cat focus.txt");
    FILES["focus.txt"]().forEach((l) => addLine(l));
    await wait(250);

    addLine(dim("type 'help' to see what this shell can do."));
    output.removeAttribute("aria-busy");
    form.hidden = false;
    root.querySelector(".term__prompt").textContent = PROMPT;

    // Only grab focus on devices with a real pointer, so phones don't pop the keyboard open.
    if (matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
    scrollToEnd();
  }

  boot();
})();

/* ==========================================================================
   FX — Shoyaib Hasan
   Page-specific graphics, chosen with <body data-fx="...">:

     rain    → home      data-rain falling behind the terminal (cybersecurity)
     circuit → projects  circuit traces with travelling signal pulses (robotics)
     stars   → journal   twinkling starfield with shooting stars (cool / synthwave)

   Also drives the animated robot-arm blueprint on the projects page.
   Everything pauses when the tab is hidden or the canvas scrolls off screen,
   and draws a single still frame if the visitor prefers reduced motion.
   ========================================================================== */
(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssVar = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  /* ---------- Canvas plumbing ---------- */
  function createLayer() {
    const canvas = document.createElement("canvas");
    canvas.className = "fx-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    const view = { w: 0, h: 0 };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      view.w = canvas.clientWidth;
      view.h = canvas.clientHeight;
      canvas.width = view.w * dpr;
      canvas.height = view.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    return { canvas, ctx, view, resize };
  }

  /** Runs `draw(time, delta)` every frame while visible. `onResize` rebuilds scene data. */
  function animate(layer, setup, draw, stillFrames = 1) {
    let scene = setup(layer);
    // reduced motion: paint a static picture instead of animating
    const paintStill = () => { for (let i = 0; i < stillFrames; i++) draw(layer, scene, i * 60, 60); };
    let raf = 0;
    let last = 0;
    let visible = true;

    const frame = (time) => {
      draw(layer, scene, time, Math.min(time - last, 64));
      last = time;
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    addEventListener("resize", () => { layer.resize(); scene = setup(layer); if (reduceMotion) paintStill(); });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }).observe(layer.canvas);

    if (reduceMotion) { paintStill(); return; }
    start();
  }

  /* ==========================================================================
     RAIN — falling hex / katakana glyphs (home)
     ========================================================================== */
  function matrixRain(layer) {
    const glyphs = "01ABCDEF<>{}[]/\\|=+*#$%ｱｲｳｴｵｶｷｸｹｺｻｼｽ";
    const accent = cssVar("--accent-rgb");
    const bg = cssVar("--bg-rgb");
    const size = 16;
    let drops, elapsed = 0;

    const setup = ({ view }) => {
      drops = Array.from({ length: Math.ceil(view.w / size) }, () => rand(-view.h / size, 0));
      layer.ctx.fillStyle = `rgb(${bg})`;
      layer.ctx.fillRect(0, 0, view.w, view.h);
      return {};
    };

    const draw = ({ ctx, view }, _scene, _time, delta) => {
      elapsed += delta;
      if (!reduceMotion && elapsed < 55) return; // ~18 fps keeps it calm and cheap
      elapsed = 0;

      ctx.fillStyle = `rgba(${bg}, 0.14)`; // translucent fill leaves a fading trail
      ctx.fillRect(0, 0, view.w, view.h);
      ctx.font = `${size}px "IBM Plex Mono", monospace`;

      drops.forEach((y, i) => {
        const x = i * size;
        ctx.fillStyle = `rgba(${accent}, 0.9)`; // bright head
        ctx.fillText(pick(glyphs), x, y * size);
        ctx.fillStyle = `rgba(${accent}, 0.28)`; // dim neighbour
        ctx.fillText(pick(glyphs), x, (y - 1) * size);
        drops[i] = y * size > view.h && Math.random() > 0.975 ? 0 : y + 1;
      });
    };

    layer.canvas.style.opacity = "0.32";
    animate(layer, setup, draw, 70);
  }

  /* ==========================================================================
     CIRCUIT — traces with signal pulses (projects)
     ========================================================================== */
  function circuitBoard(layer) {
    const cell = 44;
    const trace = cssVar("--accent-rgb");
    const pulse = cssVar("--accent-rgb");

    /** Random orthogonal polyline that walks across the grid. */
    const makePath = (view) => {
      let x = Math.round(rand(0, view.w / cell)) * cell;
      let y = Math.round(rand(0, view.h / cell)) * cell;
      const points = [{ x, y }];
      let horizontal = Math.random() > 0.5;
      for (let i = 0; i < Math.round(rand(3, 7)); i++) {
        const run = Math.round(rand(1, 5)) * cell * (Math.random() > 0.5 ? 1 : -1);
        horizontal ? (x += run) : (y += run);
        points.push({ x, y });
        horizontal = !horizontal;
      }
      const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
      return { points, lengths, total: lengths.reduce((a, b) => a + b, 0), t: Math.random(), speed: rand(0.00004, 0.00009) };
    };

    /** Point at distance `d` along a path. */
    const pointAt = (path, d) => {
      let remaining = d;
      for (let i = 0; i < path.lengths.length; i++) {
        if (remaining <= path.lengths[i]) {
          const k = remaining / path.lengths[i];
          const a = path.points[i], b = path.points[i + 1];
          return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
        }
        remaining -= path.lengths[i];
      }
      return path.points[path.points.length - 1];
    };

    const setup = ({ view }) => ({ paths: Array.from({ length: Math.round(view.w / 55) }, () => makePath(view)) });

    const draw = ({ ctx, view }, scene, _time, delta) => {
      ctx.clearRect(0, 0, view.w, view.h);
      scene.paths.forEach((path) => {
        // static trace + solder pads at both ends
        ctx.strokeStyle = `rgba(${trace}, 0.1)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        path.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
        [path.points[0], path.points[path.points.length - 1]].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${trace}, 0.25)`;
          ctx.stroke();
        });

        // travelling pulse with a short fading tail
        path.t = (path.t + path.speed * delta * 6) % 1;
        for (let k = 0; k < 8; k++) {
          const d = Math.max(0, path.t * path.total - k * 7);
          const p = pointAt(path, d);
          ctx.fillStyle = `rgba(${pulse}, ${0.75 - k * 0.09})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.4 - k * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    layer.canvas.style.opacity = "0.75";
    animate(layer, setup, draw);
  }

  /* ==========================================================================
     STARS — twinkling field + occasional shooting star (journal)
     ========================================================================== */
  function starfield(layer) {
    const colors = [cssVar("--accent-rgb"), "167, 139, 250", "255, 122, 217", "232, 235, 255"];

    const setup = ({ view }) => ({
      stars: Array.from({ length: Math.round((view.w * view.h) / 9000) }, () => ({
        x: rand(0, view.w), y: rand(0, view.h), r: rand(0.4, 1.7),
        phase: rand(0, Math.PI * 2), speed: rand(0.0006, 0.002), color: pick(colors),
      })),
      comet: null,
      nextComet: 2500,
    });

    const draw = ({ ctx, view }, scene, time, delta) => {
      ctx.clearRect(0, 0, view.w, view.h);
      scene.stars.forEach((s) => {
        const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + time * s.speed));
        ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      scene.nextComet -= delta;
      if (!scene.comet && scene.nextComet <= 0 && !reduceMotion) {
        scene.comet = { x: rand(view.w * 0.3, view.w), y: rand(0, view.h * 0.3), life: 1 };
        scene.nextComet = rand(5000, 9000);
      }
      if (scene.comet) {
        const c = scene.comet;
        const gradient = ctx.createLinearGradient(c.x, c.y, c.x + 120, c.y - 70);
        gradient.addColorStop(0, `rgba(${colors[0]}, ${c.life})`);
        gradient.addColorStop(1, `rgba(${colors[0]}, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + 120, c.y - 70);
        ctx.stroke();
        c.x -= delta * 0.7;
        c.y += delta * 0.4;
        c.life -= delta / 1100;
        if (c.life <= 0) scene.comet = null;
      }
    };

    layer.canvas.style.opacity = "0.9";
    animate(layer, setup, draw);
  }

  /* ==========================================================================
     ROBOT ARM — two-link arm blueprint with live joint read-outs (projects)
     ========================================================================== */
  function robotArm() {
    const arm = document.getElementById("arm");
    if (!arm) return;

    const upper = arm.querySelector("#arm-upper");
    const fore = arm.querySelector("#arm-fore");
    const gripA = arm.querySelector("#grip-a");
    const gripB = arm.querySelector("#grip-b");
    const readout = {
      a1: arm.querySelector("#read-a1"),
      a2: arm.querySelector("#read-a2"),
      g: arm.querySelector("#read-g"),
    };
    const signed = (n) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}`;
    let frameCount = 0;

    const pose = (t) => {
      const a1 = 22 * Math.sin(t * 0.00062);              // shoulder swing (deg)
      const a2 = 28 * Math.sin(t * 0.00091 + 1.2);        // elbow swing (deg)
      const gap = 3.2 + 3 * Math.sin(t * 0.0021);         // gripper opening (mm)
      upper.setAttribute("transform", `rotate(${a1.toFixed(2)} 200 290)`);
      fore.setAttribute("transform", `rotate(${a2.toFixed(2)} 200 190)`);
      gripA.setAttribute("transform", `translate(0 ${(-gap).toFixed(2)})`);
      gripB.setAttribute("transform", `translate(0 ${gap.toFixed(2)})`);
      if (frameCount++ % 4 === 0) {
        readout.a1.textContent = `${signed(a1)}°`;
        readout.a2.textContent = `${signed(a2)}°`;
        readout.g.textContent = `${(gap * 2).toFixed(1)} mm`;
      }
    };

    if (reduceMotion) { pose(2000); return; }
    let raf = 0;
    const frame = (t) => { pose(t); raf = requestAnimationFrame(frame); };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(arm);
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const effects = { rain: matrixRain, circuit: circuitBoard, stars: starfield };
    const effect = effects[document.body.dataset.fx];
    if (effect) effect(createLayer());
    robotArm();
  });
})();

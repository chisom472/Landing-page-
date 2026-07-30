(function () {
  "use strict";

  const typedEl = document.getElementById("typed-prompt");
  const cursorEl = document.getElementById("cursor");
  const outputsEl = document.getElementById("console-outputs");

  if (!typedEl || !outputsEl) return;

  const prompt = "Write a launch announcement for a new productivity app.";
  const rows = Array.from(outputsEl.querySelectorAll(".output-row"));

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Reduced-motion / no-JS-friendly fallback: show everything statically.
  if (reduceMotion) {
    typedEl.textContent = prompt;
    if (cursorEl) cursorEl.style.display = "none";
    rows.forEach((row) => row.classList.add("is-visible"));
    return;
  }

  const TYPE_SPEED = 32; // ms per character
  const ROW_DELAY = 260; // ms between each output row appearing
  const HOLD_TIME = 3400; // ms to hold the finished state before looping
  const PAUSE_BEFORE_TYPE = 500;

  let cancelled = false;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function typeText(text) {
    typedEl.textContent = "";
    for (let i = 0; i < text.length; i++) {
      if (cancelled) return;
      typedEl.textContent += text[i];
      await wait(TYPE_SPEED);
    }
  }

  async function revealRows() {
    for (const row of rows) {
      if (cancelled) return;
      row.classList.add("is-visible");
      await wait(ROW_DELAY);
    }
  }

  function resetRows() {
    rows.forEach((row) => row.classList.remove("is-visible"));
  }

  async function runSequence() {
    while (!cancelled) {
      resetRows();
      typedEl.textContent = "";
      await wait(PAUSE_BEFORE_TYPE);
      await typeText(prompt);
      await wait(300);
      await revealRows();
      await wait(HOLD_TIME);
    }
  }

  // Only animate once the console is actually in view, and pause when it isn't.
  const consoleEl = document.querySelector(".console");
  let started = false;

  if ("IntersectionObserver" in window && consoleEl) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            runSequence();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(consoleEl);
  } else {
    runSequence();
  }

  window.addEventListener("beforeunload", () => {
    cancelled = true;
  });
})();

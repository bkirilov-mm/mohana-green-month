(() => {
  "use strict";

  const marker = document.querySelector("[data-mohana-green-month]");
  const currentScript = document.currentScript;

  if (!marker || !(currentScript instanceof HTMLScriptElement)) return;

  const scriptUrl = new URL(currentScript.src, window.location.href);
  const frameUrl = new URL("/mohana/green-month/index.html", scriptUrl.origin);

  document.documentElement.classList.add("mohana-green-month-host");

  const style = document.createElement("style");
  style.dataset.mohanaGreenMonthStyles = "";
  style.textContent = `
    html.mohana-green-month-host,
    html.mohana-green-month-host body {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }

    [data-mohana-green-month] {
      display: block !important;
      width: 100% !important;
      min-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .mohana-green-month-frame {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483000 !important;
      display: block !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: #f7f3ea !important;
    }

    .mohana-green-month-fallback {
      position: fixed;
      inset: 0;
      z-index: 2147482999;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #f7f3ea;
      color: #173b2d;
      font: 600 16px/1.5 Arial, sans-serif;
      text-align: center;
    }

    .mohana-green-month-fallback a {
      color: inherit;
    }
  `;
  document.head.append(style);

  const fallback = document.createElement("div");
  fallback.className = "mohana-green-month-fallback";
  fallback.innerHTML =
    '<p>Зареждаме предложенията на Mohana…<br><a href="' +
    frameUrl.href +
    '">Отвори Green Month</a></p>';

  const frame = document.createElement("iframe");
  frame.className = "mohana-green-month-frame";
  frame.title = "Зелен месец в Mohana";
  frame.src = frameUrl.href;
  frame.allow = "payment; clipboard-write";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.setAttribute("scrolling", "yes");

  frame.addEventListener(
    "load",
    () => {
      fallback.remove();
      frame.focus({ preventScroll: true });
    },
    { once: true },
  );

  marker.replaceChildren(fallback, frame);
})();

(function () {
  if (window.__sceneLoader) return;

  const SKIP = /^(?:data:|blob:|about:)/i;
  const jobs = new Map();
  let seq = 0;
  let samples = [];
  let finished = false;
  let hideTimer = 0;

  const root = document.createElement("div");
  root.id = "scene-loader";
  root.innerHTML = `
    <style>
      #scene-loader {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: #020305; color: #e8eef8;
        font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif;
        transition: opacity .35s ease;
      }
      #scene-loader.is-done { opacity: 0; pointer-events: none; }
      #scene-loader .box { width: min(520px, calc(100vw - 48px)); }
      #scene-loader .title { font-size: 13px; letter-spacing: .16em; color: #8ea0b8; margin-bottom: 10px; }
      #scene-loader .file {
        font-size: 14px; line-height: 1.4; color: #f4f7fb;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        min-height: 1.4em; margin-bottom: 16px;
      }
      #scene-loader .bar {
        height: 6px; border-radius: 99px; background: #1b2430; overflow: hidden;
      }
      #scene-loader .fill {
        height: 100%; width: 0%; border-radius: inherit;
        background: linear-gradient(90deg, #3d8bfd, #7cf0c2);
        transition: width .18s linear;
      }
      #scene-loader .meta {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;
        margin-top: 14px; font-size: 12px; color: #9aabc0;
      }
      #scene-loader .meta b { color: #e8eef8; font-weight: 600; }
    </style>
    <div class="box">
      <div class="title">场景加载中</div>
      <div class="file" id="sl-file">准备下载…</div>
      <div class="bar"><div class="fill" id="sl-fill"></div></div>
      <div class="meta">
        <div>进度 <b id="sl-pct">0%</b></div>
        <div>速度 <b id="sl-speed">—</b></div>
        <div>体积 <b id="sl-size">0 B / 未知</b></div>
        <div>剩余 <b id="sl-eta">—</b></div>
      </div>
    </div>
  `;
  const mount = () => {
    if (!document.body) return document.addEventListener("DOMContentLoaded", mount, { once: true });
    document.body.appendChild(root);
  };
  mount();

  const elFile = () => root.querySelector("#sl-file");
  const elFill = () => root.querySelector("#sl-fill");
  const elPct = () => root.querySelector("#sl-pct");
  const elSpeed = () => root.querySelector("#sl-speed");
  const elSize = () => root.querySelector("#sl-size");
  const elEta = () => root.querySelector("#sl-eta");

  function formatBytes(n) {
    if (!Number.isFinite(n) || n < 0) return "未知";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + " MB";
    return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
  }

  function formatSpeed(n) {
    if (!Number.isFinite(n) || n <= 0) return "—";
    return formatBytes(n) + "/s";
  }

  function formatEta(sec) {
    if (!Number.isFinite(sec) || sec < 0 || sec > 24 * 3600) return "—";
    if (sec < 1) return "即将完成";
    if (sec < 60) return Math.ceil(sec) + " 秒";
    const m = Math.floor(sec / 60);
    const s = Math.ceil(sec % 60);
    return m + " 分 " + String(s).padStart(2, "0") + " 秒";
  }

  function fileLabel(url) {
    try {
      const u = new URL(url, location.href);
      const name = decodeURIComponent(u.pathname.split("/").pop() || u.hostname);
      return name || url;
    } catch {
      return String(url);
    }
  }

  function shouldTrack(url) {
    if (!url || SKIP.test(url)) return false;
    if (String(url).includes("loading-overlay.js")) return false;
    return /^https?:/i.test(url) || String(url).startsWith("/");
  }

  function startJob(url, total) {
    const id = ++seq;
    jobs.set(id, {
      url: String(url),
      loaded: 0,
      total: Number(total) > 0 ? Number(total) : 0,
      done: false,
    });
    return id;
  }

  function bumpJob(id, loaded, total) {
    const job = jobs.get(id);
    if (!job || job.done) return;
    if (Number(loaded) > job.loaded) job.loaded = Number(loaded);
    if (Number(total) > job.total) job.total = Number(total);
  }

  function endJob(id, loaded) {
    const job = jobs.get(id);
    if (!job || job.done) return;
    job.done = true;
    if (Number(loaded) > 0) job.loaded = Number(loaded);
    if (job.total < job.loaded) job.total = job.loaded;
  }

  function totals() {
    let loaded = 0;
    let total = 0;
    let pending = 0;
    let current = "";
    for (const job of jobs.values()) {
      loaded += job.loaded;
      total += job.total || job.loaded;
      if (!job.done) {
        pending += 1;
        current = job.url;
      }
    }
    return { loaded, total, pending, current };
  }

  function render() {
    if (finished) return;
    const { loaded, total, pending, current } = totals();
    const now = performance.now();
    samples.push({ t: now, loaded });
    samples = samples.filter((s) => now - s.t <= 1500);
    const first = samples[0];
    const dt = first ? (now - first.t) / 1000 : 0;
    const speed = dt > 0.2 ? Math.max(0, (loaded - first.loaded) / dt) : 0;
    const remain = Math.max(0, total - loaded);
    const eta = speed > 256 ? remain / speed : NaN;
    const pct = total > 0 ? Math.min(100, (loaded / total) * 100) : 0;

    if (elFile()) {
      elFile().textContent = current
        ? "正在加载 " + fileLabel(current)
        : pending
          ? "等待响应…"
          : "即将完成…";
      elFill().style.width = pct.toFixed(1) + "%";
      elPct().textContent = pct.toFixed(1) + "%";
      elSpeed().textContent = formatSpeed(speed);
      elSize().textContent = formatBytes(loaded) + " / " + (total > 0 ? formatBytes(total) : "未知");
      elEta().textContent = pending ? formatEta(eta) : "即将完成";
    }
  }

  function hide() {
    if (finished) return;
    finished = true;
    clearInterval(tick);
    render();
    root.classList.add("is-done");
    setTimeout(() => root.remove(), 400);
  }

  function maybeHide() {
    if (finished) return;
    const { pending } = totals();
    if (pending > 0) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (totals().pending === 0) hide();
    }, 500);
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    if (!shouldTrack(url)) return nativeFetch(input, init);
    const id = startJob(url, 0);
    try {
      const res = await nativeFetch(input, init);
      const len = Number(res.headers.get("content-length")) || 0;
      if (len) bumpJob(id, 0, len);
      if (!res.body || !res.body.getReader) {
        const buf = await res.clone().arrayBuffer();
        endJob(id, buf.byteLength || len);
        maybeHide();
        return res;
      }
      const reader = res.body.getReader();
      let received = 0;
      const stream = new ReadableStream({
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) {
            endJob(id, received || len);
            maybeHide();
            controller.close();
            return;
          }
          received += value.byteLength;
          bumpJob(id, received, len);
          controller.enqueue(value);
        },
        cancel(reason) {
          endJob(id, received);
          maybeHide();
          return reader.cancel(reason);
        },
      });
      return new Response(stream, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    } catch (err) {
      endJob(id, 0);
      maybeHide();
      throw err;
    }
  };

  const NativeXHR = XMLHttpRequest;
  window.XMLHttpRequest = class extends NativeXHR {
    constructor() {
      super();
      this._slId = 0;
      this._slUrl = "";
      this.addEventListener("loadstart", () => {
        const url = this.responseURL || this._slUrl;
        if (shouldTrack(url)) this._slId = startJob(url, 0);
      });
      this.addEventListener("progress", (ev) => {
        if (!this._slId) return;
        bumpJob(this._slId, ev.loaded, ev.lengthComputable ? ev.total : 0);
      });
      this.addEventListener("loadend", () => {
        if (!this._slId) return;
        endJob(this._slId, 0);
        maybeHide();
      });
    }
    open(method, url, ...rest) {
      this._slUrl = url;
      return super.open(method, url, ...rest);
    }
  };

  const imgDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (imgDesc && imgDesc.set) {
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      configurable: true,
      enumerable: imgDesc.enumerable,
      get() {
        return imgDesc.get.call(this);
      },
      set(url) {
        if (shouldTrack(url)) {
          const id = startJob(url, 0);
          this.addEventListener("load", () => {
            const abs = this.src || url;
            const entry = performance.getEntriesByName(abs).at(-1);
            endJob(id, entry && (entry.transferSize || entry.encodedBodySize) || 0);
            maybeHide();
          }, { once: true });
          this.addEventListener("error", () => {
            endJob(id, 0);
            maybeHide();
          }, { once: true });
        }
        return imgDesc.set.call(this, url);
      },
    });
  }

  if (window.PerformanceObserver) {
    const seen = new Set();
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!shouldTrack(entry.name) || seen.has(entry.name)) continue;
        if (!/script|fetch|xmlhttprequest|img|other/.test(entry.initiatorType || "")) continue;
        seen.add(entry.name);
        const size = entry.transferSize || entry.encodedBodySize || 0;
        if (!size) continue;
        const already = [...jobs.values()].some((j) => j.url === entry.name);
        if (already) continue;
        const id = startJob(entry.name, size);
        endJob(id, size);
      }
    });
    try {
      obs.observe({ type: "resource", buffered: true });
    } catch {
      obs.observe({ entryTypes: ["resource"] });
    }
  }

  const tick = setInterval(render, 200);
  render();

  window.__sceneLoader = {
    done() {
      const deadline = Date.now() + 20000;
      const wait = () => {
        if (finished) return;
        if (totals().pending === 0 || Date.now() > deadline) {
          hide();
          return;
        }
        hideTimer = setTimeout(wait, 200);
      };
      clearTimeout(hideTimer);
      hideTimer = setTimeout(wait, 280);
    },
  };
})();

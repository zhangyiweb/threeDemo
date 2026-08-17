(function () {
  if (window.__sceneLoader) return;

  const SKIP = /^(?:data:|blob:|about:)/i;
  const jobs = new Map();
  let seq = 0;
  let samples = [];
  let finished = false;
  let hideTimer = 0;
  let sceneReady = false;
  let orphanLoaded = 0;

  const boot = document.createElement("style");
  boot.textContent =
    "#scene-loader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#02060c;color:#d7fbff;font-family:Bahnschrift,'Segoe UI',sans-serif}";
  document.head.appendChild(boot);

  const scriptSrc = document.currentScript && document.currentScript.src;
  if (!document.querySelector('link[href*="loading-overlay.css"]') && scriptSrc) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("loading-overlay.css", scriptSrc).href;
    document.head.appendChild(link);
  }

  let root = document.getElementById("scene-loader");
  if (!root) {
    root = document.createElement("div");
    root.id = "scene-loader";
    root.innerHTML = `
      <div class="grid"></div>
      <div class="scan"></div>
      <div class="glow"></div>
      <div class="hud">
        <i class="c c1"></i><i class="c c2"></i><i class="c c3"></i><i class="c c4"></i>
        <div class="kicker"><span>SYS // GRAPHICS PIPELINE</span><span class="pulse"></span></div>
        <div class="title">INITIALIZING</div>
        <div class="sub">awaiting asset handshake</div>
        <div class="file" id="sl-file">&gt;&gt; 链路建立中…</div>
        <div class="track"><div class="fill" id="sl-fill"></div><div class="ticks"></div></div>
        <div class="meta">
          <div class="cell"><span>进度 PROG</span><b id="sl-pct">00.0%</b></div>
          <div class="cell"><span>速率 RATE</span><b id="sl-speed">—</b></div>
          <div class="cell"><span>体积 SIZE</span><b id="sl-size">0 B / --</b></div>
          <div class="cell"><span>剩余 ETA</span><b id="sl-eta">—</b></div>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);
  }

  const elFile = root.querySelector("#sl-file");
  const elFill = root.querySelector("#sl-fill");
  const elPct = root.querySelector("#sl-pct");
  const elSpeed = root.querySelector("#sl-speed");
  const elSize = root.querySelector("#sl-size");
  const elEta = root.querySelector("#sl-eta");

  function formatBytes(n) {
    if (!Number.isFinite(n) || n < 0) return "--";
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
    if (sec < 1) return "< 1s";
    if (sec < 60) return Math.ceil(sec) + "s";
    const m = Math.floor(sec / 60);
    const s = Math.ceil(sec % 60);
    return m + "m " + String(s).padStart(2, "0") + "s";
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
    if (String(url).includes("loading-overlay.")) return false;
    return /^https?:/i.test(url) || String(url).startsWith("/");
  }

  function sameUrl(a, b) {
    try {
      return new URL(a, location.href).href === new URL(b, location.href).href;
    } catch {
      return String(a) === String(b);
    }
  }

  function headerSize(headers) {
    if (!headers || !headers.get) return 0;
    for (const key of ["content-length", "x-file-size", "x-content-length", "uncompressed-content-length"]) {
      const n = Number(headers.get(key));
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
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
    // gzip/br 时 Content-Length 是压缩体积，stream 是解压后字节，不能当总量
    if (job.total > 0 && job.loaded > job.total * 1.02) job.total = 0;
  }

  function endJob(id, loaded) {
    const job = jobs.get(id);
    if (!job || job.done) return;
    job.done = true;
    if (Number(loaded) > 0) job.loaded = Number(loaded);
    if (job.total <= 0 || job.total < job.loaded) job.total = job.loaded;
  }

  function jobFraction(job) {
    if (job.done) return 1;
    if (job.total > 0) return Math.min(0.99, job.loaded / job.total);
    if (job.loaded <= 0) return 0.04;
    return Math.min(0.9, 1 - Math.exp(-job.loaded / (512 * 1024)));
  }

  function totals() {
    let loaded = orphanLoaded;
    let knownTotal = orphanLoaded;
    let unknownInFlight = 0;
    let pending = 0;
    let current = "";
    let frac = 0;
    let count = 0;
    for (const job of jobs.values()) {
      count += 1;
      loaded += job.loaded;
      frac += jobFraction(job);
      if (job.total > 0) knownTotal += job.total;
      else if (job.done) knownTotal += job.loaded;
      else unknownInFlight += 1;
      if (!job.done) {
        pending += 1;
        current = job.url;
      }
    }
    if (!sceneReady) {
      count += 1;
      frac += Math.min(0.72, 0.12 + (count > 1 ? 0.35 : 0));
    }
    const pct = count > 0 ? (frac / count) * 100 : 0;
    const showTotal = knownTotal > 0 && unknownInFlight === 0 && (pending > 0 || sceneReady);
    return {
      loaded,
      total: showTotal ? knownTotal : 0,
      pending,
      current,
      pct: sceneReady ? pct : Math.min(99, pct),
    };
  }

  function render(force) {
    if (finished && !force) return;
    const { loaded, total, pending, current, pct: rawPct } = totals();
    const pct = force ? 100 : rawPct;
    const now = performance.now();
    samples.push({ t: now, loaded });
    samples = samples.filter((s) => now - s.t <= 1500);
    const first = samples[0];
    const dt = first ? (now - first.t) / 1000 : 0;
    const speed = dt > 0.2 ? Math.max(0, (loaded - first.loaded) / dt) : 0;
    const remain = total > loaded ? total - loaded : NaN;
    const eta = speed > 256 ? remain / speed : NaN;

    elFile.textContent = current
      ? ">> " + fileLabel(current)
      : pending
        ? ">> 握手中…"
        : ">> 链路就绪";
    elFill.style.width = pct.toFixed(1) + "%";
    elPct.textContent = pct.toFixed(1) + "%";
    elSpeed.textContent = formatSpeed(speed);
    elSize.textContent = formatBytes(loaded) + " / " + (total > 0 ? formatBytes(total) : "--");
    elEta.textContent = pending && !force ? formatEta(eta) : "< 1s";
  }

  function hide() {
    if (finished) return;
    finished = true;
    sceneReady = true;
    clearInterval(tick);
    render(true);
    root.classList.add("is-done");
    setTimeout(() => root.remove(), 480);
  }

  function maybeHide() {
    if (finished || !sceneReady) return;
    if (totals().pending > 0) return;
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
      const len = headerSize(res.headers);
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
            endJob(id, (entry && (entry.transferSize || entry.encodedBodySize)) || 0);
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
        const kind = entry.initiatorType || "other";
        if (!/^(script|fetch|xmlhttprequest|img|other|link)$/.test(kind)) continue;
        seen.add(entry.name);
        const size = entry.decodedBodySize || entry.encodedBodySize || entry.transferSize || 0;
        if (!size) continue;
        const job = [...jobs.values()].find((j) => sameUrl(j.url, entry.name));
        if (job) {
          if (job.done) {
            if (size > job.loaded) job.loaded = size;
            if (size > job.total) job.total = size;
          }
          continue;
        }
        orphanLoaded += size;
      }
    });
    try {
      obs.observe({ type: "resource", buffered: true });
    } catch {
      obs.observe({ entryTypes: ["resource"] });
    }
  }

  const tick = setInterval(render, 160);
  render();

  window.__sceneLoader = {
    done() {
      sceneReady = true;
      const deadline = Date.now() + 20000;
      const wait = () => {
        if (finished) return;
        const { pending } = totals();
        if (pending === 0 || Date.now() > deadline) {
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

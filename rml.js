(() => {
  "use strict";

  const WA_NUMBER = "50768290144";
  const INVENTARIO = () => Array.isArray(window.INVENTARIO_UNIDADES) ? window.INVENTARIO_UNIDADES : [];

  const MODEL_META = {
    "Hyundai Grand i10": { href: "unidades-grand-i10.html", image: "grand-i10.png" },
    "Hyundai Accent Solaris": { href: "unidades-accent-solaris.html", image: "solaris.png" },
    "Kia Soluto": { href: "unidades-soluto.html", image: "soluto_1.png" }
  };

  const STATUS = {
    "disponible": { label: "Disponible", css: "available", active: true },
    "reservado": { label: "Reservado", css: "reserved", active: true },
    "proximamente": { label: "Próximamente", css: "soon", active: true },
    "no-disponible": { label: "No disponible", css: "off", active: false }
  };

  const normalizeStatus = (u) => {
    if (u.estado && STATUS[u.estado]) return u.estado;
    return u.disponible === false ? "no-disponible" : "disponible";
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;"
  })[c]);

  const formatKm = (km) => new Intl.NumberFormat("es-PA").format(Number(km || 0));
  const waLink = (message) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  function messageForUnit(u, status) {
    const specs = `${u.anio}, ${formatKm(u.km)} km, ${u.transmision}, color ${u.color}, uso ${u.uso}`;
    if (status === "reservado") return `Hola, quiero consultar si la unidad ${u.unidad} del ${u.modelo} (${specs}) sigue reservada o si existe una alternativa similar.`;
    if (status === "proximamente") return `Hola, quiero información sobre la llegada de la unidad ${u.unidad} del ${u.modelo} (${specs}) y saber cuándo estará disponible.`;
    return `Hola, quiero consultar la unidad ${u.unidad} del ${u.modelo} (${specs}) en alquiler con opción a compra.`;
  }

  function statusData(u) {
    const key = normalizeStatus(u);
    return { key, ...STATUS[key] };
  }

  function availableByModel(model) {
    return INVENTARIO().filter(u => u.modelo === model && normalizeStatus(u) === "disponible").length;
  }

  function activeByModel(model) {
    return INVENTARIO().filter(u => u.modelo === model && normalizeStatus(u) !== "no-disponible" && normalizeStatus(u) !== "oculto").length;
  }

  function totalAvailable() {
    return INVENTARIO().filter(u => normalizeStatus(u) === "disponible").length;
  }

  function bindWhatsApp(root = document) {
    root.querySelectorAll("[data-wa-msg]").forEach(el => {
      el.href = waLink(el.getAttribute("data-wa-msg") || "Hola, quiero más información sobre Multiservicios RML.");
      el.target = "_blank";
      el.rel = "noopener";
    });
  }

  function bindNavigation() {
    const header = document.querySelector(".site-header");
    const btn = document.querySelector("[data-mobile-menu]");
    const drawer = document.querySelector("[data-mobile-drawer]");

    const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 6);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive:true });

    if (btn && drawer) {
      btn.addEventListener("click", () => {
        const open = drawer.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      });
      drawer.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }));
    }
  }

  function renderCounts() {
    document.querySelectorAll("[data-model-count]").forEach(el => {
      const model = el.getAttribute("data-model-count");
      const count = availableByModel(model);
      el.textContent = String(count);
    });
    document.querySelectorAll("[data-model-count-label]").forEach(el => {
      const model = el.getAttribute("data-model-count-label");
      const count = availableByModel(model);
      el.textContent = count === 1 ? "1 disponible" : `${count} disponibles`;
    });
    document.querySelectorAll("[data-total-available]").forEach(el => el.textContent = String(totalAvailable()));
  }

  function unitMedia(u, fallbackImage) {
    const hasPhoto = Boolean(String(u.foto || "").trim());
    const src = hasPhoto ? u.foto : fallbackImage;
    return `
      <img src="${escapeHtml(src)}" alt="${escapeHtml(u.modelo)} ${escapeHtml(u.unidad)}" class="${hasPhoto ? "" : "is-fallback"}" loading="lazy">
      <div class="unit-media-overlay"></div>
      ${hasPhoto ? "" : '<span class="photo-note">Imagen de modelo · foto real pendiente</span>'}
    `;
  }

  function unitCard(u, fallbackImage) {
    const s = statusData(u);
    const msg = messageForUnit(u, s.key);
    const actionLabel = s.key === "reservado" ? "Consultar alternativa" : s.key === "proximamente" ? "Consultar llegada" : "Consultar esta unidad";
    const disabled = s.key === "no-disponible";
    return `
      <article class="unit-card" data-status="${s.key}">
        <div class="unit-media">
          ${unitMedia(u, fallbackImage)}
          <span class="status-pill ${s.css}">${s.label}</span>
          <span class="unit-code mono">${escapeHtml(u.unidad)}</span>
        </div>
        <div class="unit-body">
          <div class="unit-heading">
            <h2>${escapeHtml(u.modelo)}</h2>
            <span class="unit-year mono">${escapeHtml(u.anio)}</span>
          </div>
          <div class="unit-specs">
            <div class="unit-spec"><span>Kilometraje</span><strong class="mono">${formatKm(u.km)} km</strong></div>
            <div class="unit-spec"><span>Transmisión</span><strong>${escapeHtml(u.transmision)}</strong></div>
            <div class="unit-spec"><span>Color</span><strong>${escapeHtml(u.color)}</strong></div>
            <div class="unit-spec"><span>Uso</span><strong>${escapeHtml(u.uso)}</strong></div>
          </div>
          <div class="unit-action">
            ${disabled
              ? '<a class="btn btn-outline" aria-disabled="true">No disponible</a>'
              : `<a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">${actionLabel}<span class="arrow">↗</span></a>`}
          </div>
        </div>
      </article>`;
  }

  function renderUnitPage() {
    const grid = document.getElementById("units-grid");
    if (!grid) return;
    const model = document.body.dataset.modelo;
    const fallbackImage = document.body.dataset.fallbackImage || MODEL_META[model]?.image || "logo-multiservicios-rml.png";
    const units = INVENTARIO().filter(u => u.modelo === model && normalizeStatus(u) !== "oculto");

    grid.innerHTML = units.length
      ? units.map(u => unitCard(u, fallbackImage)).join("")
      : `<div class="empty-state"><strong>No hay unidades publicadas</strong><p>Cuando agregues una unidad de ${escapeHtml(model)} en <span class="mono">inventario-unidades.js</span>, aparecerá aquí automáticamente.</p></div>`;

    const available = units.filter(u => normalizeStatus(u) === "disponible").length;
    document.querySelectorAll("[data-page-available]").forEach(el => el.textContent = String(available));
    document.querySelectorAll("[data-page-active]").forEach(el => el.textContent = String(units.filter(u => normalizeStatus(u) !== "no-disponible").length));
  }

  function revealOnScroll() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:.12 });
    items.forEach(el => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindWhatsApp();
    bindNavigation();
    renderCounts();
    renderUnitPage();
    revealOnScroll();
  });

  window.RML = { normalizeStatus, availableByModel, activeByModel, totalAvailable };
})();

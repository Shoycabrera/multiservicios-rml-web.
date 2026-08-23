(() => {
  "use strict";

  const WA_NUMBER = "50768290144";
  const INVENTARIO = () => Array.isArray(window.INVENTARIO_UNIDADES) ? window.INVENTARIO_UNIDADES : [];

  const MODEL_META = {
    "Hyundai Grand i10": { href: "unidades-grand-i10.html", image: "assets/img/modelos/grand-i10.png" },
    "Hyundai Accent Solaris": { href: "unidades-accent-solaris.html", image: "assets/img/modelos/accent-solaris.png" },
    "Kia Soluto": { href: "unidades-soluto.html", image: "assets/img/modelos/kia-soluto.png" }
  };

  const STATUS = {
    "disponible": { label: "Disponible", css: "available", active: true },
    "reservado": { label: "Reservado", css: "reserved", active: true },
    "proximamente": { label: "Próximamente", css: "soon", active: true },
    "no-disponible": { label: "No disponible", css: "off", active: false },
    "oculto": { label: "Oculto", css: "off", active: false }
  };

  const normalizeStatus = (u) => {
    if (u.estado && STATUS[u.estado]) return u.estado;
    return u.disponible === false ? "no-disponible" : "disponible";
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;"
  })[c]);

  const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";
  const formatKm = (km) => hasValue(km) && Number.isFinite(Number(km)) ? new Intl.NumberFormat("es-PA").format(Number(km)) : "";
  const waLink = (message) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  function messageForUnit(u, status) {
    const model = hasValue(u.modelo) ? ` ${u.modelo}` : "";
    const specs = [];
    if (hasValue(u.anio)) specs.push(String(u.anio));
    if (formatKm(u.km)) specs.push(`${formatKm(u.km)} km`);
    if (hasValue(u.transmision)) specs.push(String(u.transmision));
    if (hasValue(u.color)) specs.push(`color ${u.color}`);
    if (hasValue(u.uso)) specs.push(`uso ${u.uso}`);
    const detail = specs.length ? ` (${specs.join(", ")})` : "";
    if (status === "reservado") return `Hola, quiero consultar si la unidad ${u.unidad}${model}${detail} sigue reservada o si existe una alternativa similar.`;
    if (status === "proximamente") return `Hola, quiero información sobre la llegada de la unidad ${u.unidad}${model}${detail} y saber cuándo estará disponible.`;
    return `Hola, quiero consultar la unidad ${u.unidad}${model}${detail} en alquiler con opción a compra.`;
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

  function canonicalUnitId(unitId) {
    return String(unitId || "").trim().toUpperCase();
  }

  function unitImageUrl(unitId, fileName = "01.webp") {
    const id = canonicalUnitId(unitId);
    return `assets/img/unidades/${encodeURIComponent(id)}/${encodeURIComponent(fileName)}`;
  }

  function unitPhotosManifestUrl(unitId) {
    return unitImageUrl(unitId, "fotos.json");
  }

  function imageExists(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function probeUnitPhotos(unitId, maxPhotos = 30) {
    const photos = [];
    for (let i = 1; i <= maxPhotos; i++) {
      const fileName = `${String(i).padStart(2, "0")}.webp`;
      const url = unitImageUrl(unitId, fileName);
      if (!(await imageExists(url))) break;
      photos.push(url);
    }
    return photos;
  }

  async function loadUnitPhotos(unitId) {
    try {
      const response = await fetch(unitPhotosManifestUrl(unitId), { cache: "no-cache" });
      if (!response.ok) return probeUnitPhotos(unitId);
      const data = await response.json();
      const photos = Array.isArray(data?.fotos) ? data.fotos : [];
      const valid = photos
        .filter(name => typeof name === "string" && /^\d{2}\.webp$/i.test(name))
        .map(name => unitImageUrl(unitId, name));
      return valid.length ? valid : probeUnitPhotos(unitId);
    } catch {
      return probeUnitPhotos(unitId);
    }
  }

  function bindUnitImageFallbacks() {
    document.addEventListener("error", event => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || !img.matches("[data-unit-photo]")) return;
      if (img.dataset.fallbackApplied === "true") return;

      img.dataset.fallbackApplied = "true";
      img.classList.add("is-fallback");
      img.removeAttribute("data-unit-photo");
      img.src = img.dataset.fallbackSrc || "assets/img/branding/logo-rml.png";

      const media = img.closest(".unit-media");
      const note = media?.querySelector(".photo-note");
      if (note) note.hidden = false;

      const galleryTrigger = media?.querySelector("[data-gallery-unit]");
      if (galleryTrigger) {
        galleryTrigger.hidden = true;
        galleryTrigger.disabled = true;
      }
    }, true);
  }

  function unitMedia(u, fallbackImage) {
    const label = hasValue(u.modelo) ? u.modelo : "Vehículo";
    const realPhoto = unitImageUrl(u.unidad, "01.webp");
    const fallback = fallbackImage || MODEL_META[u.modelo]?.image || "assets/img/branding/logo-rml.png";
    const note = hasValue(u.modelo) ? "Imagen de modelo · foto real pendiente" : "Imagen referencial · foto real pendiente";

    return `
      <img src="${escapeHtml(realPhoto)}"
           data-unit-photo
           data-fallback-src="${escapeHtml(fallback)}"
           alt="${escapeHtml(label)} ${escapeHtml(u.unidad)}"
           loading="lazy" decoding="async">
      <div class="unit-media-overlay"></div>
      <span class="photo-note" hidden>${note}</span>
      <button class="unit-gallery-trigger"
              type="button"
              data-gallery-unit="${escapeHtml(u.unidad)}"
              aria-label="Ver fotos de la unidad ${escapeHtml(u.unidad)}">
        <span>Ver fotos</span>
      </button>
    `;
  }

  function unitCard(u, fallbackImage) {
    const s = statusData(u);
    const msg = messageForUnit(u, s.key);
    const actionLabel = s.key === "reservado" ? "Consultar alternativa" : s.key === "proximamente" ? "Consultar llegada" : "Consultar esta unidad";
    const disabled = s.key === "no-disponible";
    const title = hasValue(u.modelo) ? String(u.modelo) : `Unidad ${u.unidad}`;
    const year = hasValue(u.anio) ? `<span class="unit-year mono">${escapeHtml(u.anio)}</span>` : "";
    const specs = [];
    if (formatKm(u.km)) specs.push(`<div class="unit-spec"><span>Kilometraje</span><strong class="mono">${formatKm(u.km)} km</strong></div>`);
    if (hasValue(u.transmision)) specs.push(`<div class="unit-spec"><span>Transmisión</span><strong>${escapeHtml(u.transmision)}</strong></div>`);
    if (hasValue(u.color)) specs.push(`<div class="unit-spec"><span>Color</span><strong>${escapeHtml(u.color)}</strong></div>`);
    if (hasValue(u.uso)) specs.push(`<div class="unit-spec"><span>Uso</span><strong>${escapeHtml(u.uso)}</strong></div>`);

    return `
      <article class="unit-card" data-status="${s.key}">
        <div class="unit-media">
          ${unitMedia(u, fallbackImage)}
          <span class="status-pill ${s.css}">${s.label}</span>
          <span class="unit-code mono">${escapeHtml(u.unidad)}</span>
        </div>
        <div class="unit-body">
          <div class="unit-heading">
            <h2>${escapeHtml(title)}</h2>
            ${year}
          </div>
          ${specs.length ? `<div class="unit-specs">${specs.join("")}</div>` : '<p class="unit-data-pending">Detalles disponibles por WhatsApp.</p>'}
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
    const fallbackImage = document.body.dataset.fallbackImage || MODEL_META[model]?.image || "assets/img/branding/logo-rml.png";
    const units = INVENTARIO().filter(u => u.modelo === model && normalizeStatus(u) !== "oculto");

    grid.innerHTML = units.length
      ? units.map(u => unitCard(u, fallbackImage)).join("")
      : `<div class="empty-state"><strong>No hay unidades publicadas</strong><p>Actualmente no hay unidades publicadas de ${escapeHtml(model)}. Puedes consultar por WhatsApp para conocer próximas opciones.</p></div>`;

    const available = units.filter(u => normalizeStatus(u) === "disponible").length;
    document.querySelectorAll("[data-page-available]").forEach(el => el.textContent = String(available));
    document.querySelectorAll("[data-page-active]").forEach(el => el.textContent = String(units.filter(u => normalizeStatus(u) !== "no-disponible").length));
  }

  const galleryState = {
    unitId: "",
    photos: [],
    index: 0,
    trigger: null,
    pointerStartX: null
  };

  function ensureGallery() {
    let gallery = document.querySelector("[data-photo-gallery]");
    if (gallery) return gallery;

    gallery = document.createElement("div");
    gallery.className = "photo-gallery";
    gallery.hidden = true;
    gallery.setAttribute("data-photo-gallery", "");
    gallery.innerHTML = `
      <div class="photo-gallery-backdrop" data-gallery-close></div>
      <section class="photo-gallery-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-title" tabindex="-1">
        <div class="photo-gallery-head">
          <div>
            <span class="photo-gallery-kicker mono" id="gallery-unit"></span>
            <h2 id="gallery-title">Galería de la unidad</h2>
          </div>
          <button class="photo-gallery-close" type="button" data-gallery-close aria-label="Cerrar galería">×</button>
        </div>

        <div class="photo-gallery-stage" data-gallery-stage>
          <button class="photo-gallery-nav photo-gallery-prev" type="button" data-gallery-prev aria-label="Foto anterior">‹</button>
          <img data-gallery-image alt="" draggable="false">
          <button class="photo-gallery-nav photo-gallery-next" type="button" data-gallery-next aria-label="Foto siguiente">›</button>
          <div class="photo-gallery-loading" data-gallery-loading aria-live="polite">Cargando foto…</div>
        </div>

        <div class="photo-gallery-foot">
          <div class="photo-gallery-counter mono" data-gallery-counter></div>
          <div class="photo-gallery-dots" data-gallery-dots aria-label="Seleccionar fotografía"></div>
          <span class="photo-gallery-hint">Desliza o usa ← →</span>
        </div>
      </section>`;

    document.body.appendChild(gallery);
    return gallery;
  }

  function currentGalleryUnit() {
    return INVENTARIO().find(u => canonicalUnitId(u.unidad) === galleryState.unitId) || null;
  }

  function renderGalleryDots(gallery) {
    const dots = gallery.querySelector("[data-gallery-dots]");
    if (!dots) return;
    dots.innerHTML = "";

    if (galleryState.photos.length <= 1) {
      dots.hidden = true;
      return;
    }

    dots.hidden = false;
    galleryState.photos.forEach((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-gallery-dot";
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", `Ver foto ${index + 1}`);
      if (index === galleryState.index) button.setAttribute("aria-current", "true");
      dots.appendChild(button);
    });
  }

  function renderGalleryPhoto() {
    const gallery = ensureGallery();
    const img = gallery.querySelector("[data-gallery-image]");
    const loading = gallery.querySelector("[data-gallery-loading]");
    const counter = gallery.querySelector("[data-gallery-counter]");
    const prev = gallery.querySelector("[data-gallery-prev]");
    const next = gallery.querySelector("[data-gallery-next]");
    const unit = currentGalleryUnit();
    const photo = galleryState.photos[galleryState.index];

    if (!img || !photo) return;

    loading.hidden = false;
    loading.textContent = "Cargando foto…";
    img.classList.add("is-loading");
    img.alt = `${hasValue(unit?.modelo) ? unit.modelo : "Vehículo"} ${galleryState.unitId} · foto ${galleryState.index + 1}`;
    img.onload = () => {
      loading.hidden = true;
      img.classList.remove("is-loading");
    };
    img.onerror = () => {
      loading.hidden = false;
      loading.textContent = "No se pudo cargar esta fotografía.";
      img.classList.add("is-loading");
    };
    img.src = photo;

    if (counter) counter.textContent = `${galleryState.index + 1} / ${galleryState.photos.length}`;
    const multiple = galleryState.photos.length > 1;
    if (prev) prev.hidden = !multiple;
    if (next) next.hidden = !multiple;
    renderGalleryDots(gallery);
  }

  function galleryGo(delta) {
    if (galleryState.photos.length <= 1) return;
    const total = galleryState.photos.length;
    galleryState.index = (galleryState.index + delta + total) % total;
    renderGalleryPhoto();
  }

  function galleryGoTo(index) {
    if (!Number.isInteger(index) || index < 0 || index >= galleryState.photos.length) return;
    galleryState.index = index;
    renderGalleryPhoto();
  }

  async function openUnitGallery(unitId, trigger = null) {
    const id = canonicalUnitId(unitId);
    if (!id) return;

    const triggerLabel = trigger?.querySelector("span");
    const originalLabel = triggerLabel?.textContent || "Ver fotos";
    if (trigger) {
      trigger.disabled = true;
      trigger.classList.add("is-loading");
      if (triggerLabel) triggerLabel.textContent = "Cargando…";
    }

    const photos = await loadUnitPhotos(id);

    if (trigger) {
      trigger.disabled = false;
      trigger.classList.remove("is-loading");
      if (triggerLabel) triggerLabel.textContent = originalLabel;
    }

    if (!photos.length) {
      if (trigger) trigger.hidden = true;
      return;
    }

    galleryState.unitId = id;
    galleryState.photos = photos;
    galleryState.index = 0;
    galleryState.trigger = trigger;

    const gallery = ensureGallery();
    const unit = currentGalleryUnit();
    const unitLabel = gallery.querySelector("#gallery-unit");
    const title = gallery.querySelector("#gallery-title");
    if (unitLabel) unitLabel.textContent = id;
    if (title) title.textContent = hasValue(unit?.modelo) ? String(unit.modelo) : `Unidad ${id}`;

    gallery.hidden = false;
    document.body.classList.add("gallery-open");
    requestAnimationFrame(() => gallery.classList.add("is-open"));
    renderGalleryPhoto();
    gallery.querySelector(".photo-gallery-close")?.focus();
  }

  function closeGallery() {
    const gallery = document.querySelector("[data-photo-gallery]");
    if (!gallery || gallery.hidden) return;

    gallery.classList.remove("is-open");
    document.body.classList.remove("gallery-open");
    const trigger = galleryState.trigger;
    galleryState.photos = [];
    galleryState.index = 0;
    galleryState.unitId = "";
    galleryState.pointerStartX = null;

    window.setTimeout(() => {
      gallery.hidden = true;
      trigger?.focus?.();
      galleryState.trigger = null;
    }, 180);
  }

  function bindPhotoGallery() {
    ensureGallery();

    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-gallery-unit]");
      if (trigger && !trigger.disabled) {
        event.preventDefault();
        openUnitGallery(trigger.dataset.galleryUnit, trigger);
        return;
      }

      if (event.target.closest("[data-gallery-close]")) {
        closeGallery();
        return;
      }
      if (event.target.closest("[data-gallery-prev]")) {
        galleryGo(-1);
        return;
      }
      if (event.target.closest("[data-gallery-next]")) {
        galleryGo(1);
        return;
      }

      const dot = event.target.closest("[data-gallery-index]");
      if (dot) galleryGoTo(Number(dot.dataset.galleryIndex));
    });

    document.addEventListener("keydown", event => {
      const gallery = document.querySelector("[data-photo-gallery]");
      if (!gallery || gallery.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeGallery();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        galleryGo(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        galleryGo(1);
      } else if (event.key === "Tab") {
        const focusable = Array.from(gallery.querySelectorAll("button:not([hidden]):not(:disabled)"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    const stage = document.querySelector("[data-gallery-stage]");
    stage?.addEventListener("pointerdown", event => {
      if (event.target.closest("button")) return;
      galleryState.pointerStartX = event.clientX;
    });
    stage?.addEventListener("pointerup", event => {
      if (galleryState.pointerStartX === null || event.target.closest("button")) return;
      const delta = event.clientX - galleryState.pointerStartX;
      galleryState.pointerStartX = null;
      if (Math.abs(delta) < 45) return;
      galleryGo(delta > 0 ? -1 : 1);
    });
    stage?.addEventListener("pointercancel", () => {
      galleryState.pointerStartX = null;
    });
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
    bindUnitImageFallbacks();
    bindNavigation();
    renderCounts();
    renderUnitPage();
    bindPhotoGallery();
    revealOnScroll();
  });

  window.RML = { normalizeStatus, availableByModel, activeByModel, totalAvailable, unitImageUrl, unitPhotosManifestUrl, loadUnitPhotos, openUnitGallery };
})();

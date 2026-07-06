const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#main-menu");
const managedSections = document.querySelector("#managedSections");
const identityStrip = document.querySelector("#identityStrip");
const footerLogos = document.querySelector("#footerLogos");
const popupLayer = document.querySelector("#popupLayer");

const fallbackContent = {
  updatedAt: "2026-07-06",
  site: {
    topbarLeft: "Universidad de la Defensa Nacional",
    topbarRight: "Estado Mayor Conjunto de las Fuerzas Armadas",
    brandTitle: "Instituto de Ciberdefensa",
    brandSubtitle: "Formacion, investigacion y extension",
    heroEyebrow: "Sitio institucional",
    heroTitle: "Instituto de Ciberdefensa de las Fuerzas Armadas",
    heroText: "Espacio academico orientado a la capacitacion, investigacion y difusion del pensamiento institucional en ciberdefensa.",
    heroImage: "assets/official/fmc-carrousel-icffaa.jpg",
    primaryActionLabel: "Ver oferta academica",
    primaryActionTarget: "#academica",
    secondaryActionLabel: "Ultimas novedades",
    secondaryActionTarget: "#novedades",
    footerText: "Publicacion web institucional y app movil WebView."
  },
  identityLogos: [
    { alt: "Facultad Militar Conjunta", image: "assets/official/fmc-footer.png" },
    { alt: "Universidad de la Defensa Nacional", image: "assets/official/undef-footer.png" },
    { alt: "Ministerio de Defensa", image: "assets/official/mindef-footer.png" }
  ],
  adminAccess: {
    enabled: true,
    tapsRequired: 5,
    adminUrl: "admin.html",
    passwordHash: "cc8d6bec88c2873cc1311696edd92b3e37f2dc422af62dc914abd3e2a53138a5",
    title: "Acceso de administracion",
    message: "Ingrese la contrasena de administracion. Luego necesitara el token de GitHub para publicar cambios.",
    buttonText: "Ingresar"
  },
  sections: [
    {
      id: "institucional",
      navLabel: "Institucional",
      type: "cards",
      visible: true,
      eyebrow: "Institucional",
      title: "Mision academica y compromiso conjunto",
      cards: [
        { title: "Proposito", text: "Impulsar la formacion del personal militar y civil vinculado al ambito de la defensa." },
        { title: "Vision", text: "Consolidarse como referencia academica en ciberdefensa dentro del sistema universitario de la defensa." },
        { title: "Lineas de accion", text: "Formacion universitaria, actividades de extension, investigacion y vinculacion institucional." }
      ],
      logoBlock: {
        enabled: true,
        image: "assets/official/undef-footer.png",
        title: "Ambito academico de la UNDEF",
        text: "El Instituto articula su actividad con la Universidad de la Defensa Nacional, la Facultad Militar Conjunta y el Ministerio de Defensa."
      }
    },
    {
      id: "academica",
      navLabel: "Oferta academica",
      type: "programs",
      visible: true,
      band: true,
      eyebrow: "Oferta academica",
      title: "Trayectos formativos",
      items: [
        { label: "Diplomatura universitaria", title: "Gestion de la Ciberdefensa", text: "Formacion orientada a conduccion, planeamiento y gestion de capacidades." },
        { label: "Diplomatura universitaria", title: "Operaciones de Ciberdefensa", text: "Trayecto destinado a procesos, coordinacion y soporte academico de operaciones conjuntas." },
        { label: "Tecnicatura universitaria", title: "Operaciones de Ciberdefensa", text: "Propuesta de formacion tecnica con base universitaria y orientacion profesional." }
      ]
    },
    {
      id: "galeria",
      navLabel: "Galeria",
      type: "gallery",
      visible: true,
      eyebrow: "Galeria institucional",
      title: "Imagenes del Instituto",
      durationSeconds: 6,
      items: [
        { title: "Instituto de Ciberdefensa", caption: "Imagen institucional publicada por la Facultad Militar Conjunta.", image: "assets/official/fmc-carrousel-icffaa.jpg", source: "FMC - UNDEF" },
        { title: "Actividad institucional", caption: "Registro oficial del espacio academico del ICFFAA.", image: "assets/official/icffaa-inauguracion.jpg", source: "Moodle ICFFAA" }
      ]
    },
    {
      id: "novedades",
      navLabel: "Novedades",
      type: "newsEvents",
      visible: true,
      eyebrow: "Novedades",
      title: "Noticias y actividades recientes",
      agendaEyebrow: "Agenda",
      agendaTitle: "Fechas proximas"
    },
    {
      id: "contacto",
      navLabel: "Contacto",
      type: "contact",
      visible: true,
      eyebrow: "Contacto",
      title: "Canales institucionales",
      text: "Datos editables para la version final del sitio.",
      items: [
        { label: "Direccion", title: "Av. Cabildo 381, Ciudad Autonoma de Buenos Aires" },
        { label: "Correo electronico", title: "contacto@instituto-ciberdefensa.mil.ar" },
        { label: "Telefono", title: "(011) 4346-8600" }
      ]
    }
  ],
  news: [
    {
      visible: true,
      date: "2026-07-01",
      category: "Convenio",
      title: "Convenio de colaboracion academica",
      summary: "Nueva accion de vinculacion para fortalecer actividades academicas.",
      url: "https://undef.edu.ar/fmc/home.php"
    }
  ],
  events: [
    {
      visible: true,
      date: "2026-08-01",
      title: "Preinscripcion a propuestas formativas",
      place: "Modalidad segun programa",
      summary: "Apertura estimada de consultas para trayectos academicos.",
      url: "https://undef.edu.ar/fmc/oferta-academica.php#ICFA"
    }
  ],
  popups: []
};

const galleryState = new Map();

document.body.classList.add("js-ready");

toggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const escapeAttr = escapeHtml;

const compact = (items = []) => items.filter((item) => item && item.visible !== false);

const getDateParts = (value) => {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "---" };
  const month = new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", "");
  return {
    day: new Intl.DateTimeFormat("es-AR", { day: "2-digit" }).format(date),
    month
  };
};

const sectionHeading = (section) => `
  <div class="section-heading">
    ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
    ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
    ${section.text ? `<p class="section-intro">${escapeHtml(section.text)}</p>` : ""}
  </div>
`;

const externalLink = (url) => {
  if (!url) return "";
  return url.startsWith("#") ? "" : ' target="_blank" rel="noopener"';
};

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element && value !== undefined) element.textContent = value;
}

function applySite(site) {
  setText("topbarLeft", site.topbarLeft);
  setText("topbarRight", site.topbarRight);
  setText("brandTitle", site.brandTitle);
  setText("brandSubtitle", site.brandSubtitle);
  setText("heroEyebrow", site.heroEyebrow);
  setText("heroTitle", site.heroTitle);
  setText("heroText", site.heroText);
  setText("footerTitle", site.heroTitle);
  setText("footerText", site.footerText);

  const heroMedia = document.querySelector("#heroMedia");
  if (heroMedia && site.heroImage) {
    heroMedia.style.backgroundImage = `
      linear-gradient(90deg, rgba(7, 31, 53, 0.94) 0%, rgba(7, 31, 53, 0.74) 48%, rgba(7, 31, 53, 0.18) 100%),
      linear-gradient(180deg, rgba(7, 31, 53, 0.08), rgba(7, 31, 53, 0.34)),
      url("${escapeAttr(site.heroImage)}")
    `;
  }

  const primary = document.querySelector("#primaryAction");
  const secondary = document.querySelector("#secondaryAction");
  if (primary) {
    primary.textContent = site.primaryActionLabel || "Ver mas";
    primary.href = site.primaryActionTarget || "#";
  }
  if (secondary) {
    secondary.textContent = site.secondaryActionLabel || "Novedades";
    secondary.href = site.secondaryActionTarget || "#";
  }
}

function renderLogos(logos = []) {
  const markup = logos
    .map((logo) => `<img src="${escapeAttr(logo.image)}" alt="${escapeAttr(logo.alt)}">`)
    .join("");
  identityStrip.innerHTML = markup;
  footerLogos.innerHTML = markup;
}

function renderMenu(sections = []) {
  menu.innerHTML = compact(sections)
    .map((section) => `<a href="#${escapeAttr(section.id)}">${escapeHtml(section.navLabel || section.title || section.id)}</a>`)
    .join("");

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function renderCards(section) {
  const cards = (section.cards || section.items || [])
    .map(
      (card) => `
        <article>
          ${card.image ? `<img class="card-thumb" src="${escapeAttr(card.image)}" alt="${escapeAttr(card.title)}">` : ""}
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.text)}</p>
        </article>
      `
    )
    .join("");

  const logoBlock = section.logoBlock && section.logoBlock.enabled
    ? `
      <div class="institution-lockup" aria-label="Vinculacion institucional">
        <img src="${escapeAttr(section.logoBlock.image)}" alt="${escapeAttr(section.logoBlock.title)}">
        <div>
          <h3>${escapeHtml(section.logoBlock.title)}</h3>
          <p>${escapeHtml(section.logoBlock.text)}</p>
        </div>
      </div>
    `
    : "";

  return `
    <section class="section intro ${section.band ? "band" : ""}" id="${escapeAttr(section.id)}">
      ${sectionHeading(section)}
      <div class="intro-grid">${cards}</div>
      ${logoBlock}
    </section>
  `;
}

function renderPrograms(section) {
  const cards = (section.items || [])
    .map(
      (item) => `
        <article class="program-card">
          ${item.label ? `<span>${escapeHtml(item.label)}</span>` : ""}
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section ${section.band ? "band" : ""}" id="${escapeAttr(section.id)}">
      ${sectionHeading(section)}
      <div class="program-list">${cards}</div>
    </section>
  `;
}

function renderMedia(section) {
  const button = section.buttonLabel && section.buttonUrl
    ? `<a class="button primary" href="${escapeAttr(section.buttonUrl)}"${externalLink(section.buttonUrl)}>${escapeHtml(section.buttonLabel)}</a>`
    : "";
  const media = `<img src="${escapeAttr(section.image)}" alt="${escapeAttr(section.title)}">`;
  const copy = `
    <div>
      ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
      ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
      ${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}
      ${button}
    </div>
  `;

  return `
    <section class="media-band ${section.layout === "image-right" ? "image-right" : ""}" id="${escapeAttr(section.id)}">
      ${section.layout === "image-right" ? `${copy}${media}` : `${media}${copy}`}
    </section>
  `;
}

function renderGallery(section) {
  const items = section.items || [];
  const slides = items
    .map(
      (item, index) => `
        <article class="carousel-slide ${index === 0 ? "active" : ""}">
          <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)}">
          <div class="carousel-copy">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.caption)}</p>
            ${item.source ? `<span class="carousel-source">${escapeHtml(item.source)}</span>` : ""}
          </div>
        </article>
      `
    )
    .join("");
  const dots = items
    .map(
      (_, index) =>
        `<button class="carousel-dot ${index === 0 ? "active" : ""}" type="button" data-dot="${index}" aria-label="Ver imagen ${index + 1}"></button>`
    )
    .join("");

  return `
    <section class="section gallery" id="${escapeAttr(section.id)}" data-gallery-duration="${Number(section.durationSeconds || 6)}">
      <div class="section-heading row-heading">
        <div>
          ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
          ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
          ${section.text ? `<p class="section-intro">${escapeHtml(section.text)}</p>` : ""}
        </div>
        <div class="carousel-controls" aria-label="Controles de galeria">
          <button class="icon-button" type="button" data-gallery-prev aria-label="Imagen anterior">&lsaquo;</button>
          <button class="icon-button" type="button" data-gallery-next aria-label="Imagen siguiente">&rsaquo;</button>
        </div>
      </div>
      <div class="carousel" data-gallery>
        ${slides}
        <div class="carousel-dots">${dots}</div>
      </div>
    </section>
  `;
}

function renderNewsEvents(section, content) {
  const newsCards = compact(content.news)
    .map((item) => {
      const date = getDateParts(item.date);
      const link = item.url ? `<a href="${escapeAttr(item.url)}"${externalLink(item.url)}>Ver mas</a>` : "";
      return `
        <article class="news-card">
          <div class="date"><strong>${date.day}</strong><span>${escapeHtml(date.month)}</span></div>
          <div>
            <p class="tag">${escapeHtml(item.category)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            ${link}
          </div>
        </article>
      `;
    })
    .join("");

  const eventCards = compact(content.events)
    .map((item) => {
      const date = getDateParts(item.date);
      const link = item.url ? `<a href="${escapeAttr(item.url)}"${externalLink(item.url)}>Mas informacion</a>` : "";
      return `
        <article class="event-card">
          <div class="event-date"><strong>${date.day}</strong><span>${escapeHtml(date.month)}</span></div>
          <div>
            <p class="tag">${escapeHtml(item.place)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            ${link}
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <section class="section" id="${escapeAttr(section.id)}">
      <div class="section-heading row-heading">
        <div>
          ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
          ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
        </div>
        <a class="text-link" href="#contacto">Enviar consulta</a>
      </div>
      <div class="news-grid">${newsCards}</div>
      <div class="agenda-panel">
        <div>
          ${section.agendaEyebrow ? `<p class="eyebrow">${escapeHtml(section.agendaEyebrow)}</p>` : ""}
          ${section.agendaTitle ? `<h2>${escapeHtml(section.agendaTitle)}</h2>` : ""}
        </div>
        <div class="events-list">${eventCards}</div>
      </div>
    </section>
  `;
}

function renderSplit(section) {
  const features = (section.items || [])
    .map(
      (item) => `
        <article>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");
  const copy = `
    <div>
      ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
      ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
      ${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}
    </div>
  `;
  const list = `<div class="feature-list">${features}</div>`;

  return `
    <section class="section split ${section.layout === "text-right" ? "text-right" : ""}" id="${escapeAttr(section.id)}">
      ${section.layout === "text-right" ? `${list}${copy}` : `${copy}${list}`}
    </section>
  `;
}

function renderLinks(section) {
  const links = (section.items || [])
    .map(
      (item) => `
        <article class="link-card">
          ${item.image ? `<img class="card-thumb" src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)}">` : ""}
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
          ${item.url ? `<a href="${escapeAttr(item.url)}"${externalLink(item.url)}>${escapeHtml(item.label || "Abrir")}</a>` : ""}
        </article>
      `
    )
    .join("");

  return `
    <section class="section ${section.band ? "band" : ""}" id="${escapeAttr(section.id)}">
      ${sectionHeading(section)}
      <div class="link-grid">${links}</div>
    </section>
  `;
}

function renderContact(section) {
  const items = (section.items || [])
    .map(
      (item) => `
        <article>
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.title)}</strong>
        </article>
      `
    )
    .join("");

  return `
    <section class="section contact" id="${escapeAttr(section.id)}">
      <div>
        ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
        ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
        ${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}
      </div>
      <div class="contact-grid">${items}</div>
    </section>
  `;
}

function renderNotice(section) {
  return `
    <section class="section notice-section ${section.band ? "band" : ""}" id="${escapeAttr(section.id)}">
      <div class="notice-box">
        ${section.image ? `<img src="${escapeAttr(section.image)}" alt="${escapeAttr(section.title)}">` : ""}
        <div>
          ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ""}
          ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
          ${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}
          ${section.buttonLabel && section.buttonUrl ? `<a class="button primary" href="${escapeAttr(section.buttonUrl)}"${externalLink(section.buttonUrl)}>${escapeHtml(section.buttonLabel)}</a>` : ""}
        </div>
      </div>
    </section>
  `;
}

function renderSection(section, content) {
  const type = section.type || "cards";
  if (type === "cards") return renderCards(section);
  if (type === "programs") return renderPrograms(section);
  if (type === "media") return renderMedia(section);
  if (type === "gallery") return renderGallery(section);
  if (type === "newsEvents") return renderNewsEvents(section, content);
  if (type === "split") return renderSplit(section);
  if (type === "links") return renderLinks(section);
  if (type === "contact") return renderContact(section);
  if (type === "notice") return renderNotice(section);
  return "";
}

function renderSections(content) {
  managedSections.innerHTML = compact(content.sections)
    .map((section) => renderSection(section, content))
    .join("");
}

function showGallery(sectionElement, index) {
  const carousel = sectionElement.querySelector("[data-gallery]");
  const slides = carousel.querySelectorAll(".carousel-slide");
  const dots = carousel.querySelectorAll(".carousel-dot");
  if (!slides.length) return;
  const current = (index + slides.length) % slides.length;
  galleryState.set(sectionElement.id, { ...(galleryState.get(sectionElement.id) || {}), index: current });
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === current));
  dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === current));
}

function startGallery(sectionElement) {
  const state = galleryState.get(sectionElement.id) || { index: 0, timer: null };
  window.clearInterval(state.timer);
  const duration = Math.max(Number(sectionElement.dataset.galleryDuration || 6), 2) * 1000;
  const timer = window.setInterval(() => {
    const nextState = galleryState.get(sectionElement.id) || { index: 0 };
    showGallery(sectionElement, nextState.index + 1);
  }, duration);
  galleryState.set(sectionElement.id, { ...state, timer });
}

function hydrateGalleries() {
  document.querySelectorAll(".gallery").forEach((sectionElement) => {
    galleryState.set(sectionElement.id, { index: 0, timer: null });
    sectionElement.querySelector("[data-gallery-prev]")?.addEventListener("click", () => {
      const state = galleryState.get(sectionElement.id) || { index: 0 };
      showGallery(sectionElement, state.index - 1);
      startGallery(sectionElement);
    });
    sectionElement.querySelector("[data-gallery-next]")?.addEventListener("click", () => {
      const state = galleryState.get(sectionElement.id) || { index: 0 };
      showGallery(sectionElement, state.index + 1);
      startGallery(sectionElement);
    });
    sectionElement.querySelectorAll(".carousel-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        showGallery(sectionElement, Number(dot.dataset.dot));
        startGallery(sectionElement);
      });
    });
    if (sectionElement.querySelectorAll(".carousel-slide").length > 1) startGallery(sectionElement);
  });
}

function shouldShowPopup(popup) {
  if (!popup.enabled) return false;
  const key = `icffaa-popup-${popup.id}`;
  if (popup.mode === "always") return true;
  if (popup.mode === "once") return !localStorage.getItem(key);
  return !sessionStorage.getItem(key);
}

function closePopup(popup) {
  popupLayer.hidden = true;
  popupLayer.innerHTML = "";
  const key = `icffaa-popup-${popup.id}`;
  if (popup.mode === "once") localStorage.setItem(key, "closed");
  if (popup.mode !== "always") sessionStorage.setItem(key, "closed");
}

async function sha256(value) {
  if (!window.crypto?.subtle) return "";
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hashBuffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function showAdminPrompt(config) {
  popupLayer.hidden = false;
  popupLayer.innerHTML = `
    <form class="popup-card admin-unlock" id="adminUnlockForm" role="dialog" aria-modal="true" aria-labelledby="adminUnlockTitle">
      <img src="assets/official/icffaa-icon.png" alt="">
      <div>
        <h2 id="adminUnlockTitle">${escapeHtml(config.title || "Administracion")}</h2>
        <p>${escapeHtml(config.message || "Ingrese la contrasena de administracion.")}</p>
        <label class="password-field">
          Contrasena
          <input id="adminUnlockPassword" type="password" autocomplete="current-password" required>
        </label>
        <p class="unlock-error" id="adminUnlockError" hidden>Contrasena incorrecta.</p>
        <div class="unlock-actions">
          <button class="button primary" type="submit">${escapeHtml(config.buttonText || "Ingresar")}</button>
          <button class="button secondary dark-text" type="button" data-admin-cancel>Cancelar</button>
        </div>
      </div>
    </form>
  `;

  const form = popupLayer.querySelector("#adminUnlockForm");
  const input = popupLayer.querySelector("#adminUnlockPassword");
  const error = popupLayer.querySelector("#adminUnlockError");
  popupLayer.querySelector("[data-admin-cancel]").addEventListener("click", () => {
    popupLayer.hidden = true;
    popupLayer.innerHTML = "";
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const hash = await sha256(input.value);
    if (hash && hash === config.passwordHash) {
      sessionStorage.setItem("icffaa-admin-unlocked", "true");
      window.location.href = config.adminUrl || "admin.html";
      return;
    }
    error.hidden = false;
    input.select();
  });
  input.focus();
}

function activateAdminAccess(config = {}) {
  if (!config.enabled) return;
  const brand = document.querySelector(".brand");
  const required = Math.max(Number(config.tapsRequired || 5), 2);
  let taps = 0;
  let timer = null;
  brand.addEventListener("click", (event) => {
    event.preventDefault();
    taps += 1;
    window.clearTimeout(timer);
    if (taps >= required) {
      taps = 0;
      showAdminPrompt(config);
      return;
    }
    document.querySelector("#inicio")?.scrollIntoView({ behavior: "smooth" });
    timer = window.setTimeout(() => {
      taps = 0;
    }, 1800);
  });
}

function renderPopup(content) {
  const popup = (content.popups || []).find(shouldShowPopup);
  if (!popup) return;
  popupLayer.hidden = false;
  popupLayer.innerHTML = `
    <div class="popup-card" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
      ${popup.image ? `<img src="${escapeAttr(popup.image)}" alt="">` : ""}
      <div>
        <h2 id="popupTitle">${escapeHtml(popup.title)}</h2>
        <p>${escapeHtml(popup.text)}</p>
        <button class="button primary" type="button" data-popup-close>${escapeHtml(popup.buttonText || "OK")}</button>
      </div>
    </div>
  `;
  popupLayer.querySelector("[data-popup-close]").addEventListener("click", () => closePopup(popup));
  const seconds = Number(popup.autoCloseSeconds || 0);
  if (seconds > 0) window.setTimeout(() => closePopup(popup), seconds * 1000);
}

function activateObservers() {
  const revealBlocks = document.querySelectorAll(".section, .identity-strip, .media-band, .footer");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  revealBlocks.forEach((block) => revealObserver.observe(block));

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".main-menu a")];
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  sections.forEach((section) => navObserver.observe(section));
}

function normalizeContent(data) {
  return {
    ...fallbackContent,
    ...data,
    site: { ...fallbackContent.site, ...(data.site || {}) },
    identityLogos: Array.isArray(data.identityLogos) ? data.identityLogos : fallbackContent.identityLogos,
    adminAccess: { ...fallbackContent.adminAccess, ...(data.adminAccess || {}) },
    sections: Array.isArray(data.sections) ? data.sections : fallbackContent.sections,
    news: Array.isArray(data.news) ? data.news : [],
    events: Array.isArray(data.events) ? data.events : [],
    popups: Array.isArray(data.popups) ? data.popups : []
  };
}

async function loadContent() {
  try {
    const response = await fetch("data/content.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer data/content.json");
    return normalizeContent(await response.json());
  } catch {
    return fallbackContent;
  }
}

function setHeaderState() {
  header.classList.toggle("scrolled", window.scrollY > 12);
}

loadContent().then((content) => {
  applySite(content.site);
  renderLogos(content.identityLogos);
  renderMenu(content.sections);
  renderSections(content);
  hydrateGalleries();
  activateObservers();
  activateAdminAccess(content.adminAccess);
  renderPopup(content);
});

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

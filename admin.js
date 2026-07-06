const defaultContent = {
  updatedAt: "2026-07-06",
  site: {},
  adminAccess: {
    enabled: true,
    tapsRequired: 5,
    adminUrl: "admin.html",
    passwordHash: "",
    title: "Acceso de administracion",
    message: "Ingrese la contrasena de administracion.",
    buttonText: "Ingresar"
  },
  identityLogos: [],
  sections: [],
  news: [],
  events: [],
  popups: []
};

let content = JSON.parse(JSON.stringify(defaultContent));
let githubSha = null;
let selectedImage = null;

const statusEl = document.querySelector("#status");
const jsonEditor = document.querySelector("#jsonEditor");
const siteEditor = document.querySelector("#siteEditor");
const accessEditor = document.querySelector("#accessEditor");
const sectionsEditor = document.querySelector("#sectionsEditor");
const newsEditor = document.querySelector("#newsEditor");
const eventsEditor = document.querySelector("#eventsEditor");
const popupsEditor = document.querySelector("#popupsEditor");

const siteFields = [
  ["topbarLeft", "Barra superior izquierda"],
  ["topbarRight", "Barra superior derecha"],
  ["brandTitle", "Marca / titulo corto"],
  ["brandSubtitle", "Subtitulo de marca"],
  ["heroEyebrow", "Bajada superior del inicio"],
  ["heroTitle", "Titulo principal"],
  ["heroText", "Texto principal", "textarea"],
  ["heroImage", "Imagen principal"],
  ["primaryActionLabel", "Boton principal"],
  ["primaryActionTarget", "Destino boton principal"],
  ["secondaryActionLabel", "Boton secundario"],
  ["secondaryActionTarget", "Destino boton secundario"],
  ["footerText", "Texto de pie"]
];

const accessFields = [
  ["enabled", "Activar acceso oculto", "checkbox"],
  ["tapsRequired", "Cantidad de toques", "number"],
  ["adminUrl", "URL del panel"],
  ["passwordHash", "Hash SHA-256 de contrasena", "textarea"],
  ["title", "Titulo del cuadro"],
  ["message", "Mensaje del cuadro", "textarea"],
  ["buttonText", "Texto del boton"]
];

const sectionTypes = {
  cards: "Tarjetas",
  programs: "Oferta academica",
  media: "Texto e imagen",
  gallery: "Carrusel",
  newsEvents: "Noticias y agenda",
  split: "Texto + lista",
  links: "Enlaces/documentos",
  notice: "Comunicado destacado",
  contact: "Contacto"
};

const layouts = {
  "": "Automatico",
  "image-left": "Imagen izquierda",
  "image-right": "Imagen derecha",
  "text-left": "Texto izquierda",
  "text-right": "Texto derecha"
};

const emptyByType = {
  news: { visible: true, date: "", category: "", title: "", summary: "", url: "" },
  events: { visible: true, date: "", title: "", place: "", summary: "", url: "" },
  popups: {
    id: "nuevo-popup",
    enabled: true,
    mode: "session",
    title: "Nuevo aviso",
    text: "Texto del aviso.",
    image: "assets/official/icffaa-icon.png",
    buttonText: "OK",
    autoCloseSeconds: 10
  }
};

const labels = {
  id: "ID",
  navLabel: "Texto en menu",
  type: "Tipo",
  visible: "Visible",
  band: "Fondo alternado",
  layout: "Layout",
  eyebrow: "Etiqueta",
  title: "Titulo",
  text: "Texto",
  image: "Imagen",
  buttonLabel: "Texto de boton",
  buttonUrl: "URL de boton",
  agendaEyebrow: "Etiqueta agenda",
  agendaTitle: "Titulo agenda",
  durationSeconds: "Duracion carrusel",
  label: "Etiqueta",
  url: "Enlace",
  caption: "Descripcion",
  source: "Fuente",
  date: "Fecha",
  category: "Categoria",
  summary: "Resumen",
  place: "Lugar",
  enabled: "Activo",
  mode: "Modo",
  buttonText: "Boton",
  autoCloseSeconds: "Cierre automatico"
};

function setStatus(message) {
  statusEl.textContent = message;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeContent(value) {
  return {
    ...clone(defaultContent),
    ...value,
    site: value.site || {},
    adminAccess: { ...defaultContent.adminAccess, ...(value.adminAccess || {}) },
    identityLogos: Array.isArray(value.identityLogos) ? value.identityLogos : [],
    sections: Array.isArray(value.sections) ? value.sections : [],
    news: Array.isArray(value.news) ? value.news : [],
    events: Array.isArray(value.events) ? value.events : [],
    popups: Array.isArray(value.popups) ? value.popups : []
  };
}

function syncJson() {
  content.updatedAt = new Date().toISOString().slice(0, 10);
  jsonEditor.value = JSON.stringify(content, null, 2);
}

function inputFor(value, options = {}) {
  let input;
  if (options.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = options.rows || 3;
  } else if (options.type === "select") {
    input = document.createElement("select");
    Object.entries(options.options || {}).forEach(([optionValue, label]) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = label;
      input.append(option);
    });
  } else {
    input = document.createElement("input");
    input.type = options.type || "text";
  }
  if (input.type === "checkbox") {
    input.checked = Boolean(value);
  } else {
    input.value = value ?? "";
  }
  return input;
}

function field(labelText, value, onChange, options = {}) {
  const label = document.createElement("label");
  if (options.className) label.className = options.className;
  label.append(document.createTextNode(labelText));
  const input = inputFor(value, options);
  input.addEventListener("input", () => {
    const nextValue = input.type === "checkbox" ? input.checked : input.value;
    onChange(options.type === "number" ? Number(nextValue) : nextValue);
    syncJson();
  });
  if (input.tagName === "SELECT" || input.type === "checkbox") {
    input.addEventListener("change", () => {
      const nextValue = input.type === "checkbox" ? input.checked : input.value;
      onChange(options.type === "number" ? Number(nextValue) : nextValue);
      syncJson();
    });
  }
  label.append(input);
  return label;
}

function renderSiteEditor() {
  siteEditor.innerHTML = "";
  siteFields.forEach(([key, labelText, type]) => {
    siteEditor.append(
      field(labelText, content.site[key], (value) => {
        content.site[key] = value;
      }, { type: type || "text", className: type === "textarea" ? "full" : "" })
    );
  });
}

function renderAccessEditor() {
  accessEditor.innerHTML = "";
  accessFields.forEach(([key, labelText, type]) => {
    accessEditor.append(
      field(labelText, content.adminAccess[key], (value) => {
        content.adminAccess[key] = value;
      }, { type: type || "text", className: type === "textarea" ? "full" : "" })
    );
  });
}

function sectionTemplate(type) {
  const id = `${type}-${Date.now().toString(36)}`;
  const base = {
    id,
    navLabel: sectionTypes[type],
    type,
    visible: true,
    band: false,
    layout: "",
    eyebrow: sectionTypes[type],
    title: "Nueva seccion",
    text: ""
  };
  if (type === "cards") {
    return {
      ...base,
      cards: [{ title: "Titulo", text: "Texto de la tarjeta." }],
      logoBlock: { enabled: false, image: "assets/official/undef-footer.png", title: "", text: "" }
    };
  }
  if (type === "programs") return { ...base, items: [{ label: "Tipo", title: "Programa", text: "Descripcion." }] };
  if (type === "media") return { ...base, layout: "image-left", image: "assets/official/icffaa-inauguracion.jpg", buttonLabel: "", buttonUrl: "" };
  if (type === "gallery") return { ...base, durationSeconds: 6, items: [{ title: "Imagen", caption: "Descripcion.", image: "assets/official/fmc-carrousel-icffaa.jpg", source: "Fuente" }] };
  if (type === "newsEvents") return { ...base, agendaEyebrow: "Agenda", agendaTitle: "Fechas proximas" };
  if (type === "split") return { ...base, layout: "text-left", items: [{ title: "Item", text: "Descripcion." }] };
  if (type === "links") return { ...base, band: true, items: [{ title: "Enlace", text: "Descripcion.", url: "https://", label: "Abrir enlace" }] };
  if (type === "contact") return { ...base, items: [{ label: "Correo", title: "contacto@institucion.mil.ar" }] };
  return { ...base, type: "notice", image: "assets/official/icffaa-icon.png", buttonLabel: "", buttonUrl: "" };
}

function sectionFields(section, card) {
  const grid = document.createElement("div");
  grid.className = "editor-fields";
  grid.append(
    field(labels.visible, section.visible !== false, (value) => { section.visible = value; }, { type: "checkbox" }),
    field(labels.id, section.id, (value) => { section.id = value.trim().replace(/\s+/g, "-"); }),
    field(labels.navLabel, section.navLabel, (value) => { section.navLabel = value; }),
    field(labels.type, section.type, (value) => {
      Object.assign(section, sectionTemplate(value), { id: section.id, navLabel: section.navLabel, visible: section.visible });
      renderAll();
    }, { type: "select", options: sectionTypes }),
    field(labels.layout, section.layout || "", (value) => { section.layout = value; }, { type: "select", options: layouts }),
    field(labels.band, Boolean(section.band), (value) => { section.band = value; }, { type: "checkbox" }),
    field(labels.eyebrow, section.eyebrow, (value) => { section.eyebrow = value; }),
    field(labels.title, section.title, (value) => { section.title = value; }),
    field(labels.text, section.text, (value) => { section.text = value; }, { type: "textarea", className: "full" })
  );

  if (["media", "notice"].includes(section.type)) {
    grid.append(
      field(labels.image, section.image, (value) => { section.image = value; }),
      field(labels.buttonLabel, section.buttonLabel, (value) => { section.buttonLabel = value; }),
      field(labels.buttonUrl, section.buttonUrl, (value) => { section.buttonUrl = value; })
    );
  }

  if (section.type === "gallery") {
    grid.append(field(labels.durationSeconds, section.durationSeconds || 6, (value) => { section.durationSeconds = value; }, { type: "number" }));
  }

  if (section.type === "newsEvents") {
    grid.append(
      field(labels.agendaEyebrow, section.agendaEyebrow, (value) => { section.agendaEyebrow = value; }),
      field(labels.agendaTitle, section.agendaTitle, (value) => { section.agendaTitle = value; })
    );
  }

  card.append(grid);
}

function nestedFieldsFor(section) {
  if (section.type === "cards") return { key: "cards", fields: ["title", "text", "image"], empty: { title: "Titulo", text: "Texto.", image: "" } };
  if (section.type === "programs") return { key: "items", fields: ["label", "title", "text"], empty: { label: "Tipo", title: "Titulo", text: "Descripcion." } };
  if (section.type === "gallery") return { key: "items", fields: ["title", "caption", "image", "source"], empty: { title: "Imagen", caption: "Descripcion.", image: "", source: "" } };
  if (section.type === "split") return { key: "items", fields: ["title", "text"], empty: { title: "Item", text: "Descripcion." } };
  if (section.type === "links") return { key: "items", fields: ["title", "text", "url", "label", "image"], empty: { title: "Enlace", text: "Descripcion.", url: "https://", label: "Abrir", image: "" } };
  if (section.type === "contact") return { key: "items", fields: ["label", "title"], empty: { label: "Dato", title: "Valor" } };
  return null;
}

function renderNestedList(section, card) {
  const config = nestedFieldsFor(section);
  if (!config) return;
  section[config.key] = Array.isArray(section[config.key]) ? section[config.key] : [];

  const wrap = document.createElement("div");
  wrap.className = "nested-list";
  wrap.innerHTML = `
    <div class="nested-heading">
      <strong>Contenido de la seccion</strong>
      <button class="button ghost compact" type="button">Agregar item</button>
    </div>
  `;
  const list = document.createElement("div");
  list.className = "editor-list compact-list";
  wrap.append(list);

  wrap.querySelector("button").addEventListener("click", () => {
    section[config.key].push(clone(config.empty));
    renderAll();
  });

  section[config.key].forEach((item, index) => {
    const itemCard = document.createElement("article");
    itemCard.className = "editor-card nested-card";
    itemCard.innerHTML = `
      <div class="editor-card-header">
        <strong>Item ${index + 1}</strong>
        <div class="mini-actions">
          <button type="button" data-up>Subir</button>
          <button type="button" data-down>Bajar</button>
          <button type="button" data-remove>Eliminar</button>
        </div>
      </div>
    `;
    const grid = document.createElement("div");
    grid.className = "editor-fields";
    config.fields.forEach((key) => {
      grid.append(field(labels[key] || key, item[key], (value) => { item[key] = value; }, { type: key === "text" || key === "caption" ? "textarea" : "text", className: key === "text" || key === "caption" ? "full" : "" }));
    });
    itemCard.append(grid);
    itemCard.querySelector("[data-up]").addEventListener("click", () => moveItem(section[config.key], index, -1));
    itemCard.querySelector("[data-down]").addEventListener("click", () => moveItem(section[config.key], index, 1));
    itemCard.querySelector("[data-remove]").addEventListener("click", () => {
      section[config.key].splice(index, 1);
      renderAll();
    });
    list.append(itemCard);
  });

  card.append(wrap);
}

function renderLogoBlock(section, card) {
  if (section.type !== "cards") return;
  section.logoBlock = section.logoBlock || { enabled: false, image: "", title: "", text: "" };
  const wrap = document.createElement("div");
  wrap.className = "nested-list";
  wrap.innerHTML = `<div class="nested-heading"><strong>Bloque institucional con logo</strong></div>`;
  const grid = document.createElement("div");
  grid.className = "editor-fields";
  grid.append(
    field("Mostrar bloque", section.logoBlock.enabled, (value) => { section.logoBlock.enabled = value; }, { type: "checkbox" }),
    field(labels.image, section.logoBlock.image, (value) => { section.logoBlock.image = value; }),
    field(labels.title, section.logoBlock.title, (value) => { section.logoBlock.title = value; }),
    field(labels.text, section.logoBlock.text, (value) => { section.logoBlock.text = value; }, { type: "textarea", className: "full" })
  );
  wrap.append(grid);
  card.append(wrap);
}

function moveItem(list, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
  renderAll();
}

function renderSectionsEditor() {
  sectionsEditor.innerHTML = "";
  content.sections.forEach((section, index) => {
    const card = document.createElement("article");
    card.className = "editor-card section-card";
    card.innerHTML = `
      <div class="editor-card-header">
        <div>
          <strong>${section.navLabel || section.title || section.id}</strong>
          <span class="type-pill">${sectionTypes[section.type] || section.type}</span>
        </div>
        <div class="mini-actions">
          <button type="button" data-up>Subir</button>
          <button type="button" data-down>Bajar</button>
          <button type="button" data-copy>Duplicar</button>
          <button type="button" data-remove>Eliminar</button>
        </div>
      </div>
    `;
    sectionFields(section, card);
    renderLogoBlock(section, card);
    renderNestedList(section, card);
    card.querySelector("[data-up]").addEventListener("click", () => moveItem(content.sections, index, -1));
    card.querySelector("[data-down]").addEventListener("click", () => moveItem(content.sections, index, 1));
    card.querySelector("[data-copy]").addEventListener("click", () => {
      const copy = clone(section);
      copy.id = `${copy.id}-copia`;
      copy.navLabel = `${copy.navLabel || copy.title} copia`;
      content.sections.splice(index + 1, 0, copy);
      renderAll();
    });
    card.querySelector("[data-remove]").addEventListener("click", () => {
      content.sections.splice(index, 1);
      renderAll();
    });
    sectionsEditor.append(card);
  });
}

function renderFlatList(type, container, fieldNames) {
  container.innerHTML = "";
  content[type].forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "editor-card";
    card.innerHTML = `
      <div class="editor-card-header">
        <strong>${labelsForType(type)} ${index + 1}</strong>
        <div class="mini-actions">
          <button type="button" data-up>Subir</button>
          <button type="button" data-down>Bajar</button>
          <button type="button" data-remove>Eliminar</button>
        </div>
      </div>
    `;
    const grid = document.createElement("div");
    grid.className = "editor-fields";
    fieldNames.forEach((key) => {
      const options = {};
      if (["summary", "text"].includes(key)) {
        options.type = "textarea";
        options.className = "full";
      }
      if (["visible", "enabled"].includes(key)) options.type = "checkbox";
      if (key === "autoCloseSeconds") options.type = "number";
      if (key === "mode") {
        options.type = "select";
        options.options = { session: "Una vez por sesion", once: "Una vez por dispositivo", always: "Siempre" };
      }
      grid.append(field(labels[key] || key, item[key], (value) => { item[key] = value; }, options));
    });
    card.append(grid);
    card.querySelector("[data-up]").addEventListener("click", () => moveItem(content[type], index, -1));
    card.querySelector("[data-down]").addEventListener("click", () => moveItem(content[type], index, 1));
    card.querySelector("[data-remove]").addEventListener("click", () => {
      content[type].splice(index, 1);
      renderAll();
    });
    container.append(card);
  });
}

function labelsForType(type) {
  return { news: "Noticia", events: "Evento", popups: "Popup" }[type] || "Item";
}

function renderAll() {
  renderSiteEditor();
  renderAccessEditor();
  renderSectionsEditor();
  renderFlatList("news", newsEditor, ["visible", "date", "category", "title", "summary", "url"]);
  renderFlatList("events", eventsEditor, ["visible", "date", "title", "place", "summary", "url"]);
  renderFlatList("popups", popupsEditor, ["enabled", "id", "mode", "title", "text", "image", "buttonText", "autoCloseSeconds"]);
  syncJson();
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hashBuffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getGithubConfig() {
  const owner = document.querySelector("#owner").value.trim();
  const repo = document.querySelector("#repo").value.trim();
  const branch = document.querySelector("#branch").value.trim() || "main";
  const path = document.querySelector("#path").value.trim() || "data/content.json";
  const token = document.querySelector("#token").value.trim();
  if (!owner || !repo || !token) throw new Error("Complete usuario, repositorio y token.");
  return { owner, repo, branch, path, token };
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function githubApi(config, method, path, body, withRef = true) {
  const ref = withRef && method === "GET" ? `?ref=${encodeURIComponent(config.branch)}` : "";
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodePath(path)}${ref}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub respondio ${response.status}: ${text}`);
  }
  return response.json();
}

function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value) {
  return decodeURIComponent(escape(atob(value.replace(/\n/g, ""))));
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-panel").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("active");
  });
});

document.querySelector("#addSection").addEventListener("click", () => {
  const type = document.querySelector("#newSectionType").value;
  content.sections.push(sectionTemplate(type));
  renderAll();
});

document.querySelector("#hashPassword").addEventListener("click", async () => {
  const input = document.querySelector("#plainAdminPassword");
  if (!input.value) {
    setStatus("Ingrese una contrasena para generar el hash.");
    return;
  }
  content.adminAccess.passwordHash = await sha256(input.value);
  input.value = "";
  renderAll();
  setStatus("Hash de contrasena actualizado.");
});

document.querySelectorAll("[data-add-list]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.addList;
    content[type].push(clone(emptyByType[type]));
    renderAll();
  });
});

document.querySelector("#applyJson").addEventListener("click", () => {
  try {
    content = normalizeContent(JSON.parse(jsonEditor.value));
    renderAll();
    setStatus("JSON aplicado correctamente.");
  } catch (error) {
    setStatus(`No se pudo aplicar el JSON: ${error.message}`);
  }
});

document.querySelector("#loadLocal").addEventListener("click", async () => {
  try {
    const response = await fetch("data/content.json", { cache: "no-store" });
    content = normalizeContent(await response.json());
    githubSha = null;
    renderAll();
    setStatus("Contenido local cargado.");
  } catch {
    setStatus("No se pudo cargar localmente. Si esta abierto como archivo, use GitHub o pegue el JSON.");
  }
});

document.querySelector("#loadGithub").addEventListener("click", async () => {
  try {
    const config = getGithubConfig();
    const data = await githubApi(config, "GET", config.path);
    githubSha = data.sha;
    content = normalizeContent(JSON.parse(decodeBase64(data.content)));
    renderAll();
    setStatus("Contenido cargado desde GitHub.");
  } catch (error) {
    setStatus(error.message);
  }
});

document.querySelector("#saveGithub").addEventListener("click", async () => {
  try {
    const config = getGithubConfig();
    if (!githubSha) {
      const existing = await githubApi(config, "GET", config.path);
      githubSha = existing.sha;
    }
    syncJson();
    const body = {
      message: `Actualiza contenidos institucionales ${content.updatedAt}`,
      content: encodeBase64(jsonEditor.value),
      sha: githubSha,
      branch: config.branch
    };
    const result = await githubApi(config, "PUT", config.path, body, false);
    githubSha = result.content.sha;
    setStatus("Cambios guardados en GitHub. GitHub Pages se actualizara en unos minutos.");
  } catch (error) {
    setStatus(error.message);
  }
});

document.querySelector("#downloadJson").addEventListener("click", () => {
  syncJson();
  const blob = new Blob([jsonEditor.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#copyJson").addEventListener("click", async () => {
  syncJson();
  await navigator.clipboard.writeText(jsonEditor.value);
  setStatus("JSON copiado al portapapeles.");
});

document.querySelector("#imageFile").addEventListener("change", () => {
  const file = document.querySelector("#imageFile").files[0];
  if (!file) return;
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  document.querySelector("#imageName").value = safeName;
  document.querySelector("#imagePath").value = `assets/uploads/${safeName}`;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    selectedImage = { file, dataUrl: reader.result, base64: String(reader.result).split(",")[1] };
    document.querySelector("#imagePreview").innerHTML = `<img src="${reader.result}" alt="Vista previa"><p>${file.name} - ${Math.round(file.size / 1024)} KB</p>`;
  });
  reader.readAsDataURL(file);
});

document.querySelector("#imageName").addEventListener("input", () => {
  const name = document.querySelector("#imageName").value.trim();
  if (name) document.querySelector("#imagePath").value = `assets/uploads/${name}`;
});

document.querySelector("#copyImagePath").addEventListener("click", async () => {
  await navigator.clipboard.writeText(document.querySelector("#imagePath").value.trim());
  setStatus("Ruta copiada.");
});

document.querySelector("#addImageToGallery").addEventListener("click", () => {
  if (!selectedImage) {
    setStatus("Seleccione una imagen primero.");
    return;
  }
  let gallery = content.sections.find((section) => section.type === "gallery");
  if (!gallery) {
    gallery = sectionTemplate("gallery");
    content.sections.push(gallery);
  }
  gallery.items = Array.isArray(gallery.items) ? gallery.items : [];
  gallery.items.push({
    title: document.querySelector("#imageName").value || selectedImage.file.name,
    caption: "Imagen cargada desde administracion.",
    image: selectedImage.dataUrl,
    source: "Administracion"
  });
  renderAll();
  setStatus("Imagen agregada a la galeria como base64.");
});

document.querySelector("#uploadImageGithub").addEventListener("click", async () => {
  try {
    if (!selectedImage) throw new Error("Seleccione una imagen primero.");
    const config = getGithubConfig();
    const imagePath = document.querySelector("#imagePath").value.trim();
    if (!imagePath) throw new Error("Indique una ruta destino.");
    let sha;
    try {
      const existing = await githubApi(config, "GET", imagePath);
      sha = existing.sha;
    } catch {
      sha = undefined;
    }
    const body = {
      message: `Sube imagen ${imagePath}`,
      content: selectedImage.base64,
      branch: config.branch,
      sha
    };
    await githubApi(config, "PUT", imagePath, body, false);
    await navigator.clipboard.writeText(imagePath);
    setStatus(`Imagen subida y ruta copiada: ${imagePath}`);
  } catch (error) {
    setStatus(error.message);
  }
});

fetch("data/content.json", { cache: "no-store" })
  .then((response) => response.json())
  .then((data) => {
    content = normalizeContent(data);
    renderAll();
  })
  .catch(() => renderAll());

const ICONS = {
  shield: `<svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 12-4.5-2.5-8-7-8-12V6z"></path></svg>`,
  cloud: `<svg viewBox="0 0 24 24"><path d="M6 18h11a4 4 0 0 0 0-8 5 5 0 0 0-9.7-1A4 4 0 0 0 6 18z"></path></svg>`,
  printer: `<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6"></path><rect x="6" y="14" width="12" height="7"></rect><rect x="4" y="9" width="16" height="5"></rect></svg>`,
  key: `<svg viewBox="0 0 24 24"><circle cx="7" cy="15" r="3"></circle><path d="M10 15h11l-2-2 2-2"></path></svg>`,
  camera: `<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
  notes: `<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"></rect><line x1="8" y1="7" x2="16" y2="7"></line><line x1="8" y1="11" x2="16" y2="11"></line><line x1="8" y1="15" x2="13" y2="15"></line></svg>`,
  energy: `<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 10 10 13 2"></polygon></svg>`,
  cable: `<svg viewBox="0 0 24 24"><path d="M8 8v6a4 4 0 0 0 4 4h4"></path><path d="M5 5h3v3H5z"></path><path d="M16 15h3v4h-3z"></path></svg>`,
  device: `<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"></rect><line x1="11" y1="18" x2="13" y2="18"></line></svg>`,
  network: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6" rx="1"></rect><rect x="15" y="3" width="6" height="6" rx="1"></rect><rect x="9" y="15" width="6" height="6" rx="1"></rect><path d="M9 6h6"></path><path d="M12 9v6"></path></svg>`
};

const ENTRY_META = {
  shield: { label: "Access", visual: "shield" },
  key: { label: "Identity", visual: "identity" },
  cloud: { label: "Hosting", visual: "cloud" },
  printer: { label: "Print", visual: "print" },
  camera: { label: "Media", visual: "media" },
  clock: { label: "Utility", visual: "time" },
  notes: { label: "Workspace", visual: "workspace" },
  energy: { label: "Monitoring", visual: "energy" },
  cable: { label: "Infrastructure", visual: "infrastructure" },
  device: { label: "Apps", visual: "app" },
  network: { label: "Deployment", visual: "network" }
};

const KIND_META = {
  portal: {
    label: "Platform",
    tag: "portals"
  },
  app: {
    label: "App",
    tag: "apps"
  }
};

const TAG_LABELS = {
  access: "Access",
  ai: "AI",
  "app-store": "App Store",
  apps: "Apps",
  campus: "Campus",
  chatbot: "Chatbot",
  code: "Code",
  files: "Files",
  hosting: "Hosting",
  identity: "Identity",
  media: "Media",
  monitoring: "Monitoring",
  notes: "Notes",
  photos: "Photos",
  portals: "Portals",
  print: "Print",
  safety: "Safety",
  security: "Security",
  sync: "Sync",
  "self-hosted": "Self-Hosted",
  time: "Time",
  utility: "Utility",
  workspace: "Workspace"
};

const DIRECTORY_FILTERS = [
  { value: "portals", label: "Platforms" },
  { value: "apps", label: "Apps" }
];

const FEATURED_ENTRY_IDS = new Set([
  "bengpt",
  "georgie-ai",
  "guardian-campus-safety"
]);

const directoryState = {
  query: "",
  filter: "all"
};

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("grid-directory")) {
    return;
  }

  setupDirectoryControls();
  loadDirectory();
});

async function loadDirectory() {
  setDirectoryBusy(true);

  try {
    const response = await fetch("/assets/data/directory.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("directory-data");
    }

    const data = await response.json();
    const websites = Array.isArray(data.websites) ? data.websites : [];
    const apps = Array.isArray(data.apps) ? data.apps : [];
    const entries = [
      ...websites.map(entry => normalizeDirectoryEntry(entry, "portal")),
      ...apps.map(entry => normalizeDirectoryEntry(entry, "app"))
    ];

    renderTagFilters(entries);
    renderDirectory(entries);
    applyDirectoryFilters();
    refreshMotion();
  } catch (error) {
    renderTagFilters([]);
    renderDirectory([]);
    applyDirectoryFilters();
    refreshMotion();
  } finally {
    setDirectoryBusy(false);
  }
}

function setupDirectoryControls() {
  const search = document.getElementById("directory-search");
  const tagRoot = document.getElementById("directory-tags");

  if (search) {
    search.addEventListener("input", event => {
      directoryState.query = String(event.target.value || "").trim().toLowerCase();
      applyDirectoryFilters();
    });

    search.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !search.value) {
        return;
      }

      search.value = "";
      directoryState.query = "";
      applyDirectoryFilters();
    });
  }

  if (tagRoot) {
    tagRoot.addEventListener("click", event => {
      const button = event.target.closest("[data-directory-filter]");
      if (!button) {
        return;
      }

      directoryState.filter = button.dataset.directoryFilter || "all";

      tagRoot.querySelectorAll("[data-directory-filter]").forEach(node => {
        const isActive = node === button;
        node.classList.toggle("is-active", isActive);
        node.setAttribute("aria-pressed", String(isActive));
      });

      applyDirectoryFilters();
    });
  }
}

function renderTagFilters(entries) {
  const root = document.getElementById("directory-tags");
  if (!root) {
    return;
  }

  const availableTags = new Set(entries.flatMap(entry => entry.tags));
  const filters = DIRECTORY_FILTERS.filter(filter => availableTags.has(filter.value));

  root.innerHTML = [
    renderFilterButton("all", "All", directoryState.filter === "all"),
    ...filters.map(filter => (
      renderFilterButton(filter.value, filter.label, directoryState.filter === filter.value)
    ))
  ].join("");
}

function renderFilterButton(value, label, isActive) {
  return `
    <button
      class="filter-pill${isActive ? " is-active" : ""}"
      type="button"
      data-directory-filter="${escapeAttribute(value)}"
      aria-pressed="${String(isActive)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function renderDirectory(entries) {
  const root = document.getElementById("grid-directory");

  if (!root) {
    return;
  }

  if (entries.length === 0) {
    root.innerHTML = `
      <article class="state-card directory-error" role="alert">
        <p class="eyebrow panel-label">Unavailable</p>
        <h3>Directory unavailable</h3>
        <p>The work directory could not be loaded right now.</p>
        <a class="text-link" href="mailto:info@adovasio.com">Contact Adovasio</a>
      </article>
    `;
    return;
  }

  root.innerHTML = entries
    .map((entry, index) => renderDirectoryCard(entry, index))
    .join("");
}

function renderDirectoryCard(entry, index) {
  const entryMeta = resolveEntryMeta(entry);
  const icon = resolveIcon(entry.icon);
  const url = normalizeUrl(entry.url);
  const href = escapeAttribute(url);
  const footer = resolveFooter(entry);
  const action = resolveAction(entry);
  const searchText = buildSearchText(entry, entryMeta);
  const featuredTag = entry.tags.find(tag => tag !== entry.kindTag) || entry.kindTag;
  const isFeatured = FEATURED_ENTRY_IDS.has(entry.id);
  const externalNote = isExternalUrl(url)
    ? '<span class="sr-only"> (opens in a new tab)</span>'
    : "";
  const cardNumber = String(index + 1).padStart(2, "0");

  return `
    <a
      class="work-card directory-card work-card--${entry.kind} work-card--${entryMeta.visual}${isFeatured ? " work-card--featured" : ""}"
      href="${href}"
      ${buildLinkAttributes(url)}
      data-directory-card
      data-entry-id="${escapeAttribute(entry.id || "")}"
      data-tags="${escapeAttribute(entry.tags.join("|"))}"
      data-search="${escapeAttribute(searchText)}"
      data-reveal
      style="--work-index: ${index}"
    >
      <div class="work-card-visual card-visual" aria-hidden="true">
        <span class="work-card-grid"></span>
        <span class="work-card-orbit"></span>
        <span class="card-icon work-card-icon">
          ${icon}
        </span>
        <span class="work-card-number">${cardNumber}</span>
      </div>

      <div class="work-card-content">
        <div class="card-top">
          <span class="card-kind">${escapeHtml(entry.kindLabel)}</span>
          <span class="card-tag">${escapeHtml(entry.label || getTagLabel(featuredTag) || entryMeta.label)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(entry.name)}</h3>
          <p>${escapeHtml(entry.desc || "")}</p>
        </div>
        <div class="card-footer">
          <span class="card-destination">${escapeHtml(footer)}</span>
          <strong class="card-action">
            <span>${escapeHtml(action)}${externalNote}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
              <path d="M5 15 15 5M7 5h8v8"></path>
            </svg>
          </strong>
        </div>
      </div>
    </a>
  `;
}

function applyDirectoryFilters() {
  const root = document.getElementById("grid-directory");
  const cards = root
    ? Array.from(root.querySelectorAll("[data-directory-card]"))
    : [];
  const emptyState = document.getElementById("directory-empty");
  let visibleCount = 0;

  cards.forEach(card => {
    const tags = String(card.dataset.tags || "").split("|").filter(Boolean);
    const matchesFilter = directoryState.filter === "all" || tags.includes(directoryState.filter);
    const haystack = String(card.dataset.search || "");
    const matchesQuery =
      directoryState.query.length === 0 || haystack.includes(directoryState.query);
    const visible = matchesFilter && matchesQuery;

    card.hidden = !visible;

    if (visible) {
      visibleCount += 1;
    }
  });

  if (emptyState) {
    emptyState.hidden = cards.length === 0 || visibleCount > 0;
  }

  setText("[data-results-count]", visibleCount);
  setText("[data-results-label]", visibleCount === 1 ? "entry shown" : "entries shown");
  announceResults(visibleCount);
}

function normalizeDirectoryEntry(entry, kind) {
  const kindMeta = KIND_META[kind] || KIND_META.portal;
  const source = entry && typeof entry === "object" ? entry : {};
  const tags = normalizeTags([
    kindMeta.tag,
    ...(Array.isArray(source.tags) ? source.tags : [])
  ]);

  return {
    ...source,
    kind,
    kindLabel: kindMeta.label,
    kindTag: kindMeta.tag,
    tags
  };
}

function normalizeTags(tags) {
  return Array.from(
    new Set(
      tags
        .map(tag => String(tag || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function buildSearchText(entry, meta) {
  return [
    entry.kindLabel,
    entry.name,
    entry.desc,
    entry.label,
    meta.label,
    entry.footer,
    entry.url,
    resolveFooter(entry),
    ...entry.tags.map(getTagLabel)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function resolveEntryMeta(entry) {
  return ENTRY_META[entry.icon] || ENTRY_META.cloud;
}

function getTagLabel(tag) {
  return TAG_LABELS[tag] || String(tag).replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

function resolveIcon(iconName) {
  const icon = ICONS[iconName] || ICONS.cloud;
  return icon.replace("<svg ", '<svg aria-hidden="true" focusable="false" ');
}

function resolveFooter(entry) {
  if (entry.footer) {
    return entry.footer;
  }

  if (entry.url) {
    return formatHost(entry.url);
  }

  return "Adovasio entry";
}

function resolveAction(entry) {
  if (entry.action) {
    return entry.action;
  }

  return isExternalUrl(entry.url) ? "Open" : "Learn more";
}

function buildLinkAttributes(url) {
  return isExternalUrl(url) ? 'target="_blank" rel="noopener noreferrer"' : "";
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(String(url));
}

function normalizeUrl(value) {
  const url = String(value || "").trim();

  if (/^https?:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }

  return "#";
}

function formatHost(value) {
  try {
    return new URL(value).host;
  } catch (error) {
    return String(value).replace(/^https?:\/\//, "");
  }
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(node => {
    node.textContent = String(value);
  });
}

function setDirectoryBusy(isBusy) {
  const root = document.getElementById("grid-directory");

  if (root) {
    root.setAttribute("aria-busy", String(isBusy));
  }
}

function announceResults(count) {
  const status = document.getElementById("directory-status");

  if (!status) {
    return;
  }

  const noun = count === 1 ? "entry" : "entries";
  const filter = directoryState.filter === "all"
    ? ""
    : ` in ${getTagLabel(directoryState.filter)}`;
  const query = directoryState.query
    ? ` matching “${directoryState.query}”`
    : "";

  status.textContent = `${count} ${noun}${filter}${query}.`;
}

function refreshMotion() {
  window.AdovasioMotion?.refresh?.(document.body);

  const root = document.getElementById("grid-directory");
  const elements = root
    ? Array.from(root.querySelectorAll("[data-reveal]:not(.is-visible)"))
    : [];

  if (!elements.length) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.04
    }
  );

  elements.forEach(element => observer.observe(element));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
